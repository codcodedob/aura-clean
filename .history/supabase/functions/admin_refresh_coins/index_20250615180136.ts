index.tsx:102 
            
            
           POST https://ofhpjvbmrfwbmboxibur.functions.supabase.co/admin_refresh_coins net::ERR_FAILED 200 (OK)
refreshMarketData @ index.tsx:102
executeDispatch @ react-dom-client.development.js:16368
runWithFiberInDEV @ react-dom-client.development.js:1519
processDispatchQueue @ react-dom-client.development.js:16418
(anonymous) @ react-dom-client.development.js:17016
batchedUpdates$1 @ react-dom-client.development.js:3262
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16572
dispatchEvent @ react-dom-client.development.js:20658
dispatchDiscreteEvent @ react-dom-client.development.js:20626
<button>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:346
Home @ index.tsx:297
react-stack-bottom-frame @ react-dom-client.development.js:23863
renderWithHooksAgain @ react-dom-client.development.js:5629
renderWithHooks @ react-dom-client.development.js:5541
updateFunctionComponent @ react-dom-client.development.js:8897
beginWork @ react-dom-client.development.js:10522
runWithFiberInDEV @ react-dom-client.development.js:1519
performUnitOfWork @ react-dom-client.development.js:15132
workLoopSync @ react-dom-client.development.js:14956
renderRootSync @ react-dom-client.development.js:14936
performWorkOnRoot @ react-dom-client.development.js:14419
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16216
performWorkUntilDeadline @ scheduler.development.js:45
<Home>
exports.jsx @ react-jsx-runtime.development.js:339
render @ _app.tsx:44
react-stack-bottom-frame @ react-dom-client.development.js:23876
updateClassComponent @ react-dom-client.development.js:9454
beginWork @ react-dom-client.development.js:10536
runWithFiberInDEV @ react-dom-client.development.js:1519
performUnitOfWork @ react-dom-client.development.js:15132
workLoopSync @ react-dom-client.development.js:14956
renderRootSync @ react-dom-client.development.js:14936
performWorkOnRoot @ react-dom-client.development.js:14419
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16216
performWorkUntilDeadline @ scheduler.development.js:45
<App>
exports.jsx @ react-jsx-runtime.development.js:339
renderApp @ index.tsx:298
doRender @ index.tsx:787
render @ index.tsx:825
hydrate @ index.tsx:1003
await in hydrate
pageBootstrap @ page-bootstrap.ts:23
(anonymous) @ next-dev-turbopack.ts:49
Promise.then
[project]/node_modules/next/dist/client/next-dev-turbopack.js [client] (ecmascript) @ next-dev-turbopack.ts:28
(anonymous) @ dev-base.ts:201
runModuleExecutionHooks @ dev-base.ts:261
instantiateModule @ dev-base.ts:199
getOrInstantiateRuntimeModule @ dev-base.ts:97
registerChunk @ runtime-backend-dom.ts:85
await in registerChunk
registerChunk @ runtime-base.ts:356
(anonymous) @ dev-backend-dom.ts:127
(anonymous) @ dev-backend-dom.ts:127Understand this error
client.ts:57 TypeError: Failed to fetch
    at refreshMarketData (index.tsx:102:25)
    at executeDispatch (react-dom-client.development.js:16368:9)
    at runWithFiberInDEV (react-dom-client.development.js:1519:30)
    at processDispatchQueue (react-dom-client.development.js:16418:19)
    at react-dom-client.development.js:17016:9
    at batchedUpdates$1 (react-dom-client.development.js:3262:40)
    at dispatchEventForPluginEventSystem (react-dom-client.development.js:16572:7)
    at dispatchEvent (react-dom-client.development.js:20658:11)
    at dispatchDiscreteEvent (react-dom-client.development.js:20626:11)