/*
 * Herramienta de desarrollo (no forma parte del juego): controla Chrome o Edge en modo
 * headless mediante el protocolo DevTools, sin dependencias (usa el WebSocket de Node 22+).
 * Equivale a un Puppeteer mínimo: navegar, evaluar JavaScript y tomar capturas.
 */
'use strict';
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

function buscarNavegador() {
  const candidatos = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
  ].filter(Boolean);
  const hallado = candidatos.find((c) => fs.existsSync(c));
  if (!hallado) throw new Error('No se encontró Chrome ni Edge. Defina CHROME_PATH con la ruta del navegador.');
  return hallado;
}

async function abrir(opciones = {}) {
  const ancho = opciones.ancho || 1920, alto = opciones.alto || 1080;
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'apagon-cdp-'));
  const proc = spawn(buscarNavegador(), [
    '--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + perfil,
    '--window-size=' + ancho + ',' + alto, '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--mute-audio', '--force-device-scale-factor=1', '--allow-file-access-from-files', 'about:blank'
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  const wsUrl = await new Promise((resolver, rechazar) => {
    let buf = '';
    const t = setTimeout(() => rechazar(new Error('El navegador no respondió a tiempo.')), 20000);
    proc.stderr.on('data', (d) => {
      buf += d;
      const m = /DevTools listening on (ws:\/\/\S+)/.exec(buf);
      if (m) { clearTimeout(t); resolver(m[1]); }
    });
    proc.on('exit', () => rechazar(new Error('El navegador se cerró antes de iniciar.')));
  });

  const ws = new WebSocket(wsUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('No se pudo conectar al navegador.')); });
  let sec = 0;
  const pendientes = new Map();
  const errores = [];
  const consola = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pendientes.has(m.id)) {
      const p = pendientes.get(m.id); pendientes.delete(m.id);
      if (m.error) p.rechazar(new Error(m.error.message)); else p.resolver(m.result);
    } else if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      errores.push((d.exception && d.exception.description) || d.text);
    } else if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) {
      consola.push(m.params.type + ': ' + m.params.args.map((a) => a.value || a.description || '').join(' '));
    } else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      consola.push('log: ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
    }
  };
  const enviar = (method, params = {}, sessionId) => new Promise((resolver, rechazar) => {
    const id = ++sec;
    pendientes.set(id, { resolver, rechazar });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });

  const { targetId } = await enviar('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await enviar('Target.attachToTarget', { targetId, flatten: true });
  const s = (method, params) => enviar(method, params, sessionId);
  await s('Page.enable'); await s('Runtime.enable'); await s('Log.enable');
  await s('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: false });

  const pagina = {
    errores, consola,
    async tamano(w, h) { await s('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false }); },
    async ir(url) {
      await s('Page.navigate', { url });
      for (let i = 0; i < 100; i++) {
        await pagina.esperar(50);
        if (await pagina.evaluar('document.readyState === "complete" && !!(window.EA && EA.ui)').catch(() => false)) return;
      }
      throw new Error('La página no terminó de cargar: ' + url);
    },
    async evaluar(expresion) {
      const r = await s('Runtime.evaluate', { expression: expresion, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text);
      return r.result.value;
    },
    esperar(ms) { return new Promise((r) => setTimeout(r, ms)); },
    async captura(archivo) {
      const r = await s('Page.captureScreenshot', { format: 'png' });
      fs.mkdirSync(path.dirname(archivo), { recursive: true });
      fs.writeFileSync(archivo, Buffer.from(r.data, 'base64'));
      return archivo;
    },
    /** Clic real del mouse en coordenadas de la ventana. */
    async clic(x, y) {
      await s('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
      await s('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
      await s('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    },
    async arrastrar(x1, y1, x2, y2) {
      await s('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x1, y: y1 });
      await s('Input.dispatchMouseEvent', { type: 'mousePressed', x: x1, y: y1, button: 'left', clickCount: 1 });
      for (let i = 1; i <= 8; i++) await s('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x1 + (x2 - x1) * i / 8, y: y1 + (y2 - y1) * i / 8, button: 'left', buttons: 1 });
      await s('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x2, y: y2, button: 'left', clickCount: 1 });
    },
    /** Clic en el centro del primer elemento que coincide con el selector. */
    async clicEn(selector) {
      const p = await pagina.evaluar('(function(){var e=document.querySelector(' + JSON.stringify(selector) + ');if(!e)return null;if(e.scrollIntoView)e.scrollIntoView({block:"center"});var r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];})()');
      if (!p) throw new Error('No existe el elemento: ' + selector);
      await pagina.clic(p[0], p[1]);
    },
    async tecla(key) {
      const especiales = { Enter: [13, '\r'], Escape: [27], Tab: [9], ' ': [32, ' '] };
      const e = especiales[key];
      const base = { key, windowsVirtualKeyCode: e ? e[0] : key.toUpperCase().charCodeAt(0), code: e ? key : 'Key' + key.toUpperCase() };
      const txt = e ? e[1] : key;
      await s('Input.dispatchKeyEvent', Object.assign({ type: txt ? 'keyDown' : 'rawKeyDown', text: txt }, base));
      await s('Input.dispatchKeyEvent', Object.assign({ type: 'keyUp' }, base));
    },
    async movimientoReducido(activo) { await s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: activo ? 'reduce' : '' }] }); },
    /** Escribe texto en el campo enfocado. */
    async escribir(texto) { await s('Input.insertText', { text: texto }); },
    async cerrar() {
      try { await enviar('Browser.close'); } catch (e) { /* ya cerrado */ }
      try { ws.close(); } catch (e) { /* nada */ }
      await new Promise((r) => setTimeout(r, 300));
      try { proc.kill(); } catch (e) { /* nada */ }
      try { fs.rmSync(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch (e) { /* perfil temporal */ }
    }
  };
  return pagina;
}

const RAIZ = path.join(__dirname, '..');
const urlJuego = (query = '') => pathToFileURL(path.join(RAIZ, 'index.html')).href + query;

module.exports = { abrir, urlJuego, RAIZ };
