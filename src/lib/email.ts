import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@autoeco.ru";

function isConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

function getTransport() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendMail(to: string, subject: string, html: string) {
  if (!isConfigured()) {
    console.warn("[email] SMTP не настроен — письмо не отправлено:", subject);
    return;
  }
  try {
    await getTransport().sendMail({ from: FROM_EMAIL, to, subject, html });
  } catch (err) {
    console.error("[email] Ошибка отправки письма:", err);
  }
}

// ── Shared layout ──────────────────────────────────────────────────────────────

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#5b2be0;padding:28px 32px;">
            <span style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:-0.5px;">AutoEco</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;padding:16px 32px;border-top:1px solid #eeeeee;">
            <p style="margin:0;font-size:12px;color:#999999;text-align:center;">
              AutoEco · Самара · Это автоматическое письмо, не отвечайте на него
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 20px;font-size:20px;font-weight:bold;color:#1a1a1a;">${text}</h1>`;
}

function greeting(name: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#333333;">Привет, <strong>${name}</strong>!</p>`;
}

function infoRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:8px 12px;font-size:13px;color:#666666;background:#f9f9f9;border-radius:6px;white-space:nowrap;">${label}</td>
    <td style="padding:8px 12px;font-size:14px;color:#1a1a1a;font-weight:600;">${value}</td>
  </tr>`;
}

function infoTable(rows: string): string {
  return `
  <table cellpadding="0" cellspacing="4" style="width:100%;margin:16px 0;border-collapse:separate;border-spacing:0 4px;">
    ${rows}
  </table>`;
}

function accent(text: string): string {
  return `<span style="color:#5b2be0;font-weight:bold;">${text}</span>`;
}

// ── Email functions ────────────────────────────────────────────────────────────

export async function sendBookingConfirmation(
  to: string,
  data: {
    userName: string;
    serviceName: string;
    serviceAddress: string;
    date: string;
    time: string;
    carName: string;
  }
) {
  const html = wrap(`
    ${heading("Запись подтверждена ✓")}
    ${greeting(data.userName)}
    <p style="margin:0 0 16px;font-size:14px;color:#555555;">
      Ваша запись в ${accent(data.serviceName)} успешно создана.
    </p>
    ${infoTable(
      infoRow("Сервис", data.serviceName) +
      infoRow("Адрес", data.serviceAddress) +
      infoRow("Дата", data.date) +
      infoRow("Время", data.time) +
      infoRow("Автомобиль", data.carName)
    )}
    <p style="margin:20px 0 0;font-size:13px;color:#888888;">
      Если у вас изменились планы — отмените запись в приложении AutoEco заранее.
    </p>
  `);
  await sendMail(to, "Запись подтверждена — AutoEco", html);
}

export async function sendBookingCancellation(
  to: string,
  data: { userName: string; serviceName: string; date: string }
) {
  const html = wrap(`
    ${heading("Запись отменена")}
    ${greeting(data.userName)}
    <p style="margin:0 0 16px;font-size:14px;color:#555555;">
      Ваша запись в ${accent(data.serviceName)} на ${accent(data.date)} отменена.
    </p>
    <p style="margin:0;font-size:14px;color:#555555;">
      Если вы хотите записаться повторно — откройте каталог сервисов в AutoEco и выберите удобное время.
    </p>
  `);
  await sendMail(to, "Запись отменена — AutoEco", html);
}

export async function sendBookingReminder(
  to: string,
  data: {
    userName: string;
    serviceName: string;
    serviceAddress: string;
    date: string;
    time: string;
  }
) {
  const html = wrap(`
    ${heading("Напоминание о записи")}
    ${greeting(data.userName)}
    <p style="margin:0 0 16px;font-size:14px;color:#555555;">
      Напоминаем о вашей предстоящей записи.
    </p>
    ${infoTable(
      infoRow("Сервис", data.serviceName) +
      infoRow("Адрес", data.serviceAddress) +
      infoRow("Дата", data.date) +
      infoRow("Время", data.time)
    )}
    <p style="margin:20px 0 0;font-size:13px;color:#888888;">
      Не опаздывайте — ваше время будет ждать вас!
    </p>
  `);
  await sendMail(to, "Напоминание о записи — AutoEco", html);
}

export async function sendWelcome(to: string, data: { userName: string }) {
  const html = wrap(`
    ${heading("Добро пожаловать в AutoEco!")}
    ${greeting(data.userName)}
    <p style="margin:0 0 16px;font-size:14px;color:#555555;">
      Рады видеть вас в нашей экосистеме для автомобилистов. Теперь вы можете:
    </p>
    <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;color:#555555;line-height:1.8;">
      <li>Управлять своим автопарком</li>
      <li>Записываться в сервисы и следить за историей ТО</li>
      <li>Получать напоминания и AI-диагностику</li>
      <li>Копить EcoPoints и экономить с клубной картой</li>
    </ul>
    <p style="margin:0;font-size:14px;color:#555555;">
      Откройте приложение и добавьте свой первый автомобиль — это займёт минуту.
    </p>
  `);
  await sendMail(to, "Добро пожаловать в AutoEco!", html);
}

export async function sendSubscriptionRequest(
  adminEmail: string,
  data: { userName: string; userEmail: string; userPhone: string }
) {
  const html = wrap(`
    ${heading("Новая заявка на клубную карту")}
    <p style="margin:0 0 16px;font-size:14px;color:#555555;">
      Пользователь оставил заявку на оформление клубной карты AutoEco.
    </p>
    ${infoTable(
      infoRow("Имя", data.userName) +
      infoRow("Email", data.userEmail) +
      (data.userPhone ? infoRow("Телефон", data.userPhone) : "")
    )}
    <p style="margin:20px 0 0;font-size:13px;color:#888888;">
      Свяжитесь с пользователем и активируйте подписку в панели администратора.
    </p>
  `);
  await sendMail(adminEmail, "Заявка на клубную карту — AutoEco", html);
}

export async function sendSubscriptionActivated(
  to: string,
  data: { userName: string }
) {
  const html = wrap(`
    ${heading("Клубная карта активирована! 🎉")}
    ${greeting(data.userName)}
    <p style="margin:0 0 16px;font-size:14px;color:#555555;">
      Поздравляем — ваша ${accent("Клубная карта AutoEco")} активирована!
    </p>
    <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;color:#555555;line-height:1.8;">
      <li>Клубные цены у партнёров — скидки до 30%</li>
      <li>Приоритетная запись в сервисы</li>
      <li>x2 EcoPoints за каждый визит</li>
      <li>Неограниченная AI-диагностика</li>
    </ul>
    <p style="margin:0;font-size:14px;color:#555555;">
      Откройте каталог сервисов и ищите значок «Клубные цены» — скидка применяется автоматически.
    </p>
  `);
  await sendMail(to, "Клубная карта AutoEco активирована!", html);
}
