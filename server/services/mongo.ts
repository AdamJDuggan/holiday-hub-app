import * as dotenv from "dotenv";
const mongoose = require("mongoose");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

mongoose.connection.once("open", () => console.log("MongoDB ready"));
mongoose.connection.on("error", (err: object) =>
  console.error("MongoDB error: ", err)
);

export default async function connectToMongo() {
  await mongoose.set("strictQuery", false);
  await mongoose.connect(MONGO_URI, { writeConcern: { w: "majority" } });
}
