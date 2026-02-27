import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { ClipboardCheck } from 'lucide-react';
import Swal from 'sweetalert2';

const EvaluatorTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTasks = async () => {
        try {
            setLoading(true);
            // ดึงรายการที่ได้รับมอบหมายให้ประเมินจาก Backend
            const response = await api.get('/evaluator/assignments');
            setTasks(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
            Swal.fire('Error', 'ไม่สามารถดึงรายการงานประเมินได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const tableHeaders = ["ผู้ถูกประเมิน (Evaluatee)", "รอบการประเมิน", "สถานะ", "จัดการ"];

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">รายการที่ต้องประเมิน</h1>
                <p className="text-slate-500 mt-1">รายชื่อพนักงานที่คุณได้รับมอบหมายให้ประเมินผล</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="p-8 text-center text-slate-500 flex items-center justify-center h-full">
                        กำลังโหลดรายการงาน...
                    </div>
                ) : (
                    <Table
                        headers={tableHeaders}
                        data={tasks}
                        renderRow={(task, idx) => (
                            <tr key={task.id || idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-slate-800">{task.evaluatee?.name}</div>
                                    <div className="text-xs text-slate-500">ID: {task.evaluatee?.empId}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {task.evaluation?.name || task.evaluation?.title}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={task.status === 'COMPLETED' ? 'success' : 'warning'}>
                                        {task.status === 'COMPLETED' ? 'เสร็จสิ้น' : 'รอดำเนินการ'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <Button 
                                        variant={task.status === 'COMPLETED' ? 'outline' : 'primary'}
                                        size="sm"
                                        onClick={() => navigate(`/evaluator/assess/${task.id}`)}
                                    >
                                        <ClipboardCheck className="w-4 h-4 mr-2" />
                                        {task.status === 'COMPLETED' ? 'ดูผลประเมิน' : 'เริ่มประเมิน'}
                                    </Button>
                                </td>
                            </tr>
                        )}
                    />
                )}
                {!loading && tasks.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        ไม่มีรายการที่ต้องประเมินในขณะนี้
                    </div>
                )}
            </div>
        </div>
    );
};

export default EvaluatorTasks;