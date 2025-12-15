import dotenv from "dotenv";
import connectDB from "./db/index.js";


dotenv.config({
    path: './env'
});

connectDB()
// Because db file me async use hua hai
.then(() => {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("❌ MONGO DB connection faild", error);  
})