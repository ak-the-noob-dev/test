// Import necessary modules
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import puppeteer from "puppeteer";

// Import routes and templates
import invoiceRoutes from "./routes/invoices.js";
import clientRoutes from "./routes/clients.js";
import userRoutes from "./routes/userRoutes.js";
import profile from "./routes/profile.js";
import emailTemplate from "./documents/email.js";
import pdfTemplate from "./documents/index.js";
import { __env } from "./configs.js";

// Set up Express app
const app = express();
dotenv.config({ path: "./.env" });

// Define directories
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware and routes setup
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/invoices", invoiceRoutes);
app.use("/clients", clientRoutes);
app.use("/users", userRoutes);
app.use("/profiles", profile);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: __env.MAILSERVER_USER || "mnestest3000@gmail.com",
    pass: __env.MAILSERVER_PASS || "aoftqcepribbcwwp",
  },
});

// Puppeteer options
const puppeteerOptions = {
  format: "A4",
};

// Route to send PDF via email
app.post("/send-pdf", async (req, res) => {
  const { email, company } = req.body;
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(pdfTemplate(req.body)); // Assuming pdfTemplate generates HTML content
    await page.pdf({ path: "invoice.pdf", format: "A4" });

    await transporter.sendMail({
      from: ` Mnes <mnestest3000@gmail.com>`,
      to: email,
      replyTo: company.email,
      subject: `Invoice from ${company.businessName || company.name}`,
      text: `Invoice from ${company.businessName || company.name}`,
      html: emailTemplate(req.body),
      attachments: [{ filename: "invoice.pdf", path: "invoice.pdf" }],
    });

    await browser.close();
    res.send("PDF sent successfully.");
  } catch (error) {
    console.error("Error sending PDF:", error);
    res.status(500).send("Failed to send PDF.");
  }
});

// Start server
const PORT = __env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
const DB_URL = __env.DB_URL || "mongodb://13.235.28.167:27017/test";
mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));
