import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';

// Setup base URL for the backend API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Register = () => {
    const navigate = useNavigate();
    // Adapted to match Prisma Schema (User) requirements and users.controller.js implementation
    const [formData, setFormData] = useState({
        empId: '',
        name: '',
        email: '',
        departmentId: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [loadingDeps, setLoadingDeps] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await axios.get(`${API_URL}/departments`);
                setDepartments(res.data.data || []);
            } catch (err) {
                console.error("Failed to load departments", err);
            } finally {
                setLoadingDeps(false);
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/register`, formData);

            Swal.fire({
                title: 'Registration Successful!',
                text: response.data.message || 'You can now login with your credentials.',
                icon: 'success',
                confirmButtonColor: '#c084fc'
            });
            navigate('/login');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Registration Failed. Check your data.';
            Swal.fire({
                title: 'Registration Failed',
                text: errorMsg,
                icon: 'error',
                confirmButtonColor: '#c084fc'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-light/20 px-4 py-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Create an Account</h2>
                    <p className="text-sm text-slate-500 mt-2">Join the Performance Evaluation System</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Employee ID"
                            name="empId"
                            placeholder="EMP001"
                            value={formData.empId}
                            onChange={handleChange}
                            required
                        />
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-sm font-medium text-slate-700">Department <span className="text-rose-500">*</span></label>
                            <select
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleChange}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                required
                                disabled={loadingDeps}
                            >
                                <option value="" disabled>
                                    {loadingDeps ? 'Loading departments...' : 'Select Department'}
                                </option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <InputField
                        label="Full Name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <InputField
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-medium text-slate-700">Role <span className="text-rose-500">*</span></label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            required
                        >
                            <option value="EVALUATOR">Evaluator</option>
                            <option value="EVALUATEE">Evaluatee</option>
                        </select>
                    </div>

                    <InputField
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Button
                        type="submit"
                        className="w-full mt-6"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-secondary font-semibold hover:text-secondary-dark transition-colors">
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
