import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root='/Users/theokl/Dev/theo';
const skill='/Users/theokl/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations';
const source='/Users/theokl/Downloads/SIH2026-IDEA-Presentation-Format.pptx';
const finalName='AEGIS-SIH2026-Complete-156766.pptx';
const {finalizePresentation}=await import(path.join(skill,'container_tools/artifact_tool_utils.mjs'));
console.log(await finalizePresentation({workspaceDir:root,candidatePath:path.join(root,'tmp/aegis-diagrams/official-candidate.pptx'),finalPath:path.join(root,'output/aegis-sih/AEGIS-SIH2026-Complete-156766.pptx'),explicitTotalSlideCount:6,pythonExecutable:'/Users/theokl/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],fontPolicy:{basis:'reference',families:['Arial','Times New Roman','Calibri','TradeGothic','Garamond'],referencePath:source,referenceSha256:crypto.createHash('sha256').update(await fs.readFile(source)).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(root,'tmp/aegis-diagrams/validation-complete.json')}));
