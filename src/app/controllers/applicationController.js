const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const ExemptionApplication = require("../models/ExemptionApplication");
const { default: status } = require("http-status");

exports.approveExemptionApplication = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const app = await ExemptionApplication.findById(applicationId);
    if (!app) {
      return res.status(404).json({
        errorCode: 1,
        message: "Exemption application not found",
        data: null,
      });
    }
    if (app.status === "APPROVED") {
      return res.status(400).json({
        errorCode: 1,
        message: "Application already approved",
        data: null,
      });
    }
    app.status = "APPROVED";
    await app.save();
    let discount = 0;
    if (app.user_type === "STUDENT") discount = 50;
    else discount = 100;
    await User.findByIdAndUpdate(app.user_id, {
      passenger_categories: {
        passenger_type: app.user_type,
        discount,
        expiry_date: app.expiry_date,
        status: "APPROVED",
      },
    });
    return res.json({
      errorCode: 0,
      message: "Application approved and user updated",
      data: {
        discount,
        user_type: app.user_type,
        expiry_date: app.expiry_date,
        status: "APPROVED",
      },
    });
  } catch (err) {
    res.status(500).json({
      errorCode: 1,
      message: err.message || "An error occurred while approving application",
      data: null,
    });
  }
};

exports.rejectExemptionApplication = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const app = await ExemptionApplication.findById(applicationId);
    if (!app) {
      return res.status(404).json({
        errorCode: 1,
        message: "Exemption application not found",
        data: null,
      });
    }
    app.status = "REJECTED";
    await app.save();
    return res.json({
      errorCode: 0,
      message: "Application rejected successfully",
      data: { applicationId },
    });
  } catch (err) {
    res.status(500).json({
      errorCode: 1,
      message: err.message || "An error occurred while rejecting application",
      data: null,
    });
  }
};

exports.listExemptionApplications = async (req, res) => {
  try {
    let { page = 1, pageSize = 10, status } = req.query;
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    const filter = {};
    if (status) filter.status = status;
    const total = await ExemptionApplication.countDocuments(filter);
    const applications = await ExemptionApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate("user_id", "full_name");

    const mappedApplications = applications.map((app) => ({
      _id: app._id,
      user_id: app.user_id?._id,
      full_name: app.user_id?.full_name,
      user_type: app.user_type,
      expiry_date: app.expiry_date,
      status: app.status,
      cccd: app.cccd,
      createdAt: app.createdAt,
    }));

    res.json({
      errorCode: 0,
      data: {
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
        applications: mappedApplications,
      },
      message: "Exemption applications fetched successfully",
    });
  } catch (err) {
    res.status(500).json({
      errorCode: 1,
      data: null,
      message: err.message || "An error occurred while fetching applications",
    });
  }
};
