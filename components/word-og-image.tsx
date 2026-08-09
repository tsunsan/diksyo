export interface WordOgImageProps {
    term: string;
    pos: string;
    definition: string;
    termFontSize: number;
    definitionFontSize?: number;
}

export function WordOgImage({ term, pos, definition, termFontSize, definitionFontSize }: WordOgImageProps) {
    const defFontSize = definitionFontSize ?? (
        definition.length > 160 ? 30 : definition.length > 100 ? 36 : definition.length > 50 ? 42 : 48
    );

    return (
        <div
            style={{
                backgroundColor: "#FFFBF0",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "64px 80px",
                fontFamily: "Inter, sans-serif",
                boxSizing: "border-box",
            }}
        >
            <div style={{ display: "flex", flexDirection: "column" }}>
                {/* Brand Badge */}
                <div style={{ display: "flex", marginBottom: "32px" }}>
                    <div
                        style={{
                            display: "flex",
                            fontSize: 28,
                            fontWeight: 900,
                            textTransform: "uppercase",
                            backgroundColor: "#FDE047", // yellow-300
                            padding: "10px 22px",
                            border: "5px solid black",
                            boxShadow: "6px 6px 0px 0px #000",
                            letterSpacing: "-0.05em",
                            color: "#000",
                        }}
                    >
                        DIKSYO
                    </div>
                </div>

                {/* Word & Part of Speech */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", flexWrap: "wrap", maxWidth: "100%" }}>
                    <div
                        style={{
                            display: "flex",
                            fontSize: termFontSize,
                            fontWeight: 900,
                            margin: 0,
                            textTransform: "uppercase",
                            letterSpacing: "-0.05em",
                            lineHeight: 1.05,
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
                                fontSize: Math.min(Math.round(termFontSize * 0.48), 42),
                                fontStyle: "italic",
                                fontWeight: 700,
                                color: "#444",
                                marginBottom: "4px",
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
                        fontSize: defFontSize,
                        fontWeight: 700,
                        marginTop: "28px",
                        maxWidth: "1040px",
                        lineHeight: 1.3,
                        color: "#111",
                        wordBreak: "break-word",
                    }}
                >
                    {definition}
                </div>
            </div>

            {/* Footer Branding */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div
                    style={{
                        display: "flex",
                        fontSize: 20,
                        fontWeight: 900,
                        color: "#666",
                        letterSpacing: "0.05em",
                    }}
                >
                    diksyo.app
                </div>
            </div>
        </div>
    );
}
