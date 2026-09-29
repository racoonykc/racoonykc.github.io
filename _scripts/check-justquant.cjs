const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, '_data/justquant.json'), 'utf8'));
const archive = JSON.parse(fs.readFileSync(path.join(root, '_data/justquant_gallery.json'), 'utf8'));
const output = path.join(os.tmpdir(), 'justquant-review');
fs.mkdirSync(output, {recursive: true});
const panels = {'dit10-panel':'dit10','dit50-panel':'dit50','schnell-panel':'schnell','dev-panel':'dev','elf4-panel':'elf4','elf158-panel':'elf158','gsm-panel':'lladaGsm','transfer-panel':'lladaTransfer'};

(async () => {
  const browser = await chromium.launch({headless: true, channel: "chromium"});
  try {
    if (process.argv.includes('--reference')) {
      const ref = await browser.newPage({viewport: {width: 1440, height: 1000}, deviceScaleFactor: 1});
      await ref.goto('https://www.onebit-ai.in/', {waitUntil:'domcontentloaded', timeout:60000});
      await ref.waitForTimeout(3500);
      await ref.screenshot({path: path.join(output, 'reference-desktop.png')});
      console.log(JSON.stringify({reference: await ref.title(), screenshot: path.join(output, 'reference-desktop.png')}));
      await ref.close();
      return;
    }
    const report = [];
    const deadline = Date.now() + 60000;
    while (true) {
      const html = await fetch('http://127.0.0.1:4000/projects/justquant/').then(r=>r.text());
      if (html.includes('data-scene-gallery') && html.includes('justquant.js?v=6')) break;
      assert.ok(Date.now() < deadline, 'Preview rebuilt the standalone project layout');
      await new Promise(resolve=>setTimeout(resolve, 1000));
    }
    const context = await browser.newContext({deviceScaleFactor:1, reducedMotion:'reduce'});
    for (const viewport of [{width:1440,height:1000},{width:1280,height:800},{width:768,height:1024},{width:390,height:844},{width:320,height:740}]) {
      const page = await context.newPage();
      await page.setViewportSize(viewport);
      const errors = [];
      const external = [];
      page.on('request', r=>{if (new URL(r.url()).hostname !== '127.0.0.1') external.push(r.url());});
      page.on('pageerror', e => errors.push(e.message));
      await page.goto('http://127.0.0.1:4000/projects/justquant/', {waitUntil:'domcontentloaded', timeout:60000});
      await page.waitForSelector('.jq-page[data-enhanced]');
      assert.equal(await page.locator('body').getAttribute('class'), 'jq-project-site');
      assert.notEqual(await page.locator('.jq-intro h2 br').evaluate(el=>getComputedStyle(el).display), 'none', 'The introduction retains its line break');
      assert.equal(await page.locator('h1').count(), 1, 'Exactly one title');
      assert.equal(await page.locator('h1').innerText(), 'JustQuant');
      assert.equal(await page.locator('.jq-page .jq-model').count(), 4);
      assert.equal(await page.locator('#question-title').evaluate(el=>getComputedStyle(el).color), 'rgb(255, 255, 255)', 'Question heading is legible on black');
      assert.equal(await page.locator('.jq-page').evaluate(el => /[\u4e00-\u9fff]/.test(el.textContent)), false, 'English project copy');
      const dimensions = await page.evaluate(() => ({viewport:innerWidth,scroll:document.documentElement.scrollWidth,content:document.querySelector('.jq-container').getBoundingClientRect().width,bodySize:getComputedStyle(document.querySelector('.jq-page')).fontSize}));
      assert.ok(dimensions.scroll <= dimensions.viewport + 1, 'No page-level horizontal overflow: '+JSON.stringify(dimensions));
      const imgs = await page.locator('.jq-page img').evaluateAll(async imgs => Promise.all(imgs.map(async img => {img.loading='eager'; try {await img.decode();} catch {} return {src:img.getAttribute('src'),width:img.naturalWidth,height:img.naturalHeight};})));
      assert.equal(imgs.length, 12 + archive.scenes.length);
      assert.ok(imgs.every(img=>img.width>0), 'Every paper image loads');
      assert.equal(/ternary/i.test(await page.locator('#dit').innerText()), false, 'DiT uses W1.58A4 notation');
      assert.equal(await page.locator('[data-scene-id]').count(), archive.scenes.length);
      assert.equal(await page.locator('.jq-ship').count(), 3, 'Three stages of the ship analogy');
      const planks = await page.locator('.jq-ship').evaluateAll(ships=>ships.map(ship=>ship.querySelectorAll('.jq-ship-plank-new').length));
      assert.deepEqual(planks, [0,3,6], 'Planks change progressively while the outline stays the same');
      assert.ok(await page.evaluate(()=>document.querySelector('.jq-teaser').getBoundingClientRect().bottom < document.querySelector('.jq-question').getBoundingClientRect().top), 'Paper teaser precedes the central question');
      for (const [panel,key] of Object.entries(panels)) {
        const tab=page.locator('[data-panel="'+panel+'"]');
        await tab.click();
        await page.locator('#'+panel).waitFor({state:'visible'});
        assert.equal(await tab.getAttribute('aria-selected'), 'true');
        const rows=await page.locator('[data-table="'+key+'"] tbody tr').evaluateAll(rows=>rows.map(row=>Array.from(row.children).map(cell=>cell.textContent.trim().replaceAll('\u00b1','+/-'))));
        const expected=data.tables[key].rows.map(row=>[row.method,...row.cells,...(data.tables[key].operators?[row.ops]:[])]);
        assert.deepEqual(rows, expected, 'All cells match source data for '+key);
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
        assert.equal(overflow,false,'No overflow after tab '+key);
      }
      await page.locator('#dit10-tab').click();
      await page.locator('#dit10-tab').press('ArrowRight');
      assert.equal(await page.locator('#dit50-tab').getAttribute('aria-selected'),'true','Keyboard tab navigation');
      await page.locator('#dit50-tab').press('Home');
      await page.locator('#schnell-tab').click();
      await page.locator('#elf4-tab').click();
      await page.locator('#gsm-tab').click();
      const sceneGallery = page.locator('[data-scene-gallery]');
      const sceneIndices = viewport.width === 1440 ? archive.scenes.map((_, i)=>i) : [0,8,17];
      for (const index of sceneIndices) {
        const scene = archive.scenes[index];
        await page.locator('[data-scene-id="'+scene.id+'"]').click();
        await page.waitForFunction(id=>document.querySelector('[data-scene-gallery]').dataset.activeScene===id, scene.id);
        const displayed = await sceneGallery.locator('[data-track] img').evaluateAll(imgs=>imgs.map(img=>({src:img.getAttribute('src'),file:img.dataset.methodFile,width:img.naturalWidth,height:img.naturalHeight,href:img.closest('a').getAttribute('href')})));
        assert.equal(displayed.length,4);
        displayed.forEach(img=>{
          assert.ok(img.src.endsWith('/'+scene.id+'/'+img.file), 'The four methods use the same scene');
          assert.equal(img.src,img.href,'Full-size links match displayed originals');
          assert.equal(img.width,1024);
          assert.equal(img.height,1024);
        });
        assert.equal(await sceneGallery.locator('[aria-pressed="true"]').count(),1);
      }
      assert.equal(await page.getByRole('button',{name:'Next FLUX scene',exact:true}).isDisabled(),true);
      await page.getByRole('button',{name:'Previous FLUX scene',exact:true}).click();
      await page.waitForFunction(id=>document.querySelector('[data-scene-gallery]').dataset.activeScene===id, archive.scenes[16].id);
      await page.locator('[data-scene-id="'+archive.scenes[16].id+'"]').focus();
      await page.locator('[data-scene-id="'+archive.scenes[16].id+'"]').press('Home');
      await page.waitForFunction(id=>document.querySelector('[data-scene-gallery]').dataset.activeScene===id, archive.scenes[0].id);
      assert.equal(await page.getByRole('button',{name:'Previous FLUX scene',exact:true}).isDisabled(),true);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Archive controls do not overflow the viewport');
      const track=page.locator('.jq-dit-track');
      await track.scrollIntoViewIfNeeded();
      assert.equal(await page.getByRole('button',{name:'Previous DiT comparison'}).isDisabled(), true);
      await page.getByRole('button',{name:'Next DiT comparison'}).click();
      await page.waitForFunction(()=>document.querySelector('.jq-dit-track').scrollLeft>0);
      await track.focus();
      await track.press('End');
      await page.waitForFunction(()=>document.querySelector('[aria-label="Next DiT comparison"]').disabled);
      assert.equal(await page.getByRole('button',{name:'Next DiT comparison'}).isDisabled(), true);
      await track.press('Home');
      assert.equal(await track.evaluate(el=>el.scrollLeft),0);
      if (viewport.width < 600) {
        const flux=page.locator('#schnell-panel [data-track]');
        await flux.scrollIntoViewIfNeeded();
        await page.getByRole('button',{name:'Next schnell sample'}).click();
        assert.ok(await flux.evaluate(el=>el.scrollLeft)>0,'Mobile FLUX scrolling');
        await flux.focus();
        await flux.press('Home');
        const table=page.locator('#dit10-panel .jq-table-scroll');
        assert.ok(await table.evaluate(el=>el.scrollWidth>el.clientWidth),'Mobile tables scroll');
      }
      await page.evaluate(()=>scrollTo(0,0));
      await page.screenshot({path:path.join(output,'project-'+viewport.width+'.png')});
      if (viewport.width===1440 || viewport.width===390) {
        await page.screenshot({path:path.join(output,'full-'+viewport.width+'.png'),fullPage:true});
        await page.locator('#flux').evaluate(el=>el.scrollIntoView({block:'start'}));
        await page.screenshot({path:path.join(output,'flux-'+viewport.width+'.png')});
        await page.locator('#dit').evaluate(el=>el.scrollIntoView({block:'start'}));
        await page.screenshot({path:path.join(output,'dit-'+viewport.width+'.png')});
        await page.locator('.jq-method').evaluate(el=>el.scrollIntoView({block:'start'}));
        await page.screenshot({path:path.join(output,'theseus-'+viewport.width+'.png')});
        await page.locator('.jq-teaser').screenshot({path:path.join(output,'teaser-'+viewport.width+'.png')});
      }
      assert.deepEqual(errors, [], 'No browser runtime errors');
      assert.deepEqual(external, [], 'Project preview loads only local resources');
      report.push({viewport,...dimensions,images:imgs.length,archiveScenesTested:sceneIndices.length,tables:Object.keys(panels).length,consoleErrors:errors,screenshots:output});
      console.log('Passed browser checks at width '+viewport.width);
      await page.close();
    }
    const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
    await nojs.goto('http://127.0.0.1:4000/projects/justquant/',{waitUntil:'domcontentloaded'});
    assert.equal(await nojs.locator('.jq-panel:visible').count(),8,'All tables accessible without JS');
    await nojs.close();
    console.log(JSON.stringify({ok:true,report,noJsPanels:8},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
