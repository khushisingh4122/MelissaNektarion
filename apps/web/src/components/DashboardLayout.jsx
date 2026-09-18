import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import dashImage from '../../dash.png';

/**
 * Shared application shell (sidebar + header) used by every page in the app.
 * Pages simply wrap their content in <DashboardLayout>...</DashboardLayout>.
 */
const DashboardLayout = ({ children, unreadCount = 0 }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="farm-shell flex min-h-screen bg-[#d6e3cf]"
      style={{ backgroundImage: `url('${dashImage}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} unreadCount={unreadCount} />

        <main className="flex-1 p-3 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
