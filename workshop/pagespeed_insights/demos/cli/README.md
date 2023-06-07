# PageSpeed Insights CLI Demo

The PageSpeed Insights CLI demo is a demo of how to use PageSpeed Insights CLI to run PageSpeed Insights in your terminal.

## Prerequisites

Before getting started, make sure you have the following prerequisites installed:

- NPM (Node Package Manager)
- Node.js

If you haven't installed them yet, please visit the official NPM and Node.js websites to download and install the latest versions for your operating system.

## Example Commands

To run the demo, execute the following corresponding command for the demo you want to run in your terminal.

`npx psi https://example.org`

### Strategy

With the strategy flag you can define which strategy should be used to run the audit like mobile or desktop.

Use the mobile strategy with the following command:
`npx psi https://blog.google --strategy mobile`

Use the desktop strategy with the following command:
`npx psi https://blog.google --strategy desktop`

### Thresholds

With the thresholds flag you can define the thresholds when a audit should fail.

Use the default threshold (70) for the performance score with the following command:
`npx psi https://blog.google --threshold`

Define a threshold for the performance score with the following command:
`npx psi https://blog.google --threshold 60`

## Further Reading

- [PageSpeed Insights CLI](https://www.npmjs.com/package/psi)
