const express = require("express");
const router = express.Router();
const db = require('./connection/conn');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const UserAuthenticate = require('./middleware/UserAuthenticate');

// get all voters

router.get("/",(req,res)=>{
    db.query("SELECT * FROM voters",(err,results)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json(results);
    })
});

// Get specifci voter id

router.get("/:id",(req,res)=>{
    const id = req.params.id * 1;
    const getQuery = `SELECT * FROM voters WHERE id =?`;
    db.query(getQuery,[id],(err,results)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            res.status(500).json({message:`Internal Server Error!`})
        }        
        return res.status(200).json(results);
    })
});

// create signup for voters

router.post("/signup", async(req,res)=>{
    const { name,email,pass } = req.body;
    const checkEmail = await checkEmailExists(email);
    if(checkEmail){
        return res.status(409).json({message:`Sorry, Email already Exist!`})
    }
    
    const hashedPassword = await bcrypt.hash(pass,10)
    const insertQuery = `INSERT INTO voters(name,email,pass) VALUES (?,?,?)`;
    db.query(insertQuery,[name,email,hashedPassword],(err,results)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json({message: `voter created success!`,results})
    })
});

// login for the voter

router.post("/signin",async(req,res)=>{
    const { email, pass } = req.body;
    const checkEmail = await checkEmailExists(email);
    if(!checkEmail){
        return res.status(403).json({message: `Email is not Exist!`})
    }
    const query = `SELECT * FROM voters WHERE email=?`;
    db.query(query,[email],async(err,results)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        const voter = results[0];
        const checkPassword = await bcrypt.compare(pass,voter.pass);
        if(!checkPassword){
            return res.status(401).json({message:`Password is incorrect!`});
        }
        const token = jwt.sign(
            {id:voter.id,name:voter.name,email:voter.email},
             SECRET_KEY,
             {expiresIn:'1h'}
        )
        return res.status(200).json({message:`voter logged in success!`,token})
    })
    
});

// update voter

router.put('/:id',UserAuthenticate,async(req,res)=>{
    const id = req.params.id * 1;
    const { name,email,pass } = req.body;
    const hashedPassword = await bcrypt.hash(pass,10);
    
    if(req.decoded.id !== id){
        return res.status(401).json({message: `You have no permissions to update`})
    }
    const updateQuery = `update voters set name=?,email=?, pass=? where id =?`;
    db.query(updateQuery,[name,email,hashedPassword,id],(err,result)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json({message:`voter updated success`,result})
    })
});

// delete voter

router.delete('/:id',(req,res)=>{
    const id  = req.params.id * 1;
    const deleteQuery = `delete from voters where id=?`;
    db.query(deleteQuery,[id],(err,result) => {
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json({message:'Admin deleted success!'})
    })
})

async function checkEmailExists(email){
    return new Promise((reslove,reject)=>{
        const checkEmail = `SELECT COUNT(*) AS count FROM voters WHERE email =?`;
        db.query(checkEmail,[email],(err,result)=>{
            if(err){
                console.error(`Error Fetching Data!`,err);
                reject(err);
            }
            reslove(result[0].count > 0);
        })
    })
}


module.exports = router;