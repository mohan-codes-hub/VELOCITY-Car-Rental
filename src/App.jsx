
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Story from "./pages/Story";
import Experience from "./pages/Experience";
import Cars from "./pages/Cars";
import Booking from "./pages/Booking";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Footer from "./components/Footer";
import ProtectedAdmin from "./components/ProtectedAdmin";

function MainWebsite() {
  return (
    <>
      <Home />
      <Experience />
      <Story />
      <Cars />
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainWebsite />} />

        <Route path="/booking" element={<Booking />} />

        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <Admin />
            </ProtectedAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
