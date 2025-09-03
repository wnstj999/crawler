import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * mirror 폴더 안에서 index.html이 들어있는 폴더 찾기
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

const siteRoot = findIndexHtmlDir(path.join(__dirname, "mirror"));
if (!siteRoot) {
  console.error("❌ mirror 폴더에서 index.html을 찾을 수 없습니다.");
  process.exit(1);
}

console.log(`📂 siteRoot 자동 탐지됨: ${siteRoot}`);

// 정적 파일 서빙
app.use(express.static(siteRoot));

// 기본 라우트 → index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(siteRoot, "index.html"));
});

app.listen(port, () => {
  console.log(`✅ 서버 실행중: http://localhost:${port}`);
});
