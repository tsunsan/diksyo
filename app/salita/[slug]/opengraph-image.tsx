import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";
import { getWordByExactSlug } from "@/app/actions/dictionary";
import { WordOgImage } from "@/components/word-og-image";

// Image metadata
export const alt = "Diksyo Word Definition";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

// Cache font buffers in memory outside the request handler to prevent reading from disk on every single request
const interBlack = fs.readFileSync(path.join(process.cwd(), "public/fonts/inter-900.woff"));
const interBoldItalic = fs.readFileSync(path.join(process.cwd(), "public/fonts/inter-700-italic.woff"));
const interBold = fs.readFileSync(path.join(process.cwd(), "public/fonts/inter-700.woff"));

export const revalidate = 86400; // Cache the generated image for 24 hours on the CDN

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const word = await getWordByExactSlug(slug);

    const term = word ? word.word : slug;
    const pos = word?.partOfSpeech || "";
    const definition = word?.translation || "Alamin ang kahulugan sa Diksyo";

    // Dynamic font size for long words
    const termFontSize = term.length > 18 ? 64 : term.length > 12 ? 84 : 120;

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
