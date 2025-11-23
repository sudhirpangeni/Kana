// Kana lists (basic + dakuten/handakuten + small kana)
const hiraganaList = [["a","あ"],["i","い"],["u","う"],["e","え"],["o","お"],["ka","か"],["ki","き"],["ku","く"],["ke","け"],["ko","こ"],["ga","が"],["gi","ぎ"],["gu","ぐ"],["ge","げ"],["go","ご"],["pa","ぱ"],["pi","ぴ"],["pu","ぷ"],["pe","ぺ"],["po","ぽ"],["kya","きゃ"],["sha","しゃ"],["cha","ちゃ"],["small-ya","ゃ"],["small-tsu","っ"]];
const katakanaList = [["a","ア"],["i","イ"],["u","ウ"],["e","エ"],["o","オ"],["ka","カ"],["ki","キ"],["ku","ク"],["ke","ケ"],["ko","コ"],["ga","ガ"],["gi","ギ"],["gu","グ"],["ge","ゲ"],["go","ゴ"],["pa","パ"],["pi","ピ"],["pu","プ"],["pe","ペ"],["po","ポ"],["kya","キャ"],["sha","シャ"],["cha","チャ"],["small-ya","ャ"],["small-tsu","ッ"]];

let currentMode='hiragana';
let currentPool = hiraganaList.slice();
let current=null;

// DOM refs
const tabs=document.querySelectorAll('.tab');
const qEl=document.getElementById('question');
const aEl=document.getElementById('answer');
const showBtn=document.getElementById('showBtn');
const nextBtn=document.getElementById('nextBtn');
const clearBtn=document.getElementById('clearBtn');
const darkToggle=document.getElementById('darkToggle');
const speakBtn=document.getElementById('speakBtn');

// Dark mode
darkToggle.addEventListener('click',()=>{
  if(document.documentElement.getAttribute('data-theme')==='dark'){
    document.documentElement.setAttribute('data-theme','');
    localStorage.setItem('theme','light');
  } else{
    document.documentElement.setAttribute('data-theme','dark');
    localStorage.setItem('theme','dark');
  }
});
if(localStorage.getItem('theme')==='dark') document.documentElement.setAttribute('data-theme','dark');

// Tabs
tabs.forEach(t=>t.addEventListener('click',()=>{
  currentMode=t.dataset.mode;
  tabs.forEach(tab=>tab.classList.remove('active'));
  t.classList.add('active');
  if(currentMode==='hiragana') currentPool=hiraganaList.slice();
  else if(currentMode==='katakana') currentPool=katakanaList.slice();
  else currentPool=hiraganaList.concat(katakanaList);
  nextQuestion();
}));

// Next / Show
function nextQuestion(){
  current=currentPool[Math.floor(Math.random()*currentPool.length)];
  qEl.textContent=current[0];
  aEl.style.display='none';
  aEl.textContent='';
  clearCanvas();
}
function showAnswer(){
  if(!current) return;
  if(currentMode==='both'){
    const h=hiraganaList.find(x=>x[0]===current[0]);
    const k=katakanaList.find(x=>x[0]===current[0]);
    aEl.textContent=`${h?h[1]:''} / ${k?k[1]:''}`;
  } else aEl.textContent=current[1];
  aEl.style.display='block';
}
showBtn.addEventListener('click',showAnswer);
nextBtn.addEventListener('click',nextQuestion);

// Audio
speakBtn.addEventListener('click',()=>{
  if(!current) return;
  let textToSpeak=currentMode==='katakana'?(katakanaList.find(x=>x[0]===current[0])||[null,''])[1]:(hiraganaList.find(x=>x[0]===current[0])||[null,''])[1];
  if(!textToSpeak) textToSpeak=current[1];
  const u=new SpeechSynthesisUtterance(textToSpeak);
  u.lang='ja-JP'; u.rate=0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
});

// Canvas
const canvas=document.getElementById('draw'); const ctx=canvas.getContext('2d');
function resizeCanvas(){ const r=canvas.getBoundingClientRect(); canvas.width=r.width; canvas.height=r.height; ctx.lineWidth=8; ctx.lineCap='round'; ctx.strokeStyle=window.getComputedStyle(document.documentElement).getPropertyValue('--text'); }
window.addEventListener('resize',resizeCanvas); resizeCanvas();
let drawing=false;
canvas.addEventListener('pointerdown',e=>{drawing=true;ctx.beginPath();ctx.moveTo(e.offsetX,e.offsetY);});
canvas.addEventListener('pointermove',e=>{if(!drawing) return; ctx.lineTo(e.offsetX,e.offsetY); ctx.stroke();});
canvas.addEventListener('pointerup',()=>drawing=false);
canvas.addEventListener('pointercancel',()=>drawing=false);
function clearCanvas(){ctx.clearRect(0,0,canvas.width,canvas.height);}
clearBtn.addEventListener('click',clearCanvas);

// Initialize
nextQuestion();
