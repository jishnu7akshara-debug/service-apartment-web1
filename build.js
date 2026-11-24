const fs = require('fs');

['public', 'dist'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync('index.html', dir + '/index.html');
  fs.copyFileSync('404.html', dir + '/404.html');
  fs.cpSync('css', dir + '/css', { recursive: true });
  fs.cpSync('js', dir + '/js', { recursive: true });
  fs.cpSync('assets', dir + '/assets', { recursive: true });
});

console.log('Build completed successfully.');
