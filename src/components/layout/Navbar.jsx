import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, Users, Settings, FileText, ClipboardList } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

const Navbar = ({ user, onLogout }) => {
    // role: 'ADMIN', 'EVALUATOR', 'EVALUATEE'
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        // Clear local storage manually if needed, then trigger parent auth clear
        localStorage.removeItem('token');
        if (onLogout) onLogout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shadow-md shadow-primary-light">
                                PE
                            </div>
                            <span className="text-xl font-bold text-slate-800 hidden sm:block">
                                Performance Evaluation
                            </span>
                        </Link>

                        {/* Dynamic Role-Based Links (Desktop) */}
                        {user && (
                            <div className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-slate-200 h-8">
                                {user.role === 'ADMIN' && (
                                    <>
                                        <Link to="/admin/users" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-primary-light/10 rounded-lg transition-all flex items-center">
                                            <Users className="w-4 h-4 mr-2" />
                                            Users Setup
                                        </Link>
                                        <Link to="/admin/evaluations" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-primary-light/10 rounded-lg transition-all flex items-center">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Eval Setup
                                        </Link>
                                    </>
                                )}

                                {user.role === 'EVALUATOR' && (
                                    <Link to="/evaluator/evaluations" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-primary-light/10 rounded-lg transition-all flex items-center">
                                        <ClipboardList className="w-4 h-4 mr-2" />
                                        My Tasks
                                    </Link>
                                )}

                                {user.role === 'EVALUATEE' && (
                                    <Link to="/me/evaluations" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-primary-light/10 rounded-lg transition-all flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        My Evaluations
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Navigation */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="hidden md:flex items-center gap-3 mr-4">
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
                                        <p className="text-xs text-slate-500">{user.department}</p>
                                    </div>
                                    <Badge variant="primary">{user.role}</Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="hidden sm:flex border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200" onClick={handleLogoutClick}>
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </Button>
                                    <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 md:hidden">
                                        <Menu className="w-6 h-6" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Button size="sm" onClick={() => navigate('/login')}>Login</Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
