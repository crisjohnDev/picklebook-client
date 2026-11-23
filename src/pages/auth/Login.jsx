
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    LockKeyhole,
    UserRound,
    Eye,
    EyeOff,
    Trophy,
    ArrowRight,
    ShieldCheck,
    Sparkles
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    // ==========================================
    // LOGIN FORM STATE
    // ==========================================

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    // ==========================================
    // UI STATES
    // ==========================================

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // HANDLE INPUT CHANGES
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        if (error) {
            setError("");
        }
    };

    // ==========================================
    // HANDLE LOGIN SUBMISSION
    // ==========================================


    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const user = await login({
                username: formData.username.trim(),
                password: formData.password
            });

            // Redirect users according to their roles
            switch (user.role) {
                case "admin":
                    navigate("/admin/dashboard", {
                        replace: true
                    });
                    break;

                case "staff":
                    navigate("/staff/dashboard", {
                        replace: true
                    });
                    break;

                case "customer":
                    navigate("/", {
                        replace: true
                    });
                    break;

                default:
                    setError("Your account has an invalid role.");
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to login. Please check your credentials."
            );

        } finally {
            setLoading(false);
        }
    };


    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="min-h-screen bg-[#f5f8f6] lg:grid lg:grid-cols-2">

            {/* ==================================
                LEFT SIDE - BRAND BANNER
            ================================== */}

            <section className="relative hidden min-h-screen overflow-hidden bg-white lg:flex lg:items-center lg:justify-center">

                {/* Banner Background */}

                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-slate-100" />

                {/* Decorative Shapes */}

                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />

                <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-teal-100/50 blur-3xl" />

                {/* Banner Image */}

                <div className="relative z-10 flex h-full w-full items-center justify-center p-5 xl:p-10">

                    <img
                        src="/picklebook-banner.png"
                        alt="PickleBook - Pickleball Court Management"
                        className="max-h-[95vh] w-full object-contain"
                    />

                </div>

                {/* Bottom Branding */}

                <div className="absolute bottom-7 left-0 right-0 z-20 flex justify-center">
                    <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-5 py-2.5 shadow-lg shadow-slate-900/5 backdrop-blur-md">

                        <Trophy size={16} className="text-emerald-600" />

                        <span className="text-xs font-semibold tracking-wide text-slate-600">
                            PLAY SMARTER. BOOK EASIER.
                        </span>

                    </div>
                </div>

            </section>

            {/* ==================================
                RIGHT SIDE - LOGIN
            ================================== */}

            <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-10 lg:px-12 xl:px-20">

                {/* Decorative Background */}

                <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-teal-100/50 blur-3xl" />

                {/* Login Container */}

                <div className="relative z-10 w-full max-w-md">

                    {/* Mobile Logo */}

                    <div className="mb-10 flex items-center gap-3 lg:hidden">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                            <Trophy size={26} />
                        </div>

                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900">
                                PickleBook
                            </h1>

                            <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-700">
                                COURT MANAGEMENT
                            </p>
                        </div>

                    </div>

                    {/* Login Card */}

                    <div className="rounded-[2rem] border border-white bg-white/90 p-7 shadow-2xl shadow-slate-900/5 backdrop-blur-xl sm:p-9">

                        {/* Header */}

                        <div className="mb-8">

                            <div className="mb-6 flex items-center justify-between">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-600/20">
                                    <LockKeyhole size={26} />
                                </div>

                                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">
                                    <ShieldCheck size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        Secure Login
                                    </span>
                                </div>

                            </div>

                            <div className="mb-3 flex items-center gap-2">
                                <Sparkles size={15} className="text-emerald-600" />

                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                                    Welcome Back
                                </p>
                            </div>

                            <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
                                Sign in to
                                <span className="block text-emerald-600">
                                    PickleBook.
                                </span>
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-slate-500">
                                Welcome back! Enter your account details
                                to continue managing your pickleball experience.
                            </p>

                        </div>

                        {/* Error Message */}

                        {error && (
                            <div
                                className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
                                role="alert"
                            >
                                <ShieldCheck size={18} className="mt-0.5 shrink-0" />

                                <span>{error}</span>
                            </div>
                        )}

                        {/* Login Form */}

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Username */}

                            <div>
                                <label
                                    htmlFor="username"
                                    className="mb-2 block text-sm font-bold text-slate-700"
                                >
                                    Username
                                </label>

                                <div className="group relative">

                                    <UserRound
                                        size={19}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-emerald-600"
                                    />

                                    <input
                                        id="username"
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                        minLength={3}
                                        maxLength={30}
                                        required
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                </div>
                            </div>

                            {/* Password */}

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-bold text-slate-700"
                                >
                                    Password
                                </label>

                                <div className="group relative">

                                    <LockKeyhole
                                        size={19}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-emerald-600"
                                    />

                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-12 pr-12 text-sm font-medium text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    {/* Show / Hide Password */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((previous) => !previous)
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-emerald-700"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>

                                </div>
                            </div>

                            {/* Sign In Button */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition duration-300 hover:-translate-y-0.5 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl hover:shadow-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In

                                        <ArrowRight
                                            size={19}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </>
                                )}
                            </button>

                        </form>

                        {/* Security Information */}

                        <div className="mt-7 flex items-center justify-center gap-2 border-t border-slate-100 pt-6">

                            <ShieldCheck
                                size={16}
                                className="text-emerald-600"
                            />

                            <p className="text-xs text-slate-400">
                                Your account information is securely protected.
                            </p>

                        </div>

                    </div>

                    {/* Footer */}

                    <div className="mt-8 text-center">

                        <p className="text-xs font-medium text-slate-400">
                            © {new Date().getFullYear()} PickleBook. All rights reserved.
                        </p>

                        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700/70">
                            Play smarter. Book easier.
                        </p>

                    </div>

                </div>
            </section>

        </div>
    );
}
