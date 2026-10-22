// Preserve complete Lighthouse JSON as byte-identical gzip archives. This only
// removes this task's own lh-*.json files after verified round-trip compression.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.EXPLORE_QA_OUT||path.join(root,'docs/interactive-experience/review-2026-10-22/FINAL_QA_EVIDENCE'));
if(!out.startsWith(root+path.sep))throw Error('Evidence archive must remain inside this repository.');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),files=[];
for(const name of fs.readdirSync(out))if(/^lh-(baseline|after|after-final)-(mobile|desktop)-[a-z-]+-\d+\.json$/.test(name)){
  const filename=path.join(out,name),bytes=fs.readFileSync(filename),compressed=zlib.gzipSync(bytes,{level:9});
  if(!zlib.gunzipSync(compressed).equals(bytes))throw Error('Archive round trip differs: '+name);
  fs.writeFileSync(filename+'.gz',compressed);files.push({name,archive:name+'.gz',bytes:bytes.length,archiveBytes:compressed.length,sha256:sha(bytes),archiveSHA256:sha(compressed),roundTripVerified:true});
  fs.unlinkSync(filename);
}
if(files.length)fs.writeFileSync(path.join(out,'lighthouse-archives.json'),JSON.stringify({meaning:'Complete unchanged Lighthouse reports, gzip compressed after byte-equality check',files},null,2)+'\n');
console.log('Archived '+files.length+' complete reports without changing their bytes or scores.');
