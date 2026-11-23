
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
    Trophy,
    ShieldCheck,
    LoaderCircle
} from "lucide-react";

// ==========================================
// GET DASHBOARD BASED ON USER ROLE
// ==========================================
function getDashboardPath(role) {
    switch (role) {
        case "admin":
            return "/admin/dashboard";

        case "staff":
            return "/staff/dashboard";

        case "customer":
            return "/";

        default:
            return "/login";
    }
}

export default function ProtectedRoute({ allowedRoles }) {
    const { user, loading } = useAuth();

    // ==========================================
    // AUTHENTICATION LOADING SCREEN
    // ==========================================
    if (loading) {
        return (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f8f6] px-5 py-10">

                {/* Background Decorations */}
                <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-100/60 blur-3xl" />

                {/* Loading Content */}
                <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white bg-white/90 shadow-2xl shadow-slate-900/5 backdrop-blur-xl">

                    {/* Banner */}
                    <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 to-slate-100 p-5 sm:min-h-[300px] sm:p-8">

                        <img
                            src="/picklebook-banner.png"
                            alt="PickleBook Banner"
                            className="max-h-[280px] w-full object-contain sm:max-h-[350px]"
                        />

                    </div>

                    {/* Loading Information */}
                    <div className="px-6 py-10 text-center sm:px-12">

                        {/* Animated Logo */}
                        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">

                            <div className="absolute inset-0 animate-ping rounded-2xl bg-emerald-400/20" />

                            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-600/20">
                                <Trophy size={30} />
                            </div>

                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">
                            Loading PickleBook
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                            Preparing your workspace and verifying your account.
                            Please wait a moment.
                        </p>

                        {/* Loading Spinner */}
                        <div className="mt-7 flex items-center justify-center gap-3">

                            <LoaderCircle
                                size={20}
                                className="animate-spin text-emerald-600"
                            />

                            <span className="text-sm font-semibold text-emerald-700">
                                Please wait...
                            </span>

                        </div>

                        {/* Progress Indicator */}
                        <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-100">

                            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 to-emerald-700" />

                        </div>

                        {/* Security Information */}
                        <div className="mt-7 flex items-center justify-center gap-2 border-t border-slate-100 pt-6">

                            <ShieldCheck
                                size={15}
                                className="text-emerald-600"
                            />

                            <span className="text-xs font-medium text-slate-400">
                                Securely connecting to PickleBook
                            </span>

                        </div>

                    </div>

                </div>

            </div>
        );
    }

    // ==========================================
    // CHECK AUTHENTICATION
    // ==========================================
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // ==========================================
    // CHECK USER ROLE
    // Redirect unauthorized users to their
    // own dashboard instead of the homepage.
    // ==========================================
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <Navigate
                to={getDashboardPath(user.role)}
                replace
            />
        );
    }

    // ==========================================
    // RENDER PROTECTED PAGE
    // ==========================================
    return <Outlet />;
}
