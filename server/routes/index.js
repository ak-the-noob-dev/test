import express from "express";
const router = express.Router();
import invoiceRoutes from "./invoices.js";
import clientRoutes from "./clients.js";
import userRoutes from "./userRoutes.js";
import profile from "./profile.js";
router.get("/", (req, res) => {
  res.send("API working");
});
router.use("/invoices", invoiceRoutes);
router.use("/clients", clientRoutes);
router.use("/users", userRoutes);
router.use("/profiles", profile);
export default router;
