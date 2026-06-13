const mongoose=require("mongoose");
const bcrypt =require("bcryptjs")

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required for creating a user"],
        trim:true,
        lowercase:true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"Invalid email address"],
        unique:[true,"Email already exists"]
    },
    name:{
         type:String,
        required:[true,"Name is required for creating an account"],
    },
    password:{
         type:String,
        required:[true,"password is required for creating an account"],
        minlength:[6,"password should contain more than 6 character"],
        select: false //pswrd will not share if query is asked to share the details (until asked)
    },
    systemUser:{
      type:Boolean,
      default:false,
      immutable:true,
      select: false
    }
    },
   { timestamps: true  }//user ka data last time kb update kiya th
)

userSchema.pre("save", async function(next){ //jb b save kroge usse phle ye function chlega
   if(!this.isModified("password")){
      return 
   }
   //agr pswrd modify hua hoga to use convert krna hoga hash m
   const hash = await bcrypt.hash(this.password, 10)
   this.password=hash

   return 
})

userSchema.methods.comparePassword = async function(password){

   return await bcrypt.compare(password, this.password)
}

const userModel= mongoose.model("user", userSchema)

module.exports=userModel;
