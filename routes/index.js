var express = require('express');
var bcrypt = require('bcrypt');
const expressValidator = require('express-validator');
var router = express.Router();



router.get('/', function(req, res){
  res.render('home', { title: 'Welcome' });
})

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'epicLMS - Login' });
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'epicLMS - Signup', errors: null });
});

const saltRounds = 10;

router.post('/signup', function(req, res){
  
  req.checkBody('fname', 'First name cannot be empty').notEmpty();
  req.checkBody('lname', 'Last name cannot be empty').notEmpty();
  req.checkBody('email', 'The email you entered is invalid. Please try again.').isEmail();
  req.checkBody('password', 'Password must be between 5-100 characters long.').len(5,100);
  req.checkBody('password2', 'Passwords do not match, please try again.').equals(req.body.password);
  

  const errors = req.validationErrors();

  if(errors){
    console.log(`errors: ${JSON.stringify(errors)}`);
    res.render('signup', { title: 'epicLMS - Signup', errors: errors });
  }else{
    console.log(req.body);
  var fname = req.body.fname;
  var lname = req.body.lname;
  var password = req.body.password;
  var email = req.body.email;
  var dept = req.body.dept;
  var semester = req.body.semester;


  const db = require('../db.js');

  if(dept === 'Computer Science'){
    dept = 1;
  }else if(dept === 'Mechanical Engineering'){
    dept = 2;
  }else if(dept === 'Electrical Engineering'){
    dept = 3;
  }else if(dept === 'BBA'){
    dept = 4;
  }
  var usertype = 1;
  if(req.body.usertype === 'teacher') usertype = 2;

  if(usertype === 2) semester = null;

  var pic = '';
  if(req.body.pic === '') pic = 'default.jpg';
  else pic = req.body.pic;

  var sqlArr = [fname, lname, email, dept, pic, usertype, semester];

  
  db.query('INSERT INTO students(first_name, last_Name, email, dept, pic, user_type, semester) VALUES (?, ?, ?, ?, ?, ?, ?)', sqlArr, function (error, results, fields) {
    if (error) throw error;
    console.log("Inserted " + fname + " " + lname);
  });
  

  bcrypt.hash(password, saltRounds, function(err, hash) {
    db.query('UPDATE students SET password = (?) WHERE email = (?)', [hash, email], function (error, results, fields) {
      if (error) throw error;
      console.log("Inserted hashed password.");
    });
  });

  console.log("Signed up. Redirecting...");
  res.redirect('/login');
  }

  
  
});


module.exports = router;
