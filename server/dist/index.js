"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
https_1.default
    .createServer({
    key: fs_1.default.readFileSync("key.pem"),
    cert: fs_1.default.readFileSync("/cert.pem"),
})
    .listen(PORT, () => console.log(`[server]: Server is running at https://localhost:${PORT}`));
// app.listen(port, () => {
//   console.log(`[server]: Server is running at http://localhost:${port}`);
// });
