import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ user, onLogout }) => {
    return (
        <div className="flex flex-col min-h-screen bg-surface">
            <Navbar user={user} onLogout={onLogout} />

            {/* Main Content Area */}
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 min-h-[calc(100vh-16rem)]">
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
