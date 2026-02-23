const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const productController = require('../controllers/product.controller');
const User = require("../models/User");

router.post("/",
    authController.authenticate,
    authController.checkAdminPermission,
    productController.createProduct
);

router.get("/",productController.getProducts);

router.get("/:id", productController.getProductById);

router.put("/:id",
    authController.authenticate,
    authController.checkAdminPermission,
    productController.updateProduct
);

module.exports = router;
