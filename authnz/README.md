# CodeComet authn/authw flow

## Local installation for developpers

### Initial setup

Review and possibly modify `.env`.

Then, do this once:

```bash
source .env
sudo echo "127.0.0.1 kohoutek.$ROOT_DOMAIN" >> /etc/hosts
sudo echo "127.0.0.1 auth.$ROOT_DOMAIN" >> /etc/hosts
```

Then

```bash
./hack/mac.sh kohoutek::install
```

### Running

```bash
./hack/mac.sh kohoutek::run
```

Or if you want it daemonized:
```bash
./hack/mac.sh kohoutek::run background
```

### Install certificate authority

For browsers to accept the self-signed cert, call:

```bash
./hack/mac.sh kohoutek::trust
```

If you are concerned in the future about trusting that local CA,
you can remove it by looking for `Caddy Local Authority` in the Keychain Access app.

### Testing

```bash
open https://kohoutek.codecomet.local/login
```

### Serving

By default, this is serving static files from the `web` subfolder.
If you want to make it serve from vite instead, edit `Caddyfile` and change:

```
	# Serve from a backend
	# reverse_proxy /* {$VITE_BACKEND}

	# Alternatively, serve static files
	root * {$WEB_ROOT}
	file_server
```

into

```
	# Serve from a backend
	reverse_proxy /* {$VITE_BACKEND}

	# Alternatively, serve static files
	# root * {$WEB_ROOT}
	# file_server
```

### Routing

The default config requires authorization for everything, except `/login*`.

To change that behavior, look in the Caddyfile for 

```
    @requireauth {
        not path /login*
    }
```

And change that selector to whatever you want.