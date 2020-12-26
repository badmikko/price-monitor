const moment = require('moment-timezone');
const TIMEZONE = "GMT";

// var timestamp = moment(thread.date || new Date());
// segment.push(timestamp.format("YYYYMMDD"));
// segment.push(timestamp.format("HHmmss"));

function format(format = "YYYY/MM/DD", date = new Date()) {
  var timestamp = moment(date).tz(TIMEZONE).format(format);
  return timestamp;
}

function addDays(numOfDays, date = new Date()) {
  return moment(date).tz(TIMEZONE).startOf('day').add(numOfDays, 'days').toDate();
}

function today() {
  return moment().tz(TIMEZONE).startOf('day').toDate();
}

function getAllMonthsBetween(startDate, endDate) {
  const result = _getAllMonthsBetween(moment(startDate), moment(endDate));
  return result.map(d => d.toDate());
}

function _getAllMonthsBetween(startDate, endDate) {
  var result = [];

  if (endDate.isBefore(startDate)) {
    throw "End date must be greated than start date."
  }      
  startDate = moment(moment(startDate).format("YYYY-MM-01"))
  while (startDate.isSameOrBefore(endDate)) {
    result.push(startDate);
    startDate = startDate.clone().add(1, 'month');
  }

  return result;
}

function getAllDatesBetween(startDate, endDate) {
  const result = _getAllDatesBetween(moment(startDate), moment(endDate));
  return result.map(d => d.toDate());
}

function _getAllDatesBetween(startDate, endDate) {
  var result = [];

  if (endDate.isBefore(startDate)) {
    throw "End date must be greated than start date."
  }      
  
  while (startDate.isSameOrBefore(endDate)) {
    result.push(startDate);
    startDate = startDate.clone().add(1, 'day');
  }

  return result;
}

module.exports = {
  format,
  addDays,
  today,
  getAllDatesBetween,
  getAllMonthsBetween
}