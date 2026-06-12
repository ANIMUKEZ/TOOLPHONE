/* ═══════════════════════════════════════════
   StreamView Mobile — app.js
═══════════════════════════════════════════ */

const LS_STREAM  = 'sv_stream';
const LS_CHANNEL = 'sv_channel';

// ── Parsers ────────────────────────────────

function buildOkruEmbed(raw) {
  raw = raw.trim();

  if (raw.includes('ok.ru/videoembed/')) {
    try {
      const u = new URL(raw);
      u.searchParams.set('autoplay', '1');
      return u.toString();
    } catch (_) { return null; }
  }

  const m = raw.match(/ok\.ru\/(?:live|video|videoembed)\/(\d+)/i);
  if (m) return `https://ok.ru/videoembed/${m[1]}?autoplay=1`;

  if (/^\d+$/.test(raw)) return `https://ok.ru/videoembed/${raw}?autoplay=1`;

  try {
    const u = new URL(raw);
    if (u.hostname.includes('ok.ru')) {
      const parts = u.pathname.split('/').filter(Boolean);
      const id = parts[parts.length - 1];
      if (id && /\d/.test(id)) return `https://ok.ru/videoembed/${id}?autoplay=1`;
    }
  } catch (_) {}

  return null;
}

function parseTwitchChannel(raw) {
  raw = raw.trim();
  try {
    const u = new URL(raw);
    if (u.hostname.includes('twitch.tv')) {
      const parts = u.pathname.split('/').filter(Boolean);
      return parts[0] || null;
    }
  } catch (_) {}
  const clean = raw.replace(/^@/, '').split('/')[0].trim();
  return clean || null;
}

// ── UI helpers ─────────────────────────────

function setError(inputEl, msg) {
  inputEl.classList.add('error');
  inputEl.title = msg;
  inputEl.addEventListener('input', function clear() {
    inputEl.classList.remove('error');
    inputEl.title = '';
    inputEl.removeEventListener('input', clear);
  }, { once: true });
}

function clearError(inputEl) {
  inputEl.classList.remove('error');
  inputEl.title = '';
}

// ── Main launch ────────────────────────────

function launchViewer() {
  const streamInput  = document.getElementById('stream-url');
  const channelInput = document.getElementById('twitch-channel');

  const streamVal  = streamInput.value.trim();
  const channelVal = channelInput.value.trim();

  let ok = true;

  if (!streamVal && !channelVal) {
    setError(streamInput,  'Introduce la URL del stream');
    setError(channelInput, 'O al menos el canal de Twitch');
    return;
  }

  // — Stream OK.RU —
  if (streamVal) {
    const embedUrl = buildOkruEmbed(streamVal);
    if (!embedUrl) {
      setError(streamInput, 'URL no reconocida. Ej: https://ok.ru/live/123456789');
      ok = false;
    } else {
      clearError(streamInput);
      document.getElementById('stream-frame').src = embedUrl;
      localStorage.setItem(LS_STREAM, streamVal);
    }
  }

  // — Twitch chat —
  if (channelVal) {
    const channel = parseTwitchChannel(channelVal);
    if (!channel) {
      setError(channelInput, 'Nombre de canal no válido');
      ok = false;
    } else {
      clearError(channelInput);
      const parent  = window.location.hostname || 'localhost';
      const chatUrl = `https://www.twitch.tv/embed/${channel}/chat?darkpopout&parent=${parent}`;
      document.getElementById('chat-frame').src = chatUrl;
      document.getElementById('chat-label').textContent = `CHAT · ${channel}`;
      document.getElementById('topbar-channel').textContent = streamVal
        ? `OK.RU + ${channel}`
        : channel;
      localStorage.setItem(LS_CHANNEL, channelVal);
    }
  }

  if (!ok) return;

  // Ocultar setup y mostrar viewer
  document.getElementById('setup-overlay').classList.add('hidden');
  document.getElementById('viewer').classList.remove('hidden');

  // Forzar repintado en Safari para evitar frames vacíos
  window.scrollTo(0, 0);
}

// ── Reabrir setup (botón ⚙) ───────────────

function openSetup() {
  document.getElementById('viewer').classList.add('hidden');
  document.getElementById('setup-overlay').classList.remove('hidden');
  // Limpiamos los iframes para liberar recursos
  document.getElementById('stream-frame').src = '';
  document.getElementById('chat-frame').src   = '';
}

// ── Init ───────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Restaurar valores guardados
  const savedStream  = localStorage.getItem(LS_STREAM);
  const savedChannel = localStorage.getItem(LS_CHANNEL);
  if (savedStream)  document.getElementById('stream-url').value     = savedStream;
  if (savedChannel) document.getElementById('twitch-channel').value = savedChannel;

  // Enter en cualquier input lanza el viewer
  ['stream-url', 'twitch-channel'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        launchViewer();
      }
    });
  });

  // Si había datos guardados, mostrar hint visual en el botón
  if (savedStream || savedChannel) {
    const btn = document.getElementById('btn-go');
    btn.textContent = '▶  Retomar sesión';
  }
});

// ── Evitar scroll rebote en iOS (body fixed) ──
document.addEventListener('touchmove', e => {
  if (e.target === document.body) e.preventDefault();
}, { passive: false });
