const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('background.js', 'utf8');

function extractFunction(name) {
  const markers = [`async function ${name}(`, `function ${name}(`];
  const start = markers
    .map((marker) => source.indexOf(marker))
    .find((index) => index >= 0);
  if (start < 0) {
    throw new Error(`missing function ${name}`);
  }

  let parenDepth = 0;
  let signatureEnded = false;
  let braceStart = -1;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '(') {
      parenDepth += 1;
    } else if (ch === ')') {
      parenDepth -= 1;
      if (parenDepth === 0) {
        signatureEnded = true;
      }
    } else if (ch === '{' && signatureEnded) {
      braceStart = i;
      break;
    }
  }

  let depth = 0;
  let end = braceStart;
  for (; end < source.length; end += 1) {
    const ch = source[end];
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        end += 1;
        break;
      }
    }
  }

  return source.slice(start, end);
}

test('step 6 cookie cleanup reads the latest persisted delay before waiting', async () => {
  const api = new Function(`
const STEP6_COOKIE_CLEAR_DELAY_SECONDS_MIN = 0;
const STEP6_COOKIE_CLEAR_DELAY_SECONDS_MAX = 300;
const DEFAULT_STEP6_COOKIE_CLEAR_DELAY_SECONDS = 25;
const PRE_LOGIN_COOKIE_CLEAR_DOMAINS = ['chatgpt.com', 'openai.com'];
const PRE_LOGIN_COOKIE_CLEAR_ORIGINS = ['https://chatgpt.com', 'https://openai.com'];
const logs = [];
const sleeps = [];
const removed = [];
const chrome = {
  cookies: {
    getAll: async () => [
      { domain: '.chatgpt.com', path: '/', name: 'session' },
      { domain: 'example.com', path: '/', name: 'keep' },
    ],
    remove: async (details) => {
      removed.push(details);
      return details;
    },
  },
  browsingData: {
    removeCookies: async () => {},
  },
};
let persistedSettings = { step6CookieClearDelaySeconds: 7 };
async function getPersistedSettings() { return persistedSettings; }
async function addLog(message, level) { logs.push({ message, level }); }
async function sleepWithStop(ms) { sleeps.push(ms); }
function throwIfStopped() {}
function getErrorMessage(error) { return error?.message || String(error); }
const LOG_PREFIX = '[test]';
${extractFunction('normalizeStep6CookieClearDelaySeconds')}
${extractFunction('getStep6CookieClearDelayMs')}
${extractFunction('normalizeCookieDomainForMatch')}
${extractFunction('shouldClearPreLoginCookie')}
${extractFunction('buildCookieRemovalUrl')}
${extractFunction('collectCookiesForPreLoginCleanup')}
${extractFunction('removeCookieDirectly')}
${extractFunction('runPreStep6CookieCleanup')}
return {
  logs,
  sleeps,
  removed,
  setDelay: (value) => { persistedSettings = { step6CookieClearDelaySeconds: value }; },
  runPreStep6CookieCleanup,
};
`)();

  await api.runPreStep6CookieCleanup();
  api.setDelay(2);
  await api.runPreStep6CookieCleanup();

  assert.deepStrictEqual(api.sleeps, [7000, 2000]);
  const waitLogs = api.logs
    .map((entry) => entry.message)
    .filter((message) => /开始前等待/.test(message));
  assert.match(waitLogs[0], /等待 7 秒/);
  assert.match(waitLogs[1], /等待 2 秒/);
  assert.deepStrictEqual(api.removed.map((entry) => entry.name), ['session', 'session']);
});
