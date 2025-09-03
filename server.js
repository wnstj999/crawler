import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📌 템플릿 루트 디렉토리 (여기에 index.html, about.html 등 있음)
const siteRoot = path.join(__dirname, "themes/templatemoster/html/weeducate");

// 정적 파일 전체 서빙
app.use(express.static(siteRoot));

// 기본 라우트 → index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(siteRoot, "index.html"));
});

app.listen(port, () => {
  console.log(`✅ 서버 실행중: http://localhost:${port}`);
  console.log(`📂 siteRoot: ${siteRoot}`);
});
