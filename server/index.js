//Copyright (c) 2022 Panshak Solomon

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import pdf from "html-pdf";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import invoiceRoutes from "./routes/invoices.js";
import clientRoutes from "./routes/clients.js";
import userRoutes from "./routes/userRoutes.js";

import profile from "./routes/profile.js";
import pdfTemplate from "./documents/index.js";
// import invoiceTemplate from './documents/invoice.js'
import emailTemplate from "./documents/email.js";
import { __env } from "./configs.js";

const app = express();
dotenv.config({ path: "./.env" });

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/invoices", invoiceRoutes);
app.use("/clients", clientRoutes);
app.use("/users", userRoutes);
app.use("/profiles", profile);

// NODEMAILER TRANSPORT FOR SENDING INVOICE VIA EMAIL
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: __env.MAILSERVER_USER || "mnestest3000@gmail.com",
    pass: __env.MAILSERVER_PASS || "aoftqcepribbcwwp",
  },
});

var options = { format: "A4" };
//SEND PDF INVOICE VIA EMAIL
app.post("/send-pdf", (req, res) => {
  console.log("api called ", req.body);
  const { email, company } = req.body;
  try {
    // pdf.create(pdfTemplate(req.body), {}).toFile('invoice.pdf', (err) => {
    pdf.create(pdfTemplate(req.body), options).toFile("invoice.pdf", (err) => {
      // send mail with defined transport object
      transporter.sendMail({
        from: ` Mnes <mnestest3000@gmail.com>`, // sender address
        to: `${email}`, // list of receivers
        replyTo: `${company.email}`,
        subject: `Invoice from ${
          company.businessName ? company.businessName : company.name
        }`, // Subject line
        text: `Invoice from ${
          company.businessName ? company.businessName : company.name
        }`, // plain text body
        html: emailTemplate(req.body), // html body
        attachments: [
          {
            filename: "invoice.pdf",
            path: `${__dirname}/invoice.pdf`,
          },
        ],
      });

      if (err) {
        console.log(err);
        res.send(Promise.reject());
      }
      res.send(Promise.resolve());
    });
  } catch (error) {
    console.log("api error ", error);
  }
});

//Problems downloading and sending invoice
// npm install html-pdf -g
// npm link html-pdf
// npm link phantomjs-prebuilt

//CREATE AND SEND PDF INVOICE
app.post("/create-pdf", (req, res) => {
  pdf.create(pdfTemplate(req.body), {}).toFile("invoice.pdf", (err) => {
    if (err) {
      res.send(Promise.reject());
    }
    res.send(Promise.resolve());
  });
});

//SEND PDF INVOICE
app.get("/fetch-pdf", (req, res) => {
  res.sendFile(`${__dirname}/invoice.pdf`);
});

app.get("/", (req, res) => {
  res.send("SERVER IS RUNNING");
});

const DB_URL = __env.DB_URL || "mongodb://13.235.28.167:27017/test";
const PORT = __env.PORT || 5000;

mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
  )
  .catch((error) => console.log(error.message));

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
