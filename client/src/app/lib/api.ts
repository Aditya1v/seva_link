import type {
  Assignment,
  DashboardPayload,
  Need,
  NeedDetailsPayload,
  User,
  Volunteer,
  VolunteerDashboardPayload,
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const TOKEN_KEY = "reliefsync_token";

interface ApiErrorBody {
  error?: {
    message?: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new ApiError("ReliefSync API is not reachable. Start the backend with `npm run api`.", 0, error);
  }

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as T & ApiErrorBody) : ({} as T & ApiErrorBody);

  if (!response.ok) {
    throw new ApiError(payload.error?.message || "Request failed.", response.status, payload.error?.details);
  }

  return payload as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (payload: {
    name: string;
    email: string;
    password: string;
    role: "ngo" | "volunteer";
    organization?: string;
    location?: string;
    skills?: string[];
    categories?: string[];
  }) =>
    request<{ token: string; user: User }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: () => request<{ user: User }>("/auth/me"),
  dashboard: () => request<DashboardPayload>("/dashboard"),
  needs: (status?: string) => request<{ needs: Need[] }>(status ? `/needs?status=${status}` : "/needs"),
  createNeed: (payload: {
    rawText: string;
    location?: string;
    category?: string;
    reporter?: string;
    affectedPeople?: number;
  }) =>
    request<NeedDetailsPayload>("/needs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  need: (id: string) => request<NeedDetailsPayload>(`/needs/${id}`),
  updateNeed: (id: string, payload: Partial<Need>) =>
    request<NeedDetailsPayload>(`/needs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  matches: (id: string) => request<{ needId: string; matches: NeedDetailsPayload["matches"] }>(`/needs/${id}/matches`),
  assignNeed: (id: string, volunteerId: string, note?: string) =>
    request<{ need: Need; assignment: Assignment; matches: NeedDetailsPayload["matches"] }>(`/needs/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ volunteerId, note, manualOverride: true }),
    }),
  volunteers: () => request<{ volunteers: Volunteer[] }>("/volunteers"),
  volunteerDashboard: () => request<VolunteerDashboardPayload>("/volunteers/me/dashboard"),
  updateVolunteer: (payload: Partial<Volunteer>) =>
    request<{ volunteer: Volunteer }>("/volunteers/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  respondToAssignment: (assignmentId: string, status: "accepted" | "rejected") =>
    request<{ assignment: Assignment }>(`/assignments/${assignmentId}/respond`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
  updateAssignmentStatus: (assignmentId: string, status: "accepted" | "completed") =>
    request<{ assignment: Assignment }>(`/assignments/${assignmentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
