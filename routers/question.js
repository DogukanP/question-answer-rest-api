const express = require('express');
const Question = require("../models/question");
const { getSingleQuestions , getAllQuestions , askNewQuestion ,editQuestion ,deleteQuestion, likeQuestion, undoLikeQuestion} = require('../controllers/question');
const {  getAccessToRoute , getQuestionOwnerAccess } = require("../middlewares/authorization/auth");
const questionQueryMiddleware = require("../middlewares/query/questionQueryMiddleware");
const answerQueryMiddleware = require("../middlewares/query/answerQueryMiddleware");
const { checkQuestionExist } = require("../middlewares/database/databaseErrorHelpers");

const answer = require("./answer")
const router = express.Router();
router.get("/:id/like",[getAccessToRoute,checkQuestionExist],likeQuestion);
router.get("/:id/undo_like",[getAccessToRoute,checkQuestionExist],likeQuestion);
router.get("/",questionQueryMiddleware(
    Question,{
        population  : {
            path : "user",
            select : "name profile_image"
        }
    }
), getAllQuestions);
router.get("/:id",checkQuestionExist ,answerQueryMiddleware(Question,{
    population : [{
        path : "user",
        select : "name profile_image"
         
    },
    {
        path : "user",
        select: "content"
    }
]
}), getSingleQuestions);
router.post("/ask",getAccessToRoute,askNewQuestion);
router.put("/:id/edit",[getAccessToRoute,checkQuestionExist,getQuestionOwnerAccess],editQuestion);
router.delete("/:id/delete",[getAccessToRoute,checkQuestionExist,getQuestionOwnerAccess],deleteQuestion);
router.use("/:question_id/answers",checkQuestionExist,answer);



module.exports = router;