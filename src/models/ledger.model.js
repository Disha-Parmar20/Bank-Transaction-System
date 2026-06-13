const mongoose=require("mongoose");
const { findOneAndDelete } = require("./user.model");


const ledgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for creating a ledger entry"],
        immutable:true
    },
    transaction:{
       type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true, "ledger must be associated with a transaction"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["DEBIT","CREDIT"],
            message:"Type ca either be debit or credit"
        },
         immutable:true,
         required :[true,"Ledger type is required"]
    }
})
 
//if someone tries to modify ledger
function preventLedgerModification(){
   throw new error("Ledger entries are immutable and cannot be modified or deleted");
}

//preventions- taki galti se bhi modify naa hopaye
ledgerSchema.pre('findOneAndUpdate',preventLedgerModification);
ledgerSchema.pre('updateOne',preventLedgerModification);
ledgerSchema.pre('deleteOne',preventLedgerModification);
ledgerSchema.pre('remove',preventLedgerModification);
ledgerSchema.pre('deleteMany',preventLedgerModification);
ledgerSchema.pre('updateMany',preventLedgerModification);
ledgerSchema.pre('findOneAndDelete',preventLedgerModification);
ledgerSchema.pre('findOneAndReplace',preventLedgerModification);



const ledgerModel= mongoose.model('ledger',ledgerSchema);

module.exports=ledgerModel;