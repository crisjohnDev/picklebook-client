
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

// Authentication Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Customer Pages
import Home from "./pages/Home";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Courts from "./pages/admin/Courts";
import Reservations from "./pages/admin/Reservations";
import Scheduling from "./pages/admin/Scheduling";
import Customers from "./pages/admin/Customers";
import CustomerDetails from "./pages/admin/CustomerDetails";
import Payments from "./pages/admin/Payments";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import UserManagement from "./pages/admin/UserManagement";

// Staff Pages
import StaffDashboard from "./pages/staff/Dashboard";
import WalkInBooking from "./pages/staff/WalkInBooking";
import StaffScheduling from "./pages/staff/Scheduling";
import StaffReservations from "./pages/staff/Reservations";
import StaffCustomers from "./pages/staff/Customers";
import StaffPayments from "./pages/staff/Payments";
import StaffMyAccount from "./pages/staff/MyAccount";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";

// Route Protection
import ProtectedRoute from "./components/common/ProtectedRoute";

// ==========================================
// REDIRECT AUTHENTICATED USERS TO THEIR
// RESPECTIVE DASHBOARDS
// ==========================================
function getDashboardPath(role) {
    switch (role) {
        case "admin":
            return "/admin/dashboard";

        case "staff":
            return "/staff/dashboard";

        case "customer":
            return "/";

        default:
            return "/login";
    }
}

// ==========================================
// GUEST ROUTE
// Prevent authenticated users from accessing
// login and register pages.
// ==========================================
function GuestRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-gray-500 font-medium">
                    Loading PickleBook...
                </p>
            </div>
        );
    }

    if (user) {
        return (
            <Navigate
                to={getDashboardPath(user.role)}
                replace
            />
        );
    }

    return children;
}

// ==========================================
// APPLICATION ROUTES
// ==========================================
function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>

            {/* =================================
                PUBLIC AUTHENTICATION ROUTES
            ================================= */}

            <Route
                path="/login"
                element={
                    <GuestRoute>
                        <Login />
                    </GuestRoute>
                }
            />

            <Route
                path="/register"
                element={
                    <GuestRoute>
                        <Register />
                    </GuestRoute>
                }
            />


            {/* =================================
                CUSTOMER ROUTES
            ================================= */}

            <Route
                element={
                    <ProtectedRoute allowedRoles={["customer"]} />
                }
            >
                <Route
                    path="/"
                    element={<Home />}
                />
            </Route>


            {/* =================================
                ADMIN ROUTES
                Admin has a separate layout.
            ================================= */}

            <Route
                element={
                    <ProtectedRoute allowedRoles={["admin"]} />
                }
            >
                <Route
                    path="/admin"
                    element={<AdminLayout />}
                >

                    <Route
                        index
                        element={
                            <Navigate to="dashboard" replace />
                        }
                    />

                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="courts"
                        element={<Courts />}
                    />

                    <Route
                        path="reservations"
                        element={<Reservations />}
                    />

                    <Route
                        path="scheduling"
                        element={<Scheduling />}
                    />

                    <Route
                        path="customers"
                        element={<Customers />}
                    />

                    <Route
                        path="customers/:id"
                        element={<CustomerDetails />}
                    />

                    <Route
                        path="payments"
                        element={<Payments />}
                    />

                    <Route
                        path="reports"
                        element={<Reports />}
                    />

                    <Route
                        path="settings"
                        element={<Settings />}
                    />

                    <Route
                        path="user-management"
                        element={<UserManagement />}
                    />

                </Route>
            </Route>


            {/* =================================
                STAFF ROUTES
                Staff has a separate layout.
            ================================= */}

            <Route
                element={
                    <ProtectedRoute allowedRoles={["staff"]} />
                }
            >
                <Route
                    path="/staff"
                    element={<StaffLayout />}
                >

                    <Route
                        index
                        element={
                            <Navigate to="dashboard" replace />
                        }
                    />

                      <Route
                          path="dashboard"
                          element={<StaffDashboard />}
                      />

                      <Route
                          path="walk-in-booking"
                          element={<WalkInBooking />}
                      />
                      <Route
                          path="scheduling"
                          element={<StaffScheduling />}
                      />
                      <Route
                          path="reservations"
                          element={<StaffReservations />}
                      />
                      <Route path="customers" element={<StaffCustomers />} />
                      <Route path="payments" element={<StaffPayments />} />
                      <Route path="my-account" element={<StaffMyAccount />} />

                </Route>
            </Route>


            {/* =================================
                UNKNOWN ROUTES
            ================================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to={user ? getDashboardPath(user.role) : "/login"}
                        replace
                    />
                }
            />

        </Routes>
    );
}

// ==========================================
// MAIN APPLICATION
// ==========================================
export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
