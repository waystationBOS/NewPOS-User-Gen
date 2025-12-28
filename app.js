/* ========== Theme Detection & Toggle ========== */
const toggleBtn = document.getElementById("themeToggle");

function updateToggle() {
    toggleBtn.innerHTML = document.body.classList.contains("dark")
        ? `<i class="fa-solid fa-sun"></i> Light`
        : `<i class="fa-solid fa-moon"></i> Dark`;
}

(function initTheme(){
    const saved = localStorage.getItem("theme");
    document.body.classList.toggle("dark", saved === "dark");
    updateToggle();
})();

toggleBtn.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    updateToggle();
};

/* ========== Crypto Functions ========== */
function md5Filtered(data) {
    let hash = CryptoJS.MD5(data).toString(CryptoJS.enc.Hex);
    if (hash.length % 2) hash = "0" + hash;
    return [...hash].filter((c, i) => i % 2 !== 0 || c !== "0").join("");
}

function hmacFiltered(uid, pwd) {
    let hash = CryptoJS.HmacMD5(uid, pwd).toString(CryptoJS.enc.Hex);
    if (hash.length % 2) hash = "0" + hash;
    return [...hash].filter((c, i) => i % 2 !== 0 || c !== "0").join("");
}

function buildLine(badge, name, pwd, job) {
    const enc = hmacFiltered(badge, pwd);
    const base = `${badge},${name.toLowerCase()},${job},99991231,${enc},`;
    return base + md5Filtered(base);
}

/* ========== Main Form Logic ========== */
const form = document.getElementById("userForm");
const output = document.getElementById("output");

form.onsubmit = (e) => {
    e.preventDefault();

    let badge = badge.value.trim();
    let name  = document.getElementById("name").value.trim();
    let pwd   = password.value.trim();
    let job   = job.value;

    if (!/^\d{1,10}$/.test(badge)) return alert("Badge must be numeric, max 10 digits");
    if (!/^[A-Za-z ]{1,25}$/.test(name)) return alert("Name letters only, max 25");
    if (!/^\d{1,10}$/.test(pwd)) return alert("Password numeric, max 10");

    const line = buildLine(badge, name, pwd, job);
    output.textContent = line;
    addHistory(line);
};

/* ========== Copy Button ========== */
document.getElementById("copyBtn").onclick = () => {
    if (!output.textContent) return;
    navigator.clipboard.writeText(output.textContent);
    toast();
};

/* ========== History ========== */
const panel = document.getElementById("historyPanel");
const historyBtn = document.getElementById("historyBtn");

function toast(msg="Copied!") {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(()=>t.classList.remove("show"),1500);
}

function getHistory() {
    return JSON.parse(localStorage.getItem("history") || "[]");
}
function saveHistory(list) {
    localStorage.setItem("history", JSON.stringify(list));
}

function addHistory(text) {
    const list = getHistory();
    list.unshift({ text, time: new Date().toLocaleString() });
    saveHistory(list);
}

function renderHistory() {
    const list = getHistory();
    panel.innerHTML = "<h3>History</h3>";

    if (!list.length) return panel.innerHTML += "<p>No records yet.</p>";

    list.forEach((x,i)=> {
        panel.innerHTML += `
        <div class="history-item">
            <div>${x.text}</div>
            <small>${x.time}</small>
            <button onclick="navigator.clipboard.writeText('${x.text}'); toast();">Copy</button>
            <button onclick="del(${i})" style="background:#d62828;">Delete</button>
        </div>`;
    });
}

function del(i){
    const list = getHistory();
    list.splice(i,1);
    saveHistory(list);
    renderHistory();
}

historyBtn.onclick = () => {
    panel.classList.toggle("open");
    renderHistory();
};
