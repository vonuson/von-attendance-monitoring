const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const { LOG_HEADER } = require('./constants');

class ApiCallLogger extends EventEmitter {
  /** Create the log file for the day if not exists. */
  createFile = () => {
    fs.writeFile(this.getLogFilePath(), LOG_HEADER, { flag: 'wx' }, (error) => {
      // Ignore file exists error
      if (error && error.code !== 'EEXIST') {
        throw error;
      }
    });
  }

  /** Get the log file name. */
  getLogFileName = () => {
    const date = new Date();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `AttendanceMonitoringLogs-${date.getFullYear()}-${month}-${day}.txt`;
  }

  /** Get the log file path. */
  getLogFilePath = () => path.join(__dirname, '..', this.getLogFileName());

  /** Log API Calls. */
  logApiCalls = ({ req, res, filename }) => {
    if (filename !== this.getLogFileName()) {
      return this.createFile();
    }

    const currentDateTime = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    fs.appendFile(
      this.getLogFilePath(),
      `\n\n${currentDateTime} - ${req.method}: ${req.url} - ${res.statusCode}
Request Body: ${JSON.stringify(req.body)}
Request Parameter: ${JSON.stringify(req.params)}
Request Query: ${JSON.stringify(req.query)}
Request Headers: ${JSON.stringify(req.headers)}`,
      () => { console.log('Log has been added.'); }
    );
  };
}

module.exports = ApiCallLogger;