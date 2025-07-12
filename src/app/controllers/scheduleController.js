const Route = require('../models/Route')
const Timetable = require('../models/Timetable')
const { generateTime, convertDateToString, getStringToday, timeToMinutes, getTimeStringNow } = require('../../utils/timeUtils')

const getScheduleByDirection = async (req, res) => {
     try {
          const { direction } = req.params
          const date = getStringToday()
          const route = await Route.find({ direction, date }).populate('start_time').lean()
          if (!route || route.length === 0) {
               return res.json({ errorCode: 1, message: `Not found schedule with direction ${direction}` })
          }
          return res.json({ errorCode: 0, route })
     } catch (error) {
          console.log(error.message)
     }
}

const getScheduleByStartTime = async (req, res) => {
     try {
          const { direction, startTime } = req.params
          const date = getStringToday()
          const currentRoute = await Route.aggregate(([
               {
                    $lookup: {
                         from: 'timetables',
                         localField: 'start_time',
                         foreignField: '_id',
                         as: 'start_time'
                    }
               },
               { $unwind: '$start_time' },
               {
                    $match: {
                         'start_time.start_time': startTime,
                         direction,
                         date
                    }
               }
          ]))

          if (!currentRoute)
               return res.json({ error_code: 1, message: 'Không tìm thấy tuyến' })

          const arrivalTimeList = []
          let preStationStartTime = currentRoute[0].start_time.start_time
          for (let index = 0; index < currentRoute[0].schedule.length; index++) {
               arrivalTimeList.push({
                    station: currentRoute[0].schedule[index].station,
                    arrivalTime: generateTime(preStationStartTime, currentRoute[0].schedule[index].gap_time)
               })
               preStationStartTime = generateTime(preStationStartTime, currentRoute[0].schedule[index].gap_time)
          }
          return res.json({ error_code: 0, arrivalTimeList })
     } catch (error) {
          console.log(error.message)
     }
}

const getListTimetables = async (req, res) => {
     try {
          const timetables = await Timetable.find({})
          if (!timetables) return res.json({ error_code: 1, message: 'Không tìm thấy dữ liệu.' })
          return res.json({ error_code: 0, data: [...timetables] })
     } catch (error) {
          console.log(error.message)
          return res.json({ error_code: 1, message: 'Server error.' })
     }
}

const deleteTimetableById = async (req, res) => {
     try {
          const { id } = req.params
          const timetable = await Timetable.find({ _id: id })
          if (!timetable) return res.json({ error_code: 1, message: 'Không tìm thấy.' })
          await Timetable.updateOne(
               { _id: id },
               { $set: { status: 0 } }
          )
          return res.json({ error_code: 0, message: 'Cập nhật thành công.' })
     } catch (error) {
          console.log(error.message)
          return res.json({ error_code: 1, message: 'Server error.' })
     }
}

const restoreTimetableById = async (req, res) => {
     try {
          const { id } = req.params
          const timetable = await Timetable.find({ _id: id })
          if (!timetable) return res.json({ error_code: 1, message: 'Không tìm thấy.' })
          await Timetable.updateOne(
               { _id: id },
               { $set: { status: 1 } }
          )
          return res.json({ error_code: 0, message: 'Cập nhật thành công.' })
     } catch (error) {
          console.log(error.message)
     }
}

const findTimetableById = async (req, res) => {
     try {
          const { id } = req.params
          const timetable = await Timetable.findOne({ _id: id })
          if (!timetable) return res.json({ error_code: 1, message: 'Không tìm thấy.' })
          return res.json({ error_code: 0, data: timetable })
     } catch (error) {
          console.log(error.message)
          return res.json({ error_code: 1, message: 'Server error' })
     }
}

const updateTimetableById = async (req, res) => {
     try {
          const { id: _id } = req.params
          const { start_time } = req.body
          const listTimetable = await Timetable.find({})
          const timetable = await Timetable.find({ _id })
          if (!timetable) return res.json({ error_code: 1, message: 'Không tìm thấy.' })
          let indexOfTimetable = null
          listTimetable.forEach((timetable, index) => {
               if (timetable._id.toString() === _id) {
                    indexOfTimetable = index
               }
          })
          console.log(indexOfTimetable);
          if (indexOfTimetable === null) return res.json({ error_code: 1, message: 'Đã xảy ra lỗi.' })
          const nextStartTime = timeToMinutes(listTimetable[indexOfTimetable + 1].start_time)
          const currentStartTime = timeToMinutes(start_time)

          if (indexOfTimetable !== 0) {
               const prevStartTime = timeToMinutes(listTimetable[indexOfTimetable - 1].start_time)
               if (currentStartTime <= prevStartTime)
                    return res.json({ error_code: 1, message: 'GIờ cập nhật không được nhỏ hơn chuyến trước đó.' })
          }

          if (indexOfTimetable !== listTimetable.length - 1) {
               if (currentStartTime >= nextStartTime)
                    return res.json({ error_code: 1, message: 'Giờ cập nhật không được vượt quá chuyến tiếp theo.' })
          }

          const updateData = await Timetable.updateOne(
               { _id },
               { $set: { start_time } }
          )
          console.log(updateData)
          return res.json({ error_code: 0, message: 'Cập nhật thành công.' })
     } catch (error) {
          console.log(error.message)
          return res.json({ error_code: 1, message: 'Server error.' })
     }
}

const createBulkRoutes = async (direction) => {
     const today = new Date();
     const date = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
     const stationList = [
          { station: 'Bến Thành', gap_time: 0 },
          { station: 'Nhà hát Thành phố', gap_time: 13 },
          { station: 'Ba Son', gap_time: 13 },
          { station: 'Công viên Văn Thánh', gap_time: 13 },
          { station: 'Tân Cảng', gap_time: 13 },
          { station: 'Thảo Điền', gap_time: 13 },
          { station: 'An Phú', gap_time: 13 },
          { station: 'Rạch Chiếc', gap_time: 13 },
          { station: 'Phước Long', gap_time: 13 },
          { station: 'Bình Thái', gap_time: 13 },
          { station: 'Thủ Đức', gap_time: 13 },
          { station: 'Khu công nghệ cao', gap_time: 13 },
          { station: 'Đại học Quốc gia', gap_time: 13 },
          { station: 'Suối Tiên', gap_time: 13 }
     ];
     try {
          const allTimetables = await Timetable.find({})
          const listRoutes = []
          if (!allTimetables) {
               return res.json({ error_code: 1, message: 'Lỗi tạo: không tìm thấy danh sách timetable.' })
          }
          for (let index = 0; index < allTimetables.length; index++) {
               listRoutes.push({
                    direction,
                    date,
                    start_time: allTimetables[index]._id,
                    schedule: stationList,
                    status: 1
               })
          }
          const route = await Route.insertMany(listRoutes)
     } catch (error) {
          console.log(error.message)
          return res.json({ error_code: 1, message: 'Server error.' })
     }
}

const createBulkTimetables = async (req, res) => {
     try {
          const { direction, trainTrips, gapTime, firstTrain } = await req.body
          const count = await Timetable.countDocuments()
          if (count === 0) {
               const timetableList = []
               let startTime = firstTrain

               for (let index = 0; index < trainTrips; index++) {
                    timetableList.push({
                         start_time: startTime,
                         status: 1
                    })
                    startTime = generateTime(startTime, Number(gapTime))
               }
               await Timetable.insertMany(timetableList)
          }
          createBulkRoutes(direction)
          return res.status(201).json({ error_code: 0, message: 'Tạo thành công.' })
     } catch (error) {
          console.log(error.message)
          return res.json({ error_code: 500, message: 'Server error' })
     }
}

module.exports = {
     getScheduleByDirection,
     createBulkRoutes,
     createBulkTimetables,
     getScheduleByStartTime,
     getListTimetables,
     findTimetableById,
     deleteTimetableById,
     restoreTimetableById,
     updateTimetableById
}