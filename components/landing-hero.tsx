"use client";

import { useRef, useEffect } from "react";
import { animate, inView, stagger } from "framer-motion";

interface LandingHeroProps {
    children: React.ReactNode;
}

export default function LandingHero({ children }: LandingHeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        
        const heroElements = containerRef.current.querySelectorAll(".hero-element");
        if (heroElements.length > 0) {
            animate(
                heroElements,
                { y: [60, 0], opacity: [0, 1] },
                { duration: 0.8, delay: stagger(0.15), type: "spring", bounce: 0.4 }
            );
        }

        const floatElements = containerRef.current.querySelectorAll(".svg-float");
        if (floatElements.length > 0) {
            animate(
                floatElements,
                { y: [0, -15, 0], rotate: [0, 2, 0] },
                { duration: 5, ease: "easeInOut", repeat: Infinity, delay: stagger(0.3) }
            );
        }

        const sections = containerRef.current.querySelectorAll(".scroll-section");
        sections.forEach((section) => {
            animate(section, { y: 80, opacity: 0 }, { duration: 0 });
            
            inView(section, (info) => {
                animate(section, { y: 0, opacity: 1 }, { duration: 0.8, ease: "easeOut" });
                return (leaveInfo) => {
                    // When scrolling back up, reset it
                    animate(section, { y: 80, opacity: 0 }, { duration: 0.5, ease: "easeOut" });
                };
            }, { margin: "0px 0px -15% 0px" });
        });
        
    }, []);

    return (
        <div ref={containerRef} className="flex flex-col">
            {children}
        </div>
    );
}
