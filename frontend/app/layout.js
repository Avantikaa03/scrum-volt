import { ThemeProvider } from "next-themes";
import "./globals.css";
import {Inter} from 'next/font/google'

const inter=Inter({subsets:["latin"]});

export const metadata = {
  title: "Scrum Volt",
  description: "Project Manegement App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          <main className="min-h-screen">
          {children}
          </main>
          <footer className="bg-gray-900 py-12">
            <div className="container mx-auto px-4 text-center text-gray-200">
            <p>mai huuuuuu❤️😶‍🌫️😭🫨🙂‍↕️👽</p>

            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  
  );
}
