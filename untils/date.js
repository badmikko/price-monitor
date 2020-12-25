const moment = require('moment-timezone');
moment().tz("Asia/Hong_Kong").format();

// var timestamp = moment(thread.date || new Date());
// segment.push(timestamp.format("YYYYMMDD"));
// segment.push(timestamp.format("HHmmss"));

function format(format = "YYYY/MM/DD", date = new Date()) {
  var timestamp = moment(date);
  return timestamp.format(format);
}

module.exports = {
  format
}