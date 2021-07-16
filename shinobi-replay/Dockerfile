ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

ADD package.json /
ADD server.ts /
ADD replay.ts /

RUN echo "${ALPINE_MIRROR}/v3.11/main/" >> /etc/apk/repositories
RUN apk add nodejs --repository="http://dl-cdn.alpinelinux.org/alpine/v3.11/main/"
RUN apk add npm --repository="http://dl-cdn.alpinelinux.org/alpine/v3.11/main/"
RUN node --version
RUN apk add --no-cache jq yarn 
RUN yarn install --production
RUN yarn build
RUN ls -al

# Copy data for add-on
COPY run.sh /
COPY out.js /
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]