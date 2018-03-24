var express = require('express');
var multer = require('multer');
var bcrypt = require('bcrypt');
const expressValidator = require('express-validator');
var passport = require('passport');
var path = require('path');
var fs = require('fs');
var router = express.Router();

// set storage engine
const storage = multer.diskStorage({
  destination: './public/displaypics',
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    
  }
});

var currUserEmail = null;

const upload = multer({
  storage: storage,
  limits: {fileSize: 1000000}
}).single('pic');

router.get('/', authenticationMiddleware(), function(req, res){
  // console.log(req.user);
  // console.log(req.isAuthenticated());

  const db = require('../db.js');

  // console.log(req.user);

  if(req.user.user_type == 'student'){
    db.query('SELECT first_name, photo FROM student WHERE student_id = (?)', [req.user.user_id], (err, results, fields) => {
      if(err) throw err;
      var pic = results[0].photo;
      var fname = results[0].first_name;

      db.query('SELECT course_name, course_code FROM course INNER JOIN student ON course.semester = (SELECT semester FROM student WHERE student_id = (?)) AND course.dept_id = (SELECT dept_id FROM student WHERE student_id = (?)) WHERE student_id = (?)', [req.user.user_id, req.user.user_id, req.user.user_id], (err, results, fields) =>{

        var courses = results;

        db.query('select faculty.first_name, course.course_name from ((faculty inner join course on faculty.faculty_id = course.faculty_id) inner join student on student.semester = course.semester) where student.student_id = (?)', [req.user.user_id], (err, results, fields) => {
          
          res.render('home', { title: 'Home', pic: pic, name: fname, usertype: req.user.user_type, courses: courses, teachers: results });
        });
        
      });
      
    });
  }else if(req.user.user_type == 'faculty'){
    db.query('SELECT first_name, photo FROM faculty WHERE faculty_id = (?)', [req.user.user_id], (err, results, fields) => {
      if(err) throw err;
      
      var pic = results[0].photo;
      var fname = results[0].first_name;

      db.query('select course_name, course_code from course inner join faculty on course.faculty_id = (?)', [req.user.user_id], (err, results, fields) =>{

        res.render('home', { title: 'Home', pic: pic, name: fname, usertype: 'faculty', courses: results });
      });
    });
  }
  
  
});

router.get('/login', function(req, res, next) {
  if(req.query.error == 1){
    res.render('login', { title: 'epicLMS - Login', error: 'Unable to login' });
  }else{
    if(req.isAuthenticated()){
      res.redirect('/');
    }else{
      res.render('login', { title: 'epicLMS - Login', error: null });
    }
  }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login?error=1'
}));

router.get('/logout', function(req, res, next){
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

router.get('/signup', function(req, res, next) {
  if(req.isAuthenticated()){
    res.redirect('/');
  }else{
    res.render('signup', { title: 'epicLMS - Signup', errors: null });
  }
});

const saltRounds = 10;

router.post('/signup', function(req, res){
  
  upload(req, res, (err) => {
    var pic = '';
    // console.log('img uploaded.');
    // console.log(req.file.filename);
    if(req.file == undefined)
      pic = 'default.jpg';
    else    
      pic = req.file.filename;


    req.checkBody('fname', 'First name cannot be empty').notEmpty();
    req.checkBody('lname', 'Last name cannot be empty').notEmpty();
    req.checkBody('email', 'The email you entered is invalid. Please try again.').isEmail();
    req.checkBody('password', 'Password must be between 5-100 characters long.').len(5,100);
    req.checkBody('password2', 'Passwords do not match, please try again.').equals(req.body.password);
    

    const errors = req.validationErrors();

    if(errors){
      // console.log(`errors: ${JSON.stringify(errors)}`);
      if(req.file != undefined){
        fs.unlink(path.join('public', 'displaypics', req.file.filename), (err) => {
          if (err) throw err;
        });
      }
      res.render('signup', { title: 'epicLMS - Signup', errors: errors });
    }else{
      // console.log(req.body);
      var fname = req.body.fname;
      var lname = req.body.lname;
      var password = req.body.password;
      var email = req.body.email;
      var dept = req.body.dept;
      var semester = req.body.semester;


      const db = require('../db.js');


      var usertype = req.body.usertype.toLowerCase();

      var sqlArr = [fname, lname, email, dept, pic];
      if(usertype === 'student'){
        sqlArr.push(semester);
        var query = 'INSERT INTO student(first_name, last_Name, email, dept_id, photo, semester) VALUES (?, ?, ?, ?, ?, ?)';
      }else if(usertype === 'faculty'){
        var query = 'INSERT INTO faculty(first_name, last_Name, email, dept_id, photo) VALUES (?, ?, ?, ?, ?)';
      }

        db.query(query, sqlArr, function (error, results, fields) {
          if (error) {
            //console.log(error);
            if (error.errno == 1062){
              var err = [{
                msg: "User already exists."
              }];
              if(req.file != undefined){
                fs.unlink(path.join('public', 'displaypics', req.file.filename), (err) => {
                  if (err) throw err;
                });
              }
              res.render('signup', { title: 'epicLMS - Signup', errors: err });
            }
          }else{
            bcrypt.hash(password, saltRounds, function(err, hash) {
              db.query('UPDATE ' + usertype + ' SET password = (?) WHERE email = (?)', [hash, email], function (error, results, fields) {
                if (error) throw error;
      
                db.query('SELECT LAST_INSERT_ID() as user_id', function(error, results, fields){
                  if (error) throw error;
                  const user_id = results[0];
                  res.redirect('/');
                });
      
              });
            });
          }
        });
    }
  });

  
});

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
  done(null, user_id);
});

function authenticationMiddleware () {  
	return (req, res, next) => {
		// console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	    if (req.isAuthenticated()) return next();
	    res.redirect('/login')
	}
}

module.exports = router;
