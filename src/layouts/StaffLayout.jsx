
import { useState } from "react";

import {
    NavLink,
    Outlet,
    useNavigate
} from "react-router-dom";

import {
    LayoutDashboard,
    CalendarDays,
    ClipboardList,
    Users,
    CreditCard,
    UserRound,
    Menu,
    X,
    LogOut,
    ChevronRight,
    Trophy,
    PanelLeftClose,
    PanelLeftOpen,
    ShieldCheck,
    ClipboardPlus
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

// ==========================================
// STAFF LAYOUT
// Separate navigation and workspace for staff
// ==========================================
export default function StaffLayout() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // ==========================================
    // SIDEBAR STATES
    // ==========================================
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // ==========================================
    // LOGOUT CONFIRMATION STATE
    // ==========================================
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // ==========================================
    // STAFF NAVIGATION ITEMS
    // ==========================================
    const navigation = [
        {
            title: "WORKSPACE",
            items: [
                {
                    name: "Dashboard",
                    path: "/staff/dashboard",
                    icon: LayoutDashboard
                },
                {
                    name: "Walk-In Booking",
                    path: "/staff/walk-in-booking",
                    icon: ClipboardPlus
                },
                {
                    name: "Scheduling",
                    path: "/staff/scheduling",
                    icon: CalendarDays
                },
                {
                    name: "Reservations",
                    path: "/staff/reservations",
                    icon: ClipboardList
                }
            ]
        },
        {
            title: "MANAGEMENT",
            items: [
                {
                    name: "Customers",
                    path: "/staff/customers",
                    icon: Users
                },
                {
                    name: "Payments",
                    path: "/staff/payments",
                    icon: CreditCard
                }
            ]
        },
        {
            title: "ACCOUNT",
            items: [
                {
                    name: "My Account",
                    path: "/staff/my-account",
                    icon: UserRound
                }
            ]
        }
    ];

    // ==========================================
    // LOGOUT HANDLERS
    // ==========================================
    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        try {
            setLoggingOut(true);

            await logout();

            setShowLogoutConfirm(false);
            navigate("/login", { replace: true });

        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoggingOut(false);
        }
    };

    // ==========================================
    // NAVIGATION LINK STYLES
    // ==========================================
    const getNavLinkClass = ({ isActive }) => `
        group relative flex items-center gap-3 rounded-xl px-3 py-3
        text-sm font-semibold transition-all duration-200
        ${
            isActive
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
        }
        ${sidebarCollapsed ? "justify-center" : ""}
    `;

    // ==========================================
    // SIDEBAR CONTENT
    // ==========================================
    const SidebarContent = ({ mobile = false }) => (
        <div className="flex h-full flex-col">

            {/* BRAND */}
            <div className={`flex h-20 shrink-0 items-center border-b border-slate-100 px-5 ${
                sidebarCollapsed && !mobile
                    ? "justify-center"
                    : "justify-between"
            }`}>

                <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-600/20">
                        <Trophy size={23} />
                    </div>

                    {(!sidebarCollapsed || mobile) && (
                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-black tracking-tight text-slate-900">
                                PickleBook
                            </h1>

                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                                Staff Portal
                            </p>
                        </div>
                    )}

                </div>

                {mobile && (
                    <button
                        onClick={() => setMobileSidebarOpen(false)}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close sidebar"
                    >
                        <X size={21} />
                    </button>
                )}

            </div>


            {/* NAVIGATION */}
            <div className="flex-1 space-y-7 overflow-y-auto px-3 py-6">

                {navigation.map((section) => (
                    <div key={section.title}>

                        {(!sidebarCollapsed || mobile) && (
                            <p className="mb-3 px-3 text-[10px] font-black tracking-[0.16em] text-slate-400">
                                {section.title}
                            </p>
                        )}

                        <div className="space-y-1.5">

                            {section.items.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end
                                        title={
                                            sidebarCollapsed && !mobile
                                                ? item.name
                                                : ""
                                        }
                                        onClick={() => {
                                            if (mobile) {
                                                setMobileSidebarOpen(false);
                                            }
                                        }}
                                        className={getNavLinkClass}
                                    >

                                        <Icon
                                            size={19}
                                            className="shrink-0"
                                        />

                                        {(!sidebarCollapsed || mobile) && (
                                            <span className="truncate">
                                                {item.name}
                                            </span>
                                        )}

                                        {(!sidebarCollapsed || mobile) && (
                                            <ChevronRight
                                                size={15}
                                                className="ml-auto opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-70"
                                            />
                                        )}

                                    </NavLink>
                                );
                            })}

                        </div>

                    </div>
                ))}

            </div>


            {/* STAFF PROFILE */}
            <div className="shrink-0 border-t border-slate-100 p-3">

                <div className={`mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 ${
                    sidebarCollapsed && !mobile
                        ? "justify-center"
                        : ""
                }`}>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-black uppercase text-emerald-700">
                        {user?.fullName?.charAt(0) || "S"}
                    </div>

                    {(!sidebarCollapsed || mobile) && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-800">
                                {user?.fullName || "Staff Member"}
                            </p>

                            <p className="text-xs font-medium capitalize text-slate-400">
                                {user?.role || "Staff"}
                            </p>
                        </div>
                    )}

                </div>


                {/* LOGOUT BUTTON */}
                <button
                    onClick={handleLogout}
                    title={
                        sidebarCollapsed && !mobile
                            ? "Logout"
                            : ""
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 ${
                        sidebarCollapsed && !mobile
                            ? "justify-center"
                            : ""
                    }`}
                >
                    <LogOut size={19} />

                    {(!sidebarCollapsed || mobile) && (
                        <span>Logout</span>
                    )}
                </button>

            </div>

        </div>
    );

    // ==========================================
    // MAIN LAYOUT
    // ==========================================
    return (
        <div className="min-h-screen bg-[#f5f8f6]">

            {/* ==================================
                DESKTOP SIDEBAR
            ================================== */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 hidden border-r border-slate-100 bg-white transition-all duration-300 lg:block ${
                    sidebarCollapsed ? "w-20" : "w-64"
                }`}
            >
                <SidebarContent />

            </aside>


            {/* ==================================
                MOBILE SIDEBAR OVERLAY
            ================================== */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">

                    <button
                        onClick={() => setMobileSidebarOpen(false)}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                        aria-label="Close sidebar overlay"
                    />

                    <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl">

                        <SidebarContent mobile />

                    </aside>

                </div>
            )}


            {/* ==================================
                MAIN CONTENT AREA
            ================================== */}
            <div
                className={`min-h-screen transition-all duration-300 ${
                    sidebarCollapsed
                        ? "lg:pl-20"
                        : "lg:pl-64"
                }`}
            >

                {/* HEADER */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-100 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">

                    <div className="flex items-center gap-3">

                        {/* MOBILE MENU BUTTON */}
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 lg:hidden"
                            aria-label="Open sidebar"
                        >
                            <Menu size={21} />
                        </button>


                        {/* DESKTOP SIDEBAR COLLAPSE */}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="hidden rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 lg:flex"
                            title={
                                sidebarCollapsed
                                    ? "Expand sidebar"
                                    : "Collapse sidebar"
                            }
                        >
                            {sidebarCollapsed ? (
                                <PanelLeftOpen size={21} />
                            ) : (
                                <PanelLeftClose size={21} />
                            )}
                        </button>


                        <div>
                            <p className="text-xs font-medium text-slate-400">
                                PickleBook / Staff Portal
                            </p>

                            <h2 className="text-sm font-black text-slate-800 sm:text-base">
                                Staff Workspace
                            </h2>
                        </div>

                    </div>


                    {/* HEADER PROFILE */}
                    <div className="flex items-center gap-3">

                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-bold text-slate-800">
                                {user?.fullName || "Staff Member"}
                            </p>

                            <p className="text-xs font-medium capitalize text-emerald-600">
                                {user?.role || "Staff"}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 font-black uppercase text-emerald-700">
                            {user?.fullName?.charAt(0) || "S"}
                        </div>

                    </div>

                </header>


                {/* PAGE CONTENT */}
                <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 xl:px-8 xl:py-10">

                    <Outlet />

                </main>

            </div>


            {/* ==================================
                LOGOUT CONFIRMATION MODAL
            ================================== */}
            {showLogoutConfirm && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
                    onClick={(event) => {
                        if (event.target === event.currentTarget && !loggingOut) {
                            setShowLogoutConfirm(false);
                        }
                    }}
                >

                    <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">

                        {/* ICON */}
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                            <LogOut size={28} />
                        </div>


                        {/* MESSAGE */}
                        <div className="mt-5 text-center">

                            <h3 className="text-xl font-black text-slate-900">
                                Confirm Logout
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Are you sure you want to log out of your PickleBook staff account?
                            </p>

                        </div>


                        {/* BUTTONS */}
                        <div className="mt-7 flex gap-3">

                            <button
                                type="button"
                                disabled={loggingOut}
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={loggingOut}
                                onClick={confirmLogout}
                                className="flex-1 rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loggingOut ? "Logging out..." : "Yes, Logout"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}
