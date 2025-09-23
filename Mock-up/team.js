// /team.js (ES module)
import { getTeam, getTeamRoster } from './data.js';

function memberRow({ name, points }) {
  const div = document.createElement('div');
  div.className = 'activity-item'; // återanvänder din list-stil
  div.innerHTML = `
    <span><a href="user_profile.html?user=${encodeURIComponent(name)}">${name}</a></span>
    <span>${points} pts</span>
  `;
  return div;
}

async function render() {
  const params = new URLSearchParams(location.search);
  const teamName = params.get('team') || '';

  const header = document.getElementById('team-profile-header');
  const summary = document.getElementById('team-summary');
  const rosterWrap = document.getElementById('team-roster-container');

  if (!header || !summary || !rosterWrap) return;

  // Teammeta
  const team = await getTeam(teamName);
  header.textContent = team ? team.name : (teamName || 'Unknown Team');

  summary.innerHTML = team
    ? `<p><strong>Total points:</strong> ${team.points}</p>`
    : `<p>Team not found.</p>`;

  // Roster
  rosterWrap.innerHTML = '';
  const roster = await getTeamRoster(teamName);
  if (!roster.length) {
    rosterWrap.innerHTML = '<p>No members yet.</p>';
    return;
  }
  roster
    .sort((a, b) => b.points - a.points)
    .forEach(m => rosterWrap.appendChild(memberRow(m)));
}

document.addEventListener('DOMContentLoaded', render);
