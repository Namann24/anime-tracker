import { Routes, Route, useLocation } from "react-router-dom";
import DynamicBackground from "./components/effects/DynamicBackground";
import Navbar from "./components/common/Navbar";
import TacticalOverlay from "./components/common/TacticalOverlay";
import PageTransition from "./components/common/PageTransition";
import CommandPalette from "./components/common/CommandPalette";
import { Toaster } from "react-hot-toast";
import Watchlist from "./pages/Watchlist";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Clubs from "./pages/Clubs";
import ClubDetails from "./pages/ClubDetails";
import AnimeDetails from "./pages/AnimeDetails";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import Help from "./pages/Help";
import Leaderboard from "./pages/Leaderboard";

export default function App() {
  const location = useLocation();

  return (
    <>
      <DynamicBackground />
      <TacticalOverlay />
      <Navbar />
      <CommandPalette />
      <PageTransition>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:id" element={<ClubDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </PageTransition>
    </>
  );
}
// Routing Update
