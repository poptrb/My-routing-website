FROM arm64v8/traefik:latest
##RUN apk add libcap apk-file strace

# Set root's shell to nologin.
RUN sed -i -E s%:[^:]+$%:/sbin/nologin% /etc/passwd

# Create unprivileged user.
RUN adduser -u 222 -h /nonexistent -s /sbin/nologin -DH -g Traefik traefik

# Initialize directories and permissions.
RUN mkdir -p /data
RUN chown -R traefik:traefik /data

# Run as unprivileged user.
USER traefik:traefik
