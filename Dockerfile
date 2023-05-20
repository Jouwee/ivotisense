FROM node:18.14.2-alpine
WORKDIR /usr/src/app
# Instala dependências
#RUN apk update && apk upgrade && \
#apk add --no-cache bash git openssh bind-tools tcpdump
RUN npm install -g forever
COPY package*.json ./
# To handle 'not get uid/gid'
#RUN npm config set unsafe-perm true
RUN npm install
COPY . .
RUN npm run build
EXPOSE 80
CMD forever -c "npm run prod" ./
