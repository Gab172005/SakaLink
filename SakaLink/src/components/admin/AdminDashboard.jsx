import { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { adminAPI, ordersAPI } from '../../services/api';

export default function AdminDashboard({ showToast }) {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false);
    const [salesData, setSalesData] = useState(null);
    const [salesPeriod, setSalesPeriod] = useState('monthly');
    const [salesLoading, setSalesLoading] = useState(false);
    
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            setUsersLoading(true);
            const data = await adminAPI.getUsers();
            setUsers(data.users || []);
        } catch (err) {
            console.error("Users Fetch Error:", err);
            showToast?.("Failed to load user list", 'error');
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(''); 
            
            const data = await adminAPI.getAllOrders();
            setOrders(Array.isArray(data) ? data : []);
            setIsVerifiedAdmin(true);

            // Fetch users as well for the total count metric
            await fetchUsers();

        } catch (err) {
            if (err.status === 401 || err.status === 403) {
                console.error("You are not authorized to view this");
                if (showToast) showToast('Access denied. Booting to home...', 'error');
                navigate('/', { replace: true });
                return;
            }
            setError(err.message);
            if (showToast) showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchSales = async (period) => {
        try {
            setSalesLoading(true);
            const data = await adminAPI.getSales(period);
            setSalesData(data);
        } catch (err) {
            console.error("Sales Fetch Error:", err);
            showToast?.("Failed to load sales report", 'error');
        } finally {
            setSalesLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'sales') {
            fetchSales(salesPeriod);
        } else if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab, salesPeriod]);

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            await adminAPI.deleteUser(userId);
            showToast?.('User deleted successfully!');
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (err) {
            console.error("User Deletion Failed:", err.message);
            showToast?.(`Action Failed: ${err.message}`, 'error');
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            if (newStatus === 1) {
                await ordersAPI.confirmOrder(orderId);
            } else if (newStatus === 2) {
                await ordersAPI.deliverOrder(orderId);
            } else if (newStatus === 3) {
                await ordersAPI.cancelOrder(orderId);
            } else {
                throw new Error(`Unsupported status targeted: ${newStatus}`);
            }

            showToast?.('Order status updated successfully!');

            //force reactive UI state array updates
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order._id === orderId ? { ...order, status: newStatus } : order
                )
            );

        } catch (err) {
            console.error("UI Update Aborted:", err.message);
            showToast?.(`Action Failed: ${err.message}`, 'error');
        }
    };

    const totalOrdersCount = orders.length;
    const pendingCount = orders.filter(o => o.status === 0 || o.status === 1).length;
    const reviewCount = orders.filter(o => o.status === 0).length;
    const shippingCount = orders.filter(o => o.status === 1).length;
    const completedCount = orders.filter(o => o.status === 2).length;
    const totalRevenue = orders
        .filter(o => o.status === 2)
        .reduce((sum, o) => sum + (o.totalToPay || 0), 0);

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'pending') return order.status === 0;
        if (activeTab === 'shipping') return order.status === 1;
        if (activeTab === 'completed') return order.status === 2;
        if (activeTab === 'cancelled') return order.status === 3;
        return true; 
    });

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 0: return styles.badgePending;
            case 1: return styles.badgeShipping;
            case 2: return styles.badgeCompleted;
            case 3: return styles.badgeCancelled;
            default: return styles.badgePending;
        }
    };

    const getStatusLabel = (status) => {
        if (status === 0) return 'Pending';
        if (status === 1) return 'Out for Delivery';
        if (status === 2) return 'Delivered';
        return 'Cancelled';
    };

    if (loading) return <div className={styles.centeredState}><span className={styles.spinner} /> Loading dashboard...</div>;
    if (error) return <div className={styles.centeredState}><p className={styles.errorText}>⚠️ {error}</p></div>;
    if (!isVerifiedAdmin) return null;

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.dashHeader}>
                <div>
                    <h1 className={styles.mainTitle}>SakaLink Management Console</h1>
                    <p className={styles.subTitle}>Review incoming farmer marketplace requests, confirm orders, or manage cancellations.</p>
                </div>
            </header>

            <section className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricMeta}>
                        <span className={styles.metricLabel}>Total Orders</span>
                        <span className={styles.metricIcon}>📦</span>
                    </div>
                    <h3 className={styles.metricValue}>{totalOrdersCount}</h3>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricMeta}>
                        <span className={styles.metricLabel}>Awaiting Actions</span>
                        <span className={styles.metricIcon}>⏳</span>
                    </div>
                    <h3 className={`${styles.metricValue} ${styles.textWarning}`}>{pendingCount}</h3>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricMeta}>
                        <span className={styles.metricLabel}>Orders Completed</span>
                        <span className={styles.metricIcon}>✅</span>
                    </div>
                    <h3 className={`${styles.metricValue} ${styles.textSuccess}`}>{completedCount}</h3>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricMeta}>
                        <span className={styles.metricLabel}>Registered Users</span>
                        <span className={styles.metricIcon}>👥</span>
                    </div>
                    <h3 className={styles.metricValue}>{users.length}</h3>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricMeta}>
                        <span className={styles.metricLabel}>Gross Realized Earnings</span>
                        <span className={styles.metricIcon}>₱</span>
                    </div>
                    <h3 className={styles.metricValue}>₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                </div>
            </section>

            <div className={styles.tableControlsCard}>
                <div className={styles.tabGroup}>
                    <button className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabActive : ''}`} onClick={() => setActiveTab('all')}>All Logs</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.tabActive : ''}`} onClick={() => setActiveTab('pending')}>Pending Review ({reviewCount})</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'shipping' ? styles.tabActive : ''}`} onClick={() => setActiveTab('shipping')}>Out for Delivery ({shippingCount})</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'completed' ? styles.tabActive : ''}`} onClick={() => setActiveTab('completed')}>Completed</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'cancelled' ? styles.tabActive : ''}`} onClick={() => setActiveTab('cancelled')}>Cancelled</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabActive : ''}`} onClick={() => setActiveTab('users')}>User Management ({users.length})</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'sales' ? styles.tabActive : ''}`} onClick={() => setActiveTab('sales')}>Sales Report</button>
                </div>

                <div className={styles.tableWrapper}>
                    {activeTab === 'sales' ? (
                        <div className={styles.salesReportSection}>
                            <div className={styles.salesHeader}>
                                <div className={styles.periodPicker}>
                                    <button className={`${styles.periodBtn} ${salesPeriod === 'weekly' ? styles.periodActive : ''}`} onClick={() => setSalesPeriod('weekly')}>Weekly</button>
                                    <button className={`${styles.periodBtn} ${salesPeriod === 'monthly' ? styles.periodActive : ''}`} onClick={() => setSalesPeriod('monthly')}>Monthly</button>
                                    <button className={`${styles.periodBtn} ${salesPeriod === 'annual' ? styles.periodActive : ''}`} onClick={() => setSalesPeriod('annual')}>Annual</button>
                                </div>
                                <div className={styles.totalSalesSummary}>
                                    <span className={styles.summaryLabel}>Total Sales ({salesPeriod}):</span>
                                    <span className={styles.summaryValue}>₱{salesData?.totalSales?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                                </div>
                            </div>
                            
                            {salesLoading ? (
                                <div className={styles.tablePlaceholder}><span className={styles.spinner} /> Loading sales analytics...</div>
                            ) : (
                                <>
                                    <div className={styles.chartContainer}>
                                        <h4 className={styles.chartTitle}>Sales Revenue Trend</h4>
                                        <div style={{ width: '100%', height: 300, position: 'relative' }}>
                                            {salesData?.dailyTrend && salesData.dailyTrend.length > 0 ? (
                                                <ResponsiveContainer width="99%" height="100%">
                                                    <AreaChart data={salesData.dailyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#4a8c2a" stopOpacity={0.1}/>
                                                                <stop offset="95%" stopColor="#4a8c2a" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis 
                                                            dataKey="date" 
                                                            axisLine={false} 
                                                            tickLine={false} 
                                                            tick={{ fontSize: 12, fill: '#64748b' }}
                                                            minTickGap={30}
                                                            tickFormatter={(str) => {
                                                                const date = new Date(str);
                                                                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                                            }}
                                                        />
                                                        <YAxis 
                                                            axisLine={false} 
                                                            tickLine={false} 
                                                            tick={{ fontSize: 12, fill: '#64748b' }}
                                                            tickFormatter={(val) => `₱${val}`}
                                                        />
                                                        <Tooltip 
                                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                            formatter={(value) => [`₱${value.toLocaleString()}`, 'Sales']}
                                                            labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                        />
                                                        <Area 
                                                            type="monotone" 
                                                            dataKey="sales" 
                                                            stroke="#4a8c2a" 
                                                            strokeWidth={3}
                                                            fillOpacity={1} 
                                                            fill="url(#colorSales)" 
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Preparing layout data...</div>
                                            )}
                                        </div>
                                    </div>

                                    <table className={styles.mainTable}>
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th className={styles.centerAlign}>Quantity Sold</th>
                                            <th className={styles.centerAlign}>Income Generated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesData?.breakdown && Object.keys(salesData.breakdown).length > 0 ? (
                                            Object.entries(salesData.breakdown).map(([name, stats]) => (
                                                <tr key={name}>
                                                    <td><strong>{name}</strong></td>
                                                    <td className={styles.centerAlign}>{stats.quantitySold}</td>
                                                    <td className={styles.centerAlign}>₱{stats.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className={styles.noDataCell}>No sales data found for the selected {salesPeriod} period.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                </>
                            )}
                        </div>
                    ) : activeTab === 'users' ? (
                        <div className={styles.salesReportSection}>
                            {usersLoading ? (
                                <div className={styles.tablePlaceholder}><span className={styles.spinner} /> Loading registered users...</div>
                            ) : (
                                <table className={styles.mainTable}>
                                    <thead>
                                        <tr>
                                            <th>User ID</th>
                                            <th>Full Name</th>
                                            <th>Email Address</th>
                                            <th>Joined Date</th>
                                            <th className={styles.centerAlign}>Action Controls</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className={styles.noDataCell}>No registered customers found.</td>
                                            </tr>
                                        ) : (
                                            users.map((user) => (
                                                <tr key={user._id}>
                                                    <td><span className={styles.orderId}>#{user._id.slice(-6).toUpperCase()}</span></td>
                                                    <td><strong>{user.firstName} {user.lastName}</strong></td>
                                                    <td><span className={styles.customerEmail}>{user.email}</span></td>
                                                    <td>
                                                        <div className={styles.dateTime}>
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className={styles.centerAlign}>
                                                        <button 
                                                            className={`${styles.btnAction} ${styles.btnCancel}`}
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            title="Permanently remove user account"
                                                        >
                                                            Delete User
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ) : (
                        <table className={styles.mainTable}>
                            <thead>
                                <tr>
                                    <th>Order Ref / Timestamp</th>
                                    <th>Customer Identity</th>
                                    <th>Items Ordered Summary</th>
                                    <th>Logistics Address</th>
                                    <th>Payout Mode</th>
                                    <th>Total Value</th>
                                    <th>Status</th>
                                    <th className={styles.centerAlign}>Action Controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className={styles.noDataCell}>No incoming matching entries recorded for this view layout.</td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order._id}>
                                            <td>
                                                <span className={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</span>
                                                <div className={styles.dateTime}>
                                                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.customerEmail}>{order.email}</span>
                                            </td>
                                            <td>
                                                <div className={styles.itemsColumn}>
                                                    {order.items?.map((item, index) => (
                                                        <div key={index} className={styles.itemRowSummary}>
                                                            • {item.name} <strong className={styles.qtyMark}>x{item.quantity}</strong>
                                                            <span className={styles.priceSnapshot}>(₱{item.priceAtPurchase})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td><span className={styles.addressLine}>{order.deliveryAddress}</span></td>
                                            <td><span className={styles.payoutMode}>{order.paymentMethod}</span></td>
                                            <td><strong className={styles.totalAmount}>₱{order.totalToPay}</strong></td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.actionButtonGroup}>
                                                    {order.status === 0 && (
                                                        <>
                                                            <button
                                                                className={`${styles.btnAction} ${styles.btnConfirm}`}
                                                                onClick={() => handleUpdateStatus(order._id, 1)}
                                                                title="Confirm and mark out for delivery"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                className={`${styles.btnAction} ${styles.btnCancel}`}
                                                                onClick={() => handleUpdateStatus(order._id, 3)}
                                                                title="Reject and cancel transaction"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                    {order.status === 1 && (
                                                        <button
                                                            className={`${styles.btnAction} ${styles.btnDeliver}`}
                                                            onClick={() => handleUpdateStatus(order._id, 2)}
                                                            title="Mark as successfully received"
                                                        >
                                                            Mark Delivered
                                                        </button>
                                                    )}
                                                    {order.status >= 2 && <span className={styles.txtMuted}>Archived</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}