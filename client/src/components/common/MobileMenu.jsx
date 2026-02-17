import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomSheet from './BottomSheet';
import {
    LayoutDashboard,
    Trophy,
    Users,
    BarChart2,
    Calendar,
    Settings,
    Shield,
    Cpu,
    Activity,
    Lock,
    Orbit
} from 'lucide-react';

export default function MobileMenu({ isOpen, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Generate random hexadecimal stream for the background HUD
    const backgroundStream = useMemo(() => {
        return Array.from({ length: 40 }).map(() =>
            Math.random().toString(16).substring(2, 10).toUpperCase()
        ).join(' ');
    }, []);

    const menuItems = [
        {
            icon: <LayoutDashboard className="w-6 h-6" />,
            label: "Tactical HQ",
            sub: "CORE_ACCESS",
            path: "/dashboard",
            color: "text-blue-500",
            size: "full"
        },
        {
            icon: <Calendar className="w-5 h-5" />,
            label: "Temporal",
            sub: "SYNC_02",
            path: "/schedule",
            color: "text-red-500",
            size: "brick"
        },
        {
            icon: <Trophy className="w-5 h-5" />,
            label: "League",
            sub: "SPIRIT_03",
            path: "/leaderboard",
            color: "text-amber-500",
            size: "brick"
        },
        {
            icon: <Users className="w-5 h-5" />,
            label: "Alliances",
            sub: "HIVE_04",
            path: "/clubs",
            color: "text-purple-500",
            size: "split"
        },
        {
            icon: <BarChart2 className="w-5 h-5" />,
            label: "Metrics",
            sub: "ANALYTICS_05",
            path: "/analytics",
            color: "text-emerald-500",
            size: "split"
        },
        {
            icon: <Settings className="w-5 h-5" />,
            label: "Settings",
            sub: "CONFIG_06",
            path: "/settings",
            color: "text-gray-400",
            size: "split-third"
        },
        {
            icon: <Orbit className="w-5 h-5" />,
            label: "Nexus",
            sub: "NODE_07",
            path: "/about",
            color: "text-white",
            size: "split-third"
        },
        {
            icon: <Shield className="w-5 h-5" />,
            label: "Help",
            sub: "HELP_08",
            path: "/help",
            color: "text-red-300",
            size: "split-third"
        },
    ];

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="NEXUS COMMAND">
            <div className="relative flex flex-col gap-6 pb-24 font-mono select-none">

                {/* LIVE BACKGROUND DATA STREAM */}
                <div className="absolute top-0 right-0 w-32 h-full overflow-hidden pointer-events-none opacity-[0.03] z-0">
                    <div className="text-[10px] break-all leading-relaxed animate-[scrollStream_60s_linear_infinite] whitespace-pre-wrap px-2">
                        {backgroundStream} {backgroundStream}
                    </div>
                </div>

                {/* HEADER SYSTEM BAR */}
                <div className="relative z-10 flex flex-col gap-2 p-4 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] overflow-hidden group/header">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent translate-x-[-100%] group-hover/header:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-red-600 animate-pulse" />
                            <span className="text-[10px] font-black text-white/90 tracking-[0.2em] mb-0.5">SAGA_NEXUS // ACTIVE</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-red-600/10 text-red-500 text-[8px] font-black">
                            LVL_MAX
                        </div>
                    </div>
                    <div className="flex gap-4 opacity-40">
                        <span className="text-[7px] font-bold tracking-widest text-gray-500">LATENCY: 14MS</span>
                        <span className="text-[7px] font-bold tracking-widest text-gray-500">SEC: AES_256</span>
                    </div>
                </div>

                {/* HOLOGRAPHIC HIVE GRID */}
                <div className="grid grid-cols-12 gap-3 relative z-10 [perspective:1000px]">
                    {menuItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        const spans = {
                            'full': 'col-span-12',
                            'brick': 'col-span-6',
                            'split': 'col-span-6',
                            'split-third': 'col-span-4'
                        };

                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavigate(item.path)}
                                style={{
                                    animationDelay: `${index * 60 + 200}ms`,
                                }}
                                className={`
                                    relative group/brick flex flex-col p-5 rounded-[1.8rem] border transition-all duration-700 active:scale-[0.97]
                                    animate-[fanIn_0.8s_cubic-bezier(0.34,1.56,0.64,1)_both]
                                    ${spans[item.size]}
                                    ${isActive
                                        ? 'bg-red-600/20 border-red-600/40 shadow-[0_0_40px_rgba(220,38,38,0.25)] scale-[1.02] z-20 backdrop-blur-3xl'
                                        : 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.08] hover:border-white/[0.2] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]'
                                    }
                                `}
                            >
                                {/* Holographic Reflections */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] to-transparent opacity-0 group-hover/brick:opacity-100 transition-opacity rounded-[1.8rem]"></div>
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className={`
                                        p-2.5 rounded-[1.2rem] bg-black/50 border border-white/[0.08] shadow-2xl transition-all duration-500
                                        group-hover/brick:scale-110 group-hover/brick:rotate-[5deg]
                                        ${isActive ? 'text-red-500 border-red-900/50 shadow-red-900/20' : item.color}
                                    `}>
                                        {item.icon}
                                    </div>
                                    <div className="flex flex-col items-end opacity-40">
                                        <span className="text-[6px] font-black text-white leading-none">ID:{(index + 1).toString().padStart(2, '0')}</span>
                                        <div className="w-1 h-1 bg-white/[0.2] rounded-full mt-1"></div>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <span className={`block text-[11px] font-black uppercase tracking-[0.2em] mb-1 transition-all ${isActive ? 'text-white' : 'text-gray-400 group-hover/brick:text-white group-hover/brick:tracking-[0.25em]'}`}>
                                        {item.label}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-[2px] transition-all duration-700 rounded-full ${isActive ? 'w-full bg-red-600' : 'w-4 bg-white/10 group-hover/brick:w-12 group-hover/brick:bg-white/30'}`}></div>
                                        <span className="text-[6px] font-black text-gray-500 group-hover/brick:text-white/40">{item.sub}</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* SYSTEM DIAGNOSTICS FOOTER */}
                <div className="relative z-10 flex flex-col gap-3 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 fill-mode-backwards">
                    <button
                        onClick={() => handleNavigate('/help')}
                        className="w-full p-4 bg-white/[0.02] border border-white/[0.05] rounded-3xl flex items-center justify-between group/foot transition-all hover:bg-white/[0.04] active:scale-95"
                    >
                        <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-gray-600 group-hover/foot:text-red-500 transition-colors" />
                            <div className="flex flex-col text-left">
                                <span className="text-[6px] font-black text-gray-600 uppercase tracking-widest">PROTOCOL_09</span>
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">SYSTEM_HELP_RESOURCES</span>
                            </div>
                        </div>
                        <span className="text-[8px] font-black text-gray-600 group-hover/foot:text-red-500 opacity-40 group-hover:opacity-100 transition-all">ACCESS →</span>
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scrollStream {
                    from { transform: translateY(0); }
                    to { transform: translateY(-50%); }
                }
                @keyframes fanIn {
                    0% { 
                        opacity: 0; 
                        transform: translateY(40px) rotateX(-20deg) scale(0.9);
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateY(0) rotateX(0deg) scale(1);
                    }
                }
            `}} />
        </BottomSheet>
    );
}
