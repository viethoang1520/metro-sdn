const express = require('express')
const { getScheduleByDirection, createBulkTimetables, getScheduleByStartTime, getListTimetables, deleteTimetableById, findTimetableById, restoreTimetableById, updateTimetableById } = require('../app/controllers/scheduleController')
const router = express.Router()

//Timetable
router.get('/timetable', getListTimetables)
router.get('/timetable/:id', findTimetableById)
router.delete('/timetable/:id', deleteTimetableById)
router.put('/timetable/:id', updateTimetableById)
router.patch('/timetable/:id/restore', restoreTimetableById)
//
router.get('/:direction', getScheduleByDirection)
router.get('/:direction/:startTime', getScheduleByStartTime)
router.post('/auto-create-timetables', createBulkTimetables)

module.exports = router