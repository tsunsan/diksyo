import { ImageResponse } from "next/og";
import { getWordByExactSlug } from "@/app/actions/dictionary";

// Image metadata
export const alt = "Diksyo Word Definition";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const word = await getWordByExactSlug(slug);

    const term = word ? word.word : slug;
    const pos = word?.partOfSpeech || "";
    const definition = word?.translation || "Alamin ang kahulugan sa Diksyo";

    // Dynamic font size for long words
    const termFontSize = term.length > 18 ? 64 : term.length > 12 ? 84 : 120;

    // Load fonts for sharp rendering
    const [interBlack, interBoldItalic, interBold] = await Promise.all([
        fetch("https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-900-normal.woff").then(r => r.arrayBuffer()),
        fetch("https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-italic.woff").then(r => r.arrayBuffer()),
        fetch("https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff").then(r => r.arrayBuffer())
    ]);

    return new ImageResponse(
        (
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
        ),
        {
            ...size,
            fonts: [
                {
                    name: 'Inter',
                    data: interBlack,
                    weight: 900,
                    style: 'normal',
                },
                {
                    name: 'Inter',
                    data: interBoldItalic,
                    weight: 700,
                    style: 'italic',
                },
                {
                    name: 'Inter',
                    data: interBold,
                    weight: 700,
                    style: 'normal',
                }
            ],
        }
    );
}
