const mongoose  = require("mongoose");
const Question = require("./question");
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    content : {
        type : String,
        required : [true,"please provide a content"],
        minlength : [10,"please porvide a content at least 10 characters"],
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    likes : [
        {
           type : mongoose.Schema.ObjectId,
            ref : "user"
        }
    ],
    user : {
        type : mongoose.Schema.ObjectId,
        ref : "user",
        required : true
    },
    question : {
        type : mongoose.Schema.ObjectId,
        ref : "question",
        required : true
    }
});
AnswerSchema.pre("save",async function(next){
    if(!this.isModified("user")) return next();
    try{
          
        const question = await Question.findById(this.question);

        question.answers.push(this._id);
        question.answerCount = question.answers.length;

        await question.save();

        next();

    }
    catch(err){
        return next(err);
    }
    
})

module.exports = mongoose.model("answer",AnswerSchema);