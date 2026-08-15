# 📋 Google Search Console Setup Guide — Pasty

## 1. Google Search Console Property

### Add Property
1. Go to [Google Search Console](https://search.google.com/search-console/welcome)
2. Click "Start Now" → "Add property"
3. Choose **Domain** property type
4. Enter: `pasty.ordob.com`
5. Choose **DNS verification** (most reliable):
   - Google provides a TXT record value (starts with `google-site-verification=`)
   - Add this TXT record to the DNS for `pasty.ordob.com`
   - Wait for propagation (5-30 minutes)
   - Click "Verify"

### OR HTML Tag Verification
1. Add `pasty.ordob.com` as a **URL prefix** property
2. Select "HTML tag" verification method
3. Copy the verification code (the content value in the meta tag)
4. Replace the empty content in `index.html`:
   ```html
   <meta name="google-site-verification" content="YOUR_CODE_HERE" />
   ```
5. Redeploy

## 2. Submit Sitemap

After verification:
1. In Search Console, go to **Sitemaps** (left sidebar)
2. Enter `sitemap.xml` in the "Add a new sitemap" field
3. Click "Submit"
4. Monitor for errors under **Coverage** report

## 3. Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Sign in with Microsoft account
3. Add `https://pasty.ordob.com/`
4. Choose "Configure my domain" → "Option 1: Add a CNAME record"
   - OR "Option 2: Add a metatag"
   - Copy Bing verification code into `index.html`:
   ```html
   <meta name="msvalidate.01" content="YOUR_BING_CODE_HERE" />
   ```
5. Add sitemap: `https://pasty.ordob.com/sitemap.xml`

## 4. Google Analytics Integration

Ensure `VITE_GA_MEASUREMENT_ID` is set in Vercel Environment Variables:
- Key: `VITE_GA_MEASUREMENT_ID`
- Value: `G-XXXXXXXXXX` (from GA4 property)

This also serves as an alternative GSC verification method if the GA property is already verified.

## 5. Post-Verification Checklist

- [ ] Property verified in GSC
- [ ] Sitemap submitted and 0 errors
- [ ] Coverage report: 0 critical errors
- [ ] Core Web Vitals report: good status
- [ ] Manual actions: no issues
- [ ] Bing Webmaster Tools: property verified
