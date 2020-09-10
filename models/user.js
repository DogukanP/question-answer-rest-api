const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); 
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Question = require("./question");

const UserSchema = new Schema({
    name : {
        type : String,
        required : [true,"please provide a name "]
    },
    email : {
        type : String,
        required : [true,"please provide an email"],
        unique : true,
        //email formatına uyup uymadığı
        match : [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            "please provide a valid email"
        ]
    },
    role : {
        type : String,
        default : "user",
        enum : ["user","admin"]
    },
    password : {
        type : String,
        minlength : [8,"please provide a password with min length 8"],
        required : [true,"please provide a password"],
        //verileri çektiğimizde parolanın gözükmemesi için
        select : false
    },
    createdAd : {
        type : Date,
        default : Date.now
    },
    title : {
        type : String
    },
    about : {
        type : String
    },
    place : {
        type : String
    },
    website : {
        type : String
    },
    profileImage : {
        type : String,
        default : "default.jpg"
    },
    blocked : {
        type : Boolean,
        default : false
    },
    resetPasswordToken : {
        type : String
    },
    resetPasswordExpire : {
        type : Date
    }
});
//userschema methods
UserSchema.methods.generateJwtFromUser = function(){
    const {JWT_SECRET_KEY,JWT_EXPIRE} = process.env;

    const payload = {
        id : this._id,
        name : this.name
    }

    const token = jwt.sign(payload,JWT_SECRET_KEY,{
        expiresIn : JWT_EXPIRE 
    });  
    return token;
};
UserSchema.methods.getResetPasswordTokenFromUser = function() {
    const randomHexString = crypto.randomBytes(15).toString("hex");
    const {RESET_PASSWORD_EXPIRE} = process.env;
    const resetPasswordToken = crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");
    
    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpire = Date.now() + parseInt(RESET_PASSWORD_EXPIRE) ;

    return resetPasswordToken;
}
//pre hooks
UserSchema.pre("save",function(next){
    //parola değişmemişse
    if(!this.isModified("password")){
        next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if(err) next(err);
        bcrypt.hash(this.password, salt,(err, hash) => {
            // Store hash in your password DB.
            if(err) next(err);
            this.password = hash ;
            next();
        });
    });
});
//post hooks
UserSchema.post("remove",async function(){
    await Question.deleteMany({
        user : this._id
    });
});

module.exports = mongoose.model("user",UserSchema);