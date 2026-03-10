import React, { useState } from 'react';

// 你的 SheetDB API
const API_URL = "https://sheetdb.io/api/v1/ihm71us1n06fy";

export default function App() {
  const [phone, setPhone] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // 1. 登入邏輯
  const handleLogin = async () => {
    if (!phone) return alert("請輸入手機號碼");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/search?phone=${phone}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setUserData(data[0]);
      } else {
        alert("找不到此手機號碼，請聯繫管理員。");
      }
    } catch (error) {
      alert("連線失敗");
    }
    setLoading(false);
  };

  // 2. 確認邏輯
  const handleConfirm = async () => {
    try {
      const response = await fetch(`${API_URL}/phone/${userData.phone}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { confirmed: 'Yes' } })
      });
      if (response.ok) {
        setConfirmed(true);
        alert("需求已確認！");
      }
    } catch (error) {
      alert("更新失敗");
    }
  };

  // 畫面 A：登入頁
  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4" style={{backgroundImage: "url('https://images.unsplash.com/photo-1491884662610-dfcd28f30ad1?q=80&w=1000')", backgroundSize: 'cover'}}>
        <div className="bg-white/90 p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold text-emerald-900">岳野登山公司</h1>
          <p className="mb-6 text-slate-500">客戶行程查詢系統</p>
          <input 
            type="tel" 
            placeholder="請輸入手機號碼" 
            className="w-full p-3 border rounded-xl mb-4 text-center"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={handleLogin} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">進入我的行程</button>
        </div>
      </div>
    );
  }

  // 畫面 B：行程頁
  return (
    <div className="min-h-screen bg-emerald-50 p-4 flex justify-center">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg overflow-hidden my-auto">
        <div className="bg-emerald-600 p-6 text-white text-center">
          <h2 className="text-xl font-bold">親愛的 {userData.name} 您好</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-bold border-l-4 border-emerald-500 pl-2 mb-2">購買項目</h3>
            <div className="bg-slate-50 p-4 rounded-xl">{userData.items}</div>
          </div>
          <div>
            <h3 className="font-bold border-l-4 border-emerald-500 pl-2 mb-2">特殊需求</h3>
            <div className="bg-slate-50 p-4 rounded-xl">{userData.requirements}</div>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl text-white">
            <div className="flex justify-between opacity-70 mb-2"><span>總金額</span><span>${userData.total}</span></div>
            <div className="flex justify-between opacity-70 mb-4"><span>已付訂金</span><span>-${userData.deposit}</span></div>
            <div className="flex justify-between text-xl font-bold border-t pt-4"><span>待付尾款</span><span className="text-emerald-400">${userData.balance}</span></div>
          </div>
          <button 
            onClick={handleConfirm}
            disabled={confirmed || userData.confirmed === 'Yes'}
            className={`w-full py-4 rounded-xl font-bold text-white ${confirmed || userData.confirmed === 'Yes' ? 'bg-slate-400' : 'bg-emerald-600'}`}
          >
            {confirmed || userData.confirmed === 'Yes' ? "✓ 已確認" : "確認行程與金額無誤"}
          </button>
        </div>
      </div>
    </div>
  );
}
