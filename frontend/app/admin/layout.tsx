import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-background dark:bg-gray-900">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background dark:bg-gray-900">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}

