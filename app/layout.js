// app/layout.js
import './globals.css';
import Navbar from '@/components/Navbar'; // Adjust this import path based on where you save it

export const metadata = {
  title: 'Maison Protéine | Gourmet Breakfast',
  description: 'Chef-built high protein compositions',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#FDFBF7] text-[#2C2623] min-h-screen flex flex-col font-sans antialiased">
        {/* Our premium Client Navbar component safely handles the state */}
        <Navbar />
        <div className="flex-1 w-full">{children}</div>
      </body>
    </html>
  );
}