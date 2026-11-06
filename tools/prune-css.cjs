// Removes CSS that can never match: selectors whose classes / ids / attribute
// values appear nowhere in the site's markup (HTML, SVG) or JS string literals.
// Selector lists keep their live members. Unused @keyframes are removed too.
// Usage (needs postcss: npm install --no-save postcss@8.5.6):
//   node tools/prune-css.cjs .           report
//   node tools/prune-css.cjs . --list    dead selectors by missing token
//   node tools/prune-css.cjs . --write   remove them (then run the screenshot parity check)
//   node tools/prune-css.cjs . --check   exit 1 if any dead CSS exists (CI)
const fs=require('fs'),path=require('path'),postcss=require('postcss');
const repo=process.argv[2],write=process.argv.includes('--write');
const html=fs.readFileSync(path.join(repo,'index.html'),'utf8');
const cssFiles=[...html.matchAll(/href="(assets\/[a-z0-9-]+\.css)/g)].map(m=>m[1]);
const jsFiles=fs.readdirSync(path.join(repo,'assets')).filter(f=>f.endsWith('.js')).map(f=>'assets/'+f);
const svg=fs.readFileSync(path.join(repo,'assets/creator-workspace.svg'),'utf8');
const classes=new Set(),ids=new Set(),values=new Set(),attrs=new Set(),words=new Set();
const add=(set,str)=>str.split(/[^A-Za-z0-9_-]+/).filter(Boolean).forEach(t=>set.add(t));
for(const doc of [html,svg]){
  for(const m of doc.matchAll(/\sclass="([^"]*)"/g))add(classes,m[1]);
  for(const m of doc.matchAll(/\sid="([^"]*)"/g))add(ids,m[1]);
  for(const m of doc.matchAll(/\s([a-zA-Z_:][-a-zA-Z0-9_:.]*)="([^"]*)"/g)){attrs.add(m[1]);add(values,m[2])}
}
// inline <script> blocks in the HTML count as JS (e.g. the daypart values)
const inlineJs=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
for(const m of inlineJs.matchAll(/(["'`])((?:\\.|(?!\1)[^\\\n])*)\1/g)){add(classes,m[2]);add(ids,m[2]);add(values,m[2]);add(attrs,m[2])}
for(const m of inlineJs.matchAll(/dataset\.([a-zA-Z]+)/g))attrs.add('data-'+m[1].replace(/[A-Z]/g,c=>'-'+c.toLowerCase()));
for(const m of inlineJs.matchAll(/classList\.(?:add|toggle|remove)\(\s*["']([^"']+)/g))add(classes,m[1]);
for(const f of jsFiles){
  const js=fs.readFileSync(path.join(repo,f),'utf8');
  for(const m of js.matchAll(/(["'`])((?:\\.|(?!\1)[^\\\n])*)\1/g)){add(classes,m[2]);add(ids,m[2]);add(values,m[2]);add(attrs,m[2])}
  add(words,js); // dataset.camelCase -> data-camel-case
  for(const m of js.matchAll(/dataset\.([a-zA-Z]+)/g))attrs.add('data-'+m[1].replace(/[A-Z]/g,c=>'-'+c.toLowerCase()));
}
const possible=sel=>{
  if(/:(is|where|has)\(/.test(sel))return true; // too clever to judge: keep
  const s=sel.replace(/:not\((?:[^()]|\([^()]*\))*\)/g,'');
  for(const m of s.matchAll(/\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g))if(!classes.has(m[1]))return false;
  for(const m of s.matchAll(/#([A-Za-z_][A-Za-z0-9_-]*)/g))if(!ids.has(m[1]))return false;
  for(const m of s.matchAll(/\[\s*([a-zA-Z_-][a-zA-Z0-9_-]*)\s*(?:[~|^$*]?=\s*["']?([^"'\]]*)["']?)?\s*\]/g)){
    if(!attrs.has(m[1]))return false;
    if(m[2]&&!m[2].split(/[^A-Za-z0-9_-]+/).filter(Boolean).every(t=>values.has(t)))return false;
  }
  return true;
};
if(process.argv.includes('--list')){
  const dead={};
  for(const f of cssFiles)postcss.parse(fs.readFileSync(path.join(repo,f),'utf8')).walkRules(r=>{
    if(r.parent&&r.parent.type==='atrule'&&/keyframes$/.test(r.parent.name))return;
    r.selectors.filter(s=>!possible(s)).forEach(s=>{
      const toks=(s.replace(/:not\((?:[^()]|\([^()]*\))*\)/g,'').match(/[.#][A-Za-z_-][A-Za-z0-9_-]*/g)||[]);
      const k=toks.find(t=>!(t[0]==='.'?classes:ids).has(t.slice(1)))||('attr '+s.slice(0,40));
      dead[k]=(dead[k]||0)+1;
    });
  });
  console.log(Object.entries(dead).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+':'+v).join('\n'));
  process.exit(0);
}
const report={files:{},removedRules:0,trimmedLists:0,removedKeyframes:0};
const roots=cssFiles.map(f=>({f,root:postcss.parse(fs.readFileSync(path.join(repo,f),'utf8'),{from:f})}));
for(const {f,root} of roots){
  let removed=0,trimmed=0;
  root.walkRules(rule=>{
    if(rule.parent&&rule.parent.type==='atrule'&&/keyframes$/.test(rule.parent.name))return;
    const live=rule.selectors.filter(possible);
    if(!live.length){rule.remove();removed++}
    else if(live.length<rule.selectors.length){rule.selectors=live;trimmed++}
  });
  report.files[f]={removed,trimmed};report.removedRules+=removed;report.trimmedLists+=trimmed;
}
// keyframes still referenced by any remaining declaration, or by name in JS
const used=new Set();
for(const {root} of roots)root.walkDecls(/^(animation|animation-name)$/,d=>add(used,d.value));
for(const f of jsFiles)add(used,fs.readFileSync(path.join(repo,f),'utf8'));
for(const {f,root} of roots){
  root.walkAtRules(/keyframes$/,at=>{if(!used.has(at.params.trim())){at.remove();report.removedKeyframes++;report.files[f].kf=(report.files[f].kf||0)+1}});
  // drop at-rules left empty
  let again=true;while(again){again=false;root.walkAtRules(at=>{if(at.nodes&&at.nodes.length===0){at.remove();again=true}})}
}
if(write)for(const {f,root} of roots)fs.writeFileSync(path.join(repo,f),root.toString());
if(process.argv.includes('--check')){
  if(report.removedRules||report.trimmedLists||report.removedKeyframes){console.error('Dead CSS found: '+JSON.stringify({rules:report.removedRules,lists:report.trimmedLists,keyframes:report.removedKeyframes})+'. Run node tools/prune-css.cjs . --list');process.exit(1)}
  console.log('CSS_CLEAN_PASS');process.exit(0);
}
console.log(JSON.stringify(report,null,1));
