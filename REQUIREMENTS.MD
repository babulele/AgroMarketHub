PRODUCT REQUIREMENTS DOCUMENT (PRD) – VERSION 2
AgroMarketHub – Farmers Direct-to-Consumer Marketplace (With AI Demand Forecasting)
1. PRODUCT OVERVIEW
1.1 Product Name

AgroMarketHub

1.2 One-Sentence Description

A Kenyan marketplace connecting farmers directly to consumers, powered by advanced AI demand forecasting to help farmers plan crops, optimize pricing, and increase income.

1.3 Primary Goal (Year 1)

Revenue generation through farmer subscription plans.

1.4 Problem Statement

Smallholder farmers in Kenya earn low income due to middlemen, unpredictable market demand, lack of price transparency, and inefficient delivery channels. Consumers also pay high prices for food. There is no centralized digital system that offers both a direct marketplace and AI-powered market insights to guide farmers.

1.5 Target Users

Regular consumers (Phase 1)

Farmers

On-platform riders

County agricultural officers

NGOs working in agriculture

(Phase 2+) Hotels, restaurants, supermarkets

2. VALUE PROPOSITION
For Farmers

Direct sales = higher earnings

Instant M-Pesa payouts

AI demand forecasts for planning

Advanced insights (heatmaps, custom reports)

Email alerts on trending crops & price changes

For Consumers

Fresher food at better prices

Direct support for Kenyan farmers

Transparent marketplace

Easy ordering with email updates

For Government/NGOs

Access to macro-data on food supply & scarcity

Regional agricultural insights

Support digitalization of local farming

3. CORE FEATURES
3.1 Farmer Portal

Manual account verification (ID + farm location)

Farmer subscription plan (monthly/annual)

Add/edit produce listings

Upload product images

Set prices (farmer-controlled pricing)

Inventory management

Sales dashboard

Instant M-Pesa payouts

Access to Advanced AI Dashboard:

Forecasted high-demand crops (nationwide)

Seasonal and monthly predictions

Heatmaps showing demand by region

AI pricing recommendations (optional)

Custom downloadable reports

Email alerts for predicted demand spikes

3.2 Buyer Portal (Consumers)

Browse produce categories

View farmer profiles

Search + filter by price, region, type

Add to cart

Checkout with M-Pesa only

Email notifications:

Order received

Rider assigned

Order out for delivery

Delivered

3.3 Marketplace Features

Product catalog with live availability

Auction mode for bulk buyers

Transparent pricing view

Seasonal products page

Trending produce insights

3.4 Logistics & Delivery System

On-platform rider accounts

Rider assignment dashboard

Email updates to buyers (no GPS tracking)

Delivery statuses:

Assigned

Picking

In transit

Delivered

(Cold-chain & GPS tracking planned for future phases.)

3.5 Admin Dashboard

Farmer verification approval

NGO & county officer account creation

Marketplace moderation

View and modify AI predictions (override ability)

Big Data Dashboard:

Market prices

Regional supply & demand

Food scarcity trend visualization

Heatmaps for buyer activity

Dispute resolution panel

Spoilage complaints

Wrong delivery claims

Refund processing

4. AI DEMAND FORECASTING SYSTEM
4.1 Forecasting Scope

Nationwide forecasting (Kenya)

Later: county-level & sub-county breakdowns

4.2 Data Sources

Free weather APIs

Internal sales data

Buyer behavior: views, cart additions

Historical marketplace prices

Seasonal consumption patterns

4.3 AI Dashboard (Advanced)

Heatmaps of regional demand

Monthly demand predictions

Seasonal crop trends

High-demand alert emails

Custom reports (PDF/CSV)

Yield vs. market demand analysis

Farmer-specific insights

4.4 AI Models

LSTM & Prophet for time-series forecasting

Random Forest for price prediction

K-means clustering for regional demand

4.5 Admin AI Control

Admin can override AI forecasts

Admin can adjust confidence ranges

Logs of every change for audit

5. TECHNICAL REQUIREMENTS
5.1 Platform

Responsive web application

PWA (offline capabilities for browsing)

5.2 Tech Stack (Recommended)

Frontend:

React.js or Next.js

TailwindCSS

Zustand/Redux

Backend:

Node.js (Express.js)

MongoDB Atlas

Redis for caching

FastAPI (Python) for AI models

Integrations:

M-Pesa Daraja API

Weather API

Email service (SendGrid / Mailgun)

Hosting:

AWS (EC2, S3, CloudFront) or Firebase

6. USER FLOWS
6.1 Farmer Flow

Sign up

Upload ID + farm details (manual verification)

Pay subscription

Access AI dashboard → decide crops

List produce

Receive orders

Rider picks → deliver

Instant payout

View analytics + receive email alerts

6.2 Consumer Flow

Browse marketplace

Add to cart

M-Pesa checkout

Receive email updates

Order delivered

Leave review

6.3 Rider Flow

Login

View assigned deliveries

Update status (email sent to buyer)

Mark delivered

6.4 Admin Flow

Approve farmers

Oversee disputes

Modify AI forecasts if needed

View big data dashboard

7. NON-FUNCTIONAL REQUIREMENTS
Performance

Page load under 2 seconds

AI response time under 1 second

Security

JWT authentication

Secure M-Pesa webhooks

Encrypted user data

Scalability

Microservices ready

AI separated as its own service

Availability

99.9% uptime target

8. BUSINESS MODEL
Revenue Streams

Farmer subscription plans (main revenue)

Auction fees (transaction fee)

Featured listings (optional future)

Data analytics reports for partners (future)

9. RISK & MITIGATION
Risk    Mitigation
Farmers distrust AI Easy-to-understand explanations + training
Poor internet in rural areas    PWA + offline browsing
Rider unreliability Frequent performance audits
Market price shocks Real-time AI recalibration
Fake farmer accounts    Strict manual verification
10. FUTURE PHASES
Phase 2

Mobile app (Android)

GPS delivery tracking

Wholesale buyers (hotels, supermarkets)

Cold-chain logistics

Phase 3

Satellite-based crop health analysis

IoT soil sensor integrations

Farmer insurance bundles

Blockchain food traceability

11. EXPECTED IMPACT
For Farmers

Higher income

Better crop planning via AI

Reduced waste

For Consumers

Fresher, cheaper food

Direct farm-to-table supply

For Kenya

Better food security

Strong agricultural data analytics

Support for SDG 1 & SDG 2

