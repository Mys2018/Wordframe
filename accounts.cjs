const {DatabaseSync}=require('node:sqlite');
const {randomBytes,scryptSync,timingSafeEqual,createHash,createCipheriv,createDecipheriv}=require('node:crypto');
const digest=s=>createHash('sha256').update(s).digest('hex');
const equal=(a,b)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)};
function accounts({file,secure=true,encryptionKey}) {
 const secretKey=typeof encryptionKey==='string'&&/^[a-f0-9]{64}$/i.test(encryptionKey)?Buffer.from(encryptionKey,'hex'):null;
 const db=new DatabaseSync(file);
 db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL, progress TEXT); CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS ai_quota (user_id INTEGER PRIMARY KEY, started INTEGER NOT NULL, used INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS ai_credentials (user_id INTEGER PRIMARY KEY, source TEXT NOT NULL, iv TEXT, tag TEXT, ciphertext TEXT); CREATE TABLE IF NOT EXISTS ai_preferences (user_id INTEGER PRIMARY KEY, model TEXT NOT NULL);');
 const attempts=new Map();
 const json=(res,status,data,cookie)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})});res.end(JSON.stringify(data));};
 const session=req=>{const token=(req.headers.cookie??'').match(/(?:^|;\s*)wf_session=([a-f0-9]{64})(?:;|$)/)?.[1];return token?db.prepare('SELECT users.id,users.name,users.progress FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token=? AND sessions.expires>?').get(digest(token),Date.now()):undefined};
 const cookie=(token,age)=>`wf_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure?'; Secure':''}`;
 async function handle(req,res,path){
  if(!path.startsWith('/api/account/'))return false;
  if(req.method==='GET'&&path==='/api/account/me') {const u=session(req);json(res,200,{user:u?{id:u.id,name:u.name}:null,progress:u?.progress?JSON.parse(u.progress):null});return true}
  if(req.method!=='POST'||req.headers['sec-fetch-site']!=='same-origin'||!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']??'')){json(res,403,{error:'Недопустимый запрос.'});return true}
  let raw=''; try {for await(const chunk of req){raw+=chunk;if(raw.length>2_000_000){json(res,413,{error:'Слишком много данных.'});return true}}}catch{json(res,400,{error:'Ошибка запроса.'});return true}
  let data;try{data=JSON.parse(raw)}catch{json(res,400,{error:'Ошибка запроса.'});return true}
  if(path==='/api/account/logout'){const t=(req.headers.cookie??'').match(/(?:^|;\s*)wf_session=([a-f0-9]{64})(?:;|$)/)?.[1];if(t)db.prepare('DELETE FROM sessions WHERE token=?').run(digest(t));json(res,200,{ok:true},cookie('',0));return true}
  if(path==='/api/account/progress'){const u=session(req);if(!u){json(res,401,{error:'Войди в аккаунт.'});return true}if(!data.progress||typeof data.progress!=='object'||Array.isArray(data.progress)){json(res,400,{error:'Ошибка данных.'});return true}db.prepare('UPDATE users SET progress=? WHERE id=?').run(JSON.stringify(data.progress),u.id);json(res,200,{ok:true});return true}
  if(path!=='/api/account/login'&&path!=='/api/account/register'){json(res,404,{error:'Не найдено.'});return true}
  const proxyIP=req.headers['x-wordframe-ip'];const addr=req.socket.remoteAddress==='127.0.0.1'&&typeof proxyIP==='string'&&/^[a-f0-9:.]{3,45}$/i.test(proxyIP)?proxyIP:(req.socket.remoteAddress??'');const now=Date.now();let item=attempts.get(addr);if(!item||now-item.start>900000)item={start:now,n:0};if(item.n>=12){json(res,429,{error:'Слишком много попыток. Подожди 15 минут.'});return true}item.n++;attempts.set(addr,item);if(attempts.size>1000)attempts.delete(attempts.keys().next().value);
  const name=typeof data.name==='string'?data.name.trim().toLowerCase():'';const password=data.password;
  if(!/^[a-z0-9_]{3,32}$/.test(name)||typeof password!=='string'||password.length<10||password.length>128){json(res,400,{error:'Логин: 3–32 латинских символа, цифры или _. Пароль: от 10 до 128 символов.'});return true}
  let user=db.prepare('SELECT * FROM users WHERE name=?').get(name);
  if(path.endsWith('register')){
   if(user){json(res,409,{error:'Этот логин уже занят.'});return true}
   const salt=randomBytes(16).toString('hex');const hash=scryptSync(password,salt,64).toString('hex');
   const id=db.prepare('INSERT INTO users (name,salt,hash) VALUES (?,?,?)').run(name,salt,hash).lastInsertRowid;user={id:Number(id),name};
  }else if(!user||!equal(scryptSync(password,user.salt,64).toString('hex'),user.hash)){json(res,401,{error:'Неверный логин или пароль.'});return true}
  const token=randomBytes(32).toString('hex');db.prepare('DELETE FROM sessions WHERE expires<?').run(now);db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(token),user.id,now+30*86400000);attempts.delete(addr);
  json(res,200,{user:{id:user.id,name:user.name},progress:user.progress?JSON.parse(user.progress):null},cookie(token,30*86400));return true;
 }
 function aiSettings(userId){
  const row=db.prepare('SELECT source,iv,tag,ciphertext FROM ai_credentials WHERE user_id=?').get(userId);
  const model=db.prepare('SELECT model FROM ai_preferences WHERE user_id=?').get(userId)?.model;
  if(!row)return {source:'shared',key:undefined,model};
  if(!row.ciphertext)return {source:row.source,key:undefined,model};
  if(!secretKey)throw Error('Ключ шифрования сервера не настроен.');
  const decipher=createDecipheriv('aes-256-gcm',secretKey,Buffer.from(row.iv,'hex'));
  decipher.setAAD(Buffer.from(String(userId)));decipher.setAuthTag(Buffer.from(row.tag,'hex'));
  const key=Buffer.concat([decipher.update(Buffer.from(row.ciphertext,'hex')),decipher.final()]).toString('utf8');
  return {source:row.source,key,model};
 }
 function saveAiSettings(userId,source,key,model){
  let row=db.prepare('SELECT iv,tag,ciphertext FROM ai_credentials WHERE user_id=?').get(userId)||{};
  if(key){if(!secretKey)throw Error('Ключ шифрования сервера не настроен.');
   const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',secretKey,iv);cipher.setAAD(Buffer.from(String(userId)));
   const encrypted=Buffer.concat([cipher.update(key,'utf8'),cipher.final()]);row={iv:iv.toString('hex'),tag:cipher.getAuthTag().toString('hex'),ciphertext:encrypted.toString('hex')};}
  db.prepare('INSERT INTO ai_credentials(user_id,source,iv,tag,ciphertext) VALUES (?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET source=excluded.source,iv=excluded.iv,tag=excluded.tag,ciphertext=excluded.ciphertext').run(userId,source,row.iv??null,row.tag??null,row.ciphertext??null);
  if(model)db.prepare('INSERT INTO ai_preferences(user_id,model) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET model=excluded.model').run(userId,model);
 }
 function quota(userId,amount=0,now=Date.now()) {
  const limit=500,windowMs=5*60*60*1000;
  let row=db.prepare('SELECT started,used FROM ai_quota WHERE user_id=?').get(userId);
  if(!row || now >= row.started+windowMs)row={started:now,used:0};
  const available=Math.max(0,limit-row.used);
  if(amount>available)return {limit,remaining:available,resetsAt:row.started+windowMs,allowed:false};
  if(amount){db.prepare('INSERT INTO ai_quota (user_id,started,used) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET started=excluded.started,used=excluded.used').run(userId,row.started,row.used+amount);row.used+=amount}
  return {limit,remaining:Math.max(0,limit-row.used),resetsAt:row.used?row.started+windowMs:null,allowed:true};
 }
 return {handle,session,quota,aiSettings,saveAiSettings,close:()=>db.close()};
}
module.exports={accounts};
