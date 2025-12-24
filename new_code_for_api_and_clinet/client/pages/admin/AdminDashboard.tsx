
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getHouseholds } from '../../services/householdService';
import { getInvoices } from '../../services/invoiceService';
import { Household, Invoice, StatData } from '../../types';
import { MOCK_REQUESTS } from '../../services/mockData';
// Added missing CheckCircle icon
import { Users, CreditCard, Home, TrendingUp, Loader2, RefreshCcw, ArrowUpRight, ArrowDownRight, Clock, CheckCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatData[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [housesData, invoicesPage] = await Promise.all([
        getHouseholds(),
        getInvoices(0, 1000) // Get a large enough batch for dashboarding
      ]);
      
      setHouseholds(housesData);
      setInvoices(invoicesPage.content);
      
      // Process stats for the chart
      const chartMap = new Map<string, { revenue: number; debt: number }>();
      
      // Initialize last 6 months
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `T${d.getMonth() + 1}/${d.getFullYear()}`;
        chartMap.set(key, { revenue: 0, debt: 0 });
      }

      invoicesPage.content.forEach(inv => {
        const key = `T${inv.month}/${inv.year}`;
        const existing = chartMap.get(key) || { revenue: 0, debt: 0 };
        if (inv.status === 'paid') {
          existing.revenue += inv.totalAmount;
        } else {
          existing.debt += inv.totalAmount;
        }
        chartMap.set(key, existing);
      });

      const processedStats: StatData[] = Array.from(chartMap.entries()).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        debt: data.debt
      }));

      setStats(processedStats);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalHouseholds = households.length;
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalDebt = invoices.filter(i => i.status === 'unpaid').reduce((acc, curr) => acc + curr.totalAmount, 0);
  const pendingRequests = MOCK_REQUESTS.filter(r => r.status === 'PENDING').length;

  const recentActivities = invoices
    .filter(i => i.status === 'paid')
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
            <span className={`flex items-center text-xs font-black px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {Math.abs(trend)}%
            </span>
        )}
      </div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
    </div>
  );

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <p className="text-gray-500 font-medium animate-pulse">Đang tổng hợp dữ liệu...</p>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-black text-gray-900">Dashboard Quản Trị</h1>
            <p className="text-sm text-gray-500 font-medium">Cập nhật tình hình tài chính và vận hành khu dân cư</p>
        </div>
        <button 
            onClick={fetchDashboardData}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-bold transition-all shadow-sm"
        >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Làm mới dữ liệu
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng số hộ dân" 
          value={totalHouseholds} 
          icon={Home} 
          color="bg-blue-600" 
          trend={1.2}
        />
        <StatCard 
          title="Tổng doanh thu thực tế" 
          value={formatCurrency(totalRevenue)} 
          icon={TrendingUp} 
          color="bg-green-600" 
          trend={5.4}
        />
        <StatCard 
          title="Tổng nợ (Chưa thu)" 
          value={formatCurrency(totalDebt)} 
          icon={CreditCard} 
          color="bg-red-600" 
          trend={-2.1}
        />
        <StatCard 
          title="Yêu cầu đang chờ" 
          value={pendingRequests} 
          icon={Users} 
          color="bg-indigo-600" 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-gray-900">Doanh thu & Công nợ theo kỳ</h3>
              <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                  <span className="flex items-center"><div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div> Doanh thu</span>
                  <span className="flex items-center"><div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div> Nợ</span>
              </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} 
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                    tickFormatter={(value) => `${value / 1000000}M`} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontWeight: 900
                  }}
                />
                <Bar dataKey="revenue" name="Thực thu" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="debt" name="Còn nợ" fill="#dc2626" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
           <h3 className="text-lg font-black text-gray-900 mb-6">Thanh toán mới nhất</h3>
           <div className="space-y-4 flex-1">
              {recentActivities.length > 0 ? recentActivities.map((inv) => (
                <div key={inv.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">P.{inv.roomNumber}</p>
                    <p className="text-xs text-gray-500 font-medium">Đã đóng {inv.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-green-600">+{formatCurrency(inv.totalAmount)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Kỳ {inv.month}/{inv.year}</p>
                  </div>
                </div>
              )) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <Clock className="w-12 h-12 text-gray-200 mb-4" />
                      <p className="text-gray-400 font-medium italic">Chưa có giao dịch phát sinh trong kỳ này</p>
                  </div>
              )}
           </div>
           
           <div className="mt-6 pt-6 border-t border-gray-50">
               <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Tỉ lệ thu hồi</span>
                   <span className="text-blue-600 font-black">
                       {totalRevenue + totalDebt > 0 
                        ? Math.round((totalRevenue / (totalRevenue + totalDebt)) * 100) 
                        : 0}%
                   </span>
               </div>
               <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                   <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${totalRevenue + totalDebt > 0 ? (totalRevenue / (totalRevenue + totalDebt)) * 100 : 0}%` }}
                   ></div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
