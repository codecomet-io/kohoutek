source="${1:-debian}"
normalizedSource="$(printf "%s" "$source" | tr "/" "-")"

cd ./data_importer/
npm run build "$source"
cd ../pantry-ui/
npm run build
npm run preview -- --open ?pipeline="$normalizedSource"
