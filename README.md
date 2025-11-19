# Futuristic Personal Website 🚀

A modern personal website with futuristic blue sky theme and secure admin file upload functionality.

![Next.js](https://img.shields.io/badge/Next.js-16.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Authentication](https://img.shields.io/badge/Auth-JWT-green)

## ✨ Features

- **Futuristic Design**: Stunning blue sky theme with glassmorphism, smooth gradients, and dynamic animations
- **Secure Admin Panel**: Password-protected dashboard with JWT authentication
- **File Upload System**: Easy drag-and-drop file uploads with support for multiple file types
- **File Management**: View, download, and delete uploaded files
- **Responsive Design**: Works perfectly on all devices
- **Modern Tech Stack**: Built with Next.js 14, TypeScript, and cutting-edge web technologies

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   ADMIN_PASSWORD_HASH=$2b$10$rZiUSugvqqAMugsaId2U1Okvj4duJ3q7cIt/If/Qt10fMo6fLQVsO
   JWT_SECRET=your-secret-jwt-key-change-this-in-production
   ```
   
   **Default admin password**: `admin123`
   
   > ⚠️ **Important**: Change the default password in production!

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Admin Access

1. Navigate to [http://localhost:3000/login](http://localhost:3000/login)
2. Enter password: `admin123` (default)
3. Access the admin dashboard to upload and manage files

## 🔑 Changing the Admin Password

To set a custom admin password:

1. **Generate a password hash**
   ```bash
   node generate-hash.js
   ```
   This will output a bcrypt hash for the password "admin123"

2. **Or generate a hash for your custom password**
   
   Run this in Node.js console:
   ```javascript
   const bcrypt = require('bcryptjs');
   bcrypt.hash('your-new-password', 10).then(console.log);
   ```

3. **Update `.env.local`**
   
   Replace the `ADMIN_PASSWORD_HASH` value with your new hash

4. **Restart the server**
   ```bash
   npm run dev
   ```

## 📁 File Upload

- Maximum file size: **10MB**
- Uploaded files are stored in `/public/uploads`
- Files are publicly accessible via URL if you know the filename
- For production, consider implementing private file serving with authentication

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Authentication**: JWT with HTTP-only cookies
- **Password Hashing**: bcryptjs
- **Styling**: Custom CSS with futuristic design system
- **File Handling**: Native Node.js fs module

## 📦 Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── upload/       # File upload endpoint
│   │   └── files/        # File management endpoint
│   ├── admin/            # Admin dashboard
│   ├── login/            # Login page
│   ├── globals.css       # Global styles & design system
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── FileUpload.tsx    # Drag-and-drop upload
│   └── FileList.tsx      # File list display
├── lib/                  # Utilities
│   └── auth.ts           # Authentication utilities
├── public/
│   └── uploads/          # Uploaded files directory
└── middleware.ts         # Route protection
```

## 🔧 Scripts

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Generate password hash
node generate-hash.js
```

## 🎨 Design System

The website uses a futuristic blue sky theme with:

- **Color Palette**: Bright blues (#00A3FF, #0066CC), sky whites (#F0F8FF)
- **Effects**: Glassmorphism, gradients, glow effects
- **Typography**: Orbitron for headings, Inter for body text
- **Animations**: Smooth transitions and micro-interactions

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `ADMIN_PASSWORD_HASH`
   - `JWT_SECRET`
4. Deploy!

### Other Platforms

Make sure to:
- Set environment variables
- Enable Node.js 18+
- Configure build command: `npm run build`
- Configure start command: `npm start`

## 🔒 Security Notes

1. **Change default password** before going to production
2. **Use HTTPS** in production for secure cookies
3. **Set strong JWT_SECRET** (use a random 32+ character string)
4. **Consider rate limiting** for login attempts
5. **File uploads** are stored in public directory - implement private storage for sensitive files

## 📝 License

ISC

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

Built with ❤️ using Next.js and modern web technologies
