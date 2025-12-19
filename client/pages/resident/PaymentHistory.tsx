import React from 'react';
import { User, Transaction } from '../../types';
import { MOCK_TRANSACTIONS, MOCK_FEES } from '../../services/mockData';
import { CheckCircle, AlertTriangle, FileText, Search } from 'lucide-react';

interface PaymentHistoryProps {
  user: User;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ user }) => {
  // In a real app, we would fetch transactions from API.
  // Here we filter MOCK_TRANSACTIONS by checking if the fee belongs to the user's household.
  const myHouseholdFees = MOCK_FEES.filter(f => f.householdId === user.householdId).map(f => f.id);
  const myTransactions = MOCK_TRANSACTIONS.filter(t => myHouseholdFees.includes(t.feeId));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getMethodLabel = (method: string) => {
    switch(method) {
      case 'VNPAY': return 'Ví VNPAY';
      case 'MOMO': return 'Ví Momo';
      case 'BANKING': return 'Chuyển khoản';
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Lịch sử thanh toán</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm mã giao dịch..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Mã Giao Dịch</th>
                <th className="px-6 py-4">Khoản Phí</th>
                <th className="px-6 py-4">Thời Gian</th>
                <th className="px-6 py-4">Phương Thức</th>
                <th className="px-6 py-4">Số Tiền</th>
                <th className="px-6 py-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-gray-500">{trx.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{trx.feeName}</td>
                  <td className="px-6 py-4">{new Date(trx.date).toLocaleString('vi-VN')}</td>
                  <td className="px-6 py-4">{getMethodLabel(trx.method)}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{formatCurrency(trx.amount)}</td>
                  <td className="px-6 py-4">
                    {trx.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> Thành công
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Thất bại
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {myTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    Chưa có giao dịch nào được ghi nhận.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;