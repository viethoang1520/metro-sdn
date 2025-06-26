const vnpay = require('../../config/payment/VNPay');
const { ProductCode, VnpLocale } = require('vnpay');
const Order = require('../models/Order');

exports.createPayment = async (req, res) => {
  try {
    const { amount, orderId, orderInfo } = req.body;

    // Tạo đơn hàng
    const order = new Order({ id: orderId, amount, status: 'PENDING' });
    await order.save();

    // Tạo URL thanh toán
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount * 100,
      vnp_IpAddr: req.headers['x-forwarded-for'] || req.ip,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
      vnp_Locale: VnpLocale.VN,
    });

    res.json({ success: true, paymentUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tạo thanh toán', error: error.message });
  }
};

exports.handleReturn = async (req, res) => {
  try {
    // Kiểm tra checksum
    const isValid = vnpay.verifyReturnUrl(req.query);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid checksum' });
    }

    const { vnp_TxnRef, vnp_ResponseCode, vnp_Amount, vnp_TransactionNo, vnp_PayDate } = req.query;

    // Tìm đơn hàng
    const order = await Order.findOne({ id: vnp_TxnRef });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    // Cập nhật trạng thái đơn hàng
    if (vnp_ResponseCode === '00') {
      order.status = 'SUCCESS';
      await order.save();
      return res.json({
        success: true,
        message: 'Thanh toán thành công',
        orderId: vnp_TxnRef,
        amount: vnp_Amount / 100,
        transactionNo: vnp_TransactionNo,
        payDate: vnp_PayDate,
      });
    } else {
      order.status = 'FAILED';
      await order.save();
      return res.json({
        success: false,
        message: 'Thanh toán thất bại',
        responseCode: vnp_ResponseCode,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xử lý kết quả thanh toán', error: error.message });
  }
};

exports.handleIpn = async (req, res) => {
  try {
    // Kiểm tra checksum
    const isValid = vnpay.verifyIpnCall(req.body);
    if (!isValid) {
      return res.json({ RspCode: '97', Message: 'Invalid checksum' });
    }

    const { vnp_TxnRef, vnp_ResponseCode } = req.body;

    // Tìm đơn hàng
    const order = await Order.findOne({ id: vnp_TxnRef });
    if (!order) {
      return res.json({ RspCode: '01', Message: 'Order not found' });
    }

    // Cập nhật trạng thái đơn hàng
    const status = vnp_ResponseCode === '00' ? 'SUCCESS' : 'FAILED';
    order.status = status;
    await order.save();

    return res.json({ RspCode: '00', Message: 'Confirm Success' });
  } catch (error) {
    res.json({ RspCode: '99', Message: 'Unknown error' });
  }
};