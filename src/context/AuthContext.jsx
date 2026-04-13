import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

/* eslint-disable react-refresh/only-export-components */

// 1. Dynamic API Base URL Configuration
let API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;

if (API_BASE_URL) {
    API_BASE_URL = API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    if (!API_BASE_URL.endsWith('/api')) {
        API_BASE_URL = `${API_BASE_URL}/api`;
    }
}

axios.defaults.baseURL = API_BASE_URL || 'http://localhost:8080/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // 2. AXIOS INTERCEPTOR: Banker's Security Guard
    // Ye har request ke saath Token bhejna pakka karega
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                const currentToken = localStorage.getItem('token');
                if (currentToken) {
                    config.headers.Authorization = `Bearer ${currentToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    logout('Session expired or unauthorized');
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    const logout = (reason = 'Unknown') => {
        console.warn('AuthContext: Logging out. Reason:', reason);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const fetchUser = async () => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                console.log('AuthContext: Fetching user profile from Railway...');
                const res = await axios.get('/auth/me');
                setUser(res.data);
            } catch (error) {
                console.error('AuthContext: Profile fetch failed', error.response?.data || error.message);
                logout('Invalid Session');
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (firebaseToken) => {
        console.log('AuthContext: Verifying Login with Backend...');
        try {
            const res = await axios.post('/auth/login', {}, {
                headers: { "Authorization": `Bearer ${firebaseToken}` }
            });

            const { user: authUser } = res.data;
            localStorage.setItem('token', firebaseToken);
            setToken(firebaseToken);
            setUser(authUser);
            return res;
        } catch (error) {
            console.error('AuthContext: Login API Error', error.response?.data);
            throw error;
        }
    };

    const register = async (email, name, role, phone, firebaseToken) => {
        console.log('AuthContext: Creating account in Database...');
        try {
            const res = await axios.post('/auth/register',
                { email, name, role, phone },
                { headers: { "Authorization": `Bearer ${firebaseToken}` } }
            );

            const { user: authUser } = res.data;
            localStorage.setItem('token', firebaseToken);
            setToken(firebaseToken);
            setUser(authUser);
            return res;
        } catch (error) {
            console.error('AuthContext: Registration API Error', error.response?.data);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};