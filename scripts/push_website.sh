#!/usr/bin/env bash
set -euo pipefail

GITHUB_USER="racoonykc"
REMOTE="https://${GITHUB_USER}@github.com/racoonykc/racoonykc.github.io.git"
HOMEPAGES_ROOT="/SPXvePFS/share-users/kcyang/homepages"
SOURCE_DIR="${HOMEPAGES_ROOT}/homepage-source"
DEPLOY_DIR="${HOMEPAGES_ROOT}/site-deploy"
TOKEN_FILE="${SOURCE_DIR}/.github_pat"

usage() {
	cat <<'USAGE'
Usage:
  scripts/push_website.sh

Authentication options:
  1. Set GITHUB_PAT in the environment.
  2. Put the token in /SPXvePFS/share-users/kcyang/homepages/homepage-source/.github_pat.
  3. Paste the token when prompted.

This script pushes:
  - homepage-source -> origin/homepage-source
  - deploy-homepage -> origin/deploy-homepage

GitHub Pages should be configured to publish from:
  deploy-homepage / (root)
USAGE
}

die() {
	echo "error: $*" >&2
	exit 1
}

ensure_clean() {
	local dir="$1"
	local name="$2"
	local status
	status="$(git -C "$dir" status --short)"
	if [[ -n "$status" ]]; then
		echo "$status" >&2
		die "$name has uncommitted changes. Commit or stash them before pushing."
	fi
}

read_token() {
	local token="${GITHUB_PAT:-}"

	if [[ -z "$token" && -f "$TOKEN_FILE" ]]; then
		token="$(tr -d '\r\n' < "$TOKEN_FILE")"
	fi

	if [[ -z "$token" ]]; then
		printf "GitHub PAT for %s: " "$GITHUB_USER" >&2
		stty -echo
		read -r token
		stty echo
		printf "\n" >&2
	fi

	[[ -n "$token" ]] || die "empty GitHub PAT"
	printf "%s" "$token"
}

[[ "${1:-}" != "-h" && "${1:-}" != "--help" ]] || {
	usage
	exit 0
}

[[ -d "$SOURCE_DIR/.git" || -f "$SOURCE_DIR/.git" ]] || die "missing source worktree: $SOURCE_DIR"
[[ -d "$DEPLOY_DIR/.git" || -f "$DEPLOY_DIR/.git" ]] || die "missing deploy worktree: $DEPLOY_DIR"

source_branch="$(git -C "$SOURCE_DIR" branch --show-current)"
deploy_branch="$(git -C "$DEPLOY_DIR" branch --show-current)"
[[ "$source_branch" == "homepage-source" ]] || die "$SOURCE_DIR is on '$source_branch', expected homepage-source"
[[ "$deploy_branch" == "deploy-homepage" ]] || die "$DEPLOY_DIR is on '$deploy_branch', expected deploy-homepage"

ensure_clean "$SOURCE_DIR" "homepage-source"
ensure_clean "$DEPLOY_DIR" "deploy-homepage"

token="$(read_token)"
askpass="$(mktemp /tmp/github-askpass.XXXXXX)"
trap 'rm -f "$askpass"' EXIT
chmod 700 "$askpass"

cat > "$askpass" <<EOF
#!/usr/bin/env bash
case "\$1" in
	*Username*) printf '%s\n' "$GITHUB_USER" ;;
	*Password*) printf '%s\n' "$token" ;;
	*) printf '%s\n' "$token" ;;
esac
EOF

echo "Pushing homepage-source..."
GIT_ASKPASS="$askpass" GIT_TERMINAL_PROMPT=0 \
	git -c credential.helper= -C "$SOURCE_DIR" push "$REMOTE" homepage-source

echo "Pushing deploy-homepage..."
GIT_ASKPASS="$askpass" GIT_TERMINAL_PROMPT=0 \
	git -c credential.helper= -C "$DEPLOY_DIR" push "$REMOTE" deploy-homepage

cat <<'DONE'

Done.

If GitHub Pages is set to deploy-homepage / (root), the live site will update
from deploy-homepage automatically after GitHub finishes the Pages deployment.
DONE
