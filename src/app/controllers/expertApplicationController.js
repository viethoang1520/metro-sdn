const ExpertApplication = require('../models/ExpertApplication');
const User = require('../models/User');

// Get all expert applications with pagination and filtering
const getExpertApplications = async (req, res) => {
     try {
          const { page = 1, limit = 10, status, search } = req.query;

          // Build filter
          const filter = {};
          if (status && status !== 'all') {
               filter.status = status;
          }

          // Build search filter for user name/email
          let userFilter = {};
          if (search) {
               userFilter = {
                    $or: [
                         { full_name: { $regex: search, $options: 'i' } },
                         { email: { $regex: search, $options: 'i' } }
                    ]
               };
          }

          // Get users matching search criteria
          let userIds = [];
          if (search) {
               const users = await User.find(userFilter).select('_id');
               userIds = users.map(user => user._id);
               filter.userId = { $in: userIds };
          }

          const applications = await ExpertApplication.find(filter)
               .populate('userId', 'full_name email')
               .populate('reviewedBy', 'full_name')
               .sort({ createdAt: -1 })
               .limit(limit * 1)
               .skip((page - 1) * limit);

          const total = await ExpertApplication.countDocuments(filter);

          // Transform data to match frontend interface
          const transformedApplications = applications.map(app => ({
               id: app._id,
               userId: app.userId._id,
               userName: app.userId.full_name || 'Unknown',
               userEmail: app.userId.email || 'No email',
               userPhone: app.userId.phone_number || 'No phone',
               appliedAt: app.createdAt,
               status: app.status,
               experience: app.experience,
               certifications: app.certifications,
               portfolio: app.portfolio,
               motivation: app.motivation,
               adminNote: app.adminNote,
               reviewedBy: app.reviewedBy?.full_name,
               reviewedAt: app.reviewedAt
          }));

          res.json({
               success: true,
               data: transformedApplications,
               pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page: Number(page),
                    limit: Number(limit)
               }
          });
     } catch (error) {
          console.error('Error fetching expert applications:', error);
          res.status(500).json({
               success: false,
               message: 'Failed to fetch expert applications',
               error: error.message
          });
     }
};

// Get expert application by ID
const getExpertApplicationById = async (req, res) => {
     try {
          const { id } = req.params;

          const application = await ExpertApplication.findById(id)
               .populate('userId', 'full_name email phone_number')
               .populate('reviewedBy', 'full_name');

          if (!application) {
               return res.status(404).json({
                    success: false,
                    message: 'Expert application not found'
               });
          }

          const transformedApplication = {
               id: application._id,
               userId: application.userId._id,
               userName: application.userId.full_name || 'Unknown',
               userEmail: application.userId.email || 'No email',
               userPhone: application.userId.phone_number || 'No phone',
               appliedAt: application.createdAt,
               status: application.status,
               experience: application.experience,
               certifications: application.certifications,
               portfolio: application.portfolio,
               motivation: application.motivation,
               adminNote: application.adminNote,
               reviewedBy: application.reviewedBy?.full_name,
               reviewedAt: application.reviewedAt
          };

          res.json({
               success: true,
               data: transformedApplication
          });
     } catch (error) {
          console.error('Error fetching expert application:', error);
          res.status(500).json({
               success: false,
               message: 'Failed to fetch expert application',
               error: error.message
          });
     }
};

// Approve expert application
const approveExpertApplication = async (req, res) => {
     try {
          const { applicationId, adminNote } = req.body;

          if (!applicationId) {
               return res.status(400).json({
                    success: false,
                    message: 'Application ID is required'
               });
          }

          const application = await ExpertApplication.findById(applicationId);

          if (!application) {
               return res.status(404).json({
                    success: false,
                    message: 'Expert application not found'
               });
          }

          if (application.status !== 'pending') {
               return res.status(400).json({
                    success: false,
                    message: 'Application has already been processed'
               });
          }

          // Update application status
          application.status = 'approved';
          application.adminNote = adminNote || '';
          application.reviewedAt = new Date();
          // You might want to set reviewedBy to the current admin user ID
          // application.reviewedBy = req.user.id; // Assuming you have user info from auth middleware

          await application.save();

          // Update user role to expert (you might need to add an expert field to User model)
          await User.findByIdAndUpdate(application.userId, {
               isExpert: true,
               expertApprovedAt: new Date()
          });

          res.json({
               success: true,
               message: 'Expert application approved successfully',
               data: application
          });
     } catch (error) {
          console.error('Error approving expert application:', error);
          res.status(500).json({
               success: false,
               message: 'Failed to approve expert application',
               error: error.message
          });
     }
};

// Reject expert application
const rejectExpertApplication = async (req, res) => {
     try {
          const { applicationId, adminNote } = req.body;

          if (!applicationId) {
               return res.status(400).json({
                    success: false,
                    message: 'Application ID is required'
               });
          }

          const application = await ExpertApplication.findById(applicationId);

          if (!application) {
               return res.status(404).json({
                    success: false,
                    message: 'Expert application not found'
               });
          }

          if (application.status !== 'pending') {
               return res.status(400).json({
                    success: false,
                    message: 'Application has already been processed'
               });
          }

          // Update application status
          application.status = 'rejected';
          application.adminNote = adminNote || '';
          application.reviewedAt = new Date();
          // application.reviewedBy = req.user.id; // Assuming you have user info from auth middleware

          await application.save();

          res.json({
               success: true,
               message: 'Expert application rejected successfully',
               data: application
          });
     } catch (error) {
          console.error('Error rejecting expert application:', error);
          res.status(500).json({
               success: false,
               message: 'Failed to reject expert application',
               error: error.message
          });
     }
};

// Get expert application statistics
const getExpertApplicationStats = async (req, res) => {
     try {
          const pending = await ExpertApplication.countDocuments({ status: 'pending' });
          const approved = await ExpertApplication.countDocuments({ status: 'approved' });
          const rejected = await ExpertApplication.countDocuments({ status: 'rejected' });
          const total = await ExpertApplication.countDocuments();

          res.json({
               success: true,
               data: {
                    pending,
                    approved,
                    rejected,
                    total
               }
          });
     } catch (error) {
          console.error('Error fetching expert application stats:', error);
          res.status(500).json({
               success: false,
               message: 'Failed to fetch expert application statistics',
               error: error.message
          });
     }
};

// Submit expert application (for users)
const submitExpertApplication = async (req, res) => {
     try {
          const { userId, experience, certifications, portfolio, motivation } = req.body;

          // Validate required fields
          if (!userId || !experience || !certifications || !portfolio || !motivation) {
               return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
               });
          }

          // Check if user already has a pending or approved application
          const existingApplication = await ExpertApplication.findOne({
               userId,
               status: { $in: ['pending', 'approved'] }
          });

          if (existingApplication) {
               return res.status(400).json({
                    success: false,
                    message: 'You already have a pending or approved expert application'
               });
          }

          // Create new application
          const application = new ExpertApplication({
               userId,
               experience,
               certifications: Array.isArray(certifications) ? certifications : [certifications],
               portfolio,
               motivation
          });

          await application.save();

          res.status(201).json({
               success: true,
               message: 'Expert application submitted successfully',
               data: application
          });
     } catch (error) {
          console.error('Error submitting expert application:', error);
          res.status(500).json({
               success: false,
               message: 'Failed to submit expert application',
               error: error.message
          });
     }
};

module.exports = {
     getExpertApplications,
     getExpertApplicationById,
     approveExpertApplication,
     rejectExpertApplication,
     getExpertApplicationStats,
     submitExpertApplication
};
