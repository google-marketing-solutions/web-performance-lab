# Results tool

## Running it yourself (locally)

1. Change the `config.js` with your candidates name
2. In a terminal, `npm install` (this will install the node modules)
3. In a terminal, `npm run start`
4. Visit <http://localhost:8080/> in a browser
5. Choose the `.csv` file containing the results
   - Refer to the section `Input file`
   - After a correct file has been processed, you should see the candidates names (or a candidate url if you haven't setup `config.js`), alongside a unique color and number for each candidate
6. Load one of the scenes by pressing the key 1, 2 or 3.
   - Key 1: Largest Contentful Paint
   - Key 2: Time to first Ad request
   - Key 3: First Contentful Paint
   - Note: At any point in the app, you can press the keys to go a new scene, and restart without having to re-upload the `.csv` file
7. When in a scene selection (when you see a large title), press the `space` key to start the race.

## Running (online)

1. Visit <https://google-marketing-solutions.github.io/web-performance-lab/speed_games/results_tool/>
2. Choose the `.csv` file containing the results
   - Refer to the section [Input file](#Input_file)
3. Load one of the scenes by pressing the key 1, 2 or 3.
   - Key 1: Largest Contentful Paint
   - Key 2: Time to first Ad request
   - Key 3: First Contentful Paint
   - Note: At any point in the app, you can press the keys to go a new scene, and restart without having to re-upload the `.csv` file
4. When in a scene selection (when you see a large title), press the `space` key to start the race.

### Input file

The file should be a comma separated value (`.csv`) with at least the following headers:

- `URL`: The url of the tested website
- `chromeUserTiming.LargestContentfulPaint`: Used for the "Largest Contentful Paint" scene (1)
- `userTime.gpt-ad-request`: Used for the "Time to first Ad request" scene (2)
- `chromeUserTiming.firstContentfulPaint`: Used for the "First Contentful Paint" scene (3)

An example of this can be found as [demo.csv](examples/demo_with_team.csv)

#### Metric: userTime.gpt-ad-request

The `userTime.gpt-ad-request` is a custom metric which is used to measure the time to first ad request.
It will be collected over the following code snippet:

```js
let isFirstAdRequest = true;
googletag.pubads().addEventListener('slotRequested', function () {
  if (isFirstAdRequest) {
    performance.mark('gpt-ad-request');
    console.log('First ad request time: ', Math.round(performance.now()));
    isFirstAdRequest = false;
  }
});
```

#### Adding team names (optional)

You can optional adding a team name directly into the .csv file with the following header:

- `Team`: Name of the team which will be displayed.

An example of this can be found as [demo_with_team.csv](examples/demo_with_team.csv)

## During the event

The last version allows to upload multiple .csv files and will display the results of all of them.
You can additionally upload a `.json` file containing the team names and urls like:

- `Team`: Name of the team which will be displayed.
- `URL`: The url of the tested website

This allows to display the team names and urls instead of the candidate urls and to skip the manual step of preparing the `.csv` file.

During the scene you can use the `t` key to toggle the team names and urls.

## Hotkeys

The following hotkeys are available after the `.csv` file has been processed:

- `1`: Load Largest Contentful Paint scene
- `2`: Load Time to first Ad request scene
- `3`: Load First Contentful Paint scene
- `spacebar`: Run the selected scene
- `c`: More confetti
- `t`: Shows / hides the team names and urls

## Development

For development, please refer to the [DEVELOPMENT.md](DEVELOPMENT.md) file.
