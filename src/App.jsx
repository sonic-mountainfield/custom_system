import React, { useState, useEffect } from 'react';

const API_URL = "https://sheetdb.io/api/v1/ihm71us1n06fy";

export default function App() {
  const [phone, setPhone] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // 登入查詢
  const handleLogin = async () => {
    if (!phone) return alert("請輸入手機號碼");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/search?phone=${phone}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setUserData(data[0]);
      } else {
        alert("找不到此手機號碼，請聯繫岳野登山管理員。");
      }
    } catch (error) {
      alert("連線失敗，請檢查網路");
    }
    setLoading(false);
  };

  // 確認需求
  const handleConfirm = async () => {
    try {
      await fetch(`${API_URL}/phone/${userData.phone}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { confirmed: 'Yes' } })
      });
      setConfirmed(true);
      alert("感謝您的確認！");
    } catch (error) {
      alert("確認失敗");
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100" style={{backgroundImage: "url('https://images.unsplash.com/photo-1491884662610-dfcd28f30ad1?q=80&w=2000')", backgroundSize: 'cover'}}>
        <div className="bg-white/90 p-8 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-emerald-800 text-center">岳野登山公司</h1>
          <p className="text-slate-600 text-center mb-8 font-medium">客戶管理系統</p>
          <div className="space-y-4">
            <input 
              type="tel" 
              placeholder="請輸入手機號碼" 
              className="w-full p-4 border-2 border-emerald-100 rounded-xl focus:border-emerald-500 outline-none text-lg text-center"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button 
              onClick={handleLogin}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg"
              disabled={loading}
            >
              {loading ? "查詢中..." : "進入我的行程"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden mt-10">
        <div className="bg-emerald-600 p-8 text-white">
          <h2 className="text-2xl font-bold text-center">親愛的 {userData.name} 您好</h2>
          <p className="text-center opacity-80 mt-2">請確認您的登山行程細節</p>
        </div>
        <div className="p-8 space-y-8">
          <div>
            <h3 className="font-bold text-emerald-800 mb-3 text-lg underline underline-offset-8">旅遊項目清單</h3>
            <p className="bg-slate-50 p-4 rounded-xl text-slate-700 leading-relaxed border border-emerald-100">{userData.items}</p>
          </div>
          <div>
            <h3 className="font-bold text-emerald-800 mb-3 text-lg underline underline-offset-8">特殊需求備註</h3>
            <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl">
              <span className="text-emerald-600">✓</span>
              <span className="text-slate-700">{userData.requirements}</span>
            </div>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl text-white">
            <div className="flex justify-between mb-2 opacity-70"><span>總金額</span><span>${userData.total}</span></div>
            <div className="flex justify-between mb-4 opacity-70"><span>已付訂金</span><span>-${userData.deposit}</span></div>
            <div className="flex justify-between text-2xl font-bold text-emerald-400 pt-4 border-t border-slate-700">
              <span>待付尾款</span><span>${userData.balance}</span>
            </div>
          </div>
          <button 
            onClick={handleConfirm}
            disabled={confirmed || userData.confirmed === 'Yes'}
            className={`w-full py-5 rounded-2xl font-bold text-xl transition-all shadow-xl ${confirmed || userData.confirmed === 'Yes' ? 'bg-slate-300 text-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
          >
            {confirmed || userData.confirmed === 'Yes' ? "✓ 已完成需求確認" : "確認行程與金額無誤"}
          </button>
        </div>
      </div>
    </div>
  );
}
