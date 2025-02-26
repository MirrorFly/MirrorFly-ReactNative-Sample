import ar from './languages/ar.json';
import en from './languages/en.json';

/**
 * Create string set
 * You can create localized String set
 *
 * */
let stringSet = { en, ar };
let langugeCode = 'en';

export const setLanguageCode = (lngCode = 'en') => {
   langugeCode = lngCode;
};

export const getLanguageCode = () => langugeCode;

export const getStringSet = () => {
   return stringSet[langugeCode];
};

export const replacePlaceholders = (template, placeholders) => {
   // Unicode markers
   const LRM = '\u200E'; // Left-to-Right Mark
   const RLM = '\u200F'; // Right-to-Left Mark

   return template.replace(/{(\w+)}/g, function (match, key) {
      return `${LRM}${placeholders[key]}${RLM}`;
   });
};
