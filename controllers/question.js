const Question = require("../models/question");
const CustomError = require("../helpers/error/CustomError");
const asynErrorWrapper = require("express-async-handler");



const getAllQuestions = asynErrorWrapper(async(req,res,next) => {
    
    return res.status(200)
    .json(res.advanceQueryResults);
    
});
const getSingleQuestions = asynErrorWrapper(async(req,res,next) => {
    

    return res.status(200)
    .json(res.advanceQueryResults);
});
const askNewQuestion = asynErrorWrapper(async(req,res,next) => {
    const information = req.body;
    const question = await Question.create({
        ...information,
        user: req.user.id
       
    });

    res.status(200)
    .json({
        success: true,
        data : questions
    });
});

const editQuestion = asynErrorWrapper(async(req,res,next) => {
    const {id} = req.params;

    const {title,content} = req.body;
    let question = await Question.findById(id);

    question.title = title;
    question.content = content;

    question = await question.save();

    return res.status(200)
    .json({
        success : true,
        data : question
    })

    
});
const deleteQuestion = asynErrorWrapper(async(req,res,next) => {
    const {id} = req.params;

    await Question.findByIdAndDelete(id);

    res.status(200)
    .json({
        success :true,
        message : "question delete "
    })
});
const likeQuestion = asynErrorWrapper(async(req,res,next) => {
    const {id} = req.params;

    const question = await Question.findById(id);

    if(question.likes.includes(req.user.id)){
        return next(new CustomError("you already liked this question ",400));
    }
    question.likes.push(req.user.id);
    question.likeCount  = question.likes.length;

    await question.save();

    return res.status(200)
    .json({
        success : true,
        data : question
    });

    
    
});
const undoLikeQuestion = asynErrorWrapper(async(req,res,next) => {
    const {id} = req.params;

    const question = await Question.findById(id);

    if(!Question.likes.includes(req.user.id)){
        return next(new CustomError("you can not undo likes operation for this question",400));
    }
    const index = question.likes.indexOf(req.user.id);
    question.likes.splice(index,1);
    question.likeCount  = question.likes.length;
    await question.save();

    return res.status(200)
    .json({
        success : true,
        data : question
    });

    
    
});

module.exports = {
    getSingleQuestions,
    askNewQuestion,
    getAllQuestions,
    editQuestion,
    deleteQuestion,
    likeQuestion,
    undoLikeQuestion
};