const express = require('express');
const router = express.Router();
const db = require('./connection/conn');
const AdminAuthenticate = require('./middleware/AdminAuthenticate');

// create result table any time you create new candidate

router.post("/",AdminAuthenticate,(req,res)=>{
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

router.get('/',AdminAuthenticate,(req,res)=>{
    const resultsQuery = 'SELECT results.id, candidates.name AS candidate_name, votess from results JOIN candidates ON results.candidate_id = candidates.id';
    db.query(resultsQuery,(err,results)=>{
        if(err){
            console.error({message:`Error Fetching results!`,error:err.message})
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json(results);
    })
})

module.exports = router;