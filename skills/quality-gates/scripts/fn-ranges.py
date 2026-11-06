import ast
import sys

for path in filter(None, sys.stdin.read().splitlines()):
    with open(path, encoding="utf-8") as source:
        tree = ast.parse(source.read(), path)
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            print(f"{path}\t{node.name}\t{node.lineno}\t{node.end_lineno}")
