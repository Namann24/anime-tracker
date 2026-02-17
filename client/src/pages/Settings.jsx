import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import SagaButton from '../components/common/SagaButton';
import {
    Moon, Sun, Shield, ShieldAlert, LogOut, User, ChevronRight, Settings as SettingsIcon,
    Bell, Mail, BellRing, Lock, Key, Smartphone, Database, Trash2, Download, Info, FileText, Globe
} from 'lucide-react';

export default function Settings() {
    const { theme, toggleTheme } = useTheme();
    const { showNSFW, setShowNSFW, watchlist } = useWatchlist();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Local State for "Premium" Features (Mock/LocalStorage)
    const [notifications, setNotifications] = useState({
        push: true,
        email: false,
        episodes: true
    });

    const [privacy, setPrivacy] = useState({
        privateProfile: false,
        twoFactor: false,
        activityStatus: true
    });

    const [dataPrefs, setDataPrefs] = useState({
        quality: '1080p',
        autoplay: true
    });

    // Load prefs on mount
    useEffect(() => {
        const loadPref = (key, setter) => {
            const saved = localStorage.getItem(`saga_pref_${key}`);
            if (saved) setter(JSON.parse(saved));
        };
        loadPref('notifications', setNotifications);
        loadPref('privacy', setPrivacy);
        loadPref('data', setDataPrefs);
    }, []);

    // Save helpers
    const updatePref = (key, val, setter, state) => {
        const newState = { ...state, ...val };
        setter(newState);
        localStorage.setItem(`saga_pref_${key}`, JSON.stringify(newState));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleClearCache = () => {
        if (window.confirm("Purge local system cache? This will reset local preferences.")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleExportData = () => {
        const dataStr = JSON.stringify({ user, watchlist, preferences: { notifications, privacy, dataPrefs } }, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `saga_protocol_export_${user?.username || 'user'}_${Date.now()}.json`;
        link.href = url;
        link.click();
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 max-w-2xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-saga-surface border border-saga-border flex items-center justify-center shadow-lg shadow-black/50">
                    <SettingsIcon className="w-6 h-6 text-saga-text animate-spin-reverse-slow" />
                </div>
                <div>
                    <h1 className="text-3xl font-shonen text-saga-text uppercase tracking-wide">System Config</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-saga-text-dim text-xs font-black uppercase tracking-widest">Protocol v2.4.0 Active</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* INTERFACE */}
                <SectionHeader title="Interface Protocols" />
                <SettingsGroup>
                    <ToggleTile
                        icon={theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        color={theme === 'dark' ? 'indigo' : 'amber'}
                        label="Appearance Mode"
                        sublabel={theme === 'dark' ? 'Dark Protocol Active' : 'Light Protocol Active'}
                        active={theme === 'dark'}
                        onToggle={toggleTheme}
                    />
                </SettingsGroup>

                {/* NOTIFICATIONS */}
                <SectionHeader title="Communication Uplinks" />
                <SettingsGroup>
                    <ToggleTile
                        icon={<Bell className="w-5 h-5" />}
                        color="blue"
                        label="Mission Push Alerts"
                        sublabel="Direct system notifications"
                        active={notifications.push}
                        onToggle={() => updatePref('notifications', { push: !notifications.push }, setNotifications, notifications)}
                    />
                    <ToggleTile
                        icon={<Mail className="w-5 h-5" />}
                        color="purple"
                        label="Intel Drops (Email)"
                        sublabel="Weekly summary reports"
                        active={notifications.email}
                        onToggle={() => updatePref('notifications', { email: !notifications.email }, setNotifications, notifications)}
                    />
                    <ToggleTile
                        icon={<BellRing className="w-5 h-5" />}
                        color="red"
                        label="New Episode Radar"
                        sublabel="Tracked anime updates"
                        active={notifications.episodes}
                        onToggle={() => updatePref('notifications', { episodes: !notifications.episodes }, setNotifications, notifications)}
                    />
                </SettingsGroup>

                {/* CONTENT & PRIVACY */}
                <SectionHeader title="Security & Content" />
                <SettingsGroup>
                    <ToggleTile
                        icon={showNSFW ? <ShieldAlert className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                        color={showNSFW ? 'red' : 'emerald'}
                        label="NSFW Filters"
                        sublabel={showNSFW ? 'Unrestricted Access' : 'Safety Protocols On'}
                        active={showNSFW}
                        onToggle={() => setShowNSFW(!showNSFW)}
                    />
                    <ToggleTile
                        icon={<Lock className="w-5 h-5" />}
                        color="zinc"
                        label="Stealth Mode"
                        sublabel="Private Profile Visibility"
                        active={privacy.privateProfile}
                        onToggle={() => updatePref('privacy', { privateProfile: !privacy.privateProfile }, setPrivacy, privacy)}
                    />
                    <ToggleTile
                        icon={<Key className="w-5 h-5" />}
                        color="orange"
                        label="2-Factor Auth"
                        sublabel="Mock Verification Layer"
                        active={privacy.twoFactor}
                        onToggle={() => updatePref('privacy', { twoFactor: !privacy.twoFactor }, setPrivacy, privacy)}
                    />

                    <button className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors text-left border-t border-white/5 first:border-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                                <Smartphone className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-saga-text">Active Sessions</h3>
                                <p className="text-[10px] text-saga-text-dim">iPhone 13 Pro (Current)</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-saga-text-dim" />
                    </button>
                </SettingsGroup>

                {/* STORAGE & DATA */}
                <SectionHeader title="Database Management" />
                <SettingsGroup>
                    <div className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                                <Database className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-saga-text">Stream Quality</h3>
                                <p className="text-[10px] text-saga-text-dim"> Preferred bitrate</p>
                            </div>
                        </div>
                        <select
                            value={dataPrefs.quality}
                            onChange={(e) => updatePref('data', { quality: e.target.value }, setDataPrefs, dataPrefs)}
                            className="bg-black/40 border border-white/10 rounded-lg text-[10px] font-bold text-saga-text px-2 py-1 outline-none focus:border-saga-accent"
                        >
                            <option value="4k">4K UHD</option>
                            <option value="1080p">1080p source</option>
                            <option value="720p">720p mobile</option>
                        </select>
                    </div>

                    <button
                        onClick={handleExportData}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                                <Download className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-saga-text">Export Mission Data</h3>
                                <p className="text-[10px] text-saga-text-dim">Download JSON archive</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-saga-text-dim" />
                    </button>

                    <button
                        onClick={handleClearCache}
                        className="w-full flex items-center justify-between p-3 hover:bg-red-500/10 group transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors flex items-center justify-center">
                                <Trash2 className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-saga-text group-hover:text-red-500 transition-colors">Purge Cache</h3>
                                <p className="text-[10px] text-saga-text-dim">Clear local artifacts</p>
                            </div>
                        </div>
                    </button>
                </SettingsGroup>

                {/* ACCOUNT */}
                <SectionHeader title="Operator Controls" />
                <SettingsGroup>
                    <button
                        onClick={() => navigate(`/profile/${user?.username}`)}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-saga-text">Identity Config</h3>
                                <p className="text-[10px] text-saga-text-dim">Edit public details</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-saga-text-dim" />
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-3 hover:bg-red-500/10 group transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-saga-text-dim/10 text-saga-text-dim group-hover:bg-red-500 group-hover:text-white transition-colors flex items-center justify-center">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-saga-text group-hover:text-red-500 transition-colors">Sever Connection</h3>
                                <p className="text-[10px] text-saga-text-dim">End secure session</p>
                            </div>
                        </div>
                    </button>
                </SettingsGroup>

                {/* ABOUT */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <a href="#" className="p-4 rounded-xl bg-saga-surface border border-saga-border flex flex-col items-center justify-center gap-2 hover:border-saga-accent transition-colors">
                        <FileText className="w-6 h-6 text-saga-text-dim" />
                        <span className="text-[10px] font-black uppercase text-saga-text-dim tracking-widest">Terms</span>
                    </a>
                    <a href="#" className="p-4 rounded-xl bg-saga-surface border border-saga-border flex flex-col items-center justify-center gap-2 hover:border-saga-accent transition-colors">
                        <Globe className="w-6 h-6 text-saga-text-dim" />
                        <span className="text-[10px] font-black uppercase text-saga-text-dim tracking-widest">Privacy</span>
                    </a>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 mb-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-saga-text-dim opacity-40">
                        Saga Archive v2.4.0 <br />
                        <span className="font-normal normal-case opacity-50">Designed by Antigravity System</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function SectionHeader({ title }) {
    return (
        <div className="px-4 py-2 mt-4 mb-2 flex items-center gap-3">
            <div className="h-[1px] w-4 bg-saga-accent/50"></div>
            <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-saga-text-dim">{title}</h2>
        </div>
    );
}

function SettingsGroup({ children }) {
    return (
        <section className="bg-saga-surface border border-saga-border rounded-3xl overflow-hidden divide-y divide-white/5">
            {children}
        </section>
    );
}

function ToggleTile({ icon, color, label, sublabel, active, onToggle }) {
    const colorClasses = {
        indigo: 'bg-indigo-500/10 text-indigo-400',
        amber: 'bg-amber-500/10 text-amber-500',
        blue: 'bg-blue-500/10 text-blue-500',
        purple: 'bg-purple-500/10 text-purple-500',
        red: 'bg-red-500/10 text-red-500',
        emerald: 'bg-emerald-500/10 text-emerald-500',
        zinc: 'bg-zinc-500/10 text-zinc-400',
        orange: 'bg-orange-500/10 text-orange-500',
    };

    return (
        <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-none transition-colors">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${colorClasses[color] || 'bg-gray-500/10 text-gray-500'}`}>
                    {React.cloneElement(icon, { className: "w-4 h-4" })}
                </div>
                <div>
                    <h3 className="text-xs font-bold text-saga-text">{label}</h3>
                    <p className="text-[10px] text-saga-text-dim">{sublabel}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${active ? 'bg-saga-accent' : 'bg-saga-text-dim/20'}`}
            >
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </button>
        </div>
    );
}
