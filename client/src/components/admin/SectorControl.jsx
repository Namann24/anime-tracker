import { useState } from 'react';
import { FaTrash, FaEye, FaEyeSlash, FaUsers, FaGlobe, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { deleteClub } from '../../services/adminService';

export default function SectorControl({ clubs, setClubs, isLoading }) {
    const [filter, setFilter] = useState('');

    const handleDelete = async (clubId) => {
        if (!window.confirm("WARNING: Disolve this Sector? This action cannot be undone.")) return;

        // Optimistic Update
        const prevClubs = [...clubs];
        setClubs(clubs.filter(c => c._id !== clubId));

        try {
            await deleteClub(clubId);
            toast.success("Sector dissolved successfully", { icon: '💥' });
        } catch (error) {
            console.error(error);
            setClubs(prevClubs);
            toast.error("Failed to dissolve sector");
        }
    };

    const filteredClubs = clubs.filter(club =>
        club.name.toLowerCase().includes(filter.toLowerCase()) ||
        club.description?.toLowerCase().includes(filter.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-white/5 rounded-2xl border border-white/5"></div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white/50 dark:bg-[#080a0f] border border-gray-200 dark:border-white/5 rounded-xl">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="SCAN SECTORS..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 pl-10 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50 transition-colors uppercase tracking-wider"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                <div className="flex gap-4 text-[10px] font-mono text-gray-500 uppercase">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Restricted
                    </div>
                </div>
            </div>

            {/* SECTOR GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClubs.map(club => (
                    <div key={club._id} className="group relative bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden hover:border-red-600/30 transition-all duration-300">
                        {/* HEADER IMAGE */}
                        <div className="h-24 bg-gradient-to-r from-gray-900 to-black relative">
                            {club.image && (
                                <img src={club.image} alt={club.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>

                            {/* Badges */}
                            <div className="absolute top-3 right-3 flex gap-2">
                                {club.isNSFW && (
                                    <span className="px-2 py-1 bg-red-600/20 border border-red-600/50 text-red-500 text-[9px] font-black uppercase rounded">18+</span>
                                )}
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="p-5 pt-2 relative">
                            {/* Icon/Avatar Placeholder */}
                            <div className="absolute -top-6 left-5 w-12 h-12 bg-black border border-white/10 rounded-xl flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:border-red-500/50 transition-colors">
                                {club.icon || "⛩️"}
                            </div>

                            <div className="ml-16 mb-4">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">{club.name}</h3>
                                <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono mt-1">
                                    <span className="flex items-center gap-1"><FaUsers className="text-gray-600" /> {club.members?.length || 0} Operatives</span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 line-clamp-2 h-8 mb-6 font-medium">
                                {club.description || "No intel available for this sector."}
                            </p>

                            {/* ACTIONS */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-[9px] font-mono text-gray-600 uppercase">ID: {club._id.slice(-6)}</span>
                                <button
                                    onClick={() => handleDelete(club._id)}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Dissolve Sector"
                                >
                                    <FaTrash className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredClubs.length === 0 && (
                <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
                    <FaGlobe className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 font-mono uppercase">No Sectors Found</p>
                </div>
            )}
        </div>
    );
}
