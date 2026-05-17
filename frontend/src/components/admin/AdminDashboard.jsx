import { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard({ showToast }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'completed', 'cancelled'

    // Fetch orders from the protected admin route on load
    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Fetching from your exact backend route registry
            const response = await fetch('http://localhost:5000/api/admin/orders', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch administrative records.');
            }

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Handler for Updating status (Confirm/Ship vs Cancel)
    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const fallback = await response.json();
                throw new Error(fallback.message || 'Failed to update order step.');
            }

            showToast?.(`Order updated successfully! 🎉`);
            // Refresh local view data arrays to maintain sync
            fetchOrders();
        } catch (err) {
            showToast?.(`Error: ${err.message}`);
        }
    };

    // Compute metric blocks displayed at top cards
    const totalOrdersCount = orders.length;
    const pendingCount = orders.filter(o => o.status === 0 || o.status === 1).length;
    const completedCount = orders.filter(o => o.status === 2).length;
    const totalRevenue = orders
        .filter(o => o.status === 2)
        .reduce((sum, o) => sum + (o.totalToPay || 0), 0);

    // Filter lists based on selected navigation tab
    const filteredOrders = orders.filter(order => {
        if (activeTab === 'pending') return order.status === 0 || order.status === 1;
        if (activeTab === 'completed') return order.status === 2;
        if (activeTab === 'cancelled') return order.status === 3;
        return true; // 'all'
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

    if (loading) return <div className={styles.centeredState}><span className={styles.spinner} /> Loading administrative desk...</div>;
    if (error) return <div className={styles.centeredState}><p className={styles.errorText}>⚠️ {error}</p></div>;

    return (
        <div className={styles.dashboardContainer}>
            {/* Upper Navigation Row Header */}
            <header className={styles.dashHeader}>
                <div>
                    <h1 className={styles.mainTitle}>SakaLink Management Console</h1>
                    <p className={styles.subTitle}>Review incoming farmer marketplace requests, confirm orders, or manage cancellations.</p>
                </div>
            </header>

            {/* Metric Cards Section */}
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
                        <span className={styles.metricLabel}>Fulfillments Completed</span>
                        <span className={styles.metricIcon}>✅</span>
                    </div>
                    <h3 className={`${styles.metricValue} ${styles.textSuccess}`}>{completedCount}</h3>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricMeta}>
                        <span className={styles.metricLabel}>Gross Realized Earnings</span>
                        <span className={styles.metricIcon}>₱</span>
                    </div>
                    <h3 className={styles.metricValue}>₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                </div>
            </section>

            {/* Tab Filter Controls */}
            <div className={styles.tableControlsCard}>
                <div className={styles.tabGroup}>
                    <button className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabActive : ''}`} onClick={() => setActiveTab('all')}>All Logs</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.tabActive : ''}`} onClick={() => setActiveTab('pending')}>Pending Review ({pendingCount})</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'completed' ? styles.tabActive : ''}`} onClick={() => setActiveTab('completed')}>Completed</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'cancelled' ? styles.tabActive : ''}`} onClick={() => setActiveTab('cancelled')}>Cancelled</button>
                </div>

                {/* Orders Table Display */}
                <div className={styles.tableWrapper}>
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
                </div>
            </div>
        </div>
    );
}