import React, { useState } from 'react';

// 確認這是你的 SheetDB API 網址
const API_URL = "https://sheetdb.io/api/v1/ihm71us1n06fy";

export default function App() {
  const [phone, setPhone] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // 1. 登入邏輯：透過手機號碼查詢
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
      console.error("讀取資料失敗", error);
      alert("連線失敗，請稍後再試。");
    }
    setLoading(false);
  };

  // 2. 確認邏輯：更新 Google Sheets 狀態
  const handleConfirm = async () => {
    try {
      const response = await fetch(`${API_URL}/phone/${userData.phone}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: { confirmed: 'Yes' } 
        })
      });
      
      if (response.ok) {
        setConfirmed(true);
        alert("感謝您的確認！我們已收到您的回覆。");
      }
    } catch (error) {
      alert("確認失敗，請聯繫管理員。");
    }
  };

  // --- 畫面 A：登入介面 ---
  if (!userData) {
    return (
      <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4" 
           style={{backgroundImage: "url('https://images.unsplash.com/photo-1491884662610-dfcd28f30ad1?auto=format&fit=crop&q=80&w=1920')"}}>
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-white/20">
          <h1 className="text-3xl font-bold text-emerald-800 mb-1">岳野登山公司</h1>
          <p className="text-slate-600 mb-8 font-medium">客戶管理系統</p>
          <input 
            type="tel" 
            placeholder="請輸入手機號碼" 
            className="w-full p-4 border-2 border-emerald-100 rounded-xl mb-4 text-center focus:ring-2 focus:ring-emerald-500 outline-none text-lg"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95"
          >
            {loading ? "查詢中..." : "進入我的行程"}
          </button>
        </div>
      </div>
    );
  }

  // --- 畫面 B：行程確認介面 ---
  return (
    <div className="min-h-screen bg-emerald-50 p-4 md:p-8 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100">
        <div className="bg-emerald-600 p-8 text-white text-center">
          <h2 className="text-2xl font-bold">親愛的 {userData.name} 您好</h2>
          <p className="opacity-90 mt-2 text-sm tracking-widest">歡迎查看您的專屬登山行程</p>
        </div>
        
        <div className="p-6 md:p-10 space-y-8">
          <section>
            <h3 className="font-bold text-emerald-800 mb-3 text-lg border-l-4 border-emerald-500 pl-3">購買項目清單</h3>
            <div className="bg-emerald-50/50 p-5 rounded-2xl text-slate-700 leading-relaxed border border-emerald-100">
              {userData.items || "尚無項目資料"}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-emerald-800 mb-3 text-lg border-l-4 border-emerald-500 pl-3">特殊需求備註</h3>
            <div className="flex items-start space-x-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <input type="checkbox" checked readOnly className="w-6 h-6 mt-1 accent-emerald-600" />
              <span className="text-slate-700">{userData.requirements || "無特別備註"}</span>
            </div>
          </section>

          <section className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl">
            <div className="flex justify-between mb-3 opacity-80"><span>總金額</span><span>${userData.total}</span></div>
            <div className="flex justify-between mb-4 opacity-80 text-emerald-400"><span>已付訂金</span><span>-${userData.deposit}</span></div>
            <div className="h-px bg-slate-700 w-full mb-4"></div>
            <div className="flex justify-between text-2xl font-extrabold">
              <span>待付尾款</span><span className="text-yellow-400">${userData.balance}</span>
            </div>
          </section>

          <button 
            onClick={handleConfirm}
            disabled={confirmed || userData.confirmed === 'Yes'}
            className={`w-full py-5 rounded-2xl font-bold text-xl transition-all shadow-xl active:scale-95 ${
              confirmed || userData.confirmed === 'Yes' 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
            }`}
          >
            {confirmed || userData.confirmed === 'Yes' ? "✓ 需求已確認無誤" : "我已確認需求與金額無誤"}
          </button>
          <p className="text-center text-slate-400 text-xs">岳野登山公司管理系統 v1.0</p>
        </div>
      </div>
    </div>
  );
}
