const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../_data/justquant.json'), 'utf8'));
const source = process.argv[2];
if (!source) throw new Error('Provide the path to experiments.tex');
const tex = fs.readFileSync(source, 'utf8');
function clean(cell) {
  return cell.replace(/\\citep\{[^}]*\}/g, '').replace(/\\ours\{\}/g, 'JustQuant')
    .replace(/\\textcolor\{[^}]*\}\{([^}]*)\}/g, '$1').replace(/\\best\{([^}]*)\}/g, '$1')
    .replace(/\\pm/g, '+/-').replace(/\\\\.*$/, '').replace(/[$~{}]/g, '').trim();
}
function block(start) {
  const index = tex.indexOf(start);
  assert.ok(index >= 0, 'Source anchor: '+start);
  return tex.slice(index, tex.indexOf('\\bottomrule', index)).split(/\r?\n/)
    .filter(line => line.includes('&')).map(line => line.split('&').map(clean));
}
function compare(key, rows) {
  const expected = data.tables[key].rows.map(row => [row.method, ...row.cells, ...(data.tables[key].operators ? [row.ops] : [])]);
  const normalize = rows => rows.map(row => row.map(cell => cell.replace(/\s+/g, '')));
  assert.deepEqual(normalize(rows), normalize(expected), 'Paper cells match '+key);
  return {table: key, rows: rows.length, cells: rows.reduce((n, row) => n + row.length, 0)};
}
const dit = block('Setting & Method & W/A').slice(1).map(row => row.slice(1));
const flux = block('Model & Method & FID').slice(1).map(row => row.slice(1));
const elf = block('\\label{tab:elf_owt}').filter(row => row.length === 7 && ['FP','JustQuant','RobuQ','Direct QAT'].includes(row[1])).map(row => row.slice(1));
const report = [compare('dit10',dit.slice(0,15)), compare('dit50',dit.slice(15)), compare('schnell',flux.slice(0,6)), compare('dev',flux.slice(6)), compare('elf4',elf.slice(0,4)), compare('elf158',elf.slice(4)), compare('lladaGsm',block('Method & Greedy').slice(1)), compare('lladaTransfer',block('Method & PIQA').slice(1))];
console.log(JSON.stringify({ok:true,source,report},null,2));
