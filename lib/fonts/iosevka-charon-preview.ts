import localFont from 'next/font/local'

export const iosevkaCharonPreview = localFont({
  src: [
    {
      path: '../../public/fonts/iosevka-charon/iosevka-charon-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/iosevka-charon/iosevka-charon-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-p-iosevka-charon',
  display: 'swap',
})
