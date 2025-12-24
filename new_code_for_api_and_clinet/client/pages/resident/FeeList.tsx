
import React, { useState, useEffect } from 'react';
import { User, Invoice } from '../../types';
import { getInvoices, getInvoiceById, simulatePayment } from '../../services/invoiceService';
import { Search, CheckCircle, Clock, Loader2, AlertTriangle, FileText, Info, X, Eye } from 'lucide-react';

interface FeeListProps {
  user: User;
}

const FeeList: React.FC<FeeListProps> = ({ user }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Detail view state
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const fetchUnpaidInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoices(0, 100, '', 'unpaid');
      setInvoices(data.content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpaidInvoices();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleViewDetail = async (id: number) => {
    try {
      const fullInvoice = await getInvoiceById(id);
      setViewingInvoice(fullInvoice);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleSelection = (id: number) => {
    const newSelection = new Set(selectedInvoiceIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedInvoiceIds(newSelection);
  };

  const totalSelectedAmount = invoices
    .filter(inv => selectedInvoiceIds.has(inv.id))
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const handlePayment = async () => {
    if (selectedInvoiceIds.size === 0) return;
    
    setIsProcessing(true);
    try {
      let results: string[] = [];
      // Process each selected invoice sequentially
      for (const id of Array.from(selectedInvoiceIds)) {
        // Fix: Explicitly cast id as number to avoid 'unknown' type error when calling simulatePayment
        const msg = await simulatePayment(id as number);
        results.push(`Hóa đơn #${id}: ${msg}`);
      }
      
      alert(results.join('\n'));
      setSelectedInvoiceIds(new Set());
      fetchUnpaidInvoices();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra trong quá trình thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Các khoản phí chưa đóng</h1>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 text-sm flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
           <span className="font-bold text-gray-700">Danh sách hóa đơn tồn đọng</span>
           <span className="text-sm font-medium text-gray-500">{invoices.length} hóa đơn</span>
        </div>

        <div className="divide-y divide-gray-100">
          {invoices.length > 0 ? (
            invoices.map(inv => (
              <div key={inv.id} className="p-4 flex items-center hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedInvoiceIds.has(inv.id)}
                  onChange={() => toggleSelection(inv.id)}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-4"
                />
                <div className="flex-1 cursor-pointer" onClick={() => handleViewDetail(inv.id)}>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <p className="font-bold text-gray-900 hover:text-blue-600 transition-colors">{inv.title}</p>
                  </div>
                  <p className="text-sm text-gray-500 ml-6">Hạn nộp: {new Date(inv.dueDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="text-right">
                   <p className="font-black text-gray-900">{formatCurrency(inv.totalAmount)}</p>
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                      Chờ thanh toán
                   </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
               <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
               <p className="text-lg font-bold">Tất cả hóa đơn đã được thanh toán!</p>
               <p className="text-sm">Hẹn gặp lại bạn vào kỳ thu phí tiếp theo.</p>
            </div>
          )}
        </div>

        {invoices.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between sticky bottom-0 shadow-lg">
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng thanh toán ({selectedInvoiceIds.size} hóa đơn)</p>
              <p className="text-2xl font-black text-blue-600">{formatCurrency(totalSelectedAmount)}</p>
            </div>
            <button
              onClick={handlePayment}
              disabled={selectedInvoiceIds.size === 0 || isProcessing}
              className={`px-8 py-3 rounded-lg font-black text-white shadow-md transition-all ${
                selectedInvoiceIds.size === 0 || isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
              }`}
            >
              {isProcessing ? 'Đang thực hiện...' : 'Thanh toán ngay'}
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-100">
              <h2 className="text-xl font-black text-gray-900">Chi tiết {viewingInvoice.title}</h2>
              <button onClick={() => setViewingInvoice(null)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
               <table className="w-full text-sm">
                  <thead className="text-gray-700 font-bold border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3 font-bold">Hạng mục</th>
                      <th className="text-right py-3 font-bold">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {viewingInvoice.details?.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="py-3">
                           <p className="font-bold text-gray-900">{d.feeName}</p>
                           <p className="text-xs text-gray-500 font-medium">{formatCurrency(d.unitPrice)} x {d.quantity} {d.unit}</p>
                        </td>
                        <td className="py-3 text-right font-bold text-gray-900">{formatCurrency(d.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-100 font-black">
                    <tr>
                      <td className="py-4 text-gray-800 text-base">Tổng cộng:</td>
                      <td className="py-4 text-right text-blue-600 text-xl">{formatCurrency(viewingInvoice.totalAmount)}</td>
                    </tr>
                  </tfoot>
               </table>
            </div>
            <button 
              onClick={() => setViewingInvoice(null)}
              className="w-full mt-6 py-3 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-800">
              <p className="font-bold mb-1">Quy định nộp phí:</p>
              <ul className="list-disc ml-4 space-y-1 font-medium">
                  <li>Phí dịch vụ và quản lý được chốt vào ngày 5 hàng tháng.</li>
                  <li>Sau hạn nộp, hệ thống sẽ tự động tính phí chậm nộp (nếu có).</li>
              </ul>
          </div>
      </div>
    </div>
  );
};

export default FeeList;
