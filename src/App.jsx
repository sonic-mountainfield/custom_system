import React, { useState } from 'react';

const API_URL = "https://sheetdb.io/api/v1/ihm71us1n06fy?cast_numbers=true";

export default function App() {
  const [phone, setPhone] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleLogin = async () => {
    if (!phone) return alert("請輸入手機號碼");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}&search?phone=${phone}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setUserData(data[0]);
      } else {
        alert("找不到資料，請確認號碼是否正確");
      }
    } catch (error) {
      alert("連線失敗");
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (status) => {
    const confirmMsg = status === 'Yes' ? "確認資料正確？" : "回報資料有誤？";
    if (!window.confirm(confirmMsg)) return;
    try {
      const baseApi = "https://sheetdb.io/api/v1/ihm71us1n06fy";
      const response = await fetch(`${baseApi}/phone/${userData.phone}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { confirmed: status } })
      });
      if (response.ok) {
        setConfirmed(true);
        alert("已收到您的回覆！");
      }
    } catch (error) {
      alert("更新失敗");
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center">
          <h1 className="text-3xl font-black text-emerald-900 mb-2">岳野登山</h1>
          <p className="text-slate-500 mb-8 font-medium">客戶管理系統</p>
          <input 
            type="tel" 
            placeholder="請輸入手機號碼" 
            className="w-full p-4 border-2 border-emerald-100 rounded-2xl mb-4 text-center focus:border-emerald-500 outline-none text-lg"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button 
            onClick={handleLogin}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
          >
            {loading ? "查詢中..." : "查看我的行程"}
          </button>
        </div>
      </div>
    );
  }

  // 強制轉數字邏輯
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
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="bg-emerald-800 p-8 text-white text-center">
          <h2 className="text-2xl font-bold">親愛的 {userData.name} 您好</h2>
          <p className="opacity-70 mt-1 text-xs">YUEYE MOUNTAINFIELD</p>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-[10px] text-emerald-700 font-black mb-1">參加團名</p>
              <p className="font-bold">{userData.group || "---"}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-[10px] text-emerald-700 font-black mb-1">參加日期</p>
              <p className="font-bold">{userData.date || "---"}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl md:col-span-2">
              <p className="text-[10px] text-emerald-700 font-black mb-1">證書寄送地址</p>
              <p className="font-bold leading-tight">{userData.address || "---"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold mb-2 flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>額外加購
              </p>
              <div className="bg-white border-2 border-slate-50 p-4 rounded-2xl text-sm">
                {userData.extra_item || "無"}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold mb-2 flex items-center">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>特殊需求
              </p>
              <div className="bg-orange-50/30 p-4 rounded-2xl text-sm italic">
                {userData.requirements || "無"}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between opacity-60"><span>基礎團費</span><span>${fee.toLocaleString()}</span></div>
              <div className="flex justify-between text-red-400"><span>折扣金額</span><span>-${dis.toLocaleString()}</span></div>
              <div className="flex justify-between text-emerald-400"><span>追加費用</span><span>+${add.toLocaleString()}</span></div>
              <div className="h-px bg-white/10 my-4"></div>
              <div className="flex justify-between text-lg font-bold"><span>總計金額</span><span>${total_amount.toLocaleString()}</span></div>
              <div className="flex justify-between opacity-60"><span>已收訂金</span><span>-${dep.toLocaleString()}</span></div>
            </div>
            <div className="flex justify-between items-end mt-8 pt-6 border-t border-white/10">
              <div className="text-slate-400 text-xs font-bold uppercase mb-1">待付尾款</div>
              <div className="text-4xl font-black text-yellow-400 tracking-tighter font-mono">${balance.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleUpdateStatus('Yes')}
              disabled={confirmed || userData.confirmed === 'Yes'}
              className={`w-full py-5 rounded-2xl font-bold text-xl shadow-lg transition-all active:scale-95 ${confirmed || userData.confirmed === 'Yes' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white'}`}
            >
              {confirmed || userData.confirmed === 'Yes' ? "✓ 資料已確認" : "確認資料正確"}
            </button>
            {!confirmed && userData.confirmed !== 'Yes' && (
              <button onClick={() => handleUpdateStatus('Error')} className="w-full py-2 text-slate-400 font-bold text-sm hover:text-red-500">
                資料有誤？點此告知客服
              </button>
            )}
          </div>
          <p className="text-center text-slate-300 text-[10px] font-bold tracking-[0.3em] uppercase pt-4">© YUEYE MOUNTAINFIELD</p>
        </div>
      </div>
    </div>
  );
}
