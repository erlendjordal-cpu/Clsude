# Claude Code i terminalen

Kort oppskrift for å kjøre Claude Code lokalt mot dette prosjektet.

## 1. Installer

Velg én metode.

**macOS / Linux / WSL (anbefalt):**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell:**

```powershell
irm https://claude.ai/install.ps1 | iex
```

**Windows CMD:**

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

**Homebrew (macOS):**

```bash
brew install --cask claude-code
```

**WinGet (Windows):**

```powershell
winget install Anthropic.ClaudeCode
```

Native-installasjonen (`install.sh` / `install.ps1` / `install.cmd`) oppdaterer seg selv i
bakgrunnen. Homebrew og WinGet gjør ikke det — der må du kjøre `brew upgrade claude-code`
eller `winget upgrade Anthropic.ClaudeCode` selv.

På Windows uten WSL: installer også [Git for Windows](https://git-scm.com/downloads/win),
ellers bruker Claude Code PowerShell i stedet for bash som skallverktøy.

Sjekk at det virket:

```bash
claude --version
```

## 2. Logg inn

```bash
claude
```

Første gang åpnes nettleseren for innlogging. Bruk Claude-abonnementet (Pro/Max/Team) eller
en Claude Console-konto. Innloggingen lagres, så dette gjøres bare én gang. Bytt konto
senere med `/login` inne i sesjonen.

## 3. Start i dette prosjektet

```bash
cd /sti/til/Clsude
claude
```

Claude leser `CLAUDE.md` → `AGENTS.md` automatisk ved oppstart, så regelen om at
Expo-dokumentasjonen for v56 skal sjekkes før koding gjelder også i terminalen.

## 4. Kommandoer du trenger i praksis

| Kommando            | Hva den gjør                                  |
| ------------------- | --------------------------------------------- |
| `claude`            | Start interaktiv sesjon                       |
| `claude "oppgave"`  | Start med en oppgave med én gang              |
| `claude -p "spm"`   | Kjør ett spørsmål og avslutt (bra i skript)   |
| `claude -c`         | Fortsett siste samtale i denne mappa          |
| `claude -r`         | Velg blant tidligere samtaler                 |

Inne i sesjonen:

| Kommando     | Hva den gjør                          |
| ------------ | ------------------------------------- |
| `/help`      | Vis alle kommandoer                   |
| `/clear`     | Tøm samtalehistorikken                |
| `/login`     | Bytt konto                            |
| `/exit`      | Avslutt (eller Ctrl+D to ganger)      |
| `Shift+Tab`  | Bytt tillatelsesmodus                 |

## 5. Kjøre appen mens Claude jobber

```bash
npm install
npx expo start        # eller npm run ios / npm run android / npm run web
```

Kopier `.env.example` til `.env` og fyll inn din egen `EXPO_PUBLIC_WEATHER_USER_AGENT`
(MET-API-et krever en identifiserbar user agent). `.env` er allerede i `.gitignore`.

## 6. Prosjektoppsettet

`.claude/settings.json` ligger i repoet og deles av alle som jobber her:

- **`enabledPlugins`** — Expo-pluginen fra den offisielle plugin-markedsplassen slås på automatisk.
- **`permissions.allow`** — vanlige, ufarlige kommandoer i dette prosjektet (npm-skript,
  `npx expo`, typesjekk, lesende git-kommandoer) kjøres uten at du må godkjenne hver gang.

Egne, personlige innstillinger legger du i `.claude/settings.local.json` — den er ignorert
av git og overstyrer den delte fila.
