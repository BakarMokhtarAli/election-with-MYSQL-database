const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "electtion_ms"
});

db.connect((err)=>{
    if(err){
        console.error(`Error to connect mysql database`,err)
    }
    console.log("connection success!")
});


module.exports = db;