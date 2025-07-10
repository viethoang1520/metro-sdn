const httpStatus = require("http-status");
const Ticket = require("../models/Ticket");
const Transaction = require("../models/Transaction");
const Station = require("../models/Station");
const ErrorCode = {
  OK: "SUCCESS",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  TICKET_NOT_FOUND: "TICKET_NOT_FOUND",
  DUPLICATE_TICKET_ID: "DUPLICATE_TICKET_ID",
  INVALID_TICKET_TYPE: "INVALID_TICKET_TYPE",
  INVALID_TICKET_ID: "INVALID_TICKET_ID",
  TICKET_TYPE_NOT_FOUND: "TICKET_TYPE_NOT_FOUND",
  STATION_NOT_FOUND: "STATION_NOT_FOUND",
  TRANSACTION_NOT_FOUND: "TRANSACTION_NOT_FOUND",
};
const getAllTickets = async () => {
  try {
    const tickets = await Ticket.findAndCountAll({
      order: [["created_at", "DESC"]],
    });
    res.status(200).json({
      httpStatus: httpStatus.OK,
      errorCode: ErrorCode.OK,
      totalItems: tickets.length,
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({
      httpStatus: httpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};
const getTicketById = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        httpStatus: httpStatus.NOT_FOUND,
        errorCode: ErrorCode.TICKET_NOT_FOUND,
        message: "Ticket not found",
      });
    }
    res.status(200).json({
      httpStatus: httpStatus.OK,
      errorCode: ErrorCode.OK,
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      httpStatus: httpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};

const getAllTicketsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        httpStatus: httpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
        message: "User ID is required",
      });
    }
    const transactions = await Transaction.find({
      user_id: userId,
      status: "PAID",
    })
      .select("ticket_id createdAt")
      .sort({ createdAt: -1 });
    const ticketIds = transactions.flatMap((tran) => tran.ticket_id);

    const tickets = await Ticket.find({ _id: { $in: ticketIds } });
    const ticketMap = new Map();
    tickets.forEach((ticket) => ticketMap.set(ticket._id.toString(), ticket));
    const orderedTickets = ticketIds
      .map((id) => ticketMap.get(id.toString()))
      .filter(Boolean);

    const stationIds = orderedTickets
      .flatMap((ticket) => [ticket.start_station_id, ticket.end_station_id])
      .filter((id) => id);

    const stations = await Station.find({ _id: { $in: stationIds } });

    const stationMap = new Map();
    stations.forEach((station) => {
      stationMap.set(station._id.toString(), station.name);
    });

    const enrichedTickets = orderedTickets.map((ticket) => {
      let ticketCategory = "";
      if (ticket.ticket_type && ticket.ticket_type.name) {
        ticketCategory = "Vé theo loại";
      } else {
        ticketCategory = "Vé theo tuyến";
      }
      return {
        ...ticket._doc,
        start_station_name: ticket.start_station_id
          ? stationMap.get(ticket.start_station_id.toString())
          : null,
        end_station_name: ticket.end_station_id
          ? stationMap.get(ticket.end_station_id.toString())
          : null,
        ticket_category: ticketCategory,
      };
    });
    res.status(200).json({
      httpStatus: httpStatus.OK,
      errorCode: ErrorCode.OK,
      totalItems: enrichedTickets.length,
      data: enrichedTickets,
    });
  } catch (error) {
    res.status(500).json({
      httpStatus: httpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};

const getActiveTicketsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    if (!userId) {
      return res.status(400).json({
        httpStatus: httpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
        message: "User ID is required",
      });
    }
    const now = new Date();
    const transactions = await Transaction.find({
      user_id: userId,
      status: "PAID",
    }).select("_id");
    console.log(transactions);
    const transactionIds = transactions.map((tran) => tran._id);

    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tickets = await Ticket.find({
      transaction_id: { $in: transactionIds },
      status: { $in: ["ACTIVE"] },
      $or: [
        {
          "ticket_type.expiry_date": { $exists: true, $gte: now },
        },
        {
          "ticket_type.expiry_date": { $exists: false },
          createdAt: { $gte: twentyFourHoursAgo },
        },
      ],
    });

    const stationIds = tickets
      .flatMap((ticket) => [ticket.start_station_id, ticket.end_station_id])
      .filter((id) => id);

    const stations = await Station.find({ _id: { $in: stationIds } });

    const stationMap = new Map();
    stations.forEach((station) => {
      stationMap.set(station._id.toString(), station.name);
    });

    const enrichedTickets = tickets.map((ticket) => {
      let ticketCategory = "";
      if (ticket.ticket_type && ticket.ticket_type.name) {
        ticketCategory = "Vé theo loại";
      } else {
        ticketCategory = "Vé theo tuyến";
      }
      return {
        ...ticket._doc,
        start_station_name: ticket.start_station_id
          ? stationMap.get(ticket.start_station_id.toString())
          : null,
        end_station_name: ticket.end_station_id
          ? stationMap.get(ticket.end_station_id.toString())
          : null,
        ticket_category: ticketCategory,
      };
    });

    res.status(200).json({
      httpStatus: httpStatus.OK,
      errorCode: ErrorCode.OK,
      totalItems: enrichedTickets.length,
      data: enrichedTickets,
    });
  } catch (error) {
    res.status(500).json({
      httpStatus: httpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};


const checkIn = async (req, res) => {
  try {
    const { ticketId, stationId } = req.body;
    if (!ticketId) {
      return res.status(400).json({
        httpStatus: httpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
        message: "ticketId is required",
      });
    };
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        httpStatus: httpStatus.NOT_FOUND,
        errorCode: ErrorCode.TICKET_NOT_FOUND,
        message: "Ticket not found",
      });
    };
    if (ticket.status !== "ACTIVE") {
      return res.status(400).json({
        httpStatus: httpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
        message: "Ticket is not active or already checked in",
      });
    };
    if(ticket.start_station_id !== stationId) {
      return res.status(400).json({
        httpStatus: httpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
        message: "Ticket start station does not match the check-in station",
      });
    };
    ticket.status = "CHECKED_IN";
    await ticket.save();
    res.status(200).json({
      httpStatus: httpStatus.OK,
      errorCode: ErrorCode.OK,
      message: "Check-in successful",
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      httpStatus: httpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};


const checkOut = async (req, res) => {
  try {
    const { ticketId, stationId } = req.body;
    if (!ticketId) {
      return res.status(400).json({
        httpStatus: httpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
        message: "ticketId is required",
      });
    }
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        httpStatus: httpStatus.NOT_FOUND,
        errorCode: ErrorCode.TICKET_NOT_FOUND,
        message: "Ticket not found",
      });
    };
    if (ticket.status !== "CHECKED_IN") {
      return res.status(400).json({
        httpStatus: httpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
        message: "Ticket is not checked in or already checked out",
      });
    };
    if(ticket.end_station_id !== stationId) {
      return res.status(400).json({
        httpStatus: httpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
        message: "Ticket end station does not match the check-out station",
      });
    };
    ticket.status = "CHECKED_OUT";
    await ticket.save();
    res.status(200).json({
      httpStatus: httpStatus.OK,
      errorCode: ErrorCode.OK,
      message: "Check-out successful",
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      httpStatus: httpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  getAllTicketsByUserId,
  getActiveTicketsByUserId,
  checkIn,
  checkOut,
};
