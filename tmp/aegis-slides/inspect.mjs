import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('/Users/theokl/Downloads/SIH2026-IDEA-Presentation-Format.pptx'));
console.log((await p.inspect({kind:'slide,textbox,shape,image,layout',maxChars:50000})).ndjson);
console.log('MASTERS',p.masters.items.map(m=>({id:m.id,name:m.name})));
for(let i=0;i<p.slides.items.length;i++){
 const s=p.slides.items[i];
 await fs.writeFile(`/Users/theokl/Dev/theo/tmp/aegis-slides/source-${i+1}.png`,new Uint8Array(await (await s.export({format:'png',scale:1})).arrayBuffer()));
 await fs.writeFile(`/Users/theokl/Dev/theo/tmp/aegis-slides/source-${i+1}.json`,await (await s.export({format:'layout'})).text());
}
