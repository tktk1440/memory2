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
# Memoryscape: 2x XP rate (vanilla rev 254 is 1). Bump higher to speed up
# leveling for demos. Engine reads this directly; no code change needed.
NODE_XPRATE=2
# Skip pack-data checksum verification. Required because Memoryscape adds
# the compass to obj.pack, which changes the .obj checksum away from the
# vanilla LostCity value the engine ships with. `bun start` re-runs this
# check on every boot, so it has to be off persistently — not just at
# build time.
BUILD_VERIFY=false
ENV
    echo "wrote engine/.env (production mode for FD-limited environments)"
fi

# Build content packs (idempotent — skips if data/pack/ is up to date).
# BUILD_VERIFY=false is needed because we've modified upstream content
# (added items, edited login script); the build's checksum check assumes
# pristine LostCity content.
if [ ! -d engine/data/pack ]; then
    (cd engine && BUILD_VERIFY=false bun run build)
fi

echo
echo "Bootstrap complete. Start the server with:"
echo "    (cd engine && bun start)"
echo "Then open http://localhost:8888/rs2.cgi"
