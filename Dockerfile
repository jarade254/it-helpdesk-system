FROM node:20-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
ENV PORT=3000
EXPOSE 3000
RUN useradd --uid 1001 --create-home appuser \
    && chown -R appuser:appuser /usr/src/app
USER appuser
CMD ["node", "server.js"]