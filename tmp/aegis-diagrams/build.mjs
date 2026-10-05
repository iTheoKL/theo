import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root='/Users/theokl/Dev/theo';
const tmp=path.join(root,'tmp/aegis-diagrams');
const skill='/Users/theokl/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations';
const source='/Users/theokl/Downloads/AEGIS-SIH2026-Final.pptx';
const p=await PresentationFile.importPptx(await FileBlob.load(source));
const snap=await p.inspect({kind:'slide,textbox,image,shape',maxChars:100000});
const records=snap.ndjson.split('\n').filter(Boolean).map(x=>JSON.parse(x));
for(const r of records) if(r.slide>=2&&r.slide<=5&&r.bbox&&r.bbox[1]>=125&&r.bbox[1]<660&&['textbox','shape','image'].includes(r.kind)) p.resolve(r.id).delete();
const blue='#1F497D', accent='#0070C0', ink='#17212B';
function text(s,str,x,y,w,h,size=24,bold=false,color=ink,align='left'){
 const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 a.text=str;a.text.style={typeface:'Arial',fontSize:size,bold,color,alignment:align,verticalAlignment:'top',autoFit:'none',wrap:'square',insets:{left:0,right:0,top:0,bottom:0}};return a;
}
function heading(s,t,y,size=27){return text(s,t,64,y,1152,38,size,true,blue);}
function node(s,title,body,x,y,w,h=112){
 const a=s.shapes.add({geometry:'rect',name:title,position:{left:x,top:y,width:w,height:h},fill:'#F4F8FC',line:{fill:accent,width:2}});
 text(s,title,x+12,y+15,w-24,32,24,true,blue,'center');
 text(s,body,x+12,y+51,w-24,h-57,22,false,ink,'center');return a;
}
function arrow(s,a,b,from='right',to='left',dashed=false){return s.shapes.connect(a,b,{kind:'straight',fromSide:from,toSide:to,line:{fill:accent,width:3,style:dashed?'dashed':'solid'},tail:{type:'triangle',width:'lg',length:'lg'}});}
function chain(s,items,y,h=112){const xs=[64,364,664,964];const nodes=items.map((d,i)=>node(s,d[0],d[1],xs[i],y,248,h));for(let i=1;i<nodes.length;i++)arrow(s,nodes[i-1],nodes[i]);return nodes;}
function notes(s,t){s.speakerNotes.textFrame.setText(t);}
const s2=p.slides.getItem(1);
heading(s2,'Proposed Solution (Describe your Idea/Solution/Prototype)',139,28);
heading(s2,'Detailed explanation of the proposed solution',191,26);
chain(s2,[['Reported wallet','Complaint and\ncase context'],['Intermediary hops','Trace outgoing\nfund movement'],['Receiving VASP','First supported\ncandidate per path'],['Investigator lead','Fund trail, sources\nand next action']],244,122);
heading(s2,'How it addresses the problem',401);
text(s2,'Continuous monitoring will alert investigators when funds move or a receiving VASP appears.',76,442,1130,34,24);
text(s2,'A case report will support review, preservation requests and coordination with the VASP.',76,479,1130,34,24);
heading(s2,'Innovation and uniqueness of the solution',539);
text(s2,'Each lead links the transaction path to attribution sources and an investigative next step.',76,579,1130,32,24);
text(s2,'New transactions and revised labels will update findings while preserving earlier analysis.',76,613,1130,32,24);
notes(s2,'Proposed end product, not achieved performance. A supported receiving VASP is a candidate backed by address-label evidence along a time-consistent outgoing path. A label is not proof of customer identity or complicity. The package contains transaction IDs, amounts, timestamps, label provenance, confidence rationale, uncertainty and recommended investigator review. Real-time monitoring depends on provider/index updates. Requests remain subject to authorized investigator action and applicable procedures.');
const s3=p.slides.getItem(2);
heading(s3,'Technologies to be used',144);
text(s3,'React dashboard and FastAPI services, queued workers, incremental transaction indexing,',76,185,1130,33,24);
text(s3,'persistent case storage and a versioned VASP-label registry.',76,220,1130,33,24);
heading(s3,'Methodology and process for implementation',274);
const arch=chain(s3,[['Chain adapters','Bitcoin, EVM/TRON\nSupported bridges'],['Tracing engine','Spend links and\ntransfer events'],['VASP matching','Sourced labels and\ncautious clustering'],['Case workspace','Review candidates\nMonitor and report']],330,124);
const reg=node(s3,'Label registry','Source provenance\nReview date',664,506,248,112);
arrow(s3,reg,arch[2],'top','bottom');
text(s3,'Time-consistent paths\nExplicit gaps at mixing\nor unsupported bridges',76,506,270,96,23,false,blue);
text(s3,'Explainable rules and\nevaluated ML will flag\nsuspect flow patterns',364,506,275,96,23);
text(s3,'Role-based access\nAudit trail\nApproved LEA APIs',970,506,245,96,23);
text(s3,'Findings will distinguish observed transactions, inferred links and unresolved attribution.',76,627,1130,30,22,false,blue);
notes(s3,'Proposed architecture. Bitcoin tracing follows UTXO spend relationships, while EVM/TRON adapters follow transfer events. Transactions involving multiple inputs/outputs require explicit allocation assumptions: a graph path alone does not prove exact victim-fund continuity. Bridge correlation requires supported event identifiers and mappings. Collaborative transactions and mixing can invalidate naive clustering. Source labels and heuristic expansions must remain distinct. Candidate ranking should explain evidence strength rather than invent calibrated probabilities. AI/ML is planned and requires evaluation before operational use. NCRP/SAHYOG integration depends on approved interfaces and authorization. Method references: Meiklejohn et al. https://conferences.sigcomm.org/imc/2013/papers/imc182-meiklejohnA.pdf ; Weber et al. https://arxiv.org/abs/1908.02591 ; Esplora https://github.com/Blockstream/esplora/blob/master/API.md');
const s4=p.slides.getItem(3);
heading(s4,'Analysis of feasibility of the idea',145);
chain(s4,[['1. Validate','Bitcoin attribution'],['2. Monitor','Movement alerts'],['3. Extend','EVM/TRON, bridges'],['4. Integrate','Approved LEA access']],194,98);
text(s4,'Label supply: reviewed public disclosures and authorized VASP data, with source history.',76,313,1130,55,24);
text(s4,'Potential challenges\nand risks',64,382,370,65,26,true,blue);
text(s4,'Strategies for overcoming these challenges',470,382,746,65,26,true,blue);
const rows=[['Uncertain labels and flows','Version label sources, review clusters and show unresolved paths.'],['Provider limits and large histories','Index incrementally, cache queries and bound graph traversal.'],['Sensitive cases and restricted access','Role-based permissions, audit logs and approved NCRP/SAHYOG APIs.']];
const table=s4.tables.add({rows:3,columns:2,left:64,top:449,width:1152,height:150,columnWidths:[392,760],values:rows});
table.borders.assign({fill:'#CCD9E6',width:1,style:'solid'});
for(let r=0;r<3;r++)for(let c=0;c<2;c++){let cell=table.getCell(r,c);cell.fill=r%2?'#F4F8FC':'#FFFFFF';cell.text.style={typeface:'Arial',fontSize:22,color:ink,verticalAlignment:'middle',insets:{left:12,right:12,top:8,bottom:8}};}
text(s4,'Validation: held-out labelled paths and hard negatives. Measure precision, coverage and alert latency.',76,616,1130,44,22,false,blue);
notes(s4,'Proposed phased delivery, not a statement of current maturity. Data supply is a dependency: public disclosures alone are not a comprehensive exchange-deposit registry. Authorized partner data may require agreements and licensing. Held-out evaluation should prevent overlap with registry construction and include withdrawals, change outputs, collaborative transactions and unlabelled addresses as hard cases. Measure attribution precision, coverage, false positives and p95 alert latency under declared load. Agency deployment needs privacy controls, encrypted storage/transport, retention policy, audit review and approved integration access. Source: Binance historical disclosure https://www.binance.com/en-IN/blog/community/2895840147147652626 ; NIST SP 800-86 https://csrc.nist.gov/pubs/sp/800/86/final');
const s5=p.slides.getItem(4);
heading(s5,'Potential impact on the target audience',145);
text(s5,'Investigators will receive a prioritized receiving-VASP lead with a reviewable fund trail.',76,186,1130,34,24);
text(s5,'Illustrative investigation',64,238,1152,32,24,true,blue);
const a=node(s5,'Wallet A','Reported address',64,286,248,106);
const b=node(s5,'Wallet B','Intermediary',364,286,248,106);
const c=node(s5,'Deposit address','Sourced VASP label',664,286,248,106);
const d=node(s5,'VASP X','Receiving candidate',964,286,248,106);
arrow(s5,a,b);arrow(s5,b,c);arrow(s5,c,d,'right','left',true);
text(s5,'Transaction 1',266,261,145,25,18,false,blue,'center');
text(s5,'Transaction 2',566,261,145,25,18,false,blue,'center');
text(s5,'Attribution',866,261,145,25,18,false,blue,'center');
text(s5,'Finding',64,415,110,31,24,true,blue);
text(s5,'Two-hop path, transaction IDs, amounts, timestamps and label source.',191,415,1020,31,24);
text(s5,'Next action',64,456,130,31,24,true,blue);
text(s5,'Investigator reviews the lead and prepares a VASP preservation request.',214,456,1000,31,24);
text(s5,'Fictional illustration. Transaction paths alone do not prove exact fund continuity or wrongdoing.',76,500,1130,28,20,false,blue);
heading(s5,'Benefits of the solution (social, economic, environmental, etc.)',542,25);
text(s5,'Social',76,585,340,30,24,true,blue);text(s5,'Support timely intervention',76,619,350,30,23);
text(s5,'Economic',459,585,340,30,24,true,blue);text(s5,'Reduce repeated tracing work',459,619,350,30,23);
text(s5,'Operational',854,585,350,30,24,true,blue);text(s5,'Standardize VASP coordination',854,619,365,30,23);
notes(s5,'Fictional proposed-use illustration only, not evidence from a demonstrated fraud case. Wallet A transfers to B, which later transfers to an address sourced to hypothetical VASP X. Solid arrows denote the illustrated transactions, and the dashed arrow denotes attribution rather than another transfer. Exact victim-fund attribution may remain uncertain because of mixing, unrelated balances or multi-input/output transactions. The investigator must review allocation assumptions and source reliability. The platform supports coordination and preservation requests but cannot independently freeze funds or guarantee recovery. Expected benefits must be evaluated during pilots.');
await (await PresentationFile.exportPptx(p)).save(path.join(tmp,'candidate.pptx'));
const {finalizePresentation}=await import(path.join(skill,'container_tools/artifact_tool_utils.mjs'));
const result=await finalizePresentation({workspaceDir:root,candidatePath:path.join(tmp,'candidate.pptx'),finalPath:path.join(root,'output/aegis-sih/AEGIS-SIH2026-Visual-Pitch.pptx'),explicitTotalSlideCount:6,requiredNativeTableOwnerSlides:[4],pythonExecutable:'/Users/theokl/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','4'],fontPolicy:{basis:'reference',families:['Arial','Times New Roman','Calibri','TradeGothic'],referencePath:source,referenceSha256:crypto.createHash('sha256').update(await fs.readFile(source)).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(tmp,'validation-visual.json')});
console.log(result);
