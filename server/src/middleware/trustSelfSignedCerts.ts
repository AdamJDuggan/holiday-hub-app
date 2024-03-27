// Node modules
import fs from "fs";
// 3rd party libraries
import { NextFunction, Request, Response } from "express";

interface CustomRequest extends Request {
  options?: any;
}

export default function trustSelfSignedCerts(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  if (req.secure) {
    // Check if the request is HTTPS
    req.options = {
      ca: [fs.readFileSync("cert.pem")],
      rejectUnauthorized: true, // Enforce SSL verification
    };
  }
  next();
}
