// Reads Go file paths from stdin, one per line; prints "file<TAB>name<TAB>start<TAB>end" for each func.
// Paths come on stdin because `go run` takes every *.go argument as a source file.
package main

import (
	"bufio"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
)

func main() {
	fs := token.NewFileSet()
	in := bufio.NewScanner(os.Stdin)
	for in.Scan() {
		f := in.Text()
		file, err := parser.ParseFile(fs, f, nil, 0)
		if err != nil {
			panic(err)
		}
		for _, d := range file.Decls {
			if fn, ok := d.(*ast.FuncDecl); ok {
				fmt.Printf("%s\t%s\t%d\t%d\n", f, fn.Name.Name, fs.Position(fn.Pos()).Line, fs.Position(fn.End()).Line)
			}
		}
	}
}
