// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Typography,
  Box
} from "@mui/material";

import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import Cart from "./components/Cart";
import Orders from "./components/Orders";
import { logoutUser } from "./redux/actions/loginAction";

/** -------------------------
 *     TOPBAR WITH ACTIVE STYLES
 * ------------------------ */
function TopBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation(); // <-- needed for active tab
  const { isLoggedIn } = useSelector((state) => state.login || {});

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  const isActive = (route) => pathname === route;

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          sx={{
            mr: 2,
            cursor: "pointer",
            fontWeight: isActive("/dashboard") ? "bold" : "normal",
            textDecoration: isActive("/dashboard") ? "underline" : "none"
          }}
          onClick={() => navigate("/dashboard")}
        >
          Discount Wala
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {!isLoggedIn ? (
          <>
            <Button
              color="inherit"
              component={Link}
              to="/login"
              sx={{
                fontWeight: isActive("/login") ? "bold" : "normal",
                textDecoration: isActive("/login") ? "underline" : "none"
              }}
            >
              Login
            </Button>

            <Button
              color="inherit"
              component={Link}
              to="/register"
              sx={{
                fontWeight: isActive("/register") ? "bold" : "normal",
                textDecoration: isActive("/register") ? "underline" : "none"
              }}
            >
              Register
            </Button>
          </>
        ) : (
          <>
            <Button
              color="inherit"
              onClick={() => navigate("/orders")}
              sx={{
                fontWeight: isActive("/orders") ? "bold" : "normal",
                textDecoration: isActive("/orders") ? "underline" : "none"
              }}
            >
              Your Orders
            </Button>

            <Button
              color="inherit"
              onClick={() => navigate("/cart")}
              sx={{
                fontWeight: isActive("/cart") ? "bold" : "normal",
                textDecoration: isActive("/cart") ? "underline" : "none"
              }}
            >
              Cart
            </Button>

            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

/** -------------------------
 *   LOGIN REDIRECT HELPER
 * ------------------------ */
function LoginRedirect() {
  const { isLoggedIn } = useSelector((state) => state.login || {});
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoggedIn) navigate("/dashboard", { replace: true });
    else navigate("/login", { replace: true });
  }, [isLoggedIn, navigate]);

  return <Typography sx={{ m: 3 }}>Redirecting…</Typography>;
}

/** -------------------------
 *           APP ROUTER
 * ------------------------ */
export default function App() {
  return (
    <Router>
      <TopBar />

      <Container sx={{ mt: 4 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* Default */}
          <Route path="/" element={<LoginRedirect />} />

          {/* Catch-all */}
          <Route path="*" element={<LoginRedirect />} />
        </Routes>
      </Container>
    </Router>
  );
}
