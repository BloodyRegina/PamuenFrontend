import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Swal from 'sweetalert2';

const UserManage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users');
            setUsers(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถดึงข้อมูลพนักงานได้',
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

    // กำหนดหัวตาราง
    const tableHeaders = ["รหัสพนักงาน", "ชื่อ-นามสกุล", "อีเมล", "สิทธิ์", "จัดการ"];

    const getRoleBadgeVariant = (role) => {
        if (role === 'ADMIN') return 'primary';
        if (role === 'EVALUATOR') return 'secondary';
        return 'default';
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">จัดการผู้ใช้งาน</h1>
                    <p className="text-slate-500 mt-1">รายชื่อพนักงานและสิทธิ์การใช้งานในระบบ</p>
                </div>
                <Button onClick={() => Swal.fire('รอก่อนนะ!', 'เดี๋ยวเรามาทำปุ่มเพิ่มพนักงานในสเตปต่อไป', 'info')}>
                    + เพิ่มผู้ใช้งาน
                </Button>
            </div>

            {loading ? (
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-100">
                    กำลังโหลดข้อมูล...
                </div>
            ) : (
                <Table
                    headers={tableHeaders}
                    data={users}
                    renderRow={(user, idx) => (
                        <tr key={user.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-700">{user.empId}</td>
                            <td className="px-6 py-4 text-sm text-slate-700">{user.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>
                            <td className="px-6 py-4">
                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                    {user.role}
                                </Badge>
                            </td>
                            <td className="px-6 py-4">
                                <Button variant="outline" size="sm">แก้ไข</Button>
                            </td>
                        </tr>
                    )}
                />
            )}
        </div>
    );
};

export default UserManage;