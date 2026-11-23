
import { useCallback, useEffect, useState } from "react";

import {
    CalendarDays,
    Users,
    Wallet,
    Trophy,
    RefreshCw,
    Clock,
    CheckCircle2,
    XCircle,
    ClipboardPlus,
    CalendarCheck,
    ArrowRight,
    Activity
} from "lucide-react";

import { Link } from "react-router-dom";

import staffDashboardService from "../../services/staffDashboardService";

// ==========================================
// FORMATTERS
// ==========================================
const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 2
    }).format(Number(amount || 0));
};

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

const statusStyles = {
    Pending: "bg-amber-50 text-amber-700",
    Confirmed: "bg-blue-50 text-blue-700",
    Completed: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-red-50 text-red-700"
};

// ==========================================
// SUMMARY CARD
// ==========================================
const SummaryCard = ({
    title,
    value,
    description,
    icon: Icon,
    iconColor,
    iconBackground
}) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">

        <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                    {title}
                </p>

                <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900">
                    {value}
                </h2>

                <p className="mt-2 text-xs text-slate-500">
                    {description}
                </p>
            </div>

            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBackground}`}>
                <Icon size={23} className={iconColor} />
            </div>

        </div>

    </div>
);

// ==========================================
// COURT AVAILABILITY
// ==========================================
const CourtAvailability = ({ courts = [] }) => {
    const getStatus = (status) => {
        switch (status) {
            case "Available":
                return {
                    icon: CheckCircle2,
                    style: "bg-emerald-50 text-emerald-700"
                };

            case "Occupied":
                return {
                    icon: Clock,
                    style: "bg-amber-50 text-amber-700"
                };

            default:
                return {
                    icon: XCircle,
                    style: "bg-slate-100 text-slate-600"
                };
        }
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-5">
                <h3 className="font-bold text-slate-900">
                    Court Availability
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                    Current court operating status
                </p>
            </div>

            <div className="divide-y divide-slate-100">

                {courts.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-500">
                        No active courts found.
                    </p>
                ) : (
                    courts.map((court) => {
                        const status = getStatus(court.status);
                        const Icon = status.icon;

                        return (
                            <div
                                key={court._id}
                                className="flex items-center justify-between gap-3 px-5 py-4"
                            >
                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                        <Trophy size={18} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {court.name}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Court {court.courtNumber}
                                        </p>
                                    </div>

                                </div>

                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.style}`}>
                                    <Icon size={13} />
                                    {court.status}
                                </span>

                            </div>
                        );
                    })
                )}

            </div>

        </div>
    );
};

// ==========================================
// TODAY'S RESERVATIONS
// ==========================================
const TodayReservations = ({ reservations = [] }) => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 p-5">

            <div>
                <h3 className="font-bold text-slate-900">
                    Today's Reservations
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                    Facility booking schedule
                </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CalendarDays size={20} />
            </div>

        </div>

        {reservations.length === 0 ? (
            <div className="p-10 text-center">
                <CalendarCheck
                    size={32}
                    className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                    No reservations scheduled today.
                </p>
            </div>
        ) : (
            <div className="overflow-x-auto">

                <table className="w-full min-w-[650px] text-left">

                    <thead className="bg-slate-50">
                        <tr>
                            {[
                                "Time",
                                "Customer",
                                "Court",
                                "Amount",
                                "Status"
                            ].map((heading) => (
                                <th
                                    key={heading}
                                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">

                        {reservations.map((reservation) => (
                            <tr
                                key={reservation._id}
                                className="transition hover:bg-slate-50"
                            >

                                <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                                    {reservation.startTime} - {reservation.endTime}
                                </td>

                                <td className="px-5 py-4">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {reservation.customer?.fullName || "Unknown"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {reservation.customer?.phone || reservation.customer?.username || ""}
                                    </p>
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-700">
                                    {reservation.court?.name || "Unknown"}

                                    <p className="mt-1 text-xs text-slate-500">
                                        {reservation.court?.courtNumber || ""}
                                    </p>
                                </td>

                                <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                                    {formatCurrency(reservation.totalAmount)}
                                </td>

                                <td className="px-5 py-4">
                                    <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                        statusStyles[reservation.status] ||
                                        "bg-slate-100 text-slate-600"
                                    }`}>
                                        {reservation.status}
                                    </span>
                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>
        )}

    </div>
);

// ==========================================
// RECENT STAFF ACTIVITY
// ==========================================
const RecentActivity = ({ activities = [] }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                <Activity size={20} />
            </div>

            <div>
                <h3 className="font-bold text-slate-900">
                    My Recent Activity
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                    Reservations created by your account
                </p>
            </div>
        </div>

        {activities.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
                No activity recorded yet.
            </p>
        ) : (
            <div className="space-y-4">

                {activities.map((item) => (
                    <div
                        key={item._id}
                        className="flex items-start gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                    >
                        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                            <CalendarCheck size={17} />
                        </div>

                        <div className="min-w-0 flex-1">

                            <p className="text-sm font-semibold text-slate-800">
                                {item.customer?.fullName || "Customer booking"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                {item.court?.name || "Court"} · {formatDate(item.reservationDate)}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Created {formatDate(item.createdAt)}
                            </p>

                        </div>

                        <span className="text-xs font-bold text-emerald-700">
                            {formatCurrency(item.totalAmount)}
                        </span>

                    </div>
                ))}

            </div>
        )}

    </div>
);

// ==========================================
// MAIN STAFF DASHBOARD
// ==========================================
export default function StaffDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // FETCH DASHBOARD
    // ==========================================
    const loadDashboard = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await staffDashboardService.getDashboard();

            setDashboard(response.dashboard);

        } catch (err) {
            console.error("Staff Dashboard Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load staff dashboard."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    // ==========================================
    // LOADING STATE
    // ==========================================
    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <RefreshCw
                        size={30}
                        className="mx-auto animate-spin text-emerald-600"
                    />

                    <p className="mt-4 text-sm font-medium text-slate-500">
                        Loading staff dashboard...
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // ERROR STATE
    // ==========================================
    if (error && !dashboard) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

                <div className="flex items-center gap-3 text-red-700">
                    <XCircle size={22} />
                    <p className="font-semibold">{error}</p>
                </div>

                <button
                    onClick={() => loadDashboard()}
                    className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                    Try Again
                </button>

            </div>
        );
    }

    const summary = dashboard?.summary || {};

    return (
        <div className="space-y-7">

            {/* ==================================
                PAGE HEADER
            ================================== */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                            Staff Workspace
                        </p>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Staff Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Monitor today's bookings and facility operations.
                    </p>
                </div>

                <button
                    onClick={() => loadDashboard(true)}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                    />

                    {refreshing ? "Refreshing..." : "Refresh Data"}
                </button>

            </div>

            {error && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    {error} Showing the last successfully loaded data.
                </div>
            )}

            {/* ==================================
                QUICK ACTIONS
            ================================== */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Link
                    to="/staff/walk-in-booking"
                    className="group flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-5 text-white shadow-lg shadow-emerald-600/15 transition hover:-translate-y-1"
                >
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-white/15 p-3">
                            <ClipboardPlus size={25} />
                        </div>

                        <div>
                            <h3 className="font-bold">
                                New Walk-In Booking
                            </h3>

                            <p className="mt-1 text-xs text-emerald-100">
                                Register a customer and reserve a court
                            </p>
                        </div>
                    </div>

                    <ArrowRight
                        size={20}
                        className="transition group-hover:translate-x-1"
                    />
                </Link>

                <Link
                    to="/staff/scheduling"
                    className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200"
                >
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <CalendarDays size={25} />
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-900">
                                View Scheduling
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                Check court time slots and availability
                            </p>
                        </div>
                    </div>

                    <ArrowRight
                        size={20}
                        className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                    />
                </Link>

            </div>

            {/* ==================================
                SUMMARY CARDS
            ================================== */}
            <div>
                <div className="mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-emerald-600" />

                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                        Today's Overview
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <SummaryCard
                        title="Today's Reservations"
                        value={summary.todayBookings || 0}
                        description="Facility bookings scheduled today"
                        icon={CalendarDays}
                        iconColor="text-blue-600"
                        iconBackground="bg-blue-50"
                    />

                    <SummaryCard
                        title="My Walk-In Bookings"
                        value={summary.todayWalkIns || 0}
                        description="Bookings created by your account today"
                        icon={Users}
                        iconColor="text-violet-600"
                        iconBackground="bg-violet-50"
                    />

                    <SummaryCard
                        title="Available Courts"
                        value={`${summary.availableCourts || 0} / ${summary.totalCourts || 0}`}
                        description={`${summary.occupiedCourts || 0} occupied · ${summary.closedCourts || 0} closed`}
                        icon={Trophy}
                        iconColor="text-emerald-600"
                        iconBackground="bg-emerald-50"
                    />

                    <SummaryCard
                        title="Pending Payments"
                        value={formatCurrency(summary.pendingPaymentAmount)}
                        description={`${summary.pendingPayments || 0} unpaid reservations today`}
                        icon={Wallet}
                        iconColor="text-amber-600"
                        iconBackground="bg-amber-50"
                    />

                </div>
            </div>

            {/* ==================================
                COURT AVAILABILITY
            ================================== */}
            <div>
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        Facility Overview
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Check the current status of your courts.
                    </p>
                </div>

                <CourtAvailability
                    courts={dashboard?.courtAvailability || []}
                />
            </div>

            {/* ==================================
                TODAY'S RESERVATIONS
            ================================== */}
            <div>
                <TodayReservations
                    reservations={dashboard?.todayReservations || []}
                />
            </div>

            {/* ==================================
                RECENT ACTIVITY
            ================================== */}
            <div>
                <RecentActivity
                    activities={dashboard?.recentActivity || []}
                />
            </div>

            {/* ==================================
                FOOTER
            ================================== */}
            <div className="border-t border-slate-200 pt-5">
                <p className="text-center text-xs text-slate-400">
                    PickleBook Staff Portal · Daily Operations
                </p>
            </div>

        </div>
    );
}
