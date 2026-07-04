"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface LandingHeroProps {
    children: React.ReactNode;
}

export default function LandingHero({ children }: LandingHeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Hero entrance animations
        gsap.from(".hero-element", {
            y: 60,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.5)",
        });

        // Floating SVG animations
        gsap.to(".svg-float", {
            y: -15,
            rotation: 2,
            duration: 2.5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            stagger: 0.3,
        });

        // Scroll-triggered section reveal animations
        gsap.utils.toArray<Element>(".scroll-section").forEach((section) => {
            gsap.from(section, {
                y: 80,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
            });
        });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="flex flex-col">
            {children}
        </div>
    );
}
