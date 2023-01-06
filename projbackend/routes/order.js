const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getAllOrders,
  getOrderStatus,
  updateStatus,
} = require("../controllers/order");
const { updateStock } = require("../controllers/product");
const { isAdmin, isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getUserById, pushOrderInPurchaseList } = require("../controllers/user");

//params
router.param("userId", getUserById);
router.param("orderId", getOrderById);
//actual routes
//create
router.post(
  "/order/create/:userId",
  isSignedIn,
  isAuthenticated,
  pushOrderInPurchaseList,
  updateStock,
  createOrder
);
//read
router.get(
  "/order/all/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getAllOrders
);
//status of Order
router.get(
  "/order/status/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getOrderStatus
);
router.put(
  "/order/:orderId/status/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateStatus
);
module.exports = router;
