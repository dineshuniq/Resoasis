import type { Metadata } from "next";
import './globals.css';
import Link from "next/link";
import { LayoutDashboard, Building2, FolderKanban, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "SOMS - Service Operations Management System",
  description: "Operational Console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Clients", href: "/clients", icon: Building2 },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Employees", href: "/employees", icon: Users },
  ];

  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900 antialiased">
      <body className="flex h-full overflow-hidden text-sm">
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between">
          <div className="flex flex-col">
            <div className="h-14 border-b border-slate-200 flex items-center px-6 font-mono font-bold tracking-wider text-slate-800">
              SOMS // CONSOLE
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <Icon className="h-4 w-4 stroke-[2]" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>User: Standard Admin</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </aside>

        {/* Primary Scroll Container */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
          {children}
        </main>
      </body>
    </html>
  );
}