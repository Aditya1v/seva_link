import "dotenv/config";
import http from "node:http";
import { prioritizeNeed, rankVolunteersForNeed } from "./services/aiService.mjs";
import { createId, hashPassword, loadDb, nowIso, publicUser, saveDb, verifyPassword } from "./store.mjs";

const PORT = Number(process.env.PORT || 5001);
const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];
const configuredOrigins = String(process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set(configuredOrigins.length ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS);

function getJsonHeaders(req) {
  const requestOrigin = req.headers.origin;
  const allowOrigin =
    requestOrigin && allowedOrigins.has(requestOrigin)
      ? requestOrigin
      : !requestOrigin && allowedOrigins.size
        ? [...allowedOrigins][0]
        : "*";

  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

function sendJson(req, res, status, payload) {
  res.writeHead(status, getJsonHeaders(req));
  res.end(JSON.stringify(payload));
}

function sendError(req, res, status, message, details) {
  sendJson(req, res, status, { error: { message, details } });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.status = 400;
    throw error;
  }
}

function requireFields(body, fields) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === "");
  if (missing.length) {
    const error = new Error(`Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`);
    error.status = 400;
    throw error;
  }
}

function getSessionUser(req, db) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) return null;
  const session = db.sessions.find((item) => item.token === token);
  if (!session) return null;
  return db.users.find((user) => user.id === session.userId) || null;
}

function assertAuth(user) {
  if (!user) {
    const error = new Error("Authentication required.");
    error.status = 401;
    throw error;
  }
}

function assertRole(user, allowedRoles) {
  assertAuth(user);
  if (!allowedRoles.includes(user.role)) {
    const error = new Error("You do not have permission to access this resource.");
    error.status = 403;
    throw error;
  }
}

function userCanManage(user) {
  return user?.role === "admin" || user?.role === "ngo";
}

function cleanEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function summarizeAssignment(db, assignment) {
  const need = db.needs.find((item) => item.id === assignment.needId);
  const volunteer = db.volunteers.find((item) => item.id === assignment.volunteerId);
  return {
    ...assignment,
    need,
    volunteer,
  };
}

function buildDashboard(db) {
  const totalNeeds = db.needs.length;
  const pending = db.needs.filter((need) => need.status === "pending").length;
  const assigned = db.needs.filter((need) => need.status === "assigned").length;
  const completed = db.needs.filter((need) => need.status === "completed").length;
  const activeVolunteers = db.volunteers.filter((volunteer) => volunteer.availability !== "busy").length;
  const urgentNeeds = [...db.needs]
    .filter((need) => need.status !== "completed")
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5);

  const topCategory = [...db.needs].sort(
    (a, b) =>
      db.needs.filter((need) => need.category === b.category).length -
      db.needs.filter((need) => need.category === a.category).length,
  )[0]?.category;

  const suggestions = urgentNeeds.slice(0, 3).map((need) => ({
    need,
    matches: rankVolunteersForNeed(need, db.volunteers).matches.slice(0, 3),
  }));

  const trend = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      day: date.toLocaleDateString("en", { weekday: "short" }),
      requests: db.needs.filter((need) => need.createdAt?.slice(0, 10) === key).length,
    };
  });

  return {
    stats: { totalNeeds, pending, assigned, completed, activeVolunteers },
    urgentNeeds,
    suggestions,
    trend,
    insight: topCategory
      ? `${topCategory} is currently the most frequent request area. ReliefSync recommends reviewing the highest-priority open cases first and assigning available volunteers with category experience.`
      : "No community needs have been reported yet.",
  };
}

function buildVolunteerDashboard(db, user) {
  const volunteer = db.volunteers.find((item) => item.id === user.volunteerId);
  if (!volunteer) {
    const error = new Error("Volunteer profile not found.");
    error.status = 404;
    throw error;
  }

  const assignments = db.assignments
    .filter((assignment) => assignment.volunteerId === volunteer.id)
    .map((assignment) => summarizeAssignment(db, assignment))
    .sort((a, b) => String(b.assignedAt).localeCompare(String(a.assignedAt)));

  const opportunities = db.needs
    .filter((need) => need.status === "pending")
    .map((need) => ({
      need,
      match: rankVolunteersForNeed(need, [volunteer]).matches[0],
    }))
    .filter((item) => item.match?.score >= 35)
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 5);

  return { volunteer, assignments, opportunities };
}

function needWithMatches(db, need) {
  return {
    need,
    matches: rankVolunteersForNeed(need, db.volunteers).matches,
    assignment: db.assignments.find((assignment) => assignment.needId === need.id && assignment.status !== "rejected") || null,
  };
}

function updateVolunteerWorkloads(db) {
  for (const volunteer of db.volunteers) {
    volunteer.workload = db.assignments.filter(
      (assignment) =>
        assignment.volunteerId === volunteer.id &&
        ["pending_acceptance", "accepted"].includes(assignment.status),
    ).length;
  }
}

function validateNeedUpdate(body) {
  const allowed = [
    "title",
    "category",
    "urgency",
    "priorityScore",
    "summary",
    "reason",
    "keywords",
    "location",
    "reporter",
    "affectedPeople",
    "status",
  ];
  return Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
}

async function handleRequest(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(req, res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.replace(/\/$/, "") || "/";

  if (!pathname.startsWith("/api")) {
    sendError(req, res, 404, "Route not found.");
    return;
  }

  const db = await loadDb();
  const currentUser = getSessionUser(req, db);

  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(req, res, 200, { ok: true, service: "ReliefSync API" });
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const body = await readBody(req);
    requireFields(body, ["email", "password"]);
    const user = db.users.find((item) => item.email === cleanEmail(body.email));
    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      sendError(req, res, 401, "Invalid email or password.");
      return;
    }
    const token = createId("token");
    db.sessions.push({ token, userId: user.id, createdAt: nowIso() });
    await saveDb(db);
    sendJson(req, res, 200, { token, user: publicUser(user) });
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/signup") {
    const body = await readBody(req);
    requireFields(body, ["name", "email", "password", "role"]);
    const role = body.role === "ngo" ? "ngo" : body.role === "volunteer" ? "volunteer" : null;
    if (!role) {
      sendError(req, res, 400, "Role must be ngo or volunteer.");
      return;
    }
    if (String(body.password).length < 8) {
      sendError(req, res, 400, "Password must be at least 8 characters.");
      return;
    }
    if (db.users.some((user) => user.email === cleanEmail(body.email))) {
      sendError(req, res, 409, "An account with this email already exists.");
      return;
    }

    const user = {
      id: createId("user"),
      name: String(body.name).trim(),
      email: cleanEmail(body.email),
      role,
      organization: role === "ngo" ? String(body.organization || "Community NGO").trim() : undefined,
      passwordHash: hashPassword(body.password),
      createdAt: nowIso(),
    };

    if (role === "volunteer") {
      const volunteer = {
        id: createId("vol"),
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: "",
        location: String(body.location || "District 1").trim(),
        skills: Array.isArray(body.skills) && body.skills.length ? body.skills : ["Communication"],
        categories: Array.isArray(body.categories) && body.categories.length ? body.categories : ["Food"],
        availability: "available",
        availableDays: ["Monday", "Tuesday", "Wednesday"],
        capacity: 3,
        workload: 0,
        completedTasks: 0,
        hoursVolunteered: 0,
        rating: 4.5,
        pastAssignments: [],
        joinedDate: "April 2026",
        bio: "New ReliefSync volunteer.",
      };
      user.volunteerId = volunteer.id;
      db.volunteers.push(volunteer);
    }

    db.users.push(user);
    const token = createId("token");
    db.sessions.push({ token, userId: user.id, createdAt: nowIso() });
    await saveDb(db);
    sendJson(req, res, 201, { token, user: publicUser(user) });
    return;
  }

  if (req.method === "GET" && pathname === "/api/auth/me") {
    assertAuth(currentUser);
    sendJson(req, res, 200, { user: publicUser(currentUser) });
    return;
  }

  if (req.method === "GET" && pathname === "/api/dashboard") {
    assertRole(currentUser, ["admin", "ngo"]);
    sendJson(req, res, 200, buildDashboard(db));
    return;
  }

  if (req.method === "GET" && pathname === "/api/needs") {
    assertAuth(currentUser);
    const status = url.searchParams.get("status");
    const needs = db.needs
      .filter((need) => !status || need.status === status)
      .sort((a, b) => b.priorityScore - a.priorityScore || String(b.createdAt).localeCompare(String(a.createdAt)));
    sendJson(req, res, 200, { needs });
    return;
  }

  if (req.method === "POST" && pathname === "/api/needs") {
    assertRole(currentUser, ["admin", "ngo"]);
    const body = await readBody(req);
    requireFields(body, ["rawText"]);
    const structured = await prioritizeNeed({
      rawText: body.rawText,
      location: body.location,
      category: body.category,
      reporter: body.reporter,
      affectedPeople: body.affectedPeople,
    });
    const need = {
      id: createId("need"),
      rawText: String(body.rawText).trim(),
      ...structured,
      location: String(body.location || "").trim(),
      reporter: String(body.reporter || currentUser.name).trim(),
      affectedPeople: Number(body.affectedPeople) || 0,
      status: "pending",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.needs.push(need);
    await saveDb(db);
    sendJson(req, res, 201, needWithMatches(db, need));
    return;
  }

  const needMatch = pathname.match(/^\/api\/needs\/([^/]+)$/);
  if (needMatch && req.method === "GET") {
    assertAuth(currentUser);
    const need = db.needs.find((item) => item.id === needMatch[1]);
    if (!need) {
      sendError(req, res, 404, "Need not found.");
      return;
    }
    sendJson(req, res, 200, needWithMatches(db, need));
    return;
  }

  if (needMatch && req.method === "PATCH") {
    assertRole(currentUser, ["admin", "ngo"]);
    const need = db.needs.find((item) => item.id === needMatch[1]);
    if (!need) {
      sendError(req, res, 404, "Need not found.");
      return;
    }
    const body = validateNeedUpdate(await readBody(req));
    if (body.priorityScore !== undefined) body.priorityScore = Math.max(1, Math.min(100, Number(body.priorityScore) || need.priorityScore));
    if (body.affectedPeople !== undefined) body.affectedPeople = Number(body.affectedPeople) || 0;
    if (body.keywords !== undefined && !Array.isArray(body.keywords)) body.keywords = String(body.keywords).split(",").map((item) => item.trim()).filter(Boolean);
    Object.assign(need, body, { updatedAt: nowIso(), manualOverride: true });
    await saveDb(db);
    sendJson(req, res, 200, needWithMatches(db, need));
    return;
  }

  const matchesRoute = pathname.match(/^\/api\/needs\/([^/]+)\/matches$/);
  if (matchesRoute && req.method === "GET") {
    assertRole(currentUser, ["admin", "ngo"]);
    const need = db.needs.find((item) => item.id === matchesRoute[1]);
    if (!need) {
      sendError(req, res, 404, "Need not found.");
      return;
    }
    sendJson(req, res, 200, rankVolunteersForNeed(need, db.volunteers));
    return;
  }

  const assignRoute = pathname.match(/^\/api\/needs\/([^/]+)\/assign$/);
  if (assignRoute && req.method === "POST") {
    assertRole(currentUser, ["admin", "ngo"]);
    const need = db.needs.find((item) => item.id === assignRoute[1]);
    if (!need) {
      sendError(req, res, 404, "Need not found.");
      return;
    }
    const body = await readBody(req);
    requireFields(body, ["volunteerId"]);
    const volunteer = db.volunteers.find((item) => item.id === body.volunteerId);
    if (!volunteer) {
      sendError(req, res, 404, "Volunteer not found.");
      return;
    }

    for (const assignment of db.assignments.filter((item) => item.needId === need.id && item.status !== "completed")) {
      assignment.status = "rejected";
      assignment.updatedAt = nowIso();
    }

    const assignment = {
      id: createId("asgn"),
      needId: need.id,
      volunteerId: volunteer.id,
      status: "pending_acceptance",
      assignedAt: nowIso(),
      updatedAt: nowIso(),
      assignedBy: currentUser.id,
      note: String(body.note || "").trim(),
    };
    db.assignments.push(assignment);
    Object.assign(need, {
      status: "assigned",
      assignedVolunteerId: volunteer.id,
      updatedAt: nowIso(),
      manualOverride: Boolean(body.manualOverride),
    });
    updateVolunteerWorkloads(db);
    await saveDb(db);
    sendJson(req, res, 200, { need, assignment: summarizeAssignment(db, assignment), matches: rankVolunteersForNeed(need, db.volunteers).matches });
    return;
  }

  if (req.method === "GET" && pathname === "/api/volunteers") {
    assertRole(currentUser, ["admin", "ngo"]);
    sendJson(req, res, 200, { volunteers: db.volunteers.sort((a, b) => b.rating - a.rating) });
    return;
  }

  if (req.method === "GET" && pathname === "/api/volunteers/me/dashboard") {
    assertRole(currentUser, ["volunteer"]);
    sendJson(req, res, 200, buildVolunteerDashboard(db, currentUser));
    return;
  }

  if (req.method === "PATCH" && pathname === "/api/volunteers/me") {
    assertRole(currentUser, ["volunteer"]);
    const volunteer = db.volunteers.find((item) => item.id === currentUser.volunteerId);
    if (!volunteer) {
      sendError(req, res, 404, "Volunteer profile not found.");
      return;
    }
    const body = await readBody(req);
    const allowed = ["phone", "location", "skills", "categories", "availability", "availableDays", "capacity", "bio"];
    for (const key of allowed) {
      if (body[key] !== undefined) volunteer[key] = body[key];
    }
    if (!["available", "limited", "busy"].includes(volunteer.availability)) {
      volunteer.availability = "available";
    }
    volunteer.capacity = Math.max(1, Number(volunteer.capacity) || 1);
    await saveDb(db);
    sendJson(req, res, 200, { volunteer });
    return;
  }

  const responseRoute = pathname.match(/^\/api\/assignments\/([^/]+)\/respond$/);
  if (responseRoute && req.method === "POST") {
    assertRole(currentUser, ["volunteer"]);
    const assignment = db.assignments.find((item) => item.id === responseRoute[1]);
    if (!assignment) {
      sendError(req, res, 404, "Assignment not found.");
      return;
    }
    if (assignment.volunteerId !== currentUser.volunteerId) {
      sendError(req, res, 403, "This assignment belongs to another volunteer.");
      return;
    }
    const body = await readBody(req);
    if (!["accepted", "rejected"].includes(body.status)) {
      sendError(req, res, 400, "Status must be accepted or rejected.");
      return;
    }
    assignment.status = body.status;
    assignment.responseAt = nowIso();
    assignment.updatedAt = nowIso();
    const need = db.needs.find((item) => item.id === assignment.needId);
    if (body.status === "rejected" && need) {
      need.status = "pending";
      need.assignedVolunteerId = undefined;
      need.updatedAt = nowIso();
    }
    updateVolunteerWorkloads(db);
    await saveDb(db);
    sendJson(req, res, 200, { assignment: summarizeAssignment(db, assignment) });
    return;
  }

  const statusRoute = pathname.match(/^\/api\/assignments\/([^/]+)\/status$/);
  if (statusRoute && req.method === "PATCH") {
    assertAuth(currentUser);
    const assignment = db.assignments.find((item) => item.id === statusRoute[1]);
    if (!assignment) {
      sendError(req, res, 404, "Assignment not found.");
      return;
    }
    if (!userCanManage(currentUser) && assignment.volunteerId !== currentUser.volunteerId) {
      sendError(req, res, 403, "You cannot update this assignment.");
      return;
    }
    const body = await readBody(req);
    if (!["accepted", "completed"].includes(body.status)) {
      sendError(req, res, 400, "Status must be accepted or completed.");
      return;
    }
    assignment.status = body.status;
    assignment.updatedAt = nowIso();
    const need = db.needs.find((item) => item.id === assignment.needId);
    if (need && body.status === "completed") {
      need.status = "completed";
      need.updatedAt = nowIso();
    }
    updateVolunteerWorkloads(db);
    await saveDb(db);
    sendJson(req, res, 200, { assignment: summarizeAssignment(db, assignment) });
    return;
  }

  sendError(req, res, 404, "Route not found.");
}

const server = http.createServer(async (req, res) => {
  try {
    await handleRequest(req, res);
  } catch (error) {
    const status = error.status || 500;
    sendError(req, res, status, status === 500 ? "Unexpected server error." : error.message, status === 500 ? error.message : undefined);
  }
});

server.listen(PORT, () => {
  console.log(`ReliefSync API running at http://localhost:${PORT}`);
});
