require("dotenv").config({ path: "./src/.env" });   //to use process.env.MONGO_URI

const connectToDB=require("./config/db.js")
const app=require("./app.js");

connectToDB();

app.listen(3000,()=>{
    console.log("server is running on port 3000")
});