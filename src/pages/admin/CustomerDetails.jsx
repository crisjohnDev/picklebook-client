
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    UserRound,
    Phone,
    CalendarDays,
    CheckCircle2,
    XCircle,
    Clock,
    CircleDollarSign,
    LoaderCircle,
    RefreshCw,
    CalendarCheck,
    Building2
} from "lucide-react";

import customerService from "../../services/customerService";

// ==========================================
// FORMAT HELPERS
// ==========================================

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(Number(amount || 0));
};

const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
};

// ==========================================
// STATUS STYLES
// ==========================================

const reservationStatusStyle = {
    Pending: "border-amber-200 bg-amber-50 text-amber-700",
    Confirmed: "border-blue-200 bg-blue-50 text-blue-700",
    Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Cancelled: "border-red-200 bg-red-50 text-red-700"
};

const paymentStatusStyle = {
    Unpaid: "border-amber-200 bg-amber-50 text-amber-700",
    Paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Refunded: "border-slate-200 bg-slate-100 text-slate-600"
};

// ==========================================
// LOADING SKELETON
// ==========================================

const Skeleton = ({ className = "" }) => (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
);

const CustomerDetailsSkeleton = () => (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">

        {/* HEADER SKELETON */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="space-y-3">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-80 max-w-full" />
            </div>

            <Skeleton className="h-11 w-32 rounded-xl" />
        </div>

        {/* PROFILE SKELETON */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Skeleton className="h-20 w-20 rounded-2xl" />

                <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-52" />
                    <Skeleton className="h-4 w-32" />
                    <div className="flex flex-wrap gap-4">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
            </div>
        </div>

        {/* STATISTICS SKELETON */}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
                >
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-11 w-11 rounded-xl" />
                    </div>

                    <Skeleton className="mt-5 h-9 w-20" />
                    <Skeleton className="mt-3 h-3 w-28" />
                </div>
            ))}
        </div>

        {/* HISTORY SKELETON */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 h-4 w-64" />
            </div>

            <div className="space-y-5 p-6 sm:p-7">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 last:border-0 sm:flex-row sm:items-center"
                    >
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ==========================================
// STATISTIC CARD
// ==========================================

const StatisticCard = ({
    title,
    value,
    description,
    icon: Icon,
    color
}) => {
    const colors = {
        blue: {
            background: "bg-blue-50",
            icon: "text-blue-600",
            value: "text-blue-600"
        },
        emerald: {
            background: "bg-emerald-50",
            icon: "text-emerald-600",
            value: "text-emerald-600"
        },
        red: {
            background: "bg-red-50",
            icon: "text-red-500",
            value: "text-red-500"
        },
        amber: {
            background: "bg-amber-50",
            icon: "text-amber-600",
            value: "text-amber-600"
        },
        violet: {
            background: "bg-violet-50",
            icon: "text-violet-600",
            value: "text-violet-600"
        }
    };

    const selectedColor = colors[color] || colors.blue;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-7">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                    {title}
                </p>

                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${selectedColor.background} ${selectedColor.icon}`}>
                    <Icon size={22} />
                </div>
            </div>

            <h3 className={`mt-5 text-3xl font-bold tabular-nums ${selectedColor.value}`}>
                {value}
            </h3>

            <p className="mt-2 text-xs text-slate-400">
                {description}
            </p>
        </div>
    );
};

// ==========================================
// MAIN CUSTOMER DETAILS COMPONENT
// ==========================================

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [reservations, setReservations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // LOAD CUSTOMER PROFILE
    // ==========================================

    const loadCustomer = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await customerService.getCustomerById(id);

            setCustomer(response.customer);
            setStatistics(response.statistics);
            setReservations(response.reservations || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load customer profile."
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadCustomer();
    }, [loadCustomer]);

    // ==========================================
    // LOADING STATE
    // ==========================================

    if (loading && !customer) {
        return <CustomerDetailsSkeleton />;
    }

    // ==========================================
    // ERROR / CUSTOMER NOT FOUND
    // ==========================================

    if (error || !customer) {
        return (
            <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">

                <button
                    onClick={() => navigate("/admin/customers")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
                >
                    <ArrowLeft size={17} />
                    Back to Customers
                </button>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                    <div className="flex items-start gap-3">
                        <XCircle
                            size={20}
                            className="mt-0.5 shrink-0 text-red-600"
                        />

                        <div>
                            <h2 className="font-bold text-red-800">
                                Unable to load customer profile
                            </h2>

                            <p className="mt-1 text-sm text-red-700">
                                {error || "Customer not found."}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={loadCustomer}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Try Again
                </button>
            </div>
        );
    }

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">

            {/* ================================== */}
            {/* PAGE HEADER */}
            {/* ================================== */}

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                    <Link
                        to="/admin/customers"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
                    >
                        <ArrowLeft size={16} />
                        Back to Customers
                    </Link>

                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-600">
                        Customer Relations
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Customer Profile
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        View customer information and reservation history.
                    </p>
                </div>

                <button
                    onClick={loadCustomer}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* ================================== */}
            {/* CUSTOMER INFORMATION */}
            {/* ================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                    {/* PROFILE ICON */}

                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <UserRound size={38} />
                    </div>

                    {/* CUSTOMER DETAILS */}

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {customer.fullName}
                            </h2>

                            <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                    customer.isActive
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-red-200 bg-red-50 text-red-700"
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        customer.isActive
                                            ? "bg-emerald-500"
                                            : "bg-red-500"
                                    }`}
                                />

                                {customer.isActive
                                    ? "Active Account"
                                    : "Inactive Account"}
                            </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                            @{customer.username}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4 text-sm text-slate-500">

                            <span className="flex items-center gap-2">
                                <Phone
                                    size={16}
                                    className="text-slate-400"
                                />

                                {customer.phone || "No phone number"}
                            </span>

                            <span className="flex items-center gap-2">
                                <CalendarDays
                                    size={16}
                                    className="text-slate-400"
                                />

                                Joined {formatDate(customer.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================================== */}
            {/* CUSTOMER STATISTICS */}
            {/* ================================== */}

            <div>
                <div className="mb-5">
                    <h2 className="text-lg font-bold text-slate-900">
                        Customer Statistics
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Overview of this customer's booking activity and payments.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">

                    {/* TOTAL BOOKINGS */}

                    <StatisticCard
                        title="Total Bookings"
                        value={statistics?.totalBookings || 0}
                        description="All customer reservations"
                        icon={CalendarDays}
                        color="blue"
                    />

                    {/* COMPLETED */}

                    <StatisticCard
                        title="Completed"
                        value={statistics?.completedBookings || 0}
                        description="Successfully completed bookings"
                        icon={CheckCircle2}
                        color="emerald"
                    />

                    {/* CANCELLED */}

                    <StatisticCard
                        title="Cancelled"
                        value={statistics?.cancelledBookings || 0}
                        description="Cancelled reservations"
                        icon={XCircle}
                        color="red"
                    />

                    {/* PENDING */}

                    <StatisticCard
                        title="Pending"
                        value={statistics?.pendingBookings || 0}
                        description="Awaiting reservation confirmation"
                        icon={Clock}
                        color="amber"
                    />

                    {/* CONFIRMED */}

                    <StatisticCard
                        title="Confirmed"
                        value={statistics?.confirmedBookings || 0}
                        description="Confirmed court reservations"
                        icon={CalendarCheck}
                        color="blue"
                    />

                    {/* TOTAL PAID */}

                    <StatisticCard
                        title="Total Paid"
                        value={formatCurrency(statistics?.totalSpent)}
                        description="Total completed payments"
                        icon={CircleDollarSign}
                        color="violet"
                    />
                </div>
            </div>

            {/* ================================== */}
            {/* BOOKING HISTORY */}
            {/* ================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* TABLE HEADER */}

                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:px-7">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Booking History
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            All reservations made by this customer.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <CalendarDays size={15} />
                        {reservations.length} Reservation(s)
                    </div>
                </div>

                {/* EMPTY STATE */}

                {reservations.length === 0 ? (
                    <div className="px-6 py-20 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <CalendarDays size={32} />
                        </div>

                        <h3 className="font-bold text-slate-800">
                            No booking history
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            This customer has not made any reservations yet.
                        </p>
                    </div>
                ) : (

                    /* RESERVATION TABLE */

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px] text-left text-sm">

                            {/* TABLE HEAD */}

                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-6 py-5 font-semibold">
                                        Reservation Date
                                    </th>

                                    <th className="px-6 py-5 font-semibold">
                                        Court
                                    </th>

                                    <th className="px-6 py-5 font-semibold">
                                        Time
                                    </th>

                                    <th className="px-6 py-5 font-semibold">
                                        Duration
                                    </th>

                                    <th className="px-6 py-5 font-semibold">
                                        Amount
                                    </th>

                                    <th className="px-6 py-5 font-semibold">
                                        Reservation Status
                                    </th>

                                    <th className="px-6 py-5 font-semibold">
                                        Payment
                                    </th>
                                </tr>
                            </thead>

                            {/* TABLE BODY */}

                            <tbody className="divide-y divide-slate-100">
                                {reservations.map((reservation) => (
                                    <tr
                                        key={reservation._id}
                                        className="transition hover:bg-slate-50"
                                    >

                                        {/* RESERVATION DATE */}

                                        <td className="px-6 py-5 font-medium text-slate-800">
                                            {formatDate(reservation.reservationDate)}
                                        </td>

                                        {/* COURT */}

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Building2
                                                    size={16}
                                                    className="shrink-0 text-emerald-600"
                                                />

                                                <div>
                                                    <div className="font-semibold text-slate-800">
                                                        {reservation.court?.name || "Court unavailable"}
                                                    </div>

                                                    <div className="mt-1 text-xs text-slate-500">
                                                        {reservation.court?.courtNumber || "—"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* TIME */}

                                        <td className="px-6 py-5 text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Clock
                                                    size={14}
                                                    className="text-slate-400"
                                                />

                                                {reservation.startTime} - {reservation.endTime}
                                            </div>
                                        </td>

                                        {/* DURATION */}

                                        <td className="px-6 py-5 text-slate-600">
                                            {Number(reservation.duration || 0)} hour(s)
                                        </td>

                                        {/* AMOUNT */}

                                        <td className="px-6 py-5 font-semibold text-slate-800">
                                            {formatCurrency(reservation.totalAmount)}
                                        </td>

                                        {/* RESERVATION STATUS */}

                                        <td className="px-6 py-5">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                                    reservationStatusStyle[reservation.status] ||
                                                    "border-slate-200 bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {reservation.status}
                                            </span>
                                        </td>

                                        {/* PAYMENT STATUS */}

                                        <td className="px-6 py-5">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                                    paymentStatusStyle[reservation.paymentStatus] ||
                                                    "border-slate-200 bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {reservation.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetails;
