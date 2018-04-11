install:
		npm install
start:
		npm run start
develop:
		npm run webpack-serve
build:
		rm -rf dist
		NODE_ENV=production npm run webpack
lint:
		npm run eslint .
test:
		npm test