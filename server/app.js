require("dotenv").config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./database');
const cors = require("cors");

var indexRouter = require('./routes/index');
var tasksRouter = require('./routes/tasks');
var usersRouter = require('./routes/users');

var app = express();

app.use(
  cors({
     origin: [
        "http://localhost:3000",
        "https://omg-todolist.onrender.com"
     ],
     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
     allowedHeaders: ["Content-Type", "Authorization"],
     preflightContinue: false,
     optionsSuccessStatus: 200,
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/tasks', tasksRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
