
// const express = require("express"); 
// const router = express.Router();
// const wrapAsync = require("../utils/wrapAsync.js");
// const Listing = require("../models/listing.js"); // Fixed path
// const {isLoggedIn,isOwner,validateListing}=require("../midlleware.js")

// const multer  = require('multer')
// const {storage}=require("../cloudConfig.js")
// const upload = multer({storage})


// // const {listingCntroller}=require("../controllers/listings.js")
// //is file data fetch nahi ho raha

// // Index route
// router.get(
//     "/",
//     wrapAsync(async (req, res) => {
//         const allListings = await Listing.find({});
//         res.render("listings/index", { allListings });
//     })
// );

// // New route
// router.get("/new",isLoggedIn, (req, res) => {
//     console.log(req.user);
   
//     res.render("listings/new.ejs");
// });

// // Show route
// router.get(
//     "/:id",
//     wrapAsync(async (req, res, next) => {
//         const { id } = req.params;
//         const listing = await Listing.findById(id)
//             .populate({
//                 path:"reviews",
//                 populate:{
//                     path:"author"
//                 }
//             })
//             .populate("owner");

//         if (!listing) {
//             req.flash("error", "Listing you requested does not exist");
//             return res.redirect("/listings"); // ✅ Return to stop execution
//         }

//         console.log("Listing:", listing);
//         console.log("Owner:", listing.owner); // ✅ Debugging

//         res.render("listings/show.ejs", { listing });
//     })
// );


// // Create route
// router.post(
//     "/",
//     isLoggedIn,
//     validateListing, // Use validation middleware
//     wrapAsync(async (req, res, next) => {
//         const newListing = new Listing(req.body.listing);
//         newListing.owner=req.user._id;
//         await newListing.save();
//         req.flash("success","New Listing Created");
//         res.redirect("/listings");
//     })
// );

// router.post(upload.single("listing[image]"),(req,res)=>{
//     res.send(req.file);
// })

// // Edit route
// router.get(
//     "/:id/edit",
//     isLoggedIn,isOwner,
//     wrapAsync(async (req, res) => {
//         const { id } = req.params;
//         const listing = await Listing.findById(id);
//         if (!listing) {
//             throw new ExpressError(404, "Listing not found");
//         }
//         res.render("listings/edit.ejs", { listing });
//     })
// );

// // Update route
// router.put(
//     "/:id",
//     isLoggedIn,
//     isOwner,
//     validateListing, // Use validation middleware
//     wrapAsync(async (req, res) => {
//         const { id } = req.params;
//         let listing=await Listing.findById(id);
//         await Listing.findByIdAndUpdate(id, req.body.listing);
//         req.flash("success","Listing Updated");
//         res.redirect(`/listings/${id}`);
//     })
// );

// // Delete route
// router.delete(
//     "/:id",
//     isLoggedIn,isOwner,
//     wrapAsync(async (req, res) => {
//         const { id } = req.params;
//         const deletedListing = await Listing.findByIdAndDelete(id);
//         if (!deletedListing) {
//             throw new ExpressError(404, "Listing not found");
//         }
//         req.flash("success","Listing Deleted");
//         res.redirect("/listings");
//     })
// );

// module.exports = router;



const express = require("express"); 
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js"); 
const { isLoggedIn, isOwner, validateListing } = require("../midlleware.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Index route - Get all listings
router.get(
    "/",
    wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index", { allListings });
    })
);

// New route - Show form to create new listing
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

// Show route - Display single listing
router.get(
    "/:id",
    wrapAsync(async (req, res, next) => {
        const { id } = req.params;
        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: { path: "author" },
            })
            .populate("owner");

        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }

        res.render("listings/show.ejs", { listing });
    })
);

// **Create route - Handle new listing submission with image upload**
// 
router.post(
    "/",
    isLoggedIn,
    upload.single("listing[image]"), // Keep only this
    validateListing,
    wrapAsync(async (req, res, next) => {
        if (!req.file) {
            req.flash("error", "Image upload failed!");
            return res.redirect("/listings/new");
        }

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };

        await newListing.save();
        req.flash("success", "New listing created successfully!");
        res.redirect("/listings");
    })
);


// Edit route - Show edit form
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }
        res.render("listings/edit.ejs", { listing });
    })
);

// Update route - Modify existing listing
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"), // Allow image update
    validateListing,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        let listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }

        // Update listing fields
        listing.set(req.body.listing);

        // Handle new image if uploaded
        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename,
            };
        }

        await listing.save();
        req.flash("success", "Listing updated successfully!");
        res.redirect(`/listings/${id}`);
    })
);

// Delete route - Remove listing
router.delete(
    "/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const deletedListing = await Listing.findByIdAndDelete(id);
        if (!deletedListing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }
        req.flash("success", "Listing deleted successfully!");
        res.redirect("/listings");
    })
);

module.exports = router;
