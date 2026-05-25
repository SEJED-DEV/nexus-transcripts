// =============================
// NEXUS TRANSCRIPTS WEBSITE JS
// =============================

// ===== NAV SCROLL =====
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.style.background = window.scrollY > 30
    ? 'rgba(7,8,15,0.95)'
    : 'rgba(7,8,15,0.8)';
}, { passive: true });

// ===== MOBILE NAV =====
const navMobileBtn = document.getElementById('navMobileBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
navMobileBtn.addEventListener('click', () => {
  mobileDrawer.classList.toggle('open');
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileDrawer.classList.remove('open'));
});

// ===== INSTALL BOX COPY =====
const installCopyBtn = document.getElementById('installCopyBtn');
const installCmd = document.getElementById('installCmd');
installCopyBtn.addEventListener('click', () => {
  copyToClipboard(installCmd.textContent.trim());
});

// ===== PACKAGE SWITCHER =====
document.querySelectorAll('.pkg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pkg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    installCmd.textContent = btn.dataset.pkg;
  });
});

// ===== DOCS TABS =====
document.querySelectorAll('.doc-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.doc-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.doc-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('tab-' + tab.dataset.tab);
    if (panel) panel.classList.add('active');
  });
});

// ===== THEME CARDS =====
document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
  });
});

// ===== PLAYGROUND CODE GENERATOR =====
const playgroundState = {
  returnType: 'attachment',
  limit: 100,
  inlineAvatars: false,
  inlineImages: false,
};

function generateCode() {
  const { returnType, limit, inlineAvatars, inlineImages } = playgroundState;
  const lines = [];

  lines.push(`<span class="kw">import</span> { createTranscript } <span class="kw">from</span> <span class="str">'nexus-transcripts'</span>;`);
  lines.push('');
  lines.push(`<span class="cmt">// Inside your Discord.js command or event handler:</span>`);
  lines.push(`<span class="kw">const</span> transcript = <span class="kw">await</span> createTranscript(channel, {`);
  lines.push(`  limit: <span class="num">${limit}</span>,`);
  lines.push(`  returnType: <span class="str">'${returnType}'</span>,`);
  if (returnType === 'attachment') {
    lines.push(`  fileName: <span class="str">\`transcript-\${channel.name}.html\`</span>,`);
  }
  if (inlineAvatars) {
    lines.push(`  inlineAvatars: <span class="kw">true</span>,`);
  }
  if (inlineImages) {
    lines.push(`  inlineImages: <span class="kw">true</span>,`);
  }
  lines.push(`});`);
  lines.push('');

  if (returnType === 'attachment') {
    lines.push(`<span class="cmt">// Send as a file in Discord</span>`);
    lines.push(`<span class="kw">await</span> message.reply({ files: [transcript] });`);
  } else if (returnType === 'string') {
    lines.push(`<span class="cmt">// Save to disk or process the HTML string</span>`);
    lines.push(`fs.writeFileSync(<span class="str">'transcript.html'</span>, transcript);`);
  } else if (returnType === 'buffer') {
    lines.push(`<span class="cmt">// Use the raw Buffer directly</span>`);
    lines.push(`<span class="kw">const</span> buf = transcript; <span class="cmt">// Buffer</span>`);
  }

  const codeEl = document.getElementById('generatedCode');
  if (codeEl) codeEl.innerHTML = lines.join('\n');
}

// Return type selector
document.querySelectorAll('.config-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.key;
    document.querySelectorAll(`.config-opt[data-key="${key}"]`).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    playgroundState[key] = btn.dataset.val;
    generateCode();
  });
});

// Limit slider
const limitSlider = document.getElementById('limitSlider');
const limitVal = document.getElementById('limitVal');
if (limitSlider) {
  limitSlider.addEventListener('input', () => {
    playgroundState.limit = parseInt(limitSlider.value);
    limitVal.textContent = limitSlider.value;
    generateCode();
  });
}

// Toggles
['toggleAvatars', 'toggleImages'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', () => {
    el.classList.toggle('on');
    playgroundState[el.dataset.key] = el.classList.contains('on');
    generateCode();
  });
});

// Init generate
generateCode();

// ===== CODE BLOCK COPY =====
function copyCode(btn) {
  const pre = btn.closest('.code-block').querySelector('pre');
  copyToClipboard(pre.textContent.trim());
}
window.copyCode = copyCode;

// ===== UTILS =====
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('Copied to clipboard!');
  }
}

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = '✅ ' + msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ===== INTERSECTION OBSERVER (fade-in on scroll) =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.feature-card, .theme-card, .stat-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.feature-card, .theme-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.04}s`;
  });
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    document.querySelectorAll('.feature-card, .theme-card, .stat-card').forEach(el => {
      if (!el.classList.contains('visible')) observer.observe(el);
    });
  }
});

// Apply visible class styles via CSS injection
const style = document.createElement('style');
style.textContent = `.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);
