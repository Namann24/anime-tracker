import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getClubDiscussions, createDiscussion, getClubDetails, likeDiscussion, addComment, voteInPoll, leaveClub } from "../services/clubService";
import { useAuth } from "../context/AuthContext";
import SagaButton from "../components/common/SagaButton";
import SagaInput from "../components/common/SagaInput";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";

export default function ClubDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const { confirm } = useConfirm();
    const { showToast } = useToast();

    const [club, setClub] = useState(null);
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showPollForm, setShowPollForm] = useState(false);
    const [newTopic, setNewTopic] = useState({
        title: "",
        content: "",
        pollQuestion: "",
        pollOptions: ["", ""]
    });

    const [expandedId, setExpandedId] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [commentSubmitting, setCommentSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const clubRes = await getClubDetails(id);
            setClub(clubRes.data);
            const discussRes = await getClubDiscussions(id);
            setDiscussions(discussRes.data);
        } catch (err) {
            console.error("Failed to load club data:", err);
            setErrorMsg(err.response?.status === 404 ? "Society ID not found." : `Failed to load realm: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const pollData = showPollForm ? {
                question: newTopic.pollQuestion,
                options: newTopic.pollOptions.filter(opt => opt.trim() !== "")
            } : null;

            await createDiscussion(id, {
                title: newTopic.title,
                content: newTopic.content,
                poll: pollData
            });

            setShowModal(false);
            setShowPollForm(false);
            setNewTopic({ title: "", content: "", pollQuestion: "", pollOptions: ["", ""] });
            loadData();
            showToast("Topic Inscribed in Archives", "success");
        } catch (err) {
            console.error("Failed to post discussion", err);
            showToast("Failed to post discussion", "error");
        }
    };

    const handleVote = async (discussionId, optionIndex) => {
        if (!user) return;
        try {
            const res = await voteInPoll(id, discussionId, optionIndex);
            setDiscussions(prev => prev.map(d => d._id === discussionId ? { ...d, poll: res.data } : d));
        } catch (err) {
            console.error("Vote failed", err);
        }
    };

    const handleLike = async (e, discussionId) => {
        e.stopPropagation();
        if (!user) return;
        const previousDiscussions = [...discussions];
        setDiscussions(prev => prev.map(d => {
            if (d._id === discussionId) {
                const userId = user._id || user.id;
                const isLiked = d.likes.includes(userId);
                let newLikes = isLiked ? d.likes.filter(id => id !== userId) : [...d.likes, userId];
                return { ...d, likes: newLikes };
            }
            return d;
        }));
        try {
            await likeDiscussion(id, discussionId);
        } catch (err) {
            console.error("Like failed", err);
            setDiscussions(previousDiscussions);
        }
    };

    const toggleExpand = (discussionId) => {
        setExpandedId(expandedId === discussionId ? null : discussionId);
        setNewComment("");
    };

    const handleCommentSubmit = async (e, discussionId) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setCommentSubmitting(true);
        try {
            const res = await addComment(id, discussionId, newComment);
            setDiscussions(prev => prev.map(d => d._id === discussionId ? { ...d, comments: res.data } : d));
            setNewComment("");
        } catch (error) {
            console.error("Comment failed:", error);
        } finally {
            setCommentSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Syncing with Realm...</span>
            </div>
        </div>
    );

    if (!club) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-12 text-center text-red-600">
            <p className="text-shonen-bold text-6xl mb-4 tracking-tighter uppercase">⚠️ Breach Error</p>
            <p className="text-[10px] font-black uppercase tracking-widest bg-red-600/10 px-6 py-3 rounded-full border border-red-600/30">{errorMsg || "Society lost in time."}</p>
            <Link to="/clubs" className="mt-8 text-[10px] font-black uppercase tracking-[0.6em] text-gray-500 hover:text-red-600 transition-colors">← Retreat to Archive</Link>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 md:pt-32 pb-24 px-6 md:px-12 transition-colors duration-500 saga-animate-in">
            <div className="max-w-[1200px] mx-auto">

                {/* HERO HEADER */}
                <div className="relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden mb-12 md:mb-16 border border-[var(--saga-border)] bg-[var(--saga-surface)]">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-red-600/5 blur-[80px] md:blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative p-6 md:p-16 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-700"></div>
                            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-2 border-red-600/30 shadow-[0_0_50px_rgba(255,0,60,0.1)] relative">
                                {club.image ? <img src={club.image} className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-6xl bg-black/5 uppercase font-black text-red-600">⛩️</div>}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Active Society</span>
                            </div>
                            <h1 className="text-shonen-bold text-5xl md:text-8xl mb-4 tracking-tighter leading-none uppercase">{club.name}</h1>
                            <p className="text-[var(--saga-text-dim)] font-medium italic opacity-60 text-lg md:text-xl max-w-2xl leading-relaxed">"{club.description}"</p>

                            <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                                <span className="bg-red-600/5 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-600/20">
                                    <span className="text-red-600">{club.members?.length || 0}</span> Chronicles Bonded
                                </span>
                                <span className="bg-white/5 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                                    <span className="text-red-600">{discussions.length}</span> Active Topics
                                </span>
                            </div>
                        </div>

                        <div className="md:ml-auto flex flex-col gap-4 items-center md:items-end w-full md:w-auto">
                            <SagaButton variant="primary" size="lg" full onClick={() => setShowModal(true)}>
                                + Initiate Topic
                            </SagaButton>

                            {user && club.members?.some(m => (m._id || m).toString() === (user._id || user.id).toString()) && (
                                <button
                                    onClick={async () => {
                                        const isConfirmed = await confirm("ARE YOU PREPARED TO ABANDON THIS SOCIETY?", "SOCIETY BREACH");
                                        if (isConfirmed) {
                                            try {
                                                await leaveClub(id);
                                                loadData();
                                                showToast("Bond Severed Successfully", "success");
                                            } catch (err) {
                                                console.error("Leave failed", err);
                                                showToast("Failed to leave society", "error");
                                            }
                                        }
                                    }}
                                    className="text-[9px] font-black text-white/40 hover:text-red-600 uppercase tracking-[0.4em] transition-colors"
                                >
                                    Leave Society ⚰️
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* DISCUSSIONS LIST */}
                <div className="space-y-8">
                    {discussions.length === 0 ? (
                        <div className="text-center py-32 border-2 border-dashed border-[var(--saga-border)] rounded-[3rem]">
                            <div className="text-6xl opacity-10 mb-6">📜</div>
                            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">The archives are silent. Be the first to speak.</p>
                        </div>
                    ) : (
                        discussions.map(topic => {
                            const userId = user?._id || user?.id;
                            const isLiked = userId && topic.likes.includes(userId);
                            const isExpanded = expandedId === topic._id;

                            return (
                                <div
                                    key={topic._id}
                                    className={`saga-glass rounded-[2rem] md:rounded-[2.5rem] transition-all duration-500 overflow-hidden ${isExpanded ? "ring-2 ring-red-600/30 -translate-y-2 shadow-[0_20px_60px_rgba(255,0,60,0.1)]" : "hover:border-red-600/30"}`}
                                >
                                    {/* CARD HEADER */}
                                    <div className="p-6 md:p-10 cursor-pointer group" onClick={() => toggleExpand(topic._id)}>
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                    <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Topic Archival No. {topic._id.slice(-4)}</span>
                                                </div>
                                                <h3 className="text-shonen-bold text-3xl md:text-4xl mb-4 tracking-tighter uppercase leading-none group-hover:text-red-500 transition-colors">
                                                    {topic.title}
                                                </h3>
                                                <p className="text-[var(--saga-text-dim)] font-medium italic opacity-60 leading-relaxed mb-6 md:mb-8 max-w-4xl text-sm md:text-base">
                                                    {topic.content}
                                                </p>

                                                {/* POLL SECTION */}
                                                {topic.poll && topic.poll.options?.length > 0 && (
                                                    <div className="mb-6 md:mb-8 p-4 md:p-8 bg-black/5 rounded-[1.5rem] md:rounded-[2rem] border border-[var(--saga-border)]">
                                                        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-6 md:mb-8 flex items-center gap-4">
                                                            <span className="w-2 h-2 rounded-full bg-red-600 shadow-pulse"></span>
                                                            {topic.poll.question || "Society Power Meter"}
                                                        </h4>
                                                        <div className="space-y-4">
                                                            {topic.poll.options.map((opt, idx) => {
                                                                const totalVotes = topic.poll.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0);
                                                                const voteCount = opt.votes?.length || 0;
                                                                const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                                                                const hasVoted = userId && opt.votes?.some(id => id.toString() === userId.toString());

                                                                return (
                                                                    <div
                                                                        key={idx}
                                                                        className={`relative cursor-pointer group/opt`}
                                                                        onClick={(e) => { e.stopPropagation(); handleVote(topic._id, idx); }}
                                                                    >
                                                                        <div className="h-10 md:h-12 w-full bg-black/20 rounded-2xl overflow-hidden border border-[var(--saga-border)] relative">
                                                                            <div
                                                                                className={`h-full transition-all duration-1000 ease-out ${hasVoted ? 'bg-red-600/30' : 'bg-white/5'}`}
                                                                                style={{ width: `${percentage}%` }}
                                                                            ></div>
                                                                            <div className="absolute inset-0 px-4 md:px-6 flex items-center justify-between">
                                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                                    {hasVoted && <span className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_10px_rgba(255,0,60,0.8)]"></span>}
                                                                                    <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest truncate ${hasVoted ? 'text-red-600' : 'text-gray-400'}`}>
                                                                                        {opt.text}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center gap-4">
                                                                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter hidden md:inline">{voteCount} Bonds</span>
                                                                                    <span className="text-xs font-black text-red-600">{percentage}%</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="mt-4 md:mt-6 flex justify-between items-center opacity-40">
                                                            <span className="text-[9px] font-black uppercase tracking-widest">{totalVotes} Total Intersections</span>
                                                            <span className="text-[9px] font-black uppercase tracking-widest italic">Inscribe your choice</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex-wrap">
                                                    <Link to={`/profile/${topic.author?.username}`} className="text-red-600 hover:opacity-70 transition-opacity">@{topic.author?.username}</Link>
                                                    <span className="opacity-20">•</span>
                                                    <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                                                    {topic.comments.length > 0 && (
                                                        <>
                                                            <span className="opacity-20">•</span>
                                                            <span className="text-white bg-white/5 px-3 py-1 rounded-full border border-white/10">{topic.comments.length} ECHOES</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => handleLike(e, topic._id)}
                                                className={`flex flex-col items-center gap-2 p-3 md:p-4 rounded-3xl min-w-[70px] md:min-w-[80px] transition-all duration-300 border-2 ${isLiked
                                                    ? "bg-red-600/10 border-red-600/30 text-red-600 scale-105"
                                                    : "bg-black/5 border-transparent text-gray-500 hover:bg-black/20 hover:text-white"
                                                    }`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isLiked ? "0" : "3"} className="w-6 h-6 md:w-8 md:h-8">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.247-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                                                </svg>
                                                <span className="font-black text-xs md:text-sm tracking-widest">{topic.likes.length}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* COMMENTS SECTION */}
                                    {isExpanded && (
                                        <div className="bg-black/10 border-t border-[var(--saga-border)] p-6 md:p-10 animate-in slide-in-from-top-4 duration-500">
                                            <div className="flex items-center gap-4 mb-8 md:mb-10">
                                                <span className="w-8 h-[2px] bg-red-600"></span>
                                                <h4 className="text-shonen-bold text-xl md:text-2xl uppercase tracking-tighter">Archival Echoes ({topic.comments.length})</h4>
                                            </div>

                                            <div className="space-y-6 mb-8 md:mb-12">
                                                {topic.comments.length === 0 ? (
                                                    <div className="text-center py-12 opacity-40">
                                                        <p className="text-xs font-black uppercase tracking-[0.4em]">Society input pending...</p>
                                                    </div>
                                                ) : (
                                                    topic.comments.map((comment, idx) => (
                                                        <div key={idx} className="flex gap-4 md:gap-6 group/comment">
                                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-red-600 to-black text-white flex items-center justify-center font-black text-xs md:text-sm shadow-xl flex-shrink-0 border border-white/10 uppercase italic">
                                                                {comment.author?.username?.[0] || "?"}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="bg-white/5 p-4 md:p-6 rounded-[2rem] rounded-tl-none border border-white/5 group-hover/comment:border-white/10 transition-colors">
                                                                    <div className="flex justify-between items-center mb-3">
                                                                        <Link to={`/profile/${comment.author?.username}`} className="font-black text-[10px] uppercase tracking-widest text-red-600 hover:opacity-70 transition-opacity">
                                                                            @{comment.author?.username || "GHOST"}
                                                                        </Link>
                                                                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[var(--saga-text-dim)] text-sm font-medium italic leading-relaxed">
                                                                        "{comment.content}"
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {user && (
                                                <form onSubmit={(e) => handleCommentSubmit(e, topic._id)} className="flex gap-4 items-center pl-0 md:pl-16">
                                                    <div className="flex-1 relative">
                                                        <input
                                                            id={`reply-${topic._id}`}
                                                            type="text"
                                                            placeholder="Echo your thoughts into the archive..."
                                                            className="w-full bg-black/20 border border-[var(--saga-border)] rounded-full px-6 py-3 md:px-8 md:py-4 outline-none focus:border-red-600/50 text-sm font-medium transition-all text-white placeholder:text-gray-600 italic"
                                                            value={newComment}
                                                            onChange={(e) => setNewComment(e.target.value)}
                                                        />
                                                    </div>
                                                    <SagaButton
                                                        variant="primary"
                                                        size="sm"
                                                        type="submit"
                                                        disabled={commentSubmitting || !newComment.trim()}
                                                    >
                                                        Archive Echo
                                                    </SagaButton>
                                                </form>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* CREATE MODAL */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 sm:p-12 animate-in fade-in zoom-in duration-300">
                        <div className="bg-[var(--saga-surface)] border border-[var(--saga-border)] rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-16 w-full max-w-3xl relative overflow-hidden shadow-[0_0_100px_rgba(255,0,60,0.1)] custom-scrollbar max-h-[90vh] overflow-y-auto">

                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 md:top-8 md:right-8 text-gray-500 hover:text-white transition-colors" title="Seal Manifest">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            <div className="mb-8 md:mb-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Oracle of Discussion</span>
                                </div>
                                <h2 className="text-shonen-bold text-4xl md:text-6xl tracking-tighter uppercase leading-none">Initiate <span className="text-red-600">Manifesto</span></h2>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6 md:space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Topic Inscription</label>
                                    <SagaInput
                                        placeholder="e.g. Which timeline remains undisputed?"
                                        value={newTopic.title}
                                        onChange={e => setNewTopic({ ...newTopic, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Archive Content</label>
                                    <textarea
                                        className="w-full p-6 bg-black/5 border border-[var(--saga-border)] rounded-[2rem] text-[var(--saga-text)] outline-none focus:border-red-600/50 transition-all min-h-[150px] text-sm italic resize-none"
                                        placeholder="Cast your theories into the archive..."
                                        value={newTopic.content}
                                        onChange={e => setNewTopic({ ...newTopic, content: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* POLL TOGGLE */}
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPollForm(!showPollForm)}
                                        className={`flex items-center gap-4 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${showPollForm
                                            ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                                            : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                                    >
                                        <span>{showPollForm ? "✓ Power Meter Integrated" : "+ Integrate Power Meter (Poll)"}</span>
                                    </button>
                                </div>

                                {/* POLL FORM */}
                                {showPollForm && (
                                    <div className="space-y-6 p-6 md:p-10 bg-red-600/5 border border-red-600/20 rounded-[2rem] md:rounded-[2.5rem] animate-in slide-in-from-top-4 duration-500">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] ml-1">Meter Inquiry</label>
                                            <SagaInput
                                                placeholder="What is the central question?"
                                                value={newTopic.pollQuestion}
                                                onChange={e => setNewTopic({ ...newTopic, pollQuestion: e.target.value })}
                                                required={showPollForm}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] ml-2">Potential Verdicts (Max 5)</label>
                                            {newTopic.pollOptions.map((opt, idx) => (
                                                <input
                                                    key={idx}
                                                    className="w-full p-4 bg-white/5 border border-red-600/10 rounded-2xl outline-none focus:border-red-600 transition-all text-sm italic text-white placeholder:text-gray-700"
                                                    placeholder={`Verdict ${idx + 1}`}
                                                    value={opt}
                                                    onChange={e => {
                                                        const newOpts = [...newTopic.pollOptions];
                                                        newOpts[idx] = e.target.value;
                                                        setNewTopic({ ...newTopic, pollOptions: newOpts });
                                                    }}
                                                    required={showPollForm && idx < 2}
                                                />
                                            ))}
                                            {newTopic.pollOptions.length < 5 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setNewTopic({ ...newTopic, pollOptions: [...newTopic.pollOptions, ""] })}
                                                    className="text-[9px] font-black text-red-600 hover:text-white transition-colors uppercase tracking-[0.4em] mt-2 block"
                                                >
                                                    + Add Potential Verdict
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4 md:pt-8 border-t border-[var(--saga-border)]">
                                    <SagaButton variant="ghost" full onClick={() => setShowModal(false)} type="button">Seal</SagaButton>
                                    <SagaButton variant="primary" full type="submit">Post to Archive</SagaButton>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
// Trigger HMR
