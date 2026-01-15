import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ForumPage from "./pages/ForumPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/profile" element={<div>Profile</div>} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/events" element={<div>Events</div>} />
        <Route path="/messages" element={<div>Messages</div>} />
        <Route path="/teams" element={<div>Teams</div>} />
        <Route path="/admin" element={<div>Admin</div>} />
      </Routes>
    </BrowserRouter>
  );
}
