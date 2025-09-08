// Atendimento Pro — Contato Digital (V7.1.4 — Hard padrão)
// Painel de Objetivo substituído por Feedback em tempo real na sidebar.

const $ = (s)=>document.querySelector(s);
const $$ = (s)=>document.querySelectorAll(s);

function escapeHtml(str=''){
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
function nowTime(){ const d=new Date(); return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
function onlyDigits(v){ return String(v ?? '').replace(/\D/g,''); }
function formatCPF(d){ const s=onlyDigits(d).slice(0,11); let out=''; if(s.length>0) out=s.substring(0,3); if(s.length>=4) out+='.'+s.substring(3,6); if(s.length>=7) out+='.'+s.substring(6,9); if(s.length>=10) out+='-'+s.substring(9,11); return out; }
function applyTokens(text=''){
  const name = $('#playerName')?.value?.trim() || 'Cliente';
  return text.replace(/\[Nome\]/g, name);
}

function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

// ===== Cenário =====
const MISSAO_I = {
  id:'mod1_missao1', title:'Missão I — Capacitação Digital (Hard padrão)',
  summary:'Abordagem diferenciada → CadOK (atualização) → Tabulação correta → Finalização empática.',
  startNode:'abordagem_inicio_pf',
  nodes:{
    abordagem_inicio_pf:{
      customerVariants:{
        happy:'Oi! Tudo bem? Recebi sua mensagem. Sobre o que se trata? 😊',
        neutral:'Oi. Em que posso ajudar?',
        annoyed:'Oi. Fala direto, por favor. Tô sem tempo.',
        rude:'Diz logo o que é. Não posso perder tempo.'
      },
      options:[
        { text:'Seja bem-vindo! Para seguirmos com segurança, confirma seu nome e apenas os dois últimos dígitos do CPF, combinado?', next:'valida_pf_minima', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+6}, tag:'best' },
        { text:'Perfeito! Para sua segurança conforme a política, confirme seu nome e os dois dígitos finais do CPF, tudo bem?', next:'valida_pf_minima', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+5}, tag:'very_good' },
        { text:'Pra agilizar, confirma seu nome e os quatro últimos dígitos do CPF (conforme LGPD)?', next:'alerta_lgpd', effects:{empatia:-1,resolucao:0,tempo:+1,satisf:-10}, tag:'trap_compliance' },
        { text:'Vamos direto ao ponto? Me diz o problema e depois validamos o resto.', next:'friction_tom', effects:{empatia:-1,resolucao:+1,tempo:+1,satisf:-6}, tag:'trap_tone' }
      ]
    },
    alerta_lgpd:{
      customerVariants:{
        happy:'Enviar documento aqui? Não me sinto confortável…',
        neutral:'Isso é seguro?',
        annoyed:'Não vou mandar documento por chat.',
        rude:'Nem pensar em mandar RG aqui.'
      },
      options:[
        { text:'Você tem razão. Vamos pelo caminho seguro: confirmo seu nome e só os dois últimos dígitos do CPF, ok?', next:'valida_pf_minima', effects:{empatia:+2,resolucao:+1,tempo:+1,satisf:+10}, tag:'best' },
        { text:'Podemos validar pelo e-mail cadastrado; se preferir, eu te envio link seguro para confirmar os dados.', next:'valida_pf_minima', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+8}, tag:'very_good' },
        { text:'Tudo bem: apenas uma selfie com documento e resolvemos rapidinho.', next:'alerta_lgpd', effects:{empatia:-3,resolucao:-1,tempo:0,satisf:-16}, tag:'trap_doc' },
        { text:'Sem documento não tem atendimento, ok?', next:'friction_tom', effects:{empatia:-3,resolucao:-1,tempo:0,satisf:-14}, tag:'trap_tone' }
      ]
    },
    valida_pf_minima:{
      customerVariants:{
        happy:'Claro! Meu nome é Ana Silva. CPF termina em 34. 😊',
        neutral:'Ana Silva, termina em 34.',
        annoyed:'Ana, 34. Pode agilizar?',
        rude:'Ana. 34. E aí?'
      },
      options:[
        { text:'Obrigado, Ana! Apenas para validar, me informe o melhor canal e horário de contato?', next:'cadok_intro', effects:{empatia:+1,tempo:+1,satisf:+6}, tag:'best' },
        { text:'Perfeito. Para confirmar direitinho, informa o CPF completo? É rapidinho.', next:'alerta_lgpd', effects:{empatia:-2,resolucao:0,tempo:0,satisf:-12}, tag:'trap_doc' },
        { text:'Obrigado! Pra não tomar seu tempo, seguimos sem validar contatos agora, pode ser?', next:'cadok_pula', effects:{empatia:-1,resolucao:+1,tempo:+1,satisf:-4}, tag:'trap_skip' },
        { text:'Legal! Atualizo o contato depois e já te apresento as condições.', next:'cadok_pula', effects:{empatia:0,resolucao:+1,tempo:+1,satisf:-3}, tag:'ok' }
      ]
    },
    cadok_intro:{
      customerVariants:{
        happy:'Prefiro WhatsApp à tarde. Meu e-mail continua o mesmo.',
        neutral:'WhatsApp. Pode ser à tarde.',
        annoyed:'Só WhatsApp. Evita ligar.',
        rude:'Só manda no Whats.'
      },
      options:[
        { text:'Anotado! Registrei WhatsApp à tarde como preferido. Posso confirmar e-mail (terminando em @exemplo.com) e celular final 7788?', next:'cadok_confirm', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+6}, tag:'best' },
        { text:'Perfeito. Confirma pra mim o e-mail completo e o número de celular com DDD?', next:'cadok_confirm', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+4}, tag:'very_good' },
        { text:'Pra validar, manda os 6 últimos do cartão e o CPF inteiro (política interna).', next:'alerta_lgpd', effects:{empatia:-3,resolucao:-1,tempo:0,satisf:-18}, tag:'trap_compliance' },
        { text:'Vamos seguindo sem checar isso agora pra ganhar tempo.', next:'cadok_pula', effects:{empatia:-1,resolucao:+1,tempo:+1,satisf:-6}, tag:'trap_skip' }
      ]
    },
    cadok_confirm:{
      agentAuto:'Preferências e dados atualizados com sucesso (CadOK).',
      customerVariants:{
        happy:'Ótimo! Podemos falar das condições?',
        neutral:'Certo. E agora?',
        annoyed:'Tá, e a proposta?',
        rude:'Beleza. Fala logo a oferta.'
      },
      options:[
        { text:'Você foi selecionada para uma oportunidade de negociação. Posso explicar as condições e prazo?', next:'oferta_negociacao', effects:{resolucao:+1,tempo:+1,satisf:+4}, tag:'best' },
        { text:'Vamos direto à oferta então? Posso resumir e combinar a data.', next:'oferta_negociacao', effects:{empatia:0,resolucao:+1,tempo:+1,satisf:+2}, tag:'ok' }
      ]
    },
    oferta_negociacao:{
      customerVariants:{
        happy:'Claro, pode explicar. 😊',
        neutral:'Pode falar.',
        annoyed:'Seja direto, por favor.',
        rude:'Fala logo.'
      },
      options:[
        { text:'Tenho uma condição especial válida até a data combinada. Posso detalhar e seguimos?', next:'tabulacao_intro', effects:{resolucao:+1,tempo:+1,satisf:+4}, tag:'best' },
        { text:'Seguimos rápido: se fechar hoje, te passo a condição, senão perde a oportunidade.', next:'friction_tom', effects:{empatia:-3,resolucao:-1,tempo:0,satisf:-16}, tag:'trap_pressure' },
        { text:'Explico as condições e, se fizer sentido, combinamos uma data realista?', next:'tabulacao_intro', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+4}, tag:'very_good' },
        { text:'Posso pular detalhes pra não tomar seu tempo e já marcar a data?', next:'tabulacao_intro', effects:{empatia:-1,resolucao:0,tempo:+2,satisf:-4}, tag:'trap_time' }
      ]
    },
    tabulacao_intro:{
      agentAuto:'Antes de encerrar, vou registrar o atendimento (tabulação) com clareza para dar continuidade quando precisar.',
      customerVariants:{
        happy:'Legal! O que você vai registrar?',
        neutral:'Ok. O que será registrado?',
        annoyed:'Tá… e o que você vai anotar?',
        rude:'E daí? O que vai anotar?'
      },
      options:[
        { text:'Motivo do contato, condições oferecidas, objeções, acordo e próximos passos.', next:'finalizacao_intro', effects:{resolucao:+1,tempo:+1,satisf:+6}, tag:'best' },
        { text:'Motivo do contato, condições e próximos passos.', next:'finalizacao_intro', effects:{resolucao:0,tempo:+1,satisf:+2}, tag:'partial' },
        { text:'Motivo do contato, objeções e acordo.', next:'finalizacao_intro', effects:{resolucao:0,tempo:+1,satisf:+1}, tag:'partial' },
        { text:'Tabular só “cliente orientado”.', next:'finalizacao_intro', effects:{resolucao:-1,tempo:0,satisf:-8}, tag:'trap_short' }
      ]
    },
    finalizacao_intro:{
      customerVariants:{
        happy:'Obrigado pelo retorno e pela explicação! 😊',
        neutral:'Ok.',
        annoyed:'Beleza.',
        rude:'Tá.'
      },
      options:[
        { text:'Obrigado pelo seu tempo, [Nome]! Pra garantir a condição, é importante pagar até a data combinada. Qualquer dúvida, fico por aqui!', next:'wrapup_ok', effects:{empatia:+1,tempo:+1,satisf:+7}, tag:'best' },
        { text:'Foi um prazer! Se surgir algo, nossos canais: 4004 2125 ou 0800 726 2125, seg–sex, 08h–21h.', next:'wrapup_ok', effects:{empatia:+1,tempo:0,satisf:+5}, tag:'very_good' },
        { text:'Qualquer dúvida, me chama — lembrando que se não pagar hoje, perde tudo.', next:'wrapup_ok', effects:{empatia:-3,resolucao:-1,tempo:0,satisf:-16}, tag:'trap_pressure' },
        { text:'Agradeço a conversa. Encerrando por aqui.', next:'wrapup_ok', effects:{empatia:-1,tempo:+1,satisf:-4}, tag:'dry' }
      ]
    },
    friction_tom:{
      customerVariants:{
        happy:'Achei meio seco, mas podemos continuar.',
        neutral:'Certo. E agora?',
        annoyed:'Esse tom não ajuda…',
        rude:'Desse jeito não dá.'
      },
      options:[
        { text:'Desculpe pelo tom, Ana. Vou cuidar disso com atenção e respeito. Podemos confirmar rapidamente seus dados para seguir?', next:'valida_pf_minima', effects:{empatia:+2,satisf:+10}, tag:'recover' },
        { text:'Se não gostar, procure outro canal.', next:'friction_tom', effects:{empatia:-3,satisf:-15}, tag:'trap' }
      ]
    },
    cadok_pula:{
      customerVariants:{
        happy:'Ok, mas prefiro que atualizem meu WhatsApp depois.',
        neutral:'Não vai atualizar meu contato!?',
        annoyed:'Eu queria ajustar meu contato, mas tudo bem…',
        rude:'Vocês nem checaram meus dados.'
      },
      options:[
        { text:'Você tem razão, é importante manter os dados atualizados. Podemos confirmar rapidinho?', next:'cadok_intro', effects:{empatia:+1,satisf:+6}, tag:'recover' },
        { text:'Não precisa disso. Vamos seguir.', next:'oferta_negociacao', effects:{resolucao:+1,satisf:-4}, tag:'skip' }
      ]
    },
    wrapup_ok:{ end:'resolved' }
  }
};

const SCENARIOS = [MISSAO_I];

// ===== Estado =====
const state = {
  currentScenarioIndex:0,
  currentNodeKey:'start',
  satisfaction:50,
  metrics:{ empatia:0, resolucao:0, tempo:0, total:0 },
  optionShownAt:0,
  lastDecisionTag:null,
  lastDecisionDt:0,
  visitedStages:new Set()
};
function currentScenario(){ return SCENARIOS[state.currentScenarioIndex]; }
function nodeByKey(k){ return currentScenario().nodes[k]; }

// ===== Métricas =====
function updateMetricsUI(){
  $('#mEmpatia').textContent = state.metrics.empatia;
  $('#mResolucao').textContent = state.metrics.resolucao;
  $('#mTempo').textContent = state.metrics.tempo;
}
function computeTotal(){ const tempoPenalty = Math.max(0, state.metrics.tempo - 3); state.metrics.total = state.metrics.empatia + state.metrics.resolucao + Math.max(0, 7 - tempoPenalty); }
function medalFromScore(){ const t = state.metrics.total; if (t >= 15) return '🥇'; if (t >= 11) return '🥈'; if (t >= 8) return '🥉'; return '🏅'; }
function applyEffects(effects={}){ const m=state.metrics; if('empatia' in effects) m.empatia+=effects.empatia; if('resolucao' in effects) m.resolucao+=effects.resolucao; if('tempo' in effects) m.tempo+=effects.tempo; if('satisf' in effects) state.satisfaction=Math.max(0,Math.min(100,state.satisfaction+effects.satisf)); updateMetricsUI(); }

// ===== Chat render =====
function renderCustomerMessage(text){ if(!text) return; const el=document.createElement('div'); el.className='msg customer'; el.innerHTML=`${escapeHtml(applyTokens(text))}<div class="meta"><span>${nowTime()}</span><span class="status">• recebido</span></div>`; const w=$('#chatWindow'); w.appendChild(el); w.scrollTop=w.scrollHeight; }
function renderAgentMessage(text){ const el=document.createElement('div'); el.className='msg agent'; el.innerHTML=`${escapeHtml(applyTokens(text))}<div class="meta"><span>${nowTime()}</span><span class="status" data-status>✓</span></div>`; const w=$('#chatWindow'); w.appendChild(el); w.scrollTop=w.scrollHeight; setTimeout(()=>{ const s=el.querySelector('[data-status]'); if(s) s.textContent='✓✓'; },650); }
function typing(on){ const t=$('#typing'); if(t) t.classList.toggle('hidden', !on); const hs=$('#headerStatus'); if(hs) hs.textContent = on ? 'online • digitando…' : 'online'; }

function renderOptions(options=[]) { const wrap=$('#options'); wrap.innerHTML=''; const list = shuffle(options.slice(0,4)); list.forEach((opt,i)=>{ const b=document.createElement('button'); b.className='option'; b.addEventListener('click', () =>chooseOptionByRef(opt)); const kbd=`<span class="kbd">${i+1}</span>`; b.innerHTML=`<span>${escapeHtml(applyTokens(opt.text))}</span>${kbd}`; wrap.appendChild(b); }); const first=wrap.querySelector('.option'); if(first) first.focus(); state.optionShownAt = performance.now(); }

// ===== Feedback lateral =====
function toneInfo(){
  if(state.satisfaction>=75) return {label:'Feliz', emoji:'😊'};
  if(state.satisfaction>=50) return {label:'Neutro', emoji:'🙂'};
  if(state.satisfaction>=25) return {label:'Irritado', emoji:'😠'};
  return {label:'Rude', emoji:'😤'};
}
function decisionInfo(tag){
  const map = {
    best:           {label:'Excelente',        emoji:'✅', type:'ok'},
    very_good:      {label:'Muito bom',        emoji:'👍', type:'ok'},
    ok:             {label:'Ok',               emoji:'ℹ️', type:'ok'},
    recover:        {label:'Recuperação',      emoji:'🛠️', type:'ok'},
    partial:        {label:'Parcial',          emoji:'📝', type:'warn'},
    dry:            {label:'Frio',             emoji:'💬', type:'warn'},
    skip:           {label:'Pulou etapa',      emoji:'⏭️', type:'warn'},
    trap:           {label:'Pegadinha',        emoji:'⚠️', type:'warn'},
    trap_time:      {label:'Atalho arriscado', emoji:'⏱️', type:'warn'},
    trap_short:     {label:'Tabulação ruim',   emoji:'🧾', type:'warn'},
    trap_doc:       {label:'Excesso de dados', emoji:'🔒', type:'danger'},
    trap_pressure:  {label:'Pressão indevida', emoji:'⛔', type:'danger'},
    trap_compliance:{label:'LGPD inválido',    emoji:'🚫', type:'danger'}
  };
  return map[tag] || {label:'Ação', emoji:'💡', type:'ok'};
}
function complianceBadge(tag){
  const riskDanger = ['trap_doc','trap_compliance'];
  const riskWarn   = ['trap_pressure','trap_time','trap_short','trap','dry','partial','skip'];
  if(riskDanger.includes(tag)) return {text:'Risco LGPD', cls:'danger'};
  if(riskWarn.includes(tag)) return {text:'Atenção', cls:'warn'};
  return {text:'OK', cls:'ok'};
}
const STAGE_ORDER = ['Abordagem','Validação','CadOK','Negociação','Tabulação','Finalização'];
function stageFromNode(k){
  if(!k) return 'Abordagem';
  if(k.startsWith('abordagem')) return 'Abordagem';
  if(k.startsWith('valida')) return 'Validação';
  if(k.startsWith('cadok')) return 'CadOK';
  if(k.startsWith('oferta')) return 'Negociação';
  if(k.startsWith('tabulacao')) return 'Tabulação';
  if(k.startsWith('finalizacao') || k.startsWith('wrapup')) return 'Finalização';
  if(k.startsWith('friction')) return 'Abordagem';
  return 'Abordagem';
}
function renderStages(){
  const ul = $('#fbStages');
  if(!ul) return;
  ul.innerHTML='';
  STAGE_ORDER.forEach(st=>{
    const li = document.createElement('li');
    const done = state.visitedStages.has(st);
    li.className = done ? 'done' : '';
    li.innerHTML = `<span class="dot"></span>${st}`;
    ul.appendChild(li);
  });
}
function updateFeedbackPanel(){
  const tone = toneInfo();
  $('#fbTone').textContent = `${tone.emoji} ${tone.label}`;

  const di = decisionInfo(state.lastDecisionTag);
  $('#fbDecision').textContent = `${di.emoji} ${di.label}`;

  const cb = complianceBadge(state.lastDecisionTag);
  const badgeEl = $('#fbCompliance');
  if(badgeEl){ badgeEl.textContent = cb.text; badgeEl.className = `badge ${cb.cls}`; }

  const dt = state.lastDecisionDt || 0;
  let paceLabel = '—';
  if(dt>0){ paceLabel = dt>4 ? 'Lento' : (dt>2 ? 'Moderado' : 'Rápido'); }
  $('#fbPace').textContent = paceLabel;

  // Atualiza estágio visitado
  const stage = stageFromNode(state.currentNodeKey);
  state.visitedStages.add(stage);
  renderStages();
}

// ===== Fluxo =====
function chooseOptionByRef(opt){ 
  renderAgentMessage(opt.text);

  // Captura tempo de resposta e última decisão
  const dt=(performance.now()-state.optionShownAt)/1000; 
  state.lastDecisionDt = dt;
  state.lastDecisionTag = opt?.tag || null;

  // Feedback visual (chip) e auto-reply de negociação
  showDecisionFeedback(opt);
  if (handleNegotiationAutoReply()) { updateFeedbackPanel(); return; }

  if(opt.effects) applyEffects(opt.effects);
  if(dt>4){ state.metrics.tempo+=2; } else if(dt>2){ state.metrics.tempo+=1; } 
  updateMetricsUI(); 
  updateFeedbackPanel();

  const nextKey=opt.next||state.currentNodeKey; 
  const nextNode=nodeByKey(nextKey); 
  if(nextNode?.agentAuto){ 
    typing(true); 
    setTimeout(()=>{ 
      typing(false); 
      renderAgentMessage(nextNode.agentAuto); 
      proceedToNode(nextKey); 
    },650);
  } else { 
    proceedToNode(nextKey);
  } 
}

function proceedToNode(key){ 
  state.currentNodeKey=key; 
  updateFeedbackPanel();
  const node=nodeByKey(key); 
  const tone= state.satisfaction>=75?'happy': state.satisfaction>=50?'neutral': state.satisfaction>=25?'annoyed':'rude'; 
  const msg=node.customerVariants? node.customerVariants[tone]:null; 
  if(msg){ typing(true); setTimeout(()=>{ typing(false); renderCustomerMessage(msg); renderOptions(node.options); },520);} else { renderOptions(node.options);} 
  if(node.end){ setTimeout(()=>{ finishScenario(); setScreen('#end-screen'); },800);} 
}

function startScenario(){ 
  state.metrics={ empatia:0, resolucao:0, tempo:0, total:0 }; 
  state.satisfaction=50; 
  state.visitedStages = new Set();
  state.lastDecisionTag=null; 
  state.lastDecisionDt=0; 
  updateMetricsUI(); 

  $('#chatWindow').innerHTML='<div class="day-sep"><span>Hoje</span></div>'; 
  $('#headerCust').textContent='Cliente'; 
  $('#headerStatus').textContent='online'; 
  state.currentNodeKey=currentScenario().startNode; 
  const first = nodeByKey(state.currentNodeKey).customerVariants?.['neutral'] ?? 'Olá!'; 
  renderCustomerMessage(first); 
  renderOptions(nodeByKey(state.currentNodeKey).options); 
  updateFeedbackPanel();
}

function setScreen(id){ $$('.screen').forEach(s=>s.classList.remove('active')); const d=$(id); if(d) d.classList.add('active'); }
function finishScenario(){ computeTotal(); $('#endEmpatia').textContent=state.metrics.empatia; $('#endResolucao').textContent=state.metrics.resolucao; $('#endTempo').textContent=state.metrics.tempo; $('#endTotal').textContent=state.metrics.total; $('#endMedalha').textContent=medalFromScore(); }

// ===== Bindings =====
function bind(){ const start=()=>{ setScreen('#game-screen'); startScenario(); }; $('#btnStart')?.addEventListener('click', start); $('#playerName')?.addEventListener('keydown', e=>{ if(e.key==='Enter') start(); }); $('#playerCPF')?.addEventListener('keydown', e=>{ if(e.key==='Enter') start(); }); $('#themeToggle')?.addEventListener('click', (ev)=>{ const b=ev.target.closest('button'); if(!b) return; $$('#themeToggle button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); const t=b.dataset.theme; document.body.classList.toggle('theme-light', t==='light'); }); $('#btnReplay')?.addEventListener('click', ()=>{ setScreen('#start-screen'); }); const cpfInput=$('#playerCPF'); if(cpfInput){ const m=(e)=>{ e.target.value = formatCPF(e.target.value); }; cpfInput.addEventListener('input', m); cpfInput.addEventListener('blur', m); } document.addEventListener('keydown',(e)=>{ const gameVisible = $('#game-screen').classList.contains('active'); if(!gameVisible) return; const n=parseInt(e.key,10); if(n>=1 && n<=4){ const btn=document.querySelector(`#options .option:nth-child(${n})`); if(btn){ e.preventDefault(); btn.click(); }} if(e.key==='Enter'){ const focused=document.activeElement; if(focused?.classList.contains('option')){ e.preventDefault(); focused.click(); }} }); }

document.addEventListener('DOMContentLoaded', bind);

// ===== Reutilizados =====
function handleNegotiationAutoReply() {
  if (state.currentNodeKey !== 'oferta_negociacao') return false;
  const tone = state.satisfaction >= 75 ? 'happy' : state.satisfaction >= 50 ? 'neutral' : state.satisfaction >= 25 ? 'annoyed' : 'rude';
  let response = ''; let nextKey  = '';
  if (tone === 'happy') { response = 'Perfeito! Aceito a proposta. 😊'; nextKey  = 'tabulacao_intro'; }
  else if (tone === 'neutral') { response = 'Ok, podemos seguir com essa proposta.'; nextKey  = 'tabulacao_intro'; }
  else if (tone === 'annoyed') { response = 'Prefiro não aceitar agora, mas pode registrar.'; nextKey  = 'tabulacao_intro'; }
  else { response = 'Não quero seguir com isso. Encerrando.'; nextKey  = 'wrapup_ok'; }
  typing(true);
  setTimeout(() => { typing(false); renderCustomerMessage(response); proceedToNode(nextKey); }, 600);
  return true;
}

function showDecisionFeedback(opt){
  try{
    const info = decisionInfo(opt?.tag);
    const chat = $('#chatWindow'); if(!chat) return;
    const chip = document.createElement('div');
    chip.setAttribute('role','status');
    chip.style.cssText = [
      'align-self:flex-end',
      'max-width:76%',
      'background:var(--panel-2)',
      'border:1px solid var(--line)',
      'color:var(--text)',
      'padding:8px 10px',
      'border-radius:12px',
      'margin-top:4px',
      'font-size:12px',
      'opacity:0',
      'transform:translateY(4px)',
      'transition:opacity .18s ease, transform .18s ease'
    ].join(';');
    chip.innerHTML = `<strong>${info.emoji} ${info.label}</strong>`;
    chat.appendChild(chip); chat.scrollTop = chat.scrollHeight;
    requestAnimationFrame(()=>{ chip.style.opacity = '1'; chip.style.transform = 'translateY(0)'; });
    setTimeout(()=>chip.remove(), 1400);
  }catch(e){}
}
