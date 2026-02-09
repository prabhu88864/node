// Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Rating from "@mui/material/Rating";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  Box,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";

import { productsInitiate } from "../redux/actions/productsActions";
import { addToCart as addToCartAction, fetchCart } from "../redux/actions/cartActions";

export default function Dashboard() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.login);
  const products = useSelector((state) => state.products.list);
  const loading = useSelector((state) => state.products.loading);
  const error = useSelector((state) => state.products.error);

  // optional: you can read cart state if you want to disable button while adding
  const cartLoading = useSelector((state) => state.cart.loading);

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // initial load + polling for product updates
  useEffect(() => {
    dispatch(productsInitiate());
    // also load cart once (so TopBar/cart page can show it)
    dispatch(fetchCart());

    const interval = setInterval(() => {
      dispatch(productsInitiate());
      console.log("vvvvvvvvvvvvvvvvvvvvvvvv",window.location.origin);
    
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // NEW: use Redux thunk to add to cart (server-backed)
  const handleAddToCart = async (product) => {
    if (!user) {
      setSnack({ open: true, message: "Please login to add to cart", severity: "warning" });
      return;
    }

    try {
      // optimistic UI: show immediate feedback
      setSnack({ open: true, message: `${product.name} added to cart`, severity: "success" });

      // dispatch thunk to add on server — we don't await here to keep UI snappy,
      // but we do return the promise so you can await if you prefer:
      const res = dispatch(addToCartAction(product._id, 1));

      // Optionally wait for response to confirm and refresh cart from server:
      // await res; // uncomment if your thunk returns the API promise
      // dispatch(fetchCart()); // keep cart in sync (often the thunk already returns the updated cart)

    } catch (err) {
      console.error("Add to cart failed", err);
      setSnack({ open: true, message: `Could not add ${product.name}`, severity: "error" });
    }
  };

  const handleCloseSnack = () => setSnack({ open: false, message: "" });

  // Group products by category
  const grouped = (products || []).reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Welcome, {user?.name || "User"}
      </Typography>

      {/* Loading & Error States */}
      {loading && <Typography>Loading products...</Typography>}
      {error && <Typography color="error">Error: {error}</Typography>}

      {/* Category Sections */}
      {Object.keys(grouped).map((category) => (
        <Box key={category} sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
            {category}
          </Typography>

          <Grid container spacing={3}>
            {grouped[category].map((p) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={p._id}>
                <Card
                  sx={{
                    height: 400,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    boxShadow: 3,
                    transition: "0.2s ease",
                    "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={
                      p.productImage?.startsWith("http")
                        ? `${window.location.origin}${p.productImage}`
                        : `http://localhost:3000${p.productImage}`
                    }
                    alt={p.name}
                    sx={{ height: 200, objectFit: "cover" }}
                  />

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Tooltip title={p.name}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {p.name}
                      </Typography>
                    </Tooltip>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        fontSize: 13,
                      }}
                    >
                      {p.description || "No description available."}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                      <Rating value={Number(p.rating) || 0} readOnly precision={0.1} size="small" />
                    </Box>

                    <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: "success.main" }}>
                      ₹ {p.price}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleAddToCart(p)}
                      disabled={cartLoading}
                      sx={{
                        fontWeight: 600,
                        bgcolor: "primary.main",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      <Snackbar open={snack.open} autoHideDuration={2000} onClose={handleCloseSnack} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity || "success"} onClose={handleCloseSnack}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
