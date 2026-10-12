(function(){
var $=function(i){return document.getElementById(i)};
var SAMPLE="🇯🇵 What is the capital of Japan? | Tokyo 🗼\n🐘 Which animal never forgets, says the saying? | Elephant\n🌍 Which planet do we live on? | Earth\n🍎 Which fruit is said to keep the doctor away? | Apple\n🧊 What is frozen water called? | Ice\n🐝 Which insect makes honey? | Bee 🍯";
var mode="mc",items=[],order=[],i=0,score=0,locked=false,missed=[],streak=0,results=[],tm=null,limit=0,share="",pts=0,used50=false,skipsLeft=3,at=null,ac=null,snd=true,player=false,W={easy:1,medium:2,hard:3};

function parse(t){
  var out=[],lines=t.split(/\r?\n/);
  for(var k=0;k<lines.length;k++){
    var ln=lines[k].trim();if(!ln)continue;
    var qa=ln.match(/^Q\s*[:.)-]\s*(.+)$/i);
    if(qa&&k+1<lines.length){var an=lines[k+1].trim().match(/^A\s*[:.)-]\s*(.+)$/i);
      if(an){out.push({q:qa[1].trim(),a:an[1].trim()});k++;continue}}
    var m=ln.match(/^(.+?)\s*(?:\||::|\t)\s*(.+)$/);
    if(m){var p=m[2].split(/\s*(?:\||::)\s*/),o={q:m[1].trim(),a:p[0].trim(),f:"",d:""};
      for(var z=1;z<p.length;z++){var w=p[z].trim(),dm=w.toLowerCase().replace(/[^a-z]/g,"");
        if(dm==="easy"||dm==="medium"||dm==="hard")o.d=dm;else if(w)o.f=w}
      out.push(o)}
  }
  return out;
}
function shuffle(a){a=a.slice();for(var n=a.length-1;n>0;n--){var j=Math.floor(Math.random()*(n+1));var t=a[n];a[n]=a[j];a[j]=t}return a}
function norm(s){return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,"").replace(/\s+/g,"").trim()}
function brand(){
  var c=$("chan").value.trim(),t=$("title").value.trim();
  var h=(c?'<div class="ch"></div>':'')+'<div class="tt"></div>';
  ["brand1","brand2"].forEach(function(id){
    var el=$(id);el.innerHTML=h;
    if(c)el.querySelector(".ch").textContent="📺 "+c;
    el.querySelector(".tt").textContent="🎬 "+(t||"Quiz Time")+" 🎯";
  });
  var ct=$("ctain").value.trim();$("cta").textContent=ct||(c?"👍 Like · 🔔 Subscribe · 💬 Comment your score on "+c+"! 🎉":"👍 Like · 🔔 Subscribe · 💬 Comment your score! 🎉");
  if(!player)try{localStorage.setItem("qm_chan",c);localStorage.setItem("qm_cta",ct)}catch(e){}
}
function rain(list){
  for(var n=0;n<24;n++){var d=document.createElement("span");d.className="rain";
    d.textContent=list[n%list.length];d.style.left=(Math.random()*95)+"vw";
    d.style.animationDuration=(2+Math.random()*2.5)+"s";d.style.animationDelay=(Math.random()*.8)+"s";
    document.body.appendChild(d);(function(x){setTimeout(function(){x.remove()},5500)})(d);}
}
function show(id){["setup","play","done","welcome"].forEach(function(s){$(s).classList.toggle("hide",s!==id)});window.scrollTo(0,0)}
function setMode(m){mode=m;$("m-mc").setAttribute("aria-pressed",m==="mc");$("m-ty").setAttribute("aria-pressed",m==="ty")}

$("m-mc").onclick=function(){setMode("mc")};
$("m-ty").onclick=function(){setMode("ty")};
function updDet(){var n=parse($("src").value).length;$("det").textContent=n?"✅ "+n+" question"+(n===1?"":"s")+" detected":"👆 Paste your questions above"}
$("src").oninput=updDet;
$("sample").onclick=function(){$("src").value=SAMPLE;$("err").textContent="";updDet()};
$("clear").onclick=function(){$("src").value="";updDet();$("src").focus()};
var TH=["","#E5254B","#0E9F6E","#1E6BFF","#E8590C","#C026D3"];
function setTheme(c){var r=document.documentElement.style;
  if(c){r.setProperty("--acc",c);r.setProperty("--accfg","#fff")}else{r.removeProperty("--acc");r.removeProperty("--accfg")}
  Array.prototype.forEach.call($("sw").children,function(b){b.setAttribute("aria-pressed",b.dataset.c===c)});
  try{if(!player)localStorage.setItem("qm_th",c)}catch(e){}}
TH.forEach(function(c){var b=document.createElement("button");b.dataset.c=c;b.style.background=c||"#4F46E5";
  b.setAttribute("aria-label","Theme color");b.onclick=function(){setTheme(c)};$("sw").appendChild(b)});
$("copy").onclick=function(){var b=this;
  function ok(){b.textContent="✅ Copied!";setTimeout(function(){b.textContent="📋 Copy result"},1800)}
  function old(){var t=document.createElement("textarea");t.value=share;document.body.appendChild(t);t.select();try{document.execCommand("copy");ok()}catch(e){}t.remove()}
  try{navigator.clipboard.writeText(share).then(ok,old)}catch(e){old()}};
document.addEventListener("keydown",function(e){
  if($("play").classList.contains("hide")||locked||mode!=="mc"||e.target.tagName==="INPUT")return;
  var k="abcd1234".indexOf(e.key.toLowerCase());if(k<0)return;var b=$("opts").children[k%4];if(b)b.click()});
$("start").onclick=function(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume()}catch(e){}
  items=parse($("src").value);
  var uniq={};items.forEach(function(x){uniq[norm(x.a)]=1});
  if(items.length<2){$("err").textContent="⚠️ Add at least 2 lines like: Question | Answer";return}
  if(mode==="mc"&&Object.keys(uniq).length<3){$("err").textContent="⚠️ Multiple choice needs at least 3 different answers. Add more lines or pick Type answer.";return}
  $("err").textContent="";begin();
};
function begin(){
  brand();var n=parseInt($("cnt").value,10)||items.length;
  order=shuffle(items).slice(0,n);i=0;score=0;pts=0;streak=0;results=[];missed=[];used50=false;skipsLeft=3;clearTimeout(at);document.body.classList.toggle("stream",$("stream").value==="1");
  limit=parseInt($("tmr").value,10)||0;st=Date.now();show("play");countdown(render);
}
function countdown(cb){
  var g=$("go"),seq=["3️⃣","2️⃣","1️⃣","🚀"],n=0;g.classList.remove("hide");
  (function t(){g.innerHTML='<span class="pop">'+seq[n]+'</span><p>Get ready! 🎬</p>';n++;
    if(n<seq.length)setTimeout(t,700);else setTimeout(function(){g.classList.add("hide");cb()},600)})();
}
function tone(f,d,t,w,v){if(!snd||!ac)return;try{var o=ac.createOscillator(),g=ac.createGain(),s=ac.currentTime+(w||0);o.type=t||"sine";o.frequency.value=f;g.gain.setValueAtTime(v||.15,s);g.gain.exponentialRampToValueAtTime(.001,s+d);o.connect(g);g.connect(ac.destination);o.start(s);o.stop(s+d)}catch(e){}}
function sfx(k){if(k==="ok"){tone(660,.15,"sine",0);tone(880,.25,"sine",.12)}else if(k==="bad"){tone(160,.35,"sawtooth",0,.12)}else if(k==="tick"){tone(1000,.06,"square",0,.06)}else if(k==="win"){[523,659,784,1047].forEach(function(f,n){tone(f,.25,"triangle",n*.13)})}}
function scoreTxt(){$("sc").textContent="⭐ "+pts+(streak>=2?"  🔥 "+streak:"")}
function startTimer(){
  clearInterval(tm);var tb=$("tbar");$("tsec").textContent="";
  if(!limit){tb.classList.add("hide");return}
  tb.classList.remove("hide","low");var t0=Date.now(),f=$("tfill"),lastsec=0;f.style.width="100%";
  tm=setInterval(function(){var left=limit*1000-(Date.now()-t0);
    if(left<=0){clearInterval(tm);f.style.width="0";timeUp();return}
    f.style.width=(left/(limit*1000)*100)+"%";var sec=Math.ceil(left/1000);
    $("tsec").textContent="⏱️ "+sec+"s";tb.classList.toggle("low",sec<=5);if(sec<=3&&sec!==lastsec)sfx("tick");lastsec=sec},100);
}
function timeUp(){
  if(locked)return;locked=true;var it=order[i];
  Array.prototype.forEach.call($("opts").children,function(b){b.disabled=true;if(norm(b.lastChild.textContent)===norm(it.a))b.classList.add("ok")});
  $("ans").disabled=true;$("check").disabled=true;feedback(false,"⏰ no answer");
}
function render(){
  var it=order[i];locked=false;startTimer();clearTimeout(at);
  var bd={easy:"🟢 Easy",medium:"🟡 Medium",hard:"🔴 Hard"}[it.d],bg=$("badge");
  bg.textContent=bd||"";bg.classList.toggle("hide",!bd);
  $("ll5").disabled=used50;$("ll5").classList.toggle("hide",mode!=="mc");$("llskip").disabled=skipsLeft<=0;$("llskip").textContent="⏭️ Skip ("+skipsLeft+")";
  $("prog").textContent="Question "+(i+1)+" / "+order.length;
  var L=order.length,ms=["💡 Think it through!","🎯 Stay focused!","🌟 You're doing great!","💪 Keep the energy up!","🚀 Nice pace, keep going!","✨ Trust yourself!"];
  $("mot").textContent=i===0?"🎯 Let's go! You've got this! 💪":i===L-1&&L>1?"🏁 Final question! Finish strong! 🔥":(L>=4&&i===Math.floor(L/2))?"🔥 Halfway there! Keep it up!":ms[i%ms.length];
  scoreTxt();
  $("fill").style.width=(i/order.length*100)+"%";
  $("qtext").textContent=it.q;
  $("fb").className="fb";$("nextrow").classList.add("hide");
  var o=$("opts");o.innerHTML="";
  if(mode==="mc"){
    $("typebox").classList.add("hide");
    var seen={};seen[norm(it.a)]=1;var pool=[];
    shuffle(items).forEach(function(x){var k=norm(x.a);if(!seen[k]&&pool.length<3){seen[k]=1;pool.push(x.a)}});
    var choices=shuffle(pool.concat([it.a]));
    choices.forEach(function(c,n){
      var b=document.createElement("button");b.className="opt";
      b.innerHTML='<span class="l">'+"ABCD"[n]+'</span><span></span>';
      b.lastChild.textContent=c;
      b.onclick=function(){pick(b,c)};
      o.appendChild(b);
    });
  }else{
    $("typebox").classList.remove("hide");$("ans").value="";$("ans").disabled=false;$("check").disabled=false;
    setTimeout(function(){$("ans").focus()},50);
  }
}
function pick(btn,c){
  if(locked)return;locked=true;
  var it=order[i],right=norm(c)===norm(it.a);
  Array.prototype.forEach.call($("opts").children,function(b){
    b.disabled=true;
    if(norm(b.lastChild.textContent)===norm(it.a))b.classList.add("ok");
  });
  if(!right)btn.classList.add("bad");
  feedback(right,c);
}
function check(){
  if(locked)return;var v=$("ans").value.trim();if(!v)return;
  locked=true;$("ans").disabled=true;$("check").disabled=true;
  feedback(norm(v)===norm(order[i].a),v);
}
function feedback(right,given){
  var it=order[i],f=$("fb");clearInterval(tm);streak=right?streak+1:0;results.push(right?"✅":"❌");
  if(right){score++;pts+=(W[it.d]||1);f.textContent=pick1(["🎉 Correct!","✅ Nailed it!","🔥 Yes! Great job!","🙌 Right on!","🤩 Brilliant!","💯 Perfect!"])}
  else{missed.push({q:it.q,a:it.a,g:given});f.textContent=(given.indexOf("⏰")===0?"⏰ Time's up!":"😅 Not quite.")+" Answer: "+it.a}
  f.className="fb show "+(right?"ok":"bad");
  if(right&&streak>=3)f.textContent="🔥 "+streak+" in a row! Unstoppable!";
  if(!right)f.textContent+="\n"+pick1(["💪 Keep going, you've got this!","🌱 Every mistake is a step forward!","🚀 The next one is yours!","✨ Don't give up, you're learning!"]);
  if(it.f)f.textContent+="\n💡 "+it.f;
  sfx(right?"ok":"bad");$("ll5").disabled=true;$("llskip").disabled=true;
  clearTimeout(at);if($("auto").value==="1")at=setTimeout(function(){$("next").click()},it.f?4500:3000);
  scoreTxt();
  $("next").textContent=i===order.length-1?"🏁 See results":"Next ➡️";
  $("nextrow").classList.remove("hide");$("next").focus();
}
function pick1(a){return a[Math.floor(Math.random()*a.length)]}
$("check").onclick=check;
$("ans").onkeydown=function(e){if(e.key==="Enter")check()};
$("next").onclick=function(){clearTimeout(at);i++;if(i<order.length)render();else finish()};
function finish(){
  $("fill").style.width="100%";
  var pct=Math.round(score/order.length*100);
  var e=pct===100?"🏆":pct>=80?"🎉":pct>=60?"😄":pct>=40?"🙂":"💪";
  var m=pct===100?"Perfect score! You're a quiz legend! 🌟👑":pct>=80?"Excellent work! You're on fire! 🔥":pct>=60?"Great job! A little more and you'll be a champion! 💪":pct>=40?"Good effort! Every try makes you better. Play again and beat your score! 🚀":"Don't worry! Every expert started here. Try again, you've got this! 🌱💪";
  var c=$("chan").value.trim(),t=$("title").value.trim();
  share="🎬 "+(t||"Quiz")+"\n🏆 "+score+"/"+order.length+" ("+pct+"%) ⭐ "+pts+" pts\n"+results.join("")+(c?"\n📺 "+c:"");
  $("trophy").textContent=e;$("final").textContent=score+" / "+order.length+" ("+pct+"%) · ⭐ "+pts+" pts";$("msg").textContent=m;
  var r=$("rev");r.innerHTML="";
  missed.forEach(function(x){
    var li=document.createElement("li");
    var b=document.createElement("b");b.textContent="❌ "+x.q;
    var s=document.createElement("small");s.textContent="✅ "+x.a+"   (you: "+x.g+")";
    li.appendChild(b);li.appendChild(s);r.appendChild(li);
  });
  show("done");
  if(player)submit(pct);
  if(pct>=60)sfx("win");if(pct>=60)rain(pct===100?["🏆","🎉","🌟","🎊","🥳"]:["🎉","⭐","👏","✨"]);
}
$("again").onclick=begin;
$("edit").onclick=function(){clearTimeout(at);document.body.classList.remove("stream");show("setup")};
$("snd").onclick=function(){snd=!snd;this.textContent=snd?"🔊":"🔇"};
$("ll5").onclick=function(){if(locked||used50)return;used50=true;this.disabled=true;var it=order[i],wrong=[];
  Array.prototype.forEach.call($("opts").children,function(b){if(norm(b.lastChild.textContent)!==norm(it.a))wrong.push(b)});
  shuffle(wrong).slice(0,Math.min(2,wrong.length-1)).forEach(function(b){b.disabled=true;b.style.visibility="hidden"})};
$("llskip").onclick=function(){if(locked||skipsLeft<=0)return;skipsLeft--;clearInterval(tm);clearTimeout(at);results.push("⏭️");i++;if(i<order.length)render();else finish()};
$("src").value=SAMPLE;
try{$("chan").value=localStorage.getItem("qm_chan")||"";$("ctain").value=localStorage.getItem("qm_cta")||""}catch(e){}
try{setTheme(localStorage.getItem("qm_th")||"")}catch(e){setTheme("")}
updDet();

var quizId="",pname="",st=0,curQuiz="";
function fmtD(t){var d=new Date(t);return isNaN(d)?"":d.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})+" "+d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
async function loadBoard(){var tb=$("lbtb");$("lbinfo").textContent="⏳ Loading...";
  try{var r=await Store.board(curQuiz);
    $("lbinfo").textContent=r.count?"👥 "+r.count+" participant"+(r.count===1?"":"s")+" so far"+(r.count>10?" · showing the top 10":""):"No participants yet. Share the link above and they will appear here.";
    tb.innerHTML="";r.top.forEach(function(x,n){var tr=document.createElement("tr");
      [["🥇","🥈","🥉"][n]||n+1,x.name,x.score+"/"+x.total,x.pts,fmtD(x.t)].forEach(function(v){var c=document.createElement("td");c.textContent=v;tr.appendChild(c)});tb.appendChild(tr)})}
  catch(e){$("lbinfo").textContent="⚠️ Could not load. Check your results setup in site.js."}}
function api(){return !!(window.Store&&Store.on())}
function qid(o){var t=JSON.stringify([o.t,o.c,o.i]),h=5381;for(var k=0;k<t.length;k++)h=((h<<5)+h+t.charCodeAt(k))>>>0;return "q"+h.toString(36)}
function renderLB(r){var b=$("lb");b.innerHTML="";var h=document.createElement("h3");h.textContent="🏆 Leaderboard · "+r.count+" player"+(r.count===1?"":"s");b.appendChild(h);
  var ol=document.createElement("ol");ol.className="lbl";
  r.top.forEach(function(x,n){var li=document.createElement("li");if(x.name===pname&&x.pts===pts)li.className="me";
    li.innerHTML="<span></span><b></b><i></i>";li.children[0].textContent=["🥇","🥈","🥉"][n]||(n+1);
    li.children[1].textContent=x.name;li.children[2].textContent=x.score+"/"+x.total+" · ⭐ "+x.pts;ol.appendChild(li)});
  b.appendChild(ol)}
async function submit(pct){
  var b=$("lb");b.classList.add("hide");b.innerHTML="";if(!api()||!quizId)return;
  b.classList.remove("hide");b.innerHTML='<p class="sub" style="text-align:center">⏳ Saving your score…</p>';
  var d={id:quizId,title:$("title").value.trim(),channel:$("chan").value.trim(),name:pname,score:score,total:order.length,pts:pts,pct:pct,sec:Math.round((Date.now()-st)/1000)};
  try{await Store.submit(d)}catch(e){}
  try{renderLB(await Store.board(quizId))}
  catch(e){b.innerHTML='<p class="sub" style="text-align:center">Score sent. The leaderboard is unavailable right now.</p>'}}
function b64e(u){var t="";for(var k=0;k<u.length;k++)t+=String.fromCharCode(u[k]);return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function b64d(t){t=t.replace(/-/g,"+").replace(/_/g,"/");while(t.length%4)t+="=";var r=atob(t),u=new Uint8Array(r.length);for(var k=0;k<r.length;k++)u[k]=r.charCodeAt(k);return u}
async function pack(o){var u=new TextEncoder().encode(JSON.stringify(o));
  try{var z=new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer());return "z"+b64e(z)}catch(e){return "p"+b64e(u)}}
async function unpack(t){var u=b64d(t.slice(1));
  if(t.charAt(0)==="z")u=new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
  return JSON.parse(new TextDecoder().decode(u))}

$("share").onclick=async function(){
  var list=parse($("src").value),u={};list.forEach(function(x){u[norm(x.a)]=1});
  if(list.length<2){$("err").textContent="⚠️ Add at least 2 lines like: Question | Answer";return}
  if(mode==="mc"&&Object.keys(u).length<3){$("err").textContent="⚠️ Multiple choice needs at least 3 different answers. Add more lines or pick Type answer.";return}
  $("err").textContent="";
  var o={t:$("title").value.trim(),c:$("chan").value.trim(),x:$("ctain").value.trim(),m:mode,tm:$("tmr").value,n:$("cnt").value,a:$("auto").value,s:$("stream").value,
    th:document.documentElement.style.getPropertyValue("--acc").trim(),
    i:list.map(function(x){return [x.q,x.a,x.f||"",x.d||""]})};
  o.id=qid(o);var url=location.href.split("#")[0]+"#q="+await pack(o);
  $("slink").value=url;$("sharebox").classList.remove("hide");
  curQuiz=o.id;$("dlink").href="dashboard.html#id="+o.id;
  if(api()){$("rl").textContent="";$("lbpanel").classList.remove("hide");loadBoard()}
  else{$("lbpanel").classList.add("hide");$("rl").textContent="📊 To track participants and a leaderboard, add your results link in site.js (see setup steps)."}
  $("snote").textContent=url.length>6000?"⚠️ This link is very long. If it fails to open in some apps, use fewer questions.":"Participants who open this link see only the quiz, not this maker page.";
  $("sharebox").scrollIntoView({behavior:"smooth",block:"center"});$("slink").select();
};
$("lbref").onclick=loadBoard;
$("copylink").onclick=function(){var b=this,t=$("slink").value;
  function ok(){b.textContent="✅ Copied!";setTimeout(function(){b.textContent="📋 Copy link"},1800)}
  function old(){$("slink").select();try{document.execCommand("copy");ok()}catch(e){}}
  try{navigator.clipboard.writeText(t).then(ok,old)}catch(e){old()}};
$("wstart").onclick=function(){
  var nm=$("pname").value.trim();
  if(api()&&quizId&&!nm){$("werr").textContent="⚠️ Please enter your name";$("pname").focus();return}
  pname=nm;$("werr").textContent="";try{localStorage.setItem("qm_name",nm)}catch(e){}
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume()}catch(e){}begin()};
(async function(){
  if(location.hash.indexOf("#q=")!==0)return;
  var o;try{o=await unpack(location.hash.slice(3))}catch(e){return}
  player=true;
  items=o.i.map(function(a){return{q:a[0],a:a[1],f:a[2],d:a[3]}});
  setMode(o.m);$("title").value=o.t||"";$("chan").value=o.c||"";$("ctain").value=o.x||"";
  $("tmr").value=o.tm;$("cnt").value=o.n;$("auto").value=o.a;$("stream").value=o.s;setTheme(o.th||"");
  $("edit").classList.add("hide");document.title=o.t||"Quiz";
  quizId=o.id||"";if(api()&&quizId){$("nameBox").classList.remove("hide");try{$("pname").value=localStorage.getItem("qm_name")||""}catch(e){}}
  $("wtitle").textContent="🎬 "+(o.t||"Quiz Time")+" 🎯";$("wchan").textContent=o.c?"📺 "+o.c:"";
  var n=Math.min(items.length,parseInt(o.n,10)||items.length),tm=parseInt(o.tm,10)||0;
  $("winfo").textContent="📝 "+n+" questions"+(tm?"  ·  ⏱️ "+tm+"s each":"");
  show("welcome");
})();
})();
