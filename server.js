import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * index.html을 포함한 디렉토리 자동 탐색
 */
function findIndexHtmlDir(baseDir) {
  const files = fs.readdirSync(baseDir);
  for (const file of files) {
    const fullPath = path.join(baseDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const result = findIndexHtmlDir(fullPath);
      if (result) return result;
    } else if (file.toLowerCase() === "index.html") {
      return baseDir;
    }
  }
  return null;
}

// 📌 __dirname(프로젝트 루트) 아래에서 index.html 찾기
const siteRoot = findIndexHtmlDir(__dirname);
if (!siteRoot) {
  console.error("❌ index.html을 찾을 수 없습니다. 먼저 크롤링하세요.");
  process.exit(1);
}

console.log(`📂 siteRoot 자동 탐지됨: ${siteRoot}`);

app.use(express.static(siteRoot));

app.get("/", (req, res) => {
  res.sendFile(path.join(siteRoot, "index.html"));
});

app.listen(port, () => {
  console.log(`✅ 서버 실행중: http://localhost:${port}`);
});
