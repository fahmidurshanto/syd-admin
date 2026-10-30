import "./globals.css";
import AdminLayoutContent from "@/components/AdminLayoutContent";
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
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
