import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { ForgotPassword } from "./components/ForgotPassword";
import { AdminDashboard } from "./components/AdminDashboard";
import { CommunityNeeds } from "./components/CommunityNeeds";
import { VolunteerMatching } from "./components/VolunteerMatching";
import { VolunteerPanel } from "./components/VolunteerPanel";
import { ImpactAnalytics } from "./components/ImpactAnalytics";
import { DashboardLayout } from "./components/DashboardLayout";
import { NeedCreation } from "./components/NeedCreation";
import { NeedDetails } from "./components/NeedDetails";
import { ProfileAvailability } from "./components/ProfileAvailability";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ngo"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: AdminDashboard },
      { path: "needs", Component: CommunityNeeds },
      { path: "needs/new", Component: NeedCreation },
      { path: "needs/:needId", Component: NeedDetails },
      { path: "matching", Component: VolunteerMatching },
      { path: "analytics", Component: ImpactAnalytics },
    ],
  },
  {
    path: "/volunteer",
    element: (
      <ProtectedRoute allowedRoles={["volunteer"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: VolunteerPanel },
      { path: "profile", Component: ProfileAvailability },
    ],
  },
]);
