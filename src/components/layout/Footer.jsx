import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">
                        &copy; {new Date().getFullYear()} Performance Evaluation System. All rights reserved.
                    </p>
                    <div className="flex gap-4 text-sm text-slate-500">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
