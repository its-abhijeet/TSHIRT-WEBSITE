const express = require("express");
const router = express.Router();
const {
  getCategoryById,
  getCategory,
  getAllCategory,
  createCategory,
  updateCategory,
  removeCategory,
} = require("../controllers/category");
const { isAdmin, isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");
//Param Routes
router.param("userId", getUserById);
router.param("categoryId", getCategoryById);
//actual router goes here
//create routes
router.post(
  "/category/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createCategory
);
//read routes
router.get("/category/:categoryId", getCategory);
router.get("/categories", getAllCategory);
//update routes
router.put(
  "/category/:categoryId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateCategory
);
//delete routes
router.delete(
  "/category/:categoryId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  removeCategory
);
module.exports = router;
