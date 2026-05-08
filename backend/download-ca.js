const fs = require('fs');
const https = require('https');

const caUrl = 'https://raw.githubusercontent.com/pingcap/tidbcloud-documentation/main/static/files/ca.pem';
const caPath = './ca.pem';

https.get(caUrl, (res) => {
  const data = [];
  res.on('data', (chunk) => data.push(chunk));
  res.on('end', () => {
    fs.writeFileSync(caPath, Buffer.concat(data));
    console.log('SSL证书下载成功:', caPath);
  });
}).on('error', (err) => {
  console.error('下载证书失败:', err);
});