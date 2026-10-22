# SUSD School Assignment Explorer — review preview

A static website for exploring the supplied 2027–2028 Laguna Prep and Copper Ridge School boundary changes. Includes address search, clickable map, grid selection, school website links, and the non-anniversary district logo.

## Publish with GitHub Pages (no build required)

1. Unzip the download on your computer.
2. Create a GitHub repository, or open the repository you intend to use. A new repository is recommended if you want to preserve the earlier assignment-tool demo.
3. Choose **Add file → Upload files**. Upload the CONTENTS of this folder, including the `data` and `images` folders. Do not upload the ZIP itself. `index.html` must be at the repository root, not inside a `github-pages-package` subfolder.
4. Commit the files to the `main` branch.
5. Open **Settings → Pages**. Under **Build and deployment**, select **Deploy from a branch**, choose **main**, and select **/(root)**. Click **Save**.
6. Wait for GitHub Pages to finish deployment. The Pages settings screen will provide the live URL. Open that URL and test an address and a school website link.

If you use the existing `SUSD-school-assignment` repository under `susd-communications-department`, the published URL remains https://susd-communications-department.github.io/SUSD-school-assignment/ and this replaces the existing page. For a separate preview, use a new repository such as `SUSD-boundary-preview`.

GitHub documentation: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Included files

- `index.html`: page content
- `style.css`: district styling and responsive layout
- `app.js`: search, results, map behavior, and school links
- `engine.js`: the 58 supplied grid assignment rules and point-in-polygon logic
- `data/grids.geojson`: 130 context grid shapes, including all 58 assignment grids
- `susd-logo.png`: district logo without the anniversary number
- `leaflet.js`, `leaflet.css`, `images/`, `LEAFLET-LICENSE.txt`: Leaflet 1.9.4
- `.nojekyll`: optional GitHub Pages static-file marker (may be hidden in Finder)

All site asset paths are relative, so the site works under a GitHub project URL. No npm install, build process, API key configuration, or server application is required. Open through GitHub Pages or a local HTTP server; double-clicking index.html may block loading the grid data.

## Review status

The visible development notice is intentional. Geometry was extracted from the district's georeferenced Option C / Model C-1a PDF (August 14, 2026 revision). School paths follow the supplied reassignment table. Final adoption, student exceptions, and address accuracy still need district validation. The 25-meter near-edge warning is a conservative review threshold, not an accuracy guarantee. The additional KML files have not replaced the grid geometry.

Source PDF: https://resources.finalsite.net/images/v1787087284/susdorg/ochdjowa1vhsiiacxjil/OptionCBoundaryModelC-1a.pdf

## External services and privacy

Address searches are sent directly to Esri World Geocoding after the visitor presses Find schools. The app requires the visitor to select a matched address. Map tiles are supplied by Esri and fonts by Google Fonts. These services require Internet access and are subject to their own availability and terms. The application does not store searches or include analytics; the previously discussed GA4 measurement ID has not been installed.

This package excludes internal emails, residential-address screenshots, research files, and unverified KML comparisons. No sample home address is prefilled.

## Updating the site

Upload changed files and commit them to the publishing branch. GitHub Pages redeploys automatically. Keep school rules in `engine.js` and school URLs in `app.js` synchronized. Retain Leaflet attribution and its license.
