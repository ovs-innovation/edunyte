import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import currencyCodes from 'currency-codes';
import iso6391 from 'iso-639-1';
import { countries as countriesListData } from 'countries-list';

countries.registerLocale(enLocale as any);

function getEmojiFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🏳️';
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🏳️';
  }
}

export interface CountryData {
  isoCode: string;
  name: string;
  flagEmoji: string;
  currencyCode: string;
  languages: string[];
  phoneCode?: string;
}

const countryDataCache = new Map<string, CountryData>();

function getCurrencyForCountry(countryCode: string): string {
  try {
    const countryInfo = countriesListData[countryCode as keyof typeof countriesListData];
    const rawCurrency = countryInfo?.currency;
    const currencyCode =
      Array.isArray(rawCurrency) ? (rawCurrency[0] as string | undefined) : (rawCurrency as string | undefined);
    if (currencyCode) {
      const currency = currencyCodes.code(currencyCode);
      return currency?.code || currencyCode || 'USD';
    }
  } catch {
  }
  return 'USD';
}

function getLanguagesForCountry(countryCode: string): string[] {
  try {
    const countryInfo = countriesListData[countryCode as keyof typeof countriesListData];
    if (countryInfo?.languages && Array.isArray(countryInfo.languages)) {
      return countryInfo.languages.map((lang: string) => {
        const langName = iso6391.getName(lang);
        return langName || lang;
      });
    }
  } catch {
  }
  return [];
}

function getPhoneCodeForCountry(countryCode: string): string | undefined {
  try {
    const countryInfo = countriesListData[countryCode as keyof typeof countriesListData];
    const rawPhone = countryInfo?.phone as unknown;
    if (!rawPhone) return undefined;
    if (Array.isArray(rawPhone)) {
      return String(rawPhone[0]);
    }
    return String(rawPhone);
  } catch {
    return undefined;
  }
}

function buildCountryData(code: string): CountryData {
  const name = countries.getName(code, 'en') || code;
  const flagEmoji = getEmojiFlag(code);
  const currencyCode = getCurrencyForCountry(code);
  const languages = getLanguagesForCountry(code);
  const phoneCode = getPhoneCodeForCountry(code);

  return {
    isoCode: code,
    name,
    flagEmoji,
    currencyCode,
    languages,
    phoneCode,
  };
}

export function getAllCountries(): CountryData[] {
  const codes = countries.getAlpha2Codes();
  return Object.keys(codes)
    .map((code) => {
      if (countryDataCache.has(code)) {
        return countryDataCache.get(code)!;
      }
      const data = buildCountryData(code);
      countryDataCache.set(code, data);
      return data;
    })
    .filter((country) => country.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCountryByCode(code: string): CountryData | null {
  if (!code || code.length !== 2) return null;

  const upperCode = code.toUpperCase();
  if (countryDataCache.has(upperCode)) {
    return countryDataCache.get(upperCode)!;
  }

  const name = countries.getName(upperCode, 'en');
  if (!name) return null;

  const data = buildCountryData(upperCode);
  countryDataCache.set(upperCode, data);
  return data;
}

export function getCountryFlag(code: string): string {
  return getEmojiFlag(code);
}

export function getCurrencies(): Array<{ code: string; name: string }> {
  return currencyCodes.data.map((currency) => ({
    code: currency.code,
    name: currency.currency || currency.code,
  }));
}

export function getLanguages(): Array<{ code: string; name: string; nativeName: string }> {
  return iso6391.getAllCodes().map((code) => {
    const upperCode = code.toUpperCase();
    return {
      code: upperCode,
      name: iso6391.getName(code) || upperCode,
      nativeName: iso6391.getNativeName(code) || upperCode,
    };
  });
}

