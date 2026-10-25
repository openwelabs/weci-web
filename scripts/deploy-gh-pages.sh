#!/usr/bin/env bash
#
# 手动部署到 GitHub Pages（推送 dist/ 到 gh-pages 分支）
#
# 用法：
#   ./scripts/deploy-gh-pages.sh                 # 构建并推送
#   ./scripts/deploy-gh-pages.sh --no-build      # 复用已有 dist/
#   ./scripts/deploy-gh-pages.sh --base /        # 自定义 base（自定义域名时）
#   ./scripts/deploy-gh-pages.sh --dry-run       # 只构建，不推送
#
# 说明：
#   - 默认 base 为 /<仓库名>/，对应 https://<user>.github.io/<仓库名>/
#   - 仓库使用自定义域名或部署在 <user>.github.io 根路径时，传 --base /
#   - 需要在 GitHub 仓库 Settings → Pages 里把 Source 设为 "Deploy from a branch" → gh-pages / (root)
#     若更希望用 Actions 自动部署，改用 .github/workflows/deploy.yml（推荐）
#
set -euo pipefail

BUILD=1
DRY_RUN=0
BASE=""
REMOTE="origin"
BRANCH="gh-pages"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-build) BUILD=0; shift ;;
    --dry-run)  DRY_RUN=1; shift ;;
    --base)     BASE="${2:?--base 需要一个值}"; shift 2 ;;
    --remote)   REMOTE="${2:?--remote 需要一个值}"; shift 2 ;;
    --branch)   BRANCH="${2:?--branch 需要一个值}"; shift 2 ;;
    -h|--help)  sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "未知参数：$1" >&2; exit 1 ;;
  esac
done

cd "$(dirname "$0")/.."

# ---------- 推断 base ----------
if [[ -z "$BASE" ]]; then
  REPO_URL="$(git remote get-url "$REMOTE" 2>/dev/null || true)"
  REPO_NAME=""
  if [[ "$REPO_URL" =~ github\.com[:/]+([^/]+)/([^/.]+)(\.git)?$ ]]; then
    OWNER="${BASH_REMATCH[1]}"
    REPO_NAME="${BASH_REMATCH[2]}"
  fi
  if [[ -z "$REPO_NAME" ]]; then
    echo "✗ 无法从 $REMOTE 推断仓库名，请用 --base 显式指定" >&2
    exit 1
  fi
  if [[ "$REPO_NAME" == "${OWNER}.github.io" ]]; then
    BASE="/"
  else
    BASE="/${REPO_NAME}/"
  fi
fi

echo "▸ 仓库：$(git remote get-url "$REMOTE" 2>/dev/null || echo '(无)')"
echo "▸ base：${BASE}"

# ---------- 构建 ----------
if [[ "$BUILD" -eq 1 ]]; then
  echo "▸ 安装依赖"
  [[ -d node_modules ]] || npm ci

  echo "▸ 内容检查"
  npm run check

  echo "▸ 构建"
  VITE_BASE="$BASE" npm run build
else
  echo "▸ 跳过构建，复用 dist/"
fi

if [[ ! -f dist/index.html ]]; then
  echo "✗ dist/index.html 不存在，构建可能失败" >&2
  exit 1
fi

# ---------- SPA 兜底 + 关掉 Jekyll ----------
echo "▸ 生成 404.html 与 .nojekyll"
cp dist/index.html dist/404.html
touch dist/.nojekyll

# ---------- 推送 ----------
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "✓ dry-run：构建完成，未推送。产物在 dist/"
  exit 0
fi

if ! git diff --quiet --exit-code HEAD -- . 2>/dev/null; then
  echo "⚠ 工作区有未提交改动；本脚本只发布 dist/，源码改动请自行提交"
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "▸ 准备 gh-pages 内容"
cp -R dist/. "$TMP_DIR"/
cat > "$TMP_DIR/.gitignore" <<'EOF'
node_modules
EOF
echo "$(date -u '+%Y-%m-%d %H:%M:%S UTC') — deploy from $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')" > "$TMP_DIR/.deploy-info"

cd "$TMP_DIR"
git init -q
git checkout -q -b "$BRANCH"
git add -A
git -c user.name="${GIT_AUTHOR_NAME:-github-actions[bot]}" \
    -c user.email="${GIT_AUTHOR_EMAIL:-github-actions[bot]@users.noreply.github.com}" \
    commit -q -m "deploy: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

echo "▸ 推送到 $REMOTE/$BRANCH"
git push -f "$REMOTE" "$BRANCH"

echo "✓ 完成。若首次部署，请到 GitHub 仓库 Settings → Pages 选择分支 $BRANCH / root"
