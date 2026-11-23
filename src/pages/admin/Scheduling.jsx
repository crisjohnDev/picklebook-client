
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock,
    RefreshCw,
    CheckCircle2,
    XCircle,
    History,
    CalendarCheck,
    Building2,
    CircleDollarSign
} from "lucide-react";

import courtService from "../../services/courtService";
import scheduleService from "../../services/scheduleService";

// ==========================================
// DATE HELPERS
// ==========================================

const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getTodayKey = () => getDateKey(new Date());

const formatDate = (dateString) => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-PH", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });
};

const formatMonth = (date) => {
    return date.toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric"
    });
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(Number(amount || 0));
};

// ==========================================
// STATUS STYLES
// ==========================================

const statusStyles = {
    Available: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Reserved: "bg-blue-50 text-blue-700 border-blue-200",
    Past: "bg-slate-100 text-slate-500 border-slate-200"
};

// ==========================================
// LOADING SKELETON COMPONENTS
// ==========================================

const Skeleton = ({ className = "" }) => (
    <div
        className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
);

const CourtSelectorSkeleton = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Skeleton className="mb-3 h-4 w-28" />
        <Skeleton className="h-12 w-full sm:max-w-md" />

        <div className="mt-4 flex flex-wrap gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-36" />
        </div>
    </div>
);

const AvailabilitySkeleton = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
            <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                </div>

                <Skeleton className="mt-4 h-9 w-16" />
                <Skeleton className="mt-2 h-3 w-24" />
            </div>
        ))}
    </div>
);

const CalendarSkeleton = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
            <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-48" />
            </div>

            <div className="flex gap-2">
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
            </div>
        </div>

        <Skeleton className="mx-auto mb-5 h-5 w-36" />

        <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, index) => (
                <Skeleton
                    key={index}
                    className="aspect-square w-full rounded-lg"
                />
            ))}
        </div>

        <div className="mt-5 flex gap-5 border-t border-slate-100 pt-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
        </div>
    </div>
);

const TimeSlotsSkeleton = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-6 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-48" />
        </div>

        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                >
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>

                    <Skeleton className="h-7 w-24 rounded-full" />
                </div>
            ))}
        </div>
    </div>
);

// ==========================================
// MAIN SCHEDULING COMPONENT
// ==========================================

const Scheduling = () => {
    const [courts, setCourts] = useState([]);
    const [selectedCourt, setSelectedCourt] = useState("");
    const [selectedDate, setSelectedDate] = useState(getTodayKey());

    const [schedule, setSchedule] = useState(null);

    const [loadingCourts, setLoadingCourts] = useState(true);
    const [loadingSchedule, setLoadingSchedule] = useState(false);

    const [error, setError] = useState("");

    const [calendarMonth, setCalendarMonth] = useState(() => {
        const today = new Date();

        return new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );
    });

    // ==========================================
    // LOAD ACTIVE COURTS
    // ==========================================

    const loadCourts = useCallback(async () => {
        try {
            setLoadingCourts(true);
            setError("");

            const response = await courtService.getCourts();

            const courtList = Array.isArray(response)
                ? response
                : response.courts || [];

            const activeCourts = courtList.filter(
                (court) => court.isActive
            );

            setCourts(activeCourts);

            if (activeCourts.length > 0) {
                setSelectedCourt((current) => {
                    const stillExists = activeCourts.some(
                        (court) => court._id === current
                    );

                    return stillExists
                        ? current
                        : activeCourts[0]._id;
                });
            } else {
                setSelectedCourt("");
                setSchedule(null);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load courts."
            );

            setCourts([]);
            setSelectedCourt("");
            setSchedule(null);
        } finally {
            setLoadingCourts(false);
        }
    }, []);

    // ==========================================
    // LOAD SELECTED COURT SCHEDULE
    // ==========================================

    const loadSchedule = useCallback(async () => {
        if (!selectedCourt || !selectedDate) {
            setSchedule(null);
            return;
        }

        try {
            setLoadingSchedule(true);
            setError("");

            const response = await scheduleService.getSchedule(
                selectedCourt,
                selectedDate
            );

            setSchedule(response);
        } catch (err) {
            setSchedule(null);

            setError(
                err.response?.data?.message ||
                "Unable to load court availability."
            );
        } finally {
            setLoadingSchedule(false);
        }
    }, [selectedCourt, selectedDate]);

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        loadCourts();
    }, [loadCourts]);

    // ==========================================
    // RELOAD SCHEDULE WHEN COURT OR DATE CHANGES
    // ==========================================

    useEffect(() => {
        if (!loadingCourts && selectedCourt) {
            loadSchedule();
        }
    }, [loadingCourts, selectedCourt, selectedDate, loadSchedule]);

    // ==========================================
    // BUILD MONTH CALENDAR
    // ==========================================

    const calendarDays = useMemo(() => {
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const numberOfDays = new Date(year, month + 1, 0).getDate();

        // Sunday = 0
        const startingDay = firstDay.getDay();

        const days = [];

        // Empty spaces before the first day
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // Actual calendar dates
        for (let day = 1; day <= numberOfDays; day++) {
            const date = new Date(year, month, day);

            days.push({
                day,
                dateKey: getDateKey(date)
            });
        }

        return days;
    }, [calendarMonth]);

    // ==========================================
    // CHANGE CALENDAR MONTH
    // ==========================================

    const changeMonth = (amount) => {
        setCalendarMonth((current) => {
            return new Date(
                current.getFullYear(),
                current.getMonth() + amount,
                1
            );
        });
    };

    // ==========================================
    // SELECT DATE
    // ==========================================

    const selectDate = (dateKey) => {
        setSelectedDate(dateKey);
    };

    // ==========================================
    // AVAILABILITY COUNTS
    // ==========================================

    const availableSlots =
        schedule?.availableSlots ??
        schedule?.slots?.filter(
            (slot) => slot.status === "Available"
        ).length ??
        0;

    const reservedSlots =
        schedule?.reservedSlots ??
        schedule?.slots?.filter(
            (slot) => slot.status === "Reserved"
        ).length ??
        0;

    const pastSlots =
        schedule?.slots?.filter(
            (slot) => slot.status === "Past"
        ).length || 0;

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">

            {/* ================================== */}
            {/* PAGE HEADER */}
            {/* ================================== */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-emerald-600">
                        Court Operations
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Scheduling
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage court schedules, time slots, and daily availability.
                    </p>
                </div>

                <button
                    onClick={() => {
                        if (selectedCourt) {
                            loadSchedule();
                        } else {
                            loadCourts();
                        }
                    }}
                    disabled={loadingCourts || loadingSchedule}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={
                            loadingCourts || loadingSchedule
                                ? "animate-spin"
                                : ""
                        }
                    />

                    Refresh Data
                </button>
            </div>

            {/* ================================== */}
            {/* ERROR MESSAGE */}
            {/* ================================== */}

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <XCircle size={18} className="mt-0.5 shrink-0" />

                    <div>
                        <p className="font-semibold">
                            Unable to load scheduling data
                        </p>

                        <p className="mt-1">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* ================================== */}
            {/* COURT SELECTOR */}
            {/* ================================== */}

            {loadingCourts ? (
                <CourtSelectorSkeleton />
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Building2 size={20} />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-900">
                                Court Selection
                            </h2>

                            <p className="text-xs text-slate-500">
                                Choose a court to view its schedule.
                            </p>
                        </div>
                    </div>

                    <label
                        htmlFor="court"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Select Court
                    </label>

                    <select
                        id="court"
                        value={selectedCourt}
                        onChange={(event) => {
                            setSelectedCourt(event.target.value);
                            setSchedule(null);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:max-w-md"
                    >
                        {courts.length === 0 && (
                            <option value="">
                                No active courts available
                            </option>
                        )}

                        {courts.map((court) => (
                            <option
                                key={court._id}
                                value={court._id}
                            >
                                {court.name} ({court.courtNumber})
                            </option>
                        ))}
                    </select>

                    {schedule?.court && (
                        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-slate-400">
                                    Operating Hours
                                </p>

                                <p className="mt-1 font-semibold text-slate-700">
                                    {schedule.court.openingTime} - {schedule.court.closingTime}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Slot Duration
                                </p>

                                <p className="mt-1 font-semibold text-slate-700">
                                    {schedule.court.slotDurationMinutes} minutes
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Hourly Rate
                                </p>

                                <p className="mt-1 font-semibold text-slate-700">
                                    {formatCurrency(schedule.court.hourlyRate)}/hour
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ================================== */}
            {/* NO ACTIVE COURTS */}
            {/* ================================== */}

            {!loadingCourts && (!selectedCourt || courts.length === 0) ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <CalendarDays size={30} />
                    </div>

                    <h2 className="font-bold text-slate-900">
                        No Active Courts Found
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                        Add or activate a court before managing its schedule.
                    </p>

                    <button
                        onClick={loadCourts}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        <RefreshCw size={15} />
                        Reload Courts
                    </button>
                </div>
            ) : null}

            {/* ================================== */}
            {/* SCHEDULING CONTENT */}
            {/* ================================== */}

            {!loadingCourts && selectedCourt && courts.length > 0 && (
                <>
                    {/* AVAILABILITY SUMMARY */}

                    {loadingSchedule && !schedule ? (
                        <AvailabilitySkeleton />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                            {/* AVAILABLE SLOTS */}

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Available Slots
                                        </p>

                                        <h2 className="mt-2 text-3xl font-bold tabular-nums text-emerald-600">
                                            {loadingSchedule ? "--" : availableSlots}
                                        </h2>
                                    </div>

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                        <CheckCircle2 size={22} />
                                    </div>
                                </div>

                                <p className="mt-3 text-xs text-slate-400">
                                    Open time slots for booking
                                </p>
                            </div>

                            {/* RESERVED SLOTS */}

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Reserved Slots
                                        </p>

                                        <h2 className="mt-2 text-3xl font-bold tabular-nums text-blue-600">
                                            {loadingSchedule ? "--" : reservedSlots}
                                        </h2>
                                    </div>

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <CalendarCheck size={22} />
                                    </div>
                                </div>

                                <p className="mt-3 text-xs text-slate-400">
                                    Time slots with reservations
                                </p>
                            </div>

                            {/* PAST SLOTS */}

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Past Slots
                                        </p>

                                        <h2 className="mt-2 text-3xl font-bold tabular-nums text-slate-600">
                                            {loadingSchedule ? "--" : pastSlots}
                                        </h2>
                                    </div>

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                        <History size={22} />
                                    </div>
                                </div>

                                <p className="mt-3 text-xs text-slate-400">
                                    Time slots that have already passed
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ================================== */}
                    {/* CALENDAR AND DAILY TIME SLOTS */}
                    {/* ================================== */}

                    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">

                        {/* ================================== */}
                        {/* MONTHLY CALENDAR */}
                        {/* ================================== */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Monthly Calendar
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Select a date to view availability.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => changeMonth(-1)}
                                        className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                                        aria-label="Previous month"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <button
                                        onClick={() => changeMonth(1)}
                                        className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                                        aria-label="Next month"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="mb-5 text-center font-bold text-slate-800">
                                {formatMonth(calendarMonth)}
                            </h3>

                            <div className="grid grid-cols-7 gap-1 text-center">

                                {/* WEEKDAY HEADERS */}

                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                                    (day) => (
                                        <div
                                            key={day}
                                            className="py-2 text-xs font-bold uppercase tracking-wide text-slate-400"
                                        >
                                            {day}
                                        </div>
                                    )
                                )}

                                {/* CALENDAR DAYS */}

                                {calendarDays.map((item, index) => {
                                    if (!item) {
                                        return (
                                            <div
                                                key={`empty-${index}`}
                                                className="aspect-square"
                                            />
                                        );
                                    }

                                    const isSelected =
                                        item.dateKey === selectedDate;

                                    const isToday =
                                        item.dateKey === getTodayKey();

                                    return (
                                        <button
                                            key={item.dateKey}
                                            onClick={() => selectDate(item.dateKey)}
                                            className={`flex aspect-square items-center justify-center rounded-xl text-sm transition ${
                                                isSelected
                                                    ? "bg-emerald-600 font-bold text-white shadow-sm"
                                                    : isToday
                                                        ? "border border-emerald-500 font-bold text-emerald-700"
                                                        : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                                            }`}
                                        >
                                            {item.day}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* CALENDAR LEGEND */}

                            <div className="mt-6 flex flex-wrap gap-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
                                <span className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded bg-emerald-600" />
                                    Selected Date
                                </span>

                                <span className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded border border-emerald-500" />
                                    Today
                                </span>
                            </div>
                        </div>

                        {/* ================================== */}
                        {/* DAILY TIME SLOTS */}
                        {/* ================================== */}

                        {loadingSchedule ? (
                            <TimeSlotsSkeleton />
                        ) : (
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                                <div className="mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                            <Clock size={20} />
                                        </div>

                                        <div>
                                            <h2 className="font-bold text-slate-900">
                                                Daily Time Slots
                                            </h2>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {formatDate(selectedDate)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {!schedule?.slots?.length ? (
                                    <div className="py-12 text-center">
                                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            <CalendarDays size={26} />
                                        </div>

                                        <h3 className="font-semibold text-slate-800">
                                            No Time Slots Available
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            There are no available time slots for this date.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="max-h-[650px] space-y-3 overflow-y-auto pr-1">

                                        {schedule.slots.map((slot) => {
                                            const reservation = slot.reservation;

                                            return (
                                                <div
                                                    key={`${slot.startTime}-${slot.endTime}`}
                                                    className="rounded-xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:shadow-sm"
                                                >
                                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                                                        {/* SLOT DETAILS */}

                                                        <div>
                                                            <div className="flex items-center gap-2 font-bold text-slate-800">
                                                                <Clock
                                                                    size={16}
                                                                    className="text-emerald-600"
                                                                />

                                                                {slot.startTime} - {slot.endTime}
                                                            </div>

                                                            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                                                <CircleDollarSign
                                                                    size={15}
                                                                    className="text-slate-400"
                                                                />

                                                                {formatCurrency(slot.amount)}
                                                            </div>

                                                            {reservation?.customer && (
                                                                <p className="mt-2 text-xs text-slate-500">
                                                                    Customer:{" "}
                                                                    <span className="font-semibold text-slate-700">
                                                                        {reservation.customer.fullName}
                                                                    </span>
                                                                </p>
                                                            )}

                                                            {reservation?.status && (
                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    Reservation:{" "}
                                                                    <span className="font-medium text-slate-700">
                                                                        {reservation.status}
                                                                    </span>
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* SLOT STATUS */}

                                                        <span
                                                            className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
                                                                statusStyles[slot.status] ||
                                                                statusStyles.Past
                                                            }`}
                                                        >
                                                            {slot.status === "Reserved" ? (
                                                                <XCircle size={13} />
                                                            ) : slot.status === "Available" ? (
                                                                <CheckCircle2 size={13} />
                                                            ) : (
                                                                <History size={13} />
                                                            )}

                                                            {slot.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Scheduling;
