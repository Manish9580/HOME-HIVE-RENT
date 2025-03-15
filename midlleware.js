// const Listing=require("./models/listing");
// const Review=require("./models/review.js");
// const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("./schema.js");



// module.exports.isLoggedIn=(req,res,next)=>{
//     if(!req.isAuthenticated()){
//         req.session.redirectUrl=req.originalUral;
//         req.flash("error","you must be logged in to create listing ");
//         return res.redirect("/login");
//     }
//     next();
// }

// module.exports.saveRedirectUrl=(req,res,next)=>{
//     if(req.session.redirectUrl){
//         req.locals.redirectUrl=req.originalUral;
//     }
//     next();
// }

// module.exports.isOwner=async(req,res,next)=>{
//     const { id } = req.params;
//     let listing=await Listing.findById(id);
//     if(!listing.owner.equals(res.locals.currentUser._id)){
//         req.flash("error","You are not the owner of this listing");
//         res.redirect(`/listings/${id}`);
//     }
//     next();
// }
// // Validation middleware
// module.exports.validateListing = (req, res, next) => {
//     const { error } = listingSchema.validate(req.body);
//     if (error) {
//         const errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };

// module.exports.validateReview=(req,res,next)=>{
//     let {error}=reviewSchema.validate(req.body);
//      if(error){
//         let errMsg=error.details.map((el)=>el.message).join(",");
//         throw new ExpressError(400,errMsg); 
//      }
//      else{
//         next();
//      }
//  }

//  module.exports.isReviewAuthor = async (req, res, next) => {
//     let { id, reviewId } = req.params;
//     let review = await Review.findById(reviewId);

//     // ✅ Check if review exists
//     if (!review) {
//         req.flash("error", "Review not found!");
//         return res.redirect(`/listings/${id}`);
//     }

//     // ✅ Check if user is logged in
//     if (!res.locals.currentUser) {
//         req.flash("error", "You must be logged in to do that!");
//         return res.redirect(`/listings/${id}`);
//     }

//     // ✅ Check if the logged-in user is the review author
//     if (!review.author.equals(res.locals.currentUser._id)) {
//         req.flash("error", "You are not the author of this review");
//         return res.redirect(`/listings/${id}`);
//     }

//     next();
// };




const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; // ✅ Fixed Typo
        req.flash("error", "You must be logged in to create a listing.");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.originalUrl; // ✅ Fixed Typo
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    if (!listing.owner.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`); // ✅ Added return
    }

    next();
};

// Validation middleware
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }

    if (!res.locals.currentUser) {
        req.flash("error", "You must be logged in to do that!");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};
