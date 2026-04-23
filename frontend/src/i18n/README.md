# Scalable Multi-Language System with Auto-Translation

This system provides a scalable language solution with auto-translation capabilities.

## Features

- **Scalable Language Configuration**: Easy to add new languages
- **Auto-Translation**: Automatically translates content from English (base language)
- **Translation Caching**: Caches translations to reduce API calls
- **Dynamic Language Loading**: Languages are loaded on-demand
- **English as Base**: All content is stored in English, other languages are auto-translated

## Adding New Languages

### Step 1: Add Language to Configuration

Edit `frontend/src/i18n/languageConfig.ts`:

```typescript
export const LANGUAGES: Record<string, Language> = {
  // ... existing languages
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    enabled: true,
  },
}
```

### Step 2: Create Locale File (Optional)

Create `frontend/src/i18n/locales/es.json` for static translations:

```json
{
  "common": {
    "login": "Iniciar sesión",
    "logout": "Cerrar sesión",
    "buy_now": "Comprar ahora",
    "price": "Precio",
    "language": "Idioma",
    "currency": "Moneda"
  }
}
```

### Step 3: Enable/Disable Languages

Set `enabled: true/false` in `languageConfig.ts` to show/hide languages in the switcher.

## Auto-Translation

### For UI Text

The system automatically translates UI text using the translation service. Missing translations fall back to English.

### For Dynamic Content

Use the `useAutoTranslate` hook:

```typescript
import { useAutoTranslate } from '../hooks/useAutoTranslate'

const MyComponent = () => {
  const courseData = { title: "React Course", description: "Learn React" }
  const { translatedData } = useAutoTranslate(courseData)
  
  return <div>{translatedData.title}</div>
}
```

### For Single Text

```typescript
import { useAutoTranslateText } from '../hooks/useAutoTranslate'

const MyComponent = () => {
  const { translatedText } = useAutoTranslateText("Hello World")
  return <div>{translatedText}</div>
}
```

## Backend Setup

### 1. Add Google Translate API Key

Add to `.env`:

```
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

### 2. Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Cloud Translation API
3. Create credentials (API Key)
4. Add the key to your `.env` file

### Alternative Translation Services

You can modify `backend/controllers/translationController.js` to use:
- DeepL API
- Microsoft Translator
- AWS Translate
- Any other translation service

## Translation Caching

Translations are cached in localStorage for 7 days to:
- Reduce API calls
- Improve performance
- Lower costs

Clear cache: `clearTranslationCache()` from `translationService.ts`

## Language Priority

1. Static translations from locale files (if available)
2. Cached translations
3. Auto-translation from API
4. Fallback to English (base language)

## Supported Languages (Pre-configured)

- English (en) - Base language
- Hindi (hi)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Arabic (ar)

## API Endpoints

- `POST /api/translate` - Translate single text
- `POST /api/translate/batch` - Translate multiple texts

## Notes

- English is always the base language
- All content should be created in English
- Translations happen automatically when language changes
- Missing translations fall back to English gracefully

