#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/online
mkdir -p public
cp WZ-MANAGE-PRO-FUNCTIONAL-UI/app/page.tsx app/page.tsx
cp WZ-MANAGE-PRO-FUNCTIONAL-UI/app/globals.css app/globals.css
cp WZ-MANAGE-PRO-FUNCTIONAL-UI/app/modules/[key]/page.tsx app/modules/[key]/page.tsx
cp WZ-MANAGE-PRO-FUNCTIONAL-UI/public/wilzam.png public/wilzam.png
echo "=== BUILD ==="
npm run build
echo "=== GIT ==="
git add app/page.tsx app/globals.css app/modules/[key]/page.tsx public/wilzam.png
git commit -m "Make all WZ Manage Pro features clickable"
git push origin main
echo "=== SELESAI ==="
git log -1 --oneline
