# BookMyShow Admin Panel - Access Guide

## 🎯 Accessing the Admin Panel

### From Main Website

Navigate to any page on the BookMyShow website and click **"Admin Panel"** in the navigation menu.

### Direct Access

Open `AdminLogin.html` to choose your admin access level.

---

## 🔐 Admin Types

### 1. **Cinema Admin** (Cinema Owner/Manager)

**Dashboard:** `admin/CinemaAdminDashboard.html`

**Features:**

-    View cinema statistics (revenue, shows, occupancy)
-    Revenue & occupancy charts
-    Today's shows management
-    Show reports (date-wise breakdown)
-    Money reports (revenue tracking & payout history)

**Pages:**

-    Dashboard: `CinemaAdminDashboard.html`
-    Show Report: `CinemaShowReport.html`
-    Money Report: `CinemaMoneyReport.html`

---

### 2. **App Admin** (Platform Super Admin)

**Dashboard:** `admin/AppAdminDashboard.html`

**Features:**

-    Platform-wide statistics (cinemas, users, revenue)
-    Revenue overview charts
-    Top performing cinemas & movies
-    Cinema approval requests
-    Master data management
-    Complete payout management
-    Comprehensive reports

**Pages:**

#### Payout Management:

-    Pending Payouts: `AppPendingPayout.html` - Review & approve/reject payout requests
-    Send Payout: `AppSendPayout.html` - Initiate manual payouts
-    Payout History: `AppPayoutHistory.html` - Complete transaction history

#### Reports:

-    Platform Revenue: `AppPlatformRevenue.html` - Total platform revenue analytics
-    Platform Payouts: `AppPlatformPayouts.html` - Payout distribution reports

#### Other Sections (Navigation Ready):

-    Master Data: Facility, Format, Language, Genre, Rating
-    Movies Management
-    Cinemas Management

---

## 🎨 Design Features

### Color Scheme

-    **Background:** Dark theme (#0f172a, slate-900)
-    **Cards:** Slate-800 with border
-    **Accents:** Rose, purple, indigo, cyan gradients
-    **Status Colors:** Green (success), orange (pending), red (urgent)

### Components

-    ✨ Animated gradient stat cards
-    📊 Interactive Chart.js visualizations
-    🎯 Expandable sidebar submenus
-    💳 Modern card layouts
-    🔄 Smooth hover effects & transitions
-    📱 Fully responsive design

### Navigation

-    Fixed sidebar with logo and user profile
-    Expandable submenus for complex sections
-    Breadcrumb navigation
-    Quick action buttons

---

## 📊 Key Metrics Displayed

### Cinema Admin:

-    Today's Revenue
-    Total Shows
-    Average Occupancy
-    Active Halls
-    Show-wise performance
-    Payout status

### App Admin:

-    Active Cinemas (342)
-    Total Users (2.4M)
-    Daily Tickets Sold (48.2K)
-    Platform Revenue (₹84.6L)
-    Pending Payouts (₹24.8L)
-    Top performers

---

## 🚀 Quick Navigation Paths

### Cinema Admin Flow:

```
AdminLogin.html
  → CinemaAdminDashboard.html
    → CinemaShowReport.html (Show details)
    → CinemaMoneyReport.html (Financial tracking)
```

### App Admin Flow:

```
AdminLogin.html
  → AppAdminDashboard.html
    → Payouts Section
      → AppPendingPayout.html (Review requests)
      → AppSendPayout.html (Send payment)
      → AppPayoutHistory.html (History)
    → Reports Section
      → AppPlatformRevenue.html (Revenue analytics)
      → AppPlatformPayouts.html (Payout analytics)
```

---

## 🔗 Integration Points

All main website pages now include "Admin Panel" link in navigation:

-    index.html
-    Home.html
-    MovieList.html
-    AboutUs.html
-    Profile.html
-    VendorList.html

---

## 📋 Features Implemented

✅ Cinema Admin Dashboard with live stats
✅ Cinema Show Reports with modal details
✅ Cinema Money Reports with payout tracking
✅ App Admin Dashboard with platform metrics
✅ Pending Payout Management (approve/reject)
✅ Send Payout Form (manual initiation)
✅ Payout History (complete transactions)
✅ Platform Revenue Reports (with charts)
✅ Platform Payout Reports (distribution analytics)
✅ Responsive dark theme design
✅ Chart.js visualizations
✅ Animated UI components
✅ Navigation integration with main site

---

## 🎯 User Roles

**Cinema Admin:**

-    Manages individual cinema
-    Views own cinema data
-    Tracks revenue & payouts
-    Cannot access other cinemas

**App Admin:**

-    Full platform access
-    Manages all cinemas
-    Approves/processes payouts
-    Views platform-wide analytics
-    Controls master data

---

## 💡 Usage Tips

1. **Cinema Admin:** Focus on optimizing your venue's performance using show reports and occupancy data
2. **App Admin:** Monitor platform health, approve payouts promptly, and track top performers
3. Use filters and date ranges to drill down into specific periods
4. Export reports for offline analysis
5. Check pending payouts regularly to maintain cinema partner satisfaction

---

**Note:** All pages feature consistent navigation, modern animations, and responsive layouts optimized for desktop and tablet viewing.
