#!/usr/bin/env bash
# 一键运行例子。用法: ./run.sh 01-first-plugin
# 阶段一（s01-s04）完全自包含：Cordis 已 vendor 进本仓库的 vendor/，无需 deepseek-harness。
set -euo pipefail

NAME="${1:?用法: ./run.sh <example-name>，例如 ./run.sh 01-first-plugin}"

SRC="$(cd "$(dirname "$0")" && pwd)/examples/$NAME"
if [ ! -d "$SRC" ]; then
  echo "没有这个例子: $SRC" >&2
  echo "可用的例子: $(ls examples/ 2>/dev/null | tr '\n' ' ')" >&2
  exit 1
fi

cd "$SRC"
exec node --import tsx ../../vendor/cordis/bin.js
