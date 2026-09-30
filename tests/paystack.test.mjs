import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import ts from 'typescript';
const source = readFileSync(new URL('../supabase/functions/paystack/index.ts',import.meta.url),'utf8').replace(/^import .*createClient.*;\s*/m,'');
const compiled = ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
const reference = 'ATFP-12345678-1234-1234-1234-123456789abc';
async function call(body, overrides = {}, signature) {
  let handler; const writes = []; const calls = [];
  const ticket = { id:'ticket-id', ticket_code:'ATF-1234567890', email:'test@example.com', payment_reference:reference, payment_status:'pending', payment_amount:5000000, status:'pending', ...overrides.ticket };
  const transaction = { status:'success',amount:5000000,currency:'NGN',domain:'live',reference,customer:{email:ticket.email},...overrides.transaction };
  const db = { from() { const chain = { insert(row){writes.push(row);return chain}, update(row){writes.push(row);Object.assign(ticket,row);return chain}, select(){return chain}, eq(){return chain}, single:async()=>({data:ticket,error:null}), then(resolve){return Promise.resolve({error:null}).then(resolve)} }; return chain; } };
  const fetchMock = async (url,options) => { calls.push({url,options}); return Response.json({status:true,data:url.includes('initialize') ? {authorization_url:'https://checkout.paystack.com/test',reference} : transaction}); };
  vm.runInNewContext(compiled,{createClient:()=>db,Deno:{env:{get:name=>({PAYSTACK_SECRET_KEY:overrides.key || 'sk_live_example',SUPABASE_URL:'https://project.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'server-only',PAYSTACK_SITE_URL:'http://127.0.0.1:5175'}[name])},serve:fn=>{handler=fn}},crypto:webcrypto,TextEncoder,Uint8Array,Response,fetch:fetchMock});
  const response = await handler(new Request('http://local/paystack',{method:'POST',headers:signature ? {'x-paystack-signature':signature}:{},body:JSON.stringify(body)}));
  return {status:response.status,body:await response.json(),writes,calls};
}
test('server fixes Premium amount regardless of client-supplied amount',async()=>{const result=await call({action:'initialize',input:{full_name:'Test',email:'test@example.com',phone:'08012345678',attendance_date:'2026-11-17',amount:1,ticket_type:'Regular pass'}});assert.equal(result.status,200);assert.equal(result.writes[0].payment_amount,5000000);assert.equal(result.writes[0].status,'pending');assert.equal(JSON.parse(result.calls[0].options.body).amount,5000000)});
test('test secret cannot enable production charges',async()=>{assert.equal((await call({action:'initialize'},{key:'sk_test_example'})).status,503)});
test('failed payment never confirms a ticket',async()=>{const r=await call({action:'verify',reference},{transaction:{status:'failed'}});assert.equal(r.status,409);assert.equal(r.writes.length,0)});
for(const mismatch of [{amount:50000},{currency:'USD'},{domain:'test'},{customer:{email:'wrong@example.com'}},{reference:'another-reference'}]) test(`rejects mismatched payment ${JSON.stringify(mismatch)}`,async()=>{const r=await call({action:'verify',reference},{transaction:mismatch});assert.equal(r.status,409);assert.equal(r.writes.length,0)});
test('valid live payment confirms once and returns an admission pass',async()=>{const r=await call({action:'verify',reference});assert.equal(r.status,200);assert.equal(r.writes[0].payment_status,'paid');assert.equal(r.body.test,false);assert.equal(r.calls.length,2)});
test('already paid callback does not update or email again',async()=>{const r=await call({action:'verify',reference},{ticket:{payment_status:'paid',status:'confirmed'}});assert.equal(r.status,200);assert.equal(r.writes.length,0)});
test('cancelled ticket cannot be resurrected by callback',async()=>{const r=await call({action:'verify',reference},{ticket:{status:'cancelled'}});assert.equal(r.status,409);assert.equal(r.writes.length,0)});
test('forged webhook rejected before any database write',async()=>{const r=await call({event:'charge.success',data:{reference}},{},'0'.repeat(128));assert.equal(r.status,401);assert.equal(r.writes.length,0)});
test('signed webhook verifies the transaction with Paystack',async()=>{const body={event:'charge.success',data:{reference}};const key=await webcrypto.subtle.importKey('raw',new TextEncoder().encode('sk_live_example'),{name:'HMAC',hash:'SHA-512'},false,['sign']);const signature=Buffer.from(await webcrypto.subtle.sign('HMAC',key,new TextEncoder().encode(JSON.stringify(body)))).toString('hex');const r=await call(body,{},signature);assert.equal(r.status,200);assert.equal(r.writes[0].status,'confirmed')});

test('customer-paid processing fee preserves the requested ticket price',async()=>{const r=await call({action:'verify',reference},{transaction:{requested_amount:5000000,amount:5086295,fees:86295}});assert.equal(r.status,200);assert.equal(r.writes[0].payment_status,'paid')});
test('unexplained excess amount is rejected',async()=>{const r=await call({action:'verify',reference},{transaction:{requested_amount:5000000,amount:5086295,fees:10000}});assert.equal(r.status,409);assert.equal(r.writes.length,0)});
test('wrong requested price is rejected even when total matches',async()=>{const r=await call({action:'verify',reference},{transaction:{requested_amount:4900000,amount:5000000,fees:100000}});assert.equal(r.status,409);assert.equal(r.writes.length,0)});
