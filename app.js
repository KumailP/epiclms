var express = require('express');
var multer = require('multer');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
const expressValidator = require('express-validator');

// authentication
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MySQLStore = require('express-mysql-session')(session);
var bcrypt = require('bcrypt');



var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

require('dotenv').config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

var options = {
  host  : process.env.DB_HOST,
  user  : process.env.DB_USER,
  password  : process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

var sessionStore = new MySQLStore(options);

app.use(session({
  secret: 'insertarandomstringhere',
  resave: false,
  store: sessionStore,
  saveUninitialized: false,
  // cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());


app.use(function(req, res, next){
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

app.use('/', index);
app.use('/users', users);

passport.use(new LocalStrategy(
  {usernameField: 'email',
  passwordField: 'password'},
  function(username, password, done) {
    // console.log(username);
    // console.log(password);

    const db = require('./db');
    db.query('SELECT student_id, password FROM student WHERE email = (?)', [username], function(err, results, fields){
      if(err) {done(err)}

      if (results.length === 0){
        db.query('SELECT faculty_id, password FROM faculty WHERE email = (?)', [username], function(err, results, fields){
          if(err) {done(err)}
    
          if (results.length === 0){
            done(null, false);
          }else{
    
            const hash = results[0].password.toString();
            bcrypt.compare(password, hash, function(err, response){
              if(response === true){
                return done(null, {user_id: results[0].faculty_id, user_type: 'faculty'});
              }else {
                return done(null, false);
              }
            });
          }
        });


      }else{

        const hash = results[0].password.toString();
        bcrypt.compare(password, hash, function(err, response){
          if(response === true){
            return done(null, {user_id: results[0].student_id, user_type: 'student'});
          }else {
            return done(null, false);
          }
        });
      }


    });

  }
));



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  
  res.render('404', { title: '404' });
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
