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

import CleaningPage from "./pages/cleaning/CleaningPage";
import MessagesPage from "./pages/messages/MessagesPage";
import ForumPage from "./pages/forum/ForumPage";
import EventsPage from "./pages/events/EventsPage";
import UpdatesPage from "./pages/updates/UpdatesPage";
import GalleryPage from "./pages/gallery/GalleryPage";

import LoginPage from "./LoginPage";
import { AuthProvider, useAuth } from "./utils/AuthContext";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();                          // gets user from auth context
  if (!user) return <Navigate to="/login" replace />;  // if no user, redirect to login
  return children;                                     // else show children 
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
            <RequireAuth>
              <Routes>
                <Route path="/" element={<MainPage />} />                 {/* '/' sends to MainPage */}

                <Route path="/cleaning" element={<CleaningPage />} />     {/* '/cleaning' */}
                <Route path="/forum" element={<ForumPage />} />           {/* '/forum' */}
                <Route path="/events" element={<EventsPage />} />         {/* '/events' */}
                <Route path="/messages" element={<MessagesPage />} />     {/* '/messages' */}
                <Route path="/updates" element={<UpdatesPage />} />       {/* '/updates' */}
                <Route path="/gallery" element={<GalleryPage />} />       {/* '/gallery' */}

                <Route path="/teams/:teamName" element={<TeamPage />} />  {/* '/teams/:teamName' */}
                <Route path="/admin" element={<AdminPage />} />           {/* '/admin' */}
              </Routes>
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(  // insert into root (main div)
  <React.StrictMode>                              {/* bug highliting developing mode */} 
    <MantineProvider defaultColorScheme="light"> 
      <Notifications />                           {/* notification displayer */}

      <AuthProvider>
        <App />                                   {/* the App itself */}
      </AuthProvider>
    </MantineProvider>
  </React.StrictMode>,
);
