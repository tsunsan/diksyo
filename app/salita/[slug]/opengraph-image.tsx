import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";
import { getWordByExactSlug } from "@/app/actions/dictionary";
import { WordOgImage } from "@/components/word-og-image";
import { decodeSlug } from "@/lib/utils";

// Image metadata
export const alt = "Diksyo Word Definition";
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
const interBoldItalic = loadFont("inter-700-italic.woff");
const interBold = loadFont("inter-700.woff");

export const revalidate = 86400; // Cache the generated image for 24 hours on the CDN

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const slug = decodeSlug((await params).slug);
    const word = await getWordByExactSlug(slug);

    const term = word ? word.word : slug;
    const pos = word?.partOfSpeech || "";
    const definition = word?.translation || "Alamin ang kahulugan sa Diksyo";

    // Dynamic font size for long words
    const termFontSize = term.length > 22 ? 56 : term.length > 15 ? 72 : term.length > 10 ? 92 : 110;

    const fonts: Array<{ name: string; data: ArrayBuffer; weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900; style: "normal" | "italic" }> = [];

    if (interBlack.byteLength > 0) {
        fonts.push({ name: 'Inter', data: interBlack, weight: 900, style: 'normal' });
    }
    if (interBoldItalic.byteLength > 0) {
        fonts.push({ name: 'Inter', data: interBoldItalic, weight: 700, style: 'italic' });
    }
    if (interBold.byteLength > 0) {
        fonts.push({ name: 'Inter', data: interBold, weight: 700, style: 'normal' });
    }

    return new ImageResponse(
        (
            <WordOgImage 
                term={term} 
                pos={pos} 
                definition={definition} 
                termFontSize={termFontSize} 
            />
        ),
        {
            ...size,
            fonts: fonts.length > 0 ? fonts : undefined,
        }
    );
}
