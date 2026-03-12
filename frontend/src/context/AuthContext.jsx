import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
    export const AuthContext = createContext();

    
    export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [token, setToken] = useState(localStorage.getItem('token'));
      const [loading, setLoading] = useState(true);
      const navigate = useNavigate();
      const roleToPath = (role) =>role.toLowerCase().replace(/\s+/g, '');

      useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(userData);
          } catch (err) {
            console.error('Error parsing user data:', err);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
        setLoading(false);
      }, []);
    
      const register = async (name, email, password, companyName) => {
        try {
          const res = await fetch('${API_URL}/api/auth/register-super-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, companyName })
          });
    
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
    
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setToken(data.token);
          setUser(data.user);
          navigate('/onboarding');
        } catch (err) {
          throw err;
        }
      };
    
    const login = async (email, password) => {
    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // ✅ Save to localStorage FIRST
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // ✅ Update state
        setToken(data.token);
        setUser(data.user);

        // ✅ Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));

        // ✅ Navigate based on onboarding status
        if (data.requiresOnboarding) {
          navigate('/onboarding');
        } else {
        navigate(`/payroll/${roleToPath(data.user.role)}`);
        }
      } catch (err) {
        throw err;
      }
    };
    
    
      const employeeLogin = async (email, password) => {
        try {
          const res = await fetch(`${API_URL}/api/auth/employee/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Login failed");

          const employeeUser = {
            ...data?.user,
            portal: "employee",
          };

          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(employeeUser));

          setToken(data.token);
          setUser(employeeUser);

          navigate("/employee");
        } catch (err) {
          throw err;
        }
      };

      const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        navigate('/login');
      };
      const Employeelogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        navigate('/employeeLogin');
      };
      return (
        <AuthContext.Provider value={{ user, token, loading, register, login,employeeLogin, logout,Employeelogout }}>
          {children}
        </AuthContext.Provider>
      );
    };