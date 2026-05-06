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
aggregation require an external service such as ClustrMaps or PulseMaps.

The configuration entry is in:

```bash
/SPXvePFS/share-users/kcyang/homepages/homepage-source/config.json
```

Look for:

```json
"visitorWidget": {
  "enabled": true,
  "scriptSrc": ""
}
```

To enable live tracking:

1. Register `https://racoonykc.github.io` on a visitor-map service.
2. Copy only the script `src` URL from the embed code.
3. Paste that URL into `visitorWidget.scriptSrc`.
4. Rebuild `dist`, sync to `site-deploy`, commit, and push the deploy branch.

Example shape:

```json
"scriptSrc": "//cdn.clustrmaps.com/map_v2.js?cl=ffffff&w=300&t=tt&d=YOUR_SITE_KEY"
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

For a user site named `racoonykc.github.io`, GitHub Pages normally serves from
the repository's default branch, usually `main`, at the repository root.

### Recommended Safe Publish

First push backup/source branches:

```bash
cd /SPXvePFS/share-users/kcyang/homepages/racoonykc.github.io
git push origin al-folio-source

cd /SPXvePFS/share-users/kcyang/homepages/homepage-source
git push origin homepage-source

cd /SPXvePFS/share-users/kcyang/homepages/site-deploy
git push origin deploy-homepage
```

Then, after confirming the remote branches exist, make the live GitHub Pages
branch contain the deploy build:

```bash
cd /SPXvePFS/share-users/kcyang/homepages/site-deploy
git push origin deploy-homepage:main
```

This makes the GitHub Pages site show the new static HomePage build.

### Roll Back To Old al-folio Site

If you need to restore the old site later:

```bash
cd /SPXvePFS/share-users/kcyang/homepages/racoonykc.github.io
git push origin al-folio-source:main
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
