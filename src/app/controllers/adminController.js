const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ExemptionApplication = require('../models/ExemptionApplication');

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


exports.approveExemptionApplication = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const app = await ExemptionApplication.findById(applicationId);
    if (!app) {
      return res.status(404).json({
        errorCode: 1,
        message: 'Exemption application not found',
        data: null,
      });
    }
    if (app.status === 'APPROVED') {
      return res.status(400).json({
        errorCode: 1,
        message: 'Application already approved',
        data: null,
      });
    }
    app.status = 'APPROVED';
    await app.save();
    let discount = 0;
    if (app.user_type === 'STUDENT') discount = 50;
    else discount = 100;
    await User.findByIdAndUpdate(app.user_id, {
      passenger_categories: {
        passenger_type: app.user_type,
        discount,
        expiry_date: app.expiry_date,
      },
    });
    return res.json({
      errorCode: 0,
      message: 'Application approved and user updated',
      data: { discount, user_type: app.user_type, expiry_date: app.expiry_date },
    });
  } catch (err) {
    res.status(500).json({
      errorCode: 1,
      message: err.message || 'An error occurred while approving application',
      data: null,
    });
  }
};
