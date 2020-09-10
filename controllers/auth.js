const User = require("../models/user");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");
const {sendJwtToClient} = require("../helpers/authorization/tokenhelpers");
const sendEmail = require("../helpers/libraries/sendEmail");
const {validateUserInput , comparePassword} = require("../helpers/input/inputHelpers");
const register = asyncErrorWrapper(async(req,res,next) => {
    //POST data
    
    const {name,email,password,role} = req.body;

    //async await 
    //try catch ile haya yakalayabiliriz asenkron old. için
    //ama burada express async handler pack ini dahil ettik ve o try catch yapısını içinde bulundurduğu için try catch yazmıyoruz

    
        const user = await User.create({
            name,
            email,
            password,
            role
        });
        sendJwtToClient(user, res);    
});
const login = asyncErrorWrapper(async(req,res,next) => {
    const {email,password} = req.body;
    if(!validateUserInput(email,password)){
        return next(new CustomError("please check your inputs",400));
    }

    const user = await User.findOne({email}).select('+password');
    if (!user) next( new CustomError('Kullanıcı adı veya parolanız hatalı',400));
    if (!comparePassword(password,user.password)) next( new CustomError('Kullanıcı adı veya parolanız hatalı',400));

    sendJwtToClient(user,res);
});
const logout = asyncErrorWrapper(async(req,res,next) => {
    const { NODE_ENV } = process.env ;
    return res.status(200)
    .cookie({
        httpOnly : true ,
        expires : new Date(Date.now()),
        secure : NODE_ENV === "development" ? false :true
    }).json({
        success : true ,
        message : "logout successfull"
    })
});

const getUser = (req,res,next) => {
    res.json({
        success: true,
        data : {
            id : req.user.id ,
            name : req.user.name
        }
    })
};
const imageUpload = asyncErrorWrapper(async(req,res,next) => {
    const user = await User.findByIdAndUpdate(req.user.id,{
        "profile_image" : req.savedProfileImage
    },{
        new : true ,
        runValidators : true
    });
    res.status(200)
    .json({
        success : true ,
        message : "image upload successfull",
        data : user
    })
});
const forgotPassword = asyncErrorWrapper(async(req,res,next) => {
    const resetEmail = req.body.email ;
    const user = await User.findOne({email : resetEmail});
    if(!user){
        return next(new CustomError("There is no user with that email",400));
    }
    const resetPasswordToken = user.getResetPasswordTokenFromUser();

    await user.save();

    const resetPasswordUrl = ` http://localhost:5000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}` ;
    const emailTemplate = ` 
        <h3>Reset Your Password</h3>
        <p>This <a href = '${resetPasswordUrl}' target = '_blank'>link</a> will expire in 1 hour.</p>
    `;

    try {
        await sendEmail({
            from : process.env.SMTP_USER,
            to : resetEmail ,
            subject : "reset your password",
            html : emailTemplate
        });
        return res.status(200).json({
            success : true,
            message : "token sent to your email"
        });
        
    }
    
    catch(err){
        user.resetPasswordToken =undefined;
        user.resetPasswordExpire =undefined;
        // console.log(err);

        await user.save();

        return next(new CustomError("email could not be sent",500));
        
        
    };
    

    
});
const resetPassword = asyncErrorWrapper(async(req,res,next) => {
    const {resetPasswordToken} = req.query;

    const{password} = req.body;

    if(!resetPasswordToken) {
        return next(new CustomError("please provide a valid token",400));

    }
    let user = await User.findOne({
         resetPasswordToken : resetPasswordToken,
         resetPasswordExpire : {$gt : Date.now()}
    });
    if (!user) {
        return next(new CustomError("Invalid Token or Session Expired",404));
    }
    user.password = password ;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return res.status(200)
    .json({
        success : true,
        message : "reset password process succesfull"
    });
});

const editDetails = asyncErrorWrapper(async(req,res,next) => {
    const editInformation = req.body;

    const user = await User.findByIdAndUpdate(req.user.id,editInformation,{
        new:true,
        runValidators:true
    });
    return res.status(200).json({
        success : true,
        data : user
    })
});

module.exports = {
    register,
    login,
    logout,
    getUser,
    imageUpload,
    forgotPassword,
    resetPassword,
    editDetails
};