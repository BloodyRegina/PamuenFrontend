import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, CheckCircle, Clock, ClipboardList, Settings } from 'lucide-react';
// import api from '../utils/axios'; // Would be used for real fetching later

const Home = ({ user }) => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({
        totalEvaluations: 0,
        completed: 0,
        pending: 0,
        teamMembers: 0,
        assignedTasks: 0,
        myScores: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // In a real application, we would `api.get('/reports/dashboard')` here.
                // Simulating realistic backend data sets.
                setDashboardData({
                    totalEvaluations: 45,
                    completed: 32,
                    pending: 13,
                    teamMembers: 12,
                    assignedTasks: 5,
                    myScores: 3
                });
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            }
        };

        fetchDashboardData();
    }, []);

    // Build functional Widgets dynamically depending on user.role
    const getStatsByRole = () => {
        if (!user) return [];

        if (user.role === 'ADMIN') {
            return [
                {
                    title: 'Evaluation Setup',
                    value: 'Manage',
                    desc: 'Configure periods and KPI rules',
                    icon: Settings,
                    color: 'text-primary',
                    bg: 'bg-primary-light/10',
                    action: () => navigate('/admin/evaluations')
                },
                {
                    title: 'Total Evaluators',
                    value: dashboardData.teamMembers,
                    desc: 'Active grading accounts',
                    icon: Users,
                    color: 'text-secondary',
                    bg: 'bg-secondary-light/10',
                    action: () => navigate('/admin/users') // Can route here to manage them
                },
                {
                    title: 'Total Evaluatees',
                    value: 42, // Mock Evaluatee pool
                    desc: 'Registered evaluation targets',
                    icon: Users,
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-50',
                    action: () => navigate('/admin/users')
                },
            ];
        }

        if (user.role === 'EVALUATOR') {
            return [
                {
                    title: 'Assigned Evaluations',
                    value: dashboardData.assignedTasks,
                    desc: 'Grade your assigned peers',
                    icon: ClipboardList,
                    color: 'text-amber-500',
                    bg: 'bg-amber-50',
                    action: () => navigate('/evaluator/evaluations')
                },
                {
                    title: 'Completed Scoring',
                    value: 2,
                    desc: 'Finished peer reviews',
                    icon: CheckCircle,
                    color: 'text-primary',
                    bg: 'bg-primary-light/10',
                    action: () => navigate('/evaluator/evaluations')
                }
            ];
        }

        // EVALUATEE or Default Normal User
        return [
            {
                title: 'My Evaluations',
                value: dashboardData.myScores,
                desc: 'View your target milestones',
                icon: FileText,
                color: 'text-secondary',
                bg: 'bg-secondary-light/10',
                action: () => navigate('/me/evaluations')
            }
        ];
    };

    const stats = getStatsByRole();

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Welcome back, {user?.name || 'User'}!</h1>
                <p className="text-slate-500 mt-2 text-lg">Here is the quick-access summary of your workspace.</p>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 ${stats.length >= 3 ? 'lg:grid-cols-3' : ''} gap-6`}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            onClick={stat.action}
                            className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-${stat.color.split('-')[1]}/30`}
                        >
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-500 mb-1 tracking-wide uppercase">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                                {stat.desc && <p className="text-xs text-slate-400 mt-2">{stat.desc}</p>}
                            </div>
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shrink-0 ml-4 transition-transform group-hover:scale-110`}>
                                <Icon className="w-8 h-8" />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Recent Timeline Activity</h3>
                <p className="text-slate-500 max-w-md mx-auto">More detailed history charts and reporting graphs will be populated here as your account generates reporting data across evaluation periods.</p>
            </div>
        </div>
    );
};

export default Home;
