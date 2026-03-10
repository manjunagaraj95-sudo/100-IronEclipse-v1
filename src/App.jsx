
import React, { useState, useEffect, useCallback } from 'react';
// Assume Chart components are imported from a library like 'recharts' or 'chart.js/react'
// For this mock, we'll use a simple placeholder component.

// --- ICONS (Placeholder, in a real app these would be SVG components) ---
const Icon = ({ name, className = '' }) => (
  <span className={`icon icon-${name} ${className}`}></span>
);

// --- RBAC Configuration ---
const ROLES = {
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
  SERVICE_PROVIDER: 'Service Provider',
};

// --- Sample Data ---
const SAMPLE_DATA = {
  users: [
    { id: 'u1', name: 'Alice Smith', role: ROLES.CUSTOMER },
    { id: 'u2', name: 'Bob Johnson', role: ROLES.SERVICE_PROVIDER },
    { id: 'u3', name: 'Charlie Brown', role: ROLES.ADMIN },
  ],
  orders: [
    {
      id: 'ORD001', customerId: 'u1', serviceProviderId: 'u2',
      status: 'Created', deliveryOption: 'Doorstep', price: 25.50,
      items: [{ type: 'Shirt', qty: 5 }, { type: 'Pants', qty: 2 }],
      milestones: [
        { name: 'Created', date: '2023-10-26T10:00:00Z', status: 'completed' },
        { name: 'Accepted', date: '2023-10-26T10:30:00Z', status: 'completed' },
        { name: 'Ironing', date: '2023-10-26T12:00:00Z', status: 'current' },
        { name: 'Ready', date: null, status: 'pending' },
        { name: 'Delivered / Customer Picked', date: null, status: 'pending' },
      ],
      auditLog: [
        { timestamp: '2023-10-26T10:00:00Z', event: 'Order Created', actor: 'Alice Smith' },
        { timestamp: '2023-10-26T10:30:00Z', event: 'Order Accepted', actor: 'Bob Johnson' },
      ],
    },
    {
      id: 'ORD002', customerId: 'u1', serviceProviderId: 'u2',
      status: 'Ready', deliveryOption: 'Customer Pickup', price: 18.00,
      items: [{ type: 'Dress', qty: 1 }, { type: 'Skirt', qty: 1 }],
      milestones: [
        { name: 'Created', date: '2023-10-25T14:00:00Z', status: 'completed' },
        { name: 'Accepted', date: '2023-10-25T14:15:00Z', status: 'completed' },
        { name: 'Ironing', date: '2023-10-25T16:00:00Z', status: 'completed' },
        { name: 'Ready', date: '2023-10-26T09:00:00Z', status: 'current' },
        { name: 'Delivered / Customer Picked', date: null, status: 'pending' },
      ],
      auditLog: [
        { timestamp: '2023-10-25T14:00:00Z', event: 'Order Created', actor: 'Alice Smith' },
        { timestamp: '2023-10-25T14:15:00Z', event: 'Order Accepted', actor: 'Bob Johnson' },
        { timestamp: '2023-10-25T16:00:00Z', event: 'Ironing Completed', actor: 'Bob Johnson' },
        { timestamp: '2023-10-26T09:00:00Z', event: 'Order Ready for Pickup', actor: 'Bob Johnson' },
      ],
    },
    {
      id: 'ORD003', customerId: 'u1', serviceProviderId: null,
      status: 'Created', deliveryOption: 'Doorstep', price: 30.00,
      items: [{ type: 'Blouse', qty: 3 }, { type: 'Trousers', qty: 3 }],
      milestones: [
        { name: 'Created', date: '2023-10-27T09:00:00Z', status: 'current' },
        { name: 'Accepted', date: null, status: 'pending' },
        { name: 'Ironing', date: null, status: 'pending' },
        { name: 'Ready', date: null, status: 'pending' },
        { name: 'Delivered / Customer Picked', date: null, status: 'pending' },
      ],
      auditLog: [
        { timestamp: '2023-10-27T09:00:00Z', event: 'Order Created', actor: 'Alice Smith' },
      ],
    },
    {
      id: 'ORD004', customerId: 'u2', serviceProviderId: 'u2',
      status: 'Delivered / Customer Picked', deliveryOption: 'Doorstep', price: 15.00,
      items: [{ type: 'Shirt', qty: 3 }],
      milestones: [
        { name: 'Created', date: '2023-10-24T10:00:00Z', status: 'completed' },
        { name: 'Accepted', date: '2023-10-24T10:15:00Z', status: 'completed' },
        { name: 'Ironing', date: '2023-10-24T11:00:00Z', status: 'completed' },
        { name: 'Ready', date: '2023-10-24T12:00:00Z', status: 'completed' },
        { name: 'Delivered / Customer Picked', date: '2023-10-24T14:00:00Z', status: 'completed' },
      ],
      auditLog: [
        { timestamp: '2023-10-24T10:00:00Z', event: 'Order Created', actor: 'Alice Smith' },
        { timestamp: '2024-10-24T14:00:00Z', event: 'Order Delivered', actor: 'Bob Johnson' },
      ],
    },
  ],
  partners: [
    { id: 'sp1', name: 'Iron King', status: 'Active', capacity: 10, rating: 4.8 },
    { id: 'sp2', name: 'Press Perfect', status: 'Inactive', capacity: 5, rating: 4.5 },
  ],
  rates: [
    { id: 'r1', clothType: 'Shirt', price: 2.50, unit: 'per piece' },
    { id: 'r2', clothType: 'Pants', price: 3.00, unit: 'per piece' },
  ],
  notifications: [
    { id: 'n1', type: 'info', message: 'Welcome to IronEclipse!', timestamp: '2023-10-27T10:00:00Z' },
    { id: 'n2', type: 'success', message: 'Order ORD001 accepted!', timestamp: '2023-10-26T10:30:00Z' },
    { id: 'n3', type: 'warning', message: 'SLA breach imminent for ORD003', timestamp: '2023-10-27T11:00:00Z' },
    { id: 'n4', type: 'error', message: 'Payment failed for ORD002', timestamp: '2023-10-27T08:00:00Z' },
  ]
};

// --- Helper Functions & Components ---

const getStatusStyles = (status) => {
  switch (status) {
    case 'Approved':
    case 'Ready':
    case 'Delivered / Customer Picked':
      return { bg: 'var(--status-approved-bg)', border: 'var(--status-approved-border)', text: 'var(--status-approved-text)', label: 'Approved' };
    case 'In Progress':
    case 'Accepted':
    case 'Ironing':
      return { bg: 'var(--status-inprogress-bg)', border: 'var(--status-inprogress-border)', text: 'var(--status-inprogress-text)', label: 'In Progress' };
    case 'Pending':
    case 'Created':
      return { bg: 'var(--status-pending-bg)', border: 'var(--status-pending-border)', text: 'var(--status-pending-text)', label: 'Pending' };
    case 'Rejected':
      return { bg: 'var(--status-rejected-bg)', border: 'var(--status-rejected-border)', text: 'var(--status-rejected-text)', label: 'Rejected' };
    case 'Exception':
      return { bg: 'var(--status-exception-bg)', border: 'var(--status-exception-border)', text: 'var(--status-exception-text)', label: 'Exception' };
    default:
      return { bg: 'var(--bg-card)', border: 'var(--border-light)', text: 'var(--text-main)', label: status };
  }
};

const StatusBadge = ({ status }) => {
  const { label } = getStatusStyles(status);
  const className = `status-badge ${status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  return (
    <span className={className} style={{
      backgroundColor: getStatusStyles(status).bg,
      borderColor: getStatusStyles(status).border,
      color: getStatusStyles(status).text
    }}>
      <Icon name="status" /> {label}
    </span>
  );
};

const GlassCard = ({ children, style = {}, onClick }) => (
  <div className="glass-card" style={style} onClick={onClick}>
    {children}
  </div>
);

const ChartPlaceholder = ({ title, type, data, options }) => (
  <div className="chart-container glass-card" style={{ height: '250px', position: 'relative' }}>
    <h3 className="chart-title">{title} ({type})</h3>
    <Icon name="chart" style={{ fontSize: '3rem', opacity: 0.3 }} />
    <div className="chart-legend">
      {Object.keys(data?.[0] || {}).filter(k => k !== 'label').map((key, i) => (
        <span key={i} style={{ marginRight: '8px' }}>• {key}</span>
      ))}
    </div>
  </div>
);

const NavBar = ({ currentUser, setView }) => (
  <nav className="navbar flex-row justify-between items-center">
    <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--text-main)' }}>IronEclipse</div>
    <div className="flex-row gap-sm">
      <a href="#" className="nav-link" onClick={() => setView({ screen: 'DASHBOARD' })}>
        <Icon name="dashboard" /> Dashboard
      </a>
      {(currentUser?.role === ROLES.CUSTOMER || currentUser?.role === ROLES.SERVICE_PROVIDER || currentUser?.role === ROLES.ADMIN) && (
        <a href="#" className="nav-link" onClick={() => setView({ screen: 'ORDERS_GRID' })}>
          <Icon name="orders" /> Orders
        </a>
      )}
      {currentUser?.role === ROLES.ADMIN && (
        <>
          <a href="#" className="nav-link" onClick={() => setView({ screen: 'PARTNERS_GRID' })}>
            <Icon name="partners" /> Partners
          </a>
          <a href="#" className="nav-link" onClick={() => setView({ screen: 'RATE_SETUP_FORM' })}>
            <Icon name="settings" /> Rates
          </a>
        </>
      )}
    </div>
    <div className="flex-row items-center gap-md">
      <span style={{ color: 'var(--text-secondary)' }}>Hello, {currentUser?.name} ({currentUser?.role})</span>
      <Icon name="user" style={{ fontSize: '1.2rem', color: 'var(--color-accent)' }} />
    </div>
  </nav>
);

const Breadcrumbs = ({ path }) => (
  <div style={{ padding: 'var(--spacing-md) var(--spacing-xl)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
    {path.map((item, index) => (
      <span key={index}>
        {item.label}
        {index < path.length - 1 && <span style={{ margin: '0 var(--spacing-xs)' }}>/</span>}
      </span>
    ))}
  </div>
);

// --- Screen Components ---

const DashboardScreen = ({ currentUser, setView }) => {
  const { role, id: userId } = currentUser;
  const orders = SAMPLE_DATA.orders.filter(order => {
    if (role === ROLES.CUSTOMER) return order.customerId === userId;
    if (role === ROLES.SERVICE_PROVIDER) return order.serviceProviderId === userId;
    return true; // Admin sees all
  });

  const getKpis = useCallback(() => {
    if (role === ROLES.CUSTOMER) {
      const ordersPlaced = orders.length;
      const ordersReady = orders.filter(o => o.status === 'Ready').length;
      return [
        { label: 'Orders Placed', value: ordersPlaced, icon: 'orders', trend: 0 },
        { label: 'Orders Ready', value: ordersReady, icon: 'check', trend: 1 },
      ];
    }
    if (role === ROLES.SERVICE_PROVIDER) {
      const ordersReceived = orders.length;
      const ordersInProgress = orders.filter(o => ['Accepted', 'Ironing'].includes(o.status)).length;
      const ordersCompleted = orders.filter(o => ['Ready', 'Delivered / Customer Picked'].includes(o.status)).length;
      const deliveriesScheduled = orders.filter(o => o.deliveryOption === 'Doorstep' && o.status === 'Ready').length;
      return [
        { label: 'Orders Received', value: ordersReceived, icon: 'orders', trend: 1 },
        { label: 'Orders In Progress', value: ordersInProgress, icon: 'time', trend: 0 },
        { label: 'Orders Completed', value: ordersCompleted, icon: 'check', trend: 1 },
        { label: 'Deliveries Scheduled', value: deliveriesScheduled, icon: 'delivery', trend: 0 },
      ];
    }
    if (role === ROLES.ADMIN) {
      const totalOrders = SAMPLE_DATA.orders.length;
      const revenue = SAMPLE_DATA.orders.reduce((sum, o) => sum + (o.status === 'Delivered / Customer Picked' ? o.price : 0), 0).toFixed(2);
      const completedOrders = SAMPLE_DATA.orders.filter(o => o.status === 'Delivered / Customer Picked');
      const avgTurnaroundTime = completedOrders.length > 0 ? (completedOrders.reduce((sum, o) => {
        const created = new Date(o.milestones?.[0]?.date);
        const delivered = new Date(o.milestones?.[o.milestones.length - 1]?.date);
        return sum + (delivered.getTime() - created.getTime());
      }, 0) / completedOrders.length / (1000 * 60 * 60 * 24)).toFixed(1) : 0; // Days
      const deliveryCount = SAMPLE_DATA.orders.filter(o => o.deliveryOption === 'Doorstep').length;
      const pickupCount = SAMPLE_DATA.orders.filter(o => o.deliveryOption === 'Customer Pickup').length;
      return [
        { label: 'Total Orders', value: totalOrders, icon: 'orders', trend: 1 },
        { label: 'Total Revenue', value: `$${revenue}`, icon: 'revenue', trend: 1 },
        { label: 'Avg TAT (Days)', value: avgTurnaroundTime, icon: 'speed', trend: -1 },
        { label: 'Deliveries', value: deliveryCount, icon: 'delivery', trend: 1 },
        { label: 'Pickups', value: pickupCount, icon: 'pickup', trend: 1 },
      ];
    }
    return [];
  }, [orders, role]);

  const getRecentActivities = useCallback(() => {
    let activities = [];
    if (role === ROLES.CUSTOMER) {
      activities = orders.flatMap(order => order.auditLog?.slice(-2) || [])
        .filter(log => ['Order Placed', 'Order Ready', 'Delivery Scheduled'].some(a => log.event.includes(a)));
    } else if (role === ROLES.SERVICE_PROVIDER) {
      activities = orders.flatMap(order => order.auditLog?.slice(-2) || [])
        .filter(log => ['Order Accepted', 'Order Completed', 'Delivery Completed'].some(a => log.event.includes(a)));
    } else if (role === ROLES.ADMIN) {
      activities = SAMPLE_DATA.orders.flatMap(order => order.auditLog?.slice(-2) || []);
    }
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
  }, [orders, role]);

  return (
    <div style={{ background: 'var(--color-wallpaper-light)', minHeight: '100%' }}>
      <Breadcrumbs path={[{ label: 'Dashboard' }]} />
      <div className="dashboard-layout">
        {getKpis().map((kpi, index) => (
          <GlassCard key={index} style={{ cursor: 'default' }}>
            <div className="flex-row justify-between items-center mb-md">
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{kpi.value}</span>
              <Icon name={kpi.icon} style={{ fontSize: '2rem', color: 'var(--color-accent)', opacity: 0.7 }} />
            </div>
            <div className="flex-row justify-between items-center">
              <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{kpi.label}</span>
              {kpi.trend === 1 && <Icon name="trend-up" style={{ fontSize: '1.2rem' }} />}
              {kpi.trend === -1 && <Icon name="trend-down" style={{ fontSize: '1.2rem' }} />}
            </div>
          </GlassCard>
        ))}

        {/* Charts Section */}
        <GlassCard style={{ gridColumn: 'span 2' }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>Analytics</h2>
          <div className="admin-grid">
            {role === ROLES.CUSTOMER && (
              <ChartPlaceholder title="Order Status" type="Donut" data={[{ label: 'Created', value: 1 }, { label: 'Ready', value: 1 }, { label: 'Ironing', value: 1 }]} />
            )}
            {role === ROLES.SERVICE_PROVIDER && (
              <>
                <ChartPlaceholder title="Orders by Status" type="Bar" data={[{ label: 'Created', value: 1 }, { label: 'In Progress', value: 2 }, { label: 'Completed', value: 1 }]} />
                <ChartPlaceholder title="Daily Volume Trend" type="Line" data={[{ date: '10/24', orders: 2 }, { date: '10/25', orders: 3 }]} />
                <ChartPlaceholder title="Delivery vs Pickup" type="Donut" data={[{ label: 'Delivery', value: 2 }, { label: 'Pickup', value: 1 }]} />
              </>
            )}
            {role === ROLES.ADMIN && (
              <>
                <ChartPlaceholder title="Revenue Trend" type="Line" data={[{ month: 'Jul', revenue: 1200 }, { month: 'Aug', revenue: 1500 }, { month: 'Sep', revenue: 1800 }]} className="admin-large-card" />
                <ChartPlaceholder title="Avg Turnaround Time" type="Gauge" data={[{ value: 2.5 }]} />
                <ChartPlaceholder title="Delivery vs Pickup" type="Donut" data={[{ label: 'Delivery', value: 20 }, { label: 'Pickup', value: 15 }]} />
              </>
            )}
          </div>
        </GlassCard>

        {/* Recent Activities */}
        <GlassCard style={{ gridColumn: 'span 1' }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>Recent Activities</h2>
          <div className="news-audit-feed">
            {getRecentActivities().length > 0 ? getRecentActivities().map((activity, index) => (
              <div key={index} className="feed-item">
                <div className="feed-icon"><Icon name="activity" /></div>
                <div className="flex-col flex-grow">
                  <div style={{ fontWeight: '600' }}>{activity.event}</div>
                  <div className="feed-meta">{new Date(activity.timestamp).toLocaleString()} by {activity.actor}</div>
                </div>
              </div>
            )) : <p style={{ color: 'var(--text-secondary)' }}>No recent activities.</p>}
          </div>
        </GlassCard>

        {/* Upcoming Deadlines / Task Queue */}
        <GlassCard style={{ gridColumn: 'span 1' }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>Upcoming Tasks / Deadlines</h2>
          <div>
            {orders.filter(o => ['Created', 'Accepted', 'Ironing'].includes(o.status)).length > 0 ? (
              orders.filter(o => ['Created', 'Accepted', 'Ironing'].includes(o.status)).map((order) => (
                <div key={order.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 'var(--spacing-sm)', paddingBottom: 'var(--spacing-sm)', borderBottom: '1px solid var(--border-light)'
                }}>
                  <div className="flex-col">
                    <span style={{ fontWeight: '600' }}>{order.id} - {order.status}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Due: {new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toLocaleDateString()}</span> {/* Mock due date */}
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))
            ) : <p style={{ color: 'var(--text-secondary)' }}>No urgent tasks.</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const OrdersGridScreen = ({ currentUser, setView }) => {
  const { role, id: userId } = currentUser;
  const [filters, setFilters] = useState({ date: '', status: '', deliveryOption: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

  let filteredOrders = SAMPLE_DATA.orders;

  // Role-based filtering
  if (role === ROLES.CUSTOMER) {
    filteredOrders = filteredOrders.filter(o => o.customerId === userId);
  } else if (role === ROLES.SERVICE_PROVIDER) {
    filteredOrders = filteredOrders.filter(o => o.serviceProviderId === userId);
  }

  // Apply filters
  if (filters.date) {
    // Basic date filtering for demo, assuming 'today' for simplicity
    const today = new Date().toISOString().split('T')[0];
    filteredOrders = filteredOrders.filter(o => new Date(o.milestones?.[0]?.date)?.toISOString().split('T')[0] === today);
  }
  if (filters.status) {
    filteredOrders = filteredOrders.filter(o => o.status === filters.status);
  }
  if (filters.deliveryOption) {
    filteredOrders = filteredOrders.filter(o => o.deliveryOption === filters.deliveryOption);
  }

  // Apply search
  if (searchQuery) {
    filteredOrders = filteredOrders.filter(o =>
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some(item => item.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply sort
  filteredOrders.sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  const handleCardClick = useCallback((orderId) => {
    setView({ screen: 'ORDER_DETAIL', params: { orderId } });
  }, [setView]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const currentPath = [{ label: 'Orders' }];
  if (role === ROLES.CUSTOMER) currentPath.unshift({ label: 'Customer Dashboard', link: () => setView({ screen: 'DASHBOARD' })});
  else if (role === ROLES.SERVICE_PROVIDER) currentPath.unshift({ label: 'Service Provider Dashboard', link: () => setView({ screen: 'DASHBOARD' })});
  else if (role === ROLES.ADMIN) currentPath.unshift({ label: 'Admin Dashboard', link: () => setView({ screen: 'DASHBOARD' })});


  return (
    <div style={{ background: 'var(--color-wallpaper-light)', minHeight: '100%', display: 'flex' }}>
      <div style={{ flexGrow: 1 }}>
        <Breadcrumbs path={currentPath} />
        <div style={{ padding: 'var(--spacing-md) var(--spacing-xl)' }}>
          <GlassCard style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div className="flex-row justify-between items-center">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 'auto', flexGrow: 1, marginRight: 'var(--spacing-md)' }}
              />
              <button className="button-secondary" onClick={() => {/* Trigger export */}}><Icon name="download" /> Export</button>
              <button className="button" onClick={() => setView({ screen: 'ORDER_FORM', params: { orderId: 'new' } })}>
                <Icon name="plus" /> New Order
              </button>
            </div>
            <div className="flex-row gap-md">
              <select onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} value={filters.status}>
                <option value="">All Statuses</option>
                <option value="Created">Created</option>
                <option value="Accepted">Accepted</option>
                <option value="Ironing">Ironing</option>
                <option value="Ready">Ready</option>
                <option value="Delivered / Customer Picked">Completed</option>
              </select>
              <select onChange={(e) => setFilters(prev => ({ ...prev, deliveryOption: e.target.value }))} value={filters.deliveryOption}>
                <option value="">All Delivery Types</option>
                <option value="Doorstep">Doorstep</option>
                <option value="Customer Pickup">Customer Pickup</option>
              </select>
              <button className="button-secondary" onClick={() => setFilters({ date: '', status: '', deliveryOption: '' })}>
                Clear Filters
              </button>
            </div>
            {/* Sort controls */}
            <div className="flex-row items-center gap-sm">
                <span style={{ color: 'var(--text-secondary)' }}>Sort By:</span>
                <button className="button-secondary" onClick={() => handleSort('id')}>Order ID {sortConfig.key === 'id' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</button>
                <button className="button-secondary" onClick={() => handleSort('status')}>Status {sortConfig.key === 'status' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</button>
            </div>
          </GlassCard>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => {
                const { bg, border } = getStatusStyles(order.status);
                return (
                  <div
                    key={order.id}
                    className={`order-card status-${order.status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => handleCardClick(order.id)}
                    style={{ backgroundColor: bg, borderColor: border }}
                  >
                    <div className="flex-row justify-between items-center">
                      <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{order.id}</h3>
                      <StatusBadge status={order.status} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 'var(--spacing-xs) 0' }}>
                      <Icon name="user" /> Customer: {SAMPLE_DATA.users.find(u => u.id === order.customerId)?.name || 'N/A'}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 'var(--spacing-xs) 0' }}>
                      <Icon name={order.deliveryOption === 'Doorstep' ? 'delivery' : 'pickup'} /> {order.deliveryOption}
                    </p>
                    <p style={{ color: 'var(--text-main)', fontWeight: 'bold', margin: 'var(--spacing-xs) 0' }}>
                      <Icon name="money" /> Price: ${order.price?.toFixed(2)}
                    </p>
                    {/* Quick actions on hover (web) / swipe (mobile) - visually implied here */}
                    <div className="flex-row gap-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                      <button className="button-secondary button-sm" onClick={(e) => { e.stopPropagation(); alert('Edit ' + order.id); }}>
                        <Icon name="edit" /> Edit
                      </button>
                      <button className="button-secondary button-sm" onClick={(e) => { e.stopPropagation(); alert('Accept ' + order.id); }}>
                        <Icon name="check" /> Accept
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                <h3 style={{ color: 'var(--text-secondary)' }}>No orders found.</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or search terms.</p>
                <button className="button" onClick={() => setView({ screen: 'ORDER_FORM', params: { orderId: 'new' } })}>
                  <Icon name="plus" /> Create New Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const OrderDetailScreen = ({ orderId, currentUser, setView }) => {
  const order = SAMPLE_DATA.orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-main)' }}>Order not found.</h2>
        <button className="button" onClick={() => setView({ screen: 'ORDERS_GRID' })}>Back to Orders</button>
      </div>
    );
  }

  const handleAction = useCallback((actionType) => {
    // In a real app, this would dispatch an API call
    alert(`${actionType} for Order ${orderId}`);
    // Simulate state update
    setView(prev => ({
      ...prev,
      params: { ...prev.params, orderId: orderId } // Force re-render with potential new data
    }));
  }, [orderId, setView]);

  const breadcrumbs = [
    { label: 'Orders', link: () => setView({ screen: 'ORDERS_GRID' }) },
    { label: order.id }
  ];

  const MilestoneTracker = ({ milestones }) => (
    <div className="milestone-stepper">
      {milestones?.map((milestone, index) => (
        <div key={index} className={`milestone-step ${milestone.status}`}>
          <div className="milestone-step-indicator">
            {milestone.status === 'completed' && <Icon name="check" />}
            {milestone.status === 'current' && <Icon name="time" />}
          </div>
          <div className="milestone-step-content">
            <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{milestone.name}</h4>
            {milestone.date && <span className="date">{new Date(milestone.date).toLocaleString()}</span>}
            {milestone.status === 'completed' && <p style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Completed successfully.</p>}
          </div>
        </div>
      ))}
    </div>
  );

  const AuditFeed = ({ auditLog }) => (
    <div className="news-audit-feed">
      <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>Audit Log</h3>
      {auditLog?.length > 0 ? auditLog.map((log, index) => (
        <div key={index} className="feed-item">
          <div className="feed-icon"><Icon name="info" /></div>
          <div className="flex-col flex-grow">
            <div style={{ fontWeight: '600' }}>{log.event}</div>
            <div className="feed-meta">{new Date(log.timestamp).toLocaleString()} by {log.actor}</div>
          </div>
        </div>
      )) : <p style={{ color: 'var(--text-secondary)' }}>No audit events.</p>}
    </div>
  );

  // RBAC for actions
  const canAccept = currentUser.role === ROLES.SERVICE_PROVIDER && order.status === 'Created';
  const canMarkReady = currentUser.role === ROLES.SERVICE_PROVIDER && order.status === 'Ironing';
  const canMarkDelivered = currentUser.role === ROLES.SERVICE_PROVIDER && order.status === 'Ready' && order.deliveryOption === 'Doorstep';
  const canMarkPickedUp = currentUser.role === ROLES.SERVICE_PROVIDER && order.status === 'Ready' && order.deliveryOption === 'Customer Pickup';

  return (
    <div style={{ background: 'var(--color-wallpaper-light)', minHeight: '100%' }}>
      <Breadcrumbs path={breadcrumbs} />
      <div className="detail-page-layout">
        <div className="flex-col gap-lg">
          <GlassCard>
            <div className="flex-row justify-between items-center mb-md">
              <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Order: {order.id}</h2>
              <StatusBadge status={order.status} />
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              <Icon name="user" /> Customer: {SAMPLE_DATA.users.find(u => u.id === order.customerId)?.name || 'N/A'}
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              <Icon name="partners" /> Service Provider: {SAMPLE_DATA.users.find(u => u.id === order.serviceProviderId)?.name || 'N/A'}
            </p>
            <h3 style={{ marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>Order Details</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {order.items?.map((item, index) => (
                <li key={index} style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--text-main)' }}>
                  {item.qty}x {item.type}
                </li>
              ))}
            </ul>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-main)', marginTop: 'var(--spacing-lg)' }}>
              <Icon name="money" /> Total Price: ${order.price?.toFixed(2)}
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              <Icon name={order.deliveryOption === 'Doorstep' ? 'delivery' : 'pickup'} /> Delivery Option: {order.deliveryOption}
            </p>

            {/* Contextual Action Bar */}
            <div className="flex-row gap-md" style={{ marginTop: 'var(--spacing-xl)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--spacing-md)' }}>
              {canAccept && <button className="button" onClick={() => handleAction('Accept Order')}><Icon name="check" /> Accept Order</button>}
              {canMarkReady && <button className="button" onClick={() => handleAction('Mark Ready')}><Icon name="check" /> Mark Ready</button>}
              {canMarkDelivered && <button className="button" onClick={() => handleAction('Mark Delivered')}><Icon name="delivery" /> Mark Delivered</button>}
              {canMarkPickedUp && <button className="button" onClick={() => handleAction('Mark Picked Up')}><Icon name="pickup" /> Mark Picked Up</button>}
              {/* Common actions */}
              <button className="button-secondary" onClick={() => setView({ screen: 'ORDER_FORM', params: { orderId: order.id } })}>
                <Icon name="edit" /> Edit Order
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <MilestoneTracker milestones={order.milestones} />
          </GlassCard>
        </div>

        <div className="flex-col gap-lg">
          <GlassCard>
            <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>Delivery Information</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Method: <span style={{ fontWeight: '600' }}>{order.deliveryOption}</span>
            </p>
            {order.deliveryOption === 'Doorstep' && (
              <p style={{ color: 'var(--text-secondary)' }}>Address: 123 Main St, Anytown, USA</p>
            )}
            <p style={{ color: 'var(--text-secondary)' }}>
              Estimated {order.deliveryOption === 'Doorstep' ? 'Delivery' : 'Pickup'} Date: {new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
            {/* SLA Breach indication */}
            {order.status === 'Created' && <StatusBadge status="Exception" />} {/* Mocking an SLA breach for 'Created' status */}
          </GlassCard>

          <GlassCard>
            <AuditFeed auditLog={order.auditLog} />
          </GlassCard>

          {/* Related Records / Document Preview (Placeholders) */}
          <GlassCard>
            <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>Related Documents</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              <Icon name="download" /> <a href="#" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Order Confirmation.pdf</a>
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              <Icon name="download" /> <a href="#" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Invoice_ORD001.pdf</a>
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

const FormScreen = ({ formType, params, currentUser, setView }) => {
  const [formData, setFormData] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState({ section1: true, section2: false });

  useEffect(() => {
    // Populate form data for editing
    if (formType === 'Order Update' && params?.orderId) {
      const order = SAMPLE_DATA.orders.find(o => o.id === params.orderId);
      if (order) setFormData(order);
    } else if (formType === 'Order' && params?.orderId === 'new') {
      setFormData({
        customerId: currentUser.id,
        items: [{ type: '', qty: 0 }],
        deliveryOption: 'Doorstep',
        price: 0,
      });
    }
  }, [formType, params, currentUser]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleItemChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newItems = [...(prev.items || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      // Recalculate price if relevant
      if (field === 'qty' || field === 'type') {
        const itemPrice = SAMPLE_DATA.rates.find(r => r.clothType === newItems[index].type)?.price || 0;
        const newPrice = newItems.reduce((sum, item) => sum + (item.qty * (SAMPLE_DATA.rates.find(r => r.clothType === item.type)?.price || 0)), 0);
        return { ...prev, items: newItems, price: newPrice };
      }
      return { ...prev, items: newItems };
    });
  }, []);

  const addItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), { type: '', qty: 0 }],
    }));
  }, []);

  const validateForm = useCallback(() => {
    let isValid = true;
    // Basic validation
    if (formType === 'Order') {
      if (!formData.customerId || !formData.deliveryOption || !formData.items?.length || formData.items.some(item => !item.type || item.qty <= 0)) {
        isValid = false;
        alert('Please fill all mandatory fields and ensure items have valid quantities/types.');
      }
    }
    // Add more specific validations for other form types
    return isValid;
  }, [formData, formType]);


  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form Data Submitted:', formData);
      // Simulate API call
      setTimeout(() => {
        setFormSubmitted(true);
        // In a real app, you'd navigate after successful submission
        // setView({ screen: 'ORDER_DETAIL', params: { orderId: 'NEW_ORDER_ID' } });
      }, 1000);
    }
  }, [formData, validateForm]);

  const toggleAccordion = useCallback((panelName) => {
    setAccordionOpen(prev => ({ ...prev, [panelName]: !prev[panelName] }));
  }, []);

  if (formSubmitted) {
    return (
      <div style={{ background: 'var(--color-wallpaper-light)', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="confirmation-screen">
          <div className="success-icon"><Icon name="check" /></div>
          <h2>{formType} Submitted Successfully!</h2>
          <p>Your request has been processed. We'll keep you updated on its status.</p>
          <div className="action-buttons">
            <button className="button" onClick={() => setView({ screen: 'DASHBOARD' })}>Go to Dashboard</button>
            <button className="button-secondary" onClick={() => setFormSubmitted(false)}>Submit Another</button>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Orders', link: () => setView({ screen: 'ORDERS_GRID' }) },
    { label: formType }
  ];

  return (
    <div style={{ background: 'var(--color-wallpaper-light)', minHeight: '100%' }}>
      <Breadcrumbs path={breadcrumbs} />
      <div style={{ padding: 'var(--spacing-xl)' }}>
        <GlassCard>
          <h1 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--text-main)' }}>{formType} Form</h1>
          <form onSubmit={handleSubmit} className="form-accordion">
            {formType === 'Order' && (
              <>
                <div className="accordion-panel">
                  <div className="accordion-header" onClick={() => toggleAccordion('orderInfo')}>
                    <span>Order Information</span>
                    <span>{accordionOpen.orderInfo ? '▲' : '▼'}</span>
                  </div>
                  {accordionOpen.orderInfo && (
                    <div className="accordion-content">
                      <label>Customer:</label>
                      <input type="text" name="customerId" value={SAMPLE_DATA.users.find(u => u.id === currentUser.id)?.name || ''} readOnly style={{ backgroundColor: 'var(--bg-main)' }} />

                      <label>Delivery Option:</label>
                      <select name="deliveryOption" value={formData.deliveryOption || ''} onChange={handleChange} required>
                        <option value="Doorstep">Doorstep</option>
                        <option value="Customer Pickup">Customer Pickup</option>
                      </select>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '-var(--spacing-sm) 0 var(--spacing-md) 0' }}>
                        Choose how you want to receive your freshly ironed clothes.
                      </p>
                    </div>
                  )}
                </div>

                <div className="accordion-panel">
                  <div className="accordion-header" onClick={() => toggleAccordion('items')}>
                    <span>Items for Ironing</span>
                    <span>{accordionOpen.items ? '▲' : '▼'}</span>
                  </div>
                  {accordionOpen.items && (
                    <div className="accordion-content">
                      {(formData.items || []).map((item, index) => (
                        <div key={index} style={{ marginBottom: 'var(--spacing-md)', border: '1px dashed var(--border-light)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-sm)' }}>
                          <label>Item Type:</label>
                          <select value={item.type || ''} onChange={(e) => handleItemChange(index, 'type', e.target.value)} required>
                            <option value="">Select type</option>
                            {SAMPLE_DATA.rates.map(rate => <option key={rate.id} value={rate.clothType}>{rate.clothType}</option>)}
                          </select>

                          <label>Quantity:</label>
                          <input type="number" value={item.qty || 0} onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value))} min="1" required />
                        </div>
                      ))}
                      <button type="button" className="button-secondary" onClick={addItem} style={{ marginBottom: 'var(--spacing-md)' }}>
                        <Icon name="plus" /> Add Another Item
                      </button>

                      <label>Total Estimated Price:</label>
                      <input type="text" value={`$${formData.price?.toFixed(2) || '0.00'}`} readOnly style={{ backgroundColor: 'var(--bg-main)', fontWeight: 'bold' }} />
                    </div>
                  )}
                </div>
              </>
            )}

            {formType === 'Order Update' && currentUser.role === ROLES.SERVICE_PROVIDER && (
              <div className="accordion-panel">
                  <div className="accordion-header" onClick={() => toggleAccordion('statusUpdate')}>
                    <span>Update Order Status</span>
                    <span>{accordionOpen.statusUpdate ? '▲' : '▼'}</span>
                  </div>
                  {accordionOpen.statusUpdate && (
                      <div className="accordion-content">
                          <label>Order ID:</label>
                          <input type="text" value={formData.id || ''} readOnly style={{ backgroundColor: 'var(--bg-main)' }} />
                          <label>Current Status:</label>
                          <input type="text" value={formData.status || ''} readOnly style={{ backgroundColor: 'var(--bg-main)' }} />
                          <label>Next Status:</label>
                          <select name="status" value={formData.status || ''} onChange={handleChange} required>
                              <option value="Accepted">Accepted</option>
                              <option value="Ironing">Ironing</option>
                              <option value="Ready">Ready</option>
                              <option value="Delivered / Customer Picked">Delivered / Customer Picked</option>
                          </select>
                          <label>Notes (optional):</label>
                          <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows="3"></textarea>
                      </div>
                  )}
              </div>
            )}

            {formType === 'Partner Setup' && currentUser.role === ROLES.ADMIN && (
              <div className="accordion-panel">
                  <div className="accordion-header" onClick={() => toggleAccordion('partnerDetails')}>
                    <span>Partner Details</span>
                    <span>{accordionOpen.partnerDetails ? '▲' : '▼'}</span>
                  </div>
                  {accordionOpen.partnerDetails && (
                      <div className="accordion-content">
                          <label>Partner Name:</label>
                          <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
                          <label>Status:</label>
                          <select name="status" value={formData.status || ''} onChange={handleChange} required>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                          </select>
                          <label>Capacity:</label>
                          <input type="number" name="capacity" value={formData.capacity || 0} onChange={handleChange} min="0" required />
                          <label>Contact Email:</label>
                          <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
                          <label>Logo Upload:</label>
                          <input type="file" />
                      </div>
                  )}
              </div>
            )}

            {formType === 'Rate Setup' && currentUser.role === ROLES.ADMIN && (
              <div className="accordion-panel">
                  <div className="accordion-header" onClick={() => toggleAccordion('rateDetails')}>
                    <span>Rate Details</span>
                    <span>{accordionOpen.rateDetails ? '▲' : '▼'}</span>
                  </div>
                  {accordionOpen.rateDetails && (
                      <div className="accordion-content">
                          <label>Cloth Type:</label>
                          <input type="text" name="clothType" value={formData.clothType || ''} onChange={handleChange} required />
                          <label>Price:</label>
                          <input type="number" name="price" value={formData.price || 0} onChange={handleChange} step="0.01" min="0" required />
                          <label>Unit:</label>
                          <input type="text" name="unit" value={formData.unit || 'per piece'} onChange={handleChange} required />
                      </div>
                  )}
              </div>
            )}

            <button type="submit" className="button" style={{ marginTop: 'var(--spacing-xl)', width: '100%' }}>
              Submit {formType}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};


const NotificationToast = ({ notification, onDismiss }) => {
  const { type, message, id } = notification;
  const icon = type === 'info' ? 'icon-info' :
               type === 'success' ? 'icon-check' :
               type === 'warning' ? 'icon-warning' :
               'icon-error';

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div className={`toast ${type}`} onClick={() => onDismiss(id)}>
      <span className={`toast-icon ${icon}`} />
      <div className="toast-content">
        <div className="toast-title">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
        <div>{message}</div>
      </div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  const [currentUser, setCurrentUser] = useState(SAMPLE_DATA.users[0]); // Default to Customer for demo
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [activeNotifications, setActiveNotifications] = useState(SAMPLE_DATA.notifications.slice(0, 1)); // Show one initially

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // Randomly add a new notification
        const newNotification = SAMPLE_DATA.notifications[Math.floor(Math.random() * SAMPLE_DATA.notifications.length)];
        setActiveNotifications(prev => {
          if (!prev.some(n => n.id === newNotification.id)) { // Avoid duplicates for simple demo
            return [...prev, { ...newNotification, id: `${newNotification.id}-${Date.now()}` }];
          }
          return prev;
        });
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleDismissNotification = useCallback((id) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const renderScreen = () => {
    switch (view.screen) {
      case 'DASHBOARD':
        return <DashboardScreen currentUser={currentUser} setView={setView} />;
      case 'ORDERS_GRID':
        return <OrdersGridScreen currentUser={currentUser} setView={setView} />;
      case 'ORDER_DETAIL':
        return <OrderDetailScreen orderId={view.params.orderId} currentUser={currentUser} setView={setView} />;
      case 'ORDER_FORM':
        return <FormScreen formType="Order" params={view.params} currentUser={currentUser} setView={setView} />;
      case 'ORDER_UPDATE_FORM':
        return <FormScreen formType="Order Update" params={view.params} currentUser={currentUser} setView={setView} />;
      case 'PARTNERS_GRID':
        // Placeholder for Partners grid
        return <OrdersGridScreen currentUser={currentUser} setView={setView} />; // Reusing OrdersGridScreen for now
      case 'PARTNER_SETUP_FORM':
        return <FormScreen formType="Partner Setup" params={view.params} currentUser={currentUser} setView={setView} />;
      case 'RATE_SETUP_FORM':
        return <FormScreen formType="Rate Setup" params={view.params} currentUser={currentUser} setView={setView} />;
      default:
        return <DashboardScreen currentUser={currentUser} setView={setView} />;
    }
  };

  const handleGlobalSearch = useCallback((e) => {
    if (e.key === 'Escape') {
      setShowGlobalSearch(false);
      setGlobalSearchQuery('');
    } else if (e.key === 'Enter') {
      console.log('Global Search:', globalSearchQuery);
      // Implement actual global search logic here
      setShowGlobalSearch(false);
      setGlobalSearchQuery('');
    }
  }, [globalSearchQuery]);

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { // Cmd/Ctrl + K
        e.preventDefault();
        setShowGlobalSearch(true);
      }
    });
    return () => window.removeEventListener('keydown', () => {});
  }, []);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar currentUser={currentUser} setView={setView} />

      {/* Role Selector for Demo */}
      <div style={{ padding: 'var(--spacing-sm) var(--spacing-xl)', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <label htmlFor="role-select" style={{ color: 'var(--text-secondary)' }}>Select Role (Demo):</label>
        <select
          id="role-select"
          value={currentUser.role}
          onChange={(e) => {
            const newRole = e.target.value;
            const newUser = SAMPLE_DATA.users.find(u => u.role === newRole) || SAMPLE_DATA.users[0];
            setCurrentUser(newUser);
            setView({ screen: 'DASHBOARD' }); // Reset view on role change
          }}
          style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
        >
          {Object.values(ROLES).map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <button className="button-secondary" onClick={() => setShowGlobalSearch(true)} style={{ marginLeft: 'auto' }}>
            <Icon name="search" /> Global Search (Cmd+K)
        </button>
      </div>

      <main style={{ flexGrow: 1 }}>
        {renderScreen()}
      </main>

      {/* Notification Toasts Container */}
      <div className="toast-container">
        {activeNotifications.map(notification => (
          <NotificationToast key={notification.id} notification={notification} onDismiss={handleDismissNotification} />
        ))}
      </div>

      {/* Global Search Overlay */}
      {showGlobalSearch && (
        <>
          <div className="global-search-overlay" onClick={() => setShowGlobalSearch(false)}></div>
          <div className="global-search">
            <Icon name="search" style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginRight: 'var(--spacing-sm)' }} />
            <input
              type="text"
              placeholder="Search anything (orders, partners, customers...)"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              onKeyDown={handleGlobalSearch}
              autoFocus
            />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Esc to close</span>
          </div>
        </>
      )}

      {/* Floating Action Button (FAB) - For New Order on Mobile or quick action */}
      <div className="fab" onClick={() => setView({ screen: 'ORDER_FORM', params: { orderId: 'new' } })}>
        <Icon name="plus" />
      </div>
    </div>
  );
}

export default App;