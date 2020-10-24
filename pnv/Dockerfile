FROM hub.artifactory.gcp.anz/loadimpact/k6:0.25.1

#override to docker-local with docker build args for local testing
ARG env=onyx
# Copy the rest of your app's source code from your host to your image filesystem.
COPY . /pnv

# Set the working directory.
WORKDIR . /pnv

# Set environment value from env build arg
# Used in k6 config
ENV ENVIRONMENT=${env}

# Command that will run in the CI pnv K8s job
ENTRYPOINT  k6 run /pnv/sola/pnv.js --insecure-skip-tls-verify
