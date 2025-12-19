import React, { useState } from 'react';
import { User, Fee } from '../../types';
import { MOCK_FEES } from '../../services/mockData';
import { Search, CheckCircle, Clock } from 'lucide-react';

interface FeeListProps {
  user: User;
}

const FeeList: React.FC<FeeListProps> = ({ user }) => {
  const [fees, setFees] = useState<Fee[]>(
    MOCK_FEES.filter(f => f.householdId === user.householdId)
  );
  const [selectedFeeIds, setSelectedFeeIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter out paid fees for the selection list usually, but here we show all
  const unpaidFees = fees.filter(f => f.status === 'PENDING');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedFeeIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedFeeIds(newSelection);
  };

  const totalSelectedAmount = unpaidFees
    .filter(f => selectedFeeIds.has(f.id))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment gateway interaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedFees = fees.map(f => {
      if (selectedFeeIds.has(f.id)) {
        return { ...f, status: 'PAID' as const };
      }
      return f;
    });
    
    setFees(updatedFees);
    setSelectedFeeIds(new Set());
    setIsProcessing(false);
    alert('Thanh toán thành công! (Giả lập VNPAY)');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Danh sách khoản phí</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
           <span className="font-semibold text-gray-700">Các khoản phí cần thanh toán</span>
           <span className="text-sm text-gray-500">{unpaidFees.length} khoản</span>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {unpaidFees.length > 0 ? (
            unpaidFees.map(fee => (
              <div key={fee.id} className="p-4 flex items-center hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedFeeIds.has(fee.id)}
                  onChange={() => toggleSelection(fee.id)}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-4"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{fee.name}</p>
                  <p className="text-sm text-gray-500">Hạn nộp: {new Date(fee.deadline).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="text-right">
                   <p className="font-bold text-gray-900">{formatCurrency(fee.amount)}</p>
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Chờ thanh toán
                   </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
               <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
               <p>Tuyệt vời! Bạn đã thanh toán hết các khoản phí.</p>
            </div>
          )}
        </div>

        {/* Footer Payment Action */}
        {unpaidFees.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between sticky bottom-0">
            <div>
              <p className="text-sm text-gray-500">Tổng thanh toán</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(totalSelectedAmount)}</p>
            </div>
            <button
              onClick={handlePayment}
              disabled={selectedFeeIds.size === 0 || isProcessing}
              className={`px-6 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all ${
                selectedFeeIds.size === 0 || isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
              }`}
            >
              {isProcessing ? 'Đang xử lý...' : 'Thanh toán ngay'}
            </button>
          </div>
        )}
      </div>

       {/* Paid History Section Preview */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Lịch sử đã đóng gần đây</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {fees.filter(f => f.status === 'PAID').map(fee => (
                <div key={fee.id} className="p-4 flex items-center justify-between opacity-75">
                   <div>
                      <p className="font-medium text-gray-800 line-through">{fee.name}</p>
                      <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                          <CheckCircle className="w-3 h-3 mr-1" /> Đã thanh toán
                      </p>
                   </div>
                   <p className="font-medium text-gray-600">{formatCurrency(fee.amount)}</p>
                </div>
            ))}
             {fees.filter(f => f.status === 'PAID').length === 0 && (
                 <div className="p-4 text-center text-sm text-gray-400">Chưa có lịch sử.</div>
             )}
        </div>
      </div>
    </div>
  );
};

export default FeeList;