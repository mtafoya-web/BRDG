import "./globals.css";
import Navbar from "../components/Navbar";
import Link from "next/link";

export const metadata = {
  title: "Avengineers",
  description: "Intelligent wildfire mitigation connected from the ground",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <Navbar />

          <main className="flex-1 pt-24">
            {children}
          </main>

          <footer className="site-footer">
            <p>&copy; 2026 Avengineers. All rights reserved.</p>

            <p>
              <Link href="/privacy">Privacy Policy</Link>
              <span> | </span>
              <Link href="/contact">Contact Us</Link>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
