import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import { useWatchlist } from "../../context/WatchlistContext";
import { useState, useEffect } from "react";
import NotificationDropdown from "./NotificationDropdown";
import SagaLogo from "./SagaLogo";
import UserAvatar from "./UserAvatar";

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const { showNSFW, setShowNSFW } = useWatchlist();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] flex justify-center pt-8 pb-4 transition-all duration-700 pointer-events-none ${isScrolled ? 'translate-y-[-15px]' : ''}`}>

      {/* 🌌 AETHER DOCK v5.0 - INTEGRATED ELEGANCE */}
      <div className="flex items-center px-6 py-2 bg-saga-surface/60 backdrop-blur-2xl border border-white/5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-auto transition-all duration-500 hover:bg-saga-surface/80 hover:border-white/10 group/dock">

        {/* 1. BRAND SECTOR */}
        <Link to="/" className="relative z-10 mr-8 group/logo">
          <SagaLogo className="h-5 w-auto transition-transform duration-500 group-hover/logo:scale-110" />
          <div className="absolute -inset-2 bg-red-600/10 blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity"></div>
        </Link>

        {/* 2. NAVIGATION LINKS (Integrated) */}
        <div className="hidden xl:flex items-center gap-1">
          <DockLink to="/" active={isActive("/")}>Home</DockLink>
          <DockLink to="/search" active={isActive("/search")}>Explore</DockLink>
          <DockLink to="/leaderboard" active={isActive("/leaderboard")}>League</DockLink>
          <DockLink to="/clubs" active={isActive("/clubs")}>Clubs</DockLink>
          <DockLink to="/about" active={isActive("/about")}>About</DockLink>
        </div>

        {/* Vertical Divider (Subtle) */}
        {user && <div className="hidden lg:block w-[1px] h-4 bg-white/5 mx-6"></div>}

        {/* 3. OPERATIONS SECTOR (User Only) */}
        {user && (
          <div className="hidden lg:flex items-center gap-1">
            <NavLinkMini to="/dashboard" active={isActive("/dashboard")}>CMD</NavLinkMini>
            <NavLinkMini to="/schedule" active={isActive("/schedule")}>Temporal</NavLinkMini>
            <NavLinkMini to="/watchlist" active={isActive("/watchlist")}>Chronicles</NavLinkMini>
            <NavLinkMini to="/analytics" active={isActive("/analytics")}>Insight</NavLinkMini>
          </div>
        )}

        {/* 4. SYSTEM SECTOR (Right) */}
        <div className="flex items-center gap-6 ml-8">
          {user ? (
            <>
              {/* Notification & System Pill */}
              <div className="flex items-center gap-3">

                {/* Admin Quick Entry */}
                {user.role === 'admin' && (
                  <Link to="/admin" className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${isActive("/admin") ? 'text-red-500' : 'text-saga-text-dim hover:text-red-500'}`}>
                    Admin
                  </Link>
                )}

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-1 transition-all ${unreadCount > 0 ? 'text-red-500' : 'text-saga-text-dim hover:text-white'}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    {unreadCount > 0 && <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full shadow-neon-red animate-pulse"></span>}
                  </button>
                  {showNotifications && (
                    <div className="absolute top-12 right-[-50px] w-[380px] z-[110] animate-in fade-in slide-in-from-top-4 duration-500">
                      <NotificationDropdown onClose={() => setShowNotifications(false)} />
                    </div>
                  )}
                </div>

                {/* Theme Toggle */}
                <button onClick={toggleTheme} className="p-1 text-saga-text-dim hover:text-yellow-400 transition-colors">
                  <span className="text-sm">{theme === 'dark' ? '☾' : '☼'}</span>
                </button>
              </div>

              {/* User Identity */}
              <Link to={`/profile/${user.username}`} className="flex items-center gap-3 group/profile">
                <div className="w-8 h-8 rounded-full p-[1px] bg-gradient-to-b from-white/10 to-transparent transition-all group-hover/profile:from-red-600/50">
                  <div className="w-full h-full rounded-full overflow-hidden bg-saga-bg">
                    <UserAvatar src={user.profilePic} username={user.username} className="w-full h-full" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none group-hover/profile:text-white transition-colors">{user.username}</span>
                  <div className="h-[1px] w-0 bg-red-600 group-hover/profile:w-full transition-all duration-500 mt-1"></div>
                </div>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-[10px] font-black text-saga-text-dim hover:text-white uppercase tracking-widest transition-colors">Login</Link>
              <Link to="/register" className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95">
                Join
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

function DockLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`
        relative px-4 py-2 transition-all duration-500
        text-[10px] font-black uppercase tracking-[0.25em]
        ${active ? 'text-white' : 'text-saga-text-dim hover:text-white'}
      `}
    >
      <span className="relative z-10">{children}</span>
      {active && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 to-transparent blur-md -z-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-red-600 shadow-[0_0_10px_rgba(220,38,38,1)]"></div>
        </>
      )}
    </Link>
  );
}

function NavLinkMini({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${active
        ? 'text-red-500'
        : 'text-saga-text-dim hover:text-white'
        }`}
    >
      {children}
    </Link>
  )
}
