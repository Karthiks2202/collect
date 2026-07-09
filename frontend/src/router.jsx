

import {
  Navigate
} from "react-router-dom";

// Protected Route Component

function ProtectedRoute({
  children
}) {

  // Get token
  const token =
    localStorage.getItem("token");

  // If no token
  if (!token) {

    return (
      <Navigate to="/login" />
    );

  }

  // If authenticated
  return children;
}

export default ProtectedRoute;