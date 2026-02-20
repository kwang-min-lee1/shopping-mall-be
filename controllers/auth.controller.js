const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const JWT_SECRET_KEY=process.env.JWT_SECRET_KEY;

const authController = {}

authController.loginWithEmail=async(req, res)=>{
    try{
        const {email,password} = req.body;
        let user = await User.findOne({email});
        if(user){
            const isMatch = await bcrypt.compare(password, user.password)
            if(isMatch){
                // token
                const token = await user.generateToken()
                return res.status(200).json({ status:"success", user, token});
            }
        }
        throw new Error("invalid email or password");
    }catch(error){
        res.status(400).json({ status:"fail", error:error.message});
    }
};

authController.authenticate = async (req,res,next)=>{
    try{
        const tokenString = req.headers.authorization;
        if(!tokenString) throw new Error("Token not found");
        const token = tokenString.replace("Bearer ","");
        jwt.verify(token,JWT_SECRET_KEY,(error,payload)=>{
            if (error) return res.status(400).json({ status:"fail", error:"invalid token" });  // 오류로 강사와 다르게 수정함
            // if(error) throw new Error("invalid token");
            req.userId = payload._id;
            return next();
        });
       
    }catch(error){
        res.status(400).json({status:"fail", error:error.message});
    }
} 

authController.checkAdminPermission = async(req,res,next)=>{
    try{
        const {userId} =req;
        const user = await User.findById(userId);

        if (!user) throw new Error("user not found");  // 오류로 인해 개인적으로 추가한 코드

        if(user.level !== "admin") throw new Error("no permission");
        return next();

    }catch(error){
        res.status(400).json({status:"fail",error: error.message});
    }
};

module.exports = authController;