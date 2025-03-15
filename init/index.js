const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

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

const initDB = async () => {
    await Listing.deleteMany({}); // Clears the collection before inserting new data

    // Corrected map function
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "67d064fc124ad41aae90b179"
    }));

    await Listing.insertMany(initData.data); // Insert modified data into DB
    console.log("✅ Data is initialized");
};

initDB();