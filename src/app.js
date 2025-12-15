import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// .use() ka use middleware and confegration ke liye kya jata hai
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"})) // nested obj ke liye
app.use(express.static("public")) // images ko apne local par save krne ke liye
app.use(express.cookieParser())

export default app