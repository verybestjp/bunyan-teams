# Bunyan Teams

Add incoming webhook for teams.


## Installation

1. Install Bunyan:  `yarn add bunyan`
1. Install Bunyan Teams:  `yarn add bunyan-teams`

```javascript
const bunyan = require('bunyan');
const BunyanTeams = require('bunyan-teams');

const log = bunyan.createLogger({
	name: "inventory-service",
	stream: new BunyanTeams({
		webhook_url: "https://outlook.office.com/webhook/ba5.....",
		fetcher,
	}),
});

log.info('fetch product!', { service: 'inventory', id: 3 });
```


## Limitation

Current implementation only focused on node environment. (>=8.11)


## Reference:

- https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook

\*inspired from bunyan slack.


## License

MIT
