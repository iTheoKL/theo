import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
import {finalizePresentation,makeNativeBulletParagraphs} from '/Users/theokl/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='/Users/theokl/Dev/theo';
const tmp=root+'/tmp/aegis-slides';
const source='/Users/theokl/Downloads/SIH2026-IDEA-Presentation-Format.pptx';
const skill='/Users/theokl/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations';
const p=await PresentationFile.importPptx(await FileBlob.load(source));
const logo=execFileSync('/usr/bin/unzip',['-p',source,'ppt/media/image2.png']);
for(const id of ['im/s7a1obih','im/upc369ob','im/hsf6d4ji','im/43m1wbqd','im/w7uxkbq5','im/net0vexk']){
 const im=p.resolve(id);im.replace({blob:logo,contentType:'image/png',fit:'contain',alt:'Official Smart India Hackathon 2026 logo'});im.frame={left:1026.78,top:0.16,width:236.2,height:111.53};
}
const blue='#1F497D';
const slide=p.slides.items;
function style(s,size=25,bold=false,color='#111111'){s.text.style={typeface:'Arial',fontSize:size,bold,color,autoFit:'none',wrap:'square',alignment:'left',verticalAlignment:'top',insets:{left:0,right:0,top:0,bottom:0}};}
function box(s,text,x,y,w,h,size=25,bold=false,color='#111111'){
 const b=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});b.text=text;style(b,size,bold,color);return b;
}
function head(s,t,y,size=28){return box(s,t,64,y,1152,38,size,true,blue);}
function bullets(s,lines,y,h,size=25){const b=box(s,'',76,y,1134,h,size);b.text=makeNativeBulletParagraphs(lines,{marginLeftPoints:15,hangingPoints:10,spaceAfterPoints:7});style(b,size);return b;}
function notes(s,t){s.speakerNotes.textFrame.setText(t);}
const ids={titles:['sh/dkvmpszm','sh/j6dgf6tk','sh/ud8fyt4z','sh/y1g7ylcj','sh/1kj2p0ve'],bodies:['sh/qx4nud0b','sh/1k3214v2','sh/sjad83id','sh/g7alsnu1','sh/vq5cve1s'],teams:['sh/ove9o7yd','sh/m1c3mlsn','sh/i94r6xgz','sh/ahkvi1cb','sh/pc76hkr2'],nums:['sh/x4r21kru','sh/obq90bml','sh/doj29oba','sh/l4bupwny','sh/ml07i9sv']};
const titles=['AEGIS FORENSICS','TECHNICAL APPROACH','FEASIBILITY AND VIABILITY','IMPACT AND BENEFITS','RESEARCH AND REFERENCES'];
for(let i=0;i<5;i++){
 const t=p.resolve(ids.titles[i]);t.text=titles[i];t.position={left:184,top:26,width:832,height:76};style(t,i===2||i===4?41:46,true,'#000000');t.text.style={typeface:'Times New Roman',alignment:'center',verticalAlignment:'middle'};
 p.resolve(ids.bodies[i]).delete();
 const team=p.resolve(ids.teams[i]);team.text='COLD\nCOFFEE';style(team,19,true);team.text.style={alignment:'center',verticalAlignment:'middle'};team.fill='#FFFFFF';team.line={fill:'#8064A2',width:2};team.position={left:34.62,top:26.48,width:131.43,height:84.76};team.bringToFront();
 const num=p.resolve(ids.nums[i]);num.position={left:1195,top:678,width:40,height:25};num.text=String(i+2);style(num,17,true,'#FFFFFF');
}
const cover=p.resolve('sh/wn6dc7eh');cover.text='';
const top=p.resolve('sh/fu94fe98');top.text='SMART INDIA HACKATHON 2026';top.position={left:34,top:20,width:982,height:82};style(top,46,true,blue);top.text.style={alignment:'center'};
const sub=p.resolve('sh/7qp4be9c');sub.text='TITLE PAGE';sub.position={left:130,top:120,width:896,height:64};style(sub,38,true,'#777777');sub.text.style={typeface:'Times New Roman',alignment:'center'};
box(slide[0],'Problem Statement ID: SIH26183',44,237,650,38,26,true);
box(slide[0],'Problem Statement Title',44,286,650,34,26,true);
box(slide[0],'Real-Time Identification of Fraud-Linked Cryptocurrency Exchanges from Victim-Reported Suspect Wallet Addresses through Automated Blockchain Analytics',44,326,641,146,25);
box(slide[0],'Theme: Blockchain & Cybersecurity',44,483,650,34,25,true);
box(slide[0],'PS Category: Software',44,527,650,34,25,true);
box(slide[0],'Team ID: [ENTER REGISTERED TEAM ID]',44,571,650,34,25,true,blue);
box(slide[0],'Team Name (Registered on portal):\nCOLD COFFEE',44,615,650,69,25,true);
notes(slide[0],'Team ID is intentionally left for the team to complete before submission. Problem statement title supplied by the user.');

head(slide[1],'Proposed Solution (Describe your Idea/Solution/Prototype)',137,29);
head(slide[1],'Detailed explanation of the proposed solution',187,26);
bullets(slide[1],[
 'A reported wallet becomes an actionable receiving-VASP lead, with a reviewable fund trail.',
 'AEGIS will trace intermediary hops and identify the first supported receiving VASP on each path.',
 'Each finding will include transactions, amounts, timestamps, label sources and next actions.'
],225,142,25);
head(slide[1],'How it addresses the problem',375,26);
bullets(slide[1],[
 'Continuous monitoring will alert investigators when funds move or an actionable destination appears.',
 'A case-linked report will support preservation requests and coordination with the receiving VASP.'
],413,111,25);
head(slide[1],'Innovation and uniqueness of the solution',532,26);
bullets(slide[1],[
 'An evidence-linked case package will connect attribution reasoning directly to investigative action.',
 'New transactions or revised labels will update findings while preserving the earlier analysis.'
],570,82,24);
notes(slide[1],'Proposed differentiation: an integrated, revisable investigation package links the receiving-VASP path, source-labelled attribution, evidence strength and next action. This is a design proposition, not a world-first claim. Nearest is the first supported receiving VASP on a directed, time-consistent path within the investigated scope. A VASP label is not proof of a specific customer account or complicity in fraud. Monitoring responds to provider/indexer updates rather than promising zero latency.');

head(slide[2],'Technologies to be used',139,28);
box(slide[2],'React + FastAPI, queued workers, a transaction index and versioned VASP-label storage.',76,180,1134,34,25);
head(slide[2],'Methodology and process for implementation',231,28);
bullets(slide[2],[
 'Trace time-consistent outgoing paths. Track spend links on Bitcoin and transfer events on EVM/TRON.',
 'Match sourced labels, cautiously expand clusters and rank receiving candidates by evidence strength.',
 'Correlate supported bridge events. Explainable rules and evaluated ML will flag laundering patterns.'
],274,139,24);
slide[2].images.add({blob:await fs.readFile(tmp+'/workflow.png'),contentType:'image/png',alt:'Proposed workflow: complaint intake, collect and trace, match receiving VASP, review findings as candidate or unresolved, monitor and report.',fit:'cover',position:{left:55,top:418,width:1170,height:205},crop:{left:0,top:0.20,right:0,bottom:0.23}});
box(slide[2],'Ambiguous ownership, mixing and unsupported bridges will remain explicit tracing gaps.',76,629,1134,28,21,false,blue);
notes(slide[2],'Proposed algorithm: normalize complaint chain/address and available transaction/time context; build a directed transaction graph; traverse time-consistent paths under hop, value and runtime limits; query versioned address labels; treat common-input clustering as a separate inference and suppress unsafe merges for collaborative transactions. Bitcoin spend links connect outputs to later inputs, but assigning value through transactions with several inputs and outputs requires an explicit allocation assumption. Account-based transfers do not by themselves prove continuity of particular funds. Bridge correlation needs supported event/message identifiers, not amount similarity alone. Rank candidate paths using trace support and label provenance without inventing calibrated probabilities. Recompute affected findings when indexed transactions or labels change. https://github.com/Blockstream/esplora/blob/master/API.md ; https://conferences.sigcomm.org/imc/2013/papers/imc182-meiklejohnA.pdf ; https://arxiv.org/abs/1908.02591 . Workflow is an illustration of the proposed system.');

head(slide[3],'Analysis of the feasibility of the idea',141,28);
bullets(slide[3],[
 'Label supply: exchange disclosures and reviewed public labels, supplemented by authorized VASP data.',
 'Delivery: validate Bitcoin attribution first, then monitoring, EVM/TRON and supported bridge adapters.'
],181,118,24);
head(slide[3],'Potential challenges and risks',311,28);
bullets(slide[3],[
 'Incomplete labels and ambiguous flows can produce missed matches or false attribution.',
 'Provider limits, sensitive case data and integration access constrain agency deployment.'
],351,104,24);
head(slide[3],'Strategies for overcoming these challenges',472,28);
bullets(slide[3],[
 'Index incrementally, cache queries and version every label with its source and review date.',
 'Test on held-out labelled paths and hard negatives. Measure precision, coverage and alert latency.',
 'Protect cases with role-based access and audit logs. Use approved NCRP/SAHYOG interfaces.'
],513,139,24);
notes(slide[3],'Proposed validation gates: first validate Bitcoin path construction and label-backed receiving-VASP matches. Add monitoring and test event-to-alert latency under stated load. Extend to EVM/TRON and bridge adapters only with independently labelled test cases. Use time/entity-separated evaluation where feasible, include exchange withdrawals and collaborative transactions as hard negatives, and report unresolved coverage alongside precision and false-positive rate. Record runtime and provider costs. Label ingestion must respect licensing and permitted uses. Public reserve disclosures support entity labels, not customer deposit-account identity. Authorized VASP cooperation and LEA integration are dependencies, not secured partnerships. Agency deployment will require encryption, role-based case access, audit logging and approved retention policies.');

head(slide[4],'Potential impact on the target audience',141,28);
bullets(slide[4],[
 'Investigators will receive a prioritized VASP lead with the evidence needed to review it.',
 'Case teams will share a reproducible report and receive alerts as the fund trail changes.'
],184,100,25);
head(slide[4],'Illustrative investigation outcome',294,26);
box(slide[4],'Reported Wallet A pays intermediary B. B later pays an address labelled to VASP X.',76,333,1134,38,24);
box(slide[4],'Finding: VASP X candidate, two-hop path, transaction IDs, amounts and label provenance.',76,373,1134,38,24);
box(slide[4],'Next action: investigator reviews the finding and prepares a VASP preservation request.',76,413,1134,38,24);
box(slide[4],'Illustration only. VASP X is fictional, and the path is not a demonstrated fraud case.',76,454,1134,28,20,false,blue);
head(slide[4],'Benefits of the solution (social, economic, environmental, etc.)',501,26);
bullets(slide[4],[
 'Social: help investigators act on suspected fraud proceeds while retaining human review.',
 'Economic: reduce repeated tracing work through shared indexing and reusable case reports.',
 'Operational: support consistent VASP coordination with a documented, auditable fund trail.'
],541,115,24);
notes(slide[4],'The example is hypothetical and deliberately contains no actual addresses, fabricated transaction hashes or claimed recovery amounts. It illustrates the intended end-product output, not current implementation or measured evidence. A chronological path alone does not prove the same funds moved through each transaction; the report must expose any allocation or ownership assumptions. The VASP label must carry a documented source. Preservation or freezing action remains with authorized investigators and relevant parties. Expected social and economic benefits require pilot measurement.');

head(slide[5],'Details / Links of the reference and research work',141,29);
const refs=[
 ['Address clustering','Meiklejohn et al. (2013), A Fistful of Bitcoins: Characterizing Payments Among Men with No Names.','ACM IMC paper','https://conferences.sigcomm.org/imc/2013/papers/imc182-meiklejohnA.pdf'],
 ['ML-assisted analysis','Weber et al. (2019), Anti-Money Laundering in Bitcoin: Experimenting with Graph Convolutional Networks for Financial Forensics.','arXiv:1908.02591','https://arxiv.org/abs/1908.02591'],
 ['Blockchain data','Blockstream Esplora: address and transaction API documentation.','Official API documentation','https://github.com/Blockstream/esplora/blob/master/API.md'],
 ['Attribution sources','Binance, Our Commitment to Transparency (2022): published wallet disclosures.','Historical disclosure; not a deposit-account registry','https://www.binance.com/en-IN/blog/community/2895840147147652626'],
 ['AML context','FATF (2021), Updated Guidance for a Risk-Based Approach to Virtual Assets and VASPs.','FATF guidance','https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Guidance-rba-virtual-assets-2021.html'],
 ['Evidence handling','NIST SP 800-86 (2006), Guide to Integrating Forensic Techniques into Incident Response.','NIST guidance; not a guarantee of legal admissibility','https://csrc.nist.gov/pubs/sp/800/86/final']
];
for(let i=0;i<refs.length;i++){
 const [label,desc,link,url]=refs[i]; const y=190+i*76;
 box(slide[5],label,65,y,217,30,23,true,blue);
 box(slide[5],desc,293,y,907,49,21);
 const l=box(slide[5],link,293,y+49,907,25,19,false,blue);l.text.get(link).link={uri:url,isExternal:true};
}
notes(slide[5],refs.map(r=>r[1]+'\n'+r[3]).join('\n\n')+'\n\nSources checked 10 September 2026. Research supports proposed methods, not product accuracy claims. Historical reserve disclosures do not establish customer deposit-account ownership.');
p.resolve('sl/gnmp4jqx').delete();
// Restore the template's repeated branding above imported placeholder layers.
const logoIds=['im/s7a1obih','im/upc369ob','im/hsf6d4ji','im/43m1wbqd','im/w7uxkbq5','im/net0vexk'];
for(let i=0;i<6;i++){
 p.resolve(logoIds[i]).delete();
 p.slides.items[i].images.add({blob:logo,contentType:'image/png',alt:'Official Smart India Hackathon 2026 logo',fit:'contain',position:{left:1026.78,top:0.16,width:236.2,height:111.53}});
 if(i>0){p.resolve(ids.teams[i-1]).bringToFront();}
}
await (await PresentationFile.exportPptx(p)).save(tmp+'/candidate.pptx');
for(let i=0;i<p.slides.items.length;i++)await fs.writeFile(tmp+`/draft-${i+1}.png`,new Uint8Array(await (await p.slides.items[i].export({format:'png',scale:1})).arrayBuffer()));
const result=await finalizePresentation({workspaceDir:root,candidatePath:tmp+'/candidate.pptx',finalPath:root+'/output/aegis-sih/AEGIS-SIH2026-Investigator-Pitch.pptx',pythonExecutable:'/Users/theokl/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],explicitTotalSlideCount:6,fontPolicy:{basis:'reference',families:['Arial','Times New Roman','Calibri','TradeGothic'],referencePath:source,referenceSha256:crypto.createHash('sha256').update(await fs.readFile(source)).digest('hex')},verifyArtifactToolImport:true,receiptPath:tmp+'/validation-investigator-pitch.json'});
console.log(JSON.stringify(result));
