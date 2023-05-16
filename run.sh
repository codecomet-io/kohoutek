source="${1:-}"
normalizedSource="$(printf "%s" "$source" | tr "/" "-")"
normalizedSource="${normalizedSource:-c-failure}"

cd ./data_importer/
npm run build "$source"
cd ../pantry-ui/
npm run build
npm run preview -- --open /run/$normalizedSource
