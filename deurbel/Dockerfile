FROM node:16

ENV refreshtoken = ''

RUN apt-get update && apt-get upgrade
RUN apt-get install -y ffmpeg

WORKDIR /usr/src/app

COPY . .

RUN chmod 704 start.sh

RUN npm install

EXPOSE 80

CMD [ "sh", "-c", "echo $refreshtoken > .refreshtoken && ./start.sh" ]

# usage: 
# execute the following command:
#
# curl https://oauth.ring.com/oauth/token -X POST
# -H 'Content-Type: application/x-www-form-urlencoded' 
#  -d 'grant_type=password&username=*****&password=*****&client_id=RingWindows&scope=client'
#
# copy the refresh token and insert in into the following command:
#
# docker run -d -p 8080:80 --name ringapi -e 'refreshtoken=...' ringapi:1.0