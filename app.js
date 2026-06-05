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
      <td><select class="cell-close-to"><option value="בן זוג 1">בן זוג 1</option><option value="בן זוג 2">בן זוג 2</option><option value="משותף">משותף</option></select></td>
      <td><textarea class="cell-relation" rows="1" placeholder="למשל: אב, סבתא" required></textarea></td>
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
      <td><textarea class="cell-source" rows="1" placeholder="למשל: קצבת ילדים, שכירות" required></textarea></td>
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
      <td><textarea class="cell-bank" rows="1" placeholder="בנק מלווה" required></textarea></td>
      <td><textarea class="cell-track" rows="1" placeholder="פריים, קל&quot;צ, משתנה" required></textarea></td>
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
      <td><textarea class="cell-lender" rows="1" placeholder="הבנק / הגורם המלווה" required></textarea></td>
      <td><textarea class="cell-purpose" rows="1" placeholder="מטרת ההלוואה" required></textarea></td>
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
      <td><textarea class="cell-recipient" rows="1" placeholder="למשל: בן זוג 1" required></textarea></td>
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
      <td><textarea class="cell-insured" rows="1" placeholder="למשל: כולם, בת זוג 2" required></textarea></td>
      <td><textarea class="cell-company" rows="1" placeholder="חברת ביטוח" required></textarea></td>
      <td><textarea class="cell-premium" rows="1" placeholder="עלות / כיסוי" required></textarea></td>
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
      <td><textarea class="cell-source" rows="1" placeholder="למשל: השתלמות, ירושה" required></textarea></td>
      <td><input type="number" class="cell-amount" min="0" placeholder="0" required></td>
      <td><textarea class="cell-when" rows="1" placeholder="למשל: 2028, עוד שנתיים" required></textarea></td>
      <td><textarea class="cell-notes" rows="1" placeholder="שימוש מתוכנן"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    recurringGoalsTable: () => `
      <td><textarea class="cell-description" rows="1" placeholder="שדרוג רכב, חופשה שנתית" required></textarea></td>
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
      <td><textarea class="cell-description" rows="1" placeholder="קניית דירה, עסק, לימודים" required></textarea></td>
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
      <td><textarea class="cell-owner" rows="1" placeholder="למשל: משותף / בן זוג 1" required></textarea></td>
      <td><input type="number" class="cell-limit" min="0" placeholder="0"></td>
      <td><textarea class="cell-usage" rows="1" placeholder="למשל: עו&quot;ש משפחתי ראשי"></textarea></td>
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
      <td><textarea class="cell-owner" rows="1" placeholder="משותף / בן זוג 1 / 2" required></textarea></td>
      <td><textarea class="cell-name" rows="1" placeholder="למשל: ויזה כאל" required></textarea></td>
      <td><input type="text" class="cell-digits" placeholder="1234" maxlength="4" pattern="\\d{4}"></td>
      <td><input type="number" class="cell-limit" min="0" placeholder="0"></td>
      <td><textarea class="cell-usage" rows="1" placeholder="למשל: קניות סופר/דלק"></textarea></td>
      <td><textarea class="cell-notes" rows="1" placeholder="פירוט עסקאות, תשלומים וכו'"></textarea></td>
      <td class="col-actions">
        <button type="button" class="btn-delete remove-row-btn" title="הסר שורה">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `,
    pensionsTable: () => `
      <td>
        <select class="cell-owner">
          <option value="בן זוג 1">בן זוג 1</option>
          <option value="בן זוג 2">בן זוג 2</option>
        </select>
      </td>
      <td><textarea class="cell-company" rows="1" placeholder="למשל: אלטשולר שחם / מגדל" required></textarea></td>
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
      <td><input type="number" class="cell-average input-readonly" readonly placeholder="0"></td>
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
    'משכתנתא', 'הלוואות', 'ביטוח בריאות משלים', 'ביטוח בריאות פרטי', 'ביטוח חיים', 'ביטוח דירה',
    'הקצאה להוצאות בלת"מ', 'חיסכון', 'מזון ומכולת', 'ביגוד והנעלה', 'חשמל', 'גז',
    'ארנונה ומים', 'מטפלת/שמרטף/מעון/גן', 'ביה"ס וחומרי לימוד', 'חוגים', 'דמי כיס',
    'טלפון קווי', 'טלפון סלולרי', 'אינטרנט', 'שכ"ד', 'וועד בית', 'עוזרת',
    'אחזקת בית ותיקונים', 'תחבורה ציבורית', 'דלק', 'אחזקת רכב ותיקונים', 'ביטוח (חובה ומקיף)',
    'טסט', 'עמלות וריבית', 'מספרה', 'קוסמטיקה', 'כבלים', 'מנויים', 'עיתונים',
    'נסיעות לחו"ל וחופשות', 'קאנטרי קלאב', 'מסעדות סרטים והצגות', 'מתנות (משפחה, אירועים)',
    'מזונות', 'תמיכה בבני המשפחה', 'הוצאות ריפוי', 'סיגריות', 'מזומן ללא מעקב'
  ];

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
      const category = item.category;
      const existingRow = rowMap[category];
      if (existingRow) {
        Object.keys(item).forEach(key => {
          if (key === 'category') return;
          const input = existingRow.querySelector(`.cell-${key}`);
          if (input) {
            if (input.type === 'checkbox') {
              input.checked = item[key];
            } else {
              input.value = item[key];
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
        saveDraft();
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

      const m1 = parseFloat(m1Val);
      const m2 = parseFloat(m2Val);
      const m3 = parseFloat(m3Val);

      let sum = 0;
      let count = 0;

      if (m1Val !== undefined && m1Val !== '' && !isNaN(m1)) { sum += m1; count++; }
      if (m2Val !== undefined && m2Val !== '' && !isNaN(m2)) { sum += m2; count++; }
      if (m3Val !== undefined && m3Val !== '' && !isNaN(m3)) { sum += m3; count++; }

      const avg = count > 0 ? sum / count : 0;

      const avgInput = row.querySelector('.cell-average');
      if (avgInput) {
        avgInput.value = count > 0 ? Math.round(avg) : '';
      }
      total += avg;
    });
    const totalSpan = document.getElementById('computedTotalExpenses');
    if (totalSpan) {
      totalSpan.textContent = Math.round(total).toLocaleString('he-IL');
    }
  }

  form.addEventListener('input', () => {
    saveDraft();
    validateAllStepsDots();
    updateComputedExpensesTotal();
  });
  form.addEventListener('change', () => {
    saveDraft();
    toggleConditionalFields();
    validateAllStepsDots();
  });

  clearDraftBtn.addEventListener('click', () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים ולהתחיל מחדש?')) {
      localStorage.removeItem('financial_questionnaire_draft');
      localStorage.removeItem('financial_questionnaire_step');
      localStorage.removeItem('financial_questionnaire_visited_steps');
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
  }

  function addTableRow(tableName, initialData = null) {
    const tableBody = document.querySelector(`#${tableName} tbody`);
    if (!tableBody || !TABLE_TEMPLATES[tableName]) return;

    const row = document.createElement('tr');
    row.innerHTML = TABLE_TEMPLATES[tableName]();
    tableBody.appendChild(row);

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
      stepEl.querySelectorAll('.form-group.has-error').forEach(group => {
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
      
      const formGroup = input.closest('.form-group');
      let fieldError = '';

      if (input.hasAttribute('required') && !input.value.trim()) {
        fieldError = 'שדה זה הוא חובה';
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

    return isValid;
  }

  function saveDraft() {
    try {
      updateComputedExpensesTotal();
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
          }
        }
      }
    });
  }

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
        employment_type: p1EmploymentTypeSelect.value
      },
      partner2: {
        first_name: document.getElementById('p2_first_name').value,
        last_name: document.getElementById('p2_last_name').value,
        phone: document.getElementById('p2_phone').value,
        email: document.getElementById('p2_email').value,
        address: document.getElementById('p2_address').value,
        age: parseNumber(document.getElementById('p2_age').value),
        employment_type: p2EmploymentTypeSelect.value
      },
      family: {
        marital_status: maritalStatusSelect.value,
        marriage_duration: parseNumber(document.getElementById('marriage_duration').value),
        previous_marriage: previousMarriageSelect.value,
        notes: document.getElementById('family_notes').value,
        children: serializeTable('childrenTable', ['name', 'gender', 'age', 'notes', 'general_notes']),
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
      expenses: serializeTable('expensesTable', ['category', 'month1', 'month2', 'month3', 'average', 'notes']),
      assets: {
        real_estate: serializeTable('realEstateTable', ['description', 'purchase_val', 'current_val', 'mortgage_orig', 'mortgage_rem', 'notes']),
        mortgages: serializeTable('mortgageTable', ['bank', 'track', 'orig', 'remaining', 'rate', 'end_date', 'monthly', 'notes']),
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
      insurances: serializeTable('insurancesTable', ['type', 'insured', 'company', 'premium', 'agent', 'cov_type']),
      
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
        emergency_fund_amount: parseNumber(document.getElementById('emergency_fund_amount').value),
        emergency_fund_location: document.getElementById('emergency_fund_location') ? document.getElementById('emergency_fund_location').value : '',
        capital_receipts: serializeTable('capitalReceiptsTable', ['source', 'amount', 'when', 'notes']),
        recurring_goals: serializeTable('recurringGoalsTable', ['description', 'freq', 'cost', 'notes']),
        one_time_goals: serializeTable('oneTimeGoalsTable', ['description', 'years', 'cost', 'notes']),
        children_goals: serializeTable('childrenGoalsTable', ['description', 'cost', 'age', 'notes']),
        expectations: document.getElementById('consultation_expectations').value
      }
    };
  }

  function parseNumber(val) {
    if (val === '' || val === null || val === undefined) return 0;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
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
        const input = row.querySelector(`.cell-${field}`);
        if (input) {
          let val = input.value;
          if (input.type === 'number') {
            val = input.value === '' ? '' : parseNumber(val);
          } else if (input.type === 'checkbox') {
            val = input.checked;
          }
          obj[field] = val;
          if (val !== '' && val !== false) {
            hasVal = true;
          }
        }
      });

      if (hasVal) {
        result.push(obj);
      }
    });

    return result;
  }

  function submitForm() {
    const data = getFormDataJSON();
    
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
    } catch (err) {
      console.error('Error generating automatic download:', err);
    }

    localStorage.removeItem('financial_questionnaire_draft');
    draftStatusText.textContent = 'השאלון הושלם והורד בהצלחה!';

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

    if (modalBody) {
      modalBody.classList.add('hidden');
    }

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

  // Validate all steps to color indicators on start
  validateAllStepsDots();

  // Perform initial resize of all textareas to fit loaded values
  setTimeout(() => {
    if (window.resizeAllTextareas) window.resizeAllTextareas();
  }, 100);
});
