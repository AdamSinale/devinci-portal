import React from "react";
import ReactDOM from "react-dom/client";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import "./global.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/main/MainPage";
import TeamPage from "./pages/team/TeamPage";
import AdminPage from "./pages/admin/AdminPage";

import CleaningPage from "./pages/madorFeatures/cleaning/CleaningPage";
import MessagesPage from "./pages/madorFeatures/messages/MessagesPage";
import ForumPage from "./pages/madorFeatures/forum/ForumPage";
import EventsPage from "./pages/madorFeatures/events/EventsPage";
import UpdatesPage from "./pages/madorFeatures/updates/UpdatesPage";
import GalleryPage from "./pages/madorFeatures/gallery/GalleryPage";

function App() {
  return (
    <BrowserRouter>  {/* whatever inside gets routing abilitiies */}
      <Routes>       {/* inside go the routes */}
        <Route path="/" element={<MainPage />} />               {/* '/' sends to MainPage */}
        
        <Route path="/cleaning" element={<CleaningPage  />} />  {/* '/cleaning' sends to CleaningPage  */}
        <Route path="/forum" element={<ForumPage />} />         {/* '/forum' sends to ForumPage */}
        <Route path="/events" element={<EventsPage />} />       {/* '/events' sends to EventsPage */}
        <Route path="/messages" element={<MessagesPage />} />   {/* '/messages' sends to MessagesPage */}
        <Route path="/updates" element={<UpdatesPage />} />     {/* '/updates' sends to UpdatesPage */}
        <Route path="/gallery" element={<GalleryPage  />} />    {/* '/gallery' sends to GalleryPage  */}
        
        <Route path="/teams/:teamId" element={<TeamPage />} />          {/* '/teams' sends to TeamPage */}
        <Route path="/admin" element={<AdminPage />} />         {/* '/admin' sends to AdminPage */}
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(  // insert into root (main div)
  <React.StrictMode>                                           {/* bug highliting developing mode */}
    <MantineProvider defaultColorScheme="light">               {/* basic mantine theme */}
      <Notifications />                                        {/* notification desplayer */}
      <App />                                                  {/* the App itself */}
    </MantineProvider>
  </React.StrictMode>,
);
