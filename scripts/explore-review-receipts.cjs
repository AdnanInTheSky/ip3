// Read-only authentication of supplied receipts against their original handoff.
// Usage: node scripts/explore-review-receipts.cjs <receipt.json> <handoff-root> <output.json>
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const [receiptFile,sourceRoot,output]=process.argv.slice(2);
if(!receiptFile||!sourceRoot||!output)throw new Error('Provide receipt JSON, original handoff root and output JSON.');
const receiptBytes=fs.readFileSync(receiptFile),data=JSON.parse(receiptBytes),root=path.resolve(sourceRoot),results=[];
for(const [tag,r]of Object.entries(data.receipts)){
  const file=path.resolve(root,r.source_relative_path),rel=path.relative(root,file);
  if(rel.startsWith('..')||path.isAbsolute(rel))throw new Error('Receipt path leaves the original handoff.');
  const bytes=fs.readFileSync(file),sha=crypto.createHash('sha256').update(bytes).digest('hex'),text=bytes.toString('utf8');
  const hasTextAnchor=r.type==='text'&&Number.isInteger(r.char_start)&&Number.isInteger(r.char_end);
  const result={tag,source:r.source_relative_path,sha256:sha,hashMatched:sha===r.sha256,bytesMatched:bytes.length===r.bytes,anchorCheck:hasTextAnchor?'Literal text and offsets':'Not applicable: binary/image receipt uses hash and byte count',anchorMatched:hasTextAnchor?text.slice(r.char_start,r.char_end)===r.anchor:true};
  result.passed=result.hashMatched&&result.bytesMatched&&result.anchorMatched;results.push(result);
}
const report={receiptSHA256:crypto.createHash('sha256').update(receiptBytes).digest('hex'),scope:data.scope,interpretation:'Authenticates original-source findings only; current runtime is verified separately.',results,passed:results.every(r=>r.passed)};
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(`${results.filter(r=>r.passed).length}/${results.length} receipts match`);if(!report.passed)process.exitCode=1;
