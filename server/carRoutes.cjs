
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const Car = require("./Car.cjs");

const router = express.Router();

const uploadDirectory = path.join(__dirname, "uploads");

// Create uploads folder if it does not exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Admin Authentication Middleware
const requireAdmin = (req, res, next) => {
  try {
    const token = req.cookies?.velocity_admin;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin login required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access denied",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin session",
    });
  }
};

// Delete uploaded image
const deleteUploadedImage = (imagePath) => {
  if (!imagePath || !imagePath.startsWith("/uploads/")) return;

  const filename = path.basename(imagePath);
  const fullPath = path.join(uploadDirectory, filename);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `car-${Date.now()}${extension}`);
  },
});

// Image validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG and WEBP images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Convert form values
const prepareCarData = (body) => {
  const data = { ...body };

  if (data.year === "") {
    data.year = undefined;
  } else if (data.year !== undefined) {
    data.year = Number(data.year);
  }

  if (data.pricePerHour !== undefined) {
    data.pricePerHour = Number(data.pricePerHour);
  }

  if (data.pricePerDay !== undefined) {
    data.pricePerDay = Number(data.pricePerDay);
  }

  if (data.availability !== undefined) {
    data.availability = data.availability === true ||
      data.availability === "true";
  }

  return data;
};

// Check valid MongoDB ID
const isValidCarId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};

// ========================================
// GET ALL CARS - PUBLIC
// ========================================

router.get("/", async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });

    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch cars",
    });
  }
});

// ========================================
// GET SINGLE CAR - PUBLIC
// ========================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidCarId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch car",
    });
  }
});

// ========================================
// ADD CAR - ADMIN ONLY
// ========================================

router.post(
  "/",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const carData = prepareCarData(req.body);

      if (req.file) {
        carData.image = `/uploads/${req.file.filename}`;
      }

      const car = new Car(carData);
      const savedCar = await car.save();

      res.status(201).json({
        success: true,
        message: "Car added successfully!",
        car: savedCar,
      });
    } catch (error) {
      if (req.file) {
        deleteUploadedImage(`/uploads/${req.file.filename}`);
      }

      res.status(400).json({
        success: false,
        message: error.message || "Unable to add car",
      });
    }
  }
);

// ========================================
// UPDATE CAR - ADMIN ONLY
// ========================================

router.put(
  "/:id",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidCarId(id)) {
        if (req.file) {
          deleteUploadedImage(`/uploads/${req.file.filename}`);
        }

        return res.status(400).json({
          success: false,
          message: "Invalid car ID",
        });
      }

      const existingCar = await Car.findById(id);

      if (!existingCar) {
        if (req.file) {
          deleteUploadedImage(`/uploads/${req.file.filename}`);
        }

        return res.status(404).json({
          success: false,
          message: "Car not found",
        });
      }

      const carData = prepareCarData(req.body);

      if (req.file) {
        carData.image = `/uploads/${req.file.filename}`;
      }

      const updatedCar = await Car.findByIdAndUpdate(
        id,
        carData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (req.file && existingCar.image) {
        deleteUploadedImage(existingCar.image);
      }

      res.status(200).json({
        success: true,
        message: "Car updated successfully!",
        car: updatedCar,
      });
    } catch (error) {
      if (req.file) {
        deleteUploadedImage(`/uploads/${req.file.filename}`);
      }

      res.status(400).json({
        success: false,
        message: error.message || "Unable to update car",
      });
    }
  }
);

// ========================================
// DELETE CAR - ADMIN ONLY
// ========================================

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidCarId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const deletedCar = await Car.findByIdAndDelete(id);

    if (!deletedCar) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    if (deletedCar.image) {
      deleteUploadedImage(deletedCar.image);
    }

    res.status(200).json({
      success: true,
      message: "Car deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete car",
    });
  }
});

// ========================================
// MULTER ERROR HANDLER
// ========================================

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Image size must be less than 5 MB"
        : error.message;

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next();
});

module.exports = router;
