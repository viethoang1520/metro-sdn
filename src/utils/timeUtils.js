function generateTime(startTime, intervalMinutes) {
     const [startHour, startMinute] = startTime.split(':').map(Number)
     const startDate = new Date()
     startDate.setHours(startHour, startMinute, 0, 0)
     startDate.setMinutes(startDate.getMinutes() + intervalMinutes)
     const h = startDate.getHours().toString().padStart(2, '0')
     const m = startDate.getMinutes().toString().padStart(2, '0')
     return `${h}:${m}`
}

function convertDateToString(date) {
     return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

function timeToMinutes(str) {
     const [h, m] = str.split(':')
     return Number(h * 60 + m)
}

function getStringToday() {
     const today = new Date()
     const day = today.getDate()
     const month = today.getMonth()
     const year = today.getFullYear()
     return `${day}/${month + 1}/${year}`
}

function getTimeStringNow() {
     const now = new Date()
     const hours = now.getHours()
     const minutes = now.getMinutes()
     return `${hours}:${minutes}`
}

module.exports = { generateTime, convertDateToString, timeToMinutes, getStringToday, getTimeStringNow }