import readline from "readline";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { URL } from "url";

const visited = new Set();
const outputFolder = "./mirror";

if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

/**
 * URL 정규화 (#fragment 제거)
 */
function normalizeUrl(fileUrl) {
  return fileUrl.split("#")[0];
}

/**
 * 파일 저장 (원본 디렉토리 구조 그대로)
 */
async function saveFile(fileUrl, buffer) {
  try {
    const cleanUrl = normalizeUrl(fileUrl);
    const urlObj = new URL(cleanUrl);

    // 원본 경로 그대로 mirror 밑에 저장
    let filePath = path.join(outputFolder, urlObj.pathname);

    // 디렉토리 URL이면 index.html로 저장
    if (cleanUrl.endsWith("/")) {
      filePath = path.join(filePath, "index.html");
    }

    // 디렉토리 생성
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);
    console.log(`✅ 저장됨: ${filePath}`);
  } catch (err) {
    console.error(`❌ 저장 실패: ${fileUrl}`, err.message);
  }
}

/**
 * 개별 페이지 크롤링
 */
async function crawlPage(browser, url, baseDomain, depth, maxDepth) {
  const cleanUrl = normalizeUrl(url);
  if (visited.has(cleanUrl) || depth > maxDepth) return;
  visited.add(cleanUrl);

  try {
    const page = await browser.newPage();

    // 리소스 다운로드 (이미지·아이콘·폰트 포함)
    page.on("response", async (response) => {
      try {
        const req = response.request();
        const resUrl = normalizeUrl(req.url());

        if (
          /\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot|html?)$/i.test(resUrl) ||
          resUrl.endsWith("/")
        ) {
          const buffer = await response.buffer();
          await saveFile(resUrl, buffer);
        }
      } catch (err) {
        console.error("❌ 리소스 다운로드 실패:", err.message);
      }
    });

    await page.goto(cleanUrl, { waitUntil: "networkidle2", timeout: 60000 });

    // HTML 저장
    const html = await page.content();
    await saveFile(cleanUrl, Buffer.from(html));

    // 내부 링크 추출
    const links = await page.$$eval("a", as => as.map(a => a.href));
    const internalLinks = links.filter(l => {
      try {
        return new URL(l).hostname === baseDomain;
      } catch {
        return false;
      }
    });

    console.log(`🔗 발견된 내부 링크 ${internalLinks.length}개 (depth=${depth})`);

    // 재귀 탐색
    for (const link of internalLinks) {
      await crawlPage(browser, link, baseDomain, depth + 1, maxDepth);
    }

    await page.close();
  } catch (err) {
    console.error(`❌ 페이지 크롤링 실패 (${cleanUrl}):`, err.message);
  }
}

/**
 * 사이트 전체 크롤링
 */
async function crawlSite(startUrl, maxDepth = 2) {
  const browser = await puppeteer.launch();
  const baseDomain = new URL(startUrl).hostname;

  await crawlPage(browser, startUrl, baseDomain, 0, maxDepth);

  await browser.close();
}

/**
 * 실행부: URL 입력받기
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("크롤링할 URL 입력: ", (inputUrl) => {
  crawlSite(inputUrl, 2); // depth=2
  rl.close();
});
