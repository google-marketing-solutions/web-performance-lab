# Chrome UX Report API

The Chrome UX Report API lets you view real user experience data for millions of websites. With the API you can explore key user experience metrics for any origin, and also view user experience data for a single URL.

## Examples

The following examples show how to use the API to get user experience data for a single URL, and for an origin.

## URL Example

This example shows how to get the user experience data for a single URL. The URL must be a valid URL for a page that is in the Chrome UX Report dataset.

Example command:
`curl -s --request POST 'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=YOUR_API_KEY' --header 'Accept: application/json' --header 'Content-Type: application/json' --data '{"url":"https://developer.chrome.com/products"}'`

[Example Output](full_report_url.json)

## Origin Examples

This example shows how to get the user experience data for an origin. The origin must be a valid origin that is in the Chrome UX Report dataset.

If several URLs from the origin are in the dataset, the API returns the user experience data for all of them combined.
If no URLs from the origin are in the dataset, the API returns an error.

Example command:
`curl -s --request POST 'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=YOUR_API_KEY' --header 'Accept: application/json' --header 'Content-Type: application/json' --data '{"origin":"https://developer.chrome.com"}'`

[Example Output](full_report.json)

### Mobile Examples

This example shows how to get the user experience data for an origin on mobile devices.

Example command:
`curl -s --request POST 'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=YOUR_API_KEY' --header 'Accept: application/json' --header 'Content-Type: application/json' --data '{"formFactor":"PHONE","origin":"https://developer.chrome.com"}'`

[Example Output](mobile_report.json)

### Mobile LCP and TTFB Examples

This example shows how to get the user experience data for an origin on mobile devices, and only for the LCP and TTFB metrics.

Example command:
`curl -s --request POST 'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=YOUR_API_KEY' --header 'Accept: application/json' --header 'Content-Type: application/json' --data '{"formFactor":"PHONE","origin":"https://developer.chrome.com","metrics":["largest_contentful_paint", "experimental_time_to_first_byte"]}'`

[Example Output](mobile_lcp_ttfb_report.json)
