const Server = require('./api/server');


const PORT = 4001;

Server.listen(PORT,()=>{
    console.log(`Server runing on port ${PORT}`)
})