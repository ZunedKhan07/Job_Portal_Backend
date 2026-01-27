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
app.use(cookieParser())

//Routes
import userRouter from "./routes/user.route.js";
import jobRouter from "./routes/job.route.js";
import applicationRouter from "./routes/application.route.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/jobs", jobRouter)
app.use("api/v1/application", applicationRouter)

// http://localhost:PORT/api/v1/users/register

export default app