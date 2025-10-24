import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'jpeg-compressor': resolve(__dirname, 'jpeg-compressor.html'),
        'photo-resizer': resolve(__dirname, 'photo-resizer.html'),
        'qr-generator': resolve(__dirname, 'qr-generator.html'),
        'color-palette': resolve(__dirname, 'color-palette.html'),
        'email-extractor': resolve(__dirname, 'email-extractor.html'),
        'tweet-to-image': resolve(__dirname, 'tweet-to-image.html'),
        'invoice-generator': resolve(__dirname, 'invoice-generator.html'),
        'bangla-converter': resolve(__dirname, 'bangla-converter.html'),
        'land-converter': resolve(__dirname, 'land-converter.html'),
        'mfs-helper': resolve(__dirname, 'mfs-helper.html'),
        'financial-calculators': resolve(__dirname, 'financial-calculators.html'),
        'bd-tax-calculator': resolve(__dirname, 'bd-tax-calculator.html'),
      },
    },
  },
  plugins: [
    {
      name: 'copy-pwa-files',
      closeBundle() {
        const distDir = resolve(__dirname, 'dist');

        // Ensure dist directory exists
        if (!existsSync(distDir)) {
          mkdirSync(distDir, { recursive: true });
        }

        // Copy PWA files
        const filesToCopy = [
          'manifest.json',
          'sw.js',
          'sw-register.js',
          'pwa-update.css',
          'icon-72x72.png',
          'icon-96x96.png',
          'icon-128x128.png',
          'icon-144x144.png',
          'icon-152x152.png',
          'icon-167x167.png',
          'icon-192x192.png',
          'icon-384x384.png',
          'icon-512x512.png',
        ];

        filesToCopy.forEach(file => {
          const src = resolve(__dirname, file);
          const dest = resolve(distDir, file);
          try {
            copyFileSync(src, dest);
            console.log(`Copied ${file} to dist/`);
          } catch (err) {
            console.warn(`Warning: Could not copy ${file}:`, err.message);
          }
        });
      }
    }
  ]
})
