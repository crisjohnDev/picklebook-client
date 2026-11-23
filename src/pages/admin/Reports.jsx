
import React, { useCallback, useEffect, useState } from "react";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

import {
    CalendarDays,
    CalendarRange,
    CheckCircle,
    Clock,
    CreditCard,
    RefreshCw,
    Wallet
} from "lucide-react";

import reportService from "../../services/reportService";

// ==========================================
// DATE HELPERS
// ==========================================

const getToday = () => {
    const date = new Date();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
};

// ==========================================
// FORMAT HELPERS
// ==========================================

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
};

const formatDate = (date) => {
    if (!date) return "—";

    const [year, month, day] = date.split("-").map(Number);

    if (!year || !month || !day) return "—";

    return new Date(year, month - 1, day).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};

// ==========================================
// SUMMARY CARD
// ==========================================

const SummaryCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color
}) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        violet: "bg-violet-50 text-violet-600",
        red: "bg-red-50 text-red-600",
        slate: "bg-slate-100 text-slate-600"
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-7">
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-500">
                    {title}
                </p>

                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}>
                    <Icon size={21} />
                </div>
            </div>

            <p className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {value}
            </p>

            {subtitle && (
                <p className="mt-2 text-sm text-slate-500">
                    {subtitle}
                </p>
            )}
        </div>
    );
};

// ==========================================
// CHART CARD
// ==========================================

const ChartCard = ({
    title,
    description,
    children
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-7">
                <h2 className="text-lg font-bold text-slate-900">
                    {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    {description}
                </p>
            </div>

            {children}
        </div>
    );
};

// ==========================================
// EMPTY CHART / LOADING STATE
// ==========================================

const EmptyChart = ({ message }) => (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <CalendarDays size={22} className="text-slate-400" />
        </div>

        <p className="text-sm font-medium text-slate-500">
            {message}
        </p>
    </div>
);

// ==========================================
// CHART SKELETON
// ==========================================

const ChartSkeleton = () => (
    <div className="flex h-[320px] animate-pulse items-end justify-around gap-4 px-6 pb-8">
        {[45, 70, 55, 85, 60, 95, 40].map((height, index) => (
            <div
                key={index}
                className="w-full max-w-12 rounded-t-lg bg-slate-100"
                style={{ height: `${height}%` }}
            />
        ))}
    </div>
);

// ==========================================
// STATISTIC ROW
// ==========================================

const StatisticRow = ({
    label,
    value = 0,
    color,
    maxValue
}) => {
    const numericValue = Number(value) || 0;

    const percentage = maxValue > 0
        ? Math.min((numericValue / maxValue) * 100, 100)
        : 0;

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-600">
                    {label}
                </span>

                <span className="font-semibold text-slate-900">
                    {numericValue}
                </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{
                        width: `${percentage}%`
                    }}
                />
            </div>
        </div>
    );
};

// ==========================================
// PERIOD BUTTON
// ==========================================

const PeriodButton = ({
    active,
    onClick,
    icon: Icon,
    label
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3.5 text-sm font-semibold transition ${
            active
                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
        }`}
    >
        <Icon size={17} />
        {label}
    </button>
);

// ==========================================
// LOADING SUMMARY SKELETON
// ==========================================

const SummarySkeleton = () => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
            <div
                key={index}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 sm:p-7"
            >
                <div className="flex items-center justify-between">
                    <div className="h-4 w-28 rounded bg-slate-200" />
                    <div className="h-12 w-12 rounded-xl bg-slate-100" />
                </div>

                <div className="mt-5 h-8 w-36 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-40 rounded bg-slate-100" />
            </div>
        ))}
    </div>
);

// ==========================================
// REPORTS COMPONENT
// ==========================================

const Reports = () => {
    const [period, setPeriod] = useState("daily");
    const [selectedDate, setSelectedDate] = useState(getToday());

    const [report, setReport] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // LOAD REPORT
    // ==========================================

    const loadReport = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await reportService.getReports(
                period,
                selectedDate
            );

            setReport(response);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to generate report."
            );
        } finally {
            setLoading(false);
        }
    }, [period, selectedDate]);

    useEffect(() => {
        loadReport();
    }, [loadReport]);

    // ==========================================
    // REPORT DATA
    // ==========================================

    const summary = report?.summary || {};

    const revenueData = report?.charts?.revenue || [];
    const bookingData = report?.charts?.bookings || [];

    const paymentMethods = report?.paymentMethods || {};

    const reportPeriodLabel = {
        daily: "Daily Report",
        weekly: "Weekly Report",
        monthly: "Monthly Report"
    };

    // ==========================================
    // REPORT RANGE
    // ==========================================

    const getRangeDescription = () => {
        if (!report?.dateRange) return "";

        if (period === "daily") {
            return formatDate(report.dateRange.start);
        }

        return `${formatDate(report.dateRange.start)} - ${formatDate(report.dateRange.end)}`;
    };

    // ==========================================
    // PERIOD CHANGE
    // ==========================================

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
    };

    // ==========================================
    // STATISTIC MAXIMUMS
    // ==========================================

    const reservationMaximum = Math.max(
        Number(summary.confirmedReservations) || 0,
        Number(summary.completedReservations) || 0,
        Number(summary.pendingReservations) || 0,
        Number(summary.cancelledReservations) || 0,
        1
    );

    const paymentMaximum = Math.max(
        Number(summary.paidPayments) || 0,
        Number(summary.pendingPayments) || 0,
        Number(summary.rejectedPayments) || 0,
        Number(summary.refundedPayments) || 0,
        1
    );

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="mx-auto w-full space-y-8 px-2 py-6 sm:px-4 sm:py-8 lg:px-6 xl:px-8">

            {/* ================================== */}
            {/* PAGE HEADER */}
            {/* ================================== */}

            <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-600">
                        Business Insights
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Reports & Analytics
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Monitor revenue, reservations, and payment activity
                        through detailed business reports.
                    </p>
                </div>

                <button
                    onClick={loadReport}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />

                    Refresh Report
                </button>
            </div>

            {/* ================================== */}
            {/* REPORT FILTERS */}
            {/* ================================== */}

            <section className="space-y-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Report Filters
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Choose a reporting period and date.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                        {/* PERIOD SELECTOR */}

                        <div className="w-full flex-1">
                            <label className="mb-3 block text-sm font-semibold text-slate-700">
                                Report Period
                            </label>

                            <div className="grid grid-cols-3 gap-3">
                                <PeriodButton
                                    active={period === "daily"}
                                    onClick={() => handlePeriodChange("daily")}
                                    icon={Clock}
                                    label="Daily"
                                />

                                <PeriodButton
                                    active={period === "weekly"}
                                    onClick={() => handlePeriodChange("weekly")}
                                    icon={CalendarRange}
                                    label="Weekly"
                                />

                                <PeriodButton
                                    active={period === "monthly"}
                                    onClick={() => handlePeriodChange("monthly")}
                                    icon={CalendarDays}
                                    label="Monthly"
                                />
                            </div>
                        </div>

                        {/* DATE SELECTOR */}

                        <div className="w-full lg:max-w-xs">
                            <label className="mb-3 block text-sm font-semibold text-slate-700">
                                Select Date
                            </label>

                            <input
                                type="date"
                                value={selectedDate}
                                max={getToday()}
                                onChange={(event) => setSelectedDate(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </div>

                    {/* SELECTED REPORT PERIOD */}

                    <div className="mt-7 flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-bold text-emerald-800">
                                {reportPeriodLabel[period]}
                            </p>

                            <p className="mt-1 text-sm text-emerald-700">
                                {loading
                                    ? "Generating report..."
                                    : getRangeDescription() || "Select a reporting date"}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                            <CalendarDays size={16} />
                            <span>
                                {period.charAt(0).toUpperCase() + period.slice(1)} View
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================== */}
            {/* ERROR MESSAGE */}
            {/* ================================== */}

            {error && (
                <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-semibold text-red-800">
                            Unable to Generate Report
                        </p>

                        <p className="mt-1 text-sm text-red-700">
                            {error}
                        </p>
                    </div>

                    <button
                        onClick={loadReport}
                        disabled={loading}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                        <RefreshCw size={15} />
                        Try Again
                    </button>
                </div>
            )}

            {/* ================================== */}
            {/* SUMMARY CARDS */}
            {/* ================================== */}

            <section className="space-y-5">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Performance Overview
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Key financial and reservation metrics for this period.
                    </p>
                </div>

                {loading && !report ? (
                    <SummarySkeleton />
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            title="Total Revenue"
                            value={formatCurrency(summary.totalRevenue)}
                            subtitle="From paid payments"
                            icon={Wallet}
                            color="emerald"
                        />

                        <SummaryCard
                            title="Total Reservations"
                            value={summary.totalReservations || 0}
                            subtitle="Reservations within this period"
                            icon={CalendarDays}
                            color="blue"
                        />

                        <SummaryCard
                            title="Paid Payments"
                            value={summary.paidPayments || 0}
                            subtitle="Successful payments"
                            icon={CheckCircle}
                            color="emerald"
                        />

                        <SummaryCard
                            title="Pending Payments"
                            value={summary.pendingPayments || 0}
                            subtitle="Awaiting confirmation"
                            icon={Clock}
                            color="amber"
                        />
                    </div>
                )}
            </section>

            {/* ================================== */}
            {/* REVENUE CHART */}
            {/* ================================== */}

            <section>
                <ChartCard
                    title="Revenue Overview"
                    description="Paid payment revenue for the selected reporting period."
                >
                    <div className="h-[320px] w-full sm:h-[360px]">
                        {loading && !report ? (
                            <ChartSkeleton />
                        ) : revenueData.length === 0 ? (
                            <EmptyChart message="No revenue data available." />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={revenueData}
                                    margin={{
                                        top: 15,
                                        right: 20,
                                        left: 10,
                                        bottom: 10
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#e2e8f0"
                                    />

                                    <XAxis
                                        dataKey="label"
                                        tick={{
                                            fontSize: 11,
                                            fill: "#64748b"
                                        }}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                        tickLine={false}
                                        interval={period === "monthly" ? 2 : 0}
                                    />

                                    <YAxis
                                        tickFormatter={(value) =>
                                            `₱${Number(value).toLocaleString("en-PH")}`
                                        }
                                        tick={{
                                            fontSize: 11,
                                            fill: "#64748b"
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={85}
                                    />

                                    <Tooltip
                                        formatter={(value) => [
                                            formatCurrency(value),
                                            "Revenue"
                                        ]}
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid #e2e8f0",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                        }}
                                        labelStyle={{
                                            color: "#0f172a",
                                            fontWeight: 600
                                        }}
                                    />

                                    <Bar
                                        dataKey="value"
                                        name="Revenue"
                                        fill="#10b981"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={45}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </ChartCard>
            </section>

            {/* ================================== */}
            {/* RESERVATIONS CHART */}
            {/* ================================== */}

            <section>
                <ChartCard
                    title="Reservation Overview"
                    description="Number of reservations by hour or day, depending on the selected period."
                >
                    <div className="h-[320px] w-full sm:h-[360px]">
                        {loading && !report ? (
                            <ChartSkeleton />
                        ) : bookingData.length === 0 ? (
                            <EmptyChart message="No reservation data available." />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={bookingData}
                                    margin={{
                                        top: 15,
                                        right: 20,
                                        left: 10,
                                        bottom: 10
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#e2e8f0"
                                    />

                                    <XAxis
                                        dataKey="label"
                                        tick={{
                                            fontSize: 11,
                                            fill: "#64748b"
                                        }}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                        tickLine={false}
                                        interval={period === "monthly" ? 2 : 0}
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                        tick={{
                                            fontSize: 11,
                                            fill: "#64748b"
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <Tooltip
                                        formatter={(value) => [
                                            value,
                                            "Reservations"
                                        ]}
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid #e2e8f0",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                        }}
                                    />

                                    <Bar
                                        dataKey="value"
                                        name="Reservations"
                                        fill="#0f766e"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={45}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </ChartCard>
            </section>

            {/* ================================== */}
            {/* RESERVATION AND PAYMENT STATISTICS */}
            {/* ================================== */}

            <section className="space-y-5">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Transaction Statistics
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Breakdown of reservation and payment statuses.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                    {/* RESERVATION STATISTICS */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <CalendarDays size={21} />
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900">
                                    Reservation Statistics
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Reservation status breakdown.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-6">
                            <StatisticRow
                                label="Confirmed"
                                value={summary.confirmedReservations}
                                color="bg-blue-500"
                                maxValue={reservationMaximum}
                            />

                            <StatisticRow
                                label="Completed"
                                value={summary.completedReservations}
                                color="bg-emerald-500"
                                maxValue={reservationMaximum}
                            />

                            <StatisticRow
                                label="Pending"
                                value={summary.pendingReservations}
                                color="bg-amber-500"
                                maxValue={reservationMaximum}
                            />

                            <StatisticRow
                                label="Cancelled"
                                value={summary.cancelledReservations}
                                color="bg-red-500"
                                maxValue={reservationMaximum}
                            />
                        </div>
                    </div>

                    {/* PAYMENT STATISTICS */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <CreditCard size={21} />
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900">
                                    Payment Statistics
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Payment status and collection breakdown.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-6">
                            <StatisticRow
                                label="Paid"
                                value={summary.paidPayments}
                                color="bg-emerald-500"
                                maxValue={paymentMaximum}
                            />

                            <StatisticRow
                                label="Pending"
                                value={summary.pendingPayments}
                                color="bg-amber-500"
                                maxValue={paymentMaximum}
                            />

                            <StatisticRow
                                label="Rejected"
                                value={summary.rejectedPayments}
                                color="bg-red-500"
                                maxValue={paymentMaximum}
                            />

                            <StatisticRow
                                label="Refunded"
                                value={summary.refundedPayments}
                                color="bg-slate-500"
                                maxValue={paymentMaximum}
                            />
                        </div>

                        <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-5">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-medium text-slate-500">
                                    Refunded Amount
                                </span>

                                <span className="text-lg font-bold text-slate-900">
                                    {formatCurrency(summary.refundedAmount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================== */}
            {/* PAYMENT METHOD BREAKDOWN */}
            {/* ================================== */}

            <section className="space-y-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Payment Method Breakdown
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Recorded payment methods for the selected reporting period.
                    </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 sm:px-7">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <CreditCard size={21} />
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-900">
                                Payment Methods
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                Transaction collection summary.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[550px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-6 py-5">
                                        Payment Method
                                    </th>

                                    <th className="px-6 py-5">
                                        Transactions
                                    </th>

                                    <th className="px-6 py-5">
                                        Paid Amount
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading && !report ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <tr key={index} className="animate-pulse">
                                            <td className="px-6 py-5">
                                                <div className="h-4 w-28 rounded bg-slate-200" />
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="h-4 w-16 rounded bg-slate-100" />
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="h-4 w-28 rounded bg-slate-200" />
                                            </td>
                                        </tr>
                                    ))
                                ) : Object.entries(paymentMethods).length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                                                <CreditCard
                                                    size={22}
                                                    className="text-slate-400"
                                                />
                                            </div>

                                            <p className="mt-3 font-semibold text-slate-700">
                                                No Payment Method Records
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Payment method data will appear here when available.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    Object.entries(paymentMethods).map(([method, data]) => (
                                        <tr
                                            key={method}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-5 font-semibold text-slate-800">
                                                {method}
                                            </td>

                                            <td className="px-6 py-5 text-slate-600">
                                                {data.count || 0}
                                            </td>

                                            <td className="px-6 py-5 font-bold text-slate-900">
                                                {formatCurrency(data.amount)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-7">
                        <p className="text-xs text-slate-500">
                            Payment method totals are based on the report data returned by the server.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Reports;
