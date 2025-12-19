import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Role } from '../types';
import { 
  Home, 
  Users, 
  CreditCard, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  PieChart,
  Bell,
  Building,
  UserCheck,
  Banknote
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return <>{children}</>;
  }

  const residentLinks = [
    { path: '/resident/dashboard', label: 'Trang chủ', icon: Home },
    { path: '/resident/fees', label: 'Danh sách phí', icon: CreditCard },
    { path: '/resident/history', label: 'Lịch sử thanh toán', icon: FileText },
    { path: '/resident/profile', label: 'Thông tin cá nhân', icon: Users },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Tổng quan', icon: PieChart },
    { path: '/admin/households', label: 'Quản lý hộ khẩu', icon: Building },
    { path: '/admin/residents', label: 'Quản lý cư dân', icon: UserCheck },
    { path: '/admin/fees', label: 'Quản lý khoản thu', icon: Banknote },
    { path: '/admin/requests', label: 'Yêu cầu cư dân', icon: Bell },
  ];

  const links = user.role === Role.ADMIN ? adminLinks : residentLinks;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-800 text-white transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-wider">BLUEMOON</h1>
        </div>
        
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6 p-2 bg-slate-700 rounded-lg">
            <img 
              src={user.avatar || 'https://picsum.photos/200'} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border-2 border-slate-500"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user.role === Role.ADMIN ? 'Quản trị viên' : 'Cư dân'}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {link.label}
                </Link>
              );
            })}
            
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-300 rounded-md hover:bg-slate-700 hover:text-red-200 mt-8"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Đăng xuất
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm lg:hidden h-16 flex items-center px-4 justify-between z-10">
          <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-gray-700">Bluemoon App</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;