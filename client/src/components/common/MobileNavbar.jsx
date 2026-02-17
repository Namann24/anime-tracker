import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function MobileNavbar() {
    const { user } = useAuth();
    const location = useLocation();

    // Hide on login/register/admin pages
    if (["/login", "/register"].includes(location.pathname) || location.pathname.startsWith("/admin")) return null;

    const isActive = (path) => location.pathname === path;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] pb-safe-area">
            {/* Glass Background with Gradient Border Top */}
            <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"></div>

            {/* Navigation Grid */}
            <nav className="relative flex justify-around items-center h-16 px-2">
                <NavTab to="/" active={isActive("/")} icon="home" label="Home" />
                <NavTab to="/search" active={isActive("/search")} icon="search" label="Explore" />

                {/* Center FAB - Chronicles */}
                <div className="relative -top-5">
                    <Link
                        to="/watchlist"
                        onClick={() => navigator.vibrate?.(15)}
                        className={`
                        flex items-center justify-center w-14 h-14 rounded-full 
                        bg-gradient-to-br from-red-600 to-red-800 
                        shadow-[0_0_20px_rgba(220,38,38,0.4)] borderWidth-2 border-[#0a0a0a]
                        transform transition-all duration-300 active:scale-90
                        ${isActive("/watchlist") ? 'ring-2 ring-white/20 scale-110' : ''}
                    `}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </Link>
                </div>

                <NavTab to="/schedule" active={isActive("/schedule")} icon="calendar" label="Grid" />

                {user ? (
                    <NavTab to={`/profile/${user.username}`} active={location.pathname.startsWith("/profile")} icon="user" label="Identity" />
                ) : (
                    <NavTab to="/login" active={isActive("/login")} icon="login" label="Login" />
                )}
            </nav>
        </div>
    );
}

function NavTab({ to, active, icon, label }) {
    // Icon mapping
    const icons = {
        home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
        search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
        calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
        user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
        login: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    };

    return (
        <Link
            to={to}
            onClick={() => navigator.vibrate?.(10)}
            className="flex flex-col items-center justify-center w-16 h-full space-y-1 active:scale-95 transition-transform"
        >
            <div className={`relative p-1.5 rounded-xl transition-all duration-500 ${active ? 'bg-red-600/10 text-red-500' : 'text-gray-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icons[icon]}
                </svg>
                {active && (
                    <div className="absolute inset-0 bg-red-600/20 blur-md rounded-xl"></div>
                )}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-wider transition-colors duration-300 ${active ? 'text-white' : 'text-gray-600'}`}>
                {label}
            </span>
        </Link>
    );
}
