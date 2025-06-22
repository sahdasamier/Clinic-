const zm=()=>{};var ju={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qh=function(r){const e=[];let t=0;for(let n=0;n<r.length;n++){let i=r.charCodeAt(n);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&n+1<r.length&&(r.charCodeAt(n+1)&64512)===56320?(i=65536+((i&1023)<<10)+(r.charCodeAt(++n)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},$m=function(r){const e=[];let t=0,n=0;for(;t<r.length;){const i=r[t++];if(i<128)e[n++]=String.fromCharCode(i);else if(i>191&&i<224){const s=r[t++];e[n++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=r[t++],o=r[t++],c=r[t++],u=((i&7)<<18|(s&63)<<12|(o&63)<<6|c&63)-65536;e[n++]=String.fromCharCode(55296+(u>>10)),e[n++]=String.fromCharCode(56320+(u&1023))}else{const s=r[t++],o=r[t++];e[n++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},jh={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,e){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let i=0;i<r.length;i+=3){const s=r[i],o=i+1<r.length,c=o?r[i+1]:0,u=i+2<r.length,h=u?r[i+2]:0,f=s>>2,m=(s&3)<<4|c>>4;let _=(c&15)<<2|h>>6,b=h&63;u||(b=64,o||(_=64)),n.push(t[f],t[m],t[_],t[b])}return n.join("")},encodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(r):this.encodeByteArray(qh(r),e)},decodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(r):$m(this.decodeStringToByteArray(r,e))},decodeStringToByteArray(r,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let i=0;i<r.length;){const s=t[r.charAt(i++)],c=i<r.length?t[r.charAt(i)]:0;++i;const h=i<r.length?t[r.charAt(i)]:64;++i;const m=i<r.length?t[r.charAt(i)]:64;if(++i,s==null||c==null||h==null||m==null)throw new Km;const _=s<<2|c>>4;if(n.push(_),h!==64){const b=c<<4&240|h>>2;if(n.push(b),m!==64){const C=h<<6&192|m;n.push(C)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class Km extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Gm=function(r){const e=qh(r);return jh.encodeByteArray(e,!0)},zh=function(r){return Gm(r).replace(/\./g,"")},$h=function(r){try{return jh.decodeString(r,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kh(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hm=()=>Kh().__FIREBASE_DEFAULTS__,Wm=()=>{if(typeof process>"u"||typeof ju>"u")return;const r=ju.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},Qm=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=r&&$h(r[1]);return e&&JSON.parse(e)},zs=()=>{try{return zm()||Hm()||Wm()||Qm()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},Ym=r=>{var e,t;return(t=(e=zs())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[r]},Gh=()=>{var r;return(r=zs())===null||r===void 0?void 0:r.config},Hh=r=>{var e;return(e=zs())===null||e===void 0?void 0:e[`_${r}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jm{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,n))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function di(r){return r.endsWith(".cloudworkstations.dev")}async function Wh(r){return(await fetch(r,{credentials:"include"})).ok}const Br={};function Xm(){const r={prod:[],emulator:[]};for(const e of Object.keys(Br))Br[e]?r.emulator.push(e):r.prod.push(e);return r}function Zm(r){let e=document.getElementById(r),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",r),t=!0),{created:t,element:e}}let zu=!1;function eg(r,e){if(typeof window>"u"||typeof document>"u"||!di(window.location.host)||Br[r]===e||Br[r]||zu)return;Br[r]=e;function t(_){return`__firebase__banner__${_}`}const n="__firebase__banner",s=Xm().prod.length>0;function o(){const _=document.getElementById(n);_&&_.remove()}function c(_){_.style.display="flex",_.style.background="#7faaf0",_.style.position="fixed",_.style.bottom="5px",_.style.left="5px",_.style.padding=".5em",_.style.borderRadius="5px",_.style.alignItems="center"}function u(_,b){_.setAttribute("width","24"),_.setAttribute("id",b),_.setAttribute("height","24"),_.setAttribute("viewBox","0 0 24 24"),_.setAttribute("fill","none"),_.style.marginLeft="-6px"}function h(){const _=document.createElement("span");return _.style.cursor="pointer",_.style.marginLeft="16px",_.style.fontSize="24px",_.innerHTML=" &times;",_.onclick=()=>{zu=!0,o()},_}function f(_,b){_.setAttribute("id",b),_.innerText="Learn more",_.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",_.setAttribute("target","__blank"),_.style.paddingLeft="5px",_.style.textDecoration="underline"}function m(){const _=Zm(n),b=t("text"),C=document.getElementById(b)||document.createElement("span"),k=t("learnmore"),D=document.getElementById(k)||document.createElement("a"),$=t("preprendIcon"),B=document.getElementById($)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(_.created){const L=_.element;c(L),f(D,k);const H=h();u(B,$),L.append(B,C,D,H),document.body.appendChild(L)}s?(C.innerText="Preview backend disconnected.",B.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(B.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,C.innerText="Preview backend running in this workspace."),C.setAttribute("id",b)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",m):m()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fe(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function tg(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(fe())}function Qh(){var r;const e=(r=zs())===null||r===void 0?void 0:r.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function ng(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function rg(){const r=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof r=="object"&&r.id!==void 0}function ig(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function sg(){const r=fe();return r.indexOf("MSIE ")>=0||r.indexOf("Trident/")>=0}function Yh(){return!Qh()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Jh(){return!Qh()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function Xh(){try{return typeof indexedDB=="object"}catch{return!1}}function og(){return new Promise((r,e)=>{try{let t=!0;const n="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(n);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(n),r(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var s;e(((s=i.error)===null||s===void 0?void 0:s.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ag="FirebaseError";class ft extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name=ag,Object.setPrototypeOf(this,ft.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,fi.prototype.create)}}class fi{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?cg(s,n):"Error",c=`${this.serviceName}: ${o} (${i}).`;return new ft(i,c,n)}}function cg(r,e){return r.replace(ug,(t,n)=>{const i=e[n];return i!=null?String(i):`<${n}?>`})}const ug=/\{\$([^}]+)}/g;function lg(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}function cn(r,e){if(r===e)return!0;const t=Object.keys(r),n=Object.keys(e);for(const i of t){if(!n.includes(i))return!1;const s=r[i],o=e[i];if($u(s)&&$u(o)){if(!cn(s,o))return!1}else if(s!==o)return!1}for(const i of n)if(!t.includes(i))return!1;return!0}function $u(r){return r!==null&&typeof r=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pi(r){const e=[];for(const[t,n]of Object.entries(r))Array.isArray(n)?n.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}function xr(r){const e={};return r.replace(/^\?/,"").split("&").forEach(n=>{if(n){const[i,s]=n.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function Or(r){const e=r.indexOf("?");if(!e)return"";const t=r.indexOf("#",e);return r.substring(e,t>0?t:void 0)}function hg(r,e){const t=new dg(r,e);return t.subscribe.bind(t)}class dg{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(n=>{this.error(n)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,n){let i;if(e===void 0&&t===void 0&&n===void 0)throw new Error("Missing Observer.");fg(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:n},i.next===void 0&&(i.next=Ko),i.error===void 0&&(i.error=Ko),i.complete===void 0&&(i.complete=Ko);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function fg(r,e){if(typeof r!="object"||r===null)return!1;for(const t of e)if(t in r&&typeof r[t]=="function")return!0;return!1}function Ko(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function re(r){return r&&r._delegate?r._delegate:r}class un{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yt="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pg{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const n=new Jm;if(this.instancesDeferred.set(t,n),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&n.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(gg(e))try{this.getOrInitializeService({instanceIdentifier:Yt})}catch{}for(const[t,n]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const s=this.getOrInitializeService({instanceIdentifier:i});n.resolve(s)}catch{}}}}clearInstance(e=Yt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Yt){return this.instances.has(e)}getOptions(e=Yt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[s,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(s);n===c&&o.resolve(i)}return i}onInit(e,t){var n;const i=this.normalizeInstanceIdentifier(t),s=(n=this.onInitCallbacks.get(i))!==null&&n!==void 0?n:new Set;s.add(e),this.onInitCallbacks.set(i,s);const o=this.instances.get(i);return o&&e(o,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const i of n)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:mg(e),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=Yt){return this.component?this.component.multipleInstances?e:Yt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function mg(r){return r===Yt?void 0:r}function gg(r){return r.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _g{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new pg(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var W;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(W||(W={}));const yg={debug:W.DEBUG,verbose:W.VERBOSE,info:W.INFO,warn:W.WARN,error:W.ERROR,silent:W.SILENT},Ig=W.INFO,Eg={[W.DEBUG]:"log",[W.VERBOSE]:"log",[W.INFO]:"info",[W.WARN]:"warn",[W.ERROR]:"error"},vg=(r,e,...t)=>{if(e<r.logLevel)return;const n=new Date().toISOString(),i=Eg[e];if(i)console[i](`[${n}]  ${r.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Fa{constructor(e){this.name=e,this._logLevel=Ig,this._logHandler=vg,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in W))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?yg[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,W.DEBUG,...e),this._logHandler(this,W.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,W.VERBOSE,...e),this._logHandler(this,W.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,W.INFO,...e),this._logHandler(this,W.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,W.WARN,...e),this._logHandler(this,W.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,W.ERROR,...e),this._logHandler(this,W.ERROR,...e)}}const Tg=(r,e)=>e.some(t=>r instanceof t);let Ku,Gu;function wg(){return Ku||(Ku=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Ag(){return Gu||(Gu=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Zh=new WeakMap,ia=new WeakMap,ed=new WeakMap,Go=new WeakMap,Ua=new WeakMap;function Rg(r){const e=new Promise((t,n)=>{const i=()=>{r.removeEventListener("success",s),r.removeEventListener("error",o)},s=()=>{t(Dt(r.result)),i()},o=()=>{n(r.error),i()};r.addEventListener("success",s),r.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&Zh.set(t,r)}).catch(()=>{}),Ua.set(e,r),e}function bg(r){if(ia.has(r))return;const e=new Promise((t,n)=>{const i=()=>{r.removeEventListener("complete",s),r.removeEventListener("error",o),r.removeEventListener("abort",o)},s=()=>{t(),i()},o=()=>{n(r.error||new DOMException("AbortError","AbortError")),i()};r.addEventListener("complete",s),r.addEventListener("error",o),r.addEventListener("abort",o)});ia.set(r,e)}let sa={get(r,e,t){if(r instanceof IDBTransaction){if(e==="done")return ia.get(r);if(e==="objectStoreNames")return r.objectStoreNames||ed.get(r);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Dt(r[e])},set(r,e,t){return r[e]=t,!0},has(r,e){return r instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in r}};function Pg(r){sa=r(sa)}function Sg(r){return r===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const n=r.call(Ho(this),e,...t);return ed.set(n,e.sort?e.sort():[e]),Dt(n)}:Ag().includes(r)?function(...e){return r.apply(Ho(this),e),Dt(Zh.get(this))}:function(...e){return Dt(r.apply(Ho(this),e))}}function Cg(r){return typeof r=="function"?Sg(r):(r instanceof IDBTransaction&&bg(r),Tg(r,wg())?new Proxy(r,sa):r)}function Dt(r){if(r instanceof IDBRequest)return Rg(r);if(Go.has(r))return Go.get(r);const e=Cg(r);return e!==r&&(Go.set(r,e),Ua.set(e,r)),e}const Ho=r=>Ua.get(r);function Vg(r,e,{blocked:t,upgrade:n,blocking:i,terminated:s}={}){const o=indexedDB.open(r,e),c=Dt(o);return n&&o.addEventListener("upgradeneeded",u=>{n(Dt(o.result),u.oldVersion,u.newVersion,Dt(o.transaction),u)}),t&&o.addEventListener("blocked",u=>t(u.oldVersion,u.newVersion,u)),c.then(u=>{s&&u.addEventListener("close",()=>s()),i&&u.addEventListener("versionchange",h=>i(h.oldVersion,h.newVersion,h))}).catch(()=>{}),c}const Dg=["get","getKey","getAll","getAllKeys","count"],kg=["put","add","delete","clear"],Wo=new Map;function Hu(r,e){if(!(r instanceof IDBDatabase&&!(e in r)&&typeof e=="string"))return;if(Wo.get(e))return Wo.get(e);const t=e.replace(/FromIndex$/,""),n=e!==t,i=kg.includes(t);if(!(t in(n?IDBIndex:IDBObjectStore).prototype)||!(i||Dg.includes(t)))return;const s=async function(o,...c){const u=this.transaction(o,i?"readwrite":"readonly");let h=u.store;return n&&(h=h.index(c.shift())),(await Promise.all([h[t](...c),i&&u.done]))[0]};return Wo.set(e,s),s}Pg(r=>({...r,get:(e,t,n)=>Hu(e,t)||r.get(e,t,n),has:(e,t)=>!!Hu(e,t)||r.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ng{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(xg(t)){const n=t.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(t=>t).join(" ")}}function xg(r){const e=r.getComponent();return(e==null?void 0:e.type)==="VERSION"}const oa="@firebase/app",Wu="0.13.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ut=new Fa("@firebase/app"),Og="@firebase/app-compat",Mg="@firebase/analytics-compat",Lg="@firebase/analytics",Fg="@firebase/app-check-compat",Ug="@firebase/app-check",Bg="@firebase/auth",qg="@firebase/auth-compat",jg="@firebase/database",zg="@firebase/data-connect",$g="@firebase/database-compat",Kg="@firebase/functions",Gg="@firebase/functions-compat",Hg="@firebase/installations",Wg="@firebase/installations-compat",Qg="@firebase/messaging",Yg="@firebase/messaging-compat",Jg="@firebase/performance",Xg="@firebase/performance-compat",Zg="@firebase/remote-config",e_="@firebase/remote-config-compat",t_="@firebase/storage",n_="@firebase/storage-compat",r_="@firebase/firestore",i_="@firebase/ai",s_="@firebase/firestore-compat",o_="firebase",a_="11.9.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const aa="[DEFAULT]",c_={[oa]:"fire-core",[Og]:"fire-core-compat",[Lg]:"fire-analytics",[Mg]:"fire-analytics-compat",[Ug]:"fire-app-check",[Fg]:"fire-app-check-compat",[Bg]:"fire-auth",[qg]:"fire-auth-compat",[jg]:"fire-rtdb",[zg]:"fire-data-connect",[$g]:"fire-rtdb-compat",[Kg]:"fire-fn",[Gg]:"fire-fn-compat",[Hg]:"fire-iid",[Wg]:"fire-iid-compat",[Qg]:"fire-fcm",[Yg]:"fire-fcm-compat",[Jg]:"fire-perf",[Xg]:"fire-perf-compat",[Zg]:"fire-rc",[e_]:"fire-rc-compat",[t_]:"fire-gcs",[n_]:"fire-gcs-compat",[r_]:"fire-fst",[s_]:"fire-fst-compat",[i_]:"fire-vertex","fire-js":"fire-js",[o_]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zn=new Map,ca=new Map,ua=new Map;function Qu(r,e){try{r.container.addComponent(e)}catch(t){ut.debug(`Component ${e.name} failed to register with FirebaseApp ${r.name}`,t)}}function $n(r){const e=r.name;if(ua.has(e))return ut.debug(`There were multiple attempts to register component ${e}.`),!1;ua.set(e,r);for(const t of zn.values())Qu(t,r);for(const t of ca.values())Qu(t,r);return!0}function Ba(r,e){const t=r.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),r.container.getProvider(e)}function Ue(r){return r==null?!1:r.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const u_={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},kt=new fi("app","Firebase",u_);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class l_{constructor(e,t,n){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new un("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw kt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const or=a_;function h_(r,e={}){let t=r;typeof e!="object"&&(e={name:e});const n=Object.assign({name:aa,automaticDataCollectionEnabled:!0},e),i=n.name;if(typeof i!="string"||!i)throw kt.create("bad-app-name",{appName:String(i)});if(t||(t=Gh()),!t)throw kt.create("no-options");const s=zn.get(i);if(s){if(cn(t,s.options)&&cn(n,s.config))return s;throw kt.create("duplicate-app",{appName:i})}const o=new _g(i);for(const u of ua.values())o.addComponent(u);const c=new l_(t,n,o);return zn.set(i,c),c}function d_(r=aa){const e=zn.get(r);if(!e&&r===aa&&Gh())return h_();if(!e)throw kt.create("no-app",{appName:r});return e}async function Rw(r){let e=!1;const t=r.name;zn.has(t)?(e=!0,zn.delete(t)):ca.has(t)&&r.decRefCount()<=0&&(ca.delete(t),e=!0),e&&(await Promise.all(r.container.getProviders().map(n=>n.delete())),r.isDeleted=!0)}function Nt(r,e,t){var n;let i=(n=c_[r])!==null&&n!==void 0?n:r;t&&(i+=`-${t}`);const s=i.match(/\s|\//),o=e.match(/\s|\//);if(s||o){const c=[`Unable to register library "${i}" with version "${e}":`];s&&c.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&o&&c.push("and"),o&&c.push(`version name "${e}" contains illegal characters (whitespace or "/")`),ut.warn(c.join(" "));return}$n(new un(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const f_="firebase-heartbeat-database",p_=1,Jr="firebase-heartbeat-store";let Qo=null;function td(){return Qo||(Qo=Vg(f_,p_,{upgrade:(r,e)=>{switch(e){case 0:try{r.createObjectStore(Jr)}catch(t){console.warn(t)}}}}).catch(r=>{throw kt.create("idb-open",{originalErrorMessage:r.message})})),Qo}async function m_(r){try{const t=(await td()).transaction(Jr),n=await t.objectStore(Jr).get(nd(r));return await t.done,n}catch(e){if(e instanceof ft)ut.warn(e.message);else{const t=kt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});ut.warn(t.message)}}}async function Yu(r,e){try{const n=(await td()).transaction(Jr,"readwrite");await n.objectStore(Jr).put(e,nd(r)),await n.done}catch(t){if(t instanceof ft)ut.warn(t.message);else{const n=kt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});ut.warn(n.message)}}}function nd(r){return`${r.name}!${r.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const g_=1024,__=30;class y_{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new E_(t),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=Ju();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>__){const o=v_(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){ut.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Ju(),{heartbeatsToSend:n,unsentEntries:i}=I_(this._heartbeatsCache.heartbeats),s=zh(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return ut.warn(t),""}}}function Ju(){return new Date().toISOString().substring(0,10)}function I_(r,e=g_){const t=[];let n=r.slice();for(const i of r){const s=t.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),Xu(t)>e){s.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),Xu(t)>e){t.pop();break}n=n.slice(1)}return{heartbeatsToSend:t,unsentEntries:n}}class E_{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Xh()?og().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await m_(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return Yu(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return Yu(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function Xu(r){return zh(JSON.stringify({version:2,heartbeats:r})).length}function v_(r){if(r.length===0)return-1;let e=0,t=r[0].date;for(let n=1;n<r.length;n++)r[n].date<t&&(t=r[n].date,e=n);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function T_(r){$n(new un("platform-logger",e=>new Ng(e),"PRIVATE")),$n(new un("heartbeat",e=>new y_(e),"PRIVATE")),Nt(oa,Wu,r),Nt(oa,Wu,"esm2017"),Nt("fire-js","")}T_("");function qa(r,e){var t={};for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&e.indexOf(n)<0&&(t[n]=r[n]);if(r!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,n=Object.getOwnPropertySymbols(r);i<n.length;i++)e.indexOf(n[i])<0&&Object.prototype.propertyIsEnumerable.call(r,n[i])&&(t[n[i]]=r[n[i]]);return t}function rd(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const w_=rd,id=new fi("auth","Firebase",rd());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Is=new Fa("@firebase/auth");function A_(r,...e){Is.logLevel<=W.WARN&&Is.warn(`Auth (${or}): ${r}`,...e)}function is(r,...e){Is.logLevel<=W.ERROR&&Is.error(`Auth (${or}): ${r}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function je(r,...e){throw ja(r,...e)}function Je(r,...e){return ja(r,...e)}function sd(r,e,t){const n=Object.assign(Object.assign({},w_()),{[e]:t});return new fi("auth","Firebase",n).create(e,{appName:r.name})}function at(r){return sd(r,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function ja(r,...e){if(typeof r!="string"){const t=e[0],n=[...e.slice(1)];return n[0]&&(n[0].appName=r.name),r._errorFactory.create(t,...n)}return id.create(r,...e)}function F(r,e,...t){if(!r)throw ja(e,...t)}function it(r){const e="INTERNAL ASSERTION FAILED: "+r;throw is(e),new Error(e)}function lt(r,e){r||it(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Es(){var r;return typeof self<"u"&&((r=self.location)===null||r===void 0?void 0:r.href)||""}function od(){return Zu()==="http:"||Zu()==="https:"}function Zu(){var r;return typeof self<"u"&&((r=self.location)===null||r===void 0?void 0:r.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function R_(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(od()||rg()||"connection"in navigator)?navigator.onLine:!0}function b_(){if(typeof navigator>"u")return null;const r=navigator;return r.languages&&r.languages[0]||r.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mi{constructor(e,t){this.shortDelay=e,this.longDelay=t,lt(t>e,"Short delay should be less than long delay!"),this.isMobile=tg()||ig()}get(){return R_()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function za(r,e){lt(r.emulator,"Emulator should always be set here");const{url:t}=r.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ad{static initialize(e,t,n){this.fetchImpl=e,t&&(this.headersImpl=t),n&&(this.responseImpl=n)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;it("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;it("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;it("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const P_={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const S_=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],C_=new mi(3e4,6e4);function He(r,e){return r.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:r.tenantId}):e}async function Fe(r,e,t,n,i={}){return cd(r,i,async()=>{let s={},o={};n&&(e==="GET"?o=n:s={body:JSON.stringify(n)});const c=pi(Object.assign({key:r.config.apiKey},o)).slice(1),u=await r._getAdditionalHeaders();u["Content-Type"]="application/json",r.languageCode&&(u["X-Firebase-Locale"]=r.languageCode);const h=Object.assign({method:e,headers:u},s);return ng()||(h.referrerPolicy="no-referrer"),r.emulatorConfig&&di(r.emulatorConfig.host)&&(h.credentials="include"),ad.fetch()(await ud(r,r.config.apiHost,t,c),h)})}async function cd(r,e,t){r._canInitEmulator=!1;const n=Object.assign(Object.assign({},P_),e);try{const i=new D_(r),s=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw Yi(r,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const c=s.ok?o.errorMessage:o.error.message,[u,h]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Yi(r,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw Yi(r,"email-already-in-use",o);if(u==="USER_DISABLED")throw Yi(r,"user-disabled",o);const f=n[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw sd(r,f,h);je(r,f)}}catch(i){if(i instanceof ft)throw i;je(r,"network-request-failed",{message:String(i)})}}async function gi(r,e,t,n,i={}){const s=await Fe(r,e,t,n,i);return"mfaPendingCredential"in s&&je(r,"multi-factor-auth-required",{_serverResponse:s}),s}async function ud(r,e,t,n){const i=`${e}${t}?${n}`,s=r,o=s.config.emulator?za(r.config,i):`${r.config.apiScheme}://${i}`;return S_.includes(t)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}function V_(r){switch(r){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class D_{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,n)=>{this.timer=setTimeout(()=>n(Je(this.auth,"network-request-failed")),C_.get())})}}function Yi(r,e,t){const n={appName:r.name};t.email&&(n.email=t.email),t.phoneNumber&&(n.phoneNumber=t.phoneNumber);const i=Je(r,e,n);return i.customData._tokenResponse=t,i}function el(r){return r!==void 0&&r.enterprise!==void 0}class k_{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return V_(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function N_(r,e){return Fe(r,"GET","/v2/recaptchaConfig",He(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function x_(r,e){return Fe(r,"POST","/v1/accounts:delete",e)}async function vs(r,e){return Fe(r,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qr(r){if(r)try{const e=new Date(Number(r));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function O_(r,e=!1){const t=re(r),n=await t.getIdToken(e),i=$a(n);F(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:n,authTime:qr(Yo(i.auth_time)),issuedAtTime:qr(Yo(i.iat)),expirationTime:qr(Yo(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function Yo(r){return Number(r)*1e3}function $a(r){const[e,t,n]=r.split(".");if(e===void 0||t===void 0||n===void 0)return is("JWT malformed, contained fewer than 3 sections"),null;try{const i=$h(t);return i?JSON.parse(i):(is("Failed to decode base64 JWT payload"),null)}catch(i){return is("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function tl(r){const e=$a(r);return F(e,"internal-error"),F(typeof e.exp<"u","internal-error"),F(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ln(r,e,t=!1){if(t)return e;try{return await e}catch(n){throw n instanceof ft&&M_(n)&&r.auth.currentUser===r&&await r.auth.signOut(),n}}function M_({code:r}){return r==="auth/user-disabled"||r==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class L_{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const i=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class la{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=qr(this.lastLoginAt),this.creationTime=qr(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ts(r){var e;const t=r.auth,n=await r.getIdToken(),i=await ln(r,vs(t,{idToken:n}));F(i==null?void 0:i.users.length,t,"internal-error");const s=i.users[0];r._notifyReloadListener(s);const o=!((e=s.providerUserInfo)===null||e===void 0)&&e.length?ld(s.providerUserInfo):[],c=U_(r.providerData,o),u=r.isAnonymous,h=!(r.email&&s.passwordHash)&&!(c!=null&&c.length),f=u?h:!1,m={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:c,metadata:new la(s.createdAt,s.lastLoginAt),isAnonymous:f};Object.assign(r,m)}async function F_(r){const e=re(r);await Ts(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function U_(r,e){return[...r.filter(n=>!e.some(i=>i.providerId===n.providerId)),...e]}function ld(r){return r.map(e=>{var{providerId:t}=e,n=qa(e,["providerId"]);return{providerId:t,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function B_(r,e){const t=await cd(r,{},async()=>{const n=pi({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=r.config,o=await ud(r,i,"/v1/token",`key=${s}`),c=await r._getAdditionalHeaders();return c["Content-Type"]="application/x-www-form-urlencoded",ad.fetch()(o,{method:"POST",headers:c,body:n})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function q_(r,e){return Fe(r,"POST","/v2/accounts:revokeToken",He(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Un{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){F(e.idToken,"internal-error"),F(typeof e.idToken<"u","internal-error"),F(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):tl(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){F(e.length!==0,"internal-error");const t=tl(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(F(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:n,refreshToken:i,expiresIn:s}=await B_(e,t);this.updateTokensAndExpiration(n,i,Number(s))}updateTokensAndExpiration(e,t,n){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+n*1e3}static fromJSON(e,t){const{refreshToken:n,accessToken:i,expirationTime:s}=t,o=new Un;return n&&(F(typeof n=="string","internal-error",{appName:e}),o.refreshToken=n),i&&(F(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(F(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Un,this.toJSON())}_performRefresh(){return it("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vt(r,e){F(typeof r=="string"||typeof r>"u","internal-error",{appName:e})}class Ke{constructor(e){var{uid:t,auth:n,stsTokenManager:i}=e,s=qa(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new L_(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=n,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new la(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await ln(this,this.stsTokenManager.getToken(this.auth,e));return F(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return O_(this,e)}reload(){return F_(this)}_assign(e){this!==e&&(F(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Ke(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){F(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),t&&await Ts(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Ue(this.auth.app))return Promise.reject(at(this.auth));const e=await this.getIdToken();return await ln(this,x_(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var n,i,s,o,c,u,h,f;const m=(n=t.displayName)!==null&&n!==void 0?n:void 0,_=(i=t.email)!==null&&i!==void 0?i:void 0,b=(s=t.phoneNumber)!==null&&s!==void 0?s:void 0,C=(o=t.photoURL)!==null&&o!==void 0?o:void 0,k=(c=t.tenantId)!==null&&c!==void 0?c:void 0,D=(u=t._redirectEventId)!==null&&u!==void 0?u:void 0,$=(h=t.createdAt)!==null&&h!==void 0?h:void 0,B=(f=t.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:L,emailVerified:H,isAnonymous:Z,providerData:G,stsTokenManager:E}=t;F(L&&E,e,"internal-error");const g=Un.fromJSON(this.name,E);F(typeof L=="string",e,"internal-error"),vt(m,e.name),vt(_,e.name),F(typeof H=="boolean",e,"internal-error"),F(typeof Z=="boolean",e,"internal-error"),vt(b,e.name),vt(C,e.name),vt(k,e.name),vt(D,e.name),vt($,e.name),vt(B,e.name);const I=new Ke({uid:L,auth:e,email:_,emailVerified:H,displayName:m,isAnonymous:Z,photoURL:C,phoneNumber:b,tenantId:k,stsTokenManager:g,createdAt:$,lastLoginAt:B});return G&&Array.isArray(G)&&(I.providerData=G.map(v=>Object.assign({},v))),D&&(I._redirectEventId=D),I}static async _fromIdTokenResponse(e,t,n=!1){const i=new Un;i.updateFromServerResponse(t);const s=new Ke({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:n});return await Ts(s),s}static async _fromGetAccountInfoResponse(e,t,n){const i=t.users[0];F(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?ld(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),c=new Un;c.updateFromIdToken(n);const u=new Ke({uid:i.localId,auth:e,stsTokenManager:c,isAnonymous:o}),h={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new la(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,h),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nl=new Map;function st(r){lt(r instanceof Function,"Expected a class definition");let e=nl.get(r);return e?(lt(e instanceof r,"Instance stored in cache mismatched with class"),e):(e=new r,nl.set(r,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hd{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}hd.type="NONE";const rl=hd;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ss(r,e,t){return`firebase:${r}:${e}:${t}`}class Bn{constructor(e,t,n){this.persistence=e,this.auth=t,this.userKey=n;const{config:i,name:s}=this.auth;this.fullUserKey=ss(this.userKey,i.apiKey,s),this.fullPersistenceKey=ss("persistence",i.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await vs(this.auth,{idToken:e}).catch(()=>{});return t?Ke._fromGetAccountInfoResponse(this.auth,t,e):null}return Ke._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,n="authUser"){if(!t.length)return new Bn(st(rl),e,n);const i=(await Promise.all(t.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let s=i[0]||st(rl);const o=ss(n,e.config.apiKey,e.name);let c=null;for(const h of t)try{const f=await h._get(o);if(f){let m;if(typeof f=="string"){const _=await vs(e,{idToken:f}).catch(()=>{});if(!_)break;m=await Ke._fromGetAccountInfoResponse(e,_,f)}else m=Ke._fromJSON(e,f);h!==s&&(c=m),s=h;break}}catch{}const u=i.filter(h=>h._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new Bn(s,e,n):(s=u[0],c&&await s._set(o,c.toJSON()),await Promise.all(t.map(async h=>{if(h!==s)try{await h._remove(o)}catch{}})),new Bn(s,e,n))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function il(r){const e=r.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(md(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(dd(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(_d(e))return"Blackberry";if(yd(e))return"Webos";if(fd(e))return"Safari";if((e.includes("chrome/")||pd(e))&&!e.includes("edge/"))return"Chrome";if(gd(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=r.match(t);if((n==null?void 0:n.length)===2)return n[1]}return"Other"}function dd(r=fe()){return/firefox\//i.test(r)}function fd(r=fe()){const e=r.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function pd(r=fe()){return/crios\//i.test(r)}function md(r=fe()){return/iemobile/i.test(r)}function gd(r=fe()){return/android/i.test(r)}function _d(r=fe()){return/blackberry/i.test(r)}function yd(r=fe()){return/webos/i.test(r)}function Ka(r=fe()){return/iphone|ipad|ipod/i.test(r)||/macintosh/i.test(r)&&/mobile/i.test(r)}function j_(r=fe()){var e;return Ka(r)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function z_(){return sg()&&document.documentMode===10}function Id(r=fe()){return Ka(r)||gd(r)||yd(r)||_d(r)||/windows phone/i.test(r)||md(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ed(r,e=[]){let t;switch(r){case"Browser":t=il(fe());break;case"Worker":t=`${il(fe())}-${r}`;break;default:t=r}const n=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${or}/${n}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $_{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const n=s=>new Promise((o,c)=>{try{const u=e(s);o(u)}catch(u){c(u)}});n.onAbort=t,this.queue.push(n);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const n of this.queue)await n(e),n.onAbort&&t.push(n.onAbort)}catch(n){t.reverse();for(const i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:n==null?void 0:n.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function K_(r,e={}){return Fe(r,"GET","/v2/passwordPolicy",He(r,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const G_=6;class H_{constructor(e){var t,n,i,s;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=o.minPasswordLength)!==null&&t!==void 0?t:G_,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(n=e.allowedNonAlphanumericCharacters)===null||n===void 0?void 0:n.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(s=e.forceUpgradeOnSignin)!==null&&s!==void 0?s:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,n,i,s,o,c;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(t=u.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),u.isValid&&(u.isValid=(n=u.meetsMaxPasswordLength)!==null&&n!==void 0?n:!0),u.isValid&&(u.isValid=(i=u.containsLowercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(s=u.containsUppercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(o=u.containsNumericCharacter)!==null&&o!==void 0?o:!0),u.isValid&&(u.isValid=(c=u.containsNonAlphanumericCharacter)!==null&&c!==void 0?c:!0),u}validatePasswordLengthOptions(e,t){const n=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;n&&(t.meetsMinPasswordLength=e.length>=n),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let n;for(let i=0;i<e.length;i++)n=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,t,n,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W_{constructor(e,t,n,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=n,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new sl(this),this.idTokenSubscription=new sl(this),this.beforeStateQueue=new $_(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=id,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=st(t)),this._initializationPromise=this.queue(async()=>{var n,i,s;if(!this._deleted&&(this.persistenceManager=await Bn.create(this,e),(n=this._resolvePersistenceManagerAvailable)===null||n===void 0||n.call(this),!this._deleted)){if(!((i=this._popupRedirectResolver)===null||i===void 0)&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await vs(this,{idToken:e}),n=await Ke._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(n)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(Ue(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let i=n,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,c=i==null?void 0:i._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===c)&&(u!=null&&u.user)&&(i=u.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return F(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Ts(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=b_()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Ue(this.app))return Promise.reject(at(this));const t=e?re(e):null;return t&&F(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&F(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Ue(this.app)?Promise.reject(at(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Ue(this.app)?Promise.reject(at(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(st(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await K_(this),t=new H_(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new fi("auth","Firebase",e())}onAuthStateChanged(e,t,n){return this.registerStateListener(this.authStateSubscription,e,t,n)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,n){return this.registerStateListener(this.idTokenSubscription,e,t,n)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),n={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(n.tenantId=this.tenantId),await q_(this,n)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const n=await this.getOrInitRedirectPersistenceManager(t);return e===null?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&st(e)||this._popupRedirectResolver;F(t,this,"argument-error"),this.redirectPersistenceManager=await Bn.create(this,[st(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,n;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const n=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==n&&(this.lastNotifiedUid=n,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,n,i){if(this._deleted)return()=>{};const s=typeof t=="function"?t:t.next.bind(t);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(F(c,this,"internal-error"),c.then(()=>{o||s(this.currentUser)}),typeof t=="function"){const u=e.addObserver(t,n,i);return()=>{o=!0,u()}}else{const u=e.addObserver(t);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return F(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Ed(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const n=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());n&&(t["X-Firebase-Client"]=n);const i=await this._getAppCheckToken();return i&&(t["X-Firebase-AppCheck"]=i),t}async _getAppCheckToken(){var e;if(Ue(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&A_(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function pt(r){return re(r)}class sl{constructor(e){this.auth=e,this.observer=null,this.addObserver=hg(t=>this.observer=t)}get next(){return F(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let $s={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Q_(r){$s=r}function vd(r){return $s.loadJS(r)}function Y_(){return $s.recaptchaEnterpriseScript}function J_(){return $s.gapiScript}function X_(r){return`__${r}${Math.floor(Math.random()*1e6)}`}class Z_{constructor(){this.enterprise=new ey}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class ey{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}const ty="recaptcha-enterprise",Td="NO_RECAPTCHA";class ny{constructor(e){this.type=ty,this.auth=pt(e)}async verify(e="verify",t=!1){async function n(s){if(!t){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(o,c)=>{N_(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)c(new Error("recaptcha Enterprise site key undefined"));else{const h=new k_(u);return s.tenantId==null?s._agentRecaptchaConfig=h:s._tenantRecaptchaConfigs[s.tenantId]=h,o(h.siteKey)}}).catch(u=>{c(u)})})}function i(s,o,c){const u=window.grecaptcha;el(u)?u.enterprise.ready(()=>{u.enterprise.execute(s,{action:e}).then(h=>{o(h)}).catch(()=>{o(Td)})}):c(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new Z_().execute("siteKey",{action:"verify"}):new Promise((s,o)=>{n(this.auth).then(c=>{if(!t&&el(window.grecaptcha))i(c,s,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let u=Y_();u.length!==0&&(u+=c),vd(u).then(()=>{i(c,s,o)}).catch(h=>{o(h)})}}).catch(c=>{o(c)})})}}async function ol(r,e,t,n=!1,i=!1){const s=new ny(r);let o;if(i)o=Td;else try{o=await s.verify(t)}catch{o=await s.verify(t,!0)}const c=Object.assign({},e);if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in c){const u=c.phoneEnrollmentInfo.phoneNumber,h=c.phoneEnrollmentInfo.recaptchaToken;Object.assign(c,{phoneEnrollmentInfo:{phoneNumber:u,recaptchaToken:h,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in c){const u=c.phoneSignInInfo.recaptchaToken;Object.assign(c,{phoneSignInInfo:{recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return c}return n?Object.assign(c,{captchaResp:o}):Object.assign(c,{captchaResponse:o}),Object.assign(c,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(c,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),c}async function ws(r,e,t,n,i){var s;if(!((s=r._getRecaptchaConfig())===null||s===void 0)&&s.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await ol(r,e,t,t==="getOobCode");return n(r,o)}else return n(r,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const c=await ol(r,e,t,t==="getOobCode");return n(r,c)}else return Promise.reject(o)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ry(r,e){const t=Ba(r,"auth");if(t.isInitialized()){const i=t.getImmediate(),s=t.getOptions();if(cn(s,e??{}))return i;je(i,"already-initialized")}return t.initialize({options:e})}function iy(r,e){const t=(e==null?void 0:e.persistence)||[],n=(Array.isArray(t)?t:[t]).map(st);e!=null&&e.errorMap&&r._updateErrorMap(e.errorMap),r._initializeWithPersistence(n,e==null?void 0:e.popupRedirectResolver)}function sy(r,e,t){const n=pt(r);F(/^https?:\/\//.test(e),n,"invalid-emulator-scheme");const i=!1,s=wd(e),{host:o,port:c}=oy(e),u=c===null?"":`:${c}`,h={url:`${s}//${o}${u}/`},f=Object.freeze({host:o,port:c,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!n._canInitEmulator){F(n.config.emulator&&n.emulatorConfig,n,"emulator-config-failed"),F(cn(h,n.config.emulator)&&cn(f,n.emulatorConfig),n,"emulator-config-failed");return}n.config.emulator=h,n.emulatorConfig=f,n.settings.appVerificationDisabledForTesting=!0,di(o)?(Wh(`${s}//${o}${u}`),eg("Auth",!0)):ay()}function wd(r){const e=r.indexOf(":");return e<0?"":r.substr(0,e+1)}function oy(r){const e=wd(r),t=/(\/\/)?([^?#/]+)/.exec(r.substr(e.length));if(!t)return{host:"",port:null};const n=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(n);if(i){const s=i[1];return{host:s,port:al(n.substr(s.length+1))}}else{const[s,o]=n.split(":");return{host:s,port:al(o)}}}function al(r){if(!r)return null;const e=Number(r);return isNaN(e)?null:e}function ay(){function r(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",r):r())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ga{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return it("not implemented")}_getIdTokenResponse(e){return it("not implemented")}_linkToIdToken(e,t){return it("not implemented")}_getReauthenticationResolver(e){return it("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ad(r,e){return Fe(r,"POST","/v1/accounts:resetPassword",He(r,e))}async function cy(r,e){return Fe(r,"POST","/v1/accounts:update",e)}async function uy(r,e){return Fe(r,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ly(r,e){return gi(r,"POST","/v1/accounts:signInWithPassword",He(r,e))}async function hy(r,e){return Fe(r,"POST","/v1/accounts:sendOobCode",He(r,e))}async function dy(r,e){return hy(r,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fy(r,e){return gi(r,"POST","/v1/accounts:signInWithEmailLink",He(r,e))}async function py(r,e){return gi(r,"POST","/v1/accounts:signInWithEmailLink",He(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xr extends Ga{constructor(e,t,n,i=null){super("password",n),this._email=e,this._password=t,this._tenantId=i}static _fromEmailAndPassword(e,t){return new Xr(e,t,"password")}static _fromEmailAndCode(e,t,n=null){return new Xr(e,t,"emailLink",n)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return ws(e,t,"signInWithPassword",ly);case"emailLink":return fy(e,{email:this._email,oobCode:this._password});default:je(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const n={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return ws(e,n,"signUpPassword",uy);case"emailLink":return py(e,{idToken:t,email:this._email,oobCode:this._password});default:je(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function qn(r,e){return gi(r,"POST","/v1/accounts:signInWithIdp",He(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const my="http://localhost";class hn extends Ga{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new hn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):je("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:n,signInMethod:i}=t,s=qa(t,["providerId","signInMethod"]);if(!n||!i)return null;const o=new hn(n,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return qn(e,t)}_linkToIdToken(e,t){const n=this.buildRequest();return n.idToken=t,qn(e,n)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,qn(e,t)}buildRequest(){const e={requestUri:my,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=pi(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gy(r){switch(r){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function _y(r){const e=xr(Or(r)).link,t=e?xr(Or(e)).deep_link_id:null,n=xr(Or(r)).deep_link_id;return(n?xr(Or(n)).link:null)||n||t||e||r}class Ha{constructor(e){var t,n,i,s,o,c;const u=xr(Or(e)),h=(t=u.apiKey)!==null&&t!==void 0?t:null,f=(n=u.oobCode)!==null&&n!==void 0?n:null,m=gy((i=u.mode)!==null&&i!==void 0?i:null);F(h&&f&&m,"argument-error"),this.apiKey=h,this.operation=m,this.code=f,this.continueUrl=(s=u.continueUrl)!==null&&s!==void 0?s:null,this.languageCode=(o=u.lang)!==null&&o!==void 0?o:null,this.tenantId=(c=u.tenantId)!==null&&c!==void 0?c:null}static parseLink(e){const t=_y(e);try{return new Ha(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ar{constructor(){this.providerId=ar.PROVIDER_ID}static credential(e,t){return Xr._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const n=Ha.parseLink(t);return F(n,"argument-error"),Xr._fromEmailAndCode(e,n.code,n.tenantId)}}ar.PROVIDER_ID="password";ar.EMAIL_PASSWORD_SIGN_IN_METHOD="password";ar.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rd{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _i extends Rd{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt extends _i{constructor(){super("facebook.com")}static credential(e){return hn._fromParams({providerId:Rt.PROVIDER_ID,signInMethod:Rt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Rt.credentialFromTaggedObject(e)}static credentialFromError(e){return Rt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Rt.credential(e.oauthAccessToken)}catch{return null}}}Rt.FACEBOOK_SIGN_IN_METHOD="facebook.com";Rt.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bt extends _i{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return hn._fromParams({providerId:bt.PROVIDER_ID,signInMethod:bt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return bt.credentialFromTaggedObject(e)}static credentialFromError(e){return bt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:n}=e;if(!t&&!n)return null;try{return bt.credential(t,n)}catch{return null}}}bt.GOOGLE_SIGN_IN_METHOD="google.com";bt.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pt extends _i{constructor(){super("github.com")}static credential(e){return hn._fromParams({providerId:Pt.PROVIDER_ID,signInMethod:Pt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Pt.credentialFromTaggedObject(e)}static credentialFromError(e){return Pt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Pt.credential(e.oauthAccessToken)}catch{return null}}}Pt.GITHUB_SIGN_IN_METHOD="github.com";Pt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class St extends _i{constructor(){super("twitter.com")}static credential(e,t){return hn._fromParams({providerId:St.PROVIDER_ID,signInMethod:St.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return St.credentialFromTaggedObject(e)}static credentialFromError(e){return St.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:n}=e;if(!t||!n)return null;try{return St.credential(t,n)}catch{return null}}}St.TWITTER_SIGN_IN_METHOD="twitter.com";St.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yy(r,e){return gi(r,"POST","/v1/accounts:signUp",He(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,n,i=!1){const s=await Ke._fromIdTokenResponse(e,n,i),o=cl(n);return new dn({user:s,providerId:o,_tokenResponse:n,operationType:t})}static async _forOperation(e,t,n){await e._updateTokensIfNecessary(n,!0);const i=cl(n);return new dn({user:e,providerId:i,_tokenResponse:n,operationType:t})}}function cl(r){return r.providerId?r.providerId:"phoneNumber"in r?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class As extends ft{constructor(e,t,n,i){var s;super(t.code,t.message),this.operationType=n,this.user=i,Object.setPrototypeOf(this,As.prototype),this.customData={appName:e.name,tenantId:(s=e.tenantId)!==null&&s!==void 0?s:void 0,_serverResponse:t.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,t,n,i){return new As(e,t,n,i)}}function bd(r,e,t,n){return(e==="reauthenticate"?t._getReauthenticationResolver(r):t._getIdTokenResponse(r)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?As._fromErrorAndOperation(r,s,e,n):s})}async function Iy(r,e,t=!1){const n=await ln(r,e._linkToIdToken(r.auth,await r.getIdToken()),t);return dn._forOperation(r,"link",n)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pd(r,e,t=!1){const{auth:n}=r;if(Ue(n.app))return Promise.reject(at(n));const i="reauthenticate";try{const s=await ln(r,bd(n,i,e,r),t);F(s.idToken,n,"internal-error");const o=$a(s.idToken);F(o,n,"internal-error");const{sub:c}=o;return F(r.uid===c,n,"user-mismatch"),dn._forOperation(r,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&je(n,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Sd(r,e,t=!1){if(Ue(r.app))return Promise.reject(at(r));const n="signIn",i=await bd(r,n,e),s=await dn._fromIdTokenResponse(r,n,i);return t||await r._updateCurrentUser(s.user),s}async function Ey(r,e){return Sd(pt(r),e)}async function bw(r,e){return Pd(re(r),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wa{constructor(e,t){this.factorId=e,this.uid=t.mfaEnrollmentId,this.enrollmentTime=new Date(t.enrolledAt).toUTCString(),this.displayName=t.displayName}static _fromServerResponse(e,t){return"phoneInfo"in t?Qa._fromServerResponse(e,t):"totpInfo"in t?Ya._fromServerResponse(e,t):je(e,"internal-error")}}class Qa extends Wa{constructor(e){super("phone",e),this.phoneNumber=e.phoneInfo}static _fromServerResponse(e,t){return new Qa(t)}}class Ya extends Wa{constructor(e){super("totp",e)}static _fromServerResponse(e,t){return new Ya(t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vy(r,e,t){var n;F(((n=t.url)===null||n===void 0?void 0:n.length)>0,r,"invalid-continue-uri"),F(typeof t.dynamicLinkDomain>"u"||t.dynamicLinkDomain.length>0,r,"invalid-dynamic-link-domain"),F(typeof t.linkDomain>"u"||t.linkDomain.length>0,r,"invalid-hosting-link-domain"),e.continueUrl=t.url,e.dynamicLinkDomain=t.dynamicLinkDomain,e.linkDomain=t.linkDomain,e.canHandleCodeInApp=t.handleCodeInApp,t.iOS&&(F(t.iOS.bundleId.length>0,r,"missing-ios-bundle-id"),e.iOSBundleId=t.iOS.bundleId),t.android&&(F(t.android.packageName.length>0,r,"missing-android-pkg-name"),e.androidInstallApp=t.android.installApp,e.androidMinimumVersionCode=t.android.minimumVersion,e.androidPackageName=t.android.packageName)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ja(r){const e=pt(r);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function Pw(r,e,t){const n=pt(r),i={requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"};t&&vy(n,i,t),await ws(n,i,"getOobCode",dy)}async function Sw(r,e,t){await Ad(re(r),{oobCode:e,newPassword:t}).catch(async n=>{throw n.code==="auth/password-does-not-meet-requirements"&&Ja(r),n})}async function Ty(r,e){const t=re(r),n=await Ad(t,{oobCode:e}),i=n.requestType;switch(F(i,t,"internal-error"),i){case"EMAIL_SIGNIN":break;case"VERIFY_AND_CHANGE_EMAIL":F(n.newEmail,t,"internal-error");break;case"REVERT_SECOND_FACTOR_ADDITION":F(n.mfaInfo,t,"internal-error");default:F(n.email,t,"internal-error")}let s=null;return n.mfaInfo&&(s=Wa._fromServerResponse(pt(t),n.mfaInfo)),{data:{email:(n.requestType==="VERIFY_AND_CHANGE_EMAIL"?n.newEmail:n.email)||null,previousEmail:(n.requestType==="VERIFY_AND_CHANGE_EMAIL"?n.email:n.newEmail)||null,multiFactorInfo:s},operation:i}}async function Cw(r,e){const{data:t}=await Ty(re(r),e);return t.email}async function Vw(r,e,t){if(Ue(r.app))return Promise.reject(at(r));const n=pt(r),o=await ws(n,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",yy).catch(u=>{throw u.code==="auth/password-does-not-meet-requirements"&&Ja(r),u}),c=await dn._fromIdTokenResponse(n,"signIn",o);return await n._updateCurrentUser(c.user),c}function Dw(r,e,t){return Ue(r.app)?Promise.reject(at(r)):Ey(re(r),ar.credential(e,t)).catch(async n=>{throw n.code==="auth/password-does-not-meet-requirements"&&Ja(r),n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wy(r,e){return Fe(r,"POST","/v1/accounts:createAuthUri",He(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function kw(r,e){const t=od()?Es():"http://localhost",n={identifier:e,continueUri:t},{signinMethods:i}=await wy(re(r),n);return i||[]}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ay(r,e){return Fe(r,"POST","/v1/accounts:update",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Nw(r,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;const n=re(r),s={idToken:await n.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},o=await ln(n,Ay(n.auth,s));n.displayName=o.displayName||null,n.photoURL=o.photoUrl||null;const c=n.providerData.find(({providerId:u})=>u==="password");c&&(c.displayName=n.displayName,c.photoURL=n.photoURL),await n._updateTokensIfNecessary(o)}function xw(r,e){return Ry(re(r),null,e)}async function Ry(r,e,t){const{auth:n}=r,s={idToken:await r.getIdToken(),returnSecureToken:!0};t&&(s.password=t);const o=await ln(r,cy(n,s));await r._updateTokensIfNecessary(o,!0)}function by(r,e,t,n){return re(r).onIdTokenChanged(e,t,n)}function Py(r,e,t){return re(r).beforeAuthStateChanged(e,t)}function Ow(r,e,t,n){return re(r).onAuthStateChanged(e,t,n)}function Mw(r){return re(r).signOut()}async function Lw(r){return re(r).delete()}const Rs="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cd{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Rs,"1"),this.storage.removeItem(Rs),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sy=1e3,Cy=10;class Vd extends Cd{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Id(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const n=this.storage.getItem(t),i=this.localCache[t];n!==i&&e(t,i,n)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,c,u)=>{this.notifyListeners(o,u)});return}const n=e.key;t?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(n);!t&&this.localCache[n]===o||this.notifyListeners(n,o)},s=this.storage.getItem(n);z_()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,Cy):i()}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const i of Array.from(n))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:n}),!0)})},Sy)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Vd.type="LOCAL";const Vy=Vd;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dd extends Cd{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Dd.type="SESSION";const kd=Dd;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dy(r){return Promise.all(r.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ks{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;const n=new Ks(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:n,eventType:i,data:s}=t.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:n,eventType:i});const c=Array.from(o).map(async h=>h(t.origin,s)),u=await Dy(c);t.ports[0].postMessage({status:"done",eventId:n,eventType:i,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Ks.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xa(r="",e=10){let t="";for(let n=0;n<e;n++)t+=Math.floor(Math.random()*10);return r+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ky{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,n=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((c,u)=>{const h=Xa("",20);i.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},n);o={messageChannel:i,onMessage(m){const _=m;if(_.data.eventId===h)switch(_.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),c(_.data.response);break;default:clearTimeout(f),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:h,data:t},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xe(){return window}function Ny(r){Xe().location.href=r}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nd(){return typeof Xe().WorkerGlobalScope<"u"&&typeof Xe().importScripts=="function"}async function xy(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Oy(){var r;return((r=navigator==null?void 0:navigator.serviceWorker)===null||r===void 0?void 0:r.controller)||null}function My(){return Nd()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xd="firebaseLocalStorageDb",Ly=1,bs="firebaseLocalStorage",Od="fbase_key";class yi{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Gs(r,e){return r.transaction([bs],e?"readwrite":"readonly").objectStore(bs)}function Fy(){const r=indexedDB.deleteDatabase(xd);return new yi(r).toPromise()}function ha(){const r=indexedDB.open(xd,Ly);return new Promise((e,t)=>{r.addEventListener("error",()=>{t(r.error)}),r.addEventListener("upgradeneeded",()=>{const n=r.result;try{n.createObjectStore(bs,{keyPath:Od})}catch(i){t(i)}}),r.addEventListener("success",async()=>{const n=r.result;n.objectStoreNames.contains(bs)?e(n):(n.close(),await Fy(),e(await ha()))})})}async function ul(r,e,t){const n=Gs(r,!0).put({[Od]:e,value:t});return new yi(n).toPromise()}async function Uy(r,e){const t=Gs(r,!1).get(e),n=await new yi(t).toPromise();return n===void 0?null:n.value}function ll(r,e){const t=Gs(r,!0).delete(e);return new yi(t).toPromise()}const By=800,qy=3;class Md{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await ha(),this.db)}async _withRetries(e){let t=0;for(;;)try{const n=await this._openDb();return await e(n)}catch(n){if(t++>qy)throw n;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Nd()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Ks._getInstance(My()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await xy(),!this.activeServiceWorker)return;this.sender=new ky(this.activeServiceWorker);const n=await this.sender._send("ping",{},800);n&&!((e=n[0])===null||e===void 0)&&e.fulfilled&&!((t=n[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Oy()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await ha();return await ul(e,Rs,"1"),await ll(e,Rs),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(n=>ul(n,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(n=>Uy(n,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>ll(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=Gs(i,!1).getAll();return new yi(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],n=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)n.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!n.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const i of Array.from(n))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),By)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Md.type="LOCAL";const jy=Md;new mi(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zy(r,e){return e?st(e):(F(r._popupRedirectResolver,r,"argument-error"),r._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Za extends Ga{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return qn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return qn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return qn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function $y(r){return Sd(r.auth,new Za(r),r.bypassAuthState)}function Ky(r){const{auth:e,user:t}=r;return F(t,e,"internal-error"),Pd(t,new Za(r),r.bypassAuthState)}async function Gy(r){const{auth:e,user:t}=r;return F(t,e,"internal-error"),Iy(t,new Za(r),r.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ld{constructor(e,t,n,i,s=!1){this.auth=e,this.resolver=n,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(n){this.reject(n)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:n,postBody:i,tenantId:s,error:o,type:c}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:t,sessionId:n,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return $y;case"linkViaPopup":case"linkViaRedirect":return Gy;case"reauthViaPopup":case"reauthViaRedirect":return Ky;default:je(this.auth,"internal-error")}}resolve(e){lt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){lt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hy=new mi(2e3,1e4);class Ln extends Ld{constructor(e,t,n,i,s){super(e,t,i,s),this.provider=n,this.authWindow=null,this.pollId=null,Ln.currentPopupAction&&Ln.currentPopupAction.cancel(),Ln.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return F(e,this.auth,"internal-error"),e}async onExecution(){lt(this.filter.length===1,"Popup operations only handle one event");const e=Xa();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Je(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Je(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Ln.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,n;if(!((n=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||n===void 0)&&n.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Je(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,Hy.get())};e()}}Ln.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wy="pendingRedirect",os=new Map;class Qy extends Ld{constructor(e,t,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,n),this.eventId=null}async execute(){let e=os.get(this.auth._key());if(!e){try{const n=await Yy(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(n)}catch(t){e=()=>Promise.reject(t)}os.set(this.auth._key(),e)}return this.bypassAuthState||os.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Yy(r,e){const t=Zy(e),n=Xy(r);if(!await n._isAvailable())return!1;const i=await n._get(t)==="true";return await n._remove(t),i}function Jy(r,e){os.set(r._key(),e)}function Xy(r){return st(r._redirectPersistence)}function Zy(r){return ss(Wy,r.config.apiKey,r.name)}async function eI(r,e,t=!1){if(Ue(r.app))return Promise.reject(at(r));const n=pt(r),i=zy(n,e),o=await new Qy(n,i,t).execute();return o&&!t&&(delete o.user._redirectEventId,await n._persistUserIfCurrent(o.user),await n._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tI=10*60*1e3;class nI{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(t=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!rI(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var n;if(e.error&&!Fd(e)){const i=((n=e.error.code)===null||n===void 0?void 0:n.split("auth/")[1])||"internal-error";t.onError(Je(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const n=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=tI&&this.cachedEventUids.clear(),this.cachedEventUids.has(hl(e))}saveEventToCache(e){this.cachedEventUids.add(hl(e)),this.lastProcessedEventTime=Date.now()}}function hl(r){return[r.type,r.eventId,r.sessionId,r.tenantId].filter(e=>e).join("-")}function Fd({type:r,error:e}){return r==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function rI(r){switch(r.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Fd(r);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function iI(r,e={}){return Fe(r,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sI=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,oI=/^https?/;async function aI(r){if(r.config.emulator)return;const{authorizedDomains:e}=await iI(r);for(const t of e)try{if(cI(t))return}catch{}je(r,"unauthorized-domain")}function cI(r){const e=Es(),{protocol:t,hostname:n}=new URL(e);if(r.startsWith("chrome-extension://")){const o=new URL(r);return o.hostname===""&&n===""?t==="chrome-extension:"&&r.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===n}if(!oI.test(t))return!1;if(sI.test(r))return n===r;const i=r.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(n)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uI=new mi(3e4,6e4);function dl(){const r=Xe().___jsl;if(r!=null&&r.H){for(const e of Object.keys(r.H))if(r.H[e].r=r.H[e].r||[],r.H[e].L=r.H[e].L||[],r.H[e].r=[...r.H[e].L],r.CP)for(let t=0;t<r.CP.length;t++)r.CP[t]=null}}function lI(r){return new Promise((e,t)=>{var n,i,s;function o(){dl(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{dl(),t(Je(r,"network-request-failed"))},timeout:uI.get()})}if(!((i=(n=Xe().gapi)===null||n===void 0?void 0:n.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((s=Xe().gapi)===null||s===void 0)&&s.load)o();else{const c=X_("iframefcb");return Xe()[c]=()=>{gapi.load?o():t(Je(r,"network-request-failed"))},vd(`${J_()}?onload=${c}`).catch(u=>t(u))}}).catch(e=>{throw as=null,e})}let as=null;function hI(r){return as=as||lI(r),as}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dI=new mi(5e3,15e3),fI="__/auth/iframe",pI="emulator/auth/iframe",mI={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},gI=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function _I(r){const e=r.config;F(e.authDomain,r,"auth-domain-config-required");const t=e.emulator?za(e,pI):`https://${r.config.authDomain}/${fI}`,n={apiKey:e.apiKey,appName:r.name,v:or},i=gI.get(r.config.apiHost);i&&(n.eid=i);const s=r._getFrameworks();return s.length&&(n.fw=s.join(",")),`${t}?${pi(n).slice(1)}`}async function yI(r){const e=await hI(r),t=Xe().gapi;return F(t,r,"internal-error"),e.open({where:document.body,url:_I(r),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:mI,dontclear:!0},n=>new Promise(async(i,s)=>{await n.restyle({setHideOnLeave:!1});const o=Je(r,"network-request-failed"),c=Xe().setTimeout(()=>{s(o)},dI.get());function u(){Xe().clearTimeout(c),i(n)}n.ping(u).then(u,()=>{s(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const II={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},EI=500,vI=600,TI="_blank",wI="http://localhost";class fl{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function AI(r,e,t,n=EI,i=vI){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-n)/2,0).toString();let c="";const u=Object.assign(Object.assign({},II),{width:n.toString(),height:i.toString(),top:s,left:o}),h=fe().toLowerCase();t&&(c=pd(h)?TI:t),dd(h)&&(e=e||wI,u.scrollbars="yes");const f=Object.entries(u).reduce((_,[b,C])=>`${_}${b}=${C},`,"");if(j_(h)&&c!=="_self")return RI(e||"",c),new fl(null);const m=window.open(e||"",c,f);F(m,r,"popup-blocked");try{m.focus()}catch{}return new fl(m)}function RI(r,e){const t=document.createElement("a");t.href=r,t.target=e;const n=document.createEvent("MouseEvent");n.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(n)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bI="__/auth/handler",PI="emulator/auth/handler",SI=encodeURIComponent("fac");async function pl(r,e,t,n,i,s){F(r.config.authDomain,r,"auth-domain-config-required"),F(r.config.apiKey,r,"invalid-api-key");const o={apiKey:r.config.apiKey,appName:r.name,authType:t,redirectUrl:n,v:or,eventId:i};if(e instanceof Rd){e.setDefaultLanguage(r.languageCode),o.providerId=e.providerId||"",lg(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,m]of Object.entries({}))o[f]=m}if(e instanceof _i){const f=e.getScopes().filter(m=>m!=="");f.length>0&&(o.scopes=f.join(","))}r.tenantId&&(o.tid=r.tenantId);const c=o;for(const f of Object.keys(c))c[f]===void 0&&delete c[f];const u=await r._getAppCheckToken(),h=u?`#${SI}=${encodeURIComponent(u)}`:"";return`${CI(r)}?${pi(c).slice(1)}${h}`}function CI({config:r}){return r.emulator?za(r,PI):`https://${r.authDomain}/${bI}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jo="webStorageSupport";class VI{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=kd,this._completeRedirectFn=eI,this._overrideRedirectResult=Jy}async _openPopup(e,t,n,i){var s;lt((s=this.eventManagers[e._key()])===null||s===void 0?void 0:s.manager,"_initialize() not called before _openPopup()");const o=await pl(e,t,n,Es(),i);return AI(e,o,Xa())}async _openRedirect(e,t,n,i){await this._originValidation(e);const s=await pl(e,t,n,Es(),i);return Ny(s),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:s}=this.eventManagers[t];return i?Promise.resolve(i):(lt(s,"If manager is not set, promise should be"),s)}const n=this.initAndGetManager(e);return this.eventManagers[t]={promise:n},n.catch(()=>{delete this.eventManagers[t]}),n}async initAndGetManager(e){const t=await yI(e),n=new nI(e);return t.register("authEvent",i=>(F(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:n.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=t,n}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Jo,{type:Jo},i=>{var s;const o=(s=i==null?void 0:i[0])===null||s===void 0?void 0:s[Jo];o!==void 0&&t(!!o),je(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=aI(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Id()||fd()||Ka()}}const DI=VI;var ml="@firebase/auth",gl="1.10.6";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kI{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(n=>{e((n==null?void 0:n.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){F(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function NI(r){switch(r){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function xI(r){$n(new un("auth",(e,{options:t})=>{const n=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=n.options;F(o&&!o.includes(":"),"invalid-api-key",{appName:n.name});const u={apiKey:o,authDomain:c,clientPlatform:r,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Ed(r)},h=new W_(n,i,s,u);return iy(h,t),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,n)=>{e.getProvider("auth-internal").initialize()})),$n(new un("auth-internal",e=>{const t=pt(e.getProvider("auth").getImmediate());return(n=>new kI(n))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Nt(ml,gl,NI(r)),Nt(ml,gl,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const OI=5*60,MI=Hh("authIdTokenMaxAge")||OI;let _l=null;const LI=r=>async e=>{const t=e&&await e.getIdTokenResult(),n=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(n&&n>MI)return;const i=t==null?void 0:t.token;_l!==i&&(_l=i,await fetch(r,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function Fw(r=d_()){const e=Ba(r,"auth");if(e.isInitialized())return e.getImmediate();const t=ry(r,{popupRedirectResolver:DI,persistence:[jy,Vy,kd]}),n=Hh("authTokenSyncURL");if(n&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(n,location.origin);if(location.origin===s.origin){const o=LI(s.toString());Py(t,o,()=>o(t.currentUser)),by(t,c=>o(c))}}const i=Ym("auth");return i&&sy(t,`http://${i}`),t}function FI(){var r,e;return(e=(r=document.getElementsByTagName("head"))===null||r===void 0?void 0:r[0])!==null&&e!==void 0?e:document}Q_({loadJS(r){return new Promise((e,t)=>{const n=document.createElement("script");n.setAttribute("src",r),n.onload=e,n.onerror=i=>{const s=Je("internal-error");s.customData=i,t(s)},n.type="text/javascript",n.charset="UTF-8",FI().appendChild(n)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});xI("Browser");var UI="firebase",BI="11.9.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Nt(UI,BI,"app");var yl=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var xt,Ud;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(E,g){function I(){}I.prototype=g.prototype,E.D=g.prototype,E.prototype=new I,E.prototype.constructor=E,E.C=function(v,T,R){for(var y=Array(arguments.length-2),tt=2;tt<arguments.length;tt++)y[tt-2]=arguments[tt];return g.prototype[T].apply(v,y)}}function t(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(n,t),n.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(E,g,I){I||(I=0);var v=Array(16);if(typeof g=="string")for(var T=0;16>T;++T)v[T]=g.charCodeAt(I++)|g.charCodeAt(I++)<<8|g.charCodeAt(I++)<<16|g.charCodeAt(I++)<<24;else for(T=0;16>T;++T)v[T]=g[I++]|g[I++]<<8|g[I++]<<16|g[I++]<<24;g=E.g[0],I=E.g[1],T=E.g[2];var R=E.g[3],y=g+(R^I&(T^R))+v[0]+3614090360&4294967295;g=I+(y<<7&4294967295|y>>>25),y=R+(T^g&(I^T))+v[1]+3905402710&4294967295,R=g+(y<<12&4294967295|y>>>20),y=T+(I^R&(g^I))+v[2]+606105819&4294967295,T=R+(y<<17&4294967295|y>>>15),y=I+(g^T&(R^g))+v[3]+3250441966&4294967295,I=T+(y<<22&4294967295|y>>>10),y=g+(R^I&(T^R))+v[4]+4118548399&4294967295,g=I+(y<<7&4294967295|y>>>25),y=R+(T^g&(I^T))+v[5]+1200080426&4294967295,R=g+(y<<12&4294967295|y>>>20),y=T+(I^R&(g^I))+v[6]+2821735955&4294967295,T=R+(y<<17&4294967295|y>>>15),y=I+(g^T&(R^g))+v[7]+4249261313&4294967295,I=T+(y<<22&4294967295|y>>>10),y=g+(R^I&(T^R))+v[8]+1770035416&4294967295,g=I+(y<<7&4294967295|y>>>25),y=R+(T^g&(I^T))+v[9]+2336552879&4294967295,R=g+(y<<12&4294967295|y>>>20),y=T+(I^R&(g^I))+v[10]+4294925233&4294967295,T=R+(y<<17&4294967295|y>>>15),y=I+(g^T&(R^g))+v[11]+2304563134&4294967295,I=T+(y<<22&4294967295|y>>>10),y=g+(R^I&(T^R))+v[12]+1804603682&4294967295,g=I+(y<<7&4294967295|y>>>25),y=R+(T^g&(I^T))+v[13]+4254626195&4294967295,R=g+(y<<12&4294967295|y>>>20),y=T+(I^R&(g^I))+v[14]+2792965006&4294967295,T=R+(y<<17&4294967295|y>>>15),y=I+(g^T&(R^g))+v[15]+1236535329&4294967295,I=T+(y<<22&4294967295|y>>>10),y=g+(T^R&(I^T))+v[1]+4129170786&4294967295,g=I+(y<<5&4294967295|y>>>27),y=R+(I^T&(g^I))+v[6]+3225465664&4294967295,R=g+(y<<9&4294967295|y>>>23),y=T+(g^I&(R^g))+v[11]+643717713&4294967295,T=R+(y<<14&4294967295|y>>>18),y=I+(R^g&(T^R))+v[0]+3921069994&4294967295,I=T+(y<<20&4294967295|y>>>12),y=g+(T^R&(I^T))+v[5]+3593408605&4294967295,g=I+(y<<5&4294967295|y>>>27),y=R+(I^T&(g^I))+v[10]+38016083&4294967295,R=g+(y<<9&4294967295|y>>>23),y=T+(g^I&(R^g))+v[15]+3634488961&4294967295,T=R+(y<<14&4294967295|y>>>18),y=I+(R^g&(T^R))+v[4]+3889429448&4294967295,I=T+(y<<20&4294967295|y>>>12),y=g+(T^R&(I^T))+v[9]+568446438&4294967295,g=I+(y<<5&4294967295|y>>>27),y=R+(I^T&(g^I))+v[14]+3275163606&4294967295,R=g+(y<<9&4294967295|y>>>23),y=T+(g^I&(R^g))+v[3]+4107603335&4294967295,T=R+(y<<14&4294967295|y>>>18),y=I+(R^g&(T^R))+v[8]+1163531501&4294967295,I=T+(y<<20&4294967295|y>>>12),y=g+(T^R&(I^T))+v[13]+2850285829&4294967295,g=I+(y<<5&4294967295|y>>>27),y=R+(I^T&(g^I))+v[2]+4243563512&4294967295,R=g+(y<<9&4294967295|y>>>23),y=T+(g^I&(R^g))+v[7]+1735328473&4294967295,T=R+(y<<14&4294967295|y>>>18),y=I+(R^g&(T^R))+v[12]+2368359562&4294967295,I=T+(y<<20&4294967295|y>>>12),y=g+(I^T^R)+v[5]+4294588738&4294967295,g=I+(y<<4&4294967295|y>>>28),y=R+(g^I^T)+v[8]+2272392833&4294967295,R=g+(y<<11&4294967295|y>>>21),y=T+(R^g^I)+v[11]+1839030562&4294967295,T=R+(y<<16&4294967295|y>>>16),y=I+(T^R^g)+v[14]+4259657740&4294967295,I=T+(y<<23&4294967295|y>>>9),y=g+(I^T^R)+v[1]+2763975236&4294967295,g=I+(y<<4&4294967295|y>>>28),y=R+(g^I^T)+v[4]+1272893353&4294967295,R=g+(y<<11&4294967295|y>>>21),y=T+(R^g^I)+v[7]+4139469664&4294967295,T=R+(y<<16&4294967295|y>>>16),y=I+(T^R^g)+v[10]+3200236656&4294967295,I=T+(y<<23&4294967295|y>>>9),y=g+(I^T^R)+v[13]+681279174&4294967295,g=I+(y<<4&4294967295|y>>>28),y=R+(g^I^T)+v[0]+3936430074&4294967295,R=g+(y<<11&4294967295|y>>>21),y=T+(R^g^I)+v[3]+3572445317&4294967295,T=R+(y<<16&4294967295|y>>>16),y=I+(T^R^g)+v[6]+76029189&4294967295,I=T+(y<<23&4294967295|y>>>9),y=g+(I^T^R)+v[9]+3654602809&4294967295,g=I+(y<<4&4294967295|y>>>28),y=R+(g^I^T)+v[12]+3873151461&4294967295,R=g+(y<<11&4294967295|y>>>21),y=T+(R^g^I)+v[15]+530742520&4294967295,T=R+(y<<16&4294967295|y>>>16),y=I+(T^R^g)+v[2]+3299628645&4294967295,I=T+(y<<23&4294967295|y>>>9),y=g+(T^(I|~R))+v[0]+4096336452&4294967295,g=I+(y<<6&4294967295|y>>>26),y=R+(I^(g|~T))+v[7]+1126891415&4294967295,R=g+(y<<10&4294967295|y>>>22),y=T+(g^(R|~I))+v[14]+2878612391&4294967295,T=R+(y<<15&4294967295|y>>>17),y=I+(R^(T|~g))+v[5]+4237533241&4294967295,I=T+(y<<21&4294967295|y>>>11),y=g+(T^(I|~R))+v[12]+1700485571&4294967295,g=I+(y<<6&4294967295|y>>>26),y=R+(I^(g|~T))+v[3]+2399980690&4294967295,R=g+(y<<10&4294967295|y>>>22),y=T+(g^(R|~I))+v[10]+4293915773&4294967295,T=R+(y<<15&4294967295|y>>>17),y=I+(R^(T|~g))+v[1]+2240044497&4294967295,I=T+(y<<21&4294967295|y>>>11),y=g+(T^(I|~R))+v[8]+1873313359&4294967295,g=I+(y<<6&4294967295|y>>>26),y=R+(I^(g|~T))+v[15]+4264355552&4294967295,R=g+(y<<10&4294967295|y>>>22),y=T+(g^(R|~I))+v[6]+2734768916&4294967295,T=R+(y<<15&4294967295|y>>>17),y=I+(R^(T|~g))+v[13]+1309151649&4294967295,I=T+(y<<21&4294967295|y>>>11),y=g+(T^(I|~R))+v[4]+4149444226&4294967295,g=I+(y<<6&4294967295|y>>>26),y=R+(I^(g|~T))+v[11]+3174756917&4294967295,R=g+(y<<10&4294967295|y>>>22),y=T+(g^(R|~I))+v[2]+718787259&4294967295,T=R+(y<<15&4294967295|y>>>17),y=I+(R^(T|~g))+v[9]+3951481745&4294967295,E.g[0]=E.g[0]+g&4294967295,E.g[1]=E.g[1]+(T+(y<<21&4294967295|y>>>11))&4294967295,E.g[2]=E.g[2]+T&4294967295,E.g[3]=E.g[3]+R&4294967295}n.prototype.u=function(E,g){g===void 0&&(g=E.length);for(var I=g-this.blockSize,v=this.B,T=this.h,R=0;R<g;){if(T==0)for(;R<=I;)i(this,E,R),R+=this.blockSize;if(typeof E=="string"){for(;R<g;)if(v[T++]=E.charCodeAt(R++),T==this.blockSize){i(this,v),T=0;break}}else for(;R<g;)if(v[T++]=E[R++],T==this.blockSize){i(this,v),T=0;break}}this.h=T,this.o+=g},n.prototype.v=function(){var E=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);E[0]=128;for(var g=1;g<E.length-8;++g)E[g]=0;var I=8*this.o;for(g=E.length-8;g<E.length;++g)E[g]=I&255,I/=256;for(this.u(E),E=Array(16),g=I=0;4>g;++g)for(var v=0;32>v;v+=8)E[I++]=this.g[g]>>>v&255;return E};function s(E,g){var I=c;return Object.prototype.hasOwnProperty.call(I,E)?I[E]:I[E]=g(E)}function o(E,g){this.h=g;for(var I=[],v=!0,T=E.length-1;0<=T;T--){var R=E[T]|0;v&&R==g||(I[T]=R,v=!1)}this.g=I}var c={};function u(E){return-128<=E&&128>E?s(E,function(g){return new o([g|0],0>g?-1:0)}):new o([E|0],0>E?-1:0)}function h(E){if(isNaN(E)||!isFinite(E))return m;if(0>E)return D(h(-E));for(var g=[],I=1,v=0;E>=I;v++)g[v]=E/I|0,I*=4294967296;return new o(g,0)}function f(E,g){if(E.length==0)throw Error("number format error: empty string");if(g=g||10,2>g||36<g)throw Error("radix out of range: "+g);if(E.charAt(0)=="-")return D(f(E.substring(1),g));if(0<=E.indexOf("-"))throw Error('number format error: interior "-" character');for(var I=h(Math.pow(g,8)),v=m,T=0;T<E.length;T+=8){var R=Math.min(8,E.length-T),y=parseInt(E.substring(T,T+R),g);8>R?(R=h(Math.pow(g,R)),v=v.j(R).add(h(y))):(v=v.j(I),v=v.add(h(y)))}return v}var m=u(0),_=u(1),b=u(16777216);r=o.prototype,r.m=function(){if(k(this))return-D(this).m();for(var E=0,g=1,I=0;I<this.g.length;I++){var v=this.i(I);E+=(0<=v?v:4294967296+v)*g,g*=4294967296}return E},r.toString=function(E){if(E=E||10,2>E||36<E)throw Error("radix out of range: "+E);if(C(this))return"0";if(k(this))return"-"+D(this).toString(E);for(var g=h(Math.pow(E,6)),I=this,v="";;){var T=H(I,g).g;I=$(I,T.j(g));var R=((0<I.g.length?I.g[0]:I.h)>>>0).toString(E);if(I=T,C(I))return R+v;for(;6>R.length;)R="0"+R;v=R+v}},r.i=function(E){return 0>E?0:E<this.g.length?this.g[E]:this.h};function C(E){if(E.h!=0)return!1;for(var g=0;g<E.g.length;g++)if(E.g[g]!=0)return!1;return!0}function k(E){return E.h==-1}r.l=function(E){return E=$(this,E),k(E)?-1:C(E)?0:1};function D(E){for(var g=E.g.length,I=[],v=0;v<g;v++)I[v]=~E.g[v];return new o(I,~E.h).add(_)}r.abs=function(){return k(this)?D(this):this},r.add=function(E){for(var g=Math.max(this.g.length,E.g.length),I=[],v=0,T=0;T<=g;T++){var R=v+(this.i(T)&65535)+(E.i(T)&65535),y=(R>>>16)+(this.i(T)>>>16)+(E.i(T)>>>16);v=y>>>16,R&=65535,y&=65535,I[T]=y<<16|R}return new o(I,I[I.length-1]&-2147483648?-1:0)};function $(E,g){return E.add(D(g))}r.j=function(E){if(C(this)||C(E))return m;if(k(this))return k(E)?D(this).j(D(E)):D(D(this).j(E));if(k(E))return D(this.j(D(E)));if(0>this.l(b)&&0>E.l(b))return h(this.m()*E.m());for(var g=this.g.length+E.g.length,I=[],v=0;v<2*g;v++)I[v]=0;for(v=0;v<this.g.length;v++)for(var T=0;T<E.g.length;T++){var R=this.i(v)>>>16,y=this.i(v)&65535,tt=E.i(T)>>>16,dr=E.i(T)&65535;I[2*v+2*T]+=y*dr,B(I,2*v+2*T),I[2*v+2*T+1]+=R*dr,B(I,2*v+2*T+1),I[2*v+2*T+1]+=y*tt,B(I,2*v+2*T+1),I[2*v+2*T+2]+=R*tt,B(I,2*v+2*T+2)}for(v=0;v<g;v++)I[v]=I[2*v+1]<<16|I[2*v];for(v=g;v<2*g;v++)I[v]=0;return new o(I,0)};function B(E,g){for(;(E[g]&65535)!=E[g];)E[g+1]+=E[g]>>>16,E[g]&=65535,g++}function L(E,g){this.g=E,this.h=g}function H(E,g){if(C(g))throw Error("division by zero");if(C(E))return new L(m,m);if(k(E))return g=H(D(E),g),new L(D(g.g),D(g.h));if(k(g))return g=H(E,D(g)),new L(D(g.g),g.h);if(30<E.g.length){if(k(E)||k(g))throw Error("slowDivide_ only works with positive integers.");for(var I=_,v=g;0>=v.l(E);)I=Z(I),v=Z(v);var T=G(I,1),R=G(v,1);for(v=G(v,2),I=G(I,2);!C(v);){var y=R.add(v);0>=y.l(E)&&(T=T.add(I),R=y),v=G(v,1),I=G(I,1)}return g=$(E,T.j(g)),new L(T,g)}for(T=m;0<=E.l(g);){for(I=Math.max(1,Math.floor(E.m()/g.m())),v=Math.ceil(Math.log(I)/Math.LN2),v=48>=v?1:Math.pow(2,v-48),R=h(I),y=R.j(g);k(y)||0<y.l(E);)I-=v,R=h(I),y=R.j(g);C(R)&&(R=_),T=T.add(R),E=$(E,y)}return new L(T,E)}r.A=function(E){return H(this,E).h},r.and=function(E){for(var g=Math.max(this.g.length,E.g.length),I=[],v=0;v<g;v++)I[v]=this.i(v)&E.i(v);return new o(I,this.h&E.h)},r.or=function(E){for(var g=Math.max(this.g.length,E.g.length),I=[],v=0;v<g;v++)I[v]=this.i(v)|E.i(v);return new o(I,this.h|E.h)},r.xor=function(E){for(var g=Math.max(this.g.length,E.g.length),I=[],v=0;v<g;v++)I[v]=this.i(v)^E.i(v);return new o(I,this.h^E.h)};function Z(E){for(var g=E.g.length+1,I=[],v=0;v<g;v++)I[v]=E.i(v)<<1|E.i(v-1)>>>31;return new o(I,E.h)}function G(E,g){var I=g>>5;g%=32;for(var v=E.g.length-I,T=[],R=0;R<v;R++)T[R]=0<g?E.i(R+I)>>>g|E.i(R+I+1)<<32-g:E.i(R+I);return new o(T,E.h)}n.prototype.digest=n.prototype.v,n.prototype.reset=n.prototype.s,n.prototype.update=n.prototype.u,Ud=n,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.A,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=h,o.fromString=f,xt=o}).apply(typeof yl<"u"?yl:typeof self<"u"?self:typeof window<"u"?window:{});var Ji=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Bd,Mr,qd,cs,da,jd,zd,$d;(function(){var r,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,l,d){return a==Array.prototype||a==Object.prototype||(a[l]=d.value),a};function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Ji=="object"&&Ji];for(var l=0;l<a.length;++l){var d=a[l];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var n=t(this);function i(a,l){if(l)e:{var d=n;a=a.split(".");for(var p=0;p<a.length-1;p++){var A=a[p];if(!(A in d))break e;d=d[A]}a=a[a.length-1],p=d[a],l=l(p),l!=p&&l!=null&&e(d,a,{configurable:!0,writable:!0,value:l})}}function s(a,l){a instanceof String&&(a+="");var d=0,p=!1,A={next:function(){if(!p&&d<a.length){var P=d++;return{value:l(P,a[P]),done:!1}}return p=!0,{done:!0,value:void 0}}};return A[Symbol.iterator]=function(){return A},A}i("Array.prototype.values",function(a){return a||function(){return s(this,function(l,d){return d})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var o=o||{},c=this||self;function u(a){var l=typeof a;return l=l!="object"?l:a?Array.isArray(a)?"array":l:"null",l=="array"||l=="object"&&typeof a.length=="number"}function h(a){var l=typeof a;return l=="object"&&a!=null||l=="function"}function f(a,l,d){return a.call.apply(a.bind,arguments)}function m(a,l,d){if(!a)throw Error();if(2<arguments.length){var p=Array.prototype.slice.call(arguments,2);return function(){var A=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(A,p),a.apply(l,A)}}return function(){return a.apply(l,arguments)}}function _(a,l,d){return _=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:m,_.apply(null,arguments)}function b(a,l){var d=Array.prototype.slice.call(arguments,1);return function(){var p=d.slice();return p.push.apply(p,arguments),a.apply(this,p)}}function C(a,l){function d(){}d.prototype=l.prototype,a.aa=l.prototype,a.prototype=new d,a.prototype.constructor=a,a.Qb=function(p,A,P){for(var N=Array(arguments.length-2),ne=2;ne<arguments.length;ne++)N[ne-2]=arguments[ne];return l.prototype[A].apply(p,N)}}function k(a){const l=a.length;if(0<l){const d=Array(l);for(let p=0;p<l;p++)d[p]=a[p];return d}return[]}function D(a,l){for(let d=1;d<arguments.length;d++){const p=arguments[d];if(u(p)){const A=a.length||0,P=p.length||0;a.length=A+P;for(let N=0;N<P;N++)a[A+N]=p[N]}else a.push(p)}}class ${constructor(l,d){this.i=l,this.j=d,this.h=0,this.g=null}get(){let l;return 0<this.h?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function B(a){return/^[\s\xa0]*$/.test(a)}function L(){var a=c.navigator;return a&&(a=a.userAgent)?a:""}function H(a){return H[" "](a),a}H[" "]=function(){};var Z=L().indexOf("Gecko")!=-1&&!(L().toLowerCase().indexOf("webkit")!=-1&&L().indexOf("Edge")==-1)&&!(L().indexOf("Trident")!=-1||L().indexOf("MSIE")!=-1)&&L().indexOf("Edge")==-1;function G(a,l,d){for(const p in a)l.call(d,a[p],p,a)}function E(a,l){for(const d in a)l.call(void 0,a[d],d,a)}function g(a){const l={};for(const d in a)l[d]=a[d];return l}const I="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function v(a,l){let d,p;for(let A=1;A<arguments.length;A++){p=arguments[A];for(d in p)a[d]=p[d];for(let P=0;P<I.length;P++)d=I[P],Object.prototype.hasOwnProperty.call(p,d)&&(a[d]=p[d])}}function T(a){var l=1;a=a.split(":");const d=[];for(;0<l&&a.length;)d.push(a.shift()),l--;return a.length&&d.push(a.join(":")),d}function R(a){c.setTimeout(()=>{throw a},0)}function y(){var a=vo;let l=null;return a.g&&(l=a.g,a.g=a.g.next,a.g||(a.h=null),l.next=null),l}class tt{constructor(){this.h=this.g=null}add(l,d){const p=dr.get();p.set(l,d),this.h?this.h.next=p:this.g=p,this.h=p}}var dr=new $(()=>new cm,a=>a.reset());class cm{constructor(){this.next=this.g=this.h=null}set(l,d){this.h=l,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let fr,pr=!1,vo=new tt,jc=()=>{const a=c.Promise.resolve(void 0);fr=()=>{a.then(um)}};var um=()=>{for(var a;a=y();){try{a.h.call(a.g)}catch(d){R(d)}var l=dr;l.j(a),100>l.h&&(l.h++,a.next=l.g,l.g=a)}pr=!1};function _t(){this.s=this.s,this.C=this.C}_t.prototype.s=!1,_t.prototype.ma=function(){this.s||(this.s=!0,this.N())},_t.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function ye(a,l){this.type=a,this.g=this.target=l,this.defaultPrevented=!1}ye.prototype.h=function(){this.defaultPrevented=!0};var lm=function(){if(!c.addEventListener||!Object.defineProperty)return!1;var a=!1,l=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const d=()=>{};c.addEventListener("test",d,l),c.removeEventListener("test",d,l)}catch{}return a}();function mr(a,l){if(ye.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a){var d=this.type=a.type,p=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;if(this.target=a.target||a.srcElement,this.g=l,l=a.relatedTarget){if(Z){e:{try{H(l.nodeName);var A=!0;break e}catch{}A=!1}A||(l=null)}}else d=="mouseover"?l=a.fromElement:d=="mouseout"&&(l=a.toElement);this.relatedTarget=l,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=typeof a.pointerType=="string"?a.pointerType:hm[a.pointerType]||"",this.state=a.state,this.i=a,a.defaultPrevented&&mr.aa.h.call(this)}}C(mr,ye);var hm={2:"touch",3:"pen",4:"mouse"};mr.prototype.h=function(){mr.aa.h.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var Di="closure_listenable_"+(1e6*Math.random()|0),dm=0;function fm(a,l,d,p,A){this.listener=a,this.proxy=null,this.src=l,this.type=d,this.capture=!!p,this.ha=A,this.key=++dm,this.da=this.fa=!1}function ki(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function Ni(a){this.src=a,this.g={},this.h=0}Ni.prototype.add=function(a,l,d,p,A){var P=a.toString();a=this.g[P],a||(a=this.g[P]=[],this.h++);var N=wo(a,l,p,A);return-1<N?(l=a[N],d||(l.fa=!1)):(l=new fm(l,this.src,P,!!p,A),l.fa=d,a.push(l)),l};function To(a,l){var d=l.type;if(d in a.g){var p=a.g[d],A=Array.prototype.indexOf.call(p,l,void 0),P;(P=0<=A)&&Array.prototype.splice.call(p,A,1),P&&(ki(l),a.g[d].length==0&&(delete a.g[d],a.h--))}}function wo(a,l,d,p){for(var A=0;A<a.length;++A){var P=a[A];if(!P.da&&P.listener==l&&P.capture==!!d&&P.ha==p)return A}return-1}var Ao="closure_lm_"+(1e6*Math.random()|0),Ro={};function zc(a,l,d,p,A){if(Array.isArray(l)){for(var P=0;P<l.length;P++)zc(a,l[P],d,p,A);return null}return d=Gc(d),a&&a[Di]?a.K(l,d,h(p)?!!p.capture:!1,A):pm(a,l,d,!1,p,A)}function pm(a,l,d,p,A,P){if(!l)throw Error("Invalid event type");var N=h(A)?!!A.capture:!!A,ne=Po(a);if(ne||(a[Ao]=ne=new Ni(a)),d=ne.add(l,d,p,N,P),d.proxy)return d;if(p=mm(),d.proxy=p,p.src=a,p.listener=d,a.addEventListener)lm||(A=N),A===void 0&&(A=!1),a.addEventListener(l.toString(),p,A);else if(a.attachEvent)a.attachEvent(Kc(l.toString()),p);else if(a.addListener&&a.removeListener)a.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return d}function mm(){function a(d){return l.call(a.src,a.listener,d)}const l=gm;return a}function $c(a,l,d,p,A){if(Array.isArray(l))for(var P=0;P<l.length;P++)$c(a,l[P],d,p,A);else p=h(p)?!!p.capture:!!p,d=Gc(d),a&&a[Di]?(a=a.i,l=String(l).toString(),l in a.g&&(P=a.g[l],d=wo(P,d,p,A),-1<d&&(ki(P[d]),Array.prototype.splice.call(P,d,1),P.length==0&&(delete a.g[l],a.h--)))):a&&(a=Po(a))&&(l=a.g[l.toString()],a=-1,l&&(a=wo(l,d,p,A)),(d=-1<a?l[a]:null)&&bo(d))}function bo(a){if(typeof a!="number"&&a&&!a.da){var l=a.src;if(l&&l[Di])To(l.i,a);else{var d=a.type,p=a.proxy;l.removeEventListener?l.removeEventListener(d,p,a.capture):l.detachEvent?l.detachEvent(Kc(d),p):l.addListener&&l.removeListener&&l.removeListener(p),(d=Po(l))?(To(d,a),d.h==0&&(d.src=null,l[Ao]=null)):ki(a)}}}function Kc(a){return a in Ro?Ro[a]:Ro[a]="on"+a}function gm(a,l){if(a.da)a=!0;else{l=new mr(l,this);var d=a.listener,p=a.ha||a.src;a.fa&&bo(a),a=d.call(p,l)}return a}function Po(a){return a=a[Ao],a instanceof Ni?a:null}var So="__closure_events_fn_"+(1e9*Math.random()>>>0);function Gc(a){return typeof a=="function"?a:(a[So]||(a[So]=function(l){return a.handleEvent(l)}),a[So])}function Ie(){_t.call(this),this.i=new Ni(this),this.M=this,this.F=null}C(Ie,_t),Ie.prototype[Di]=!0,Ie.prototype.removeEventListener=function(a,l,d,p){$c(this,a,l,d,p)};function Se(a,l){var d,p=a.F;if(p)for(d=[];p;p=p.F)d.push(p);if(a=a.M,p=l.type||l,typeof l=="string")l=new ye(l,a);else if(l instanceof ye)l.target=l.target||a;else{var A=l;l=new ye(p,a),v(l,A)}if(A=!0,d)for(var P=d.length-1;0<=P;P--){var N=l.g=d[P];A=xi(N,p,!0,l)&&A}if(N=l.g=a,A=xi(N,p,!0,l)&&A,A=xi(N,p,!1,l)&&A,d)for(P=0;P<d.length;P++)N=l.g=d[P],A=xi(N,p,!1,l)&&A}Ie.prototype.N=function(){if(Ie.aa.N.call(this),this.i){var a=this.i,l;for(l in a.g){for(var d=a.g[l],p=0;p<d.length;p++)ki(d[p]);delete a.g[l],a.h--}}this.F=null},Ie.prototype.K=function(a,l,d,p){return this.i.add(String(a),l,!1,d,p)},Ie.prototype.L=function(a,l,d,p){return this.i.add(String(a),l,!0,d,p)};function xi(a,l,d,p){if(l=a.i.g[String(l)],!l)return!0;l=l.concat();for(var A=!0,P=0;P<l.length;++P){var N=l[P];if(N&&!N.da&&N.capture==d){var ne=N.listener,ge=N.ha||N.src;N.fa&&To(a.i,N),A=ne.call(ge,p)!==!1&&A}}return A&&!p.defaultPrevented}function Hc(a,l,d){if(typeof a=="function")d&&(a=_(a,d));else if(a&&typeof a.handleEvent=="function")a=_(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(l)?-1:c.setTimeout(a,l||0)}function Wc(a){a.g=Hc(()=>{a.g=null,a.i&&(a.i=!1,Wc(a))},a.l);const l=a.h;a.h=null,a.m.apply(null,l)}class _m extends _t{constructor(l,d){super(),this.m=l,this.l=d,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:Wc(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function gr(a){_t.call(this),this.h=a,this.g={}}C(gr,_t);var Qc=[];function Yc(a){G(a.g,function(l,d){this.g.hasOwnProperty(d)&&bo(l)},a),a.g={}}gr.prototype.N=function(){gr.aa.N.call(this),Yc(this)},gr.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Co=c.JSON.stringify,ym=c.JSON.parse,Im=class{stringify(a){return c.JSON.stringify(a,void 0)}parse(a){return c.JSON.parse(a,void 0)}};function Vo(){}Vo.prototype.h=null;function Jc(a){return a.h||(a.h=a.i())}function Xc(){}var _r={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Do(){ye.call(this,"d")}C(Do,ye);function ko(){ye.call(this,"c")}C(ko,ye);var Kt={},Zc=null;function Oi(){return Zc=Zc||new Ie}Kt.La="serverreachability";function eu(a){ye.call(this,Kt.La,a)}C(eu,ye);function yr(a){const l=Oi();Se(l,new eu(l))}Kt.STAT_EVENT="statevent";function tu(a,l){ye.call(this,Kt.STAT_EVENT,a),this.stat=l}C(tu,ye);function Ce(a){const l=Oi();Se(l,new tu(l,a))}Kt.Ma="timingevent";function nu(a,l){ye.call(this,Kt.Ma,a),this.size=l}C(nu,ye);function Ir(a,l){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){a()},l)}function Er(){this.g=!0}Er.prototype.xa=function(){this.g=!1};function Em(a,l,d,p,A,P){a.info(function(){if(a.g)if(P)for(var N="",ne=P.split("&"),ge=0;ge<ne.length;ge++){var J=ne[ge].split("=");if(1<J.length){var Ee=J[0];J=J[1];var ve=Ee.split("_");N=2<=ve.length&&ve[1]=="type"?N+(Ee+"="+J+"&"):N+(Ee+"=redacted&")}}else N=null;else N=P;return"XMLHTTP REQ ("+p+") [attempt "+A+"]: "+l+`
`+d+`
`+N})}function vm(a,l,d,p,A,P,N){a.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+A+"]: "+l+`
`+d+`
`+P+" "+N})}function Tn(a,l,d,p){a.info(function(){return"XMLHTTP TEXT ("+l+"): "+wm(a,d)+(p?" "+p:"")})}function Tm(a,l){a.info(function(){return"TIMEOUT: "+l})}Er.prototype.info=function(){};function wm(a,l){if(!a.g)return l;if(!l)return null;try{var d=JSON.parse(l);if(d){for(a=0;a<d.length;a++)if(Array.isArray(d[a])){var p=d[a];if(!(2>p.length)){var A=p[1];if(Array.isArray(A)&&!(1>A.length)){var P=A[0];if(P!="noop"&&P!="stop"&&P!="close")for(var N=1;N<A.length;N++)A[N]=""}}}}return Co(d)}catch{return l}}var Mi={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},ru={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},No;function Li(){}C(Li,Vo),Li.prototype.g=function(){return new XMLHttpRequest},Li.prototype.i=function(){return{}},No=new Li;function yt(a,l,d,p){this.j=a,this.i=l,this.l=d,this.R=p||1,this.U=new gr(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new iu}function iu(){this.i=null,this.g="",this.h=!1}var su={},xo={};function Oo(a,l,d){a.L=1,a.v=qi(nt(l)),a.m=d,a.P=!0,ou(a,null)}function ou(a,l){a.F=Date.now(),Fi(a),a.A=nt(a.v);var d=a.A,p=a.R;Array.isArray(p)||(p=[String(p)]),Eu(d.i,"t",p),a.C=0,d=a.j.J,a.h=new iu,a.g=Fu(a.j,d?l:null,!a.m),0<a.O&&(a.M=new _m(_(a.Y,a,a.g),a.O)),l=a.U,d=a.g,p=a.ca;var A="readystatechange";Array.isArray(A)||(A&&(Qc[0]=A.toString()),A=Qc);for(var P=0;P<A.length;P++){var N=zc(d,A[P],p||l.handleEvent,!1,l.h||l);if(!N)break;l.g[N.key]=N}l=a.H?g(a.H):{},a.m?(a.u||(a.u="POST"),l["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.A,a.u,a.m,l)):(a.u="GET",a.g.ea(a.A,a.u,null,l)),yr(),Em(a.i,a.u,a.A,a.l,a.R,a.m)}yt.prototype.ca=function(a){a=a.target;const l=this.M;l&&rt(a)==3?l.j():this.Y(a)},yt.prototype.Y=function(a){try{if(a==this.g)e:{const ve=rt(this.g);var l=this.g.Ba();const Rn=this.g.Z();if(!(3>ve)&&(ve!=3||this.g&&(this.h.h||this.g.oa()||Pu(this.g)))){this.J||ve!=4||l==7||(l==8||0>=Rn?yr(3):yr(2)),Mo(this);var d=this.g.Z();this.X=d;t:if(au(this)){var p=Pu(this.g);a="";var A=p.length,P=rt(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Gt(this),vr(this);var N="";break t}this.h.i=new c.TextDecoder}for(l=0;l<A;l++)this.h.h=!0,a+=this.h.i.decode(p[l],{stream:!(P&&l==A-1)});p.length=0,this.h.g+=a,this.C=0,N=this.h.g}else N=this.g.oa();if(this.o=d==200,vm(this.i,this.u,this.A,this.l,this.R,ve,d),this.o){if(this.T&&!this.K){t:{if(this.g){var ne,ge=this.g;if((ne=ge.g?ge.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!B(ne)){var J=ne;break t}}J=null}if(d=J)Tn(this.i,this.l,d,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Lo(this,d);else{this.o=!1,this.s=3,Ce(12),Gt(this),vr(this);break e}}if(this.P){d=!0;let ze;for(;!this.J&&this.C<N.length;)if(ze=Am(this,N),ze==xo){ve==4&&(this.s=4,Ce(14),d=!1),Tn(this.i,this.l,null,"[Incomplete Response]");break}else if(ze==su){this.s=4,Ce(15),Tn(this.i,this.l,N,"[Invalid Chunk]"),d=!1;break}else Tn(this.i,this.l,ze,null),Lo(this,ze);if(au(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),ve!=4||N.length!=0||this.h.h||(this.s=1,Ce(16),d=!1),this.o=this.o&&d,!d)Tn(this.i,this.l,N,"[Invalid Chunked Response]"),Gt(this),vr(this);else if(0<N.length&&!this.W){this.W=!0;var Ee=this.j;Ee.g==this&&Ee.ba&&!Ee.M&&(Ee.j.info("Great, no buffering proxy detected. Bytes received: "+N.length),zo(Ee),Ee.M=!0,Ce(11))}}else Tn(this.i,this.l,N,null),Lo(this,N);ve==4&&Gt(this),this.o&&!this.J&&(ve==4?xu(this.j,this):(this.o=!1,Fi(this)))}else qm(this.g),d==400&&0<N.indexOf("Unknown SID")?(this.s=3,Ce(12)):(this.s=0,Ce(13)),Gt(this),vr(this)}}}catch{}finally{}};function au(a){return a.g?a.u=="GET"&&a.L!=2&&a.j.Ca:!1}function Am(a,l){var d=a.C,p=l.indexOf(`
`,d);return p==-1?xo:(d=Number(l.substring(d,p)),isNaN(d)?su:(p+=1,p+d>l.length?xo:(l=l.slice(p,p+d),a.C=p+d,l)))}yt.prototype.cancel=function(){this.J=!0,Gt(this)};function Fi(a){a.S=Date.now()+a.I,cu(a,a.I)}function cu(a,l){if(a.B!=null)throw Error("WatchDog timer not null");a.B=Ir(_(a.ba,a),l)}function Mo(a){a.B&&(c.clearTimeout(a.B),a.B=null)}yt.prototype.ba=function(){this.B=null;const a=Date.now();0<=a-this.S?(Tm(this.i,this.A),this.L!=2&&(yr(),Ce(17)),Gt(this),this.s=2,vr(this)):cu(this,this.S-a)};function vr(a){a.j.G==0||a.J||xu(a.j,a)}function Gt(a){Mo(a);var l=a.M;l&&typeof l.ma=="function"&&l.ma(),a.M=null,Yc(a.U),a.g&&(l=a.g,a.g=null,l.abort(),l.ma())}function Lo(a,l){try{var d=a.j;if(d.G!=0&&(d.g==a||Fo(d.h,a))){if(!a.K&&Fo(d.h,a)&&d.G==3){try{var p=d.Da.g.parse(l)}catch{p=null}if(Array.isArray(p)&&p.length==3){var A=p;if(A[0]==0){e:if(!d.u){if(d.g)if(d.g.F+3e3<a.F)Hi(d),Ki(d);else break e;jo(d),Ce(18)}}else d.za=A[1],0<d.za-d.T&&37500>A[2]&&d.F&&d.v==0&&!d.C&&(d.C=Ir(_(d.Za,d),6e3));if(1>=hu(d.h)&&d.ca){try{d.ca()}catch{}d.ca=void 0}}else Wt(d,11)}else if((a.K||d.g==a)&&Hi(d),!B(l))for(A=d.Da.g.parse(l),l=0;l<A.length;l++){let J=A[l];if(d.T=J[0],J=J[1],d.G==2)if(J[0]=="c"){d.K=J[1],d.ia=J[2];const Ee=J[3];Ee!=null&&(d.la=Ee,d.j.info("VER="+d.la));const ve=J[4];ve!=null&&(d.Aa=ve,d.j.info("SVER="+d.Aa));const Rn=J[5];Rn!=null&&typeof Rn=="number"&&0<Rn&&(p=1.5*Rn,d.L=p,d.j.info("backChannelRequestTimeoutMs_="+p)),p=d;const ze=a.g;if(ze){const Qi=ze.g?ze.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Qi){var P=p.h;P.g||Qi.indexOf("spdy")==-1&&Qi.indexOf("quic")==-1&&Qi.indexOf("h2")==-1||(P.j=P.l,P.g=new Set,P.h&&(Uo(P,P.h),P.h=null))}if(p.D){const $o=ze.g?ze.g.getResponseHeader("X-HTTP-Session-Id"):null;$o&&(p.ya=$o,ie(p.I,p.D,$o))}}d.G=3,d.l&&d.l.ua(),d.ba&&(d.R=Date.now()-a.F,d.j.info("Handshake RTT: "+d.R+"ms")),p=d;var N=a;if(p.qa=Lu(p,p.J?p.ia:null,p.W),N.K){du(p.h,N);var ne=N,ge=p.L;ge&&(ne.I=ge),ne.B&&(Mo(ne),Fi(ne)),p.g=N}else ku(p);0<d.i.length&&Gi(d)}else J[0]!="stop"&&J[0]!="close"||Wt(d,7);else d.G==3&&(J[0]=="stop"||J[0]=="close"?J[0]=="stop"?Wt(d,7):qo(d):J[0]!="noop"&&d.l&&d.l.ta(J),d.v=0)}}yr(4)}catch{}}var Rm=class{constructor(a,l){this.g=a,this.map=l}};function uu(a){this.l=a||10,c.PerformanceNavigationTiming?(a=c.performance.getEntriesByType("navigation"),a=0<a.length&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function lu(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function hu(a){return a.h?1:a.g?a.g.size:0}function Fo(a,l){return a.h?a.h==l:a.g?a.g.has(l):!1}function Uo(a,l){a.g?a.g.add(l):a.h=l}function du(a,l){a.h&&a.h==l?a.h=null:a.g&&a.g.has(l)&&a.g.delete(l)}uu.prototype.cancel=function(){if(this.i=fu(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function fu(a){if(a.h!=null)return a.i.concat(a.h.D);if(a.g!=null&&a.g.size!==0){let l=a.i;for(const d of a.g.values())l=l.concat(d.D);return l}return k(a.i)}function bm(a){if(a.V&&typeof a.V=="function")return a.V();if(typeof Map<"u"&&a instanceof Map||typeof Set<"u"&&a instanceof Set)return Array.from(a.values());if(typeof a=="string")return a.split("");if(u(a)){for(var l=[],d=a.length,p=0;p<d;p++)l.push(a[p]);return l}l=[],d=0;for(p in a)l[d++]=a[p];return l}function Pm(a){if(a.na&&typeof a.na=="function")return a.na();if(!a.V||typeof a.V!="function"){if(typeof Map<"u"&&a instanceof Map)return Array.from(a.keys());if(!(typeof Set<"u"&&a instanceof Set)){if(u(a)||typeof a=="string"){var l=[];a=a.length;for(var d=0;d<a;d++)l.push(d);return l}l=[],d=0;for(const p in a)l[d++]=p;return l}}}function pu(a,l){if(a.forEach&&typeof a.forEach=="function")a.forEach(l,void 0);else if(u(a)||typeof a=="string")Array.prototype.forEach.call(a,l,void 0);else for(var d=Pm(a),p=bm(a),A=p.length,P=0;P<A;P++)l.call(void 0,p[P],d&&d[P],a)}var mu=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Sm(a,l){if(a){a=a.split("&");for(var d=0;d<a.length;d++){var p=a[d].indexOf("="),A=null;if(0<=p){var P=a[d].substring(0,p);A=a[d].substring(p+1)}else P=a[d];l(P,A?decodeURIComponent(A.replace(/\+/g," ")):"")}}}function Ht(a){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,a instanceof Ht){this.h=a.h,Ui(this,a.j),this.o=a.o,this.g=a.g,Bi(this,a.s),this.l=a.l;var l=a.i,d=new Ar;d.i=l.i,l.g&&(d.g=new Map(l.g),d.h=l.h),gu(this,d),this.m=a.m}else a&&(l=String(a).match(mu))?(this.h=!1,Ui(this,l[1]||"",!0),this.o=Tr(l[2]||""),this.g=Tr(l[3]||"",!0),Bi(this,l[4]),this.l=Tr(l[5]||"",!0),gu(this,l[6]||"",!0),this.m=Tr(l[7]||"")):(this.h=!1,this.i=new Ar(null,this.h))}Ht.prototype.toString=function(){var a=[],l=this.j;l&&a.push(wr(l,_u,!0),":");var d=this.g;return(d||l=="file")&&(a.push("//"),(l=this.o)&&a.push(wr(l,_u,!0),"@"),a.push(encodeURIComponent(String(d)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.s,d!=null&&a.push(":",String(d))),(d=this.l)&&(this.g&&d.charAt(0)!="/"&&a.push("/"),a.push(wr(d,d.charAt(0)=="/"?Dm:Vm,!0))),(d=this.i.toString())&&a.push("?",d),(d=this.m)&&a.push("#",wr(d,Nm)),a.join("")};function nt(a){return new Ht(a)}function Ui(a,l,d){a.j=d?Tr(l,!0):l,a.j&&(a.j=a.j.replace(/:$/,""))}function Bi(a,l){if(l){if(l=Number(l),isNaN(l)||0>l)throw Error("Bad port number "+l);a.s=l}else a.s=null}function gu(a,l,d){l instanceof Ar?(a.i=l,xm(a.i,a.h)):(d||(l=wr(l,km)),a.i=new Ar(l,a.h))}function ie(a,l,d){a.i.set(l,d)}function qi(a){return ie(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),a}function Tr(a,l){return a?l?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function wr(a,l,d){return typeof a=="string"?(a=encodeURI(a).replace(l,Cm),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function Cm(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var _u=/[#\/\?@]/g,Vm=/[#\?:]/g,Dm=/[#\?]/g,km=/[#\?@]/g,Nm=/#/g;function Ar(a,l){this.h=this.g=null,this.i=a||null,this.j=!!l}function It(a){a.g||(a.g=new Map,a.h=0,a.i&&Sm(a.i,function(l,d){a.add(decodeURIComponent(l.replace(/\+/g," ")),d)}))}r=Ar.prototype,r.add=function(a,l){It(this),this.i=null,a=wn(this,a);var d=this.g.get(a);return d||this.g.set(a,d=[]),d.push(l),this.h+=1,this};function yu(a,l){It(a),l=wn(a,l),a.g.has(l)&&(a.i=null,a.h-=a.g.get(l).length,a.g.delete(l))}function Iu(a,l){return It(a),l=wn(a,l),a.g.has(l)}r.forEach=function(a,l){It(this),this.g.forEach(function(d,p){d.forEach(function(A){a.call(l,A,p,this)},this)},this)},r.na=function(){It(this);const a=Array.from(this.g.values()),l=Array.from(this.g.keys()),d=[];for(let p=0;p<l.length;p++){const A=a[p];for(let P=0;P<A.length;P++)d.push(l[p])}return d},r.V=function(a){It(this);let l=[];if(typeof a=="string")Iu(this,a)&&(l=l.concat(this.g.get(wn(this,a))));else{a=Array.from(this.g.values());for(let d=0;d<a.length;d++)l=l.concat(a[d])}return l},r.set=function(a,l){return It(this),this.i=null,a=wn(this,a),Iu(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[l]),this.h+=1,this},r.get=function(a,l){return a?(a=this.V(a),0<a.length?String(a[0]):l):l};function Eu(a,l,d){yu(a,l),0<d.length&&(a.i=null,a.g.set(wn(a,l),k(d)),a.h+=d.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],l=Array.from(this.g.keys());for(var d=0;d<l.length;d++){var p=l[d];const P=encodeURIComponent(String(p)),N=this.V(p);for(p=0;p<N.length;p++){var A=P;N[p]!==""&&(A+="="+encodeURIComponent(String(N[p]))),a.push(A)}}return this.i=a.join("&")};function wn(a,l){return l=String(l),a.j&&(l=l.toLowerCase()),l}function xm(a,l){l&&!a.j&&(It(a),a.i=null,a.g.forEach(function(d,p){var A=p.toLowerCase();p!=A&&(yu(this,p),Eu(this,A,d))},a)),a.j=l}function Om(a,l){const d=new Er;if(c.Image){const p=new Image;p.onload=b(Et,d,"TestLoadImage: loaded",!0,l,p),p.onerror=b(Et,d,"TestLoadImage: error",!1,l,p),p.onabort=b(Et,d,"TestLoadImage: abort",!1,l,p),p.ontimeout=b(Et,d,"TestLoadImage: timeout",!1,l,p),c.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=a}else l(!1)}function Mm(a,l){const d=new Er,p=new AbortController,A=setTimeout(()=>{p.abort(),Et(d,"TestPingServer: timeout",!1,l)},1e4);fetch(a,{signal:p.signal}).then(P=>{clearTimeout(A),P.ok?Et(d,"TestPingServer: ok",!0,l):Et(d,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(A),Et(d,"TestPingServer: error",!1,l)})}function Et(a,l,d,p,A){try{A&&(A.onload=null,A.onerror=null,A.onabort=null,A.ontimeout=null),p(d)}catch{}}function Lm(){this.g=new Im}function Fm(a,l,d){const p=d||"";try{pu(a,function(A,P){let N=A;h(A)&&(N=Co(A)),l.push(p+P+"="+encodeURIComponent(N))})}catch(A){throw l.push(p+"type="+encodeURIComponent("_badmap")),A}}function ji(a){this.l=a.Ub||null,this.j=a.eb||!1}C(ji,Vo),ji.prototype.g=function(){return new zi(this.l,this.j)},ji.prototype.i=function(a){return function(){return a}}({});function zi(a,l){Ie.call(this),this.D=a,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}C(zi,Ie),r=zi.prototype,r.open=function(a,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=a,this.A=l,this.readyState=1,br(this)},r.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const l={headers:this.u,method:this.B,credentials:this.m,cache:void 0};a&&(l.body=a),(this.D||c).fetch(new Request(this.A,l)).then(this.Sa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Rr(this)),this.readyState=0},r.Sa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,br(this)),this.g&&(this.readyState=3,br(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;vu(this)}else a.text().then(this.Ra.bind(this),this.ga.bind(this))};function vu(a){a.j.read().then(a.Pa.bind(a)).catch(a.ga.bind(a))}r.Pa=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var l=a.value?a.value:new Uint8Array(0);(l=this.v.decode(l,{stream:!a.done}))&&(this.response=this.responseText+=l)}a.done?Rr(this):br(this),this.readyState==3&&vu(this)}},r.Ra=function(a){this.g&&(this.response=this.responseText=a,Rr(this))},r.Qa=function(a){this.g&&(this.response=a,Rr(this))},r.ga=function(){this.g&&Rr(this)};function Rr(a){a.readyState=4,a.l=null,a.j=null,a.v=null,br(a)}r.setRequestHeader=function(a,l){this.u.append(a,l)},r.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],l=this.h.entries();for(var d=l.next();!d.done;)d=d.value,a.push(d[0]+": "+d[1]),d=l.next();return a.join(`\r
`)};function br(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(zi.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function Tu(a){let l="";return G(a,function(d,p){l+=p,l+=":",l+=d,l+=`\r
`}),l}function Bo(a,l,d){e:{for(p in d){var p=!1;break e}p=!0}p||(d=Tu(d),typeof a=="string"?d!=null&&encodeURIComponent(String(d)):ie(a,l,d))}function ue(a){Ie.call(this),this.headers=new Map,this.o=a||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}C(ue,Ie);var Um=/^https?$/i,Bm=["POST","PUT"];r=ue.prototype,r.Ha=function(a){this.J=a},r.ea=function(a,l,d,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);l=l?l.toUpperCase():"GET",this.D=a,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():No.g(),this.v=this.o?Jc(this.o):Jc(No),this.g.onreadystatechange=_(this.Ea,this);try{this.B=!0,this.g.open(l,String(a),!0),this.B=!1}catch(P){wu(this,P);return}if(a=d||"",d=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var A in p)d.set(A,p[A]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const P of p.keys())d.set(P,p.get(P));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(d.keys()).find(P=>P.toLowerCase()=="content-type"),A=c.FormData&&a instanceof c.FormData,!(0<=Array.prototype.indexOf.call(Bm,l,void 0))||p||A||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[P,N]of d)this.g.setRequestHeader(P,N);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{bu(this),this.u=!0,this.g.send(a),this.u=!1}catch(P){wu(this,P)}};function wu(a,l){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=l,a.m=5,Au(a),$i(a)}function Au(a){a.A||(a.A=!0,Se(a,"complete"),Se(a,"error"))}r.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=a||7,Se(this,"complete"),Se(this,"abort"),$i(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),$i(this,!0)),ue.aa.N.call(this)},r.Ea=function(){this.s||(this.B||this.u||this.j?Ru(this):this.bb())},r.bb=function(){Ru(this)};function Ru(a){if(a.h&&typeof o<"u"&&(!a.v[1]||rt(a)!=4||a.Z()!=2)){if(a.u&&rt(a)==4)Hc(a.Ea,0,a);else if(Se(a,"readystatechange"),rt(a)==4){a.h=!1;try{const N=a.Z();e:switch(N){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var d;if(!(d=l)){var p;if(p=N===0){var A=String(a.D).match(mu)[1]||null;!A&&c.self&&c.self.location&&(A=c.self.location.protocol.slice(0,-1)),p=!Um.test(A?A.toLowerCase():"")}d=p}if(d)Se(a,"complete"),Se(a,"success");else{a.m=6;try{var P=2<rt(a)?a.g.statusText:""}catch{P=""}a.l=P+" ["+a.Z()+"]",Au(a)}}finally{$i(a)}}}}function $i(a,l){if(a.g){bu(a);const d=a.g,p=a.v[0]?()=>{}:null;a.g=null,a.v=null,l||Se(a,"ready");try{d.onreadystatechange=p}catch{}}}function bu(a){a.I&&(c.clearTimeout(a.I),a.I=null)}r.isActive=function(){return!!this.g};function rt(a){return a.g?a.g.readyState:0}r.Z=function(){try{return 2<rt(this)?this.g.status:-1}catch{return-1}},r.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.Oa=function(a){if(this.g){var l=this.g.responseText;return a&&l.indexOf(a)==0&&(l=l.substring(a.length)),ym(l)}};function Pu(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.H){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function qm(a){const l={};a=(a.g&&2<=rt(a)&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<a.length;p++){if(B(a[p]))continue;var d=T(a[p]);const A=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const P=l[A]||[];l[A]=P,P.push(d)}E(l,function(p){return p.join(", ")})}r.Ba=function(){return this.m},r.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Pr(a,l,d){return d&&d.internalChannelParams&&d.internalChannelParams[a]||l}function Su(a){this.Aa=0,this.i=[],this.j=new Er,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Pr("failFast",!1,a),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Pr("baseRetryDelayMs",5e3,a),this.cb=Pr("retryDelaySeedMs",1e4,a),this.Wa=Pr("forwardChannelMaxRetries",2,a),this.wa=Pr("forwardChannelRequestTimeoutMs",2e4,a),this.pa=a&&a.xmlHttpFactory||void 0,this.Xa=a&&a.Tb||void 0,this.Ca=a&&a.useFetchStreams||!1,this.L=void 0,this.J=a&&a.supportsCrossDomainXhr||!1,this.K="",this.h=new uu(a&&a.concurrentRequestLimit),this.Da=new Lm,this.P=a&&a.fastHandshake||!1,this.O=a&&a.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=a&&a.Rb||!1,a&&a.xa&&this.j.xa(),a&&a.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&a&&a.detectBufferingProxy||!1,this.ja=void 0,a&&a.longPollingTimeout&&0<a.longPollingTimeout&&(this.ja=a.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}r=Su.prototype,r.la=8,r.G=1,r.connect=function(a,l,d,p){Ce(0),this.W=a,this.H=l||{},d&&p!==void 0&&(this.H.OSID=d,this.H.OAID=p),this.F=this.X,this.I=Lu(this,null,this.W),Gi(this)};function qo(a){if(Cu(a),a.G==3){var l=a.U++,d=nt(a.I);if(ie(d,"SID",a.K),ie(d,"RID",l),ie(d,"TYPE","terminate"),Sr(a,d),l=new yt(a,a.j,l),l.L=2,l.v=qi(nt(d)),d=!1,c.navigator&&c.navigator.sendBeacon)try{d=c.navigator.sendBeacon(l.v.toString(),"")}catch{}!d&&c.Image&&(new Image().src=l.v,d=!0),d||(l.g=Fu(l.j,null),l.g.ea(l.v)),l.F=Date.now(),Fi(l)}Mu(a)}function Ki(a){a.g&&(zo(a),a.g.cancel(),a.g=null)}function Cu(a){Ki(a),a.u&&(c.clearTimeout(a.u),a.u=null),Hi(a),a.h.cancel(),a.s&&(typeof a.s=="number"&&c.clearTimeout(a.s),a.s=null)}function Gi(a){if(!lu(a.h)&&!a.s){a.s=!0;var l=a.Ga;fr||jc(),pr||(fr(),pr=!0),vo.add(l,a),a.B=0}}function jm(a,l){return hu(a.h)>=a.h.j-(a.s?1:0)?!1:a.s?(a.i=l.D.concat(a.i),!0):a.G==1||a.G==2||a.B>=(a.Va?0:a.Wa)?!1:(a.s=Ir(_(a.Ga,a,l),Ou(a,a.B)),a.B++,!0)}r.Ga=function(a){if(this.s)if(this.s=null,this.G==1){if(!a){this.U=Math.floor(1e5*Math.random()),a=this.U++;const A=new yt(this,this.j,a);let P=this.o;if(this.S&&(P?(P=g(P),v(P,this.S)):P=this.S),this.m!==null||this.O||(A.H=P,P=null),this.P)e:{for(var l=0,d=0;d<this.i.length;d++){t:{var p=this.i[d];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(l+=p,4096<l){l=d;break e}if(l===4096||d===this.i.length-1){l=d+1;break e}}l=1e3}else l=1e3;l=Du(this,A,l),d=nt(this.I),ie(d,"RID",a),ie(d,"CVER",22),this.D&&ie(d,"X-HTTP-Session-Id",this.D),Sr(this,d),P&&(this.O?l="headers="+encodeURIComponent(String(Tu(P)))+"&"+l:this.m&&Bo(d,this.m,P)),Uo(this.h,A),this.Ua&&ie(d,"TYPE","init"),this.P?(ie(d,"$req",l),ie(d,"SID","null"),A.T=!0,Oo(A,d,null)):Oo(A,d,l),this.G=2}}else this.G==3&&(a?Vu(this,a):this.i.length==0||lu(this.h)||Vu(this))};function Vu(a,l){var d;l?d=l.l:d=a.U++;const p=nt(a.I);ie(p,"SID",a.K),ie(p,"RID",d),ie(p,"AID",a.T),Sr(a,p),a.m&&a.o&&Bo(p,a.m,a.o),d=new yt(a,a.j,d,a.B+1),a.m===null&&(d.H=a.o),l&&(a.i=l.D.concat(a.i)),l=Du(a,d,1e3),d.I=Math.round(.5*a.wa)+Math.round(.5*a.wa*Math.random()),Uo(a.h,d),Oo(d,p,l)}function Sr(a,l){a.H&&G(a.H,function(d,p){ie(l,p,d)}),a.l&&pu({},function(d,p){ie(l,p,d)})}function Du(a,l,d){d=Math.min(a.i.length,d);var p=a.l?_(a.l.Na,a.l,a):null;e:{var A=a.i;let P=-1;for(;;){const N=["count="+d];P==-1?0<d?(P=A[0].g,N.push("ofs="+P)):P=0:N.push("ofs="+P);let ne=!0;for(let ge=0;ge<d;ge++){let J=A[ge].g;const Ee=A[ge].map;if(J-=P,0>J)P=Math.max(0,A[ge].g-100),ne=!1;else try{Fm(Ee,N,"req"+J+"_")}catch{p&&p(Ee)}}if(ne){p=N.join("&");break e}}}return a=a.i.splice(0,d),l.D=a,p}function ku(a){if(!a.g&&!a.u){a.Y=1;var l=a.Fa;fr||jc(),pr||(fr(),pr=!0),vo.add(l,a),a.v=0}}function jo(a){return a.g||a.u||3<=a.v?!1:(a.Y++,a.u=Ir(_(a.Fa,a),Ou(a,a.v)),a.v++,!0)}r.Fa=function(){if(this.u=null,Nu(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var a=2*this.R;this.j.info("BP detection timer enabled: "+a),this.A=Ir(_(this.ab,this),a)}},r.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Ce(10),Ki(this),Nu(this))};function zo(a){a.A!=null&&(c.clearTimeout(a.A),a.A=null)}function Nu(a){a.g=new yt(a,a.j,"rpc",a.Y),a.m===null&&(a.g.H=a.o),a.g.O=0;var l=nt(a.qa);ie(l,"RID","rpc"),ie(l,"SID",a.K),ie(l,"AID",a.T),ie(l,"CI",a.F?"0":"1"),!a.F&&a.ja&&ie(l,"TO",a.ja),ie(l,"TYPE","xmlhttp"),Sr(a,l),a.m&&a.o&&Bo(l,a.m,a.o),a.L&&(a.g.I=a.L);var d=a.g;a=a.ia,d.L=1,d.v=qi(nt(l)),d.m=null,d.P=!0,ou(d,a)}r.Za=function(){this.C!=null&&(this.C=null,Ki(this),jo(this),Ce(19))};function Hi(a){a.C!=null&&(c.clearTimeout(a.C),a.C=null)}function xu(a,l){var d=null;if(a.g==l){Hi(a),zo(a),a.g=null;var p=2}else if(Fo(a.h,l))d=l.D,du(a.h,l),p=1;else return;if(a.G!=0){if(l.o)if(p==1){d=l.m?l.m.length:0,l=Date.now()-l.F;var A=a.B;p=Oi(),Se(p,new nu(p,d)),Gi(a)}else ku(a);else if(A=l.s,A==3||A==0&&0<l.X||!(p==1&&jm(a,l)||p==2&&jo(a)))switch(d&&0<d.length&&(l=a.h,l.i=l.i.concat(d)),A){case 1:Wt(a,5);break;case 4:Wt(a,10);break;case 3:Wt(a,6);break;default:Wt(a,2)}}}function Ou(a,l){let d=a.Ta+Math.floor(Math.random()*a.cb);return a.isActive()||(d*=2),d*l}function Wt(a,l){if(a.j.info("Error code "+l),l==2){var d=_(a.fb,a),p=a.Xa;const A=!p;p=new Ht(p||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||Ui(p,"https"),qi(p),A?Om(p.toString(),d):Mm(p.toString(),d)}else Ce(2);a.G=0,a.l&&a.l.sa(l),Mu(a),Cu(a)}r.fb=function(a){a?(this.j.info("Successfully pinged google.com"),Ce(2)):(this.j.info("Failed to ping google.com"),Ce(1))};function Mu(a){if(a.G=0,a.ka=[],a.l){const l=fu(a.h);(l.length!=0||a.i.length!=0)&&(D(a.ka,l),D(a.ka,a.i),a.h.i.length=0,k(a.i),a.i.length=0),a.l.ra()}}function Lu(a,l,d){var p=d instanceof Ht?nt(d):new Ht(d);if(p.g!="")l&&(p.g=l+"."+p.g),Bi(p,p.s);else{var A=c.location;p=A.protocol,l=l?l+"."+A.hostname:A.hostname,A=+A.port;var P=new Ht(null);p&&Ui(P,p),l&&(P.g=l),A&&Bi(P,A),d&&(P.l=d),p=P}return d=a.D,l=a.ya,d&&l&&ie(p,d,l),ie(p,"VER",a.la),Sr(a,p),p}function Fu(a,l,d){if(l&&!a.J)throw Error("Can't create secondary domain capable XhrIo object.");return l=a.Ca&&!a.pa?new ue(new ji({eb:d})):new ue(a.pa),l.Ha(a.J),l}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function Uu(){}r=Uu.prototype,r.ua=function(){},r.ta=function(){},r.sa=function(){},r.ra=function(){},r.isActive=function(){return!0},r.Na=function(){};function Wi(){}Wi.prototype.g=function(a,l){return new xe(a,l)};function xe(a,l){Ie.call(this),this.g=new Su(l),this.l=a,this.h=l&&l.messageUrlParams||null,a=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(a?a["X-WebChannel-Content-Type"]=l.messageContentType:a={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.va&&(a?a["X-WebChannel-Client-Profile"]=l.va:a={"X-WebChannel-Client-Profile":l.va}),this.g.S=a,(a=l&&l.Sb)&&!B(a)&&(this.g.m=a),this.v=l&&l.supportsCrossDomainXhr||!1,this.u=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!B(l)&&(this.g.D=l,a=this.h,a!==null&&l in a&&(a=this.h,l in a&&delete a[l])),this.j=new An(this)}C(xe,Ie),xe.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},xe.prototype.close=function(){qo(this.g)},xe.prototype.o=function(a){var l=this.g;if(typeof a=="string"){var d={};d.__data__=a,a=d}else this.u&&(d={},d.__data__=Co(a),a=d);l.i.push(new Rm(l.Ya++,a)),l.G==3&&Gi(l)},xe.prototype.N=function(){this.g.l=null,delete this.j,qo(this.g),delete this.g,xe.aa.N.call(this)};function Bu(a){Do.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var l=a.__sm__;if(l){e:{for(const d in l){a=d;break e}a=void 0}(this.i=a)&&(a=this.i,l=l!==null&&a in l?l[a]:void 0),this.data=l}else this.data=a}C(Bu,Do);function qu(){ko.call(this),this.status=1}C(qu,ko);function An(a){this.g=a}C(An,Uu),An.prototype.ua=function(){Se(this.g,"a")},An.prototype.ta=function(a){Se(this.g,new Bu(a))},An.prototype.sa=function(a){Se(this.g,new qu)},An.prototype.ra=function(){Se(this.g,"b")},Wi.prototype.createWebChannel=Wi.prototype.g,xe.prototype.send=xe.prototype.o,xe.prototype.open=xe.prototype.m,xe.prototype.close=xe.prototype.close,$d=function(){return new Wi},zd=function(){return Oi()},jd=Kt,da={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Mi.NO_ERROR=0,Mi.TIMEOUT=8,Mi.HTTP_ERROR=6,cs=Mi,ru.COMPLETE="complete",qd=ru,Xc.EventType=_r,_r.OPEN="a",_r.CLOSE="b",_r.ERROR="c",_r.MESSAGE="d",Ie.prototype.listen=Ie.prototype.K,Mr=Xc,ue.prototype.listenOnce=ue.prototype.L,ue.prototype.getLastError=ue.prototype.Ka,ue.prototype.getLastErrorCode=ue.prototype.Ba,ue.prototype.getStatus=ue.prototype.Z,ue.prototype.getResponseJson=ue.prototype.Oa,ue.prototype.getResponseText=ue.prototype.oa,ue.prototype.send=ue.prototype.ea,ue.prototype.setWithCredentials=ue.prototype.Ha,Bd=ue}).apply(typeof Ji<"u"?Ji:typeof self<"u"?self:typeof window<"u"?window:{});const Il="@firebase/firestore",El="4.7.17";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ve{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ve.UNAUTHENTICATED=new Ve(null),Ve.GOOGLE_CREDENTIALS=new Ve("google-credentials-uid"),Ve.FIRST_PARTY=new Ve("first-party-uid"),Ve.MOCK_USER=new Ve("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let cr="11.9.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fn=new Fa("@firebase/firestore");function kn(){return fn.logLevel}function V(r,...e){if(fn.logLevel<=W.DEBUG){const t=e.map(ec);fn.debug(`Firestore (${cr}): ${r}`,...t)}}function De(r,...e){if(fn.logLevel<=W.ERROR){const t=e.map(ec);fn.error(`Firestore (${cr}): ${r}`,...t)}}function Kn(r,...e){if(fn.logLevel<=W.WARN){const t=e.map(ec);fn.warn(`Firestore (${cr}): ${r}`,...t)}}function ec(r){if(typeof r=="string")return r;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(r)}catch{return r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function M(r,e,t){let n="Unexpected state";typeof e=="string"?n=e:t=e,Kd(r,n,t)}function Kd(r,e,t){let n=`FIRESTORE (${cr}) INTERNAL ASSERTION FAILED: ${e} (ID: ${r.toString(16)})`;if(t!==void 0)try{n+=" CONTEXT: "+JSON.stringify(t)}catch{n+=" CONTEXT: "+t}throw De(n),new Error(n)}function U(r,e,t,n){let i="Unexpected state";typeof t=="string"?i=t:n=t,r||Kd(e,i,n)}function z(r,e){return r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const S={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class x extends ft{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ze{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qI{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Gd{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Ve.UNAUTHENTICATED))}shutdown(){}}class jI{constructor(e){this.t=e,this.currentUser=Ve.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){U(this.o===void 0,42304);let n=this.i;const i=u=>this.i!==n?(n=this.i,t(u)):Promise.resolve();let s=new Ze;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new Ze,e.enqueueRetryable(()=>i(this.currentUser))};const o=()=>{const u=s;e.enqueueRetryable(async()=>{await u.promise,await i(this.currentUser)})},c=u=>{V("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(u=>c(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?c(u):(V("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new Ze)}},0),o()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(n=>this.i!==e?(V("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(U(typeof n.accessToken=="string",31837,{l:n}),new qI(n.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return U(e===null||typeof e=="string",2055,{h:e}),new Ve(e)}}class zI{constructor(e,t,n){this.P=e,this.T=t,this.I=n,this.type="FirstParty",this.user=Ve.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class $I{constructor(e,t,n){this.P=e,this.T=t,this.I=n}getToken(){return Promise.resolve(new zI(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(Ve.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class vl{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class KI{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Ue(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){U(this.o===void 0,3512);const n=s=>{s.error!=null&&V("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const o=s.token!==this.m;return this.m=s.token,V("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>n(s))};const i=s=>{V("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){const s=this.V.getImmediate({optional:!0});s?i(s):V("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new vl(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(U(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new vl(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GI(r){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(r);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let n=0;n<r;n++)t[n]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hd(){return new TextEncoder}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tc{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let n="";for(;n.length<20;){const i=GI(40);for(let s=0;s<i.length;++s)n.length<20&&i[s]<t&&(n+=e.charAt(i[s]%62))}return n}}function j(r,e){return r<e?-1:r>e?1:0}function fa(r,e){let t=0;for(;t<r.length&&t<e.length;){const n=r.codePointAt(t),i=e.codePointAt(t);if(n!==i){if(n<128&&i<128)return j(n,i);{const s=Hd(),o=HI(s.encode(Tl(r,t)),s.encode(Tl(e,t)));return o!==0?o:j(n,i)}}t+=n>65535?2:1}return j(r.length,e.length)}function Tl(r,e){return r.codePointAt(e)>65535?r.substring(e,e+2):r.substring(e,e+1)}function HI(r,e){for(let t=0;t<r.length&&t<e.length;++t)if(r[t]!==e[t])return j(r[t],e[t]);return j(r.length,e.length)}function Gn(r,e,t){return r.length===e.length&&r.every((n,i)=>t(n,e[i]))}function Wd(r){return r+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wl=-62135596800,Al=1e6;class ae{static now(){return ae.fromMillis(Date.now())}static fromDate(e){return ae.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor((e-1e3*t)*Al);return new ae(t,n)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new x(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new x(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<wl)throw new x(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new x(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Al}_compareTo(e){return this.seconds===e.seconds?j(this.nanoseconds,e.nanoseconds):j(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds-wl;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class q{static fromTimestamp(e){return new q(e)}static min(){return new q(new ae(0,0))}static max(){return new q(new ae(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rl="__name__";class We{constructor(e,t,n){t===void 0?t=0:t>e.length&&M(637,{offset:t,range:e.length}),n===void 0?n=e.length-t:n>e.length-t&&M(1746,{length:n,range:e.length-t}),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return We.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof We?e.forEach(n=>{t.push(n)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let i=0;i<n;i++){const s=We.compareSegments(e.get(i),t.get(i));if(s!==0)return s}return j(e.length,t.length)}static compareSegments(e,t){const n=We.isNumericId(e),i=We.isNumericId(t);return n&&!i?-1:!n&&i?1:n&&i?We.extractNumericId(e).compare(We.extractNumericId(t)):fa(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return xt.fromString(e.substring(4,e.length-2))}}class X extends We{construct(e,t,n){return new X(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new x(S.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter(i=>i.length>0))}return new X(t)}static emptyPath(){return new X([])}}const WI=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class oe extends We{construct(e,t,n){return new oe(e,t,n)}static isValidIdentifier(e){return WI.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),oe.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Rl}static keyField(){return new oe([Rl])}static fromServerFormat(e){const t=[];let n="",i=0;const s=()=>{if(n.length===0)throw new x(S.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let o=!1;for(;i<e.length;){const c=e[i];if(c==="\\"){if(i+1===e.length)throw new x(S.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[i+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new x(S.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=u,i+=2}else c==="`"?(o=!o,i++):c!=="."||o?(n+=c,i++):(s(),i++)}if(s(),o)throw new x(S.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new oe(t)}static emptyPath(){return new oe([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O{constructor(e){this.path=e}static fromPath(e){return new O(X.fromString(e))}static fromName(e){return new O(X.fromString(e).popFirst(5))}static empty(){return new O(X.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&X.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return X.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new O(new X(e.slice()))}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zr=-1;class Ps{constructor(e,t,n,i){this.indexId=e,this.collectionGroup=t,this.fields=n,this.indexState=i}}function pa(r){return r.fields.find(e=>e.kind===2)}function Jt(r){return r.fields.filter(e=>e.kind!==2)}Ps.UNKNOWN_ID=-1;class us{constructor(e,t){this.fieldPath=e,this.kind=t}}class ei{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new ei(0,Le.min())}}function QI(r,e){const t=r.toTimestamp().seconds,n=r.toTimestamp().nanoseconds+1,i=q.fromTimestamp(n===1e9?new ae(t+1,0):new ae(t,n));return new Le(i,O.empty(),e)}function Qd(r){return new Le(r.readTime,r.key,Zr)}class Le{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new Le(q.min(),O.empty(),Zr)}static max(){return new Le(q.max(),O.empty(),Zr)}}function nc(r,e){let t=r.readTime.compareTo(e.readTime);return t!==0?t:(t=O.comparator(r.documentKey,e.documentKey),t!==0?t:j(r.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yd="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Jd{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function En(r){if(r.code!==S.FAILED_PRECONDITION||r.message!==Yd)throw r;V("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class w{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&M(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new w((n,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(n,i)},this.catchCallback=s=>{this.wrapFailure(t,s).next(n,i)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof w?t:w.resolve(t)}catch(t){return w.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):w.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):w.reject(t)}static resolve(e){return new w((t,n)=>{t(e)})}static reject(e){return new w((t,n)=>{n(e)})}static waitFor(e){return new w((t,n)=>{let i=0,s=0,o=!1;e.forEach(c=>{++i,c.next(()=>{++s,o&&s===i&&t()},u=>n(u))}),o=!0,s===i&&t()})}static or(e){let t=w.resolve(!1);for(const n of e)t=t.next(i=>i?w.resolve(i):n());return t}static forEach(e,t){const n=[];return e.forEach((i,s)=>{n.push(t.call(this,i,s))}),this.waitFor(n)}static mapArray(e,t){return new w((n,i)=>{const s=e.length,o=new Array(s);let c=0;for(let u=0;u<s;u++){const h=u;t(e[h]).next(f=>{o[h]=f,++c,c===s&&n(o)},f=>i(f))}})}static doWhile(e,t){return new w((n,i)=>{const s=()=>{e()===!0?t().next(()=>{s()},i):n()};s()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oe="SimpleDb";class Hs{static open(e,t,n,i){try{return new Hs(t,e.transaction(i,n))}catch(s){throw new jr(t,s)}}constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.S=new Ze,this.transaction.oncomplete=()=>{this.S.resolve()},this.transaction.onabort=()=>{t.error?this.S.reject(new jr(e,t.error)):this.S.resolve()},this.transaction.onerror=n=>{const i=rc(n.target.error);this.S.reject(new jr(e,i))}}get D(){return this.S.promise}abort(e){e&&this.S.reject(e),this.aborted||(V(Oe,"Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}v(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new JI(t)}}class Ot{static delete(e){return V(Oe,"Removing database:",e),Zt(Kh().indexedDB.deleteDatabase(e)).toPromise()}static C(){if(!Xh())return!1;if(Ot.F())return!0;const e=fe(),t=Ot.M(e),n=0<t&&t<10,i=Xd(e),s=0<i&&i<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||n||s)}static F(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)===null||e===void 0?void 0:e.O)==="YES"}static N(e,t){return e.store(t)}static M(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),n=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(n)}constructor(e,t,n){this.name=e,this.version=t,this.B=n,this.L=null,Ot.M(fe())===12.2&&De("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async k(e){return this.db||(V(Oe,"Opening database:",this.name),this.db=await new Promise((t,n)=>{const i=indexedDB.open(this.name,this.version);i.onsuccess=s=>{const o=s.target.result;t(o)},i.onblocked=()=>{n(new jr(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},i.onerror=s=>{const o=s.target.error;o.name==="VersionError"?n(new x(S.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?n(new x(S.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):n(new jr(e,o))},i.onupgradeneeded=s=>{V(Oe,'Database "'+this.name+'" requires upgrade from version:',s.oldVersion);const o=s.target.result;if(this.L!==null&&this.L!==s.oldVersion)throw new Error(`refusing to open IndexedDB database due to potential corruption of the IndexedDB database data; this corruption could be caused by clicking the "clear site data" button in a web browser; try reloading the web page to re-initialize the IndexedDB database: lastClosedDbVersion=${this.L}, event.oldVersion=${s.oldVersion}, event.newVersion=${s.newVersion}, db.version=${o.version}`);this.B.q(o,i.transaction,s.oldVersion,this.version).next(()=>{V(Oe,"Database upgrade to version "+this.version+" complete")})}}),this.db.addEventListener("close",t=>{const n=t.target;this.L=n.version},{passive:!0})),this.$&&(this.db.onversionchange=t=>this.$(t)),this.db}U(e){this.$=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,n,i){const s=t==="readonly";let o=0;for(;;){++o;try{this.db=await this.k(e);const c=Hs.open(this.db,e,s?"readonly":"readwrite",n),u=i(c).next(h=>(c.v(),h)).catch(h=>(c.abort(h),w.reject(h))).toPromise();return u.catch(()=>{}),await c.D,u}catch(c){const u=c,h=u.name!=="FirebaseError"&&o<3;if(V(Oe,"Transaction failed with error:",u.message,"Retrying:",h),this.close(),!h)return Promise.reject(u)}}}close(){this.db&&this.db.close(),this.db=void 0}}function Xd(r){const e=r.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class YI{constructor(e){this.K=e,this.W=!1,this.G=null}get isDone(){return this.W}get j(){return this.G}set cursor(e){this.K=e}done(){this.W=!0}H(e){this.G=e}delete(){return Zt(this.K.delete())}}class jr extends x{constructor(e,t){super(S.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function qt(r){return r.name==="IndexedDbTransactionError"}class JI{constructor(e){this.store=e}put(e,t){let n;return t!==void 0?(V(Oe,"PUT",this.store.name,e,t),n=this.store.put(t,e)):(V(Oe,"PUT",this.store.name,"<auto-key>",e),n=this.store.put(e)),Zt(n)}add(e){return V(Oe,"ADD",this.store.name,e,e),Zt(this.store.add(e))}get(e){return Zt(this.store.get(e)).next(t=>(t===void 0&&(t=null),V(Oe,"GET",this.store.name,e,t),t))}delete(e){return V(Oe,"DELETE",this.store.name,e),Zt(this.store.delete(e))}count(){return V(Oe,"COUNT",this.store.name),Zt(this.store.count())}J(e,t){const n=this.options(e,t),i=n.index?this.store.index(n.index):this.store;if(typeof i.getAll=="function"){const s=i.getAll(n.range);return new w((o,c)=>{s.onerror=u=>{c(u.target.error)},s.onsuccess=u=>{o(u.target.result)}})}{const s=this.cursor(n),o=[];return this.Y(s,(c,u)=>{o.push(u)}).next(()=>o)}}Z(e,t){const n=this.store.getAll(e,t===null?void 0:t);return new w((i,s)=>{n.onerror=o=>{s(o.target.error)},n.onsuccess=o=>{i(o.target.result)}})}X(e,t){V(Oe,"DELETE ALL",this.store.name);const n=this.options(e,t);n.ee=!1;const i=this.cursor(n);return this.Y(i,(s,o,c)=>c.delete())}te(e,t){let n;t?n=e:(n={},t=e);const i=this.cursor(n);return this.Y(i,t)}ne(e){const t=this.cursor({});return new w((n,i)=>{t.onerror=s=>{const o=rc(s.target.error);i(o)},t.onsuccess=s=>{const o=s.target.result;o?e(o.primaryKey,o.value).next(c=>{c?o.continue():n()}):n()}})}Y(e,t){const n=[];return new w((i,s)=>{e.onerror=o=>{s(o.target.error)},e.onsuccess=o=>{const c=o.target.result;if(!c)return void i();const u=new YI(c),h=t(c.primaryKey,c.value,u);if(h instanceof w){const f=h.catch(m=>(u.done(),w.reject(m)));n.push(f)}u.isDone?i():u.j===null?c.continue():c.continue(u.j)}}).next(()=>w.waitFor(n))}options(e,t){let n;return e!==void 0&&(typeof e=="string"?n=e:t=e),{index:n,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const n=this.store.index(e.index);return e.ee?n.openKeyCursor(e.range,t):n.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function Zt(r){return new w((e,t)=>{r.onsuccess=n=>{const i=n.target.result;e(i)},r.onerror=n=>{const i=rc(n.target.error);t(i)}})}let bl=!1;function rc(r){const e=Ot.M(fe());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(r.message.indexOf(t)>=0){const n=new x("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return bl||(bl=!0,setTimeout(()=>{throw n},0)),n}}return r}const zr="IndexBackfiller";class XI{constructor(e,t){this.asyncQueue=e,this.re=t,this.task=null}start(){this.ie(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}ie(e){V(zr,`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,async()=>{this.task=null;try{const t=await this.re.se();V(zr,`Documents written: ${t}`)}catch(t){qt(t)?V(zr,"Ignoring IndexedDB error during index backfill: ",t):await En(t)}await this.ie(6e4)})}}class ZI{constructor(e,t){this.localStore=e,this.persistence=t}async se(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",t=>this.oe(t,e))}oe(e,t){const n=new Set;let i=t,s=!0;return w.doWhile(()=>s===!0&&i>0,()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next(o=>{if(o!==null&&!n.has(o))return V(zr,`Processing collection: ${o}`),this._e(e,o,i).next(c=>{i-=c,n.add(o)});s=!1})).next(()=>t-i)}_e(e,t,n){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next(i=>this.localStore.localDocuments.getNextDocuments(e,t,i,n).next(s=>{const o=s.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next(()=>this.ae(i,s)).next(c=>(V(zr,`Updating offset: ${c}`),this.localStore.indexManager.updateCollectionGroup(e,t,c))).next(()=>o.size)}))}ae(e,t){let n=e;return t.changes.forEach((i,s)=>{const o=Qd(s);nc(o,n)>0&&(n=o)}),new Le(n.readTime,n.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Be{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=n=>this.ue(n),this.ce=n=>t.writeSequenceNumber(n))}ue(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ce&&this.ce(e),e}}Be.le=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sn=-1;function Ws(r){return r==null}function ti(r){return r===0&&1/r==-1/0}function eE(r){return typeof r=="number"&&Number.isInteger(r)&&!ti(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ss="";function be(r){let e="";for(let t=0;t<r.length;t++)e.length>0&&(e=Pl(e)),e=tE(r.get(t),e);return Pl(e)}function tE(r,e){let t=e;const n=r.length;for(let i=0;i<n;i++){const s=r.charAt(i);switch(s){case"\0":t+="";break;case Ss:t+="";break;default:t+=s}}return t}function Pl(r){return r+Ss+""}function Qe(r){const e=r.length;if(U(e>=2,64408,{path:r}),e===2)return U(r.charAt(0)===Ss&&r.charAt(1)==="",56145,{path:r}),X.emptyPath();const t=e-2,n=[];let i="";for(let s=0;s<e;){const o=r.indexOf(Ss,s);switch((o<0||o>t)&&M(50515,{path:r}),r.charAt(o+1)){case"":const c=r.substring(s,o);let u;i.length===0?u=c:(i+=c,u=i,i=""),n.push(u);break;case"":i+=r.substring(s,o),i+="\0";break;case"":i+=r.substring(s,o+1);break;default:M(61167,{path:r})}s=o+2}return new X(n)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xt="remoteDocuments",Ii="owner",bn="owner",ni="mutationQueues",nE="userId",$e="mutations",Sl="batchId",rn="userMutationsIndex",Cl=["userId","batchId"];/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ls(r,e){return[r,be(e)]}function Zd(r,e,t){return[r,be(e),t]}const rE={},Hn="documentMutations",Cs="remoteDocumentsV14",iE=["prefixPath","collectionGroup","readTime","documentId"],hs="documentKeyIndex",sE=["prefixPath","collectionGroup","documentId"],ef="collectionGroupIndex",oE=["collectionGroup","readTime","prefixPath","documentId"],ri="remoteDocumentGlobal",ma="remoteDocumentGlobalKey",Wn="targets",tf="queryTargetsIndex",aE=["canonicalId","targetId"],Qn="targetDocuments",cE=["targetId","path"],ic="documentTargetsIndex",uE=["path","targetId"],Vs="targetGlobalKey",on="targetGlobal",ii="collectionParents",lE=["collectionId","parent"],Yn="clientMetadata",hE="clientId",Qs="bundles",dE="bundleId",Ys="namedQueries",fE="name",sc="indexConfiguration",pE="indexId",ga="collectionGroupIndex",mE="collectionGroup",$r="indexState",gE=["indexId","uid"],nf="sequenceNumberIndex",_E=["uid","sequenceNumber"],Kr="indexEntries",yE=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],rf="documentKeyIndex",IE=["indexId","uid","orderedDocumentKey"],Js="documentOverlays",EE=["userId","collectionPath","documentId"],_a="collectionPathOverlayIndex",vE=["userId","collectionPath","largestBatchId"],sf="collectionGroupOverlayIndex",TE=["userId","collectionGroup","largestBatchId"],oc="globals",wE="name",of=[ni,$e,Hn,Xt,Wn,Ii,on,Qn,Yn,ri,ii,Qs,Ys],AE=[...of,Js],af=[ni,$e,Hn,Cs,Wn,Ii,on,Qn,Yn,ri,ii,Qs,Ys,Js],cf=af,ac=[...cf,sc,$r,Kr],RE=ac,uf=[...ac,oc],bE=uf;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ya extends Jd{constructor(e,t){super(),this.he=e,this.currentSequenceNumber=t}}function pe(r,e){const t=z(r);return Ot.N(t.he,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vl(r){let e=0;for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e++;return e}function jt(r,e){for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e(t,r[t])}function lf(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ce{constructor(e,t){this.comparator=e,this.root=t||_e.EMPTY}insert(e,t){return new ce(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,_e.BLACK,null,null))}remove(e){return new ce(this.comparator,this.root.remove(e,this.comparator).copy(null,null,_e.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(n===0)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const i=this.comparator(e,n.key);if(i===0)return t+n.left.size;i<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,n)=>(e(t,n),!1))}toString(){const e=[];return this.inorderTraversal((t,n)=>(e.push(`${t}:${n}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Xi(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Xi(this.root,e,this.comparator,!1)}getReverseIterator(){return new Xi(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Xi(this.root,e,this.comparator,!0)}}class Xi{constructor(e,t,n,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?n(e.key,t):1,t&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class _e{constructor(e,t,n,i,s){this.key=e,this.value=t,this.color=n??_e.RED,this.left=i??_e.EMPTY,this.right=s??_e.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,i,s){return new _e(e??this.key,t??this.value,n??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let i=this;const s=n(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,n),null):s===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,n)),i.fixUp()}removeMin(){if(this.left.isEmpty())return _e.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return _e.EMPTY;n=i.right.min(),i=i.copy(n.key,n.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,_e.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,_e.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw M(43730,{key:this.key,value:this.value});if(this.right.isRed())throw M(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw M(27949);return e+(this.isRed()?0:1)}}_e.EMPTY=null,_e.RED=!0,_e.BLACK=!1;_e.EMPTY=new class{constructor(){this.size=0}get key(){throw M(57766)}get value(){throw M(16141)}get color(){throw M(16727)}get left(){throw M(29726)}get right(){throw M(36894)}copy(e,t,n,i,s){return this}insert(e,t,n){return new _e(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class te{constructor(e){this.comparator=e,this.data=new ce(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,n)=>(e(t),!1))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const i=n.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let n;for(n=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Dl(this.data.getIterator())}getIteratorFrom(e){return new Dl(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(n=>{t=t.add(n)}),t}isEqual(e){if(!(e instanceof te)||this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=n.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new te(this.comparator);return t.data=e,t}}class Dl{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function Pn(r){return r.hasNext()?r.getNext():void 0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ne{constructor(e){this.fields=e,e.sort(oe.comparator)}static empty(){return new Ne([])}unionWith(e){let t=new te(oe.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new Ne(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Gn(this.fields,e.fields,(t,n)=>t.isEqual(n))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hf extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class he{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new hf("Invalid base64 string: "+s):s}}(e);return new he(t)}static fromUint8Array(e){const t=function(i){let s="";for(let o=0;o<i.length;++o)s+=String.fromCharCode(i[o]);return s}(e);return new he(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const n=new Uint8Array(t.length);for(let i=0;i<t.length;i++)n[i]=t.charCodeAt(i);return n}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return j(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}he.EMPTY_BYTE_STRING=new he("");const PE=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function ht(r){if(U(!!r,39018),typeof r=="string"){let e=0;const t=PE.exec(r);if(U(!!t,46558,{timestamp:r}),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}const n=new Date(r);return{seconds:Math.floor(n.getTime()/1e3),nanos:e}}return{seconds:se(r.seconds),nanos:se(r.nanos)}}function se(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function dt(r){return typeof r=="string"?he.fromBase64String(r):he.fromUint8Array(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const df="server_timestamp",ff="__type__",pf="__previous_value__",mf="__local_write_time__";function cc(r){var e,t;return((t=(((e=r==null?void 0:r.mapValue)===null||e===void 0?void 0:e.fields)||{})[ff])===null||t===void 0?void 0:t.stringValue)===df}function Xs(r){const e=r.mapValue.fields[pf];return cc(e)?Xs(e):e}function si(r){const e=ht(r.mapValue.fields[mf].timestampValue);return new ae(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class SE{constructor(e,t,n,i,s,o,c,u,h,f){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=i,this.ssl=s,this.forceLongPolling=o,this.autoDetectLongPolling=c,this.longPollingOptions=u,this.useFetchStreams=h,this.isUsingEmulator=f}}const Ds="(default)";class Mt{constructor(e,t){this.projectId=e,this.database=t||Ds}static empty(){return new Mt("","")}get isDefaultDatabase(){return this.database===Ds}isEqual(e){return e instanceof Mt&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uc="__type__",gf="__max__",Vt={mapValue:{fields:{__type__:{stringValue:gf}}}},lc="__vector__",Jn="value",ds={nullValue:"NULL_VALUE"};function Lt(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?cc(r)?4:_f(r)?9007199254740991:Zs(r)?10:11:M(28295,{value:r})}function et(r,e){if(r===e)return!0;const t=Lt(r);if(t!==Lt(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===e.booleanValue;case 4:return si(r).isEqual(si(e));case 3:return function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;const o=ht(i.timestampValue),c=ht(s.timestampValue);return o.seconds===c.seconds&&o.nanos===c.nanos}(r,e);case 5:return r.stringValue===e.stringValue;case 6:return function(i,s){return dt(i.bytesValue).isEqual(dt(s.bytesValue))}(r,e);case 7:return r.referenceValue===e.referenceValue;case 8:return function(i,s){return se(i.geoPointValue.latitude)===se(s.geoPointValue.latitude)&&se(i.geoPointValue.longitude)===se(s.geoPointValue.longitude)}(r,e);case 2:return function(i,s){if("integerValue"in i&&"integerValue"in s)return se(i.integerValue)===se(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){const o=se(i.doubleValue),c=se(s.doubleValue);return o===c?ti(o)===ti(c):isNaN(o)&&isNaN(c)}return!1}(r,e);case 9:return Gn(r.arrayValue.values||[],e.arrayValue.values||[],et);case 10:case 11:return function(i,s){const o=i.mapValue.fields||{},c=s.mapValue.fields||{};if(Vl(o)!==Vl(c))return!1;for(const u in o)if(o.hasOwnProperty(u)&&(c[u]===void 0||!et(o[u],c[u])))return!1;return!0}(r,e);default:return M(52216,{left:r})}}function oi(r,e){return(r.values||[]).find(t=>et(t,e))!==void 0}function Ft(r,e){if(r===e)return 0;const t=Lt(r),n=Lt(e);if(t!==n)return j(t,n);switch(t){case 0:case 9007199254740991:return 0;case 1:return j(r.booleanValue,e.booleanValue);case 2:return function(s,o){const c=se(s.integerValue||s.doubleValue),u=se(o.integerValue||o.doubleValue);return c<u?-1:c>u?1:c===u?0:isNaN(c)?isNaN(u)?0:-1:1}(r,e);case 3:return kl(r.timestampValue,e.timestampValue);case 4:return kl(si(r),si(e));case 5:return fa(r.stringValue,e.stringValue);case 6:return function(s,o){const c=dt(s),u=dt(o);return c.compareTo(u)}(r.bytesValue,e.bytesValue);case 7:return function(s,o){const c=s.split("/"),u=o.split("/");for(let h=0;h<c.length&&h<u.length;h++){const f=j(c[h],u[h]);if(f!==0)return f}return j(c.length,u.length)}(r.referenceValue,e.referenceValue);case 8:return function(s,o){const c=j(se(s.latitude),se(o.latitude));return c!==0?c:j(se(s.longitude),se(o.longitude))}(r.geoPointValue,e.geoPointValue);case 9:return Nl(r.arrayValue,e.arrayValue);case 10:return function(s,o){var c,u,h,f;const m=s.fields||{},_=o.fields||{},b=(c=m[Jn])===null||c===void 0?void 0:c.arrayValue,C=(u=_[Jn])===null||u===void 0?void 0:u.arrayValue,k=j(((h=b==null?void 0:b.values)===null||h===void 0?void 0:h.length)||0,((f=C==null?void 0:C.values)===null||f===void 0?void 0:f.length)||0);return k!==0?k:Nl(b,C)}(r.mapValue,e.mapValue);case 11:return function(s,o){if(s===Vt.mapValue&&o===Vt.mapValue)return 0;if(s===Vt.mapValue)return 1;if(o===Vt.mapValue)return-1;const c=s.fields||{},u=Object.keys(c),h=o.fields||{},f=Object.keys(h);u.sort(),f.sort();for(let m=0;m<u.length&&m<f.length;++m){const _=fa(u[m],f[m]);if(_!==0)return _;const b=Ft(c[u[m]],h[f[m]]);if(b!==0)return b}return j(u.length,f.length)}(r.mapValue,e.mapValue);default:throw M(23264,{Pe:t})}}function kl(r,e){if(typeof r=="string"&&typeof e=="string"&&r.length===e.length)return j(r,e);const t=ht(r),n=ht(e),i=j(t.seconds,n.seconds);return i!==0?i:j(t.nanos,n.nanos)}function Nl(r,e){const t=r.values||[],n=e.values||[];for(let i=0;i<t.length&&i<n.length;++i){const s=Ft(t[i],n[i]);if(s)return s}return j(t.length,n.length)}function Xn(r){return Ia(r)}function Ia(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?function(t){const n=ht(t);return`time(${n.seconds},${n.nanos})`}(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?function(t){return dt(t).toBase64()}(r.bytesValue):"referenceValue"in r?function(t){return O.fromName(t).toString()}(r.referenceValue):"geoPointValue"in r?function(t){return`geo(${t.latitude},${t.longitude})`}(r.geoPointValue):"arrayValue"in r?function(t){let n="[",i=!0;for(const s of t.values||[])i?i=!1:n+=",",n+=Ia(s);return n+"]"}(r.arrayValue):"mapValue"in r?function(t){const n=Object.keys(t.fields||{}).sort();let i="{",s=!0;for(const o of n)s?s=!1:i+=",",i+=`${o}:${Ia(t.fields[o])}`;return i+"}"}(r.mapValue):M(61005,{value:r})}function fs(r){switch(Lt(r)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Xs(r);return e?16+fs(e):16;case 5:return 2*r.stringValue.length;case 6:return dt(r.bytesValue).approximateByteSize();case 7:return r.referenceValue.length;case 9:return function(n){return(n.values||[]).reduce((i,s)=>i+fs(s),0)}(r.arrayValue);case 10:case 11:return function(n){let i=0;return jt(n.fields,(s,o)=>{i+=s.length+fs(o)}),i}(r.mapValue);default:throw M(13486,{value:r})}}function ai(r,e){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${e.path.canonicalString()}`}}function Ea(r){return!!r&&"integerValue"in r}function ci(r){return!!r&&"arrayValue"in r}function xl(r){return!!r&&"nullValue"in r}function Ol(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function ps(r){return!!r&&"mapValue"in r}function Zs(r){var e,t;return((t=(((e=r==null?void 0:r.mapValue)===null||e===void 0?void 0:e.fields)||{})[uc])===null||t===void 0?void 0:t.stringValue)===lc}function Gr(r){if(r.geoPointValue)return{geoPointValue:Object.assign({},r.geoPointValue)};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:Object.assign({},r.timestampValue)};if(r.mapValue){const e={mapValue:{fields:{}}};return jt(r.mapValue.fields,(t,n)=>e.mapValue.fields[t]=Gr(n)),e}if(r.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(r.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Gr(r.arrayValue.values[t]);return e}return Object.assign({},r)}function _f(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue===gf}const yf={mapValue:{fields:{[uc]:{stringValue:lc},[Jn]:{arrayValue:{}}}}};function CE(r){return"nullValue"in r?ds:"booleanValue"in r?{booleanValue:!1}:"integerValue"in r||"doubleValue"in r?{doubleValue:NaN}:"timestampValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in r?{stringValue:""}:"bytesValue"in r?{bytesValue:""}:"referenceValue"in r?ai(Mt.empty(),O.empty()):"geoPointValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in r?{arrayValue:{}}:"mapValue"in r?Zs(r)?yf:{mapValue:{}}:M(35942,{value:r})}function VE(r){return"nullValue"in r?{booleanValue:!1}:"booleanValue"in r?{doubleValue:NaN}:"integerValue"in r||"doubleValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in r?{stringValue:""}:"stringValue"in r?{bytesValue:""}:"bytesValue"in r?ai(Mt.empty(),O.empty()):"referenceValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in r?{arrayValue:{}}:"arrayValue"in r?yf:"mapValue"in r?Zs(r)?{mapValue:{}}:Vt:M(61959,{value:r})}function Ml(r,e){const t=Ft(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?-1:!r.inclusive&&e.inclusive?1:0}function Ll(r,e){const t=Ft(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?1:!r.inclusive&&e.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ae{constructor(e){this.value=e}static empty(){return new Ae({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!ps(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Gr(t)}setAll(e){let t=oe.emptyPath(),n={},i=[];e.forEach((o,c)=>{if(!t.isImmediateParentOf(c)){const u=this.getFieldsMap(t);this.applyChanges(u,n,i),n={},i=[],t=c.popLast()}o?n[c.lastSegment()]=Gr(o):i.push(c.lastSegment())});const s=this.getFieldsMap(t);this.applyChanges(s,n,i)}delete(e){const t=this.field(e.popLast());ps(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return et(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let i=t.mapValue.fields[e.get(n)];ps(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,n){jt(t,(i,s)=>e[i]=s);for(const i of n)delete e[i]}clone(){return new Ae(Gr(this.value))}}function If(r){const e=[];return jt(r.fields,(t,n)=>{const i=new oe([t]);if(ps(n)){const s=If(n.mapValue).fields;if(s.length===0)e.push(i);else for(const o of s)e.push(i.child(o))}else e.push(i)}),new Ne(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class le{constructor(e,t,n,i,s,o,c){this.key=e,this.documentType=t,this.version=n,this.readTime=i,this.createTime=s,this.data=o,this.documentState=c}static newInvalidDocument(e){return new le(e,0,q.min(),q.min(),q.min(),Ae.empty(),0)}static newFoundDocument(e,t,n,i){return new le(e,1,t,q.min(),n,i,0)}static newNoDocument(e,t){return new le(e,2,t,q.min(),q.min(),Ae.empty(),0)}static newUnknownDocument(e,t){return new le(e,3,t,q.min(),q.min(),Ae.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(q.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Ae.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Ae.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=q.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof le&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new le(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zn{constructor(e,t){this.position=e,this.inclusive=t}}function Fl(r,e,t){let n=0;for(let i=0;i<r.position.length;i++){const s=e[i],o=r.position[i];if(s.field.isKeyField()?n=O.comparator(O.fromName(o.referenceValue),t.key):n=Ft(o,t.data.field(s.field)),s.dir==="desc"&&(n*=-1),n!==0)break}return n}function Ul(r,e){if(r===null)return e===null;if(e===null||r.inclusive!==e.inclusive||r.position.length!==e.position.length)return!1;for(let t=0;t<r.position.length;t++)if(!et(r.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ui{constructor(e,t="asc"){this.field=e,this.dir=t}}function DE(r,e){return r.dir===e.dir&&r.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ef{}class Q extends Ef{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,n):new kE(e,t,n):t==="array-contains"?new OE(e,n):t==="in"?new bf(e,n):t==="not-in"?new ME(e,n):t==="array-contains-any"?new LE(e,n):new Q(e,t,n)}static createKeyFieldInFilter(e,t,n){return t==="in"?new NE(e,n):new xE(e,n)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(Ft(t,this.value)):t!==null&&Lt(this.value)===Lt(t)&&this.matchesComparison(Ft(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return M(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class ee extends Ef{constructor(e,t){super(),this.filters=e,this.op=t,this.Te=null}static create(e,t){return new ee(e,t)}matches(e){return er(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.Te!==null||(this.Te=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.Te}getFilters(){return Object.assign([],this.filters)}}function er(r){return r.op==="and"}function va(r){return r.op==="or"}function hc(r){return vf(r)&&er(r)}function vf(r){for(const e of r.filters)if(e instanceof ee)return!1;return!0}function Ta(r){if(r instanceof Q)return r.field.canonicalString()+r.op.toString()+Xn(r.value);if(hc(r))return r.filters.map(e=>Ta(e)).join(",");{const e=r.filters.map(t=>Ta(t)).join(",");return`${r.op}(${e})`}}function Tf(r,e){return r instanceof Q?function(n,i){return i instanceof Q&&n.op===i.op&&n.field.isEqual(i.field)&&et(n.value,i.value)}(r,e):r instanceof ee?function(n,i){return i instanceof ee&&n.op===i.op&&n.filters.length===i.filters.length?n.filters.reduce((s,o,c)=>s&&Tf(o,i.filters[c]),!0):!1}(r,e):void M(19439)}function wf(r,e){const t=r.filters.concat(e);return ee.create(t,r.op)}function Af(r){return r instanceof Q?function(t){return`${t.field.canonicalString()} ${t.op} ${Xn(t.value)}`}(r):r instanceof ee?function(t){return t.op.toString()+" {"+t.getFilters().map(Af).join(" ,")+"}"}(r):"Filter"}class kE extends Q{constructor(e,t,n){super(e,t,n),this.key=O.fromName(n.referenceValue)}matches(e){const t=O.comparator(e.key,this.key);return this.matchesComparison(t)}}class NE extends Q{constructor(e,t){super(e,"in",t),this.keys=Rf("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class xE extends Q{constructor(e,t){super(e,"not-in",t),this.keys=Rf("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Rf(r,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(n=>O.fromName(n.referenceValue))}class OE extends Q{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return ci(t)&&oi(t.arrayValue,this.value)}}class bf extends Q{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&oi(this.value.arrayValue,t)}}class ME extends Q{constructor(e,t){super(e,"not-in",t)}matches(e){if(oi(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!oi(this.value.arrayValue,t)}}class LE extends Q{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!ci(t)||!t.arrayValue.values)&&t.arrayValue.values.some(n=>oi(this.value.arrayValue,n))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FE{constructor(e,t=null,n=[],i=[],s=null,o=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=i,this.limit=s,this.startAt=o,this.endAt=c,this.Ie=null}}function wa(r,e=null,t=[],n=[],i=null,s=null,o=null){return new FE(r,e,t,n,i,s,o)}function pn(r){const e=z(r);if(e.Ie===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(n=>Ta(n)).join(","),t+="|ob:",t+=e.orderBy.map(n=>function(s){return s.field.canonicalString()+s.dir}(n)).join(","),Ws(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(n=>Xn(n)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(n=>Xn(n)).join(",")),e.Ie=t}return e.Ie}function Ei(r,e){if(r.limit!==e.limit||r.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<r.orderBy.length;t++)if(!DE(r.orderBy[t],e.orderBy[t]))return!1;if(r.filters.length!==e.filters.length)return!1;for(let t=0;t<r.filters.length;t++)if(!Tf(r.filters[t],e.filters[t]))return!1;return r.collectionGroup===e.collectionGroup&&!!r.path.isEqual(e.path)&&!!Ul(r.startAt,e.startAt)&&Ul(r.endAt,e.endAt)}function ks(r){return O.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function Ns(r,e){return r.filters.filter(t=>t instanceof Q&&t.field.isEqual(e))}function Bl(r,e,t){let n=ds,i=!0;for(const s of Ns(r,e)){let o=ds,c=!0;switch(s.op){case"<":case"<=":o=CE(s.value);break;case"==":case"in":case">=":o=s.value;break;case">":o=s.value,c=!1;break;case"!=":case"not-in":o=ds}Ml({value:n,inclusive:i},{value:o,inclusive:c})<0&&(n=o,i=c)}if(t!==null){for(let s=0;s<r.orderBy.length;++s)if(r.orderBy[s].field.isEqual(e)){const o=t.position[s];Ml({value:n,inclusive:i},{value:o,inclusive:t.inclusive})<0&&(n=o,i=t.inclusive);break}}return{value:n,inclusive:i}}function ql(r,e,t){let n=Vt,i=!0;for(const s of Ns(r,e)){let o=Vt,c=!0;switch(s.op){case">=":case">":o=VE(s.value),c=!1;break;case"==":case"in":case"<=":o=s.value;break;case"<":o=s.value,c=!1;break;case"!=":case"not-in":o=Vt}Ll({value:n,inclusive:i},{value:o,inclusive:c})>0&&(n=o,i=c)}if(t!==null){for(let s=0;s<r.orderBy.length;++s)if(r.orderBy[s].field.isEqual(e)){const o=t.position[s];Ll({value:n,inclusive:i},{value:o,inclusive:t.inclusive})>0&&(n=o,i=t.inclusive);break}}return{value:n,inclusive:i}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ur{constructor(e,t=null,n=[],i=[],s=null,o="F",c=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=i,this.limit=s,this.limitType=o,this.startAt=c,this.endAt=u,this.Ee=null,this.de=null,this.Ae=null,this.startAt,this.endAt}}function UE(r,e,t,n,i,s,o,c){return new ur(r,e,t,n,i,s,o,c)}function eo(r){return new ur(r)}function jl(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function Pf(r){return r.collectionGroup!==null}function Hr(r){const e=z(r);if(e.Ee===null){e.Ee=[];const t=new Set;for(const s of e.explicitOrderBy)e.Ee.push(s),t.add(s.field.canonicalString());const n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let c=new te(oe.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(h=>{h.isInequality()&&(c=c.add(h.field))})}),c})(e).forEach(s=>{t.has(s.canonicalString())||s.isKeyField()||e.Ee.push(new ui(s,n))}),t.has(oe.keyField().canonicalString())||e.Ee.push(new ui(oe.keyField(),n))}return e.Ee}function qe(r){const e=z(r);return e.de||(e.de=BE(e,Hr(r))),e.de}function BE(r,e){if(r.limitType==="F")return wa(r.path,r.collectionGroup,e,r.filters,r.limit,r.startAt,r.endAt);{e=e.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new ui(i.field,s)});const t=r.endAt?new Zn(r.endAt.position,r.endAt.inclusive):null,n=r.startAt?new Zn(r.startAt.position,r.startAt.inclusive):null;return wa(r.path,r.collectionGroup,e,r.filters,r.limit,t,n)}}function Aa(r,e){const t=r.filters.concat([e]);return new ur(r.path,r.collectionGroup,r.explicitOrderBy.slice(),t,r.limit,r.limitType,r.startAt,r.endAt)}function Ra(r,e,t){return new ur(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),e,t,r.startAt,r.endAt)}function to(r,e){return Ei(qe(r),qe(e))&&r.limitType===e.limitType}function Sf(r){return`${pn(qe(r))}|lt:${r.limitType}`}function Nn(r){return`Query(target=${function(t){let n=t.path.canonicalString();return t.collectionGroup!==null&&(n+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(n+=`, filters: [${t.filters.map(i=>Af(i)).join(", ")}]`),Ws(t.limit)||(n+=", limit: "+t.limit),t.orderBy.length>0&&(n+=`, orderBy: [${t.orderBy.map(i=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(i)).join(", ")}]`),t.startAt&&(n+=", startAt: ",n+=t.startAt.inclusive?"b:":"a:",n+=t.startAt.position.map(i=>Xn(i)).join(",")),t.endAt&&(n+=", endAt: ",n+=t.endAt.inclusive?"a:":"b:",n+=t.endAt.position.map(i=>Xn(i)).join(",")),`Target(${n})`}(qe(r))}; limitType=${r.limitType})`}function vi(r,e){return e.isFoundDocument()&&function(n,i){const s=i.key.path;return n.collectionGroup!==null?i.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(s):O.isDocumentKey(n.path)?n.path.isEqual(s):n.path.isImmediateParentOf(s)}(r,e)&&function(n,i){for(const s of Hr(n))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0}(r,e)&&function(n,i){for(const s of n.filters)if(!s.matches(i))return!1;return!0}(r,e)&&function(n,i){return!(n.startAt&&!function(o,c,u){const h=Fl(o,c,u);return o.inclusive?h<=0:h<0}(n.startAt,Hr(n),i)||n.endAt&&!function(o,c,u){const h=Fl(o,c,u);return o.inclusive?h>=0:h>0}(n.endAt,Hr(n),i))}(r,e)}function qE(r){return r.collectionGroup||(r.path.length%2==1?r.path.lastSegment():r.path.get(r.path.length-2))}function Cf(r){return(e,t)=>{let n=!1;for(const i of Hr(r)){const s=jE(i,e,t);if(s!==0)return s;n=n||i.field.isKeyField()}return 0}}function jE(r,e,t){const n=r.field.isKeyField()?O.comparator(e.key,t.key):function(s,o,c){const u=o.data.field(s),h=c.data.field(s);return u!==null&&h!==null?Ft(u,h):M(42886)}(r.field,e,t);switch(r.dir){case"asc":return n;case"desc":return-1*n;default:return M(19790,{direction:r.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mt{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n!==void 0){for(const[i,s]of n)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,t){const n=this.mapKeyFn(e),i=this.inner[n];if(i===void 0)return this.inner[n]=[[e,t]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n===void 0)return!1;for(let i=0;i<n.length;i++)if(this.equalsFn(n[i][0],e))return n.length===1?delete this.inner[t]:n.splice(i,1),this.innerSize--,!0;return!1}forEach(e){jt(this.inner,(t,n)=>{for(const[i,s]of n)e(i,s)})}isEmpty(){return lf(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zE=new ce(O.comparator);function Me(){return zE}const Vf=new ce(O.comparator);function Lr(...r){let e=Vf;for(const t of r)e=e.insert(t.key,t);return e}function Df(r){let e=Vf;return r.forEach((t,n)=>e=e.insert(t,n.overlayedDocument)),e}function Ye(){return Wr()}function kf(){return Wr()}function Wr(){return new mt(r=>r.toString(),(r,e)=>r.isEqual(e))}const $E=new ce(O.comparator),KE=new te(O.comparator);function K(...r){let e=KE;for(const t of r)e=e.add(t);return e}const GE=new te(j);function HE(){return GE}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dc(r,e){if(r.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:ti(e)?"-0":e}}function Nf(r){return{integerValue:""+r}}function WE(r,e){return eE(e)?Nf(e):dc(r,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class no{constructor(){this._=void 0}}function QE(r,e,t){return r instanceof tr?function(i,s){const o={fields:{[ff]:{stringValue:df},[mf]:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&cc(s)&&(s=Xs(s)),s&&(o.fields[pf]=s),{mapValue:o}}(t,e):r instanceof nr?Of(r,e):r instanceof rr?Mf(r,e):function(i,s){const o=xf(i,s),c=zl(o)+zl(i.Re);return Ea(o)&&Ea(i.Re)?Nf(c):dc(i.serializer,c)}(r,e)}function YE(r,e,t){return r instanceof nr?Of(r,e):r instanceof rr?Mf(r,e):t}function xf(r,e){return r instanceof li?function(n){return Ea(n)||function(s){return!!s&&"doubleValue"in s}(n)}(e)?e:{integerValue:0}:null}class tr extends no{}class nr extends no{constructor(e){super(),this.elements=e}}function Of(r,e){const t=Lf(e);for(const n of r.elements)t.some(i=>et(i,n))||t.push(n);return{arrayValue:{values:t}}}class rr extends no{constructor(e){super(),this.elements=e}}function Mf(r,e){let t=Lf(e);for(const n of r.elements)t=t.filter(i=>!et(i,n));return{arrayValue:{values:t}}}class li extends no{constructor(e,t){super(),this.serializer=e,this.Re=t}}function zl(r){return se(r.integerValue||r.doubleValue)}function Lf(r){return ci(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ff{constructor(e,t){this.field=e,this.transform=t}}function JE(r,e){return r.field.isEqual(e.field)&&function(n,i){return n instanceof nr&&i instanceof nr||n instanceof rr&&i instanceof rr?Gn(n.elements,i.elements,et):n instanceof li&&i instanceof li?et(n.Re,i.Re):n instanceof tr&&i instanceof tr}(r.transform,e.transform)}class XE{constructor(e,t){this.version=e,this.transformResults=t}}class Re{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Re}static exists(e){return new Re(void 0,e)}static updateTime(e){return new Re(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function ms(r,e){return r.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(r.updateTime):r.exists===void 0||r.exists===e.isFoundDocument()}class ro{}function Uf(r,e){if(!r.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return r.isNoDocument()?new io(r.key,Re.none()):new lr(r.key,r.data,Re.none());{const t=r.data,n=Ae.empty();let i=new te(oe.comparator);for(let s of e.fields)if(!i.has(s)){let o=t.field(s);o===null&&s.length>1&&(s=s.popLast(),o=t.field(s)),o===null?n.delete(s):n.set(s,o),i=i.add(s)}return new gt(r.key,n,new Ne(i.toArray()),Re.none())}}function ZE(r,e,t){r instanceof lr?function(i,s,o){const c=i.value.clone(),u=Kl(i.fieldTransforms,s,o.transformResults);c.setAll(u),s.convertToFoundDocument(o.version,c).setHasCommittedMutations()}(r,e,t):r instanceof gt?function(i,s,o){if(!ms(i.precondition,s))return void s.convertToUnknownDocument(o.version);const c=Kl(i.fieldTransforms,s,o.transformResults),u=s.data;u.setAll(Bf(i)),u.setAll(c),s.convertToFoundDocument(o.version,u).setHasCommittedMutations()}(r,e,t):function(i,s,o){s.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,t)}function Qr(r,e,t,n){return r instanceof lr?function(s,o,c,u){if(!ms(s.precondition,o))return c;const h=s.value.clone(),f=Gl(s.fieldTransforms,u,o);return h.setAll(f),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),null}(r,e,t,n):r instanceof gt?function(s,o,c,u){if(!ms(s.precondition,o))return c;const h=Gl(s.fieldTransforms,u,o),f=o.data;return f.setAll(Bf(s)),f.setAll(h),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),c===null?null:c.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(m=>m.field))}(r,e,t,n):function(s,o,c){return ms(s.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):c}(r,e,t)}function ev(r,e){let t=null;for(const n of r.fieldTransforms){const i=e.data.field(n.field),s=xf(n.transform,i||null);s!=null&&(t===null&&(t=Ae.empty()),t.set(n.field,s))}return t||null}function $l(r,e){return r.type===e.type&&!!r.key.isEqual(e.key)&&!!r.precondition.isEqual(e.precondition)&&!!function(n,i){return n===void 0&&i===void 0||!(!n||!i)&&Gn(n,i,(s,o)=>JE(s,o))}(r.fieldTransforms,e.fieldTransforms)&&(r.type===0?r.value.isEqual(e.value):r.type!==1||r.data.isEqual(e.data)&&r.fieldMask.isEqual(e.fieldMask))}class lr extends ro{constructor(e,t,n,i=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class gt extends ro{constructor(e,t,n,i,s=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function Bf(r){const e=new Map;return r.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const n=r.data.field(t);e.set(t,n)}}),e}function Kl(r,e,t){const n=new Map;U(r.length===t.length,32656,{Ve:t.length,me:r.length});for(let i=0;i<t.length;i++){const s=r[i],o=s.transform,c=e.data.field(s.field);n.set(s.field,YE(o,c,t[i]))}return n}function Gl(r,e,t){const n=new Map;for(const i of r){const s=i.transform,o=t.data.field(i.field);n.set(i.field,QE(s,o,e))}return n}class io extends ro{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class qf extends ro{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fc{constructor(e,t,n,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=i}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&ZE(s,e,n[i])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=Qr(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=Qr(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=kf();return this.mutations.forEach(i=>{const s=e.get(i.key),o=s.overlayedDocument;let c=this.applyToLocalView(o,s.mutatedFields);c=t.has(i.key)?null:c;const u=Uf(o,c);u!==null&&n.set(i.key,u),o.isValidDocument()||o.convertToNoDocument(q.min())}),n}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),K())}isEqual(e){return this.batchId===e.batchId&&Gn(this.mutations,e.mutations,(t,n)=>$l(t,n))&&Gn(this.baseMutations,e.baseMutations,(t,n)=>$l(t,n))}}class pc{constructor(e,t,n,i){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=i}static from(e,t,n){U(e.mutations.length===n.length,58842,{fe:e.mutations.length,ge:n.length});let i=function(){return $E}();const s=e.mutations;for(let o=0;o<s.length;o++)i=i.insert(s[o].key,n[o].version);return new pc(e,t,n,i)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mc{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tv{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var de,Y;function nv(r){switch(r){case S.OK:return M(64938);case S.CANCELLED:case S.UNKNOWN:case S.DEADLINE_EXCEEDED:case S.RESOURCE_EXHAUSTED:case S.INTERNAL:case S.UNAVAILABLE:case S.UNAUTHENTICATED:return!1;case S.INVALID_ARGUMENT:case S.NOT_FOUND:case S.ALREADY_EXISTS:case S.PERMISSION_DENIED:case S.FAILED_PRECONDITION:case S.ABORTED:case S.OUT_OF_RANGE:case S.UNIMPLEMENTED:case S.DATA_LOSS:return!0;default:return M(15467,{code:r})}}function jf(r){if(r===void 0)return De("GRPC error has no .code"),S.UNKNOWN;switch(r){case de.OK:return S.OK;case de.CANCELLED:return S.CANCELLED;case de.UNKNOWN:return S.UNKNOWN;case de.DEADLINE_EXCEEDED:return S.DEADLINE_EXCEEDED;case de.RESOURCE_EXHAUSTED:return S.RESOURCE_EXHAUSTED;case de.INTERNAL:return S.INTERNAL;case de.UNAVAILABLE:return S.UNAVAILABLE;case de.UNAUTHENTICATED:return S.UNAUTHENTICATED;case de.INVALID_ARGUMENT:return S.INVALID_ARGUMENT;case de.NOT_FOUND:return S.NOT_FOUND;case de.ALREADY_EXISTS:return S.ALREADY_EXISTS;case de.PERMISSION_DENIED:return S.PERMISSION_DENIED;case de.FAILED_PRECONDITION:return S.FAILED_PRECONDITION;case de.ABORTED:return S.ABORTED;case de.OUT_OF_RANGE:return S.OUT_OF_RANGE;case de.UNIMPLEMENTED:return S.UNIMPLEMENTED;case de.DATA_LOSS:return S.DATA_LOSS;default:return M(39323,{code:r})}}(Y=de||(de={}))[Y.OK=0]="OK",Y[Y.CANCELLED=1]="CANCELLED",Y[Y.UNKNOWN=2]="UNKNOWN",Y[Y.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Y[Y.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Y[Y.NOT_FOUND=5]="NOT_FOUND",Y[Y.ALREADY_EXISTS=6]="ALREADY_EXISTS",Y[Y.PERMISSION_DENIED=7]="PERMISSION_DENIED",Y[Y.UNAUTHENTICATED=16]="UNAUTHENTICATED",Y[Y.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Y[Y.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Y[Y.ABORTED=10]="ABORTED",Y[Y.OUT_OF_RANGE=11]="OUT_OF_RANGE",Y[Y.UNIMPLEMENTED=12]="UNIMPLEMENTED",Y[Y.INTERNAL=13]="INTERNAL",Y[Y.UNAVAILABLE=14]="UNAVAILABLE",Y[Y.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rv=new xt([4294967295,4294967295],0);function Hl(r){const e=Hd().encode(r),t=new Ud;return t.update(e),new Uint8Array(t.digest())}function Wl(r){const e=new DataView(r.buffer),t=e.getUint32(0,!0),n=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new xt([t,n],0),new xt([i,s],0)]}class gc{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new Fr(`Invalid padding: ${t}`);if(n<0)throw new Fr(`Invalid hash count: ${n}`);if(e.length>0&&this.hashCount===0)throw new Fr(`Invalid hash count: ${n}`);if(e.length===0&&t!==0)throw new Fr(`Invalid padding when bitmap length is 0: ${t}`);this.pe=8*e.length-t,this.ye=xt.fromNumber(this.pe)}we(e,t,n){let i=e.add(t.multiply(xt.fromNumber(n)));return i.compare(rv)===1&&(i=new xt([i.getBits(0),i.getBits(1)],0)),i.modulo(this.ye).toNumber()}be(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.pe===0)return!1;const t=Hl(e),[n,i]=Wl(t);for(let s=0;s<this.hashCount;s++){const o=this.we(n,i,s);if(!this.be(o))return!1}return!0}static create(e,t,n){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),o=new gc(s,i,t);return n.forEach(c=>o.insert(c)),o}insert(e){if(this.pe===0)return;const t=Hl(e),[n,i]=Wl(t);for(let s=0;s<this.hashCount;s++){const o=this.we(n,i,s);this.Se(o)}}Se(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class Fr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class so{constructor(e,t,n,i,s){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const i=new Map;return i.set(e,Ti.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new so(q.min(),i,new ce(j),Me(),K())}}class Ti{constructor(e,t,n,i,s){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new Ti(n,t,K(),K(),K())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gs{constructor(e,t,n,i){this.De=e,this.removedTargetIds=t,this.key=n,this.ve=i}}class zf{constructor(e,t){this.targetId=e,this.Ce=t}}class $f{constructor(e,t,n=he.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=i}}class Ql{constructor(){this.Fe=0,this.Me=Yl(),this.xe=he.EMPTY_BYTE_STRING,this.Oe=!1,this.Ne=!0}get current(){return this.Oe}get resumeToken(){return this.xe}get Be(){return this.Fe!==0}get Le(){return this.Ne}ke(e){e.approximateByteSize()>0&&(this.Ne=!0,this.xe=e)}qe(){let e=K(),t=K(),n=K();return this.Me.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:n=n.add(i);break;default:M(38017,{changeType:s})}}),new Ti(this.xe,this.Oe,e,t,n)}Qe(){this.Ne=!1,this.Me=Yl()}$e(e,t){this.Ne=!0,this.Me=this.Me.insert(e,t)}Ue(e){this.Ne=!0,this.Me=this.Me.remove(e)}Ke(){this.Fe+=1}We(){this.Fe-=1,U(this.Fe>=0,3241,{Fe:this.Fe})}Ge(){this.Ne=!0,this.Oe=!0}}class iv{constructor(e){this.ze=e,this.je=new Map,this.He=Me(),this.Je=Zi(),this.Ye=Zi(),this.Ze=new ce(j)}Xe(e){for(const t of e.De)e.ve&&e.ve.isFoundDocument()?this.et(t,e.ve):this.tt(t,e.key,e.ve);for(const t of e.removedTargetIds)this.tt(t,e.key,e.ve)}nt(e){this.forEachTarget(e,t=>{const n=this.rt(t);switch(e.state){case 0:this.it(t)&&n.ke(e.resumeToken);break;case 1:n.We(),n.Be||n.Qe(),n.ke(e.resumeToken);break;case 2:n.We(),n.Be||this.removeTarget(t);break;case 3:this.it(t)&&(n.Ge(),n.ke(e.resumeToken));break;case 4:this.it(t)&&(this.st(t),n.ke(e.resumeToken));break;default:M(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.je.forEach((n,i)=>{this.it(i)&&t(i)})}ot(e){const t=e.targetId,n=e.Ce.count,i=this._t(t);if(i){const s=i.target;if(ks(s))if(n===0){const o=new O(s.path);this.tt(t,o,le.newNoDocument(o,q.min()))}else U(n===1,20013,{expectedCount:n});else{const o=this.ut(t);if(o!==n){const c=this.ct(e),u=c?this.lt(c,e,o):1;if(u!==0){this.st(t);const h=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(t,h)}}}}}ct(e){const t=e.Ce.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:i=0},hashCount:s=0}=t;let o,c;try{o=dt(n).toUint8Array()}catch(u){if(u instanceof hf)return Kn("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{c=new gc(o,i,s)}catch(u){return Kn(u instanceof Fr?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return c.pe===0?null:c}lt(e,t,n){return t.Ce.count===n-this.Tt(e,t.targetId)?0:2}Tt(e,t){const n=this.ze.getRemoteKeysForTarget(t);let i=0;return n.forEach(s=>{const o=this.ze.Pt(),c=`projects/${o.projectId}/databases/${o.database}/documents/${s.path.canonicalString()}`;e.mightContain(c)||(this.tt(t,s,null),i++)}),i}It(e){const t=new Map;this.je.forEach((s,o)=>{const c=this._t(o);if(c){if(s.current&&ks(c.target)){const u=new O(c.target.path);this.Et(u).has(o)||this.dt(o,u)||this.tt(o,u,le.newNoDocument(u,e))}s.Le&&(t.set(o,s.qe()),s.Qe())}});let n=K();this.Ye.forEach((s,o)=>{let c=!0;o.forEachWhile(u=>{const h=this._t(u);return!h||h.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(n=n.add(s))}),this.He.forEach((s,o)=>o.setReadTime(e));const i=new so(e,t,this.Ze,this.He,n);return this.He=Me(),this.Je=Zi(),this.Ye=Zi(),this.Ze=new ce(j),i}et(e,t){if(!this.it(e))return;const n=this.dt(e,t.key)?2:0;this.rt(e).$e(t.key,n),this.He=this.He.insert(t.key,t),this.Je=this.Je.insert(t.key,this.Et(t.key).add(e)),this.Ye=this.Ye.insert(t.key,this.At(t.key).add(e))}tt(e,t,n){if(!this.it(e))return;const i=this.rt(e);this.dt(e,t)?i.$e(t,1):i.Ue(t),this.Ye=this.Ye.insert(t,this.At(t).delete(e)),this.Ye=this.Ye.insert(t,this.At(t).add(e)),n&&(this.He=this.He.insert(t,n))}removeTarget(e){this.je.delete(e)}ut(e){const t=this.rt(e).qe();return this.ze.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}Ke(e){this.rt(e).Ke()}rt(e){let t=this.je.get(e);return t||(t=new Ql,this.je.set(e,t)),t}At(e){let t=this.Ye.get(e);return t||(t=new te(j),this.Ye=this.Ye.insert(e,t)),t}Et(e){let t=this.Je.get(e);return t||(t=new te(j),this.Je=this.Je.insert(e,t)),t}it(e){const t=this._t(e)!==null;return t||V("WatchChangeAggregator","Detected inactive target",e),t}_t(e){const t=this.je.get(e);return t&&t.Be?null:this.ze.Rt(e)}st(e){this.je.set(e,new Ql),this.ze.getRemoteKeysForTarget(e).forEach(t=>{this.tt(e,t,null)})}dt(e,t){return this.ze.getRemoteKeysForTarget(e).has(t)}}function Zi(){return new ce(O.comparator)}function Yl(){return new ce(O.comparator)}const sv={asc:"ASCENDING",desc:"DESCENDING"},ov={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},av={and:"AND",or:"OR"};class cv{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function ba(r,e){return r.useProto3Json||Ws(e)?e:{value:e}}function ir(r,e){return r.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Kf(r,e){return r.useProto3Json?e.toBase64():e.toUint8Array()}function uv(r,e){return ir(r,e.toTimestamp())}function ke(r){return U(!!r,49232),q.fromTimestamp(function(t){const n=ht(t);return new ae(n.seconds,n.nanos)}(r))}function _c(r,e){return Pa(r,e).canonicalString()}function Pa(r,e){const t=function(i){return new X(["projects",i.projectId,"databases",i.database])}(r).child("documents");return e===void 0?t:t.child(e)}function Gf(r){const e=X.fromString(r);return U(tp(e),10190,{key:e.toString()}),e}function xs(r,e){return _c(r.databaseId,e.path)}function an(r,e){const t=Gf(e);if(t.get(1)!==r.databaseId.projectId)throw new x(S.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+r.databaseId.projectId);if(t.get(3)!==r.databaseId.database)throw new x(S.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+r.databaseId.database);return new O(Qf(t))}function Hf(r,e){return _c(r.databaseId,e)}function Wf(r){const e=Gf(r);return e.length===4?X.emptyPath():Qf(e)}function Sa(r){return new X(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function Qf(r){return U(r.length>4&&r.get(4)==="documents",29091,{key:r.toString()}),r.popFirst(5)}function Jl(r,e,t){return{name:xs(r,e),fields:t.value.mapValue.fields}}function lv(r,e,t){const n=an(r,e.name),i=ke(e.updateTime),s=e.createTime?ke(e.createTime):q.min(),o=new Ae({mapValue:{fields:e.fields}}),c=le.newFoundDocument(n,i,s,o);return t&&c.setHasCommittedMutations(),t?c.setHasCommittedMutations():c}function hv(r,e){let t;if("targetChange"in e){e.targetChange;const n=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:M(39313,{state:h})}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(h,f){return h.useProto3Json?(U(f===void 0||typeof f=="string",58123),he.fromBase64String(f||"")):(U(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),he.fromUint8Array(f||new Uint8Array))}(r,e.targetChange.resumeToken),o=e.targetChange.cause,c=o&&function(h){const f=h.code===void 0?S.UNKNOWN:jf(h.code);return new x(f,h.message||"")}(o);t=new $f(n,i,s,c||null)}else if("documentChange"in e){e.documentChange;const n=e.documentChange;n.document,n.document.name,n.document.updateTime;const i=an(r,n.document.name),s=ke(n.document.updateTime),o=n.document.createTime?ke(n.document.createTime):q.min(),c=new Ae({mapValue:{fields:n.document.fields}}),u=le.newFoundDocument(i,s,o,c),h=n.targetIds||[],f=n.removedTargetIds||[];t=new gs(h,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const n=e.documentDelete;n.document;const i=an(r,n.document),s=n.readTime?ke(n.readTime):q.min(),o=le.newNoDocument(i,s),c=n.removedTargetIds||[];t=new gs([],c,o.key,o)}else if("documentRemove"in e){e.documentRemove;const n=e.documentRemove;n.document;const i=an(r,n.document),s=n.removedTargetIds||[];t=new gs([],s,i,null)}else{if(!("filter"in e))return M(11601,{Vt:e});{e.filter;const n=e.filter;n.targetId;const{count:i=0,unchangedNames:s}=n,o=new tv(i,s),c=n.targetId;t=new zf(c,o)}}return t}function Os(r,e){let t;if(e instanceof lr)t={update:Jl(r,e.key,e.value)};else if(e instanceof io)t={delete:xs(r,e.key)};else if(e instanceof gt)t={update:Jl(r,e.key,e.data),updateMask:_v(e.fieldMask)};else{if(!(e instanceof qf))return M(16599,{ft:e.type});t={verify:xs(r,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(n=>function(s,o){const c=o.transform;if(c instanceof tr)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof nr)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof rr)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof li)return{fieldPath:o.field.canonicalString(),increment:c.Re};throw M(20930,{transform:o.transform})}(0,n))),e.precondition.isNone||(t.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:uv(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:M(27497)}(r,e.precondition)),t}function Ca(r,e){const t=e.currentDocument?function(s){return s.updateTime!==void 0?Re.updateTime(ke(s.updateTime)):s.exists!==void 0?Re.exists(s.exists):Re.none()}(e.currentDocument):Re.none(),n=e.updateTransforms?e.updateTransforms.map(i=>function(o,c){let u=null;if("setToServerValue"in c)U(c.setToServerValue==="REQUEST_TIME",16630,{proto:c}),u=new tr;else if("appendMissingElements"in c){const f=c.appendMissingElements.values||[];u=new nr(f)}else if("removeAllFromArray"in c){const f=c.removeAllFromArray.values||[];u=new rr(f)}else"increment"in c?u=new li(o,c.increment):M(16584,{proto:c});const h=oe.fromServerFormat(c.fieldPath);return new Ff(h,u)}(r,i)):[];if(e.update){e.update.name;const i=an(r,e.update.name),s=new Ae({mapValue:{fields:e.update.fields}});if(e.updateMask){const o=function(u){const h=u.fieldPaths||[];return new Ne(h.map(f=>oe.fromServerFormat(f)))}(e.updateMask);return new gt(i,s,o,t,n)}return new lr(i,s,t,n)}if(e.delete){const i=an(r,e.delete);return new io(i,t)}if(e.verify){const i=an(r,e.verify);return new qf(i,t)}return M(1463,{proto:e})}function dv(r,e){return r&&r.length>0?(U(e!==void 0,14353),r.map(t=>function(i,s){let o=i.updateTime?ke(i.updateTime):ke(s);return o.isEqual(q.min())&&(o=ke(s)),new XE(o,i.transformResults||[])}(t,e))):[]}function Yf(r,e){return{documents:[Hf(r,e.path)]}}function Jf(r,e){const t={structuredQuery:{}},n=e.path;let i;e.collectionGroup!==null?(i=n,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=n.popLast(),t.structuredQuery.from=[{collectionId:n.lastSegment()}]),t.parent=Hf(r,i);const s=function(h){if(h.length!==0)return ep(ee.create(h,"and"))}(e.filters);s&&(t.structuredQuery.where=s);const o=function(h){if(h.length!==0)return h.map(f=>function(_){return{field:xn(_.field),direction:pv(_.dir)}}(f))}(e.orderBy);o&&(t.structuredQuery.orderBy=o);const c=ba(r,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{gt:t,parent:i}}function Xf(r){let e=Wf(r.parent);const t=r.structuredQuery,n=t.from?t.from.length:0;let i=null;if(n>0){U(n===1,65062);const f=t.from[0];f.allDescendants?i=f.collectionId:e=e.child(f.collectionId)}let s=[];t.where&&(s=function(m){const _=Zf(m);return _ instanceof ee&&hc(_)?_.getFilters():[_]}(t.where));let o=[];t.orderBy&&(o=function(m){return m.map(_=>function(C){return new ui(On(C.field),function(D){switch(D){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(C.direction))}(_))}(t.orderBy));let c=null;t.limit&&(c=function(m){let _;return _=typeof m=="object"?m.value:m,Ws(_)?null:_}(t.limit));let u=null;t.startAt&&(u=function(m){const _=!!m.before,b=m.values||[];return new Zn(b,_)}(t.startAt));let h=null;return t.endAt&&(h=function(m){const _=!m.before,b=m.values||[];return new Zn(b,_)}(t.endAt)),UE(e,i,o,s,c,"F",u,h)}function fv(r,e){const t=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return M(28987,{purpose:i})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Zf(r){return r.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const n=On(t.unaryFilter.field);return Q.create(n,"==",{doubleValue:NaN});case"IS_NULL":const i=On(t.unaryFilter.field);return Q.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=On(t.unaryFilter.field);return Q.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=On(t.unaryFilter.field);return Q.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return M(61313);default:return M(60726)}}(r):r.fieldFilter!==void 0?function(t){return Q.create(On(t.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return M(58110);default:return M(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(r):r.compositeFilter!==void 0?function(t){return ee.create(t.compositeFilter.filters.map(n=>Zf(n)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return M(1026)}}(t.compositeFilter.op))}(r):M(30097,{filter:r})}function pv(r){return sv[r]}function mv(r){return ov[r]}function gv(r){return av[r]}function xn(r){return{fieldPath:r.canonicalString()}}function On(r){return oe.fromServerFormat(r.fieldPath)}function ep(r){return r instanceof Q?function(t){if(t.op==="=="){if(Ol(t.value))return{unaryFilter:{field:xn(t.field),op:"IS_NAN"}};if(xl(t.value))return{unaryFilter:{field:xn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Ol(t.value))return{unaryFilter:{field:xn(t.field),op:"IS_NOT_NAN"}};if(xl(t.value))return{unaryFilter:{field:xn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:xn(t.field),op:mv(t.op),value:t.value}}}(r):r instanceof ee?function(t){const n=t.getFilters().map(i=>ep(i));return n.length===1?n[0]:{compositeFilter:{op:gv(t.op),filters:n}}}(r):M(54877,{filter:r})}function _v(r){const e=[];return r.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function tp(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ot{constructor(e,t,n,i,s=q.min(),o=q.min(),c=he.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=c,this.expectedCount=u}withSequenceNumber(e){return new ot(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new ot(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new ot(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new ot(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class np{constructor(e){this.wt=e}}function yv(r,e){let t;if(e.document)t=lv(r.wt,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const n=O.fromSegments(e.noDocument.path),i=gn(e.noDocument.readTime);t=le.newNoDocument(n,i),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return M(56709);{const n=O.fromSegments(e.unknownDocument.path),i=gn(e.unknownDocument.version);t=le.newUnknownDocument(n,i)}}return e.readTime&&t.setReadTime(function(i){const s=new ae(i[0],i[1]);return q.fromTimestamp(s)}(e.readTime)),t}function Xl(r,e){const t=e.key,n={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:Ms(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())n.document=function(s,o){return{name:xs(s,o.key),fields:o.data.value.mapValue.fields,updateTime:ir(s,o.version.toTimestamp()),createTime:ir(s,o.createTime.toTimestamp())}}(r.wt,e);else if(e.isNoDocument())n.noDocument={path:t.path.toArray(),readTime:mn(e.version)};else{if(!e.isUnknownDocument())return M(57904,{document:e});n.unknownDocument={path:t.path.toArray(),version:mn(e.version)}}return n}function Ms(r){const e=r.toTimestamp();return[e.seconds,e.nanoseconds]}function mn(r){const e=r.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function gn(r){const e=new ae(r.seconds,r.nanoseconds);return q.fromTimestamp(e)}function en(r,e){const t=(e.baseMutations||[]).map(s=>Ca(r.wt,s));for(let s=0;s<e.mutations.length-1;++s){const o=e.mutations[s];if(s+1<e.mutations.length&&e.mutations[s+1].transform!==void 0){const c=e.mutations[s+1];o.updateTransforms=c.transform.fieldTransforms,e.mutations.splice(s+1,1),++s}}const n=e.mutations.map(s=>Ca(r.wt,s)),i=ae.fromMillis(e.localWriteTimeMs);return new fc(e.batchId,i,t,n)}function Ur(r){const e=gn(r.readTime),t=r.lastLimboFreeSnapshotVersion!==void 0?gn(r.lastLimboFreeSnapshotVersion):q.min();let n;return n=function(s){return s.documents!==void 0}(r.query)?function(s){const o=s.documents.length;return U(o===1,1966,{count:o}),qe(eo(Wf(s.documents[0])))}(r.query):function(s){return qe(Xf(s))}(r.query),new ot(n,r.targetId,"TargetPurposeListen",r.lastListenSequenceNumber,e,t,he.fromBase64String(r.resumeToken))}function rp(r,e){const t=mn(e.snapshotVersion),n=mn(e.lastLimboFreeSnapshotVersion);let i;i=ks(e.target)?Yf(r.wt,e.target):Jf(r.wt,e.target).gt;const s=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:pn(e.target),readTime:t,resumeToken:s,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:n,query:i}}function ip(r){const e=Xf({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?Ra(e,e.limit,"L"):e}function Xo(r,e){return new mc(e.largestBatchId,Ca(r.wt,e.overlayMutation))}function Zl(r,e){const t=e.path.lastSegment();return[r,be(e.path.popLast()),t]}function eh(r,e,t,n){return{indexId:r,uid:e,sequenceNumber:t,readTime:mn(n.readTime),documentKey:be(n.documentKey.path),largestBatchId:n.largestBatchId}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Iv{getBundleMetadata(e,t){return th(e).get(t).next(n=>{if(n)return function(s){return{id:s.bundleId,createTime:gn(s.createTime),version:s.version}}(n)})}saveBundleMetadata(e,t){return th(e).put(function(i){return{bundleId:i.id,createTime:mn(ke(i.createTime)),version:i.version}}(t))}getNamedQuery(e,t){return nh(e).get(t).next(n=>{if(n)return function(s){return{name:s.name,query:ip(s.bundledQuery),readTime:gn(s.readTime)}}(n)})}saveNamedQuery(e,t){return nh(e).put(function(i){return{name:i.name,readTime:mn(ke(i.readTime)),bundledQuery:i.bundledQuery}}(t))}}function th(r){return pe(r,Qs)}function nh(r){return pe(r,Ys)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oo{constructor(e,t){this.serializer=e,this.userId=t}static bt(e,t){const n=t.uid||"";return new oo(e,n)}getOverlay(e,t){return Cr(e).get(Zl(this.userId,t)).next(n=>n?Xo(this.serializer,n):null)}getOverlays(e,t){const n=Ye();return w.forEach(t,i=>this.getOverlay(e,i).next(s=>{s!==null&&n.set(i,s)})).next(()=>n)}saveOverlays(e,t,n){const i=[];return n.forEach((s,o)=>{const c=new mc(t,o);i.push(this.St(e,c))}),w.waitFor(i)}removeOverlaysForBatchId(e,t,n){const i=new Set;t.forEach(o=>i.add(be(o.getCollectionPath())));const s=[];return i.forEach(o=>{const c=IDBKeyRange.bound([this.userId,o,n],[this.userId,o,n+1],!1,!0);s.push(Cr(e).X(_a,c))}),w.waitFor(s)}getOverlaysForCollection(e,t,n){const i=Ye(),s=be(t),o=IDBKeyRange.bound([this.userId,s,n],[this.userId,s,Number.POSITIVE_INFINITY],!0);return Cr(e).J(_a,o).next(c=>{for(const u of c){const h=Xo(this.serializer,u);i.set(h.getKey(),h)}return i})}getOverlaysForCollectionGroup(e,t,n,i){const s=Ye();let o;const c=IDBKeyRange.bound([this.userId,t,n],[this.userId,t,Number.POSITIVE_INFINITY],!0);return Cr(e).te({index:sf,range:c},(u,h,f)=>{const m=Xo(this.serializer,h);s.size()<i||m.largestBatchId===o?(s.set(m.getKey(),m),o=m.largestBatchId):f.done()}).next(()=>s)}St(e,t){return Cr(e).put(function(i,s,o){const[c,u,h]=Zl(s,o.mutation.key);return{userId:s,collectionPath:u,documentId:h,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:Os(i.wt,o.mutation)}}(this.serializer,this.userId,t))}}function Cr(r){return pe(r,Js)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ev{Dt(e){return pe(e,oc)}getSessionToken(e){return this.Dt(e).get("sessionToken").next(t=>{const n=t==null?void 0:t.value;return n?he.fromUint8Array(n):he.EMPTY_BYTE_STRING})}setSessionToken(e,t){return this.Dt(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tn{constructor(){}vt(e,t){this.Ct(e,t),t.Ft()}Ct(e,t){if("nullValue"in e)this.Mt(t,5);else if("booleanValue"in e)this.Mt(t,10),t.xt(e.booleanValue?1:0);else if("integerValue"in e)this.Mt(t,15),t.xt(se(e.integerValue));else if("doubleValue"in e){const n=se(e.doubleValue);isNaN(n)?this.Mt(t,13):(this.Mt(t,15),ti(n)?t.xt(0):t.xt(n))}else if("timestampValue"in e){let n=e.timestampValue;this.Mt(t,20),typeof n=="string"&&(n=ht(n)),t.Ot(`${n.seconds||""}`),t.xt(n.nanos||0)}else if("stringValue"in e)this.Nt(e.stringValue,t),this.Bt(t);else if("bytesValue"in e)this.Mt(t,30),t.Lt(dt(e.bytesValue)),this.Bt(t);else if("referenceValue"in e)this.kt(e.referenceValue,t);else if("geoPointValue"in e){const n=e.geoPointValue;this.Mt(t,45),t.xt(n.latitude||0),t.xt(n.longitude||0)}else"mapValue"in e?_f(e)?this.Mt(t,Number.MAX_SAFE_INTEGER):Zs(e)?this.qt(e.mapValue,t):(this.Qt(e.mapValue,t),this.Bt(t)):"arrayValue"in e?(this.$t(e.arrayValue,t),this.Bt(t)):M(19022,{Ut:e})}Nt(e,t){this.Mt(t,25),this.Kt(e,t)}Kt(e,t){t.Ot(e)}Qt(e,t){const n=e.fields||{};this.Mt(t,55);for(const i of Object.keys(n))this.Nt(i,t),this.Ct(n[i],t)}qt(e,t){var n,i;const s=e.fields||{};this.Mt(t,53);const o=Jn,c=((i=(n=s[o].arrayValue)===null||n===void 0?void 0:n.values)===null||i===void 0?void 0:i.length)||0;this.Mt(t,15),t.xt(se(c)),this.Nt(o,t),this.Ct(s[o],t)}$t(e,t){const n=e.values||[];this.Mt(t,50);for(const i of n)this.Ct(i,t)}kt(e,t){this.Mt(t,37),O.fromName(e).path.forEach(n=>{this.Mt(t,60),this.Kt(n,t)})}Mt(e,t){e.xt(t)}Bt(e){e.xt(2)}}tn.Wt=new tn;/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law | agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES | CONDITIONS OF ANY KIND, either express | implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sn=255;function vv(r){if(r===0)return 8;let e=0;return r>>4||(e+=4,r<<=4),r>>6||(e+=2,r<<=2),r>>7||(e+=1),e}function rh(r){const e=64-function(n){let i=0;for(let s=0;s<8;++s){const o=vv(255&n[s]);if(i+=o,o!==8)break}return i}(r);return Math.ceil(e/8)}class Tv{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Gt(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.zt(n.value),n=t.next();this.jt()}Ht(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Jt(n.value),n=t.next();this.Yt()}Zt(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.zt(n);else if(n<2048)this.zt(960|n>>>6),this.zt(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.zt(480|n>>>12),this.zt(128|63&n>>>6),this.zt(128|63&n);else{const i=t.codePointAt(0);this.zt(240|i>>>18),this.zt(128|63&i>>>12),this.zt(128|63&i>>>6),this.zt(128|63&i)}}this.jt()}Xt(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.Jt(n);else if(n<2048)this.Jt(960|n>>>6),this.Jt(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.Jt(480|n>>>12),this.Jt(128|63&n>>>6),this.Jt(128|63&n);else{const i=t.codePointAt(0);this.Jt(240|i>>>18),this.Jt(128|63&i>>>12),this.Jt(128|63&i>>>6),this.Jt(128|63&i)}}this.Yt()}en(e){const t=this.tn(e),n=rh(t);this.nn(1+n),this.buffer[this.position++]=255&n;for(let i=t.length-n;i<t.length;++i)this.buffer[this.position++]=255&t[i]}rn(e){const t=this.tn(e),n=rh(t);this.nn(1+n),this.buffer[this.position++]=~(255&n);for(let i=t.length-n;i<t.length;++i)this.buffer[this.position++]=~(255&t[i])}sn(){this._n(Sn),this._n(255)}an(){this.un(Sn),this.un(255)}reset(){this.position=0}seed(e){this.nn(e.length),this.buffer.set(e,this.position),this.position+=e.length}cn(){return this.buffer.slice(0,this.position)}tn(e){const t=function(s){const o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,s,!1),new Uint8Array(o.buffer)}(e),n=!!(128&t[0]);t[0]^=n?255:128;for(let i=1;i<t.length;++i)t[i]^=n?255:0;return t}zt(e){const t=255&e;t===0?(this._n(0),this._n(255)):t===Sn?(this._n(Sn),this._n(0)):this._n(t)}Jt(e){const t=255&e;t===0?(this.un(0),this.un(255)):t===Sn?(this.un(Sn),this.un(0)):this.un(e)}jt(){this._n(0),this._n(1)}Yt(){this.un(0),this.un(1)}_n(e){this.nn(1),this.buffer[this.position++]=e}un(e){this.nn(1),this.buffer[this.position++]=~e}nn(e){const t=e+this.position;if(t<=this.buffer.length)return;let n=2*this.buffer.length;n<t&&(n=t);const i=new Uint8Array(n);i.set(this.buffer),this.buffer=i}}class wv{constructor(e){this.ln=e}Lt(e){this.ln.Gt(e)}Ot(e){this.ln.Zt(e)}xt(e){this.ln.en(e)}Ft(){this.ln.sn()}}class Av{constructor(e){this.ln=e}Lt(e){this.ln.Ht(e)}Ot(e){this.ln.Xt(e)}xt(e){this.ln.rn(e)}Ft(){this.ln.an()}}class Vr{constructor(){this.ln=new Tv,this.hn=new wv(this.ln),this.Pn=new Av(this.ln)}seed(e){this.ln.seed(e)}Tn(e){return e===0?this.hn:this.Pn}cn(){return this.ln.cn()}reset(){this.ln.reset()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nn{constructor(e,t,n,i){this.In=e,this.En=t,this.dn=n,this.An=i}Rn(){const e=this.An.length,t=e===0||this.An[e-1]===255?e+1:e,n=new Uint8Array(t);return n.set(this.An,0),t!==e?n.set([0],this.An.length):++n[n.length-1],new nn(this.In,this.En,this.dn,n)}Vn(e,t,n){return{indexId:this.In,uid:e,arrayValue:_s(this.dn),directionalValue:_s(this.An),orderedDocumentKey:_s(t),documentKey:n.path.toArray()}}mn(e,t,n){const i=this.Vn(e,t,n);return[i.indexId,i.uid,i.arrayValue,i.directionalValue,i.orderedDocumentKey,i.documentKey]}}function Tt(r,e){let t=r.In-e.In;return t!==0?t:(t=ih(r.dn,e.dn),t!==0?t:(t=ih(r.An,e.An),t!==0?t:O.comparator(r.En,e.En)))}function ih(r,e){for(let t=0;t<r.length&&t<e.length;++t){const n=r[t]-e[t];if(n!==0)return n}return r.length-e.length}function _s(r){return Jh()?function(t){let n="";for(let i=0;i<t.length;i++)n+=String.fromCharCode(t[i]);return n}(r):r}function sh(r){return typeof r!="string"?r:function(t){const n=new Uint8Array(t.length);for(let i=0;i<t.length;i++)n[i]=t.charCodeAt(i);return n}(r)}class oh{constructor(e){this.fn=new te((t,n)=>oe.comparator(t.field,n.field)),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.gn=e.orderBy,this.pn=[];for(const t of e.filters){const n=t;n.isInequality()?this.fn=this.fn.add(n):this.pn.push(n)}}get yn(){return this.fn.size>1}wn(e){if(U(e.collectionGroup===this.collectionId,49279),this.yn)return!1;const t=pa(e);if(t!==void 0&&!this.bn(t))return!1;const n=Jt(e);let i=new Set,s=0,o=0;for(;s<n.length&&this.bn(n[s]);++s)i=i.add(n[s].fieldPath.canonicalString());if(s===n.length)return!0;if(this.fn.size>0){const c=this.fn.getIterator().getNext();if(!i.has(c.field.canonicalString())){const u=n[s];if(!this.Sn(c,u)||!this.Dn(this.gn[o++],u))return!1}++s}for(;s<n.length;++s){const c=n[s];if(o>=this.gn.length||!this.Dn(this.gn[o++],c))return!1}return!0}vn(){if(this.yn)return null;let e=new te(oe.comparator);const t=[];for(const n of this.pn)if(!n.field.isKeyField())if(n.op==="array-contains"||n.op==="array-contains-any")t.push(new us(n.field,2));else{if(e.has(n.field))continue;e=e.add(n.field),t.push(new us(n.field,0))}for(const n of this.gn)n.field.isKeyField()||e.has(n.field)||(e=e.add(n.field),t.push(new us(n.field,n.dir==="asc"?0:1)));return new Ps(Ps.UNKNOWN_ID,this.collectionId,t,ei.empty())}bn(e){for(const t of this.pn)if(this.Sn(t,e))return!0;return!1}Sn(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const n=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===n}Dn(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sp(r){var e,t;if(U(r instanceof Q||r instanceof ee,20012),r instanceof Q){if(r instanceof bf){const i=((t=(e=r.value.arrayValue)===null||e===void 0?void 0:e.values)===null||t===void 0?void 0:t.map(s=>Q.create(r.field,"==",s)))||[];return ee.create(i,"or")}return r}const n=r.filters.map(i=>sp(i));return ee.create(n,r.op)}function Rv(r){if(r.getFilters().length===0)return[];const e=ka(sp(r));return U(op(e),7391),Va(e)||Da(e)?[e]:e.getFilters()}function Va(r){return r instanceof Q}function Da(r){return r instanceof ee&&hc(r)}function op(r){return Va(r)||Da(r)||function(t){if(t instanceof ee&&va(t)){for(const n of t.getFilters())if(!Va(n)&&!Da(n))return!1;return!0}return!1}(r)}function ka(r){if(U(r instanceof Q||r instanceof ee,34018),r instanceof Q)return r;if(r.filters.length===1)return ka(r.filters[0]);const e=r.filters.map(n=>ka(n));let t=ee.create(e,r.op);return t=Ls(t),op(t)?t:(U(t instanceof ee,64498),U(er(t),40251),U(t.filters.length>1,57927),t.filters.reduce((n,i)=>yc(n,i)))}function yc(r,e){let t;return U(r instanceof Q||r instanceof ee,38388),U(e instanceof Q||e instanceof ee,25473),t=r instanceof Q?e instanceof Q?function(i,s){return ee.create([i,s],"and")}(r,e):ah(r,e):e instanceof Q?ah(e,r):function(i,s){if(U(i.filters.length>0&&s.filters.length>0,48005),er(i)&&er(s))return wf(i,s.getFilters());const o=va(i)?i:s,c=va(i)?s:i,u=o.filters.map(h=>yc(h,c));return ee.create(u,"or")}(r,e),Ls(t)}function ah(r,e){if(er(e))return wf(e,r.getFilters());{const t=e.filters.map(n=>yc(r,n));return ee.create(t,"or")}}function Ls(r){if(U(r instanceof Q||r instanceof ee,11850),r instanceof Q)return r;const e=r.getFilters();if(e.length===1)return Ls(e[0]);if(vf(r))return r;const t=e.map(i=>Ls(i)),n=[];return t.forEach(i=>{i instanceof Q?n.push(i):i instanceof ee&&(i.op===r.op?n.push(...i.filters):n.push(i))}),n.length===1?n[0]:ee.create(n,r.op)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bv{constructor(){this.Cn=new Ic}addToCollectionParentIndex(e,t){return this.Cn.add(t),w.resolve()}getCollectionParents(e,t){return w.resolve(this.Cn.getEntries(t))}addFieldIndex(e,t){return w.resolve()}deleteFieldIndex(e,t){return w.resolve()}deleteAllFieldIndexes(e){return w.resolve()}createTargetIndexes(e,t){return w.resolve()}getDocumentsMatchingTarget(e,t){return w.resolve(null)}getIndexType(e,t){return w.resolve(0)}getFieldIndexes(e,t){return w.resolve([])}getNextCollectionGroupToUpdate(e){return w.resolve(null)}getMinOffset(e,t){return w.resolve(Le.min())}getMinOffsetFromCollectionGroup(e,t){return w.resolve(Le.min())}updateCollectionGroup(e,t,n){return w.resolve()}updateIndexEntries(e,t){return w.resolve()}}class Ic{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),i=this.index[t]||new te(X.comparator),s=!i.has(n);return this.index[t]=i.add(n),s}has(e){const t=e.lastSegment(),n=e.popLast(),i=this.index[t];return i&&i.has(n)}getEntries(e){return(this.index[e]||new te(X.comparator)).toArray()}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ch="IndexedDbIndexManager",es=new Uint8Array(0);class Pv{constructor(e,t){this.databaseId=t,this.Fn=new Ic,this.Mn=new mt(n=>pn(n),(n,i)=>Ei(n,i)),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.Fn.has(t)){const n=t.lastSegment(),i=t.popLast();e.addOnCommittedListener(()=>{this.Fn.add(t)});const s={collectionId:n,parent:be(i)};return uh(e).put(s)}return w.resolve()}getCollectionParents(e,t){const n=[],i=IDBKeyRange.bound([t,""],[Wd(t),""],!1,!0);return uh(e).J(i).next(s=>{for(const o of s){if(o.collectionId!==t)break;n.push(Qe(o.parent))}return n})}addFieldIndex(e,t){const n=Dr(e),i=function(c){return{indexId:c.indexId,collectionGroup:c.collectionGroup,fields:c.fields.map(u=>[u.fieldPath.canonicalString(),u.kind])}}(t);delete i.indexId;const s=n.add(i);if(t.indexState){const o=Vn(e);return s.next(c=>{o.put(eh(c,this.uid,t.indexState.sequenceNumber,t.indexState.offset))})}return s.next()}deleteFieldIndex(e,t){const n=Dr(e),i=Vn(e),s=Cn(e);return n.delete(t.indexId).next(()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))).next(()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))}deleteAllFieldIndexes(e){const t=Dr(e),n=Cn(e),i=Vn(e);return t.X().next(()=>n.X()).next(()=>i.X())}createTargetIndexes(e,t){return w.forEach(this.xn(t),n=>this.getIndexType(e,n).next(i=>{if(i===0||i===1){const s=new oh(n).vn();if(s!=null)return this.addFieldIndex(e,s)}}))}getDocumentsMatchingTarget(e,t){const n=Cn(e);let i=!0;const s=new Map;return w.forEach(this.xn(t),o=>this.On(e,o).next(c=>{i&&(i=!!c),s.set(o,c)})).next(()=>{if(i){let o=K();const c=[];return w.forEach(s,(u,h)=>{V(ch,`Using index ${function(L){return`id=${L.indexId}|cg=${L.collectionGroup}|f=${L.fields.map(H=>`${H.fieldPath}:${H.kind}`).join(",")}`}(u)} to execute ${pn(t)}`);const f=function(L,H){const Z=pa(H);if(Z===void 0)return null;for(const G of Ns(L,Z.fieldPath))switch(G.op){case"array-contains-any":return G.value.arrayValue.values||[];case"array-contains":return[G.value]}return null}(h,u),m=function(L,H){const Z=new Map;for(const G of Jt(H))for(const E of Ns(L,G.fieldPath))switch(E.op){case"==":case"in":Z.set(G.fieldPath.canonicalString(),E.value);break;case"not-in":case"!=":return Z.set(G.fieldPath.canonicalString(),E.value),Array.from(Z.values())}return null}(h,u),_=function(L,H){const Z=[];let G=!0;for(const E of Jt(H)){const g=E.kind===0?Bl(L,E.fieldPath,L.startAt):ql(L,E.fieldPath,L.startAt);Z.push(g.value),G&&(G=g.inclusive)}return new Zn(Z,G)}(h,u),b=function(L,H){const Z=[];let G=!0;for(const E of Jt(H)){const g=E.kind===0?ql(L,E.fieldPath,L.endAt):Bl(L,E.fieldPath,L.endAt);Z.push(g.value),G&&(G=g.inclusive)}return new Zn(Z,G)}(h,u),C=this.Nn(u,h,_),k=this.Nn(u,h,b),D=this.Bn(u,h,m),$=this.Ln(u.indexId,f,C,_.inclusive,k,b.inclusive,D);return w.forEach($,B=>n.Z(B,t.limit).next(L=>{L.forEach(H=>{const Z=O.fromSegments(H.documentKey);o.has(Z)||(o=o.add(Z),c.push(Z))})}))}).next(()=>c)}return w.resolve(null)})}xn(e){let t=this.Mn.get(e);return t||(e.filters.length===0?t=[e]:t=Rv(ee.create(e.filters,"and")).map(n=>wa(e.path,e.collectionGroup,e.orderBy,n.getFilters(),e.limit,e.startAt,e.endAt)),this.Mn.set(e,t),t)}Ln(e,t,n,i,s,o,c){const u=(t!=null?t.length:1)*Math.max(n.length,s.length),h=u/(t!=null?t.length:1),f=[];for(let m=0;m<u;++m){const _=t?this.kn(t[m/h]):es,b=this.qn(e,_,n[m%h],i),C=this.Qn(e,_,s[m%h],o),k=c.map(D=>this.qn(e,_,D,!0));f.push(...this.createRange(b,C,k))}return f}qn(e,t,n,i){const s=new nn(e,O.empty(),t,n);return i?s:s.Rn()}Qn(e,t,n,i){const s=new nn(e,O.empty(),t,n);return i?s.Rn():s}On(e,t){const n=new oh(t),i=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,i).next(s=>{let o=null;for(const c of s)n.wn(c)&&(!o||c.fields.length>o.fields.length)&&(o=c);return o})}getIndexType(e,t){let n=2;const i=this.xn(t);return w.forEach(i,s=>this.On(e,s).next(o=>{o?n!==0&&o.fields.length<function(u){let h=new te(oe.comparator),f=!1;for(const m of u.filters)for(const _ of m.getFlattenedFilters())_.field.isKeyField()||(_.op==="array-contains"||_.op==="array-contains-any"?f=!0:h=h.add(_.field));for(const m of u.orderBy)m.field.isKeyField()||(h=h.add(m.field));return h.size+(f?1:0)}(s)&&(n=1):n=0})).next(()=>function(o){return o.limit!==null}(t)&&i.length>1&&n===2?1:n)}$n(e,t){const n=new Vr;for(const i of Jt(e)){const s=t.data.field(i.fieldPath);if(s==null)return null;const o=n.Tn(i.kind);tn.Wt.vt(s,o)}return n.cn()}kn(e){const t=new Vr;return tn.Wt.vt(e,t.Tn(0)),t.cn()}Un(e,t){const n=new Vr;return tn.Wt.vt(ai(this.databaseId,t),n.Tn(function(s){const o=Jt(s);return o.length===0?0:o[o.length-1].kind}(e))),n.cn()}Bn(e,t,n){if(n===null)return[];let i=[];i.push(new Vr);let s=0;for(const o of Jt(e)){const c=n[s++];for(const u of i)if(this.Kn(t,o.fieldPath)&&ci(c))i=this.Wn(i,o,c);else{const h=u.Tn(o.kind);tn.Wt.vt(c,h)}}return this.Gn(i)}Nn(e,t,n){return this.Bn(e,t,n.position)}Gn(e){const t=[];for(let n=0;n<e.length;++n)t[n]=e[n].cn();return t}Wn(e,t,n){const i=[...e],s=[];for(const o of n.arrayValue.values||[])for(const c of i){const u=new Vr;u.seed(c.cn()),tn.Wt.vt(o,u.Tn(t.kind)),s.push(u)}return s}Kn(e,t){return!!e.filters.find(n=>n instanceof Q&&n.field.isEqual(t)&&(n.op==="in"||n.op==="not-in"))}getFieldIndexes(e,t){const n=Dr(e),i=Vn(e);return(t?n.J(ga,IDBKeyRange.bound(t,t)):n.J()).next(s=>{const o=[];return w.forEach(s,c=>i.get([c.indexId,this.uid]).next(u=>{o.push(function(f,m){const _=m?new ei(m.sequenceNumber,new Le(gn(m.readTime),new O(Qe(m.documentKey)),m.largestBatchId)):ei.empty(),b=f.fields.map(([C,k])=>new us(oe.fromServerFormat(C),k));return new Ps(f.indexId,f.collectionGroup,b,_)}(c,u))})).next(()=>o)})}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next(t=>t.length===0?null:(t.sort((n,i)=>{const s=n.indexState.sequenceNumber-i.indexState.sequenceNumber;return s!==0?s:j(n.collectionGroup,i.collectionGroup)}),t[0].collectionGroup))}updateCollectionGroup(e,t,n){const i=Dr(e),s=Vn(e);return this.zn(e).next(o=>i.J(ga,IDBKeyRange.bound(t,t)).next(c=>w.forEach(c,u=>s.put(eh(u.indexId,this.uid,o,n)))))}updateIndexEntries(e,t){const n=new Map;return w.forEach(t,(i,s)=>{const o=n.get(i.collectionGroup);return(o?w.resolve(o):this.getFieldIndexes(e,i.collectionGroup)).next(c=>(n.set(i.collectionGroup,c),w.forEach(c,u=>this.jn(e,i,u).next(h=>{const f=this.Hn(s,u);return h.isEqual(f)?w.resolve():this.Jn(e,s,u,h,f)}))))})}Yn(e,t,n,i){return Cn(e).put(i.Vn(this.uid,this.Un(n,t.key),t.key))}Zn(e,t,n,i){return Cn(e).delete(i.mn(this.uid,this.Un(n,t.key),t.key))}jn(e,t,n){const i=Cn(e);let s=new te(Tt);return i.te({index:rf,range:IDBKeyRange.only([n.indexId,this.uid,_s(this.Un(n,t))])},(o,c)=>{s=s.add(new nn(n.indexId,t,sh(c.arrayValue),sh(c.directionalValue)))}).next(()=>s)}Hn(e,t){let n=new te(Tt);const i=this.$n(t,e);if(i==null)return n;const s=pa(t);if(s!=null){const o=e.data.field(s.fieldPath);if(ci(o))for(const c of o.arrayValue.values||[])n=n.add(new nn(t.indexId,e.key,this.kn(c),i))}else n=n.add(new nn(t.indexId,e.key,es,i));return n}Jn(e,t,n,i,s){V(ch,"Updating index entries for document '%s'",t.key);const o=[];return function(u,h,f,m,_){const b=u.getIterator(),C=h.getIterator();let k=Pn(b),D=Pn(C);for(;k||D;){let $=!1,B=!1;if(k&&D){const L=f(k,D);L<0?B=!0:L>0&&($=!0)}else k!=null?B=!0:$=!0;$?(m(D),D=Pn(C)):B?(_(k),k=Pn(b)):(k=Pn(b),D=Pn(C))}}(i,s,Tt,c=>{o.push(this.Yn(e,t,n,c))},c=>{o.push(this.Zn(e,t,n,c))}),w.waitFor(o)}zn(e){let t=1;return Vn(e).te({index:nf,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},(n,i,s)=>{s.done(),t=i.sequenceNumber+1}).next(()=>t)}createRange(e,t,n){n=n.sort((o,c)=>Tt(o,c)).filter((o,c,u)=>!c||Tt(o,u[c-1])!==0);const i=[];i.push(e);for(const o of n){const c=Tt(o,e),u=Tt(o,t);if(c===0)i[0]=e.Rn();else if(c>0&&u<0)i.push(o),i.push(o.Rn());else if(u>0)break}i.push(t);const s=[];for(let o=0;o<i.length;o+=2){if(this.Xn(i[o],i[o+1]))return[];const c=i[o].mn(this.uid,es,O.empty()),u=i[o+1].mn(this.uid,es,O.empty());s.push(IDBKeyRange.bound(c,u))}return s}Xn(e,t){return Tt(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(lh)}getMinOffset(e,t){return w.mapArray(this.xn(t),n=>this.On(e,n).next(i=>i||M(44426))).next(lh)}}function uh(r){return pe(r,ii)}function Cn(r){return pe(r,Kr)}function Dr(r){return pe(r,sc)}function Vn(r){return pe(r,$r)}function lh(r){U(r.length!==0,28825);let e=r[0].indexState.offset,t=e.largestBatchId;for(let n=1;n<r.length;n++){const i=r[n].indexState.offset;nc(i,e)<0&&(e=i),t<i.largestBatchId&&(t=i.largestBatchId)}return new Le(e.readTime,e.documentKey,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hh={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},ap=41943040;class we{static withCacheSize(e){return new we(e,we.DEFAULT_COLLECTION_PERCENTILE,we.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cp(r,e,t){const n=r.store($e),i=r.store(Hn),s=[],o=IDBKeyRange.only(t.batchId);let c=0;const u=n.te({range:o},(f,m,_)=>(c++,_.delete()));s.push(u.next(()=>{U(c===1,47070,{batchId:t.batchId})}));const h=[];for(const f of t.mutations){const m=Zd(e,f.key.path,t.batchId);s.push(i.delete(m)),h.push(f.key)}return w.waitFor(s).next(()=>h)}function Fs(r){if(!r)return 0;let e;if(r.document)e=r.document;else if(r.unknownDocument)e=r.unknownDocument;else{if(!r.noDocument)throw M(14731);e=r.noDocument}return JSON.stringify(e).length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */we.DEFAULT_COLLECTION_PERCENTILE=10,we.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,we.DEFAULT=new we(ap,we.DEFAULT_COLLECTION_PERCENTILE,we.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),we.DISABLED=new we(-1,0,0);class ao{constructor(e,t,n,i){this.userId=e,this.serializer=t,this.indexManager=n,this.referenceDelegate=i,this.er={}}static bt(e,t,n,i){U(e.uid!=="",64387);const s=e.isAuthenticated()?e.uid:"";return new ao(s,t,n,i)}checkEmpty(e){let t=!0;const n=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return wt(e).te({index:rn,range:n},(i,s,o)=>{t=!1,o.done()}).next(()=>t)}addMutationBatch(e,t,n,i){const s=Mn(e),o=wt(e);return o.add({}).next(c=>{U(typeof c=="number",49019);const u=new fc(c,t,n,i),h=function(b,C,k){const D=k.baseMutations.map(B=>Os(b.wt,B)),$=k.mutations.map(B=>Os(b.wt,B));return{userId:C,batchId:k.batchId,localWriteTimeMs:k.localWriteTime.toMillis(),baseMutations:D,mutations:$}}(this.serializer,this.userId,u),f=[];let m=new te((_,b)=>j(_.canonicalString(),b.canonicalString()));for(const _ of i){const b=Zd(this.userId,_.key.path,c);m=m.add(_.key.path.popLast()),f.push(o.put(h)),f.push(s.put(b,rE))}return m.forEach(_=>{f.push(this.indexManager.addToCollectionParentIndex(e,_))}),e.addOnCommittedListener(()=>{this.er[c]=u.keys()}),w.waitFor(f).next(()=>u)})}lookupMutationBatch(e,t){return wt(e).get(t).next(n=>n?(U(n.userId===this.userId,48,"Unexpected user for mutation batch",{userId:n.userId,batchId:t}),en(this.serializer,n)):null)}tr(e,t){return this.er[t]?w.resolve(this.er[t]):this.lookupMutationBatch(e,t).next(n=>{if(n){const i=n.keys();return this.er[t]=i,i}return null})}getNextMutationBatchAfterBatchId(e,t){const n=t+1,i=IDBKeyRange.lowerBound([this.userId,n]);let s=null;return wt(e).te({index:rn,range:i},(o,c,u)=>{c.userId===this.userId&&(U(c.batchId>=n,47524,{nr:n}),s=en(this.serializer,c)),u.done()}).next(()=>s)}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let n=sn;return wt(e).te({index:rn,range:t,reverse:!0},(i,s,o)=>{n=s.batchId,o.done()}).next(()=>n)}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,sn],[this.userId,Number.POSITIVE_INFINITY]);return wt(e).J(rn,t).next(n=>n.map(i=>en(this.serializer,i)))}getAllMutationBatchesAffectingDocumentKey(e,t){const n=ls(this.userId,t.path),i=IDBKeyRange.lowerBound(n),s=[];return Mn(e).te({range:i},(o,c,u)=>{const[h,f,m]=o,_=Qe(f);if(h===this.userId&&t.path.isEqual(_))return wt(e).get(m).next(b=>{if(!b)throw M(61480,{rr:o,batchId:m});U(b.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:b.userId,batchId:m}),s.push(en(this.serializer,b))});u.done()}).next(()=>s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new te(j);const i=[];return t.forEach(s=>{const o=ls(this.userId,s.path),c=IDBKeyRange.lowerBound(o),u=Mn(e).te({range:c},(h,f,m)=>{const[_,b,C]=h,k=Qe(b);_===this.userId&&s.path.isEqual(k)?n=n.add(C):m.done()});i.push(u)}),w.waitFor(i).next(()=>this.ir(e,n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,i=n.length+1,s=ls(this.userId,n),o=IDBKeyRange.lowerBound(s);let c=new te(j);return Mn(e).te({range:o},(u,h,f)=>{const[m,_,b]=u,C=Qe(_);m===this.userId&&n.isPrefixOf(C)?C.length===i&&(c=c.add(b)):f.done()}).next(()=>this.ir(e,c))}ir(e,t){const n=[],i=[];return t.forEach(s=>{i.push(wt(e).get(s).next(o=>{if(o===null)throw M(35274,{batchId:s});U(o.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:o.userId,batchId:s}),n.push(en(this.serializer,o))}))}),w.waitFor(i).next(()=>n)}removeMutationBatch(e,t){return cp(e.he,this.userId,t).next(n=>(e.addOnCommittedListener(()=>{this.sr(t.batchId)}),w.forEach(n,i=>this.referenceDelegate.markPotentiallyOrphaned(e,i))))}sr(e){delete this.er[e]}performConsistencyCheck(e){return this.checkEmpty(e).next(t=>{if(!t)return w.resolve();const n=IDBKeyRange.lowerBound(function(o){return[o]}(this.userId)),i=[];return Mn(e).te({range:n},(s,o,c)=>{if(s[0]===this.userId){const u=Qe(s[1]);i.push(u)}else c.done()}).next(()=>{U(i.length===0,56720,{_r:i.map(s=>s.canonicalString())})})})}containsKey(e,t){return up(e,this.userId,t)}ar(e){return lp(e).get(this.userId).next(t=>t||{userId:this.userId,lastAcknowledgedBatchId:sn,lastStreamToken:""})}}function up(r,e,t){const n=ls(e,t.path),i=n[1],s=IDBKeyRange.lowerBound(n);let o=!1;return Mn(r).te({range:s,ee:!0},(c,u,h)=>{const[f,m,_]=c;f===e&&m===i&&(o=!0),h.done()}).next(()=>o)}function wt(r){return pe(r,$e)}function Mn(r){return pe(r,Hn)}function lp(r){return pe(r,ni)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _n{constructor(e){this.ur=e}next(){return this.ur+=2,this.ur}static cr(){return new _n(0)}static lr(){return new _n(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sv{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.hr(e).next(t=>{const n=new _n(t.highestTargetId);return t.highestTargetId=n.next(),this.Pr(e,t).next(()=>t.highestTargetId)})}getLastRemoteSnapshotVersion(e){return this.hr(e).next(t=>q.fromTimestamp(new ae(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds)))}getHighestSequenceNumber(e){return this.hr(e).next(t=>t.highestListenSequenceNumber)}setTargetsMetadata(e,t,n){return this.hr(e).next(i=>(i.highestListenSequenceNumber=t,n&&(i.lastRemoteSnapshotVersion=n.toTimestamp()),t>i.highestListenSequenceNumber&&(i.highestListenSequenceNumber=t),this.Pr(e,i)))}addTargetData(e,t){return this.Tr(e,t).next(()=>this.hr(e).next(n=>(n.targetCount+=1,this.Ir(t,n),this.Pr(e,n))))}updateTargetData(e,t){return this.Tr(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next(()=>Dn(e).delete(t.targetId)).next(()=>this.hr(e)).next(n=>(U(n.targetCount>0,8065),n.targetCount-=1,this.Pr(e,n)))}removeTargets(e,t,n){let i=0;const s=[];return Dn(e).te((o,c)=>{const u=Ur(c);u.sequenceNumber<=t&&n.get(u.targetId)===null&&(i++,s.push(this.removeTargetData(e,u)))}).next(()=>w.waitFor(s)).next(()=>i)}forEachTarget(e,t){return Dn(e).te((n,i)=>{const s=Ur(i);t(s)})}hr(e){return dh(e).get(Vs).next(t=>(U(t!==null,2888),t))}Pr(e,t){return dh(e).put(Vs,t)}Tr(e,t){return Dn(e).put(rp(this.serializer,t))}Ir(e,t){let n=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,n=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,n=!0),n}getTargetCount(e){return this.hr(e).next(t=>t.targetCount)}getTargetData(e,t){const n=pn(t),i=IDBKeyRange.bound([n,Number.NEGATIVE_INFINITY],[n,Number.POSITIVE_INFINITY]);let s=null;return Dn(e).te({range:i,index:tf},(o,c,u)=>{const h=Ur(c);Ei(t,h.target)&&(s=h,u.done())}).next(()=>s)}addMatchingKeys(e,t,n){const i=[],s=Ct(e);return t.forEach(o=>{const c=be(o.path);i.push(s.put({targetId:n,path:c})),i.push(this.referenceDelegate.addReference(e,n,o))}),w.waitFor(i)}removeMatchingKeys(e,t,n){const i=Ct(e);return w.forEach(t,s=>{const o=be(s.path);return w.waitFor([i.delete([n,o]),this.referenceDelegate.removeReference(e,n,s)])})}removeMatchingKeysForTargetId(e,t){const n=Ct(e),i=IDBKeyRange.bound([t],[t+1],!1,!0);return n.delete(i)}getMatchingKeysForTargetId(e,t){const n=IDBKeyRange.bound([t],[t+1],!1,!0),i=Ct(e);let s=K();return i.te({range:n,ee:!0},(o,c,u)=>{const h=Qe(o[1]),f=new O(h);s=s.add(f)}).next(()=>s)}containsKey(e,t){const n=be(t.path),i=IDBKeyRange.bound([n],[Wd(n)],!1,!0);let s=0;return Ct(e).te({index:ic,ee:!0,range:i},([o,c],u,h)=>{o!==0&&(s++,h.done())}).next(()=>s>0)}Rt(e,t){return Dn(e).get(t).next(n=>n?Ur(n):null)}}function Dn(r){return pe(r,Wn)}function dh(r){return pe(r,on)}function Ct(r){return pe(r,Qn)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fh="LruGarbageCollector",hp=1048576;function ph([r,e],[t,n]){const i=j(r,t);return i===0?j(e,n):i}class Cv{constructor(e){this.Er=e,this.buffer=new te(ph),this.dr=0}Ar(){return++this.dr}Rr(e){const t=[e,this.Ar()];if(this.buffer.size<this.Er)this.buffer=this.buffer.add(t);else{const n=this.buffer.last();ph(t,n)<0&&(this.buffer=this.buffer.delete(n).add(t))}}get maxValue(){return this.buffer.last()[0]}}class dp{constructor(e,t,n){this.garbageCollector=e,this.asyncQueue=t,this.localStore=n,this.Vr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.mr(6e4)}stop(){this.Vr&&(this.Vr.cancel(),this.Vr=null)}get started(){return this.Vr!==null}mr(e){V(fh,`Garbage collection scheduled in ${e}ms`),this.Vr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Vr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){qt(t)?V(fh,"Ignoring IndexedDB error during garbage collection: ",t):await En(t)}await this.mr(3e5)})}}class Vv{constructor(e,t){this.gr=e,this.params=t}calculateTargetCount(e,t){return this.gr.pr(e).next(n=>Math.floor(t/100*n))}nthSequenceNumber(e,t){if(t===0)return w.resolve(Be.le);const n=new Cv(t);return this.gr.forEachTarget(e,i=>n.Rr(i.sequenceNumber)).next(()=>this.gr.yr(e,i=>n.Rr(i))).next(()=>n.maxValue)}removeTargets(e,t,n){return this.gr.removeTargets(e,t,n)}removeOrphanedDocuments(e,t){return this.gr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(V("LruGarbageCollector","Garbage collection skipped; disabled"),w.resolve(hh)):this.getCacheSize(e).next(n=>n<this.params.cacheSizeCollectionThreshold?(V("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),hh):this.wr(e,t))}getCacheSize(e){return this.gr.getCacheSize(e)}wr(e,t){let n,i,s,o,c,u,h;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(m=>(m>this.params.maximumSequenceNumbersToCollect?(V("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),i=this.params.maximumSequenceNumbersToCollect):i=m,o=Date.now(),this.nthSequenceNumber(e,i))).next(m=>(n=m,c=Date.now(),this.removeTargets(e,n,t))).next(m=>(s=m,u=Date.now(),this.removeOrphanedDocuments(e,n))).next(m=>(h=Date.now(),kn()<=W.DEBUG&&V("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${i} in `+(c-o)+`ms
	Removed ${s} targets in `+(u-c)+`ms
	Removed ${m} documents in `+(h-u)+`ms
Total Duration: ${h-f}ms`),w.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:s,documentsRemoved:m})))}}function fp(r,e){return new Vv(r,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dv{constructor(e,t){this.db=e,this.garbageCollector=fp(this,t)}pr(e){const t=this.br(e);return this.db.getTargetCache().getTargetCount(e).next(n=>t.next(i=>n+i))}br(e){let t=0;return this.yr(e,n=>{t++}).next(()=>t)}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}yr(e,t){return this.Sr(e,(n,i)=>t(i))}addReference(e,t,n){return ts(e,n)}removeReference(e,t,n){return ts(e,n)}removeTargets(e,t,n){return this.db.getTargetCache().removeTargets(e,t,n)}markPotentiallyOrphaned(e,t){return ts(e,t)}Dr(e,t){return function(i,s){let o=!1;return lp(i).ne(c=>up(i,c,s).next(u=>(u&&(o=!0),w.resolve(!u)))).next(()=>o)}(e,t)}removeOrphanedDocuments(e,t){const n=this.db.getRemoteDocumentCache().newChangeBuffer(),i=[];let s=0;return this.Sr(e,(o,c)=>{if(c<=t){const u=this.Dr(e,o).next(h=>{if(!h)return s++,n.getEntry(e,o).next(()=>(n.removeEntry(o,q.min()),Ct(e).delete(function(m){return[0,be(m.path)]}(o))))});i.push(u)}}).next(()=>w.waitFor(i)).next(()=>n.apply(e)).next(()=>s)}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,n)}updateLimboDocument(e,t){return ts(e,t)}Sr(e,t){const n=Ct(e);let i,s=Be.le;return n.te({index:ic},([o,c],{path:u,sequenceNumber:h})=>{o===0?(s!==Be.le&&t(new O(Qe(i)),s),s=h,i=u):s=Be.le}).next(()=>{s!==Be.le&&t(new O(Qe(i)),s)})}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function ts(r,e){return Ct(r).put(function(n,i){return{targetId:0,path:be(n.path),sequenceNumber:i}}(e,r.currentSequenceNumber))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pp{constructor(){this.changes=new mt(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,le.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return n!==void 0?w.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kv{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,n){return Qt(e).put(n)}removeEntry(e,t,n){return Qt(e).delete(function(s,o){const c=s.path.toArray();return[c.slice(0,c.length-2),c[c.length-2],Ms(o),c[c.length-1]]}(t,n))}updateMetadata(e,t){return this.getMetadata(e).next(n=>(n.byteSize+=t,this.vr(e,n)))}getEntry(e,t){let n=le.newInvalidDocument(t);return Qt(e).te({index:hs,range:IDBKeyRange.only(kr(t))},(i,s)=>{n=this.Cr(t,s)}).next(()=>n)}Fr(e,t){let n={size:0,document:le.newInvalidDocument(t)};return Qt(e).te({index:hs,range:IDBKeyRange.only(kr(t))},(i,s)=>{n={document:this.Cr(t,s),size:Fs(s)}}).next(()=>n)}getEntries(e,t){let n=Me();return this.Mr(e,t,(i,s)=>{const o=this.Cr(i,s);n=n.insert(i,o)}).next(()=>n)}Or(e,t){let n=Me(),i=new ce(O.comparator);return this.Mr(e,t,(s,o)=>{const c=this.Cr(s,o);n=n.insert(s,c),i=i.insert(s,Fs(o))}).next(()=>({documents:n,Nr:i}))}Mr(e,t,n){if(t.isEmpty())return w.resolve();let i=new te(_h);t.forEach(u=>i=i.add(u));const s=IDBKeyRange.bound(kr(i.first()),kr(i.last())),o=i.getIterator();let c=o.getNext();return Qt(e).te({index:hs,range:s},(u,h,f)=>{const m=O.fromSegments([...h.prefixPath,h.collectionGroup,h.documentId]);for(;c&&_h(c,m)<0;)n(c,null),c=o.getNext();c&&c.isEqual(m)&&(n(c,h),c=o.hasNext()?o.getNext():null),c?f.H(kr(c)):f.done()}).next(()=>{for(;c;)n(c,null),c=o.hasNext()?o.getNext():null})}getDocumentsMatchingQuery(e,t,n,i,s){const o=t.path,c=[o.popLast().toArray(),o.lastSegment(),Ms(n.readTime),n.documentKey.path.isEmpty()?"":n.documentKey.path.lastSegment()],u=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return Qt(e).J(IDBKeyRange.bound(c,u,!0)).next(h=>{s==null||s.incrementDocumentReadCount(h.length);let f=Me();for(const m of h){const _=this.Cr(O.fromSegments(m.prefixPath.concat(m.collectionGroup,m.documentId)),m);_.isFoundDocument()&&(vi(t,_)||i.has(_.key))&&(f=f.insert(_.key,_))}return f})}getAllFromCollectionGroup(e,t,n,i){let s=Me();const o=gh(t,n),c=gh(t,Le.max());return Qt(e).te({index:ef,range:IDBKeyRange.bound(o,c,!0)},(u,h,f)=>{const m=this.Cr(O.fromSegments(h.prefixPath.concat(h.collectionGroup,h.documentId)),h);s=s.insert(m.key,m),s.size===i&&f.done()}).next(()=>s)}newChangeBuffer(e){return new Nv(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next(t=>t.byteSize)}getMetadata(e){return mh(e).get(ma).next(t=>(U(!!t,20021),t))}vr(e,t){return mh(e).put(ma,t)}Cr(e,t){if(t){const n=yv(this.serializer,t);if(!(n.isNoDocument()&&n.version.isEqual(q.min())))return n}return le.newInvalidDocument(e)}}function mp(r){return new kv(r)}class Nv extends pp{constructor(e,t){super(),this.Br=e,this.trackRemovals=t,this.Lr=new mt(n=>n.toString(),(n,i)=>n.isEqual(i))}applyChanges(e){const t=[];let n=0,i=new te((s,o)=>j(s.canonicalString(),o.canonicalString()));return this.changes.forEach((s,o)=>{const c=this.Lr.get(s);if(t.push(this.Br.removeEntry(e,s,c.readTime)),o.isValidDocument()){const u=Xl(this.Br.serializer,o);i=i.add(s.path.popLast());const h=Fs(u);n+=h-c.size,t.push(this.Br.addEntry(e,s,u))}else if(n-=c.size,this.trackRemovals){const u=Xl(this.Br.serializer,o.convertToNoDocument(q.min()));t.push(this.Br.addEntry(e,s,u))}}),i.forEach(s=>{t.push(this.Br.indexManager.addToCollectionParentIndex(e,s))}),t.push(this.Br.updateMetadata(e,n)),w.waitFor(t)}getFromCache(e,t){return this.Br.Fr(e,t).next(n=>(this.Lr.set(t,{size:n.size,readTime:n.document.readTime}),n.document))}getAllFromCache(e,t){return this.Br.Or(e,t).next(({documents:n,Nr:i})=>(i.forEach((s,o)=>{this.Lr.set(s,{size:o,readTime:n.get(s).readTime})}),n))}}function mh(r){return pe(r,ri)}function Qt(r){return pe(r,Cs)}function kr(r){const e=r.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function gh(r,e){const t=e.documentKey.path.toArray();return[r,Ms(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function _h(r,e){const t=r.path.toArray(),n=e.path.toArray();let i=0;for(let s=0;s<t.length-2&&s<n.length-2;++s)if(i=j(t[s],n[s]),i)return i;return i=j(t.length,n.length),i||(i=j(t[t.length-2],n[n.length-2]),i||j(t[t.length-1],n[n.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xv{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gp{constructor(e,t,n,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=i}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next(i=>(n=i,this.remoteDocumentCache.getEntry(e,t))).next(i=>(n!==null&&Qr(n.mutation,i,Ne.empty(),ae.now()),i))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(n=>this.getLocalViewOfDocuments(e,n,K()).next(()=>n))}getLocalViewOfDocuments(e,t,n=K()){const i=Ye();return this.populateOverlays(e,i,t).next(()=>this.computeViews(e,t,i,n).next(s=>{let o=Lr();return s.forEach((c,u)=>{o=o.insert(c,u.overlayedDocument)}),o}))}getOverlayedDocuments(e,t){const n=Ye();return this.populateOverlays(e,n,t).next(()=>this.computeViews(e,t,n,K()))}populateOverlays(e,t,n){const i=[];return n.forEach(s=>{t.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((o,c)=>{t.set(o,c)})})}computeViews(e,t,n,i){let s=Me();const o=Wr(),c=function(){return Wr()}();return t.forEach((u,h)=>{const f=n.get(h.key);i.has(h.key)&&(f===void 0||f.mutation instanceof gt)?s=s.insert(h.key,h):f!==void 0?(o.set(h.key,f.mutation.getFieldMask()),Qr(f.mutation,h,f.mutation.getFieldMask(),ae.now())):o.set(h.key,Ne.empty())}),this.recalculateAndSaveOverlays(e,s).next(u=>(u.forEach((h,f)=>o.set(h,f)),t.forEach((h,f)=>{var m;return c.set(h,new xv(f,(m=o.get(h))!==null&&m!==void 0?m:null))}),c))}recalculateAndSaveOverlays(e,t){const n=Wr();let i=new ce((o,c)=>o-c),s=K();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(o=>{for(const c of o)c.keys().forEach(u=>{const h=t.get(u);if(h===null)return;let f=n.get(u)||Ne.empty();f=c.applyToLocalView(h,f),n.set(u,f);const m=(i.get(c.batchId)||K()).add(u);i=i.insert(c.batchId,m)})}).next(()=>{const o=[],c=i.getReverseIterator();for(;c.hasNext();){const u=c.getNext(),h=u.key,f=u.value,m=kf();f.forEach(_=>{if(!s.has(_)){const b=Uf(t.get(_),n.get(_));b!==null&&m.set(_,b),s=s.add(_)}}),o.push(this.documentOverlayCache.saveOverlays(e,h,m))}return w.waitFor(o)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(n=>this.recalculateAndSaveOverlays(e,n))}getDocumentsMatchingQuery(e,t,n,i){return function(o){return O.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Pf(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,i):this.getDocumentsMatchingCollectionQuery(e,t,n,i)}getNextDocuments(e,t,n,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,i).next(s=>{const o=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,i-s.size):w.resolve(Ye());let c=Zr,u=s;return o.next(h=>w.forEach(h,(f,m)=>(c<m.largestBatchId&&(c=m.largestBatchId),s.get(f)?w.resolve():this.remoteDocumentCache.getEntry(e,f).next(_=>{u=u.insert(f,_)}))).next(()=>this.populateOverlays(e,h,s)).next(()=>this.computeViews(e,u,h,K())).next(f=>({batchId:c,changes:Df(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new O(t)).next(n=>{let i=Lr();return n.isFoundDocument()&&(i=i.insert(n.key,n)),i})}getDocumentsMatchingCollectionGroupQuery(e,t,n,i){const s=t.collectionGroup;let o=Lr();return this.indexManager.getCollectionParents(e,s).next(c=>w.forEach(c,u=>{const h=function(m,_){return new ur(_,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(t,u.child(s));return this.getDocumentsMatchingCollectionQuery(e,h,n,i).next(f=>{f.forEach((m,_)=>{o=o.insert(m,_)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,t,n,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next(o=>(s=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,s,i))).next(o=>{s.forEach((u,h)=>{const f=h.getKey();o.get(f)===null&&(o=o.insert(f,le.newInvalidDocument(f)))});let c=Lr();return o.forEach((u,h)=>{const f=s.get(u);f!==void 0&&Qr(f.mutation,h,Ne.empty(),ae.now()),vi(t,h)&&(c=c.insert(u,h))}),c})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ov{constructor(e){this.serializer=e,this.kr=new Map,this.qr=new Map}getBundleMetadata(e,t){return w.resolve(this.kr.get(t))}saveBundleMetadata(e,t){return this.kr.set(t.id,function(i){return{id:i.id,version:i.version,createTime:ke(i.createTime)}}(t)),w.resolve()}getNamedQuery(e,t){return w.resolve(this.qr.get(t))}saveNamedQuery(e,t){return this.qr.set(t.name,function(i){return{name:i.name,query:ip(i.bundledQuery),readTime:ke(i.readTime)}}(t)),w.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mv{constructor(){this.overlays=new ce(O.comparator),this.Qr=new Map}getOverlay(e,t){return w.resolve(this.overlays.get(t))}getOverlays(e,t){const n=Ye();return w.forEach(t,i=>this.getOverlay(e,i).next(s=>{s!==null&&n.set(i,s)})).next(()=>n)}saveOverlays(e,t,n){return n.forEach((i,s)=>{this.St(e,t,s)}),w.resolve()}removeOverlaysForBatchId(e,t,n){const i=this.Qr.get(n);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.Qr.delete(n)),w.resolve()}getOverlaysForCollection(e,t,n){const i=Ye(),s=t.length+1,o=new O(t.child("")),c=this.overlays.getIteratorFrom(o);for(;c.hasNext();){const u=c.getNext().value,h=u.getKey();if(!t.isPrefixOf(h.path))break;h.path.length===s&&u.largestBatchId>n&&i.set(u.getKey(),u)}return w.resolve(i)}getOverlaysForCollectionGroup(e,t,n,i){let s=new ce((h,f)=>h-f);const o=this.overlays.getIterator();for(;o.hasNext();){const h=o.getNext().value;if(h.getKey().getCollectionGroup()===t&&h.largestBatchId>n){let f=s.get(h.largestBatchId);f===null&&(f=Ye(),s=s.insert(h.largestBatchId,f)),f.set(h.getKey(),h)}}const c=Ye(),u=s.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((h,f)=>c.set(h,f)),!(c.size()>=i)););return w.resolve(c)}St(e,t,n){const i=this.overlays.get(n.key);if(i!==null){const o=this.Qr.get(i.largestBatchId).delete(n.key);this.Qr.set(i.largestBatchId,o)}this.overlays=this.overlays.insert(n.key,new mc(t,n));let s=this.Qr.get(t);s===void 0&&(s=K(),this.Qr.set(t,s)),this.Qr.set(t,s.add(n.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lv{constructor(){this.sessionToken=he.EMPTY_BYTE_STRING}getSessionToken(e){return w.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,w.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ec{constructor(){this.$r=new te(me.Ur),this.Kr=new te(me.Wr)}isEmpty(){return this.$r.isEmpty()}addReference(e,t){const n=new me(e,t);this.$r=this.$r.add(n),this.Kr=this.Kr.add(n)}Gr(e,t){e.forEach(n=>this.addReference(n,t))}removeReference(e,t){this.zr(new me(e,t))}jr(e,t){e.forEach(n=>this.removeReference(n,t))}Hr(e){const t=new O(new X([])),n=new me(t,e),i=new me(t,e+1),s=[];return this.Kr.forEachInRange([n,i],o=>{this.zr(o),s.push(o.key)}),s}Jr(){this.$r.forEach(e=>this.zr(e))}zr(e){this.$r=this.$r.delete(e),this.Kr=this.Kr.delete(e)}Yr(e){const t=new O(new X([])),n=new me(t,e),i=new me(t,e+1);let s=K();return this.Kr.forEachInRange([n,i],o=>{s=s.add(o.key)}),s}containsKey(e){const t=new me(e,0),n=this.$r.firstAfterOrEqual(t);return n!==null&&e.isEqual(n.key)}}class me{constructor(e,t){this.key=e,this.Zr=t}static Ur(e,t){return O.comparator(e.key,t.key)||j(e.Zr,t.Zr)}static Wr(e,t){return j(e.Zr,t.Zr)||O.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fv{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.nr=1,this.Xr=new te(me.Ur)}checkEmpty(e){return w.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,n,i){const s=this.nr;this.nr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new fc(s,t,n,i);this.mutationQueue.push(o);for(const c of i)this.Xr=this.Xr.add(new me(c.key,s)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return w.resolve(o)}lookupMutationBatch(e,t){return w.resolve(this.ei(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,i=this.ti(n),s=i<0?0:i;return w.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return w.resolve(this.mutationQueue.length===0?sn:this.nr-1)}getAllMutationBatches(e){return w.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new me(t,0),i=new me(t,Number.POSITIVE_INFINITY),s=[];return this.Xr.forEachInRange([n,i],o=>{const c=this.ei(o.Zr);s.push(c)}),w.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new te(j);return t.forEach(i=>{const s=new me(i,0),o=new me(i,Number.POSITIVE_INFINITY);this.Xr.forEachInRange([s,o],c=>{n=n.add(c.Zr)})}),w.resolve(this.ni(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,i=n.length+1;let s=n;O.isDocumentKey(s)||(s=s.child(""));const o=new me(new O(s),0);let c=new te(j);return this.Xr.forEachWhile(u=>{const h=u.key.path;return!!n.isPrefixOf(h)&&(h.length===i&&(c=c.add(u.Zr)),!0)},o),w.resolve(this.ni(c))}ni(e){const t=[];return e.forEach(n=>{const i=this.ei(n);i!==null&&t.push(i)}),t}removeMutationBatch(e,t){U(this.ri(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let n=this.Xr;return w.forEach(t.mutations,i=>{const s=new me(i.key,t.batchId);return n=n.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.Xr=n})}sr(e){}containsKey(e,t){const n=new me(t,0),i=this.Xr.firstAfterOrEqual(n);return w.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,w.resolve()}ri(e,t){return this.ti(e)}ti(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}ei(e){const t=this.ti(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uv{constructor(e){this.ii=e,this.docs=function(){return new ce(O.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,i=this.docs.get(n),s=i?i.size:0,o=this.ii(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:o}),this.size+=o-s,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return w.resolve(n?n.document.mutableCopy():le.newInvalidDocument(t))}getEntries(e,t){let n=Me();return t.forEach(i=>{const s=this.docs.get(i);n=n.insert(i,s?s.document.mutableCopy():le.newInvalidDocument(i))}),w.resolve(n)}getDocumentsMatchingQuery(e,t,n,i){let s=Me();const o=t.path,c=new O(o.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(c);for(;u.hasNext();){const{key:h,value:{document:f}}=u.getNext();if(!o.isPrefixOf(h.path))break;h.path.length>o.length+1||nc(Qd(f),n)<=0||(i.has(f.key)||vi(t,f))&&(s=s.insert(f.key,f.mutableCopy()))}return w.resolve(s)}getAllFromCollectionGroup(e,t,n,i){M(9500)}si(e,t){return w.forEach(this.docs,n=>t(n))}newChangeBuffer(e){return new Bv(this)}getSize(e){return w.resolve(this.size)}}class Bv extends pp{constructor(e){super(),this.Br=e}applyChanges(e){const t=[];return this.changes.forEach((n,i)=>{i.isValidDocument()?t.push(this.Br.addEntry(e,i)):this.Br.removeEntry(n)}),w.waitFor(t)}getFromCache(e,t){return this.Br.getEntry(e,t)}getAllFromCache(e,t){return this.Br.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qv{constructor(e){this.persistence=e,this.oi=new mt(t=>pn(t),Ei),this.lastRemoteSnapshotVersion=q.min(),this.highestTargetId=0,this._i=0,this.ai=new Ec,this.targetCount=0,this.ui=_n.cr()}forEachTarget(e,t){return this.oi.forEach((n,i)=>t(i)),w.resolve()}getLastRemoteSnapshotVersion(e){return w.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return w.resolve(this._i)}allocateTargetId(e){return this.highestTargetId=this.ui.next(),w.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this._i&&(this._i=t),w.resolve()}Tr(e){this.oi.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.ui=new _n(t),this.highestTargetId=t),e.sequenceNumber>this._i&&(this._i=e.sequenceNumber)}addTargetData(e,t){return this.Tr(t),this.targetCount+=1,w.resolve()}updateTargetData(e,t){return this.Tr(t),w.resolve()}removeTargetData(e,t){return this.oi.delete(t.target),this.ai.Hr(t.targetId),this.targetCount-=1,w.resolve()}removeTargets(e,t,n){let i=0;const s=[];return this.oi.forEach((o,c)=>{c.sequenceNumber<=t&&n.get(c.targetId)===null&&(this.oi.delete(o),s.push(this.removeMatchingKeysForTargetId(e,c.targetId)),i++)}),w.waitFor(s).next(()=>i)}getTargetCount(e){return w.resolve(this.targetCount)}getTargetData(e,t){const n=this.oi.get(t)||null;return w.resolve(n)}addMatchingKeys(e,t,n){return this.ai.Gr(t,n),w.resolve()}removeMatchingKeys(e,t,n){this.ai.jr(t,n);const i=this.persistence.referenceDelegate,s=[];return i&&t.forEach(o=>{s.push(i.markPotentiallyOrphaned(e,o))}),w.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.ai.Hr(t),w.resolve()}getMatchingKeysForTargetId(e,t){const n=this.ai.Yr(t);return w.resolve(n)}containsKey(e,t){return w.resolve(this.ai.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vc{constructor(e,t){this.ci={},this.overlays={},this.li=new Be(0),this.hi=!1,this.hi=!0,this.Pi=new Lv,this.referenceDelegate=e(this),this.Ti=new qv(this),this.indexManager=new bv,this.remoteDocumentCache=function(i){return new Uv(i)}(n=>this.referenceDelegate.Ii(n)),this.serializer=new np(t),this.Ei=new Ov(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.hi=!1,Promise.resolve()}get started(){return this.hi}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new Mv,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.ci[e.toKey()];return n||(n=new Fv(t,this.referenceDelegate),this.ci[e.toKey()]=n),n}getGlobalsCache(){return this.Pi}getTargetCache(){return this.Ti}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ei}runTransaction(e,t,n){V("MemoryPersistence","Starting transaction:",e);const i=new jv(this.li.next());return this.referenceDelegate.di(),n(i).next(s=>this.referenceDelegate.Ai(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}Ri(e,t){return w.or(Object.values(this.ci).map(n=>()=>n.containsKey(e,t)))}}class jv extends Jd{constructor(e){super(),this.currentSequenceNumber=e}}class co{constructor(e){this.persistence=e,this.Vi=new Ec,this.mi=null}static fi(e){return new co(e)}get gi(){if(this.mi)return this.mi;throw M(60996)}addReference(e,t,n){return this.Vi.addReference(n,t),this.gi.delete(n.toString()),w.resolve()}removeReference(e,t,n){return this.Vi.removeReference(n,t),this.gi.add(n.toString()),w.resolve()}markPotentiallyOrphaned(e,t){return this.gi.add(t.toString()),w.resolve()}removeTarget(e,t){this.Vi.Hr(t.targetId).forEach(i=>this.gi.add(i.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next(i=>{i.forEach(s=>this.gi.add(s.toString()))}).next(()=>n.removeTargetData(e,t))}di(){this.mi=new Set}Ai(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return w.forEach(this.gi,n=>{const i=O.fromPath(n);return this.pi(e,i).next(s=>{s||t.removeEntry(i,q.min())})}).next(()=>(this.mi=null,t.apply(e)))}updateLimboDocument(e,t){return this.pi(e,t).next(n=>{n?this.gi.delete(t.toString()):this.gi.add(t.toString())})}Ii(e){return 0}pi(e,t){return w.or([()=>w.resolve(this.Vi.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ri(e,t)])}}class Us{constructor(e,t){this.persistence=e,this.yi=new mt(n=>be(n.path),(n,i)=>n.isEqual(i)),this.garbageCollector=fp(this,t)}static fi(e,t){return new Us(e,t)}di(){}Ai(e){return w.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}pr(e){const t=this.br(e);return this.persistence.getTargetCache().getTargetCount(e).next(n=>t.next(i=>n+i))}br(e){let t=0;return this.yr(e,n=>{t++}).next(()=>t)}yr(e,t){return w.forEach(this.yi,(n,i)=>this.Dr(e,n,i).next(s=>s?w.resolve():t(i)))}removeTargets(e,t,n){return this.persistence.getTargetCache().removeTargets(e,t,n)}removeOrphanedDocuments(e,t){let n=0;const i=this.persistence.getRemoteDocumentCache(),s=i.newChangeBuffer();return i.si(e,o=>this.Dr(e,o,t).next(c=>{c||(n++,s.removeEntry(o,q.min()))})).next(()=>s.apply(e)).next(()=>n)}markPotentiallyOrphaned(e,t){return this.yi.set(t,e.currentSequenceNumber),w.resolve()}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,t,n){return this.yi.set(n,e.currentSequenceNumber),w.resolve()}removeReference(e,t,n){return this.yi.set(n,e.currentSequenceNumber),w.resolve()}updateLimboDocument(e,t){return this.yi.set(t,e.currentSequenceNumber),w.resolve()}Ii(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=fs(e.data.value)),t}Dr(e,t,n){return w.or([()=>this.persistence.Ri(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const i=this.yi.get(t);return w.resolve(i!==void 0&&i>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zv{constructor(e){this.serializer=e}q(e,t,n,i){const s=new Hs("createOrUpgrade",t);n<1&&i>=1&&(function(u){u.createObjectStore(Ii)}(e),function(u){u.createObjectStore(ni,{keyPath:nE}),u.createObjectStore($e,{keyPath:Sl,autoIncrement:!0}).createIndex(rn,Cl,{unique:!0}),u.createObjectStore(Hn)}(e),yh(e),function(u){u.createObjectStore(Xt)}(e));let o=w.resolve();return n<3&&i>=3&&(n!==0&&(function(u){u.deleteObjectStore(Qn),u.deleteObjectStore(Wn),u.deleteObjectStore(on)}(e),yh(e)),o=o.next(()=>function(u){const h=u.store(on),f={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:q.min().toTimestamp(),targetCount:0};return h.put(Vs,f)}(s))),n<4&&i>=4&&(n!==0&&(o=o.next(()=>function(u,h){return h.store($e).J().next(m=>{u.deleteObjectStore($e),u.createObjectStore($e,{keyPath:Sl,autoIncrement:!0}).createIndex(rn,Cl,{unique:!0});const _=h.store($e),b=m.map(C=>_.put(C));return w.waitFor(b)})}(e,s))),o=o.next(()=>{(function(u){u.createObjectStore(Yn,{keyPath:hE})})(e)})),n<5&&i>=5&&(o=o.next(()=>this.wi(s))),n<6&&i>=6&&(o=o.next(()=>(function(u){u.createObjectStore(ri)}(e),this.bi(s)))),n<7&&i>=7&&(o=o.next(()=>this.Si(s))),n<8&&i>=8&&(o=o.next(()=>this.Di(e,s))),n<9&&i>=9&&(o=o.next(()=>{(function(u){u.objectStoreNames.contains("remoteDocumentChanges")&&u.deleteObjectStore("remoteDocumentChanges")})(e)})),n<10&&i>=10&&(o=o.next(()=>this.Ci(s))),n<11&&i>=11&&(o=o.next(()=>{(function(u){u.createObjectStore(Qs,{keyPath:dE})})(e),function(u){u.createObjectStore(Ys,{keyPath:fE})}(e)})),n<12&&i>=12&&(o=o.next(()=>{(function(u){const h=u.createObjectStore(Js,{keyPath:EE});h.createIndex(_a,vE,{unique:!1}),h.createIndex(sf,TE,{unique:!1})})(e)})),n<13&&i>=13&&(o=o.next(()=>function(u){const h=u.createObjectStore(Cs,{keyPath:iE});h.createIndex(hs,sE),h.createIndex(ef,oE)}(e)).next(()=>this.Fi(e,s)).next(()=>e.deleteObjectStore(Xt))),n<14&&i>=14&&(o=o.next(()=>this.Mi(e,s))),n<15&&i>=15&&(o=o.next(()=>function(u){u.createObjectStore(sc,{keyPath:pE,autoIncrement:!0}).createIndex(ga,mE,{unique:!1}),u.createObjectStore($r,{keyPath:gE}).createIndex(nf,_E,{unique:!1}),u.createObjectStore(Kr,{keyPath:yE}).createIndex(rf,IE,{unique:!1})}(e))),n<16&&i>=16&&(o=o.next(()=>{t.objectStore($r).clear()}).next(()=>{t.objectStore(Kr).clear()})),n<17&&i>=17&&(o=o.next(()=>{(function(u){u.createObjectStore(oc,{keyPath:wE})})(e)})),n<18&&i>=18&&Jh()&&(o=o.next(()=>{t.objectStore($r).clear()}).next(()=>{t.objectStore(Kr).clear()})),o}bi(e){let t=0;return e.store(Xt).te((n,i)=>{t+=Fs(i)}).next(()=>{const n={byteSize:t};return e.store(ri).put(ma,n)})}wi(e){const t=e.store(ni),n=e.store($e);return t.J().next(i=>w.forEach(i,s=>{const o=IDBKeyRange.bound([s.userId,sn],[s.userId,s.lastAcknowledgedBatchId]);return n.J(rn,o).next(c=>w.forEach(c,u=>{U(u.userId===s.userId,18650,"Cannot process batch from unexpected user",{batchId:u.batchId});const h=en(this.serializer,u);return cp(e,s.userId,h).next(()=>{})}))}))}Si(e){const t=e.store(Qn),n=e.store(Xt);return e.store(on).get(Vs).next(i=>{const s=[];return n.te((o,c)=>{const u=new X(o),h=function(m){return[0,be(m)]}(u);s.push(t.get(h).next(f=>f?w.resolve():(m=>t.put({targetId:0,path:be(m),sequenceNumber:i.highestListenSequenceNumber}))(u)))}).next(()=>w.waitFor(s))})}Di(e,t){e.createObjectStore(ii,{keyPath:lE});const n=t.store(ii),i=new Ic,s=o=>{if(i.add(o)){const c=o.lastSegment(),u=o.popLast();return n.put({collectionId:c,parent:be(u)})}};return t.store(Xt).te({ee:!0},(o,c)=>{const u=new X(o);return s(u.popLast())}).next(()=>t.store(Hn).te({ee:!0},([o,c,u],h)=>{const f=Qe(c);return s(f.popLast())}))}Ci(e){const t=e.store(Wn);return t.te((n,i)=>{const s=Ur(i),o=rp(this.serializer,s);return t.put(o)})}Fi(e,t){const n=t.store(Xt),i=[];return n.te((s,o)=>{const c=t.store(Cs),u=function(m){return m.document?new O(X.fromString(m.document.name).popFirst(5)):m.noDocument?O.fromSegments(m.noDocument.path):m.unknownDocument?O.fromSegments(m.unknownDocument.path):M(36783)}(o).path.toArray(),h={prefixPath:u.slice(0,u.length-2),collectionGroup:u[u.length-2],documentId:u[u.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};i.push(c.put(h))}).next(()=>w.waitFor(i))}Mi(e,t){const n=t.store($e),i=mp(this.serializer),s=new vc(co.fi,this.serializer.wt);return n.J().next(o=>{const c=new Map;return o.forEach(u=>{var h;let f=(h=c.get(u.userId))!==null&&h!==void 0?h:K();en(this.serializer,u).keys().forEach(m=>f=f.add(m)),c.set(u.userId,f)}),w.forEach(c,(u,h)=>{const f=new Ve(h),m=oo.bt(this.serializer,f),_=s.getIndexManager(f),b=ao.bt(f,this.serializer,_,s.referenceDelegate);return new gp(i,b,m,_).recalculateAndSaveOverlaysForDocumentKeys(new ya(t,Be.le),u).next()})})}}function yh(r){r.createObjectStore(Qn,{keyPath:cE}).createIndex(ic,uE,{unique:!0}),r.createObjectStore(Wn,{keyPath:"targetId"}).createIndex(tf,aE,{unique:!0}),r.createObjectStore(on)}const At="IndexedDbPersistence",Zo=18e5,ea=5e3,ta="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",$v="main";class Tc{constructor(e,t,n,i,s,o,c,u,h,f,m=18){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=n,this.xi=s,this.window=o,this.document=c,this.Oi=h,this.Ni=f,this.Bi=m,this.li=null,this.hi=!1,this.isPrimary=!1,this.networkEnabled=!0,this.Li=null,this.inForeground=!1,this.ki=null,this.qi=null,this.Qi=Number.NEGATIVE_INFINITY,this.$i=_=>Promise.resolve(),!Tc.C())throw new x(S.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new Dv(this,i),this.Ui=t+$v,this.serializer=new np(u),this.Ki=new Ot(this.Ui,this.Bi,new zv(this.serializer)),this.Pi=new Ev,this.Ti=new Sv(this.referenceDelegate,this.serializer),this.remoteDocumentCache=mp(this.serializer),this.Ei=new Iv,this.window&&this.window.localStorage?this.Wi=this.window.localStorage:(this.Wi=null,f===!1&&De(At,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.Gi().then(()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new x(S.FAILED_PRECONDITION,ta);return this.zi(),this.ji(),this.Hi(),this.runTransaction("getHighestListenSequenceNumber","readonly",e=>this.Ti.getHighestSequenceNumber(e))}).then(e=>{this.li=new Be(e,this.Oi)}).then(()=>{this.hi=!0}).catch(e=>(this.Ki&&this.Ki.close(),Promise.reject(e)))}Ji(e){return this.$i=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.Ki.U(async t=>{t.newVersion===null&&await e()})}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.xi.enqueueAndForget(async()=>{this.started&&await this.Gi()}))}Gi(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",e=>ns(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next(()=>{if(this.isPrimary)return this.Yi(e).next(t=>{t||(this.isPrimary=!1,this.xi.enqueueRetryable(()=>this.$i(!1)))})}).next(()=>this.Zi(e)).next(t=>this.isPrimary&&!t?this.Xi(e).next(()=>!1):!!t&&this.es(e).next(()=>!0))).catch(e=>{if(qt(e))return V(At,"Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return V(At,"Releasing owner lease after error during lease refresh",e),!1}).then(e=>{this.isPrimary!==e&&this.xi.enqueueRetryable(()=>this.$i(e)),this.isPrimary=e})}Yi(e){return Nr(e).get(bn).next(t=>w.resolve(this.ts(t)))}ns(e){return ns(e).delete(this.clientId)}async rs(){if(this.isPrimary&&!this.ss(this.Qi,Zo)){this.Qi=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",t=>{const n=pe(t,Yn);return n.J().next(i=>{const s=this._s(i,Zo),o=i.filter(c=>s.indexOf(c)===-1);return w.forEach(o,c=>n.delete(c.clientId)).next(()=>o)})}).catch(()=>[]);if(this.Wi)for(const t of e)this.Wi.removeItem(this.us(t.clientId))}}Hi(){this.qi=this.xi.enqueueAfterDelay("client_metadata_refresh",4e3,()=>this.Gi().then(()=>this.rs()).then(()=>this.Hi()))}ts(e){return!!e&&e.ownerId===this.clientId}Zi(e){return this.Ni?w.resolve(!0):Nr(e).get(bn).next(t=>{if(t!==null&&this.ss(t.leaseTimestampMs,ea)&&!this.cs(t.ownerId)){if(this.ts(t)&&this.networkEnabled)return!0;if(!this.ts(t)){if(!t.allowTabSynchronization)throw new x(S.FAILED_PRECONDITION,ta);return!1}}return!(!this.networkEnabled||!this.inForeground)||ns(e).J().next(n=>this._s(n,ea).find(i=>{if(this.clientId!==i.clientId){const s=!this.networkEnabled&&i.networkEnabled,o=!this.inForeground&&i.inForeground,c=this.networkEnabled===i.networkEnabled;if(s||o&&c)return!0}return!1})===void 0)}).next(t=>(this.isPrimary!==t&&V(At,`Client ${t?"is":"is not"} eligible for a primary lease.`),t))}async shutdown(){this.hi=!1,this.ls(),this.qi&&(this.qi.cancel(),this.qi=null),this.hs(),this.Ps(),await this.Ki.runTransaction("shutdown","readwrite",[Ii,Yn],e=>{const t=new ya(e,Be.le);return this.Xi(t).next(()=>this.ns(t))}),this.Ki.close(),this.Ts()}_s(e,t){return e.filter(n=>this.ss(n.updateTimeMs,t)&&!this.cs(n.clientId))}Is(){return this.runTransaction("getActiveClients","readonly",e=>ns(e).J().next(t=>this._s(t,Zo).map(n=>n.clientId)))}get started(){return this.hi}getGlobalsCache(){return this.Pi}getMutationQueue(e,t){return ao.bt(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.Ti}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new Pv(e,this.serializer.wt.databaseId)}getDocumentOverlayCache(e){return oo.bt(this.serializer,e)}getBundleCache(){return this.Ei}runTransaction(e,t,n){V(At,"Starting transaction:",e);const i=t==="readonly"?"readonly":"readwrite",s=function(u){return u===18?bE:u===17?uf:u===16?RE:u===15?ac:u===14?cf:u===13?af:u===12?AE:u===11?of:void M(60245)}(this.Bi);let o;return this.Ki.runTransaction(e,i,s,c=>(o=new ya(c,this.li?this.li.next():Be.le),t==="readwrite-primary"?this.Yi(o).next(u=>!!u||this.Zi(o)).next(u=>{if(!u)throw De(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.xi.enqueueRetryable(()=>this.$i(!1)),new x(S.FAILED_PRECONDITION,Yd);return n(o)}).next(u=>this.es(o).next(()=>u)):this.Es(o).next(()=>n(o)))).then(c=>(o.raiseOnCommittedEvent(),c))}Es(e){return Nr(e).get(bn).next(t=>{if(t!==null&&this.ss(t.leaseTimestampMs,ea)&&!this.cs(t.ownerId)&&!this.ts(t)&&!(this.Ni||this.allowTabSynchronization&&t.allowTabSynchronization))throw new x(S.FAILED_PRECONDITION,ta)})}es(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return Nr(e).put(bn,t)}static C(){return Ot.C()}Xi(e){const t=Nr(e);return t.get(bn).next(n=>this.ts(n)?(V(At,"Releasing primary lease."),t.delete(bn)):w.resolve())}ss(e,t){const n=Date.now();return!(e<n-t)&&(!(e>n)||(De(`Detected an update time that is in the future: ${e} > ${n}`),!1))}zi(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.ki=()=>{this.xi.enqueueAndForget(()=>(this.inForeground=this.document.visibilityState==="visible",this.Gi()))},this.document.addEventListener("visibilitychange",this.ki),this.inForeground=this.document.visibilityState==="visible")}hs(){this.ki&&(this.document.removeEventListener("visibilitychange",this.ki),this.ki=null)}ji(){var e;typeof((e=this.window)===null||e===void 0?void 0:e.addEventListener)=="function"&&(this.Li=()=>{this.ls();const t=/(?:Version|Mobile)\/1[456]/;Yh()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.xi.enterRestrictedMode(!0),this.xi.enqueueAndForget(()=>this.shutdown())},this.window.addEventListener("pagehide",this.Li))}Ps(){this.Li&&(this.window.removeEventListener("pagehide",this.Li),this.Li=null)}cs(e){var t;try{const n=((t=this.Wi)===null||t===void 0?void 0:t.getItem(this.us(e)))!==null;return V(At,`Client '${e}' ${n?"is":"is not"} zombied in LocalStorage`),n}catch(n){return De(At,"Failed to get zombied client id.",n),!1}}ls(){if(this.Wi)try{this.Wi.setItem(this.us(this.clientId),String(Date.now()))}catch(e){De("Failed to set zombie client id.",e)}}Ts(){if(this.Wi)try{this.Wi.removeItem(this.us(this.clientId))}catch{}}us(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function Nr(r){return pe(r,Ii)}function ns(r){return pe(r,Yn)}function Kv(r,e){let t=r.projectId;return r.isDefaultDatabase||(t+="."+r.database),"firestore/"+e+"/"+t+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wc{constructor(e,t,n,i){this.targetId=e,this.fromCache=t,this.ds=n,this.As=i}static Rs(e,t){let n=K(),i=K();for(const s of t.docChanges)switch(s.type){case 0:n=n.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new wc(e,t.fromCache,n,i)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gv{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _p{constructor(){this.Vs=!1,this.fs=!1,this.gs=100,this.ps=function(){return Yh()?8:Xd(fe())>0?6:4}()}initialize(e,t){this.ys=e,this.indexManager=t,this.Vs=!0}getDocumentsMatchingQuery(e,t,n,i){const s={result:null};return this.ws(e,t).next(o=>{s.result=o}).next(()=>{if(!s.result)return this.bs(e,t,i,n).next(o=>{s.result=o})}).next(()=>{if(s.result)return;const o=new Gv;return this.Ss(e,t,o).next(c=>{if(s.result=c,this.fs)return this.Ds(e,t,o,c.size)})}).next(()=>s.result)}Ds(e,t,n,i){return n.documentReadCount<this.gs?(kn()<=W.DEBUG&&V("QueryEngine","SDK will not create cache indexes for query:",Nn(t),"since it only creates cache indexes for collection contains","more than or equal to",this.gs,"documents"),w.resolve()):(kn()<=W.DEBUG&&V("QueryEngine","Query:",Nn(t),"scans",n.documentReadCount,"local documents and returns",i,"documents as results."),n.documentReadCount>this.ps*i?(kn()<=W.DEBUG&&V("QueryEngine","The SDK decides to create cache indexes for query:",Nn(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,qe(t))):w.resolve())}ws(e,t){if(jl(t))return w.resolve(null);let n=qe(t);return this.indexManager.getIndexType(e,n).next(i=>i===0?null:(t.limit!==null&&i===1&&(t=Ra(t,null,"F"),n=qe(t)),this.indexManager.getDocumentsMatchingTarget(e,n).next(s=>{const o=K(...s);return this.ys.getDocuments(e,o).next(c=>this.indexManager.getMinOffset(e,n).next(u=>{const h=this.vs(t,c);return this.Cs(t,h,o,u.readTime)?this.ws(e,Ra(t,null,"F")):this.Fs(e,h,t,u)}))})))}bs(e,t,n,i){return jl(t)||i.isEqual(q.min())?w.resolve(null):this.ys.getDocuments(e,n).next(s=>{const o=this.vs(t,s);return this.Cs(t,o,n,i)?w.resolve(null):(kn()<=W.DEBUG&&V("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),Nn(t)),this.Fs(e,o,t,QI(i,Zr)).next(c=>c))})}vs(e,t){let n=new te(Cf(e));return t.forEach((i,s)=>{vi(e,s)&&(n=n.add(s))}),n}Cs(e,t,n,i){if(e.limit===null)return!1;if(n.size!==t.size)return!0;const s=e.limitType==="F"?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}Ss(e,t,n){return kn()<=W.DEBUG&&V("QueryEngine","Using full collection scan to execute query:",Nn(t)),this.ys.getDocumentsMatchingQuery(e,t,Le.min(),n)}Fs(e,t,n,i){return this.ys.getDocumentsMatchingQuery(e,n,i).next(s=>(t.forEach(o=>{s=s.insert(o.key,o)}),s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ac="LocalStore",Hv=3e8;class Wv{constructor(e,t,n,i){this.persistence=e,this.Ms=t,this.serializer=i,this.xs=new ce(j),this.Os=new mt(s=>pn(s),Ei),this.Ns=new Map,this.Bs=e.getRemoteDocumentCache(),this.Ti=e.getTargetCache(),this.Ei=e.getBundleCache(),this.Ls(n)}Ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new gp(this.Bs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Bs.setIndexManager(this.indexManager),this.Ms.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.xs))}}function yp(r,e,t,n){return new Wv(r,e,t,n)}async function Ip(r,e){const t=z(r);return await t.persistence.runTransaction("Handle user change","readonly",n=>{let i;return t.mutationQueue.getAllMutationBatches(n).next(s=>(i=s,t.Ls(e),t.mutationQueue.getAllMutationBatches(n))).next(s=>{const o=[],c=[];let u=K();for(const h of i){o.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}for(const h of s){c.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}return t.localDocuments.getDocuments(n,u).next(h=>({ks:h,removedBatchIds:o,addedBatchIds:c}))})})}function Qv(r,e){const t=z(r);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",n=>{const i=e.batch.keys(),s=t.Bs.newChangeBuffer({trackRemovals:!0});return function(c,u,h,f){const m=h.batch,_=m.keys();let b=w.resolve();return _.forEach(C=>{b=b.next(()=>f.getEntry(u,C)).next(k=>{const D=h.docVersions.get(C);U(D!==null,48541),k.version.compareTo(D)<0&&(m.applyToRemoteDocument(k,h),k.isValidDocument()&&(k.setReadTime(h.commitVersion),f.addEntry(k)))})}),b.next(()=>c.mutationQueue.removeMutationBatch(u,m))}(t,n,e,s).next(()=>s.apply(n)).next(()=>t.mutationQueue.performConsistencyCheck(n)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(n,i,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,function(c){let u=K();for(let h=0;h<c.mutationResults.length;++h)c.mutationResults[h].transformResults.length>0&&(u=u.add(c.batch.mutations[h].key));return u}(e))).next(()=>t.localDocuments.getDocuments(n,i))})}function Ep(r){const e=z(r);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ti.getLastRemoteSnapshotVersion(t))}function Yv(r,e){const t=z(r),n=e.snapshotVersion;let i=t.xs;return t.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{const o=t.Bs.newChangeBuffer({trackRemovals:!0});i=t.xs;const c=[];e.targetChanges.forEach((f,m)=>{const _=i.get(m);if(!_)return;c.push(t.Ti.removeMatchingKeys(s,f.removedDocuments,m).next(()=>t.Ti.addMatchingKeys(s,f.addedDocuments,m)));let b=_.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(m)!==null?b=b.withResumeToken(he.EMPTY_BYTE_STRING,q.min()).withLastLimboFreeSnapshotVersion(q.min()):f.resumeToken.approximateByteSize()>0&&(b=b.withResumeToken(f.resumeToken,n)),i=i.insert(m,b),function(k,D,$){return k.resumeToken.approximateByteSize()===0||D.snapshotVersion.toMicroseconds()-k.snapshotVersion.toMicroseconds()>=Hv?!0:$.addedDocuments.size+$.modifiedDocuments.size+$.removedDocuments.size>0}(_,b,f)&&c.push(t.Ti.updateTargetData(s,b))});let u=Me(),h=K();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(s,f))}),c.push(Jv(s,o,e.documentUpdates).next(f=>{u=f.qs,h=f.Qs})),!n.isEqual(q.min())){const f=t.Ti.getLastRemoteSnapshotVersion(s).next(m=>t.Ti.setTargetsMetadata(s,s.currentSequenceNumber,n));c.push(f)}return w.waitFor(c).next(()=>o.apply(s)).next(()=>t.localDocuments.getLocalViewOfDocuments(s,u,h)).next(()=>u)}).then(s=>(t.xs=i,s))}function Jv(r,e,t){let n=K(),i=K();return t.forEach(s=>n=n.add(s)),e.getEntries(r,n).next(s=>{let o=Me();return t.forEach((c,u)=>{const h=s.get(c);u.isFoundDocument()!==h.isFoundDocument()&&(i=i.add(c)),u.isNoDocument()&&u.version.isEqual(q.min())?(e.removeEntry(c,u.readTime),o=o.insert(c,u)):!h.isValidDocument()||u.version.compareTo(h.version)>0||u.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(u),o=o.insert(c,u)):V(Ac,"Ignoring outdated watch update for ",c,". Current version:",h.version," Watch version:",u.version)}),{qs:o,Qs:i}})}function Xv(r,e){const t=z(r);return t.persistence.runTransaction("Get next mutation batch","readonly",n=>(e===void 0&&(e=sn),t.mutationQueue.getNextMutationBatchAfterBatchId(n,e)))}function Zv(r,e){const t=z(r);return t.persistence.runTransaction("Allocate target","readwrite",n=>{let i;return t.Ti.getTargetData(n,e).next(s=>s?(i=s,w.resolve(i)):t.Ti.allocateTargetId(n).next(o=>(i=new ot(e,o,"TargetPurposeListen",n.currentSequenceNumber),t.Ti.addTargetData(n,i).next(()=>i))))}).then(n=>{const i=t.xs.get(n.targetId);return(i===null||n.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(t.xs=t.xs.insert(n.targetId,n),t.Os.set(e,n.targetId)),n})}async function Na(r,e,t){const n=z(r),i=n.xs.get(e),s=t?"readwrite":"readwrite-primary";try{t||await n.persistence.runTransaction("Release target",s,o=>n.persistence.referenceDelegate.removeTarget(o,i))}catch(o){if(!qt(o))throw o;V(Ac,`Failed to update sequence numbers for target ${e}: ${o}`)}n.xs=n.xs.remove(e),n.Os.delete(i.target)}function Ih(r,e,t){const n=z(r);let i=q.min(),s=K();return n.persistence.runTransaction("Execute query","readwrite",o=>function(u,h,f){const m=z(u),_=m.Os.get(f);return _!==void 0?w.resolve(m.xs.get(_)):m.Ti.getTargetData(h,f)}(n,o,qe(e)).next(c=>{if(c)return i=c.lastLimboFreeSnapshotVersion,n.Ti.getMatchingKeysForTargetId(o,c.targetId).next(u=>{s=u})}).next(()=>n.Ms.getDocumentsMatchingQuery(o,e,t?i:q.min(),t?s:K())).next(c=>(eT(n,qE(e),c),{documents:c,$s:s})))}function eT(r,e,t){let n=r.Ns.get(e)||q.min();t.forEach((i,s)=>{s.readTime.compareTo(n)>0&&(n=s.readTime)}),r.Ns.set(e,n)}class Eh{constructor(){this.activeTargetIds=HE()}js(e){this.activeTargetIds=this.activeTargetIds.add(e)}Hs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}zs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class vp{constructor(){this.xo=new Eh,this.Oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.xo.js(e),this.Oo[e]||"not-current"}updateQueryState(e,t,n){this.Oo[e]=t}removeLocalQueryTarget(e){this.xo.Hs(e)}isLocalQueryTarget(e){return this.xo.activeTargetIds.has(e)}clearQueryState(e){delete this.Oo[e]}getAllActiveQueryTargets(){return this.xo.activeTargetIds}isActiveQueryTarget(e){return this.xo.activeTargetIds.has(e)}start(){return this.xo=new Eh,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tT{No(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vh="ConnectivityMonitor";class Th{constructor(){this.Bo=()=>this.Lo(),this.ko=()=>this.qo(),this.Qo=[],this.$o()}No(e){this.Qo.push(e)}shutdown(){window.removeEventListener("online",this.Bo),window.removeEventListener("offline",this.ko)}$o(){window.addEventListener("online",this.Bo),window.addEventListener("offline",this.ko)}Lo(){V(vh,"Network connectivity changed: AVAILABLE");for(const e of this.Qo)e(0)}qo(){V(vh,"Network connectivity changed: UNAVAILABLE");for(const e of this.Qo)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let rs=null;function xa(){return rs===null?rs=function(){return 268435456+Math.round(2147483648*Math.random())}():rs++,"0x"+rs.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const na="RestConnection",nT={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class rT{get Uo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Ko=t+"://"+e.host,this.Wo=`projects/${n}/databases/${i}`,this.Go=this.databaseId.database===Ds?`project_id=${n}`:`project_id=${n}&database_id=${i}`}zo(e,t,n,i,s){const o=xa(),c=this.jo(e,t.toUriEncodedString());V(na,`Sending RPC '${e}' ${o}:`,c,n);const u={"google-cloud-resource-prefix":this.Wo,"x-goog-request-params":this.Go};this.Ho(u,i,s);const{host:h}=new URL(c),f=di(h);return this.Jo(e,c,u,n,f).then(m=>(V(na,`Received RPC '${e}' ${o}: `,m),m),m=>{throw Kn(na,`RPC '${e}' ${o} failed with error: `,m,"url: ",c,"request:",n),m})}Yo(e,t,n,i,s,o){return this.zo(e,t,n,i,s)}Ho(e,t,n){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+cr}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((i,s)=>e[s]=i),n&&n.headers.forEach((i,s)=>e[s]=i)}jo(e,t){const n=nT[e];return`${this.Ko}/v1/${t}:${n}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iT{constructor(e){this.Zo=e.Zo,this.Xo=e.Xo}e_(e){this.t_=e}n_(e){this.r_=e}i_(e){this.s_=e}onMessage(e){this.o_=e}close(){this.Xo()}send(e){this.Zo(e)}__(){this.t_()}a_(){this.r_()}u_(e){this.s_(e)}c_(e){this.o_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Te="WebChannelConnection";class sT extends rT{constructor(e){super(e),this.l_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}Jo(e,t,n,i,s){const o=xa();return new Promise((c,u)=>{const h=new Bd;h.setWithCredentials(!0),h.listenOnce(qd.COMPLETE,()=>{try{switch(h.getLastErrorCode()){case cs.NO_ERROR:const m=h.getResponseJson();V(Te,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(m)),c(m);break;case cs.TIMEOUT:V(Te,`RPC '${e}' ${o} timed out`),u(new x(S.DEADLINE_EXCEEDED,"Request time out"));break;case cs.HTTP_ERROR:const _=h.getStatus();if(V(Te,`RPC '${e}' ${o} failed with status:`,_,"response text:",h.getResponseText()),_>0){let b=h.getResponseJson();Array.isArray(b)&&(b=b[0]);const C=b==null?void 0:b.error;if(C&&C.status&&C.message){const k=function($){const B=$.toLowerCase().replace(/_/g,"-");return Object.values(S).indexOf(B)>=0?B:S.UNKNOWN}(C.status);u(new x(k,C.message))}else u(new x(S.UNKNOWN,"Server responded with status "+h.getStatus()))}else u(new x(S.UNAVAILABLE,"Connection failed."));break;default:M(9055,{h_:e,streamId:o,P_:h.getLastErrorCode(),T_:h.getLastError()})}}finally{V(Te,`RPC '${e}' ${o} completed.`)}});const f=JSON.stringify(i);V(Te,`RPC '${e}' ${o} sending request:`,i),h.send(t,"POST",f,n,15)})}I_(e,t,n){const i=xa(),s=[this.Ko,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=$d(),c=zd(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(u.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Ho(u.initMessageHeaders,t,n),u.encodeInitMessageHeaders=!0;const f=s.join("");V(Te,`Creating RPC '${e}' stream ${i}: ${f}`,u);const m=o.createWebChannel(f,u);this.E_(m);let _=!1,b=!1;const C=new iT({Zo:D=>{b?V(Te,`Not sending because RPC '${e}' stream ${i} is closed:`,D):(_||(V(Te,`Opening RPC '${e}' stream ${i} transport.`),m.open(),_=!0),V(Te,`RPC '${e}' stream ${i} sending:`,D),m.send(D))},Xo:()=>m.close()}),k=(D,$,B)=>{D.listen($,L=>{try{B(L)}catch(H){setTimeout(()=>{throw H},0)}})};return k(m,Mr.EventType.OPEN,()=>{b||(V(Te,`RPC '${e}' stream ${i} transport opened.`),C.__())}),k(m,Mr.EventType.CLOSE,()=>{b||(b=!0,V(Te,`RPC '${e}' stream ${i} transport closed`),C.u_(),this.d_(m))}),k(m,Mr.EventType.ERROR,D=>{b||(b=!0,Kn(Te,`RPC '${e}' stream ${i} transport errored. Name:`,D.name,"Message:",D.message),C.u_(new x(S.UNAVAILABLE,"The operation could not be completed")))}),k(m,Mr.EventType.MESSAGE,D=>{var $;if(!b){const B=D.data[0];U(!!B,16349);const L=B,H=(L==null?void 0:L.error)||(($=L[0])===null||$===void 0?void 0:$.error);if(H){V(Te,`RPC '${e}' stream ${i} received error:`,H);const Z=H.status;let G=function(I){const v=de[I];if(v!==void 0)return jf(v)}(Z),E=H.message;G===void 0&&(G=S.INTERNAL,E="Unknown error status: "+Z+" with message "+H.message),b=!0,C.u_(new x(G,E)),m.close()}else V(Te,`RPC '${e}' stream ${i} received:`,B),C.c_(B)}}),k(c,jd.STAT_EVENT,D=>{D.stat===da.PROXY?V(Te,`RPC '${e}' stream ${i} detected buffering proxy`):D.stat===da.NOPROXY&&V(Te,`RPC '${e}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{C.a_()},0),C}terminate(){this.l_.forEach(e=>e.close()),this.l_=[]}E_(e){this.l_.push(e)}d_(e){this.l_=this.l_.filter(t=>t===e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oT(){return typeof window<"u"?window:null}function ys(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uo(r){return new cv(r,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tp{constructor(e,t,n=1e3,i=1.5,s=6e4){this.xi=e,this.timerId=t,this.A_=n,this.R_=i,this.V_=s,this.m_=0,this.f_=null,this.g_=Date.now(),this.reset()}reset(){this.m_=0}p_(){this.m_=this.V_}y_(e){this.cancel();const t=Math.floor(this.m_+this.w_()),n=Math.max(0,Date.now()-this.g_),i=Math.max(0,t-n);i>0&&V("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.m_} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.f_=this.xi.enqueueAfterDelay(this.timerId,i,()=>(this.g_=Date.now(),e())),this.m_*=this.R_,this.m_<this.A_&&(this.m_=this.A_),this.m_>this.V_&&(this.m_=this.V_)}b_(){this.f_!==null&&(this.f_.skipDelay(),this.f_=null)}cancel(){this.f_!==null&&(this.f_.cancel(),this.f_=null)}w_(){return(Math.random()-.5)*this.m_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wh="PersistentStream";class wp{constructor(e,t,n,i,s,o,c,u){this.xi=e,this.S_=n,this.D_=i,this.connection=s,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=c,this.listener=u,this.state=0,this.v_=0,this.C_=null,this.F_=null,this.stream=null,this.M_=0,this.x_=new Tp(e,t)}O_(){return this.state===1||this.state===5||this.N_()}N_(){return this.state===2||this.state===3}start(){this.M_=0,this.state!==4?this.auth():this.B_()}async stop(){this.O_()&&await this.close(0)}L_(){this.state=0,this.x_.reset()}k_(){this.N_()&&this.C_===null&&(this.C_=this.xi.enqueueAfterDelay(this.S_,6e4,()=>this.q_()))}Q_(e){this.U_(),this.stream.send(e)}async q_(){if(this.N_())return this.close(0)}U_(){this.C_&&(this.C_.cancel(),this.C_=null)}K_(){this.F_&&(this.F_.cancel(),this.F_=null)}async close(e,t){this.U_(),this.K_(),this.x_.cancel(),this.v_++,e!==4?this.x_.reset():t&&t.code===S.RESOURCE_EXHAUSTED?(De(t.toString()),De("Using maximum backoff delay to prevent overloading the backend."),this.x_.p_()):t&&t.code===S.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.i_(t)}W_(){}auth(){this.state=1;const e=this.G_(this.v_),t=this.v_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([n,i])=>{this.v_===t&&this.z_(n,i)},n=>{e(()=>{const i=new x(S.UNKNOWN,"Fetching auth token failed: "+n.message);return this.j_(i)})})}z_(e,t){const n=this.G_(this.v_);this.stream=this.H_(e,t),this.stream.e_(()=>{n(()=>this.listener.e_())}),this.stream.n_(()=>{n(()=>(this.state=2,this.F_=this.xi.enqueueAfterDelay(this.D_,1e4,()=>(this.N_()&&(this.state=3),Promise.resolve())),this.listener.n_()))}),this.stream.i_(i=>{n(()=>this.j_(i))}),this.stream.onMessage(i=>{n(()=>++this.M_==1?this.J_(i):this.onNext(i))})}B_(){this.state=5,this.x_.y_(async()=>{this.state=0,this.start()})}j_(e){return V(wh,`close with error: ${e}`),this.stream=null,this.close(4,e)}G_(e){return t=>{this.xi.enqueueAndForget(()=>this.v_===e?t():(V(wh,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class aT extends wp{constructor(e,t,n,i,s,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,i,o),this.serializer=s}H_(e,t){return this.connection.I_("Listen",e,t)}J_(e){return this.onNext(e)}onNext(e){this.x_.reset();const t=hv(this.serializer,e),n=function(s){if(!("targetChange"in s))return q.min();const o=s.targetChange;return o.targetIds&&o.targetIds.length?q.min():o.readTime?ke(o.readTime):q.min()}(e);return this.listener.Y_(t,n)}Z_(e){const t={};t.database=Sa(this.serializer),t.addTarget=function(s,o){let c;const u=o.target;if(c=ks(u)?{documents:Yf(s,u)}:{query:Jf(s,u).gt},c.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){c.resumeToken=Kf(s,o.resumeToken);const h=ba(s,o.expectedCount);h!==null&&(c.expectedCount=h)}else if(o.snapshotVersion.compareTo(q.min())>0){c.readTime=ir(s,o.snapshotVersion.toTimestamp());const h=ba(s,o.expectedCount);h!==null&&(c.expectedCount=h)}return c}(this.serializer,e);const n=fv(this.serializer,e);n&&(t.labels=n),this.Q_(t)}X_(e){const t={};t.database=Sa(this.serializer),t.removeTarget=e,this.Q_(t)}}class cT extends wp{constructor(e,t,n,i,s,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,i,o),this.serializer=s}get ea(){return this.M_>0}start(){this.lastStreamToken=void 0,super.start()}W_(){this.ea&&this.ta([])}H_(e,t){return this.connection.I_("Write",e,t)}J_(e){return U(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,U(!e.writeResults||e.writeResults.length===0,55816),this.listener.na()}onNext(e){U(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.x_.reset();const t=dv(e.writeResults,e.commitTime),n=ke(e.commitTime);return this.listener.ra(n,t)}ia(){const e={};e.database=Sa(this.serializer),this.Q_(e)}ta(e){const t={streamToken:this.lastStreamToken,writes:e.map(n=>Os(this.serializer,n))};this.Q_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uT{}class lT extends uT{constructor(e,t,n,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=i,this.sa=!1}oa(){if(this.sa)throw new x(S.FAILED_PRECONDITION,"The client has already been terminated.")}zo(e,t,n,i){return this.oa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,o])=>this.connection.zo(e,Pa(t,n),i,s,o)).catch(s=>{throw s.name==="FirebaseError"?(s.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new x(S.UNKNOWN,s.toString())})}Yo(e,t,n,i,s){return this.oa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,c])=>this.connection.Yo(e,Pa(t,n),i,o,c,s)).catch(o=>{throw o.name==="FirebaseError"?(o.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new x(S.UNKNOWN,o.toString())})}terminate(){this.sa=!0,this.connection.terminate()}}class hT{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this._a=0,this.aa=null,this.ua=!0}ca(){this._a===0&&(this.la("Unknown"),this.aa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.aa=null,this.ha("Backend didn't respond within 10 seconds."),this.la("Offline"),Promise.resolve())))}Pa(e){this.state==="Online"?this.la("Unknown"):(this._a++,this._a>=1&&(this.Ta(),this.ha(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.la("Offline")))}set(e){this.Ta(),this._a=0,e==="Online"&&(this.ua=!1),this.la(e)}la(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ha(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.ua?(De(t),this.ua=!1):V("OnlineStateTracker",t)}Ta(){this.aa!==null&&(this.aa.cancel(),this.aa=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yn="RemoteStore";class dT{constructor(e,t,n,i,s){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.Ia=[],this.Ea=new Map,this.da=new Set,this.Aa=[],this.Ra=s,this.Ra.No(o=>{n.enqueueAndForget(async()=>{vn(this)&&(V(yn,"Restarting streams for network reachability change."),await async function(u){const h=z(u);h.da.add(4),await wi(h),h.Va.set("Unknown"),h.da.delete(4),await lo(h)}(this))})}),this.Va=new hT(n,i)}}async function lo(r){if(vn(r))for(const e of r.Aa)await e(!0)}async function wi(r){for(const e of r.Aa)await e(!1)}function Ap(r,e){const t=z(r);t.Ea.has(e.targetId)||(t.Ea.set(e.targetId,e),Sc(t)?Pc(t):hr(t).N_()&&bc(t,e))}function Rc(r,e){const t=z(r),n=hr(t);t.Ea.delete(e),n.N_()&&Rp(t,e),t.Ea.size===0&&(n.N_()?n.k_():vn(t)&&t.Va.set("Unknown"))}function bc(r,e){if(r.ma.Ke(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(q.min())>0){const t=r.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}hr(r).Z_(e)}function Rp(r,e){r.ma.Ke(e),hr(r).X_(e)}function Pc(r){r.ma=new iv({getRemoteKeysForTarget:e=>r.remoteSyncer.getRemoteKeysForTarget(e),Rt:e=>r.Ea.get(e)||null,Pt:()=>r.datastore.serializer.databaseId}),hr(r).start(),r.Va.ca()}function Sc(r){return vn(r)&&!hr(r).O_()&&r.Ea.size>0}function vn(r){return z(r).da.size===0}function bp(r){r.ma=void 0}async function fT(r){r.Va.set("Online")}async function pT(r){r.Ea.forEach((e,t)=>{bc(r,e)})}async function mT(r,e){bp(r),Sc(r)?(r.Va.Pa(e),Pc(r)):r.Va.set("Unknown")}async function gT(r,e,t){if(r.Va.set("Online"),e instanceof $f&&e.state===2&&e.cause)try{await async function(i,s){const o=s.cause;for(const c of s.targetIds)i.Ea.has(c)&&(await i.remoteSyncer.rejectListen(c,o),i.Ea.delete(c),i.ma.removeTarget(c))}(r,e)}catch(n){V(yn,"Failed to remove targets %s: %s ",e.targetIds.join(","),n),await Bs(r,n)}else if(e instanceof gs?r.ma.Xe(e):e instanceof zf?r.ma.ot(e):r.ma.nt(e),!t.isEqual(q.min()))try{const n=await Ep(r.localStore);t.compareTo(n)>=0&&await function(s,o){const c=s.ma.It(o);return c.targetChanges.forEach((u,h)=>{if(u.resumeToken.approximateByteSize()>0){const f=s.Ea.get(h);f&&s.Ea.set(h,f.withResumeToken(u.resumeToken,o))}}),c.targetMismatches.forEach((u,h)=>{const f=s.Ea.get(u);if(!f)return;s.Ea.set(u,f.withResumeToken(he.EMPTY_BYTE_STRING,f.snapshotVersion)),Rp(s,u);const m=new ot(f.target,u,h,f.sequenceNumber);bc(s,m)}),s.remoteSyncer.applyRemoteEvent(c)}(r,t)}catch(n){V(yn,"Failed to raise snapshot:",n),await Bs(r,n)}}async function Bs(r,e,t){if(!qt(e))throw e;r.da.add(1),await wi(r),r.Va.set("Offline"),t||(t=()=>Ep(r.localStore)),r.asyncQueue.enqueueRetryable(async()=>{V(yn,"Retrying IndexedDB access"),await t(),r.da.delete(1),await lo(r)})}function Pp(r,e){return e().catch(t=>Bs(r,t,e))}async function Ai(r){const e=z(r),t=Ut(e);let n=e.Ia.length>0?e.Ia[e.Ia.length-1].batchId:sn;for(;_T(e);)try{const i=await Xv(e.localStore,n);if(i===null){e.Ia.length===0&&t.k_();break}n=i.batchId,yT(e,i)}catch(i){await Bs(e,i)}Sp(e)&&Cp(e)}function _T(r){return vn(r)&&r.Ia.length<10}function yT(r,e){r.Ia.push(e);const t=Ut(r);t.N_()&&t.ea&&t.ta(e.mutations)}function Sp(r){return vn(r)&&!Ut(r).O_()&&r.Ia.length>0}function Cp(r){Ut(r).start()}async function IT(r){Ut(r).ia()}async function ET(r){const e=Ut(r);for(const t of r.Ia)e.ta(t.mutations)}async function vT(r,e,t){const n=r.Ia.shift(),i=pc.from(n,e,t);await Pp(r,()=>r.remoteSyncer.applySuccessfulWrite(i)),await Ai(r)}async function TT(r,e){e&&Ut(r).ea&&await async function(n,i){if(function(o){return nv(o)&&o!==S.ABORTED}(i.code)){const s=n.Ia.shift();Ut(n).L_(),await Pp(n,()=>n.remoteSyncer.rejectFailedWrite(s.batchId,i)),await Ai(n)}}(r,e),Sp(r)&&Cp(r)}async function Ah(r,e){const t=z(r);t.asyncQueue.verifyOperationInProgress(),V(yn,"RemoteStore received new credentials");const n=vn(t);t.da.add(3),await wi(t),n&&t.Va.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.da.delete(3),await lo(t)}async function wT(r,e){const t=z(r);e?(t.da.delete(2),await lo(t)):e||(t.da.add(2),await wi(t),t.Va.set("Unknown"))}function hr(r){return r.fa||(r.fa=function(t,n,i){const s=z(t);return s.oa(),new aT(n,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(r.datastore,r.asyncQueue,{e_:fT.bind(null,r),n_:pT.bind(null,r),i_:mT.bind(null,r),Y_:gT.bind(null,r)}),r.Aa.push(async e=>{e?(r.fa.L_(),Sc(r)?Pc(r):r.Va.set("Unknown")):(await r.fa.stop(),bp(r))})),r.fa}function Ut(r){return r.ga||(r.ga=function(t,n,i){const s=z(t);return s.oa(),new cT(n,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(r.datastore,r.asyncQueue,{e_:()=>Promise.resolve(),n_:IT.bind(null,r),i_:TT.bind(null,r),na:ET.bind(null,r),ra:vT.bind(null,r)}),r.Aa.push(async e=>{e?(r.ga.L_(),await Ai(r)):(await r.ga.stop(),r.Ia.length>0&&(V(yn,`Stopping write stream with ${r.Ia.length} pending writes`),r.Ia=[]))})),r.ga}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cc{constructor(e,t,n,i,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=i,this.removalCallback=s,this.deferred=new Ze,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,i,s){const o=Date.now()+n,c=new Cc(e,t,o,i,s);return c.start(n),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new x(S.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Vc(r,e){if(De("AsyncQueue",`${e}: ${r}`),qt(r))return new x(S.UNAVAILABLE,`${e}: ${r}`);throw r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jn{static emptySet(e){return new jn(e.comparator)}constructor(e){this.comparator=e?(t,n)=>e(t,n)||O.comparator(t.key,n.key):(t,n)=>O.comparator(t.key,n.key),this.keyedMap=Lr(),this.sortedSet=new ce(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,n)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof jn)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=n.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const n=new jn;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rh{constructor(){this.pa=new ce(O.comparator)}track(e){const t=e.doc.key,n=this.pa.get(t);n?e.type!==0&&n.type===3?this.pa=this.pa.insert(t,e):e.type===3&&n.type!==1?this.pa=this.pa.insert(t,{type:n.type,doc:e.doc}):e.type===2&&n.type===2?this.pa=this.pa.insert(t,{type:2,doc:e.doc}):e.type===2&&n.type===0?this.pa=this.pa.insert(t,{type:0,doc:e.doc}):e.type===1&&n.type===0?this.pa=this.pa.remove(t):e.type===1&&n.type===2?this.pa=this.pa.insert(t,{type:1,doc:n.doc}):e.type===0&&n.type===1?this.pa=this.pa.insert(t,{type:2,doc:e.doc}):M(63341,{Vt:e,ya:n}):this.pa=this.pa.insert(t,e)}wa(){const e=[];return this.pa.inorderTraversal((t,n)=>{e.push(n)}),e}}class sr{constructor(e,t,n,i,s,o,c,u,h){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=i,this.mutatedKeys=s,this.fromCache=o,this.syncStateChanged=c,this.excludesMetadataChanges=u,this.hasCachedResults=h}static fromInitialDocuments(e,t,n,i,s){const o=[];return t.forEach(c=>{o.push({type:0,doc:c})}),new sr(e,t,jn.emptySet(t),o,n,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&to(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==n[i].type||!t[i].doc.isEqual(n[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AT{constructor(){this.ba=void 0,this.Sa=[]}Da(){return this.Sa.some(e=>e.va())}}class RT{constructor(){this.queries=bh(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(t,n){const i=z(t),s=i.queries;i.queries=bh(),s.forEach((o,c)=>{for(const u of c.Sa)u.onError(n)})})(this,new x(S.ABORTED,"Firestore shutting down"))}}function bh(){return new mt(r=>Sf(r),to)}async function Vp(r,e){const t=z(r);let n=3;const i=e.query;let s=t.queries.get(i);s?!s.Da()&&e.va()&&(n=2):(s=new AT,n=e.va()?0:1);try{switch(n){case 0:s.ba=await t.onListen(i,!0);break;case 1:s.ba=await t.onListen(i,!1);break;case 2:await t.onFirstRemoteStoreListen(i)}}catch(o){const c=Vc(o,`Initialization of query '${Nn(e.query)}' failed`);return void e.onError(c)}t.queries.set(i,s),s.Sa.push(e),e.Fa(t.onlineState),s.ba&&e.Ma(s.ba)&&Dc(t)}async function Dp(r,e){const t=z(r),n=e.query;let i=3;const s=t.queries.get(n);if(s){const o=s.Sa.indexOf(e);o>=0&&(s.Sa.splice(o,1),s.Sa.length===0?i=e.va()?0:1:!s.Da()&&e.va()&&(i=2))}switch(i){case 0:return t.queries.delete(n),t.onUnlisten(n,!0);case 1:return t.queries.delete(n),t.onUnlisten(n,!1);case 2:return t.onLastRemoteStoreUnlisten(n);default:return}}function bT(r,e){const t=z(r);let n=!1;for(const i of e){const s=i.query,o=t.queries.get(s);if(o){for(const c of o.Sa)c.Ma(i)&&(n=!0);o.ba=i}}n&&Dc(t)}function PT(r,e,t){const n=z(r),i=n.queries.get(e);if(i)for(const s of i.Sa)s.onError(t);n.queries.delete(e)}function Dc(r){r.Ca.forEach(e=>{e.next()})}var Oa,Ph;(Ph=Oa||(Oa={})).xa="default",Ph.Cache="cache";class kp{constructor(e,t,n){this.query=e,this.Oa=t,this.Na=!1,this.Ba=null,this.onlineState="Unknown",this.options=n||{}}Ma(e){if(!this.options.includeMetadataChanges){const n=[];for(const i of e.docChanges)i.type!==3&&n.push(i);e=new sr(e.query,e.docs,e.oldDocs,n,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Na?this.La(e)&&(this.Oa.next(e),t=!0):this.ka(e,this.onlineState)&&(this.qa(e),t=!0),this.Ba=e,t}onError(e){this.Oa.error(e)}Fa(e){this.onlineState=e;let t=!1;return this.Ba&&!this.Na&&this.ka(this.Ba,e)&&(this.qa(this.Ba),t=!0),t}ka(e,t){if(!e.fromCache||!this.va())return!0;const n=t!=="Offline";return(!this.options.Qa||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}La(e){if(e.docChanges.length>0)return!0;const t=this.Ba&&this.Ba.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}qa(e){e=sr.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Na=!0,this.Oa.next(e)}va(){return this.options.source!==Oa.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Np{constructor(e){this.key=e}}class xp{constructor(e){this.key=e}}class ST{constructor(e,t){this.query=e,this.Ha=t,this.Ja=null,this.hasCachedResults=!1,this.current=!1,this.Ya=K(),this.mutatedKeys=K(),this.Za=Cf(e),this.Xa=new jn(this.Za)}get eu(){return this.Ha}tu(e,t){const n=t?t.nu:new Rh,i=t?t.Xa:this.Xa;let s=t?t.mutatedKeys:this.mutatedKeys,o=i,c=!1;const u=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,h=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((f,m)=>{const _=i.get(f),b=vi(this.query,m)?m:null,C=!!_&&this.mutatedKeys.has(_.key),k=!!b&&(b.hasLocalMutations||this.mutatedKeys.has(b.key)&&b.hasCommittedMutations);let D=!1;_&&b?_.data.isEqual(b.data)?C!==k&&(n.track({type:3,doc:b}),D=!0):this.ru(_,b)||(n.track({type:2,doc:b}),D=!0,(u&&this.Za(b,u)>0||h&&this.Za(b,h)<0)&&(c=!0)):!_&&b?(n.track({type:0,doc:b}),D=!0):_&&!b&&(n.track({type:1,doc:_}),D=!0,(u||h)&&(c=!0)),D&&(b?(o=o.add(b),s=k?s.add(f):s.delete(f)):(o=o.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const f=this.query.limitType==="F"?o.last():o.first();o=o.delete(f.key),s=s.delete(f.key),n.track({type:1,doc:f})}return{Xa:o,nu:n,Cs:c,mutatedKeys:s}}ru(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,i){const s=this.Xa;this.Xa=e.Xa,this.mutatedKeys=e.mutatedKeys;const o=e.nu.wa();o.sort((f,m)=>function(b,C){const k=D=>{switch(D){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return M(20277,{Vt:D})}};return k(b)-k(C)}(f.type,m.type)||this.Za(f.doc,m.doc)),this.iu(n),i=i!=null&&i;const c=t&&!i?this.su():[],u=this.Ya.size===0&&this.current&&!i?1:0,h=u!==this.Ja;return this.Ja=u,o.length!==0||h?{snapshot:new sr(this.query,e.Xa,s,o,e.mutatedKeys,u===0,h,!1,!!n&&n.resumeToken.approximateByteSize()>0),ou:c}:{ou:c}}Fa(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Xa:this.Xa,nu:new Rh,mutatedKeys:this.mutatedKeys,Cs:!1},!1)):{ou:[]}}_u(e){return!this.Ha.has(e)&&!!this.Xa.has(e)&&!this.Xa.get(e).hasLocalMutations}iu(e){e&&(e.addedDocuments.forEach(t=>this.Ha=this.Ha.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ha=this.Ha.delete(t)),this.current=e.current)}su(){if(!this.current)return[];const e=this.Ya;this.Ya=K(),this.Xa.forEach(n=>{this._u(n.key)&&(this.Ya=this.Ya.add(n.key))});const t=[];return e.forEach(n=>{this.Ya.has(n)||t.push(new xp(n))}),this.Ya.forEach(n=>{e.has(n)||t.push(new Np(n))}),t}au(e){this.Ha=e.$s,this.Ya=K();const t=this.tu(e.documents);return this.applyChanges(t,!0)}uu(){return sr.fromInitialDocuments(this.query,this.Xa,this.mutatedKeys,this.Ja===0,this.hasCachedResults)}}const kc="SyncEngine";class CT{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class VT{constructor(e){this.key=e,this.cu=!1}}class DT{constructor(e,t,n,i,s,o){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=o,this.lu={},this.hu=new mt(c=>Sf(c),to),this.Pu=new Map,this.Tu=new Set,this.Iu=new ce(O.comparator),this.Eu=new Map,this.du=new Ec,this.Au={},this.Ru=new Map,this.Vu=_n.lr(),this.onlineState="Unknown",this.mu=void 0}get isPrimaryClient(){return this.mu===!0}}async function kT(r,e,t=!0){const n=Bp(r);let i;const s=n.hu.get(e);return s?(n.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.uu()):i=await Op(n,e,t,!0),i}async function NT(r,e){const t=Bp(r);await Op(t,e,!0,!1)}async function Op(r,e,t,n){const i=await Zv(r.localStore,qe(e)),s=i.targetId,o=r.sharedClientState.addLocalQueryTarget(s,t);let c;return n&&(c=await xT(r,e,s,o==="current",i.resumeToken)),r.isPrimaryClient&&t&&Ap(r.remoteStore,i),c}async function xT(r,e,t,n,i){r.fu=(m,_,b)=>async function(k,D,$,B){let L=D.view.tu($);L.Cs&&(L=await Ih(k.localStore,D.query,!1).then(({documents:E})=>D.view.tu(E,L)));const H=B&&B.targetChanges.get(D.targetId),Z=B&&B.targetMismatches.get(D.targetId)!=null,G=D.view.applyChanges(L,k.isPrimaryClient,H,Z);return Ch(k,D.targetId,G.ou),G.snapshot}(r,m,_,b);const s=await Ih(r.localStore,e,!0),o=new ST(e,s.$s),c=o.tu(s.documents),u=Ti.createSynthesizedTargetChangeForCurrentChange(t,n&&r.onlineState!=="Offline",i),h=o.applyChanges(c,r.isPrimaryClient,u);Ch(r,t,h.ou);const f=new CT(e,t,o);return r.hu.set(e,f),r.Pu.has(t)?r.Pu.get(t).push(e):r.Pu.set(t,[e]),h.snapshot}async function OT(r,e,t){const n=z(r),i=n.hu.get(e),s=n.Pu.get(i.targetId);if(s.length>1)return n.Pu.set(i.targetId,s.filter(o=>!to(o,e))),void n.hu.delete(e);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(i.targetId),n.sharedClientState.isActiveQueryTarget(i.targetId)||await Na(n.localStore,i.targetId,!1).then(()=>{n.sharedClientState.clearQueryState(i.targetId),t&&Rc(n.remoteStore,i.targetId),Ma(n,i.targetId)}).catch(En)):(Ma(n,i.targetId),await Na(n.localStore,i.targetId,!0))}async function MT(r,e){const t=z(r),n=t.hu.get(e),i=t.Pu.get(n.targetId);t.isPrimaryClient&&i.length===1&&(t.sharedClientState.removeLocalQueryTarget(n.targetId),Rc(t.remoteStore,n.targetId))}async function LT(r,e,t){const n=qp(r);try{const i=await function(o,c){const u=z(o),h=ae.now(),f=c.reduce((b,C)=>b.add(C.key),K());let m,_;return u.persistence.runTransaction("Locally write mutations","readwrite",b=>{let C=Me(),k=K();return u.Bs.getEntries(b,f).next(D=>{C=D,C.forEach(($,B)=>{B.isValidDocument()||(k=k.add($))})}).next(()=>u.localDocuments.getOverlayedDocuments(b,C)).next(D=>{m=D;const $=[];for(const B of c){const L=ev(B,m.get(B.key).overlayedDocument);L!=null&&$.push(new gt(B.key,L,If(L.value.mapValue),Re.exists(!0)))}return u.mutationQueue.addMutationBatch(b,h,$,c)}).next(D=>{_=D;const $=D.applyToLocalDocumentSet(m,k);return u.documentOverlayCache.saveOverlays(b,D.batchId,$)})}).then(()=>({batchId:_.batchId,changes:Df(m)}))}(n.localStore,e);n.sharedClientState.addPendingMutation(i.batchId),function(o,c,u){let h=o.Au[o.currentUser.toKey()];h||(h=new ce(j)),h=h.insert(c,u),o.Au[o.currentUser.toKey()]=h}(n,i.batchId,t),await Ri(n,i.changes),await Ai(n.remoteStore)}catch(i){const s=Vc(i,"Failed to persist write");t.reject(s)}}async function Mp(r,e){const t=z(r);try{const n=await Yv(t.localStore,e);e.targetChanges.forEach((i,s)=>{const o=t.Eu.get(s);o&&(U(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1,22616),i.addedDocuments.size>0?o.cu=!0:i.modifiedDocuments.size>0?U(o.cu,14607):i.removedDocuments.size>0&&(U(o.cu,42227),o.cu=!1))}),await Ri(t,n,e)}catch(n){await En(n)}}function Sh(r,e,t){const n=z(r);if(n.isPrimaryClient&&t===0||!n.isPrimaryClient&&t===1){const i=[];n.hu.forEach((s,o)=>{const c=o.view.Fa(e);c.snapshot&&i.push(c.snapshot)}),function(o,c){const u=z(o);u.onlineState=c;let h=!1;u.queries.forEach((f,m)=>{for(const _ of m.Sa)_.Fa(c)&&(h=!0)}),h&&Dc(u)}(n.eventManager,e),i.length&&n.lu.Y_(i),n.onlineState=e,n.isPrimaryClient&&n.sharedClientState.setOnlineState(e)}}async function FT(r,e,t){const n=z(r);n.sharedClientState.updateQueryState(e,"rejected",t);const i=n.Eu.get(e),s=i&&i.key;if(s){let o=new ce(O.comparator);o=o.insert(s,le.newNoDocument(s,q.min()));const c=K().add(s),u=new so(q.min(),new Map,new ce(j),o,c);await Mp(n,u),n.Iu=n.Iu.remove(s),n.Eu.delete(e),Nc(n)}else await Na(n.localStore,e,!1).then(()=>Ma(n,e,t)).catch(En)}async function UT(r,e){const t=z(r),n=e.batch.batchId;try{const i=await Qv(t.localStore,e);Fp(t,n,null),Lp(t,n),t.sharedClientState.updateMutationState(n,"acknowledged"),await Ri(t,i)}catch(i){await En(i)}}async function BT(r,e,t){const n=z(r);try{const i=await function(o,c){const u=z(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let f;return u.mutationQueue.lookupMutationBatch(h,c).next(m=>(U(m!==null,37113),f=m.keys(),u.mutationQueue.removeMutationBatch(h,m))).next(()=>u.mutationQueue.performConsistencyCheck(h)).next(()=>u.documentOverlayCache.removeOverlaysForBatchId(h,f,c)).next(()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,f)).next(()=>u.localDocuments.getDocuments(h,f))})}(n.localStore,e);Fp(n,e,t),Lp(n,e),n.sharedClientState.updateMutationState(e,"rejected",t),await Ri(n,i)}catch(i){await En(i)}}function Lp(r,e){(r.Ru.get(e)||[]).forEach(t=>{t.resolve()}),r.Ru.delete(e)}function Fp(r,e,t){const n=z(r);let i=n.Au[n.currentUser.toKey()];if(i){const s=i.get(e);s&&(t?s.reject(t):s.resolve(),i=i.remove(e)),n.Au[n.currentUser.toKey()]=i}}function Ma(r,e,t=null){r.sharedClientState.removeLocalQueryTarget(e);for(const n of r.Pu.get(e))r.hu.delete(n),t&&r.lu.gu(n,t);r.Pu.delete(e),r.isPrimaryClient&&r.du.Hr(e).forEach(n=>{r.du.containsKey(n)||Up(r,n)})}function Up(r,e){r.Tu.delete(e.path.canonicalString());const t=r.Iu.get(e);t!==null&&(Rc(r.remoteStore,t),r.Iu=r.Iu.remove(e),r.Eu.delete(t),Nc(r))}function Ch(r,e,t){for(const n of t)n instanceof Np?(r.du.addReference(n.key,e),qT(r,n)):n instanceof xp?(V(kc,"Document no longer in limbo: "+n.key),r.du.removeReference(n.key,e),r.du.containsKey(n.key)||Up(r,n.key)):M(19791,{pu:n})}function qT(r,e){const t=e.key,n=t.path.canonicalString();r.Iu.get(t)||r.Tu.has(n)||(V(kc,"New document in limbo: "+t),r.Tu.add(n),Nc(r))}function Nc(r){for(;r.Tu.size>0&&r.Iu.size<r.maxConcurrentLimboResolutions;){const e=r.Tu.values().next().value;r.Tu.delete(e);const t=new O(X.fromString(e)),n=r.Vu.next();r.Eu.set(n,new VT(t)),r.Iu=r.Iu.insert(t,n),Ap(r.remoteStore,new ot(qe(eo(t.path)),n,"TargetPurposeLimboResolution",Be.le))}}async function Ri(r,e,t){const n=z(r),i=[],s=[],o=[];n.hu.isEmpty()||(n.hu.forEach((c,u)=>{o.push(n.fu(u,e,t).then(h=>{var f;if((h||t)&&n.isPrimaryClient){const m=h?!h.fromCache:(f=t==null?void 0:t.targetChanges.get(u.targetId))===null||f===void 0?void 0:f.current;n.sharedClientState.updateQueryState(u.targetId,m?"current":"not-current")}if(h){i.push(h);const m=wc.Rs(u.targetId,h);s.push(m)}}))}),await Promise.all(o),n.lu.Y_(i),await async function(u,h){const f=z(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>w.forEach(h,_=>w.forEach(_.ds,b=>f.persistence.referenceDelegate.addReference(m,_.targetId,b)).next(()=>w.forEach(_.As,b=>f.persistence.referenceDelegate.removeReference(m,_.targetId,b)))))}catch(m){if(!qt(m))throw m;V(Ac,"Failed to update sequence numbers: "+m)}for(const m of h){const _=m.targetId;if(!m.fromCache){const b=f.xs.get(_),C=b.snapshotVersion,k=b.withLastLimboFreeSnapshotVersion(C);f.xs=f.xs.insert(_,k)}}}(n.localStore,s))}async function jT(r,e){const t=z(r);if(!t.currentUser.isEqual(e)){V(kc,"User change. New user:",e.toKey());const n=await Ip(t.localStore,e);t.currentUser=e,function(s,o){s.Ru.forEach(c=>{c.forEach(u=>{u.reject(new x(S.CANCELLED,o))})}),s.Ru.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,n.removedBatchIds,n.addedBatchIds),await Ri(t,n.ks)}}function zT(r,e){const t=z(r),n=t.Eu.get(e);if(n&&n.cu)return K().add(n.key);{let i=K();const s=t.Pu.get(e);if(!s)return i;for(const o of s){const c=t.hu.get(o);i=i.unionWith(c.view.eu)}return i}}function Bp(r){const e=z(r);return e.remoteStore.remoteSyncer.applyRemoteEvent=Mp.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=zT.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=FT.bind(null,e),e.lu.Y_=bT.bind(null,e.eventManager),e.lu.gu=PT.bind(null,e.eventManager),e}function qp(r){const e=z(r);return e.remoteStore.remoteSyncer.applySuccessfulWrite=UT.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=BT.bind(null,e),e}class hi{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=uo(e.databaseInfo.databaseId),this.sharedClientState=this.bu(e),this.persistence=this.Su(e),await this.persistence.start(),this.localStore=this.Du(e),this.gcScheduler=this.vu(e,this.localStore),this.indexBackfillerScheduler=this.Cu(e,this.localStore)}vu(e,t){return null}Cu(e,t){return null}Du(e){return yp(this.persistence,new _p,e.initialUser,this.serializer)}Su(e){return new vc(co.fi,this.serializer)}bu(e){return new vp}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}hi.provider={build:()=>new hi};class $T extends hi{constructor(e){super(),this.cacheSizeBytes=e}vu(e,t){U(this.persistence.referenceDelegate instanceof Us,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new dp(n,e.asyncQueue,t)}Su(e){const t=this.cacheSizeBytes!==void 0?we.withCacheSize(this.cacheSizeBytes):we.DEFAULT;return new vc(n=>Us.fi(n,t),this.serializer)}}class KT extends hi{constructor(e,t,n){super(),this.Fu=e,this.cacheSizeBytes=t,this.forceOwnership=n,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.Fu.initialize(this,e),await qp(this.Fu.syncEngine),await Ai(this.Fu.remoteStore),await this.persistence.Ji(()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve()))}Du(e){return yp(this.persistence,new _p,e.initialUser,this.serializer)}vu(e,t){const n=this.persistence.referenceDelegate.garbageCollector;return new dp(n,e.asyncQueue,t)}Cu(e,t){const n=new ZI(t,this.persistence);return new XI(e.asyncQueue,n)}Su(e){const t=Kv(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),n=this.cacheSizeBytes!==void 0?we.withCacheSize(this.cacheSizeBytes):we.DEFAULT;return new Tc(this.synchronizeTabs,t,e.clientId,n,e.asyncQueue,oT(),ys(),this.serializer,this.sharedClientState,!!this.forceOwnership)}bu(e){return new vp}}class qs{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>Sh(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=jT.bind(null,this.syncEngine),await wT(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new RT}()}createDatastore(e){const t=uo(e.databaseInfo.databaseId),n=function(s){return new sT(s)}(e.databaseInfo);return function(s,o,c,u){return new lT(s,o,c,u)}(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return function(n,i,s,o,c){return new dT(n,i,s,o,c)}(this.localStore,this.datastore,e.asyncQueue,t=>Sh(this.syncEngine,t,0),function(){return Th.C()?new Th:new tT}())}createSyncEngine(e,t){return function(i,s,o,c,u,h,f){const m=new DT(i,s,o,c,u,h);return f&&(m.mu=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(i){const s=z(i);V(yn,"RemoteStore shutting down."),s.da.add(5),await wi(s),s.Ra.shutdown(),s.Va.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}qs.provider={build:()=>new qs};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jp{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Mu(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Mu(this.observer.error,e):De("Uncaught Error in snapshot listener:",e.toString()))}xu(){this.muted=!0}Mu(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bt="FirestoreClient";class GT{constructor(e,t,n,i,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this.databaseInfo=i,this.user=Ve.UNAUTHENTICATED,this.clientId=tc.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(n,async o=>{V(Bt,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(n,o=>(V(Bt,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Ze;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=Vc(t,"Failed to shutdown persistence");e.reject(n)}}),e.promise}}async function ra(r,e){r.asyncQueue.verifyOperationInProgress(),V(Bt,"Initializing OfflineComponentProvider");const t=r.configuration;await e.initialize(t);let n=t.initialUser;r.setCredentialChangeListener(async i=>{n.isEqual(i)||(await Ip(e.localStore,i),n=i)}),e.persistence.setDatabaseDeletedListener(()=>r.terminate()),r._offlineComponents=e}async function Vh(r,e){r.asyncQueue.verifyOperationInProgress();const t=await HT(r);V(Bt,"Initializing OnlineComponentProvider"),await e.initialize(t,r.configuration),r.setCredentialChangeListener(n=>Ah(e.remoteStore,n)),r.setAppCheckTokenChangeListener((n,i)=>Ah(e.remoteStore,i)),r._onlineComponents=e}async function HT(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){V(Bt,"Using user provided OfflineComponentProvider");try{await ra(r,r._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(i){return i.name==="FirebaseError"?i.code===S.FAILED_PRECONDITION||i.code===S.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(t))throw t;Kn("Error using user provided cache. Falling back to memory cache: "+t),await ra(r,new hi)}}else V(Bt,"Using default OfflineComponentProvider"),await ra(r,new $T(void 0));return r._offlineComponents}async function zp(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(V(Bt,"Using user provided OnlineComponentProvider"),await Vh(r,r._uninitializedComponentsProvider._online)):(V(Bt,"Using default OnlineComponentProvider"),await Vh(r,new qs))),r._onlineComponents}function WT(r){return zp(r).then(e=>e.syncEngine)}async function $p(r){const e=await zp(r),t=e.eventManager;return t.onListen=kT.bind(null,e.syncEngine),t.onUnlisten=OT.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=NT.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=MT.bind(null,e.syncEngine),t}function QT(r,e,t={}){const n=new Ze;return r.asyncQueue.enqueueAndForget(async()=>function(s,o,c,u,h){const f=new jp({next:_=>{f.xu(),o.enqueueAndForget(()=>Dp(s,m));const b=_.docs.has(c);!b&&_.fromCache?h.reject(new x(S.UNAVAILABLE,"Failed to get document because the client is offline.")):b&&_.fromCache&&u&&u.source==="server"?h.reject(new x(S.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):h.resolve(_)},error:_=>h.reject(_)}),m=new kp(eo(c.path),f,{includeMetadataChanges:!0,Qa:!0});return Vp(s,m)}(await $p(r),r.asyncQueue,e,t,n)),n.promise}function YT(r,e,t={}){const n=new Ze;return r.asyncQueue.enqueueAndForget(async()=>function(s,o,c,u,h){const f=new jp({next:_=>{f.xu(),o.enqueueAndForget(()=>Dp(s,m)),_.fromCache&&u.source==="server"?h.reject(new x(S.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(_)},error:_=>h.reject(_)}),m=new kp(c,f,{includeMetadataChanges:!0,Qa:!0});return Vp(s,m)}(await $p(r),r.asyncQueue,e,t,n)),n.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kp(r){const e={};return r.timeoutSeconds!==void 0&&(e.timeoutSeconds=r.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dh=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gp(r,e,t){if(!t)throw new x(S.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${e}.`)}function Hp(r,e,t,n){if(e===!0&&n===!0)throw new x(S.INVALID_ARGUMENT,`${r} and ${t} cannot be used together.`)}function kh(r){if(!O.isDocumentKey(r))throw new x(S.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function Nh(r){if(O.isDocumentKey(r))throw new x(S.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`)}function ho(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const e=function(n){return n.constructor?n.constructor.name:null}(r);return e?`a custom ${e} object`:"an object"}}return typeof r=="function"?"a function":M(12329,{type:typeof r})}function Ge(r,e){if("_delegate"in r&&(r=r._delegate),!(r instanceof e)){if(e.name===r.constructor.name)throw new x(S.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=ho(r);throw new x(S.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const JT="firestore.googleapis.com",xh=!0;class Oh{constructor(e){var t,n;if(e.host===void 0){if(e.ssl!==void 0)throw new x(S.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=JT,this.ssl=xh}else this.host=e.host,this.ssl=(t=e.ssl)!==null&&t!==void 0?t:xh;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=ap;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<hp)throw new x(S.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Hp("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Kp((n=e.experimentalLongPollingOptions)!==null&&n!==void 0?n:{}),function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new x(S.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new x(S.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new x(S.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(n,i){return n.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class xc{constructor(e,t,n,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Oh({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new x(S.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new x(S.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Oh(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(n){if(!n)return new Gd;switch(n.type){case"firstParty":return new $I(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new x(S.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const n=Dh.get(t);n&&(V("ComponentProvider","Removing Datastore"),Dh.delete(t),n.terminate())}(this),Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zt{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new zt(this.firestore,e,this._query)}}class Pe{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new ct(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Pe(this.firestore,e,this._key)}}class ct extends zt{constructor(e,t,n){super(e,t,eo(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Pe(this.firestore,null,new O(e))}withConverter(e){return new ct(this.firestore,e,this._path)}}function XT(r,e,...t){if(r=re(r),Gp("collection","path",e),r instanceof xc){const n=X.fromString(e,...t);return Nh(n),new ct(r,null,n)}{if(!(r instanceof Pe||r instanceof ct))throw new x(S.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(X.fromString(e,...t));return Nh(n),new ct(r.firestore,null,n)}}function Wp(r,e,...t){if(r=re(r),arguments.length===1&&(e=tc.newId()),Gp("doc","path",e),r instanceof xc){const n=X.fromString(e,...t);return kh(n),new Pe(r,null,new O(n))}{if(!(r instanceof Pe||r instanceof ct))throw new x(S.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(X.fromString(e,...t));return kh(n),new Pe(r.firestore,r instanceof ct?r.converter:null,new O(n))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mh="AsyncQueue";class Lh{constructor(e=Promise.resolve()){this.Ju=[],this.Yu=!1,this.Zu=[],this.Xu=null,this.ec=!1,this.tc=!1,this.nc=[],this.x_=new Tp(this,"async_queue_retry"),this.rc=()=>{const n=ys();n&&V(Mh,"Visibility state changed to "+n.visibilityState),this.x_.b_()},this.sc=e;const t=ys();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.rc)}get isShuttingDown(){return this.Yu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.oc(),this._c(e)}enterRestrictedMode(e){if(!this.Yu){this.Yu=!0,this.tc=e||!1;const t=ys();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.rc)}}enqueue(e){if(this.oc(),this.Yu)return new Promise(()=>{});const t=new Ze;return this._c(()=>this.Yu&&this.tc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Ju.push(e),this.ac()))}async ac(){if(this.Ju.length!==0){try{await this.Ju[0](),this.Ju.shift(),this.x_.reset()}catch(e){if(!qt(e))throw e;V(Mh,"Operation failed with retryable error: "+e)}this.Ju.length>0&&this.x_.y_(()=>this.ac())}}_c(e){const t=this.sc.then(()=>(this.ec=!0,e().catch(n=>{throw this.Xu=n,this.ec=!1,De("INTERNAL UNHANDLED ERROR: ",Fh(n)),n}).then(n=>(this.ec=!1,n))));return this.sc=t,t}enqueueAfterDelay(e,t,n){this.oc(),this.nc.indexOf(e)>-1&&(t=0);const i=Cc.createAndSchedule(this,e,t,n,s=>this.uc(s));return this.Zu.push(i),i}oc(){this.Xu&&M(47125,{cc:Fh(this.Xu)})}verifyOperationInProgress(){}async lc(){let e;do e=this.sc,await e;while(e!==this.sc)}hc(e){for(const t of this.Zu)if(t.timerId===e)return!0;return!1}Pc(e){return this.lc().then(()=>{this.Zu.sort((t,n)=>t.targetTimeMs-n.targetTimeMs);for(const t of this.Zu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.lc()})}Tc(e){this.nc.push(e)}uc(e){const t=this.Zu.indexOf(e);this.Zu.splice(t,1)}}function Fh(r){let e=r.message||"";return r.stack&&(e=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),e}class $t extends xc{constructor(e,t,n,i){super(e,t,n,i),this.type="firestore",this._queue=new Lh,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Lh(e),this._firestoreClient=void 0,await e}}}function ZT(r,e,t){t||(t=Ds);const n=Ba(r,"firestore");if(n.isInitialized(t)){const i=n.getImmediate({identifier:t}),s=n.getOptions(t);if(cn(s,e))return i;throw new x(S.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new x(S.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<hp)throw new x(S.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&di(e.host)&&Wh(e.host),n.initialize({options:e,instanceIdentifier:t})}function fo(r){if(r._terminated)throw new x(S.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||ew(r),r._firestoreClient}function ew(r){var e,t,n;const i=r._freezeSettings(),s=function(c,u,h,f){return new SE(c,u,h,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Kp(f.experimentalLongPollingOptions),f.useFetchStreams,f.isUsingEmulator)}(r._databaseId,((e=r._app)===null||e===void 0?void 0:e.options.appId)||"",r._persistenceKey,i);r._componentsProvider||!((t=i.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((n=i.localCache)===null||n===void 0)&&n._onlineComponentProvider)&&(r._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),r._firestoreClient=new GT(r._authCredentials,r._appCheckCredentials,r._queue,s,r._componentsProvider&&function(c){const u=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(u),_online:u}}(r._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class In{constructor(e){this._byteString=e}static fromBase64String(e){try{return new In(he.fromBase64String(e))}catch(t){throw new x(S.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new In(he.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bi{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new x(S.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new oe(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pi{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class po{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new x(S.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new x(S.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return j(this._lat,e._lat)||j(this._long,e._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mo{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(n,i){if(n.length!==i.length)return!1;for(let s=0;s<n.length;++s)if(n[s]!==i[s])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tw=/^__.*__$/;class nw{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return this.fieldMask!==null?new gt(e,this.data,this.fieldMask,t,this.fieldTransforms):new lr(e,this.data,t,this.fieldTransforms)}}class Qp{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return new gt(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function Yp(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw M(40011,{Ic:r})}}class Oc{constructor(e,t,n,i,s,o){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=i,s===void 0&&this.Ec(),this.fieldTransforms=s||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Ic(){return this.settings.Ic}dc(e){return new Oc(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Ac(e){var t;const n=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.dc({path:n,Rc:!1});return i.Vc(e),i}mc(e){var t;const n=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.dc({path:n,Rc:!1});return i.Ec(),i}fc(e){return this.dc({path:void 0,Rc:!0})}gc(e){return js(e,this.settings.methodName,this.settings.yc||!1,this.path,this.settings.wc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}Ec(){if(this.path)for(let e=0;e<this.path.length;e++)this.Vc(this.path.get(e))}Vc(e){if(e.length===0)throw this.gc("Document fields must not be empty");if(Yp(this.Ic)&&tw.test(e))throw this.gc('Document fields cannot begin and end with "__"')}}class rw{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||uo(e)}bc(e,t,n,i=!1){return new Oc({Ic:e,methodName:t,wc:n,path:oe.emptyPath(),Rc:!1,yc:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function go(r){const e=r._freezeSettings(),t=uo(r._databaseId);return new rw(r._databaseId,!!e.ignoreUndefinedProperties,t)}function Jp(r,e,t,n,i,s={}){const o=r.bc(s.merge||s.mergeFields?2:0,e,t,i);Lc("Data must be an object, but it was:",o,n);const c=Xp(n,o);let u,h;if(s.merge)u=new Ne(o.fieldMask),h=o.fieldTransforms;else if(s.mergeFields){const f=[];for(const m of s.mergeFields){const _=La(e,m,t);if(!o.contains(_))throw new x(S.INVALID_ARGUMENT,`Field '${_}' is specified in your field mask but missing from your input data.`);em(f,_)||f.push(_)}u=new Ne(f),h=o.fieldTransforms.filter(m=>u.covers(m.field))}else u=null,h=o.fieldTransforms;return new nw(new Ae(c),u,h)}class _o extends Pi{_toFieldTransform(e){if(e.Ic!==2)throw e.Ic===1?e.gc(`${this._methodName}() can only appear at the top level of your update data`):e.gc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof _o}}class Mc extends Pi{_toFieldTransform(e){return new Ff(e.path,new tr)}isEqual(e){return e instanceof Mc}}function iw(r,e,t,n){const i=r.bc(1,e,t);Lc("Data must be an object, but it was:",i,n);const s=[],o=Ae.empty();jt(n,(u,h)=>{const f=Fc(e,u,t);h=re(h);const m=i.mc(f);if(h instanceof _o)s.push(f);else{const _=Si(h,m);_!=null&&(s.push(f),o.set(f,_))}});const c=new Ne(s);return new Qp(o,c,i.fieldTransforms)}function sw(r,e,t,n,i,s){const o=r.bc(1,e,t),c=[La(e,n,t)],u=[i];if(s.length%2!=0)throw new x(S.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let _=0;_<s.length;_+=2)c.push(La(e,s[_])),u.push(s[_+1]);const h=[],f=Ae.empty();for(let _=c.length-1;_>=0;--_)if(!em(h,c[_])){const b=c[_];let C=u[_];C=re(C);const k=o.mc(b);if(C instanceof _o)h.push(b);else{const D=Si(C,k);D!=null&&(h.push(b),f.set(b,D))}}const m=new Ne(h);return new Qp(f,m,o.fieldTransforms)}function ow(r,e,t,n=!1){return Si(t,r.bc(n?4:3,e))}function Si(r,e){if(Zp(r=re(r)))return Lc("Unsupported field value:",e,r),Xp(r,e);if(r instanceof Pi)return function(n,i){if(!Yp(i.Ic))throw i.gc(`${n._methodName}() can only be used with update() and set()`);if(!i.path)throw i.gc(`${n._methodName}() is not currently supported inside arrays`);const s=n._toFieldTransform(i);s&&i.fieldTransforms.push(s)}(r,e),null;if(r===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),r instanceof Array){if(e.settings.Rc&&e.Ic!==4)throw e.gc("Nested arrays are not supported");return function(n,i){const s=[];let o=0;for(const c of n){let u=Si(c,i.fc(o));u==null&&(u={nullValue:"NULL_VALUE"}),s.push(u),o++}return{arrayValue:{values:s}}}(r,e)}return function(n,i){if((n=re(n))===null)return{nullValue:"NULL_VALUE"};if(typeof n=="number")return WE(i.serializer,n);if(typeof n=="boolean")return{booleanValue:n};if(typeof n=="string")return{stringValue:n};if(n instanceof Date){const s=ae.fromDate(n);return{timestampValue:ir(i.serializer,s)}}if(n instanceof ae){const s=new ae(n.seconds,1e3*Math.floor(n.nanoseconds/1e3));return{timestampValue:ir(i.serializer,s)}}if(n instanceof po)return{geoPointValue:{latitude:n.latitude,longitude:n.longitude}};if(n instanceof In)return{bytesValue:Kf(i.serializer,n._byteString)};if(n instanceof Pe){const s=i.databaseId,o=n.firestore._databaseId;if(!o.isEqual(s))throw i.gc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:_c(n.firestore._databaseId||i.databaseId,n._key.path)}}if(n instanceof mo)return function(o,c){return{mapValue:{fields:{[uc]:{stringValue:lc},[Jn]:{arrayValue:{values:o.toArray().map(h=>{if(typeof h!="number")throw c.gc("VectorValues must only contain numeric values.");return dc(c.serializer,h)})}}}}}}(n,i);throw i.gc(`Unsupported field value: ${ho(n)}`)}(r,e)}function Xp(r,e){const t={};return lf(r)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):jt(r,(n,i)=>{const s=Si(i,e.Ac(n));s!=null&&(t[n]=s)}),{mapValue:{fields:t}}}function Zp(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof ae||r instanceof po||r instanceof In||r instanceof Pe||r instanceof Pi||r instanceof mo)}function Lc(r,e,t){if(!Zp(t)||!function(i){return typeof i=="object"&&i!==null&&(Object.getPrototypeOf(i)===Object.prototype||Object.getPrototypeOf(i)===null)}(t)){const n=ho(t);throw n==="an object"?e.gc(r+" a custom object"):e.gc(r+" "+n)}}function La(r,e,t){if((e=re(e))instanceof bi)return e._internalPath;if(typeof e=="string")return Fc(r,e);throw js("Field path arguments must be of type string or ",r,!1,void 0,t)}const aw=new RegExp("[~\\*/\\[\\]]");function Fc(r,e,t){if(e.search(aw)>=0)throw js(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,t);try{return new bi(...e.split("."))._internalPath}catch{throw js(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,t)}}function js(r,e,t,n,i){const s=n&&!n.isEmpty(),o=i!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let u="";return(s||o)&&(u+=" (found",s&&(u+=` in field ${n}`),o&&(u+=` in document ${i}`),u+=")"),new x(S.INVALID_ARGUMENT,c+r+u)}function em(r,e){return r.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tm{constructor(e,t,n,i,s){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Pe(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new cw(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(yo("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class cw extends tm{data(){return super.data()}}function yo(r,e){return typeof e=="string"?Fc(r,e):e instanceof bi?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uw(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new x(S.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Uc{}class Bc extends Uc{}function lw(r,e,...t){let n=[];e instanceof Uc&&n.push(e),n=n.concat(t),function(s){const o=s.filter(u=>u instanceof Io).length,c=s.filter(u=>u instanceof Ci).length;if(o>1||o>0&&c>0)throw new x(S.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(n);for(const i of n)r=i._apply(r);return r}class Ci extends Bc{constructor(e,t,n){super(),this._field=e,this._op=t,this._value=n,this.type="where"}static _create(e,t,n){return new Ci(e,t,n)}_apply(e){const t=this._parse(e);return nm(e._query,t),new zt(e.firestore,e.converter,Aa(e._query,t))}_parse(e){const t=go(e.firestore);return function(s,o,c,u,h,f,m){let _;if(h.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new x(S.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){Bh(m,f);const C=[];for(const k of m)C.push(Uh(u,s,k));_={arrayValue:{values:C}}}else _=Uh(u,s,m)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||Bh(m,f),_=ow(c,o,m,f==="in"||f==="not-in");return Q.create(h,f,_)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function hw(r,e,t){const n=e,i=yo("where",r);return Ci._create(i,n,t)}class Io extends Uc{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Io(e,t)}_parse(e){const t=this._queryConstraints.map(n=>n._parse(e)).filter(n=>n.getFilters().length>0);return t.length===1?t[0]:ee.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(i,s){let o=i;const c=s.getFlattenedFilters();for(const u of c)nm(o,u),o=Aa(o,u)}(e._query,t),new zt(e.firestore,e.converter,Aa(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Eo extends Bc{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Eo(e,t)}_apply(e){const t=function(i,s,o){if(i.startAt!==null)throw new x(S.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(i.endAt!==null)throw new x(S.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new ui(s,o)}(e._query,this._field,this._direction);return new zt(e.firestore,e.converter,function(i,s){const o=i.explicitOrderBy.concat([s]);return new ur(i.path,i.collectionGroup,o,i.filters.slice(),i.limit,i.limitType,i.startAt,i.endAt)}(e._query,t))}}function dw(r,e="asc"){const t=e,n=yo("orderBy",r);return Eo._create(n,t)}function Uh(r,e,t){if(typeof(t=re(t))=="string"){if(t==="")throw new x(S.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Pf(e)&&t.indexOf("/")!==-1)throw new x(S.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const n=e.path.child(X.fromString(t));if(!O.isDocumentKey(n))throw new x(S.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return ai(r,new O(n))}if(t instanceof Pe)return ai(r,t._key);throw new x(S.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ho(t)}.`)}function Bh(r,e){if(!Array.isArray(r)||r.length===0)throw new x(S.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function nm(r,e){const t=function(i,s){for(const o of i)for(const c of o.getFlattenedFilters())if(s.indexOf(c.op)>=0)return c.op;return null}(r.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new x(S.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new x(S.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}class rm{convertValue(e,t="none"){switch(Lt(e)){case 0:return null;case 1:return e.booleanValue;case 2:return se(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(dt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw M(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return jt(e,(i,s)=>{n[i]=this.convertValue(s,t)}),n}convertVectorValue(e){var t,n,i;const s=(i=(n=(t=e.fields)===null||t===void 0?void 0:t[Jn].arrayValue)===null||n===void 0?void 0:n.values)===null||i===void 0?void 0:i.map(o=>se(o.doubleValue));return new mo(s)}convertGeoPoint(e){return new po(se(e.latitude),se(e.longitude))}convertArray(e,t){return(e.values||[]).map(n=>this.convertValue(n,t))}convertServerTimestamp(e,t){switch(t){case"previous":const n=Xs(e);return n==null?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(si(e));default:return null}}convertTimestamp(e){const t=ht(e);return new ae(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=X.fromString(e);U(tp(n),9688,{name:e});const i=new Mt(n.get(1),n.get(3)),s=new O(n.popFirst(5));return i.isEqual(t)||De(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function im(r,e,t){let n;return n=r?r.toFirestore(e):e,n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fn{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class qc extends tm{constructor(e,t,n,i,s,o){super(e,t,n,i,o),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Yr(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(yo("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}}class Yr extends qc{data(e={}){return super.data(e)}}class sm{constructor(e,t,n,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new Fn(i.hasPendingWrites,i.fromCache),this.query=n}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(n=>{e.call(t,new Yr(this._firestore,this._userDataWriter,n.key,n,new Fn(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new x(S.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(i,s){if(i._snapshot.oldDocs.isEmpty()){let o=0;return i._snapshot.docChanges.map(c=>{const u=new Yr(i._firestore,i._userDataWriter,c.doc.key,c.doc,new Fn(i._snapshot.mutatedKeys.has(c.doc.key),i._snapshot.fromCache),i.query.converter);return c.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}})}{let o=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(c=>s||c.type!==3).map(c=>{const u=new Yr(i._firestore,i._userDataWriter,c.doc.key,c.doc,new Fn(i._snapshot.mutatedKeys.has(c.doc.key),i._snapshot.fromCache),i.query.converter);let h=-1,f=-1;return c.type!==0&&(h=o.indexOf(c.doc.key),o=o.delete(c.doc.key)),c.type!==1&&(o=o.add(c.doc),f=o.indexOf(c.doc.key)),{type:fw(c.type),doc:u,oldIndex:h,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function fw(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return M(61501,{type:r})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pw(r){r=Ge(r,Pe);const e=Ge(r.firestore,$t);return QT(fo(e),r._key).then(t=>Ew(e,r,t))}class om extends rm{constructor(e){super(),this.firestore=e}convertBytes(e){return new In(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Pe(this.firestore,null,t)}}function mw(r){r=Ge(r,zt);const e=Ge(r.firestore,$t),t=fo(e),n=new om(e);return uw(r._query),YT(t,r._query).then(i=>new sm(e,n,r,i))}function gw(r,e,t){r=Ge(r,Pe);const n=Ge(r.firestore,$t),i=im(r.converter,e);return Vi(n,[Jp(go(n),"setDoc",r._key,i,r.converter!==null,t).toMutation(r._key,Re.none())])}function _w(r,e,t,...n){r=Ge(r,Pe);const i=Ge(r.firestore,$t),s=go(i);let o;return o=typeof(e=re(e))=="string"||e instanceof bi?sw(s,"updateDoc",r._key,e,t,n):iw(s,"updateDoc",r._key,e),Vi(i,[o.toMutation(r._key,Re.exists(!0))])}function yw(r){return Vi(Ge(r.firestore,$t),[new io(r._key,Re.none())])}function Iw(r,e){const t=Ge(r.firestore,$t),n=Wp(r),i=im(r.converter,e);return Vi(t,[Jp(go(r.firestore),"addDoc",n._key,i,r.converter!==null,{}).toMutation(n._key,Re.exists(!1))]).then(()=>n)}function Vi(r,e){return function(n,i){const s=new Ze;return n.asyncQueue.enqueueAndForget(async()=>LT(await WT(n),i,s)),s.promise}(fo(r),e)}function Ew(r,e,t){const n=t.docs.get(e._key),i=new om(r);return new qc(r,i,e._key,n,new Fn(t.hasPendingWrites,t.fromCache),e.converter)}class vw{constructor(e){let t;this.kind="persistent",e!=null&&e.tabManager?(e.tabManager._initialize(e),t=e.tabManager):(t=am(void 0),t._initialize(e)),this._onlineComponentProvider=t._onlineComponentProvider,this._offlineComponentProvider=t._offlineComponentProvider}toJSON(){return{kind:this.kind}}}function Tw(r){return new vw(r)}class ww{constructor(e){this.forceOwnership=e,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=qs.provider,this._offlineComponentProvider={build:t=>new KT(t,e==null?void 0:e.cacheSizeBytes,this.forceOwnership)}}}function am(r){return new ww(r==null?void 0:r.forceOwnership)}function Aw(){return new Mc("serverTimestamp")}(function(e,t=!0){(function(i){cr=i})(or),$n(new un("firestore",(n,{instanceIdentifier:i,options:s})=>{const o=n.getProvider("app").getImmediate(),c=new $t(new jI(n.getProvider("auth-internal")),new KI(o,n.getProvider("app-check-internal")),function(h,f){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new x(S.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Mt(h.options.projectId,f)}(o,i),o);return s=Object.assign({useFetchStreams:t},s),c._setSettings(s),c},"PUBLIC").setMultipleInstances(!0)),Nt(Il,El,e),Nt(Il,El,"esm2017")})();const Bw=Object.freeze(Object.defineProperty({__proto__:null,AbstractUserDataWriter:rm,Bytes:In,CollectionReference:ct,DocumentReference:Pe,DocumentSnapshot:qc,FieldPath:bi,FieldValue:Pi,Firestore:$t,FirestoreError:x,GeoPoint:po,Query:zt,QueryCompositeFilterConstraint:Io,QueryConstraint:Bc,QueryDocumentSnapshot:Yr,QueryFieldFilterConstraint:Ci,QueryOrderByConstraint:Eo,QuerySnapshot:sm,SnapshotMetadata:Fn,Timestamp:ae,VectorValue:mo,_AutoId:tc,_ByteString:he,_DatabaseId:Mt,_DocumentKey:O,_EmptyAuthCredentialsProvider:Gd,_FieldPath:oe,_cast:Ge,_logWarn:Kn,_validateIsNotUsedTogether:Hp,addDoc:Iw,collection:XT,deleteDoc:yw,doc:Wp,ensureFirestoreConfigured:fo,executeWrite:Vi,getDoc:pw,getDocs:mw,initializeFirestore:ZT,orderBy:dw,persistentLocalCache:Tw,persistentSingleTabManager:am,query:lw,serverTimestamp:Aw,setDoc:gw,updateDoc:_w,where:hw},Symbol.toStringTag,{value:"Module"}));export{Lw as A,Rw as B,bw as C,xw as D,ar as E,Bw as F,ZT as a,am as b,Vw as c,Dw as d,pw as e,Wp as f,Fw as g,kw as h,h_ as i,XT as j,mw as k,Aw as l,gw as m,_w as n,Ow as o,Tw as p,lw as q,Iw as r,Mw as s,Pw as t,Nw as u,Cw as v,hw as w,Sw as x,dw as y,yw as z};
