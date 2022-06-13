# attendance

> Nuxt + Electron

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install

# development with vue devtools
$ npm run dev

# build for production
$ npm run build

For detailed explanation on how things work, checkout [Nuxt.js](https://github.com/nuxt/nuxt.js), [Electron.js](https://electronjs.org/), and [electron-builder](https://www.electron.build/).

```

## Rebuild node-sass

```
npm config set msvs_version 2015 --global
```

Go to `/node_modules/node-sass` directory
```
node-gyp rebuild --target=11.4.7 --arch=x64 --dist-url=https://atom.io/download/atom-shell --verbose --libsass_ext= --libsass_cflags= --libsass_ldflags= --libsass_library=
```
or
```
../.bin/node-gyp rebuild --target=11.4.7 --arch=x64 --dist-url=https://atom.io/download/atom-shell --verbose --libsass_ext= --libsass_cflags= --libsass_ldflags= --libsass_library=
```
11.4.7 is Electron version

The output will be inside build/Release/binding.node Then you can copy that file into your `node_modules/node-sass/vendor/<some-thing>` folder.

## Rebuild zkfp
```
cd c_addons/zkfp

node-gyp configure build

node-gyp rebuild --target=11.4.7 --arch=x64 --dist-url=https://electronjs.org/headers
```
if error `iojs.lib`, delete `/usr/.node-gyp` and re-install `npm install node-gyp -g`
