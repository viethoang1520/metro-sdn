const httpStatus = require("http-status");
const Ticket = require("../models/Ticket");
const Transaction = require("../models/Transaction");
const ErrorCode = {
    OK: "OK",
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
    res.status(httpStatus.OK).json({
      httpStatus: httpStatus.OK,
      errorCode: ErrorCode.OK,
      totalItems: tickets.length,
      data: tickets,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
      httpStatus: httpStatus.INTERNAL_SERVER_ERROR,
      errorCode:  ErrorCode.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};
const getTicketById = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const ticket = await Ticket.findById({
      where: { ticket_id: ticketId },
    });

    res.status(httpStatus.OK).json({
      httpStatus: httpStatus.OK,
      errorCode: ErrorCode.OK,
      data: ticket,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
      httpStatus: httpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.TICKET_NOT_FOUND,
      message: error.message,
    });
  }
};

const getAllTicketsByUserId = async (req, res) => {
  try {
   const { userId } = req.params;
        const transactions = await Transaction.find({ user_id: userId }).select('ticket_id');
        const ticketIds = transactions.flatMap(tran => tran.ticket_id);
        const tickets = await Ticket.find({ _id: { $in: ticketIds } });
    res.status(httpStatus.OK).json({
      httpStatus: httpStatus.OK,
      errorCode: ErrorCode.OK,
      totalItems: tickets.length,
      data: tickets,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({  
      httpStatus: httpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  getAllTicketsByUserId
};
