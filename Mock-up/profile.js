// /profile.js (ES module)
import { getUserAchievements, getCurrentUser } from './data.js';

function makeItem({icon, title, desc, earned=false, progress=null}) {
  const wrap = document.createElement('div');
  wrap.className = 'achievement-item' + (earned ? ' achievement-item--earned' : '');
  const progHtml = progress
    ? `<div class="achievement-progress"><div class="achievement-progress-bar" style="width:${progress.pct}%"></div></div>
       <span class="progress-text">${progress.text}</span>`
    : '';
  wrap.innerHTML = `
    <div class="achievement-item__icon">${icon}</div>
    <div class="achievement-item__details">
      <h4>${title}</h4>
      <p>${desc}</p>
      ${progHtml}
    </div>
  `;
  return wrap;
}

async function render() {
  const container = document.getElementById('user-achievements-container');
  if (!container) return;

  const params = new URLSearchParams(location.search);
  let userParam = (params.get('user') || '').trim();
  const currentUser = (await getCurrentUser()) || '';

  // Räkna detta som "min profil" om:
  // - userParam är "You", eller
  // - userParam matchar inloggat namn (case-insensitive), eller
  // - userParam saknas helt (fallback)
  const isMyProfile =
    !userParam ||
    userParam === 'You' ||
    (currentUser && userParam.toLowerCase() === currentUser.toLowerCase());

  // Namn att visa i UI (inte nyckeln)
  const displayName = isMyProfile ? (currentUser || 'You') : userParam;

  const header1 = document.getElementById('user-profile-header');
  const header2 = document.getElementById('user-achievements-header');

  // ✅ Ingen mer "You's Profile"
  if (header1) header1.textContent = isMyProfile ? 'My Profile & Progress' : `${displayName}'s Profile`;
  if (header2) header2.textContent = isMyProfile ? 'Your Achievements' : 'Achievements';

  // Hämta data på den kanoniska nyckeln (behåll userParam som kom in)
  const data = await getUserAchievements(userParam || 'You');
  container.innerHTML = '';

  // Overall progress
  const allBadges = [
    'First Commit','Reviewer','First of the Day','Team Contributor',
    'Commit Milestone: 25','Commit Milestone: 50','Commit Milestone: 100',
    'Commit Milestone: 200','Commit Milestone: 500','Documentation Time'
  ];
  const earnedCount = allBadges.filter(b =>
    data.earned.includes(b) ||
    (b==='Commit Milestone: 25'  && data.commits >= 25)  ||
    (b==='Commit Milestone: 50'  && data.commits >= 50)  ||
    (b==='Commit Milestone: 100' && data.commits >= 100) ||
    (b==='Commit Milestone: 200' && data.commits >= 200) ||
    (b==='Commit Milestone: 500' && data.commits >= 500)
  ).length;
  const overallPct = Math.round((earnedCount / allBadges.length) * 100);

  const overall = document.createElement('div');
  overall.className = 'card';
  overall.innerHTML = `
    <h3 style="margin:0 0 .5rem 0;">Overall Progress</h3>
    <div class="achievement-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${overallPct}" aria-label="Overall completion">
      <div class="achievement-progress-bar" style="width:${overallPct}%"></div>
    </div>
    <span class="progress-text">${overallPct}% complete (${earnedCount} of ${allBadges.length})</span>
  `;
  container.appendChild(overall);

  const list = document.createElement('div');
  list.className = 'achievements-container card';

  // Earned/simple
  list.appendChild(makeItem({
    icon:'🏆', title:'First Commit', desc:'Your first documentation contribution.',
    earned: data.earned.includes('First Commit') || data.commits > 0
  }));
  list.appendChild(makeItem({
    icon:'👀', title:'Reviewer', desc:'Reviewed a colleague\'s work.',
    earned: data.earned.includes('Reviewer')
  }));
  list.appendChild(makeItem({
    icon:'☀️', title:'First of the Day', desc:'First commit of the day.',
    earned: data.earned.includes('First of the Day')
  }));
  list.appendChild(makeItem({
    icon:'👥', title:'Team Contributor', desc:'Contributed to a team doc.',
    earned: data.earned.includes('Team Contributor')
  }));

  // Progressbaserade
  const timePct = Math.min(100, Math.round((data.timeHours / 10) * 100));
  list.appendChild(makeItem({
    icon:'⏱️', title:'Documentation Time', desc:'Total time spent actively writing documentation.',
    progress: { pct: timePct, text: `${data.timeHours} of 10 hours logged` },
    earned: timePct >= 100
  }));

  const mk = (need, icon, title) => ({
    icon, title, desc:`Make ${need} documentation commits.`,
    progress: { pct: Math.round((Math.min(need, data.commits)/need)*100), text: `${Math.min(need, data.commits)}/${need} Commits` },
    earned: data.commits >= need
  });

  list.appendChild(makeItem(mk(10,  '📈', 'Commit Milestone: 10')));
  list.appendChild(makeItem(mk(25,  '📈', 'Commit Milestone: 25')));
  list.appendChild(makeItem(mk(50,  '🚀', 'Commit Milestone: 50')));
  list.appendChild(makeItem(mk(100, '🎆', 'Commit Milestone: 100')));
  list.appendChild(makeItem(mk(200, '🏅', 'Commit Milestone: 200')));
  list.appendChild(makeItem(mk(500, '🎖️', 'Commit Milestone: 500')));

  container.appendChild(list);
}

document.addEventListener('DOMContentLoaded', render);
