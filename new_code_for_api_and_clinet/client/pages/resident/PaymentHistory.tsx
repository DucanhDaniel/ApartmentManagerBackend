
import React, { useState, useEffect } from 'react';
import { User, Invoice } from '../../types';
import { getInvoices, getInvoiceById } from '../../services/invoiceService';
import { CheckCircle, AlertTriangle, FileText, Search, Loader2, X, Eye } from 'lucide-react';

interface PaymentHistoryProps {
  user: User;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ user }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail view state
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const fetchPaidInvoices = async () => {
      setLoading(true);
      try {
        const data = await getInvoices(0, 50, '', 'paid');
        setInvoices(data.content);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaidInvoices();
  }, []);

  const handleViewDetail = async (id: number) => {
    try {
      const fullInvoice = await getInvoiceById(id);
      setViewingInvoice(fullInvoice);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Lịch sử thanh toán</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm theo kỳ hóa đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
            <div className="p-12 flex justify-center text-blue-600">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs">
                <tr>
                    <th className="px-6 py-4">Hóa đơn</th>
                    <th className="px-6 py-4">Kỳ hóa đơn</th>
                    <th className="px-6 py-4">Hạn nộp cũ</th>
                    <th className="px-6 py-4">Số tiền đã đóng</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-green-600" />
                        {inv.title}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">Tháng {inv.month}/{inv.year}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(inv.dueDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4 font-black text-gray-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" /> Thành công
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleViewDetail(inv.id)}
                          className="text-blue-600 hover:text-blue-800 font-bold flex items-center justify-end w-full transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" /> Chi tiết
                        </button>
                    </td>
                    </tr>
                ))}
                {filteredInvoices.length === 0 && (
                    <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                        Chưa có lịch sử giao dịch nào được ghi nhận.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        )}
      </div>

      {/* Detail Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-100">
              <div>
                <h2 className="text-xl font-black text-gray-900">Chi tiết biên lai</h2>
                <p className="text-sm font-bold text-blue-600">{viewingInvoice.title}</p>
              </div>
              <button onClick={() => setViewingInvoice(null)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-gray-500">Trạng thái: <b className="text-green-600">ĐÃ THANH TOÁN</b></span>
                  <span className="text-gray-500">Ngày chốt: <b className="text-gray-900">{new Date(viewingInvoice.dueDate).toLocaleDateString('vi-VN')}</b></span>
               </div>
               <table className="w-full text-sm">
                  <thead className="text-gray-900 font-bold border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3 font-bold">Khoản phí</th>
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
                      <td className="py-4 text-gray-800 text-base">Tổng đã thanh toán:</td>
                      <td className="py-4 text-right text-green-700 text-xl">{formatCurrency(viewingInvoice.totalAmount)}</td>
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
    </div>
  );
};

export default PaymentHistory;
