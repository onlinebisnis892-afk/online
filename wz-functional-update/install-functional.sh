#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/online
cp app/page.tsx app/page.tsx.backup-functional 2>/dev/null || true
cp lib/reports.ts lib/reports.ts.backup-functional 2>/dev/null || true
cp -r app/details app/details.backup-functional 2>/dev/null || true
cp -r app/modules/reports/employees app/modules/reports/employees.backup-functional 2>/dev/null || true
cp -r app/modules/transactions/new app/modules/transactions/new.backup-functional 2>/dev/null || true
cp -f wz-functional-update/app/page.tsx app/page.tsx
cp -f wz-functional-update/lib/reports.ts lib/reports.ts
mkdir -p app/details/[type] app/modules/reports/employees app/modules/transactions/new
cp -f wz-functional-update/app/details/[type]/page.tsx app/details/[type]/page.tsx
cp -f wz-functional-update/app/modules/reports/employees/page.tsx app/modules/reports/employees/page.tsx
cp -f wz-functional-update/app/modules/transactions/new/page.tsx app/modules/transactions/new/page.tsx
npx prisma generate
npm run build
git add app/page.tsx app/details app/modules/reports/employees app/modules/transactions/new lib/reports.ts
git commit -m "Make dashboard reports and transactions functional" || true
git push origin main
echo "======================================"
echo "SELESAI - cek Vercel"
echo "======================================"
