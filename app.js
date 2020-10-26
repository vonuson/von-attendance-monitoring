const express = require('express');
const eventRouter = require('./routers/eventRouter');
const memberRouter = require('./routers/memberRouter');
const attendanceRouter = require('./routers/attendanceRouter');

const ApiCallLogger = require('./util/logger');
const dotenv = require('dotenv');
const connect = require('./db');
const path = require('path');

const app = express();
const logger = new ApiCallLogger();

dotenv.config({ path: './config/config.env' });

connect();

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'outputs')));
app.use(express.json());
app.use((req, res, next) => {
  logger.emit('apiCalled', { filename: logger.getLogFileName(), req, res });
  next();
})
app.use('/events', eventRouter);
app.use('/members', memberRouter);
app.use('/attendance', attendanceRouter);

app.get('/', (req, res, next) => {
  res.redirect('/events');
});

// ERROR HANDLING
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.send({
    result: 'Internal Error',
    errorMessage: err.message,
    errorStack: err.stack
  });
});

app.listen(4000, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port: ${port}`);
});

logger.on('apiCalled', logger.logApiCalls);
logger.createFile();
