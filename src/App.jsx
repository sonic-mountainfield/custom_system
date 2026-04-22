<button id="reportErrorBtn" class="primary-btn">回報錯誤</button>

<div id="errorModal" class="modal-overlay">
  <div class="modal-content">
    <span class="close-btn">&times;</span>
    
    <h2>錯誤回報</h2>
    <p>請詳細描述您遇到的問題，這將幫助我們更快修復它：</p>
    
    <form id="errorForm">
      <textarea 
        id="errorDetail" 
        rows="5" 
        placeholder="例如：我在結帳頁面點擊送出後，畫面就卡住了..." 
        required></textarea>
      
      <div class="form-actions">
        <button type="button" id="cancelBtn" class="cancel-btn">取消</button>
        <button type="submit" class="submit-btn">送出回報</button>
      </div>
    </form>
  </div>
</div>
