
import React, { useEffect, useState } from "react";
import {
    Clock,
    DollarSign,
    CalendarCheck,
    Save,
    Plus,
    Trash2,
    RefreshCw,
    Settings as SettingsIcon,
    CheckCircle2,
    AlertCircle,
    CalendarDays,
    ShieldCheck,
    CircleDollarSign,
    Building2
} from "lucide-react";

import settingService from "../../services/settingService";

// ==========================================
// CONSTANTS
// ==========================================

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

const DEFAULT_SETTINGS = {
    operatingHours: DAYS.map((day) => ({
        day,
        isOpen: true,
        openingTime: "08:00",
        closingTime: "22:00"
    })),

    pricing: {
        currency: "PHP",
        defaultHourlyRate: 300,
        peakHours: []
    },

    bookingRules: {
        minAdvanceHours: 0,
        maxAdvanceDays: 30,
        minDurationMinutes: 60,
        maxDurationMinutes: 240,
        cancellationCutoffHours: 24,
        allowSameDayBookings: true
    }
};

const TABS = [
    {
        id: "hours",
        label: "Operating Hours",
        description: "Facility schedule",
        icon: Clock
    },
    {
        id: "pricing",
        label: "Pricing",
        description: "Court rates",
        icon: DollarSign
    },
    {
        id: "rules",
        label: "Booking Rules",
        description: "Reservation policies",
        icon: CalendarCheck
    }
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const Settings = () => {
    const [activeTab, setActiveTab] = useState("hours");

    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==========================================
    // LOAD SETTINGS
    // ==========================================

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await settingService.getSettings();

            if (response.settings) {
                setSettings({
                    operatingHours:
                        response.settings.operatingHours ||
                        DEFAULT_SETTINGS.operatingHours,

                    pricing: {
                        ...DEFAULT_SETTINGS.pricing,
                        ...response.settings.pricing,
                        peakHours:
                            response.settings.pricing?.peakHours || []
                    },

                    bookingRules: {
                        ...DEFAULT_SETTINGS.bookingRules,
                        ...response.settings.bookingRules
                    }
                });
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load settings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    // ==========================================
    // UPDATE OPERATING HOURS
    // ==========================================

    const updateOperatingHour = (index, field, value) => {
        setSettings((previous) => ({
            ...previous,

            operatingHours: previous.operatingHours.map(
                (item, itemIndex) =>
                    itemIndex === index
                        ? { ...item, [field]: value }
                        : item
            )
        }));
    };

    // ==========================================
    // UPDATE PRICING
    // ==========================================

    const updatePricing = (field, value) => {
        setSettings((previous) => ({
            ...previous,

            pricing: {
                ...previous.pricing,
                [field]: value
            }
        }));
    };

    // ==========================================
    // UPDATE BOOKING RULES
    // ==========================================

    const updateBookingRule = (field, value) => {
        setSettings((previous) => ({
            ...previous,

            bookingRules: {
                ...previous.bookingRules,
                [field]: value
            }
        }));
    };

    // ==========================================
    // PEAK-HOUR MANAGEMENT
    // ==========================================

    const addPeakHour = () => {
        setSettings((previous) => ({
            ...previous,

            pricing: {
                ...previous.pricing,

                peakHours: [
                    ...previous.pricing.peakHours,
                    {
                        name: "Peak Hours",
                        startTime: "17:00",
                        endTime: "21:00",
                        hourlyRate: previous.pricing.defaultHourlyRate,
                        isActive: true
                    }
                ]
            }
        }));
    };

    const updatePeakHour = (index, field, value) => {
        setSettings((previous) => ({
            ...previous,

            pricing: {
                ...previous.pricing,

                peakHours: previous.pricing.peakHours.map(
                    (peak, peakIndex) =>
                        peakIndex === index
                            ? { ...peak, [field]: value }
                            : peak
                )
            }
        }));
    };

    const removePeakHour = (index) => {
        setSettings((previous) => ({
            ...previous,

            pricing: {
                ...previous.pricing,

                peakHours: previous.pricing.peakHours.filter(
                    (_, peakIndex) => peakIndex !== index
                )
            }
        }));
    };

    // ==========================================
    // VALIDATE SETTINGS
    // ==========================================

    const validateSettings = () => {
        for (const day of settings.operatingHours) {
            if (!day.isOpen) continue;

            if (!day.openingTime || !day.closingTime) {
                return `Please set the opening and closing times for ${day.day}.`;
            }

            if (day.closingTime <= day.openingTime) {
                return `Closing time must be later than opening time for ${day.day}.`;
            }
        }

        if (
            settings.operatingHours.length !== DAYS.length ||
            DAYS.some(
                (day) =>
                    !settings.operatingHours.some(
                        (item) => item.day === day
                    )
            )
        ) {
            return "Please configure all seven operating days.";
        }

        if (
            !Number.isFinite(Number(settings.pricing.defaultHourlyRate)) ||
            Number(settings.pricing.defaultHourlyRate) < 0
        ) {
            return "Default hourly rate must be a valid non-negative amount.";
        }

        const minDuration = Number(
            settings.bookingRules.minDurationMinutes
        );

        const maxDuration = Number(
            settings.bookingRules.maxDurationMinutes
        );

        if (
            !Number.isFinite(minDuration) ||
            !Number.isFinite(maxDuration) ||
            minDuration <= 0 ||
            maxDuration < minDuration
        ) {
            return "Maximum booking duration must be greater than or equal to minimum duration.";
        }

        const numericRules = [
            ["Minimum advance booking", settings.bookingRules.minAdvanceHours, 0, 8760],
            ["Maximum advance booking", settings.bookingRules.maxAdvanceDays, 1, 365],
            ["Cancellation cutoff", settings.bookingRules.cancellationCutoffHours, 0, 720]
        ];

        for (const [label, value, min, max] of numericRules) {
            const number = Number(value);

            if (
                !Number.isFinite(number) ||
                number < min ||
                number > max
            ) {
                return `${label} must be between ${min} and ${max}.`;
            }
        }

        for (const peak of settings.pricing.peakHours) {
            if (!peak.name?.trim()) {
                return "Please enter a name for each peak-hour rule.";
            }

            if (!peak.startTime || !peak.endTime) {
                return `Please configure the time range for ${peak.name}.`;
            }

            if (peak.endTime <= peak.startTime) {
                return `Peak-hour end time must be later than start time for ${peak.name}.`;
            }

            if (
                !Number.isFinite(Number(peak.hourlyRate)) ||
                Number(peak.hourlyRate) < 0
            ) {
                return `Peak-hour rate for ${peak.name} must be a valid non-negative amount.`;
            }
        }

        return "";
    };

    // ==========================================
    // SAVE SETTINGS
    // ==========================================

    const handleSave = async () => {
        const validationError = validateSettings();

        if (validationError) {
            setError(validationError);
            setSuccess("");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                operatingHours: settings.operatingHours,

                pricing: {
                    ...settings.pricing,

                    defaultHourlyRate: Number(
                        settings.pricing.defaultHourlyRate
                    ),

                    peakHours: settings.pricing.peakHours.map(
                        (peak) => ({
                            ...peak,
                            name: peak.name.trim(),
                            hourlyRate: Number(peak.hourlyRate)
                        })
                    )
                },

                bookingRules: {
                    minAdvanceHours: Number(
                        settings.bookingRules.minAdvanceHours
                    ),

                    maxAdvanceDays: Number(
                        settings.bookingRules.maxAdvanceDays
                    ),

                    minDurationMinutes: Number(
                        settings.bookingRules.minDurationMinutes
                    ),

                    maxDurationMinutes: Number(
                        settings.bookingRules.maxDurationMinutes
                    ),

                    cancellationCutoffHours: Number(
                        settings.bookingRules.cancellationCutoffHours
                    ),

                    allowSameDayBookings:
                        settings.bookingRules.allowSameDayBookings
                }
            };

            const response = await settingService.updateSettings(
                payload
            );

            if (response.settings) {
                setSettings({
                    operatingHours:
                        response.settings.operatingHours ||
                        payload.operatingHours,

                    pricing: {
                        ...DEFAULT_SETTINGS.pricing,
                        ...response.settings.pricing,
                        peakHours:
                            response.settings.pricing?.peakHours ||
                            payload.pricing.peakHours
                    },

                    bookingRules: {
                        ...DEFAULT_SETTINGS.bookingRules,
                        ...response.settings.bookingRules
                    }
                });
            }

            setSuccess("Settings saved successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save settings."
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // LOADING STATE
    // ==========================================

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 xl:px-8 xl:py-10">
                <div className="space-y-3">
                    <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
                </div>

                <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-14 flex-1 animate-pulse rounded-xl bg-slate-100"
                        />
                    ))}
                </div>

                <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                    <div className="h-6 w-64 animate-pulse rounded bg-slate-200" />

                    {DAYS.map((day) => (
                        <div
                            key={day}
                            className="grid grid-cols-1 gap-4 border-b border-slate-100 py-5 md:grid-cols-4"
                        >
                            <div className="h-5 w-24 animate-pulse rounded bg-slate-100" />
                            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <RefreshCw size={16} className="animate-spin" />
                    Loading system settings...
                </div>
            </div>
        );
    }

    // ==========================================
    // MAIN RENDER
    // ==========================================

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 xl:px-8 xl:py-10">

            {/* ======================================
                PAGE HEADER
            ====================================== */}

            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

                <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <SettingsIcon size={27} />
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                System Settings
                            </h1>

                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Administration
                            </span>
                        </div>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Manage facility operating hours, court pricing,
                            reservation restrictions, and cancellation policies.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={loadSettings}
                        disabled={loading || saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            size={17}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? (
                            <RefreshCw size={17} className="animate-spin" />
                        ) : (
                            <Save size={17} />
                        )}

                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {/* ======================================
                ALERTS
            ====================================== */}

            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                    <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0"
                    />

                    <div className="min-w-0">
                        <p className="text-sm font-semibold">
                            Something went wrong
                        </p>

                        <p className="mt-1 text-sm leading-6">
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="ml-auto rounded-lg p-1 text-red-500 transition hover:bg-red-100"
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            {success && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-700">
                    <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0"
                    />

                    <div>
                        <p className="text-sm font-semibold">
                            Changes saved
                        </p>

                        <p className="mt-1 text-sm">
                            {success}
                        </p>
                    </div>
                </div>
            )}

            {/* ======================================
                SETTINGS TABS
            ====================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">

                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-4 text-left transition ${
                                    active
                                        ? "bg-emerald-600 text-white shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                        active
                                            ? "bg-white/15 text-white"
                                            : "bg-slate-100 text-slate-600"
                                    }`}
                                >
                                    <Icon size={21} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-bold">
                                        {tab.label}
                                    </p>

                                    <p
                                        className={`mt-1 text-xs ${
                                            active
                                                ? "text-emerald-100"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        {tab.description}
                                    </p>
                                </div>

                                {active && (
                                    <CheckCircle2
                                        size={18}
                                        className="ml-auto shrink-0"
                                    />
                                )}
                            </button>
                        );
                    })}

                </div>
            </div>

            {/* ======================================
                OPERATING HOURS
            ====================================== */}

            {activeTab === "hours" && (
                <div className="space-y-6">

                    <SectionHeader
                        icon={Clock}
                        title="Facility Operating Hours"
                        description="Configure the general operating schedule of your pickleball facility."
                        badge="Weekly Schedule"
                    />

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-7">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Weekly Schedule
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Set opening and closing times for each day.
                                    </p>
                                </div>

                                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                    <CalendarDays size={14} />
                                    7 Days
                                </span>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">

                            {settings.operatingHours.map((item, index) => (
                                <div
                                    key={item.day}
                                    className="grid grid-cols-1 items-center gap-5 px-5 py-6 transition hover:bg-slate-50/60 md:grid-cols-[1fr_130px_1fr_1fr] md:px-7"
                                >

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                            <CalendarDays size={18} />
                                        </div>

                                        <div>
                                            <p className="font-bold text-slate-800">
                                                {item.day}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Operating schedule
                                            </p>
                                        </div>
                                    </div>

                                    <label className="flex w-fit cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={item.isOpen}
                                            onChange={(event) =>
                                                updateOperatingHour(
                                                    index,
                                                    "isOpen",
                                                    event.target.checked
                                                )
                                            }
                                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                        />

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                item.isOpen
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {item.isOpen ? "Open" : "Closed"}
                                        </span>
                                    </label>

                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Opening Time
                                        </label>

                                        <input
                                            type="time"
                                            disabled={!item.isOpen}
                                            value={item.openingTime}
                                            onChange={(event) =>
                                                updateOperatingHour(
                                                    index,
                                                    "openingTime",
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Closing Time
                                        </label>

                                        <input
                                            type="time"
                                            disabled={!item.isOpen}
                                            value={item.closingTime}
                                            onChange={(event) =>
                                                updateOperatingHour(
                                                    index,
                                                    "closingTime",
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                        />
                                    </div>

                                </div>
                            ))}

                        </div>
                    </div>
                </div>
            )}

            {/* ======================================
                PRICING
            ====================================== */}

            {activeTab === "pricing" && (
                <div className="space-y-8">

                    <SectionHeader
                        icon={CircleDollarSign}
                        title="Court Pricing"
                        description="Manage standard court rates and configure special peak-hour pricing."
                        badge="Pricing Configuration"
                    />

                    {/* DEFAULT PRICING */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                <DollarSign size={23} />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Default Court Pricing
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Set the default hourly rate for newly configured courts.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 max-w-xl">
                            <label className="mb-3 block text-sm font-semibold text-slate-700">
                                Default Hourly Rate (PHP)
                            </label>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                                    ₱
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={settings.pricing.defaultHourlyRate}
                                    onChange={(event) =>
                                        updatePricing(
                                            "defaultHourlyRate",
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-10 pr-4 text-lg font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>

                            <p className="mt-3 text-xs leading-5 text-slate-500">
                                Existing courts retain their own configured hourly rates.
                            </p>
                        </div>
                    </div>

                    {/* PEAK HOURS */}

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <Clock size={22} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Peak-Hour Pricing
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Configure special hourly rates for selected time ranges.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={addPeakHour}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                <Plus size={17} />
                                Add Peak Hours
                            </button>
                        </div>

                        {settings.pricing.peakHours.length === 0 ? (
                            <div className="px-6 py-16 text-center sm:px-8">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                    <DollarSign size={30} />
                                </div>

                                <h3 className="mt-5 font-bold text-slate-800">
                                    No Peak-Hour Rules
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    You haven't configured special pricing yet.
                                    Add a time range to apply different rates during busy hours.
                                </p>

                                <button
                                    type="button"
                                    onClick={addPeakHour}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                >
                                    <Plus size={16} />
                                    Create First Rule
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">

                                {settings.pricing.peakHours.map((peak, index) => (
                                    <div
                                        key={index}
                                        className="p-6 transition hover:bg-slate-50/50 sm:p-8"
                                    >

                                        <div className="mb-6 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-sm font-bold text-amber-700">
                                                    {index + 1}
                                                </span>

                                                <div>
                                                    <p className="font-bold text-slate-800">
                                                        Peak-Hour Rule {index + 1}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Configure pricing period
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removePeakHour(index)}
                                                className="inline-flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                title="Remove peak-hour rule"
                                            >
                                                <Trash2 size={15} />
                                                <span className="hidden sm:inline">
                                                    Remove
                                                </span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

                                            <div>
                                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Rule Name
                                                </label>

                                                <input
                                                    type="text"
                                                    value={peak.name}
                                                    onChange={(event) =>
                                                        updatePeakHour(
                                                            index,
                                                            "name",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. Evening Peak"
                                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Start Time
                                                </label>

                                                <input
                                                    type="time"
                                                    value={peak.startTime}
                                                    onChange={(event) =>
                                                        updatePeakHour(
                                                            index,
                                                            "startTime",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    End Time
                                                </label>

                                                <input
                                                    type="time"
                                                    value={peak.endTime}
                                                    onChange={(event) =>
                                                        updatePeakHour(
                                                            index,
                                                            "endTime",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Hourly Rate (PHP)
                                                </label>

                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                                                        ₱
                                                    </span>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={peak.hourlyRate}
                                                        onChange={(event) =>
                                                            updatePeakHour(
                                                                index,
                                                                "hourlyRate",
                                                                event.target.value
                                                            )
                                                        }
                                                        className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <label className="mt-6 flex w-fit cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={peak.isActive}
                                                onChange={(event) =>
                                                    updatePeakHour(
                                                        index,
                                                        "isActive",
                                                        event.target.checked
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                            />

                                            <span className="text-sm font-semibold text-slate-700">
                                                Enable this pricing rule
                                            </span>

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    peak.isActive
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-200 text-slate-500"
                                                }`}
                                            >
                                                {peak.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </label>

                                    </div>
                                ))}

                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ======================================
                BOOKING RULES
            ====================================== */}

            {activeTab === "rules" && (
                <div className="space-y-8">

                    <SectionHeader
                        icon={ShieldCheck}
                        title="Booking Rules"
                        description="Configure reservation restrictions, duration limits, and cancellation policies."
                        badge="Reservation Policies"
                    />

                    {/* ADVANCE BOOKING */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                <CalendarCheck size={22} />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Booking Time Restrictions
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Control how early and how far ahead customers can reserve courts.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

                            <NumberField
                                label="Minimum Advance Booking"
                                suffix="Hours"
                                value={settings.bookingRules.minAdvanceHours}
                                min="0"
                                max="8760"
                                onChange={(value) =>
                                    updateBookingRule("minAdvanceHours", value)
                                }
                                description="Minimum time between booking creation and reservation start."
                            />

                            <NumberField
                                label="Maximum Advance Booking"
                                suffix="Days"
                                value={settings.bookingRules.maxAdvanceDays}
                                min="1"
                                max="365"
                                onChange={(value) =>
                                    updateBookingRule("maxAdvanceDays", value)
                                }
                                description="How far into the future customers are allowed to book."
                            />

                        </div>

                        <div className="mt-8 border-t border-slate-100 pt-6">
                            <ToggleSetting
                                checked={settings.bookingRules.allowSameDayBookings}
                                onChange={(value) =>
                                    updateBookingRule(
                                        "allowSameDayBookings",
                                        value
                                    )
                                }
                                title="Allow Same-Day Bookings"
                                description="Allow customers to reserve an available court for the current day."
                            />
                        </div>
                    </div>

                    {/* DURATION */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                                <Clock size={22} />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Booking Duration
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Define the minimum and maximum duration of a reservation.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Minimum Duration
                                </label>

                                <select
                                    value={settings.bookingRules.minDurationMinutes}
                                    onChange={(event) =>
                                        updateBookingRule(
                                            "minDurationMinutes",
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                >
                                    <option value="30">30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="90">1 hour 30 minutes</option>
                                    <option value="120">2 hours</option>
                                </select>

                                <p className="mt-2 text-xs text-slate-500">
                                    Shortest allowed reservation duration.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Maximum Duration
                                </label>

                                <select
                                    value={settings.bookingRules.maxDurationMinutes}
                                    onChange={(event) =>
                                        updateBookingRule(
                                            "maxDurationMinutes",
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                >
                                    <option value="60">1 hour</option>
                                    <option value="120">2 hours</option>
                                    <option value="180">3 hours</option>
                                    <option value="240">4 hours</option>
                                    <option value="300">5 hours</option>
                                    <option value="360">6 hours</option>
                                    <option value="480">8 hours</option>
                                    <option value="720">12 hours</option>
                                </select>

                                <p className="mt-2 text-xs text-slate-500">
                                    Longest allowed reservation duration.
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* CANCELLATION */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                                <ShieldCheck size={22} />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Cancellation Policy
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Set the minimum time before a reservation when cancellation is allowed.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 max-w-xl">
                            <NumberField
                                label="Cancellation Cutoff"
                                suffix="Hours"
                                value={settings.bookingRules.cancellationCutoffHours}
                                min="0"
                                max="720"
                                onChange={(value) =>
                                    updateBookingRule(
                                        "cancellationCutoffHours",
                                        value
                                    )
                                }
                                description="For example, 24 means customers must cancel at least 24 hours before their reservation."
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================
                BOTTOM SAVE ACTION
            ====================================== */}

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">

                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Save size={20} />
                    </div>

                    <div>
                        <p className="font-bold text-slate-900">
                            Ready to save your changes?
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Your updated settings will be applied after saving.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving ? (
                        <RefreshCw size={18} className="animate-spin" />
                    ) : (
                        <Save size={18} />
                    )}

                    {saving ? "Saving Settings..." : "Save All Settings"}
                </button>
            </div>

        </div>
    );
};

// ==========================================
// SECTION HEADER
// ==========================================

const SectionHeader = ({
    icon: Icon,
    title,
    description,
    badge
}) => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Icon size={23} />
            </div>

            <div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    {title}
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    {description}
                </p>
            </div>
        </div>

        {badge && (
            <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                {badge}
            </span>
        )}
    </div>
);

// ==========================================
// NUMBER FIELD
// ==========================================

const NumberField = ({
    label,
    value,
    min,
    max,
    onChange,
    description,
    suffix
}) => (
    <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
            {label}
        </label>

        <div className="relative">
            <input
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                    suffix ? "pr-20" : ""
                }`}
            />

            {suffix && (
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    {suffix}
                </span>
            )}
        </div>

        {description && (
            <p className="mt-2 text-xs leading-5 text-slate-500">
                {description}
            </p>
        )}
    </div>
);

// ==========================================
// TOGGLE SETTING
// ==========================================

const ToggleSetting = ({
    checked,
    onChange,
    title,
    description
}) => (
    <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/30">

        <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />

        <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800">
                {title}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
            </p>
        </div>

        <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                checked
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-500"
            }`}
        >
            {checked ? "Enabled" : "Disabled"}
        </span>
    </label>
);

export default Settings;
