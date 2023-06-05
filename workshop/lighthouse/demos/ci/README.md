# Lighthouse CI Demo

This is a demo of how to use Lighthouse CI to run Lighthouse in CI.

## Prerequisites

Before getting started, make sure you have the following prerequisites installed:

- NPM (Node Package Manager)
- Node.js

If you haven't installed them yet, please visit the official NPM and Node.js websites to download and install the latest versions for your operating system.

## Installation

To install the required dependencies, simply run the following command:
`npm install`

This command will automatically fetch and install all the necessary dependencies listed in the project's package.json file. Make sure you run this command in the root directory of your project.

## Usage

To run the demo, execute the following corresponding command for the demo you want to run in your terminal.
Make sure you are in the root directory of your project when running this command.

### Single Page review

The single page review demo will run Lighthouse against a single page and generate a report which is stored in the temporary public storage.

To run the demo, execute the following command in your terminal:
`npm run example:single_page`

### Multiple Page review

The multiple page review demo will run Lighthouse against multiple pages and generate a report which is stored in the temporary public storage.

To run the demo, execute the following command in your terminal:
`npm run example:multi_page`

### Asserting Performance Regressions

#### Asserting failed

The asserting failed demo will run Lighthouse against a single page and assert that the performance score is greater or equal than 100.
Which will fail the build as in this case the performance score is always less than 100.

To run the demo, execute the following command in your terminal:
`npm run example:assert_failed`

#### Asserting ok

The asserting ok demo will run Lighthouse against a single page and assert that the performance score is greater or equal than 0.1.
Which will pass the build as in this case the performance score is always greater than 0.1.

To run the demo, execute the following command in your terminal:
`npm run example:assert_ok`

## Further Reading

- [Lighthouse CI documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Performance monitoring with Lighthouse CI](https://web.dev/lighthouse-ci/)
