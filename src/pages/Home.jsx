import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { Users, FileText, CheckCircle, Clock, BarChart3 } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ✅ ย้ายฟังก์ชันเข้ามาข้างใน เพื่อป้องกัน Infinite Loop
        const fetchDashboardData = async (role) => {
            try {
                setLoading(true);
                if (role === 'ADMIN') {
                    const [usersRes, evalsRes] = await Promise.all([
                        api.get('/admin/users'),
                        api.get('/admin/evaluations')
                    ]);
                    setStats({
                        totalUsers: usersRes.data.data?.length || 0,
                        totalEvals: evalsRes.data.data?.length || 0
                    });
                } else if (role === 'EVALUATOR' || role === 'EVALUATEE') {
                    const endpoint = role === 'EVALUATOR' ? '/evaluator/assignments' : '/me/evaluations';
                    const res = await api.get(endpoint);
                    const assignments = res.data.data || [];
                    setStats({
                        total: assignments.length,
                        completed: assignments.filter(a => a.status === 'COMPLETED').length,
                        pending: assignments.filter(a => a.status !== 'COMPLETED').length
                    });
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchDashboardData(parsedUser.role);
        } else {
            navigate('/login');
        }
    }, [navigate]); // ✅ ต้องมีแค่ navigate เท่านั้น ห้ามใส่ตัวอื่นเพิ่มเด็ดขาด

    if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล Dashboard...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-2">ยินดีต้อนรับ, {user?.name} 👋</h1>
                <p className="text-purple-100 opacity-90 text-lg">
                    ระบบประเมินผลการปฏิบัติงาน (Performance Evaluation System)
                </p>
                <div className="mt-4 inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    สถานะ: {user?.role}
                </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">ภาพรวมของคุณ (Overview)</h2>

            {user?.role === 'ADMIN' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div onClick={() => navigate('/admin/users')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6 cursor-pointer hover:shadow-md transition-shadow group">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-slate-500 font-medium">พนักงานในระบบทั้งหมด</div>
                            <div className="text-3xl font-bold text-slate-800">{stats?.totalUsers} <span className="text-base font-normal text-slate-500">คน</span></div>
                        </div>
                    </div>
                    <div onClick={() => navigate('/admin/evaluations')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6 cursor-pointer hover:shadow-md transition-shadow group">
                        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-slate-500 font-medium">รอบการประเมินทั้งหมด</div>
                            <div className="text-3xl font-bold text-slate-800">{stats?.totalEvals} <span className="text-base font-normal text-slate-500">รอบ</span></div>
                        </div>
                    </div>
                </div>
            )}

            {(user?.role === 'EVALUATOR' || user?.role === 'EVALUATEE') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center">
                            <BarChart3 className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="text-slate-500 text-sm font-medium">งานประเมินทั้งหมด</div>
                            <div className="text-2xl font-bold text-slate-800">{stats?.total}</div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="text-slate-500 text-sm font-medium">เสร็จสิ้นแล้ว</div>
                            <div className="text-2xl font-bold text-emerald-600">{stats?.completed}</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="text-slate-500 text-sm font-medium">รอการดำเนินการ</div>
                            <div className="text-2xl font-bold text-amber-600">{stats?.pending}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;