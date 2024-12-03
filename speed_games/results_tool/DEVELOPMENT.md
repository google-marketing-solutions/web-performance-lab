# Development

This section is for developers who want to contribute to the Web Performance Lab.

## Getting started

The easiest way to get started is to use the preferred IDE of your choice.

1. Clone the repository
2. In a terminal, `npm install` (this will install the node modules)
3. In a terminal, `npm run start:dev`

This will automatically open a browser window with the test URL.
Changes on the javascript files will automatically rebuild the project.
You will need to refresh the browser window to see the changes.

## Testing distribution files

To build the final distribution files, you can use the `npm run build` command.
If you want to test the distribution files locally, you can use the `npm run start` command instead.

Note: This will not automatically reload the browser window or watch for changes.

## Upgrade packages

To upgrade packages, you can use a pre-defined script which is
using [npm-check](https://www.npmjs.com/package/npm-check).

1. In a terminal, `npm run upgrade`
2. Select the packages you want to upgrade.
3. In a terminal, `npm run start:dev`
4. Check that everything is working as expected.
