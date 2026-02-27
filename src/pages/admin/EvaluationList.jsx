import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Swal from 'sweetalert2';

const EvaluationList = () => {
    const navigate = useNavigate();
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPeriods = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/evaluations');
            setPeriods(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch periods", error);
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถดึงข้อมูลรอบการประเมินได้',
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

    // กำหนดหัวตาราง
    const tableHeaders = ["ชื่อการประเมิน", "วันที่เริ่มต้น", "วันที่สิ้นสุด", "จัดการ"];

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('th-TH');
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">รอบการประเมิน</h1>
                    <p className="text-slate-500 mt-1">จัดการรอบการประเมิน หัวข้อ และตัวชี้วัด</p>
                </div>
                <Button onClick={() => Swal.fire('Coming soon!', 'ระบบสร้างรอบการประเมินกำลังตามมา', 'info')}>
                    + สร้างรอบการประเมิน
                </Button>
            </div>

            {loading ? (
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-100">
                    กำลังโหลดข้อมูล...
                </div>
            ) : (
                <Table
                    headers={tableHeaders}
                    data={periods}
                    renderRow={(period, idx) => (
                        <tr key={period.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-700">{period.name || period.title}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{formatDate(period.startDate)}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{formatDate(period.endDate)}</td>
                            <td className="px-6 py-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/admin/evaluations/${period.id}`)}
                                >
                                    จัดการแบบประเมิน
                                </Button>
                            </td>
                        </tr>
                    )}
                />
            )}
        </div>
    );
};

export default EvaluationList;