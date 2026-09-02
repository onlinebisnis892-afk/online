#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/online
mkdir -p public
cp wz-premium-update/app/page.tsx app/page.tsx
cp wz-premium-update/app/globals.css app/globals.css
cp wz-premium-update/public/wilzam.svg public/wilzam.svg
echo "Tampilan WZ premium terpasang."
npm run build
echo "BUILD SELESAI. Selanjutnya git add . && git commit -m 'Premium WZ dashboard redesign' && git push origin main"
