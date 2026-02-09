export const getLanguageValue = (value: string | { en: string } | undefined, lang = "en"): string => {
  if (!value) return "";
  
  if (typeof value === "string") {
    return value;
  }
  
  if (typeof value === "object" && value !== null) {
    if (value[lang]) {
      return value[lang];
    }
    if (value.en) {
      return value.en;
    }
    const firstKey = Object.keys(value)[0];
    return firstKey ? value[firstKey] : "";
  }
  return "";
};

export const normalizeLanguageValue = (value: string | { en: string } | undefined): { en: string } => {
  if (!value) {
    return { en: "" };
  }
  
  if (typeof value === "string") {
    return { en: value };
  }
  
  if (typeof value === "object" && value !== null) {
    // If it already has 'en' property, return it
    if (value.en) {
      return { en: value.en };
    }
    // Otherwise, take the first value and map it to 'en'
    if (Object.keys(value).length > 0) {
      const firstValue = Object.values(value)[0];
      return { en: typeof firstValue === "string" ? firstValue : "" };
    }
  }
  
  return { en: "" };
};


