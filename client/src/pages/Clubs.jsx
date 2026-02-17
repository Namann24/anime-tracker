import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getClubs, createClub, joinClub, leaveClub } from "../services/clubService";
import { searchAnime } from "../services/animeService";
import { uploadImage } from "../services/uploadService";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";
import SagaButton from "../components/common/SagaButton";
import SagaInput from "../components/common/SagaInput";
import SagaLogo from "../components/common/SagaLogo";

export default function Clubs() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [clubs, setClubs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newClub, setNewClub] = useState({ name: "", description: "", image: "" });
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Search State
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounce Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        setIsSearching(true);
        try {
          const results = await searchAnime(query);
          setSearchResults(results.slice(0, 5));
          setShowDropdown(true);
        } catch (err) {
          console.error("Search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const selectAnime = (anime) => {
    setNewClub(prev => ({
      ...prev,
      image: prev.image || (anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "")
    }));
    setQuery(anime.title);
    setShowDropdown(false);
  };


  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const res = await getClubs();
      setClubs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createClub(newClub);
      setShowModal(false);
      setNewClub({ name: "", description: "", image: "" });
      loadClubs();
      showToast("Society Successfully Incepted", "success");
      setError(null);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to create club";
      showToast(msg, "error");
    }
  };

  const handleJoin = async (id) => {
    try {
      await joinClub(id);
      loadClubs();
      showToast("Bond Forged with Society", "success");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to join club";
      showToast(msg, "error");
    }
  };

  const handleLeave = async (id) => {
    const isConfirmed = await confirm("ARE YOU PREPARED TO ABANDON THIS SOCIETY?", "SOCIETY BREACH");
    if (!isConfirmed) return;
    try {
      await leaveClub(id);
      loadClubs();
      showToast("Bond Severed Successfully", "success");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to leave club";
      showToast(msg, "error");
    }
  };

  const isMember = (club) => {
    if (!user || !club.members) return false;
    const userId = user._id || user.id;
    if (!userId) return false;
    return club.members.some(m => {
      if (!m) return false;
      const id = m._id || m;
      return id && id.toString() === userId.toString();
    });
  };

  return (
    <div className="min-h-screen pt-20 md:pt-32 pb-24 px-4 md:px-12 transition-colors duration-500 saga-animate-in">
      <div className="max-w-[1400px] mx-auto">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 md:mb-24">
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-neon-red animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600">Saga Societies</span>
            </div>
            <h1 className="text-shonen-bold text-4xl md:text-8xl mb-4 tracking-tighter leading-none text-white uppercase italic">
              Alliance <span className="text-red-500 font-outline-sm">Bricks</span>
            </h1>
            <p className="text-[var(--saga-text-dim)] font-medium italic opacity-40 max-w-lg text-xs md:text-base">
              "Forge unbreakable bonds and archive your theories in the digital halls of the community."
            </p>
          </div>

          {user && (
            <SagaButton variant="primary" size="lg" onClick={() => setShowModal(true)} className="w-full md:w-auto shadow-impact">
              + INCEPT SOCIETY
            </SagaButton>
          )}
        </header>

        {/* MY CLUBS SECTION */}
        {user && clubs.filter(c => isMember(c)).length > 0 && (
          <div className="mb-24 animate-in fade-in slide-in-from-left-8 duration-700 delay-200 fill-mode-backwards">
            <div className="flex items-center gap-6 mb-10">
              <div className="h-0.5 w-12 bg-red-600/30"></div>
              <h3 className="text-shonen-bold text-2xl md:text-4xl tracking-tighter uppercase text-white">Your Core Alliances</h3>
            </div>
            <div className="flex overflow-x-auto pb-8 gap-6 no-scrollbar snap-x snap-mandatory px-2">
              {clubs.filter(c => isMember(c)).map(club => (
                <div key={club._id} className="min-w-[300px] md:min-w-[400px] snap-center">
                  <PremiumClubCard club={club} user={user} handleLeave={handleLeave} isMember={true} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPLORE SECTION */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400 fill-mode-backwards">
          <div className="flex items-center gap-6 mb-12">
            <div className="h-0.5 w-12 bg-red-600/30"></div>
            <h3 className="text-shonen-bold text-2xl md:text-4xl tracking-tighter uppercase text-white">Registry Discovery</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {clubs.filter(c => !user || !isMember(c)).map((club) => (
              <PremiumClubCard key={club._id} club={club} user={user} handleJoin={handleJoin} handleLeave={handleLeave} isMember={false} />
            ))}

            {clubs.length === 0 && (
              <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-[3.5rem] bg-white/[0.01]">
                <span className="text-5xl mb-6 block opacity-20 grayscale">⛩️</span>
                <p className="text-gray-500 font-black uppercase text-[10px] tracking-[0.6em] mb-8">The registry is empty.</p>
                <SagaButton variant="ghost" onClick={() => setShowModal(true)}>INITIALIZE FIRST NODE</SagaButton>
              </div>
            )}
          </div>
        </div>

        {/* CREATE MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-500">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-16 w-full max-w-2xl relative shadow-[0_0_100px_rgba(220,38,38,0.1)] max-h-[90vh] overflow-y-auto no-scrollbar">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors p-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <div className="mb-12">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.5em] block mb-4">Node Inception</span>
                <h2 className="text-shonen-bold text-5xl md:text-7xl tracking-tighter uppercase text-white leading-none">Forge <span className="text-red-500">Society</span></h2>
              </div>

              <form onSubmit={handleCreate} className="space-y-8 md:space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-2">Designation</label>
                  <SagaInput
                    placeholder="e.g. CORE_SAGA_ELITE"
                    value={newClub.name}
                    onChange={e => setNewClub({ ...newClub, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-3 relative">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-2">Banner Integration</label>
                  <SagaInput
                    placeholder="Search Anime Archives..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-[210] w-full mt-3 bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-3xl overflow-hidden animate-in slide-in-from-top-4">
                      {searchResults.map(anime => (
                        <button
                          key={anime.mal_id}
                          type="button"
                          onClick={() => selectAnime(anime)}
                          className="w-full text-left p-5 hover:bg-red-600/10 transition-colors flex items-center gap-5 border-b border-white/5 last:border-0"
                        >
                          <img src={anime.images?.jpg?.small_image_url} alt="" className="w-14 h-20 object-cover rounded-xl" />
                          <div>
                            <div className="font-black text-xs text-white leading-none mb-2 uppercase tracking-tight">{anime.title}</div>
                            <div className="text-[9px] text-gray-500 uppercase tracking-widest">{anime.type} // {anime.year || "NODE_01"}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {newClub.image && (
                  <div className="relative h-48 rounded-[2rem] overflow-hidden border border-red-600/30">
                    <img src={newClub.image} className="w-full h-full object-cover grayscale opacity-50 transition duration-1000" alt="Preview" />
                    <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-transparent to-transparent"></div>
                    <button
                      type="button"
                      onClick={() => setNewClub({ ...newClub, image: "" })}
                      className="absolute top-4 right-4 bg-black/80 p-2 rounded-full hover:bg-red-600 transition-all border border-white/10"
                    >
                      <XIcon className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-2">Manifesto Transmission</label>
                  <textarea
                    className="w-full p-8 bg-black border border-white/10 rounded-[2.5rem] text-sm text-white/80 outline-none focus:border-red-600/50 transition-all min-h-[140px] resize-none font-mono"
                    placeholder="Define the scope and protocols of this alliance..."
                    value={newClub.description}
                    onChange={e => setNewClub({ ...newClub, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-6 pt-6 font-mono">
                  <SagaButton variant="ghost" full onClick={() => setShowModal(false)} type="button">ABANDON</SagaButton>
                  <SagaButton variant="primary" full type="submit">INITIALIZE BOND</SagaButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PremiumClubCard({ club, user, handleJoin, handleLeave, isMember }) {
  return (
    <Link
      to={`/clubs/${club._id}`}
      className="group relative flex flex-col h-[400px] md:h-[450px] bg-black border border-white/[0.08] rounded-[3.5rem] overflow-hidden transition-all duration-700 hover:border-red-600/40 hover:-translate-y-3 hover:shadow-[0_30px_60px_-15px_rgba(220,38,38,0.15)] shadow-4xl active:scale-[0.98]"
    >
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        {club.image ? (
          <img src={club.image} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 group-hover:scale-110 transition-all duration-1000" alt="" />
        ) : (
          <div className="w-full h-full bg-[#050505] flex items-center justify-center text-7xl opacity-10">⛩️</div>
        )}
        {/* OVERLAYS */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent opacity-60"></div>

        {/* Tactical Scanlines */}
        <div className="absolute inset-0 scanline-mask opacity-[0.05] pointer-events-none"></div>
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10 flex flex-col h-full p-8 md:p-12">
        {/* TOP BADGES */}
        <div className="flex justify-between items-start mb-auto">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-[9px] font-black text-white/90 uppercase tracking-widest">{club.members.length} SYNCED</span>
          </div>
          {isMember && (
            <div className="p-2 rounded-xl bg-red-600 shadow-neon-red text-white">
              <Shield className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* BOTTOM INTEL */}
        <div className="mt-auto space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-4 opacity-40">
              <div className="h-[1px] w-8 bg-red-600"></div>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white">ALLIANCE_ID: {club._id.slice(-6).toUpperCase()}</span>
            </div>
            <h3 className="text-shonen-bold text-3xl md:text-5xl text-white tracking-tighter uppercase leading-none italic group-hover:text-red-500 transition-colors drop-shadow-impact">
              {club.name}
            </h3>
          </div>

          <p className="text-white/40 text-xs md:text-sm italic font-medium line-clamp-2 pr-8 group-hover:text-white/60 transition-colors leading-relaxed">
            {club.description || "PROTOCOL_BREACH: MANIFESTO_MISSING_FROM_ARCHIVE..."}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-white/5 font-mono">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-600/50 group-hover:text-red-500 transition-colors">ACCESS_ARCHIVE →</span>

            {user && (
              <div onClick={(e) => e.preventDefault()}>
                {!isMember ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleJoin(club._id); }}
                    className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-red-600 hover:border-red-600 transition-all active:scale-95"
                  >
                    JOIN_BOND
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleLeave(club._id); }}
                    className="px-6 py-2 bg-red-600/10 border border-red-600/40 rounded-xl text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95"
                  >
                    BONDED
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Corner Decorative Bits */}
      <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-white/20 rounded-tl-xl transition-all group-hover:border-red-600 group-hover:scale-125"></div>
      <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-white/20 rounded-br-xl transition-all group-hover:border-red-600 group-hover:scale-125"></div>
    </Link>
  );
}

const XIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
