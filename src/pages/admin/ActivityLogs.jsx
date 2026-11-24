
import { useCallback, useEffect, useState } from "react";

import {
    Activity,
    Search,
    RefreshCw,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Filter,
    User,
    Clock,
    AlertCircle,
    X,
    ShieldCheck,
    ClipboardList,
    RotateCcw
} from "lucide-react";

import activityLogService from "../../services/activityLogService";

// ==========================================
// CONSTANTS
// ==========================================

const CATEGORIES = [
    "all",
    "reservation",
    "payment",
    "customer",
    "court",
    "schedule",
    "user",
    "system"
];

const CATEGORY_STYLES = {
    reservation: "bg-blue-50 text-blue-700 ring-blue-600/20",
    payment: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    customer: "bg-purple-50 text-purple-700 ring-purple-600/20",
    court: "bg-orange-50 text-orange-700 ring-orange-600/20",
    schedule: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    user: "bg-pink-50 text-pink-700 ring-pink-600/20",
    system: "bg-slate-100 text-slate-700 ring-slate-600/20"
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const formatDate = (date) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit"
    });
};

const formatAction = (action = "") => {
    return action
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

// ==========================================
// ACTIVITY LOG PAGE
// ==========================================

export default function ActivityLogs() {

    // --------------------------------------
    // STATE
    // --------------------------------------

    const [activities, setActivities] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [category, setCategory] = useState("all");

    const [startDate, setStartDate] = useState("");

    const [endDate, setEndDate] = useState("");

    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
    });

    // --------------------------------------
    // FETCH ACTIVITIES
    // --------------------------------------

    const fetchActivities = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                limit: 20
            };

            if (search.trim()) {
                params.search = search.trim();
            }

            if (category !== "all") {
                params.category = category;
            }

            if (startDate) {
                params.startDate = startDate;
            }

            if (endDate) {
                params.endDate = endDate;
            }

            const response =
                await activityLogService.getActivities(params);

            setActivities(response.activities || []);

            setPagination(
                response.pagination || {
                    total: 0,
                    page: 1,
                    limit: 20,
                    totalPages: 0
                }
            );

        } catch (err) {
            console.error("Activity Logs Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load activity logs."
            );

        } finally {
            setLoading(false);
        }
    }, [page, search, category, startDate, endDate]);

    // --------------------------------------
    // LOAD ACTIVITIES
    // --------------------------------------

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    // --------------------------------------
    // FILTER HANDLERS
    // --------------------------------------

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        setPage(1);
    };

    const handleStartDateChange = (value) => {
        setStartDate(value);
        setPage(1);
    };

    const handleEndDateChange = (value) => {
        setEndDate(value);
        setPage(1);
    };

    const clearFilters = () => {
        setSearch("");
        setCategory("all");
        setStartDate("");
        setEndDate("");
        setPage(1);
    };

    const hasFilters =
        search ||
        category !== "all" ||
        startDate ||
        endDate;

    // --------------------------------------
    // RENDER
    // --------------------------------------

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">

            {/* ==================================
                PAGE HEADER
            ================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <Activity size={21} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                                Activity Logs
                            </h1>

                            <p className="text-xs text-slate-500 sm:text-sm">
                                System activity monitoring and audit history
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={fetchActivities}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />

                    Refresh
                </button>

            </div>

            {/* ==================================
                SUMMARY CARDS
            ================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* TOTAL ACTIVITIES */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Activities
                            </p>

                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                {pagination.total.toLocaleString()}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Recorded system actions
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <ClipboardList size={24} />
                        </div>

                    </div>
                </div>

                {/* CURRENT PAGE */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Current Page
                            </p>

                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                {pagination.totalPages > 0 ? page : 0}
                                <span className="ml-1 text-base font-medium text-slate-400">
                                    / {pagination.totalPages}
                                </span>
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Activity records per page: 20
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <ShieldCheck size={24} />
                        </div>

                    </div>
                </div>

            </div>

            {/* ==================================
                FILTER SECTION
            ================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-emerald-600" />

                        <h2 className="text-sm font-bold text-slate-800">
                            Filter Activities
                        </h2>
                    </div>

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition hover:text-emerald-800"
                        >
                            <RotateCcw size={13} />
                            Reset filters
                        </button>
                    )}

                </div>

                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">

                    {/* SEARCH */}

                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Search
                        </label>

                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                placeholder="Search activities..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </div>

                    {/* CATEGORY */}

                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Category
                        </label>

                        <select
                            value={category}
                            onChange={(e) =>
                                handleCategoryChange(e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        >
                            {CATEGORIES.map((item) => (
                                <option key={item} value={item}>
                                    {item === "all"
                                        ? "All Categories"
                                        : item.charAt(0).toUpperCase() +
                                          item.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* START DATE */}

                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Start Date
                        </label>

                        <div className="relative">
                            <CalendarDays
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="date"
                                value={startDate}
                                max={endDate || undefined}
                                onChange={(e) =>
                                    handleStartDateChange(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </div>

                    {/* END DATE */}

                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            End Date
                        </label>

                        <div className="relative">
                            <CalendarDays
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(e) =>
                                    handleEndDateChange(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </div>

                </div>

            </div>

            {/* ==================================
                ACTIVITY HISTORY
            ================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* SECTION HEADER */}

                <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h2 className="text-sm font-bold text-slate-900">
                            Activity History
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Review actions performed throughout your system.
                        </p>
                    </div>

                    <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {pagination.total.toLocaleString()} Records
                    </span>

                </div>

                {/* LOADING */}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">

                        <RefreshCw
                            size={28}
                            className="animate-spin text-emerald-600"
                        />

                        <p className="mt-3 text-sm font-medium text-slate-600">
                            Loading activity history...
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Please wait
                        </p>

                    </div>
                )}

                {/* ERROR */}

                {!loading && error && (
                    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">

                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                            <AlertCircle size={28} />
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-slate-900">
                            Unable to load activities
                        </h3>

                        <p className="mt-1 max-w-md text-sm text-slate-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchActivities}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            <RefreshCw size={15} />
                            Try Again
                        </button>

                    </div>
                )}

                {/* EMPTY STATE */}

                {!loading && !error && activities.length === 0 && (
                    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <Activity size={30} />
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-slate-900">
                            No activities found
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-slate-500">
                            No records match your current filters.
                            Activities will appear here when actions
                            are recorded in PickleBook.
                        </p>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                            >
                                Clear all filters
                            </button>
                        )}

                    </div>
                )}

                {/* ACTIVITY TIMELINE */}

                {!loading && !error && activities.length > 0 && (
                    <div className="divide-y divide-slate-100">

                        {activities.map((activity) => (

                            <div
                                key={activity._id}
                                className="flex gap-4 px-5 py-5 transition hover:bg-slate-50/80 sm:px-6"
                            >

                                {/* ACTIVITY ICON */}

                                <div className="relative flex shrink-0 flex-col items-center">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                        <Activity size={19} />
                                    </div>

                                </div>

                                {/* ACTIVITY INFORMATION */}

                                <div className="min-w-0 flex-1">

                                    <div className="flex flex-wrap items-center gap-2">

                                        <h3 className="text-sm font-bold text-slate-900">
                                            {formatAction(activity.action)}
                                        </h3>

                                        <span
                                            className={`
                                                inline-flex items-center rounded-full
                                                px-2.5 py-1 text-[10px]
                                                font-bold uppercase tracking-wide
                                                ring-1 ring-inset

                                                ${
                                                    CATEGORY_STYLES[
                                                        activity.category
                                                    ] ||
                                                    "bg-slate-100 text-slate-700 ring-slate-600/20"
                                                }
                                            `}
                                        >
                                            {activity.category || "system"}
                                        </span>

                                    </div>

                                    <p className="mt-1.5 text-sm leading-6 text-slate-600">
                                        {activity.description}
                                    </p>

                                    {/* METADATA */}

                                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">

                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                            <User
                                                size={14}
                                                className="text-slate-400"
                                            />

                                            {activity.actorName ||
                                                activity.actor?.username ||
                                                "System"}
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                            <Clock
                                                size={14}
                                                className="text-slate-400"
                                            />

                                            {formatDate(activity.createdAt)}
                                            {" · "}
                                            {formatTime(activity.createdAt)}
                                        </span>

                                        {activity.actorRole && (
                                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                                {activity.actorRole}
                                            </span>
                                        )}

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

                {/* ==================================
                    PAGINATION
                ================================== */}

                {!loading && !error && pagination.total > 0 && (
                    <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                        <p className="text-xs text-slate-500">
                            Showing{" "}
                            <span className="font-bold text-slate-800">
                                {(page - 1) * pagination.limit + 1}
                            </span>
                            {" - "}
                            <span className="font-bold text-slate-800">
                                {Math.min(
                                    page * pagination.limit,
                                    pagination.total
                                )}
                            </span>
                            {" of "}
                            <span className="font-bold text-slate-800">
                                {pagination.total}
                            </span>
                            {" activities"}
                        </p>

                        <div className="flex items-center gap-2">

                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage((current) => current - 1)
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={15} />
                                Previous
                            </button>

                            <span className="px-2 text-xs font-medium text-slate-600">
                                {page} / {pagination.totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={page >= pagination.totalPages}
                                onClick={() =>
                                    setPage((current) => current + 1)
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <ChevronRight size={15} />
                            </button>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}
