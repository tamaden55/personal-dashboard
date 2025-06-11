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

// 天気アイコンと説明のマッピング
const weatherMap = {
    clear: { emoji: '☀️', description: '晴れ' },
    clouds: { emoji: '☁️', description: '曇り' },
    rain: { emoji: '🌧️', description: '雨' },
    snow: { emoji: '❄️', description: '雪' },
    thunderstorm: { emoji: '⛈️', description: '雷雨' },
    drizzle: { emoji: '🌦️', description: '小雨' },
    mist: { emoji: '🌫️', description: '霧' },
    default: { emoji: '🌤️', description: '--' }
};

// 静的な天気データ（開発用）
const mockWeatherData = {
    location: '東京',
    temperature: 25,
    description: 'clear',
    humidity: 60,
    windSpeed: 3.2,
    pressure: 1013
};

// 天気情報を更新する関数
function updateWeather(weatherData = mockWeatherData) {
    try {
        // 位置情報
        document.getElementById('location').textContent = weatherData.location;
        
        // 気温
        document.getElementById('temperature').textContent = weatherData.temperature;
        
        // 天気アイコンと説明
        const weather = weatherMap[weatherData.description] || weatherMap.default;
        document.getElementById('weather-emoji').textContent = weather.emoji;
        document.getElementById('weather-description').textContent = weather.description;
        
        // 詳細情報
        document.getElementById('humidity').textContent = `${weatherData.humidity}%`;
        document.getElementById('wind-speed').textContent = `${weatherData.windSpeed} m/s`;
        document.getElementById('pressure').textContent = `${weatherData.pressure} hPa`;
        
        // 更新時刻
        const now = new Date();
        const updateTime = now.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('weather-update-time').textContent = `最終更新: ${updateTime}`;
        
        console.log('天気情報を更新しました:', weatherData);
        
    } catch (error) {
        console.error('天気情報の更新でエラーが発生しました:', error);
        showWeatherError();
    }
}

// エラー表示用関数
function showWeatherError() {
    document.getElementById('weather-emoji').textContent = '❌';
    document.getElementById('weather-description').textContent = 'データ取得エラー';
    document.getElementById('temperature').textContent = '--';
    document.getElementById('humidity').textContent = '--%';
    document.getElementById('wind-speed').textContent = '-- m/s';
    document.getElementById('pressure').textContent = '-- hPa';
}

// 時間帯に応じた天気データの変更（デモ用）
function getTimeBasedWeather() {
    const hour = new Date().getHours();
    const weatherPatterns = [
        { condition: 'clear', temp: 25, humidity: 60 },      // 晴れ
        { condition: 'clouds', temp: 22, humidity: 70 },     // 曇り
        { condition: 'rain', temp: 18, humidity: 85 },       // 雨
        { condition: 'mist', temp: 20, humidity: 90 }        // 霧
    ];
    
    // 時間帯によってパターンを変更
    const patternIndex = Math.floor(hour / 6) % weatherPatterns.length;
    const pattern = weatherPatterns[patternIndex];
    
    return {
        location: '東京',
        temperature: pattern.temp,
        description: pattern.condition,
        humidity: pattern.humidity,
        windSpeed: (Math.random() * 5 + 1).toFixed(1), // 1-6 m/s
        pressure: Math.floor(Math.random() * 40 + 1000) // 1000-1040 hPa
    };
}

// 天気データの定期更新（10分ごと）
function startWeatherUpdates() {
    // 初回実行
    updateWeather(getTimeBasedWeather());
    
    // 10分ごとに更新
    setInterval(() => {
        updateWeather(getTimeBasedWeather());
    }, 600000); // 10分 = 600,000ms
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', function() {
    updateTime(); // 最初の表示
    setInterval(updateTime, 1000); // 1秒ごとに更新
    
    // 天気更新を開始
    startWeatherUpdates();
    
    console.log('Personal Dashboard初期化完了');
});