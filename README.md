# Swipe Savvy - Business Listing & Rewards Platform

A full-stack business listing and reward platform with premium subscriptions, built with Next.js, NestJS, PostgreSQL, Stripe integration, and Google Places API.

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript, React 19 (Port 3000)
- **Backend**: NestJS with TypeScript, Prisma ORM (Port 3001) 
- **Database**: PostgreSQL (Port 5432)
- **Payment Processing**: Stripe Integration (Development Mock Mode)
- **Infrastructure**: Docker Compose
- **Maps & Places**: Google Places API

## ✨ Key Features

### 🔍 Business Discovery & Claiming
- **Business Search**: Real-time Google Places API integration
- **Smart Autocomplete**: Intelligent business suggestions
- **Verification Flow**: Multi-step business verification process
- **Claim Management**: Secure business claiming system

### 💳 Premium Subscription System
- **Payment Processing**: Integrated payment form with validation
- **Subscription Management**: Premium plan upgrades
- **Mock Payment Mode**: Development-friendly testing (no real charges)
- **Database Storage**: Complete payment and subscription tracking
- **Success Handling**: Automated redirect to Swipe Savvy Rewards portal

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach
- **Interactive Elements**: Confetti animations, testimonials carousel
- **Multi-step Forms**: Guided user onboarding
- **Real-time Validation**: Instant feedback on form inputs

### 🔐 Security & Data Management
- **User Authentication**: Secure password hashing
- **Data Validation**: Input sanitization and validation
- **CORS Protection**: Proper cross-origin configuration
- **Environment Isolation**: Separate dev/prod configurations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- pnpm (recommended) or npm

### 1. Clone and Install

```bash
git clone <repository-url>
cd Swipe-Savvy
pnpm install
```

### 2. Setup Environment Variables

**Backend (.env)**:
```bash
cd apps/server
cp .env.example .env
```

Update `apps/server/.env`:
```env
# Database
DATABASE_URL="postgresql://swipesavvy:password123@localhost:5432/swipesavvy_db"

# Google Places API
GOOGLE_PLACES_API_KEY=AIzaSyAHL0ZAk9dbqkPPHms08kmx65chyCd-haQ

# Server Config
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Stripe (Optional - Leave empty for mock mode)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# CORS
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**:
```bash
cd apps/client
```

Create `apps/client/.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Google Places API (client-side)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyAHL0ZAk9dbqkPPHms08kmx65chyCd-haQ

# Stripe (Optional - for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM=
```

### 3. Start Database

```bash
# From project root
docker-compose up postgres -d
```

### 4. Setup Database Schema

```bash
cd apps/server
npx prisma generate
npx prisma db push
```

### 5. Start Backend Server

```bash
cd apps/server
pnpm run start:dev
```

Server will be available at: http://localhost:3001

### 6. Start Frontend (New Terminal)

```bash
cd apps/client
pnpm dev
```

Frontend will be available at: http://localhost:3000

## 📊 Database Schema

### User Table
- `id` (string, primary key)
- `email` (string, unique)
- `name` (string)
- `password` (string, hashed with bcrypt)
- `hasAcceptedTerms` (boolean)
- `stripeCustomerId` (string, optional)
- `createdAt/updatedAt` (timestamps)

### Business Table
- `id` (string, primary key)
- `googlePlaceId` (string, unique)
- `name` (string)
- `address` (string) 
- `phone` (string)
- `photoUrl` (string, optional)
- `website` (string, optional)
- `rating` (decimal, optional)
- `userId` (string, foreign key to User)
- `isVerified` (boolean, default false)
- `createdAt/updatedAt` (timestamps)

### Subscription Table
- `id` (string, primary key)
- `userId` (string, foreign key to User)
- `stripeSubscriptionId` (string, unique)
- `stripePriceId` (string)
- `stripeCustomerId` (string)
- `status` (string: active, canceled, past_due, etc.)
- `currentPeriodStart/End` (timestamps)
- `cancelAtPeriodEnd` (boolean)
- `amount` (integer, in cents)
- `currency` (string, default 'usd')
- `plan` (string)
- `createdAt/updatedAt` (timestamps)

## 🌐 API Endpoints

### Users
- `POST /users` - Create user account
- `GET /users` - Get all users (admin)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user account
- `POST /users/:id/business` - Create business for user

### Business Management
- `GET /business/find-google-place?query=<search>` - Search Google Places
- `GET /business/place-details/:placeId` - Get detailed place information
- `GET /business` - Get all businesses
- `GET /business/:id` - Get business by ID
- `GET /business/by-place-id/:googlePlaceId` - Get business by Google Place ID
- `PUT /business/:id` - Update business information
- `DELETE /business/:id` - Delete business

### Subscription & Payment
- `POST /subscriptions/checkout` - Create Stripe checkout session
- `POST /subscriptions/process-payment` - Process direct payment (mock mode)
- `POST /subscriptions/webhook` - Handle Stripe webhooks
- `GET /subscriptions/user/:userId` - Get user subscriptions
- `GET /subscriptions/user/:userId/active` - Get active subscription
- `POST /subscriptions/user/:userId/portal` - Create customer portal session
- `DELETE /subscriptions/:subscriptionId` - Cancel subscription

## 🎯 User Journey Flow

### 1. Business Discovery
```
🏠 Landing Page → 🔍 Search Business → ✅ Verify Details
```

### 2. Account Creation
```
📝 Account Form → 📧 Email Verification → 📋 Terms Acceptance
```

### 3. Premium Upgrade (Optional)
```
🎉 Success Page → 💳 Payment Form → ✅ Subscription Created → 🚀 Redirect to Portal
```

### Complete Flow:
1. **Landing Page**: User searches for their business using Google Places API
2. **Business Verification**: Confirm business details (name, address, phone, photo)
3. **Account Creation**: User creates account with email, password, name
4. **Terms Acceptance**: User agrees to terms and conditions  
5. **Success & Upsell**: Success page with premium subscription offer
6. **Payment Processing**: Optional premium upgrade with payment form
7. **Portal Redirect**: Successful subscribers redirected to https://www.swipesavvyrewards.com/

## 💳 Payment System Features

### Mock Payment Mode (Development)
- **No Real Charges**: Safe testing environment
- **Form Validation**: Complete payment form with validation
- **Success Simulation**: Realistic payment success flow
- **Database Storage**: All payment data stored for testing

### Payment Form Features
- **Card Validation**: Real-time card number formatting and validation
- **Expiry Formatting**: Auto MM/YY formatting
- **CVV Validation**: Security code verification
- **Billing Address**: Complete address collection
- **Order Summary**: Clear pricing display

### Subscription Management
- **Plan Details**: "Shop Savvy Pro" - $34.50/month
- **First Month Free**: Promotional pricing
- **Feature Comparison**: Free vs Premium benefits
- **Upgrade Tracking**: Database subscription records

## 🛠️ Development Commands

### Frontend Development
```bash
cd apps/client
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Backend Development
```bash
cd apps/server
pnpm run start:dev    # Start with hot reload
pnpm run start:prod   # Start production server
pnpm run build        # Build application
pnpm run test         # Run tests
```

### Database Management
```bash
# From apps/server directory
npx prisma generate   # Generate Prisma client
npx prisma db push    # Push schema changes
npx prisma studio     # Visual database browser
npx prisma db pull    # Pull schema from database
npx prisma migrate    # Run migrations (production)
```

### Docker Commands
```bash
# Start only database
docker-compose up postgres -d

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f postgres

# Stop all services
docker-compose down

# Reset database (⚠️ Deletes all data)
docker-compose down -v
```

## 🔧 Configuration Details

### Database Credentials
- **Host**: localhost:5432
- **Database**: swipesavvy_db
- **Username**: swipesavvy
- **Password**: password123

### Google Places API Setup
- **Server-side**: Business search, place details, photo URLs
- **Client-side**: Autocomplete, real-time suggestions
- **Required APIs**: Places API, Maps JavaScript API
- **Billing**: Enable billing in Google Cloud Console

### Stripe Configuration (Optional)
- **Mock Mode**: Leave STRIPE_SECRET_KEY empty for development
- **Production**: Add real Stripe keys for live payments
- **Webhooks**: Configure webhook endpoint for production
- **Testing**: Use Stripe test cards (4242 4242 4242 4242)

## 🚨 Troubleshooting

### Database Issues
```bash
# Check PostgreSQL status
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Reset database
docker-compose down -v && docker-compose up postgres -d
cd apps/server && npx prisma db push
```

### Server Issues
```bash
# Check port usage
lsof -i :3001

# Kill existing process
pkill -f "nest" or kill -9 <PID>

# TypeScript compilation
cd apps/server && pnpm run build
```

### Frontend Issues
```bash
# Clear Next.js cache
cd apps/client && rm -rf .next

# Check backend connection
curl http://localhost:3001

# Restart development server
pnpm dev
```

### API Key Issues
- **Google Places**: Enable Places API and Maps JavaScript API
- **CORS Errors**: Check if API key allows localhost
- **Quota Exceeded**: Monitor usage in Google Cloud Console
- **Invalid Key**: Verify key in both client and server environments

### Payment Issues
- **Mock Mode**: Ensure STRIPE_SECRET_KEY is empty for development
- **Form Validation**: Check browser console for validation errors  
- **Database Connection**: Verify PostgreSQL is running
- **Backend Errors**: Check server logs for payment processing issues

## 🌟 Features Overview

### ✅ Implemented Features
- **Business Search**: Google Places API integration with autocomplete
- **Multi-step Registration**: Guided user onboarding flow
- **Payment Processing**: Complete payment form with validation
- **Subscription Management**: Premium plan upgrades and tracking  
- **Database Operations**: Full CRUD operations for users, businesses, subscriptions
- **Responsive Design**: Mobile-first UI with modern styling
- **Error Handling**: Comprehensive error management and user feedback
- **Development Tools**: Hot reload, TypeScript, ESLint, Prettier
- **Docker Integration**: Containerized PostgreSQL database
- **Mock Payment Mode**: Safe development environment

### 🔄 User Flow States
1. **Search**: Business discovery and selection
2. **Verify**: Business details confirmation  
3. **Create**: Account creation and validation
4. **Terms**: Legal terms acceptance
5. **Success**: Completion with upgrade options
6. **Payment**: Premium subscription processing
7. **Portal**: Redirect to rewards dashboard

## 📈 Production Deployment

### Environment Setup
1. **Environment Variables**: Update all `.env` files for production
2. **Database**: Use managed PostgreSQL service (AWS RDS, etc.)
3. **Stripe**: Configure live Stripe keys and webhooks
4. **Domain**: Set up custom domain and SSL certificates
5. **Monitoring**: Implement logging and error tracking

### Deployment Checklist
- [ ] Production database configured
- [ ] Stripe live keys configured  
- [ ] Google Places API production limits set
- [ ] Environment variables secured
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Monitoring and logging enabled
- [ ] Backup strategy implemented

### Performance Optimization
- **Frontend**: Next.js static optimization, image optimization
- **Backend**: Database indexing, caching strategies
- **Database**: Connection pooling, query optimization
- **CDN**: Static asset delivery optimization

## 🎉 Getting Started

### For End Users
1. Visit http://localhost:3000
2. Search for your business using the search bar
3. Verify business details and create your account
4. Complete the registration flow
5. Optionally upgrade to premium subscription
6. Get redirected to the Swipe Savvy Rewards portal

### For Developers  
1. Follow the Quick Start guide above
2. Explore the API endpoints using tools like Postman
3. Check the database using Prisma Studio (`npx prisma studio`)
4. Review the codebase structure in `/apps/client` and `/apps/server`
5. Test the payment flow using the mock payment mode

---

**🚀 Your Swipe Savvy application is ready for business!**

**Frontend**: http://localhost:3000  
**Backend API**: http://localhost:3001  
**Database Browser**: http://localhost:5555 (after running `npx prisma studio`)

For support and questions, check the troubleshooting section above or review the API documentation. 