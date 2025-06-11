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

// 複数都市の天気データ管理
const cityWeatherData = {
    tokyo: {
        name: '東京',
        forecasts: [
            { day: 'today', condition: 'clear', high: 25, low: 18, humidity: 60, wind: 3.2 },
            { day: 'tomorrow', condition: 'clouds', high: 22, low: 16, humidity: 70, wind: 2.8 },
            { day: 'dayafter', condition: 'rain', high: 19, low: 14, humidity: 85, wind: 4.1 }
        ]
    },
    kochi: {
        name: '高知',
        forecasts: [
            { day: 'today', condition: 'clear', high: 27, low: 21, humidity: 65, wind: 2.5 },
            { day: 'tomorrow', condition: 'rain', high: 24, low: 19, humidity: 80, wind: 3.5 },
            { day: 'dayafter', condition: 'clear', high: 26, low: 20, humidity: 70, wind: 2.0 }
        ]
    },
    naha: {
        name: '那覇',
        forecasts: [
            { day: 'today', condition: 'clear', high: 28, low: 24, humidity: 75, wind: 4.0 },
            { day: 'tomorrow', condition: 'clouds', high: 27, low: 23, humidity: 78, wind: 3.8 },
            { day: 'dayafter', condition: 'drizzle', high: 26, low: 22, humidity: 82, wind: 4.5 }
        ]
    },
    sapporo: {
        name: '札幌',
        forecasts: [
            { day: 'today', condition: 'mist', high: 15, low: 8, humidity: 90, wind: 1.5 },
            { day: 'tomorrow', condition: 'clouds', high: 18, low: 11, humidity: 75, wind: 2.2 },
            { day: 'dayafter', condition: 'clear', high: 20, low: 12, humidity: 65, wind: 1.8 }
        ]
    }
};

// 拡張された天気アイコンマッピング
const extendedWeatherMap = {
    clear: { emoji: '☀️', description: '晴れ' },
    clouds: { emoji: '☁️', description: '曇り' },
    rain: { emoji: '🌧️', description: '雨' },
    snow: { emoji: '❄️', description: '雪' },
    thunderstorm: { emoji: '⛈️', description: '雷雨' },
    drizzle: { emoji: '🌦️', description: '小雨' },
    mist: { emoji: '🌫️', description: '霧' },
    partlycloudy: { emoji: '⛅', description: '曇り時々晴れ'},
    partlysunny: { emoji: '🌤️', description: '晴れ時々曇り'},
    tropical: { emoji: '🌺', description: '晴れ'},
    default: { emoji: '🌤️', description: '--' }
};

// 現在選択中の都市
let currentCity = 'tokyo';

// 都市切り替え関数
function showCity(cityId) {
    // 前の都市を非表示
    document.querySelectorAll('.city-weather').forEach(city => {
        city.classList.remove('active');
    });
    
    // タブの状態を更新
    document.querySelectorAll('.city-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 新しい都市を表示
    document.getElementById(cityId).classList.add('active');
    document.querySelector(`[data-city="${cityId}"]`).classList.add('active');
    
    currentCity = cityId;
    
    // アニメーション効果
    const activeWeather = document.getElementById(cityId);
    activeWeather.style.opacity = '0';
    setTimeout(() => {
        activeWeather.style.opacity = '1';
    }, 100);
}

// 日付生成関数
function getDateString(dayOffset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    
    return `${month}月${day}日(${weekday})`;
}

// 時間帯による動的天気データ生成
function generateDynamicWeatherData(baseData) {
    const hour = new Date().getHours();
    const dynamicData = JSON.parse(JSON.stringify(baseData)); // Deep copy
    
    // 時間帯による温度調整
    const tempAdjustment = {
        morning: (hour >= 6 && hour < 12) ? -2 : 0,
        afternoon: (hour >= 12 && hour < 18) ? 2 : 0,
        evening: (hour >= 18 && hour < 24) ? -1 : 0,
        night: (hour >= 0 && hour < 6) ? -3 : 0
    };
    
    const adjustment = Object.values(tempAdjustment).reduce((sum, val) => sum + val, 0);
    
    Object.keys(dynamicData).forEach(city => {
        dynamicData[city].forecasts.forEach(forecast => {
            // 温度調整
            forecast.high += adjustment;
            forecast.low += adjustment;
            
            // ランダム要素の追加
            forecast.wind = (Math.random() * 3 + 1).toFixed(1);
            forecast.humidity += Math.floor(Math.random() * 10 - 5); // ±5%
            forecast.humidity = Math.max(30, Math.min(95, forecast.humidity)); // 30-95%の範囲
        });
    });
    
    return dynamicData;
}

// 特定都市の天気更新
function updateCityWeather(cityId, weatherData) {
    const cityData = weatherData[cityId];
    if (!cityData) return;
    
    // タブの温度更新
    const tabTemp = document.getElementById(`${cityId}-tab-temp`);
    if (tabTemp) {
        tabTemp.textContent = `${cityData.forecasts[0].high}°`;
    }
    
    // 各日の天気更新
    cityData.forecasts.forEach((forecast, index) => {
        const dayNames = ['today', 'tomorrow', 'dayafter'];
        const dayName = dayNames[index];
        
        // 天気アイコンと説明
        const weather = extendedWeatherMap[forecast.condition] || extendedWeatherMap.default;
        
        // 那覇の晴れは🌺、高知の晴れ時々曇りは🌤️に特別対応
        if (cityId === 'naha' && forecast.condition === 'clear') {
            weather.emoji = '🌺';
        } else if (cityId === 'kochi' && forecast.day === 'today') {
            weather.emoji = '🌤️';
            weather.description = '晴れ時々曇り';
        } else if (cityId === 'naha' && forecast.condition === 'clouds') {
            weather.emoji = '⛅';
            weather.description = '曇り時々晴れ';
        }
        
        // DOM要素の更新
        const dayElement = document.getElementById(`${cityId}-${dayName}-day`);
        const iconElement = document.getElementById(`${cityId}-${dayName}-icon`);
        const highElement = document.getElementById(`${cityId}-${dayName}-high`);
        const lowElement = document.getElementById(`${cityId}-${dayName}-low`);
        const descElement = document.getElementById(`${cityId}-${dayName}-desc`);
        const humidityElement = document.getElementById(`${cityId}-${dayName}-humidity`);
        const windElement = document.getElementById(`${cityId}-${dayName}-wind`);
        
        if (dayElement) dayElement.textContent = getDateString(index);
        if (iconElement) iconElement.textContent = weather.emoji;
        if (highElement) highElement.textContent = `${forecast.high}°`;
        if (lowElement) lowElement.textContent = `${forecast.low}°`;
        if (descElement) descElement.textContent = weather.description;
        if (humidityElement) humidityElement.textContent = `${forecast.humidity}%`;
        if (windElement) windElement.textContent = `${forecast.wind}m/s`;
    });
    
    // 更新時刻
    const now = new Date();
    const updateTime = now.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const updateElement = document.getElementById(`${cityId}-update-time`);
    if (updateElement) {
        updateElement.textContent = `最終更新: ${updateTime}`;
    }
}

// 全都市の天気更新
function updateAllCitiesWeather() {
    const dynamicData = generateDynamicWeatherData(cityWeatherData);
    
    Object.keys(dynamicData).forEach(cityId => {
        updateCityWeather(cityId, dynamicData);
    });
    
    console.log('全都市の天気情報を更新しました');
}

// 定期更新開始
function startMultiCityWeatherUpdates() {
    // 初回実行
    updateAllCitiesWeather();
    
    // 15分ごとに更新
    setInterval(() => {
        updateAllCitiesWeather();
    }, 900000); // 15分 = 900,000ms
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', function() {
    updateTime(); // 最初の表示
    setInterval(updateTime, 1000); // 1秒ごとに更新
    
    // 複数都市天気更新を開始
    startMultiCityWeatherUpdates();
    
    console.log('Personal Dashboard（複数都市版）初期化完了');
});