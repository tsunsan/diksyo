import { redirect } from "next/navigation";
import { getRandomWordSlug } from "@/app/actions/dictionary";

export default async function RandomWordPage() {
    const slug = await getRandomWordSlug();
    if (slug) {
        redirect(`/salita/${slug}`);
    }
    redirect("/");
}