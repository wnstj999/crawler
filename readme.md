npm install
node site-crawler.js
url 입력

다운된 폴더(mirror 폴더)를 다른 경로에 옮긴 후 폴더에 server.js, package.json 넣기
npm install

npm run dev

모든 css,js,html,ico,png,jpg 등 다 긁어오기 떄문에 오래걸림 - 폴더 경로들은 URL에서 보이는 파일들의 경로 그대로를 가져옴 

템플릿 몬스터에서 가져올거면 demo - 프레임 소스 보기 - https://부터 복붙

저장되는 폴더 명을 mirror 에서 다른걸로 바꾸고 싶다면 처음 node site-crawler.js 하기 전에 sote-crawler.js 파일 8번째 문단 const outputFolder = "./mirror"; <-- mirror 를 원하는 파일 명으로 변경