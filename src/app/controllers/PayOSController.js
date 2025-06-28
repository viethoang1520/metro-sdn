const payOS = require('../../config/payment/PayOS')
const { calculateTotalPrice } = require('../../utils/PayOSUtils')
const Order = require('../models/Order')
const Transaction = require('../models/Transaction')

const createPayment = async (req, res) => {
  const orderCode = Number(String(new Date().getTime()).slice(-6))
  const user_id = req.id
  const { items, transaction_id, total_price } = req.body
  const order = {
    orderCode,
    amount: total_price,
    description: `THANH TOAN VE ${orderCode}`,
    returnUrl: `${process.env.CLIENT_URL}/payment/success`,
    cancelUrl: `${process.env.CLIENT_URL}/payment/cancel`,
    items
  };
  try {
    if (!items || !transaction_id) {
      console.log(items, transaction_id)
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const transaction = await Transaction.findById(transaction_id)
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' })
    }
    if (total_price <= 0) {
      const newOrder = new Order({
        user_id,
        order_code: orderCode,
        order_date: new Date(),
        description: `THANH TOAN VE ${orderCode}`,
        transaction: transaction._id,
        order_amount: total_price,
        status: 'PENDING'
      })
      await newOrder.save()
      res.json({
        checkoutUrl: `${process.env.CLIENT_URL}/payment/success?code=00&cancel=false&status=PAID&order_code=${orderCode}`,
        qrCode: ``
      });
    } else {
      const paymentLink = await payOS.createPaymentLink(order);
      const newOrder = new Order({
        user_id,
        order_code: orderCode,
        order_date: new Date(),
        description: `THANH TOAN VE ${orderCode}`,
        transaction: transaction._id,
        order_amount: total_price,
        status: 'PENDING'
      })

      await newOrder.save()
      res.json({
        checkoutUrl: paymentLink.checkoutUrl,
        qrCode: paymentLink.qrCode
      });
    }

  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ error: error.message });
  }
}


const receiveWebhook = async (req, res) => {
  try {
    const { code, desc, data } = req.body
    console.log(req.body)
    const order = await Order.findOne({ order_code: data.orderCode })
      .populate('transaction')
    const transaction = await Transaction.findById(order.transaction)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    if (code === '00') {
      order.status = 'PAID'
      transaction.status = 'PAID'
    } else {
      order.status = 'CANCELLED'
      transaction.status = 'CANCELLED'
    }
    await order.save()
    await transaction.save()
    res.status(200).json({ message: 'Order updated successfully' })
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = { createPayment, receiveWebhook }