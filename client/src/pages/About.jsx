import { Link } from "react-router-dom";
import SagaLogo from "../components/common/SagaLogo";
import SagaButton from "../components/common/SagaButton";

export default function About() {
    return (
        <div className="min-h-screen text-[var(--saga-text)] pt-32 pb-24 overflow-hidden relative transition-colors saga-animate-in">
            {/* Background Halftone */}
            <div className="absolute inset-0 halftone opacity-[0.03] pointer-events-none"></div>
            <div className="absolute -top-48 -left-48 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                <header className="text-center mb-24 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
                    <div className="flex justify-center mb-10 scale-150">
                        <SagaLogo />
                    </div>
                    <div className="inline-block px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-8 shadow-pulse transform -rotate-2">
                        The Legend of the SAGA
                    </div>
                    <h1 className="text-shonen-bold text-6xl md:text-9xl mb-8 tracking-tighter uppercase leading-none text-[var(--saga-text)]">
                        The <span className="text-red-600">Chronicle</span>
                    </h1>
                    <p className="text-[var(--saga-text-dim)] max-w-2xl mx-auto italic font-medium text-xl leading-relaxed">
                        "In an endless stream of stories, one archive rose to preserve the epic journeys of every legend."
                    </p>
                </header>

                {/* Story Panels */}
                <div className="grid md:grid-cols-2 gap-12 mb-32">
                    {/* Chapter 1: The Origin */}
                    <div className="bg-[var(--saga-surface)] p-12 border border-[var(--saga-border)] rounded-[2.5rem] rotate-1 hover:rotate-0 transition-transform duration-1000 hover:shadow-2xl hover:border-red-600/20 group animate-in fade-in slide-in-from-left-8 delay-300 fill-mode-backwards">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-8 bg-red-600 rounded-full shadow-neon-red"></div>
                            <h2 className="text-shonen-bold text-4xl tracking-tighter uppercase text-[var(--saga-text)]">01: The Inception</h2>
                        </div>
                        <p className="text-[var(--saga-text-dim)] leading-relaxed mb-8 font-medium text-lg">
                            SAGA was born from a singular vision: to build a tracking experience that felt as epic as the stories it preserves. We are the scribes of your anime journey, dedicated to every frame, every theory, and every heart-pounding reveal.
                        </p>
                        <div className="h-48 bg-[var(--saga-surface-hover)] rounded-3xl overflow-hidden border border-[var(--saga-border)] flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                            <span className="text-9xl opacity-10 group-hover:opacity-40 transition-opacity filter drop-shadow-md">📜</span>
                        </div>
                    </div>

                    {/* Chapter 2: The Quest */}
                    <div className="bg-[var(--saga-surface)] p-12 border border-[var(--saga-border)] rounded-[2.5rem] -rotate-1 hover:rotate-0 transition-transform duration-1000 bg-gradient-to-br from-red-600/5 to-transparent hover:shadow-2xl hover:border-red-600/40 group animate-in fade-in slide-in-from-right-8 delay-500 fill-mode-backwards">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-8 bg-red-600 rounded-full shadow-neon-red"></div>
                            <h2 className="text-shonen-bold text-4xl tracking-tighter uppercase text-[var(--saga-text)]">02: The Mission</h2>
                        </div>
                        <p className="text-[var(--saga-text-dim)] leading-relaxed mb-8 font-medium text-lg">
                            Our mission is to provide the ultimate sanctuary for anime enthusiasts. We don't just log episodes; we immortalize your path through the vast universe of animation, providing the tools to forge your own legend.
                        </p>
                        <div className="h-48 bg-red-600/5 rounded-3xl overflow-hidden border border-red-600/20 flex items-center justify-center group-hover:bg-red-600/10 transition-colors">
                            <span className="text-9xl group-hover:scale-125 transition-transform duration-500 opacity-40 group-hover:opacity-100 text-red-600">⚔️</span>
                        </div>
                    </div>
                </div>

                {/* Expedition Section */}
                <div className="relative mb-32 group animate-in fade-in slide-in-from-bottom-12 delay-700 fill-mode-backwards">
                    <div className="absolute inset-0 speed-lines opacity-10 pointer-events-none"></div>
                    <div className="bg-[var(--saga-surface)] p-16 border border-[var(--saga-border)] rounded-[3rem] text-center relative z-10 overflow-hidden shadow-2xl transition-all duration-700 hover:border-red-600/30">
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-600/10 blur-[80px] rounded-full group-hover:bg-red-600/20 transition-colors"></div>
                        <h2 className="text-shonen-bold text-5xl md:text-7xl mb-10 tracking-tighter uppercase leading-none text-[var(--saga-text)]">Join the Expedition</h2>
                        <p className="text-[var(--saga-text-dim)] max-w-3xl mx-auto mb-14 text-xl italic font-medium">
                            The SAGA is not written by us, but by you. Every chronicle updated, every review etched, and every favorite shared builds the halls of our archive.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <SagaButton variant="primary" size="lg" onClick={() => window.location.href = '/register'}>
                                Forge Your Legacy
                            </SagaButton>
                            <SagaButton variant="outline" size="lg" onClick={() => window.location.href = '/help'}>
                                Seek the Scrolls
                            </SagaButton>
                        </div>
                    </div>
                </div>

                <footer className="text-center pb-12 border-t border-[var(--saga-border)] pt-12">
                    <p className="text-[10px] font-black uppercase tracking-[.8em] text-[var(--saga-text-dim)] mb-4">
                        Etched with Crimson and Ink
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[.4em] text-red-600/40">
                        SAGA ARCHIVE • ALL RIGHTS PRESERVED
                    </p>
                </footer>
            </div>
        </div>
    );
}
