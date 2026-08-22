import jwt from "jsonwebtoken";

export default function authenticateUser(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: "Token Will Be Required" });
  }
  try {
    const isValidToken = jwt.verify(token, process.env.SECRET_TOKEN_KEY);
    if (!isValidToken) {
      return res.status(401).json({ error: "Token Is Invalid " });
    }
    req.userId = isValidToken.userId;
    req.role = isValidToken.role;
    next();
  } catch (err) {
    console.log("Authentication Error", err.message);
    res.status(401).json({ error: err.message });
  }
}
