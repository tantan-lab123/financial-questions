/* ==========================================================================
   Site configuration - the only file you normally need to edit.
   (Loaded before app.js)
   ========================================================================== */
window.APP_CONFIG = {
  // Where the completed questionnaire is POSTed (n8n webhook).
  WEBHOOK_URL: 'https://n8n.invite2you.com/webhook/financial-survey',

  // Version of the JSON structure that is sent. Bump it when fields change,
  // so the receiving side (n8n / database) knows how to read old and new files.
  SCHEMA_VERSION: '2.0',

  // Version of privacy.html that the client agreed to. Bump it when the policy changes.
  POLICY_VERSION: '2026-10-09',

  // Advisors shown on the success screen (WhatsApp "we are done" message - optional bonus).
  ADVISORS: [
    { id: 'eitan', name: 'איתן', whatsapp: '972584442400' },
    { id: 'maor', name: 'מאור', whatsapp: '972503333164' }
  ],

  // Free anti-spam protection with Cloudflare Turnstile (https://dash.cloudflare.com -> Turnstile).
  // Paste the *Site Key* here to turn it on. Leave empty to keep it off.
  // The Secret Key must only live in n8n (verification step), never in this repository.
  TURNSTILE_SITE_KEY: '',

  // Minimum seconds between two submissions from the same browser (prevents double-clicks / flooding).
  SUBMIT_COOLDOWN_SECONDS: 60,

  // A saved draft that is older than this many days is deleted automatically (privacy).
  DRAFT_MAX_AGE_DAYS: 14,

  // Webhook request: timeout per attempt and number of attempts.
  SUBMIT_TIMEOUT_MS: 20000,
  SUBMIT_ATTEMPTS: 3
};
