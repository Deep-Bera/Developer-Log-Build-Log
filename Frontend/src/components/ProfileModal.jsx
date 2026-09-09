import { useState, useRef } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import axios from "../axiosConfig/axiosConfig";

export default function ProfileModal({ user, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // preview the image before uploading..
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setIsLoading(true);

    // multipart form data — needed for file upload..
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("bio", form.bio);
    formData.append("phone", form.phone);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      const response = await axios.put("/api/users/profile", formData, {
        headers: {
          Authorization: localStorage.getItem("token"),
          // don't set Content-Type manually — axios sets it with boundary for multipart....
        },
      });
      onUpdated(response.data.data);
      onClose();
    } catch (err) {
      console.log(err.message);
      setServerError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-20 h-20 mb-3">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-neutral-200 dark:border-neutral-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-2xl font-semibold text-indigo-600 dark:text-indigo-300 uppercase">
                {form.name?.charAt(0) || "U"}
              </div>
            )}
            {/* camera button overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-neutral-900 dark:bg-white rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
            >
              <Camera size={13} className="text-white dark:text-neutral-900" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Change photo
          </button>
          {/* hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpg,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {serverError && (
            <div className="px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">
                {serverError}
              </p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Your phone number"
              className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors placeholder:text-neutral-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Tell us a bit about yourself..."
              className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors placeholder:text-neutral-400 resize-none"
            />
          </div>

          {/* footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
