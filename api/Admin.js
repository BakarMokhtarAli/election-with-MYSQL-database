const express = require('express');
const router = express.Router();

const bcyrpt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY=process.env.SECRET_KEY;
const AdminAuthenticate = require('./middleware/AdminAuthenticate');

const db = require('./connection/conn');
// create admin signup

router.post('/signup',async(req,res)=>{
    const { name, email, pass } = req.body;
    const checkEmail = await checkEmailExist(email);
    if(checkEmail){
        return res.status(409).json({message:`Sorry, Email Already Exist!`})
    }
    const hashedPassword = await bcyrpt.hash(pass,10)
    const insertQuery = `insert into admin (name,email,pass) values(?,?,?)`;
    db.query(insertQuery,[name,email,hashedPassword],(err,results)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json({message:`Admin created success!`,results})
    })
});

// login admin

router.post('/signin',async(req,res)=>{
    const { email,pass } = req.body;
    const checkEmail = await checkEmailExist(email);
    if(!checkEmail){
        return res.status(401).json({message:`Invalid Email!`});
    }
    const getUserSql = `select * from admin where email=?`;
    db.query(getUserSql,[email],async(err,result)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        const admin = result[0];
        const checkPassword = await bcyrpt.compare(pass, admin.pass);

        if(!checkPassword){
            return res.status(401).json({message:`incorrect Password!`});
        }
        const token = jwt.sign(
            {id:admin.id,name:admin.name,email:admin.email},
            SECRET_KEY,
            {expiresIn:'1h'}
        )
        return res.status(200).json({message:`admin logged in success!`,token})
    })
});

// update admin

router.put('/:id',AdminAuthenticate,async(req,res)=>{
    const id = req.params.id * 1;
    const { name,email,pass } = req.body;
    const hashedPassword = await bcyrpt.hash(pass,10)
    if(req.decoded.id !== id){
        return res.status(401).json({message: `You have no permissions to update`})
    }
    const updateQuery = `UPDATE admin SET name=?,email=?, pass=? WHERE id =?`;
    db.query(updateQuery,[name,email,hashedPassword,id],(err)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json({message:`admin updated success`})
    })
});

router.delete('/:id',(req,res)=>{
    const id  = req.params.id * 1;
    const deleteQuery = `delete from admin where id=?`;
    db.query(deleteQuery,[id],(err,result) => {
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json({message:'Admin deleted success!'})
    })
})





// Helper function to check if email exist or not

async function checkEmailExist(email){
    return new Promise((resolve,reject) => {
        const query = `SELECT COUNT(*) AS count from admin WHERE email=?`;
        db.query(query,[email],(err,result)=>{
            if(err){
                console.error(`Error Fetching Data!`,err);
                reject(err)
            }

            resolve(result[0].count > 0);
        })
    })
}



module.exports = router;