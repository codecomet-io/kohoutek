#protobuf="${1:-mocks/simple-debian/llb.proto}"
#trace="${2:-mocks/simple-debian/no-cache.json}"
#destination="${3:-../builds/data.json}"

isDirty="$(if ! git diff --no-ext-diff --quiet --exit-code; then printf "true"; else printf "false"; fi)"

id="uuid-for-the-super-pipeline"
name="My Super Pipeline"
description="This is a pipeline that does foo and boom and go"

meta="$(echo '{}' | jq -c --arg id "$id" --arg name "$name" --arg desc "$description" \
  --arg cid "$(git log --format="%H" -n 1)" \
  --arg par "$(git log --format="%H" -n 2 | tail -1)" \
  --arg loc "$(git remote get-url origin | sed -E 's,.git$,,' | sed -E 's,^[a-z-]+:([^/]),https://github.com/\1,')" \
  --arg author "$(git --no-pager show -s --format='%an <%ae>' HEAD)" \
  --arg dirty "$isDirty" '{
  id: $id,
  name: $name,
  description: $desc,
  commit: $cid,
  author: $author,
  parent: $par,
  dirty: $dirty,
  location: $loc,
}')"

./node_modules/.bin/tsc && node ./entrypoint.js "mocks/simple-debian/llb.proto" "mocks/simple-debian/no-cache.json" "$meta" "../pantry-ui/build/data/simple-no-cache.json"
./node_modules/.bin/tsc && node ./entrypoint.js "mocks/simple-debian/llb.proto" "mocks/simple-debian/cached.json" "$meta" "../pantry-ui/build/data/simple-with-cache.json"
./node_modules/.bin/tsc && node ./entrypoint.js "mocks/simple-debian/llb.proto" "mocks/simple-debian/fail.json" "$meta" "../pantry-ui/build/data/simple-fail.json"

