
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore authenticated user
    useEffect(() => {
        const token = localStorage.getItem("picklebook_token");

        if (!token) {
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await api.get("/auth/me");
                setUser(response.data.user);
            } catch (error) {
                localStorage.removeItem("picklebook_token");
                localStorage.removeItem("picklebook_user");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Login
    const login = async (credentials) => {
        const response = await api.post("/auth/login", credentials);

        const { token, user } = response.data;

        localStorage.setItem("picklebook_token", token);
        localStorage.setItem("picklebook_user", JSON.stringify(user));

        setUser(user);

        return user;
    };

    // Register
    const register = async (userData) => {
        const response = await api.post(
            "/auth/register",
            userData
        );

        const { token, user } = response.data;

        localStorage.setItem("picklebook_token", token);
        localStorage.setItem(
            "picklebook_user",
            JSON.stringify(user)
        );

        setUser(user);

        return user;
    };

    // Logout
    const logout = () => {
        localStorage.removeItem("picklebook_token");
        localStorage.removeItem("picklebook_user");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};