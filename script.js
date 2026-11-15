// GAME SETTINGS
const START_MONEY = 50000;
const DAY_NAMES = ["月", "火", "水", "木", "金", "土", "日"];
let money, time, currentDay, pool;

// DAILY TASKS
const tasks = [
    ["食料品の買い出し", 1500, 1],
    ["交通費", 500, 1],
    ["勉強・仕事", 0, 2]
];

// EVENTS
const events = [
    ["スーパーの割引", "いつものスーパーで食料品が安くなっている。",
        [["まとめ買いする", 1000, -1], ["必要な分だけ買う", 0, 0], ["今日は買わない", 0, 0]]],
    ["アルバイトの誘い", "急なアルバイトの依頼が来た。短時間でも収入になる。",
        [["引き受ける", 5000, -3], ["断る", 0, 0], ["短時間だけ働く", 2500, -1]]],
    ["財布を拾った", "道で財布を拾った。中には持ち主の連絡先がある。",
        [["交番に届ける", 0, -1], ["そのままにする", 0, 0], ["近くの人に声をかける", 0, -1]]],
    ["本の整理", "読まなくなった本が何冊かある。売れば少しお金になりそう。",
        [["古本屋で売る", 2000, -1], ["残しておく", 0, 0], ["友人に譲る", 0, -1]]],
    ["友人からのお誘い", "友人からカフェに誘われた。久しぶりに会いたい気もする。",
        [["カフェに行く", -1500, -2], ["別の日にする", 0, 0], ["短時間だけ会う", -500, -1]]],
    ["文房具の購入", "勉強に使う文房具が足りなくなってきた。",
        [["新しいものを買う", -2500, -1], ["必要なものだけ買う", -1000, -1], ["今あるもので工夫する", 0, 0]]],
    ["近所のお手伝い", "近所の人から簡単なお手伝いを頼まれた。",
        [["引き受ける", 2500, -2], ["断る", 0, 0], ["短時間だけ手伝う", 1000, -1]]]
];

// RANKS (no-spend baseline = 50,000 - 7 x 2,000 = ¥36,000, max is about ¥46,500)
const ranks = [
    [44000, "S", "お金も時間も上手に使えました。"],
    [40000, "A", "かなり堅実です。"],
    [36000, "B", "基本は守れています。"],
    [0, "C", "使いすぎに注意。次は優先順位を考えよう。"]
];

const $ = id => document.getElementById(id);
const yen = n => "¥" + n.toLocaleString("ja-JP");
const signed = n => (n >= 0 ? "+" : "-") + yen(Math.abs(n));

// UPDATE DASHBOARD
function updateDashboard() {
    $("money").textContent = money.toLocaleString("ja-JP");
    $("time").textContent = time;
    $("day").textContent = DAY_NAMES[Math.min(currentDay, 6)] + "曜日";
    $("days").innerHTML = DAY_NAMES.map((d, i) =>
        `<div class="day ${i < currentDay ? "completed" : i === currentDay ? "active" : ""}">${d}</div>`
    ).join("");
}

// START DAY
function startDay() {
    time = 8;
    $("task-list").innerHTML = "";

    tasks.forEach(task => {
        money -= task[1];
        time -= task[2];
        const item = document.createElement("p");
        item.innerHTML = `<span>${task[0]}</span><span>-${yen(task[1])} / ${task[2]}時間</span>`;
        $("task-list").appendChild(item);
    });

    updateDashboard();
    $("event-title").textContent = "";
    $("event-description").textContent = "今日は何が起こるかな？";
    $("event-choices").innerHTML = "";
    $("event-button").disabled = false;
    $("next-day").disabled = true;
    $("next-day").textContent = currentDay === 6 ? "結果を見る →" : "明日へ進む →";
}

// SHOW RANDOM EVENT
function showEvent() {
    const event = pool.pop();
    $("event-title").textContent = event[0];
    $("event-description").textContent = event[1];
    $("event-choices").innerHTML = "";
    $("event-button").disabled = true;

    event[2].forEach(([label, dMoney, dTime]) => {
        const button = document.createElement("button");
        const effects = [];
        if (dMoney) effects.push(signed(dMoney));
        if (dTime) effects.push(dTime + "時間");
        button.innerHTML = `<span>${label}</span><small>${effects.join(" / ") || "変化なし"}</small>`;
        button.disabled = money + dMoney < 0 || time + dTime < 0;

        button.onclick = () => {
            money += dMoney;
            time += dTime;
            updateDashboard();
            $("event-choices").innerHTML = "";
            $("event-description").textContent += "（選択済み）";
            $("next-day").disabled = false;
        };
        $("event-choices").appendChild(button);
    });
}

// NEXT DAY / RESULTS
function nextDay() {
    currentDay++;
    if (currentDay === 7) return showResults();
    startDay();
}

function showResults() {
    ["tasks", "events", "controls"].forEach(id => $(id).classList.add("hidden"));
    $("results").classList.remove("hidden");
    updateDashboard();
    const [, rank, comment] = ranks.find(r => money >= r[0]);
    $("final-report").innerHTML =
        `<p class="label">RANK</p><p class="rank">${rank}</p>` +
        `<p>残金：${yen(money)}（開始時から ${signed(money - START_MONEY)}）</p><p>${comment}</p>`;
}

// NEW GAME
function newGame() {
    money = START_MONEY;
    currentDay = 0;
    pool = [...events].sort(() => Math.random() - 0.5);
    ["tasks", "events", "controls"].forEach(id => $(id).classList.remove("hidden"));
    $("results").classList.add("hidden");
    startDay();
}

// BUTTONS
$("event-button").onclick = showEvent;
$("next-day").onclick = nextDay;
$("restart").onclick = newGame;

// START GAME
newGame();