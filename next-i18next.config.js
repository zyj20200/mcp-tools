/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['en', 'zh-CN'],
    localeDetection: false
  },
  defaultNS: 'common',
  localePath: require('path').resolve('../packages/web/i18n'),
  reloadOnPrerender: process.env.NODE_ENV === 'development'
};
