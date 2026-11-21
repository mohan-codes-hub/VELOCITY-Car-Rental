
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 8 * 60 * 60 * 1000,
};

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    !process.env.ADMIN_USERNAME ||
    !process.env.ADMIN_PASSWORD ||
    !process.env.JWT_SECRET
  ) {
    return res.status(500).json({
      message: "Admin security settings are missing",
    });
  }

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      message: "Invalid username or password",
    });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.cookie("velocity_admin", token, cookieOptions);

  res.json({
    success: true,
    message: "Admin login successful",
  });
});

router.get("/verify", (req, res) => {
  try {
    const token = req.cookies.velocity_admin;

    if (!token) {
      return res.status(401).json({
        authenticated: false,
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(401).json({
        authenticated: false,
      });
    }

    res.json({ authenticated: true });
  } catch (error) {
    res.status(401).json({
      authenticated: false,
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("velocity_admin", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
