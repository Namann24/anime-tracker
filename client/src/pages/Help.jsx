import { Link } from "react-router-dom";
import { useState } from "react";
import { submitFeedback } from "../services/feedbackService";
import SagaButton from "../components/common/SagaButton";
import SagaInput from "../components/common/SagaInput";
import SagaSelect from "../components/common/SagaSelect";
import { useToast } from "../context/ToastContext";

export default function Help() {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        type: "General Feedback",
        message: ""
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await submitFeedback(formData);
            showToast("Scroll received by the archive. Your insight is appreciated.", "success");
            setFormData({ name: "", email: "", type: "General Feedback", message: "" });
        } catch (err) {
            showToast("The record failed to transmit. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <div className="min-h-screen bg-[var(--saga-bg)] text-[var(--saga-text)] pb-24 overflow-x-hidden transition-colors">
            <div className="max-w-[1000px] mx-auto px-6 pt-24 md:pt-32">
                <header className="text-center mb-16 md:mb-24 relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent"></div>
                    <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Archive Guidance</span>
                    </div>
                    <h1 className="text-shonen-bold text-5xl md:text-8xl mb-4 md:mb-6 uppercase tracking-tighter leading-none">
                        Archive <span className="text-red-600">Scrolls</span>
                    </h1>
                    <p className="text-gray-500 italic max-w-xl mx-auto text-sm md:text-base">"Ancient wisdom for the modern chronicler. Everything you need to navigate the saga."</p>
                </header>

                <div className="space-y-12 md:space-y-16">
                    {/* GETTING STARTED */}
                    <section className="bg-[var(--saga-surface)] p-6 md:p-12 border border-[var(--saga-border)] rounded-[2rem] md:rounded-[2.5rem] relative group">
                        <div className="absolute -top-6 -left-6 w-12 h-12 bg-[var(--saga-surface)] border border-[var(--saga-border)] rounded-2xl flex items-center justify-center text-xl shadow-lg group-hover:border-red-600/50 transition-colors">🚀</div>
                        <h2 className="text-shonen-bold text-2xl md:text-3xl mb-6 md:mb-8 uppercase tracking-tighter">Path of the Initiate</h2>
                        <div className="space-y-6 text-gray-500 leading-relaxed font-medium text-sm md:text-base">
                            <p>SAGA is your high-impact dashboard for immortalizing your anime journey. Begin by exploring the <Link to="/search" className="text-red-600 font-bold hover:underline">Discovery Archive</Link> to find your next legend.</p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                                    <span>Cast <strong>+ Track Saga</strong> to begin your chronicle of any series.</span>
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                                    <span>Update your <Link to="/watchlist" className="text-red-600 font-bold hover:underline">Command Chronicles</Link> to log episode progress.</span>
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                                    <span>Reach 100% completion to ascend the saga to your finished archives.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* AURA SYSTEM */}
                    <section className="bg-[var(--saga-surface)] p-6 md:p-12 border border-[var(--saga-border)] rounded-[2rem] md:rounded-[2.5rem] relative group">
                        <div className="absolute -top-6 -right-6 w-12 h-12 bg-[var(--saga-surface)] border border-[var(--saga-border)] rounded-2xl flex items-center justify-center text-xl shadow-lg group-hover:border-red-600/50 transition-colors">✨</div>
                        <h2 className="text-shonen-bold text-2xl md:text-3xl mb-6 md:mb-8 uppercase tracking-tighter">The Aura System</h2>
                        <div className="space-y-6 text-gray-500 leading-relaxed font-medium text-sm md:text-base">
                            <p>Your <Link to="/profile" className="text-red-600 font-bold hover:underline">Aura Character Sheet</Link> represents your soul as a watcher. As you consume more sagas, your rank increases:</p>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                                <StatusCard label="Novice" value="< 100 EPS" />
                                <StatusCard label="Elite" value="100-500 EPS" />
                                <StatusCard label="Master" value="500-1000 EPS" />
                                <StatusCard label="Legend" value="1000+ EPS" highlighted />
                            </div>
                        </div>
                    </section>

                    {/* FEEDBACK FORM */}
                    <section className="bg-[var(--saga-surface)] p-6 md:p-12 border border-[var(--saga-border)] rounded-[2rem] md:rounded-[2.5rem] relative">
                        <div className="flex items-center gap-4 mb-8 md:mb-10">
                            <div className="w-1.5 h-8 bg-red-600 rounded-full shadow-impact"></div>
                            <h2 className="text-shonen-bold text-2xl md:text-3xl uppercase tracking-tighter">Etch a Message</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Chronicler Name</label>
                                    <SagaInput
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="!bg-black/5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Archive Identity</label>
                                    <SagaInput
                                        type="email"
                                        placeholder="Your Email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="!bg-black/5"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Scroll Type</label>
                                <SagaSelect
                                    value={formData.type}
                                    onChange={(val) => setFormData({ ...formData, type: val })}
                                    options={[
                                        { label: "Archive Malfunction (Bug)", value: "Problem / Bug" },
                                        { label: "New Vision (Feature Suggestion)", value: "Feature Suggestion" },
                                        { label: "General Insight", value: "General Feedback" }
                                    ]}
                                    className="!bg-black/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">The Message</label>
                                <textarea
                                    placeholder="Etch your thoughts here..."
                                    className="w-full p-4 md:p-6 bg-black/5 border border-[var(--saga-border)] rounded-[24px] text-[var(--saga-text)] outline-none focus:border-red-600/50 transition-all min-h-[140px] md:min-h-[160px] text-sm resize-none"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                />
                            </div>
                            <SagaButton
                                type="submit"
                                variant="primary"
                                full
                                disabled={submitting}
                                className="py-4 md:py-5"
                            >
                                {submitting ? "Transmitting..." : "Send Scroll to Archive"}
                            </SagaButton>
                        </form>
                    </section>

                    {/* FAQ */}
                    <section className="text-center py-8 md:py-12">
                        <div className="w-12 h-px bg-[var(--saga-border)] mx-auto mb-8 md:mb-10"></div>
                        <h2 className="text-shonen-bold text-3xl md:text-4xl mb-4 md:mb-6 uppercase tracking-tighter">Seek a Mentor?</h2>
                        <p className="text-gray-500 mb-8 md:mb-12 italic max-w-lg mx-auto text-sm md:text-base">"If the scrolls do not contain your answer, reach out through the feedback channels above."</p>
                        <SagaButton variant="ghost" onClick={() => window.location.href = '/'}>
                            Return to Sanctuary
                        </SagaButton>
                    </section>
                </div>
            </div>
        </div>
    );
}

function StatusCard({ label, value, highlighted = false }) {
    return (
        <div className={`p-4 border border-[var(--saga-border)] rounded-2xl text-center group transition-all duration-300 ${highlighted ? 'border-red-600/30 bg-red-600/5 shadow-impact' : 'bg-black/5 hover:border-red-600/20'}`}>
            <div className={`text-[10px] font-black uppercase mb-1 tracking-widest ${highlighted ? 'text-red-500' : 'text-gray-500'}`}>{label}</div>
            <div className="text-[var(--saga-text)] font-black text-xs">{value}</div>
        </div>
    );
}
