import AdminLayout from "../components/admin/AdminLayout";
import AdminProjects from "../components/admin/AdminProjects";

export default function AdminProjectsPage() {
  return (
    <AdminLayout>
      <div className="p-7">
        <div className="mb-7">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Project Management
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Approve, reject, hide, or delete any project
          </p>
        </div>
        <AdminProjects />
      </div>
    </AdminLayout>
  );
}
