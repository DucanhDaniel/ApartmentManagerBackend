
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { User, Role } from '../types';
import { Lock, Mail, AlertCircle, Info, X } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const user = await login(email, password);
      onLogin(user);
      if (user.role === Role.ADMIN) {
        navigate('/admin/dashboard');
      } else {
        navigate('/resident/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setError('');
    setInfoMessage('Vui lòng liên hệ trực tiếp với Ban quản trị tòa nhà (văn phòng tại tầng 1) để được hỗ trợ đặt lại mật khẩu.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Bluemoon</h1>
            <p className="text-slate-500 mt-2">Quản lý cư dân chung cư</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start text-sm rounded-r-lg animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 flex items-start text-sm rounded-r-lg relative animate-in slide-in-from-top-2">
              <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="pr-4">{infoMessage}</span>
              <button 
                onClick={() => setInfoMessage('')}
                className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••"
                />
              </div>
              <div className="flex justify-end mt-2">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-xs font-bold text-blue-600 hover:text-blue-500 hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </div>
              ) : 'Đăng nhập hệ thống'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-500">Chưa có tài khoản? </span>
            <Link to="/register" className="font-black text-blue-600 hover:text-blue-500 transition-colors">
              Đăng ký ngay
            </Link>
          </div>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <p className="text-[10px] text-center text-gray-400 font-medium uppercase tracking-wider">
            Hệ thống quản lý cư dân Bluemoon Apartment v2.1
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
