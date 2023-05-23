#!/usr/bin/env bash
set -o errexit -o errtrace -o functrace -o nounset -o pipefail -o monitor

VERSION_XCADDY=0.3.3
OS_XCADDY="mac_arm64"

readonly _here=$(cd "$(dirname "${BASH_SOURCE[0]:-$PWD}")" 2>/dev/null 1>&2 && pwd)
source "$_here"/.conf
mkdir -p "$_here"/run

export JWT_SHARED_KEY="$_here/$JWT_SHARED_KEY"
export RUN_ROOT="$_here"/run
export WEB_ROOT="$_here"/web
export HACK="/@*"

kohoutek::install(){
  echo "Requirements check"

  echo " - golang"
  command -v go >/dev/null || {
    echo " > golang is missing"
    echo " > will try installing now"
    echo " - homebrew"
    command -v brew >/dev/null || {
      echo "  > not found - please refer to https://brew.sh/ and try again after installing"
      exit 1
    }
    echo "  [x] we have homebrew"
    brew install go
  }
  echo "  [x] we have golang"

  cd "$_here"
  go build -o run/kohoutek main.go
  echo "all set"
}

kohoutek::install_with_xcaddy(){
  echo "Requirements check"

  echo " - golang"
  command -v go >/dev/null || {
    echo " > golang is missing"
    echo " > will try installing now"
    echo " - homebrew"
    command -v brew >/dev/null || {
      echo "  > not found - please refer to https://brew.sh/ and try again after installing"
      exit 1
    }
    echo "  [x] we have homebrew"
    brew install go
  }
  echo "  [x] we have golang"

  echo " - caddy"

  cd "$RUN_ROOT"
  [ -e caddy ] ||  {
    curl -fsSL -o xcaddy.tgz https://github.com/caddyserver/xcaddy/releases/download/v${VERSION_XCADDY}/xcaddy_${VERSION_XCADDY}_${OS_XCADDY}.tar.gz
    tar -zxf xcaddy.tgz
    rm xcaddy.tgz
    ./xcaddy build \
      --with github.com/codecomet-io/caddy-security=github.com/codecomet-io/caddy-security@latest \
      --with github.com/greenpau/go-authcrunch=github.com/codecomet-io/go-authcrunch@latest
#      2>/dev/null
    rm xcaddy
    rm LICENSE
    rm README.md
  }
  cd ->/dev/null
  echo "  [x] caddy ready"
  echo
  echo "You are all set"
}

kohoutek::run(){
  export _CODECOMET_FORWARD_PATCH=true
  local bck="${1:-}"
  killall kohoutek 2>/dev/null || true
  local cmd=("$RUN_ROOT"/kohoutek)
  [ "$bck" ] && cmd+=(start) || cmd+=(run)
  cmd+=(--config "$_here"/Caddyfile)
  "${cmd[@]}"
}

kohoutek::trust(){
  "$RUN_ROOT"/kohoutek --config "$_here"/Caddyfile trust
}

"$@"

