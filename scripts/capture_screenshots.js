const fs = require('fs');
const path = require('path');
const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vLmRldmVsb3BlckBjYXJlZXJ0d2luLmFpIiwidXNlcl9pZCI6MiwiZXhwIjoxNzk1NTIyOTQ5fQ.leqrq8Uuyijagx37wMedlHEzafRxlPRIG9UWKkKWc-4';
const USER = JSON.stringify({ id: 2, email: 'demo.developer@careertwin.ai', full_name: 'Demo Candidate (Full-Stack)' });

const OUTPUT_DIR = path.resolve(__dirname, '../docs/screenshots');

function getNewTab() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 9222,
      path: '/json/new?http://localhost:5174/login',
      method: 'PUT'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.msgId = 0;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.msgId;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await sleep(1500);
  }

  async evaluate(expression) {
    return await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  }

  async screenshot(filepath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png', quality: 90 });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filepath, buffer);
    console.log(`Saved screenshot: ${filepath} (${buffer.length} bytes)`);
  }
}

async function main() {
  console.log('Connecting to Chrome CDP...');
  const tab = await getNewTab();
  console.log('Opened tab:', tab.id);

  const cdp = new CDPClient(tab.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1.5,
    mobile: false
  });

  // 1. Landing Page
  console.log('Capturing Landing Page...');
  await cdp.navigate('http://localhost:5174/');
  await sleep(1000);
  await cdp.screenshot(path.join(OUTPUT_DIR, '01_landing_page.png'));

  // 2. Login Page
  console.log('Capturing Login Page...');
  await cdp.navigate('http://localhost:5174/login');
  await sleep(1000);
  await cdp.screenshot(path.join(OUTPUT_DIR, '02_login_page.png'));

  // 3. Google Login Modal with Password Complexity Requirements
  console.log('Capturing Google Login Modal...');
  await cdp.evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Continue with Google'));
    if (btn) btn.click();
  `);
  await sleep(600);
  // Type weak password to show validation
  await cdp.evaluate(`
    const inputs = document.querySelectorAll('input');
    for (const input of inputs) {
      if (input.type === 'email') {
        input.value = 'candidate@gmail.com';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (input.type === 'password') {
        input.value = '123';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  `);
  await sleep(500);
  await cdp.screenshot(path.join(OUTPUT_DIR, '03_google_login_modal.png'));

  // Close modal
  await cdp.evaluate(`
    const closeBtn = document.querySelector('button[title="Close"]');
    if (closeBtn) closeBtn.click();
  `);
  await sleep(300);

  // 4. Register Page
  console.log('Capturing Register Page...');
  await cdp.navigate('http://localhost:5174/register');
  await sleep(1000);
  await cdp.screenshot(path.join(OUTPUT_DIR, '04_register_page.png'));

  // Set Auth Token in LocalStorage for Authenticated Features
  console.log('Setting auth tokens in LocalStorage...');
  await cdp.evaluate(`
    localStorage.setItem('careertwin_token', '${TOKEN}');
    localStorage.setItem('careertwin_user', '${USER.replace(/'/g, "\\'")}');
  `);

  // 5. Dashboard
  console.log('Capturing Dashboard...');
  await cdp.navigate('http://localhost:5174/dashboard');
  await sleep(2000);
  await cdp.screenshot(path.join(OUTPUT_DIR, '05_dashboard_page.png'));

  // 6. Resume Manager
  console.log('Capturing Resume Manager...');
  await cdp.navigate('http://localhost:5174/resumes');
  await sleep(1500);
  await cdp.screenshot(path.join(OUTPUT_DIR, '06_resume_manager.png'));

  // 7. Resume Analysis
  console.log('Capturing Resume Analysis...');
  await cdp.navigate('http://localhost:5174/analysis');
  await sleep(1800);
  await cdp.screenshot(path.join(OUTPUT_DIR, '07_resume_analysis.png'));

  // 8. Job Matcher
  console.log('Capturing Job Matcher...');
  await cdp.navigate('http://localhost:5174/jobs');
  await sleep(1500);
  await cdp.screenshot(path.join(OUTPUT_DIR, '08_job_matcher.png'));

  // 9. Skill Gaps Analyser
  console.log('Capturing Skill Gaps...');
  await cdp.navigate('http://localhost:5174/skill-gaps');
  await sleep(1500);
  await cdp.screenshot(path.join(OUTPUT_DIR, '09_skill_gaps.png'));

  // 10. Career Recommendations
  console.log('Capturing Career Recommendations...');
  await cdp.navigate('http://localhost:5174/recommendations');
  await sleep(1500);
  await cdp.screenshot(path.join(OUTPUT_DIR, '10_career_recommendations.png'));

  // 11. Learning Roadmaps
  console.log('Capturing Learning Roadmaps...');
  await cdp.navigate('http://localhost:5174/roadmaps');
  await sleep(1500);
  await cdp.screenshot(path.join(OUTPUT_DIR, '11_learning_roadmaps.png'));

  // 12. Resume Improvement Assistant
  console.log('Capturing Resume Improvement Assistant...');
  await cdp.navigate('http://localhost:5174/improve');
  await sleep(1500);
  await cdp.screenshot(path.join(OUTPUT_DIR, '12_resume_improvement.png'));

  // 13. Candidate Profile
  console.log('Capturing Candidate Profile...');
  await cdp.navigate('http://localhost:5174/profile');
  await sleep(1500);
  await cdp.screenshot(path.join(OUTPUT_DIR, '13_candidate_profile.png'));

  console.log('All screenshots captured successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
