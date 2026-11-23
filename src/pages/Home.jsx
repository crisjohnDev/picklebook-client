
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, CalendarDays } from "lucide-react";

export default function Home() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-black text-emerald-700">
                    PickleBook
                </h1>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12">

                <h2 className="text-3xl font-bold text-gray-900">
                    Welcome, {user?.fullName}!
                </h2>

                <p className="text-gray-500 mt-2">
                    Ready to play? Your pickleball experience starts here.
                </p>

                <div className="mt-10 bg-white rounded-2xl p-8 shadow-sm border">
                    <CalendarDays
                        size={40}
                        className="text-emerald-600 mb-4"
                    />

                    <h3 className="text-xl font-bold">
                        Court Reservations
                    </h3>

                    <p className="text-gray-500 mt-2">
                        Court booking functionality will be implemented
                        in the next development modules.
                    </p>
                </div>

            </main>
        </div>
    );
}