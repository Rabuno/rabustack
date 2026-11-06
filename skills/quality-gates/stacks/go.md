# Go

Coverage. Without `-coverpkg`, tests in one package (integration tests in `internal/server`) cover no other package and CRAP inflates. With it, blocks repeat per test binary and crapper misreads them, so merge keeping the max count:

Run the changed packages, plus the integration package narrowed to the tests reaching them, then the `awk` merge:

```bash
P=target/coverage/go/coverage.out
PKGS=$(printf '%s\n' "${FILES[@]}" | xargs -n1 dirname | sort -u | sed 's#^#./#'); CP=$(echo $PKGS | tr ' ' ,)
go test $PKGS -coverpkg=$CP -coverprofile=$P
go test ./<integration pkg>/ -run "<regex>" -coverpkg=$CP -coverprofile=$P.int && tail -n +2 $P.int >> $P && rm $P.int
awk 'NR==1{print;next} {k=$1" "$2; if(!(k in m)||$3>m[k]) m[k]=$3} END{for(k in m) print k, m[k]}' "$P" > "$P.tmp" && mv "$P.tmp" "$P"
```

Before mutation (after dryer): mutator wants `internal/...` paths, not module-prefixed ones, else it prints "No coverage data" and reports everything UNCOVERED in seconds. `sed -i "s#^$(go list -m)/##" $P`

Mutation `<cmd>`: `go test ./<pkg> -run '<regex>' -count=1`, the regex naming the file's related tests; add the integration package with its own narrow `-run` when it reaches the file (a whole integration package can take minutes per mutant).

A mutant that cannot compile (`+ -> -` on string concatenation) counts as killed.

Format check on committed content (`core.autocrlf=true` makes gofmt flag every checkout): `git show HEAD:<f> | gofmt -l`.
