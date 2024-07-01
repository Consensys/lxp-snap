# Linea Voyager Snap

View your LXP and LXP-L balances, Proof of Humanity status, and current LXP Activations right inside of MetaMask!

Powered by https://lineascan.build APIs and [MetaMask Snaps](https://metamask.io/snaps).

## Getting Started

Clone this repository to your local machine and set up the development environment:

```shell
yarn install && yarn start
```

Open your browser and navigate to `http://localhost:3000` to access the production dapp or `http://localhost:8000` to
access the development dapp.

## Cloning

This repository contains GitHub Actions that you may find useful, see
`.github/workflows` and
[Releasing & Publishing](https://github.com/MetaMask/template-snap-monorepo/edit/main/README.md#releasing--publishing)
for more information.

If you clone or create this repository outside the MetaMask GitHub organization,
you probably want to run `./scripts/cleanup.sh` to remove some files that will
not work properly outside the MetaMask GitHub organization.

If you don't wish to use any of the existing GitHub actions in this repository,
simply delete the `.github/workflows` directory.

## Contributing

### Testing and Linting

Run `yarn test` to run the tests once.

Run `yarn lint` to run the linter, or run `yarn lint:fix` to run the linter and
fix any automatically fixable issues.

### Using NPM packages with scripts

Scripts are disabled by default for security reasons. If you need to use NPM
packages with scripts, you can run `yarn allow-scripts auto`, and enable the
script in the `lavamoat.allowScripts` section of `package.json`.

See the documentation
for [@lavamoat/allow-scripts](https://github.com/LavaMoat/LavaMoat/tree/main/packages/allow-scripts)
for more information.
