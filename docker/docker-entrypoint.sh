#!/bin/sh -eu

if [ ! -e /usr/local/apache2/htdocs/settings.json ]; then
    # file doesn't exist, so go with default settings file with env variable substitution
    # if file exists, we skip this code as that means we've been supplied one from a mount

    # Use a tempfile instead of sed -i so that only the file, not the directory needs to be writable
    TEMPFILE="$(mktemp)"

    # Set values in settings.example.json from environment variables
    sed -e "s|\"auth-provider\": \".*\"|\"auth-provider\": \"$AUTH_PROVIDER\"|" \
        -e "s|\"authUrl\": \".*\"|\"authUrl\": \"$AUTH_URL\"|" \
        /usr/local/apache2/htdocs/settings.example.json > "$TEMPFILE"

    cat "$TEMPFILE" > /usr/local/apache2/htdocs/settings.json
    rm "$TEMPFILE"
fi

# edit title if it is provided
set +u # temporarily allow for unset variables - as we test for this condition explicitly
if [ -n "$SCIGATEWAY_TITLE" ]; then
    # Use a tempfile instead of sed -i so that only the file, not the directory needs to be writable
    TEMPFILE="$(mktemp)"

    sed -e "s/<title>SciGateway<\/title>/<title>$SCIGATEWAY_TITLE<\/title>/" \
        /usr/local/apache2/htdocs/index.html > "$TEMPFILE"

    cat "$TEMPFILE" > /usr/local/apache2/htdocs/index.html
    rm "$TEMPFILE"
fi
set -u

# Run the CMD instruction
exec "$@"
