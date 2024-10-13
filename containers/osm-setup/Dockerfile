FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y \
    osmctools \
    curl \
    ca-certificates

WORKDIR /app
COPY ./entrypoint.sh /app/entrypoint.sh
#     apt-get -y install curl ca-certificates openjdk-17-jdk
#
# RUN curl -fL https://github.com/openstreetmap/osmosis/releases/download/0.49.2/osmosis-0.49.2.tar -o osmosis.tar && \
#     tar -xf osmosis.tar && \
#     rm -rf osmosis.tar
#
# RUN \
#     cd "$(find / -type d -name 'osmosis*')/bin" && echo $(pwd) &&\
#     chmod a+x osmosis && \
#     mv osmosis /usr/local/bin/osmosis
