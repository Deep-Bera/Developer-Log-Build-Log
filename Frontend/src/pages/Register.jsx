import { useState } from "react";
import axios from "../axiosConfig/axiosConfig";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/favicon.svg";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [validationErrors, setValidationErrors] = useState([]);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // for removing the errors when user have started typing in the field ...
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors.filter((err) => err.path !== name));
    }
  };

  const getError = (field) => {
    const matchedError = validationErrors.find((error) => error.path === field);
    if (matchedError) {
      return matchedError.msg;
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationErrors([]);
    setServerError("");

    axios
      .post("/api/users/register", form)
      .then((response) => {
        console.log(response.data);
        navigate("/Login");
      })
      .catch((err) => {
        const status = err.response?.status;
        const data = err.response?.data;
        console.log(data, status);

        if (status === 400 && data?.errors) {
          setValidationErrors(data.errors);
        } else {
          setServerError(data?.message || "Something went wrong");
        }
      });
  };

  return (
    <div className="min-h-screen w-full bg-neutral-100 flex">
      {/* left brand panel */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-slate-900 flex-col justify-between p-10">
        {/*  logo padding  */}
        <div className="flex items-center gap-3 pt-2 pl-1">
          <img src={Logo} alt="Build Log" width={50} height={50} />
          <span className="text-white text-base font-bold tracking-tight">
            Build Log
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="text-white text-3xl font-bold leading-snug">
            Turn your dev journey into{" "}
            <span className="text-sky-400">interview-ready</span> stories.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your AI developer notebook. Effortlessly log daily decisions and
            turn raw notes into interview-ready proof.
          </p>
        </div>

        {/*footer */}
        <p className="text-slate-400 text-xs">
          Document the build. Showcase the impact.
        </p>
      </div>

      {/* right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-neutral-100">
        <div
          className="w-full max-w-md bg-neutral-100 rounded-2xl border border-neutral-200 p-8
          shadow-[6px_6px_12px_#b8bec7,-6px_-6px_12px_#ffffff]"
        >
          {/* tab row */}
          <div className="flex gap-1 bg-neutral-200 p-1 rounded-lg mb-6">
            <button
              type="button"
              className="flex-1 py-1.5 text-sm font-medium rounded-lg text-neutral-500 hover:text-neutral-700 transition-all"
              onClick={() => navigate("/Login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className="flex-1 py-1.5 text-sm font-medium rounded-lg bg-neutral-100 shadow-sm text-neutral-900 transition-all"
            >
              Create account
            </button>
          </div>

          {/* heading */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Create your account
            </h2>
            {/* subtitle  */}
            <p className="text-sm text-neutral-600 mt-0.5">
              Start logging your dev journey today.
            </p>
          </div>

          {/* server error */}
          {serverError && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">
                Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full pl-3 pr-10 py-2 text-sm border border-neutral-300 rounded-lg outline-none focus:shadow-[0_0_8px_rgba(56,189,248,0.5)] focus:border-sky-500 transition-all placeholder:text-neutral-400 bg-neutral-100 shadow-[2px_2px_6px_#b8bec7]"
              />
              {getError("name") && (
                <p className="text-red-500 text-xs">{getError("name")}</p>
              )}
            </div>

            {/* email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-neutral-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-3 pr-10 py-2 text-sm border border-neutral-300 rounded-lg outline-none focus:shadow-[0_0_8px_rgba(56,189,248,0.5)] focus:border-sky-500 transition-all placeholder:text-neutral-400 bg-neutral-100 shadow-[2px_2px_6px_#b8bec7]"
              />
              {getError("email") && (
                <p className="text-red-500 text-xs">{getError("email")}</p>
              )}
            </div>

            {/* password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-neutral-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-3 pr-10 py-2 text-sm border border-neutral-300 rounded-lg outline-none focus:shadow-[0_0_8px_rgba(56,189,248,0.5)] focus:border-sky-500 transition-all placeholder:text-neutral-400 bg-neutral-100 shadow-[2px_2px_6px_#b8bec7]"
                />
                {/*eye icon to toggle between show password and hide */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {getError("password") && (
                <p className="text-red-500 text-xs">{getError("password")}</p>
              )}
            </div>

            {/* submit */}
            <button
              type="submit"
              className="w-full py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors mt-2"
            >
              Create account
            </button>
          </form>

          <p className="text-center text-xs text-neutral-500 mt-5">
            Already registered?{" "}
            <button
              type="button"
              onClick={() => navigate("/Login")}
              className="text-sky-600 hover:text-sky-700 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
