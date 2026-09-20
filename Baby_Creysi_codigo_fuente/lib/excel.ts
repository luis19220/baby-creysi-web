import { strToU8, zipSync } from 'fflate';

type Cell = string | number | null | undefined;
const escape=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
function ref(n:number){let result='';while(n){n--;result=String.fromCharCode(65+n%26)+result;n=Math.floor(n/26)}return result}
function sheet(rows:Cell[][],widths:number[],moneyColumns:number[]=[]){
 const columns=widths.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('');
 const body=rows.map((row,i)=>`<row r="${i+1}">${row.map((value,j)=>{
  const id=`${ref(j+1)}${i+1}`;
  if(value===null||value===undefined||value==='')return `<c r="${id}"/>`;
  if(typeof value==='number'&&Number.isFinite(value))return `<c r="${id}"${moneyColumns.includes(j)?' s="2"':''}><v>${value}</v></c>`;
  return `<c r="${id}" t="inlineStr"${i===0?' s="1"':''}><is><t xml:space="preserve">${escape(String(value))}</t></is></c>`;
 }).join('')}</row>`).join('');
 return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${columns}</cols><sheetData>${body}</sheetData><autoFilter ref="A1:${ref(widths.length)}${Math.max(rows.length,1)}"/></worksheet>`;
}
export function invoiceWorkbook(invoices:Record<string,unknown>[],history:Record<string,unknown>[]){
 const columns=['Número de factura','Fecha de emisión','Proveedor','RFC','ID fiscal','Concepto','Subtotal (MXN)','Impuesto (%)','Total (MXN)','Estado','Registrado el','Registró','Observaciones'];
 const invoiceRows:Cell[][]=[columns,...invoices.map(r=>[r.folio,r.fechaEmision,r.proveedor,r.rfc,r.idFiscal,r.concepto,r.subtotal,r.impuestoPct,r.total,r.estado,r.registradoEn,r.registradoPor,r.observaciones] as Cell[])];
 const historyRows:Cell[][]=[['Fecha','Acción','Número de factura','Detalle','Responsable'],...history.map(r=>[r.fecha,r.accion,r.folio,r.detalle,r.persona] as Cell[])];
 const files:Record<string,Uint8Array>={
 '[Content_Types].xml':strToU8('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'),
 '_rels/.rels':strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
 'xl/workbook.xml':strToU8('<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Facturas" sheetId="1" r:id="rId1"/><sheet name="Bitácora" sheetId="2" r:id="rId2"/></sheets></workbook>'),
 'xl/_rels/workbook.xml.rels':strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'),
 'xl/styles.xml':strToU8('<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0.00"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Aptos"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2C1C28"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'),
 'xl/worksheets/sheet1.xml':strToU8(sheet(invoiceRows,[24,20,31,22,20,45,20,18,20,17,27,29,42],[6,8])),
 'xl/worksheets/sheet2.xml':strToU8(sheet(historyRows,[27,22,25,48,29])),
 };
 return zipSync(files,{level:6});
}
