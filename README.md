# Havelská

Mobilně orientovaná aplikace pro provoz jednoho apartmánu. Aktuální lokální řez obsahuje:

- přehled potvrzené připravenosti,
- inventuru prádla podle místa a stavu,
- ruční pobyty s pravidlem, že tři hosté znamenají přípravu pro čtyři,
- návrh dovozu a nákupu pro dvě nebo tři další přípravy,
- ochranu proti náhodnému spuštění nedokončené aplikace na Vercelu.

## Lokální spuštění

Požadován je Node.js 20.9 nebo novější.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Otevři `http://localhost:3000`. Provozní data se při prvním spuštění vytvoří v `.data/local.json`; adresář se neposílá do Gitu.

## Kontroly

```bash
npm test
npm run typecheck
npm run build
```

## Bezpečnost a další etapa

Lokální úložiště je pouze vývojový adaptér. Produkční nasazení zůstává uzamčené, dokud nebude přidáno Google přihlášení s allowlistem a trvalá spravovaná databáze. Do lokálních dat nyní nepatří osobní ani dokladové údaje hostů.

