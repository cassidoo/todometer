# How to a release of todometer

This is for any future reference in case you want to either make a new release here in this repository, or if you make your own release on your own machine.

## Development

- Clone the repo:

```bash
$ git clone https://github.com/cassidoo/todometer.git
```

- Go to the project directory and install dependencies:

```bash
$ cd todometer && npm install
```

To show the Electron application window with your current build:

```bash
$ npm run dev
```

To build a production version:

```bash
$ npm install
$ npm run postinstall
$ npm run pre-electron-pack
$ npm run pack           # all platforms
$ npm run pack:mac       # macOS only (DMG + ZIP)
$ npm run pack:win       # Windows only (NSIS installer)
$ npm run pack:linux     # Linux only (AppImage)
```

## Releasing

Releases are automated via GitHub Actions. To publish a new version:

1. Bump the `version` in `package.json`
2. Commit the change
3. Tag and push:
   ```bash
   $ git tag v2.1.0
   $ git push && git push --tags
   ```

The CI workflow will build, sign, and publish installers for all platforms to GitHub Releases.

### Required GitHub Secrets

| Secret                        | Description                                                                         | 
| ----------------------------- | ----------------------------------------------------------------------------------- |
| `MACOS_CERTIFICATE`           | Base64-encoded `.p12` signing certificate                                           |
| `MACOS_CERTIFICATE_PASSWORD`  | Password for the `.p12` certificate                                                 |
| `APPLE_ID`                    | Apple ID email for notarization                                                     |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password ([create one here](https://appleid.apple.com/account/manage)) |
| `APPLE_TEAM_ID`               | Apple Developer Team ID                                                             |
| `WIN_CSC_LINK`                | _(Optional)_ Base64-encoded Windows code signing certificate                        |
| `WIN_CSC_KEY_PASSWORD`        | _(Optional)_ Password for the Windows certificate                                   |

> **Note:** Windows code signing is optional. Without it, the NSIS installer will still be built and published — users will just see a SmartScreen warning on first run.

## The "easy" way

If you don't want to deal with most of this, you can just run that `npm run pack` to make your own personal version on your computer.
