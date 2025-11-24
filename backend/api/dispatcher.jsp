<%@ page import="java.util.*" %>
<%@ page import="jakarta.servlet.http.HttpServletResponse" %>
<%@ include file="../WEB-INF/jspf/DataStore.jspf" %>
<%@ include file="../WEB-INF/jspf/JsonUtil.jspf" %>
<%
  response.setContentType("application/json;charset=UTF-8");
  Map<String, Object> payload = new LinkedHashMap<>();
  payload.put("timestamp", System.currentTimeMillis());

  try {
    String entity = requireParam(request, "entity");
    String action = requireParam(request, "action");

    Object data;
    switch (entity) {
      case "movies":
        data = handleMovies(action, request, dataStore);
        break;
      case "cinemas":
        data = handleCinemas(action, request, dataStore);
        break;
      case "users":
        data = handleUsers(action, request, dataStore);
        break;
      case "bookings":
        data = handleBookings(action, request, dataStore);
        break;
      case "payouts":
        data = handlePayouts(action, request, dataStore);
        break;
      default:
        throw new IllegalArgumentException("Unsupported entity: " + entity);
    }

    payload.put("status", "success");
    payload.put("data", data);
  } catch (Exception ex) {
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    payload.put("status", "error");
    payload.put("error", ex.getMessage());
  }

  out.print(toJson(payload));
%>
<%!
  private String requireParam(HttpServletRequest request, String name) {
    String value = request.getParameter(name);
    if (value == null || value.trim().isEmpty()) {
      throw new IllegalArgumentException("Missing parameter: " + name);
    }
    return value.trim();
  }

  private Map<String, Object> findById(List<Map<String, Object>> collection, String id) {
    for (Map<String, Object> item : collection) {
      if (id.equals(item.get("id"))) {
        return item;
      }
    }
    throw new IllegalArgumentException("Record not found for id: " + id);
  }

  private Object handleMovies(String action, HttpServletRequest request, Map<String, List<Map<String, Object>>> dataStore) {
    List<Map<String, Object>> movies = dataStore.get("movies");
    switch (action) {
      case "list":
        return movies;
      case "get":
        return findById(movies, requireParam(request, "id"));
      case "create":
        Map<String, Object> movie = new LinkedHashMap<>();
        movie.put("id", "mov-" + UUID.randomUUID());
        movie.put("title", requireParam(request, "title"));
        movie.put("genre", request.getParameter("genre"));
        movie.put("language", request.getParameter("language"));
        movie.put("duration", parseInteger(request.getParameter("duration"), 120));
        movie.put("rating", parseDouble(request.getParameter("rating"), 4.0));
        movie.put("poster", optionalParam(request, "poster", ""));
        movie.put("price", parseInteger(request.getParameter("price"), 200));
        movie.put("releaseDate", optionalParam(request, "releaseDate", new java.text.SimpleDateFormat("yyyy-MM-dd").format(new Date())));
        movie.put("synopsis", optionalParam(request, "synopsis", "Synopsis will be available soon."));
        movie.put("cast", splitList(request.getParameter("cast")));
        movie.put("createdAt", new Date().toString());
        movies.add(movie);
        return movie;
      case "update":
        Map<String, Object> existing = findById(movies, requireParam(request, "id"));
        updateIfPresent(existing, "title", request.getParameter("title"));
        updateIfPresent(existing, "genre", request.getParameter("genre"));
        updateIfPresent(existing, "language", request.getParameter("language"));
        updateIfPresent(existing, "duration", maybeInteger(request.getParameter("duration")));
        updateIfPresent(existing, "rating", maybeDouble(request.getParameter("rating")));
        updateIfPresent(existing, "poster", request.getParameter("poster"));
        updateIfPresent(existing, "price", maybeInteger(request.getParameter("price")));
        updateIfPresent(existing, "releaseDate", request.getParameter("releaseDate"));
        updateIfPresent(existing, "synopsis", request.getParameter("synopsis"));
        Object cast = splitListOrNull(request.getParameter("cast"));
        if (cast != null) {
          existing.put("cast", cast);
        }
        existing.put("updatedAt", new Date().toString());
        return existing;
      case "delete":
        String movieId = requireParam(request, "id");
        boolean removed = removeById(movies, movieId);
        if (!removed) {
          throw new IllegalArgumentException("Unable to delete movie " + movieId);
        }
        return Collections.singletonMap("deleted", Boolean.TRUE);
      default:
        throw new IllegalArgumentException("Unsupported movies action: " + action);
    }
  }

  private Object handleCinemas(String action, HttpServletRequest request, Map<String, List<Map<String, Object>>> dataStore) {
    List<Map<String, Object>> cinemas = dataStore.get("cinemas");
    switch (action) {
      case "list":
        return cinemas;
      case "create":
        Map<String, Object> cinema = new LinkedHashMap<>();
        cinema.put("id", "cin-" + UUID.randomUUID());
        cinema.put("name", requireParam(request, "name"));
        cinema.put("city", requireParam(request, "city"));
        cinema.put("screens", parseInteger(request.getParameter("screens"), 5));
        cinema.put("facilities", splitList(request.getParameter("facilities")));
        cinemas.add(cinema);
        return cinema;
      case "update":
        Map<String, Object> existing = findById(cinemas, requireParam(request, "id"));
        updateIfPresent(existing, "name", request.getParameter("name"));
        updateIfPresent(existing, "city", request.getParameter("city"));
        updateIfPresent(existing, "screens", maybeInteger(request.getParameter("screens")));
        updateIfPresent(existing, "facilities", splitListOrNull(request.getParameter("facilities")));
        return existing;
      case "delete":
        String cinemaId = requireParam(request, "id");
        if (!removeById(cinemas, cinemaId)) {
          throw new IllegalArgumentException("Unable to delete cinema " + cinemaId);
        }
        return Collections.singletonMap("deleted", Boolean.TRUE);
      default:
        throw new IllegalArgumentException("Unsupported cinemas action: " + action);
    }
  }

  private Object handleUsers(String action, HttpServletRequest request, Map<String, List<Map<String, Object>>> dataStore) {
    List<Map<String, Object>> users = dataStore.get("users");
    switch (action) {
      case "list":
        return users;
      case "register":
        String email = requireParam(request, "email");
        if (findUserByEmail(users, email) != null) {
          throw new IllegalArgumentException("Email already registered");
        }
        Map<String, Object> user = new LinkedHashMap<>();
        user.put("id", "usr-" + UUID.randomUUID());
        user.put("name", requireParam(request, "name"));
        user.put("email", email);
        user.put("password", requireParam(request, "password"));
        user.put("role", optionalParam(request, "role", "user"));
        user.put("phone", request.getParameter("phone"));
        user.put("city", request.getParameter("city"));
        user.put("createdAt", new Date().toString());
        users.add(user);
        return sanitizeUser(user);
      case "login":
        String loginEmail = requireParam(request, "email");
        String loginPassword = requireParam(request, "password");
        Map<String, Object> existing = findUserByEmail(users, loginEmail);
        if (existing == null || !loginPassword.equals(existing.get("password"))) {
          throw new IllegalArgumentException("Invalid credentials");
        }
        Map<String, Object> sanitized = sanitizeUser(existing);
        sanitized.put("token", "tok-" + UUID.randomUUID());
        return sanitized;
      case "delete":
        String userId = requireParam(request, "id");
        if (!removeById(users, userId)) {
          throw new IllegalArgumentException("Unable to delete user " + userId);
        }
        return Collections.singletonMap("deleted", Boolean.TRUE);
      default:
        throw new IllegalArgumentException("Unsupported users action: " + action);
    }
  }

  private Object handleBookings(String action, HttpServletRequest request, Map<String, List<Map<String, Object>>> dataStore) {
    List<Map<String, Object>> bookings = dataStore.get("bookings");
    switch (action) {
      case "list":
        return bookings;
      case "listByShow":
        String movieId = request.getParameter("movieId");
        String cinemaId = request.getParameter("cinemaId");
        List<Map<String, Object>> filtered = new ArrayList<>();
        for (Map<String, Object> booking : bookings) {
          boolean matches = true;
          if (movieId != null && !movieId.isEmpty()) {
            matches = movieId.equals(booking.get("movieId"));
          }
          if (matches && cinemaId != null && !cinemaId.isEmpty()) {
            matches = cinemaId.equals(booking.get("cinemaId"));
          }
          if (matches) {
            filtered.add(booking);
          }
        }
        return filtered;
      case "create":
        Map<String, Object> booking = new LinkedHashMap<>();
        booking.put("id", "bkg-" + UUID.randomUUID());
        booking.put("userId", requireParam(request, "userId"));
        booking.put("movieId", requireParam(request, "movieId"));
        booking.put("cinemaId", requireParam(request, "cinemaId"));
        booking.put("showTime", requireParam(request, "showTime"));
        booking.put("seats", splitList(requireParam(request, "seats")));
        booking.put("createdAt", new Date().toString());
        bookings.add(booking);
        return booking;
      case "cancel":
        String bookingId = requireParam(request, "id");
        if (!removeById(bookings, bookingId)) {
          throw new IllegalArgumentException("Unable to cancel booking " + bookingId);
        }
        return Collections.singletonMap("cancelled", Boolean.TRUE);
      default:
        throw new IllegalArgumentException("Unsupported bookings action: " + action);
    }
  }

  private Object handlePayouts(String action, HttpServletRequest request, Map<String, List<Map<String, Object>>> dataStore) {
    List<Map<String, Object>> payouts = dataStore.get("payouts");
    switch (action) {
      case "list":
        return payouts;
      case "listPending":
        List<Map<String, Object>> pending = new ArrayList<>();
        for (Map<String, Object> payout : payouts) {
          if ("pending".equalsIgnoreCase(String.valueOf(payout.get("status")))) {
            pending.add(payout);
          }
        }
        return pending;
      case "create":
        Map<String, Object> payout = new LinkedHashMap<>();
        payout.put("id", "pay-" + UUID.randomUUID());
        payout.put("vendor", requireParam(request, "vendor"));
        payout.put("amount", parseDouble(request.getParameter("amount"), 0.0));
        payout.put("status", optionalParam(request, "status", "pending"));
        payout.put("dueDate", optionalParam(request, "dueDate", new Date().toString()));
        payouts.add(payout);
        return payout;
      case "markPaid":
        Map<String, Object> existing = findById(payouts, requireParam(request, "id"));
        existing.put("status", "completed");
        existing.put("paidAt", new Date().toString());
        return existing;
      default:
        throw new IllegalArgumentException("Unsupported payouts action: " + action);
    }
  }

  private void updateIfPresent(Map<String, Object> target, String key, Object value) {
    if (value != null) {
      target.put(key, value);
    }
  }

  private boolean removeById(List<Map<String, Object>> collection, String id) {
    Iterator<Map<String, Object>> iterator = collection.iterator();
    while (iterator.hasNext()) {
      if (id.equals(iterator.next().get("id"))) {
        iterator.remove();
        return true;
      }
    }
    return false;
  }

  private Integer parseInteger(String value, int fallback) {
    try {
      return value == null || value.trim().isEmpty() ? fallback : Integer.parseInt(value.trim());
    } catch (NumberFormatException ex) {
      return fallback;
    }
  }

  private Double parseDouble(String value, double fallback) {
    try {
      return value == null || value.trim().isEmpty() ? fallback : Double.parseDouble(value.trim());
    } catch (NumberFormatException ex) {
      return fallback;
    }
  }

  private Object maybeInteger(String value) {
    if (value == null || value.trim().isEmpty()) {
      return null;
    }
    try {
      return Integer.parseInt(value.trim());
    } catch (NumberFormatException ex) {
      return null;
    }
  }

  private Object maybeDouble(String value) {
    if (value == null || value.trim().isEmpty()) {
      return null;
    }
    try {
      return Double.parseDouble(value.trim());
    } catch (NumberFormatException ex) {
      return null;
    }
  }

  private String optionalParam(HttpServletRequest request, String name, String fallback) {
    String value = request.getParameter(name);
    return (value == null || value.trim().isEmpty()) ? fallback : value.trim();
  }

  private List<String> splitList(String value) {
    List<String> result = new ArrayList<>();
    if (value == null || value.trim().isEmpty()) {
      return result;
    }
    for (String token : value.split(",")) {
      if (!token.trim().isEmpty()) {
        result.add(token.trim());
      }
    }
    return result;
  }

  private Object splitListOrNull(String value) {
    if (value == null || value.trim().isEmpty()) {
      return null;
    }
    return splitList(value);
  }

  private Map<String, Object> findUserByEmail(List<Map<String, Object>> users, String email) {
    for (Map<String, Object> user : users) {
      if (email.equalsIgnoreCase(String.valueOf(user.get("email")))) {
        return user;
      }
    }
    return null;
  }

  private Map<String, Object> sanitizeUser(Map<String, Object> user) {
    Map<String, Object> safeUser = new LinkedHashMap<>(user);
    safeUser.remove("password");
    return safeUser;
  }
%>
