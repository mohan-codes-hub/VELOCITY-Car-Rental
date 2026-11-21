
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Booking = require("./Booking.cjs");
const Car = require("./Car.cjs");

const router = express.Router();

// =====================================
// ADMIN AUTHENTICATION
// =====================================

const requireAdmin = (req, res, next) => {
  const token = req.cookies?.velocity_admin;

  if (!token) {
    return res.status(401).json({
      message: "Admin login required.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid admin session.",
    });
  }
};

// =====================================
// CUSTOMER: CREATE BOOKING
// =====================================

router.post("/", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      carId,
      pickupDate,
      returnDate,
      pickupLocation,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !carId ||
      !pickupDate ||
      !returnDate ||
      !pickupLocation
    ) {
      return res.status(400).json({
        message: "Please fill in all booking details.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({
        message: "Invalid car selected.",
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Enter a valid 10-digit phone number.",
      });
    }

    const pickup = new Date(`${pickupDate}T00:00:00`);
    const returned = new Date(`${returnDate}T00:00:00`);

    if (
      Number.isNaN(pickup.getTime()) ||
      Number.isNaN(returned.getTime()) ||
      returned <= pickup
    ) {
      return res.status(400).json({
        message: "Please select valid booking dates.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickup < today) {
      return res.status(400).json({
        message: "Pickup date cannot be in the past.",
      });
    }

    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        message: "Selected car was not found.",
      });
    }

    if (car.availability === false) {
      return res.status(400).json({
        message: "This car is currently unavailable.",
      });
    }

    const rentalDays = Math.ceil(
      (returned - pickup) / (1000 * 60 * 60 * 24)
    );

    const pricePerDay = Number(car.pricePerDay);

    if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
      return res.status(400).json({
        message: "Invalid car rental price.",
      });
    }

    const totalAmount = rentalDays * pricePerDay;

    const booking = await Booking.create({
      customer: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      },
      car: car._id,
      carName: `${car.name} ${car.model || ""}`.trim(),
      pickupDate: pickup,
      returnDate: returned,
      pickupLocation: pickupLocation.trim(),
      rentalDays,
      pricePerDay,
      totalAmount,
      status: "Pending",
    });

    res.status(201).json({
      message: "Booking submitted successfully!",
      booking,
    });

  } catch (error) {
    console.error("Create Booking Error:", error);

    res.status(500).json({
      message: "Unable to submit booking.",
    });
  }
});

// =====================================
// ADMIN: GET ALL BOOKINGS
// =====================================

router.get("/", requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("car", "name model image pricePerDay")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);

  } catch (error) {
    console.error("Fetch Bookings Error:", error);

    res.status(500).json({
      message: "Unable to fetch bookings.",
    });
  }
});

// =====================================
// ADMIN: GET SINGLE BOOKING
// =====================================

router.get("/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("car", "name model image pricePerDay");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    res.status(200).json(booking);

  } catch (error) {
    console.error("Single Booking Error:", error);

    res.status(500).json({
      message: "Unable to fetch booking.",
    });
  }
});

// =====================================
// ADMIN: UPDATE BOOKING STATUS
// =====================================

router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    res.status(200).json({
      message: "Booking status updated successfully!",
      booking,
    });

  } catch (error) {
    console.error("Update Booking Error:", error);

    res.status(500).json({
      message: "Unable to update booking status.",
    });
  }
});

module.exports = router;
