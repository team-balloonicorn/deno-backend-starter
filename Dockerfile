FROM denoland/deno:alpine-1.32.1

WORKDIR /app
USER deno

# Copy all the app code into the container image.
COPY . .

# Download, precompile, and cache everything the application needs.
RUN deno cache src/main.ts

# The port that your application listens to.
EXPOSE 8000
CMD ["run", "--allow-env", "--allow-read=.", "--allow-net", "src/main.ts"]
