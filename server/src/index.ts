// Node modules
import https from "https";
import fs from "fs";
// 3rd party libraries
import express, { Express, Request, Response } from "express";
import helmet from "helmet";
const cookieParser = require("cookie-parser");
import dotenv from "dotenv";
const asyncHandler = require("express-async-handler");
// Middleware
import trustSelfSignedCerts from "./middleware/trustSelfSignedCerts";
// Services
import connectToMongo from "./services/mongo";
// Models
const Goal = require("./models/goals");

dotenv.config();

/**
 * Consts --------------------------
 */
const app: Express = express();
const PORT = process.env.PORT || 3001;
const DEV = process.env.NODE_ENV === "development" ? false : true;

/**
 * Middleware --------------------------
 */
app.use(trustSelfSignedCerts);

// Secure headers
app.use(
  helmet({
    // Needed to run graphql palyground in development
    contentSecurityPolicy: DEV,
    crossOriginEmbedderPolicy: DEV,
  })
);

// Access session cookies in requests
app.use(cookieParser());

// Prevent attackers sending requests with large request bodies
app.use(express.urlencoded({ extended: false, limit: "1kb" }));
app.use(express.json({ limit: "1kb" }));

/**
 * Routes --------------------------
 */
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get(
  "/goals",
  asyncHandler(async (req: Request, res: Response) => {
    const data = await Goal.find({}).catch((err: any) => console.log(err));
    console.log(data);
    // Sending response
    res.json({ data });
  })
);

/**
 * Server --------------------------
 */
const startServer = async () => {
  await connectToMongo();
  https
    .createServer(
      {
        key: fs.readFileSync("./key.pem"),
        cert: fs.readFileSync("./cert.pem"),
      },
      app
    )
    .listen(PORT, () => console.log(`Server is running on port ${PORT}`));
};

startServer();
