import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";

// Image metadata
export const alt = "Diksyo - The Modern Tagalog Dictionary";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

function loadFont(filename: string): ArrayBuffer {
    try {
        const filePath = path.join(process.cwd(), "public/fonts", filename);
        const buffer = fs.readFileSync(filePath);
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    } catch {
        return new ArrayBuffer(0);
    }
}

const interBlack = loadFont("inter-900.woff");
const interBold = loadFont("inter-700.woff");

export const revalidate = 86400; // Cache for 24 hours

export default async function RootOgImage() {
    const fonts: Array<{ name: string; data: ArrayBuffer; weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900; style: "normal" | "italic" }> = [];

    if (interBlack.byteLength > 0) {
        fonts.push({ name: 'Inter', data: interBlack, weight: 900, style: 'normal' });
    }
    if (interBold.byteLength > 0) {
        fonts.push({ name: 'Inter', data: interBold, weight: 700, style: 'normal' });
    }

    return new ImageResponse(
        (
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
                    <div style={{ display: "flex", marginBottom: "40px" }}>
                        <div
                            style={{
                                display: "flex",
                                fontSize: 36,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                backgroundColor: "#FDE047", // yellow-300
                                padding: "12px 28px",
                                border: "6px solid black",
                                boxShadow: "8px 8px 0px 0px #000",
                                letterSpacing: "-0.05em",
                                color: "#000",
                            }}
                        >
                            DIKSYO
                        </div>
                    </div>

                    {/* Headline */}
                    <div
                        style={{
                            display: "flex",
                            fontSize: 88,
                            fontWeight: 900,
                            margin: 0,
                            textTransform: "uppercase",
                            letterSpacing: "-0.05em",
                            lineHeight: 1.05,
                            color: "#000",
                            maxWidth: "1000px",
                        }}
                    >
                        DECODE FILIPINO.
                    </div>

                    {/* Subheadline */}
                    <div
                        style={{
                            display: "flex",
                            fontSize: 38,
                            fontWeight: 700,
                            marginTop: "24px",
                            maxWidth: "960px",
                            lineHeight: 1.3,
                            color: "#333",
                        }}
                    >
                        The Modern Tagalog Dictionary & Learning Engine. Master vocabulary with active recall and FSRS spaced repetition.
                    </div>
                </div>

                {/* Footer Branding */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div
                        style={{
                            display: "flex",
                            fontSize: 24,
                            fontWeight: 900,
                            color: "#000",
                            letterSpacing: "0.05em",
                        }}
                    >
                        https://diksyo.app
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
            fonts: fonts.length > 0 ? fonts : undefined,
        }
    );
}
