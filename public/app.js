(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ICON={
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  head:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  cam:'<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10l5-3v10l-5-3"/>'
};
const ico=(n,off)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICON[n]+(off?'<path d="M4 4l16 16"/>':'')+'</svg>';
function btnUI(sel,live,ic,noun,rec){
  const b=$(sel);b.innerHTML=ico(ic,!live)+(live?'ปิด':'เปิด')+noun;b.classList.toggle('rec',!!rec);
  const m=$(sel.replace('Btn','Btn2'));
  if(m){const lb=(live?'ปิด':'เปิด')+noun;m.innerHTML=ico(ic,!live);m.classList.toggle('rec',!!rec);m.title=lb;m.setAttribute('aria-label',lb)}
}
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- เก็บข้อมูลในเครื่อง ---------- */
const mem={};
const store={
  get(k,d){try{const v=localStorage.getItem(k);if(v!==null)return JSON.parse(v)}catch(e){} return k in mem?mem[k]:d},
  set(k,v){mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},
  del(k){delete mem[k];try{localStorage.removeItem(k)}catch(e){}}
};

/* ---------- ข้อมูลตัวอย่าง ---------- */
const PAL={
  skin:['#f6d6b8','#e9bd96','#d09a6e','#a86f48','#6f4429'],
  shirt:['#2f8f4e','#7bc47f','#1f5c3a','#c9e4a0','#3b7f86','#e8e2c8'],
  hair:['#2b1d16','#5a3a25','#a0702f','#d9b66b','#8a8f94','#3c6a4a','#b8452f','#6a4ca0'],
  trim:['#f2e6b8','#e86f68','#f2b84b','#4a78c8','#8a63b8','#ffffff','#24342b']
};
/* รายการที่มีเครื่องหมาย true ตัวที่ 3 คือของสมาชิก Pro (รหัสต้องตรงกับ PRO_* ใน hub.js — เซิร์ฟเวอร์ตรวจสิทธิ์จริง) */
const HATS=[['none','ไม่มี'],['beanie','บีนนี่'],['sprout','ต้นกล้า'],['phones','หูฟัง'],['catears','หูแมว'],['cap','หมวกแก๊ป'],['flower','มงกุฎดอกไม้'],['straw','หมวกฟาง'],
  ['crown','มงกุฎทอง',1],['wizard','หมวกพ่อมด',1],['antlers','เขากวาง',1],['halo','วงแหวนลอย',1],['bunnyears','หูกระต่าย',1],['headband','ที่คาดผมโบว์',1]];
const STYLES=[['short','สั้น'],['bob','บ๊อบ'],['long','ยาว'],['bun','มวย'],['ponytail','หางม้า'],['spiky','ตั้งชี้'],['curly','หยิก'],['bald','โล้น'],
  ['mohawk','ฮอว์ก',1],['twintail','ทวินเทล',1],['afro','อัฟโร',1],['braid','เปียยาว',1]];
const OUTFITS=[['tee','เสื้อยืด'],['hoodie','ฮู้ด'],['stripe','ลายขวาง'],['overalls','เอี๊ยม'],['dress','เดรส'],['jacket','แจ็กเก็ต'],
  ['suit','สูท',1],['kimono','กิโมโน',1],['armor','เกราะอัศวิน',1],['astro','ชุดนักบินอวกาศ',1]];
const ACCS=[['none','ไม่มี'],['scarf','ผ้าพันคอ'],['bowtie','โบว์ไท'],['backpack','เป้'],['pin','เข็มกลัดใบไม้'],
  ['cape','ผ้าคลุม',1],['wings','ปีก',1],['headset','หูฟังมีไมค์',1],['medal','เหรียญรางวัล',1]];
const EYES=[['round','กลม'],['oval','รี'],['sleepy','ง่วง'],['happy','ยิ้ม'],['star','ดาว']];
const BROWS=[['none','ไม่มี'],['soft','เรียบ'],['angry','ขึ้งเคียด'],['sad','เศร้า']];
const MOUTHS=[['smile','ยิ้ม'],['flat','เฉยๆ'],['open','อ้าปาก'],['cat','ปากแมว']];
const PATS=[['none','ไม่มีลาย'],['stripes','ริ้วตั้ง'],['dots','จุด'],['check','ตาราง']];
const ADV_PAL={eye:['#1f2a24','#3a2a1a','#2b5aa0','#2f8f4e','#7a4f9a','#b8452f'],blush:['','#f2a0a8','#ff7f9a','#ffb27a'],hair2:['','#f2b84b','#e86f68','#4a78c8','#8a63b8','#7bd8e8','#ffffff'],pat:['#ffffff','#f2b84b','#e86f68','#24342b','#4a78c8','#a6eaae'],aura:['','#7bffb0','#ffd84d','#7ad7ff','#ff7ad9','#b58cff']};
const ADV_DEFAULT={hs:1,bh:1,bw:1,eye:'round',eyec:'#1f2a24',brow:'none',mouth:'smile',blush:'',hair2:'',pat:'none',pat2:'#ffffff',aura:''};
const isProItem=(list,id)=>list.some(x=>x[0]===id&&x[2]);
/* กรอบโปรไฟล์ (รหัสต้องตรงกับรายการใน hub.js และคลาส .fr-* ใน CSS) */
const FRAMES=[['none','ไม่มี'],['leaf','ใบไม้'],['gold','ทอง'],['royal','ม่วงหรู'],['sakura','ซากุระ'],['ocean','ทะเล'],['ice','น้ำแข็ง'],['fire','เปลวไฟ'],['neon','นีออน'],['galaxy','กาแล็กซี'],['rainbow','สายรุ้ง'],['vine','เถาวัลย์'],['catears','หูแมว'],['bunny','หูกระต่าย'],['halo','วงแหวนเทวดา'],['devil','เขาน้อย'],
  ['aurora','แสงเหนือ',1],['sunset','อาทิตย์อัสดง',1],['diamond','เพชร',1],['pixel','พิกเซล',1],['storm','พายุฟ้าผ่า',1],['lotus','ดอกบัว',1],['prism','ปริซึม',1],['crown','มงกุฎราชา',1]];
const cid=(()=>{let v=store.get('qs.cid','');if(!v){v='c'+Math.random().toString(36).slice(2)+Date.now().toString(36);store.set('qs.cid',v)}return v})();
const DEFAULT={name:'ผู้มาใหม่',skin:PAL.skin[0],shirt:PAL.shirt[0],hair:PAL.hair[0],hat:'none',style:'short',outfit:'tee',acc:'none',trim:PAL.trim[0],glasses:false,pic:'',frame:'none',adv:null,useGlb:false};
let profile=Object.assign({},DEFAULT,store.get('qs.profile',{}));
const cfgOf=p=>({skin:p.skin,shirt:p.shirt,hair:p.hair,hat:p.hat,style:p.style,outfit:p.outfit,acc:p.acc,trim:p.trim,glasses:!!p.glasses,pic:p.pic||'',frame:p.frame||'none',adv:p.adv||null,useGlb:!!p.useGlb});
/* ข้อมูลสมาชิกจากเซิร์ฟเวอร์ (me): สถานะ Pro เวลาใช้งานสะสม โมเดล 3D ราคา */
let meX={pro:false,usedMs:0,disc:false,sub:null,glb:null,admin:false};
let payTimer=0,planCycle=store.get('qs.cycle','year')==='month'?'month':'year',payBusy=false,planArm='',payPlan='',advOpen=false,glbUp=null,glbArm=false,pendingPaid=null,shareHintShown=false;
const pend={t:null,v:null,d:null},upReq=new Map();
let PAY={mode:'demo',prices:{month:{base:89,disc:80.1,days:30},year:{base:799,disc:719.1,days:365}},discPct:10,discHours:100,upload:true,freeFile:10485760,glbMax:26214400,share:{free:{w:1280,h:720,fps:15,kbps:1500},pro:{w:1920,h:1080,fps:30,kbps:5000}}};
/* ตัดของ Pro ออกจากรูปลักษณ์ (ใช้กับตัวเองตอนไม่ได้เป็นสมาชิก ให้ตรงกับที่คนอื่นเห็น) */
function stripPro(c){
  const o=Object.assign({},c);
  if(isProItem(HATS,o.hat))o.hat='none';if(isProItem(STYLES,o.style))o.style='short';if(isProItem(OUTFITS,o.outfit))o.outfit='tee';
  if(isProItem(ACCS,o.acc))o.acc='none';if(isProItem(FRAMES,o.frame))o.frame='none';
  o.adv=null;o.useGlb=false;o.glb='';return o;
}
/* รูปลักษณ์จริงของตัวเองที่ใช้วาด (สมาชิก: ตามที่เลือก / ไม่ใช่สมาชิก: ตัดของ Pro) */
function ownCfg(){
  const c=cfgOf(profile);
  if(!meX.pro)return stripPro(c);
  c.glb=c.useGlb&&meX.glb?meX.glb.id:'';return c;
}
/* รูปโปรไฟล์: ชุดสำเร็จรูป (วาดเป็น SVG ในโค้ด) หรืออัปโหลดเอง (ย่อเหลือ 96px แล้วส่งให้ทุกคนในห้อง) */
const PRESET_PICS=[
  ['leaf','ใบไม้','#2f8f4e','<path d="M20 76C20 38 46 20 80 20c0 36-18 60-52 60" fill="#e9f7d9"/><path d="M26 74C42 56 56 44 72 28" stroke="#2f8f4e" stroke-width="4" fill="none" stroke-linecap="round"/>'],
  ['moon','พระจันทร์','#1f3b57','<path d="M62 22a30 30 0 1 0 14 54A34 34 0 0 1 62 22z" fill="#f6efc4"/><circle cx="74" cy="30" r="3" fill="#f6efc4"/><circle cx="26" cy="26" r="2.5" fill="#f6efc4"/>'],
  ['rain','เมฆฝน','#3b7f86','<ellipse cx="50" cy="42" rx="26" ry="15" fill="#f2fbf3"/><circle cx="38" cy="38" r="13" fill="#f2fbf3"/><circle cx="60" cy="34" r="15" fill="#f2fbf3"/><path d="M36 66l-4 10M50 66l-4 10M64 66l-4 10" stroke="#cfe9ef" stroke-width="4" stroke-linecap="round"/>'],
  ['cat','แมว','#c58b4e','<path d="M24 34l6-16 14 10h12l14-10 6 16v26a24 18 0 0 1-52 0z" fill="#fff3df"/><circle cx="40" cy="48" r="3" fill="#3a2a1a"/><circle cx="60" cy="48" r="3" fill="#3a2a1a"/><path d="M46 56q4 4 8 0" stroke="#3a2a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>'],
  ['book','หนังสือ','#7a4f9a','<path d="M22 28h24c4 0 4 2 4 4v42c0-3-1-4-4-4H22z" fill="#f4e9ff"/><path d="M78 28H54c-4 0-4 2-4 4v42c0-3 1-4 4-4h24z" fill="#e2d0f5"/>'],
  ['coffee','กาแฟ','#8a5a3a','<path d="M26 40h40v20a16 16 0 0 1-16 16h-8a16 16 0 0 1-16-16z" fill="#fff3e4"/><path d="M66 46h6a8 8 0 0 1 0 16h-6" stroke="#fff3e4" stroke-width="4" fill="none"/><path d="M38 22q-4 6 0 12M48 22q-4 6 0 12M58 22q-4 6 0 12" stroke="#fff3e4" stroke-width="3" fill="none" stroke-linecap="round"/>'],
  ['flower','ดอกไม้','#d96b8a','<g fill="#fff0f4"><circle cx="50" cy="28" r="13"/><circle cx="72" cy="46" r="13"/><circle cx="64" cy="70" r="13"/><circle cx="36" cy="70" r="13"/><circle cx="28" cy="46" r="13"/></g><circle cx="50" cy="52" r="10" fill="#f6c453"/>'],
  ['tree','ต้นไม้','#3f7a46','<path d="M50 20l24 30H62l16 22H22l16-22H26z" fill="#d6f0c4"/><rect x="45" y="72" width="10" height="12" fill="#8a5a3a"/>'],
  ['sun','ดวงอาทิตย์','#e0a43a','<circle cx="50" cy="50" r="17" fill="#fff4c8"/><g stroke="#fff4c8" stroke-width="5" stroke-linecap="round"><path d="M50 16v10M50 74v10M16 50h10M74 50h10M26 26l7 7M67 67l7 7M74 26l-7 7M33 67l-7 7"/></g>'],
  ['star','ดาว','#4a5fa8','<path d="M50 18l9 21 22 2-17 15 5 22-19-12-19 12 5-22-17-15 22-2z" fill="#fff0b0"/>']
];
function picSrc(v){
  if(!v)return '';
  if(v.slice(0,2)==='p:'){
    const d=PRESET_PICS.find(x=>x[0]===v.slice(2));if(!d)return '';
    const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="'+d[2]+'"/>'+d[3]+'</svg>';
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }
  return /^data:image\/(jpeg|png|webp);base64,/.test(v)?v:'';
}
const picHTML=(v,cls)=>{const s=picSrc(v);return s?'<img class="'+cls+'" alt="" src="'+s.replace(/"/g,'&quot;')+'">':''};
let currentRoom=null,roomMembers=[],myPeerId='',lastSig='';
let RD=null; // สถานะตัวช่วยอ่าน (ดูหัวข้อ ตัวช่วยอ่าน)
const net={ws:null,ok:false,tries:0,beat:0};
const send=o=>{if(net.ws&&net.ws.readyState===1){net.ws.send(JSON.stringify(o));return true}return false};
function deleteRoom(id){
  if(!send({t:'delete',room:id})){toast('ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์');return}
  toast('กำลังลบห้อง…');
}
/* กล่องยืนยันลบห้อง (ใช้ร่วมกันทั้งปุ่มถังขยะ เมนูคลิกขวา และปุ่มหัวช่อง) */
let askCtx=null;
function askDelRoom(id){
  const r=chanById(id);if(!r)return;
  const s=srvById(curSid)||servers.find(x=>x.channels.some(c=>c.id===id));
  askCtx={room:id};
  openAsk('ลบห้อง “'+esc(r.name)+'”?',
    'ข้อความทั้งหมดในห้องนี้จะถูกลบถาวร'+(r.type==='voice'?' และคนที่อยู่ในห้องเสียงจะถูกพาออก':'')+' ย้อนกลับไม่ได้'
    +(s&&s.main?'<span class="askp" style="display:block">ห้องนี้อยู่ในเซิร์ฟเวอร์กลาง ทุกคนจะไม่เห็นห้องนี้อีก</span>':''),
    [['close','ยกเลิก'],['delroom','ลบห้อง','danger']]);
}

/* ---------- ตัวละคร 3D ---------- */
function makeAvatar(c){
  const A=c.adv||null;
  const g=new THREE.Group();
  const M=col=>new THREE.MeshLambertMaterial({color:col});
  const add=(geo,col,x,y,z,parent)=>{const m=new THREE.Mesh(geo,M(col));m.position.set(x,y,z);(parent||g).add(m);return m};
  // แท่งตรงระหว่างสองจุด (ใช้ทำกิ่งเขากวาง แขนไมค์ ฯลฯ)
  const bar=(p,q,r,col,parent)=>{
    const a=new THREE.Vector3(p[0],p[1],p[2]),b=new THREE.Vector3(q[0],q[1],q[2]),d=b.clone().sub(a),len=d.length();
    const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,8),M(col));
    m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
    (parent||g).add(m);return m;
  };
  const st=c.style||'short',TR=c.trim||'#f2e6b8',of=c.outfit||'tee',acc=c.acc||'none',hat=c.hat||'none';
  const hs=A?A.hs:1,bh=A?A.bh:1,bw=A?A.bw:1;
  /* สีลำตัว/แขน/ขา ตามชุด */
  const BODY={suit:0x27364d,armor:0xaeb8c2,astro:0xf1f3f5}[of]||c.shirt;
  const LEG={suit:0x1d2838,armor:0x8c97a3,astro:0xe2e6ea}[of]||0x2f4a3c;
  add(new THREE.CylinderGeometry(.4,.48,.95,20),BODY,0,1.0,0);
  add(new THREE.CylinderGeometry(.15,.15,.55,12),LEG,-.2,.275,0);
  add(new THREE.CylinderGeometry(.15,.15,.55,12),LEG,.2,.275,0);
  const aL=add(new THREE.CylinderGeometry(.11,.11,.7,10),BODY,-.57,1.05,0);aL.rotation.z=.18;
  const aR=add(new THREE.CylinderGeometry(.11,.11,.7,10),BODY,.57,1.05,0);aR.rotation.z=-.18;
  add(new THREE.SphereGeometry(.11,12,10),c.skin,-.65,.66,0);
  add(new THREE.SphereGeometry(.11,12,10),c.skin,.65,.66,0);
  const head=new THREE.Group();head.position.set(0,1.92+(hs-1)*.42/bh,0);g.add(head);
  if(A){g.scale.set(bw,bh,bw);head.scale.set(hs/bw,hs/bh,hs/bw)}
  add(new THREE.SphereGeometry(.42,28,20),c.skin,0,0,0,head);
  /* ใบหน้า: ตา คิ้ว ปาก แก้ม */
  const eyes=new THREE.Group();head.add(eyes);
  const ey=A?A.eye:'round',EC=A?A.eyec:'#1b1b1b';
  [-1,1].forEach(s=>{
    if(ey==='happy')add(new THREE.TorusGeometry(.058,.015,6,12,Math.PI),0x1b1b1b,s*.15,.035,.375,eyes);
    else if(ey==='star'){const e=add(new THREE.OctahedronGeometry(.08),EC,s*.15,.05,.375,eyes);e.scale.set(1,1,.35)}
    else{
      const e=add(new THREE.SphereGeometry(.055,10,8),EC,s*.15,.05,.37,eyes);
      if(ey==='oval')e.scale.set(.85,1.45,.8);
      else if(ey==='sleepy'){e.scale.set(1.2,.5,.8);const l=add(new THREE.SphereGeometry(.06,10,6,0,Math.PI*2,0,Math.PI*.5),c.skin,s*.15,.062,.372,eyes);l.scale.set(1.2,.9,.9)}
    }
  });
  const mo=A?A.mouth:'smile',MC=0x7a3b2e;
  if(mo==='flat')add(new THREE.BoxGeometry(.12,.018,.02),MC,0,-.1,.4,head);
  else if(mo==='open'){const o=add(new THREE.SphereGeometry(.05,12,10),0x5a1f1a,0,-.11,.39,head);o.scale.set(1.15,.85,.4)}
  else if(mo==='cat')[-1,1].forEach(s=>{const k=add(new THREE.TorusGeometry(.04,.013,6,10,Math.PI),MC,s*.04,-.095,.395,head);k.rotation.z=Math.PI});
  else{const sm=add(new THREE.TorusGeometry(.09,.014,6,14,Math.PI),MC,0,-.11,.39,head);sm.rotation.z=Math.PI}
  if(A&&A.brow!=='none')[-1,1].forEach(s=>{
    const b=add(new THREE.BoxGeometry(.13,.024,.02),c.hair,s*.15,.17,.385,head);
    b.rotation.z=A.brow==='angry'?s*.36:A.brow==='sad'?-s*.3:-s*.1;b.rotation.y=s*.35;
  });
  if(A&&A.blush)[-1,1].forEach(s=>{
    const b=add(new THREE.SphereGeometry(.07,10,8),A.blush,s*.25,-.03,.33,head);
    b.scale.set(1.25,.62,.25);b.rotation.y=s*.62;b.material.transparent=true;b.material.opacity=.72;
  });
  /* ผม */
  const dbl=m=>{m.material.side=THREE.DoubleSide;return m};
  const rr=y=>.48-.08*(y-.525)/.95;
  const H2=(A&&A.hair2)||'';
  if(st!=='bald'){const hair=add(new THREE.SphereGeometry(.45,24,16,0,Math.PI*2,0,Math.PI*.58),c.hair,0,.03,-.02,head);hair.rotation.x=-.35}
  if(st==='bob')dbl(add(new THREE.CylinderGeometry(.47,.45,.5,28,1,true,Math.PI*.12,Math.PI*1.76),c.hair,0,-.08,-.02,head));
  else if(st==='long')dbl(add(new THREE.CylinderGeometry(.47,.44,.8,28,1,true,Math.PI*.2,Math.PI*1.6),c.hair,0,-.3,-.02,head));
  else if(st==='bun'){add(new THREE.SphereGeometry(.17,16,12),c.hair,0,.5,-.12,head)}
  else if(st==='ponytail'){
    add(new THREE.SphereGeometry(.1,12,10),c.hair,0,.2,-.46,head);
    const t=add(new THREE.CylinderGeometry(.09,.03,.55,10),c.hair,0,-.1,-.56,head);t.rotation.x=-.18;
    if(H2)add(new THREE.SphereGeometry(.06,10,8),H2,0,-.37,-.6,head);
  }else if(st==='spiky'){
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2;
      const k=add(new THREE.ConeGeometry(.1,.3,8),c.hair,Math.sin(a)*.26,.4,Math.cos(a)*.26-.04,head);
      k.rotation.z=-Math.sin(a)*.7;k.rotation.x=Math.cos(a)*.7}
    add(new THREE.ConeGeometry(.11,.34,8),c.hair,0,.48,-.04,head);
  }else if(st==='curly'){
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2;if(Math.cos(a)>.5)continue;
      add(new THREE.SphereGeometry(.14,12,10),c.hair,Math.sin(a)*.38,.2,Math.cos(a)*.38-.04,head)}
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2;add(new THREE.SphereGeometry(.14,12,10),c.hair,Math.sin(a)*.2,.42,Math.cos(a)*.2-.06,head)}
    add(new THREE.SphereGeometry(.15,12,10),c.hair,0,.47,-.06,head);
  }else if(st==='mohawk'){
    for(let i=0;i<9;i++){
      const z=.34-i*.085,sy=Math.sqrt(Math.max(.02,.2025-z*z)),hh=.38-Math.abs(i-3.5)*.04;
      const f=add(new THREE.ConeGeometry(.1,hh,8),H2&&i%2===0?H2:c.hair,0,sy+.1+hh*.3,z,head);
      f.scale.set(.8,1,1.15);f.rotation.x=Math.asin(Math.max(-1,Math.min(1,z/.45)))*.8;
    }
  }else if(st==='twintail'){
    [-1,1].forEach(s=>{
      add(new THREE.SphereGeometry(.075,10,8),TR,s*.4,.17,-.1,head);
      const t=add(new THREE.CylinderGeometry(.1,.03,.72,10),c.hair,s*.5,-.2,-.1,head);t.rotation.z=s*.2;
      if(H2)add(new THREE.SphereGeometry(.055,10,8),H2,s*.585,-.55,-.1,head);
    });
  }else if(st==='afro'){
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2;if(Math.cos(a)>.62)continue;
      add(new THREE.SphereGeometry(.2,12,10),c.hair,Math.sin(a)*.5,.2,Math.cos(a)*.5-.1,head)}
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2;add(new THREE.SphereGeometry(.21,12,10),c.hair,Math.sin(a)*.3,.52,Math.cos(a)*.3-.14,head)}
    add(new THREE.SphereGeometry(.24,12,10),c.hair,0,.6,-.12,head);
  }else if(st==='braid'){
    for(let i=0;i<6;i++){const e=add(new THREE.SphereGeometry(.105-.009*i,12,10),i===5&&H2?H2:c.hair,0,.1-i*.15,-.5-i*.012,head);e.scale.set(1,1.15,.9)}
    add(new THREE.SphereGeometry(.05,8,6),TR,0,-.7,-.57,head);
  }
  if(H2&&st!=='bald'){ // ไฮไลต์เส้นผมช่วงหน้าม้า
    [-.5,0,.5].forEach((al,i)=>{
      const ph=.78+Math.abs(al)*.12,P=[0,.94,-.34],F=[0,.34,.94];
      const cx=Math.sin(al)*Math.sin(ph),cp=Math.cos(ph),cf=Math.cos(al)*Math.sin(ph);
      const px=.455*cx,py=.03+.455*(cp*P[1]+cf*F[1]),pz=-.02+.455*(cp*P[2]+cf*F[2]);
      const s=add(new THREE.SphereGeometry(.07,8,6),H2,px,py,pz,head);s.scale.set(.9,2,.6);s.rotation.x=.5;s.rotation.z=-al*.8;
    });
  }
  /* หมวก */
  if(hat==='beanie'){
    add(new THREE.SphereGeometry(.48,24,14,0,Math.PI*2,0,Math.PI*.5),0x2f6b46,0,.1,0,head);
    add(new THREE.SphereGeometry(.09,12,10),0xe8e2c8,0,.6,0,head);
  }else if(hat==='sprout'){
    add(new THREE.CylinderGeometry(.02,.025,.3,8),0x3f9b57,0,.55,0,head);
    [-1,1].forEach(s=>{const l=add(new THREE.SphereGeometry(.15,12,8),0x7bc47f,s*.14,.72,0,head);l.scale.set(1,.35,.6);l.rotation.z=s*.5});
  }else if(hat==='catears'){
    [-1,1].forEach(s=>{
      const e=add(new THREE.ConeGeometry(.14,.3,4),c.hair,s*.27,.46,-.02,head);e.rotation.z=-s*.35;
      const i=add(new THREE.ConeGeometry(.08,.2,4),0xf2a9b8,s*.265,.44,.03,head);i.rotation.z=-s*.35});
  }else if(hat==='cap'){
    add(new THREE.SphereGeometry(.47,24,14,0,Math.PI*2,0,Math.PI*.46),TR,0,.06,0,head);
    const b=add(new THREE.SphereGeometry(.3,16,8,0,Math.PI*2,0,Math.PI*.5),TR,0,.15,.4,head);b.scale.set(1,.14,1.15);
  }else if(hat==='flower'){
    add(new THREE.TorusGeometry(.36,.025,8,32),0x4a9b5a,0,.27,-.02,head).rotation.x=Math.PI/2;
    const fc=[0xf08aa5,0xfff4d0,0xf6c453];
    for(let i=0;i<9;i++){const a=i/9*Math.PI*2;add(new THREE.SphereGeometry(.075,10,8),fc[i%3],Math.sin(a)*.36,.27,Math.cos(a)*.36-.02,head)}
  }else if(hat==='straw'){
    add(new THREE.CylinderGeometry(.72,.72,.03,36),0xe6cf8a,0,.2,0,head);
    const d=add(new THREE.SphereGeometry(.37,22,12,0,Math.PI*2,0,Math.PI*.5),0xe6cf8a,0,.2,0,head);d.scale.set(1,.95,1);
    add(new THREE.CylinderGeometry(.375,.375,.08,28),TR,0,.25,0,head);
  }else if(hat==='phones'){
    add(new THREE.TorusGeometry(.46,.04,8,28,Math.PI),0x24342b,0,0,0,head);
    [-1,1].forEach(s=>{const e=add(new THREE.CylinderGeometry(.12,.12,.1,16),0x2a8a4a,s*.46,0,0,head);e.rotation.z=Math.PI/2});
  }else if(hat==='crown'){
    dbl(add(new THREE.CylinderGeometry(.35,.37,.15,24,1,true),0xf2c14e,0,.5,-.01,head));
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2;
      add(new THREE.ConeGeometry(.065,.2,6),0xf2c14e,Math.sin(a)*.35,.67,Math.cos(a)*.35-.01,head);
      add(new THREE.SphereGeometry(.03,8,6),[0xe8394d,0x3f8fe8,0x4fd37b][i%3],Math.sin(a)*.35,.78,Math.cos(a)*.35-.01,head)}
    [[0,.36],[-.21,.28],[.21,.28]].forEach(([x,z],i)=>add(new THREE.SphereGeometry(.032,8,6),[0xe8394d,0x3f8fe8,0x4fd37b][i],x,.5,z+.01,head));
  }else if(hat==='wizard'){
    add(new THREE.CylinderGeometry(.62,.62,.03,32),0x4a3a8c,0,.27,0,head);
    const cone=add(new THREE.ConeGeometry(.34,.95,28),0x4a3a8c,0.04,.77,-.02,head);cone.rotation.z=-.1;
    add(new THREE.CylinderGeometry(.345,.35,.07,28),TR,0,.34,0,head);
    [[.12,.55,.28],[-.12,.7,.22],[.04,.45,.3]].forEach(([x,y,z])=>add(new THREE.OctahedronGeometry(.032),0xffe27a,x,y,z,head));
  }else if(hat==='antlers'){
    [-1,1].forEach(s=>{
      const base=[s*.15,.4,-.02],tip=[s*.34,.88,-.02];
      bar(base,tip,.03,0x8a5a3a,head);
      bar([s*.2,.55,-.02],[s*.4,.7,-.02],.022,0x8a5a3a,head);
      bar([s*.27,.72,-.02],[s*.17,.92,-.02],.02,0x8a5a3a,head);
      bar([s*.34,.88,-.02],[s*.46,1.0,-.02],.018,0x8a5a3a,head);
    });
  }else if(hat==='halo'){
    const h=add(new THREE.TorusGeometry(.3,.03,10,36),0xffe27a,0,.8,-.02,head);h.rotation.x=Math.PI/2;h.material=new THREE.MeshBasicMaterial({color:0xffe27a});
    const h2=add(new THREE.TorusGeometry(.3,.012,8,36),0xfff6c8,0,.8,-.02,head);h2.rotation.x=Math.PI/2;h2.material=new THREE.MeshBasicMaterial({color:0xfff6c8});
  }else if(hat==='bunnyears'){
    [-1,1].forEach(s=>{
      const e=add(new THREE.SphereGeometry(.11,12,10),0xffffff,s*.17,.76,-.04,head);e.scale.set(1,3.3,.55);e.rotation.z=-s*.16;
      const i=add(new THREE.SphereGeometry(.11,12,10),0xf2a9b8,s*.168,.76,-.01,head);i.scale.set(.55,2.7,.3);i.rotation.z=-s*.16;
    });
  }else if(hat==='headband'){
    add(new THREE.TorusGeometry(.445,.042,8,28,Math.PI),TR,0,0,.01,head);
    [-1,1].forEach(s=>{const w=add(new THREE.SphereGeometry(.12,12,10),c.shirt,.3+s*.1,.34,.1,head);w.scale.set(1.35,.85,.5);w.rotation.z=s*.55});
    add(new THREE.SphereGeometry(.06,10,8),0xffffff,.3,.34,.13,head);
  }
  if(c.glasses){
    [-1,1].forEach(s=>add(new THREE.TorusGeometry(.1,.012,8,22),0x1d2b22,s*.17,.07,.4,head));
    add(new THREE.CylinderGeometry(.01,.01,.08,6),0x1d2b22,0,.07,.4,head).rotation.z=Math.PI/2;
  }
  /* เสื้อผ้า */
  if(of==='hoodie'){
    const h=add(new THREE.SphereGeometry(.3,16,12),c.shirt,0,1.5,-.26);h.scale.set(1.25,.8,.8);
    add(new THREE.BoxGeometry(.38,.2,.04),TR,0,.8,rr(.8)+.01);
    [-1,1].forEach(s=>add(new THREE.CylinderGeometry(.012,.012,.3,6),TR,s*.09,1.33,rr(1.33)+.01));
  }else if(of==='stripe'){
    [1.3,1.05,.8].forEach(y=>add(new THREE.CylinderGeometry(rr(y+.05)+.006,rr(y-.05)+.006,.1,24),TR,0,y,0));
  }else if(of==='overalls'){
    add(new THREE.CylinderGeometry(rr(1.0)+.012,.492,.475,24),TR,0,.7625,0);
    add(new THREE.BoxGeometry(.4,.26,.03),TR,0,1.13,rr(1.13)+.012);
    [-1,1].forEach(s=>{const b=add(new THREE.BoxGeometry(.09,.42,.03),TR,s*.19,1.3,rr(1.3)+.012);b.rotation.z=s*.06});
  }else if(of==='dress'){
    add(new THREE.CylinderGeometry(.45,.72,.62,32),c.shirt,0,.56,0);
    add(new THREE.TorusGeometry(rr(.95)+.004,.035,8,32),TR,0,.95,0).rotation.x=Math.PI/2;
    add(new THREE.TorusGeometry(.72,.025,8,36),TR,0,.26,0).rotation.x=Math.PI/2;
  }else if(of==='jacket'){
    add(new THREE.BoxGeometry(.15,.92,.03),TR,0,1.0,rr(1.0)+.004);
    add(new THREE.BoxGeometry(.012,.92,.035),0x24342b,0,1.0,rr(1.0)+.012);
    [-1,1].forEach(s=>{const cf=add(new THREE.CylinderGeometry(.118,.118,.1,12),TR,s*.51,.74,0);cf.rotation.z=s*-.18});
  }else if(of==='suit'){
    add(new THREE.BoxGeometry(.17,.55,.02),0xffffff,0,1.2,rr(1.2)+.008);
    add(new THREE.BoxGeometry(.05,.36,.02),c.shirt,0,1.15,rr(1.15)+.016);
    add(new THREE.SphereGeometry(.035,8,6),c.shirt,0,1.37,rr(1.37)+.02);
    [-1,1].forEach(s=>{const l=add(new THREE.BoxGeometry(.085,.5,.02),0x3a4c6a,s*.12,1.19,rr(1.19)+.014);l.rotation.z=s*.32});
    add(new THREE.BoxGeometry(.09,.045,.02),TR,.22,1.06,rr(1.06)+.012);
    [.85,.7].forEach(y=>add(new THREE.SphereGeometry(.022,8,6),0xd9c27a,0,y,rr(y)+.012));
  }else if(of==='kimono'){
    [-1,1].forEach(s=>{const sl=add(new THREE.BoxGeometry(.2,.58,.46),c.shirt,s*.66,.8,0);sl.rotation.z=s*.12;
      add(new THREE.BoxGeometry(.205,.06,.465),TR,s*.66,.52,0).rotation.z=s*.12});
    [-1,1].forEach(s=>{const v=add(new THREE.BoxGeometry(.07,.52,.02),0xffffff,s*.1,1.2,rr(1.2)+.012);v.rotation.z=-s*.42});
    add(new THREE.CylinderGeometry(rr(.82)+.015,rr(.72)+.015,.2,28),TR,0,.78,0);
    add(new THREE.BoxGeometry(.3,.26,.07),TR,0,.78,-rr(.78)-.03);
  }else if(of==='armor'){
    const pl=add(new THREE.CylinderGeometry(rr(1.46)+.025,rr(.98)+.025,.5,26,1,false,-Math.PI*.55,Math.PI*1.1),0xd5dde5,0,1.22,0);pl.material.side=THREE.DoubleSide;
    [-1,1].forEach(s=>{const p=add(new THREE.SphereGeometry(.2,14,10),0xc7d0da,s*.56,1.43,0);p.scale.set(1,.7,1)});
    add(new THREE.CylinderGeometry(rr(.7)+.014,rr(.55)+.014,.15,26),TR,0,.62,0);
    add(new THREE.OctahedronGeometry(.07),c.shirt,0,1.25,rr(1.25)+.035);
    [-1,1].forEach(s=>add(new THREE.CylinderGeometry(.125,.125,.14,12),0xd5dde5,s*.64,.78,0).rotation.z=s*-.18);
  }else if(of==='astro'){
    add(new THREE.BoxGeometry(.32,.22,.03),0x2b3640,0,1.2,rr(1.2)+.016);
    [0xe8394d,0x4fd37b,0xf2c14e].forEach((col,i)=>add(new THREE.SphereGeometry(.026,8,6),col,-.09+i*.09,1.2,rr(1.2)+.042));
    add(new THREE.TorusGeometry(.405,.055,8,28),TR,0,1.47,0).rotation.x=Math.PI/2;
    add(new THREE.BoxGeometry(.6,.8,.3),0xe9edf0,0,1.05,-.5);
    add(new THREE.BoxGeometry(.4,.06,.32),TR,0,1.38,-.5);
  }
  /* ลวดลายบนลำตัว (ตัวสร้างขั้นสูง) */
  if(A&&A.pat!=='none'){
    const pm=new THREE.MeshLambertMaterial({color:A.pat2,side:THREE.DoubleSide});
    const pa=(geo,x,y,z,ry)=>{const m=new THREE.Mesh(geo,pm);m.position.set(x,y,z);if(ry)m.rotation.y=ry;g.add(m);return m};
    if(A.pat==='stripes'){for(let i=0;i<8;i++)pa(new THREE.CylinderGeometry(.411,.491,.95,2,1,true,i*Math.PI/4,Math.PI/8),0,1.0,0)}
    else if(A.pat==='dots'){
      [.68,.9,1.12,1.34].forEach((y,r)=>{for(let k=0;k<8;k++){const a=k*Math.PI/4+(r%2)*Math.PI/8;
        const d=pa(new THREE.SphereGeometry(.05,8,6),Math.sin(a)*(rr(y)+.004),y,Math.cos(a)*(rr(y)+.004),a);d.scale.set(1,1,.25)}});
    }else if(A.pat==='check'){
      [.62,.8,.98,1.16,1.34].forEach(y=>{pa(new THREE.TorusGeometry(rr(y)+.006,.011,6,28),0,y,0).rotation.x=Math.PI/2});
      for(let i=0;i<10;i++)pa(new THREE.CylinderGeometry(.411,.491,.95,2,1,true,i*Math.PI/5,.07),0,1.0,0);
    }
  }
  /* ของประกอบ */
  if(acc==='scarf'){
    add(new THREE.TorusGeometry(.4,.1,10,28),TR,0,1.5,0).rotation.x=Math.PI/2;
    const t=add(new THREE.BoxGeometry(.14,.5,.06),TR,.2,1.27,.43);t.rotation.z=.08;
  }else if(acc==='bowtie'){
    [-1,1].forEach(s=>{const w=add(new THREE.SphereGeometry(.09,12,10),TR,s*.09,1.49,.43);w.scale.set(1,.7,.5)});
    add(new THREE.SphereGeometry(.045,10,8),TR,0,1.49,.45);
  }else if(acc==='backpack'){
    add(new THREE.BoxGeometry(.56,.7,.26),TR,0,1.08,-.5);
    add(new THREE.BoxGeometry(.56,.12,.28),0x24342b,0,1.4,-.5);
    [-1,1].forEach(s=>add(new THREE.BoxGeometry(.07,.5,.03),0x24342b,s*.2,1.22,.42));
  }else if(acc==='pin'){
    const l=add(new THREE.SphereGeometry(.07,10,8),0x7bc47f,.2,1.28,rr(1.28)+.01);l.scale.set(1,1.7,.35);l.rotation.z=.6;
  }else if(acc==='cape'){
    const cp=add(new THREE.CylinderGeometry(.49,.68,1.25,28,1,true,Math.PI*.28,Math.PI*1.44),TR,0,.9,0);dbl(cp);
    [-1,1].forEach(s=>add(new THREE.SphereGeometry(.045,10,8),0xf2c14e,s*.3,1.5,.27));
    add(new THREE.CylinderGeometry(.015,.015,.5,6),0xf2c14e,0,1.5,.3).rotation.z=Math.PI/2;
  }else if(acc==='wings'){
    [-1,1].forEach(s=>{
      [[.5,.62],[.9,.56],[1.3,.5],[1.65,.42]].forEach(([a,len],i)=>{
        const f=add(new THREE.SphereGeometry(.07,10,8),i%2?0xeef6ff:0xffffff,s*(.2+Math.sin(a)*len/2),1.32+Math.cos(a)*len/2,-.48-i*.012);
        f.scale.set(1.5,len/.14,.35);f.rotation.z=-s*a;
      });
    });
  }else if(acc==='headset'){
    add(new THREE.TorusGeometry(.465,.035,8,28,Math.PI),0x1d2b22,0,0,0,head);
    [-1,1].forEach(s=>{const e=add(new THREE.CylinderGeometry(.13,.13,.11,16),0x24342b,s*.46,0,0,head);e.rotation.z=Math.PI/2;
      const r=add(new THREE.CylinderGeometry(.075,.075,.115,16),c.shirt,s*.46,0,0,head);r.rotation.z=Math.PI/2});
    bar([-.47,-.04,.08],[-.3,-.12,.37],.012,0x1d2b22,head);
    add(new THREE.SphereGeometry(.03,10,8),0x111111,-.29,-.12,.385,head);
  }else if(acc==='medal'){
    [-1,1].forEach(s=>{const r=add(new THREE.BoxGeometry(.05,.17,.012),s>0?0xd62839:0x2f6fd6,.2+s*.03,1.33,rr(1.33)+.012);r.rotation.z=s*.28});
    const d=add(new THREE.CylinderGeometry(.085,.085,.022,24),0xf2c14e,.2,1.18,rr(1.18)+.018);d.rotation.x=Math.PI/2;
    const s2=add(new THREE.OctahedronGeometry(.04),0xfff0b0,.2,1.18,rr(1.18)+.034);s2.scale.set(1,1,.4);
  }
  /* ออร่า (เรืองแสงรอบตัว) */
  if(A&&A.aura){
    const glow=new THREE.MeshBasicMaterial({color:A.aura,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
    const ring=new THREE.Mesh(new THREE.RingGeometry(.62,.82,44),glow);ring.rotation.x=-Math.PI/2;ring.position.y=.03;ring.userData.keep=1;g.add(ring);
    const shell=new THREE.Mesh(new THREE.CylinderGeometry(.86,.86,2.5,32,1,true),new THREE.MeshBasicMaterial({color:A.aura,transparent:true,opacity:.1,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
    shell.position.y=1.25;shell.userData.keep=1;g.add(shell);
    g.userData.aura=[ring,shell];
  }
  const top=2.95*bh+(hs-1)*.42+({wizard:.34,antlers:.2,bunnyears:.3,crown:.1,halo:.12}[hat]||0)+(st==='afro'?.1:0);
  g.userData=Object.assign(g.userData,{head,eyes,top});
  if(c.glb&&(!glbOff||c.own))attachGlb(g,c.glb,!!c.own);
  return g;
}
function disposeTree(o){if(o.userData)o.userData.dead=true;o.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material)n.material.dispose()})}

/* โมเดล 3D ที่สมาชิก Pro อัปโหลดเอง (.glb): โหลดตอนมีคนใช้ ตรวจขนาด/จำนวนสามเหลี่ยม และไม่ยอมให้ดึงไฟล์จากเว็บภายนอก */
let glbOff=store.get('qs.glbOff',false);
const glbCache=new Map();
let gltfLib=null;
const fileUrl=f=>window.__QS_FILEURL?window.__QS_FILEURL(f):'/f/'+f.id;
function loadScript(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('script'));document.head.append(s)})}
function ensureGltf(){
  if(THREE.GLTFLoader&&THREE.SkeletonUtils)return Promise.resolve();
  return gltfLib||(gltfLib=loadScript('vendor/GLTFLoader.js').then(()=>loadScript('vendor/SkeletonUtils.js')).catch(e=>{gltfLib=null;throw e}));
}
function loadGlb(fid){
  let p=glbCache.get(fid);if(p)return p;
  p=(async()=>{
    await ensureGltf();
    const r=await fetch(fileUrl({id:fid}));if(!r.ok)throw new Error('http');
    const buf=await r.arrayBuffer();
    if(buf.byteLength>26*1048576||buf.byteLength<20)throw new Error('size');
    const mgr=new THREE.LoadingManager();
    mgr.setURLModifier(u=>/^(blob:|data:)/.test(u)?u:'data:,');
    const gltf=await new Promise((ok,no)=>new THREE.GLTFLoader(mgr).parse(buf,'',ok,no));
    let tris=0;
    gltf.scene.traverse(o=>{
      if(o.isMesh&&o.geometry){const gm=o.geometry;tris+=(gm.index?gm.index.count:(gm.attributes.position?gm.attributes.position.count:0))/3}
      const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];
      ms.forEach(m=>{['map','emissiveMap'].forEach(k=>{if(m[k])m[k].encoding=THREE.LinearEncoding});m.needsUpdate=true});
    });
    if(tris>200000)throw new Error('heavy');
    const box=new THREE.Box3().setFromObject(gltf.scene),size=new THREE.Vector3();box.getSize(size);
    if(!(size.y>0)||!isFinite(size.y))throw new Error('empty');
    return {gltf,box,size};
  })();
  glbCache.set(fid,p);
  p.catch(()=>setTimeout(()=>glbCache.delete(fid),30000));
  return p;
}
function attachGlb(g,fid,own){
  loadGlb(fid).then(({gltf,box,size})=>{
    if(g.userData.dead||(glbOff&&!own))return;
    const clone=THREE.SkeletonUtils?THREE.SkeletonUtils.clone(gltf.scene):gltf.scene.clone(true);
    const H=2.45,s=H/size.y,holder=new THREE.Group();
    clone.position.set(-(box.min.x+box.max.x)/2,-box.min.y,-(box.min.z+box.max.z)/2);
    holder.add(clone);holder.scale.setScalar(s);
    g.children.slice().forEach(ch=>{if(!ch.userData.keep)ch.visible=false});
    g.add(holder);g.userData.top=H+.5;g.userData.custom=true;
    if(gltf.animations&&gltf.animations.length){const mx=new THREE.AnimationMixer(clone);mx.clipAction(gltf.animations[0]).play();g.userData.mixer=mx}
  }).catch(()=>{});
}

/* ---------- พื้นหลังห้อง ---------- */
const BG_PRESETS=[
  ['default','ค่าเริ่มต้น',''],
  ['forest','ป่าเขียว','linear-gradient(160deg,#1f5c3a,#0f2a1e)'],
  ['mist','หมอกเช้า','linear-gradient(180deg,#e4f3e6,#a9d6b4)'],
  ['night','ค่ำคืน','linear-gradient(180deg,#0b1f1a,#14403a 60%,#1c5a4a)'],
  ['lake','ทะเลสาบ','linear-gradient(180deg,#bfe8e3,#6fb9b0 55%,#3d8b78)'],
  ['sunrise','รุ่งอรุณ','linear-gradient(180deg,#f3f1c8,#bfe3b0 55%,#6fb683)']
];
const BG_DEFAULT={preset:'default',dim:0,blur:0,image:false};
let bgState=Object.assign({},BG_DEFAULT,store.get('qs.bg',{}));
let bgImage=store.get('qs.bgimg','');
if(!bgImage)bgState.image=false;
const stages=[];
const saveBg=()=>store.set('qs.bg',bgState);
function bgCss(){
  if(bgState.image&&bgImage)return 'url("'+bgImage+'")';
  const p=BG_PRESETS.find(x=>x[0]===bgState.preset);return p?p[2]:'';
}
function applyBg(){
  const css=bgCss();
  stages.forEach(st=>{
    st.bgl.style.backgroundImage=css||'none';
    st.bgl.style.filter=bgState.blur?'blur('+bgState.blur+'px)':'none';
    st.bgd.style.opacity=String(bgState.dim/100);
  });
}

class Stage{
  constructor(host,mode){
    this.host=host;this.mode=mode;this.items=[];this.yaw=0;this.running=false;this.lastSig='';
    this.canvas=document.createElement('canvas');host.prepend(this.canvas);
    this.bgd=document.createElement('div');this.bgd.className='bgd';host.prepend(this.bgd);
    this.bgl=document.createElement('div');this.bgl.className='bgl';host.prepend(this.bgl);
    stages.push(this);applyBg();
    this.labels=document.createElement('div');this.labels.className='labels';host.append(this.labels);
    try{this.r=new THREE.WebGLRenderer({canvas:this.canvas,antialias:true,alpha:true})}
    catch(e){this.failed=true;host.insertAdjacentHTML('beforeend','<p class="nogl">อุปกรณ์หรือเบราว์เซอร์นี้แสดงภาพ 3D ไม่ได้ ลองเปิดด้วย Chrome หรือ Safari รุ่นใหม่</p>');return}
    this.r.setPixelRatio(Math.min(devicePixelRatio||1,2));
    this.scene=new THREE.Scene();
    this.cam=new THREE.PerspectiveCamera(40,1,.1,60);
    this.scene.add(new THREE.HemisphereLight(0xeaffea,0x2c5a3a,.62));
    const dl=new THREE.DirectionalLight(0xffffff,.45);dl.position.set(3,6,5);this.scene.add(dl);
    const room=mode==='room';
    const floor=new THREE.Mesh(new THREE.CircleGeometry(room?5.2:2.1,56),new THREE.MeshLambertMaterial({color:0x4a9a68}));
    floor.rotation.x=-Math.PI/2;this.scene.add(floor);
    const ring=new THREE.Mesh(new THREE.RingGeometry(room?4.6:1.7,room?4.8:1.8,56),new THREE.MeshBasicMaterial({color:0xbfe6c6}));
    ring.rotation.x=-Math.PI/2;ring.position.y=.01;this.scene.add(ring);
    if(room){
      const pot=new THREE.Mesh(new THREE.CylinderGeometry(.34,.26,.4,18),new THREE.MeshLambertMaterial({color:0xb08a62}));
      pot.position.set(0,.2,-.2);this.scene.add(pot);
      [[0,.8,0,.3],[-.2,.62,.05,.22],[.2,.64,-.05,.22]].forEach(([x,y,z,r])=>{
        const l=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),new THREE.MeshLambertMaterial({color:0x3f9b57}));
        l.position.set(x,y,z-.2);l.scale.y=1.3;this.scene.add(l)});
      this.cam.position.set(0,3.4,7.8);this.cam.lookAt(0,1.1,-1.6);
    }else{
      this.cam.position.set(0,1.8,6.4);this.cam.lookAt(0,1.45,0);
    }
    this.people=new THREE.Group();this.scene.add(this.people);
    new ResizeObserver(()=>this.resize()).observe(host);
    if(mode==='studio'){
      let down=false,lx=0;
      this.canvas.addEventListener('pointerdown',e=>{down=true;lx=e.clientX;this.canvas.setPointerCapture(e.pointerId)});
      this.canvas.addEventListener('pointermove',e=>{if(down){this.yaw+=(e.clientX-lx)*.012;lx=e.clientX}});
      const up=()=>{down=false};
      this.canvas.addEventListener('pointerup',up);this.canvas.addEventListener('pointercancel',up);
    }
    this.resize();
  }
  resize(){
    if(this.failed)return;
    const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;
    this.w=w;this.h=h;this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.updateProjectionMatrix();
  }
  setBadge(id,rd){const it=this.items.find(x=>x.id===id);if(it)rdBadge(it.label,rd)}
  setPeople(list){
    if(this.failed)return;
    this.items.forEach(it=>{this.people.remove(it.g);disposeTree(it.g);it.label.remove()});
    this.items=[];
    const n=list.length;
    list.forEach((p,i)=>{
      const g=makeAvatar(p.me?Object.assign({},p.cfg,{own:1}):p.cfg);
      if(this.mode==='room'){
        const row=i>=7?1:0, inRow=row?n-7:Math.min(n,7), k=row?i-7:i;
        const rad=3.1+row*1.2;
        const span=inRow>1?Math.min(130,40+inRow*18):0;
        const th=(180-span/2+(inRow>1?span*k/(inRow-1):span/2))*Math.PI/180;
        g.position.set(Math.sin(th)*rad,0,Math.cos(th)*rad);
        g.rotation.y=th+Math.PI;
      }
      this.people.add(g);
      const label=document.createElement('div');label.className='lbl'+(p.me?' me':'');
      const pimg=picSrc(p.cfg&&p.cfg.pic);
      if(pimg){const im=document.createElement('img');im.className='lpic';im.alt='';im.src=pimg;label.append(im);label.classList.add('haspic')}
      label.append(document.createTextNode(p.name+(p.me?' (คุณ)':'')));
      if(p.pro){const pb=document.createElement('i');pb.className='pb';pb.textContent='✦';pb.title='สมาชิก Pro';label.append(pb)}
      rdBadge(label,p.rd);
      this.labels.append(label);
      this.items.push({id:p.id,g,head:g.userData.head,eyes:g.userData.eyes,label,seed:i*1.7});
    });
  }
  start(){
    if(this.failed||this.running)return;
    this.running=true;this.t0=performance.now();this.resize();
    let tPrev=0;
    const loop=()=>{
      if(!this.running)return;
      requestAnimationFrame(loop);
      const t=(performance.now()-this.t0)/1000,dt=Math.min(.1,t-tPrev);tPrev=t;
      if(this.mode==='studio'){ if(!reduceMotion)this.yaw+=.003; this.people.rotation.y=this.yaw; }
      const v=new THREE.Vector3();
      this.items.forEach(it=>{
        if(!reduceMotion){
          it.g.position.y=Math.sin(t*1.3+it.seed)*.025;
          it.head.rotation.y=Math.sin(t*.55+it.seed)*.22;
          it.head.rotation.x=Math.sin(t*.8+it.seed)*.04;
        }
        it.eyes.scale.y=((t*.7+it.seed)%4)<.12?.12:1;
        const ud=it.g.userData;
        if(ud.aura&&!reduceMotion){ud.aura[0].rotation.z=t*.8;ud.aura[1].material.opacity=.08+.04*Math.sin(t*2+it.seed)}
        if(ud.mixer)ud.mixer.update(dt);
        it.g.getWorldPosition(v);v.y+=ud.top||2.95;v.project(this.cam);
        const x=(v.x*.5+.5)*this.w,y=(-v.y*.5+.5)*this.h;
        it.label.style.transform='translate('+x+'px,'+y+'px) translate(-50%,-100%)';
      });
      this.r.render(this.scene,this.cam);
    };
    loop();
  }
  stop(){this.running=false}
}

/* ---------- โครงแอป: มุมมอง เซิร์ฟเวอร์ ช่อง เพื่อน รายชื่อ ---------- */
let studioStage=null, roomStage=null, lastVoice='';
let me={uid:'',code:''};
let servers=[], curSid=store.get('qs.sid','home');
let social={friends:[],inReq:[],outReq:[],blocked:[],dms:[]};
let view={k:'friends',id:''};
let curText='', curDm='', lastHome={k:'friends',id:''};
let lastCh=store.get('qs.lastCh2',{});
let readTs=store.get('qs.read',null);
const STATUS_IDS=['online','idle','dnd','invisible'];
let myStatus=store.get('qs.status','online'), autoIdle=false;
if(STATUS_IDS.indexOf(myStatus)<0)myStatus='online';
let roster=[], rosterSid='';
let fTab='online', booted=false, pendingGo=null, pendingInvite='', joinPrev=null, avDirty=false;
const people=new Map(), needPic=new Set();
const msgs={}, typers={}, speaking=new Set();
let memHidden=false;
const effStatus=()=>myStatus==='online'&&autoIdle?'idle':myStatus;
const ST_LABEL={online:'ออนไลน์',idle:'ไม่อยู่',dnd:'ห้ามรบกวน',invisible:'ล่องหน',offline:'ออฟไลน์'};
const srvById=id=>servers.find(s=>s.id===id)||null;
const chanById=id=>{for(const s of servers){const c=s.channels.find(x=>x.id===id);if(c)return c}return null};
const srvOfCh=id=>servers.find(s=>s.channels.some(c=>c.id===id))||null;
const firstText=sid=>{const s=srvById(sid||curSid);const c=s&&s.channels.find(x=>x.type==='text');return c?c.id:''};
const isDm=k=>typeof k==='string'&&k.slice(0,2)==='d:';
const modOf=rid=>{if(isDm(rid))return false;const s=srvOfCh(rid);return !!(s&&s.mine)};
const personOf=uid=>uid===me.uid?{uid,name:profile.name,shirt:profile.shirt,pic:profile.pic,frame:ownCfg().frame,pro:meX.pro}:(people.get(uid)||null);
function stOf(uid){if(uid===me.uid)return net.ok?effStatus():'offline';const p=people.get(uid);return (p&&p.status)||'offline'}
const IC_USERS='<svg class="i" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.3c1.8.8 3 2.6 3 5.7"/></svg>';

function toast(msg){
  const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toast.id);toast.id=setTimeout(()=>{t.hidden=true},2800);
}
// แจ้งเตือนข้อความ/คำขอ: ปิดเมื่ออยู่ในสถานะห้ามรบกวน
function notifyMsg(text){if(myStatus==='dnd')return;toast(text);chime()}
const hashCol=n=>{let h=0;for(const ch of String(n||'?'))h=(h*31+ch.charCodeAt(0))|0;return ['#2f8f4e','#3b7f86','#7a4f9a','#c58b4e','#d96b8a','#4a5fa8','#3f7a46','#b8452f'][Math.abs(h)%8]};
// รูปโปรไฟล์ + กรอบ: ถ้ารู้จักคนนี้ (จากรายชื่อ/เพื่อน/ออนไลน์) ใช้ข้อมูลล่าสุดของเขา ไม่งั้นใช้ข้อมูลที่ติดมากับข้อความ
function avatarHTML(o,cls,attrs){
  cls=cls||'av';
  let pic=o.pic||'',shirt=o.shirt,frame=o.frame||'none';
  if(!o.raw){
    if(o.uid&&o.uid===me.uid){pic=profile.pic||'';shirt=profile.shirt;frame=ownCfg().frame||'none'}
    else{const pr=o.uid&&people.get(o.uid);if(pr){pic=pr.pic||'';shirt=pr.shirt||shirt;frame=pr.frame||'none'}}
  }
  if(FRAMES.every(f=>f[0]!==frame))frame='none';
  const src=picSrc(pic);
  const inner=src?'<img class="'+cls+'" alt="" src="'+src.replace(/"/g,'&quot;')+'">'
    :'<span class="'+cls+' ini" style="background:'+esc(shirt||hashCol(o.name))+'" aria-hidden="true">'+esc((o.name||'?').trim().slice(0,1).toUpperCase())+'</span>';
  return '<span class="avw fr-'+frame+'"'+(attrs||'')+'>'+inner+'</span>';
}
function mergePerson(c){
  if(!c||!c.uid)return null;
  const e=people.get(c.uid)||{uid:c.uid};
  const sig=[e.name,e.shirt,e.frame,e.pic,e.pv,e.pro].join('|');
  e.name=c.name;e.shirt=c.shirt;e.frame=c.frame||'none';e.pro=!!c.pro;
  if(c.pic){e.pic=c.pic;e.pv=''}
  else if(c.pv){if(e.pv!==c.pv){e.pv=c.pv;e.pic='';needPic.add(c.uid)}}
  else{e.pic='';e.pv=''}
  if([e.name,e.shirt,e.frame,e.pic,e.pv,e.pro].join('|')!==sig)avDirty=true;
  people.set(c.uid,e);return e;
}
function flushPics(){if(needPic.size){send({t:'pics',uids:[...needPic].slice(0,30)});needPic.clear()}}
function applyPresence(list){
  people.forEach(e=>{if(e.uid!==me.uid){e.status='offline';e.vs='';e.vc=''}});
  (list||[]).forEach(x=>{const e=mergePerson(x);if(e){e.status=x.status;e.vs=x.vs||'';e.vc=x.vc||''}});
  flushPics();
}
function applySocial(s){
  s=s||{};
  social={friends:s.friends||[],inReq:s.inReq||[],outReq:s.outReq||[],blocked:s.blocked||[],dms:s.dms||[]};
  Object.keys(s.profiles||{}).forEach(k=>mergePerson(s.profiles[k]));
  flushPics();
}
function repaintChats(){avDirty=false;['t','v','d'].forEach(p=>{if(roomOf(p)&&msgs[roomOf(p)])renderChat(p)})}

/* ข้อความที่ยังไม่ได้อ่าน */
const lastOf=k=>{if(isDm(k)){const d=social.dms.find(x=>x.uid===k.slice(2));return d?d.last||0:0}const c=chanById(k);return c?c.last||0:0};
const viewKey=()=>view.k==='dm'?'d:'+view.id:(view.k==='text'||view.k==='voice'?view.id:'');
function dmUnread(){const rd=readTs||{};return social.dms.filter(d=>!(view.k==='dm'&&view.id===d.uid)&&(d.last||0)>(rd['d:'+d.uid]||0)).length}
function markRead(k){
  if(!k||!readTs||document.visibilityState!=='visible')return;
  const l=lastOf(k);
  if((readTs[k]||0)<l){readTs[k]=l;store.set('qs.read',readTs);renderChannels();renderTop()}
}
function initRead(){
  const first=readTs===null;if(first)readTs={};
  let ch=false;
  servers.forEach(s=>s.channels.forEach(c=>{if(readTs[c.id]===undefined){readTs[c.id]=c.last||0;ch=true}}));
  if(first)social.dms.forEach(d=>{readTs['d:'+d.uid]=d.last||0;ch=true});
  if(ch)store.set('qs.read',readTs);
}

/* ---------- การนำทาง ---------- */
function setView(k,id){
  view={k,id:id||''};
  if(k==='text'||k==='voice'){
    const s=srvOfCh(id);
    if(s){curSid=s.id;store.set('qs.sid',curSid);lastCh[s.id]=id;store.set('qs.lastCh2',lastCh)}
    if(k==='text')curText=id;
  }else if(k==='friends'||k==='dm'){
    curSid='home';store.set('qs.sid','home');lastHome={k,id:id||''};
    if(k==='dm')curDm=id;
  }
  ['friends','dm','text','voice','studio','plans'].forEach(n=>{$('#v-'+n).hidden=n!==k});
  const app=$('#app');app.dataset.view=k;app.classList.remove('nav-open','mem-open');
  app.classList.toggle('nomem',curSid==='home'||k==='studio'||k==='plans'||memHidden);
  if(k!=='studio'&&studioStage)studioStage.stop();
  if(k!=='voice'&&roomStage)roomStage.stop();
  if(k==='text'){loadHistory(id);renderChat('t');markRead(id)}
  else if(k==='dm'){loadHistory('d:'+id);renderChat('d');markRead('d:'+id)}
  else if(k==='voice'){
    if(!roomStage)roomStage=new Stage($('#roomStage'),'room');
    lastSig='';refreshRoom(true);roomStage.start();loadHistory(id);renderChat('v');markRead(id);
  }else if(k==='friends')renderFriends();
  else if(k==='plans')renderPlans();
  else openStudio();
  if(k!=='studio')wantRoster();
  paintHead();renderTop();renderChannels();renderMembersPanel();
}
function goHome(){const h=lastHome;if(h.k==='dm'&&h.id)setView('dm',h.id);else setView('friends')}
function goServer(sid){
  if(sid==='home'){goHome();return}
  const s=srvById(sid);if(!s)return;
  let id=lastCh[sid];
  if(!id||!s.channels.some(c=>c.id===id&&c.type==='text'))id=firstText(sid);
  curSid=sid;store.set('qs.sid',sid);
  setView('text',id);
}
function bootView(){
  if(curSid!=='home'&&srvById(curSid))goServer(curSid);
  else{curSid='home';goHome()}
}
function reshow(){
  const k=view.k;
  if((k==='text'||k==='voice')&&view.id&&!chanById(view.id)){bootView();return}
  if(k==='text'||k==='dm'||k==='friends')setView(k,view.id);
  else if(k==='voice'&&currentRoom)loadHistory(currentRoom.id);
  else{renderChannels();paintHead();renderMembersPanel();if(k==='plans')renderPlans()}
}
function openDm(uid){
  if(!uid||uid===me.uid)return;
  send({t:'dm-open',uid});setView('dm',uid);
}

/* ---------- วาดหน้าจอส่วนต่างๆ ---------- */
function paintDel(){$('#delCh').textContent='ลบห้องนี้'}
function paintHead(){
  const r=chanById(view.id);
  let title='',topic='',del=false;
  if(view.k==='studio'){title='โปรไฟล์ของฉัน';topic='แต่งตัวละคร 3D กรอบ รูปโปรไฟล์ และบัญชี'}
  else if(view.k==='plans'){title='✦ QuietSpace Pro';topic='แพ็กเกจสมาชิก ส่วนลด และสิทธิพิเศษ'}
  else if(view.k==='friends'){title='เพื่อน';topic='เพิ่มเพื่อน ดูว่าใครออนไลน์ และคุยส่วนตัว'}
  else if(view.k==='dm'){const p=personOf(view.id);title='@ '+(p?p.name:'ผู้ใช้');topic=ST_LABEL[stOf(view.id)]}
  else if(r){title=(r.type==='text'?'# ':'🔊 ')+r.name;topic=r.desc||'';del=!!r.canDelete}
  else if(view.k==='text'){title='ยังไม่มีช่องข้อความ';topic=''}
  $('#chTitle').textContent=title;$('#chTopic').textContent=topic;$('#chTopic').hidden=!topic;
  $('#delCh').hidden=!del;$('#memToggle').hidden=curSid==='home'||view.k==='studio'||view.k==='plans';paintDel();paintUserBar();
}
function paintUserBar(){
  const st=net.ok?effStatus():'offline';
  const up=$('#upAv');up.dataset.st=st;
  up.innerHTML=avatarHTML({uid:me.uid,cid,name:profile.name,shirt:profile.shirt,pic:profile.pic,frame:ownCfg().frame});
  $('#upName').textContent=profile.name;paintPro();
  $('#upSt').textContent=(RD&&rdUserText())||(currentRoom?'ในห้องเสียง':ST_LABEL[st]);
  const inV=!!currentRoom;
  $('#micBtn2').hidden=!inV;$('#deafBtn2').hidden=!inV;$('#vcBar').hidden=!inV;
  if(inV){const s=srvById(currentRoom.sid);$('#vcName').textContent=currentRoom.name+(s?' · '+s.name:'')}
}
function paintBadges(){
  const tot=social.inReq.length+dmUnread();
  const hb=$('#homeBadge');hb.hidden=!tot;hb.textContent=tot>99?'99+':String(tot);
  setTitle();
}
function renderTop(){
  $('#srvHome').classList.toggle('on',curSid==='home');
  const rd=readTs||{};
  $('#srvList').innerHTML=servers.map(s=>{
    const on=s.id===curSid,un=!on&&s.channels.some(c=>c.type==='text'&&(c.last||0)>(rd[c.id]||0));
    return '<button class="srv'+(on?' on':'')+'" data-sid="'+esc(s.id)+'" title="'+esc(s.name)+'" aria-label="'+esc(s.name)+'" style="background:'+esc(s.icon.c)+'"><span aria-hidden="true">'+esc(s.icon.e)+'</span>'+(un?'<i class="u" aria-label="มีข้อความใหม่"></i>':'')+'</button>';
  }).join('');
  paintBadges();
}
const IC_SPK='<svg class="i" viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const IC_MUTE='<svg class="i" viewBox="0 0 24 24" aria-label="ปิดไมค์"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 12 5M12 18v3M4 4l16 16"/></svg>';
const IC_TRASH='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
const delBtn=r=>r.canDelete?'<button type="button" class="x cdel" data-chdel="'+esc(r.id)+'" aria-label="ลบห้อง '+esc(r.name)+'" title="ลบห้องนี้">'+IC_TRASH+'</button>':'';
function renderChannels(){
  const el=$('#chList');
  const home=curSid==='home',s=srvById(curSid);
  $('#sTitle').textContent=home?'หน้าหลัก':(s?s.name:'');
  $('#shead').disabled=home;$('#sChev').style.display=home?'none':'';
  if(home){renderHomeList(el);return}
  if(!s){el.innerHTML='<p class="empty">'+(net.ok?'ไม่พบเซิร์ฟเวอร์นี้':'กำลังเชื่อมต่อเซิร์ฟเวอร์…')+'</p>';return}
  const rd=readTs||{};
  let h='<div class="cat"><span>ช่องข้อความ</span>'+(s.canMake?'<button data-new="text" aria-label="สร้างช่องข้อความ" title="สร้างช่องข้อความ">+</button>':'')+'</div>';
  h+=s.channels.filter(r=>r.type==='text').map(r=>{
    const on=view.k==='text'&&view.id===r.id,un=!on&&(r.last||0)>(rd[r.id]||0);
    return '<div class="chrow"><button class="ch'+(on?' on':'')+(un?' unread':'')+(r.canDelete?' hasdel':'')+'" data-ch="'+esc(r.id)+'" data-type="text"><span class="hash">#</span><span class="cn">'+esc(r.name)+'</span>'+(un?'<i class="dot" aria-label="มีข้อความใหม่"></i>':'')+'</button>'+delBtn(r)+'</div>';
  }).join('');
  h+='<div class="cat"><span>ช่องเสียง</span>'+(s.canMake?'<button data-new="voice" aria-label="สร้างช่องเสียง" title="สร้างช่องเสียง">+</button>':'')+'</div>';
  h+=s.channels.filter(r=>r.type==='voice').map(r=>{
    const on=view.k==='voice'&&view.id===r.id;
    return '<div class="chrow"><button class="ch voice'+(on?' on':'')+(r.canDelete?' hasdel':'')+'" data-ch="'+esc(r.id)+'" data-type="voice">'+IC_SPK+'<span class="cn">'+esc(r.name)+'</span><span class="cnt">'+r.count+'/'+r.cap+'</span></button>'+delBtn(r)+'</div>'
      +(r.members&&r.members.length?'<ul class="vps">'+r.members.map(m=>'<li class="vp'+(speaking.has(m.id)?' speaking':'')+'" data-pid="'+esc(m.id)+'" data-card="'+esc(m.uid)+'" data-name="'+esc(m.name)+'">'+avatarHTML({uid:m.uid,name:m.name,shirt:m.shirt,pic:m.pic,frame:m.frame})+'<span class="un">'+esc(m.name)+(m.uid===me.uid?' (คุณ)':'')+'</span>'+(m.scr?'<svg class="i" viewBox="0 0 24 24" style="color:var(--accent)" aria-label="กำลังแชร์หน้าจอ"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>':'')+(RD_EMO[m.rd]?'<span class="rb" title="'+RD_EMO[m.rd][1]+'">'+RD_EMO[m.rd][0]+'</span>':'')+(m.mic?'':IC_MUTE)+'</li>').join('')+'</ul>':'');
  }).join('');
  el.innerHTML=h;
}
function renderHomeList(el){
  const rd=readTs||{};
  const dm=social.dms.slice();
  if(view.k==='dm'&&view.id&&!dm.some(d=>d.uid===view.id))dm.push({uid:view.id,last:0});
  dm.sort((a,b)=>(b.last||0)-(a.last||0));
  let h='<button class="ch hbtn'+(view.k==='friends'?' on':'')+'" data-home="friends"><span class="hico">'+IC_USERS+'</span><span class="cn">เพื่อน</span>'+(social.inReq.length?'<span class="badge2" aria-label="คำขอเป็นเพื่อน '+social.inReq.length+' คำขอ">'+social.inReq.length+'</span>':'')+'</button>';
  h+='<div class="cat"><span>ข้อความส่วนตัว</span></div>';
  if(!dm.length)h+='<p class="empty">ยังไม่มีแชตส่วนตัว กดที่ชื่อเพื่อนหรือสมาชิกในเซิร์ฟเวอร์ แล้วเลือก "ส่งข้อความ"</p>';
  h+=dm.map(d=>{
    const p=people.get(d.uid)||{name:'ผู้ใช้'},on=view.k==='dm'&&view.id===d.uid,un=!on&&(d.last||0)>(rd['d:'+d.uid]||0);
    return '<div class="chrow"><button class="ch dmi'+(on?' on':'')+(un?' unread':'')+'" data-dm="'+esc(d.uid)+'"><span class="stat" data-st="'+stOf(d.uid)+'">'+avatarHTML({uid:d.uid,name:p.name,shirt:p.shirt,pic:p.pic,frame:p.frame})+'</span><span class="cn">'+esc(p.name)+'</span>'+(un?'<i class="dot" aria-label="มีข้อความใหม่"></i>':'')+'</button><button class="x" data-dmx="'+esc(d.uid)+'" aria-label="ปิดแชตนี้" title="ปิดแชตนี้">×</button></div>';
  }).join('');
  if(location.protocol==='file:'&&!window.__QS_DEMO_WS)h+='<p class="empty">เปิดไฟล์นี้ตรงๆ ไม่ได้ ต้องเปิดผ่านเว็บที่ติดตั้งระบบหลังบ้านแล้ว (ดูวิธีในไฟล์ README)</p>';
  else if(!net.ok)h+='<p class="empty">กำลังเชื่อมต่อเซิร์ฟเวอร์…</p>';
  el.innerHTML=h;
}
function wantRoster(){
  if(curSid==='home'||view.k==='studio'||!net.ok)return;
  if(rosterSid!==curSid){roster=[];rosterSid=curSid}
  send({t:'members',sid:curSid});
}
function renderMembersPanel(){
  const el=$('#members');
  if(curSid==='home'){el.innerHTML='';return}
  if(rosterSid!==curSid){el.innerHTML='<h3>สมาชิก</h3><p class="empty">กำลังโหลด…</p>';return}
  const list=roster.map(r=>{const p=people.get(r.uid)||r;return {uid:r.uid,name:p.name||r.name,owner:r.owner,st:stOf(r.uid)}})
    .sort((a,b)=>String(a.name).localeCompare(String(b.name),'th'));
  const on=list.filter(x=>x.st!=='offline'),off=list.filter(x=>x.st==='offline');
  const row=x=>{
    const p=people.get(x.uid)||{},vr=p.vc&&chanById(p.vc);
    const sub=x.st==='offline'?'':(vr?'อยู่ใน '+vr.name:ST_LABEL[x.st]);
    return '<div class="mem'+(x.st==='offline'?' off':'')+'" data-card="'+esc(x.uid)+'" data-name="'+esc(x.name)+'"><span class="stat" data-st="'+x.st+'">'+avatarHTML({uid:x.uid,name:x.name,shirt:p.shirt,pic:p.pic,frame:p.frame})+'</span><span class="mn"><b>'+esc(x.name)+(x.owner?' <span class="own" title="เจ้าของเซิร์ฟเวอร์">👑</span>':'')+(x.uid===me.uid?' (คุณ)':'')+'</b>'+(sub?'<span>'+esc(sub)+'</span>':'')+'</span></div>';
  };
  el.innerHTML='<h3>ออนไลน์ — '+on.length+'</h3>'+(on.length?on.map(row).join(''):'<p class="empty">ยังไม่มีใครออนไลน์</p>')+(off.length?'<h3>ออฟไลน์ — '+off.length+'</h3>'+off.map(row).join(''):'');
}
function paintSpeaking(){document.querySelectorAll('.vp').forEach(li=>li.classList.toggle('speaking',speaking.has(li.dataset.pid)))}
function joinRoom(id){ if(!send({t:'join',room:id}))toast('ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์ ลองใหม่อีกครั้ง'); }

/* ---------- เพื่อน ---------- */
const F_TABS=[['online','ออนไลน์'],['all','ทั้งหมด'],['pending','รอดำเนินการ'],['blocked','บล็อก'],['add','เพิ่มเพื่อน']];
const friendsSorted=()=>social.friends.slice().sort((a,b)=>String((personOf(a)||{}).name).localeCompare(String((personOf(b)||{}).name),'th'));
function subOf(uid,st){
  if(st==='offline')return 'ออฟไลน์';
  const p=people.get(uid),vr=p&&p.vc&&chanById(p.vc);
  return ST_LABEL[st]+(vr?' · อยู่ใน '+vr.name:(p&&p.vc?' · อยู่ในห้องเสียง':''));
}
function frow(uid,acts,sub){
  const p=people.get(uid)||{name:'ผู้ใช้'},st=stOf(uid);
  return '<div class="frow" data-card="'+esc(uid)+'" data-name="'+esc(p.name)+'"><span class="stat" data-st="'+st+'">'+avatarHTML({uid,name:p.name,shirt:p.shirt,pic:p.pic,frame:p.frame})+'</span><div class="fn"><b>'+esc(p.name)+'</b><span>'+esc(sub!=null?sub:subOf(uid,st))+'</span></div><div class="facts">'+acts+'</div></div>';
}
const fb=(a,u,t,cls)=>'<button type="button" class="btn '+(cls||'ghost')+' sm" data-fa="'+a+'" data-u="'+esc(u)+'">'+t+'</button>';
function renderFriends(){
  const pend=social.inReq.length;
  $('#fTabs').innerHTML=F_TABS.map(([v,l])=>'<button type="button" role="tab" aria-selected="'+(fTab===v)+'" data-ft="'+v+'"'+(v==='add'?' class="addb"':'')+'>'+l+(v==='pending'&&pend?'<span class="nb">'+pend+'</span>':'')+'</button>').join('');
  const body=$('#fBody');
  if(fTab==='add'){
    const ex=body.querySelector('.addbox');
    if(ex){const b=ex.querySelector('.codebox b');if(b)b.textContent=me.code||'------';return}
    body.innerHTML='<div class="addbox"><h2>เพิ่มเพื่อน</h2>'
      +'<div class="codebox"><span>รหัสเพื่อนของคุณ</span><b>'+esc(me.code||'------')+'</b>'+fb('copycode','','คัดลอก')+'</div>'
      +'<p class="hint">ส่งรหัสนี้ให้เพื่อน แล้วให้เขาใส่ในช่องนี้ของเขา หรือใส่รหัสของเพื่อนที่นี่ รหัสมี 6 ตัว (ตัวอักษรและตัวเลข)</p>'
      +'<form class="addrow" id="addForm" autocomplete="off"><input type="text" id="addCode" maxlength="14" placeholder="เช่น K7M2QX" aria-label="รหัสเพื่อน"><button class="btn" type="submit">ส่งคำขอเป็นเพื่อน</button></form>'
      +'<p class="hint">อีกวิธี: กดที่ชื่อหรือรูปของคนในเซิร์ฟเวอร์เดียวกัน แล้วเลือก "เพิ่มเพื่อน"</p></div>';
    return;
  }
  let h='';
  const frAct=u=>fb('dm',u,'ข้อความ')+fb('rm',u,'ลบเพื่อน');
  if(fTab==='online'||fTab==='all'){
    const all=friendsSorted(),list=fTab==='online'?all.filter(u=>stOf(u)!=='offline'):all;
    if(!list.length)h='<div class="emptyf"><b>'+(all.length?'ตอนนี้ไม่มีเพื่อนออนไลน์':'ยังไม่มีเพื่อน')+'</b><span>'+(all.length?'เพื่อนที่ออฟไลน์อยู่ในแท็บ "ทั้งหมด"':'กด "เพิ่มเพื่อน" แล้วใส่รหัสเพื่อนของคนที่คุณรู้จัก')+'</span></div>';
    else h='<h3>'+(fTab==='online'?'ออนไลน์':'เพื่อนทั้งหมด')+' — '+list.length+'</h3>'+list.map(u=>frow(u,frAct(u))).join('');
  }else if(fTab==='pending'){
    if(!social.inReq.length&&!social.outReq.length)h='<div class="emptyf"><b>ไม่มีคำขอที่รออยู่</b><span>คำขอเป็นเพื่อนที่ส่งหรือได้รับจะอยู่ที่นี่</span></div>';
    else{
      if(social.inReq.length)h+='<h3>ได้รับ — '+social.inReq.length+'</h3>'+social.inReq.map(u=>frow(u,fb('ok',u,'ยอมรับ','')+fb('no',u,'ปฏิเสธ'),'ส่งคำขอเป็นเพื่อนถึงคุณ')).join('');
      if(social.outReq.length)h+='<h3>ส่งไปแล้ว — '+social.outReq.length+'</h3>'+social.outReq.map(u=>frow(u,fb('no',u,'ยกเลิก'),'รอเขาตอบรับ')).join('');
    }
  }else if(fTab==='blocked'){
    h=social.blocked.length?'<h3>บล็อก — '+social.blocked.length+'</h3>'+social.blocked.map(u=>frow(u,fb('unb',u,'ปลดบล็อก'),'ส่งข้อความหาคุณไม่ได้')).join(''):'<div class="emptyf"><b>ยังไม่ได้บล็อกใคร</b><span>คนที่คุณบล็อกจะส่งข้อความหรือขอเป็นเพื่อนกับคุณไม่ได้</span></div>';
  }
  body.innerHTML=h;
}
$('#fTabs').addEventListener('click',e=>{const b=e.target.closest('[data-ft]');if(!b)return;fTab=b.dataset.ft;$('#fBody').innerHTML='';renderFriends()});
let rmArm='';
$('#fBody').addEventListener('click',e=>{
  const b=e.target.closest('[data-fa]');
  if(!b){const c=e.target.closest('[data-card]');if(c&&!e.target.closest('button,input'))openCard(c,c.dataset.card,c.dataset.name);return}
  const u=b.dataset.u,a=b.dataset.fa;
  if(a==='dm')openDm(u);
  else if(a==='rm'){
    if(rmArm!==u){rmArm=u;b.textContent='ยืนยันลบ?';b.classList.add('danger');setTimeout(()=>{if(rmArm===u){rmArm='';if(b.isConnected){b.textContent='ลบเพื่อน';b.classList.remove('danger')}}},3000)}
    else{rmArm='';send({t:'friend-remove',uid:u})}
  }
  else if(a==='ok')send({t:'friend-accept',uid:u});
  else if(a==='no')send({t:'friend-decline',uid:u});
  else if(a==='unb')send({t:'unblock',uid:u});
  else if(a==='copycode')copyText(me.code,'คัดลอกรหัสเพื่อนแล้ว');
});
$('#fBody').addEventListener('submit',e=>{
  if(e.target.id!=='addForm')return;
  e.preventDefault();
  const code=$('#addCode').value.trim();if(!code)return;
  if(!send({t:'friend-add',code}))toast('ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์ ลองใหม่อีกครั้ง');
});
async function copyText(t,msg){
  try{await navigator.clipboard.writeText(t);toast(msg||'คัดลอกแล้ว');return}catch(_){}
  try{const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0';document.body.append(ta);ta.select();document.execCommand('copy');ta.remove();toast(msg||'คัดลอกแล้ว')}
  catch(_){toast('คัดลอกไม่ได้ ลองเลือกข้อความแล้วคัดลอกเอง')}
}

/* ---------- การ์ดโปรไฟล์ และเมนูสถานะ ---------- */
function relOf(uid){
  if(uid===me.uid)return 'self';
  if(social.blocked.includes(uid))return 'blocked';
  if(social.friends.includes(uid))return 'friend';
  if(social.inReq.includes(uid))return 'in';
  if(social.outReq.includes(uid))return 'out';
  return 'none';
}
function openCard(anchor,uid,fallbackName){
  if(!uid)return;
  const p=personOf(uid)||{uid,name:fallbackName||'ผู้ใช้'},st=stOf(uid),rel=relOf(uid);
  const pe=people.get(uid),vr=pe&&pe.vc&&chanById(pe.vc);
  let acts='';
  if(rel==='self')acts='<button class="pri" data-c="edit">แก้ไขโปรไฟล์</button>';
  else{
    if(rel!=='blocked')acts+='<button class="pri" data-c="dm">ส่งข้อความ</button>';
    if(rel==='none')acts+='<button data-c="add">เพิ่มเพื่อน</button>';
    if(rel==='in')acts+='<button data-c="accept">ยอมรับเป็นเพื่อน</button>';
    if(rel==='out')acts+='<button data-c="cancel">ยกเลิกคำขอเป็นเพื่อน</button>';
    if(rel==='friend')acts+='<button class="dg" data-c="unfriend" data-arm="ลบเพื่อน?">ลบเพื่อน</button>';
    acts+=rel==='blocked'?'<button data-c="unblock">ปลดบล็อก</button>':'<button class="dg" data-c="block" data-arm="บล็อก?">บล็อก</button>';
    const s=srvById(curSid);
    if(s&&s.mine&&!s.main&&view.k!=='studio'&&roster.some(r=>r.uid===uid))acts+='<button class="dg" data-c="kick" data-arm="เตะออก?">เตะออกจากเซิร์ฟเวอร์</button>';
  }
  const html='<div class="pc"><div class="pc-top"><span class="stat nod" data-st="'+st+'">'+avatarHTML({uid,name:p.name,shirt:p.shirt,pic:p.pic,frame:p.frame})+'</span><div><b>'+esc(p.name)+'</b><span>'+esc(ST_LABEL[st])+'</span>'+(vr?'<span>อยู่ใน '+esc(vr.name)+'</span>':'')+'</div></div><div class="pc-acts">'+acts+'</div></div>';
  openPop(anchor,html,'card',null);
  $('#pop').dataset.uid=uid;
}
$('#pop').addEventListener('click',e=>{
  const b=e.target.closest('button[data-c]');if(!b)return;
  if(b.dataset.arm&&!b.classList.contains('armed')){b.classList.add('armed');b.textContent=b.dataset.arm+' กดอีกครั้งเพื่อยืนยัน';return}
  const uid=$('#pop').dataset.uid;closePop();cardAction(b.dataset.c,uid);
});
function cardAction(c,uid){
  switch(c){
    case 'edit':setView('studio');break;
    case 'dm':openDm(uid);break;
    case 'add':if(!send({t:'friend-add',uid}))toast('ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์');break;
    case 'accept':send({t:'friend-accept',uid});break;
    case 'cancel':send({t:'friend-decline',uid});break;
    case 'unfriend':send({t:'friend-remove',uid});break;
    case 'block':send({t:'block',uid});break;
    case 'unblock':send({t:'unblock',uid});break;
    case 'kick':send({t:'kick',sid:curSid,uid});break;
  }
}
function sendStatus(){send({t:'status',s:effStatus()})}
function setStatus(v){
  myStatus=v;store.set('qs.status',v);autoIdle=false;sendStatus();
  paintUserBar();renderMembersPanel();renderChannels();toast('ตั้งสถานะเป็น "'+ST_LABEL[v]+'" แล้ว');
}
$('#meBtn').addEventListener('click',e=>{
  const items=[['online','ออนไลน์',''],['idle','ไม่อยู่','แสดงสถานะ "ไม่อยู่" ให้เพื่อนเห็น'],['dnd','ห้ามรบกวน','ปิดเสียงและข้อความแจ้งเตือนทั้งหมด'],['invisible','ล่องหน','ออนไลน์อยู่ แต่คนอื่นเห็นเป็นออฟไลน์']];
  const html=items.map(([v,l,d])=>'<button type="button" role="menuitemradio" aria-checked="'+(myStatus===v)+'" data-e="'+v+'"><i class="sd '+v+'"></i><span>'+l+(d?'<small>'+d+'</small>':'')+'</span></button>').join('')
    +'<hr><button type="button" data-e="profile">แก้ไขโปรไฟล์ อวตาร และกรอบ…</button><button type="button" data-e="pro">✦ QuietSpace Pro…</button>';
  openPop(e.currentTarget,html,'menu',v=>{if(v==='profile')setView('studio');else if(v==='pro')setView('plans');else setStatus(v)});
});
/* ไม่อยู่อัตโนมัติ: เมื่อไม่ได้ขยับเมาส์หรือพิมพ์ 5 นาที (ถ้าตั้งสถานะเป็นออนไลน์และไม่ได้อยู่ในห้องเสียง) */
let lastAct=Date.now();
function activity(){lastAct=Date.now();if(autoIdle){autoIdle=false;sendStatus();paintUserBar();renderMembersPanel()}}
['pointerdown','keydown','touchstart','wheel'].forEach(ev=>addEventListener(ev,activity,{passive:true}));
addEventListener('pointermove',()=>{if(Date.now()-lastAct>2000)activity()},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){activity();markRead(viewKey())}});
setInterval(()=>{if(myStatus==='online'&&!autoIdle&&!currentRoom&&net.ok&&Date.now()-lastAct>300000){autoIdle=true;sendStatus();paintUserBar();renderMembersPanel()}},15000);

/* ---------- แถบเซิร์ฟเวอร์ ช่อง และปุ่มต่างๆ ---------- */
$('#srvHome').addEventListener('click',()=>goServer('home'));
$('#srvList').addEventListener('click',e=>{const b=e.target.closest('[data-sid]');if(b)goServer(b.dataset.sid)});
$('#srvAdd').addEventListener('click',()=>openSrvDlg('create'));
$('#shead').addEventListener('click',()=>openSettings());
$('#chList').addEventListener('click',e=>{
  const nb=e.target.closest('[data-new]');if(nb){openChDlg(nb.dataset.new);return}
  const hb=e.target.closest('[data-home]');if(hb){setView('friends');return}
  const cx=e.target.closest('[data-chdel]');if(cx){askDelRoom(cx.dataset.chdel);return}
  const dx=e.target.closest('[data-dmx]');
  if(dx){const u=dx.dataset.dmx;send({t:'dm-close',uid:u});if(view.k==='dm'&&view.id===u)setView('friends');return}
  const dm=e.target.closest('[data-dm]');if(dm){setView('dm',dm.dataset.dm);return}
  const cd=e.target.closest('[data-card]');
  const b=e.target.closest('[data-ch]');
  if(!b){if(cd)openCard(cd,cd.dataset.card,cd.dataset.name);return}
  const id=b.dataset.ch;
  if(b.dataset.type==='text'){setView('text',id)}
  else if(currentRoom&&currentRoom.id===id){setView('voice',id)}
  else joinRoom(id);
});
$('#chList').addEventListener('contextmenu',e=>{
  const b=e.target.closest('[data-ch]');if(!b)return;
  const s=srvById(curSid),r=s&&s.channels.find(c=>c.id===b.dataset.ch);
  if(!r||!r.canDelete)return;
  e.preventDefault();
  openPop(b,'<button type="button" class="dg" data-e="del">'+IC_TRASH+'<span>ลบห้องนี้</span></button>','menu ctx',()=>askDelRoom(r.id));
});
$('#vcName').parentElement.style.cursor='pointer';
$('#vcName').parentElement.addEventListener('click',()=>{if(currentRoom)setView('voice',currentRoom.id)});
$('#gear2').addEventListener('click',()=>setView('studio'));
$('#navToggle').addEventListener('click',()=>$('#app').classList.toggle('nav-open'));
$('#scrim').addEventListener('click',()=>$('#app').classList.remove('nav-open','mem-open'));
$('#memToggle').addEventListener('click',()=>{
  const app=$('#app');
  if(matchMedia('(max-width:1180px)').matches)app.classList.toggle('mem-open');
  else{memHidden=!memHidden;app.classList.toggle('nomem',memHidden||view.k==='studio'||curSid==='home')}
});
$('#members').addEventListener('click',e=>{const c=e.target.closest('[data-card]');if(c)openCard(c,c.dataset.card,c.dataset.name)});
$('#micBtn2').addEventListener('click',()=>$('#micBtn').click());
$('#deafBtn2').addEventListener('click',()=>$('#deafBtn').click());
$('#vcLeave').addEventListener('click',()=>leaveRoom());
$('#leave').addEventListener('click',()=>leaveRoom());
$('#delCh').addEventListener('click',()=>{if(view.id)askDelRoom(view.id)});

/* สร้างช่อง */
const dlg=$('#chDlg');
const showDlg=d=>{if(d.showModal)d.showModal();else d.setAttribute('open','')};
const hideDlg=d=>{if(d.close)d.close();else d.removeAttribute('open')};
const closeDlg=()=>hideDlg(dlg);
const ctypeNow=()=>document.querySelector('input[name=ctype]:checked').value;
function syncCtype(){$('#voiceOpts').hidden=ctypeNow()!=='voice'}
function openChDlg(type){
  $('#chForm').reset();
  document.querySelector('input[name=ctype][value='+type+']').checked=true;syncCtype();
  showDlg(dlg);
  setTimeout(()=>$('#cName').focus(),30);
}
document.querySelectorAll('input[name=ctype]').forEach(r=>r.addEventListener('change',syncCtype));
$('#chCancel').addEventListener('click',closeDlg);
$('#chForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=$('#cName').value.trim();if(!name)return;
  if(!send({t:'create',sid:curSid,type:ctypeNow(),name,desc:$('#cDesc').value.trim(),mood:$('#cMood').value,cap:+$('#cCap').value})){toast('ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์ ลองใหม่อีกครั้ง');return}
  closeDlg();
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closePop();$('#app').classList.remove('nav-open','mem-open')}
});

/* สร้าง/เข้าร่วมเซิร์ฟเวอร์ */
const SRV_EMOJI=['🌱','🌿','🍃','📚','☕','🎧','🎮','🎨','🎵','🌙','⭐','🔥','🐱','🐶','🦊','🐼','🌸','🍜','💻','✏️','🚀','🏠','⚽','🎬'];
const SRV_COLOR=['#2f8f4e','#3b7f86','#4a5fa8','#7a4f9a','#d96b8a','#c58b4e','#b8452f','#5a6b63'];
const newSrv={e:'🌱',c:'#2f8f4e'};
const srvDlg=$('#srvDlg');
const pickE=(el,cur,attr)=>{el.innerHTML=SRV_EMOJI.map(x=>'<button type="button" role="radio" aria-checked="'+(cur===x)+'" '+attr+'="'+x+'" aria-label="'+x+'">'+x+'</button>').join('')};
const pickC=(el,cur,attr)=>{el.innerHTML=SRV_COLOR.map(c=>'<button type="button" role="radio" aria-checked="'+(cur===c)+'" '+attr+'="'+c+'" aria-label="'+c+'" style="background:'+c+'"></button>').join('')};
function srvTab(t){
  const cr=t==='create';
  $('#tabCreate').setAttribute('aria-selected',String(cr));$('#tabJoin').setAttribute('aria-selected',String(!cr));
  $('#srvCreate').hidden=!cr;$('#srvJoin').hidden=cr;
  if(cr){pickE($('#sEmoji'),newSrv.e,'data-e');pickC($('#sColor'),newSrv.c,'data-c')}
}
function openSrvDlg(tab,code){
  $('#srvCreate').reset();$('#srvJoin').reset();joinPrev=null;$('#jPrev').textContent='';$('#jGo').textContent='ตรวจสอบรหัส';
  srvTab(tab||'create');
  if(code){$('#jCode').value=code}
  showDlg(srvDlg);
  setTimeout(()=>(tab==='join'?$('#jCode'):$('#sName')).focus(),30);
}
$('#tabCreate').addEventListener('click',()=>srvTab('create'));
$('#tabJoin').addEventListener('click',()=>{srvTab('join');$('#jCode').focus()});
srvDlg.addEventListener('click',e=>{if(e.target.closest('[data-close]'))hideDlg(srvDlg)});
$('#sEmoji').addEventListener('click',e=>{const b=e.target.closest('[data-e]');if(!b)return;newSrv.e=b.dataset.e;pickE($('#sEmoji'),newSrv.e,'data-e')});
$('#sColor').addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;newSrv.c=b.dataset.c;pickC($('#sColor'),newSrv.c,'data-c')});
$('#srvCreate').addEventListener('submit',e=>{
  e.preventDefault();
  const name=$('#sName').value.trim();if(!name)return;
  if(!send({t:'mk-server',name,icon:{e:newSrv.e,c:newSrv.c}}))toast('ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์ ลองใหม่อีกครั้ง');
});
function parseInvite(v){
  v=String(v||'').trim();
  const m=v.match(/[?&]invite=([A-Za-z0-9]+)/);
  return (m?m[1]:v).replace(/[^A-Za-z0-9]/g,'').toUpperCase();
}
$('#jCode').addEventListener('input',()=>{joinPrev=null;$('#jPrev').textContent='';$('#jGo').textContent='ตรวจสอบรหัส'});
$('#srvJoin').addEventListener('submit',e=>{
  e.preventDefault();
  const code=parseInvite($('#jCode').value);if(!code)return;
  if(joinPrev&&joinPrev.id&&joinPrev.code===code){
    if(joinPrev.member){hideDlg(srvDlg);goServer(joinPrev.id)}else send({t:'join-server',code});
    return;
  }
  if(!send({t:'invite-info',code}))toast('ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์ ลองใหม่อีกครั้ง');
  else{$('#jPrev').textContent='กำลังตรวจสอบ…';setTimeout(()=>{if($('#jPrev').textContent==='กำลังตรวจสอบ…')$('#jPrev').textContent='ยังไม่ได้รับคำตอบ ลองกดอีกครั้ง'},2500)}
});
function showInvite(m){
  joinPrev=m;
  if(m.bad){$('#jPrev').innerHTML='<span style="color:var(--warn)">ไม่พบเซิร์ฟเวอร์จากรหัสนี้ ตรวจรหัสหรือขอลิงก์ใหม่จากเพื่อน</span>';$('#jGo').textContent='ตรวจสอบรหัส';return}
  $('#jPrev').innerHTML='<div class="jcard"><span class="srv" style="background:'+esc(m.icon.c)+'" aria-hidden="true">'+esc(m.icon.e)+'</span><div><b>'+esc(m.name)+'</b><span>'+m.n+' สมาชิก'+(m.member?' · คุณอยู่ในเซิร์ฟเวอร์นี้แล้ว':'')+'</span></div></div>';
  $('#jGo').textContent=m.member?'ไปที่เซิร์ฟเวอร์':'เข้าร่วมเซิร์ฟเวอร์';
}

/* เชิญเพื่อน / ตั้งค่าเซิร์ฟเวอร์ */
const setDlgEl=$('#setDlg'),edit={e:'🌱',c:'#2f8f4e'};
let setArm='';
function openSettings(){
  const s=srvById(curSid);if(!s)return;
  edit.e=s.icon.e;edit.c=s.icon.c;setArm='';
  const link=location.protocol==='file:'?'':location.origin+'/?invite='+s.code;
  let h='<h2 id="setDlgT">'+esc(s.icon.e)+' '+esc(s.name)+'</h2>';
  h+='<div class="sect"><h3>เชิญเพื่อนเข้าเซิร์ฟเวอร์นี้</h3>'+(s.code
    ?(link?'<div class="linkbox"><input type="text" readonly value="'+esc(link)+'" aria-label="ลิงก์เชิญ"><button class="btn ghost sm" data-s="copylink">คัดลอกลิงก์</button></div>':'')
      +'<div class="linkbox"><input type="text" readonly value="'+esc(s.code)+'" aria-label="รหัสเชิญ"><button class="btn ghost sm" data-s="copycode">คัดลอกรหัส</button></div><p class="hint">ใครมีลิงก์หรือรหัสนี้เข้าร่วมได้ ถ้าไม่ต้องการแล้วให้สร้างรหัสใหม่ (รหัสเก่าจะใช้ไม่ได้)</p>'
    :'<p class="hint">มีเพียงเจ้าของเซิร์ฟเวอร์ที่เห็นรหัสเชิญ ขอรหัสจากเจ้าของได้</p>')+'</div>';
  h+='<div class="sect"><h3>ข้อมูล</h3><p class="hint">สมาชิก '+s.n+' คน · '+s.channels.filter(c=>c.type==='text').length+' ช่องข้อความ · '+s.channels.filter(c=>c.type==='voice').length+' ช่องเสียง'+(s.main?' · ชุมชนกลางของ QuietSpace':'')+'</p></div>';
  if(s.mine&&!s.main){
    h+='<div class="sect"><h3>แก้ไขเซิร์ฟเวอร์</h3><label for="setName">ชื่อ<input type="text" id="setName" maxlength="30" value="'+esc(s.name)+'"></label>'
      +'<div class="emojigrid" id="setEmoji" role="radiogroup" aria-label="ไอคอน"></div><div class="sw" id="setColor" role="radiogroup" aria-label="สีไอคอน"></div>'
      +'<div class="row"><button class="btn sm" data-s="save">บันทึก</button><button class="btn ghost sm" data-s="regen">สร้างรหัสเชิญใหม่</button></div></div>';
    h+='<div class="sect"><h3>เขตอันตราย</h3><div class="row"><button class="btn ghost sm" data-s="del">ลบเซิร์ฟเวอร์นี้</button></div><p class="hint">ลบแล้วช่องและข้อความทั้งหมดหายถาวร</p></div>';
  }else{
    h+='<div class="sect"><div class="row"><button class="btn ghost sm" data-s="leave">ออกจากเซิร์ฟเวอร์นี้</button></div></div>';
  }
  h+='<div class="row end"><button class="btn ghost" data-s="close">ปิด</button></div>';
  $('#setBody').innerHTML=h;
  if($('#setEmoji')){pickE($('#setEmoji'),edit.e,'data-pe');pickC($('#setColor'),edit.c,'data-pc')}
  showDlg(setDlgEl);
}
$('#setBody').addEventListener('click',e=>{
  const pe=e.target.closest('[data-pe]');
  if(pe){edit.e=pe.dataset.pe;pickE($('#setEmoji'),edit.e,'data-pe');return}
  const pc=e.target.closest('[data-pc]');
  if(pc){edit.c=pc.dataset.pc;pickC($('#setColor'),edit.c,'data-pc');return}
  const b=e.target.closest('[data-s]');if(!b)return;
  const s=srvById(curSid),a=b.dataset.s;if(!s)return;
  if(a==='close'){hideDlg(setDlgEl);return}
  if(a==='copylink'){copyText(location.origin+'/?invite='+s.code,'คัดลอกลิงก์เชิญแล้ว');return}
  if(a==='copycode'){copyText(s.code,'คัดลอกรหัสเชิญแล้ว');return}
  if(a==='save'){send({t:'edit-server',sid:s.id,name:$('#setName').value,icon:{e:edit.e,c:edit.c}});toast('บันทึกแล้ว');return}
  if(a==='regen'||a==='del'||a==='leave'){
    if(setArm!==a){setArm=a;b.textContent=a==='regen'?'ยืนยัน: รหัสเก่าจะใช้ไม่ได้':a==='del'?'ยืนยันลบถาวร?':'ยืนยันออก?';b.classList.add('danger');return}
    setArm='';
    if(a==='regen'){send({t:'regen-invite',sid:s.id});hideDlg(setDlgEl);toast('สร้างรหัสเชิญใหม่แล้ว')}
    else if(a==='del'){send({t:'del-server',sid:s.id});hideDlg(setDlgEl)}
    else{send({t:'leave-server',sid:s.id});hideDlg(setDlgEl)}
  }
});

/* ---------- สตูดิโออวตาร ---------- */
let draft=null;
function swatches(el,key,list){
  el.innerHTML=list.map(c=>'<button type="button" role="radio" aria-checked="'+(draft[key]===c)+'" aria-label="'+c+'" data-v="'+c+'" style="background:'+c+'"></button>').join('');
}
function segs(el,key,list){
  el.innerHTML=list.map(([v,l,p])=>'<button type="button" role="radio"'+(p?' class="pro"':'')+' aria-checked="'+(String(draft[key])===String(v))+'" data-v="'+v+'">'+l+(p?'<i class="pt">PRO</i>':'')+'</button>').join('');
}
function paintPic(){
  const cur=draft.pic||'';
  $('#picGrid').innerHTML='<button type="button" role="radio" class="pnone" aria-checked="'+(cur===''?'true':'false')+'" data-pic="" aria-label="ไม่ใช้รูป">ไม่ใช้</button>'
    +PRESET_PICS.map(d=>'<button type="button" role="radio" aria-checked="'+(cur==='p:'+d[0])+'" data-pic="p:'+d[0]+'" aria-label="'+d[1]+'" title="'+d[1]+'">'+picHTML('p:'+d[0],'pimg')+'</button>').join('');
  const up=cur.slice(0,5)==='data:';
  $('#picPrev').innerHTML=picSrc(cur)?picHTML(cur,'pbig'):'<span class="muted">ยังไม่มีรูป</span>';
  $('#picUp').textContent=up?'เปลี่ยนรูปที่อัปโหลด':'อัปโหลดรูปของฉัน';
}
function paintStudio(){
  paintPic();
  swatches($('#swSkin'),'skin',PAL.skin);swatches($('#swShirt'),'shirt',PAL.shirt);swatches($('#swHair'),'hair',PAL.hair);
  swatches($('#swTrim'),'trim',PAL.trim);segs($('#segStyle'),'style',STYLES);segs($('#segOutfit'),'outfit',OUTFITS);segs($('#segAcc'),'acc',ACCS);
  segs($('#segHat'),'hat',HATS);segs($('#segGlasses'),'glasses',[[false,'ไม่ใส่'],[true,'ใส่แว่น']]);
  paintFrames();paintAdv();paintGlb();paintProNote();
  studioStage.setPeople([{name:draft.name||'ฉัน',cfg:studioCfg(),me:true,pro:meX.pro}]);
}
function paintFrames(){
  $('#frameGrid').innerHTML=FRAMES.map(([id,l,p])=>'<button type="button" role="radio" aria-checked="'+((draft.frame||'none')===id)+'" data-fr="'+id+'" aria-label="กรอบ'+l+(p?' (Pro)':'')+'">'
    +avatarHTML({raw:true,name:draft.name||'ฉัน',shirt:draft.shirt,pic:draft.pic,frame:id})+'<span>'+l+'</span>'+(p?'<i class="pt">PRO</i>':'')+'</button>').join('');
}
function openStudio(){
  draft=Object.assign({},profile);
  draft.adv=profile.adv?Object.assign({},profile.adv):null;
  if(!studioStage)studioStage=new Stage($('#studioStage'),'studio');
  $('#pName').value=draft.name;
  $('#myCode').textContent=me.code||'------';$('#adminNote').hidden=!meX.admin;
  paintStudio();paintTheme();studioStage.start();
}
[['#swSkin','skin'],['#swShirt','shirt'],['#swHair','hair'],['#swTrim','trim'],['#segStyle','style'],['#segOutfit','outfit'],['#segAcc','acc'],['#segHat','hat'],['#segGlasses','glasses']].forEach(([sel,key])=>{
  $(sel).addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    draft[key]=key==='glasses'?b.dataset.v==='true':b.dataset.v;paintStudio();
  });
});
$('#frameGrid').addEventListener('click',e=>{
  const b=e.target.closest('button[data-fr]');if(!b)return;
  draft.frame=b.dataset.fr;paintStudio();
});
$('#copyCode').addEventListener('click',()=>{if(me.code)copyText(me.code,'คัดลอกรหัสเพื่อนแล้ว')});
$('#copyKey').addEventListener('click',()=>copyText(cid,'คัดลอกรหัสกู้คืนแล้ว เก็บไว้ในที่ปลอดภัย อย่าส่งให้ใคร'));
let restoreArm=false;
$('#restoreBtn').addEventListener('click',()=>{
  const v=($('#restoreKey').value||'').trim();
  if(!/^[A-Za-z0-9_-]{12,64}$/.test(v)){toast('รหัสกู้คืนไม่ถูกต้อง ตรวจว่าคัดลอกมาครบ');return}
  if(v===cid){toast('นี่คือบัญชีที่ใช้อยู่แล้ว');return}
  const b=$('#restoreBtn');
  if(!restoreArm){restoreArm=true;b.textContent='ยืนยัน: บัญชีบนเครื่องนี้จะถูกแทนที่';b.classList.add('danger');setTimeout(()=>{restoreArm=false;b.textContent='กู้คืนบัญชีนี้บนเครื่องนี้';b.classList.remove('danger')},6000);return}
  store.set('qs.cid',v);['qs.profile','qs.read','qs.sid','qs.lastCh2','qs.rdtrack','qs.readstats'].forEach(k=>store.del(k));
  location.reload();
});
$('#picGrid').addEventListener('click',e=>{
  const b=e.target.closest('button[data-pic]');if(!b)return;
  draft.pic=b.dataset.pic;paintStudio();
});
$('#picUp').addEventListener('click',()=>$('#picFile').click());
$('#picFile').addEventListener('change',e=>{
  const f=(e.target.files||[])[0];e.target.value='';if(!f)return;
  if(!/^image\//.test(f.type)){toast('เลือกไฟล์รูปภาพเท่านั้น');return}
  if(f.size>15*1024*1024){toast('ไฟล์ใหญ่เกิน 15 MB');return}
  const url=URL.createObjectURL(f),im=new Image();
  im.onload=()=>{
    try{
      const S=96,c=document.createElement('canvas');c.width=c.height=S;
      const x=c.getContext('2d'),m=Math.min(im.naturalWidth,im.naturalHeight);
      x.fillStyle='#fff';x.fillRect(0,0,S,S);
      x.drawImage(im,(im.naturalWidth-m)/2,(im.naturalHeight-m)/2,m,m,0,0,S,S);
      let out=c.toDataURL('image/jpeg',.82);
      if(out.length>13500)out=c.toDataURL('image/jpeg',.6);
      if(out.length>13500)throw new Error('big');
      draft.pic=out;paintStudio();
    }catch(_){toast('ย่อรูปนี้ไม่ได้ ลองรูปอื่น')}
    URL.revokeObjectURL(url);
  };
  im.onerror=()=>{URL.revokeObjectURL(url);toast('เปิดรูปนี้ไม่ได้ ลองรูปอื่น (JPG หรือ PNG)')};
  im.src=url;
});
$('#randLook').addEventListener('click',()=>{
  const pick=a=>a[Math.floor(Math.random()*a.length)],pk=l=>pick(l.filter(x=>meX.pro||!x[2]))[0];
  draft.skin=pick(PAL.skin);draft.shirt=pick(PAL.shirt);draft.hair=pick(PAL.hair);draft.trim=pick(PAL.trim);
  draft.style=pk(STYLES);draft.outfit=pk(OUTFITS);draft.acc=pk(ACCS);draft.hat=pk(HATS);draft.glasses=Math.random()<.3;
  paintStudio();
});
$('#pName').addEventListener('input',e=>{draft.name=e.target.value;studioStage.setPeople([{name:draft.name||'ฉัน',cfg:studioCfg(),me:true,pro:meX.pro}])});
$('#saveAvatar').addEventListener('click',()=>{
  draft.name=($('#pName').value||'').trim()||DEFAULT.name;
  profile=Object.assign({},draft);store.set('qs.profile',profile);send({t:'profile',name:profile.name,cfg:cfgOf(profile)});toast('บันทึกอวตารแล้ว');
  paintUserBar();refreshRoom(true);repaintChats();renderChannels();renderMembersPanel();
  const pk=meX.pro?[]:proPicks(profile);
  if(pk.length)openAsk('บันทึกแล้ว แต่ของ Pro ยังไม่แสดงให้คนอื่นเห็น','คุณเลือกของ Pro ไว้: <b>'+esc(pk.join(' · '))+'</b><br>ระบบเก็บค่าที่เลือกไว้ให้ และจะแสดงทันทีเมื่อคุณสมัคร Pro ตอนนี้คนอื่นจะเห็นอวตารเวอร์ชันที่ไม่มีของ Pro',[['close','ปิด'],['plans','ดูแพ็กเกจ Pro','gold']]);
});
const THEMES=[['auto','อัตโนมัติ'],['light','สว่าง'],['dark','มืด']];
function paintTheme(){
  const cur=store.get('qs.theme','auto');
  $('#segTheme').innerHTML=THEMES.map(([v,l])=>'<button type="button" role="radio" aria-checked="'+(cur===v)+'" data-v="'+v+'">'+l+'</button>').join('');
}
$('#segTheme').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  store.set('qs.theme',b.dataset.v);
  if(b.dataset.v==='auto')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=b.dataset.v;
  paintTheme();
});

/* ---------- ห้องเสียง ---------- */
function allMembers(){
  return roomMembers.map(p=>Object.assign({},p)).concat([{id:myPeerId||'me',name:profile.name,cfg:ownCfg(),pro:meX.pro,me:true,cam:!!stream,mic:!!micStream,scr:!!scrStream,rd:RD?rdShare(Date.now()):0}]);
}
function renderMembers(){/* รายชื่ออยู่ในแถบซ้ายและแถบขวาแล้ว อัปเดตเมื่อเซิร์ฟเวอร์แจ้งสถานะ */}
function refreshRoom(force){
  if(!currentRoom||!roomStage)return;
  const ms=allMembers();
  const sig=JSON.stringify(ms.map(m=>[m.id,m.name,m.cfg]));
  if(force||sig!==lastSig){lastSig=sig;roomStage.setPeople(ms)}
}
function enterRoomUI(){
  if(lastVoice!==currentRoom.id){lastVoice=currentRoom.id;rdAutoStart()}
  setView('voice',currentRoom.id);
  closeAllPeers();
  roomMembers.forEach(p=>callPeer(p.id));
  sendState();
}
function leaveRoom(noNav){
  stopCam();stopMic();stopAllSnd();if(deaf)setDeaf(false);
  if(scrStream)stopScreen();
  closeAllPeers();send({t:'leave'});
  currentRoom=null;roomMembers=[];lastSig='';lastVoice='';speaking.clear();
  if(view.k==='voice'&&!noNav)goServer(curSid);
  else{paintUserBar();renderChannels()}
}

/* ---------- แชต (ใช้ร่วมกันทั้งช่องข้อความและแชตในห้องเสียง) ---------- */
const REACTS=['👍','❤️','😂','😮','😢','🎉','🔥','👀','🌱','☕'];
const EMOJIS='😀 😁 😂 🤣 😊 😍 🥰 😘 😎 🤔 😅 😭 😢 😮 😴 🙄 😡 🥳 🤩 🙃 😌 🫶 👍 👎 👏 🙏 💪 👀 🔥 ✨ 🎉 ❤️ 💚 🌱 🌿 🍃 ☕ 🍵 📚 ✏️ 💻 🎧 🎵 🌧️ 🌙 ⭐ 🌸 🐱 🐶 🍀 💤 🍰 🍜 🥤 ✅ ❓'.split(' ');
const IC={clip:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l9-9a3.7 3.7 0 0 1 5.2 5.2l-9 9a1.8 1.8 0 0 1-2.6-2.6l8.2-8.2"/></svg>',
  reply:'<svg class="i" viewBox="0 0 24 24"><path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 6 6v3"/></svg>',
  edit:'<svg class="i" viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
  del:'<svg class="i" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  send:'<svg class="i" viewBox="0 0 24 24"><path d="M21 3 3 10l7 3 3 7zM10 13l11-10"/></svg>'
};
const editState={cur:null};
let forceStick=false,armMsg=null,armT=0,popHandler=null;
const replyTo={t:null,v:null,d:null};
const roomOf=p=>p==='t'?curText:p==='d'?(curDm?'d:'+curDm:''):(currentRoom&&currentRoom.id);

function rich(s){
  let h=esc(s);
  h=h.replace(/`([^`\n]+)`/g,'<code>$1</code>');
  h=h.replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<i>$2</i>').replace(/~~([^~\n]+)~~/g,'<s>$1</s>');
  h=h.replace(/(https?:\/\/[^\s<]+)/g,u=>'<a href="'+u+'" target="_blank" rel="noopener noreferrer nofollow">'+u+'</a>');
  h=h.replace(/(^|\s)(@[^\s@<]{1,20})/g,'$1<span class="mention">$2</span>');
  return h.replace(/\n/g,'<br>');
}
const mentionsMe=t=>!!profile.name&&String(t).toLowerCase().includes('@'+profile.name.toLowerCase());
const hhmm=ts=>new Date(ts).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});
function dayLabel(ts){
  const d=new Date(ts),n=new Date(),y=new Date(Date.now()-864e5);
  const same=(a,b)=>a.toDateString()===b.toDateString();
  return same(d,n)?'วันนี้':same(d,y)?'เมื่อวาน':d.toLocaleDateString('th-TH',{day:'numeric',month:'long',year:'numeric'});
}
function chatBoxHTML(p){
  return '<div class="upbar" id="'+p+'Up"></div><input type="file" id="'+p+'File" hidden>'
    +'<div class="replybar" id="'+p+'Reply" hidden><span></span><button type="button" class="icb" data-x aria-label="ยกเลิกการตอบกลับ">×</button></div>'
    +'<div class="inbox"><button type="button" class="icb" id="'+p+'Att" aria-label="แนบไฟล์" title="แนบไฟล์ (หรือลากไฟล์มาวาง)">'+IC.clip+'</button><textarea id="'+p+'In" rows="1" maxlength="1000" aria-label="พิมพ์ข้อความ" placeholder="พิมพ์ข้อความ…"></textarea>'
    +'<button type="button" class="icb" id="'+p+'Emo" data-emo aria-label="เลือกอีโมจิ">😊</button>'
    +'<button type="button" class="icb" id="'+p+'Send" aria-label="ส่งข้อความ">'+IC.send+'</button></div>'
    +'<div class="typing" id="'+p+'Typing" aria-live="polite"></div>';
}
function msgHTML(p,rid,m,first){
  const mine=!!m.uid&&m.uid===me.uid,can=mine||modOf(rid),ca=m.uid?' data-card="'+esc(m.uid)+'" data-name="'+esc(m.name)+'"':'';
  const editing=editState.cur&&editState.cur.id===m.id&&editState.cur.p===p;
  const ment=!mine&&mentionsMe(m.text);
  let h='<div class="m'+(first?' first':'')+(ment?' ment':'')+(editing?' editing':'')+'" data-id="'+esc(m.id)+'">';
  if(m.reply)h+='<div class="rp" style="grid-column:2;grid-row:1">'+IC.reply+'<span><b>@'+esc(m.reply.name)+'</b> '+esc(m.reply.snip)+'</span></div>';
  h+='<div class="gut" style="grid-row:2">'+(first?avatarHTML({uid:m.uid,name:m.name,shirt:m.s,pic:m.p,frame:m.f},'av',ca):'<time>'+esc(hhmm(m.ts))+'</time>')+'</div><div class="bd" style="grid-row:2">';
  if(first)h+='<div class="hd"><b'+ca+'>'+esc(m.name)+'</b>'+(m.pro?'<i class="pb" title="สมาชิก QuietSpace Pro">✦</i>':'')+'<time>'+esc(dayLabel(m.ts)+' '+hhmm(m.ts))+'</time></div>';
  if(editing)h+='<textarea class="editbox" data-edit maxlength="1000" aria-label="แก้ไขข้อความ">'+esc(m.text)+'</textarea><div class="edhint">กด Enter เพื่อบันทึก Esc เพื่อยกเลิก</div>';
  else{
    if(m.text||!m.file)h+='<div class="tx">'+rich(m.text)+(m.edited?'<span class="ed">(แก้ไขแล้ว)</span>':'')+'</div>';
    if(m.file)h+=attHTML(m.file);
  }
  const rx=m.react?Object.keys(m.react):[];
  if(rx.length)h+='<div class="rxs">'+rx.map(e=>'<button type="button" class="rx'+(m.react[e].includes(me.uid)?' me':'')+'" data-rx="'+e+'" aria-label="รีแอคชัน '+e+' '+m.react[e].length+' คน">'+e+' <b>'+m.react[e].length+'</b></button>').join('')+'</div>';
  h+='</div>';
  if(!editing)h+='<div class="tools">'
    +'<button type="button" data-act="react" aria-label="ใส่รีแอคชัน">😊</button>'
    +'<button type="button" data-act="reply" aria-label="ตอบกลับ">'+IC.reply+'</button>'
    +(mine?'<button type="button" data-act="edit" aria-label="แก้ไขข้อความ">'+IC.edit+'</button>':'')
    +(can?'<button type="button" class="del" data-act="del" aria-label="ลบข้อความ"'+(armMsg===m.id?' style="width:auto;padding:0 8px;color:var(--warn);font-size:13px">ลบ?':'>'+IC.del)+'</button>':'')
    +'</div>';
  return h+'</div>';
}
function renderChat(p){
  const list=$('#'+p+'List'),rid=roomOf(p);
  if(!list||!rid)return;
  if(pend[p]&&pend[p].room!==rid)clearPend(p);
  const arr=msgs[rid],r=chanById(rid),dp=p==='d'?personOf(rid.slice(2)):null;
  const tin=$('#'+p+'In');
  if(tin)tin.placeholder=dp?'ส่งข้อความถึง @'+dp.name:r?'ส่งข้อความถึง '+(r.type==='text'?'#':'')+r.name:'พิมพ์ข้อความ…';
  const stick=forceStick||list.dataset.rid!==rid||list.scrollHeight-list.scrollTop-list.clientHeight<140;
  const top=list.scrollTop;list.dataset.rid=rid;
  let h='';
  if(!arr)h='<p class="mhello muted">กำลังโหลดข้อความ…</p>';
  else{
    if(p==='t')h+='<div class="mhello"><h3>ยินดีต้อนรับสู่ '+(r?'# '+esc(r.name):'ช่องนี้')+'</h3><p>'+esc((r&&r.desc)||'นี่คือจุดเริ่มต้นของช่อง')+'</p></div>';
    else if(p==='d')h+='<div class="mhello"><h3>@ '+esc(dp?dp.name:'ผู้ใช้')+'</h3><p>นี่คือจุดเริ่มต้นของแชตส่วนตัวระหว่างคุณกับ '+esc(dp?dp.name:'เขา')+'</p></div>';
    else if(!arr.length)h+='<p class="mhello muted" style="padding:14px 12px">ยังไม่มีข้อความ ห้องนี้เงียบอยู่ ซึ่งก็ดีแล้ว</p>';
    let prev=null;
    arr.forEach(m=>{
      const day=new Date(m.ts).toDateString();
      if(!prev||prev.day!==day)h+='<div class="dayd">'+esc(dayLabel(m.ts))+'</div>';
      const first=!prev||prev.day!==day||!m.uid||prev.uid!==m.uid||m.ts-prev.ts>300000||!!m.reply;
      h+=msgHTML(p,rid,m,first);prev={day,uid:m.uid,ts:m.ts};
    });
  }
  list.innerHTML=h;
  list.scrollTop=stick?list.scrollHeight:top;
  const eb=list.querySelector('[data-edit]');if(eb){eb.focus();eb.setSelectionRange(eb.value.length,eb.value.length)}
  paintTyping();
}
function redrawChat(rid){['t','v','d'].forEach(p=>{if(roomOf(p)===rid)renderChat(p)});forceStick=false}

function loadHistory(id){ if(id&&!msgs[id])send({t:'view',room:id}); }
function startReply(p,rid,id){
  const m=(msgs[rid]||[]).find(x=>x.id===id);if(!m)return;
  replyTo[p]={id,name:m.name};
  const bar=$('#'+p+'Reply');bar.hidden=false;
  bar.firstChild.innerHTML='ตอบกลับ <b>'+esc(m.name)+'</b>: '+esc(String(m.text||(m.file?'📎 '+m.file.name:'')).replace(/\s+/g,' ').slice(0,60));
  $('#'+p+'In').focus();
}
function clearReply(p){replyTo[p]=null;$('#'+p+'Reply').hidden=true}
function submitChat(p){
  const ta=$('#'+p+'In'),rid=roomOf(p),text=ta.value.trim(),pf=pend[p];
  if(!rid)return;
  if(pf&&pf.state==='up'){pf.sendWhenReady=true;toast('กำลังอัปโหลดไฟล์ จะส่งให้อัตโนมัติเมื่อเสร็จ');return}
  const withFile=!!(pf&&pf.state==='ready');
  if(!text&&!withFile)return;
  const o={t:'msg',room:rid,text};if(replyTo[p])o.reply=replyTo[p].id;
  if(withFile)o.file=pf.fid;
  if(!send(o)){toast('ส่งไม่ได้ ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์');return}
  ta.value='';ta.style.height='auto';clearReply(p);forceStick=true;
  if(pf)clearPend(p,withFile);
}

/* ป๊อปอัป: อีโมจิและรีแอคชัน */
function openPop(anchor,html,cls,handler){
  const pop=$('#pop');pop.className='pop '+cls;pop.innerHTML=html;pop.hidden=false;
  pop.style.left='0px';pop.style.top='0px';
  const r=anchor.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;
  let x=Math.min(innerWidth-w-8,Math.max(8,r.right-w)),y=r.top-h-6;if(y<8)y=r.bottom+6;
  pop.style.left=x+'px';pop.style.top=y+'px';popHandler=handler;
}
function closePop(){const pop=$('#pop');if(pop){pop.hidden=true;popHandler=null}}
$('#pop').addEventListener('click',e=>{const b=e.target.closest('button[data-e]');if(b&&popHandler){const f=popHandler;closePop();f(b.dataset.e)}});
document.addEventListener('click',e=>{if(!$('#pop').hidden&&!e.target.closest('#pop')&&!e.target.closest('[data-act=react],[data-emo]'))closePop()},true);

function bindChat(p){
  const list=$('#'+p+'List'),ta=$('#'+p+'In');
  list.addEventListener('click',e=>{
    const lb=e.target.closest('[data-lb]');
    if(lb){e.preventDefault();openLightbox(lb.dataset.lb);return}
    const cd=e.target.closest('[data-card]');
    if(cd&&!e.target.closest('.tools,.rxs,textarea')){openCard(cd,cd.dataset.card,cd.dataset.name);return}
    const row=e.target.closest('.m');if(!row)return;
    const id=row.dataset.id,rid=roomOf(p);
    const tb=e.target.closest('[data-act]');
    if(tb){
      const a=tb.dataset.act;
      if(a==='reply')startReply(p,rid,id);
      else if(a==='edit'){editState.cur={p,id};renderChat(p)}
      else if(a==='del'){
        if(armMsg===id){armMsg=null;send({t:'del',room:rid,id})}
        else{armMsg=id;renderChat(p);clearTimeout(armT);armT=setTimeout(()=>{armMsg=null;renderChat(p)},3000)}
      }else if(a==='react')openPop(tb,REACTS.map(x=>'<button type="button" data-e="'+x+'">'+x+'</button>').join(''),'rxp',em=>send({t:'react',room:rid,id,emoji:em}));
      return;
    }
    const rx=e.target.closest('[data-rx]');if(rx){send({t:'react',room:rid,id,emoji:rx.dataset.rx});return}
    if(e.target.closest('a,textarea,button'))return;
    row.classList.toggle('sel');
  });
  list.addEventListener('keydown',e=>{
    const eb=e.target.closest('[data-edit]');if(!eb)return;
    const id=editState.cur&&editState.cur.id,rid=roomOf(p);
    if(e.key==='Escape'){editState.cur=null;renderChat(p)}
    else if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){
      e.preventDefault();
      const text=eb.value.trim(),old=(msgs[rid]||[]).find(x=>x.id===id);
      editState.cur=null;
      if(text&&old&&text!==old.text)send({t:'edit',room:rid,id,text});else renderChat(p);
    }
  });
  const grow=()=>{ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,160)+'px'};
  let lastTy=0;
  ta.addEventListener('input',()=>{
    grow();
    if(ta.value.trim()&&Date.now()-lastTy>2000){lastTy=Date.now();const rid=roomOf(p);if(rid)send({t:'typing',room:rid})}
  });
  ta.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();submitChat(p)}
    else if(e.key==='Escape'&&replyTo[p])clearReply(p);
  });
  $('#'+p+'Send').addEventListener('click',()=>submitChat(p));
  const fi=$('#'+p+'File'),comp=$('#'+p+'Comp');
  $('#'+p+'Att').addEventListener('click',()=>fi.click());
  fi.addEventListener('change',e=>{const f=(e.target.files||[])[0];e.target.value='';if(f)attachFile(p,f)});
  $('#'+p+'Up').addEventListener('click',e=>{if(e.target.closest('[data-x]'))clearPend(p)});
  ta.addEventListener('paste',e=>{const fs=e.clipboardData&&e.clipboardData.files;if(fs&&fs.length){e.preventDefault();attachFile(p,fs[0])}});
  list.addEventListener('error',e=>{
    const im=e.target,a=im&&im.tagName==='IMG'&&im.closest('.att.img');
    if(a)a.outerHTML='<div class="attname">⚠ ไม่พบรูปนี้ (ไฟล์อาจถูกลบหรือหมดอายุ)</div>';
  },true);
  [list,comp].forEach(z=>{
    if(!z)return;
    const has=e=>e.dataTransfer&&[...(e.dataTransfer.types||[])].includes('Files');
    z.addEventListener('dragover',e=>{if(has(e)){e.preventDefault();z.classList.add('dragover')}});
    z.addEventListener('dragleave',e=>{if(!z.contains(e.relatedTarget))z.classList.remove('dragover')});
    z.addEventListener('drop',e=>{
      if(!has(e))return;
      e.preventDefault();z.classList.remove('dragover');
      const f=e.dataTransfer.files&&e.dataTransfer.files[0];if(f)attachFile(p,f);
    });
  });
  $('#'+p+'Reply').addEventListener('click',e=>{if(e.target.closest('[data-x]'))clearReply(p)});
  $('#'+p+'Emo').addEventListener('click',e=>{
    openPop(e.currentTarget,EMOJIS.map(x=>'<button type="button" data-e="'+x+'">'+x+'</button>').join(''),'emo',em=>{
      const a=ta.selectionStart==null?ta.value.length:ta.selectionStart,b=ta.selectionEnd==null?a:ta.selectionEnd;
      ta.value=ta.value.slice(0,a)+em+ta.value.slice(b);ta.focus();ta.setSelectionRange(a+em.length,a+em.length);grow();
    });
  });
}
function paintTyping(){
  const now=Date.now();
  ['t','v','d'].forEach(p=>{
    const el=$('#'+p+'Typing'),rid=roomOf(p);if(!el)return;
    const t=typers[rid],names=[];
    if(t)t.forEach((v,k)=>{if(now-v.at>4500)t.delete(k);else names.push(v.name)});
    el.textContent=!names.length?'':names.length===1?names[0]+' กำลังพิมพ์…':names.length===2?names.join(' และ ')+' กำลังพิมพ์…':'หลายคนกำลังพิมพ์…';
  });
}
setInterval(paintTyping,1000);

/* ---------- ตรวจจับคนกำลังพูด (วงไฟเขียวรอบรูป) ---------- */
let spkCtx=null,micAn=null;
const spk=new Map();
function peak(an,buf){an.getByteTimeDomainData(buf);let m=0;for(let i=0;i<buf.length;i++)m=Math.max(m,Math.abs(buf[i]-128));return m/128}
setInterval(()=>{
  if(!currentRoom){if(speaking.size){speaking.clear();paintSpeaking()}return}
  const now=new Set();
  pcs.forEach((p,id)=>{
    let s=spk.get(id);
    if(!s&&p.media.getAudioTracks().length){
      try{
        if(!spkCtx)spkCtx=new (window.AudioContext||window.webkitAudioContext)();
        if(spkCtx.state==='suspended')spkCtx.resume();
        const an=spkCtx.createAnalyser();an.fftSize=512;
        const src=spkCtx.createMediaStreamSource(p.media);src.connect(an);
        s={an,src,buf:new Uint8Array(512)};spk.set(id,s);
      }catch(_){}
    }
    if(s&&peak(s.an,s.buf)>.06)now.add(id);
  });
  if(micAn&&micStream&&myPeerId){if(peak(micAn,new Uint8Array(512))>.08)now.add(myPeerId)}
  const same=now.size===speaking.size&&[...now].every(x=>speaking.has(x));
  if(!same){speaking.clear();now.forEach(x=>speaking.add(x));paintSpeaking()}
},150);

/* กล้อง */
let stream=null;
async function startCam(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    $('#camMsg').textContent='เบราว์เซอร์นี้ไม่รองรับกล้อง';return;
  }
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
    const v=$('#cam');v.srcObject=stream;v.hidden=false;$('#camMsg').hidden=true;
    btnUI('#camBtn',true,'cam','กล้อง',true);
    applyLocal();sendState();renderMembers();
  }catch(err){
    stream=null;
    $('#camMsg').hidden=false;
    $('#camMsg').textContent=err&&err.name==='NotAllowedError'
      ?'ยังไม่ได้อนุญาตให้ใช้กล้อง กดไอคอนกล้องที่แถบที่อยู่แล้วเลือกอนุญาต'
      :'เปิดกล้องไม่ได้ เว็บต้องเปิดผ่าน https หรือ localhost และต้องมีกล้องที่ว่างอยู่';
  }
}
function stopCam(){
  if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
  const v=$('#cam');v.srcObject=null;v.hidden=true;
  $('#camMsg').hidden=false;$('#camMsg').textContent='กล้องปิดอยู่ คนอื่นเห็นแค่อวตารของคุณ';
  btnUI('#camBtn',false,'cam','กล้อง',false);
  applyLocal();sendState();renderMembers();
}
$('#camBtn').addEventListener('click',()=>stream?stopCam():startCam());

/* ไมค์ */
let micStream=null,micCtx=null,micRaf=0;
async function startMic(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    $('#micState').textContent='เบราว์เซอร์นี้ไม่รองรับไมค์';return;
  }
  try{
    micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
    const AC=window.AudioContext||window.webkitAudioContext;
    micCtx=new AC();
    const an=micCtx.createAnalyser();an.fftSize=512;micAn=an;
    micCtx.createMediaStreamSource(micStream).connect(an);
    const buf=new Uint8Array(an.fftSize);
    const draw=()=>{
      an.getByteTimeDomainData(buf);
      let peak=0;for(let i=0;i<buf.length;i++){peak=Math.max(peak,Math.abs(buf[i]-128))}
      $('#micLevel').style.width=Math.min(100,peak/128*220)+'%';
      micRaf=requestAnimationFrame(draw);
    };
    draw();
    $('#micState').textContent='ไมค์เปิดอยู่';$('#micRow').classList.add('on');
    btnUI('#micBtn',true,'mic','ไมค์',true);
    applyLocal();sendState();renderMembers();
  }catch(err){
    micStream=null;
    $('#micState').textContent=err&&err.name==='NotAllowedError'
      ?'ยังไม่ได้อนุญาตให้ใช้ไมค์ กดไอคอนที่แถบที่อยู่แล้วเลือกอนุญาต'
      :'เปิดไมค์ไม่ได้ เว็บต้องเปิดผ่าน https หรือ localhost และต้องมีไมค์ที่ว่างอยู่';
  }
}
function stopMic(){
  cancelAnimationFrame(micRaf);micAn=null;
  if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null}
  if(micCtx){micCtx.close();micCtx=null}
  $('#micLevel').style.width='0';$('#micState').textContent='ไมค์ปิดอยู่';$('#micRow').classList.remove('on');
  btnUI('#micBtn',false,'mic','ไมค์',false);
  applyLocal();sendState();renderMembers();
}
$('#micBtn').addEventListener('click',()=>{ if(micStream){stopMic();return} if(deaf)setDeaf(false); startMic(); });

/* ปิดหู: ปิดเสียงทั้งหมดที่ได้ยิน (เสียงแจ้งเตือน และเสียงของทุกคนในห้อง) */
let deaf=false;
function chime(){
  if(deaf)return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext;const c=new AC();
    const o=c.createOscillator(),g=c.createGain();
    o.type='sine';o.frequency.setValueAtTime(660,c.currentTime);o.frequency.linearRampToValueAtTime(880,c.currentTime+.18);
    g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.08,c.currentTime+.04);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.4);
    o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.42);
    setTimeout(()=>c.close(),700);
  }catch(e){}
}
function setDeaf(v){
  deaf=v;
  document.querySelectorAll('#audios audio,#screens .stile:not(.mine) video').forEach(el=>{el.muted=v});
  applySndMute();
  btnUI('#deafBtn',!v,'head','หูฟัง',v);$('#deafBtn').setAttribute('aria-pressed',String(v));
  if(v){ stopMic(); $('#micState').textContent='ปิดหูฟังอยู่ ไมค์ถูกปิดด้วย'; toast('ปิดหูฟังแล้ว จะไม่ได้ยินเสียงใดๆ'); }
  else { if(!micStream)$('#micState').textContent='ไมค์ปิดอยู่'; toast('เปิดหูฟังแล้ว'); }
}
$('#deafBtn').addEventListener('click',()=>setDeaf(!deaf));

/* ---------- ตัวช่วยอ่าน: แถบความคืบหน้า ----------
   คิดจาก "เวลาเริ่ม" (timestamp) แล้วคำนวณจากเวลาจริงที่ผ่านไปทุกครั้งที่วาด ไม่ได้นับทีละวินาที
   สลับแท็บหรือเบราว์เซอร์หน่วงตัวจับเวลาก็ไม่เพี้ยน เก็บใน localStorage รีเฟรชแล้วไม่หาย */
const RD_KEY='qs.rdtrack',RD_STAT='qs.readstats',RD_GAP=5*60000,RD_GOALS=[25,45,60];
const RD_POMO={read:25,brk:5,long:15,every:4};
const RD_MILE={25:'ผ่านหนึ่งในสี่แล้ว 🌱',50:'ครึ่งทางแล้ว สู้ต่ออีกนิด 🌿',75:'ใกล้ถึงแล้ว อีกนิดเดียว 🍃'};
const TH_DOW=['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'],TH_DOW_S=['อา','จ','อ','พ','พฤ','ศ','ส'];
const TH_MON=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
function rdLoad(){
  const o={goal:45,mode:'goal',auto:false,share:true,st:'idle',ph:'read',n:1,acc:0,t0:0,cr:0,seen:0,mile:0,doneAt:0};
  const s=store.get(RD_KEY,null),now=Date.now();
  if(!s||typeof s!=='object')return o;
  const num=(v,hi,def)=>{v=+v;return isFinite(v)&&v>=0?Math.min(hi,v):def};
  o.goal=RD_GOALS.includes(+s.goal)?+s.goal:45;
  o.mode='goal';
  o.auto=!!s.auto;o.share=s.share!==false;
  o.st=['idle','run','pause','done'].includes(s.st)?s.st:'idle';
  o.ph=s.ph==='break'?'break':'read';
  o.n=Math.max(1,Math.round(num(s.n,9999,1)));
  o.acc=num(s.acc,24*36e5,0);o.t0=num(s.t0,now,0);o.cr=num(s.cr,now,0);o.seen=num(s.seen,now,0);
  o.mile=num(s.mile,100,0);o.doneAt=num(s.doneAt,now,0);
  if(o.st==='run'&&!o.t0)o.st='idle';
  if(s.mode==='pomo'){o.st='idle';o.ph='read';o.n=1;o.acc=0;o.t0=0;o.cr=0;o.mile=0;o.doneAt=0} // รุ่นเก่าเคยมีโหมด Pomodoro (เอาออกแล้ว) เริ่มใหม่แบบตามเป้า
  return o;
}
function rdSave(){store.set(RD_KEY,RD)}
const rdPad=n=>String(n).padStart(2,'0');
const rdFmt=ms=>{const s=Math.floor(Math.max(0,ms)/1000);return rdPad(Math.floor(s/60))+':'+rdPad(s%60)};
const rdDur=ms=>{const m=Math.floor(ms/60000);return m<60?m+' น.':Math.floor(m/60)+' ชม. '+(m%60?rdPad(m%60)+' น.':'')};
const rdDay=t=>{const d=new Date(t);return d.getFullYear()+'-'+rdPad(d.getMonth()+1)+'-'+rdPad(d.getDate())};
function rdLen(S){S=S||RD;return (S.mode==='pomo'?(S.ph==='read'?RD_POMO.read:(S.n%RD_POMO.every===0?RD_POMO.long:RD_POMO.brk)):S.goal)*60000}
function rdElapsed(now,S){S=S||RD;return S.st==='run'?S.acc+Math.max(0,now-S.t0):S.st==='done'?rdLen(S):S.acc}
function rdStats(){const s=store.get(RD_STAT,null);return s&&typeof s==='object'&&s.days&&typeof s.days==='object'?s:{days:{},total:0,done:0,best:0,bd:[]}}
/* นับเวลาอ่านเข้าวัน (ข้ามเที่ยงคืนจะแบ่งให้ถูกวัน) */
function rdAddDay(from,to){
  const st=rdStats();let a=from;
  while(a<to){
    const d=new Date(a),next=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime(),b=Math.min(to,next);
    const k=rdDay(a),e=st.days[k]||(st.days[k]={ms:0,done:0});
    e.ms+=b-a;st.total=(st.total||0)+(b-a);a=b;
  }
  const keys=Object.keys(st.days).sort();while(keys.length>120)delete st.days[keys.shift()];
  store.set(RD_STAT,st);
}
function rdDoneDay(t){const st=rdStats(),k=rdDay(t),e=st.days[k]||(st.days[k]={ms:0,done:0});e.done++;st.done=(st.done||0)+1;store.set(RD_STAT,st)}
function rdCredit(upTo){
  const S=RD;
  if(S.st==='run'&&(S.mode==='goal'||S.ph==='read')){const from=Math.max(S.cr,S.t0);if(upTo>from)rdAddDay(from,upTo)}
  if(upTo>S.cr)S.cr=upTo;
}
/* เดินสถานะให้ตรงกับเวลาจริง เรียกกี่ครั้งก็ได้ ผลเหมือนกัน คืนค่าเหตุการณ์ที่เกิดขึ้น (ครบเป้า/เปลี่ยนช่วง) */
function rdSync(now){
  const S=RD,ev=[];let g=0;
  while(S.st==='run'&&g++<200){
    const len=rdLen(),el=S.acc+Math.max(0,now-S.t0);
    if(el<len)break;
    const T=S.t0+(len-S.acc);
    rdCredit(T);
    if(S.mode==='goal'){S.st='done';S.acc=len;S.t0=0;S.doneAt=T;S.mile=100;rdDoneDay(T);ev.push('done');break}
    if(S.ph==='read'){rdDoneDay(T);ev.push('pomo-done');S.ph='break'}
    else{S.ph='read';S.n++;ev.push('pomo-read')}
    S.acc=0;S.t0=T;S.mile=0;
  }
  if(S.st==='run')rdCredit(now);
  return ev;
}
function rdStart(){
  RD=rdLoad();const now=Date.now(),S=RD;
  if(S.st==='run')return;
  if(S.st==='pause'){S.st='run';S.t0=now;S.cr=now}
  else{S.st='run';S.ph='read';S.n=1;S.acc=0;S.t0=now;S.cr=now;S.mile=0;S.doneAt=0}
  S.seen=now;rdCommit();
}
function rdPause(){
  RD=rdLoad();const now=Date.now(),S=RD;
  if(S.st!=='run')return;
  rdEvents(rdSync(now));
  if(S.st==='run'){S.acc+=now-S.t0;S.t0=0;S.st='pause'}
  S.seen=now;rdCommit();
}
function rdResetAll(){
  RD=rdLoad();const S=RD;
  S.st='idle';S.acc=0;S.t0=0;S.cr=0;S.ph='read';S.n=1;S.mile=0;S.doneAt=0;rdCommit();
}
function rdCommit(){rdSave();rdPaint();rdShareSync()}
/* ป้ายที่คนในห้องเห็น: 0 ไม่มี 1 กำลังอ่าน 2 อ่านครบแล้ว (30 นาที) 3 กำลังพัก */
function rdShare(now){
  const S=RD;if(!S||!S.share)return 0;
  if(S.st==='run')return S.mode==='pomo'&&S.ph==='break'?3:1;
  if(S.st==='done'&&now-S.doneAt<30*60000)return 2;
  return 0;
}
let rdSent=-1;
function rdShareSync(){
  const v=rdShare(Date.now());
  if(v===rdSent)return;
  if(currentRoom){sendState();if(roomStage)roomStage.setBadge(myPeerId||'me',v)}
  else rdSent=v;
}
function rdEvents(ev){
  ev.forEach(e=>{
    let msg='';
    if(e==='done')msg='อ่านครบแล้ว 🎉 เก่งมาก';
    else if(e==='pomo-done')msg='ครบ '+RD_POMO.read+' นาที 🎉 พักสายตาได้แล้ว';
    else if(e==='pomo-read')msg='หมดเวลาพัก กลับมาอ่านกันต่อ 📖';
    if(!msg)return;
    chime();toast(msg);$('#rdLive').textContent=msg;
    if(e!=='pomo-read'){const c=$('#rd');c.classList.remove('cele');void c.offsetWidth;c.classList.add('cele');setTimeout(()=>c.classList.remove('cele'),1700)}
  });
  if(ev.some(e=>e==='done'||e==='pomo-done')){rdBadges(true);rdPaintStats()}
}
/* แบดจ์สะสม (เก็บในเครื่อง) */
function rdStreak(st){
  const days=st.days||{};let n=0;
  const t=new Date();
  if(!((days[rdDay(t)]||{}).ms>=5*60000))t.setDate(t.getDate()-1);
  for(;;){if((days[rdDay(t)]||{}).ms>=5*60000){n++;t.setDate(t.getDate()-1)}else break;if(n>400)break}
  return n;
}
const RD_BADGES=[
  ['first','🌱','ครบเป้าครั้งแรก',st=>st.done>=1],
  ['s3','🔥','อ่านต่อเนื่อง 3 วัน',st=>Math.max(st.best||0,rdStreak(st))>=3],
  ['h10','📚','รวม 10 ชั่วโมง',st=>(st.total||0)>=10*36e5],
  ['d10','🏅','ครบเป้า 10 ครั้ง',st=>st.done>=10]
];
function rdBadges(announce){
  const st=rdStats(),have=new Set(st.bd||[]),sk=rdStreak(st);
  let changed=false;
  if(sk>(st.best||0)){st.best=sk;changed=true}
  const fresh=RD_BADGES.filter(b=>!have.has(b[0])&&b[3](st));
  if(fresh.length){fresh.forEach(b=>have.add(b[0]));st.bd=[...have];changed=true}
  if(changed)store.set(RD_STAT,st);
  if(announce&&fresh.length)setTimeout(()=>toast('ได้แบดจ์ใหม่ '+fresh.map(b=>b[1]+' '+b[2]).join(' · ')),1800);
}
const RD_EMO={1:['📖','กำลังอ่านอยู่'],2:['🎉','อ่านครบเป้าแล้ว'],3:['☕','กำลังพักสายตา']};
function rdBadge(label,rd){
  const old=label.querySelector('.rb');if(old)old.remove();
  const e=RD_EMO[rd];if(!e)return;
  const i=document.createElement('i');i.className='rb';i.textContent=e[0];i.title=e[1];label.append(i);
}
/* ---- วาดหน้าจอ ---- */
function rdUserText(){
  if(!RD||RD.st==='idle'||RD.st==='done')return '';
  const now=Date.now(),len=rdLen(),el=Math.min(len,rdElapsed(now));
  if(RD.st==='pause')return '⏸ พักไว้ '+rdFmt(el)+' / '+rdFmt(len);
  return (RD.mode==='pomo'&&RD.ph==='break'?'☕ พัก ':'📖 ')+rdFmt(el)+' / '+rdFmt(len);
}
function setTitle(){
  const tot=social.inReq.length+dmUnread(),t=rdUserText();
  document.title=(RD&&RD.st==='run'&&t?t.split(' / ')[0]+' · ':'')+(tot?'('+tot+') ':'')+'QuietSpace';
}
function rdMsg(S,pct,brk){
  if(S.st==='idle')return S.mode==='pomo'?'พร้อมเริ่ม: อ่าน '+RD_POMO.read+' นาที สลับพัก '+RD_POMO.brk+' นาที':'พร้อมเริ่มอ่าน เลือกเป้าหมายแล้วกด “เริ่มอ่าน”';
  if(S.st==='done')return 'อ่านครบแล้ว 🎉 เก่งมาก พักสายตาสักหน่อยนะ';
  const pre=S.mode==='pomo'?'รอบที่ '+S.n+' · ':'';
  if(S.st==='pause')return pre+'พักตัวจับเวลาไว้ กด “อ่านต่อ” เมื่อพร้อม';
  if(brk)return pre+'พักสายตา ลุกยืดเส้นยืดสายสักหน่อย ☕';
  return pre+(pct>=75?RD_MILE[75]:pct>=50?RD_MILE[50]:pct>=25?RD_MILE[25]:'กำลังอ่าน… ค่อยๆ ไปทีละหน้า');
}
function rdPaint(now){
  if(!RD)return;
  now=now||Date.now();
  const S=RD,len=rdLen(),el=Math.min(len,rdElapsed(now)),pct=len?el/len*100:0;
  const brk=S.mode==='pomo'&&S.ph==='break'&&S.st!=='idle'&&S.st!=='done';
  const root=$('#rd');if(!root)return;
  root.dataset.st=S.st;root.dataset.ph=brk?'break':'read';
  root.dataset.t=brk?'b':S.st==='done'?'4':pct>=75?'3':pct>=50?'2':pct>=25?'1':'0';
  $('#rdFill').style.width=(S.st==='idle'?0:pct).toFixed(2)+'%';
  const tr=$('#rdTrack');tr.setAttribute('aria-valuenow',String(Math.floor(S.st==='idle'?0:pct)));
  tr.setAttribute('aria-label',(brk?'ความคืบหน้าช่วงพัก':'ความคืบหน้าการอ่าน')+' '+Math.floor(pct)+' เปอร์เซ็นต์');
  $('#rdTime').textContent=rdFmt(el)+' / '+rdFmt(len);
  $('#rdMsg').textContent=rdMsg(S,pct,brk);
  const go=$('#rdGo');
  go.textContent=S.st==='run'?'พัก':S.st==='pause'?'อ่านต่อ':S.st==='done'?'อ่านอีกรอบ':'เริ่มอ่าน';
  go.classList.toggle('ghost',S.st==='run');
  $('#rdReset').hidden=S.st==='idle';
  const gs=$('#rdGoals');
  gs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-checked',String(+b.dataset.g===S.goal)));
  $('#rdAuto').checked=!!S.auto;$('#rdShare').checked=!!S.share;
  // แถบเล็กใต้การ์ดโปรไฟล์ + ข้อความสถานะ + ชื่อแท็บ
  const mini=$('#rdMini'),show=S.st==='run'||S.st==='pause';
  mini.classList.toggle('on',show);mini.classList.toggle('brk',brk);mini.firstElementChild.style.width=pct.toFixed(2)+'%';
  const ut=rdUserText();if(ut)$('#upSt').textContent=ut;else paintUserSt();
  setTitle();
}
function paintUserSt(){const st=net.ok?effStatus():'offline';$('#upSt').textContent=currentRoom?'ในห้องเสียง':ST_LABEL[st]}
function rdStatView(){
  const st=rdStats(),today=new Date(),k0=rdDay(today),t0=(st.days[k0]||{ms:0,done:0});
  const days=[];
  for(let i=6;i>=0;i--){
    const d=new Date();d.setDate(d.getDate()-i);const e=st.days[rdDay(d)]||{ms:0,done:0};
    days.push({d,ms:e.ms||0,done:e.done||0,today:i===0});
  }
  const mx=Math.max(30*60000,...days.map(x=>x.ms)),peak=Math.max(...days.map(x=>x.ms));
  const sk=rdStreak(st),earned=new Set(st.bd||[]);
  const bars=days.map(x=>{
    const m=Math.round(x.ms/60000),h=x.ms?Math.max(3,Math.round(x.ms/mx*100)):0;
    const lab=TH_DOW[x.d.getDay()]+' '+x.d.getDate()+' '+TH_MON[x.d.getMonth()]+': '+(m?rdDur(x.ms):'ยังไม่ได้อ่าน')+(x.done?' ครบเป้า '+x.done+' ครั้ง':'');
    const showVal=x.ms&&(x.today||x.ms===peak);
    return '<li class="'+(x.today?'today':'')+'" title="'+esc(lab)+'" aria-label="'+esc(lab)+'" tabindex="0">'+(showVal?'<em>'+m+'</em>':'')+'<i style="height:'+h+'%"></i></li>';
  }).join('');
  const lbls=days.map(x=>'<li class="'+(x.today?'today':'')+'" aria-hidden="true">'+TH_DOW_S[x.d.getDay()]+'</li>').join('');
  return '<div class="rdnums"><div><b>'+(t0.ms>=6e4?rdDur(t0.ms):'0 น.')+'</b><span>อ่านวันนี้</span></div>'
    +'<div><b>'+(t0.done||0)+'</b><span>ครบเป้าวันนี้</span></div>'
    +'<div><b>'+sk+' วัน</b><span>อ่านต่อเนื่อง</span></div>'
    +'<div><b>'+((st.total||0)>=6e4?rdDur(st.total):'0 น.')+'</b><span>รวมทั้งหมด</span></div></div>'
    +'<figure class="wkfig" role="group" aria-label="เวลาอ่านต่อวัน 7 วันล่าสุด"><ol class="wk">'+bars+'</ol><ol class="wkl">'+lbls+'</ol><figcaption>เวลาอ่านต่อวัน 7 วันล่าสุด (นาที)</figcaption></figure>'
    +'<div class="rdbadges" aria-label="แบดจ์ที่สะสม">'+RD_BADGES.map(b=>'<span class="bdg'+(earned.has(b[0])?' on':'')+'" title="'+(earned.has(b[0])?'ได้แล้ว':'ยังไม่ได้')+'">'+b[1]+' '+b[2]+'</span>').join('')+'</div>';
}
function rdPaintStats(){if(!$('#rdStats').hidden)$('#rdStatBody').innerHTML=rdStatView()}
/* ---- ตัวเดินเวลา: วาดซ้ำทุกวินาที แต่ค่าที่แสดงคำนวณจากเวลาจริง ---- */
let rdStatAt=0,rdBdAt=0;
function rdTick(){
  RD=rdLoad(); // รับค่าล่าสุด เผื่อเปิดหลายแท็บ
  const now=Date.now(),S=RD;
  if(S.st==='run'){
    const ev=rdSync(now);S.seen=now;
    if((S.mode==='goal'||S.ph==='read')&&S.st==='run'){
      const pct=rdElapsed(now)/rdLen()*100,m=[75,50,25].find(x=>pct>=x);
      if(m&&m>S.mile){S.mile=m;toast(RD_MILE[m]);$('#rdLive').textContent=RD_MILE[m]}
    }
    rdSave();rdEvents(ev);
    if(now-rdBdAt>60000){rdBdAt=now;rdBadges(false)}
  }
  rdPaint(now);rdShareSync();
  if(now-rdStatAt>15000){rdStatAt=now;rdPaintStats()}
}
/* ---- ปุ่มต่างๆ ---- */
$('#rdGoals').innerHTML=RD_GOALS.map(g=>'<button type="button" role="radio" aria-checked="false" data-g="'+g+'">'+g+' นาที</button>').join('');
$('#rdGo').addEventListener('click',()=>{RD=rdLoad();if(RD.st==='run')rdPause();else{rdStart();toast('เริ่มนับเวลาอ่านแล้ว สู้ๆ 📖')}});
$('#rdReset').addEventListener('click',()=>{rdResetAll();toast('รีเซ็ตแล้ว')});
$('#rdGoals').addEventListener('click',e=>{
  const b=e.target.closest('[data-g]');if(!b)return;
  RD=rdLoad();RD.goal=+b.dataset.g;
  rdEvents(rdSync(Date.now()));rdCommit();
});
$('#rdStatBtn').addEventListener('click',()=>{
  const p=$('#rdStats');p.hidden=!p.hidden;$('#rdStatBtn').setAttribute('aria-expanded',String(!p.hidden));
  if(!p.hidden){rdBadges(false);rdPaintStats()}
});
function rdAutoStart(){
  RD=rdLoad();
  if(RD.auto&&RD.st!=='run'){rdStart();toast('เริ่มนับเวลาอ่านให้แล้ว 📖')}
}
$('#rdAuto').addEventListener('change',e=>{RD=rdLoad();RD.auto=e.target.checked;rdSave()});
$('#rdShare').addEventListener('change',e=>{RD=rdLoad();RD.share=e.target.checked;rdCommit()});
let rdClrT=0;
$('#rdClear').addEventListener('click',()=>{
  const b=$('#rdClear');
  if(!rdClrT){b.textContent='กดอีกครั้งเพื่อยืนยันล้างสถิติ';b.classList.add('danger');b.classList.remove('ghost');rdClrT=setTimeout(()=>{rdClrT=0;b.textContent='ล้างสถิติ';b.classList.remove('danger');b.classList.add('ghost')},3500);return}
  clearTimeout(rdClrT);rdClrT=0;b.textContent='ล้างสถิติ';b.classList.remove('danger');b.classList.add('ghost');
  store.del(RD_STAT);rdPaintStats();toast('ล้างสถิติแล้ว');
});
window.addEventListener('storage',e=>{if(e.key===RD_KEY||e.key===RD_STAT){RD=rdLoad();rdPaint();rdPaintStats()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)rdTick()});
window.addEventListener('pagehide',()=>{if(RD&&RD.st==='run'){RD.seen=Date.now();rdSave()}});
/* เริ่มต้น: ถ้าปิดหน้าเว็บไปนาน (เกิน 5 นาที) ไม่นับเวลาที่หายไป พักไว้ที่จุดที่เห็นล่าสุด */
RD=rdLoad();
if(RD.st==='run'){
  const now=Date.now();
  if(now-RD.seen>RD_GAP){
    const at=Math.max(RD.t0,RD.seen);rdSync(at);
    if(RD.st==='run'){RD.acc+=at-RD.t0;RD.t0=0;RD.st='pause'}
    rdSave();setTimeout(()=>toast('พักตัวจับเวลาอ่านไว้ให้ เพราะปิดหน้าเว็บไปนาน (ไม่นับเวลาที่หายไป)'),1500);
  }else{rdSync(now);rdSave()}
}
setTimeout(rdPaint,0);
setInterval(rdTick,1000);

/* พื้นหลัง: แผงปรับ */
function renderBgChips(){
  const chips=BG_PRESETS.map(([id,name,css])=>({id,name,css:css||'linear-gradient(var(--stage-a),var(--stage-b))',on:!bgState.image&&bgState.preset===id}));
  if(bgImage)chips.push({id:'image',name:'รูปของฉัน',css:'url("'+bgImage+'")',on:bgState.image});
  $('#bgChips').innerHTML=chips.map(c=>'<button type="button" role="radio" aria-checked="'+c.on+'" data-bg="'+c.id+'" title="'+esc(c.name)+'" aria-label="'+esc(c.name)+'" style="background-image:'+c.css.replace(/"/g,'&quot;')+'"></button>').join('');
}
function syncBgControls(){renderBgChips();$('#bgDim').value=bgState.dim;$('#bgBlur').value=bgState.blur}
$('#bgBtn').addEventListener('click',()=>{
  const p=$('#bgPanel');p.hidden=!p.hidden;$('#bgBtn').setAttribute('aria-expanded',String(!p.hidden));
  if(!p.hidden)syncBgControls();
});
$('#bgChips').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.bg==='image'){bgState.image=true}else{bgState.image=false;bgState.preset=b.dataset.bg}
  saveBg();applyBg();renderBgChips();
});
$('#bgDim').addEventListener('input',e=>{bgState.dim=+e.target.value;saveBg();applyBg()});
$('#bgBlur').addEventListener('input',e=>{bgState.blur=+e.target.value;saveBg();applyBg()});
$('#bgReset').addEventListener('click',()=>{bgState=Object.assign({},BG_DEFAULT);saveBg();applyBg();syncBgControls()});
$('#bgUp').addEventListener('click',()=>$('#bgFile').click());
$('#bgFile').addEventListener('change',e=>{
  const f=e.target.files&&e.target.files[0];e.target.value='';
  if(!f)return;
  if(!/^image\//.test(f.type)){toast('เลือกไฟล์รูปภาพเท่านั้น');return}
  if(f.size>15*1024*1024){toast('รูปใหญ่เกิน 15 MB ลองรูปที่เล็กลง');return}
  const url=URL.createObjectURL(f),im=new Image();
  im.onload=()=>{
    const sc=Math.min(1,1600/Math.max(im.width,im.height));
    const c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    URL.revokeObjectURL(url);
    bgImage=c.toDataURL('image/jpeg',.85);bgState.image=true;
    store.set('qs.bgimg',bgImage);saveBg();applyBg();renderBgChips();toast('ตั้งพื้นหลังแล้ว');
  };
  im.onerror=()=>{URL.revokeObjectURL(url);toast('เปิดรูปนี้ไม่ได้ ลองไฟล์ JPG หรือ PNG')};
  im.src=url;
});

/* ---------- เสียงบรรยากาศ (สร้างสดด้วย Web Audio ไม่ต้องดาวน์โหลดไฟล์เสียง) ---------- */
let actx=null,mix=null,nb=null,upN=0;
const sndPref=Object.assign({master:60,levels:{}},store.get('qs.snd',{}));
const saveSnd=()=>store.set('qs.snd',sndPref);
const sndLevel=id=>(sndPref.levels[id]==null?60:sndPref.levels[id]);
const vol=v=>Math.pow(v/100,2);
function makeNoise(c){
  const len=c.sampleRate*4,out={};
  const mk=fn=>{const b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);fn(d);return b};
  out.white=mk(d=>{for(let i=0;i<len;i++)d[i]=Math.random()*2-1});
  out.pink=mk(d=>{let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11;b6=w*.115926}});
  out.brown=mk(d=>{let l=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;l=(l+.02*w)/1.02;d[i]=l*3.5}});
  return out;
}
function aCtx(){
  if(!actx){
    const AC=window.AudioContext||window.webkitAudioContext;
    actx=new AC();
    const comp=actx.createDynamicsCompressor();comp.connect(actx.destination);
    mix=actx.createGain();mix.gain.value=deaf?0:vol(sndPref.master);mix.connect(comp);
    nb=makeNoise(actx);
  }
  if(actx.state==='suspended')actx.resume();
  return actx;
}
const noiseNode=k=>{const n=actx.createBufferSource();n.buffer=nb[k];n.loop=true;n.start(0,Math.random()*3);return n};
const biq=(type,f,q)=>{const n=actx.createBiquadFilter();n.type=type;n.frequency.value=f;if(q)n.Q.value=q;return n};
const gn=v=>{const g=actx.createGain();g.gain.value=v;return g};
const lfo=(f,depth,param,type)=>{const o=actx.createOscillator();o.type=type||'sine';o.frequency.value=f;const g=gn(depth);o.connect(g);g.connect(param);o.start();return o};
const chain=(...n)=>{for(let i=0;i<n.length-1;i++)n[i].connect(n[i+1])};
const quiet=(...ns)=>ns.forEach(x=>{try{x.stop()}catch(_){}});

function mkRain(out){
  const a=noiseNode('pink'),b=noiseNode('white'),g2=gn(.1);
  chain(a,biq('lowpass',7000),gn(.5),out);chain(b,biq('highpass',3500),g2,out);
  const l=lfo(.35,.04,g2.gain);
  return ()=>quiet(a,b,l);
}
function mkStorm(out){
  const stopRain=mkRain(out);
  const th=gn(0),br=noiseNode('brown');chain(br,biq('lowpass',180),th,out);
  let tm;
  const boom=()=>{
    const t=actx.currentTime;
    th.gain.cancelScheduledValues(t);th.gain.setValueAtTime(0,t);
    th.gain.linearRampToValueAtTime(1.6,t+.4+Math.random()*.5);
    th.gain.exponentialRampToValueAtTime(.001,t+4+Math.random()*3);
    tm=setTimeout(boom,9000+Math.random()*16000);
  };
  tm=setTimeout(boom,2500+Math.random()*4000);
  return ()=>{clearTimeout(tm);stopRain();quiet(br)};
}
function mkLeaves(out){
  const a=noiseNode('white'),g=gn(.2),p=noiseNode('pink');
  chain(a,biq('bandpass',4200,.8),g,out);chain(p,biq('lowpass',900),gn(.05),out);
  const l1=lfo(.22,.16,g.gain),l2=lfo(1.7,.05,g.gain);
  return ()=>quiet(a,p,l1,l2);
}
function mkWind(out){
  const a=noiseNode('pink'),f=biq('bandpass',500,1.2),g=gn(.7);
  chain(a,f,g,out);
  const l1=lfo(.06,280,f.frequency),l2=lfo(.09,.25,g.gain);
  return ()=>quiet(a,l1,l2);
}
function mkWaves(out){
  const a=noiseNode('pink'),g=gn(.35),b=noiseNode('brown'),g2=gn(.3);
  chain(a,biq('lowpass',1400),g,out);chain(b,biq('lowpass',500),g2,out);
  const l=lfo(.11,.3,g.gain),l2=lfo(.083,.25,g2.gain);
  return ()=>quiet(a,b,l,l2);
}
function mkStream(out){
  const a=noiseNode('pink'),g=gn(.45),b=noiseNode('white'),g2=gn(.08);
  chain(a,biq('bandpass',1800,.4),g,out);chain(b,biq('highpass',4000),g2,out);
  const l=lfo(9,.03,g2.gain),l2=lfo(.6,.15,g.gain);
  return ()=>quiet(a,b,l,l2);
}
function mkFire(out){
  const a=noiseNode('brown'),w=noiseNode('white'),cg=gn(0);
  chain(a,biq('lowpass',450),gn(.6),out);chain(w,biq('highpass',1800),cg,out);
  let tm;
  const pop=()=>{
    const t=actx.currentTime;
    cg.gain.cancelScheduledValues(t);cg.gain.setValueAtTime(.15+Math.random()*.6,t);
    cg.gain.exponentialRampToValueAtTime(.001,t+.03+Math.random()*.07);
    tm=setTimeout(pop,50+Math.random()*450);
  };
  pop();
  return ()=>{clearTimeout(tm);quiet(a,w)};
}
function mkCrickets(out){
  const stops=[];
  [[4300,24,1.1],[4700,21,.8]].forEach(([fc,fm,fg])=>{
    const o=actx.createOscillator();o.type='sine';o.frequency.value=fc;
    const am=gn(.5),am2=gn(.5);
    chain(o,am,am2,gn(.05),out);o.start();
    stops.push(o,lfo(fm,.5,am.gain,'square'),lfo(fg,.5,am2.gain,'square'));
  });
  return ()=>quiet(...stops);
}
const mkNoise=(kind,level)=>out=>{const a=noiseNode(kind);chain(a,gn(level),out);return ()=>quiet(a)};

const SND=[
  {id:'rain',name:'ฝนตก',grp:'ธรรมชาติ',make:mkRain},
  {id:'storm',name:'ฝนฟ้าร้อง',grp:'ธรรมชาติ',make:mkStorm},
  {id:'leaves',name:'ใบไม้ไหว',grp:'ธรรมชาติ',make:mkLeaves},
  {id:'wind',name:'ลมพัด',grp:'ธรรมชาติ',make:mkWind},
  {id:'waves',name:'คลื่นทะเล',grp:'ธรรมชาติ',make:mkWaves},
  {id:'stream',name:'ลำธาร',grp:'ธรรมชาติ',make:mkStream},
  {id:'fire',name:'เตาผิง',grp:'ธรรมชาติ',make:mkFire},
  {id:'cricket',name:'จิ้งหรีดยามค่ำ',grp:'ธรรมชาติ',make:mkCrickets},
  {id:'white',name:'นอยส์ขาว',grp:'นอยส์ช่วยโฟกัส',make:mkNoise('white',.22)},
  {id:'pink',name:'นอยส์ชมพู',grp:'นอยส์ช่วยโฟกัส',make:mkNoise('pink',.5)},
  {id:'brown',name:'นอยส์น้ำตาล',grp:'นอยส์ช่วยโฟกัส',make:mkNoise('brown',.8)}
];
const SND_PRESETS=[
  ['ฝนในป่า',{rain:55,leaves:35,cricket:25}],
  ['ริมทะเล',{waves:70,wind:25}],
  ['ข้างเตาผิง',{fire:70,rain:30}],
  ['ฝนฟ้าคะนอง',{storm:70}],
  ['โฟกัสลึก',{brown:55}]
];
const sndState={};

function setSnd(id,on){
  const def=SND.find(x=>x.id===id);if(!def)return;
  const st=sndState[id];
  if(on){
    if(st&&st.on)return;
    aCtx();
    const g=actx.createGain();g.gain.value=0;g.connect(mix);
    g.gain.setTargetAtTime(vol(sndLevel(id)),actx.currentTime,.15);
    let stop;
    try{stop=def.upload?def.start(g):def.make(g)}catch(e){try{g.disconnect()}catch(_){}toast('เปิดเสียงนี้ไม่ได้');return}
    sndState[id]={on:true,gain:g,stop};
  }else if(st&&st.on){
    st.on=false;
    st.gain.gain.setTargetAtTime(0,actx.currentTime,.12);
    setTimeout(()=>{try{st.stop()}catch(_){}try{st.gain.disconnect()}catch(_){}},900);
  }
  syncSndUI();
}
function stopAllSnd(){SND.forEach(d=>{if(sndState[d.id]&&sndState[d.id].on)setSnd(d.id,false)})}
function applySndMute(){if(mix)mix.gain.setTargetAtTime(deaf?0:vol(sndPref.master),actx.currentTime,.05)}

function renderSnd(){
  const groups=[];
  SND.forEach(d=>{const g=d.grp;if(!groups.includes(g))groups.push(g)});
  $('#sndList').innerHTML=groups.map(g=>'<div class="sgroup"><h4>'+esc(g)+'</h4><div class="srows">'
    +SND.filter(d=>d.grp===g).map(d=>
      '<div class="srow" data-s="'+esc(d.id)+'"><button type="button" class="stog" role="switch" aria-checked="false" title="'+esc(d.name)+'">'+esc(d.name)+'</button>'
      +'<input type="range" min="0" max="100" value="'+sndLevel(d.id)+'" aria-label="ระดับเสียง '+esc(d.name)+'">'
      +(d.upload?'<button type="button" class="sx" aria-label="เอาไฟล์ '+esc(d.name)+' ออก">×</button>':'')+'</div>').join('')
    +'</div></div>').join('');
  $('#sndPresets').innerHTML=SND_PRESETS.map(([n],i)=>'<button type="button" class="btn ghost sm" data-preset="'+i+'">'+esc(n)+'</button>').join('')
    +'<button type="button" class="btn ghost sm" data-preset="off">ปิดทั้งหมด</button>';
  syncSndUI();
}
function syncSndUI(){
  let n=0;
  document.querySelectorAll('#sndList .srow').forEach(r=>{
    const id=r.dataset.s,on=!!(sndState[id]&&sndState[id].on);if(on)n++;
    r.querySelector('.stog').setAttribute('aria-checked',String(on));
    const rg=r.querySelector('input[type=range]');if(+rg.value!==sndLevel(id))rg.value=sndLevel(id);
  });
  $('#sndBtn').textContent='เสียงบรรยากาศ'+(n?' ('+n+')':'');
  $('#sndMaster').value=sndPref.master;
}
$('#sndBtn').addEventListener('click',()=>{
  const p=$('#sndPanel');p.hidden=!p.hidden;$('#sndBtn').setAttribute('aria-expanded',String(!p.hidden));
});
$('#sndList').addEventListener('click',e=>{
  const row=e.target.closest('.srow');if(!row)return;
  const id=row.dataset.s;
  if(e.target.closest('.sx')){removeUpload(id);return}
  if(e.target.closest('.stog')){
    const on=!(sndState[id]&&sndState[id].on);
    if(on&&deaf)toast('ตอนนี้ปิดหูฟังอยู่ กดเปิดหูฟังเพื่อได้ยินเสียง');
    setSnd(id,on);
  }
});
$('#sndList').addEventListener('input',e=>{
  const row=e.target.closest('.srow');if(!row||e.target.type!=='range')return;
  const id=row.dataset.s;sndPref.levels[id]=+e.target.value;saveSnd();
  const st=sndState[id];if(st&&st.on)st.gain.gain.setTargetAtTime(vol(sndPref.levels[id]),actx.currentTime,.05);
});
$('#sndMaster').addEventListener('input',e=>{sndPref.master=+e.target.value;saveSnd();applySndMute()});
$('#sndPresets').addEventListener('click',e=>{
  const b=e.target.closest('[data-preset]');if(!b)return;
  if(deaf)toast('ตอนนี้ปิดหูฟังอยู่ กดเปิดหูฟังเพื่อได้ยินเสียง');
  const mixSet=b.dataset.preset==='off'?{}:SND_PRESETS[+b.dataset.preset][1];
  SND.forEach(d=>{
    if(d.upload)return;
    if(d.id in mixSet){sndPref.levels[d.id]=mixSet[d.id];setSnd(d.id,true);const st=sndState[d.id];if(st&&st.gain)st.gain.gain.setTargetAtTime(vol(mixSet[d.id]),actx.currentTime,.05)}
    else setSnd(d.id,false);
  });
  saveSnd();syncSndUI();
});

/* อัปโหลดไฟล์เสียงของตัวเอง (เล่นวนในเครื่องคุณเท่านั้น) */
$('#sndUp').addEventListener('click',()=>$('#sndFile').click());
$('#sndFile').addEventListener('change',e=>{
  const files=[...(e.target.files||[])];e.target.value='';
  files.forEach(f=>{
    if(SND.filter(d=>d.upload).length>=5){toast('อัปโหลดได้สูงสุด 5 ไฟล์');return}
    if(!(/^audio\//.test(f.type)||/\.(mp3|wav|ogg|oga|m4a|aac|flac|opus|webm)$/i.test(f.name))){toast('เลือกไฟล์เสียงเท่านั้น เช่น MP3 หรือ WAV');return}
    if(f.size>80*1024*1024){toast('ไฟล์ใหญ่เกิน 80 MB');return}
    aCtx();
    const id='up'+(++upN),url=URL.createObjectURL(f),el=new Audio();
    el.loop=true;el.preload='auto';el.src=url;
    const src=actx.createMediaElementSource(el);
    const def={id,name:f.name.replace(/\.[^.]+$/,'').slice(0,24),grp:'ไฟล์เสียงของฉัน',upload:true,el,src,url,
      start(g){src.connect(g);el.play().catch(()=>toast('เล่นไฟล์นี้ไม่ได้ ลองไฟล์อื่น'));return ()=>{el.pause();try{src.disconnect()}catch(_){}}}};
    el.onerror=()=>{toast('เปิดไฟล์เสียงนี้ไม่ได้ ลองไฟล์อื่น');removeUpload(id)};
    SND.push(def);renderSnd();setSnd(id,true);
  });
  if(files.length)$('#sndPanel').hidden=false;
});
function removeUpload(id){
  const i=SND.findIndex(d=>d.id===id);if(i<0)return;
  const d=SND[i];setSnd(id,false);
  setTimeout(()=>{try{d.el.pause();d.el.removeAttribute('src');d.el.load()}catch(_){}URL.revokeObjectURL(d.url)},1000);
  SND.splice(i,1);delete sndState[id];renderSnd();
}

/* ---------- เชื่อมต่อเซิร์ฟเวอร์ ---------- */
function setNet(st){
  const el=$('#net');el.dataset.s=st;
  el.textContent=st==='on'?'ออนไลน์':st==='wait'?'กำลังเชื่อมต่อ…':'ออฟไลน์';
  paintUserBar();
}
const profileSaved=()=>store.get('qs.profile',null)!==null;
function connect(){
  const demo=window.__QS_DEMO_WS;
  if(!demo&&location.protocol==='file:'){setNet('off');renderChannels();return}
  setNet('wait');
  const ws=demo?demo():new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws');
  net.ws=ws;
  ws.onopen=()=>{
    net.tries=0;
    send({t:'hello',cid,name:profile.name,cfg:cfgOf(profile),prof:profileSaved(),status:effStatus()});
    clearInterval(net.beat);net.beat=setInterval(()=>send({t:'ping',a:isActive()?1:0}),25000);
  };
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(_){return}onNet(m)};
  ws.onclose=()=>{
    if(net.ws!==ws)return;
    net.ok=false;clearInterval(net.beat);closeAllPeers();roomMembers=[];
    setNet('wait');renderChannels();renderMembersPanel();
    if(currentRoom)toast('การเชื่อมต่อหลุด กำลังต่อใหม่…');
    setTimeout(connect,Math.min(10000,800*Math.pow(2,net.tries++)));
  };
  ws.onerror=()=>{try{ws.close()}catch(_){}};
}
function findMsg(room,id){return (msgs[room]||[]).find(x=>x.id===id)}
function afterServers(){
  initRead();
  if(currentRoom){const r=chanById(currentRoom.id);if(r){currentRoom.name=r.name;currentRoom.cap=r.cap}}
  if(pendingGo){
    const g=pendingGo;
    if(g.room&&chanById(g.room)){pendingGo=null;if(g.type==='voice')joinRoom(g.room);else setView('text',g.room);return}
    if(g.sid&&srvById(g.sid)){
      pendingGo=null;hideDlg(srvDlg);goServer(g.sid);
      toast(g.created?'สร้างเซิร์ฟเวอร์แล้ว ส่งลิงก์เชิญให้เพื่อนได้เลย':'เข้าร่วมเซิร์ฟเวอร์แล้ว');
      if(g.created)openSettings();
      return;
    }
  }
  if((view.k==='text'||view.k==='voice')&&view.id&&!chanById(view.id)){bootView();return}
  if(view.k!=='studio'){markRead(viewKey());paintHead()}
  renderTop();renderChannels();renderMembersPanel();
  if(view.k==='voice')refreshRoom();
}
function onNet(m){
  switch(m.t){
    case 'welcome':{
      myPeerId=m.id;me={uid:m.me.uid,code:m.me.code};net.ok=true;
      if(m.pay)PAY=Object.assign({},PAY,m.pay);
      applyMe(m.me);setNet('on');
      if(!profileSaved()){
        const c=m.me.cfg||{};
        profile=Object.assign({},profile,{name:m.me.name||profile.name,skin:c.skin||profile.skin,shirt:c.shirt||profile.shirt,hair:c.hair||profile.hair,hat:c.hat||profile.hat,style:c.style||profile.style,outfit:c.outfit||profile.outfit,acc:c.acc||profile.acc,trim:c.trim||profile.trim,glasses:!!c.glasses,pic:c.pic||'',frame:c.frame||'none',adv:c.adv||null,useGlb:!!c.useGlb});
        if(m.me.name&&m.me.name!==DEFAULT.name)store.set('qs.profile',profile);
      }
      servers=m.servers||[];applyPresence(m.presence);applySocial(m.social);
      Object.keys(msgs).forEach(k=>delete msgs[k]);
      roster=[];rosterSid='';
      if(currentRoom)send({t:'join',room:currentRoom.id});
      initRead();
      if(!booted){
        booted=true;bootView();
        if(pendingInvite){const code=pendingInvite;pendingInvite='';openSrvDlg('join',code);send({t:'invite-info',code});$('#jPrev').textContent='กำลังตรวจสอบ…'}
      }else reshow();
      if(pendingPaid){
        const pp=pendingPaid;pendingPaid=null;setView('plans');
        if(pp.ok&&pp.sid){send({t:'sub-confirm',sid:pp.sid});toast('กำลังตรวจสอบการชำระเงิน…')}
        else if(pp.ok)toast('กำลังตรวจสอบการชำระเงิน สิทธิ์ Pro จะเปิดให้อัตโนมัติภายในไม่กี่นาที');
        else toast('ยกเลิกการชำระเงินแล้ว ยังไม่มีการตัดเงิน');
      }
      renderTop();paintUserBar();wantRoster();
      if($('#myCode'))$('#myCode').textContent=me.code;
      break;
    }
    case 'servers':{servers=m.servers||[];afterServers();break}
    case 'presence':{
      applyPresence(m.list);
      if(avDirty)repaintChats();
      renderChannels();renderMembersPanel();paintHead();paintUserBar();
      if(view.k==='friends')renderFriends();
      break;
    }
    case 'social':{
      applySocial(m);
      if(view.k==='dm')markRead('d:'+view.id);
      if(avDirty)repaintChats();
      renderTop();renderChannels();renderMembersPanel();paintHead();
      if(view.k==='friends')renderFriends();
      break;
    }
    case 'members':{
      roster=m.list||[];rosterSid=m.sid;roster.forEach(mergePerson);flushPics();
      if(m.sid===curSid){renderMembersPanel();if(avDirty)repaintChats();if(view.k==='friends')renderFriends()}
      break;
    }
    case 'mdirty':{if(m.sid===curSid&&view.k!=='studio')wantRoster();break}
    case 'server-joined':pendingGo={sid:m.sid,created:!!m.created};if(srvById(m.sid))afterServers();break;
    case 'server-gone':{
      if(currentRoom&&currentRoom.sid===m.sid)leaveRoom(true);
      servers=servers.filter(s=>s.id!==m.sid);
      if(m.kicked)toast('คุณถูกเตะออกจากเซิร์ฟเวอร์ '+(m.name||''));
      else if(m.deleted)toast('เซิร์ฟเวอร์ '+(m.name||'')+' ถูกลบแล้ว');
      else toast('ออกจากเซิร์ฟเวอร์แล้ว');
      if(curSid===m.sid){hideDlg(setDlgEl);goHome()}else{renderTop();renderChannels()}
      break;
    }
    case 'invite':showInvite(m);break;
    case 'created':{
      if(m.type==='voice')pendingGo={room:m.room,type:'voice'};else pendingGo={room:m.room,type:'text'};
      if(chanById(m.room))afterServers();
      break;
    }
    case 'me':applyMe(m.me);break;
    case 'pong':{if(typeof m.used==='number'){meX.usedMs=m.used;if(view.k==='plans')paintUse()}break}
    case 'checkout':{
      payBusy=false;
      if(m.demo)openPayDlg(m);
      else if(typeof m.url==='string'&&/^https:\/\//.test(m.url)){toast('กำลังไปหน้าชำระเงิน…');location.href=m.url}
      if(view.k==='plans')renderPlans();
      break;
    }
    case 'portal':{if(typeof m.url==='string'&&/^https:\/\//.test(m.url))location.href=m.url;break}
    case 'up-ready':{const f=m.rid&&upReq.get(m.rid);if(f){upReq.delete(m.rid);f.ok(m)}break}
    case 'error':{
      if(m.rid&&upReq.has(m.rid)){const f=upReq.get(m.rid);upReq.delete(m.rid);f.no(m);break}
      if(m.code==='pay'){payBusy=false;if(view.k==='plans')renderPlans()}
      toast(m.msg||'เกิดข้อผิดพลาด');
      if(m.upsell)offerPro(m.msg);
      break;
    }
    case 'ok':{
      if(m.what==='sub-on'){payBusy=false;clearTimeout(payTimer);hideDlg($('#payDlg'));toast('ยินดีต้อนรับสู่ QuietSpace Pro ✦ ใช้สิทธิ์ได้ทันที');if(view.k==='plans')renderPlans()}
      else if(m.what==='sub-cancel'){toast('ยกเลิกการต่ออายุแล้ว ใช้สิทธิ์ได้จนสิ้นรอบที่จ่ายแล้ว');if(view.k==='plans')renderPlans()}
      else if(m.what==='sub-resume'){toast('เปิดต่ออายุอัตโนมัติอีกครั้งแล้ว');if(view.k==='plans')renderPlans()}
      else 
      if(m.what==='friend-sent'){toast('ส่งคำขอเป็นเพื่อนถึง '+m.name+' แล้ว');const a=$('#addCode');if(a)a.value=''}
      else if(m.what==='friend-ok')toast('เป็นเพื่อนกับ '+m.name+' แล้ว');
      break;
    }
    case 'notice':{
      if(m.kind==='friend-req')notifyMsg((m.name||'มีคน')+' ส่งคำขอเป็นเพื่อนถึงคุณ');
      else if(m.kind==='friend-ok')notifyMsg((m.name||'เพื่อน')+' ตอบรับคำขอเป็นเพื่อนของคุณแล้ว');
      break;
    }
    case 'dm-opened':{
      if(pendingGo&&pendingGo.dm===m.uid){pendingGo=null;setView('dm',m.uid)}
      break;
    }
    case 'joined':{
      const r=chanById(m.room),s=srvOfCh(m.room);
      currentRoom={id:m.room,sid:m.sid||(s&&s.id)||'',name:r?r.name:'ห้อง',cap:r?r.cap:8};
      roomMembers=m.members||[];
      enterRoomUI();
      break;
    }
    case 'peer-joined':roomMembers.push(m.peer);refreshRoom();break;
    case 'peer-left':roomMembers=roomMembers.filter(x=>x.id!==m.id);closePeer(m.id);refreshRoom();break;
    case 'peer-update':roomMembers=roomMembers.map(x=>x.id===m.peer.id?m.peer:x);refreshRoom();updateRemoteTile(m.peer.id);break;
    case 'peer-state':{
      const x=roomMembers.find(y=>y.id===m.id);
      if(x){x.cam=m.cam;x.mic=m.mic;x.scr=!!m.scr;x.rd=+m.rd||0;updateRemoteTile(m.id);if(roomStage)roomStage.setBadge(m.id,x.rd)}
      break;
    }
    case 'history':msgs[m.room]=m.msgs||[];redrawChat(m.room);break;
    case 'msg':{
      const rid=m.room,msg=m.msg,dm=isDm(rid),r=dm?null:chanById(rid),mine=msg.uid===me.uid;
      if(dm){
        const pid=rid.slice(2);let d=social.dms.find(x=>x.uid===pid);
        if(!d){d={uid:pid,last:0};social.dms.push(d)}
        d.last=msg.ts;
      }else if(r)r.last=msg.ts;
      const arr=msgs[rid];
      if(arr){arr.push(msg);while(arr.length>200)arr.shift()}
      const t=typers[rid];if(t)t.delete(msg.uid);
      if(mine)forceStick=true;
      if(arr)redrawChat(rid);
      const viewing=view.k!=='studio'&&viewKey()===rid;
      if(viewing){markRead(rid);if(document.visibilityState!=='visible'&&!mine)notifyMsg(msg.name+': '+msgPreview(msg))}
      else{
        renderChannels();renderTop();
        if(!mine){
          if(dm)notifyMsg(msg.name+' ส่งข้อความถึงคุณ: '+msgPreview(msg));
          else if(mentionsMe(msg.text)){const s=srvOfCh(rid);notifyMsg(msg.name+' พูดถึงคุณใน '+(r?r.name:'ช่อง')+(s?' · '+s.name:''))}
        }
      }
      if(!mine&&currentRoom&&currentRoom.id===rid&&myStatus!=='dnd')chime();
      break;
    }
    case 'msg-edit':{const x=findMsg(m.room,m.id);if(x){x.text=m.text;x.edited=true;redrawChat(m.room)}break}
    case 'msg-del':{const a=msgs[m.room];if(a){const i=a.findIndex(x=>x.id===m.id);if(i>=0){a.splice(i,1);redrawChat(m.room)}}break}
    case 'msg-react':{const x=findMsg(m.room,m.id);if(x){if(Object.keys(m.react).length)x.react=m.react;else delete x.react;redrawChat(m.room)}break}
    case 'typing':{
      const t=typers[m.room]||(typers[m.room]=new Map());
      t.set(m.uid,{name:m.name,at:Date.now()});paintTyping();
      break;
    }
    case 'pics':{
      Object.keys(m.pics||{}).forEach(k=>{const e=people.get(k)||{uid:k};e.pic=m.pics[k].pic;e.pv=m.pics[k].pv;people.set(k,e)});
      renderTop();renderChannels();renderMembersPanel();paintUserBar();
      if(view.k==='friends')renderFriends();
      repaintChats();
      break;
    }
    case 'room-deleted':{
      delete msgs[m.room];
      const wasMine=currentRoom&&m.room===currentRoom.id;
      if(wasMine)leaveRoom(true);
      servers.forEach(s=>{s.channels=s.channels.filter(c=>c.id!==m.room)});
      if(view.k!=='studio'&&view.id===m.room){goServer(curSid);toast('ช่องนี้ถูกลบแล้ว')}
      else{renderChannels();if(wasMine)toast('ห้องนี้ถูกลบแล้ว')}
      break;
    }
    case 'signal':handleSignal(m.from,m.data);break;
  }
}
function sendState(){ if(currentRoom){rdSent=RD?rdShare(Date.now()):0;send({t:'state',cam:!!stream,mic:!!micStream,scr:!!scrStream,rd:rdSent})} }

/* ---------- ส่งภาพและเสียงถึงกัน (WebRTC ต่อตรงระหว่างผู้ใช้) ----------
   แต่ละคู่ใช้ 4 ช่องส่งคงที่: 0 เสียงไมค์, 1 กล้อง, 2 ภาพหน้าจอ, 3 เสียงจากหน้าจอ
   การเปิดปิดกล้อง ไมค์ หรือแชร์หน้าจอ แค่สลับแทร็กในช่องเดิม ไม่ต้องเจรจาเชื่อมต่อใหม่ */
let iceServers=[{urls:['stun:stun.cloudflare.com:3478','stun:stun.l.google.com:19302']}];
if(location.protocol!=='file:'){
  fetch('/api/turn').then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.iceServers)&&j.iceServers.length)iceServers=j.iceServers}).catch(()=>{});
}
const pcs=new Map();
const SLOT_KIND=['audio','video','video','audio'];
function localTrack(i){
  const s=[micStream,stream,scrStream,scrStream][i];
  if(!s)return null;
  const arr=SLOT_KIND[i]==='video'?s.getVideoTracks():s.getAudioTracks();
  return arr[0]||null;
}
async function applyTo(p){
  for(let i=0;i<4;i++){
    const snd=p.snd[i];
    if(snd){
      try{await snd.replaceTrack(localTrack(i))}catch(_){}
      if(i===2&&scrStream){
        try{const pr=snd.getParameters();if(!pr.encodings||!pr.encodings.length)pr.encodings=[{}];const e0=pr.encodings[0],cp=shareCaps(),vt=scrStream.getVideoTracks()[0],st=vt&&vt.getSettings?vt.getSettings():{};e0.maxBitrate=cp.kbps*1000;e0.maxFramerate=cp.fps;e0.scaleResolutionDownBy=Math.max(1,(st.width||0)/cp.w,(st.height||0)/cp.h);await snd.setParameters(pr)}catch(_){}
      }
    }
  }
}
function applyLocal(){pcs.forEach(p=>{applyTo(p)})}
function makePeer(id){
  const p={id,pc:new RTCPeerConnection({iceServers}),media:new MediaStream(),screen:new MediaStream(),pend:[],snd:[],initiator:false};
  p.pc.onicecandidate=e=>{if(e.candidate)send({t:'signal',to:id,data:{c:e.candidate}})};
  p.pc.ontrack=e=>{
    const i=p.pc.getTransceivers().indexOf(e.transceiver);
    (i>=2?p.screen:p.media).addTrack(e.track);showRemote(p);
  };
  p.pc.onconnectionstatechange=()=>{
    if(p.pc.connectionState==='failed'&&!window.__QS_DEMO_WS)toast('ต่อภาพหรือเสียงกับบางคนไม่ได้ เครือข่ายของเขาอาจไม่รองรับการต่อตรง');
  };
  pcs.set(id,p);
  return p;
}
async function callPeer(id){
  if(pcs.has(id))return;
  const p=makePeer(id);p.initiator=true;
  SLOT_KIND.forEach((k,i)=>{p.snd[i]=p.pc.addTransceiver(k,{direction:'sendrecv'}).sender});
  try{
    await applyTo(p);
    await p.pc.setLocalDescription(await p.pc.createOffer());
    send({t:'signal',to:id,data:{d:p.pc.localDescription}});
  }catch(_){}
}
async function handleSignal(from,data){
  if(!currentRoom||!data)return;
  const p=pcs.get(from)||makePeer(from);
  const pc=p.pc;
  try{
    if(data.d){
      await pc.setRemoteDescription(data.d);
      while(p.pend.length)await pc.addIceCandidate(p.pend.shift()).catch(()=>{});
      if(data.d.type==='offer'){
        pc.getTransceivers().forEach((t,i)=>{t.direction='sendrecv';p.snd[i]=t.sender});
        await applyTo(p);
        await pc.setLocalDescription(await pc.createAnswer());
        send({t:'signal',to:from,data:{d:pc.localDescription}});
      }
    }else if(data.c){
      if(pc.remoteDescription)await pc.addIceCandidate(data.c).catch(()=>{});
      else p.pend.push(data.c);
    }
  }catch(_){}
}
function showRemote(p){
  let au=document.getElementById('au-'+p.id);
  if(!au){au=document.createElement('audio');au.id='au-'+p.id;au.autoplay=true;au.muted=deaf;$('#audios').append(au)}
  if(au.srcObject!==p.media)au.srcObject=p.media;
  if(au.play)au.play().catch(()=>{});
  let t=document.getElementById('rt-'+p.id);
  if(!t){
    t=document.createElement('div');t.id='rt-'+p.id;t.className='rtile';t.hidden=true;
    t.innerHTML='<video autoplay playsinline muted></video><span class="rname"></span>';
    $('#remotes').append(t);t.querySelector('video').srcObject=p.media;
  }
  let st=document.getElementById('st-'+p.id);
  if(!st){
    st=document.createElement('div');st.id='st-'+p.id;st.className='stile';st.hidden=true;
    st.innerHTML='<video autoplay playsinline></video><span class="rname"></span><span class="sbt"><button type="button" data-full>เต็มจอ</button></span>';
    $('#screens').append(st);
    const v=st.querySelector('video');v.srcObject=p.screen;v.muted=deaf;
  }
  updateRemoteTile(p.id);
}
function updateScreensWrap(){
  const w=$('#screens');
  w.hidden=!w.querySelector('.stile:not([hidden])');
}
function updateRemoteTile(id){
  const m=roomMembers.find(x=>x.id===id);
  const t=document.getElementById('rt-'+id);
  if(t){
    t.hidden=!(m&&m.cam);
    t.querySelector('.rname').textContent=m?m.name:'';
  }
  const st=document.getElementById('st-'+id);
  if(st){
    st.hidden=!(m&&m.scr);
    st.querySelector('.rname').textContent=m?m.name+' แชร์หน้าจอ':'';
    if(!st.hidden){const v=st.querySelector('video');if(v.play)v.play().catch(()=>{})}
  }
  $('#remotesWrap').hidden=!$('#remotes').querySelector('.rtile:not([hidden])');
  updateScreensWrap();
}
function closePeer(id){
  const p=pcs.get(id);
  if(p){try{p.pc.close()}catch(_){}pcs.delete(id)}
  const au=document.getElementById('au-'+id);if(au){au.srcObject=null;au.remove()}
  const sp=spk.get(id);if(sp){try{sp.src.disconnect()}catch(_){}spk.delete(id)}
  const t=document.getElementById('rt-'+id);if(t)t.remove();
  const st=document.getElementById('st-'+id);if(st){const v=st.querySelector('video');if(v)v.srcObject=null;st.remove()}
  $('#remotesWrap').hidden=!$('#remotes').querySelector('.rtile:not([hidden])');
  updateScreensWrap();
}
function closeAllPeers(){[...pcs.keys()].forEach(closePeer)}
$('#screens').addEventListener('click',e=>{
  if(e.target.closest('[data-stop]')){stopScreen();return}
  const f=e.target.closest('[data-full]');
  if(f){const v=f.closest('.stile').querySelector('video');if(v&&v.requestFullscreen)v.requestFullscreen().catch(()=>{})}
});

/* แชร์หน้าจอ */
let scrStream=null;
const canShare=()=>!!(navigator.mediaDevices&&navigator.mediaDevices.getDisplayMedia);
function paintScr(){
  const on=!!scrStream,b=$('#scrBtn');
  b.textContent=on?'หยุดแชร์หน้าจอ':'แชร์หน้าจอ';
  b.classList.toggle('rec',on);b.setAttribute('aria-pressed',String(on));
  let mt=document.getElementById('st-me');
  if(on&&!mt){
    mt=document.createElement('div');mt.id='st-me';mt.className='stile mine';
    mt.innerHTML='<video autoplay playsinline muted></video><span class="rname">คุณกำลังแชร์หน้าจอ</span><span class="sbt"><button type="button" class="stop" data-stop>หยุดแชร์</button></span>';
    $('#screens').prepend(mt);
    mt.querySelector('video').srcObject=scrStream;
  }else if(!on&&mt){mt.querySelector('video').srcObject=null;mt.remove()}
  updateScreensWrap();
  const s=document.querySelector('#scrHint');if(s)s.hidden=canShare();
}
async function startScreen(){
  if(!currentRoom){toast('เข้าห้องเสียงก่อนจึงจะแชร์หน้าจอได้');return}
  if(!canShare()){toast('เบราว์เซอร์นี้แชร์หน้าจอไม่ได้ (มือถือส่วนใหญ่ยังไม่รองรับ ใช้คอมพิวเตอร์แทน)');return}
  try{
    const cp=shareCaps();
    const s=await navigator.mediaDevices.getDisplayMedia({video:{width:{max:cp.w},height:{max:cp.h},frameRate:{ideal:cp.fps,max:cp.fps}},audio:true});
    if(!currentRoom){s.getTracks().forEach(t=>t.stop());return}
    scrStream=s;
    const vt=s.getVideoTracks()[0];
    if(vt){vt.onended=()=>stopScreen();if(meX.pro)try{vt.contentHint='detail'}catch(_){}}
    paintScr();applyLocal();sendState();
    if(!meX.pro&&!shareHintShown){shareHintShown=true;toast('แชร์ที่ '+cp.h+'p · สมาชิก Pro แชร์ได้ชัดสูงสุด '+PAY.share.pro.h+'p '+PAY.share.pro.fps+' เฟรม')}
    if(roomMembers.length>4)toast('มีคนในห้องหลายคน การแชร์หน้าจอให้ทุกคนพร้อมกันอาจกระตุก');
  }catch(err){
    scrStream=null;paintScr();
    if(err&&err.name!=='NotAllowedError'&&err.name!=='AbortError')toast('แชร์หน้าจอไม่ได้ ลองใหม่อีกครั้ง');
  }
}
function stopScreen(){
  if(scrStream){scrStream.getTracks().forEach(t=>{t.onended=null;t.stop()});scrStream=null}
  paintScr();applyLocal();sendState();
}
$('#scrBtn').addEventListener('click',()=>scrStream?stopScreen():startScreen());

addEventListener('pagehide',()=>{stopCam();stopMic();if(scrStream)stopScreen()});

/* ---------- สมาชิก Pro: หน้าแพ็กเกจ การชำระเงิน ตัวสร้างอวตาร โมเดล 3D และการแนบไฟล์ ---------- */
const baht=n=>'฿'+Number(n).toLocaleString('th-TH',{minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2});
const dateTh=ts=>new Date(ts).toLocaleDateString('th-TH',{day:'numeric',month:'long',year:'numeric'});
const hrsTxt=ms=>{const h=ms/3600000;return h<10?h.toFixed(1):String(Math.floor(h))};
const remTxt=ms=>{const h=ms/3600000;return h<10?(Math.ceil(h*10)/10).toFixed(1):String(Math.ceil(h))};
function fmtSize(n){n=+n||0;return n<1024?n+' B':n<1048576?Math.round(n/1024)+' KB':n<1073741824?(n/1048576).toFixed(n<10485760?1:0)+' MB':(n/1073741824).toFixed(2)+' GB'}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const shareCaps=()=>meX.pro?PAY.share.pro:PAY.share.free;
const msgPreview=m=>String(m.text||(m.file?'📎 '+m.file.name:'')).slice(0,60);

/* ของ Pro ที่เลือกไว้ในรูปลักษณ์นี้ (เป็นรายการข้อความไทยไว้บอกผู้ใช้) */
function proPicks(c){
  const o=[],f=(list,id,pre)=>{const x=list.find(y=>y[0]===id);if(x&&x[2])o.push(pre+x[1])};
  f(HATS,c.hat,'หมวก');f(STYLES,c.style,'ทรงผม');f(OUTFITS,c.outfit,'ชุด');f(ACCS,c.acc,'');f(FRAMES,c.frame,'กรอบ');
  if(c.adv&&JSON.stringify(Object.assign({},ADV_DEFAULT,c.adv))!==JSON.stringify(ADV_DEFAULT))o.push('ตัวสร้างขั้นสูง');
  return o;
}
const studioCfg=()=>Object.assign({},draft,{glb:draft.useGlb&&meX.pro&&meX.glb?meX.glb.id:''});
/* นับเป็น "ใช้งานจริง" เมื่อเปิดหน้าเว็บอยู่และเพิ่งขยับ/พิมพ์ภายใน 3 นาที หรือกำลังคุยในห้องเสียงที่มีเพื่อนอยู่ด้วย */
function isActive(){
  if(!net.ok)return false;
  if(document.visibilityState==='visible'&&Date.now()-lastAct<180000)return true;
  return !!currentRoom&&roomMembers.length>0&&(!!micStream||!!stream||!!scrStream);
}
function paintPro(){
  const b=$('#proBtn');if(!b)return;
  b.classList.toggle('on',!!meX.pro);
  const t=b.querySelector('b');if(t)t.textContent=meX.pro?'Pro':'สมัคร Pro';
  b.title=meX.pro?'คุณเป็นสมาชิก QuietSpace Pro':'QuietSpace Pro: ของตกแต่งเพิ่ม แชร์จอชัด อัปโหลดไม่จำกัด สร้างอวตารเอง';
}
function syncProfileUp(){
  if(!meX.pro||!profileSaved())return;
  if(proPicks(profile).length)send({t:'profile',name:profile.name,cfg:cfgOf(profile)});
}
/* รับข้อมูลสมาชิกจากเซิร์ฟเวอร์ (ตอนเข้าระบบ และทุกครั้งที่สถานะเปลี่ยน) */
function applyMe(x){
  if(!x)return;
  const was=meX.pro;
  meX={pro:!!x.pro,usedMs:+x.usedMs||0,disc:!!x.disc,sub:x.sub||null,glb:x.glb||null,admin:!!x.admin};
  { const an=$('#adminNote'); if(an)an.hidden=!meX.admin; }
  if(meX.pro){
    profile.useGlb=!!(x.cfg&&x.cfg.useGlb);
    if(draft)draft.useGlb=profile.useGlb;
    if(profileSaved())store.set('qs.profile',profile);
  }
  if(!was&&meX.pro&&booted)syncProfileUp();
  if(was&&!meX.pro&&booted)toast('สิทธิ์สมาชิก Pro หมดอายุแล้ว ของตกแต่ง Pro จะถูกซ่อนจนกว่าจะต่ออายุ');
  paintPro();
  if(!booted)return;
  paintUserBar();refreshRoom(true);repaintChats();renderMembersPanel();renderChannels();
  if(view.k==='plans')renderPlans();
  if(view.k==='studio'&&studioStage&&draft)paintStudio();
  if(scrStream)applyLocal();
}

/* กล่องถาม/ชวนสมัคร */
function openAsk(title,body,btns){
  $('#askBody').innerHTML='<h2 id="askDlgT">'+title+'</h2><p>'+body+'</p><div class="row end">'+btns.map(b=>'<button type="button" class="btn '+(b[2]||'ghost')+'" data-ask="'+b[0]+'">'+b[1]+'</button>').join('')+'</div>';
  showDlg($('#askDlg'));
}
function offerPro(msg){openAsk('ฟีเจอร์สำหรับสมาชิก Pro',esc(msg||'ฟีเจอร์นี้สำหรับสมาชิก Pro'),[['close','ไว้ทีหลัง'],['plans','ดูแพ็กเกจ Pro','gold']])}
$('#askBody').addEventListener('click',e=>{
  const b=e.target.closest('[data-ask]');if(!b)return;
  hideDlg($('#askDlg'));
  if(b.dataset.ask==='plans')setView('plans');
  else if(b.dataset.ask==='delroom'&&askCtx){const id=askCtx.room;askCtx=null;deleteRoom(id)}
  else askCtx=null;
});

/* ---------- หน้าแพ็กเกจ ---------- */
function useInner(){
  const need=PAY.discHours*3600000,used=meX.usedMs||0,done=meX.disc||used>=need,pct=Math.min(100,used/need*100);
  return '<div class="nums"><b>'+(done?'🎉 ปลดล็อกส่วนลด '+PAY.discPct+'% แล้ว':'ใช้งานแล้ว '+hrsTxt(used)+' จาก '+PAY.discHours+' ชั่วโมง')+'</b>'
    +'<span>'+(done?'ลดให้ทุกรอบบิลที่ยังสมัครอยู่':'อีก '+remTxt(Math.max(0,need-used))+' ชม. รับส่วนลด '+PAY.discPct+'% ทุกรอบบิล')+'</span></div>'
    +'<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.floor(pct)+'" aria-label="ชั่วโมงใช้งานสะสม"><i style="width:'+pct.toFixed(1)+'%"></i></div>'
    +'<p class="pnote">นับเฉพาะเวลาที่คุณเปิดเว็บและใช้งานอยู่จริง ไม่นับตอนเปิดทิ้งไว้เฉยๆ</p>';
}
function paintUse(){
  const el=$('#puse');if(!el)return;
  el.classList.toggle('done',!!meX.disc||(meX.usedMs||0)>=PAY.discHours*3600000);
  el.innerHTML=useInner();
}
function mineHTML(s){
  const pl=s.plan==='year'?'รายปี':'รายเดือน',pp=PAY.prices[s.plan]||PAY.prices.month,pay=s.disc?pp.disc:pp.base;
  let h='<div class="pmine"><h3><i class="pt" style="margin:0">PRO</i> คุณเป็นสมาชิก Pro '+pl+(s.demo?' <span class="testtag">ทดลอง</span>':'')+'</h3>';
  h+='<p>'+(s.cancel?'ยกเลิกการต่ออายุแล้ว ใช้สิทธิ์ได้ถึง <b>'+dateTh(s.until)+'</b>':'ต่ออายุอัตโนมัติวันที่ <b>'+dateTh(s.until)+'</b> ยอด <b>'+baht(pay)+'</b>'+(s.disc?' (ลด '+PAY.discPct+'%)':''))+'</p>';
  if(!s.cancel&&!s.disc&&meX.disc)h+='<p class="pnote">คุณใช้งานครบ '+PAY.discHours+' ชม. แล้ว ส่วนลด '+PAY.discPct+'% จะเริ่มในรอบบิลถัดไป</p>';
  h+='<div class="row">'+(s.cancel?'<button type="button" class="btn gold sm" data-pa="resume">เปิดต่ออายุอัตโนมัติอีกครั้ง</button>'
    :'<button type="button" class="btn ghost sm'+(planArm==='cancel'?' danger':'')+'" data-pa="cancel">'+(planArm==='cancel'?'ยืนยันยกเลิกการต่ออายุ?':'ยกเลิกการต่ออายุ')+'</button>')
    +(PAY.mode==='stripe'&&!s.demo?'<button type="button" class="btn ghost sm" data-pa="portal">จัดการวิธีชำระเงิน</button>':'')
    +'<button type="button" class="btn ghost sm" data-pa="studio">ไปแต่งอวตาร</button></div></div>';
  return h;
}
function renderPlans(){
  const el=$('#plansBody');if(!el)return;
  const pr=PAY.prices[planCycle]||PAY.prices.month,done=meX.disc||(meX.usedMs||0)>=PAY.discHours*3600000;
  const price=done?pr.disc:pr.base,cyc=planCycle==='year'?'ปี':'เดือน',s=meX.sub,off=PAY.mode==='off';
  const save=Math.round(PAY.prices.month.base*12-PAY.prices.year.base);
  const np=PAY.pro||{hats:[],styles:[],outfits:[],accs:[],frames:[]};
  let h='<div class="phero"><h2>QuietSpace <span class="g">Pro</span></h2><p class="muted">ตกแต่งอวตารได้มากขึ้น แชร์จอคมชัด ส่งไฟล์ไม่จำกัดขนาด และสร้างอวตารของตัวเองได้</p></div>';
  if(PAY.mode==='demo')h+='<div class="pdemo"><b>โหมดทดลอง</b> การสมัครและการชำระเงินเป็นการจำลอง ไม่มีการตัดเงินจริง ใช้สำหรับสาธิตระบบ'
    +(!done?'<div class="row" style="margin-top:8px"><button type="button" class="btn ghost sm" data-pa="demohours">สาธิต: ข้ามไปใช้งานครบ '+PAY.discHours+' ชม.</button></div>':'')+'</div>';
  if(off)h+='<div class="pwarn">ระบบสมัครสมาชิกยังไม่เปิดให้บริการในตอนนี้</div>';
  if(meX.pro&&s)h+=mineHTML(s);
  else if(s&&!meX.pro)h+='<div class="pwhy">สมาชิก Pro ของคุณหมดอายุเมื่อ '+dateTh(s.until)+' สมัครใหม่เพื่อกลับมาใช้สิทธิ์ทั้งหมด ของที่เคยเลือกไว้จะกลับมาแสดงให้ทันที</div>';
  h+='<div class="puse'+(done?' done':'')+'" id="puse">'+useInner()+'</div>';
  h+='<div class="pcycle"><div class="seg" role="radiogroup" aria-label="รอบบิล">'
    +'<button type="button" role="radio" aria-checked="'+(planCycle==='month')+'" data-pa="cycle" data-v="month">รายเดือน</button>'
    +'<button type="button" role="radio" aria-checked="'+(planCycle==='year')+'" data-pa="cycle" data-v="year">รายปี<i class="pt">ประหยัด '+baht(save)+'</i></button></div></div>';
  h+='<div class="pcards">';
  h+='<section class="pcard"><h3>ฟรี</h3><div class="price"><b>฿0</b><small>ใช้ได้ตลอด</small></div><ul class="plist">'
    +'<li><div><b>ห้องเสียง แชต เพื่อน เซิร์ฟเวอร์</b><span>ใช้ได้ครบ ไม่จำกัดเวลา</span></div></li>'
    +'<li><div><b>ของตกแต่งอวตารพื้นฐาน</b><span>หมวก ทรงผม ชุด ของประกอบ และกรอบโปรไฟล์ให้เลือกมากมาย</span></div></li>'
    +'<li><div><b>แชร์หน้าจอ '+PAY.share.free.h+'p</b><span>'+PAY.share.free.fps+' เฟรม/วินาที</span></div></li>'
    +'<li><div><b>ส่งไฟล์ได้ไฟล์ละไม่เกิน '+Math.round(PAY.freeFile/1048576)+' MB</b></div></li></ul></section>';
  h+='<section class="pcard pro"><span class="ribbon">แนะนำ</span><h3><i class="pt" style="margin:0">PRO</i> สมาชิก Pro</h3>'
    +'<div class="price">'+(done&&!off?'<s>'+baht(pr.base)+'</s>':'')+'<b>'+baht(price)+'</b><small>/ '+cyc+'</small></div>'
    +'<div class="pnote">'+(planCycle==='year'?'เฉลี่ยเดือนละ '+baht(Math.round(price/12*100)/100)+' · ประหยัด '+baht(save)+' เทียบกับจ่ายรายเดือน 12 เดือน<br>':'')
    +(done?'ใช้ส่วนลด '+PAY.discPct+'% จากการใช้งานครบ '+PAY.discHours+' ชม. ทุกรอบบิลที่ยังสมัครอยู่':'ใช้งานครบ '+PAY.discHours+' ชม. ลดเหลือ '+baht(PAY.prices.month.disc)+'/เดือน หรือ '+baht(PAY.prices.year.disc)+'/ปี')+'</div>'
    +'<ul class="plist">'
    +'<li><div><b>ของตกแต่งพิเศษเพิ่ม</b><span>หมวก '+np.hats.length+' · ทรงผม '+np.styles.length+' · ชุด '+np.outfits.length+' · ของประกอบ '+np.accs.length+' · กรอบโปรไฟล์ '+np.frames.length+' แบบ</span></div></li>'
    +'<li><div><b>แชร์หน้าจอคมชัดสูงสุด '+PAY.share.pro.h+'p '+PAY.share.pro.fps+' เฟรม</b><span>ตัวหนังสือคมขึ้น ภาพลื่นขึ้น</span></div></li>'
    +'<li><div><b>อัปโหลดไฟล์ไม่จำกัดขนาด</b><span>ส่งไฟล์งานใหญ่แค่ไหนก็ได้'+(PAY.upload?'':' (เซิร์ฟเวอร์นี้ยังไม่เปิดระบบเก็บไฟล์)')+'</span></div></li>'
    +'<li><div><b>สร้างอวตารของตัวเอง</b><span>ตัวสร้างขั้นสูง ปรับสัดส่วน ใบหน้า ลายเสื้อ ออร่า หรืออัปโหลดโมเดล 3D (.glb)</span></div></li>'
    +'<li><div><b>ป้าย ✦ Pro ข้างชื่อ</b></div></li></ul>'
    +'<div class="pcta">'+(off?'<button type="button" class="btn gold" disabled>ยังไม่เปิดให้บริการ</button>'
      :meX.pro?'<button type="button" class="btn gold" disabled>เป็นสมาชิก Pro แล้ว ✓</button>'
      :'<button type="button" class="btn gold" data-pa="buy"'+(payBusy?' disabled':'')+'>'+(payBusy?'กำลังเปิดหน้าชำระเงิน…':'สมัคร Pro '+baht(price)+'/'+cyc)+'</button>')
    +'<p class="pnote">ต่ออายุอัตโนมัติทุก'+cyc+' ยกเลิกได้ทุกเมื่อ ใช้สิทธิ์ได้จนสิ้นรอบที่จ่ายแล้ว · ราคาเป็นเงินบาท</p></div></section>';
  h+='</div>';
  el.innerHTML=h;
}
$('#plansBody').addEventListener('click',e=>{
  const b=e.target.closest('[data-pa]');if(!b||b.disabled)return;
  const a=b.dataset.pa;
  if(a==='cycle'){planCycle=b.dataset.v==='month'?'month':'year';store.set('qs.cycle',planCycle);renderPlans()}
  else if(a==='buy'){
    if(!net.ok){toast('ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์ ลองใหม่อีกครั้ง');return}
    payBusy=true;renderPlans();send({t:'checkout',plan:planCycle});
    setTimeout(()=>{if(payBusy){payBusy=false;if(view.k==='plans')renderPlans()}},12000);
  }else if(a==='cancel'){
    if(planArm!=='cancel'){planArm='cancel';renderPlans();setTimeout(()=>{if(planArm==='cancel'){planArm='';if(view.k==='plans')renderPlans()}},5000);return}
    planArm='';send({t:'sub-cancel'});
  }else if(a==='resume')send({t:'sub-resume'});
  else if(a==='demohours'){send({t:'demo-hours'});toast('ข้ามไปครบ '+PAY.discHours+' ชม. แล้ว (ฟีเจอร์สาธิต)')}
  else if(a==='portal')send({t:'portal'});
  else if(a==='studio')setView('studio');
});
$('#proBtn').addEventListener('click',()=>setView('plans'));

/* ---------- ชำระเงิน (โหมดทดลอง: จำลอง ไม่มีการตัดเงิน / โหมด Stripe: พาไปหน้าชำระเงินของ Stripe) ---------- */
function openPayDlg(m){
  payPlan=m.plan;
  const pn=m.plan==='year'?'รายปี':'รายเดือน';
  $('#payBody').innerHTML='<h2 id="payDlgT">ชำระเงิน QuietSpace Pro</h2><div class="paybox"><span class="testtag">โหมดทดลอง · ไม่มีการตัดเงินจริง</span>'
    +'<div class="paysum"><div>แพ็กเกจ Pro '+pn+'</div>'+(m.disc?'<div class="muted">ราคาปกติ '+baht(m.base)+' · ส่วนลด '+PAY.discPct+'% จากการใช้งานครบ '+PAY.discHours+' ชม.</div>':'')
    +'<div class="tot"><span>ยอดชำระ</span><span>'+baht(m.amount)+'</span></div></div>'
    +'<div class="fakecard"><input type="text" value="4242 4242 4242 4242" readonly aria-label="หมายเลขบัตรตัวอย่าง"><div class="two"><input type="text" value="12 / 34" readonly aria-label="วันหมดอายุตัวอย่าง"><input type="text" value="123" readonly aria-label="รหัสหลังบัตรตัวอย่าง"></div></div>'
    +'<p class="hint">นี่คือหน้าตัวอย่างสำหรับสาธิต กดชำระแล้วระบบจะเปิดสิทธิ์ Pro ให้ทันทีโดยไม่เรียกเก็บเงินจริง เมื่อเปิดใช้ Stripe ระบบจะพาไปหน้าชำระเงินของ Stripe แทน</p>'
    +'<div class="row end"><button type="button" class="btn ghost" data-pd="close">ยกเลิก</button><button type="button" class="btn gold" data-pd="pay">ชำระเงิน (จำลอง) '+baht(m.amount)+'</button></div></div>';
  showDlg($('#payDlg'));
}
$('#payBody').addEventListener('click',e=>{
  const b=e.target.closest('[data-pd]');if(!b)return;
  if(b.dataset.pd==='close'){clearTimeout(payTimer);hideDlg($('#payDlg'));return}
  if(b.dataset.pd==='pay'){
    b.disabled=true;const old=b.textContent;b.textContent='กำลังดำเนินการ…';
    if(!send({t:'demo-pay',plan:payPlan})){b.disabled=false;b.textContent=old;toast('ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์');return}
    clearTimeout(payTimer);payTimer=setTimeout(()=>{if(b.isConnected&&b.disabled&&$('#payDlg').open){b.disabled=false;b.textContent=old;toast('ทำรายการไม่สำเร็จ ลองอีกครั้ง')}},8000);
  }
});

/* ---------- ตัวสร้างอวตารขั้นสูง ---------- */
const advCur=()=>Object.assign({},ADV_DEFAULT,draft.adv||{});
const advSet=(k,v)=>{draft.adv=Object.assign(advCur(),{[k]:v})};
const advSw=(k,list,cur)=>'<div class="sw" role="radiogroup">'+list.map(c=>'<button type="button" role="radio" aria-checked="'+(cur===c)+'" data-ad="'+k+'" data-v="'+c+'" aria-label="'+(c||'ไม่มี')+'"'+(c?' style="background:'+c+'"':' class="none" title="ไม่มี"')+'></button>').join('')+'</div>';
const advSeg=(k,list,cur)=>'<div class="seg" role="radiogroup">'+list.map(([v,l])=>'<button type="button" role="radio" aria-checked="'+(cur===v)+'" data-ad="'+k+'" data-v="'+v+'">'+l+'</button>').join('')+'</div>';
const advRng=(k,lo,hi,label,cur)=>'<label class="rng"><span>'+label+'</span><input type="range" min="'+lo+'" max="'+hi+'" step="0.01" value="'+cur+'" data-ar="'+k+'" aria-label="'+label+'"><output>'+Math.round(cur*100)+'%</output></label>';
function paintAdv(){
  const b=$('#advBox'),a=advCur(),lock=!meX.pro;
  b.className='advbox'+(advOpen?' open':'')+(lock?' locked':'');
  b.innerHTML='<button type="button" class="advh" aria-expanded="'+advOpen+'" data-ad-toggle>ตัวสร้างอวตารขั้นสูง<i class="pt">PRO</i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>'
    +'<div class="advb">'+(lock?'<div class="sub">ลองปรับดูได้ฟรี แต่คนอื่นจะเห็นหน้าตาที่ปรับเองก็ต่อเมื่อคุณเป็นสมาชิก Pro</div>':'')
    +advRng('hs',.85,1.25,'ขนาดหัว',a.hs)+advRng('bh',.88,1.12,'ความสูงตัว',a.bh)+advRng('bw',.88,1.18,'ความกว้างตัว',a.bw)
    +'<div class="opt"><span>รูปตา</span>'+advSeg('eye',EYES,a.eye)+'</div>'
    +'<div class="opt"><span>สีตา</span>'+advSw('eyec',ADV_PAL.eye,a.eyec)+'</div>'
    +'<div class="opt"><span>คิ้ว</span>'+advSeg('brow',BROWS,a.brow)+'</div>'
    +'<div class="opt"><span>ปาก</span>'+advSeg('mouth',MOUTHS,a.mouth)+'</div>'
    +'<div class="opt"><span>แก้มแดง</span>'+advSw('blush',ADV_PAL.blush,a.blush)+'</div>'
    +'<div class="opt"><span>ไฮไลต์ผม</span>'+advSw('hair2',ADV_PAL.hair2,a.hair2)+'</div>'
    +'<div class="opt"><span>ลายเสื้อ</span>'+advSeg('pat',PATS,a.pat)+'</div>'
    +(a.pat!=='none'?'<div class="opt"><span>สีลาย</span>'+advSw('pat2',ADV_PAL.pat,a.pat2)+'</div>':'')
    +'<div class="opt"><span>ออร่า</span>'+advSw('aura',ADV_PAL.aura,a.aura)+'</div>'
    +'<div class="row"><button type="button" class="btn ghost sm" data-ad-reset>รีเซ็ตตัวสร้างขั้นสูง</button></div></div>';
}
let advRaf=0;
$('#advBox').addEventListener('click',e=>{
  if(e.target.closest('[data-ad-toggle]')){advOpen=!advOpen;paintAdv();return}
  if(e.target.closest('[data-ad-reset]')){draft.adv=null;paintStudio();return}
  const b=e.target.closest('[data-ad]');if(!b)return;
  advSet(b.dataset.ad,b.dataset.v);paintStudio();
});
$('#advBox').addEventListener('input',e=>{
  const r=e.target.closest('[data-ar]');if(!r)return;
  advSet(r.dataset.ar,+r.value);
  if(r.nextElementSibling)r.nextElementSibling.textContent=Math.round(r.value*100)+'%';
  if(!advRaf)advRaf=requestAnimationFrame(()=>{advRaf=0;studioStage.setPeople([{name:draft.name||'ฉัน',cfg:studioCfg(),me:true,pro:meX.pro}]);paintProNote()});
});

/* ---------- โมเดล 3D ของฉัน (.glb) ---------- */
const glbInput=document.createElement('input');glbInput.type='file';glbInput.accept='.glb,model/gltf-binary';glbInput.hidden=true;document.body.append(glbInput);
function paintGlb(){
  const b=$('#glbBox');
  b.className='advbox open'+(meX.pro?'':' locked');
  let h='<div class="advh static">โมเดล 3D ของฉัน (.glb)<i class="pt">PRO</i></div><div class="advb">';
  if(!meX.pro){
    h+='<div class="sub">อัปโหลดโมเดล 3D ที่คุณทำเอง (ไฟล์ .glb ไม่เกิน '+Math.round(PAY.glbMax/1048576)+' MB) มาใช้เป็นอวตารได้ สำหรับสมาชิก Pro</div><div class="row"><button type="button" class="btn gold sm" data-g="plans">ดูแพ็กเกจ Pro</button></div>';
  }else if(!PAY.upload){
    h+='<div class="sub">เซิร์ฟเวอร์นี้ยังไม่ได้เปิดระบบเก็บไฟล์ (ผู้ดูแลต้องผูก R2 ตามคู่มือ) จึงยังอัปโหลดโมเดลไม่ได้</div>';
  }else{
    if(glbUp)h+='<div class="glbinfo">กำลังอัปโหลด '+esc(glbUp.name)+' … <span id="glbPct">'+glbUp.pct+'%</span></div><div class="glbprog"><i id="glbBar" style="width:'+glbUp.pct+'%"></i></div><div class="row"><button type="button" class="btn ghost sm" data-g="cancel">ยกเลิก</button></div>';
    else if(meX.glb){
      const on=!!profile.useGlb;
      h+='<div class="glbrow"><div class="glbinfo"><b>'+esc(meX.glb.name)+'</b><br>'+fmtSize(meX.glb.size)+' · '+(on?'กำลังใช้เป็นอวตารของคุณ':'ยังไม่ได้ใช้')+'</div></div>'
        +'<div class="row"><button type="button" class="btn sm" data-g="use">'+(on?'กลับไปใช้อวตารปกติ':'ใช้โมเดลนี้เป็นอวตาร')+'</button>'
        +'<button type="button" class="btn ghost sm" data-g="pick">เปลี่ยนไฟล์</button>'
        +'<button type="button" class="btn ghost sm'+(glbArm?' danger':'')+'" data-g="del">'+(glbArm?'ยืนยันลบโมเดล?':'ลบโมเดล')+'</button></div>';
    }else h+='<div class="sub">เลือกไฟล์ .glb จากเครื่อง ระบบจะย่อให้สูงเท่าอวตารทั่วไป ใช้ได้ทันทีโดยไม่ต้องกดบันทึก</div><div class="row"><button type="button" class="btn sm" data-g="pick">เลือกไฟล์ .glb</button></div>';
    h+='<div class="sub">โมเดลหนักเกิน '+(200000).toLocaleString('th-TH')+' สามเหลี่ยม หรือโหลดไม่ได้ ระบบจะแสดงอวตารปกติแทน และทุกคนในห้องเห็นโมเดลนี้ ใช้เฉพาะผลงานที่คุณมีสิทธิ์</div>';
  }
  h+='<div class="row"><button type="button" class="btn ghost sm" data-g="view" aria-pressed="'+(!glbOff)+'">โมเดล 3D ของคนอื่น: '+(glbOff?'ซ่อนอยู่':'แสดงอยู่')+'</button></div></div>';
  b.innerHTML=h;
}
function glbProg(){
  if(!glbUp)return;
  const p=$('#glbPct'),bar=$('#glbBar');
  if(p)p.textContent=glbUp.pct+'%';if(bar)bar.style.width=glbUp.pct+'%';
}
async function doGlbUpload(f){
  if(!meX.pro){offerPro('อัปโหลดโมเดล 3D ได้เฉพาะสมาชิก Pro');return}
  if(glbUp)return;
  if(!/\.glb$/i.test(f.name)){toast('รองรับเฉพาะไฟล์โมเดล .glb');return}
  if(f.size>PAY.glbMax){toast('โมเดลใหญ่เกิน '+Math.round(PAY.glbMax/1048576)+' MB ลองลดขนาดหรือจำนวนพื้นผิวก่อน');return}
  try{
    const head=new Uint8Array(await f.slice(0,12).arrayBuffer());
    if(String.fromCharCode(head[0],head[1],head[2],head[3])!=='glTF'){toast('ไฟล์นี้ไม่ใช่โมเดล GLB ที่ถูกต้อง');return}
  }catch(_){toast('อ่านไฟล์นี้ไม่ได้');return}
  glbUp={name:f.name,pct:0,ctl:{}};paintGlb();
  try{
    await uploadFile(f,'glb','',glbUp.ctl,l=>{glbUp.pct=Math.min(99,Math.floor(l/f.size*100));glbProg()});
    glbUp=null;paintGlb();toast('อัปโหลดโมเดลแล้ว กำลังใช้เป็นอวตารของคุณ');
  }catch(err){
    glbUp=null;paintGlb();
    if(err&&err.cancel)return;
    if(err&&err.upsell)offerPro(err.msg);else toast((err&&err.msg)||'อัปโหลดโมเดลไม่สำเร็จ');
  }
}
glbInput.addEventListener('change',e=>{const f=(e.target.files||[])[0];e.target.value='';if(f)doGlbUpload(f)});
$('#glbBox').addEventListener('click',e=>{
  const b=e.target.closest('[data-g]');if(!b)return;
  const a=b.dataset.g;
  if(a==='plans')setView('plans');
  else if(a==='pick')glbInput.click();
  else if(a==='cancel'){if(glbUp){glbUp.ctl.cancel=true;if(glbUp.ctl.xhr)try{glbUp.ctl.xhr.abort()}catch(_){}}}
  else if(a==='use')send({t:'glb-use',on:!profile.useGlb});
  else if(a==='del'){
    if(!glbArm){glbArm=true;paintGlb();setTimeout(()=>{glbArm=false;if(view.k==='studio')paintGlb()},4000);return}
    glbArm=false;send({t:'glb-del'});
  }else if(a==='view'){
    glbOff=!glbOff;store.set('qs.glbOff',glbOff);paintGlb();refreshRoom(true);
    if(studioStage)studioStage.setPeople([{name:draft.name||'ฉัน',cfg:studioCfg(),me:true,pro:meX.pro}]);
  }
});

/* แถบบอกว่ากำลังลองของ Pro อยู่ (ยังไม่ได้สมัคร) */
function paintProNote(){
  const el=$('#proNote');if(!el)return;
  const picks=meX.pro?[]:proPicks(draft);
  el.hidden=!picks.length;
  if(!picks.length){el.innerHTML='';return}
  el.innerHTML='<b>กำลังลองของ Pro อยู่: '+esc(picks.join(' · '))+'</b><span>คนอื่นจะยังไม่เห็นจนกว่าคุณจะสมัคร Pro ระบบเก็บค่าที่เลือกไว้ให้ และจะแสดงทันทีเมื่อสมัคร</span>'
    +'<div class="row"><button type="button" class="btn gold sm" data-pn="plans">ดูแพ็กเกจ Pro</button></div>';
}
$('#proNote').addEventListener('click',e=>{if(e.target.closest('[data-pn=plans]'))setView('plans')});

/* ---------- อัปโหลดไฟล์ (ตัวไฟล์ส่งทาง HTTP เป็นส่วนๆ ส่วนละ 32 MiB ข้อความผ่าน WebSocket แค่ขอสิทธิ์) ---------- */
function httpReq(method,path,body,onProg,ctl){
  if(window.__QS_DEMO_HTTP)return window.__QS_DEMO_HTTP(method,path,body,onProg,ctl);
  return new Promise(ok=>{
    const x=new XMLHttpRequest();
    if(ctl)ctl.xhr=x;
    x.open(method,path);
    if(onProg&&x.upload)x.upload.onprogress=e=>{if(e.lengthComputable)onProg(e.loaded)};
    x.onload=()=>{let j=null;try{j=JSON.parse(x.responseText)}catch(_){}ok({status:x.status,json:j})};
    x.onerror=x.ontimeout=()=>ok({status:0,json:null});
    x.onabort=()=>ok({status:-1,json:null});
    x.send(body||null);
  });
}
function upInit(file,kind,room){
  return new Promise((ok,no)=>{
    const rid=Math.random().toString(36).slice(2,12);
    const t=setTimeout(()=>{upReq.delete(rid);no({msg:'เซิร์ฟเวอร์ไม่ตอบสนอง ลองใหม่อีกครั้ง'})},15000);
    upReq.set(rid,{ok:m=>{clearTimeout(t);ok(m)},no:m=>{clearTimeout(t);no(m)}});
    if(!send({t:'up-init',rid,kind,room:room||'',name:file.name,size:file.size})){clearTimeout(t);upReq.delete(rid);no({msg:'ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์'})}
  });
}
async function uploadFile(file,kind,room,ctl,onProg){
  let r;
  try{r=await upInit(file,kind,room)}
  catch(e){if(e&&e.code==='rate'){await sleep(900);r=await upInit(file,kind,room)}else throw e}
  ctl.fid=r.fid;ctl.tok=r.tok;
  let sent=0;
  for(let i=1;i<=r.parts;i++){
    const blob=file.slice((i-1)*r.part,Math.min(file.size,i*r.part));
    let ok=false,last=null;
    for(let a=0;a<4&&!ok&&!ctl.cancel;a++){
      if(a)await sleep(700*a);
      const res=await httpReq('PUT','/api/up/'+r.fid+'/'+i+'?tok='+r.tok,blob,l=>onProg(sent+l),ctl);
      last=res;ok=res.status===200;
      if(res.status>=400&&res.status<500&&res.status!==408&&res.status!==429)break;
    }
    if(ctl.cancel){httpReq('DELETE','/api/up/'+r.fid+'?tok='+r.tok,null,null,{});throw {cancel:true}}
    if(!ok)throw {msg:(last&&last.json&&last.json.error)||'อัปโหลดไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองใหม่'};
    sent+=blob.size;onProg(sent);
  }
  const d=await httpReq('POST','/api/up/'+r.fid+'/done?tok='+r.tok,null,null,ctl);
  if(d.status!==200)throw {msg:(d.json&&d.json.error)||'ปิดการอัปโหลดไม่สำเร็จ ลองใหม่อีกครั้ง'};
  return d.json||{fid:r.fid};
}
function paintUp(p){
  const el=$('#'+p+'Up');if(!el)return;
  const f=pend[p];
  el.className='upbar'+(f?' on':'')+(f&&f.state==='ready'?' ready':'');
  if(!f){el.innerHTML='';return}
  el.innerHTML='<span aria-hidden="true">📎</span><span class="un">'+esc(f.name)+' · '+fmtSize(f.size)+'</span>'
    +(f.state==='up'?'<span class="pg"><i style="width:'+f.pct+'%"></i></span><span class="pc">'+f.pct+'%</span>'
      :f.state==='ready'?'<span class="pc">พร้อมส่ง</span>'
      :'<span class="pc" style="color:var(--warn);min-width:0">'+esc(f.err||'ผิดพลาด')+'</span>')
    +'<button type="button" class="icb" data-x aria-label="ยกเลิกไฟล์แนบ">×</button>';
}
function setProg(p){
  const el=$('#'+p+'Up'),f=pend[p];if(!el||!f)return;
  const i=el.querySelector('.pg i'),c=el.querySelector('.pc');
  if(i)i.style.width=f.pct+'%';if(c&&f.state==='up')c.textContent=f.pct+'%';
}
function clearPend(p,keep){
  const f=pend[p];if(!f)return;
  pend[p]=null;paintUp(p);
  if(keep)return;
  if(f.state==='up'){f.ctl.cancel=true;if(f.ctl.xhr)try{f.ctl.xhr.abort()}catch(_){}}
  else if(f.ctl.fid&&f.state==='ready')httpReq('DELETE','/api/up/'+f.ctl.fid+'?tok='+f.ctl.tok,null,null,{});
}
async function attachFile(p,file){
  const rid=roomOf(p);
  if(!rid){toast('เลือกห้องหรือแชตก่อนแนบไฟล์');return}
  if(!net.ok){toast('ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์');return}
  if(pend[p]&&pend[p].state!=='err'){toast('แนบได้ครั้งละหนึ่งไฟล์ ส่งหรือยกเลิกไฟล์เดิมก่อน');return}
  if(!PAY.upload){toast('เซิร์ฟเวอร์นี้ยังไม่ได้เปิดระบบเก็บไฟล์ (ผู้ดูแลต้องเปิดใช้ R2 ตามคู่มือ)');return}
  if(!file.size){toast('ไฟล์นี้ว่างเปล่า');return}
  if(!meX.pro&&file.size>PAY.freeFile){offerPro('ไฟล์ใหญ่เกิน '+Math.round(PAY.freeFile/1048576)+' MB สมาชิก Pro อัปโหลดไฟล์ได้ไม่จำกัดขนาด');return}
  const f={name:(file.name||'file').slice(0,120),size:file.size,state:'up',pct:0,room:rid,ctl:{},sendWhenReady:false};
  pend[p]=f;paintUp(p);
  try{
    const r=await uploadFile(file,'file',rid,f.ctl,l=>{f.pct=Math.min(99,Math.floor(l/file.size*100));setProg(p)});
    if(pend[p]!==f)return;
    f.fid=r.fid;f.state='ready';f.pct=100;paintUp(p);
    if(f.sendWhenReady)submitChat(p);
  }catch(err){
    if(pend[p]!==f||(err&&err.cancel))return;
    if(err&&err.upsell){pend[p]=null;paintUp(p);offerPro(err.msg);return}
    f.state='err';f.err=(err&&err.msg)||'อัปโหลดไม่สำเร็จ';paintUp(p);
  }
}
const IMG_RE=/\.(png|jpe?g|gif|webp)$/i,VID_RE=/\.(mp4|webm)$/i,AUD_RE=/\.(mp3|ogg|wav|m4a)$/i;
function fileIcon(n){
  return /\.(zip|rar|7z|tar|gz)$/i.test(n)?'🗜️':/\.pdf$/i.test(n)?'📕':/\.(docx?|rtf|odt)$/i.test(n)?'📄':/\.(xlsx?|csv|ods)$/i.test(n)?'📊':/\.(pptx?|key|odp)$/i.test(n)?'📽️':/\.(psd|ai|fig|sketch|blend|glb|obj|fbx|stl)$/i.test(n)?'🎨':/\.(js|ts|py|java|c|cpp|html|css|json|md|txt)$/i.test(n)?'📝':'📎';
}
function attHTML(f){
  const u=esc(fileUrl(f)),n=esc(f.name),meta=n+' · '+fmtSize(f.size);
  if(IMG_RE.test(f.name))return '<a class="att img" href="'+u+'" data-lb="'+u+'" target="_blank" rel="noopener"><img loading="lazy" alt="'+n+'" src="'+u+'"></a><div class="attname">'+meta+'</div>';
  if(VID_RE.test(f.name))return '<div class="att"><video controls preload="metadata" src="'+u+'"></video><div class="attname">'+meta+'</div></div>';
  if(AUD_RE.test(f.name))return '<div class="att"><audio controls preload="none" src="'+u+'"></audio><div class="attname">'+meta+'</div></div>';
  return '<a class="att file" href="'+u+'" download="'+n+'" rel="noopener"><span class="fi" aria-hidden="true">'+fileIcon(f.name)+'</span><span class="fn"><b>'+n+'</b><span>'+fmtSize(f.size)+'</span></span><span class="dl">ดาวน์โหลด</span></a>';
}
function openLightbox(src){
  const d=document.createElement('div');d.className='lbox';d.setAttribute('role','dialog');d.setAttribute('aria-label','ดูรูปขนาดใหญ่');
  d.innerHTML='<img alt="" src="'+esc(src)+'">';
  const kd=e=>{if(e.key==='Escape')close()};
  const close=()=>{d.remove();document.removeEventListener('keydown',kd)};
  d.addEventListener('click',close);document.addEventListener('keydown',kd);document.body.append(d);
}

/* ---------- เริ่มทำงาน ---------- */
btnUI('#camBtn',false,'cam','กล้อง',false);btnUI('#micBtn',false,'mic','ไมค์',false);btnUI('#deafBtn',true,'head','หูฟัง',false);
paintScr();
if(!canShare())$('#scrBtn').style.display='none';
renderSnd();
$('#tComp').innerHTML=chatBoxHTML('t');
$('#dComp').innerHTML=chatBoxHTML('d');
$('#vChatMount').innerHTML='<div class="msgs compact" id="vList" aria-live="polite"></div><div class="composer cm" id="vComp">'+chatBoxHTML('v')+'</div>';
bindChat('t');bindChat('v');bindChat('d');
$('#myCode').textContent=me.code||'------';
(function(){
  const pm=location.search.match(/[?&]paid=([01])/);
  if(pm){
    const sm=location.search.match(/[?&]session_id=(cs_[A-Za-z0-9_]+)/);
    pendingPaid={ok:pm[1]==='1',sid:sm?sm[1]:''};
    try{history.replaceState(null,'',location.pathname)}catch(_){}
  }
  const m=location.search.match(/[?&]invite=([A-Za-z0-9]+)/);
  if(m){pendingInvite=parseInvite(m[1]);try{history.replaceState(null,'',location.pathname)}catch(_){}}
  const saved=curSid;
  setView('friends');
  curSid=saved;store.set('qs.sid',saved);
  renderTop();renderChannels();
})();
connect();
})();
