export const checkToken = (req, res, next) => {
    console.log("👉 Incoming Authorization Header:", req.headers.authorization);
    next();
  }