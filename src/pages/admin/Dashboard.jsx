
import React, { useCallback, useEffect, useState } from "react";

import {
    CalendarDays,
    Wallet,
    Users,
    MapPin,
    RefreshCw,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    CircleDollarSign,
    ArrowUpRight,
    Building2,
    Activity,
    ChevronRight,
    Trophy
} from "lucide-react";

import dashboardService from "../../services/dashboardService";

// ==========================================
// FORMATTERS
// ==========================================

const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 2
    }).format(amount);
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
    Pending: "bg-amber-50 text-amber-700 ring-amber-100",
    Confirmed: "bg-blue-50 text-blue-700 ring-blue-100",
    Completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Cancelled: "bg-red-50 text-red-700 ring-red-100"
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
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">

        <div className="flex items-start justify-between">

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
// WEEKLY BAR CHART
// ==========================================

const WeeklyBarChart = ({
    title,
    description,
    data = [],
    dataKey,
    color,
    formatter = (value) => value
}) => {
    const maxValue = Math.max(
        ...data.map((item) => Number(item[dataKey] || 0)),
        0
    );

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-6 flex items-start justify-between gap-3">

                <div>
                    <h3 className="font-bold text-slate-900">
                        {title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        {description}
                    </p>
                </div>

                <div className={`h-3 w-3 rounded-full ${color}`} />
            </div>

            {data.length > 0 ? (
                <div className="flex h-56 items-end gap-2 sm:gap-4">

                    {data.map((item) => {
                        const value = Number(item[dataKey] || 0);

                        const height = maxValue > 0
                            ? (value / maxValue) * 100
                            : 0;

                        return (
                            <div
                                key={item.date}
                                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                            >
                                <span
                                    className="mb-2 max-w-full truncate text-center text-[10px] font-semibold text-slate-600 sm:text-xs"
                                    title={String(formatter(value))}
                                >
                                    {formatter(value)}
                                </span>

                                <div className="flex h-full w-full items-end justify-center">
                                    <div
                                        className={`w-full max-w-12 rounded-t-lg transition-all duration-500 ${color}`}
                                        style={{
                                            height: `${height}%`,
                                            minHeight: value > 0 ? "5px" : "0"
                                        }}
                                        title={`${item.label}: ${formatter(value)}`}
                                    />
                                </div>

                                <span className="mt-3 text-xs font-medium text-slate-500">
                                    {item.label}
                                </span>
                            </div>
                        );
                    })}

                </div>
            ) : (
                <div className="flex h-56 items-center justify-center">
                    <p className="text-sm text-slate-400">
                        No chart data available.
                    </p>
                </div>
            )}

        </div>
    );
};

// ==========================================
// COURT AVAILABILITY
// ==========================================

const CourtAvailability = ({
    courts = [],
    summary
}) => {
    const getCourtStatus = (status) => {
        switch (status) {
            case "Available":
                return {
                    icon: CheckCircle,
                    style: "bg-emerald-50 text-emerald-700",
                };

            case "Occupied":
                return {
                    icon: Clock,
                    style: "bg-amber-50 text-amber-700",
                };

            default:
                return {
                    icon: XCircle,
                    style: "bg-slate-100 text-slate-600",
                };
        }
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-5">

                <div className="flex items-center justify-between">

                    <div>
                        <h3 className="font-bold text-slate-900">
                            Court Availability
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Current court status
                        </p>
                    </div>

                    <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                        <Building2 size={21} />
                    </div>

                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">

                    <div className="rounded-xl bg-emerald-50 p-3 text-center">
                        <p className="text-xl font-bold text-emerald-700">
                            {summary.availableCourts || 0}
                        </p>

                        <p className="mt-1 text-xs font-medium text-emerald-700">
                            Available
                        </p>
                    </div>

                    <div className="rounded-xl bg-amber-50 p-3 text-center">
                        <p className="text-xl font-bold text-amber-700">
                            {summary.occupiedCourts || 0}
                        </p>

                        <p className="mt-1 text-xs font-medium text-amber-700">
                            Occupied
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-100 p-3 text-center">
                        <p className="text-xl font-bold text-slate-700">
                            {summary.closedCourts || 0}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-600">
                            Closed
                        </p>
                    </div>

                </div>

            </div>

            <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">

                {courts.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-500">
                        No active courts found.
                    </p>
                ) : (
                    courts.map((court) => {
                        const status = getCourtStatus(court.status);
                        const Icon = status.icon;

                        return (
                            <div
                                key={court._id}
                                className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-slate-50"
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

                                <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.style}`}>
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
// RECENT RESERVATIONS
// ==========================================

const RecentReservations = ({ reservations = [] }) => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 p-5">

            <div>
                <h3 className="font-bold text-slate-900">
                    Recent Reservations
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                    Latest reservation records
                </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CalendarDays size={20} />
            </div>

        </div>

        {reservations.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
                No reservations found.
            </div>
        ) : (
            <div className="overflow-x-auto">

                <table className="w-full min-w-[700px] text-left">

                    <thead className="bg-slate-50">
                        <tr>
                            {[
                                "Customer",
                                "Court",
                                "Date",
                                "Time",
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

                                <td className="px-5 py-4">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {reservation.customer?.fullName || "Unknown"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {reservation.customer?.username || ""}
                                    </p>
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-700">
                                    {reservation.court?.name || "Unknown"}

                                    <p className="mt-1 text-xs text-slate-500">
                                        {reservation.court?.courtNumber || ""}
                                    </p>
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                    {formatDate(reservation.reservationDate)}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                    {reservation.startTime} - {reservation.endTime}
                                </td>

                                <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                                    {formatCurrency(reservation.totalAmount)}
                                </td>

                                <td className="px-5 py-4">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                                        statusStyles[reservation.status] ||
                                        "bg-slate-100 text-slate-600 ring-slate-200"
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
// MAIN DASHBOARD
// ==========================================

const Dashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadDashboard = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await dashboardService.getDashboard();

            setDashboard(response.dashboard);

        } catch (err) {
            console.error("Dashboard Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load dashboard information."
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
                        Loading dashboard...
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
            <div className="p-4 sm:p-6 lg:p-8">

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

                    <div className="flex items-center gap-3 text-red-700">
                        <XCircle size={22} />

                        <p className="font-semibold">
                            {error}
                        </p>
                    </div>

                    <button
                        onClick={() => loadDashboard()}
                        className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }

    const summary = dashboard?.summary || {};
    const weeklyData = dashboard?.charts?.weekly || [];

    return (
        <div className="space-y-7 bg-slate-50 p-4 sm:p-6 lg:p-8">

            {/* ==================================
                PAGE HEADER
            ================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                            PickleBook Overview
                        </p>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Welcome back! Here's what's happening at your facility.
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
                SUMMARY CARDS
            ================================== */}

            <div>
                <div className="mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-emerald-600" />

                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                        Facility Statistics
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <SummaryCard
                        title="Total Bookings"
                        value={summary.totalBookings || 0}
                        description={`${summary.todayBookings || 0} bookings today`}
                        icon={CalendarDays}
                        iconColor="text-blue-600"
                        iconBackground="bg-blue-50"
                    />

                    <SummaryCard
                        title="Total Revenue"
                        value={formatCurrency(summary.totalRevenue)}
                        description={`${formatCurrency(summary.todayRevenue)} paid today`}
                        icon={Wallet}
                        iconColor="text-emerald-600"
                        iconBackground="bg-emerald-50"
                    />

                    <SummaryCard
                        title="Total Customers"
                        value={summary.totalCustomers || 0}
                        description={`${summary.activeCustomers || 0} active · ${summary.newCustomersToday || 0} new today`}
                        icon={Users}
                        iconColor="text-violet-600"
                        iconBackground="bg-violet-50"
                    />

                    <SummaryCard
                        title="Court Availability"
                        value={`${summary.availableCourts || 0} / ${summary.totalCourts || 0}`}
                        description={`${summary.occupiedCourts || 0} occupied · ${summary.closedCourts || 0} closed`}
                        icon={MapPin}
                        iconColor="text-orange-600"
                        iconBackground="bg-orange-50"
                    />

                </div>
            </div>

            {/* ==================================
                BOOKING STATUS
            ================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div>
                        <p className="text-sm font-medium text-slate-500">
                            Pending Reservations
                        </p>

                        <h3 className="mt-2 text-2xl font-bold text-amber-600">
                            {summary.pendingBookings || 0}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Awaiting confirmation
                        </p>
                    </div>

                    <div className="rounded-xl bg-amber-50 p-3">
                        <Clock className="text-amber-600" size={24} />
                    </div>

                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div>
                        <p className="text-sm font-medium text-slate-500">
                            Confirmed Reservations
                        </p>

                        <h3 className="mt-2 text-2xl font-bold text-blue-600">
                            {summary.confirmedBookings || 0}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Successfully confirmed
                        </p>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-3">
                        <CheckCircle className="text-blue-600" size={24} />
                    </div>

                </div>

            </div>

            {/* ==================================
                WEEKLY PERFORMANCE
            ================================== */}

            <div>

                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        Weekly Performance
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Booking activity and revenue over the last seven days.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                    <WeeklyBarChart
                        title="Bookings"
                        description="Number of reservations per day"
                        data={weeklyData}
                        dataKey="bookings"
                        color="bg-blue-500"
                        formatter={(value) => value.toLocaleString()}
                    />

                    <WeeklyBarChart
                        title="Revenue"
                        description="Paid reservation revenue per day"
                        data={weeklyData}
                        dataKey="revenue"
                        color="bg-emerald-500"
                        formatter={(value) => formatCurrency(value)}
                    />

                </div>

            </div>

            {/* ==================================
                COURT AVAILABILITY AND SUMMARY
            ================================== */}

            <div>

                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        Facility Overview
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Monitor court availability and reservation performance.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

                    <div className="xl:col-span-1">
                        <CourtAvailability
                            courts={dashboard?.courtAvailability || []}
                            summary={summary}
                        />
                    </div>

                    <div className="xl:col-span-2">

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="mb-6">
                                <h3 className="font-bold text-slate-900">
                                    Reservation Summary
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Current booking overview
                                </p>
                            </div>

                            <div className="space-y-6">

                                <div>
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span className="font-medium text-slate-600">
                                            Confirmed
                                        </span>

                                        <span className="font-bold text-slate-800">
                                            {summary.confirmedBookings || 0}
                                        </span>
                                    </div>

                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-blue-500 transition-all"
                                            style={{
                                                width: `${
                                                    summary.totalBookings
                                                        ? Math.min(100, summary.confirmedBookings / summary.totalBookings * 100)
                                                        : 0
                                                }%`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span className="font-medium text-slate-600">
                                            Pending
                                        </span>

                                        <span className="font-bold text-slate-800">
                                            {summary.pendingBookings || 0}
                                        </span>
                                    </div>

                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-amber-500 transition-all"
                                            style={{
                                                width: `${
                                                    summary.totalBookings
                                                        ? Math.min(100, summary.pendingBookings / summary.totalBookings * 100)
                                                        : 0
                                                }%`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div className="rounded-xl bg-slate-50 p-5">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                            <TrendingUp size={17} className="text-blue-600" />
                                            Total Reservations
                                        </div>

                                        <p className="mt-3 text-2xl font-bold text-slate-900">
                                            {summary.totalBookings || 0}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-emerald-50 p-5">
                                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                                            <CircleDollarSign size={17} />
                                            Total Paid Revenue
                                        </div>

                                        <p className="mt-3 text-2xl font-bold text-emerald-700">
                                            {formatCurrency(summary.totalRevenue)}
                                        </p>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* ==================================
                RECENT RESERVATIONS
            ================================== */}

            <div>
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        Recent Activity
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Latest reservations made in your facility.
                    </p>
                </div>

                <RecentReservations
                    reservations={dashboard?.recentReservations || []}
                />
            </div>

            {/* ==================================
                FOOTER
            ================================== */}

            <div className="border-t border-slate-200 pt-5">
                <p className="text-center text-xs text-slate-400">
                    PickleBook Administration · Dashboard Overview
                </p>
            </div>

        </div>
    );
};

export default Dashboard;
