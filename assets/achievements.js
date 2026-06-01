

const achievements = {
  unlock(id) {
    if (!saveState.achievements.includes(id)) {
      saveState.achievements.push(id);
      storage.save();
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) ui.showToast(`Achievement: ${ach.name}`, "🏆");
    }
  },

  checkPostGame(won, hintUsed, timeLeft, score) {
    if (won) {
      this.unlock("first_win");

      if (saveState.stats.currentStreak >= 5) {
        this.unlock("streak_5");
      }

      if (!hintUsed) {
        this.unlock("hint_free");
      }

      if (!game.isDaily && game.currentMission) {
        if (saveState.missionsCompleted.length >= 5) {
          this.unlock("all_missions");
        }
        if (timeLeft >= game.currentMission.time / 2) {
          this.unlock("speed_hacker");
        }
      }
    }
  },

  render() {
    const achList = document.getElementById("achievements-list");
    achList.innerHTML = "";
    ACHIEVEMENTS.forEach(a => {
      const unlocked = saveState.achievements.includes(a.id);
      const div = document.createElement("div");
      div.className = `achievement ${unlocked ? "unlocked" : ""}`;
      div.innerHTML = `
        <div class="achievement-icon">${unlocked ? "🏆" : "🔒"}</div>
        <div class="achievement-name">${a.name}</div>
      `;
      achList.appendChild(div);
    });
  }
};
