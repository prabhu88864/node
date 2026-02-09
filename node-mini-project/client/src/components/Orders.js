import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider,
} from "@mui/material";
import { fetchOrders } from "../redux/actions/orderActions";

const Orders = () => {
  const dispatch = useDispatch();
  const { orders = [], loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  if (loading) return <Typography>Loading orders...</Typography>;

  if (!orders.length)
    return (
      <Box sx={{ py: 5 }}>
        <Typography variant="h5">No Orders Found</Typography>
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Your Orders
      </Typography>

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} key={order._id}>
            <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Order ID: {order._id}
              </Typography>

              <Typography sx={{ mb: 1 }} color="text.secondary">
                Status: {order.status}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {order.items.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{ display: "flex", mb: 2, alignItems: "center" }}
                >
                  <CardMedia
                    component="img"
                    src={
                      item.image?.startsWith("http")
                        ? item.image
                        : `http://localhost:3000${item.image}`
                    }
                    alt={item.name}
                    sx={{
                      width: 100,
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 2,
                      mr: 2,
                    }}
                  />

                  <CardContent sx={{ p: 0 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                    <Typography>Qty: {item.qty}</Typography>
                    <Typography>Price: ₹ {item.price}</Typography>
                  </CardContent>
                </Box>
              ))}

              <Divider sx={{ mt: 1, mb: 1 }} />

              <Typography sx={{ fontSize: "1rem" }}>
                <strong>Total Amount:</strong> ₹ {order.totalAmount}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Orders;
