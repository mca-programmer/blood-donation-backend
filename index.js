import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

dotenv.config();

// Firebase service account
const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve("./firebaseServiceAccountKey.json"))
);

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin Initialization
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ===================== MODELS =====================

// User Model
const userSchema = mongoose.Schema({
  uid: String,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  avatar: String,
  bloodGroup: String,
  district: String,
  upazila: String,
  role: { type: String, enum: ["donor", "volunteer", "admin"], default: "donor" },
  status: { type: String, enum: ["active", "blocked"], default: "active" },
}, { timestamps: true });
const User = mongoose.model("User", userSchema);

// Donation Request Model
const donationRequestSchema = mongoose.Schema({
  requesterName: { type: String, required: true },
  requesterEmail: { type: String, required: true },
  recipientName: { type: String, required: true },
  recipientDistrict: { type: String, required: true },
  recipientUpazila: { type: String, required: true },
  hospitalName: { type: String, required: true },
  fullAddress: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  requestMessage: String,
  status: { type: String, enum: ["pending", "inprogress", "done", "canceled"], default: "pending" },
  donorName: String,
  donorEmail: String,
}, { timestamps: true });
const DonationRequest = mongoose.model("DonationRequest", donationRequestSchema);

// Fund Model
const fundSchema = mongoose.Schema({
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });
const Fund = mongoose.model("Fund", fundSchema);

// ===================== MIDDLEWARE =====================
const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      if (req.user.status === "blocked") {
        return res.status(403).json({ message: "Your account has been blocked" });
      }
      
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Admin Middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
};

// ===================== AUTH ROUTES =====================

// Register (Email/Password)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { uid, name, email, password, avatar, bloodGroup, district, upazila } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    
    const user = await User.create({ 
      uid,
      name, 
      email, 
      password: hashedPassword, 
      avatar, 
      bloodGroup, 
      district, 
      upazila 
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    res.status(201).json({ 
      token, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bloodGroup: user.bloodGroup,
        district: user.district,
        upazila: user.upazila,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Login (Email/Password)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Please login with Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    res.json({ 
      token, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bloodGroup: user.bloodGroup,
        district: user.district,
        upazila: user.upazila,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Google Login
app.post("/api/auth/google-login", async (req, res) => {
  try {
    const { email, displayName, uid } = req.body;

    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        uid,
        name: displayName || "Google User",
        email,
        bloodGroup: "Not Set",
        district: "Not Set",
        upazila: "Not Set",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    res.json({ 
      token, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bloodGroup: user.bloodGroup,
        district: user.district,
        upazila: user.upazila,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(401).json({ message: "Google login failed" });
  }
});

// ===================== DASHBOARD STATS =====================
app.get("/api/dashboard/stats", protect, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRequests = await DonationRequest.countDocuments();
    const funds = await Fund.find();
    const totalFunds = funds.reduce((sum, f) => sum + f.amount, 0);

    res.json({
      totalUsers,
      totalRequests,
      totalFunds: totalFunds.toFixed(2),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ===================== USER ROUTES =====================

// Get All Users (Admin Only)
app.get("/api/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update User Status (Admin Only)
app.patch("/api/users/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update User Role (Admin Only)
app.patch("/api/users/:id/role", protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update User Profile
app.put("/api/users/:id", protect, async (req, res) => {
  try {
    // Only allow user to update their own profile or admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    const { name, bloodGroup, district, upazila, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, bloodGroup, district, upazila, avatar },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bloodGroup: user.bloodGroup,
      district: user.district,
      upazila: user.upazila,
      role: user.role,
      status: user.status
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ===================== DONATION REQUEST ROUTES =====================
// ⚠️ IMPORTANT: /my route MUST come BEFORE /:id route

// Get My Donation Requests (with pagination) - MUST BE FIRST
app.get("/api/donation-requests/my", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const total = await DonationRequest.countDocuments({ 
      requesterEmail: req.user.email 
    });
    
    const requests = await DonationRequest.find({ 
      requesterEmail: req.user.email 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Get my requests error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get All Donation Requests (with filters)
app.get("/api/donation-requests", async (req, res) => {
  try {
    const { status, bloodGroup, district } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (district) filter.recipientDistrict = district;

    const requests = await DonationRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single Donation Request - MUST BE AFTER /my
app.get("/api/donation-requests/:id", async (req, res) => {
  try {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Donation Request
app.post("/api/donation-requests", protect, async (req, res) => {
  try {
    const request = await DonationRequest.create({
      ...req.body,
      requesterName: req.user.name,
      requesterEmail: req.user.email,
    });
    res.status(201).json(request);
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update Donation Request
app.put("/api/donation-requests/:id", protect, async (req, res) => {
  try {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.requesterEmail !== req.user.email && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await DonationRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Donation Request
app.delete("/api/donation-requests/:id", protect, async (req, res) => {
  try {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.requesterEmail !== req.user.email && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await DonationRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Donate to a Request
app.post("/api/donation-requests/:id/donate", protect, async (req, res) => {
  try {
    const { donorName, donorEmail } = req.body;
    const request = await DonationRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status: "inprogress",
        donorName,
        donorEmail 
      },
      { new: true }
    );
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===================== FUNDING ROUTES =====================

// Get All Funds
app.get("/api/funds", async (req, res) => {
  try {
    const funds = await Fund.find().sort({ createdAt: -1 });
    res.json(funds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Give Fund
app.post("/api/funds", protect, async (req, res) => {
  try {
    const { amount } = req.body;
    const fund = await Fund.create({
      userName: req.user.name,
      userEmail: req.user.email,
      amount: parseFloat(amount),
    });
    res.status(201).json(fund);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===================== DONOR SEARCH =====================

// Search Donors
app.get("/api/donors/search", async (req, res) => {
  try {
    const { bloodGroup, district, upazila } = req.query;
    const filter = { status: "active" };
    
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (district) filter.district = new RegExp(district, "i");
    if (upazila) filter.upazila = new RegExp(upazila, "i");

    const donors = await User.find(filter).select("-password");
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===================== ERROR HANDLING =====================
app.use((req, res) => res.status(404).json({ message: `Not Found - ${req.originalUrl}` }));
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ 
    message: err.message, 
    stack: process.env.NODE_ENV === "production" ? null : err.stack 
  });
});

// ===================== SERVER =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));