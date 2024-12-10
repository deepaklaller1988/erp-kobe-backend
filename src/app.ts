import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ path: `.env` });
import setInterface from "./middlewares/interface";
import UserRouter from "./routes/auth.route";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var corsOptions = {
    origin: function (origin: any, callback: any) {
        callback(null, true);
    },
    credentials: true,
};

app.use(cors(corsOptions));

app.use(setInterface);

app.use('/api/v1/auth', UserRouter);
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
app.listen(PORT, () => {
    console.log("Server listening on port " + PORT)
});