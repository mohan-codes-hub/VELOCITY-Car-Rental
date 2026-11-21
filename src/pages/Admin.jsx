
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CarFront,
  CalendarDays,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Menu,
  Gauge,
  CheckCircle,
  CircleAlert,
  ImagePlus,
  RefreshCw,
  Upload,
  LogOut,
  Clock,
  IndianRupee,
  UserRound,
  MapPin,
  Phone,
  Mail,
  Eye,
} from "lucide-react";
import "./Admin.css";

const SERVER_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = `${SERVER_URL}/api/cars`;
const BOOKING_API = `${SERVER_URL}/api/bookings`;

const emptyForm = {
  name: "",
  model: "",
  year: "",
  pricePerHour: "",
  pricePerDay: "",
  description: "",
  availability: true,
};

function imageUrl(image) {
  if (!image) return "";
  return image.startsWith("http") ? image : `${SERVER_URL}${image}`;
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function Admin() {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");

  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingFilter, setBookingFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [updatingBooking, setUpdatingBooking] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // =====================================
  // ADMIN LOGOUT
  // =====================================

  const handleLogout = async () => {
  try {
    const response = await fetch(
      `${SERVER_URL}/api/auth/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      navigate("/admin-login", { replace: true });
    } catch (error) {
      alert("Unable to logout. Please try again.");
    }
  };

  // =====================================
  // FETCH CARS
  // =====================================

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load cars");
      }

      setCars(await response.json());
    } catch (err) {
      setError(
        "Cannot connect to server. Check whether backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // FETCH BOOKINGS
  // =====================================

  const fetchBookings = async () => {
    try {
      setBookingLoading(true);
      setBookingError("");

      const response = await fetch(BOOKING_API, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load bookings."
        );
      }

      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    fetchCars();
    fetchBookings();
  }, []);

  const handleRefresh = () => {
    fetchCars();
    fetchBookings();
  };

  // =====================================
  // CAR STATISTICS
  // =====================================

  const availableCars = cars.filter(
    (car) => car.availability
  );

  const unavailableCars = cars.filter(
    (car) => !car.availability
  );

  const filteredCars = cars.filter((car) =>
    `${car.name} ${car.model}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // =====================================
  // BOOKING STATISTICS
  // =====================================

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "Pending"
  );

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "Confirmed"
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "Cancelled"
  );

  const totalRevenue = confirmedBookings.reduce(
    (total, booking) =>
      total + Number(booking.totalAmount || 0),
    0
  );

  const filteredBookings = bookings.filter((booking) => {
    const customerName =
      booking.customer?.fullName || "";

    const customerPhone =
      booking.customer?.phone || "";

    const carName =
      booking.car?.name ||
      booking.carName ||
      "";

    const matchesSearch = `${customerName} ${customerPhone} ${carName}`
      .toLowerCase()
      .includes(bookingSearch.toLowerCase());

    const matchesStatus =
      bookingFilter === "All" ||
      booking.status === bookingFilter;

    return matchesSearch && matchesStatus;
  });

  // =====================================
  // UPDATE BOOKING STATUS
  // =====================================

  const updateBookingStatus = async (bookingId, status) => {
    const actionText =
      status === "Confirmed" ? "confirm" : "cancel";

    if (
      !window.confirm(
        `Are you sure you want to ${actionText} this booking?`
      )
    ) {
      return;
    }

    try {
      setUpdatingBooking(bookingId);

      const response = await fetch(
        `${BOOKING_API}/${bookingId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update booking."
        );
      }

      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === bookingId
            ? result.booking
            : booking
        )
      );

      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(result.booking);
      }

      alert(`Booking ${status.toLowerCase()} successfully!`);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingBooking(null);
    }
  };

  // =====================================
  // CAR FORM FUNCTIONS
  // =====================================

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
    setShowForm(true);
  };

  const openEditForm = (car) => {
    setEditingId(car._id);

    setForm({
      name: car.name || "",
      model: car.model || "",
      year: car.year || "",
      pricePerHour: car.pricePerHour || "",
      pricePerDay: car.pricePerDay || "",
      description: car.description || "",
      availability: car.availability ?? true,
    });

    setImageFile(null);
    setImagePreview(imageUrl(car.image));
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select JPG, PNG or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const closeForm = () => {
    setShowForm(false);
    setImageFile(null);
    setImagePreview("");
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.pricePerHour ||
      !form.pricePerDay
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(
          key,
          value === "" && key === "year"
            ? ""
            : String(value)
        );
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(
        editingId
          ? `${API_URL}/${editingId}`
          : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          credentials: "include",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to save car"
        );
      }

      alert(
        editingId
          ? "Car updated successfully!"
          : "Car added successfully!"
      );

      closeForm();
      await fetchCars();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this car?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to delete car"
        );
      }

      await fetchCars();
      alert("Car deleted successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  // =====================================
  // NAVIGATION
  // =====================================

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Cars", icon: CarFront },
    { name: "Bookings", icon: CalendarDays },
  ];

  const changePage = (page) => {
    setActivePage(page);
    setSidebarOpen(false);

    if (page === "Bookings") {
      fetchBookings();
    }
  };

  // =====================================
  // MAIN UI
  // =====================================

  return (
    <div className="velocity-admin">

      {/* SIDEBAR */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="admin-brand">
          <div className="brand-mark">V</div>

          <div>
            <h2>VELOCITY</h2>
            <span>ADMIN PANEL</span>
          </div>

          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-label">
          MAIN MENU
        </div>

        <nav className="admin-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={
                  activePage === item.name
                    ? "nav-active"
                    : ""
                }
                onClick={() => changePage(item.name)}
              >
                <Icon size={19} />

                <span>{item.name}</span>

                {item.name === "Cars" && (
                  <small>{cars.length}</small>
                )}

                {item.name === "Bookings" && (
                  <small>{bookings.length}</small>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="profile-avatar">A</div>

            <div>
              <strong>Administrator</strong>
              <span>Super Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}

      <main className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={23} />
            </button>

            <div>
              <span className="topbar-small">
                VELOCITY / ADMIN
              </span>

              <h1>{activePage}</h1>
            </div>
          </div>

          <div className="topbar-right">
            <span className="system-status">
              <span className="status-dot" />
              System Online
            </span>

            <button
              className="refresh-btn"
              onClick={handleRefresh}
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* DASHBOARD */}

        {activePage === "Dashboard" && (
          <section className="admin-content">
            <div className="welcome-section">
              <div>
                <span className="section-eyebrow">
                  OVERVIEW
                </span>

                <h2>Welcome back, Admin.</h2>

                <p>
                  Here's what's happening with your fleet today.
                </p>
              </div>

              <button
                className="gold-button"
                onClick={openAddForm}
              >
                <Plus size={18} />
                Add New Car
              </button>
            </div>

            <div className="stats-grid">
              <StatCard
                icon={<CarFront />}
                label="Total Cars"
                value={cars.length}
                note="Vehicles in your fleet"
                styleName="icon-gold"
              />

              <StatCard
                icon={<CheckCircle />}
                label="Available Cars"
                value={availableCars.length}
                note="Ready for booking"
                styleName="icon-green"
              />

              <StatCard
                icon={<CircleAlert />}
                label="Unavailable Cars"
                value={unavailableCars.length}
                note="Currently unavailable"
                styleName="icon-red"
              />

              <StatCard
                icon={<Gauge />}
                label="Fleet Status"
                value={`${
                  cars.length
                    ? Math.round(
                        (availableCars.length / cars.length) *
                          100
                      )
                    : 0
                }%`}
                note="Availability rate"
                styleName="icon-dark"
              />
            </div>

            <div className="content-panel">
              <div className="panel-heading">
                <div>
                  <h3>Recent Fleet</h3>
                  <p>Manage your latest added vehicles</p>
                </div>

                <button
                  className="text-button"
                  onClick={() => changePage("Cars")}
                >
                  View All Cars →
                </button>
              </div>

              <CarsTable
                cars={cars.slice(0, 5)}
                loading={loading}
                error={error}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            </div>
          </section>
        )}

        {/* CARS PAGE */}

        {activePage === "Cars" && (
          <section className="admin-content">
            <div className="welcome-section">
              <div>
                <span className="section-eyebrow">
                  FLEET MANAGEMENT
                </span>

                <h2>Manage Your Cars</h2>

                <p>
                  Add, update and manage your rental vehicles.
                </p>
              </div>

              <button
                className="gold-button"
                onClick={openAddForm}
              >
                <Plus size={18} />
                Add New Car
              </button>
            </div>

            <div className="content-panel">
              <div className="panel-heading">
                <div>
                  <h3>All Vehicles ({cars.length})</h3>
                  <p>Your complete vehicle inventory</p>
                </div>

                <div className="search-box">
                  <Search size={17} />

                  <input
                    placeholder="Search cars..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />
                </div>
              </div>

              <CarsTable
                cars={filteredCars}
                loading={loading}
                error={error}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            </div>
          </section>
        )}

        {/* =====================================
            BOOKINGS PAGE
        ===================================== */}

        {activePage === "Bookings" && (
          <section className="admin-content">

            <div className="welcome-section">
              <div>
                <span className="section-eyebrow">
                  RESERVATIONS
                </span>

                <h2>Booking Management</h2>

                <p>
                  Manage customer reservations and booking status.
                </p>
              </div>

              <button
                className="gold-button"
                onClick={fetchBookings}
                disabled={bookingLoading}
              >
                <RefreshCw size={17} />
                Refresh Bookings
              </button>
            </div>

            {/* BOOKING STATISTICS */}

            <div className="stats-grid">
              <StatCard
                icon={<CalendarDays />}
                label="Total Bookings"
                value={bookings.length}
                note="All reservations"
                styleName="icon-gold"
              />

              <StatCard
                icon={<Clock />}
                label="Pending"
                value={pendingBookings.length}
                note="Waiting for confirmation"
                styleName="icon-dark"
              />

              <StatCard
                icon={<CheckCircle />}
                label="Confirmed"
                value={confirmedBookings.length}
                note="Approved reservations"
                styleName="icon-green"
              />

              <StatCard
                icon={<IndianRupee />}
                label="Confirmed Revenue"
                value={formatAmount(totalRevenue)}
                note="From confirmed bookings"
                styleName="icon-gold"
              />
            </div>

            {/* BOOKING TABLE */}

            <div className="content-panel">
              <div className="panel-heading">
                <div>
                  <h3>
                    All Reservations ({filteredBookings.length})
                  </h3>

                  <p>
                    Customer booking details from MongoDB
                  </p>
                </div>

                <div className="search-box">
                  <Search size={17} />

                  <input
                    placeholder="Search customer or car..."
                    value={bookingSearch}
                    onChange={(e) =>
                      setBookingSearch(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="booking-filter-bar">
                {[
                  "All",
                  "Pending",
                  "Confirmed",
                  "Cancelled",
                ].map((status) => (
                  <button
                    key={status}
                    className={
                      bookingFilter === status
                        ? "booking-filter-active"
                        : ""
                    }
                    onClick={() => setBookingFilter(status)}
                  >
                    {status}
                    <span>
                      {status === "All"
                        ? bookings.length
                        : bookings.filter(
                            (booking) =>
                              booking.status === status
                          ).length}
                    </span>
                  </button>
                ))}
              </div>

              {bookingLoading ? (
                <div className="table-message">
                  Loading bookings...
                </div>
              ) : bookingError ? (
                <div className="table-message error-message">
                  <CircleAlert size={28} />
                  <h3>Unable to load bookings</h3>
                  <p>{bookingError}</p>

                  <button
                    className="gold-button"
                    onClick={fetchBookings}
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="table-message">
                  <CalendarDays size={38} />
                  <h3>No bookings found</h3>
                  <p>
                    Customer reservations will appear here after
                    successful booking.
                  </p>
                </div>
              ) : (
                <div className="table-scroll">
                  <table className="cars-table bookings-table">
                    <thead>
                      <tr>
                        <th>CUSTOMER</th>
                        <th>VEHICLE</th>
                        <th>RENTAL DATES</th>
                        <th>AMOUNT</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredBookings.map((booking) => {
                        const customer =
                          booking.customer || {};

                        const carName =
                          booking.car?.name ||
                          booking.carName ||
                          "Vehicle";

                        const carModel =
                          booking.car?.model || "";

                        return (
                          <tr key={booking._id}>
                            <td>
                              <div className="booking-customer-cell">
                                <strong>
                                  {customer.fullName || "Customer"}
                                </strong>

                                <small>
                                  <Mail size={12} />
                                  {customer.email || "—"}
                                </small>

                                <small>
                                  <Phone size={12} />
                                  {customer.phone || "—"}
                                </small>
                              </div>
                            </td>

                            <td>
                              <div className="booking-car-cell">
                                <div className="vehicle-image">
                                  {booking.car?.image ? (
                                    <img
                                      src={imageUrl(
                                        booking.car.image
                                      )}
                                      alt={carName}
                                    />
                                  ) : (
                                    <CarFront size={23} />
                                  )}
                                </div>

                                <div>
                                  <strong>{carName}</strong>
                                  <small>{carModel}</small>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="booking-date-cell">
                                <span>
                                  <strong>From:</strong>{" "}
                                  {formatDate(booking.pickupDate)}
                                </span>

                                <span>
                                  <strong>To:</strong>{" "}
                                  {formatDate(booking.returnDate)}
                                </span>

                                <small>
                                  {booking.rentalDays || 0} days
                                </small>
                              </div>
                            </td>

                            <td>
                              <strong className="price-text">
                                {formatAmount(
                                  booking.totalAmount
                                )}
                              </strong>
                            </td>

                            <td>
                              <BookingStatus
                                status={booking.status}
                              />
                            </td>

                            <td>
                              <div className="booking-action-buttons">
                                <button
                                  className="booking-view-button"
                                  title="View details"
                                  onClick={() =>
                                    setSelectedBooking(booking)
                                  }
                                >
                                  <Eye size={16} />
                                </button>

                                {booking.status === "Pending" && (
                                  <button
                                    className="booking-confirm-button"
                                    disabled={
                                      updatingBooking === booking._id
                                    }
                                    onClick={() =>
                                      updateBookingStatus(
                                        booking._id,
                                        "Confirmed"
                                      )
                                    }
                                  >
                                    {updatingBooking === booking._id
                                      ? "..."
                                      : "Confirm"}
                                  </button>
                                )}

                                {booking.status !== "Cancelled" && (
                                  <button
                                    className="booking-cancel-button"
                                    disabled={
                                      updatingBooking === booking._id
                                    }
                                    onClick={() =>
                                      updateBookingStatus(
                                        booking._id,
                                        "Cancelled"
                                      )
                                    }
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* CANCELLED BOOKINGS NOTE */}

            <div className="booking-summary-note">
              <CircleAlert size={17} />
              <span>
                Cancelled reservations are kept in the database
                for your booking history.
              </span>
            </div>

          </section>
        )}
      </main>

      {/* =====================================
          ADD / EDIT CAR MODAL
      ===================================== */}

      {showForm && (
        <div
          className="modal-backdrop"
          onClick={closeForm}
        >
          <div
            className="car-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="section-eyebrow">
                  VEHICLE DETAILS
                </span>

                <h2>
                  {editingId
                    ? "Edit Vehicle"
                    : "Add New Vehicle"}
                </h2>

                <p>
                  Enter your vehicle information below.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeForm}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Car Name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Lamborghini Huracan"
                    required
                  />
                </label>

                <label>
                  Model
                  <input
                    name="model"
                    value={form.model}
                    onChange={handleChange}
                    placeholder="EVO Spyder"
                  />
                </label>

                <label>
                  Year
                  <input
                    name="year"
                    type="number"
                    value={form.year}
                    onChange={handleChange}
                    placeholder="2025"
                  />
                </label>

                <label>
                  Price Per Hour (₹) *
                  <input
                    name="pricePerHour"
                    type="number"
                    min="0"
                    value={form.pricePerHour}
                    onChange={handleChange}
                    placeholder="5000"
                    required
                  />
                </label>

                <label>
                  Price Per Day (₹) *
                  <input
                    name="pricePerDay"
                    type="number"
                    min="0"
                    value={form.pricePerDay}
                    onChange={handleChange}
                    placeholder="25000"
                    required
                  />
                </label>
              </div>

              <div className="upload-area">
                <label className="upload-label">
                  <Upload size={20} />

                  <strong>Choose Car Image</strong>

                  <span>
                    JPG, PNG or WEBP · Maximum 5 MB
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                  />
                </label>

                {imagePreview && (
                  <div className="image-preview">
                    <img
                      src={imagePreview}
                      alt="Selected car preview"
                    />

                    <span>
                      <ImagePlus size={15} />
                      Image Preview
                    </span>
                  </div>
                )}
              </div>

              <label className="description-label">
                Description

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter car description..."
                  rows="3"
                />
              </label>

              <label className="availability-toggle">
                <input
                  type="checkbox"
                  name="availability"
                  checked={form.availability}
                  onChange={handleChange}
                />

                <span>
                  Car is available for booking
                </span>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="gold-button"
                  disabled={saving}
                >
                  {saving
                    ? "Uploading..."
                    : editingId
                    ? "Update Vehicle"
                    : "Save Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================
          BOOKING DETAILS MODAL
      ===================================== */}

      {selectedBooking && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="car-modal booking-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="section-eyebrow">
                  RESERVATION DETAILS
                </span>

                <h2>Booking Information</h2>

                <p>
                  Booking ID: {selectedBooking._id}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedBooking(null)}
              >
                <X size={21} />
              </button>
            </div>

            <div className="booking-detail-content">
              <h3>
                <UserRound size={18} />
                Customer Information
              </h3>

              <DetailRow
                label="Customer Name"
                value={
                  selectedBooking.customer?.fullName || "—"
                }
              />

              <DetailRow
                label="Email Address"
                value={
                  selectedBooking.customer?.email || "—"
                }
              />

              <DetailRow
                label="Phone Number"
                value={
                  selectedBooking.customer?.phone || "—"
                }
              />

              <h3>
                <CarFront size={18} />
                Vehicle Information
              </h3>

              <DetailRow
                label="Selected Car"
                value={
                  selectedBooking.car?.name ||
                  selectedBooking.carName ||
                  "—"
                }
              />

              <DetailRow
                label="Model"
                value={
                  selectedBooking.car?.model || "—"
                }
              />

              <h3>
                <CalendarDays size={18} />
                Rental Information
              </h3>

              <DetailRow
                label="Pickup Date"
                value={formatDate(selectedBooking.pickupDate)}
              />

              <DetailRow
                label="Return Date"
                value={formatDate(selectedBooking.returnDate)}
              />

              <DetailRow
                label="Pickup Location"
                value={selectedBooking.pickupLocation || "—"}
              />

              <DetailRow
                label="Rental Duration"
                value={`${selectedBooking.rentalDays || 0} days`}
              />

              <DetailRow
                label="Price Per Day"
                value={formatAmount(
                  selectedBooking.pricePerDay
                )}
              />

              <DetailRow
                label="Total Amount"
                value={formatAmount(
                  selectedBooking.totalAmount
                )}
              />

              <div className="booking-detail-status">
                <span>Booking Status</span>
                <BookingStatus
                  status={selectedBooking.status}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>

              {selectedBooking.status === "Pending" && (
                <button
                  className="gold-button"
                  disabled={
                    updatingBooking === selectedBooking._id
                  }
                  onClick={() =>
                    updateBookingStatus(
                      selectedBooking._id,
                      "Confirmed"
                    )
                  }
                >
                  Confirm Booking
                </button>
              )}

              {selectedBooking.status !== "Cancelled" && (
                <button
                  className="booking-cancel-button"
                  disabled={
                    updatingBooking === selectedBooking._id
                  }
                  onClick={() =>
                    updateBookingStatus(
                      selectedBooking._id,
                      "Cancelled"
                    )
                  }
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// =====================================
// STAT CARD
// =====================================

function StatCard({
  icon,
  label,
  value,
  note,
  styleName,
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${styleName}`}>
        {icon}
      </div>

      <span>{label}</span>

      <h3>{value}</h3>

      <p>{note}</p>
    </div>
  );
}

// =====================================
// BOOKING STATUS
// =====================================

function BookingStatus({ status }) {
  const statusClass =
    status === "Confirmed"
      ? "booking-status-confirmed"
      : status === "Cancelled"
      ? "booking-status-cancelled"
      : "booking-status-pending";

  return (
    <span className={`booking-status ${statusClass}`}>
      {status || "Pending"}
    </span>
  );
}

// =====================================
// BOOKING DETAIL ROW
// =====================================

function DetailRow({ label, value }) {
  return (
    <div className="booking-detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

// =====================================
// CARS TABLE
// =====================================

function CarsTable({
  cars,
  loading,
  error,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="table-message">
        Loading vehicles...
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-message error-message">
        {error}
      </div>
    );
  }

  if (!cars.length) {
    return (
      <div className="table-message">
        <CarFront size={35} />
        <h3>No cars found</h3>
        <p>Add your first vehicle to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="cars-table">
        <thead>
          <tr>
            <th>VEHICLE</th>
            <th>MODEL / YEAR</th>
            <th>PER DAY</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {cars.map((car) => (
            <tr key={car._id}>
              <td>
                <div className="vehicle-cell">
                  <div className="vehicle-image">
                    {car.image ? (
                      <img
                        src={imageUrl(car.image)}
                        alt={car.name}
                      />
                    ) : (
                      <CarFront size={24} />
                    )}
                  </div>

                  <strong>{car.name}</strong>
                </div>
              </td>

              <td>
                <span className="model-text">
                  {car.model || "—"}
                </span>

                <small className="year-text">
                  {car.year || "—"}
                </small>
              </td>

              <td>
                <strong className="price-text">
                  {formatAmount(car.pricePerDay)}
                </strong>
              </td>

              <td>
                <span
                  className={`availability-badge ${
                    car.availability
                      ? "available"
                      : "unavailable"
                  }`}
                >
                  {car.availability
                    ? "Available"
                    : "Unavailable"}
                </span>
              </td>

              <td>
                <div className="table-actions">
                  <button
                    className="edit-action"
                    onClick={() => onEdit(car)}
                    title="Edit car"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="delete-action"
                    onClick={() => onDelete(car._id)}
                    title="Delete car"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
