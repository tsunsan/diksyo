import { AppSidebar } from "@/components/app-sidebar"; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppSidebar>{children}</AppSidebar>;
}