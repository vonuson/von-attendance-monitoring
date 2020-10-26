const fs = require('fs').promises;
const xl = require('excel4node');
const http = require('http');
const BaseExportService = require('./BaseExportService');

module.exports = class ExcelExportService extends BaseExportService {
  /** Export data to excel 
   * @param data the JSON data to be writteb
   * @param filename the filename of the excel file
   * @param response the instance of http server response
  */
  async export(data, filename, response) {
    try {
      await fs.mkdir('outputs');
    } catch (error) {
      // Ignore file exists error
      if (error.code !== 'EEXIST') {
        console.log('Unable to create path.');
        throw error;
      }
    }

    try {
      const keys = Object.keys(data[0]);
      const wb = new xl.Workbook();
      const ws = wb.addWorksheet('Sheet 1');
      const style = wb.createStyle({
        font: {
          color: '#000000',
          size: 10,
        }
      });
      // The cell parameters are row and col in order
      for (let i = 0; i < keys.length; i++) {
        ws.cell(1, i + 1)
          .string(keys[i])
          .style(style);
      }
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < keys.length; j++) {
          ws.cell(i + 2, j + 1)
            .string(String(data[i][keys[j]]))
            .style(style);
        }
      }
      await wb.write(this.getOutputFilePath(filename));
      if (response instanceof http.ServerResponse) {
        await wb.write(filename, response);
      }
    } catch (error) {
      console.log('Unable to process data.');
      throw error;
    }
  }
}

