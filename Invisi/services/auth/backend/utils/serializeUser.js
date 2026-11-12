const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

module.exports = serializeUser;
