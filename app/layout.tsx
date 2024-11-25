import "../public/app.css";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: `${process.env.EVENT_NAME} event viewer`,
  description: `Simple app to view ${process.env.EVENT_NAME} events`,
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
        <AppRouterCacheProvider>
          {children}
          <Analytics />
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
