import { ErrorResponse } from "../core/error.response.js";

const errorHandler = (err, req, res, next) => {
  if (err instanceof ErrorResponse) return err.send(res);
  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Internal server error" });
};

export default errorHandler;
