# Diffa Tours - Complete Website Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Design System](#design-system)
- [Features](#features)
- [Pages & Routes](#pages--routes)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Payment System](#payment-system)
- [Internationalization](#internationalization)
- [Admin Panel](#admin-panel)
- [Staff Panel](#staff-panel)
- [E-Badge System](#e-badge-system)
- [Integrations](#integrations)
- [Environment Variables](#environment-variables)

---

## 🌟 Overview

**Diffa Tours** is a comprehensive travel agency website specializing in Moroccan excursions and tours. The platform offers a complete booking experience with multi-language support, advanced admin capabilities, real-time availability tracking, and innovative e-badge technology for tourists.

### Purpose
- Promote and sell excursions across Morocco (Marrakech, Agadir, Taghazout, Circuits)
- Provide seamless booking and payment experience
- Manage reservations, capacity, and tourist verification
- Support multiple languages and currencies
- Enable staff to scan and verify tourist badges

### Target Users
- **Tourists**: Browse, book, and pay for excursions
- **Administrators**: Manage content, orders, users, and analytics
- **Staff**: Verify tourist badges via QR code scanning

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router with Turbopack)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: 
  - Tailwind CSS 4
  - Custom CSS with glassmorphism effects
  - tw-animate-css for animations
- **Component Library**: 
  - Radix UI (dialogs, dropdowns, tabs, etc.)
  - Shadcn/UI components
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion, Motion DOM
- **3D Graphics**: Three.js, React Three Fiber
- **Charts**: Recharts
- **Notifications**: Sonner (toast notifications)

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB (via Mongoose)
- **Authentication**: Clerk (user management + OAuth)
- **Payment Processing**: CMI Payment Gateway + Cash on pickup
- **Email**: Nodemailer + Resend
- **SMS/WhatsApp**: Twilio
- **Image Uploads**: Cloudinary
- **PDF Generation**: React-PDF + Puppeteer
- **QR Codes**: qrcode library

### Development Tools
- **Package Manager**: Bun
- **Linting**: ESLint 9
- **Code Quality**: TypeScript strict mode
- **Version Control**: Git

---

## 🏗 Architecture

### Project Structure
```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalized routes (fr, en, es, it)
│   │   ├── page.tsx              # Homepage
│   │   ├── nos-excursions/       # Excursions listing
│   │   ├── marrakech/            # Marrakech excursions
│   │   ├── agadir/               # Agadir excursions
│   │   ├── taghazout/            # Taghazout excursions
│   │   ├── circuits/             # Multi-day circuits
│   │   ├── excursion/[slug]/     # Individual excursion pages
│   │   ├── cart/                 # Shopping cart
│   │   ├── checkout/             # Checkout flow
│   │   ├── payment/[orderNumber]/ # Payment processing
│   │   ├── order-confirmation/   # Order success page
│   │   ├── badge/[badgeCode]/    # E-badge verification
│   │   ├── mon-compte/           # User account
│   │   ├── mes-reservations/     # User reservations
│   │   ├── favoris/              # Wishlist
│   │   ├── contact/              # Contact form
│   │   ├── admin/                # Admin dashboard
│   │   ├── staff/                # Staff panel (QR scanning)
│   │   ├── sign-in/              # Authentication
│   │   └── sign-up/              # Registration
│   ├── api/                      # Backend API routes
│   │   ├── admin/                # Admin APIs
│   │   ├── orders/               # Order management
│   │   ├── badges/               # E-badge system
│   │   ├── excursions/           # Excursion data
│   │   ├── capacity/             # Availability tracking
│   │   ├── payment/              # Payment processing
│   │   ├── reviews/              # Review system
│   │   ├── wishlists/            # Wishlist management
│   │   ├── notifications/        # User notifications
│   │   └── webhooks/             # Third-party webhooks
│   ├── globals.css               # Global styles with design tokens
│   └── layout.tsx                # Root layout
├── components/
│   ├── sections/                 # Page sections (Header, Footer, Hero, etc.)
│   ├── ui/                       # Reusable UI components
│   └── floating-whatsapp.tsx     # Persistent WhatsApp button
├── contexts/                     # React contexts (Cart, Currency)
├── hooks/                        # Custom React hooks
├── i18n/                         # Internationalization config
├── lib/                          # Utility functions
├── models/                       # MongoDB/Mongoose schemas
└── emails/                       # Email templates
```

### Key Architectural Patterns
- **Server-Side Rendering (SSR)**: Pages rendered on server for SEO
- **Client Components**: Interactive elements marked with "use client"
- **API Route Handlers**: RESTful endpoints in `/api` folder
- **Context Providers**: Global state management (Cart, Currency)
- **Protected Routes**: Admin/Staff panels require authentication
- **Internationalized Routing**: `/[locale]` pattern for multi-language support

---

## 🎨 Design System

### Typography
- **Display Font**: Libre Baskerville (serif) - For headings
- **Body Font**: Lexend Deca (sans-serif) - For content
- **Script Font**: Libre Baskerville (italic) - For accents

### Color Palette
```css
--color-primary: #FFB73F        /* Golden yellow */
--color-accent: #70CFF1         /* Sky blue */
--color-secondary: #f0f7fb      /* Light blue-gray */
--color-foreground: #1a1a1a     /* Dark text */
--color-background: #ffffff     /* White */
--color-muted: #666666          /* Gray */
--color-destructive: #c67b5c    /* Muted red */
```

### Design Features
- **Glassmorphism Effects**: Frosted glass UI elements with backdrop blur
- **Pill-Shaped Buttons**: Fully rounded buttons (border-radius: 9999px)
- **20px Border Radius**: Consistent rounded corners on cards
- **Smooth Animations**: Fade-in, scale, hover effects
- **75% Dark Overlays**: Background images with dark tint
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant, focus states, ARIA labels

### Background
- **Default Background Image**: Unsplash abstract background
- Fixed attachment (parallax effect)
- Covers entire viewport

### Special Elements
- **Floating WhatsApp Button**: Fixed bottom-left, always visible
- **Glass Cards**: Transparent cards with blur effect
- **Gradient Buttons**: Primary and secondary gradient styles
- **Shimmer Effects**: Hover animations on buttons
- **Scroll Animations**: Elements fade in on scroll

---

## ✨ Features

### 1. **Multi-Language Support** 🌍
- Supports 4 languages: French (FR), English (EN), Spanish (ES), Italian (IT)
- Default language: French
- Language switcher in header
- All content translated dynamically

### 2. **Multi-Currency Support** 💱
- Supports 3 currencies: MAD, USD, EUR
- Real-time currency conversion
- Persistent currency selection (localStorage)
- Display format: "DH" for MAD, "$" for USD, "€" for EUR

### 3. **Shopping Cart System** 🛒
- Add/remove excursions
- Multiple date selections
- Age group pricing (0-4, 4-12, adult)
- Optional add-ons/items
- Persistent cart (localStorage)
- Real-time total calculation

### 4. **Advanced Booking System** 📅
- Date-specific reservations
- Capacity management per excursion/date
- Real-time availability checking
- Age group tracking
- Multiple excursions per order

### 5. **Dual Payment System** 💳
- **Cash Payment**: Pay on pickup (pending approval)
- **CMI Online Payment**: Secure credit card processing
- Payment status tracking
- Transaction logging

### 6. **E-Badge System** 🎫
- QR code badges for verified tourists
- Generated upon order confirmation
- Includes tourist info, trip details, validity dates
- Scannable by staff via mobile app
- Revocable by admin
- Email delivery with badge

### 7. **Review System** ⭐
- Star ratings (1-5)
- Written reviews
- User authentication required
- Display on excursion pages
- Moderation capabilities

### 8. **Wishlist/Favorites** ❤️
- Save favorite excursions
- Quick access from header
- Authenticated users only
- Add/remove functionality

### 9. **Notification System** 🔔
- In-app notifications
- Order status updates
- Reservation confirmations
- Mark as read functionality
- Badge count display

### 10. **Analytics Dashboard** 📊
- Revenue tracking
- Order statistics
- Top excursions report
- Payment method breakdown
- Monthly trends
- Charts and graphs (Recharts)

### 11. **Contact Forms** 📧
- General inquiries
- Newsletter subscription
- Form validation
- Email notifications

### 12. **Responsive Design** 📱
- Mobile-optimized layouts
- Tablet breakpoints
- Desktop experience
- Touch-friendly interactions

---

## 📄 Pages & Routes

### Public Pages
| Route | Description | Features |
|-------|-------------|----------|
| `/[locale]` | Homepage | Hero, services, testimonials, gallery, newsletter |
| `/[locale]/nos-excursions` | Excursions directory | Category cards (Marrakech, Agadir, Taghazout, Circuits) |
| `/[locale]/marrakech` | Marrakech excursions | Filtered list, booking options |
| `/[locale]/agadir` | Agadir excursions | Beach/coastal tours |
| `/[locale]/taghazout` | Taghazout excursions | Surf village experiences |
| `/[locale]/circuits` | Multi-day circuits | Desert tours, extended trips |
| `/[locale]/excursion/[slug]` | Individual excursion | Details, gallery, booking, reviews |
| `/[locale]/qui-sommes-nous` | About us | Company info, team |
| `/[locale]/autres-services` | Other services | Additional offerings |
| `/[locale]/contact` | Contact page | Contact form, map |
| `/[locale]/cart` | Shopping cart | Cart items, totals, checkout button |
| `/[locale]/checkout` | Checkout flow | Personal info, payment selection, confirmation |
| `/[locale]/payment/[orderNumber]` | Payment processing | CMI gateway integration |
| `/[locale]/order-confirmation/[orderNumber]` | Order success | Order summary, badge download |

### Authenticated Pages
| Route | Description | Access |
|-------|-------------|--------|
| `/[locale]/mon-compte` | User profile | Signed-in users |
| `/[locale]/mes-reservations` | User reservations | Signed-in users |
| `/[locale]/favoris` | Wishlist | Signed-in users |

### Admin Pages
| Route | Description | Access |
|-------|-------------|--------|
| `/[locale]/admin` | Admin dashboard | Admin role only |
| - Analytics Tab | Revenue, orders, charts | Admin |
| - Users Tab | User management, role assignment | Admin |
| - Orders Tab | Order status, confirmation, deletion | Admin |
| - Badges Tab | E-badge management, revocation | Admin |
| - Services Tab | Service CRUD operations | Admin |
| - Excursions Tab | Excursion CRUD, price visibility | Admin |

### Staff Pages
| Route | Description | Access |
|-------|-------------|--------|
| `/[locale]/staff` | Staff dashboard | Staff/Admin role |
| `/[locale]/staff/scanner` | QR code scanner | Staff/Admin |
| `/[locale]/staff/history` | Scan history | Staff/Admin |

### Special Pages
| Route | Description | Access |
|-------|-------------|--------|
| `/[locale]/badge/[badgeCode]` | E-badge display | Public (with code) |
| `/[locale]/sign-in` | Login page | Public |
| `/[locale]/sign-up` | Registration page | Public |

---

## 🗄 Database Models

### MongoDB Collections

#### 1. **User**
```typescript
{
  clerkId: string (unique)
  email: string
  name: string
  phone: string
  role: string (admin/staff/user)
  createdAt: Date
}
```

#### 2. **Order**
```typescript
{
  orderNumber: string (unique)
  userClerkId: string (optional)
  firstName: string
  lastName: string
  email: string
  phone: string
  passport: string
  city: string
  accommodationType: string
  hotelName: string (optional)
  address: string (optional)
  paymentMethod: string (cash/cmi)
  cartItems: string (JSON)
  totalMad: number
  status: string (pending/confirmed/cancelled)
  paymentStatus: string (pending/paid/failed)
  transactionId: string (optional)
  createdAt: Date
}
```

#### 3. **TouristBadge**
```typescript
{
  orderId: ObjectId
  orderNumber: string
  badgeCode: string (unique)
  touristName: string
  email: string
  phone: string
  tripDetails: string
  status: string (active/revoked/expired)
  validFrom: string
  validUntil: string
  generatedAt: string
  revokedAt: string (optional)
  revokedBy: ObjectId (optional)
  revokedReason: string (optional)
  createdAt: Date
}
```

#### 4. **BadgeScan**
```typescript
{
  badgeId: ObjectId
  badgeCode: string
  scannedBy: ObjectId
  scannedAt: Date
  location: string (optional)
  notes: string (optional)
}
```

#### 5. **Excursion**
```typescript
{
  id: string (unique slug)
  name: string
  section: string (marrakech/agadir/taghazout/circuits)
  images: string[]
  priceMAD: number
  location: string
  duration: string
  groupSize: string
  rating: number
  description: string
  highlights: string[]
  included: string[]
  notIncluded: string[]
  items: { id, label, price, defaultChecked }[]
  ageGroups: boolean
  createdAt: Date
}
```

#### 6. **ExcursionCapacity**
```typescript
{
  excursion_id: string
  date: string
  capacity_limit: number (optional)
  booked_count: number
  createdAt: Date
}
```

#### 7. **ExcursionSetting**
```typescript
{
  section: string (unique)
  showPrice: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### 8. **Service**
```typescript
{
  title: { en, fr, es, it }
  description: { en, fr, es, it }
  icon: string
  order: number
  active: boolean
  createdAt: Date
}
```

#### 9. **Review**
```typescript
{
  excursionId: string
  userClerkId: string
  rating: number (1-5)
  comment: string
  createdAt: Date
}
```

#### 10. **Wishlist**
```typescript
{
  userClerkId: string
  excursionId: string
  createdAt: Date
}
```

#### 11. **Notification**
```typescript
{
  userClerkId: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: Date
}
```

#### 12. **ContactSubmission**
```typescript
{
  name: string
  email: string
  phone: string
  message: string
  createdAt: Date
}
```

#### 13. **WhatsappLog / SmsLog**
```typescript
{
  orderId: ObjectId
  recipientPhone: string
  message: string
  status: string
  sentAt: Date
}
```

---

## 🔌 API Endpoints

### Admin APIs
- `GET /api/admin/analytics` - Dashboard analytics data
- `GET /api/admin/users` - List users (with search/filter)
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user
- `PUT /api/admin/users/[id]/assign-role` - Assign staff role
- `POST /api/admin/sync-users` - Sync Clerk users to MongoDB

- `GET /api/admin/orders` - List orders (with search/filter)
- `PUT /api/admin/orders/[id]` - Update order status
- `DELETE /api/admin/orders/[id]` - Delete order
- `POST /api/admin/orders/[id]/send-confirmation` - Send confirmation email

- `GET /api/admin/services` - List services
- `POST /api/admin/services` - Create service
- `PUT /api/admin/services/[id]` - Update service
- `DELETE /api/admin/services/[id]` - Delete service

- `GET /api/admin/excursions` - List excursions
- `POST /api/admin/excursions` - Create excursion
- `PUT /api/admin/excursions/[id]` - Update excursion
- `DELETE /api/admin/excursions/[id]` - Delete excursion

- `GET /api/admin/excursion-settings` - Get price visibility settings
- `PUT /api/admin/excursion-settings/[section]` - Update visibility

- `POST /api/admin/upload-image` - Upload image to Cloudinary

### Badge APIs
- `GET /api/badges` - List badges (with search/filter)
- `GET /api/badges/[badgeCode]` - Get badge details
- `POST /api/badges/[badgeCode]/revoke` - Revoke badge
- `DELETE /api/badges/[badgeCode]` - Delete badge
- `POST /api/badges/scan` - Record badge scan
- `GET /api/badges/scan-history` - Get scan history

### Order APIs
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details
- `GET /api/orders/number/[order_number]` - Get order by number
- `PUT /api/orders/payment/[order_number]` - Update payment status

### Excursion APIs
- `GET /api/excursions` - List all excursions
- `GET /api/excursions/[slug]` - Get excursion details

### Capacity APIs
- `GET /api/capacity/check` - Check availability
- `GET /api/capacity/calendar/[excursion_id]` - Get capacity calendar
- `GET /api/capacity/excursion/[excursion_id]` - Get excursion capacities
- `POST /api/capacity` - Set capacity for date
- `PUT /api/capacity/[id]` - Update capacity
- `POST /api/capacity/bulk` - Bulk capacity operations

### Payment APIs
- `POST /api/payment/cmi` - Initiate CMI payment
- `POST /api/payment/cmi/status` - Check CMI status
- `GET /api/payments/initiate` - Start payment
- `POST /api/payments/callback` - Payment callback
- `GET /api/payments/success` - Payment success
- `GET /api/payments/fail` - Payment failure

### Review APIs
- `GET /api/reviews/excursion/[slug]` - Get excursion reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/user/[clerk_id]` - Get user reviews
- `DELETE /api/reviews/[id]` - Delete review

### Wishlist APIs
- `GET /api/wishlists/user/[clerk_id]` - Get user wishlist
- `POST /api/wishlists` - Add to wishlist
- `DELETE /api/wishlists/[id]` - Remove from wishlist
- `GET /api/wishlists/check` - Check if excursion is favorited

### Notification APIs
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/[id]` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read

### Contact APIs
- `POST /api/contact` - Submit contact form

### Translation APIs
- `GET /api/translations/[locale]/[namespace]` - Get translations

### Webhook APIs
- `POST /api/webhooks/clerk` - Clerk user sync webhook

---

## 🔐 Authentication & Authorization

### Provider: Clerk

### User Roles
1. **Admin**
   - Full system access
   - Can manage users, orders, badges, content
   - Access to analytics dashboard
   - Can assign staff roles

2. **Staff**
   - Can scan QR badges
   - View scan history
   - Limited order viewing

3. **User** (default)
   - Can book excursions
   - Manage account and reservations
   - Add favorites, write reviews

### Authentication Flow
1. User signs up/in via Clerk (email/password or OAuth)
2. Clerk webhook syncs user to MongoDB
3. Role stored in MongoDB User collection
4. Role checked on protected routes via API

### Protected Routes
- `/admin` - Admin only
- `/staff` - Staff or Admin
- `/mon-compte` - Authenticated users
- `/mes-reservations` - Authenticated users
- `/favoris` - Authenticated users

### Authorization Checks
```typescript
// Example: Admin check
const isAdmin = clerkUser?.publicMetadata?.role === 'admin';
if (!isAdmin) {
  router.push('/');
  return;
}
```

---

## 💳 Payment System

### Payment Methods

#### 1. **Cash on Pickup**
- Default payment method
- Order created with status "pending"
- Admin manually confirms order
- E-badge generated upon confirmation

#### 2. **CMI Payment Gateway**
- Moroccan online payment processor
- Credit/debit card payments
- 3D Secure authentication
- Automatic order confirmation on success

### Payment Flow

**Cash Payment:**
1. User selects "Cash" at checkout
2. Order created with `paymentStatus: "pending"`
3. Admin receives notification
4. Admin confirms order manually
5. E-badge generated and emailed
6. Order status changes to "confirmed"

**CMI Payment:**
1. User selects "CMI" at checkout
2. Order created in database
3. User redirected to CMI gateway
4. User enters card details
5. CMI processes payment
6. Callback updates order status
7. E-badge generated automatically
8. User redirected to confirmation page

### Payment Tracking
- Transaction ID stored in Order
- Payment response logged
- Status updates: `pending` → `paid` / `failed`
- Refund support (manual)

---

## 🌐 Internationalization (i18n)

### Supported Languages
- **French (FR)** - Default
- **English (EN)**
- **Spanish (ES)**
- **Italian (IT)**

### Implementation
- Route-based locale: `/[locale]/page`
- Custom hooks: `useTranslations()`, `useLocale()`
- Translation files in `messages/` folder
- Dynamic language switching in header
- Persistent locale preference

### Translation Keys
Organized by namespace:
- `nav.*` - Navigation
- `footer.*` - Footer
- `checkout.*` - Checkout flow
- `admin.*` - Admin panel
- `errors.*` - Error messages
- etc.

### Date/Number Formatting
- Dates formatted per locale
- Currency symbols localized
- Number separators (commas vs periods)

---

## 👨‍💼 Admin Panel

### Access
- URL: `/[locale]/admin`
- Role required: Admin
- Clerk authentication

### Features

#### **1. Analytics Dashboard**
- **Metrics Cards**:
  - Total Revenue (MAD)
  - Total Orders
  - Confirmed Orders
  - Pending Orders
  
- **Charts**:
  - Revenue Over Time (Line chart)
  - Orders by Status (Pie chart)
  - Revenue by Payment Method (Bar chart)
  
- **Tables**:
  - Top Excursions (bookings + revenue)

#### **2. User Management**
- List all users
- Search by name/email
- Filter by role (admin/staff/user)
- Edit user details
- Assign staff role
- Delete users
- Sync Clerk users to database

#### **3. Order Management**
- List all orders
- Search by order number/customer
- Filter by status (pending/confirmed/cancelled)
- Update order status
- Confirm orders (generates badge)
- View badges
- Delete orders
- Send confirmation emails

#### **4. Badge Management**
- List all e-badges
- Search by badge code/tourist name
- Filter by status (active/revoked/expired)
- Revoke badges
- Delete badges
- View scan count

#### **5. Service Management**
- CRUD operations on services
- Multi-language support (4 languages)
- Icon assignment
- Order/priority setting
- Active/inactive toggle

#### **6. Excursion Management**
- CRUD operations per section (Marrakech, Agadir, Taghazout, Circuits)
- Image upload (Cloudinary) or URL
- Pricing configuration
- Booking items/add-ons
- Age group pricing
- Highlights, inclusions, exclusions
- Price visibility toggle per section

### Admin UI
- Tab-based interface
- Data tables with sorting
- Modal dialogs for editing
- Real-time data updates
- Loading states
- Error handling
- Glassmorphism design

---

## 👷 Staff Panel

### Access
- URL: `/[locale]/staff`
- Role required: Staff or Admin
- Clerk authentication

### Features

#### **1. QR Code Scanner**
- Camera-based scanning
- Real-time badge verification
- Scan result display:
  - Tourist name
  - Badge status
  - Trip details
  - Validity dates
  - Scan count
- Success/error feedback
- Location tracking (optional)
- Notes field

#### **2. Scan History**
- List of all scans by current user
- Date/time stamps
- Badge details
- Filter by date range
- Export capability

### Staff UI
- Mobile-optimized
- Large scan button
- Camera permissions handling
- Offline mode support (future)
- Touch-friendly interface

---

## 🎫 E-Badge System

### What is an E-Badge?
A digital QR code badge issued to tourists upon order confirmation, serving as proof of booking and verification tool for staff.

### Badge Generation
- **Trigger**: Order confirmation (admin or automatic)
- **Code Format**: `BADGE-[TIMESTAMP]-[RANDOM]`
- **Contains**:
  - Tourist name, email, phone
  - Order number
  - Trip details (excursions, dates)
  - Validity period
  - QR code (scannable)

### Badge Features
- **QR Code**: Links to `/badge/[badgeCode]` page
- **PDF Download**: Printable version
- **Email Delivery**: Sent automatically with confirmation
- **Status Tracking**: active/revoked/expired
- **Scan Logging**: Every scan recorded with user/time
- **Revocation**: Admin can revoke badges
- **Expiration**: Optional validity dates

### Badge Page
- Public access (with code)
- Displays tourist info
- Shows trip details
- QR code prominent
- Download PDF button
- Status indicator
- Scan count display

### Use Cases
1. **Hotel Check-in**: Staff verify tourist identity
2. **Tour Pickup**: Confirm booking at meeting point
3. **Access Control**: Entry to exclusive locations
4. **Capacity Management**: Track attendance

---

## 🔗 Integrations

### 1. **Clerk** (Authentication)
- User sign-up/sign-in
- OAuth providers (Google, etc.)
- Session management
- User metadata storage
- Webhook for user sync

### 2. **MongoDB** (Database)
- Primary data storage for all collections
- Mongoose ODM for schema management
- Collections for orders, users, badges, excursions, etc.
- Connection via MONGODB_URI environment variable
- Supports all database operations

### 3. **Cloudinary** (Image Hosting)
- Excursion image uploads
- Image optimization
- CDN delivery
- Transformation API

### 4. **CMI Payment Gateway**
- Moroccan payment processor
- Credit/debit card processing
- 3D Secure integration
- Callback/webhook handling

### 5. **Nodemailer / Resend** (Email)
- Order confirmations
- Badge delivery
- Contact form notifications
- Newsletter emails

### 6. **Twilio** (SMS/WhatsApp)
- SMS notifications
- WhatsApp messaging
- Booking reminders
- Status updates

### 7. **Puppeteer** (PDF Generation)
- E-badge PDFs
- Invoice generation
- Headless browser rendering

### 8. **QRCode Library**
- QR code generation
- Badge encoding
- SVG/PNG output

---

## 🔑 Environment Variables

### Required Variables
```env
# MongoDB Database (Primary)
MONGODB_URI=mongodb+srv://...

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# Payment (CMI)
CMI_CLIENT_ID=...
CMI_STORE_KEY=...
CMI_GATEWAY_URL=https://...

# Image Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email
RESEND_API_KEY=re_...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# SMS/WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
TWILIO_WHATSAPP_NUMBER=...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎯 Key Highlights

### Unique Features
1. **E-Badge System**: First-of-its-kind digital tourist verification
2. **Dual Payment Options**: Flexible cash or online payment
3. **Real-time Capacity**: Live availability tracking
4. **Multi-language**: True internationalization with 4 languages
5. **Admin Analytics**: Business intelligence dashboard
6. **Staff QR Scanner**: Mobile-optimized badge verification
7. **Glassmorphism UI**: Modern, elegant design system
8. **Persistent Cart**: Save cart across sessions
9. **Age Group Pricing**: Flexible pricing for families
10. **Wishlist System**: Save favorite excursions

### Performance Optimizations
- Next.js 15 with Turbopack (fast builds)
- Server-side rendering (SEO + speed)
- Image optimization (Next/Image)
- Lazy loading components
- Code splitting
- Efficient state management
- LocalStorage caching

### Security Features
- Clerk authentication (industry standard)
- Role-based access control
- API route protection
- Input validation (Zod schemas)
- XSS prevention
- CSRF protection
- Secure payment processing
- Environment variable encryption

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Hamburger menu
- Touch-optimized buttons
- Swipeable galleries
- Simplified checkout
- Bottom navigation
- Full-screen modals

### Desktop Features
- Multi-column layouts
- Hover effects
- Larger images
- Sidebar navigation
- Expanded tables

---

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database connections tested
- [ ] Payment gateway in live mode
- [ ] Email/SMS providers configured
- [ ] Images uploaded to CDN
- [ ] Analytics tracking added
- [ ] Error logging setup
- [ ] Performance monitoring
- [ ] SEO meta tags
- [ ] Sitemap generated
- [ ] robots.txt configured

### Recommended Hosting
- **Frontend**: Vercel (Next.js optimized)
- **Database**: MongoDB Atlas
- **Images**: Cloudinary
- **Email**: Resend
- **Monitoring**: Sentry, LogRocket

---

## 📊 Analytics & Tracking

### Admin Analytics
- Revenue metrics
- Order statistics
- Top-performing excursions
- Payment method breakdown
- Monthly trends

### Future Enhancements
- Google Analytics integration
- Conversion tracking
- User behavior analytics
- A/B testing
- Heatmaps

---

## 🛡 Error Handling

### Client-Side
- Toast notifications (Sonner)
- Form validation errors
- Network error recovery
- Loading states
- Fallback UI

### Server-Side
- Try-catch blocks
- Error logging
- Graceful degradation
- User-friendly error messages
- Status codes (400, 401, 404, 500)

---

## 🔮 Future Roadmap

### Planned Features
1. **Live Chat**: Real-time customer support
2. **Mobile App**: Native iOS/Android apps
3. **Social Sharing**: Share excursions on social media
4. **Loyalty Program**: Rewards for repeat customers
5. **Multi-day Packages**: Bundle excursions with discounts
6. **Weather Integration**: Show weather for excursion dates
7. **Map Integration**: Interactive maps for locations
8. **Video Tours**: 360° virtual tours
9. **Gift Cards**: Purchasable vouchers
10. **Advanced Filters**: Filter by price, duration, rating

### Technical Improvements
- Offline mode (PWA)
- Better caching strategies
- Real-time notifications (WebSockets)
- Advanced search (Algolia)
- Automated testing (Cypress/Playwright)
- Performance monitoring (Lighthouse)

---

## 📞 Support & Contact

### For Users
- WhatsApp: +212 708 073 799 (floating button)
- Email: contact@diffatours.com
- Phone: +212 524 123 456
- Contact form: `/contact`

### For Developers
- Documentation: This file
- Code comments: Throughout codebase
- README: `/README.md`

---

## 📝 Notes

### Special Considerations
1. **WhatsApp Button**: Always visible in bottom-left corner
2. **Background Image**: Fixed Unsplash image for consistent branding
3. **Glassmorphism**: Custom CSS for frosted glass effect
4. **Pill Buttons**: Fully rounded buttons (9999px radius)
5. **20px Radius**: Standard for cards and containers
6. **75% Overlays**: Dark overlays on hero images
7. **Locale Structure**: All routes under `/[locale]` for i18n

### Development Tips
- Use `bun dev` for development server (Turbopack)
- Environment variables in `.env` and `.env.local`
- MongoDB connection string required
- Clerk keys required for auth
- Test payment gateway in sandbox mode first

---

## 📚 Additional Resources

### Documentation Links
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Clerk Authentication](https://clerk.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MongoDB/Mongoose](https://mongoosejs.com/docs)
- [React Hook Form](https://react-hook-form.com)
- [Recharts](https://recharts.org)

---

**Last Updated**: November 29, 2025

**Version**: 1.0.0

**Status**: ✅ Production Ready

---

*This documentation covers the complete Diffa Tours website as of November 29, 2025. All features, pages, and integrations are fully implemented and functional.*