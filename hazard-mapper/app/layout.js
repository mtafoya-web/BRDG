import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Hazard Mapper",
  description: "Drone hazard detection dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900">
        
        {/* Top Navigation */}
        <nav className="bg-white shadow-md p-4 mb-6">
          <ul className="flex space-x-6 font-semibold">
            <li>
              <Link
                href="/"
                className="text-gray-900 hover:text-blue-600 transition"
              >
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                href="/map"
                className="text-gray-900 hover:text-blue-600 transition"
              >
                Map
              </Link>
            </li>

            <li>
              <Link
                href="/hazards"
                className="text-gray-900 hover:text-blue-600 transition"
              >
                Hazards
              </Link>
            </li>
          </ul>
        </nav>

        {children}
      </body>
    </html>
  );
}
