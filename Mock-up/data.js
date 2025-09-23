
// Här ligger all mock-data + asynkrona "fetchers" som simulerar API-anrop.
// Här kan vi byta till andra dataflöden (mock-filer, eller riktig API (fetch('/api/...')).
// /data.js  (ES module)

const _leaderboard = [
  { name: 'Alice',   points: 2530 },
  { name: 'You',     points: 1250 },
  { name: 'Bob',     points: 1100 },
  { name: 'Charlie', points: 980  },
  { name: 'Diana',   points: 760  },
];

const _teams = [
  { name: 'Team Alpha',   points: 5200 },
  { name: 'Team Beta',    points: 4800 },
  { name: 'Team Gamma',   points: 3900 },
  { name: 'Team Delta',   points: 3100 },
  { name: 'Team Epsilon', points: 2500 },
];

const _teamMembers = {
  'Team Alpha':   ['Alice', 'You'],
  'Team Beta':    ['Bob', 'Charlie'],
  'Team Gamma':   ['Diana'],
  'Team Delta':   [],
  'Team Epsilon': [],
};

const _documents = [
  { name: 'API Documentation',     lastEdited: new Date('2025-08-20') },
  { name: 'User Guide',            lastEdited: new Date('2025-08-01') },
  { name: 'Installation Manual',   lastEdited: new Date('2025-07-15') },
  { name: 'Developer Onboarding',  lastEdited: new Date('2025-06-01') },
  { name: 'Archived Projects',     lastEdited: new Date('2025-03-10') },
];

const _playerAchievements = {
  'Alice':   { commits: 432, timeHours: 250, earned: ['First Commit','Reviewer','First of the Day', 'Team Contributor'] },
  'You':     { commits: 22,  timeHours: 6,   earned: ['First Commit','Reviewer','First of the Day'] },
  'Bob':     { commits: 12,  timeHours: 4,   earned: ['First Commit'] },
  'Charlie': { commits: 10,  timeHours: 3,   earned: ['First Commit'] },
  'Diana':   { commits: 5,   timeHours: 2,   earned: [] },
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
