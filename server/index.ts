// Node modules
const https = require("https");
const fs = require("fs");
// 3rd party libraries
const cors = require("cors");
import express, { Express, Request, Response } from "express";
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const asyncHandler = require("express-async-handler");
const { ApolloServer } = require("apollo-server-express");
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

console.log(DEV);

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
const corsOptions = {
  origin: ["http://localhost:3000", "https://studio.apollographql.com"], // Specify the allowed origins
  credentials: true, // Enable credentials if your server requires authentication
};

app.use(cors(corsOptions));

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
 * Graphql --------------------------
 */

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // Enable introspection
  playground: true, // Enable the Playground
});

/**
 * Server --------------------------
 */
const startServer = async () => {
  await connectToMongo();
  await await server.start();

  // Apply Apollo Server middleware to the Express app
  server.applyMiddleware({ app });
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
