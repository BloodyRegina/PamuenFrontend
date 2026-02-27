import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Settings, X } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../utils/axios';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';

const EvaluationList = () => {
    const navigate = useNavigate();
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchPeriods = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/evaluations');
            setPeriods(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch periods", error);
            Swal.fire({
                title: 'Error Fetching Data',
                text: error.response?.data?.message || 'Could not load evaluation periods.',
                icon: 'error',
                confirmButtonColor: '#c084fc'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPeriods();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreatePeriod = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        // Validate Dates visually
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            Swal.fire({
                title: 'Invalid Dates',
                text: 'The end date must be after the start date.',
                icon: 'warning',
                confirmButtonColor: '#c084fc'
            });
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                name: formData.name,
                startDate: formData.startDate,
                endDate: formData.endDate
            };

            const response = await api.post('/admin/evaluations', payload);

            Swal.fire({
                title: 'Period Created',
                text: response.data.message || 'Evaluation period added successfully.',
                icon: 'success',
                confirmButtonColor: '#c084fc'
            });

            setIsModalOpen(false);
            setFormData({ name: '', startDate: '', endDate: '' });
            fetchPeriods();
        } catch (error) {
            Swal.fire({
                title: 'Creation Failed',
                text: error.response?.data?.message || 'Failed to create period',
                icon: 'error',
                confirmButtonColor: '#c084fc'
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Dynamically compute the status since Prisma doesn't store a 'status' field string
    const getComputedStatus = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Set hours to ignore time specifics for generic 'day' checking
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        if (now < start) return 'Draft';
        if (now >= start && now <= end) return 'Active';
        if (now > end) return 'Completed';
        return 'Unknown';
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'Active': return 'success';
            case 'Completed': return 'default';
            case 'Draft': return 'warning';
            default: return 'default';
        }
    };

    const tableHeaders = ["Period Name", "Start Date", "End Date", "Status", "Action"];

    // Helper to safely format dates
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        // Returns ISO string sliced to YYYY-MM-DD
        return new Date(dateString).toISOString().split('T')[0];
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Evaluation Periods</h1>
                    <p className="text-slate-500 mt-1">Manage and configure performance evaluation cycles.</p>
                </div>
                <Button className="shrink-0" onClick={() => setIsModalOpen(true)}>
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Create Period
                </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="p-8 text-center text-slate-500 flex items-center justify-center h-full">
                        Loading evaluation periods...
                    </div>
                ) : (
                    <Table
                        headers={tableHeaders}
                        data={periods}
                        renderRow={(period, idx) => {
                            const computedStatus = getComputedStatus(period.startDate, period.endDate);

                            return (
                                <tr key={period.id || idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{period.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(period.startDate)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(period.endDate)}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusBadgeVariant(computedStatus)}>
                                            {computedStatus}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/admin/evaluations/${period.id}`)}
                                        >
                                            <Settings className="w-4 h-4 mr-2" />
                                            Manage
                                        </Button>
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
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                            <h3 className="text-xl font-bold text-slate-800">Create New Period</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <form id="createPeriodForm" onSubmit={handleCreatePeriod} className="space-y-4">
                                <InputField
                                    label="Period Name (Title)"
                                    name="name"
                                    placeholder="e.g. 2026 Q1 Evaluation"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField
                                        label="Start Date"
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <InputField
                                        label="End Date"
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" form="createPeriodForm" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Period'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvaluationList;
