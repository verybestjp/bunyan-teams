const bunyan = require('bunyan');
const BunyanTeams = require('../lib');

describe('just check simple flow', () => {

  it('log something', () => {
    const fetcher = jest.fn(() => Promise.resolve());
    const log = bunyan.createLogger({
      name: 'myApp',
      stream: new BunyanTeams({
        webhook_url: process.env.WEBHOOK_URL,
        fetcher,
      }),
    });

    log.error('Error on product search!', { service: 'inventory', id: 3 });
    expect(fetcher).toHaveBeenCalledWith(process.env.WEBHOOK_URL, expect.objectContaining({
      method: 'post',
      body: expect.stringMatching(/ror on product sear/g),
    }));

    log.info('Product fetch from database!', { service: 'inventory' });
    expect(fetcher).toHaveBeenCalledWith(process.env.WEBHOOK_URL, expect.objectContaining({
      method: 'post',
      body: expect.stringMatching(/fetch from database/g),
    }));
  });
});
