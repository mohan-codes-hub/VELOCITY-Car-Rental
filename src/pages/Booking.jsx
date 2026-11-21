
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  UserRound,
  CarFront,
  CheckCircle,
  LoaderCircle,
} from "lucide-react";
import "./Booking.css";

const API_URL = "http://localhost:5000";

function Booking() {
  const location = useLocation();

  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    pickupDate: "",
    returnDate: "",
    pickupLocation: "",
  });

  const today = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch(`${API_URL}/api/cars`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Unable to load cars");
        }

        setCars(data);

        // If a car was passed from another page, select it.
        const passedCar = location.state?.car;
        if (passedCar) {
          const carId = passedCar._id || passedCar.id;
          const matchingCar = data.find(
            (car) => car._id === carId
          );

          if (matchingCar) {
            setSelectedCar(matchingCar._id);
          }
        }
      } catch (err) {
        setError("Could not load cars. Please refresh the page.");
      }
    };

    fetchCars();
  }, [location.state]);

  const selectedCarDetails = cars.find(
    (car) => car._id === selectedCar
  );

  const rentalDays =
    formData.pickupDate && formData.returnDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(`${formData.returnDate}T00:00:00`) -
              new Date(`${formData.pickupDate}T00:00:00`)) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const estimatedAmount =
    selectedCarDetails && rentalDays > 0
      ? rentalDays * Number(selectedCarDetails.pricePerDay || 0)
      : 0;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!selectedCar) {
      setError("Please select a car.");
      return;
    }

    if (new Date(formData.returnDate) <= new Date(formData.pickupDate)) {
      setError("Return date must be after pickup date.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          carId: selectedCar,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed.");
      }

      setMessage(
        `Booking request submitted successfully! Booking ID: ${data.booking._id}`
      );

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        pickupDate: "",
        returnDate: "",
        pickupLocation: "",
      });

      setSelectedCar("");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="booking-page">
      <div className="booking-heading">
        <span>VELOCITY EXPERIENCE</span>
        <h1>BOOK YOUR DRIVE</h1>
        <p>Your next journey starts here.</p>
      </div>

      <div className="booking-container">
        <div className="booking-car-panel">
          <div className="booking-car-top">
            <span>01 / YOUR VEHICLE</span>
            <CarFront size={21} />
          </div>

          {selectedCarDetails ? (
            <>
              <div className="booking-car-image">
                {selectedCarDetails.image ? (
                  <img
                    src={`${API_URL}${selectedCarDetails.image}`}
                    alt={selectedCarDetails.name}
                  />
                ) : (
                  <CarFront size={100} strokeWidth={1} />
                )}
              </div>

              <div className="booking-car-info">
                <span>SELECTED VEHICLE</span>
                <h2>{selectedCarDetails.name}</h2>
                <p>{selectedCarDetails.model}</p>
                <div className="booking-price">
                  <strong>
                    ₹{Number(selectedCarDetails.pricePerDay || 0).toLocaleString("en-IN")}
                  </strong>
                  <span>/ day</span>
                </div>
              </div>
            </>
          ) : (
            <div className="booking-car-empty">
              <CarFront size={72} strokeWidth={1} />
              <h2>Choose Your Car</h2>
              <p>Select your preferred vehicle to continue.</p>
            </div>
          )}

          <div className="booking-car-note">
            <span className="booking-note-dot"></span>
            Premium driving experience
          </div>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="booking-form-heading">
            <span>02 / BOOKING INFORMATION</span>
            <h2>Reservation Details</h2>
            <p>Fill in your details to reserve your vehicle.</p>
          </div>

          <div className="booking-field">
            <label>SELECT YOUR CAR</label>
            <select
              value={selectedCar}
              onChange={(event) => setSelectedCar(event.target.value)}
              required
            >
              <option value="">Choose a vehicle</option>
              {cars.map((car) => (
                <option key={car._id} value={car._id}>
                  {car.name} {car.model}
                </option>
              ))}
            </select>
          </div>

          <div className="booking-section-title">
            <UserRound size={17} />
            <h3>Personal Details</h3>
          </div>

          <div className="booking-field">
            <label>FULL NAME</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="booking-two-fields">
            <div className="booking-field">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="booking-field">
              <label>PHONE NUMBER</label>
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
                pattern="[0-9]{10}"
                title="Enter a valid 10-digit phone number"
                required
              />
            </div>
          </div>

          <div className="booking-section-title">
            <CalendarDays size={17} />
            <h3>Booking Details</h3>
          </div>

          <div className="booking-two-fields">
            <div className="booking-field">
              <label>PICKUP DATE</label>
              <input
                type="date"
                name="pickupDate"
                min={today}
                value={formData.pickupDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="booking-field">
              <label>RETURN DATE</label>
              <input
                type="date"
                name="returnDate"
                min={formData.pickupDate || today}
                value={formData.returnDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="booking-field">
            <label>PICKUP LOCATION</label>
            <div className="booking-location-input">
              <MapPin size={17} />
              <input
                type="text"
                name="pickupLocation"
                placeholder="Enter pickup location"
                value={formData.pickupLocation}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {rentalDays > 0 && selectedCarDetails && (
            <div className="booking-estimate">
              <span>Estimated total ({rentalDays} day{rentalDays > 1 ? "s" : ""})</span>
              <strong>₹{estimatedAmount.toLocaleString("en-IN")}</strong>
            </div>
          )}

          {error && <p className="booking-error">{error}</p>}
          {message && (
            <p className="booking-success">
              <CheckCircle size={17} />
              {message}
            </p>
          )}

          <button
            type="submit"
            className="booking-submit"
            disabled={loading || cars.length === 0}
          >
            {loading ? (
              <>
                <LoaderCircle className="booking-spinner" size={18} />
                SUBMITTING...
              </>
            ) : (
              "CONFIRM BOOKING"
            )}
          </button>

          <p className="booking-secure-note">
            Your booking details will be securely submitted.
          </p>
        </form>
      </div>
    </section>
  );
}

export default Booking;
