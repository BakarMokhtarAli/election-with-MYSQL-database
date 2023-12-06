const express = require('express');
const router = express.Router();
const db = require('./connection/conn');
const AdminAuthenticate = require('./middleware/AdminAuthenticate');


router.get("/",(req,res)=>{
    db.query(`SELECT * FROM candidates`,(err,result)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json(result);
    })
})

router.get("/:id",(req,res)=>{
    const id = Number(req.params.id);
    const query = `SELECT * FROM candidates WHERE id =?`
    db.query(query,[id],(err,result)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json(result);
    })
})
router.post("/",AdminAuthenticate,async(req,res)=>{
    const { name,email,cand_type } = req.body;    
    const checkEmail = await checkEmailExist(email);
    if(checkEmail){
        return res.status(409).json({message: 'candidate Already Exist!'});
    }
    const query = 'INSERT INTO candidates(name,email,cand_type) VALUES(?,?,?)';
    db.query(query,[name,email,cand_type],(err,result)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json({message: `candidate created success!`});
    })
});

// create result table any time you create new candidate

router.post("/results",(req,res)=>{
    const { candidate_id } = req.body;
    const vote = 0;
    const query = `INSERT INTO results (candidate_id,votess) VALUES(?,?)`;
    db.query(query,[candidate_id,vote],(err,results)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json({message: `result box created success!`});
    })
});

// Select All result data from database



router.put('/:id',AdminAuthenticate,(req,res) => {
    const id = req.params.id * 1;
    const { name, email, cand_type } = req.body;
    const update = `UPDATE candidates SET name =?, email=?, cand_type =? WHERE id =?`;
    db.query(update,[name,email,cand_type,id],(err,results) => {
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json({message: 'Candidate Updated Success!'});
    })
})















// Helper function to check if email exist or not

async function checkEmailExist(email){
    return new Promise((resolve,reject) => {
        const query = `SELECT COUNT(*) AS count from candidates WHERE email=?`;
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