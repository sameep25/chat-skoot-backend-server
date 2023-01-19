// in middleware functions we take 3 arg (req ,res and next)
// after main logic is completed then move to next logic

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl} `);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
