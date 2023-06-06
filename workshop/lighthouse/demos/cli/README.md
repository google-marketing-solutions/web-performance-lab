# Lighthouse CLI Demo

The Lighthouse CLI demo is a demo of how to use Lighthouse CLI to run Lighthouse in your terminal.

## Prerequisites

Before getting started, make sure you have the following prerequisites installed:

- NPM (Node Package Manager)
- Node.js

If you haven't installed them yet, please visit the official NPM and Node.js websites to download and install the latest versions for your operating system.

## Example Commands

To run the demo, execute the following corresponding command for the demo you want to run in your terminal.
The demo is using a example page which is poorly optimized to show the different features of Lighthouse and it not representative for a real world page.

### Single Page review

The single page review demo will run Lighthouse against a single page and generate a report which open automatically inside the browser.

Run the following command in your terminal:
`npx lighthouse https://gtech-professional-services.github.io/web-performance-lab/workshop/lighthouse/demos/page/index.html --view`

### Blocking Requests

The blocking request demo show how to block specific requests from the audit.
It will use the `--blocked-url-patterns` flag to block ads and popups.

### Blocking Ads

The following command will block ads and generate a report which open automatically inside the browser.

Run the following command in your terminal:
`npx lighthouse --blocked-url-patterns=ads --view https://gtech-professional-services.github.io/web-performance-lab/workshop/lighthouse/demos/page/index.html`

Keep in mind to adjust the blocked-url-patterns to your needs.

### Blocking Popups

The following command will block popups and generate a report which open automatically inside the browser.

Run the following command in your terminal:
`npx lighthouse --blocked-url-patterns=popup --view https://gtech-professional-services.github.io/web-performance-lab/workshop/lighthouse/demos/page/index.html`

Keep in mind to adjust the blocked-url-patterns to your needs.

### Blocking Ads and Popups

The following command will block ads and popups and generate a report which open automatically inside the browser.

Run the following command in your terminal:
`npx lighthouse --blocked-url-patterns=popup --blocked-url-patterns=ads --view https://gtech-professional-services.github.io/web-performance-lab/workshop/lighthouse/demos/page/index.html`

Keep in mind to adjust the blocked-url-patterns to your needs.
