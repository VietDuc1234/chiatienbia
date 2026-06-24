(function () {
  "use strict";

  const COLORS = [
    "#ff4d4d", "#ffeb3b", "#ff9800", "#4dd2ff",
    "#7CFC7C", "#e58cff", "#ff8fb1", "#c0c0c0",
  ];

  let state = { players: [], pricePerPoint: 0, soundOn: true };
  let saveTimer = null;

  const $ = (sel) => document.querySelector(sel);
  const playersEl = $("#players");

  /* ---------- Tai / Luu ---------- */
  async function loadState() {
    try {
      const res = await fetch("/api/state");
      state = await res.json();
    } catch (e) {
      console.warn("Khong tai duoc state, dung mac dinh", e);
    }
    if (!Array.isArray(state.players)) state.players = [];
    render();
    updateSoundIcon();
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 350);
  }

  async function save() {
    try {
      await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
    } catch (e) {
      console.warn("Luu that bai", e);
    }
  }

  /* ---------- Render ---------- */
  function render() {
    playersEl.innerHTML = "";
    state.players.forEach((p) => {
      const row = document.createElement("div");
      row.className = "player-row";
      row.style.background = p.color || "#cccccc";

      const name = document.createElement("div");
      name.className = "player-name";
      name.textContent = p.name;
      attachNameActions(name, p);

      const score = document.createElement("div");
      score.className = "player-score";
      score.textContent = p.score;

      const minus = document.createElement("button");
      minus.className = "score-btn";
      minus.textContent = "−";
      minus.addEventListener("click", () => changeScore(p, -1));

      const plus = document.createElement("button");
      plus.className = "score-btn";
      plus.textContent = "+";
      plus.addEventListener("click", () => changeScore(p, +1));

      row.append(name, score, minus, plus);
      playersEl.appendChild(row);
    });
  }

  function changeScore(player, delta) {
    player.score += delta;
    playSound();
    render();
    scheduleSave();
  }

  /* ---------- Doi ten / Xoa nguoi ---------- */
  function attachNameActions(el, player) {
    // Doi ten: nhan dup
    el.addEventListener("dblclick", () => renamePlayer(player));

    // Xoa: nhan giu lau
    let holdTimer = null;
    const startHold = () => {
      holdTimer = setTimeout(() => deletePlayer(player), 650);
    };
    const cancelHold = () => clearTimeout(holdTimer);
    el.addEventListener("mousedown", startHold);
    el.addEventListener("touchstart", startHold, { passive: true });
    ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((ev) =>
      el.addEventListener(ev, cancelHold)
    );
  }

  function renamePlayer(player) {
    const name = prompt("Doi ten nguoi choi:", player.name);
    if (name && name.trim()) {
      player.name = name.trim().toUpperCase().slice(0, 12);
      render();
      scheduleSave();
    }
  }

  function deletePlayer(player) {
    if (confirm(`Xoa nguoi choi "${player.name}"?`)) {
      state.players = state.players.filter((p) => p.id !== player.id);
      render();
      scheduleSave();
    }
  }

  /* ---------- Them nguoi ---------- */
  const addModal = $("#add-modal");
  const addName = $("#add-name");

  function openAddModal() {
    addName.value = "";
    addModal.classList.remove("hidden");
    setTimeout(() => addName.focus(), 50);
  }
  function closeAddModal() {
    addModal.classList.add("hidden");
  }
  function confirmAdd() {
    const name = addName.value.trim();
    if (!name) return;
    const usedColors = state.players.map((p) => p.color);
    const color =
      COLORS.find((c) => !usedColors.includes(c)) ||
      COLORS[state.players.length % COLORS.length];
    const id = Date.now();
    state.players.push({
      id,
      name: name.toUpperCase().slice(0, 12),
      score: 0,
      color,
    });
    closeAddModal();
    render();
    scheduleSave();
  }

  /* ---------- Reset ---------- */
  function resetScores() {
    if (!state.players.length) return;
    if (confirm("Reset tat ca diem ve 0?")) {
      state.players.forEach((p) => (p.score = 0));
      render();
      scheduleSave();
    }
  }

  /* ---------- Am thanh ---------- */
  function updateSoundIcon() {
    $("#btn-sound .ico").textContent = state.soundOn ? "🔊" : "🔇";
  }
  function toggleSound() {
    state.soundOn = !state.soundOn;
    updateSoundIcon();
    scheduleSave();
  }
  function playSound() {
    if (!state.soundOn) return;
    // Beep ngan bang WebAudio (khong can file)
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = (playSound._ctx = playSound._ctx || new Ctx());
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 660;
      osc.type = "square";
      gain.gain.value = 0.05;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      /* bo qua */
    }
  }

  /* ---------- Chia tien ---------- */
  const moneyModal = $("#money-modal");
  const priceInput = $("#price-input");
  const moneyResult = $("#money-result");

  function openMoneyModal() {
    priceInput.value = state.pricePerPoint || "";
    renderMoney();
    moneyModal.classList.remove("hidden");
  }
  function closeMoneyModal() {
    moneyModal.classList.add("hidden");
  }

  function fmt(n) {
    return Math.round(n).toLocaleString("vi-VN") + " đ";
  }

  function renderMoney() {
    const price = Number(priceInput.value) || 0;
    state.pricePerPoint = price;
    scheduleSave();

    if (!state.players.length) {
      moneyResult.innerHTML = "<p>Chua co nguoi choi.</p>";
      return;
    }

    let rows = "";
    let net = 0;
    state.players.forEach((p) => {
      const money = p.score * price;
      net += money;
      const cls = money < 0 ? "pay" : money > 0 ? "recv" : "";
      const label = money < 0 ? "Tra" : money > 0 ? "Nhan" : "-";
      rows += `<tr>
        <td>${escapeHtml(p.name)}</td>
        <td>${p.score}</td>
        <td class="${cls}">${fmt(Math.abs(money))}</td>
        <td class="${cls}">${label}</td>
      </tr>`;
    });

    const totalScore = state.players.reduce((s, p) => s + p.score, 0);
    moneyResult.innerHTML = `
      <table>
        <thead>
          <tr><th>Ten</th><th>Diem</th><th>So tien</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="money-net">
        Tong diem: ${totalScore}${totalScore !== 0 ? " (canh bao: tong diem khac 0)" : ""}<br/>
        Chenh lech net: ${fmt(net)}
      </div>`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  /* ---------- Man hinh doc ---------- */
  function addRotateHint() {
    const hint = document.createElement("div");
    hint.className = "rotate-hint";
    hint.textContent = "Vui long xoay ngang man hinh de su dung.";
    document.body.appendChild(hint);
  }

  /* ---------- Su kien ---------- */
  $("#btn-add").addEventListener("click", openAddModal);
  $("#btn-reset").addEventListener("click", resetScores);
  $("#btn-sound").addEventListener("click", toggleSound);
  $("#btn-money").addEventListener("click", openMoneyModal);

  $("#add-confirm").addEventListener("click", confirmAdd);
  $("#add-cancel").addEventListener("click", closeAddModal);
  addName.addEventListener("keydown", (e) => {
    if (e.key === "Enter") confirmAdd();
  });

  $("#money-close").addEventListener("click", closeMoneyModal);
  priceInput.addEventListener("input", renderMoney);

  // Dong modal khi bam nen
  [moneyModal, addModal].forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target === m) m.classList.add("hidden");
    });
  });

  addRotateHint();
  loadState();
})();
