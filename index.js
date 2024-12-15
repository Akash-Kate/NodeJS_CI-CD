const express = require("express");
const cors = require('cors');
const app = express();
const pool = require("./db");
const adminRouter = require('./routes/Admin');
const clientRouter = require('./routes/Client');


//middleware
app.use(cors());

//getting data from client side using request.body object
app.use(express.json());

app.use('/api',adminRouter);
app.use('/api',clientRouter);


app.listen(3000,()=>{
    console.log("Server has started on port 3000");
})