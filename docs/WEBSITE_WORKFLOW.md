# Personal Website Workflow

This note records the local branch/worktree layout for Kaicheng Yang's personal
website and the commands needed to preview, update, and publish it.

## Local Directories

There are three separate local worktrees under:

```bash
/SPXvePFS/share-users/kcyang/homepages
```

### Old al-folio Site

```bash
/SPXvePFS/share-users/kcyang/homepages/racoonykc.github.io
```

- Git branch: `main`
- Backup branch: `al-folio-source`
- Purpose: keep the original al-folio website intact.
- Use this if you ever want to inspect or restore the old site.

### New HomePage Source

```bash
/SPXvePFS/share-users/kcyang/homepages/homepage-source
```

- Git branch: `homepage-source`
- Purpose: develop the new customized HomePage version.
- Important files:
  - `src/`: source files for the website.
  - `dist/`: generated static website.
  - `config.json`: site metadata and content configuration.
  - `package.json`: build scripts and dependencies.

Most future edits should happen here.

### New GitHub Pages Deploy Build

```bash
/SPXvePFS/share-users/kcyang/homepages/site-deploy
```

- Git branch: `deploy-homepage`
- Purpose: hold only the final static files that GitHub Pages can serve.
- Important files:
  - `index.html`
  - `research/`
  - `publications/`
  - `blog/`
  - `css/`
  - `js/`
  - `assets/`
  - `.nojekyll`

Do not use this directory for source development. Treat it as the publishable
output.

## Preview Locally

Preview the deploy version:

```bash
cd /SPXvePFS/share-users/kcyang/homepages/site-deploy
npx serve .
```

Preview the generated source build:

```bash
cd /SPXvePFS/share-users/kcyang/homepages/homepage-source
npx serve dist
```

Then open the local URL printed by `serve`, usually:

```text
http://localhost:3000
```

If port `3000` is already in use, `serve` may choose another port.

## Normal Editing Workflow

1. Edit the source version:

```bash
cd /SPXvePFS/share-users/kcyang/homepages/homepage-source
```

2. Modify files under `src/`, `config.json`, or relevant static pages.

3. Rebuild or regenerate `dist`.

If the normal build works:

```bash
npm run build
```

If the gulp build hangs, use the direct local generation approach that was used
for the current version:

```bash
node -e "const fs=require('fs'); const path=require('path'); const pug=require('pug'); const less=require('less'); const config=require('./config.json'); fs.mkdirSync('dist/css',{recursive:true}); const html=pug.compileFile('src/index.pug')({...config}); fs.writeFileSync('dist/index.html', html); less.render(fs.readFileSync('src/css/style.less','utf8'),{filename:path.resolve('src/css/style.less')}).then(out=>{fs.writeFileSync('dist/css/style.css', out.css);}).catch(err=>{console.error(err); process.exit(1);});"
cp src/js/main.js dist/js/main.js
cp src/js/background.js dist/js/background.js
```

4. Preview:

```bash
npx serve dist
```

5. Commit source changes:

```bash
git status
git add -A
git commit -m "Update website source"
```

## Visitor Map Widget

The hub page contains a black-and-white visitor-map widget with red location
dots. Because GitHub Pages is static, real visitor counting and location
aggregation require an external service such as MapMyVisitors, ClustrMaps, or
PulseMaps.

The configuration entry is in:

```bash
/SPXvePFS/share-users/kcyang/homepages/homepage-source/config.json
```

Look for:

```json
"visitorWidget": {
  "trackingEnabled": true,
  "displayEnabled": false,
  "scriptSrc": "//mapmyvisitors.com/map.js?d=..."
}
```

Current behavior:

- `trackingEnabled: true` loads the visitor script so the external dashboard can
  collect visits and approximate regions.
- `displayEnabled: false` hides the public widget on the website while tracking
  continues in the background.

To show the public widget later, change:

```json
"displayEnabled": true
```

To replace the tracking service:

1. Register `https://racoonykc.github.io` on a visitor-map service.
2. Copy only the script `src` URL from the embed code.
3. Paste that URL into `visitorWidget.scriptSrc`.
4. Rebuild `dist`, sync to `site-deploy`, commit, and push the deploy branch.

Example shape:

```json
"scriptSrc": "//mapmyvisitors.com/map.js?d=YOUR_SITE_KEY&cl=ffffff&w=a"
```

Do not put private tokens in frontend code. Visitor-map widgets should only use
public embed URLs intended to run in browsers.

## Sync Source Build To Deploy Worktree

After the source version looks correct, copy `dist` into the deploy worktree:

```bash
cd /SPXvePFS/share-users/kcyang/homepages/site-deploy
rsync -a --delete /SPXvePFS/share-users/kcyang/homepages/homepage-source/dist/ ./
touch .nojekyll
git status
git add -A
git commit -m "Update deployed website"
```

Then preview the deploy worktree:

```bash
npx serve .
```

## Publish To GitHub Pages

The remote repository is:

```text
https://github.com/racoonykc/racoonykc.github.io.git
```

The long-term publishing source should be:

```text
Branch: deploy-homepage
Folder: /(root)
```

GitHub supports publishing Pages from any branch in the repository, using either
the branch root or a `/docs` folder as the publishing source. This site uses the
`deploy-homepage` branch root so `main` and `gh-pages` do not need to be updated
for normal deployments.

### Configure Pages Source

In GitHub:

```text
racoonykc/racoonykc.github.io -> Settings -> Pages
Build and deployment -> Source: Deploy from a branch
Branch: deploy-homepage
Folder: /(root)
Save
```

After this is set once, future deployments only need to push `deploy-homepage`.

### Push With The Helper Script

The helper script is:

```bash
/SPXvePFS/share-users/kcyang/homepages/homepage-source/scripts/push_website.sh
```

It pushes:

- `homepage-source`
- `deploy-homepage`

It does not push `main` or `gh-pages`.

The script can read your GitHub PAT in three ways:

1. From the environment variable `GITHUB_PAT`.
2. From a local ignored file:

```bash
/SPXvePFS/share-users/kcyang/homepages/homepage-source/.github_pat
```

3. From a hidden prompt when the script runs.

Recommended one-time local setup:

```bash
cd /SPXvePFS/share-users/kcyang/homepages/homepage-source
printf 'PASTE_YOUR_PAT_HERE\n' > .github_pat
chmod 600 .github_pat
chmod +x scripts/push_website.sh
```

Then push future committed changes with:

```bash
cd /SPXvePFS/share-users/kcyang/homepages/homepage-source
scripts/push_website.sh
```

`.github_pat` is ignored by git and must never be committed.

### Manual Push

First push backup/source branches:

```bash
cd /SPXvePFS/share-users/kcyang/homepages/racoonykc.github.io
git push https://racoonykc@github.com/racoonykc/racoonykc.github.io.git al-folio-source

cd /SPXvePFS/share-users/kcyang/homepages/homepage-source
git push https://racoonykc@github.com/racoonykc/racoonykc.github.io.git homepage-source

cd /SPXvePFS/share-users/kcyang/homepages/site-deploy
git push https://racoonykc@github.com/racoonykc/racoonykc.github.io.git deploy-homepage
```

### Roll Back To Old al-folio Site

If you need to restore the old site later, either change the GitHub Pages source
back to the old branch or overwrite the deploy branch with the old site after
confirming the old site is the intended live version. A direct overwrite command
would be:

```bash
cd /SPXvePFS/share-users/kcyang/homepages/racoonykc.github.io
git push --force https://racoonykc@github.com/racoonykc/racoonykc.github.io.git al-folio-source:deploy-homepage
```

GitHub Pages may need a short time to refresh after each push.

## Quick Status Checks

Show local worktrees:

```bash
cd /SPXvePFS/share-users/kcyang/homepages/racoonykc.github.io
git worktree list
```

Check each directory is clean:

```bash
git -C /SPXvePFS/share-users/kcyang/homepages/racoonykc.github.io status --short
git -C /SPXvePFS/share-users/kcyang/homepages/homepage-source status --short
git -C /SPXvePFS/share-users/kcyang/homepages/site-deploy status --short
```
