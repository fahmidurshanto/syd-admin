import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata = {
  title: "SYD Transport Admin Dashboard",
  description: "Management & Overview for SYD Bookings & Fleet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="h-full flex text-slate-800 selection:bg-indigo-500 selection:text-white bg-slate-50">
        <AuthProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
            <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
