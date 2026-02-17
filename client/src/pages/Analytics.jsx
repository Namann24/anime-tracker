import { useWatchlist } from "../context/WatchlistContext";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { useTheme } from "../context/ThemeContext";

// --- PREMIUM SVG ICONS ---
const FilmIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
);
const StackIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
);
const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const CheckSquareIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
);

const CustomTooltip = ({ active, payload, isDark, suffix = "" }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--saga-surface)] border-4 border-black p-4 rounded-2xl shadow-[10px_10px_0px_rgba(0,0,0,1)] relative overflow-hidden min-w-[150px]">
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-600 opacity-50"></div>
        <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Data Readout</div>
        <div className="text-sm font-black text-white uppercase tracking-tighter mb-1">{data.name}</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-600 shadow-pulse"></div>
          <div className="text-xl font-black text-white">{payload[0].value}{suffix}</div>
        </div>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { watchlist, loading } = useWatchlist();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  if (loading && watchlist.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Gathering Intel...</span>
        </div>
      </div>
    );
  }

  // --- CALCULATIONS ---
  const totalAnime = watchlist.length;

  const totalEpisodesWatched = watchlist.reduce((acc, curr) => {
    const seasons = curr.seasons || [];
    const seasonEps = seasons.reduce((sAcc, s) => sAcc + (s.watchedEpisodes?.length || 0), 0);
    return acc + seasonEps;
  }, 0);

  const totalMinutes = totalEpisodesWatched * 24;
  const daysWatched = totalMinutes / 60 / 24;

  let timeDisplay;
  if (daysWatched < 1) {
    timeDisplay = `${(totalMinutes / 60).toFixed(1)}h`;
  } else {
    timeDisplay = `${daysWatched.toFixed(1)}d`;
  }

  const statusCounts = watchlist.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    { name: "Watching", value: statusCounts["Watching"] || 0, color: "#EF4444", glow: "rgba(239, 68, 68, 0.4)" },
    { name: "Completed", value: statusCounts["Completed"] || 0, color: "#10B981", glow: "rgba(16, 185, 129, 0.4)" },
    { name: "On Hold", value: statusCounts["On Hold"] || 0, color: "#F59E0B", glow: "rgba(245, 158, 11, 0.4)" },
    { name: "Dropped", value: statusCounts["Dropped"] || 0, color: "#6B7280", glow: "rgba(107, 114, 128, 0.4)" },
    { name: "Plan to Watch", value: statusCounts["Plan to Watch"] || 0, color: "#3B82F6", glow: "rgba(59, 130, 246, 0.4)" },
  ].filter((d) => d.value > 0);

  const genreCounts = {};
  watchlist.forEach((anime) => {
    if (anime.genres && Array.isArray(anime.genres)) {
      anime.genres.forEach((g) => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    }
  });

  const genreData = Object.keys(genreCounts)
    .map((key) => ({ name: key, value: genreCounts[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const chartTextColor = isDark ? "#a0a0a0" : "#718096";
  const chartGridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-24 px-4 md:px-12 transition-colors duration-500 saga-animate-in">
      <div className="max-w-[1400px] mx-auto">

        {/* HEADER */}
        <header className="mb-12 md:mb-16 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-600 shadow-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">SAGA Intel</span>
          </div>
          <h1 className="text-shonen-bold text-4xl md:text-8xl mb-2 tracking-tighter leading-none">
            Tactical <span className="text-red-600">Insight</span>
          </h1>
          <p className="text-[var(--saga-text-dim)] font-medium italic opacity-60 text-sm md:text-base">"Quantifying the legend of your journey through the archive."</p>
        </header>

        {/* KPI GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-backwards">
          <ImpactCard title="Total Sagas" value={totalAnime} label="Chronicles" icon={<FilmIcon className="w-6 h-6 md:w-8 md:h-8" />} color="text-red-500" delay="0s" />
          <ImpactCard title="EPs Logged" value={totalEpisodesWatched} label="Milestones" icon={<StackIcon className="w-6 h-6 md:w-8 md:h-8" />} color="text-orange-500" delay="0.1s" />
          <ImpactCard title="Time Spent" value={timeDisplay} label="Temporal Decay" icon={<ClockIcon className="w-6 h-6 md:w-8 md:h-8" />} color="text-blue-500" delay="0.2s" />
          <ImpactCard title="Success Rate" value={`${totalAnime ? Math.round((statusCounts["Completed"] || 0) / totalAnime * 100) : 0}%`} label="Completion" icon={<CheckSquareIcon className="w-6 h-6 md:w-8 md:h-8" />} color="text-green-500" delay="0.3s" />
        </div>

        {/* CHARTS SECTION */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 relative z-10">

          {/* WATCHLIST DIST */}
          <div className="bg-[var(--saga-surface)] p-5 md:p-12 border-4 border-black rounded-[2.5rem] relative group overflow-hidden shadow-impact transition-all hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-600 z-10"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-600 z-10"></div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full pointer-events-none"></div>
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2">Tactical Map</span>
                <h3 className="text-shonen-bold text-2xl md:text-3xl tracking-tighter uppercase">CHRONICLE STATUS</h3>
              </div>
              <div className="px-3 py-1 bg-red-600/10 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-red-600/20">LIVE DATA</div>
            </div>

            <div className="h-[250px] md:h-[350px] w-full relative group/chart">
              {/* Halftone Texture Overlay */}
              <div className="absolute inset-0 halftone opacity-[0.03] pointer-events-none rounded-[2rem]"></div>

              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {statusData.map((entry, index) => (
                        <filter id={`glow-${index}`} key={index}>
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      ))}
                    </defs>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          style={{ filter: `drop-shadow(0 0 8px ${entry.glow})` }}
                          className="hover:opacity-80 transition-opacity cursor-crosshair"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconType="rect"
                      formatter={(value) => <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a0a0a0] hover:text-white transition-colors ml-2">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyIntel message="No chronicle data to display" />
              )}

              {/* HUD Decoration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-1">Status</div>
                <div className="text-2xl md:text-3xl font-black text-white">{totalAnime}</div>
              </div>
            </div>
          </div>

          {/* GENRE DIST */}
          <div className="bg-[var(--saga-surface)] p-5 md:p-12 border-4 border-black rounded-[2.5rem] relative group overflow-hidden shadow-impact transition-all hover:scale-[1.01]">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-600 z-10"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-600 z-10"></div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full pointer-events-none"></div>
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Elemental Core</span>
                <h3 className="text-shonen-bold text-2xl md:text-3xl tracking-tighter uppercase">TOP AFFINITIES</h3>
              </div>
              <div className="px-3 py-1 bg-blue-600/10 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-600/20">ARCHIVE PULSE</div>
            </div>

            <div className="h-[250px] md:h-[350px] w-full relative">
              <div className="absolute inset-0 halftone opacity-[0.03] pointer-events-none rounded-[2rem]"></div>
              {genreData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genreData} layout="vertical" margin={{ left: -20, right: 40, top: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="10 10" horizontal={false} stroke={chartGridColor} />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', fill: chartTextColor, letterSpacing: '0.1em' }}
                    />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip isDark={isDark} suffix=" Sagas" />} />
                    <Bar
                      dataKey="value"
                      radius={[0, 4, 4, 0]}
                      barSize={16}
                      animationBegin={500}
                      animationDuration={1500}
                    >
                      {genreData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"][index % 5]}
                          style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.5))' }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyIntel message="No affinity data detected. Expand your horizon." />
              )}
            </div>
          </div>
        </div>

        {/* Neural Activity Log (New Section) */}
        <section className="mt-16 md:mt-24 bg-[var(--saga-surface)] border-4 border-[var(--saga-border)] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-3xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-xl md:text-3xl">🧩</div>
              <div>
                <h4 className="text-shonen-bold text-xl md:text-2xl tracking-tighter uppercase mb-1 text-[var(--saga-text)]">SYSTEM SYNC: OPTIMIZED</h4>
                <p className="text-[9px] md:text-[10px] font-black text-[var(--saga-text-dim)] uppercase tracking-widest">Neural link integrity at 98.4%. Data archival complete.</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-4 py-2 md:px-6 md:py-3 bg-[var(--saga-surface-hover)] border border-[var(--saga-border)] rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--saga-text-dim)]">
                Session Uptime: {Math.floor(Math.random() * 120)}m
              </div>
              <div className="px-4 py-2 md:px-6 md:py-3 bg-red-600 text-white rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-impact animate-pulse">
                Active Protocol
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER ACCENT */}
        <div className="mt-24 text-center">
          <div className="w-12 h-px bg-[var(--saga-border)] mx-auto mb-8"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.8em] text-[var(--saga-text-dim)]">End of Session Report • Neural Link Stable</p>
        </div>
      </div>
    </div>
  );
}

function ImpactCard({ title, value, label, icon, delay, color }) {
  return (
    <div
      className="bg-[var(--saga-surface)] p-4 md:p-8 border-4 border-black rounded-[2rem] group hover:border-red-600 transition-all duration-500 overflow-hidden relative shadow-impact"
      style={{ animationDelay: delay }}
    >
      <div className="absolute top-0 left-0 w-2 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 bg-[var(--saga-surface-hover)] rounded-2xl group-hover:bg-red-600/5 transition-colors ${color}`}>
          {icon}
        </div>
        <span className="text-[9px] font-black text-[var(--saga-text-dim)] uppercase tracking-widest">{label}</span>
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest">{title}</h4>
        <div className="text-4xl md:text-5xl font-black text-[var(--saga-text)] tracking-tighter leading-none group-hover:scale-105 transition-transform duration-500 origin-left">
          {value}
        </div>
      </div>
    </div>
  );
}

function EmptyIntel({ message }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[var(--saga-border)] rounded-[2rem]">
      <div className="text-5xl opacity-10 mb-4">📜</div>
      <p className="text-[var(--saga-text-dim)] font-bold uppercase text-[10px] tracking-widest max-w-[200px]">{message}</p>
    </div>
  );
}
