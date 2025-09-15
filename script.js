
// Update8: Tela de REVISÃO antes da pontuação final (transcrição + decisões + visão geral)

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
    best:           {label:'Excelente',         emoji:'✅', type:'ok'},
    very_good:      {label:'Muito bom',         emoji:'👍', type:'ok'},
    ok:             {label:'Ok',                emoji:'ℹ️', type:'ok'},
    recover:        {label:'Recuperação',       emoji:'🛠️', type:'ok'},
    partial:        {label:'Parcial',           emoji:'📝', type:'warn'},
    dry:            {label:'Frio',              emoji:'💬', type:'warn'},
    skip:           {label:'Pulou etapa',       emoji:'⏭️', type:'warn'},
    trap:           {label:'Pegadinha',         emoji:'⚠️', type:'warn'},
    trap_time:      {label:'Atalho arriscado',  emoji:'⏱️', type:'warn'},
    trap_short:     {label:'Tabulação ruim',    emoji:'🧾', type:'warn'},
    trap_emotion:   {label:'Muito pessoal',     emoji:'🙅', type:'danger'},
    trap_pressure:  {label:'Pressão indevida',  emoji:'⛔', type:'danger'},
    trap_indevida:  {label:'Resposta Indevida', emoji:'🚫', type:'danger'},
    trap_tone:      {label:'Tom inadequado',    emoji:'🚫', type:'danger'}
  };
  return map[tag] || {label:'Ação', emoji:'💡', type:'ok'};
}
function complianceBadge(tag){
  const riskDanger = ['trap_doc','trap_pressure','trap_indevida','trap_tone'];
  const riskWarn   = ['trap_time','trap_short','trap','dry','partial','skip','trap_tone'];
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
        happy:'Oi! Tudo bem? Eu sou [Nome], gostaria de ajuda para resolver meu débito. 😊',
        neutral:'Olá, eu sou [Nome], estou com algumas dificuldades com meu débito.',
        annoyed:'Quero negociar, meu nome é [Nome]',
        rude:'Não quero perder tempo, eu sou [Nome] e quero pagar!'
      },
      options:[
        { text:'[Nome], eu tenho algumas propostas que podem te auxiliar, quais são suas condições hoje?', next:'primeira_proposta', effects:{empatia:+2,resolucao:+2,tempo:+1,satisf:+25}, tag:'best' },
        { text:'Posso te apresentar algumas propostas rapidamente, e se fizer sentido, seguimos.', next:'primeira_proposta', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+15}, tag:'very_good' },
        { text:'Eu vou pular a proposta, e você dando OK eu já te envio logo o boleto.', next:'alerta_boleto', effects:{empatia:0,resolucao:0,tempo:+1,satisf:-5}, tag:'trap_time' },
        { text:'Olha, eu posso te ajudar com algumas propostas que tenho aqui, mas você vai querer pagar mesmo?', next:'alerta_grosseria', effects:{empatia:-2,resolucao:-2,tempo:+1,satisf:-15}, tag:'trap_indevida' }
      ]
    },
    primeira_proposta:{
      customerVariants:{
        happy:'Eu consegui uma renda extra e gostaria de pagar o valor total da dívida.',
        neutral:'Claro, quero saber mais sobre essas propostas.',
        annoyed:'Quais as propostas?',
        rude:'Fala logo que propostas são.'
      },
      options:[
        { text:'Temos uma oportunidade válida para hoje, sendo um pagamento com desconto!', next:'negocio_ok', effects:{empatia:+2,resolucao:+2,tempo:+1,satisf:+25}, tag:'best' },
        { text:'Temos opções de acordo à vista com desconto ou parcelamento, qual prefere?', next:'negociacao_neutra', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+15}, tag:'very_good' },
        { text:'Nós conseguimos gerar o boleto e envio por aqui. Consegue pagar hoje?', next:'alerta_boleto', effects:{empatia:0,resolucao:-2,tempo:+1,satisf:-10}, tag:'skip' },
        { text:'A proposta é simples, ou você realiza o pagamento ou a dívida aumenta.', next:'alerta_grosseria', effects:{empatia:-2,resolucao:-2,tempo:+1,satisf:-25}, tag:'trap_pressure' }
      ]
    },
    alerta_grosseria:{
      customerVariants:{
        happy:'Pode repetir?',
        neutral:'Como assim?',
        annoyed:'Se eu estou falando com vocês é porque consigo pagar, né?!',
        rude:'E você não sabe falar direito, não?! Se continuar com essa atitude vou encerrar a conversa!.'
      },
      options:[
        { text:'Desculpa se fui rude, como eu estava dizendo temos oportunidades para seu pagamento.', next:'primeira_proposta', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+15}, tag:'recover' },
        { text:'Apenas estou tentando confirmar suas condições, para ter certeza do seu pagamento e não perder a oferta.', next:'primeira_proposta', effects:{empatia:0,resolucao:+1,tempo:+1,satisf:+5}, tag:'dry' },
        { text:'Vou enviar logo o boleto e encerramos a conversa, pode pagar hoje?', next:'alerta_boleto', effects:{empatia:0,resolucao:0,tempo:+1,satisf:0}, tag:'skip' },
        { text:'Se for para você não pagar, vamos encerrar a conversa então!', next:'finalizacao_negativa', effects:{empatia:-2,resolucao:-2,tempo:+1,satisf:-15}, tag:'trap_indevida' }
      ]
    },
    alerta_boleto:{
      customerVariants:{
        happy:'Pode me explicar melhor a proposta, por favor?',
        neutral:'Quero saber mais sobre a proposta, antes de confirmar.',
        annoyed:'Como vou pagar algo de que não sei nada?',
        rude:'Eu não vou pagar nada se não me explicar a proposta!'
      },
      options:[
        { text:'Peço desculpas, vou passar as propostas que temos disponíveis', next:'primeira_proposta', effects:{empatia:+2,resolucao:+2,tempo:+1,satisf:+15}, tag:'recover' },
        { text:'Vou informar as propostas que temos disponíveis', next:'primeira_proposta', effects:{empatia:0,resolucao:+1,tempo:+1,satisf:+5}, tag:'dry' },
        { text:'Se quiser saber mais sobre o boleto, é só entrar em contato com a central.', next:'alerta_grosseria', effects:{empatia:-1,resolucao:-1,tempo:+1,satisf:-10}, tag:'trap_indevida' },
        { text:'Então vai ficar sem pagar, pois você tem duas escolhe: você aceita e paga ou fica em débito!', next:'alerta_grosseria', effects:{empatia:-2,resolucao:-2,tempo:+1,satisf:-20}, tag:'trap_pressure' }
      ]
    },
    negocio_ok:{
      customerVariants:{
        happy:'É exatamente o que estou procurando! Me explica melhor sobre o pagamento 😁',
        neutral:'Me fala sobre o valor e data de pagamento, por favor.',
        annoyed:'E quanto que eu pago?',
        rude:'E eu não pago nada é? Você nem me falou o valor.'
      },
      options:[
        { text:'Perfeito! Consigo deixar seu débito no valor de R$XXX,XX, para pagamento hoje, o que acha?', next:'negocio_aceite', effects:{empatia:+2,resolucao:+2,tempo:+1,satisf:+10}, tag:'best' },
        { text:'Posso fazer sua fatura ficar no valor de R$XXX,XX, e você paga hoje, ok?', next:'negocio_aceite', effects:{empatia:+1,resolucao:+2,tempo:+1,satisf:+5}, tag:'ok' },
        { text:'Ótimo, vou enviar seu boleto agora mesmo, aguarde só um momento enquanto finalizo!', next:'cadok_skip', effects:{empatia:+1,resolucao:-1,tempo:+1,satisf:-10}, tag:'skip' },
        { text:'Pode deixar, já vou te enviar o boleto, só não esquece de pagar, ein. Brincadeira kkkkkkk.', next:'finalizacao_negativa', effects:{empatia:-1,resolucao:-2,tempo:-1,satisf:-15}, tag:'trap_emotion' }
      ]
    },
    negociacao_neutra:{
      customerVariants:{
        happy:'Ótimo! Pois eu quero pagar à vista, o que consegue fazer para mim?',
        neutral:'Para falar a verdade, quero realizar o pagamento de forma à vista, qual seria o desconto?',
        annoyed:'Qual o desconto?',
        rude:'Fala logo do desconto para que eu possa pagar.'
      },
      options:[
        { text:'Isso é ótimo! tenho um desconto para pagamento hoje, o valor fica em R$XXX,XX. O que acha?', next:'negocio_aceite', effects:{empatia:+2,resolucao:+2,tempo:+1,satisf:+15}, tag:'very_good' },
        { text:'Consigo fazer para você um desconto especial, o valor fica R$XXX,XX, para pagamento hoje.', next:'negocio_aceite', effects:{empatia:+1,resolucao:+2,tempo:+1,satisf:+10}, tag:'Ok' },
        { text:'O que acha de você realizar o pagamento com esse desconto pra finalizar logo, fica R$XXX,XX.', next:'negocio_aceite', effects:{empatia:0,resolucao:+1,tempo:+1,satisf:-25}, tag:'trap' },
        { text:'Eu vou te enviar o boleto agora para que realize o pagamento, vai ficar R$XXX,XX. Vou registrar nosso atendimento, ok?', next:'cadok_skip', effects:{empatia:0,resolucao:-1,tempo:+1,satisf:0}, tag:'skip' }
      ]
    },
    negocio_aceite:{
      customerVariants:{
        happy:'Essa proposta é perfeita! Me envia o boleto. 🤑',
        neutral:'Pode me enviar o boleto, que realizo o pagamento.',
        annoyed:'Tá! me manda o boleto então.',
        rude:'Vai logo, me envia a fatura.'
      },
      options:[
        { text:'Perfeito! Vou apenas confirmar alguns dados para o envio, seu e-mail é exemplo@exemplo.com e seu telefone é esse que termina com 1234?', next:'cadok_intro', effects:{empatia:+2,resolucao:+2,tempo:+1,satisf:+15}, tag:'best' },
        { text:'Ótimo, vou enviar o boleto com as informações que tenho aqui e finalizamos o atendimento.', next:'cadok_skip', effects:{empatia:0,resolucao:-1,tempo:+1,satisf:0}, tag:'skip' },
        { text:'Antes de enviar o boleto, vou confirmar uns dados: seu e-mail é exemplo@exemplo.com e seu telefone é esse com final 1234?', next:'cadok_intro', effects:{empatia:0,resolucao:+1,tempo:+1,satisf:+5}, tag:'dry' },
        { text:'Tá certo [Nome], vou enviar agora seu boleto, antes só confirma pra mim sue e-mail é exemplo@exemplo.com? Seu telefone final é 1234?', next:'cadok_intro', effects:{empatia:+1,resolucao:-1,tempo:+1,satisf:0}, tag:'trap' }
      ]
    },
    cadok_skip:{
      customerVariants:{
        happy:'Acho que esqueceu de confirmar meus dados. 🤭',
        neutral:'Acho que está esquecendo de algo. Que tal confirmar meus dados?',
        annoyed:'Não tá esquecendo de nada não?! E os meus dados?',
        rude:'Enquanto não confirmar meus dados, eu não vou pagar!'
      },
      options:[
        { text:'Você tem razão 😯, vamos atualizar agora mesmo! Seu e-mail é exemplo@exemplo.com e seu final de telefone é 1234?', next:'cadok_intro', effects:{empatia:+2,resolucao:+2,tempo:+1,satisf:+15}, tag:'recover' },
        { text:'Não precisamos disso não, vou registrar seu acordo agora mesmo!', next:'finalizacao_negativa', effects:{empatia:-2,resolucao:-3,tempo:-1,satisf:-15}, tag:'trap_indevida' },
      ]
    },
    finalizacao_negativa:{
      customerVariants:{
        happy:'Acho que mudei de idéia, não vou querer negociar, mas agradeço sua atenção, vou encerrar a conversa.',
        neutral:'Muito obrigada, mas mudei de idéia, não quero mais negociar, vou encerrar por aqui.',
        annoyed:'Quer saber? Não quero mais pagar, encerro por aqui.',
        rude:'Não vou pagar nada com você! Estou encerrando essa conversa agora!'
      },
      options:[
        { text:'(Registrar - Cliente encerrou o contato.)', next:'wrapup_ok', effects:{empatia:-2,resolucao:-2,tempo:+1,satisf:0}, tag:'ok' },
        { text:'(Registrar - Cliente se recusa em pagar.)', next:'wrapup_ok', effects:{empatia:-2,resolucao:-2,tempo:+1,satisf:0}, tag:'trap_short' },
        { text:'(Registrar - Cliente desconhecido.)', next:'wrapup_ok', effects:{empatia:-2,resolucao:-2,tempo:+1,satisf:0}, tag:'trap_short' },
        { text:'(Registrar - Negociação realizada.)', next:'wrapup_ok', effects:{empatia:-2,resolucao:-2,tempo:+1,satisf:0}, tag:'trap_short' }
      ]
    },
    cadok_intro:{
      customerVariants:{
        happy:'Isso mesmo, você está correto! 😊',
        neutral:'Extamente, os dados estão certos.',
        annoyed:'Sim, são esses mesmo.',
        rude:'Sim, podemos encerrar agora?'
      },
      options:[
        { text:'Perfeito [Nome]! Vou registrar nossa conversa e encerramos o contato.', next:'tabulacao_intro', effects:{empatia:+2,resolucao:+2,tempo:+1,satisf:+15}, tag:'best' },
        { text:'Ótimo! Vou finalizar o contato, agradeço sua atenção e tenha um bom dia.', next:'wrapup_ok', effects:{empatia:-1,resolucao:-1,tempo:-1,satisf:0}, tag:'skip' },
        { text:'Vou apenas registrar o atendimento e encerramos.', next:'tabulacao_intro', effects:{empatia:0,resolucao:+1,tempo:+1,satisf:0}, tag:'dry' },
        { text:'Ok [Nome], antes de encerrar vou regitrar tudo, ok?', next:'tabulacao_intro', effects:{empatia:+1,resolucao:+1,tempo:+1,satisf:+5}, tag:'ok' }
      ]
    },
    tabulacao_intro:{
      customerVariants:{
        happy:'Sem problemas, eu fico no aguardo 🫡',
        neutral:'Tudo bem.',
        annoyed:'Estou esperando terminar, então.',
        rude:'Faz logo esse registro, quero encerrar a conversa'
      },
      options:[
        { text:'(Registrar: Negociação realizada com sucesso)', next:'finalizacao_intro', effects:{empatia:0,resolucao:+2,tempo:+1,satisf:0}, tag:'best' },
        { text:'(Registrar: Cliente encerrou o contato)', next:'finalizacao_intro', effects:{empatia:0,resolucao:-2,tempo:+1,satisf:0}, tag:'trap_short' },
        { text:'(Registrar: Alega pagamento)', next:'finalizacao_intro', effects:{empatia:0,resolucao:-2,tempo:+1,satisf:0}, tag:'trap_short' },
        { text:'(Registrar: Preventivo realizado)', next:'finalizacao_intro', effects:{empatia:0,resolucao:-2,tempo:+1,satisf:0}, tag:'trap_short' }
      ]
    },
    finalizacao_intro:{
      customerVariants:{
        happy:'Muito obrigado pelo atendimento, você foi ótimo! Até mais.',
        neutral:'Muito obrigado pelo atendimento.',
        annoyed:'Vou encerrar agora.',
        rude:'Agora que acabou, espero que não me mande mais mensagens!'
      },
      options:[
        { text:'Obrigado pelo seu tempo, [Nome]! Pra garantir a condição, é importante realizar o pagamento ainda hoje. Qualquer dúvida, fico por aqui!', next:'wrapup_ok', effects:{empatia:+1,tempo:+1,satisf:+7}, tag:'best' },
        { text:'Foi um prazer! Se surgir algo, nossos canais são: 4004 2125 ou 0800 726 2125, de seg à sex, das 08h às 21h.', next:'wrapup_ok', effects:{empatia:+1,tempo:0,satisf:+5}, tag:'very_good' },
        { text:'Qualquer dúvida, me chama — lembrando que se não pagar hoje, perde tudo.', next:'wrapup_ok', effects:{empatia:-3,resolucao:-1,tempo:0,satisf:-10}, tag:'trap_pressure' },
        { text:'Agradeço a conversa. Encerrando por aqui.', next:'wrapup_ok', effects:{empatia:-1,tempo:+1,satisf:-5}, tag:'dry' }
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
  else if (tone === 'neutral') response = 'Ok, podemos seguir com essa proposta.';
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
