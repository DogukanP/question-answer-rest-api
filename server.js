const express = require("express");
const dotenv = require("dotenv");
const connectDatabase = require("./helpers/database/connectDatabase");
const customErrorHandler = require("./middlewares/errors/customErrorHandler");
const routers = require("./routers/index");
const path = require("path");

//environment variables
dotenv.config({
    path : "./config/env/config.env"
});

// mongodb connection
connectDatabase();


const app = express();
//express-body middleware
app.use(express.json());

const PORT = process.env.PORT;

//routers middleware
app.use("/api",routers); 

//error handler 
app.use(customErrorHandler); 


// Static file

app.use(express.static(path.join(__dirname,"public")));
app.listen(PORT,() => {
    console.log(`app started on ${PORT} : ${process.env.NODE_ENV}`);
});