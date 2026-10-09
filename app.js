/* ==========================================================================
   Client-side Logic: Hebrew 5-Step Financial consultation Wizard
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM ELEMENTS ---
  const form = document.getElementById('questionnaireForm');
  const nextBtn = document.getElementById('nextBtn');
  const backBtn = document.getElementById('backBtn');
  const progressBar = document.getElementById('progressBar');
  const stepDots = document.querySelectorAll('.step-dot');
  const progressContainer = document.querySelector('.progress-container');
  
  // Conditional Containers
  const condSingleParent = document.getElementById('conditional_single_parent');
  const condSecondMarriage = document.getElementById('conditional_second_marriage');
  const condSelfEmployed = document.getElementById('conditional_self_employed');
  
  // Conditional Toggle Checkboxes
  const toggleSingleParentCheckbox = document.getElementById('toggle_single_parent');
  const toggleSecondMarriageCheckbox = document.getElementById('toggle_second_marriage');
  const toggleSelfEmployedCheckbox = document.getElementById('toggle_self_employed');
  
  // Form Status & Control Elements
  const fillDateInput = document.getElementById('fill_date');
  const maritalStatusSelect = document.getElementById('marital_status');
  const marriageDurationContainer = document.getElementById('marriage_duration_container');
  const previousMarriageSelect = document.getElementById('previous_marriage');
  const p1EmploymentTypeSelect = document.getElementById('p1_employment_type');
  const p2EmploymentTypeSelect = document.getElementById('p2_employment_type');
  
  const hasEmergencyFundSelect = document.getElementById('has_emergency_fund');
  const emergencyFundAmountContainer = document.getElementById('emergency_fund_amount_container');
  
  // Modal Elements
  const successModal = document.getElementById('successModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  
  // Draft Status Elements
  const draftStatusText = document.getElementById('draftStatus');
  const clearDraftBtn = document.getElementById('clearDraftBtn');
  const uploadJsonBtn = document.getElementById('uploadJsonBtn');
  const downloadDraftBtn = document.getElementById('downloadDraftBtn');
  const jsonFileInput = document.getElementById('jsonFileInput');
  const notification = document.getElementById('notification');

  // Floating Action Bar Elements
  const floatingActionBar = document.getElementById('floatingActionBar');
  const floatingBackBtn = document.getElementById('floatingBackBtn');
  const floatingNextBtn = document.getElementById('floatingNextBtn');
  const floatingStepBadge = document.getElementById('floatingStepBadge');
  const floatingStepName = document.getElementById('floatingStepName');
  const floatingSaveText = document.getElementById('floatingSaveText');

  // Mobile Recommendation Modal
  const mobileRecModal = document.getElementById('mobileRecommendationModal');
  const continueOnMobileBtn = document.getElementById('continueOnMobileBtn');
  const sendSelfWhatsappBtn = document.getElementById('sendSelfWhatsappBtn');

  // Prep Checklist
  const prepChecklistToggle = document.getElementById('prepChecklistToggle');
  const prepChecklistCard = document.getElementById('prepChecklistCard');

  // Expenses Filter
  const expenseSearchInput = document.getElementById('expenseSearchInput');
  const clearExpenseSearch = document.getElementById('clearExpenseSearch');
  const expenseCategoryTabs = document.getElementById('expenseCategoryTabs');

  // Sticky Step Sidebar Elements
  const stepSidebar = document.getElementById('stepSidebar');
  const sidebarStepBadge = document.getElementById('sidebarStepBadge');
  const sidebarNavList = document.getElementById('sidebarNavList');
  const sidebarProgressBar = document.getElementById('sidebarProgressBar');
  const sidebarScrollTopBtn = document.getElementById('sidebarScrollTopBtn');

  // --- STATE ---
  let currentStep = 1;
  const TOTAL_STEPS = 5;
  const visitedSteps = new Set();

  const STEP_TITLES = {
    1: 'פרטים אישיים ומצב משפחתי',
    2: 'תזרים חודשי',
    3: 'מאזן נכסים והתחייבויות',
    4: 'פנסיה וביטוח',
    5: 'יעדים וציפיות'
  };

  const STEP_SECTIONS = {
    1: [
      { id: 'prepChecklistCard', title: 'הכנת מסמכים', icon: '📋' },
      { id: 'partner1_fieldset', title: 'בן/בת זוג 1 (עיקרי)', icon: '👤' },
      { id: 'partner2_fieldset', title: 'בן/בת זוג 2', icon: '👥' },
      { id: 'family_status_fieldset', title: 'מצב משפחתי', icon: '💍' },
      { id: 'children_section', title: 'ילדים', icon: '👶' },
      { id: 'circle_section', title: 'מעגל קרוב', icon: '🤝' }
    ],
    2: [
      { id: 'step2KpiCard', title: 'תזרים חודשי חי', icon: '📊' },
      { id: 'p1_income_fieldset', title: 'הכנסות בן זוג 1', icon: '💰' },
      { id: 'p2_income_fieldset', title: 'הכנסות בן זוג 2', icon: '💵' },
      { id: 'additional_income_section', title: 'הכנסות נוספות', icon: '➕' },
      { id: 'expenses_section', title: 'פירוט הוצאות', icon: '💳' }
    ],
    3: [
      { id: 'step3KpiCard', title: 'מאזן שווי נקי חי', icon: '📈' },
      { id: 'real_estate_section', title: 'נדל"ן ונכסים', icon: '🏠' },
      { id: 'mortgages_section', title: 'משכנתאות', icon: '📜' },
      { id: 'vehicles_section', title: 'רכבים וכלי תחבורה', icon: '🚗' },
      { id: 'bank_accounts_section', title: 'חשבונות בנק ועו"ש', icon: '🏦' },
      { id: 'credit_cards_section', title: 'כרטיסי אשראי', icon: '💳' },
      { id: 'financial_assets_section', title: 'נכסים פיננסיים', icon: '🪙' },
      { id: 'liabilities_section', title: 'הלוואות והתחייבויות', icon: '📉' }
    ],
    4: [
      { id: 'pensions_section', title: 'פנסיה ומנהלים', icon: '🏦' },
      { id: 'allowances_section', title: 'קצבאות', icon: '🎁' },
      { id: 'insurances_section', title: 'ביטוחים', icon: '🛡️' },
      { id: 'special_cases_section', title: 'מקרים מיוחדים', icon: '⚡' }
    ],
    5: [
      { id: 'emergency_fund_fieldset', title: 'קרן חירום ויציבות', icon: '🛡️' },
      { id: 'capital_receipts_section', title: 'תקבולים צפויים', icon: '💰' },
      { id: 'recurring_goals_section', title: 'יעדים חוזרים', icon: '🔄' },
      { id: 'one_time_goals_section', title: 'יעדים חד-פעמיים', icon: '🎯' },
      { id: 'children_goals_section', title: 'יעדים לילדים', icon: '🎓' },
      { id: 'expectations_fieldset', title: 'ציפיות מהייעוץ', icon: '💡' }
    ]
  };

  // --- CONFIG / SMALL HELPERS ---
  const CFG = window.APP_CONFIG || {};
  const N8N_WEBHOOK_URL = CFG.WEBHOOK_URL;
  const pageLoadedAt = Date.now();
  const urlParams = new URLSearchParams(window.location.search);
  let loadedFromFile = false;
  let isSubmitting = false;
  let lastPayload = null;

  const STORAGE_KEYS = {
    draft: 'financial_questionnaire_draft',
    step: 'financial_questionnaire_step',
    visited: 'financial_questionnaire_visited_steps',
    savedAt: 'financial_questionnaire_saved_at',
    submissionId: 'financial_questionnaire_submission_id',
    lastSubmitAt: 'financial_questionnaire_last_submit_at',
    advisor: 'financial_questionnaire_advisor'
  };

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function newRowId(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
  }

  // Number or null. An empty field is NOT the same as "0" (the advisor needs to know the difference).
  function nz(value) {
    if (value === '' || value === null || value === undefined) return null;
    const clean = String(value).replace(/,/g, '').trim();
    if (clean === '') return null;
    const n = parseFloat(clean);
    return isNaN(n) ? null : n;
  }

  // Recursively trims strings and turns empty strings into null (cleaner data for the receiving side).
  function cleanEmpty(value) {
    if (typeof value === 'string') {
      const t = value.trim();
      return t === '' ? null : t;
    }
    if (Array.isArray(value)) return value.map(cleanEmpty);
    if (value && typeof value === 'object') {
      const out = {};
      Object.keys(value).forEach(k => { out[k] = cleanEmpty(value[k]); });
      return out;
    }
    return value;
  }

  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  function getStored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function setStored(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage may be blocked */ }
  }
  function removeStored(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }
  function clearAllStoredData() {
    [STORAGE_KEYS.draft, STORAGE_KEYS.step, STORAGE_KEYS.visited, STORAGE_KEYS.savedAt, STORAGE_KEYS.submissionId]
      .forEach(removeStored);
  }

  // One id per questionnaire. It survives retries, so the receiving side can ignore duplicates.
  function getSubmissionId() {
    let id = getStored(STORAGE_KEYS.submissionId);
    if (!id) {
      id = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'sub_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      setStored(STORAGE_KEYS.submissionId, id);
    }
    return id;
  }

  // Advisor / campaign that sent the link (?advisor=eitan&utm_source=...), remembered for the session.
  const urlAdvisor = urlParams.get('advisor') || urlParams.get('ref');
  if (urlAdvisor) setStored(STORAGE_KEYS.advisor, urlAdvisor);
  const trackedAdvisor = urlAdvisor || getStored(STORAGE_KEYS.advisor) || null;

  // --- HOUSEHOLD (single / couple) ---
  const householdTypeSelect = document.getElementById('household_type');

  function hasPartner() {
    return !householdTypeSelect || householdTypeSelect.value !== 'single';
  }

  function typedName(n) {
    return (document.getElementById(`p${n}_first_name`)?.value || '').trim();
  }

  function personName(n) {
    const first = typedName(n);
    if (first) return first;
    if (n === 1) return hasPartner() ? 'בן/בת זוג 1' : 'אני';
    return 'בן/בת זוג 2';
  }

  function personItems(opts) {
    const items = [{ key: 'p1', label: personName(1) }];
    if (hasPartner()) {
      items.push({ key: 'p2', label: personName(2) });
      if (opts && opts.joint) items.push({ key: 'joint', label: 'משותף' });
    }
    return items;
  }

  const PARTNER_LABEL_TARGETS = [
    { sel: '#partner1_fieldset legend', n: 1, single: 'הפרטים האישיים שלכם' },
    { sel: '#partner2_fieldset legend', n: 2 },
    { sel: '#p1_income_fieldset legend', n: 1, single: 'הכנסות ותעסוקה' },
    { sel: '#p2_income_fieldset legend', n: 2 },
    { sel: 'label[for="p1_income_notes"]', n: 1, single: 'הערות על ההכנסות' },
    { sel: 'label[for="p2_income_notes"]', n: 2 }
  ];

  // Replaces "בן/בת זוג 1/2" in titles with the real first names once they are typed.
  function updatePartnerLabels() {
    PARTNER_LABEL_TARGETS.forEach(({ sel, n, single }) => {
      const el = document.querySelector(sel);
      if (!el) return;
      if (!el.dataset.orig) el.dataset.orig = el.textContent;
      let text = el.dataset.orig;
      if (!hasPartner() && single) {
        text = single;
      } else if (typedName(n)) {
        text = text.replace(`בן/בת זוג ${n}`, typedName(n));
      }
      el.textContent = text;
    });
  }

  // --- COMBO CELLS: choose from a list, or choose "other" and write your own ---
  const OTHER_KEY = '__other';
  const lst = (...labels) => labels.map(label => ({ key: label, label }));
  const BANKS = ['בנק לאומי', 'בנק הפועלים', 'בנק דיסקונט', 'בנק מזרחי-טפחות', 'הבנק הבינלאומי', 'מרכנתיל דיסקונט', 'בנק יהב', 'בנק ירושלים'];

  const COMBO_LISTS = {
    person_all: { people: true, other: false, items: () => personItems({ joint: true }) },
    person_owner: { people: true, items: () => personItems({ joint: true }) },
    person_pair: { people: true, other: false, items: () => personItems({ joint: false }) },
    insured: {
      people: true,
      items: () => personItems({ joint: false }).concat([{ key: 'family', label: 'כל המשפחה' }, { key: 'children', label: 'הילדים' }])
    },
    relation: { items: () => lst('אבא', 'אמא', 'אח/אחות', 'סבא/סבתא', 'חם/חמות', 'ילד/ה בוגר/ת', 'קרוב משפחה אחר') },
    income_source: { items: () => lst('קצבת ילדים', 'שכירות מנכס', 'תמיכה משפחתית קבועה', 'קצבת ביטוח לאומי', 'מזונות', 'ריבית / דיבידנדים', 'עבודה נוספת') },
    bank: { items: () => lst(...BANKS) },
    mortgage_track: {
      items: () => lst('פריים', 'קבועה צמודה', 'קבועה לא צמודה (קל"צ)', 'משתנה כל 5 שנים צמודה', 'משתנה כל 5 שנים לא צמודה', 'משתנה כל שנה / שנתיים', 'מט"ח', 'זכאות (משרד הבינוי והשיכון)')
    },
    lender: { items: () => lst(...BANKS, 'חברת כרטיס אשראי', 'חברת מימון חוץ-בנקאית', 'משפחה / חברים') },
    loan_purpose: { items: () => lst('רכב', 'שיפוץ / שדרוג הבית', 'לימודים', 'איחוד הלוואות', 'חופשה / אירוע', 'עסק', 'מימון צריכה כללי', 'אוברדראפט', 'הלוואה מחברים / משפחה') },
    insurance_company: { items: () => lst('מגדל', 'הראל', 'כלל', 'מנורה מבטחים', 'הפניקס', 'איילון', 'הכשרה', 'שירביט', 'ביטוח ישיר', 'AIG') },
    pension_company: { items: () => lst('מגדל', 'הראל', 'כלל', 'מנורה מבטחים', 'הפניקס', 'מיטב', 'אלטשולר שחם', 'אנליסט', 'מור', 'ילין לפידות', 'אינפיניטי') },
    capital_source: { items: () => lst('קרן השתלמות', 'קופת גמל להשקעה', 'ירושה', 'פיצויי פיטורין', 'מכירת נכס', 'מענק / בונוס חד-פעמי', 'פיצוי / תביעה') },
    capital_when: {
      otherLabel: 'אחר (תאריך מדויק)…',
      items: () => lst('השנה', 'בעוד 1–2 שנים', 'בעוד 3–5 שנים', 'בעוד 6–10 שנים', 'בעוד יותר מ-10 שנים')
    },
    recurring_goal: { items: () => lst('שדרוג רכב', 'חופשה שנתית משפחתית', 'שיפוץ תקופתי', 'החלפת ציוד ביתי', 'אירועים משפחתיים') },
    onetime_goal: { items: () => lst('קניית דירה', 'שיפוץ גדול', 'לימודים אקדמיים', 'פרישה מוקדמת', 'פתיחת עסק', 'החלפת רכב', 'חתונה / אירוע גדול') },
    bank_usage: { items: () => lst('עו"ש משפחתי ראשי', 'חשבון שכר', 'חיסכון / רזרבה', 'הוצאות שוטפות', 'חשבון עסקי', 'חשבון ילדים') },
    card_issuer: { items: () => lst('ויזה כאל', 'ישראכרט', 'מקס', 'אמריקן אקספרס', 'דיינרס', 'כרטיס מהבנק (ויזה / מסטרקארד)') },
    card_usage: { items: () => lst('קניות סופר ודלק', 'הוצאות שוטפות כלליות', 'חופשות ואירועים', 'עסקי', 'כרטיס גיבוי') }
  };

  const LEGACY_PERSON_VALUES = { 'בן זוג 1': 'p1', 'בן זוג 2': 'p2', 'משותף': 'joint' };

  function comboOptions(listKey) {
    const def = COMBO_LISTS[listKey];
    let html = '<option value="" disabled selected>בחרו…</option>';
    def.items().forEach(item => {
      html += `<option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>`;
    });
    if (def.other !== false) {
      html += `<option value="${OTHER_KEY}">${escapeHtml(def.otherLabel || 'אחר – לכתוב בעצמי…')}</option>`;
    }
    return html;
  }

  function comboCell(inputClass, listKey, placeholder, required) {
    const def = COMBO_LISTS[listKey];
    return `<div class="combo-cell" data-list="${listKey}"${def.people ? ' data-people="1"' : ''}>
        <select class="combo-select" aria-label="${escapeHtml(placeholder)}">${comboOptions(listKey)}</select>
        <input type="text" class="${inputClass} combo-input hidden" placeholder="${escapeHtml(placeholder)}"${required ? ' required' : ''}>
      </div>`;
  }

  function comboLabel(cell, key) {
    const opt = Array.from(cell.querySelector('.combo-select').options).find(o => o.value === key);
    return opt ? opt.textContent : key;
  }

  function applyComboSelection(cell, silent) {
    const sel = cell.querySelector('.combo-select');
    const inp = cell.querySelector('.combo-input');
    const key = sel.value;
    inp.dataset.key = key === '' ? '' : (key === OTHER_KEY ? 'other' : key);
    if (key === OTHER_KEY) {
      inp.classList.remove('hidden');
      inp.value = '';
      if (!silent) inp.focus();
    } else {
      inp.classList.add('hidden');
      inp.value = key === '' ? '' : comboLabel(cell, key);
    }
    if (!silent) inp.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Puts a saved value back into a combo cell (also understands old drafts that stored plain text).
  function restoreCombo(cell, value, savedKey) {
    const sel = cell.querySelector('.combo-select');
    const inp = cell.querySelector('.combo-input');
    const hasText = value !== undefined && value !== null && String(value) !== '';
    const options = Array.from(sel.options).filter(o => o.value && o.value !== OTHER_KEY);
    let match = null;
    if (savedKey && savedKey !== 'other') match = options.find(o => o.value === savedKey);
    if (!match && hasText) {
      const legacyKey = LEGACY_PERSON_VALUES[String(value).trim()];
      match = options.find(o => (legacyKey && o.value === legacyKey) || o.textContent === String(value).trim());
    }
    if (match) {
      sel.value = match.value;
      applyComboSelection(cell, true);
    } else if (hasText) {
      sel.value = OTHER_KEY;
      inp.classList.remove('hidden');
      inp.value = String(value);
      inp.dataset.key = 'other';
    } else {
      sel.value = '';
      applyComboSelection(cell, true);
    }
  }

  // If there is only one possible answer (e.g. a single person), choose it for the client.
  function autoSelectSingleChoice(cell) {
    const def = COMBO_LISTS[cell.dataset.list];
    const sel = cell.querySelector('.combo-select');
    if (sel.value !== '') return;
    const options = Array.from(sel.options).filter(o => o.value && o.value !== OTHER_KEY);
    // Only one possible answer -> choose it. A single person is always the owner -> choose them.
    if ((def.other === false && options.length === 1) || (def.people && !hasPartner() && options.some(o => o.value === 'p1'))) {
      sel.value = def.other === false && options.length === 1 ? options[0].value : 'p1';
      applyComboSelection(cell, true);
    }
  }

  // When names / household type change, the "person" lists are rebuilt with the current names.
  function refreshPersonCombos() {
    document.querySelectorAll('.combo-cell[data-people="1"]').forEach(cell => {
      const sel = cell.querySelector('.combo-select');
      const inp = cell.querySelector('.combo-input');
      const current = sel.value;
      sel.innerHTML = comboOptions(cell.dataset.list);
      sel.value = current;
      if (sel.value !== current) {
        sel.value = '';
        inp.value = '';
        inp.dataset.key = '';
        inp.classList.add('hidden');
      } else if (['p1', 'p2', 'joint'].includes(current)) {
        inp.value = comboLabel(cell, current);
      }
      autoSelectSingleChoice(cell);
    });
  }

  document.addEventListener('change', (e) => {
    const sel = e.target.closest ? e.target.closest('.combo-select') : null;
    if (sel) applyComboSelection(sel.closest('.combo-cell'), false);
  });

  // --- REAL ESTATE <-> MORTGAGE LINK ---
  function refreshPropertyOptions() {
    const properties = Array.from(document.querySelectorAll('#realEstateTable tbody tr')).map((row, i) => {
      const desc = (row.querySelector('.cell-description')?.value || '').trim();
      return { id: row.dataset.rowId, label: desc || `נכס ${i + 1}` };
    });
    document.querySelectorAll('#mortgageTable .cell-property-id').forEach(sel => {
      const wanted = sel.value || sel.dataset.pending || '';
      let html = '<option value="">ללא שיוך / לא רלוונטי</option>';
      properties.forEach(p => { html += `<option value="${escapeHtml(p.id)}">${escapeHtml(p.label)}</option>`; });
      sel.innerHTML = html;
      sel.value = properties.some(p => p.id === wanted) ? wanted : '';
      sel.dataset.pending = '';
    });
  }

  // Short label per column, used on phones where each table row becomes a card.
  function labelTableCells(row) {
    const table = row.closest('table');
    if (!table) return;
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => {
      const clone = th.cloneNode(true);
      clone.querySelectorAll('.tooltip-box, .tooltip-text').forEach(n => n.remove());
      return clone.textContent.replace(/\s+/g, ' ').replace(/\*/g, '').trim();
    });
    Array.from(row.children).forEach((td, i) => {
      if (!td.classList.contains('col-actions') && headers[i]) td.setAttribute('data-label', headers[i]);
    });
  }

  // --- EXPENSE CATEGORY IDS (stable, language-independent keys for analysis) ---
  const EXPENSE_IDS = {
    'משכנתא': 'mortgage', 'הלוואות': 'loans', 'ביטוח בריאות משלים': 'health_supplementary',
    'ביטוח בריאות פרטי': 'health_private', 'ביטוח חיים': 'life_insurance', 'ביטוח דירה': 'home_insurance',
    'הקצאה להוצאות בלת"מ': 'unexpected_reserve', 'חיסכון': 'savings', 'מזון ומכולת': 'groceries',
    'ביגוד והנעלה': 'clothing', 'חשמל': 'electricity', 'גז': 'gas', 'ארנונה ומים': 'property_tax_water',
    'מטפלת/שמרטף/מעון/גן': 'childcare', 'ביה"ס וחומרי לימוד': 'school', 'חוגים': 'classes',
    'דמי כיס': 'pocket_money', 'טלפון קווי': 'landline', 'טלפון סלולרי': 'mobile', 'אינטרנט': 'internet',
    'שכ"ד': 'rent', 'וועד בית': 'building_committee', 'עוזרת': 'cleaner', 'אחזקת בית ותיקונים': 'home_maintenance',
    'תחבורה ציבורית': 'public_transport', 'דלק': 'fuel', 'אחזקת רכב ותיקונים': 'car_maintenance',
    'ביטוח (חובה ומקיף)': 'car_insurance', 'טסט': 'car_test', 'עמלות וריבית': 'fees_interest',
    'מספרה': 'hairdresser', 'קוסמטיקה': 'cosmetics', 'כבלים': 'tv_cable', 'מנויים': 'subscriptions',
    'עיתונים': 'newspapers', 'נסיעות לחו"ל וחופשות': 'vacations', 'קאנטרי קלאב': 'gym',
    'מסעדות סרטים והצגות': 'dining_entertainment', 'מתנות (משפחה, אירועים)': 'gifts', 'מזונות': 'alimony',
    'תמיכה בבני המשפחה': 'family_support', 'הוצאות ריפוי': 'medical', 'סיגריות': 'cigarettes',
    'מזומן ללא מעקב': 'untracked_cash'
  };
  const LEGACY_EXPENSE_LABELS = { 'משכתנתא': 'משכנתא' };

  // --- TOTALS (single source of truth: live KPI cards, payload, PDF summary) ---
  function sumCells(rowSelector, cellSelector) {
    let total = 0;
    document.querySelectorAll(rowSelector).forEach(r => { total += parseNumber(r.querySelector(cellSelector)?.value); });
    return total;
  }

  function computeTotals() {
    const partner2 = hasPartner();
    const income = (n) => {
      const type = document.getElementById(`p${n}_employment_type`)?.value;
      const self = type === 'self_employed';
      const emp = !self ? parseNumber(document.getElementById(`p${n}_employee_income`)?.value) : 0;
      const bonus = !self ? parseNumber(document.getElementById(`p${n}_bonuses`)?.value) / 12 : 0;
      const own = self ? parseNumber(document.getElementById(`p${n}_self_employed_income`)?.value) : 0;
      return emp + bonus + own;
    };
    const p1Income = income(1);
    const p2Income = partner2 ? income(2) : 0;
    const additionalIncome = sumCells('#additionalIncomeTable tbody tr', '.cell-amount');
    const monthlyIncome = p1Income + p2Income + additionalIncome;
    const monthlyExpenses = sumCells('#expensesTable tbody tr', '.cell-average');

    const realEstate = Array.from(document.querySelectorAll('#realEstateTable tbody tr')).map(r => ({
      id: r.dataset.rowId,
      value: parseNumber(r.querySelector('.cell-current-val')?.value),
      remaining: parseNumber(r.querySelector('.cell-mortgage-rem')?.value)
    }));
    const tracks = Array.from(document.querySelectorAll('#mortgageTable tbody tr')).map(r => ({
      property: r.querySelector('.cell-property-id')?.value || '',
      remaining: parseNumber(r.querySelector('.cell-remaining')?.value),
      monthly: parseNumber(r.querySelector('.cell-monthly')?.value)
    }));

    const realEstateValue = realEstate.reduce((s, p) => s + p.value, 0);
    const vehiclesValue = sumCells('#vehiclesTable tbody tr', '.cell-value');
    const financialAssetsValue = sumCells('#financialAssetsTable tbody tr', '.cell-amount');
    const totalAssets = realEstateValue + vehiclesValue + financialAssetsValue;

    // The mortgage may be typed in the property table AND in the tracks table: never count it twice.
    let mortgageBalance;
    const linkedTracks = tracks.filter(t => t.property);
    if (linkedTracks.length) {
      const byProperty = {};
      linkedTracks.forEach(t => { byProperty[t.property] = (byProperty[t.property] || 0) + t.remaining; });
      mortgageBalance = realEstate.reduce((s, p) => s + Math.max(p.remaining, byProperty[p.id] || 0), 0)
        + tracks.filter(t => !t.property).reduce((s, t) => s + t.remaining, 0);
    } else {
      mortgageBalance = Math.max(
        realEstate.reduce((s, p) => s + p.remaining, 0),
        tracks.reduce((s, t) => s + t.remaining, 0)
      );
    }
    const otherLiabilities = sumCells('#liabilitiesTable tbody tr', '.cell-current');
    const totalLiabilities = mortgageBalance + otherLiabilities;

    const mortgageMonthly = tracks.reduce((s, t) => s + t.monthly, 0);
    const loansMonthly = sumCells('#liabilitiesTable tbody tr', '.cell-monthly');

    const r = (v) => Math.round(v);
    return {
      monthly_income: r(monthlyIncome),
      monthly_income_partner1: r(p1Income),
      monthly_income_partner2: r(p2Income),
      monthly_additional_income: r(additionalIncome),
      monthly_expenses: r(monthlyExpenses),
      free_cashflow: r(monthlyIncome) - r(monthlyExpenses),
      real_estate_value: r(realEstateValue),
      vehicles_value: r(vehiclesValue),
      financial_assets_value: r(financialAssetsValue),
      total_assets: r(totalAssets),
      mortgage_balance: r(mortgageBalance),
      other_liabilities: r(otherLiabilities),
      total_liabilities: r(totalLiabilities),
      net_worth: r(totalAssets) - r(totalLiabilities),
      monthly_mortgage_payments: r(mortgageMonthly),
      monthly_loan_payments: r(loansMonthly),
      pension_savings_total: r(sumCells('#pensionsTable tbody tr', '.cell-balance')),
      monthly_pension_deposits: r(sumCells('#pensionsTable tbody tr', '.cell-monthly_deposit'))
    };
  }

  // --- DATA QUALITY: impossible / suspicious values are flagged (never blocked) ---
  function expenseAverageById(id) {
    const row = Array.from(document.querySelectorAll('#expensesTable tbody tr')).find(r => r.dataset.categoryId === id);
    return row ? parseNumber(row.querySelector('.cell-average')?.value) : 0;
  }

  function setRowWarning(row, message) {
    row.classList.add('row-warning');
    row.title = message;
  }

  function collectQualityFlags() {
    const flags = [];
    const add = (code, where, detail) => flags.push({ code, where: where || null, detail: detail || null });
    document.querySelectorAll('#questionnaireForm tr.row-warning').forEach(r => { r.classList.remove('row-warning'); r.removeAttribute('title'); });
    const nowMonth = new Date().toISOString().slice(0, 7);
    const t = computeTotals();

    document.querySelectorAll('#mortgageTable tbody tr').forEach((row, i) => {
      const orig = nz(row.querySelector('.cell-orig')?.value);
      const rem = nz(row.querySelector('.cell-remaining')?.value);
      const rate = nz(row.querySelector('.cell-rate')?.value);
      const end = row.querySelector('.cell-end-date')?.value;
      if (orig !== null && rem !== null && rem > orig) {
        add('remaining_exceeds_original', `assets.mortgages[${i}]`);
        setRowWarning(row, 'היתרה הנוכחית גבוהה מהסכום המקורי – כדאי לבדוק');
      }
      if (rate !== null && rate > 15) {
        add('interest_rate_suspicious', `assets.mortgages[${i}]`, String(rate));
        setRowWarning(row, 'אחוז הריבית נראה גבוה מאוד – כדאי לבדוק');
      }
      if (end && end < nowMonth && rem) add('loan_end_date_in_past', `assets.mortgages[${i}]`, end);
    });

    document.querySelectorAll('#liabilitiesTable tbody tr').forEach((row, i) => {
      const orig = nz(row.querySelector('.cell-orig')?.value);
      const cur = nz(row.querySelector('.cell-current')?.value);
      const rate = nz(row.querySelector('.cell-rate')?.value);
      const end = row.querySelector('.cell-end')?.value;
      if (orig !== null && cur !== null && cur > orig) {
        add('remaining_exceeds_original', `liabilities[${i}]`);
        setRowWarning(row, 'היתרה הנוכחית גבוהה מהסכום המקורי – כדאי לבדוק');
      }
      if (rate !== null && rate > 40) add('interest_rate_suspicious', `liabilities[${i}]`, String(rate));
      if (end && end < nowMonth && cur) add('loan_end_date_in_past', `liabilities[${i}]`, end);
    });

    document.querySelectorAll('#realEstateTable tbody tr').forEach((row, i) => {
      const orig = nz(row.querySelector('.cell-mortgage-orig')?.value);
      const rem = nz(row.querySelector('.cell-mortgage-rem')?.value);
      const value = nz(row.querySelector('.cell-current-val')?.value);
      if (orig !== null && rem !== null && rem > orig) {
        add('remaining_exceeds_original', `assets.real_estate[${i}]`);
        setRowWarning(row, 'יתרת המשכנתא גבוהה מהסכום שנלקח במקור – כדאי לבדוק');
      }
      if (value !== null && rem !== null && rem > value) add('negative_equity', `assets.real_estate[${i}]`);
    });

    if (!t.monthly_income) add('no_income');
    if (!t.monthly_expenses) add('no_expenses');
    if (t.monthly_income > 0 && t.monthly_expenses > 0 && t.monthly_expenses < t.monthly_income * 0.4) {
      add('expenses_far_below_income', null, `${t.monthly_expenses}/${t.monthly_income}`);
    }
    if (t.monthly_income > 0 && t.monthly_expenses > t.monthly_income) add('negative_cashflow', null, String(t.free_cashflow));
    if (t.monthly_mortgage_payments > 0 && expenseAverageById('mortgage') === 0) add('mortgage_payment_missing_in_expenses');
    if (t.monthly_loan_payments > 0 && expenseAverageById('loans') === 0) add('loan_payments_missing_in_expenses');

    const anyLinked = Array.from(document.querySelectorAll('#mortgageTable .cell-property-id')).some(s => s.value);
    if (!anyLinked) {
      const reRem = sumCells('#realEstateTable tbody tr', '.cell-mortgage-rem');
      const trRem = sumCells('#mortgageTable tbody tr', '.cell-remaining');
      if (reRem > 0 && trRem > 0 && Math.abs(reRem - trRem) > 0.1 * Math.max(reRem, trRem)) {
        add('mortgage_total_mismatch', null, `${reRem} vs ${trRem}`);
      }
    }

    const age1 = nz(document.getElementById('p1_age')?.value);
    const duration = nz(document.getElementById('marriage_duration')?.value);
    if (age1 !== null && duration !== null && duration > age1 - 16) add('marriage_duration_exceeds_age');
    return flags;
  }

  let qualityTimer = null;
  function scheduleQualityCheck() {
    clearTimeout(qualityTimer);
    qualityTimer = setTimeout(collectQualityFlags, 400);
  }

  // --- ANTI-SPAM: Cloudflare Turnstile (free, optional - active only when a site key is configured) ---
  let turnstileToken = null;
  let turnstileWidgetId = null;

  function initTurnstile() {
    const container = document.getElementById('turnstileContainer');
    if (!CFG.TURNSTILE_SITE_KEY || !container) return;
    container.classList.remove('hidden');
    const render = () => {
      if (!window.turnstile || turnstileWidgetId !== null) return;
      turnstileWidgetId = window.turnstile.render(container, {
        sitekey: CFG.TURNSTILE_SITE_KEY,
        language: 'he',
        callback: (token) => { turnstileToken = token; },
        'expired-callback': () => { turnstileToken = null; },
        'error-callback': () => { turnstileToken = null; }
      });
    };
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
  }

  function resetTurnstile() {
    turnstileToken = null;
    if (window.turnstile && turnstileWidgetId !== null) window.turnstile.reset(turnstileWidgetId);
  }

  let lastHouseholdState = null;

  // --- DYNAMIC TABLE CELL TEMPLATES ---
  const TABLE_TEMPLATES = {
    childrenTable: () => `
      <td><textarea class="cell-name" rows="1" placeholder="שם הילד/ה" required></textarea></td>
      <td>
        <select class="cell-gender">
          <option value="ז">זכר</option>
          <option value="נ">נקבה</option>
        </select>
      </td>
      <td><input type="number" class="cell-age" min="0" max="50" placeholder="גיל" required></td>
      <td><textarea class="cell-notes" rows="1" placeholder="פירוט צרכים פיננסיים, חוגים וכו'"></textarea></td>
      <td><textarea class="cell-general_notes" rows="1" placeholder="הערות כלליות (צרכים מיוחדים וכו')"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </td>
    `,
    circleTable: () => `
      <td>${comboCell('cell-close-to', 'person_all', 'למי קרוב/ה', true)}</td>
      <td>${comboCell('cell-relation', 'relation', 'יחס קרבה, למשל: דוד', true)}</td>
      <td><select class="cell-financial-status">${generateNumberOptions(1, 10, 5)}</select></td>
      <td><select class="cell-can-help">${generateNumberOptions(1, 10, 5)}</select></td>
      <td><select class="cell-needs-help">${generateNumberOptions(1, 10, 1)}</select></td>
      <td><input type="number" class="cell-wealth-transfer" min="0" placeholder="0"></td>
      <td><textarea class="cell-notes" rows="1" placeholder="הערות"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    additionalIncomeTable: () => `
      <td>${comboCell('cell-source', 'income_source', 'מקור ההכנסה', true)}</td>
      <td><input type="number" class="cell-amount" min="0" placeholder="0" required></td>
      <td><textarea class="cell-notes" rows="1" placeholder="זמני/קבוע, מועד סיום"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    realEstateTable: () => `
      <td><textarea class="cell-description" rows="1" placeholder="נכס מגורים/השקעה + עיר" required></textarea></td>
      <td><input type="number" class="cell-purchase-val" min="0" placeholder="0"></td>
      <td><input type="number" class="cell-current-val" min="0" placeholder="0" required></td>
      <td><input type="number" class="cell-mortgage-orig" min="0" placeholder="0"></td>
      <td><input type="number" class="cell-mortgage-rem" min="0" placeholder="0"></td>
      <td><textarea class="cell-notes" rows="1" placeholder="הערות"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    mortgageTable: () => `
      <td><select class="cell-property-id"><option value="">ללא שיוך / לא רלוונטי</option></select></td>
      <td>${comboCell('cell-bank', 'bank', 'שם הבנק', true)}</td>
      <td>${comboCell('cell-track', 'mortgage_track', 'שם המסלול', true)}</td>
      <td><input type="number" class="cell-orig" min="0" placeholder="0"></td>
      <td><input type="number" class="cell-remaining" min="0" placeholder="0" required></td>
      <td><input type="number" class="cell-rate" step="0.01" min="0" placeholder="0.0" required></td>
      <td><input type="month" class="cell-end-date" required></td>
      <td><input type="number" class="cell-monthly" min="0" placeholder="0" required></td>
      <td><textarea class="cell-notes" rows="1" placeholder="הערות"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    vehiclesTable: () => `
      <td><textarea class="cell-model" rows="1" placeholder="יצרן ודגם" required></textarea></td>
      <td><input type="number" class="cell-year" min="1980" max="2030" placeholder="שנת ייצור" required></td>
      <td><input type="number" class="cell-value" min="0" placeholder="0" required></td>
      <td><textarea class="cell-notes" rows="1" placeholder="בעלות, הלוואה וכו'"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    financialAssetsTable: () => `
      <td>
        <select class="cell-type">
          <option value="עו&quot;ש">עו"ש</option>
          <option value="חיסכון">חיסכון בנקאי</option>
          <option value="קופת גמל">קופת גמל</option>
          <option value="קרן השתלמות">קרן השתלמות</option>
          <option value="תיק ניירות ערך">תיק ניירות ערך</option>
          <option value="אחר">אחר</option>
        </select>
      </td>
      <td><textarea class="cell-company" rows="1" placeholder="בנק / בית השקעות" required></textarea></td>
      <td><input type="number" class="cell-amount" min="0" placeholder="0" required></td>
      <td><textarea class="cell-notes" rows="1" placeholder="נזיל/זמני, ייעוד"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    liabilitiesTable: () => `
      <td>${comboCell('cell-lender', 'lender', 'הבנק / הגורם המלווה', true)}</td>
      <td>${comboCell('cell-purpose', 'loan_purpose', 'מטרת ההלוואה', true)}</td>
      <td><input type="number" class="cell-orig" min="0" placeholder="0"></td>
      <td><input type="number" class="cell-current" min="0" placeholder="0" required></td>
      <td><input type="number" class="cell-monthly" min="0" placeholder="0" required></td>
      <td><input type="month" class="cell-start"></td>
      <td><input type="month" class="cell-end" required></td>
      <td><input type="number" class="cell-rate" step="0.01" min="0" placeholder="0.0"></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    allowancesTable: () => `
      <td>
        <select class="cell-source">
          <option value="ביטוח לאומי">ביטוח לאומי</option>
          <option value="פנסיה ממקור אחר">פנסיה ממקור אחר</option>
        </select>
      </td>
      <td>${comboCell('cell-recipient', 'person_pair', 'מי מקבל/ת', true)}</td>
      <td><input type="number" class="cell-amount" min="0" placeholder="0" required></td>
      <td><textarea class="cell-notes" rows="1" placeholder="קבוע / זמני"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    insurancesTable: () => `
      <td>
        <select class="cell-type">
          <option value="חיים">חיים</option>
          <option value="בריאות">בריאות</option>
          <option value="סיעוד">סיעוד</option>
          <option value="אובדן כושר עבודה">אובדן כושר עבודה</option>
          <option value="תאונות אישיות">תאונות אישיות</option>
          <option value="מחלות קשות">מחלות קשות</option>
        </select>
      </td>
      <td>${comboCell('cell-insured', 'insured', 'של מי הביטוח', true)}</td>
      <td>${comboCell('cell-company', 'insurance_company', 'חברת ביטוח', true)}</td>
      <td><input type="number" class="cell-premium" min="0" placeholder="0" required></td>
      <td><input type="number" class="cell-sum-insured" min="0" placeholder="0"></td>
      <td><textarea class="cell-agent" rows="1" placeholder="שם סוכן"></textarea></td>
      <td>
        <select class="cell-cov-type">
          <option value="private">פרטי</option>
          <option value="supplementary">משלים שב"ן (קופה)</option>
          <option value="mixed">משולב</option>
        </select>
      </td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    capitalReceiptsTable: () => `
      <td>${comboCell('cell-source', 'capital_source', 'מקור הכספים', true)}</td>
      <td><input type="number" class="cell-amount" min="0" placeholder="0" required></td>
      <td>${comboCell('cell-when', 'capital_when', 'למשל: 2028 או עוד שנתיים', true)}</td>
      <td><textarea class="cell-notes" rows="1" placeholder="שימוש מתוכנן"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    recurringGoalsTable: () => `
      <td>${comboCell('cell-description', 'recurring_goal', 'תיאור היעד', true)}</td>
      <td><input type="number" class="cell-freq" min="1" placeholder="למשל: 3" required></td>
      <td><input type="number" class="cell-cost" min="0" placeholder="0" required></td>
      <td><textarea class="cell-notes" rows="1" placeholder="הערות"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    oneTimeGoalsTable: () => `
      <td>${comboCell('cell-description', 'onetime_goal', 'תיאור היעד', true)}</td>
      <td><input type="number" class="cell-years" min="1" placeholder="למשל: 5" required></td>
      <td><input type="number" class="cell-cost" min="0" placeholder="0" required></td>
      <td><textarea class="cell-notes" rows="1" placeholder="הערות"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    childrenGoalsTable: () => `
      <td><textarea class="cell-description" rows="1" placeholder="מימון חתונה, עזרה לדירה" required></textarea></td>
      <td><input type="number" class="cell-cost" min="0" placeholder="0" required></td>
      <td><input type="number" class="cell-age" min="1" placeholder="למשל: 21" required></td>
      <td><textarea class="cell-notes" rows="1" placeholder="הערות"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    bankAccountsTable: () => `
      <td><textarea class="cell-name" rows="1" placeholder="למשל: לאומי סניף 800" required></textarea></td>
      <td>${comboCell('cell-owner', 'person_owner', 'בעלי החשבון', true)}</td>
      <td><input type="number" class="cell-limit" min="0" placeholder="0"></td>
      <td>${comboCell('cell-usage', 'bank_usage', 'למה משמש החשבון')}</td>
      <td>
        <select class="cell-restricted">
          <option value="no">לא</option>
          <option value="yes">כן</option>
        </select>
      </td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    creditCardsTable: () => `
      <td>${comboCell('cell-owner', 'person_owner', 'בעל/ת הכרטיס', true)}</td>
      <td>${comboCell('cell-name', 'card_issuer', 'שם הכרטיס', true)}</td>
      <td><input type="text" class="cell-digits" placeholder="1234" maxlength="4" pattern="\\d{4}"></td>
      <td><input type="number" class="cell-limit" min="0" placeholder="0"></td>
      <td>${comboCell('cell-usage', 'card_usage', 'למה משמש הכרטיס')}</td>
      <td><textarea class="cell-notes" rows="1" placeholder="פירוט עסקאות, תשלומים וכו'"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    pensionsTable: () => `
      <td>${comboCell('cell-owner', 'person_pair', 'שייך למי', true)}</td>
      <td>${comboCell('cell-company', 'pension_company', 'קרן / חברה מנהלת', true)}</td>
      <td>
        <select class="cell-is_executive_insurance">
          <option value="no" selected>לא</option>
          <option value="yes">כן</option>
        </select>
      </td>
      <td><input type="number" class="cell-balance" min="0" placeholder="0" required></td>
      <td><input type="number" class="cell-monthly_deposit" min="0" placeholder="0"></td>
      <td>
        <select class="cell-has_life_insurance">
          <option value="yes">כן (שארים)</option>
          <option value="no">לא</option>
          <option value="unknown">לא ידוע</option>
        </select>
      </td>
      <td><input type="number" class="cell-annuity_coefficient" step="0.1" min="0" placeholder="מקדם"></td>
      <td><textarea class="cell-notes" rows="1" placeholder="הערות"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    expensesTable: () => `
      <td><textarea class="cell-category" rows="1" placeholder="סעיף הוצאה" required></textarea></td>
      <td><input type="number" class="cell-month1" min="0" placeholder="0"></td>
      <td><input type="number" class="cell-month2" min="0" placeholder="0"></td>
      <td><input type="number" class="cell-month3" min="0" placeholder="0"></td>
      <td><input type="text" inputmode="numeric" data-original-type="number" class="cell-average input-readonly" readonly placeholder="0"></td>
      <td><textarea class="cell-notes" rows="1" placeholder="הערות"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `
  };

  // Helper: generates HTML options for numeric selects (like 1 to 10)
  function generateNumberOptions(min, max, selectedVal) {
    let options = '';
    for (let i = min; i <= max; i++) {
      options += `<option value="${i}" ${i === selectedVal ? 'selected' : ''}>${i}</option>`;
    }
    return options;
  }

  const DEFAULT_EXPENSES_LIST = [
    'משכנתא', 'הלוואות', 'ביטוח בריאות משלים', 'ביטוח בריאות פרטי', 'ביטוח חיים', 'ביטוח דירה',
    'הקצאה להוצאות בלת"מ', 'חיסכון', 'מזון ומכולת', 'ביגוד והנעלה', 'חשמל', 'גז',
    'ארנונה ומים', 'מטפלת/שמרטף/מעון/גן', 'ביה"ס וחומרי לימוד', 'חוגים', 'דמי כיס',
    'טלפון קווי', 'טלפון סלולרי', 'אינטרנט', 'שכ"ד', 'וועד בית', 'עוזרת',
    'אחזקת בית ותיקונים', 'תחבורה ציבורית', 'דלק', 'אחזקת רכב ותיקונים', 'ביטוח (חובה ומקיף)',
    'טסט', 'עמלות וריבית', 'מספרה', 'קוסמטיקה', 'כבלים', 'מנויים', 'עיתונים',
    'נסיעות לחו"ל וחופשות', 'קאנטרי קלאב', 'מסעדות סרטים והצגות', 'מתנות (משפחה, אירועים)',
    'מזונות', 'תמיכה בבני המשפחה', 'הוצאות ריפוי', 'סיגריות', 'מזומן ללא מעקב'
  ];

  const EXPENSE_CATEGORY_MAP = {
    'משכנתא': 'housing',
    'משכתנתא': 'housing',
    'שכ"ד': 'housing',
    'חשמל': 'housing',
    'גז': 'housing',
    'ארנונה ומים': 'housing',
    'וועד בית': 'housing',
    'עוזרת': 'housing',
    'אחזקת בית ותיקונים': 'housing',
    'אינטרנט': 'housing',
    'טלפון קווי': 'housing',
    'טלפון סלולרי': 'housing',
    'דלק': 'transport',
    'תחבורה ציבורית': 'transport',
    'אחזקת רכב ותיקונים': 'transport',
    'ביטוח (חובה ומקיף)': 'transport',
    'טסט': 'transport',
    'מטפלת/שמרטף/מעון/גן': 'kids',
    'ביה"ס וחומרי לימוד': 'kids',
    'חוגים': 'kids',
    'דמי כיס': 'kids',
    'מזון ומכולת': 'food',
    'ביגוד והנעלה': 'food',
    'מספרה': 'food',
    'קוסמטיקה': 'food',
    'סיגריות': 'food',
    'נסיעות לחו"ל וחופשות': 'leisure',
    'קאנטרי קלאב': 'leisure',
    'מסעדות סרטים והצגות': 'leisure',
    'כבלים': 'leisure',
    'מנויים': 'leisure',
    'עיתונים': 'leisure',
    'ביטוח בריאות משלים': 'finance',
    'ביטוח בריאות פרטי': 'finance',
    'ביטוח חיים': 'finance',
    'ביטוח דירה': 'finance',
    'הלוואות': 'finance',
    'עמלות וריבית': 'finance',
    'חיסכון': 'finance',
    'הקצאה להוצאות בלת"מ': 'finance',
    'מתנות (משפחה, אירועים)': 'other',
    'מזונות': 'other',
    'תמיכה בבני המשפחה': 'other',
    'הוצאות ריפוי': 'other',
    'מזומן ללא מעקב': 'other'
  };

  function getExpenseCategory(categoryName) {
    if (!categoryName) return 'other';
    const trimmed = categoryName.trim();
    if (EXPENSE_CATEGORY_MAP[trimmed]) return EXPENSE_CATEGORY_MAP[trimmed];
    for (const [key, cat] of Object.entries(EXPENSE_CATEGORY_MAP)) {
      if (trimmed.includes(key) || key.includes(trimmed)) return cat;
    }
    return 'other';
  }

  function filterExpenses() {
    const activeCat = expenseCategoryTabs?.querySelector('.cat-pill.active')?.getAttribute('data-cat') || 'all';
    const query = expenseSearchInput?.value.trim().toLowerCase() || '';

    const rows = document.querySelectorAll('#expensesTable tbody tr');
    rows.forEach(row => {
      const rowCat = row.getAttribute('data-category') || 'other';
      const categoryInput = row.querySelector('.cell-category');
      const catText = (categoryInput ? categoryInput.value : '').toLowerCase();

      const matchesCat = (activeCat === 'all') || (rowCat === activeCat);
      const matchesQuery = !query || catText.includes(query);

      if (matchesCat && matchesQuery) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });

    if (clearExpenseSearch) {
      clearExpenseSearch.classList.toggle('hidden', !query);
    }
  }

  function initializeExpensesTable(expensesDraft = null) {
    const tbody = document.querySelector('#expensesTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const rowMap = {};
    DEFAULT_EXPENSES_LIST.forEach(category => {
      const row = addTableRow('expensesTable', { category: category });
      rowMap[category] = row;
    });

    let expensesArray = [];
    if (expensesDraft) {
      if (Array.isArray(expensesDraft)) {
        expensesArray = expensesDraft;
      } else if (typeof expensesDraft === 'object') {
        expensesArray = [{
          category: 'אחר',
          month1: expensesDraft.total_amount || '',
          notes: expensesDraft.details || 'שוחזר מטיוטה ישנה'
        }];
      }
    }

    expensesArray.forEach(item => {
      if (!item || !item.category) return;
      const category = LEGACY_EXPENSE_LABELS[item.category] || item.category;
      const existingRow = rowMap[category];
      if (existingRow) {
        Object.keys(item).forEach(key => {
          if (key === 'category' || item[key] === null || item[key] === undefined) return;
          let input = existingRow.querySelector(`.cell-${key}`);
          if (!input) {
            const hyphenatedKey = key.replace(/_/g, '-');
            input = existingRow.querySelector(`.cell-${hyphenatedKey}`);
          }
          if (input) {
            if (input.type === 'checkbox') {
              input.checked = item[key];
            } else {
              input.value = item[key];
              if (input.getAttribute('data-original-type') === 'number' && shouldFormatField(key)) {
                input.value = formatNumberWithCommas(item[key]);
              }
            }
          }
        });
      } else {
        addTableRow('expensesTable', item);
      }
    });
  }

  // --- INITIALIZE PAGE ---
  
  // Set date to today
  const today = new Date();
  const formattedDate = today.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('.').reverse().join('-'); // returns YYYY-MM-DD
  fillDateInput.value = formattedDate;

  // Setup Dynamic Tables Add Row buttons
  document.querySelectorAll('.add-row-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tableName = btn.getAttribute('data-table');
      addTableRow(tableName);
      saveDraft();
    });
  });

  // Handle Event delegation for table delete buttons
  document.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.remove-row-btn');
    if (deleteBtn) {
      const row = deleteBtn.closest('tr');
      row.style.transform = 'scale(0.95)';
      row.style.opacity = '0';
      setTimeout(() => {
        row.remove();
        refreshPropertyOptions();
        saveDraft();
        updateLiveFinancialKPIs();
        scheduleQualityCheck();
      }, 200);
    }
  });

  // Global Event Delegation for Premium Tooltips (avoids table boundary clipping)
  document.addEventListener('mouseover', (e) => {
    const trigger = e.target.closest('.tooltip-trigger');
    if (!trigger) return;
    const textNode = trigger.querySelector('.tooltip-box') || trigger.querySelector('.tooltip-text');
    if (!textNode) return;

    let globalTooltip = document.getElementById('global-tooltip');
    if (!globalTooltip) {
      globalTooltip = document.createElement('div');
      globalTooltip.id = 'global-tooltip';
      globalTooltip.className = 'global-tooltip-box';
      document.body.appendChild(globalTooltip);
    }

    globalTooltip.textContent = textNode.textContent;
    
    // Position it temporarily to measure height
    globalTooltip.classList.add('visible'); 
    
    const rect = trigger.getBoundingClientRect();
    const tooltipRect = globalTooltip.getBoundingClientRect();
    
    // Position tooltip above the trigger, centered horizontally
    const top = window.scrollY + rect.top - tooltipRect.height - 8;
    const left = window.scrollX + rect.left + (rect.width / 2) - (tooltipRect.width / 2);

    globalTooltip.style.top = `${top}px`;
    globalTooltip.style.left = `${left}px`;
  });

  document.addEventListener('mouseout', (e) => {
    const trigger = e.target.closest('.tooltip-trigger');
    if (!trigger) return;
    const globalTooltip = document.getElementById('global-tooltip');
    if (globalTooltip) {
      globalTooltip.classList.remove('visible');
    }
  });

  // Helper to validate all steps silently and update the dot indicators
  function validateAllStepsDots(forceAll = false) {
    for (let s = 1; s <= TOTAL_STEPS; s++) {
      const isVisited = visitedSteps.has(s) || forceAll;
      const isValid = validateStep(s, true); // silent validation
      const dot = document.querySelector(`.step-dot[data-step="${s}"]`);
      if (dot) {
        if (isValid) {
          dot.classList.remove('incomplete');
          dot.classList.add('completed');
        } else if (isVisited) {
          dot.classList.add('incomplete');
          dot.classList.remove('completed');
        } else {
          dot.classList.remove('incomplete', 'completed');
        }
      }
    }
  }

  function updateComputedExpensesTotal() {
    const table = document.getElementById('expensesTable');
    if (!table) return;
    const rows = table.querySelectorAll('tbody tr');
    let total = 0;
    rows.forEach(row => {
      const m1Val = row.querySelector('.cell-month1')?.value;
      const m2Val = row.querySelector('.cell-month2')?.value;
      const m3Val = row.querySelector('.cell-month3')?.value;

      const m1 = parseNumber(m1Val);
      const m2 = parseNumber(m2Val);
      const m3 = parseNumber(m3Val);

      let sum = 0;
      let count = 0;

      if (m1Val !== undefined && m1Val !== '' && !isNaN(m1)) { sum += m1; count++; }
      if (m2Val !== undefined && m2Val !== '' && !isNaN(m2)) { sum += m2; count++; }
      if (m3Val !== undefined && m3Val !== '' && !isNaN(m3)) { sum += m3; count++; }

      const avg = count > 0 ? sum / count : 0;

      const avgInput = row.querySelector('.cell-average');
      if (avgInput) {
        avgInput.value = count > 0 ? formatNumberWithCommas(Math.round(avg)) : '';
      }
      total += avg;
    });
    const totalSpan = document.getElementById('computedTotalExpenses');
    if (totalSpan) {
      totalSpan.textContent = Math.round(total).toLocaleString('he-IL');
    }
  }

  function updateLiveFinancialKPIs() {
    const t = computeTotals();
    const signed = (n) => `${n > 0 ? '+' : ''}${n.toLocaleString('he-IL')} ₪`;

    // --- STEP 2: Monthly Cashflow ---
    const kpiTotalIncomeEl = document.getElementById('kpiTotalIncome');
    const kpiTotalExpensesEl = document.getElementById('kpiTotalExpenses');
    const kpiFreeCashflowEl = document.getElementById('kpiFreeCashflow');
    const kpiCashflowHintEl = document.getElementById('kpiCashflowHint');

    if (kpiTotalIncomeEl) kpiTotalIncomeEl.textContent = `${t.monthly_income.toLocaleString('he-IL')} ₪`;
    if (kpiTotalExpensesEl) kpiTotalExpensesEl.textContent = `${t.monthly_expenses.toLocaleString('he-IL')} ₪`;
    if (kpiFreeCashflowEl) {
      kpiFreeCashflowEl.textContent = signed(t.free_cashflow);
      kpiFreeCashflowEl.className = `kpi-val text-cashflow ${t.free_cashflow >= 0 ? 'positive' : 'negative'}`;
    }
    if (kpiCashflowHintEl) {
      if (t.free_cashflow > 0) {
        kpiCashflowHintEl.textContent = 'עודף תזרימי חיובי לחיסכון, השקעה ויעדים';
      } else if (t.free_cashflow < 0) {
        kpiCashflowHintEl.textContent = 'גירעון תזרימי חודשי (הוצאות עולות על הכנסות)';
      } else {
        kpiCashflowHintEl.textContent = 'תזרים מאוזן';
      }
    }

    // --- STEP 3: Balance Sheet (Net Worth) ---
    const kpiTotalAssetsEl = document.getElementById('kpiTotalAssets');
    const kpiTotalLiabilitiesEl = document.getElementById('kpiTotalLiabilities');
    const kpiNetWorthEl = document.getElementById('kpiNetWorth');

    if (kpiTotalAssetsEl) kpiTotalAssetsEl.textContent = `${t.total_assets.toLocaleString('he-IL')} ₪`;
    if (kpiTotalLiabilitiesEl) kpiTotalLiabilitiesEl.textContent = `${t.total_liabilities.toLocaleString('he-IL')} ₪`;
    if (kpiNetWorthEl) {
      kpiNetWorthEl.textContent = signed(t.net_worth);
      kpiNetWorthEl.className = `kpi-val text-networth ${t.net_worth >= 0 ? 'positive' : 'negative'}`;
    }
  }

  form.addEventListener('input', (e) => {
    saveDraft();
    validateAllStepsDots();
    updateComputedExpensesTotal();
    updateLiveFinancialKPIs();
    if (e.target && /^p[12]_first_name$/.test(e.target.id)) {
      updatePartnerLabels();
      refreshPersonCombos();
      saveDraft();
    }
    if (e.target && e.target.closest && e.target.closest('#realEstateTable')) refreshPropertyOptions();
    scheduleQualityCheck();
  });
  form.addEventListener('change', () => {
    saveDraft();
    toggleConditionalFields();
    validateAllStepsDots();
    updateLiveFinancialKPIs();
    scheduleQualityCheck();
  });

  clearDraftBtn.addEventListener('click', () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים ולהתחיל מחדש?')) {
      clearAllStoredData();
      location.reload();
    }
  });

  function clearAllDynamicTables() {
    const tables = ['childrenTable', 'circleTable', 'additionalIncomeTable', 'expensesTable', 'realEstateTable', 'mortgageTable', 'vehiclesTable', 'financialAssetsTable', 'bankAccountsTable', 'creditCardsTable', 'pensionsTable', 'liabilitiesTable', 'allowancesTable', 'insurancesTable', 'capitalReceiptsTable', 'recurringGoalsTable', 'oneTimeGoalsTable', 'childrenGoalsTable'];
    tables.forEach(tableId => {
      const tbody = document.querySelector(`#${tableId} tbody`);
      if (tbody) {
        tbody.innerHTML = '';
      }
    });
  }

  uploadJsonBtn.addEventListener('click', () => {
    jsonFileInput.click();
  });

  downloadDraftBtn.addEventListener('click', () => {
    const data = getFormDataJSON();
    const jsonString = JSON.stringify(data, null, 2);
    
    const p1Name = document.getElementById('p1_first_name') ? document.getElementById('p1_first_name').value.trim() : '';
    const p2Name = document.getElementById('p2_first_name') ? document.getElementById('p2_first_name').value.trim() : '';
    
    let filename = 'טיוטה_נתונים_פיננסים';
    if (p1Name && p2Name) {
      filename += `_${p1Name}_ו_${p2Name}`;
    } else if (p1Name) {
      filename += `_${p1Name}`;
    } else if (p2Name) {
      filename += `_${p2Name}`;
    }
    filename += '.json';

    try {
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification(`קובץ הטיוטה '${filename}' הורד בהצלחה למחשבך!`, 'success');
    } catch (err) {
      console.error('Error downloading draft:', err);
      showNotification('שגיאה בהורדת קובץ הטיוטה', 'error');
    }
  });

  jsonFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const data = JSON.parse(evt.target.result);
        if (!data) throw new Error('קובץ ריק');

        clearAllDynamicTables();
        resetFormFields();
        loadedFromFile = true;

        populateFields(data);

        if (data.family && data.family.children) {
          data.family.children.forEach(child => addTableRow('childrenTable', child));
        }
        if (data.family && data.family.close_circle) {
          data.family.close_circle.forEach(item => addTableRow('circleTable', item));
        }
        if (data.additional_income) {
          data.additional_income.forEach(income => addTableRow('additionalIncomeTable', income));
        }
        if (data.expenses) {
          initializeExpensesTable(data.expenses);
        }
        if (data.assets && data.assets.real_estate) {
          data.assets.real_estate.forEach(prop => addTableRow('realEstateTable', prop));
        }
        if (data.assets && data.assets.mortgages) {
          data.assets.mortgages.forEach(mortg => addTableRow('mortgageTable', mortg));
        }
        if (data.assets && data.assets.vehicles) {
          data.assets.vehicles.forEach(vehicle => addTableRow('vehiclesTable', vehicle));
        }
        if (data.assets && data.assets.financial_assets) {
          data.assets.financial_assets.forEach(asset => addTableRow('financialAssetsTable', asset));
        }
        if (data.liabilities) {
          data.liabilities.forEach(loan => addTableRow('liabilitiesTable', loan));
        }
        if (data.allowances) {
          data.allowances.forEach(allowance => addTableRow('allowancesTable', allowance));
        }
        if (data.bank_accounts) {
          data.bank_accounts.forEach(acc => addTableRow('bankAccountsTable', acc));
        }
        if (data.credit_cards) {
          data.credit_cards.forEach(card => addTableRow('creditCardsTable', card));
        }
        if (data.pensions) {
          data.pensions.forEach(pen => addTableRow('pensionsTable', pen));
        }
        if (data.insurances) {
          data.insurances.forEach(insurance => addTableRow('insurancesTable', insurance));
        }
        if (data.goals && data.goals.capital_receipts) {
          data.goals.capital_receipts.forEach(receipt => addTableRow('capitalReceiptsTable', receipt));
        }
        if (data.goals && data.goals.recurring_goals) {
          data.goals.recurring_goals.forEach(goal => addTableRow('recurringGoalsTable', goal));
        }
        if (data.goals && data.goals.one_time_goals) {
          data.goals.one_time_goals.forEach(goal => addTableRow('oneTimeGoalsTable', goal));
        }
        if (data.goals && data.goals.children_goals) {
          data.goals.children_goals.forEach(goal => addTableRow('childrenGoalsTable', goal));
        }

        toggleConditionalFields();
        updateComputedExpensesTotal();
        updateLiveFinancialKPIs();
        collectQualityFlags();

        visitedSteps.clear();
        for (let s = 1; s <= TOTAL_STEPS; s++) {
          if (validateStep(s, true)) {
            visitedSteps.add(s);
          }
        }

        goToStep(1);

        validateAllStepsDots();

        saveDraft();

        if (window.resizeAllTextareas) {
          setTimeout(window.resizeAllTextareas, 50);
        }

        showNotification('קובץ הנתונים נטען בהצלחה! כל השדות מולאו.', 'success');
      } catch (err) {
        console.error('Error uploading JSON:', err);
        showNotification('שגיאה בטעינת הקובץ. ודא כי זהו קובץ JSON תקין שהורד מהאתר.', 'error');
      }
      
      jsonFileInput.value = '';
    };
    reader.readAsText(file);
  });

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  });

  nextBtn.addEventListener('click', () => {
    visitedSteps.add(currentStep);

    validateStep(currentStep);
    
    validateAllStepsDots();

    if (currentStep < TOTAL_STEPS) {
      goToStep(currentStep + 1);
    } else {
      let allValid = true;
      let firstInvalidStep = null;

      for (let s = 1; s <= TOTAL_STEPS; s++) {
        const isValid = validateStep(s);
        if (!isValid) {
          allValid = false;
          if (firstInvalidStep === null) {
            firstInvalidStep = s;
          }
        }
      }

      validateAllStepsDots(true);

      if (allValid) {
        submitForm();
      } else {
        goToStep(firstInvalidStep);
        showNotification('לא ניתן לשלוח את השאלון עד שכל השלבים יושלמו ויהיו תקינים. הועברת לשלב שעדיין לא הושלם.', 'error');
      }
    }
  });

  stepDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetStep = parseInt(dot.getAttribute('data-step'));
      if (targetStep === currentStep) return;

      visitedSteps.add(currentStep);

      validateStep(currentStep);
      
      validateAllStepsDots();

      goToStep(targetStep);
    });
  });

  closeModalBtn.addEventListener('click', () => {
    successModal.classList.add('hidden');
  });

  function goToStep(stepNum) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    
    currentStep = stepNum;
    
    const nextStepEl = document.getElementById(`step${currentStep}`);
    nextStepEl.classList.add('active');
    
    // Resize textareas inside the newly active step once displayed to calculate scrollHeight correctly
    nextStepEl.querySelectorAll('textarea').forEach(textarea => {
      textarea.style.resize = 'none';
      textarea.style.overflowY = 'hidden';
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
    
    nextStepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const percent = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    progressBar.style.width = `${percent}%`;
    progressContainer.setAttribute('data-current-step', currentStep);

    stepDots.forEach(dot => {
      const dotVal = parseInt(dot.getAttribute('data-step'));
      dot.classList.remove('active', 'completed');
      if (dotVal === currentStep) {
        dot.classList.add('active');
      } else if (dotVal < currentStep) {
        dot.classList.add('completed');
      }
    });

    backBtn.disabled = currentStep === 1;
    if (currentStep === TOTAL_STEPS) {
      nextBtn.innerHTML = `שלח שאלון <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      nextBtn.className = 'btn-nav btn-submit';
    } else {
      nextBtn.innerHTML = `הבא <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
      nextBtn.className = 'btn-nav btn-next';
    }

    // Update Floating Sticky Action Bar
    if (floatingStepBadge) floatingStepBadge.textContent = `שלב ${stepNum} מתוך ${TOTAL_STEPS}`;
    if (floatingStepName) floatingStepName.textContent = STEP_TITLES[stepNum] || '';
    if (floatingBackBtn) floatingBackBtn.disabled = stepNum === 1;
    if (floatingNextBtn) {
      if (stepNum === TOTAL_STEPS) {
        floatingNextBtn.innerHTML = `שלח שאלון <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        floatingNextBtn.className = 'btn-nav btn-submit';
      } else {
        floatingNextBtn.innerHTML = `הבא <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
        floatingNextBtn.className = 'btn-nav btn-next';
      }
    }

    // Update Sticky Sidebar Navigation for the new step
    renderSidebarNav(stepNum);
  }

  let scrollSpyObserver = null;

  function renderSidebarNav(stepNumber) {
    if (!sidebarNavList) return;
    
    if (sidebarStepBadge) {
      sidebarStepBadge.textContent = `שלב ${stepNumber} מתוך ${TOTAL_STEPS}`;
    }

    const SINGLE_TITLES = { partner1_fieldset: 'הפרטים שלכם', p1_income_fieldset: 'הכנסות ותעסוקה' };
    const sections = (STEP_SECTIONS[stepNumber] || [])
      .filter(sec => !document.getElementById(sec.id)?.classList.contains('hidden'))
      .map(sec => (!hasPartner() && SINGLE_TITLES[sec.id]) ? Object.assign({}, sec, { title: SINGLE_TITLES[sec.id] }) : sec);
    sidebarNavList.innerHTML = '';

    if (sections.length === 0) {
      if (stepSidebar) stepSidebar.style.display = 'none';
      return;
    }
    if (stepSidebar) stepSidebar.style.display = '';

    sections.forEach((sec, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `sidebar-nav-item ${idx === 0 ? 'active' : ''}`;
      btn.setAttribute('data-target-id', sec.id);
      btn.innerHTML = `
        <span class="nav-icon">${sec.icon}</span>
        <span class="nav-text">${sec.title}</span>
        <span class="nav-indicator"></span>
      `;

      btn.addEventListener('click', () => {
        const targetEl = document.getElementById(sec.id);
        if (targetEl) {
          if (sec.id === 'prepChecklistCard' && prepChecklistCard?.classList.contains('collapsed')) {
            prepChecklistCard.classList.remove('collapsed');
          }
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          sidebarNavList.querySelectorAll('.sidebar-nav-item').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      });

      sidebarNavList.appendChild(btn);
    });

    setupScrollSpy(stepNumber);
  }

  function setupScrollSpy(stepNumber) {
    if (scrollSpyObserver) {
      scrollSpyObserver.disconnect();
    }

    const sections = STEP_SECTIONS[stepNumber] || [];
    const elementsToObserve = sections
      .map(s => document.getElementById(s.id))
      .filter(Boolean);

    if (elementsToObserve.length === 0) return;

    scrollSpyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targetId = entry.target.id;
          const matchingBtn = sidebarNavList.querySelector(`[data-target-id="${targetId}"]`);
          if (matchingBtn) {
            sidebarNavList.querySelectorAll('.sidebar-nav-item').forEach(b => b.classList.remove('active'));
            matchingBtn.classList.add('active');
          }
        }
      });
    }, {
      rootMargin: '-10% 0px -55% 0px',
      threshold: 0.05
    });

    elementsToObserve.forEach(el => scrollSpyObserver.observe(el));
  }

  function addTableRow(tableName, initialData = null) {
    const tableBody = document.querySelector(`#${tableName} tbody`);
    if (!tableBody || !TABLE_TEMPLATES[tableName]) return;

    const row = document.createElement('tr');
    row.innerHTML = TABLE_TEMPLATES[tableName]();
    tableBody.appendChild(row);
    labelTableCells(row);

    // Real estate rows get a stable id, so a mortgage track can point at its property
    if (tableName === 'realEstateTable') {
      row.dataset.rowId = (initialData && initialData.id) || newRowId('re');
    }

    // If this is the expenses table, assign category attribute
    if (tableName === 'expensesTable') {
      const initialCat = (initialData && initialData.category) ? (LEGACY_EXPENSE_LABELS[initialData.category] || initialData.category) : '';
      row.setAttribute('data-category', getExpenseCategory(initialCat));
      row.dataset.categoryId = (initialData && initialData.category_id) || EXPENSE_IDS[initialCat] || 'custom';

      const catInput = row.querySelector('.cell-category');
      if (catInput) {
        catInput.addEventListener('input', () => {
          row.setAttribute('data-category', getExpenseCategory(catInput.value));
        });
      }
    }

    // Convert number inputs in the new row to text for comma formatting
    row.querySelectorAll('input[type="number"]').forEach(input => {
      const nameOrId = input.className || input.name;
      if (shouldFormatField(nameOrId)) {
        input.setAttribute('data-original-type', 'number');
        input.type = 'text';
        input.classList.add('formatted-number-input');
        input.inputMode = 'numeric';

        input.addEventListener('focus', function(e) {
          e.target.value = cleanCommas(e.target.value);
        });
        
        input.addEventListener('blur', function(e) {
          e.target.value = formatNumberWithCommas(e.target.value);
        });

        input.addEventListener('input', function(e) {
          const cleaned = e.target.value.replace(/[^\d.,-]/g, '');
          if (e.target.value !== cleaned) {
            e.target.value = cleaned;
          }
        });
      }
    });

    if (initialData) {
      Object.keys(initialData).forEach(key => {
        if (initialData[key] === null || initialData[key] === undefined) return;
        let input = row.querySelector(`.cell-${key}`);
        if (!input) {
          const hyphenatedKey = key.replace(/_/g, '-');
          input = row.querySelector(`.cell-${hyphenatedKey}`);
        }
        if (input) {
          if (input.classList.contains('combo-input')) {
            restoreCombo(input.closest('.combo-cell'), initialData[key], initialData[`${key}_key`]);
          } else if (input.classList.contains('cell-property-id')) {
            input.dataset.pending = initialData[key];
          } else if (input.type === 'checkbox') {
            input.checked = initialData[key];
          } else {
            input.value = initialData[key];
            if (input.getAttribute('data-original-type') === 'number' && shouldFormatField(key)) {
              input.value = formatNumberWithCommas(input.value);
            }
          }
        }
      });
    }

    row.querySelectorAll('.combo-cell').forEach(autoSelectSingleChoice);
    if (tableName === 'mortgageTable' || tableName === 'realEstateTable') refreshPropertyOptions();

    // Tab key Excel navigation: automatically add row when pressing Tab on the last field of the last row
    const focusableCells = row.querySelectorAll('input, select, textarea');
    if (focusableCells.length > 0) {
      const lastCell = focusableCells[focusableCells.length - 1];
      lastCell.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && !e.shiftKey) {
          const tbody = row.parentElement;
          if (tbody && row === tbody.lastElementChild) {
            e.preventDefault();
            const newRow = addTableRow(tableName);
            saveDraft();
            if (newRow) {
              const firstFocusable = newRow.querySelector('input, select, textarea');
              if (firstFocusable) firstFocusable.focus();
            }
          }
        }
      });
    }

    row.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', saveDraft);
      input.addEventListener('change', saveDraft);
    });

    row.querySelectorAll('textarea').forEach(textarea => {
      textarea.style.resize = 'none';
      textarea.style.overflowY = 'hidden';
      setTimeout(() => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }, 0);
    });

    return row;
  }

  function toggleConditionalFields() {
    const partnerOn = hasPartner();
    ['partner2_fieldset', 'p2_income_fieldset'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', !partnerOn);
    });
    if (lastHouseholdState !== partnerOn) {
      lastHouseholdState = partnerOn;
      updatePartnerLabels();
      refreshPersonCombos();
      renderSidebarNav(currentStep);
    }

    const isSingleParent = toggleSingleParentCheckbox.checked;
    condSingleParent.classList.toggle('hidden', !isSingleParent);

    const isSecondMarriage = toggleSecondMarriageCheckbox.checked;
    condSecondMarriage.classList.toggle('hidden', !isSecondMarriage);

    const isSelfEmployed = toggleSelfEmployedCheckbox.checked;
    condSelfEmployed.classList.toggle('hidden', !isSelfEmployed);

    const p1EmployeeIncomeContainer = document.getElementById('p1_employee_income_container');
    const p1BonusesContainer = document.getElementById('p1_bonuses_container');
    const p1SelfEmployedIncomeContainer = document.getElementById('p1_self_employed_income_container');
    if (p1EmploymentTypeSelect) {
      const isP1SelfEmployed = p1EmploymentTypeSelect.value === 'self_employed';
      if (p1SelfEmployedIncomeContainer) {
        p1SelfEmployedIncomeContainer.classList.toggle('hidden', !isP1SelfEmployed);
        if (!isP1SelfEmployed) {
          const input = document.getElementById('p1_self_employed_income');
          if (input) input.value = '';
        }
      }
      if (p1EmployeeIncomeContainer) {
        p1EmployeeIncomeContainer.classList.toggle('hidden', isP1SelfEmployed);
        if (isP1SelfEmployed) {
          const input = document.getElementById('p1_employee_income');
          if (input) input.value = '';
        }
      }
      if (p1BonusesContainer) {
        p1BonusesContainer.classList.toggle('hidden', isP1SelfEmployed);
        if (isP1SelfEmployed) {
          const input = document.getElementById('p1_bonuses');
          if (input) input.value = '';
        }
      }
    }

    const p2EmployeeIncomeContainer = document.getElementById('p2_employee_income_container');
    const p2BonusesContainer = document.getElementById('p2_bonuses_container');
    const p2SelfEmployedIncomeContainer = document.getElementById('p2_self_employed_income_container');
    if (p2EmploymentTypeSelect) {
      const isP2SelfEmployed = p2EmploymentTypeSelect.value === 'self_employed';
      if (p2SelfEmployedIncomeContainer) {
        p2SelfEmployedIncomeContainer.classList.toggle('hidden', !isP2SelfEmployed);
        if (!isP2SelfEmployed) {
          const input = document.getElementById('p2_self_employed_income');
          if (input) input.value = '';
        }
      }
      if (p2EmployeeIncomeContainer) {
        p2EmployeeIncomeContainer.classList.toggle('hidden', isP2SelfEmployed);
        if (isP2SelfEmployed) {
          const input = document.getElementById('p2_employee_income');
          if (input) input.value = '';
        }
      }
      if (p2BonusesContainer) {
        p2BonusesContainer.classList.toggle('hidden', isP2SelfEmployed);
        if (isP2SelfEmployed) {
          const input = document.getElementById('p2_bonuses');
          if (input) input.value = '';
        }
      }
    }

    const hasEmergencyFund = hasEmergencyFundSelect.value;
    const isFundYes = hasEmergencyFund === 'yes';
    emergencyFundAmountContainer.classList.toggle('hidden', !isFundYes);
    const emergencyFundLocationContainer = document.getElementById('emergency_fund_location_container');
    if (emergencyFundLocationContainer) {
      emergencyFundLocationContainer.classList.toggle('hidden', !isFundYes);
      if (!isFundYes) {
        const input = document.getElementById('emergency_fund_location');
        if (input) input.value = '';
      }
    }

    if (window.resizeAllTextareas) {
      setTimeout(window.resizeAllTextareas, 0);
    }
  }

  function validateStep(stepNum, silent = false) {
    const stepEl = document.getElementById(`step${stepNum}`);
    let isValid = true;

    if (!silent) {
      stepEl.querySelectorAll('.form-group.has-error, .consent-row.has-error').forEach(group => {
        group.classList.remove('has-error');
        const errorMsg = group.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
      });
    }

    const inputs = stepEl.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const closestFieldset = input.closest('.conditional-fieldset');
      if (closestFieldset && closestFieldset.classList.contains('hidden')) {
        return;
      }
      
      // Skip fields of a hidden section (e.g. partner 2 when filling alone)
      if (input.parentElement && input.parentElement.closest('.hidden')) {
        return;
      }

      const formGroup = input.closest('.form-group') || input.closest('.consent-row');
      let fieldError = '';

      if (input.hasAttribute('required') && (input.type === 'checkbox' ? !input.checked : !input.value.trim())) {
        fieldError = input.type === 'checkbox' ? 'יש לאשר כדי לשלוח את השאלון' : 'שדה זה הוא חובה';
      }
      
      else if (input.type === 'email' && input.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          fieldError = 'כתובת דוא"ל אינה תקינה';
        }
      }
      
      else if (input.type === 'tel' && input.value.trim()) {
        const phoneRegex = /^05\d[-]?\d{7}$|^0[23489][-]?\d{7}$/;
        if (!phoneRegex.test(input.value.trim().replace(/\s/g, ''))) {
          fieldError = 'מספר טלפון לא תקין (דוגמה: 050-1234567)';
        }
      }
      
      else if ((input.type === 'number' || input.getAttribute('data-original-type') === 'number') && input.value.trim()) {
        const val = parseNumber(input.value);
        if (isNaN(val)) {
          fieldError = 'נא להזין מספר תקין';
        } else if (val < 0) {
          fieldError = 'נא להזין מספר חיובי בלבד';
        }
      }

      if (fieldError) {
        isValid = false;
        
        if (!silent && formGroup) {
          formGroup.classList.add('has-error');
          const errSpan = document.createElement('span');
          errSpan.className = 'error-message';
          errSpan.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> ${fieldError}`;
          formGroup.appendChild(errSpan);

          input.addEventListener('input', function clearErr() {
            formGroup.classList.remove('has-error');
            const err = formGroup.querySelector('.error-message');
            if (err) err.remove();
            input.removeEventListener('input', clearErr);
          });
        }
      }
    });

    const tables = stepEl.querySelectorAll('.dynamic-table');
    tables.forEach(table => {
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('input, select, textarea');
        cells.forEach(input => {
          if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            
            if (!silent) {
              input.style.borderColor = 'var(--color-error)';
              input.style.backgroundColor = 'var(--color-error-bg)';
              
              input.addEventListener('input', function clearTableErr() {
                input.style.borderColor = '';
                input.style.backgroundColor = '';
                input.removeEventListener('input', clearTableErr);
              });
            }
          }
        });
      });
    });

    // Scroll to first invalid field and apply shake animation
    if (!isValid && !silent) {
      setTimeout(() => {
        let firstErrorEl = stepEl.querySelector('.form-group.has-error, .consent-row.has-error, input[style*="var(--color-error)"], textarea[style*="var(--color-error)"]');
        if (firstErrorEl && firstErrorEl.classList.contains('combo-input')) firstErrorEl = firstErrorEl.closest('.combo-cell');
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorEl.classList.add('shake-highlight');
          setTimeout(() => firstErrorEl.classList.remove('shake-highlight'), 800);
          const focusTarget = firstErrorEl.querySelector('input, select, textarea') || firstErrorEl;
          if (focusTarget && typeof focusTarget.focus === 'function') {
            try { focusTarget.focus(); } catch (err) {}
          }
        }
      }, 50);
    }

    return isValid;
  }

  function saveDraft() {
    try {
      updateComputedExpensesTotal();
      const data = getFormDataJSON();
      localStorage.setItem('financial_questionnaire_draft', JSON.stringify(data));
      localStorage.setItem('financial_questionnaire_step', currentStep);
      localStorage.setItem(STORAGE_KEYS.savedAt, String(Date.now()));
      localStorage.setItem('financial_questionnaire_visited_steps', JSON.stringify(Array.from(visitedSteps)));
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      draftStatusText.textContent = `נשמר אוטומטית כטיוטה ב- ${timeStr}`;
      if (floatingSaveText) {
        floatingSaveText.textContent = `טיוטה נשמרה ב- ${timeStr}`;
      }
    } catch (e) {
      console.error('Error saving draft:', e);
      draftStatusText.textContent = 'שגיאה בשמירת טיוטה מקומית';
    }
  }

  function loadDraft() {
    try {
      const draftStr = getStored(STORAGE_KEYS.draft);
      if (!draftStr) return;

      // Privacy: an old unsent draft is deleted automatically
      const savedAt = parseInt(getStored(STORAGE_KEYS.savedAt) || '0', 10);
      if (savedAt && Date.now() - savedAt > (CFG.DRAFT_MAX_AGE_DAYS || 14) * 86400000) {
        clearAllStoredData();
        return;
      }

      const data = JSON.parse(draftStr);
      if (!data) return;

      clearAllDynamicTables();

      populateFields(data);

      if (data.family && data.family.children) {
        data.family.children.forEach(child => addTableRow('childrenTable', child));
      }
      if (data.family && data.family.close_circle) {
        data.family.close_circle.forEach(item => addTableRow('circleTable', item));
      }
      if (data.additional_income) {
        data.additional_income.forEach(income => addTableRow('additionalIncomeTable', income));
      }
      if (data.expenses) {
        initializeExpensesTable(data.expenses);
      }
      if (data.assets && data.assets.real_estate) {
        data.assets.real_estate.forEach(prop => addTableRow('realEstateTable', prop));
      }
      if (data.assets && data.assets.mortgages) {
        data.assets.mortgages.forEach(mortg => addTableRow('mortgageTable', mortg));
      }
      if (data.assets && data.assets.vehicles) {
        data.assets.vehicles.forEach(vehicle => addTableRow('vehiclesTable', vehicle));
      }
      if (data.assets && data.assets.financial_assets) {
        data.assets.financial_assets.forEach(asset => addTableRow('financialAssetsTable', asset));
      }
      if (data.liabilities) {
        data.liabilities.forEach(loan => addTableRow('liabilitiesTable', loan));
      }
      if (data.allowances) {
        data.allowances.forEach(allowance => addTableRow('allowancesTable', allowance));
      }
      if (data.bank_accounts) {
        data.bank_accounts.forEach(acc => addTableRow('bankAccountsTable', acc));
      }
      if (data.credit_cards) {
        data.credit_cards.forEach(card => addTableRow('creditCardsTable', card));
      }
      if (data.pensions) {
        data.pensions.forEach(pen => addTableRow('pensionsTable', pen));
      }
      if (data.insurances) {
        data.insurances.forEach(insurance => addTableRow('insurancesTable', insurance));
      }
      if (data.goals && data.goals.capital_receipts) {
        data.goals.capital_receipts.forEach(receipt => addTableRow('capitalReceiptsTable', receipt));
      }
      if (data.goals && data.goals.recurring_goals) {
        data.goals.recurring_goals.forEach(goal => addTableRow('recurringGoalsTable', goal));
      }
      if (data.goals && data.goals.one_time_goals) {
        data.goals.one_time_goals.forEach(goal => addTableRow('oneTimeGoalsTable', goal));
      }
      if (data.goals && data.goals.children_goals) {
        data.goals.children_goals.forEach(goal => addTableRow('childrenGoalsTable', goal));
      }

      toggleConditionalFields();
      updateComputedExpensesTotal();
      updateLiveFinancialKPIs();

      const savedVisited = localStorage.getItem('financial_questionnaire_visited_steps');
      if (savedVisited) {
        const visitedArray = JSON.parse(savedVisited);
        visitedArray.forEach(s => visitedSteps.add(s));
      } else {
        for (let s = 1; s <= TOTAL_STEPS; s++) {
          if (validateStep(s, true)) {
            visitedSteps.add(s);
          }
        }
      }

      const savedStep = localStorage.getItem('financial_questionnaire_step');
      if (savedStep) {
        goToStep(parseInt(savedStep));
      }

      draftStatusText.textContent = 'טיוטה מקומית נטענה בהצלחה';
    } catch (e) {
      console.error('Error loading draft:', e);
    }
  }

  function populateFields(data, prefix = '') {
    Object.keys(data).forEach(key => {
      const val = data[key];
      if (val === null || val === undefined) return;

      if (typeof val === 'object' && !Array.isArray(val)) {
        populateFields(val, prefix ? `${prefix}[${key}]` : key);
      } else if (!Array.isArray(val)) {
        const fieldName = prefix ? `${prefix}[${key}]` : key;
        const input = form.querySelector(`[name="${fieldName}"]`);
        
        if (input) {
          if (input.type === 'checkbox') {
            input.checked = !!val;
          } else {
            input.value = val;
            if (input.getAttribute('data-original-type') === 'number' && shouldFormatField(input.name || input.id)) {
              input.value = formatNumberWithCommas(val);
            }
          }
        }
      }
    });
  }

  // Clears every named field before a JSON file is loaded, so nothing from a previous fill is left behind.
  function resetFormFields() {
    form.querySelectorAll('input[name], select[name], textarea[name]').forEach(el => {
      if (el.id === 'fill_date' || el.name === 'hp_website') return;
      if (el.type === 'checkbox') {
        el.checked = false;
      } else if (el.tagName === 'SELECT') {
        el.selectedIndex = Math.max(0, Array.from(el.options).findIndex(o => o.defaultSelected));
      } else {
        el.value = '';
      }
    });
  }

  function getFormDataJSON() {
    const partner2 = hasPartner();
    const person = (n, employmentSelect) => ({
      first_name: document.getElementById(`p${n}_first_name`).value,
      last_name: document.getElementById(`p${n}_last_name`).value,
      phone: document.getElementById(`p${n}_phone`).value,
      email: document.getElementById(`p${n}_email`).value,
      address: document.getElementById(`p${n}_address`).value,
      age: nz(document.getElementById(`p${n}_age`).value),
      employment_type: employmentSelect.value
    });
    const income = (n) => ({
      job_title: document.getElementById(`p${n}_job_title`).value,
      employee_income: nz(document.getElementById(`p${n}_employee_income`).value),
      bonuses: nz(document.getElementById(`p${n}_bonuses`).value),
      self_employed_income: nz(document.getElementById(`p${n}_self_employed_income`).value),
      previous_jobs: document.getElementById(`p${n}_previous_jobs`).value,
      notes: document.getElementById(`p${n}_income_notes`).value
    });

    return cleanEmpty({
      general: {
        fill_date: fillDateInput.value,
        household_type: householdTypeSelect ? householdTypeSelect.value : 'couple'
      },
      partner1: person(1, p1EmploymentTypeSelect),
      partner2: partner2 ? person(2, p2EmploymentTypeSelect) : null,
      family: {
        marital_status: maritalStatusSelect.value,
        marriage_duration: nz(document.getElementById('marriage_duration').value),
        previous_marriage: previousMarriageSelect.value,
        notes: document.getElementById('family_notes').value,
        children: serializeTable('childrenTable', ['name', 'gender', 'age', 'notes', 'general_notes']),
        close_circle: serializeTable('circleTable', ['close_to', 'relation', 'financial_status', 'can_help', 'needs_help', 'wealth_transfer', 'notes'])
      },
      income1: income(1),
      income2: partner2 ? income(2) : null,
      additional_income: serializeTable('additionalIncomeTable', ['source', 'amount', 'notes']),
      expenses: serializeTable('expensesTable', ['category', 'month1', 'month2', 'month3', 'average', 'notes']),
      assets: {
        real_estate: serializeTable('realEstateTable', ['description', 'purchase_val', 'current_val', 'mortgage_orig', 'mortgage_rem', 'notes']),
        mortgages: serializeTable('mortgageTable', ['property_id', 'bank', 'track', 'orig', 'remaining', 'rate', 'end_date', 'monthly', 'notes']),
        vehicles: serializeTable('vehiclesTable', ['model', 'year', 'value', 'notes']),
        future_assets_details: document.getElementById('future_assets_details').value,
        financial_assets: serializeTable('financialAssetsTable', ['type', 'company', 'amount', 'notes'])
      },
      bank_accounts: serializeTable('bankAccountsTable', ['name', 'owner', 'limit', 'usage', 'restricted']),
      credit_cards: serializeTable('creditCardsTable', ['owner', 'name', 'digits', 'limit', 'usage', 'notes']),
      assets_management: {
        tracking: document.getElementById('asset_tracking').value,
        risk_vs_yield: document.getElementById('risk_appetite').value,
        fees_check: document.getElementById('management_fees').value
      },
      liabilities: serializeTable('liabilitiesTable', ['lender', 'purpose', 'orig', 'current', 'monthly', 'start', 'end', 'rate']),
      pensions: serializeTable('pensionsTable', ['owner', 'company', 'is_executive_insurance', 'balance', 'monthly_deposit', 'has_life_insurance', 'annuity_coefficient', 'notes']),
      allowances: serializeTable('allowancesTable', ['source', 'recipient', 'amount', 'notes']),
      insurances: serializeTable('insurancesTable', ['type', 'insured', 'company', 'premium', 'sum_insured', 'agent', 'cov_type']),

      toggles: {
        single_parent: toggleSingleParentCheckbox.checked,
        second_marriage: toggleSecondMarriageCheckbox.checked,
        self_employed: toggleSelfEmployedCheckbox.checked
      },

      single_parent: !(condSingleParent.classList.contains('hidden')) ? {
        alimony_regular: document.getElementById('alimony_regular').value,
        ex_support_capability: document.getElementById('ex_support_capability').value,
        alimony_insured: document.getElementById('alimony_insured').value,
        alimony_end_plan: document.getElementById('alimony_end_plan').value
      } : null,

      second_marriage: !(condSecondMarriage.classList.contains('hidden')) ? {
        has_prenup: document.getElementById('has_prenup').value,
        beneficiaries: document.getElementById('will_beneficiaries').value,
        property_agreements: document.getElementById('property_agreements').value
      } : null,

      self_employed: !(condSelfEmployed.classList.contains('hidden')) ? {
        stability: document.getElementById('business_stability').value,
        risks: document.getElementById('business_risks').value,
        family_effect: document.getElementById('business_family_effect').value
      } : null,

      goals: {
        has_emergency_fund: hasEmergencyFundSelect.value,
        emergency_fund_amount: nz(document.getElementById('emergency_fund_amount').value),
        emergency_fund_location: document.getElementById('emergency_fund_location') ? document.getElementById('emergency_fund_location').value : '',
        capital_receipts: serializeTable('capitalReceiptsTable', ['source', 'amount', 'when', 'notes']),
        recurring_goals: serializeTable('recurringGoalsTable', ['description', 'freq', 'cost', 'notes']),
        one_time_goals: serializeTable('oneTimeGoalsTable', ['description', 'years', 'cost', 'notes']),
        children_goals: serializeTable('childrenGoalsTable', ['description', 'cost', 'age', 'notes']),
        expectations: document.getElementById('consultation_expectations').value
      }
    });
  }

  function parseNumber(val) {
    if (val === '' || val === null || val === undefined) return 0;
    const clean = val.toString().replace(/,/g, '');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Helper to format numbers with commas (e.g. 1000 -> 1,000)
  function formatNumberWithCommas(val) {
    if (val === undefined || val === null || val === '') return '';
    const clean = val.toString().replace(/,/g, '');
    if (isNaN(clean) || clean === '') return val;
    const parts = clean.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  // Helper to strip commas
  function cleanCommas(val) {
    if (val === undefined || val === null) return '';
    return val.toString().replace(/,/g, '');
  }

  // Helper to check if a field needs formatting with commas
  function shouldFormatField(nameOrId) {
    if (!nameOrId) return false;
    const lower = nameOrId.toString().toLowerCase();
    if (lower.includes('age') || 
        lower.includes('year') || 
        lower.includes('duration') || 
        lower.includes('freq') || 
        lower.includes('digits') || 
        lower.includes('coefficient') || 
        lower.includes('rate') ||
        lower.includes('phone') ||
        lower.includes('email') ||
        lower.includes('date')
    ) {
      return false;
    }
    return true;
  }

  // Dynamic Conversion of Number Inputs to Text Inputs for Comma Formatting
  function initNumberInputsFormatting() {
    const numberInputs = document.querySelectorAll('input[type="number"]');
    
    numberInputs.forEach(input => {
      const nameOrId = input.id || input.name || input.className;
      if (shouldFormatField(nameOrId)) {
        input.setAttribute('data-original-type', 'number');
        input.type = 'text';
        input.classList.add('formatted-number-input');
        input.inputMode = 'numeric';
        
        if (input.value) {
          input.value = formatNumberWithCommas(input.value);
        }
        
        input.addEventListener('focus', function(e) {
          e.target.value = cleanCommas(e.target.value);
        });
        
        input.addEventListener('blur', function(e) {
          e.target.value = formatNumberWithCommas(e.target.value);
        });

        input.addEventListener('input', function(e) {
          const cleaned = e.target.value.replace(/[^\d.,-]/g, '');
          if (e.target.value !== cleaned) {
            e.target.value = cleaned;
          }
        });
      }
    });
  }

  function serializeTable(tableId, fieldClasses) {
    const table = document.getElementById(tableId);
    if (!table) return [];

    const rows = table.querySelectorAll('tbody tr');
    const result = [];

    rows.forEach(row => {
      const obj = {};
      let hasVal = false;

      fieldClasses.forEach(field => {
        let input = row.querySelector(`.cell-${field}`);
        if (!input) {
          const hyphenatedField = field.replace(/_/g, '-');
          input = row.querySelector(`.cell-${hyphenatedField}`);
        }
        if (input) {
          let val = input.value;
          if (input.type === 'number' || input.getAttribute('data-original-type') === 'number') {
            val = nz(val);
          } else if (input.type === 'checkbox') {
            val = input.checked;
          }
          obj[field] = val;
          // "Pick from a list" cells also report which list item was chosen ('other' = typed by the client)
          if (input.classList.contains('combo-input')) {
            obj[`${field}_key`] = input.dataset.key || null;
          }
          if (val !== '' && val !== null && val !== false) {
            hasVal = true;
          }
        }
      });

      if (hasVal) {
        if (row.dataset.rowId) obj.id = row.dataset.rowId;
        if (tableId === 'expensesTable') {
          obj.category_id = row.dataset.categoryId || 'custom';
          obj.category_group = row.getAttribute('data-category') || 'other';
        }
        result.push(obj);
      }
    });

    return result;
  }

  const submitErrorModal = document.getElementById('submitErrorModal');

  function clientNameFromForm() {
    const p1Name = typedName(1);
    const p2Name = hasPartner() ? typedName(2) : '';
    return (p1Name && p2Name) ? `${p1Name} ו${p2Name}` : (p1Name || 'הלקוח');
  }

  // The exact JSON that is sent to the webhook: the form data + a "meta" block for the receiving side.
  function buildSubmissionPayload() {
    const data = getFormDataJSON();
    const utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(k => { utm[k] = urlParams.get(k) || null; });
    data.meta = cleanEmpty({
      submission_id: getSubmissionId(),
      schema_version: CFG.SCHEMA_VERSION || null,
      submitted_at: new Date().toISOString(),
      started_at: new Date(pageLoadedAt).toISOString(),
      fill_seconds: Math.round((Date.now() - pageLoadedAt) / 1000),
      advisor: trackedAdvisor,
      source: utm,
      device: window.innerWidth <= 768 ? 'mobile' : 'desktop',
      language: navigator.language || null,
      loaded_from_file: loadedFromFile,
      page_url: window.location.origin + window.location.pathname,
      consent: {
        privacy_policy: !!document.getElementById('consent_privacy')?.checked,
        policy_version: CFG.POLICY_VERSION || null,
        accepted_at: new Date().toISOString()
      },
      totals: computeTotals(),
      quality_flags: collectQualityFlags(),
      turnstile_token: turnstileToken
    });
    return data;
  }

  // POST with timeout + retries. Success ONLY when the server answers 2xx.
  async function postSubmission(payload, onAttempt) {
    const attempts = CFG.SUBMIT_ATTEMPTS || 3;
    let detail = '';
    for (let attempt = 1; attempt <= attempts; attempt++) {
      if (onAttempt) onAttempt(attempt, attempts);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CFG.SUBMIT_TIMEOUT_MS || 20000);
      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timer);
        if (response.ok) return { ok: true };
        detail = `קוד תשובה ${response.status}`;
        console.warn('Webhook returned a non-success status:', response.status);
        // A 4xx (other than "too many requests / timeout") will not fix itself by retrying.
        if (response.status >= 400 && response.status < 500 && response.status !== 429 && response.status !== 408) break;
      } catch (err) {
        clearTimeout(timer);
        detail = err.name === 'AbortError' ? 'השרת לא הגיב בזמן' : 'בעיית תקשורת / חיבור לאינטרנט';
        console.error('Error submitting questionnaire to webhook:', err);
      }
      if (attempt < attempts) await sleep(1500 * attempt);
    }
    return { ok: false, detail };
  }

  async function submitForm() {
    if (isSubmitting) return;

    // Honeypot: real people never see this field. Pretend it worked, so bots learn nothing.
    const honeypot = document.getElementById('hp_website');
    if (honeypot && honeypot.value.trim() !== '') {
      showSuccessModal(getFormDataJSON(), clientNameFromForm());
      return;
    }

    const lastSubmitAt = parseInt(getStored(STORAGE_KEYS.lastSubmitAt) || '0', 10);
    if (lastSubmitAt && Date.now() - lastSubmitAt < (CFG.SUBMIT_COOLDOWN_SECONDS || 60) * 1000) {
      showNotification('השאלון נשלח זה עתה. אם צריך לשלוח שוב, נסו שוב בעוד דקה.', 'error');
      return;
    }

    if (CFG.TURNSTILE_SITE_KEY && !turnstileToken) {
      showNotification('לפני השליחה נא לאשר שאינכם רובוט (בתחתית השלב האחרון).', 'error');
      return;
    }

    isSubmitting = true;
    const clientName = clientNameFromForm();
    const payload = buildSubmissionPayload();
    lastPayload = payload;

    const originalNextBtnHtml = nextBtn.innerHTML;
    nextBtn.disabled = true;
    nextBtn.innerHTML = 'שולח נתונים מאובטחים ליועץ... ⏳';
    if (floatingNextBtn) {
      floatingNextBtn.disabled = true;
      floatingNextBtn.innerHTML = 'שולח נתונים... ⏳';
    }

    const result = await postSubmission(payload, (attempt, total) => {
      if (attempt > 1) {
        nextBtn.innerHTML = `מנסים שוב (${attempt} מתוך ${total})... ⏳`;
        if (floatingNextBtn) floatingNextBtn.innerHTML = `מנסים שוב (${attempt}/${total})... ⏳`;
      }
    });

    isSubmitting = false;
    nextBtn.disabled = false;
    nextBtn.innerHTML = originalNextBtnHtml;
    if (floatingNextBtn) {
      floatingNextBtn.disabled = false;
      floatingNextBtn.innerHTML = originalNextBtnHtml;
    }

    if (result.ok) {
      setStored(STORAGE_KEYS.lastSubmitAt, String(Date.now()));
      clearAllStoredData();
      if (draftStatusText) draftStatusText.textContent = 'השאלון נשלח בהצלחה ליועץ!';
      if (floatingSaveText) floatingSaveText.textContent = 'השאלון נשלח בהצלחה ליועץ!';
      showSuccessModal(payload, clientName);
    } else {
      // Nothing is deleted: the draft stays in the browser and the client can retry or send us a backup file.
      resetTurnstile();
      showSubmitError(result.detail, payload, clientName);
    }
  }

  function showSubmitError(detail, payload, clientName) {
    if (!submitErrorModal) return;
    const detailEl = document.getElementById('submitErrorDetail');
    if (detailEl) detailEl.textContent = detail ? `פרטים טכניים: ${detail}` : '';

    document.getElementById('retrySubmitBtn').onclick = () => {
      submitErrorModal.classList.add('hidden');
      submitForm();
    };
    document.getElementById('errorDownloadJsonBtn').onclick = () => downloadJsonFile(payload, clientName);
    document.getElementById('closeSubmitErrorBtn').onclick = () => submitErrorModal.classList.add('hidden');

    const waBtn = document.getElementById('errorWhatsappBtn');
    const advisor = (CFG.ADVISORS || [])[0];
    if (waBtn) {
      if (advisor) {
        const msg = `היי ${advisor.name}, ניסיתי לשלוח את שאלון הייעוץ הפיננסי באתר עבור ${clientName} אבל השליחה לא הצליחה. אפשר לעזור?`;
        waBtn.href = `https://wa.me/${advisor.whatsapp}?text=${encodeURIComponent(msg)}`;
      } else {
        waBtn.classList.add('hidden');
      }
    }
    submitErrorModal.classList.remove('hidden');
  }

  function showSuccessModal(data, clientName) {
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const downloadJsonBackupBtn = document.getElementById('downloadJsonBackupBtn');

    // WhatsApp message to the advisors is an optional bonus - they are notified automatically anyway.
    const advisors = CFG.ADVISORS || [];
    [['successWhatsappBtn1', advisors[0]], ['successWhatsappBtn2', advisors[1]]].forEach(([id, advisor]) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      if (!advisor) {
        btn.classList.add('hidden');
        return;
      }
      const msg = `היי ${advisor.name}, סיימתי למלא את שאלון הייעוץ הפיננסי באתר עבור ${clientName}. כל הנתונים נשלחו בהצלחה למערכת!`;
      btn.href = `https://wa.me/${advisor.whatsapp}?text=${encodeURIComponent(msg)}`;
      const label = btn.querySelector('span');
      if (label) label.textContent = `שלח וואטסאפ ל${advisor.name}`;
    });

    if (downloadPdfBtn) {
      downloadPdfBtn.onclick = () => generateAndPrintPdfSummary(data, clientName);
    }

    if (downloadJsonBackupBtn) {
      downloadJsonBackupBtn.onclick = () => downloadJsonFile(data, clientName);
    }

    if (successModal) {
      successModal.classList.remove('hidden');
    }
  }

  function downloadJsonFile(data, clientName) {
    const filename = `נתונים פיננסים ${clientName}.json`;
    const jsonString = JSON.stringify(data, null, 2);
    try {
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('קובץ הגיבוי הורד למחשבכם בהצלחה.', 'success');
    } catch (err) {
      console.error('Error downloading JSON:', err);
    }
  }

  function generateAndPrintPdfSummary(data, clientName) {
    const p1 = data.partner1 || {};
    const p2 = data.partner2 || {};
    const family = data.family || {};
    const fillDate = data.general?.fill_date || new Date().toLocaleDateString('he-IL');

    // Totals are computed once (same numbers as the live cards on screen)
    const totals = (data.meta && data.meta.totals) || computeTotals();
    const totalIncome = totals.monthly_income;
    const totalExpenses = totals.monthly_expenses;
    const freeCashflow = totals.free_cashflow;
    const totalAssets = totals.total_assets;
    const totalLiabilities = totals.total_liabilities;
    const netWorth = totals.net_worth;
    const MARITAL = {
      married: 'נשואים', cohabiting: 'בזוגיות / ידועים בציבור', single: 'רווק/ה',
      divorced: 'גרוש/ה', widowed: 'אלמן/ה', single_parent: 'חד הורי/ת'
    };
    const childrenCount = Array.isArray(family.children) ? family.children.length : 0;

    const printWindow = window.open('', '_blank', 'width=950,height=850');
    if (!printWindow) {
      alert('אנא אפשר חלונות קופצים (Popups) כדי לצפות ולהדפיס את דוח הסיכום.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="utf-8">
        <title>סיכום נתונים פיננסיים - ${escapeHtml(clientName)}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap');
          @page { size: A4 portrait; margin: 12mm 15mm; }
          * { box-sizing: border-box; }
          body {
            font-family: 'Rubik', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            direction: rtl;
            text-align: right;
            color: #0f172a;
            line-height: 1.5;
            padding: 24px;
            background: #ffffff;
            margin: 0 auto;
            max-width: 900px;
          }
          .no-print-bar {
            background: #ecfdf5;
            border: 1.5px solid #10b981;
            padding: 14px 20px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
          }
          .btn-print-action {
            background: #059669;
            color: #ffffff;
            border: none;
            padding: 10px 24px;
            font-size: 0.95rem;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
          }
          .btn-print-action:hover {
            background: #047857;
          }
          .report-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #059669;
            padding-bottom: 14px;
            margin-bottom: 22px;
          }
          .report-title h1 {
            font-size: 1.55rem;
            color: #064e3b;
            margin: 0 0 6px 0;
            font-weight: 700;
          }
          .report-title p {
            margin: 0;
            color: #64748b;
            font-size: 0.92rem;
          }
          .report-badge {
            background: #f1f5f9;
            color: #0f172a;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            border: 1px solid #cbd5e1;
          }
          .card-box {
            background: #ffffff;
            border: 1.5px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px 20px;
            margin-bottom: 18px;
            page-break-inside: avoid;
          }
          .card-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #064e3b;
            border-bottom: 1.5px dashed #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 14px;
          }
          .metrics-grid {
            display: flex;
            gap: 14px;
            margin-bottom: 10px;
          }
          .metric-cell {
            flex: 1;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            text-align: center;
          }
          .metric-label {
            font-size: 0.8rem;
            color: #64748b;
            font-weight: 600;
            display: block;
            margin-bottom: 4px;
          }
          .metric-value {
            font-size: 1.25rem;
            font-weight: 700;
          }
          .text-green { color: #059669; }
          .text-red { color: #dc2626; }
          .text-blue { color: #2563eb; }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
          }
          .info-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #f1f5f9;
          }
          .info-table td.label {
            width: 32%;
            color: #64748b;
            font-weight: 600;
          }
          .report-footer {
            margin-top: 30px;
            padding-top: 14px;
            border-top: 1px solid #e2e8f0;
            font-size: 0.8rem;
            color: #94a3b8;
            text-align: center;
          }
          @media print {
            .no-print-bar { display: none !important; }
            body { padding: 0; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <div>
            <strong style="font-size: 1rem; color: #064e3b;">דוח סיכום נתונים אישי לשמירה</strong>
            <div style="font-size: 0.85rem; color: #047857;">לחצו על הכפתור כדי לשמור כקובץ PDF או להדפיס למחשב</div>
          </div>
          <button type="button" class="btn-print-action" onclick="window.print()">שמור כ-PDF / הדפס</button>
        </div>

        <div class="report-header">
          <div class="report-title">
            <h1>סיכום שאלון נתונים לייעוץ פיננסי</h1>
            <p>לקוח/ה: <strong>${escapeHtml(clientName)}</strong> | תאריך מילוי: ${escapeHtml(fillDate)}</p>
          </div>
          <span class="report-badge">עותק סיכום אישי</span>
        </div>

        <!-- Personal Info -->
        <div class="card-box">
          <div class="card-title">פרטים אישיים ומצב משפחתי</div>
          <table class="info-table">
            <tr>
              <td class="label">בן/בת זוג 1:</td>
              <td><strong>${escapeHtml(p1.first_name)} ${escapeHtml(p1.last_name)}</strong> ${p1.phone ? `(${escapeHtml(p1.phone)})` : ''} ${p1.email ? `| ${escapeHtml(p1.email)}` : ''}</td>
            </tr>
            ${p2.first_name ? `
            <tr>
              <td class="label">בן/בת זוג 2:</td>
              <td><strong>${escapeHtml(p2.first_name)} ${escapeHtml(p2.last_name)}</strong> ${p2.phone ? `(${escapeHtml(p2.phone)})` : ''}</td>
            </tr>
            ` : ''}
            <tr>
              <td class="label">מצב משפחתי:</td>
              <td>${escapeHtml(MARITAL[family.marital_status] || '')} ${family.marriage_duration ? `(משך: ${escapeHtml(family.marriage_duration)} שנים)` : ''}</td>
            </tr>
            <tr>
              <td class="label">ילדים:</td>
              <td>${childrenCount ? `${childrenCount} ילדים` : 'ללא ילדים'}</td>
            </tr>
          </table>
        </div>

        <!-- Cashflow Snapshot -->
        <div class="card-box">
          <div class="card-title">תמונת מצב תזרימית חודשית (ממוצע)</div>
          <div class="metrics-grid">
            <div class="metric-cell">
              <span class="metric-label">סך הכנסות חודשיות</span>
              <span class="metric-value text-green">${totalIncome.toLocaleString('he-IL')} ₪</span>
            </div>
            <div class="metric-cell">
              <span class="metric-label">סך הוצאות ממוצעות</span>
              <span class="metric-value text-red">${totalExpenses.toLocaleString('he-IL')} ₪</span>
            </div>
            <div class="metric-cell">
              <span class="metric-label">תזרים פנוי חודשי משוער</span>
              <span class="metric-value ${freeCashflow >= 0 ? 'text-green' : 'text-red'}">${freeCashflow.toLocaleString('he-IL')} ₪</span>
            </div>
          </div>
        </div>

        <!-- Balance Sheet Snapshot -->
        <div class="card-box">
          <div class="card-title">תמונת מצב מאזן הון ושיווי נקי מוערך</div>
          <div class="metrics-grid">
            <div class="metric-cell">
              <span class="metric-label">סך שווי נכסים וחסכונות</span>
              <span class="metric-value text-blue">${totalAssets.toLocaleString('he-IL')} ₪</span>
            </div>
            <div class="metric-cell">
              <span class="metric-label">סך התחייבויות ומשכנתאות</span>
              <span class="metric-value text-red">${totalLiabilities.toLocaleString('he-IL')} ₪</span>
            </div>
            <div class="metric-cell">
              <span class="metric-label">שווי נקי מוערך</span>
              <span class="metric-value text-green">${netWorth.toLocaleString('he-IL')} ₪</span>
            </div>
          </div>
        </div>

        <!-- Goals & Expectations -->
        <div class="card-box">
          <div class="card-title">יעדים וציפיות מתהליך הייעוץ</div>
          <table class="info-table">
            <tr>
              <td class="label">קרן חירום:</td>
              <td>${data.goals?.has_emergency_fund === 'yes' ? `קיימת (${(parseFloat(data.goals?.emergency_fund_amount) || 0).toLocaleString('he-IL')} ₪)` : 'טרם הוגדרה'}</td>
            </tr>
            ${data.goals?.expectations ? `
            <tr>
              <td class="label">ציפיות מהייעוץ:</td>
              <td>${escapeHtml(data.goals.expectations)}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div class="report-footer">
          הדוח הופק באופן מאובטח מאתר השאלון הפיננסי לצורך הכנת תוכנית ייעוץ כלכלי. כל הנתונים חסויים ומוגנים.
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 450);
  }

  function showNotification(msg, type) {
    notification.textContent = msg;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');

    // Auto-scroll to notification
    notification.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Hide after 5 seconds
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 5000);
  }

  // Dynamic Auto-Resizing for Textareas
  function initAutoResizeTextareas() {
    function autoResize(el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }

    // Delegate input event on the document level for all textareas
    document.addEventListener('input', function (e) {
      if (e.target && e.target.tagName.toLowerCase() === 'textarea') {
        autoResize(e.target);
      }
    });

    // Helper to resize all textareas currently in the DOM
    window.resizeAllTextareas = function() {
      document.querySelectorAll('textarea').forEach(textarea => {
        textarea.style.resize = 'none';
        textarea.style.overflowY = 'hidden';
        autoResize(textarea);
      });
    };

    // Run initially
    window.resizeAllTextareas();
  }

  // --- INITIAL LAUNCH ---
  
  // Set up auto-resizing textareas
  initAutoResizeTextareas();

  // Initialize number formatting for statically defined number inputs in the HTML
  initNumberInputsFormatting();

  // Try loading draft
  loadDraft();

  // If no child rows exist, add a default blank row to the children table
  const childRows = document.querySelectorAll('#childrenTable tbody tr');
  if (childRows.length === 0) {
    addTableRow('childrenTable');
  }

  // If no bank rows exist, add a default blank row to the bankAccountsTable
  const bankRows = document.querySelectorAll('#bankAccountsTable tbody tr');
  if (bankRows.length === 0) {
    addTableRow('bankAccountsTable');
  }

  // If no credit card rows exist, add a default blank row to the creditCardsTable
  const creditCardRows = document.querySelectorAll('#creditCardsTable tbody tr');
  if (creditCardRows.length === 0) {
    addTableRow('creditCardsTable');
  }

  // If no pension rows exist, add a default blank row to the pensionsTable
  const pensionRows = document.querySelectorAll('#pensionsTable tbody tr');
  if (pensionRows.length === 0) {
    addTableRow('pensionsTable');
  }

  // If no expenses rows exist, initialize the table
  const expensesRows = document.querySelectorAll('#expensesTable tbody tr');
  if (expensesRows.length === 0) {
    initializeExpensesTable();
  }

  // Check conditional visibility on load
  toggleConditionalFields();
  updateComputedExpensesTotal();
  updateLiveFinancialKPIs();

  // Validate all steps to color indicators on start
  validateAllStepsDots();

  // Initialize Floating Action Bar
  floatingBackBtn?.addEventListener('click', () => backBtn.click());
  floatingNextBtn?.addEventListener('click', () => nextBtn.click());
  if (floatingStepBadge) floatingStepBadge.textContent = `שלב ${currentStep} מתוך ${TOTAL_STEPS}`;
  if (floatingStepName) floatingStepName.textContent = STEP_TITLES[currentStep] || '';

  // Initialize Sticky Step Sidebar
  renderSidebarNav(currentStep);

  sidebarScrollTopBtn?.addEventListener('click', () => {
    const activeStepEl = document.getElementById(`step${currentStep}`);
    if (activeStepEl) {
      activeStepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  window.addEventListener('scroll', () => {
    if (!sidebarProgressBar) return;
    const activeStepEl = document.getElementById(`step${currentStep}`);
    if (!activeStepEl) return;
    
    const rect = activeStepEl.getBoundingClientRect();
    const totalHeight = activeStepEl.offsetHeight - window.innerHeight;
    if (totalHeight > 0) {
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(100, (scrolled / totalHeight) * 100));
      sidebarProgressBar.style.width = `${progress}%`;
    }
  }, { passive: true });

  // Setup Document Prep Checklist Toggle
  prepChecklistToggle?.addEventListener('click', () => {
    prepChecklistCard?.classList.toggle('collapsed');
  });

  // Setup Expenses Search and Category Filter Tabs
  if (expenseSearchInput) {
    expenseSearchInput.addEventListener('input', filterExpenses);
  }
  if (clearExpenseSearch) {
    clearExpenseSearch.addEventListener('click', () => {
      expenseSearchInput.value = '';
      filterExpenses();
      expenseSearchInput.focus();
    });
  }
  if (expenseCategoryTabs) {
    expenseCategoryTabs.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        expenseCategoryTabs.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        filterExpenses();
      });
    });
  }

  // Expense filter: show the real number of default rows
  const allExpensesPill = expenseCategoryTabs?.querySelector('.cat-pill[data-cat="all"]');
  if (allExpensesPill) allExpensesPill.textContent = `הכל (${DEFAULT_EXPENSES_LIST.length})`;

  updatePartnerLabels();
  refreshPropertyOptions();
  initTurnstile();

  // Setup Mobile Recommendation Smart Modal
  if (window.innerWidth <= 768 && !sessionStorage.getItem('mobile_rec_dismissed')) {
    if (mobileRecModal) {
      mobileRecModal.classList.remove('hidden');
    }
  }

  continueOnMobileBtn?.addEventListener('click', () => {
    if (mobileRecModal) mobileRecModal.classList.add('hidden');
    sessionStorage.setItem('mobile_rec_dismissed', 'true');
  });

  // "Send myself the link" options (all free, no server): WhatsApp, e-mail, copy
  {
    const pageUrl = window.location.href.split('#')[0];
    const text = `היי, הנה קישור לשאלון הייעוץ הפיננסי כדי לפתוח ולמלא אותו בנוחות מהמחשב:\n${pageUrl}`;
    if (sendSelfWhatsappBtn) sendSelfWhatsappBtn.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
    const sendSelfEmailBtn = document.getElementById('sendSelfEmailBtn');
    if (sendSelfEmailBtn) {
      sendSelfEmailBtn.href = `mailto:?subject=${encodeURIComponent('קישור לשאלון הייעוץ הפיננסי')}&body=${encodeURIComponent(text)}`;
    }
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    copyLinkBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pageUrl);
        copyLinkBtn.textContent = 'הקישור הועתק ✓';
      } catch (err) {
        window.prompt('העתיקו את הקישור:', pageUrl);
      }
    });
  }

  // Perform initial resize of all textareas to fit loaded values
  setTimeout(() => {
    if (window.resizeAllTextareas) window.resizeAllTextareas();
  }, 100);
});

