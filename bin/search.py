#!/usr/bin/env python3
"""Yandex Search CLI — wrapper for yandex-search-mcp over JSON-RPC/stdio."""

import argparse
import json
import subprocess
import sys
from pathlib import Path

MCP_BIN = Path(__file__).resolve().parent.parent / "build" / "index.js"


def build_rpc_input(query: str, page_size: int, page_number: int,
                    fetch_url: str, tool: str) -> bytes:
    """Build JSON-RPC initialize + tools/call input."""
    requests = [
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "yandex-search-cli", "version": "1.0.0"},
            },
        },
        {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/call",
            "params": {
                "name": tool,
                "arguments": {
                    "query": query,
                    "page_size": page_size,
                    "page_number": page_number,
                } if tool == "search_web" else {"url": fetch_url},
            },
        },
    ]
    return "\n".join(json.dumps(req) for req in requests) + "\n"


def format_search_results(text: str) -> None:
    """Print search results in a clean format."""
    try:
        data = json.loads(text)
        results = data.get("results", [])
        for i, r in enumerate(results, 1):
            print(f"--- {i} ---")
            print(f"Title  : {r.get('title', '')}")
            print(f"URL    : {r.get('url', '')}")
            print(f"Snippet: {r.get('snippet', '')}")
            print()
    except json.JSONDecodeError:
        print(text)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Yandex Search CLI — search the web via Yandex MCP server",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
examples:
  search -q "Putin visit to China 2026" -n 5
  search -q "AI news" -n 10 -p 1
  search -c "https://yandexwebcache.net/..."
  search "hello world"              # positional shorthand
        """,
    )
    parser.add_argument("query", nargs="?", help="Search query (positional shorthand)")
    parser.add_argument("-q", dest="query_explicit", help="Search query")
    parser.add_argument("-n", type=int, default=5, help="Number of results (default: 5)")
    parser.add_argument("-p", type=int, default=0, help="Page number, 0-based (default: 0)")
    parser.add_argument("-c", dest="fetch_url", help="Fetch content by URL")
    parser.add_argument("-t", choices=["search", "fetch"], default="search",
                        help="Tool to call (default: search)")

    args = parser.parse_args()

    query = args.query_explicit or args.query
    fetch_url = args.fetch_url
    tool = "search_web" if args.t == "search" else "fetch_content"

    if not query and not fetch_url:
        parser.print_help()
        sys.exit(1)

    if not MCP_BIN.exists():
        print(f"Error: {MCP_BIN} not found. Run 'npm run build' first.", file=sys.stderr)
        sys.exit(1)

    rpc_input = build_rpc_input(query or "", args.n, args.p, fetch_url or "", tool)

    env = {**dict(subprocess.os.environ),
           "YANDEX_API_KEY": subprocess.os.environ.get("YANDEX_API_KEY", ""),
           "YANDEX_FOLDER_ID": subprocess.os.environ.get("YANDEX_FOLDER_ID", "")}

    result = subprocess.run(
        ["node", str(MCP_BIN)],
        input=rpc_input,
        capture_output=True,
        text=True,
        env=env,
        timeout=30,
    )

    # Parse JSONL output
    for line in result.stdout.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        if obj.get("id") == 2 and "result" in obj:
            content = obj["result"].get("content", [])
            if content and content[0].get("type") == "text":
                if tool == "search_web":
                    format_search_results(content[0]["text"])
                else:
                    print(content[0]["text"])
                return

    if result.stderr:
        print(result.stderr, file=sys.stderr)


if __name__ == "__main__":
    main()
