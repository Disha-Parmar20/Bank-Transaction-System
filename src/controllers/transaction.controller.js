const transactionModel=require("../models/transaction.model")
const ledgerModel=require("../models/ledger.model")
const accountModel=require("../models/account.model")
const emailService=require("../services/email.service") 
const mongoose=require("mongoose")

/**
 * * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 *
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req,res){

    /**
     * 1. Validate request
     */
  const{fromAccount , toAccount ,amount, idemptencyKey}= req.body;
  
  //agr in chaar m se ek b property req.body k andr nhi ayi iska mtlb user ki glti h, server aage ka process nhi kr skta
   if(!fromAccount || !toAccount || !amount || !idemptencyKey){
   return res.status(400).json({
    message:"fromAccount, toAccount, amount and idempotencyKey is required"
   })
   }

   //check- ki ye fromAccount and to Account exist bhi krte hai ya nahi
   const fromUserAccount= await accountModel.findOne({
    _id:fromAccount,
   })
   const toUserAccount= await accountModel.findOne({
    _id:toAccount,
   })

   if(!fromUserAccount || !toUserAccount){
     return res.status(400).json({
    message:"invalid fromAccount or toAccount"
   })
   }

   /** 
    * 2. Validate idempotency key
   */
   const isTransactionAlreadyExists= await transactionModel.findOne({
    idempotencyKey:idemptencyKey
   })

   if(isTransactionAlreadyExists){
    if(isTransactionAlreadyExists.status === "COMPLETED"){
       return res.status(200).json({
            message:"transaction already processed",
            transaction:isTransactionAlreadyExists  //details of transaction
        })
    }
     if(isTransactionAlreadyExists.status === "PENDING"){
       return  res.status(200).json({
         message:"transaction still processing"
     })
   }
   if(isTransactionAlreadyExists.status === "FAILED"){
    return res.status(500).json({ message:"transaction processing failed previously, try again" })
    }
   if(isTransactionAlreadyExists.status === "REVERSED"){
     return res.status(500).json({ message:"transaction was reversed, try again" })
    }
}
/**
 * 3. Check account status
 */
  if(fromUserAccount.status !=="ACTIVE" || toUserAccount.status !=="ACTIVE"){
    return res.status(400).json({
        message:"Both fromAccount and toAccount must be active to process transaction"
    })
  }

  /*
  * 4. Derive sender balance from ledger
  */
 const balanceData= await fromUserAccount.getBalance()

 if(balance< amount){
    return res.status(400).json({
        message:`Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`})
 }
 /**
  * 5. Create transaction (PENDING)
  */
     const session= await mongoose.startSession()
     session.startTransaction()  //yha se jo hoga ya to poora hoga vrna step 5th se vps sb strt hoga

     const transaction =await transactionModel.create({
     fromAccount,
     toAccount,
     amount,
     idempotencyKey,
     status:"PENDING"
     },{session})

     const debitLedgerEntry= await ledgerModel.create({
        acount:fromAccount,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT"
     },{ session})

     const creditLedgerEntry= await ledgerModel.create({
        acount:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT"
     },{ session})

     transaction.status="COMPLETED"
     await transaction.save({session})

     await session.commitTransaction()
     session.endSession()

     /**
      *  10. Send email notification
      */
     await emailService.sendTransactionEmail(req.user.email, req.user.name, amount,toAccount);
        return res.status(201).json({message:"transaction successfully completed",
            transaction:transaction
        });
    
}

async function createInitialFundsTransaction(req,res){
    const{toAccount,amount, idempotencyKey}=req.body;

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(201).json({
            message:"toAccount,amount and idempotencyKey are required"
        })
    }
     const toUserAccount= await accountModel.findOne({
        _id:toAccount,
     })
     if(!toUserAccount){
        return res.status(400).json({
            message:"Invalid Account"
        })
     }
     const fromUserAccount= await accountModel.findOne({
       // systemUser:true,
       userId:req.user._id,
     })
     if(!fromUserAccount){
       return res.status(400).json({
        message:"system user account not found"
       })
     }

     const session= await mongoose.startSession()
     session.startTransaction()

     const transaction= new transactionModel({
        fromAccount:fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
     })

     const debitLedgerEntry= await ledgerModel.create([{
        account:fromUserAccount._id,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT"
     }],{session})

     const creditLedgerEntry= await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT"
     }],{session})

     transaction.status="COMPLETED"
     await transaction.save({session})

     await session.commitTransaction()
     session.endSession()

     return res.status(201).json({
        message:"initial funds transaction completed succesfully",
        transaction:transaction
     })
}

module.exports={createTransaction, createInitialFundsTransaction}