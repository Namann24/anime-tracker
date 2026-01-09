import { useState, useMemo } from 'react';
import { toggleBanUser } from '../../services/adminService';
import toast from 'react-hot-toast';

export default function UserManagement({ users, setUsers, isLoading }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(u => {
            const matchesSearch =
                u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase());

            if (filter === "banned") return matchesSearch && u.isBanned;
            if (filter === "active") return matchesSearch && !u.isBanned;
            if (filter === "admin") return matchesSearch && u.role === "admin";

            return matchesSearch;
        });
    }, [users, searchQuery, filter]);

    const handleBanToggle = async (user) => {
        const originalStatus = user.isBanned;
        // Optimistic Update
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isBanned: !originalStatus } : u));

        try {
            const { message } = await toggleBanUser(user._id);
            toast.success(message, {
                style: { background: '#1a1a1a', color: '#EF4444', border: '1px solid #EF4444' },
                icon: '🛡️',
            });
        } catch (error) {
            // Revert
            setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isBanned: originalStatus } : u));
            toast.error("Command Failed");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* CONTROL BAR */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                <div className="w-full md:w-auto flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-red-500 tracking-widest">Search Database</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="SEARCH OPERATIVE..."
                            className="w-full md:w-64 bg-[#050505] border border-white/10 rounded px-4 py-2 pl-10 text-xs font-mono text-gray-300 focus:border-red-500/50 focus:text-white transition-all outline-none uppercase placeholder:text-gray-700"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {['all', 'active', 'banned', 'admin'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest border transition-all ${filter === f ? 'bg-white/10 text-white border-white/20' : 'text-gray-600 border-transparent hover:text-gray-400'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* TACTICAL DATA GRID */}
            <div className="bg-[#080a0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600/0 via-red-600/50 to-red-600/0 opacity-50"></div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <th className="p-4">Operative</th>
                                <th className="p-4">Clearance</th>
                                <th className="p-4">Reg. Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-xs">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500 animate-pulse">
                                        SCANNING DATABASE...
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(u => (
                                    <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-lg overflow-hidden relative">
                                                    {u.profilePic ? (
                                                        <img src={u.profilePic} alt={u.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-600">{u.username[0]}</span>
                                                    )}
                                                    {u.isOnline && <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 shadow-[0_0_10px_#22c55e]"></div>}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-300 group-hover:text-white transition-colors uppercase tracking-wider">{u.username}</div>
                                                    <div className="text-[10px] text-gray-600">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {u.role === 'admin' ? (
                                                <span className="text-red-500 font-bold flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> CMD
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">USR</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            {u.isBanned ? (
                                                <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-[10px] w-fit">
                                                    TERMINATED
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-500 font-bold text-[10px] w-fit">
                                                    ACTIVE
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {u.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleBanToggle(u)}
                                                    className={`px-3 py-1 rounded border text-[10px] font-bold uppercase tracking-wider transition-all ${u.isBanned
                                                            ? 'border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                                            : 'border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-black hover:shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                                                        }`}
                                                >
                                                    {u.isBanned ? "REINSTATE" : "TERMINATE"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-600 font-mono text-sm">
                                        [ NO RECORDS FOUND ]
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Footer / Pagination Mockup */}
                <div className="p-3 border-t border-white/5 bg-black/20 flex justify-between items-center text-[10px] text-gray-600 font-mono">
                    <span>TOTAL RECORDS: {users?.length || 0}</span>
                    <span>SYSTEM_V.3.0.1</span>
                </div>
            </div>
        </div>
    );
}
