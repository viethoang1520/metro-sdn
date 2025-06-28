const payOS = require('../../config/payment/PayOS')
const { calculateTotalPrice } = require('../../utils/PayOSUtils')
const Order = require('../models/Order')
const Transaction = require('../models/Transaction')

const createPayment = async (req, res) => {
  const orderCode = Number(String(new Date().getTime()).slice(-6))
  const { items, transaction_id } = req.body || [{ name: 'Sản phẩm mẫu', quantity: 1, price: 10000 }]
  const amount = calculateTotalPrice(items)
  const user_id = req.id || '684657ed0b397c8f35851eb0'
  const order = {
    orderCode,
    amount,
    description: `THANH TOAN VE ${orderCode}`,
    returnUrl: `${process.env.CLIENT_URL}/payment/success`,
    cancelUrl: `${process.env.CLIENT_URL}/payment/cancel`,
    items
  };
  try {
    const transaction = await Transaction.findById(transaction_id)
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' })
    }
    const paymentLink = await payOS.createPaymentLink(order);
    const newOrder = new Order({
      user_id,
      order_code: orderCode,
      order_date: new Date(),
      description: `THANH TOAN VE ${orderCode}`,
      transaction: transaction._id,
      order_amount: amount,
      status: 'PENDING'
    })

    await newOrder.save()
    res.json({
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode
    });
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