module.exports = {
  mode: process.env.NODE_ENV || 'production',
  entry: {
    index: __dirname + '/src/index.ts'
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: __dirname + '/src',
        loader: 'ts-loader'
      },
      {
        test: /\.s?css$/,
        include: __dirname + '/src',
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              camelCase: true,
              localIdentName: '[hash:base64:8]',
              modules: true,
              sourceMap: false
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  },
  externals: [
    {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react'
      }
    }
  ]
};
