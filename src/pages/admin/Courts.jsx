
import { useCallback, useEffect, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Power,
    X,
    RefreshCw,
    MapPin,
    CircleDollarSign,
    Building2,
    Clock,
    CalendarClock
} from "lucide-react";

import courtService from "../../services/courtService";

// ==========================================
// INITIAL FORM DATA
// ==========================================

const initialForm = {
    name: "",
    courtNumber: "",
    description: "",
    courtType: "outdoor",
    surfaceType: "",
    hourlyRate: "",
    openingTime: "08:00",
    closingTime: "22:00",
    slotDurationMinutes: 60
};

// ==========================================
// MAIN COURTS COMPONENT
// ==========================================

export default function Courts() {
    const [courts, setCourts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Search and filters
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [type, setType] = useState("all");

    // Modal and form
    const [showModal, setShowModal] = useState(false);
    const [editingCourt, setEditingCourt] = useState(null);
    const [form, setForm] = useState(initialForm);

    // ==========================================
    // FETCH COURTS
    // ==========================================

    const fetchCourts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (search.trim()) {
                params.search = search.trim();
            }

            if (status !== "all") {
                params.status = status;
            }

            if (type !== "all") {
                params.type = type;
            }

            const data = await courtService.getCourts(params);

            setCourts(data.courts || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load courts. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [search, status, type]);

    useEffect(() => {
        fetchCourts();
    }, [fetchCourts]);

    // ==========================================
    // OPEN ADD MODAL
    // ==========================================

    const openAddModal = () => {
        setEditingCourt(null);
        setForm({ ...initialForm });

        setError("");
        setSuccess("");

        setShowModal(true);
    };

    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================

    const openEditModal = (court) => {
        setEditingCourt(court);

        setForm({
            name: court.name || "",
            courtNumber: court.courtNumber || "",
            description: court.description || "",
            courtType: court.courtType || "outdoor",
            surfaceType: court.surfaceType || "",
            hourlyRate: court.hourlyRate ?? "",
            openingTime: court.openingTime || "08:00",
            closingTime: court.closingTime || "22:00",
            slotDurationMinutes: court.slotDurationMinutes || 60
        });

        setError("");
        setSuccess("");

        setShowModal(true);
    };

    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingCourt(null);
        setForm({ ...initialForm });
        setError("");
    };

    // ==========================================
    // HANDLE INPUT CHANGES
    // ==========================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // ==========================================
    // SUBMIT COURT FORM
    // ==========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        // Validate required fields
        if (!form.name.trim() || !form.courtNumber.trim()) {
            setError("Court name and court number are required.");
            return;
        }

        // Validate hourly rate
        if (
            form.hourlyRate === "" ||
            !Number.isFinite(Number(form.hourlyRate)) ||
            Number(form.hourlyRate) < 0
        ) {
            setError("Please enter a valid hourly rate.");
            return;
        }

        // Validate operating hours
        if (form.openingTime >= form.closingTime) {
            setError("Closing time must be later than opening time.");
            return;
        }

        const payload = {
            ...form,
            name: form.name.trim(),
            courtNumber: form.courtNumber.trim().toUpperCase(),
            hourlyRate: Number(form.hourlyRate),
            slotDurationMinutes: Number(form.slotDurationMinutes)
        };

        try {
            setSaving(true);

            if (editingCourt) {
                await courtService.updateCourt(
                    editingCourt._id,
                    payload
                );

                setSuccess("Court updated successfully.");
            } else {
                await courtService.createCourt(payload);

                setSuccess("Court created successfully.");
            }

            setShowModal(false);
            setEditingCourt(null);
            setForm({ ...initialForm });

            await fetchCourts();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save court. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // ACTIVATE / DEACTIVATE COURT
    // ==========================================

    const handleStatusChange = async (court) => {
        const nextStatus = !court.isActive;

        const confirmed = window.confirm(
            `Are you sure you want to ${
                nextStatus ? "activate" : "deactivate"
            } ${court.name}?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await courtService.updateCourtStatus(
                court._id,
                nextStatus
            );

            setSuccess(
                `${court.name} ${
                    nextStatus ? "activated" : "deactivated"
                } successfully.`
            );

            await fetchCourts();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update court status."
            );
        }
    };

    // ==========================================
    // STATISTICS
    // ==========================================

    const activeCount = courts.filter(
        (court) => court.isActive
    ).length;

    const inactiveCount = courts.filter(
        (court) => !court.isActive
    ).length;

    // ==========================================
    // FORMAT CURRENCY
    // ==========================================

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            maximumFractionDigits: 2
        }).format(amount || 0);

    // ==========================================
    // LOADING SKELETON
    // ==========================================

    if (loading) {
        return <CourtsPageSkeleton />;
    }

    // ==========================================
    // MAIN UI
    // ==========================================

    return (
        <div className="space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">

            {/* ==================================
                PAGE HEADER
            ================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
                        Facility Management
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                        Court Management
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your pickleball courts, rates, schedules, and availability.
                    </p>
                </div>

                <button
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                    <Plus size={18} />
                    Add Court
                </button>
            </div>

            {/* ==================================
                ALERTS
            ================================== */}

            {error && !showModal && (
                <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span>{error}</span>

                    <button onClick={() => setError("")}>
                        <X size={18} />
                    </button>
                </div>
            )}

            {success && !showModal && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <span>{success}</span>

                    <button onClick={() => setSuccess("")}>
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* ==================================
                STATISTICS
            ================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <StatCard
                    title="Total Courts"
                    value={courts.length}
                    icon={<Building2 size={21} />}
                />

                <StatCard
                    title="Active Courts"
                    value={activeCount}
                    icon={<MapPin size={21} />}
                />

                <StatCard
                    title="Inactive Courts"
                    value={inactiveCount}
                    icon={<Power size={21} />}
                />

            </div>

            {/* ==================================
                FILTERS
            ================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

                    {/* Search */}
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search court name or number..."
                            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    {/* Type Filter */}
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    >
                        <option value="all">All Court Types</option>
                        <option value="indoor">Indoor</option>
                        <option value="outdoor">Outdoor</option>
                    </select>

                </div>
            </div>

            {/* ==================================
                COURT TABLE
            ================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* Table Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                    <div>
                        <h2 className="font-bold text-slate-900">
                            Registered Courts
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            {courts.length} court(s) found
                        </p>
                    </div>

                    <button
                        onClick={fetchCourts}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw size={15} />
                        Refresh
                    </button>

                </div>

                {/* Empty State */}
                {courts.length === 0 ? (
                    <div className="px-5 py-16 text-center">

                        <Building2
                            size={40}
                            className="mx-auto text-slate-300"
                        />

                        <h3 className="mt-3 font-semibold text-slate-800">
                            No courts found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Add a court or change your search filters.
                        </p>

                        <button
                            onClick={openAddModal}
                            className="mt-4 text-sm font-semibold text-emerald-700 hover:underline"
                        >
                            + Add your first court
                        </button>

                    </div>
                ) : (

                    /* Court Records */
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1000px] text-left">

                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">Court</th>
                                    <th className="px-5 py-4">Type</th>
                                    <th className="px-5 py-4">Surface</th>
                                    <th className="px-5 py-4">Hourly Rate</th>
                                    <th className="px-5 py-4">Operating Hours</th>
                                    <th className="px-5 py-4">Slot</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {courts.map((court) => (
                                    <tr
                                        key={court._id}
                                        className="transition hover:bg-slate-50"
                                    >

                                        {/* Court */}
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-900">
                                                {court.name}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {court.courtNumber}
                                            </p>
                                        </td>

                                        {/* Type */}
                                        <td className="px-5 py-4">
                                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium capitalize text-slate-700">
                                                {court.courtType}
                                            </span>
                                        </td>

                                        {/* Surface */}
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {court.surfaceType || "—"}
                                        </td>

                                        {/* Rate */}
                                        <td className="px-5 py-4">
                                            <span className="font-semibold text-slate-900">
                                                {formatCurrency(court.hourlyRate)}
                                            </span>

                                            <span className="text-xs text-slate-500">
                                                {" "}/ hour
                                            </span>
                                        </td>

                                        {/* Operating Hours */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Clock
                                                    size={15}
                                                    className="text-slate-400"
                                                />

                                                {court.openingTime || "08:00"} - {court.closingTime || "22:00"}
                                            </div>
                                        </td>

                                        {/* Slot Duration */}
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {court.slotDurationMinutes || 60} min
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    court.isActive
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {court.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">

                                                <button
                                                    onClick={() => openEditModal(court)}
                                                    title="Edit court"
                                                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleStatusChange(court)}
                                                    title={
                                                        court.isActive
                                                            ? "Deactivate court"
                                                            : "Activate court"
                                                    }
                                                    className={`rounded-lg border p-2 ${
                                                        court.isActive
                                                            ? "border-red-200 text-red-600 hover:bg-red-50"
                                                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                    }`}
                                                >
                                                    <Power size={16} />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>
                )}

            </div>

            {/* ==================================
                ADD / EDIT MODAL
            ================================== */}

            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            closeModal();
                        }
                    }}
                >

                    <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingCourt ? "Edit Court" : "Add New Court"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Enter the court details and operating schedule.
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                disabled={saving}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* Modal Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >

                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                {/* Court Name */}
                                <FormField label="Court Name" required>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Main Court"
                                        required
                                        maxLength={100}
                                        className="form-input"
                                    />
                                </FormField>

                                {/* Court Number */}
                                <FormField label="Court Number" required>
                                    <input
                                        name="courtNumber"
                                        value={form.courtNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. COURT-01"
                                        required
                                        className="form-input"
                                    />
                                </FormField>

                                {/* Court Type */}
                                <FormField label="Court Type" required>
                                    <select
                                        name="courtType"
                                        value={form.courtType}
                                        onChange={handleChange}
                                        className="form-input"
                                    >
                                        <option value="outdoor">Outdoor</option>
                                        <option value="indoor">Indoor</option>
                                    </select>
                                </FormField>

                                {/* Surface Type */}
                                <FormField label="Surface Type">
                                    <input
                                        name="surfaceType"
                                        value={form.surfaceType}
                                        onChange={handleChange}
                                        placeholder="e.g. Acrylic"
                                        className="form-input"
                                    />
                                </FormField>

                                {/* Hourly Rate */}
                                <FormField label="Hourly Rate (₱)" required>
                                    <div className="relative">
                                        <CircleDollarSign
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="number"
                                            name="hourlyRate"
                                            value={form.hourlyRate}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            placeholder="300.00"
                                            required
                                            className="form-input pl-10"
                                        />
                                    </div>
                                </FormField>

                                {/* Opening Time */}
                                <FormField label="Opening Time" required>
                                    <div className="relative">
                                        <Clock
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="time"
                                            name="openingTime"
                                            value={form.openingTime}
                                            onChange={handleChange}
                                            required
                                            className="form-input pl-10"
                                        />
                                    </div>
                                </FormField>

                                {/* Closing Time */}
                                <FormField label="Closing Time" required>
                                    <div className="relative">
                                        <Clock
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="time"
                                            name="closingTime"
                                            value={form.closingTime}
                                            onChange={handleChange}
                                            required
                                            className="form-input pl-10"
                                        />
                                    </div>
                                </FormField>

                                {/* Slot Duration */}
                                <FormField label="Slot Duration" required>
                                    <div className="relative">
                                        <CalendarClock
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <select
                                            name="slotDurationMinutes"
                                            value={form.slotDurationMinutes}
                                            onChange={handleChange}
                                            className="form-input pl-10"
                                        >
                                            <option value={30}>30 minutes</option>
                                            <option value={60}>1 hour</option>
                                            <option value={90}>1 hour 30 minutes</option>
                                            <option value={120}>2 hours</option>
                                            <option value={180}>3 hours</option>
                                            <option value={240}>4 hours</option>
                                        </select>
                                    </div>
                                </FormField>

                                {/* Description */}
                                <div className="sm:col-span-2">
                                    <FormField label="Description">
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            rows="3"
                                            placeholder="Additional information about this court..."
                                            className="form-input resize-none"
                                        />
                                    </FormField>
                                </div>

                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingCourt
                                            ? "Save Changes"
                                            : "Create Court"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}

// ==========================================
// STATISTICS CARD
// ==========================================

function StatCard({ title, value, icon }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                    {title}
                </p>

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                    {icon}
                </div>
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
                {value}
            </p>

        </div>
    );
}

// ==========================================
// FORM FIELD
// ==========================================

function FormField({ label, required, children }) {
    return (
        <label className="block">

            <span className="mb-2 block text-sm font-semibold text-slate-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </span>

            {children}

        </label>
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
// COURTS PAGE LOADING SKELETON
// ==========================================

function CourtsPageSkeleton() {
    return (
        <div className="space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">

            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="space-y-3">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-8 w-64 max-w-full" />
                    <Skeleton className="h-4 w-80 max-w-full" />
                </div>

                <Skeleton className="h-12 w-full rounded-xl sm:w-36" />

            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-11 w-11 rounded-xl" />
                        </div>

                        <Skeleton className="mt-4 h-9 w-16" />
                    </div>
                ))}

            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                </div>

            </div>

            {/* Court Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                    <div className="space-y-2">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-3 w-24" />
                    </div>

                    <Skeleton className="h-9 w-24 rounded-lg" />

                </div>

                {/* Column Headers */}
                <div className="hidden grid-cols-8 gap-4 bg-slate-50 px-5 py-4 md:grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                        <Skeleton key={item} className="h-3 w-16" />
                    ))}
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-slate-100">

                    {[1, 2, 3, 4, 5].map((item) => (
                        <div
                            key={item}
                            className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-8 md:items-center"
                        >
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>

                            <Skeleton className="h-7 w-20 rounded-lg" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-6 w-16 rounded-full" />

                            <div className="flex gap-2 md:justify-end">
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
