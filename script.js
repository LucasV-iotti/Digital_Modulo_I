
// Atendimento Pro — Contato Digital (V7.1.4 — Hard padrão)
// Atualizações: removeu estágio "Validação"; moveu CadOK para o final (após Tabulação e antes da Finalização);
// manteve mensagem inicial do agente com nome aleatório do cliente.

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
  const agent = $('#playerName')?.value?.trim() || 'Agente';
  const cliente = state.customerName || 'Cliente';
  return String(text)
    .replace(/\[Nome\]/g, cliente)
    .replace(/\[Agente\]/g, agent);
}

function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

function randomCustomerName(){
  const nomes = ['Ana','Bruno','Carla','Diego','Eduarda','Felipe','Giovana','Heitor','Isabela','João','Karina','Lucas','Marina','Nicolas','Olívia','Paulo','Quésia','Rafaela','Sérgio','Tainá','Ulisses','Vitória','Willian','Yasmin','Zeca'];
  return nomes[Math.floor(Math.random()*nomes.length)];
}

// ===== Cenário =====
const MISSAO_I = {
  id:'mod1_missao1', title:'Missão I — Capacitação Digital (Hard padrão)',
  customerName:'Ana',
  summary:'Abordagem → Negociação → Tabulação → CadOK → Finalização.',
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
        { text:'Claro! Posso te apresentar rapidamente a oportunidade e, se fizer sentido, seguimos?', next:'oferta_negociacao', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+5}, tag:'best' },
        { text:'Posso resumir a oferta e depois alinhamos os próximos passos?', next:'oferta_negociacao', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+4}, tag:'very_good' },
        { text:'Posso pular direto para a proposta?', next:'oferta_negociacao', effects:{empatia:0,resolucao:+1,tempo:+1,satisf:+1}, tag:'ok' },
        { text:'Vamos direto: diga o problema agora e depois eu vejo o resto.', next:'friction_tom', effects:{empatia:-2,resolucao:+1,tempo:+1,satisf:-8}, tag:'trap_tone' }
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
        { text:'Você tem razão. Vamos pelo caminho seguro e validar apenas o necessário em canal protegido, ok?', next:'oferta_negociacao', effects:{empatia:+2,resolucao:+1,tempo:+1,satisf:+10}, tag:'best' },
        { text:'Podemos validar pelo e-mail cadastrado; se preferir, envio um link seguro.', next:'oferta_negociacao', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+8}, tag:'very_good' },
        { text:'Tudo bem: apenas uma selfie com documento e resolvemos rapidinho.', next:'alerta_lgpd', effects:{empatia:-3,resolucao:-1,tempo:0,satisf:-16}, tag:'trap_doc' },
        { text:'Sem documento não tem atendimento, ok?', next:'friction_tom', effects:{empatia:-3,resolucao:-1,tempo:0,satisf:-14}, tag:'trap_tone' }
      ]
    },
    // Nó legado mantido para recuperações; mapeado para estágio Abordagem.
    valida_pf_minima:{
      customerVariants:{
        happy:'Claro! Meu nome é [Nome]. CPF termina em 34. 😊',
        neutral:'[Nome], termina em 34.',
        annoyed:'[Nome], 34. Pode agilizar?',
        rude:'[Nome]. 34. E aí?'
      },
      options:[
        { text:'Obrigado, [Nome]! Vamos direto às condições e prazos?', next:'oferta_negociacao', effects:{empatia:+1,tempo:+1,satisf:+5}, tag:'best' },
        { text:'Perfeito. Para confirmar direitinho, informa o CPF completo? É rapidinho.', next:'alerta_lgpd', effects:{empatia:-2,resolucao:0,tempo:0,satisf:-12}, tag:'trap_doc' },
        { text:'Seguimos sem checar nada agora e já partimos pra oferta, pode ser?', next:'oferta_negociacao', effects:{empatia:-1,resolucao:+1,tempo:+1,satisf:-4}, tag:'trap_skip' },
        { text:'Deixa que atualizo depois e já apresento as condições.', next:'oferta_negociacao', effects:{empatia:0,resolucao:+1,tempo:+1,satisf:-3}, tag:'ok' }
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
      agentAuto:'Antes de encerrar, vou registrar o atendimento (tabulação) com clareza para continuidade quando precisar.',
      customerVariants:{
        happy:'Legal! O que você vai registrar?',
        neutral:'Ok. O que será registrado?',
        annoyed:'Tá… e o que você vai anotar?',
        rude:'E daí? O que vai anotar?'
      },
      options:[
        { text:'Motivo do contato, condições oferecidas, objeções, acordo e próximos passos.', next:'cadok_final_intro', effects:{resolucao:+1,tempo:+1,satisf:+6}, tag:'best' },
        { text:'Motivo do contato, condições e próximos passos.', next:'cadok_final_intro', effects:{resolucao:0,tempo:+1,satisf:+2}, tag:'partial' },
        { text:'Motivo do contato, objeções e acordo.', next:'cadok_final_intro', effects:{resolucao:0,tempo:+1,satisf:+1}, tag:'partial' },
        { text:'Tabular só “cliente orientado”.', next:'cadok_final_intro', effects:{resolucao:-1,tempo:0,satisf:-8}, tag:'trap_short' }
      ]
    },

    // === CadOK no final ===
    cadok_final_intro:{
      customerVariants:{
        happy:'Antes de encerrar, quer ajustar seus dados de contato?',
        neutral:'Quer atualizar contato antes de fechar?',
        annoyed:'Vai demorar? Se for rápido…',
        rude:'Se for rápido, fala.'
      },
      options:[
        { text:'Anotado! Qual canal e horário prefere para contatos futuros?', next:'cadok_final_confirm', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+5}, tag:'best' },
        { text:'Podemos confirmar e-mail e celular (sem dados sensíveis), tudo bem?', next:'cadok_final_confirm', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+4}, tag:'very_good' },
        { text:'Pulamos isso agora e encerramos direto.', next:'finalizacao_intro', effects:{empatia:0,resolucao:0,tempo:+1,satisf:-2}, tag:'ok' },
        { text:'Não precisa disso, vamos encerrar.', next:'finalizacao_intro', effects:{empatia:-1,resolucao:0,tempo:+1,satisf:-5}, tag:'dry' }
      ]
    },
    cadok_final_confirm:{
      agentAuto:'Preferências e dados atualizados com sucesso (CadOK).',
      customerVariants:{
        happy:'Perfeito, obrigado!',
        neutral:'Certo.',
        annoyed:'Ok, segue.',
        rude:'Tá.'
      },
      options:[
        { text:'Tudo certo por aqui. Posso seguir para a finalização?', next:'finalizacao_intro', effects:{empatia:+1,tempo:+1,satisf:+4}, tag:'ok' }
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
        { text:'Desculpe pelo tom, [Nome]. Vou cuidar disso com atenção e respeito. Podemos seguir para a proposta?', next:'oferta_negociacao', effects:{empatia:+2,satisf:+10}, tag:'recover' },
        { text:'Se não gostar, procure outro canal.', next:'friction_tom', effects:{empatia:-3,satisf:-15}, tag:'trap' }
      ]
    },

    // Nó legado, mantido caso algum fluxo externo referencie
    cadok_pula:{
      customerVariants:{
        happy:'Ok, mas prefiro que atualizem meu WhatsApp depois.',
        neutral:'Não vai atualizar meu contato!?',
        annoyed:'Eu queria ajustar meu contato, mas tudo bem…',
        rude:'Vocês nem checaram meus dados.'
      },
      options:[
        { text:'Você tem razão — deixo para o final do atendimento, combinado?', next:'oferta_negociacao', effects:{empatia:+1,satisf:+4}, tag:'recover' },
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
  visitedStages:new Set(),
  customerName:'Cliente'
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

function renderOptions(options=[]) { const wrap=$('#options'); if(!wrap) return; const arr = Array.isArray(options) ? options : []; wrap.innerHTML=''; const list = shuffle(arr.slice(0,4)); list.forEach((opt,i)=>{ const b=document.createElement('button'); b.className='option'; b.addEventListener('click', () =>chooseOptionByRef(opt)); const kbd=`<span class="kbd">${i+1}</span>`; b.innerHTML=`<span>${escapeHtml(applyTokens(opt.text))}</span>${kbd}`; wrap.appendChild(b); }); const first=wrap.querySelector('.option'); if(first) first.focus(); state.optionShownAt = performance.now(); }

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
    trap_compliance:{label:'LGPD inválido',    emoji:'🚫', type:'danger'},
    trap_tone:      {label:'Tom inadequado',   emoji:'🎯', type:'warn'}
  };
  return map[tag] || {label:'Ação', emoji:'💡', type:'ok'};
}
function complianceBadge(tag){
  const riskDanger = ['trap_doc','trap_compliance'];
  const riskWarn   = ['trap_pressure','trap_time','trap_short','trap','dry','partial','skip','trap_tone'];
  if(riskDanger.includes(tag)) return {text:'Risco LGPD', cls:'danger'};
  if(riskWarn.includes(tag)) return {text:'Atenção', cls:'warn'};
  return {text:'OK', cls:'ok'};
}

// === Estágios: sem "Validação" e com CadOK no final ===
const STAGE_ORDER = ['Abordagem','Negociação','Tabulação','CadOK','Finalização'];
function stageFromNode(k){
  if(!k) return 'Abordagem';
  if(k.startsWith('abordagem')) return 'Abordagem';
  if(k.startsWith('valida')) return 'Abordagem'; // Validação removida como estágio
  if(k.startsWith('oferta')) return 'Negociação';
  if(k.startsWith('tabulacao')) return 'Tabulação';
  if(k.startsWith('cadok')) return 'CadOK';
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

  const stage = stageFromNode(state.currentNodeKey);
  state.visitedStages.add(stage);
  renderStages();
}

// ===== Fluxo =====
function chooseOptionByRef(opt){ 
  renderAgentMessage(opt.text);

  const dt=(performance.now()-state.optionShownAt)/1000; 
  state.lastDecisionDt = dt;
  state.lastDecisionTag = opt?.tag || null;

  showDecisionFeedback(opt);
  if (handleNegotiationAutoReply(opt)) { updateFeedbackPanel(); return; }

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

  if(node.end){ 
    if(msg){ typing(true); setTimeout(()=>{ typing(false); renderCustomerMessage(msg); },520); }
    setTimeout(()=>{ finishScenario(); setScreen('#end-screen'); },800);
    return;
  }

  const opts = Array.isArray(node.options) ? node.options : [];
  if(msg){ typing(true); setTimeout(()=>{ typing(false); renderCustomerMessage(msg); renderOptions(opts); },520);} else { renderOptions(opts);} 
}

function startScenario(){ 
  state.metrics={ empatia:0, resolucao:0, tempo:0, total:0 }; 
  state.satisfaction=50; 
  state.visitedStages = new Set();
  state.lastDecisionTag=null; 
  state.lastDecisionDt=0; 
  state.customerName = randomCustomerName();
  updateMetricsUI(); 

  $('#chatWindow').innerHTML='<div class="day-sep"><span>Hoje</span></div>'; 
  $('#headerCust').textContent='Cliente'; 
  $('#headerStatus').textContent='online'; 
  state.currentNodeKey=currentScenario().startNode; 

  renderAgentMessage('Olá, [Nome]. Sou o(a) [Agente] do Santander e estou aqui para te ajudar');

  const first = nodeByKey(state.currentNodeKey).customerVariants?.['neutral'] ?? 'Olá!'; 
  typing(true);
  setTimeout(()=>{ 
    typing(false);
    renderCustomerMessage(first); 
    renderOptions(nodeByKey(state.currentNodeKey).options); 
    updateFeedbackPanel();
  }, 520);
}

function setScreen(id){ $$('.screen').forEach(s=>s.classList.remove('active')); const d=$(id); if(d) d.classList.add('active'); }
function finishScenario(){ computeTotal(); $('#endEmpatia').textContent=state.metrics.empatia; $('#endResolucao').textContent=state.metrics.resolucao; $('#endTempo').textContent=state.metrics.tempo; $('#endTotal').textContent=state.metrics.total; $('#endMedalha').textContent=medalFromScore(); }

function bind(){ const start=()=>{ setScreen('#game-screen'); startScenario(); }; $('#btnStart')?.addEventListener('click', start); $('#playerName')?.addEventListener('keydown', e=>{ if(e.key==='Enter') start(); }); $('#playerCPF')?.addEventListener('keydown', e=>{ if(e.key==='Enter') start(); }); $('#themeToggle')?.addEventListener('click', (ev)=>{ const b=ev.target.closest('button'); if(!b) return; $$('#themeToggle button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); const t=b.dataset.theme; document.body.classList.toggle('theme-light', t==='light'); }); $('#btnReplay')?.addEventListener('click', ()=>{ setScreen('#start-screen'); }); const cpfInput=$('#playerCPF'); if(cpfInput){ const m=(e)=>{ e.target.value = formatCPF(e.target.value); }; cpfInput.addEventListener('input', m); cpfInput.addEventListener('blur', m); } document.addEventListener('keydown',(e)=>{ const gameVisible = $('#game-screen').classList.contains('active'); if(!gameVisible) return; const n=parseInt(e.key,10); if(n>=1 && n<=4){ const btn=document.querySelector(`#options .option:nth-child(${n})`); if(btn){ e.preventDefault(); btn.click(); }} if(e.key==='Enter'){ const focused=document.activeElement; if(focused?.classList.contains('option')){ e.preventDefault(); focused.click(); }} }); }

document.addEventListener('DOMContentLoaded', bind);

function handleNegotiationAutoReply(opt) {
  if (state.currentNodeKey !== 'oferta_negociacao') return false;
  const allow = new Set(['best','very_good','ok']);
  if (!allow.has(opt?.tag)) return false;
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
