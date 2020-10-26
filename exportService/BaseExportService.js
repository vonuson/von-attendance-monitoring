const uuid = require('uuid');
const path = require('path');

module.exports = class BaseExportService {
  constructor(fileExtension) {
    this.fileExtension = fileExtension;
  }

  getOutputFilePath(fileName) {
    return path.join(__dirname, '..', 'outputs', fileName);
  }

  getFileName() {
    const date = new Date();

    return `${this.formatDateForFilename(date)}_${uuid.v4()}.${this.fileExtension}`;
  }

  formatDateForFilename(date) {
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const time = date.toLocaleTimeString().replace(/:/g, '.');
    return `${month}-${day}-${date.getFullYear()}-${time}`;
  }
}
