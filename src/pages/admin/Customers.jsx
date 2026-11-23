
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    Search,
    Users,
    UserCheck,
    UserX,
    CalendarDays,
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Phone,
    CircleDollarSign,
    X,
    AlertTriangle,
    ShieldCheck
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
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

// ==========================================
// LOADING SKELETON
// ==========================================

const Skeleton = ({ className = "" }) => (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
);

const CustomerTableSkeleton = () => (
    <div className="space-y-5 p-6 sm:p-7">
        {Array.from({ length: 6 }).map((_, index) => (
            <div
                key={index}
                className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 last:border-0 sm:flex-row sm:items-center"
            >
                <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                </div>

                <div className="flex flex-wrap gap-5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                </div>

                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
        ))}
    </div>
);

const SummaryCardSkeleton = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-10 rounded-xl" />
        </div>

        <Skeleton className="mt-5 h-9 w-16" />
        <Skeleton className="mt-3 h-3 w-24" />
    </div>
);

// ==========================================
// MAIN CUSTOMERS COMPONENT
// ==========================================

const Customers = () => {
    // ==========================================
    // CUSTOMER DATA
    // ==========================================

    const [customers, setCustomers] = useState([]);

    // ==========================================
    // SEARCH AND FILTER
    // ==========================================

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [page, setPage] = useState(1);

    // ==========================================
    // PAGINATION
    // ==========================================

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });

    // ==========================================
    // LOADING AND ERROR STATES
    // ==========================================

    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==========================================
    // CUSTOM CONFIRMATION MODAL
    // ==========================================

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // ==========================================
    // LOAD CUSTOMERS
    // ==========================================

    const loadCustomers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await customerService.getCustomers({
                search: search.trim(),
                status,
                page,
                limit: 10
            });

            setCustomers(response.customers || []);

            setPagination(
                response.pagination || {
                    total: 0,
                    page: 1,
                    limit: 10,
                    totalPages: 0
                }
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load customers."
            );
        } finally {
            setLoading(false);
        }
    }, [search, status, page]);

    // ==========================================
    // INITIAL DATA LOADING
    // ==========================================

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    // ==========================================
    // SEARCH HANDLER
    // ==========================================

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };

    // ==========================================
    // STATUS FILTER HANDLER
    // ==========================================

    const handleStatusFilter = (value) => {
        setStatus(value);
        setPage(1);
    };

    // ==========================================
    // OPEN STATUS CONFIRMATION MODAL
    // ==========================================

    const handleToggleStatus = (customer) => {
        setSelectedCustomer(customer);
        setError("");
        setSuccess("");
        setShowConfirmModal(true);
    };

    // ==========================================
    // CLOSE STATUS CONFIRMATION MODAL
    // ==========================================

    const closeConfirmModal = () => {
        if (updatingId) return;

        setShowConfirmModal(false);
        setSelectedCustomer(null);
    };

    // ==========================================
    // CONFIRM ACTIVATE / DEACTIVATE
    // ==========================================

    const confirmToggleStatus = async () => {
        if (!selectedCustomer || updatingId) return;

        const customer = selectedCustomer;
        const nextStatus = !customer.isActive;

        try {
            setUpdatingId(customer._id);
            setError("");
            setSuccess("");

            await customerService.updateCustomerStatus(
                customer._id,
                nextStatus
            );

            setShowConfirmModal(false);
            setSelectedCustomer(null);

            setSuccess(
                `${customer.fullName}'s account has been ${
                    nextStatus ? "activated" : "deactivated"
                } successfully.`
            );

            await loadCustomers();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update customer status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // ==========================================
    // CUSTOMER STATISTICS
    // ==========================================

    const activeCount = customers.filter(
        (customer) => customer.isActive
    ).length;

    const inactiveCount = customers.filter(
        (customer) => !customer.isActive
    ).length;

    const totalBookings = customers.reduce(
        (total, customer) =>
            total + Number(customer.totalBookings || 0),
        0
    );

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">

            {/* PAGE HEADER */}

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-600">
                        Customer Relations
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Customer Management
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Manage customer accounts, profiles, and booking history.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadCustomers}
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

            {/* ERROR MESSAGE */}

            {error && (
                <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">

                    <div className="flex items-start gap-3">
                        <UserX size={19} className="mt-0.5 shrink-0" />

                        <div>
                            <p className="font-semibold">
                                Something went wrong
                            </p>

                            <p className="mt-1">
                                {error}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                        className="rounded-lg p-1 transition hover:bg-red-100"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* SUCCESS MESSAGE */}

            {success && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">

                    <div className="flex items-center gap-2">
                        <UserCheck size={18} />
                        <span>{success}</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        aria-label="Dismiss success"
                        className="rounded-lg p-1 transition hover:bg-emerald-100"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* SUMMARY CARDS */}

            {loading && customers.length === 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <SummaryCardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

                    {/* TOTAL CUSTOMERS */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-7">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Total Customers
                            </p>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Users size={22} />
                            </div>
                        </div>

                        <h2 className="mt-5 text-3xl font-bold tabular-nums text-slate-900">
                            {pagination.total}
                        </h2>

                        <p className="mt-2 text-xs text-slate-400">
                            Registered customer accounts
                        </p>
                    </div>

                    {/* ACTIVE CUSTOMERS */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-7">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Active on This Page
                            </p>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <UserCheck size={22} />
                            </div>
                        </div>

                        <h2 className="mt-5 text-3xl font-bold tabular-nums text-emerald-600">
                            {activeCount}
                        </h2>

                        <p className="mt-2 text-xs text-slate-400">
                            Currently active accounts
                        </p>
                    </div>

                    {/* INACTIVE CUSTOMERS */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-7">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Inactive on This Page
                            </p>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                <UserX size={22} />
                            </div>
                        </div>

                        <h2 className="mt-5 text-3xl font-bold tabular-nums text-red-500">
                            {inactiveCount}
                        </h2>

                        <p className="mt-2 text-xs text-slate-400">
                            Deactivated accounts
                        </p>
                    </div>

                    {/* TOTAL BOOKINGS */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-7">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Bookings on This Page
                            </p>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <CalendarDays size={22} />
                            </div>
                        </div>

                        <h2 className="mt-5 text-3xl font-bold tabular-nums text-violet-600">
                            {totalBookings}
                        </h2>

                        <p className="mt-2 text-xs text-slate-400">
                            Combined customer bookings
                        </p>
                    </div>

                </div>
            )}

            {/* SEARCH AND FILTERS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

                <div className="mb-5">
                    <h2 className="font-bold text-slate-900">
                        Search and Filters
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Find customers by name, username, or account status.
                    </p>
                </div>

                <div className="flex flex-col gap-4 md:flex-row">

                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                handleSearchChange(event.target.value)
                            }
                            placeholder="Search name, username, or phone..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(event) =>
                            handleStatusFilter(event.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 md:min-w-[190px]"
                    >
                        <option value="All">All Accounts</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>

                </div>
            </div>

            {/* CUSTOMER TABLE */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* TABLE HEADER */}

                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:px-7">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Registered Customers
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {pagination.total} customer account(s) found
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Users size={15} />
                        Customer Directory
                    </div>
                </div>

                {/* LOADING */}

                {loading ? (
                    <CustomerTableSkeleton />
                ) : customers.length === 0 ? (

                    /* EMPTY STATE */

                    <div className="px-6 py-20 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <Users size={32} />
                        </div>

                        <h3 className="font-bold text-slate-800">
                            No customers found
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            Try changing your search or account-status filter.
                        </p>

                        {(search || status !== "All") && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setStatus("All");
                                    setPage(1);
                                }}
                                className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* TABLE */}

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[950px] text-left text-sm">

                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-6 py-5 font-semibold">
                                            Customer
                                        </th>

                                        <th className="px-6 py-5 font-semibold">
                                            Contact
                                        </th>

                                        <th className="px-6 py-5 font-semibold">
                                            Bookings
                                        </th>

                                        <th className="px-6 py-5 font-semibold">
                                            Completed
                                        </th>

                                        <th className="px-6 py-5 font-semibold">
                                            Total Spent
                                        </th>

                                        <th className="px-6 py-5 font-semibold">
                                            Joined
                                        </th>

                                        <th className="px-6 py-5 font-semibold">
                                            Status
                                        </th>

                                        <th className="px-6 py-5 text-right font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {customers.map((customer) => (
                                        <tr
                                            key={customer._id}
                                            className="transition hover:bg-slate-50"
                                        >

                                            {/* CUSTOMER */}

                                            <td className="px-6 py-5">
                                                <div className="font-semibold text-slate-900">
                                                    {customer.fullName}
                                                </div>

                                                <div className="mt-1 text-xs text-slate-500">
                                                    @{customer.username}
                                                </div>
                                            </td>

                                            {/* CONTACT */}

                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Phone
                                                        size={14}
                                                        className="shrink-0 text-slate-400"
                                                    />

                                                    {customer.phone || "No phone"}
                                                </div>
                                            </td>

                                            {/* BOOKINGS */}

                                            <td className="px-6 py-5 font-semibold text-slate-700">
                                                {customer.totalBookings || 0}
                                            </td>

                                            {/* COMPLETED */}

                                            <td className="px-6 py-5 text-slate-700">
                                                {customer.completedBookings || 0}
                                            </td>

                                            {/* TOTAL SPENT */}

                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 font-semibold text-slate-800">
                                                    <CircleDollarSign
                                                        size={15}
                                                        className="text-emerald-600"
                                                    />

                                                    {formatCurrency(customer.totalSpent)}
                                                </div>
                                            </td>

                                            {/* JOINED DATE */}

                                            <td className="px-6 py-5 text-slate-500">
                                                {formatDate(customer.createdAt)}
                                            </td>

                                            {/* STATUS */}

                                            <td className="px-6 py-5">
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
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}

                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">

                                                    <Link
                                                        to={`/admin/customers/${customer._id}`}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
                                                    >
                                                        <Eye size={14} />
                                                        View
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleToggleStatus(customer)
                                                        }
                                                        disabled={
                                                            updatingId === customer._id
                                                        }
                                                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                            customer.isActive
                                                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                                                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                        }`}
                                                    >
                                                        {updatingId === customer._id
                                                            ? "Updating..."
                                                            : customer.isActive
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>

                        {/* PAGINATION */}

                        <div className="flex flex-col justify-between gap-4 border-t border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:px-7">

                            <p className="text-sm text-slate-500">
                                Page{" "}
                                <span className="font-semibold text-slate-800">
                                    {pagination.page}
                                </span>
                                {" "}of{" "}
                                <span className="font-semibold text-slate-800">
                                    {pagination.totalPages || 1}
                                </span>

                                <span className="mx-2 text-slate-300">·</span>

                                {pagination.total} total customers
                            </p>

                            <div className="flex items-center gap-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.max(1, current - 1)
                                        )
                                    }
                                    disabled={page <= 1 || loading}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.min(
                                                pagination.totalPages,
                                                current + 1
                                            )
                                        )
                                    }
                                    disabled={
                                        page >= pagination.totalPages ||
                                        loading ||
                                        pagination.totalPages === 0
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>

                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ==========================================
                CUSTOM ACTIVATE / DEACTIVATE MODAL
            ========================================== */}

            {showConfirmModal && selectedCustomer && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeConfirmModal();
                        }
                    }}
                >
                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="px-6 pb-2 pt-6 text-center">

                            <div
                                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                                    selectedCustomer.isActive
                                        ? "bg-red-100 text-red-600"
                                        : "bg-emerald-100 text-emerald-600"
                                }`}
                            >
                                {selectedCustomer.isActive ? (
                                    <AlertTriangle size={30} />
                                ) : (
                                    <ShieldCheck size={30} />
                                )}
                            </div>

                            <h2 className="mt-4 text-xl font-bold text-slate-900">
                                {selectedCustomer.isActive
                                    ? "Deactivate Customer?"
                                    : "Activate Customer?"}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {selectedCustomer.isActive
                                    ? "Are you sure you want to deactivate this customer account? The customer may no longer be able to access their account."
                                    : "Are you sure you want to activate this customer account? The customer will be able to access their account again."}
                            </p>

                        </div>

                        {/* CUSTOMER DETAILS */}

                        <div className="mx-6 mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                            <div className="flex items-center gap-3">

                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold ${
                                        selectedCustomer.isActive
                                            ? "bg-red-100 text-red-600"
                                            : "bg-emerald-100 text-emerald-600"
                                    }`}
                                >
                                    {selectedCustomer.fullName
                                        ?.charAt(0)
                                        ?.toUpperCase() || "C"}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate font-bold text-slate-900">
                                        {selectedCustomer.fullName}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-slate-500">
                                        @{selectedCustomer.username}
                                    </p>
                                </div>

                            </div>

                            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">

                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-medium text-slate-500">
                                        Contact Number
                                    </span>

                                    <span className="text-right text-sm font-semibold text-slate-800">
                                        {selectedCustomer.phone || "Not provided"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-medium text-slate-500">
                                        Current Status
                                    </span>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            selectedCustomer.isActive
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {selectedCustomer.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-medium text-slate-500">
                                        New Status
                                    </span>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            selectedCustomer.isActive
                                                ? "bg-red-100 text-red-700"
                                                : "bg-emerald-100 text-emerald-700"
                                        }`}
                                    >
                                        {selectedCustomer.isActive
                                            ? "Inactive"
                                            : "Active"}
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* MODAL ACTIONS */}

                        <div className="flex flex-col-reverse gap-3 px-6 py-6 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={closeConfirmModal}
                                disabled={Boolean(updatingId)}
                                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                No, Go Back
                            </button>

                            <button
                                type="button"
                                onClick={confirmToggleStatus}
                                disabled={Boolean(updatingId)}
                                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                    selectedCustomer.isActive
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-emerald-600 hover:bg-emerald-700"
                                }`}
                            >
                                {updatingId ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Updating...
                                    </>
                                ) : (
                                    selectedCustomer.isActive
                                        ? "Yes, Deactivate Account"
                                        : "Yes, Activate Account"
                                )}
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Customers;
