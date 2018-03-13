var mysql = require("mysql");

var connection = mysql.createConnection({
    host  : process.env.DB_HOST,
    user  : process.env.DB_USER,
    password  : process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  connection.connect(function(err){
    if(err){
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected to MySQL');
  });

  module.exports = connection;