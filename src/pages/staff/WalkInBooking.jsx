
import { useEffect, useMemo, useState } from "react";

import {
    UserRound,
    Phone,
    Building2,
    CalendarDays,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ClipboardList,
    ArrowRight,
    RefreshCw
} from "lucide-react";

import courtService from "../../services/courtService";
import scheduleService from "../../services/scheduleService";
import api from "../../services/api";

// ==========================================
// DATE HELPERS
// ==========================================

// Get today's date using local time.
// Returns YYYY-MM-DD.
const getLocalDate = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// Format currency.
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(Number(amount || 0));
};

// Format 24-hour time into readable time.
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

// Format YYYY-MM-DD without UTC conversion.
const formatReservationDate = (dateString) => {
    if (!dateString) return "No date selected";

    const [year, month, day] = dateString.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const WalkInBooking = () => {

    // ==========================================
    // STATES
    // ==========================================

    const [courts, setCourts] = useState([]);
    const [slots, setSlots] = useState([]);

    const [loadingCourts, setLoadingCourts] = useState(true);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [selectedCourt, setSelectedCourt] = useState("");
    const [reservationDate, setReservationDate] = useState(getLocalDate());

    const [selectedStartTime, setSelectedStartTime] = useState("");
    const [selectedDuration, setSelectedDuration] = useState(1);

    const [customer, setCustomer] = useState({
        fullName: "",
        phone: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [createdReservation, setCreatedReservation] = useState(null);

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

            setCourts(response.courts || []);

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
    // FETCH COURT SCHEDULE
    // ==========================================

    const fetchSchedule = async () => {
        if (!selectedCourt || !reservationDate) {
            setSlots([]);
            return;
        }

        try {
            setLoadingSchedule(true);
            setError("");

            setSelectedStartTime("");
            setSelectedDuration(1);
            setSlots([]);

            const response = await scheduleService.getSchedule(
                selectedCourt,
                reservationDate
            );

            setSlots(response.slots || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load court availability."
            );
        } finally {
            setLoadingSchedule(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [selectedCourt, reservationDate]);

    // ==========================================
    // SELECTED COURT
    // ==========================================

    const currentCourt = useMemo(() => {
        return courts.find(
            (court) => court._id === selectedCourt
        );
    }, [courts, selectedCourt]);

    // ==========================================
    // AVAILABLE DURATION OPTIONS
    // Only consecutive available slots are allowed.
    // ==========================================

    const durationOptions = useMemo(() => {
        if (!selectedStartTime || !currentCourt) {
            return [];
        }

        const startIndex = slots.findIndex(
            (slot) => slot.startTime === selectedStartTime
        );

        if (startIndex === -1) return [];

        const options = [];

        for (let i = startIndex; i < slots.length; i++) {
            const slot = slots[i];

            if (slot.status !== "Available") break;

            const count = i - startIndex + 1;

            options.push({
                count,
                endTime: slot.endTime,
                durationMinutes:
                    count * currentCourt.slotDurationMinutes
            });
        }

        return options;
    }, [selectedStartTime, slots, currentCourt]);

    // ==========================================
    // SELECTED BOOKING DETAILS
    // ==========================================

    const bookingDetails = useMemo(() => {
        if (!selectedStartTime || !currentCourt) {
            return null;
        }

        const option = durationOptions.find(
            (item) => item.count === Number(selectedDuration)
        );

        if (!option) return null;

        // This is an estimate using the standard hourly rate.
        // The backend calculates the final amount using booking settings.
        const estimatedAmount =
            (currentCourt.hourlyRate * option.durationMinutes) / 60;

        return {
            startTime: selectedStartTime,
            endTime: option.endTime,
            durationMinutes: option.durationMinutes,
            durationHours: option.durationMinutes / 60,
            estimatedAmount
        };
    }, [
        selectedStartTime,
        selectedDuration,
        durationOptions,
        currentCourt
    ]);

    // ==========================================
    // CUSTOMER INPUT HANDLER
    // ==========================================

    const handleCustomerChange = (e) => {
        const { name, value } = e.target;

        setCustomer((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // ==========================================
    // CREATE WALK-IN RESERVATION
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setCreatedReservation(null);

        // Validate customer information.
        if (
            !customer.fullName.trim() ||
            !customer.phone.trim()
        ) {
            setError(
                "Please enter the customer's name and phone number."
            );
            return;
        }

        // Validate court and schedule.
        if (!selectedCourt || !bookingDetails) {
            setError(
                "Please select a court and available time slot."
            );
            return;
        }

        // Validate date format before sending.
        if (!/^\d{4}-\d{2}-\d{2}$/.test(reservationDate)) {
            setError("Please select a valid reservation date.");
            return;
        }

        try {
            setSubmitting(true);

            // ==========================================
            // REQUEST PAYLOAD
            // ==========================================

            const payload = {
                fullName: customer.fullName.trim(),
                phone: customer.phone.trim(),
                courtId: selectedCourt,

                // Send the original YYYY-MM-DD string.
                // Do not convert it using toISOString().
                reservationDate: reservationDate,

                startTime: bookingDetails.startTime,
                endTime: bookingDetails.endTime,
                notes: "Walk-in booking"
            };

            const response = await api.post(
                "/reservations/walk-in",
                payload
            );

            // ==========================================
            // SUCCESS
            // ==========================================

            setCreatedReservation(response.data.reservation);

            setSuccess(
                response.data.message ||
                "Walk-in reservation created successfully."
            );

            // Clear customer and time selection.
            setCustomer({
                fullName: "",
                phone: ""
            });

            setSelectedStartTime("");
            setSelectedDuration(1);

            // Refresh availability.
            const scheduleResponse = await scheduleService.getSchedule(
                selectedCourt,
                reservationDate
            );

            setSlots(scheduleResponse.slots || []);

        } catch (err) {
            console.error(
                "Walk-In Booking Error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Failed to create walk-in reservation."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================
    // RESET FORM
    // ==========================================

    const handleReset = () => {
        setCustomer({
            fullName: "",
            phone: ""
        });

        setSelectedCourt("");
        setSelectedStartTime("");
        setSelectedDuration(1);
        setReservationDate(getLocalDate());

        setError("");
        setSuccess("");
        setCreatedReservation(null);
        setSlots([]);
    };

    // ==========================================
    // LOADING COURTS
    // ==========================================

    if (loadingCourts) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-600" />

                    <p className="text-sm text-slate-500">
                        Loading available courts...
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

            {/* PAGE HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
                        <ClipboardList size={16} />
                        Staff Operations
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Walk-In Booking
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Register a walk-in customer and reserve a court.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                    <RefreshCw size={16} />
                    Reset Form
                </button>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle size={19} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* SUCCESS MESSAGE */}
            {success && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

                    <div>
                        <p className="font-semibold">{success}</p>

                        {createdReservation && (
                            <p className="mt-1 text-xs">
                                Reservation ID: {createdReservation._id}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                    {/* LEFT COLUMN */}
                    <div className="space-y-6 xl:col-span-2">

                        {/* CUSTOMER INFORMATION */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <UserRound size={21} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Customer Information
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Enter the walk-in customer's details.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                {/* FULL NAME */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Customer Full Name
                                    </label>

                                    <div className="relative">
                                        <UserRound
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="text"
                                            name="fullName"
                                            value={customer.fullName}
                                            onChange={handleCustomerChange}
                                            placeholder="Enter customer's full name"
                                            maxLength={100}
                                            required
                                            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                        />
                                    </div>
                                </div>

                                {/* PHONE */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Phone Number
                                    </label>

                                    <div className="relative">
                                        <Phone
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="tel"
                                            name="phone"
                                            value={customer.phone}
                                            onChange={handleCustomerChange}
                                            placeholder="09XXXXXXXXX"
                                            maxLength={20}
                                            required
                                            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* COURT AND DATE */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Building2 size={21} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Court and Schedule
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Select a court and reservation date.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                {/* COURT */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Select Court
                                    </label>

                                    <select
                                        value={selectedCourt}
                                        onChange={(e) => {
                                            setSelectedCourt(e.target.value);
                                            setSuccess("");
                                            setCreatedReservation(null);
                                        }}
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    >
                                        <option value="">
                                            Choose a court
                                        </option>

                                        {courts.map((court) => (
                                            <option
                                                key={court._id}
                                                value={court._id}
                                            >
                                                {court.name} - {court.courtNumber}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* DATE */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Reservation Date
                                    </label>

                                    <div className="relative">
                                        <CalendarDays
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="date"
                                            value={reservationDate}
                                            min={getLocalDate()}
                                            onChange={(e) => {
                                                setReservationDate(e.target.value);
                                                setSuccess("");
                                                setCreatedReservation(null);
                                            }}
                                            required
                                            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* COURT DETAILS */}
                            {currentCourt && (
                                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                {currentCourt.name}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Court {currentCourt.courtNumber}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold text-emerald-700">
                                                {formatCurrency(currentCourt.hourlyRate)}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                Per hour
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
                                        <span>
                                            Opening: {formatTime(currentCourt.openingTime)}
                                        </span>

                                        <span>
                                            Closing: {formatTime(currentCourt.closingTime)}
                                        </span>

                                        <span>
                                            Slot: {currentCourt.slotDurationMinutes} minutes
                                        </span>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* AVAILABLE TIME SLOTS */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                        <Clock size={21} />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-slate-900">
                                            Available Time Slots
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            Choose an available starting time.
                                        </p>
                                    </div>
                                </div>

                                {selectedCourt && (
                                    <button
                                        type="button"
                                        onClick={fetchSchedule}
                                        disabled={loadingSchedule}
                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600 disabled:opacity-50"
                                        title="Refresh availability"
                                    >
                                        <RefreshCw
                                            size={17}
                                            className={loadingSchedule ? "animate-spin" : ""}
                                        />
                                    </button>
                                )}
                            </div>

                            {/* LEGEND */}
                            <div className="mb-5 flex flex-wrap gap-4 text-xs">
                                <span className="flex items-center gap-2 text-slate-600">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    Available
                                </span>

                                <span className="flex items-center gap-2 text-slate-600">
                                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                    Reserved
                                </span>

                                <span className="flex items-center gap-2 text-slate-600">
                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                                    Past
                                </span>
                            </div>

                            {!selectedCourt ? (
                                <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
                                    <Building2 className="mx-auto mb-3 text-slate-300" size={30} />

                                    <p className="text-sm font-medium text-slate-600">
                                        Select a court first.
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Court availability will appear here.
                                    </p>
                                </div>
                            ) : loadingSchedule ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="animate-spin text-emerald-600" size={28} />
                                </div>
                            ) : slots.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
                                    <Clock className="mx-auto mb-3 text-slate-300" size={30} />

                                    <p className="text-sm text-slate-500">
                                        No time slots available for this date.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                    {slots.map((slot) => {
                                        const isSelected =
                                            selectedStartTime === slot.startTime;

                                        const isAvailable =
                                            slot.status === "Available";

                                        return (
                                            <button
                                                key={slot.startTime}
                                                type="button"
                                                disabled={!isAvailable}
                                                onClick={() => {
                                                    setSelectedStartTime(slot.startTime);
                                                    setSelectedDuration(1);
                                                    setSuccess("");
                                                    setCreatedReservation(null);
                                                }}
                                                className={`rounded-xl border p-3 text-left transition ${
                                                    isSelected
                                                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                                                        : isAvailable
                                                            ? "border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50"
                                                            : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
                                                }`}
                                            >
                                                <p className={`text-sm font-bold ${
                                                    isSelected
                                                        ? "text-emerald-700"
                                                        : "text-slate-800"
                                                }`}>
                                                    {formatTime(slot.startTime)}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {formatTime(slot.endTime)}
                                                </p>

                                                <p className={`mt-2 text-[11px] font-semibold ${
                                                    slot.status === "Available"
                                                        ? "text-emerald-600"
                                                        : slot.status === "Reserved"
                                                            ? "text-red-500"
                                                            : "text-slate-400"
                                                }`}>
                                                    {slot.status}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* DURATION SELECTION */}
                            {selectedStartTime && durationOptions.length > 0 && (
                                <div className="mt-6 border-t border-slate-100 pt-5">
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Reservation Duration
                                    </label>

                                    <select
                                        value={selectedDuration}
                                        onChange={(e) => setSelectedDuration(Number(e.target.value))}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:max-w-xs"
                                    >
                                        {durationOptions.map((option) => (
                                            <option
                                                key={option.count}
                                                value={option.count}
                                            >
                                                {option.durationMinutes / 60} hour(s) - Until {formatTime(option.endTime)}
                                            </option>
                                        ))}
                                    </select>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Only consecutive available slots can be selected.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* RIGHT COLUMN: BOOKING SUMMARY */}
                    <div className="space-y-6">
                        <section className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <ClipboardList size={21} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Booking Summary
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Review before confirming.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">

                                {/* CUSTOMER */}
                                <div>
                                    <p className="text-xs text-slate-400">
                                        Customer
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {customer.fullName || "Not provided"}
                                    </p>

                                    <p className="text-sm text-slate-500">
                                        {customer.phone || "No phone number"}
                                    </p>
                                </div>

                                {/* COURT */}
                                <div className="border-t border-slate-100 pt-4">
                                    <p className="text-xs text-slate-400">
                                        Selected Court
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {currentCourt
                                            ? `${currentCourt.name} - ${currentCourt.courtNumber}`
                                            : "No court selected"}
                                    </p>
                                </div>

                                {/* DATE */}
                                <div className="border-t border-slate-100 pt-4">
                                    <p className="text-xs text-slate-400">
                                        Reservation Date
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {formatReservationDate(reservationDate)}
                                    </p>
                                </div>

                                {/* TIME */}
                                <div className="border-t border-slate-100 pt-4">
                                    <p className="text-xs text-slate-400">
                                        Reservation Time
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {bookingDetails
                                            ? `${formatTime(bookingDetails.startTime)} - ${formatTime(bookingDetails.endTime)}`
                                            : "No time selected"}
                                    </p>

                                    {bookingDetails && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            {bookingDetails.durationHours} hour(s)
                                        </p>
                                    )}
                                </div>

                                {/* AMOUNT */}
                                <div className="border-t border-slate-100 pt-4">
                                    <p className="text-xs text-slate-400">
                                        Estimated Amount
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-emerald-700">
                                        {formatCurrency(
                                            bookingDetails?.estimatedAmount || 0
                                        )}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Final amount is calculated and verified by the server.
                                    </p>
                                </div>

                                {/* PAYMENT */}
                                <div className="rounded-xl bg-amber-50 p-4">
                                    <p className="text-sm font-semibold text-amber-800">
                                        Payment Status
                                    </p>

                                    <p className="mt-1 text-xs text-amber-700">
                                        Unpaid - payment can be recorded through the Payments page.
                                    </p>
                                </div>

                                {/* STATUS */}
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold text-slate-500">
                                        Initial Reservation Status
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        Pending
                                    </p>
                                </div>
                            </div>

                            {/* SUBMIT */}
                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    !customer.fullName.trim() ||
                                    !customer.phone.trim() ||
                                    !bookingDetails
                                }
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Creating Reservation...
                                    </>
                                ) : (
                                    <>
                                        Confirm Walk-In Booking
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </section>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default WalkInBooking;
