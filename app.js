const KEY='harbourNorth2.plan',APP='0.3.0-timeline',SCHEMA=4;
const id=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36);
const nowYear=new Date().getFullYear();
const defaults=()=>({meta:{appVersion:APP,schemaVersion:SCHEMA,updatedAt:new Date().toISOString()},hasPartner:true,people:[{name:'',birthDate:'',retirementAge:55,employmentStatus:'Employed'},{name:'',birthDate:'',retirementAge:55,employmentStatus:'Employed'}],household:{province:'British Columbia',planningAge:95,inflationRate:2,returnRate:5},accounts:[],incomeSources:[],debts:[],expenses:[],events:[]});
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const money=v=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0}).format(num(v));
function clone(x){return JSON.parse(JSON.stringify(x))}
function merge(base,src){if(Array.isArray(base))return Array.isArray(src)?src:base;if(base&&typeof base==='object'){const out={};for(const k of Object.keys(base))out[k]=merge(base[k],src?.[k]);for(const k of Object.keys(src||{}))if(!(k in out))out[k]=src[k];return out}return src===undefined?base:src}
function account(name,type,owner,balance,contribution=0){return{id:id(),name,type,owner,balance:num(balance),returnRate:5,annualContribution:num(contribution)}}
function income(name,type,owner,annualAmount,startAge=0,endAge=110,indexed=true){return{id:id(),name,type,owner,annualAmount:num(annualAmount),startAge:num(startAge),endAge:num(endAge),indexed:!!indexed}}
function debt(name,type,balance,payment=0,rate=0){return{id:id(),name,type,balance:num(balance),monthlyPayment:num(payment),interestRate:num(rate)}}
function expense(name,category,amount,frequency='Monthly'){return{id:id(),name,category,amount:num(amount),frequency}}
function eventItem(name,type,amount,year){return{id:id(),name,type,amount:num(amount),year:num(year)}}
function migrate(raw){const d=defaults();if(!raw||typeof raw!=='object')return d;const source=raw.plan||raw;if(source.meta?.schemaVersion>=SCHEMA)return merge(d,source);const n=merge(d,source);n.accounts=Array.isArray(source.accounts)?source.accounts:[];n.incomeSources=Array.isArray(source.incomeSources)?source.incomeSources:[];n.debts=Array.isArray(source.debts)&&source.debts.some(x=>x.id)?source.debts:[];n.expenses=Array.isArray(source.expenses)?source.expenses:[];n.events=Array.isArray(source.events)?source.events:[];
if(n.accounts.length===0&&source.assets){const a=source.assets;if(num(a.cash))n.accounts.push(account('Cash and savings','Cash','Household',a.cash));if(num(a.rrsp))n.accounts.push(account('RRSP / RRIF','RRSP/RRIF',source.people?.[0]?.name||'Primary',a.rrsp));if(num(a.tfsa))n.accounts.push(account('TFSA','TFSA',source.people?.[0]?.name||'Primary',a.tfsa));if(num(a.nonRegistered))n.accounts.push(account('Non-registered investments','Non-registered','Household',a.nonRegistered));if(num(a.realEstate))n.accounts.push(account('Home and real estate','Real estate','Household',a.realEstate));if(num(a.other))n.accounts.push(account('Other assets','Other','Household',a.other))}
if(n.incomeSources.length===0&&source.employment){source.employment.forEach((e,i)=>{if(num(e.salary))n.incomeSources.push(income('Employment income','Salary',source.people?.[i]?.name||['Primary','Partner'][i],e.salary,0,num(source.people?.[i]?.retirementAge)||65,true))});(source.benefits||[]).forEach((b,i)=>{const owner=source.people?.[i]?.name||['Primary','Partner'][i];if(num(b.cppMonthly))n.incomeSources.push(income('CPP','CPP',owner,num(b.cppMonthly)*12,num(b.cppAge)||65,110,true));if(num(b.taxFreeMonthly))n.incomeSources.push(income('Tax-free benefit','WCB/LTD',owner,num(b.taxFreeMonthly)*12,0,num(b.taxFreeEndAge)||65,false))});(source.pensions||[]).forEach((p,i)=>{if(num(p.monthly))n.incomeSources.push(income('Workplace pension','Pension',source.people?.[i]?.name||['Primary','Partner'][i],num(p.monthly)*12,num(p.startAge)||55,110,num(p.indexRate)>0))})}
if(n.debts.length===0&&source.debts&&!Array.isArray(source.debts)){if(num(source.debts.mortgage))n.debts.push(debt('Mortgage','Mortgage',source.debts.mortgage));if(num(source.debts.loc))n.debts.push(debt('Line of credit','Line of credit',source.debts.loc));if(num(source.debts.other))n.debts.push(debt('Other debt','Other',source.debts.other))}
if(n.expenses.length===0&&source.spending){if(num(source.spending.essentialMonthly))n.expenses.push(expense('Essential living','Essential',source.spending.essentialMonthly,'Monthly'));if(num(source.spending.lifestyleMonthly))n.expenses.push(expense('Lifestyle','Lifestyle',source.spending.lifestyleMonthly,'Monthly'));if(num(source.spending.travelAnnual))n.expenses.push(expense('Travel','Travel',source.spending.travelAnnual,'Annual'));if(num(source.spending.otherAnnual))n.expenses.push(expense('Other spending','Other',source.spending.otherAnnual,'Annual'))}
if(n.events.length===0&&source.goal?.amount)n.events.push(eventItem(source.goal.name||'Financial goal','Expense',source.goal.amount,source.goal.year||nowYear+3));n.meta={appVersion:APP,schemaVersion:SCHEMA,updatedAt:new Date().toISOString()};return n}
function load(){try{return migrate(JSON.parse(localStorage.getItem(KEY)))}catch{return defaults()}}let state=load();
function pathGet(o,p){return p.split('.').reduce((a,k)=>a?.[k],o)}function pathSet(o,p,v){const a=p.split('.');let x=o;for(let i=0;i<a.length-1;i++)x=x[a[i]];x[a.at(-1)]=v}
function save(msg=true){state.meta={...state.meta,appVersion:APP,schemaVersion:SCHEMA,updatedAt:new Date().toISOString()};localStorage.setItem(KEY,JSON.stringify(state));if(msg){const s=document.getElementById('saveStatus');s.textContent='Saved';setTimeout(()=>s.textContent='Ready',800)}renderHome()}
function bindStatic(){document.querySelectorAll('[data-bind]').forEach(el=>{el.value=pathGet(state,el.dataset.bind)??'';const handler=()=>{pathSet(state,el.dataset.bind,el.type==='number'?num(el.value):el.value);save()};el.addEventListener('input',handler);el.addEventListener('change',handler)});const hp=document.getElementById('hasPartner');hp.checked=state.hasPartner;hp.onchange=()=>{state.hasPartner=hp.checked;document.getElementById('partnerFields').classList.toggle('hidden',!state.hasPartner);save()};document.getElementById('partnerFields').classList.toggle('hidden',!state.hasPartner)}
function ownerOptions(selected){const opts=['Household',state.people[0].name||'Primary'];if(state.hasPartner)opts.push(state.people[1].name||'Partner');return [...new Set(opts)].map(x=>`<option ${x===selected?'selected':''}>${esc(x)}</option>`).join('')}
function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function field(label,value,key,type='text',options=''){return`<div class="field"><label>${label}</label>${options?`<select data-key="${key}">${options}</select>`:`<input data-key="${key}" type="${type}" value="${esc(value)}">`}</div>`}
function renderAccounts(){const root=document.getElementById('accountsList');root.innerHTML=state.accounts.length?'':`<div class="empty">No accounts yet. Add each financial account or major asset separately.</div>`;state.accounts.forEach(x=>{const el=document.createElement('div');el.className='item';el.dataset.id=x.id;el.innerHTML=`<div class="item-grid">${field('Account name',x.name,'name')}${field('Type',x.type,'type','text','<option>Cash</option><option>RRSP/RRIF</option><option>TFSA</option><option>FHSA</option><option>Non-registered</option><option>Real estate</option><option>Vehicle</option><option>Other</option>')}${field('Owner',x.owner,'owner','text',ownerOptions(x.owner))}${field('Balance',x.balance,'balance','number')}<div class="remove-wrap"><button class="btn danger small" data-remove="accounts">Remove</button></div></div><div class="grid two" style="margin-top:12px">${field('Expected return (%)',x.returnRate,'returnRate','number')}${field('Annual contribution',x.annualContribution,'annualContribution','number')}</div>`;root.appendChild(el);setSelect(el,'type',x.type)})}
function renderIncome(){const root=document.getElementById('incomeList');root.innerHTML=state.incomeSources.length?'':`<div class="empty">No income sources yet. Add current earnings and future retirement income.</div>`;state.incomeSources.forEach(x=>{const el=document.createElement('div');el.className='item';el.dataset.id=x.id;el.innerHTML=`<div class="item-grid income">${field('Income name',x.name,'name')}${field('Type',x.type,'type','text','<option>Salary</option><option>WCB/LTD</option><option>Pension</option><option>CPP</option><option>OAS</option><option>Rental</option><option>Business</option><option>Other</option>')}${field('Owner',x.owner,'owner','text',ownerOptions(x.owner))}${field('Annual amount',x.annualAmount,'annualAmount','number')}${field('Start age',x.startAge,'startAge','number')}${field('End age',x.endAge,'endAge','number')}<div class="remove-wrap"><button class="btn danger small" data-remove="incomeSources">Remove</button></div></div><label style="display:block;margin-top:12px"><input style="width:auto;min-height:auto" type="checkbox" data-key="indexed" ${x.indexed?'checked':''}> Indexed with inflation</label>`;root.appendChild(el);setSelect(el,'type',x.type)})}
function renderDebts(){const root=document.getElementById('debtList');root.innerHTML=state.debts.length?'':`<div class="empty">No debts recorded.</div>`;state.debts.forEach(x=>{const el=document.createElement('div');el.className='item';el.dataset.id=x.id;el.innerHTML=`<div class="item-grid">${field('Debt name',x.name,'name')}${field('Type',x.type,'type','text','<option>Mortgage</option><option>HELOC</option><option>Line of credit</option><option>Credit card</option><option>Vehicle loan</option><option>Other</option>')}${field('Balance',x.balance,'balance','number')}${field('Monthly payment',x.monthlyPayment,'monthlyPayment','number')}<div class="remove-wrap"><button class="btn danger small" data-remove="debts">Remove</button></div></div><div class="grid two" style="margin-top:12px">${field('Interest rate (%)',x.interestRate,'interestRate','number')}</div>`;root.appendChild(el);setSelect(el,'type',x.type)})}
function renderExpenses(){const root=document.getElementById('expenseList');root.innerHTML=state.expenses.length?'':`<div class="empty">No spending needs recorded.</div>`;state.expenses.forEach(x=>{const el=document.createElement('div');el.className='item';el.dataset.id=x.id;el.innerHTML=`<div class="item-grid expense">${field('Spending name',x.name,'name')}${field('Category',x.category,'category','text','<option>Essential</option><option>Lifestyle</option><option>Travel</option><option>Healthcare</option><option>Other</option>')}${field('Amount',x.amount,'amount','number')}${field('Frequency',x.frequency,'frequency','text','<option>Monthly</option><option>Annual</option>')}<div class="remove-wrap"><button class="btn danger small" data-remove="expenses">Remove</button></div></div>`;root.appendChild(el);setSelect(el,'category',x.category);setSelect(el,'frequency',x.frequency)})}
function renderEvents(){const root=document.getElementById('eventList');root.innerHTML=state.events.length?'':`<div class="empty">No timeline events recorded.</div>`;state.events.forEach(x=>{const el=document.createElement('div');el.className='item';el.dataset.id=x.id;el.innerHTML=`<div class="item-grid event">${field('Event name',x.name,'name')}${field('Type',x.type,'type','text','<option>Expense</option><option>Income</option><option>Asset sale</option><option>Inheritance</option><option>Gift</option><option>Other</option>')}${field('Amount',x.amount,'amount','number')}${field('Year',x.year,'year','number')}<div class="remove-wrap"><button class="btn danger small" data-remove="events">Remove</button></div></div>`;root.appendChild(el);setSelect(el,'type',x.type)})}
function setSelect(el,key,val){const s=el.querySelector(`select[data-key="${key}"]`);if(s)s.value=val}
function renderAllLists(){renderAccounts();renderIncome();renderDebts();renderExpenses();renderEvents()}
function listHandler(e){const item=e.target.closest('.item');if(!item)return;const removeCollection=e.target.dataset.remove;if(removeCollection){state[removeCollection]=state[removeCollection].filter(x=>x.id!==item.dataset.id);renderAllLists();save();return}const key=e.target.dataset.key;if(!key)return;const map={accounts:'accountsList',incomeSources:'incomeList',debts:'debtList',expenses:'expenseList',events:'eventList'};const collection=Object.entries(map).find(([,rid])=>item.parentElement.id===rid)?.[0];if(!collection)return;const obj=state[collection].find(x=>x.id===item.dataset.id);if(!obj)return;obj[key]=e.target.type==='number'?num(e.target.value):e.target.type==='checkbox'?e.target.checked:e.target.value;save()}
function totals(){const investTypes=['Cash','RRSP/RRIF','TFSA','FHSA','Non-registered'];const invest=state.accounts.filter(a=>investTypes.includes(a.type)).reduce((s,a)=>s+num(a.balance),0);const assets=state.accounts.reduce((s,a)=>s+num(a.balance),0);const debt=state.debts.reduce((s,d)=>s+num(d.balance),0);const annualIncome=state.incomeSources.filter(x=>num(x.startAge)===0||num(x.startAge)<=currentAge(0)).reduce((s,x)=>s+num(x.annualAmount),0);const annualSpend=state.expenses.reduce((s,x)=>s+num(x.amount)*(x.frequency==='Monthly'?12:1),0);return{invest,assets,debt,netWorth:assets-debt,annualIncome,annualSpend}}
function currentAge(i){const b=state.people[i]?.birthDate;if(!b)return 0;const d=new Date(b),n=new Date();let age=n.getFullYear()-d.getFullYear();if(n<new Date(n.getFullYear(),d.getMonth(),d.getDate()))age--;return age}
function readiness(){
 const t=totals(), age=currentAge(0), retire=num(state.people[0].retirementAge)||65;
 const profileMax=15,savingsMax=25,debtMax=20,incomeMax=15,planMax=15,emergencyMax=10;
 let profile=0,savings=0,debtScore=0,income=0,plan=0,emergency=0;
 const flags=[];
 if(state.people[0].name)profile+=4; else flags.push(['action','Add the primary person’s name.']);
 if(state.people[0].birthDate)profile+=4; else flags.push(['action','Add the primary person’s date of birth.']);
 if(num(state.people[0].retirementAge)>=40)profile+=3;
 if(!state.hasPartner||(state.people[1].name&&state.people[1].birthDate))profile+=2; else flags.push(['action','Complete the partner profile.']);
 if(state.household.province&&num(state.household.planningAge)>=85)profile+=2;
 if(profile>=12)flags.push(['good','The household profile is substantially complete.']);
 const years=Math.max(0,retire-age);
 if(t.invest>0){savings+=8;flags.push(['good','Investable assets are recorded.'])} else flags.push(['action','Add cash, RRSP, TFSA, or other investment accounts.']);
 const spendRatio=t.annualSpend>0?t.invest/t.annualSpend:0;
 savings+=Math.min(12,Math.round(spendRatio*1.5));
 const contributions=state.accounts.reduce((sum,a)=>sum+num(a.annualContribution),0);
 if(contributions>0)savings+=5; else flags.push(['action','Add annual contributions to investment accounts.']);
 if(t.debt===0){debtScore=20;flags.push(['good','No debt is currently recorded.'])}else{
   const ratio=t.assets>0?t.debt/t.assets:1;
   debtScore=Math.max(2,Math.round(20*(1-Math.min(1,ratio))));
   if(ratio<.15)flags.push(['good','Debt is modest relative to recorded assets.']); else flags.push(['action','Review a debt-reduction plan before retirement.']);
 }
 if(state.incomeSources.length){income+=5;flags.push(['good','Income sources are recorded separately.'])} else flags.push(['action','Add salary, benefits, pensions, CPP, and OAS.']);
 const futureIncome=state.incomeSources.some(x=>['CPP','OAS','Pension','WCB/LTD'].includes(x.type));
 if(futureIncome)income+=5; else flags.push(['action','Add expected CPP, OAS, pension, or long-term benefits.']);
 if(t.annualIncome>t.annualSpend&&t.annualSpend>0)income+=5; else if(t.annualSpend>0)flags.push(['action','Current recorded income does not exceed recorded spending.']);
 if(state.expenses.length){plan+=5;flags.push(['good','Spending needs are entered.'])} else flags.push(['action','Add current or retirement spending needs.']);
 if(state.events.length){plan+=4;flags.push(['good','Major future goals are on the timeline.'])} else flags.push(['action','Add major goals and one-time timeline events.']);
 if(years>0&&num(state.household.returnRate)>0&&num(state.household.inflationRate)>=0)plan+=3;
 if(num(state.household.planningAge)>=90)plan+=3; else flags.push(['action','Use a planning horizon of at least age 90.']);
 const cash=state.accounts.filter(a=>a.type==='Cash').reduce((sum,a)=>sum+num(a.balance),0);
 const monthly=t.annualSpend/12;
 const months=monthly>0?cash/monthly:0;
 emergency=Math.min(10,Math.round(months/6*10));
 if(months>=3)flags.push(['good',`Recorded cash covers about ${months.toFixed(1)} months of spending.`]); else flags.push(['action','Build or record an emergency fund covering at least three months of spending.']);
 const categories=[
  {key:'profile',label:'Household profile',score:profile,max:profileMax},
  {key:'savings',label:'Savings',score:savings,max:savingsMax},
  {key:'debt',label:'Debt',score:debtScore,max:debtMax},
  {key:'income',label:'Income stability',score:income,max:incomeMax},
  {key:'plan',label:'Retirement plan',score:plan,max:planMax},
  {key:'emergency',label:'Emergency fund',score:emergency,max:emergencyMax}
 ];
 const score=categories.reduce((sum,c)=>sum+c.score,0);
 return{score:Math.min(100,score),flags,categories,months,years};
}
function recommendations(r,t){
 const rec=[];
 const weakest=[...r.categories].sort((a,b)=>(a.score/a.max)-(b.score/b.max));
 for(const c of weakest){
  if(rec.length>=3)break;
  if(c.key==='emergency'&&c.score<c.max*.7)rec.push(['Strengthen the emergency fund',`Recorded cash covers ${r.months.toFixed(1)} months of spending. A three-to-six-month reserve improves resilience.`]);
  if(c.key==='debt'&&c.score<c.max*.8)rec.push(['Reduce debt before retirement',`${money(t.debt)} of debt is currently recorded. Lower debt reduces the income your plan must generate.`]);
  if(c.key==='income'&&c.score<c.max*.8)rec.push(['Complete future income sources','Add CPP, OAS, pensions, WCB/LTD, rental, and other income with realistic start and end ages.']);
  if(c.key==='savings'&&c.score<c.max*.8)rec.push(['Complete investment accounts','Record balances and annual contributions for each RRSP, TFSA, cash, and non-registered account.']);
  if(c.key==='plan'&&c.score<c.max*.8)rec.push(['Complete spending and goals','Add retirement spending plus large one-time events so the future projection reflects real life.']);
  if(c.key==='profile'&&c.score<c.max*.8)rec.push(['Finish the household profile','Dates of birth, retirement ages, province, and planning horizon drive future calculations.']);
 }
 if(!rec.length)rec.push(['Financial foundation complete','Your core information is ready for the year-by-year retirement projection engine.']);
 return rec.slice(0,3);
}
function timelineItems(){
 const items=[];
 const now=new Date().getFullYear();
 state.people.forEach((p,i)=>{if(i===1&&!state.hasPartner)return;if(p.birthDate&&num(p.retirementAge)>0){const y=new Date(p.birthDate).getFullYear()+Math.floor(num(p.retirementAge));items.push({year:y,name:`${p.name||'Household member'} retires`,detail:`Target retirement age ${p.retirementAge}`})}});
 state.incomeSources.forEach(x=>{if(num(x.startAge)>0){const owner=state.people.find(p=>p.name===x.owner)||state.people[0];if(owner?.birthDate){const y=new Date(owner.birthDate).getFullYear()+Math.floor(num(x.startAge));items.push({year:y,name:`${x.name||x.type} begins`,detail:`${money(x.annualAmount)} per year`})}}});
 state.events.forEach(x=>items.push({year:num(x.year)||now,name:x.name||'Timeline event',detail:`${x.type}: ${money(x.amount)}`}));
 return items.filter(x=>x.year>=now-1).sort((a,b)=>a.year-b.year||a.name.localeCompare(b.name));
}
function renderHome(){
 const t=totals(),r=readiness(),name=state.people[0].name?.trim();
 document.getElementById('greeting').textContent=name?`Good ${daypart()}, ${name.split(' ')[0]}`:'Welcome to Harbour North';
 const retirement=state.people[0].retirementAge;
 let status='Build your financial foundation to prepare for a retirement projection.';
 if(r.score>=85)status=`Your financial foundation is strong and ready for projection testing at retirement age ${retirement}.`;
 else if(r.score>=65)status=`Your plan is taking shape. Complete the priority items below before projection testing.`;
 document.getElementById('planSummary').textContent=status;
 document.getElementById('mInvestable').textContent=money(t.invest);document.getElementById('mNetWorth').textContent=money(t.netWorth);document.getElementById('mIncome').textContent=money(t.annualIncome);document.getElementById('mSpending').textContent=money(t.annualSpend);
 const score=document.getElementById('homeScore');score.textContent=r.score;score.classList.toggle('warn',r.score<70);
 document.getElementById('scoreLabel').textContent=r.score>=85?'Strong financial foundation':r.score>=65?'Plan is taking shape':'More information is needed';
 const badge=document.getElementById('readinessBadge');badge.textContent=r.score>=85?'Strong':r.score>=65?'Developing':'Getting started';badge.className='badge '+(r.score>=70?'good':'warn');
 document.getElementById('scoreBreakdown').innerHTML=r.categories.map(c=>{const pct=Math.round(c.score/c.max*100);return `<div class="score-row"><strong>${esc(c.label)}</strong><div class="score-track"><div class="score-fill ${pct>=80?'goodfill':pct<55?'warnfill':''}" style="width:${pct}%"></div></div><div class="score-value">${c.score}/${c.max}</div></div>`}).join('');
 const recs=recommendations(r,t);document.getElementById('recommendations').innerHTML=recs.map((x,i)=>`<div class="recommendation"><strong>${i+1}. ${esc(x[0])}</strong><span class="muted">${esc(x[1])}</span></div>`).join('');
 document.getElementById('strengths').innerHTML=(r.flags.filter(x=>x[0]==='good').slice(0,5).map(x=>`<li>${esc(x[1])}</li>`).join('')||'<li>Complete more of your profile to identify strengths.</li>');
 document.getElementById('actionsList').innerHTML=(r.flags.filter(x=>x[0]==='action').slice(0,5).map(x=>`<li>${esc(x[1])}</li>`).join('')||'<li>Your financial foundation is ready for projection testing.</li>');
 const items=timelineItems();document.getElementById('timelineCount').textContent=`${items.length} event${items.length===1?'':'s'}`;document.getElementById('timeline').innerHTML=items.length?items.slice(0,12).map(x=>`<div class="timeline-item"><div class="timeline-year">${x.year}</div><div class="timeline-name"><strong>${esc(x.name)}</strong></div><div class="muted">${esc(x.detail)}</div></div>`).join(''):'<div class="empty">Add retirement ages, future income, or timeline events to build your financial timeline.</div>';
}

function projectionOptions(){
 return {startYear:num(document.getElementById('projectionStartYear')?.value)||nowYear,planningAge:num(document.getElementById('projectionPlanningAge')?.value)||num(state.household.planningAge)||95};
}
function buildProjectionTimeline(){
 return window.HNTimeline.buildTimeline(state,projectionOptions());
}
function renderProjection(){
 const start=document.getElementById('projectionStartYear'),horizon=document.getElementById('projectionPlanningAge');
 if(!start||!horizon)return;
 if(!start.value)start.value=nowYear;
 if(!horizon.value)horizon.value=num(state.household.planningAge)||95;
 let rows=[];
 try{rows=buildProjectionTimeline()}catch(err){document.getElementById('timelineTestMessage').textContent='Timeline error: '+err.message;return}
 const people=window.HNTimeline.includedPeople(state);
 document.getElementById('pFirstYear').textContent=rows[0]?.year||'—';
 document.getElementById('pFinalYear').textContent=rows.at(-1)?.year||'—';
 document.getElementById('pYearCount').textContent=rows.length;
 document.getElementById('pMilestones').textContent=rows.reduce((s,r)=>s+r.events.length,0);
 const status=document.getElementById('timelineEngineStatus');
 status.textContent=people.length&&people.every(p=>p.birthDate)?'Timeline ready':'Birth dates needed';status.className='badge '+(status.textContent==='Timeline ready'?'good':'warn');
 document.getElementById('projectionHead').innerHTML='<tr><th>Year</th>'+people.map(p=>`<th>${esc(p.name||'Person')} age</th><th>Status</th>`).join('')+'<th>Milestones</th></tr>';
 document.getElementById('projectionBody').innerHTML=rows.length?rows.map(r=>'<tr><td><strong>'+r.year+'</strong></td>'+r.people.map(p=>`<td>${p.age??'—'}</td><td><span class="badge ${p.status==='Retired'?'good':'warn'}">${p.status}</span></td>`).join('')+`<td>${r.events.length?r.events.map(e=>`<div class="timeline-cell"><strong>${esc(e.name)}</strong><span>${esc(e.detail||e.type||'')}</span></div>`).join(''):'<span class="muted">—</span>'}</td></tr>`).join(''):'<tr><td colspan="8" class="empty">Add a valid date of birth to build the timeline.</td></tr>';
}
function runTimelineSelfTests(){
 const result=window.HNTimeline.runSelfTests();
 const el=document.getElementById('timelineTestMessage');el.textContent=result.ok?`All ${result.total} timeline tests passed.`:`${result.failed.length} of ${result.total} tests failed: ${result.failed.join('; ')}`;el.style.color=result.ok?'var(--ok)':'var(--danger)';
}
function downloadTimelineCsv(){
 const rows=buildProjectionTimeline(),people=window.HNTimeline.includedPeople(state);
 const headers=['Year',...people.flatMap(p=>[`${p.name||'Person'} Age`,`${p.name||'Person'} Status`]),'Milestones'];
 const csv=[headers,...rows.map(r=>[r.year,...r.people.flatMap(p=>[p.age??'',p.status]),r.events.map(e=>e.name).join(' | ')])].map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\n');
 const blob=new Blob([csv],{type:'text/csv'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`Harbour-North-timeline-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);
}

function daypart(){const h=new Date().getHours();return h<12?'morning':h<17?'afternoon':'evening'}
function showPage(id){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.page===id));if(id==='ledger')renderAllLists();if(id==='home')renderHome();if(id==='projection')renderProjection();window.scrollTo({top:0,behavior:'smooth'})}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>showPage(b.dataset.page));document.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>showPage(b.dataset.goto));
document.getElementById('addAccount').onclick=()=>{state.accounts.push(account('New account','RRSP/RRIF',state.people[0].name||'Primary',0));renderAccounts();save()};document.getElementById('addIncome').onclick=()=>{state.incomeSources.push(income('New income','Salary',state.people[0].name||'Primary',0,0,state.people[0].retirementAge||65,true));renderIncome();save()};document.getElementById('addDebt').onclick=()=>{state.debts.push(debt('New debt','Line of credit',0));renderDebts();save()};document.getElementById('addExpense').onclick=()=>{state.expenses.push(expense('New spending','Essential',0,'Monthly'));renderExpenses();save()};document.getElementById('addEvent').onclick=()=>{state.events.push(eventItem('New event','Expense',0,nowYear+3));renderEvents();save()};
['accountsList','incomeList','debtList','expenseList','eventList'].forEach(x=>{const el=document.getElementById(x);el.addEventListener('input',listHandler);el.addEventListener('change',listHandler);el.addEventListener('click',listHandler)});
document.getElementById('exportBtn').onclick=()=>{const payload={product:'Harbour North',version:APP,schemaVersion:SCHEMA,exportedAt:new Date().toISOString(),plan:state};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`Harbour-North-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);document.getElementById('backupMessage').textContent='Backup exported successfully.'};
document.getElementById('importFile').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>5_000_000)throw new Error('Backup file is too large.');const parsed=JSON.parse(await f.text());const imported=migrate(parsed);localStorage.setItem(KEY+'.recovery',JSON.stringify(state));state=imported;save(false);location.reload()}catch(err){document.getElementById('backupMessage').textContent='Import failed: '+err.message}};
document.getElementById('healthBtn').onclick=()=>{const issues=[];if(!state.meta||state.meta.schemaVersion!==SCHEMA)issues.push('Schema version mismatch');for(const key of ['accounts','incomeSources','debts','expenses','events'])if(!Array.isArray(state[key]))issues.push(`${key} is invalid`);const ids=[...state.accounts,...state.incomeSources,...state.debts,...state.expenses,...state.events].map(x=>x.id);if(new Set(ids).size!==ids.length)issues.push('Duplicate record IDs found');document.getElementById('backupMessage').textContent=issues.length?'Health check found: '+issues.join('; '):'Data health check passed.'};
document.getElementById('resetBtn').onclick=()=>{if(confirm('Reset all Harbour North data on this device?')){localStorage.removeItem(KEY);location.reload()}};

document.getElementById('projectionStartYear').addEventListener('input',renderProjection);
document.getElementById('projectionPlanningAge').addEventListener('input',()=>{state.household.planningAge=num(document.getElementById('projectionPlanningAge').value);save();renderProjection()});
document.getElementById('runTimelineTests').onclick=runTimelineSelfTests;
document.getElementById('downloadTimelineCsv').onclick=downloadTimelineCsv;

bindStatic();renderAllLists();renderHome();renderProjection();save(false);
