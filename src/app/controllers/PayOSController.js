const payOS = require('../../config/payment/PayOS')

const createPayment = async (req, res) => {
  const orderCode = Number(String(new Date().getTime()).slice(-6))
  const {amount, description} = req.body
  const order = {
    orderCode, 
    amount, 
    description: description || 'THANH TOAN VE METRO',
    returnUrl: `${process.env.SERVER_URL}/payment/success`, 
    cancelUrl: `${process.env.SERVER_URL}/payment/cancel`, 
    items: [
      {
        name: 'Sản phẩm mẫu',
        quantity: 1,
        price: 2000
      }
    ]
  };
  try {
    console.log(order)
    const paymentLink = await payOS.createPaymentLink(order);
    console.log("paymentLink", paymentLink)
    res.json({
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode
    });
  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ error: 'Failed to create payment link' });
  }
}


const receiveWebhook = (req, res) => {
  try {
    const receivedData = req.body
    // receive saving order
    console.log(receivedData)
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = { createPayment, receiveWebhook }