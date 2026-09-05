const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../docs');
const files=['data/schedule.js','data/sources.js','data/content-helpers.js','data/knowledge-maps.js','data/d1.js','data/d2.js','data/d3.js','data/d4.js','data/d4-final.js','data/d5.js','data/d5-final.js','data/d6.js','data/d7.js','data/d7-final.js','data/exams.js'];
const context=vm.createContext({window:{}});files.forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f}));
const A=context.window.AcademyData,errors=[],assert=(v,m)=>{if(!v)errors.push(m)};
assert(A.schedule.length===78,`Schedule count ${A.schedule.length}, expected 78`);
assert(new Set(A.schedule.map(s=>s.date)).size===78,'Schedule dates are not unique');
assert(A.schedule[0].date==='2026-09-06'&&A.schedule.at(-1).date==='2026-12-04','Study date endpoints wrong');
assert(A.exam.date==='2026-12-05'&&!A.schedule.some(s=>s.date===A.exam.date),'Exam day must have no study session');
A.schedule.forEach(s=>{const weekday=new Intl.DateTimeFormat('en-US',{weekday:'long',timeZone:'UTC'}).format(new Date(s.date+'T12:00:00Z'));assert(weekday===s.day,`Session ${s.id} weekday mismatch`);assert(s.day!=='Friday'||s.id===78,`Unexpected Friday session ${s.id}`)});
const ranges={D1:[1,12],D2:[13,24],D3:[25,30],D4:[31,48],D5:[49,60],D6:[61,66],D7:[67,78]};Object.entries(ranges).forEach(([d,[a,b]])=>A.schedule.filter(s=>s.id>=a&&s.id<=b).forEach(s=>assert(s.domain===d,`Session ${s.id} wrong domain`)));
assert(A.lessons.length===78,`Lesson count ${A.lessons.length}, expected 78`);assert(new Set(A.lessons.map(l=>l.id)).size===78,'Lesson ids not unique');
assert(new Set(A.lessons.map(l=>l.centralQuestion)).size===78,'Central questions are not unique');
const promptSet=new Set();A.lessons.forEach(l=>{
  const s=A.schedule.find(x=>x.id===l.id);assert(s,`Lesson ${l.id} absent from schedule`);assert(l.objective&&l.objective.length>45,`Lesson ${l.id} objective too short`);assert(l.sections?.length>=3,`Lesson ${l.id} needs >=3 sections`);assert(l.glossary?.length>=4,`Lesson ${l.id} glossary too short`);assert(l.exercise?.duration>=30&&l.exercise?.parts?.length>=4&&l.exercise?.solution?.length>100,`Lesson ${l.id} exercise incomplete`);assert(l.sources?.core?.length&&l.sources?.deep?.length,`Lesson ${l.id} sources incomplete`);
  [...l.sources.core,...l.sources.deep].forEach(k=>assert(A.sources[k]?.url?.startsWith('https://'),`Lesson ${l.id} missing source ${k}`));
  const min=s.day==='Saturday'?10:7;assert(l.quiz?.length>=min,`Lesson ${l.id} has ${l.quiz?.length} questions, needs ${min}`);
  l.quiz.forEach(q=>{assert(!promptSet.has(q.prompt),`Duplicate prompt: ${q.prompt}`);promptSet.add(q.prompt);assert(q.options?.length===4,`${q.id} needs four options`);assert(q.options.every(o=>o.rationale&&o.rationale.length>3),`${q.id} missing option rationale`);assert(q.options.filter(o=>o.correct).length===1,`${q.id} must have one correct option`)})
});
assert(Object.keys(A.knowledgeMaps).length===7,'Knowledge maps missing domains');
assert(A.assessmentConfigs.domains.length===7,'Domain exam count wrong');A.assessmentConfigs.domains.forEach(c=>assert(c.questionCount>=20&&c.questionCount<=25,`${c.id} question count invalid`));
const full=A.assessmentConfigs.mocks.filter(x=>x.type==='mock');assert(full.length>=1,'Full mock missing');full.forEach(c=>{assert(c.questionCount===140&&c.minutes===210,`${c.id} timing/count wrong`);assert(Object.values(c.weights).reduce((a,b)=>a+b,0)===140,`${c.id} weights do not total 140`);assert(JSON.stringify(c.weights)===JSON.stringify({D1:24,D2:23,D3:20,D4:25,D5:18,D6:21,D7:9}),`${c.id} weights wrong`)});assert(A.assessmentConfigs.mocks.some(x=>x.type==='mixed'&&x.questionCount===50),'50-question mixed mode missing');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');[...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m=>m[1]).filter(x=>!x.startsWith('http')).forEach(x=>assert(fs.existsSync(path.join(root,x)),`Missing local asset ${x}`));
console.log(JSON.stringify({sessions:A.schedule.length,lessons:A.lessons.length,practiceQuestions:promptSet.size,sources:Object.keys(A.sources).length,domainExams:A.assessmentConfigs.domains.length,fullMocks:full.length,errors},null,2));if(errors.length)process.exit(1);
