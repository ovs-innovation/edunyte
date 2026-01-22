import axios from "axios";

const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const TRANSLATE_API_URL = "https://translation.googleapis.com/language/translate/v2";

const translateWithGoogle = async (text, targetLang, sourceLang = "en") => {
  try {
    if (!GOOGLE_TRANSLATE_API_KEY) {
      console.warn("Google Translate API key not configured. Using fallback.");
      return text;
    }

    const response = await axios.post(
      `${TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        q: text,
        target: targetLang,
        source: sourceLang,
        format: "text",
      }
    );

    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Google Translate error:", error.response?.data || error.message);
    throw error;
  }
};

export const translateText = async (req, res, next) => {
  try {
    const { text, sourceLang = "en", targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({
        success: false,
        message: "Text and targetLang are required",
      });
    }

    if (targetLang === sourceLang || targetLang === "en") {
      return res.json({
        success: true,
        translatedText: text,
        sourceLang,
        targetLang,
      });
    }

    try {
      const translatedText = await translateWithGoogle(text, targetLang, sourceLang);
      res.json({
        success: true,
        translatedText,
        sourceLang,
        targetLang,
      });
    } catch (error) {
      console.error('Translation error:', error);
      res.json({
        success: true,
        translatedText: text,
        sourceLang,
        targetLang,
        fallback: true,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const translateBatch = async (req, res, next) => {
  try {
    const { texts, sourceLang = "en", targetLang } = req.body;

    if (!texts || !Array.isArray(texts) || !targetLang) {
      return res.status(400).json({
        success: false,
        message: "Texts array and targetLang are required",
      });
    }

    if (targetLang === sourceLang || targetLang === "en") {
      return res.json({
        success: true,
        translatedTexts: texts,
        sourceLang,
        targetLang,
      });
    }

    try {
      const translatedTexts = await Promise.all(
        texts.map(async (text) => {
          try {
            return await translateWithGoogle(text, targetLang, sourceLang);
          } catch (error) {
            console.error(`Translation error for text: ${text}`, error);
            return text;
          }
        })
      );

      res.json({
        success: true,
        translatedTexts,
        sourceLang,
        targetLang,
      });
    } catch (error) {
      console.error('Batch translation error:', error);
      res.json({
        success: true,
        translatedTexts: texts,
        sourceLang,
        targetLang,
        fallback: true,
      });
    }
  } catch (err) {
    next(err);
  }
};

