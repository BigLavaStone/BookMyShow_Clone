# Backend Architecture Plan

## Goals

-    Provide JSP-only backend to support CRUD for movies, cinemas, users, bookings, and payments.
-    Keep existing static pages as frontend while progressively migrating dynamic sections into JSP views.
-    Centralize backend logic inside `backend/` so it can be deployed on Tomcat/Jetty without touching static assets.

## Proposed Structure

```
backend/
  WEB-INF/
    web.xml                # Core servlet/JSP configuration
    jspf/
      DataStore.jspf       # Lazy-loads in-memory data collections
      JsonUtil.jspf        # Utility helpers for JSON serialization
  data/
    seed-data.json         # Optional persisted snapshot to bootstrap application scope
  api/
    dispatcher.jsp         # Single entry point handling ?entity=&action=
    movies.jsp             # CRUD helpers for movies
    cinemas.jsp            # CRUD helpers for cinema halls
    users.jsp              # CRUD helpers for customers/admins
    bookings.jsp           # CRUD helpers for seat reservations
    payouts.jsp            # Supports admin payout dashboards
  views/
    include/               # Navbar/footer JSP includes mirroring HTML counterparts
    *.jsp                  # JSP-native versions of key public/admin pages
```

## CRUD Contract

-    All CRUD endpoints accept `entity` and `action` query params and respond with JSON payload `{ status, data, error }`.
-    Supported actions per entity:
     -    `movies`: list, get, create, update, delete
     -    `cinemas`: list, create, update, delete
     -    `users`: register, login, list, delete
     -    `bookings`: listByShow, create, cancel
     -    `payouts`: listPending, markPaid
-    Data kept in `application` scope maps. Optional persistence via JSON snapshot during shutdown/startup.

## Frontend Integration Plan

1. Add small `assets/js/backend.js` helper to perform `fetch('/backend/api/dispatcher.jsp?...')` and update DOM in existing HTML files.
2. Replace static movie cards with data-driven rendering by injecting JSON into templates with simple DOM builders (see `index.html`, `MovieList.html`, and `MovieDet.html`).
3. Update forms (`SignUp`, `LogIn`, admin pages) to submit to the JSP dispatcher and handle success/error modals without reloading entire site.
4. Gradually convert admin-only HTML files to JSP under `backend/views/` so they can re-use backend data directly without AJAX.

## Running Locally

1. Copy `backend/` into a Java webapp root (e.g., `src/main/webapp`).
2. Deploy using Apache Tomcat 10+ or any Jakarta EE container.
3. Access dispatcher at `http://localhost:8080/BookMyShow_Clone/backend/api/dispatcher.jsp`.

## Next Steps

-    Scaffold `WEB-INF/web.xml` and `jspf` utilities.
-    Implement dispatcher JSP with switch-based routing per entity.
-    Wire `MovieList.html`, `MovieDet*.html`, `Profile.html`, and admin pages to use the new backend endpoints via JS.
-    Add smoke tests (Postman collection) to validate CRUD flows before front-end wiring.
