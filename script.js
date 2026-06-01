




function getDailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}


function sfc32(a, b, c, d) {
  return function () {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}



const statistics = {
  
  addXP(amount) {
    saveState.xp += amount;
    this.checkLevelUp();
    this.checkRankUp();
    storage.save();
    ui.updateMenuCard();
  },

  
  checkLevelUp() {
    const requiredForNext = saveState.level * 100;
    if (saveState.xp >= requiredForNext) {
      saveState.level++;
      ui.showToast(`Level Up! You are now Level ${saveState.level}`, "🚀");
    }
  },

  
  checkRankUp() {
    const currentRank = this.getCurrentRank();
    if (currentRank.name === "Cyber Legend") {
      achievements.unlock("legend");
    }
  },

  
  getCurrentRank() {
    let current = RANKS[0];
    for (const rank of RANKS) {
      if (saveState.xp >= rank.xp) current = rank;
    }
    return current;
  },

  
  updateStats(won, score, timeTaken, hintUsed) {
    saveState.stats.gamesPlayed++;
    if (hintUsed) saveState.stats.totalHints++;

    if (won) {
      saveState.stats.wins++;
      saveState.stats.currentStreak++;
      if (saveState.stats.currentStreak > saveState.stats.longestStreak) {
        saveState.stats.longestStreak = saveState.stats.currentStreak;
      }
      if (score > saveState.stats.highestScore) saveState.stats.highestScore = score;
      if (timeTaken < saveState.stats.fastestTime) saveState.stats.fastestTime = timeTaken;

      if (!game.isDaily && game.currentMission) {
        if (!saveState.missionsCompleted.includes(game.currentMission.id)) {
          saveState.missionsCompleted.push(game.currentMission.id);
        }
      }
    } else {
      saveState.stats.losses++;
      saveState.stats.currentStreak = 0;
    }

    
    achievements.checkPostGame(won, hintUsed, game.timeLeft, score);

    storage.save();
  }
};



const game = {
  currentMission: null,
  currentCode: "",
  currentInput: "",
  attemptsLeft: 0,
  timeLeft: 0,
  hintUsed: false,
  timer: null,
  isDaily: false,
  active: false,

  

  startMission(missionConfig) {
    this.isDaily = false;
    this.currentMission = missionConfig;
    this.initGame(missionConfig);
    ui.showScreen("screen-game");
  },

  startDailyChallenge() {
    this.isDaily = true;
    const seed = getDailySeed();
    const rand = sfc32(seed, seed + 1, seed + 2, seed + 3);

    
    const digits = Math.floor(rand() * 4) + 4; 
    this.currentMission = {
      id: 99,
      name: "Daily Intrusion Protocol",
      digits: digits,
      time: digits * 15,
      attempts: digits * 2 + 2
    };

    
    this.currentCode = "";
    for (let i = 0; i < digits; i++) {
      this.currentCode += Math.floor(rand() * 10);
    }

    this.initGame(this.currentMission, this.currentCode);
    ui.showScreen("screen-game");
  },

  

  initGame(config, forceCode = null) {
    this.active = true;
    this.hintUsed = false;
    this.currentInput = "";
    this.attemptsLeft = config.attempts;
    this.timeLeft = config.time;

    document.getElementById("game-mission-name").textContent = config.name;
    document.getElementById("console-output").innerHTML = "";
    document.getElementById("history-list").innerHTML = "";
    document.getElementById("lock-icon").className = "lock-locked";

    ui.updateGameHeader();
    ui.updateDisplay();
    ui.log(`Establishing connection to ${config.name}...`, "system");
    setTimeout(() => ui.log(`Bypassing firewall...`, "system"), 500);
    setTimeout(() => ui.log(`Encryption detected: ${config.digits}-bit RSA.`, "alert"), 1000);

    if (forceCode) {
      this.currentCode = forceCode;
    } else {
      this.generateCode(config.digits);
    }

    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      ui.updateGameHeader();
      if (this.timeLeft <= 10 && this.timeLeft > 0) {
        document.getElementById("game-time").style.color = "var(--danger)";
        if (this.timeLeft % 2 === 0) ui.log(`Warning: Tracing imminent! ${this.timeLeft}s`, "error");
      }
      if (this.timeLeft <= 0) this.lose("Time expired. Trace completed.");
    }, 1000);
  },

  generateCode(len) {
    this.currentCode = "";
    
    
    const array = new Uint32Array(len);
    window.crypto.getRandomValues(array);
    
    for (let i = 0; i < len; i++) {
      this.currentCode += (array[i] % 10).toString();
    }
  },

  

  press(n) {
    if (!this.active) return;
    if (this.currentInput.length < this.currentMission.digits) {
      this.currentInput += n;
      ui.updateDisplay();
    }
  },

  clearInput() {
    if (!this.active) return;
    this.currentInput = "";
    ui.updateDisplay();
  },

  useHint() {
    if (!this.active) return;
    if (this.hintUsed) {
      ui.log("System Alert: Hint already deployed.", "error");
      return;
    }
    this.hintUsed = true;
    const lastD = Number(this.currentCode[this.currentCode.length - 1]);
    const type = lastD % 2 === 0 ? "EVEN" : "ODD";
    ui.log(`HINT DECRYPTED: Last digit is ${type}.`, "success");
  },

  submitCode() {
    if (!this.active) return;
    if (this.currentInput.length < this.currentMission.digits) {
      ui.log("Validation Error: Incomplete sequence.", "error");
      const d = document.getElementById("game-display");
      d.classList.add("error");
      setTimeout(() => d.classList.remove("error"), 300);
      return;
    }

    this.attemptsLeft--;
    ui.updateGameHeader();

    const feedback = this.calculateFeedback(this.currentInput, this.currentCode);
    ui.addHistoryItem(this.currentInput, feedback);

    if (feedback.exact === this.currentMission.digits) {
      this.win();
    } else {
      ui.log(`Attempt Failed. Traces remaining: ${this.attemptsLeft}`, "alert");
      this.currentInput = "";
      ui.updateDisplay();

      
      this.generateCode(this.currentMission.digits);

      const lock = document.getElementById("lock-icon");
      lock.classList.add("shake");
      setTimeout(() => lock.classList.remove("shake"), 400);

      if (this.attemptsLeft <= 0) {
        this.lose("Maximum traces reached. Connection terminated.");
      }
    }
  },

  

  calculateFeedback(guess, actual) {
    let exact = 0;
    let partial = 0;
    let guessArr = guess.split("");
    let actualArr = actual.split("");

    
    for (let i = 0; i < guessArr.length; i++) {
      if (guessArr[i] === actualArr[i]) {
        exact++;
        guessArr[i] = null;
        actualArr[i] = null;
      }
    }

    
    for (let i = 0; i < guessArr.length; i++) {
      if (guessArr[i] !== null) {
        let idx = actualArr.indexOf(guessArr[i]);
        if (idx !== -1) {
          partial++;
          actualArr[idx] = null;
        }
      }
    }
    return { exact, partial };
  },

  

  win() {
    this.active = false;
    clearInterval(this.timer);
    document.getElementById("lock-icon").className = "lock-unlocked";
    document.getElementById("game-time").style.color = "";
    ui.log("ACCESS GRANTED.", "success");
    ui.triggerConfetti();

    const timeBonus = this.timeLeft * 10;
    const attemptBonus = this.attemptsLeft * 50;
    const hintPenalty = this.hintUsed ? 100 : 0;
    const baseScore = this.currentMission.digits * 100;
    const totalScore = Math.max(0, baseScore + timeBonus + attemptBonus - hintPenalty);

    const timeTaken = this.currentMission.time - this.timeLeft;
    statistics.updateStats(true, totalScore, timeTaken, this.hintUsed);

    const xpGain = Math.floor(totalScore / 10);
    statistics.addXP(xpGain);

    setTimeout(() => {
      ui.showModal("win", {
        timeBonus, attemptBonus, hintPenalty, totalScore, xpGain,
        secretCode: this.currentCode,
        timeTaken
      });
    }, 1500);
  },

  lose(msg) {
    this.active = false;
    clearInterval(this.timer);
    document.getElementById("game-time").style.color = "";
    ui.log(msg, "error");
    ui.log(`TARGET CODE WAS: ${this.currentCode}`, "system");

    const timeTaken = this.currentMission.time - this.timeLeft;
    statistics.updateStats(false, 0, timeTaken, this.hintUsed);

    setTimeout(() => {
      ui.showModal("lose", {
        timeBonus: 0, attemptBonus: 0, hintPenalty: 0, totalScore: 0, xpGain: 5,
        secretCode: this.currentCode,
        timeTaken
      });
      statistics.addXP(5); 
    }, 1500);
  },

  abort() {
    if (confirm("Abort mission? This will count as a failure.")) {
      this.lose("Manual abort initiated.");
    }
  },

  

  nextMission() {
    ui.closeModal();
    if (this.currentMission && this.currentMission.id < 5) {
      const nextM = MISSIONS.find(m => m.id === this.currentMission.id + 1);
      if (saveState.level >= nextM.unlockLevel) {
        this.startMission(nextM);
      } else {
        ui.showScreen("screen-missions");
        ui.showToast(`Requires Level ${nextM.unlockLevel} to access`, "🔒");
      }
    } else {
      ui.showScreen("screen-missions");
    }
  }
};



window.onload = () => {
  storage.load();
  ui.setTheme(saveState.theme);
  ui.updateMenuCard();
};
