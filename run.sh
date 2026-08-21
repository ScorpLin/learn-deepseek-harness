#!/usr/bin/env bash
# 一键运行例子。用法: ./run.sh <example-name>
# 阶段一（s01-s04）纯 Cordis 例子自包含，无需 deepseek-harness；
# 阶段二起（import 了 @deepseek-ai/dsh-* 业务包）自动走 deepseek-harness 路径。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"   # 本仓库根目录
NAME="${1:?用法: ./run.sh <example-name>，例如 ./run.sh 01-first-plugin}"
SRC="$ROOT/examples/$NAME"

if [ ! -d "$SRC" ]; then
  echo "没有这个例子: $SRC" >&2
  echo "可用的例子: $(ls "$ROOT"/examples/ 2>/dev/null | tr '\n' ' ')" >&2
  exit 1
fi

cd "$SRC"

# 这个例子是否 import 了 deepseek-harness 的业务包（@deepseek-ai/dsh-*）？
if grep -rq '@deepseek-ai/dsh-' .; then
  HARNESS="${DSH_ROOT:-$ROOT/../deepseek-harness}"
  if [ ! -d "$HARNESS" ]; then
    echo "这个例子 import 了 deepseek-harness 业务包，需要一份 deepseek-harness 源码：" >&2
    echo "  git clone https://github.com/deepseek-ai/deepseek-harness.git $ROOT/../deepseek-harness" >&2
    echo "  或用 DSH_ROOT=/你的路径/deepseek-harness ./run.sh $NAME 指定" >&2
    exit 1
  fi
  DEST="$HARNESS/tmp/$NAME"
  rm -rf "$DEST"
  cp -r . "$DEST"
  cd "$DEST"
  exec node --import tsx ../../vendor/cordis/bin.js
else
  exec node --import tsx ../../vendor/cordis/bin.js
fi
