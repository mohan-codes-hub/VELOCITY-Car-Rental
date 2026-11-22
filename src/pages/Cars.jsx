
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import "./cars.css";

const SERVER_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const API_URL = `${SERVER_URL}/api/cars`;

function Cars() {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Unable to load cars");
        }

        const data = await response.json();

        const carList = Array.isArray(data)
          ? data
          : data.cars || data.data || [];

        setCars(carList);

        setActiveIndex(0);
      } catch (err) {
        console.error("Cars loading error:", err);
        setError("Unable to load cars. Please try again.");
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, []);

  const moveCar = (step) => {
    if (cars.length < 2) return;

    setActiveIndex((current) =>
      (current + step + cars.length) % cars.length
    );
  };

  if (loading) {
    return (
      <section className="velocity-showroom">
        <p className="empty-cars">Loading cars...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="velocity-showroom">
        <p className="empty-cars">{error}</p>
      </section>
    );
  }

  if (!cars.length) {
    return (
      <section className="velocity-showroom">
        <header className="showroom-heading">
          <div>
            <span className="showroom-brand">VELOCITY.</span>
            <p>THE ART OF AUTOMOTIVE EXCELLENCE</p>
          </div>
          <h1>FIND YOUR NEXT DRIVE</h1>
        </header>

        <p className="empty-cars">
          No cars available at the moment.
        </p>
      </section>
    );
  }

  const car = cars[activeIndex];

  const imageUrl = car.image
    ? car.image.startsWith("http") ||
      car.image.startsWith("data:")
      ? car.image
      : `${SERVER_URL}/${car.image.replace(/^\/+/, "")}`
    : "";

  return (
    <section className="velocity-showroom">

      <header className="showroom-heading">
        <div>
          <span className="showroom-brand">VELOCITY.</span>
          <p>THE ART OF AUTOMOTIVE EXCELLENCE</p>
        </div>

        <h1>FIND YOUR NEXT DRIVE</h1>
      </header>

      <main className="showroom-main">

        <button
          className="edge-arrow edge-arrow-left"
          onClick={() => moveCar(-1)}
          disabled={cars.length < 2}
          aria-label="Previous car"
        >
          <ChevronLeft size={25} />
        </button>

        <div className="selected-car-info">

          <div className="car-information">
            <span className="selected-car-label">
              NOW IN FOCUS
            </span>

            <h2 key={car._id || car.id}>{car.name}</h2>
            <h3>{car.model}</h3>

            <div className="selected-car-specs">
              <div>
                <small>MODEL YEAR</small>
                <strong>{car.year || "—"}</strong>
              </div>

              <div>
                <small>HOURLY RATE</small>
                <strong>
                  ₹{Number(car.pricePerHour || 0).toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <small>DAILY RATE</small>
                <strong>
                  ₹{Number(car.pricePerDay || 0).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <p className="car-description">
              {car.description}
            </p>

            <span
              className={`availability ${
                car.availability === "Available"
                  ? "is-available"
                  : "is-unavailable"
              }`}
            >
              <span className="status-dot"></span>
              {car.availability || "Unavailable"}
            </span>
          </div>

          <div className="car-booking-action">
            <span>READY FOR THE ROAD?</span>

            <button
              className="selected-book-button"
              disabled={car.availability !== "Available"}
              onClick={() =>
                navigate("/booking", { state: { car } })
              }
            >
              BOOK THIS CAR
              <ArrowUpRight size={20} />
            </button>

            <small>YOUR NEXT DRIVE STARTS HERE</small>
          </div>

        </div>

        <div className="showroom-stage">
          <div className="car-image-area">

            <div className="car-image-glow"></div>

            <img
              key={car._id || car.id || activeIndex}
              className="showroom-car-image"
              src={imageUrl}
              alt={car.name}
            />

            <div className="car-floor-shadow"></div>
          </div>

          <div className="stage-caption">
            <span>EXPLORE THE COLLECTION</span>
            <span>
              {String(activeIndex + 1).padStart(2, "0")}
              {" / "}
              {String(cars.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        <button
          className="edge-arrow edge-arrow-right"
          onClick={() => moveCar(1)}
          disabled={cars.length < 2}
          aria-label="Next car"
        >
          <ChevronRight size={25} />
        </button>

      </main>
    </section>
  );
}

export default Cars;
