# EverClean website

Static website for EverClean Exterior Cleaning Ltd.

## Run locally

Open `index.html` in a browser. For the best local preview, install the VS Code **Live Server** extension, then right-click `index.html` and choose **Open with Live Server**.

## Required image files

Place the supplied EverClean assets in `images/` using these filenames:

- `logo.png` (original source)
- `logo-transparent.png` (transparent cropped version used by the website)
- `hero-window-cleaning.jpg`
- `residential-1.jpg`
- `render-cleaning-1.jpg`
- `render-before-after.jpg`
- `pressure-washing-1.jpg`
- `commercial-1.jpg`

The site also supports future asset additions without changing its structure.

## Contact and quote requests

`contact.php` sends website enquiries to `kevin@evercleanwcs.co.uk`, then redirects visitors to `thank-you.html`. It accepts up to three optional JPG, PNG or WebP photos (maximum 5 MB each). Test the form after every deployment; some hosting accounts require email sending to be enabled in the hosting control panel.

## Deployment

Upload the contents of this project (not the containing folder) to Hostinger's `public_html` folder.
