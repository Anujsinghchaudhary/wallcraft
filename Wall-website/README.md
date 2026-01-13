# 🎨 WallCraft - Premium iPhone Live Wallpapers Store

A modern, premium e-commerce platform for selling iPhone live wallpapers. Built with Next.js 14, featuring multiple payment options, instant email delivery, and a powerful admin dashboard.

![WallCraft](https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&h=400&fit=crop)

---

## 📑 Table of Contents

1. [Features](#-features)
2. [Quick Start](#-quick-start)
3. [How the Website Works](#-how-the-website-works)
4. [Admin Panel Guide](#-admin-panel-guide)
5. [Adding New Wallpapers](#-adding-new-wallpapers)
6. [Setting Up Payments](#-setting-up-payments)
7. [Setting Up Email Delivery](#-setting-up-email-delivery)
8. [Deployment Guide](#-deployment-guide)
9. [Managing Orders](#-managing-orders)
10. [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### For Customers
- 🖼️ Browse and preview live wallpapers
- 🎬 Video preview on hover
- 🔐 Secure authentication
- 💳 Multiple payment options (Cards, PayPal, UPI, Crypto)
- 📧 Instant email delivery with download links
- 📱 Mobile-first, iPhone-optimized design

### For Admin
- 📊 Dashboard with sales analytics
- 🎨 Easy wallpaper management (Add/Edit/Delete)
- 📦 Order management
- 📧 Manual email resend capability
- 🏷️ Category management

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Navigate to project
cd Wall-website

# 2. Install dependencies
npm install

# 3. Set up environment
cp env.template .env

# 4. Set up database
npm run db:generate
npm run db:push
npm run db:seed

# 5. Start server
npm run dev
```

### Default Admin Login
| Field | Value |
|-------|-------|
| Email | `admin@wallcraft.com` |
| Password | `admin123` |

---

## 🎯 How the Website Works

### Customer Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Visit     │ -> │   Browse    │ -> │   Select    │ -> │    Pay      │ -> │  Download   │
│   Website   │    │  Wallpapers │    │  Wallpaper  │    │             │    │  via Email  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Admin Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login to  │ -> │   Upload    │ -> │  Customer   │ -> │   Money     │
│    Admin    │    │  Wallpapers │    │    Pays     │    │  Received   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Money Flow
```
Customer Pays $2.99
       ↓
Payment Gateway (Stripe/PayPal)
       ↓
Processing Fee (~3%) = $0.09
       ↓
You Receive = $2.90
       ↓
Bank Transfer (2-7 days)
```

---

## 🔐 Admin Panel Guide

### Accessing Admin Panel

**Method 1: Through Login**
1. Go to `/login`
2. Enter admin credentials
3. Click profile icon → "Admin Dashboard"

**Method 2: Direct URL**
- Go to `/admin`

### Admin Dashboard Sections

| Section | Purpose |
|---------|---------|
| **Dashboard** | Overview, stats, recent orders |
| **Wallpapers** | Add, edit, delete wallpapers |
| **Orders** | View and manage all orders |
| **Categories** | Manage wallpaper categories |
| **Users** | View registered users |

---

## 🎨 Adding New Wallpapers

### Step 1: Prepare Your Files

You need 3 files for each wallpaper:

| File | Purpose | Format | Size |
|------|---------|--------|------|
| **Thumbnail** | Preview image in cards | JPG/PNG | 800x1200px |
| **Preview Video** | Short preview clip | MP4 | 5-10 seconds |
| **Download File** | Actual live wallpaper | MOV/HEIC | Full quality |

### Step 2: Upload to Cloudinary (Free Hosting)

1. **Create Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free account

2. **Upload Files**
   - Click "Media Library"
   - Click "Upload" button
   - Upload all 3 files

3. **Copy URLs**
   - Click on each uploaded file
   - Copy the URL from the details panel

### Step 3: Add Wallpaper in Admin

1. Go to **Admin → Wallpapers → Add Wallpaper**

2. Fill in the form:

| Field | Description | Example |
|-------|-------------|---------|
| **Title** | Wallpaper name | "Northern Lights" |
| **Description** | Short description | "Stunning aurora borealis animation" |
| **Price** | Price in USD | `2.99` |
| **Category** | Select category | Nature |
| **Tags** | Keywords (comma separated) | aurora, night, sky, nature |
| **Thumbnail URL** | Paste Cloudinary URL | `https://res.cloudinary.com/...` |
| **Preview Video URL** | Paste video URL | `https://res.cloudinary.com/...` |
| **Download File URL** | Paste file URL | `https://res.cloudinary.com/...` |
| **Resolution** | Wallpaper size | 1290x2796 |
| **Active** | Show in store | ✅ Checked |
| **Featured** | Show on homepage | ✅ Optional |

3. Click **"Create Wallpaper"**

### Step 4: Verify

- Go to homepage
- Your wallpaper should appear in the grid
- Click it to verify details page works

---

## 💳 Setting Up Payments

### Option 1: Stripe (Credit/Debit Cards) ⭐ Recommended

**Why Stripe?**
- Works worldwide
- Supports all major cards
- Apple Pay & Google Pay included
- Easy setup

**Setup Steps:**

1. **Create Account**
   ```
   Go to: https://stripe.com
   Click "Start now" and sign up
   ```

2. **Complete Verification**
   - Add business details
   - Connect bank account
   - Verify identity

3. **Get API Keys**
   ```
   Stripe Dashboard → Developers → API Keys
   
   Copy these:
   - Publishable key (pk_live_...)
   - Secret key (sk_live_...)
   ```

4. **Set Up Webhook**
   ```
   Stripe Dashboard → Developers → Webhooks → Add endpoint
   
   URL: https://yourdomain.com/api/webhooks/stripe
   Events: checkout.session.completed
   
   Copy the Webhook Secret (whsec_...)
   ```

5. **Add to `.env` file:**
   ```env
   STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
   ```

---

### Option 2: PayPal

**Setup Steps:**

1. **Create Business Account**
   ```
   Go to: https://www.paypal.com/business
   Sign up for business account
   ```

2. **Get API Credentials**
   ```
   PayPal Dashboard → Developer → My Apps & Credentials
   Create new app → Copy Client ID and Secret
   ```

3. **Add to `.env` file:**
   ```env
   PAYPAL_CLIENT_ID=your_client_id_here
   PAYPAL_CLIENT_SECRET=your_secret_here
   PAYPAL_MODE=live
   ```

---

### Option 3: Razorpay (Indian Payments - UPI, Cards, NetBanking)

**Supports:**
- UPI (Google Pay, PhonePe, Paytm)
- Credit/Debit Cards
- Net Banking
- Wallets

**Setup Steps:**

1. **Create Account**
   ```
   Go to: https://razorpay.com
   Sign up and complete KYC verification
   ```

2. **Get API Keys**
   ```
   Razorpay Dashboard → Settings → API Keys → Generate
   ```

3. **Add to `.env` file:**
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxx
   RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxx
   ```

---

### Option 4: Crypto (USDT TRC20)

**Setup Steps:**

1. **Get a TRON Wallet**
   - Download Trust Wallet or TronLink
   - Create new wallet
   - Copy your TRC20 address

2. **Add to `.env` file:**
   ```env
   CRYPTO_WALLET_ADDRESS=your_trc20_address_here
   ```

3. **(Optional) Use NOWPayments for automatic verification**
   ```
   Go to: https://nowpayments.io
   Create account and get API key
   ```
   ```env
   NOWPAYMENTS_API_KEY=your_api_key
   NOWPAYMENTS_IPN_SECRET=your_ipn_secret
   ```

---

## 📧 Setting Up Email Delivery

When a customer purchases, they receive an email with their download link.

### Using Resend (Recommended)

1. **Create Account**
   ```
   Go to: https://resend.com
   Sign up (Free: 3,000 emails/month)
   ```

2. **Add Your Domain**
   ```
   Resend Dashboard → Domains → Add Domain
   Add the DNS records they provide to your domain
   Wait for verification (usually 5-10 minutes)
   ```

3. **Get API Key**
   ```
   Resend Dashboard → API Keys → Create API Key
   Copy the key (starts with re_)
   ```

4. **Add to `.env` file:**
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxx
   EMAIL_FROM=WallCraft <hello@yourdomain.com>
   ```

### Email Template

The system sends beautiful HTML emails with:
- Order confirmation
- Download button
- Order details
- Expiry notice (24 hours default)

---

## 🚀 Deployment Guide

### Option 1: Vercel (Easiest - FREE) ⭐ Recommended

**Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/wallcraft.git
git push -u origin main
```

**Step 2: Deploy on Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect GitHub and select your repo
4. Configure project settings

**Step 3: Set Up Database**
1. Go to [neon.tech](https://neon.tech) (Free PostgreSQL)
2. Create new project
3. Copy connection string

**Step 4: Add Environment Variables**

In Vercel Dashboard → Project → Settings → Environment Variables

Add all these:
```
DATABASE_URL=postgresql://...from-neon...
JWT_SECRET=generate-random-string
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
EMAIL_FROM=WallCraft <hello@yourdomain.com>
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Step 5: Update Prisma for PostgreSQL**

Change `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Step 6: Deploy**
- Click "Deploy"
- Wait for build to complete
- Your site is live! 🎉

**Step 7: Connect Custom Domain**
- Vercel Dashboard → Project → Domains
- Add your domain
- Update DNS records as instructed

---

### Option 2: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

---

### Option 3: DigitalOcean App Platform

1. Create DigitalOcean account
2. Go to App Platform
3. Connect GitHub repo
4. Configure environment variables
5. Deploy

---

## 📊 Managing Orders

### Viewing Orders

Go to **Admin → Orders**

### Order Statuses

| Status | Icon | Meaning |
|--------|------|---------|
| **Pending** | 🟡 | Payment initiated, waiting |
| **Processing** | 🔵 | Payment being processed |
| **Completed** | 🟢 | Paid successfully, email sent |
| **Failed** | 🔴 | Payment failed |
| **Refunded** | ⚪ | Money returned to customer |

### Actions

| Action | How to Do |
|--------|-----------|
| **View Details** | Click on order row |
| **Resend Email** | Click ⋮ → "Resend Download Email" |
| **Mark Complete** | Click ⋮ → "Mark as Completed" |
| **Mark Failed** | Click ⋮ → "Mark as Failed" |

### Filtering Orders

Use the filter buttons:
- **All** - Show all orders
- **Completed** - Only paid orders
- **Pending** - Waiting for payment
- **Failed** - Failed payments

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### ❌ "Database connection failed"
```
Solution:
1. Check DATABASE_URL in .env
2. Make sure database server is running
3. For SQLite: Check if dev.db file exists
4. For PostgreSQL: Verify credentials
```

#### ❌ "Payment not working"
```
Solution:
1. Verify API keys are correct
2. Check if using test vs live keys
3. Ensure webhook URL is correct
4. Check Stripe/PayPal dashboard for errors
```

#### ❌ "Images not loading"
```
Solution:
1. Check if URLs are correct in database
2. Verify Cloudinary/hosting is accessible
3. Check next.config.js has the hostname allowed
```

#### ❌ "Email not sending"
```
Solution:
1. Verify RESEND_API_KEY is correct
2. Check domain is verified in Resend
3. Check email logs in Resend dashboard
```

#### ❌ "Admin login not working"
```
Solution:
1. Run: npm run db:seed
2. Use: admin@wallcraft.com / admin123
3. Check if user exists in database
```

### Debug Mode

Add to `.env` for detailed logs:
```env
DEBUG=prisma:query
```

---

## 📁 Project Structure

```
Wall-website/
├── app/
│   ├── (auth)/           # Login & Signup pages
│   ├── (main)/           # Public pages
│   │   ├── page.tsx      # Homepage
│   │   ├── wallpapers/   # Browse page
│   │   ├── wallpaper/    # Detail page
│   │   ├── checkout/     # Checkout page
│   │   └── dashboard/    # User dashboard
│   ├── admin/            # Admin panel
│   └── api/              # API routes
├── components/           # React components
├── lib/                  # Utilities
├── prisma/              # Database schema
└── public/              # Static files
```

---

## ✅ Pre-Launch Checklist

Before going live, verify:

- [ ] **Payments**
  - [ ] Stripe account verified and live keys added
  - [ ] Webhook endpoint configured
  - [ ] Test purchase works

- [ ] **Email**
  - [ ] Resend domain verified
  - [ ] Test email sends correctly

- [ ] **Content**
  - [ ] At least 10 wallpapers uploaded
  - [ ] All images loading correctly
  - [ ] Prices set correctly

- [ ] **Security**
  - [ ] Changed default admin password
  - [ ] JWT_SECRET is unique and secure
  - [ ] HTTPS enabled (automatic on Vercel)

- [ ] **Domain**
  - [ ] Custom domain connected
  - [ ] SSL certificate active

---

## 📞 Support

| Resource | Link |
|----------|------|
| Documentation | This README |
| Stripe Docs | https://stripe.com/docs |
| Vercel Docs | https://vercel.com/docs |
| Prisma Docs | https://prisma.io/docs |

---

## 📄 License

MIT License - Free for personal and commercial use.

---

Made with ❤️ for iPhone wallpaper creators

**Happy Selling! 🎉💰**
