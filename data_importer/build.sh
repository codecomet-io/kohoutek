isDirty="$(if ! git diff --no-ext-diff --quiet --exit-code; then printf "true"; else printf "false"; fi)"

id="exhaustive-pipeline"
name="Exhaustive Pipeline"
description="This is a pipeline with exhaustive examples of filesets and actions"

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

destination=../pantry-ui/static/data
node ./entrypoint.js "mocks/exhaustive/failure/llb.proto" "mocks/exhaustive/failure/trace.json" "$meta" "$destination/exhaustive-failure.json"
node ./entrypoint.js "mocks/exhaustive/success/llb.proto" "mocks/exhaustive/success/trace.json" "$meta" "$destination/exhaustive-success.json"
node ./entrypoint.js "mocks/exhaustive/cached/llb.proto" "mocks/exhaustive/cached/trace.json" "$meta" "$destination/exhaustive-cached.json"

# Short term
cp "$destination/exhaustive-failure.json" "$destination/exhaustive.json"
