import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const PageTransition = ({ children }) => {
    const location = useLocation();
    const [displayLocation, setDisplayLocation] = useState(location);
    const [transitionStage, setTransitionStage] = useState('fadeIn');

    useEffect(() => {
        if (location.pathname !== displayLocation.pathname) {
            setTransitionStage('fadeOut');
        }
    }, [location, displayLocation]);

    const onAnimationEnd = () => {
        if (transitionStage === 'fadeOut') {
            setDisplayLocation(location);
            setTransitionStage('fadeIn');
        }
    };

    return (
        <div
            className={`transition-all duration-500 ease-out ${transitionStage === 'fadeIn'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
                }`}
            onTransitionEnd={onAnimationEnd}
        >
            {children}
        </div>
    );
};

// Simplified version for now: React Router 6 doesn't easily support exit animations without AnimatePresence
// So we will stick to a simpler "Enter" animation on key change.

export default function SimplePageTransition({ children }) {
    const location = useLocation();

    return (
        <div
            key={location.pathname}
            className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards ease-out min-h-[calc(100vh-100px)] flex flex-col"
        >
            {children}
        </div>
    );
}
