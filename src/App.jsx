import React, { useState } from 'react';

// API 網址，移除多餘參數以確保搜尋精確
const API_URL = "https://sheetdb.io/api/v1/ihm71us1n06fy";

export default function App() {
  const [phone, setPhone] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // 1. 登入邏輯 (包含精確匹配檢查)
  const handleLogin = async () => {
    if (!phone) return alert("請輸入手機號碼");
    setLoading(true);
    try {
      // 使用 SheetDB 的精確過濾語法 ?phone=...
      const response = await fetch(`${API_URL}?phone=${phone}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        // 二次檢查：在回傳結果中找尋與輸入號碼完全相符的資料
        // 防止 API 因格式問題回傳錯誤的第一筆資料
        const foundUser = data.find(user => String(user.phone).trim() === String(phone).trim());
        
        if (foundUser) {
          setUserData(foundUser);
        } else {
          alert("找不到此手機號碼的精確資料，請聯繫客服。");
        }
      } else {
        alert("找不到此資料，請確認號碼是否正確。");
      }
    } catch (error) {
      alert("網路連線失敗，請稍後再試。");
    }
    setLoading(false);
  };

  // 2. 回報狀態邏輯 (確認/錯誤)
  const handleUpdateStatus = async (status) => {
    const confirmMsg = status === 'Yes' ? "確認所有行程與帳務資料正確？" : "回報資料有誤並請客服修正？";
    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(`${API_URL}/phone/${userData.phone}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { confirmed: status } })
      });
      if (response.ok) {
        setConfirmed(true);
        alert(status === 'Yes' ? "感謝您的確認！" : "已收到回報，我們將儘快處理。");
      }
    } catch (error) {
      alert("更新失敗，請聯繫管理員。");
    }
  };

  // --- 登入介面 ---
  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-emerald-50">
          <h1 className="text-4xl font-black text-emerald-800 mb-1">岳野登山</h1>
          <p className="text-slate-400 mb-8 font-medium tracking-widest text-xs uppercase">Management System</p>
          <input 
            type="tel" 
            placeholder="請輸入手機號碼" 
            className="w-full p-4 border-2 border-emerald-100 rounded-2xl mb-4 text-center focus:border-emerald-500 outline-none text-lg font-mono tracking-wider"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
          >
            {loading ? "查詢中..." : "查看我的行程"}
          </button>
        </div>
      </div>
    );
  }

  // --- 計算邏輯 (強制數值轉換) ---
  const n = (val) => {
    if (!val) return 0;
    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const fee = n(userData.total_fee);
  const dis = n(userData.discount);
  const add = n(userData.add_on);
  const dep = n(userData.deposit);
  const total_amount = (fee - dis) + add;
  const balance = total_amount - dep;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex justify-center text-slate-700">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-emerald-800 p-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">親愛的 {userData.name}</h2>
          <p className="opacity-60 text-xs tracking-[0.3em] font-light">CUSTOMER ITINERARY & INVOICE</p>
        </div>

        <div className="p-6 md:p-10 space-y-8 flex-grow">
          
          {/* 行程資訊 - 已改為立體圖塊 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 參加團名圖塊 */}
            <div className="bg-white shadow-md border-l-[6px] border-emerald-600 rounded-xl p-5 flex flex-col justify-center transition-all hover:shadow-lg">
              <p className="text-[11px] text-emerald-700 font-black mb-1 uppercase tracking-wider">參加團名</p>
              <p className="font-bold text-xl text-slate-800">{userData.group || "---"}</p>
            </div>
            
            {/* 參加日期圖塊 */}
            <div className="bg-white shadow-md border-l-[6px] border-emerald-600 rounded-xl p-5 flex flex-col justify-center transition-all hover:shadow-lg">
              <p className="text-[11px] text-emerald-700 font-black mb-1 uppercase tracking-wider">參加日期</p>
              <p className="font-bold text-xl text-slate-800">{userData.date || "---"}</p>
            </div>
            
            {/* 寄送地址圖塊 */}
            <div className="bg-white shadow-md border-l-[6px] border-emerald-600 rounded-xl p-5 md:col-span-2 flex flex-col justify-center transition-all hover:shadow-lg">
              <p className="text-[11px] text-emerald-700 font-black mb-1 uppercase tracking-wider">證書寄送地址</p>
              <p className="font-bold text-lg text-slate-800 leading-relaxed">{userData.address || "---"}</p>
            </div>
          </div>

          {/* 需求與備註 - 已改為立體圖塊 */}
          <div className="space-y-5">
            <div className="bg-white shadow-md border-l-[6px] border-emerald-400 rounded-xl p-5 transition-all hover:shadow-lg">
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">額外加購項目</p>
              <div className="text-slate-800 font-bold text-base mt-2">
                {userData.extra_item || "無"}
              </div>
            </div>
            
            <div className="bg-white shadow-md border-l-[6px] border-orange-400 rounded-xl p-5 transition-all hover:shadow-lg">
              <p className="text-[11px] font-black text-orange-600 uppercase tracking-wider">特殊需求與備註</p>
              <div className="text-slate-800 font-bold text-base mt-2">
                {userData.requirements || "無特別要求"}
              </div>
            </div>
          </div>

          {/* 帳務區 */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-900/10">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between opacity-50"><span>基礎團費</span><span>${fee.toLocaleString()}</span></div>
              <div className="flex justify-between text-red-400"><span>折扣優惠</span><span>-${dis.toLocaleString()}</span></div>
              <div className="flex justify-between text-emerald-400 font-bold"><span>追加費用 (加購)</span><span>+${add.toLocaleString()}</span></div>
              <div className="h-px bg-white/10 my-4"></div>
              <div className="flex justify-between text-lg font-bold">
                <span className="opacity-50">總計金額</span>
                <span className="text-emerald-50">${total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between opacity-50"><span>已收訂金</span><span>-${dep.toLocaleString()}</span></div>
            </div>

            <div className="flex justify-between items-end mt-10 pt-8 border-t border-white/10">
              <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">待付尾款 Balance</div>
              <div className="text-5xl font-black text-yellow-400 font-mono tracking-tighter">
                ${balance.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 操作 */}
          <div className="flex flex-col gap-4 pt-4">
            <button 
              onClick={() => handleUpdateStatus('Yes')}
              disabled={confirmed || userData.confirmed === 'Yes'}
              className={`w-full py-6 rounded-3xl font-bold text-2xl transition-all shadow-xl active:scale-95 ${
                confirmed || userData.confirmed === 'Yes' 
                ? 'bg-slate-100 text-slate-400 shadow-none' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {confirmed || userData.confirmed === 'Yes' ? "✓ 已完成資料確認" : "核對無誤，送出確認"}
            </button>
            
            {!confirmed && userData.confirmed !== 'Yes' && (
              <button 
                onClick={() => handleUpdateStatus('Error')}
                className="w-full py-2 text-slate-400 font-bold text-sm hover:text-red-500 transition-colors"
              >
                資料有誤？點此告知客服修正
              </button>
            )}
          </div>
          
          <p className="text-center text-slate-300 text-[10px] font-black tracking-[0.4em] uppercase pt-6">
            Secure Service by YueYe Mountainfield
          </p>
        </div>
      </div>
    </div>
  );
}
