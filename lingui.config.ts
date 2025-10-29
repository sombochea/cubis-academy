const config = {
  locales: ['km', 'en'],
  sourceLocale: 'km',
  catalogs: [
    {
      path: '<rootDir>/locales/{locale}/messages',
      include: ['app', 'components', 'lib'],
    },
  ],
  format: 'po',
};

export default config;
