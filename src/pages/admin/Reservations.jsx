
import { useCallback, useEffect, useMemo, useState } from "react";

import {
    Search,
    Plus,
    CalendarDays,
    Clock,
    Users,
    Building2,
    Pencil,
    CheckCircle,
    XCircle,
    RefreshCw,
    X,
    PhilippinePeso,
    AlertTriangle
} from "lucide-react";

import api from "../../services/api";
import courtService from "../../services/courtService";
import reservationService from "../../services/reservationService";

// ==========================================
// DATE HELPERS
// ==========================================

const today = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatDateForInput = (date) => {
    if (!date) return "";

    const value = new Date(date);

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// ==========================================
// INITIAL FORM
// ==========================================

const initialForm = {
    customerId: "",
    courtId: "",
    reservationDate: today(),
    startTime: "09:00",
    endTime: "10:00",
    notes: ""
};

// ==========================================
// FORMAT HELPERS
// ==========================================

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 2
    }).format(Number(amount || 0));

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

// ==========================================
// STATUS STYLES
// ==========================================

const statusStyles = {
    Pending: "bg-amber-50 text-amber-700",
    Confirmed: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-red-50 text-red-700",
    Completed: "bg-blue-50 text-blue-700"
};

const paymentStyles = {
    Unpaid: "bg-amber-50 text-amber-700",
    Paid: "bg-emerald-50 text-emerald-700",
    Refunded: "bg-gray-100 text-gray-600"
};

// ==========================================
// DURATION HELPER
// ==========================================

function getDuration(startTime, endTime) {
    if (!startTime || !endTime) return 0;

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    return (
        endHour * 60 +
        endMinute -
        (startHour * 60 + startMinute)
    ) / 60;
}

// ==========================================
// MAIN RESERVATIONS COMPONENT
// ==========================================

export default function Reservations() {
    // ==========================================
    // DATA STATES
    // ==========================================

    const [reservations, setReservations] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [courts, setCourts] = useState([]);

    // ==========================================
    // LOADING AND NOTIFICATIONS
    // ==========================================

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==========================================
    // FILTER STATES
    // ==========================================

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [paymentFilter, setPaymentFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("");

    // ==========================================
    // CREATE / EDIT MODAL STATES
    // ==========================================

    const [showModal, setShowModal] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);
    const [formData, setFormData] = useState({ ...initialForm });

    // ==========================================
    // CUSTOM CONFIRMATION MODAL STATES
    // ==========================================

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [pendingStatusChange, setPendingStatusChange] = useState(null);

    // ==========================================
    // LOAD RESERVATIONS, CUSTOMERS AND COURTS
    // ==========================================

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [
                reservationResponse,
                customerResponse,
                courtResponse
            ] = await Promise.all([
                reservationService.getReservations(),
                api.get("/admin/users"),
                courtService.getCourts()
            ]);

            setReservations(
                reservationResponse.reservations || []
            );

            const users = customerResponse.data.users || [];

            setCustomers(
                users.filter(
                    (user) =>
                        user.role === "customer" &&
                        user.isActive
                )
            );

            const courtList = courtResponse.courts || [];

            setCourts(
                courtList.filter((court) => court.isActive)
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load reservation data."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // ==========================================
    // INITIAL DATA LOADING
    // ==========================================

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ==========================================
    // FILTER RESERVATIONS
    // ==========================================

    const filteredReservations = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return reservations.filter((reservation) => {
            const customerName =
                reservation.customer?.fullName?.toLowerCase() || "";

            const username =
                reservation.customer?.username?.toLowerCase() || "";

            const courtName =
                reservation.court?.name?.toLowerCase() || "";

            const courtNumber =
                reservation.court?.courtNumber?.toLowerCase() || "";

            const matchesSearch =
                !keyword ||
                customerName.includes(keyword) ||
                username.includes(keyword) ||
                courtName.includes(keyword) ||
                courtNumber.includes(keyword);

            const matchesStatus =
                statusFilter === "All" ||
                reservation.status === statusFilter;

            const matchesPayment =
                paymentFilter === "All" ||
                reservation.paymentStatus === paymentFilter;

            const matchesDate =
                !dateFilter ||
                formatDateForInput(reservation.reservationDate) === dateFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPayment &&
                matchesDate
            );
        });
    }, [
        reservations,
        search,
        statusFilter,
        paymentFilter,
        dateFilter
    ]);

    // ==========================================
    // STATISTICS
    // ==========================================

    const statistics = useMemo(() => {
        return [
            {
                title: "Total Reservations",
                value: reservations.length,
                icon: CalendarDays,
                color: "text-blue-600",
                background: "bg-blue-50"
            },
            {
                title: "Pending",
                value: reservations.filter(
                    (item) => item.status === "Pending"
                ).length,
                icon: Clock,
                color: "text-amber-600",
                background: "bg-amber-50"
            },
            {
                title: "Confirmed",
                value: reservations.filter(
                    (item) => item.status === "Confirmed"
                ).length,
                icon: CheckCircle,
                color: "text-emerald-600",
                background: "bg-emerald-50"
            },
            {
                title: "Total Customers",
                value: customers.length,
                icon: Users,
                color: "text-purple-600",
                background: "bg-purple-50"
            }
        ];
    }, [reservations, customers]);

    // ==========================================
    // SELECTED COURT AND PRICE
    // ==========================================

    const selectedCourt = courts.find(
        (court) => court._id === formData.courtId
    );

    const duration = getDuration(
        formData.startTime,
        formData.endTime
    );

    const estimatedAmount =
        selectedCourt && duration > 0
            ? duration * Number(selectedCourt.hourlyRate || 0)
            : 0;

    // ==========================================
    // FORM CHANGE HANDLER
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // ==========================================
    // OPEN CREATE MODAL
    // ==========================================

    const openCreateModal = () => {
        setEditingReservation(null);

        setFormData({
            ...initialForm,
            reservationDate: today(),
            customerId: customers[0]?._id || "",
            courtId: courts[0]?._id || ""
        });

        setError("");
        setSuccess("");
        setShowModal(true);
    };

    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================

    const openEditModal = (reservation) => {
        setEditingReservation(reservation);

        setFormData({
            customerId: reservation.customer?._id || "",
            courtId: reservation.court?._id || "",
            reservationDate: formatDateForInput(
                reservation.reservationDate
            ),
            startTime: reservation.startTime,
            endTime: reservation.endTime,
            notes: reservation.notes || ""
        });

        setError("");
        setSuccess("");
        setShowModal(true);
    };

    // ==========================================
    // CLOSE CREATE / EDIT MODAL
    // ==========================================

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingReservation(null);
        setFormData({ ...initialForm });
        setError("");
    };

    // ==========================================
    // CREATE OR UPDATE RESERVATION
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.customerId || !formData.courtId) {
            setError("Please select a customer and court.");
            return;
        }

        if (duration < 0.5) {
            setError(
                "End time must be later than start time. Minimum duration is 30 minutes."
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                ...formData
            };

            if (editingReservation) {
                await reservationService.updateReservation(
                    editingReservation._id,
                    payload
                );

                setSuccess("Reservation updated successfully.");
            } else {
                await reservationService.createReservation(payload);

                setSuccess("Reservation created successfully.");
            }

            setShowModal(false);
            setEditingReservation(null);
            setFormData({ ...initialForm });

            await loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save reservation."
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // OPEN CUSTOM STATUS CONFIRMATION MODAL
    // ==========================================

    const handleStatusChange = (reservation, nextStatus) => {
        setPendingStatusChange({
            reservation,
            nextStatus
        });

        setError("");
        setSuccess("");
        setShowConfirmModal(true);
    };

    // ==========================================
    // CLOSE CUSTOM CONFIRMATION MODAL
    // ==========================================

    const closeConfirmModal = () => {
        if (updatingStatus) return;

        setShowConfirmModal(false);
        setPendingStatusChange(null);
    };

    // ==========================================
    // CONFIRM STATUS CHANGE
    // ==========================================

    const confirmStatusChange = async () => {
        if (!pendingStatusChange || updatingStatus) return;

        const { reservation, nextStatus } = pendingStatusChange;

        const action = nextStatus.toLowerCase();

        try {
            setUpdatingStatus(true);
            setError("");
            setSuccess("");

            await reservationService.updateReservationStatus(
                reservation._id,
                nextStatus
            );

            setShowConfirmModal(false);
            setPendingStatusChange(null);

            setSuccess(
                `Reservation ${action} successfully.`
            );

            await loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update reservation status."
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    // ==========================================
    // LOADING STATE
    // ==========================================

    if (loading) {
        return <ReservationsPageSkeleton />;
    }

    // ==========================================
    // MAIN UI
    // ==========================================

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-8 bg-slate-50 px-4 py-6 sm:px-6 sm:py-8 xl:px-8">

            {/* PAGE HEADER */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
                        Booking Management
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                        Reservation Management
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage customer bookings, reservations, and court schedules.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">

                    <button
                        type="button"
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        <Plus size={18} />
                        Add Reservation
                    </button>

                </div>

            </div>

            {/* NOTIFICATIONS */}

            {error && !showModal && !showConfirmModal && (
                <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {success && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <span>{success}</span>

                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        aria-label="Dismiss success message"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* STATISTICS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {statistics.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {item.title}
                                    </p>

                                    <h3 className="mt-2 text-3xl font-bold text-slate-900">
                                        {item.value}
                                    </h3>
                                </div>

                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.background}`}>
                                    <Icon size={23} className={item.color} />
                                </div>

                            </div>
                        </div>
                    );
                })}

            </div>

            {/* FILTERS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search customer or court..."
                            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value="All">All Reservation Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Completed">Completed</option>
                    </select>

                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value="All">All Payment Status</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Refunded">Refunded</option>
                    </select>

                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />

                </div>
            </div>

            {/* RESERVATION TABLE */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-bold text-slate-900">
                            Reservations
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Manage all customer bookings
                        </p>
                    </div>

                    <p className="text-sm text-slate-500">
                        {filteredReservations.length} reservation(s) found
                    </p>
                </div>

                {filteredReservations.length === 0 ? (
                    <div className="px-5 py-16 text-center">

                        <CalendarDays
                            size={42}
                            className="mx-auto text-slate-300"
                        />

                        <h3 className="mt-3 font-semibold text-slate-800">
                            No reservations found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Try changing your filters or create a new reservation.
                        </p>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="mt-4 text-sm font-semibold text-emerald-700 hover:underline"
                        >
                            + Add Reservation
                        </button>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1050px] text-left">

                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">Customer</th>
                                    <th className="px-5 py-4">Court</th>
                                    <th className="px-5 py-4">Date & Time</th>
                                    <th className="px-5 py-4">Amount</th>
                                    <th className="px-5 py-4">Payment</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {filteredReservations.map((reservation) => (
                                    <tr
                                        key={reservation._id}
                                        className="transition hover:bg-slate-50"
                                    >

                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-900">
                                                {reservation.customer?.fullName || "Unknown Customer"}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                @{reservation.customer?.username || "unknown"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2
                                                    size={16}
                                                    className="text-slate-400"
                                                />

                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {reservation.court?.name || "Unknown Court"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {reservation.court?.courtNumber || ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-800">
                                                {formatDate(reservation.reservationDate)}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {reservation.startTime} - {reservation.endTime}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="font-semibold text-slate-900">
                                                {formatCurrency(reservation.totalAmount)}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    paymentStyles[reservation.paymentStatus] ||
                                                    "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {reservation.paymentStatus || "Unpaid"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    statusStyles[reservation.status] ||
                                                    "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {reservation.status}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">

                                                {reservation.status !== "Cancelled" &&
                                                    reservation.status !== "Completed" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(reservation)}
                                                                title="Edit reservation"
                                                                className="rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>

                                                            {reservation.status === "Pending" && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            reservation,
                                                                            "Confirmed"
                                                                        )
                                                                    }
                                                                    title="Confirm reservation"
                                                                    className="rounded-lg border border-emerald-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        reservation,
                                                                        "Cancelled"
                                                                    )
                                                                }
                                                                title="Cancel reservation"
                                                                className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </>
                                                    )}

                                            </div>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ==========================================
                CREATE / EDIT RESERVATION MODAL
            ========================================== */}

            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingReservation
                                        ? "Edit Reservation"
                                        : "Create Reservation"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Enter the reservation information below.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                aria-label="Close modal"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >
                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {/* Customer */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Customer
                                </label>

                                <select
                                    name="customerId"
                                    value={formData.customerId}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                >
                                    <option value="">
                                        Select customer
                                    </option>

                                    {customers.map((customer) => (
                                        <option
                                            key={customer._id}
                                            value={customer._id}
                                        >
                                            {customer.fullName} (@{customer.username})
                                        </option>
                                    ))}
                                </select>

                                {customers.length === 0 && (
                                    <p className="mt-2 text-xs text-red-500">
                                        No active customer accounts found.
                                    </p>
                                )}
                            </div>

                            {/* Court */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Court
                                </label>

                                <select
                                    name="courtId"
                                    value={formData.courtId}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                >
                                    <option value="">
                                        Select court
                                    </option>

                                    {courts.map((court) => (
                                        <option
                                            key={court._id}
                                            value={court._id}
                                        >
                                            {court.name} - {court.courtNumber} ({formatCurrency(court.hourlyRate)}/hr)
                                        </option>
                                    ))}
                                </select>

                                {courts.length === 0 && (
                                    <p className="mt-2 text-xs text-red-500">
                                        No active courts found. Add a court first.
                                    </p>
                                )}
                            </div>

                            {/* Date */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Reservation Date
                                </label>

                                <input
                                    type="date"
                                    name="reservationDate"
                                    value={formData.reservationDate}
                                    onChange={handleChange}
                                    min={today()}
                                    required
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>

                            {/* Time */}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Start Time
                                    </label>

                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        End Time
                                    </label>

                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    />
                                </div>

                            </div>

                            {/* Price Summary */}

                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">

                                <div className="flex items-center justify-between text-sm text-slate-600">
                                    <span>Duration</span>

                                    <span className="font-semibold text-slate-800">
                                        {duration > 0
                                            ? `${duration} hour(s)`
                                            : "—"}
                                    </span>
                                </div>

                                <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                                    <span>Hourly Rate</span>

                                    <span className="font-semibold text-slate-800">
                                        {selectedCourt
                                            ? formatCurrency(selectedCourt.hourlyRate)
                                            : "—"}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-emerald-200 pt-3">
                                    <span className="font-bold text-slate-800">
                                        Estimated Total
                                    </span>

                                    <span className="flex items-center gap-1 text-xl font-bold text-emerald-700">
                                        <PhilippinePeso size={20} />
                                        {formatCurrency(estimatedAmount).replace("₱", "").trim()}
                                    </span>
                                </div>

                            </div>

                            {/* Notes */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Notes (Optional)
                                </label>

                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    maxLength={500}
                                    placeholder="Add reservation notes..."
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>

                            {/* Actions */}

                            <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        customers.length === 0 ||
                                        courts.length === 0
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving && (
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                    )}

                                    {saving
                                        ? "Saving..."
                                        : editingReservation
                                            ? "Update Reservation"
                                            : "Create Reservation"}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==========================================
                CUSTOM STATUS CONFIRMATION MODAL
            ========================================== */}

            {showConfirmModal && pendingStatusChange && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            closeConfirmModal();
                        }
                    }}
                >
                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* Confirmation Icon */}

                        <div className="px-6 pb-2 pt-6 text-center">

                            <div
                                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                                    pendingStatusChange.nextStatus === "Cancelled"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-emerald-100 text-emerald-600"
                                }`}
                            >
                                {pendingStatusChange.nextStatus === "Cancelled" ? (
                                    <AlertTriangle size={27} />
                                ) : (
                                    <CheckCircle size={27} />
                                )}
                            </div>

                            <h2 className="mt-4 text-xl font-bold text-slate-900">
                                {pendingStatusChange.nextStatus === "Cancelled"
                                    ? "Cancel Reservation?"
                                    : "Confirm Reservation?"}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {pendingStatusChange.nextStatus === "Cancelled"
                                    ? "Are you sure you want to cancel this reservation? This action will update its reservation status."
                                    : "Are you sure you want to confirm this reservation? The reservation status will be updated."}
                            </p>

                        </div>

                        {/* Reservation Information */}

                        <div className="mx-6 mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-medium text-slate-500">
                                    Customer
                                </span>

                                <span className="text-right text-sm font-semibold text-slate-800">
                                    {pendingStatusChange.reservation.customer?.fullName || "Unknown Customer"}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3">
                                <span className="text-xs font-medium text-slate-500">
                                    Court
                                </span>

                                <span className="text-right text-sm font-semibold text-slate-800">
                                    {pendingStatusChange.reservation.court?.name || "Unknown Court"}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3">
                                <span className="text-xs font-medium text-slate-500">
                                    Reservation Date
                                </span>

                                <span className="text-right text-sm font-semibold text-slate-800">
                                    {formatDate(pendingStatusChange.reservation.reservationDate)}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3">
                                <span className="text-xs font-medium text-slate-500">
                                    Time
                                </span>

                                <span className="text-right text-sm font-semibold text-slate-800">
                                    {pendingStatusChange.reservation.startTime} - {pendingStatusChange.reservation.endTime}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                                <span className="text-xs font-medium text-slate-500">
                                    New Status
                                </span>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                                        pendingStatusChange.nextStatus === "Cancelled"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-emerald-100 text-emerald-700"
                                    }`}
                                >
                                    {pendingStatusChange.nextStatus}
                                </span>
                            </div>

                        </div>

                        {/* Confirmation Actions */}

                        <div className="flex flex-col-reverse gap-3 px-6 py-6 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={closeConfirmModal}
                                disabled={updatingStatus}
                                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                No, Go Back
                            </button>

                            <button
                                type="button"
                                onClick={confirmStatusChange}
                                disabled={updatingStatus}
                                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                    pendingStatusChange.nextStatus === "Cancelled"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-emerald-600 hover:bg-emerald-700"
                                }`}
                            >
                                {updatingStatus ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Updating...
                                    </>
                                ) : (
                                    pendingStatusChange.nextStatus === "Cancelled"
                                        ? "Yes, Cancel Reservation"
                                        : "Yes, Confirm Reservation"
                                )}
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

// ==========================================
// SKELETON ELEMENT
// ==========================================

function Skeleton({ className = "" }) {
    return (
        <div
            className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
        />
    );
}

// ==========================================
// RESERVATIONS PAGE SKELETON
// ==========================================

function ReservationsPageSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-8 bg-slate-50 px-4 py-6 sm:px-6 sm:py-8 xl:px-8">

            {/* Page Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-3">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-8 w-72 max-w-full" />
                    <Skeleton className="h-4 w-80 max-w-full" />
                </div>

                <div className="flex gap-2">
                    <Skeleton className="h-12 w-28 rounded-xl" />
                    <Skeleton className="h-12 w-40 rounded-xl" />
                </div>
            </div>

            {/* Statistics Skeleton */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-8 w-16" />
                            </div>

                            <Skeleton className="h-12 w-12 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters Skeleton */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                </div>
            </div>

            {/* Table Skeleton */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-3 w-44" />
                    </div>

                    <Skeleton className="h-4 w-32" />
                </div>

                <div className="hidden grid-cols-7 gap-4 bg-slate-50 px-5 py-4 md:grid">
                    {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                        <Skeleton
                            key={item}
                            className="h-3 w-20"
                        />
                    ))}
                </div>

                <div className="divide-y divide-slate-100">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div
                            key={item}
                            className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-7 md:items-center"
                        >
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-20" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-24" />
                            </div>

                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />

                            <div className="flex gap-2 md:justify-end">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <Skeleton className="h-9 w-9 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
