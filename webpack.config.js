const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'apps/gateway_api/i18n', to: 'apps/gateway_api/i18n' },
      ],
    }),
  ],
};
