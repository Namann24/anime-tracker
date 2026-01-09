import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchAnime } from "../../services/animeService";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { FaTerminal, FaMoon, FaSun, FaUser, FaEraser, FaSearch } from "react-icons/fa";

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const resultsRef = useRef(null);

    // Toggle with Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery("");
            setResults([]);
            setSelectedIndex(0);
            // Pre-populate with navigation commands
            setResults(STATIC_COMMANDS);
        }
    }, [isOpen]);

    // Search logic
    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (!query.trim()) {
                setResults(STATIC_COMMANDS);
                return;
            }

            // Filter static commands locally
            const filteredCommands = STATIC_COMMANDS.filter(cmd =>
                cmd.title.toLowerCase().includes(query.toLowerCase())
            );

            // Search API
            try {
                const apiResults = await searchAnime(query);
                const animeCommands = apiResults.slice(0, 5).map(anime => ({
                    id: anime.mal_id,
                    title: anime.title,
                    type: "Anime",
                    action: () => navigate(`/anime/${anime.mal_id}`),
                    image: anime.images.jpg.small_image_url
                }));

                setResults([...filteredCommands, ...animeCommands]);
                setSelectedIndex(0);
            } catch (err) {
                console.error(err);
            }
        }, 300);

        return () => clearTimeout(delaySearch);
    }, [query, navigate]);

    // Keyboard navigation
    const handleInputKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (results[selectedIndex]) {
                results[selectedIndex].action();
                setIsOpen(false);
            }
        }
    };

    const STATIC_COMMANDS = [
        { title: "Dashboard", type: "Navigation", action: () => navigate("/dashboard"), icon: <FaTerminal className="text-red-500" /> },
        { title: "Schedule", type: "Navigation", action: () => navigate("/schedule"), icon: "📅" },
        { title: "Watchlist", type: "Navigation", action: () => navigate("/watchlist"), icon: "📑" },
        { title: "Switch Theme", type: "System", action: () => toggleTheme(), icon: theme === 'dark' ? <FaSun className="text-amber-500" /> : <FaMoon className="text-blue-500" /> },
        { title: "My Profile", type: "Navigation", action: () => navigate(`/profile/${user?.username}`), icon: <FaUser className="text-emerald-500" /> },
        { title: "Clear Search", type: "Action", action: () => setQuery(""), icon: <FaEraser className="text-zinc-500" /> },
        { title: "Logout", type: "Action", action: () => { logout(); navigate("/login"); }, icon: "🚪" },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setIsOpen(false)}
            ></div>

            {/* Palette */}
            <div className="relative w-full max-w-2xl bg-[var(--saga-surface)] border border-[var(--saga-border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[60vh]">
                <div className="flex items-center px-4 py-4 border-b border-[var(--saga-border)]">
                    <svg className="w-5 h-5 text-[var(--saga-text-dim)] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-[var(--saga-text)] placeholder-[var(--saga-text-dim)] text-lg font-medium"
                        placeholder="Search commands or anime..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                    />
                    <div className="text-[10px] font-bold text-[var(--saga-text-dim)] border border-[var(--saga-border)] px-2 py-1 rounded">ESC</div>
                </div>

                <div className="overflow-y-auto p-2" ref={resultsRef}>
                    {results.length === 0 ? (
                        <div className="p-8 text-center text-[var(--saga-text-dim)] text-sm">No results found.</div>
                    ) : (
                        results.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => { item.action(); setIsOpen(false); }}
                                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors ${index === selectedIndex ? "bg-[var(--saga-surface-hover)]" : "hover:bg-[var(--saga-surface-hover)]"
                                    }`}
                            >
                                {item.image ? (
                                    <div className="w-10 h-14 shrink-0 overflow-hidden rounded bg-[var(--saga-surface-hover)]">
                                        <img src={item.image} className="w-full h-full object-cover" alt="" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 flex items-center justify-center bg-[var(--saga-background)] border border-[var(--saga-border)] rounded-xl text-lg shrink-0">
                                        {item.icon || <FaSearch className="text-[var(--saga-text-dim)] shrink-0" />}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-bold ${index === selectedIndex ? "text-[var(--saga-text)]" : "text-[var(--saga-text-dim)]"}`}>
                                        {item.title}
                                    </div>
                                    <div className="text-[10px] text-[var(--saga-text-dim)] uppercase tracking-widest">{item.type}</div>
                                </div>

                                {index === selectedIndex && (
                                    <svg className="w-4 h-4 text-[var(--saga-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="p-2 border-t border-[var(--saga-border)] bg-[var(--saga-background)]/50 flex justify-between items-center text-[10px] text-[var(--saga-text-dim)] font-medium px-4">
                    <span>SAGA COMMAND v1.0</span>
                    <div className="flex gap-2">
                        <span>↑↓ to navigate</span>
                        <span>↵ to select</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
