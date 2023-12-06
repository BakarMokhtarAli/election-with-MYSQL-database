const mysql = require("mysql");
require('dotenv').config();
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: "",
    database: process.env.DATABASE_NAME
});

db.connect((err)=>{
    if(err){
        console.error(`Error to connect mysql database`,err)
    }
    console.log("connection success!")
});


module.exports = db;