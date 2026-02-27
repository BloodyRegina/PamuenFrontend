import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';

// Setup base URL for the backend API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Login = ({ setAuth }) => {
    const navigate = useNavigate();
    // Changed from email to empId based on auth.controller.js expecting empId & password
    const [formData, setFormData] = useState({ empId: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/login`, formData);

            // The backend returns a unified successResponse wrapper: { success: true, message: "...", data: { token, user } }
            const { token, user } = response.data.data;

            // Save token to browser
            localStorage.setItem('token', token);

            // Update application auth state
            setAuth(user);

            Swal.fire({
                title: 'Success!',
                text: response.data.message || 'Login successful',
                icon: 'success',
                confirmButtonColor: '#c084fc'
            });
            navigate('/home');
        } catch (err) {
            // Use error message directly from the backend's errorResponse wrapper
            const errorMsg = err.response?.data?.message || 'Invalid credentials or server error';
            Swal.fire({
                title: 'Login Failed',
                text: errorMsg,
                icon: 'error',
                confirmButtonColor: '#c084fc'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-light/30 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary mx-auto flex items-center justify-center text-white font-bold text-xl mb-4 shadow-md shadow-primary-light">
                        PE
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
                    <p className="text-sm text-slate-500 mt-2">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField
                        label="Employee ID"
                        type="text"
                        name="empId"
                        placeholder="e.g. EMP001"
                        value={formData.empId}
                        onChange={handleChange}
                        required
                        autoCapitalize="characters"
                    />
                    <InputField
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary font-semibold hover:text-primary-dark transition-colors">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
