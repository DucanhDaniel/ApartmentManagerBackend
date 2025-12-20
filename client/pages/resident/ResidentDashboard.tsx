
import React, { useEffect, useState } from 'react';
import { User, Household, Invoice } from '../../types';
import { getHouseholdById } from '../../services/householdService';
import { getInvoices } from '../../services/invoiceService';
import { CreditCard, Home, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResidentDashboardProps {
  user: User;
}

const ResidentDashboard: React.FC<ResidentDashboardProps> = ({ user }) => {
  const [household, setHousehold] = useState<Household | null>(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);
  const [paidInvoices, setPaidInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFinance, setLoadingFinance] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user.householdId) {
          const data = await getHouseholdById(user.householdId);
          setHousehold(data);
        }
      } catch (error) {
        console.error("Failed to fetch household info", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFinancialData = async () => {
      setLoadingFinance(true);
      try {
        // Fetch unpaid for debt
        const unpaidData = await getInvoices(0, 50, '', 'unpaid');
        setUnpaidInvoices(unpaidData.content);

        // Fetch paid for recent transactions
        const paidData = await getInvoices(0, 3, '', 'paid');
        setPaidInvoices(paidData.content);
      } catch (error) {
        console.error("Failed to fetch invoice data", error);
      } finally {
        setLoadingFinance(false);
      }
    };

    fetchData();
    fetchFinancialData();
  }, [user.householdId]);

  const totalDebt = unpaidInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Xin chào, {user.fullName}</h1>
        <p className="text-gray-500 text-sm mt-1 md:mt-0">Hôm nay là {new Date().toLocaleDateString('vi-VN')}</p>
      </div>

      {/* Household Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Thông tin căn hộ</h2>
            <p className="text-gray-500 text-sm">
                {household?.building ? `Tòa ${household.building} - ` : ''} 
                Phòng {household?.roomNumber || 'N/A'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-1">Chủ hộ</p>
            <p className="font-medium text-gray-900">{household?.ownerName || 'Chưa cập nhật'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
             <p className="text-gray-500 mb-1">Tòa nhà</p>
             <p className="font-medium text-gray-900">{household?.building || '---'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-1">Diện tích</p>
            <p className="font-medium text-gray-900">{household?.area ? `${household.area} m²` : '...'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-1">Nhân khẩu</p>
            <p className="font-medium text-gray-900">{household?.memberCount || 0} người</p>
          </div>
        </div>
      </div>

      {/* Fee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-red-100 font-medium mb-1">Tổng dư nợ</p>
                {loadingFinance ? (
                  <div className="h-9 w-32 bg-white bg-opacity-20 animate-pulse rounded"></div>
                ) : (
                  <h3 className="text-3xl font-bold">{formatCurrency(totalDebt)}</h3>
                )}
              </div>
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="mt-4 text-sm text-red-100">
              {loadingFinance ? 'Đang kiểm tra...' : `Bạn có ${unpaidInvoices.length} khoản phí chưa thanh toán`}
            </p>
            <div className="mt-6">
              <Link 
                to="/resident/fees" 
                className="block w-full text-center py-2 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors shadow-md"
              >
                Thanh toán ngay
              </Link>
            </div>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white opacity-10 rounded-full"></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
               <CreditCard className="w-5 h-5 text-green-600" />
               <h3 className="font-semibold text-gray-800">Giao dịch gần đây</h3>
            </div>
            
            {loadingFinance ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-100 animate-pulse rounded"></div>
                      <div className="h-3 w-16 bg-gray-50 animate-pulse rounded"></div>
                    </div>
                    <div className="h-4 w-20 bg-gray-100 animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {paidInvoices.map(inv => (
                  <div key={inv.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{inv.title}</p>
                      <p className="text-xs text-gray-500">Kỳ: {inv.month}/{inv.year}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-green-600">
                        {formatCurrency(inv.totalAmount)}
                      </p>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Thành công</span>
                    </div>
                  </div>
                ))}
                {paidInvoices.length === 0 && (
                  <div className="py-8 text-center">
                    <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 italic">Chưa có giao dịch nào được ghi nhận.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <Link to="/resident/history" className="text-sm text-blue-600 font-bold hover:underline mt-4 flex items-center">
             Xem tất cả lịch sử giao dịch <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
