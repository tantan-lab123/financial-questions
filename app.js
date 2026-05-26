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
  
  // Form Status & Control Elements
  const fillDateInput = document.getElementById('fill_date');
  const maritalStatusSelect = document.getElementById('marital_status');
  const marriageDurationContainer = document.getElementById('marriage_duration_container');
  const previousMarriageSelect = document.getElementById('previous_marriage');
  const p1SelfEmployedCheckbox = document.getElementById('p1_is_self_employed');
  const p2SelfEmployedCheckbox = document.getElementById('p2_is_self_employed');
  
  const hasEmergencyFundSelect = document.getElementById('has_emergency_fund');
  const emergencyFundAmountContainer = document.getElementById('emergency_fund_amount_container');
  
  // Modal Elements
  const successModal = document.getElementById('successModal');
  const jsonPreview = document.getElementById('jsonPreview');
  const downloadJsonBtn = document.getElementById('downloadJsonBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  
  // Draft Status Elements
  const draftStatusText = document.getElementById('draftStatus');
  const clearDraftBtn = document.getElementById('clearDraftBtn');
  const uploadJsonBtn = document.getElementById('uploadJsonBtn');
  const downloadDraftBtn = document.getElementById('downloadDraftBtn');
  const jsonFileInput = document.getElementById('jsonFileInput');
  const notification = document.getElementById('notification');

  // --- STATE ---
  let currentStep = 1;
  const TOTAL_STEPS = 5;
  const visitedSteps = new Set();

  // --- DYNAMIC TABLE CELL TEMPLATES ---
  const TABLE_TEMPLATES = {
    childrenTable: () => `
      <td><input type="text" class="cell-name" placeholder="שם הילד/ה" required></td>
      <td>
        <select class="cell-gender">
          <option value="ז">זכר</option>
          <option value="נ">נקבה</option>
        </select>
      </td>
      <td><input type="number" class="cell-age" min="0" max="50" placeholder="גיל" required></td>
      <td><textarea class="cell-notes" rows="1" placeholder="פירוט צרכים פיננסיים, חוגים וכו'"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </td>
    `,
    circleTable: () => `
      <td><select class="cell-close-to"><option value="בן זוג 1">בן זוג 1</option><option value="בן זוג 2">בן זוג 2</option><option value="משותף">משותף</option></select></td>
      <td><input type="text" class="cell-relation" placeholder="למשל: אב, סבתא" required></td>
      <td><select class="cell-financial-status">${generateNumberOptions(1, 10, 5)}</select></td>
      <td><select class="cell-can-help">${generateNumberOptions(1, 10, 5)}</select></td>
      <td><select class="cell-needs-help">${generateNumberOptions(1, 10, 1)}</select></td>
      <td><input type="number" class="cell-wealth-transfer" min="0" placeholder="0"></td>
      <td><input type="text" class="cell-notes" placeholder="הערות"></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    additionalIncomeTable: () => `
      <td><input type="text" class="cell-source" placeholder="למשל: קצבת ילדים, שכירות" required></td>
      <td><input type="number" class="cell-amount" min="0" placeholder="0" required></td>
      <td><input type="text" class="cell-notes" placeholder="זמני/קבוע, מועד סיום"></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    realEstateTable: () => `
      <td><input type="text" class="cell-description" placeholder="נכס מגורים/השקעה + עיר" required></td>
      <td><input type="number" class="cell-purchase-val" min="0" placeholder="0"></td>
      <td><input type="number" class="cell-current-val" min="0" placeholder="0" required></td>
      <td><input type="number" class="cell-mortgage-orig" min="0" placeholder="0"></td>
      <td><input type="number" class="cell-mortgage-rem" min="0" placeholder="0"></td>
      <td><input type="text" class="cell-notes" placeholder="הערות"></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    mortgageTable: () => `
      <td><input type="text" class="cell-bank" placeholder="בנק מלווה" required></td>
      <td><input type="text" class="cell-track" placeholder="פריים, קל&quot;צ, משתנה" required></td>
      <td><input type="number" class="cell-orig" min="0" placeholder="0"></td>
      <td><input type="number" class="cell-remaining" min="0" placeholder="0" required></td>
      <td><input type="number" class="cell-rate" step="0.01" min="0" placeholder="0.0" required></td>
      <td><input type="month" class="cell-end-date" required></td>
      <td><input type="number" class="cell-monthly" min="0" placeholder="0" required></td>
      <td><input type="text" class="cell-notes" placeholder="הערות"></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    vehiclesTable: () => `
      <td><input type="text" class="cell-model" placeholder="יצרן ודגם" required></td>
      <td><input type="number" class="cell-year" min="1980" max="2030" placeholder="שנת ייצור" required></td>
      <td><input type="number" class="cell-value" min="0" placeholder="0" required></td>
      <td><input type="text" class="cell-notes" placeholder="בעלות, הלוואה וכו'"></td>
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
      <td><input type="text" class="cell-company" placeholder="בנק / בית השקעות" required></td>
      <td><input type="number" class="cell-amount" min="0" placeholder="0" required></td>
      <td><input type="text" class="cell-notes" placeholder="נזיל/זמני, ייעוד"></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    liabilitiesTable: () => `
      <td><input type="text" class="cell-lender" placeholder="הבנק / הגורם המלווה" required></td>
      <td><input type="text" class="cell-purpose" placeholder="מטרת ההלוואה" required></td>
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
      <td><input type="text" class="cell-source" placeholder="קצבת ילדים / נכות / אחר" required></td>
      <td><input type="number" class="cell-amount" min="0" placeholder="0" required></td>
      <td><input type="text" class="cell-notes" placeholder="קבוע / זמני"></td>
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
      <td><input type="text" class="cell-insured" placeholder="למשל: כולם, בת זוג 2" required></td>
      <td><input type="text" class="cell-company" placeholder="חברת ביטוח" required></td>
      <td><input type="text" class="cell-premium" placeholder="עלות / כיסוי" required></td>
      <td><input type="text" class="cell-agent" placeholder="שם סוכן"></td>
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
      <td><input type="text" class="cell-source" placeholder="למשל: השתלמות, ירושה" required></td>
      <td><input type="number" class="cell-amount" min="0" placeholder="0" required></td>
      <td><input type="text" class="cell-when" placeholder="למשל: 2028, עוד שנתיים" required></td>
      <td><input type="text" class="cell-notes" placeholder="שימוש מתוכנן"></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    recurringGoalsTable: () => `
      <td><input type="text" class="cell-description" placeholder="שדרוג רכב, חופשה שנתית" required></td>
      <td><input type="number" class="cell-freq" min="1" placeholder="למשל: 3" required></td>
      <td><input type="number" class="cell-cost" min="0" placeholder="0" required></td>
      <td><input type="text" class="cell-notes" placeholder="הערות"></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    oneTimeGoalsTable: () => `
      <td><input type="text" class="cell-description" placeholder="קניית דירה, עסק, לימודים" required></td>
      <td><input type="number" class="cell-years" min="1" placeholder="למשל: 5" required></td>
      <td><input type="number" class="cell-cost" min="0" placeholder="0" required></td>
      <td><input type="text" class="cell-notes" placeholder="הערות"></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    childrenGoalsTable: () => `
      <td><input type="text" class="cell-description" placeholder="מימון חתונה, עזרה לדירה" required></td>
      <td><input type="number" class="cell-cost" min="0" placeholder="0" required></td>
      <td><input type="number" class="cell-age" min="1" placeholder="למשל: 21" required></td>
      <td><input type="text" class="cell-notes" placeholder="הערות"></td>
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
        saveDraft();
      }, 200);
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

  // Handle input event to trigger auto-saving draft
  form.addEventListener('input', () => {
    saveDraft();
    validateAllStepsDots();
  });
  form.addEventListener('change', () => {
    saveDraft();
    toggleConditionalFields();
    validateAllStepsDots();
  });

  // Clear Draft button
  clearDraftBtn.addEventListener('click', () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים ולהתחיל מחדש?')) {
      localStorage.removeItem('financial_questionnaire_draft');
      localStorage.removeItem('financial_questionnaire_step');
      localStorage.removeItem('financial_questionnaire_visited_steps');
      location.reload();
    }
  });

  // Helper to clear all dynamic tables
  function clearAllDynamicTables() {
    const tableIds = [
      'childrenTable', 'circleTable', 'additionalIncomeTable', 'realEstateTable',
      'mortgageTable', 'vehiclesTable', 'financialAssetsTable', 'liabilitiesTable',
      'allowancesTable', 'insurancesTable', 'capitalReceiptsTable',
      'recurringGoalsTable', 'oneTimeGoalsTable', 'childrenGoalsTable'
    ];
    tableIds.forEach(id => {
      const tbody = document.querySelector(`#${id} tbody`);
      if (tbody) tbody.innerHTML = '';
    });
  }

  // Upload JSON button click handler
  uploadJsonBtn.addEventListener('click', () => {
    jsonFileInput.click();
  });

  // Download Draft button handler
  downloadDraftBtn.addEventListener('click', () => {
    const data = getFormDataJSON();
    const jsonString = JSON.stringify(data, null, 2);
    
    // Get partner names for draft filename
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

  // Handle uploaded JSON file
  jsonFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const data = JSON.parse(evt.target.result);
        if (!data) throw new Error('קובץ ריק');

        // Clear all tables before populating to avoid duplicate rows
        clearAllDynamicTables();

        // Populate basic inputs
        populateFields(data);

        // Rebuild dynamic tables
        if (data.family && data.family.children) {
          data.family.children.forEach(child => addTableRow('childrenTable', child));
        }
        if (data.family && data.family.close_circle) {
          data.family.close_circle.forEach(item => addTableRow('circleTable', item));
        }
        if (data.additional_income) {
          data.additional_income.forEach(income => addTableRow('additionalIncomeTable', income));
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

        // Check conditional visibility
        toggleConditionalFields();

        // Rebuild visitedSteps based on loaded content
        visitedSteps.clear();
        for (let s = 1; s <= TOTAL_STEPS; s++) {
          if (validateStep(s, true)) {
            visitedSteps.add(s);
          }
        }

        // Return user to Step 1
        goToStep(1);

        // Update dot styles
        validateAllStepsDots();

        // Save loaded state immediately to local storage
        saveDraft();

        showNotification('קובץ הנתונים נטען בהצלחה! כל השדות מולאו.', 'success');
      } catch (err) {
        console.error('Error uploading JSON:', err);
        showNotification('שגיאה בטעינת הקובץ. ודא כי זהו קובץ JSON תקין שהורד מהאתר.', 'error');
      }
      
      // Reset input to allow uploading same file again
      jsonFileInput.value = '';
    };
    reader.readAsText(file);
  });

  // Navigation: Back Button
  backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  });

  // Navigation: Next/Submit Button
  nextBtn.addEventListener('click', () => {
    // Mark current step as visited since we are leaving it
    visitedSteps.add(currentStep);

    // Run visual validation for current step
    validateStep(currentStep);
    
    // Update dots indicator states
    validateAllStepsDots();

    if (currentStep < TOTAL_STEPS) {
      // Go to next step anyway
      goToStep(currentStep + 1);
    } else {
      // Trying to submit from step 5!
      // Must validate ALL steps
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

      // Re-validate dots to apply changes, forcing validation on all
      validateAllStepsDots(true);

      if (allValid) {
        submitForm();
      } else {
        goToStep(firstInvalidStep);
        showNotification('לא ניתן לשלוח את השאלון עד שכל השלבים יושלמו ויהיו תקינים. הועברת לשלב שעדיין לא הושלם.', 'error');
      }
    }
  });

  // Click step dots to navigate freely
  stepDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetStep = parseInt(dot.getAttribute('data-step'));
      if (targetStep === currentStep) return;

      // Mark current step as visited since we are leaving it
      visitedSteps.add(currentStep);

      // Show errors visually on step we are leaving, if any
      validateStep(currentStep);
      
      // Update dots indicator states
      validateAllStepsDots();

      // Go to target step directly
      goToStep(targetStep);
    });
  });

  // Close success modal
  closeModalBtn.addEventListener('click', () => {
    successModal.classList.add('hidden');
  });

  // --- WIZARD FUNCTIONS ---

  function goToStep(stepNum) {
    // Hide current step
    document.getElementById(`step${currentStep}`).classList.remove('active');
    
    // Update step tracker
    currentStep = stepNum;
    
    // Show new step
    const nextStepEl = document.getElementById(`step${currentStep}`);
    nextStepEl.classList.add('active');
    
    // Scroll to top of form smoothly
    nextStepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Update progress indicator
    const percent = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    progressBar.style.width = `${percent}%`;
    progressContainer.setAttribute('data-current-step', currentStep);

    // Update Dots classes
    stepDots.forEach(dot => {
      const dotVal = parseInt(dot.getAttribute('data-step'));
      dot.classList.remove('active', 'completed');
      if (dotVal === currentStep) {
        dot.classList.add('active');
      } else if (dotVal < currentStep) {
        dot.classList.add('completed');
      }
    });

    // Update Buttons text and state
    backBtn.disabled = currentStep === 1;
    if (currentStep === TOTAL_STEPS) {
      nextBtn.innerHTML = `שלח שאלון <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      nextBtn.className = 'btn-nav btn-submit';
    } else {
      nextBtn.innerHTML = `הבא <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
      nextBtn.className = 'btn-nav btn-next';
    }
  }

  // Add a dynamic table row
  function addTableRow(tableName, initialData = null) {
    const tableBody = document.querySelector(`#${tableName} tbody`);
    if (!tableBody || !TABLE_TEMPLATES[tableName]) return;

    const row = document.createElement('tr');
    row.innerHTML = TABLE_TEMPLATES[tableName]();
    tableBody.appendChild(row);

    // If initialData is supplied, populate cells
    if (initialData) {
      Object.keys(initialData).forEach(key => {
        const input = row.querySelector(`.cell-${key}`);
        if (input) {
          if (input.type === 'checkbox') {
            input.checked = initialData[key];
          } else {
            input.value = initialData[key];
          }
        }
      });
    }

    // Bind real-time draft saving to the new cells
    row.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', saveDraft);
      input.addEventListener('change', saveDraft);
    });

    return row;
  }

  // --- DYNAMIC CONDITIONAL SHOW/HIDE ---
  
  function toggleConditionalFields() {
    // 1. Single Parent Questions
    const maritalStatus = maritalStatusSelect.value;
    const isSingleParent = maritalStatus === 'single_parent' || maritalStatus === 'divorced' || maritalStatus === 'widowed';
    condSingleParent.classList.toggle('hidden', !isSingleParent);

    // 2. Second Marriage Questions
    const previousMarriage = previousMarriageSelect.value;
    condSecondMarriage.classList.toggle('hidden', previousMarriage !== 'yes');

    // 3. Self Employed Questions
    const isSelfEmployed = p1SelfEmployedCheckbox.checked || p2SelfEmployedCheckbox.checked;
    condSelfEmployed.classList.toggle('hidden', !isSelfEmployed);

    // 4. Marriage Duration visibility (show only if married or cohabiting)
    const isMarriedOrCohab = maritalStatus === 'married' || maritalStatus === 'cohabiting';
    marriageDurationContainer.classList.toggle('hidden', !isMarriedOrCohab);

    // 5. Emergency Fund Amount visibility
    const hasEmergencyFund = hasEmergencyFundSelect.value;
    emergencyFundAmountContainer.classList.toggle('hidden', hasEmergencyFund !== 'yes');
  }

  // --- VALIDATION LOGIC ---

  function validateStep(stepNum, silent = false) {
    const stepEl = document.getElementById(`step${stepNum}`);
    let isValid = true;

    if (!silent) {
      // 1. Remove previous error states in this step
      stepEl.querySelectorAll('.form-group.has-error').forEach(group => {
        group.classList.remove('has-error');
        const errorMsg = group.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
      });
    }

    // 2. Validate standard inputs inside active step
    const inputs = stepEl.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      // Skip validation for inputs in hidden/conditional fields
      const closestFieldset = input.closest('.conditional-fieldset');
      if (closestFieldset && closestFieldset.classList.contains('hidden')) {
        return;
      }
      
      const formGroup = input.closest('.form-group');
      let fieldError = '';

      // Check required
      if (input.hasAttribute('required') && !input.value.trim()) {
        fieldError = 'שדה זה הוא חובה';
      }
      
      // Email check
      else if (input.type === 'email' && input.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          fieldError = 'כתובת דוא"ל אינה תקינה';
        }
      }
      
      // Phone check (Israel mobile/standard)
      else if (input.type === 'tel' && input.value.trim()) {
        const phoneRegex = /^05\d[-]?\d{7}$|^0[23489][-]?\d{7}$/;
        if (!phoneRegex.test(input.value.trim().replace(/\s/g, ''))) {
          fieldError = 'מספר טלפון לא תקין (דוגמה: 050-1234567)';
        }
      }
      
      // Positive number check
      else if (input.type === 'number' && input.value.trim()) {
        const val = parseFloat(input.value);
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

          // Bind input edit to clear error
          input.addEventListener('input', function clearErr() {
            formGroup.classList.remove('has-error');
            const err = formGroup.querySelector('.error-message');
            if (err) err.remove();
            input.removeEventListener('input', clearErr);
          });
        }
      }
    });

    // 3. Validate dynamic tables in the step (each row inputs are validated)
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

    return isValid;
  }

  // --- DRAFT / STORAGE HANDLERS ---

  function saveDraft() {
    try {
      const data = getFormDataJSON();
      localStorage.setItem('financial_questionnaire_draft', JSON.stringify(data));
      localStorage.setItem('financial_questionnaire_step', currentStep);
      localStorage.setItem('financial_questionnaire_visited_steps', JSON.stringify(Array.from(visitedSteps)));
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      draftStatusText.textContent = `נשמר אוטומטית כטיוטה ב- ${timeStr}`;
    } catch (e) {
      console.error('Error saving draft:', e);
      draftStatusText.textContent = 'שגיאה בשמירת טיוטה מקומית';
    }
  }

  function loadDraft() {
    try {
      const draftStr = localStorage.getItem('financial_questionnaire_draft');
      if (!draftStr) return;

      const data = JSON.parse(draftStr);
      if (!data) return;

      // Clear dynamic tables to prevent duplication on reload
      clearAllDynamicTables();

      // Populate basic inputs
      populateFields(data);

      // Rebuild dynamic tables
      if (data.family && data.family.children) {
        data.family.children.forEach(child => addTableRow('childrenTable', child));
      }
      if (data.family && data.family.close_circle) {
        data.family.close_circle.forEach(item => addTableRow('circleTable', item));
      }
      if (data.additional_income) {
        data.additional_income.forEach(income => addTableRow('additionalIncomeTable', income));
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

      // Restore visited steps
      const savedVisited = localStorage.getItem('financial_questionnaire_visited_steps');
      if (savedVisited) {
        const visitedArray = JSON.parse(savedVisited);
        visitedArray.forEach(s => visitedSteps.add(s));
      } else {
        // Add valid steps from the draft to visitedSteps so they show green
        for (let s = 1; s <= TOTAL_STEPS; s++) {
          if (validateStep(s, true)) {
            visitedSteps.add(s);
          }
        }
      }

      // Restore current step
      const savedStep = localStorage.getItem('financial_questionnaire_step');
      if (savedStep) {
        goToStep(parseInt(savedStep));
      }

      draftStatusText.textContent = 'טיוטה מקומית נטענה בהצלחה';
    } catch (e) {
      console.error('Error loading draft:', e);
    }
  }

  // Populate basic inputs from nested JSON
  function populateFields(data, prefix = '') {
    Object.keys(data).forEach(key => {
      const val = data[key];
      if (val === null || val === undefined) return;

      if (typeof val === 'object' && !Array.isArray(val)) {
        // Recurse into object
        populateFields(val, prefix ? `${prefix}[${key}]` : key);
      } else if (!Array.isArray(val)) {
        // Resolve form field name
        const fieldName = prefix ? `${prefix}[${key}]` : key;
        const input = form.querySelector(`[name="${fieldName}"]`);
        
        if (input) {
          if (input.type === 'checkbox') {
            input.checked = !!val;
          } else {
            input.value = val;
          }
        }
      }
    });
  }

  // --- FORM DATA SERIALIZATION ---

  function getFormDataJSON() {
    return {
      general: {
        fill_date: fillDateInput.value
      },
      partner1: {
        first_name: document.getElementById('p1_first_name').value,
        last_name: document.getElementById('p1_last_name').value,
        phone: document.getElementById('p1_phone').value,
        email: document.getElementById('p1_email').value,
        address: document.getElementById('p1_address').value,
        age: parseNumber(document.getElementById('p1_age').value),
        is_self_employed: p1SelfEmployedCheckbox.checked
      },
      partner2: {
        first_name: document.getElementById('p2_first_name').value,
        last_name: document.getElementById('p2_last_name').value,
        phone: document.getElementById('p2_phone').value,
        email: document.getElementById('p2_email').value,
        address: document.getElementById('p2_address').value,
        age: parseNumber(document.getElementById('p2_age').value),
        is_self_employed: p2SelfEmployedCheckbox.checked
      },
      family: {
        marital_status: maritalStatusSelect.value,
        marriage_duration: parseNumber(document.getElementById('marriage_duration').value),
        previous_marriage: previousMarriageSelect.value,
        notes: document.getElementById('family_notes').value,
        children: serializeTable('childrenTable', ['name', 'gender', 'age', 'notes']),
        close_circle: serializeTable('circleTable', ['close_to', 'relation', 'financial_status', 'can_help', 'needs_help', 'wealth_transfer', 'notes'])
      },
      income1: {
        job_title: document.getElementById('p1_job_title').value,
        employee_income: parseNumber(document.getElementById('p1_employee_income').value),
        bonuses: parseNumber(document.getElementById('p1_bonuses').value),
        self_employed_income: parseNumber(document.getElementById('p1_self_employed_income').value),
        previous_jobs: document.getElementById('p1_previous_jobs').value,
        notes: document.getElementById('p1_income_notes').value
      },
      income2: {
        job_title: document.getElementById('p2_job_title').value,
        employee_income: parseNumber(document.getElementById('p2_employee_income').value),
        bonuses: parseNumber(document.getElementById('p2_bonuses').value),
        self_employed_income: parseNumber(document.getElementById('p2_self_employed_income').value),
        previous_jobs: document.getElementById('p2_previous_jobs').value,
        notes: document.getElementById('p2_income_notes').value
      },
      additional_income: serializeTable('additionalIncomeTable', ['source', 'amount', 'notes']),
      expenses: {
        total_amount: parseNumber(document.getElementById('total_monthly_expenses').value),
        details: document.getElementById('expenses_details').value
      },
      assets: {
        real_estate: serializeTable('realEstateTable', ['description', 'purchase_val', 'current_val', 'mortgage_orig', 'mortgage_rem', 'notes']),
        mortgages: serializeTable('mortgageTable', ['bank', 'track', 'orig', 'remaining', 'rate', 'end_date', 'monthly', 'notes']),
        vehicles: serializeTable('vehiclesTable', ['model', 'year', 'value', 'notes']),
        future_assets_details: document.getElementById('future_assets_details').value,
        financial_assets: serializeTable('financialAssetsTable', ['type', 'company', 'amount', 'notes'])
      },
      bank: {
        name: document.getElementById('bank_name').value,
        owner: document.getElementById('bank_owner').value,
        limit: parseNumber(document.getElementById('bank_limit').value),
        usage: document.getElementById('bank_usage').value,
        restricted: document.getElementById('bank_restricted').value,
        credit_cards_details: document.getElementById('credit_cards_details').value
      },
      assets_management: {
        tracking: document.getElementById('asset_tracking').value,
        risk_vs_yield: document.getElementById('risk_appetite').value,
        fees_check: document.getElementById('management_fees').value
      },
      liabilities: serializeTable('liabilitiesTable', ['lender', 'purpose', 'orig', 'current', 'monthly', 'start', 'end', 'rate']),
      pension1: {
        company: document.getElementById('p1_pension_company').value,
        balance: parseNumber(document.getElementById('p1_pension_balance').value),
        monthly_deposit: parseNumber(document.getElementById('p1_pension_deposit').value),
        has_life_insurance: document.getElementById('p1_pension_has_life_insurance').value,
        annuity_coefficient: parseNumber(document.getElementById('p1_pension_coefficient').value),
        notes: document.getElementById('p1_pension_notes').value
      },
      pension2: {
        company: document.getElementById('p2_pension_company').value,
        balance: parseNumber(document.getElementById('p2_pension_balance').value),
        monthly_deposit: parseNumber(document.getElementById('p2_pension_deposit').value),
        has_life_insurance: document.getElementById('p2_pension_has_life_insurance').value,
        annuity_coefficient: parseNumber(document.getElementById('p2_pension_coefficient').value),
        notes: document.getElementById('p2_pension_notes').value
      },
      allowances: serializeTable('allowancesTable', ['source', 'amount', 'notes']),
      insurances: serializeTable('insurancesTable', ['type', 'insured', 'company', 'premium', 'agent', 'cov_type']),
      
      // Conditional parts (only gathered if visible)
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
        emergency_fund_amount: parseNumber(document.getElementById('emergency_fund_amount').value),
        capital_receipts: serializeTable('capitalReceiptsTable', ['source', 'amount', 'when', 'notes']),
        recurring_goals: serializeTable('recurringGoalsTable', ['description', 'freq', 'cost', 'notes']),
        one_time_goals: serializeTable('oneTimeGoalsTable', ['description', 'years', 'cost', 'notes']),
        children_goals: serializeTable('childrenGoalsTable', ['description', 'cost', 'age', 'notes']),
        expectations: document.getElementById('consultation_expectations').value
      }
    };
  }

  // Parse strings to float/int, default to null or 0 if empty
  function parseNumber(val) {
    if (val === '' || val === null || val === undefined) return 0;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Serializes dynamic table rows into an array of objects
  function serializeTable(tableId, fieldClasses) {
    const table = document.getElementById(tableId);
    if (!table) return [];

    const rows = table.querySelectorAll('tbody tr');
    const result = [];

    rows.forEach(row => {
      const obj = {};
      let hasVal = false;
      
      fieldClasses.forEach(field => {
        const input = row.querySelector(`.cell-${field}`);
        if (input) {
          let val = input.value;
          if (input.type === 'number') {
            val = parseNumber(val);
          } else if (input.type === 'checkbox') {
            val = input.checked;
          }
          obj[field] = val;
          if (val !== '' && val !== 0 && val !== false) {
            hasVal = true;
          }
        }
      });

      // Avoid adding completely blank rows
      if (hasVal) {
        result.push(obj);
      }
    });

    return result;
  }

  // --- SUBMIT AND LOCAL DOWNLOAD FLOW ---

  // --- SUBMIT AND LOCAL DOWNLOAD FLOW ---

  function submitForm() {
    const data = getFormDataJSON();
    
    // Get partner names for dynamic filename
    const p1Name = document.getElementById('p1_first_name') ? document.getElementById('p1_first_name').value.trim() : '';
    const p2Name = document.getElementById('p2_first_name') ? document.getElementById('p2_first_name').value.trim() : '';
    
    let filename = 'נתונים פיננסים';
    if (p1Name && p2Name) {
      filename += ` ${p1Name} ו${p2Name}`;
    } else if (p1Name) {
      filename += ` ${p1Name}`;
    } else if (p2Name) {
      filename += ` ${p2Name}`;
    }
    filename += '.json';

    // 1. Convert to string in UTF-8
    const jsonString = JSON.stringify(data, null, 2);

    // 2. Generate Blob and trigger auto browser download
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
    } catch (err) {
      console.error('Error generating automatic download:', err);
    }

    // 3. Clear local storage draft
    localStorage.removeItem('financial_questionnaire_draft');
    draftStatusText.textContent = 'השאלון הושלם והורד בהצלחה!';

    // 4. Update Success Modal content dynamically to present the WhatsApp/Email instructions
    const modalHeaderH2 = successModal.querySelector('.modal-header h2');
    const modalHeaderP = successModal.querySelector('.modal-header p');
    const modalBody = successModal.querySelector('.modal-body');
    
    if (modalHeaderH2) {
      modalHeaderH2.textContent = 'השאלון נשמר בהצלחה והורד למחשבכם!';
    }
    if (modalHeaderP) {
      modalHeaderP.innerHTML = `
        אנא שלחו כעת את הקובץ <strong>'${filename}'</strong> שירד אליכם ישירות לוואטסאפ של היועץ הפיננסי שלכם:<br><br>
        <div class="wa-buttons-container">
          <a href="https://wa.me/972584442400" target="_blank" class="btn-wa">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.023-5.101-2.884-6.963C16.59 1.96 14.118.937 11.487.937 6.05 1.937 1.628 6.042 1.626 11.486c-.001 1.683.447 3.323 1.3 4.773L1.935 21.8l5.712-1.498zm11.783-6.883c-.302-.15-.1.087-.69-.377-.12-.09-.242-.18-.363-.27-.24-.18-.46-.225-.66-.03-.2.195-.78.78-.96.975-.18.195-.36.225-.66.075-.3-.15-1.265-.465-2.41-1.485-.89-.795-1.49-1.785-1.665-2.085-.175-.3-.02-.465.13-.615.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.5-.589-.69-.597-.18-.008-.39-.01-.6-.01-.21 0-.555.08-.846.4-.29.32-1.11 1.08-1.11 2.63s1.13 3.05 1.285 3.26c.155.21 2.22 3.39 5.375 4.75.75.32 1.33.51 1.79.66.756.24 1.444.205 1.988.124.607-.09 1.847-.755 2.11-1.485.262-.73.262-1.355.184-1.485-.078-.13-.284-.21-.586-.36z"/></svg>
            שליחה לוואטסאפ: 058-4442400
          </a>
          <a href="https://wa.me/972503333164" target="_blank" class="btn-wa">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.023-5.101-2.884-6.963C16.59 1.96 14.118.937 11.487.937 6.05 1.937 1.628 6.042 1.626 11.486c-.001 1.683.447 3.323 1.3 4.773L1.935 21.8l5.712-1.498zm11.783-6.883c-.302-.15-.1.087-.69-.377-.12-.09-.242-.18-.363-.27-.24-.18-.46-.225-.66-.03-.2.195-.78.78-.96.975-.18.195-.36.225-.66.075-.3-.15-1.265-.465-2.41-1.485-.89-.795-1.49-1.785-1.665-2.085-.175-.3-.02-.465.13-.615.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.5-.589-.69-.597-.18-.008-.39-.01-.6-.01-.21 0-.555.08-.846.4-.29.32-1.11 1.08-1.11 2.63s1.13 3.05 1.285 3.26c.155.21 2.22 3.39 5.375 4.75.75.32 1.33.51 1.79.66.756.24 1.444.205 1.988.124.607-.09 1.847-.755 2.11-1.485.262-.73.262-1.355.184-1.485-.078-.13-.284-.21-.586-.36z"/></svg>
            שליחה לוואטסאפ: 050-3333164
          </a>
        </div>
        <br>
        או שלחו אותו כקובץ מצורף למייל של היועץ שלכם.
      `;
      modalHeaderP.style.fontSize = '1.1rem';
      modalHeaderP.style.color = 'var(--color-primary-dark)';
    }

    // 5. Hide the modal body (which contains the JSON preview)
    if (modalBody) {
      modalBody.classList.add('hidden');
    }

    // Set up download button in modal to allow manual re-download
    downloadJsonBtn.textContent = 'הורד שוב קובץ JSON';
    downloadJsonBtn.onclick = () => {
      const reBlob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const reUrl = URL.createObjectURL(reBlob);
      const reA = document.createElement('a');
      reA.href = reUrl;
      reA.download = filename;
      document.body.appendChild(reA);
      reA.click();
      document.body.removeChild(reA);
      URL.revokeObjectURL(reUrl);
    };

    // Show Success Modal
    successModal.classList.remove('hidden');
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

  // --- INITIAL LAUNCH ---
  
  // Try loading draft
  loadDraft();

  // If no child rows exist, add a default blank row to the children table
  const childRows = document.querySelectorAll('#childrenTable tbody tr');
  if (childRows.length === 0) {
    addTableRow('childrenTable');
  }

  // Check conditional visibility on load
  toggleConditionalFields();

  // Validate all steps to color indicators on start
  validateAllStepsDots();
});
