# Results tool

## Running it yourself

1. Change the `config.js` with your candidates name
2. In a terminal, `npm install` (this will install the node modules)
3. In a terminal, `npm run start`
4. Vist `http://localhost:8080/` in a browser
5. Choose the `.csv` file containing the results
    - Refer to the section `Input file` 
    - After a correct file has been processed, you should see the candidates names (or a candidate url if you haven't setup `config.js`), alongside a unique color and number for each candidate
6. Load one of the scenes by pressing the key 1, 2 or 3.
    - Key 1: Largest Contentful Paint
    - Key 2: Time to first Ad request
    - Key 3: First Contentful Paint
    - Note: At any point in the app, you can press the keys to go a new scene, and restart without having to re-upload the `.csv` file
7. When in a scene selection (when you see a large title), press the `space` key to start the race 

### Input file

The file should be a comma seperated value (`.csv`) with atleast the following headers:
- `URL`: The url of the tested website
- `chromeUserTiming.LargestContentfulPaint`: Used for the "Largest Contentful Paint" scene (1)
- `userTime.gpt-ad-request`: Used for the "Time to first Ad request" scene (2)
- `chromeUserTiming.firstContentfulPaint`: Used for the "First Contentful Paint" scene (2)

An example of this can be found as `demo.csv`