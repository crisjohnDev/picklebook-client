
import { useEffect, useMemo, useState } from "react";

import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock,
    Building2,
    RefreshCw,
    Loader2,
    CheckCircle2,
    XCircle,
    History,
    CalendarCheck,
    UserRound,
    PhilippinePeso,
    AlertCircle
} from "lucide-react";

import courtService from "../../services/courtService";
import scheduleService from "../../services/scheduleService";

// ==========================================
// DATE HELPERS
// ==========================================

// Format a date as YYYY-MM-DD using local time.
const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// Get today's date.
const getToday = () => formatDateKey(new Date());

// Convert YYYY-MM-DD into a local Date object.
const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day);
};

// Format date for display.
const formatDate = (dateString) => {
    if (!dateString) return "";

    return parseLocalDate(dateString).toLocaleDateString("en-PH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};

// Format 24-hour time.
const formatTime = (time) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
};

// Format currency.
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(Number(amount || 0));
};

// ==========================================
// STATUS CONFIGURATION
// ==========================================

const statusConfig = {
    Available: {
        label: "Available",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500"
    },
    Reserved: {
        label: "Reserved",
        color: "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-500"
    },
    Past: {
        label: "Past",
        color: "bg-slate-100 text-slate-500 border-slate-200",
        dot: "bg-slate-400"
    }
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const Scheduling = () => {

    // ==========================================
    // STATES
    // ==========================================

    const [courts, setCourts] = useState([]);
    const [selectedCourt, setSelectedCourt] = useState("");

    const [selectedDate, setSelectedDate] = useState(getToday());

    const [currentMonth, setCurrentMonth] = useState(() => {
        const today = new Date();

        return new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );
    });

    const [slots, setSlots] = useState([]);
    const [scheduleInfo, setScheduleInfo] = useState(null);

    const [selectedSlot, setSelectedSlot] = useState(null);

    const [loadingCourts, setLoadingCourts] = useState(true);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // FETCH ACTIVE COURTS
    // ==========================================

    const fetchCourts = async () => {
        try {
            setLoadingCourts(true);
            setError("");

            const response = await courtService.getCourts({
                status: "active"
            });

            const activeCourts = response.courts || [];

            setCourts(activeCourts);

            if (activeCourts.length > 0) {
                setSelectedCourt((previous) => {
                    const stillExists = activeCourts.some(
                        (court) => court._id === previous
                    );

                    return stillExists
                        ? previous
                        : activeCourts[0]._id;
                });
            } else {
                setSelectedCourt("");
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load courts."
            );
        } finally {
            setLoadingCourts(false);
        }
    };

    useEffect(() => {
        fetchCourts();
    }, []);

    // ==========================================
    // SELECTED COURT
    // ==========================================

    const currentCourt = useMemo(() => {
        return courts.find(
            (court) => court._id === selectedCourt
        );
    }, [courts, selectedCourt]);

    // ==========================================
    // FETCH DAILY SCHEDULE
    // ==========================================

    const fetchSchedule = async () => {
        if (!selectedCourt || !selectedDate) {
            setSlots([]);
            setScheduleInfo(null);
            return;
        }

        try {
            setLoadingSchedule(true);
            setError("");
            setSelectedSlot(null);

            const response = await scheduleService.getSchedule(
                selectedCourt,
                selectedDate
            );

            setSlots(response.slots || []);

            setScheduleInfo({
                totalSlots: response.totalSlots || 0,
                availableSlots: response.availableSlots || 0,
                reservedSlots: response.reservedSlots || 0
            });

        } catch (err) {
            setSlots([]);
            setScheduleInfo(null);

            setError(
                err.response?.data?.message ||
                "Unable to load the selected court schedule."
            );
        } finally {
            setLoadingSchedule(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [selectedCourt, selectedDate]);

    // ==========================================
    // CALENDAR DAYS
    // ==========================================

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        const days = [];

        // Empty cells before the first day.
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Actual calendar days.
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);

            days.push({
                day,
                date: formatDateKey(date),
                isToday: formatDateKey(date) === getToday()
            });
        }

        return days;
    }, [currentMonth]);

    // ==========================================
    // CALENDAR NAVIGATION
    // ==========================================

    const changeMonth = (direction) => {
        setCurrentMonth((previous) => {
            return new Date(
                previous.getFullYear(),
                previous.getMonth() + direction,
                1
            );
        });
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedSlot(null);
    };

    const goToToday = () => {
        const today = getToday();

        setSelectedDate(today);

        setCurrentMonth(
            new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
            )
        );
    };

    // ==========================================
    // SCHEDULE STATISTICS
    // ==========================================

    const statistics = useMemo(() => {
        const total = slots.length;

        const available = slots.filter(
            (slot) => slot.status === "Available"
        ).length;

        const reserved = slots.filter(
            (slot) => slot.status === "Reserved"
        ).length;

        const past = slots.filter(
            (slot) => slot.status === "Past"
        ).length;

        return {
            total,
            available,
            reserved,
            past
        };
    }, [slots]);

    // ==========================================
    // SELECTED SLOT RESERVATION
    // ==========================================

    const selectedReservation = selectedSlot?.reservation || null;

    // ==========================================
    // LOADING SCREEN
    // ==========================================

    if (loadingCourts) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-600" />

                    <p className="text-sm text-slate-500">
                        Loading scheduling information...
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 xl:px-8 xl:py-10">

            {/* ==================================
                PAGE HEADER
            ================================== */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
                        <CalendarDays size={16} />
                        Staff Operations
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Scheduling
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Monitor court availability and daily reservations.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={goToToday}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        Today
                    </button>

                    <button
                        type="button"
                        onClick={fetchSchedule}
                        disabled={loadingSchedule || !selectedCourt}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={loadingSchedule ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ==================================
                ERROR MESSAGE
            ================================== */}

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle size={19} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* ==================================
                COURT SELECTOR
            ================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Building2 size={21} />
                    </div>

                    <div>
                        <h2 className="font-bold text-slate-900">
                            Select Court
                        </h2>

                        <p className="text-sm text-slate-500">
                            Choose a court to view its schedule.
                        </p>
                    </div>
                </div>

                {courts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                        <Building2 className="mx-auto mb-3 text-slate-300" size={30} />

                        <p className="font-semibold text-slate-700">
                            No active courts found.
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Contact an administrator to activate a court.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {courts.map((court) => {
                            const isSelected = selectedCourt === court._id;

                            return (
                                <button
                                    key={court._id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCourt(court._id);
                                        setSelectedSlot(null);
                                    }}
                                    className={`rounded-xl border p-4 text-left transition ${
                                        isSelected
                                            ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                                            : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <Building2
                                            size={20}
                                            className={
                                                isSelected
                                                    ? "text-emerald-600"
                                                    : "text-slate-400"
                                            }
                                        />

                                        {isSelected && (
                                            <CheckCircle2
                                                size={18}
                                                className="text-emerald-600"
                                            />
                                        )}
                                    </div>

                                    <p className="mt-3 font-bold text-slate-900">
                                        {court.name}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Court {court.courtNumber}
                                    </p>

                                    <p className="mt-3 text-sm font-semibold text-emerald-700">
                                        {formatCurrency(court.hourlyRate)}
                                        <span className="ml-1 text-xs font-normal text-slate-400">
                                            / hour
                                        </span>
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ==================================
                DAILY STATISTICS
            ================================== */}

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

                {/* TOTAL */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Total Slots
                        </p>

                        <CalendarDays className="text-blue-500" size={20} />
                    </div>

                    <p className="mt-3 text-2xl font-bold text-slate-900">
                        {loadingSchedule ? "—" : statistics.total}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Scheduled time slots
                    </p>
                </div>

                {/* AVAILABLE */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Available
                        </p>

                        <CheckCircle2 className="text-emerald-500" size={20} />
                    </div>

                    <p className="mt-3 text-2xl font-bold text-emerald-600">
                        {loadingSchedule ? "—" : statistics.available}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Open time slots
                    </p>
                </div>

                {/* RESERVED */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Reserved
                        </p>

                        <XCircle className="text-red-500" size={20} />
                    </div>

                    <p className="mt-3 text-2xl font-bold text-red-600">
                        {loadingSchedule ? "—" : statistics.reserved}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Occupied time slots
                    </p>
                </div>

                {/* PAST */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Past Slots
                        </p>

                        <History className="text-slate-400" size={20} />
                    </div>

                    <p className="mt-3 text-2xl font-bold text-slate-600">
                        {loadingSchedule ? "—" : statistics.past}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Already elapsed
                    </p>
                </div>
            </div>

            {/* ==================================
                CALENDAR AND SCHEDULE
            ================================== */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                {/* CALENDAR */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-slate-900">
                                Calendar
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Select a date.
                            </p>
                        </div>

                        <CalendarDays className="text-emerald-600" size={22} />
                    </div>

                    {/* MONTH NAVIGATION */}
                    <div className="mb-5 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => changeMonth(-1)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <h3 className="font-bold text-slate-800">
                            {currentMonth.toLocaleDateString("en-PH", {
                                month: "long",
                                year: "numeric"
                            })}
                        </h3>

                        <button
                            type="button"
                            onClick={() => changeMonth(1)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* WEEK DAYS */}
                    <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div
                                key={day}
                                className="py-2 text-[11px] font-semibold text-slate-400"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* CALENDAR GRID */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            if (!day) {
                                return (
                                    <div
                                        key={`empty-${index}`}
                                        className="aspect-square"
                                    />
                                );
                            }

                            const isSelected = selectedDate === day.date;

                            return (
                                <button
                                    key={day.date}
                                    type="button"
                                    onClick={() => handleDateSelect(day.date)}
                                    className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition ${
                                        isSelected
                                            ? "bg-emerald-600 font-bold text-white"
                                            : day.isToday
                                                ? "border border-emerald-500 bg-emerald-50 font-bold text-emerald-700"
                                                : "text-slate-700 hover:bg-slate-100"
                                    }`}
                                >
                                    {day.day}

                                    {day.isToday && !isSelected && (
                                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* SELECTED DATE */}
                    <div className="mt-6 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-400">
                            Selected Date
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                            {formatDate(selectedDate)}
                        </p>
                    </div>
                </section>

                {/* DAILY SCHEDULE */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">

                    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="font-bold text-slate-900">
                                Daily Court Schedule
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {currentCourt
                                    ? `${currentCourt.name} · ${formatDate(selectedDate)}`
                                    : "Select a court to view its schedule."}
                            </p>
                        </div>

                        {currentCourt && (
                            <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                                {currentCourt.openingTime} - {currentCourt.closingTime}
                            </span>
                        )}
                    </div>

                    {/* LEGEND */}
                    <div className="mb-5 flex flex-wrap gap-4 text-xs">
                        {Object.entries(statusConfig).map(([status, config]) => (
                            <div
                                key={status}
                                className="flex items-center gap-2 text-slate-600"
                            >
                                <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
                                {config.label}
                            </div>
                        ))}
                    </div>

                    {!selectedCourt ? (
                        <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center">
                            <Building2 className="mx-auto mb-3 text-slate-300" size={32} />

                            <p className="font-medium text-slate-600">
                                No court selected.
                            </p>
                        </div>
                    ) : loadingSchedule ? (
                        <div className="flex min-h-[300px] items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-600" />

                                <p className="text-sm text-slate-500">
                                    Loading daily schedule...
                                </p>
                            </div>
                        </div>
                    ) : slots.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center">
                            <CalendarCheck className="mx-auto mb-3 text-slate-300" size={32} />

                            <p className="font-medium text-slate-600">
                                No schedule available.
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                There are no time slots for this court and date.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* SLOT GRID */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {slots.map((slot) => {
                                    const config =
                                        statusConfig[slot.status] ||
                                        statusConfig.Past;

                                    const isSelected =
                                        selectedSlot?.startTime === slot.startTime;

                                    return (
                                        <button
                                            key={slot.startTime}
                                            type="button"
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`rounded-xl border p-3 text-left transition ${
                                                isSelected
                                                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                                                    : `${config.color} hover:opacity-80`
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <Clock
                                                    size={16}
                                                    className={
                                                        isSelected
                                                            ? "text-emerald-600"
                                                            : "text-current"
                                                    }
                                                />

                                                <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                                            </div>

                                            <p className="mt-3 text-sm font-bold">
                                                {formatTime(slot.startTime)}
                                            </p>

                                            <p className="mt-1 text-xs opacity-75">
                                                Until {formatTime(slot.endTime)}
                                            </p>

                                            <p className="mt-2 text-[11px] font-bold">
                                                {slot.status}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* SELECTED SLOT DETAILS */}
                            {selectedSlot && (
                                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                        <div>
                                            <p className="text-xs font-medium text-slate-400">
                                                Selected Time Slot
                                            </p>

                                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                                                {formatTime(selectedSlot.startTime)}
                                                {" - "}
                                                {formatTime(selectedSlot.endTime)}
                                            </h3>
                                        </div>

                                        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                                            statusConfig[selectedSlot.status]?.color ||
                                            statusConfig.Past.color
                                        }`}>
                                            {selectedSlot.status}
                                        </span>
                                    </div>

                                    {selectedReservation ? (
                                        <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">

                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                                <CalendarCheck size={18} className="text-emerald-600" />
                                                Reservation Information
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Customer
                                                    </p>

                                                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                                        <UserRound size={15} className="text-slate-400" />

                                                        {selectedReservation.customer?.fullName ||
                                                            "Customer information unavailable"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Reservation Status
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                                        {selectedReservation.status || "Reserved"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Payment Status
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                                        {selectedReservation.paymentStatus || "Not available"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Total Amount
                                                    </p>

                                                    <p className="mt-1 flex items-center gap-1 text-sm font-bold text-emerald-700">
                                                        <PhilippinePeso size={15} />

                                                        {formatCurrency(
                                                            selectedReservation.totalAmount
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {selectedReservation.notes && (
                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Notes
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-700">
                                                        {selectedReservation.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-500">
                                            No reservation is assigned to this time slot.
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>

            {/* ==================================
                SCHEDULE FOOTER
            ================================== */}

            {scheduleInfo && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h3 className="font-bold text-slate-900">
                                Daily Availability Overview
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                {currentCourt?.name} · {formatDate(selectedDate)}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-5">
                            <div>
                                <p className="text-xs text-slate-400">
                                    Available
                                </p>

                                <p className="mt-1 font-bold text-emerald-600">
                                    {scheduleInfo.availableSlots}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Reserved
                                </p>

                                <p className="mt-1 font-bold text-red-600">
                                    {scheduleInfo.reservedSlots}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Total
                                </p>

                                <p className="mt-1 font-bold text-slate-900">
                                    {scheduleInfo.totalSlots}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Scheduling;
