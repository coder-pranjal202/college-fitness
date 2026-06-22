import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy load pages — each page loads only when navigated to
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RequestOrganizer = lazy(() => import("./pages/RequestOrganizer"));
const AdminRequests = lazy(() => import("./pages/AdminRequests"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const ManageEvents = lazy(() => import("./pages/ManageEvents"));
const EditEvent = lazy(() => import("./pages/EditEvent"));
const EventDetails = lazy(() => import("./pages/EventDetails"));
const OrganizerDashboard = lazy(() => import("./pages/OrganizerDashboard"));
const ManageScores = lazy(() => import("./pages/ManageScores"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

function PageLoader() {
  return (
    <div className="min-h-screen theme-page flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin inline-block w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mb-3" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/request-organizer" element={<RequestOrganizer />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/manage-events" element={<ManageEvents />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/edit-event/:eventId" element={<EditEvent />} />
          <Route path="/event/:eventId" element={<EventDetails />} />
          <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
          <Route path="/manage-scores/:eventId" element={<ManageScores />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;