const authorizeUser = (permittedUser) => {
  return (req, res, next) => {
    // console.log(permittedUser);
    if (!permittedUser.includes(req.role)) {
      return res
        .status(403)
        .json({ error: "You Are not allowed to visit this page" });
    }
    next();
  };
};
export default authorizeUser;
