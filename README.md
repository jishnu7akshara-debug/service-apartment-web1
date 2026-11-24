# Northlight Residences (Service Apartment Web Two)

Client-demo template for a serviced-apartment operator with corporate and long-stay guests (Bengaluru setting). Plain HTML, CSS and JavaScript, no build step. GSAP + ScrollTrigger and Lenis are bundled in `js/vendor`.

## Preview

    npx serve .

## What moves
- Loader counts up to 365 nights, then lifts away.
- Hero is a working stay calculator: drag from 1 night to 1 year, pick apartment size and building, and the nightly rate, total, discount and what's included update live.
- The tour film widens from a rounded frame to full bleed as you scroll.
- Apartment sizes stack as sticky cards; the card underneath shrinks and dims.
- Weekday timeline draws its line while photos slide in from alternating sides.
- Locations scroll sideways in a pinned strip with parallax inside each photo.
- Amenity tiles have inner parallax. FAQ uses native accordions.
- `prefers-reduced-motion` turns the motion off.

## Customise for a client
- Prices and discount tiers: `BASE`, `AREA`, `tier()` at the top of `js/main.js`. Update the "From" figures on the apartment cards to match.
- WhatsApp number: `WHATSAPP` in `js/main.js`, plus phone links in `index.html`.
- Colours: variables at the top of `css/styles.css`.
- Photos and video: replace files in `assets/img` and `assets/video`, keeping the names.

## Deploy
Push to GitHub and import in Vercel (`vercel.json` included), or drag the folder into Netlify.
