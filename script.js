
// Atendimento Pro — Contato Digital (V7.1.4 — Hard padrão)
// Update8: Tela de REVISÃO antes da pontuação final (transcrição + decisões + visão geral)
// Mantém: ordem Abordagem → Negociação → CadOK → Tabulação → Finalização; proposta escolhida pelo jogador; fix da duplicação; cliente fala primeiro.

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
function isoNow(){ return new Date().toISOString(); }
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

// === Estágios ===
const STAGE_ORDER = ['Abordagem','Negociação','CadOK','Tabulação','Finalização'];
function stageFromNode(k){
  if(!k) return 'Abordagem';
  if(k.startsWith('abordagem')) return 'Abordagem';
  if(k.startsWith('valida')) return 'Abordagem';
  if(k.startsWith('oferta')) return 'Negociação';
  if(k.startsWith('cadok')) return 'CadOK';
  if(k.startsWith('tabulacao')) return 'Tabulação';
  if(k.startsWith('finalizacao') || k.startsWith('wrapup')) return 'Finalização';
  if(k.startsWith('friction')) return 'Abordagem';
  return 'Abordagem';
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
function toneInfo(){
  if(state.satisfaction>=75) return {label:'Feliz', emoji:'😊'};
  if(state.satisfaction>=50) return {label:'Neutro', emoji:'🙂'};
  if(state.satisfaction>=25) return {label:'Irritado', emoji:'😠'};
  return {label:'Rude', emoji:'😤'};
}

// ===== Cenário (mesmo do update7) =====
const MISSAO_I = {
  id:'mod1_missao1', title:'Missão I — Capacitação Digital (Hard padrão)',
  summary:'Abordagem → Negociação → CadOK → Tabulação → Finalização',
  startNode:'abordagem_inicio_pf',
  nodes:{
    abordagem_inicio_pf:{
      customerVariants:{
  happy:'Oi! Tudo bem? Recebi sua mensagem. Sobre o que se trata? 😊',
        neutral:'Eu sou [Nome], preciso de auxílio com meu débito.',
        annoyed:'Oi. Fala direto, por favor. Tô sem tempo.',
        rude:'Diz logo o que é. Não posso perder tempo.'
      },
      options:[
        { text:'Posso te apresentar rapidamente uma oportunidade e, se fizer sentido, seguimos.', next:'oferta_negociacao', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+5}, tag:'best' },
        { text:'Posso te passar a oferta disponível e depois alinhamos os próximos passos.', next:'oferta_negociacao', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+4}, tag:'very_good' },
        { text:'Vou pular direto para a proposta e você me dá o seu ok.', next:'oferta_negociacao', effects:{empatia:0,resolucao:+1,tempo:+1,satisf:0}, tag:'ok' },
        { text:'Vamos ser diretos: Você vai querer pagar?', next:'friction_tom', effects:{empatia:-2,resolucao:+1,tempo:+1,satisf:-8}, tag:'trap_tone' }
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

    oferta_negociacao:{
      customerVariants:{
        happy:'Claro, pode explicar. 😊',
        neutral:'Qual seria a proposta?',
        annoyed:'Seja direto, por favor.',
        rude:'Fala logo.'
      },
      options:[
        { text:'É uma condição especial válida somente hoje, vou passar os detalhes, aguarde um momento.', next:'proposta_resposta', effects:{resolucao:+1,tempo:+1,satisf:+4}, tag:'best' },
        { text:'Seguimos rápido: se fechar hoje, te passo a condição, senão perde a oportunidade.', next:'friction_tom', effects:{empatia:-3,resolucao:-1,tempo:0,satisf:-16}, tag:'trap_pressure' },
        { text:'Vou explico as condições e, se fizer sentido, combinamos até o dia XX?', next:'proposta_resposta', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+4}, tag:'very_good' },
        { text:'Posso pular detalhes pra não tomar seu tempo e já marcar o pagamento?', next:'proposta_resposta', effects:{empatia:-1,resolucao:0,tempo:+2,satisf:-4}, tag:'trap_time' }
      ]
    },

    proposta_resposta:{
      customerVariants:{
        happy:'Perfeito! Aceito a proposta. 😊',
        neutral:'Fico no aguardo das condições',
        annoyed:'Seja objetivo, por favor.',
        rude:'Se for pra falar, seja direto.'
      },
      options:[
        { text:'Perfeito, [Nome]! Tenho uma condição especial válida até hoje e te envio pelo seu WhatsApp e E-mail.', next:'cadok_intro', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+5}, tag:'best' },
        { text:'A proposta é: condição especial + prazo alinhado. Te envio por WhatsApp/e-mail e seguimos.', next:'cadok_intro', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+4}, tag:'very_good' },
        { text:'Eu fecho o acordo hoje. Senão você perde a condição.', next:'cadok_intro', effects:{empatia:-2,resolucao:-1,tempo:0,satisf:-10}, tag:'trap_pressure' },
        { text:'Fecho o acordo e te envio um resumo da proposta e você valida depois.', next:'cadok_intro', effects:{empatia:0,resolucao:0,tempo:+1,satisf:+1}, tag:'ok' }
      ]
    },

    cadok_intro:{
      customerVariants:{
        happy:'Eu prefiro o WhatsApp. Meu e-mail continua o mesmo.',
        neutral:'Ótimo! Me envia das duas formas, por favor!',
        annoyed:'Tá! Depois te dou uma resposta.',
        rude:'Manda logo no e eu me viro.'
      },
      options:[
        { text:'Atualizando seu cadastro: seu e-mail é @exemplo.com e WhatsApp com celular final 7788?', next:'cadok_confirm', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+6}, tag:'best' },
        { text:'Perfeito. Vou mandar agora mesmo com as informações que tenho aqui', next:'tabulacao_intro', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+4}, tag:'very_good' },
        { text:'Pra validar, manda os 6 últimos do cartão e o CPF inteiro (política interna).', next:'alerta_lgpd', effects:{empatia:-3,resolucao:-1,tempo:0,satisf:-18}, tag:'trap_compliance' },
        { text:'Vamos seguindo sem checar isso agora pra ganhar tempo.', next:'tabulacao_intro', effects:{empatia:-1,resolucao:+1,tempo:+1,satisf:-6}, tag:'trap_skip' }
      ]
    },
    cadok_confirm:{
      agentAuto:'Dados atualizados com sucesso (CadOK).',
      customerVariants:{
        happy:'Ótimo! Podemos continuar.',
        neutral:'Muito obrigado pelo acordo',
        annoyed:'Tá. E depois?',
        rude:'Beleza. Segue.'
      },
      options:[
        { text:'Recapitulando antes de encerrarmos o atendimento, as condições de acordo foram: (Vendimento do Acordo | Valor de Pagamento | Quantidade de Parcelas)', next:'tabulacao_intro', effects:{resolucao:+1,tempo:+1,satisf:+3}, tag:'ok' }
      ]
    },

    tabulacao_intro:{
      agentAuto:'Vou registrar a nossa negociação com clareza para continuidade quando precisar.',
      customerVariants:{
        happy:'Legal! O que você vai registrar?',
        neutral:'Ok. O que será registrado?',
        annoyed:'Tá… e o que você vai anotar?',
        rude:'E daí? O que vai anotar?'
      },
      options:[
        { text:'Motivo do contato, condições oferecidas, objeções, acordo e próximos passos.', next:'finalizacao_intro', effects:{resolucao:+1,tempo:+1,satisf:+6}, tag:'best' },
        { text:'Motivo do contato, condições, próximos passos, conversas detalhadas.', next:'finalizacao_intro', effects:{resolucao:0,tempo:+1,satisf:+2}, tag:'partial' },
        { text:'Motivo do contato, suas objeções e detalhamento da negociação.', next:'finalizacao_intro', effects:{resolucao:0,tempo:+1,satisf:+1}, tag:'partial' },
        { text:'Tabular só “cliente orientado” e escrever o que aconteceu no nosso contato.', next:'finalizacao_intro', effects:{resolucao:-1,tempo:0,satisf:-8}, tag:'trap_short' }
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
  customerName:'Cliente',
  skipNextCustomerMsg:false,
  // Novo: logs e decisões para tela de revisão
  log:[],            // {role:'cliente'|'agente', text, time, iso, nodeKey, stage}
  decisions:[]       // {nodeKey, stage, text, tag, dt, effects, compliance, toneAt}
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

// ===== Logging =====
function logMessage(role, text){
  state.log.push({ role, text:applyTokens(text), time:nowTime(), iso:isoNow(), nodeKey:state.currentNodeKey, stage:stageFromNode(state.currentNodeKey) });
}
function logDecision(opt, dt){
  const info = decisionInfo(opt?.tag);
  const cb   = complianceBadge(opt?.tag);
  state.decisions.push({
    nodeKey: state.currentNodeKey,
    stage: stageFromNode(state.currentNodeKey),
    text: applyTokens(opt?.text||''),
    tag: opt?.tag||null,
    dt: Number(dt?.toFixed?.(2) ?? dt),
    effects: opt?.effects || {},
    compliance: cb,
    toneAt: toneInfo()
  });
}

// ===== Chat render =====
function renderCustomerMessage(text){ if(!text) return; const el=document.createElement('div'); el.className='msg customer'; const t=applyTokens(text); el.innerHTML=`${escapeHtml(t)}<div class="meta"><span>${nowTime()}</span><span class="status">• recebido</span></div>`; const w=$('#chatWindow'); w.appendChild(el); w.scrollTop=w.scrollHeight; logMessage('cliente', t); }
function renderAgentMessage(text){ const el=document.createElement('div'); el.className='msg agent'; const t=applyTokens(text); el.innerHTML=`${escapeHtml(t)}<div class="meta"><span>${nowTime()}</span><span class="status" data-status>✓</span></div>`; const w=$('#chatWindow'); w.appendChild(el); w.scrollTop=w.scrollHeight; setTimeout(()=>{ const s=el.querySelector('[data-status]'); if(s) s.textContent='✓✓'; },650); logMessage('agente', t); }
function typing(on){ const t=$('#typing'); if(t) t.classList.toggle('hidden', !on); const hs=$('#headerStatus'); if(hs) hs.textContent = on ? 'online • digitando…' : 'online'; }

function renderOptions(options=[]) { const wrap=$('#options'); if(!wrap) return; const arr = Array.isArray(options) ? options : []; wrap.innerHTML=''; const list = shuffle(arr.slice(0,4)); list.forEach((opt,i)=>{ const b=document.createElement('button'); b.className='option'; b.addEventListener('click', () =>chooseOptionByRef(opt)); const kbd=`<span class="kbd">${i+1}</span>`; b.innerHTML=`<span>${escapeHtml(applyTokens(opt.text))}</span>${kbd}`; wrap.appendChild(b); }); const first=wrap.querySelector('.option'); if(first) first.focus(); state.optionShownAt = performance.now(); }

// ===== Feedback lateral =====
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
  logDecision(opt, dt);
  showDecisionFeedback(opt);
  if (handleNegotiationAutoReply(opt)) { updateFeedbackPanel(); return; }
  if(opt.effects) applyEffects(opt.effects);
  if(dt>4){ state.metrics.tempo+=2; } else if(dt>2){ state.metrics.tempo+=1; }
  updateMetricsUI(); updateFeedbackPanel();
  const nextKey=opt.next||state.currentNodeKey; 
  const nextNode=nodeByKey(nextKey); 
  if(nextNode?.agentAuto){ typing(true); setTimeout(()=>{ typing(false); renderAgentMessage(nextNode.agentAuto); proceedToNode(nextKey); },650); }
  else { proceedToNode(nextKey); }
}

function proceedToNode(key){ 
  state.currentNodeKey=key; 
  updateFeedbackPanel();
  const node=nodeByKey(key); 
  const tone= state.satisfaction>=75?'happy': state.satisfaction>=50?'neutral': state.satisfaction>=25?'annoyed':'rude'; 
  let msg=node.customerVariants? node.customerVariants[tone]:null; 
  if (state.skipNextCustomerMsg) { msg = null; state.skipNextCustomerMsg = false; }
  if(node.end){ 
    if(msg){ typing(true); setTimeout(()=>{ typing(false); renderCustomerMessage(msg); },520); }
    setTimeout(()=>{ finishScenario(); setScreen('#review-screen'); },800);
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
  state.skipNextCustomerMsg=false;
  state.log=[]; state.decisions=[];
  updateMetricsUI(); 

  $('#chatWindow').innerHTML='<div class="day-sep"><span>Hoje</span></div>'; 
  $('#headerCust').textContent='Cliente'; 
  $('#headerStatus').textContent='online'; 
  state.currentNodeKey=currentScenario().startNode; 

  // 1) Primeira mensagem = CLIENTE
  const first = nodeByKey(state.currentNodeKey).customerVariants?.['neutral'] ?? 'Oi!'; 
  typing(true);
  setTimeout(()=>{ 
    typing(false);
    renderCustomerMessage(first); 

    // 2) Em seguida, mensagem do AGENTE com a frase solicitada
    typing(true);
    setTimeout(()=>{
      typing(false);
      renderAgentMessage('Olá [Nome], eu sou [Agente] do Santander e estou aqui para te ajudar.');
      renderOptions(nodeByKey(state.currentNodeKey).options);
      updateFeedbackPanel();
    }, 500);
  }, 500);
}

function setScreen(id){ $$('.screen').forEach(s=>s.classList.remove('active')); const d=$(id); if(d) d.classList.add('active'); }
function finishScenario(){
  computeTotal();
  // Preencher tela final (mantemos pronto)
  $('#endEmpatia').textContent=state.metrics.empatia; 
  $('#endResolucao').textContent=state.metrics.resolucao; 
  $('#endTempo').textContent=state.metrics.tempo; 
  $('#endTotal').textContent=state.metrics.total; 
  $('#endMedalha').textContent=medalFromScore();
  // Montar tela de revisão
  buildReviewScreen();
}

function bind(){
  const start=()=>{ setScreen('#game-screen'); startScenario(); };
  $('#btnStart')?.addEventListener('click', start);
  $('#playerName')?.addEventListener('keydown', e=>{ if(e.key==='Enter') start(); });
  $('#playerCPF')?.addEventListener('keydown', e=>{ if(e.key==='Enter') start(); });
  $('#themeToggle')?.addEventListener('click', (ev)=>{ const b=ev.target.closest('button'); if(!b) return; $$('#themeToggle button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); const t=b.dataset.theme; document.body.classList.toggle('theme-light', t==='light'); });
  $('#btnReplay')?.addEventListener('click', ()=>{ setScreen('#start-screen'); });
  $('#btnContinueToEnd')?.addEventListener('click', ()=>{ setScreen('#end-screen'); });
  $('#btnExportJSON')?.addEventListener('click', exportJSON);
  const cpfInput=$('#playerCPF'); if(cpfInput){ const m=(e)=>{ e.target.value = formatCPF(e.target.value); }; cpfInput.addEventListener('input', m); cpfInput.addEventListener('blur', m); }
  document.addEventListener('keydown',(e)=>{ const gameVisible = $('#game-screen').classList.contains('active'); if(!gameVisible) return; const n=parseInt(e.key,10); if(n>=1 && n<=4){ const btn=document.querySelector(`#options .option:nth-child(${n})`); if(btn){ e.preventDefault(); btn.click(); }} if(e.key==='Enter'){ const focused=document.activeElement; if(focused?.classList.contains('option')){ e.preventDefault(); focused.click(); }} });
}

document.addEventListener('DOMContentLoaded', bind);

// ===== Auto-reply de negociação → abre proposta_resposta (SEM mensagem automática do agente) =====
function handleNegotiationAutoReply(opt) {
  if (state.currentNodeKey !== 'oferta_negociacao') return false;
  const allow = new Set(['best','very_good','ok']);
  if (!allow.has(opt?.tag)) return false;
  const tone = state.satisfaction >= 75 ? 'happy' : state.satisfaction >= 50 ? 'neutral' : state.satisfaction >= 25 ? 'annoyed' : 'rude';
  let response = '';
  if (tone === 'happy')        response = 'Perfeito! Aceito a proposta. 😊';
  else if (tone === 'neutral') response = 'Fico no aguardando a proposta.';
  else if (tone === 'annoyed') response = 'Seja breve, por favor.';
  else                         response = 'Se for pra falar, seja direto.';

  typing(true);
  setTimeout(() => {
    typing(false);
    renderCustomerMessage(response);
    state.skipNextCustomerMsg = true; // evita duplicar o texto do cliente no próximo nó
    proceedToNode('proposta_resposta');
  }, 600);
  return true;
}

function showDecisionFeedback(opt){
  try{
    const info = decisionInfo(opt?.tag);
    const chat = $('#chatWindow'); if(!chat) return;
    const chip = document.createElement('div');
    chip.setAttribute('role','status');
    chip.style.cssText = [
      'align-self:flex-end','max-width:76%','background:var(--panel-2)','border:1px solid var(--line)','color:var(--text)','padding:8px 10px','border-radius:12px','margin-top:4px','font-size:12px','opacity:0','transform:translateY(4px)','transition:opacity .18s ease, transform .18s ease'
    ].join(';');
    chip.innerHTML = `<strong>${info.emoji} ${info.label}</strong>`;
    chat.appendChild(chip); chat.scrollTop = chat.scrollHeight;
    requestAnimationFrame(()=>{ chip.style.opacity = '1'; chip.style.transform = 'translateY(0)'; });
    setTimeout(()=>chip.remove(), 1400);
  }catch(e){}
}

// ===== Review builder =====
function buildReviewScreen(){
  // Summary
  const kv = $('#reviewSummary'); if(kv){
    const agente = $('#playerName')?.value?.trim() || 'Agente';
    const nome   = state.customerName;
    const totalMsgs = state.log.length;
    const totalDec  = state.decisions.length;
    const avgDt = (state.decisions.reduce((a,d)=>a+(d.dt||0),0)/(totalDec||1)).toFixed(2);
    const tone = toneInfo();
    const risks = state.decisions.filter(d=>d.compliance.cls==='danger').length;
    kv.innerHTML = '';
    const add = (k,v)=>{ const li=document.createElement('li'); li.innerHTML=`<strong>${k}</strong><span>${escapeHtml(String(v))}</span>`; kv.appendChild(li); };
    add('Cliente', nome);
    add('Agente (jogador)', agente);
    add('Mensagens', totalMsgs);
    add('Decisões', totalDec);
    add('Tempo médio decisão', `${avgDt}s`);
    add('Tom final do cliente', `${tone.emoji} ${tone.label}`);
    add('Alertas de compliance', risks);
    add('Empatia', state.metrics.empatia);
    add('Resolução', state.metrics.resolucao);
    add('Tempo (quanto menor, melhor)', state.metrics.tempo);
  }

  // Decisions list
  const decWrap = $('#reviewDecisions');
  if(decWrap){
    decWrap.innerHTML='';
    state.decisions.forEach((d,i)=>{
      const info = decisionInfo(d.tag); const cb=d.compliance;
      const div = document.createElement('div');
      div.className='decision-item';
      div.innerHTML = `
        <div class="decision-head">
          <div><strong>${i+1}. ${escapeHtml(d.stage)}</strong> — ${escapeHtml(d.text)}</div>
          <div class="decision-tags">
            <span class="tag ${info.type}">${info.emoji} ${info.label}</span>
            <span class="tag ${cb.cls}">${escapeHtml(cb.text)}</span>
            <span class="tag">⏱️ ${d.dt}s</span>
          </div>
        </div>
        <div class="decision-body">
          <span>Tom do cliente no momento: ${d.toneAt.emoji} ${d.toneAt.label}</span> · 
          <span>Efeitos: Empatia ${fmtSigned(d.effects.empatia)}, Resolução ${fmtSigned(d.effects.resolucao)}, Tempo ${fmtSigned(d.effects.tempo)}</span>
        </div>
      `;
      decWrap.appendChild(div);
    });
  }

  // Transcript
  const tr = $('#reviewTranscript');
  if(tr){
    tr.innerHTML='';
    state.log.forEach(m=>{
      const row = document.createElement('div'); row.className='row';
      const b = document.createElement('div'); b.className = 'bubble-sm ' + (m.role==='cliente'?'client':'user');
      b.innerHTML = `${escapeHtml(m.text)}<div class="meta"><span>${escapeHtml(m.stage)}</span> · <span>${escapeHtml(m.time)}</span></div>`;
      row.appendChild(b); tr.appendChild(row);
    });
    tr.scrollTop = tr.scrollHeight;
  }
}

function fmtSigned(n){ if(typeof n!=='number' || isNaN(n)) return '0'; return (n>0?'+':'')+n; }

function exportJSON(){
  const data = {
    scenario: currentScenario().id,
    customerName: state.customerName,
    playerName: $('#playerName')?.value?.trim()||'',
    playerCPF: $('#playerCPF')?.value?.trim()||'',
    metrics: state.metrics,
    totalScore: state.metrics.total,
    medal: medalFromScore(),
    decisions: state.decisions,
    messages: state.log,
    finishedAt: isoNow()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download = `atendimento_review_${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
}
