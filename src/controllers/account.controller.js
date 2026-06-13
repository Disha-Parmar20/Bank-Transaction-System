const accountModel=require("../models/account.model")

//user ki id ke sth account create and send the account in respond
async function createAccountController(req,res){
    const user=req.user;
     
    const account=await accountModel.create({
        userId:user._id
    })
    res.status(201).json({
        account
    })
}
module.exports={createAccountController};