# שאלון ייעוץ פיננסי (financial-questions)

שאלון עברי בן 5 שלבים לאיסוף נתונים לקראת ייעוץ פיננסי. אתר סטטי (HTML/CSS/JS בלבד, ללא שרת וללא build),
שנשלח ל-webhook של n8n. אפשר לארח אותו בחינם ב-GitHub Pages.

## מבנה הקבצים

| קובץ | תפקיד |
|---|---|
| `index.html` | מבנה השאלון (5 השלבים, הטבלאות, חלונות ה-modal) |
| `app.js` | כל הלוגיקה: טבלאות דינמיות, חישובים, ולידציה, טיוטה, שליחה |
| `style.css` | עיצוב, כולל תצוגת כרטיסים לטלפון |
| `config.js` | **ההגדרות היחידות שצריך לערוך** (כתובת ה-webhook, יועצים, Turnstile ועוד) |
| `privacy.html` | מדיניות הפרטיות שהלקוח מאשר לפני השליחה |

## הגדרות (`config.js`)

- `WEBHOOK_URL` – לאן נשלח השאלון.
- `SCHEMA_VERSION` – מספר גרסה של מבנה ה-JSON. מעלים אותו בכל שינוי בשדות.
- `POLICY_VERSION` – גרסת מדיניות הפרטיות. מעלים אותו (ומעדכנים את התאריך ב-`privacy.html`) בכל שינוי במדיניות.
- `ADVISORS` – היועצים שמופיעים בכפתורי הוואטסאפ האופציונליים במסך ההצלחה.
- `TURNSTILE_SITE_KEY` – הגנה חינמית מפני רובוטים (ראו למטה). ריק = כבוי.
- `SUBMIT_COOLDOWN_SECONDS`, `DRAFT_MAX_AGE_DAYS`, `SUBMIT_TIMEOUT_MS`, `SUBMIT_ATTEMPTS`.

### קישור לפי יועץ / קמפיין
אפשר לשלוח ללקוח קישור כמו `https://.../?advisor=eitan&utm_source=whatsapp`.
הערכים נשמרים בשדה `meta.advisor` / `meta.source` ב-JSON.

## הגנה על ה-webhook (חינם)

הקוד באתר סטטי לעולם לא יכול להסתיר סוד, ולכן ההגנה האמיתית חייבת להיות גם ב-n8n:

1. **Honeypot** – שדה נסתר; בוטים ממלאים אותו. ב-JSON: אם הוא מלא האתר לא שולח כלום (הבוט רואה "הצלחה").
2. **Cloudflare Turnstile** (חינמי): יוצרים אתר ב-Cloudflare → Turnstile, מדביקים את ה-*Site Key* ב-`config.js`.
   הטוקן נשלח ב-`meta.turnstile_token`. ב-n8n מוסיפים צעד HTTP Request ל-
   `https://challenges.cloudflare.com/turnstile/v0/siteverify` עם ה-*Secret Key* (שנשמר רק ב-n8n) ודוחים בקשות לא תקינות.
3. **ב-n8n (לעשות בהמשך):** לדחות JSON שלא מתאים לסכמה / גדול מדי, להתעלם מ-`submission_id` שכבר התקבל (שליחה חוזרת),
   להגביל קצב לכל IP, ולהגדיר CORS רק לדומיין של האתר.

## מה נשלח (מבנה ה-JSON)

כל הנתונים הקיימים נשארו באותם שמות. נוסף/השתנה:

- `meta` – `submission_id`, `schema_version`, `submitted_at`, `started_at`, `fill_seconds`, `advisor`, `source`,
  `device`, `loaded_from_file`, `consent` (גרסת מדיניות + זמן אישור), `totals`, `quality_flags`, `turnstile_token`.
- `meta.totals` – הכנסה, הוצאות, תזרים פנוי, נכסים, התחייבויות, שווי נקי, החזרי משכנתא/הלוואות, סך פנסיה.
- `meta.quality_flags` – חריגות נתונים (למשל `remaining_exceeds_original`, `expenses_far_below_income`,
  `mortgage_payment_missing_in_expenses`). רק מסמנות; לא חוסמות את הלקוח.
- שדה ריק = `null` (ולא `0` / `""`), כך שאפשר להבדיל בין "אפס" ל"לא ענה".
- שדות "בחירה או כתיבה": `owner` מחזיר את הטקסט, ו-`owner_key` מחזיר את הבחירה (`p1`/`p2`/`joint`/ערך מהרשימה / `other` אם הלקוח כתב בעצמו).
- הוצאות: `category_id` יציב (למשל `mortgage`) + `category_group` (למשל `housing`); שורה שנוספה ע"י הלקוח = `custom`.
- משכנתאות: `property_id` מצביע על `assets.real_estate[].id`.
- ביטוחים: `premium` ו-`sum_insured` הם שני מספרים נפרדים.
- `partner2` ו-`income2` הם `null` כשהלקוח מילא "אדם יחיד" (`general.household_type = "single"`).

## התנהגות שליחה

- הלקוח רואה "נשלח בהצלחה" **רק** אם השרת החזיר 2xx. אחרת: עד 3 ניסיונות אוטומטיים, ואז חלון שגיאה עם
  "נסו שוב", הורדת קובץ גיבוי ופנייה בוואטסאפ. הטיוטה לא נמחקת.
- אותו `submission_id` נשלח בכל הניסיונות של אותו שאלון.
- הטיוטה נשמרת בדפדפן בלבד ונמחקת אוטומטית אחרי `DRAFT_MAX_AGE_DAYS` ימים.

## הרצה מקומית

```bash
cd financial-questions
npx serve .        # או כל שרת סטטי אחר
```

(פתיחה ישירה של `index.html` עובדת גם היא, אבל חלק מהדפדפנים חוסמים שם `fetch`.)
