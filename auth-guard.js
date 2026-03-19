/**
 * auth-guard.js
 * Scottsdale Park Place HOA — shared page protection
 * Usage: call guardPage('resident') or guardPage('board') at bottom of any page
 */

function guardPage(requiredLevel) {
  document.body.style.visibility = 'hidden';

  const _url  = 'https://hmjypvnbbmyzmutmuxpj.supabase.co';
  const _anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtanlwdm5iYm15em11dG11eHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzEzMjQsImV4cCI6MjA4OTM0NzMyNH0.hZNbLus9qjwni5Du8UeFJGK7xXQMtqMAr6URs75aZP8';
  const BOARD = ['board','president','treasurer','secretary','manager'];
  const ALL   = ['owner','renter',...BOARD];

  if (typeof supabase === 'undefined') {
    window.location.href = 'index.html';
    return;
  }

  const _client = supabase.createClient(_url, _anon);

  _client.auth.getSession().then(({ data: { session } }) => {
    if (!session?.user) {
      window.location.href = 'index.html';
      return;
    }
    const role = session.user.user_metadata?.role || 'pending';
    const allowed = requiredLevel === 'board' ? BOARD.includes(role) : ALL.includes(role);
    if (!allowed) { showBlocked(role); return; }
    document.body.style.visibility = 'visible';
  });
}

function showBlocked(role) {
  document.body.style.visibility = 'visible';
  document.body.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
      body{font-family:'DM Sans',sans-serif;background:#0f1115;color:#e8e4dc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
      .bl{text-align:center;max-width:420px;padding:32px;}
      .bl-icon{font-size:3rem;margin-bottom:20px;}
      .bl-title{font-family:'DM Serif Display',serif;font-size:1.6rem;color:#c8a96e;margin-bottom:12px;}
      .bl-msg{font-size:0.88rem;color:#7a8090;line-height:1.7;margin-bottom:24px;}
      .bl-links{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
      .bl-links a{color:#c8a96e;font-size:0.85rem;text-decoration:none;border:1px solid rgba(200,169,110,0.3);border-radius:6px;padding:8px 18px;}
    </style>
    <div class="bl">
      <div class="bl-icon">${role==='pending'?'⏳':'🔒'}</div>
      <div class="bl-title">${role==='pending'?'Awaiting Approval':'Access Restricted'}</div>
      <div class="bl-msg">${role==='pending'?"Your account is pending approval. You'll be notified once access is granted.":"You don't have permission to view this page."}</div>
      <div class="bl-links"><a href="index.html">← Home</a><a href="contact.html">Contact the Board</a></div>
    </div>`;
}
