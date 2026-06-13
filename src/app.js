//server ke instance ko create krna, and strts in server.js
//server ko config krna (kitne middlewares) and kitne types ke Apis hone wle hai
const express=require("express");
const cookieParser= require("cookie-parser")

const app=express();

app.use(express.json())
app.use(cookieParser())

 //ROUTES required
const authRouter=require("./routes/auth.routes")
const accountRouter=require("./routes/account.routes")
const transactionRoutes=require("./routes/transaction.routes")

  //use Routes

  app.get("/",(req,res)=>{
    res.send("ledger service is up and running")
  })
app.use("/api/auth", authRouter)
app.use("/api/accounts", accountRouter)
app.use("/api/transactions",transactionRoutes)

module.exports=app;