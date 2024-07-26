const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
  let data = '';
  console.log(`request url: ${req.url}`);
  if(req.url === '/') {
    data = fs.readFileSync('./1.html');
    res.end(data);
  } else if(req.url === '/styles.css') {
    setTimeout(() => {
      data = fs.readFileSync('./styles.css');
      res.end(data);
    }, 1000);
  }
}).listen(8000, () => {
  console.log('server stast!');
});