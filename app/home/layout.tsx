import { AppSidebar } from "@/components/app-sidebar"; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout wraps pages inside the /home route segment.
  // The AppSidebar is a client component that provides the navigation and overall structure.
  return <AppSidebar>{children}</AppSidebar>;
}