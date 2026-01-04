import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import './AdminPanel.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('access_token');

        if (!token || !user || (!user.is_staff && !user.is_superuser)) {
            alert("Access Denied: Admin privileges required.");
            navigate('/');
        } else {
            setIsAuthorized(true);
        }
    }, [navigate]);

    if (!isAuthorized) return null;

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
