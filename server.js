const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const PORT=process.env.PORT||3000,DB=path.join(__dirname,'posts.json');
let posts=[];try{posts=JSON.parse(fs.readFileSync(DB))}catch{}
const save=()=>fs.writeFile(DB,JSON.stringify(posts),()=>{});
const srv=http.createServer((q,r)=>{
  if(q.url==='/ice.json'){const u=process.env.TURN_URL;r.setHeader('content-type','application/json');
    return r.end(JSON.stringify(u?[{urls:u.split(','),username:process.env.TURN_USER,credential:process.env.TURN_PASS}]:[]))}
  fs.readFile(path.join(__dirname,'public','index.html'),(e,d)=>{r.setHeader('content-type','text/html;charset=utf-8');r.end(d||'error')})});
const wss=new WebSocketServer({server:srv,maxPayload:256*1024});
const cl=new Map();let n=0;
const send=(ws,o)=>ws.readyState===1&&ws.send(JSON.stringify(o));
const bcast=o=>cl.forEach(c=>send(c.ws,o));
const peers=()=>[...cl].map(([id,c])=>({peer:id,presence:c.p}));
wss.on('connection',ws=>{
  const id='p'+(++n).toString(36)+Math.random().toString(36).slice(2,6),c={ws,p:{},t:[]};cl.set(id,c);
  send(ws,{k:'hi',id});send(ws,{k:'posts',list:posts.slice(0,40)});bcast({k:'peers',list:peers()});
  ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch{return}
    const now=Date.now();c.t=c.t.filter(x=>now-x<1000);if(c.t.push(now)>40)return;
    if(m.k==='pres'&&m.patch&&typeof m.patch==='object'){const P=m.patch;
      if('name' in P)c.p.name=String(P.name).slice(0,20);
      if('av' in P)c.p.av=(typeof P.av==='string'&&P.av.startsWith('data:image/')&&P.av.length<8000)?P.av:undefined;
      for(const k of['voice','sp'])if(k in P)c.p[k]=P[k]?true:undefined;
      if('vt' in P)c.p.vt=+P.vt||undefined;
      bcast({k:'peers',list:peers()})}
    else if(m.k==='emit'){let d=m.data||{};
      if(m.topic==='chat'){if(typeof d.t!=='string')return;d={t:d.t.slice(0,300)}}
      else if(m.topic!=='sig')return;
      const o={k:'msg',topic:m.topic,data:d,peer:id};
      if(m.topic==='sig'&&d.to){const t=cl.get(d.to);t&&send(t.ws,o)}else bcast(o)}
    else if(m.k==='post'){const p=m.post||{};if(typeof p.title!=='string'||!p.title.trim())return;
      const img=typeof p.img==='string'&&p.img.startsWith('data:image/')&&p.img.length<200000?p.img:'';
      posts.unshift({name:String(c.p.name||'Anonim').slice(0,20),title:p.title.slice(0,60),desc:String(p.desc||'').slice(0,300),img,ts:Date.now()});
      posts=posts.slice(0,100);save();bcast({k:'posts',list:posts.slice(0,40)})}});
  ws.on('close',()=>{cl.delete(id);bcast({k:'peers',list:peers()})})});
srv.listen(PORT,()=>console.log('SA-MP Hub jalan di port '+PORT));
