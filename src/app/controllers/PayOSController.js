const payOS = require('../../config/payment/PayOS')

const createPayment = async (req, res) => {

  const order = {
    orderCode: Math.floor(Math.random() * 1000000), // Mã đơn hàng duy nhất
    amount: 2000, // Số tiền (VNĐ)
    description: 'Thanh toán đơn hàng mẫu',
    returnUrl: `${process.env.SERVER_URL}/success`, // URL khi thanh toán thành công
    cancelUrl: `${process.env.SERVER_URL}/cancel`,  // URL khi hủy thanh toán
    items: [
      {
        name: 'Sản phẩm mẫu',
        quantity: 1,
        price: 2000
      }
    ]
  };

  console.log(payOS)
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

module.exports = { createPayment }