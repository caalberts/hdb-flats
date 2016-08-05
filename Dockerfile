FROM iron/node:dev

ADD dist/worker /worker
ADD dist/util /util

RUN npm install babel-runtime jStat lodash loess mathjs mongoose node-fetch
