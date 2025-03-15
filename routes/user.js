const express = require("express");
const router = express.Router();
const user=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport=require("passport");
const {saveRedirectUrl}=require("../midlleware.js")


router.get("/signup",(req,res)=>{
   res.render("users/signup.ejs") ;
});

router.post("/signup",
    wrapAsync(async(req,res)=>{
   try{
    let {username,email,password}=req.body;
    let newUser=new user({email,username});
    const registerUser=await user.register(newUser,password);
    console.log(registerUser);
    req.login(registerUser,(err)=>{
        if(err){
            return next(err);
        }
         req.flash("success","user is registered successfully")
         res.redirect("/listings")
    });
    
   } catch(e){
    req.flash("error",e.message);
    res.redirect("/signup");
   }
}
));

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});

router.post("/login",
    saveRedirectUrl,
    passport.authenticate("local",
        {failureRedirect: "/login",
            failureFlash:true
        }) 
        ,async(req,res)=>{
     req.flash("success","Welcome Back to Wanderlust: You are logged in");
     let redirectUrl=res.locals.redirectUrl||"/listings";
     res.redirect(redirectUrl);
});

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you are loggedout");
        res.redirect("/listings");
    })
})


module.exports=router;