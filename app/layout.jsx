import "./globals.css";

export const metadata = {
  title: "Jio Salon",
  description: "Skip the wait. Take your seat.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-vanilla-50">{children}</body>
    </html>
  );
}
