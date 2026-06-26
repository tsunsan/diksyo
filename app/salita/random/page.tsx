import { redirect } from "next/navigation";
import { getRandomWordSlug } from "@/app/actions/dictionary";

export const dynamic = "force-dynamic";

export default async function RandomWordPage() {
    const slug = await getRandomWordSlug();
    if (slug) {
        redirect(`/salita/${slug}`);
    }
    redirect("/");
}