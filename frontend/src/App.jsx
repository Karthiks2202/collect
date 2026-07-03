import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Watchlist from "./pages/Watchlist";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminReviews from "./pages/AdminReviews";
import Collections from "./pages/Collections";
import CollectionDetails from "./pages/CollectionDetails";
import Notifications from "./pages/Notifications";
import ComparePage from "./pages/ComparePage";
import WatchedHistory from "./pages/WatchedHistory";

// Route Guards
import ProtectedRoute from "./router";
import AdminRoute from "./components/AdminRoute";

// Layout
import Layout from "./components/Layout";

// Context
import { CompareProvider } from "./context/CompareContext";
import CompareBar from "./components/CompareBar";

function App() {
  return (
    <CompareProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Home */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Compare */}
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <Layout>
                  <ComparePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Favorites */}
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Layout>
                  <Favorites />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* History */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <History />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Watchlist */}
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Layout>
                  <Watchlist />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Watched History */}
          <Route
            path="/watched"
            element={
              <ProtectedRoute>
                <Layout>
                  <WatchedHistory />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Collections */}
          <Route
            path="/collections"
            element={
              <ProtectedRoute>
                <Layout>
                  <Collections />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Collection Details */}
          <Route
            path="/collections/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CollectionDetails />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Admin Users */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />

          {/* Admin Reviews */}
          <Route
            path="/admin/reviews"
            element={
              <AdminRoute>
                <AdminReviews />
              </AdminRoute>
            }
          />

          {/* Redirect Unknown Routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global floating comparison bar */}
        <CompareBar />
      </BrowserRouter>
    </CompareProvider>
  );
}

export default App;