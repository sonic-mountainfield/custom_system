import React, { useState } from 'react';

const API_URL = "https://sheetdb.io/api/v1/ihm71us1n06fy";

export default function App() {
  const [phone, setPhone] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleLogin = async () => {
    if (!phone) return alert("請輸入手機號碼");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/search?phone=${phone}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setUserData(data[0]);
      } else {
        alert("找不到此資料，請確認號碼是否正確");
      }
    } catch (error) {
      alert("連線失敗");
    }
    setLoading(false);
  };

  const handleConfirm = async (status) => {
    const msg = status === 'Yes' ? "確認行程無誤？" : "需要修正資料？";
    if(!window.confirm(msg)) return;

    try {
      await fetch(`${API_URL}/phone/${userData.phone}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { confirmed: status } })
      });
      setConfirmed(true);
      alert(status === 'Yes' ? "感謝您的確認！" : "已收到您的修正請求，我們將盡快聯繫您。");
    } catch (error) {
      alert("更新失敗");
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4" style={{backgroundImage: "url('https://images.unsplash.com/photo-1491884662610-dfcd28f30ad1?q=80&w=1000')", backgroundSize: 'cover'}}>
        <div className="bg-white/90 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">岳野登山公司</h1>
          <p className="mb-8 text-slate-500 font-medium">客戶行程與帳務查詢</p>
          <input 
            type="tel" 
            placeholder="請輸入手機號碼" 
            className="w-full p-4 border-2 border-emerald-100 rounded-2xl mb-4 text-center focus:border-emerald-500 outline-none text-lg"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={handleLogin} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg">進入系統</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-emerald-600 p-8 text-white text-center">
          <h2 className="text-2xl font-bold">親愛的 {userData.name} 您好</h2>
          <p className="opacity-80 mt-1">請核對您的行程與帳務資料</p>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          {/* 基本資訊區 */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs text-slate-400 mb-1">參加團名</p>
              <p className="font-bold text-slate-700">{userData.group || "尚未填寫"}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs text-slate-400 mb-1">參加日期</p>
              <p className="font-bold text-slate-700">{userData.date || "尚未填寫"}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl md:col-span-2">
              <p className="text-xs text-slate-400 mb-1">證書寄送地址</p>
              <p className="font-bold text-slate-700">{userData.address || "尚未填寫"}</p>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* 需求區 */}
          <section className="space-y-4">
            <div>
              <p className="text-sm font-bold text-emerald-800 mb-2">額外購買項目</p>
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-slate-700">
                {userData.extra_item || "無額外項目"}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800 mb-2">特殊需求</p>
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-slate-700 italic">
                {userData.requirements || "無特殊需求"}
              </div>
            </div>
          </section>

          {/* 帳務區 */}
          <section className="bg-slate-900 p-8 rounded-[2rem] text-white">
            <div className="space-y-3 opacity-80 text-sm">
              <div className="flex justify-between"><span>團費金額</span><span>${Number(userData.total_fee || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-red-400"><span>折扣金額</span><span>-${Number(userData.discount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-emerald-400"><span>追加金額</span><span>+${Number(userData.add_on || 0).toLocaleString()}</span></div>
              <div className="h-px bg-slate-700 my-2"></div>
              <div className="flex justify-between font-bold text-base"><span>總金額 (Total)</span><span>${Number(userData.total || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>已付訂金</span><span>-${Number(userData.deposit || 0).toLocaleString()}</span></div>
            </div>
            <div className="flex justify-between text-2xl font-black mt-6 pt-6 border-t border-slate-700">
              <span className="text-slate-400">待付尾款</span>
              <span className="text-yellow-400">${Number(userData.balance || 0).toLocaleString()}</span>
            </div>
          </section>

          {/* 操作區 */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleConfirm('Yes')}
              disabled={confirmed || userData.confirmed === 'Yes'}
              className={`w-full py-5 rounded-2xl font-bold text-xl shadow-lg transition-transform active:scale-95 ${confirmed || userData.confirmed === 'Yes' ? 'bg-slate-300 text-slate-500' : 'bg-emerald-600 text-white'}`}
            >
              {confirmed || userData.confirmed === 'Yes' ? "✓ 資料確認無誤" : "確認資料無誤"}
            </button>
            
            <button 
              onClick={() => handleConfirm('Error')}
              disabled={confirmed}
              className={`w-full py-3 rounded-2xl font-bold text-slate-500 hover:text-red-600 transition-colors ${confirmed ? 'hidden' : ''}`}
            >
              資料有誤？點此告知修正
            </button>
          </div>
          
          <p className="text-center text-slate-400 text-xs mt-4">岳野登山公司管理系統 v2.0</p>
        </div>
      </div>
    </div>
  );
}
