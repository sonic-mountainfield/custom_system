import React, { useState } from 'react';

const API_URL = "https://sheetdb.io/api/v1/ihm71us1n06fy";

export default function App() {
  const [phone, setPhone] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [confirmed, setConfirmed] = useState(false);
  const [lastFive, setLastFive] = useState('');
  const [isRemitSubmitted, setIsRemitSubmitted] = useState(false);

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleLogin = async () => {
    if (!phone) return alert("請輸入手機號碼");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?phone=${phone}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const foundUser = data.find(user => String(user.phone).trim() === String(phone).trim());
        if (foundUser) {
          setUserData(foundUser);
          if (foundUser.remit_last_five && foundUser.remit_last_five !== "") {
            setIsRemitSubmitted(true);
          }
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

  const handleUpdateStatus = async (status) => {
    if (!window.confirm("確認所有行程與帳務資料正確，並前往匯款頁面？")) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/phone/${userData.phone}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { confirmed: status } })
      });
      if (response.ok) {
        setConfirmed(true);
      }
    } catch (error) {
      alert("更新失敗，請聯繫管理員。");
    }
    setLoading(false);
  };

  const handleReportError = async () => {
    if (!errorText.trim()) return alert("請輸入您遇到的問題或錯誤資料！");
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/phone/${userData.phone}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { confirmed: 'Error', error_message: errorText } })
      });
      
      if (response.ok) {
        alert("已收到您的回報！客服人員將會盡快為您修正。");
        setIsErrorModalOpen(false);
        setErrorText('');
      }
    } catch (error) {
      alert("回報送出失敗，請聯繫管理員。");
    }
    setLoading(false);
  };

  const handleSubmitRemittance = async () => {
    if (lastFive.length !== 5) return alert("請輸入完整的帳號後五碼");
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/phone/${userData.phone}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { remit_last_five: lastFive } })
      });
      if (response.ok) {
        setIsRemitSubmitted(true);
      }
    } catch (error) {
      alert("送出失敗，請聯繫管理員。");
    }
    setLoading(false);
  };

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
          <button onClick={handleLogin} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 disabled:bg-emerald-400">
            {loading ? "處理中..." : "查看我的行程"}
          </button>
        </div>
      </div>
    );
  }

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

  const isConfirmedStep = confirmed || userData.confirmed === 'Yes';
  const isDoneStep = isRemitSubmitted;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex justify-center text-slate-700 font-sans relative">
      
      {isErrorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-6 md:p-8 relative">
            <button
              onClick={() => setIsErrorModalOpen(false)}
              className="absolute top-5 right-6 text-slate-400 hover:text-slate-700 text-xl font-bold"
            >
              ✕
            </button>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-2">資料錯誤回報</h3>
            <p className="text-sm text-slate-500 mb-5">請告訴我們哪邊的資料有誤，這將幫助我們更快為您修正：</p>
            
            <textarea
              className="w-full p-4 border-2 border-slate-200 rounded-xl mb-6 focus:border-red-400 outline-none resize-none text-slate-700"
              rows="4"
              placeholder="例如：我的收件地址少填了巷弄、英文名字拼錯了..."
              value={errorText}
              onChange={(e) => setErrorText(e.target.value)}
            ></textarea>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsErrorModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReportError}
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg active:scale-95 disabled:bg-red-300"
              >
                {loading ? "送出中..." : "送出回報"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-emerald-800 p-10 text-white text-center transition-all">
          <h2 className="text-3xl font-bold mb-2">親愛的 {userData.name}</h2>
          <p className="opacity-60 text-xs tracking-[0.3em] font-light">CUSTOMER ITINERARY & INVOICE</p>
        </div>

        {!isConfirmedStep ? (
          <div className="p-6 md:p-10 space-y-10 flex-grow animate-[fadeIn_0.5s_ease-out]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white shadow-md border-l-[6px] border-emerald-600 rounded-xl p-5 hover:shadow-lg transition-all">
                <p className="text-[11px] text-emerald-700 font-black mb-1 uppercase tracking-wider">參加團名</p>
                <p className="font-bold text-xl text-slate-800">{userData.group || "---"}</p>
              </div>
              <div className="bg-white shadow-md border-l-[6px] border-emerald-600 rounded-xl p-5 hover:shadow-lg transition-all">
                <p className="text-[11px] text-emerald-700 font-black mb-1 uppercase tracking-wider">參加日期</p>
                <p className="font-bold text-xl text-slate-800">{userData.date || "---"}</p>
              </div>
              
              <div className="bg-white shadow-md border-l-[6px] border-emerald-600 rounded-xl p-5 md:col-span-2 hover:shadow-lg transition-all">
                <p className="text-[11px] text-emerald-700 font-black mb-1 uppercase tracking-wider">證書寄送地址</p>
                <p className="font-bold text-lg text-slate-800 leading-relaxed">{userData.address || "---"}</p>
                <div className="mt-3 bg-red-50 text-red-600 text-[13px] font-medium p-3 rounded-lg flex items-start gap-2">
                  <span className="mt-0.5 text-sm">⚠️</span>
                  <p>如果地址錯誤，重寄送郵資需自行負擔，若需變更地址請於寄送前盡快告知。</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-800 flex items-center">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>住宿安排確認
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white shadow-md border-l-[6px] border-sky-500 rounded-xl p-5 hover:shadow-lg transition-all">
                  <p className="text-[11px] font-black text-sky-600 uppercase tracking-wider">東京住宿 (房型 / 室友)</p>
                  <div className="text-slate-800 font-bold text-base mt-2 leading-relaxed">{userData.tokyo_room || "尚未分配"}</div>
                </div>
                <div className="bg-white shadow-md border-l-[6px] border-indigo-500 rounded-xl p-5 hover:shadow-lg transition-all">
                  <p className="text-[11px] font-black text-indigo-600 uppercase tracking-wider">河口湖住宿 (房型 / 室友)</p>
                  <div className="text-slate-800 font-bold text-base mt-2 leading-relaxed">{userData.kawaguchiko_room || "尚未分配"}</div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white shadow-md border-l-[6px] border-emerald-400 rounded-xl p-5 hover:shadow-lg transition-all">
                <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">額外加購項目</p>
                {(() => {
                  const itemsStr = userData.extra_item;
                  if (!itemsStr || itemsStr.trim() === "" || itemsStr === "無") {
                    return <div className="text-slate-500 font-bold text-base mt-2">無</div>;
                  }
                  const items = itemsStr.split(/[,，\n]/).filter(item => item.trim() !== "");
                  return (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {items.map((item, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-sm">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                          {item.trim()}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="bg-white shadow-md border-l-[6px] border-orange-400 rounded-xl p-5 hover:shadow-lg transition-all">
                <p className="text-[11px] font-black text-orange-600 uppercase tracking-wider">特殊需求與備註</p>
                <div className="text-slate-800 font-bold text-base mt-2">{userData.requirements || "無特別要求"}</div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-900/10">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between opacity-50"><span>基礎團費</span><span>${fee.toLocaleString()}</span></div>
                <div className="flex justify-between text-red-400"><span>折扣優惠</span><span>-${dis.toLocaleString()}</span></div>
                <div className="flex justify-between text-emerald-400 font-bold"><span>追加費用 (加購)</span><span>+${add.toLocaleString()}</span></div>
                <div className="h-px bg-white/10 my-4"></div>
                <div className="flex justify-between text-lg font-bold"><span className="opacity-50">總計金額</span><span className="text-emerald-50">${total_amount.toLocaleString()}</span></div>
                <div className="flex justify-between opacity-50"><span>已收訂金</span><span>-${dep.toLocaleString()}</span></div>
              </div>
              <div className="flex justify-between items-end mt-10 pt-8 border-t border-white/10">
                <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">待付尾款 Balance</div>
                <div className="text-5xl font-black text-yellow-400 font-mono tracking-tighter">${balance.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <button 
                onClick={() => handleUpdateStatus('Yes')}
                disabled={loading}
                className="w-full py-6 rounded-3xl font-bold text-2xl transition-all shadow-xl active:scale-95 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400"
              >
                {loading ? "處理中..." : "核對無誤，前往匯款"}
              </button>
              
              <button onClick={() => setIsErrorModalOpen(true)} className="w-full py-2 text-slate-400 font-bold text-sm hover:text-red-500 transition-colors">
                資料有誤？點此告知客服修正
              </button>
            </div>
            <p className="text-center text-slate-300 text-[10px] font-black tracking-[0.4em] uppercase pt-6">Secure Service by YueYe Mountainfield</p>
          </div>

        ) : !isDoneStep ? (
          <div className="p-6 md:p-10 space-y-8 flex-grow flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">第二步：請完成尾款匯款</h3>
            
            <div className="w-full bg-slate-50 border-2 border-emerald-100 rounded-[2rem] p-8 text-center space-y-6 shadow-sm">
              <div>
                <p className="text-sm text-slate-500 font-bold mb-2 tracking-widest">待匯款金額</p>
                <p className="text-5xl font-black text-yellow-500 font-mono tracking-tighter shadow-yellow-500/20 drop-shadow-md">
                  ${balance.toLocaleString()}
                </p>
              </div>
              <div className="h-px bg-slate-200 w-full"></div>
              <div>
                <p className="text-sm text-slate-500 font-bold mb-2">銀行代碼</p>
                <p className="text-2xl font-bold text-slate-800">812 (台新銀行)</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold mb-2">匯款帳號</p>
                <p className="text-3xl font-mono font-bold tracking-widest text-emerald-700 bg-white py-3 rounded-xl shadow-sm border border-slate-100 select-all">
                  28881005305110
                </p>
              </div>
            </div>

            <div className="w-full space-y-4 pt-4">
              <label className="block text-center text-slate-700 font-bold">匯款完成後，請輸入您的帳號<span className="text-emerald-600">後五碼</span></label>
              <input 
                type="text" 
                maxLength="5" 
                placeholder="例如: 12345" 
                value={lastFive}
                onChange={(e) => setLastFive(e.target.value.replace(/\D/g, ''))}
                className="w-full p-5 border-2 border-slate-200 rounded-2xl text-center focus:border-emerald-500 outline-none text-3xl font-mono tracking-[0.5em] transition-colors"
              />
              <button 
                onClick={handleSubmitRemittance}
                disabled={loading || lastFive.length !== 5}
                className="w-full py-5 mt-4 rounded-2xl font-bold text-xl transition-all shadow-lg active:scale-95 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none disabled:active:scale-100"
              >
                {loading ? "送出中..." : "確認送出匯款資訊"}
              </button>
            </div>
            <p className="text-center text-slate-300 text-[10px] font-black tracking-[0.4em] uppercase pt-6">Secure Service by YueYe Mountainfield</p>
          </div>

        ) : (
          <div className="p-10 flex-grow flex flex-col items-center justify-center text-center space-y-6 animate-[fadeIn_0.5s_ease-out] min-h-[50vh]">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mb-4 shadow-inner">
              ✓
            </div>
            <h3 className="text-3xl font-bold text-slate-800">匯款資訊已送出</h3>
            <p className="text-slate-500 leading-relaxed max-w-xs">
              感謝您的配合！我們已收到您的匯款帳號後五碼 <br/>
              <span className="font-mono text-emerald-600 font-bold text-lg">{userData.remit_last_five || lastFive}</span> <br/>
              財務部對帳完成後將會主動通知您。
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-8 px-8 py-3 bg-slate-100 text-slate-500 rounded-full font-bold hover:bg-slate-200 transition-colors text-sm"
            >
              返回首頁
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
