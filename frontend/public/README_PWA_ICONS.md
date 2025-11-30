# PWA Icons Setup Guide

This application requires PWA icons for proper installation and display on devices.

## Required Icons

You need to create the following icon files in the `public/` directory:

1. **pwa-192x192.png** - 192x192 pixels (required)
2. **pwa-512x512.png** - 512x512 pixels (required)

## Icon Design Guidelines

- **Format**: PNG with transparency
- **Design**: Should represent AgroMarketHub (e.g., farm/agriculture theme)
- **Colors**: Use the theme color (#16a34a - green) as primary
- **Style**: Simple, recognizable icon that works at small sizes
- **Background**: Can be transparent or solid color

## Quick Setup

### Option 1: Use an Icon Generator
1. Visit https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload your logo/icon
3. Generate PWA icons
4. Download and place in `public/` folder

### Option 2: Create Manually
1. Design your icon at 512x512 pixels
2. Export as PNG
3. Create 192x192 version (resize from 512x512)
4. Place both files in `public/` folder

### Option 3: Use Placeholder Icons
For development, you can use simple colored squares:
- Create a 192x192 green square (#16a34a)
- Create a 512x512 green square (#16a34a)
- Save as `pwa-192x192.png` and `pwa-512x512.png`

## Verification

After adding icons:
1. Build the app: `npm run build`
2. Test PWA installation on a device
3. Check that icons appear in:
   - App launcher/home screen
   - Splash screen
   - Browser install prompt

## Additional Resources

- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Icon Design Guidelines](https://developers.google.com/web/fundamentals/web-app-manifest/#icons)

