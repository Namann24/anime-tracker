import { useEffect, useRef, useState } from 'react';

export default function useScrollReveal(options = {}) {
    const [isRevealed, setIsRevealed] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsRevealed(true);
                    if (ref.current) observer.unobserve(ref.current); // Only reveal once
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px', // Trigger slightly before coming into view
                ...options
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, []);

    return { ref, isRevealed };
}
