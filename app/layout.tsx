import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "37C3 event viewer",
  description: "Simple app to view 37C3 events",
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
      </body>
    </html>
  );
}
