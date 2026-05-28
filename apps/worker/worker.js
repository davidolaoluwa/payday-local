'use strict';
setInterval(() => {
  console.log(JSON.stringify({ level: 'info', msg: 'processed batch', ts: Date.now() }));
}, 10000);
