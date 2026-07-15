export interface WordOgImageProps {
    term: string;
    pos: string;
    definition: string;
    termFontSize: number;
}

export function WordOgImage({ term, pos, definition, termFontSize }: WordOgImageProps) {
    return (
        <div
            style={{
                backgroundColor: "#FFFBF0",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "80px",
                border: "16px solid black",
                fontFamily: "Inter, sans-serif",
            }}
        >
            {/* Brand Badge */}
            <div style={{ display: "flex", marginBottom: "40px" }}>
                <div
                    style={{
                        display: "flex",
                        fontSize: 32,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        backgroundColor: "#FDE047", // yellow-300
                        padding: "12px 24px",
                        border: "6px solid black",
                        boxShadow: "8px 8px 0px 0px #000",
                        letterSpacing: "-0.05em",
                    }}
                >
                    DIKSYO
                </div>
            </div>

            {/* Word & Part of Speech */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "24px", flexWrap: "wrap", maxWidth: "100%" }}>
                <div
                    style={{
                        display: "flex",
                        fontSize: termFontSize,
                        fontWeight: 900,
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: "-0.05em",
                        lineHeight: 1.1,
                        color: "#000",
                        maxWidth: "100%",
                        wordBreak: "break-word",
                    }}
                >
                    {term}
                </div>
                {pos && (
                    <div
                        style={{
                            display: "flex",
                            fontSize: 48,
                            fontStyle: "italic",
                            fontWeight: 700,
                            color: "#333",
                        }}
                    >
                        ({pos})
                    </div>
                )}
            </div>

            {/* Definition */}
            <div
                style={{
                    display: "flex",
                    fontSize: 48,
                    fontWeight: 700,
                    marginTop: "40px",
                    maxWidth: "1000px",
                    lineHeight: 1.3,
                    color: "#111",
                    overflow: "hidden",
                }}
            >
                {definition}
            </div>
        </div>
    );
}
