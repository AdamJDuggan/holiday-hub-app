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
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { loadFilesSync } from "@graphql-tools/load-files";
import path from "path";

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

// Function to recursively find all typeDef.ts files
function findGraphqlFiles(
  dir: string,
  extension: string,
  fileList: string[] = []
): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file: any) => {
    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      fileList = findGraphqlFiles(filePath, extension, fileList);
    } else if (file.endsWith(extension)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Find all typeDef.ts files in the collections directory and its subdirectories
const typeDefFiles = findGraphqlFiles(
  path.join(__dirname, "collections"),
  "typeDef.ts"
);

// Load and merge all found typeDef.ts files
const typeDefs = mergeTypeDefs(loadFilesSync(typeDefFiles));

// Find all typeDef.ts files in the collections directory and its subdirectories
const resolverFiles = findGraphqlFiles(
  path.join(__dirname, "collections"),
  "resolvers.js"
);

const resolvers = mergeResolvers(loadFilesSync(resolverFiles));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
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
