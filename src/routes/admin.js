const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/adminController');

// tổng hợp số vé bán, doanh thu, tổng user trong tháng này
// link này nha: http://localhost:3000/admin/summary
router.get('/summary', adminController.getSummary);

// thống kê số vé bán từng tháng trong 12 tháng qua
// http://localhost:3000/admin/tickets-by-month
router.get('/tickets-by-month', adminController.getTicketsByMonth); 

// lấy doanh thu của ngày hôm nay
// http://localhost:3000/admin/today-revenue
router.get('/today-revenue', adminController.getTodayRevenue);

// lấy tổng số vé đã bán trong ngày hôm nay 
// http://localhost:3000/admin/today-tickets
router.get('/today-tickets', adminController.getTodayTickets); 

// lấy tổng lượng hành khách trong ngày hôm nay (mỗi vé là 1 hành khách)
// http://localhost:3000/admin/today-passengers
router.get('/today-passengers', adminController.getTodayPassengers);

// lấy số vé ưu đãi đã bán trong ngày hôm nay (vé có isDiscount = true)
// http://localhost:3000/admin/today-discount-tickets
router.get('/today-discount-tickets', adminController.getTodayDiscountTickets);

// lấy doanh thu từng ngày trong 7 ngày qua
// http://localhost:3000/admin/revenue-by-day
router.get('/revenue-by-day', adminController.getRevenueByDay);

// lấy lượng hành khách theo từng ga trong ngày hôm nay
// http://localhost:3000/admin/today-passengers-by-station
router.get('/today-passengers-by-station', adminController.getTodayPassengersByStation);

// lấy danh sách tất cả stations
router.get('/stations', adminController.getAllStations);

module.exports = router; 