import AdminLayout from "../components/admin/AdminLayout";
import AdminUsers from "../components/admin/AdminUsers";

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="p-7">
        <div className="mb-7">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
            User Management
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            View and manage all registered users
          </p>
        </div>
        <AdminUsers />
      </div>
    </AdminLayout>
  );
}
