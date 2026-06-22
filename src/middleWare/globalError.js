export const globalError = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || "error";

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    error.message = `Invalid ${err.path}: ${err.value}`;
    error.statusCode = 400;
    error.status = "fail";
  }

  // 2. Mongoose Duplicate Key (MongoDB code 11000)
  if (err.code === 11000) {
    const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : "";
    error.message = `Duplicate field value: ${value}. Please use another value!`;
    error.statusCode = 409;
    error.status = "fail";
  }

  // 3. Mongoose Validation Error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el) => el.message);
    error.message = `Invalid input data. ${errors.join(". ")}`;
    error.statusCode = 400;
    error.status = "fail";
  }

  // 4. JWT Errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token. Please log in again!";
    error.statusCode = 401;
    error.status = "fail";
  }
  if (err.name === "TokenExpiredError") {
    error.message = "Your token has expired! Please log in again.";
    error.statusCode = 401;
    error.status = "fail";
  }

  if (process.env.NODE_ENV === "development") {
    console.error(err);
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      code: error.statusCode,
      stack: error.stack,
    });
  } else {
    // Production Mode
    if (err.isOperational || error.statusCode !== 500) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      // Non-operational or programming error: hide details
      console.error("ERROR 💥", err);
      res.status(500).json({
        status: "error",
        message: "Something went very wrong!",
      });
    }
  }
};