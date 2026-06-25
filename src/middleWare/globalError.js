export const globalError = (err, req, res, next) => {
  let code = err.statusCode || 500;
  let message = err.message;

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    code = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  if (process.env.NODE_ENV === "development") console.error(err.stack);

  res.status(code).json({
    status: `${code}`.startsWith("4") ? "fail" : "error",
    message,
    code,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};