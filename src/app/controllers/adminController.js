const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// số vé tháng này, tổng doanh thu tháng này, tổng user
exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // số vé bán trong tháng này (chỉ tính vé đã thanh toán)
    const ticketsThisMonth = await Ticket.countDocuments({
      createdAt: { $gte: startOfMonth },
      status: 'paid'
    });

    // tổng doanh thu tháng này (từ Transaction)
    const revenueThisMonthAgg = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$total_price" } } }
    ]);
    const revenueThisMonth = revenueThisMonthAgg[0]?.total || 0;

    // tổng số user
    const totalUsers = await User.countDocuments();

    res.json({
      ticketsThisMonth,
      revenueThisMonth,
      totalUsers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// thống kê số vé từng tháng trong 12 tháng qua
exports.getTicketsByMonth = async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() });
    }

    const data = await Ticket.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]);

    // map data to 12 tháng
    const result = months.map(m => {
      const found = data.find(d => d._id.year === m.year && d._id.month === m.month + 1);
      return {
        year: m.year,
        month: m.month + 1,
        count: found ? found.count : 0
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// doanh thu hôm nay
exports.getTodayRevenue = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const revenueTodayAgg = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay } } },
      { $group: { _id: null, total: { $sum: "$total_price" } } }
    ]);
    const revenueToday = revenueTodayAgg[0]?.total || 0;
    res.json({ revenueToday });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// tổng vé đã bán hôm nay (chỉ tính vé đã thanh toán)
exports.getTodayTickets = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const ticketsToday = await Ticket.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay },
      status: 'paid'
    });
    res.json({ ticketsToday });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// lượng hành khách hôm nay (mỗi user chỉ tính 1 lần, dựa vào Transaction status='PAID')
exports.getTodayPassengers = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    // Lấy user_id duy nhất từ các giao dịch đã thanh toán trong ngày
    const uniqueUsers = await Transaction.distinct('user_id', {
      createdAt: { $gte: startOfDay, $lt: endOfDay },
      status: 'PAID'
    });
    res.json({ passengersToday: uniqueUsers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// vé ưu đãi hôm nay (giả sử Ticket có trường isDiscount hoặc dựa vào user.category_id)
exports.getTodayDiscountTickets = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    // giả sử ưu đãi là user.category_id khác null
    const discountTicketsToday = await Ticket.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay },
      isDiscount: true
    });
    res.json({ discountTicketsToday });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// doanh thu từng ngày trong 7 ngày qua
exports.getRevenueByDay = async (req, res) => {
  try {
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      days.push({ year: d.getFullYear(), month: d.getMonth(), date: d.getDate() });
    }
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const data = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
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
    const result = days.map(d => {
      const found = data.find(item =>
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
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// lượng hành khách theo ga hôm nay (giả sử Ticket có trường start_station_id)
exports.getTodayPassengersByStation = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const data = await Ticket.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay } } },
      { $group: { _id: "$start_station_id", count: { $sum: 1 } } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Lấy danh sách tất cả stations
exports.getAllStations = async (req, res) => {
  try {
    const Station = require('../models/Station');
    const stations = await Station.find({}, '_id name distance');
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 
