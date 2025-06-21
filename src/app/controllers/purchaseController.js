const Ticket = require('../models/Ticket');
const Station = require('../models/Station');
const User = require('../models/User');
const PassengerCategory = require('../models/PassengerCategory');
const Transaction = require('../models/Transaction');

class TicketController {
    constructor() {
        this.purchaseTicket = this.purchaseTicket.bind(this);
    }
    // tính giá vé lượt theo số ga và phương thức thanh toán
    async calculateSingleRideFare(stationCount, paymentMethod) {
        let basePrice;
        
        // Tính giá cơ bản theo số ga
        if (stationCount === 1) {
            basePrice = 7000;
        } else if (stationCount === 2) {
            basePrice = 9000;
        } else if (stationCount === 3) {
            basePrice = 11000;
        } else {
            // Mỗi ga tiếp theo cộng thêm 2000đ
            basePrice = 11000 + (stationCount - 3) * 2000;
        }

        // Giới hạn giá tối đa là 20000đ
        basePrice = Math.min(basePrice, 20000);

        // Áp dụng giảm giá cho thanh toán điện tử
        if (paymentMethod !== 'cash') {
            basePrice -= 1000;
        }

        return basePrice;
    }

    // áp dụng giảm giá %
    applyDiscount(price, discountPercentage) {
        return price * (1 - discountPercentage / 100);
    }

    // xử lý logic mua vé
    async purchaseTicket(req, res) {
        try {
            const { userId, ticketType, paymentMethod, startStationId, endStationId, duration } = req.body;

            // kiểm tra dữ liệu đầu vào
            if (!userId || !ticketType) {
                return res.status(400).json({ message: 'Missing required fields: userId, ticketType' });
            }

            // tìm người dùng
            const user = await User.findById(userId).populate('category_id');
            console.log('Fetched User object:', user);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            console.log('startStationId:', startStationId, 'endStationId:', endStationId);

            let totalPrice = 0;
            let ticketDetails = {};

            // xử lý vé lượt
            if (ticketType === 'single_ride') {
                if (!startStationId || !endStationId) {
                    return res.status(400).json({ message: 'Missing required fields for single-ride ticket: startStationId, endStationId' });
                }

                const startStation = await Station.findById(startStationId);
                const endStation = await Station.findById(endStationId);
                if (!startStation || !endStation) {
                    return res.status(404).json({ message: 'Start or end station not found' });
                }

                // Tính số ga di chuyển
                const stationCount = Math.abs(startStation.distance - endStation.distance) + 1;
                totalPrice = await this.calculateSingleRideFare(stationCount, paymentMethod);

                ticketDetails = {
                    start_station_id: startStation._id,
                    end_station_id: endStation._id,
                    route_price: totalPrice,
                    ticket_type: { name: 'Vé lượt', base_price: totalPrice },
                    status: 'active'
                };
            }

            // xử lý vé theo thời gian
            else if (ticketType === 'time_based') {
                if (!duration) {
                    return res.status(400).json({ message: 'Missing required field for time-based ticket: duration (e.g., day, 3-day, month)' });
                }

                const now = new Date();
                let expiryDate;

                switch (duration) {
                    case 'day':
                        totalPrice = 40000;
                        expiryDate = new Date(now.setDate(now.getDate() + 1));
                        ticketDetails.ticket_type = { name: 'Vé ngày', base_price: totalPrice };
                        break;
                    case '3_day':
                        totalPrice = 90000;
                        expiryDate = new Date(now.setDate(now.getDate() + 3));
                        ticketDetails.ticket_type = { name: 'Vé 3 ngày', base_price: totalPrice };
                        break;
                    case 'month_adult':
                        totalPrice = 300000;
                        expiryDate = new Date(now.setMonth(now.getMonth() + 1));
                        ticketDetails.ticket_type = { name: 'Vé tháng – người lớn', base_price: totalPrice };
                        break;
                    case 'month_student':
                        totalPrice = 150000;
                        expiryDate = new Date(now.setMonth(now.getMonth() + 1));
                        ticketDetails.ticket_type = { name: 'Vé tháng – HSSV', base_price: totalPrice };
                        break;
                    default:
                        return res.status(400).json({ message: 'Invalid duration for time-based ticket.' });
                }

                ticketDetails.status = 'active';
                ticketDetails.ticket_type.expiry_date = expiryDate;
            }

            // loại vé không hợp lệ
            else {
                return res.status(400).json({ message: 'Invalid ticket type. Must be single_ride or time_based.' });
            }

            // áp dụng giảm giá nếu người dùng thuộc diện ưu tiên
            if (user.category_id) {
                const type = user.category_id.passenger_type;
                console.log('User passenger type:', type);
                console.log('User age:', user.age);

                // Kiểm tra tuổi cho người cao tuổi
                const isElderly = type === 'Người cao tuổi' && user.age >= 60;
                console.log('Is elderly:', isElderly);

                if (
                    isElderly || 
                    type === 'Trẻ em dưới 6 tuổi' || 
                    type === 'Người khuyết tật' || 
                    type === 'Người có công'
                ) {
                    console.log('Applying discount logic...');
                    // Miễn phí cho vé lượt
                    if (ticketType === 'single_ride') {
                        totalPrice = 0;
                    }
                    // Giảm giá 50% cho vé tháng
                    else if (ticketType === 'time_based' && duration === 'month_adult') {
                        totalPrice = 150000;
                    }
                }
            }

            // tạo transaction
            const newTransaction = new Transaction({
                user_id: user._id,
                total_price: totalPrice,
                status: 'completed',
                method: paymentMethod
            });

            await newTransaction.save();

            // tạo vé
            const newTicket = new Ticket({
                transaction_id: newTransaction._id,
                ...ticketDetails
            });

            await newTicket.save();

            // lưu lại id vé trong transaction
            newTransaction.ticket_id.push(newTicket._id);
            await newTransaction.save();

            console.log('Đã tạo vé:', newTicket);

            return res.status(201).json({ 
                message: 'Ticket purchased successfully!', 
                transaction: newTransaction, 
                ticket: newTicket 
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

module.exports = new TicketController();
