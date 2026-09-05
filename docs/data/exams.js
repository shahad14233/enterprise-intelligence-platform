(function(){
  'use strict';
  const domainMinutes={D1:35,D2:35,D3:35,D4:40,D5:35,D6:35,D7:35};
  window.AcademyData.assessmentConfigs={
    domains:Object.keys(window.AcademyData.domains).map(domain=>({
      id:'domain-'+domain.toLowerCase(),type:'domain',domain,
      title:domain+' Domain Exam',label:'Certification-style Practice',
      questionCount:domain==='D4'?25:22,minutes:domainMinutes[domain],offset:0
    })),
    mocks:[
      {id:'full-a',type:'mock',title:'Full Mock A',label:'Certification-style Practice',questionCount:140,minutes:210,offset:0,weights:{D1:24,D2:23,D3:20,D4:25,D5:18,D6:21,D7:9}},
      {id:'full-b',type:'mock',title:'Full Mock B',label:'Expert Practice',questionCount:140,minutes:210,offset:29,weights:{D1:24,D2:23,D3:20,D4:25,D5:18,D6:21,D7:9}},
      {id:'mixed-50',type:'mixed',title:'50-question Mixed Practice',label:'Expert Practice',questionCount:50,minutes:75,offset:13}
    ]
  };
})();
