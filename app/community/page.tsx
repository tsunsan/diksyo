import { CommunityContent } from "@/components/community-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Dictionary",
  description: "Explore the Diksyo crowdsourced Tagalog dictionary. Discover slang, popular words, and new definitions.",
};

export default function CommunityPageWrapper() {
  return <CommunityContent />;
}
