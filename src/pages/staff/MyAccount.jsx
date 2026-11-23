
import { useEffect, useState } from "react";
import {
    UserRound,
    ShieldCheck,
    Phone,
    AtSign,
    CalendarDays,
    LockKeyhole,
    Save,
    RefreshCw,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    UserCog
} from "lucide-react";

import accountService from "../../services/accountService";

// ==========================================
// HELPER: FORMAT DATE
// ==========================================

const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};


// ==========================================
// REUSABLE INPUT COMPONENT
// ==========================================

const FormInput = ({
    label,
    icon: Icon,
    value,
    onChange,
    placeholder,
    type = "text",
    disabled = false,
    rightElement
}) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
                {label}
            </label>

            <div className="relative">
                {Icon && (
                    <Icon
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                )}

                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full rounded-xl border border-slate-200 bg-white py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 ${
                        Icon ? "pl-11" : "pl-4"
                    } ${rightElement ? "pr-12" : "pr-4"}`}
                />

                {rightElement}
            </div>
        </div>
    );
};


// ==========================================
// INFORMATION CARD
// ==========================================

const InfoCard = ({ icon: Icon, label, value }) => {
    return (
        <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <Icon size={19} />
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                    {value || "Not provided"}
                </p>
            </div>
        </div>
    );
};


// ==========================================
// MAIN STAFF MY ACCOUNT PAGE
// ==========================================

const MyAccount = () => {

    // ==========================================
    // STATES
    // ==========================================

    const [account, setAccount] = useState(null);

    const [profile, setProfile] = useState({
        fullName: "",
        username: "",
        phone: ""
    });

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [profileMessage, setProfileMessage] = useState({
        type: "",
        text: ""
    });

    const [passwordMessage, setPasswordMessage] = useState({
        type: "",
        text: ""
    });

    const [pageError, setPageError] = useState("");

    // ==========================================
    // LOAD ACCOUNT INFORMATION
    // ==========================================

    const loadAccount = async () => {
        try {
            setLoading(true);
            setPageError("");

            const response = await accountService.getMyAccount();

            const user = response.user;

            // Staff-only page protection
            if (user.role !== "staff") {
                setPageError(
                    "This page is only available to staff accounts."
                );
                return;
            }

            setAccount(user);

            setProfile({
                fullName: user.fullName || "",
                username: user.username || "",
                phone: user.phone || ""
            });

        } catch (error) {
            console.error("Load Account Error:", error);

            setPageError(
                error.response?.data?.message ||
                "Unable to load account information."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAccount();
    }, []);

    // ==========================================
    // HANDLE PROFILE INPUT
    // ==========================================

    const handleProfileChange = (field, value) => {
        setProfile((previous) => ({
            ...previous,
            [field]: value
        }));

        setProfileMessage({
            type: "",
            text: ""
        });
    };

    // ==========================================
    // UPDATE PROFILE
    // ==========================================

    const handleUpdateProfile = async (event) => {
        event.preventDefault();

        setProfileMessage({
            type: "",
            text: ""
        });

        if (!profile.fullName.trim() || !profile.username.trim()) {
            setProfileMessage({
                type: "error",
                text: "Full name and username are required."
            });
            return;
        }

        try {
            setSavingProfile(true);

            const response = await accountService.updateProfile({
                fullName: profile.fullName.trim(),
                username: profile.username.trim(),
                phone: profile.phone.trim()
            });

            setAccount(response.user);

            setProfile({
                fullName: response.user.fullName || "",
                username: response.user.username || "",
                phone: response.user.phone || ""
            });

            setProfileMessage({
                type: "success",
                text: response.message || "Profile updated successfully."
            });

        } catch (error) {
            console.error("Update Profile Error:", error);

            setProfileMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Unable to update profile."
            });

        } finally {
            setSavingProfile(false);
        }
    };

    // ==========================================
    // HANDLE PASSWORD INPUT
    // ==========================================

    const handlePasswordChange = (field, value) => {
        setPasswords((previous) => ({
            ...previous,
            [field]: value
        }));

        setPasswordMessage({
            type: "",
            text: ""
        });
    };

    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    const handleChangePassword = async (event) => {
        event.preventDefault();

        setPasswordMessage({
            type: "",
            text: ""
        });

        if (
            !passwords.currentPassword ||
            !passwords.newPassword ||
            !passwords.confirmPassword
        ) {
            setPasswordMessage({
                type: "error",
                text: "Please complete all password fields."
            });
            return;
        }

        if (passwords.newPassword.length < 8) {
            setPasswordMessage({
                type: "error",
                text: "New password must contain at least 8 characters."
            });
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setPasswordMessage({
                type: "error",
                text: "New password and confirmation do not match."
            });
            return;
        }

        try {
            setSavingPassword(true);

            const response = await accountService.changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
                confirmPassword: passwords.confirmPassword
            });

            setPasswords({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

            setPasswordMessage({
                type: "success",
                text: response.message || "Password changed successfully."
            });

        } catch (error) {
            console.error("Change Password Error:", error);

            setPasswordMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Unable to change password."
            });

        } finally {
            setSavingPassword(false);
        }
    };

    // ==========================================
    // PASSWORD VISIBILITY
    // ==========================================

    const togglePasswordVisibility = (field) => {
        setShowPasswords((previous) => ({
            ...previous,
            [field]: !previous[field]
        }));
    };

    const passwordToggle = (field) => (
        <button
            type="button"
            onClick={() => togglePasswordVisibility(field)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            aria-label="Toggle password visibility"
        >
            {showPasswords[field] ? (
                <EyeOff size={18} />
            ) : (
                <Eye size={18} />
            )}
        </button>
    );

    // ==========================================
    // MESSAGE COMPONENT
    // ==========================================

    const Message = ({ message }) => {
        if (!message.text) return null;

        const isSuccess = message.type === "success";

        return (
            <div
                className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
                    isSuccess
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                }`}
            >
                {isSuccess ? (
                    <CheckCircle2 size={19} className="shrink-0" />
                ) : (
                    <AlertCircle size={19} className="shrink-0" />
                )}

                <span>{message.text}</span>
            </div>
        );
    };

    // ==========================================
    // LOADING STATE
    // ==========================================

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 xl:px-8">
                <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
                <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
            </div>
        );
    }

    // ==========================================
    // ERROR STATE
    // ==========================================

    if (pageError) {
        return (
            <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 xl:px-8">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                    <div className="flex items-center gap-3 text-red-700">
                        <AlertCircle size={22} />
                        <h2 className="font-semibold">
                            Unable to access My Account
                        </h2>
                    </div>

                    <p className="mt-2 text-sm text-red-600">
                        {pageError}
                    </p>

                    <button
                        type="button"
                        onClick={loadAccount}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // MAIN UI
    // ==========================================

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 xl:px-8 xl:py-10">

            {/* PAGE HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                            <UserRound size={24} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                My Account
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage your staff profile and account security.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={loadAccount}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>


            {/* PROFILE SUMMARY */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-8 sm:px-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-white">
                            <UserRound size={38} />
                        </div>

                        <div className="min-w-0 text-white">
                            <h2 className="truncate text-2xl font-bold">
                                {account?.fullName}
                            </h2>

                            <p className="mt-1 text-sm text-emerald-50">
                                @{account?.username}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                                    <ShieldCheck size={14} />
                                    Staff Account
                                </span>

                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-semibold text-white">
                                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                    {account?.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-8">
                    <InfoCard
                        icon={UserCog}
                        label="Account Role"
                        value="Staff"
                    />

                    <InfoCard
                        icon={CalendarDays}
                        label="Member Since"
                        value={formatDate(account?.createdAt)}
                    />

                    <InfoCard
                        icon={ShieldCheck}
                        label="Account Status"
                        value={account?.isActive ? "Active" : "Inactive"}
                    />
                </div>
            </section>


            {/* PROFILE AND SECURITY */}
            <div className="grid items-start gap-8 xl:grid-cols-2">

                {/* EDIT PROFILE */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-7 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <UserCog size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Profile Information
                            </h2>

                            <p className="text-sm text-slate-500">
                                Update your personal information.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-5">

                        <FormInput
                            label="Full Name"
                            icon={UserRound}
                            value={profile.fullName}
                            onChange={(event) =>
                                handleProfileChange("fullName", event.target.value)
                            }
                            placeholder="Enter your full name"
                        />

                        <FormInput
                            label="Username"
                            icon={AtSign}
                            value={profile.username}
                            onChange={(event) =>
                                handleProfileChange("username", event.target.value)
                            }
                            placeholder="Enter your username"
                        />

                        <FormInput
                            label="Phone Number"
                            icon={Phone}
                            value={profile.phone}
                            onChange={(event) =>
                                handleProfileChange("phone", event.target.value)
                            }
                            placeholder="Enter your phone number"
                        />

                        <Message message={profileMessage} />

                        <div className="border-t border-slate-100 pt-5">
                            <button
                                type="submit"
                                disabled={savingProfile}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                {savingProfile ? (
                                    <>
                                        <RefreshCw size={17} className="animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save size={17} />
                                        Save Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </section>


                {/* CHANGE PASSWORD */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-7 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <LockKeyhole size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Change Password
                            </h2>

                            <p className="text-sm text-slate-500">
                                Keep your account secure.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-5">

                        <FormInput
                            label="Current Password"
                            value={passwords.currentPassword}
                            onChange={(event) =>
                                handlePasswordChange("currentPassword", event.target.value)
                            }
                            placeholder="Enter current password"
                            type={showPasswords.current ? "text" : "password"}
                            rightElement={passwordToggle("current")}
                        />

                        <FormInput
                            label="New Password"
                            value={passwords.newPassword}
                            onChange={(event) =>
                                handlePasswordChange("newPassword", event.target.value)
                            }
                            placeholder="Enter new password"
                            type={showPasswords.new ? "text" : "password"}
                            rightElement={passwordToggle("new")}
                        />

                        <FormInput
                            label="Confirm New Password"
                            value={passwords.confirmPassword}
                            onChange={(event) =>
                                handlePasswordChange("confirmPassword", event.target.value)
                            }
                            placeholder="Confirm new password"
                            type={showPasswords.confirm ? "text" : "password"}
                            rightElement={passwordToggle("confirm")}
                        />

                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <div className="flex items-start gap-2 text-blue-700">
                                <ShieldCheck size={18} className="mt-0.5 shrink-0" />

                                <div>
                                    <p className="text-sm font-semibold">
                                        Password requirements
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-blue-600">
                                        Use at least 8 characters. Choose a password
                                        that is difficult for others to guess.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Message message={passwordMessage} />

                        <div className="border-t border-slate-100 pt-5">
                            <button
                                type="submit"
                                disabled={savingPassword}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                {savingPassword ? (
                                    <>
                                        <RefreshCw size={17} className="animate-spin" />
                                        Updating Password...
                                    </>
                                ) : (
                                    <>
                                        <LockKeyhole size={17} />
                                        Update Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </section>
            </div>

        </div>
    );
};

export default MyAccount;
