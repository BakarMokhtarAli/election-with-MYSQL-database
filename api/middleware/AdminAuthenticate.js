const SECRET_KEY=process.env.SECRET_KEY;
const jwt = require('jsonwebtoken');


function AdminAuthenticate(req,res,next){
    const token = req.headers.authorization;
    if(!token){
        return res.status(404).json({message:'Authorization Failled - try Again!'})
    }
    
    const tokenWithOutBearer = token.split(" ")[1];

    jwt.verify(tokenWithOutBearer,SECRET_KEY,(err,decoded) => {
        if(err){
            return res.status(404).json({message:`invalid token!`})
        }
        req.decoded = decoded;
        next();
    })
}

module.exports = AdminAuthenticate;