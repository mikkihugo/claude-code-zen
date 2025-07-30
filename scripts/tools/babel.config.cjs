module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '20',
        },
        modules: 'auto',
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: '20',
            },
            modules: 'auto',
          },
        ],
      ],
    },
  },
};
