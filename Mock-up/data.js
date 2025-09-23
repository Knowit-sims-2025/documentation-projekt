// Här ligger all mock-data + asynkrona "fetchers" som simulerar API-anrop.
// /data.js  (ES module)

// === INDIVIDUAL LEADERBOARD (10 st) ===
// Poäng satta så att "You" hamnar på plats 8 efter sortering (desc)
const _leaderboard = [
  { name: 'Bruce Wayne',   points: 5000 },
  { name: 'Clark Kent',    points: 4200 },
  { name: 'Diana Prince',  points: 3800 },
  { name: 'Barry Allen',   points: 2900 },
  { name: 'Hal Jordan',    points: 2100 },
  { name: 'Arthur Curry',  points: 1700 },
  { name: 'Oliver Queen',  points: 1300 },
  { name: 'You',           points: 1250 }, // ← plats 8
  { name: 'Billy Batson',  points: 900  },
  { name: 'Victor Stone',  points: 600  },
];

// === TEAMS ===
// Poängen här är summan av respektive medlems poäng (mock)
const _teams = [
  { name: 'Team Alpha',   points: 5000 + 4200 }, // Bruce + Clark = 9200
  { name: 'Team Beta',    points: 3800 + 2900 }, // Diana + Barry = 6700
  { name: 'Team Gamma',   points: 2100 + 1700 }, // Hal + Arthur = 3800
  { name: 'Team Delta',   points: 1300 + 1250 }, // Oliver + You  = 2550
  { name: 'Team Epsilon', points: 900  + 600  }, // Billy + Victor= 1500
];

// Team → medlemmar
const _teamMembers = {
  'Team Alpha':   ['Bruce Wayne', 'Clark Kent'],
  'Team Beta':    ['Diana Prince', 'Barry Allen'],
  'Team Gamma':   ['Hal Jordan', 'Arthur Curry'],
  'Team Delta':   ['Oliver Queen', 'You'],
  'Team Epsilon': ['Billy Batson', 'Victor Stone'],
};

// === ÖVRIGA DATA (oförändrat) ===
const _documents = [
  { name: 'API Documentation',     lastEdited: new Date('2025-08-20') },
  { name: 'User Guide',            lastEdited: new Date('2025-08-01') },
  { name: 'Installation Manual',   lastEdited: new Date('2025-07-15') },
  { name: 'Developer Onboarding',  lastEdited: new Date('2025-06-01') },
  { name: 'Archived Projects',     lastEdited: new Date('2025-03-10') },
];

// Achievements per spelare (enkla mockar)
const _playerAchievements = {
  'Bruce Wayne':  { commits: 510, timeHours: 300, earned: ['First Commit','Reviewer','First of the Day','Team Contributor','Commit Milestone: 100','Commit Milestone: 200','Commit Milestone: 500'] },
  'Clark Kent':   { commits: 480, timeHours: 260, earned: ['First Commit','Reviewer','Team Contributor','Commit Milestone: 100','Commit Milestone: 200','Commit Milestone: 500'] },
  'Diana Prince': { commits: 405, timeHours: 240, earned: ['First Commit','Reviewer','First of the Day','Team Contributor','Commit Milestone: 100','Commit Milestone: 200'] },
  'Barry Allen':  { commits: 220, timeHours: 150, earned: ['First Commit','Reviewer','Commit Milestone: 100','Commit Milestone: 200'] },
  'Hal Jordan':   { commits: 160, timeHours: 120, earned: ['First Commit','Reviewer','Commit Milestone: 100'] },
  'Arthur Curry': { commits: 130, timeHours:  90, earned: ['First Commit','Reviewer','Commit Milestone: 100'] },
  'Oliver Queen': { commits:  80, timeHours:  40, earned: ['First Commit','Reviewer','Commit Milestone: 50'] },
  'You':          { commits:  22, timeHours:   6, earned: ['First Commit','Reviewer','First of the Day'] },
  'Billy Batson': { commits:  50, timeHours:  25, earned: ['First Commit','Commit Milestone: 50'] },
  'Victor Stone': { commits:  35, timeHours:  20, earned: ['First Commit'] },
};

function _delay(ms=200){ return new Promise(r=>setTimeout(r,ms)); }

export async function getCurrentUser() {
  await _delay(30);
  try { return localStorage.getItem('loggedInUser') || ''; } catch { return ''; }
}

export async function getLeaderboard() {
  await _delay();
  return _leaderboard.slice().sort((a,b)=>b.points-a.points);
}

export async function getTeamLeaderboard() {
  await _delay();
  return _teams.slice().sort((a,b)=>b.points-a.points);
}

export async function getTeam(teamName) {
  await _delay();
  return _teams.find(t => t.name === teamName) || null;
}

export async function getTeamRoster(teamName) {
  await _delay();
  const members = _teamMembers[teamName] || [];
  return members.map(name => {
    const p = _leaderboard.find(x => x.name === name);
    return { name, points: p ? p.points : 0 };
  });
}

export async function listTeams() {
  await _delay();
  return _teams.slice();
}

export async function getStaleDocuments() {
  await _delay();
  return _documents.slice();
}

export async function getUserAchievements(username) {
  await _delay();
  const fallback = { commits: 0, timeHours: 0, earned: [] };
  return _playerAchievements[username] || fallback;
}

export function daysSince(date) {
  return Math.ceil(Math.abs(new Date() - new Date(date)) / 86400000);
}
