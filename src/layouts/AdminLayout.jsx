
import { useState } from "react";
import {
    NavLink,
    Outlet,
    useNavigate
} from "react-router-dom";

import {
    LayoutDashboard,
    Building2,
    CalendarDays,
    Users,
    CreditCard,
    ChartNoAxesCombined,
    Settings,
    Menu,
    X,
    LogOut,
    ChevronRight,
    CircleUserRound,
    Trophy,
    PanelLeftClose,
    PanelLeftOpen,
    ShieldCheck,
    Activity
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

const navigation = [
    {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard
    },
    {
        name: "Court Management",
        path: "/admin/courts",
        icon: Building2
    },
    {
        name: "Reservations",
        path: "/admin/reservations",
        icon: CalendarDays
    },
    {
        name: "Scheduling",
        path: "/admin/scheduling",
        icon: CalendarDays,
        roles: ["admin"]
    },
    {
        name: "Customers",
        path: "/admin/customers",
        icon: Users
    },
    {
        name: "Payments",
        path: "/admin/payments",
        icon: CreditCard
    },
    {
        name: "User Management",
        path: "/admin/user-management",
        icon: ShieldCheck,
        adminOnly: true
    },
    {
        name: "Reports",
        path: "/admin/reports",
        icon: ChartNoAxesCombined
    },
    {
        name: "Activity Logs",
        path: "/admin/activity-logs",
        icon: Activity,
        adminOnly: true
    },
    {
        name: "Settings",
        path: "/admin/settings",
        icon: Settings
    }
];

// ==========================================
// ADMIN LAYOUT
// ==========================================

export default function AdminLayout() {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    // ======================================
    // LOGOUT CONFIRMATION
    // ======================================

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    // ======================================
    // CONFIRM LOGOUT
    // ======================================

    const confirmLogout = () => {
        logout();

        setShowLogoutConfirm(false);

        navigate("/login");
    };

    // ======================================
    // CLOSE MOBILE SIDEBAR
    // ======================================

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    // ======================================
    // FILTER NAVIGATION BY ROLE
    // ======================================

    const visibleNavigation = navigation.filter((item) => {

        if (item.adminOnly && user?.role !== "admin") {
            return false;
        }

        if (item.roles && !item.roles.includes(user?.role)) {
            return false;
        }

        return true;
    });

    // ======================================
    // RENDER
    // ======================================

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ==================================
                MOBILE OVERLAY
            ================================== */}

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* ==================================
                SIDEBAR
            ================================== */}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-50
                    flex flex-col
                    bg-slate-950 text-white
                    shadow-xl
                    transition-all duration-300 ease-in-out

                    ${sidebarCollapsed ? "w-20" : "w-64"}

                    ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }

                    lg:translate-x-0
                `}
            >

                {/* LOGO SECTION */}

                <div
                    className={`
                        flex h-20 shrink-0 items-center
                        border-b border-white/10
                        ${
                            sidebarCollapsed
                                ? "justify-center px-3"
                                : "justify-between px-5"
                        }
                    `}
                >
                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-950/30">
                            <Trophy size={23} />
                        </div>

                        {!sidebarCollapsed && (
                            <div className="min-w-0">
                                <h1 className="truncate text-lg font-bold tracking-wide">
                                    PickleBook
                                </h1>

                                <p className="truncate text-[11px] text-slate-400">
                                    Court Management
                                </p>
                            </div>
                        )}
                    </div>

                    {/* MOBILE CLOSE */}

                    {!sidebarCollapsed && (
                        <button
                            type="button"
                            onClick={closeSidebar}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
                            aria-label="Close sidebar"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* ==================================
                    NAVIGATION
                ================================== */}

                <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-6">

                    {!sidebarCollapsed && (
                        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            Main Menu
                        </p>
                    )}

                    {sidebarCollapsed && (
                        <div className="mb-5 flex justify-center">
                            <div className="h-px w-8 bg-white/10" />
                        </div>
                    )}

                    <nav className="space-y-1.5">

                        {visibleNavigation.map((item) => {

                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={closeSidebar}
                                    title={
                                        sidebarCollapsed
                                            ? item.name
                                            : ""
                                    }
                                    className={({ isActive }) => `
                                        group relative flex items-center
                                        rounded-xl py-3
                                        text-sm font-medium
                                        transition-all duration-200

                                        ${
                                            sidebarCollapsed
                                                ? "justify-center px-2"
                                                : "justify-between px-3"
                                        }

                                        ${
                                            isActive
                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950/30"
                                                : "text-slate-400 hover:bg-white/10 hover:text-white"
                                        }
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div
                                                className={`
                                                    flex min-w-0 items-center
                                                    ${
                                                        sidebarCollapsed
                                                            ? "justify-center"
                                                            : "gap-3"
                                                    }
                                                `}
                                            >
                                                <Icon
                                                    size={20}
                                                    className={`
                                                        shrink-0 transition-colors
                                                        ${
                                                            isActive
                                                                ? "text-white"
                                                                : "text-slate-400 group-hover:text-white"
                                                        }
                                                    `}
                                                />

                                                {!sidebarCollapsed && (
                                                    <span className="truncate">
                                                        {item.name}
                                                    </span>
                                                )}
                                            </div>

                                            {!sidebarCollapsed && isActive && (
                                                <ChevronRight
                                                    size={17}
                                                    className="shrink-0"
                                                />
                                            )}

                                            {/* ACTIVE INDICATOR */}

                                            {sidebarCollapsed && isActive && (
                                                <span className="absolute -right-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-emerald-400" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}

                    </nav>
                </div>

                {/* ==================================
                    USER PROFILE
                ================================== */}

                <div className="shrink-0 border-t border-white/10 p-3">

                    <div
                        className={`
                            mb-3 flex items-center rounded-xl
                            bg-white/5
                            ${
                                sidebarCollapsed
                                    ? "justify-center p-2"
                                    : "gap-3 p-3"
                            }
                        `}
                        title={
                            sidebarCollapsed
                                ? user?.fullName
                                : ""
                        }
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                            <CircleUserRound size={22} />
                        </div>

                        {!sidebarCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-white">
                                    {user?.fullName || "Administrator"}
                                </p>

                                <p className="text-xs capitalize text-slate-400">
                                    {user?.role || "Admin"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* LOGOUT BUTTON */}

                    <button
                        type="button"
                        onClick={handleLogout}
                        title={
                            sidebarCollapsed
                                ? "Logout"
                                : ""
                        }
                        className={`
                            flex w-full items-center rounded-xl
                            py-3 text-sm font-medium
                            text-slate-400 transition
                            hover:bg-red-500/10 hover:text-red-400

                            ${
                                sidebarCollapsed
                                    ? "justify-center px-2"
                                    : "gap-3 px-3"
                            }
                        `}
                    >
                        <LogOut size={19} />

                        {!sidebarCollapsed && (
                            <span>Logout</span>
                        )}
                    </button>
                </div>
            </aside>

            {/* ==================================
                MAIN CONTENT
            ================================== */}

            <div
                className={`
                    min-h-screen transition-all duration-300
                    ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}
                `}
            >

                {/* ==================================
                    TOP HEADER
                ================================== */}

                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:h-20 lg:px-8">

                    {/* LEFT HEADER */}

                    <div className="flex min-w-0 items-center gap-3">

                        {/* MOBILE MENU */}

                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
                            aria-label="Open sidebar"
                        >
                            <Menu size={22} />
                        </button>

                        {/* DESKTOP COLLAPSE BUTTON */}

                        <button
                            type="button"
                            onClick={() =>
                                setSidebarCollapsed((previous) => !previous)
                            }
                            className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:inline-flex"
                            title={
                                sidebarCollapsed
                                    ? "Expand sidebar"
                                    : "Collapse sidebar"
                            }
                            aria-label={
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

                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800 sm:text-base">
                                PickleBook Administration
                            </p>

                            <p className="hidden text-xs text-slate-500 sm:block">
                                Manage your pickleball facility
                            </p>
                        </div>
                    </div>

                    {/* RIGHT HEADER */}

                    <div className="flex shrink-0 items-center gap-3">

                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold text-slate-800">
                                {user?.fullName || "Administrator"}
                            </p>

                            <p className="text-xs capitalize text-slate-500">
                                {user?.role || "Admin"}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <CircleUserRound size={21} />
                        </div>
                    </div>
                </header>

                {/* ==================================
                    PAGE CONTENT
                ================================== */}

                <main className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]">
                    <Outlet />
                </main>
            </div>

            {/* ==================================
                LOGOUT CONFIRMATION MODAL
            ================================== */}

            {showLogoutConfirm && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowLogoutConfirm(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="logout-modal-title"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                    >

                        {/* ICON */}

                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                            <LogOut size={27} />
                        </div>

                        {/* TITLE */}

                        <h2
                            id="logout-modal-title"
                            className="text-xl font-bold text-slate-900"
                        >
                            Confirm Logout
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Are you sure you want to log out of PickleBook?
                            You will need to log in again to access the
                            administration panel.
                        </p>

                        {/* ACTIONS */}

                        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmLogout}
                                className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                            >
                                <LogOut size={16} />
                                Yes, Logout
                            </button>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
