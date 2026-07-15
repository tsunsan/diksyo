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
