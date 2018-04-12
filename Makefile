install:
		npm install
start:
		npm run start
develop:
		npm run webpack-serve
build:
		rm -rf dist
		NODE_ENV=production npm run webpack
surge:
		surge --domain rss-reader-omxx.surge.sh
lint:
		npm run eslint .
test:
		npm test