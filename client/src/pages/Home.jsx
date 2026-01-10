import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTrendingAnime, getAnimeByGenre, getUpcomingAnime } from "../services/animeService";
import { getLeaderboard } from "../services/authService";
import { getGlobalReviews } from "../services/reviewService";
import AnimeRow from "../components/anime/AnimeRow";
import AIRecommendations from "../components/anime/AIRecommendations";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import SagaButton from "../components/common/SagaButton";
import useScrollReveal from "../hooks/useScrollReveal";
import SagaSkeleton from "../components/common/SagaSkeleton";
import {
  Flame,
  Calendar,
  Swords,
  Heart,
  Compass,
  Laugh,
  Ghost,
  Zap,
  Brain,
  BookOpen,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState({
    trending: [],
    upcoming: [],
    action: [],
    romance: [],
    adventure: [],
    comedy: [],
    fantasy: [],
    topWarriors: [],
    recentReviews: []
  });
  const { notifications } = useNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      const fetchSection = async (fn, key, delay = 0) => {
        try {
          if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
          const data = await fn();
          setSections(prev => ({ ...prev, [key]: data }));
        } catch (err) {
          console.error(`Failed to load ${key}`, err);
          setSections(prev => ({ ...prev, [key]: [] }));
        }
      };

      // Kick off all fetches and let them resolve independently
      Promise.allSettled([
        fetchSection(getTrendingAnime, 'trending', 0),
        fetchSection(getUpcomingAnime, 'upcoming', 0),
        fetchSection(getLeaderboard, 'topWarriors', 0),
        fetchSection(async () => {
          const res = await getGlobalReviews();
          return res.data;
        }, 'recentReviews', 0),
        fetchSection(() => getAnimeByGenre(1, 15), 'action', 0),
        fetchSection(() => getAnimeByGenre(22, 15), 'romance', 0),
        fetchSection(() => getAnimeByGenre(2, 15), 'adventure', 0),
        fetchSection(() => getAnimeByGenre(4, 15), 'comedy', 0),
        fetchSection(() => getAnimeByGenre(10, 15), 'fantasy', 0)
      ]);

      // Show the page structure immediately so the user isn't stuck behind a 5-minute wall
      setLoading(false);
    }
    loadAll();
  }, []);

  return (
    <div className="min-h-screen text-saga-text pb-20 overflow-x-hidden">
      {/* INFINITE SAGA HERO */}
      <div className="relative min-h-[90vh] flex items-center pt-32 pb-20 bg-transparent">
        {/* Animated Background Elements */}
        {/* Animated Background Elements - Removed to use Global DynamicBackground */}

        <div className="max-w-[1400px] mx-auto px-6 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-600/30 bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-neon-red"></span>
                The Next Level Tracking
              </div>

              <h1 className="font-shonen text-5xl md:text-8xl lg:text-[100px] mb-6 leading-[0.85] text-saga-text animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                WRITE YOUR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 font-outline-sm text-glow">OWN SAGA.</span>
              </h1>

              <p className="text-base md:text-lg text-saga-text-dim mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                Experience the ultimate anime chronicling sanctuary. <br className="hidden md:block" />
                Track your progress, discover legendary series, and <br className="hidden md:block" />
                forge your legacy among global fans.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                {user ? (
                  <SagaButton
                    variant="primary"
                    size="lg"
                    onClick={() => navigate("/watchlist")}
                    className="shadow-neon-red shadow-lg"
                  >
                    Open Chronicles
                  </SagaButton>
                ) : (
                  <>
                    <SagaButton
                      variant="primary"
                      size="lg"
                      onClick={() => navigate("/register")}
                      className="shadow-neon-red shadow-lg"
                    >
                      Begin Journey
                    </SagaButton>
                    <SagaButton
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </SagaButton>
                  </>
                )}
              </div>
            </div>

            {/* Tactical HUB Panel */}
            <div className="flex-1 relative w-full lg:max-w-[650px] animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
              <div className="relative aspect-[16/10] w-full group perspective-1000">
                {/* Secondary Offset Panel (Bottom Layer) */}
                <div className="absolute -bottom-4 -left-4 w-full h-full border border-saga-border rounded-[40px] bg-saga-surface/50 backdrop-blur-sm transition-transform duration-500 group-hover:rotate-2 group-hover:translate-x-2 group-hover:translate-y-2"></div>

                {/* Main HUD Panel */}
                <div className="absolute inset-0 border border-saga-border rounded-[40px] overflow-hidden shadow-2xl bg-saga-glass-bg backdrop-blur-xl transition-all duration-700 group-hover:-translate-y-2">
                  <div className="absolute inset-0 bg-halftone opacity-[0.03] z-10 pointer-events-none"></div>

                  <div className="absolute inset-0 p-8 flex flex-col justify-between z-20">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-saga-accent mb-2">Tactical Hub</span>
                        <span className="font-shonen text-3xl text-saga-text">SYSTEM STATUS</span>
                      </div>
                      <div className="px-3 py-1 rounded-md border border-green-500/50 bg-green-500/10 text-green-500 text-[9px] font-black uppercase shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        Online
                      </div>
                    </div>

                    {/* Dynamic Reminders List */}
                    <div className="space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--saga-text-dim)]">Neural Stream</span>
                      <div className="space-y-3">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 2).map((n, i) => (
                            <div key={n._id} className="p-4 rounded-xl border border-[var(--saga-border)] bg-[var(--saga-surface)] hover:bg-[var(--saga-surface-hover)] transition-colors group/item">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center text-red-500 group-hover/item:scale-110 transition-transform">
                                  {n.type === 'episode' ? '🔔' : '🏛️'}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[var(--saga-text)] text-sm font-bold truncate">{n.type === 'episode' ? 'Release Alert' : 'System Sync'}</span>
                                  <span className="text-xs text-[var(--saga-text-dim)] truncate">{n.message}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="p-4 rounded-xl border border-[var(--saga-border)] bg-[var(--saga-surface)] hover:bg-[var(--saga-surface-hover)] transition-colors group/item">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center text-red-500 group-hover/item:scale-110 transition-transform shadow-inner">🔔</div>
                                <div className="flex flex-col">
                                  <span className="text-[var(--saga-text)] text-sm font-bold">Chronicle Standby</span>
                                  <span className="text-xs text-[var(--saga-text-dim)]">Tracking for new release alerts active.</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 rounded-xl border border-[var(--saga-border)] bg-[var(--saga-surface)] hover:bg-[var(--saga-surface-hover)] transition-colors group/item relative overflow-hidden">
                              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-red-600/50 animate-progress"></div>
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-orange-600/10 flex items-center justify-center text-orange-500 group-hover/item:scale-110 transition-transform shadow-inner">🛰️</div>
                                <div className="flex flex-col">
                                  <span className="text-[var(--saga-text)] text-sm font-bold">Neural Link</span>
                                  <span className="text-xs text-[var(--saga-text-dim)]">Synchronizing with global archives...</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-saga-border pt-6 mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-saga-accent shadow-neon-red"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-saga-text-dim">AI Sync Active</span>
                      </div>
                      <Link to="/analytics" className="text-[10px] font-black text-saga-accent uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-1 group/link">View Details <span className="group-hover/link:translate-x-1 transition-transform">→</span></Link>
                    </div>
                  </div>
                </div>

                {/* Floating Data Badge - Positioned strictly to prevent overlap */}
                <div className="absolute top-4 -right-4 bg-saga-surface border border-saga-border p-4 rounded-2xl flex items-center gap-4 z-30 shadow-xl backdrop-blur-md">
                  <div className="w-10 h-10 rounded-lg bg-saga-accent flex items-center justify-center font-black text-white text-lg shadow-neon-red">
                    S
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-saga-accent mb-0.5">Version</span>
                    <span className="text-saga-text text-sm font-bold tracking-tight">v3.0-LGD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-20">
        {/* AI RECOMMENDATIONS */}
        {user && (
          <div className="mb-24">
            <AIRecommendations />
          </div>
        )}

        {loading ? (
          <div className="space-y-16">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => <SagaSkeleton key={i} />)}
            </div>
            <div className="h-[400px] bg-[var(--saga-surface)] rounded-3xl animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-24">
            <RevealSection delay="0.1s">
              <AnimeRow title="Trending Sagas" items={sections.trending} icon={<Flame className="text-orange-500" />} />
            </RevealSection>

            <RevealSection delay="0.2s">
              <AnimeRow title="Upcoming Chronicles" items={sections.upcoming} icon={<Calendar className="text-blue-500" />} />
            </RevealSection>

            {/* Interactive Grid Divider */}
            <RevealSection delay="0.3s" className="grid md:grid-cols-3 gap-8 my-24">
              <LandingCard
                title="THE SPIRIT INSIGHT"
                desc="Deep dive into your watching patterns with AI-powered analytics."
                action="Explore Insight"
                link="/analytics"
                bg="bg-gradient-to-br from-red-600/10 to-transparent"
              />
              <LandingCard
                title="THE SPIRIT LEAGUE"
                desc="Ascend the global rankings and prove your dedication to the sagas."
                action="View Rankings"
                link="/leaderboard"
                bg="bg-gradient-to-br from-purple-600/10 to-transparent"
              />
              <LandingCard
                title="JOIN THE GUILD"
                desc="Connect with other watchers and discuss the latest chapters."
                action="Join Communities"
                link="/clubs"
                bg="bg-gradient-to-br from-orange-600/10 to-transparent"
              />
            </RevealSection>

            <RevealSection delay="0.4s">
              <AnimeRow title="Action Archives" items={sections.action} icon={<Swords className="text-red-500" />} />
            </RevealSection>

            {/* Spirit League Teaser Section */}
            {sections.topWarriors.length > 0 && (
              <RevealSection delay="0.5s" className="my-32 relative">
                <div className="absolute inset-0 bg-red-600/5 blur-[150px] pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                      <h2 className="text-shonen-bold text-4xl text-[var(--saga-text)] uppercase tracking-wider mb-2">SPIRIT LEAGUE ELITE</h2>
                      <p className="text-[var(--saga-text-dim)] font-medium italic">"The most resonant souls in the current chronicle cycle."</p>
                    </div>
                    <Link to="/leaderboard" className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] hover:translate-x-2 transition-transform">Full Rankings →</Link>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {sections.topWarriors.slice(0, 4).map((warrior, idx) => (
                      <Link
                        to={`/profile/${warrior.username}`}
                        key={warrior._id}
                        className="bg-[var(--saga-surface)] p-6 rounded-3xl border border-[var(--saga-border)] hover:border-red-600/50 hover:shadow-neon-red group transition-all duration-300"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-[var(--saga-border)] group-hover:rotate-6 transition-transform relative">
                            {warrior.profilePic ? (
                              <img src={warrior.profilePic} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center bg-[#1a1a1a] text-white font-black uppercase ${warrior.profilePic ? 'hidden' : 'flex'}`}>
                              {warrior.username?.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-black text-[var(--saga-text)] hover:text-red-500 truncate max-w-[100px] transition-colors">{warrior.username}</div>
                            <div className="text-[8px] font-black text-[var(--saga-text-dim)] uppercase tracking-widest">#{idx + 1} Warrior</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-end border-t border-saga-border pt-4">
                          <div className="flex flex-col">
                            <span className="text-[7px] font-black text-saga-text-dim uppercase tracking-widest mb-1">Spirit Power</span>
                            <span className="text-sm font-black text-saga-accent italic">{warrior.spiritPower.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-[7px] font-black text-saga-text-dim uppercase tracking-widest mb-1">Titles</span>
                            <span className="text-sm font-black text-saga-text">{warrior.titlesMastered}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </RevealSection>
            )}

            <RevealSection delay="0.6s">
              <AnimeRow title="Comic Chronicles" items={sections.comedy} icon={<Laugh className="text-yellow-500" />} />
            </RevealSection>
            <RevealSection delay="0.7s">
              <AnimeRow title="Relic Realms" items={sections.fantasy} icon={<Ghost className="text-purple-500" />} />
            </RevealSection>

            {/* Global Chronicles (Recent Reviews) */}
            {sections.recentReviews.length > 0 && (
              <section className="mt-40">
                <div className="flex items-center gap-6 mb-16">
                  <div className="w-1.5 h-12 bg-red-600 rounded-full shadow-neon-red"></div>
                  <div>
                    <h2 className="font-shonen text-5xl text-saga-text uppercase tracking-tighter">GLOBAL CHRONICLE</h2>
                    <p className="text-saga-text-dim uppercase text-[10px] font-black tracking-[0.3em] mt-1">Fragmented thoughts from the collective consciousness</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sections.recentReviews.map((rev) => (
                    <div key={rev._id} className="bg-saga-surface p-10 rounded-[2.5rem] border border-saga-border relative group overflow-hidden hover:border-saga-accent/30 transition-all duration-700 hover:-translate-y-2 backdrop-blur-md">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-saga-accent/5 blur-3xl rounded-full"></div>
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-saga-surface border border-saga-border overflow-hidden flex items-center justify-center">
                            {rev.user?.profilePic ? (
                              <img src={rev.user.profilePic} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                            ) : null}
                            <div className={`text-lg font-black text-saga-text uppercase ${rev.user?.profilePic ? 'hidden' : 'block'}`}>
                              {rev.user?.username?.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <Link to={`/profile/${rev.user?.username}`} className="text-xs font-black text-saga-text hover:text-saga-accent transition-colors uppercase tracking-widest">{rev.user?.username}</Link>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-1 h-1 rounded-full ${i < Math.floor(rev.rating / 2) ? 'bg-saga-accent shadow-neon-red' : 'bg-saga-border'}`}></div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-3xl font-black italic text-saga-accent/30 group-hover:text-saga-accent transition-colors">
                          {rev.rating}
                        </div>
                      </div>
                      <p className="text-saga-text-dim italic font-medium leading-relaxed group-hover:text-saga-text transition-colors line-clamp-4">
                        "{rev.content}"
                      </p>
                      <div className="mt-8 pt-8 border-t border-saga-border flex justify-between items-center text-[9px] font-black text-saga-text-dim uppercase tracking-widest">
                        <span>Resonance Sync</span>
                        <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* FEATURE HIGHLIGHTS */}
        <div className="grid md:grid-cols-3 gap-8 mt-40 pb-20">
          <FeatureHighlight
            icon={<Zap className="w-8 h-8 text-yellow-500" />}
            title="Dragon Precision"
            desc="Every episode tracked down to the second with ink-level accuracy."
          />
          <FeatureHighlight
            icon={<Brain className="w-8 h-8 text-purple-500" />}
            title="Prophecy Engine"
            desc="Our AI predicts your next favorite saga before you even know it."
          />
          <FeatureHighlight
            icon={<BookOpen className="w-8 h-8 text-blue-500" />}
            title="Eternal Records"
            desc="A permanent archive of your journey through the worlds of anime."
          />
        </div>
      </div>
    </div>
  );
}


function RevealSection({ children, delay = '0s', className = '' }) {
  const { ref, isRevealed } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`reveal-section ${isRevealed ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
}

function LandingCard({ title, desc, action, link, bg }) {
  const navigate = useNavigate();
  return (
    <div className={`relative p-12 rounded-3xl border border-saga-border overflow-hidden group/card bg-saga-surface transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl backdrop-blur-md`}>
      <div className={`absolute inset-0 opacity-20 ${bg}`}></div>
      <div className="absolute inset-0 halftone opacity-[0.05] pointer-events-none"></div>
      <div className="relative z-10">
        <h3 className="font-shonen text-3xl text-saga-text mb-4">{title}</h3>
        <p className="text-saga-text-dim mb-10 max-w-sm leading-relaxed font-medium">{desc}</p>
        <SagaButton variant="secondary" size="md" onClick={() => navigate(link)}>
          {action}
        </SagaButton>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-saga-text/5 blur-3xl rounded-full group-hover/card:bg-saga-accent/10 transition-all duration-500"></div>
    </div>
  );
}

function FeatureHighlight({ icon, title, desc }) {
  return (
    <div className="p-10 bg-saga-surface border border-saga-border rounded-2xl hover:border-saga-accent/30 group transition-all hover:-translate-y-1 hover:shadow-lg backdrop-blur-md">
      <div className="w-16 h-16 rounded-2xl bg-saga-accent/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 border border-saga-border/50">
        {icon}
      </div>
      <h3 className="font-shonen text-2xl text-saga-text mb-4 tracking-wider">{title}</h3>
      <p className="text-saga-text-dim leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
