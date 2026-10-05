from pathlib import Path
from copy import deepcopy
import posixpath
from lxml import etree as E
import zipfile

base=Path('/Users/theokl/Dev/theo/tmp/aegis-diagrams')
source=zipfile.ZipFile('/Users/theokl/Downloads/SIH2026-IDEA-Presentation-Format.pptx')
authored=zipfile.ZipFile(base/'official-authored.pptx')
full_content=zipfile.ZipFile('/Users/theokl/Dev/theo/output/aegis-sih/AEGIS-SIH2026-Team-156766.pptx')
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
rel_ns='http://schemas.openxmlformats.org/package/2006/relationships'
def xml(z,n):return E.fromstring(z.read(n))
def serial(x):return E.tostring(x,xml_declaration=True,encoding='UTF-8',standalone=True)
def name(x):
    a=x.find('.//p:cNvPr',ns)
    return a.get('name','') if a is not None else ''
data={n:source.read(n) for n in source.namelist()}
for i in range(1,7):
    part=f'ppt/slides/slide{i}.xml'
    original=xml(source,part)
    tree=original.find('p:cSld/p:spTree',ns)
    body=next(x for x in tree if name(x)==('TextBox 9' if i==1 else 'TextBox 8'))
    paragraphs=[deepcopy(q) for q in body.findall('p:txBody/a:p',ns) if ''.join(q.itertext()).strip()]
    tree.remove(body)
    for x in tree:
        for t in x.findall('.//a:t',ns):
            if t.text=='Your Team Name':t.text='COLD COFFEE'
            if t.text=='IDEA TITLE':t.text='AEGIS FORENSICS'
    donor=xml(authored,part)
    nodes=[deepcopy(x) for x in donor.find('p:cSld/p:spTree',ns) if name(x).startswith('AEGIS_')]
    ids={}
    for index,x in enumerate(nodes):
        pr=x.find('.//p:cNvPr',ns)
        if pr is not None:
            ids[pr.get('id')]=str(50000+index)
            pr.set('id',str(50000+index))
    relpart=f'ppt/slides/_rels/slide{i}.xml.rels'
    original_rels=xml(source,relpart)
    donor_rels=xml(authored,relpart)
    relmap={r.get('Id'):r for r in donor_rels}
    imported={}
    for x in nodes:
        if name(x).startswith('AEGIS_PROMPT_'):
            k=int(name(x).split('_')[-1]); tx=x.find('p:txBody',ns)
            for q in list(tx):
                if q.tag==f'{{{ns["a"]}}}p':tx.remove(q)
            tx.append(deepcopy(paragraphs[k]))
            bp=tx.find('a:bodyPr',ns)
            bp.set('lIns','91440');bp.set('rIns','91440')
            # Retain the template's prompt width and left alignment.
            old_frame=body.find('p:spPr/a:xfrm',ns)
            new_frame=x.find('p:spPr/a:xfrm',ns)
            new_frame.find('a:off',ns).set('x',old_frame.find('a:off',ns).get('x'))
            new_frame.find('a:ext',ns).set('cx',old_frame.find('a:ext',ns).get('cx'))
        if name(x)=='AEGIS_COVER':
            tx=x.find('p:txBody',ns)
            for k,q in enumerate(tx.findall('a:p',ns)):
                # Restore real native bullets from the source cover paragraphs.
                q.remove(q.find('a:pPr',ns))
                pp=deepcopy(paragraphs[k].find('a:pPr',ns))
                pp.set('algn','l')
                pp.find('a:lnSpc/a:spcPct',ns).set('val','100000')
                aft=E.SubElement(pp,'{'+ns['a']+'}spcAft')
                E.SubElement(aft,'{'+ns['a']+'}spcPts',val='600')
                q.insert(0,pp)
                rr=q.findall('a:r',ns)
                for j,r in enumerate(rr):
                    rp=r.find('a:rPr',ns)
                    rp.set('sz','2400' if j==0 else ('1700' if k==1 else '2000'))
                    rp.set('b','1' if j==0 else '0')
                    t=r.find('a:t',ns)
                    if t.text and t.text.startswith('\n'):
                        t.text=t.text[1:]
                        br=E.Element('{'+ns['a']+'}br')
                        br.append(deepcopy(rp))
                        q.insert(list(q).index(r),br)
        for el in x.iter():
            if E.QName(el).localname in ('stCxn','endCxn') and el.get('id') in ids:el.set('id',ids[el.get('id')])
            for attr,value in list(el.attrib.items()):
                if attr.startswith('{'+ns['r']+'}'):
                    if value not in imported:
                        r=deepcopy(relmap[value]);newid='aegis'+str(len(imported)+1);r.set('Id',newid);original_rels.append(r);imported[value]=newid
                    el.set(attr,imported[value])
        tree.append(x)
    data[part]=serial(original);data[relpart]=serial(original_rels)
    # Preserve all substantive speaker notes from the full-content revision.
    def note_path(z):
        for r in xml(z,relpart):
            if r.get('Type','').endswith('/notesSlide'):
                return posixpath.normpath(posixpath.join('ppt/slides',r.get('Target'))).lstrip('/')
    original_note=note_path(source);previous_note=note_path(full_content)
    if original_note and previous_note:
        target_note=xml(source,original_note);old_note=xml(full_content,previous_note)
        target_body=target_note.xpath('//p:sp[p:nvSpPr/p:nvPr/p:ph[@type="body"]]',namespaces=ns)
        old_body=old_note.xpath('//p:sp[p:nvSpPr/p:nvPr/p:ph[@type="body"]]',namespaces=ns)
        if target_body and old_body:
            target_body[0].replace(target_body[0].find('p:txBody',ns),deepcopy(old_body[0].find('p:txBody',ns)))
            data[original_note]=serial(target_note)

# Remove only the template instruction slide, retaining the six submission slides.
pres=xml(source,'ppt/presentation.xml');slide_ids=pres.find('p:sldIdLst',ns)
removed=slide_ids[-1].get('{'+ns['r']+'}id');slide_ids.remove(slide_ids[-1]);data['ppt/presentation.xml']=serial(pres)
rels=xml(source,'ppt/_rels/presentation.xml.rels')
for r in list(rels):
    if r.get('Id')==removed:rels.remove(r)
data['ppt/_rels/presentation.xml.rels']=serial(rels)
remove_parts=['ppt/slides/slide7.xml','ppt/slides/_rels/slide7.xml.rels']
for r in xml(source,'ppt/slides/_rels/slide7.xml.rels'):
    if r.get('Type','').endswith('/notesSlide'):
        note=posixpath.normpath(posixpath.join('ppt/slides',r.get('Target')))
        remove_parts.extend([note,posixpath.join(posixpath.dirname(note),'_rels',posixpath.basename(note)+'.rels')])
for n in remove_parts:
    data.pop(n,None)
ct=xml(source,'[Content_Types].xml')
for e in list(ct):
    if e.get('PartName','').lstrip('/') in remove_parts:ct.remove(e)
data['[Content_Types].xml']=serial(ct)
with zipfile.ZipFile(base/'official-candidate.pptx','w',zipfile.ZIP_DEFLATED) as out:
    for n,b in data.items():out.writestr(n,b)
print('Original template objects preserved; authored content inserted.')
