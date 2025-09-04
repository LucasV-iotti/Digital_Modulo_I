
// Atendimento Pro — Contato Digital (V7.1.4 — Módulo I)
// Mantém a estrutura V7.1.3, adicionando o cenário “Missão I — Capacitação Digital”
// baseado no material MÓDULO I — CAPACITAÇÃO DIGITAL 1.pdf (abordagem, CadOK, tabulação, finalização)

const $  = (s)=>document.querySelector(s);
const $$ = (s)=>document.querySelectorAll(s);

function escapeHtml(str=''){
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function nowTime(){ const d=new Date(); return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
function onlyDigits(v){ return String(v||'').replace(/\D/g,''); }
function formatCPF(d){ const s=onlyDigits(d).slice(0,11); let out=''; if(s.length>0) out=s.substring(0,3); if(s.length>=4) out+='.'+s.substring(3,6); if(s.length>=7) out+='.'+s.substring(6,9); if(s.length>=10) out+='-'+s.substring(9,11); return out; }

// ===== Missão I — Capacitação Digital =====
const MISSAO_I = {
  id:'mod1_missao1', title:'Missão I — Capacitação Digital',
  summary:'Abordagem diferenciada → CadOK (atualização cadastral) → Tabulação correta → Finalização empática.',
  startNode:'abordagem_inicio_pf',
  nodes:{
    // 1) Abordagem diferenciada (PF)
    abordagem_inicio_pf:{
      customerVariants:{
        happy:'Oi! Tudo bem? Recebi sua mensagem. Sobre o que se trata? 😊',
        neutral:'Oi. Em que posso ajudar?',
        annoyed:'Oi. Fala direto, por favor. Tô sem tempo.',
        rude:'Diz logo o que é. Não posso perder tempo.'
      },
      options:[
        { text:'Seja bem-vindo! Sou da equipe. Para seguirmos com segurança, posso confirmar seu nome e apenas os dois últimos dígitos do CPF?', next:'valida_pf_minima' },
        { text:'Qual é o problema? Me diz logo.', next:'friction_tom' },
        { text:'Me envia foto do RG e o CPF completo.', next:'alerta_lgpd' }
      ]
    },

    // Se pedir dado sensível indevido, corrigir rota (LGPD)
    alerta_lgpd:{
      customerVariants:{
        happy:'Enviar documento aqui? Não me sinto confortável…',
        neutral:'Isso é seguro?',
        annoyed:'Não vou mandar documento por chat.',
        rude:'Nem pensar em mandar RG aqui.'
      },
      options:[
        { text:'Você tem razão. Vamos pelo caminho seguro: confirmo seu nome e só os dois últimos dígitos do CPF, ok?', next:'valida_pf_minima' },
        { text:'Sem documento não tem atendimento.', next:'friction_tom' }
      ]
    },

    // Validação mínima segura
    valida_pf_minima:{
      customerVariants:{
        happy:'Claro! Meu nome é Ana Silva. CPF termina em 34. 😊',
        neutral:'Ana Silva, termina em 34.',
        annoyed:'Ana, 34. Pode agilizar?',
        rude:'Ana. 34. E aí?'
      },
      options:[
        { text:'Perfeito, Ana! Obrigado. Posso validar o canal preferido (WhatsApp, e-mail ou telefone)?', next:'cadok_intro' },
        { text:'Vamos direto ao assunto, sem validar nada.', next:'cadok_pula' }
      ]
    },

    // 2) CadOK — atualização cadastral
    cadok_intro:{
      customerVariants:{
        happy:'Prefiro WhatsApp à tarde. Meu e-mail continua o mesmo.',
        neutral:'WhatsApp. Pode ser à tarde.',
        annoyed:'Só WhatsApp. Evita ligar.',
        rude:'Só manda no Whats.'
      },
      options:[
        { text:'Anotado! Vou registrar WhatsApp à tarde como preferido. Posso confirmar e-mail (terminando em @exemplo.com) e celular final 7788?', next:'cadok_confirm' },
        { text:'Preciso do número completo do cartão para prosseguir.', next:'alerta_lgpd' },
        { text:'Sem tempo para isso. Vamos seguir mesmo assim.', next:'cadok_pula' }
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
        { text:'Você foi selecionada para uma oportunidade exclusiva de negociação. Posso te explicar as condições e prazo?', next:'oferta_negociacao' }
      ]
    },

    cadok_pula:{
      customerVariants:{
        happy:'Ok, mas prefiro que atualizem meu WhatsApp depois.',
        neutral:'Tudo bem.',
        annoyed:'Eu queria ajustar meu contato, mas tudo bem…',
        rude:'Vocês nem checaram meus dados.'
      },
      options:[
        { text:'Você tem razão, é importante manter os dados atualizados. Podemos confirmar rapidinho?', next:'cadok_intro' },
        { text:'Não precisa disso. Vamos seguir.', next:'oferta_negociacao' }
      ]
    },

    // 3) Oferta/negociação (texto neutro; PDF foca em abordagem e finalização)
    oferta_negociacao:{
      customerVariants:{
        happy:'Claro, pode explicar. 😊',
        neutral:'Pode falar.',
        annoyed:'Seja direto, por favor.',
        rude:'Fala logo.'
      },
      options:[
        { text:'Tenho uma condição especial válida até a data combinada. Vamos avançar?', next:'tabulacao_intro' },
        { text:'Se não pagar hoje, perde tudo.', next:'friction_tom' }
      ]
    },

    // 4) Tabulação correta (o que registrar)
    tabulacao_intro:{
      agentAuto:'Antes de encerrar, vou registrar o atendimento (tabulação) com clareza para dar continuidade quando precisar.',
      customerVariants:{
        happy:'Legal! O que você vai registrar?',
        neutral:'Ok. O que será tabulado?',
        annoyed:'Tá… e o que você vai anotar?',
        rude:'E daí? O que vai anotar?'
      },
      options:[
        { text:'Motivo do contato, condições oferecidas, objeções, acordo e próximos passos.', next:'finalizacao_intro' },
        { text:'Tabular só “cliente orientado”.', next:'finalizacao_intro' }
      ]
    },

    // Finalização — mensagens modelo do material
    finalizacao_intro:{
      customerVariants:{
        happy:'Obrigado pelo retorno e pela explicação! 😊',
        neutral:'Ok.',
        annoyed:'Beleza.',
        rude:'Tá.'
      },
      options:[
        { text:'Obrigado pelo seu tempo, [Nome]! Para garantir a condição, é importante pagar até a data combinada. Qualquer dúvida, fico por aqui!', next:'wrapup_ok' },
        { text:'Foi um prazer falar com você! Se surgir alguma dúvida, nossos canais: 4004 2125 (capitais) ou 0800 726 2125 (demais localidades), seg-sex, 08h–21h.', next:'wrapup_ok' }
      ]
    },

    // Ajuste de tom (fricção)
    friction_tom:{
      customerVariants:{
        happy:'Achei meio seco, mas podemos continuar.',
        neutral:'Certo. E agora?',
        annoyed:'Esse tom não ajuda…',
        rude:'Desse jeito não dá.'
      },
      options:[
        { text:'Desculpe pelo tom, Ana. Vou cuidar disso com atenção e respeito. Podemos confirmar rapidamente seus dados para seguir?', next:'valida_pf_minima' },
        { text:'Se não gostar, procure outro canal.', next:'friction_tom' }
      ]
    },

    wrapup_ok:{ end:'resolved' }
  }
};

// ===== Baseline (V7.1.3) — cenários originais =====
const SCENARIOS_BASE = [
  { id:'onb_1', title:'Primeiro atendimento (tutorial)', summary:'Saudação cordial, validação mínima (pedido/e-mail) e solução objetiva.', startNode:'start', nodes:{
    start:{ customerVariants:{ happy:'Oi! Tudo bem? Tô com um probleminha no meu pedido. 😊', neutral:'Oi, tudo bem? Tenho um problema no meu pedido.', annoyed:'Oi. Tô com problema no pedido.', rude:'Meu pedido deu problema.' }, options:[
      { text:'Olá! Vou te ajudar. Pode me dizer o número do pedido ou e-mail cadastrado?', next:'askId' },
      { text:'Fala logo qual é o problema.', next:'friction_start' }
    ]},
    friction_start:{ customerVariants:{ happy:'Ok. Pedido #8890.', neutral:'Pedido #8890.', annoyed:'Pedido #8890.', rude:'Pedido #8890.' }, options:[
      { text:'Perdão pelo tom. Vamos resolver juntos. Pode confirmar seu e-mail?', next:'askMail' },
      { text:'Tá, e o que você quer?', next:'friction_start' }
    ]},
    askId:{ customerVariants:{ happy:'Claro! É o #8890. 😊', neutral:'É o #8890.', annoyed:'#8890.', rude:'#8890.' }, options:[
      { text:'Obrigado! Vou consultar e já retorno. Um instante, por favor.', next:'checking' }
    ]},
    askMail:{ customerVariants:{ happy:'ana@exemplo.com! 😊', neutral:'ana@exemplo.com', annoyed:'ana@exemplo.com.', rude:'ana@exemplo.com.' }, options:[
      { text:'Obrigado! Consultando aqui e já te atualizo, ok?', next:'checking' }
    ]},
    checking:{ agentAuto:'Consultando sistema... Status: enviado. Previsão: amanhã até 18h.', options:[
      { text:'A previsão é amanhã até 18h. Te aviso por e-mail/SMS a cada atualização. Posso ajudar em algo mais?', next:'wrapup' }
    ]},
    wrapup:{ customerVariants:{ happy:'Perfeito! Muito obrigado. 😊', neutral:'Beleza, vou aguardar. Obrigado.', annoyed:'Ok… tomara que chegue.', rude:'Tá. Vou ver se chega.' }, end:'resolved' }
  }} ,

  { id:'onb_2', title:'Dados sensíveis (LGPD)', summary:'Evite pedir dados sensíveis; valide pelo mínimo necessário.', startNode:'start', nodes:{
    start:{ customerVariants:{ happy:'Oi! Posso atualizar meu endereço aqui? 😊', neutral:'Posso atualizar meu endereço aqui?', annoyed:'Preciso atualizar meu endereço.', rude:'Quero trocar o endereço.' }, options:[
      { text:'Claro! Para segurança, posso validar pelo e-mail cadastrado. Qual é?', next:'askMail' },
      { text:'Me manda foto do RG e comprovante.', next:'policy_warn' }
    ]},
    policy_warn:{ customerVariants:{ happy:'Acho arriscado mandar documento…', neutral:'Isso é seguro?', annoyed:'Não vou mandar documento.', rude:'Nem pensar em mandar RG.' }, options:[
      { text:'Você tem razão. Vamos validar por e-mail e te envio link seguro.', next:'askMail' }
    ]},
    askMail:{ customerVariants:{ happy:'ana@exemplo.com. Obrigada! 😊', neutral:'ana@exemplo.com', annoyed:'ana@exemplo.com.', rude:'ana@exemplo.com.' }, options:[
      { text:'Perfeito! Vou abrir a tela e, se precisar, envio o link seguro.', next:'wrapup' }
    ]},
    wrapup:{ customerVariants:{ happy:'Obrigada! Adorei a atenção. 😊', neutral:'Obrigado! Vou aguardar o link.', annoyed:'Ok… tomara que funcione.', rude:'Tá. Manda logo isso.' }, end:'resolved' }
  }}
];

// Ordem: Missão I primeiro, mantendo estrutura
const SCENARIOS = [MISSAO_I, ...SCENARIOS_BASE];

// ===== Estado/jogo (mesma estrutura V7.1.3) =====
const state = { currentScenarioIndex:0, currentNodeKey:'start', satisfaction:50 };
function currentScenario(){ return SCENARIOS[state.currentScenarioIndex]; }
function nodeByKey(k){ return currentScenario().nodes[k]; }

function renderCustomerMessage(text){ if(!text) return; const el=document.createElement('div'); el.className='msg customer'; el.innerHTML=`${escapeHtml(text)}<div class="meta"><span>${nowTime()}</span><span class="status">• recebido</span></div>`; const w=$('#chatWindow'); w.appendChild(el); w.scrollTop=w.scrollHeight; }
function renderAgentMessage(text){ const el=document.createElement('div'); el.className='msg agent'; el.innerHTML=`${escapeHtml(text)}<div class="meta"><span>${nowTime()}</span><span class="status" data-status>✓</span></div>`; const w=$('#chatWindow'); w.appendChild(el); w.scrollTop=w.scrollHeight; setTimeout(()=>{ const s=el.querySelector('[data-status]'); if(s) s.textContent='✓✓'; }, 650); }
function typing(on){ const t=$('#typing'); if(t) t.classList.toggle('hidden', !on); const hs=$('#headerStatus'); if(hs) hs.textContent = on ? 'online • digitando…' : 'online'; }
function renderOptions(options=[]){ const wrap=$('#options'); wrap.innerHTML=''; options.slice(0,4).forEach((opt,i)=>{ const b=document.createElement('button'); b.className='option'; b.addEventListener('click', ()=>chooseOption(i)); const kbd=`<span class="kbd">${i+1}</span>`; b.innerHTML=`<span>${escapeHtml(opt.text)}</span>${kbd}`; wrap.appendChild(b); }); const first=wrap.querySelector('.option'); if(first) first.focus(); }

function chooseOption(index){ const node=nodeByKey(state.currentNodeKey); const opt=node.options[index]; if(!opt) return; renderAgentMessage(opt.text); const nextKey=opt.next||state.currentNodeKey; const nextNode=nodeByKey(nextKey); if(nextNode?.agentAuto){ typing(true); setTimeout(()=>{ typing(false); renderAgentMessage(nextNode.agentAuto); proceedToNode(nextKey); },650); } else { proceedToNode(nextKey); } }

function proceedToNode(key){ state.currentNodeKey=key; const node=nodeByKey(key); const tone = state.satisfaction>=75?'happy': state.satisfaction>=50?'neutral': state.satisfaction>=25?'annoyed':'rude'; const msg=node.customerVariants? node.customerVariants[tone]:null; if(msg){ typing(true); setTimeout(()=>{ typing(false); renderCustomerMessage(msg); renderOptions(node.options); },520); } else { renderOptions(node.options); } if(node.end){ setTimeout(()=>{ setScreen('#end-screen'); }, 800); } }

function startScenario(){ state.currentNodeKey=currentScenario().startNode; $('#ticketGoal').textContent='Abordagem diferenciada • CadOK (atualização) • Tabulação correta • Finalização empática'; $('#caseSummary').textContent=currentScenario().summary; $('#chatWindow').innerHTML='<div class="day-sep"><span>Hoje</span></div>'; $('#headerCust').textContent='Cliente'; $('#headerStatus').textContent='online'; const tone='neutral'; const first=nodeByKey(state.currentNodeKey).customerVariants?.[tone]||'Olá!'; renderCustomerMessage(first); renderOptions(nodeByKey(state.currentNodeKey).options); }

function setScreen(id){ $$('.screen').forEach(s=>s.classList.remove('active')); const d=$(id); if(d) d.classList.add('active'); }

function bind(){
  const start=()=>{ setScreen('#game-screen'); startScenario(); };
  $('#btnStart')?.addEventListener('click', start);
  $('#playerName')?.addEventListener('keydown', e=>{ if(e.key==='Enter') start(); });
  $('#playerCPF')?.addEventListener('keydown', e=>{ if(e.key==='Enter') start(); });

  $('#themeToggle')?.addEventListener('click', (ev)=>{ const b=ev.target.closest('button'); if(!b) return; $$('#themeToggle button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); const t=b.dataset.theme; document.body.classList.toggle('theme-light', t==='light'); });

  $('#btnReplay')?.addEventListener('click', ()=>{ setScreen('#start-screen'); });

  const cpfInput=$('#playerCPF'); if(cpfInput){ const m=(e)=>{ e.target.value = formatCPF(e.target.value); }; cpfInput.addEventListener('input', m); cpfInput.addEventListener('blur', m); }
}

document.addEventListener('DOMContentLoaded', bind);
