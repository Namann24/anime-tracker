import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserAvatar from "../components/common/UserAvatar";
import {
    toggleBanUser,
    deleteUser,
    getSystemStats,
    getUserAnalytics,
    getAllUsers,
    getAllDiscussions,
    getAllClubs,
    getAllReviews,
    deleteDiscussion,
    toggleDiscussionNSFW,
    deleteClub,
    toggleClubNSFW,
    deleteReview
} from "../services/adminService";
import { getAllFeedback } from "../services/feedbackService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { FaUserAstronaut, FaToriiGate, FaScroll, FaSkull, FaChartPie, FaSignOutAlt, FaShieldAlt, FaStar, FaTrash, FaBan, FaUserShield } from "react-icons/fa";

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState({ users: 0, reviews: 0, discussions: 0, bannedUsers: 0, feedbacks: 0 });
    const [analytics, setAnalytics] = useState([]);
    const [vitals, setVitals] = useState([
        { subject: 'Uptime', A: 99.9, fullMark: 100 },
        { subject: 'Latency', A: 85, fullMark: 100 },
        { subject: 'Security', A: 90, fullMark: 100 },
        { subject: 'Capacity', A: 75, fullMark: 100 },
        { subject: 'Sync', A: 88, fullMark: 100 },
    ]);
    const [logs, setLogs] = useState([]);

    // Data States
    const [users, setUsers] = useState([]);
    const [discussions, setDiscussions] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();

        // Simulating Live Vitals & Logs
        const interval = setInterval(() => {
            setVitals(prev => prev.map(v => ({
                ...v,
                A: Math.min(100, Math.max(70, v.A + (Math.random() * 4 - 2)))
            })));

            if (activeTab === 'overview' && Math.random() > 0.7) {
                const actions = ["ACCESS_GRANTED", "SCAN_COMPLETE", "NODE_SYNC", "FIREWALL_ACTIVE", "ENCRYPT_PING"];
                const newLog = {
                    id: Date.now(),
                    msg: actions[Math.floor(Math.random() * actions.length)],
                    time: new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
                };
                setLogs(prev => [newLog, ...prev].slice(0, 5));
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [activeTab]);

    const fillAnalyticsGap = (data) => {
        const filled = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = data.find(item => item._id === dateStr);
            filled.push({
                _id: dateStr,
                count: found ? found.count : 0
            });
        }
        return filled;
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // Parallel Fetching for Overview
            if (activeTab === 'overview') {
                const [statsData, analyticsData] = await Promise.all([
                    getSystemStats(),
                    getUserAnalytics()
                ]);
                setStats(statsData || { users: 0, reviews: 0, discussions: 0 });
                setAnalytics(fillAnalyticsGap(analyticsData || []));
            }
            else if (activeTab === 'users') {
                const data = await getAllUsers();
                setUsers(data || []);
            }
            else if (activeTab === 'content') {
                const [discData, clubData] = await Promise.all([
                    getAllDiscussions(),
                    getAllClubs()
                ]);
                setDiscussions(discData || []);
                setClubs(clubData || []);
            }
            else if (activeTab === 'clubs') {
                const data = await getAllClubs();
                setClubs(data || []);
            }
            else if (activeTab === 'reviews') {
                const data = await getAllReviews();
                setReviews(data || []);
            }

        } catch (error) {
            console.error("Dashboard Fetch Error", error);
            // Don't toast on initial load to avoid spam, just log
        } finally {
            setIsLoading(false);
        }
    };

    const handleBanUser = async (userId) => {
        try {
            const res = await toggleBanUser(userId);
            toast.success(res.message);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: res.isBanned } : u));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    }

    const handleDeleteUser = async (userId) => {
        try {
            const res = await deleteUser(userId);
            toast.success(res.message);
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete user");
        }
    }

    const handleDeleteDiscussion = async (id) => {
        try {
            await deleteDiscussion(id);
            toast.success("Transmission purged");
            setDiscussions(prev => prev.filter(d => d._id !== id));
        } catch (error) {
            toast.error("Failed to purge transmission");
        }
    };

    const handleToggleDiscussionNSFW = async (id) => {
        try {
            const res = await toggleDiscussionNSFW(id);
            toast.success(res.message);
            setDiscussions(prev => prev.map(d => d._id === id ? { ...d, isNSFW: res.isNSFW } : d));
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteClub = async (id) => {
        try {
            await deleteClub(id);
            toast.success("Sector decommissioned");
            setClubs(prev => prev.filter(c => c._id !== id));
        } catch (error) {
            toast.error("Failed to decommission sector");
        }
    };

    const handleToggleClubNSFW = async (id) => {
        try {
            const res = await toggleClubNSFW(id);
            toast.success(res.message);
            setClubs(prev => prev.map(c => c._id === id ? { ...c, isNSFW: res.isNSFW } : c));
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteReview = async (id) => {
        try {
            await deleteReview(id);
            toast.success("Testimonial archived");
            setReviews(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            toast.error("Failed to archive testimonial");
        }
    };

    return (
        <div className="flex h-screen bg-transparent text-[var(--saga-text)] font-sans overflow-hidden selection:bg-red-500/30 selection:text-red-200 transition-colors duration-500 saga-animate-in">

            {/* TACTICAL SIDEBAR */}
            <aside className="w-64 bg-[var(--saga-surface)]/90 backdrop-blur-xl border-r border-[var(--saga-border)] hidden md:flex flex-col relative z-30 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

                <div className="p-8 relative">
                    <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-amber-600 filter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                        COMMAND
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 bg-red-500 animate-pulse rounded-full shadow-neon-red"></span>
                        <p className="text-[10px] text-[var(--saga-text-dim)] uppercase tracking-[0.2em] font-bold">Admin Protocol</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 relative z-10">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<FaChartPie />} label="Overview" />
                    <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<FaUserAstronaut />} label="Operatives" />
                    <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={<FaShieldAlt />} label="Overwatch" />
                    <TabButton active={activeTab === 'clubs'} onClick={() => setActiveTab('clubs')} icon={<FaToriiGate />} label="Sectors" />
                    <TabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} icon={<FaScroll />} label="Testimonials" />
                </nav>

                <div className="p-4 border-t border-[var(--saga-border)] relative z-10">
                    <button onClick={() => { logout(); window.location.href = "/login"; }} className="flex items-center gap-3 px-4 py-3 text-[var(--saga-text-dim)] hover:text-white transition-colors group w-full text-left">
                        <FaSignOutAlt className="group-hover:text-red-500 transition-colors" />
                        <span className="text-xs font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">Disconnect</span>
                    </button>
                </div>
            </aside>

            {/* MAIN INTERFACE */}
            <main className="flex-1 overflow-y-auto h-full relative bg-transparent">
                <div className="absolute inset-0 halftone opacity-[0.03] pointer-events-none pointer-events-none"></div>

                {/* HEADER */}
                <header className="px-8 py-5 border-b border-[var(--saga-border)] flex items-center justify-between bg-[var(--saga-glass-bg)] backdrop-blur-md sticky top-0 z-20 transition-all duration-500">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[var(--saga-text)] flex items-center gap-3">
                            <span className="text-red-600 opacity-40">/</span>
                            {activeTab === 'users' ? 'Operative Database' :
                                activeTab === 'content' ? 'Content Overwatch' :
                                    activeTab === 'clubs' ? 'Sector Control' :
                                        activeTab === 'reviews' ? 'Testimonial Archives' :
                                            'System Status'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="px-4 py-1.5 rounded-full border border-[var(--saga-border)] bg-[var(--saga-surface)] text-[9px] font-mono text-[var(--saga-text-dim)] shadow-inner hidden lg:block tracking-widest">
                            SIGNAL_SYNC: {new Date().toLocaleTimeString([], { hour12: false })}
                        </div>

                        {/* COMMANDER PROFILE */}
                        <div className="flex items-center gap-4 pl-6 border-l border-[var(--saga-border)]">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-[var(--saga-text)] leading-none uppercase tracking-widest">{user?.username}</p>
                                <p className="text-[8px] text-red-500 uppercase tracking-[0.3em] leading-none mt-1 font-bold">Commander</p>
                            </div>
                            <div className="w-9 h-9 rounded-full border border-red-500/30 p-0.5 relative group cursor-pointer hover:border-red-500 transition-all shadow-neon-red flex items-center justify-center bg-[var(--saga-surface)]">
                                <UserAvatar src={user?.profilePic} username={user?.username} className="w-full h-full rounded-full" size="sm" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-[var(--saga-surface)] rounded-full shadow-[0_0_8px_#22c55e]"></div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 relative z-0">
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* KPIS */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                <StatCard label="Total Operatives" value={stats.users} color="red" />
                                <StatCard label="Active Sectors" value={stats.clubs || 0} color="blue" />
                                <StatCard label="Intel Reports" value={stats.discussions} color="amber" />
                                <StatCard label="Banned Entities" value={stats.bannedUsers || 0} color="purple" />
                            </div>

                            {/* CHARTS */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-[var(--saga-surface)] p-6 rounded-2xl border border-[var(--saga-border)] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-600/20 to-transparent"></div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--saga-text-dim)] mb-6">Influx Metric</h3>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={analytics}>
                                                <defs>
                                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                                                <XAxis dataKey="_id" stroke={theme === 'dark' ? "#4b5563" : "#9ca3af"} tick={{ fontSize: 10, fontFamily: 'monospace', fill: theme === 'dark' ? '#9ca3af' : '#4b5563' }} />
                                                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#000' : '#fff', border: theme === 'dark' ? '1px solid #333' : '1px solid #e5e7eb', color: theme === 'dark' ? '#fff' : '#000' }} />
                                                <Area type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-[var(--saga-surface)] p-6 rounded-2xl border border-[var(--saga-border)] shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-[var(--saga-text-dim)]">System Vitals</h3>
                                        <div className="flex gap-1">
                                            {logs.map(log => (
                                                <div key={log.id} className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-64 w-full relative">
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                                            <div className="w-full h-full border border-blue-500/20 rounded-full animate-ping-slow"></div>
                                        </div>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={vitals}>
                                                <PolarGrid stroke={theme === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: theme === 'dark' ? '#6b7280' : '#4b5563', fontSize: 10, fontWeight: 900 }} />
                                                <Radar name="Vitals" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} isAnimationActive={true} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {logs.map(log => (
                                            <div key={log.id} className="flex justify-between items-center text-[10px] font-mono border-l-2 border-blue-500 pl-2 py-1 bg-blue-500/5 animate-in fade-in slide-in-from-left-2 overflow-hidden whitespace-nowrap">
                                                <span className="text-blue-500 font-bold uppercase truncate mr-4">❯ {log.msg}</span>
                                                <span className="text-[var(--saga-text-dim)] shrink-0">{log.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <UserManagement
                            users={users}
                            setUsers={setUsers}
                            isLoading={isLoading}
                            onBan={handleBanUser}
                            onDelete={handleDeleteUser}
                        />
                    )}

                    {activeTab === 'content' && (
                        <ContentModeration
                            discussions={discussions}
                            clubs={clubs}
                            isLoading={isLoading}
                            onDelete={handleDeleteDiscussion}
                            onToggleNSFW={handleToggleDiscussionNSFW}
                        />
                    )}

                    {activeTab === 'clubs' && (
                        <SectorControl
                            clubs={clubs}
                            isLoading={isLoading}
                            onDelete={handleDeleteClub}
                            onToggleNSFW={handleToggleClubNSFW}
                        />
                    )}

                    {activeTab === 'reviews' && (
                        <ReviewControl
                            reviews={reviews}
                            isLoading={isLoading}
                            onDelete={handleDeleteReview}
                        />
                    )}

                </div>
            </main>
        </div>
    );
}

// Helper Components
function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all relative overflow-hidden group ${active
                ? 'bg-red-600/10 text-red-500 shadow-inner'
                : 'text-[var(--saga-text-dim)] hover:text-[var(--saga-text)] hover:bg-[var(--saga-surface-hover)]'
                }`}
        >
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 shadow-[0_0_10px_#dc2626]"></div>}
            <span className={`text-lg transition-transform group-hover:scale-110 ${active ? 'text-red-500' : ''}`}>{icon}</span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-[var(--saga-text)]' : ''}`}>{label}</span>
        </button>
    )
}

function StatCard({ label, value, color }) {
    const colors = {
        red: 'text-red-500 border-red-500/20 bg-red-500/5',
        blue: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
        amber: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
        purple: 'text-purple-500 border-purple-500/20 bg-purple-500/5',
    };

    return (
        <div className={`p-5 rounded-xl border ${colors[color] || colors.red} flex flex-col items-center justify-center relative overflow-hidden group bg-[var(--saga-surface)] shadow-lg`}>
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">{label}</h4>
            <span className="text-3xl font-mono font-bold tracking-tighter">{value}</span>
        </div>
    )
}

// --- Sub-Components for Tab Content ---

function UserManagement({ users, setUsers, isLoading, onBan, onDelete }) {
    return (
        <div className="bg-[var(--saga-surface)] border border-[var(--saga-border)] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="p-6 border-b border-[var(--saga-border)] flex justify-between items-center bg-[var(--saga-surface)]">
                <h3 className="text-xl font-black uppercase tracking-tight text-[var(--saga-text)]">Operative Roster</h3>
                <div className="flex gap-2">
                    <input type="text" placeholder="Search operatives..." className="bg-[var(--saga-background)] border border-[var(--saga-border)] text-[var(--saga-text)] text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-red-500 transition-colors w-64" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[var(--saga-surface-hover)] border-b border-[var(--saga-border)]">
                        <tr>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--saga-text-dim)]">Identity</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--saga-text-dim)]">Role</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--saga-text-dim)]">Status</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--saga-text-dim)]">Joined</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--saga-text-dim)] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--saga-border)]">
                        {isLoading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-[var(--saga-text-dim)]">Scanning database...</td></tr>
                        ) : users.map(user => (
                            <tr key={user._id} className="hover:bg-[var(--saga-surface-hover)] transition-colors group">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--saga-surface-hover)] border border-[var(--saga-border)] flex items-center justify-center font-bold text-[var(--saga-text-dim)] text-xs overflow-hidden">
                                        <UserAvatar src={user.profilePic} username={user.username} className="w-full h-full" />
                                    </div>
                                    <span className="font-bold text-[var(--saga-text)]">{user.username}</span>
                                </td>
                                <td className="p-4 text-xs font-mono text-[var(--saga-text-dim)] uppercase">{user.role || 'Operative'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${user.isBanned ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                        {user.isBanned ? 'Restricted' : 'Active'}
                                    </span>
                                </td>
                                <td className="p-4 text-xs text-[var(--saga-text-dim)] font-mono">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onBan(user._id)}
                                            className="w-7 h-7 flex items-center justify-center rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors"
                                            title={user.isBanned ? "Unban" : "Ban"}
                                        >
                                            {user.isBanned ? <FaUserShield /> : <FaBan />}
                                        </button>
                                        <button
                                            onClick={() => onDelete(user._id)}
                                            className="w-7 h-7 flex items-center justify-center rounded bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
                                            title="Delete User"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function ContentModeration({ discussions, clubs, isLoading, onDelete, onToggleNSFW }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="bg-[var(--saga-surface)] border border-[var(--saga-border)] rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-black uppercase tracking-tight text-[var(--saga-text)] mb-4">Latest Transmissions</h3>
                <div className="space-y-4">
                    {isLoading ? <div className="text-center py-8 text-[var(--saga-text-dim)]">Intercepting signals...</div> :
                        discussions.length > 0 ? discussions.slice(0, 10).map(disc => (
                            <div key={disc._id} className="p-4 rounded-xl border border-[var(--saga-border)] bg-[var(--saga-background)] hover:border-red-500/30 transition-colors flex justify-between items-start group">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-[var(--saga-text)] text-sm group-hover:text-red-500 transition-colors">{disc.title}</h4>
                                        {disc.isNSFW && <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black tracking-tighter">18+</span>}
                                    </div>
                                    <p className="text-xs text-[var(--saga-text-dim)] line-clamp-1 mb-2">{disc.content}</p>
                                    <div className="flex gap-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--saga-text-dim)]">
                                            {clubs.find(c => c._id === disc.club)?.name || 'Unknown Sector'}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--saga-text-dim)]">•</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--saga-text-dim)]">by {disc.author?.username || 'Unknown'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onToggleNSFW(disc._id)}
                                        className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${disc.isNSFW ? 'bg-red-600 text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}
                                        title="Toggle NSFW"
                                    >
                                        <FaShieldAlt size={12} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(disc._id)}
                                        className="w-8 h-8 flex items-center justify-center rounded bg-zinc-800/10 text-zinc-500 hover:bg-red-600 hover:text-white transition-colors"
                                        title="Purge"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            </div>
                        )) : <div className="text-center py-8 text-[var(--saga-text-dim)] italic">No recent transmissions detected.</div>
                    }
                </div>
            </div>
        </div>
    )
}

function SectorControl({ clubs, isLoading, onDelete, onToggleNSFW }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            {isLoading ? <div className="col-span-full text-center py-12 text-[var(--saga-text-dim)]">Scanning sectors...</div> :
                clubs.map(club => (
                    <div key={club._id} className="bg-[var(--saga-surface)] border border-[var(--saga-border)] rounded-2xl overflow-hidden hover:border-red-500/50 transition-all group hover:-translate-y-1 shadow-lg">
                        <div className="h-24 bg-[var(--saga-surface-hover)] relative">
                            {club.image ? <img src={club.image} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" alt="" /> : <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent"></div>}
                            <div className="absolute top-2 right-2 flex gap-1">
                                {club.isNSFW && <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[8px] font-black uppercase">18+</span>}
                                <div className="px-2 py-1 bg-black/50 backdrop-blur rounded text-[9px] font-black uppercase tracking-widest text-white border border-white/10">
                                    {club.members?.length || 0} Members
                                </div>
                            </div>
                        </div>
                        <div className="p-5">
                            <h4 className="font-black text-[var(--saga-text)] uppercase tracking-tight mb-2">{club.name}</h4>
                            <p className="text-xs text-[var(--saga-text-dim)] line-clamp-2 mb-4 h-8">{club.description}</p>
                            <div className="flex justify-between items-center border-t border-[var(--saga-border)] pt-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--saga-text-dim)]">ID: {club._id.slice(-4)}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onToggleNSFW(club._id)}
                                        className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${club.isNSFW ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-red-600 hover:text-white'}`}
                                        title="Toggle NSFW"
                                    >
                                        <FaShieldAlt size={10} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(club._id)}
                                        className="w-7 h-7 flex items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:bg-red-600 hover:text-white transition-colors"
                                        title="Delete Sector"
                                    >
                                        <FaTrash size={10} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    )
} function ReviewControl({ reviews, isLoading, onDelete }) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            {isLoading ? <div className="text-center py-12 text-[var(--saga-text-dim)]">Analyzing testimonials...</div> :
                reviews.length > 0 ? reviews.map(review => (
                    <div key={review._id} className="bg-[var(--saga-surface)] border border-[var(--saga-border)] rounded-xl p-5 flex gap-4 hover:border-amber-500/30 transition-colors shadow-sm group">
                        <div className="w-10 h-10 rounded-lg bg-[var(--saga-surface-hover)] border border-[var(--saga-border)] flex items-center justify-center font-bold text-[var(--saga-text)] shrink-0 overflow-hidden">
                            <UserAvatar src={review.user?.profilePic} username={review.user?.username} className="w-full h-full" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-[var(--saga-text)] text-sm">{review.animeTitle || 'Unknown Anime'}</h4>
                                <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
                                    <FaStar /> {review.rating}/10
                                </div>
                            </div>
                            <p className="text-xs text-[var(--saga-text-dim)] mb-2 italic">"{review.content}"</p>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--saga-text-dim)]">By {review.user?.username}</span>
                                <button
                                    onClick={() => onDelete(review._id)}
                                    className="text-[var(--saga-text-dim)] hover:text-red-500 text-xs transition-colors opacity-0 group-hover:opacity-100"
                                    title="Archived Testimonial"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : <div className="text-center py-12 text-[var(--saga-text-dim)] italic">No testimonials recorded.</div>
            }
        </div>
    )
}
