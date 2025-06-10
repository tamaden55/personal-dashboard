// 現在時刻を表示する関数
function updateTime() {
    const now = new Date();
    
    // 時刻を見やすい形式にフォーマット
    const timeString = now.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'short'
    });
    
    // HTMLの要素に時刻を表示
    document.getElementById('current-time').textContent = timeString;
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', function() {
    updateTime(); // 最初の表示
    setInterval(updateTime, 1000); // 1秒ごとに更新
});