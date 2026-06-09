//server ke instance ko create krna, and strts in server.js
//server ko config krna (kitne middlewares) and kitne types ke Apis hone wle hai
const express=require("express");
const cookieParser= require("cookie-parser")
const authRouter=require("./routes/auth.routes")

const app=express();

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)

module.exports=app;