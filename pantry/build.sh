source="${1:-}"
normalizedSource="$(printf "%s" "$source" | tr "/" "-")"

destination=../app/static/data
if [ "$source" != "" ]; then
  echo processing $source
  node ./build/entrypoint.js "mocks/$source/llb.proto" "mocks/$source/trace.json" "$(cat mocks/$source/meta.json)" "$destination/$normalizedSource.json" mockData=true
else
  for mockfamily in "mocks"/*; do
    mockfamily="$(basename "$mockfamily")"
    for mock in "mocks/$mockfamily"/*; do
      mock="$(basename "$mock")"
      node ./build/entrypoint.js "mocks/$mockfamily/$mock/llb.proto" "mocks/$mockfamily/$mock/trace.json" "$(cat mocks/$mockfamily/$mock/meta.json)" "$destination/$mockfamily-$mock.json" mockData=true
    done
  done
fi
