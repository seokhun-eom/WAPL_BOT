import puppeteer, { Page } from 'puppeteer';

export const dynamic = 'force-dynamic';

const browserConfig = {
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
};

async function loginToWapl(email: string, password: string, page: Page) {
  await page.goto('https://wapl.ai/spaces', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[name="username"]');
  await page.type('input[name="username"]', email);
  await page.type('input[name="password"]', password);
  await page.click('input[name="login"]');
  await page.waitForNavigation();
  await (() => new Promise((res) => setTimeout(res, 500)))();
}

async function postToWapl(msg: string, roomUrl: string, page: Page) {
  await page.goto(roomUrl, { waitUntil: 'networkidle2' });

  const result = await page.waitForSelector(
    'div[data-placeholder="Enter a message."]',
    {
      timeout: 10000,
    }
  );
  if (!result) throw new Error('로그인에 실패했습니다.');

  await page.evaluate((msg: string) => {
    const input = document.querySelector(
      'div[data-placeholder="Enter a message."]'
    );
    if (!input) return;
    input.innerHTML = `<div>🤖WAPL 알림 봇🤖</div><div>${msg}</div>`;
  }, msg);
  await page.waitForSelector('button.sc-kQwWFH');
  await page.click('button.sc-kQwWFH');
  await (() => new Promise((res) => setTimeout(res, 500)))();
  await page.click('button.sc-kQwWFH');
  await (() => new Promise((res) => setTimeout(res, 500)))();
}

async function getBaseUrl(page: Page) {
  await page.goto('https://tmax.wapl.ai/login', { waitUntil: 'networkidle2' });
  await (() => new Promise((res) => setTimeout(res, 2000)))();
  const url = page.url();
  return url;
}

async function writeText(
  email: string,
  password: string,
  msg: string,
  roomUrl?: string
) {
  const browser = await puppeteer.launch(browserConfig);
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    await loginToWapl(email, password, page);
    if (!roomUrl) {
      roomUrl = await getBaseUrl(page);
    }
    await postToWapl(msg, roomUrl, page);
    await browser.close();
  } catch (err) {
    await browser.close();
    throw err;
  }
}

interface RequestProps {
  email: string;
  password: string;
  msg: string;
  roomUrl?: string;
}

export async function POST(request: Request) {
  const res: RequestProps = await request.json();
  try {
    await writeText(res.email, res.password, res.msg, res.roomUrl);
    return new Response(`완료되었습니다.`, { status: 201 });
  } catch (err) {
    return new Response(`${err}`, { status: 500 });
  }
}
