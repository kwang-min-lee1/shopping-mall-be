const express = require('express');
const authController = require('../controllers/auth.controller');
const orderController = require('../controllers/order.controller');
const router = express.Router();

router.post("/",authController.authenticate,orderController.createOrder);
router.get("/",authController.authenticate, orderController.getOrder);

console.log("authenticate:", typeof authController.authenticate);
console.log("checkAdminPermission:", typeof authController.checkAdminPermission);
console.log("updateOrder:", typeof orderController.updateOrder);

router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.updateOrder
);

module.exports = router