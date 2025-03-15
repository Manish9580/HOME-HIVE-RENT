
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js"); 
const listingsRouter=require("./routes/listing.js")
const reviewsRouter=require("./routes/review.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const user=require("./models/user.js");
const userRouter=require("./routes/user.js")

if(process.env.NODE_ENV !="production"){
    require('dotenv').config()
}
console.log(process.env.SECRET);



// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;

// Database connection
async function main() {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");
}
main().catch((err) => console.log(err));

// App configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("error in mongo session store",err);
})
//session configuration
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly:true
    },
};

// Root route
// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(user.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currentUser=req.user;
    next();
})

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new user({
//         email:"mano23@gmail.com",
//         username:"manish",
//     });
//     let registerUser=await user.register(fakeUser,"hellowword");
//     res.send(registerUser);
// })



 app.use("/listings",listingsRouter);
 app.use("/listings/:id/reviews",reviewsRouter)
 app.use("/",userRouter);


// Handle invalid routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Global error handler
// app.use((err, req, res, next) => {
//     const { statusCode = 500, message = "Something went wrong" } = err;
//     res.status(statusCode).render("error.ejs", { message });
// });

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { err });
});


// Start server
app.listen(1100, () => {
    console.log("Server is listening on port 1100");
});
