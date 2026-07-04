"use client";

/**
 * Safari requires tabIndex + onClick for :hover/:focus CSS states
 * to work on non-interactive elements. This client wrapper adds
 * those event handlers since they can't be passed from Server Components.
 */
export default function InteractiveMockup({
    children,
    className,
    ariaLabel,
}: {
    children: React.ReactNode;
    className: string;
    ariaLabel: string;
}) {
    return (
        <div
            tabIndex={0}
            onClick={() => {}}
            role="img"
            aria-label={ariaLabel}
            className={className}
        >
            {children}
        </div>
    );
}
