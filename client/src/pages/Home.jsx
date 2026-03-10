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
import { LayoutContainer, Section, PageHeader, PanelCard, ContentGrid } from "../components/layout";
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
  const { notifications, refreshNotifications } = useNotifications();
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
    // keep tactical hub feed fresh
    refreshNotifications?.();
  }, [refreshNotifications]);

  return (
    <div className="min-h-screen text-saga-text pb-20 overflow-x-hidden transition-colors duration-500 saga-animate-in">
      {/* INFINITE SAGA HERO */}
      <div className="relative min-h-[75vh] md:min-h-[90vh] flex items-center pt-24 md:pt-32 pb-12 md:pb-16 bg-transparent overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[-8%] top-[8%] w-[520px] h-[520px] rounded-full" style={{ background: 'radial-gradient(60% 60% at 40% 40%, rgba(255,70,70,0.18), rgba(255,70,70,0))' }}></div>
        </div>

        <LayoutContainer className="relative z-10 w-full section-stack">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-600/30 bg-red-600/10 text-red-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-4 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-neon-red"></span>
                The Next Level Tracking
              </div>

              <h1 className="font-shonen mb-4 md:mb-6 leading-[0.9] md:leading-[0.85] text-saga-text relative hero-title">
                <span className="absolute -inset-6 rounded-[32px] bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none"></span>
                <span className="block animate-in fade-in slide-in-from-left-8 duration-700 delay-100 relative drop-shadow-[0_6px_24px_rgba(0,0,0,0.5)]">
                  WRITE YOUR
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 font-outline-sm animate-in fade-in slide-in-from-right-8 duration-700 delay-200 relative overflow-hidden drop-shadow-[0_12px_30px_rgba(0,0,0,0.55)] light-sweep-once text-white">
                  <span className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(55% 55% at 50% 50%, rgba(255,70,70,0.22), rgba(0,0,0,0))', opacity: 0.45 }}></span>
                  <span className="relative z-10">OWN SAGA.</span>
                </span>
              </h1>

              <p className="text-sm md:text-lg text-saga-text-dim mb-6 md:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 mobile-clean-text balanced-text">
                Experience the ultimate anime chronicling sanctuary. <br className="hidden md:block" />
                Track your progress, discover legendary series, and <br className="hidden md:block" />
                forge your legacy among global fans.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                {user ? (
                  <SagaButton
                    variant="primary"
                    size="lg"
                    onClick={() => navigate("/watchlist")}
                    className="shadow-neon-red shadow-lg w-full sm:w-auto justify-center interactive-soft"
                  >
                    Open Chronicles
                  </SagaButton>
                ) : (
                  <>
                    <SagaButton
                      variant="primary"
                      size="lg"
                      onClick={() => navigate("/register")}
                      className="shadow-neon-red shadow-lg w-full sm:w-auto justify-center interactive-soft"
                    >
                      Begin Journey
                    </SagaButton>
                    <SagaButton
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/login")}
                      className="w-full sm:w-auto justify-center interactive-soft"
                    >
                      Login
                    </SagaButton>
                  </>
                )}
              </div>
            </div>

            {/* Tactical HUB Panel */}
            <div className="flex-1 relative w-full lg:max-w-[650px] animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 mt-8 lg:mt-0">
              <div className="relative aspect-auto md:aspect-[16/10] w-full group perspective-1000">
                {/* Secondary Offset Panel (Bottom Layer) */}
                <div className="hidden md:block absolute -bottom-4 -left-4 w-full h-full border border-saga-border rounded-[32px] md:rounded-[40px] bg-saga-surface/50 backdrop-blur-sm transition-transform duration-500 group-hover:rotate-2 group-hover:translate-x-2 group-hover:translate-y-2"></div>

                {/* Main HUD Panel */}
                <div className="relative md:absolute inset-0 rounded-[2rem] md:rounded-[40px] overflow-hidden shadow-2xl glass-panel-strong transition-all duration-700 group-hover:-translate-y-2">
                        <div className="absolute inset-0 bg-halftone opacity-[0.04] z-10 pointer-events-none"></div>

                  <div className="relative p-6 md:p-8 flex flex-col justify-between z-20 gap-6 md:gap-0 h-full">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-saga-accent mb-2">Tactical Hub</span>
                        <span className="font-shonen text-2xl md:text-3xl text-saga-text">SYSTEM STATUS</span>
                      </div>
                      <div className="px-3 py-1 rounded-md border border-green-500/50 bg-green-500/10 text-green-500 text-[9px] font-black uppercase shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        Online
                      </div>
                    </div>

                    {/* Dynamic Reminders List */}
                    <div className="space-y-4">
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--saga-text-dim)]">Neural Stream</span>
                      <div className="space-y-3">
                        {notifications.length > 0 ? (
                          (() => {
                            // Filter and Sort: Unread first, then by date
                            const uniqueMap = new Map();
                            notifications.forEach(n => {
                              const key = `${n.link || '#'}-${n.message || 'system_upd'}`;
                              if (!uniqueMap.has(key)) {
                                uniqueMap.set(key, n);
                              }
                            });

                            const displayList = Array.from(uniqueMap.values())
                              .sort((a, b) => {
                                if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
                                return new Date(b.createdAt) - new Date(a.createdAt);
                              })
                              .slice(0, 2);

                            return displayList.map((n, i) => (
                              <div key={n._id} className={`p-3 md:p-4 rounded-xl border border-[var(--saga-border)] transition-colors group/item relative ${!n.isRead ? 'bg-red-600/5 border-red-600/20' : 'bg-[var(--saga-surface)] hover:bg-[var(--saga-surface-hover)]'}`}>
                                <div className="flex items-center gap-3 md:gap-4">
                                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-transform group-hover/item:scale-110 shrink-0 ${!n.isRead ? 'bg-red-600/20 text-red-500' : 'bg-red-600/10 text-red-500'}`}>
                                    {n.type === 'episode' ? '🔔' : '🏛️'}
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs md:text-sm font-bold truncate ${!n.isRead ? 'text-red-500' : 'text-[var(--saga-text)]'}`}>
                                        {n.type === 'episode' ? 'Release Alert' : 'System Sync'}
                                      </span>
                                      {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>}
                                    </div>
                                    <span className={`text-[10px] md:text-xs truncate ${!n.isRead ? 'text-[var(--saga-text)] opacity-80 font-medium' : 'text-[var(--saga-text-dim)]'}`}>{n.message}</span>
                                  </div>
                                </div>
                              </div>
                            ));
                          })()
                        ) : (
                          <>
                            <div className="p-3 md:p-4 rounded-xl border border-[var(--saga-border)] bg-[var(--saga-surface)] hover:bg-[var(--saga-surface-hover)] transition-colors group/item card-surface">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-600/10 flex items-center justify-center text-red-500 group-hover/item:scale-110 transition-transform shadow-inner shrink-0">🔔</div>
                                <div className="flex flex-col">
                                  <span className="text-[var(--saga-text)] text-xs md:text-sm font-bold">Chronicle Standby</span>
                                  <span className="text-[10px] md:text-xs text-[var(--saga-text-dim)]">Tracking for new release alerts active.</span>
                                </div>
                              </div>
                            </div>
                            <div className="hidden md:block p-4 rounded-xl border border-[var(--saga-border)] bg-[var(--saga-surface)] hover:bg-[var(--saga-surface-hover)] transition-colors group/item relative overflow-hidden card-surface">
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

                    <div className="flex items-center justify-between border-t border-saga-border pt-4 md:pt-6 mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-saga-accent shadow-neon-red"></div>
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-saga-text-dim">AI Sync Active</span>
                      </div>
                      <Link to="/notifications" className="text-[9px] md:text-[10px] font-black text-saga-accent uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-1 group/link">View Details <span className="group-hover/link:translate-x-1 transition-transform">→</span></Link>
                    </div>
                  </div>
                </div>

                {/* Floating Data Badge - Positioned strictly to prevent overlap */}
                <div className="hidden md:flex absolute top-4 -right-4 bg-saga-surface border border-saga-border p-4 rounded-2xl items-center gap-4 z-30 shadow-xl backdrop-blur-md">
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
        </LayoutContainer>
      </div>

        <LayoutContainer className="mt-16 md:mt-20 section-stack">
        {/* AI RECOMMENDATIONS */}
        {user && (
          <Section className="mb-8">
            <AIRecommendations />
          </Section>
        )}

        {loading ? (
          <div className="space-y-16">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => <SagaSkeleton key={i} />)}
            </div>
            <div className="h-[400px] bg-[var(--saga-surface)] rounded-3xl animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-20 md:space-y-24">
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
                        <div className="absolute top-0 right-0 w-24 h-24 bg-saga-accent/8 blur-3xl rounded-full"></div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-24 md:mt-40 pb-20">
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
      </LayoutContainer>
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
    <div className={`relative p-8 md:p-12 rounded-3xl overflow-hidden group/card card-surface backdrop-blur-md`}>
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
    <div className="p-8 md:p-10 rounded-2xl card-surface group transition-all hover:-translate-y-1 backdrop-blur-md">
      <div className="w-16 h-16 rounded-2xl bg-saga-accent/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 border border-saga-border/50">
        {icon}
      </div>
      <h3 className="font-shonen section-title text-saga-text mb-3 tracking-wider">{title}</h3>
      <p className="text-saga-text-dim leading-relaxed font-medium body-copy">{desc}</p>
    </div>
  );
}
