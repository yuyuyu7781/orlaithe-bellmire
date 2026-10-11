import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),directory=path.dirname(new URL(import.meta.url).pathname),source=fs.readFileSync(path.join(directory,'capital-browser.cjs'),'utf8');
for(const [environment,option,expected] of [[undefined,undefined,'chromium'],['webkit',undefined,'webkit'],['chromium',undefined,'chromium'],['webkit','chromium','chromium'],['chromium','webkit','webkit']]){
 const launched=[],api={},page={on(){},async route(){},async goto(){},async waitForSelector(){}};
 const factory=name=>({async launch(){launched.push(name);return {browserType:()=>({name:()=>name}),async newPage(){return page;},async close(){}};}});
 vm.runInNewContext(source,{exports:api,__dirname:directory,process:{env:{ORLAITHE_BROWSER_ENGINE:environment}},require:name=>name==='playwright'?{chromium:factory('chromium'),webkit:factory('webkit')}:require(name)});
 await api.boot(option?{engine:option}:{});assert.deepEqual(launched,[expected],'CI must launch its requested browser engine');
}
console.log('PASS default/CI browser engine and explicit override; WebKit cannot silently run Chromium');
