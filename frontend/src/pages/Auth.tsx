import { useState } from "react";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, Layers } from "lucide-react";

// No imports from authService — component knows nothing about the service layer

const SLIDES = [
  {
    headline: "Ship projects faster,\ntogether.",
    sub: "LinkUp keeps your whole team aligned — tasks, timelines, and communication in one place.",
  },
  {
    headline: "Real-time visibility\nacross every sprint.",
    sub: "Track what's done, what's blocked, and who's responsible at a glance.",
  },
  {
    headline: "From idea to delivery\nwithout the chaos.",
    sub: "Assign tasks, set deadlines, and watch your projects move forward automatically.",
  },
];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

type Mode = "login" | "register";

interface FormState {
  name: string;
  email: string;
  password: string;
}

export default function Auth() {
  // Component only knows about context actions — not services, not tokens
  const { login, register, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [slide, setSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        // Component calls context action → context calls service → context updates state
        await login({ email: form.email, password: form.password });
      } else {
        if (!form.name.trim()) {
          toast.error("Name is required");
          return;
        }
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown } };
      const msg = error.response?.data;
      toast.error(typeof msg === "string" ? msg : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setForm({ name: "", email: "", password: "" });
  };

  const current = SLIDES[slide];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex min-h-[600px]">
        {/* Form Panel */}
        <div className="flex-1 bg-white dark:bg-zinc-900 flex flex-col justify-center px-10 py-12">
          <div className="flex items-center gap-2 mb-10">
            <div className="size-8 bg-[#1a3a2e] rounded-lg flex items-center justify-center">
              <Layers size={16} className="text-emerald-400" />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
              LinkUp
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-7">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={switchMode}
              className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline"
            >
              {mode === "login" ? "Create now" : "Sign in"}
            </button>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
                  Full Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Jane Doe"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
                E-mail
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a3a2e] hover:bg-[#14301f] text-white font-medium py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
          </div>

          {/* Component calls context action, not the service directly */}
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg py-2.5 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition font-medium"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        {/* Decorative Panel */}
        <div className="hidden md:flex w-[45%] bg-[#1a3a2e] flex-col justify-between p-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 size-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 size-72 rounded-full bg-white/5" />
          <div />
          <div className="relative z-10 space-y-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-8 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                  <Layers size={14} className="text-emerald-300" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">
                    Active Projects
                  </p>
                  <p className="text-white/50 text-xs">Updated just now</p>
                </div>
              </div>
              <div className="flex gap-2">
                {["Design", "Backend", "QA"].map((tag, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      i === 0
                        ? "bg-emerald-400/20 text-emerald-300"
                        : i === 1
                          ? "bg-blue-400/20 text-blue-300"
                          : "bg-amber-400/20 text-amber-300"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold leading-tight whitespace-pre-line mb-3">
                {current.headline}
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                {current.sub}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`rounded-full transition-all ${i === slide ? "bg-emerald-400 w-5 h-2" : "bg-white/30 size-2 hover:bg-white/50"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
