import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('/Users/theokl/Downloads/AEGIS-SIH2026-Final.pptx'));
const snap=await p.inspect({kind:'slide,textbox,image,layout',maxChars:50000});
await fs.writeFile('/Users/theokl/Dev/theo/tmp/aegis-diagrams/inspection.ndjson',snap.ndjson);
console.log(snap.ndjson);
console.log('MASTERS',p.masters.items.map(x=>({id:x.id,placeholders:x.placeholders?.summary()})));
