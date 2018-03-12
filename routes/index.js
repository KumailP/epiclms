var express = require('express');
var mysql = require("mysql");
var bcrypt = require('bcrypt');
var router = express.Router();

var connection = mysql.createConnection({
  host  : 'localhost',
  user  : 'root',
  password  : 'root',
  database: 'epiclms'
});

connection.connect(function(err){
  if(err){
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected to MySQL');
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'epicLMS - Login' });
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'epicLMS - Signup' });
});

const saltRounds = 10;

router.post('/signup', function(req, res){
  console.log(req.body);
  
  var dept = 1;
  if(req.body.dept === 'Computer Science'){
    dept = 1;
  }else if(req.body.dept === 'Mechanical Engineering'){
    dept = 2;
  }else if(req.body.dept === 'Electrical Engineering'){
    dept = 3;
  }else if(req.body.dept === 'BBA'){
    dept = 4;
  }
  var usertype = 1;
  if(req.body.usertype === 'teacher') usertype = 2;

  var semester;
  if(usertype === 2) semester = null;
  else semester = req.body.semester;

  var pic = '';
  if(req.body.pic === '') pic = 'default.jpg';
  else pic = req.body.pic;

  var sqlArr = [req.body.fname, req.body.lname, req.body.email, dept, pic, usertype, semester];

  
  connection.query('INSERT INTO students(first_name, last_Name, email, dept, pic, user_type, semester) VALUES (?, ?, ?, ?, ?, ?, ?)', sqlArr, function (error, results, fields) {
    if (error) throw error;
    console.log("Inserted " + req.body.fname + " " + req.body.lname);
  });
  

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    connection.query('UPDATE students SET password = (?) WHERE email = (?)', [hash, req.body.email], function (error, results, fields) {
      if (error) throw error;
      console.log("Inserted hashed password.");
    });
  });

  console.log("Signed up. Redirecting...");
  res.redirect('/');
  
});

router.post('/', function(req, res){

});

module.exports = router;
