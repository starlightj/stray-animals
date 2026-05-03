const http = require('http');

async function fetchData(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function showAnimals() {
  console.log('\n=== 动物列表 ===');
  const animals = await fetchData('/api/animals');
  animals.forEach((a, i) => {
    console.log(`${i+1}. [${a.id}] ${a.name} - ${a.species} - ${a.color}`);
    console.log(`   📍 ${a.location.address}`);
    console.log(`   📅 ${new Date(a.createdAt).toLocaleString()}`);
    console.log();
  });
}

async function showStats() {
  console.log('\n=== 统计数据 ===');
  const stats = await fetchData('/api/stats');
  console.log(`总动物数: ${stats.totalAnimals}`);
  console.log(`物种数量: ${stats.speciesCount}`);
  console.log(`今日新增: ${stats.todayAdd}`);
  console.log(`识别次数: ${stats.recognitions}`);
}

async function main() {
  try {
    await showStats();
    await showAnimals();
  } catch (error) {
    console.error('错误:', error.message);
    console.log('请确保服务器已启动: node server-debug.js');
  }
}

main();