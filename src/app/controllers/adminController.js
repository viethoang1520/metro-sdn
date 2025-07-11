const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// tổng doanh thu từ trước đến giờ, tổng vé đã bán hôm nay, doanh thu hôm nay, lượng hành khách hôm nay (tất cả trạng thái Paid)
exports.getTodayAndTotalSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // tổng doanh thu từ trước đến giờ (Transaction status='PAID')
    const totalRevenueAgg = await Transaction.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: "$total_price" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // tổng vé đã bán hôm nay (dựa vào transaction status='PAID')
    const ticketsTodayAgg = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay }, status: 'PAID' } },
      { $project: { ticketCount: { $size: "$ticket_id" } } },
      { $group: { _id: null, total: { $sum: "$ticketCount" } } }
    ]);
    const ticketsToday = ticketsTodayAgg[0]?.total || 0;

    // toanh thu hôm nay (transaction status='PAID')
    const revenueTodayAgg = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay }, status: 'PAID' } },
      { $group: { _id: null, total: { $sum: "$total_price" } } }
    ]);
    const revenueToday = revenueTodayAgg[0]?.total || 0;

    // lượng hành khách hôm nay (user duy nhất có transaction status='PAID' trong ngày)
    const uniqueUsers = await Transaction.distinct('user_id', {
      createdAt: { $gte: startOfDay, $lt: endOfDay },
      status: 'PAID'
    });
    const passengersToday = uniqueUsers.length;

    // doanh thu 7 ngày qua (transaction status='PAID')
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      days.push({ year: d.getFullYear(), month: d.getMonth(), date: d.getDate() });
    }
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const revenue7DaysAgg = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'PAID' } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            date: { $dayOfMonth: "$createdAt" }
          },
          total: { $sum: "$total_price" }
        }
      }
    ]);
    const revenueLast7Days = days.map(d => {
      const found = revenue7DaysAgg.find(item =>
        item._id.year === d.year &&
        item._id.month === d.month + 1 &&
        item._id.date === d.date
      );
      return {
        year: d.year,
        month: d.month + 1,
        date: d.date,
        total: found ? found.total : 0
      };
    });

    // hành khách theo ga hôm nay (ticket status='paid', group by start_station_id)
    const Station = require('../models/Station');
    const allStations = await Station.find({}, '_id name');
    const passengersByStationAgg = await Ticket.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay }, status: 'paid' } },
      { $group: { _id: "$start_station_id", count: { $sum: 1 } } }
    ]);
    const countMap = {};
    passengersByStationAgg.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });
    const passengersByStationToday = allStations.map(station => ({
      start_station_id: station._id,
      name: station.name,
      count: countMap[station._id.toString()] || 0
    }));

    // top 5 tuyến đường có doanh thu cao nhất trong 7 ngày qua (lấy từ transactions)
    const topRoutesAgg = await Transaction.aggregate([
      { $match: {
          status: 'PAID',
          createdAt: { $gte: startDate }
      } },
      { $unwind: "$ticket_id" },
      { $lookup: {
          from: "tickets",
          localField: "ticket_id",
          foreignField: "_id",
          as: "ticket"
      } },
      { $unwind: "$ticket" },
      { $match: {
          "ticket.start_station_id": { $ne: null },
          "ticket.end_station_id": { $ne: null },
          "ticket.route_price": { $ne: null }
      } },
      { $group: {
          _id: { start: "$ticket.start_station_id", end: "$ticket.end_station_id" },
          totalRevenue: { $sum: "$ticket.route_price" },
          count: { $sum: 1 }
      } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);
    // lấy tên ga cho từng tuyến
    const stationMap = {};
    const stationIds = [
      ...new Set(topRoutesAgg.flatMap(r => [r._id.start.toString(), r._id.end.toString()]))
    ];
    const stations = await Station.find({ _id: { $in: stationIds } });
    stations.forEach(s => { stationMap[s._id.toString()] = s.name });
    const topRoutesByRevenue = topRoutesAgg.map(r => ({
      route: `${stationMap[r._id.start.toString()] || r._id.start} - ${stationMap[r._id.end.toString()] || r._id.end}`,
      totalRevenue: r.totalRevenue,
      count: r.count
    }));

    res.json({
      totalRevenue,
      ticketsToday,
      revenueToday,
      passengersToday,
      revenueLast7Days,
      passengersByStationToday,
      topRoutesByRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API: Lấy trạng thái các ga theo thời gian thực trong ngày hôm nay
exports.getStationStatusToday = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // lấy tất cả tickets trong ngày hôm nay có start_station_id và transaction_id
    const tickets = await Ticket.find({
      createdAt: { $gte: startOfDay, $lt: endOfDay },
      start_station_id: { $ne: null },
      transaction_id: { $ne: null }
    }, 'start_station_id transaction_id');

    // lấy tất cả transaction_id từ tickets
    const transactionIds = tickets.map(t => t.transaction_id);
    // lấy các transaction status 'PAID'
    const paidTransactions = await Transaction.find({
      _id: { $in: transactionIds },
      status: 'PAID'
    }, '_id');
    const paidTransactionIds = new Set(paidTransactions.map(tr => tr._id.toString()));

    // Lọc tickets có transaction_id thuộc paidTransactionIds
    const paidTickets = tickets.filter(t => paidTransactionIds.has(t.transaction_id.toString()));

    // Đếm số lượng vé theo start_station_id
    const stationCountMap = {};
    paidTickets.forEach(t => {
      const key = t.start_station_id.toString();
      stationCountMap[key] = (stationCountMap[key] || 0) + 1;
    });

    // Lấy thông tin tên ga
    const Station = require('../models/Station');
    const allStations = await Station.find({}, '_id name');
    const stationStatus = allStations.map(station => ({
      start_station_id: station._id,
      name: station.name,
      count: stationCountMap[station._id.toString()] || 0
    }));

    res.json({
      stationStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 
