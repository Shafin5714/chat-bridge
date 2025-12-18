import express from "express";
import dotenv from "dotenv";
import "colors";
import cors from "cors";
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import routes from "./routes/index.js";
import { connectDB } from "./config/db.js";
import { server, app } from "./lib/socket.js";
import morgan from "morgan";

dotenv.config();

// accept json data in body (increasing limit to 10mb)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
  // connecting to Database
  connectDB();
});
