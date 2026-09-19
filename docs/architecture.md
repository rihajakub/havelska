# Architektura první etapy

## Rozdělení odpovědností

- `src/domain` obsahuje typy a čistá pravidla výpočtu. Nezávisí na Next.js ani úložišti.
- `src/data` poskytuje lokální vývojové úložiště. Ve výrobní etapě jej nahradí databázový adaptér.
- `src/app` obsahuje stránky a serverové akce.
- `.data/local.json` uchovává pouze lokální provozní data a je ignorovaný Gitem.

## Záměrně odložené části

- Google OAuth a povolený účet vlastníka,
- spravovaný Postgres a migrace,
- Airbnb iCal,
- úklidové checklisty, závady a historie pohybů,
- online check-in, poplatky a Ubyport.

Barevné varianty povlečení jsou v prvním řezu popsány v jedné souhrnné položce, aby se pět skutečných sad nezapočítalo dvakrát. Rozdělení variant bude samostatná změna datového modelu s pravidlem zastupitelnosti.

Produkční Vercel zobrazí uzamčenou obrazovku, dokud není explicitně nastaveno `ENABLE_PRODUCTION_APP=true`. Tato proměnná se nesmí nastavit před dokončením autentizace a produkční databáze.
