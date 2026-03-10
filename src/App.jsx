import React, { useState } from 'react';

// 使用 cast_numbers=true 讓 SheetDB 自動嘗試轉換數字格式
const API_URL = "https://sheetdb.io/api/v1/ihm71us1n06fy?cast_numbers=true";

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
      const response = await fetch(`${API_URL}&search?phone=${phone}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setUserData(data[0]);
      } else {
        alert("找不到此資料，請確認號碼是否正確或聯繫客服。");
      }
    } catch (error) {
      alert("連線失敗，請檢查網路。");
    }
    setLoading(false);
  };

  // 2. 確認或回報錯誤邏輯
  const handleUpdateStatus = async (status) => {
    const confirmMsg = status === 'Yes' ? "確認所有行程與帳務資料正確無誤？" : "確定要回報資料有誤並請客服修正？";
    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(`${API_URL.split('?')[0]}/phone/${userData.phone}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { confirmed: status } })
      });
      if (response.ok) {
        setConfirmed(true);
        alert(status === 'Yes' ? "感謝您的確認！" : "已收到您的修正請求，我們將盡快聯繫您。");
      }
    } catch (error) {
      alert("更新失敗，請聯繫岳野登山管理員。");
    }
  };

  // --- 登入畫面 ---
  if (!userData) {
    return (
      <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4" 
           style={{backgroundImage: "url('
