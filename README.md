# Karizma Haircut — Cloudflare Worker site

A phone-first barber experience for Urmia built on Cloudflare Workers + Hono with D1-backed online reservations and API-first design.

## Pages
Eight fast-loading, SEO-ready pages are rendered at the edge:
- `/` Home
- `/services`
- `/story`
- `/gallery`
- `/pricing`
- `/reserve`
- `/testimonials`
- `/contact`

## API
- `GET /api/reservations` – list reservations stored in D1
- `GET /api/slots?date=YYYY-MM-DD` – برگرداندن لیست زمان‌های آزاد/رزرو شده در همان روز
- `POST /api/reservations` – create a reservation with `{ name, phone, service, date, time, note? }` (اگر زمان تکراری باشد خطای 409 می‌دهد)
- `GET /api/health` – lightweight uptime check

## Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Update `wrangler.toml` with your Cloudflare `account_id` and D1 `database_id`.
3. Apply the migration to your D1 database:
   ```bash
   npx wrangler d1 migrations apply karizma-bookings --local
   ```
4. Start local development:
   ```bash
   npm run dev
   ```

## Deployment
Deploy to Cloudflare Workers (with D1 binding configured):
```bash
npm run deploy
```

## Notes
- The UI is mobile-first with sticky navigation, bold CTA buttons, and inline styling for performance.
- SEO includes meta descriptions, keywords, Open Graph tags, and Schema.org `Barbershop` structured data.
- رزرو با شبکه کارت‌های زمان آزاد/رزرو شده انجام می‌شود و انتخاب زمان با لمس کارت یا فهرست کشویی امکان‌پذیر است.
- تم فارسی تیره با گرادیان سه‌بعدی سبک و تایپوگرافی موبایل‌دوست برای سرعت بالای کلودفلر.
