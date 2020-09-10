const express = require("express");
const {getSingleUser,getAllUsers} = require("../controllers/user");
const {checkUserExist} = require("../middlewares/database/databaseErrorHelpers");
const user = require("../models/user");
const userQueryMiddleware = require("../middlewares/query/userQueryMiddleware");
const router = express.Router();

router.get("/",userQueryMiddleware(user),getAllUsers);
router.get("/:id",checkUserExist,getSingleUser);


module.exports = router;