import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {children}
      </main>
    </div>
  );
}
