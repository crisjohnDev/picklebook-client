
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        phone: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await register(formData);
            navigate("/");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f7f2] px-4 py-10">

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl font-black">
                            PB
                        </span>
                    </div>

                    <h1 className="text-3xl font-black text-gray-900">
                        Create Account
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Join PickleBook today.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {[
                        {
                            name: "fullName",
                            label: "Full Name",
                            placeholder: "Enter your full name",
                            type: "text"
                        },
                        {
                            name: "username",
                            label: "Username",
                            placeholder: "Choose a username",
                            type: "text"
                        },
                        {
                            name: "phone",
                            label: "Phone Number",
                            placeholder: "Enter phone number",
                            type: "tel"
                        },
                        {
                            name: "password",
                            label: "Password",
                            placeholder: "Minimum 8 characters",
                            type: "password"
                        }
                    ].map((field) => (
                        <div key={field.name}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {field.label}
                            </label>

                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                autoComplete={
                                    field.name === "password"
                                        ? "new-password"
                                        : "off"
                                }
                                minLength={
                                    field.name === "password" ? 8 : undefined
                                }
                                required={
                                    field.name !== "phone"
                                }
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>

                </form>

                <p className="text-center text-sm text-gray-500 mt-7">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-emerald-700 font-bold hover:underline"
                    >
                        Sign In
                    </Link>
                </p>

            </div>
        </div>
    );
}