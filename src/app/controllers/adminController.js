const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Tổng quan: số vé tháng này, tổng doanh thu tháng này, tổng user
exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Số vé bán trong tháng này
    const ticketsThisMonth = await Ticket.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Tổng doanh thu tháng này (từ Transaction)
    const revenueThisMonthAgg = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$total_price" } } }
    ]);
    const revenueThisMonth = revenueThisMonthAgg[0]?.total || 0;

    // Tổng số user
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

// Thống kê số vé từng tháng trong 12 tháng qua
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

    // Map data to 12 months
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