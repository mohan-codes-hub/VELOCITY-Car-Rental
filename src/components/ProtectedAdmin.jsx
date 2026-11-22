
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function ProtectedAdmin({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/verify`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        setAuthenticated(
          response.ok && data.authenticated === true
        );
      } catch (error) {
        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };

    verifyAdmin();
  }, []);

  if (checking) {
    return <div style={{ padding: "40px" }}>Checking admin access...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

export default ProtectedAdmin;
