const DEFAULT_LANGUAGE = "en";

export const getLanguageValue = (value, lang = DEFAULT_LANGUAGE) => {
  if (!value) return "";
  
  if (typeof value === "string") {
    return value;
  }
  
  if (typeof value === "object" && value !== null) {
    if (value[lang]) {
      return value[lang];
    }
    if (value[DEFAULT_LANGUAGE]) {
      return value[DEFAULT_LANGUAGE];
    }
    const firstKey = Object.keys(value)[0];
    return firstKey ? value[firstKey] : "";
  }
  
  return "";
};

export const normalizeLanguageValue = (value) => {
  if (!value) {
    return { [DEFAULT_LANGUAGE]: "" };
  }
  
  if (typeof value === "string") {
    return { [DEFAULT_LANGUAGE]: value };
  }
  
  if (typeof value === "object" && value !== null) {
    if (!value[DEFAULT_LANGUAGE] && Object.keys(value).length > 0) {
      const firstValue = Object.values(value)[0];
      return { [DEFAULT_LANGUAGE]: firstValue || "" };
    }
    return value;
  }
  
  return { [DEFAULT_LANGUAGE]: "" };
};

export const transformLanguageFields = (data, fields) => {
  if (!data || !Array.isArray(fields)) return data;
  
  const transformed = Array.isArray(data) ? [...data] : { ...data };
  
  fields.forEach((field) => {
    if (Array.isArray(transformed)) {
      transformed.forEach((item) => {
        if (item && item[field]) {
          item[field] = getLanguageValue(item[field]);
        }
      });
    } else {
      if (transformed[field]) {
        transformed[field] = getLanguageValue(transformed[field]);
      }
    }
  });
  
  return transformed;
};


