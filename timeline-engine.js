(function(global){
  'use strict';
  const asNumber=v=>Number.isFinite(Number(v))?Number(v):0;
  const validDate=v=>typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v+'T00:00:00').getTime());
  function includedPeople(plan){
    const people=Array.isArray(plan?.people)?plan.people:[];
    return people.filter((_,i)=>i===0 || plan.hasPartner!==false);
  }
  function ageAtYearEnd(birthDate,year){
    if(!validDate(birthDate))return null;
    return year-new Date(birthDate+'T00:00:00').getFullYear();
  }
  function yearAtAge(birthDate,age){
    if(!validDate(birthDate)||asNumber(age)<0)return null;
    return new Date(birthDate+'T00:00:00').getFullYear()+Math.ceil(asNumber(age));
  }
  function finalProjectionYear(plan,startYear,planningAge){
    const years=includedPeople(plan).map(p=>yearAtAge(p.birthDate,planningAge)).filter(Number.isFinite);
    return years.length?Math.max(startYear,...years):startYear;
  }
  function milestoneEvents(plan){
    const events=[];
    const people=includedPeople(plan);
    people.forEach(person=>{
      const year=yearAtAge(person.birthDate,person.retirementAge);
      if(year)events.push({year,name:`${person.name||'Household member'} retires`,type:'Retirement',detail:`Target retirement age ${person.retirementAge}`});
    });
    for(const source of plan?.incomeSources||[]){
      const owner=people.find(p=>p.name===source.owner)||people[0];
      if(!owner)continue;
      const start=asNumber(source.startAge)>0?yearAtAge(owner.birthDate,source.startAge):null;
      const end=asNumber(source.endAge)>0&&asNumber(source.endAge)<110?yearAtAge(owner.birthDate,source.endAge):null;
      if(start)events.push({year:start,name:`${source.name||source.type||'Income'} begins`,type:'Income start',detail:`${source.owner||owner.name||''}`});
      if(end)events.push({year:end,name:`${source.name||source.type||'Income'} ends`,type:'Income end',detail:`${source.owner||owner.name||''}`});
    }
    for(const e of plan?.events||[]){
      const year=Math.trunc(asNumber(e.year));
      if(year)events.push({year,name:e.name||'Timeline event',type:e.type||'Event',detail:e.amount?`${e.type||'Event'} · $${Math.round(asNumber(e.amount)).toLocaleString('en-CA')}`:(e.type||'Event')});
    }
    return events.sort((a,b)=>a.year-b.year||a.name.localeCompare(b.name));
  }
  function buildTimeline(plan,options={}){
    if(!plan||typeof plan!=='object')throw new TypeError('A Harbour North plan object is required.');
    const startYear=Math.trunc(asNumber(options.startYear)||new Date().getFullYear());
    const planningAge=Math.trunc(asNumber(options.planningAge)||asNumber(plan.household?.planningAge)||95);
    if(startYear<1900||startYear>2300)throw new RangeError('Projection start year is outside the supported range.');
    if(planningAge<40||planningAge>120)throw new RangeError('Planning horizon age must be between 40 and 120.');
    const people=includedPeople(plan);
    const endYear=finalProjectionYear(plan,startYear,planningAge);
    const milestones=milestoneEvents(plan);
    const byYear=new Map();
    milestones.forEach(e=>{if(!byYear.has(e.year))byYear.set(e.year,[]);byYear.get(e.year).push(e)});
    const rows=[];
    for(let year=startYear;year<=endYear;year++){
      rows.push({year,people:people.map(p=>{const age=ageAtYearEnd(p.birthDate,year);const retirementAge=asNumber(p.retirementAge)||65;return{name:p.name||'Household member',age,retirementAge,status:age===null?'Unknown':age>=retirementAge?'Retired':'Working'}}),events:byYear.get(year)||[]});
    }
    return rows;
  }
  function runSelfTests(){
    const failures=[];let total=0;
    const test=(name,fn)=>{total++;try{if(!fn())failures.push(name)}catch{failures.push(name)}};
    test('Age calculation',()=>ageAtYearEnd('1974-07-23',2026)===52);
    test('Retirement year with half age',()=>yearAtAge('1974-07-23',55.5)===2030);
    test('Partner exclusion',()=>includedPeople({hasPartner:false,people:[{},{}]}).length===1);
    test('Timeline inclusive endpoints',()=>buildTimeline({hasPartner:false,people:[{name:'A',birthDate:'2000-01-01',retirementAge:65}],household:{planningAge:40},incomeSources:[],events:[]},{startYear:2036,planningAge:40}).length===5);
    test('Retirement status transition',()=>{const r=buildTimeline({hasPartner:false,people:[{name:'A',birthDate:'2000-01-01',retirementAge:40}],household:{planningAge:41},incomeSources:[],events:[]},{startYear:2039,planningAge:41});return r[0].people[0].status==='Working'&&r[1].people[0].status==='Retired'});
    test('User event attachment',()=>buildTimeline({hasPartner:false,people:[{name:'A',birthDate:'2000-01-01',retirementAge:65}],household:{planningAge:40},incomeSources:[],events:[{name:'Goal',type:'Expense',year:2037,amount:1000}]},{startYear:2036,planningAge:40})[1].events.some(e=>e.name==='Goal'));
    return {ok:failures.length===0,total,failed:failures};
  }
  global.HNTimeline={includedPeople,ageAtYearEnd,yearAtAge,milestoneEvents,buildTimeline,runSelfTests};
  if(typeof module!=='undefined'&&module.exports)module.exports=global.HNTimeline;
})(typeof window!=='undefined'?window:globalThis);
