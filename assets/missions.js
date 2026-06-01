

const MISSIONS = [
  { id: 1, name: "Home Security System", digits: 3, time: 45, attempts: 8, unlockLevel: 1 },
  { id: 2, name: "Corporate Database", digits: 4, time: 60, attempts: 10, unlockLevel: 2 },
  { id: 3, name: "Bank Vault", digits: 5, time: 60, attempts: 10, unlockLevel: 3 },
  { id: 4, name: "Military Server", digits: 6, time: 90, attempts: 12, unlockLevel: 5 },
  { id: 5, name: "Quantum AI Core", digits: 7, time: 120, attempts: 15, unlockLevel: 8 }
];

const ACHIEVEMENTS = [
  { id: "first_win", name: "First Victory", desc: "Successfully hack any target." },
  { id: "speed_hacker", name: "Speed Hacker", desc: "Win with more than 50% time left." },
  { id: "hint_free", name: "Hint-Free Master", desc: "Win a mission without using hints." },
  { id: "streak_5", name: "Win Streak x5", desc: "Win 5 games in a row." },
  { id: "all_missions", name: "Master Hacker", desc: "Complete all 5 missions." },
  { id: "legend", name: "Cyber Legend", desc: "Reach max rank." }
];

const RANKS = [
  { name: "Rookie", xp: 0 },
  { name: "Agent", xp: 500 },
  { name: "Hacker", xp: 1500 },
  { name: "Cyber Expert", xp: 3000 },
  { name: "Elite Hacker", xp: 5000 },
  { name: "Cyber Legend", xp: 10000 }
];
