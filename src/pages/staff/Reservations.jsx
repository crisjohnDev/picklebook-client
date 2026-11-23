
import { useCallback, useEffect, useState } from "react";

import {
    CalendarDays,
    Clock,
    Search,
    RefreshCw,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    UserRound,
    Building2,
    Phone,
    CreditCard,
    PhilippinePeso,
    CalendarCheck,
    Filter,
    Loader2,
    ClipboardList
} from "lucide-react";

import staffReservationService from "../../services/staffReservationService";

// ==========================================
// HELPERS
// ==========================================

const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    return date.toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric"
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

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(Number(value || 0));
};

const getStatusStyle = (status) => {
    const styles = {
        Pending: "bg-amber-50 text-amber-700 border-amber-200",
        Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Completed: "bg-blue-50 text-blue-700 border-blue-200",
        Cancelled: "bg-red-50 text-red-700 border-red-200"
    };

    return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
};

const getPaymentStyle = (status) => {
    const styles = {
        Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Unpaid: "bg-amber-50 text-amber-700 border-amber-200",
        Refunded: "bg-purple-50 text-purple-700 border-purple-200"
    };

    return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
};

// ==========================================
// RESERVATION DETAILS MODAL
// ==========================================

const ReservationDetails = ({ reservation, onClose }) => {
    if (!reservation) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                            Reservation Details
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            Booking Information
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6 p-5 sm:p-6">

                    {/* Reservation Status */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(reservation.status)}`}>
                            {reservation.status}
                        </span>

                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPaymentStyle(reservation.paymentStatus)}`}>
                            {reservation.paymentStatus}
                        </span>
                    </div>

                    {/* Customer */}
                    <section>
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
                            <UserRound size={17} className="text-emerald-600" />
                            Customer Information
                        </h3>

                        <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-slate-400">
                                    Full Name
                                </p>

                                <p className="mt-1 font-semibold text-slate-800">
                                    {reservation.customer?.fullName || "Unknown customer"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Phone Number
                                </p>

                                <p className="mt-1 flex items-center gap-2 font-semibold text-slate-800">
                                    <Phone size={14} className="text-slate-400" />
                                    {reservation.customer?.phone || "Not provided"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Username
                                </p>

                                <p className="mt-1 font-semibold text-slate-800">
                                    {reservation.customer?.username || "N/A"}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Court and Schedule */}
                    <section>
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
                            <CalendarCheck size={17} className="text-emerald-600" />
                            Booking Schedule
                        </h3>

                        <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-slate-400">
                                    Court
                                </p>

                                <p className="mt-1 flex items-center gap-2 font-semibold text-slate-800">
                                    <Building2 size={15} className="text-slate-400" />
                                    {reservation.court?.name || "Unknown court"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Court {reservation.court?.courtNumber || "N/A"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Reservation Date
                                </p>

                                <p className="mt-1 flex items-center gap-2 font-semibold text-slate-800">
                                    <CalendarDays size={15} className="text-slate-400" />
                                    {formatDate(reservation.reservationDate)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Start Time
                                </p>

                                <p className="mt-1 font-semibold text-slate-800">
                                    {formatTime(reservation.startTime)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    End Time
                                </p>

                                <p className="mt-1 font-semibold text-slate-800">
                                    {formatTime(reservation.endTime)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Duration
                                </p>

                                <p className="mt-1 font-semibold text-slate-800">
                                    {reservation.duration || "N/A"} hour(s)
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Total Amount
                                </p>

                                <p className="mt-1 flex items-center gap-1 font-bold text-emerald-700">
                                    <PhilippinePeso size={15} />
                                    {formatCurrency(reservation.totalAmount)}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Payment */}
                    <section>
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
                            <CreditCard size={17} className="text-emerald-600" />
                            Payment Information
                        </h3>

                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">
                                    Payment Status
                                </span>

                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPaymentStyle(reservation.paymentStatus)}`}>
                                    {reservation.paymentStatus}
                                </span>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">
                                    Amount Due / Paid
                                </span>

                                <span className="font-bold text-slate-900">
                                    {formatCurrency(reservation.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Notes */}
                    {reservation.notes && (
                        <section>
                            <h3 className="mb-2 text-sm font-bold text-slate-900">
                                Reservation Notes
                            </h3>

                            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                                {reservation.notes}
                            </p>
                        </section>
                    )}

                    {/* Created By */}
                    <div className="border-t border-slate-100 pt-4">
                        <p className="text-xs text-slate-400">
                            Created By
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                            {reservation.createdBy?.fullName || "Customer / System"}
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-100 p-5 sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const Reservations = () => {

    // ==========================================
    // STATES
    // ==========================================

    const [reservations, setReservations] = useState([]);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [paymentStatus, setPaymentStatus] = useState("All");
    const [date, setDate] = useState("");

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        limit: 10
    });

    const [selectedReservation, setSelectedReservation] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // FETCH RESERVATIONS
    // ==========================================

    const fetchReservations = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await staffReservationService.getReservations({
                search,
                status,
                paymentStatus,
                date,
                page,
                limit: 10
            });

            setReservations(response.reservations || []);

            setPagination(
                response.pagination || {
                    total: 0,
                    totalPages: 0,
                    limit: 10
                }
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load reservations."
            );
        } finally {
            setLoading(false);
        }
    }, [search, status, paymentStatus, date, page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReservations();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchReservations]);

    // ==========================================
    // FILTER HANDLERS
    // ==========================================

    const resetFilters = () => {
        setSearch("");
        setStatus("All");
        setPaymentStatus("All");
        setDate("");
        setPage(1);
    };

    // ==========================================
    // SUMMARY COUNTS
    // ==========================================

    const summary = {
        total: pagination.total,
        pending: reservations.filter(
            (item) => item.status === "Pending"
        ).length,
        confirmed: reservations.filter(
            (item) => item.status === "Confirmed"
        ).length,
        paid: reservations.filter(
            (item) => item.paymentStatus === "Paid"
        ).length
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 xl:px-8 xl:py-10">

            {/* HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
                        <ClipboardList size={16} />
                        Staff Operations
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Reservations
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Monitor customer bookings, schedules, and payment information.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchReservations}
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

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Total Reservations
                    </p>

                    <p className="mt-3 text-2xl font-bold text-slate-900">
                        {summary.total}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Pending on This Page
                    </p>

                    <p className="mt-3 text-2xl font-bold text-amber-600">
                        {summary.pending}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Confirmed on This Page
                    </p>

                    <p className="mt-3 text-2xl font-bold text-emerald-600">
                        {summary.confirmed}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Paid on This Page
                    </p>

                    <p className="mt-3 text-2xl font-bold text-blue-600">
                        {summary.paid}
                    </p>
                </div>
            </div>

            {/* FILTERS */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-2">
                    <Filter size={18} className="text-emerald-600" />

                    <h2 className="font-bold text-slate-900">
                        Search and Filters
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                    {/* SEARCH */}
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
                            placeholder="Customer, phone, or ID"
                            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    {/* RESERVATION STATUS */}
                    <select
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value);
                            setPage(1);
                        }}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
                    >
                        <option value="All">All Reservation Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    {/* PAYMENT STATUS */}
                    <select
                        value={paymentStatus}
                        onChange={(event) => {
                            setPaymentStatus(event.target.value);
                            setPage(1);
                        }}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
                    >
                        <option value="All">All Payment Statuses</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Refunded">Refunded</option>
                    </select>

                    {/* DATE */}
                    <input
                        type="date"
                        value={date}
                        onChange={(event) => {
                            setDate(event.target.value);
                            setPage(1);
                        }}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
                    />
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
                    >
                        Clear Filters
                    </button>
                </div>
            </section>

            {/* RESERVATION TABLE */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
                    <div>
                        <h2 className="font-bold text-slate-900">
                            Reservation Records
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            {pagination.total} reservation(s) found
                        </p>
                    </div>

                    <span className="text-xs text-slate-400">
                        Page {page} of {Math.max(1, pagination.totalPages)}
                    </span>
                </div>

                {error && (
                    <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex min-h-[250px] items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="mx-auto mb-3 animate-spin text-emerald-600" size={30} />

                            <p className="text-sm text-slate-500">
                                Loading reservations...
                            </p>
                        </div>
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <ClipboardList
                            size={38}
                            className="mx-auto mb-3 text-slate-300"
                        />

                        <h3 className="font-semibold text-slate-700">
                            No reservations found
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                            Try changing your search or filters.
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
                                        <th className="px-6 py-4">Court</th>
                                        <th className="px-6 py-4">Schedule</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Payment</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {reservations.map((reservation) => (
                                        <tr
                                            key={reservation._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-800">
                                                    {reservation.customer?.fullName || "Unknown customer"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {reservation.customer?.phone || "No phone number"}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-slate-700">
                                                    {reservation.court?.name || "Unknown court"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    Court {reservation.court?.courtNumber || "N/A"}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-slate-700">
                                                    {formatDate(reservation.reservationDate)}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {formatTime(reservation.startTime)}
                                                    {" - "}
                                                    {formatTime(reservation.endTime)}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                                {formatCurrency(reservation.totalAmount)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(reservation.status)}`}>
                                                    {reservation.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPaymentStyle(reservation.paymentStatus)}`}>
                                                    {reservation.paymentStatus}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedReservation(reservation)}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                                                >
                                                    <Eye size={15} />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARDS */}
                        <div className="space-y-3 p-4 md:hidden">
                            {reservations.map((reservation) => (
                                <div
                                    key={reservation._id}
                                    className="rounded-xl border border-slate-200 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-slate-900">
                                                {reservation.customer?.fullName || "Unknown customer"}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {reservation.customer?.phone || "No phone number"}
                                            </p>
                                        </div>

                                        <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusStyle(reservation.status)}`}>
                                            {reservation.status}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                                        <p className="flex items-center gap-2">
                                            <Building2 size={15} />
                                            {reservation.court?.name || "Unknown court"}
                                        </p>

                                        <p className="flex items-center gap-2">
                                            <CalendarDays size={15} />
                                            {formatDate(reservation.reservationDate)}
                                        </p>

                                        <p className="flex items-center gap-2">
                                            <Clock size={15} />
                                            {formatTime(reservation.startTime)}
                                            {" - "}
                                            {formatTime(reservation.endTime)}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Total Amount
                                            </p>

                                            <p className="mt-1 font-bold text-emerald-700">
                                                {formatCurrency(reservation.totalAmount)}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedReservation(reservation)}
                                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                        >
                                            <Eye size={14} />
                                            View Details
                                        </button>
                                    </div>
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

            {/* DETAILS MODAL */}
            {selectedReservation && (
                <ReservationDetails
                    reservation={selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                />
            )}
        </div>
    );
};

export default Reservations;
