# memory2 — an old-school RuneScape clone

A fork of [LostCityRS](https://github.com/LostCityRS) (the 2004scape project)
that we intend to reskin, extend with new content, and tweak mechanically.
Upstream targets a faithful reproduction of the **18 May 2004 → 7 Sept 2004**
Old School RuneScape builds. This fork starts from revision **254**
(7 Sept 2004 — the most content-complete browser-playable revision).

## Repo layout

The three upstream subprojects are **vendored** here (their `.git` dirs
removed) so the whole game is editable from a single repository:

| Path         | Source                          | What it is                            |
|--------------|---------------------------------|---------------------------------------|
| `engine/`    | `LostCityRS/Engine-TS@254`      | Game server (TypeScript / Bun)        |
| `content/`   | `LostCityRS/Content@254`        | Assets + RuneScript (`.rs2`) game logic |
| `webclient/` | `LostCityRS/Client-TS@254`      | Browser client (TypeScript)           |

A prebuilt `webclient` bundle is already shipped in `engine/public/client/client.js`,
so you don't need to rebuild the webclient just to play.

## Quickstart (headless / Claude Code on the web)

```sh
./bootstrap.sh
(cd engine && bun start)
# → open http://localhost:8888/rs2.cgi
```

`bootstrap.sh` is non-interactive and idempotent. It writes a minimal
`engine/.env` (with `NODE_PRODUCTION=true`, which is required in
containerized environments — see "Notes" below), installs deps, and
builds the content packs.

## Quickstart (local desktop)

The upstream interactive wizard still works:

```sh
./start.sh        # or `start.bat` on Windows
```

This wraps `start.ts` (an `@inquirer/prompts` wizard) which lets you pick
revision, port, dev-vs-production, dev-stack with sqlite/mysql, etc. Delete
`server.json` and `engine/.env` first if you want to reconfigure.

## Notes

- **`NODE_PRODUCTION=true` is set by `bootstrap.sh`.** The engine's dev
  mode spawns a `DevThread` that `fs.watch()`es every content
  subdirectory (~800 of them); each watch consumes an inotify FD, which
  blows the 4096 `ulimit -n` cap that managed containers impose. On a
  desktop machine without that cap, dev mode (live content reload) is
  fine — use the interactive `start.sh` to enable it.
- **Java client is opt-in.** Upstream `start.ts` always clones the Java
  applet repo; this fork only does it when `RS_INCLUDE_JAVA_CLIENT=1`.
- **Subprojects are vendored, not submodules.** To pull upstream
  changes, re-clone the relevant LostCity repo at the same revision and
  diff/merge manually. We trade easy sync for a single-repo edit loop.

## License

MIT, inherited from upstream LostCity. See [`LICENSE`](LICENSE).
