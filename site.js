/* Shared header (hamburger menu) and footer. Edit SITE to change your details. */
var SITE={
  name:"Quiz Maker",
  email:"your-email@example.com",
  youtube:"",
  /* Participant tracking: fill in ONE option and leave the other empty */
  api:"",                      /* Option A: Google Apps Script web app URL */
  supabase:{url:"https://jxrpgsxsmthrmqdvgzov.supabase.co",key:"sb_publishable_s8CCQ3Bfye8JGfMD8oxj4g_9ZACVVBu"}    /* Option B: Supabase Project URL and anon public key */
};
var Store={
  sb:function(){return !!(SITE.supabase&&SITE.supabase.url&&SITE.supabase.key)},
  on:function(){return Store.sb()||!!SITE.api},
  h:function(){return {apikey:SITE.supabase.key,Authorization:"Bearer "+SITE.supabase.key,"Content-Type":"application/json"}},
  rpc:async function(fn,body){var r=await fetch(SITE.supabase.url.replace(/\/$/,"")+"/rest/v1/rpc/"+fn,{method:"POST",headers:Store.h(),body:JSON.stringify(body)});return {ok:r.ok,j:await r.json()}},
  submit:async function(d){
    if(Store.sb()){await fetch(SITE.supabase.url.replace(/\/$/,"")+"/rest/v1/results",{method:"POST",headers:Object.assign(Store.h(),{Prefer:"return=minimal"}),
      body:JSON.stringify({quiz_id:d.id,title:d.title,channel:d.channel,name:d.name,score:d.score,total:d.total,pts:d.pts,pct:d.pct,sec:d.sec})});return}
    await fetch(SITE.api,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain"},body:JSON.stringify(d)})},
  board:async function(q){
    if(Store.sb())return (await Store.rpc("get_board",{q:q})).j;
    return await (await fetch(SITE.api+"?quiz="+encodeURIComponent(q))).json()},
  all:async function(k){
    if(Store.sb()){var r=await Store.rpc("get_all",{k:k});return r.ok&&Array.isArray(r.j)?{rows:r.j}:{error:"bad key"}}
    return await (await fetch(SITE.api+"?action=all&key="+encodeURIComponent(k))).json()}
};
(function(){
var player=location.hash.indexOf("#q=")===0; /* quiz-only share links: no menu */
var pages=[["index.html","🧠","Make quiz"],["dashboard.html","📊","Dashboard"],["about.html","ℹ️","About us"],["contact.html","✉️","Contact us"]];
var cur=location.pathname.split("/").pop()||"index.html";
function link(p){return '<a href="'+p[0]+'"'+(cur===p[0]?' aria-current="page"':'')+'>'+p[1]+' '+p[2]+'</a>'}
var f=document.createElement("footer");f.className="site-f";
f.innerHTML=player?'<p>Made with 🧠 '+SITE.name+'</p>':'<div class="fg"><div><b>🧠 '+SITE.name+'</b><p>Turn any list of questions into a fun, shareable quiz.</p></div><div><b>Pages</b>'+pages.map(link).join("")+'</div><div><b>Get in touch</b><a href="contact.html">✉️ Contact us</a>'+(SITE.youtube?'<a href="'+SITE.youtube+'">📺 YouTube</a>':'')+'</div></div><p class="copy">© '+new Date().getFullYear()+' '+SITE.name+'. All rights reserved.</p>';
if(player)f.classList.add("p");
document.body.appendChild(f);
if(player)return;
var h=document.createElement("header");h.className="site-h";
h.innerHTML='<a class="logo" href="index.html"><i>🧠</i>'+SITE.name+'</a><button class="hb" id="hb" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">☰</button>';
var d=document.createElement("nav");d.id="drawer";d.className="drawer";d.setAttribute("aria-label","Main menu");
d.innerHTML='<button class="x" id="hx" aria-label="Close menu">✕</button>'+pages.map(link).join("");
var o=document.createElement("div");o.className="ov";
document.body.insertBefore(h,document.body.firstChild);document.body.appendChild(d);document.body.appendChild(o);
var hb=document.getElementById("hb"),hx=document.getElementById("hx");
function t(on){d.classList.toggle("open",on);o.classList.toggle("open",on);hb.setAttribute("aria-expanded",on);(on?hx:hb).focus()}
hb.onclick=function(){t(true)};hx.onclick=function(){t(false)};o.onclick=function(){t(false)};
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&d.classList.contains("open"))t(false)});
})();
