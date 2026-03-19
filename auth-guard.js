/**
 * auth-guard.js
 * Shared authentication and access control for Scottsdale Park Place HOA
 * Include on every protected page with:
 *   <script src="auth-guard.js"></script>
 *
 * Then call: guardPage(requiredLevel) where requiredLevel is:
 *   'resident'  — owner, renter, board, manager (not pending)
 *   'board'     — board, manager, president, treasurer, secretary only
 *
 * The script will redirect or show a blocked message if access is denied.
 */

const SUPABASE_URL  = 'https://hmjypvnbbmyzmutmuxpj.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtanlwdm5iYm15em11dG11eHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzEzMjQsImV4cCI6MjA4OTM0NzMyNH0.hZNbLus9qjwni5Du8UeFJGK7xXQMtqMAr6URs75aZP8';

const BOARD_ROLES    = ['board', 'president', 'treasurer', 'secretary', 'manager'];
const RESIDENT_ROLES = ['owner', 'renter', ...BOARD_ROLES];

window._sppAuth = {
  user: null,
  session: null,
  client: null,
};

async function guardPage(requiredLevel) {
  // Initialize Supabase client
  window._sppAuth.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  const sb = window._sppAuth.client;

  const { data: { session } } = await sb.auth.getSession();

  if (!session?.user) {
    // Not logged in — redirect to home
    window.location.href = 'index.html';
    return false;
  }

  const meta = session.user.user_metadata || {};
  const role = meta.role || 'pending';

  window._sppAuth.user = {
    id:    session.user.id,
    name:  meta.name || session.user.email.split('@')[0],
    unit:  meta.unit || '',
    role,
    email: session.user.email,
  };
  window._sppAuth.session = session;

  const allowed =
    requiredLevel === 'board'    ? BOARD_ROLES.includes(role) :
    requiredLevel === 'resident' ? RESIDENT_ROLES.includes(role) :
    false;

  if (!allowed) {
    showAccessBlocked(role);
    return false;
  }

  return true;
}

function showAccessBlocked(role) {
  document.body.innerHTML = `
    <style>
      body { font-family: 'DM Sans', sans-serif; background: #0f1115; color: #e8e4dc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
      .blocked { text-align: center; max-width: 420px; padding: 32px; }
      .blocked-icon { font-size: 3rem; margin-bottom: 20px; }
      .blocked-title { font-family: 'DM Serif Display', serif; font-size: 1.6rem; color: #c8a96e; margin-bottom: 12px; }
      .blocked-msg { font-size: 0.88rem; color: #7a8090; line-height: 1.7; margin-bottom: 24px; }
      .blocked-links { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
      .blocked-links a { color: #c8a96e; font-size: 0.85rem; text-decoration: none; border: 1px solid rgba(200,169,110,0.3); border-radius: 6px; padding: 8px 18px; transition: background 0.2s; }
      .blocked-links a:hover { background: rgba(200,169,110,0.1); }
    </style>
    <div class="blocked">
      <div class="blocked-icon">${role === 'pending' ? '⏳' : '🔒'}</div>
      <div class="blocked-title">${role === 'pending' ? 'Awaiting Approval' : 'Access Restricted'}</div>
      <div class="blocked-msg">
        ${role === 'pending'
          ? 'Your account is pending approval by the board or property manager. You\'ll receive an email once your access has been granted.'
          : 'You don\'t have permission to view this page. Contact the board if you believe this is an error.'
        }
      </div>
      <div class="blocked-links">
        <a href="index.html">← Home</a>
        <a href="contact.html">Contact the Board</a>
      </div>
    </div>`;
}
