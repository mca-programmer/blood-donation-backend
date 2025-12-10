import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve("./firebaseServiceAccountKey.json"))
);
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin Initialization
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {}).then(() => {
  console.log("MongoDB Connected");
}).catch(err => console.error(err));

// ===================== MODELS =====================
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: String,
  bloodGroup: { type: String, required: true },
  district: { type: String, required: true },
  upazila: { type: String, required: true },
  role: { type: String, enum: ["donor", "volunteer", "admin"], default: "donor" },
  status: { type: String, enum: ["active", "blocked"], default: "active" },
}, { timestamps: true });
const User = mongoose.model("User", userSchema);

const donationRequestSchema = mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipientName: { type: String, required: true },
  recipientDistrict: { type: String, required: true },
  recipientUpazila: { type: String, required: true },
  hospitalName: String,
  address: String,
  bloodGroup: { type: String, required: true },
  donationDate: { type: Date, required: true },
  donationTime: { type: String, required: true },
  requestMessage: String,
  status: { type: String, enum: ["pending", "inprogress", "done", "canceled"], default: "pending" },
}, { timestamps: true });
const DonationRequest = mongoose.model("DonationRequest", donationRequestSchema);

const fundSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });
const Fund = mongoose.model("Fund", fundSchema);

// ===================== MIDDLEWARE =====================
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// ===================== ROUTES =====================
// --------- Auth Routes ---------
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, avatar, bloodGroup, district, upazila } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, avatar, bloodGroup, district, upazila });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user });
});


// ===================== SERVER =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
