#!/usr/bin/env bash
# gates.sh - the factory's deterministic verdict.
#
# This is the one part of the pipeline that cannot be talked out of its verdict
# by a confident paragraph. Every factory skill calls it. Nothing merges without it.
#
# Usage:
#   ./.factory/scripts/gates.sh fast    # run REQUIRED_FAST
#   ./.factory/scripts/gates.sh full    # run REQUIRED_FULL
#   ./.factory/scripts/gates.sh deep    # run REQUIRED_DEEP
#
# Exit codes:  0 = all required gates green   1 = at least one gate red
#              2 = invalid level or a required gate could not run
#
# Output ends with a machine-readable line so an agent cannot paraphrase the result:
#   FACTORY_GATES: level=full status=RED passed=3 failed=1 failing=test skipped=build misconfigured=none
#
# Customise .factory/gates.conf and the DETECT block for your project.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 2
LEVEL="${1:-}"
if [ -z "$LEVEL" ]; then
  LEVEL="$(sed -nE 's/^[[:space:]]*default:[[:space:]]*(fast|full|deep)[[:space:]]*$/\1/p' docs/factory/CHARTER.md 2>/dev/null)"
fi

case "$LEVEL" in
  fast|full|deep) ;;
  *)
    echo "error: gate level must be fast, full, or deep (got: $LEVEL)" >&2
    printf 'FACTORY_GATES: level=%s status=MISCONFIGURED passed=0 failed=0 failing=none skipped=none misconfigured=invalid-level\n' "$LEVEL"
    exit 2
    ;;
esac

REQUIRED_FAST="build"
REQUIRED_FULL="build"
REQUIRED_DEEP="build"
ARCHITECTURE_COMMAND=""
if [ -f .factory/gates.conf ]; then
  # This file is protected by the factory contract and contains assignments only.
  # shellcheck disable=SC1091
  source .factory/gates.conf
fi

case "$LEVEL" in
  fast) REQUIRED="$REQUIRED_FAST" ;;
  full) REQUIRED="$REQUIRED_FULL" ;;
  deep) REQUIRED="$REQUIRED_DEEP" ;;
esac

for gate in $REQUIRED; do
  case "$gate" in
    types|lint|test|build|mutation|architecture) ;;
    *)
      echo "error: unknown required gate in .factory/gates.conf: $gate" >&2
      printf 'FACTORY_GATES: level=%s status=MISCONFIGURED passed=0 failed=0 failing=none skipped=none misconfigured=unknown-required-gate:%s\n' "$LEVEL" "$gate"
      exit 2
      ;;
  esac
done

PASSED=0
FAILED=0
PASSING=""
FAILING=""
SKIPPED=""
MISCONFIGURED=""

c_red()   { printf '\033[31m%s\033[0m\n' "$1"; }
c_green() { printf '\033[32m%s\033[0m\n' "$1"; }
c_dim()   { printf '\033[2m%s\033[0m\n' "$1"; }

# run <name> <command...>  - runs a gate, records the verdict, never exits early.
run() {
  local name="$1"; shift
  printf '\n=== gate: %s ===\n' "$name"
  if "$@"; then
    c_green "PASS  $name"
    PASSED=$((PASSED + 1))
    PASSING="${PASSING}${PASSING:+,}${name}"
  else
    c_red   "FAIL  $name"
    FAILED=$((FAILED + 1))
    FAILING="${FAILING}${FAILING:+,}${name}"
  fi
}

skip() {
  c_dim "SKIP  $1 ($2)"
  SKIPPED="${SKIPPED}${SKIPPED:+,}$1"
  case " $REQUIRED " in
    *" $1 "*) MISCONFIGURED="${MISCONFIGURED}${MISCONFIGURED:+,}$1" ;;
  esac
}

required() {
  case " $REQUIRED " in *" $1 "*) return 0 ;; esac
  return 1
}

has()      { command -v "$1" >/dev/null 2>&1; }
pkg_has()  { [ -f package.json ] && node -e "process.exit(require('./package.json').scripts?.['$1']?0:1)" 2>/dev/null; }

# ---------------------------------------------------------------------------
# DETECT - identify the project type. Edit this block for your repo.
# ---------------------------------------------------------------------------
STACK="unknown"
if   [ -f package.json ];      then STACK="node"
elif [ -f pyproject.toml ] || [ -f setup.py ]; then STACK="python"
elif [ -f Cargo.toml ];        then STACK="rust"
elif [ -f go.mod ];            then STACK="go"
fi

# Pick the package manager rather than assuming npm.
PM="npm"
if   [ -f pnpm-lock.yaml ];   then PM="pnpm"
elif [ -f yarn.lock ];        then PM="yarn"
elif [ -f bun.lockb ];        then PM="bun"
fi
PMRUN="$PM run"
[ "$PM" = "npm" ] && PMRUN="npm run --silent"

printf 'factory gates | level=%s stack=%s pm=%s\n' "$LEVEL" "$STACK" "$PM"

# ---------------------------------------------------------------------------
# Run only checks explicitly required by the selected level. Merely detecting a
# project command must not silently turn it into a verdict-affecting policy.
# ---------------------------------------------------------------------------
case "$STACK" in
  node)
    if required types; then
      if pkg_has typecheck; then run types $PMRUN typecheck
      elif [ -f tsconfig.json ] && has npx; then run types npx --no-install tsc --noEmit
      else skip types "no typecheck script or tsconfig.json"; fi
    fi
    if required lint; then
      if pkg_has lint; then run lint $PMRUN lint
      elif has npx && [ -f eslint.config.js -o -f eslint.config.mjs -o -f .eslintrc.json -o -f .eslintrc.cjs ]; then
        run lint npx --no-install eslint .
      else skip lint "no lint script or eslint config"; fi
    fi
    if required test; then
      if pkg_has test; then run test $PMRUN test; else skip test "no test script"; fi
    fi
    if required build; then
      if pkg_has build; then run build $PMRUN build; else skip build "no build script"; fi
    fi
    if required mutation; then
      if pkg_has mutation; then run mutation $PMRUN mutation; else skip mutation "no mutation script"; fi
    fi
    ;;
  python)
    if required lint; then if has ruff; then run lint ruff check .; else skip lint "ruff not installed"; fi; fi
    if required types; then if has mypy; then run types mypy .; else skip types "mypy not installed"; fi; fi
    if required test; then if has pytest; then run test pytest -q; else skip test "pytest not installed"; fi; fi
    if required build; then
      if python3 -c 'import build' >/dev/null 2>&1; then run build python3 -m build
      else skip build "python build module not installed"; fi
    fi
    if required mutation; then if has mutmut; then run mutation mutmut run; else skip mutation "mutmut not installed"; fi; fi
    ;;
  rust)
    if required types; then run types cargo check --all-targets; fi
    if required lint; then
      if has cargo-clippy || cargo clippy --version >/dev/null 2>&1; then run lint cargo clippy --all-targets -- -D warnings
      else skip lint "clippy not installed"; fi
    fi
    if required test; then run test cargo test --all; fi
    if required build; then run build cargo build --release; fi
    if required mutation; then skip mutation "no portable Rust mutation command configured"; fi
    ;;
  go)
    if required types; then run types go vet ./...; fi
    if required lint; then if has golangci-lint; then run lint golangci-lint run; else skip lint "golangci-lint not installed"; fi; fi
    if required test; then run test go test ./...; fi
    if required build; then run build go build ./...; fi
    if required mutation; then skip mutation "no portable Go mutation command configured"; fi
    ;;
  *)
    for gate in types lint test build mutation; do required "$gate" && skip "$gate" "unknown stack"; done
    ;;
esac

# ---------------------------------------------------------------------------
# Architecture remains an explicit project command because it has no portable
# stack convention.
# ---------------------------------------------------------------------------
if required architecture; then
  if [ -n "$ARCHITECTURE_COMMAND" ]; then
    run architecture bash -lc "$ARCHITECTURE_COMMAND"
  else
    skip architecture "no ARCHITECTURE_COMMAND configured"
  fi
fi

# ---------------------------------------------------------------------------
# CLOSING SWEEP - every required gate must have produced a verdict.
#
# A required gate the DETECT block never reaches emits neither run nor skip, so
# without this sweep it would silently leave the run GREEN. Fail closed instead:
# a gate that was never attempted is misconfigured, exactly like a required skip.
# ---------------------------------------------------------------------------
in_list() {
  case ",$2," in *",$1,"*) return 0 ;; esac
  return 1
}

for gate in $REQUIRED; do
  if in_list "$gate" "$PASSING" || in_list "$gate" "$FAILING" || in_list "$gate" "$SKIPPED"; then
    continue
  fi
  c_red "MISS  $gate (required at level $LEVEL but never attempted)"
  MISCONFIGURED="${MISCONFIGURED}${MISCONFIGURED:+,}${gate}"
done

# ---------------------------------------------------------------------------
# VERDICT
# ---------------------------------------------------------------------------
STATUS="GREEN"
EXIT_STATUS=0
if [ -n "$MISCONFIGURED" ]; then
  STATUS="MISCONFIGURED"
  EXIT_STATUS=2
elif [ "$FAILED" -gt 0 ]; then
  STATUS="RED"
  EXIT_STATUS=1
fi

printf '\n---------------------------------------------\n'
[ -n "$SKIPPED" ] && c_dim "skipped: $SKIPPED"
case "$STATUS" in
  GREEN) c_green "GATES GREEN ($PASSED passed)" ;;
  RED) c_red "GATES RED ($FAILED failed: $FAILING)" ;;
  MISCONFIGURED) c_red "GATES MISCONFIGURED (required gates skipped: $MISCONFIGURED)" ;;
esac

# The machine-readable line. Skills are instructed to quote this verbatim and
# are forbidden from reporting a result that contradicts it.
printf 'FACTORY_GATES: level=%s status=%s passed=%d failed=%d failing=%s skipped=%s misconfigured=%s\n' \
  "$LEVEL" "$STATUS" "$PASSED" "$FAILED" "${FAILING:-none}" "${SKIPPED:-none}" "${MISCONFIGURED:-none}"

exit "$EXIT_STATUS"
