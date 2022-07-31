FROM node:lts-alpine3.16

RUN apk add --no-cache python3 git py3-pip

#RUN git clone https://github.com/healeycodes/bandwidth-checker.git /app
COPY ./src/ /app

WORKDIR /app

RUN cd client && pip install requests && pip install speedtest-cli

RUN cd server && npm install

COPY ./cron.txt ./
RUN /usr/bin/crontab /app/cron.txt

RUN touch /app/db.json

EXPOSE 3000
CMD /usr/sbin/crond && node ./server/server
