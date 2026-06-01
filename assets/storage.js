


let saveState = {
  xp: 0,
  level: 1,
  theme: "theme-neon-blue",
  stats: {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    fastestTime: 9999,
    highestScore: 0,
    totalHints: 0,
    currentStreak: 0,
    longestStreak: 0
  },
  achievements: [],
  missionsCompleted: []
};

const storage = {
  load() {
    const data = localStorage.getItem("cyber_breach_save");
    if (data) {
      saveState = { ...saveState, ...JSON.parse(data) };
      
      saveState.stats = {
        gamesPlayed: 0, wins: 0, losses: 0, fastestTime: 9999,
        highestScore: 0, totalHints: 0, currentStreak: 0, longestStreak: 0,
        ...saveState.stats
      };
    }
  },
  save() {
    localStorage.setItem("cyber_breach_save", JSON.stringify(saveState));
  },
  reset() {
    localStorage.removeItem("cyber_breach_save");
    location.reload();
  }
};
