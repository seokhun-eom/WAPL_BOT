import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';

const WAPL_LOGIN_URL = 'https://wapl.ai/spaces';
const WAPL_ROOM_URL = process.env.WAPL_TEST_ROOM_URL;
const WAPL_USERNAME = process.env.WAPL_DEFAULT_USERNAME;
const WAPL_PASSWORD = process.env.WAPL_DEFAULT_PASSWORD;

const browserConfig = {
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
};

async function loginToWapl(page) {
  await page.goto(WAPL_LOGIN_URL, { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[name="username"]');
  await page.type('input[name="username"]', WAPL_USERNAME);
  await page.type('input[name="password"]', WAPL_PASSWORD);
  await page.click('input[name="login"]');
  await page.waitForNavigation();
}

async function postToWapl(page, msg) {
  await page.goto(WAPL_ROOM_URL, { waitUntil: 'networkidle2' });
  await page.waitForSelector('div[data-placeholder="Enter a message."]');
  await page.evaluate((msg) => {
    const input = document.querySelector(
      'div[data-placeholder="Enter a message."]'
    );
    input.innerHTML = `<div>🤖WAPL 알림 봇🤖</div><div>${msg}</div>`;
  }, msg);
  await page.waitForSelector('button.sc-kQwWFH');
  await page.click('button.sc-kQwWFH');
  await (() => new Promise((res) => setTimeout(res, 3000)))();
}

async function writeText(msg) {
  const browser = await puppeteer.launch(browserConfig);
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    await loginToWapl(page);
    await postToWapl(page, msg);
  } finally {
    await browser.close();
  }
}

export async function GET(request: Request) {
  await writeText('GET 요청이 왔습니다.');
  return new Response(`GET ${process.env.WAPL_TEST_ROOM_URL}`);
}
