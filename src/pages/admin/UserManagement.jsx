
import { useCallback, useEffect, useState } from "react";
import {
    Users,
    ShieldCheck,
    UserCog,
    UserPlus,
    Search,
    RefreshCw,
    Edit,
    KeyRound,
    UserCheck,
    UserX,
    X,
    ChevronLeft,
    ChevronRight,
    Phone,
    CalendarDays,
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    AlertTriangle
} from "lucide-react";

import userManagementService from "../../services/userManagementService";

// ==========================================
// REUSABLE SUMMARY CARD
// ==========================================

const SummaryCard = ({ title, value, description, icon: Icon }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {value ?? 0}
                </h3>
                <p className="mt-1 text-xs text-slate-400">{description}</p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Icon size={22} />
            </div>
        </div>
    </div>
);

// ==========================================
// STATUS BADGE
// ==========================================

const StatusBadge = ({ isActive }) => (
    <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
        }`}
    >
        <span
            className={`h-1.5 w-1.5 rounded-full ${
                isActive ? "bg-emerald-500" : "bg-slate-400"
            }`}
        />
        {isActive ? "Active" : "Inactive"}
    </span>
);

// ==========================================
// ROLE BADGE
// ==========================================

const RoleBadge = ({ role }) => (
    <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            role === "admin"
                ? "bg-violet-50 text-violet-700"
                : "bg-blue-50 text-blue-700"
        }`}
    >
        {role === "admin" ? (
            <ShieldCheck size={13} />
        ) : (
            <UserCog size={13} />
        )}

        {role === "admin" ? "Administrator" : "Staff"}
    </span>
);

// ==========================================
// USER FORM MODAL
// ==========================================

const UserModal = ({
    isOpen,
    onClose,
    onSubmit,
    selectedUser,
    saving
}) => {
    const isEditing = Boolean(selectedUser);

    const [form, setForm] = useState({
        fullName: "",
        username: "",
        phone: "",
        password: "",
        role: "staff"
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        setForm({
            fullName: selectedUser?.fullName || "",
            username: selectedUser?.username || "",
            phone: selectedUser?.phone || "",
            password: "",
            role: selectedUser?.role || "staff"
        });

        setError("");
        setShowPassword(false);
    }, [isOpen, selectedUser]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.fullName.trim() || !form.username.trim()) {
            setError("Please complete the required fields.");
            return;
        }

        if (!isEditing && form.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        const payload = {
            fullName: form.fullName.trim(),
            username: form.username.trim(),
            phone: form.phone.trim(),
            role: form.role
        };

        if (!isEditing) {
            payload.password = form.password;
        }

        try {
            await onSubmit(payload);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                "Unable to save the user account."
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="my-8 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {isEditing ? "Edit User Account" : "Create User Account"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {isEditing
                                ? "Update administrator or staff information."
                                : "Add a new administrator or staff member."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    {error && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            required
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Username <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Enter username"
                            required
                            minLength={3}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Account Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        >
                            <option value="staff">Staff</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    {!isEditing && (
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Initial Password <span className="text-red-500">*</span>
                            </label>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="At least 8 characters"
                                    required
                                    minLength={8}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>

                            <p className="mt-2 text-xs text-slate-400">
                                The password must contain at least 8 characters.
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving && (
                                <RefreshCw size={16} className="animate-spin" />
                            )}

                            {saving
                                ? "Saving..."
                                : isEditing
                                    ? "Save Changes"
                                    : "Create Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ==========================================
// PASSWORD MODAL
// ==========================================

const PasswordModal = ({
    isOpen,
    onClose,
    onSubmit,
    selectedUser,
    saving
}) => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setPassword("");
            setConfirmPassword("");
            setError("");
            setShowPassword(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await onSubmit(password);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                "Unable to update password."
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Change Password
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Update password for {selectedUser?.fullName}.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            New Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                required
                                placeholder="Enter new password"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Confirm New Password
                        </label>

                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm new password"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                            {saving && (
                                <RefreshCw size={16} className="animate-spin" />
                            )}
                            {saving ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ==========================================
// CONFIRMATION POPUP MODAL
// ==========================================

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    user,
    saving
}) => {
    if (!isOpen || !user) return null;

    const nextStatus = !user.isActive;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="p-6 text-center">
                    <div
                        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                            nextStatus
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-600"
                        }`}
                    >
                        <AlertTriangle size={27} />
                    </div>

                    <h2 className="mt-4 text-xl font-bold text-slate-900">
                        {nextStatus ? "Activate Account?" : "Deactivate Account?"}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Are you sure you want to{" "}
                        <span className="font-semibold text-slate-800">
                            {nextStatus ? "activate" : "deactivate"}
                        </span>{" "}
                        <span className="font-semibold text-slate-800">
                            {user.fullName}
                        </span>
                        's account?
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                        {nextStatus
                            ? "This user will be able to access their account again."
                            : "This user will no longer be able to access their account."}
                    </p>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={saving}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            nextStatus
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                        {saving && (
                            <RefreshCw size={16} className="animate-spin" />
                        )}

                        {saving
                            ? "Processing..."
                            : nextStatus
                                ? "Yes, Activate"
                                : "Yes, Deactivate"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// MAIN USER MANAGEMENT PAGE
// ==========================================

const UserManagement = () => {
    const [users, setUsers] = useState([]);

    const [summary, setSummary] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        totalStaff: 0,
        activeUsers: 0,
        inactiveUsers: 0
    });

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    });

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [statusSaving, setStatusSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showUserModal, setShowUserModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    const [userForStatusChange, setUserForStatusChange] = useState(null);

    // ======================================
    // LOAD USERS
    // ======================================

    const fetchUsers = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search,
                role: roleFilter === "all" ? "" : roleFilter,
                status: statusFilter === "all" ? "" : statusFilter
            };

            const result = await userManagementService.getUsers(params);

            // Support either a direct response or a nested response.
            const response = result?.data?.users
                ? result.data
                : result;

            console.log("User Management API Response:", response);
            console.log("User Management Summary:", response?.summary);

            // Only show administrators and staff.
            const allowedUsers = (response?.users || []).filter(
                (user) => ["admin", "staff"].includes(
                    String(user.role || "").toLowerCase()
                )
            );

            setUsers(allowedUsers);

            // Use the backend summary.
            setSummary({
                totalUsers: Number(response?.summary?.totalUsers ?? 0),
                totalAdmins: Number(response?.summary?.totalAdmins ?? 0),
                totalStaff: Number(response?.summary?.totalStaff ?? 0),
                activeUsers: Number(response?.summary?.activeUsers ?? 0),
                inactiveUsers: Number(response?.summary?.inactiveUsers ?? 0)
            });

            // Update pagination.
            setPagination((previous) => ({
                ...previous,
                total: Number(response?.pagination?.total ?? 0),
                page: Number(response?.pagination?.page ?? previous.page),
                limit: Number(response?.pagination?.limit ?? previous.limit),
                totalPages: Number(response?.pagination?.totalPages ?? 1)
            }));

        } catch (err) {
            console.error("Fetch users error:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to load user accounts. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [
        pagination.page,
        pagination.limit,
        search,
        roleFilter,
        statusFilter
    ]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ======================================
    // NOTIFICATIONS
    // ======================================

    const showSuccessMessage = (message) => {
        setSuccess(message);

        setTimeout(() => {
            setSuccess("");
        }, 3500);
    };

    // ======================================
    // SEARCH
    // ======================================

    const handleSearch = (e) => {
        e.preventDefault();

        setPagination((previous) => ({
            ...previous,
            page: 1
        }));

        setSearch(searchInput.trim());
    };

    const clearFilters = () => {
        setSearchInput("");
        setSearch("");
        setRoleFilter("all");
        setStatusFilter("all");

        setPagination((previous) => ({
            ...previous,
            page: 1
        }));
    };

    // ======================================
    // CREATE / UPDATE USER
    // ======================================

    const handleSaveUser = async (formData) => {
        try {
            setSaving(true);

            if (selectedUser) {
                await userManagementService.updateUser(
                    selectedUser._id,
                    formData
                );

                showSuccessMessage("User account updated successfully.");
            } else {
                await userManagementService.createUser(formData);

                showSuccessMessage("User account created successfully.");
            }

            setShowUserModal(false);
            setSelectedUser(null);

            await fetchUsers(true);
        } finally {
            setSaving(false);
        }
    };

    // ======================================
    // CHANGE PASSWORD
    // ======================================

    const handleChangePassword = async (password) => {
        try {
            setSaving(true);

            await userManagementService.changeUserPassword(
                selectedUser._id,
                password
            );

            setShowPasswordModal(false);
            setSelectedUser(null);

            showSuccessMessage("Password updated successfully.");
        } finally {
            setSaving(false);
        }
    };

    // ======================================
    // ACTIVATE / DEACTIVATE USER
    // ======================================

    const openStatusConfirmation = (user) => {
        setUserForStatusChange(user);
        setShowConfirmationModal(true);
    };

    const closeStatusConfirmation = () => {
        if (statusSaving) return;

        setShowConfirmationModal(false);
        setUserForStatusChange(null);
    };

    const handleToggleStatus = async () => {
        if (!userForStatusChange) return;

        const user = userForStatusChange;
        const nextStatus = !user.isActive;

        try {
            setStatusSaving(true);
            setError("");

            await userManagementService.updateUserStatus(
                user._id,
                nextStatus
            );

            setShowConfirmationModal(false);
            setUserForStatusChange(null);

            showSuccessMessage(
                `Account ${nextStatus ? "activated" : "deactivated"} successfully.`
            );

            await fetchUsers(true);
        } catch (err) {
            setShowConfirmationModal(false);
            setUserForStatusChange(null);

            setError(
                err?.response?.data?.message ||
                "Unable to update account status."
            );
        } finally {
            setStatusSaving(false);
        }
    };

    // ======================================
    // MODAL HANDLERS
    // ======================================

    const openCreateModal = () => {
        setSelectedUser(null);
        setShowUserModal(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const openPasswordModal = (user) => {
        setSelectedUser(user);
        setShowPasswordModal(true);
    };

    const closeUserModal = () => {
        if (saving) return;

        setShowUserModal(false);
        setSelectedUser(null);
    };

    const closePasswordModal = () => {
        if (saving) return;

        setShowPasswordModal(false);
        setSelectedUser(null);
    };

    // ======================================
    // DATE FORMAT
    // ======================================

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    // ======================================
    // PAGINATION
    // ======================================

    const changePage = (nextPage) => {
        if (
            nextPage < 1 ||
            nextPage > pagination.totalPages
        ) {
            return;
        }

        setPagination((previous) => ({
            ...previous,
            page: nextPage
        }));
    };

    // ======================================
    // RENDER
    // ======================================

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 xl:px-8 xl:py-10">

            {/* PAGE HEADER */}

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                        <Users size={17} />
                        Administration
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        User Management
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
                        Manage administrator and staff accounts, permissions,
                        passwords, and account access.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => fetchUsers(true)}
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
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                        <UserPlus size={18} />
                        Add User
                    </button>
                </div>
            </div>

            {/* NOTIFICATIONS */}

            {success && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={19} />
                    {success}
                </div>
            )}

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle size={19} className="mt-0.5 shrink-0" />

                    <div className="flex-1">{error}</div>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="text-red-500 hover:text-red-700"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* SUMMARY CARDS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Total Users"
                    value={summary.totalUsers}
                    description="Admin and staff accounts"
                    icon={Users}
                />

                <SummaryCard
                    title="Administrators"
                    value={summary.totalAdmins}
                    description="Accounts with admin access"
                    icon={ShieldCheck}
                />

                <SummaryCard
                    title="Staff Members"
                    value={summary.totalStaff}
                    description="Facility staff accounts"
                    icon={UserCog}
                />

                <SummaryCard
                    title="Active Accounts"
                    value={summary.activeUsers}
                    description={`${summary.inactiveUsers} inactive accounts`}
                    icon={UserCheck}
                />
            </div>

            {/* USER MANAGEMENT CARD */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* CARD HEADER */}

                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Account Directory
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            View and manage all administrator and staff accounts.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                            {pagination.total} records
                        </span>

                        <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                            {summary.activeUsers} active
                        </span>
                    </div>
                </div>

                {/* FILTERS */}

                <div className="space-y-4 border-b border-slate-100 p-5 sm:p-6">
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col gap-3 lg:flex-row"
                    >
                        <div className="relative flex-1">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by name, username, or phone..."
                                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            />
                        </div>

                        <button
                            type="submit"
                            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Search
                        </button>
                    </form>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: "All Users", value: "all" },
                                { label: "Administrators", value: "admin" },
                                { label: "Staff", value: "staff" }
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => {
                                        setRoleFilter(tab.value);
                                        setPagination((previous) => ({
                                            ...previous,
                                            page: 1
                                        }));
                                    }}
                                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                        roleFilter === tab.value
                                            ? "bg-emerald-600 text-white shadow-sm"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPagination((previous) => ({
                                        ...previous,
                                        page: 1
                                    }));
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* TABLE */}

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] text-left">
                        <thead className="bg-slate-50">
                            <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Date Created</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index}>
                                        {Array.from({ length: 6 }).map((__, cell) => (
                                            <td key={cell} className="px-6 py-5">
                                                <div className="h-4 animate-pulse rounded-lg bg-slate-100" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="transition hover:bg-slate-50/80"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                                                        user.role === "admin"
                                                            ? "bg-violet-100 text-violet-700"
                                                            : "bg-blue-100 text-blue-700"
                                                    }`}
                                                >
                                                    {user.fullName
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "U"}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {user.fullName}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        @{user.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Phone
                                                    size={15}
                                                    className="text-slate-400"
                                                />
                                                {user.phone || "No phone number"}
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <RoleBadge role={user.role} />
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <CalendarDays
                                                    size={15}
                                                    className="text-slate-400"
                                                />
                                                {formatDate(user.createdAt)}
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <StatusBadge isActive={user.isActive} />
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    title="Edit account"
                                                    onClick={() => openEditModal(user)}
                                                    className="rounded-lg p-2.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Edit size={17} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Change password"
                                                    onClick={() => openPasswordModal(user)}
                                                    className="rounded-lg p-2.5 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                                                >
                                                    <KeyRound size={17} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title={
                                                        user.isActive
                                                            ? "Deactivate account"
                                                            : "Activate account"
                                                    }
                                                    onClick={() => openStatusConfirmation(user)}
                                                    className={`rounded-lg p-2.5 transition ${
                                                        user.isActive
                                                            ? "text-slate-500 hover:bg-red-50 hover:text-red-600"
                                                            : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                                                    }`}
                                                >
                                                    {user.isActive ? (
                                                        <UserX size={17} />
                                                    ) : (
                                                        <UserCheck size={17} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            <Users size={26} />
                                        </div>

                                        <h3 className="mt-4 font-semibold text-slate-800">
                                            No user accounts found
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Try changing your search or filters.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                                        >
                                            Clear all filters
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}

                <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p className="text-sm text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-800">
                            {pagination.total === 0
                                ? 0
                                : (pagination.page - 1) * pagination.limit + 1}
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
                        {" "}users
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => changePage(pagination.page - 1)}
                            disabled={pagination.page <= 1 || loading}
                            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <span className="min-w-24 text-center text-sm font-semibold text-slate-700">
                            Page {pagination.page} of {Math.max(1, pagination.totalPages)}
                        </span>

                        <button
                            type="button"
                            onClick={() => changePage(pagination.page + 1)}
                            disabled={
                                pagination.page >= pagination.totalPages ||
                                loading
                            }
                            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* CREATE / EDIT MODAL */}

            <UserModal
                isOpen={showUserModal}
                onClose={closeUserModal}
                onSubmit={handleSaveUser}
                selectedUser={selectedUser}
                saving={saving}
            />

            {/* PASSWORD MODAL */}

            <PasswordModal
                isOpen={showPasswordModal}
                onClose={closePasswordModal}
                onSubmit={handleChangePassword}
                selectedUser={selectedUser}
                saving={saving}
            />

            {/* ACTIVATE / DEACTIVATE CONFIRMATION MODAL */}

            <ConfirmationModal
                isOpen={showConfirmationModal}
                onClose={closeStatusConfirmation}
                onConfirm={handleToggleStatus}
                user={userForStatusChange}
                saving={statusSaving}
            />
        </div>
    );
};

export default UserManagement;
