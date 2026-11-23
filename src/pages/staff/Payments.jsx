
import { useCallback, useEffect, useMemo, useState } from "react";

import {
    Banknote,
    Search,
    RefreshCw,
    CalendarDays,
    CreditCard,
    CheckCircle2,
    Clock3,
    XCircle,
    Receipt,
    Plus,
    X,
    ChevronLeft,
    ChevronRight,
    UserRound,
    Building2,
    Wallet,
    PhilippinePeso,
    AlertCircle
} from "lucide-react";

import staffPaymentService from "../../services/staffPaymentService";

// ==========================================
// HELPERS
// ==========================================

const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(Number(amount) || 0);
};

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
};

const formatTime = (time) => {
    if (!time) return "—";

    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit"
    });
};

const getStatusStyle = (status) => {
    const styles = {
        Paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
        Rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
        Refunded: "bg-slate-100 text-slate-600 ring-slate-500/20"
    };

    return styles[status] || styles.Pending;
};

// ==========================================
// STATISTIC CARD
// ==========================================

const StatisticCard = ({
    title,
    value,
    description,
    icon: Icon,
    iconStyle
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                        {value}
                    </h3>

                    <p className="mt-2 text-xs text-slate-500">
                        {description}
                    </p>
                </div>

                <div className={`rounded-xl p-3 ${iconStyle}`}>
                    <Icon size={21} />
                </div>
            </div>
        </div>
    );
};

// ==========================================
// PAYMENT STATUS BADGE
// ==========================================

const PaymentStatusBadge = ({ status }) => {
    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(status)}`}
        >
            {status}
        </span>
    );
};

// ==========================================
// RECORD PAYMENT MODAL
// ==========================================

const RecordPaymentModal = ({
    reservations,
    loadingReservations,
    onClose,
    onSubmit,
    submitting
}) => {
    const [reservationId, setReservationId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [referenceNumber, setReferenceNumber] = useState("");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");

    const selectedReservation = reservations.find(
        (reservation) => reservation._id === reservationId
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!reservationId) {
            setError("Please select a reservation.");
            return;
        }

        try {
            await onSubmit({
                reservationId,
                paymentMethod,
                referenceNumber: referenceNumber.trim(),
                notes: notes.trim()
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to record payment. Please try again."
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* Modal header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Record Payment
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Record a customer's reservation payment.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">

                    {/* Reservation selection */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Unpaid Reservation
                        </label>

                        <select
                            value={reservationId}
                            onChange={(event) => setReservationId(event.target.value)}
                            disabled={loadingReservations}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                            required
                        >
                            <option value="">
                                {loadingReservations
                                    ? "Loading reservations..."
                                    : "Select a reservation"}
                            </option>

                            {reservations.map((reservation) => (
                                <option
                                    key={reservation._id}
                                    value={reservation._id}
                                >
                                    {reservation.customer?.fullName || "Unknown customer"}
                                    {" — "}
                                    {reservation.court?.name || "Court"}
                                    {" — "}
                                    {formatDate(reservation.reservationDate)}
                                    {" — "}
                                    {formatCurrency(reservation.totalAmount)}
                                </option>
                            ))}
                        </select>

                        {!loadingReservations && reservations.length === 0 && (
                            <p className="mt-2 text-xs text-amber-600">
                                There are currently no unpaid reservations.
                            </p>
                        )}
                    </div>

                    {/* Selected reservation summary */}
                    {selectedReservation && (
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium text-emerald-700">
                                        Amount to collect
                                    </p>

                                    <h3 className="mt-1 text-2xl font-bold text-emerald-800">
                                        {formatCurrency(selectedReservation.totalAmount)}
                                    </h3>
                                </div>

                                <div className="rounded-xl bg-white p-3 text-emerald-600">
                                    <Banknote size={23} />
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-emerald-100 pt-3 text-sm">
                                <div>
                                    <p className="text-xs text-slate-500">
                                        Customer
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {selectedReservation.customer?.fullName || "Unknown"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Court
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {selectedReservation.court?.name || "Unknown"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Reservation date
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {formatDate(selectedReservation.reservationDate)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Time
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {formatTime(selectedReservation.startTime)}
                                        {" - "}
                                        {formatTime(selectedReservation.endTime)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment method */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Payment Method
                        </label>

                        <select
                            value={paymentMethod}
                            onChange={(event) => setPaymentMethod(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        >
                            <option value="Cash">Cash</option>
                            <option value="GCash">GCash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Card">Card</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Reference number */}
                    {paymentMethod !== "Cash" && (
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Reference Number
                                <span className="ml-1 font-normal text-slate-400">
                                    (Optional)
                                </span>
                            </label>

                            <input
                                type="text"
                                value={referenceNumber}
                                onChange={(event) => setReferenceNumber(event.target.value)}
                                maxLength={100}
                                placeholder="Enter transaction reference"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Notes
                            <span className="ml-1 font-normal text-slate-400">
                                (Optional)
                            </span>
                        </label>

                        <textarea
                            rows={3}
                            maxLength={500}
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Additional payment details..."
                            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting || loadingReservations || !reservations.length}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? (
                                <>
                                    <RefreshCw size={17} className="animate-spin" />
                                    Recording...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={17} />
                                    Confirm Payment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ==========================================
// MAIN PAYMENTS PAGE
// ==========================================

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState({});
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [date, setDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [reservations, setReservations] = useState([]);
    const [loadingReservations, setLoadingReservations] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");

    // ==========================================
    // FETCH PAYMENTS
    // ==========================================

    const fetchPayments = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await staffPaymentService.getPayments({
                search,
                status,
                date,
                page: pagination.page,
                limit: pagination.limit
            });

            setPayments(response.payments || []);
            setSummary(response.summary || {});
            setPagination((previous) => ({
                ...previous,
                ...(response.pagination || {})
            }));

        } catch (err) {
            console.error("Fetch Payments Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load payments."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [search, status, date, pagination.page, pagination.limit]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPayments();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchPayments]);

    // ==========================================
    // FETCH UNPAID RESERVATIONS
    // ==========================================

    const openPaymentModal = async () => {
        setShowPaymentModal(true);
        setLoadingReservations(true);

        try {
            const response =
                await staffPaymentService.getUnpaidReservations();

            setReservations(response.reservations || []);

        } catch (err) {
            console.error("Fetch Unpaid Reservations Error:", err);

            setReservations([]);
            setError(
                err.response?.data?.message ||
                "Unable to load unpaid reservations."
            );

            setShowPaymentModal(false);
        } finally {
            setLoadingReservations(false);
        }
    };

    // ==========================================
    // CREATE PAYMENT
    // ==========================================

    const handleCreatePayment = async (paymentData) => {
        try {
            setSubmitting(true);

            const response =
                await staffPaymentService.createPayment(paymentData);

            setShowPaymentModal(false);

            setSuccessMessage(
                response.message || "Payment recorded successfully."
            );

            setPagination((previous) => ({
                ...previous,
                page: 1
            }));

            setStatus("");
            setSearch("");
            setDate("");

            await fetchPayments(true);

            // Refresh unpaid reservations for the next transaction.
            const unpaidResponse =
                await staffPaymentService.getUnpaidReservations();

            setReservations(unpaidResponse.reservations || []);

        } catch (err) {
            throw err;
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================
    // FILTER HANDLERS
    // ==========================================

    const clearFilters = () => {
        setSearch("");
        setStatus("");
        setDate("");

        setPagination((previous) => ({
            ...previous,
            page: 1
        }));
    };

    const hasFilters = search || status || date;

    const paymentMethodTotals = useMemo(() => {
        const totals = {};

        payments.forEach((payment) => {
            if (payment.status === "Paid") {
                const method = payment.paymentMethod || "Other";

                totals[method] =
                    (totals[method] || 0) + Number(payment.amount || 0);
            }
        });

        return Object.entries(totals).sort(
            (a, b) => b[1] - a[1]
        );
    }, [payments]);

    // ==========================================
    // PAGINATION
    // ==========================================

    const changePage = (nextPage) => {
        setPagination((previous) => ({
            ...previous,
            page: nextPage
        }));
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 xl:px-8 xl:py-10">

            {/* Page heading */}
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                        <Wallet size={17} />
                        Staff Management
                    </div>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Payments
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Manage reservation payments and transaction records.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => fetchPayments(true)}
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
                    >
                        <RefreshCw
                            size={17}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={openPaymentModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                        <Plus size={18} />
                        Record Payment
                    </button>
                </div>
            </div>

            {/* Success message */}
            {successMessage && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} />
                        {successMessage}
                    </div>

                    <button
                        type="button"
                        onClick={() => setSuccessMessage("")}
                        className="rounded-lg p-1 hover:bg-emerald-100"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={18} />
                        {error}
                    </div>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="rounded-lg p-1 hover:bg-rose-100"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatisticCard
                    title="Total Transactions"
                    value={summary.totalPayments || 0}
                    description="All recorded payment records"
                    icon={Receipt}
                    iconStyle="bg-blue-50 text-blue-600"
                />

                <StatisticCard
                    title="Collected Revenue"
                    value={formatCurrency(summary.collectedRevenue)}
                    description={`${summary.paidCount || 0} successful payments`}
                    icon={PhilippinePeso}
                    iconStyle="bg-emerald-50 text-emerald-600"
                />

                <StatisticCard
                    title="Pending Payments"
                    value={summary.pendingCount || 0}
                    description="Awaiting payment verification"
                    icon={Clock3}
                    iconStyle="bg-amber-50 text-amber-600"
                />

                <StatisticCard
                    title="Refunded Payments"
                    value={summary.refundedCount || 0}
                    description={`${summary.rejectedCount || 0} rejected transactions`}
                    icon={XCircle}
                    iconStyle="bg-rose-50 text-rose-600"
                />
            </div>

            {/* Payment method totals */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="font-bold text-slate-900">
                            Payment Methods
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Collected amounts on this page.
                        </p>
                    </div>

                    <CreditCard className="text-slate-400" size={21} />
                </div>

                {paymentMethodTotals.length > 0 ? (
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {paymentMethodTotals.map(([method, amount]) => (
                            <div
                                key={method}
                                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                            >
                                <p className="text-sm font-medium text-slate-500">
                                    {method}
                                </p>

                                <p className="mt-2 text-lg font-bold text-slate-900">
                                    {formatCurrency(amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                        No paid transactions on this page.
                    </p>
                )}
            </div>

            {/* Payments table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* Table header */}
                <div className="border-b border-slate-100 p-5">
                    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                        <div>
                            <h2 className="font-bold text-slate-900">
                                Transaction History
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Review and search recorded payments.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {/* Search */}
                            <div className="relative sm:col-span-1">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setPagination((previous) => ({
                                            ...previous,
                                            page: 1
                                        }));
                                    }}
                                    placeholder="Search payments..."
                                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>

                            {/* Status */}
                            <select
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value);
                                    setPagination((previous) => ({
                                        ...previous,
                                        page: 1
                                    }));
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                            >
                                <option value="">All statuses</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Refunded">Refunded</option>
                            </select>

                            {/* Date */}
                            <input
                                type="date"
                                value={date}
                                onChange={(event) => {
                                    setDate(event.target.value);
                                    setPagination((previous) => ({
                                        ...previous,
                                        page: 1
                                    }));
                                }}
                                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-3 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="space-y-4 p-5">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div
                                key={item}
                                className="h-16 animate-pulse rounded-xl bg-slate-100"
                            />
                        ))}
                    </div>
                ) : payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                        <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                            <Receipt size={30} />
                        </div>

                        <h3 className="mt-4 font-bold text-slate-900">
                            No payments found
                        </h3>

                        <p className="mt-2 max-w-sm text-sm text-slate-500">
                            No transactions match your current filters.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">
                                            Receipt
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Customer
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Reservation
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Payment Method
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Amount
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Date
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {payments.map((payment) => (
                                        <tr
                                            key={payment._id}
                                            className="transition hover:bg-slate-50/70"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900">
                                                    {payment.receiptNumber || "—"}
                                                </p>

                                                {payment.referenceNumber && (
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Ref: {payment.referenceNumber}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-800">
                                                    {payment.customer?.fullName || "Unknown"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {payment.customer?.phone || "No phone"}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-800">
                                                    {payment.reservation?.court?.name ||
                                                        payment.reservation?.court?.courtNumber ||
                                                        "Reservation"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {formatDate(payment.reservation?.reservationDate)}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {payment.paymentMethod}
                                            </td>

                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                {formatCurrency(payment.amount)}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {formatDateTime(payment.paymentDate)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <PaymentStatusBadge status={payment.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="space-y-3 p-4 lg:hidden">
                            {payments.map((payment) => (
                                <div
                                    key={payment._id}
                                    className="rounded-xl border border-slate-200 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-slate-900">
                                                {payment.customer?.fullName || "Unknown customer"}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {payment.receiptNumber || "No receipt number"}
                                            </p>
                                        </div>

                                        <PaymentStatusBadge status={payment.status} />
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Amount
                                            </p>

                                            <p className="mt-1 font-bold text-slate-900">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Payment method
                                            </p>

                                            <p className="mt-1 font-semibold text-slate-800">
                                                {payment.paymentMethod}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Payment date
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-800">
                                                {formatDate(payment.paymentDate)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Reservation
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-800">
                                                {formatDate(payment.reservation?.reservationDate)}
                                            </p>
                                        </div>
                                    </div>

                                    {payment.referenceNumber && (
                                        <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                                            Reference: {payment.referenceNumber}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {!loading && pagination.totalPages > 0 && (
                    <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
                        <p className="text-sm text-slate-500">
                            Showing{" "}
                            <span className="font-semibold text-slate-800">
                                {((pagination.page - 1) * pagination.limit) + 1}
                            </span>
                            {" "}to{" "}
                            <span className="font-semibold text-slate-800">
                                {Math.min(
                                    pagination.page * pagination.limit,
                                    pagination.total
                                )}
                            </span>
                            {" "}of{" "}
                            <span className="font-semibold text-slate-800">
                                {pagination.total}
                            </span>
                            {" "}payments
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={pagination.page <= 1}
                                onClick={() => changePage(pagination.page - 1)}
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <span className="px-3 text-sm font-semibold text-slate-700">
                                {pagination.page} / {pagination.totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={pagination.page >= pagination.totalPages}
                                onClick={() => changePage(pagination.page + 1)}
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment modal */}
            {showPaymentModal && (
                <RecordPaymentModal
                    reservations={reservations}
                    loadingReservations={loadingReservations}
                    submitting={submitting}
                    onClose={() => setShowPaymentModal(false)}
                    onSubmit={handleCreatePayment}
                />
            )}
        </div>
    );
};

export default Payments;
