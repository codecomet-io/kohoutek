source="${1:-}"
normalizedSource="$(printf "%s" "$source" | tr "/" "-")"
normalizedSource="${normalizedSource:-c-failure}"

cd ./pantry/
npm run build "$source"
cd ../app/
npm run build
npm run preview -- --open /anonymous-run/$normalizedSource
