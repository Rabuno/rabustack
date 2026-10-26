# Go

Coverage. Without `-coverpkg`, tests in one package (integration tests in `internal/server`) cover no other package and CRAP inflates. With it, blocks repeat per test binary and crapper misreads them, so merge keeping the max count:

```bash
P=target/coverage/go/coverage.out
go test ./... -coverpkg=./... -coverprofile=$P
awk 'NR==1{print;next} {k=$1" "$2; if(!(k in m)||$3>m[k]) m[k]=$3} END{for(k in m) print k, m[k]}' "$P" > "$P.tmp" && mv "$P.tmp" "$P"
```

SLOW: replace the `go test` line with the changed packages, plus the integration package narrowed to the tests reaching them, then run the same `awk` merge:

```bash
PKGS=$(printf '%s\n' "${FILES[@]}" | xargs -n1 dirname | sort -u | sed 's#^#./#'); CP=$(echo $PKGS | tr ' ' ,)
go test $PKGS -coverpkg=$CP -coverprofile=$P
go test ./<integration pkg>/ -run "<regex>" -coverpkg=$CP -coverprofile=$P.int && tail -n +2 $P.int >> $P && rm $P.int
```

Before mutation (after dryer): mutator wants `internal/...` paths, not module-prefixed ones, else it prints "No coverage data" and reports everything UNCOVERED in seconds. `sed -i "s#^$(go list -m)/##" $P`

Mutation `<cmd>`: `go test ./pkg/foo/ -count=1`, plus, when integration tests in another package reach the file, that package with a narrow `-run "<regex>"` naming only those tests (a whole integration package can take minutes per mutant).

A mutant that cannot compile (`+ -> -` on string concatenation) counts as killed.

Format check on committed content (`core.autocrlf=true` makes gofmt flag every checkout): `git show HEAD:<f> | gofmt -l`.
