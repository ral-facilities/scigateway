#!/bin/sh -eu

# Use a tempfile instead of sed -i so that only the file, not the directory needs to be writable
TEMPFILE="$(mktemp)"

# Set values in settings.json from environment variables
sed -e "s|\"auth-provider\": \".*\"|\"auth-provider\": \"$AUTH_PROVIDER\"|" \
    -e "s|\"authUrl\": \".*\"|\"authUrl\": \"$AUTH_URL\"|" \
    /usr/local/apache2/htdocs/settings.json > "$TEMPFILE"

cat "$TEMPFILE" > /usr/local/apache2/htdocs/settings.json
rm "$TEMPFILE"

# Run the CMD instruction
exec "$@"
