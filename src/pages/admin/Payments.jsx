
import React, { useCallback, useEffect, useState } from "react";
import {
    Banknote,
    CheckCircle,
    Clock,
    CreditCard,
    Eye,
    Plus,
    Printer,
    RefreshCw,
    Search,
    XCircle,
    X,
    AlertTriangle,
    LoaderCircle,
    CalendarDays,
    User,
    Building2,
    Receipt
} from "lucide-react";

import paymentService from "../../services/paymentService";
import api from "../../services/api";

// ==========================================
// FORMAT HELPERS
// ==========================================

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(Number(amount) || 0);
};

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

const formatDateTime = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

// ==========================================
// STATUS STYLES
// ==========================================

const getStatusStyle = (status) => {
    const styles = {
        Pending: "bg-amber-50 text-amber-700 border-amber-200",
        Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Rejected: "bg-red-50 text-red-700 border-red-200",
        Refunded: "bg-slate-100 text-slate-700 border-slate-200"
    };

    return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
};

// ==========================================
// HTML ESCAPE HELPER
// ==========================================

const escapeHtml = (value) => {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
};

// ==========================================
// PRINT PAYMENT RECEIPT
// ==========================================

const printReceipt = (payment) => {
    if (!payment?.receiptNumber || payment.status !== "Paid") {
        return;
    }

    const customer = payment.customer || {};
    const reservation = payment.reservation || {};
    const court = reservation.court || {};

    const receiptWindow = window.open("", "_blank", "width=800,height=700");

    if (!receiptWindow) {
        return;
    }

    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt ${escapeHtml(payment.receiptNumber)}</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #111827;
                    padding: 35px;
                    max-width: 650px;
                    margin: auto;
                }

                .header {
                    text-align: center;
                    border-bottom: 2px solid #111827;
                    padding-bottom: 18px;
                    margin-bottom: 24px;
                }

                .header h1 {
                    margin: 0 0 6px;
                    font-size: 26px;
                }

                .muted {
                    color: #6b7280;
                }

                .receipt-number {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 20px 0;
                }

                .line {
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                    padding: 10px 0;
                    border-bottom: 1px solid #e5e7eb;
                }

                .line span:last-child {
                    text-align: right;
                    font-weight: 600;
                }

                .total {
                    font-size: 20px;
                    font-weight: bold;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 2px solid #111827;
                }

                .footer {
                    text-align: center;
                    margin-top: 40px;
                    font-size: 12px;
                    color: #6b7280;
                }

                @media print {
                    body {
                        padding: 10px;
                    }
                }
            </style>
        </head>

        <body>
            <div class="header">
                <h1>PickleBook</h1>
                <p class="muted">Payment Receipt</p>
            </div>

            <div class="receipt-number">
                Receipt No: ${escapeHtml(payment.receiptNumber)}
            </div>

            <div class="line">
                <span>Payment Date</span>
                <span>${escapeHtml(formatDateTime(payment.verifiedAt || payment.paymentDate))}</span>
            </div>

            <div class="line">
                <span>Customer</span>
                <span>${escapeHtml(customer.fullName || "—")}</span>
            </div>

            <div class="line">
                <span>Username</span>
                <span>${escapeHtml(customer.username || "—")}</span>
            </div>

            <div class="line">
                <span>Reservation</span>
                <span>${escapeHtml(reservation._id || "—")}</span>
            </div>

            <div class="line">
                <span>Court</span>
                <span>${escapeHtml(court.name || "—")} ${escapeHtml(court.courtNumber || "")}</span>
            </div>

            <div class="line">
                <span>Reservation Date</span>
                <span>${escapeHtml(formatDate(reservation.reservationDate))}</span>
            </div>

            <div class="line">
                <span>Time</span>
                <span>${escapeHtml(reservation.startTime || "—")} - ${escapeHtml(reservation.endTime || "—")}</span>
            </div>

            <div class="line">
                <span>Payment Method</span>
                <span>${escapeHtml(payment.paymentMethod)}</span>
            </div>

            <div class="line">
                <span>Reference Number</span>
                <span>${escapeHtml(payment.referenceNumber || "—")}</span>
            </div>

            <div class="line total">
                <span>Amount Paid</span>
                <span>${escapeHtml(formatCurrency(payment.amount))}</span>
            </div>

            <div class="footer">
                <p>Received by: ${escapeHtml(payment.receivedBy?.fullName || "PickleBook Admin")}</p>
                <p>Thank you for choosing PickleBook!</p>
                <p>This receipt was generated electronically.</p>
            </div>

            <script>
                window.onload = function () {
                    window.print();
                };
            </script>
        </body>
        </html>
    `;

    receiptWindow.document.open();
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
};

// ==========================================
// SUMMARY CARD
// ==========================================

const SummaryCard = ({ title, value, amount, icon: Icon, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
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

            <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                {value}
            </p>

            {amount && (
                <p className="mt-2 text-sm text-slate-500">
                    {amount} total
                </p>
            )}
        </div>
    );
};

// ==========================================
// LOADING SKELETON
// ==========================================

const PaymentSkeleton = () => (
    <div className="animate-pulse space-y-4 p-6 sm:p-8">
        {Array.from({ length: 5 }).map((_, index) => (
            <div
                key={index}
                className="flex flex-col gap-4 rounded-xl border border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="space-y-3">
                    <div className="h-4 w-36 rounded bg-slate-200" />
                    <div className="h-3 w-24 rounded bg-slate-100" />
                </div>

                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="h-4 w-24 rounded bg-slate-100" />
                <div className="h-8 w-24 rounded-full bg-slate-200" />
                <div className="h-9 w-28 rounded-lg bg-slate-100" />
            </div>
        ))}
    </div>
);

// ==========================================
// MAIN PAYMENTS COMPONENT
// ==========================================

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState([]);

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    });

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [method, setMethod] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Record payment modal
    const [showModal, setShowModal] = useState(false);
    const [reservations, setReservations] = useState([]);
    const [reservationLoading, setReservationLoading] = useState(false);
    const [reservationError, setReservationError] = useState("");

    // Payment details modal
    const [selectedPayment, setSelectedPayment] = useState(null);

    // Status confirmation modal
    const [confirmation, setConfirmation] = useState(null);

    const [form, setForm] = useState({
        reservationId: "",
        amount: "",
        paymentMethod: "Cash",
        referenceNumber: "",
        status: "Paid",
        notes: ""
    });

    // ==========================================
    // LOAD PAYMENTS
    // ==========================================

    const loadPayments = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await paymentService.getPayments({
                search,
                status,
                method,
                page: pagination.page,
                limit: pagination.limit
            });

            setPayments(response.payments || []);
            setSummary(response.summary || []);

            setPagination((previous) => ({
                ...previous,
                ...(response.pagination || {})
            }));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load payment records."
            );
        } finally {
            setLoading(false);
        }
    }, [search, status, method, pagination.page, pagination.limit]);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    // ==========================================
    // NOTIFICATIONS
    // ==========================================

    const showSuccess = (message) => {
        setSuccess(message);
        setError("");
    };

    const showError = (message) => {
        setError(message);
        setSuccess("");
    };

    // ==========================================
    // SUMMARY HELPERS
    // ==========================================

    const getSummaryCount = (paymentStatus) => {
        return summary.find(
            (item) => item._id === paymentStatus
        )?.count || 0;
    };

    const getSummaryAmount = (paymentStatus) => {
        return summary.find(
            (item) => item._id === paymentStatus
        )?.amount || 0;
    };

    // ==========================================
    // RESET FORM
    // ==========================================

    const resetForm = () => {
        setForm({
            reservationId: "",
            amount: "",
            paymentMethod: "Cash",
            referenceNumber: "",
            status: "Paid",
            notes: ""
        });
    };

    // ==========================================
    // OPEN RECORD PAYMENT MODAL
    // ==========================================

    const openCreateModal = async () => {
        setShowModal(true);
        setReservationLoading(true);
        setReservationError("");
        setReservations([]);

        try {
            const response = await api.get("/reservations", {
                params: {
                    limit: 100,
                    page: 1
                }
            });

            const reservationList = response.data.reservations || [];

            const unpaidReservations = reservationList.filter(
                (reservation) => {
                    return (
                        reservation.status !== "Cancelled" &&
                        reservation.paymentStatus !== "Paid" &&
                        reservation.paymentStatus !== "Refunded"
                    );
                }
            );

            setReservations(unpaidReservations);
        } catch (err) {
            setReservationError(
                err.response?.data?.message ||
                "Failed to load reservations."
            );
        } finally {
            setReservationLoading(false);
        }
    };

    // ==========================================
    // HANDLE RESERVATION CHANGE
    // ==========================================

    const handleReservationChange = (reservationId) => {
        const selected = reservations.find(
            (reservation) => reservation._id === reservationId
        );

        setForm((previous) => ({
            ...previous,
            reservationId,
            amount: selected ? selected.totalAmount : ""
        }));
    };

    // ==========================================
    // CREATE PAYMENT
    // ==========================================

    const handleCreatePayment = async (event) => {
        event.preventDefault();

        if (!form.reservationId) {
            setReservationError("Please select a reservation.");
            return;
        }

        try {
            setActionLoading(true);
            setError("");

            await paymentService.createPayment({
                ...form,
                amount: Number(form.amount)
            });

            setShowModal(false);
            resetForm();

            showSuccess(
                form.status === "Paid"
                    ? "Payment recorded successfully."
                    : "Pending payment recorded successfully."
            );

            await loadPayments();
        } catch (err) {
            setReservationError(
                err.response?.data?.message ||
                "Failed to record payment."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ==========================================
    // OPEN STATUS CONFIRMATION
    // ==========================================

    const handleStatusUpdate = (payment, newStatus) => {
        setConfirmation({
            payment,
            newStatus
        });
    };

    // ==========================================
    // CONFIRM STATUS UPDATE
    // ==========================================

    const confirmStatusUpdate = async () => {
        if (!confirmation?.payment || actionLoading) return;

        const { payment, newStatus } = confirmation;

        try {
            setActionLoading(true);
            setError("");

            const response = await paymentService.updatePaymentStatus(
                payment._id,
                newStatus
            );

            setConfirmation(null);

            showSuccess(
                response.message ||
                `Payment status successfully changed to ${newStatus}.`
            );

            await loadPayments();
        } catch (err) {
            showError(
                err.response?.data?.message ||
                "Failed to update payment status."
            );

            setConfirmation(null);
        } finally {
            setActionLoading(false);
        }
    };

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
    // CLOSE RECORD MODAL
    // ==========================================

    const closeModal = () => {
        if (actionLoading) return;

        setShowModal(false);
        setReservationError("");
        resetForm();
    };

    // ==========================================
    // STATUS CONFIRMATION CONTENT
    // ==========================================

    const getConfirmationContent = () => {
        if (!confirmation) return null;

        const { payment, newStatus } = confirmation;

        const content = {
            Paid: {
                title: "Confirm Payment",
                description: "This will mark the payment as paid and may generate its receipt.",
                button: "Confirm Payment",
                icon: CheckCircle,
                color: "emerald"
            },
            Rejected: {
                title: "Reject Payment",
                description: "This will mark this payment transaction as rejected.",
                button: "Reject Payment",
                icon: XCircle,
                color: "red"
            },
            Refunded: {
                title: "Confirm Refund",
                description: "This will mark the payment as refunded. Make sure the refund has actually been processed.",
                button: "Confirm Refund",
                icon: Banknote,
                color: "amber"
            }
        };

        return {
            ...content[newStatus],
            payment
        };
    };

    const confirmationContent = getConfirmationContent();

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="space-y-8 px-2 py-6 sm:px-4 sm:py-8 lg:px-6 xl:px-8">

            {/* PAGE HEADER */}

            <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-600">
                        Financial Management
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Payments Management
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Manage payment records, payment statuses, and customer receipts.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={loadPayments}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                        <Plus size={17} />
                        Record Payment
                    </button>
                </div>
            </div>

            {/* NOTIFICATIONS */}

            {(success || error) && (
                <div className={`flex items-start gap-3 rounded-xl border p-4 ${
                    success
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                }`}>
                    {success ? (
                        <CheckCircle size={20} className="mt-0.5 shrink-0" />
                    ) : (
                        <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                    )}

                    <div className="flex-1 text-sm font-medium">
                        {success || error}
                    </div>

                    <button
                        onClick={() => {
                            setSuccess("");
                            setError("");
                        }}
                        className="rounded-lg p-1 transition hover:bg-black/5"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* SUMMARY CARDS */}

            <section className="space-y-5">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Payment Overview
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Summary of recorded payment transactions.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Records"
                        value={pagination.total}
                        icon={CreditCard}
                        color="blue"
                    />

                    <SummaryCard
                        title="Paid Payments"
                        value={getSummaryCount("Paid")}
                        amount={formatCurrency(getSummaryAmount("Paid"))}
                        icon={CheckCircle}
                        color="emerald"
                    />

                    <SummaryCard
                        title="Pending Payments"
                        value={getSummaryCount("Pending")}
                        amount={formatCurrency(getSummaryAmount("Pending"))}
                        icon={Clock}
                        color="amber"
                    />

                    <SummaryCard
                        title="Refunded Payments"
                        value={getSummaryCount("Refunded")}
                        amount={formatCurrency(getSummaryAmount("Refunded"))}
                        icon={Banknote}
                        color="slate"
                    />
                </div>
            </section>

            {/* FILTERS */}

            <section className="space-y-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Find Payments
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Search and filter payment transactions.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                                placeholder="Search customer, receipt, reference..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(event) => {
                                setStatus(event.target.value);

                                setPagination((previous) => ({
                                    ...previous,
                                    page: 1
                                }));
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        >
                            <option value="">All Payment Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Refunded">Refunded</option>
                        </select>

                        <select
                            value={method}
                            onChange={(event) => {
                                setMethod(event.target.value);

                                setPagination((previous) => ({
                                    ...previous,
                                    page: 1
                                }));
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        >
                            <option value="">All Payment Methods</option>
                            <option value="Cash">Cash</option>
                            <option value="GCash">GCash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Card">Card</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* PAYMENT RECORDS */}

            <section className="space-y-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Payment Records
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Review, verify, and manage customer payment transactions.
                    </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:px-7">
                        <div>
                            <h3 className="font-bold text-slate-900">
                                All Transactions
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                {pagination.total} record(s) found
                            </p>
                        </div>

                        <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            Page {pagination.page} of {pagination.totalPages || 1}
                        </span>
                    </div>

                    {loading ? (
                        <PaymentSkeleton />
                    ) : payments.length === 0 ? (
                        <div className="px-6 py-20 text-center">
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <CreditCard size={30} />
                            </div>

                            <h3 className="font-bold text-slate-800">
                                No Payment Records Found
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Payment records will appear here once transactions have been recorded.
                                Try adjusting your search filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-6 py-5">Receipt / Reference</th>
                                        <th className="px-6 py-5">Customer</th>
                                        <th className="px-6 py-5">Reservation</th>
                                        <th className="px-6 py-5">Method</th>
                                        <th className="px-6 py-5">Amount</th>
                                        <th className="px-6 py-5">Date</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {payments.map((payment) => (
                                        <tr
                                            key={payment._id}
                                            className="transition hover:bg-slate-50/70"
                                        >
                                            <td className="px-6 py-5">
                                                <p className="font-semibold text-slate-900">
                                                    {payment.receiptNumber || "Not issued"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {payment.referenceNumber || "No reference"}
                                                </p>
                                            </td>

                                            <td className="px-6 py-5">
                                                <p className="font-semibold text-slate-800">
                                                    {payment.customer?.fullName || "Unknown"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    @{payment.customer?.username || "—"}
                                                </p>
                                            </td>

                                            <td className="px-6 py-5">
                                                <p className="font-semibold text-slate-800">
                                                    {payment.reservation?.court?.name || "Court"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {formatDate(payment.reservation?.reservationDate)}
                                                </p>
                                            </td>

                                            <td className="px-6 py-5 text-slate-600">
                                                {payment.paymentMethod}
                                            </td>

                                            <td className="px-6 py-5 font-bold text-slate-900">
                                                {formatCurrency(payment.amount)}
                                            </td>

                                            <td className="px-6 py-5 text-slate-600">
                                                {formatDate(payment.paymentDate)}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {payment.status === "Pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(payment, "Paid")}
                                                                disabled={actionLoading}
                                                                title="Confirm payment"
                                                                className="rounded-lg p-2.5 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>

                                                            <button
                                                                onClick={() => handleStatusUpdate(payment, "Rejected")}
                                                                disabled={actionLoading}
                                                                title="Reject payment"
                                                                className="rounded-lg p-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}

                                                    {payment.status === "Paid" && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(payment, "Refunded")}
                                                            disabled={actionLoading}
                                                            title="Mark as refunded"
                                                            className="rounded-lg p-2.5 text-amber-600 transition hover:bg-amber-50 disabled:opacity-50"
                                                        >
                                                            <Banknote size={18} />
                                                        </button>
                                                    )}

                                                    {payment.status === "Paid" && (
                                                        <button
                                                            onClick={() => printReceipt(payment)}
                                                            title="Print receipt"
                                                            className="rounded-lg p-2.5 text-blue-600 transition hover:bg-blue-50"
                                                        >
                                                            <Printer size={18} />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => setSelectedPayment(payment)}
                                                        title="View payment information"
                                                        className="rounded-lg p-2.5 text-slate-600 transition hover:bg-slate-100"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PAGINATION */}

                    {!loading && pagination.totalPages > 1 && (
                        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                            <p className="text-sm text-slate-500">
                                Showing page {pagination.page} of {pagination.totalPages}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => changePage(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <button
                                    onClick={() => changePage(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ========================================== */}
            {/* RECORD PAYMENT MODAL */}
            {/* ========================================== */}

            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeModal();
                    }}
                >
                    <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6 sm:px-8">
                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                                    Payment Management
                                </p>

                                <h2 className="text-xl font-bold text-slate-900">
                                    Record Payment
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Add a payment for an existing reservation.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={actionLoading}
                                aria-label="Close modal"
                                className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreatePayment}
                            className="space-y-6 p-6 sm:p-8"
                        >
                            {reservationError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    {reservationError}
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Reservation
                                </label>

                                <select
                                    required
                                    value={form.reservationId}
                                    onChange={(event) => handleReservationChange(event.target.value)}
                                    disabled={reservationLoading}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                                >
                                    <option value="">
                                        {reservationLoading
                                            ? "Loading reservations..."
                                            : "Select reservation"}
                                    </option>

                                    {reservations.map((reservation) => (
                                        <option
                                            key={reservation._id}
                                            value={reservation._id}
                                        >
                                            {reservation.customer?.fullName || "Customer"} —{" "}
                                            {reservation.court?.name || "Court"} —{" "}
                                            {formatDate(reservation.reservationDate)} —{" "}
                                            {formatCurrency(reservation.totalAmount)}
                                        </option>
                                    ))}
                                </select>

                                {!reservationLoading && reservations.length === 0 && (
                                    <p className="mt-2 text-xs text-amber-600">
                                        No unpaid reservations are available to record.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Amount (PHP)
                                </label>

                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    required
                                    value={form.amount}
                                    onChange={(event) => setForm((previous) => ({
                                        ...previous,
                                        amount: event.target.value
                                    }))}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />

                                <p className="mt-2 text-xs text-slate-500">
                                    The amount must match the full reservation total.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Payment Method
                                    </label>

                                    <select
                                        value={form.paymentMethod}
                                        onChange={(event) => setForm((previous) => ({
                                            ...previous,
                                            paymentMethod: event.target.value
                                        }))}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="GCash">GCash</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Card">Card</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Initial Status
                                    </label>

                                    <select
                                        value={form.status}
                                        onChange={(event) => setForm((previous) => ({
                                            ...previous,
                                            status: event.target.value
                                        }))}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Reference Number
                                </label>

                                <input
                                    type="text"
                                    value={form.referenceNumber}
                                    onChange={(event) => setForm((previous) => ({
                                        ...previous,
                                        referenceNumber: event.target.value
                                    }))}
                                    placeholder="Optional transaction reference"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Notes
                                </label>

                                <textarea
                                    rows="3"
                                    value={form.notes}
                                    onChange={(event) => setForm((previous) => ({
                                        ...previous,
                                        notes: event.target.value
                                    }))}
                                    placeholder="Additional payment information..."
                                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={actionLoading}
                                    className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        actionLoading ||
                                        reservationLoading ||
                                        reservations.length === 0
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {actionLoading && (
                                        <RefreshCw size={16} className="animate-spin" />
                                    )}

                                    {actionLoading ? "Saving..." : "Save Payment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* PAYMENT STATUS CONFIRMATION MODAL */}
            {/* ========================================== */}

            {confirmation && confirmationContent && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !actionLoading
                        ) {
                            setConfirmation(null);
                        }
                    }}
                >
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                        <div className="p-6 sm:p-7">
                            <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
                                confirmationContent.color === "emerald"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : confirmationContent.color === "red"
                                        ? "bg-red-50 text-red-600"
                                        : "bg-amber-50 text-amber-600"
                            }`}>
                                <confirmationContent.icon size={27} />
                            </div>

                            <h2 className="text-xl font-bold text-slate-900">
                                {confirmationContent.title}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {confirmationContent.description}
                            </p>

                            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-slate-500">
                                        Customer
                                    </span>

                                    <span className="text-right font-semibold text-slate-800">
                                        {confirmationContent.payment.customer?.fullName || "Unknown"}
                                    </span>
                                </div>

                                <div className="mt-3 flex justify-between gap-4 text-sm">
                                    <span className="text-slate-500">
                                        Receipt
                                    </span>

                                    <span className="text-right font-semibold text-slate-800">
                                        {confirmationContent.payment.receiptNumber || "Not issued"}
                                    </span>
                                </div>

                                <div className="mt-3 flex justify-between gap-4 text-sm">
                                    <span className="text-slate-500">
                                        Amount
                                    </span>

                                    <span className="text-right font-bold text-slate-900">
                                        {formatCurrency(confirmationContent.payment.amount)}
                                    </span>
                                </div>

                                <div className="mt-3 flex justify-between gap-4 text-sm">
                                    <span className="text-slate-500">
                                        New Status
                                    </span>

                                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(confirmation.newStatus)}`}>
                                        {confirmation.newStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setConfirmation(null)}
                                disabled={actionLoading}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmStatusUpdate}
                                disabled={actionLoading}
                                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                    confirmationContent.color === "emerald"
                                        ? "bg-emerald-600 hover:bg-emerald-700"
                                        : confirmationContent.color === "red"
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-amber-600 hover:bg-amber-700"
                                }`}
                            >
                                {actionLoading ? (
                                    <>
                                        <LoaderCircle size={17} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    confirmationContent.button
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* PAYMENT DETAILS MODAL */}
            {/* ========================================== */}

            {selectedPayment && (
                <div
                    className="fixed inset-0 z-[55] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedPayment(null);
                        }
                    }}
                >
                    <div className="my-8 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                                    Transaction Information
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-slate-900">
                                    Payment Details
                                </h2>
                            </div>

                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                                aria-label="Close details"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div className="rounded-2xl bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">
                                    Payment Amount
                                </p>

                                <p className="mt-1 text-3xl font-bold text-slate-900">
                                    {formatCurrency(selectedPayment.amount)}
                                </p>

                                <span className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(selectedPayment.status)}`}>
                                    {selectedPayment.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <DetailItem
                                    icon={Receipt}
                                    label="Receipt Number"
                                    value={selectedPayment.receiptNumber || "Not issued"}
                                />

                                <DetailItem
                                    icon={CreditCard}
                                    label="Payment Method"
                                    value={selectedPayment.paymentMethod || "—"}
                                />

                                <DetailItem
                                    icon={User}
                                    label="Customer"
                                    value={selectedPayment.customer?.fullName || "Unknown"}
                                />

                                <DetailItem
                                    icon={Building2}
                                    label="Court"
                                    value={selectedPayment.reservation?.court?.name || "—"}
                                />

                                <DetailItem
                                    icon={CalendarDays}
                                    label="Payment Date"
                                    value={formatDateTime(selectedPayment.paymentDate)}
                                />

                                <DetailItem
                                    icon={Clock}
                                    label="Verified Date"
                                    value={formatDateTime(selectedPayment.verifiedAt)}
                                />
                            </div>

                            <div className="space-y-3 border-t border-slate-100 pt-5">
                                <DetailRow
                                    label="Reference Number"
                                    value={selectedPayment.referenceNumber || "—"}
                                />

                                <DetailRow
                                    label="Reservation Date"
                                    value={formatDate(selectedPayment.reservation?.reservationDate)}
                                />

                                <DetailRow
                                    label="Reservation Time"
                                    value={`${selectedPayment.reservation?.startTime || "—"} - ${selectedPayment.reservation?.endTime || "—"}`}
                                />

                                <DetailRow
                                    label="Received By"
                                    value={selectedPayment.receivedBy?.fullName || "—"}
                                />

                                <DetailRow
                                    label="Payment ID"
                                    value={selectedPayment._id}
                                />
                            </div>

                            {selectedPayment.notes && (
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Notes
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-700">
                                        {selectedPayment.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                Close
                            </button>

                            {selectedPayment.status === "Paid" && (
                                <button
                                    onClick={() => printReceipt(selectedPayment)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    <Printer size={17} />
                                    Print Receipt
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// PAYMENT DETAIL COMPONENTS
// ==========================================

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Icon size={18} />
        </div>

        <div className="min-w-0">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                {value}
            </p>
        </div>
    </div>
);

const DetailRow = ({ label, value }) => (
    <div className="flex flex-col justify-between gap-1 text-sm sm:flex-row sm:gap-4">
        <span className="text-slate-500">{label}</span>
        <span className="break-all font-medium text-slate-800 sm:text-right">
            {value}
        </span>
    </div>
);

export default Payments;
