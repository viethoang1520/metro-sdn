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

          if (!currentRoute) {
               return res.json({ error_code: 1, msg: 'Route not found' })
          }
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
               return res.status(404).json({ 'message': 'Not found' })
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
          console.log(listRoutes);
          const route = await Route.insertMany(listRoutes)
     } catch (error) {
          console.log(error.message);
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
          return res.status(201).json({ msg: 'ok' })
     } catch (error) {
          res.redirect('/schedule?success=false')
          console.log(error.message)
     }
}

module.exports = { getScheduleByDirection, createBulkRoutes, createBulkTimetables, getScheduleByStartTime }