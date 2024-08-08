const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path = require('path');
const Listing = require(path.join(__dirname, 'models/listing.js'));
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
main()
.then(()=>{
    console.log("connected to Db");
})
.catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
   res.send("hi I am root")
});

//index route
app.get("/listings",async(req,res)=>{
   const allListings= await Listing.find({});
   res.render("listings/index",{allListings});

});

//New route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

//show route
app.get("/listings/:id",async(req,res)=>{
 let {id}=req.params;
 let listing=await Listing.findById(id);
 res.render("listings/show.ejs",{listing});
});

// create Route
app.post("/listings", async(req,res)=>{
//    let {title,description,image,price,country,location}=req.body;
const  newListing=new Listing(req.body.listing);
await  newListing.save();
res.redirect("/listings");
});

//Edit route
app.get("/listings/:id/edit",async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
   });

   //Update route 
   app.put("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,req.body.listing);
    res.redirect(`/listings/${id}`);//show vale route me redirect ho jayega
   });

   //DELETE ROUTE
   app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
   })

// app.get("/testListing",async(req,res)=>{
//    let sampleListing=new Listing({
//     title:"My New House",
//     description:"By the beach",
//     price:1220,
//     location:"kanpur, UP",
//     country:"India",
//    });
//    await  sampleListing.save();
// console.log("sample was saved");
// res.send("successful testing");
// })


app.listen(1100,()=>{
    console.log("server is listening to port 1100");
})