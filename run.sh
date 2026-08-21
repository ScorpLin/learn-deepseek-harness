#!/usr/bin/env bash
# 运行一个例子。用法: ./run.sh 01-first-plugin
# 默认假设 deepseek-harness 在本仓库的同级目录（../deepseek-harness）；可用 DSH_ROOT 覆盖。
set -euo pipefail

NAME="${1:?用法: ./run.sh <example-name>，例如 ./run.sh 01-first-plugin}"

# 定位 deepseek-harness
if [ -n "${DSH_ROOT:-}" ]; then
  HARNESS="$DSH_ROOT"
elif [ -d "$(pwd)/../deepseek-harness" ]; then
  HARNESS="$(cd "$(pwd)/../deepseek-harness" && pwd)"
else
  echo "找不到 deepseek-harness。请设置 DSH_ROOT 指向它，或把本仓库放在它的同级目录。" >&2
  exit 1
fi

SRC="$(cd "$(dirname "$0")" && pwd)/examples/$NAME"
if [ ! -d "$SRC" ]; then
  echo "没有这个例子: $SRC" >&2
  echo "可用的例子: $(ls examples/ 2>/dev/null | tr '\n' ' ')" >&2
  exit 1
fi

# 拷贝进 harness 的 gitignored tmp/ 目录（和官方 cordis-tutorial 一致），
# 因为 tsx 依赖 harness 根目录的 tsconfig paths 把 @deepseek-ai/* 解析到 src。
DEST="$HARNESS/tmp/$NAME"
rm -rf "$DEST"
cp -r "$SRC" "$DEST"
cd "$DEST"
exec node --import tsx ../../vendor/cordis/bin.js
