export type Role = "admin" | "ngo" | "volunteer";
export type NeedStatus = "pending" | "assigned" | "completed";
export type Urgency = "critical" | "high" | "medium" | "low";
export type AssignmentStatus = "pending_acceptance" | "accepted" | "rejected" | "completed";
export type Availability = "available" | "limited" | "busy";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization?: string;
  volunteerId?: string;
  createdAt?: string;
}

export interface Need {
  id: string;
  rawText: string;
  title: string;
  category: string;
  urgency: Urgency;
  priorityScore: number;
  summary: string;
  reason: string;
  keywords: string[];
  location: string;
  reporter: string;
  affectedPeople: number;
  status: NeedStatus;
  assignedVolunteerId?: string;
  createdAt: string;
  updatedAt: string;
  manualOverride?: boolean;
  aiSource?: "llm" | "fallback";
  aiWarning?: string;
}

export interface Volunteer {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  skills: string[];
  categories: string[];
  availability: Availability;
  availableDays: string[];
  capacity: number;
  workload: number;
  completedTasks: number;
  hoursVolunteered: number;
  rating: number;
  pastAssignments: string[];
  joinedDate: string;
  bio?: string;
}

export interface MatchSuggestion {
  volunteerId: string;
  name: string;
  email: string;
  score: number;
  reason: string;
  skills: string[];
  location: string;
  availability: Availability;
  workload: number;
  rating: number;
}

export interface Assignment {
  id: string;
  needId: string;
  volunteerId: string;
  status: AssignmentStatus;
  assignedAt: string;
  updatedAt: string;
  responseAt?: string;
  assignedBy?: string;
  note?: string;
  need?: Need;
  volunteer?: Volunteer;
}

export interface NeedDetailsPayload {
  need: Need;
  matches: MatchSuggestion[];
  assignment: Assignment | null;
}

export interface DashboardPayload {
  stats: {
    totalNeeds: number;
    pending: number;
    assigned: number;
    completed: number;
    activeVolunteers: number;
  };
  urgentNeeds: Need[];
  suggestions: Array<{ need: Need; matches: MatchSuggestion[] }>;
  trend: Array<{ day: string; requests: number }>;
  insight: string;
}

export interface VolunteerDashboardPayload {
  volunteer: Volunteer;
  assignments: Assignment[];
  opportunities: Array<{ need: Need; match: MatchSuggestion }>;
}
