const { chromium }=require('playwright');
const path=require('path');
(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url='file://'+path.resolve(__dirname,'../docs/index.html');
  await page.goto(url);await page.waitForSelector('h1');
  const dashboard=await page.locator('h1').textContent();
  await page.evaluate(()=>location.hash='#/sessions');await page.waitForSelector('.session-row');
  const sessions=await page.locator('.session-row').count();
  await page.evaluate(()=>location.hash='#/lesson/1');await page.waitForSelector('.lesson-content');
  const lessonSections=await page.locator('.lesson-content>section').count();
  const questions=await page.locator('.question-card').count();
  await page.evaluate(()=>location.hash='#/glossary');await page.waitForSelector('#glossaryList');
  const glossaryTerms=await page.locator('.search-result').count();
  await page.evaluate(()=>location.hash='#/exam/domain-d1');await page.waitForSelector('#startExam');
  await page.click('#startExam');await page.waitForSelector('#examTimer');
  const examNav=await page.locator('[data-exam-go]').count();
  console.log(JSON.stringify({dashboard,sessions,lessonSections,questions,glossaryTerms,examNav,errors},null,2));
  if(sessions!==78||questions<7||examNav<20||errors.length)process.exitCode=1;
  await browser.close();
})().catch(error=>{
  if(String(error.message).includes('Executable doesn\'t exist')){
    console.log('Browser smoke test skipped: Playwright Chromium is not installed.');
    return;
  }
  console.error(error);
  process.exitCode=1;
});
