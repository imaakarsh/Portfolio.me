import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  signInWithPopup, 
  getRedirectResult, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';

export function initGuestbook() {
  // ---- Auto-redirect 127.0.0.1 to localhost for Firebase Auth compatibility ----
  if (window.location.hostname === '127.0.0.1') {
    window.location.hostname = 'localhost';
    return; // Stop execution on this page as it's redirecting
  }

  const firebaseConfig = {
    apiKey: "AIzaSyD" + "LgDT3anDK" + "S3I9N47mG" + "FacUW5QJ8hQ90E",
    authDomain: "aakarsh-portfolio.firebaseapp.com",
    projectId: "aakarsh-portfolio",
    storageBucket: "aakarsh-portfolio.firebasestorage.app",
    messagingSenderId: "668776750805",
    appId: "1:668776750805:web:65ead8e9b3502674774c5c",
    measurementId: "G-ZQZBSBD4LR"
  };

  // ---- Initialise Firebase Modular ----
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // ---- DOM refs ----
  const authPanel = document.getElementById('gb-auth-panel') as HTMLElement | null;
  const composePanel = document.getElementById('gb-compose-panel') as HTMLElement | null;
  const signinBtn = document.getElementById('guestbook-signin-btn') as HTMLButtonElement | null;
  const signoutBtn   = document.getElementById('gb-signout-btn') as HTMLElement | null;
  const userAvatar   = document.getElementById('gb-user-avatar') as HTMLElement | null;
  const userName     = document.getElementById('gb-user-name') as HTMLElement | null;
  const textarea     = document.getElementById('gb-textarea') as HTMLTextAreaElement | null;
  const charCount    = document.getElementById('gb-chars') as HTMLElement | null;
  const submitBtn    = document.getElementById('gb-submit-btn') as HTMLButtonElement | null;
  const commentsList = document.getElementById('gb-comments-list') as HTMLElement | null;
  const loadingEl    = document.getElementById('gb-loading') as HTMLElement | null;

  if (!commentsList) return; // Guard clause if guestbook isn't on page

  // ---- Avatar colours (for letter avatars) ----
  const AVATAR_COLORS = [
    '#6366f1','#f97316','#22c55e','#0ea5e9',
    '#a855f7','#ec4899','#eab308','#14b8a6'
  ];
  function colorForName(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  // ---- Format timestamp ----
  function formatDate(ts: any): string {
    if (!ts) return '';
    const d = ts && typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // ---- Escape HTML ----
  function escHtml(str: string): string {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
              .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // ---- Render a single comment entry ----
  function renderEntry(docSnap: any, currentUid: string | null): HTMLElement {
    const data = docSnap.data();
    const id = docSnap.id;
    const { name, photoURL, message, createdAt, uid } = data as any;
    const el = document.createElement('div');
    el.className = 'guestbook-entry';

    const avatarHtml = photoURL
      ? `<div class="gb-avatar gb-avatar--img">
           <img src="${escHtml(photoURL)}" alt="${escHtml(name)}"
                onerror="this.parentElement.style.background='${colorForName(name)}';
                         this.parentElement.textContent='${escHtml(name[0])}';
                         this.parentElement.classList.add('gb-avatar--letter');">
         </div>`
      : `<div class="gb-avatar gb-avatar--letter" style="--av-color:${colorForName(name)};">
           ${escHtml(name[0])}
         </div>`;

    const isOwner = currentUid && currentUid === uid;

    const deleteBtnHtml = isOwner 
      ? `<button class="gb-delete-btn" data-id="${id}" aria-label="Delete message" title="Delete message">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <polyline points="3 6 5 6 21 6"></polyline>
             <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
           </svg>
         </button>` 
      : '';

    el.innerHTML = `
      ${avatarHtml}
      <div class="gb-body">
        <div class="gb-meta">
          <span class="gb-name">${escHtml(name)}</span>
          <span class="gb-date">${formatDate(createdAt)}</span>
          ${deleteBtnHtml}
        </div>
        <div class="gb-message">${escHtml(message)}</div>
      </div>`;

    if (isOwner) {
      const delBtn = el.querySelector('.gb-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', async () => {
          if (confirm('Are you sure you want to delete this message?')) {
            try {
              await deleteDoc(doc(db, 'guestbook', id));
            } catch (err: any) {
              console.error('Delete error:', err);
              alert('Failed to delete message: ' + (err?.message ?? String(err)));
            }
          }
        });
      }
    }

    return el;
  }

  let currentMessagesSnapshot: any = null;
  let visibleCount = 5;

  function renderMessages(snapshot: any) {
    if (!commentsList) return;
    commentsList.querySelectorAll('.guestbook-entry').forEach(e => e.remove());
    commentsList.querySelectorAll('.gb-empty').forEach(e => e.remove());
    const existingMoreBtn = commentsList.querySelector('.gb-show-more-wrap');
    if (existingMoreBtn) existingMoreBtn.remove();

    if (!snapshot || snapshot.empty) {
      commentsList.innerHTML = '<p class="gb-empty">No messages yet. Be the first!</p>';
      return;
    }

    const currentUid = auth.currentUser ? (auth.currentUser as any).uid : null;
    const docsArray = snapshot.docs as any[];
    
    // Render up to visibleCount messages
    for (let i = 0; i < Math.min(docsArray.length, visibleCount); i++) {
      commentsList.appendChild(renderEntry(docsArray[i], currentUid));
    }

    // Add View More / View Less buttons if needed
    if (docsArray.length > 5) {
      const moreWrap = document.createElement('div');
      moreWrap.className = 'gb-show-more-wrap';
      moreWrap.style.textAlign = 'center';
      moreWrap.style.marginTop = '20px';
      moreWrap.style.display = 'flex';
      moreWrap.style.justifyContent = 'center';
      moreWrap.style.gap = '12px';
      
      if (docsArray.length > visibleCount) {
        const moreBtn = document.createElement('button');
        moreBtn.className = 'btn-outline';
        moreBtn.innerHTML = `View More (${docsArray.length - visibleCount} remaining)`;
        moreBtn.onclick = () => {
          visibleCount += 5;
          renderMessages(currentMessagesSnapshot);
        };
        moreWrap.appendChild(moreBtn);
      }

      if (visibleCount > 5) {
        const lessBtn = document.createElement('button');
        lessBtn.className = 'btn-outline';
        lessBtn.innerHTML = 'View Less';
        lessBtn.onclick = () => {
          visibleCount = 5;
          renderMessages(currentMessagesSnapshot);
        };
        moreWrap.appendChild(lessBtn);
      }
      
        commentsList.appendChild(moreWrap);
    }
  }

  // ---- Load messages (real-time) ----
  function loadMessages() {
    const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
      if (loadingEl && loadingEl.parentNode) loadingEl.remove();
      currentMessagesSnapshot = snapshot;
      renderMessages(snapshot);
    }, (err: any) => {
      console.error('Firestore error:', err);
      if (loadingEl) loadingEl.textContent = 'Could not load messages.';
    });
  }

  // ---- Auth state ----
  onAuthStateChanged(auth, (user: any) => {
    if (user) {
      if (authPanel) authPanel.style.display  = 'none';
      if (composePanel) composePanel.style.display = '';

      if (userName) userName.textContent = user.displayName || 'Anonymous';
      if (userAvatar) {
        if (user.photoURL) {
          userAvatar.innerHTML = `<img src="${escHtml(user.photoURL)}" alt="${escHtml(user.displayName || 'User')}">`;
        } else {
          userAvatar.classList.add('gb-avatar--letter');
          userAvatar.style.setProperty('--av-color', colorForName(user.displayName || 'A'));
          userAvatar.textContent = (user.displayName || 'A')[0];
        }
      }
    } else {
      if (authPanel) authPanel.style.display  = '';
      if (composePanel) composePanel.style.display = 'none';
    }

    if (currentMessagesSnapshot) {
      renderMessages(currentMessagesSnapshot);
    }
  });

  // ---- Sign in with Google ----
  if (signinBtn) {
    signinBtn.addEventListener('click', async () => {
      signinBtn.disabled = true;
      signinBtn.textContent = 'Signing in…';
      
      const resetBtnTimeout = setTimeout(() => {
        if (signinBtn) {
          signinBtn.disabled = false;
          signinBtn.innerHTML = 'Sign in with Google (Stuck?)';
        }
      }, 10000);

      try {
        const provider = new GoogleAuthProvider();
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          await signInWithRedirect(auth, provider);
        } else {
          await signInWithPopup(auth, provider);
        }
      } catch (err: any) {
        clearTimeout(resetBtnTimeout);
        console.error('Sign-in error:', err);
        
        if (signinBtn) {
          signinBtn.disabled = false;
          signinBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign in failed`;
        }
          
        let errEl = document.getElementById('gb-auth-error');
        if (!errEl) {
          errEl = document.createElement('p');
          errEl.id = 'gb-auth-error';
          errEl.style.color = '#ef4444';
          errEl.style.fontSize = '0.85rem';
          errEl.style.marginTop = '0.75rem';
          if (signinBtn && signinBtn.parentNode) signinBtn.parentNode.appendChild(errEl);
        }
        errEl.textContent = (err && err.message) ? err.message : String(err);
      }
    });
  }

  // ---- Handle redirect errors (if any) ----
  getRedirectResult(auth).catch((err: any) => {
    console.error('Redirect sign-in error:', err);
    alert('Redirect error: ' + (err?.message ?? String(err)));
  });

  // ---- Sign out ----
  if (signoutBtn) {
    signoutBtn.addEventListener('click', () => signOut(auth));
  }

  // ---- Character counter ----
  if (textarea) {
    textarea.addEventListener('input', () => {
      if (charCount) charCount.textContent = String(textarea.value.length);
      if (submitBtn) submitBtn.disabled = textarea.value.trim().length === 0;
    });
  }

  // ---- Submit message ----
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      if (!textarea) return;
      const msg = textarea.value.trim();
      if (!msg) return;

      const user = auth.currentUser as any;
      if (!user) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting…';

      try {
        await addDoc(collection(db, 'guestbook'), {
          name:      user.displayName || 'Anonymous',
          photoURL:  user.photoURL || null,
          uid:       user.uid,
          message:   msg,
          createdAt: serverTimestamp()
        });
        textarea.value = '';
        if (charCount) charCount.textContent = '0';
      } catch (err: any) {
        console.error('Post error:', err);
        alert('Could not post message. Please try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post message';
      }
    });
  }

  // ---- Kick off ----
  loadMessages();
}
