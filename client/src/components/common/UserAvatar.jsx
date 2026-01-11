import { useState } from "react";

export default function UserAvatar({ src, username, className, size = "sm" }) {
    const [error, setError] = useState(false);

    const initials = username?.charAt(0).toUpperCase() || "?";

    return (
        <div className={`relative overflow-hidden shrink-0 flex items-center justify-center transition-all duration-500 bg-saga-surface-hover ${className}`}>
            {!error && src && (src.includes('/') || src.startsWith('http') || src.startsWith('data:')) ? (
                <img
                    src={src}
                    className="w-full h-full object-cover transition-all duration-700 hover:scale-110"
                    alt={username}
                    onError={() => setError(true)}
                />
            ) : (
                <div className={`font-black text-saga-text-dim group-hover:text-red-500 transition-colors select-none ${size === "lg" ? "text-4xl" : size === "md" ? "text-xl" : "text-[10px]"}`}>
                    {initials}
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>
    );
}
