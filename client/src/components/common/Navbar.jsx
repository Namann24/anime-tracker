import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import { useWatchlist } from "../../context/WatchlistContext";
import { useState } from "react";
import NotificationDropdown from "./NotificationDropdown";
import SagaLogo from "./SagaLogo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const { showNSFW, setShowNSFW } = useWatchlist();
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path) => location.pathname === path;

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none perspective-[2000px]">

      {/* COMMAND DOCK MAIN CAPSULE */}
      <div className="bg-[var(--saga-surface)]/90 backdrop-blur-2xl border border-[var(--saga-border)] rounded-full pl-6 pr-3 py-2.5 flex items-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] pointer-events-auto transition-transform duration-500 hover:scale-[1.01] relative overflow-visible group/dock">

        {/* Holographic Sheen */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="absolute inset-0 holo-sheen opacity-50"></div>
        </div>

        {/* 1. LOGO SECTOR */}
        <Link to="/" className="relative z-10 shrink-0 mr-8 hover:brightness-125 transition-all">
          <SagaLogo className="h-7 w-auto" />
        </Link>

        {/* 2. NAVIGATION SECTOR (Center) */}
        <div className="hidden xl:flex items-center bg-[var(--saga-background)]/40 rounded-full px-2 py-1 border border-[var(--saga-border)] shadow-inner mr-auto">
          <DockLink to="/" active={isActive("/")}>Home</DockLink>
          <DockLink to="/search" active={isActive("/search")}>Explore</DockLink>
          <DockLink to="/leaderboard" active={isActive("/leaderboard")}>League</DockLink>
          <DockLink to="/about" active={isActive("/about")}>About</DockLink>
        </div>

        {/* 3. USER COMMAND SECTOR (Right) */}
        <div className="flex items-center gap-3 ml-4">

          {user ? (
            <>
              {/* User Apps Pill */}
              <div className="hidden lg:flex items-center gap-1 bg-[var(--saga-background)]/20 rounded-full px-2 py-1 border border-[var(--saga-border)]">
                {user.role === 'admin' && (
                  <Link to="/admin" className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${isActive("/admin") ? 'bg-red-600 text-white border-red-500 shadow-neon-red' : 'text-red-500 border-transparent hover:bg-red-500/10'}`}>
                    Admin
                  </Link>
                )}
                <NavLinkMini to="/dashboard" active={isActive("/dashboard")}>CMD Center</NavLinkMini>
                <NavLinkMini to="/schedule" active={isActive("/schedule")}>Temporal Grid</NavLinkMini>
                <NavLinkMini to="/watchlist" active={isActive("/watchlist")}>Chronicles</NavLinkMini>
                <NavLinkMini to="/analytics" active={isActive("/analytics")}>Insight</NavLinkMini>
              </div>

              {/* Command Palette Trigger */}
              <button
                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--saga-border)] bg-[var(--saga-background)]/20 text-[var(--saga-text-dim)] hover:text-[var(--saga-text)] hover:border-[var(--saga-border)]/50 transition-all text-[9px] font-black uppercase tracking-widest ml-1"
                title="Open Command Palette (Ctrl+K)"
              >
                <span>CMD+K</span>
              </button>

              {/* Divider */}
              <div className="w-px h-8 bg-[var(--saga-border)] mx-1"></div>

              {/* SYSTEM TRAY */}
              <div className="flex items-center gap-2">

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${unreadCount > 0 ? 'bg-red-600/10 border-red-500 text-red-500 shadow-neon-red animate-pulse' : 'bg-[var(--saga-background)]/20 border-[var(--saga-border)] text-[var(--saga-text-dim)] hover:text-[var(--saga-text)] hover:bg-[var(--saga-surface-hover)]'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 border-2 border-black rounded-full"></span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute top-12 right-0 w-[350px] z-50">
                      <NotificationDropdown onClose={() => setShowNotifications(false)} />
                    </div>
                  )}
                </div>

                {/* Safety Toggle */}
                <button
                  onClick={() => setShowNSFW(!showNSFW)}
                  className={`hidden md:flex items-center justify-center h-9 px-3 rounded-full border transition-all ${showNSFW ? 'bg-red-600 border-red-500 text-white shadow-neon-red' : 'bg-[var(--saga-background)]/20 border-[var(--saga-border)] text-[var(--saga-text-dim)] hover:border-[var(--saga-text-dim)] hover:text-[var(--saga-text)]'}`}
                  title="Toggle 18+ Content"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">18+</span>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 rounded-full bg-[var(--saga-background)]/20 border border-[var(--saga-border)] flex items-center justify-center text-[var(--saga-text-dim)] hover:text-yellow-400 hover:border-yellow-400/50 transition-all"
                >
                  {theme === 'dark' ? '☾' : '☀'}
                </button>

                {/* Avatar */}
                <Link to={`/profile/${user.username}`} className="w-8 h-8 rounded-full border border-[var(--saga-border)] overflow-hidden relative group hover:border-red-600 transition-colors">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                      alt={user.username}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center bg-[var(--saga-surface)] text-[var(--saga-text)] text-xs font-bold select-none ${user.profilePic ? 'hidden' : 'flex'}`}>
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                </Link>

              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-[10px] font-black text-[var(--saga-text-dim)] hover:text-[var(--saga-text)] uppercase tracking-widest transition-colors px-2">Login</Link>
              <Link to="/register" className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-neon-red transition-all transform hover:scale-105">
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
        relative px-5 py-2 rounded-full transition-all duration-500
        text-[10px] font-black uppercase tracking-[0.2em] overflow-hidden
        ${active ? 'text-white' : 'text-[var(--saga-text-dim)] hover:text-[var(--saga-text)]'}
      `}
    >
      <span className="relative z-10">{children}</span>
      {active && (
        <div className="absolute inset-0 bg-red-600 shadow-neon-red animate-in fade-in zoom-in-95 duration-500"></div>
      )}
    </Link>
  );
}

function NavLinkMini({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${active
        ? 'bg-red-600 text-white border-red-500 shadow-neon-red'
        : 'text-[var(--saga-text-dim)] border-transparent hover:text-[var(--saga-text)] hover:bg-[var(--saga-surface-hover)]'
        }`}
    >
      {children}
    </Link>
  )
}
