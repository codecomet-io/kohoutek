source="${1:-}"
normalizedSource="$(printf "%s" "$source" | tr "/" "-")"
normalizedSource="${normalizedSource:-c-failure}"

cd ./pantry/

if [ ! -d "node_modules" ]
then
	echo "\"node_modules\" directory doesn't exist. Running npm install."

	npm install
else
	echo "\"node_modules\" directory exists. Skipping npm install."
fi

npm run build "$source"

cd ../app/

if [ ! -d "node_modules" ]
then
	echo "\"node_modules\" directory doesn't exist. Running npm install."

	npm install
else
	echo "\"node_modules\" directory exists. Skipping npm install."
fi

npm run build

npm run preview -- --open /anonymous-run/$normalizedSource
