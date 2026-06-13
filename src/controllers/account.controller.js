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

async function getUserAccountsController(req,res){

      const accounts= await accountModel.find({userId:req.user._id});

      res.status(200).json({accounts})
}

async function getBalanceAccountController(req,res){
    const {accountId}=req.params;

    const account=await accountModel.findOne({
        _id:accountId,
        userId:req.user._id
    })

    if(!account){
        return res.status(400).json({
            message:"account not found"
        })
    }

    const balance=await account.getBalance();

    res.status(400).json({
        accountId:account._id,
        balance:balance
    })
}


module.exports={createAccountController, getUserAccountsController, getBalanceAccountController};