# Havelská

Mobilně orientovaná aplikace pro provoz jednoho apartmánu. Aktuální lokální řez obsahuje:

- přehled potvrzené připravenosti,
- inventuru prádla podle místa a stavu,
- ruční pobyty s pravidlem, že tři hosté znamenají přípravu pro čtyři,
- návrh dovozu a nákupu pro dvě nebo tři další přípravy,
- ochranu proti náhodnému spuštění nedokončené aplikace na Vercelu.

## Check-in pro cizineckou policii

V části **Hlášení** lze pro konkrétní pobyt vytvořit jednorázový odkaz. Hlavní
host přes něj vyplní údaje za 1 až 4 zahraniční hosty; aplikace je ukládá
zašifrovaně a připraví je pro ruční přepis do UbyPortu.

Před produkčním použitím nastav ve Vercelu tajnou proměnnou
`CHECKIN_DATA_ENCRYPTION_KEY` na náhodný 32byte Base64 klíč (`openssl rand -base64 32`).
Klíč nikdy neměň, dokud existují záznamy, které je nutné uchovávat — bez něj
nelze jejich obsah dešifrovat.

Neukládají se fotografie ani kopie dokladů. Digitální záznam je provozní kopie;
pro kontrolu je podle Policie ČR nutná také listinná, chronologicky vedená
domovní kniha / podepsané přihlašovací listy. Ubytování cizince se oznamuje do
3 pracovních dnů a při podnikatelském ubytování prostřednictvím UbyPortu.

## Google login pro hostitele

Dashboard podporuje přihlášení přes Google výhradně pro `rihaja@gmail.com`.
V Google Cloud vytvoř OAuth klienta typu **Web application** a mezi povolené
redirect URI přidej přesně `https://www.havelska.cz/api/auth/google/callback`.
Ve Vercelu nastav `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` a
`GOOGLE_OAUTH_REDIRECT_URI` se stejnou adresou. Google session je platná 30 dní;
heslo zůstává jako nouzová možnost přihlášení.

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

Lokální úložiště je pouze vývojový adaptér. Pro osobní údaje hostů používej
produkční databázi, šifrovací klíč uvedený výše a omezený přístup správce.
