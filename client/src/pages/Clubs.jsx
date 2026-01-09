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
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 transition-colors duration-500 saga-animate-in">
      <div className="max-w-[1400px] mx-auto">

        {/* HEADER */}

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-600 shadow-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">The Societies</span>
            </div>
            <h1 className="text-shonen-bold text-6xl md:text-8xl mb-2 tracking-tighter leading-none">
              Command <span className="text-red-600">Clubs</span>
            </h1>
            <p className="text-[var(--saga-text-dim)] font-medium italic opacity-60 max-w-xl">"Forge alliances and etch your theories into the digital halls of the SAGA community."</p>
          </div>

          {user && (
            <SagaButton variant="primary" size="lg" onClick={() => setShowModal(true)}>
              + Incept New Club
            </SagaButton>
          )}
        </header>

        {/* MY CLUBS SECTION */}
        {user && (
          <div className="mb-24">
            <h3 className="text-shonen-bold text-3xl mb-8 tracking-tighter uppercase flex items-center gap-4">
              <span className="w-8 h-[2px] bg-red-600"></span>
              Your Alliances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clubs.filter(c => isMember(c)).length > 0 ? (
                clubs.filter(c => isMember(c)).map(club => (
                  <ClubMangaPanel key={club._id} club={club} user={user} handleJoin={handleJoin} handleLeave={handleLeave} isMember={true} />
                ))
              ) : (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-[var(--saga-border)] rounded-[3rem]">
                  <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">No alliances forged yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DISCOVER SECTION */}
        <div className="mb-12">
          <h3 className="text-shonen-bold text-3xl mb-8 tracking-tighter uppercase flex items-center gap-4">
            <span className="w-8 h-[2px] bg-red-600"></span>
            Explore the Realm
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {clubs.filter(c => !user || !isMember(c)).map((club) => (
              <ClubMangaPanel key={club._id} club={club} user={user} handleJoin={handleJoin} handleLeave={handleLeave} isMember={false} />
            ))}

            {clubs.length === 0 && (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-[var(--saga-border)] rounded-[3rem]">
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-4">The realm is quiet.</p>
                <SagaButton variant="ghost" onClick={() => setShowModal(true)}>Cast the First Stone</SagaButton>
              </div>
            )}
          </div>
        </div>

        {/* CREATE MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
            <div className="bg-[var(--saga-surface)] border border-[var(--saga-border)] rounded-[3rem] p-10 md:p-16 w-full max-w-2xl relative overflow-hidden shadow-[0_0_100px_rgba(255,0,60,0.1)]">

              <button
                onClick={() => setShowModal(false)}
                className="absolute top-8 right-8 text-[var(--saga-text-dim)] hover:text-white transition-colors"
                title="Seal Modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Architect of Legend</span>
                </div>
                <h2 className="text-shonen-bold text-5xl md:text-6xl tracking-tighter uppercase leading-none">Incept <span className="text-red-600">Club</span></h2>
              </div>

              <form onSubmit={handleCreate} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Club Identity</label>
                  <SagaInput
                    placeholder="e.g. SHONEN SUPREMACY"
                    value={newClub.name}
                    onChange={e => setNewClub({ ...newClub, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Banner Discovery <span className="opacity-40 italic">(Search Anime)</span></label>
                  <SagaInput
                    placeholder="Search Anime for Banner..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-[110] w-full mt-2 bg-[var(--saga-surface)] border border-[var(--saga-border)] rounded-2xl shadow-2xl overflow-hidden no-scrollbar">
                      {searchResults.map(anime => (
                        <button
                          key={anime.mal_id}
                          type="button"
                          onClick={() => selectAnime(anime)}
                          className="w-full text-left p-4 hover:bg-red-600/10 transition-colors flex items-center gap-4 border-b border-[var(--saga-border)] last:border-0"
                        >
                          <img src={anime.images?.jpg?.small_image_url} alt="" className="w-12 h-16 object-cover rounded-lg" />
                          <div>
                            <div className="font-black text-xs text-[var(--saga-text)] leading-none mb-1">{anime.title}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">{anime.year || "YEARLESS"} • {anime.type}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {newClub.image && (
                  <div className="relative h-48 rounded-3xl overflow-hidden border border-red-600/30 group">
                    <img src={newClub.image} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="Banner Preview" />
                    <div className="absolute inset-0 bg-red-600/20 mix-blend-overlay"></div>
                    <button
                      type="button"
                      onClick={() => setNewClub({ ...newClub, image: "" })}
                      className="absolute top-4 right-4 bg-black/60 p-2 rounded-full hover:bg-red-600 transition-colors backdrop-blur-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Archive Manifesto</label>
                  <textarea
                    className="w-full p-6 bg-black/5 border border-[var(--saga-border)] rounded-[2rem] text-[var(--saga-text)] outline-none focus:border-red-600/50 transition-all min-h-[120px] text-sm resize-none"
                    placeholder="What is the purpose of this society?"
                    value={newClub.description}
                    onChange={e => setNewClub({ ...newClub, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <SagaButton variant="ghost" full onClick={() => setShowModal(false)} type="button">Seal</SagaButton>
                  <SagaButton variant="primary" full type="submit">Forge Club</SagaButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClubMangaPanel({ club, user, handleJoin, handleLeave, isMember }) {
  return (
    <div className="group relative bg-[var(--saga-surface)] border border-[var(--saga-border)] p-6 md:p-8 rounded-[2.5rem] transition-all duration-500 aura-flare hover:-translate-y-2 flex flex-col h-full overflow-hidden">

      {/* CARD BG ACCENT */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

      {/* BANNER RECTANGLE (Manga Style) */}
      <div className="relative h-48 mb-8 rounded-[2rem] overflow-hidden border border-[var(--saga-border)] bg-black/5">
        {club.image ? (
          <img src={club.image} className="w-full h-full object-cover transition duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-10">⛩️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--saga-surface)] via-transparent to-transparent opacity-60"></div>

        {/* MEMBERS BADGE */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <span className="w-1 h-1 rounded-full bg-red-600 animate-pulse"></span>
          <span className="text-[9px] font-black text-white uppercase tracking-widest">{club.members.length} Chronicles</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-2">
        <h3 className="text-shonen-bold text-3xl mb-4 tracking-tighter uppercase leading-none line-clamp-1 group-hover:text-red-500 transition-colors">
          {club.name}
        </h3>
        <p className="text-gray-500 text-sm italic font-medium line-clamp-2 mb-8 flex-1">
          {club.description || "MANIFESTO PENDING ARCHIVAL..."}
        </p>

        <div className="flex items-center justify-between border-t border-[var(--saga-border)] pt-8">
          <Link to={`/clubs/${club._id}`} className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--saga-text-dim)] hover:text-red-600 transition-colors">
            Visit Society →
          </Link>

          {user && !isMember && (
            <SagaButton size="sm" onClick={() => handleJoin(club._id)}>Forge Bond</SagaButton>
          ) || isMember && (
            <button
              onClick={() => handleLeave(club._id)}
              className="text-[9px] font-black text-red-600 uppercase tracking-widest bg-red-600/5 px-4 py-2 rounded-xl border border-red-600/30 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
            >
              Bonded
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
