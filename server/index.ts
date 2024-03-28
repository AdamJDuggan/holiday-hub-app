// Node modules
const https = require("https");
const fs = require("fs");
// 3rd party libraries
import express, { Express, Request, Response } from "express";
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
// Middleware
import trustSelfSignedCerts from "./middleware/trustSelfSignedCerts";
// Services
import connectToMongo from "./services/mongo";
import apolloServer from "./services/apollo";
// Routes
const userRouter = require("./collections/users/users.route");

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

app.use("/auth", userRouter);

/**
 * Server --------------------------
 */
const startServer = async () => {
  await connectToMongo();
  await await apolloServer.start();

  // Apply Apollo Server middleware to the Express app
  apolloServer.applyMiddleware({ app });
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
