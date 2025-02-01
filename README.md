# U.S. Places Geocoder Demo

Demo of [us-places-geocoder](https://www.npmjs.com/package/us-places-geocoder) npm package.

## Running Locally

1. Run `npm install` to install dependencies
1. Get a free [MapTiler API key](https://cloud.maptiler.com/account/keys/) and export a `BASEMAP_STYLE` environment variable:
    ```bash
    export BASEMAP_STYLE=https://api.maptiler.com/maps/basic-v2/style.json?key=<your_api_key_here>
    ```
1. Build the app via `npm run build`
1. Run the dev static file server via `npm run start`
1. Go to http://localhost:3000 to view the geocoder demo
