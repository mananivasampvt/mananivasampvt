const handler = require('./api/property-meta.js');
const fs = require('fs');

async function test() {
  const req = { query: { id: '1ueM0V19wcs1CQ0eaSpP' } };
  const res = {
    setHeader: () => {},
    status: function() { return this; },
    send: (html) => {
      fs.writeFileSync('output.html', html);
      console.log('Done!');
    }
  };
  await handler(req, res);
}
test();
