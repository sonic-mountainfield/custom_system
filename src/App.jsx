import React, { useState } from 'react';

const API_URL = "https://sheetdb.io/api/v1/ihm71us1n06fy";

export default function YueYeApp() {
  const [phone, setPhone] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // 1. 登入邏輯：查詢手機號碼
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/search?phone=${phone}`);
      const data = await response.json();
      if (data.length > 0) {
        setUserData(data[0]);
      } else {
        alert("找不到此手機號碼，請聯繫岳野登山管理員。");
      }
    } catch (error) {
      console.error("讀取資料失敗", error);
    }
    setLoading(false);
  };

  // 2. 確認邏輯：回傳確認狀態到 Google Sheets
  const handleConfirm = async () => {
    try {
      await fetch(`${API_URL}/phone/${userData.phone}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { confirmed: 'Yes' } })
      });
      setConfirmed(true);
      alert("感謝您的確認！我們已收到您的回覆。");
    } catch (error) {
      alert("確認失敗，請稍後再試。");
    }
  };

  // --- 第一頁：登入介面 ---
  if (!userData) {
    return (
      <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1491884662610-dfcd28f30ad1?auto=format&fit=crop&q=80&w=1920')"}}>
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold text-slate-800">岳野登山公司</h1>
          <p className="text-slate-500 mb-6">客戶行程查詢系統</p>
          <input 
            type="text" 
            placeholder="請輸入手機號碼" 
            className="w-full p-3 border rounded-lg mb-4 text-center focus:ring-2 focus:ring-emerald-500 outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button 
            onClick={handleLogin}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition"
            disabled={loading}
          >
            {loading ? "查詢中..." : "進入我的行程"}
          </button>
        </div>
      </div>
    );
  }

  // --- 第二頁：內容介面 ---
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="bg-emerald-600 p-6 text-white text-center">
          <h2 className="text-xl font-bold">親愛的 {userData.name} 先生/小姐</h2>
          <p className="opacity-90">歡迎查看您的專屬行程</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* 旅遊項目 */}
          <section>
            <h3 className="font-bold text-slate-700 mb-2 border-l-4 border-emerald-500 pl-2">購買項目清單</h3>
            <div className="bg-emerald-50 p-4 rounded-xl text-emerald-900 leading-relaxed">
              {userData.items}
            </div>
          </section>

          {/* 特殊需求 */}
          <section>
            <h3 className="font-bold text-slate-700 mb-2 border-l-4 border-emerald-500 pl-2">特殊需求確認</h3>
            <div className="flex items-center space-x-2 text-slate-600">
              <input type="checkbox" checked readOnly className="w-5 h-5 accent-emerald-500" />
              <span>{userData.requirements}</span>
            </div>
          </section>

          {/* 金額明細 */}
          <section className="bg-slate-100 p-6 rounded-2xl">
            <div className="flex justify-between mb-2"><span>總金額</span><span>${userData.total}</span></div>
            <div className="flex justify-between mb-2 text-slate-500"><span>已付訂金</span><span>-${userData.deposit}</span></div>
            <hr className="my-2 border-slate-300" />
            <div className="flex justify-between text-xl font-bold text-red-600">
              <span>待付尾款</span><span>${userData.balance}</span>
            </div>
          </section>

          {/* 確認按鈕 */}
          <button 
            onClick={handleConfirm}
            disabled={confirmed || userData.confirmed === 'Yes'}
            className={`w-full py-4 rounded-xl font-bold text-lg transition ${confirmed || userData.confirmed === 'Yes' ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'}`}
          >
            {confirmed || userData.confirmed === 'Yes' ? "✓ 需求已確認無誤" : "我已確認需求與金額無誤"}
          </button>
        </div>
      </div>
    </div>
  );
}
