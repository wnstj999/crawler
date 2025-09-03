import fs from "fs";
import path from "path";

function fixHtmlPaths(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixHtmlPaths(filePath);
    } else if (file.endsWith(".html")) {
      let content = fs.readFileSync(filePath, "utf-8");

      // 예: /themes/... → ./ 로 교체
      content = content.replace(/\/themes\/templatemoster\/html\/weeducate\//g, "./");

      fs.writeFileSync(filePath, content);
      console.log(`✅ 경로 수정: ${filePath}`);
    }
  });
}

// 명령줄에서 입력된 디렉토리 가져오기
const targetDir = process.argv[2] || "./public";
fixHtmlPaths(targetDir);
