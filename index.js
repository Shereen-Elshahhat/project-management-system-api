import { bootstrap } from "./bootstrap.js";
import express from "express";
import { DBconnection } from "./db/dbconnect.js";
import dotenv from "dotenv";
dotenv.config();

// Register process event listeners once during application startup (Issue 21-dup)
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception! Shutting down...", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection! Shutting down...", err);
});

const app = express();
const port = process.env.PORT || 3005;

bootstrap(app);
DBconnection();

app.get("/", (req, res) => {
  return res.send("Hello Project 2");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
