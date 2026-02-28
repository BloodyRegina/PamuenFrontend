import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
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
                text: 'ไม่สามารถดึงข้อมูลผู้ใช้งานได้',
                icon: 'error',
                confirmButtonColor: '#c084fc' // ใช้สีม่วงอ่อนให้เข้ากับธีม
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // เอาคอลัมน์ "จัดการ" ออก เหลือแค่ข้อมูลพื้นฐาน
    const tableHeaders = ["รหัสพนักงาน", "ชื่อ-นามสกุล", "อีเมล", "สิทธิ์"];

    const getRoleBadgeVariant = (role) => {
        if (role === 'ADMIN') return 'primary';
        if (role === 'EVALUATOR') return 'secondary';
        return 'default';
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-fuchsia-100">
                <h1 className="text-2xl font-bold text-slate-800">รายชื่อผู้ใช้งานระบบ</h1>
                <p className="text-slate-500 mt-1">แสดงรายชื่อพนักงานและสิทธิ์การเข้าใช้งานทั้งหมด</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-fuchsia-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">
                        กำลังโหลดข้อมูล...
                    </div>
                ) : (
                    <Table
                        headers={tableHeaders}
                        headerClassName="bg-fuchsia-50 text-slate-700" // หัวตารางสีชมพูอ่อน
                        data={users}
                        renderRow={(user, idx) => (
                            <tr key={user.id || idx} className="hover:bg-purple-50 transition-colors border-b border-fuchsia-50">
                                <td className="px-6 py-4 text-sm font-medium text-slate-700">{user.empId}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{user.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={getRoleBadgeVariant(user.role)}>
                                        {user.role}
                                    </Badge>
                                </td>
                            </tr>
                        )}
                    />
                )}
            </div>
        </div>
    );
};

export default UserManage;