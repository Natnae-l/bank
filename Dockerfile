FROM node:alpine3.18

RUN mkdir /app

WORKDIR /app

COPY . .

RUN npm install

ENV port=5000 \
    db="mongodb+srv://Natnael:e840qPAaOMYxgeSC@cluster0.vs0kmkg.mongodb.net/one-tap?retryWrites=true&w=majority&appName=Cluster0" \
    secretJWT="sc$nc483nr4#z" \
    gatewayId=122123

EXPOSE 5000

CMD [ "node", "app.js" ]