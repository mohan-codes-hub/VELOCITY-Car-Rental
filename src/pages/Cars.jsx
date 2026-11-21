
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import "./cars.css";

function Cars() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const loadCars = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("velocityCars") || "[]"
        );

        setCars(saved);
        setActiveIndex((current) =>
          saved.length
            ? Math.min(current, saved.length - 1)
            : 0
        );
      } catch {
        setCars([]);
      }
    };

    loadCars();
    window.addEventListener("storage", loadCars);
    window.addEventListener("focus", loadCars);

    return () => {
      window.removeEventListener("storage", loadCars);
      window.removeEventListener("focus", loadCars);
    };
  }, []);

  const moveCar = (step) => {
    if (cars.length < 2) return;

    setActiveIndex((current) =>
      (current + step + cars.length) % cars.length
    );
  };

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
        <p className="empty-cars">Add your cars from Admin.</p>
      </section>
    );
  }

  const car = cars[activeIndex];

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

        {/* LEFT OUTER ARROW */}
        <button
          className="edge-arrow edge-arrow-left"
          onClick={() => moveCar(-1)}
          disabled={cars.length < 2}
          aria-label="Previous car"
        >
          <ChevronLeft size={25} />
        </button>

        {/* LEFT CAR DETAILS */}
        <div className="selected-car-info">

          <div className="car-information">
            <span className="selected-car-label">
              NOW IN FOCUS
            </span>

            <h2 key={car.id}>{car.name}</h2>
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
              {car.availability}
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

        {/* RIGHT CAR IMAGE - NO FRAME */}
        <div className="showroom-stage">
          <div className="car-image-area">

            <div className="car-image-glow"></div>

            <img
              key={car.id ?? activeIndex}
              className="showroom-car-image"
              src={car.image}
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

        {/* RIGHT OUTER ARROW */}
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
