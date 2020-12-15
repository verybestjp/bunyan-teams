// use node-fetcher if fetch not present
const nodeFetch = typeof fetch === 'undefined' ? require('node-fetch') : fetch;

const levels = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal',
};

const colors = {
  10: 'BBBBBB', // trace
  20: 'BBBBBB', // debug
  30: '000000', // info
  40: 'FF9800', // warn
  50: 'E51C23', // error
  60: 'E51C23', // fatal
};

module.exports = function BunyanTeams(options, error) {
  const { webhook_url: webhookUrl, fetcher: customFetcher, customFormatter: customFormatter } = options || {};
  if (!webhookUrl) {
    throw new Error('BunyanTeams: webhook_url needed!');
  }

  // check if customFetcher provided, or go to fetch, or else, just node-fetch
  const fetcher = customFetcher || nodeFetch;

  // if we can't handle it anymore. :-(
  const superError = error || function nullError() {};

  const write = function write(r) {

    const record = typeof r === 'string' ? JSON.parse(r) : r;

    const level = levels[record.level];
    const timestamp = new Date(record.time);

    const message = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: colors[record.level],
      markdown: true,
      sections: [{
        facts: [{
          name: 'App Name',
          value: record.name,
        }, {
          name: 'Hostname',
          value: record.hostname,
        }, {
          name: 'At',
          value: timestamp.toISOString(),
        }, {
          name: 'Level',
          value: level.toUpperCase(),
        }],
      }],
      title: `${timestamp.toUTCString()} ${record.name} ${level.toUpperCase()}:`,
    };

    let custom = '';
    try {
      custom = customFormatter ? customFormatter(record, level) : {
        text: util.format('[%s] %s', level.toUpperCase(), record.msg)
      };
    } catch(err) {
      custom = {text: record.msg};
    }

    Object.assign(message, custom);

    // just trim the message for now until 1K chars
    message.text = `\`\`\`\n${message.text.substr(0, 20000)}\n\`\`\``;

    let url = '';
    if ('string' === typeof webhookUrl) {
      url = webhookUrl;
    } else if (Object(webhookUrl) === webhookUrl) {
      if ('error' === level && webhookUrl.error) {
        url = webhookUrl.error;
      } else if (record.webhook && webhookUrl[record.webhook]) {
        url = webhookUrl[record.webhook];
      } else if (webhookUrl.default) {
        url = webhookUrl.default;
      }
    }
    if (!url) {
      return;
    }

    fetcher(url, {
      method: 'post',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    })
      .catch((err) => superError(err));
  };

  return { write };
};
