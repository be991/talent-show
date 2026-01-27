import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#EFF1EC]">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 min-h-screen transition-all duration-300 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
