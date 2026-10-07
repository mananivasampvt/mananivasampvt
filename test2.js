const handler = require('./api/property-meta.js');
const fs = require('fs');

async function test() {
  const req = { query: { id: 'YzPGfH3w9LG7PziHoETW' } };
  const res = {
    setHeader: () => {},
    status: function() { return this; },
    send: (html) => {
      console.log('Success! HTML length:', html.length);
    }
  };
  try {
    await handler(req, res);
  } catch (err) {
    console.error('ERROR in handler:', err);
  }
}
test();
