const express = require('express');
const router = express.Router();
const voterAuthenticate = require('./middleware/UserAuthenticate')
const db = require('./connection/conn');

// get all votes
router.get('/',(req,res)=>{
    const query = 'SELECT votes.id, voters.name as voter_name,candidates.name AS candidate_name FROM votes JOIN voters ON votes.voter_id = voters.id JOIN candidates ON votes.candidate_id = candidates.id'
    db.query(query,(err,results)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json(results);
    })
});

// get single votes
router.get('/:id',async(req,res)=>{
    const id = Number(req.params.id);
    const checkId = await checkIdExist(id);
    if(!checkId){
        return res.status(404).json({message: `ID ${id} is Not Found!`})
    }
    const query = `SELECT votes.id, voters.name AS voter_name,candidates.name as candidate_name FROM votes INNER JOIN voters ON votes.voter_id = voters.id INNER JOIN candidates ON votes.candidate_id = candidates.id WHERE votes.id = ?`
    db.query(query,[id],(err,results)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
                return res.status(200).json(results);
    })
});

// create vote

router.post('/',voterAuthenticate,async(req,res)=>{
    const { candidate_id } = req.body;
    const id = req.decoded.id;
    const votes = 1;
    const checkVote = await checkVoterVotes(id);
    if(checkVote){
        return res.status(401).json({message:`sorry, you already voted!`})
    }
    const query = `INSERT INTO votes(voter_id,candidate_id) VALUES(?,?)`;
    db.query(query,[id,candidate_id],(err,results)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json({message:'your vote has accepted!'});
    })
   
        const updateResultQuery = `UPDATE results SET votess = votess + 1 WHERE candidate_id =?`;
        db.query(updateResultQuery,[candidate_id],(err,results) => {
            if(err){
                console.error(`Error Fetching Data!`,err)
                return  res.status(500).json({message:`Internal Server Error!`})
            }
        })
    
});


// router.post('/vote',voterAuthenticate,(req,res)=>{
//     const { candidate_id }  = req.body;
//     const voter_id = req.decoded.id;

//     const updateVoteQuery = `UPDATE results SET votes = votes + 1 WHERE candidate_id = ?`;
//     db.query(updateVoteQuery,[c],(err,results) => {
//         if(err){
//             console.error(`Error fetching Data!`)
//             res.status(500).json({message: `Internal Server Error!`,error:err.message})
//         }
//         return res.status(200).json({message: `Voted Recorded success!`})
//     })
// })


router.get('/result',(req,res)=>{
    const getResultQuery = `SELECT r.id, c.name AS candidate_name, r.votes FROM results r JOIN candidates c ON r.candidate_id = c.id`;
    db.query(getResultQuery,(err,results) => {
        if(err){
            console.error(`Error fetching Data!`)
            res.status(500).json({message: `Internal Server Error!`,error:err.message})
        }
        return res.status(200).json(results)
    })
})

// update a vote

router.put('/:id',voterAuthenticate,async(req,res)=>{
    const id = req.params.id * 1;
    const voterId = req.decoded.id;
    const { candidate_id } = req.body;

    const checkId = await checkIdExist(id);
    if(!checkId){
        return res.status(404).json({message: `ID ${id} is Not Found!`})
    }

    const checkCandidate = await checkCandidateExist(candidate_id);
    if(!checkCandidate){
        return res.status(404).json({message: `Candidate ${candidate_id} is not Exist!`})
    }

    const updateQuery = `UPDATE votes set candidate_id =? WHERE id =? AND voter_id =?`;
    db.query(updateQuery,[candidate_id,id,voterId],(err)=>{
        if(err){
            console.error(`Error Fetching Data!`,err)
            return  res.status(500).json({message:`Internal Server Error!`})
        }
        return res.status(200).json({message:`Vote updated success!`})
    })
})



// Helper function to check if the candidate hase votes

// async function checkVotes(){
//     return new Promise((resolve,reject) => {
//         const checkVote = `SELECT COUNT(*) AS count FROM results WHERE votess > 0`;
//         db.query(checkVote,(err,result) => {
//             if(err){
//                 console.error(`an Error Accurred`,err);
//                 reject(err);
//             }
//             resolve(result[0].count > 0);
//         })
//     })
// }


// Helper function to check if voter is already voted

async function checkVoterVotes(voterId){
    return new Promise((resolve,reject) => {
        const checkVoter = `SELECT COUNT(*) AS count FROM votes WHERE voter_id=?`;
        db.query(checkVoter,[voterId],(err,result) => {
            if(err){
                console.error(`an Error Accurred`,err);
                reject(err);
            }
            resolve(result[0].count > 0);
        })
    })
}

// helper function to check if candidate is not exist in the database
async function checkCandidateExist(candidateId){
    return new Promise((resolve,reject) => {
        const checkCandidate = `SELECT COUNT(*) AS count FROM votes WHERE candidate_id=?`;
        db.query(checkCandidate,[candidateId],(err,result) => {
            if(err){
                console.error(`an Error Accurred`,err);
                reject(err);
            }
            resolve(result[0].count > 0);
        })
    })
}
// helper function to check if specific id is  exist in the database
async function checkIdExist(id){
    return new Promise((resolve,reject) => {
        const checkid = `SELECT COUNT(*) AS count FROM votes WHERE id=?`;
        db.query(checkid,[id],(err,result) => {
            if(err){
                console.error(`an Error Accurred`,err);
                reject(err);
            }
            resolve(result[0].count > 0);
        })
    })
}


module.exports = router;