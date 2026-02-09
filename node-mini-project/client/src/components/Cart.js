import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createOrder } from "../redux/actions/orderActions";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Divider
} from "@mui/material";
import { fetchCart, removeCartItem } from "../redux/actions/cartActions";

export default function Cart() {
  const dispatch = useDispatch();
  const { items = [], loading } = useSelector((state) => state.cart || {});

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const removeItem = (id) => dispatch(removeCartItem(id));

  const subtotal = items.reduce(
    (s, it) =>
      s +
      Number(it.priceSnapshot || it.product.price || 0) * Number(it.qty || 1),
    0
  );

  if (loading) return <Typography>Loading cart...</Typography>;
  if (!items.length)
    return (
      <Box sx={{ py: 6 }}>
        <Typography variant="h5">Your cart is empty</Typography>
      </Box>
    );

    const handleOrderNow = () => {
      const orderPayload = {
        items,
        subtotal,
      };
    
      dispatch(createOrder(orderPayload));
    };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Your Cart
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {items.map((it) => {
              const prod = it.product;
              const id = typeof prod === "object" ? prod._id : prod;
              const name = it.nameSnapshot || prod.name;
              const price = it.priceSnapshot || prod.price;
              const image = it.imageSnapshot || prod.productImage;

              return (
                <Grid item xs={12} key={String(id)}>
                  <Card
                    sx={{
                      display: "flex",
                      alignItems: "stretch",
                      borderRadius: 2,
                      boxShadow: 3
                    }}
                  >
                    <CardMedia
                      component="img"
                      src={
                        image?.startsWith?.("http")
                          ? image
                          : `http://localhost:3000${image}`
                      }
                      alt={name}
                      sx={{ width: 140, objectFit: "cover", borderRadius: "8px 0 0 8px" }}
                    />

                    <Box sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          {name}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Price: ₹ {price}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          Quantity: {it.qty}
                        </Typography>
                      </CardContent>

                      <CardActions sx={{ px: 2, pb: 2 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          fullWidth
                          onClick={() => removeItem(id)}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600
                          }}
                        >
                          Remove
                        </Button>
                      </CardActions>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography sx={{ mb: 2, fontSize: "1rem" }}>
              Subtotal: <strong>₹ {subtotal}</strong>
            </Typography>

            <Button
                variant="contained"
                fullWidth
                sx={{ py: 1.2, borderRadius: 2 }}
                onClick={handleOrderNow}
              >
                Order Now
              </Button>

          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
