import React, { type JSX } from "react";
import ReactDOM from "react-dom/client";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import "./global.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainPage from "./pages/main/MainPage";
import TeamPage from "./pages/team/TeamPage";
import AdminPage from "./pages/admin/AdminPage";

import CleaningPage from "./pages/madorFeatures/cleaning/CleaningPage";
import MessagesPage from "./pages/madorFeatures/messages/MessagesPage";
import ForumPage from "./pages/madorFeatures/forum/ForumPage";
import EventsPage from "./pages/madorFeatures/events/EventsPage";
import UpdatesPage from "./pages/madorFeatures/updates/UpdatesPage";
import GalleryPage from "./pages/madorFeatures/gallery/GalleryPage";

import LoginPage from "./LoginPage";
import { AuthProvider, useAuth } from "./AuthContext";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ✅ login is open */}
      <Route path="/login" element={<LoginPage />} />

      {/* ✅ everything else requires login */}
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Routes>
              <Route path="/" element={<MainPage />} /> {/* '/' sends to MainPage */}

              <Route path="/cleaning" element={<CleaningPage />} /> {/* '/cleaning' */}
              <Route path="/forum" element={<ForumPage />} /> {/* '/forum' */}
              <Route path="/events" element={<EventsPage />} /> {/* '/events' */}
              <Route path="/messages" element={<MessagesPage />} /> {/* '/messages' */}
              <Route path="/updates" element={<UpdatesPage />} /> {/* '/updates' */}
              <Route path="/gallery" element={<GalleryPage />} /> {/* '/gallery' */}

              <Route path="/teams/:teamId" element={<TeamPage />} /> {/* '/teams/:teamId' */}
              <Route path="/admin" element={<AdminPage />} /> {/* '/admin' */}
            </Routes>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  // insert into root (main div)
  <React.StrictMode>
    {/* bug highliting developing mode */}
    <MantineProvider defaultColorScheme="light">
      {/* basic mantine theme */}
      <Notifications /> {/* notification desplayer */}
      <AuthProvider>
        <App /> {/* the App itself */}
      </AuthProvider>
    </MantineProvider>
  </React.StrictMode>,
);
