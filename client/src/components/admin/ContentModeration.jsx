import { useState, useMemo } from 'react';
import { toggleDiscussionNSFW, deleteDiscussion } from '../../services/adminService';
import toast from 'react-hot-toast';

export default function ContentModeration({ discussions, setDiscussions, clubs, isLoading }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClub, setSelectedClub] = useState("all");
    const [showNSFWOnly, setShowNSFWOnly] = useState(false);

    const filteredDiscussions = useMemo(() => {
        if (!discussions) return [];
        return discussions.filter(d => {
            const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesClub = selectedClub === "all" || (d.club && d.club._id === selectedClub) || (d.club === selectedClub);
            const matchesNSFW = !showNSFWOnly || d.isNSFW;
            return matchesSearch && matchesClub && matchesNSFW;
        });
    }, [discussions, searchQuery, selectedClub, showNSFWOnly]);

    const handleDelete = async (id) => {
        if (!window.confirm("CONFIRM EXPUNGEMENT? This action is irreversible.")) return;

        // Optimistic
        const original = discussions;
        setDiscussions(prev => prev.filter(d => d._id !== id));

        try {
            await deleteDiscussion(id);
            toast.success("CONTENT EXPUNGED", {
                icon: '🗑️',
                style: { background: '#1a1a1a', color: '#EF4444', border: '1px solid #EF4444' }
            });
        } catch (error) {
            setDiscussions(original);
            toast.error("EXPUNGEMENT FAILED");
        }
    };

    const handleNSFWToggle = async (discussion) => {
        const original = discussion.isNSFW;
        // Optimistic
        setDiscussions(prev => prev.map(d => d._id === discussion._id ? { ...d, isNSFW: !original } : d));

        try {
            await toggleDiscussionNSFW(discussion._id);
            toast.success(original ? "SAFE PROTOCOL RESTORED" : "RESTRICTED CONTENT MARKED", {
                icon: '🔞',
                style: { background: '#1a1a1a', color: '#eab308' }
            });
        } catch (error) {
            setDiscussions(prev => prev.map(d => d._id === discussion._id ? { ...d, isNSFW: original } : d));
            toast.error("PROTOCOL FAILED");
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* FILTER ARRAY */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-end bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                <div className="flex flex-wrap gap-4 w-full xl:w-auto">
                    <div className="w-full md:w-auto flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Keyword Scan</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="SEARCH INTEL..."
                                className="w-full md:w-64 bg-[#050505] border border-white/10 rounded px-4 py-2 pl-10 text-xs font-mono text-gray-300 focus:border-blue-500/50 focus:text-white transition-all outline-none uppercase placeholder:text-gray-700"
                            />
                            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Sector (Community)</label>
                        <select
                            value={selectedClub}
                            onChange={(e) => setSelectedClub(e.target.value)}
                            className="w-full md:w-48 bg-[#050505] border border-white/10 rounded px-4 py-2 text-xs font-mono text-gray-300 focus:border-blue-500/50 outline-none uppercase"
                        >
                            <option value="all">ALL SECTORS</option>
                            {clubs.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <button
                    onClick={() => setShowNSFWOnly(!showNSFWOnly)}
                    className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest border transition-all ${showNSFWOnly ? 'bg-red-500 text-black border-red-500' : 'bg-black/40 border-white/10 text-gray-500 hover:text-white'}`}
                >
                    {showNSFWOnly ? "SHOWING: 18+ ONLY" : "FILTER: 18+ ONLY"}
                </button>
            </div>

            {/* FEED GRID */}
            <div className="grid gap-4">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500 font-mono animate-pulse uppercase tracking-wider">
                        Scanning Feed...
                    </div>
                ) : filteredDiscussions.length > 0 ? (
                    filteredDiscussions.map(d => (
                        <div key={d._id} className="bg-[#080a0f] p-5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all flex flex-col md:flex-row gap-6 group relative overflow-hidden">
                            {/* Decorative Scanline */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    {d.club && (
                                        <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                            {d.club.name}
                                        </span>
                                    )}
                                    <span className="text-[10px] font-mono text-gray-600 uppercase">{new Date(d.createdAt).toLocaleDateString()}</span>
                                    {d.isNSFW && <span className="text-[10px] font-black text-red-500 border border-red-500/30 px-1 rounded uppercase">RESTRICTED</span>}
                                </div>

                                <div>
                                    <h3 className="text-gray-200 font-bold leading-tight group-hover:text-blue-400 transition-colors">{d.title}</h3>
                                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{d.content}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                                        {d.author?.profilePic ? <img src={d.author.profilePic} className="w-full h-full object-cover" /> : <div className="text-[8px] text-gray-500">?</div>}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{d.author?.username || "UNKNOWN_ENTITY"}</span>
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col gap-2 justify-end border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pl-4 md:pt-0">
                                <button
                                    onClick={() => handleNSFWToggle(d)}
                                    className={`p-2 rounded border transition-all ${d.isNSFW ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'border-white/5 text-gray-600 hover:text-white hover:border-white/20'}`}
                                    title="Toggle Restriction"
                                >
                                    <span className="text-[10px] font-black uppercase">18+</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(d._id)}
                                    className="p-2 rounded border border-white/5 text-gray-600 hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/30 transition-all flex items-center justify-center"
                                    title="Expunge Content"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-gray-600 font-mono text-sm border border-dashed border-white/10 rounded-xl">
                        [ NO INTELLIGENCE FOUND MATCHING PARAMETERS ]
                    </div>
                )}
            </div>
        </div>
    );
}
