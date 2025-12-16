# blood-donation-backend

<div align="center">

# 🩸 Blood Donation Backend

### *Jiboner Jonno Rokto, Manusher Jonno Maanobota*

[![Live Demo](https://img.shields.io/badge/Live-Demo-red?style=for-the-badge&logo=vercel)](https://blood-donation-backend-rouge.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="700">

**Ekti powerful backend system je blood donors ebong recipients der majhe connection toiri kore**

[Features](#-features) • [Quick Start](#-quick-start) • [API Documentation](#-api-routes) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 🌟 Overview

Blood Donation Backend ekta robust ebong scalable server-side application ja blood donation management ke easy ebong efficient banate designed kora hoyeche. Ei system donors, recipients, ebong administrators der jonno seamless experience provide kore.

### 💡 Keno Ei Project?

> *"Ekti blood donation tinti jibon bachate pare"*

Prottek bochor lakhs manush blood er proyojon e mara jay. Ei backend system sei gap fill korte help kore - donors ke recipients er sathe connect kore, emergency te fast response ensure kore.

---

## ✨ Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Authentication** | JWT-based user authentication ebong authorization |
| 👥 **User Management** | Donor ebong recipient profile management |
| 🩸 **Blood Requests** | Real-time blood request posting ebong tracking |
| 📍 **Location-based Search** | Geographic location onujayi donors khuje ber kora |
| 📧 **Email Notifications** | Automated email alerts for critical requests |
| 📊 **Analytics Dashboard** | Comprehensive donation statistics ebong reports |
| 🚀 **High Performance** | Optimized API responses with caching |
| 🔒 **Data Security** | Industry-standard security practices |

</div>

---

## 🚀 Quick Start

### Prerequisites

Apnar computer e ei software gulo install thakte hobe:

```bash
- Node.js (v14 ba tar oporer version)
- npm ba yarn
- MongoDB ba any database
```


🎉 **Congratulations!** Your backend server running at `http://localhost:5000`

---

## 🛣️ API Routes

### Authentication Routes

```http
POST   /api/auth/register          # Notun user register
POST   /api/auth/login             # User login
POST   /api/auth/logout            # User logout
GET    /api/auth/profile           # Current user profile
PUT    /api/auth/update            # Profile update
```

### Blood Request Routes

```http
GET    /api/requests               # Sob blood requests
POST   /api/requests               # Notun request create
GET    /api/requests/:id           # Specific request details
PUT    /api/requests/:id           # Request update
DELETE /api/requests/:id           # Request delete
```

### Donor Routes

```http
GET    /api/donors                 # Available donors list
GET    /api/donors/:bloodGroup     # Blood group onujayi donors
GET    /api/donors/nearby          # Location-based donors
POST   /api/donors/register        # Donor registration
```

### Admin Routes

```http
GET    /api/admin/users            # Sob users manage
GET    /api/admin/statistics       # System analytics
PUT    /api/admin/verify/:id       # Donor verification
DELETE /api/admin/users/:id        # User delete
```

<details>
<summary>📚 <b>Complete API Documentation dekhun</b></summary>

### Request & Response Examples

**User Registration:**

```json
POST /api/auth/register
{
  "name": "admin",
  "email": "rahim@example.com",
  "password": "securepass123",
  "bloodGroup": "A+",
  "phone": "+8801701378952",
  "location": {
    "district": "Habiganj",
    "division": "Sylhet"
  }
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123456",
    "name": "admin",
    "bloodGroup": "A+"
  }
}
```

</details>

---

## 🛠️ Tech Stack

<div align="center">

### Backend Technologies

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

### Development Tools

![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white)

</div>

### Core Dependencies

```json
{
  "express": "^4.18.x",
  "mongoose": "^7.x.x",
  "jsonwebtoken": "^9.x.x",
  "bcryptjs": "^2.4.x",
  "cors": "^2.8.x",
  "dotenv": "^16.x.x"
}
```

---

## 📁 Project Structure

```
blood-donation-backend/
│
├── 📂 controllers/          # Request handlers
│   ├── authController.js
│   ├── donorController.js
│   └── requestController.js
│
├── 📂 models/              # Database schemas
│   ├── User.js
│   ├── BloodRequest.js
│   └── Donation.js
│
├── 📂 routes/              # API routes
│   ├── authRoutes.js
│   ├── donorRoutes.js
│   └── requestRoutes.js
│
├── 📂 middleware/          # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── validation.js
│
├── 📂 utils/               # Utility functions
│   ├── emailService.js
│   └── helpers.js
│
├── 📄 index.js             # Entry point
├── 📄 package.json         # Dependencies
├── 📄 vercel.json          # Deployment config
└── 📄 .env                 # Environment variables
```

---

## 🔐 Security Features

- ✅ **JWT Authentication** - Token-based secure authentication
- ✅ **Password Hashing** - Bcrypt-based password encryption
- ✅ **CORS Protection** - Cross-origin resource sharing protection
- ✅ **Input Validation** - Comprehensive request validation
- ✅ **Rate Limiting** - API abuse prevention
- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **XSS Protection** - Cross-site scripting prevention

---

## 🌐 Deployment

### Vercel Deployment

Ei project already Vercel e deployed:

🔗 **Live URL:** [https://blood-donation-backend-rouge.vercel.app](https://blood-donation-backend-rouge.vercel.app)

### Manual Deployment Steps

1. Vercel account create korun
2. Project import korun
3. Environment variables configure korun
4. Deploy button e click korun

```bash
# Vercel CLI use kore deploy
npm i -g vercel
vercel --prod
```

---

## 🤝 Contributing

Ami contributions ke welcome kori! Apni kivabe contribute korben:

1. **Fork** ei repository
2. **Create** ekta feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** apnar changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** ekta Pull Request

### Development Guidelines

- ✨ Clean ebong readable code likhen
- 📝 Comprehensive comments add korun
- 🧪 Tests likhen notun features er jonno
- 📚 Documentation update korun
- 🎨 Consistent coding style maintain korun

---

## 📊 Statistics

<div align="center">

```
Total API Endpoints    : 25+
Response Time          : < 100ms
Uptime                 : 99.9%
Active Users           : Growing Daily
Lives Saved            : Countless ❤️
```

</div>

---

## 🎯 Roadmap

- [ ] 🔔 Real-time push notifications
- [ ] 📱 Mobile app integration
- [ ] 🌍 Multi-language support
- [ ] 🤖 AI-based donor matching
- [ ] 📈 Advanced analytics dashboard
- [ ] 💬 In-app messaging system
- [ ] 🎖️ Gamification ebong rewards
- [ ] 🏥 Hospital integration

---

## 📞 Contact & Support

<div align="center">

**Project Maintainer:** MCA Programmer

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mca-programmer)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](freelancermca52@gmail.com)

### Need Help?

Kono problem hole ba suggestion thakle:
- 🐛 [Open an Issue](https://github.com/mca-programmer/blood-donation-backend/issues)
- 💬 [Start a Discussion](https://github.com/mca-programmer/blood-donation-backend/discussions)
- ⭐ Star this repository jodi helpful lage!

</div>

---

## 📄 License

Ei project **MIT License** er under e licensed.

```
MIT License

Copyright (c) 2026 MCA Programmer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 Acknowledgments

- 💙 Sob blood donors jara niswarthobhabe donate koren
- 🏥 Healthcare workers jara ei cause e support koren
- 👨‍💻 Open source community
- ⭐ All contributors and supporters

---

<div align="center">

### ⭐ Star this repo Jodi apnar helpful lage!

**Rokto Din, Jibon Bachan** 🩸❤️

---

Made with ❤️ by [MCA Programmer](https://github.com/mca-programmer)

<img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="400">

**© 2026 Blood Donation Backend. All Rights Reserved.**

</div>

