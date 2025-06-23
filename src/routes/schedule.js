const express = require('express')
const { getScheduleByDirection, createBulkTimetables, getScheduleByStartTime } = require('../app/controllers/scheduleController')
const router = express.Router()

router.get('/:direction', getScheduleByDirection)
router.get('/:direction/:startTime', getScheduleByStartTime)
router.post('/auto-create-timetables', createBulkTimetables)

module.exports = router