

const ui = {
  activeScreen: "screen-main",

  showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => {
      s.classList.remove("active");
      setTimeout(() => s.classList.add("hidden"), 400); 
    });

    const target = document.getElementById(id);
    setTimeout(() => {
      target.classList.remove("hidden");
      
      setTimeout(() => target.classList.add("active"), 50);
    }, 400);

    this.activeScreen = id;

    if (id === "screen-missions") this.renderMissions();
    if (id === "screen-stats") this.renderStats();
  },

  setTheme(themeName) {
    document.body.className = themeName;
    saveState.theme = themeName;
    storage.save();
  },

  updateMenuCard() {
    const rank = statistics.getCurrentRank();
    document.getElementById("menu-rank").textContent = `Rank: ${rank.name}`;

    const currentLevelXP = (saveState.level - 1) * 100;
    const nextLevelXP = saveState.level * 100;
    const progress = saveState.xp - currentLevelXP;
    const required = nextLevelXP - currentLevelXP;
    const pct = Math.min(100, Math.max(0, (progress / required) * 100));

    document.getElementById("menu-xp-fill").style.width = `${pct}%`;
    document.getElementById("menu-xp-text").textContent = `${saveState.xp} XP (Lvl ${saveState.level})`;
  },

  renderMissions() {
    const list = document.getElementById("mission-list");
    list.innerHTML = "";

    MISSIONS.forEach(m => {
      const isLocked = saveState.level < m.unlockLevel;
      const isCompleted = saveState.missionsCompleted.includes(m.id);

      const card = document.createElement("div");
      card.className = `mission-card ${isLocked ? "locked" : ""}`;
      if (!isLocked) card.onclick = () => game.startMission(m);

      card.innerHTML = `
        <h3>[M${m.id}] ${m.name} ${isCompleted ? '✓' : ''}</h3>
        <div class="mission-desc">${isLocked ? `Locked. Requires Level ${m.unlockLevel}` : `Infiltrate and bypass ${m.digits}-digit security.`}</div>
        <div class="mission-meta">
          <span>TIME: ${m.time}s</span>
          <span>TRACES: ${m.attempts}</span>
        </div>
      `;
      list.appendChild(card);
    });
  },

  renderStats() {
    const s = saveState.stats;
    const winRate = s.gamesPlayed > 0 ? Math.round((s.wins / s.gamesPlayed) * 100) : 0;

    document.getElementById("stats-list").innerHTML = `
      <li><span>Games Played</span> <span>${s.gamesPlayed}</span></li>
      <li><span>Win Rate</span> <span>${winRate}%</span></li>
      <li><span>Wins / Losses</span> <span>${s.wins} / ${s.losses}</span></li>
      <li><span>Highest Score</span> <span class="highlight">${s.highestScore}</span></li>
      <li><span>Fastest Breach</span> <span>${s.fastestTime === 9999 ? '-' : s.fastestTime + 's'}</span></li>
      <li><span>Current Streak</span> <span>${s.currentStreak}</span></li>
      <li><span>Total Hints Used</span> <span>${s.totalHints}</span></li>
    `;

    achievements.render();
  },

  log(msg, type = "system") {
    const consoleBody = document.getElementById("console-output");
    const p = document.createElement("div");
    p.className = `log-entry ${type}`;

    const time = new Date().toLocaleTimeString().split(' ')[0];
    p.textContent = `[${time}] > ${msg}`;

    consoleBody.appendChild(p);
    consoleBody.scrollTop = consoleBody.scrollHeight;
  },

  updateGameHeader() {
    
    const m = Math.floor(game.timeLeft / 60);
    const sec = game.timeLeft % 60;
    const timeStr = `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

    document.getElementById("game-time").textContent = timeStr;
    const maxA = game.currentMission ? game.currentMission.attempts : 10;
    document.getElementById("game-attempts").textContent = `${game.attemptsLeft}/${maxA}`;
  },

  updateDisplay() {
    const max = game.currentMission ? game.currentMission.digits : 5;
    let text = game.currentInput.padEnd(max, "_").split("").join(" ");
    document.getElementById("game-display").textContent = text;
  },

  addHistoryItem(guess, feedback) {
    const list = document.getElementById("history-list");
    const item = document.createElement("div");
    item.className = "guess-item";

    let fbHTML = "";
    if (feedback.exact === game.currentMission.digits) {
      fbHTML = `<span class="feedback-val perfect">ACCESS GRANTED</span>`;
    } else {
      fbHTML = `
        <span><span class="feedback-val">${feedback.exact}</span> Exact</span>
        <span><span class="feedback-val">${feedback.partial}</span> Partial</span>
      `;
    }

    item.innerHTML = `
      <div class="guess-num">${guess.split("").join(" ")}</div>
      <div class="guess-feedback">${fbHTML}</div>
    `;
    list.appendChild(item);
    list.scrollTop = list.scrollHeight;
  },

  showModal(type, data) {
    document.getElementById("modal-overlay").classList.remove("hidden");
    const resModal = document.getElementById("modal-result");
    resModal.classList.remove("hidden");

    const title = document.getElementById("result-title");
    title.textContent = type === "win" ? "MISSION COMPLETE ✅" : "MISSION FAILED ❌";
    title.setAttribute("data-text", title.textContent);
    title.style.color = type === "win" ? "var(--success)" : "var(--danger)";

    
    const codeBox = document.querySelector(".secret-code-box");
    const codeVal = document.getElementById("r-secret-code");
    codeVal.textContent = data.secretCode
      ? data.secretCode.split("").join(" ")
      : "—";
    codeBox.classList.toggle("win", type === "win");
    codeBox.classList.toggle("lose", type !== "win");

    
    document.getElementById("r-time").textContent = data.timeBonus;
    document.getElementById("r-attempts").textContent = data.attemptBonus;
    document.getElementById("r-hint").textContent = data.hintPenalty;
    document.getElementById("r-score").textContent = data.totalScore;
    document.getElementById("r-xp").textContent = data.xpGain;

    
    const ttEl = document.getElementById("r-time-taken");
    if (ttEl) ttEl.textContent = data.timeTaken !== undefined ? `${data.timeTaken}s` : "—";

    
    const rankEl = document.getElementById("r-rank");
    if (rankEl) rankEl.textContent = statistics.getCurrentRank().name;

    setTimeout(() => {
      document.getElementById("r-xp-fill").style.width = "100%";
    }, 500);

    const nextBtn = document.getElementById("btn-next-mission");
    if (type === "win" && !game.isDaily) {
      nextBtn.style.display = "block";
    } else {
      nextBtn.style.display = "none";
    }
  },

  closeModal() {
    document.getElementById("modal-overlay").classList.add("hidden");
    document.getElementById("modal-result").classList.add("hidden");
    document.getElementById("r-xp-fill").style.width = "0%";
  },

  showToast(title, icon) {
    const t = document.getElementById("modal-notification");
    document.getElementById("toast-title").textContent = title;
    document.querySelector(".toast-icon").textContent = icon;
    document.getElementById("toast-desc").textContent = "";

    t.classList.remove("hidden");
    setTimeout(() => {
      t.classList.add("hidden");
    }, 4000);
  },

  triggerConfetti() {
    for (let i = 0; i < 50; i++) {
      this.createParticle();
    }
  },

  createParticle() {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = (Math.random() * 3 + 2) + "s";
    p.style.animationDelay = (Math.random() * 2) + "s";
    document.getElementById("particles").appendChild(p);

    setTimeout(() => { p.remove(); }, 5000);
  },

  

  showResetConfirm() {
    document.getElementById("modal-overlay").classList.remove("hidden");
    document.getElementById("modal-reset-confirm").classList.remove("hidden");
  },

  hideResetConfirm() {
    document.getElementById("modal-overlay").classList.add("hidden");
    document.getElementById("modal-reset-confirm").classList.add("hidden");
  },

  confirmReset() {
    
    localStorage.removeItem("cyber_breach_save");

    
    saveState.xp = 0;
    saveState.level = 1;
    saveState.theme = "theme-neon-blue";
    saveState.stats = {
      gamesPlayed: 0, wins: 0, losses: 0,
      fastestTime: 9999, highestScore: 0,
      totalHints: 0, currentStreak: 0, longestStreak: 0
    };
    saveState.achievements = [];
    saveState.missionsCompleted = [];

    
    document.body.className = "theme-neon-blue";

    
    ui.hideResetConfirm();

    
    ui.updateMenuCard();
    ui.renderStats();
    ui.renderMissions();

    
    ui.showToast("✅ All game data has been cleared.", "🗑");
  },

  

  showRuleBook() {
    document.getElementById("modal-overlay").classList.remove("hidden");
    document.getElementById("modal-rule-book").classList.remove("hidden");
  },

  hideRuleBook() {
    document.getElementById("modal-overlay").classList.add("hidden");
    document.getElementById("modal-rule-book").classList.add("hidden");
  }
};


const btnClear = document.getElementById("btn-clear-data");
if (btnClear) btnClear.addEventListener("click", () => ui.showResetConfirm());

const btnCancel = document.getElementById("btn-reset-cancel");
if (btnCancel) btnCancel.addEventListener("click", () => ui.hideResetConfirm());

const btnConfirm = document.getElementById("btn-reset-confirm");
if (btnConfirm) btnConfirm.addEventListener("click", () => ui.confirmReset());


document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const ruleBook = document.getElementById("modal-rule-book");
    if (ruleBook && !ruleBook.classList.contains("hidden")) {
      ui.hideRuleBook();
    }
    const resetConfirm = document.getElementById("modal-reset-confirm");
    if (resetConfirm && !resetConfirm.classList.contains("hidden")) {
      ui.hideResetConfirm();
    }
  }
});


setInterval(() => {
  if (document.getElementById("particles").childElementCount < 20) {
    ui.createParticle();
  }
}, 500);
