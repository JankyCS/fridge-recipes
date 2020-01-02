var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require("express-session");
var mongoose = require('mongoose');
var LocalStrategy = require("passport-local").Strategy;
var User = require ('./models/user');
var bcrypt = require('bcryptjs');
var flash = require('connect-flash');
require('dotenv').config();

var indexRouter = require('./routes/index');

var app = express();


//Connecting to databse
var mongoDB = process.env.dbURL;
mongoose.connect(mongoDB, {useNewUrlParser: true});
var db = mongoose.connection;

//Binds error event (errors print to console)
db.on('error', console.error.bind(console,'MongoDB Connection Error:'))



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(flash());
app.use(session({ secret: process.env.sec, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

//Redirect To Fridge
app.get('*',
    function(req,res)
    {
        res.redirect('/fridge');
    }
);

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
