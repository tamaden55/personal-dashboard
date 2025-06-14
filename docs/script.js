// ===== TODOリスト機能 =====

// TODOデータ管理
let todos = [];
let currentFilter = 'all';
let todoIdCounter = 1;

// ローカルストレージのキー
const STORAGE_KEY = 'personal-dashboard-todos';

// TODOシステム初期化
function initializeTodoSystem() {
    console.log('📋 Initializing TODO system...');
    
    // ローカルストレージからデータを読み込み
    loadTodosFromStorage();
    
    // 入力フィールドにイベントリスナーを追加
    const todoInput = document.getElementById('todo-input');
    if (todoInput) {
        todoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTodo();
            }
        });
        
        // 入力フィールドのフォーカス
        todoInput.focus();
    }
    
    // 初期表示更新
    renderTodos();
    updateTodoStats();
    updateFilterCounts();
    
    console.log('✅ TODO system initialized');
}

// ローカルストレージからTODOデータを読み込み
function loadTodosFromStorage() {
    try {
        const storedTodos = localStorage.getItem(STORAGE_KEY);
        if (storedTodos) {
            todos = JSON.parse(storedTodos);
            
            // IDカウンターを最大値+1に設定
            if (todos.length > 0) {
                todoIdCounter = Math.max(...todos.map(todo => todo.id)) + 1;
            }
            
            console.log(`📂 Loaded ${todos.length} todos from storage`);
        } else {
            console.log('📂 No stored todos found, starting fresh');
        }
    } catch (error) {
        console.error('❌ Failed to load todos from storage:', error);
        todos = [];
    }
}

// TODOデータをローカルストレージに保存
function saveTodosToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        console.log(`💾 Saved ${todos.length} todos to storage`);
    } catch (error) {
        console.error('❌ Failed to save todos to storage:', error);
    }
}

// 新しいTODOを追加
function addTodo() {
    const todoInput = document.getElementById('todo-input');
    const todoText = todoInput.value.trim();
    
    if (todoText === '') {
        // 入力フィールドを振動させる
        todoInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            todoInput.style.animation = '';
        }, 500);
        return;
    }
    
    // 新しいTODOオブジェクトを作成
    const newTodo = {
        id: todoIdCounter++,
        text: todoText,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    
    // 配列の先頭に追加（新しいものが上に表示される）
    todos.unshift(newTodo);
    
    // ローカルストレージに保存
    saveTodosToStorage();
    
    // 入力フィールドをクリア
    todoInput.value = '';
    
    // 表示を更新
    renderTodos();
    updateTodoStats();
    updateFilterCounts();
    
    // 成功のフィードバック
    console.log(`✅ Added new todo: "${todoText}"`);
    
    // 追加アニメーション効果
    setTimeout(() => {
        const firstTodoItem = document.querySelector('.todo-item');
        if (firstTodoItem) {
            firstTodoItem.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(56, 142, 60, 0.2) 100%)';
            setTimeout(() => {
                firstTodoItem.style.background = '';
            }, 1000);
        }
    }, 100);
}

// TODOの完了状態を切り替え
function toggleTodo(todoId) {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date().toISOString() : null;
    
    // ローカルストレージに保存
    saveTodosToStorage();
    
    // 表示を更新
    renderTodos();
    updateTodoStats();
    updateFilterCounts();
    
    console.log(`🔄 Toggled todo ${todoId}: ${todo.completed ? 'completed' : 'active'}`);
}

// TODOを削除
function deleteTodo(todoId) {
    const todoIndex = todos.findIndex(t => t.id === todoId);
    if (todoIndex === -1) return;
    
    const deletedTodo = todos[todoIndex];
    
    // アニメーション効果
    const todoElement = document.querySelector(`[data-todo-id="${todoId}"]`);
    if (todoElement) {
        todoElement.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => {
            // 配列から削除
            todos.splice(todoIndex, 1);
            
            // ローカルストレージに保存
            saveTodosToStorage();
            
            // 表示を更新
            renderTodos();
            updateTodoStats();
            updateFilterCounts();
            
            console.log(`🗑️ Deleted todo: "${deletedTodo.text}"`);
        }, 300);
    } else {
        // 即座に削除
        todos.splice(todoIndex, 1);
        saveTodosToStorage();
        renderTodos();
        updateTodoStats();
        updateFilterCounts();
    }
}

// 完了済みTODOを一括削除
function clearCompletedTodos() {
    const completedCount = todos.filter(todo => todo.completed).length;
    
    if (completedCount === 0) {
        return;
    }
    
    // 確認ダイアログ
    if (confirm(`完了済みの${completedCount}件のタスクを削除しますか？`)) {
        todos = todos.filter(todo => !todo.completed);
        
        // ローカルストレージに保存
        saveTodosToStorage();
        
        // 表示を更新
        renderTodos();
        updateTodoStats();
        updateFilterCounts();
        
        console.log(`🧹 Cleared ${completedCount} completed todos`);
    }
}

// フィルターを適用
function filterTodos(filter) {
    currentFilter = filter;
    
    // フィルターボタンの状態を更新
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    // 表示を更新
    renderTodos();
    
    console.log(`🔍 Applied filter: ${filter}`);
}

// TODOリストをレンダリング
function renderTodos() {
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('todo-empty-state');
    
    if (!todoList || !emptyState) return;
    
    // フィルタリングされたTODOを取得
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        // 空状態を表示
        todoList.innerHTML = '';
        emptyState.classList.remove('hidden');
        
        // 空状態のメッセージを現在のフィルターに応じて調整
        const emptyTitle = emptyState.querySelector('.empty-title');
        const emptySubtitle = emptyState.querySelector('.empty-subtitle');
        
        switch (currentFilter) {
            case 'active':
                emptyTitle.textContent = '未完了のタスクがありません';
                emptySubtitle.textContent = 'すべてのタスクが完了しています！';
                break;
            case 'completed':
                emptyTitle.textContent = '完了済みのタスクがありません';
                emptySubtitle.textContent = 'タスクを完了してください';
                break;
            default:
                emptyTitle.textContent = 'タスクがありません';
                emptySubtitle.textContent = '上のフォームから新しいタスクを追加してください';
        }
    } else {
        // TODOリストを表示
        emptyState.classList.add('hidden');
        
        todoList.innerHTML = filteredTodos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-todo-id="${todo.id}">
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                     onclick="toggleTodo(${todo.id})"></div>
                <div class="todo-text">${escapeHtml(todo.text)}</div>
                <button class="todo-delete" onclick="deleteTodo(${todo.id})" title="削除">
                    🗑️
                </button>
            </div>
        `).join('');
    }
}

// 現在のフィルターに基づいてTODOをフィルタリング
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// 統計情報を更新
function updateTodoStats() {
    const completedCount = todos.filter(todo => todo.completed).length;
    const remainingCount = todos.filter(todo => !todo.completed).length;
    
    // 統計数値を更新
    const completedStats = document.getElementById('completed-stats');
    const remainingStats = document.getElementById('remaining-stats');
    
    if (completedStats) completedStats.textContent = completedCount;
    if (remainingStats) remainingStats.textContent = remainingCount;
    
    // 完了済み削除ボタンの状態を更新
    const clearBtn = document.getElementById('clear-completed-btn');
    if (clearBtn) {
        clearBtn.disabled = completedCount === 0;
        clearBtn.style.opacity = completedCount === 0 ? '0.4' : '1';
    }
}

// フィルターカウントを更新
function updateFilterCounts() {
    const allCount = todos.length;
    const activeCount = todos.filter(todo => !todo.completed).length;
    const completedCount = todos.filter(todo => todo.completed).length;
    
    // 各フィルターボタンのカウントを更新
    const allCountElement = document.getElementById('all-count');
    const activeCountElement = document.getElementById('active-count');
    const completedCountElement = document.getElementById('completed-count');
    
    if (allCountElement) allCountElement.textContent = allCount;
    if (activeCountElement) activeCountElement.textContent = activeCount;
    if (completedCountElement) completedCountElement.textContent = completedCount;
}

// HTMLエスケープ関数（XSS対策）
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// アニメーション用CSSの追加
const todoAnimationCSS = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

@keyframes slideOut {
    0% {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
    100% {
        opacity: 0;
        transform: translateX(-100%) scale(0.8);
    }
}
`;

// ===== 時刻表示機能 =====

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

// 複数都市の天気データ管理（フォールバック用）
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

// 気象庁API設定
const JMA_CONFIG = {
    BASE_URL: 'https://www.jma.go.jp/bosai/forecast/data/forecast',
    AREAS: {
        tokyo: '130000',    // 東京都
        kochi: '390000',    // 高知県  
        naha: '471000',     // 沖縄本島地方
        sapporo: '016000'   // 石狩・空知・後志地方（札幌含む）
    }
};

// 気象庁天気コード→内部表現マッピング
const JMA_WEATHER_CODES = {
    // 晴れ系（100番台）
    '100': { condition: 'clear', description: '晴れ', emoji: '☀️' },
    '101': { condition: 'partlysunny', description: '晴れ時々曇り', emoji: '🌤️' },
    '110': { condition: 'partlysunny', description: '晴れのち曇り', emoji: '🌤️' },
    '200': { condition: 'clouds', description: '曇り', emoji: '☁️' },
    '201': { condition: 'partlycloudy', description: '曇り時々晴れ', emoji: '⛅' },
    '300': { condition: 'rain', description: '雨', emoji: '🌧️' },
    '400': { condition: 'snow', description: '雪', emoji: '❄️' }
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

// 気象庁APIからデータ取得
async function fetchJMAWeatherData(cityId) {
    const areaCode = JMA_CONFIG.AREAS[cityId];
    if (!areaCode) {
        console.error('Unknown city for JMA:', cityId);
        return null;
    }

    try {
        const jmaUrl = `${JMA_CONFIG.BASE_URL}/${areaCode}.json`;
        
        console.log(`📡 Fetching JMA weather for ${cityId} (${areaCode})...`);
        const response = await fetch(jmaUrl);
        
        if (!response.ok) {
            throw new Error(`JMA API error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ JMA data received for ${cityId}:`, data);
        
        return parseJMAWeatherData(data, cityId);
        
    } catch (error) {
        console.error(`❌ Failed to fetch JMA weather for ${cityId}:`, error);
        return null;
    }
}

// 気象庁データの解析・変換
function parseJMAWeatherData(jmaData, cityId) {
    try {
        if (!Array.isArray(jmaData) || jmaData.length === 0) {
            console.error('Invalid JMA data structure');
            return null;
        }
        
        const forecasts = [];
        const cityName = getCityNameJapanese(cityId);
        
        // 主要な予報データを取得
        const mainForecast = jmaData[0];
        if (!mainForecast?.timeSeries?.[0]) {
            console.error('No main forecast data found');
            return null;
        }
        
        const weatherSeries = mainForecast.timeSeries[0];
        const area = weatherSeries.areas[0];
        
        console.log('JMA weather codes:', area.weatherCodes);
        console.log('JMA weather descriptions:', area.weathers);
        
        // 気温データを取得（気温データは別のtimeSeriesにある）
        let tempData = null;
        if (mainForecast.timeSeries[1] && mainForecast.timeSeries[1].areas[0]) {
            tempData = mainForecast.timeSeries[1].areas[0];
            console.log('JMA temperature data:', tempData);
        }
        
        // 最大3日分の予報を生成
        const maxDays = Math.min(3, area.weatherCodes?.length || 0);
        
        for (let i = 0; i < maxDays; i++) {
            const weatherCode = area.weatherCodes[i];
            const weatherText = area.weathers[i];
            
            // 天気コードから情報を取得
            const weatherInfo = JMA_WEATHER_CODES[weatherCode] || {
                condition: 'default',
                description: weatherText || '不明',
                emoji: '🌤️'
            };
            
            // 実際の気温データまたはフォールバック
            let highTemp, lowTemp;
            
            if (tempData && tempData.tempsMax && tempData.tempsMin) {
                // 実際の気温データを使用
                highTemp = parseInt(tempData.tempsMax[i]) || null;
                lowTemp = parseInt(tempData.tempsMin[i]) || null;
                console.log(`Day ${i}: High=${highTemp}°C, Low=${lowTemp}°C`);
            }
            
            // 気温データがない場合はフォールバック
            if (!highTemp || !lowTemp) {
                const baseTempHigh = { tokyo: 25, kochi: 27, naha: 28, sapporo: 15 }[cityId] || 22;
                const baseTempLow = { tokyo: 18, kochi: 21, naha: 24, sapporo: 8 }[cityId] || 15;
                highTemp = baseTempHigh - i;
                lowTemp = baseTempLow - i;
                console.log(`Day ${i}: Using fallback temps - High=${highTemp}°C, Low=${lowTemp}°C`);
            }
            
            forecasts.push({
                day: ['today', 'tomorrow', 'dayafter'][i],
                condition: weatherInfo.condition,
                description: weatherInfo.description,
                emoji: weatherInfo.emoji,
                high: highTemp,
                low: lowTemp,
                humidity: 60 + (Math.random() * 20 - 10),
                wind: (Math.random() * 3 + 1).toFixed(1),
                source: 'JMA',
                code: weatherCode
            });
        }
        
        console.log(`✅ Parsed JMA data for ${cityName}:`, forecasts);
        
        return {
            name: cityName,
            forecasts: forecasts,
            source: 'JMA'
        };
        
    } catch (error) {
        console.error('Failed to parse JMA data:', error);
        return null;
    }
}

// 都市名の日本語取得
function getCityNameJapanese(cityId) {
    const names = {
        tokyo: '東京',
        kochi: '高知', 
        naha: '那覇',
        sapporo: '札幌'
    };
    return names[cityId] || cityId;
}

// フォールバック用模擬データ生成
function generateFallbackWeatherData(cityId) {
    const baseData = cityWeatherData[cityId];
    if (!baseData) return null;
    
    return {
        name: baseData.name,
        forecasts: baseData.forecasts.map(forecast => ({
            ...forecast,
            source: 'fallback'
        })),
        source: 'fallback'
    };
}

// 地域特別対応
function applyRegionalCustomization(cityId, weatherData) {
    weatherData.forecasts.forEach(forecast => {
        // 那覇の晴れは🌺に変更
        if (cityId === 'naha' && forecast.condition === 'clear') {
            forecast.emoji = '🌺';
        }
        
        // 高知の晴れ時々曇りは🌤️に統一
        if (cityId === 'kochi' && forecast.condition === 'partlysunny') {
            forecast.emoji = '🌤️';
        }
        
        // 札幌の雪系は❄️に統一
        if (cityId === 'sapporo' && forecast.condition === 'snow') {
            forecast.emoji = '❄️';
        }
    });
}

// 天気表示更新
function updateCityWeatherDisplay(cityId, weatherData) {
    // タブの温度更新
    const tabTemp = document.getElementById(`${cityId}-tab-temp`);
    if (tabTemp && weatherData.forecasts.length > 0) {
        tabTemp.textContent = `${weatherData.forecasts[0].high}°`;
    }
    
    // 各日の天気更新
    weatherData.forecasts.forEach((forecast, index) => {
        const dayNames = ['today', 'tomorrow', 'dayafter'];
        const dayName = dayNames[index];
        
        // DOM要素の更新
        const dayElement = document.getElementById(`${cityId}-${dayName}-day`);
        const iconElement = document.getElementById(`${cityId}-${dayName}-icon`);
        const highElement = document.getElementById(`${cityId}-${dayName}-high`);
        const lowElement = document.getElementById(`${cityId}-${dayName}-low`);
        const descElement = document.getElementById(`${cityId}-${dayName}-desc`);
        const humidityElement = document.getElementById(`${cityId}-${dayName}-humidity`);
        const windElement = document.getElementById(`${cityId}-${dayName}-wind`);
        
        if (dayElement) dayElement.textContent = getDateString(index);
        if (iconElement) iconElement.textContent = forecast.emoji;
        if (highElement) highElement.textContent = `${forecast.high}°`;
        if (lowElement) lowElement.textContent = `${forecast.low}°`;
        if (descElement) descElement.textContent = forecast.description;
        if (humidityElement) humidityElement.textContent = `${Math.round(forecast.humidity)}%`;
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
        const source = weatherData.source === 'JMA' ? '気象庁' : 'フォールバック';
        updateElement.textContent = `最終更新: ${updateTime} (${source})`;
    }
}

// 特定都市の気象庁天気更新
async function updateCityWithJMAWeather(cityId) {
    const jmaData = await fetchJMAWeatherData(cityId);
    
    if (jmaData && jmaData.forecasts && jmaData.forecasts.length > 0) {
        // 特別な地域対応
        applyRegionalCustomization(cityId, jmaData);
        
        // 表示更新
        updateCityWeatherDisplay(cityId, jmaData);
        console.log(`✅ JMA weather updated for ${jmaData.name}`);
        return true;
    } else {
        // フォールバック: 模擬データを使用
        console.log(`⚠️ JMA data failed, using fallback for ${cityId}`);
        const fallbackData = generateFallbackWeatherData(cityId);
        updateCityWeatherDisplay(cityId, fallbackData);
        return false;
    }
}

// 全都市の気象庁天気更新
async function updateAllCitiesJMAWeather() {
    console.log('🌤️ Updating JMA weather data for all cities...');
    
    const cityIds = Object.keys(JMA_CONFIG.AREAS);
    const promises = cityIds.map(cityId => updateCityWithJMAWeather(cityId));
    
    const results = await Promise.all(promises);
    const successCount = results.filter(success => success).length;
    
    console.log(`✅ JMA weather update complete: ${successCount}/${results.length} cities successful`);
    
    // 成功率をコンソールに表示
    if (successCount === results.length) {
        console.log('🎉 All cities updated with real JMA data!');
    } else if (successCount > 0) {
        console.log(`⚠️ Partial success: ${successCount} cities with real data, ${results.length - successCount} with fallback`);
    } else {
        console.log('❌ All cities using fallback data');
    }
}

// 気象庁天気更新システム開始
function startJMAWeatherUpdates() {
    console.log('🌐 Starting JMA (Japan Meteorological Agency) weather updates...');
    
    // 初回実行
    updateAllCitiesJMAWeather();
    
    // 1時間ごとに更新（気象庁データは1日数回更新）
    setInterval(() => {
        updateAllCitiesJMAWeather();
    }, 3600000); // 1時間 = 3,600,000ms
}

// 手動更新用
async function refreshJMAWeatherData() {
    console.log('🔄 Manual refresh triggered...');
    await updateAllCitiesJMAWeather();
}

// CSS を動的に追加
if (!document.getElementById('todo-animations')) {
    const style = document.createElement('style');
    style.id = 'todo-animations';
    style.textContent = todoAnimationCSS;
    document.head.appendChild(style);
}

// デモ用のサンプルTODOを追加する関数（開発用）
function addSampleTodos() {
    const sampleTodos = [
        'Personal Dashboardを完成させる',
        '気象庁APIの動作確認',
        'GitHub Pagesでの公開確認',
        'レスポンシブデザインのテスト',
        'TODOリスト機能のテスト'
    ];
    
    sampleTodos.forEach((text, index) => {
        const todo = {
            id: todoIdCounter++,
            text: text,
            completed: index === 2, // 3番目のタスクを完了済みに
            createdAt: new Date(Date.now() - (index * 60000)).toISOString(), // 時間をずらす
            completedAt: index === 2 ? new Date().toISOString() : null
        };
        todos.push(todo);
    });
    
    saveTodosToStorage();
    renderTodos();
    updateTodoStats();
    updateFilterCounts();
    
    console.log('📝 Added sample todos for testing');
}

// 開発用：ストレージをクリアする関数
function clearAllTodos() {
    if (confirm('すべてのTODOデータを削除しますか？この操作は取り消せません。')) {
        todos = [];
        saveTodosToStorage();
        renderTodos();
        updateTodoStats();
        updateFilterCounts();
        console.log('🧹 All todos cleared');
    }
}

// エクスポート/インポート機能（将来の拡張用）
function exportTodos() {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personal-dashboard-todos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('📤 Todos exported to file');
}

function importTodos(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedTodos = JSON.parse(e.target.result);
            if (Array.isArray(importedTodos)) {
                todos = importedTodos;
                saveTodosToStorage();
                renderTodos();
                updateTodoStats();
                updateFilterCounts();
                console.log(`📥 Imported ${todos.length} todos from file`);
            } else {
                throw new Error('Invalid file format');
            }
        } catch (error) {
            console.error('❌ Failed to import todos:', error);
            alert('TODOファイルの読み込みに失敗しました。正しいファイルを選択してください。');
        }
    };
    reader.readAsText(file);
}

// 統計情報の詳細計算
function getTodoStatistics() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const stats = {
        total: todos.length,
        completed: todos.filter(todo => todo.completed).length,
        active: todos.filter(todo => !todo.completed).length,
        completedToday: todos.filter(todo => {
            if (!todo.completedAt) return false;
            const completedDate = new Date(todo.completedAt);
            return completedDate >= today;
        }).length,
        createdToday: todos.filter(todo => {
            const createdDate = new Date(todo.createdAt);
            return createdDate >= today;
        }).length,
        completionRate: todos.length > 0 ? Math.round((todos.filter(todo => todo.completed).length / todos.length) * 100) : 0
    };
    
    return stats;
}

// コンソールに統計情報を表示（デバッグ用）
function showTodoStats() {
    const stats = getTodoStatistics();
    console.log('📊 TODO Statistics:', stats);
    return stats;
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', function() {
    updateTime(); // 最初の表示
    setInterval(updateTime, 1000); // 1秒ごとに更新
    
    // 気象庁API天気更新を開始
    startJMAWeatherUpdates();
    
    // TODOシステムを初期化
    initializeTodoSystem();
    
    console.log('Personal Dashboard（気象庁API + TODO版）初期化完了');
});
