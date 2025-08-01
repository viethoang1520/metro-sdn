const Ticket = require("../models/Ticket");
const Station = require("../models/Station");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const ticketTypes = {
  "1day": { name: "Vé ngày", price: 40000 },
  "3days": { name: "Vé 3 ngày", price: 90000 },
  "1month": { name: "Vé tháng", price: 300000 },
};

const purchaseTicketsByType = async (req, res) => {
  try {
    const { tickets, userId, confirm } = req.body;
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
    let originPrice = 0; 
    let discount = 0;
    let discountMsg = "";
    let isFreeForChild = false;

    if (
      user &&
      user.passenger_categories &&
      user.passenger_categories.passenger_type &&
      user.passenger_categories.passenger_type === "CHILD"
    ) {
      isFreeForChild = true;
      discountMsg = " (free for children under 6)";
    } else if (
      user &&
      user.passenger_categories &&
      user.passenger_categories.discount &&
      user.passenger_categories.status == "APPROVED"
    ) {
      discount = user.passenger_categories.discount;
      discountMsg = ` (discount ${discount}% applied for monthly tickets)`;
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
      const originalPrice = ticketTypes[type].price;

      originPrice += originalPrice * quantity;

      if (isFreeForChild) {
        price = 0;
      } else if (discount && type === "1month") {
        price = price * (1 - discount / 100);
      }

      const ticketsToCreate = Array.from({ length: quantity }).map(() => ({
        ticket_type: {
          name: ticketTypes[type].name,
          base_price: ticketTypes[type].price,
          expiry_date: null,
        },
        status: "ACTIVE",
        created_at: new Date(),
        discount:
          (isFreeForChild
            ? 100
            : discount && type === "1month"
            ? discount
            : 0) || undefined,
        price: price,
      }));

      allTicketsToCreate = allTicketsToCreate.concat(ticketsToCreate);
      totalAmount += price * quantity;
    }

    const createdTickets = await Ticket.insertMany(allTicketsToCreate);
    const ticketIds = createdTickets.map((t) => t._id);
    
    let transactionStatus = "PENDING";
    if (confirm === true && Math.round(totalAmount) === 0) {
      transactionStatus = "PAID";
    } else if (confirm === false) {
      transactionStatus = "PENDING";
    }

    const newTransaction = new Transaction({
      user_id: userId,
      ticket_id: ticketIds,
      total_price: Math.round(totalAmount),
      method: "online",
      status: transactionStatus,
    });
    const savedTransaction = await newTransaction.save();

    await Ticket.updateMany(
      { _id: { $in: ticketIds } },
      { transaction_id: savedTransaction._id }
    );

    const ticketsSummary = tickets.map(({ type, quantity }) => {
      let finalPrice = ticketTypes[type]?.price || 0;

      if (isFreeForChild) {
        finalPrice = 0;
      } else if (discount && type === "1month") {
        finalPrice = finalPrice * (1 - discount / 100);
      }

      return {
        name: ticketTypes[type]?.name || type,
        original_price: ticketTypes[type]?.price || 0,
        price: finalPrice,
        quantity,
      };
    });

    return res.status(201).json({
      error: false,
      message: `Ticket purchase successful${discountMsg}`,
      data: {
        transaction: savedTransaction,
        tickets: ticketsSummary,
        origin_price: Math.round(originPrice),
        discount: isFreeForChild ? 100 : discount || 0,
        is_free_for_child: isFreeForChild,
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
    const { routes, userId, confirm } = req.body;
    const user = await User.findById(userId);
    let ticketsToCreate = [];
    let totalAmount = 0;
    let originPrice = 0; 
    let ticketDetails = [];
    let isFreeForChild = false;

    if (!Array.isArray(routes) || routes.length === 0) {
      return res.status(400).json({
        errorCode: 1,
        message: "Please provide a list of routes to purchase tickets",
        data: null,
      });
    }

    if (
      user &&
      user.passenger_categories &&
      user.passenger_categories.passenger_type &&
      user.passenger_categories.passenger_type === "CHILD"
    ) {
      isFreeForChild = true;
    } else if (
      user &&
      user.passenger_categories &&
      user.passenger_categories.discount &&
      user.passenger_categories.status == "APPROVED"
    ) {
      discount = user.passenger_categories.discount;
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
      let original_route_price = 0;

      if (Math.abs(start_distance - end_distance) <= 7) {
        route_price = 7000;
        original_route_price = 7000;
      } else {
        route_price = Math.abs(start_distance - end_distance) * 1000;
        original_route_price = Math.abs(start_distance - end_distance) * 1000;
      }

      const qty = quantity;
      originPrice += original_route_price * qty;

      if (isFreeForChild) {
        route_price = 0;
      }
      
      for (let i = 0; i < qty; i++) {
        ticketsToCreate.push({
          ticket_type: null,
          start_station_id,
          end_station_id,
          route_price,
          status: "ACTIVE",
          created_at: new Date(),
          discount: isFreeForChild ? 100 : 0,
          price: route_price,
        });
      }

      ticketDetails.push({
        start_station_name: start_station.name,
        end_station_name: end_station.name,
        original_price: original_route_price,
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
    let transactionStatus = "PENDING";
    if (confirm === true && Math.round(totalAmount) === 0) {
      transactionStatus = "PAID";
    } else if (confirm === false) {
      transactionStatus = "PENDING";
    }

    const newTransaction = new Transaction({
      user_id: userId,
      ticket_id: ticketIds,
      total_price: Math.round(totalAmount),
      method: "online",
      status: transactionStatus,
    });
    const savedTransaction = await newTransaction.save();

    await Ticket.updateMany(
      { _id: { $in: ticketIds } },
      { transaction_id: savedTransaction._id }
    );

    const replacedTicket = ticketDetails.map((item) => ({
      name: `${item.start_station_name.replace(
        /^Ga /,
        ""
      )} - ${item.end_station_name.replace(/^Ga /, "")}`,
      original_price: item.original_price,
      price: item.price,
      quantity: item.quantity,
    }));

    let message = "Route ticket purchase successful";
    if (isFreeForChild) {
      message += " (free for children under 6)";
    }

    return res.status(201).json({
      errorCode: 0,
      message: message,
      data: {
        transaction: savedTransaction,
        tickets: replacedTicket,
        origin_price: Math.round(originPrice),
        discount: isFreeForChild ? 100 : 0,
        is_free_for_child: isFreeForChild,
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