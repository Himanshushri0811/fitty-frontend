import React, { useState, useEffect } from 'react';
import API from '../axiosConfig';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await API.get('/api/admin-panel/logs/');
                setLogs(response.data);
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    if (loading) return <div>Loading logs...</div>;

    return (
        <div>
            <div className="admin-header">
                <h1>Audit Logs</h1>
                <p>Track every administrative action performed on the platform.</p>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Admin</th>
                            <th>Action</th>
                            <th>Target</th>
                            <th>Details</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td><strong>{log.admin_username}</strong></td>
                                <td>{log.action_type}</td>
                                <td>{log.target_model} (#{log.target_id})</td>
                                <td>{log.details}</td>
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActivityLogs;
