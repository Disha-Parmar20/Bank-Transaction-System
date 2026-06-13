const mongoose=require("mongoose")
const ledgerModel=require("./ledger.model")

const accountSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true, "Account must be associated with a user"],
        index:true  //searching fast (B+ TREE)
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE","FROZEN","CLOSED"],
            message:"Status can be either active ,frozen or closed",
        },
         default:"ACTIVE"
    },
    currency:{
        type:String,
        required:[true, "currency is required for creating an account"],
        default:"INR"  //indian rupee
    }
},{
    timestamps:true
})

accountSchema.index({userId: 1,status:1}) //compound index create

//aggregation pipeline
accountSchema.methods.getBalance= async function(){
  const balanceData= await ledgerModel.aggregate([
    {$match:{ account : this._id}},
    {
        $group:{
            _id:null,
            totalDebit:{  //if amount=type=debit, so sum m add, else 0
                $sum:{
                    $cond:[
                       { $eq:["$type", "DEBIT"]},
                       "$amount",
                       0
                    ]
                }
            },
            totalCredit:{  //if amount=type=credit, so sum m add, else 0
                $sum:{
                    $cond:[
                       { $eq:["$type", "CREDIT"]},
                       "$amount",
                       0
                    ]
                }}
        }},{
            $project:{
              _id:0,
              balance:{$subtract:["$totalCredit","$totalDebit"]}
            }
        }
  ])

  if(balanceData.length===0){return 0}
   return balanceData[0].balance
}

const accountModel=mongoose.model("account", accountSchema)

module.exports=accountModel;