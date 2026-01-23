# Locale Sync Script

This script automatically creates and updates locale files based on the base `en.json` file.

## Usage

### Basic Sync (Structure Only)
```bash
npm run sync-locales
```

This will:
- Create missing locale files with English text (placeholder)
- Update existing locale files with any new keys from `en.json`
- Preserve existing translations

### Sync with Auto-Translation
```bash
npm run sync-locales:translate
```

This will:
- Create missing locale files with auto-translated content
- Update existing locale files with auto-translated new keys
- Requires backend translation API to be running

## How It Works

1. Reads `en.json` as the base/source file
2. Extracts all language codes from `languageConfig.ts`
3. For each language:
   - If file doesn't exist: Creates it (with translation if `--translate` flag is used)
   - If file exists: Merges new keys from `en.json` while preserving existing translations
4. Reports created/updated files

## Example Output

```
🌍 Syncing locale files...

📄 Base locale: en.json
📁 Locales directory: /path/to/locales

  ✓ Created nl.json
  ✓ Updated de.json
  ⊘ fr.json (no changes)

✅ Sync complete!
   Created: 1 files
   Updated: 1 files
   Skipped: 1 files (no changes)
   Total: 12 languages
```

## Notes

- The script preserves existing translations
- Only adds missing keys from base `en.json`
- Auto-translation requires backend API to be running
- English locale is always synced to match base exactly

