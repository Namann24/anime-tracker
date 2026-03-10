import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import { useWatchlist } from "../../context/WatchlistContext";
import { useState, useEffect } from "react";
import NotificationDropdown from "./NotificationDropdown";
import SagaLogo from "./SagaLogo";
import UserAvatar from "./UserAvatar";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const { showNSFW, setShowNSFW } = useWatchlist();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] flex justify-center pt-2 md:pt-8 pb-4 transition-all duration-700 pointer-events-none ${isScrolled ? 'translate-y-[-5px] md:translate-y-[-15px]' : ''}`}>

      {/* 🌌 AETHER DOCK v6.0 - MOBILE HYBRID */}
      <div className={`flex items-center justify-between px-4 md:px-6 py-2 bg-saga-surface/80 backdrop-blur-2xl border border-white/5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-auto transition-all duration-500 hover:bg-saga-surface/90 hover:border-white/10 group/dock w-[95%] max-w-[1400px] md:w-auto relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-60 bg-gradient-to-r from-white/5 via-transparent to-white/5 blur-2xl pointer-events-none"></div>

        {/* 1. BRAND SECTOR */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="md:hidden p-1 text-saga-text hover:text-red-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
          </button>

          <Link to="/" className="relative z-10 mr-4 md:mr-8 group/logo shrink-0 flex items-center gap-2">
            <SagaLogo className="h-6 w-auto md:h-5 transition-transform duration-500 group-hover/logo:scale-110" showText={false} />
            <span className="md:hidden text-[12px] font-black uppercase tracking-[0.3em] text-[var(--saga-text)]">SAGA</span>
            <div className="absolute -inset-2 bg-red-600/10 blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity"></div>
          </Link>
        </div>

        {/* 2. NAVIGATION LINKS (Desktop Only) */}
        <div className="hidden md:flex items-center gap-1">
          <DockLink to="/" active={isActive("/")}>Home</DockLink>
          <DockLink to="/search" active={isActive("/search")}>Explore</DockLink>
          <DockLink to="/leaderboard" active={isActive("/leaderboard")}>League</DockLink>
          <DockLink to="/clubs" active={isActive("/clubs")}>Clubs</DockLink>
          <DockLink to="/about" active={isActive("/about")}>About</DockLink>
        </div>

        {/* Vertical Divider (Subtle) */}
        {user && <div className="hidden lg:block w-[1px] h-4 bg-white/5 mx-6"></div>}

        {/* 3. OPERATIONS SECTOR (User Only - Desktop) */}
        {user && (
          <div className="hidden lg:flex items-center gap-1">
            <NavLinkMini to="/dashboard" active={isActive("/dashboard")}>CMD</NavLinkMini>
            <NavLinkMini to="/schedule" active={isActive("/schedule")}>Temporal Grid</NavLinkMini>
            <NavLinkMini to="/watchlist" active={isActive("/watchlist")}>Chronicles</NavLinkMini>
            <NavLinkMini to="/analytics" active={isActive("/analytics")}>Insight</NavLinkMini>
          </div>
        )}

        {/* 4. SYSTEM SECTOR (Hybrid - Visible on Mobile) */}
        <div className="flex items-center gap-3 ml-auto md:ml-8">
          {user ? (
            <>
              {/* Admin Quick Entry */}
              {user.role === 'admin' && (
                <Link to="/admin" className="hidden md:block group/admin relative px-2 py-1">
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${isActive("/admin") ? 'text-red-500' : 'text-red-600 group-hover/admin:text-red-500'}`}>
                    <span className={`w-1 h-1 rounded-full bg-red-600 ${isActive("/admin") ? 'animate-pulse' : 'opacity-100'}`}></span>
                    Overwatch
                  </span>
                </Link>
              )}

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-1 transition-all ${unreadCount > 0 ? 'text-red-500' : 'text-saga-text-dim hover:text-white'}`}
                >
                  <svg className="w-5 h-5 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  {unreadCount > 0 && <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full shadow-neon-red animate-pulse"></span>}
                </button>
                {showNotifications && (
                  <div className="absolute top-12 right-[-20px] md:right-[-50px] w-[300px] md:w-[380px] z-[110] animate-in fade-in slide-in-from-top-4 duration-500">
                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                  </div>
                )}
              </div>

              {/* Theme & NSFW - Desktop Only (Mobile uses Settings page) */}
              <div className="hidden md:flex items-center gap-1 px-1.5 py-1 bg-white/[0.03] rounded-full border border-white/5 mx-1 transition-all duration-500 hover:border-white/10 hover:bg-white/[0.05]">
                <button
                  onClick={toggleTheme}
                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-500 ${theme === 'dark' ? 'text-saga-text-dim hover:text-yellow-400' : 'text-yellow-500 bg-yellow-500/10 shadow-[0_0_10px_rgba(234,179,8,0.2)]'}`}
                  title="Toggle Theme"
                >
                  <span className="text-xs">{theme === 'dark' ? '☾' : '☼'}</span>
                </button>
                <div className="w-[1px] h-3 bg-white/10 mx-0.5"></div>
                <button
                  onClick={() => setShowNSFW(!showNSFW)}
                  className={`w-9 h-7 flex items-center justify-center text-[8px] font-black transition-all rounded-full ${showNSFW ? 'text-red-500 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'text-saga-text-dim hover:text-white'}`}
                  title="Toggle NSFW Content"
                >
                  18+
                </button>
              </div>

              {/* User Identity - Desktop Only */}
              <Link to={`/profile/${user.username}`} className="hidden md:flex items-center gap-3 group/profile">
                <div className="w-8 h-8 rounded-full p-[1px] bg-gradient-to-b from-white/10 to-transparent transition-all group-hover/profile:from-red-600/50">
                  <div className="w-full h-full rounded-full overflow-hidden bg-saga-bg">
                    <UserAvatar src={user.profilePic} username={user.username} className="w-full h-full" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-[var(--saga-text-dim)] opacity-60 uppercase tracking-widest leading-none group-hover/profile:text-[var(--saga-text)] group-hover/profile:opacity-100 transition-colors">{user.username}</span>
                  <div className="h-[1px] w-0 bg-red-600 group-hover/profile:w-full transition-all duration-500 mt-1"></div>
                </div>
              </Link>

              {/* Settings Link for Mobile (Replaces User Identity) */}
              <Link to="/settings" className="md:hidden p-1 text-saga-text-dim hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </Link>

              {/* Logout Button - Desktop Only */}
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
                className="hidden md:flex group/logout relative items-center justify-center w-8 h-8 rounded-full border border-white/10 text-saga-text-dim hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300 ml-2"
                title="Disconnect"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                <div className="absolute inset-0 bg-red-500/20 blur opacity-0 group-hover/logout:opacity-100 transition-opacity rounded-full"></div>
              </button>
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

      <MobileMenu isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} />
    </nav>
  );
}

function DockLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`
        relative px-4 py-2 transition-all duration-500 nav-underline
        text-[10px] font-black uppercase tracking-[0.25em] hover:-translate-y-[1px]
        ${active ? 'text-[var(--saga-text)] is-active drop-shadow-[0_0_10px_rgba(255,70,70,0.35)]' : 'text-saga-text-dim hover:text-[var(--saga-text)]'}
      `}
    >
      <div className="relative flex flex-col items-center group/link">
        <span className="relative z-10 mr-[-0.25em] transition-transform duration-500 group-hover/link:scale-110">{children}</span>
        <div className={`
          absolute bottom-[-10px] h-[2px] transition-all duration-500 ease-out
          ${active
            ? 'w-[70%] bg-red-600 shadow-[0_0_15px_rgba(255,0,0,0.8)] opacity-100 scale-x-100'
            : 'w-0 bg-white/20 opacity-0 scale-x-0 group-hover/link:w-[40%] group-hover/link:opacity-50 group-hover/link:scale-x-100'}
        `}></div>
      </div>
    </Link>
  );
}

function NavLinkMini({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`relative px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all nav-underline hover:-translate-y-[1px] ${active
        ? 'text-red-500 is-active drop-shadow-[0_0_8px_rgba(255,70,70,0.25)]'
        : 'text-saga-text-dim hover:text-[var(--saga-text)]'
        }`}
    >
      <div className="relative flex flex-col items-center group/mini">
        <span className="relative z-10 mr-[-0.1em] transition-transform duration-500 group-hover/mini:translate-y-[-1px]">{children}</span>
        <div className={`
          absolute bottom-[-8px] h-[1.5px] transition-all duration-500
          ${active
            ? 'w-[60%] bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.6)] opacity-100'
            : 'w-0 bg-white/10 opacity-0 group-hover/mini:w-[30%] group-hover/mini:opacity-30'}
        `}></div>
      </div>
    </Link>
  )
}
