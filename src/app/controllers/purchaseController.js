const Ticket = require("../models/Ticket");
const Station = require("../models/Station");
const User = require("../models/User");
const PassengerCategory = require("../models/PassengerCategory");
const Transaction = require("../models/Transaction");

const ticketTypes = {
  "1day": { name: "Vé ngày", price: 40000 },
  "3days": { name: "Vé 3 ngày", price: 90000 },
  "1month": { name: "Vé tháng", price: 300000 },
};

const purchaseTicketsByType = async (req, res) => {
  try {
    const { tickets, userId } = req.body;
    if (!Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({
        error: true,
        message: "Invalid tickets input",
        data: null,
      });
    }
    const user = await User.findById(userId);
    let allTicketsToCreate = [];
    let totalAmount = 0;
    let discount = 0;
    let discountMsg = "";
    if (
      user &&
      user.passenger_categories &&
      user.passenger_categories.discount
    ) {
      discount = user.passenger_categories.discount;
      discountMsg = ` (discount ${discount}% applied)`;
    }
    for (const ticket of tickets) {
      const { type, quantity } = ticket;
      if (
        !type ||
        !ticketTypes[type] ||
        !quantity ||
        isNaN(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          error: true,
          message: `Invalid ticket type or quantity for type: ${type}`,
          data: null,
        });
      }
      let price = ticketTypes[type].price;
      if (discount) price = price * (1 - discount / 100);
      const ticketsToCreate = Array.from({ length: quantity }).map(() => ({
        ticket_type: {
          name: ticketTypes[type].name,
          base_price: price,
        },
        status: "active",
        created_at: new Date(),
        discount: discount || undefined,
        price: price,
      }));
      allTicketsToCreate = allTicketsToCreate.concat(ticketsToCreate);
      totalAmount += price * quantity;
    }
    const createdTickets = await Ticket.insertMany(allTicketsToCreate);
    const ticketIds = createdTickets.map((t) => t._id);
    const newTransaction = new Transaction({
      user_id: userId,
      ticket_id: ticketIds,
      total_price: totalAmount,
      method: "online",
      status: "PENDING",
    });
    const savedTransaction = await newTransaction.save();

    await Ticket.updateMany(
      { _id: { $in: ticketIds } },
      { transaction_id: savedTransaction._id }
    );

    return res.status(201).json({
      error: false,
      message: `Ticket purchase successful${discountMsg}`,
      data: {
        transaction: savedTransaction,
        tickets: createdTickets,
        discount: discount || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message || "An error occurred while purchasing tickets",
      data: null,
    });
  }
};

const purchaseTicketByRoute = async (req, res) => {
  try {
    const { routes, userId, start_station_id, end_station_id, quantity } = req.body;
    const user = await User.findById(userId);
    let ticketsToCreate = [];
    let totalAmount = 0;
    let discount = 0;
    let ticketDetails = [];

    if (!Array.isArray(routes) || routes.length === 0) {
      return res.status(400).json({
        errorCode: 1,
        message: "Please provide a list of routes to purchase tickets",
        data: null,
      });
    }

    for (const route of routes) {
      const { start_station_id, end_station_id, quantity } = route;
      if (!start_station_id || !end_station_id) continue;
      const start_station = await Station.findById(start_station_id);
      const end_station = await Station.findById(end_station_id);
      if (!start_station || !end_station) continue;
      const start_distance = start_station.distance;
      const end_distance = end_station.distance;
      let route_price = 0;
      if (Math.abs(start_distance - end_distance) <= 7) {
        route_price = 7000;
      } else {
        route_price = Math.abs(start_distance - end_distance) * 1000;
      }
      if (
        user &&
        user.passenger_categories &&
        user.passenger_categories.discount
      ) {
        discount = user.passenger_categories.discount;
        route_price = route_price * (1 - discount / 100);
      }
      const qty = quantity;
      for (let i = 0; i < qty; i++) {
        ticketsToCreate.push({
          ticket_type: null,
          start_station_id,
          end_station_id,
          route_price,
          status: "active",
          created_at: new Date(),
          discount: discount || 0,
          price: route_price,
        });
      }
      ticketDetails.push({
        start_station_name: start_station.name,
        end_station_name: end_station.name,
        distance_difference: Math.abs(start_distance - end_distance),
        start_station_distance: start_station.distance,
        end_station_distance: end_station.distance,
        price: route_price,
        quantity: qty,
      });
      totalAmount += route_price * qty;
    }

    if (ticketsToCreate.length === 0) {
      return res.status(400).json({
        errorCode: 1,
        message: "No valid route to create ticket",
        data: null,
      });
    }
    const createdTickets = await Ticket.insertMany(ticketsToCreate);
    const ticketIds = createdTickets.map((t) => t._id);
    const newTransaction = new Transaction({
      user_id: userId,
      ticket_id: ticketIds,
      total_price: totalAmount,
      method: "online",
      status: "PENDING",
    });
    const savedTransaction = await newTransaction.save();
    await Ticket.updateMany(
      { _id: { $in: ticketIds } },
      { transaction_id: savedTransaction._id }
    );
    return res.status(201).json({
      errorCode: 0,
      message: discount
        ? `Route ticket purchase successful (discount ${discount}% applied)`
        : "Route ticket purchase successful",
      data: {
        transaction: savedTransaction,
        tickets: createdTickets,
        ticketDetails,
        discount: discount || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      errorCode: 1,
      message:
        error.message || "An error occurred while purchasing route tickets",
      data: null,
    });
  }
};

module.exports = {
  purchaseTicketsByType,
  purchaseTicketByRoute,
};
