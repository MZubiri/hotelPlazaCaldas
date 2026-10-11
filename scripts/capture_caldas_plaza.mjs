import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const DIST_DIR = 'C:/Users/ivart/OneDrive/Desktop/PROYECTOS/HotelCaldasPlaza/dist';
const DIAPO_IMG_DIR = 'C:/Users/ivart/OneDrive/Desktop/PROYECTOS/HotelCaldasPlaza/Diapositiva/img';
const CAPTURAS_DIR = 'C:/Users/ivart/OneDrive/Desktop/PROYECTOS/HotelCaldasPlaza/capturas';

if (!fs.existsSync(DIAPO_IMG_DIR)) fs.mkdirSync(DIAPO_IMG_DIR, { recursive: true });
if (!fs.existsSync(CAPTURAS_DIR)) fs.mkdirSync(CAPTURAS_DIR, { recursive: true });

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function createStaticServer(port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url, `http://localhost:${port}`);
      let reqPath = parsedUrl.pathname;
      if (reqPath === '/') reqPath = '/index.html';
      let filePath = path.join(DIST_DIR, reqPath);

      if (!fs.existsSync(filePath)) {
        filePath = path.join(DIST_DIR, 'index.html');
      }

      const ext = path.extname(filePath);
      const mime = MIME_TYPES[ext] || 'application/octet-stream';

      try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': mime });
        res.end(content);
      } catch (err) {
        res.writeHead(500);
        res.end('Error loading file');
      }
    });

    server.listen(port, () => {
      console.log(`📡 Servidor estático listo en http://localhost:${port}`);
      resolve(server);
    });
  });
}

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  const PORT = 4190;
  const server = await createStaticServer(PORT);

  console.log('🚀 Iniciando Puppeteer con Edge...');
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const saveScreenshots = async (filename) => {
    const p1 = path.join(DIAPO_IMG_DIR, filename);
    const p2 = path.join(CAPTURAS_DIR, filename);
    await page.screenshot({ path: p1, fullPage: false });
    fs.copyFileSync(p1, p2);
    console.log(`📸 Guardada captura: ${filename}`);
  };

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // 1. HOME PORTAL HUÉSPED
  console.log('👉 Capturando Portal Home...');
  await page.goto(`http://localhost:${PORT}/?page=home`, { waitUntil: 'networkidle0' });
  await wait(800);
  await saveScreenshots('slide_portal_home.png');

  // 2. HABITACIONES
  console.log('👉 Capturando Habitaciones...');
  await page.goto(`http://localhost:${PORT}/?page=rooms`, { waitUntil: 'networkidle0' });
  await wait(800);
  await saveScreenshots('slide_portal_habitaciones.png');

  // 3. MOTOR DE RESERVA MODAL
  console.log('👉 Capturando Motor de Reserva...');
  await page.goto(`http://localhost:${PORT}/?page=home`, { waitUntil: 'networkidle0' });
  await wait(500);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const resBtn = btns.find(b => b.textContent.includes('Reservar Directo') || b.textContent.includes('Reservar'));
    if (resBtn) resBtn.click();
  });
  await wait(700);
  await saveScreenshots('slide_motor_reserva.png');

  // 4. PRE-CHECK-IN DIGITAL
  console.log('👉 Capturando Pre-Check-In...');
  await page.goto(`http://localhost:${PORT}/?page=precheckin`, { waitUntil: 'networkidle0' });
  await wait(800);
  await saveScreenshots('slide_portal_precheckin.png');

  // 5. GASTRONOMÍA & TERRAZA
  console.log('👉 Capturando Gastronomía (Café, Terraza & El Madero)...');
  await page.goto(`http://localhost:${PORT}/?page=gastronomy`, { waitUntil: 'networkidle0' });
  await wait(800);
  await saveScreenshots('slide_portal_gastronomia.png');

  // 6. EXPERIENCIAS & DESTINO
  console.log('👉 Capturando Experiencias & Salones...');
  await page.goto(`http://localhost:${PORT}/?page=experiences`, { waitUntil: 'networkidle0' });
  await wait(800);
  await saveScreenshots('slide_portal_experiencias.png');

  // 7. PMS LOGIN
  console.log('👉 Capturando PMS Login...');
  await page.goto(`http://localhost:${PORT}/?pms-login=1`, { waitUntil: 'networkidle0' });
  await wait(800);
  await saveScreenshots('slide_pms_login.png');

  // 8. PMS DASHBOARD EJECUTIVO (LOGGED IN)
  console.log('👉 Capturando PMS Dashboard Ejecutivo...');
  await page.goto(`http://localhost:${PORT}/?pms=1&autologin=true&tab=dashboard`, { waitUntil: 'networkidle0' });
  await wait(1000);
  await saveScreenshots('slide_pms_dashboard.png');

  // 9. PMS TAPE CHART (30 HABITACIONES)
  console.log('👉 Capturando PMS Tape Chart...');
  await page.goto(`http://localhost:${PORT}/?pms=1&autologin=true&tab=tapechart`, { waitUntil: 'networkidle0' });
  await wait(1000);
  await saveScreenshots('slide_pms_tapechart.png');

  // 10. PMS CAJAS & FOLIOS
  console.log('👉 Capturando PMS Cajas & Folios...');
  await page.goto(`http://localhost:${PORT}/?pms=1&autologin=true&tab=cashiering`, { waitUntil: 'networkidle0' });
  await wait(1000);
  await saveScreenshots('slide_pms_cajas.png');

  // 11. PMS ARQUEO DE CAJA MODAL
  console.log('👉 Abriendo modal de Arqueo...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Arqueo') || b.textContent.includes('Cierre'));
    if (btn) btn.click();
  });
  await wait(700);
  await saveScreenshots('slide_pms_arqueo.png');

  // 12. PMS HOUSEKEEPING / GOBERNANTA
  console.log('👉 Capturando PMS Housekeeping...');
  await page.goto(`http://localhost:${PORT}/?pms=1&autologin=true&tab=housekeeping`, { waitUntil: 'networkidle0' });
  await wait(1000);
  await saveScreenshots('slide_pms_housekeeping.png');

  // 13. PMS CLIENTES CRM
  console.log('👉 Capturando PMS Clientes CRM...');
  await page.goto(`http://localhost:${PORT}/?pms=1&autologin=true&tab=crm`, { waitUntil: 'networkidle0' });
  await wait(1000);
  await saveScreenshots('slide_pms_crm.png');

  // 14. PMS RACK & CRUD DE HABITACIONES
  console.log('👉 Capturando PMS Habitaciones CRUD...');
  await page.goto(`http://localhost:${PORT}/?pms=1&autologin=true&tab=rooms`, { waitUntil: 'networkidle0' });
  await wait(1000);
  await saveScreenshots('slide_pms_rooms.png');

  // 15. PMS RESERVACIONES
  console.log('👉 Capturando PMS Reservaciones...');
  await page.goto(`http://localhost:${PORT}/?pms=1&autologin=true&tab=reservations`, { waitUntil: 'networkidle0' });
  await wait(1000);
  await saveScreenshots('slide_pms_reservas.png');

  // 16. PMS PERSONAL & ROLES
  console.log('👉 Capturando PMS Personal & Roles...');
  await page.goto(`http://localhost:${PORT}/?pms=1&autologin=true&tab=users`, { waitUntil: 'networkidle0' });
  await wait(1000);
  await saveScreenshots('slide_pms_roles.png');

  // 17. PMS AUDITORÍA & LOGS
  console.log('👉 Capturando PMS Auditoría...');
  await page.goto(`http://localhost:${PORT}/?pms=1&autologin=true&tab=audit`, { waitUntil: 'networkidle0' });
  await wait(1000);
  await saveScreenshots('slide_pms_auditoria.png');

  // 18. PMS MÓVIL (VIEWPORT SMARTPHONE 390x844)
  console.log('👉 Capturando PMS Móvil en Smartphone...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`http://localhost:${PORT}/?pms=1&autologin=true&tab=dashboard`, { waitUntil: 'networkidle0' });
  await wait(1000);
  await saveScreenshots('slide_pms_mobile.png');

  await browser.close();
  server.close();
  console.log('🎉 ¡Todas las 18 capturas de Hotel Caldas Plaza fueron generadas exitosamente!');
}

main().catch(err => {
  console.error('❌ Error capturando pantallas:', err);
  process.exit(1);
});