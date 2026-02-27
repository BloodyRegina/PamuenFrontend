import React, { useState, useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../utils/axios'; // Use our custom axios instance
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';

const UserManage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State for Create User Form matching Schema Payload
    const [formData, setFormData] = useState({
        empId: '',
        firstName: '',
        lastName: '',
        departmentId: '',
        email: '',
        role: 'EVALUATEE',
        password: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users');
            // Assume successResponse wrapper -> { data: { data: [...] } }
            setUsers(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
            Swal.fire({
                title: 'Error Fetching Data',
                text: error.response?.data?.message || 'Could not load users from server.',
                icon: 'error',
                confirmButtonColor: '#c084fc'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Backend expects a single 'name' string per Prisma
            const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

            const payload = {
                empId: formData.empId,
                name: fullName,
                departmentId: formData.departmentId,
                email: formData.email,
                role: formData.role,
                password: formData.password
            };

            const response = await api.post('/admin/users', payload);

            Swal.fire({
                title: 'User Created',
                text: response.data.message || 'User added successfully',
                icon: 'success',
                confirmButtonColor: '#c084fc'
            });

            setIsModalOpen(false);
            // Reset form
            setFormData({
                empId: '', firstName: '', lastName: '', departmentId: '', email: '', role: 'EVALUATEE', password: ''
            });

            // Refresh list
            fetchUsers();
        } catch (error) {
            Swal.fire({
                title: 'Creation Failed',
                text: error.response?.data?.message || 'Failed to create user',
                icon: 'error',
                confirmButtonColor: '#c084fc'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const splitName = (fullName) => {
        if (!fullName) return { first: '-', last: '-' };
        const parts = fullName.trim().split(' ');
        const first = parts[0];
        const last = parts.slice(1).join(' ') || '-';
        return { first, last };
    };

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'ADMIN': return 'primary';
            case 'EVALUATOR': return 'secondary';
            default: return 'default';
        }
    };

    const tableHeaders = ["Employee ID", "First Name", "Last Name", "Role", "Action"];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage system users, view exact details, and configure roles.</p>
                </div>
                <Button className="shrink-0" onClick={() => setIsModalOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User
                </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="p-8 text-center text-slate-500 flex justify-center items-center h-full">
                        Loading user data from server...
                    </div>
                ) : (
                    <Table
                        headers={tableHeaders}
                        data={users}
                        renderRow={(user, idx) => {
                            const { first, last } = splitName(user.name);
                            return (
                                <tr key={user.id || idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{user.empId}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{first}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{last}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getRoleBadgeVariant(user.role)}>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">Edit</Button>
                                            <Button variant="danger" size="sm">Delete</Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        }}
                    />
                )}
            </div>

            {/* Modern Aesthetic Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                            <h3 className="text-xl font-bold text-slate-800">Create New User</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="createUserForm" onSubmit={handleCreateUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField
                                        label="Employee ID (empId)"
                                        name="empId"
                                        value={formData.empId}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <InputField
                                        label="Department ID"
                                        name="departmentId"
                                        placeholder="Mongo ObjectId"
                                        value={formData.departmentId}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField
                                        label="First Name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <InputField
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <InputField
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />

                                <div className="flex flex-col gap-1 w-full">
                                    <label className="text-sm font-medium text-slate-700">Role <span className="text-rose-500">*</span></label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                                        required
                                    >
                                        <option value="ADMIN">Admin</option>
                                        <option value="EVALUATOR">Evaluator</option>
                                        <option value="EVALUATEE">Evaluatee</option>
                                    </select>
                                </div>

                                <InputField
                                    label="Password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </form>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" form="createUserForm" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create User'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManage;
