# Diffa Tours - Website Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Features](#features)
4. [SEO Implementation](#seo-implementation)
5. [Internationalization](#internationalization)
6. [Authentication & Authorization](#authentication--authorization)
7. [Database & API](#database--api)
8. [Payment System](#payment-system)
9. [Email & Communication](#email--communication)
10. [Design System](#design-system)
11. [Pages & Routes](#pages--routes)
12. [Admin Panel](#admin-panel)
13. [Responsive Design](#responsive-design)
14. [Performance Optimizations](#performance-optimizations)

---

## 🌐 Overview

**Diffa Tours** is a comprehensive travel agency website specializing in Moroccan excursions, tours, and circuits. The platform offers a complete booking system with multi-language support, secure payments, and an admin dashboard for content management.

### Key Highlights
- **Multi-language Support**: French, English, Spanish, Italian
- **Responsive Design**: Optimized for all devices (mobile, tablet, desktop, TV)
- **Secure Booking System**: Complete reservation flow with capacity management
- **Payment Integration**: CMI payment gateway for online transactions
- **QR Code Badges**: Digital tourist badges with scanner functionality
- **Email Notifications**: Automated confirmation and invoice emails
- **Admin Dashboard**: Full content management system

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/UI with Radix UI primitives
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk
- **File Storage**: Supabase Storage
- **Email Service**: Resend
- **Payment Gateway**: CMI (Centre Monétique Interbancaire)

### Development Tools
- **Package Manager**: Bun
- **Linting**: ESLint
- **Code Formatting**: Prettier (via ESLint)
- **Type Checking**: TypeScript Compiler

---

## ✨ Features

### 1. Booking System
- **Excursion Browsing**: Filter by region (Marrakech, Agadir, Taghazout, Circuits)
- **Date Selection**: Calendar interface with availability checking
- **People Selection**: Age groups (0-4, 4-12, Adult) with dynamic pricing
- **Add-ons**: Optional extras and services
- **Shopping Cart**: Persistent cart with localStorage
- **Checkout Process**: Two-step checkout (Personal Info → Confirmation)
- **Capacity Management**: Real-time availability tracking
- **Order Confirmation**: Detailed summary with QR code badge

### 2. Digital Tourist Badges
- **QR Code Generation**: Unique badges for each reservation
- **Badge Details**: Visitor info, excursion details, validity period
- **Scanner Interface**: Staff can scan and validate badges
- **Scan History**: Track all badge scans with timestamps
- **Revocation System**: Ability to revoke badges

### 3. User Accounts
- **Authentication**: Clerk-powered auth (email/password, Google OAuth)
- **User Profiles**: Manage personal information
- **Reservation History**: View past and upcoming bookings
- **Favorites/Wishlist**: Save preferred excursions
- **Reviews**: Rate and review completed excursions

### 4. Payment Options
- **Cash Payment**: Pay upon pickup
- **Online Payment**: Secure CMI payment gateway
- **Circuit Requests**: Price-on-request for custom tours
- **Invoice Generation**: PDF invoices with email delivery

### 5. Communication
- **Contact Form**: Multi-field form with validation
- **Email Confirmations**: Automated booking confirmations
- **Order Updates**: Status change notifications
- **Newsletter**: Subscription system
- **SMS Notifications**: Order reminders (via Twilio integration ready)
- **WhatsApp Integration**: Direct messaging capability

### 6. Content Management
- **Excursions**: CRUD operations with multi-language support
- **Users**: User management with role assignment
- **Services**: Dynamic amenities section
- **Capacity**: Set and manage excursion capacity
- **Analytics**: Dashboard statistics

---

## 🔍 SEO Implementation

### Meta Tags
```typescript
// Comprehensive meta tags on every page
- Title templates with brand consistency
- Meta descriptions (150-160 characters)
- Open Graph tags for social sharing
- Twitter Card tags
- Canonical URLs
- Language alternates (hreflang)
```

### Structured Data (Schema.org)
```json
{
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "name": "Diffa Tours",
  "description": "Travel agency specializing in Moroccan excursions",
  "url": "https://diffatours.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Avenue Mohammed V, Quartier Gueliz",
    "addressLocality": "Marrakech",
    "addressCountry": "MA"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+212524123456",
    "email": "contact@diffatours.com"
  }
}
```

### Technical SEO
- **Sitemap**: Auto-generated XML sitemap
- **Robots.txt**: Proper crawling directives
- **Semantic HTML**: Proper heading hierarchy (h1-h6)
- **Image Alt Text**: Descriptive alt attributes
- **Mobile-Friendly**: Responsive viewport configuration
- **Performance**: Optimized Core Web Vitals
- **HTTPS**: Secure connections
- **Fast Loading**: Image optimization, code splitting

### URL Structure
```
Clean, descriptive URLs:
- /en/excursions → English excursions
- /fr/marrakech → French Marrakech page
- /es/circuits → Spanish circuits page
- /en/excursion/ourika-valley → Specific excursion
```

### Content Optimization
- **Keyword-Rich Content**: Natural keyword integration
- **Multi-language**: Content in 4 languages
- **Internal Linking**: Strategic cross-linking
- **External Links**: Quality outbound links
- **Content Freshness**: Regular updates

---

## 🌍 Internationalization (i18n)

### Supported Languages
- **French (fr)**: Default language
- **English (en)**
- **Spanish (es)**
- **Italian (it)**

### Implementation
- **Library**: next-intl
- **Structure**: JSON translation files in `/messages`
- **Routing**: Locale prefix in URLs (`/fr`, `/en`, `/es`, `/it`)
- **Language Switcher**: Header navigation
- **Fallback**: French as default

### Translation Coverage
- UI elements and navigation
- Content pages and descriptions
- Form labels and validation messages
- Email templates
- Error messages
- Invoice PDFs
- Admin panel

### Locale-Specific Features
- Date formatting per locale
- Currency display (MAD)
- Phone number formats
- Address formats
- Right-to-left (RTL) ready

---

## 🔐 Authentication & Authorization

### Provider
**Clerk** - Modern authentication platform

### Features
- Email/password authentication
- Google OAuth integration
- Session management
- User profile management
- Role-based access control (RBAC)
- Protected routes
- Account management UI

### Roles
1. **User**: Standard customer role
   - Browse excursions
   - Make bookings
   - View reservations
   - Submit reviews

2. **Admin**: Full administrative access
   - Manage excursions
   - Manage users
   - View analytics
   - Process orders
   - Configure settings

3. **Staff**: Operations role
   - Scan badges
   - View scan history
   - Access order details

### Protected Routes
```typescript
// Middleware protects:
- /admin/* → Admin only
- /staff/* → Staff/Admin only
- /mon-compte → Authenticated users
- /mes-reservations → Authenticated users
```

---

## 💾 Database & API

### Database
**MongoDB** with Mongoose ODM

### Models (Schemas)

#### 1. Excursion
```typescript
{
  excursionId: string (unique)
  name: { fr, en, es, it }
  description: { fr, en, es, it }
  shortDescription: { fr, en, es, it }
  section: 'marrakech' | 'agadir' | 'taghazout' | 'circuits'
  location: string
  duration: string
  priceMAD: number
  priceEUR: number
  priceUSD: number
  priceGBP: number
  images: string[]
  highlights: string[]
  included: string[]
  notIncluded: string[]
  schedule: object
  ageGroups: object
  createdAt: date
  updatedAt: date
}
```

#### 2. Order
```typescript
{
  orderNumber: string (unique)
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  passport: string
  city: string
  accommodationType: 'hotel' | 'riad'
  hotelName: string
  address: string
  paymentMethod: 'cash' | 'cmi'
  cartItems: string (JSON)
  totalMad: number
  paymentStatus: 'pending' | 'paid' | 'failed'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  locale: string
  createdAt: date
}
```

#### 3. Badge
```typescript
{
  badgeCode: string (unique)
  orderId: string
  orderNumber: string
  visitorName: string
  visitorEmail: string
  visitorPhone: string
  tripDetails: string (JSON)
  validUntil: date
  status: 'active' | 'revoked'
  scannedAt: date[]
  scannedBy: string[]
  createdAt: date
}
```

#### 4. User
```typescript
{
  clerkId: string (unique)
  email: string
  name: string
  phone: string
  role: 'user' | 'admin' | 'staff'
  createdAt: date
  updatedAt: date
}
```

#### 5. Capacity
```typescript
{
  excursionId: string
  date: date
  maxCapacity: number
  bookedSpots: number
  availableSpots: number
}
```

#### 6. Review
```typescript
{
  userId: string
  excursionSlug: string
  rating: number (1-5)
  comment: string
  verified: boolean
  createdAt: date
}
```

#### 7. Wishlist
```typescript
{
  userId: string
  excursionId: string
  createdAt: date
}
```

### API Routes

#### Public Routes
- `GET /api/excursions` - List all excursions
- `GET /api/excursions/[slug]` - Get excursion details
- `POST /api/contact` - Submit contact form
- `POST /api/orders` - Create new order
- `GET /api/capacity/check` - Check availability
- `GET /api/reviews/excursion/[slug]` - Get reviews

#### Authenticated Routes
- `GET /api/reservations/user/[clerk_id]` - User reservations
- `GET /api/reviews/user/[clerk_id]` - User reviews
- `POST /api/reviews` - Submit review
- `GET /api/wishlists/user/[clerk_id]` - User wishlist
- `POST /api/wishlists` - Add to wishlist
- `DELETE /api/wishlists/[id]` - Remove from wishlist

#### Admin Routes
- `GET /api/admin/excursions` - List all excursions
- `POST /api/admin/excursions` - Create excursion
- `PUT /api/admin/excursions/[id]` - Update excursion
- `DELETE /api/admin/excursions/[id]` - Delete excursion
- `GET /api/admin/orders` - List all orders
- `PUT /api/admin/orders/[id]` - Update order
- `POST /api/admin/orders/[id]/send-confirmation` - Resend email
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/[id]/assign-role` - Assign role
- `GET /api/admin/analytics` - Dashboard statistics

#### Staff Routes
- `POST /api/badges/scan` - Scan badge
- `GET /api/badges/scan-history` - Scan history
- `GET /api/badges/[badgeCode]` - Badge details
- `POST /api/badges/[badgeCode]/revoke` - Revoke badge

#### Payment Routes
- `POST /api/payments/initiate` - Start payment
- `GET /api/payments/callback` - Payment callback
- `GET /api/payments/success` - Payment success
- `GET /api/payments/fail` - Payment failure

#### Invoice Routes
- `GET /api/invoices/download/[orderNumber]` - Download PDF
- `POST /api/invoices/email/[orderNumber]` - Email invoice

---

## 💳 Payment System

### Payment Methods

#### 1. Cash Payment
- Pay upon pickup
- Recorded in order system
- Manual confirmation by staff

#### 2. CMI Online Payment
- Secure payment gateway
- Credit/debit card support
- Real-time transaction processing
- Webhook for status updates

### Payment Flow
```
1. User selects items → Cart
2. Proceeds to checkout → Personal info
3. Confirms order → Payment selection
4. If CMI: Redirect to gateway → Process payment → Callback
5. If Cash: Order confirmed → Pay later
6. Order status updated → Email sent
```

### Invoice System
- **PDF Generation**: Automated PDF invoices
- **Email Delivery**: Send invoice to customer
- **Download**: Direct PDF download
- **Localization**: Invoice in user's language
- **Content**: Order details, pricing, contact info

### Security
- PCI DSS compliance (through CMI)
- HTTPS encryption
- Secure webhooks with signature verification
- No card details stored locally

---

## 📧 Email & Communication

### Email Service
**Resend** - Modern email API

### Email Templates

#### 1. Order Confirmation
```typescript
// Sent immediately after order
- Order number and details
- Customer information
- Excursion details with dates
- Total price (if applicable)
- Payment method
- QR code badge attachment
- Cancellation policy
- Contact information
```

#### 2. Invoice
```typescript
// PDF attachment
- Company header
- Invoice number (= Order number)
- Billing details
- Line items with pricing
- Subtotal and total
- Payment method
- Terms and conditions
```

#### 3. Contact Form Submission
```typescript
// Admin notification
- Customer name and email
- Subject category
- Message content
- Reply-to functionality
```

### Localization
- All emails generated in user's selected language
- Date formatting per locale
- Currency display (MAD)
- Proper translations for all content

### Features
- **HTML Emails**: Rich formatting
- **Attachments**: PDF invoices and badges
- **Reply-To**: Direct customer responses
- **Tracking**: Open and click tracking
- **Templates**: Reusable email components

---

## 🎨 Design System

### Color Palette
```css
--color-primary: #FFB73F (Golden/Amber)
--color-secondary: #f0f7fb (Light Blue)
--color-accent: #70CFF1 (Sky Blue)
--color-destructive: #c67b5c (Terracotta)
--color-muted: #666666 (Gray)
--color-background: #ffffff (White)
--color-foreground: #1a1a1a (Dark)
```

### Typography
```css
/* Display Font (Headings) */
font-family: 'Libre Baskerville', serif;

/* Body Font */
font-family: 'Lexend Deca', sans-serif;

/* Fluid Typography */
h1: clamp(3rem, 5vw, 3.5rem)
h2: clamp(2.25rem, 4vw, 2.625rem)
h3: clamp(1.5rem, 3vw, 1.875rem)
```

### Component Styles

#### Glassmorphism
```css
.glass {
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  backdrop-filter: blur(8px) saturate(110%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
}
```

#### Buttons
```css
.btn {
  border-radius: 9999px; /* Pill-shaped */
  padding: 1rem 2.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), #e69d1a);
  box-shadow: 0 4px 12px rgba(255, 183, 63, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(255, 183, 63, 0.4);
}
```

#### Cards
```css
.card-hover {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 20px;
}

.card-hover:hover {
  transform: translateY(-8px) scale(1.02);
}
```

### Border Radius
- Standard: `20px` (consistent across all cards and containers)
- Pills: `9999px` (buttons, badges)
- Inputs: `20px`

### Shadows
```css
/* Cards */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

/* Elevated */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

/* Glass */
box-shadow: 0 4px 12px rgba(2, 8, 23, 0.4);
```

### Animations
- **Fade In Up**: Entrance animation
- **Float**: Subtle vertical movement
- **Scale In**: Pop-in effect
- **Shimmer**: Button hover effect
- **Scroll Fade**: Reveal on scroll

---

## 📄 Pages & Routes

### Public Pages

#### Homepage `/[locale]`
- Hero section with video background
- Welcome section
- Featured experiences (Atlas, Desert, Cultural)
- Popular excursions carousel
- Testimonials
- Newsletter signup
- Call-to-action sections

#### Excursions `/[locale]/nos-excursions`
- Category grid (Marrakech, Agadir, Taghazout, Circuits)
- Featured excursions
- Filter and search
- Call-to-action

#### Regional Pages
- `/[locale]/marrakech` - Marrakech excursions
- `/[locale]/agadir` - Agadir excursions
- `/[locale]/taghazout` - Taghazout excursions
- `/[locale]/circuits` - Tour circuits with card carousel

#### Excursion Detail `/[locale]/excursion/[slug]`
- Image gallery
- Description and highlights
- Included/not included
- Date picker with availability
- People selector (age groups)
- Add-ons selection
- Add to cart functionality
- Share buttons
- Related excursions

#### About `/[locale]/qui-sommes-nous`
- Company story
- Mission and values
- Team information

#### Services `/[locale]/autres-services`
- Additional services offered
- Transportation
- Accommodation
- Custom tours

#### Contact `/[locale]/contact`
- Contact form with validation
- Phone validation (8+ digits, numbers only)
- Map location
- Contact information
- Office hours

#### Riad & Restaurant
- `/[locale]/le-riad` - Riad information
- `/[locale]/le-restaurant` - Restaurant details
- `/[locale]/chambre-et-suites` - Room details

#### Terms `/[locale]/terms`
- Terms and conditions
- Privacy policy
- Cancellation policy
- Liability disclaimers
- Contact information
- Multi-language support

### User Pages (Protected)

#### Account `/[locale]/mon-compte`
- Personal information
- Edit profile (Clerk integration)
- Activity statistics
- Navigation tabs

#### Reservations `/[locale]/mes-reservations`
- Ongoing bookings
- Past bookings
- Booking details
- Download invoices
- View badges

#### Favorites `/[locale]/favoris`
- Saved excursions
- Remove from favorites
- Quick booking

### Booking Flow

#### Cart `/[locale]/cart`
- Cart items list
- Edit quantities
- Remove items
- Price summary
- Proceed to checkout
- Continue shopping

#### Checkout `/[locale]/checkout`
**Step 1: Personal Information**
- First name, last name
- Email, phone (validated)
- Passport/CIN
- City
- Accommodation type (Hotel/Riad)
- Hotel name, address
- Age confirmation
- Terms acceptance

**Step 2: Confirmation**
- Review information
- Payment method selection (Cash/CMI)
- Availability warnings
- Order summary
- Confirm order

#### Order Confirmation `/[locale]/order-confirmation/[orderNumber]`
- Success message
- Order details
- Download badge QR code
- Download invoice
- Payment information (if applicable)
- Next steps

#### Payment `/[locale]/payment/[orderNumber]`
- CMI payment gateway integration
- Secure payment form
- Order summary
- Processing feedback

### Admin Pages (Admin Only)

#### Admin Dashboard `/[locale]/admin`
**Tabs:**
1. **Users**: User management, role assignment
2. **Services**: Amenities management
3. **Excursions**: CRUD operations

**Features:**
- Search and filters
- Create/Edit/Delete
- Analytics overview
- Quick actions

#### Populate Circuits `/[locale]/admin/populate-circuits`
- Bulk circuit creation
- Data import tools

### Staff Pages (Staff/Admin Only)

#### Scanner `/[locale]/staff/scanner`
- QR code scanner interface
- Badge validation
- Real-time scanning
- Badge details display
- Revocation capability

#### Scan History `/[locale]/staff/history`
- All scan records
- Filter by date
- Export functionality
- Badge status

### Badge Pages

#### Badge Display `/[locale]/badge/[badgeCode]`
- QR code display
- Visitor information
- Excursion details
- Validity period
- Download badge
- Print functionality
- Status indicator

---

## 👨‍💼 Admin Panel

### Access Control
- Admin role required
- Protected routes with middleware
- Clerk authentication integration

### Features

#### 1. User Management
- **View Users**: Paginated list with search
- **Filter**: By role (all, admin, user)
- **Edit**: Update user details
- **Role Assignment**: Change user roles
- **Delete**: Remove users
- **Sync with Clerk**: Import users from Clerk

#### 2. Excursion Management
- **Create**: New excursions with multi-language support
- **Edit**: Update excursion details
- **Delete**: Remove excursions
- **Filter**: By section (all, marrakech, agadir, taghazout, circuits)
- **Image Upload**: Supabase storage integration
- **Pricing**: Multi-currency support
- **Scheduling**: Set time slots
- **Capacity**: Manage max capacity

#### 3. Order Management
- **View Orders**: All bookings
- **Update Status**: Change order status
- **Send Emails**: Resend confirmations
- **View Details**: Full order information
- **Analytics**: Order statistics

#### 4. Services Management
- **CRUD Operations**: Create, read, update, delete
- **Ordering**: Set display order
- **Active/Inactive**: Toggle visibility
- **Icons**: Lucide icon integration

#### 5. Analytics Dashboard
- Total users
- Total excursions
- Total orders
- Total revenue
- Recent activity
- Popular excursions
- Conversion rates

#### 6. Settings
- **Excursion Settings**: Default values
- **Email Templates**: Customize emails
- **Capacity Settings**: Default capacity
- **Payment Configuration**: CMI settings

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
sm: 640px   /* Tablets */
md: 768px   /* Small laptops */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Mobile Optimizations (320px - 639px)
- Single column layouts
- Stacked navigation
- Full-width buttons
- Touch-friendly targets (44px+)
- Collapsible sections
- Bottom navigation
- Swipe gestures
- Simplified forms

### Tablet Optimizations (640px - 1023px)
- Two-column grids
- Side-by-side buttons
- Expanded cards
- Tablet-specific spacing
- Horizontal scrolling where appropriate

### Desktop Optimizations (1024px+)
- Multi-column layouts
- Sticky navigation
- Hover effects
- Larger images
- Expanded content
- Sidebars and multi-panel views

### Large Screens (1280px+)
- Max-width containers (1200px)
- Enhanced typography
- Decorative elements
- Animations and transitions
- Full-width hero sections

### Responsive Typography
```css
/* Fluid scaling */
h1: text-3xl sm:text-4xl md:text-5xl lg:text-6xl
h2: text-2xl sm:text-3xl md:text-4xl
h3: text-xl sm:text-2xl md:text-3xl
body: text-base sm:text-lg
```

### Touch Interactions
- Minimum tap target: 44x44px
- Swipe gestures for carousels
- Pull-to-refresh support
- Touch-friendly dropdowns
- No hover-dependent functionality

### Performance
- Lazy loading images
- Code splitting by route
- Progressive enhancement
- Reduced motion support
- Dark mode ready

---

## ⚡ Performance Optimizations

### Image Optimization
- Next.js Image component
- Automatic WebP conversion
- Responsive images with srcset
- Lazy loading below fold
- Priority loading for hero images
- Proper sizing attributes

### Code Splitting
- Route-based splitting
- Dynamic imports for heavy components
- Lazy loading modals and dialogs
- Deferred loading for non-critical features

### Caching
- Static generation for marketing pages
- Incremental Static Regeneration (ISR)
- API response caching
- Browser caching headers
- Service worker ready

### Bundle Size
- Tree shaking unused code
- Minification and compression
- Efficient imports (Lucide icons)
- No unnecessary dependencies
- Code analysis and monitoring

### Loading States
- Skeleton screens
- Progressive loading
- Optimistic UI updates
- Loading indicators
- Error boundaries

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
  - Priority image loading
  - Optimized fonts
  - Critical CSS inline

- **FID (First Input Delay)**: < 100ms
  - Minimal JavaScript on load
  - Deferred non-essential scripts
  - Efficient event handlers

- **CLS (Cumulative Layout Shift)**: < 0.1
  - Reserved space for images
  - No layout shifts on load
  - Fixed element dimensions

### Network
- HTTP/2 support
- Compression (Gzip/Brotli)
- CDN for static assets
- Preconnect to external domains
- DNS prefetching

---

## 🔒 Security

### Authentication Security
- Clerk-managed sessions
- Secure token storage
- CSRF protection
- XSS prevention
- SQL injection prevention (Mongoose)

### Data Protection
- HTTPS enforcement
- Encrypted connections
- Secure environment variables
- No sensitive data in client
- Input sanitization

### Payment Security
- PCI DSS compliance (CMI)
- No card storage
- Secure webhooks
- Transaction logging
- Fraud detection ready

### API Security
- Rate limiting
- CORS configuration
- Input validation
- Error handling without leaks
- Secure headers

---

## 📊 Analytics & Tracking

### Google Analytics 4
- Page views
- User behavior
- Conversion tracking
- E-commerce tracking
- Custom events

### Admin Analytics
- Dashboard statistics
- Order trends
- Popular excursions
- Revenue reports
- User growth

### Performance Monitoring
- Error tracking
- Performance metrics
- API response times
- User flow analysis

---

## 🚀 Deployment

### Environment Variables Required
```env
# Database
MONGODB_URI=

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=

# Storage
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Email
RESEND_API_KEY=

# Payment
CMI_MERCHANT_ID=
CMI_STORE_KEY=
CMI_GATEWAY_URL=

# Base URL
NEXT_PUBLIC_BASE_URL=
```

### Build Commands
```bash
# Install dependencies
bun install

# Build production
bun run build

# Start production server
bun run start

# Development server
bun run dev
```

### Hosting Recommendations
- **Vercel**: Optimized for Next.js (recommended)
- **Netlify**: Full support for Next.js
- **AWS Amplify**: Enterprise solution
- **DigitalOcean App Platform**: Cost-effective

---

## 📝 Content Management

### Excursions
- Multi-language content
- Rich text descriptions
- Image galleries
- Pricing tiers
- Capacity management
- Scheduling

### Dynamic Content
- Services/amenities
- Team members
- Testimonials
- FAQ sections
- Blog posts (ready)

### Static Content
- About page
- Terms and conditions
- Privacy policy
- Contact information

---

## 🌟 User Experience

### Navigation
- Sticky header
- Mobile hamburger menu
- Language switcher
- Currency display
- Breadcrumbs
- Footer sitemap

### Search & Filter
- Excursion search
- Region filtering
- Date availability
- Price range
- Capacity checking

### Notifications
- Toast messages (Sonner)
- Email confirmations
- Order status updates
- Error messages
- Success feedback

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus indicators
- Alt text for images

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] All forms validate correctly
- [ ] Phone validation (8+ digits, numbers only)
- [ ] Email validation
- [ ] Payment flow works
- [ ] Badge generation
- [ ] Email sending
- [ ] Multi-language switching
- [ ] Responsive on all devices
- [ ] Protected routes redirect
- [ ] Admin functions work
- [ ] Scanner functionality
- [ ] Cart persistence
- [ ] Capacity checking

---

## 📞 Support & Maintenance

### Customer Support Channels
- Email: contact@diffatours.com
- Phone: +212 524 123 456
- WhatsApp: Available
- Contact form on website

### Maintenance
- Regular security updates
- Content updates
- Bug fixes
- Performance monitoring
- Backup procedures

---

## 🎯 Future Enhancements

### Planned Features
- [ ] Mobile app (React Native)
- [ ] Live chat support
- [ ] Advanced search filters
- [ ] Customer reviews moderation
- [ ] Loyalty program
- [ ] Referral system
- [ ] Multi-currency booking
- [ ] Package deals
- [ ] Weather integration
- [ ] Map integration (Google Maps)

### Integrations
- [ ] TripAdvisor reviews
- [ ] Social media booking
- [ ] Calendar sync (Google, Apple)
- [ ] CRM system
- [ ] Accounting software

---

## 📚 Developer Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Clerk: https://clerk.com/docs
- Mongoose: https://mongoosejs.com/docs

### Project Structure
```
diffa-tours/
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── [locale]/   # Localized routes
│   │   └── api/        # API routes
│   ├── components/     # React components
│   │   ├── sections/   # Page sections
│   │   └── ui/         # UI components (Shadcn)
│   ├── contexts/       # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── models/         # Mongoose models
│   └── emails/         # Email templates
├── messages/           # i18n translations
└── middleware.ts       # Next.js middleware
```

### Key Files
- `middleware.ts` - Auth and locale routing
- `src/app/globals.css` - Tailwind config and design tokens
- `src/contexts/CartContext.tsx` - Shopping cart logic
- `src/contexts/CurrencyContext.tsx` - Currency conversion
- `src/lib/mongodb.ts` - Database connection
- `components.json` - Shadcn UI config

---

## 📋 Conclusion

Diffa Tours is a comprehensive, modern travel booking platform built with the latest web technologies. It provides a seamless experience for customers booking excursions while giving administrators full control over content and operations.

### Key Strengths
- ✅ Multi-language support (4 languages)
- ✅ Fully responsive (mobile to TV)
- ✅ SEO optimized
- ✅ Secure payment integration
- ✅ Complete booking system
- ✅ Digital badge system
- ✅ Admin dashboard
- ✅ Email automation
- ✅ Modern, clean design
- ✅ High performance
- ✅ Accessible
- ✅ Scalable architecture

**Version**: 1.0.0
**Last Updated**: December 5, 2024
**Maintained by**: Diffa Tours Development Team

---

For questions or support, contact: contact@diffatours.com