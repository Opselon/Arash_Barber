import { Hono } from 'hono';

interface Env {
  Bindings: {
    DB: D1Database;
  };
}

interface Page {
  title: string;
  description: string;
  body: string;
}

const navItems: { path: string; label: string }[] = [
  { path: '/', label: 'خانه' },
  { path: '/services', label: 'خدمات' },
  { path: '/story', label: 'داستان ما' },
  { path: '/gallery', label: 'گالری' },
  { path: '/pricing', label: 'تعرفه‌ ها' },
  { path: '/reserve', label: 'رزرو آنلاین' },
  { path: '/testimonials', label: 'نظرات' },
  { path: '/contact', label: 'ارتباط' },
];

const SLOT_MINUTES = 30;
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 22;

const buildSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_MINUTES) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
};

const slotsForDate = (date: string, reservedTimes: string[]) => {
  const baseSlots = buildSlots();
  return baseSlots.map((time) => ({
    time,
    status: reservedTimes.includes(time) ? 'reserved' : 'free',
  }));
};

const baseStyles = `
  :root {
    --bg: #05070c;
    --card: #0c111b;
    --accent: #fdbb2d;
    --accent-2: #22e1ff;
    --text: #f8fafc;
    --muted: #cbd5e1;
    --border: rgba(255,255,255,0.08);
    --shadow: 0 30px 90px rgba(0,0,0,0.6);
    font-family: 'Vazirmatn', 'Inter', system-ui, -apple-system, sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background:
      radial-gradient(circle at 10% 8%, rgba(34,225,255,0.14), transparent 32%),
      radial-gradient(circle at 84% 12%, rgba(253,187,45,0.12), transparent 30%),
      radial-gradient(circle at 40% 78%, rgba(255,255,255,0.05), transparent 28%),
      linear-gradient(145deg, #05070c, #0a0f1a 55%, #05070c);
    color: var(--text);
    line-height: 1.75;
    min-height: 100vh;
    direction: rtl;
  }
  a { color: inherit; text-decoration: none; }
  header {
    position: sticky;
    top: 0;
    z-index: 20;
    backdrop-filter: blur(14px);
    background: rgba(5,7,12,0.88);
    border-bottom: 1px solid var(--border);
  }
  nav {
    max-width: 1200px;
    margin: 0 auto;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: space-between;
  }
  .brand {
    font-weight: 800;
    letter-spacing: 0.03em;
    display: flex;
    align-items: center;
    gap: 10px;
    text-shadow: 0 10px 30px rgba(0,0,0,0.45);
  }
  .brand span {
    display: inline-block;
    background: linear-gradient(120deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .nav-links {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 6px;
  }
  .nav-links a {
    padding: 9px 14px;
    border-radius: 12px;
    border: 1px solid transparent;
    color: var(--muted);
    font-weight: 700;
    white-space: nowrap;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease, background 0.2s ease;
  }
  .nav-links a.active {
    border-color: var(--border);
    color: var(--text);
    background: linear-gradient(140deg, rgba(253,187,45,0.2), rgba(34,225,255,0.16));
    transform: translateZ(0) perspective(800px) rotateX(5deg);
    box-shadow: 0 12px 28px rgba(0,0,0,0.35);
  }
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 22px 18px 60px;
  }
  .grid {
    display: grid;
    gap: 16px;
  }
  .grid.two { grid-template-columns: 1fr; }
  .card {
    background:
      radial-gradient(circle at 25% 20%, rgba(34,225,255,0.1), transparent 45%),
      radial-gradient(circle at 78% 15%, rgba(253,187,45,0.1), transparent 48%),
      linear-gradient(160deg, rgba(12,17,27,0.9), rgba(12,17,27,0.75));
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 18px;
    box-shadow: var(--shadow);
    position: relative;
    overflow: hidden;
    transform-style: preserve-3d;
  }
  .card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0));
    opacity: 0.55;
    transform: translateZ(30px);
    pointer-events: none;
  }
  .hero {
    background:
      radial-gradient(circle at 12% 16%, rgba(34,225,255,0.18), rgba(34,225,255,0.05)),
      radial-gradient(circle at 86% 0%, rgba(253,187,45,0.2), rgba(253,187,45,0.05)),
      linear-gradient(145deg, rgba(12,16,25,0.95), rgba(12,16,25,0.78));
    border: 1px solid var(--border);
    padding: 30px 26px;
    border-radius: 22px;
    box-shadow: var(--shadow);
  }
  .hero h1 { font-size: 2.1rem; margin: 0 0 10px; }
  .hero p { margin: 0 0 12px; color: var(--muted); }
  .badges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
  .badge { padding: 9px 13px; border-radius: 12px; background: rgba(255,255,255,0.08); font-weight: 800; }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 12px;
    font-weight: 800;
    border: 1px solid var(--border);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .btn.primary { background: linear-gradient(120deg, var(--accent), var(--accent-2)); color: #04060a; border: none; }
  .btn.secondary { background: rgba(255,255,255,0.08); color: var(--text); }
  .btn:hover { transform: translateY(-1px) translateZ(0) scale(1.01); box-shadow: 0 10px 25px rgba(0,0,0,0.25); }
  h2 { margin: 0 0 10px; font-size: 1.45rem; }
  h3 { margin: 0 0 6px; }
  p.lead { color: var(--muted); margin-top: 0; }
  ul { padding-right: 18px; color: var(--muted); }
  .pill { display: inline-block; padding: 6px 10px; border-radius: 999px; background: rgba(255,255,255,0.08); color: var(--muted); font-weight: 800; font-size: 0.9rem; }
  .section-header { display:flex; align-items:center; gap:10px; margin: 24px 0 12px; }
  .chip { padding: 6px 10px; border-radius: 999px; background: linear-gradient(120deg, rgba(253,187,45,0.16), rgba(34,225,255,0.16)); font-weight: 800; color: var(--text); }
  .stack { display: flex; flex-direction: column; gap: 10px; }
  form { display: grid; gap: 12px; }
  label { font-weight: 800; }
  input, textarea, select {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.03);
    color: var(--text);
    font-size: 1rem;
  }
  textarea { min-height: 120px; resize: vertical; }
  .status { font-weight: 800; }
  .slot-legend { display:flex; justify-content: space-between; align-items:center; gap: 10px; color: var(--muted); }
  .slots-wrapper { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .slot-card {
    border-radius: 14px;
    padding: 12px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.2s ease, border 0.2s ease;
  }
  .slot-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.25); }
  .slot-card.free { border-color: rgba(34,225,255,0.4); background: linear-gradient(145deg, rgba(34,225,255,0.14), rgba(255,255,255,0.03)); }
  .slot-card.reserved { opacity: 0.6; cursor: not-allowed; background: linear-gradient(145deg, rgba(253,187,45,0.12), rgba(255,255,255,0.02)); }
  .slot-card.selected { border-color: var(--accent); box-shadow: 0 8px 22px rgba(253,187,45,0.35); }
  .slot-meta { margin: 0; color: var(--muted); }
  footer { margin: 40px auto; max-width: 1200px; padding: 0 18px 40px; color: var(--muted); }
  @media (min-width: 780px) {
    .grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .hero { padding: 34px; }
    .hero h1 { font-size: 2.6rem; }
    body { line-height: 1.85; }
  }
`;

const sharedFooter = `
  <footer>
    <div style="border-top:1px solid var(--border); padding-top:14px; display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between; align-items:center;">
      <div>کات و دیزاین مدرن کاریزما · ارومیه · ۹ تا ۲۲</div>
      <div style="display:flex; gap:10px; align-items:center;">
        <a href="tel:+989300802857" class="btn secondary" style="padding:10px 14px;">تماس +۹۸ ۹۳۰ ۰۸۰ ۲۸۵۷</a>
        <a href="mailto:arashnabizadeh72@gmail.com" class="btn secondary" style="padding:10px 14px;">ایمیل</a>
      </div>
    </div>
  </footer>
`;

const structuredData = `
  {
    "@context": "https://schema.org",
    "@type": "Barbershop",
    "name": "Karizma Haircut",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Urmia",
      "addressCountry": "IR"
    },
    "image": "https://www.instagram.com/karizma_haircut/",
    "telephone": "+98-930-080-2857",
    "url": "https://karizmahaircut.example",
    "priceRange": "$$",
    "description": "سالن آرایش و اصلاح مردانه کاریزما در ارومیه با فید، استایل و دیزاین ریش",
    "geo": { "@type": "GeoCoordinates", "latitude": 37.55, "longitude": 45.07 }
  }
`;

const layout = (title: string, description: string, body: string, path: string): string => {
  const canonical = `https://karizmahaircut.example${path}`;
  const navLinks = navItems
    .map((item) => `<a href="${item.path}" class="${item.path === path ? 'active' : ''}">${item.label}</a>`)
    .join('');

  return `<!DOCTYPE html>
  <html lang="fa">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="ارومیه، آرایشگاه مردانه، فید، استایل ریش، کاریزما، رزرو آنلاین، خدمات اصلاح" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800&display=swap" />
    <style>${baseStyles}</style>
    <script type="application/ld+json">${structuredData}</script>
  </head>
  <body>
    <header>
      <nav>
        <div class="brand">✂️ <span>کاریزما هیرکات</span> · ارومیه</div>
        <div class="nav-links">${navLinks}</div>
      </nav>
    </header>
    <main>
      ${body}
    </main>
    ${sharedFooter}
  </body>
  </html>`;
};

const homeContent = `
  <section class="hero">
    <div class="pill">موبایل‌فرست · رندر آنی از کلودفلر · طراحی سه‌بعدی سبک</div>
    <h1>کات و فید مدرن در ارومیه با تجربه ۳۶۰ درجه</h1>
    <p>آرش نبی‌زاده با دقت بالا، فید پوست، دیزاین ریش و جزئیات ظریف صورت را شخصی‌سازی می‌کند. وبسایت و رزرو کاملاً فارسی و بهینه برای لمس انگشت شست.</p>
    <p>انیمیشن سه‌بعدی نرم، نورپردازی گرادیانی و فونت فارسی خوانا تا تجربه صندلی قبل از ورود شکل بگیرد.</p>
    <div class="badges">
      <div class="badge">فید صفر و اسکین</div>
      <div class="badge">دیزاین ریش و خط ریش</div>
      <div class="badge">بهداشت و ضدعفونی</div>
      <div class="badge">قهوه و فضای آرام</div>
    </div>
    <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap;">
      <a class="btn primary" href="/reserve">رزرو سریع</a>
      <a class="btn secondary" href="/reserve#slots">مشاهده زمان‌های آزاد</a>
    </div>
    <div class="stack" style="margin-top:14px;">
      <div class="chip">UI تیره و براق با عناصر شیشه‌ای</div>
      <div class="chip">سئوی محلی ارومیه و اسکیما باربر</div>
      <div class="chip">پرفورمنس: فونت و استایل کم‌حجم برای TTFB سریع</div>
    </div>
  </section>
  <div class="grid two" style="margin-top:18px;">
    <div class="card">
      <h2>سریع، یکپارچه و واکنش‌گرا</h2>
      <p class="lead">هوک‌های سه‌بعدی سبک، فاصله‌گذاری موبایل‌محور و ناوبری چسبنده برای دسترسی در حرکت.</p>
      <ul>
        <li>CTAهای درشت برای انگشت شست</li>
        <li>گرادیان‌های براق با سایه نرم</li>
        <li>متا، OG و اسکیما برای سئو محلی</li>
      </ul>
    </div>
    <div class="card">
      <h2>مدیریت هوشمند زمان‌های آزاد</h2>
      <p class="lead">گرید زمان آزاد/رزرو شده، جلوگیری از دوباره‌رزروی و انتخاب مستقیم روی کارت‌ها برای مدیریت آسان.</p>
      <ul>
        <li>POST /api/reservations برای ثبت</li>
        <li>GET /api/slots برای واکشی لحظه‌ای</li>
        <li>تطبیق با واتساپ و داشبورد آینده</li>
      </ul>
    </div>
  </div>
  <div class="grid two" style="margin-top:12px;">
    <div class="card">
      <h2>محیط و جزئیات کاریزما</h2>
      <p class="lead">نورپردازی نرم، موسیقی ملایم و ضدعفونی دقیق ابزارها تا حس لوکس و آرام منتقل شود.</p>
      <ul>
        <li>مشاوره فرم صورت و حالت مو</li>
        <li>پیشنهاد نگهدارنده مناسب هوای ارومیه</li>
        <li>چک‌لیست تمیزی قبل از هر نوبت</li>
      </ul>
    </div>
    <div class="card">
      <h2>ویژگی‌های نسخه دسکتاپ</h2>
      <p class="lead">لایه‌بندی هوایی با کارت‌های گسترده، تایپوگرافی شارپ و بافت شیشه‌ای برای مانیتورهای بزرگ.</p>
      <ul>
        <li>بخش‌های دو ستونه با خوانایی بالا</li>
        <li>CTAهای همیشگی بالا و پایین صفحه</li>
        <li>گالری آماده برای نمونۀ کار و بروز رسانی</li>
      </ul>
    </div>
  </div>
`;

const servicesContent = `
  <div class="card">
    <h2>خدمات ویژه کاریزما</h2>
    <p class="lead">هر کات با مشاوره فرم صورت، خط‌گیری دقیق، حوله داغ و راهنمای محصول تمام می‌شود.</p>
    <ul>
      <li>فید صفر، شادو فید، کراپ مدرن، کویف و کانتور رسمی</li>
      <li>دیزاین ریش با تیغ، هیدراته و خط فک شارپ</li>
      <li>کنترل تکسچر: مَت، براق یا دیفاین موج</li>
      <li>استایل رویداد برای عکس، عروسی و استیج</li>
      <li>کات دقیق کودکان با ریتم آرام</li>
    </ul>
  </div>
  <div class="grid two">
    <div class="card">
      <h3>سازگار با آب‌وهوای ارومیه</h3>
      <p class="lead">انتخاب محصول بر اساس رطوبت و بافت مو تا استایل تمام روز ثابت بماند.</p>
    </div>
    <div class="card">
      <h3>بهداشت و ایمنی</h3>
      <p class="lead">ابزار استریل، تیغ یکبار مصرف و دستکش برای هر مشتری.</p>
    </div>
  </div>
`;

const storyContent = `
  <div class="card">
    <h2>داستان ما</h2>
    <p class="lead">کاریزما هیرکات با مدیریت آرش نبی‌زاده از تلفیق هنر کلاسیک و جزئیات فشن روز شکل گرفته است. استودیو برای سکوت و تمرکز طراحی شده تا هر برش دقیق باشد.</p>
    <p>هر قرار گفتگو درباره سبک زندگی، بافت مو و اعتماد به نفس است. نتیجه کار به گونه‌ای است که در عکس و نورهای مختلف هم شارپ و تمیز دیده می‌شود.</p>
    <p>همراهی با مشتری بعد از کات ادامه دارد؛ آموزش نگهداری، معرفی محصول و پیشنهاد فرم ریش برای هفته‌های بعد.</p>
  </div>
  <div class="grid two">
    <div class="card">
      <h3>حس و حال استودیو</h3>
      <p class="lead">موسیقی انتخاب‌شده، خطوط مینیمال و اسپرسو تازه؛ نوبت‌ها طوری چیده شده‌اند که ازدحام نباشد.</p>
    </div>
    <div class="card">
      <h3>موقعیت</h3>
      <p class="lead">در ارومیه با دسترسی راحت. هنگام رزرو، لوکیشن را بفرستید تا دقیق راهنمایی شویم.</p>
    </div>
  </div>
`;

const galleryContent = `
  <div class="card">
    <h2>گالری استایل</h2>
    <p class="lead">نگاهی کوتاه به فیدها، خط ریش و فرم‌های تمیز که مشتریان دوست دارند. برای نمونه بیشتر، اینستاگرام @karizma_haircut.</p>
    <div class="grid two">
      <div class="card" style="background-image: linear-gradient(135deg, rgba(0,213,187,0.18), rgba(249,178,51,0.12));">
        <h3>فید پوست + ریش</h3>
        <p class="lead">مرز نرم و خط‌های تیغ دقیق.</p>
      </div>
      <div class="card" style="background-image: linear-gradient(135deg, rgba(249,178,51,0.14), rgba(0,213,187,0.1));">
        <h3>کراپ تکسچر</h3>
        <p class="lead">فرینج کنترل‌شده با فینیش مَت.</p>
      </div>
      <div class="card" style="background-image: linear-gradient(135deg, rgba(0,213,187,0.14), rgba(255,255,255,0.04));">
        <h3>جنتلمن کلاسیک</h3>
        <p class="lead">ساید پارت با تیپر مرتب برای مراسم.</p>
      </div>
      <div class="card" style="background-image: linear-gradient(135deg, rgba(249,178,51,0.18), rgba(255,255,255,0.05));">
        <h3>خط ریش شارپ</h3>
        <p class="lead">آماده برای عکس و نورهای قوی.</p>
      </div>
    </div>
  </div>
`;

const pricingContent = `
  <div class="card">
    <h2>تعرفه شفاف</h2>
    <p class="lead">هر سرویس شامل مشاوره، پیشنهاد محصول و آموزش استایل سریع است. زمان کافی برای دقت بیشتر در نظر گرفته می‌شود.</p>
    <div class="grid two">
      <div class="card">
        <h3>کات و استایل</h3>
        <p class="lead">از ۱,۱۰۰,۰۰۰ ریال · ۴۵ دقیقه</p>
      </div>
      <div class="card">
        <h3>فید + ریش</h3>
        <p class="lead">از ۱,۴۰۰,۰۰۰ ریال · ۶۰ دقیقه</p>
      </div>
      <div class="card">
        <h3>دیزاین ریش</h3>
        <p class="lead">از ۷۰۰,۰۰۰ ریال · ۲۵ دقیقه</p>
      </div>
      <div class="card">
        <h3>استایل رویداد</h3>
        <p class="lead">قیمت سفارشی برای عروسی، عکس و مدیا</p>
      </div>
    </div>
  </div>
`;

const reserveContent = `
  <div class="card">
    <h2>رزرو آنلاین</h2>
    <p class="lead">گام‌به‌گام و موبایل‌فرست: روز و ساعت خالی را ببینید، رزرو کنید و پیام تأیید واتساپ بگیرید. مدیریت نوبت و جلوگیری از تداخل زمان برای کسب‌وکار ساده‌تر شده است.</p>
    <div class="pill">نمایش زمان‌های آزاد و رزرو شده · انتخاب مستقیم روی کارت‌ها</div>
    <form id="reserve-form">
      <div>
        <label for="name">نام و نام خانوادگی</label>
        <input id="name" name="name" placeholder="مثال: آرمان رضایی" required />
      </div>
      <div>
        <label for="phone">شماره تماس / واتساپ</label>
        <input id="phone" name="phone" placeholder="۰۹۳۰ ۰۸۰ ۲۸۵۷" required />
      </div>
      <div class="grid two">
        <div>
          <label for="day">تاریخ</label>
          <input id="day" name="day" type="date" required />
        </div>
        <div>
          <label for="time">ساعت</label>
          <select id="time" name="time" required>
            <option value="">در حال بارگذاری...</option>
          </select>
        </div>
      </div>
      <div>
        <label for="service">نوع سرویس</label>
        <select id="service" name="service" required>
          <option value="">انتخاب سرویس</option>
          <option value="Fade">فید</option>
          <option value="Fade + Beard">فید + ریش</option>
          <option value="Beard Design">دیزاین ریش</option>
          <option value="Kids Cut">کات کودک</option>
          <option value="Event Styling">استایل رویداد</option>
        </select>
      </div>
      <div>
        <label for="note">توضیحات (اختیاری)</label>
        <textarea id="note" name="note" placeholder="ایده استایل، دسترسی، یا لینک اینستاگرام"></textarea>
      </div>
      <div class="slot-legend" id="slots">
        <strong>زمان‌بندی امروز</strong>
        <span id="slot-legend" class="lead" style="color: var(--muted);"></span>
      </div>
      <div id="slot-grid" class="slots-wrapper"></div>
      <button type="submit" class="btn primary" style="justify-content:center;">ارسال رزرو</button>
      <div id="reserve-status" class="status"></div>
    </form>
  </div>
  <script>
    const form = document.querySelector('#reserve-form');
    const status = document.querySelector('#reserve-status');
    const dayInput = document.querySelector('#day');
    const timeSelect = document.querySelector('#time');
    const slotGrid = document.querySelector('#slot-grid');
    const slotLegend = document.querySelector('#slot-legend');

    const today = new Date().toISOString().split('T')[0];
    if (dayInput) dayInput.value = today;

    const syncSelectedCard = () => {
      if (!slotGrid || !timeSelect) return;
      const selectedTime = timeSelect.value;
      slotGrid.querySelectorAll('.slot-card').forEach((card) => {
        const cardTime = card.getAttribute('data-time');
        card.classList.toggle('selected', cardTime === selectedTime);
      });
    };

    const renderSlots = (slots = []) => {
      if (!slotGrid || !slotLegend) return;
      slotGrid.innerHTML = '';
      const freeCount = slots.filter((s) => s.status === 'free').length;
      slotLegend.textContent = freeCount
        ? `آزاد: ${freeCount} · رزرو: ${slots.length - freeCount}`
        : 'همه نوبت‌های امروز رزرو شده است.';

      slots.forEach((slot) => {
        const div = document.createElement('div');
        div.className = `slot-card ${slot.status}`;
        div.setAttribute('data-time', slot.time);
        div.innerHTML = `<h3 style="margin:0 0 4px;">${slot.time}</h3><p class="slot-meta" style="margin:0;">${slot.status === 'free' ? 'آزاد برای رزرو' : 'رزرو شده'}</p>`;
        if (slot.status === 'free') {
          div.addEventListener('click', () => {
            timeSelect.value = slot.time;
            syncSelectedCard();
          });
        }
        slotGrid.appendChild(div);
      });
      syncSelectedCard();
    };

    const loadSlots = async () => {
      if (!dayInput || !timeSelect) return;
      const date = dayInput.value;
      timeSelect.innerHTML = '<option value="">در حال بارگذاری...</option>';
      try {
        const res = await fetch(`/api/slots?date=${date}`);
        const data = await res.json();
        renderSlots(data.slots || []);
        const freeSlots = (data.slots || []).filter((s) => s.status === 'free');
        if (freeSlots.length === 0) {
          timeSelect.innerHTML = '<option value="">امروز پر است؛ روز دیگری را انتخاب کنید.</option>';
          return;
        }
        timeSelect.innerHTML = '<option value="">انتخاب ساعت</option>';
        freeSlots.forEach((slot) => {
          const opt = document.createElement('option');
          opt.value = slot.time;
          opt.textContent = slot.time;
          timeSelect.appendChild(opt);
        });
        syncSelectedCard();
      } catch (err) {
        slotLegend.textContent = 'مشکل در دریافت زمان‌ها؛ دوباره تلاش کنید.';
        timeSelect.innerHTML = '<option value="">عدم دسترسی</option>';
      }
    };

    dayInput?.addEventListener('change', loadSlots);
    timeSelect?.addEventListener('change', syncSelectedCard);
    loadSlots();

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.querySelector('#name');
      const phone = document.querySelector('#phone');
      const service = document.querySelector('#service');
      const note = document.querySelector('#note');

      status.textContent = 'در حال ارسال...';
      const payload = {
        name: name?.value || '',
        phone: phone?.value || '',
        service: service?.value || '',
        date: dayInput?.value || '',
        time: timeSelect?.value || '',
        note: note?.value || '',
      };
      try {
        const res = await fetch('/api/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) {
          const msg = await res.json().catch(() => ({}));
          throw new Error(msg.error || 'Request failed');
        }
        status.textContent = 'رزرو ثبت شد! به زودی در واتساپ پاسخ می‌دهیم.';
        form.reset();
        if (dayInput) dayInput.value = today;
        loadSlots();
      } catch (error) {
        status.textContent = 'ارسال نشد. دوباره تلاش کنید یا تماس بگیرید.';
      }
    });
  </script>
`;

const testimonialsContent = `
  <div class="card">
    <h2>نظرات مشتریان</h2>
    <p class="lead">فضای آرام، خط‌های تمیز و استایل ماندگار؛ دلیل اینکه مشتریان برمی‌گردند.</p>
    <div class="grid">
      <div class="card">
        <h3>بهزاد — فید + ریش</h3>
        <p class="lead">«فید دقیق، فضای راحت و خط ریش فوق‌العاده. رزرو آنلاین کمتر از ۲۰ ثانیه بود.»</p>
      </div>
      <div class="card">
        <h3>محمد — استایل رسمی</h3>
        <p class="lead">«بالانس ساید پارت همیشه آماده دوربین است. راهنمای محصول برای هوای ارومیه عالی بود.»</p>
      </div>
      <div class="card">
        <h3>رضا — کراپ تکسچر</h3>
        <p class="lead">«انتظار کوتاه، استودیو تمیز و نکته‌های استایل که واقعا برای موهای من جواب داد.»</p>
      </div>
    </div>
  </div>
`;

const contactContent = `
  <div class="grid two">
    <div class="card">
      <h2>راه‌های ارتباط</h2>
      <p class="lead">موبایل اولویت ماست. تماس یا پیام بفرستید؛ بین نوبت‌ها سریع پاسخ می‌دهیم.</p>
      <ul>
        <li>واتساپ / تماس: <a href="tel:+989300802857">+۹۸ ۹۳۰ ۰۸۰ ۲۸۵۷</a></li>
        <li>ایمیل: <a href="mailto:arashnabizadeh72@gmail.com">arashnabizadeh72@gmail.com</a></li>
        <li>اینستاگرام: <a href="https://www.instagram.com/karizma_haircut/" target="_blank">@karizma_haircut</a></li>
        <li>شهر: ارومیه · ساعت کاری ۹ تا ۲۲</li>
      </ul>
    </div>
    <div class="card">
      <h2>سوالات پرتکرار</h2>
      <p class="lead"><strong>مراجعه بدون نوبت؟</strong> رزرو کنید تا صندلی آماده باشد؛ اغلب همان روز وقت خالی داریم.</p>
      <p class="lead"><strong>پرداخت؟</strong> نقد یا کارت بانکی. در صورت نیاز رسید ارائه می‌شود.</p>
      <p class="lead"><strong>تاخیر؟</strong> ۱۰ دقیقه فرصت؛ بعد از آن برای احترام به نفر بعدی، زمان جدید تنظیم می‌کنیم.</p>
    </div>
  </div>
`;

const pageMap: Record<string, Page> = {
  '/': {
    title: 'کاریزما هیرکات | آرایشگاه مردانه ارومیه — فید مدرن و دیزاین ریش',
    description: 'تجربه موبایل‌فرست با رزرو آنلاین، سئو کامل و سرعت بالا روی کلودفلر. فید، استایل و ریش در ارومیه.',
    body: homeContent,
  },
  '/services': {
    title: 'خدمات | کاریزما هیرکات ارومیه',
    description: 'فید دقیق، دیزاین ریش و استایل رویداد با تمرکز روی فرم صورت و سلامت مو.',
    body: servicesContent,
  },
  '/story': {
    title: 'داستان ما | کاریزما هیرکات',
    description: 'آشنایی با آرش نبی‌زاده و رویکرد جزئیات محور در استایل مردانه.',
    body: storyContent,
  },
  '/gallery': {
    title: 'گالری | کاریزما هیرکات ارومیه',
    description: 'نمونه فید، خط ریش و استایل‌های مدرن توسط کاریزما هیرکات.',
    body: galleryContent,
  },
  '/pricing': {
    title: 'تعرفه‌ها | کاریزما هیرکات',
    description: 'قیمت شفاف برای کات، فید، دیزاین ریش و استایل رویداد در ارومیه.',
    body: pricingContent,
  },
  '/reserve': {
    title: 'رزرو آنلاین | کاریزما هیرکات',
    description: 'فرم ریسپانسیو برای رزرو سریع با دیتابیس D1 و تایید واتساپ.',
    body: reserveContent,
  },
  '/testimonials': {
    title: 'نظرات مشتریان | کاریزما هیرکات',
    description: 'مشتریان چرا کاریزما را برای استایل و فید در ارومیه انتخاب می‌کنند.',
    body: testimonialsContent,
  },
  '/contact': {
    title: 'ارتباط | کاریزما هیرکات',
    description: 'تماس، واتساپ یا ایمیل برای هماهنگی نوبت و پرسش‌ها.',
    body: contactContent,
  },
};

const app = new Hono<Env>();

app.get('/', (c) => c.html(layout(pageMap['/'].title, pageMap['/'].description, pageMap['/'].body, '/')));

for (const [path, page] of Object.entries(pageMap)) {
  if (path === '/') continue;
  app.get(path, (c) => c.html(layout(page.title, page.description, page.body, path)));
}

app.get('/api/reservations', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, client_name, phone, service, preferred_date, note, created_at FROM reservations ORDER BY created_at DESC'
  ).all();
  return c.json({ data: results });
});

app.get('/api/slots', async (c) => {
  const date = c.req.query('date');
  if (!date) return c.json({ error: 'پارامتر تاریخ الزامی است' }, 400);

  const { results } = await c.env.DB.prepare(
    'SELECT preferred_date FROM reservations WHERE substr(preferred_date, 1, 10) = ?1'
  )
    .bind(date)
    .all();

  const reservedTimes = (results || [])
    .map((row: { preferred_date?: string }) => row.preferred_date?.split('T')[1]?.slice(0, 5))
    .filter((t): t is string => Boolean(t));

  return c.json({ date, slots: slotsForDate(date, reservedTimes) });
});

app.post('/api/reservations', async (c) => {
  const payload = await c.req.json().catch(() => null);
  if (!payload) return c.json({ error: 'Invalid JSON' }, 400);

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : '';
  const service = typeof payload.service === 'string' ? payload.service.trim() : '';
  const date = typeof payload.date === 'string' ? payload.date.trim() : '';
  const time = typeof payload.time === 'string' ? payload.time.trim() : '';
  const note = typeof payload.note === 'string' ? payload.note.trim() : '';

  if (!name || !phone || !service || !date || !time) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const preferredDateTime = `${date}T${time}`;

  const existing = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM reservations WHERE preferred_date = ?1'
  )
    .bind(preferredDateTime)
    .first<{ count: number }>();

  if ((existing?.count || 0) > 0) {
    return c.json({ error: 'این ساعت قبلا رزرو شده است' }, 409);
  }

  await c.env.DB.prepare(
    'INSERT INTO reservations (client_name, phone, service, preferred_date, note) VALUES (?1, ?2, ?3, ?4, ?5)'
  )
    .bind(name, phone, service, preferredDateTime, note)
    .run();

  return c.json({ status: 'ok' }, 201);
});

app.get('/api/health', (c) => c.json({ status: 'ok', city: 'Urmia' }));

app.notFound((c) =>
  c.html(
    layout(
      'یافت نشد | کاریزما هیرکات',
      'صفحه مورد نظر شما در دسترس نیست.',
      `<div class="card"><h2>صفحه پیدا نشد</h2><p class="lead">از منوی بالا برای مشاهده صفحات استفاده کنید. اگر لینک اشتباه است با ما تماس بگیرید.</p></div>`,
      c.req.path
    ),
    404
  )
);

export default app;
