
const mongoose  = require("mongoose");
const slugify = require("slugify");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    title : {
        type :String,
        required :[true,"please provide a title"],
        minlength : [10,"please provide a title at least 10 characters"],
        unique : true
    },
    content : {
        type :String,
        required:[true,"please provide a content"],
        minlength : [20,"please provide a title at least 20 characters"]

    },
    slug : String,
    createdAt: {
        type : Date,
        default : Date.now
    },
    user : {
        type : mongoose.Schema.ObjectId,
        required: true,
        ref : "user" 
    },
    likeCount : {
        type : Number,
        default : 0
    },
    likes: [
        {
            type : mongoose.Schema.ObjectId,
            ref : "user"
        }
    ],
    answerCount : {
        type : Number,
        default : 0
    },
    answers : [
        {
            type: mongoose.Schema.ObjectId,
            ref : "answer"
        }
    ]
});

QuestionSchema.pre("save",function(next){
    if(!this.isModified("title")){
        next();
    }
    this.slug = this.makeSlug();
    next();
});
QuestionSchema.methods.makeSlug = function(){
    return slugify(this.title, {
        replacement: '-',  
        remove: /[*+~.()'"!:@]/g ,
        lower: true  
      });
};

module.exports = mongoose.model("question",QuestionSchema);