# Chrome UX Report API

## Examples

## URL Examples

`curl -s --request POST 'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=YOUR_API_KEY' --header 'Accept: application/json' --header 'Content-Type: application/json' --data '{"url":"https://developer.chrome.com/products"}'`

[Example Output](full_report_url.json)

## Origin Examples

`curl -s --request POST 'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=YOUR_API_KEY' --header 'Accept: application/json' --header 'Content-Type: application/json' --data '{"origin":"https://developer.chrome.com"}'`

[Example Output](full_report.json)

`curl -s --request POST 'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=YOUR_API_KEY' --header 'Accept: application/json' --header 'Content-Type: application/json' --data '{"formFactor":"PHONE","origin":"https://developer.chrome.com"}'`

[Example Output](mobile_report.json)

`curl -s --request POST 'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=YOUR_API_KEY' --header 'Accept: application/json' --header 'Content-Type: application/json' --data '{"formFactor":"PHONE","origin":"https://developer.chrome.com","metrics":["largest_contentful_paint", "experimental_time_to_first_byte"]}'`

[Example Output](mobile_lcp_ttfb_report.json)
