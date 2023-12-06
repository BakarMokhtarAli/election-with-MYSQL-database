const express = require("express");
const voterRouter = require('./voters');
const adminRouter = require('./Admin');
const votesRouter = require('./votes');
const candidateRouter = require('./candidate');
const resultRouter = require('./results');

const cors = require("cors");
const Server = express();
Server.use(express.json());
Server.use(cors());

Server.use("/api/voters",voterRouter);
Server.use("/api/admin",adminRouter);
Server.use("/api/votes",votesRouter);
Server.use("/api/candidates",candidateRouter);
Server.use("/api/results",resultRouter);

module.exports = Server;