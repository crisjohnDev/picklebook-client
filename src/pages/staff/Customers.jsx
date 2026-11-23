
import { useCallback, useEffect, useState } from "react";

import {
    Users,
    Search,
    RefreshCw,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    UserRound,
    Phone,
    CalendarDays,
    Clock,
    Building2,
    PhilippinePeso,
    CheckCircle2,
    XCircle,
    Clock3,
    Loader2,
    ClipboardList,
    CreditCard,
    AlertCircle,
    ArrowLeft,
    History
} from "lucide-react";

import staffCustomerService from "../../services/staffCustomerService";

// ==========================================
// FORMAT HELPERS
// ==========================================

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(Number(amount || 0));
};

const formatDate = (value) => {
    if (!value) return "N/A";

    return new Date(value).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

const formatTime = (value) => {
    if (!value) return "N/A";

    const [hours, minutes] = value.split(":").map(Number);
    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
};

// ==========================================
// STATUS STYLES
// ==========================================

const reservationStatusStyle = (status) => {
    const styles = {
        Pending: "bg-amber-50 text-amber-700 border-amber-200",
        Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Completed: "bg-blue-50 text-blue-700 border-blue-200",
        Cancelled: "bg-red-50 text-red-700 border-red-200"
    };

    return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
};

const paymentStatusStyle = (status) => {
    const styles = {
        Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Unpaid: "bg-amber-50 text-amber-700 border-amber-200",
        Refunded: "bg-purple-50 text-purple-700 border-purple-200"
    };

    return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
};

// ==========================================
// STATISTIC CARD
// ==========================================

const StatisticCard = ({ label, value, icon: Icon, color }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">
                {label}
            </p>

            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon size={19} />
            </div>
        </div>

        <p className="mt-3 text-2xl font-bold text-slate-900">
            {value}
        </p>
    </div>
);

// ==========================================
// CUSTOMER PROFILE
// ==========================================

const CustomerProfile = ({ customerId, onBack }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch selected customer profile.
    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await staffCustomerService.getCustomerProfile(customerId);

            setProfile(response);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load customer profile."
            );
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <Loader2
                        size={32}
                        className="mx-auto mb-3 animate-spin text-emerald-600"
                    />
                    <p className="text-sm text-slate-500">
                        Loading customer profile...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !profile?.customer) {
        return (
            <div className="space-y-5">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600"
                >
                    <ArrowLeft size={17} />
                    Back to Customers
                </button>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    {error || "Customer profile not found."}
                </div>
            </div>
        );
    }

    const { customer, statistics, reservations } = profile;

    return (
        <div className="space-y-7">

            {/* PROFILE HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <button
                        type="button"
                        onClick={onBack}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
                    >
                        <ArrowLeft size={17} />
                        Back to Customers
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                            <UserRound size={30} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {customer.fullName}
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Customer Profile
                            </p>
                        </div>
                    </div>
                </div>

                <span className={`w-fit rounded-full border px-4 py-2 text-xs font-semibold ${
                    customer.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                }`}>
                    {customer.isActive ? "Active Account" : "Inactive Account"}
                </span>
            </div>

            {/* CUSTOMER INFORMATION */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-2">
                    <UserRound size={19} className="text-emerald-600" />

                    <h2 className="font-bold text-slate-900">
                        Personal Information
                    </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <p className="text-xs text-slate-400">
                            Full Name
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                            {customer.fullName}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">
                            Username
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                            {customer.username}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">
                            Phone Number
                        </p>

                        <p className="mt-1 flex items-center gap-2 font-semibold text-slate-800">
                            <Phone size={15} className="text-slate-400" />
                            {customer.phone || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">
                            Customer Since
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                            {formatDate(customer.createdAt)}
                        </p>
                    </div>
                </div>
            </section>

            {/* BOOKING STATISTICS */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                <StatisticCard
                    label="Total Bookings"
                    value={statistics.totalBookings}
                    icon={ClipboardList}
                    color="bg-blue-50 text-blue-600"
                />

                <StatisticCard
                    label="Completed"
                    value={statistics.completedBookings}
                    icon={CheckCircle2}
                    color="bg-emerald-50 text-emerald-600"
                />

                <StatisticCard
                    label="Confirmed"
                    value={statistics.confirmedBookings}
                    icon={CalendarDays}
                    color="bg-indigo-50 text-indigo-600"
                />

                <StatisticCard
                    label="Pending"
                    value={statistics.pendingBookings}
                    icon={Clock3}
                    color="bg-amber-50 text-amber-600"
                />

                <StatisticCard
                    label="Cancelled"
                    value={statistics.cancelledBookings}
                    icon={XCircle}
                    color="bg-red-50 text-red-600"
                />

                <StatisticCard
                    label="Total Paid"
                    value={formatCurrency(statistics.totalSpent)}
                    icon={PhilippinePeso}
                    color="bg-purple-50 text-purple-600"
                />
            </div>

            {/* BOOKING HISTORY */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
                    <div>
                        <h2 className="flex items-center gap-2 font-bold text-slate-900">
                            <History size={19} className="text-emerald-600" />
                            Booking History
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            All reservations made by this customer.
                        </p>
                    </div>

                    <span className="w-fit rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                        {reservations.length} booking(s)
                    </span>
                </div>

                {reservations.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <CalendarDays
                            size={36}
                            className="mx-auto mb-3 text-slate-300"
                        />

                        <p className="font-semibold text-slate-700">
                            No booking history
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                            This customer has not made any reservations yet.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <th className="px-5 py-4">Court</th>
                                    <th className="px-5 py-4">Date & Time</th>
                                    <th className="px-5 py-4">Amount</th>
                                    <th className="px-5 py-4">Reservation</th>
                                    <th className="px-5 py-4">Payment</th>
                                    <th className="px-5 py-4">Created By</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {reservations.map((reservation) => (
                                    <tr
                                        key={reservation._id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-800">
                                                {reservation.court?.name || "Unknown court"}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Court {reservation.court?.courtNumber || "N/A"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-slate-800">
                                                {formatDate(reservation.reservationDate)}
                                            </p>

                                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                <Clock size={13} />
                                                {formatTime(reservation.startTime)}
                                                {" - "}
                                                {formatTime(reservation.endTime)}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-sm font-bold text-slate-800">
                                            {formatCurrency(reservation.totalAmount)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${reservationStatusStyle(reservation.status)}`}>
                                                {reservation.status}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${paymentStatusStyle(reservation.paymentStatus)}`}>
                                                {reservation.paymentStatus}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {reservation.createdBy?.fullName || "Customer / System"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

// ==========================================
// MAIN CUSTOMER DIRECTORY
// ==========================================

const Customers = () => {

    // ==========================================
    // STATES
    // ==========================================

    const [customers, setCustomers] = useState([]);
    const [summary, setSummary] = useState({
        totalCustomers: 0,
        activeCustomers: 0,
        inactiveCustomers: 0
    });

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        limit: 10
    });

    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // FETCH CUSTOMERS
    // ==========================================

    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await staffCustomerService.getCustomers({
                search,
                status,
                page,
                limit: 10
            });

            setCustomers(response.customers || []);

            setSummary(response.summary || {
                totalCustomers: 0,
                activeCustomers: 0,
                inactiveCustomers: 0
            });

            setPagination(response.pagination || {
                total: 0,
                totalPages: 0,
                limit: 10
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load customers."
            );
        } finally {
            setLoading(false);
        }
    }, [search, status, page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchCustomers]);

    // ==========================================
    // SHOW CUSTOMER PROFILE
    // ==========================================

    if (selectedCustomerId) {
        return (
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 xl:px-8 xl:py-10">
                <CustomerProfile
                    customerId={selectedCustomerId}
                    onBack={() => setSelectedCustomerId(null)}
                />
            </div>
        );
    }

    // ==========================================
    // RENDER CUSTOMER DIRECTORY
    // ==========================================

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 xl:px-8 xl:py-10">

            {/* HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
                        <Users size={16} />
                        Staff Operations
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Customers
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        View customer profiles and their reservation history.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchCustomers}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* SUMMARY */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatisticCard
                    label="Total Customers"
                    value={summary.totalCustomers}
                    icon={Users}
                    color="bg-blue-50 text-blue-600"
                />

                <StatisticCard
                    label="Active Customers"
                    value={summary.activeCustomers}
                    icon={CheckCircle2}
                    color="bg-emerald-50 text-emerald-600"
                />

                <StatisticCard
                    label="Inactive Customers"
                    value={summary.inactiveCustomers}
                    icon={XCircle}
                    color="bg-red-50 text-red-600"
                />
            </div>

            {/* SEARCH AND FILTER */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                    <Search size={18} className="text-emerald-600" />

                    <h2 className="font-bold text-slate-900">
                        Find Customers
                    </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Search name, username, or phone..."
                            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value);
                            setPage(1);
                        }}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
                    >
                        <option value="All">All Customer Accounts</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </section>

            {/* CUSTOMER TABLE */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
                    <div>
                        <h2 className="font-bold text-slate-900">
                            Customer Directory
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            {pagination.total} customer(s) found
                        </p>
                    </div>

                    <span className="text-xs text-slate-400">
                        Page {page} of {Math.max(1, pagination.totalPages)}
                    </span>
                </div>

                {error && (
                    <div className="m-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle size={17} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex min-h-[250px] items-center justify-center">
                        <div className="text-center">
                            <Loader2
                                size={30}
                                className="mx-auto mb-3 animate-spin text-emerald-600"
                            />

                            <p className="text-sm text-slate-500">
                                Loading customers...
                            </p>
                        </div>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <Users
                            size={38}
                            className="mx-auto mb-3 text-slate-300"
                        />

                        <h3 className="font-semibold text-slate-700">
                            No customers found
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                            Try another search term or account filter.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* DESKTOP TABLE */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Bookings</th>
                                        <th className="px-6 py-4">Completed</th>
                                        <th className="px-6 py-4">Account</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {customers.map((customer) => (
                                        <tr
                                            key={customer._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                                        <UserRound size={19} />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {customer.fullName}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            @{customer.username}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {customer.phone || "Not provided"}
                                            </td>

                                            <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                                                {customer.totalBookings}
                                            </td>

                                            <td className="px-6 py-4 text-sm font-semibold text-emerald-700">
                                                {customer.completedBookings}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                                    customer.isActive
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : "border-red-200 bg-red-50 text-red-700"
                                                }`}>
                                                    {customer.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedCustomerId(customer._id)}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                                                >
                                                    <Eye size={15} />
                                                    View Profile
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CUSTOMER CARDS */}
                        <div className="space-y-3 p-4 md:hidden">
                            {customers.map((customer) => (
                                <div
                                    key={customer._id}
                                    className="rounded-xl border border-slate-200 p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                            <UserRound size={20} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-900">
                                                {customer.fullName}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                @{customer.username}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {customer.phone || "No phone number"}
                                            </p>
                                        </div>

                                        <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${
                                            customer.isActive
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : "border-red-200 bg-red-50 text-red-700"
                                        }`}>
                                            {customer.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Total Bookings
                                            </p>

                                            <p className="mt-1 font-bold text-slate-800">
                                                {customer.totalBookings}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Completed
                                            </p>

                                            <p className="mt-1 font-bold text-emerald-700">
                                                {customer.completedBookings}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedCustomerId(customer._id)}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white hover:bg-emerald-700"
                                    >
                                        <Eye size={15} />
                                        View Customer Profile
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* PAGINATION */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 p-4 sm:px-6">
                        <p className="text-xs text-slate-500">
                            Page {page} of {pagination.totalPages}
                        </p>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((previous) => previous - 1)}
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <button
                                type="button"
                                disabled={page >= pagination.totalPages}
                                onClick={() => setPage((previous) => previous + 1)}
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Customers;
