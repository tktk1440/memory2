#!/bin/sh
# Non-interactive bootstrap for headless / CI / Claude Code on the web.
# The upstream start.sh / start.ts is an interactive wizard; this script
# does the equivalent of selecting "rev 254" + "Set up as a development world"
# without any prompts, so the server can be started by a one-liner.

set -e

cd "$(dirname "$0")"

if ! command -v bun >/dev/null 2>&1; then
    echo "bun is required (https://bun.sh). Install and retry." >&2
    exit 1
fi

if [ ! -f server.json ]; then
    echo '{ "rev": "254" }' > server.json
    echo "wrote server.json (rev 254 = Sept 7 2004)"
fi

if [ ! -d node_modules ]; then
    bun install
fi

if [ ! -d engine/node_modules ]; then
    (cd engine && bun install)
fi

if [ ! -f engine/.env ]; then
    # Production mode is required in containerized / FD-limited environments
    # (e.g. Claude Code on the web): NODE_PRODUCTION=false spawns a DevThread
    # that fs.watch()es every content subdirectory (~800 inotify FDs), which
    # blows the 4096 ulimit -n cap that managed containers impose. Locally,
    # delete this file and re-run for the interactive setup wizard (which can
    # give you dev mode + live content reload).
    cat > engine/.env <<'ENV'
NODE_PRODUCTION=true
NODE_DEBUG=false
ENV
    echo "wrote engine/.env (production mode for FD-limited environments)"
fi

# Build content packs (idempotent — skips if data/pack/ is up to date).
if [ ! -d engine/data/pack ]; then
    (cd engine && bun run build)
fi

echo
echo "Bootstrap complete. Start the server with:"
echo "    (cd engine && bun start)"
echo "Then open http://localhost:8888/rs2.cgi"
