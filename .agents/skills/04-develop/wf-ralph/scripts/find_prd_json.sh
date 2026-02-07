#!/usr/bin/env bash
set -euo pipefail

# find_prd_json.sh
#
# Resolve a dossier-local prd.json without hardcoding absolute paths.
#
# Resolution order:
#  1) If ./prd.json exists in the current working directory, return it (but never from under a prds/ slice).
#  2) If an arg is provided:
#     - If it is a file path to prd.json, return it (but never from under a prds/ slice).
#     - If it is a directory containing prd.json, return it (but never from under a prds/ slice).
#     - If it is @slug or slug, search under <repo-root>/docs/04-projects/** for dossier-root prd.json
#       (avoid matching slice PRDs under prds/*).
#  3) Otherwise, walk up parent dirs looking for prd.json (but never from under a prds/ slice).
#
# If multiple matches are found for a slug search, print all matches and exit non-zero.

arg="${1-}"

repo_root() {
  git rev-parse --show-toplevel 2>/dev/null || pwd
}

abs_path() {
  local p="$1"
  if [[ -d "$p" ]]; then
    (cd "$p" && pwd)
  else
    (cd "$(dirname "$p")" && printf "%s/%s\n" "$(pwd)" "$(basename "$p")")
  fi
}

is_slice_path() {
  local p="$1"
  [[ "$p" == *"/prds/"* || "$p" == */prds ]]
}

resolve_in_dir() {
  local dir="$1"
  local abs_dir
  abs_dir="$(cd "$dir" && pwd)"

  # Explicitly ignore slice PRDs under prds/*.
  if is_slice_path "$abs_dir"; then
    return 1
  fi

  if [[ -f "$abs_dir/prd.json" ]]; then
    abs_path "$abs_dir/prd.json"
    return 0
  fi

  return 1
}

slug_search() {
  local slug="$1"

  local root base
  root="$(repo_root)"
  base="$root/docs/04-projects"
  if [[ ! -d "$base" ]]; then
    echo "No docs/04-projects folder found under repo root: $root" >&2
    return 1
  fi

  local -a matches=()
  while IFS= read -r m; do
    [[ -n "$m" ]] || continue
    matches+=( "$m" )
  done < <(
    find "$base" -type f -name prd.json \
      -not -path "*/prds/*" \
      \( -path "*_${slug}/*" -o -path "*${slug}*" \) 2>/dev/null | sort
  )

  if (( ${#matches[@]} == 1 )); then
    abs_path "${matches[0]}"
    return 0
  fi

  if (( ${#matches[@]} > 1 )); then
    echo "Multiple prd.json matches for slug '${slug}':" >&2
    for m in "${matches[@]}"; do
      echo "- $m" >&2
    done
    echo "Pass a more specific relative path, or rename dossier slugs to be unique." >&2
    return 2
  fi

  return 1
}

# 1) Current dir
if resolve_in_dir "." >/dev/null; then
  resolve_in_dir "."
  exit 0
fi

# 2) Arg path handling
if [[ -n "$arg" ]]; then
  # File path
  if [[ -f "$arg" ]]; then
    base="$(basename "$arg")"
    if [[ "$base" != "prd.json" ]]; then
      echo "Expected a prd.json file; got: $arg" >&2
      exit 1
    fi

    resolved="$(abs_path "$arg")"
    if is_slice_path "$resolved"; then
      echo "Refusing to use slice PRDs under prds/*: $resolved" >&2
      exit 1
    fi

    printf "%s\n" "$resolved"
    exit 0
  fi

  # Directory path
  if [[ -d "$arg" ]]; then
    if resolve_in_dir "$arg" >/dev/null; then
      resolve_in_dir "$arg"
      exit 0
    fi
    echo "No prd.json found in directory (or directory is under prds/*): $arg" >&2
    exit 1
  fi

  # Slug search
  slug="$arg"
  slug="${slug#@}"
  if slug_search "$slug"; then
    exit 0
  fi

  echo "No prd.json found for slug '${slug}'." >&2
  exit 1
fi

# 3) Walk up parents
here="$(pwd)"
while [[ "$here" != "/" ]]; do
  if ! is_slice_path "$here" && [[ -f "$here/prd.json" ]]; then
    abs_path "$here/prd.json"
    exit 0
  fi
  here="$(dirname "$here")"
done

echo "No prd.json found. Run from within a dossier folder, or pass @slug or a relative dossier path / prd.json file path." >&2
exit 1
