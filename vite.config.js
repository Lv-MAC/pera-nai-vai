import { defineConfig } from 'vite'
import { resolve } from 'path'

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
})
