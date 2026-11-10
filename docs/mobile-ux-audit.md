# Mobile-first UX audit aplikace Havelská

## Závěr

Funkčně je aplikace dál, než naznačovala starší lokální kopie. Už obsahuje:

- kalendář a detail pobytu,
- šablony zpráv s dosazováním údajů,
- generování a kopírování check-in odkazu,
- šifrované ukládání údajů hostů,
- správu veřejného guest guide,
- výpočet poplatku po měsících.

Hlavní problém není nedostatek funkcí, ale jejich rozložení. Nejčastější akce jsou schované v několika různých sekcích a na mobilu se k nim uživatel dostává přes dlouhý kalendář nebo horizontální navigaci.

## Doporučené pořadí obsahu na Přehledu

1. **Aktuální / nejbližší pobyt** – termín, počet hostů a tři hlavní akce.
2. **Co je potřeba vyřídit** – pouze nehotové úkoly.
3. **Rychlé nástroje** – zprávy, guest guide a poplatek za minulý měsíc.
4. **Kalendář** – na mobilu kompaktní měsíc a agenda; na desktopu plná čtyřtýdenní osa.

### Akce u nejbližšího pobytu

- `Zpráva hostům` otevře detail rovnou na šablonách zpráv.
- `Check-in odkaz` otevře příslušnou kartu v Hlášeních.
- `Detail pobytu` zobrazí checklist, příjezd a klíče.

Stav karty má ukázat například `Check-in 1/2`, `čeká na UbyPort` nebo `hotovo`. Uživatel tak nemusí otevírat Hlášení jen kvůli kontrole.

## Zprávy hostům

Stávající řešení – vygenerovat text a zkopírovat jej do Airbnb – je pro první verzi správné. Airbnb iCal neposkytuje API pro odesílání zpráv.

Doplnit:

- jméno hlavního hosta jako editovatelnou hodnotu pobytu místo obecného `there`;
- placeholder `{guestInfoLink}` s automatickým odkazem na `/guest-info`;
- upozornění, pokud zpráva stále obsahuje nedosazený placeholder;
- na mobilu zobrazit mustry jako kompaktní seznam a celý text otevřít až po klepnutí;
- tlačítko `Kopírovat a označit jako odeslané`, aby nebyly nutné dva kroky.

## Online check-in

Generování i ukládání už funguje. Zpřehlednit:

- tlačítko pro vytvoření odkazu zobrazit přímo v detailu pobytu;
- po vytvoření nabídnout `Kopírovat odkaz` a `Zkopírovat zprávu s odkazem`;
- stav `0/2`, `1/2`, `2/2` zobrazovat na kartě pobytu i na dashboardu;
- nahradit varování „počet se neshoduje“ akcí `Zneplatnit a vytvořit nový pro X hostů`;
- Domovní knihu ponechat jako samostatný trvalý archiv nad stejnými šifrovanými daty.

## Poplatek pro město

Současný výpočet vychází z počtu hostů u pobytu. Přesnější bude navázat ho na skutečně uložené hosty z Domovní knihy a jejich datum narození / osvobození.

Na Přehledu zobrazit vždy předchozí měsíc:

- vypočtenou částku;
- počet pobytů a osobonocí;
- varování, když některému pobytu chybí hosté v Domovní knize;
- akce `Excel pro město`, `Označit hlášení` a `Označit platbu`.

Dokud se počet uložených hostů neshoduje s počtem osob v pobytu, výsledek označit jako **neúplný odhad**, ne jako konečnou částku.

## Guest guide

Veřejný odkaz je stabilní `/guest-info`, takže není nutné měnit URL. Pod pojmem „aktualizace linku“ má aplikace řešit hlavně aktualizaci obsahu a vložení aktuálního odkazu do zpráv.

Doplnit na Přehled jednu kompaktní kartu:

- `Otevřít jako host`;
- `Kopírovat odkaz`;
- `Upravit obsah`;
- datum poslední změny.

## Kalendář

Čtyřtýdenní pruh je užitečný na desktopu, ale na telefonu vyžaduje horizontální posun. Doporučení:

- mobil: klasická měsíční mřížka + agenda nejbližších pobytů;
- desktop: ponechat současnou čtyřtýdenní osu;
- klepnutí na obsazený den otevře detail pobytu;
- barevně rozlišovat příjezd, probíhající pobyt, odjezd a výměnu;
- staré pobyty zobrazovat až po zapnutí `Historie`.

## Navigace

Pět položek v horizontální mobilní navigaci je hraničních. Doporučené mobilní členění:

- `Přehled`
- `Pobyty`
- `Hosté`
- `Více`

Sekce `Hosté` sdruží Hlášení, check-in odkazy a Domovní knihu. V `Více` budou Poplatky, Šablony zpráv, Guest guide a Inventář. Desktop může dál používat širší horní navigaci.

## Pořadí implementace

1. Domovní kniha nad existujícími šifrovanými daty.
2. Akční karta aktuálního pobytu na Přehledu.
3. Rychlé akce pro zprávu, check-in a guest guide.
4. Kontrola úplnosti měsíčního poplatku podle Domovní knihy a generování městského Excelu.
5. Mobilní navigace `Přehled / Pobyty / Hosté / Více`.
