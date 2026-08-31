import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import configDB from "./app/config/db.js";

import userRoute from "./app/Routes/userRoutes.js";
import projectRoute from "./app/Routes/projectRoutes.js";
import logsRoute from "./app/Routes/logRoutes.js";
import artifactRoute from "./app/Routes/artifactRoute.js";
import askRoute from "./app/Routes/askAIRoutes.js";
const app = express();
const port = process.env.PORT;
configDB();

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).json("Welcome to Build_Log");
});
// *-------------------------------------User Routes-----------------------------//
app.use("/api/users", userRoute);
// *-------------------------------------Project Routes--------------------------//
app.use("/api/projects", projectRoute);
// *-------------------------------------Logs Routes-----------------------------//
app.use("/api/logs", logsRoute);
// *-----------------------------------artifact Routes---------------------------//
app.use("/api/artifacts", artifactRoute);
//*------------------------------------Ask AI Routes-----------------------------//
app.use("/api/ask", askRoute);

app.listen(port, () => {
  console.log("server is running on PORT", port);
});
