import { I18nOptions, I18nOptionsFactory } from 'nestjs-i18n';
import * as path from 'path';

export class I18nConfigService implements I18nOptionsFactory {
  createI18nOptions(): I18nOptions {
    return {
      fallbackLanguage: 'ru', 
      loaderOptions: {
        path: path.join(__dirname, '../../i18n/'), 
        watch: true,
      },
    };
  }
}
