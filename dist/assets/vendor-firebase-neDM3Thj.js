var TD=Object.defineProperty;var AD=(r,e,t)=>e in r?TD(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var J=(r,e,t)=>AD(r,typeof e!="symbol"?e+"":e,t);const vD=()=>{};var bf={};/**
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
 */const tg=function(r){const e=[];let t=0;for(let n=0;n<r.length;n++){let s=r.charCodeAt(n);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&n+1<r.length&&(r.charCodeAt(n+1)&64512)===56320?(s=65536+((s&1023)<<10)+(r.charCodeAt(++n)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},RD=function(r){const e=[];let t=0,n=0;for(;t<r.length;){const s=r[t++];if(s<128)e[n++]=String.fromCharCode(s);else if(s>191&&s<224){const i=r[t++];e[n++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=r[t++],o=r[t++],a=r[t++],u=((s&7)<<18|(i&63)<<12|(o&63)<<6|a&63)-65536;e[n++]=String.fromCharCode(55296+(u>>10)),e[n++]=String.fromCharCode(56320+(u&1023))}else{const i=r[t++],o=r[t++];e[n++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},ng={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,e){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let s=0;s<r.length;s+=3){const i=r[s],o=s+1<r.length,a=o?r[s+1]:0,u=s+2<r.length,l=u?r[s+2]:0,B=i>>2,d=(i&3)<<4|a>>4;let C=(a&15)<<2|l>>6,g=l&63;u||(g=64,o||(C=64)),n.push(t[B],t[d],t[C],t[g])}return n.join("")},encodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(r):this.encodeByteArray(tg(r),e)},decodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(r):RD(this.decodeStringToByteArray(r,e))},decodeStringToByteArray(r,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let s=0;s<r.length;){const i=t[r.charAt(s++)],a=s<r.length?t[r.charAt(s)]:0;++s;const l=s<r.length?t[r.charAt(s)]:64;++s;const d=s<r.length?t[r.charAt(s)]:64;if(++s,i==null||a==null||l==null||d==null)throw new PD;const C=i<<2|a>>4;if(n.push(C),l!==64){const g=a<<4&240|l>>2;if(n.push(g),d!==64){const D=l<<6&192|d;n.push(D)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class PD extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const bD=function(r){const e=tg(r);return ng.encodeByteArray(e,!0)},bu=function(r){return bD(r).replace(/\./g,"")},RB=function(r){try{return ng.decodeString(r,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function rg(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const SD=()=>rg().__FIREBASE_DEFAULTS__,ND=()=>{if(typeof process>"u"||typeof bf>"u")return;const r=bf.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},OD=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=r&&RB(r[1]);return e&&JSON.parse(e)},sc=()=>{try{return vD()||SD()||ND()||OD()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},sg=r=>{var e,t;return(t=(e=sc())==null?void 0:e.emulatorHosts)==null?void 0:t[r]},FD=r=>{const e=sg(r);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const n=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),n]:[e.substring(0,t),n]},PB=()=>{var r;return(r=sc())==null?void 0:r.config},ig=r=>{var e;return(e=sc())==null?void 0:e[`_${r}`]};/**
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
 */class og{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,n))}}}/**
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
 */function LD(r,e){if(r.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},n=e||"demo-project",s=r.iat||0,i=r.sub||r.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${n}`,aud:n,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...r};return[bu(JSON.stringify(t)),bu(JSON.stringify(o)),""].join(".")}/**
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
 */function tt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function VD(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(tt())}function ag(){var e;const r=(e=sc())==null?void 0:e.forceEnvironment;if(r==="node")return!0;if(r==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function kD(){return typeof window<"u"||ug()}function ug(){return typeof WorkerGlobalScope<"u"&&typeof self<"u"&&self instanceof WorkerGlobalScope}function xD(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function MD(){const r=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof r=="object"&&r.id!==void 0}function GD(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function UD(){const r=tt();return r.indexOf("MSIE ")>=0||r.indexOf("Trident/")>=0}function cg(){return!ag()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function lg(){return!ag()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function Bg(){try{return typeof indexedDB=="object"}catch{return!1}}function HD(){return new Promise((r,e)=>{try{let t=!0;const n="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(n);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(n),r(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}/**
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
 */const qD="FirebaseError";class In extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name=qD,Object.setPrototypeOf(this,In.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ca.prototype.create)}}class Ca{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?jD(i,n):"Error",a=`${this.serviceName}: ${o} (${s}).`;return new In(s,a,n)}}function jD(r,e){try{let t=0,n="";for(;t<r.length;){const s=r.indexOf("{$",t);if(s===-1){n+=r.substring(t);break}const i=r.indexOf("}",s+2);if(i===-1){n+=r.substring(t);break}const o=r.substring(s+2,i),a=e[o];n+=r.substring(t,s)+(a!=null?String(a):`<${o}?>`),t=i+1}return n}catch{return r}}function JD(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}function Zt(r,e){if(r===e)return!0;const t=Object.keys(r),n=Object.keys(e);for(const s of t){if(!n.includes(s))return!1;const i=r[s],o=e[s];if(Sf(i)&&Sf(o)){if(!Zt(i,o))return!1}else if(i!==o)return!1}for(const s of n)if(!t.includes(s))return!1;return!0}function Sf(r){return r!==null&&typeof r=="object"}/**
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
 */function bi(r){const e=[];for(const[t,n]of Object.entries(r))Array.isArray(n)?n.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}function yo(r){const e={};return r.replace(/^\?/,"").split("&").forEach(n=>{if(n){const[s,i]=n.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function wo(r){const e=r.indexOf("?");if(!e)return"";const t=r.indexOf("#",e);return r.substring(e,t>0?t:void 0)}function KD(r,e){const t=new zD(r,e);return t.subscribe.bind(t)}class zD{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(n=>{this.error(n)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,n){let s;if(e===void 0&&t===void 0&&n===void 0)throw new Error("Missing Observer.");QD(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:n},s.next===void 0&&(s.next=pl),s.error===void 0&&(s.error=pl),s.complete===void 0&&(s.complete=pl);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function QD(r,e){if(typeof r!="object"||r===null)return!1;for(const t of e)if(t in r&&typeof r[t]=="function")return!0;return!1}function pl(){}/**
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
 */function ne(r){return r&&r._delegate?r._delegate:r}/**
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
 */function Si(r){try{return(r.startsWith("http://")||r.startsWith("https://")?new URL(r).hostname:r).endsWith(".cloudworkstations.dev")}catch{return!1}}async function bB(r){return(await fetch(r,{credentials:"include"})).ok}class Bs{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const zr="[DEFAULT]";/**
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
 */class WD{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const n=new og;if(this.instancesDeferred.set(t,n),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&n.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),n=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(n)return null;throw s}else{if(n)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(YD(e))try{this.getOrInitializeService({instanceIdentifier:zr})}catch{}for(const[t,n]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});n.resolve(i)}catch{}}}}clearInstance(e=zr){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=zr){return this.instances.has(e)}getOptions(e=zr){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[i,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(i);n===a&&o.resolve(s)}return s}onInit(e,t){const n=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(n)??new Set;s.add(e),this.onInitCallbacks.set(n,s);const i=this.instances.get(n);return i&&e(i,n),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const s of n)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:$D(e),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=zr){return this.component?this.component.multipleInstances?e:zr:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function $D(r){return r===zr?void 0:r}function YD(r){return r.instantiationMode==="EAGER"}/**
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
 */class hg{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new WD(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */const SB=[];var he;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(he||(he={}));const dg={debug:he.DEBUG,verbose:he.VERBOSE,info:he.INFO,warn:he.WARN,error:he.ERROR,silent:he.SILENT},XD=he.INFO,ZD={[he.DEBUG]:"log",[he.VERBOSE]:"log",[he.INFO]:"info",[he.WARN]:"warn",[he.ERROR]:"error"},ey=(r,e,...t)=>{if(e<r.logLevel)return;const n=new Date().toISOString(),s=ZD[e];if(s)console[s](`[${n}]  ${r.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class NB{constructor(e){this.name=e,this._logLevel=XD,this._logHandler=ey,this._userLogHandler=null,SB.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in he))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?dg[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,he.DEBUG,...e),this._logHandler(this,he.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,he.VERBOSE,...e),this._logHandler(this,he.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,he.INFO,...e),this._logHandler(this,he.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,he.WARN,...e),this._logHandler(this,he.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,he.ERROR,...e),this._logHandler(this,he.ERROR,...e)}}function ty(r){SB.forEach(e=>{e.setLogLevel(r)})}function ny(r,e){for(const t of SB){let n=null;e&&e.level&&(n=dg[e.level]),r===null?t.userLogHandler=null:t.userLogHandler=(s,i,...o)=>{const a=o.map(u=>{if(u==null)return null;if(typeof u=="string")return u;if(typeof u=="number"||typeof u=="boolean")return u.toString();if(u instanceof Error)return u.message;try{return JSON.stringify(u)}catch{return null}}).filter(u=>u).join(" ");i>=(n??s.logLevel)&&r({level:he[i].toLowerCase(),message:a,args:o,type:s.name})}}}const ry=(r,e)=>e.some(t=>r instanceof t);let Nf,Of;function sy(){return Nf||(Nf=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function iy(){return Of||(Of=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const fg=new WeakMap,Hl=new WeakMap,Cg=new WeakMap,gl=new WeakMap,OB=new WeakMap;function oy(r){const e=new Promise((t,n)=>{const s=()=>{r.removeEventListener("success",i),r.removeEventListener("error",o)},i=()=>{t(Cr(r.result)),s()},o=()=>{n(r.error),s()};r.addEventListener("success",i),r.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&fg.set(t,r)}).catch(()=>{}),OB.set(e,r),e}function ay(r){if(Hl.has(r))return;const e=new Promise((t,n)=>{const s=()=>{r.removeEventListener("complete",i),r.removeEventListener("error",o),r.removeEventListener("abort",o)},i=()=>{t(),s()},o=()=>{n(r.error||new DOMException("AbortError","AbortError")),s()};r.addEventListener("complete",i),r.addEventListener("error",o),r.addEventListener("abort",o)});Hl.set(r,e)}let ql={get(r,e,t){if(r instanceof IDBTransaction){if(e==="done")return Hl.get(r);if(e==="objectStoreNames")return r.objectStoreNames||Cg.get(r);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Cr(r[e])},set(r,e,t){return r[e]=t,!0},has(r,e){return r instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in r}};function uy(r){ql=r(ql)}function cy(r){return r===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const n=r.call(ml(this),e,...t);return Cg.set(n,e.sort?e.sort():[e]),Cr(n)}:iy().includes(r)?function(...e){return r.apply(ml(this),e),Cr(fg.get(this))}:function(...e){return Cr(r.apply(ml(this),e))}}function ly(r){return typeof r=="function"?cy(r):(r instanceof IDBTransaction&&ay(r),ry(r,sy())?new Proxy(r,ql):r)}function Cr(r){if(r instanceof IDBRequest)return oy(r);if(gl.has(r))return gl.get(r);const e=ly(r);return e!==r&&(gl.set(r,e),OB.set(e,r)),e}const ml=r=>OB.get(r);function By(r,e,{blocked:t,upgrade:n,blocking:s,terminated:i}={}){const o=indexedDB.open(r,e),a=Cr(o);return n&&o.addEventListener("upgradeneeded",u=>{n(Cr(o.result),u.oldVersion,u.newVersion,Cr(o.transaction),u)}),t&&o.addEventListener("blocked",u=>t(u.oldVersion,u.newVersion,u)),a.then(u=>{i&&u.addEventListener("close",()=>i()),s&&u.addEventListener("versionchange",l=>s(l.oldVersion,l.newVersion,l))}).catch(()=>{}),a}const hy=["get","getKey","getAll","getAllKeys","count"],dy=["put","add","delete","clear"],_l=new Map;function Ff(r,e){if(!(r instanceof IDBDatabase&&!(e in r)&&typeof e=="string"))return;if(_l.get(e))return _l.get(e);const t=e.replace(/FromIndex$/,""),n=e!==t,s=dy.includes(t);if(!(t in(n?IDBIndex:IDBObjectStore).prototype)||!(s||hy.includes(t)))return;const i=async function(o,...a){const u=this.transaction(o,s?"readwrite":"readonly");let l=u.store;return n&&(l=l.index(a.shift())),(await Promise.all([l[t](...a),s&&u.done]))[0]};return _l.set(e,i),i}uy(r=>({...r,get:(e,t,n)=>Ff(e,t)||r.get(e,t,n),has:(e,t)=>!!Ff(e,t)||r.has(e,t)}));/**
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
 */class fy{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Cy(t)){const n=t.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(t=>t).join(" ")}}function Cy(r){const e=r.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Su="@firebase/app",jl="0.16.0";/**
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
 */const kn=new NB("@firebase/app"),py="@firebase/app-compat",gy="@firebase/analytics-compat",my="@firebase/analytics",_y="@firebase/app-check-compat",Ey="@firebase/app-check",Iy="@firebase/auth",Dy="@firebase/auth-compat",yy="@firebase/database",wy="@firebase/data-connect",Ty="@firebase/database-compat",Ay="@firebase/functions",vy="@firebase/functions-compat",Ry="@firebase/installations",Py="@firebase/installations-compat",by="@firebase/messaging",Sy="@firebase/messaging-compat",Ny="@firebase/performance",Oy="@firebase/performance-compat",Fy="@firebase/remote-config",Ly="@firebase/remote-config-compat",Vy="@firebase/storage",ky="@firebase/storage-compat",xy="@firebase/firestore",My="@firebase/ai",Gy="@firebase/firestore-compat",Uy="firebase",Hy="12.17.0";/**
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
 */const Qo="[DEFAULT]",qy={[Su]:"fire-core",[py]:"fire-core-compat",[my]:"fire-analytics",[gy]:"fire-analytics-compat",[Ey]:"fire-app-check",[_y]:"fire-app-check-compat",[Iy]:"fire-auth",[Dy]:"fire-auth-compat",[yy]:"fire-rtdb",[wy]:"fire-data-connect",[Ty]:"fire-rtdb-compat",[Ay]:"fire-fn",[vy]:"fire-fn-compat",[Ry]:"fire-iid",[Py]:"fire-iid-compat",[by]:"fire-fcm",[Sy]:"fire-fcm-compat",[Ny]:"fire-perf",[Oy]:"fire-perf-compat",[Fy]:"fire-rc",[Ly]:"fire-rc-compat",[Vy]:"fire-gcs",[ky]:"fire-gcs-compat",[xy]:"fire-fst",[Gy]:"fire-fst-compat",[My]:"fire-vertex","fire-js":"fire-js",[Uy]:"fire-js-all"};/**
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
 */const Dr=new Map,ri=new Map,si=new Map;function Jl(r,e){try{r.container.addComponent(e)}catch(t){kn.debug(`Component ${e.name} failed to register with FirebaseApp ${r.name}`,t)}}function jy(r,e){r.container.addOrOverwriteComponent(e)}function hs(r){const e=r.name;if(si.has(e))return kn.debug(`There were multiple attempts to register component ${e}.`),!1;si.set(e,r);for(const t of Dr.values())Jl(t,r);for(const t of ri.values())Jl(t,r);return!0}function Ni(r,e){const t=r.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),r.container.getProvider(e)}function pg(r,e,t=Qo){Ni(r,e).clearInstance(t)}function FB(r){return r.options!==void 0}function gg(r){return FB(r)?!1:"authIdToken"in r||"appCheckToken"in r||"releaseOnDeref"in r||"automaticDataCollectionEnabled"in r}function xe(r){return r==null?!1:r.settings!==void 0}function Jy(){si.clear()}/**
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
 */const Ky={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},bt=new Ca("app","Firebase",Ky);/**
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
 */class mg{constructor(e,t,n){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new Bs("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw bt.create("app-deleted",{appName:this._name})}}/**
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
 */function Lf(r,e){const t=RB(r.split(".")[1]);if(t===null){console.error(`FirebaseServerApp ${e} is invalid: second part could not be parsed.`);return}if(JSON.parse(t).exp===void 0){console.error(`FirebaseServerApp ${e} is invalid: expiration claim could not be parsed`);return}const s=JSON.parse(t).exp*1e3,i=new Date().getTime();s-i<=0&&console.error(`FirebaseServerApp ${e} is invalid: the token has expired.`)}class zy extends mg{constructor(e,t,n,s){const i=t.automaticDataCollectionEnabled!==void 0?t.automaticDataCollectionEnabled:!0,o={name:n,automaticDataCollectionEnabled:i};if(e.apiKey!==void 0)super(e,o,s);else{const a=e;super(a.options,o,s)}this._serverConfig={automaticDataCollectionEnabled:i,...t},this._serverConfig.authIdToken&&Lf(this._serverConfig.authIdToken,"authIdToken"),this._serverConfig.appCheckToken&&Lf(this._serverConfig.appCheckToken,"appCheckToken"),this._finalizationRegistry=null,typeof FinalizationRegistry<"u"&&(this._finalizationRegistry=new FinalizationRegistry(()=>{this.automaticCleanup()})),this._refCount=0,this.incRefCount(this._serverConfig.releaseOnDeref),this._serverConfig.releaseOnDeref=void 0,t.releaseOnDeref=void 0,dn(Su,jl,"serverapp")}toJSON(){}get refCount(){return this._refCount}incRefCount(e){this.isDeleted||(this._refCount++,e!==void 0&&this._finalizationRegistry!==null&&this._finalizationRegistry.register(e,this))}decRefCount(){return this.isDeleted?0:--this._refCount}automaticCleanup(){Eg(this)}get settings(){return this.checkDestroyed(),this._serverConfig}checkDestroyed(){if(this.isDeleted)throw bt.create("server-app-deleted")}}/**
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
 */const ys=Hy;function _g(r,e={}){let t=r;typeof e!="object"&&(e={name:e});const n={name:Qo,automaticDataCollectionEnabled:!0,...e},s=n.name;if(typeof s!="string"||!s)throw bt.create("bad-app-name",{appName:String(s)});if(t||(t=PB()),!t)throw bt.create("no-options");const i=Dr.get(s);if(i)if(Zt(t,i.options)){if(Zt(n,i.config))return i;throw bt.create("duplicate-app",{appName:s,mismatchedParam:"config",oldValue:JSON.stringify(i.config),newValue:JSON.stringify(n)})}else throw bt.create("duplicate-app",{appName:s,mismatchedParam:"options",oldValue:JSON.stringify(i.options),newValue:JSON.stringify(t)});const o=new hg(s);for(const u of si.values())o.addComponent(u);const a=new mg(t,n,o);return Dr.set(s,a),a}function Qy(r,e={}){if(kD()&&!ug())throw bt.create("invalid-server-app-environment");let t,n=e||{};if(r&&(FB(r)?t=r.options:gg(r)?n=r:t=r),n.automaticDataCollectionEnabled===void 0&&(n.automaticDataCollectionEnabled=!0),t||(t=PB()),!t)throw bt.create("no-options");const s={...n,...t};s.releaseOnDeref!==void 0&&delete s.releaseOnDeref;const i=B=>[...B].reduce((d,C)=>Math.imul(31,d)+C.charCodeAt(0)|0,0);if(n.releaseOnDeref!==void 0&&typeof FinalizationRegistry>"u")throw bt.create("finalization-registry-not-supported",{});const o=""+i(JSON.stringify(s)),a=ri.get(o);if(a)return a.incRefCount(n.releaseOnDeref),a;const u=new hg(o);for(const B of si.values())u.addComponent(B);const l=new zy(t,n,o,u);return ri.set(o,l),l}function LB(r=Qo){const e=Dr.get(r);if(!e&&r===Qo&&PB())return _g();if(!e)throw bt.create("no-app",{appName:r});return e}function Wy(){return Array.from(Dr.values())}async function Eg(r){let e=!1;const t=r.name;Dr.has(t)?(e=!0,Dr.delete(t)):ri.has(t)&&r.decRefCount()<=0&&(ri.delete(t),e=!0),e&&(await Promise.all(r.container.getProviders().map(n=>n.delete())),r.isDeleted=!0)}function dn(r,e,t){let n=qy[r]??r;t&&(n+=`-${t}`);const s=n.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const o=[`Unable to register library "${n}" with version "${e}":`];s&&o.push(`library name "${n}" contains illegal characters (whitespace or "/")`),s&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),kn.warn(o.join(" "));return}hs(new Bs(`${n}-version`,()=>({library:n,version:e}),"VERSION"))}function $y(r,e){if(r!==null&&typeof r!="function")throw bt.create("invalid-log-argument");ny(r,e)}function Yy(r){ty(r)}/**
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
 */const Xy="firebase-heartbeat-database",Zy=1,Wo="firebase-heartbeat-store";let El=null;function Ig(){return El||(El=By(Xy,Zy,{upgrade:(r,e)=>{switch(e){case 0:try{r.createObjectStore(Wo)}catch(t){console.warn(t)}}}}).catch(r=>{throw bt.create("idb-open",{originalErrorMessage:r.message})})),El}async function ew(r){try{const t=(await Ig()).transaction(Wo),n=await t.objectStore(Wo).get(Dg(r));return await t.done,n}catch(e){if(e instanceof In)kn.warn(e.message);else{const t=bt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});kn.warn(t.message)}}}async function Vf(r,e){try{const n=(await Ig()).transaction(Wo,"readwrite");await n.objectStore(Wo).put(e,Dg(r)),await n.done}catch(t){if(t instanceof In)kn.warn(t.message);else{const n=bt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});kn.warn(n.message)}}}function Dg(r){return`${r.name}!${r.options.appId}`}/**
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
 */const tw=1024,nw=30;class rw{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new iw(t),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=kf();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>nw){const o=ow(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){kn.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=kf(),{heartbeatsToSend:n,unsentEntries:s}=sw(this._heartbeatsCache.heartbeats),i=bu(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return kn.warn(t),""}}}function kf(){return new Date().toISOString().substring(0,10)}function sw(r,e=tw){const t=[];let n=r.slice();for(const s of r){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),xf(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),xf(t)>e){t.pop();break}n=n.slice(1)}return{heartbeatsToSend:t,unsentEntries:n}}class iw{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Bg()?HD().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await ew(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return Vf(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return Vf(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...e.heartbeats]})}else return}}function xf(r){return bu(JSON.stringify({version:2,heartbeats:r})).length}function ow(r){if(r.length===0)return-1;let e=0,t=r[0].date;for(let n=1;n<r.length;n++)r[n].date<t&&(t=r[n].date,e=n);return e}/**
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
 */function aw(r){hs(new Bs("platform-logger",e=>new fy(e),"PRIVATE")),hs(new Bs("heartbeat",e=>new rw(e),"PRIVATE")),dn(Su,jl,r),dn(Su,jl,"esm2020"),dn("fire-js","")}/**
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
 */aw("");var uw="firebase",cw="12.17.1";/**
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
 */dn(uw,cw,"app");const z0=Object.freeze(Object.defineProperty({__proto__:null,FirebaseError:In,SDK_VERSION:ys,_DEFAULT_ENTRY_NAME:Qo,_addComponent:Jl,_addOrOverwriteComponent:jy,_apps:Dr,_clearComponents:Jy,_components:si,_getProvider:Ni,_isFirebaseApp:FB,_isFirebaseServerApp:xe,_isFirebaseServerAppSettings:gg,_registerComponent:hs,_removeServiceInstance:pg,_serverApps:ri,deleteApp:Eg,getApp:LB,getApps:Wy,initializeApp:_g,initializeServerApp:Qy,onLog:$y,registerVersion:dn,setLogLevel:Yy},Symbol.toStringTag,{value:"Module"}));var Mf=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var pr,yg;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(T,E){function y(){}y.prototype=E.prototype,T.F=E.prototype,T.prototype=new y,T.prototype.constructor=T,T.D=function(R,v,O){for(var I=Array(arguments.length-2),At=2;At<arguments.length;At++)I[At-2]=arguments[At];return E.prototype[v].apply(R,I)}}function t(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(n,t),n.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(T,E,y){y||(y=0);const R=Array(16);if(typeof E=="string")for(var v=0;v<16;++v)R[v]=E.charCodeAt(y++)|E.charCodeAt(y++)<<8|E.charCodeAt(y++)<<16|E.charCodeAt(y++)<<24;else for(v=0;v<16;++v)R[v]=E[y++]|E[y++]<<8|E[y++]<<16|E[y++]<<24;E=T.g[0],y=T.g[1],v=T.g[2];let O=T.g[3],I;I=E+(O^y&(v^O))+R[0]+3614090360&4294967295,E=y+(I<<7&4294967295|I>>>25),I=O+(v^E&(y^v))+R[1]+3905402710&4294967295,O=E+(I<<12&4294967295|I>>>20),I=v+(y^O&(E^y))+R[2]+606105819&4294967295,v=O+(I<<17&4294967295|I>>>15),I=y+(E^v&(O^E))+R[3]+3250441966&4294967295,y=v+(I<<22&4294967295|I>>>10),I=E+(O^y&(v^O))+R[4]+4118548399&4294967295,E=y+(I<<7&4294967295|I>>>25),I=O+(v^E&(y^v))+R[5]+1200080426&4294967295,O=E+(I<<12&4294967295|I>>>20),I=v+(y^O&(E^y))+R[6]+2821735955&4294967295,v=O+(I<<17&4294967295|I>>>15),I=y+(E^v&(O^E))+R[7]+4249261313&4294967295,y=v+(I<<22&4294967295|I>>>10),I=E+(O^y&(v^O))+R[8]+1770035416&4294967295,E=y+(I<<7&4294967295|I>>>25),I=O+(v^E&(y^v))+R[9]+2336552879&4294967295,O=E+(I<<12&4294967295|I>>>20),I=v+(y^O&(E^y))+R[10]+4294925233&4294967295,v=O+(I<<17&4294967295|I>>>15),I=y+(E^v&(O^E))+R[11]+2304563134&4294967295,y=v+(I<<22&4294967295|I>>>10),I=E+(O^y&(v^O))+R[12]+1804603682&4294967295,E=y+(I<<7&4294967295|I>>>25),I=O+(v^E&(y^v))+R[13]+4254626195&4294967295,O=E+(I<<12&4294967295|I>>>20),I=v+(y^O&(E^y))+R[14]+2792965006&4294967295,v=O+(I<<17&4294967295|I>>>15),I=y+(E^v&(O^E))+R[15]+1236535329&4294967295,y=v+(I<<22&4294967295|I>>>10),I=E+(v^O&(y^v))+R[1]+4129170786&4294967295,E=y+(I<<5&4294967295|I>>>27),I=O+(y^v&(E^y))+R[6]+3225465664&4294967295,O=E+(I<<9&4294967295|I>>>23),I=v+(E^y&(O^E))+R[11]+643717713&4294967295,v=O+(I<<14&4294967295|I>>>18),I=y+(O^E&(v^O))+R[0]+3921069994&4294967295,y=v+(I<<20&4294967295|I>>>12),I=E+(v^O&(y^v))+R[5]+3593408605&4294967295,E=y+(I<<5&4294967295|I>>>27),I=O+(y^v&(E^y))+R[10]+38016083&4294967295,O=E+(I<<9&4294967295|I>>>23),I=v+(E^y&(O^E))+R[15]+3634488961&4294967295,v=O+(I<<14&4294967295|I>>>18),I=y+(O^E&(v^O))+R[4]+3889429448&4294967295,y=v+(I<<20&4294967295|I>>>12),I=E+(v^O&(y^v))+R[9]+568446438&4294967295,E=y+(I<<5&4294967295|I>>>27),I=O+(y^v&(E^y))+R[14]+3275163606&4294967295,O=E+(I<<9&4294967295|I>>>23),I=v+(E^y&(O^E))+R[3]+4107603335&4294967295,v=O+(I<<14&4294967295|I>>>18),I=y+(O^E&(v^O))+R[8]+1163531501&4294967295,y=v+(I<<20&4294967295|I>>>12),I=E+(v^O&(y^v))+R[13]+2850285829&4294967295,E=y+(I<<5&4294967295|I>>>27),I=O+(y^v&(E^y))+R[2]+4243563512&4294967295,O=E+(I<<9&4294967295|I>>>23),I=v+(E^y&(O^E))+R[7]+1735328473&4294967295,v=O+(I<<14&4294967295|I>>>18),I=y+(O^E&(v^O))+R[12]+2368359562&4294967295,y=v+(I<<20&4294967295|I>>>12),I=E+(y^v^O)+R[5]+4294588738&4294967295,E=y+(I<<4&4294967295|I>>>28),I=O+(E^y^v)+R[8]+2272392833&4294967295,O=E+(I<<11&4294967295|I>>>21),I=v+(O^E^y)+R[11]+1839030562&4294967295,v=O+(I<<16&4294967295|I>>>16),I=y+(v^O^E)+R[14]+4259657740&4294967295,y=v+(I<<23&4294967295|I>>>9),I=E+(y^v^O)+R[1]+2763975236&4294967295,E=y+(I<<4&4294967295|I>>>28),I=O+(E^y^v)+R[4]+1272893353&4294967295,O=E+(I<<11&4294967295|I>>>21),I=v+(O^E^y)+R[7]+4139469664&4294967295,v=O+(I<<16&4294967295|I>>>16),I=y+(v^O^E)+R[10]+3200236656&4294967295,y=v+(I<<23&4294967295|I>>>9),I=E+(y^v^O)+R[13]+681279174&4294967295,E=y+(I<<4&4294967295|I>>>28),I=O+(E^y^v)+R[0]+3936430074&4294967295,O=E+(I<<11&4294967295|I>>>21),I=v+(O^E^y)+R[3]+3572445317&4294967295,v=O+(I<<16&4294967295|I>>>16),I=y+(v^O^E)+R[6]+76029189&4294967295,y=v+(I<<23&4294967295|I>>>9),I=E+(y^v^O)+R[9]+3654602809&4294967295,E=y+(I<<4&4294967295|I>>>28),I=O+(E^y^v)+R[12]+3873151461&4294967295,O=E+(I<<11&4294967295|I>>>21),I=v+(O^E^y)+R[15]+530742520&4294967295,v=O+(I<<16&4294967295|I>>>16),I=y+(v^O^E)+R[2]+3299628645&4294967295,y=v+(I<<23&4294967295|I>>>9),I=E+(v^(y|~O))+R[0]+4096336452&4294967295,E=y+(I<<6&4294967295|I>>>26),I=O+(y^(E|~v))+R[7]+1126891415&4294967295,O=E+(I<<10&4294967295|I>>>22),I=v+(E^(O|~y))+R[14]+2878612391&4294967295,v=O+(I<<15&4294967295|I>>>17),I=y+(O^(v|~E))+R[5]+4237533241&4294967295,y=v+(I<<21&4294967295|I>>>11),I=E+(v^(y|~O))+R[12]+1700485571&4294967295,E=y+(I<<6&4294967295|I>>>26),I=O+(y^(E|~v))+R[3]+2399980690&4294967295,O=E+(I<<10&4294967295|I>>>22),I=v+(E^(O|~y))+R[10]+4293915773&4294967295,v=O+(I<<15&4294967295|I>>>17),I=y+(O^(v|~E))+R[1]+2240044497&4294967295,y=v+(I<<21&4294967295|I>>>11),I=E+(v^(y|~O))+R[8]+1873313359&4294967295,E=y+(I<<6&4294967295|I>>>26),I=O+(y^(E|~v))+R[15]+4264355552&4294967295,O=E+(I<<10&4294967295|I>>>22),I=v+(E^(O|~y))+R[6]+2734768916&4294967295,v=O+(I<<15&4294967295|I>>>17),I=y+(O^(v|~E))+R[13]+1309151649&4294967295,y=v+(I<<21&4294967295|I>>>11),I=E+(v^(y|~O))+R[4]+4149444226&4294967295,E=y+(I<<6&4294967295|I>>>26),I=O+(y^(E|~v))+R[11]+3174756917&4294967295,O=E+(I<<10&4294967295|I>>>22),I=v+(E^(O|~y))+R[2]+718787259&4294967295,v=O+(I<<15&4294967295|I>>>17),I=y+(O^(v|~E))+R[9]+3951481745&4294967295,T.g[0]=T.g[0]+E&4294967295,T.g[1]=T.g[1]+(v+(I<<21&4294967295|I>>>11))&4294967295,T.g[2]=T.g[2]+v&4294967295,T.g[3]=T.g[3]+O&4294967295}n.prototype.v=function(T,E){E===void 0&&(E=T.length);const y=E-this.blockSize,R=this.C;let v=this.h,O=0;for(;O<E;){if(v==0)for(;O<=y;)s(this,T,O),O+=this.blockSize;if(typeof T=="string"){for(;O<E;)if(R[v++]=T.charCodeAt(O++),v==this.blockSize){s(this,R),v=0;break}}else for(;O<E;)if(R[v++]=T[O++],v==this.blockSize){s(this,R),v=0;break}}this.h=v,this.o+=E},n.prototype.A=function(){var T=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);T[0]=128;for(var E=1;E<T.length-8;++E)T[E]=0;E=this.o*8;for(var y=T.length-8;y<T.length;++y)T[y]=E&255,E/=256;for(this.v(T),T=Array(16),E=0,y=0;y<4;++y)for(let R=0;R<32;R+=8)T[E++]=this.g[y]>>>R&255;return T};function i(T,E){var y=a;return Object.prototype.hasOwnProperty.call(y,T)?y[T]:y[T]=E(T)}function o(T,E){this.h=E;const y=[];let R=!0;for(let v=T.length-1;v>=0;v--){const O=T[v]|0;R&&O==E||(y[v]=O,R=!1)}this.g=y}var a={};function u(T){return-128<=T&&T<128?i(T,function(E){return new o([E|0],E<0?-1:0)}):new o([T|0],T<0?-1:0)}function l(T){if(isNaN(T)||!isFinite(T))return d;if(T<0)return V(l(-T));const E=[];let y=1;for(let R=0;T>=y;R++)E[R]=T/y|0,y*=4294967296;return new o(E,0)}function B(T,E){if(T.length==0)throw Error("number format error: empty string");if(E=E||10,E<2||36<E)throw Error("radix out of range: "+E);if(T.charAt(0)=="-")return V(B(T.substring(1),E));if(T.indexOf("-")>=0)throw Error('number format error: interior "-" character');const y=l(Math.pow(E,8));let R=d;for(let O=0;O<T.length;O+=8){var v=Math.min(8,T.length-O);const I=parseInt(T.substring(O,O+v),E);v<8?(v=l(Math.pow(E,v)),R=R.j(v).add(l(I))):(R=R.j(y),R=R.add(l(I)))}return R}var d=u(0),C=u(1),g=u(16777216);r=o.prototype,r.m=function(){if(N(this))return-V(this).m();let T=0,E=1;for(let y=0;y<this.g.length;y++){const R=this.i(y);T+=(R>=0?R:4294967296+R)*E,E*=4294967296}return T},r.toString=function(T){if(T=T||10,T<2||36<T)throw Error("radix out of range: "+T);if(D(this))return"0";if(N(this))return"-"+V(this).toString(T);const E=l(Math.pow(T,6));var y=this;let R="";for(;;){const v=de(y,E).g;y=H(y,v.j(E));let O=((y.g.length>0?y.g[0]:y.h)>>>0).toString(T);if(y=v,D(y))return O+R;for(;O.length<6;)O="0"+O;R=O+R}},r.i=function(T){return T<0?0:T<this.g.length?this.g[T]:this.h};function D(T){if(T.h!=0)return!1;for(let E=0;E<T.g.length;E++)if(T.g[E]!=0)return!1;return!0}function N(T){return T.h==-1}r.l=function(T){return T=H(this,T),N(T)?-1:D(T)?0:1};function V(T){const E=T.g.length,y=[];for(let R=0;R<E;R++)y[R]=~T.g[R];return new o(y,~T.h).add(C)}r.abs=function(){return N(this)?V(this):this},r.add=function(T){const E=Math.max(this.g.length,T.g.length),y=[];let R=0;for(let v=0;v<=E;v++){let O=R+(this.i(v)&65535)+(T.i(v)&65535),I=(O>>>16)+(this.i(v)>>>16)+(T.i(v)>>>16);R=I>>>16,O&=65535,I&=65535,y[v]=I<<16|O}return new o(y,y[y.length-1]&-2147483648?-1:0)};function H(T,E){return T.add(V(E))}r.j=function(T){if(D(this)||D(T))return d;if(N(this))return N(T)?V(this).j(V(T)):V(V(this).j(T));if(N(T))return V(this.j(V(T)));if(this.l(g)<0&&T.l(g)<0)return l(this.m()*T.m());const E=this.g.length+T.g.length,y=[];for(var R=0;R<2*E;R++)y[R]=0;for(R=0;R<this.g.length;R++)for(let v=0;v<T.g.length;v++){const O=this.i(R)>>>16,I=this.i(R)&65535,At=T.i(v)>>>16,Ur=T.i(v)&65535;y[2*R+2*v]+=I*Ur,Z(y,2*R+2*v),y[2*R+2*v+1]+=O*Ur,Z(y,2*R+2*v+1),y[2*R+2*v+1]+=I*At,Z(y,2*R+2*v+1),y[2*R+2*v+2]+=O*At,Z(y,2*R+2*v+2)}for(T=0;T<E;T++)y[T]=y[2*T+1]<<16|y[2*T];for(T=E;T<2*E;T++)y[T]=0;return new o(y,0)};function Z(T,E){for(;(T[E]&65535)!=T[E];)T[E+1]+=T[E]>>>16,T[E]&=65535,E++}function re(T,E){this.g=T,this.h=E}function de(T,E){if(D(E))throw Error("division by zero");if(D(T))return new re(d,d);if(N(T))return E=de(V(T),E),new re(V(E.g),V(E.h));if(N(E))return E=de(T,V(E)),new re(V(E.g),E.h);if(T.g.length>30){if(N(T)||N(E))throw Error("slowDivide_ only works with positive integers.");for(var y=C,R=E;R.l(T)<=0;)y=Ce(y),R=Ce(R);var v=le(y,1),O=le(R,1);for(R=le(R,2),y=le(y,2);!D(R);){var I=O.add(R);I.l(T)<=0&&(v=v.add(y),O=I),R=le(R,1),y=le(y,1)}return E=H(T,v.j(E)),new re(v,E)}for(v=d;T.l(E)>=0;){for(y=Math.max(1,Math.floor(T.m()/E.m())),R=Math.ceil(Math.log(y)/Math.LN2),R=R<=48?1:Math.pow(2,R-48),O=l(y),I=O.j(E);N(I)||I.l(T)>0;)y-=R,O=l(y),I=O.j(E);D(O)&&(O=C),v=v.add(O),T=H(T,I)}return new re(v,T)}r.B=function(T){return de(this,T).h},r.and=function(T){const E=Math.max(this.g.length,T.g.length),y=[];for(let R=0;R<E;R++)y[R]=this.i(R)&T.i(R);return new o(y,this.h&T.h)},r.or=function(T){const E=Math.max(this.g.length,T.g.length),y=[];for(let R=0;R<E;R++)y[R]=this.i(R)|T.i(R);return new o(y,this.h|T.h)},r.xor=function(T){const E=Math.max(this.g.length,T.g.length),y=[];for(let R=0;R<E;R++)y[R]=this.i(R)^T.i(R);return new o(y,this.h^T.h)};function Ce(T){const E=T.g.length+1,y=[];for(let R=0;R<E;R++)y[R]=T.i(R)<<1|T.i(R-1)>>>31;return new o(y,T.h)}function le(T,E){const y=E>>5;E%=32;const R=T.g.length-y,v=[];for(let O=0;O<R;O++)v[O]=E>0?T.i(O+y)>>>E|T.i(O+y+1)<<32-E:T.i(O+y);return new o(v,T.h)}n.prototype.digest=n.prototype.A,n.prototype.reset=n.prototype.u,n.prototype.update=n.prototype.v,yg=n,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=l,o.fromString=B,pr=o}).apply(typeof Mf<"u"?Mf:typeof self<"u"?self:typeof window<"u"?window:{});var Za=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var wg,To,Tg,pu,Kl,Ag,vg,Rg;(function(){var r,e=Object.defineProperty;function t(c){c=[typeof globalThis=="object"&&globalThis,c,typeof window=="object"&&window,typeof self=="object"&&self,typeof Za=="object"&&Za];for(var h=0;h<c.length;++h){var f=c[h];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var n=t(this);function s(c,h){if(h)e:{var f=n;c=c.split(".");for(var p=0;p<c.length-1;p++){var b=c[p];if(!(b in f))break e;f=f[b]}c=c[c.length-1],p=f[c],h=h(p),h!=p&&h!=null&&e(f,c,{configurable:!0,writable:!0,value:h})}}s("Symbol.dispose",function(c){return c||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(c){return c||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(c){return c||function(h){var f=[],p;for(p in h)Object.prototype.hasOwnProperty.call(h,p)&&f.push([p,h[p]]);return f}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},o=this||self;function a(c){var h=typeof c;return h=="object"&&c!=null||h=="function"}function u(c,h,f){return c.call.apply(c.bind,arguments)}function l(c,h,f){return l=u,l.apply(null,arguments)}function B(c,h){var f=Array.prototype.slice.call(arguments,1);return function(){var p=f.slice();return p.push.apply(p,arguments),c.apply(this,p)}}function d(c,h){function f(){}f.prototype=h.prototype,c.Z=h.prototype,c.prototype=new f,c.prototype.constructor=c,c.Ob=function(p,b,F){for(var $=Array(arguments.length-2),ce=2;ce<arguments.length;ce++)$[ce-2]=arguments[ce];return h.prototype[b].apply(p,$)}}var C=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?c=>c&&AsyncContext.Snapshot.wrap(c):c=>c;function g(c){const h=c.length;if(h>0){const f=Array(h);for(let p=0;p<h;p++)f[p]=c[p];return f}return[]}function D(c,h){for(let p=1;p<arguments.length;p++){const b=arguments[p];var f=typeof b;if(f=f!="object"?f:b?Array.isArray(b)?"array":f:"null",f=="array"||f=="object"&&typeof b.length=="number"){f=c.length||0;const F=b.length||0;c.length=f+F;for(let $=0;$<F;$++)c[f+$]=b[$]}else c.push(b)}}class N{constructor(h,f){this.i=h,this.j=f,this.h=0,this.g=null}get(){let h;return this.h>0?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function V(c){o.setTimeout(()=>{throw c},0)}function H(){var c=T;let h=null;return c.g&&(h=c.g,c.g=c.g.next,c.g||(c.h=null),h.next=null),h}class Z{constructor(){this.h=this.g=null}add(h,f){const p=re.get();p.set(h,f),this.h?this.h.next=p:this.g=p,this.h=p}}var re=new N(()=>new de,c=>c.reset());class de{constructor(){this.next=this.g=this.h=null}set(h,f){this.h=h,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let Ce,le=!1,T=new Z,E=()=>{const c=Promise.resolve(void 0);Ce=()=>{c.then(y)}};function y(){for(var c;c=H();){try{c.h.call(c.g)}catch(f){V(f)}var h=re;h.j(c),h.h<100&&(h.h++,c.next=h.g,h.g=c)}le=!1}function R(){this.u=this.u,this.C=this.C}R.prototype.u=!1,R.prototype.dispose=function(){this.u||(this.u=!0,this.N())},R.prototype[Symbol.dispose]=function(){this.dispose()},R.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function v(c,h){this.type=c,this.g=this.target=h,this.defaultPrevented=!1}v.prototype.h=function(){this.defaultPrevented=!0};var O=(function(){if(!o.addEventListener||!Object.defineProperty)return!1;var c=!1,h=Object.defineProperty({},"passive",{get:function(){c=!0}});try{const f=()=>{};o.addEventListener("test",f,h),o.removeEventListener("test",f,h)}catch{}return c})();function I(c){return/^[\s\xa0]*$/.test(c)}function At(c,h){v.call(this,c?c.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,c&&this.init(c,h)}d(At,v),At.prototype.init=function(c,h){const f=this.type=c.type,p=c.changedTouches&&c.changedTouches.length?c.changedTouches[0]:null;this.target=c.target||c.srcElement,this.g=h,h=c.relatedTarget,h||(f=="mouseover"?h=c.fromElement:f=="mouseout"&&(h=c.toElement)),this.relatedTarget=h,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=c.clientX!==void 0?c.clientX:c.pageX,this.clientY=c.clientY!==void 0?c.clientY:c.pageY,this.screenX=c.screenX||0,this.screenY=c.screenY||0),this.button=c.button,this.key=c.key||"",this.ctrlKey=c.ctrlKey,this.altKey=c.altKey,this.shiftKey=c.shiftKey,this.metaKey=c.metaKey,this.pointerId=c.pointerId||0,this.pointerType=c.pointerType,this.state=c.state,this.i=c,c.defaultPrevented&&At.Z.h.call(this)},At.prototype.h=function(){At.Z.h.call(this);const c=this.i;c.preventDefault?c.preventDefault():c.returnValue=!1};var Ur="closure_listenable_"+(Math.random()*1e6|0),zI=0;function QI(c,h,f,p,b){this.listener=c,this.proxy=null,this.src=h,this.type=f,this.capture=!!p,this.ha=b,this.key=++zI,this.da=this.fa=!1}function xa(c){c.da=!0,c.listener=null,c.proxy=null,c.src=null,c.ha=null}function Ma(c,h,f){for(const p in c)h.call(f,c[p],p,c)}function WI(c,h){for(const f in c)h.call(void 0,c[f],f,c)}function Rd(c){const h={};for(const f in c)h[f]=c[f];return h}const Pd="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function bd(c,h){let f,p;for(let b=1;b<arguments.length;b++){p=arguments[b];for(f in p)c[f]=p[f];for(let F=0;F<Pd.length;F++)f=Pd[F],Object.prototype.hasOwnProperty.call(p,f)&&(c[f]=p[f])}}function Ga(c){this.src=c,this.g={},this.h=0}Ga.prototype.add=function(c,h,f,p,b){const F=c.toString();c=this.g[F],c||(c=this.g[F]=[],this.h++);const $=zc(c,h,p,b);return $>-1?(h=c[$],f||(h.fa=!1)):(h=new QI(h,this.src,F,!!p,b),h.fa=f,c.push(h)),h};function Kc(c,h){const f=h.type;if(f in c.g){var p=c.g[f],b=Array.prototype.indexOf.call(p,h,void 0),F;(F=b>=0)&&Array.prototype.splice.call(p,b,1),F&&(xa(h),c.g[f].length==0&&(delete c.g[f],c.h--))}}function zc(c,h,f,p){for(let b=0;b<c.length;++b){const F=c[b];if(!F.da&&F.listener==h&&F.capture==!!f&&F.ha==p)return b}return-1}var Qc="closure_lm_"+(Math.random()*1e6|0),Wc={};function Sd(c,h,f,p,b){if(Array.isArray(h)){for(let F=0;F<h.length;F++)Sd(c,h[F],f,p,b);return null}return f=Fd(f),c&&c[Ur]?c.J(h,f,a(p)?!!p.capture:!1,b):$I(c,h,f,!1,p,b)}function $I(c,h,f,p,b,F){if(!h)throw Error("Invalid event type");const $=a(b)?!!b.capture:!!b;let ce=Yc(c);if(ce||(c[Qc]=ce=new Ga(c)),f=ce.add(h,f,p,$,F),f.proxy)return f;if(p=YI(),f.proxy=p,p.src=c,p.listener=f,c.addEventListener)O||(b=$),b===void 0&&(b=!1),c.addEventListener(h.toString(),p,b);else if(c.attachEvent)c.attachEvent(Od(h.toString()),p);else if(c.addListener&&c.removeListener)c.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return f}function YI(){function c(f){return h.call(c.src,c.listener,f)}const h=XI;return c}function Nd(c,h,f,p,b){if(Array.isArray(h))for(var F=0;F<h.length;F++)Nd(c,h[F],f,p,b);else p=a(p)?!!p.capture:!!p,f=Fd(f),c&&c[Ur]?(c=c.i,F=String(h).toString(),F in c.g&&(h=c.g[F],f=zc(h,f,p,b),f>-1&&(xa(h[f]),Array.prototype.splice.call(h,f,1),h.length==0&&(delete c.g[F],c.h--)))):c&&(c=Yc(c))&&(h=c.g[h.toString()],c=-1,h&&(c=zc(h,f,p,b)),(f=c>-1?h[c]:null)&&$c(f))}function $c(c){if(typeof c!="number"&&c&&!c.da){var h=c.src;if(h&&h[Ur])Kc(h.i,c);else{var f=c.type,p=c.proxy;h.removeEventListener?h.removeEventListener(f,p,c.capture):h.detachEvent?h.detachEvent(Od(f),p):h.addListener&&h.removeListener&&h.removeListener(p),(f=Yc(h))?(Kc(f,c),f.h==0&&(f.src=null,h[Qc]=null)):xa(c)}}}function Od(c){return c in Wc?Wc[c]:Wc[c]="on"+c}function XI(c,h){if(c.da)c=!0;else{h=new At(h,this);const f=c.listener,p=c.ha||c.src;c.fa&&$c(c),c=f.call(p,h)}return c}function Yc(c){return c=c[Qc],c instanceof Ga?c:null}var Xc="__closure_events_fn_"+(Math.random()*1e9>>>0);function Fd(c){return typeof c=="function"?c:(c[Xc]||(c[Xc]=function(h){return c.handleEvent(h)}),c[Xc])}function dt(){R.call(this),this.i=new Ga(this),this.M=this,this.G=null}d(dt,R),dt.prototype[Ur]=!0,dt.prototype.removeEventListener=function(c,h,f,p){Nd(this,c,h,f,p)};function It(c,h){var f,p=c.G;if(p)for(f=[];p;p=p.G)f.push(p);if(c=c.M,p=h.type||h,typeof h=="string")h=new v(h,c);else if(h instanceof v)h.target=h.target||c;else{var b=h;h=new v(p,c),bd(h,b)}b=!0;let F,$;if(f)for($=f.length-1;$>=0;$--)F=h.g=f[$],b=Ua(F,p,!0,h)&&b;if(F=h.g=c,b=Ua(F,p,!0,h)&&b,b=Ua(F,p,!1,h)&&b,f)for($=0;$<f.length;$++)F=h.g=f[$],b=Ua(F,p,!1,h)&&b}dt.prototype.N=function(){if(dt.Z.N.call(this),this.i){var c=this.i;for(const h in c.g){const f=c.g[h];for(let p=0;p<f.length;p++)xa(f[p]);delete c.g[h],c.h--}}this.G=null},dt.prototype.J=function(c,h,f,p){return this.i.add(String(c),h,!1,f,p)},dt.prototype.K=function(c,h,f,p){return this.i.add(String(c),h,!0,f,p)};function Ua(c,h,f,p){if(h=c.i.g[String(h)],!h)return!0;h=h.concat();let b=!0;for(let F=0;F<h.length;++F){const $=h[F];if($&&!$.da&&$.capture==f){const ce=$.listener,Ze=$.ha||$.src;$.fa&&Kc(c.i,$),b=ce.call(Ze,p)!==!1&&b}}return b&&!p.defaultPrevented}function ZI(c,h){if(typeof c!="function")if(c&&typeof c.handleEvent=="function")c=l(c.handleEvent,c);else throw Error("Invalid listener argument");return Number(h)>2147483647?-1:o.setTimeout(c,h||0)}function Ld(c){c.g=ZI(()=>{c.g=null,c.i&&(c.i=!1,Ld(c))},c.l);const h=c.h;c.h=null,c.m.apply(null,h)}class eD extends R{constructor(h,f){super(),this.m=h,this.l=f,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:Ld(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Zi(c){R.call(this),this.h=c,this.g={}}d(Zi,R);var Vd=[];function kd(c){Ma(c.g,function(h,f){this.g.hasOwnProperty(f)&&$c(h)},c),c.g={}}Zi.prototype.N=function(){Zi.Z.N.call(this),kd(this)},Zi.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Zc=o.JSON.stringify,tD=o.JSON.parse,nD=class{stringify(c){return o.JSON.stringify(c,void 0)}parse(c){return o.JSON.parse(c,void 0)}};function xd(){}function Md(){}var eo={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function el(){v.call(this,"d")}d(el,v);function tl(){v.call(this,"c")}d(tl,v);var Hr={},Gd=null;function Ha(){return Gd=Gd||new dt}Hr.Ia="serverreachability";function Ud(c){v.call(this,Hr.Ia,c)}d(Ud,v);function to(c){const h=Ha();It(h,new Ud(h))}Hr.STAT_EVENT="statevent";function Hd(c,h){v.call(this,Hr.STAT_EVENT,c),this.stat=h}d(Hd,v);function Dt(c){const h=Ha();It(h,new Hd(h,c))}Hr.Ja="timingevent";function qd(c,h){v.call(this,Hr.Ja,c),this.size=h}d(qd,v);function no(c,h){if(typeof c!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){c()},h)}function ro(){this.g=!0}ro.prototype.ua=function(){this.g=!1};function rD(c,h,f,p,b,F){c.info(function(){if(c.g)if(F){var $="",ce=F.split("&");for(let Te=0;Te<ce.length;Te++){var Ze=ce[Te].split("=");if(Ze.length>1){const it=Ze[0];Ze=Ze[1];const nn=it.split("_");$=nn.length>=2&&nn[1]=="type"?$+(it+"="+Ze+"&"):$+(it+"=redacted&")}}}else $=null;else $=F;return"XMLHTTP REQ ("+p+") [attempt "+b+"]: "+h+`
`+f+`
`+$})}function sD(c,h,f,p,b,F,$){c.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+b+"]: "+h+`
`+f+`
`+F+" "+$})}function Fs(c,h,f,p){c.info(function(){return"XMLHTTP TEXT ("+h+"): "+oD(c,f)+(p?" "+p:"")})}function iD(c,h){c.info(function(){return"TIMEOUT: "+h})}ro.prototype.info=function(){};function oD(c,h){if(!c.g)return h;if(!h)return null;try{const F=JSON.parse(h);if(F){for(c=0;c<F.length;c++)if(Array.isArray(F[c])){var f=F[c];if(!(f.length<2)){var p=f[1];if(Array.isArray(p)&&!(p.length<1)){var b=p[0];if(b!="noop"&&b!="stop"&&b!="close")for(let $=1;$<p.length;$++)p[$]=""}}}}return Zc(F)}catch{return h}}var qa={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},jd={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Jd;function nl(){}d(nl,xd),nl.prototype.g=function(){return new XMLHttpRequest},Jd=new nl;function so(c){return encodeURIComponent(String(c))}function aD(c){var h=1;c=c.split(":");const f=[];for(;h>0&&c.length;)f.push(c.shift()),h--;return c.length&&f.push(c.join(":")),f}function $n(c,h,f,p){this.j=c,this.i=h,this.l=f,this.S=p||1,this.V=new Zi(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Kd}function Kd(){this.i=null,this.g="",this.h=!1}var zd={},rl={};function sl(c,h,f){c.M=1,c.A=Ja(tn(h)),c.u=f,c.R=!0,Qd(c,null)}function Qd(c,h){c.F=Date.now(),ja(c),c.B=tn(c.A);var f=c.B,p=c.S;Array.isArray(p)||(p=[String(p)]),uf(f.i,"t",p),c.C=0,f=c.j.L,c.h=new Kd,c.g=Af(c.j,f?h:null,!c.u),c.P>0&&(c.O=new eD(l(c.Y,c,c.g),c.P)),h=c.V,f=c.g,p=c.ba;var b="readystatechange";Array.isArray(b)||(b&&(Vd[0]=b.toString()),b=Vd);for(let F=0;F<b.length;F++){const $=Sd(f,b[F],p||h.handleEvent,!1,h.h||h);if(!$)break;h.g[$.key]=$}h=c.J?Rd(c.J):{},c.u?(c.v||(c.v="POST"),h["Content-Type"]="application/x-www-form-urlencoded",c.g.ea(c.B,c.v,c.u,h)):(c.v="GET",c.g.ea(c.B,c.v,null,h)),to(),rD(c.i,c.v,c.B,c.l,c.S,c.u)}$n.prototype.ba=function(c){c=c.target;const h=this.O;h&&Zn(c)==3?h.j():this.Y(c)},$n.prototype.Y=function(c){try{if(c==this.g)e:{const ce=Zn(this.g),Ze=this.g.ya(),Te=this.g.ca();if(!(ce<3)&&(ce!=3||this.g&&(this.h.h||this.g.la()||Cf(this.g)))){this.K||ce!=4||Ze==7||(Ze==8||Te<=0?to(3):to(2)),il(this);var h=this.g.ca();this.X=h;var f=uD(this);if(this.o=h==200,sD(this.i,this.v,this.B,this.l,this.S,ce,h),this.o){if(this.U&&!this.L){t:{if(this.g){var p,b=this.g;if((p=b.g?b.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!I(p)){var F=p;break t}}F=null}if(c=F)Fs(this.i,this.l,c,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,ol(this,c);else{this.o=!1,this.m=3,Dt(12),qr(this),io(this);break e}}if(this.R){c=!0;let it;for(;!this.K&&this.C<f.length;)if(it=cD(this,f),it==rl){ce==4&&(this.m=4,Dt(14),c=!1),Fs(this.i,this.l,null,"[Incomplete Response]");break}else if(it==zd){this.m=4,Dt(15),Fs(this.i,this.l,f,"[Invalid Chunk]"),c=!1;break}else Fs(this.i,this.l,it,null),ol(this,it);if(Wd(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),ce!=4||f.length!=0||this.h.h||(this.m=1,Dt(16),c=!1),this.o=this.o&&c,!c)Fs(this.i,this.l,f,"[Invalid Chunked Response]"),qr(this),io(this);else if(f.length>0&&!this.W){this.W=!0;var $=this.j;$.g==this&&$.aa&&!$.P&&($.j.info("Great, no buffering proxy detected. Bytes received: "+f.length),fl($),$.P=!0,Dt(11))}}else Fs(this.i,this.l,f,null),ol(this,f);ce==4&&qr(this),this.o&&!this.K&&(ce==4?Df(this.j,this):(this.o=!1,ja(this)))}else yD(this.g),h==400&&f.indexOf("Unknown SID")>0?(this.m=3,Dt(12)):(this.m=0,Dt(13)),qr(this),io(this)}}}catch{}finally{}};function uD(c){if(!Wd(c))return c.g.la();const h=Cf(c.g);if(h==="")return"";let f="";const p=h.length,b=Zn(c.g)==4;if(!c.h.i){if(typeof TextDecoder>"u")return qr(c),io(c),"";c.h.i=new o.TextDecoder}for(let F=0;F<p;F++)c.h.h=!0,f+=c.h.i.decode(h[F],{stream:!(b&&F==p-1)});return h.length=0,c.h.g+=f,c.C=0,c.h.g}function Wd(c){return c.g?c.v=="GET"&&c.M!=2&&c.j.Aa:!1}function cD(c,h){var f=c.C,p=h.indexOf(`
`,f);return p==-1?rl:(f=Number(h.substring(f,p)),isNaN(f)?zd:(p+=1,p+f>h.length?rl:(h=h.slice(p,p+f),c.C=p+f,h)))}$n.prototype.cancel=function(){this.K=!0,qr(this)};function ja(c){c.T=Date.now()+c.H,$d(c,c.H)}function $d(c,h){if(c.D!=null)throw Error("WatchDog timer not null");c.D=no(l(c.aa,c),h)}function il(c){c.D&&(o.clearTimeout(c.D),c.D=null)}$n.prototype.aa=function(){this.D=null;const c=Date.now();c-this.T>=0?(iD(this.i,this.B),this.M!=2&&(to(),Dt(17)),qr(this),this.m=2,io(this)):$d(this,this.T-c)};function io(c){c.j.I==0||c.K||Df(c.j,c)}function qr(c){il(c);var h=c.O;h&&typeof h.dispose=="function"&&h.dispose(),c.O=null,kd(c.V),c.g&&(h=c.g,c.g=null,h.abort(),h.dispose())}function ol(c,h){try{var f=c.j;if(f.I!=0&&(f.g==c||al(f.h,c))){if(!c.L&&al(f.h,c)&&f.I==3){try{var p=f.Ba.g.parse(h)}catch{p=null}if(Array.isArray(p)&&p.length==3){var b=p;if(b[0]==0){e:if(!f.v){if(f.g)if(f.g.F+3e3<c.F)$a(f),Qa(f);else break e;dl(f),Dt(18)}}else f.xa=b[1],0<f.xa-f.K&&b[2]<37500&&f.F&&f.A==0&&!f.C&&(f.C=no(l(f.Va,f),6e3));Zd(f.h)<=1&&f.ta&&(f.ta=void 0)}else Jr(f,11)}else if((c.L||f.g==c)&&$a(f),!I(h))for(b=f.Ba.g.parse(h),h=0;h<b.length;h++){let Te=b[h];const it=Te[0];if(!(it<=f.K))if(f.K=it,Te=Te[1],f.I==2)if(Te[0]=="c"){f.M=Te[1],f.ba=Te[2];const nn=Te[3];nn!=null&&(f.ka=nn,f.j.info("VER="+f.ka));const Kr=Te[4];Kr!=null&&(f.za=Kr,f.j.info("SVER="+f.za));const er=Te[5];er!=null&&typeof er=="number"&&er>0&&(p=1.5*er,f.O=p,f.j.info("backChannelRequestTimeoutMs_="+p)),p=f;const tr=c.g;if(tr){const Xa=tr.g?tr.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Xa){var F=p.h;F.g||Xa.indexOf("spdy")==-1&&Xa.indexOf("quic")==-1&&Xa.indexOf("h2")==-1||(F.j=F.l,F.g=new Set,F.h&&(ul(F,F.h),F.h=null))}if(p.G){const Cl=tr.g?tr.g.getResponseHeader("X-HTTP-Session-Id"):null;Cl&&(p.wa=Cl,Ne(p.J,p.G,Cl))}}f.I=3,f.l&&f.l.ra(),f.aa&&(f.T=Date.now()-c.F,f.j.info("Handshake RTT: "+f.T+"ms")),p=f;var $=c;if(p.na=Tf(p,p.L?p.ba:null,p.W),$.L){ef(p.h,$);var ce=$,Ze=p.O;Ze&&(ce.H=Ze),ce.D&&(il(ce),ja(ce)),p.g=$}else Ef(p);f.i.length>0&&Wa(f)}else Te[0]!="stop"&&Te[0]!="close"||Jr(f,7);else f.I==3&&(Te[0]=="stop"||Te[0]=="close"?Te[0]=="stop"?Jr(f,7):hl(f):Te[0]!="noop"&&f.l&&f.l.qa(Te),f.A=0)}}to(4)}catch{}}var lD=class{constructor(c,h){this.g=c,this.map=h}};function Yd(c){this.l=c||10,o.PerformanceNavigationTiming?(c=o.performance.getEntriesByType("navigation"),c=c.length>0&&(c[0].nextHopProtocol=="hq"||c[0].nextHopProtocol=="h2")):c=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=c?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Xd(c){return c.h?!0:c.g?c.g.size>=c.j:!1}function Zd(c){return c.h?1:c.g?c.g.size:0}function al(c,h){return c.h?c.h==h:c.g?c.g.has(h):!1}function ul(c,h){c.g?c.g.add(h):c.h=h}function ef(c,h){c.h&&c.h==h?c.h=null:c.g&&c.g.has(h)&&c.g.delete(h)}Yd.prototype.cancel=function(){if(this.i=tf(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const c of this.g.values())c.cancel();this.g.clear()}};function tf(c){if(c.h!=null)return c.i.concat(c.h.G);if(c.g!=null&&c.g.size!==0){let h=c.i;for(const f of c.g.values())h=h.concat(f.G);return h}return g(c.i)}var nf=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function BD(c,h){if(c){c=c.split("&");for(let f=0;f<c.length;f++){const p=c[f].indexOf("=");let b,F=null;p>=0?(b=c[f].substring(0,p),F=c[f].substring(p+1)):b=c[f],h(b,F?decodeURIComponent(F.replace(/\+/g," ")):"")}}}function Yn(c){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let h;c instanceof Yn?(this.l=c.l,oo(this,c.j),this.o=c.o,this.g=c.g,ao(this,c.u),this.h=c.h,cl(this,cf(c.i)),this.m=c.m):c&&(h=String(c).match(nf))?(this.l=!1,oo(this,h[1]||"",!0),this.o=uo(h[2]||""),this.g=uo(h[3]||"",!0),ao(this,h[4]),this.h=uo(h[5]||"",!0),cl(this,h[6]||"",!0),this.m=uo(h[7]||"")):(this.l=!1,this.i=new lo(null,this.l))}Yn.prototype.toString=function(){const c=[];var h=this.j;h&&c.push(co(h,rf,!0),":");var f=this.g;return(f||h=="file")&&(c.push("//"),(h=this.o)&&c.push(co(h,rf,!0),"@"),c.push(so(f).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.u,f!=null&&c.push(":",String(f))),(f=this.h)&&(this.g&&f.charAt(0)!="/"&&c.push("/"),c.push(co(f,f.charAt(0)=="/"?fD:dD,!0))),(f=this.i.toString())&&c.push("?",f),(f=this.m)&&c.push("#",co(f,pD)),c.join("")},Yn.prototype.resolve=function(c){const h=tn(this);let f=!!c.j;f?oo(h,c.j):f=!!c.o,f?h.o=c.o:f=!!c.g,f?h.g=c.g:f=c.u!=null;var p=c.h;if(f)ao(h,c.u);else if(f=!!c.h){if(p.charAt(0)!="/")if(this.g&&!this.h)p="/"+p;else{var b=h.h.lastIndexOf("/");b!=-1&&(p=h.h.slice(0,b+1)+p)}if(b=p,b==".."||b==".")p="";else if(b.indexOf("./")!=-1||b.indexOf("/.")!=-1){p=b.lastIndexOf("/",0)==0,b=b.split("/");const F=[];for(let $=0;$<b.length;){const ce=b[$++];ce=="."?p&&$==b.length&&F.push(""):ce==".."?((F.length>1||F.length==1&&F[0]!="")&&F.pop(),p&&$==b.length&&F.push("")):(F.push(ce),p=!0)}p=F.join("/")}else p=b}return f?h.h=p:f=c.i.toString()!=="",f?cl(h,cf(c.i)):f=!!c.m,f&&(h.m=c.m),h};function tn(c){return new Yn(c)}function oo(c,h,f){c.j=f?uo(h,!0):h,c.j&&(c.j=c.j.replace(/:$/,""))}function ao(c,h){if(h){if(h=Number(h),isNaN(h)||h<0)throw Error("Bad port number "+h);c.u=h}else c.u=null}function cl(c,h,f){h instanceof lo?(c.i=h,gD(c.i,c.l)):(f||(h=co(h,CD)),c.i=new lo(h,c.l))}function Ne(c,h,f){c.i.set(h,f)}function Ja(c){return Ne(c,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),c}function uo(c,h){return c?h?decodeURI(c.replace(/%25/g,"%2525")):decodeURIComponent(c):""}function co(c,h,f){return typeof c=="string"?(c=encodeURI(c).replace(h,hD),f&&(c=c.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c):null}function hD(c){return c=c.charCodeAt(0),"%"+(c>>4&15).toString(16)+(c&15).toString(16)}var rf=/[#\/\?@]/g,dD=/[#\?:]/g,fD=/[#\?]/g,CD=/[#\?@]/g,pD=/#/g;function lo(c,h){this.h=this.g=null,this.i=c||null,this.j=!!h}function jr(c){c.g||(c.g=new Map,c.h=0,c.i&&BD(c.i,function(h,f){c.add(decodeURIComponent(h.replace(/\+/g," ")),f)}))}r=lo.prototype,r.add=function(c,h){jr(this),this.i=null,c=Ls(this,c);let f=this.g.get(c);return f||this.g.set(c,f=[]),f.push(h),this.h+=1,this};function sf(c,h){jr(c),h=Ls(c,h),c.g.has(h)&&(c.i=null,c.h-=c.g.get(h).length,c.g.delete(h))}function of(c,h){return jr(c),h=Ls(c,h),c.g.has(h)}r.forEach=function(c,h){jr(this),this.g.forEach(function(f,p){f.forEach(function(b){c.call(h,b,p,this)},this)},this)};function af(c,h){jr(c);let f=[];if(typeof h=="string")of(c,h)&&(f=f.concat(c.g.get(Ls(c,h))));else for(c=Array.from(c.g.values()),h=0;h<c.length;h++)f=f.concat(c[h]);return f}r.set=function(c,h){return jr(this),this.i=null,c=Ls(this,c),of(this,c)&&(this.h-=this.g.get(c).length),this.g.set(c,[h]),this.h+=1,this},r.get=function(c,h){return c?(c=af(this,c),c.length>0?String(c[0]):h):h};function uf(c,h,f){sf(c,h),f.length>0&&(c.i=null,c.g.set(Ls(c,h),g(f)),c.h+=f.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const c=[],h=Array.from(this.g.keys());for(let p=0;p<h.length;p++){var f=h[p];const b=so(f);f=af(this,f);for(let F=0;F<f.length;F++){let $=b;f[F]!==""&&($+="="+so(f[F])),c.push($)}}return this.i=c.join("&")};function cf(c){const h=new lo;return h.i=c.i,c.g&&(h.g=new Map(c.g),h.h=c.h),h}function Ls(c,h){return h=String(h),c.j&&(h=h.toLowerCase()),h}function gD(c,h){h&&!c.j&&(jr(c),c.i=null,c.g.forEach(function(f,p){const b=p.toLowerCase();p!=b&&(sf(this,p),uf(this,b,f))},c)),c.j=h}function mD(c,h){const f=new ro;if(o.Image){const p=new Image;p.onload=B(Xn,f,"TestLoadImage: loaded",!0,h,p),p.onerror=B(Xn,f,"TestLoadImage: error",!1,h,p),p.onabort=B(Xn,f,"TestLoadImage: abort",!1,h,p),p.ontimeout=B(Xn,f,"TestLoadImage: timeout",!1,h,p),o.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=c}else h(!1)}function _D(c,h){const f=new ro,p=new AbortController,b=setTimeout(()=>{p.abort(),Xn(f,"TestPingServer: timeout",!1,h)},1e4);fetch(c,{signal:p.signal}).then(F=>{clearTimeout(b),F.ok?Xn(f,"TestPingServer: ok",!0,h):Xn(f,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(b),Xn(f,"TestPingServer: error",!1,h)})}function Xn(c,h,f,p,b){try{b&&(b.onload=null,b.onerror=null,b.onabort=null,b.ontimeout=null),p(f)}catch{}}function ED(){this.g=new nD}function ll(c){this.i=c.Sb||null,this.h=c.ab||!1}d(ll,xd),ll.prototype.g=function(){return new Ka(this.i,this.h)};function Ka(c,h){dt.call(this),this.H=c,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}d(Ka,dt),r=Ka.prototype,r.open=function(c,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=c,this.D=h,this.readyState=1,ho(this)},r.send=function(c){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const h={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};c&&(h.body=c),(this.H||o).fetch(new Request(this.D,h)).then(this.Pa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Bo(this)),this.readyState=0},r.Pa=function(c){if(this.g&&(this.l=c,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=c.headers,this.readyState=2,ho(this)),this.g&&(this.readyState=3,ho(this),this.g)))if(this.responseType==="arraybuffer")c.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in c){if(this.j=c.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;lf(this)}else c.text().then(this.Oa.bind(this),this.ga.bind(this))};function lf(c){c.j.read().then(c.Ma.bind(c)).catch(c.ga.bind(c))}r.Ma=function(c){if(this.g){if(this.o&&c.value)this.response.push(c.value);else if(!this.o){var h=c.value?c.value:new Uint8Array(0);(h=this.B.decode(h,{stream:!c.done}))&&(this.response=this.responseText+=h)}c.done?Bo(this):ho(this),this.readyState==3&&lf(this)}},r.Oa=function(c){this.g&&(this.response=this.responseText=c,Bo(this))},r.Na=function(c){this.g&&(this.response=c,Bo(this))},r.ga=function(){this.g&&Bo(this)};function Bo(c){c.readyState=4,c.l=null,c.j=null,c.B=null,ho(c)}r.setRequestHeader=function(c,h){this.A.append(c,h)},r.getResponseHeader=function(c){return this.h&&this.h.get(c.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const c=[],h=this.h.entries();for(var f=h.next();!f.done;)f=f.value,c.push(f[0]+": "+f[1]),f=h.next();return c.join(`\r
`)};function ho(c){c.onreadystatechange&&c.onreadystatechange.call(c)}Object.defineProperty(Ka.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(c){this.m=c?"include":"same-origin"}});function Bf(c){let h="";return Ma(c,function(f,p){h+=p,h+=":",h+=f,h+=`\r
`}),h}function Bl(c,h,f){e:{for(p in f){var p=!1;break e}p=!0}p||(f=Bf(f),typeof c=="string"?f!=null&&so(f):Ne(c,h,f))}function He(c){dt.call(this),this.headers=new Map,this.L=c||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}d(He,dt);var ID=/^https?$/i,DD=["POST","PUT"];r=He.prototype,r.Fa=function(c){this.H=c},r.ea=function(c,h,f,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+c);h=h?h.toUpperCase():"GET",this.D=c,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Jd.g(),this.g.onreadystatechange=C(l(this.Ca,this));try{this.B=!0,this.g.open(h,String(c),!0),this.B=!1}catch(F){hf(this,F);return}if(c=f||"",f=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var b in p)f.set(b,p[b]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const F of p.keys())f.set(F,p.get(F));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(f.keys()).find(F=>F.toLowerCase()=="content-type"),b=o.FormData&&c instanceof o.FormData,!(Array.prototype.indexOf.call(DD,h,void 0)>=0)||p||b||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[F,$]of f)this.g.setRequestHeader(F,$);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(c),this.v=!1}catch(F){hf(this,F)}};function hf(c,h){c.h=!1,c.g&&(c.j=!0,c.g.abort(),c.j=!1),c.l=h,c.o=5,df(c),za(c)}function df(c){c.A||(c.A=!0,It(c,"complete"),It(c,"error"))}r.abort=function(c){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=c||7,It(this,"complete"),It(this,"abort"),za(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),za(this,!0)),He.Z.N.call(this)},r.Ca=function(){this.u||(this.B||this.v||this.j?ff(this):this.Xa())},r.Xa=function(){ff(this)};function ff(c){if(c.h&&typeof i<"u"){if(c.v&&Zn(c)==4)setTimeout(c.Ca.bind(c),0);else if(It(c,"readystatechange"),Zn(c)==4){c.h=!1;try{const F=c.ca();e:switch(F){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var f;if(!(f=h)){var p;if(p=F===0){let $=String(c.D).match(nf)[1]||null;!$&&o.self&&o.self.location&&($=o.self.location.protocol.slice(0,-1)),p=!ID.test($?$.toLowerCase():"")}f=p}if(f)It(c,"complete"),It(c,"success");else{c.o=6;try{var b=Zn(c)>2?c.g.statusText:""}catch{b=""}c.l=b+" ["+c.ca()+"]",df(c)}}finally{za(c)}}}}function za(c,h){if(c.g){c.m&&(clearTimeout(c.m),c.m=null);const f=c.g;c.g=null,h||It(c,"ready");try{f.onreadystatechange=null}catch{}}}r.isActive=function(){return!!this.g};function Zn(c){return c.g?c.g.readyState:0}r.ca=function(){try{return Zn(this)>2?this.g.status:-1}catch{return-1}},r.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.La=function(c){if(this.g){var h=this.g.responseText;return c&&h.indexOf(c)==0&&(h=h.substring(c.length)),tD(h)}};function Cf(c){try{if(!c.g)return null;if("response"in c.g)return c.g.response;switch(c.F){case"":case"text":return c.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in c.g)return c.g.mozResponseArrayBuffer}return null}catch{return null}}function yD(c){const h={};c=(c.g&&Zn(c)>=2&&c.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<c.length;p++){if(I(c[p]))continue;var f=aD(c[p]);const b=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const F=h[b]||[];h[b]=F,F.push(f)}WI(h,function(p){return p.join(", ")})}r.ya=function(){return this.o},r.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function fo(c,h,f){return f&&f.internalChannelParams&&f.internalChannelParams[c]||h}function pf(c){this.za=0,this.i=[],this.j=new ro,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=fo("failFast",!1,c),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=fo("baseRetryDelayMs",5e3,c),this.Za=fo("retryDelaySeedMs",1e4,c),this.Ta=fo("forwardChannelMaxRetries",2,c),this.va=fo("forwardChannelRequestTimeoutMs",2e4,c),this.ma=c&&c.xmlHttpFactory||void 0,this.Ua=c&&c.Rb||void 0,this.Aa=c&&c.useFetchStreams||!1,this.O=void 0,this.L=c&&c.supportsCrossDomainXhr||!1,this.M="",this.h=new Yd(c&&c.concurrentRequestLimit),this.Ba=new ED,this.S=c&&c.fastHandshake||!1,this.R=c&&c.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=c&&c.Pb||!1,c&&c.ua&&this.j.ua(),c&&c.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&c&&c.detectBufferingProxy||!1,this.ia=void 0,c&&c.longPollingTimeout&&c.longPollingTimeout>0&&(this.ia=c.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}r=pf.prototype,r.ka=8,r.I=1,r.connect=function(c,h,f,p){Dt(0),this.W=c,this.H=h||{},f&&p!==void 0&&(this.H.OSID=f,this.H.OAID=p),this.F=this.X,this.J=Tf(this,null,this.W),Wa(this)};function hl(c){if(gf(c),c.I==3){var h=c.V++,f=tn(c.J);if(Ne(f,"SID",c.M),Ne(f,"RID",h),Ne(f,"TYPE","terminate"),Co(c,f),h=new $n(c,c.j,h),h.M=2,h.A=Ja(tn(f)),f=!1,o.navigator&&o.navigator.sendBeacon)try{f=o.navigator.sendBeacon(h.A.toString(),"")}catch{}!f&&o.Image&&(new Image().src=h.A,f=!0),f||(h.g=Af(h.j,null),h.g.ea(h.A)),h.F=Date.now(),ja(h)}wf(c)}function Qa(c){c.g&&(fl(c),c.g.cancel(),c.g=null)}function gf(c){Qa(c),c.v&&(o.clearTimeout(c.v),c.v=null),$a(c),c.h.cancel(),c.m&&(typeof c.m=="number"&&o.clearTimeout(c.m),c.m=null)}function Wa(c){if(!Xd(c.h)&&!c.m){c.m=!0;var h=c.Ea;Ce||E(),le||(Ce(),le=!0),T.add(h,c),c.D=0}}function wD(c,h){return Zd(c.h)>=c.h.j-(c.m?1:0)?!1:c.m?(c.i=h.G.concat(c.i),!0):c.I==1||c.I==2||c.D>=(c.Sa?0:c.Ta)?!1:(c.m=no(l(c.Ea,c,h),yf(c,c.D)),c.D++,!0)}r.Ea=function(c){if(this.m)if(this.m=null,this.I==1){if(!c){this.V=Math.floor(Math.random()*1e5),c=this.V++;const b=new $n(this,this.j,c);let F=this.o;if(this.U&&(F?(F=Rd(F),bd(F,this.U)):F=this.U),this.u!==null||this.R||(b.J=F,F=null),this.S)e:{for(var h=0,f=0;f<this.i.length;f++){t:{var p=this.i[f];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(h+=p,h>4096){h=f;break e}if(h===4096||f===this.i.length-1){h=f+1;break e}}h=1e3}else h=1e3;h=_f(this,b,h),f=tn(this.J),Ne(f,"RID",c),Ne(f,"CVER",22),this.G&&Ne(f,"X-HTTP-Session-Id",this.G),Co(this,f),F&&(this.R?h="headers="+so(Bf(F))+"&"+h:this.u&&Bl(f,this.u,F)),ul(this.h,b),this.Ra&&Ne(f,"TYPE","init"),this.S?(Ne(f,"$req",h),Ne(f,"SID","null"),b.U=!0,sl(b,f,null)):sl(b,f,h),this.I=2}}else this.I==3&&(c?mf(this,c):this.i.length==0||Xd(this.h)||mf(this))};function mf(c,h){var f;h?f=h.l:f=c.V++;const p=tn(c.J);Ne(p,"SID",c.M),Ne(p,"RID",f),Ne(p,"AID",c.K),Co(c,p),c.u&&c.o&&Bl(p,c.u,c.o),f=new $n(c,c.j,f,c.D+1),c.u===null&&(f.J=c.o),h&&(c.i=h.G.concat(c.i)),h=_f(c,f,1e3),f.H=Math.round(c.va*.5)+Math.round(c.va*.5*Math.random()),ul(c.h,f),sl(f,p,h)}function Co(c,h){c.H&&Ma(c.H,function(f,p){Ne(h,p,f)}),c.l&&Ma({},function(f,p){Ne(h,p,f)})}function _f(c,h,f){f=Math.min(c.i.length,f);const p=c.l?l(c.l.Ka,c.l,c):null;e:{var b=c.i;let ce=-1;for(;;){const Ze=["count="+f];ce==-1?f>0?(ce=b[0].g,Ze.push("ofs="+ce)):ce=0:Ze.push("ofs="+ce);let Te=!0;for(let it=0;it<f;it++){var F=b[it].g;const nn=b[it].map;if(F-=ce,F<0)ce=Math.max(0,b[it].g-100),Te=!1;else try{F="req"+F+"_"||"";try{var $=nn instanceof Map?nn:Object.entries(nn);for(const[Kr,er]of $){let tr=er;a(er)&&(tr=Zc(er)),Ze.push(F+Kr+"="+encodeURIComponent(tr))}}catch(Kr){throw Ze.push(F+"type="+encodeURIComponent("_badmap")),Kr}}catch{p&&p(nn)}}if(Te){$=Ze.join("&");break e}}$=void 0}return c=c.i.splice(0,f),h.G=c,$}function Ef(c){if(!c.g&&!c.v){c.Y=1;var h=c.Da;Ce||E(),le||(Ce(),le=!0),T.add(h,c),c.A=0}}function dl(c){return c.g||c.v||c.A>=3?!1:(c.Y++,c.v=no(l(c.Da,c),yf(c,c.A)),c.A++,!0)}r.Da=function(){if(this.v=null,If(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var c=4*this.T;this.j.info("BP detection timer enabled: "+c),this.B=no(l(this.Wa,this),c)}},r.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Dt(10),Qa(this),If(this))};function fl(c){c.B!=null&&(o.clearTimeout(c.B),c.B=null)}function If(c){c.g=new $n(c,c.j,"rpc",c.Y),c.u===null&&(c.g.J=c.o),c.g.P=0;var h=tn(c.na);Ne(h,"RID","rpc"),Ne(h,"SID",c.M),Ne(h,"AID",c.K),Ne(h,"CI",c.F?"0":"1"),!c.F&&c.ia&&Ne(h,"TO",c.ia),Ne(h,"TYPE","xmlhttp"),Co(c,h),c.u&&c.o&&Bl(h,c.u,c.o),c.O&&(c.g.H=c.O);var f=c.g;c=c.ba,f.M=1,f.A=Ja(tn(h)),f.u=null,f.R=!0,Qd(f,c)}r.Va=function(){this.C!=null&&(this.C=null,Qa(this),dl(this),Dt(19))};function $a(c){c.C!=null&&(o.clearTimeout(c.C),c.C=null)}function Df(c,h){var f=null;if(c.g==h){$a(c),fl(c),c.g=null;var p=2}else if(al(c.h,h))f=h.G,ef(c.h,h),p=1;else return;if(c.I!=0){if(h.o)if(p==1){f=h.u?h.u.length:0,h=Date.now()-h.F;var b=c.D;p=Ha(),It(p,new qd(p,f)),Wa(c)}else Ef(c);else if(b=h.m,b==3||b==0&&h.X>0||!(p==1&&wD(c,h)||p==2&&dl(c)))switch(f&&f.length>0&&(h=c.h,h.i=h.i.concat(f)),b){case 1:Jr(c,5);break;case 4:Jr(c,10);break;case 3:Jr(c,6);break;default:Jr(c,2)}}}function yf(c,h){let f=c.Qa+Math.floor(Math.random()*c.Za);return c.isActive()||(f*=2),f*h}function Jr(c,h){if(c.j.info("Error code "+h),h==2){var f=l(c.bb,c),p=c.Ua;const b=!p;p=new Yn(p||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||oo(p,"https"),Ja(p),b?mD(p.toString(),f):_D(p.toString(),f)}else Dt(2);c.I=0,c.l&&c.l.pa(h),wf(c),gf(c)}r.bb=function(c){c?(this.j.info("Successfully pinged google.com"),Dt(2)):(this.j.info("Failed to ping google.com"),Dt(1))};function wf(c){if(c.I=0,c.ja=[],c.l){const h=tf(c.h);(h.length!=0||c.i.length!=0)&&(D(c.ja,h),D(c.ja,c.i),c.h.i.length=0,g(c.i),c.i.length=0),c.l.oa()}}function Tf(c,h,f){var p=f instanceof Yn?tn(f):new Yn(f);if(p.g!="")h&&(p.g=h+"."+p.g),ao(p,p.u);else{var b=o.location;p=b.protocol,h=h?h+"."+b.hostname:b.hostname,b=+b.port;const F=new Yn(null);p&&oo(F,p),h&&(F.g=h),b&&ao(F,b),f&&(F.h=f),p=F}return f=c.G,h=c.wa,f&&h&&Ne(p,f,h),Ne(p,"VER",c.ka),Co(c,p),p}function Af(c,h,f){if(h&&!c.L)throw Error("Can't create secondary domain capable XhrIo object.");return h=c.Aa&&!c.ma?new He(new ll({ab:f})):new He(c.ma),h.Fa(c.L),h}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function vf(){}r=vf.prototype,r.ra=function(){},r.qa=function(){},r.pa=function(){},r.oa=function(){},r.isActive=function(){return!0},r.Ka=function(){};function Ya(){}Ya.prototype.g=function(c,h){return new xt(c,h)};function xt(c,h){dt.call(this),this.g=new pf(h),this.l=c,this.h=h&&h.messageUrlParams||null,c=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(c?c["X-Client-Protocol"]="webchannel":c={"X-Client-Protocol":"webchannel"}),this.g.o=c,c=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(c?c["X-WebChannel-Content-Type"]=h.messageContentType:c={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.sa&&(c?c["X-WebChannel-Client-Profile"]=h.sa:c={"X-WebChannel-Client-Profile":h.sa}),this.g.U=c,(c=h&&h.Qb)&&!I(c)&&(this.g.u=c),this.A=h&&h.supportsCrossDomainXhr||!1,this.v=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!I(h)&&(this.g.G=h,c=this.h,c!==null&&h in c&&(c=this.h,h in c&&delete c[h])),this.j=new Vs(this)}d(xt,dt),xt.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},xt.prototype.close=function(){hl(this.g)},xt.prototype.o=function(c){var h=this.g;if(typeof c=="string"){var f={};f.__data__=c,c=f}else this.v&&(f={},f.__data__=Zc(c),c=f);h.i.push(new lD(h.Ya++,c)),h.I==3&&Wa(h)},xt.prototype.N=function(){this.g.l=null,delete this.j,hl(this.g),delete this.g,xt.Z.N.call(this)};function Rf(c){el.call(this),c.__headers__&&(this.headers=c.__headers__,this.statusCode=c.__status__,delete c.__headers__,delete c.__status__);var h=c.__sm__;if(h){e:{for(const f in h){c=f;break e}c=void 0}(this.i=c)&&(c=this.i,h=h!==null&&c in h?h[c]:void 0),this.data=h}else this.data=c}d(Rf,el);function Pf(){tl.call(this),this.status=1}d(Pf,tl);function Vs(c){this.g=c}d(Vs,vf),Vs.prototype.ra=function(){It(this.g,"a")},Vs.prototype.qa=function(c){It(this.g,new Rf(c))},Vs.prototype.pa=function(c){It(this.g,new Pf)},Vs.prototype.oa=function(){It(this.g,"b")},Ya.prototype.createWebChannel=Ya.prototype.g,xt.prototype.send=xt.prototype.o,xt.prototype.open=xt.prototype.m,xt.prototype.close=xt.prototype.close,Rg=function(){return new Ya},vg=function(){return Ha()},Ag=Hr,Kl={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},qa.NO_ERROR=0,qa.TIMEOUT=8,qa.HTTP_ERROR=6,pu=qa,jd.COMPLETE="complete",Tg=jd,Md.EventType=eo,eo.OPEN="a",eo.CLOSE="b",eo.ERROR="c",eo.MESSAGE="d",dt.prototype.listen=dt.prototype.J,To=Md,He.prototype.listenOnce=He.prototype.K,He.prototype.getLastError=He.prototype.Ha,He.prototype.getLastErrorCode=He.prototype.ya,He.prototype.getStatus=He.prototype.ca,He.prototype.getResponseJson=He.prototype.La,He.prototype.getResponseText=He.prototype.la,He.prototype.send=He.prototype.ea,He.prototype.setWithCredentials=He.prototype.Fa,wg=He}).apply(typeof Za<"u"?Za:typeof self<"u"?self:typeof window<"u"?window:{});/*!
* re2js
* RE2JS is the JavaScript port of RE2, a regular expression engine that provides linear time matching
*
* @version v2.8.6
* @author Oleksii Vasyliev
* @homepage https://github.com/le0pard/re2js#readme
* @repository github:le0pard/re2js
* @license MIT
*/var Ae,G=(Ae=class{},J(Ae,"FOLD_CASE",1),J(Ae,"LITERAL",2),J(Ae,"CLASS_NL",4),J(Ae,"DOT_NL",8),J(Ae,"ONE_LINE",16),J(Ae,"NON_GREEDY",32),J(Ae,"PERL_X",64),J(Ae,"UNICODE_GROUPS",128),J(Ae,"WAS_DOLLAR",256),J(Ae,"LOOKBEHIND",512),J(Ae,"MATCH_NL",Ae.CLASS_NL|Ae.DOT_NL),J(Ae,"PERL",Ae.CLASS_NL|Ae.ONE_LINE|Ae.PERL_X|Ae.UNICODE_GROUPS),J(Ae,"POSIX",0),J(Ae,"UNANCHORED",0),J(Ae,"ANCHOR_START",1),J(Ae,"ANCHOR_BOTH",2),Ae);const ks={CASE_INSENSITIVE:1,DOTALL:2,MULTILINE:4,DISABLE_UNICODE_GROUPS:8,LONGEST_MATCH:16,LOOKBEHINDS:512},$o=128,zl=new Int32Array($o),Ql=new Int32Array($o),eu=65535;for(let r=0;r<$o;r++)r>=97&&r<=122?zl[r]=r-32:zl[r]=r,r>=65&&r<=90?Ql[r]=r+32:Ql[r]=r;var Ul,L=(Ul=class{static toUpperCase(r){if(r<$o)return zl[r];const e=String.fromCodePoint(r).toUpperCase(),t=e.codePointAt(0)>eu?2:1;if(e.length>t)return r;const n=String.fromCodePoint(e.codePointAt(0)).toLowerCase(),s=n.codePointAt(0)>eu?2:1;return n.length>s||n.codePointAt(0)!==r?r:e.codePointAt(0)}static toLowerCase(r){if(r<$o)return Ql[r];const e=String.fromCodePoint(r).toLowerCase(),t=e.codePointAt(0)>eu?2:1;if(e.length>t)return r;const n=String.fromCodePoint(e.codePointAt(0)).toUpperCase(),s=n.codePointAt(0)>eu?2:1;return n.length>s||n.codePointAt(0)!==r?r:e.codePointAt(0)}},J(Ul,"CODES",new Map([["\x07",7],["\b",8],["	",9],[`
`,10],["\v",11],["\f",12],["\r",13],[" ",32],['"',34],["$",36],["&",38],["'",39],["(",40],[")",41],["*",42],["+",43],["-",45],[".",46],["0",48],["1",49],["2",50],["3",51],["4",52],["5",53],["6",54],["7",55],["8",56],["9",57],[":",58],["<",60],[">",62],["?",63],["A",65],["B",66],["C",67],["F",70],["P",80],["Q",81],["U",85],["Z",90],["[",91],["\\",92],["]",93],["^",94],["_",95],["`",96],["a",97],["b",98],["f",102],["i",105],["m",109],["n",110],["r",114],["s",115],["t",116],["v",118],["x",120],["z",122],["{",123],["|",124],["}",125]])),Ul),m=class{constructor(r,e=!1){this.data=r,this.isStride1=e,this.SIZE=e?2:3}getLo(r){return this.data[r*this.SIZE]}getHi(r){return this.data[r*this.SIZE+1]}getStride(r){return this.isStride1?1:this.data[r*this.SIZE+2]}get length(){return this.data.length/this.SIZE}};const Pg=new Uint8Array(256);for(let r=0,e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-";r<64;r++)Pg[e.charCodeAt(r)]=r;const bg=r=>{const e=[];let t=0,n=0;for(let s=0;s<r.length;s++){let i=Pg[r.charCodeAt(s)];t|=(i&31)<<n,(i&32)===0?(e.push(t),t=0,n=0):n+=5}return e},_=(r,e)=>{const t=bg(r),n=e?t.length/2:t.length/3,s=new Uint32Array(n*3);let i=0,o=0;for(let a=0;a<n;a++)i+=t[o++],s[a*3]=i,i+=t[o++],s[a*3+1]=i,s[a*3+2]=e?1:t[o++];return s},lw=r=>{const e=bg(r),t=new Map;let n=0;for(let s=0;s<e.length;s+=2){n+=e[s];const i=e[s+1],o=i>>>1^-(i&1);t.set(n,n+o)}return t};var tu=class{constructor(r){this.initializer=r,this.cache=new Map}has(r){return r in this.initializer}get(r){if(this.cache.has(r))return this.cache.get(r);const e=this.initializer[r],t=e?e():null;return this.cache.set(r,t),t}},ur,Rt=(ur=class{static get CASE_ORBIT(){return this._CASE_ORBIT||(this._CASE_ORBIT=lw("rCgCIgCY+rQI4QiCuuBLgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCCgCBgCBgCBgCBgCBgCBgCB+7OB-BB-BB-BB-BB-BBskQB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BC-BB-BB-BB-BB-BB-BB-BByHBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBxHBCBBBCBBBCBBB3SBmMBkNBCBBBCBBB8MBCBBB6MB6MBCBBC+EB0MB2MBCBBB6MB+MBiGBmNBiNBCBBBmKBikzCBmNBqNBkIBsNBCBBBCBBBCBBB0NBCBBB0NDCBBB0NBCBBByNByNBCBBBCBBB2NBCBBDCBBCwDFCBCBDBCBCBDBCBCBDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB9EBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBCBDBCBBBhGBvDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBjICCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBH2iVBCBBBlKBwiVB+jVB+jVBCBBBlMBqEBuEBCBBBCBBBCBBBCBBBCBBB+hVB4hVB8hVBjNB7MC5MB5MCzMC1MB+0yCE5MB20yCC9MBu2yCBwyyCBo0yCChNBlNBo0yCBu-UBi0yCDlNC6-UBpNDrNIu+UDzNCm0yCBzNE0yyCBzNBpEBxNBxNBtEG1NLqxyCBkxyCnFoFrBCBBBCBBDCBBEkIBkIBkICoHHsCCqCBqCBqCCgEC+DB+DBmkOBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCC+BBgCBgCBgCBgCBgCBgCBgCBgCBrCBpCBpCBpCBmjOB-BB8BB-BB-BBgEB-BB-BByBBqgOBsDB-BBtwBB-BB-BB-BBsBBgDBCB-BB-BB-BBeB-BB-BB61OB-BB-BB-DB9DB9DBQB7DBmCE9CBrDBPBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBrFB-EBOBnHB3FB-FCCBBBNBCBBCjIBjIBjIBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB8kMB-BB6kMB-BB-BB-BB-BB-BB-BB-BB-BB-BBokMB-BB-BBkkMBkkMB-BB-BB-BB-BB-BB-BB-BB4jMB-BB-BB-BB-BB-BB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EBCBBBCBoiMBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBJCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBeBCBBBCBBBCBBBCBBBCBBBCBBBCBBBdBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDL-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-C64CgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOCgmOGgmODg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FDg8FBg8FBg8FhVg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBQBQBQBQBQBQDPBPBPBPBPBPjkC7mMB5mMBnmMBjmMBCBlmMB3lMBpiMBk8kCBCBBG-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FD-7FB-7FB-7F6FoglCEsuHRwjlCyDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCB0DBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBG1DD97OCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPEQCQCQCQCPCPCPCPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPB0EB0EBsFBsFBsFBsFBoGBoGBgIBgIBgHBgHB8HB8HDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQCSFPBPBzEBzEBRCxnOFSFrFBrFBrFBrFBREQBQClkOFPBPBnGBnGFQBQCljOCODPBPB-GB-GBNHSF-HB-HB7HB7HBRqJ53OE9tQBrmQH4Bc3BSgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfECBByZ0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzB34BgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CBCBBBt-UBruHBt+UB1iVBviVBCBBBCBBBCBBB3hVB5-UB9hVB7hVCCBBCCBBI9jVB9jVBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBICBBBCBBECBBN-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOC-lOG-lOzoeCBBBCBBBCBBBCBBBCBBBCBl8kCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBTCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBnECBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBKCBBBCBBBnglCBCBBBCBBBCBBBCBBBCBBECBBBvyyCDCBBBCBBBgDCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBn0yCB90yCB10yCBh0yCBn0yCCjxyCBzyyCBpxyCBg6BBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB-CBl0yCBvjlCBCBBBCBBBt2yCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBhkzCZCBB9a-5Bd-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCm6TCBB7gBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCH-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BmlBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvChDwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCFvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvC1DuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCCuCBuCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCCtCBtCk2BgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEO-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-D+CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCL-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-B74CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhrVgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BD1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BtxekCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjC")),this._CASE_ORBIT}static get Print(){return this._Print||(this._Print=new m(_("hB9CBjBLBCpWBDFBFGBCCCBSBCsMBClBBDxBBDCBC2BBJaBFFBSVBC-FBCvBBD6BBDkDBP6BBDwBBDOBCbBDCCBJBGfBIqCBCgFBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYBDCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPBLCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGBCCBCHBDBBDVBCGBCBBCEBDIBDBBDCBICBFBBCEBDRBLBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBGMBCCBCWBCPBDIBCCBCDBIBBCCBCBBDDBDJBIVBCCBCWBCJBCEBDIBCCBCDBIBBGCBCDBDJBCCBNMBCCBCyBBCCBCFBFPBDZBCCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBN5BBFcBmBBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDBhBnCBCjBBFmBBCjBBCOBCMBmBlGBCGGD4LBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBH1CBDFBD-TBCbBE4CBIVBKXBKTBNMBCCBCBBN9CBDJBHJBHNBCKBH4CBIqBBGlCBLeBCLBFLBFEEBoBBDEBMrBBFZBHKBE9BBDgCBCcBDKBHJBHNBDtBBDLBVsCBClFBJ7BBEOBE9BBGqBBDKBJqBBG1QBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBSXBJuBBSBBDaBCMBEhBBPgBBQrEBF5UBXKBWz4BBD9LBGsBBCGGD3BBIBBPXBKGBCGBCGBCGBCGBCGBCGBCGBC9DBjBZBC4CBN1GBbPBC+BBC1CBDmDBGqBBC9CBC1CBKvBBCszcBE2BBK7KBV3FBJ8GBV7BBEJBH3BBJlCBJLBHzDBMdBEtCBCKBFgBBC2BBKNBDJBDmDBZbBLFBDFBDFBKGBCGBC7BBF9DBDJBHj9KBNWBFwBBloItLBDpDBnBGBNEBGZBCEBCCCBCCBCCBoUBhBpBBHyBBCSBCDBFEBCmEBF9FBEFBDFBDFBDCBEGBCGBOBBDLBCZBCSBCBBCOBDNBjB6DBGCBFsBBE3CBCMBEwBwBBsBBjEcBEwBBQbBFjBBKdBGqBBGdBCkBBFNBrB9EBDJBHjBBFjBBFnBBJzBBMLBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBCnCBJIBxBSBCBBGgBBEaBGaBnB3BBFTBDxBBCBBGHBCCBCcBDCBFJBIIBI-BBhBmBBFLBK1BBEcBDaBGZBIDBNGBxCoCB4ByBBOyBBItBBJJBHlBBEcBJBBxGeBCpBBCCBDBBRFBJIBiBtBBJpBBXZBnBbBVWBKtCBFjBBK9BBCEBOYBIJBH0BBCRBJmBBK-CBCTBMRBCuBB-BGBCCCBCBCOBCKBH6BBGJBHDBCHBDBBDVBCGBCBBCEBCJBDBBDCBDHHGGBDGBEEBMJBCDDClBBCJBCDDCDBCJBCBBJBBe7CBCEBfnCBJJBnF1BBDlBBjBkCBMJBHMBU5BBHJBHTBdaBDOBFWB6F7BBlDyCBNHBDDDBGBCBBCdBCBBDLBKJBnCHBDtBBDKBcnCBJyCBOoCBIJB3CHB5ChBBPJBHIBCsBBCNBLcBEfBDVBCNBqCGBCBBCrBBECCBCCBHBJJBHFBCBBCkBBCBBCFBIJBHrBBFJB3HYBIQBCoBBEcB2CQQBwBBO6cBnDuDBCEBMjGBtyCiDBOvhBBRVBL68DBGmSB61G5BBn2B4RBIeBCJBFwCBCJBHdBDFBLlCBLJBCGBCUBGSBxN5BBnG6CBGYBDYBtBqCBF4BBIQBhCEBMGBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBDDBh7D8HBEzNBHWBQQBQtBBDWBKzDB9B1HBLmBBDpCBJvDBWlCB7DTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBD9VBQEBCOBxiBeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBENBDJBFBBhKeBS5BBGxOxOBoBB3GqBBFhGhGBdBCVBJBBhHGBCDBCBBCOBCkGBDPBqBrCBFJBFBByYjCBtC8BBjGDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBBvIrBBFjDBNOBDOBCOBCkBBLtFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBmgB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIBnkzVvHB",!1))),this._Print}static get Upper(){return this.CATEGORIES.get("Lu")}},J(ur,"_CASE_ORBIT",null),J(ur,"_Print",null),J(ur,"CATEGORIES",new tu({C:()=>new m(_("AfBgDgBBOrWrWBHHBCBICCVuMuMnBBBzBBBE4B4BBGBcDBHQBXhGhGxBBB8BBBmDNB8BBByBBBQddBCCMEBhBGBsCiFiFJBBDBBXIICCBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBPMMBEB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKMMBDBbEByBPBDBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCB-FCBHBBHBBHBBECBIIIBLBDBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIB-BGGBLBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMBxhBPBXJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBF-6DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBrCHBxDUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIlkzVBxHvw-FB",!1)),Cc:()=>new m(_("AfgDgB",!0)),Cf:()=>new m(_("tFzqBzqBBEBXhGhGyBhMhMBxCxCs5D9-B9-BBDBbEByBEBCJBw03B6H6HBBBimEQQj7IPBhjiBDBwmFHBn0rYffB+CB",!1)),Cn:()=>new m(_("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBDBvzIBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-BB---BBB---BBB",!1)),Co:()=>new m(_("gg4B-nGh4hc9--BD9--B",!0)),Cs:()=>new m(_("gg2B--B",!0)),L:()=>new m(_("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICCiEEBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoCaBFDBuBqBBkBBBCiDBCQQBIIBLLBBBDRRCdBe4CBMZZBfBKBBFGGBUBFKKEYYBXBIKBGXBCGBRpBB7B1BBETTIJBQPBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNGB7BBBCCCBDBCXBCCCBIBCBBKDDBDBCWWBCBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNSSBkBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBkBFFkC4CBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBzC+C+CBtBBSHB3BdBOBBLrBBbjBBqBCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBhC1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBF1B1BB8zC8zCBjHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBxC2O2OBrBrBBDBGBBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBReBDlCByBIBDmDBDxCBVQBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBdRRBDBCJBLEBCoBBYCBCHBVWBEEEBwBBCEEBDDBDBDCCZCBDKBICBNFBDFBDFBKGBCGBCqBBCNBHyDBej9KBNWBFwBBloItLBDpDBnBGBNEBGCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBxB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOjBBnBbBKWB7HpBBHBBRFB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB1D-BBgBHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBqBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBGjCjCBLBhCBBCPPBNNB0mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBn7F0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFBmI9BBzEsBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCCBCBBCGBDEBKBBhHGBCDBCBBCOBCkGB8BjCBI1lB1lBBCBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),LC:()=>new m(_("hCZBHZB7BLLBVBCeBCiGBCDBFvGBDZBhGDBDBBECBCHHCCBCCCBSBCyCBCqEBJlFBClBBKoBB44ClBBCGGDqBBDCBhV1CBDFBjkCKBGqBBDCBhCrBBgCMBChBBmD1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGBmIFFDJBCEEBDBHGCBCBCFBFDDBCBGEBF1B1BB8zC8zCB6DBDmDBHDBEBBNlBBCGGzoetBBTbBnEtCBCWBEDBCsCBZBBE2Z2ZBpBBGIBIvCBh6TGBNEBqgBZBHZBmlBvCBhDjBBFjBB1DKBCOBCGBCBBCKBCOBCGBCBBk2ByBBOyBB+CVBLVB74C-BBhrV-BBhBYBDYBtpZ0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BJBCTBHFB2uCjCB",!1)),Ll:()=>new m(_("hDZB7BqBqBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDZBiGCCEEEBBBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBDCB5XFBjkCIBC2D2DBqBBgCMBChBBnD0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBBzIEEBEEcKFDBBJDBF2B2Bs1CvBBCEEBGCFCCBCCBEBGiDCBIICFFNlBBCGG0oesBCUaCoEMCBBBC+BCBGBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCbEE2ZqBBGIBIvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFB4vChBB",!1)),Lm:()=>new m(_("wVRBFLBPEBICCmEGG-OnHnHlFBBuIBBFgBgBKEEhFoFoF1mBgEgE2R72B72BsDkTkTxOFBvF+BBOjBjBBjBByVOORMBg-CBByHgGgG2OsBsBBDBGiDiDB+C+CBBB34bjnBjnBBEBvIzDzDdBB6DIBxCYYpDDBEBB2OXXqEtDtDWBBoDDBKngVngVuBBBh-BFBCpBBCIB0sBhBhB2K04D04DnrTDB9PCBpBBBnRMBhCBBCPPB9-P9-PBCBCGBCBByhM9BBqGGBud0Q0QsSAB",!1)),Lo:()=>new m(_("qFQQhIFFBCBxGBB7ZaBFDBuBfBCJBkBBBCiDBCZZBLLBBBDRRCdBe4CBMZZBfBWVBrBYBIKBGXBCGBRoBB8B1BBETTIJBROBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNFB8BBBCCCBDBCXBCCCBIBCBBKDDBDBYDBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNyDyDBnKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPByDrTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBpBkCkCBhBBC0BBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBxFuBBSHB3BdBOBBLrBBbjBBqBCBLdByDDBCFBCBBE7hB7hBBCB4-C3BBZWBKGBCGBCGBCGBCGBCGBCGBCGBoR2B2BF1CBJCCB4CBFGGBpBBC9CBSfBxBPBhQ-tGBhC0wUBC2jBBkCnBBJrIBFPBLBBjCyByBBkCBqFoDoDEGBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBuBEBDIBLEBCoBBYCBCHBVPBCFBEEEBwBBCEEBDDBDBDCCZBBEKBIPPBEBDFBDFBKGBCGByEiBBej9KBNWBFwBBloItLBDpDBkCCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBqDJBCsBBDeBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBhEtCBjDnBBJzBB9CzBBN2JBKVBLHB5EFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4FjBBnBDBCxJxJBoBBHBBRCBCBB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB0GHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBnBBCBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBB0BUBGSB0NnBB2MqCBGwFwFB0mHBqBfBiDyDBuwIiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBxzI2P2PBrBBiBiKiKBcBTrBBlPaBmHdBDwGwGBdBCCBCBBCGBDEBKiHiHBFBCDBCBBCOBCkGB8pBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Lt:()=>new m(_("lOGDnB2sH2sHBGBJHBJHBNQQwBAB",!1)),Lu:()=>new m(_("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBG+B+B9zCvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBB",!1)),M:()=>new m(_("gYvDB0IGBoIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCgBB3BCBCRBCGBLBBeCB5BCCBFBDBBDCBKLLBbbDCB5BCCBDBFBBDCBEffBEEMCB5BCCBGBCCBCCBVBBXFBCCB5BCCBFBDBBDCBICBLBBf8B8BBDBECBCDBKpBpBBDB4BCCBFBCCBCDBIBBMBBeCB5BCCBFBCCBCDBIBBMBBQNNBCB4BBBCGBCCBCDBKLLBeeBBBnCFFBEBCCCBGBTBB+BDDBFBNHBjDDDBHBMGBqCBBcECFBByBTBCBBGKBCjBBKlDlDBSBYDBFCBCCBDGBEDBOLBCLLBCBgWCBzdDBdCBeBBfBBhCfBKuBuBBBBC2D2DBjBjB3DLBFLB8GEB6BJBCcBDxBxBBsBBDLBVEBwBQBnBIBNCBfMB5BNBxBTB5ECBCUBFHHDCBnG-BBxWgBB--CCBuEhDhDBeBrRFBqDBB1udDBCJBhBBBxCBBxIEEFYYBDBF0C0CBzBzBBQBbRBOnBnBBGBaMBtBDBwBNBlBkCkCBMBNJJBuBuBBBBzBCCBBBDBBGBBCqBqBBDBGBBtHHBCBBx5TiXiXBOBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB7DCB2BOBqBDDBLLBCBuBKBI+B+BBBBlBNBRBBtBNNBBBxBNBJDBCBB9CLBHDD+ELBWDB4BBBCGBDBBDCBKLLBDDBFBEEBkCIBCDDCDBCEBCPPBzCzCBQBYyCyCBSBsHGBDIBcBBzCQBrDMBmDOBhIOB2HFBCBBDDBCCCBuEuEBFBDGBEddBIBpBGBCDBJKKBJBvBPBnGHBoGHBCHBzCVBCNB7DFBECCBCCBFBCjCjCBDBCBBCEB8KDBKBBCxBxBBFBEEBYmnFmnFHOBpmLRBhuCEB8BGB5gBCCB1BBIDByCMMBslTslTBizEizEBsBBDWB-QEBEFBJHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB",!1)),Mc:()=>new m(_("joC4B4BDCBJDBCBBzBBB7BCBHBBDBBLsBsB7BCBjC7B7BBBBJCCB2B2BB7B7BCHHBDDBLLnDBBCBBECBCCBLqBqBBBB+BDB+BBB7BCCBDBDBBCBBKBBdPPB7B7BBBBGCBCCBLrBrBBsCsCBBBHHBTBBrKBBgCsFsFBFFHDDBaaBLLBBBDGBWBBDFBDLLBBB5zBffiEIIBGBCBB7KDBDCBFBBCFBhHBB7BCCKCCBJJBEByExBxBGCCBDBCBB+BffFBBD9B9BDCBCEEBxBxBBGBJBBsFWW35EBB0-dBBD5C5CBzBzBBOBvEBBwBxBxBBFFBDDBBBvDBBDBBZuBuBCuDuDDBBGuHuHBCCBCCBCC0gZCCgEuBuBBBBFBB0DZZB8B8BxBCBKBBO+C+CBBBEBBCrFrFBBBgBBB7BBBCDBDBBDCBKLLB1C1CBBBIDDCDBCBBCmDmDBBBJBBErDrDBBBHCCBCBDuHuHBBBHDBDyDyDBBBJBBCuDuDCBBHoDoDCBBFmImIBBBK4H4HBEBCBBFDDCvEvEBBBJDBF1C1CeBB-BqGqGECCoGPPrDIID2G2GBDBFBBC-K-KBNNxBBBJBBCpvQpvQBBBlxD2BBpDBB0rYBBHFB",!1)),Me:()=>new m(_("okBBB1xF-wB-wBBCBCCBsshBCB",!1)),Mn:()=>new m(_("gYvDB0IEBqIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCfB4BCCFHBFEEBFBLBBe7B7BFDBJVVBbbDBB6BFFBFFBDDBBBEffBEEMBB6BFFBDBCBBFVVBXXBEBC7B7BDCCBCBJIIBMMBff+BNNzBEE4BCCBBBGCBCDBIBBMBBe7B7BDHHGBBVBBdBB6BBBFDBJVVBeepCIIBBBC7C7CDGBNHBjDDDBHBMGBqCBBcEC4BNBCEBCBBGKBCjBBKnDnDBCBCFBCBBDBBaBBFCBRDBODDBHHQgWgWBBBzdCBeBBfBBfBBhCBBCGBJDDBJBKuBuBBBBC2D2DBjBjB3DCBFBBKHHBBB8GBBD7B7BCGBCCCDHBHJBDxBxBBMBCeBDLBVDBxBCCBDBCGGpBIBNBBhBDBDBBCCB5BCCBEECCB7BHBDBB5ECBCMBCGBFHHEBBnG-BBxWMBFEEBKB--CCBuEhDhDBeBrRDBsDBB1udFFBIBhBBBxCBBxIEEFaaBGG4EBBbRBOnBnBBGBaKBvBCBxBDDBCBDBBoBkCkCBEBDBBDBBNJJwB0B0BCCBDBBGBBCrBrBBJJvHDDFx5Tx5TiXPBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB8D3B3BBNBqBDDBLLBBByBDBDBBI+B+BBBBlBEBCHB-BNNB1B1BBHBLDBDgDgDBBBDCCBHHD+E+EEHBWBB6BBBEmBmBBFBEEBnCFBOECPBB2CHBDCBCYY1CFBCFFBCCBvHvHBCBHBBCBBcBB2CHBDCCBrDrDCDDBEBCmDmDCDDBCBCEBkIIBCBBhIBBCFFxEDBDBBFhBhBBIBpBFBDDBJKKBEBDCBvBMBCBBnGCCBBBCqGqGBFBCFBCzCzCBUBDGBCBBCBB7DFBECCBCCBFBCpCpCBEEC8K8KBMMB1B1BBDBGCCYmnFmnFHOBpmLLBECBhuCEB8BGB5gBgCgCBCByC5lT5lTBizEizEBsBBDWBhRCBSHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB",!1)),N:()=>new m(_("wBJB5DBBGDDBBBitBJBnEJBnGJB9MJB3DJBFFBtDJB3DJB3DJBDFBvDMB0DJBJGBoDJBpDGBISBuDJBhDJB3DJBnCTBtIJBnCJBwWTBybCBwHJBHJBXJBtJJBhEKBmFJBHJB3FJB3CJBnEJBHJB3gBEEBEBHJBnGyBBDEB3W7BBvCVB3TdBqrBqYqYaIBPCB4KDBrEJBfHBCOBhBJBoBOBh7cJB9FJBhKFB7EJBnBJBnGJBXJB3CJB3MJB34UJBuPsBBN4BBSBB2KaBlBDBeJJnEEBrGJBvdHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBxBJBHJB3IeB-EJBrBDBxDGBnEdBhEJB9BJBxEJBITB8HJB3KJB3DJB3LJBnDJBHTBtCLBlNSB+CJB3UJB3CcBkHJBnCJB3BJBnLJBnDUBshBuDBimPJBnpCJB3CJBnEJBCGBvQJBnIWB+KCB6nXJBnuBTBNTBtDYB2iBxBBhqCJBnNJB3PJB4HJBtWIBhEJB4Y6BBCCBCDBtCsBBCOBjeMBk3CJB",!1)),Nd:()=>new m(_("wBJnxBJnEJnGJ9MJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJhDJ3DJnCJ3IJnCJn6BJnBJtJJhEJnFJHJ3FJ3CJnEJHJnuiBJnVJnBJnGJXJ3CJ3MJ34UJnsBJnkCJHJ9YJhEJ9BJxEJ3IJ3KJ3DJ3LJnDJHTtCJnNJnDJ3UJ3CJ3HJnCJ3BJnLJ3uQJnpCJ3CJnEJ3QJ37XJ12CxBhqCJnNJ3PJ4HJ2aJ30EJ",!0)),Nl:()=>new m(_("u3FCBwzCiBBDDB-zDaaBHBPCBs1dJBxyW0BBtOJJnEEBrhIuDBm8SCB",!1)),No:()=>new m(_("yFBBGDDBBB2pCFB5LFB5DCBmEGB6GGBSIByNJB2hBTB0jBJBhP20B20BEFBHJBnGPBqB3W3WB6BBvCVB3TdBqrB1kB1kBBCBrEJBfHBCOBhBJBoBOBxrdFBymWsBBiCDBSBB2KaBlBDB1pBHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBhLeB-EJBrBDBxDGBnETB8LTBmqBBBvNIBobSB0aUBn8SGB-YWBqhZTBNTBtDYBvqFIBid6BBCCBCDBtCsBBCOBjeMB",!1)),P:()=>new m(_("hBCBCFBCDBLBBEBBbCBCccCkBkBGEELBBEEE-VJJzOFBqBBB0BCCDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCmBmBBCBoCrCrCBDBFBBwDFBsFlTlTBHB4EuTuTtBBBvCCBoCBB+ECBCCBmBKB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBM9Z9ZBWBJTBCMBCLBfBBPBB6TDBeBB+hBNBwCBBgBJB0MVBgCDBhBBB8XDBCBBxDwEwEBtBBCfBDLBkNCBFJBDLBRNNjD7C7CjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HzqUzqUBxGxGBIBXiBBCNBCFFCBB2ECBCFBCDBLBBEBBbCBCccCCCBFB7MCB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDByO-J-JjBlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB",!1)),Pc:()=>new m(_("-Cg-Hg-HBUU-u3BBBZCBwHAB",!1)),Pd:()=>new m(_("tB9qB9qB0BiyDiyDmgBqgCqgCBEBiwDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J",!1)),Pe:()=>new m(_("pB0B0BgB+1D+1DC-6B-6BqtC4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECtBGCtNICEGCDBB-ozB6G6GeOCESSCCCrF0B0BgBGD",!1)),Pf:()=>new m(_("7F+6H+6HEddpuDCCFDDQEE",!1)),Pi:()=>new m(_("rFt7Ht7HDBBDaapuDCCFDDQEE",!1)),Po:()=>new m(_("hBCBCCBDECBLLBEEBcclCGGPBBI-V-VJzOzOBEBqB3B3BDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCxDxDrCEBFBBwDFBsFlTlTBHBmY9D9DBBBoCBB+ECBCCBmBFBCDB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBMjajaBJJBGBJIBDDBDCBEKBCCCBIB7kDDBCBBxDwEwEBFFBBBDDDBHBCBBCDDBLLBDBCJBDDBCCCBLBDCBtNCB6B+F+FjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HlxUlxUBFBDXXVBBDDBECBCDBICBHCCB2E2EBBBCCBDECBLLBEEBcclBDDB7M7MBBB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDB0ZlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB",!1)),Ps:()=>new m(_("oBzBzBgB-1D-1DC-6B-6B-rCEEnB4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECaTTCECtNICEGCDipzBipzB4GeeCMCESSCCCrFzBzBgBEEDAB",!1)),S:()=>new m(_("kBHHRCBgBCCcCCkBEBCBBDCCBCBDEEfgBgBrODBNNBGGBCCCBPB2DPPBxDxDsErIrIBBB3DCBDDDBvGvGLUUB4H4HIBBpEqLqLBHHB2H2H-DjEjEBGBlEwGwGqBmGmGiGCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WuLuLlL+E+EBgBBiLJBKIBhiBCCBBBMCBOCBOCBOBBmCOOoBCBOCBUhBB-BBBCDBCBBLCCBBBGFBCECFMMBFFBDBGDBC7B7BBFFB2LBFcBD+HBXKByCtCBXnTBtBwBBDeBLyMBX+BBFfBD1LBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBB8CBB0HBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BB6RWBKBBoDBB+EDBLDB+RCBiHPPB+9T+9TpEgBBuLPBhCBB3BHBtBDBjDCCBBBD7E7EHRRBBBgBCCcCCiEGBCGBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSmWmWBiKiKBGBnjC2kC2kCBbBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQQBgDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBrbaagBaagBaagBaagBaa9B-PB4BDBzBHBCNBCBBp2BwNwNttCEE+DiOiOBvIvIBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB",!1)),Sc:()=>new m(_("kB+D+DBCBqnB8D8DzPBBzPBBI2H2HoImSmS8sClmClmCBgBB37hBkuVkuVtD7E7E8GBBEBB3-HDB-4wBxtCxtC",!1)),Sk:()=>new m(_("+CCCoCHHFEEqQDBNNBGGBCCCBPB2DPPBjoBjoB15FCCBBBMCBOCBOCBOBB9kEBBkzdWBKBBoDBBxePPBniUniUBPB8bCCjF4g9B4g9BBDB",!1)),Sm:()=>new m(_("rBRRBBB+BCCuBFFmBgBgB-XwQwQBBB8xGOOoBCBOCBsEoBoBBDBHlClCBDBGBBFGDIgBgBBDDCgBgBBqIBhBBB7CffBXBpBFB2OKK3BHBwDxKxKBDBDeBLPBhIiEBX+BBFfBDhIBxBUBDFB9+zB5Z5ZCCBlFRRBBB+BCCkEHHBCBitDBBhrwBx+Bx+BagBgBagBgBagBgBagBgBat5Ft5FB-uC-uCBHB",!1)),So:()=>new m(_("mFDDFCCyerIrIBgEgEBvGvGLUUB4H4HkQ2L2LjEFBClElEwGqBqBoMCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WzWzW+EhBBiLJBKIBksBBBCDBCBBLCCBHHBEBCECFMMBPPCBBC7B7BBKKBDBDDBCBBCBBCGBCeBDBBCCCBdBtIHBFTBDGBDwCBCdBanBBHnCBXKByCtCBX2FBCIBC1BBJuDBC3HBtBrBBhC-HBhQvBBWBBHmBBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBBxKBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BBibDBLBBC+R+RBBBqqUPBuLPBhCBB3BHBuBCBlPEEFBBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSpgBpgBBGBnjC2kC2kCBGBFQBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQPBhDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBqlB-PB4BDBzBHBCNBCBBp2B96C96CiEyWyWBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E6HBG4WBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBB-B3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB",!1)),Z:()=>new m(_("gBgEgEgvFgsCgsCBJBeBBGwBwBh9DAB",!1)),Zl:()=>new m(_("ohIA",!0)),Zp:()=>new m(_("phIA",!0)),Zs:()=>new m(_("gBgEgEgvFgsCgsCBJBlBwBwBh9DAB",!1)),ASCII_Hex_Digit:()=>new m(_("wBJIFbF",!0)),Alphabetic:()=>new m(_("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICC3CeeBQBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoBNBCCCBCCBCCJaBFDBeKBG3BBCGBPlDBCHBFHBFCBLCBDRRBuBBOkDBZgBBKBBFGGBWBDSBUYBIKBGXBCGBIJJBoBBLLBEGBHrCBCPBCCBFOBOSBCHBDBBDVBCGBCEEBCBEHBDBBDBBCJJFBBCEBNBBLFFBBBCFBFBBDVBCGBCBBCBBCBBFEBFBBDBBFIIBCBCSSBEBMCBCIBCCBCVBCGBCBBCEBEIBCCBCBBEQQBCBWDBFCBCHBDBBDVBCGBCBBCEBEHBDBBDBBKBBFBBCEBORRBCCBEBECBCDBEBBCCCBEEBEEBBBELBFEBECBCCBEHHpBMBCCBCWBCPBEHBCCBCCBJBBCCBCBBDDBdDBCHBCCBCWBCJBCEBEHBCCBCCBJBBGCBCDBOCBNMBCCBCoBBDHBCCBCCBCGGBCBIEBXFBCCBCRBEXBCIBCDDBFBJFBCCCBGBTBBO5BBGGBH0B0BBECBDBCXBCCCBRBCCBDEBCHHPDBhBgCgCBGBCjBBFSBFPBCjBBkC2BBCDDBDBR-BBLDBDlBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBEKBITBMUBNTBNMBCCBCBBNzBBDSBPFFkC4CBIqBBGlCBLeBCLBFIBYdBDEBMrBBFZB3BbBF+BBDTBzBYYBMMBBByBzBBCOBCHB0BpBBDDBLrBBCKBP2BBXCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBUhBBM1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBFSSBnBBuZzBB34BkHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBCfBwB2O2OBBBaIBIEBDEBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBGHBEwDBoBIBDmDBDxCBVUBCgBBZzBBNjCBCtBtBBEBECCBBBLgBBGiBBOcBEyBBCLBQRRBOBLEBC2BBKNBTWBEkCBCCCZCBDPBDDBMFBDFBDFBKGBCGBCqBBCNBH6DBWj9KBNWBFwBBloItLBDpDBnBGBNEBGLBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmC0BBsIcBEwBBwBfBOdBGqBBGdBDjBBFHBCEBrB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCDBCBBGHBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOnBBjBbBEGGBVB7HpBBCBBEBBRFBzBCBEcBLJJBUBrBRBvBUBcWBKlCBsBEBL4BBKOOBXBYyBBSDBJiBBEKKB+BBCDBKBBLCCkBRBChBBDHHBCB-BGBCCCBCBCOBCJBI4BBYDBCHBDBBDVBCGBCBBCEBEHBDBBDBBEHHGGBdJBCDDClBBCJBCDDCDBCBBECCtBhCBCCBCDBVCBfhCBDBBC5F5FB0BBDGBaFBjB+BBCEE8B1BBDoCoCBZBDNBWGB6F4BBoD-BBgBHBDDDBGBCBBCdBCBBDBBDDB+CHBDtBBDFBCCCBccBxBBDJBSnCBGTTBnCBoDHB5CgBBgBIBCsBBCGBCyByBBcBDVBCNBqCGBCBBCrBBECCBCCBBBCDDBZZBEBCBBCkBBCBBCDBCYYBqBBlIWBKQBCoBBECBwDwCwCB4cBnDuDBSjGBtyCgDBQvhBBSFBa68DBGmSB61GuBBy2B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBF4BBIQBhCBBCNNBFBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBFi7Fi7FBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCVBJBBhHGBCDBCBBCOBCkGB8BjCBEEE1lBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1TZBHZBHZB3zD-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Dash:()=>new m(_("tB9qB9qB0BiyDiyDmgBqgCqgCBEB+BoBoBQnMnMlgDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J",!1)),Emoji:()=>new m(_("jBHHGJBwDFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDrGrGhFBBNBBPDDBIBsCZBCBBYVVDIBWBBvFhBBDvDBDBBCCBDyCBDCBCmIBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDDBEJBECCBEEDJBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB",!1)),Emoji_Component:()=>new m(_("jBHHGJB0+H2G2Gsp3B3+8B3+8BBYB8PEBxtBDBtzhY-CB",!1)),Emoji_Modifier:()=>new m(_("7-8DE",!0)),Emoji_Modifier_Base:()=>new m(_("9wJ8G8GRDB4jzD9B9BBBBDDDBBB2DBBDKBWSBEFFBBBCCBICCZqGqGBFFWFFBvFvFBBBEEB0CRRBBBKMMgSDDJHBHKKBIBDCB5B+B+BBCCBCCSCBCMBmHCBrBIB",!1)),Emoji_Presentation:()=>new m(_("64IBBuGDBEDDqQBBWBBzBLBsBUUOJJBSSBGGBJJGWWIBBCFFDIIFBBdkBkBCFFBBBC+B+BBBBZPP8aBB0BFFvlxDrGrG-FDDBIBsCZBCZZVDDBDBCCBWBBvFgBBNIBClCBCVBNqBBFEBNQBEEEBlCBCCCB5FBD+BBODBCXBTbbBOO3C0CBxBlCBHEEBBBDDBEDBMBBIIBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB",!1)),Extended_Pictographic:()=>new m(_("pFFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDoBoBBCBlDLBQBBQPPBmBmBBIBxDBBNBBPDDBIBU3BBcOBLVVDIBCDBKWBH7FBDvDBDBBCCBDyCBDCBCDBG9HBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDQBECCBEBDMB7GlBBNDB5BHBLFBpBHBfBBNDBDNBKmBBNuBBCJBC4FB5CHBPxEBhI9fB",!1)),Hex_Digit:()=>new m(_("wBJIFbFq1-BJIFbF",!0)),Lowercase:()=>new m(_("hDZBwBLLFlBlBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDiBBIBBfEBhDsBsBCEEDDBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBCDB5XFBjkCIBC2D2DB+FBiC0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBB6DOORMBuDEEBEEcKFDBBJDBFiBiBBOBFsasaBYBn6BvBBCEEBGCFCCBCCBGBEiDCBIICFFNlBBCGG0oesBCUaCBBBmEMCBBBC8BCBIBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCWDBCCCBBB2ZqBBCNBHvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBkODDBBBCpBBCIBmoByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFBmI9BB1lChBB",!1)),Math:()=>new m(_("rBRRBBBgBeeCuBuBFmBmBgB5W5WBBBDbbBDDBBBwQCBuwGccBBBMEEOPPBCBWEBMEBiCMBFEEBFFBDBTFFDJBCDDBEBHEEBDDBCCBBBCFBENBClClCBWBCFBCBBFBBFfBCHHBPPBqIBJDBVBB7CffBZBCZZMGB+NBBNJBFFBFBBDBBEEBPCCDFBMHBGBB6BCCeDBKCBxK-BBhI-PBxBUBDFB9+zB4Z4ZBEBCjFjFRCBeCCeCCkEHHBCBitDBBhrwBwoBwoBBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBBhwFDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB-uCIB",!1)),Quotation_Mark:()=>new m(_("iBFFkEQQ96HHBaBBowDqOqOBCBOCBixzBDB+FFF7CBB",!1)),Terminal_Punctuation:()=>new m(_("hBLLCMMBEE-ZJJiQ6B6BpCPPCCB1FsBsBBJBCsHsHB3B3BBEBCHBgBmImIB1nB1nBBtFtFFFB4JBB2YHBmY9D9DBBBoCBB+ECBEoBoBBCBDBB7JBBjLDBjFBBLBBCCBeCB8FEB-BBBldYYBKKBBBwlDCBzJOOFLLCBBEBBtNBB8ndBBuICBkHEB-LBB3CBBgD4E4EBBB0ECBgERRB6H6HnxUDDB6B6BBBBCDBqFLLCMMBEEiCDD7hBxBxBnkBoGoG3JBB5EFBlCFB6CDB5dEBtBDB+FGBxDDBgECBiEBBHRRB5C5CBDBtDrJrJB2D2DBBBNBBnLDBEOBqDBB6HCBmQCC8HBB4CBBFBB-MCBuBmUmUBrCrCBspBspBBDB6vRBBmEiCiCBBBLqRqRBoJoJBnwTnwTovHDB",!1)),Uppercase:()=>new m(_("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBGbbBOBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBBvgCZBHZBHZB",!1)),White_Space:()=>new m(_("JEBTlDlDbgvFgvFgsCKBeBBGwBwBh9DAB",!1))})),J(ur,"SCRIPTS",new tu({Adlam:()=>new m(_("go6DrCFJFB",!0)),Ahom:()=>new m(_("g4lCaDOFW",!0)),Anatolian_Hieroglyphs:()=>new m(_("ggxCmS",!0)),Arabic:()=>new m(_("gwBEBCFBCNBCCBCfBCJBMZBCrDBChBBxCvBBxHhBBGqCBCcBxy8BtPBDvEBhBPBxDEBCmEBk7DeBkCFBJIBiBFBh43BDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB",!1)),Armenian:()=>new m(_("xpBlBDxBDCks9BE",!0)),Avestan:()=>new m(_("g4iC1BEG",!0)),Balinese:()=>new m(_("g4GsCCxB",!0)),Bamum:()=>new m(_("g1pB3CpowB4R",!0)),Bassa_Vah:()=>new m(_("w26CdDF",!0)),Batak:()=>new m(_("g+GzBJD",!0)),Bengali:()=>new m(_("gsCDBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYB",!1)),Beria_Erfe:()=>new m(_("g17CYDY",!0)),Bhaiksuki:()=>new m(_("ggnCICsBCNLc",!0)),Bopomofo:()=>new m(_("qXB6wLqBxDf",!0)),Brahmi:()=>new m(_("ggkCtCFjBKA",!0)),Braille:()=>new m(_("ggK-H",!0)),Buginese:()=>new m(_("gwGbDB",!0)),Buhid:()=>new m(_("g6FT",!0)),Canadian_Aboriginal:()=>new m(_("ggF-TxRlC7tgCP",!0)),Carian:()=>new m(_("g1gCwB",!0)),Caucasian_Albanian:()=>new m(_("wphCzBMA",!0)),Chakma:()=>new m(_("gokC0BCR",!0)),Cham:()=>new m(_("gwqB2BKNDJDD",!0)),Cherokee:()=>new m(_("g9E1CDFz7lBvC",!0)),Chorasmian:()=>new m(_("w9jCb",!0)),Common:()=>new m(_("AgCBbFBbuBBCOBCEBYgBgBiOmBBGEBDTB1DKKHCC+THHPEEhB9E9ElQiEiEB6mB6mB2MDBjJwvBwvBBBBoCBBsGBBCumBumBOIIBCBCFBCCBDmYmYBKBD2CBCKBEKBCOBShBB-BlBBCCBDFBCaBCQBqBCBF5UBXKBW-cBhIzTBDpEBhQ9CBzMUBCCCBXBQHBFDB8CBBE7C7CB0E0EBOBhBlBBKxBxBB+BBgBwCBwB5C5CBmFBhuG-BBhoWhBBnDCBmFJB1HhFhFsMPPBzuUzuUBxGxGBIBXiBBCSBCDB0ECCBeBbFBbKBLuBuBBhChCBFBCGBLEBjICBFsBBEIBxCMB0BsBBlHaBltuBDB96D8HBEzNBHWBQQBgDzDB9B1HBLmBBD9BBEQBJBBIdBF8BB2GTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBByjFjCBtC8BBjWrBBFjDBNOBDOBCOBCkBBLtFB5BZBCBBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBnghYffB+CB",!1)),Coptic:()=>new m(_("ifNxkKzDGG",!0)),Cuneiform:()=>new m(_("ggoC5cnDuDCEMjG",!0)),Cypriot:()=>new m(_("ggiCFBDCCBqBBCBBEDD",!1)),Cypro_Minoan:()=>new m(_("w8rCiD",!0)),Cyrillic:()=>new m(_("ggBkEBDoFBx6FKBhFtCtCojEfBhie-CBv8VBBhw4B9BBiBAB",!1)),Deseret:()=>new m(_("gghCvC",!0)),Devanagari:()=>new m(_("goCwCFODZh7nBfhwcJ",!0)),Dives_Akuru:()=>new m(_("gomCGBDDDBGBCBBCdBCBBDLBKJB",!1)),Dogra:()=>new m(_("ggmC7B",!0)),Duployan:()=>new m(_("ggvDqDGMEIIJDD",!0)),Egyptian_Hieroglyphs:()=>new m(_("ggsC1iBL68D",!0)),Elbasan:()=>new m(_("gohCnB",!0)),Elymaic:()=>new m(_("g-jCW",!0)),Ethiopic:()=>new m(_("gwEoCBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBnvGWBKGBCGBCGBCGBCGBCGBCGBCGBjpfFBDFBDFBKGBCGBylvCGBCDBCBBCOB",!1)),Garay:()=>new m(_("gqjClBEcJB",!0)),Georgian:()=>new m(_("glElBBCGGDqBBCDBx8CqBBDCBhiElBBCGG",!1)),Glagolitic:()=>new m(_("ggL-Ch9sDGCQDGCBCE",!0)),Gothic:()=>new m(_("w5gCa",!0)),Grantha:()=>new m(_("g4kCDBCHBDBBDVBCGBCBBCEBDIBDBBDCBDHHGGBDGBEEB",!1)),Greek:()=>new m(_("wbDBCCBDDBCFFCCCBBBCCCBSBC+BBPPBnpGEBzBEBFEB1ChKhKBUBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBoJ-xiB-xiB7uVuCBSgj0Bgj0BBkCB",!1)),Gujarati:()=>new m(_("h0CCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGB",!1)),Gunjala_Gondi:()=>new m(_("grnCFCBCkBCBCFIJ",!0)),Gurmukhi:()=>new m(_("hwCCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPB",!1)),Gurung_Khema:()=>new m(_("go4C5B",!0)),Han:()=>new m(_("g0LZBC4CBN1GBwBCCaIBPDBle-tGBhC-vUBhoWtLBDpDBpodBBNGBqgkB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Hangul:()=>new m(_("goE-HvxHBiI9CyDeiCei3dckUj9KNWFwBl9JeEFDFDFDC",!0)),Hanifi_Rohingya:()=>new m(_("gojCnBJJ",!0)),Hanunoo:()=>new m(_("g5FU",!0)),Hatran:()=>new m(_("gniCSCBGE",!0)),Hebrew:()=>new m(_("xsB2BBJaBFFBpp9BZBCEBCCCBCCBCCBIB",!1)),Hiragana:()=>new m(_("hiM1CBHCBi7-C+IBTeeBBBulQAB",!1)),Imperial_Aramaic:()=>new m(_("giiCVCI",!0)),Inherited:()=>new m(_("gYvDB2IBBlOKBbhXhXBCB8qEtBBDLBlPCBCMBCGBFHHEBBnG-BBtQBBjGgBB65DDBsDBBmrzBPBRNBwejHjH7iEl+uBl+uBBsBBDWBhRCBSHBDGBfDBz6rYvHB",!1)),Inscriptional_Pahlavi:()=>new m(_("g7iCSGH",!0)),Inscriptional_Parthian:()=>new m(_("g6iCVDH",!0)),Javanese:()=>new m(_("gsqBtCDJFB",!0)),Kaithi:()=>new m(_("gkkCiCLA",!0)),Kannada:()=>new m(_("gkDMCCCWCJCEDICCCDIBGCCDDJCC",!0)),Katakana:()=>new m(_("hlM5CBDCBxHPBxGuBBC3CBvgzBJBCsBBzisBDBCGBCBBCgJgJBBBzBPPBCB",!1)),Kawi:()=>new m(_("g4nCQCoBEc",!0)),Kayah_Li:()=>new m(_("goqBtBCA",!0)),Kharoshthi:()=>new m(_("gwiCDCBGHCCCcDCFJII",!0)),Khitan_Small_Script:()=>new m(_("k-7C84G84GB0OBqBAB",!1)),Khmer:()=>new m(_("g8F9CDJHJnPf",!0)),Khojki:()=>new m(_("gwkCRCuB",!0)),Khudawadi:()=>new m(_("w1kC6BGJ",!0)),Kirat_Rai:()=>new m(_("gq7C5B",!0)),Lao:()=>new m(_("h0DBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDB",!1)),Latin:()=>new m(_("hCZBHZBwBQQGWBCeBCgOBoBEB8wGlBBHwBBGDBGMBClCBiC-HByLOORMBuEBBHccSoBB42CfBj1elDBExCBVOBxZqBBCIBCDB38TGB7gBZBHZBmhCFBCpBBCIBm61BeBHFB",!1)),Lepcha:()=>new m(_("ggH3BEOEC",!0)),Limbu:()=>new m(_("goGeBCLBFLBFEEBKB",!1)),Linear_A:()=>new m(_("gwhC2JKVLH",!0)),Linear_B:()=>new m(_("gggCLCZCSCBCODNjB6D",!0)),Lisu:()=>new m(_("wmpBvBx1eA",!0)),Lycian:()=>new m(_("g0gCc",!0)),Lydian:()=>new m(_("gpiCZGA",!0)),Mahajani:()=>new m(_("wqkCmB",!0)),Makasar:()=>new m(_("g3nCY",!0)),Malayalam:()=>new m(_("goDMCCCyBCCCFFPDZ",!0)),Mandaic:()=>new m(_("giCbDA",!0)),Manichaean:()=>new m(_("g2iCmBFL",!0)),Marchen:()=>new m(_("wjnCfDVCN",!0)),Masaram_Gondi:()=>new m(_("gonCGBCBBCrBBECCBCCBHBJJB",!1)),Medefaidrin:()=>new m(_("gy7C6C",!0)),Meetei_Mayek:()=>new m(_("g3qBWqGtBDJ",!0)),Mende_Kikakui:()=>new m(_("gg6DkGDP",!0)),Meroitic_Cursive:()=>new m(_("gtiCXFTDtB",!0)),Meroitic_Hieroglyphs:()=>new m(_("gsiCf",!0)),Miao:()=>new m(_("g47CqCF4BIQ",!0)),Modi:()=>new m(_("gwlCkCMJ",!0)),Mongolian:()=>new m(_("ggGBBDCCBSBH4CBIqBB2t-BMB",!1)),Mro:()=>new m(_("gy6CeCJFB",!0)),Multani:()=>new m(_("g0kCGBCCCBCBCOBCKB",!1)),Myanmar:()=>new m(_("ggE-EhqmBeiDfxibT",!0)),Nabataean:()=>new m(_("gkiCeJI",!0)),Nag_Mundari:()=>new m(_("wm5DpB",!0)),Nandinagari:()=>new m(_("gtmCHDtBDK",!0)),New_Tai_Lue:()=>new m(_("gsGrBFZHKEB",!0)),Newa:()=>new m(_("gglC7CCE",!0)),Nko:()=>new m(_("g+B6BDC",!0)),Nushu:()=>new m(_("h-7CvsQvsQBqMB",!1)),Nyiakeng_Puachue_Hmong:()=>new m(_("go4DsBENDJFB",!0)),Ogham:()=>new m(_("g0Fc",!0)),Ol_Chiki:()=>new m(_("wiHvB",!0)),Ol_Onal:()=>new m(_("wu5DqBFA",!0)),Old_Hungarian:()=>new m(_("gkjCyBOyBIF",!0)),Old_Italic:()=>new m(_("g4gCjBKC",!0)),Old_North_Arabian:()=>new m(_("g0iCf",!0)),Old_Permic:()=>new m(_("w6gCqB",!0)),Old_Persian:()=>new m(_("g9gCjBFN",!0)),Old_Sogdian:()=>new m(_("g4jCnB",!0)),Old_South_Arabian:()=>new m(_("gziCf",!0)),Old_Turkic:()=>new m(_("ggjCoC",!0)),Old_Uyghur:()=>new m(_("w7jCZ",!0)),Oriya:()=>new m(_("h4CCCHDBDVCGCBCEDIDBDCICFBCEDR",!0)),Osage:()=>new m(_("wlhCjBFjB",!0)),Osmanya:()=>new m(_("gkhCdDJ",!0)),Pahawh_Hmong:()=>new m(_("g46ClCLJCGCUGS",!0)),Palmyrene:()=>new m(_("gjiCf",!0)),Pau_Cin_Hau:()=>new m(_("g2mC4B",!0)),Phags_Pa:()=>new m(_("giqB3B",!0)),Phoenician:()=>new m(_("goiCbEA",!0)),Psalter_Pahlavi:()=>new m(_("g8iCRIDNG",!0)),Rejang:()=>new m(_("wpqBjBMA",!0)),Runic:()=>new m(_("g1FqCEK",!0)),Samaritan:()=>new m(_("ggCtBDO",!0)),Saurashtra:()=>new m(_("gkqBlCJL",!0)),Sharada:()=>new m(_("gskC-ChsCH",!0)),Shavian:()=>new m(_("wihCvB",!0)),Siddham:()=>new m(_("gslC1BDlB",!0)),Sidetic:()=>new m(_("gqiCZ",!0)),SignWriting:()=>new m(_("gg2DrUQECO",!0)),Sinhala:()=>new m(_("hsDCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBt-gCTB",!1)),Sogdian:()=>new m(_("w5jCpB",!0)),Sora_Sompeng:()=>new m(_("wmkCYIJ",!0)),Soyombo:()=>new m(_("wymCyC",!0)),Sundanese:()=>new m(_("g8G-BhIH",!0)),Sunuwar:()=>new m(_("g+mChBPJ",!0)),Syloti_Nagri:()=>new m(_("ggqBsB",!0)),Syriac:()=>new m(_("g4BNC7BDCxIK",!0)),Tagalog:()=>new m(_("g4FVKA",!0)),Tagbanwa:()=>new m(_("g7FMCCCB",!0)),Tai_Le:()=>new m(_("wqGdDE",!0)),Tai_Tham:()=>new m(_("gxG+BCcDKHJHN",!0)),Tai_Viet:()=>new m(_("g0qBiCZE",!0)),Tai_Yo:()=>new m(_("g25DeCVJB",!0)),Takri:()=>new m(_("g0lC5BHJ",!0)),Tamil:()=>new m(_("i8CBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBm+kCxBBOAB",!1)),Tangsa:()=>new m(_("wz6CuCCJ",!0)),Tangut:()=>new m(_("g-7CgBgBB+3GBhQeBiDyDB",!1)),Telugu:()=>new m(_("ggDMCCCWCPDICCCDIBCCCBDDDJII",!0)),Thaana:()=>new m(_("g8BxB",!0)),Thai:()=>new m(_("hwD5BGb",!0)),Tibetan:()=>new m(_("g4DnCCjBFmBCjBCOCGFB",!0)),Tifinagh:()=>new m(_("wpL3BIBPA",!0)),Tirhuta:()=>new m(_("gklCnCJJ",!0)),Todhri:()=>new m(_("guhCzB",!0)),Tolong_Siki:()=>new m(_("wtnCrBFJ",!0)),Toto:()=>new m(_("w04De",!0)),Tulu_Tigalari:()=>new m(_("g8kCJBCDDClBBCJBCDDCDBCJBCBBJBB",!1)),Ugaritic:()=>new m(_("g8gCdCA",!0)),Unknown:()=>new m(_("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-FB",!1)),Vai:()=>new m(_("gopBrJ",!0)),Vithkuqi:()=>new m(_("wrhCKCOCGCBCKCOCGCB",!0)),Wancho:()=>new m(_("g24D5BGA",!0)),Warang_Citi:()=>new m(_("glmCyCNA",!0)),Yezidi:()=>new m(_("g0jCpBCCDB",!0)),Yi:()=>new m(_("ggoBskBE2B",!0)),Zanabazar_Square:()=>new m(_("gwmCnC",!0))})),J(ur,"FOLD_CATEGORIES",new tu({L:()=>new m(_("laA",!0)),LC:()=>new m(_("laA",!0)),Ll:()=>new m(_("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGC3HrBrBCEEJHHCCBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHxC9zC9zCBuBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB",!1)),Lt:()=>new m(_("kOCCBCCBCClBCCtsHHBJHBJHBMQQwBAB",!1)),Lu:()=>new m(_("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpL2B2Bs1CvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB",!1)),M:()=>new m(_("5cgBgBlgHAB",!1)),Mn:()=>new m(_("5cgBgBlgHAB",!1)),Emoji:()=>new m(_("8mJA",!0)),Extended_Pictographic:()=>new m(_("8mJA",!0)),Lowercase:()=>new m(_("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHuBPBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB",!1)),Math:()=>new m(_("ycGDCHHFMMDDDCHHFAB",!1)),Uppercase:()=>new m(_("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpLiBiBBOBFsasaBYBn6BvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB",!1))})),J(ur,"FOLD_SCRIPT",new tu({Common:()=>new m(_("8cgBgB",!1)),Greek:()=>new m(_("1FwUwU",!1)),Inherited:()=>new m(_("5cgBgBlgHAB",!1))})),ur),ve,X=(ve=class{static is32(e,t){let n=0,s=e.length;for(;n<s;){const i=n+Math.floor((s-n)/2),o=e.getLo(i),a=e.getHi(i);if(o<=t&&t<=a){const u=e.getStride(i);return(t-o)%u===0}t<o?s=i:n=i+1}return!1}static is(e,t){if(t<=ve.MAX_LATIN1){for(let n=0;n<e.length;n++){if(t>e.getHi(n))continue;const s=e.getLo(n);if(t<s)return!1;const i=e.getStride(n);return(t-s)%i===0}return!1}return e.length>0&&t>=e.getLo(0)&&ve.is32(e,t)}static isUpper(e){if(e<=ve.MAX_LATIN1){const t=String.fromCodePoint(e);return t.toUpperCase()===t&&t.toLowerCase()!==t}return ve.is(Rt.Upper,e)}static isPrint(e){return e<=ve.MAX_LATIN1?e>=32&&e<ve.MAX_ASCII||e>=161&&e!==173:ve.is(Rt.Print,e)}static simpleFold(e){if(Rt.CASE_ORBIT.has(e))return Rt.CASE_ORBIT.get(e);const t=L.toLowerCase(e);return t!==e?t:L.toUpperCase(e)}static equalsIgnoreCase(e,t){if(e===t)return!0;if(e<0||t<0)return!1;if(e<=ve.MAX_ASCII&&t<=ve.MAX_ASCII)return 65<=e&&e<=90&&(e|=32),65<=t&&t<=90&&(t|=32),e===t;for(let n=ve.simpleFold(e);n!==e;n=ve.simpleFold(n))if(n===t)return!0;return!1}},J(ve,"MAX_RUNE",1114111),J(ve,"MAX_ASCII",127),J(ve,"MAX_LATIN1",255),J(ve,"MAX_BMP",65535),J(ve,"MIN_FOLD",65),J(ve,"MAX_FOLD",125251),J(ve,"MIN_HIGH_SURROGATE",55296),J(ve,"MAX_HIGH_SURROGATE",56319),J(ve,"MIN_LOW_SURROGATE",56320),J(ve,"MAX_LOW_SURROGATE",57343),J(ve,"MIN_SUPPLEMENTARY_CODE_POINT",65536),ve);const VB=256,Sg=new Uint8Array(VB);for(let r=0;r<VB;r++)Sg[r]=97<=r&&r<=122||65<=r&&r<=90||48<=r&&r<=57||r===95?1:0;let Il=null,Dl=null;var Fe,te=(Fe=class{static emptyInts(){return[]}static isByteArray(e){return Array.isArray(e)||e instanceof Uint8Array}static isalnum(e){return L.CODES.get("0")<=e&&e<=L.CODES.get("9")||L.CODES.get("a")<=e&&e<=L.CODES.get("z")||L.CODES.get("A")<=e&&e<=L.CODES.get("Z")}static unhex(e){return L.CODES.get("0")<=e&&e<=L.CODES.get("9")?e-L.CODES.get("0"):L.CODES.get("a")<=e&&e<=L.CODES.get("f")?e-L.CODES.get("a")+10:L.CODES.get("A")<=e&&e<=L.CODES.get("F")?e-L.CODES.get("A")+10:-1}static escapeRune(e){let t="";if(X.isPrint(e))Fe.METACHARACTERS.indexOf(String.fromCodePoint(e))>=0&&(t+="\\"),t+=String.fromCodePoint(e);else switch(e){case L.CODES.get('"'):t+='\\"';break;case L.CODES.get("\\"):t+="\\\\";break;case L.CODES.get("	"):t+="\\t";break;case L.CODES.get(`
`):t+="\\n";break;case L.CODES.get("\r"):t+="\\r";break;case L.CODES.get("\b"):t+="\\b";break;case L.CODES.get("\f"):t+="\\f";break;default:{let n=e.toString(16);e<256?(t+="\\x",n.length===1&&(t+="0"),t+=n):t+=`\\x{${n}}`;break}}return t}static stringToRunes(e){const t=String(e),n=[];let s=0;for(;s<t.length;){const i=t.codePointAt(s);n.push(i),s+=i>X.MAX_BMP?2:1}return n}static runeToString(e){return String.fromCodePoint(e)}static isWordRune(e){return e<VB?Sg[e]===1:!1}static emptyOpContext(e,t){let n=0;return e<0&&(n|=Fe.EMPTY_BEGIN_TEXT|Fe.EMPTY_BEGIN_LINE),e===10&&(n|=Fe.EMPTY_BEGIN_LINE),t<0&&(n|=Fe.EMPTY_END_TEXT|Fe.EMPTY_END_LINE),t===10&&(n|=Fe.EMPTY_END_LINE),Fe.isWordRune(e)!==Fe.isWordRune(t)?n|=Fe.EMPTY_WORD_BOUNDARY:n|=Fe.EMPTY_NO_WORD_BOUNDARY,n}static quoteMeta(e){return e.split("").map(t=>Fe.METACHARACTERS.indexOf(t)>=0?`\\${t}`:t).join("")}static charCount(e){return e>X.MAX_BMP?2:1}static toArray(e){const t=e.length,n=new Array(t);for(let s=0;s<t;s++)n[s]=e[s];return n}static stringToUtf8ByteArray(e){if(globalThis.TextEncoder)return Il||(Il=new TextEncoder),Il.encode(e);{let t=[],n=0;for(let s=0;s<e.length;s++){let i=e.charCodeAt(s);i<128?t[n++]=i:i<2048?(t[n++]=i>>6|192,t[n++]=i&63|128):(i&64512)===X.MIN_HIGH_SURROGATE&&s+1<e.length&&(e.charCodeAt(s+1)&64512)===X.MIN_LOW_SURROGATE?(i=X.MIN_SUPPLEMENTARY_CODE_POINT+((i&1023)<<10)+(e.charCodeAt(++s)&1023),t[n++]=i>>18|240,t[n++]=i>>12&63|128,t[n++]=i>>6&63|128,t[n++]=i&63|128):(t[n++]=i>>12|224,t[n++]=i>>6&63|128,t[n++]=i&63|128)}return t}}static utf8ByteArrayToString(e){if(globalThis.TextDecoder){Dl||(Dl=new TextDecoder("utf-8"));const t=e instanceof Uint8Array?e:new Uint8Array(e);return Dl.decode(t)}else{let t=[],n=0,s=0;for(;n<e.length;){let i=e[n++];if(i<128)t[s++]=String.fromCharCode(i);else if(i>191&&i<224){let o=e[n++];t[s++]=String.fromCharCode((i&31)<<6|o&63)}else if(i>239&&i<365){let o=e[n++],a=e[n++],u=e[n++],l=((i&7)<<18|(o&63)<<12|(a&63)<<6|u&63)-X.MIN_SUPPLEMENTARY_CODE_POINT;t[s++]=String.fromCharCode(X.MIN_HIGH_SURROGATE+(l>>10)),t[s++]=String.fromCharCode(X.MIN_LOW_SURROGATE+(l&1023))}else{let o=e[n++],a=e[n++];t[s++]=String.fromCharCode((i&15)<<12|(o&63)<<6|a&63)}}return t.join("")}}},J(Fe,"METACHARACTERS","\\.+*?()|[]{}^$"),J(Fe,"EMPTY_BEGIN_LINE",1),J(Fe,"EMPTY_END_LINE",2),J(Fe,"EMPTY_BEGIN_TEXT",4),J(Fe,"EMPTY_END_TEXT",8),J(Fe,"EMPTY_WORD_BOUNDARY",16),J(Fe,"EMPTY_NO_WORD_BOUNDARY",32),J(Fe,"EMPTY_ALL",-1),Fe);const Ng=(r=[],e=0)=>{const t=Object.create(null);for(let n=0;n<r.length;n++){const s=r[n],i=e+n;t[s]=i,t[i]=s}return Object.freeze(t)};var fr,ds=(fr=class{getEncoding(){throw Error("not implemented")}asCharSequence(){throw Error("not implemented")}asBytes(){throw Error("not implemented")}length(){throw Error("not implemented")}isUTF8Encoding(){return this.getEncoding()===fr.Encoding.UTF_8}isUTF16Encoding(){return this.getEncoding()===fr.Encoding.UTF_16}},J(fr,"Encoding",Ng(["UTF_16","UTF_8"])),fr),Gf=class extends ds{constructor(r=null){super(),this.bytes=r}getEncoding(){return ds.Encoding.UTF_8}asCharSequence(){return te.utf8ByteArrayToString(this.bytes)}asBytes(){return this.bytes}length(){return this.bytes.length}},Bw=class extends ds{constructor(r=null){super(),this.charSequence=r}getEncoding(){return ds.Encoding.UTF_16}asCharSequence(){return this.charSequence}asBytes(){return te.stringToUtf8ByteArray(this.charSequence.toString())}length(){return this.charSequence.length}},ns=class{static utf16(r){return new Bw(r)}static utf8(r){return te.isByteArray(r)?new Gf(r):new Gf(te.stringToUtf8ByteArray(r))}},yt=class{static EOF(){return-8}constructor(){this.end=0}canCheckPrefix(){return!0}endPos(){return this.end}hasString(){return!1}hasAnyString(){return!1}prefixLength(){return 0}},hw=class extends yt{constructor(r,e=0,t=r.length){super(),this.bytes=r,this.start=e,this.end=t}hasString(r,e){const t=r.bytes;if(t.length===0)return!0;const n=this.indexOf(this.bytes,t,this.start+e);return n!==-1&&n<=this.end-t.length}hasAnyString(r,e){return r.ac8?r.ac8.searchUTF8(this.bytes,this.start+e,this.end):!1}step(r){if(r+=this.start,r>=this.end)return yt.EOF();const e=this.bytes[r]&255;if(e<128)return e<<3|1;if(e>=194&&e<=223&&r+1<this.end){const t=this.bytes[r+1]&255;return(t&192)!==128?e<<3|1:((e&31)<<6|t&63)<<3|2}else if(e>=224&&e<=239&&r+2<this.end){const t=this.bytes[r+1]&255;if((t&192)!==128)return e<<3|1;const n=this.bytes[r+2]&255;return(n&192)!==128?e<<3|1:((e&15)<<12|(t&63)<<6|n&63)<<3|3}else if(e>=240&&e<=244&&r+3<this.end){const t=this.bytes[r+1]&255;if((t&192)!==128)return e<<3|1;const n=this.bytes[r+2]&255;if((n&192)!==128)return e<<3|1;const s=this.bytes[r+3]&255;return(s&192)!==128?e<<3|1:((e&7)<<18|(t&63)<<12|(n&63)<<6|s&63)<<3|4}else return e<<3|1}index(r,e){e+=this.start;const t=this.indexOf(this.bytes,r.prefixUTF8,e);return t<0?t:t-e}context(r){r+=this.start;let e=-1;if(r>this.start&&r<=this.end){let n=r-1;if(e=this.bytes[n--],e>=128){let s=r-4;for(s<this.start&&(s=this.start);n>=s&&(this.bytes[n]&192)===128;)n--;n<this.start&&(n=this.start),e=this.step(n-this.start)>>3}}const t=r<this.end?this.step(r-this.start)>>3:-1;return te.emptyOpContext(e,t)}indexOf(r,e,t=0){let n=e.length;if(n===0)return t<=this.end?t:-1;const s=e[0];let i=this.end-n;const o=typeof r.indexOf=="function";let a=t;for(;a<=i;){if(o){if(a=r.indexOf(s,a),a===-1||a>i)return-1}else{for(;a<=i&&r[a]!==s;)a++;if(a>i)return-1}let u=!0;for(let l=1;l<n;l++)if(r[a+l]!==e[l]){u=!1;break}if(u)return a;a++}return-1}prefixLength(r){return r.prefixUTF8.length}},dw=class extends yt{constructor(r,e=0,t=r.length){super(),this.charSequence=r,this.start=e,this.end=t}hasString(r,e){const t=this.charSequence.indexOf(r.str,this.start+e);return t!==-1&&t<=this.end-r.str.length}hasAnyString(r,e){return r.ac16?r.ac16.searchUTF16(this.charSequence,this.start+e,this.end):!1}step(r){if(r+=this.start,r>=this.end)return yt.EOF();const e=this.charSequence.charCodeAt(r);if(e<X.MIN_HIGH_SURROGATE||e>X.MAX_HIGH_SURROGATE||r+1>=this.end)return e<<3|1;const t=this.charSequence.charCodeAt(r+1);return t>=X.MIN_LOW_SURROGATE&&t<=X.MAX_LOW_SURROGATE?(e-X.MIN_HIGH_SURROGATE)*1024+(t-X.MIN_LOW_SURROGATE)+X.MIN_SUPPLEMENTARY_CODE_POINT<<3|2:e<<3|1}index(r,e){e+=this.start;const t=this.charSequence.indexOf(r.prefix,e);return t<0||t>this.end-r.prefix.length?-1:t-e}context(r){r+=this.start;const e=r>this.start&&r<=this.end?this.charSequence.charCodeAt(r-1):-1,t=r<this.end?this.charSequence.charCodeAt(r):-1;return te.emptyOpContext(e,t)}prefixLength(r){return r.prefix.length}},Oe=class{static fromUTF8(r,e=0,t=r.length){return new hw(r,e,t)}static fromUTF16(r,e=0,t=r.length){return new dw(r,e,t)}},pa=class extends Error{constructor(r){super(r),this.name="RE2JSException"}},Pe=class extends pa{constructor(r,e=null){let t=`error parsing regexp: ${r}`;e&&(t+=`: \`${e}\``),super(t),this.name="RE2JSSyntaxException",this.message=t,this.error=r,this.input=e}getDescription(){return this.error}getPattern(){return this.input}},fw=class extends pa{constructor(r){super(r),this.name="RE2JSCompileException"}},vt=class extends pa{constructor(r){super(r),this.name="RE2JSGroupException"}},Cw=class extends pa{constructor(r){super(r),this.name="RE2JSFlagsException"}},bo=class extends pa{constructor(r){super(r),this.name="RE2JSInternalException"}},os,Uf=(os=class{static quoteReplacement(e,t=!1){return t?e.indexOf("\\")<0&&e.indexOf("$")<0?e:e.split("").map(n=>{const s=n.codePointAt(0);return s===L.CODES.get("\\")||s===L.CODES.get("$")?`\\${n}`:n}).join(""):e.indexOf("$")<0?e:e.split("").map(n=>n.codePointAt(0)===L.CODES.get("$")?"$$":n).join("")}constructor(e,t){if(e===null)throw new Error("pattern is null");this.patternInput=e;const n=this.patternInput.re2();this.patternGroupCount=n.numberOfCapturingGroups(),this.groups=[],this.namedGroups=n.namedGroups,this.numberOfInstructions=n.numberOfInstructions(),t instanceof ds?this.resetMatcherInput(t):te.isByteArray(t)?this.resetMatcherInput(ns.utf8(t)):this.resetMatcherInput(ns.utf16(t))}pattern(){return this.patternInput}reset(){return this.matcherInputLength=this.matcherInput.length(),this.appendPos=0,this.hasMatch=!1,this.hasGroups=!1,this.anchorFlag=0,this}resetMatcherInput(e){if(e===null)throw new Error("input is null");return e instanceof ds||(te.isByteArray(e)?e=ns.utf8(e):e=ns.utf16(e)),this.matcherInput=e,this.reset(),this}start(e=0){if(typeof e=="string"){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new vt(`group '${e}' not found`);e=t}return this.loadGroup(e),this.groups[2*e]}end(e=0){if(typeof e=="string"){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new vt(`group '${e}' not found`);e=t}return this.loadGroup(e),this.groups[2*e+1]}programSize(){return this.numberOfInstructions}group(e=0){if(typeof e=="string"){const s=this.namedGroups[e];if(!Number.isFinite(s))throw new vt(`group '${e}' not found`);e=s}const t=this.start(e),n=this.end(e);return t<0&&n<0?null:this.substring(t,n)}getNamedGroups(){if(!this.hasMatch)throw new vt("perhaps no match attempted");const e=Object.create(null);for(const t of Object.keys(this.namedGroups))e[t]=this.group(t);return e}groupCount(){return this.patternGroupCount}loadGroup(e){if(e<0||e>this.patternGroupCount)throw new vt(`Group index out of bounds: ${e}`);if(!this.hasMatch)throw new vt("perhaps no match attempted");if(e===0||this.hasGroups)return;const t=this.matcherInputLength,n=this.patternInput.re2().matchMachineInput(this.matcherInput,this.groups[0],t,this.anchorFlag,1+this.patternGroupCount);if(!n[0])throw new vt("inconsistency in matching group data");this.groups=n[1],this.hasGroups=!0}matches(){return this.genMatch(0,G.ANCHOR_BOTH)}lookingAt(){return this.genMatch(0,G.ANCHOR_START)}find(e=null){if(e!==null){if(e<0||e>this.matcherInputLength)throw new vt(`start index out of bounds: ${e}`);return this.reset(),this.genMatch(e,0)}if(e=0,this.hasMatch&&(e=this.groups[1],this.groups[0]===this.groups[1])){const t=(this.matcherInput.isUTF16Encoding()?Oe.fromUTF16(this.matcherInput.asCharSequence(),0,this.matcherInputLength):Oe.fromUTF8(this.matcherInput.asBytes(),0,this.matcherInputLength)).step(e);t<0?e++:e+=t&7}return this.genMatch(e,G.UNANCHORED)}genMatch(e,t){const n=this.patternInput.re2().matchMachineInput(this.matcherInput,e,this.matcherInputLength,t,1);return n[0]?(this.groups=n[1],this.hasMatch=!0,this.hasGroups=this.patternGroupCount===0,this.anchorFlag=t,!0):(this.hasMatch=!1,!1)}substring(e,t){return this.matcherInput.isUTF8Encoding()?te.utf8ByteArrayToString(this.matcherInput.asBytes().slice(e,t)):this.matcherInput.asCharSequence().substring(e,t).toString()}inputLength(){return this.matcherInputLength}appendReplacement(e,t=!1){let n="";const s=this.start(),i=this.end();return this.appendPos<s&&(n+=this.substring(this.appendPos,s)),this.appendPos=i,n+=t?this.appendReplacementInternalJava(e):this.appendReplacementInternalJs(e),n}appendReplacementInternalJava(e){let t="",n=0;const s=e.length;let i=0;for(;i<s;){const o=e.codePointAt(i);if(o===L.CODES.get("\\")){if(n<i&&(t+=e.substring(n,i)),i++,i>=s)throw new vt("character to be escaped is missing");n=i,i++;continue}if(o===L.CODES.get("$")){if(n<i&&(t+=e.substring(n,i)),i+1>=s)throw new vt("Illegal group reference: group index is missing");const a=e.codePointAt(i+1);if(L.CODES.get("0")<=a&&a<=L.CODES.get("9")){let u=a-L.CODES.get("0"),l=i+2;for(;l<s;l++){const d=e.codePointAt(l);if(d<L.CODES.get("0")||d>L.CODES.get("9")||u*10+d-L.CODES.get("0")>this.patternGroupCount)break;u=u*10+d-L.CODES.get("0")}if(u>this.patternGroupCount)throw new vt(`n > number of groups: ${u}`);const B=this.group(u);B!==null&&(t+=B),i=l,n=i}else if(a===L.CODES.get("{")){let u=i+2;for(;u<s&&e.codePointAt(u)!==L.CODES.get("}");)u++;if(u>=s)throw new vt("named capture group is missing trailing '}'");const l=e.substring(i+2,u),B=this.group(l);B!==null&&(t+=B),i=u+1,n=i}else throw new vt("Illegal group reference");continue}i++}return n<s&&(t+=e.substring(n,s)),t}appendReplacementInternalJs(e){let t="",n=0;const s=e.length;for(let i=0;i<s-1;i++)if(e.codePointAt(i)===L.CODES.get("$")){let o=e.codePointAt(i+1);if(L.CODES.get("$")===o){n<i&&(t+=e.substring(n,i)),t+="$",i++,n=i+1;continue}else if(L.CODES.get("&")===o){n<i&&(t+=e.substring(n,i));const a=this.group(0);a!==null?t+=a:t+="$&",i++,n=i+1;continue}else if(L.CODES.get("`")===o){n<i&&(t+=e.substring(n,i)),t+=this.substring(0,this.start(0)),i++,n=i+1;continue}else if(L.CODES.get("'")===o){n<i&&(t+=e.substring(n,i)),t+=this.substring(this.end(0),this.matcherInputLength),i++,n=i+1;continue}else if(L.CODES.get("1")<=o&&o<=L.CODES.get("9")){let a=o-L.CODES.get("0");for(n<i&&(t+=e.substring(n,i)),i+=2;i<s&&(o=e.codePointAt(i),!(o<L.CODES.get("0")||o>L.CODES.get("9")||a*10+o-L.CODES.get("0")>this.patternGroupCount));i++)a=a*10+o-L.CODES.get("0");if(a>this.patternGroupCount){t+=`$${a}`,n=i,i--;continue}const u=this.group(a);u!==null&&(t+=u),n=i,i--;continue}else if(o===L.CODES.get("<")){n<i&&(t+=e.substring(n,i)),i++;let a=i+1;for(;a<e.length&&e.codePointAt(a)!==L.CODES.get(">")&&e.codePointAt(a)!==L.CODES.get(" ");)a++;if(a===e.length||e.codePointAt(a)!==L.CODES.get(">")){t+=e.substring(i-1,a+1),n=a+1,i=a;continue}const u=e.substring(i+1,a);if(Object.prototype.hasOwnProperty.call(this.namedGroups,u)){const l=this.group(u);l!==null&&(t+=l)}else t+=`$<${u}>`;n=a+1,i=a;continue}}return n<s&&(t+=e.substring(n,s)),t}appendTail(){return this.substring(this.appendPos,this.matcherInputLength)}replaceAll(e,t=!1){return this.replace(e,!0,t)}replaceFirst(e,t=!1){return this.replace(e,!1,t)}replace(e,t=!0,n=!1){let s="";this.reset();const i=typeof e=="function",o=Object.keys(this.namedGroups).length>0;let a=null;if(i){if(this.groupCount()>=os.MAX_REPLACER_ARGS)throw new vt("Too many capture groups to safely invoke replacer function");a=this.matcherInput.isUTF8Encoding()?this.matcherInput.asBytes():this.matcherInput.asCharSequence()}for(;this.find()&&(s+=i?this.appendReplacementFunc(e,o,a):this.appendReplacement(e,n),!!t););return s+=this.appendTail(),s}appendReplacementFunc(e,t,n){let s="";const i=this.start(),o=this.end();this.appendPos<i&&(s+=this.substring(this.appendPos,i)),this.appendPos=o;const a=this.buildReplacerArgs(i,t,n);return s+=String(e(...a)),s}buildReplacerArgs(e,t,n){const s=[this.group(0)],i=this.groupCount();for(let o=1;o<=i;o++){const a=this.start(o);a<0?s.push(void 0):s.push(this.substring(a,this.end(o)))}if(s.push(e),s.push(n),t){const o=this.getNamedGroups();for(const a in o)o[a]===null&&(o[a]=void 0);s.push(o)}return s}},J(os,"MAX_REPLACER_ARGS",65535),os),pe,k=(pe=class{static isRuneOp(e){return pe.RUNE<=e&&e<=pe.RUNE_ANY_NOT_NL}static escapeRunes(e){let t='"';for(let n of e)t+=te.escapeRune(n);return t+='"',t}constructor(e){this.op=e,this.out=0,this.arg=0,this.runes=[],this.next=null}matchRune(e){if(this.runes.length===1){const o=this.runes[0];return(this.arg&G.FOLD_CASE)!==0?X.equalsIgnoreCase(o,e):e===o}const t=this.runes.length;if(t===0)return!1;if(t===2||t===4||t===6||t===8){for(let o=0;o<t;o+=2){if(e<this.runes[o])return!1;if(e<=this.runes[o+1])return!0}return!1}let n=0,s=t>>1;for(;s>1;){const o=s>>1;n+=this.runes[n+o<<1]<=e?o:0,s-=o}n+=this.runes[n<<1]<=e?1:0;const i=n-1;return i>=0&&e<=this.runes[i<<1|1]}matchRunePos(e){if(this.runes.length===1){const o=this.runes[0];return(this.arg&G.FOLD_CASE)!==0?X.equalsIgnoreCase(o,e)?0:-1:e===o?0:-1}const t=this.runes.length;if(t===0)return-1;if(t===2||t===4||t===6||t===8){for(let o=0;o<t;o+=2){if(e<this.runes[o])return-1;if(e<=this.runes[o+1])return Math.floor(o/2)}return-1}let n=0,s=t>>1;for(;s>1;){const o=s>>1;n+=this.runes[n+o<<1]<=e?o:0,s-=o}n+=this.runes[n<<1]<=e?1:0;const i=n-1;return i>=0&&e<=this.runes[i<<1|1]?i:-1}toString(){switch(this.op){case pe.ALT:return`alt -> ${this.out}, ${this.arg}`;case pe.ALT_MATCH:return`altmatch -> ${this.out}, ${this.arg}`;case pe.CAPTURE:return`cap ${this.arg} -> ${this.out}`;case pe.EMPTY_WIDTH:return`empty ${this.arg} -> ${this.out}`;case pe.MATCH:return`match${this.arg!==0?` ${this.arg}`:""}`;case pe.FAIL:return"fail";case pe.NOP:return`nop -> ${this.out}`;case pe.LB_WRITE:return`lbwrite ${this.arg} -> ${this.out}`;case pe.LB_CHECK:return`lbcheck ${this.arg} -> ${this.out}`;case pe.RUNE:return this.runes===null?"rune <null>":["rune ",pe.escapeRunes(this.runes),(this.arg&G.FOLD_CASE)!==0?"/i":""," -> ",this.out].join("");case pe.RUNE1:return`rune1 ${pe.escapeRunes(this.runes)} -> ${this.out}`;case pe.RUNE_ANY:return`any -> ${this.out}`;case pe.RUNE_ANY_NOT_NL:return`anynotnl -> ${this.out}`;default:throw new Error("unhandled case in Inst.toString")}}},J(pe,"ALT",1),J(pe,"ALT_MATCH",2),J(pe,"CAPTURE",3),J(pe,"EMPTY_WIDTH",4),J(pe,"FAIL",5),J(pe,"MATCH",6),J(pe,"NOP",7),J(pe,"RUNE",8),J(pe,"RUNE1",9),J(pe,"RUNE_ANY",10),J(pe,"RUNE_ANY_NOT_NL",11),J(pe,"LB_WRITE",12),J(pe,"LB_CHECK",13),pe),Hf=class{constructor(r){this.sparse=new Int32Array(r),this.densePcs=new Int32Array(r),this.denseCaps=null,this.size=0,this.ncap=0}init(r){this.ncap=r;const e=this.densePcs.length*r;(!this.denseCaps||this.denseCaps.length<e)&&(this.denseCaps=new Int32Array(e))}contains(r){const e=this.sparse[r];return e<this.size&&this.densePcs[e]===r}isEmpty(){return this.size===0}add(r){const e=this.size++;return this.sparse[r]=e,this.densePcs[e]=r,e}clear(){this.size=0}toString(){let r="{";for(let e=0;e<this.size;e++)e!==0&&(r+=", "),r+=this.densePcs[e];return r+="}",r}},pw=class Wl{static fromRE2(e){const t=new Wl;return t.prog=e.prog,t.re2=e,t.q0=new Hf(t.prog.numInst()),t.q1=new Hf(t.prog.numInst()),t.matched=!1,t.matchcap=new Int32Array(t.prog.numCap<2?2:t.prog.numCap),t.ncap=0,t}static fromMachine(e){return Wl.fromRE2(e.re2)}constructor(){this.prog=null,this.re2=null,this.q0=null,this.q1=null,this.matched=!1,this.matchcap=null,this.ncap=0,this.lbTable=null}init(e){this.ncap=e,e>this.matchcap.length?this.matchcap=new Int32Array(e).fill(-1):this.matchcap.fill(-1),this.q0.init(e),this.q1.init(e),this.prog.numLb>0&&((!this.lbTable||this.lbTable.length<this.prog.numLb+1)&&(this.lbTable=new Int32Array(this.prog.numLb+1)),this.lbTable.fill(-1))}submatches(){return this.ncap===0?te.emptyInts():te.toArray(this.matchcap.subarray(0,this.ncap))}match(e,t,n){const s=this.re2.cond;if(s===te.EMPTY_ALL||(n===G.ANCHOR_START||n===G.ANCHOR_BOTH)&&t!==0)return!1;this.matched=!1,this.matchcap.fill(-1);let i=this.prog.numLb>0?0:t,o=t,a=this.q0,u=this.q1,l=e.step(i),B=l>>3,d=l&7,C=-1,g=0;l!==yt.EOF()&&(l=e.step(i+d),C=l>>3,g=l&7);let D;for(i===0?D=te.emptyOpContext(-1,B):D=e.context(i);;){if(a.isEmpty()){if((s&te.EMPTY_BEGIN_TEXT)!==0&&i!==0||(n===G.ANCHOR_START||n===G.ANCHOR_BOTH)&&i!==0||this.matched)break;if(this.prog.numLb===0&&this.re2.prefix.length!==0&&C!==this.re2.prefixRune&&e.canCheckPrefix()){const H=e.index(this.re2,i);if(H<0)break;i+=H,l=e.step(i),B=l>>3,d=l&7,l=e.step(i+d),C=l>>3,g=l&7,D=e.context(i)}}if(i===0&&this.prog.numLb>0)for(let H=0;H<this.prog.lbStarts.length;H++)this.add(a,this.prog.lbStarts[H],i,this.matchcap,0,D);!this.matched&&(i===0||n===G.UNANCHORED)&&i>=o&&(this.ncap>0&&(this.matchcap[0]=i),this.add(a,this.prog.start,i,this.matchcap,0,D));const N=i+d;if(D=e.context(N),this.step(a,u,i,N,B,D,n,i===e.endPos()),d===0||this.ncap===0&&this.matched)break;i+=d,B=C,d=g,B!==-1&&(l=e.step(i+d),C=l>>3,g=l&7);const V=a;a=u,u=V}return u.clear(),this.matched}matchSet(e,t,n){const s=this.re2.cond;if(s===te.EMPTY_ALL)return[];if((n===G.ANCHOR_START||n===G.ANCHOR_BOTH)&&t!==0)return[];let i=this.prog.numLb>0?0:t,o=t,a=this.q0,u=this.q1,l=e.step(i),B=l>>3,d=l&7,C=-1,g=0;l!==yt.EOF()&&(l=e.step(i+d),C=l>>3,g=l&7);let D=i===0?te.emptyOpContext(-1,B):e.context(i);const N=new Set;for(;!(a.isEmpty()&&((s&te.EMPTY_BEGIN_TEXT)!==0&&i!==0||(n===G.ANCHOR_START||n===G.ANCHOR_BOTH)&&i!==0));){if(i===0&&this.prog.numLb>0)for(let Z=0;Z<this.prog.lbStarts.length;Z++)this.add(a,this.prog.lbStarts[Z],i,this.matchcap,0,D);(i===0||n===G.UNANCHORED)&&i>=o&&this.add(a,this.prog.start,i,this.matchcap,0,D);const V=i+d;D=e.context(V);for(let Z=0;Z<a.size;Z++){const re=a.densePcs[Z],de=this.prog.inst[re],Ce=Z*this.ncap;let le=!1;switch(de.op){case k.MATCH:if(n===G.ANCHOR_BOTH&&i!==e.endPos())break;N.add(de.arg);break;case k.RUNE:le=de.matchRune(B);break;case k.RUNE1:le=B===de.runes[0];break;case k.RUNE_ANY:le=!0;break;case k.RUNE_ANY_NOT_NL:le=B!==10;break;default:continue}le&&this.add(u,de.out,V,a.denseCaps,Ce,D)}if(a.clear(),d===0)break;i+=d,B=C,d=g,B!==-1&&(l=e.step(i+d),C=l>>3,g=l&7);const H=a;a=u,u=H}return u.clear(),Array.from(N).sort((V,H)=>V-H)}step(e,t,n,s,i,o,a,u){const l=this.re2.longest;for(let B=0;B<e.size;B++){const d=e.densePcs[B],C=B*this.ncap;if(l&&this.matched&&this.ncap>0&&this.matchcap[0]<e.denseCaps[C])continue;const g=this.prog.inst[d];let D=!1;switch(g.op){case k.MATCH:if(a===G.ANCHOR_BOTH&&!u)break;if(this.ncap>0&&(!l||!this.matched||this.matchcap[1]<n)){e.denseCaps[C+1]=n;for(let N=0;N<this.ncap;N++)this.matchcap[N]=e.denseCaps[C+N]}l||(e.size=0),this.matched=!0;break;case k.RUNE:D=g.matchRune(i);break;case k.RUNE1:D=i===g.runes[0];break;case k.RUNE_ANY:D=!0;break;case k.RUNE_ANY_NOT_NL:D=i!==10;break;default:continue}D&&this.add(t,g.out,s,e.denseCaps,C,o)}e.clear()}add(e,t,n,s,i,o){for(;;){if(t===0||e.contains(t))return;const a=e.add(t),u=this.prog.inst[t];switch(u.op){case k.FAIL:return;case k.ALT:case k.ALT_MATCH:this.add(e,u.out,n,s,i,o),t=u.arg;continue;case k.EMPTY_WIDTH:if((u.arg&~o)===0){t=u.out;continue}return;case k.NOP:t=u.out;continue;case k.CAPTURE:if(u.arg<this.ncap){const l=s[i+u.arg];s[i+u.arg]=n,this.add(e,u.out,n,s,i,o),s[i+u.arg]=l;return}else{t=u.out;continue}case k.LB_WRITE:this.lbTable[Math.abs(u.arg)]=n,t=u.out;continue;case k.LB_CHECK:if(u.arg>0){if(this.lbTable[u.arg]===n){t=u.out;continue}}else if(this.lbTable[-u.arg]!==n){t=u.out;continue}return;case k.MATCH:case k.RUNE:case k.RUNE1:case k.RUNE_ANY:case k.RUNE_ANY_NOT_NL:if(this.ncap>0){const l=a*this.ncap;for(let B=0;B<this.ncap;B++)e.denseCaps[l+B]=s[i+B]}return;default:throw new bo("unhandled")}}}};const qf=r=>{let e=-2128831035;for(let t=0;t<r.length;t++)e^=r[t],e=Math.imul(e,16777619);return e},gw=(r,e)=>{if(r.length!==e.length)return!1;for(let t=0;t<r.length;t++)if(r[t]!==e[t])return!1;return!0};var mw=class{constructor(r,e,t=[]){this.nfaStates=r,this.isMatch=e,this.matchIDs=t,this.nextLatin1=new Array(X.MAX_LATIN1+1).fill(null),this.nextLatin1Anchored=new Array(X.MAX_LATIN1+1).fill(null),this.transKeys=[],this.transVals=[],this.lastSeen=0}},bn,_w=(bn=class{constructor(e,t=8388608){this.prog=e,this.stateCache=new Map,this.stateCount=0,this.startState=null,this.stateLimit=Math.max(1,Math.floor(t/bn.STATE_MEMORY_ESTIMATE)),this.cacheClears=0,this.failed=!1,this.clock=0}computeClosure(e){const t=new Set,n=[...e];let s=!1;const i=[];for(;n.length>0;){const a=n.pop();if(t.has(a))continue;t.add(a);const u=this.prog.getInst(a);switch(u.op){case k.MATCH:s=!0,i.includes(u.arg)||i.push(u.arg);break;case k.ALT:case k.ALT_MATCH:n.push(u.out),n.push(u.arg);break;case k.NOP:case k.CAPTURE:n.push(u.out);break;case k.EMPTY_WIDTH:case k.LB_WRITE:case k.LB_CHECK:return null}}const o=Int32Array.from(t).sort();return i.sort((a,u)=>a-u),{pcs:o,isMatch:s,matchIDs:i}}getState(e){const t=this.computeClosure(e);if(!t)return null;const n=t.pcs,s=qf(n);let i=this.stateCache.get(s);if(i)for(let a=0;a<i.length;a++){const u=i[a];if(gw(u.nfaStates,n))return u.lastSeen=++this.clock,u}else i=[],this.stateCache.set(s,i);if(this.failed)return null;if(this.stateCount>=this.stateLimit){if(this.cacheClears++,this.cacheClears>=bn.MAX_CACHE_CLEARS)return this.failed=!0,this.stateCache.clear(),this.stateCount=0,this.startState=null,null;this.evictCache(),i=this.stateCache.get(s),i||(i=[],this.stateCache.set(s,i))}const o=new mw(n,t.isMatch,t.matchIDs);return o.lastSeen=++this.clock,i.push(o),this.stateCount++,o}evictCache(){const e=[];for(const o of this.stateCache.values())for(let a=0;a<o.length;a++)e.push(o[a]);e.sort((o,a)=>o.lastSeen-a.lastSeen);const t=Math.max(1,Math.floor(this.stateLimit/2)),n=e.length-t,s=e.slice(n),i=new Set(s);this.stateCache.clear(),this.stateCount=0;for(let o=0;o<s.length;o++){const a=s[o];a.nextLatin1.fill(null),a.nextLatin1Anchored.fill(null),a.transKeys.length=0,a.transVals.length=0;const u=qf(a.nfaStates);let l=this.stateCache.get(u);l||(l=[],this.stateCache.set(u,l)),l.push(a),this.stateCount++}this.startState&&!i.has(this.startState)&&(this.startState=null)}step(e,t,n){if(t<=X.MAX_LATIN1)if(n===G.UNANCHORED){const o=e.nextLatin1[t];if(o!==null)return o}else{const o=e.nextLatin1Anchored[t];if(o!==null)return o}else{const o=t+(n===G.UNANCHORED?0:X.MAX_RUNE+1),a=e.transKeys,u=a.length;for(let l=0;l<u;l++)if(a[l]===o)return e.transVals[l]}const s=[];for(let o=0;o<e.nfaStates.length;o++){const a=e.nfaStates[o],u=this.prog.getInst(a);k.isRuneOp(u.op)&&u.matchRune(t)&&s.push(u.out)}n===G.UNANCHORED&&s.push(this.prog.start);const i=this.getState(s);if(t<=X.MAX_LATIN1)n===G.UNANCHORED?e.nextLatin1[t]=i:e.nextLatin1Anchored[t]=i;else{const o=t+(n===G.UNANCHORED?0:X.MAX_RUNE+1);e.transKeys.push(o),e.transVals.push(i)}return i}match(e,t,n){if((n===G.ANCHOR_START||n===G.ANCHOR_BOTH)&&t!==0)return!1;if(!this.startState&&(this.startState=this.getState([this.prog.start]),!this.startState))return null;let s=e.endPos(),i=this.startState;if(i.isMatch)if(n===G.ANCHOR_BOTH){if(t===s)return!0}else return!0;let o=t;for(;o<s;){const a=e.step(o),u=a>>3,l=a&7;if(l===0)break;if(i=n===G.UNANCHORED&&u<=X.MAX_LATIN1&&i.nextLatin1[u]||this.step(i,u,n),i===null)return null;if(i.lastSeen=++this.clock,i.isMatch)if(n===G.ANCHOR_BOTH){if(o+l===s)return!0}else return!0;if(i.nfaStates.length===0&&n!==G.UNANCHORED)return!1;o+=l}return!1}matchSet(e,t,n){if((n===G.ANCHOR_START||n===G.ANCHOR_BOTH)&&t!==0)return[];if(!this.startState&&(this.startState=this.getState([this.prog.start]),!this.startState))return null;let s=e.endPos(),i=this.startState;const o=new Set,a=(l,B)=>{l.isMatch&&(n===G.ANCHOR_BOTH?B===s&&l.matchIDs.forEach(d=>o.add(d)):l.matchIDs.forEach(d=>o.add(d)))};a(i,t);let u=t;for(;u<s;){const l=e.step(u),B=l>>3,d=l&7;if(d===0)break;if(i=n===G.UNANCHORED&&B<=X.MAX_LATIN1&&i.nextLatin1[B]||this.step(i,B,n),i===null)return null;if(i.lastSeen=++this.clock,u+=d,a(i,u),i.nfaStates.length===0&&n!==G.UNANCHORED)break}return Array.from(o).sort((l,B)=>l-B)}},J(bn,"MAX_CACHE_CLEARS",5),J(bn,"STATE_MEMORY_ESTIMATE",838),bn);const Ew=32,Iw=500,yl=256,Dw=256*1024;var yw=class{constructor(){this.end=0,this.cap=new Int32Array(0),this.matchcap=new Int32Array(0),this.ncap=0,this.jobPc=new Int32Array(yl),this.jobArg=new Uint8Array(yl),this.jobPos=new Int32Array(yl),this.jobLen=0,this.visited=new Uint32Array(0)}reset(r,e,t){this.end=e,this.jobLen=0,this.ncap=t;const n=r.numInst()*(e+1)+Ew-1>>>5;this.visited.length<n?this.visited=new Uint32Array(n):this.visited.fill(0,0,n),this.cap.length<t?this.cap=new Int32Array(t).fill(-1):this.cap.fill(-1,0,t),this.matchcap.length<t?this.matchcap=new Int32Array(t).fill(-1):this.matchcap.fill(-1,0,t)}shouldVisit(r,e){const t=r*(this.end+1)+e,n=t>>>5,s=1<<(t&31);return(this.visited[n]&s)!==0?!1:(this.visited[n]|=s,!0)}push(r,e,t,n){if(r.prog.getInst(e).op!==k.FAIL&&(n||this.shouldVisit(e,t))){if(this.jobLen>=this.jobPc.length){const s=this.jobPc.length*2,i=new Int32Array(s);i.set(this.jobPc),this.jobPc=i;const o=new Uint8Array(s);o.set(this.jobArg),this.jobArg=o;const a=new Int32Array(s);a.set(this.jobPos),this.jobPos=a}this.jobPc[this.jobLen]=e,this.jobArg[this.jobLen]=n?1:0,this.jobPos[this.jobLen]=t,this.jobLen++}}tryBacktrack(r,e,t,n,s){const i=r.longest;for(this.push(r,t,n,!1);this.jobLen>0;){this.jobLen--;let o=this.jobPc[this.jobLen],a=this.jobArg[this.jobLen]===1,u=this.jobPos[this.jobLen],l=!0;for(;!(!l&&!this.shouldVisit(o,u));){l=!1;const B=r.prog.getInst(o);switch(B.op){case k.FAIL:throw new bo("unexpected InstFail");case k.ALT:if(a){a=!1,o=B.arg;continue}else{this.push(r,o,u,!0),o=B.out;continue}case k.ALT_MATCH:{const d=r.prog.getInst(B.out);if(k.isRuneOp(d.op)){this.push(r,B.arg,u,!1),o=B.arg,u=this.end;continue}this.push(r,B.out,this.end,!1),o=B.out;continue}case k.RUNE:{const d=e.step(u);if(d===yt.EOF()||!B.matchRune(d>>3))break;u+=d&7,o=B.out;continue}case k.RUNE1:{const d=e.step(u);if(d===yt.EOF()||d>>3!==B.runes[0])break;u+=d&7,o=B.out;continue}case k.RUNE_ANY_NOT_NL:{const d=e.step(u);if(d===yt.EOF()||d>>3===10)break;u+=d&7,o=B.out;continue}case k.RUNE_ANY:{const d=e.step(u);if(d===yt.EOF())break;u+=d&7,o=B.out;continue}case k.CAPTURE:if(a){this.cap[B.arg]=u;break}else{B.arg<this.ncap&&(this.push(r,o,this.cap[B.arg],!0),this.cap[B.arg]=u),o=B.out;continue}case k.EMPTY_WIDTH:{const d=e.context(u);if((B.arg&~d)!==0)break;o=B.out;continue}case k.NOP:o=B.out;continue;case k.MATCH:{if(s===G.ANCHOR_BOTH&&u!==this.end)break;if(this.ncap===0)return!0;this.ncap>1&&(this.cap[1]=u);const d=this.matchcap[1];if((d===-1||i&&u>0&&u>d)&&this.matchcap.set(this.cap),!i||u===this.end)return!0;break}case k.LB_WRITE:case k.LB_CHECK:throw new bo("Backtracker cannot evaluate Lookbehind instructions");default:throw new bo("bad inst")}break}}return i&&this.matchcap.length>1&&this.matchcap[1]>=0}};const nu=[];var ru=class Og{static shouldBacktrack(e){return e.numInst()<=Iw}static maxBitStateLen(e){return Og.shouldBacktrack(e)?Math.floor(Dw/e.numInst()):0}static execute(e,t,n,s,i){const o=e.cond;if(o===te.EMPTY_ALL||(s===G.ANCHOR_START||s===G.ANCHOR_BOTH)&&n!==0||(o&te.EMPTY_BEGIN_TEXT)!==0&&n!==0)return null;const a=nu.length>0?nu.pop():new yw,u=t.endPos();a.reset(e.prog,u,i);let l=!1;if((o&te.EMPTY_BEGIN_TEXT)!==0||s===G.ANCHOR_START||s===G.ANCHOR_BOTH)a.ncap>0&&(a.cap[0]=n),a.tryBacktrack(e,t,e.prog.start,n,s)&&(l=!0);else{let d=-1;for(;n<=u&&d!==0;n+=d){if(e.prefix.length>0){const g=t.index(e,n);if(g<0)break;n+=g}if(a.ncap>0&&(a.cap[0]=n),a.tryBacktrack(e,t,e.prog.start,n,s)){l=!0;break}const C=t.step(n);d=C===yt.EOF()?0:C&7}}if(!l)return nu.push(a),null;const B=i===0?[]:te.toArray(a.matchcap.subarray(0,i));return nu.push(a),B}},jf=class{constructor(r){this.sparse=new Uint32Array(r),this.dense=new Uint32Array(r),this.size=0,this.nextIndex=0}empty(){return this.nextIndex>=this.size}next(){return this.dense[this.nextIndex++]}clear(){this.size=0,this.nextIndex=0}contains(r){return r<this.sparse.length&&this.sparse[r]<this.size&&this.dense[this.sparse[r]]===r}insert(r){this.contains(r)||this.insertNew(r)}insertNew(r){r>=this.sparse.length||(this.sparse[r]=this.size,this.dense[this.size]=r,this.size++)}};const ww=(r,e,t,n)=>{const s=r.length,i=e.length;let o=0,a=0;const u=[],l=[];let B=!0,d=-1;const C=g=>{const D=g?r:e,N=g?o:a,V=g?t:n;return d>0&&D[N]<=u[d]?!1:(u.push(D[N],D[N+1]),g?o+=2:a+=2,d+=2,l.push(V),!0)};for(;o<s||a<i;)if(a>=i?B=C(!0):o>=s||e[a]<r[o]?B=C(!1):B=C(!0),!B)return null;return{merged:u,next:l}};var Tw=class{constructor(r){this.start=r.start,this.numCap=r.numCap,this.inst=new Array(r.inst.length);for(let e=0;e<r.inst.length;e++){const t=r.inst[e],n=new k(t.op);n.out=t.out,n.arg=t.arg,n.runes=t.runes?t.runes.slice():[],n.next=null,this.inst[e]=n}}};const Aw=r=>{const e=new Tw(r);for(let t=0;t<e.inst.length;t++){const n=e.inst[t];if(n.op!==k.ALT&&n.op!==k.ALT_MATCH)continue;let s="out",i="arg",o=e.inst[n[i]];if(o.op!==k.ALT&&o.op!==k.ALT_MATCH&&(s="arg",i="out",o=e.inst[n[i]],o.op!==k.ALT&&o.op!==k.ALT_MATCH))continue;const a=e.inst[n[s]];if(a.op===k.ALT||a.op===k.ALT_MATCH)continue;let u="out",l="arg",B=!1;o.out===t?B=!0:o.arg===t&&(B=!0,u="arg",l="out"),B&&(o[u]=n[s]),n[s]===o[u]&&(n[i]=o[l])}return e},vw=r=>{if(r.inst.length>=1e3)return null;const e=new jf(r.inst.length),t=new jf(r.inst.length),n=new Array(r.inst.length),s=new Array(r.inst.length).fill(!1),i=o=>{let a=!0;const u=r.inst[o];if(t.contains(o))return!0;switch(t.insert(o),u.op){case k.ALT:case k.ALT_MATCH:{a=i(u.out)&&i(u.arg);let l=s[u.out],B=s[u.arg];if(l&&B)return!1;if(B){const D=u.out;u.out=u.arg,u.arg=D;const N=l;l=B,B=N}l&&(s[o]=!0,u.op=k.ALT_MATCH);const d=n[u.out]||[],C=n[u.arg]||[],g=ww(d,C,u.out,u.arg);if(!g)return!1;n[o]=g.merged,u.next=new Uint32Array(g.next);break}case k.CAPTURE:case k.EMPTY_WIDTH:case k.NOP:a=i(u.out),s[o]=s[u.out],n[o]=n[u.out]?n[u.out].slice():[],u.next=new Uint32Array(Math.floor(n[o].length/2)+1).fill(u.out);break;case k.MATCH:case k.FAIL:s[o]=u.op===k.MATCH;break;case k.RUNE:{if(s[o]=!1,u.next&&u.next.length>0)break;if(e.insert(u.out),!u.runes||u.runes.length===0){n[o]=[],u.next=new Uint32Array([u.out]);break}let l=[];if(u.runes.length===1&&(u.arg&G.FOLD_CASE)!==0){const B=u.runes[0];l.push(B,B);for(let d=X.simpleFold(B);d!==B;d=X.simpleFold(d))l.push(d,d);l.sort((d,C)=>d-C)}else for(let B=0;B<u.runes.length;B++)l.push(u.runes[B]);n[o]=l,u.next=new Uint32Array(Math.floor(l.length/2)+1).fill(u.out),u.op=k.RUNE;break}case k.RUNE1:{if(s[o]=!1,u.next&&u.next.length>0)break;e.insert(u.out);let l=[];if((u.arg&G.FOLD_CASE)!==0){const B=u.runes[0];l.push(B,B);for(let d=X.simpleFold(B);d!==B;d=X.simpleFold(d))l.push(d,d);l.sort((d,C)=>d-C)}else l.push(u.runes[0],u.runes[0]);n[o]=l,u.next=new Uint32Array(Math.floor(l.length/2)+1).fill(u.out),u.op=k.RUNE;break}case k.RUNE_ANY:if(s[o]=!1,u.next&&u.next.length>0)break;e.insert(u.out),n[o]=[0,X.MAX_RUNE],u.next=new Uint32Array([u.out]);break;case k.RUNE_ANY_NOT_NL:if(s[o]=!1,u.next&&u.next.length>0)break;e.insert(u.out),n[o]=[0,9,11,X.MAX_RUNE],u.next=new Uint32Array(Math.floor(n[o].length/2)+1).fill(u.out);break}return a};for(e.clear(),e.insert(r.start);!e.empty();)if(t.clear(),!i(e.next()))return null;for(let o=0;o<r.inst.length;o++)n[o]&&(r.inst[o].runes=n[o]);return r},Rw=(r,e)=>{for(let t=0;t<e.inst.length;t++){const n=e.inst[t];switch(n.op){case k.ALT:case k.ALT_MATCH:case k.RUNE:break;case k.CAPTURE:case k.EMPTY_WIDTH:case k.NOP:case k.MATCH:case k.FAIL:r.inst[t].next=null;break;case k.RUNE1:case k.RUNE_ANY:case k.RUNE_ANY_NOT_NL:r.inst[t].next=null,r.inst[t].op=n.op,r.inst[t].runes=n.runes?n.runes.slice():[];break}}};var Jf=class Fg{static compile(e){if(e.start===0||e.numLb>0)return null;const t=e.inst[e.start];if(t.op!==k.EMPTY_WIDTH||(t.arg&te.EMPTY_BEGIN_TEXT)===0)return null;let n=!1;for(let i=0;i<e.inst.length;i++)if(e.inst[i].op===k.ALT||e.inst[i].op===k.ALT_MATCH){n=!0;break}for(let i=0;i<e.inst.length;i++){const o=e.inst[i],a=e.inst[o.out].op;switch(o.op){case k.ALT:case k.ALT_MATCH:if(a===k.MATCH||e.inst[o.arg].op===k.MATCH)return null;break;case k.EMPTY_WIDTH:if(a===k.MATCH){if((o.arg&te.EMPTY_END_TEXT)===te.EMPTY_END_TEXT)continue;return null}break;default:if(a===k.MATCH&&n)return null;break}}let s=Aw(e);return s=vw(s),s!==null&&Rw(s,e),s}static next(e,t){const n=e.matchRunePos(t);return n>=0?e.next[n]:e.op===k.ALT_MATCH?e.out:0}static execute(e,t,n,s,i){const o=e.onepass;if(!o)return null;const a=new Int32Array(i).fill(-1);let u=!1,l=t.step(n),B=l>>3,d=l&7,C=yt.EOF(),g=-1,D=0;l!==yt.EOF()&&(C=t.step(n+d),C!==yt.EOF()&&(g=C>>3,D=C&7));let N=n===0?te.emptyOpContext(-1,B):t.context(n),V=o.start,H;for(;;){switch(H=o.inst[V],V=H.out,H.op){case k.MATCH:return s===G.ANCHOR_BOTH&&n!==t.endPos()?null:(u=!0,a.length>0&&(a[0]=0,a[1]=n),i===0?[]:te.toArray(a));case k.RUNE:if(!H.matchRune(B))return null;break;case k.RUNE1:if(B!==H.runes[0])return null;break;case k.RUNE_ANY:break;case k.RUNE_ANY_NOT_NL:if(B===10)return null;break;case k.ALT:case k.ALT_MATCH:V=Fg.next(H,B);continue;case k.FAIL:return null;case k.NOP:continue;case k.EMPTY_WIDTH:if((H.arg&~N)!==0)return null;continue;case k.CAPTURE:H.arg<a.length&&(a[H.arg]=n);continue;default:throw new bo("bad inst")}if(d===0)break;N=te.emptyOpContext(B,g),n+=d,B=g,d=D,B!==-1&&(C=t.step(n+d),C!==yt.EOF()?(g=C>>3,D=C&7):(g=-1,D=0))}return u?i===0?[]:te.toArray(a):null}},se,A=(se=class{static isPseudoOp(e){return e>=se.Op.LEFT_PAREN}static emptySubs(){return[]}static quoteIfHyphen(e){return e===L.CODES.get("-")?"\\":""}static fromRegexp(e){const t=new se(e.op);return t.flags=e.flags,t.subs=e.subs,t.runes=e.runes,t.cap=e.cap,t.min=e.min,t.max=e.max,t.name=e.name,t.namedGroups=e.namedGroups,t.lb=e.lb,t}constructor(e){this.op=e,this.flags=0,this.subs=se.emptySubs(),this.runes=[],this.min=0,this.max=0,this.cap=0,this.name=null,this.namedGroups=Object.create(null),this.lb=0}reinit(){this.flags=0,this.subs=se.emptySubs(),this.runes=[],this.cap=0,this.min=0,this.max=0,this.name=null,this.namedGroups=Object.create(null),this.lb=0}toString(){return this.appendTo()}appendTo(){let e="";switch(this.op){case se.Op.NO_MATCH:e+="[^\\x00-\\x{10FFFF}]";break;case se.Op.EMPTY_MATCH:e+="(?:)";break;case se.Op.STAR:case se.Op.PLUS:case se.Op.QUEST:case se.Op.REPEAT:{const t=this.subs[0];switch(t.op>se.Op.CAPTURE||t.op===se.Op.LITERAL&&t.runes.length>1?e+=`(?:${t.appendTo()})`:e+=t.appendTo(),this.op){case se.Op.STAR:e+="*";break;case se.Op.PLUS:e+="+";break;case se.Op.QUEST:e+="?";break;case se.Op.REPEAT:e+=`{${this.min}`,this.min!==this.max&&(e+=",",this.max>=0&&(e+=this.max)),e+="}";break}(this.flags&G.NON_GREEDY)!==0&&(e+="?");break}case se.Op.CONCAT:for(let t of this.subs)t.op===se.Op.ALTERNATE?e+=`(?:${t.appendTo()})`:e+=t.appendTo();break;case se.Op.ALTERNATE:{let t="";for(let n of this.subs)e+=t,t="|",e+=n.appendTo();break}case se.Op.LITERAL:(this.flags&G.FOLD_CASE)!==0&&(e+="(?i:");for(let t of this.runes)e+=te.escapeRune(t);(this.flags&G.FOLD_CASE)!==0&&(e+=")");break;case se.Op.ANY_CHAR_NOT_NL:e+="(?-s:.)";break;case se.Op.ANY_CHAR:e+="(?s:.)";break;case se.Op.PLB:e+=`(?<=${this.subs[0].appendTo()})`;break;case se.Op.NLB:e+=`(?<!${this.subs[0].appendTo()})`;break;case se.Op.CAPTURE:this.name===null||this.name.length===0?e+="(":e+=`(?P<${this.name}>`,this.subs[0].op!==se.Op.EMPTY_MATCH&&(e+=this.subs[0].appendTo()),e+=")";break;case se.Op.BEGIN_TEXT:e+="\\A";break;case se.Op.END_TEXT:(this.flags&G.WAS_DOLLAR)!==0?e+="(?-m:$)":e+="\\z";break;case se.Op.BEGIN_LINE:e+="^";break;case se.Op.END_LINE:e+="$";break;case se.Op.WORD_BOUNDARY:e+="\\b";break;case se.Op.NO_WORD_BOUNDARY:e+="\\B";break;case se.Op.CHAR_CLASS:if(this.runes.length%2!==0){e+="[invalid char class]";break}if(e+="[",this.runes.length===0)e+="^\\x00-\\x{10FFFF}";else if(this.runes[0]===0&&this.runes[this.runes.length-1]===X.MAX_RUNE){e+="^";for(let t=1;t<this.runes.length-1;t+=2){const n=this.runes[t]+1,s=this.runes[t+1]-1;e+=se.quoteIfHyphen(n),e+=te.escapeRune(n),n!==s&&(e+="-",e+=se.quoteIfHyphen(s),e+=te.escapeRune(s))}}else for(let t=0;t<this.runes.length;t+=2){const n=this.runes[t],s=this.runes[t+1];e+=se.quoteIfHyphen(n),e+=te.escapeRune(n),n!==s&&(e+="-",e+=se.quoteIfHyphen(s),e+=te.escapeRune(s))}e+="]";break;default:e+=this.op;break}return e}maxCap(){let e=0;if(this.op===se.Op.CAPTURE&&(e=this.cap),this.subs!==null)for(let t of this.subs){const n=t.maxCap();e<n&&(e=n)}return e}equals(e){if(!(e!==null&&e instanceof se)||this.op!==e.op)return!1;switch(this.op){case se.Op.END_TEXT:if((this.flags&G.WAS_DOLLAR)!==(e.flags&G.WAS_DOLLAR))return!1;break;case se.Op.LITERAL:case se.Op.CHAR_CLASS:if(this.runes===null&&e.runes===null)break;if(this.runes===null||e.runes===null||this.runes.length!==e.runes.length)return!1;for(let t=0;t<this.runes.length;t++)if(this.runes[t]!==e.runes[t])return!1;break;case se.Op.ALTERNATE:case se.Op.CONCAT:if(this.subs.length!==e.subs.length)return!1;for(let t=0;t<this.subs.length;++t)if(!this.subs[t].equals(e.subs[t]))return!1;break;case se.Op.STAR:case se.Op.PLUS:case se.Op.QUEST:if((this.flags&G.NON_GREEDY)!==(e.flags&G.NON_GREEDY)||!this.subs[0].equals(e.subs[0]))return!1;break;case se.Op.REPEAT:if((this.flags&G.NON_GREEDY)!==(e.flags&G.NON_GREEDY)||this.min!==e.min||this.max!==e.max||!this.subs[0].equals(e.subs[0]))return!1;break;case se.Op.CAPTURE:if(this.cap!==e.cap||(this.name===null?e.name!==null:this.name!==e.name)||!this.subs[0].equals(e.subs[0]))return!1;break;case se.Op.PLB:case se.Op.NLB:if(this.lb!==e.lb||!this.subs[0].equals(e.subs[0]))return!1;break}return!0}},J(se,"Op",Ng(["NO_MATCH","EMPTY_MATCH","LITERAL","CHAR_CLASS","ANY_CHAR_NOT_NL","ANY_CHAR","BEGIN_LINE","END_LINE","BEGIN_TEXT","END_TEXT","WORD_BOUNDARY","NO_WORD_BOUNDARY","CAPTURE","STAR","PLUS","QUEST","REPEAT","CONCAT","ALTERNATE","PLB","NLB","LEFT_PAREN","VERTICAL_BAR"])),se),Kf=class{constructor(r){this.next=[Object.create(null)],this.fail=[0],this.match=[!1];for(const t of r){let n=0;for(let s=0;s<t.length;s++){const i=t[s];i in this.next[n]||(this.next.push(Object.create(null)),this.fail.push(0),this.match.push(!1),this.next[n][i]=this.next.length-1),n=this.next[n][i]}this.match[n]=!0}const e=[];for(const t in this.next[0])if(Object.prototype.hasOwnProperty.call(this.next[0],t)){const n=this.next[0][t];this.fail[n]=0,e.push(n)}for(;e.length>0;){const t=e.shift();for(const n in this.next[t])if(Object.prototype.hasOwnProperty.call(this.next[t],n)){const s=this.next[t][n];let i=this.fail[t];for(;i!==0&&!(n in this.next[i]);)i=this.fail[i];n in this.next[i]?this.fail[s]=this.next[i][n]:this.fail[s]=0,this.match[s]=this.match[s]||this.match[this.fail[s]],e.push(s)}}}searchUTF16(r,e,t){let n=0;for(let s=e;s<t;s++){const i=r.charCodeAt(s);for(;n!==0&&!(i in this.next[n]);)n=this.fail[n];if(i in this.next[n]&&(n=this.next[n][i]),this.match[n])return!0}return!1}searchUTF8(r,e,t){let n=0;for(let s=e;s<t;s++){const i=r[s];for(;n!==0&&!(i in this.next[n]);)n=this.fail[n];if(i in this.next[n]&&(n=this.next[n][i]),this.match[n])return!0}return!1}},hn,_e=(hn=class{constructor(e){this.type=e,this.subs=[],this.str="",this.bytes=null,this.ac16=null,this.ac8=null}eval(e,t){switch(this.type){case hn.Type.NONE:return!0;case hn.Type.EXACT:return e.hasString(this,t);case hn.Type.AND:for(let n=0;n<this.subs.length;n++)if(!this.subs[n].eval(e,t))return!1;return!0;case hn.Type.OR:if(this.ac16&&this.ac8)return e.hasAnyString(this,t);for(let n=0;n<this.subs.length;n++)if(this.subs[n].eval(e,t))return!0;return!1;default:return!0}}},J(hn,"Type",{NONE:0,EXACT:1,AND:2,OR:3}),hn),Pw=class yn{static build(e){const t=yn.fromRegexp(e);return yn.simplify(t)}static fromRegexp(e){if(!e)return new _e(_e.Type.NONE);switch(e.op){case A.Op.PLB:case A.Op.NLB:case A.Op.NO_MATCH:case A.Op.EMPTY_MATCH:case A.Op.BEGIN_LINE:case A.Op.END_LINE:case A.Op.BEGIN_TEXT:case A.Op.END_TEXT:case A.Op.WORD_BOUNDARY:case A.Op.NO_WORD_BOUNDARY:case A.Op.CHAR_CLASS:case A.Op.ANY_CHAR_NOT_NL:case A.Op.ANY_CHAR:return new _e(_e.Type.NONE);case A.Op.LITERAL:{if(e.runes.length===0||(e.flags&G.FOLD_CASE)!==0)return new _e(_e.Type.NONE);const t=new _e(_e.Type.EXACT);let n="";for(let s=0;s<e.runes.length;s++)n+=String.fromCodePoint(e.runes[s]);return t.str=n,t.bytes=te.stringToUtf8ByteArray(t.str),t}case A.Op.CAPTURE:case A.Op.PLUS:return yn.fromRegexp(e.subs[0]);case A.Op.REPEAT:return e.min>=1?yn.fromRegexp(e.subs[0]):new _e(_e.Type.NONE);case A.Op.CONCAT:{const t=new _e(_e.Type.AND);for(const n of e.subs)t.subs.push(yn.fromRegexp(n));return t}case A.Op.ALTERNATE:{const t=new _e(_e.Type.OR);for(const n of e.subs)t.subs.push(yn.fromRegexp(n));return t}default:return new _e(_e.Type.NONE)}}static simplify(e){if(e.type===_e.Type.EXACT||e.type===_e.Type.NONE)return e;if(e.type===_e.Type.AND){const t=[];for(const n of e.subs){const s=yn.simplify(n);if(s.type!==_e.Type.NONE)if(s.type===_e.Type.AND)for(let i=0;i<s.subs.length;i++)t.push(s.subs[i]);else t.push(s)}return t.length===0?new _e(_e.Type.NONE):t.length===1?t[0]:(e.subs=t,e)}if(e.type===_e.Type.OR){const t=[];for(const o of e.subs){const a=yn.simplify(o);if(a.type===_e.Type.NONE)return new _e(_e.Type.NONE);if(a.type===_e.Type.OR)for(let u=0;u<a.subs.length;u++)t.push(a.subs[u]);else t.push(a)}if(t.length===0)return new _e(_e.Type.NONE);if(t.length===1)return t[0];const n=new Set,s=[];for(const o of t)o.type===_e.Type.EXACT?n.has(o.str)||(n.add(o.str),s.push(o)):s.push(o);e.subs=s;let i=!0;for(const o of s)if(o.type!==_e.Type.EXACT){i=!1;break}return i&&s.length>1&&(e.ac16=new Kf(s.map(o=>{const a=[];for(let u=0;u<o.str.length;u++)a.push(o.str.charCodeAt(u));return a})),e.ac8=new Kf(s.map(o=>o.bytes))),e}return e}},Jt=class{constructor(r=0,e=0){this.head=r,this.tail=e}},bw=class{constructor(){this.inst=[],this.start=0,this.numCap=2,this.lbStarts=[],this.numLb=0}getInst(r){return this.inst[r]}numInst(){return this.inst.length}addInst(r){this.inst.push(new k(r))}skipNop(r){let e=this.inst[r];for(;e.op===k.NOP||e.op===k.CAPTURE;)e=this.inst[r],r=e.out;return e}prefix(){let r="",e=this.skipNop(this.start);if(!k.isRuneOp(e.op)||e.runes.length!==1)return[e.op===k.MATCH,r];for(;k.isRuneOp(e.op)&&e.runes.length===1&&(e.arg&G.FOLD_CASE)===0;)r+=String.fromCodePoint(e.runes[0]),e=this.skipNop(e.out);return[e.op===k.MATCH,r]}startCond(){let r=0,e=this.start;e:for(;;){const t=this.inst[e];switch(t.op){case k.EMPTY_WIDTH:r|=t.arg;break;case k.FAIL:return-1;case k.CAPTURE:case k.NOP:break;default:break e}e=t.out}return r}patch(r,e){let t=r.head;for(;t!==0;){const n=this.inst[t>>1];(t&1)===0?(t=n.out,n.out=e):(t=n.arg,n.arg=e)}}append(r,e){if(r.head===0)return e;if(e.head===0)return r;const t=this.inst[r.tail>>1];return(r.tail&1)===0?t.out=e.head:t.arg=e.head,new Jt(r.head,e.tail)}toString(){let r="";for(let e=0;e<this.inst.length;e++){const t=r.length;r+=e,e===this.start&&(r+="*"),r+="        ".substring(r.length-t),r+=this.inst[e],r+=`
`}return r}},su=class{constructor(r=0,e=new Jt,t=!1){this.i=r,this.out=e,this.nullable=t}},Sw=class Js{static ANY_RUNE_NOT_NL(){return[0,L.CODES.get(`
`)-1,L.CODES.get(`
`)+1,X.MAX_RUNE]}static ANY_RUNE(){return[0,X.MAX_RUNE]}static compileRegexp(e){const t=new Js,n=t.compile(e);return t.prog.patch(n.out,t.newInst(k.MATCH).i),t.prog.start=n.i,t.prog}static compileSet(e){const t=new Js;if(e.length===0)return t.prog.start=t.newInst(k.FAIL).i,t.prog;let n=[];for(let i=0;i<e.length;i++){const o=t.compile(e[i]),a=t.newInst(k.MATCH);t.prog.getInst(a.i).arg=i,t.prog.patch(o.out,a.i),n.push(o.i)}let s=n[0];for(let i=1;i<n.length;i++){const o=t.newInst(k.ALT),a=t.prog.getInst(o.i);a.out=s,a.arg=n[i],s=o.i}return t.prog.start=s,t.prog}constructor(){this.prog=new bw,this.newInst(k.FAIL)}newInst(e){return this.prog.addInst(e),new su(this.prog.numInst()-1,new Jt,!0)}nop(){const e=this.newInst(k.NOP);return e.out=new Jt(e.i<<1,e.i<<1),e}fail(){return new su}cap(e){const t=this.newInst(k.CAPTURE);return t.out=new Jt(t.i<<1,t.i<<1),this.prog.getInst(t.i).arg=e,this.prog.numCap<e+1&&(this.prog.numCap=e+1),t}cat(e,t){return e.i===0||t.i===0?this.fail():(this.prog.patch(e.out,t.i),new su(e.i,t.out,e.nullable&&t.nullable))}alt(e,t){if(e.i===0)return t;if(t.i===0)return e;const n=this.newInst(k.ALT),s=this.prog.getInst(n.i);return s.out=e.i,s.arg=t.i,n.out=this.prog.append(e.out,t.out),n.nullable=e.nullable||t.nullable,n}loop(e,t){const n=this.newInst(k.ALT),s=this.prog.getInst(n.i);return t?(s.arg=e.i,n.out=new Jt(n.i<<1,n.i<<1)):(s.out=e.i,n.out=new Jt(n.i<<1|1,n.i<<1|1)),this.prog.patch(e.out,n.i),n}quest(e,t){const n=this.newInst(k.ALT),s=this.prog.getInst(n.i);return t?(s.arg=e.i,n.out=new Jt(n.i<<1,n.i<<1)):(s.out=e.i,n.out=new Jt(n.i<<1|1,n.i<<1|1)),n.out=this.prog.append(n.out,e.out),n}star(e,t){return e.nullable?this.quest(this.plus(e,t),t):this.loop(e,t)}plus(e,t){return new su(e.i,this.loop(e,t).out,e.nullable)}empty(e){const t=this.newInst(k.EMPTY_WIDTH);return this.prog.getInst(t.i).arg=e,t.out=new Jt(t.i<<1,t.i<<1),t}rune(e,t){const n=this.newInst(k.RUNE);n.nullable=!1;const s=this.prog.getInst(n.i);return s.runes=e,t&=G.FOLD_CASE,(e.length!==1||X.simpleFold(e[0])===e[0])&&(t&=-2),s.arg=t,n.out=new Jt(n.i<<1,n.i<<1),(t&G.FOLD_CASE)===0&&e.length===1||e.length===2&&e[0]===e[1]?s.op=k.RUNE1:e.length===2&&e[0]===0&&e[1]===X.MAX_RUNE?s.op=k.RUNE_ANY:e.length===4&&e[0]===0&&e[1]===L.CODES.get(`
`)-1&&e[2]===L.CODES.get(`
`)+1&&e[3]===X.MAX_RUNE&&(s.op=k.RUNE_ANY_NOT_NL),n}lookBehind(e,t){const n=this.newInst(k.LB_WRITE);this.prog.getInst(n.i).arg=t;const s=this.rune(Js.ANY_RUNE(),0),i=this.star(s,!0),o=this.cat(i,e);this.prog.patch(o.out,n.i);const a=this.newInst(k.LB_CHECK);return this.prog.getInst(a.i).arg=t,this.prog.lbStarts.push(o.i),Math.abs(t)>this.prog.numLb&&(this.prog.numLb=Math.abs(t)),a.out=new Jt(a.i<<1,a.i<<1),a}compile(e){switch(e.op){case A.Op.NO_MATCH:return this.fail();case A.Op.EMPTY_MATCH:return this.nop();case A.Op.LITERAL:if(e.runes.length===0)return this.nop();{let t=null;for(let n of e.runes){const s=this.rune([n],e.flags);t=t===null?s:this.cat(t,s)}return t}case A.Op.CHAR_CLASS:return this.rune(e.runes,e.flags);case A.Op.ANY_CHAR_NOT_NL:return this.rune(Js.ANY_RUNE_NOT_NL(),0);case A.Op.ANY_CHAR:return this.rune(Js.ANY_RUNE(),0);case A.Op.BEGIN_LINE:return this.empty(te.EMPTY_BEGIN_LINE);case A.Op.END_LINE:return this.empty(te.EMPTY_END_LINE);case A.Op.BEGIN_TEXT:return this.empty(te.EMPTY_BEGIN_TEXT);case A.Op.END_TEXT:return this.empty(te.EMPTY_END_TEXT);case A.Op.WORD_BOUNDARY:return this.empty(te.EMPTY_WORD_BOUNDARY);case A.Op.NO_WORD_BOUNDARY:return this.empty(te.EMPTY_NO_WORD_BOUNDARY);case A.Op.PLB:case A.Op.NLB:return this.lookBehind(this.compile(e.subs[0]),e.lb);case A.Op.CAPTURE:{const t=this.cap(e.cap<<1),n=this.compile(e.subs[0]),s=this.cap(e.cap<<1|1);return this.cat(this.cat(t,n),s)}case A.Op.STAR:return this.star(this.compile(e.subs[0]),(e.flags&G.NON_GREEDY)!==0);case A.Op.PLUS:return this.plus(this.compile(e.subs[0]),(e.flags&G.NON_GREEDY)!==0);case A.Op.QUEST:return this.quest(this.compile(e.subs[0]),(e.flags&G.NON_GREEDY)!==0);case A.Op.CONCAT:if(e.subs.length===0)return this.nop();{let t=null;for(let n of e.subs){const s=this.compile(n);t=t===null?s:this.cat(t,s)}return t}case A.Op.ALTERNATE:if(e.subs.length===0)return this.nop();{let t=null;for(let n of e.subs){const s=this.compile(n);t=t===null?s:this.alt(t,s)}return t}default:throw new fw("regexp: unhandled case in compile")}}},Nw=class Mt{static simplify(e){if(e===null)return null;switch(e.op){case A.Op.PLB:case A.Op.NLB:case A.Op.CAPTURE:{const t=Mt.simplify(e.subs[0]);if(t!==e.subs[0]){const n=A.fromRegexp(e);return n.runes=[],n.subs=[t],n}return e}case A.Op.CONCAT:case A.Op.ALTERNATE:{const t=[];let n=!1;for(let s=0;s<e.subs.length;s++){const i=e.subs[s],o=Mt.simplify(i);if(o!==i&&(n=!0),e.op===A.Op.CONCAT){if(o.op===A.Op.NO_MATCH)return new A(A.Op.NO_MATCH);if(o.op===A.Op.EMPTY_MATCH){n=!0;continue}if(o.op===A.Op.CONCAT){n=!0;for(let a=0;a<o.subs.length;a++)t.push(o.subs[a]);continue}}else if(e.op===A.Op.ALTERNATE){if(o.op===A.Op.NO_MATCH){n=!0;continue}if(o.op===A.Op.ALTERNATE){n=!0;for(let a=0;a<o.subs.length;a++)t.push(o.subs[a]);continue}}t.push(o)}if(n){if(t.length===0)return new A(e.op===A.Op.CONCAT?A.Op.EMPTY_MATCH:A.Op.NO_MATCH);if(t.length===1)return t[0];const s=A.fromRegexp(e);return s.runes=[],s.subs=t,s}return e}case A.Op.CHAR_CLASS:return e.runes===null?e:e.runes.length===0?new A(A.Op.NO_MATCH):e.runes.length===2&&e.runes[0]===0&&e.runes[1]===X.MAX_RUNE?new A(A.Op.ANY_CHAR):e.runes.length===4&&e.runes[0]===0&&e.runes[1]===L.CODES.get(`
`)-1&&e.runes[2]===L.CODES.get(`
`)+1&&e.runes[3]===X.MAX_RUNE?new A(A.Op.ANY_CHAR_NOT_NL):e;case A.Op.STAR:case A.Op.PLUS:case A.Op.QUEST:{const t=Mt.simplify(e.subs[0]);return Mt.simplify1(e.op,e.flags,t,e)}case A.Op.REPEAT:{if(e.min===0&&e.max===0)return new A(A.Op.EMPTY_MATCH);const t=Mt.simplify(e.subs[0]);if(e.max===-1){if(e.min===0)return Mt.simplify1(A.Op.STAR,e.flags,t,null);if(e.min===1)return Mt.simplify1(A.Op.PLUS,e.flags,t,null);const s=new A(A.Op.CONCAT),i=[];for(let o=0;o<e.min-1;o++)i.push(t);return i.push(Mt.simplify1(A.Op.PLUS,e.flags,t,null)),s.subs=i.slice(0),Mt.simplify(s)}if(e.min===1&&e.max===1)return t;let n=null;if(e.min>0){n=[];for(let s=0;s<e.min;s++)n.push(t)}if(e.max>e.min){let s=Mt.simplify1(A.Op.QUEST,e.flags,t,null);for(let i=e.min+1;i<e.max;i++){const o=new A(A.Op.CONCAT);o.subs=[t,s],s=Mt.simplify1(A.Op.QUEST,e.flags,o,null)}if(n===null)return s;n.push(s)}if(n!==null){const s=new A(A.Op.CONCAT);return s.subs=n.slice(0),Mt.simplify(s)}return new A(A.Op.NO_MATCH)}}return e}static simplify1(e,t,n,s){if(n.op===A.Op.EMPTY_MATCH)return n;if(n.op===A.Op.NO_MATCH)return e===A.Op.PLUS?n:new A(A.Op.EMPTY_MATCH);if(e===n.op&&(t&G.NON_GREEDY)===(n.flags&G.NON_GREEDY))return n;if(s!==null&&s.op===e&&(s.flags&G.NON_GREEDY)===(t&G.NON_GREEDY)&&n===s.subs[0])return s;const i=new A(e);return i.flags=t,i.subs=[n],i}},me=class{constructor(r,e){this.sign=r,this.cls=e}};const zf=[48,57],Qf=[9,10,12,13,32,32],Wf=[48,57,65,90,95,95,97,122],$f=new Map([["\\d",new me(1,zf)],["\\D",new me(-1,zf)],["\\s",new me(1,Qf)],["\\S",new me(-1,Qf)],["\\w",new me(1,Wf)],["\\W",new me(-1,Wf)]]),Yf=[48,57,65,90,97,122],Xf=[65,90,97,122],Zf=[0,127],eC=[9,9,32,32],tC=[0,31,127,127],nC=[48,57],rC=[33,126],sC=[97,122],iC=[32,126],oC=[33,47,58,64,91,96,123,126],aC=[9,13,32,32],uC=[65,90],cC=[48,57,65,90,95,95,97,122],lC=[48,57,65,70,97,102],BC=new Map([["[:alnum:]",new me(1,Yf)],["[:^alnum:]",new me(-1,Yf)],["[:alpha:]",new me(1,Xf)],["[:^alpha:]",new me(-1,Xf)],["[:ascii:]",new me(1,Zf)],["[:^ascii:]",new me(-1,Zf)],["[:blank:]",new me(1,eC)],["[:^blank:]",new me(-1,eC)],["[:cntrl:]",new me(1,tC)],["[:^cntrl:]",new me(-1,tC)],["[:digit:]",new me(1,nC)],["[:^digit:]",new me(-1,nC)],["[:graph:]",new me(1,rC)],["[:^graph:]",new me(-1,rC)],["[:lower:]",new me(1,sC)],["[:^lower:]",new me(-1,sC)],["[:print:]",new me(1,iC)],["[:^print:]",new me(-1,iC)],["[:punct:]",new me(1,oC)],["[:^punct:]",new me(-1,oC)],["[:space:]",new me(1,aC)],["[:^space:]",new me(-1,aC)],["[:upper:]",new me(1,uC)],["[:^upper:]",new me(-1,uC)],["[:word:]",new me(1,cC)],["[:^word:]",new me(-1,cC)],["[:xdigit:]",new me(1,lC)],["[:^xdigit:]",new me(-1,lC)]]);var nr=class cr{static charClassToString(e,t){let n="[";for(let s=0;s<t;s+=2){s>0&&(n+=" ");const i=e[s],o=e[s+1];i===o?n+=`0x${i.toString(16)}`:n+=`0x${i.toString(16)}-0x${o.toString(16)}`}return n+="]",n}static cmp(e,t,n,s){const i=e[t]-n;return i!==0?i:s-e[t+1]}static qsortIntPair(e,t,n){const s=((t+n)/2|0)&-2,i=e[s],o=e[s+1];let a=t,u=n;for(;a<=u;){for(;a<n&&cr.cmp(e,a,i,o)<0;)a+=2;for(;u>t&&cr.cmp(e,u,i,o)>0;)u-=2;if(a<=u){if(a!==u){let l=e[a];e[a]=e[u],e[u]=l,l=e[a+1],e[a+1]=e[u+1],e[u+1]=l}a+=2,u-=2}}t<u&&cr.qsortIntPair(e,t,u),a<n&&cr.qsortIntPair(e,a,n)}constructor(e=te.emptyInts()){this.r=e,this.len=e.length}toArray(){return this.len===this.r.length?this.r:this.r.slice(0,this.len)}cleanClass(){if(this.len<4)return this;cr.qsortIntPair(this.r,0,this.len-2);let e=2;for(let t=2;t<this.len;t+=2){const n=this.r[t],s=this.r[t+1];if(n<=this.r[e-1]+1){s>this.r[e-1]&&(this.r[e-1]=s);continue}this.r[e]=n,this.r[e+1]=s,e+=2}return this.len=e,this}appendLiteral(e,t){return(t&G.FOLD_CASE)!==0?this.appendFoldedRange(e,e):this.appendRange(e,e)}appendRange(e,t){if(this.len>0){for(let n=2;n<=4;n+=2)if(this.len>=n){const s=this.r[this.len-n],i=this.r[this.len-n+1];if(e<=i+1&&s<=t+1)return e<s&&(this.r[this.len-n]=e),t>i&&(this.r[this.len-n+1]=t),this}}return this.r[this.len++]=e,this.r[this.len++]=t,this}appendFoldedRange(e,t){if(e<=X.MIN_FOLD&&t>=X.MAX_FOLD)return this.appendRange(e,t);if(t<X.MIN_FOLD||e>X.MAX_FOLD)return this.appendRange(e,t);e<X.MIN_FOLD&&(this.appendRange(e,X.MIN_FOLD-1),e=X.MIN_FOLD),t>X.MAX_FOLD&&(this.appendRange(X.MAX_FOLD+1,t),t=X.MAX_FOLD);for(let n=e;n<=t;n++){this.appendRange(n,n);for(let s=X.simpleFold(n);s!==n;s=X.simpleFold(s))this.appendRange(s,s)}return this}appendClass(e){for(let t=0;t<e.length;t+=2)this.appendRange(e[t],e[t+1]);return this}appendFoldedClass(e){for(let t=0;t<e.length;t+=2)this.appendFoldedRange(e[t],e[t+1]);return this}appendNegatedClass(e){let t=0;for(let n=0;n<e.length;n+=2){const s=e[n],i=e[n+1];t<=s-1&&this.appendRange(t,s-1),t=i+1}return t<=X.MAX_RUNE&&this.appendRange(t,X.MAX_RUNE),this}appendTable(e){for(let t=0;t<e.length;++t){const n=e.getLo(t),s=e.getHi(t),i=e.getStride(t);if(i===1){this.appendRange(n,s);continue}for(let o=n;o<=s;o+=i)this.appendRange(o,o)}return this}appendNegatedTable(e){let t=0;for(let n=0;n<e.length;++n){const s=e.getLo(n),i=e.getHi(n),o=e.getStride(n);if(o===1){t<=s-1&&this.appendRange(t,s-1),t=i+1;continue}for(let a=s;a<=i;a+=o)t<=a-1&&this.appendRange(t,a-1),t=a+1}return t<=X.MAX_RUNE&&this.appendRange(t,X.MAX_RUNE),this}appendTableWithSign(e,t){return t<0?this.appendNegatedTable(e):this.appendTable(e)}negateClass(){let e=0,t=0;for(let n=0;n<this.len;n+=2){const s=this.r[n],i=this.r[n+1];e<=s-1&&(this.r[t]=e,this.r[t+1]=s-1,t+=2),e=i+1}return this.len=t,e<=X.MAX_RUNE&&(this.r[this.len++]=e,this.r[this.len++]=X.MAX_RUNE),this}appendClassWithSign(e,t){return t<0?this.appendNegatedClass(e):this.appendClass(e)}appendGroup(e,t){let n=e.cls;return t&&(n=new cr().appendFoldedClass(n).cleanClass().toArray()),this.appendClassWithSign(n,e.sign)}toString(){return cr.charClassToString(this.r,this.len)}},Ow=class{constructor(r){this.str=r,this.position=0}pos(){return this.position}rewindTo(r){this.position=r}more(){return this.position<this.str.length}peek(){return this.str.codePointAt(this.position)}skip(r){this.position+=r}skipString(r){this.position+=r.length}pop(){const r=this.str.codePointAt(this.position);return this.position+=te.charCount(r),r}lookingAt(r){return this.str.startsWith(r,this.position)}rest(){return this.str.substring(this.position)}from(r){return this.str.substring(r,this.position)}toString(){return this.rest()}},z,Fw=(z=class{static unicodeTable(e){return e==="Any"?{tab:z.ANY_TABLE,fold:z.ANY_TABLE,sign:1}:e==="Ascii"?{tab:z.ASCII_TABLE,fold:z.ASCII_FOLD_TABLE,sign:1}:e==="Assigned"?{tab:Rt.CATEGORIES.get("Cn"),fold:Rt.CATEGORIES.get("Cn"),sign:-1}:e==="Lc"?{tab:Rt.CATEGORIES.get("LC"),fold:Rt.FOLD_CATEGORIES.get("LC"),sign:1}:Rt.CATEGORIES.has(e)?{tab:Rt.CATEGORIES.get(e),fold:Rt.FOLD_CATEGORIES.get(e),sign:1}:Rt.SCRIPTS.has(e)?{tab:Rt.SCRIPTS.get(e),fold:Rt.FOLD_SCRIPT.get(e),sign:1}:null}static minFoldRune(e){if(e<X.MIN_FOLD||e>X.MAX_FOLD)return e;let t=e;const n=e;for(e=X.simpleFold(e);e!==n;e=X.simpleFold(e))t>e&&(t=e);return t}static leadingRegexp(e){if(e.op===A.Op.EMPTY_MATCH)return null;if(e.op===A.Op.CONCAT&&e.subs.length>0){const t=e.subs[0];return t.op===A.Op.EMPTY_MATCH?null:t}return e}static literalRegexp(e,t){const n=new A(A.Op.LITERAL);return n.flags=t,n.runes=te.stringToRunes(e),n}static parse(e,t){return new z(e,t).parseInternal()}static parseRepeat(e){const t=e.pos();if(!e.more()||!e.lookingAt("{"))return-1;e.skip(1);const n=z.parseInt(e);if(n===-1||!e.more())return-1;let s;if(!e.lookingAt(","))s=n;else{if(e.skip(1),!e.more())return-1;if(e.lookingAt("}"))s=-1;else if((s=z.parseInt(e))===-1)return-1}if(!e.more()||!e.lookingAt("}"))return-1;if(e.skip(1),n<0||n>1e3||s===-2||s>1e3||s>=0&&n>s)throw new Pe(z.ERR_INVALID_REPEAT_SIZE,e.from(t));return n<<16|s&X.MAX_BMP}static isValidCaptureName(e){if(e.length===0)return!1;for(let t=0;t<e.length;t++){const n=e.codePointAt(t);if(n!==L.CODES.get("_")&&!te.isalnum(n))return!1}return!0}static parseInt(e){const t=e.pos();for(;e.more()&&e.peek()>=L.CODES.get("0")&&e.peek()<=L.CODES.get("9");)e.skip(1);const n=e.from(t);return n.length===0||n.length>1&&n.codePointAt(0)===L.CODES.get("0")?-1:n.length>8?-2:parseInt(n,10)}static isCharClass(e){return e.op===A.Op.LITERAL&&e.runes.length===1||e.op===A.Op.CHAR_CLASS||e.op===A.Op.ANY_CHAR_NOT_NL||e.op===A.Op.ANY_CHAR}static matchRune(e,t){switch(e.op){case A.Op.LITERAL:return e.runes.length===1&&e.runes[0]===t;case A.Op.CHAR_CLASS:for(let n=0;n<e.runes.length;n+=2)if(e.runes[n]<=t&&t<=e.runes[n+1])return!0;return!1;case A.Op.ANY_CHAR_NOT_NL:return t!==L.CODES.get(`
`);case A.Op.ANY_CHAR:return!0}return!1}static mergeCharClass(e,t){switch(e.op){case A.Op.ANY_CHAR:break;case A.Op.ANY_CHAR_NOT_NL:z.matchRune(t,L.CODES.get(`
`))&&(e.op=A.Op.ANY_CHAR);break;case A.Op.CHAR_CLASS:t.op===A.Op.LITERAL?e.runes=new nr(e.runes).appendLiteral(t.runes[0],t.flags).toArray():e.runes=new nr(e.runes).appendClass(t.runes).toArray();break;case A.Op.LITERAL:if(t.runes[0]===e.runes[0]&&t.flags===e.flags)break;e.op=A.Op.CHAR_CLASS,e.runes=new nr().appendLiteral(e.runes[0],e.flags).appendLiteral(t.runes[0],t.flags).toArray();break}}static parseEscape(e){const t=e.pos();if(e.skip(1),!e.more())throw new Pe(z.ERR_TRAILING_BACKSLASH);let n=e.pop();e:switch(n){case L.CODES.get("1"):case L.CODES.get("2"):case L.CODES.get("3"):case L.CODES.get("4"):case L.CODES.get("5"):case L.CODES.get("6"):case L.CODES.get("7"):if(!e.more()||e.peek()<L.CODES.get("0")||e.peek()>L.CODES.get("7"))break;case L.CODES.get("0"):{let s=n-L.CODES.get("0");for(let i=1;i<3&&!(!e.more()||e.peek()<L.CODES.get("0")||e.peek()>L.CODES.get("7"));i++)s=s*8+e.peek()-L.CODES.get("0"),e.skip(1);return s}case L.CODES.get("x"):{if(!e.more())break;if(n=e.pop(),n===L.CODES.get("{")){let o=0,a=0;for(;;){if(!e.more())break e;if(n=e.pop(),n===L.CODES.get("}"))break;const u=te.unhex(n);if(u<0||(a=a*16+u,a>X.MAX_RUNE))break e;o++}if(o===0)break e;return a}const s=te.unhex(n);if(!e.more())break;n=e.pop();const i=te.unhex(n);if(s<0||i<0)break;return s*16+i}case L.CODES.get("a"):return L.CODES.get("\x07");case L.CODES.get("f"):return L.CODES.get("\f");case L.CODES.get("n"):return L.CODES.get(`
`);case L.CODES.get("r"):return L.CODES.get("\r");case L.CODES.get("t"):return L.CODES.get("	");case L.CODES.get("v"):return L.CODES.get("\v");default:if(n<=X.MAX_ASCII&&!te.isalnum(n))return n;break}throw new Pe(z.ERR_INVALID_ESCAPE,e.from(t))}static parseClassChar(e,t){if(!e.more())throw new Pe(z.ERR_MISSING_BRACKET,e.from(t));return e.lookingAt("\\")?z.parseEscape(e):e.pop()}static concatRunes(e,t){for(let n=0;n<t.length;n++)e.push(t[n]);return e}static hasCapture(e){if(e===null)return!1;if(e.op===A.Op.CAPTURE)return!0;if(e.subs){for(let t of e.subs)if(z.hasCapture(t))return!0}return!1}constructor(e,t=0){this.wholeRegexp=e,this.flags=t,this.numCap=0,this.namedGroups=Object.create(null),this.stack=[],this.free=null,this.numRegexp=0,this.numRunes=0,this.repeats=0,this.height=null,this.size=null,this.nlb=0}newRegexp(e){let t=this.free;return t!==null&&t.subs!==null&&t.subs.length>0?(this.free=t.subs[0],t.reinit(),t.op=e):(t=new A(e),this.numRegexp+=1),t}reuse(e){this.height!==null&&this.height.has(e)&&this.height.delete(e),e.subs!==null&&e.subs.length>0&&(e.subs[0]=this.free),this.free=e}checkLimits(e){if(this.numRunes>z.MAX_RUNES)throw new Pe(z.ERR_LARGE);this.checkSize(e),this.checkHeight(e)}checkSize(e){if(this.size===null){if(this.repeats===0&&(this.repeats=1),e.op===A.Op.REPEAT){let t=e.max;t===-1&&(t=e.min),t<=0&&(t=1),t>Math.floor(z.MAX_SIZE/this.repeats)?this.repeats=z.MAX_SIZE:this.repeats*=t}if(this.numRegexp<Math.floor(z.MAX_SIZE/this.repeats))return;this.size=new Map;for(let t of this.stack)this.checkSize(t)}if(this.calcSize(e,!0)>z.MAX_SIZE)throw new Pe(z.ERR_LARGE)}calcSize(e,t=!1){if(!t&&this.size!==null&&this.size.has(e))return this.size.get(e);let n=0;switch(e.op){case A.Op.LITERAL:n=e.runes.length;break;case A.Op.PLB:case A.Op.NLB:case A.Op.CAPTURE:case A.Op.STAR:n=2+this.calcSize(e.subs[0]);break;case A.Op.PLUS:case A.Op.QUEST:n=1+this.calcSize(e.subs[0]);break;case A.Op.CONCAT:for(let s of e.subs)n=n+this.calcSize(s);break;case A.Op.ALTERNATE:for(let s of e.subs)n=n+this.calcSize(s);e.subs.length>1&&(n=n+e.subs.length-1);break;case A.Op.REPEAT:{let s=this.calcSize(e.subs[0]);if(e.max===-1){e.min===0?n=2+s:n=1+e.min*s;break}n=e.max*s+(e.max-e.min);break}}return n=Math.max(1,n),this.size===null&&(this.size=new Map),this.size.set(e,n),n}checkHeight(e){if(!(this.numRegexp<z.MAX_HEIGHT)){if(this.height===null){this.height=new Map;for(let t of this.stack)this.checkHeight(t)}if(this.calcHeight(e,!0)>z.MAX_HEIGHT)throw new Pe(z.ERR_NESTING_DEPTH)}}calcHeight(e,t=!1){if(!t&&this.height!==null&&this.height.has(e))return this.height.get(e);let n=1;for(let s of e.subs){const i=this.calcHeight(s);n<1+i&&(n=1+i)}return this.height===null&&(this.height=new Map),this.height.set(e,n),n}pop(){return this.stack.pop()}popToPseudo(){const e=this.stack.length;let t=e;for(;t>0&&!A.isPseudoOp(this.stack[t-1].op);)t--;const n=this.stack.slice(t,e);return this.stack=this.stack.slice(0,t),n}push(e){if(this.numRunes+=e.runes.length,e.op===A.Op.CHAR_CLASS&&e.runes.length===2&&e.runes[0]===e.runes[1]){if(this.maybeConcat(e.runes[0],this.flags&-2))return null;e.op=A.Op.LITERAL,e.runes=[e.runes[0]],e.flags=this.flags&-2}else if(e.op===A.Op.CHAR_CLASS&&e.runes.length===4&&e.runes[0]===e.runes[1]&&e.runes[2]===e.runes[3]&&X.simpleFold(e.runes[0])===e.runes[2]&&X.simpleFold(e.runes[2])===e.runes[0]||e.op===A.Op.CHAR_CLASS&&e.runes.length===2&&e.runes[0]+1===e.runes[1]&&X.simpleFold(e.runes[0])===e.runes[1]&&X.simpleFold(e.runes[1])===e.runes[0]){if(this.maybeConcat(e.runes[0],this.flags|G.FOLD_CASE))return null;e.op=A.Op.LITERAL,e.runes=[e.runes[0]],e.flags=this.flags|G.FOLD_CASE}else this.maybeConcat(-1,0);return this.stack.push(e),this.checkLimits(e),e}maybeConcat(e,t){const n=this.stack.length;if(n<2)return!1;const s=this.stack[n-1],i=this.stack[n-2];return s.op!==A.Op.LITERAL||i.op!==A.Op.LITERAL||(s.flags&G.FOLD_CASE)!==(i.flags&G.FOLD_CASE)?!1:(i.runes=z.concatRunes(i.runes,s.runes),e>=0?(s.runes=[e],s.flags=t,!0):(this.pop(),this.reuse(s),!1))}newLiteral(e,t){const n=this.newRegexp(A.Op.LITERAL);return n.flags=t,(t&G.FOLD_CASE)!==0&&(e=z.minFoldRune(e)),n.runes=[e],n}literal(e){this.push(this.newLiteral(e,this.flags))}op(e){const t=this.newRegexp(e);return t.flags=this.flags,this.push(t)}repeat(e,t,n,s,i,o){let a=this.flags;if((a&G.PERL_X)!==0&&(i.more()&&i.lookingAt("?")&&(i.skip(1),a^=G.NON_GREEDY),o!==-1))throw new Pe(z.ERR_INVALID_REPEAT_OP,i.from(o));const u=this.stack.length;if(u===0)throw new Pe(z.ERR_MISSING_REPEAT_ARGUMENT,i.from(s));const l=this.stack[u-1];if(A.isPseudoOp(l.op))throw new Pe(z.ERR_MISSING_REPEAT_ARGUMENT,i.from(s));const B=this.newRegexp(e);if(B.min=t,B.max=n,B.flags=a,B.subs=[l],this.stack[u-1]=B,this.checkLimits(B),e===A.Op.REPEAT&&(t>=2||n>=2)&&!this.repeatIsValid(B,1e3))throw new Pe(z.ERR_INVALID_REPEAT_SIZE,i.from(s))}repeatIsValid(e,t){if(e.op===A.Op.REPEAT){let n=e.max;if(n===0)return!0;if(n<0&&(n=e.min),n>t)return!1;n>0&&(t=Math.trunc(t/n))}for(let n of e.subs)if(!this.repeatIsValid(n,t))return!1;return!0}concat(){this.maybeConcat(-1,0);const e=this.popToPseudo();return e.length===0?this.push(this.newRegexp(A.Op.EMPTY_MATCH)):this.push(this.collapse(e,A.Op.CONCAT))}alternate(){const e=this.popToPseudo();return e.length>0&&this.cleanAlt(e[e.length-1]),e.length===0?this.push(this.newRegexp(A.Op.NO_MATCH)):this.push(this.collapse(e,A.Op.ALTERNATE))}cleanAlt(e){e.op===A.Op.CHAR_CLASS&&(e.runes=new nr(e.runes).cleanClass().toArray(),e.runes.length===2&&e.runes[0]===0&&e.runes[1]===X.MAX_RUNE?(e.runes=[],e.op=A.Op.ANY_CHAR):e.runes.length===4&&e.runes[0]===0&&e.runes[1]===L.CODES.get(`
`)-1&&e.runes[2]===L.CODES.get(`
`)+1&&e.runes[3]===X.MAX_RUNE&&(e.runes=[],e.op=A.Op.ANY_CHAR_NOT_NL))}collapse(e,t){if(e.length===1)return e[0];let n=0;for(let a of e)n+=a.op===t?a.subs.length:1;let s=new Array(n).fill(null),i=0;for(let a of e)if(a.op===t){for(let u=0;u<a.subs.length;u++)s[i++]=a.subs[u];this.reuse(a)}else s[i++]=a;let o=this.newRegexp(t);if(o.subs=s,t===A.Op.ALTERNATE&&(o.subs=this.factor(o.subs),o.subs.length===1)){const a=o;o=o.subs[0],this.reuse(a)}return o}factor(e){if(e.length<2)return e;let t=0,n=e.length,s=0,i=null,o=0,a=0,u=0;for(let B=0;B<=n;B++){let d=null,C=0,g=0;if(B<n){let D=e[t+B];if(D.op===A.Op.CONCAT&&D.subs.length>0&&(D=D.subs[0]),D.op===A.Op.LITERAL&&(d=D.runes,C=D.runes.length,g=D.flags&G.FOLD_CASE),g===a){let N=0;for(;N<o&&N<C&&i[N]===d[N];)N++;if(N>0){o=N;continue}}}if(B!==u)if(B===u+1)e[s++]=e[t+u];else{const D=this.newRegexp(A.Op.LITERAL);D.flags=a,D.runes=i.slice(0,o);for(let H=u;H<B;H++)e[t+H]=this.removeLeadingString(e[t+H],o),this.checkLimits(e[t+H]);const N=this.collapse(e.slice(t+u,t+B),A.Op.ALTERNATE),V=this.newRegexp(A.Op.CONCAT);V.subs=[D,N],e[s++]=V}u=B,i=d,o=C,a=g}n=s,t=0,u=0,s=0;let l=null;for(let B=0;B<=n;B++){let d=null;if(!(B<n&&(d=z.leadingRegexp(e[t+B]),l!==null&&l.equals(d)&&(z.isCharClass(l)||l.op===A.Op.REPEAT&&l.min===l.max&&z.isCharClass(l.subs[0]))))){if(B!==u)if(B===u+1)e[s++]=e[t+u];else{const C=l;for(let N=u;N<B;N++){const V=N!==u;e[t+N]=this.removeLeadingRegexp(e[t+N],V),this.checkLimits(e[t+N])}const g=this.collapse(e.slice(t+u,t+B),A.Op.ALTERNATE),D=this.newRegexp(A.Op.CONCAT);D.subs=[C,g],e[s++]=D}u=B,l=d}}n=s,t=0,u=0,s=0;for(let B=0;B<=n;B++)if(!(B<n&&z.isCharClass(e[t+B]))){if(B!==u)if(B===u+1)e[s++]=e[t+u];else{let d=u;for(let g=u+1;g<B;g++){const D=e[t+d],N=e[t+g];(D.op<N.op||D.op===N.op&&(D.runes!==null?D.runes.length:0)<(N.runes!==null?N.runes.length:0))&&(d=g)}const C=e[t+u];e[t+u]=e[t+d],e[t+d]=C;for(let g=u+1;g<B;g++)z.mergeCharClass(e[t+u],e[t+g]),this.reuse(e[t+g]);this.cleanAlt(e[t+u]),e[s++]=e[t+u]}B<n&&(e[s++]=e[t+B]),u=B+1}n=s,t=0,u=0,s=0;for(let B=0;B<n;++B)B+1<n&&e[t+B].op===A.Op.EMPTY_MATCH&&e[t+B+1].op===A.Op.EMPTY_MATCH||(e[s++]=e[t+B]);return n=s,t=0,e.slice(t,n)}removeLeadingString(e,t){if(e.op===A.Op.CONCAT&&e.subs.length>0){const n=this.removeLeadingString(e.subs[0],t);if(e.subs[0]=n,n.op===A.Op.EMPTY_MATCH)switch(this.reuse(n),e.subs.length){case 0:case 1:e.op=A.Op.EMPTY_MATCH,e.subs=A.emptySubs();break;case 2:{const s=e;e=e.subs[1],this.reuse(s);break}default:e.subs=e.subs.slice(1,e.subs.length);break}return e}return e.op===A.Op.LITERAL&&(e.runes=e.runes.slice(t,e.runes.length),e.runes.length===0&&(e.op=A.Op.EMPTY_MATCH)),e}removeLeadingRegexp(e,t){if(e.op===A.Op.CONCAT&&e.subs.length>0){switch(t&&this.reuse(e.subs[0]),e.subs=e.subs.slice(1,e.subs.length),e.subs.length){case 0:e.op=A.Op.EMPTY_MATCH,e.subs=A.emptySubs();break;case 1:{const n=e;e=e.subs[0],this.reuse(n);break}}return e}return t&&this.reuse(e),this.newRegexp(A.Op.EMPTY_MATCH)}parseInternal(){if((this.flags&G.LITERAL)!==0)return z.literalRegexp(this.wholeRegexp,this.flags);let e=-1,t=-1,n=-1;const s=new Ow(this.wholeRegexp);for(;s.more();){let i=-1;e:switch(s.peek()){case L.CODES.get("("):if((this.flags&G.LOOKBEHIND)!==0){if(s.lookingAt("(?<=")){this.parsePosLookBehind(),s.skip(4);break}if(s.lookingAt("(?<!")){this.parseNegLookBehind(),s.skip(4);break}}if((this.flags&G.PERL_X)!==0&&s.lookingAt("(?")){this.parsePerlFlags(s);break}this.op(A.Op.LEFT_PAREN).cap=++this.numCap,s.skip(1);break;case L.CODES.get("|"):this.parseVerticalBar(),s.skip(1);break;case L.CODES.get(")"):this.parseRightParen(),s.skip(1);break;case L.CODES.get("^"):(this.flags&G.ONE_LINE)!==0?this.op(A.Op.BEGIN_TEXT):this.op(A.Op.BEGIN_LINE),s.skip(1);break;case L.CODES.get("$"):(this.flags&G.ONE_LINE)!==0?this.op(A.Op.END_TEXT).flags|=G.WAS_DOLLAR:this.op(A.Op.END_LINE),s.skip(1);break;case L.CODES.get("."):(this.flags&G.DOT_NL)!==0?this.op(A.Op.ANY_CHAR):this.op(A.Op.ANY_CHAR_NOT_NL),s.skip(1);break;case L.CODES.get("["):this.parseClass(s);break;case L.CODES.get("*"):case L.CODES.get("+"):case L.CODES.get("?"):{i=s.pos();let o=null;switch(s.pop()){case L.CODES.get("*"):o=A.Op.STAR;break;case L.CODES.get("+"):o=A.Op.PLUS;break;case L.CODES.get("?"):o=A.Op.QUEST;break}this.repeat(o,t,n,i,s,e);break}case L.CODES.get("{"):{i=s.pos();const o=z.parseRepeat(s);if(o<0){s.rewindTo(i),this.literal(s.pop());break}t=o>>16,n=(o&X.MAX_BMP)<<16>>16,this.repeat(A.Op.REPEAT,t,n,i,s,e);break}case L.CODES.get("\\"):{const o=s.pos();if(s.skip(1),(this.flags&G.PERL_X)!==0&&s.more())switch(s.pop()){case L.CODES.get("A"):this.op(A.Op.BEGIN_TEXT);break e;case L.CODES.get("b"):this.op(A.Op.WORD_BOUNDARY);break e;case L.CODES.get("B"):this.op(A.Op.NO_WORD_BOUNDARY);break e;case L.CODES.get("C"):throw new Pe(z.ERR_INVALID_ESCAPE,"\\C");case L.CODES.get("Q"):{let l=s.rest();const B=l.indexOf("\\E");B>=0?(l=l.substring(0,B),s.skipString(l),s.skipString("\\E")):s.skipString(l);let d=0;for(;d<l.length;){const C=l.codePointAt(d);this.literal(C),d+=te.charCount(C)}break e}case L.CODES.get("z"):this.op(A.Op.END_TEXT);break e;default:s.rewindTo(o);break}else s.rewindTo(o);const a=this.newRegexp(A.Op.CHAR_CLASS);if(a.flags=this.flags,s.lookingAt("\\p")||s.lookingAt("\\P")){const l=new nr;if(this.parseUnicodeClass(s,l)){a.runes=l.toArray(),this.push(a);break e}}const u=new nr;if(this.parsePerlClassEscape(s,u)){a.runes=u.toArray(),this.push(a);break e}s.rewindTo(o),this.reuse(a),this.literal(z.parseEscape(s));break}default:this.literal(s.pop());break}e=i}if(this.concat(),this.swapVerticalBar()&&this.pop(),this.alternate(),this.stack.length!==1)throw new Pe(z.ERR_MISSING_PAREN,this.wholeRegexp);return this.stack[0].namedGroups=this.namedGroups,this.stack[0]}parsePerlFlags(e){const t=e.pos(),n=e.rest();if(n.startsWith("(?P<")||n.startsWith("(?<")){const a=n.charAt(2)==="P"?4:3,u=n.indexOf(">");if(u<0)throw new Pe(z.ERR_INVALID_NAMED_CAPTURE,n);const l=n.substring(a,u);if(e.skipString(l),e.skip(a+1),!z.isValidCaptureName(l))throw new Pe(z.ERR_INVALID_NAMED_CAPTURE,n.substring(0,u+1));const B=this.op(A.Op.LEFT_PAREN);if(B.cap=++this.numCap,this.namedGroups[l])throw new Pe(z.ERR_DUPLICATE_NAMED_CAPTURE,l);this.namedGroups[l]=this.numCap,B.name=l;return}e.skip(2);let s=this.flags,i=1,o=!1;e:for(;e.more();){const a=e.pop();switch(a){case L.CODES.get("i"):s|=G.FOLD_CASE,o=!0;break;case L.CODES.get("m"):s&=-17,o=!0;break;case L.CODES.get("s"):s|=G.DOT_NL,o=!0;break;case L.CODES.get("U"):s|=G.NON_GREEDY,o=!0;break;case L.CODES.get("-"):if(i<0)break e;i=-1,s=~s,o=!1;break;case L.CODES.get(":"):case L.CODES.get(")"):if(i<0){if(!o)break e;s=~s}a===L.CODES.get(":")&&this.op(A.Op.LEFT_PAREN),this.flags=s;return;default:break e}}throw new Pe(z.ERR_INVALID_PERL_OP,e.from(t))}parsePosLookBehind(){const e=this.newRegexp(A.Op.LEFT_PAREN);return e.flags=this.flags,e.lb=++this.nlb,this.push(e)}parseNegLookBehind(){const e=this.newRegexp(A.Op.LEFT_PAREN);return e.flags=this.flags,e.lb=-++this.nlb,this.push(e)}parseVerticalBar(){this.concat(),this.swapVerticalBar()||this.op(A.Op.VERTICAL_BAR)}swapVerticalBar(){const e=this.stack.length;if(e>=3&&this.stack[e-2].op===A.Op.VERTICAL_BAR&&z.isCharClass(this.stack[e-1])&&z.isCharClass(this.stack[e-3])){let t=this.stack[e-1],n=this.stack[e-3];if(t.op>n.op){const s=n;n=t,t=s,this.stack[e-3]=n}return z.mergeCharClass(n,t),this.reuse(t),this.pop(),!0}if(e>=2){const t=this.stack[e-1],n=this.stack[e-2];if(n.op===A.Op.VERTICAL_BAR)return e>=3&&this.cleanAlt(this.stack[e-3]),this.stack[e-2]=t,this.stack[e-1]=n,!0}return!1}parseRightParen(){if(this.concat(),this.swapVerticalBar()&&this.pop(),this.alternate(),this.stack.length<2)throw new Pe(z.ERR_UNEXPECTED_PAREN,this.wholeRegexp);const e=this.pop(),t=this.pop();if(t.op!==A.Op.LEFT_PAREN)throw new Pe(z.ERR_UNEXPECTED_PAREN,this.wholeRegexp);if(this.flags=t.flags,t.lb!==0){if(z.hasCapture(e))throw new Pe(z.ERR_INVALID_CAPTURE_IN_LOOKBEHIND,this.wholeRegexp);t.lb>0?t.op=A.Op.PLB:t.op=A.Op.NLB,t.subs=[e],this.push(t);return}t.cap===0?this.push(e):(t.op=A.Op.CAPTURE,t.subs=[e],this.push(t))}parsePerlClassEscape(e,t){const n=e.pos();if((this.flags&G.PERL_X)===0||!e.more()||e.pop()!==L.CODES.get("\\")||!e.more())return!1;e.pop();const s=e.from(n),i=$f.has(s)?$f.get(s):null;return i===null?!1:(t.appendGroup(i,(this.flags&G.FOLD_CASE)!==0),!0)}parseNamedClass(e,t){const n=e.rest(),s=n.indexOf(":]");if(s<0)return!1;const i=n.substring(0,s+2);e.skipString(i);const o=BC.has(i)?BC.get(i):null;if(o===null)throw new Pe(z.ERR_INVALID_CHAR_RANGE,i);return t.appendGroup(o,(this.flags&G.FOLD_CASE)!==0),!0}parseUnicodeClass(e,t){const n=e.pos();if((this.flags&G.UNICODE_GROUPS)===0||!e.lookingAt("\\p")&&!e.lookingAt("\\P"))return!1;e.skip(1);let s=1,i=e.pop();if(i===L.CODES.get("P")&&(s=-1),!e.more())throw e.rewindTo(n),new Pe(z.ERR_INVALID_CHAR_RANGE,e.rest());i=e.pop();let o;if(i!==L.CODES.get("{"))o=te.runeToString(i);else{const B=e.rest(),d=B.indexOf("}");if(d<0)throw e.rewindTo(n),new Pe(z.ERR_INVALID_CHAR_RANGE,e.rest());o=B.substring(0,d),e.skipString(o),e.skip(1)}o.length!==0&&o.codePointAt(0)===L.CODES.get("^")&&(s=0-s,o=o.substring(1));const a=z.unicodeTable(o);if(a===null)throw new Pe(z.ERR_INVALID_CHAR_RANGE,e.from(n));a.sign<0&&(s=0-s);const u=a.tab,l=a.fold;if((this.flags&G.FOLD_CASE)===0||l===null)t.appendTableWithSign(u,s);else{const B=new nr().appendTable(u).appendTable(l).cleanClass().toArray();t.appendClassWithSign(B,s)}return!0}parseClass(e){const t=e.pos();e.skip(1);const n=this.newRegexp(A.Op.CHAR_CLASS);n.flags=this.flags;const s=new nr;let i=1;e.more()&&e.lookingAt("^")&&(i=-1,e.skip(1),(this.flags&G.CLASS_NL)===0&&s.appendRange(L.CODES.get(`
`),L.CODES.get(`
`)));let o=!0;for(;!e.more()||e.peek()!==L.CODES.get("]")||o;){if(e.more()&&e.lookingAt("-")&&(this.flags&G.PERL_X)===0&&!o){const B=e.rest();if(B==="-"||!B.startsWith("-]"))throw e.rewindTo(t),new Pe(z.ERR_INVALID_CHAR_RANGE,e.rest())}o=!1;const a=e.pos();if(e.lookingAt("[:")){if(this.parseNamedClass(e,s))continue;e.rewindTo(a)}if(this.parseUnicodeClass(e,s)||this.parsePerlClassEscape(e,s))continue;e.rewindTo(a);const u=z.parseClassChar(e,t);let l=u;if(e.more()&&e.lookingAt("-")){if(e.skip(1),e.more()&&e.lookingAt("]"))e.skip(-1);else if(l=z.parseClassChar(e,t),l<u)throw new Pe(z.ERR_INVALID_CHAR_RANGE,e.from(a))}(this.flags&G.FOLD_CASE)===0?s.appendRange(u,l):s.appendFoldedRange(u,l)}e.skip(1),s.cleanClass(),i<0&&s.negateClass(),n.runes=s.toArray(),this.push(n)}},J(z,"ERR_INTERNAL_ERROR","regexp/syntax: internal error"),J(z,"ERR_INVALID_CHAR_RANGE","invalid character class range"),J(z,"ERR_INVALID_ESCAPE","invalid escape sequence"),J(z,"ERR_INVALID_NAMED_CAPTURE","invalid named capture"),J(z,"ERR_INVALID_PERL_OP","invalid or unsupported Perl syntax"),J(z,"ERR_INVALID_REPEAT_OP","invalid nested repetition operator"),J(z,"ERR_INVALID_REPEAT_SIZE","invalid repeat count"),J(z,"ERR_MISSING_BRACKET","missing closing ]"),J(z,"ERR_MISSING_PAREN","missing closing )"),J(z,"ERR_MISSING_REPEAT_ARGUMENT","missing argument to repetition operator"),J(z,"ERR_TRAILING_BACKSLASH","trailing backslash at end of expression"),J(z,"ERR_DUPLICATE_NAMED_CAPTURE","duplicate capture group name"),J(z,"ERR_UNEXPECTED_PAREN","unexpected )"),J(z,"ERR_NESTING_DEPTH","expression nests too deeply"),J(z,"ERR_LARGE","expression too large"),J(z,"ERR_INVALID_CAPTURE_IN_LOOKBEHIND","invalid capture in lookbehind"),J(z,"MAX_HEIGHT",1e3),J(z,"MAX_SIZE",3355443),J(z,"MAX_RUNES",33554432),J(z,"ANY_TABLE",new m(new Uint32Array([0,X.MAX_RUNE,1]))),J(z,"ASCII_TABLE",new m(new Uint32Array([0,127,1]))),J(z,"ASCII_FOLD_TABLE",new m(new Uint32Array([0,127,1,383,383,1,8490,8490,1]))),z),Lw=class Qr{static initTest(e){const t=Qr.compile(e),n=new Qr(t.expr,t.prog,t.numSubexp,t.longest);return n.cond=t.cond,n.prefix=t.prefix,n.prefixUTF8=t.prefixUTF8,n.prefixComplete=t.prefixComplete,n.prefixRune=t.prefixRune,n.prefilter=t.prefilter,n}static compile(e){return Qr.compileImpl(e,G.PERL,!1)}static compilePOSIX(e){return Qr.compileImpl(e,G.POSIX,!0)}static compileImpl(e,t,n){let s=Fw.parse(e,t);const i=s.maxCap();s=Nw.simplify(s);const o=Pw.build(s),a=Sw.compileRegexp(s),u=new Qr(e,a,i,n);u.prefilter=o.type===_e.Type.NONE?null:o;const[l,B]=a.prefix();return u.prefixComplete=l,u.prefix=B,u.prefixUTF8=te.stringToUtf8ByteArray(u.prefix),u.prefix.length>0&&(u.prefixRune=u.prefix.codePointAt(0)),u.namedGroups=s.namedGroups,u}static match(e,t){return Qr.compile(e).match(t)}constructor(e,t,n=0,s=0){this.expr=e,this.prog=t,this.numSubexp=n,this.longest=s,this.cond=t.startCond(),this.prefix=null,this.prefixUTF8=null,this.prefixComplete=!1,this.prefixRune=0,this.machinePool=[],this.dfa=new _w(this.prog),this.onepass=Jf.compile(this.prog),this.prefilter=null}matchPrefixComplete(e,t,n,s){if((n===G.ANCHOR_START||n===G.ANCHOR_BOTH)&&t!==0)return null;let i=-1,o=-1;const a=e.prefixLength(this);if(n===G.UNANCHORED){const u=e.index(this,t);if(u<0)return null;i=t+u,o=i+a}else if(n===G.ANCHOR_BOTH){if(e.endPos()!==a||e.index(this,0)!==0)return null;i=0,o=a}else if(n===G.ANCHOR_START){if(e.index(this,0)!==0)return null;i=0,o=a}if(i<0)return null;if(s>0){const u=new Int32Array(s).fill(-1);return u[0]=i,u[1]=o,Array.from(u)}return[]}executeEngine(e,t,n,s){if(this.prefixComplete&&(s===0||this.numSubexp===0))return this.matchPrefixComplete(e,t,n,s);if(this.prefilter!==null&&n===G.UNANCHORED&&!this.prefilter.eval(e,t))return null;if(this.onepass!==null)return Jf.execute(this,e,t,n,s);if(s>0)return this.prog.numLb===0&&e.endPos()<=ru.maxBitStateLen(this.prog)?ru.execute(this,e,t,n,s):this.doExecuteNFA(e,t,n,s);if(this.prog.numLb===0){const i=this.dfa.match(e,t,n);if(i!==null)return i?[]:null;if(e.endPos()<=ru.maxBitStateLen(this.prog))return ru.execute(this,e,t,n,s)}return this.doExecuteNFA(e,t,n,s)}numberOfCapturingGroups(){return this.numSubexp}numberOfInstructions(){return this.prog.numInst()}get(){return this.machinePool.length>0?this.machinePool.pop():null}reset(){this.machinePool.length=0}put(e){this.machinePool.push(e)}toString(){return this.expr}doExecuteNFA(e,t,n,s){let i=this.get();i||(i=pw.fromRE2(this)),i.init(s);const o=i.match(e,t,n)?i.submatches():null;return this.put(i),o}match(e){return this.executeEngine(Oe.fromUTF16(e),0,G.UNANCHORED,0)!==null}matchWithGroup(e,t,n,s,i){return e instanceof ds||(te.isByteArray(e)?e=ns.utf8(e):e=ns.utf16(e)),this.matchMachineInput(e,t,n,s,i)}matchMachineInput(e,t,n,s,i){if(t>n)return[!1,null];const o=e.isUTF16Encoding()?Oe.fromUTF16(e.asCharSequence(),0,n):Oe.fromUTF8(e.asBytes(),0,n),a=this.executeEngine(o,t,s,2*i);return a===null?[!1,null]:[!0,a]}matchUTF8(e){return this.executeEngine(Oe.fromUTF8(e),0,G.UNANCHORED,0)!==null}replaceAll(e,t){return this.replaceAllFunc(e,()=>t,2*e.length+1)}replaceFirst(e,t){return this.replaceAllFunc(e,()=>t,1)}replaceAllFunc(e,t,n){let s=0,i=0,o="";const a=Oe.fromUTF16(e);let u=0;for(;i<=e.length;){const l=this.executeEngine(a,i,G.UNANCHORED,2);if(l===null||l.length===0)break;o+=e.substring(s,l[0]),(l[1]>s||l[0]===0)&&(o+=t(e.substring(l[0],l[1])),u++),s=l[1];const B=a.step(i)&7;if(i+B>l[1]?i+=B:i+1>l[1]?i++:i=l[1],u>=n)break}return o+=e.substring(s),o}pad(e){if(e===null)return null;let t=(1+this.numSubexp)*2;if(e.length<t){let n=new Array(t).fill(-1);for(let s=0;s<e.length;s++)n[s]=e[s];e=n}return e}allMatches(e,t,n=s=>s){let s=[];const i=e.endPos();t<0&&(t=i+1);let o=0,a=0,u=-1;for(;a<t&&o<=i;){const l=this.executeEngine(e,o,G.UNANCHORED,this.prog.numCap);if(l===null||l.length===0)break;let B=!0;if(l[1]===o){l[0]===u&&(B=!1);const d=e.step(o);d<0?o=i+1:o+=d&7}else o=l[1];u=l[1],B&&(s.push(n(this.pad(l))),a++)}return s}findUTF8(e){const t=this.executeEngine(Oe.fromUTF8(e),0,G.UNANCHORED,2);return t===null?null:e.slice(t[0],t[1])}findUTF8Index(e){const t=this.executeEngine(Oe.fromUTF8(e),0,G.UNANCHORED,2);return t===null?null:t.slice(0,2)}find(e){const t=this.executeEngine(Oe.fromUTF16(e),0,G.UNANCHORED,2);return t===null?"":e.substring(t[0],t[1])}findIndex(e){return this.executeEngine(Oe.fromUTF16(e),0,G.UNANCHORED,2)}findUTF8Submatch(e){const t=this.executeEngine(Oe.fromUTF8(e),0,G.UNANCHORED,this.prog.numCap);if(t===null)return null;const n=new Array(1+this.numSubexp).fill(null);for(let s=0;s<n.length;s++)2*s<t.length&&t[2*s]>=0&&(n[s]=e.slice(t[2*s],t[2*s+1]));return n}findUTF8SubmatchIndex(e){return this.pad(this.executeEngine(Oe.fromUTF8(e),0,G.UNANCHORED,this.prog.numCap))}findSubmatch(e){const t=this.executeEngine(Oe.fromUTF16(e),0,G.UNANCHORED,this.prog.numCap);if(t===null)return null;const n=new Array(1+this.numSubexp).fill(null);for(let s=0;s<n.length;s++)2*s<t.length&&t[2*s]>=0&&(n[s]=e.substring(t[2*s],t[2*s+1]));return n}findSubmatchIndex(e){return this.pad(this.executeEngine(Oe.fromUTF16(e),0,G.UNANCHORED,this.prog.numCap))}findAllUTF8(e,t){const n=this.allMatches(Oe.fromUTF8(e),t,s=>e.slice(s[0],s[1]));return n.length===0?null:n}findAllUTF8Index(e,t){const n=this.allMatches(Oe.fromUTF8(e),t,s=>s.slice(0,2));return n.length===0?null:n}findAll(e,t){const n=this.allMatches(Oe.fromUTF16(e),t,s=>e.substring(s[0],s[1]));return n.length===0?null:n}findAllIndex(e,t){const n=this.allMatches(Oe.fromUTF16(e),t,s=>s.slice(0,2));return n.length===0?null:n}findAllUTF8Submatch(e,t){const n=this.allMatches(Oe.fromUTF8(e),t,s=>{let i=new Array(s.length/2|0).fill(null);for(let o=0;o<i.length;o++)s[2*o]>=0&&(i[o]=e.slice(s[2*o],s[2*o+1]));return i});return n.length===0?null:n}findAllUTF8SubmatchIndex(e,t){const n=this.allMatches(Oe.fromUTF8(e),t);return n.length===0?null:n}findAllSubmatch(e,t){const n=this.allMatches(Oe.fromUTF16(e),t,s=>{let i=new Array(s.length/2|0).fill(null);for(let o=0;o<i.length;o++)s[2*o]>=0&&(i[o]=e.substring(s[2*o],s[2*o+1]));return i});return n.length===0?null:n}findAllSubmatchIndex(e,t){const n=this.allMatches(Oe.fromUTF16(e),t);return n.length===0?null:n}},Vw=class Ks{static isHexadecimal(e){return"0"<=e&&e<="9"||"A"<=e&&e<="F"||"a"<=e&&e<="f"}static translate(e){let t="";if(e instanceof RegExp&&(e.ignoreCase&&(t+="i"),e.multiline&&(t+="m"),e.dotAll&&(t+="s"),e=e.source),typeof e!="string")return e;let n="",s=!1,i=e.length;i===0&&(n="(?:)",s=!0);let o=!1,a=0;for(;a<i;){let l=e[a];if(l==="\\"){if(a+1<i)switch(l=e[a+1],l){case"\\":n+="\\\\",a+=2;continue;case"c":if(a+2<i){let C=e[a+2].charCodeAt(0);if(C>=65&&C<=90||C>=97&&C<=122){let g=C%32;n+="\\x",n+=(g>>4).toString(16).toUpperCase(),n+=(g&15).toString(16).toUpperCase(),a+=3,s=!0;continue}}n+="c",a+=2,s=!0;continue;case"u":if(a+2<i){if(e[a+2]==="{"){let C=a+3,g=!1,D=!1;for(;C<i;){const N=e[C];if(N==="}"){D=!0;break}if(!Ks.isHexadecimal(N))break;g=!0,C++}if(D&&g){n+="\\x",a+=2,s=!0;continue}}else if(a+5<i){let C=!0;for(let g=0;g<4;g++)if(!Ks.isHexadecimal(e[a+2+g])){C=!1;break}if(C){n+="\\x{"+e.substring(a+2,a+6)+"}",a+=6,s=!0;continue}}}n+="u",a+=2,s=!0;continue;case"x":{let C=!1;if(a+2<i&&e[a+2]==="{"){let g=a+3,D=!1,N=!1;for(;g<i;){const V=e[g];if(V==="}"){N=!0;break}if(!Ks.isHexadecimal(V))break;D=!0,g++}N&&D&&(C=!0)}else a+3<i&&Ks.isHexadecimal(e[a+2])&&Ks.isHexadecimal(e[a+3])&&(C=!0);C?(n+="\\x",a+=2):(n+="x",a+=2,s=!0);continue}case"n":case"r":case"t":case"a":case"f":case"v":case"d":case"D":case"s":case"S":case"w":case"W":case"b":case"B":case"p":case"P":case"A":case"z":case"Q":case"E":case"0":case"1":case"2":case"3":case"4":case"5":case"6":case"7":n+="\\"+l,a+=2;continue;default:{let C=e.codePointAt(a+1);if(C>=48&&C<=57||C>=65&&C<=90||C>=97&&C<=122){let g=te.charCount(C);n+=e.substring(a+1,a+1+g),a+=g+1,s=!0}else{n+="\\";let g=te.charCount(C);n+=e.substring(a+1,a+1+g),a+=g+1}continue}}}else if(l==="/"){n+="\\/",a+=1,s=!0;continue}else if(l==="[")o=!0;else if(l==="]")o=!1;else if(!o&&l==="("&&a+2<i&&e[a+1]==="?"&&e[a+2]==="<"&&a+3<i&&!"=!>)".includes(e[a+3])){n+="(?P<",a+=3,s=!0;continue}let B=e.codePointAt(a),d=te.charCount(B);n+=e.substring(a,a+d),a+=d}const u=s?n:e;return t.length>0?`(?${t})${u}`:u}},We,kB=(We=class{static quote(e){return te.quoteMeta(e)}static quoteReplacement(e,t=!1){return Uf.quoteReplacement(e,t)}static translateRegExp(e){return Vw.translate(e)}static compile(e,t=0){let n=e;if((t&We.CASE_INSENSITIVE)!==0&&(n=`(?i)${n}`),(t&We.DOTALL)!==0&&(n=`(?s)${n}`),(t&We.MULTILINE)!==0&&(n=`(?m)${n}`),(t&-544)!==0)throw new Cw("Flags should only be a combination of MULTILINE, DOTALL, CASE_INSENSITIVE, DISABLE_UNICODE_GROUPS, LONGEST_MATCH, LOOKBEHINDS");let s=G.PERL;(t&We.DISABLE_UNICODE_GROUPS)!==0&&(s&=-129),(t&We.LOOKBEHINDS)!==0&&(s|=G.LOOKBEHIND);const i=new We(e,t);return i.re2Input=Lw.compileImpl(n,s,(t&We.LONGEST_MATCH)!==0),i}static matches(e,t){return We.compile(e).testExact(t)}static initTest(e,t,n){if(e==null)throw new Error("pattern is null");if(n==null)throw new Error("re2 is null");const s=new We(e,t);return s.re2Input=n,s}constructor(e,t){this.patternInput=e,this.flagsInput=t,this.re2Input=null}reset(){this.re2Input.reset()}flags(){return this.flagsInput}pattern(){return this.patternInput}re2(){return this.re2Input}matches(e){return this.testExact(e)}matcher(e){return te.isByteArray(e)&&(e=ns.utf8(e)),new Uf(this,e)}test(e){return te.isByteArray(e)?this.re2Input.matchUTF8(e):this.re2Input.match(e)}testExact(e){const t=te.isByteArray(e)?Oe.fromUTF8(e):Oe.fromUTF16(e);return this.re2Input.executeEngine(t,0,G.ANCHOR_BOTH,0)!==null}exec(e){const t=this.matcher(e);if(!t.find())return null;const n=[t.group(0)];for(let i=1;i<=t.groupCount();i++){const o=t.group(i);n.push(o===null?void 0:o)}n.index=t.start(0),n.input=e;const s=this.namedGroups();if(Object.keys(s).length>0){const i=t.getNamedGroups();for(const o in i)i[o]===null&&(i[o]=void 0);n.groups=i}else n.groups=void 0;return n}split(e,t=0){const n=this.matcher(e),s=[];let i=0,o=0;for(;n.find();){if(o===0&&n.end()===0){o=n.end();continue}if(t>0&&s.length===t-1)break;if(o===n.start()){if(t===0){i+=1,o=n.end();continue}}else for(;i>0;)s.push(""),i-=1;s.push(n.substring(o,n.start())),o=n.end()}if(t===0&&o!==n.inputLength()){for(;i>0;)s.push(""),i-=1;s.push(n.substring(o,n.inputLength()))}return(t!==0||s.length===0&&!(o===n.inputLength()&&o>0))&&s.push(n.substring(o,n.inputLength())),s}*matchAll(e){const t=this.matcher(e);for(;t.find();){const n=[t.group(0)];for(let i=1;i<=t.groupCount();i++){const o=t.group(i);n.push(o===null?void 0:o)}n.index=t.start(0),n.input=e;const s=this.namedGroups();if(Object.keys(s).length>0){const i=t.getNamedGroups();for(const o in i)i[o]===null&&(i[o]=void 0);n.groups=i}else n.groups=void 0;yield n}}toString(){return this.patternInput}programSize(){return this.re2Input.numberOfInstructions()}groupCount(){return this.re2Input.numberOfCapturingGroups()}namedGroups(){return this.re2Input.namedGroups}equals(e){return this===e?!0:e===null||this.constructor!==e.constructor?!1:this.flagsInput===e.flagsInput&&this.patternInput===e.patternInput}},J(We,"CASE_INSENSITIVE",ks.CASE_INSENSITIVE),J(We,"DOTALL",ks.DOTALL),J(We,"MULTILINE",ks.MULTILINE),J(We,"DISABLE_UNICODE_GROUPS",ks.DISABLE_UNICODE_GROUPS),J(We,"LONGEST_MATCH",ks.LONGEST_MATCH),J(We,"LOOKBEHINDS",ks.LOOKBEHINDS),We);/**
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
 */let Oi="12.17.0";function kw(r){Oi=r}/**
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
 */const yr=new NB("@firebase/firestore");function zs(){return yr.logLevel}function xw(r){yr.setLogLevel(r)}function U(r,...e){if(yr.logLevel<=he.DEBUG){const t=e.map(xB);yr.debug(`Firestore (${Oi}): ${r}`,...t)}}function je(r,...e){if(yr.logLevel<=he.ERROR){const t=e.map(xB);yr.error(`Firestore (${Oi}): ${r}`,...t)}}function nt(r,...e){if(yr.logLevel<=he.WARN){const t=e.map(xB);yr.warn(`Firestore (${Oi}): ${r}`,...t)}}function xB(r){if(typeof r=="string")return r;try{return(function(t){return JSON.stringify(t)})(r)}catch{return r}}/**
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
 */function Y(r,e,t){let n="Unexpected state";typeof e=="string"?n=e:t=e,Lg(r,n,t)}function Lg(r,e,t){let n=`FIRESTORE (${Oi}) INTERNAL ASSERTION FAILED: ${e} (ID: ${r.toString(16)})`;if(t!==void 0)try{n+=" CONTEXT: "+JSON.stringify(t)}catch{n+=" CONTEXT: "+t}throw je(n),new Error(n)}function q(r,e,t,n){let s="Unexpected state";typeof t=="string"?s=t:n=t,r||Lg(e,s,n)}function Mw(r,e){r||Y(57014,e)}function W(r,e){return r}/**
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
 */function Gw(r){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(r);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let n=0;n<r;n++)t[n]=Math.floor(256*Math.random());return t}/**
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
 */class ic{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let n="";for(;n.length<20;){const s=Gw(40);for(let i=0;i<s.length;++i)n.length<20&&s[i]<t&&(n+=e.charAt(s[i]%62))}return n}}function oe(r,e){return r<e?-1:r>e?1:0}function $l(r,e){const t=Math.min(r.length,e.length);for(let n=0;n<t;n++){const s=r.charAt(n),i=e.charAt(n);if(s!==i)return wl(s)===wl(i)?oe(s,i):wl(s)?1:-1}return oe(r.length,e.length)}const Uw=55296,Hw=57343;function wl(r){const e=r.charCodeAt(0);return e>=Uw&&e<=Hw}function ii(r,e,t){return r.length===e.length&&r.every(((n,s)=>t(n,e[s])))}function Vg(r){return r+"\0"}/**
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
 */class Re{constructor(e,t){this.comparator=e,this.root=t||Bt.EMPTY}insert(e,t){return new Re(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Bt.BLACK,null,null))}remove(e){return new Re(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Bt.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(n===0)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const s=this.comparator(e,n.key);if(s===0)return t+n.left.size;s<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,n)=>(e(t,n),!1)))}toString(){const e=[];return this.inorderTraversal(((t,n)=>(e.push(`${t}:${n}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new iu(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new iu(this.root,e,this.comparator,!1)}getReverseIterator(){return new iu(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new iu(this.root,e,this.comparator,!0)}}class iu{constructor(e,t,n,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?n(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Bt{constructor(e,t,n,s,i){this.key=e,this.value=t,this.color=n??Bt.RED,this.left=s??Bt.EMPTY,this.right=i??Bt.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,s,i){return new Bt(e??this.key,t??this.value,n??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let s=this;const i=n(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,n),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,n)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Bt.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Bt.EMPTY;n=s.right.min(),s=s.copy(n.key,n.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Bt.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Bt.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw Y(43730,{key:this.key,value:this.value});if(this.right.isRed())throw Y(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw Y(27949);return e+(this.isRed()?0:1)}}Bt.EMPTY=null,Bt.RED=!0,Bt.BLACK=!1;Bt.EMPTY=new class{constructor(){this.size=0}get key(){throw Y(57766)}get value(){throw Y(16141)}get color(){throw Y(16727)}get left(){throw Y(29726)}get right(){throw Y(36894)}copy(e,t,n,s,i){return this}insert(e,t,n){return new Bt(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class De{constructor(e){this.comparator=e,this.data=new Re(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,n)=>(e(t),!1)))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const s=n.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let n;for(n=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new hC(this.data.getIterator())}getIteratorFrom(e){return new hC(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((n=>{t=t.add(n)})),t}isEqual(e){if(!(e instanceof De)||this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new De(this.comparator);return t.data=e,t}}class hC{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function xs(r){return r.hasNext()?r.getNext():void 0}/**
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
 */const S={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class M extends In{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */const on="__name__";class rn{constructor(e,t,n){t===void 0?t=0:t>e.length&&Y(637,{offset:t,range:e.length}),n===void 0?n=e.length-t:n>e.length-t&&Y(1746,{length:n,range:e.length-t}),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return rn.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof rn?e.forEach((n=>{t.push(n)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let s=0;s<n;s++){const i=rn.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return oe(e.length,t.length)}static compareSegments(e,t){const n=rn.isNumericId(e),s=rn.isNumericId(t);return n&&!s?-1:!n&&s?1:n&&s?rn.extractNumericId(e).compare(rn.extractNumericId(t)):$l(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return pr.fromString(e.substring(4,e.length-2))}}class ue extends rn{construct(e,t,n){return new ue(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new M(S.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter((s=>s.length>0)))}return new ue(t)}static emptyPath(){return new ue([])}}const qw=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let Je=class Qs extends rn{construct(e,t,n){return new Qs(e,t,n)}static isValidIdentifier(e){return qw.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Qs.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===on}static keyField(){return new Qs([on])}static fromServerFormat(e){const t=[];let n="",s=0;const i=()=>{if(n.length===0)throw new M(S.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let o=!1;for(;s<e.length;){const a=e[s];if(a==="\\"){if(s+1===e.length)throw new M(S.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new M(S.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=u,s+=2}else a==="`"?(o=!o,s++):a!=="."||o?(n+=a,s++):(i(),s++)}if(i(),o)throw new M(S.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Qs(t)}static emptyPath(){return new Qs([])}};/**
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
 */class St{constructor(e){this.fields=e,e.sort(Je.comparator)}static empty(){return new St([])}unionWith(e){let t=new De(Je.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new St(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return ii(this.fields,e.fields,((t,n)=>t.isEqual(n)))}}/**
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
 */function Nu(r){let e=0;for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e++;return e}function Fr(r,e){for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e(t,r[t])}function MB(r,e){const t=[];for(const n in r)Object.prototype.hasOwnProperty.call(r,n)&&t.push(e(r[n],n,r));return t}function kg(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}/**
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
 */class K{constructor(e){this.path=e}static fromPath(e){return new K(ue.fromString(e))}static fromName(e){return new K(ue.fromString(e).popFirst(5))}static empty(){return new K(ue.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ue.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ue.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new K(new ue(e.slice()))}}/**
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
 */function GB(r,e,t){if(!t)throw new M(S.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${e}.`)}function xg(r,e,t,n){if(e===!0&&n===!0)throw new M(S.INVALID_ARGUMENT,`${r} and ${t} cannot be used together.`)}function dC(r){if(!K.isDocumentKey(r))throw new M(S.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function fC(r){if(K.isDocumentKey(r))throw new M(S.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`)}function ga(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}function oc(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const e=(function(n){return n.constructor?n.constructor.name:null})(r);return e?`a custom ${e} object`:"an object"}}return typeof r=="function"?"a function":Y(12329,{type:typeof r})}function Be(r,e){if("_delegate"in r&&(r=r._delegate),!(r instanceof e)){if(e.name===r.constructor.name)throw new M(S.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=oc(r);throw new M(S.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return r}function Mg(r,e){if(e<=0)throw new M(S.INVALID_ARGUMENT,`Function ${r}() requires a positive number, but it was: ${e}.`)}/**
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
 */function Ye(r,e){const t={typeString:r};return e&&(t.value=e),t}function ws(r,e){if(!ga(r))throw new M(S.INVALID_ARGUMENT,"JSON must be an object");let t;for(const n in e)if(e[n]){const s=e[n].typeString,i="value"in e[n]?{value:e[n].value}:void 0;if(!(n in r)){t=`JSON missing required field: '${n}'`;break}const o=r[n];if(s&&typeof o!==s){t=`JSON field '${n}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${n}' field to equal '${i.value}'`;break}}if(t)throw new M(S.INVALID_ARGUMENT,t);return!0}/**
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
 */const CC=-62135596800,pC=1e6;class Ee{static now(){return Ee.fromMillis(Date.now())}static fromDate(e){return Ee.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor((e-1e3*t)*pC);return new Ee(t,n)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new M(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new M(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<CC)throw new M(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new M(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/pC}_compareTo(e){return this.seconds===e.seconds?oe(this.nanoseconds,e.nanoseconds):oe(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:Ee._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(ws(e,Ee._jsonSchema))return new Ee(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-CC;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}Ee._jsonSchemaVersion="firestore/timestamp/1.0",Ee._jsonSchema={type:Ye("string",Ee._jsonSchemaVersion),seconds:Ye("number"),nanoseconds:Ye("number")};/**
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
 */class Gg extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */function jw(){return typeof atob<"u"}/**
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
 */class Se{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Gg("Invalid base64 string: "+i):i}})(e);return new Se(t)}static fromUint8Array(e){const t=(function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i})(e);return new Se(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return oe(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Se.EMPTY_BYTE_STRING=new Se("");const Jw=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function xn(r){if(q(!!r,39018),typeof r=="string"){let e=0;const t=Jw.exec(r);if(q(!!t,46558,{timestamp:r}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const n=new Date(r);return{seconds:Math.floor(n.getTime()/1e3),nanos:e}}return{seconds:be(r.seconds),nanos:be(r.nanos)}}function be(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function Mn(r){return typeof r=="string"?Se.fromBase64String(r):Se.fromUint8Array(r)}/**
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
 */const Ug="server_timestamp",Hg="__type__",qg="__previous_value__",jg="__local_write_time__";function ma(r){var t,n;return((n=(((t=r==null?void 0:r.mapValue)==null?void 0:t.fields)||{})[Hg])==null?void 0:n.stringValue)===Ug}function _a(r){const e=r.mapValue.fields[qg];return ma(e)?_a(e):e}function oi(r){const e=xn(r.mapValue.fields[jg].timestampValue);return new Ee(e.seconds,e.nanos)}/**
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
 */class Kw{constructor(e,t,n,s,i,o,a,u,l,B,d,C,g){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=a,this.longPollingOptions=u,this.useFetchStreams=l,this.isUsingEmulator=B,this.apiKey=d,this._customHeaders=C,this.grpcFlowControlWindow=g}}const Yo="(default)";class wr{constructor(e,t){this.projectId=e,this.database=t||Yo}static empty(){return new wr("","")}get isDefaultDatabase(){return this.database===Yo}isEqual(e){return e instanceof wr&&e.projectId===this.projectId&&e.database===this.database}}function zw(r,e){if(!Object.prototype.hasOwnProperty.apply(r.options,["projectId"]))throw new M(S.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new wr(r.options.projectId,e)}/**
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
 */const gr=-1;function Ea(r){return r==null}function ai(r){return r===0&&1/r==-1/0}function Jg(r){return typeof r=="number"&&Number.isInteger(r)&&!ai(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}function Qw(r){return typeof r=="string"}/**
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
 */const UB="__type__",Kg="__max__",hr={mapValue:{fields:{__type__:{stringValue:Kg}}}},HB="__vector__",fs="value",fn={nullValue:"NULL_VALUE"},Lt={booleanValue:!0},ut={booleanValue:!1};function Xe(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?ma(r)?4:zg(r)?9007199254740991:ps(r)?10:11:Y(28295,{value:r})}function zt(r,e,t){if(r===e)return!0;const n=Xe(r);if(n!==Xe(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===e.booleanValue;case 4:return oi(r).isEqual(oi(e));case 3:return(function(i,o){if(typeof i.timestampValue=="string"&&typeof o.timestampValue=="string"&&i.timestampValue.length===o.timestampValue.length)return i.timestampValue===o.timestampValue;const a=xn(i.timestampValue),u=xn(o.timestampValue);return a.seconds===u.seconds&&a.nanos===u.nanos})(r,e);case 5:return r.stringValue===e.stringValue;case 6:return(function(i,o){return Mn(i.bytesValue).isEqual(Mn(o.bytesValue))})(r,e);case 7:return r.referenceValue===e.referenceValue;case 8:return(function(i,o){return be(i.geoPointValue.latitude)===be(o.geoPointValue.latitude)&&be(i.geoPointValue.longitude)===be(o.geoPointValue.longitude)})(r,e);case 2:return(function(i,o,a){if("integerValue"in i&&"integerValue"in o)return be(i.integerValue)===be(o.integerValue);let u,l;if("doubleValue"in i&&"doubleValue"in o)u=be(i.doubleValue),l=be(o.doubleValue);else{if(!(a!=null&&a.t))return!1;u=be(i.integerValue??i.doubleValue),l=be(o.integerValue??o.doubleValue)}return u===l?!!(a!=null&&a.i)||ai(u)===ai(l):!!(a===void 0||a.o)&&isNaN(u)&&isNaN(l)})(r,e,t);case 9:return ii(r.arrayValue.values||[],e.arrayValue.values||[],((s,i)=>zt(s,i,t)));case 10:case 11:return(function(i,o,a){const u=i.mapValue.fields||{},l=o.mapValue.fields||{};if(Nu(u)!==Nu(l))return!1;for(const B in u)if(u.hasOwnProperty(B)&&(l[B]===void 0||!zt(u[B],l[B],a)))return!1;return!0})(r,e,t);default:return Y(52216,{left:r})}}function Xo(r,e){return(r.values||[]).find((t=>zt(t,e)))!==void 0}function _t(r,e){if(r===e)return 0;const t=Xe(r),n=Xe(e);if(t!==n)return oe(t,n);switch(t){case 0:case 9007199254740991:return 0;case 1:return oe(r.booleanValue,e.booleanValue);case 2:return(function(i,o){const a=be(i.integerValue||i.doubleValue),u=be(o.integerValue||o.doubleValue);return a<u?-1:a>u?1:a===u?0:isNaN(a)?isNaN(u)?0:-1:1})(r,e);case 3:return gC(r.timestampValue,e.timestampValue);case 4:return gC(oi(r),oi(e));case 5:return $l(r.stringValue,e.stringValue);case 6:return(function(i,o){const a=Mn(i),u=Mn(o);return a.compareTo(u)})(r.bytesValue,e.bytesValue);case 7:return(function(i,o){const a=i.split("/"),u=o.split("/");for(let l=0;l<a.length&&l<u.length;l++){const B=oe(a[l],u[l]);if(B!==0)return B}return oe(a.length,u.length)})(r.referenceValue,e.referenceValue);case 8:return(function(i,o){const a=oe(be(i.latitude),be(o.latitude));return a!==0?a:oe(be(i.longitude),be(o.longitude))})(r.geoPointValue,e.geoPointValue);case 9:return mC(r.arrayValue,e.arrayValue);case 10:return(function(i,o){var C,g,D,N;const a=i.fields||{},u=o.fields||{},l=(C=a[fs])==null?void 0:C.arrayValue,B=(g=u[fs])==null?void 0:g.arrayValue,d=oe(((D=l==null?void 0:l.values)==null?void 0:D.length)||0,((N=B==null?void 0:B.values)==null?void 0:N.length)||0);return d!==0?d:mC(l,B)})(r.mapValue,e.mapValue);case 11:return(function(i,o){if(i===hr.mapValue&&o===hr.mapValue)return 0;if(i===hr.mapValue)return 1;if(o===hr.mapValue)return-1;const a=i.fields||{},u=Object.keys(a),l=o.fields||{},B=Object.keys(l);u.sort(),B.sort();for(let d=0;d<u.length&&d<B.length;++d){const C=$l(u[d],B[d]);if(C!==0)return C;const g=_t(a[u[d]],l[B[d]]);if(g!==0)return g}return oe(u.length,B.length)})(r.mapValue,e.mapValue);default:throw Y(23264,{u:t})}}function gC(r,e){if(typeof r=="string"&&typeof e=="string"&&r.length===e.length)return oe(r,e);const t=xn(r),n=xn(e),s=oe(t.seconds,n.seconds);return s!==0?s:oe(t.nanos,n.nanos)}function mC(r,e){const t=r.values||[],n=e.values||[];for(let s=0;s<t.length&&s<n.length;++s){const i=_t(t[s],n[s]);if(i!==void 0&&i!==0)return i}return oe(t.length,n.length)}function ui(r){return Yl(r)}function Yl(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?(function(t){const n=xn(t);return`time(${n.seconds},${n.nanos})`})(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?(function(t){return Mn(t).toBase64()})(r.bytesValue):"referenceValue"in r?(function(t){return K.fromName(t).toString()})(r.referenceValue):"geoPointValue"in r?(function(t){return`geo(${t.latitude},${t.longitude})`})(r.geoPointValue):"arrayValue"in r?(function(t){let n="[",s=!0;for(const i of t.values||[])s?s=!1:n+=",",n+=Yl(i);return n+"]"})(r.arrayValue):"mapValue"in r?(function(t){const n=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of n)i?i=!1:s+=",",s+=`${o}:${Yl(t.fields[o])}`;return s+"}"})(r.mapValue):Y(61005,{value:r})}function gu(r){switch(Xe(r)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=_a(r);return e?16+gu(e):16;case 5:return 2*r.stringValue.length;case 6:return Mn(r.bytesValue).approximateByteSize();case 7:return r.referenceValue.length;case 9:return(function(n){return(n.values||[]).reduce(((s,i)=>s+gu(i)),0)})(r.arrayValue);case 10:case 11:return(function(n){let s=0;return Fr(n.fields,((i,o)=>{s+=i.length+gu(o)})),s})(r.mapValue);default:throw Y(13486,{value:r})}}function Cs(r,e){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${e.path.canonicalString()}`}}function an(r){return!!r&&"integerValue"in r}function rs(r){return!!r&&"doubleValue"in r}function Tr(r){return an(r)||rs(r)}function Ar(r){return!!r&&"arrayValue"in r}function Ht(r){return!!r&&"nullValue"in r}function Vt(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function as(r){return!!r&&"mapValue"in r}function ps(r){var t,n;return((n=(((t=r==null?void 0:r.mapValue)==null?void 0:t.fields)||{})[UB])==null?void 0:n.stringValue)===HB}function Xl(r){var e,t;return(t=(((e=r==null?void 0:r.mapValue)==null?void 0:e.fields)||{})[fs])==null?void 0:t.arrayValue}function So(r){if(r.geoPointValue)return{geoPointValue:{...r.geoPointValue}};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:{...r.timestampValue}};if(r.mapValue){const e={mapValue:{fields:{}}};return Fr(r.mapValue.fields,((t,n)=>e.mapValue.fields[t]=So(n))),e}if(r.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(r.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=So(r.arrayValue.values[t]);return e}return{...r}}function zg(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue===Kg}const Qg={mapValue:{fields:{[UB]:{stringValue:HB},[fs]:{arrayValue:{}}}}};function Ww(r){return"nullValue"in r?fn:"booleanValue"in r?{booleanValue:!1}:"integerValue"in r||"doubleValue"in r?{doubleValue:NaN}:"timestampValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in r?{stringValue:""}:"bytesValue"in r?{bytesValue:""}:"referenceValue"in r?Cs(wr.empty(),K.empty()):"geoPointValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in r?{arrayValue:{}}:"mapValue"in r?ps(r)?Qg:{mapValue:{}}:Y(35942,{value:r})}function $w(r){return"nullValue"in r?{booleanValue:!1}:"booleanValue"in r?{doubleValue:NaN}:"integerValue"in r||"doubleValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in r?{stringValue:""}:"stringValue"in r?{bytesValue:""}:"bytesValue"in r?Cs(wr.empty(),K.empty()):"referenceValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in r?{arrayValue:{}}:"arrayValue"in r?Qg:"mapValue"in r?ps(r)?{mapValue:{}}:hr:Y(61959,{value:r})}function _C(r,e){const t=_t(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?-1:!r.inclusive&&e.inclusive?1:0}function EC(r,e){const t=_t(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?1:!r.inclusive&&e.inclusive?-1:0}/**
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
 */class et{constructor(e){this.value=e}static empty(){return new et({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!as(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=So(t)}setAll(e){let t=Je.emptyPath(),n={},s=[];e.forEach(((o,a)=>{if(!t.isImmediateParentOf(a)){const u=this.getFieldsMap(t);this.applyChanges(u,n,s),n={},s=[],t=a.popLast()}o?n[a.lastSegment()]=So(o):s.push(a.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,n,s)}delete(e){const t=this.field(e.popLast());as(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return zt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let s=t.mapValue.fields[e.get(n)];as(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,n){Fr(t,((s,i)=>e[s]=i));for(const s of n)delete e[s]}clone(){return new et(So(this.value))}}function Wg(r){const e=[];return Fr(r.fields,((t,n)=>{const s=new Je([t]);if(as(n)){const i=Wg(n.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)})),new St(e)}/**
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
 */function ac(r,e){if(r.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:ai(e)?"-0":e}}function qB(r){return{integerValue:""+r}}function Fi(r,e,t){return Jg(e)?qB(e):ac(r,e)}/**
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
 */class uc{constructor(){this._=void 0}}function Yw(r,e,t){return r instanceof ci?(function(s,i){const o={fields:{[Hg]:{stringValue:Ug},[jg]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&ma(i)&&(i=_a(i)),i&&(o.fields[qg]=i),{mapValue:o}})(t,e):r instanceof gs?Yg(r,e):r instanceof ms?Xg(r,e):r instanceof _s?(function(s,i){const o=$g(s,i),a=Ou(o)+Ou(s.l);return an(o)&&an(s.l)?qB(a):ac(s.serializer,a)})(r,e):r instanceof li?(function(s,i){return IC(s,i,Math.min)})(r,e):r instanceof Bi?(function(s,i){return IC(s,i,Math.max)})(r,e):void 0}function Xw(r,e,t){return r instanceof gs?Yg(r,e):r instanceof ms?Xg(r,e):t}function $g(r,e){return r instanceof _s?Tr(e)?e:{integerValue:0}:null}class ci extends uc{}class gs extends uc{constructor(e){super(),this.elements=e}}function Yg(r,e){const t=Zg(e);for(const n of r.elements)t.some((s=>zt(s,n)))||t.push(n);return{arrayValue:{values:t}}}class ms extends uc{constructor(e){super(),this.elements=e}}function Xg(r,e){let t=Zg(e);for(const n of r.elements)t=t.filter((s=>!zt(s,n)));return{arrayValue:{values:t}}}class jB extends uc{constructor(e,t){super(),this.serializer=e,this.l=t}}class _s extends jB{}class li extends jB{}class Bi extends jB{}function IC(r,e,t){if(!Tr(e))return r.l;const n=t(Ou(e),Ou(r.l));return an(e)&&an(r.l)?qB(n):ac(r.serializer,n)}function Ou(r){return be(r.integerValue||r.doubleValue)}function Zg(r){return Ar(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
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
 */class Ts{constructor(e,t){this.field=e,this.transform=t}}function Zw(r,e){return r.field.isEqual(e.field)&&(function(n,s){return n instanceof gs&&s instanceof gs||n instanceof ms&&s instanceof ms?ii(n.elements,s.elements,zt):n instanceof _s&&s instanceof _s||n instanceof li&&s instanceof li||n instanceof Bi&&s instanceof Bi?zt(n.l,s.l):n instanceof ci&&s instanceof ci})(r.transform,e.transform)}class eT{constructor(e,t){this.version=e,this.transformResults=t}}class Me{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Me}static exists(e){return new Me(void 0,e)}static updateTime(e){return new Me(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function mu(r,e){return r.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(r.updateTime):r.exists===void 0||r.exists===e.isFoundDocument()}class cc{}function em(r,e){if(!r.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return r.isNoDocument()?new Vi(r.key,Me.none()):new Li(r.key,r.data,Me.none());{const t=r.data,n=et.empty();let s=new De(Je.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?n.delete(i):n.set(i,o),s=s.add(i)}return new jn(r.key,n,new St(s.toArray()),Me.none())}}function tT(r,e,t){r instanceof Li?(function(s,i,o){const a=s.value.clone(),u=yC(s.fieldTransforms,i,o.transformResults);a.setAll(u),i.convertToFoundDocument(o.version,a).setHasCommittedMutations()})(r,e,t):r instanceof jn?(function(s,i,o){if(!mu(s.precondition,i))return void i.convertToUnknownDocument(o.version);const a=yC(s.fieldTransforms,i,o.transformResults),u=i.data;u.setAll(tm(s)),u.setAll(a),i.convertToFoundDocument(o.version,u).setHasCommittedMutations()})(r,e,t):(function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()})(0,e,t)}function No(r,e,t,n){return r instanceof Li?(function(i,o,a,u){if(!mu(i.precondition,o))return a;const l=i.value.clone(),B=wC(i.fieldTransforms,u,o);return l.setAll(B),o.convertToFoundDocument(o.version,l).setHasLocalMutations(),null})(r,e,t,n):r instanceof jn?(function(i,o,a,u){if(!mu(i.precondition,o))return a;const l=wC(i.fieldTransforms,u,o),B=o.data;return B.setAll(tm(i)),B.setAll(l),o.convertToFoundDocument(o.version,B).setHasLocalMutations(),a===null?null:a.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((d=>d.field)))})(r,e,t,n):(function(i,o,a){return mu(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):a})(r,e,t)}function nT(r,e){let t=null;for(const n of r.fieldTransforms){const s=e.data.field(n.field),i=$g(n.transform,s||null);i!=null&&(t===null&&(t=et.empty()),t.set(n.field,i))}return t||null}function DC(r,e){return r.type===e.type&&!!r.key.isEqual(e.key)&&!!r.precondition.isEqual(e.precondition)&&!!(function(n,s){return n===void 0&&s===void 0||!(!n||!s)&&ii(n,s,((i,o)=>Zw(i,o)))})(r.fieldTransforms,e.fieldTransforms)&&(r.type===0?r.value.isEqual(e.value):r.type!==1||r.data.isEqual(e.data)&&r.fieldMask.isEqual(e.fieldMask))}class Li extends cc{constructor(e,t,n,s=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class jn extends cc{constructor(e,t,n,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function tm(r){const e=new Map;return r.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const n=r.data.field(t);e.set(t,n)}})),e}function yC(r,e,t){const n=new Map;q(r.length===t.length,32656,{h:t.length,T:r.length});for(let s=0;s<t.length;s++){const i=r[s],o=i.transform,a=e.data.field(i.field);n.set(i.field,Xw(o,a,t[s]))}return n}function wC(r,e,t){const n=new Map;for(const s of r){const i=s.transform,o=t.data.field(s.field);n.set(s.field,Yw(i,o,e))}return n}class Vi extends cc{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class JB extends cc{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class nm{constructor(e,t,n){this.alias=e,this.aggregateType=t,this.fieldPath=n}}/**
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
 */class vr{constructor(e,t){this.position=e,this.inclusive=t}}function TC(r,e,t){let n=0;for(let s=0;s<r.position.length;s++){const i=e[s],o=r.position[s];if(i.field.isKeyField()?n=K.comparator(K.fromName(o.referenceValue),t.key):n=_t(o,t.data.field(i.field)),i.dir==="desc"&&(n*=-1),n!==0)break}return n}function AC(r,e){if(r===null)return e===null;if(e===null||r.inclusive!==e.inclusive||r.position.length!==e.position.length)return!1;for(let t=0;t<r.position.length;t++)if(!zt(r.position[t],e.position[t]))return!1;return!0}/**
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
 */class rm{}class fe extends rm{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,n):new rT(e,t,n):t==="array-contains"?new oT(e,n):t==="in"?new cm(e,n):t==="not-in"?new aT(e,n):t==="array-contains-any"?new uT(e,n):new fe(e,t,n)}static createKeyFieldInFilter(e,t,n){return t==="in"?new sT(e,n):new iT(e,n)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(_t(t,this.value)):t!==null&&Xe(this.value)===Xe(t)&&this.matchesComparison(_t(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return Y(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class ye extends rm{constructor(e,t){super(),this.filters=e,this.op=t,this.P=null}static create(e,t){return new ye(e,t)}matches(e){return hi(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.P!==null||(this.P=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.P}getFilters(){return Object.assign([],this.filters)}}function hi(r){return r.op==="and"}function Zl(r){return r.op==="or"}function KB(r){return sm(r)&&hi(r)}function sm(r){for(const e of r.filters)if(e instanceof ye)return!1;return!0}function eB(r){if(r instanceof fe)return r.field.canonicalString()+r.op.toString()+ui(r.value);if(KB(r))return r.filters.map((e=>eB(e))).join(",");{const e=r.filters.map((t=>eB(t))).join(",");return`${r.op}(${e})`}}function im(r,e){return r instanceof fe?(function(n,s){return s instanceof fe&&n.op===s.op&&n.field.isEqual(s.field)&&zt(n.value,s.value)})(r,e):r instanceof ye?(function(n,s){return s instanceof ye&&n.op===s.op&&n.filters.length===s.filters.length?n.filters.reduce(((i,o,a)=>i&&im(o,s.filters[a])),!0):!1})(r,e):void Y(19439)}function om(r,e){const t=r.filters.concat(e);return ye.create(t,r.op)}function am(r){return r instanceof fe?(function(t){return`${t.field.canonicalString()} ${t.op} ${ui(t.value)}`})(r):r instanceof ye?(function(t){return t.op.toString()+" {"+t.getFilters().map(am).join(" ,")+"}"})(r):"Filter"}class rT extends fe{constructor(e,t,n){super(e,t,n),this.key=K.fromName(n.referenceValue)}matches(e){const t=K.comparator(e.key,this.key);return this.matchesComparison(t)}}class sT extends fe{constructor(e,t){super(e,"in",t),this.keys=um("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class iT extends fe{constructor(e,t){super(e,"not-in",t),this.keys=um("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function um(r,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((n=>K.fromName(n.referenceValue)))}class oT extends fe{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Ar(t)&&Xo(t.arrayValue,this.value)}}class cm extends fe{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Xo(this.value.arrayValue,t)}}class aT extends fe{constructor(e,t){super(e,"not-in",t)}matches(e){if(Xo(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Xo(this.value.arrayValue,t)}}class uT extends fe{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Ar(t)||!t.arrayValue.values)&&t.arrayValue.values.some((n=>Xo(this.value.arrayValue,n)))}}/**
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
 */class Zo{constructor(e,t="asc"){this.field=e,this.dir=t}}function cT(r,e){return r.dir===e.dir&&r.field.isEqual(e.field)}/**
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
 */class ee{static fromTimestamp(e){return new ee(e)}static min(){return new ee(new Ee(0,0))}static max(){return new ee(new Ee(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */class Le{constructor(e,t,n,s,i,o,a){this.key=e,this.documentType=t,this.version=n,this.readTime=s,this.createTime=i,this.data=o,this.documentState=a}static newInvalidDocument(e){return new Le(e,0,ee.min(),ee.min(),ee.min(),et.empty(),0)}static newFoundDocument(e,t,n,s){return new Le(e,1,t,ee.min(),n,s,0)}static newNoDocument(e,t){return new Le(e,2,t,ee.min(),ee.min(),et.empty(),0)}static newUnknownDocument(e,t){return new Le(e,3,t,ee.min(),ee.min(),et.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(ee.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=et.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=et.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=ee.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Le&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Le(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */const di=-1;class fi{constructor(e,t,n,s){this.indexId=e,this.collectionGroup=t,this.fields=n,this.indexState=s}}function tB(r){return r.fields.find((e=>e.kind===2))}function Wr(r){return r.fields.filter((e=>e.kind!==2))}function lT(r,e){let t=oe(r.collectionGroup,e.collectionGroup);if(t!==0)return t;for(let n=0;n<Math.min(r.fields.length,e.fields.length);++n)if(t=BT(r.fields[n],e.fields[n]),t!==0)return t;return oe(r.fields.length,e.fields.length)}fi.UNKNOWN_ID=-1;class us{constructor(e,t){this.fieldPath=e,this.kind=t}}function BT(r,e){const t=Je.comparator(r.fieldPath,e.fieldPath);return t!==0?t:oe(r.kind,e.kind)}class Ci{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new Ci(0,qt.min())}}function lm(r,e){const t=r.toTimestamp().seconds,n=r.toTimestamp().nanoseconds+1,s=ee.fromTimestamp(n===1e9?new Ee(t+1,0):new Ee(t,n));return new qt(s,K.empty(),e)}function Bm(r){return new qt(r.readTime,r.key,di)}class qt{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new qt(ee.min(),K.empty(),di)}static max(){return new qt(ee.max(),K.empty(),di)}}function zB(r,e){let t=r.readTime.compareTo(e.readTime);return t!==0?t:(t=K.comparator(r.documentKey,e.documentKey),t!==0?t:oe(r.largestBatchId,e.largestBatchId))}/**
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
 */class hT{constructor(e,t=null,n=[],s=[],i=null,o=null,a=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=s,this.limit=i,this.startAt=o,this.endAt=a,this.R=null}}function nB(r,e=null,t=[],n=[],s=null,i=null,o=null){return new hT(r,e,t,n,s,i,o)}function Fu(r){const e=W(r);if(e.R===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((n=>eB(n))).join(","),t+="|ob:",t+=e.orderBy.map((n=>(function(i){return i.field.canonicalString()+i.dir})(n))).join(","),Ea(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((n=>ui(n))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((n=>ui(n))).join(",")),e.R=t}return e.R}function QB(r,e){if(r.limit!==e.limit||r.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<r.orderBy.length;t++)if(!cT(r.orderBy[t],e.orderBy[t]))return!1;if(r.filters.length!==e.filters.length)return!1;for(let t=0;t<r.filters.length;t++)if(!im(r.filters[t],e.filters[t]))return!1;return r.collectionGroup===e.collectionGroup&&!!r.path.isEqual(e.path)&&!!AC(r.startAt,e.startAt)&&AC(r.endAt,e.endAt)}function wn(r){return!!r.isCorePipeline}function WB(r){return!!r.path&&K.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function Lu(r,e){return r.filters.filter((t=>t instanceof fe&&t.field.isEqual(e)))}function vC(r,e,t){let n=fn,s=!0;for(const i of Lu(r,e)){let o=fn,a=!0;switch(i.op){case"<":case"<=":o=Ww(i.value);break;case"==":case"in":case">=":o=i.value;break;case">":o=i.value,a=!1;break;case"!=":case"not-in":o=fn}_C({value:n,inclusive:s},{value:o,inclusive:a})<0&&(n=o,s=a)}if(t!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(e)){const o=t.position[i];_C({value:n,inclusive:s},{value:o,inclusive:t.inclusive})<0&&(n=o,s=t.inclusive);break}}return{value:n,inclusive:s}}function RC(r,e,t){let n=hr,s=!0;for(const i of Lu(r,e)){let o=hr,a=!0;switch(i.op){case">=":case">":o=$w(i.value),a=!1;break;case"==":case"in":case"<=":o=i.value;break;case"<":o=i.value,a=!1;break;case"!=":case"not-in":o=hr}EC({value:n,inclusive:s},{value:o,inclusive:a})>0&&(n=o,s=a)}if(t!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(e)){const o=t.position[i];EC({value:n,inclusive:s},{value:o,inclusive:t.inclusive})>0&&(n=o,s=t.inclusive);break}}return{value:n,inclusive:s}}/**
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
 */class Jn{constructor(e,t=null,n=[],s=[],i=null,o="F",a=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=s,this.limit=i,this.limitType=o,this.startAt=a,this.endAt=u,this.I=null,this.A=null,this.V=null,this.startAt,this.endAt}}function hm(r,e,t,n,s,i,o,a){return new Jn(r,e,t,n,s,i,o,a)}function ki(r){return new Jn(r)}function PC(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function dT(r){return K.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function $B(r){return r.collectionGroup!==null}function Ys(r){const e=W(r);if(e.I===null){e.I=[];const t=new Set;for(const i of e.explicitOrderBy)e.I.push(i),t.add(i.field.canonicalString());const n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let a=new De(Je.comparator);return o.filters.forEach((u=>{u.getFlattenedFilters().forEach((l=>{l.isInequality()&&(a=a.add(l.field))}))})),a})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.I.push(new Zo(i,n))})),t.has(Je.keyField().canonicalString())||e.I.push(new Zo(Je.keyField(),n))}return e.I}function gt(r){const e=W(r);return e.A||(e.A=fm(e,Ys(r))),e.A}function dm(r){const e=W(r);return e.V||(e.V=fm(e,r.explicitOrderBy)),e.V}function fm(r,e){if(r.limitType==="F")return nB(r.path,r.collectionGroup,e,r.filters,r.limit,r.startAt,r.endAt);{e=e.map((s=>{const i=s.dir==="desc"?"asc":"desc";return new Zo(s.field,i)}));const t=r.endAt?new vr(r.endAt.position,r.endAt.inclusive):null,n=r.startAt?new vr(r.startAt.position,r.startAt.inclusive):null;return nB(r.path,r.collectionGroup,e,r.filters,r.limit,t,n)}}function rB(r,e){const t=r.filters.concat([e]);return new Jn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),t,r.limit,r.limitType,r.startAt,r.endAt)}function fT(r,e){const t=r.explicitOrderBy.concat([e]);return new Jn(r.path,r.collectionGroup,t,r.filters.slice(),r.limit,r.limitType,r.startAt,r.endAt)}function Vu(r,e,t){return new Jn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),e,t,r.startAt,r.endAt)}function CT(r,e){return new Jn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),r.limit,r.limitType,e,r.endAt)}function pT(r,e){return new Jn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),r.limit,r.limitType,r.startAt,e)}function Cm(r,e){return QB(gt(r),gt(e))&&r.limitType===e.limitType}function Oo(r){return`Query(target=${(function(t){let n=t.path.canonicalString();return t.collectionGroup!==null&&(n+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(n+=`, filters: [${t.filters.map((s=>am(s))).join(", ")}]`),Ea(t.limit)||(n+=", limit: "+t.limit),t.orderBy.length>0&&(n+=`, orderBy: [${t.orderBy.map((s=>(function(o){return`${o.field.canonicalString()} (${o.dir})`})(s))).join(", ")}]`),t.startAt&&(n+=", startAt: ",n+=t.startAt.inclusive?"b:":"a:",n+=t.startAt.position.map((s=>ui(s))).join(",")),t.endAt&&(n+=", endAt: ",n+=t.endAt.inclusive?"a:":"b:",n+=t.endAt.position.map((s=>ui(s))).join(",")),`Target(${n})`})(gt(r))}; limitType=${r.limitType})`}function lc(r,e){return e.isFoundDocument()&&(function(n,s){const i=s.key.path;return n.collectionGroup!==null?s.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(i):K.isDocumentKey(n.path)?n.path.isEqual(i):n.path.isImmediateParentOf(i)})(r,e)&&(function(n,s){for(const i of Ys(n))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0})(r,e)&&(function(n,s){for(const i of n.filters)if(!i.matches(s))return!1;return!0})(r,e)&&(function(n,s){return!(n.startAt&&!(function(o,a,u){const l=TC(o,a,u);return o.inclusive?l<=0:l<0})(n.startAt,Ys(n),s)||n.endAt&&!(function(o,a,u){const l=TC(o,a,u);return o.inclusive?l>=0:l>0})(n.endAt,Ys(n),s))})(r,e)}function Bc(r){return(e,t)=>{let n=!1;for(const s of Ys(r)){const i=gT(s,e,t);if(i!==0)return i;n=n||s.field.isKeyField()}return 0}}function gT(r,e,t){const n=r.field.isKeyField()?K.comparator(e.key,t.key):(function(i,o,a){const u=o.data.field(i),l=a.data.field(i);return u!==null&&l!==null?_t(u,l):Y(42886)})(r.field,e,t);switch(r.dir){case"asc":return n;case"desc":return-1*n;default:return Y(19790,{direction:r.dir})}}/**
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
 */class mT{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var ze,ge;function pm(r){switch(r){case S.OK:return Y(64938);case S.CANCELLED:case S.UNKNOWN:case S.DEADLINE_EXCEEDED:case S.RESOURCE_EXHAUSTED:case S.INTERNAL:case S.UNAVAILABLE:case S.UNAUTHENTICATED:return!1;case S.INVALID_ARGUMENT:case S.NOT_FOUND:case S.ALREADY_EXISTS:case S.PERMISSION_DENIED:case S.FAILED_PRECONDITION:case S.ABORTED:case S.OUT_OF_RANGE:case S.UNIMPLEMENTED:case S.DATA_LOSS:return!0;default:return Y(15467,{code:r})}}function gm(r){if(r===void 0)return je("GRPC error has no .code"),S.UNKNOWN;switch(r){case ze.OK:return S.OK;case ze.CANCELLED:return S.CANCELLED;case ze.UNKNOWN:return S.UNKNOWN;case ze.DEADLINE_EXCEEDED:return S.DEADLINE_EXCEEDED;case ze.RESOURCE_EXHAUSTED:return S.RESOURCE_EXHAUSTED;case ze.INTERNAL:return S.INTERNAL;case ze.UNAVAILABLE:return S.UNAVAILABLE;case ze.UNAUTHENTICATED:return S.UNAUTHENTICATED;case ze.INVALID_ARGUMENT:return S.INVALID_ARGUMENT;case ze.NOT_FOUND:return S.NOT_FOUND;case ze.ALREADY_EXISTS:return S.ALREADY_EXISTS;case ze.PERMISSION_DENIED:return S.PERMISSION_DENIED;case ze.FAILED_PRECONDITION:return S.FAILED_PRECONDITION;case ze.ABORTED:return S.ABORTED;case ze.OUT_OF_RANGE:return S.OUT_OF_RANGE;case ze.UNIMPLEMENTED:return S.UNIMPLEMENTED;case ze.DATA_LOSS:return S.DATA_LOSS;default:return Y(39323,{code:r})}}(ge=ze||(ze={}))[ge.OK=0]="OK",ge[ge.CANCELLED=1]="CANCELLED",ge[ge.UNKNOWN=2]="UNKNOWN",ge[ge.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ge[ge.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ge[ge.NOT_FOUND=5]="NOT_FOUND",ge[ge.ALREADY_EXISTS=6]="ALREADY_EXISTS",ge[ge.PERMISSION_DENIED=7]="PERMISSION_DENIED",ge[ge.UNAUTHENTICATED=16]="UNAUTHENTICATED",ge[ge.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ge[ge.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ge[ge.ABORTED=10]="ABORTED",ge[ge.OUT_OF_RANGE=11]="OUT_OF_RANGE",ge[ge.UNIMPLEMENTED=12]="UNIMPLEMENTED",ge[ge.INTERNAL=13]="INTERNAL",ge[ge.UNAVAILABLE=14]="UNAVAILABLE",ge[ge.DATA_LOSS=15]="DATA_LOSS";/**
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
 */class Kn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n!==void 0){for(const[s,i]of n)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const n=this.mapKeyFn(e),s=this.inner[n];if(s===void 0)return this.inner[n]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n===void 0)return!1;for(let s=0;s<n.length;s++)if(this.equalsFn(n[s][0],e))return n.length===1?delete this.inner[t]:n.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Fr(this.inner,((t,n)=>{for(const[s,i]of n)e(s,i)}))}isEmpty(){return kg(this.inner)}size(){return this.innerSize}}/**
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
 */const _T=new Re(K.comparator);function $e(){return _T}const mm=new Re(K.comparator);function Yr(...r){let e=mm;for(const t of r)e=e.insert(t.key,t);return e}function _m(r){let e=mm;return r.forEach(((t,n)=>e=e.insert(t,n.overlayedDocument))),e}function Kt(){return Fo()}function Em(){return Fo()}function Fo(){return new Kn((r=>r.toString()),((r,e)=>r.isEqual(e)))}const ET=new Re(K.comparator),IT=new De(K.comparator);function ae(...r){let e=IT;for(const t of r)e=e.add(t);return e}const DT=new De(oe);function YB(){return DT}/**
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
 */let Lo=null;function yT(r){if(Lo)throw new Error("a TestingHooksSpi instance is already set");Lo=r}/**
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
 */function Im(){return new TextEncoder}/**
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
 */const wT=new pr([4294967295,4294967295],0);function bC(r){const e=Im().encode(r),t=new yg;return t.update(e),new Uint8Array(t.digest())}function SC(r){const e=new DataView(r.buffer),t=e.getUint32(0,!0),n=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new pr([t,n],0),new pr([s,i],0)]}class XB{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new Ao(`Invalid padding: ${t}`);if(n<0)throw new Ao(`Invalid hash count: ${n}`);if(e.length>0&&this.hashCount===0)throw new Ao(`Invalid hash count: ${n}`);if(e.length===0&&t!==0)throw new Ao(`Invalid padding when bitmap length is 0: ${t}`);this.m=8*e.length-t,this.p=pr.fromNumber(this.m)}v(e,t,n){let s=e.add(t.multiply(pr.fromNumber(n)));return s.compare(wT)===1&&(s=new pr([s.getBits(0),s.getBits(1)],0)),s.modulo(this.p).toNumber()}S(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.m===0)return!1;const t=bC(e),[n,s]=SC(t);for(let i=0;i<this.hashCount;i++){const o=this.v(n,s,i);if(!this.S(o))return!1}return!0}static create(e,t,n){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new XB(i,s,t);return n.forEach((a=>o.insert(a))),o}insert(e){if(this.m===0)return;const t=bC(e),[n,s]=SC(t);for(let i=0;i<this.hashCount;i++){const o=this.v(n,s,i);this.D(o)}}D(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class Ao extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class xi{constructor(e,t,n,s,i,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const s=new Map;return s.set(e,Ia.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new xi(ee.min(),s,new Re(oe),$e(),$e(),ae())}}class Ia{constructor(e,t,n,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new Ia(n,t,ae(),ae(),ae())}}/**
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
 */class _u{constructor(e,t,n,s){this.C=e,this.removedTargetIds=t,this.key=n,this.F=s}}class Dm{constructor(e,t){this.targetId=e,this.O=t}}class ym{constructor(e,t,n=Se.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=s}}class NC{constructor(e){this.targetId=e,this.M=0,this.N=OC(),this.L=Se.EMPTY_BYTE_STRING,this.B=!1,this.U=!0}get current(){return this.B}get resumeToken(){return this.L}get k(){return this.M!==0}get q(){return this.U}$(e){e.approximateByteSize()>0&&(this.U=!0,this.L=e)}K(){let e=ae(),t=ae(),n=ae();return this.N.forEach(((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:n=n.add(s);break;default:Y(38017,{changeType:i})}})),new Ia(this.L,this.B,e,t,n)}W(){this.U=!1,this.N=OC()}G(e,t){this.U=!0,this.N=this.N.insert(e,t)}j(e){this.U=!0,this.N=this.N.remove(e)}H(){this.M+=1}J(){this.M-=1,q(this.M>=0,3241,{M:this.M,targetId:this.targetId})}Y(){this.U=!0,this.B=!0}}const po="WatchChangeAggregator";class TT{constructor(e){this.Z=e,this.X=new Map,this.ee=$e(),this.te=ou(),this.ne=$e(),this.re=ou(),this.ie=new Re(oe)}se(e){for(const t of e.C)e.F&&e.F.isFoundDocument()?this._e(t,e.F):this.oe(t,e.key,e.F);for(const t of e.removedTargetIds)this.oe(t,e.key,e.F)}ae(e){this.forEachTarget(e,(t=>{const n=this.X.get(t);if(n)switch(e.state){case 0:this.ue(t)&&n.$(e.resumeToken);break;case 1:n.J(),n.k||n.W(),n.$(e.resumeToken);break;case 2:n.J(),n.k||this.removeTarget(t);break;case 3:this.ue(t)&&(n.Y(),n.$(e.resumeToken));break;case 4:this.ue(t)&&(this.ce(t),n.$(e.resumeToken));break;default:Y(56790,{state:e.state})}else U(po,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.X.forEach(((n,s)=>{this.ue(s)&&t(s)}))}le(e){var t;return wn(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:WB(e)}Ee(e){const t=e.targetId,n=e.O.count,s=this.he(t);if(s){const i=s.target;if(this.le(i))if(n===0){const o=new K(wn(i)?ue.fromString(i.getPipelineDocuments()[0]):i.path);this.oe(t,o,Le.newNoDocument(o,ee.min()))}else q(n===1,20013,"Single document existence filter with count: "+n);else{const o=this.Te(t);if(o!==n){const a=this.Pe(e),u=a?this.Re(a,e,o):1;if(u!==0){this.ce(t);const l=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.ie=this.ie.insert(t,l)}Lo==null||Lo.Ie((function(B,d,C,g,D){var H,Z,re;const N={localCacheCount:B,existenceFilterCount:d.count,databaseId:C.database,projectId:C.projectId},V=d.unchangedNames;return V&&(N.bloomFilter={applied:D===0,hashCount:(V==null?void 0:V.hashCount)??0,bitmapLength:((Z=(H=V==null?void 0:V.bits)==null?void 0:H.bitmap)==null?void 0:Z.length)??0,padding:((re=V==null?void 0:V.bits)==null?void 0:re.padding)??0,mightContain:de=>(g==null?void 0:g.mightContain(de))??!1}),N})(o,e.O,this.Z.Ae(),a,u))}}}}Pe(e){const t=e.O.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:s=0},hashCount:i=0}=t;let o,a;try{o=Mn(n).toUint8Array()}catch(u){if(u instanceof Gg)return nt("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{a=new XB(o,s,i)}catch(u){return nt(u instanceof Ao?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return a.m===0?null:a}Re(e,t,n){return t.O.count===n-this.Ve(e,t.targetId)?0:2}Ve(e,t){const n=this.Z.getRemoteKeysForTarget(t);let s=0;return n.forEach((i=>{const o=this.Z.Ae(),a=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(a)||(this.oe(t,i,null),s++)})),s}de(e){const t=new Map;this.X.forEach(((i,o)=>{const a=this.he(o);if(a){if(i.current&&this.le(a.target)){const u=wn(a.target)?ue.fromString(a.target.getPipelineDocuments()[0]):a.target.path,l=new K(u);this.fe(l).has(o)||this.me(o,l)||this.oe(o,l,Le.newNoDocument(l,e))}i.q&&(t.set(o,i.K()),i.W())}}));let n=ae();this.re.forEach(((i,o)=>{let a=!0;o.forEachWhile((u=>{const l=this.he(u);return!l||l.purpose==="TargetPurposeLimboResolution"||(a=!1,!1)})),a&&(n=n.add(i))})),this.ee.forEach(((i,o)=>o.setReadTime(e))),this.ne.forEach(((i,o)=>o.setReadTime(e)));const s=new xi(e,t,this.ie,this.ee,this.ne,n);return this.ee=$e(),this.te=ou(),this.ne=$e(),this.re=ou(),this.ie=new Re(oe),s}_e(e,t){const n=this.X.get(e);if(!n||!this.ue(e))return void U(po,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.me(e,t.key)?2:0;n.G(t.key,s),wn(this.he(e).target)&&this.he(e).target.getPipelineFlavor()!=="exact"?this.ne=this.ne.insert(t.key,t):this.ee=this.ee.insert(t.key,t),this.te=this.te.insert(t.key,this.fe(t.key).add(e)),this.re=this.re.insert(t.key,this.pe(t.key).add(e))}oe(e,t,n){const s=this.X.get(e);s&&this.ue(e)?(this.me(e,t)?s.G(t,1):s.j(t),this.re=this.re.insert(t,this.pe(t).delete(e)),this.re=this.re.insert(t,this.pe(t).add(e)),n&&(wn(this.he(e).target)&&this.he(e).target.getPipelineFlavor()!=="exact"?this.ne=this.ne.insert(t,n):this.ee=this.ee.insert(t,n))):U(po,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.X.delete(e)}Te(e){const t=this.X.get(e);if(!t)return 0;const n=t.K();return this.Z.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}H(e){let t=this.X.get(e);t||(U(po,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new NC(e),this.X.set(e,t)),t.H()}pe(e){let t=this.re.get(e);return t||(t=new De(oe),this.re=this.re.insert(e,t)),t}fe(e){let t=this.te.get(e);return t||(t=new De(oe),this.te=this.te.insert(e,t)),t}ue(e){const t=this.he(e)!==null;return t||U(po,"Detected inactive target",e),t}he(e){const t=this.X.get(e);return t===void 0||t.k?null:this.Z.ge(e)}ce(e){this.X.set(e,new NC(e)),this.Z.getRemoteKeysForTarget(e).forEach((t=>{this.oe(e,t,null)}))}me(e,t){return this.Z.getRemoteKeysForTarget(e).has(t)}}function ou(){return new Re(K.comparator)}function OC(){return new Re(K.comparator)}const AT={asc:"ASCENDING",desc:"DESCENDING"},vT={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},RT={and:"AND",or:"OR"};class PT{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function sB(r,e){return r.useProto3Json||Ea(e)?e:{value:e}}function pi(r,e){return r.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function ZB(r){const e=xn(r);return new Ee(e.seconds,e.nanos)}function wm(r,e){return r.useProto3Json?e.toBase64():e.toUint8Array()}function Eu(r,e){return pi(r,e.toTimestamp())}function Ke(r){return q(!!r,49232),ee.fromTimestamp(ZB(r))}function eh(r,e){return iB(r,e).canonicalString()}function iB(r,e){const t=(function(s){return new ue(["projects",s.projectId,"databases",s.database])})(r).child("documents");return e===void 0?t:t.child(e)}function Tm(r){const e=ue.fromString(r);return q(Lm(e),10190,{key:e.toString()}),e}function gi(r,e){return eh(r.databaseId,e.path)}function Cn(r,e){const t=Tm(e);if(t.get(1)!==r.databaseId.projectId)throw new M(S.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+r.databaseId.projectId);if(t.get(3)!==r.databaseId.database)throw new M(S.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+r.databaseId.database);return new K(Rm(t))}function Am(r,e){return eh(r.databaseId,e)}function vm(r){const e=Tm(r);return e.length===4?ue.emptyPath():Rm(e)}function oB(r){return new ue(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function Rm(r){return q(r.length>4&&r.get(4)==="documents",29091,{key:r.toString()}),r.popFirst(5)}function FC(r,e,t){return{name:gi(r,e),fields:t.value.mapValue.fields}}function hc(r,e,t){const n=Cn(r,e.name),s=Ke(e.updateTime),i=e.createTime?Ke(e.createTime):ee.min(),o=new et({mapValue:{fields:e.fields}}),a=Le.newFoundDocument(n,s,i,o);return t&&a.setHasCommittedMutations(),t?a.setHasCommittedMutations():a}function bT(r,e){return"found"in e?(function(n,s){q(!!s.found,43571),s.found.name,s.found.updateTime;const i=Cn(n,s.found.name),o=Ke(s.found.updateTime),a=s.found.createTime?Ke(s.found.createTime):ee.min(),u=new et({mapValue:{fields:s.found.fields}});return Le.newFoundDocument(i,o,a,u)})(r,e):"missing"in e?(function(n,s){q(!!s.missing,3894),q(!!s.readTime,22933);const i=Cn(n,s.missing),o=Ke(s.readTime);return Le.newNoDocument(i,o)})(r,e):Y(7234,{result:e})}function ST(r,e){let t;if("targetChange"in e){e.targetChange;const n=(function(l){return l==="NO_CHANGE"?0:l==="ADD"?1:l==="REMOVE"?2:l==="CURRENT"?3:l==="RESET"?4:Y(39313,{state:l})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=(function(l,B){return l.useProto3Json?(q(B===void 0||typeof B=="string",58123),Se.fromBase64String(B||"")):(q(B===void 0||B instanceof Buffer||B instanceof Uint8Array,16193),Se.fromUint8Array(B||new Uint8Array))})(r,e.targetChange.resumeToken),o=e.targetChange.cause,a=o&&(function(l){const B=l.code===void 0?S.UNKNOWN:gm(l.code);return new M(B,l.message||"")})(o);t=new ym(n,s,i,a||null)}else if("documentChange"in e){e.documentChange;const n=e.documentChange;n.document,n.document.name,n.document.updateTime;const s=Cn(r,n.document.name),i=Ke(n.document.updateTime),o=n.document.createTime?Ke(n.document.createTime):ee.min(),a=new et({mapValue:{fields:n.document.fields}}),u=Le.newFoundDocument(s,i,o,a),l=n.targetIds||[],B=n.removedTargetIds||[];t=new _u(l,B,u.key,u)}else if("documentDelete"in e){e.documentDelete;const n=e.documentDelete;n.document;const s=Cn(r,n.document),i=n.readTime?Ke(n.readTime):ee.min(),o=Le.newNoDocument(s,i),a=n.removedTargetIds||[];t=new _u([],a,o.key,o)}else if("documentRemove"in e){e.documentRemove;const n=e.documentRemove;n.document;const s=Cn(r,n.document),i=n.removedTargetIds||[];t=new _u([],i,s,null)}else{if(!("filter"in e))return Y(11601,{ye:e});{e.filter;const n=e.filter;n.targetId;const{count:s=0,unchangedNames:i}=n,o=new mT(s,i),a=n.targetId;t=new Dm(a,o)}}return t}function ea(r,e){let t;if(e instanceof Li)t={update:FC(r,e.key,e.value)};else if(e instanceof Vi)t={delete:gi(r,e.key)};else if(e instanceof jn)t={update:FC(r,e.key,e.data),updateMask:kT(e.fieldMask)};else{if(!(e instanceof JB))return Y(16599,{we:e.type});t={verify:gi(r,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((n=>(function(i,o){const a=o.transform;if(a instanceof ci)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(a instanceof gs)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:a.elements}};if(a instanceof ms)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:a.elements}};if(a instanceof _s)return{fieldPath:o.field.canonicalString(),increment:a.l};if(a instanceof li)return{fieldPath:o.field.canonicalString(),minimum:a.l};if(a instanceof Bi)return{fieldPath:o.field.canonicalString(),maximum:a.l};throw Y(20930,{transform:o.transform})})(0,n)))),e.precondition.isNone||(t.currentDocument=(function(s,i){return i.updateTime!==void 0?{updateTime:Eu(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:Y(27497)})(r,e.precondition)),t}function aB(r,e){const t=e.currentDocument?(function(i){return i.updateTime!==void 0?Me.updateTime(Ke(i.updateTime)):i.exists!==void 0?Me.exists(i.exists):Me.none()})(e.currentDocument):Me.none(),n=e.updateTransforms?e.updateTransforms.map((s=>(function(o,a){let u=null;if("setToServerValue"in a)q(a.setToServerValue==="REQUEST_TIME",16630,{proto:a}),u=new ci;else if("appendMissingElements"in a){const B=a.appendMissingElements.values||[];u=new gs(B)}else if("removeAllFromArray"in a){const B=a.removeAllFromArray.values||[];u=new ms(B)}else"increment"in a?u=new _s(o,a.increment):"minimum"in a?u=new li(o,a.minimum):"maximum"in a?u=new Bi(o,a.maximum):Y(16584,{proto:a});const l=Je.fromServerFormat(a.fieldPath);return new Ts(l,u)})(r,s))):[];if(e.update){e.update.name;const s=Cn(r,e.update.name),i=new et({mapValue:{fields:e.update.fields}});if(e.updateMask){const o=(function(u){const l=u.fieldPaths||[];return new St(l.map((B=>Je.fromServerFormat(B))))})(e.updateMask);return new jn(s,i,o,t,n)}return new Li(s,i,t,n)}if(e.delete){const s=Cn(r,e.delete);return new Vi(s,t)}if(e.verify){const s=Cn(r,e.verify);return new JB(s,t)}return Y(1463,{proto:e})}function NT(r,e){return r&&r.length>0?(q(e!==void 0,14353),r.map((t=>(function(s,i){let o=s.updateTime?Ke(s.updateTime):Ke(i);return o.isEqual(ee.min())&&(o=Ke(i)),new eT(o,s.transformResults||[])})(t,e)))):[]}function Pm(r,e){return{documents:[Am(r,e.path)]}}function dc(r,e){const t={structuredQuery:{}},n=e.path;let s;e.collectionGroup!==null?(s=n,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=n.popLast(),t.structuredQuery.from=[{collectionId:n.lastSegment()}]),t.parent=Am(r,s);const i=(function(l){if(l.length!==0)return Fm(ye.create(l,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const o=(function(l){if(l.length!==0)return l.map((B=>(function(C){return{field:lr(C.field),direction:FT(C.dir)}})(B)))})(e.orderBy);o&&(t.structuredQuery.orderBy=o);const a=sB(r,e.limit);return a!==null&&(t.structuredQuery.limit=a),e.startAt&&(t.structuredQuery.startAt=(function(l){return{before:l.inclusive,values:l.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(l){return{before:!l.inclusive,values:l.position}})(e.endAt)),{be:t,parent:s}}function bm(r,e,t,n){const{be:s,parent:i}=dc(r,e),o={},a=[];let u=0;return t.forEach((l=>{const B=n?l.alias:"aggregate_"+u++;o[B]=l.alias,l.aggregateType==="count"?a.push({alias:B,count:{}}):l.aggregateType==="avg"?a.push({alias:B,avg:{field:lr(l.fieldPath)}}):l.aggregateType==="sum"&&a.push({alias:B,sum:{field:lr(l.fieldPath)}})})),{request:{structuredAggregationQuery:{aggregations:a,structuredQuery:s.structuredQuery},parent:s.parent},ve:o,parent:i}}function Sm(r){let e=vm(r.parent);const t=r.structuredQuery,n=t.from?t.from.length:0;let s=null;if(n>0){q(n===1,65062);const B=t.from[0];B.allDescendants?s=B.collectionId:e=e.child(B.collectionId)}let i=[];t.where&&(i=(function(d){const C=Om(d);return C instanceof ye&&KB(C)?C.getFilters():[C]})(t.where));let o=[];t.orderBy&&(o=(function(d){return d.map((C=>(function(D){return new Zo(Ws(D.field),(function(V){switch(V){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(D.direction))})(C)))})(t.orderBy));let a=null;t.limit&&(a=(function(d){let C;return C=typeof d=="object"?d.value:d,Ea(C)?null:C})(t.limit));let u=null;t.startAt&&(u=(function(d){const C=!!d.before,g=d.values||[];return new vr(g,C)})(t.startAt));let l=null;return t.endAt&&(l=(function(d){const C=!d.before,g=d.values||[];return new vr(g,C)})(t.endAt)),hm(e,s,o,i,a,"F",u,l)}function OT(r,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return Y(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Nm(r,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(r)))}}}}function Om(r){return r.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const n=Ws(t.unaryFilter.field);return fe.create(n,"==",{doubleValue:NaN});case"IS_NULL":const s=Ws(t.unaryFilter.field);return fe.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Ws(t.unaryFilter.field);return fe.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Ws(t.unaryFilter.field);return fe.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return Y(61313);default:return Y(60726)}})(r):r.fieldFilter!==void 0?(function(t){return fe.create(Ws(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return Y(58110);default:return Y(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(r):r.compositeFilter!==void 0?(function(t){return ye.create(t.compositeFilter.filters.map((n=>Om(n))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return Y(1026)}})(t.compositeFilter.op))})(r):Y(30097,{filter:r})}function FT(r){return AT[r]}function LT(r){return vT[r]}function VT(r){return RT[r]}function lr(r){return{fieldPath:r.canonicalString()}}function Ws(r){return Je.fromServerFormat(r.fieldPath)}function Fm(r){return r instanceof fe?(function(t){if(t.op==="=="){if(Vt(t.value))return{unaryFilter:{field:lr(t.field),op:"IS_NAN"}};if(Ht(t.value))return{unaryFilter:{field:lr(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Vt(t.value))return{unaryFilter:{field:lr(t.field),op:"IS_NOT_NAN"}};if(Ht(t.value))return{unaryFilter:{field:lr(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:lr(t.field),op:LT(t.op),value:t.value}}})(r):r instanceof ye?(function(t){const n=t.getFilters().map((s=>Fm(s)));return n.length===1?n[0]:{compositeFilter:{op:VT(t.op),filters:n}}})(r):Y(54877,{filter:r})}function kT(r){const e=[];return r.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function Lm(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}function Vm(r){return!!r&&typeof r._toProto=="function"&&r._protoValueType==="ProtoValue"}function ta(r,e){const t={fields:{}};return e.forEach(((n,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=n._toProto(r)})),{mapValue:t}}function km(r){return{stringValue:r}}/**
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
 */function As(r){return new PT(r,!0)}/**
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
 */class Pt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Pt(Se.fromBase64String(e))}catch(t){throw new M(S.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Pt(Se.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:Pt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(ws(e,Pt._jsonSchema))return Pt.fromBase64String(e.bytes)}}Pt._jsonSchemaVersion="firestore/bytes/1.0",Pt._jsonSchema={type:Ye("string",Pt._jsonSchemaVersion),bytes:Ye("string")};/**
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
 */class vs{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new M(S.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Je(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function xm(){return new vs(on)}/**
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
 */class Dn{constructor(e){this._methodName=e}}/**
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
 */class Yt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new M(S.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new M(S.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return oe(this._lat,e._lat)||oe(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Yt._jsonSchemaVersion}}static fromJSON(e){if(ws(e,Yt._jsonSchema))return new Yt(e.latitude,e.longitude)}}Yt._jsonSchemaVersion="firestore/geoPoint/1.0",Yt._jsonSchema={type:Ye("string",Yt._jsonSchemaVersion),latitude:Ye("number"),longitude:Ye("number")};/**
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
 */class at{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}at.UNAUTHENTICATED=new at(null),at.GOOGLE_CREDENTIALS=new at("google-credentials-uid"),at.FIRST_PARTY=new at("first-party-uid"),at.MOCK_USER=new at("mock-user");/**
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
 */class ct{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
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
 */class Mm{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Gm{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(at.UNAUTHENTICATED)))}shutdown(){}}class xT{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class MT{constructor(e){this.Se=e,this.currentUser=at.UNAUTHENTICATED,this.De=0,this.forceRefresh=!1,this.auth=null}start(e,t){q(this.xe===void 0,42304);let n=this.De;const s=u=>this.De!==n?(n=this.De,t(u)):Promise.resolve();let i=new ct;this.xe=()=>{this.De++,this.currentUser=this.Ce(),i.resolve(),i=new ct,e.enqueueRetryable((()=>s(this.currentUser)))};const o=()=>{const u=i;e.enqueueRetryable((async()=>{await u.promise,await s(this.currentUser)}))},a=u=>{U("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.xe&&(this.auth.addAuthTokenListener(this.xe),o())};this.Se.onInit((u=>a(u))),setTimeout((()=>{if(!this.auth){const u=this.Se.getImmediate({optional:!0});u?a(u):(U("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new ct)}}),0),o()}getToken(){const e=this.De,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((n=>this.De!==e?(U("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(q(typeof n.accessToken=="string",31837,{Fe:n}),new Mm(n.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.xe&&this.auth.removeAuthTokenListener(this.xe),this.xe=void 0}Ce(){const e=this.auth&&this.auth.getUid();return q(e===null||typeof e=="string",2055,{Oe:e}),new at(e)}}class GT{constructor(e,t,n){this.Me=e,this.Ne=t,this.Le=n,this.type="FirstParty",this.user=at.FIRST_PARTY,this.Be=new Map}Ue(){return this.Le?this.Le():null}get headers(){this.Be.set("X-Goog-AuthUser",this.Me);const e=this.Ue();return e&&this.Be.set("Authorization",e),this.Ne&&this.Be.set("X-Goog-Iam-Authorization-Token",this.Ne),this.Be}}class UT{constructor(e,t,n){this.Me=e,this.Ne=t,this.Le=n}getToken(){return Promise.resolve(new GT(this.Me,this.Ne,this.Le))}start(e,t){e.enqueueRetryable((()=>t(at.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class uB{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class HT{constructor(e,t){this.ke=t,this.forceRefresh=!1,this.appCheck=null,this.qe=null,this.$e=null,xe(e)&&e.settings.appCheckToken&&(this.$e=e.settings.appCheckToken)}start(e,t){q(this.xe===void 0,3512);const n=i=>{i.error!=null&&U("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.qe;return this.qe=i.token,U("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.xe=i=>{e.enqueueRetryable((()=>n(i)))};const s=i=>{U("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.xe&&this.appCheck.addTokenListener(this.xe)};this.ke.onInit((i=>s(i))),setTimeout((()=>{if(!this.appCheck){const i=this.ke.getImmediate({optional:!0});i?s(i):U("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.$e)return Promise.resolve(new uB(this.$e));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(q(typeof t.token=="string",44558,{tokenResult:t}),this.qe=t.token,new uB(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.xe&&this.appCheck.removeTokenListener(this.xe),this.xe=void 0}}class qT{getToken(){return Promise.resolve(new uB(""))}invalidateToken(){}start(e,t){}shutdown(){}}function Um(r){const e={};return r.timeoutSeconds!==void 0&&(e.timeoutSeconds=r.timeoutSeconds),e}/**
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
 */class jT{Ke(e){}shutdown(){}}/**
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
 */const LC="ConnectivityMonitor";class VC{constructor(){this.We=()=>this.Qe(),this.Ge=()=>this.ze(),this.je=[],this.He()}Ke(e){this.je.push(e)}shutdown(){window.removeEventListener("online",this.We),window.removeEventListener("offline",this.Ge)}He(){window.addEventListener("online",this.We),window.addEventListener("offline",this.Ge)}Qe(){U(LC,"Network connectivity changed: AVAILABLE");for(const e of this.je)e(0)}ze(){U(LC,"Network connectivity changed: UNAVAILABLE");for(const e of this.je)e(1)}static Je(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let au=null;function cB(){return au===null?au=(function(){return 268435456+Math.round(2147483648*Math.random())})():au++,"0x"+au.toString(16)}/**
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
 */const Tl="RestConnection",JT={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class KT{get Ye(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Ze=t+"://"+e.host,this.Xe=`projects/${n}/databases/${s}`,this.et=this.databaseId.database===Yo?`project_id=${n}`:`project_id=${n}&database_id=${s}`}tt(e,t,n,s,i){const o=cB(),a=this.nt(e,t.toUriEncodedString());U(Tl,`Sending RPC '${e}' ${o}:`,a,n);const u={"google-cloud-resource-prefix":this.Xe,"x-goog-request-params":this.et};this.rt(u,s,i);const{host:l}=new URL(a),B=Si(l);return this.it(e,a,u,n,B).then((d=>(U(Tl,`Received RPC '${e}' ${o}: `,d),d)),(d=>{throw nt(Tl,`RPC '${e}' ${o} failed with error: `,d,"url: ",a,"request:",n),d}))}st(e,t,n,s,i,o){return this.tt(e,t,n,s,i)}rt(e,t,n){if(e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+Oi})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,i)=>e[i]=s)),n&&n.headers.forEach(((s,i)=>e[i]=s)),this.databaseInfo._customHeaders)for(const s of Object.keys(this.databaseInfo._customHeaders))e[s]=this.databaseInfo._customHeaders[s]}nt(e,t){const n=JT[e];let s=`${this.Ze}/v1/${t}:${n}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
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
 */class zT{constructor(e){this._t=e._t,this.ot=e.ot}ut(e){this.ct=e}lt(e){this.Et=e}ht(e){this.Tt=e}onMessage(e){this.Pt=e}close(){this.ot()}send(e){this._t(e)}Rt(){this.ct()}It(){this.Et()}At(e){this.Tt(e)}Vt(e){this.Pt(e)}}/**
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
 */const ft="WebChannelConnection",go=(r,e,t)=>{r.listen(e,(n=>{try{t(n)}catch(s){setTimeout((()=>{throw s}),0)}}))};class Xs extends KT{constructor(e){super(e),this.dt=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static ft(){if(!Xs.gt){const e=vg();go(e,Ag.STAT_EVENT,(t=>{t.stat===Kl.PROXY?U(ft,"STAT_EVENT: detected buffering proxy"):t.stat===Kl.NOPROXY&&U(ft,"STAT_EVENT: detected no buffering proxy")})),Xs.gt=!0}}it(e,t,n,s,i){const o=cB();return new Promise(((a,u)=>{const l=new wg;l.setWithCredentials(!0),l.listenOnce(Tg.COMPLETE,(()=>{try{switch(l.getLastErrorCode()){case pu.NO_ERROR:const d=l.getResponseJson();U(ft,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(d)),a(d);break;case pu.TIMEOUT:U(ft,`RPC '${e}' ${o} timed out`),u(new M(S.DEADLINE_EXCEEDED,"Request time out"));break;case pu.HTTP_ERROR:const C=l.getStatus();if(U(ft,`RPC '${e}' ${o} failed with status:`,C,"response text:",l.getResponseText()),C>0){let g=l.getResponseJson();Array.isArray(g)&&(g=g[0]);const D=g==null?void 0:g.error;if(D&&D.status&&D.message){const N=(function(H){const Z=H.toLowerCase().replace(/_/g,"-");return Object.values(S).indexOf(Z)>=0?Z:S.UNKNOWN})(D.status);u(new M(N,D.message))}else u(new M(S.UNKNOWN,"Server responded with status "+l.getStatus()))}else u(new M(S.UNAVAILABLE,"Connection failed."));break;default:Y(9055,{yt:e,streamId:o,wt:l.getLastErrorCode(),bt:l.getLastError()})}}finally{U(ft,`RPC '${e}' ${o} completed.`)}}));const B=JSON.stringify(s);U(ft,`RPC '${e}' ${o} sending request:`,s),l.send(t,"POST",B,n,15)}))}vt(e,t,n){const s=cB(),i=[this.Ze,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=this.createWebChannelTransport(),a={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(a.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(a.useFetchStreams=!0),this.rt(a.initMessageHeaders,t,n),a.encodeInitMessageHeaders=!0;const l=i.join("");U(ft,`Creating RPC '${e}' stream ${s}: ${l}`,a);const B=o.createWebChannel(l,a);this.St(B);let d=!1,C=!1;const g=new zT({_t:D=>{C?U(ft,`Not sending because RPC '${e}' stream ${s} is closed:`,D):(d||(U(ft,`Opening RPC '${e}' stream ${s} transport.`),B.open(),d=!0),U(ft,`RPC '${e}' stream ${s} sending:`,D),B.send(D))},ot:()=>B.close()});return go(B,To.EventType.OPEN,(()=>{C||(U(ft,`RPC '${e}' stream ${s} transport opened.`),g.Rt())})),go(B,To.EventType.CLOSE,(()=>{C||(C=!0,U(ft,`RPC '${e}' stream ${s} transport closed`),g.At(),this.Dt(B))})),go(B,To.EventType.ERROR,(D=>{C||(C=!0,nt(ft,`RPC '${e}' stream ${s} transport errored. Name:`,D.name,"Message:",D.message),g.At(new M(S.UNAVAILABLE,"The operation could not be completed")))})),go(B,To.EventType.MESSAGE,(D=>{var N;if(!C){const V=D.data[0];q(!!V,16349);const H=V,Z=(H==null?void 0:H.error)||((N=H[0])==null?void 0:N.error);if(Z){U(ft,`RPC '${e}' stream ${s} received error:`,Z);const re=Z.status;let de=(function(T){const E=ze[T];if(E!==void 0)return gm(E)})(re),Ce=Z.message;re==="NOT_FOUND"&&Ce.includes("database")&&Ce.includes("does not exist")&&Ce.includes(this.databaseId.database)&&nt(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),de===void 0&&(de=S.INTERNAL,Ce="Unknown error status: "+re+" with message "+Z.message),C=!0,g.At(new M(de,Ce)),B.close()}else U(ft,`RPC '${e}' stream ${s} received:`,V),g.Vt(V)}})),Xs.ft(),setTimeout((()=>{g.It()}),0),g}terminate(){this.dt.forEach((e=>e.close())),this.dt=[]}St(e){this.dt.push(e)}Dt(e){this.dt=this.dt.filter((t=>t===e))}rt(e,t,n){super.rt(e,t,n),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return Rg()}}/**
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
 */function QT(r){return new Xs(r)}Xs.gt=!1;class th{constructor(e,t,n=1e3,s=1.5,i=6e4){this.xt=e,this.timerId=t,this.Ct=n,this.Ft=s,this.Ot=i,this.Mt=0,this.Nt=null,this.Lt=Date.now(),this.reset()}reset(){this.Mt=0}Bt(){this.Mt=this.Ot}Ut(e){this.cancel();const t=Math.floor(this.Mt+this.kt()),n=Math.max(0,Date.now()-this.Lt),s=Math.max(0,t-n);s>0&&U("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Mt} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.Nt=this.xt.enqueueAfterDelay(this.timerId,s,(()=>(this.Lt=Date.now(),e()))),this.Mt*=this.Ft,this.Mt<this.Ct&&(this.Mt=this.Ct),this.Mt>this.Ot&&(this.Mt=this.Ot)}qt(){this.Nt!==null&&(this.Nt.skipDelay(),this.Nt=null)}cancel(){this.Nt!==null&&(this.Nt.cancel(),this.Nt=null)}kt(){return(Math.random()-.5)*this.Mt}}/**
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
 */const kC="PersistentStream";class Hm{constructor(e,t,n,s,i,o,a,u){this.xt=e,this.$t=n,this.Kt=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=a,this.listener=u,this.state=0,this.Wt=0,this.Qt=null,this.Gt=null,this.stream=null,this.zt=0,this.jt=new th(e,t)}Ht(){return this.state===1||this.state===5||this.Jt()}Jt(){return this.state===2||this.state===3}start(){this.zt=0,this.state!==4?this.auth():this.Yt()}async stop(){this.Ht()&&await this.close(0)}Zt(){this.state=0,this.jt.reset()}Xt(){this.Jt()&&this.Qt===null&&(this.Qt=this.xt.enqueueAfterDelay(this.$t,6e4,(()=>this.en())))}tn(e){this.nn(),this.stream.send(e)}async en(){if(this.Jt())return this.close(0)}nn(){this.Qt&&(this.Qt.cancel(),this.Qt=null)}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}async close(e,t){this.nn(),this.rn(),this.jt.cancel(),this.Wt++,e!==4?this.jt.reset():t&&t.code===S.RESOURCE_EXHAUSTED?(je(t.toString()),je("Using maximum backoff delay to prevent overloading the backend."),this.jt.Bt()):t&&t.code===S.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.sn(),this.stream.close(),this.stream=null),this.state=e,await this.listener.ht(t)}sn(){}auth(){this.state=1;const e=this._n(this.Wt),t=this.Wt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([n,s])=>{this.Wt===t&&this.an(n,s)}),(n=>{e((()=>{const s=new M(S.UNKNOWN,"Fetching auth token failed: "+n.message);return this.un(s)}))}))}an(e,t){const n=this._n(this.Wt);this.stream=this.cn(e,t),this.stream.ut((()=>{n((()=>this.listener.ut()))})),this.stream.lt((()=>{n((()=>(this.state=2,this.Gt=this.xt.enqueueAfterDelay(this.Kt,1e4,(()=>(this.Jt()&&(this.state=3),Promise.resolve()))),this.listener.lt())))})),this.stream.ht((s=>{n((()=>this.un(s)))})),this.stream.onMessage((s=>{n((()=>++this.zt==1?this.En(s):this.onNext(s)))}))}Yt(){this.state=5,this.jt.Ut((async()=>{this.state=0,this.start()}))}un(e){return U(kC,`close with error: ${e}`),this.stream=null,this.close(4,e)}_n(e){return t=>{this.xt.enqueueAndForget((()=>this.Wt===e?t():(U(kC,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class WT extends Hm{constructor(e,t,n,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,s,o),this.serializer=i}cn(e,t){return this.connection.vt("Listen",e,t)}En(e){return this.onNext(e)}onNext(e){this.jt.reset();const t=ST(this.serializer,e),n=(function(i){if(!("targetChange"in i))return ee.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?ee.min():o.readTime?Ke(o.readTime):ee.min()})(e);return this.listener.hn(t,n)}Tn(e){const t={};t.database=oB(this.serializer),t.addTarget=(function(i,o){let a;const u=o.target;if(a=wn(u)?{pipelineQuery:Nm(i,u)}:WB(u)?{documents:Pm(i,u)}:{query:dc(i,u).be},a.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){a.resumeToken=wm(i,o.resumeToken);const l=sB(i,o.expectedCount);l!==null&&(a.expectedCount=l)}else if(o.snapshotVersion.compareTo(ee.min())>0){a.readTime=pi(i,o.snapshotVersion.toTimestamp());const l=sB(i,o.expectedCount);l!==null&&(a.expectedCount=l)}return a})(this.serializer,e);const n=OT(this.serializer,e);n&&(t.labels=n),this.tn(t)}Pn(e){const t={};t.database=oB(this.serializer),t.removeTarget=e,this.tn(t)}}class $T extends Hm{constructor(e,t,n,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,s,o),this.serializer=i}get Rn(){return this.zt>0}start(){this.lastStreamToken=void 0,super.start()}sn(){this.Rn&&this.In([])}cn(e,t){return this.connection.vt("Write",e,t)}En(e){return q(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,q(!e.writeResults||e.writeResults.length===0,55816),this.listener.An()}onNext(e){q(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.jt.reset();const t=NT(e.writeResults,e.commitTime),n=Ke(e.commitTime);return this.listener.Vn(n,t)}dn(){const e={};e.database=oB(this.serializer),this.tn(e)}In(e){const t={streamToken:this.lastStreamToken,writes:e.map((n=>ea(this.serializer,n)))};this.tn(t)}}/**
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
 */class YT{}class XT extends YT{constructor(e,t,n,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=s,this.fn=!1}mn(){if(this.fn)throw new M(S.FAILED_PRECONDITION,"The client has already been terminated.")}tt(e,t,n,s){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,o])=>this.connection.tt(e,iB(t,n),s,i,o))).catch((i=>{throw i.name==="FirebaseError"?(i.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new M(S.UNKNOWN,i.toString())}))}st(e,t,n,s,i){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([o,a])=>this.connection.st(e,iB(t,n),s,o,a,i))).catch((o=>{throw o.name==="FirebaseError"?(o.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new M(S.UNKNOWN,o.toString())}))}terminate(){this.fn=!0,this.connection.terminate()}}function ZT(r,e,t,n){return new XT(r,e,t,n)}/**
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
 */const eA="ComponentProvider",xC=new Map;function tA(r,e,t,n,s){return new Kw(r,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,Um(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,n,s._customHeaders,s.grpcFlowControlWindow)}/**
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
 */const MC={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},qm=41943040;class Ct{static withCacheSize(e){return new Ct(e,Ct.DEFAULT_COLLECTION_PERCENTILE,Ct.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=n}}Ct.DEFAULT_COLLECTION_PERCENTILE=10,Ct.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Ct.DEFAULT=new Ct(qm,Ct.DEFAULT_COLLECTION_PERCENTILE,Ct.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Ct.DISABLED=new Ct(-1,0,0);/**
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
 */class Nt{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=n=>this.pn(n),this.gn=n=>t.writeSequenceNumber(n))}pn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.gn&&this.gn(e),e}}Nt.yn=-1;/**
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
 */const jm="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Jm{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
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
 */async function Lr(r){if(r.code!==S.FAILED_PRECONDITION||r.message!==jm)throw r;U("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class P{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&Y(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new P(((n,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(n,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(n,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof P?t:P.resolve(t)}catch(t){return P.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):P.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):P.reject(t)}static resolve(e){return new P(((t,n)=>{t(e)}))}static reject(e){return new P(((t,n)=>{n(e)}))}static waitFor(e){return new P(((t,n)=>{let s=0,i=0,o=!1;e.forEach((a=>{++s,a.next((()=>{++i,o&&i===s&&t()}),(u=>n(u)))})),o=!0,i===s&&t()}))}static or(e){let t=P.resolve(!1);for(const n of e)t=t.next((s=>s?P.resolve(s):n()));return t}static forEach(e,t){const n=[];return e.forEach(((s,i)=>{n.push(t.call(this,s,i))})),this.waitFor(n)}static mapArray(e,t){return new P(((n,s)=>{const i=e.length,o=new Array(i);let a=0;for(let u=0;u<i;u++){const l=u;t(e[l]).next((B=>{o[l]=B,++a,a===i&&n(o)}),(B=>s(B)))}}))}static doWhile(e,t){return new P(((n,s)=>{const i=()=>{e()===!0?t().next((()=>{i()}),s):n()};i()}))}}/**
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
 */const Ut="SimpleDb";class fc{static open(e,t,n,s){try{return new fc(t,e.transaction(s,n))}catch(i){throw new Vo(t,i)}}constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.wn=new ct,this.transaction.oncomplete=()=>{this.wn.resolve()},this.transaction.onabort=()=>{t.error?this.wn.reject(new Vo(e,t.error)):this.wn.resolve()},this.transaction.onerror=n=>{const s=nh(n.target.error);this.wn.reject(new Vo(e,s))}}get bn(){return this.wn.promise}abort(e){e&&this.wn.reject(e),this.aborted||(U(Ut,"Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}vn(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new rA(t)}}class pn{static delete(e){return U(Ut,"Removing database:",e),Xr(rg().indexedDB.deleteDatabase(e)).toPromise()}static Je(){if(!Bg())return!1;if(pn.Sn())return!0;const e=tt(),t=pn.Dn(e),n=0<t&&t<10,s=Km(e),i=0<s&&s<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||n||i)}static Sn(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)==null?void 0:e.__PRIVATE_USE_MOCK_PERSISTENCE)==="YES"}static xn(e,t){return e.store(t)}static Dn(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),n=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(n)}constructor(e,t,n){this.name=e,this.version=t,this.Cn=n,this.Fn=null,pn.Dn(tt())===12.2&&je("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async On(e){return this.db||(U(Ut,"Opening database:",this.name),this.db=await new Promise(((t,n)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const o=i.target.result;t(o)},s.onblocked=()=>{n(new Vo(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const o=i.target.error;o.name==="VersionError"?n(new M(S.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?n(new M(S.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):n(new Vo(e,o))},s.onupgradeneeded=i=>{U(Ut,'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const o=i.target.result;this.Cn.Mn(o,s.transaction,i.oldVersion,this.version).next((()=>{U(Ut,"Database upgrade to version "+this.version+" complete")}))}}))),this.Nn&&(this.db.onversionchange=t=>this.Nn(t)),this.db}Ln(e){this.Nn=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,n,s){const i=t==="readonly";let o=0;for(;;){++o;try{this.db=await this.On(e);const a=fc.open(this.db,e,i?"readonly":"readwrite",n),u=s(a).next((l=>(a.vn(),l))).catch((l=>(a.abort(l),P.reject(l)))).toPromise();return u.catch((()=>{})),await a.bn,u}catch(a){const u=a,l=u.name!=="FirebaseError"&&o<3;if(U(Ut,"Transaction failed with error:",u.message,"Retrying:",l),this.close(),!l)return Promise.reject(u)}}}close(){this.db&&this.db.close(),this.db=void 0}}function Km(r){const e=r.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class nA{constructor(e){this.Bn=e,this.Un=!1,this.kn=null}get isDone(){return this.Un}get qn(){return this.kn}set cursor(e){this.Bn=e}done(){this.Un=!0}$n(e){this.kn=e}delete(){return Xr(this.Bn.delete())}}class Vo extends M{constructor(e,t){super(S.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function Vr(r){return r.name==="IndexedDbTransactionError"}class rA{constructor(e){this.store=e}put(e,t){let n;return t!==void 0?(U(Ut,"PUT",this.store.name,e,t),n=this.store.put(t,e)):(U(Ut,"PUT",this.store.name,"<auto-key>",e),n=this.store.put(e)),Xr(n)}add(e){return U(Ut,"ADD",this.store.name,e,e),Xr(this.store.add(e))}get(e){return Xr(this.store.get(e)).next((t=>(t===void 0&&(t=null),U(Ut,"GET",this.store.name,e,t),t)))}delete(e){return U(Ut,"DELETE",this.store.name,e),Xr(this.store.delete(e))}count(){return U(Ut,"COUNT",this.store.name),Xr(this.store.count())}Kn(e,t){const n=this.options(e,t),s=n.index?this.store.index(n.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(n.range);return new P(((o,a)=>{i.onerror=u=>{a(u.target.error)},i.onsuccess=u=>{o(u.target.result)}}))}{const i=this.cursor(n),o=[];return this.Wn(i,((a,u)=>{o.push(u)})).next((()=>o))}}Qn(e,t){const n=this.store.getAll(e,t===null?void 0:t);return new P(((s,i)=>{n.onerror=o=>{i(o.target.error)},n.onsuccess=o=>{s(o.target.result)}}))}Gn(e,t){U(Ut,"DELETE ALL",this.store.name);const n=this.options(e,t);n.zn=!1;const s=this.cursor(n);return this.Wn(s,((i,o,a)=>a.delete()))}jn(e,t){let n;t?n=e:(n={},t=e);const s=this.cursor(n);return this.Wn(s,t)}Hn(e){const t=this.cursor({});return new P(((n,s)=>{t.onerror=i=>{const o=nh(i.target.error);s(o)},t.onsuccess=i=>{const o=i.target.result;o?e(o.primaryKey,o.value).next((a=>{a?o.continue():n()})):n()}}))}Wn(e,t){const n=[];return new P(((s,i)=>{e.onerror=o=>{i(o.target.error)},e.onsuccess=o=>{const a=o.target.result;if(!a)return void s();const u=new nA(a),l=t(a.primaryKey,a.value,u);if(l instanceof P){const B=l.catch((d=>(u.done(),P.reject(d))));n.push(B)}u.isDone?s():u.qn===null?a.continue():a.continue(u.qn)}})).next((()=>P.waitFor(n)))}options(e,t){let n;return e!==void 0&&(typeof e=="string"?n=e:t=e),{index:n,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const n=this.store.index(e.index);return e.zn?n.openKeyCursor(e.range,t):n.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function Xr(r){return new P(((e,t)=>{r.onsuccess=n=>{const s=n.target.result;e(s)},r.onerror=n=>{const s=nh(n.target.error);t(s)}}))}let GC=!1;function nh(r){const e=pn.Dn(tt());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(r.message.indexOf(t)>=0){const n=new M("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return GC||(GC=!0,setTimeout((()=>{throw n}),0)),n}}return r}/**
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
 */const UC="LruGarbageCollector",zm=1048576;function HC([r,e],[t,n]){const s=oe(r,t);return s===0?oe(e,n):s}class sA{constructor(e){this.Jn=e,this.buffer=new De(HC),this.Yn=0}Zn(){return++this.Yn}Xn(e){const t=[e,this.Zn()];if(this.buffer.size<this.Jn)this.buffer=this.buffer.add(t);else{const n=this.buffer.last();HC(t,n)<0&&(this.buffer=this.buffer.delete(n).add(t))}}get maxValue(){return this.buffer.last()[0]}}class Qm{constructor(e,t,n){this.garbageCollector=e,this.asyncQueue=t,this.localStore=n,this.er=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.tr(6e4)}stop(){this.er&&(this.er.cancel(),this.er=null)}get started(){return this.er!==null}tr(e){U(UC,`Garbage collection scheduled in ${e}ms`),this.er=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.er=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Vr(t)?U(UC,"Ignoring IndexedDB error during garbage collection: ",t):await Lr(t)}await this.tr(3e5)}))}}class iA{constructor(e,t){this.nr=e,this.params=t}calculateTargetCount(e,t){return this.nr.rr(e).next((n=>Math.floor(t/100*n)))}nthSequenceNumber(e,t){if(t===0)return P.resolve(Nt.yn);const n=new sA(t);return this.nr.forEachTarget(e,(s=>n.Xn(s.sequenceNumber))).next((()=>this.nr.ir(e,(s=>n.Xn(s))))).next((()=>n.maxValue))}removeTargets(e,t,n){return this.nr.removeTargets(e,t,n)}removeOrphanedDocuments(e,t){return this.nr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(U("LruGarbageCollector","Garbage collection skipped; disabled"),P.resolve(MC)):this.getCacheSize(e).next((n=>n<this.params.cacheSizeCollectionThreshold?(U("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),MC):this.sr(e,t)))}getCacheSize(e){return this.nr.getCacheSize(e)}sr(e,t){let n,s,i,o,a,u,l;const B=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((d=>(d>this.params.maximumSequenceNumbersToCollect?(U("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${d}`),s=this.params.maximumSequenceNumbersToCollect):s=d,o=Date.now(),this.nthSequenceNumber(e,s)))).next((d=>(n=d,a=Date.now(),this.removeTargets(e,n,t)))).next((d=>(i=d,u=Date.now(),this.removeOrphanedDocuments(e,n)))).next((d=>(l=Date.now(),zs()<=he.DEBUG&&U("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-B}ms
	Determined least recently used ${s} in `+(a-o)+`ms
	Removed ${i} targets in `+(u-a)+`ms
	Removed ${d} documents in `+(l-u)+`ms
Total Duration: ${l-B}ms`),P.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:d}))))}}function Wm(r,e){return new iA(r,e)}/**
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
 */const $m="firestore.googleapis.com",qC=!0;class jC{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new M(S.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=$m,this.ssl=qC}else this.host=e.host,this.ssl=e.ssl??qC;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),e.cacheSizeBytes===void 0)this.cacheSizeBytes=qm;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<zm)throw new M(S.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(xg("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Um(e.experimentalLongPollingOptions??{}),(function(n){if(n.timeoutSeconds!==void 0){if(isNaN(n.timeoutSeconds))throw new M(S.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (must not be NaN)`);if(n.timeoutSeconds<5)throw new M(S.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (minimum allowed value is 5)`);if(n.timeoutSeconds>30)throw new M(S.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,e.grpcFlowControlWindow!==void 0){if(typeof e.grpcFlowControlWindow!="number"||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new M(S.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(n,s){return n.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&(function(n,s){if(n===s)return!0;if(!n||!s)return!1;const i=Object.keys(n),o=Object.keys(s);if(i.length!==o.length)return!1;for(const a of i)if(n[a]!==s[a])return!1;return!0})(this._customHeaders,e._customHeaders)}}let Da=class{constructor(e,t,n,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new jC({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new M(S.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new M(S.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new jC(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(n){if(!n)return new Gm;switch(n.type){case"firstParty":return new UT(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new M(S.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const n=xC.get(t);n&&(U(eA,"Removing Datastore"),xC.delete(t),n.terminate())})(this),Promise.resolve()}};function Ym(r,e,t,n={}){var l;r=Be(r,Da);const s=Si(e),i=r._getSettings(),o={...i,emulatorOptions:r._getEmulatorOptions()},a=`${e}:${t}`;s&&bB(`https://${a}`),i.host!==$m&&i.host!==a&&nt("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u={...i,host:a,ssl:s,emulatorOptions:n};if(!Zt(u,o)&&(r._setSettings(u),n.mockUserToken)){let B,d;if(typeof n.mockUserToken=="string")B=n.mockUserToken,d=at.MOCK_USER;else{B=LD(n.mockUserToken,(l=r._app)==null?void 0:l.options.projectId);const C=n.mockUserToken.sub||n.mockUserToken.user_id;if(!C)throw new M(S.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");d=new at(C)}r._authCredentials=new xT(new Mm(B,d))}}/**
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
 */class rt{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new rt(this.firestore,e,this._query)}}class Ie{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Xt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Ie(this.firestore,e,this._key)}toJSON(){return{type:Ie._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,n){if(ws(t,Ie._jsonSchema))return new Ie(e,n||null,new K(ue.fromString(t.referencePath)))}}Ie._jsonSchemaVersion="firestore/documentReference/1.0",Ie._jsonSchema={type:Ye("string",Ie._jsonSchemaVersion),referencePath:Ye("string")};class Xt extends rt{constructor(e,t,n){super(e,t,ki(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Ie(this.firestore,null,new K(e))}withConverter(e){return new Xt(this.firestore,e,this._path)}}function oA(r,e,...t){if(r=ne(r),GB("collection","path",e),r instanceof Da){const n=ue.fromString(e,...t);return fC(n),new Xt(r,null,n)}{if(!(r instanceof Ie||r instanceof Xt))throw new M(S.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(ue.fromString(e,...t));return fC(n),new Xt(r.firestore,null,n)}}function aA(r,e){if(r=Be(r,Da),GB("collectionGroup","collection id",e),e.indexOf("/")>=0)throw new M(S.INVALID_ARGUMENT,`Invalid collection ID '${e}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new rt(r,null,(function(n){return new Jn(ue.emptyPath(),n)})(e))}function Xm(r,e,...t){if(r=ne(r),arguments.length===1&&(e=ic.newId()),GB("doc","path",e),r instanceof Da){const n=ue.fromString(e,...t);return dC(n),new Ie(r,null,new K(n))}{if(!(r instanceof Ie||r instanceof Xt))throw new M(S.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(ue.fromString(e,...t));return dC(n),new Ie(r.firestore,r instanceof Xt?r.converter:null,new K(n))}}function uA(r,e){return r=ne(r),e=ne(e),(r instanceof Ie||r instanceof Xt)&&(e instanceof Ie||e instanceof Xt)&&r.firestore===e.firestore&&r.path===e.path&&r.converter===e.converter}function rh(r,e){return r=ne(r),e=ne(e),r instanceof rt&&e instanceof rt&&r.firestore===e.firestore&&Cm(r._query,e._query)&&r.converter===e.converter}/**
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
 */class wt{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(n,s){if(n.length!==s.length)return!1;for(let i=0;i<n.length;++i)if(n[i]!==s[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:wt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(ws(e,wt._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new wt(e.vectorValues);throw new M(S.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}wt._jsonSchemaVersion="firestore/vectorValue/1.0",wt._jsonSchema={type:Ye("string",wt._jsonSchemaVersion),vectorValues:Ye("object")};/**
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
 */const cA=/^__.*__$/;class lA{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return this.fieldMask!==null?new jn(e,this.data,this.fieldMask,t,this.fieldTransforms):new Li(e,this.data,t,this.fieldTransforms)}}class Zm{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return new jn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function e_(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw Y(40011,{dataSource:r})}}class Cc{constructor(e,t,n,s,i,o){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new Cc({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var s;const t=(s=this.path)==null?void 0:s.child(e),n=this.contextWith({path:t,arrayElement:!1});return n.validatePathSegment(e),n}childContextForFieldPath(e){var s;const t=(s=this.path)==null?void 0:s.child(e),n=this.contextWith({path:t,arrayElement:!1});return n.validatePath(),n}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return ku(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(e_(this.dataSource)&&cA.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class BA{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||As(e)}createContext(e,t,n,s=!1){return new Cc({dataSource:e,methodName:t,targetDoc:n,path:Je.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Rs(r){const e=r._freezeSettings(),t=As(r._databaseId);return new BA(r._databaseId,!!e.ignoreUndefinedProperties,t)}function pc(r,e,t,n,s,i={}){const o=r.createContext(i.merge||i.mergeFields?2:0,e,t,s);hh("Data must be an object, but it was:",o,n);const a=r_(n,o);let u,l;if(i.merge)u=new St(o.fieldMask),l=o.fieldTransforms;else if(i.mergeFields){const B=[];for(const d of i.mergeFields){const C=en(e,d,t);if(!o.contains(C))throw new M(S.INVALID_ARGUMENT,`Field '${C}' is specified in your field mask but missing from your input data.`);i_(B,C)||B.push(C)}u=new St(B),l=o.fieldTransforms.filter((d=>u.covers(d.field)))}else u=null,l=o.fieldTransforms;return new lA(new et(a),u,l)}class ya extends Dn{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof ya}}function t_(r,e,t){return new Cc({dataSource:3,targetDoc:e.settings.targetDoc,methodName:r._methodName,arrayElement:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class sh extends Dn{_toFieldTransform(e){return new Ts(e.path,new ci)}isEqual(e){return e instanceof sh}}class ih extends Dn{constructor(e,t){super(e),this._r=t}_toFieldTransform(e){const t=t_(this,e,!0),n=this._r.map((i=>gn(i,t))),s=new gs(n);return new Ts(e.path,s)}isEqual(e){return e instanceof ih&&Zt(this._r,e._r)}}class oh extends Dn{constructor(e,t){super(e),this._r=t}_toFieldTransform(e){const t=t_(this,e,!0),n=this._r.map((i=>gn(i,t))),s=new ms(n);return new Ts(e.path,s)}isEqual(e){return e instanceof oh&&Zt(this._r,e._r)}}class ah extends Dn{constructor(e,t){super(e),this.ar=t}_toFieldTransform(e){const t=new _s(e.serializer,Fi(e.serializer,this.ar));return new Ts(e.path,t)}isEqual(e){return e instanceof ah&&(this.ar===e.ar||Number.isNaN(this.ar)&&Number.isNaN(e.ar))}}class uh extends Dn{constructor(e,t){super(e),this.ar=t}_toFieldTransform(e){const t=new li(e.serializer,Fi(e.serializer,this.ar));return new Ts(e.path,t)}isEqual(e){return e instanceof uh&&(this.ar===e.ar||Number.isNaN(this.ar)&&Number.isNaN(e.ar))}}class ch extends Dn{constructor(e,t){super(e),this.ar=t}_toFieldTransform(e){const t=new Bi(e.serializer,Fi(e.serializer,this.ar));return new Ts(e.path,t)}isEqual(e){return e instanceof ch&&(this.ar===e.ar||Number.isNaN(this.ar)&&Number.isNaN(e.ar))}}function lh(r,e,t,n){const s=r.createContext(1,e,t);hh("Data must be an object, but it was:",s,n);const i=[],o=et.empty();Fr(n,((u,l)=>{const B=dh(e,u,t);l=ne(l);const d=s.childContextForFieldPath(B);if(l instanceof ya)i.push(B);else{const C=gn(l,d);C!=null&&(i.push(B),o.set(B,C))}}));const a=new St(i);return new Zm(o,a,s.fieldTransforms)}function Bh(r,e,t,n,s,i){const o=r.createContext(1,e,t),a=[en(e,n,t)],u=[s];if(i.length%2!=0)throw new M(S.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let C=0;C<i.length;C+=2)a.push(en(e,i[C])),u.push(i[C+1]);const l=[],B=et.empty();for(let C=a.length-1;C>=0;--C)if(!i_(l,a[C])){const g=a[C];let D=u[C];D=ne(D);const N=o.childContextForFieldPath(g);if(D instanceof ya)l.push(g);else{const V=gn(D,N);V!=null&&(l.push(g),B.set(g,V))}}const d=new St(l);return new Zm(B,d,o.fieldTransforms)}function n_(r,e,t,n=!1){return gn(t,r.createContext(n?4:3,e))}function gn(r,e,t){if(s_(r=ne(r)))return hh("Unsupported field value:",e,r),r_(r,e);if(r instanceof Dn)return(function(s,i){if(!e_(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const o=s._toFieldTransform(i);o&&i.fieldTransforms.push(o)})(r,e),null;if(r===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),r instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(s,i){const o=[];let a=0;for(const u of s){let l=gn(u,i.childContextForArray(a));l==null&&(l={nullValue:"NULL_VALUE"}),o.push(l),a++}return{arrayValue:{values:o}}})(r,e)}return(function(s,i,o){if((s=ne(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return Fi(i.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const a=Ee.fromDate(s);return{timestampValue:pi(i.serializer,a)}}if(s instanceof Ee){const a=new Ee(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:pi(i.serializer,a)}}if(s instanceof Yt)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof Pt)return{bytesValue:wm(i.serializer,s._byteString)};if(s instanceof Ie){const a=i.databaseId,u=s.firestore._databaseId;if(!u.isEqual(a))throw i.createError(`Document reference is for database ${u.projectId}/${u.database} but should be for database ${a.projectId}/${a.database}`);return{referenceValue:eh(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof wt)return(function(u,l){const B=u instanceof wt?u.toArray():u;return{mapValue:{fields:{[UB]:{stringValue:HB},[fs]:{arrayValue:{values:B.map((C=>{if(typeof C!="number")throw l.createError("VectorValues must only contain numeric values.");return ac(l.serializer,C)}))}}}}}})(s,i);if(Vm(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${oc(s)}`)})(r,e)}function r_(r,e){const t={};return kg(r)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Fr(r,((n,s)=>{const i=gn(s,e.childContextForField(n));i!=null&&(t[n]=i)})),{mapValue:{fields:t}}}function s_(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof Ee||r instanceof Yt||r instanceof Pt||r instanceof Ie||r instanceof Dn||r instanceof wt||Vm(r))}function hh(r,e,t){if(!s_(t)||!ga(t)){const n=oc(t);throw n==="an object"?e.createError(r+" a custom object"):e.createError(r+" "+n)}}function en(r,e,t){if((e=ne(e))instanceof vs)return e._internalPath;if(typeof e=="string")return dh(r,e);throw ku("Field path arguments must be of type string or ",r,!1,void 0,t)}const hA=new RegExp("[~\\*/\\[\\]]");function dh(r,e,t){if(e.search(hA)>=0)throw ku(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,t);try{return new vs(...e.split("."))._internalPath}catch{throw ku(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,t)}}function ku(r,e,t,n,s){const i=n&&!n.isEmpty(),o=s!==void 0;let a=`Function ${e}() called with invalid data`;t&&(a+=" (via `toFirestore()`)"),a+=". ";let u="";return(i||o)&&(u+=" (found",i&&(u+=` in field ${n}`),o&&(u+=` in document ${s}`),u+=")"),new M(S.INVALID_ARGUMENT,a+r+u)}function i_(r,e){return r.some((t=>t.isEqual(e)))}function o_(r){return typeof r._readUserData=="function"}/**
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
 */class Et{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const n=et.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const i=this.optionDefinitions[s];if(s in e){const o=e[s];let a;i.nestedOptions&&ga(o)?a={mapValue:{fields:new Et(i.nestedOptions).getOptionsProto(t,o)}}:o&&(a=gn(o,t)??void 0),a&&n.set(Je.fromServerFormat(i.serverName),a)}}return n}getOptionsProto(e,t,n){const s=this._getKnownOptions(t,e);if(n){const i=new Map(MB(n,((o,a)=>[Je.fromServerFormat(a),o!==void 0?gn(o,e):null])));s.setAll(i)}return s.value.mapValue.fields??{}}}/**
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
 */function dA(r){return typeof r=="object"&&r!==null&&!!("nullValue"in r&&(r.nullValue===null||r.nullValue==="NULL_VALUE")||"booleanValue"in r&&(r.booleanValue===null||typeof r.booleanValue=="boolean")||"integerValue"in r&&(r.integerValue===null||typeof r.integerValue=="number"||typeof r.integerValue=="string")||"doubleValue"in r&&(r.doubleValue===null||typeof r.doubleValue=="number")||"timestampValue"in r&&(r.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(r.timestampValue))||"stringValue"in r&&(r.stringValue===null||typeof r.stringValue=="string")||"bytesValue"in r&&(r.bytesValue===null||r.bytesValue instanceof Uint8Array)||"referenceValue"in r&&(r.referenceValue===null||typeof r.referenceValue=="string")||"geoPointValue"in r&&(r.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(r.geoPointValue))||"arrayValue"in r&&(r.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(r.arrayValue))||"mapValue"in r&&(r.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!ga(t.fields))})(r.mapValue))||"fieldReferenceValue"in r&&(r.fieldReferenceValue===null||typeof r.fieldReferenceValue=="string")||"functionValue"in r&&(r.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(r.functionValue))||"pipelineValue"in r&&(r.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(r.pipelineValue)))}/**
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
 */function fA(){return new ya("deleteField")}function CA(){return new sh("serverTimestamp")}function pA(...r){return new ih("arrayUnion",r)}function gA(...r){return new oh("arrayRemove",r)}function mA(r){return new ah("increment",r)}function _A(r){return new uh("minimum",r)}function EA(r){return new ch("maximum",r)}function a_(r){return new wt(r)}/**
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
 */function Q(r){let e;return r instanceof Ps?r:(e=ga(r)?TA(r):r instanceof Array?AA(r):u_(r,void 0),e)}function Al(r){if(r instanceof Ps)return r;if(r instanceof wt)return na(r);if(Array.isArray(r))return na(a_(r));throw new Error("Unsupported value: "+typeof r)}function fh(r){return Qw(r)?Iu(r):Q(r)}class Ps{constructor(){this._protoValueType="ProtoValue"}add(e){return new x("add",[this,Q(e)],"add")}asBoolean(){if(this instanceof Rr)return this;if(this instanceof Ss)return new l_(this);if(this instanceof bs)return new wA(this);if(this instanceof x)return new c_(this);throw new M("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new x("subtract",[this,Q(e)],"subtract")}multiply(e){return new x("multiply",[this,Q(e)],"multiply")}divide(e){return new x("divide",[this,Q(e)],"divide")}mod(e){return new x("mod",[this,Q(e)],"mod")}equal(e){return new x("equal",[this,Q(e)],"equal").asBoolean()}notEqual(e){return new x("not_equal",[this,Q(e)],"notEqual").asBoolean()}lessThan(e){return new x("less_than",[this,Q(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new x("less_than_or_equal",[this,Q(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new x("greater_than",[this,Q(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new x("greater_than_or_equal",[this,Q(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const n=[e,...t].map((s=>Q(s)));return new x("array_concat",[this,...n],"arrayConcat")}arrayContains(e){return new x("array_contains",[this,Q(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new vo(e.map(Q),"arrayContainsAll"):e;return new x("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new vo(e.map(Q),"arrayContainsAny"):e;return new x("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new x("array_reverse",[this])}arrayLength(){return new x("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new vo(e.map(Q),"equalAny"):e;return new x("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new vo(e.map(Q),"notEqualAny"):e;return new x("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new x("exists",[this],"exists").asBoolean()}charLength(){return new x("char_length",[this],"charLength")}like(e){return new x("like",[this,Q(e)],"like").asBoolean()}regexContains(e){return new x("regex_contains",[this,Q(e)],"regexContains").asBoolean()}regexFind(e){return new x("regex_find",[this,Q(e)],"regexFind")}regexFindAll(e){return new x("regex_find_all",[this,Q(e)],"regexFindAll")}regexMatch(e){return new x("regex_match",[this,Q(e)],"regexMatch").asBoolean()}stringContains(e){return new x("string_contains",[this,Q(e)],"stringContains").asBoolean()}startsWith(e){return new x("starts_with",[this,Q(e)],"startsWith").asBoolean()}endsWith(e){return new x("ends_with",[this,Q(e)],"endsWith").asBoolean()}toLower(){return new x("to_lower",[this],"toLower")}toUpper(){return new x("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(Q(e)),new x("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(Q(e)),new x("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(Q(e)),new x("rtrim",t,"rtrim")}type(){return new x("type",[this])}isType(e){return new x("is_type",[this,na(e)],"isType").asBoolean()}stringConcat(e,...t){const n=[e,...t].map(Q);return new x("string_concat",[this,...n],"stringConcat")}stringIndexOf(e){return new x("string_index_of",[this,Q(e)],"stringIndexOf")}stringRepeat(e){return new x("string_repeat",[this,Q(e)],"stringRepeat")}stringReplaceAll(e,t){return new x("string_replace_all",[this,Q(e),Q(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new x("string_replace_one",[this,Q(e),Q(t)],"stringReplaceOne")}concat(e,...t){const n=[e,...t].map(Q);return new x("concat",[this,...n],"concat")}reverse(){return new x("reverse",[this],"reverse")}arrayFilter(e,t){return new x("array_filter",[this,Q(e),t],"arrayFilter")}arrayTransform(e,t){return new x("array_transform",[this,Q(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,n){return new x("array_transform",[this,Q(e),Q(t),n],"arrayTransformWithIndex")}arraySlice(e,t){const n=[this,Q(e)];return t!==void 0&&n.push(Q(t)),new x("array_slice",n,"arraySlice")}arrayFirst(){return new x("array_first",[this],"arrayFirst")}arrayFirstN(e){return new x("array_first_n",[this,Q(e)],"arrayFirstN")}arrayLast(){return new x("array_last",[this],"arrayLast")}arrayLastN(e){return new x("array_last_n",[this,Q(e)],"arrayLastN")}arrayMaximum(){return new x("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new x("maximum_n",[this,Q(e)],"arrayMaximumN")}arrayMinimum(){return new x("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new x("minimum_n",[this,Q(e)],"arrayMinimumN")}arrayIndexOf(e){return new x("array_index_of",[this,Q(e),Q("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new x("array_index_of",[this,Q(e),Q("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new x("array_index_of_all",[this,Q(e)],"arrayIndexOfAll")}byteLength(){return new x("byte_length",[this],"byteLength")}ceil(){return new x("ceil",[this])}floor(){return new x("floor",[this])}abs(){return new x("abs",[this])}exp(){return new x("exp",[this])}mapGet(e){return new x("map_get",[this,na(e)],"mapGet")}mapSet(e,t,...n){const s=[this,Q(e),Q(t),...n.map(Q)];return new x("map_set",s,"mapSet")}mapKeys(){return new x("map_keys",[this],"mapKeys")}mapValues(){return new x("map_values",[this],"mapValues")}mapEntries(){return new x("map_entries",[this],"mapEntries")}getField(e){return new x("get_field",[this,Q(e)],"get_field")}count(){return Gt._create("count",[this],"count")}sum(){return Gt._create("sum",[this],"sum")}average(){return Gt._create("average",[this],"average")}minimum(){return Gt._create("minimum",[this],"minimum")}maximum(){return Gt._create("maximum",[this],"maximum")}first(){return Gt._create("first",[this],"first")}last(){return Gt._create("last",[this],"last")}arrayAgg(){return Gt._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return Gt._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return Gt._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const n=[e,...t];return new x("maximum",[this,...n.map(Q)],"logicalMaximum")}logicalMinimum(e,...t){const n=[e,...t];return new x("minimum",[this,...n.map(Q)],"minimum")}vectorLength(){return new x("vector_length",[this],"vectorLength")}cosineDistance(e){return new x("cosine_distance",[this,Al(e)],"cosineDistance")}dotProduct(e){return new x("dot_product",[this,Al(e)],"dotProduct")}euclideanDistance(e){return new x("euclidean_distance",[this,Al(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new x("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new x("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new x("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new x("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new x("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new x("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new x("timestamp_add",[this,Q(e),Q(t)],"timestampAdd")}timestampSubtract(e,t){return new x("timestamp_subtract",[this,Q(e),Q(t)],"timestampSubtract")}timestampDiff(e,t){return new x("timestamp_diff",[this,fh(e),Q(t)],"timestampDiff")}timestampExtract(e,t){const n=[this,Q(e)];return t&&n.push(Q(t)),new x("timestamp_extract",n,"timestampExtract")}documentId(){return new x("document_id",[this],"documentId")}parent(){return new x("parent",[this],"parent")}substring(e,t){const n=Q(e);return new x("substring",t===void 0?[this,n]:[this,n,Q(t)],"substring")}arrayGet(e){return new x("array_get",[this,Q(e)],"arrayGet")}isError(){return new x("is_error",[this],"isError").asBoolean()}ifError(e){const t=new x("if_error",[this,Q(e)],"ifError");return e instanceof Rr?t.asBoolean():t}isAbsent(){return new x("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new x("map_remove",[this,Q(e)],"mapRemove")}mapMerge(e,...t){const n=Q(e),s=t.map(Q);return new x("map_merge",[this,n,...s],"mapMerge")}pow(e){return new x("pow",[this,Q(e)])}trunc(e){return e===void 0?new x("trunc",[this]):new x("trunc",[this,Q(e)],"trunc")}round(e){return e===void 0?new x("round",[this]):new x("round",[this,Q(e)],"round")}collectionId(){return new x("collection_id",[this])}length(){return new x("length",[this])}ln(){return new x("ln",[this])}sqrt(){return new x("sqrt",[this])}stringReverse(){return new x("string_reverse",[this])}ifAbsent(e){return new x("if_absent",[this,Q(e)],"ifAbsent")}ifNull(e){return new x("if_null",[this,Q(e)],"ifNull")}coalesce(e,...t){return new x("coalesce",[this,Q(e),...t.map(Q)],"coalesce")}join(e){return new x("join",[this,Q(e)],"join")}log10(){return new x("log10",[this])}arraySum(){return new x("sum",[this])}split(e){return new x("split",[this,Q(e)])}timestampTruncate(e,t){const n=[this,Q(e)];return t&&n.push(Q(t)),new x("timestamp_trunc",n)}ascending(){return vA(this)}descending(){return RA(this)}as(e){return new DA(this,e,"as")}}class Gt{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,n){const s=new Gt(e,t);return s._methodName=n,s}as(e){return new IA(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class IA{constructor(e,t,n){this.aggregate=e,this.alias=t,this._methodName=n}_readUserData(e){this.aggregate._readUserData(e)}}class DA{constructor(e,t,n){this.expr=e,this.alias=t,this._methodName=n,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class vo extends Ps{constructor(e,t){super(),this.ur=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.ur.map((t=>t._toProto(e)))}}}_readUserData(e){this.ur.forEach((t=>t._readUserData(e)))}}class bs extends Ps{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new x("geo_distance",[this,Q(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function Iu(r){return yA(r,"field")}function yA(r,e){return new bs(typeof r=="string"?on===r?xm()._internalPath:en("field",r):r._internalPath,e)}class Ss extends Ps{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new Ss(e,void 0);return t._protoValue=e,t}_toProto(e){return q(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,dA(this._protoValue)||(this._protoValue=gn(this.value,e))}}function na(r,e){return u_(r,"constant")}function u_(r,e){const t=new Ss(r,e);return typeof r=="boolean"?new l_(t):t}class x extends Ps{constructor(e,t,n,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,n!==void 0&&(this._methodName=n),s!==void 0&&(this._options=s)}get _optionsUtil(){return new Et({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((n=>n._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class Rr extends Ps{get _methodName(){return this._expr._methodName}countIf(){return Gt._create("count_if",[this],"countIf")}not(){return new x("not",[this],"not").asBoolean()}conditional(e,t){return new x("conditional",[this,e,t],"conditional")}ifError(e){const t=Q(e),n=new x("if_error",[this,t],"ifError");return t instanceof Rr?n.asBoolean():n}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class c_ extends Rr{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class l_ extends Rr{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class wA extends Rr{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function TA(r,e){const t=[];for(const n in r)if(Object.prototype.hasOwnProperty.call(r,n)){const s=r[n];t.push(na(n)),t.push(Q(s))}return new x("map",t,"map")}function AA(r){return(function(t,n){return new x("array",t.map((s=>Q(s))),n)})(r,"array")}function vA(r){return new Ch(fh(r),"ascending","ascending")}function RA(r){return new Ch(fh(r),"descending","descending")}class Ch{constructor(e,t,n){this.expr=e,this.direction=t,this._methodName=n,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:km(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
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
 */class jt{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class B_ extends jt{get _name(){return"add_fields"}get _optionsUtil(){return new Et({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[ta(e,this.fields)]}}_readUserData(e){super._readUserData(e),br(this.fields,e)}}class h_ extends jt{get _name(){return"aggregate"}get _optionsUtil(){return new Et({})}constructor(e,t,n){super(n),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[ta(e,this.accumulators),ta(e,this.groups)]}}_readUserData(e){super._readUserData(e),br(this.groups,e),br(this.accumulators,e)}}class d_ extends jt{get _name(){return"distinct"}get _optionsUtil(){return new Et({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[ta(e,this.groups)]}}_readUserData(e){super._readUserData(e),br(this.groups,e)}}class wa extends jt{get _name(){return"collection"}get _optionsUtil(){return new Et({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Er=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.Er}]}}_readUserData(e){super._readUserData(e)}}class Ta extends jt{get _name(){return"collection_group"}get _optionsUtil(){return new Et({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class gc extends jt{get _name(){return"database"}get _optionsUtil(){return new Et({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class mc extends jt{get _name(){return"documents"}get _optionsUtil(){return new Et({})}constructor(e,t){if(super(t),!e||e.length===0)throw new M(S.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const n=e.map((i=>i.startsWith("/")?i:"/"+i)),s=new Set(n);if(s.size!==n.length)throw new M(S.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.hr=n,this.Tr=s}_toProto(e){return{...super._toProto(e),args:this.hr.map((t=>({referenceValue:t})))}}_readUserData(e){super._readUserData(e)}}class Aa extends jt{get _name(){return"where"}get _optionsUtil(){return new Et({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),br(this.condition,e)}}class Pr extends jt{get _name(){return"limit"}get _optionsUtil(){return new Et({})}constructor(e,t){q(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[Fi(e,this.limit)]}}}class JC extends jt{get _name(){return"offset"}get _optionsUtil(){return new Et({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[Fi(e,this.offset)]}}}class PA extends jt{get _name(){return"select"}get _optionsUtil(){return new Et({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[ta(e,this.selections)]}}_readUserData(e){super._readUserData(e),br(this.selections,e)}}class un extends jt{get _name(){return"sort"}get _optionsUtil(){return new Et({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map((t=>t._toProto(e)))}}_readUserData(e){super._readUserData(e),br(this.orderings,e)}}class ph extends jt{get _name(){return"replace_with"}get _optionsUtil(){return new Et({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),km(ph.Pr)]}}_readUserData(e){super._readUserData(e),br(this.map,e)}}ph.Pr="full_replace";function br(r,e){return o_(r)?r._readUserData(e):Array.isArray(r)?r.forEach((t=>t._readUserData(e))):r instanceof Map?r.forEach((t=>t._readUserData(e))):Object.values(r).forEach((t=>t._readUserData(e))),r}/**
 * @license
 * Copyright 2026 Google LLC
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
 */class ko{constructor(e,t,n,s){this._db=e,this.userDataReader=t,this._userDataWriter=n,this.stages=s}Ar(e,t){const n=this.userDataReader.createContext(3,e);return o_(t)?t._readUserData(n):Array.isArray(t)?t.forEach((s=>s._readUserData(n))):t.forEach((s=>s._readUserData(n))),t}where(e){const t=this.stages.map((n=>n));return this.Ar("where",e),t.push(new Aa(e,{})),new ko(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){const t=this.stages.map((n=>n));return t.push(new Pr(e,{})),new ko(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){const n=this.stages.map((s=>s));return"orderings"in e?n.push(new un(this.Ar("sort",e.orderings),{})):n.push(new un(this.Ar("sort",[e,...t]),{})),new ko(this._db,this.userDataReader,this._userDataWriter,n)}Vr(e){return{pipeline:{stages:this.stages.map((t=>t._toProto(e)))}}}}// Copyright 2024 Google LLC* @license
class w{constructor(e,t){this.type=e,this.value=t}static dr(){return new w("ERROR",void 0)}static mr(){return new w("UNSET",void 0)}static pr(){return new w("NULL",fn)}static newValue(e){return Ht(e)?new w("NULL",fn):(function(n){return!!n&&"booleanValue"in n})(e)?new w("BOOLEAN",e):an(e)?new w("INT",e):rs(e)?new w("DOUBLE",e):(function(n){return!!n&&"timestampValue"in n&&!!n.timestampValue})(e)?new w("TIMESTAMP",e):(function(n){return!!n&&"stringValue"in n})(e)?new w("STRING",e):(function(n){return!!n&&"bytesValue"in n})(e)?new w("BYTES",e):e.referenceValue?new w("REFERENCE",e):e.geoPointValue?new w("GEO_POINT",e):Ar(e)?new w("ARRAY",e):ps(e)?new w("VECTOR",e):as(e)?new w("MAP",e):new w("ERROR",void 0)}gr(){return this.type==="ERROR"||this.type==="UNSET"}yr(){return this.type==="NULL"}}function xo(r){if(!r.gr())return r.value}function f_(r){return r instanceof Rr?r._expr:r}function ie(r){if((r=f_(r))instanceof bs)return new bA(r);if(r instanceof Ss)return new SA(r);if(r instanceof vo)return new NA(r);if(r instanceof x){if(r.name==="add")return new LA(r);if(r.name==="subtract")return new VA(r);if(r.name==="multiply")return new kA(r);if(r.name==="divide")return new xA(r);if(r.name==="mod")return new MA(r);if(r.name==="and")return new GA(r);if(r.name==="equal")return new XA(r);if(r.name==="not_equal")return new ZA(r);if(r.name==="less_than")return new ev(r);if(r.name==="less_than_or_equal")return new tv(r);if(r.name==="greater_than")return new nv(r);if(r.name==="greater_than_or_equal")return new rv(r);if(r.name==="array_concat")return new sv(r);if(r.name==="array_reverse")return new iv(r);if(r.name==="array_contains")return new ov(r);if(r.name==="array_contains_all")return new av(r);if(r.name==="array_contains_any")return new uv(r);if(r.name==="array_length")return new cv(r);if(r.name==="array_element")return new lv(r);if(r.name==="equal_any")return new C_(r);if(r.name==="not_equal_any")return new HA(r);if(r.name==="is_nan")return new qA(r);if(r.name==="is_not_nan")return new jA(r);if(r.name==="is_null")return new JA(r);if(r.name==="is_not_null")return new KA(r);if(r.name==="is_error")return new zA(r);if(r.name==="exists")return new QA(r);if(r.name==="not")return new _c(r);if(r.name==="or")return new UA(r);if(r.name==="xor")return new gh(r);if(r.name==="conditional")return new WA(r);if(r.name==="maximum")return new $A(r);if(r.name==="minimum")return new YA(r);if(r.name==="reverse")return new Bv(r);if(r.name==="replace_first")return new hv(r);if(r.name==="replace_all")return new dv(r);if(r.name==="char_length")return new fv(r);if(r.name==="byte_length")return new Cv(r);if(r.name==="like")return new pv(r);if(r.name==="regex_contains")return new gv(r);if(r.name==="regex_match")return new mv(r);if(r.name==="string_contains")return new _v(r);if(r.name==="starts_with")return new Ev(r);if(r.name==="ends_with")return new Iv(r);if(r.name==="to_lower")return new Dv(r);if(r.name==="to_upper")return new yv(r);if(r.name==="trim")return new wv(r);if(r.name==="string_concat")return new Tv(r);if(r.name==="map_get")return new Av(r);if(r.name==="cosine_distance")return new vv(r);if(r.name==="dot_product")return new Rv(r);if(r.name==="euclidean_distance")return new Pv(r);if(r.name==="vector_length")return new bv(r);if(r.name==="unix_micros_to_timestamp")return new Lv(r);if(r.name==="timestamp_to_unix_micros")return new xv(r);if(r.name==="unix_millis_to_timestamp")return new Vv(r);if(r.name==="timestamp_to_unix_millis")return new Mv(r);if(r.name==="unix_seconds_to_timestamp")return new kv(r);if(r.name==="timestamp_to_unix_seconds")return new Gv(r);if(r.name==="timestamp_add")return new Uv(r);if(r.name==="timestamp_subtract")return new Hv(r)}throw new Error(`Unknown Expr : ${r}`)}class bA{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===on)return w.newValue({referenceValue:gi(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return w.newValue({timestampValue:Eu(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return w.newValue({timestampValue:Eu(e.serializer,t.createTime)});const n=t.data.field(this.expr._fieldPath);return n?ma(n)?w.newValue((function(i,o){if(i.serverTimestampBehavior==="estimate")return{timestampValue:Eu(i.serializer,ee.fromTimestamp(oi(o)))};if(i.serverTimestampBehavior==="previous"){const a=_a(o);if(a)return a}return{nullValue:"NULL_VALUE"}})(e,n)):w.newValue(n):w.mr()}}class SA{constructor(e){this.expr=e}evaluate(e,t){return w.newValue(this.expr._getValue())}}class NA{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.ur.map((s=>ie(s).evaluate(e,t)));return n.some((s=>s.gr()))?w.dr():w.newValue({arrayValue:{values:n.map((s=>s.value))}})}}function ht(r){return rs(r)?Number(r.doubleValue):Number(r.integerValue)}function mn(r){return BigInt(r.integerValue)}const OA=BigInt("0x7fffffffffffffff"),FA=-BigInt("0x8000000000000000");class va{constructor(e){this.expr=e}evaluate(e,t){q(this.expr.params.length>=2,24778);const n=ie(this.expr.params[0]).evaluate(e,t),s=ie(this.expr.params[1]).evaluate(e,t);let i=this.wr(n,s);for(const o of this.expr.params.slice(2)){const a=ie(o).evaluate(e,t);i=this.wr(i,a)}return i}wr(e,t){if(e.gr()||t.gr())return w.dr();if(e.yr()||t.yr())return w.pr();const n=e.value,s=t.value;if(!rs(n)&&!an(n)||!rs(s)&&!an(s))return w.dr();if(rs(n)||rs(s)){const i=this.br(n,s);return i?w.newValue(i):w.dr()}if(an(n)&&an(s)){const i=this.vr(n,s);return i===void 0?w.dr():typeof i=="number"?w.newValue({doubleValue:i}):i<FA||i>OA?w.dr():w.newValue({integerValue:`${i}`})}return w.dr()}}function Gn(r,e){return Xe(r)!==Xe(e)?"TYPE_MISMATCH":Vt(r)||Vt(e)?"NOT_EQ":Ht(r)&&Ht(e)?"EQ":Ht(r)||Ht(e)?"NULL":Ar(r)&&Ar(e)?(function(n,s){var o,a,u;if(((o=n.values)==null?void 0:o.length)!==((a=s.values)==null?void 0:a.length))return"NOT_EQ";let i=!1;for(let l=0;l<(((u=n.values)==null?void 0:u.length)??0);l++){const B=n.values[l],d=s.values[l];switch(Gn(B,d)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:Y(44609,{Sr:B,Dr:d})}}return i?"NULL":"EQ"})(r.arrayValue,e.arrayValue):ps(r)&&ps(e)||as(r)&&as(e)?(function(n,s){const i=n.fields||{},o=s.fields||{};if(Nu(i)!==Nu(o))return"NOT_EQ";let a=!1;for(const u in i)if(i.hasOwnProperty(u)){if(o[u]===void 0)return"NOT_EQ";switch(Gn(i[u],o[u])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":a=!0}}return a?"NULL":"EQ"})(r.mapValue,e.mapValue):(function(n,s){return zt(n,s,{o:!1,t:!0,i:!0})})(r,e)?"EQ":"NOT_EQ"}class LA extends va{vr(e,t){return mn(e)+mn(t)}br(e,t){return{doubleValue:ht(e)+ht(t)}}}class VA extends va{constructor(e){super(e),this.expr=e}vr(e,t){return mn(e)-mn(t)}br(e,t){return{doubleValue:ht(e)-ht(t)}}}class kA extends va{constructor(e){super(e),this.expr=e}vr(e,t){return mn(e)*mn(t)}br(e,t){return{doubleValue:ht(e)*ht(t)}}}class xA extends va{constructor(e){super(e),this.expr=e}vr(e,t){const n=mn(t);if(n!==BigInt(0))return mn(e)/n}br(e,t){const n=ht(t);return n===0?{doubleValue:ai(n)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:ht(e)/n}}}class MA extends va{constructor(e){super(e),this.expr=e}vr(e,t){const n=mn(t);if(n!==BigInt(0))return mn(e)%n}br(e,t){const n=ht(t);if(n!==0)return{doubleValue:ht(e)%n}}}class GA{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const a=ie(o).evaluate(e,t);switch(a.type){case"BOOLEAN":if(!((i=a.value)!=null&&i.booleanValue))return w.newValue(ut);break;case"NULL":s=!0;break;default:n=!0}}return n?w.dr():s?w.pr():w.newValue(Lt)}}class _c{constructor(e){this.expr=e}evaluate(e,t){var s;q(this.expr.params.length===1,9634);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BOOLEAN":return w.newValue({booleanValue:!((s=n.value)!=null&&s.booleanValue)});case"NULL":return w.pr();default:return w.dr()}}}class UA{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const a=ie(o).evaluate(e,t);switch(a.type){case"BOOLEAN":if((i=a.value)!=null&&i.booleanValue)return w.newValue(Lt);break;case"NULL":s=!0;break;default:n=!0}}return n?w.dr():s?w.pr():w.newValue(ut)}}class gh{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const a=ie(o).evaluate(e,t);switch(a.type){case"BOOLEAN":n=gh.xor(n,!!((i=a.value)!=null&&i.booleanValue));break;case"NULL":s=!0;break;default:return w.dr()}}return s?w.pr():w.newValue({booleanValue:n})}static xor(e,t){return(e||t)&&!(e&&t)}}class C_{constructor(e){this.expr=e}evaluate(e,t){var o,a;q(this.expr.params.length===2,55094);let n=!1;const s=ie(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":n=!0;break;case"ERROR":case"UNSET":return w.dr()}const i=ie(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return w.dr()}if(n)return w.pr();for(const u of((a=(o=i.value)==null?void 0:o.arrayValue)==null?void 0:a.values)??[])switch(Ht(s.value)&&Ht(u)?"EQ":Gn(s.value,u)){case"EQ":return w.newValue(Lt);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:Y(44608,{value:s.value,candidate:u})}return n?w.pr():w.newValue(ut)}}class HA{constructor(e){this.expr=e}evaluate(e,t){return new _c(new x("not",[new x("equal_any",this.expr.params)])).evaluate(e,t)}}class qA{constructor(e){this.expr=e}evaluate(e,t){q(this.expr.params.length===1,23322);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return w.newValue(ut);case"DOUBLE":return w.newValue({booleanValue:isNaN(ht(n.value))});case"NULL":return w.pr();default:return w.dr()}}}class jA{constructor(e){this.expr=e}evaluate(e,t){return q(this.expr.params.length===1,50406),new _c(new x("not",[new x("is_nan",this.expr.params)])).evaluate(e,t)}}class JA{constructor(e){this.expr=e}evaluate(e,t){switch(q(this.expr.params.length===1,23123),ie(this.expr.params[0]).evaluate(e,t).type){case"NULL":return w.newValue(Lt);case"UNSET":case"ERROR":return w.dr();default:return w.newValue(ut)}}}class KA{constructor(e){this.expr=e}evaluate(e,t){return q(this.expr.params.length===1,23167),new _c(new x("not",[new x("is_null",this.expr.params)])).evaluate(e,t)}}class zA{constructor(e){this.expr=e}evaluate(e,t){return q(this.expr.params.length===1,5228),ie(this.expr.params[0]).evaluate(e,t).type==="ERROR"?w.newValue(Lt):w.newValue(ut)}}class QA{constructor(e){this.expr=e}evaluate(e,t){switch(q(this.expr.params.length===1,6877),ie(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return w.dr();case"UNSET":return w.newValue(ut);default:return w.newValue(Lt)}}}class WA{constructor(e){this.expr=e}evaluate(e,t){var s;q(this.expr.params.length===3,11706);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BOOLEAN":return(s=n.value)!=null&&s.booleanValue?ie(this.expr.params[1]).evaluate(e,t):ie(this.expr.params[2]).evaluate(e,t);case"NULL":return ie(this.expr.params[2]).evaluate(e,t);default:return w.dr()}}}class $A{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((i=>ie(i).evaluate(e,t)));let s;for(const i of n)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||_t(i.value,s.value)>0?i:s}return s===void 0?w.pr():s}}class YA{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((i=>ie(i).evaluate(e,t)));let s;for(const i of n)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||_t(i.value,s.value)<0?i:s}return s===void 0?w.pr():s}}class Mi{constructor(e){this.expr=e}evaluate(e,t){q(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ERROR":case"UNSET":return w.dr()}const s=ie(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return w.dr()}return this.Cr(n,s)}}class XA extends Mi{constructor(e){super(e),this.expr=e}Cr(e,t){if(e.yr()&&t.yr())return w.newValue(Lt);if(e.yr()||t.yr()||Vt(e.value)||Vt(t.value)||Xe(e.value)!==Xe(t.value))return w.newValue(ut);switch(Gn(e.value,t.value)){case"EQ":return w.newValue(Lt);case"NOT_EQ":return w.newValue(ut);case"NULL":return w.pr();default:Y(44615,{left:e,right:t})}}}class ZA extends Mi{constructor(e){super(e),this.expr=e}Cr(e,t){switch(Gn(e.value,t.value)){case"EQ":return w.newValue(ut);case"NOT_EQ":case"TYPE_MISMATCH":return w.newValue(Lt);case"NULL":return w.pr();default:Y(44614,{left:e,right:t})}}}class ev extends Mi{constructor(e){super(e),this.expr=e}Cr(e,t){return Xe(e.value)!==Xe(t.value)||Vt(e.value)||Vt(t.value)?w.newValue(ut):w.newValue({booleanValue:_t(e.value,t.value)<0})}}class tv extends Mi{constructor(e){super(e),this.expr=e}Cr(e,t){return Xe(e.value)!==Xe(t.value)||Vt(e.value)||Vt(t.value)?w.newValue(ut):Gn(e.value,t.value)==="EQ"?w.newValue(Lt):w.newValue({booleanValue:_t(e.value,t.value)<0})}}class nv extends Mi{constructor(e){super(e),this.expr=e}Cr(e,t){return Xe(e.value)!==Xe(t.value)||Vt(e.value)||Vt(t.value)?w.newValue(ut):w.newValue({booleanValue:_t(e.value,t.value)>0})}}class rv extends Mi{constructor(e){super(e),this.expr=e}Cr(e,t){return Xe(e.value)!==Xe(t.value)||Vt(e.value)||Vt(t.value)?w.newValue(ut):Gn(e.value,t.value)==="EQ"?w.newValue(Lt):w.newValue({booleanValue:_t(e.value,t.value)>0})}}class sv{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class iv{constructor(e){this.expr=e}evaluate(e,t){var s;q(this.expr.params.length===1,216);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return w.pr();case"ARRAY":{const i=((s=n.value.arrayValue)==null?void 0:s.values)??[];return w.newValue({arrayValue:{values:[...i].reverse()}})}default:return w.dr()}}}class ov{constructor(e){this.expr=e}evaluate(e,t){return q(this.expr.params.length===2,52884),new C_(new x("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class av{constructor(e){this.expr=e}evaluate(e,t){var u,l,B,d;q(this.expr.params.length===2,1392);let n=!1;const s=ie(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":n=!0;break;default:return w.dr()}const i=ie(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return w.dr()}if(n)return w.pr();const o=((l=(u=i.value)==null?void 0:u.arrayValue)==null?void 0:l.values)??[],a=((d=(B=s.value)==null?void 0:B.arrayValue)==null?void 0:d.values)??[];for(const C of o){let g=!1;n=!1;for(const D of a){switch(Ht(C)&&Ht(D)?"EQ":Gn(C,D)){case"EQ":g=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:Y(44613,{value:D,search:C})}if(g)break}if(!g)return w.newValue(ut)}return w.newValue(Lt)}}class uv{constructor(e){this.expr=e}evaluate(e,t){var u,l,B,d;q(this.expr.params.length===2,2680);let n=!1;const s=ie(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":n=!0;break;default:return w.dr()}const i=ie(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return w.dr()}if(n)return w.pr();const o=((l=(u=i.value)==null?void 0:u.arrayValue)==null?void 0:l.values)??[],a=((d=(B=s.value)==null?void 0:B.arrayValue)==null?void 0:d.values)??[];for(const C of a)for(const g of o)switch(Ht(C)&&Ht(g)?"EQ":Gn(C,g)){case"EQ":return w.newValue(Lt);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:Y(60403,{value:C,search:g})}return n?w.pr():w.newValue(ut)}}class cv{constructor(e){this.expr=e}evaluate(e,t){var s,i,o;q(this.expr.params.length===1,38605);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return w.pr();case"ARRAY":return w.newValue({integerValue:`${((o=(i=(s=n.value)==null?void 0:s.arrayValue)==null?void 0:i.values)==null?void 0:o.length)??0}`});default:return w.dr()}}}class lv{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Bv{constructor(e){this.expr=e}evaluate(e,t){var s,i;q(this.expr.params.length===1,1508);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return w.pr();case"BYTES":{const o=(s=n.value)==null?void 0:s.bytesValue;if(typeof o=="string"){const a=Se.fromBase64String(o).toUint8Array();return a.reverse(),w.newValue({bytesValue:Se.fromUint8Array(a).toBase64()})}return w.newValue({bytesValue:new Uint8Array(o).reverse()})}case"STRING":{const o=(i=n.value)==null?void 0:i.stringValue,a=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(o),u=Array.from(a,(l=>l.segment)).reverse();return w.newValue({stringValue:u.join("")})}default:return w.dr()}}}class hv{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class dv{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class fv{constructor(e){this.expr=e}evaluate(e,t){q(this.expr.params.length===1,19400);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return w.pr();case"STRING":{const s=(function(o){let a=0;for(let u=0;u<o.length;u++){const l=o.codePointAt(u);if(l===void 0)return;if(l<=65535)if(l>=55296&&l<=57343)if(l<=56319){const B=o.codePointAt(u+1);B!==void 0&&B>=56320&&B<=57343?(a+=1,u++):a+=1}else a+=1;else a+=1;else{if(!(l<=1114111))return;a+=1,u++}}return a})(n.value.stringValue);return s===void 0?w.dr():w.newValue({integerValue:s})}default:return w.dr()}}}class Cv{constructor(e){this.expr=e}evaluate(e,t){var s,i;q(this.expr.params.length===1,8486);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BYTES":{const o=(s=n.value)==null?void 0:s.bytesValue;return typeof o=="string"?w.newValue({integerValue:Se.fromBase64String(o).toUint8Array().length}):w.newValue({integerValue:new Uint8Array(o).length})}case"STRING":{const o=(function(u){let l=0;for(let B=0;B<u.length;B++){const d=u.codePointAt(B);if(d===void 0)return;if(d>=55296&&d<=57343){if(!(d<=56319))return;{const C=u.codePointAt(B+1);if(C===void 0||!(C>=56320&&C<=57343))return;l+=4,B++}}else if(d<=127)l+=1;else if(d<=2047)l+=2;else if(d<=65535)l+=3;else{if(!(d<=1114111))return;l+=4,B++}}return l})((i=n.value)==null?void 0:i.stringValue);return o===void 0?w.dr():w.newValue({integerValue:o})}case"NULL":return w.pr();default:return w.dr()}}}class Gi{constructor(e){this.expr=e}evaluate(e,t){var o,a;q(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let n=!1;const s=ie(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":n=!0;break;default:return w.dr()}const i=ie(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":n=!0;break;default:return w.dr()}return n?w.pr():this.Fr((o=s.value)==null?void 0:o.stringValue,(a=i.value)==null?void 0:a.stringValue)}}class pv extends Gi{Fr(e,t){try{const n=(function(o){let a="";for(let u=0;u<o.length;u++){const l=o.charAt(u);switch(l){case"_":a+=".";break;case"%":a+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":a+="\\"+l;break;default:a+=l}}return"^"+a+"$"})(t),s=kB.compile(n);return w.newValue({booleanValue:s.matches(e)})}catch(n){return nt(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${n}`),w.dr()}}}class gv extends Gi{Fr(e,t){try{const n=kB.compile(t);return w.newValue({booleanValue:n.test(e)})}catch{return nt(`Invalid regex pattern found in regex_contains: ${t}, returning error`),w.dr()}}}class mv extends Gi{Fr(e,t){try{return w.newValue({booleanValue:kB.compile(t).matches(e)})}catch{return nt(`Invalid regex pattern found in regex_match: ${t}, returning error`),w.dr()}}}class _v extends Gi{Fr(e,t){return w.newValue({booleanValue:e.includes(t)})}}class Ev extends Gi{Fr(e,t){return w.newValue({booleanValue:e.startsWith(t)})}}class Iv extends Gi{Fr(e,t){return w.newValue({booleanValue:e.endsWith(t)})}}class Dv{constructor(e){this.expr=e}evaluate(e,t){var s,i;q(this.expr.params.length===1,29079);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return w.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.toLowerCase()});case"NULL":return w.pr();default:return w.dr()}}}class yv{constructor(e){this.expr=e}evaluate(e,t){var s,i;q(this.expr.params.length===1,60487);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return w.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.toUpperCase()});case"NULL":return w.pr();default:return w.dr()}}}class wv{constructor(e){this.expr=e}evaluate(e,t){var s,i;q(this.expr.params.length===1,28544);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return w.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.trim()});case"NULL":return w.pr();default:return w.dr()}}}class Tv{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((o=>ie(o).evaluate(e,t)));let s="",i=!1;for(const o of n)switch(o.type){case"STRING":s+=o.value.stringValue;break;case"NULL":i=!0;break;default:return w.dr()}return i?w.pr():w.newValue({stringValue:s})}}class Av{constructor(e){this.expr=e}evaluate(e,t){var o,a,u,l;q(this.expr.params.length===2,4483);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"UNSET":return w.mr();case"MAP":break;default:return w.dr()}const s=ie(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return w.dr();const i=(l=(a=(o=n.value)==null?void 0:o.mapValue)==null?void 0:a.fields)==null?void 0:l[(u=s.value)==null?void 0:u.stringValue];return i===void 0?w.mr():w.newValue(i)}}class mh{constructor(e){this.expr=e}evaluate(e,t){var l,B;q(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let n=!1;const s=ie(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":n=!0;break;default:return w.dr()}const i=ie(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":n=!0;break;default:return w.dr()}if(n)return w.pr();const o=Xl(s.value),a=Xl(i.value);if(o===void 0||a===void 0||((l=o.values)==null?void 0:l.length)!==((B=a.values)==null?void 0:B.length))return w.dr();const u=this.Or(o,a);return u===void 0||isNaN(u)?w.dr():w.newValue({doubleValue:u})}}class vv extends mh{Or(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return;let i=0,o=0,a=0;for(let l=0;l<n.length;l++){if(!Tr(n[l])||!Tr(s[l]))return;const B=ht(n[l]),d=ht(s[l]);i+=B*d,o+=B*B,a+=d*d}const u=Math.sqrt(o)*Math.sqrt(a);if(u!==0)return 1-Math.max(-1,Math.min(1,i/u))}}class Rv extends mh{Or(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return 0;let i=0;for(let o=0;o<n.length;o++){if(!Tr(n[o])||!Tr(s[o]))return;i+=ht(n[o])*ht(s[o])}return i}}class Pv extends mh{Or(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return 0;let i=0;for(let o=0;o<n.length;o++){if(!Tr(n[o])||!Tr(s[o]))return;const a=ht(n[o]),u=ht(s[o]);i+=Math.pow(a-u,2)}return Math.sqrt(i)}}class bv{constructor(e){this.expr=e}evaluate(e,t){var s;q(this.expr.params.length===1,39044);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"VECTOR":{const i=Xl(n.value);return w.newValue({integerValue:((s=i==null?void 0:i.values)==null?void 0:s.length)??0})}case"NULL":return w.pr();default:return w.dr()}}}const ra=BigInt(-62135596800),sa=BigInt(253402300799),xu=BigInt(1e3),mr=BigInt(1e6),Sv=ra*xu,Nv=sa*xu+BigInt(999),Ov=ra*mr,Fv=sa*mr+BigInt(999999);function _h(r){return r>=Ov&&r<=Fv}function p_(r){return r>=ra&&r<=sa}function ia(r,e){const t=BigInt(r);return!(t<ra||t>sa)&&!(e<0||e>=1e9)&&(t!==ra||e===0)&&!(t===sa&&e>999999999)}function g_(r,e){return e<0?{seconds:r-1,nanos:e+1e9}:{seconds:r,nanos:e}}function Eh(r){return BigInt(r.seconds)*mr+BigInt(Math.trunc(r.nanoseconds/1e3))}class Ih{constructor(e){this.expr=e}evaluate(e,t){q(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return this.toTimestamp(BigInt(n.value.integerValue));case"NULL":return w.pr();default:return w.dr()}}}class Lv extends Ih{toTimestamp(e){if(!_h(e))return w.dr();let t=Number(e/mr),n=Number(e%mr*BigInt(1e3));const s=g_(t,n);return t=s.seconds,n=s.nanos,ia(t,n)?w.newValue({timestampValue:{seconds:t,nanos:n}}):w.dr()}}class Vv extends Ih{toTimestamp(e){if(!(function(o){return o>=Sv&&o<=Nv})(e))return w.dr();let t=Number(e/xu),n=Number(e%xu*BigInt(1e6));const s=g_(t,n);return t=s.seconds,n=s.nanos,ia(t,n)?w.newValue({timestampValue:{seconds:t,nanos:n}}):w.dr()}}class kv extends Ih{toTimestamp(e){if(!p_(e))return w.dr();const t=Number(e);return w.newValue({timestampValue:{seconds:t,nanos:0}})}}class Dh{constructor(e){this.expr=e}evaluate(e,t){q(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const n=ie(this.expr.params[0]).evaluate(e,t);switch(n.type){case"TIMESTAMP":break;case"NULL":return w.pr();default:return w.dr()}const s=ZB(n.value.timestampValue);return ia(s.seconds,s.nanoseconds)?this.Mr(s):w.dr()}}class xv extends Dh{Mr(e){const t=Eh(e);return _h(t)?w.newValue({integerValue:`${t.toString()}`}):w.dr()}}class Mv extends Dh{Mr(e){const t=Eh(e),n=t/BigInt(1e3),s=t%BigInt(1e3);return n>BigInt(0)||s===BigInt(0)?w.newValue({integerValue:n.toString()}):w.newValue({integerValue:(n-BigInt(1)).toString()})}}class Gv extends Dh{Mr(e){const t=BigInt(e.seconds);return p_(t)?w.newValue({integerValue:t.toString()}):w.dr()}}class m_{constructor(e){this.expr=e}evaluate(e,t){q(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let n=!1;const s=ie(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":n=!0;break;default:return w.dr()}const i=ie(this.expr.params[1]).evaluate(e,t);let o;switch(i.type){case"STRING":if(o=(function(Z){switch(Z){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(i.value.stringValue),o===void 0)return w.dr();break;case"NULL":n=!0;break;default:return w.dr()}const a=ie(this.expr.params[2]).evaluate(e,t);switch(a.type){case"INT":break;case"NULL":n=!0;break;default:return w.dr()}if(n)return w.pr();const u=BigInt(a.value.integerValue);let l;try{switch(o){case"microsecond":l=u;break;case"millisecond":l=u*BigInt(1e3);break;case"second":l=u*BigInt(1e6);break;case"minute":l=u*BigInt(6e7);break;case"hour":l=u*BigInt(36e8);break;case"day":l=u*BigInt(864e8);break;default:return w.dr()}if(o!=="microsecond"&&u!==BigInt(0)&&l/u!==BigInt(this.Nr(o)))return w.dr()}catch(H){return nt(`Error during timestamp arithmetic: ${H}`),w.dr()}const B=ZB(s.value.timestampValue);if(!ia(B.seconds,B.nanoseconds))return w.dr();const d=Eh(B),C=this.Lr(d,l);if(!_h(C))return w.dr();const g=Number(C/mr),D=C%mr,N=Number((D<0?D+mr:D)*BigInt(1e3)),V=D<0?g-1:g;return ia(V,N)?w.newValue({timestampValue:{seconds:V,nanos:N}}):w.dr()}Nr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class Uv extends m_{Lr(e,t){return e+t}}class Hv extends m_{Lr(e,t){return e-t}}// Copyright 2024 Google LLC* @license
class pt{constructor(e,t,n){this.serializer=e,this.stages=t,this.listenOptions=n,this.isCorePipeline=!0}getPipelineCollection(){return Ra(this)}getPipelineCollectionGroup(){return yh(this)}getPipelineCollectionId(){return __(this)}getPipelineDocuments(){return Mu(this)}getPipelineFlavor(){return(function(t){let n="exact";return t.stages.forEach(((s,i)=>{s._name!==d_.name&&s._name!==h_.name||(n="keyless"),s._name===PA.name&&n==="exact"&&(n="augmented"),s._name===B_.name&&i<t.stages.length-1&&n==="exact"&&(n="augmented")})),n})(this)}getPipelineSourceType(){return Fn(this)}}function Fn(r){const e=r.stages[0];return e instanceof wa||e instanceof Ta||e instanceof gc||e instanceof mc?e._name:"unknown"}function Ra(r){if(Fn(r)==="collection")return r.stages[0].Er}function yh(r){if(Fn(r)==="collection_group")return r.stages[0].collectionId}function __(r){switch(Fn(r)){case"collection":return ue.fromString(Ra(r)).lastSegment();case"collection_group":return yh(r);default:return}}function Mu(r){if(Fn(r)==="documents")return r.stages[0].hr}function oa(r){if((r=f_(r))instanceof bs)return`fld(${r.fieldName})`;if(r instanceof Ss)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof Ie?`ref(${t.path})`:t instanceof wt?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(r.value)})`;if(r instanceof x)return`fn(${r.name},[${r.params.map(oa).join(",")}])`;if(r.expressionType==="ListOfExpressions")return`list([${r.ur.map(oa).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(r,null,2)}`)}function qv(r){if(r instanceof B_)return`${r._name}(${uu(r.fields)})`;if(r instanceof h_){let e=`${r._name}(${uu(r.accumulators)})`;return r.groups.size>0&&(e+=`grouping(${uu(r.groups)})`),e}if(r instanceof d_)return`${r._name}(${uu(r.groups)})`;if(r instanceof wa)return`${r._name}(${r.Er})`;if(r instanceof Ta)return`${r._name}(${r.collectionId})`;if(r instanceof gc)return`${r._name}()`;if(r instanceof mc)return`${r._name}(${r.hr.sort()})`;if(r instanceof Aa)return`${r._name}(${oa(r.condition)})`;if(r instanceof Pr)return`${r._name}(${r.limit})`;if(r instanceof un)return`${r._name}(${(function(t){return t.map((n=>`${oa(n.expr)}${n.direction}`)).join(",")})(r.orderings)})`;throw new Error(`Unrecognized stage ${r._name}`)}function uu(r){return`${Array.from(r.entries()).sort().map((([e,t])=>`${e}=${oa(t)}`)).join(",")}`}function Ln(r){return r.stages.map((e=>qv(e))).join("|")}function E_(r,e){return Ln(r)===Ln(e)}function Ue(r){return r instanceof pt}function KC(r){return Ue(r)?Ln(r):Oo(r)}function I_(r){return Ue(r)?Ln(r):(function(t){return`${Fu(gt(t))}|lt:${t.limitType}`})(r)}function Ec(r,e){return r instanceof pt&&e instanceof pt?E_(r,e):!(r instanceof pt&&!(e instanceof pt)||!(r instanceof pt)&&e instanceof pt)&&Cm(r,e)}function Ic(r){return wn(r)?Ln(r):Fu(r)}function wh(r,e){return r instanceof pt&&e instanceof pt?E_(r,e):!(r instanceof pt&&!(e instanceof pt)||!(r instanceof pt)&&e instanceof pt)&&QB(r,e)}function jv(r,e){const t=(function(s){let i=!1;const o=[];for(const a of s)if(a instanceof un)if(i=!0,a.orderings.some((u=>u.expr instanceof bs&&u.expr.fieldName===on)))o.push(a);else{const u=a.orderings.map((l=>l));u.push(Iu(on).ascending()),o.push(new un(u,{}))}else a instanceof Pr&&(i||(o.push(new un([Iu(on).ascending()],{})),i=!0)),o.push(a);return i||o.push(new un([Iu(on).ascending()],{})),o})(r.stages);if(r.userDataReader){const n=r.userDataReader.createContext(3,"toCorePipeline");t.forEach((s=>s._readUserData(n)))}return new pt(r.userDataReader.serializer,t,e)}/**
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
 */class Th{constructor(e,t,n,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=s}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&tT(i,e,n[s])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=No(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=No(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=Em();return this.mutations.forEach((s=>{const i=e.get(s.key),o=i.overlayedDocument;let a=this.applyToLocalView(o,i.mutatedFields);a=t.has(s.key)?null:a;const u=em(o,a);u!==null&&n.set(s.key,u),o.isValidDocument()||o.convertToNoDocument(ee.min())})),n}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),ae())}isEqual(e){return this.batchId===e.batchId&&ii(this.mutations,e.mutations,((t,n)=>DC(t,n)))&&ii(this.baseMutations,e.baseMutations,((t,n)=>DC(t,n)))}}class Ah{constructor(e,t,n,s){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=s}static from(e,t,n){q(e.mutations.length===n.length,58842,{Br:e.mutations.length,Ur:n.length});let s=(function(){return ET})();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,n[o].version);return new Ah(e,t,n,s)}}/**
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
 */const Gu="";function mt(r){let e="";for(let t=0;t<r.length;t++)e.length>0&&(e=zC(e)),e=Jv(r.get(t),e);return zC(e)}function Jv(r,e){let t=e;const n=r.length;for(let s=0;s<n;s++){const i=r.charAt(s);switch(i){case"\0":t+="";break;case Gu:t+="";break;default:t+=i}}return t}function zC(r){return r+Gu+""}function cn(r){const e=r.length;if(q(e>=2,64408,{path:r}),e===2)return q(r.charAt(0)===Gu&&r.charAt(1)==="",56145,{path:r}),ue.emptyPath();const t=e-2,n=[];let s="";for(let i=0;i<e;){const o=r.indexOf(Gu,i);switch((o<0||o>t)&&Y(50515,{path:r}),r.charAt(o+1)){case"":const a=r.substring(i,o);let u;s.length===0?u=a:(s+=a,u=s,s=""),n.push(u);break;case"":s+=r.substring(i,o),s+="\0";break;case"":s+=r.substring(i,o+1);break;default:Y(61167,{path:r})}i=o+2}return new ue(n)}/**
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
 */const $r="remoteDocuments",Pa="owner",Ms="owner",aa="mutationQueues",Kv="userId",Wt="mutations",QC="batchId",ss="userMutationsIndex",WC=["userId","batchId"];/**
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
 */function Du(r,e){return[r,mt(e)]}function D_(r,e,t){return[r,mt(e),t]}const zv={},mi="documentMutations",Uu="remoteDocumentsV14",Qv=["prefixPath","collectionGroup","readTime","documentId"],yu="documentKeyIndex",Wv=["prefixPath","collectionGroup","documentId"],y_="collectionGroupIndex",$v=["collectionGroup","readTime","prefixPath","documentId"],ua="remoteDocumentGlobal",lB="remoteDocumentGlobalKey",_i="targets",w_="queryTargetsIndex",Yv=["canonicalId","targetId"],Ei="targetDocuments",Xv=["targetId","path"],vh="documentTargetsIndex",Zv=["path","targetId"],Hu="targetGlobalKey",cs="targetGlobal",ca="collectionParents",eR=["collectionId","parent"],Ii="clientMetadata",tR="clientId",Dc="bundles",nR="bundleId",yc="namedQueries",rR="name",Rh="indexConfiguration",sR="indexId",BB="collectionGroupIndex",iR="collectionGroup",Mo="indexState",oR=["indexId","uid"],T_="sequenceNumberIndex",aR=["uid","sequenceNumber"],Go="indexEntries",uR=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],A_="documentKeyIndex",cR=["indexId","uid","orderedDocumentKey"],wc="documentOverlays",lR=["userId","collectionPath","documentId"],hB="collectionPathOverlayIndex",BR=["userId","collectionPath","largestBatchId"],v_="collectionGroupOverlayIndex",hR=["userId","collectionGroup","largestBatchId"],Ph="globals",dR="name",R_=[aa,Wt,mi,$r,_i,Pa,cs,Ei,Ii,ua,ca,Dc,yc],fR=[...R_,wc],P_=[aa,Wt,mi,Uu,_i,Pa,cs,Ei,Ii,ua,ca,Dc,yc,wc],b_=P_,bh=[...b_,Rh,Mo,Go],CR=bh,S_=[...bh,Ph],pR=S_;/**
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
 */function N_(r,e,t){const n=r.store(Wt),s=r.store(mi),i=[],o=IDBKeyRange.only(t.batchId);let a=0;const u=n.jn({range:o},((B,d,C)=>(a++,C.delete())));i.push(u.next((()=>{q(a===1,47070,{batchId:t.batchId})})));const l=[];for(const B of t.mutations){const d=D_(e,B.key.path,t.batchId);i.push(s.delete(d)),l.push(B.key)}return P.waitFor(i).next((()=>l))}function qu(r){if(!r)return 0;let e;if(r.document)e=r.document;else if(r.unknownDocument)e=r.unknownDocument;else{if(!r.noDocument)throw Y(14731);e=r.noDocument}return JSON.stringify(e).length}/**
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
 */class dB extends Jm{constructor(e,t){super(),this.kr=e,this.currentSequenceNumber=t}}function st(r,e){const t=W(r);return pn.xn(t.kr,e)}/**
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
 */class Sh{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class ln{constructor(e,t,n,s,i=ee.min(),o=ee.min(),a=Se.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=a,this.expectedCount=u}withSequenceNumber(e){return new ln(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new ln(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new ln(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new ln(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class O_{constructor(e){this.qr=e}}function gR(r,e){let t;if(e.document)t=hc(r.qr,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const n=K.fromSegments(e.noDocument.path),s=Is(e.noDocument.readTime);t=Le.newNoDocument(n,s),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return Y(56709);{const n=K.fromSegments(e.unknownDocument.path),s=Is(e.unknownDocument.version);t=Le.newUnknownDocument(n,s)}}return e.readTime&&t.setReadTime((function(s){const i=new Ee(s[0],s[1]);return ee.fromTimestamp(i)})(e.readTime)),t}function $C(r,e){const t=e.key,n={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:ju(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())n.document=(function(i,o){return{name:gi(i,o.key),fields:o.data.value.mapValue.fields,updateTime:pi(i,o.version.toTimestamp()),createTime:pi(i,o.createTime.toTimestamp())}})(r.qr,e);else if(e.isNoDocument())n.noDocument={path:t.path.toArray(),readTime:Es(e.version)};else{if(!e.isUnknownDocument())return Y(57904,{document:e});n.unknownDocument={path:t.path.toArray(),version:Es(e.version)}}return n}function ju(r){const e=r.toTimestamp();return[e.seconds,e.nanoseconds]}function Es(r){const e=r.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function Is(r){const e=new Ee(r.seconds,r.nanoseconds);return ee.fromTimestamp(e)}function Zr(r,e){const t=(e.baseMutations||[]).map((i=>aB(r.qr,i)));for(let i=0;i<e.mutations.length-1;++i){const o=e.mutations[i];if(i+1<e.mutations.length&&e.mutations[i+1].transform!==void 0){const a=e.mutations[i+1];o.updateTransforms=a.transform.fieldTransforms,e.mutations.splice(i+1,1),++i}}const n=e.mutations.map((i=>aB(r.qr,i))),s=Ee.fromMillis(e.localWriteTimeMs);return new Th(e.batchId,s,t,n)}function Ro(r,e){const t=Is(e.readTime),n=e.lastLimboFreeSnapshotVersion!==void 0?Is(e.lastLimboFreeSnapshotVersion):ee.min();let s;return s=(function(o){return o.structuredPipeline!==void 0})(e.query)?(function(o,a){var B,d;const u=o.structuredPipeline;q((((B=u==null?void 0:u.pipeline)==null?void 0:B.stages)??[]).length>0,1845);const l=(d=u==null?void 0:u.pipeline)==null?void 0:d.stages.map(mR);return new pt(a,l)})(e.query,r.qr):(function(o){return o.documents!==void 0})(e.query)?(function(o){const a=o.documents.length;return q(a===1,1966,{count:a}),gt(ki(vm(o.documents[0])))})(e.query):(function(o){return gt(Sm(o))})(e.query),new ln(s,e.targetId,"TargetPurposeListen",e.lastListenSequenceNumber,t,n,Se.fromBase64String(e.resumeToken))}function F_(r,e){const t=Es(e.snapshotVersion),n=Es(e.lastLimboFreeSnapshotVersion);let s;s=wn(e.target)?Nm(r.qr,e.target):WB(e.target)?Pm(r.qr,e.target):dc(r.qr,e.target).be;const i=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:Ic(e.target),readTime:t,resumeToken:i,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:n,query:s}}function Tc(r){const e=Sm({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?Vu(e,e.limit,"L"):e}function cu(r,e){return new Sh(e.largestBatchId,aB(r.qr,e.overlayMutation))}function YC(r,e){const t=e.path.lastSegment();return[r,mt(e.path.popLast()),t]}function XC(r,e,t,n){return{indexId:r,uid:e,sequenceNumber:t,readTime:Es(n.readTime),documentKey:mt(n.documentKey.path),largestBatchId:n.largestBatchId}}function mR(r){switch(r.name){case"collection":return new wa(r.args[0].referenceValue,{});case"collection_group":return new Ta(r.args[1].stringValue,{});case"database":return new gc({});case"documents":return new mc(r.args.map((e=>e.referenceValue)),{});case"where":return new Aa(fB(r.args[0]),{});case"limit":{const e=r.args[0].integerValue??r.args[0].doubleValue;return new Pr(typeof e=="number"?e:Number(e),{})}case"sort":return new un(r.args.map((e=>(function(n){var i,o;const s=(i=n.mapValue)==null?void 0:i.fields;return new Ch(fB(s.expression),(o=s.direction)==null?void 0:o.stringValue,"orderingFromProto")})(e))),{});default:throw new Error(`Stage type: ${r.name} not supported.`)}}function fB(r){return r.fieldReferenceValue?new bs(en("_exprFromProto",r.fieldReferenceValue),"_exprFromProto"):r.functionValue?(function(t){var n;return new x(t.functionValue.name,((n=t.functionValue.args)==null?void 0:n.map(fB))||[])})(r):Ss._fromProto(r)}class Ac{constructor(e,t,n,s){this.userId=e,this.serializer=t,this.indexManager=n,this.referenceDelegate=s,this.$r={}}static Kr(e,t,n,s){q(e.uid!=="",64387);const i=e.isAuthenticated()?e.uid:"";return new Ac(i,t,n,s)}checkEmpty(e){let t=!0;const n=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return rr(e).jn({index:ss,range:n},((s,i,o)=>{t=!1,o.done()})).next((()=>t))}addMutationBatch(e,t,n,s){const i=$s(e),o=rr(e);return o.add({}).next((a=>{q(typeof a=="number",49019);const u=new Th(a,t,n,s),l=(function(g,D,N){const V=N.baseMutations.map((Z=>ea(g.qr,Z))),H=N.mutations.map((Z=>ea(g.qr,Z)));return{userId:D,batchId:N.batchId,localWriteTimeMs:N.localWriteTime.toMillis(),baseMutations:V,mutations:H}})(this.serializer,this.userId,u),B=[];let d=new De(((C,g)=>oe(C.canonicalString(),g.canonicalString())));for(const C of s){const g=D_(this.userId,C.key.path,a);d=d.add(C.key.path.popLast()),B.push(o.put(l)),B.push(i.put(g,zv))}return d.forEach((C=>{B.push(this.indexManager.addToCollectionParentIndex(e,C))})),e.addOnCommittedListener((()=>{this.$r[a]=u.keys()})),P.waitFor(B).next((()=>u))}))}lookupMutationBatch(e,t){return rr(e).get(t).next((n=>n?(q(n.userId===this.userId,48,"Unexpected user for mutation batch",{userId:n.userId,batchId:t}),Zr(this.serializer,n)):null))}Wr(e,t){return this.$r[t]?P.resolve(this.$r[t]):this.lookupMutationBatch(e,t).next((n=>{if(n){const s=n.keys();return this.$r[t]=s,s}return null}))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=IDBKeyRange.lowerBound([this.userId,n]);let i=null;return rr(e).jn({index:ss,range:s},((o,a,u)=>{a.userId===this.userId&&(q(a.batchId>=n,47524,{Qr:n}),i=Zr(this.serializer,a)),u.done()})).next((()=>i))}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let n=gr;return rr(e).jn({index:ss,range:t,reverse:!0},((s,i,o)=>{n=i.batchId,o.done()})).next((()=>n))}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,gr],[this.userId,Number.POSITIVE_INFINITY]);return rr(e).Kn(ss,t).next((n=>n.map((s=>Zr(this.serializer,s)))))}getAllMutationBatchesAffectingDocumentKey(e,t){const n=Du(this.userId,t.path),s=IDBKeyRange.lowerBound(n),i=[];return $s(e).jn({range:s},((o,a,u)=>{const[l,B,d]=o,C=cn(B);if(l===this.userId&&t.path.isEqual(C))return rr(e).get(d).next((g=>{if(!g)throw Y(61480,{Gr:o,batchId:d});q(g.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:g.userId,batchId:d}),i.push(Zr(this.serializer,g))}));u.done()})).next((()=>i))}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new De(oe);const s=[];return t.forEach((i=>{const o=Du(this.userId,i.path),a=IDBKeyRange.lowerBound(o),u=$s(e).jn({range:a},((l,B,d)=>{const[C,g,D]=l,N=cn(g);C===this.userId&&i.path.isEqual(N)?n=n.add(D):d.done()}));s.push(u)})),P.waitFor(s).next((()=>this.zr(e,n)))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1,i=Du(this.userId,n),o=IDBKeyRange.lowerBound(i);let a=new De(oe);return $s(e).jn({range:o},((u,l,B)=>{const[d,C,g]=u,D=cn(C);d===this.userId&&n.isPrefixOf(D)?D.length===s&&(a=a.add(g)):B.done()})).next((()=>this.zr(e,a)))}zr(e,t){const n=[],s=[];return t.forEach((i=>{s.push(rr(e).get(i).next((o=>{if(o===null)throw Y(35274,{batchId:i});q(o.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:o.userId,batchId:i}),n.push(Zr(this.serializer,o))})))})),P.waitFor(s).next((()=>n))}removeMutationBatch(e,t){return N_(e.kr,this.userId,t).next((n=>(e.addOnCommittedListener((()=>{this.jr(t.batchId)})),P.forEach(n,(s=>this.referenceDelegate.markPotentiallyOrphaned(e,s))))))}jr(e){delete this.$r[e]}performConsistencyCheck(e){return this.checkEmpty(e).next((t=>{if(!t)return P.resolve();const n=IDBKeyRange.lowerBound((function(o){return[o]})(this.userId)),s=[];return $s(e).jn({range:n},((i,o,a)=>{if(i[0]===this.userId){const u=cn(i[1]);s.push(u)}else a.done()})).next((()=>{q(s.length===0,56720,{Hr:s.map((i=>i.canonicalString()))})}))}))}containsKey(e,t){return L_(e,this.userId,t)}Jr(e){return V_(e).get(this.userId).next((t=>t||{userId:this.userId,lastAcknowledgedBatchId:gr,lastStreamToken:""}))}}function L_(r,e,t){const n=Du(e,t.path),s=n[1],i=IDBKeyRange.lowerBound(n);let o=!1;return $s(r).jn({range:i,zn:!0},((a,u,l)=>{const[B,d,C]=a;B===e&&d===s&&(o=!0),l.done()})).next((()=>o))}function rr(r){return st(r,Wt)}function $s(r){return st(r,mi)}function V_(r){return st(r,aa)}/**
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
 */class _R{getBundleMetadata(e,t){return ZC(e).get(t).next((n=>{if(n)return(function(i){return{id:i.bundleId,createTime:Is(i.createTime),version:i.version}})(n)}))}saveBundleMetadata(e,t){return ZC(e).put((function(s){return{bundleId:s.id,createTime:Es(Ke(s.createTime)),version:s.version}})(t))}getNamedQuery(e,t){return ep(e).get(t).next((n=>{if(n)return(function(i){return{name:i.name,query:Tc(i.bundledQuery),readTime:Is(i.readTime)}})(n)}))}saveNamedQuery(e,t){return ep(e).put((function(s){return{name:s.name,readTime:Es(Ke(s.readTime)),bundledQuery:s.bundledQuery}})(t))}}function ZC(r){return st(r,Dc)}function ep(r){return st(r,yc)}/**
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
 */class vc{constructor(e,t){this.serializer=e,this.userId=t}static Kr(e,t){const n=t.uid||"";return new vc(e,n)}getOverlay(e,t){return Gs(e).get(YC(this.userId,t)).next((n=>n?cu(this.serializer,n):null))}getOverlays(e,t){const n=Kt();return P.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&n.set(s,i)})))).next((()=>n))}getAllOverlays(e,t){const n=Kt();return Gs(e).jn(((s,i)=>{const o=cu(this.serializer,i);o.largestBatchId>t&&n.set(o.getKey(),o)})).next((()=>n))}saveOverlays(e,t,n){const s=[];return n.forEach(((i,o)=>{const a=new Sh(t,o);s.push(this.Yr(e,a))})),P.waitFor(s)}removeOverlaysForBatchId(e,t,n){const s=new Set;t.forEach((o=>s.add(mt(o.getCollectionPath()))));const i=[];return s.forEach((o=>{const a=IDBKeyRange.bound([this.userId,o,n],[this.userId,o,n+1],!1,!0);i.push(Gs(e).Gn(hB,a))})),P.waitFor(i)}getOverlaysForCollection(e,t,n){const s=Kt(),i=mt(t),o=IDBKeyRange.bound([this.userId,i,n],[this.userId,i,Number.POSITIVE_INFINITY],!0);return Gs(e).Kn(hB,o).next((a=>{for(const u of a){const l=cu(this.serializer,u);s.set(l.getKey(),l)}return s}))}getOverlaysForCollectionGroup(e,t,n,s){const i=Kt();let o;const a=IDBKeyRange.bound([this.userId,t,n],[this.userId,t,Number.POSITIVE_INFINITY],!0);return Gs(e).jn({index:v_,range:a},((u,l,B)=>{const d=cu(this.serializer,l);i.size()<s||d.largestBatchId===o?(i.set(d.getKey(),d),o=d.largestBatchId):B.done()})).next((()=>i))}Yr(e,t){return Gs(e).put((function(s,i,o){const[a,u,l]=YC(i,o.mutation.key);return{userId:i,collectionPath:u,documentId:l,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:ea(s.qr,o.mutation)}})(this.serializer,this.userId,t))}}function Gs(r){return st(r,wc)}/**
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
 */class ER{Zr(e){return st(e,Ph)}getSessionToken(e){return this.Zr(e).get("sessionToken").next((t=>{const n=t==null?void 0:t.value;return n?Se.fromUint8Array(n):Se.EMPTY_BYTE_STRING}))}setSessionToken(e,t){return this.Zr(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
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
 */class es{constructor(){}Xr(e,t){this.ei(e,t),t.ti()}ei(e,t){if("nullValue"in e)this.ni(t,5);else if("booleanValue"in e)this.ni(t,10),t.ri(e.booleanValue?1:0);else if("integerValue"in e)this.ni(t,15),t.ri(be(e.integerValue));else if("doubleValue"in e){const n=be(e.doubleValue);isNaN(n)?this.ni(t,13):(this.ni(t,15),ai(n)?t.ri(0):t.ri(n))}else if("timestampValue"in e){let n=e.timestampValue;this.ni(t,20),typeof n=="string"&&(n=xn(n)),t.ii(`${n.seconds||""}`),t.ri(n.nanos||0)}else if("stringValue"in e)this.si(e.stringValue,t),this._i(t);else if("bytesValue"in e)this.ni(t,30),t.oi(Mn(e.bytesValue)),this._i(t);else if("referenceValue"in e)this.ai(e.referenceValue,t);else if("geoPointValue"in e){const n=e.geoPointValue;this.ni(t,45),t.ri(n.latitude||0),t.ri(n.longitude||0)}else"mapValue"in e?zg(e)?this.ni(t,Number.MAX_SAFE_INTEGER):ps(e)?this.ui(e.mapValue,t):(this.ci(e.mapValue,t),this._i(t)):"arrayValue"in e?(this.li(e.arrayValue,t),this._i(t)):Y(19022,{Ei:e})}si(e,t){this.ni(t,25),this.hi(e,t)}hi(e,t){t.ii(e)}ci(e,t){const n=e.fields||{};this.ni(t,55);for(const s of Object.keys(n))this.si(s,t),this.ei(n[s],t)}ui(e,t){var o,a;const n=e.fields||{};this.ni(t,53);const s=fs,i=((a=(o=n[s].arrayValue)==null?void 0:o.values)==null?void 0:a.length)||0;this.ni(t,15),t.ri(be(i)),this.si(s,t),this.ei(n[s],t)}li(e,t){const n=e.values||[];this.ni(t,50);for(const s of n)this.ei(s,t)}ai(e,t){this.ni(t,37),K.fromName(e).path.forEach((n=>{this.ni(t,60),this.hi(n,t)}))}ni(e,t){e.ri(t)}_i(e){e.ri(2)}}es.Ti=new es;/**
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
 */const Us=255;function IR(r){if(r===0)return 8;let e=0;return r>>4||(e+=4,r<<=4),r>>6||(e+=2,r<<=2),r>>7||(e+=1),e}function tp(r){const e=64-(function(n){let s=0;for(let i=0;i<8;++i){const o=IR(255&n[i]);if(s+=o,o!==8)break}return s})(r);return Math.ceil(e/8)}class DR{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Pi(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Ri(n.value),n=t.next();this.Ii()}Ai(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Vi(n.value),n=t.next();this.di()}fi(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.Ri(n);else if(n<2048)this.Ri(960|n>>>6),this.Ri(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.Ri(480|n>>>12),this.Ri(128|63&n>>>6),this.Ri(128|63&n);else{const s=t.codePointAt(0);this.Ri(240|s>>>18),this.Ri(128|63&s>>>12),this.Ri(128|63&s>>>6),this.Ri(128|63&s)}}this.Ii()}mi(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.Vi(n);else if(n<2048)this.Vi(960|n>>>6),this.Vi(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.Vi(480|n>>>12),this.Vi(128|63&n>>>6),this.Vi(128|63&n);else{const s=t.codePointAt(0);this.Vi(240|s>>>18),this.Vi(128|63&s>>>12),this.Vi(128|63&s>>>6),this.Vi(128|63&s)}}this.di()}pi(e){const t=this.gi(e),n=tp(t);this.yi(1+n),this.buffer[this.position++]=255&n;for(let s=t.length-n;s<t.length;++s)this.buffer[this.position++]=255&t[s]}wi(e){const t=this.gi(e),n=tp(t);this.yi(1+n),this.buffer[this.position++]=~(255&n);for(let s=t.length-n;s<t.length;++s)this.buffer[this.position++]=~(255&t[s])}bi(){this.Si(Us),this.Si(255)}Di(){this.xi(Us),this.xi(255)}reset(){this.position=0}seed(e){this.yi(e.length),this.buffer.set(e,this.position),this.position+=e.length}Ci(){return this.buffer.slice(0,this.position)}gi(e){const t=(function(i){const o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,i,!1),new Uint8Array(o.buffer)})(e),n=!!(128&t[0]);t[0]^=n?255:128;for(let s=1;s<t.length;++s)t[s]^=n?255:0;return t}Ri(e){const t=255&e;t===0?(this.Si(0),this.Si(255)):t===Us?(this.Si(Us),this.Si(0)):this.Si(t)}Vi(e){const t=255&e;t===0?(this.xi(0),this.xi(255)):t===Us?(this.xi(Us),this.xi(0)):this.xi(e)}Ii(){this.Si(0),this.Si(1)}di(){this.xi(0),this.xi(1)}Si(e){this.yi(1),this.buffer[this.position++]=e}xi(e){this.yi(1),this.buffer[this.position++]=~e}yi(e){const t=e+this.position;if(t<=this.buffer.length)return;let n=2*this.buffer.length;n<t&&(n=t);const s=new Uint8Array(n);s.set(this.buffer),this.buffer=s}}class yR{constructor(e){this.Fi=e}oi(e){this.Fi.Pi(e)}ii(e){this.Fi.fi(e)}ri(e){this.Fi.pi(e)}ti(){this.Fi.bi()}}class wR{constructor(e){this.Fi=e}oi(e){this.Fi.Ai(e)}ii(e){this.Fi.mi(e)}ri(e){this.Fi.wi(e)}ti(){this.Fi.Di()}}class mo{constructor(){this.Fi=new DR,this.ascending=new yR(this.Fi),this.descending=new wR(this.Fi)}seed(e){this.Fi.seed(e)}Oi(e){return e===0?this.ascending:this.descending}Ci(){return this.Fi.Ci()}reset(){this.Fi.reset()}}/**
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
 */class ts{constructor(e,t,n,s){this.Mi=e,this.Ni=t,this.Li=n,this.Bi=s}Ui(){const e=this.Bi.length,t=e===0||this.Bi[e-1]===255?e+1:e,n=new Uint8Array(t);return n.set(this.Bi,0),t!==e?n.set([0],this.Bi.length):++n[n.length-1],new ts(this.Mi,this.Ni,this.Li,n)}ki(e,t,n){return{indexId:this.Mi,uid:e,arrayValue:wu(this.Li),directionalValue:wu(this.Bi),orderedDocumentKey:wu(t),documentKey:n.path.toArray()}}qi(e,t,n){const s=this.ki(e,t,n);return[s.indexId,s.uid,s.arrayValue,s.directionalValue,s.orderedDocumentKey,s.documentKey]}}function sr(r,e){let t=r.Mi-e.Mi;return t!==0?t:(t=np(r.Li,e.Li),t!==0?t:(t=np(r.Bi,e.Bi),t!==0?t:K.comparator(r.Ni,e.Ni)))}function np(r,e){for(let t=0;t<r.length&&t<e.length;++t){const n=r[t]-e[t];if(n!==0)return n}return r.length-e.length}function wu(r){return lg()?(function(t){let n="";for(let s=0;s<t.length;s++)n+=String.fromCharCode(t[s]);return n})(r):r}function rp(r){return typeof r!="string"?r:(function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n})(r)}class sp{constructor(e){this.$i=new De(((t,n)=>Je.comparator(t.field,n.field))),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.Ki=e.orderBy,this.Wi=[];for(const t of e.filters){const n=t;n.isInequality()?this.$i=this.$i.add(n):this.Wi.push(n)}}get Qi(){return this.$i.size>1}Gi(e){if(q(e.collectionGroup===this.collectionId,49279),this.Qi)return!1;const t=tB(e);if(t!==void 0&&!this.zi(t))return!1;const n=Wr(e);let s=new Set,i=0,o=0;for(;i<n.length&&this.zi(n[i]);++i)s=s.add(n[i].fieldPath.canonicalString());if(i===n.length)return!0;if(this.$i.size>0){const a=this.$i.getIterator().getNext();if(!s.has(a.field.canonicalString())){const u=n[i];if(!this.ji(a,u)||!this.Hi(this.Ki[o++],u))return!1}++i}for(;i<n.length;++i){const a=n[i];if(o>=this.Ki.length||!this.Hi(this.Ki[o++],a))return!1}return!0}Ji(){if(this.Qi)return null;let e=new De(Je.comparator);const t=[];for(const n of this.Wi)if(!n.field.isKeyField())if(n.op==="array-contains"||n.op==="array-contains-any")t.push(new us(n.field,2));else{if(e.has(n.field))continue;e=e.add(n.field),t.push(new us(n.field,0))}for(const n of this.Ki)n.field.isKeyField()||e.has(n.field)||(e=e.add(n.field),t.push(new us(n.field,n.dir==="asc"?0:1)));return new fi(fi.UNKNOWN_ID,this.collectionId,t,Ci.empty())}zi(e){for(const t of this.Wi)if(this.ji(t,e))return!0;return!1}ji(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const n=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===n}Hi(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
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
 */function k_(r){var t,n;if(q(r instanceof fe||r instanceof ye,20012),r instanceof fe){if(r instanceof cm){const s=((n=(t=r.value.arrayValue)==null?void 0:t.values)==null?void 0:n.map((i=>fe.create(r.field,"==",i))))||[];return ye.create(s,"or")}return r}const e=r.filters.map((s=>k_(s)));return ye.create(e,r.op)}function TR(r){if(r.getFilters().length===0)return[];const e=gB(k_(r));return q(x_(e),7391),CB(e)||pB(e)?[e]:e.getFilters()}function CB(r){return r instanceof fe}function pB(r){return r instanceof ye&&KB(r)}function x_(r){return CB(r)||pB(r)||(function(t){if(t instanceof ye&&Zl(t)){for(const n of t.getFilters())if(!CB(n)&&!pB(n))return!1;return!0}return!1})(r)}function gB(r){if(q(r instanceof fe||r instanceof ye,34018),r instanceof fe)return r;if(r.filters.length===1)return gB(r.filters[0]);const e=r.filters.map((n=>gB(n)));let t=ye.create(e,r.op);return t=Ju(t),x_(t)?t:(q(t instanceof ye,64498),q(hi(t),40251),q(t.filters.length>1,57927),t.filters.reduce(((n,s)=>Nh(n,s))))}function Nh(r,e){let t;return q(r instanceof fe||r instanceof ye,38388),q(e instanceof fe||e instanceof ye,25473),t=r instanceof fe?e instanceof fe?(function(s,i){return ye.create([s,i],"and")})(r,e):ip(r,e):e instanceof fe?ip(e,r):(function(s,i){if(q(s.filters.length>0&&i.filters.length>0,48005),hi(s)&&hi(i))return om(s,i.getFilters());const o=Zl(s)?s:i,a=Zl(s)?i:s,u=o.filters.map((l=>Nh(l,a)));return ye.create(u,"or")})(r,e),Ju(t)}function ip(r,e){if(hi(e))return om(e,r.getFilters());{const t=e.filters.map((n=>Nh(r,n)));return ye.create(t,"or")}}function Ju(r){if(q(r instanceof fe||r instanceof ye,11850),r instanceof fe)return r;const e=r.getFilters();if(e.length===1)return Ju(e[0]);if(sm(r))return r;const t=e.map((s=>Ju(s))),n=[];return t.forEach((s=>{s instanceof fe?n.push(s):s instanceof ye&&(s.op===r.op?n.push(...s.filters):n.push(s))})),n.length===1?n[0]:ye.create(n,r.op)}/**
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
 */class AR{constructor(){this.Yi=new Oh}addToCollectionParentIndex(e,t){return this.Yi.add(t),P.resolve()}getCollectionParents(e,t){return P.resolve(this.Yi.getEntries(t))}addFieldIndex(e,t){return P.resolve()}deleteFieldIndex(e,t){return P.resolve()}deleteAllFieldIndexes(e){return P.resolve()}createTargetIndexes(e,t){return P.resolve()}getDocumentsMatchingTarget(e,t){return P.resolve(null)}getIndexType(e,t){return P.resolve(0)}getFieldIndexes(e,t){return P.resolve([])}getNextCollectionGroupToUpdate(e){return P.resolve(null)}getMinOffset(e,t){return P.resolve(qt.min())}getMinOffsetFromCollectionGroup(e,t){return P.resolve(qt.min())}updateCollectionGroup(e,t,n){return P.resolve()}updateIndexEntries(e,t){return P.resolve()}}class Oh{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t]||new De(ue.comparator),i=!s.has(n);return this.index[t]=s.add(n),i}has(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t];return s&&s.has(n)}getEntries(e){return(this.index[e]||new De(ue.comparator)).toArray()}}/**
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
 */const op="IndexedDbIndexManager",lu=new Uint8Array(0);class vR{constructor(e,t){this.databaseId=t,this.Zi=new Oh,this.Xi=new Kn((n=>Fu(n)),((n,s)=>QB(n,s))),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.Zi.has(t)){const n=t.lastSegment(),s=t.popLast();e.addOnCommittedListener((()=>{this.Zi.add(t)}));const i={collectionId:n,parent:mt(s)};return ap(e).put(i)}return P.resolve()}getCollectionParents(e,t){const n=[],s=IDBKeyRange.bound([t,""],[Vg(t),""],!1,!0);return ap(e).Kn(s).next((i=>{for(const o of i){if(o.collectionId!==t)break;n.push(cn(o.parent))}return n}))}addFieldIndex(e,t){const n=_o(e),s=(function(a){return{indexId:a.indexId,collectionGroup:a.collectionGroup,fields:a.fields.map((u=>[u.fieldPath.canonicalString(),u.kind]))}})(t);delete s.indexId;const i=n.add(s);if(t.indexState){const o=qs(e);return i.next((a=>{o.put(XC(a,this.uid,t.indexState.sequenceNumber,t.indexState.offset))}))}return i.next()}deleteFieldIndex(e,t){const n=_o(e),s=qs(e),i=Hs(e);return n.delete(t.indexId).next((()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))).next((()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))))}deleteAllFieldIndexes(e){const t=_o(e),n=Hs(e),s=qs(e);return t.Gn().next((()=>n.Gn())).next((()=>s.Gn()))}createTargetIndexes(e,t){return P.forEach(this.es(t),(n=>this.getIndexType(e,n).next((s=>{if(s===0||s===1){const i=new sp(n).Ji();if(i!=null)return this.addFieldIndex(e,i)}}))))}getDocumentsMatchingTarget(e,t){const n=Hs(e);let s=!0;const i=new Map;return P.forEach(this.es(t),(o=>this.ts(e,o).next((a=>{s&&(s=!!a),i.set(o,a)})))).next((()=>{if(s){let o=ae();const a=[];return P.forEach(i,((u,l)=>{U(op,`Using index ${(function(re){return`id=${re.indexId}|cg=${re.collectionGroup}|f=${re.fields.map((de=>`${de.fieldPath}:${de.kind}`)).join(",")}`})(u)} to execute ${Fu(t)}`);const B=(function(re,de){const Ce=tB(de);if(Ce===void 0)return null;for(const le of Lu(re,Ce.fieldPath))switch(le.op){case"array-contains-any":return le.value.arrayValue.values||[];case"array-contains":return[le.value]}return null})(l,u),d=(function(re,de){const Ce=new Map;for(const le of Wr(de))for(const T of Lu(re,le.fieldPath))switch(T.op){case"==":case"in":Ce.set(le.fieldPath.canonicalString(),T.value);break;case"not-in":case"!=":return Ce.set(le.fieldPath.canonicalString(),T.value),Array.from(Ce.values())}return null})(l,u),C=(function(re,de){const Ce=[];let le=!0;for(const T of Wr(de)){const E=T.kind===0?vC(re,T.fieldPath,re.startAt):RC(re,T.fieldPath,re.startAt);Ce.push(E.value),le&&(le=E.inclusive)}return new vr(Ce,le)})(l,u),g=(function(re,de){const Ce=[];let le=!0;for(const T of Wr(de)){const E=T.kind===0?RC(re,T.fieldPath,re.endAt):vC(re,T.fieldPath,re.endAt);Ce.push(E.value),le&&(le=E.inclusive)}return new vr(Ce,le)})(l,u),D=this.ns(u,l,C),N=this.ns(u,l,g),V=this.rs(u,l,d),H=this.ss(u.indexId,B,D,C.inclusive,N,g.inclusive,V);return P.forEach(H,(Z=>n.Qn(Z,t.limit).next((re=>{re.forEach((de=>{const Ce=K.fromSegments(de.documentKey);o.has(Ce)||(o=o.add(Ce),a.push(Ce))}))}))))})).next((()=>a))}return P.resolve(null)}))}es(e){let t=this.Xi.get(e);return t||(e.filters.length===0?t=[e]:t=TR(ye.create(e.filters,"and")).map((n=>nB(e.path,e.collectionGroup,e.orderBy,n.getFilters(),e.limit,e.startAt,e.endAt))),this.Xi.set(e,t),t)}ss(e,t,n,s,i,o,a){const u=(t!=null?t.length:1)*Math.max(n.length,i.length),l=u/(t!=null?t.length:1),B=[];for(let d=0;d<u;++d){const C=t?this._s(t[d/l]):lu,g=this.us(e,C,n[d%l],s),D=this.cs(e,C,i[d%l],o),N=a.map((V=>this.us(e,C,V,!0)));B.push(...this.createRange(g,D,N))}return B}us(e,t,n,s){const i=new ts(e,K.empty(),t,n);return s?i:i.Ui()}cs(e,t,n,s){const i=new ts(e,K.empty(),t,n);return s?i.Ui():i}ts(e,t){const n=new sp(t),s=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,s).next((i=>{let o=null;for(const a of i)n.Gi(a)&&(!o||a.fields.length>o.fields.length)&&(o=a);return o}))}getIndexType(e,t){let n=2;const s=this.es(t);return P.forEach(s,(i=>this.ts(e,i).next((o=>{o?n!==0&&o.fields.length<(function(u){let l=new De(Je.comparator),B=!1;for(const d of u.filters)for(const C of d.getFlattenedFilters())C.field.isKeyField()||(C.op==="array-contains"||C.op==="array-contains-any"?B=!0:l=l.add(C.field));for(const d of u.orderBy)d.field.isKeyField()||(l=l.add(d.field));return l.size+(B?1:0)})(i)&&(n=1):n=0})))).next((()=>(function(o){return o.limit!==null})(t)&&s.length>1&&n===2?1:n))}ls(e,t){const n=new mo;for(const s of Wr(e)){const i=t.data.field(s.fieldPath);if(i==null)return null;const o=n.Oi(s.kind);es.Ti.Xr(i,o)}return n.Ci()}_s(e){const t=new mo;return es.Ti.Xr(e,t.Oi(0)),t.Ci()}Es(e,t){const n=new mo;return es.Ti.Xr(Cs(this.databaseId,t),n.Oi((function(i){const o=Wr(i);return o.length===0?0:o[o.length-1].kind})(e))),n.Ci()}rs(e,t,n){if(n===null)return[];let s=[];s.push(new mo);let i=0;for(const o of Wr(e)){const a=n[i++];for(const u of s)if(this.hs(t,o.fieldPath)&&Ar(a))s=this.Ts(s,o,a);else{const l=u.Oi(o.kind);es.Ti.Xr(a,l)}}return this.Ps(s)}ns(e,t,n){return this.rs(e,t,n.position)}Ps(e){const t=[];for(let n=0;n<e.length;++n)t[n]=e[n].Ci();return t}Ts(e,t,n){const s=[...e],i=[];for(const o of n.arrayValue.values||[])for(const a of s){const u=new mo;u.seed(a.Ci()),es.Ti.Xr(o,u.Oi(t.kind)),i.push(u)}return i}hs(e,t){return!!e.filters.find((n=>n instanceof fe&&n.field.isEqual(t)&&(n.op==="in"||n.op==="not-in")))}getFieldIndexes(e,t){const n=_o(e),s=qs(e);return(t?n.Kn(BB,IDBKeyRange.bound(t,t)):n.Kn()).next((i=>{const o=[];return P.forEach(i,(a=>s.get([a.indexId,this.uid]).next((u=>{o.push((function(B,d){const C=d?new Ci(d.sequenceNumber,new qt(Is(d.readTime),new K(cn(d.documentKey)),d.largestBatchId)):Ci.empty(),g=B.fields.map((([D,N])=>new us(Je.fromServerFormat(D),N)));return new fi(B.indexId,B.collectionGroup,g,C)})(a,u))})))).next((()=>o))}))}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next((t=>t.length===0?null:(t.sort(((n,s)=>{const i=n.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:oe(n.collectionGroup,s.collectionGroup)})),t[0].collectionGroup)))}updateCollectionGroup(e,t,n){const s=_o(e),i=qs(e);return this.Rs(e).next((o=>s.Kn(BB,IDBKeyRange.bound(t,t)).next((a=>P.forEach(a,(u=>i.put(XC(u.indexId,this.uid,o,n))))))))}updateIndexEntries(e,t){const n=new Map;return P.forEach(t,((s,i)=>{const o=n.get(s.collectionGroup);return(o?P.resolve(o):this.getFieldIndexes(e,s.collectionGroup)).next((a=>(n.set(s.collectionGroup,a),P.forEach(a,(u=>this.Is(e,s,u).next((l=>{const B=this.As(i,u);return l.isEqual(B)?P.resolve():this.Vs(e,i,u,l,B)})))))))}))}ds(e,t,n,s){return Hs(e).put(s.ki(this.uid,this.Es(n,t.key),t.key))}fs(e,t,n,s){return Hs(e).delete(s.qi(this.uid,this.Es(n,t.key),t.key))}Is(e,t,n){const s=Hs(e);let i=new De(sr);return s.jn({index:A_,range:IDBKeyRange.only([n.indexId,this.uid,wu(this.Es(n,t))])},((o,a)=>{i=i.add(new ts(n.indexId,t,rp(a.arrayValue),rp(a.directionalValue)))})).next((()=>i))}As(e,t){let n=new De(sr);const s=this.ls(t,e);if(s==null)return n;const i=tB(t);if(i!=null){const o=e.data.field(i.fieldPath);if(Ar(o))for(const a of o.arrayValue.values||[])n=n.add(new ts(t.indexId,e.key,this._s(a),s))}else n=n.add(new ts(t.indexId,e.key,lu,s));return n}Vs(e,t,n,s,i){U(op,"Updating index entries for document '%s'",t.key);const o=[];return(function(u,l,B,d,C){const g=u.getIterator(),D=l.getIterator();let N=xs(g),V=xs(D);for(;N||V;){let H=!1,Z=!1;if(N&&V){const re=B(N,V);re<0?Z=!0:re>0&&(H=!0)}else N!=null?Z=!0:H=!0;H?(d(V),V=xs(D)):Z?(C(N),N=xs(g)):(N=xs(g),V=xs(D))}})(s,i,sr,(a=>{o.push(this.ds(e,t,n,a))}),(a=>{o.push(this.fs(e,t,n,a))})),P.waitFor(o)}Rs(e){let t=1;return qs(e).jn({index:T_,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},((n,s,i)=>{i.done(),t=s.sequenceNumber+1})).next((()=>t))}createRange(e,t,n){n=n.sort(((o,a)=>sr(o,a))).filter(((o,a,u)=>!a||sr(o,u[a-1])!==0));const s=[];s.push(e);for(const o of n){const a=sr(o,e),u=sr(o,t);if(a===0)s[0]=e.Ui();else if(a>0&&u<0)s.push(o),s.push(o.Ui());else if(u>0)break}s.push(t);const i=[];for(let o=0;o<s.length;o+=2){if(this.ps(s[o],s[o+1]))return[];const a=s[o].qi(this.uid,lu,K.empty()),u=s[o+1].qi(this.uid,lu,K.empty());i.push(IDBKeyRange.bound(a,u))}return i}ps(e,t){return sr(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(up)}getMinOffset(e,t){return P.mapArray(this.es(t),(n=>this.ts(e,n).next((s=>s||Y(44426))))).next(up)}}function ap(r){return st(r,ca)}function Hs(r){return st(r,Go)}function _o(r){return st(r,Rh)}function qs(r){return st(r,Mo)}function up(r){q(r.length!==0,28825);let e=r[0].indexState.offset,t=e.largestBatchId;for(let n=1;n<r.length;n++){const s=r[n].indexState.offset;zB(s,e)<0&&(e=s),t<s.largestBatchId&&(t=s.largestBatchId)}return new qt(e.readTime,e.documentKey,t)}/**
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
 */class Un{constructor(e){this.gs=e}next(){return this.gs+=2,this.gs}static ys(){return new Un(0)}static ws(){return new Un(-1)}}/**
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
 */class RR{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.bs(e).next((t=>{const n=new Un(t.highestTargetId);return t.highestTargetId=n.next(),this.vs(e,t).next((()=>t.highestTargetId))}))}getLastRemoteSnapshotVersion(e){return this.bs(e).next((t=>ee.fromTimestamp(new Ee(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds))))}getHighestSequenceNumber(e){return this.bs(e).next((t=>t.highestListenSequenceNumber))}setTargetsMetadata(e,t,n){return this.bs(e).next((s=>(s.highestListenSequenceNumber=t,n&&(s.lastRemoteSnapshotVersion=n.toTimestamp()),t>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=t),this.vs(e,s))))}addTargetData(e,t){return this.Ss(e,t).next((()=>this.bs(e).next((n=>(n.targetCount+=1,this.Ds(t,n),this.vs(e,n))))))}updateTargetData(e,t){return this.Ss(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next((()=>js(e).delete(t.targetId))).next((()=>this.bs(e))).next((n=>(q(n.targetCount>0,8065),n.targetCount-=1,this.vs(e,n))))}removeTargets(e,t,n){let s=0;const i=[];return js(e).jn(((o,a)=>{const u=Ro(this.serializer,a);u.sequenceNumber<=t&&n.get(u.targetId)===null&&(s++,i.push(this.removeTargetData(e,u)))})).next((()=>P.waitFor(i))).next((()=>s))}forEachTarget(e,t){return js(e).jn(((n,s)=>{const i=Ro(this.serializer,s);t(i)}))}bs(e){return cp(e).get(Hu).next((t=>(q(t!==null,2888),t)))}vs(e,t){return cp(e).put(Hu,t)}Ss(e,t){return js(e).put(F_(this.serializer,t))}Ds(e,t){let n=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,n=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,n=!0),n}getTargetCount(e){return this.bs(e).next((t=>t.targetCount))}getTargetData(e,t){const n=Ic(t),s=IDBKeyRange.bound([n,Number.NEGATIVE_INFINITY],[n,Number.POSITIVE_INFINITY]);let i=null;return js(e).jn({range:s,index:w_},((o,a,u)=>{const l=Ro(this.serializer,a);wh(t,l.target)&&(i=l,u.done())})).next((()=>i))}addMatchingKeys(e,t,n){const s=[],i=Br(e);return t.forEach((o=>{const a=mt(o.path);s.push(i.put({targetId:n,path:a})),s.push(this.referenceDelegate.addReference(e,n,o))})),P.waitFor(s)}removeMatchingKeys(e,t,n){const s=Br(e);return P.forEach(t,(i=>{const o=mt(i.path);return P.waitFor([s.delete([n,o]),this.referenceDelegate.removeReference(e,n,i)])}))}removeMatchingKeysForTargetId(e,t){const n=Br(e),s=IDBKeyRange.bound([t],[t+1],!1,!0);return n.delete(s)}getMatchingKeysForTargetId(e,t){const n=IDBKeyRange.bound([t],[t+1],!1,!0),s=Br(e);let i=ae();return s.jn({range:n,zn:!0},((o,a,u)=>{const l=cn(o[1]),B=new K(l);i=i.add(B)})).next((()=>i))}containsKey(e,t){const n=mt(t.path),s=IDBKeyRange.bound([n],[Vg(n)],!1,!0);let i=0;return Br(e).jn({index:vh,zn:!0,range:s},(([o,a],u,l)=>{o!==0&&(i++,l.done())})).next((()=>i>0))}ge(e,t){return js(e).get(t).next((n=>n?Ro(this.serializer,n):null))}}function js(r){return st(r,_i)}function cp(r){return st(r,cs)}function Br(r){return st(r,Ei)}/**
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
 */class PR{constructor(e,t){this.db=e,this.garbageCollector=Wm(this,t)}rr(e){const t=this.xs(e);return this.db.getTargetCache().getTargetCount(e).next((n=>t.next((s=>n+s))))}xs(e){let t=0;return this.ir(e,(n=>{t++})).next((()=>t))}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}ir(e,t){return this.Cs(e,((n,s)=>t(s)))}addReference(e,t,n){return Bu(e,n)}removeReference(e,t,n){return Bu(e,n)}removeTargets(e,t,n){return this.db.getTargetCache().removeTargets(e,t,n)}markPotentiallyOrphaned(e,t){return Bu(e,t)}Fs(e,t){return(function(s,i){let o=!1;return V_(s).Hn((a=>L_(s,a,i).next((u=>(u&&(o=!0),P.resolve(!u)))))).next((()=>o))})(e,t)}removeOrphanedDocuments(e,t){const n=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.Cs(e,((o,a)=>{if(a<=t){const u=this.Fs(e,o).next((l=>{if(!l)return i++,n.getEntry(e,o).next((()=>(n.removeEntry(o,ee.min()),Br(e).delete((function(d){return[0,mt(d.path)]})(o)))))}));s.push(u)}})).next((()=>P.waitFor(s))).next((()=>n.apply(e))).next((()=>i))}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,n)}updateLimboDocument(e,t){return Bu(e,t)}Cs(e,t){const n=Br(e);let s,i=Nt.yn;return n.jn({index:vh},(([o,a],{path:u,sequenceNumber:l})=>{o===0?(i!==Nt.yn&&t(new K(cn(s)),i),i=l,s=u):i=Nt.yn})).next((()=>{i!==Nt.yn&&t(new K(cn(s)),i)}))}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function Bu(r,e){return Br(r).put((function(n,s){return{targetId:0,path:mt(n.path),sequenceNumber:s}})(e,r.currentSequenceNumber))}// Copyright 2024 Google LLC* @license
function M_(r,e){var n;let t=e;for(const s of r.stages)t=bR({serializer:r.serializer,serverTimestampBehavior:(n=r.listenOptions)==null?void 0:n.serverTimestampBehavior},s,t);return t}function Rc(r,e){return M_(r,[e]).length>0}function G_(r,e){return Ue(r)?Rc(r,e):lc(r,e)}function bR(r,e,t){if(e instanceof wa)return(function(s,i,o){return o.filter((a=>a.isFoundDocument()&&`/${a.key.getCollectionPath().canonicalString()}`===i.Er))})(0,e,t);if(e instanceof Aa)return(function(s,i,o){return o.filter((a=>{const u=xo(ie(i.condition).evaluate(s,a));return u!==void 0&&zt(u,Lt)}))})(r,e,t);if(e instanceof Ta)return(function(s,i,o){return o.filter((a=>a.isFoundDocument()&&a.key.getCollectionPath().lastSegment()===i.collectionId))})(0,e,t);if(e instanceof gc)return(function(s,i,o){return o.filter((a=>a.isFoundDocument()))})(0,0,t);if(e instanceof mc)return(function(s,i,o){return o.filter((a=>a.isFoundDocument()&&i.Tr.has(a.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof Pr)return(function(s,i,o){return o.slice(0,i.limit)})(0,e,t);if(e instanceof un)return(function(s,i,o){const a=i.orderings.map((u=>({Os:ie(u.expr),direction:u.direction})));return[...o].sort(((u,l)=>{for(const{Os:B,direction:d}of a){const C=xo(B.evaluate(s,u)),g=xo(B.evaluate(s,l)),D=_t(C??fn,g??fn);if(D!==0)return d==="ascending"?D:-D}return 0}))})(r,e,t);throw new Error(`Unknown stage: ${e._name}`)}function Ku(r){const e=(function(n){for(let s=n.stages.length-1;s>=0;s--){const i=n.stages[s];if(i instanceof un)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(r);return(t,n)=>{for(const s of e){const i=xo(ie(s.expr).evaluate({serializer:r.serializer},t)),o=xo(ie(s.expr).evaluate({serializer:r.serializer},n)),a=_t(i||fn,o||fn);if(a!==0)return s.direction==="ascending"?a:-a}return 0}}function vl(r){for(let e=r.stages.length-1;e>=0;e--){const t=r.stages[e];if(t instanceof Pr)return{limit:t.limit}}}/**
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
 */class U_{constructor(){this.changes=new Kn((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Le.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return n!==void 0?P.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class SR{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,n){return ir(e).put(n)}removeEntry(e,t,n){return ir(e).delete((function(i,o){const a=i.path.toArray();return[a.slice(0,a.length-2),a[a.length-2],ju(o),a[a.length-1]]})(t,n))}updateMetadata(e,t){return this.getMetadata(e).next((n=>(n.byteSize+=t,this.Ms(e,n))))}getEntry(e,t){let n=Le.newInvalidDocument(t);return ir(e).jn({index:yu,range:IDBKeyRange.only(Eo(t))},((s,i)=>{n=this.Ns(t,i)})).next((()=>n))}Ls(e,t){let n={size:0,document:Le.newInvalidDocument(t)};return ir(e).jn({index:yu,range:IDBKeyRange.only(Eo(t))},((s,i)=>{n={document:this.Ns(t,i),size:qu(i)}})).next((()=>n))}getEntries(e,t){let n=$e();return this.Bs(e,t,((s,i)=>{const o=this.Ns(s,i);n=n.insert(s,o)})).next((()=>n))}getAllEntries(e){let t=$e();return ir(e).jn(((n,s)=>{const i=this.Ns(K.fromSegments(s.prefixPath.concat(s.collectionGroup,s.documentId)),s);t=t.insert(i.key,i)})).next((()=>t))}Us(e,t){let n=$e(),s=new Re(K.comparator);return this.Bs(e,t,((i,o)=>{const a=this.Ns(i,o);n=n.insert(i,a),s=s.insert(i,qu(o))})).next((()=>({documents:n,ks:s})))}Bs(e,t,n){if(t.isEmpty())return P.resolve();let s=new De(hp);t.forEach((u=>s=s.add(u)));const i=IDBKeyRange.bound(Eo(s.first()),Eo(s.last())),o=s.getIterator();let a=o.getNext();return ir(e).jn({index:yu,range:i},((u,l,B)=>{const d=K.fromSegments([...l.prefixPath,l.collectionGroup,l.documentId]);for(;a&&hp(a,d)<0;)n(a,null),a=o.getNext();a&&a.isEqual(d)&&(n(a,l),a=o.hasNext()?o.getNext():null),a?B.$n(Eo(a)):B.done()})).next((()=>{for(;a;)n(a,null),a=o.hasNext()?o.getNext():null}))}getDocumentsMatchingQuery(e,t,n,s,i){const o=Ue(t)?ue.fromString(Ra(t)):t.path,a=[o.popLast().toArray(),o.lastSegment(),ju(n.readTime),n.documentKey.path.isEmpty()?"":n.documentKey.path.lastSegment()],u=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return ir(e).Kn(IDBKeyRange.bound(a,u,!0)).next((l=>{i==null||i.incrementDocumentReadCount(l.length);let B=$e();for(const d of l){const C=this.Ns(K.fromSegments(d.prefixPath.concat(d.collectionGroup,d.documentId)),d);C.isFoundDocument()&&(G_(t,C)||s.has(C.key))&&(B=B.insert(C.key,C))}return B}))}getAllFromCollectionGroup(e,t,n,s){let i=$e();const o=Bp(t,n),a=Bp(t,qt.max());return ir(e).jn({index:y_,range:IDBKeyRange.bound(o,a,!0)},((u,l,B)=>{const d=this.Ns(K.fromSegments(l.prefixPath.concat(l.collectionGroup,l.documentId)),l);i=i.insert(d.key,d),i.size===s&&B.done()})).next((()=>i))}newChangeBuffer(e){return new NR(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next((t=>t.byteSize))}getMetadata(e){return lp(e).get(lB).next((t=>(q(!!t,20021),t)))}Ms(e,t){return lp(e).put(lB,t)}Ns(e,t){if(t){const n=gR(this.serializer,t);if(!(n.isNoDocument()&&n.version.isEqual(ee.min())))return n}return Le.newInvalidDocument(e)}}function H_(r){return new SR(r)}class NR extends U_{constructor(e,t){super(),this.qs=e,this.trackRemovals=t,this.$s=new Kn((n=>n.toString()),((n,s)=>n.isEqual(s)))}applyChanges(e){const t=[];let n=0,s=new De(((i,o)=>oe(i.canonicalString(),o.canonicalString())));return this.changes.forEach(((i,o)=>{const a=this.$s.get(i);if(t.push(this.qs.removeEntry(e,i,a.readTime)),o.isValidDocument()){const u=$C(this.qs.serializer,o);s=s.add(i.path.popLast());const l=qu(u);n+=l-a.size,t.push(this.qs.addEntry(e,i,u))}else if(n-=a.size,this.trackRemovals){const u=$C(this.qs.serializer,o.convertToNoDocument(ee.min()));t.push(this.qs.addEntry(e,i,u))}})),s.forEach((i=>{t.push(this.qs.indexManager.addToCollectionParentIndex(e,i))})),t.push(this.qs.updateMetadata(e,n)),P.waitFor(t)}getFromCache(e,t){return this.qs.Ls(e,t).next((n=>(this.$s.set(t,{size:n.size,readTime:n.document.readTime}),n.document)))}getAllFromCache(e,t){return this.qs.Us(e,t).next((({documents:n,ks:s})=>(s.forEach(((i,o)=>{this.$s.set(i,{size:o,readTime:n.get(i).readTime})})),n)))}}function lp(r){return st(r,ua)}function ir(r){return st(r,Uu)}function Eo(r){const e=r.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function Bp(r,e){const t=e.documentKey.path.toArray();return[r,ju(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function hp(r,e){const t=r.path.toArray(),n=e.path.toArray();let s=0;for(let i=0;i<t.length-2&&i<n.length-2;++i)if(s=oe(t[i],n[i]),s)return s;return s=oe(t.length,n.length),s||(s=oe(t[t.length-2],n[n.length-2]),s||oe(t[t.length-1],n[n.length-1]))}/**
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
 */class OR{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class q_{constructor(e,t,n,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=s}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(n=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(n!==null&&No(n.mutation,s,St.empty(),Ee.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((n=>this.getLocalViewOfDocuments(e,n,ae()).next((()=>n))))}getLocalViewOfDocuments(e,t,n=ae()){const s=Kt();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,n).next((i=>{let o=Yr();return i.forEach(((a,u)=>{o=o.insert(a,u.overlayedDocument)})),o}))))}getOverlayedDocuments(e,t){const n=Kt();return this.populateOverlays(e,n,t).next((()=>this.computeViews(e,t,n,ae())))}populateOverlays(e,t,n){const s=[];return n.forEach((i=>{t.has(i)||s.push(i)})),this.documentOverlayCache.getOverlays(e,s).next((i=>{i.forEach(((o,a)=>{t.set(o,a)}))}))}computeViews(e,t,n,s){let i=$e();const o=Fo(),a=(function(){return Fo()})();return t.forEach(((u,l)=>{const B=n.get(l.key);s.has(l.key)&&(B===void 0||B.mutation instanceof jn)?i=i.insert(l.key,l):B!==void 0?(o.set(l.key,B.mutation.getFieldMask()),No(B.mutation,l,B.mutation.getFieldMask(),Ee.now())):o.set(l.key,St.empty())})),this.recalculateAndSaveOverlays(e,i).next((u=>(u.forEach(((l,B)=>o.set(l,B))),t.forEach(((l,B)=>a.set(l,new OR(B,o.get(l)??null)))),a)))}recalculateAndSaveOverlays(e,t){const n=Fo();let s=new Re(((o,a)=>o-a)),i=ae();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((o=>{for(const a of o)a.keys().forEach((u=>{const l=t.get(u);if(l===null)return;let B=n.get(u)||St.empty();B=a.applyToLocalView(l,B),n.set(u,B);const d=(s.get(a.batchId)||ae()).add(u);s=s.insert(a.batchId,d)}))})).next((()=>{const o=[],a=s.getReverseIterator();for(;a.hasNext();){const u=a.getNext(),l=u.key,B=u.value,d=Em();B.forEach((C=>{if(!i.has(C)){const g=em(t.get(C),n.get(C));g!==null&&d.set(C,g),i=i.add(C)}})),o.push(this.documentOverlayCache.saveOverlays(e,l,d))}return P.waitFor(o)})).next((()=>n))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((n=>this.recalculateAndSaveOverlays(e,n)))}getDocumentsMatchingQuery(e,t,n,s){return Ue(t)?this.getDocumentsMatchingPipeline(e,t,n,s):dT(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):$B(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,s):this.getDocumentsMatchingCollectionQuery(e,t,n,s)}getNextDocuments(e,t,n,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,s).next((i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,s-i.size):P.resolve(Kt());let a=di,u=i;return o.next((l=>P.forEach(l,((B,d)=>(a<d.largestBatchId&&(a=d.largestBatchId),i.get(B)?P.resolve():this.remoteDocumentCache.getEntry(e,B).next((C=>{u=u.insert(B,C)}))))).next((()=>this.populateOverlays(e,l,i))).next((()=>this.computeViews(e,u,l,ae()))).next((B=>({batchId:a,changes:_m(B)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new K(t)).next((n=>{let s=Yr();return n.isFoundDocument()&&(s=s.insert(n.key,n)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,n,s){const i=t.collectionGroup;let o=Yr();return this.indexManager.getCollectionParents(e,i).next((a=>P.forEach(a,(u=>{const l=(function(d,C){return new Jn(C,null,d.explicitOrderBy.slice(),d.filters.slice(),d.limit,d.limitType,d.startAt,d.endAt)})(t,u.child(i));return this.getDocumentsMatchingCollectionQuery(e,l,n,s).next((B=>{B.forEach(((d,C)=>{o=o.insert(d,C)}))}))})).next((()=>o))))}getDocumentsMatchingCollectionQuery(e,t,n,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next((o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s)))).next((o=>this.retrieveMatchingLocalDocuments(i,o,(a=>lc(t,a)))))}getDocumentsMatchingPipeline(e,t,n,s){if(Fn(t)==="collection_group"){const i=yh(t);let o=Yr();return this.indexManager.getCollectionParents(e,i).next((a=>P.forEach(a,(u=>{const l=(function(d,C){const g=d.stages.map((D=>D instanceof Ta?new wa(C.canonicalString(),{}):D));return new pt(d.serializer,g)})(t,u.child(i));return this.getDocumentsMatchingPipeline(e,l,n,s).next((B=>{B.forEach(((d,C)=>{o=o.insert(d,C)}))}))})).next((()=>o))))}{let i;return this.getOverlaysForPipeline(e,t,n.largestBatchId).next((o=>{switch(i=o,Fn(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s);case"documents":let a=ae();for(const u of Mu(t))a=a.add(K.fromPath(u));return this.remoteDocumentCache.getEntries(e,a);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new M("invalid-argument",`Invalid pipeline source to execute offline: ${Ln(t)}`)}})).next((o=>this.retrieveMatchingLocalDocuments(i,o,(a=>Rc(t,a)))))}}retrieveMatchingLocalDocuments(e,t,n){e.forEach(((i,o)=>{const a=o.getKey();t.get(a)===null&&(t=t.insert(a,Le.newInvalidDocument(a)))}));let s=Yr();return t.forEach(((i,o)=>{const a=e.get(i);a!==void 0&&No(a.mutation,o,St.empty(),Ee.now()),n(o)&&(s=s.insert(i,o))})),s}getOverlaysForPipeline(e,t,n){switch(Fn(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,ue.fromString(Ra(t)),n);case"collection_group":throw new M("invalid-argument",`Unexpected collection group pipeline: ${Ln(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,Mu(t).map((s=>K.fromPath(s))));case"database":return this.documentOverlayCache.getAllOverlays(e,n);default:throw new M("invalid-argument",`Failed to get overlays for pipeline: ${Ln(t)}`)}}}/**
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
 */class FR{constructor(e){this.serializer=e,this.Ks=new Map,this.Ws=new Map}getBundleMetadata(e,t){return P.resolve(this.Ks.get(t))}saveBundleMetadata(e,t){return this.Ks.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:Ke(s.createTime)}})(t)),P.resolve()}getNamedQuery(e,t){return P.resolve(this.Ws.get(t))}saveNamedQuery(e,t){return this.Ws.set(t.name,(function(s){return{name:s.name,query:Tc(s.bundledQuery),readTime:Ke(s.readTime)}})(t)),P.resolve()}}/**
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
 */class LR{constructor(){this.overlays=new Re(K.comparator),this.Qs=new Map}getOverlay(e,t){return P.resolve(this.overlays.get(t))}getOverlays(e,t){const n=Kt();return P.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&n.set(s,i)})))).next((()=>n))}getAllOverlays(e,t){const n=Kt();return this.overlays.forEach(((s,i)=>{i.largestBatchId>t&&n.set(s,i)})),P.resolve(n)}saveOverlays(e,t,n){return n.forEach(((s,i)=>{this.Yr(e,t,i)})),P.resolve()}removeOverlaysForBatchId(e,t,n){const s=this.Qs.get(n);return s!==void 0&&(s.forEach((i=>this.overlays=this.overlays.remove(i))),this.Qs.delete(n)),P.resolve()}getOverlaysForCollection(e,t,n){const s=Kt(),i=t.length+1,o=new K(t.child("")),a=this.overlays.getIteratorFrom(o);for(;a.hasNext();){const u=a.getNext().value,l=u.getKey();if(!t.isPrefixOf(l.path))break;l.path.length===i&&u.largestBatchId>n&&s.set(u.getKey(),u)}return P.resolve(s)}getOverlaysForCollectionGroup(e,t,n,s){let i=new Re(((l,B)=>l-B));const o=this.overlays.getIterator();for(;o.hasNext();){const l=o.getNext().value;if(l.getKey().getCollectionGroup()===t&&l.largestBatchId>n){let B=i.get(l.largestBatchId);B===null&&(B=Kt(),i=i.insert(l.largestBatchId,B)),B.set(l.getKey(),l)}}const a=Kt(),u=i.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach(((l,B)=>a.set(l,B))),!(a.size()>=s)););return P.resolve(a)}Yr(e,t,n){const s=this.overlays.get(n.key);if(s!==null){const o=this.Qs.get(s.largestBatchId).delete(n.key);this.Qs.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(n.key,new Sh(t,n));let i=this.Qs.get(t);i===void 0&&(i=ae(),this.Qs.set(t,i)),this.Qs.set(t,i.add(n.key))}}/**
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
 */class VR{constructor(){this.sessionToken=Se.EMPTY_BYTE_STRING}getSessionToken(e){return P.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,P.resolve()}}/**
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
 */class Fh{constructor(){this.Gs=new De(ot.zs),this.js=new De(ot.Hs)}isEmpty(){return this.Gs.isEmpty()}addReference(e,t){const n=new ot(e,t);this.Gs=this.Gs.add(n),this.js=this.js.add(n)}Js(e,t){e.forEach((n=>this.addReference(n,t)))}removeReference(e,t){this.Ys(new ot(e,t))}Zs(e,t){e.forEach((n=>this.removeReference(n,t)))}Xs(e){const t=new K(new ue([])),n=new ot(t,e),s=new ot(t,e+1),i=[];return this.js.forEachInRange([n,s],(o=>{this.Ys(o),i.push(o.key)})),i}e_(){this.Gs.forEach((e=>this.Ys(e)))}Ys(e){this.Gs=this.Gs.delete(e),this.js=this.js.delete(e)}t_(e){const t=new K(new ue([])),n=new ot(t,e),s=new ot(t,e+1);let i=ae();return this.js.forEachInRange([n,s],(o=>{i=i.add(o.key)})),i}containsKey(e){const t=new ot(e,0),n=this.Gs.firstAfterOrEqual(t);return n!==null&&e.isEqual(n.key)}}class ot{constructor(e,t){this.key=e,this.n_=t}static zs(e,t){return K.comparator(e.key,t.key)||oe(e.n_,t.n_)}static Hs(e,t){return oe(e.n_,t.n_)||K.comparator(e.key,t.key)}}/**
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
 */class kR{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Qr=1,this.r_=new De(ot.zs)}checkEmpty(e){return P.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,n,s){const i=this.Qr;this.Qr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new Th(i,t,n,s);this.mutationQueue.push(o);for(const a of s)this.r_=this.r_.add(new ot(a.key,i)),this.indexManager.addToCollectionParentIndex(e,a.key.path.popLast());return P.resolve(o)}lookupMutationBatch(e,t){return P.resolve(this.i_(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=this.s_(n),i=s<0?0:s;return P.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return P.resolve(this.mutationQueue.length===0?gr:this.Qr-1)}getAllMutationBatches(e){return P.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new ot(t,0),s=new ot(t,Number.POSITIVE_INFINITY),i=[];return this.r_.forEachInRange([n,s],(o=>{const a=this.i_(o.n_);i.push(a)})),P.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new De(oe);return t.forEach((s=>{const i=new ot(s,0),o=new ot(s,Number.POSITIVE_INFINITY);this.r_.forEachInRange([i,o],(a=>{n=n.add(a.n_)}))})),P.resolve(this.__(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1;let i=n;K.isDocumentKey(i)||(i=i.child(""));const o=new ot(new K(i),0);let a=new De(oe);return this.r_.forEachWhile((u=>{const l=u.key.path;return!!n.isPrefixOf(l)&&(l.length===s&&(a=a.add(u.n_)),!0)}),o),P.resolve(this.__(a))}__(e){const t=[];return e.forEach((n=>{const s=this.i_(n);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){q(this.o_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let n=this.r_;return P.forEach(t.mutations,(s=>{const i=new ot(s.key,t.batchId);return n=n.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.r_=n}))}jr(e){}containsKey(e,t){const n=new ot(t,0),s=this.r_.firstAfterOrEqual(n);return P.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,P.resolve()}o_(e,t){return this.s_(e)}s_(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}i_(e){const t=this.s_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class xR{constructor(e){this.a_=e,this.docs=(function(){return new Re(K.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,s=this.docs.get(n),i=s?s.size:0,o=this.a_(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return P.resolve(n?n.document.mutableCopy():Le.newInvalidDocument(t))}getEntries(e,t){let n=$e();return t.forEach((s=>{const i=this.docs.get(s);n=n.insert(s,i?i.document.mutableCopy():Le.newInvalidDocument(s))})),P.resolve(n)}getAllEntries(e){let t=$e();return this.docs.forEach(((n,s)=>{t=t.insert(n,s.document)})),P.resolve(t)}getDocumentsMatchingQuery(e,t,n,s){let i,o;Ue(t)?(i=ue.fromString(Ra(t)),o=B=>Rc(t,B)):(i=t.path,o=B=>lc(t,B));let a=$e();const u=new K(i.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){const{key:B,value:{document:d}}=l.getNext();if(!i.isPrefixOf(B.path))break;B.path.length>i.length+1||zB(Bm(d),n)<=0||(s.has(d.key)||o(d))&&(a=a.insert(d.key,d.mutableCopy()))}return P.resolve(a)}getAllFromCollectionGroup(e,t,n,s){Y(9500)}u_(e,t){return P.forEach(this.docs,(n=>t(n)))}newChangeBuffer(e){return new MR(this)}getSize(e){return P.resolve(this.size)}}class MR extends U_{constructor(e){super(),this.qs=e}applyChanges(e){const t=[];return this.changes.forEach(((n,s)=>{s.isValidDocument()?t.push(this.qs.addEntry(e,s)):this.qs.removeEntry(n)})),P.waitFor(t)}getFromCache(e,t){return this.qs.getEntry(e,t)}getAllFromCache(e,t){return this.qs.getEntries(e,t)}}/**
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
 */class GR{constructor(e){this.persistence=e,this.c_=new Kn((t=>Ic(t)),wh),this.lastRemoteSnapshotVersion=ee.min(),this.highestTargetId=0,this.l_=0,this.E_=new Fh,this.targetCount=0,this.h_=Un.ys()}forEachTarget(e,t){return this.c_.forEach(((n,s)=>t(s))),P.resolve()}getLastRemoteSnapshotVersion(e){return P.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return P.resolve(this.l_)}allocateTargetId(e){return this.highestTargetId=this.h_.next(),P.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.l_&&(this.l_=t),P.resolve()}Ss(e){this.c_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.h_=new Un(t),this.highestTargetId=t),e.sequenceNumber>this.l_&&(this.l_=e.sequenceNumber)}addTargetData(e,t){return this.Ss(t),this.targetCount+=1,P.resolve()}updateTargetData(e,t){return this.Ss(t),P.resolve()}removeTargetData(e,t){return this.c_.delete(t.target),this.E_.Xs(t.targetId),this.targetCount-=1,P.resolve()}removeTargets(e,t,n){let s=0;const i=[];return this.c_.forEach(((o,a)=>{a.sequenceNumber<=t&&n.get(a.targetId)===null&&(this.c_.delete(o),i.push(this.removeMatchingKeysForTargetId(e,a.targetId)),s++)})),P.waitFor(i).next((()=>s))}getTargetCount(e){return P.resolve(this.targetCount)}getTargetData(e,t){const n=this.c_.get(t)||null;return P.resolve(n)}addMatchingKeys(e,t,n){return this.E_.Js(t,n),P.resolve()}removeMatchingKeys(e,t,n){this.E_.Zs(t,n);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach((o=>{i.push(s.markPotentiallyOrphaned(e,o))})),P.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.E_.Xs(t),P.resolve()}getMatchingKeysForTargetId(e,t){const n=this.E_.t_(t);return P.resolve(n)}containsKey(e,t){return P.resolve(this.E_.containsKey(t))}}/**
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
 */class Lh{constructor(e,t){this.T_={},this.overlays={},this.P_=new Nt(0),this.R_=!1,this.R_=!0,this.I_=new VR,this.referenceDelegate=e(this),this.A_=new GR(this),this.indexManager=new AR,this.remoteDocumentCache=(function(s){return new xR(s)})((n=>this.referenceDelegate.V_(n))),this.serializer=new O_(t),this.d_=new FR(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new LR,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.T_[e.toKey()];return n||(n=new kR(t,this.referenceDelegate),this.T_[e.toKey()]=n),n}getGlobalsCache(){return this.I_}getTargetCache(){return this.A_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.d_}runTransaction(e,t,n){U("MemoryPersistence","Starting transaction:",e);const s=new UR(this.P_.next());return this.referenceDelegate.f_(),n(s).next((i=>this.referenceDelegate.m_(s).next((()=>i)))).toPromise().then((i=>(s.raiseOnCommittedEvent(),i)))}p_(e,t){return P.or(Object.values(this.T_).map((n=>()=>n.containsKey(e,t))))}}class UR extends Jm{constructor(e){super(),this.currentSequenceNumber=e}}class Pc{constructor(e){this.persistence=e,this.g_=new Fh,this.y_=null}static w_(e){return new Pc(e)}get b_(){if(this.y_)return this.y_;throw Y(60996)}addReference(e,t,n){return this.g_.addReference(n,t),this.b_.delete(n.toString()),P.resolve()}removeReference(e,t,n){return this.g_.removeReference(n,t),this.b_.add(n.toString()),P.resolve()}markPotentiallyOrphaned(e,t){return this.b_.add(t.toString()),P.resolve()}removeTarget(e,t){this.g_.Xs(t.targetId).forEach((s=>this.b_.add(s.toString())));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((i=>this.b_.add(i.toString())))})).next((()=>n.removeTargetData(e,t)))}f_(){this.y_=new Set}m_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return P.forEach(this.b_,(n=>{const s=K.fromPath(n);return this.v_(e,s).next((i=>{i||t.removeEntry(s,ee.min())}))})).next((()=>(this.y_=null,t.apply(e))))}updateLimboDocument(e,t){return this.v_(e,t).next((n=>{n?this.b_.delete(t.toString()):this.b_.add(t.toString())}))}V_(e){return 0}v_(e,t){return P.or([()=>P.resolve(this.g_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.p_(e,t)])}}class zu{constructor(e,t){this.persistence=e,this.S_=new Kn((n=>mt(n.path)),((n,s)=>n.isEqual(s))),this.garbageCollector=Wm(this,t)}static w_(e,t){return new zu(e,t)}f_(){}m_(e){return P.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}rr(e){const t=this.xs(e);return this.persistence.getTargetCache().getTargetCount(e).next((n=>t.next((s=>n+s))))}xs(e){let t=0;return this.ir(e,(n=>{t++})).next((()=>t))}ir(e,t){return P.forEach(this.S_,((n,s)=>this.Fs(e,n,s).next((i=>i?P.resolve():t(s)))))}removeTargets(e,t,n){return this.persistence.getTargetCache().removeTargets(e,t,n)}removeOrphanedDocuments(e,t){let n=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.u_(e,(o=>this.Fs(e,o,t).next((a=>{a||(n++,i.removeEntry(o,ee.min()))})))).next((()=>i.apply(e))).next((()=>n))}markPotentiallyOrphaned(e,t){return this.S_.set(t,e.currentSequenceNumber),P.resolve()}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,t,n){return this.S_.set(n,e.currentSequenceNumber),P.resolve()}removeReference(e,t,n){return this.S_.set(n,e.currentSequenceNumber),P.resolve()}updateLimboDocument(e,t){return this.S_.set(t,e.currentSequenceNumber),P.resolve()}V_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=gu(e.data.value)),t}Fs(e,t,n){return P.or([()=>this.persistence.p_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.S_.get(t);return P.resolve(s!==void 0&&s>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
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
 */class HR{constructor(e){this.serializer=e}Mn(e,t,n,s){const i=new fc("createOrUpgrade",t);n<1&&s>=1&&((function(u){u.createObjectStore(Pa)})(e),(function(u){u.createObjectStore(aa,{keyPath:Kv}),u.createObjectStore(Wt,{keyPath:QC,autoIncrement:!0}).createIndex(ss,WC,{unique:!0}),u.createObjectStore(mi)})(e),dp(e),(function(u){u.createObjectStore($r)})(e));let o=P.resolve();return n<3&&s>=3&&(n!==0&&((function(u){u.deleteObjectStore(Ei),u.deleteObjectStore(_i),u.deleteObjectStore(cs)})(e),dp(e)),o=o.next((()=>(function(u){const l=u.store(cs),B={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:ee.min().toTimestamp(),targetCount:0};return l.put(Hu,B)})(i)))),n<4&&s>=4&&(n!==0&&(o=o.next((()=>(function(u,l){return l.store(Wt).Kn().next((d=>{u.deleteObjectStore(Wt),u.createObjectStore(Wt,{keyPath:QC,autoIncrement:!0}).createIndex(ss,WC,{unique:!0});const C=l.store(Wt),g=d.map((D=>C.put(D)));return P.waitFor(g)}))})(e,i)))),o=o.next((()=>{(function(u){u.createObjectStore(Ii,{keyPath:tR})})(e)}))),n<5&&s>=5&&(o=o.next((()=>this.D_(i)))),n<6&&s>=6&&(o=o.next((()=>((function(u){u.createObjectStore(ua)})(e),this.x_(i))))),n<7&&s>=7&&(o=o.next((()=>this.C_(i)))),n<8&&s>=8&&(o=o.next((()=>this.F_(e,i)))),n<9&&s>=9&&(o=o.next((()=>{(function(u){u.objectStoreNames.contains("remoteDocumentChanges")&&u.deleteObjectStore("remoteDocumentChanges")})(e)}))),n<10&&s>=10&&(o=o.next((()=>this.O_(i)))),n<11&&s>=11&&(o=o.next((()=>{(function(u){u.createObjectStore(Dc,{keyPath:nR})})(e),(function(u){u.createObjectStore(yc,{keyPath:rR})})(e)}))),n<12&&s>=12&&(o=o.next((()=>{(function(u){const l=u.createObjectStore(wc,{keyPath:lR});l.createIndex(hB,BR,{unique:!1}),l.createIndex(v_,hR,{unique:!1})})(e)}))),n<13&&s>=13&&(o=o.next((()=>(function(u){const l=u.createObjectStore(Uu,{keyPath:Qv});l.createIndex(yu,Wv),l.createIndex(y_,$v)})(e))).next((()=>this.M_(e,i))).next((()=>e.deleteObjectStore($r)))),n<14&&s>=14&&(o=o.next((()=>this.N_(e,i)))),n<15&&s>=15&&(o=o.next((()=>(function(u){u.createObjectStore(Rh,{keyPath:sR,autoIncrement:!0}).createIndex(BB,iR,{unique:!1}),u.createObjectStore(Mo,{keyPath:oR}).createIndex(T_,aR,{unique:!1}),u.createObjectStore(Go,{keyPath:uR}).createIndex(A_,cR,{unique:!1})})(e)))),n<16&&s>=16&&(o=o.next((()=>{t.objectStore(Mo).clear()})).next((()=>{t.objectStore(Go).clear()}))),n<17&&s>=17&&(o=o.next((()=>{(function(u){u.createObjectStore(Ph,{keyPath:dR})})(e)}))),n<18&&s>=18&&lg()&&(o=o.next((()=>{t.objectStore(Mo).clear()})).next((()=>{t.objectStore(Go).clear()}))),o}x_(e){let t=0;return e.store($r).jn(((n,s)=>{t+=qu(s)})).next((()=>{const n={byteSize:t};return e.store(ua).put(lB,n)}))}D_(e){const t=e.store(aa),n=e.store(Wt);return t.Kn().next((s=>P.forEach(s,(i=>{const o=IDBKeyRange.bound([i.userId,gr],[i.userId,i.lastAcknowledgedBatchId]);return n.Kn(ss,o).next((a=>P.forEach(a,(u=>{q(u.userId===i.userId,18650,"Cannot process batch from unexpected user",{batchId:u.batchId});const l=Zr(this.serializer,u);return N_(e,i.userId,l).next((()=>{}))}))))}))))}C_(e){const t=e.store(Ei),n=e.store($r);return e.store(cs).get(Hu).next((s=>{const i=[];return n.jn(((o,a)=>{const u=new ue(o),l=(function(d){return[0,mt(d)]})(u);i.push(t.get(l).next((B=>B?P.resolve():(d=>t.put({targetId:0,path:mt(d),sequenceNumber:s.highestListenSequenceNumber}))(u))))})).next((()=>P.waitFor(i)))}))}F_(e,t){e.createObjectStore(ca,{keyPath:eR});const n=t.store(ca),s=new Oh,i=o=>{if(s.add(o)){const a=o.lastSegment(),u=o.popLast();return n.put({collectionId:a,parent:mt(u)})}};return t.store($r).jn({zn:!0},((o,a)=>{const u=new ue(o);return i(u.popLast())})).next((()=>t.store(mi).jn({zn:!0},(([o,a,u],l)=>{const B=cn(a);return i(B.popLast())}))))}O_(e){const t=e.store(_i);return t.jn(((n,s)=>{const i=Ro(this.serializer,s),o=F_(this.serializer,i);return t.put(o)}))}M_(e,t){const n=t.store($r),s=[];return n.jn(((i,o)=>{const a=t.store(Uu),u=(function(d){return d.document?new K(ue.fromString(d.document.name).popFirst(5)):d.noDocument?K.fromSegments(d.noDocument.path):d.unknownDocument?K.fromSegments(d.unknownDocument.path):Y(36783)})(o).path.toArray(),l={prefixPath:u.slice(0,u.length-2),collectionGroup:u[u.length-2],documentId:u[u.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};s.push(a.put(l))})).next((()=>P.waitFor(s)))}N_(e,t){const n=t.store(Wt),s=H_(this.serializer),i=new Lh(Pc.w_,this.serializer.qr);return n.Kn().next((o=>{const a=new Map;return o.forEach((u=>{let l=a.get(u.userId)??ae();Zr(this.serializer,u).keys().forEach((B=>l=l.add(B))),a.set(u.userId,l)})),P.forEach(a,((u,l)=>{const B=new at(l),d=vc.Kr(this.serializer,B),C=i.getIndexManager(B),g=Ac.Kr(B,this.serializer,C,i.referenceDelegate);return new q_(s,g,d,C).recalculateAndSaveOverlaysForDocumentKeys(new dB(t,Nt.yn),u).next()}))}))}}function dp(r){r.createObjectStore(Ei,{keyPath:Xv}).createIndex(vh,Zv,{unique:!0}),r.createObjectStore(_i,{keyPath:"targetId"}).createIndex(w_,Yv,{unique:!0}),r.createObjectStore(cs)}const or="IndexedDbPersistence",Rl=18e5,Pl=5e3,bl="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",j_="main";class Vh{constructor(e,t,n,s,i,o,a,u,l,B,d=18){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=n,this.xt=i,this.window=o,this.document=a,this.L_=l,this.B_=B,this.U_=d,this.P_=null,this.R_=!1,this.isPrimary=!1,this.networkEnabled=!0,this.k_=null,this.inForeground=!1,this.q_=null,this.K_=null,this.W_=Number.NEGATIVE_INFINITY,this.Q_=C=>Promise.resolve(),!Vh.Je())throw new M(S.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new PR(this,s),this.G_=t+j_,this.serializer=new O_(u),this.z_=new pn(this.G_,this.U_,new HR(this.serializer)),this.I_=new ER,this.A_=new RR(this.referenceDelegate,this.serializer),this.remoteDocumentCache=H_(this.serializer),this.d_=new _R,this.window&&this.window.localStorage?this.j_=this.window.localStorage:(this.j_=null,B===!1&&je(or,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.H_().then((()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new M(S.FAILED_PRECONDITION,bl);return this.J_(),this.Y_(),this.Z_(),this.runTransaction("getHighestListenSequenceNumber","readonly",(e=>this.A_.getHighestSequenceNumber(e)))})).then((e=>{this.P_=new Nt(e,this.L_)})).then((()=>{this.R_=!0})).catch((e=>(this.z_&&this.z_.close(),Promise.reject(e))))}X_(e){return this.Q_=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.z_.Ln((async t=>{t.newVersion===null&&await e()}))}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.xt.enqueueAndForget((async()=>{this.started&&await this.H_()})))}H_(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",(e=>hu(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next((()=>{if(this.isPrimary)return this.eo(e).next((t=>{t||(this.isPrimary=!1,this.xt.enqueueRetryable((()=>this.Q_(!1))))}))})).next((()=>this.no(e))).next((t=>this.isPrimary&&!t?this.ro(e).next((()=>!1)):!!t&&this.io(e).next((()=>!0)))))).catch((e=>{if(Vr(e))return U(or,"Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return U(or,"Releasing owner lease after error during lease refresh",e),!1})).then((e=>{this.isPrimary!==e&&this.xt.enqueueRetryable((()=>this.Q_(e))),this.isPrimary=e}))}eo(e){return Io(e).get(Ms).next((t=>P.resolve(this.so(t))))}_o(e){return hu(e).delete(this.clientId)}async oo(){if(this.isPrimary&&!this.ao(this.W_,Rl)){this.W_=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",(t=>{const n=st(t,Ii);return n.Kn().next((s=>{const i=this.uo(s,Rl),o=s.filter((a=>i.indexOf(a)===-1));return P.forEach(o,(a=>n.delete(a.clientId))).next((()=>o))}))})).catch((()=>[]));if(this.j_)for(const t of e)this.j_.removeItem(this.co(t.clientId))}}Z_(){this.K_=this.xt.enqueueAfterDelay("client_metadata_refresh",4e3,(()=>this.H_().then((()=>this.oo())).then((()=>this.Z_()))))}so(e){return!!e&&e.ownerId===this.clientId}no(e){return this.B_?P.resolve(!0):Io(e).get(Ms).next((t=>{if(t!==null&&this.ao(t.leaseTimestampMs,Pl)&&!this.lo(t.ownerId)){if(this.so(t)&&this.networkEnabled)return!0;if(!this.so(t)){if(!t.allowTabSynchronization)throw new M(S.FAILED_PRECONDITION,bl);return!1}}return!(!this.networkEnabled||!this.inForeground)||hu(e).Kn().next((n=>this.uo(n,Pl).find((s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,o=!this.inForeground&&s.inForeground,a=this.networkEnabled===s.networkEnabled;if(i||o&&a)return!0}return!1}))===void 0))})).next((t=>(this.isPrimary!==t&&U(or,`Client ${t?"is":"is not"} eligible for a primary lease.`),t)))}async shutdown(){this.R_=!1,this.Eo(),this.K_&&(this.K_.cancel(),this.K_=null),this.ho(),this.To(),await this.z_.runTransaction("shutdown","readwrite",[Pa,Ii],(e=>{const t=new dB(e,Nt.yn);return this.ro(t).next((()=>this._o(t)))})),this.z_.close(),this.Po()}uo(e,t){return e.filter((n=>this.ao(n.updateTimeMs,t)&&!this.lo(n.clientId)))}Ro(){return this.runTransaction("getActiveClients","readonly",(e=>hu(e).Kn().next((t=>this.uo(t,Rl).map((n=>n.clientId))))))}get started(){return this.R_}getGlobalsCache(){return this.I_}getMutationQueue(e,t){return Ac.Kr(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.A_}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new vR(e,this.serializer.qr.databaseId)}getDocumentOverlayCache(e){return vc.Kr(this.serializer,e)}getBundleCache(){return this.d_}runTransaction(e,t,n){U(or,"Starting transaction:",e);const s=t==="readonly"?"readonly":"readwrite",i=(function(u){return u===18?pR:u===17?S_:u===16?CR:u===15?bh:u===14?b_:u===13?P_:u===12?fR:u===11?R_:void Y(60245)})(this.U_);let o;return this.z_.runTransaction(e,s,i,(a=>(o=new dB(a,this.P_?this.P_.next():Nt.yn),t==="readwrite-primary"?this.eo(o).next((u=>!!u||this.no(o))).next((u=>{if(!u)throw je(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.xt.enqueueRetryable((()=>this.Q_(!1))),new M(S.FAILED_PRECONDITION,jm);return n(o)})).next((u=>this.io(o).next((()=>u)))):this.Io(o).next((()=>n(o)))))).then((a=>(o.raiseOnCommittedEvent(),a)))}Io(e){return Io(e).get(Ms).next((t=>{if(t!==null&&this.ao(t.leaseTimestampMs,Pl)&&!this.lo(t.ownerId)&&!this.so(t)&&!(this.B_||this.allowTabSynchronization&&t.allowTabSynchronization))throw new M(S.FAILED_PRECONDITION,bl)}))}io(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return Io(e).put(Ms,t)}static Je(){return pn.Je()}ro(e){const t=Io(e);return t.get(Ms).next((n=>this.so(n)?(U(or,"Releasing primary lease."),t.delete(Ms)):P.resolve()))}ao(e,t){const n=Date.now();return!(e<n-t)&&(!(e>n)||(je(`Detected an update time that is in the future: ${e} > ${n}`),!1))}J_(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.q_=()=>{this.xt.enqueueAndForget((()=>(this.inForeground=this.document.visibilityState==="visible",this.H_())))},this.document.addEventListener("visibilitychange",this.q_),this.inForeground=this.document.visibilityState==="visible")}ho(){this.q_&&(this.document.removeEventListener("visibilitychange",this.q_),this.q_=null)}Y_(){var e;typeof((e=this.window)==null?void 0:e.addEventListener)=="function"&&(this.k_=()=>{this.Eo();const t=/(?:Version|Mobile)\/1[456]/;cg()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.xt.enterRestrictedMode(!0),this.xt.enqueueAndForget((()=>this.shutdown()))},this.window.addEventListener("pagehide",this.k_))}To(){this.k_&&(this.window.removeEventListener("pagehide",this.k_),this.k_=null)}lo(e){var t;try{const n=((t=this.j_)==null?void 0:t.getItem(this.co(e)))!==null;return U(or,`Client '${e}' ${n?"is":"is not"} zombied in LocalStorage`),n}catch(n){return je(or,"Failed to get zombied client id.",n),!1}}Eo(){if(this.j_)try{this.j_.setItem(this.co(this.clientId),String(Date.now()))}catch(e){je("Failed to set zombie client id.",e)}}Po(){if(this.j_)try{this.j_.removeItem(this.co(this.clientId))}catch{}}co(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function Io(r){return st(r,Pa)}function hu(r){return st(r,Ii)}function kh(r,e){let t=r.projectId;return r.isDefaultDatabase||(t+="."+r.database),"firestore/"+e+"/"+t+"/"}/**
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
 */class xh{constructor(e,t,n,s){this.targetId=e,this.fromCache=t,this.Ao=n,this.Vo=s}static fo(e,t){let n=ae(),s=ae();for(const i of t.docChanges)switch(i.type){case 0:n=n.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new xh(e,t.fromCache,n,s)}}/**
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
 */function qR(r,e){return K.comparator(r.key,e.key)}/**
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
 */class jR{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class J_{constructor(){this.mo=!1,this.po=!1,this.yo=100,this.wo=(function(){return cg()?8:Km(tt())>0?6:4})()}initialize(e,t){this.bo=e,this.indexManager=t,this.mo=!0}getDocumentsMatchingQuery(e,t,n,s){const i={result:null};return this.vo(e,t).next((o=>{i.result=o})).next((()=>{if(!i.result)return this.So(e,t,s,n).next((o=>{i.result=o}))})).next((()=>{if(i.result)return;const o=new jR;return this.Do(e,t,o).next((a=>{if(i.result=a,this.po)return this.xo(e,t,o,a.size)}))})).next((()=>i.result))}xo(e,t,n,s){return Ue(t)?P.resolve():n.documentReadCount<this.yo?(zs()<=he.DEBUG&&U("QueryEngine","SDK will not create cache indexes for query:",Oo(t),"since it only creates cache indexes for collection contains","more than or equal to",this.yo,"documents"),P.resolve()):(zs()<=he.DEBUG&&U("QueryEngine","Query:",Oo(t),"scans",n.documentReadCount,"local documents and returns",s,"documents as results."),n.documentReadCount>this.wo*s?(zs()<=he.DEBUG&&U("QueryEngine","The SDK decides to create cache indexes for query:",Oo(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,gt(t))):P.resolve())}vo(e,t){if(Ue(t))return P.resolve(null);let n=t;if(PC(n))return P.resolve(null);let s=gt(n);return this.indexManager.getIndexType(e,s).next((i=>i===0?null:(n.limit!==null&&i===1&&(n=Vu(n,null,"F"),s=gt(n)),this.indexManager.getDocumentsMatchingTarget(e,s).next((o=>{const a=ae(...o);return this.bo.getDocuments(e,a).next((u=>this.indexManager.getMinOffset(e,s).next((l=>{const B=this.Co(n,u);return this.Fo(n,B,a,l.readTime)?this.vo(e,Vu(n,null,"F")):this.Oo(e,B,n,l)}))))})))))}So(e,t,n,s){return(Ue(t)?(function(o){for(const a of o.stages){if(a instanceof Pr||a instanceof JC)return!1;if(a instanceof Aa){if(a.condition instanceof c_&&a.condition._expr.name==="exists"&&a.condition._expr.params[0]instanceof bs&&a.condition._expr.params[0].fieldName===on)continue;return!1}}return!0})(t):PC(t))||s.isEqual(ee.min())?P.resolve(null):this.bo.getDocuments(e,n).next((i=>{const o=this.Co(t,i);return this.Fo(t,o,n,s)?P.resolve(null):(zs()<=he.DEBUG&&U("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),KC(t)),this.Oo(e,o,t,lm(s,di)).next((a=>a)))}))}Co(e,t){let n,s;return Ue(e)?(n=new De(qR),s=i=>Rc(e,i)):(n=new De(Bc(e)),s=i=>lc(e,i)),t.forEach(((i,o)=>{s(o)&&(n=n.add(o))})),n}Fo(e,t,n,s){if(Ue(e))return(function(a){return a.stages.some((u=>u instanceof Pr||u instanceof JC))})(e);if(e.limit===null)return!1;if(n.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Do(e,t,n){return zs()<=he.DEBUG&&U("QueryEngine","Using full collection scan to execute query:",KC(t)),this.bo.getDocumentsMatchingQuery(e,t,qt.min(),n)}Oo(e,t,n,s){return this.bo.getDocumentsMatchingQuery(e,n,s).next((i=>(t.forEach((o=>{i=i.insert(o.key,o)})),i)))}}/**
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
 */const Mh="LocalStore",JR=3e8;class KR{constructor(e,t,n,s){this.persistence=e,this.Mo=t,this.serializer=s,this.No=new Re(oe),this.Lo=new Kn((i=>Ic(i)),wh),this.Bo=new Map,this.Uo=e.getRemoteDocumentCache(),this.A_=e.getTargetCache(),this.d_=e.getBundleCache(),this.ko(n)}ko(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new q_(this.Uo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Uo.setIndexManager(this.indexManager),this.Mo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.No)))}}function K_(r,e,t,n){return new KR(r,e,t,n)}async function z_(r,e){const t=W(r);return await t.persistence.runTransaction("Handle user change","readonly",(n=>{let s;return t.mutationQueue.getAllMutationBatches(n).next((i=>(s=i,t.ko(e),t.mutationQueue.getAllMutationBatches(n)))).next((i=>{const o=[],a=[];let u=ae();for(const l of s){o.push(l.batchId);for(const B of l.mutations)u=u.add(B.key)}for(const l of i){a.push(l.batchId);for(const B of l.mutations)u=u.add(B.key)}return t.localDocuments.getDocuments(n,u).next((l=>({qo:l,removedBatchIds:o,addedBatchIds:a})))}))}))}function zR(r,e){const t=W(r);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(n=>{const s=e.batch.keys(),i=t.Uo.newChangeBuffer({trackRemovals:!0});return(function(a,u,l,B){const d=l.batch,C=d.keys();let g=P.resolve();return C.forEach((D=>{g=g.next((()=>B.getEntry(u,D))).next((N=>{const V=l.docVersions.get(D);q(V!==null,48541),N.version.compareTo(V)<0&&(d.applyToRemoteDocument(N,l),N.isValidDocument()&&(N.setReadTime(l.commitVersion),B.addEntry(N)))}))})),g.next((()=>a.mutationQueue.removeMutationBatch(u,d)))})(t,n,e,i).next((()=>i.apply(n))).next((()=>t.mutationQueue.performConsistencyCheck(n))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(n,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,(function(a){let u=ae();for(let l=0;l<a.mutationResults.length;++l)a.mutationResults[l].transformResults.length>0&&(u=u.add(a.batch.mutations[l].key));return u})(e)))).next((()=>t.localDocuments.getDocuments(n,s)))}))}function Q_(r){const e=W(r);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.A_.getLastRemoteSnapshotVersion(t)))}function QR(r,e){const t=W(r),n=e.snapshotVersion;let s=t.No;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const o=t.Uo.newChangeBuffer({trackRemovals:!0});s=t.No;const a=[];e.targetChanges.forEach(((B,d)=>{const C=s.get(d);if(!C)return;a.push(t.A_.removeMatchingKeys(i,B.removedDocuments,d).next((()=>t.A_.addMatchingKeys(i,B.addedDocuments,d))));let g=C.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(d)!==null?g=g.withResumeToken(Se.EMPTY_BYTE_STRING,ee.min()).withLastLimboFreeSnapshotVersion(ee.min()):B.resumeToken.approximateByteSize()>0&&(g=g.withResumeToken(B.resumeToken,n)),s=s.insert(d,g),(function(N,V,H){return N.resumeToken.approximateByteSize()===0||V.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=JR?!0:H.addedDocuments.size+H.modifiedDocuments.size+H.removedDocuments.size>0})(C,g,B)&&a.push(t.A_.updateTargetData(i,g))}));let u=$e(),l=ae();if(e.documentUpdates.forEach((B=>{e.resolvedLimboDocuments.has(B)&&a.push(t.persistence.referenceDelegate.updateLimboDocument(i,B))})),a.push(W_(i,o,e.documentUpdates).next((B=>{u=B.$o,l=B.Ko}))),!n.isEqual(ee.min())){const B=t.A_.getLastRemoteSnapshotVersion(i).next((d=>t.A_.setTargetsMetadata(i,i.currentSequenceNumber,n)));a.push(B)}return P.waitFor(a).next((()=>o.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,u,l))).next((()=>u))})).then((i=>(t.No=s,i)))}function W_(r,e,t){let n=ae(),s=ae();return t.forEach((i=>n=n.add(i))),e.getEntries(r,n).next((i=>{let o=$e();return t.forEach(((a,u)=>{const l=i.get(a);u.isFoundDocument()!==l.isFoundDocument()&&(s=s.add(a)),u.isNoDocument()&&u.version.isEqual(ee.min())?(e.removeEntry(a,u.readTime),o=o.insert(a,u)):!l.isValidDocument()||u.version.compareTo(l.version)>0||u.version.compareTo(l.version)===0&&l.hasPendingWrites?(e.addEntry(u),o=o.insert(a,u)):U(Mh,"Ignoring outdated watch update for ",a,". Current version:",l.version," Watch version:",u.version)})),{$o:o,Ko:s}}))}function WR(r,e){const t=W(r);return t.persistence.runTransaction("Get next mutation batch","readonly",(n=>(e===void 0&&(e=gr),t.mutationQueue.getNextMutationBatchAfterBatchId(n,e))))}function Di(r,e){const t=W(r);return t.persistence.runTransaction("Allocate target","readwrite",(n=>{let s;return t.A_.getTargetData(n,e).next((i=>i?(s=i,P.resolve(s)):t.A_.allocateTargetId(n).next((o=>(s=new ln(e,o,"TargetPurposeListen",n.currentSequenceNumber),t.A_.addTargetData(n,s).next((()=>s)))))))})).then((n=>{const s=t.No.get(n.targetId);return(s===null||n.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.No=t.No.insert(n.targetId,n),t.Lo.set(e,n.targetId)),n}))}async function yi(r,e,t){const n=W(r),s=n.No.get(e),i=t?"readwrite":"readwrite-primary";try{t||await n.persistence.runTransaction("Release target",i,(o=>n.persistence.referenceDelegate.removeTarget(o,s)))}catch(o){if(!Vr(o))throw o;U(Mh,`Failed to update sequence numbers for target ${e}: ${o}`)}n.No=n.No.remove(e),n.Lo.delete(s.target)}function Qu(r,e,t){const n=W(r);let s=ee.min(),i=ae();return n.persistence.runTransaction("Execute query","readwrite",(o=>(function(u,l,B){const d=W(u),C=d.Lo.get(B);return C!==void 0?P.resolve(d.No.get(C)):d.A_.getTargetData(l,B)})(n,o,Ue(e)?e:gt(e)).next((a=>{if(a)return s=a.lastLimboFreeSnapshotVersion,n.A_.getMatchingKeysForTargetId(o,a.targetId).next((u=>{i=u}))})).next((()=>n.Mo.getDocumentsMatchingQuery(o,e,t?s:ee.min(),t?i:ae()))).next((a=>(Y_(n,a),{documents:a,Wo:i})))))}function $_(r,e){const t=W(r),n=W(t.A_),s=t.No.get(e);return s?Promise.resolve(s.target??null):t.persistence.runTransaction("Get target data","readonly",(i=>n.ge(i,e).next((o=>(o==null?void 0:o.target)??null))))}function mB(r,e){const t=W(r),n=t.Bo.get(e)||ee.min();return t.persistence.runTransaction("Get new document changes","readonly",(s=>t.Uo.getAllFromCollectionGroup(s,e,lm(n,di),Number.MAX_SAFE_INTEGER))).then((s=>(Y_(t,s),s)))}function Y_(r,e){e.forEach(((t,n)=>{const s=n.key.getCollectionGroup(),i=r.Bo.get(s)||ee.min();n.readTime.compareTo(i)>0&&r.Bo.set(s,n.readTime)}))}async function $R(r,e,t,n){const s=W(r);let i=ae(),o=$e();for(const l of t){const B=e.Qo(l.metadata.name);l.document&&(i=i.add(B));const d=e.Go(l);d.setReadTime(e.zo(l.metadata.readTime)),o=o.insert(B,d)}const a=s.Uo.newChangeBuffer({trackRemovals:!0}),u=await Di(s,(function(B){return gt(ki(ue.fromString(`__bundle__/docs/${B}`)))})(n));return s.persistence.runTransaction("Apply bundle documents","readwrite",(l=>W_(l,a,o).next((B=>(a.apply(l),B))).next((B=>s.A_.removeMatchingKeysForTargetId(l,u.targetId).next((()=>s.A_.addMatchingKeys(l,i,u.targetId))).next((()=>s.localDocuments.getLocalViewOfDocuments(l,B.$o,B.Ko))).next((()=>B.$o))))))}async function YR(r,e,t=ae()){const n=await Di(r,gt(Tc(e.bundledQuery))),s=W(r);return s.persistence.runTransaction("Save named query","readwrite",(i=>{const o=Ke(e.readTime);if(n.snapshotVersion.compareTo(o)>=0)return s.d_.saveNamedQuery(i,e);const a=n.withResumeToken(Se.EMPTY_BYTE_STRING,o);return s.No=s.No.insert(a.targetId,a),s.A_.updateTargetData(i,a).next((()=>s.A_.removeMatchingKeysForTargetId(i,n.targetId))).next((()=>s.A_.addMatchingKeys(i,t,n.targetId))).next((()=>s.d_.saveNamedQuery(i,e)))}))}/**
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
 */class X_{constructor(e,t){this.jo=e,this.byteLength=t}Ho(){return"metadata"in this.jo}}/**
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
 */function fp(r,e=10240){let t=0;return{async read(){if(t<r.byteLength){const n={value:r.slice(t,t+e),done:!1};return t+=e,n}return{done:!0}},async cancel(){},releaseLock(){},closed:Promise.resolve()}}/**
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
 */class XR{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Jo=0,this.Yo=null,this.Zo=!0}Xo(){this.Jo===0&&(this.ea("Unknown"),this.Yo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.Yo=null,this.ta("Backend didn't respond within 10 seconds."),this.ea("Offline"),Promise.resolve()))))}na(e){this.state==="Online"?this.ea("Unknown"):(this.Jo++,this.Jo>=1&&(this.ra(),this.ta(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ea("Offline")))}set(e){this.ra(),this.Jo=0,e==="Online"&&(this.Zo=!1),this.ea(e)}ea(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ta(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Zo?(je(t),this.Zo=!1):U("OnlineStateTracker",t)}ra(){this.Yo!==null&&(this.Yo.cancel(),this.Yo=null)}}/**
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
 */const _n="RemoteStore";class ZR{constructor(e,t,n,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.ia=[],this.sa=new Map,this._a=new Map,this.oa=new Map,this.aa=new Un(1e3),this.ua=new Un(1001),this.ca=new Set,this.la=[],this.Ea=i,this.Ea.Ke((o=>{n.enqueueAndForget((async()=>{kr(this)&&(U(_n,"Restarting streams for network reachability change."),await(async function(u){const l=W(u);l.ca.add(4),await Ui(l),l.ha.set("Unknown"),l.ca.delete(4),await ba(l)})(this))}))})),this.ha=new XR(n,s)}}async function ba(r){if(kr(r))for(const e of r.la)await e(!0)}async function Ui(r){for(const e of r.la)await e(!1)}function _B(r,e){return r._a.get(e)||void 0}function bc(r,e){const t=W(r),n=_B(t,e.targetId);if(n!==void 0&&t.sa.has(n))return;const s=(function(a,u){const l=_B(a,u);l!==void 0&&a.oa.delete(l);const B=(function(C,g){return g%2!=0?C.ua.next():C.aa.next()})(a,u);return a._a.set(u,B),a.oa.set(B,u),B})(t,e.targetId);U(_n,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new ln(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t.sa.set(s,i),Hh(t)?Uh(t):qi(t).Jt()&&Gh(t,i)}function wi(r,e){const t=W(r),n=qi(t),s=_B(t,e);U(_n,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t.sa.delete(s),t._a.delete(e),t.oa.delete(s),n.Jt()&&Z_(t,s),t.sa.size===0&&(n.Jt()?n.Xt():kr(t)&&t.ha.set("Unknown"))}function Gh(r,e){if(r.Ta.H(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(ee.min())>0){const t=r.oa.get(e.targetId);if(t===void 0)return void U(_n,"SDK target ID not found for remote ID: "+e.targetId);const n=r.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(n)}qi(r).Tn(e)}function Z_(r,e){r.Ta.H(e),qi(r).Pn(e)}function Uh(r){r.Ta=new TT({getRemoteKeysForTarget:e=>{const t=r.oa.get(e);return t!==void 0?r.remoteSyncer.getRemoteKeysForTarget(t):ae()},ge:e=>r.sa.get(e)||null,Ae:()=>r.datastore.serializer.databaseId}),qi(r).start(),r.ha.Xo()}function Hh(r){return kr(r)&&!qi(r).Ht()&&r.sa.size>0}function kr(r){return W(r).ca.size===0}function eE(r){r.Ta=void 0}async function eP(r){r.ha.set("Online")}async function tP(r){r.sa.forEach(((e,t)=>{Gh(r,e)}))}async function nP(r,e){eE(r),Hh(r)?(r.ha.na(e),Uh(r)):r.ha.set("Unknown")}async function rP(r,e,t){if(r.ha.set("Online"),e instanceof ym&&e.state===2&&e.cause)try{await(async function(s,i){const o=i.cause;for(const a of i.targetIds){if(s.sa.has(a)){const u=s.oa.get(a);u!==void 0&&(await s.remoteSyncer.rejectListen(u,o),s._a.delete(u),s.oa.delete(a)),s.sa.delete(a)}s.Ta.removeTarget(a)}})(r,e)}catch(n){U(_n,"Failed to remove targets %s: %s ",e.targetIds.join(","),n),await Wu(r,n)}else if(e instanceof _u?r.Ta.se(e):e instanceof Dm?r.Ta.Ee(e):r.Ta.ae(e),!t.isEqual(ee.min()))try{const n=await Q_(r.localStore);t.compareTo(n)>=0&&await(function(i,o){const a=i.Ta.de(o);a.targetChanges.forEach(((l,B)=>{if(l.resumeToken.approximateByteSize()>0){const d=i.sa.get(B);d&&i.sa.set(B,d.withResumeToken(l.resumeToken,o))}})),a.targetMismatches.forEach(((l,B)=>{const d=i.sa.get(l);if(!d)return;i.sa.set(l,d.withResumeToken(Se.EMPTY_BYTE_STRING,d.snapshotVersion)),Z_(i,l);const C=new ln(d.target,l,B,d.sequenceNumber);Gh(i,C)}));const u=(function(B,d){const C=new Map;d.targetChanges.forEach(((D,N)=>{const V=B.oa.get(N);V!==void 0&&C.set(V,D)}));let g=new Re(oe);return d.targetMismatches.forEach(((D,N)=>{const V=B.oa.get(D);V!==void 0&&(g=g.insert(V,N))})),new xi(d.snapshotVersion,C,g,d.documentUpdates,d.augmentedDocumentUpdates,d.resolvedLimboDocuments)})(i,a);return i.remoteSyncer.applyRemoteEvent(u)})(r,t)}catch(n){U(_n,"Failed to raise snapshot:",n),await Wu(r,n)}}async function Wu(r,e,t){if(!Vr(e))throw e;r.ca.add(1),await Ui(r),r.ha.set("Offline"),t||(t=()=>Q_(r.localStore)),r.asyncQueue.enqueueRetryable((async()=>{U(_n,"Retrying IndexedDB access"),await t(),r.ca.delete(1),await ba(r)}))}function tE(r,e){return e().catch((t=>Wu(r,t,e)))}async function Hi(r){const e=W(r),t=Sr(e);let n=e.ia.length>0?e.ia[e.ia.length-1].batchId:gr;for(;sP(e);)try{const s=await WR(e.localStore,n);if(s===null){e.ia.length===0&&t.Xt();break}n=s.batchId,iP(e,s)}catch(s){await Wu(e,s)}nE(e)&&rE(e)}function sP(r){return kr(r)&&r.ia.length<10}function iP(r,e){r.ia.push(e);const t=Sr(r);t.Jt()&&t.Rn&&t.In(e.mutations)}function nE(r){return kr(r)&&!Sr(r).Ht()&&r.ia.length>0}function rE(r){Sr(r).start()}async function oP(r){Sr(r).dn()}async function aP(r){const e=Sr(r);for(const t of r.ia)e.In(t.mutations)}async function uP(r,e,t){const n=r.ia.shift(),s=Ah.from(n,e,t);await tE(r,(()=>r.remoteSyncer.applySuccessfulWrite(s))),await Hi(r)}async function cP(r,e){e&&Sr(r).Rn&&await(async function(n,s){if((function(o){return pm(o)&&o!==S.ABORTED})(s.code)){const i=n.ia.shift();Sr(n).Zt(),await tE(n,(()=>n.remoteSyncer.rejectFailedWrite(i.batchId,s))),await Hi(n)}})(r,e),nE(r)&&rE(r)}async function Cp(r,e){const t=W(r);t.asyncQueue.verifyOperationInProgress(),U(_n,"RemoteStore received new credentials");const n=kr(t);t.ca.add(3),await Ui(t),n&&t.ha.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.ca.delete(3),await ba(t)}async function EB(r,e){const t=W(r);e?(t.ca.delete(2),await ba(t)):e||(t.ca.add(2),await Ui(t),t.ha.set("Unknown"))}function qi(r){return r.Pa||(r.Pa=(function(t,n,s){const i=W(t);return i.mn(),new WT(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(r.datastore,r.asyncQueue,{ut:eP.bind(null,r),lt:tP.bind(null,r),ht:nP.bind(null,r),hn:rP.bind(null,r)}),r.la.push((async e=>{e?(r.Pa.Zt(),Hh(r)?Uh(r):r.ha.set("Unknown")):(await r.Pa.stop(),eE(r))}))),r.Pa}function Sr(r){return r.Ra||(r.Ra=(function(t,n,s){const i=W(t);return i.mn(),new $T(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(r.datastore,r.asyncQueue,{ut:()=>Promise.resolve(),lt:oP.bind(null,r),ht:cP.bind(null,r),An:aP.bind(null,r),Vn:uP.bind(null,r)}),r.la.push((async e=>{e?(r.Ra.Zt(),await Hi(r)):(await r.Ra.stop(),r.ia.length>0&&(U(_n,`Stopping write stream with ${r.ia.length} pending writes`),r.ia=[]))}))),r.Ra}/**
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
 */class Sc{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ia(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ia(this.observer.error,e):je("Uncaught Error in snapshot listener:",e.toString()))}Aa(){this.muted=!0}Ia(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
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
 */class qh{constructor(e,t,n,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=s,this.removalCallback=i,this.deferred=new ct,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((o=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,s,i){const o=Date.now()+n,a=new qh(e,t,o,s,i);return a.start(n),a}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new M(S.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function ji(r,e){if(je("AsyncQueue",`${e}: ${r}`),Vr(r))return new M(S.UNAVAILABLE,`${e}: ${r}`);throw r}/**
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
 */class lP{constructor(e,t){this.Va=e,this.serializer=t,this.metadata=new ct,this.buffer=new Uint8Array,this.da=(function(){return new TextDecoder("utf-8")})(),this.fa().then((n=>{n&&n.Ho()?this.metadata.resolve(n.jo.metadata):this.metadata.reject(new Error(`The first element of the bundle is not a metadata, it is
             ${JSON.stringify(n==null?void 0:n.jo)}`))}),(n=>this.metadata.reject(n)))}close(){return this.Va.cancel()}async getMetadata(){return this.metadata.promise}async ma(){return await this.getMetadata(),this.fa()}async fa(){const e=await this.pa();if(e===null)return null;const t=this.da.decode(e),n=Number(t);isNaN(n)&&this.ga(`length string (${t}) is not valid number`);const s=await this.ya(n);return new X_(JSON.parse(s),e.length+n)}wa(){return this.buffer.findIndex((e=>e===123))}async pa(){for(;this.wa()<0&&!await this.ba(););if(this.buffer.length===0)return null;const e=this.wa();e<0&&this.ga("Reached the end of bundle when a length string is expected.");const t=this.buffer.slice(0,e);return this.buffer=this.buffer.slice(e),t}async ya(e){for(;this.buffer.length<e;)await this.ba()&&this.ga("Reached the end of bundle when more is expected.");const t=this.da.decode(this.buffer.slice(0,e));return this.buffer=this.buffer.slice(e),t}ga(e){throw this.Va.cancel(),new Error(`Invalid bundle format: ${e}`)}async ba(){const e=await this.Va.read();if(!e.done){const t=new Uint8Array(this.buffer.length+e.value.length);t.set(this.buffer),t.set(e.value,this.buffer.length),this.buffer=t}return e.done}}/**
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
 */class BP{constructor(e,t){this.bundleData=e,this.serializer=t,this.cursor=0,this.elements=[];let n=this.ma();if(!n||!n.Ho())throw new Error(`The first element of the bundle is not a metadata object, it is
         ${JSON.stringify(n==null?void 0:n.jo)}`);this.metadata=n;do n=this.ma(),n!==null&&this.elements.push(n);while(n!==null)}getMetadata(){return this.metadata}va(){return this.elements}ma(){if(this.cursor===this.bundleData.length)return null;const e=this.pa(),t=this.ya(e);return new X_(JSON.parse(t),e)}ya(e){if(this.cursor+e>this.bundleData.length)throw new M(S.INTERNAL,"Reached the end of bundle when more is expected.");return this.bundleData.slice(this.cursor,this.cursor+=e)}pa(){const e=this.cursor;let t=this.cursor;for(;t<this.bundleData.length;){if(this.bundleData[t]==="{"){if(t===e)throw new Error("First character is a bracket and not a number");return this.cursor=t,Number(this.bundleData.slice(e,t))}t++}throw new Error("Reached the end of bundle when more is expected.")}}const Uo="IndexBackfiller";class hP{constructor(e,t){this.asyncQueue=e,this.Sa=t,this.task=null}start(){this.Da(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}Da(e){U(Uo,`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,(async()=>{this.task=null;try{const t=await this.Sa.xa();U(Uo,`Documents written: ${t}`)}catch(t){Vr(t)?U(Uo,"Ignoring IndexedDB error during index backfill: ",t):await Lr(t)}await this.Da(6e4)}))}}class dP{constructor(e,t){this.localStore=e,this.persistence=t}async xa(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",(t=>this.Ca(t,e)))}Ca(e,t){const n=new Set;let s=t,i=!0;return P.doWhile((()=>i===!0&&s>0),(()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next((o=>{if(o!==null&&!n.has(o))return U(Uo,`Processing collection: ${o}`),this.Fa(e,o,s).next((a=>{s-=a,n.add(o)}));i=!1})))).next((()=>t-s))}Fa(e,t,n){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next((s=>this.localStore.localDocuments.getNextDocuments(e,t,s,n).next((i=>{const o=i.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next((()=>this.Oa(s,i))).next((a=>(U(Uo,`Updating offset: ${a}`),this.localStore.indexManager.updateCollectionGroup(e,t,a)))).next((()=>o.size))}))))}Oa(e,t){let n=e;return t.changes.forEach(((s,i)=>{const o=Bm(i);zB(o,n)>0&&(n=o)})),new qt(n.readTime,n.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
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
 */const sE="firestore_clients";function pp(r,e){return`${sE}_${r}_${e}`}const iE="firestore_mutations";function gp(r,e,t){let n=`${iE}_${r}_${t}`;return e.isAuthenticated()&&(n+=`_${e.uid}`),n}const oE="firestore_targets";function Sl(r,e){return`${oE}_${r}_${e}`}/**
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
 */const sn="SharedClientState";class $u{constructor(e,t,n,s){this.user=e,this.batchId=t,this.state=n,this.error=s}static Ma(e,t,n){const s=JSON.parse(n);let i,o=typeof s=="object"&&["pending","acknowledged","rejected"].indexOf(s.state)!==-1&&(s.error===void 0||typeof s.error=="object");return o&&s.error&&(o=typeof s.error.message=="string"&&typeof s.error.code=="string",o&&(i=new M(s.error.code,s.error.message))),o?new $u(e,t,s.state,i):(je(sn,`Failed to parse mutation state for ID '${t}': ${n}`),null)}Na(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class Ho{constructor(e,t,n){this.targetId=e,this.state=t,this.error=n}static Ma(e,t){const n=JSON.parse(t);let s,i=typeof n=="object"&&["not-current","current","rejected"].indexOf(n.state)!==-1&&(n.error===void 0||typeof n.error=="object");return i&&n.error&&(i=typeof n.error.message=="string"&&typeof n.error.code=="string",i&&(s=new M(n.error.code,n.error.message))),i?new Ho(e,n.state,s):(je(sn,`Failed to parse target state for ID '${e}': ${t}`),null)}Na(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class Yu{constructor(e,t){this.clientId=e,this.activeTargetIds=t}static Ma(e,t){const n=JSON.parse(t);let s=typeof n=="object"&&n.activeTargetIds instanceof Array,i=YB();for(let o=0;s&&o<n.activeTargetIds.length;++o)s=Jg(n.activeTargetIds[o]),i=i.add(n.activeTargetIds[o]);return s?new Yu(e,i):(je(sn,`Failed to parse client data for instance '${e}': ${t}`),null)}}class jh{constructor(e,t){this.clientId=e,this.onlineState=t}static Ma(e){const t=JSON.parse(e);return typeof t=="object"&&["Unknown","Online","Offline"].indexOf(t.onlineState)!==-1&&typeof t.clientId=="string"?new jh(t.clientId,t.onlineState):(je(sn,`Failed to parse online state: ${e}`),null)}}class IB{constructor(){this.activeTargetIds=YB()}La(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ba(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Na(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Nl{constructor(e,t,n,s,i){this.window=e,this.xt=t,this.persistenceKey=n,this.Ua=s,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.ka=this.qa.bind(this),this.$a=new Re(oe),this.started=!1,this.Ka=[];const o=n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=i,this.Wa=pp(this.persistenceKey,this.Ua),this.Qa=(function(u){return`firestore_sequence_number_${u}`})(this.persistenceKey),this.$a=this.$a.insert(this.Ua,new IB),this.Ga=new RegExp(`^${sE}_${o}_([^_]*)$`),this.za=new RegExp(`^${iE}_${o}_(\\d+)(?:_(.*))?$`),this.ja=new RegExp(`^${oE}_${o}_(\\d+)$`),this.Ha=(function(u){return`firestore_online_state_${u}`})(this.persistenceKey),this.Ja=(function(u){return`firestore_bundle_loaded_v2_${u}`})(this.persistenceKey),this.window.addEventListener("storage",this.ka)}static Je(e){return!(!e||!e.localStorage)}async start(){const e=await this.syncEngine.Ro();for(const n of e){if(n===this.Ua)continue;const s=this.getItem(pp(this.persistenceKey,n));if(s){const i=Yu.Ma(n,s);i&&(this.$a=this.$a.insert(i.clientId,i))}}this.Ya();const t=this.storage.getItem(this.Ha);if(t){const n=this.Za(t);n&&this.Xa(n)}for(const n of this.Ka)this.qa(n);this.Ka=[],this.window.addEventListener("pagehide",(()=>this.shutdown())),this.started=!0}writeSequenceNumber(e){this.setItem(this.Qa,JSON.stringify(e))}getAllActiveQueryTargets(){return this.eu(this.$a)}isActiveQueryTarget(e){let t=!1;return this.$a.forEach(((n,s)=>{s.activeTargetIds.has(e)&&(t=!0)})),t}addPendingMutation(e){this.tu(e,"pending")}updateMutationState(e,t,n){this.tu(e,t,n),this.nu(e)}addLocalQueryTarget(e,t=!0){let n="not-current";if(this.isActiveQueryTarget(e)){const s=this.storage.getItem(Sl(this.persistenceKey,e));if(s){const i=Ho.Ma(e,s);i&&(n=i.state)}}return t&&this.ru.La(e),this.Ya(),n}removeLocalQueryTarget(e){this.ru.Ba(e),this.Ya()}isLocalQueryTarget(e){return this.ru.activeTargetIds.has(e)}clearQueryState(e){this.removeItem(Sl(this.persistenceKey,e))}updateQueryState(e,t,n){this.iu(e,t,n)}handleUserChange(e,t,n){t.forEach((s=>{this.nu(s)})),this.currentUser=e,n.forEach((s=>{this.addPendingMutation(s)}))}setOnlineState(e){this.su(e)}notifyBundleLoaded(e){this._u(e)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.ka),this.removeItem(this.Wa),this.started=!1)}getItem(e){const t=this.storage.getItem(e);return U(sn,"READ",e,t),t}setItem(e,t){U(sn,"SET",e,t),this.storage.setItem(e,t)}removeItem(e){U(sn,"REMOVE",e),this.storage.removeItem(e)}qa(e){const t=e;if(t.storageArea===this.storage){if(U(sn,"EVENT",t.key,t.newValue),t.key===this.Wa)return void je("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.xt.enqueueRetryable((async()=>{if(this.started){if(t.key!==null){if(this.Ga.test(t.key)){if(t.newValue==null){const n=this.ou(t.key);return this.au(n,null)}{const n=this.uu(t.key,t.newValue);if(n)return this.au(n.clientId,n)}}else if(this.za.test(t.key)){if(t.newValue!==null){const n=this.cu(t.key,t.newValue);if(n)return this.lu(n)}}else if(this.ja.test(t.key)){if(t.newValue!==null){const n=this.Eu(t.key,t.newValue);if(n)return this.hu(n)}}else if(t.key===this.Ha){if(t.newValue!==null){const n=this.Za(t.newValue);if(n)return this.Xa(n)}}else if(t.key===this.Qa){const n=(function(i){let o=Nt.yn;if(i!=null)try{const a=JSON.parse(i);q(typeof a=="number",30636,{Tu:i}),o=a}catch(a){je(sn,"Failed to read sequence number from WebStorage",a)}return o})(t.newValue);n!==Nt.yn&&this.sequenceNumberHandler(n)}else if(t.key===this.Ja){const n=this.Pu(t.newValue);await Promise.all(n.map((s=>this.syncEngine.Ru(s))))}}}else this.Ka.push(t)}))}}get ru(){return this.$a.get(this.Ua)}Ya(){this.setItem(this.Wa,this.ru.Na())}tu(e,t,n){const s=new $u(this.currentUser,e,t,n),i=gp(this.persistenceKey,this.currentUser,e);this.setItem(i,s.Na())}nu(e){const t=gp(this.persistenceKey,this.currentUser,e);this.removeItem(t)}su(e){const t={clientId:this.Ua,onlineState:e};this.storage.setItem(this.Ha,JSON.stringify(t))}iu(e,t,n){const s=Sl(this.persistenceKey,e),i=new Ho(e,t,n);this.setItem(s,i.Na())}_u(e){const t=JSON.stringify(Array.from(e));this.setItem(this.Ja,t)}ou(e){const t=this.Ga.exec(e);return t?t[1]:null}uu(e,t){const n=this.ou(e);return Yu.Ma(n,t)}cu(e,t){const n=this.za.exec(e),s=Number(n[1]),i=n[2]!==void 0?n[2]:null;return $u.Ma(new at(i),s,t)}Eu(e,t){const n=this.ja.exec(e),s=Number(n[1]);return Ho.Ma(s,t)}Za(e){return jh.Ma(e)}Pu(e){return JSON.parse(e)}async lu(e){if(e.user.uid===this.currentUser.uid)return this.syncEngine.Iu(e.batchId,e.state,e.error);U(sn,`Ignoring mutation for non-active user ${e.user.uid}`)}hu(e){return this.syncEngine.Au(e.targetId,e.state,e.error)}au(e,t){const n=t?this.$a.insert(e,t):this.$a.remove(e),s=this.eu(this.$a),i=this.eu(n),o=[],a=[];return i.forEach((u=>{s.has(u)||o.push(u)})),s.forEach((u=>{i.has(u)||a.push(u)})),this.syncEngine.Vu(o,a).then((()=>{this.$a=n}))}Xa(e){this.$a.get(e.clientId)&&this.onlineStateHandler(e.onlineState)}eu(e){let t=YB();return e.forEach(((n,s)=>{t=t.unionWith(s.activeTargetIds)})),t}}class aE{constructor(){this.du=new IB,this.fu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.du.La(e),this.fu[e]||"not-current"}updateQueryState(e,t,n){this.fu[e]=t}removeLocalQueryTarget(e){this.du.Ba(e)}isLocalQueryTarget(e){return this.du.activeTargetIds.has(e)}clearQueryState(e){delete this.fu[e]}getAllActiveQueryTargets(){return this.du.activeTargetIds}isActiveQueryTarget(e){return this.du.activeTargetIds.has(e)}start(){return this.du=new IB,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */function uE(){return typeof window<"u"?window:null}function Tu(){return typeof document<"u"?document:null}/**
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
 */class _r{static emptySet(e){return new _r(e.comparator)}constructor(e){this.comparator=e?(t,n)=>e(t,n)||K.comparator(t.key,n.key):(t,n)=>K.comparator(t.key,n.key),this.keyedMap=Yr(),this.sortedSet=new Re(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,n)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof _r)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const n=new _r;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}/**
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
 */class mp{constructor(){this.mu=new Re(K.comparator)}track(e){const t=e.doc.key,n=this.mu.get(t);n?e.type!==0&&n.type===3?this.mu=this.mu.insert(t,e):e.type===3&&n.type!==1?this.mu=this.mu.insert(t,{type:n.type,doc:e.doc}):e.type===2&&n.type===2?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):e.type===2&&n.type===0?this.mu=this.mu.insert(t,{type:0,doc:e.doc}):e.type===1&&n.type===0?this.mu=this.mu.remove(t):e.type===1&&n.type===2?this.mu=this.mu.insert(t,{type:1,doc:n.doc}):e.type===0&&n.type===1?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):Y(63341,{ye:e,pu:n}):this.mu=this.mu.insert(t,e)}gu(){const e=[];return this.mu.inorderTraversal(((t,n)=>{e.push(n)})),e}}class Ds{constructor(e,t,n,s,i,o,a,u,l){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=a,this.excludesMetadataChanges=u,this.hasCachedResults=l}static fromInitialDocuments(e,t,n,s,i){const o=[];return t.forEach((a=>{o.push({type:0,doc:a})})),new Ds(e,t,_r.emptySet(t),o,n,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Ec(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==n[s].type||!t[s].doc.isEqual(n[s].doc))return!1;return!0}}/**
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
 */class fP{constructor(){this.yu=void 0,this.wu=[]}bu(){return this.wu.some((e=>e.vu()))}}class CP{constructor(){this.queries=_p(),this.onlineState="Unknown",this.Su=new Set}terminate(){(function(t,n){const s=W(t),i=s.queries;s.queries=_p(),i.forEach(((o,a)=>{for(const u of a.wu)u.onError(n)}))})(this,new M(S.ABORTED,"Firestore shutting down"))}}function _p(){return new Kn((r=>I_(r)),Ec)}async function Jh(r,e){const t=W(r);let n=3;const s=e.query;let i=t.queries.get(s);i?!i.bu()&&e.vu()&&(n=2):(i=new fP,n=e.vu()?0:1);try{switch(n){case 0:i.yu=await t.onListen(s,!0);break;case 1:i.yu=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const a=ji(o,`Initialization of query '${Ue(e.query)?Ln(e.query):Oo(e.query)}' failed`);return void e.onError(a)}t.queries.set(s,i),i.wu.push(e),e.Du(t.onlineState),i.yu&&e.xu(i.yu)&&zh(t)}async function Kh(r,e){const t=W(r),n=e.query;let s=3;const i=t.queries.get(n);if(i){const o=i.wu.indexOf(e);o>=0&&(i.wu.splice(o,1),i.wu.length===0?s=e.vu()?0:1:!i.bu()&&e.vu()&&(s=2))}switch(s){case 0:return t.queries.delete(n),t.onUnlisten(n,!0);case 1:return t.queries.delete(n),t.onUnlisten(n,!1);case 2:return t.onLastRemoteStoreUnlisten(n);default:return}}function pP(r,e){const t=W(r);let n=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const a of o.wu)a.xu(s)&&(n=!0);o.yu=s}}n&&zh(t)}function gP(r,e,t){const n=W(r),s=n.queries.get(e);if(s)for(const i of s.wu)i.onError(t);n.queries.delete(e)}function zh(r){r.Su.forEach((e=>{e.next()}))}var DB;(function(r){r.Default="default",r.Cache="cache"})(DB||(DB={}));class Qh{constructor(e,t,n){this.query=e,this.Cu=t,this.Fu=!1,this.Ou=null,this.onlineState="Unknown",this.options=n||{}}xu(e){if(!this.options.includeMetadataChanges){const n=[];for(const s of e.docChanges)s.type!==3&&n.push(s);e=new Ds(e.query,e.docs,e.oldDocs,n,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Fu?this.Mu(e)&&(this.Cu.next(e),t=!0):this.Nu(e,this.onlineState)&&(this.Lu(e),t=!0),this.Ou=e,t}onError(e){this.Cu.error(e)}Du(e){this.onlineState=e;let t=!1;return this.Ou&&!this.Fu&&this.Nu(this.Ou,e)&&(this.Lu(this.Ou),t=!0),t}Nu(e,t){if(!e.fromCache||!this.vu())return!0;const n=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Mu(e){if(e.docChanges.length>0)return!0;const t=this.Ou&&this.Ou.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Lu(e){e=Ds.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Fu=!0,this.Cu.next(e)}vu(){return this.options.source!==DB.Cache}}/**
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
 */class Ep{constructor(e){this.serializer=e}Qo(e){return Cn(this.serializer,e)}Go(e){return e.metadata.exists?hc(this.serializer,e.document,!1):Le.newNoDocument(this.Qo(e.metadata.name),this.zo(e.metadata.readTime))}zo(e){return Ke(e)}}class Wh{constructor(e,t){this.Bu=e,this.serializer=t,this.Uu=[],this.ku=[],this.collectionGroups=new Set,this.progress=cE(e)}get queries(){return this.Uu}get documents(){return this.ku}qu(e){this.progress.bytesLoaded+=e.byteLength;let t=this.progress.documentsLoaded;if(e.jo.namedQuery)this.Uu.push(e.jo.namedQuery);else if(e.jo.documentMetadata){this.ku.push({metadata:e.jo.documentMetadata}),e.jo.documentMetadata.exists||++t;const n=ue.fromString(e.jo.documentMetadata.name);this.collectionGroups.add(n.get(n.length-2))}else e.jo.document&&(this.ku[this.ku.length-1].document=e.jo.document,++t);return t!==this.progress.documentsLoaded?(this.progress.documentsLoaded=t,{...this.progress}):null}$u(e){const t=new Map,n=new Ep(this.serializer);for(const s of e)if(s.metadata.queries){const i=n.Qo(s.metadata.name);for(const o of s.metadata.queries){const a=(t.get(o)||ae()).add(i);t.set(o,a)}}return t}async Ku(e){const t=await $R(e,new Ep(this.serializer),this.ku,this.Bu.id),n=this.$u(this.documents);for(const s of this.Uu)await YR(e,s,n.get(s.name));return this.progress.taskState="Success",{progress:this.progress,Wu:this.collectionGroups,Qu:t}}}function cE(r){return{taskState:"Running",documentsLoaded:0,bytesLoaded:0,totalDocuments:r.totalDocuments,totalBytes:r.totalBytes}}/**
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
 */class lE{constructor(e){this.key=e}}class BE{constructor(e){this.key=e}}class hE{constructor(e,t){this.query=e,this.Gu=t,this.zu=null,this.hasCachedResults=!1,this.current=!1,this.ju=ae(),this.mutatedKeys=ae(),this.Hu=Ue(e)?Ku(e):Bc(e),this.Ju=new _r(this.Hu)}get Yu(){return this.Gu}Zu(e,t){const n=t?t.Xu:new mp,s=t?t.Ju:this.Ju;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,a=!1;const[u,l]=this.ec(this.query,s);e.inorderTraversal(((d,C)=>{const g=s.get(d),D=G_(this.query,C)?C:null,N=!!g&&this.mutatedKeys.has(g.key),V=!!D&&(D.hasLocalMutations||this.mutatedKeys.has(D.key)&&D.hasCommittedMutations);let H=!1;g&&D?g.data.isEqual(D.data)?N!==V&&(n.track({type:3,doc:D}),H=!0):this.tc(g,D)||(n.track({type:2,doc:D}),H=!0,(u&&this.Hu(D,u)>0||l&&this.Hu(D,l)<0)&&(a=!0)):!g&&D?(n.track({type:0,doc:D}),H=!0):g&&!D&&(n.track({type:1,doc:g}),H=!0,(u||l)&&(a=!0)),H&&(D?(o=o.add(D),i=V?i.add(d):i.delete(d)):(o=o.delete(d),i=i.delete(d)))}));const B=this.nc(this.query);if(B)if(Ue(this.query)){const d=[];o.forEach((D=>d.push(D)));const C=M_(this.query,d);let g=new _r(Ku(this.query));for(const D of C)g=g.add(D);o.forEach((D=>{g.has(D.key)||(i=i.delete(D.key),n.track({type:1,doc:D}))})),o=g}else{const d=this.rc(this.query);for(;o.size>B;){const C=d==="F"?o.last():o.first();o=o.delete(C.key),i=i.delete(C.key),n.track({type:1,doc:C})}}return{Ju:o,Xu:n,Fo:a,mutatedKeys:i}}nc(e){var t;return Ue(e)?(t=vl(e))==null?void 0:t.limit:e.limit||void 0}rc(e){if(Ue(e)){const t=vl(e);return t&&t.limit<0?"L":"F"}return e.limitType}ec(e,t){var n;if(Ue(e)){const s=(n=vl(e))==null?void 0:n.limit;return[t.size===s?t.last():null,null]}return[e.limitType==="F"&&t.size===this.nc(this.query)?t.last():null,e.limitType==="L"&&t.size===this.nc(this.query)?t.first():null]}tc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,s){const i=this.Ju;this.Ju=e.Ju,this.mutatedKeys=e.mutatedKeys;const o=e.Xu.gu();o.sort(((B,d)=>(function(g,D){const N=V=>{switch(V){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return Y(20277,{ye:V})}};return N(g)-N(D)})(B.type,d.type)||this.Hu(B.doc,d.doc))),this.sc(n),s=s??!1;const a=t&&!s?this._c():[],u=this.ju.size===0&&this.current&&!s?1:0,l=u!==this.zu;return this.zu=u,o.length!==0||l?{snapshot:new Ds(this.query,e.Ju,i,o,e.mutatedKeys,u===0,l,!1,!!n&&n.resumeToken.approximateByteSize()>0),oc:a}:{oc:a}}Du(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ju:this.Ju,Xu:new mp,mutatedKeys:this.mutatedKeys,Fo:!1},!1)):{oc:[]}}ac(e){return!this.Gu.has(e)&&!!this.Ju.has(e)&&!this.Ju.get(e).hasLocalMutations}sc(e){e&&(e.addedDocuments.forEach((t=>this.Gu=this.Gu.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.Gu=this.Gu.delete(t))),this.current=e.current)}_c(){if(!this.current)return[];const e=this.ju;this.ju=ae(),this.Ju.forEach((n=>{this.ac(n.key)&&(this.ju=this.ju.add(n.key))}));const t=[];return e.forEach((n=>{this.ju.has(n)||t.push(new BE(n))})),this.ju.forEach((n=>{e.has(n)||t.push(new lE(n))})),t}uc(e){this.Gu=e.Wo,this.ju=ae();const t=this.Zu(e.documents);return this.applyChanges(t,!0)}cc(){return Ds.fromInitialDocuments(this.query,this.Ju,this.mutatedKeys,this.zu===0,this.hasCachedResults)}}const xr="SyncEngine";class mP{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class _P{constructor(e){this.key=e,this.lc=!1}}class EP{constructor(e,t,n,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Ec={},this.hc=new Kn((a=>I_(a)),Ec),this.Tc=new Map,this.Pc=new Set,this.Rc=new Re(K.comparator),this.Ic=new Map,this.Ac=new Fh,this.Vc={},this.dc=new Map,this.fc=Un.ws(),this.onlineState="Unknown",this.mc=void 0}get isPrimaryClient(){return this.mc===!0}}async function IP(r,e,t=!0){const n=Nc(r);let s;const i=n.hc.get(e);return i?(n.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.cc()):s=await dE(n,e,t,!0),s}async function DP(r,e){const t=Nc(r);await dE(t,e,!0,!1)}async function dE(r,e,t,n){const s=await Di(r.localStore,Ue(e)?e:gt(e)),i=s.targetId,o=r.sharedClientState.addLocalQueryTarget(i,t);let a;return n&&(a=await $h(r,e,i,o==="current",s.resumeToken)),r.isPrimaryClient&&t&&bc(r.remoteStore,s),a}async function $h(r,e,t,n,s){r.gc=(d,C,g)=>(async function(N,V,H,Z){let re=V.view.Zu(H);re.Fo&&(re=await Qu(N.localStore,V.query,!1).then((({documents:T})=>V.view.Zu(T,re))));const de=Z&&Z.targetChanges.get(V.targetId),Ce=Z&&Z.targetMismatches.get(V.targetId)!=null,le=V.view.applyChanges(re,N.isPrimaryClient,de,Ce);return yB(N,V.targetId,le.oc),le.snapshot})(r,d,C,g);const i=await Qu(r.localStore,e,!0),o=new hE(e,i.Wo),a=o.Zu(i.documents),u=Ia.createSynthesizedTargetChangeForCurrentChange(t,n&&r.onlineState!=="Offline",s),l=o.applyChanges(a,r.isPrimaryClient,u);yB(r,t,l.oc);const B=new mP(e,t,o);return r.hc.set(e,B),r.Tc.has(t)?r.Tc.get(t).push(e):r.Tc.set(t,[e]),l.snapshot}async function yP(r,e,t){const n=W(r),s=n.hc.get(e),i=n.Tc.get(s.targetId);if(i.length>1)return n.Tc.set(s.targetId,i.filter((o=>!Ec(o,e)))),void n.hc.delete(e);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(s.targetId),n.sharedClientState.isActiveQueryTarget(s.targetId)||await yi(n.localStore,s.targetId,!1).then((()=>{n.sharedClientState.clearQueryState(s.targetId),t&&wi(n.remoteStore,s.targetId),Ti(n,s.targetId)})).catch(Lr)):(Ti(n,s.targetId),await yi(n.localStore,s.targetId,!0))}async function wP(r,e){const t=W(r),n=t.hc.get(e),s=t.Tc.get(n.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(n.targetId),wi(t.remoteStore,n.targetId))}async function TP(r,e,t){const n=ed(r);try{const s=await(function(o,a){const u=W(o),l=Ee.now(),B=a.reduce(((g,D)=>g.add(D.key)),ae());let d,C;return u.persistence.runTransaction("Locally write mutations","readwrite",(g=>{let D=$e(),N=ae();return u.Uo.getEntries(g,B).next((V=>{D=V,D.forEach(((H,Z)=>{Z.isValidDocument()||(N=N.add(H))}))})).next((()=>u.localDocuments.getOverlayedDocuments(g,D))).next((V=>{d=V;const H=[];for(const Z of a){const re=nT(Z,d.get(Z.key).overlayedDocument);re!=null&&H.push(new jn(Z.key,re,Wg(re.value.mapValue),Me.exists(!0)))}return u.mutationQueue.addMutationBatch(g,l,H,a)})).next((V=>{C=V;const H=V.applyToLocalDocumentSet(d,N);return u.documentOverlayCache.saveOverlays(g,V.batchId,H)}))})).then((()=>({batchId:C.batchId,changes:_m(d)})))})(n.localStore,e);n.sharedClientState.addPendingMutation(s.batchId),(function(o,a,u){let l=o.Vc[o.currentUser.toKey()];l||(l=new Re(oe)),l=l.insert(a,u),o.Vc[o.currentUser.toKey()]=l})(n,s.batchId,t),await zn(n,s.changes),await Hi(n.remoteStore)}catch(s){const i=ji(s,"Failed to persist write");t.reject(i)}}async function fE(r,e){const t=W(r);try{const n=await QR(t.localStore,e);e.targetChanges.forEach(((s,i)=>{const o=t.Ic.get(i);o&&(q(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.lc=!0:s.modifiedDocuments.size>0?q(o.lc,14607):s.removedDocuments.size>0&&(q(o.lc,42227),o.lc=!1))})),await zn(t,n,e)}catch(n){await Lr(n)}}function Ip(r,e,t){const n=W(r);if(n.isPrimaryClient&&t===0||!n.isPrimaryClient&&t===1){const s=[];n.hc.forEach(((i,o)=>{const a=o.view.Du(e);a.snapshot&&s.push(a.snapshot)})),(function(o,a){const u=W(o);u.onlineState=a;let l=!1;u.queries.forEach(((B,d)=>{for(const C of d.wu)C.Du(a)&&(l=!0)})),l&&zh(u)})(n.eventManager,e),s.length&&n.Ec.hn(s),n.onlineState=e,n.isPrimaryClient&&n.sharedClientState.setOnlineState(e)}}async function AP(r,e,t){const n=W(r);n.sharedClientState.updateQueryState(e,"rejected",t);const s=n.Ic.get(e),i=s&&s.key;if(i){let o=new Re(K.comparator);o=o.insert(i,Le.newNoDocument(i,ee.min()));const a=ae().add(i),u=new xi(ee.min(),new Map,new Re(oe),o,$e(),a);await fE(n,u),n.Rc=n.Rc.remove(i),n.Ic.delete(e),Zh(n)}else await yi(n.localStore,e,!1).then((()=>Ti(n,e,t))).catch(Lr)}async function vP(r,e){const t=W(r),n=e.batch.batchId;try{const s=await zR(t.localStore,e);Xh(t,n,null),Yh(t,n),t.sharedClientState.updateMutationState(n,"acknowledged"),await zn(t,s)}catch(s){await Lr(s)}}async function RP(r,e,t){const n=W(r);try{const s=await(function(o,a){const u=W(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",(l=>{let B;return u.mutationQueue.lookupMutationBatch(l,a).next((d=>(q(d!==null,37113),B=d.keys(),u.mutationQueue.removeMutationBatch(l,d)))).next((()=>u.mutationQueue.performConsistencyCheck(l))).next((()=>u.documentOverlayCache.removeOverlaysForBatchId(l,B,a))).next((()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(l,B))).next((()=>u.localDocuments.getDocuments(l,B)))}))})(n.localStore,e);Xh(n,e,t),Yh(n,e),n.sharedClientState.updateMutationState(e,"rejected",t),await zn(n,s)}catch(s){await Lr(s)}}async function PP(r,e){const t=W(r);kr(t.remoteStore)||U(xr,"The network is disabled. The task returned by 'awaitPendingWrites()' will not complete until the network is enabled.");try{const n=await(function(o){const a=W(o);return a.persistence.runTransaction("Get highest unacknowledged batch id","readonly",(u=>a.mutationQueue.getHighestUnacknowledgedBatchId(u)))})(t.localStore);if(n===gr)return void e.resolve();const s=t.dc.get(n)||[];s.push(e),t.dc.set(n,s)}catch(n){const s=ji(n,"Initialization of waitForPendingWrites() operation failed");e.reject(s)}}function Yh(r,e){(r.dc.get(e)||[]).forEach((t=>{t.resolve()})),r.dc.delete(e)}function Xh(r,e,t){const n=W(r);let s=n.Vc[n.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),n.Vc[n.currentUser.toKey()]=s}}function Ti(r,e,t=null){r.sharedClientState.removeLocalQueryTarget(e);for(const n of r.Tc.get(e))r.hc.delete(n),t&&r.Ec.yc(n,t);r.Tc.delete(e),r.isPrimaryClient&&r.Ac.Xs(e).forEach((n=>{r.Ac.containsKey(n)||CE(r,n)}))}function CE(r,e){r.Pc.delete(e.path.canonicalString());const t=r.Rc.get(e);t!==null&&(wi(r.remoteStore,t),r.Rc=r.Rc.remove(e),r.Ic.delete(t),Zh(r))}function yB(r,e,t){for(const n of t)n instanceof lE?(r.Ac.addReference(n.key,e),bP(r,n)):n instanceof BE?(U(xr,"Document no longer in limbo: "+n.key),r.Ac.removeReference(n.key,e),r.Ac.containsKey(n.key)||CE(r,n.key)):Y(19791,{wc:n})}function bP(r,e){const t=e.key,n=t.path.canonicalString();r.Rc.get(t)||r.Pc.has(n)||(U(xr,"New document in limbo: "+t),r.Pc.add(n),Zh(r))}function Zh(r){for(;r.Pc.size>0&&r.Rc.size<r.maxConcurrentLimboResolutions;){const e=r.Pc.values().next().value;r.Pc.delete(e);const t=new K(ue.fromString(e)),n=r.fc.next();r.Ic.set(n,new _P(t)),r.Rc=r.Rc.insert(t,n),bc(r.remoteStore,new ln(gt(ki(t.path)),n,"TargetPurposeLimboResolution",Nt.yn))}}async function zn(r,e,t){const n=W(r),s=[],i=[],o=[];n.hc.isEmpty()||(n.hc.forEach(((a,u)=>{o.push(n.gc(u,e,t).then((l=>{var B;if((l||t)&&n.isPrimaryClient){const d=l?!l.fromCache:(B=t==null?void 0:t.targetChanges.get(u.targetId))==null?void 0:B.current;n.sharedClientState.updateQueryState(u.targetId,d?"current":"not-current")}if(l){s.push(l);const d=xh.fo(u.targetId,l);i.push(d)}})))})),await Promise.all(o),n.Ec.hn(s),await(async function(u,l){const B=W(u);try{await B.persistence.runTransaction("notifyLocalViewChanges","readwrite",(d=>P.forEach(l,(C=>P.forEach(C.Ao,(g=>B.persistence.referenceDelegate.addReference(d,C.targetId,g))).next((()=>P.forEach(C.Vo,(g=>B.persistence.referenceDelegate.removeReference(d,C.targetId,g)))))))))}catch(d){if(!Vr(d))throw d;U(Mh,"Failed to update sequence numbers: "+d)}for(const d of l){const C=d.targetId;if(!d.fromCache){const g=B.No.get(C),D=g.snapshotVersion,N=g.withLastLimboFreeSnapshotVersion(D);B.No=B.No.insert(C,N)}}})(n.localStore,i))}async function SP(r,e){const t=W(r);if(!t.currentUser.isEqual(e)){U(xr,"User change. New user:",e.toKey());const n=await z_(t.localStore,e);t.currentUser=e,(function(i,o){i.dc.forEach((a=>{a.forEach((u=>{u.reject(new M(S.CANCELLED,o))}))})),i.dc.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,n.removedBatchIds,n.addedBatchIds),await zn(t,n.qo)}}function NP(r,e){const t=W(r),n=t.Ic.get(e);if(n&&n.lc)return ae().add(n.key);{let s=ae();const i=t.Tc.get(e);if(!i)return s;for(const o of i??[]){const a=t.hc.get(o);s=s.unionWith(a.view.Yu)}return s}}async function OP(r,e){const t=W(r),n=await Qu(t.localStore,e.query,!0),s=e.view.uc(n);return t.isPrimaryClient&&yB(t,e.targetId,s.oc),s}async function FP(r,e){const t=W(r);return mB(t.localStore,e).then((n=>zn(t,n)))}async function LP(r,e,t,n){const s=W(r),i=await(function(a,u){const l=W(a),B=W(l.mutationQueue);return l.persistence.runTransaction("Lookup mutation documents","readonly",(d=>B.Wr(d,u).next((C=>C?l.localDocuments.getDocuments(d,C):P.resolve(null)))))})(s.localStore,e);i!==null?(t==="pending"?await Hi(s.remoteStore):t==="acknowledged"||t==="rejected"?(Xh(s,e,n||null),Yh(s,e),(function(a,u){W(W(a).mutationQueue).jr(u)})(s.localStore,e)):Y(6720,"Unknown batchState",{bc:t}),await zn(s,i)):U(xr,"Cannot apply mutation batch with id: "+e)}async function VP(r,e){const t=W(r);if(Nc(t),ed(t),e===!0&&t.mc!==!0){const n=t.sharedClientState.getAllActiveQueryTargets(),s=await Dp(t,n.toArray());t.mc=!0,await EB(t.remoteStore,!0);for(const i of s)bc(t.remoteStore,i)}else if(e===!1&&t.mc!==!1){const n=[];let s=Promise.resolve();t.Tc.forEach(((i,o)=>{t.sharedClientState.isLocalQueryTarget(o)?n.push(o):s=s.then((()=>(Ti(t,o),yi(t.localStore,o,!0)))),wi(t.remoteStore,o)})),await s,await Dp(t,n),(function(o){const a=W(o);a.Ic.forEach(((u,l)=>{wi(a.remoteStore,l)})),a.Ac.e_(),a.Ic=new Map,a.Rc=new Re(K.comparator)})(t),t.mc=!1,await EB(t.remoteStore,!1)}}async function Dp(r,e,t){const n=W(r),s=[],i=[];for(const o of e){let a;const u=n.Tc.get(o);if(u&&u.length!==0){a=await Di(n.localStore,Ue(u[0])?u[0]:gt(u[0]));for(const l of u){const B=n.hc.get(l),d=await OP(n,B);d.snapshot&&i.push(d.snapshot)}}else{const l=await $_(n.localStore,o);a=await Di(n.localStore,l),await $h(n,pE(l),o,!1,a.resumeToken)}s.push(a)}return n.Ec.hn(i),s}function pE(r){return wn(r)?r:hm(r.path,r.collectionGroup,r.orderBy,r.filters,r.limit,"F",r.startAt,r.endAt)}function kP(r){return(function(t){return W(W(t).persistence).Ro()})(W(r).localStore)}async function xP(r,e,t,n){const s=W(r);if(s.mc)return void U(xr,"Ignoring unexpected query state notification.");const i=s.Tc.get(e);if(i&&i.length>0)switch(t){case"current":case"not-current":{let o;if(Ue(i[0]))switch(Fn(i[0])){case"collection_group":case"collection":o=await mB(s.localStore,__(i[0]));break;case"documents":o=await(function(l,B){const d=W(l),C=ae(...Mu(B).map((g=>K.fromPath(g))));return d.persistence.runTransaction("Get documents for pipeline","readonly",(g=>d.Uo.getEntries(g,C))).then((g=>g))})(s.localStore,i[0]);break;default:nt(""),o=Yr()}else o=await mB(s.localStore,(function(l){return l.collectionGroup||(l.path.length%2==1?l.path.lastSegment():l.path.get(l.path.length-2))})(i[0]));const a=xi.createSynthesizedRemoteEventForCurrentChange(e,t==="current",Se.EMPTY_BYTE_STRING);await zn(s,o,a);break}case"rejected":await yi(s.localStore,e,!0),Ti(s,e,n);break;default:Y(64155,t)}}async function MP(r,e,t){const n=Nc(r);if(n.mc){for(const s of e){if(n.Tc.has(s)&&n.sharedClientState.isActiveQueryTarget(s)){U(xr,"Adding an already active target "+s);continue}const i=await $_(n.localStore,s),o=await Di(n.localStore,i);await $h(n,pE(i),o.targetId,!1,o.resumeToken),bc(n.remoteStore,o)}for(const s of t)n.Tc.has(s)&&await yi(n.localStore,s,!1).then((()=>{wi(n.remoteStore,s),Ti(n,s)})).catch(Lr)}}function Nc(r){const e=W(r);return e.remoteStore.remoteSyncer.applyRemoteEvent=fE.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=NP.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=AP.bind(null,e),e.Ec.hn=pP.bind(null,e.eventManager),e.Ec.yc=gP.bind(null,e.eventManager),e}function ed(r){const e=W(r);return e.remoteStore.remoteSyncer.applySuccessfulWrite=vP.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=RP.bind(null,e),e}function GP(r,e,t){const n=W(r);(async function(i,o,a){try{const u=await o.getMetadata();if(await(function(g,D){const N=W(g),V=Ke(D.createTime);return N.persistence.runTransaction("hasNewerBundle","readonly",(H=>N.d_.getBundleMetadata(H,D.id))).then((H=>!!H&&H.createTime.compareTo(V)>=0))})(i.localStore,u))return await o.close(),a._completeWith((function(g){return{taskState:"Success",documentsLoaded:g.totalDocuments,bytesLoaded:g.totalBytes,totalDocuments:g.totalDocuments,totalBytes:g.totalBytes}})(u)),Promise.resolve(new Set);a._updateProgress(cE(u));const l=new Wh(u,o.serializer);let B=await o.ma();for(;B;){const C=await l.qu(B);C&&a._updateProgress(C),B=await o.ma()}const d=await l.Ku(i.localStore);return await zn(i,d.Qu,void 0),await(function(g,D){const N=W(g);return N.persistence.runTransaction("Save bundle","readwrite",(V=>N.d_.saveBundleMetadata(V,D)))})(i.localStore,u),a._completeWith(d.progress),Promise.resolve(d.Wu)}catch(u){return nt(xr,`Loading bundle failed with ${u}`),a._failWith(u),Promise.resolve(new Set)}})(n,e,t).then((s=>{n.sharedClientState.notifyBundleLoaded(s)}))}class Ai{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=As(e.databaseInfo.databaseId),this.sharedClientState=this.vc(e),this.persistence=this.Sc(e),await this.persistence.start(),this.localStore=this.Dc(e),this.gcScheduler=this.xc(e,this.localStore),this.indexBackfillerScheduler=this.Cc(e,this.localStore)}xc(e,t){return null}Cc(e,t){return null}Dc(e){return K_(this.persistence,new J_,e.initialUser,this.serializer)}Sc(e){return new Lh(Pc.w_,this.serializer)}vc(e){return new aE}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Ai.provider={build:()=>new Ai};class td extends Ai{constructor(e){super(),this.cacheSizeBytes=e}xc(e,t){q(this.persistence.referenceDelegate instanceof zu,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new Qm(n,e.asyncQueue,t)}Sc(e){const t=this.cacheSizeBytes!==void 0?Ct.withCacheSize(this.cacheSizeBytes):Ct.DEFAULT;return new Lh((n=>zu.w_(n,t)),this.serializer)}}class nd extends Ai{constructor(e,t,n){super(),this.Fc=e,this.cacheSizeBytes=t,this.forceOwnership=n,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.Fc.initialize(this,e),await ed(this.Fc.syncEngine),await Hi(this.Fc.remoteStore),await this.persistence.X_((()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve())))}Dc(e){return K_(this.persistence,new J_,e.initialUser,this.serializer)}xc(e,t){const n=this.persistence.referenceDelegate.garbageCollector;return new Qm(n,e.asyncQueue,t)}Cc(e,t){const n=new dP(t,this.persistence);return new hP(e.asyncQueue,n)}Sc(e){const t=kh(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),n=this.cacheSizeBytes!==void 0?Ct.withCacheSize(this.cacheSizeBytes):Ct.DEFAULT;return new Vh(this.synchronizeTabs,t,e.clientId,n,e.asyncQueue,uE(),Tu(),this.serializer,this.sharedClientState,!!this.forceOwnership)}vc(e){return new aE}}class gE extends nd{constructor(e,t){super(e,t,!1),this.Fc=e,this.cacheSizeBytes=t,this.synchronizeTabs=!0}async initialize(e){await super.initialize(e);const t=this.Fc.syncEngine;this.sharedClientState instanceof Nl&&(this.sharedClientState.syncEngine={Iu:LP.bind(null,t),Au:xP.bind(null,t),Vu:MP.bind(null,t),Ro:kP.bind(null,t),Ru:FP.bind(null,t)},await this.sharedClientState.start()),await this.persistence.X_((async n=>{await VP(this.Fc.syncEngine,n),this.gcScheduler&&(n&&!this.gcScheduler.started?this.gcScheduler.start():n||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(n&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():n||this.indexBackfillerScheduler.stop())}))}vc(e){const t=uE();if(!Nl.Je(t))throw new M(S.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const n=kh(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey);return new Nl(t,e.asyncQueue,n,e.clientId,e.initialUser)}}class Nr{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>Ip(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=SP.bind(null,this.syncEngine),await EB(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new CP})()}createDatastore(e){const t=As(e.databaseInfo.databaseId),n=QT(e.databaseInfo);return ZT(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return(function(n,s,i,o,a){return new ZR(n,s,i,o,a)})(this.localStore,this.datastore,e.asyncQueue,(t=>Ip(this.syncEngine,t,0)),(function(){return VC.Je()?new VC:new jT})())}createSyncEngine(e,t){return(function(s,i,o,a,u,l,B){const d=new EP(s,i,o,a,u,l);return B&&(d.mc=!0),d})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(s){const i=W(s);U(_n,"RemoteStore shutting down."),i.ca.add(5),await Ui(i),i.Ea.shutdown(),i.ha.set("Unknown")})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}Nr.provider={build:()=>new Nr};/**
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
 */let UP=class{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new M(S.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await(async function(s,i){const o=W(s),a={documents:i.map((d=>gi(o.serializer,d)))},u=await o.st("BatchGetDocuments",o.serializer.databaseId,ue.emptyPath(),a,i.length),l=new Map;u.forEach((d=>{const C=bT(o.serializer,d);l.set(C.key.toString(),C)}));const B=[];return i.forEach((d=>{const C=l.get(d.toString());q(!!C,55234,{key:d}),B.push(C)})),B})(this.datastore,e);return t.forEach((n=>this.recordVersion(n))),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(n){this.lastTransactionError=n}this.writtenDocs.add(e.toString())}delete(e){this.write(new Vi(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach((t=>{e.delete(t.key.toString())})),e.forEach(((t,n)=>{const s=K.fromPath(n);this.mutations.push(new JB(s,this.precondition(s)))})),await(async function(n,s){const i=W(n),o={writes:s.map((a=>ea(i.serializer,a)))};await i.tt("Commit",i.serializer.databaseId,ue.emptyPath(),o)})(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw Y(50498,{Oc:e.constructor.name});t=ee.min()}const n=this.readVersions.get(e.key.toString());if(n){if(!t.isEqual(n))throw new M(S.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(ee.min())?Me.exists(!1):Me.updateTime(t):Me.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(ee.min()))throw new M(S.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return Me.updateTime(t)}return Me.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}};/**
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
 */class HP{constructor(e,t,n,s,i){this.asyncQueue=e,this.datastore=t,this.options=n,this.updateFunction=s,this.deferred=i,this.Mc=n.maxAttempts,this.jt=new th(this.asyncQueue,"transaction_retry")}Nc(){this.Mc-=1,this.Lc()}Lc(){this.jt.Ut((async()=>{const e=new UP(this.datastore),t=this.Bc(e);t&&t.then((n=>{this.asyncQueue.enqueueAndForget((()=>e.commit().then((()=>{this.deferred.resolve(n)})).catch((s=>{this.Uc(s)}))))})).catch((n=>{this.Uc(n)}))}))}Bc(e){try{const t=this.updateFunction(e);return!Ea(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}Uc(e){this.Mc>0&&this.kc(e)?(this.Mc-=1,this.asyncQueue.enqueueAndForget((()=>(this.Lc(),Promise.resolve())))):this.deferred.reject(e)}kc(e){if((e==null?void 0:e.name)==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!pm(t)}return!1}}/**
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
 */const Or="FirestoreClient";class qP{constructor(e,t,n,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this._databaseInfo=s,this.user=at.UNAUTHENTICATED,this.clientId=ic.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(n,(async o=>{U(Or,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o})),this.appCheckCredentials.start(n,(o=>(U(Or,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new ct;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=ji(t,"Failed to shutdown persistence");e.reject(n)}})),e.promise}}async function Ol(r,e){r.asyncQueue.verifyOperationInProgress(),U(Or,"Initializing OfflineComponentProvider");const t=r.configuration;await e.initialize(t);let n=t.initialUser;r.setCredentialChangeListener((async s=>{n.isEqual(s)||(await z_(e.localStore,s),n=s)})),e.persistence.setDatabaseDeletedListener((()=>r.terminate())),r._offlineComponents=e}async function yp(r,e){r.asyncQueue.verifyOperationInProgress();const t=await rd(r);U(Or,"Initializing OnlineComponentProvider"),await e.initialize(t,r.configuration),r.setCredentialChangeListener((n=>Cp(e.remoteStore,n))),r.setAppCheckTokenChangeListener(((n,s)=>Cp(e.remoteStore,s))),r._onlineComponents=e}async function rd(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){U(Or,"Using user provided OfflineComponentProvider");try{await Ol(r,r._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===S.FAILED_PRECONDITION||s.code===S.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;nt("Error using user provided cache. Falling back to memory cache: "+t),await Ol(r,new Ai)}}else U(Or,"Using default OfflineComponentProvider"),await Ol(r,new td(void 0));return r._offlineComponents}async function Oc(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(U(Or,"Using user provided OnlineComponentProvider"),await yp(r,r._uninitializedComponentsProvider._online)):(U(Or,"Using default OnlineComponentProvider"),await yp(r,new Nr))),r._onlineComponents}function mE(r){return rd(r).then((e=>e.persistence))}function Ji(r){return rd(r).then((e=>e.localStore))}function _E(r){return Oc(r).then((e=>e.remoteStore))}function sd(r){return Oc(r).then((e=>e.syncEngine))}function EE(r){return Oc(r).then((e=>e.datastore))}async function vi(r){const e=await Oc(r),t=e.eventManager;return t.onListen=IP.bind(null,e.syncEngine),t.onUnlisten=yP.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=DP.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=wP.bind(null,e.syncEngine),t}function jP(r){return r.asyncQueue.enqueue((async()=>{const e=await mE(r),t=await _E(r);return e.setNetworkEnabled(!0),(function(s){const i=W(s);return i.ca.delete(0),ba(i)})(t)}))}function JP(r){return r.asyncQueue.enqueue((async()=>{const e=await mE(r),t=await _E(r);return e.setNetworkEnabled(!1),(async function(s){const i=W(s);i.ca.add(0),await Ui(i),i.ha.set("Offline")})(t)}))}function KP(r,e,t,n){const s=new Sc(n),i=new Qh(e,s,t);return r.asyncQueue.enqueueAndForget((async()=>Jh(await vi(r),i))),()=>{s.Aa(),r.asyncQueue.enqueueAndForget((async()=>Kh(await vi(r),i)))}}function zP(r,e){const t=new ct;return r.asyncQueue.enqueueAndForget((async()=>(async function(s,i,o){try{const a=await(function(l,B){const d=W(l);return d.persistence.runTransaction("read document","readonly",(C=>d.localDocuments.getDocument(C,B)))})(s,i);a.isFoundDocument()?o.resolve(a):a.isNoDocument()?o.resolve(null):o.reject(new M(S.UNAVAILABLE,"Failed to get document from cache. (However, this document may exist on the server. Run again without setting 'source' in the GetOptions to attempt to retrieve the document from the server.)"))}catch(a){const u=ji(a,`Failed to get document '${i} from cache`);o.reject(u)}})(await Ji(r),e,t))),t.promise}function IE(r,e,t={}){const n=new ct;return r.asyncQueue.enqueueAndForget((async()=>(function(i,o,a,u,l){const B=new Sc({next:C=>{B.Aa(),o.enqueueAndForget((()=>Kh(i,d)));const g=C.docs.has(a);!g&&C.fromCache?l.reject(new M(S.UNAVAILABLE,"Failed to get document because the client is offline.")):g&&C.fromCache&&u&&u.source==="server"?l.reject(new M(S.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):l.resolve(C)},error:C=>l.reject(C)}),d=new Qh(ki(a.path),B,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return Jh(i,d)})(await vi(r),r.asyncQueue,e,t,n))),n.promise}function QP(r,e){const t=new ct;return r.asyncQueue.enqueueAndForget((async()=>(async function(s,i,o){try{const a=await Qu(s,i,!0),u=new hE(i,a.Wo),l=u.Zu(a.documents),B=u.applyChanges(l,!1);o.resolve(B.snapshot)}catch(a){const u=ji(a,`Failed to execute query '${i} against cache`);o.reject(u)}})(await Ji(r),e,t))),t.promise}function DE(r,e,t={}){const n=new ct;return r.asyncQueue.enqueueAndForget((async()=>(function(i,o,a,u,l){const B=new Sc({next:C=>{B.Aa(),o.enqueueAndForget((()=>Kh(i,d))),C.fromCache&&u.source==="server"?l.reject(new M(S.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):l.resolve(C)},error:C=>l.reject(C)}),d=new Qh(a instanceof ko?jv(a):a,B,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return Jh(i,d)})(await vi(r),r.asyncQueue,e,t,n))),n.promise}function WP(r,e,t){const n=new ct;return r.asyncQueue.enqueueAndForget((async()=>{try{const s=await EE(r);n.resolve((async function(o,a,u){var N;const l=W(o),{request:B,ve:d,parent:C}=bm(l.serializer,dm(a),u);l.connection.Ye||delete B.parent;const g=(await l.st("RunAggregationQuery",l.serializer.databaseId,C,B,1)).filter((V=>!!V.result));q(g.length===1,64727);const D=(N=g[0].result)==null?void 0:N.aggregateFields;return Object.keys(D).reduce(((V,H)=>(V[d[H]]=D[H],V)),{})})(s,e,t))}catch(s){n.reject(s)}})),n.promise}function $P(r,e){const t=new ct;return r.asyncQueue.enqueueAndForget((async()=>TP(await sd(r),e,t))),t.promise}function YP(r,e){const t=new Sc(e);return r.asyncQueue.enqueueAndForget((async()=>(function(s,i){W(s).Su.add(i),i.next()})(await vi(r),t))),()=>{t.Aa(),r.asyncQueue.enqueueAndForget((async()=>(function(s,i){W(s).Su.delete(i)})(await vi(r),t)))}}function XP(r,e,t){const n=new ct;return r.asyncQueue.enqueueAndForget((async()=>{const s=await EE(r);new HP(r.asyncQueue,s,t,e,n).Nc()})),n.promise}function ZP(r,e,t,n){const s=(function(o,a){let u;return u=typeof o=="string"?Im().encode(o):o,(function(B,d){return new lP(B,d)})((function(B,d){if(B instanceof Uint8Array)return fp(B,d);if(B instanceof ArrayBuffer)return fp(new Uint8Array(B),d);if(B instanceof ReadableStream)return B.getReader();throw new Error("Source of `toByteStreamReader` has to be a ArrayBuffer or ReadableStream")})(u),a)})(t,As(e));r.asyncQueue.enqueueAndForget((async()=>{GP(await sd(r),s,n)}))}function eb(r,e){return r.asyncQueue.enqueue((async()=>(function(n,s){const i=W(n);return i.persistence.runTransaction("Get named query","readonly",(o=>i.d_.getNamedQuery(o,s)))})(await Ji(r),e)))}function yE(r,e){return(function(n,s){return new BP(n,s)})(r,e)}function tb(r,e){return r.asyncQueue.enqueue((async()=>(async function(n,s){const i=W(n),o=i.indexManager,a=[];return i.persistence.runTransaction("Configure indexes","readwrite",(u=>o.getFieldIndexes(u).next((l=>(function(d,C,g,D,N){d=[...d],C=[...C],d.sort(g),C.sort(g);const V=d.length,H=C.length;let Z=0,re=0;for(;Z<H&&re<V;){const de=g(d[re],C[Z]);de<0?N(d[re++]):de>0?D(C[Z++]):(Z++,re++)}for(;Z<H;)D(C[Z++]);for(;re<V;)N(d[re++])})(l,s,lT,(B=>{a.push(o.addFieldIndex(u,B))}),(B=>{a.push(o.deleteFieldIndex(u,B))})))).next((()=>P.waitFor(a)))))})(await Ji(r),e)))}function nb(r,e){return r.asyncQueue.enqueue((async()=>(function(n,s){W(n).Mo.po=s})(await Ji(r),e)))}function rb(r){return r.asyncQueue.enqueue((async()=>(function(t){const n=W(t),s=n.indexManager;return n.persistence.runTransaction("Delete All Indexes","readwrite",(i=>s.deleteAllFieldIndexes(i)))})(await Ji(r))))}/**
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
 */const wp="AsyncQueue";class Tp{constructor(e=Promise.resolve()){this.Wc=[],this.Qc=!1,this.Gc=[],this.zc=null,this.jc=!1,this.Hc=!1,this.Jc=[],this.jt=new th(this,"async_queue_retry"),this.Yc=()=>{const n=Tu();n&&U(wp,"Visibility state changed to "+n.visibilityState),this.jt.qt()},this.Zc=e;const t=Tu();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Yc)}get isShuttingDown(){return this.Qc}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Xc(),this.el(e)}enterRestrictedMode(e){if(!this.Qc){this.Qc=!0,this.Hc=e||!1;const t=Tu();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Yc)}}enqueue(e){if(this.Xc(),this.Qc)return new Promise((()=>{}));const t=new ct;return this.el((()=>this.Qc&&this.Hc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.Wc.push(e),this.tl())))}async tl(){if(this.Wc.length!==0){try{await this.Wc[0](),this.Wc.shift(),this.jt.reset()}catch(e){if(!Vr(e))throw e;U(wp,"Operation failed with retryable error: "+e)}this.Wc.length>0&&this.jt.Ut((()=>this.tl()))}}el(e){const t=this.Zc.then((()=>(this.jc=!0,e().catch((n=>{throw this.zc=n,this.jc=!1,je("INTERNAL UNHANDLED ERROR: ",Ap(n)),n})).then((n=>(this.jc=!1,n))))));return this.Zc=t,t}enqueueAfterDelay(e,t,n){this.Xc(),this.Jc.indexOf(e)>-1&&(t=0);const s=qh.createAndSchedule(this,e,t,n,(i=>this.nl(i)));return this.Gc.push(s),s}Xc(){this.zc&&Y(47125,{rl:Ap(this.zc)})}verifyOperationInProgress(){}async il(){let e;do e=this.Zc,await e;while(e!==this.Zc)}sl(e){for(const t of this.Gc)if(t.timerId===e)return!0;return!1}_l(e){return this.il().then((()=>{this.Gc.sort(((t,n)=>t.targetTimeMs-n.targetTimeMs));for(const t of this.Gc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.il()}))}ol(e){this.Jc.push(e)}nl(e){const t=this.Gc.indexOf(e);this.Gc.splice(t,1)}}function Ap(r){let e=r.message||"";return r.stack&&(e=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),e}/**
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
 */class wE{constructor(){this._progressObserver={},this._taskCompletionResolver=new ct,this._lastProgress={taskState:"Running",totalBytes:0,totalDocuments:0,bytesLoaded:0,documentsLoaded:0}}onProgress(e,t,n){this._progressObserver={next:e,error:t,complete:n}}catch(e){return this._taskCompletionResolver.promise.catch(e)}then(e,t){return this._taskCompletionResolver.promise.then(e,t)}_completeWith(e){this._updateProgress(e),this._progressObserver.complete&&this._progressObserver.complete(),this._taskCompletionResolver.resolve(e)}_failWith(e){this._lastProgress.taskState="Error",this._progressObserver.next&&this._progressObserver.next(this._lastProgress),this._progressObserver.error&&this._progressObserver.error(e),this._taskCompletionResolver.reject(e)}_updateProgress(e){this._lastProgress=e,this._progressObserver.next&&this._progressObserver.next(e)}}/**
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
 */const sb=-1;class we extends Da{constructor(e,t,n,s){super(e,t,n,s),this.type="firestore",this._queue=new Tp,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Tp(e),this._firestoreClient=void 0,await e}}}function ib(r,e,t){t||(t=Yo);const n=Ni(r,"firestore");if(n.isInitialized(t)){const s=n.getImmediate({identifier:t}),i=n.getOptions(t);if(Zt(i,e))return s;throw new M(S.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new M(S.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<zm)throw new M(S.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&Si(e.host)&&bB(e.host),n.initialize({options:e,instanceIdentifier:t})}function ob(r,e){const t=typeof r=="object"?r:LB(),n=typeof r=="string"?r:e||Yo,s=Ni(t,"firestore").getImmediate({identifier:n});if(!s._initialized){const i=FD("firestore");i&&Ym(s,...i)}return s}function Ge(r){if(r._terminated)throw new M(S.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||TE(r),r._firestoreClient}function TE(r){var n,s,i,o;const e=r._freezeSettings(),t=tA(r._databaseId,((n=r._app)==null?void 0:n.options.appId)||"",r._persistenceKey,(s=r._app)==null?void 0:s.options.apiKey,e);r._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((o=e.localCache)!=null&&o._onlineComponentProvider)&&(r._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),r._firestoreClient=new qP(r._authCredentials,r._appCheckCredentials,r._queue,t,r._componentsProvider&&(function(u){const l=u==null?void 0:u._online.build();return{_offline:u==null?void 0:u._offline.build(l),_online:l}})(r._componentsProvider))}function ab(r,e){nt("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const t=r._freezeSettings();return AE(r,Nr.provider,{build:n=>new nd(n,t.cacheSizeBytes,e==null?void 0:e.forceOwnership)}),Promise.resolve()}async function ub(r){nt("enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const e=r._freezeSettings();AE(r,Nr.provider,{build:t=>new gE(t,e.cacheSizeBytes)})}function AE(r,e,t){if((r=Be(r,we))._firestoreClient||r._terminated)throw new M(S.FAILED_PRECONDITION,"Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.");if(r._componentsProvider||r._getSettings().localCache)throw new M(S.FAILED_PRECONDITION,"SDK cache is already specified.");r._componentsProvider={_online:e,_offline:t},TE(r)}function cb(r){if(r._initialized&&!r._terminated)throw new M(S.FAILED_PRECONDITION,"Persistence can only be cleared before a Firestore instance is initialized or after it is terminated.");const e=new ct;return r._queue.enqueueAndForgetEvenWhileRestricted((async()=>{try{await(async function(n){if(!pn.Je())return Promise.resolve();const s=n+j_;await pn.delete(s)})(kh(r._databaseId,r._persistenceKey)),e.resolve()}catch(t){e.reject(t)}})),e.promise}function lb(r){return(function(t){const n=new ct;return t.asyncQueue.enqueueAndForget((async()=>PP(await sd(t),n))),n.promise})(Ge(r=Be(r,we)))}function Bb(r){return jP(Ge(r=Be(r,we)))}function hb(r){return JP(Ge(r=Be(r,we)))}function db(r){return pg(r.app,"firestore",r._databaseId.database),r._delete()}function wB(r,e){const t=Ge(r=Be(r,we)),n=new wE;return ZP(t,r._databaseId,e,n),n}function vE(r,e){return eb(Ge(r=Be(r,we)),e).then((t=>t?new rt(r,null,t.query):null))}/**
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
 */class id{convertValue(e,t="none"){switch(Xe(e)){case 0:return null;case 1:return e.booleanValue;case 2:return be(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Mn(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw Y(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return Fr(e,((s,i)=>{n[s]=this.convertValue(i,t)})),n}convertVectorValue(e){var n,s,i;const t=(i=(s=(n=e.fields)==null?void 0:n[fs].arrayValue)==null?void 0:s.values)==null?void 0:i.map((o=>be(o.doubleValue)));return new wt(t)}convertGeoPoint(e){return new Yt(be(e.latitude),be(e.longitude))}convertArray(e,t){return(e.values||[]).map((n=>this.convertValue(n,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const n=_a(e);return n==null?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(oi(e));default:return null}}convertTimestamp(e){const t=xn(e);return new Ee(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=ue.fromString(e);q(Lm(n),9688,{name:e});const s=new wr(n.get(1),n.get(3)),i=new K(n.popFirst(5));return s.isEqual(t)||je(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
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
 */class Mr extends id{constructor(e){super(),this.firestore=e}convertBytes(e){return new Pt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Ie(this.firestore,null,t)}}/**
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
 */function fb(r){var n;const e=Ge(Be(r.firestore,we)),t=(n=e._onlineComponents)==null?void 0:n.datastore.serializer;return t===void 0?null:dc(t,gt(r._query)).be}function Cb(r,e){var i;const t=MB(e,((o,a)=>new nm(a,o.aggregateType,o._internalFieldPath))),n=Ge(Be(r.firestore,we)),s=(i=n._onlineComponents)==null?void 0:i.datastore.serializer;return s===void 0?null:bm(s,dm(r._query),t,!0).request}/**
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
 */function Zs(r){return(function(t,n){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of n)if(i in s&&typeof s[i]=="function")return!0;return!1})(r,["next","error","complete"])}const vp="@firebase/firestore",Rp="4.17.0";/**
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
 */class Ri{constructor(e="count",t){this._internalFieldPath=t,this.type="AggregateField",this.aggregateType=e}}class RE{constructor(e,t,n){this._userDataWriter=t,this._data=n,this.type="AggregateQuerySnapshot",this.query=e}data(){return this._userDataWriter.convertObjectMap(this._data)}_fieldsProto(){return new et({mapValue:{fields:this._data}}).clone().value.mapValue.fields}}/**
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
 */let la=class{constructor(e,t,n,s,i){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Ie(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new pb(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(en("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}},pb=class extends la{data(){return super.data()}};/**
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
 */function PE(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new M(S.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class od{}class Ki extends od{}function gb(r,e,...t){let n=[];e instanceof od&&n.push(e),n=n.concat(t),(function(i){const o=i.filter((u=>u instanceof Ns)).length,a=i.filter((u=>u instanceof zi)).length;if(o>1||o>0&&a>0)throw new M(S.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(n);for(const s of n)r=s._apply(r);return r}class zi extends Ki{constructor(e,t,n){super(),this._field=e,this._op=t,this._value=n,this.type="where"}static _create(e,t,n){return new zi(e,t,n)}_apply(e){const t=this._parse(e);return SE(e._query,t),new rt(e.firestore,e.converter,rB(e._query,t))}_parse(e){const t=Rs(e.firestore);return(function(i,o,a,u,l,B,d){let C;if(l.isKeyField()){if(B==="array-contains"||B==="array-contains-any")throw new M(S.INVALID_ARGUMENT,`Invalid Query. You can't perform '${B}' queries on documentId().`);if(B==="in"||B==="not-in"){bp(d,B);const D=[];for(const N of d)D.push(Pp(u,i,N));C={arrayValue:{values:D}}}else C=Pp(u,i,d)}else B!=="in"&&B!=="not-in"&&B!=="array-contains-any"||bp(d,B),C=n_(a,o,d,B==="in"||B==="not-in");return fe.create(l,B,C)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function mb(r,e,t){const n=e,s=en("where",r);return zi._create(s,n,t)}class Ns extends od{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Ns(e,t)}_parse(e){const t=this._queryConstraints.map((n=>n._parse(e))).filter((n=>n.getFilters().length>0));return t.length===1?t[0]:ye.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(s,i){let o=s;const a=i.getFlattenedFilters();for(const u of a)SE(o,u),o=rB(o,u)})(e._query,t),new rt(e.firestore,e.converter,rB(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function _b(...r){return r.forEach((e=>NE("or",e))),Ns._create("or",r)}function Eb(...r){return r.forEach((e=>NE("and",e))),Ns._create("and",r)}class Fc extends Ki{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Fc(e,t)}_apply(e){const t=(function(s,i,o){if(s.startAt!==null)throw new M(S.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new M(S.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Zo(i,o)})(e._query,this._field,this._direction);return new rt(e.firestore,e.converter,fT(e._query,t))}}function Ib(r,e="asc"){const t=e,n=en("orderBy",r);return Fc._create(n,t)}class Sa extends Ki{constructor(e,t,n){super(),this.type=e,this._limit=t,this._limitType=n}static _create(e,t,n){return new Sa(e,t,n)}_apply(e){return new rt(e.firestore,e.converter,Vu(e._query,this._limit,this._limitType))}}function Db(r){return Mg("limit",r),Sa._create("limit",r,"F")}function yb(r){return Mg("limitToLast",r),Sa._create("limitToLast",r,"L")}class Na extends Ki{constructor(e,t,n){super(),this.type=e,this._docOrFields=t,this._inclusive=n}static _create(e,t,n){return new Na(e,t,n)}_apply(e){const t=bE(e,this.type,this._docOrFields,this._inclusive);return new rt(e.firestore,e.converter,CT(e._query,t))}}function wb(...r){return Na._create("startAt",r,!0)}function Tb(...r){return Na._create("startAfter",r,!1)}class Oa extends Ki{constructor(e,t,n){super(),this.type=e,this._docOrFields=t,this._inclusive=n}static _create(e,t,n){return new Oa(e,t,n)}_apply(e){const t=bE(e,this.type,this._docOrFields,this._inclusive);return new rt(e.firestore,e.converter,pT(e._query,t))}}function Ab(...r){return Oa._create("endBefore",r,!1)}function vb(...r){return Oa._create("endAt",r,!0)}function bE(r,e,t,n){if(t[0]=ne(t[0]),t[0]instanceof la)return(function(i,o,a,u,l){if(!u)throw new M(S.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${a}().`);const B=[];for(const d of Ys(i))if(d.field.isKeyField())B.push(Cs(o,u.key));else{const C=u.data.field(d.field);if(ma(C))throw new M(S.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+d.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(C===null){const g=d.field.canonicalString();throw new M(S.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${g}' (used as the orderBy) does not exist.`)}B.push(C)}return new vr(B,l)})(r._query,r.firestore._databaseId,e,t[0]._document,n);{const s=Rs(r.firestore);return(function(o,a,u,l,B,d){const C=o.explicitOrderBy;if(B.length>C.length)throw new M(S.INVALID_ARGUMENT,`Too many arguments provided to ${l}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const g=[];for(let D=0;D<B.length;D++){const N=B[D];if(C[D].field.isKeyField()){if(typeof N!="string")throw new M(S.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${l}(), but got a ${typeof N}`);if(!$B(o)&&N.indexOf("/")!==-1)throw new M(S.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${l}() must be a plain document ID, but '${N}' contains a slash.`);const V=o.path.child(ue.fromString(N));if(!K.isDocumentKey(V))throw new M(S.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${l}() must result in a valid document path, but '${V}' is not because it contains an odd number of segments.`);const H=new K(V);g.push(Cs(a,H))}else{const V=n_(u,l,N);g.push(V)}}return new vr(g,d)})(r._query,r.firestore._databaseId,s,e,t,n)}}function Pp(r,e,t){if(typeof(t=ne(t))=="string"){if(t==="")throw new M(S.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!$B(e)&&t.indexOf("/")!==-1)throw new M(S.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const n=e.path.child(ue.fromString(t));if(!K.isDocumentKey(n))throw new M(S.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return Cs(r,new K(n))}if(t instanceof Ie)return Cs(r,t._key);throw new M(S.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${oc(t)}.`)}function bp(r,e){if(!Array.isArray(r)||r.length===0)throw new M(S.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function SE(r,e){const t=(function(s,i){for(const o of s)for(const a of o.getFlattenedFilters())if(i.indexOf(a.op)>=0)return a.op;return null})(r.filters,(function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new M(S.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new M(S.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function NE(r,e){if(!(e instanceof zi||e instanceof Ns))throw new M(S.INVALID_ARGUMENT,`Function ${r}() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'.`)}function Lc(r,e,t){let n;return n=r?t&&(t.merge||t.mergeFields)?r.toFirestore(e,t):r.toFirestore(e):e,n}class ad extends id{constructor(e){super(),this.firestore=e}convertBytes(e){return new Pt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Ie(this.firestore,null,t)}}/**
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
 */function Rb(r){return new Ri("sum",en("sum",r))}function Pb(r){return new Ri("avg",en("average",r))}function OE(){return new Ri("count")}function bb(r,e){var t,n;return r instanceof Ri&&e instanceof Ri&&r.aggregateType===e.aggregateType&&((t=r._internalFieldPath)==null?void 0:t.canonicalString())===((n=e._internalFieldPath)==null?void 0:n.canonicalString())}function Sb(r,e){return rh(r.query,e.query)&&Zt(r.data(),e.data())}/**
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
 */function Nb(r){return FE(r,{count:OE()})}function FE(r,e){const t=Be(r.firestore,we),n=Ge(t),s=MB(e,((i,o)=>new nm(o,i.aggregateType,i._internalFieldPath)));return WP(n,r._query,s).then((i=>(function(a,u,l){const B=new Mr(a);return new RE(u,B,l)})(t,r,i)))}class Ob{constructor(e){this.kind="memory",this._onlineComponentProvider=Nr.provider,this._offlineComponentProvider=e!=null&&e.garbageCollector?e.garbageCollector._offlineComponentProvider:{build:()=>new td(void 0)}}toJSON(){return{kind:this.kind}}}class Fb{constructor(e){let t;this.kind="persistent",e!=null&&e.tabManager?(e.tabManager._initialize(e),t=e.tabManager):(t=LE(void 0),t._initialize(e)),this._onlineComponentProvider=t._onlineComponentProvider,this._offlineComponentProvider=t._offlineComponentProvider}toJSON(){return{kind:this.kind}}}class Lb{constructor(){this.kind="memoryEager",this._offlineComponentProvider=Ai.provider}toJSON(){return{kind:this.kind}}}class Vb{constructor(e){this.kind="memoryLru",this._offlineComponentProvider={build:()=>new td(e)}}toJSON(){return{kind:this.kind}}}function kb(){return new Lb}function xb(r){return new Vb(r==null?void 0:r.cacheSizeBytes)}function Mb(r){return new Ob(r)}function Gb(r){return new Fb(r)}class Ub{constructor(e){this.forceOwnership=e,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Nr.provider,this._offlineComponentProvider={build:t=>new nd(t,e==null?void 0:e.cacheSizeBytes,this.forceOwnership)}}}class Hb{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Nr.provider,this._offlineComponentProvider={build:t=>new gE(t,e==null?void 0:e.cacheSizeBytes)}}}function LE(r){return new Ub(r==null?void 0:r.forceOwnership)}function qb(){return new Hb}/**
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
 */const VE="NOT SUPPORTED";class Sn{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Ot extends la{constructor(e,t,n,s,i,o){super(e,t,n,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new qo(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(en("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new M(S.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=Ot._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}function jb(r,e,t){if(ws(e,Ot._jsonSchema)){if(e.bundle===VE)throw new M(S.INVALID_ARGUMENT,"The provided JSON object was created in a client environment, which is not supported.");const n=As(r._databaseId),s=yE(e.bundle,n),i=s.va(),o=new Wh(s.getMetadata(),n);for(const B of i)o.qu(B);const a=o.documents;if(a.length!==1)throw new M(S.INVALID_ARGUMENT,`Expected bundle data to contain 1 document, but it contains ${a.length} documents.`);const u=hc(n,a[0].document),l=new K(ue.fromString(e.bundleName));return new Ot(r,new ad(r),l,u,new Sn(!1,!1),t||null)}}Ot._jsonSchemaVersion="firestore/documentSnapshot/1.0",Ot._jsonSchema={type:Ye("string",Ot._jsonSchemaVersion),bundleSource:Ye("string","DocumentSnapshot"),bundleName:Ye("string"),bundle:Ye("string")};class qo extends Ot{data(e={}){return super.data(e)}}class Ft{constructor(e,t,n,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Sn(s.hasPendingWrites,s.fromCache),this.query=n}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((n=>{e.call(t,new qo(this._firestore,this._userDataWriter,n.key,n,new Sn(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new M(S.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map((a=>{Ue(s._snapshot.query)?Ku(s._snapshot.query):Bc(s.query._query);const u=new qo(s._firestore,s._userDataWriter,a.doc.key,a.doc,new Sn(s._snapshot.mutatedKeys.has(a.doc.key),s._snapshot.fromCache),s.query.converter);return a.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}}))}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((a=>i||a.type!==3)).map((a=>{const u=new qo(s._firestore,s._userDataWriter,a.doc.key,a.doc,new Sn(s._snapshot.mutatedKeys.has(a.doc.key),s._snapshot.fromCache),s.query.converter);let l=-1,B=-1;return a.type!==0&&(l=o.indexOf(a.doc.key),o=o.delete(a.doc.key)),a.type!==1&&(o=o.add(a.doc),B=o.indexOf(a.doc.key)),{type:Kb(a.type),doc:u,oldIndex:l,newIndex:B}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new M(S.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Ft._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=ic.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],n=[],s=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),n.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function Jb(r,e,t){if(ws(e,Ft._jsonSchema)){if(e.bundle===VE)throw new M(S.INVALID_ARGUMENT,"The provided JSON object was created in a client environment, which is not supported.");const n=As(r._databaseId),s=yE(e.bundle,n),i=s.va(),o=new Wh(s.getMetadata(),n);for(const g of i)o.qu(g);if(o.queries.length!==1)throw new M(S.INVALID_ARGUMENT,`Snapshot data expected 1 query but found ${o.queries.length} queries.`);const a=Tc(o.queries[0].bundledQuery),u=Ue(a)?Ku(a):Bc(a),l=o.documents;let B=new _r(u);l.map((g=>{const D=hc(n,g.document);B=B.add(D)}));const d=Ds.fromInitialDocuments(a,B,ae(),!1,!1),C=new rt(r,t||null,a);return new Ft(r,new ad(r),C,d)}}function Kb(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Y(61501,{type:r})}}function zb(r,e){return r instanceof Ot&&e instanceof Ot?r._firestore===e._firestore&&r._key.isEqual(e._key)&&(r._document===null?e._document===null:r._document.isEqual(e._document))&&r._converter===e._converter:r instanceof Ft&&e instanceof Ft&&r._firestore===e._firestore&&rh(r.query,e.query)&&r.metadata.isEqual(e.metadata)&&r._snapshot.isEqual(e._snapshot)}/**
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
 */Ft._jsonSchemaVersion="firestore/querySnapshot/1.0",Ft._jsonSchema={type:Ye("string",Ft._jsonSchemaVersion),bundleSource:Ye("string","QuerySnapshot"),bundleName:Ye("string"),bundle:Ye("string")};const Qb={maxAttempts:5};/**
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
 */class kE{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=Rs(e)}set(e,t,n){this._verifyNotCommitted();const s=dr(e,this._firestore),i=Lc(s.converter,t,n),o=pc(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,n);return this._mutations.push(o.toMutation(s._key,Me.none())),this}update(e,t,n,...s){this._verifyNotCommitted();const i=dr(e,this._firestore);let o;return o=typeof(t=ne(t))=="string"||t instanceof vs?Bh(this._dataReader,"WriteBatch.update",i._key,t,n,s):lh(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(o.toMutation(i._key,Me.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=dr(e,this._firestore);return this._mutations=this._mutations.concat(new Vi(t._key,Me.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new M(S.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function dr(r,e){if((r=ne(r)).firestore!==e)throw new M(S.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return r}/**
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
 */let Wb=class{constructor(e,t){this._firestore=e,this._transaction=t,this._dataReader=Rs(e)}get(e){const t=dr(e,this._firestore),n=new ad(this._firestore);return this._transaction.lookup([t._key]).then((s=>{if(!s||s.length!==1)return Y(24041);const i=s[0];if(i.isFoundDocument())return new la(this._firestore,n,i.key,i,t.converter);if(i.isNoDocument())return new la(this._firestore,n,t._key,null,t.converter);throw Y(18433,{doc:i})}))}set(e,t,n){const s=dr(e,this._firestore),i=Lc(s.converter,t,n),o=pc(this._dataReader,"Transaction.set",s._key,i,s.converter!==null,n);return this._transaction.set(s._key,o),this}update(e,t,n,...s){const i=dr(e,this._firestore);let o;return o=typeof(t=ne(t))=="string"||t instanceof vs?Bh(this._dataReader,"Transaction.update",i._key,t,n,s):lh(this._dataReader,"Transaction.update",i._key,t),this._transaction.update(i._key,o),this}delete(e){const t=dr(e,this._firestore);return this._transaction.delete(t._key),this}};/**
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
 */class xE extends Wb{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=dr(e,this._firestore),n=new Mr(this._firestore);return super.get(e).then((s=>new Ot(this._firestore,n,t._key,s._document,new Sn(!1,!1),t.converter)))}}function $b(r,e,t){r=Be(r,we);const n={...Qb,...t};(function(o){if(o.maxAttempts<1)throw new M(S.INVALID_ARGUMENT,"Max attempts must be at least 1")})(n);const s=Ge(r);return XP(s,(i=>e(new xE(r,i))),n)}/**
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
 */function Yb(r){r=Be(r,Ie);const e=Be(r.firestore,we),t=Ge(e);return IE(t,r._key).then((n=>ud(e,r,n)))}function Xb(r){r=Be(r,Ie);const e=Be(r.firestore,we),t=Ge(e),n=new Mr(e);return zP(t,r._key).then((s=>new Ot(e,n,r._key,s,new Sn(s!==null&&s.hasLocalMutations,!0),r.converter)))}function Zb(r){r=Be(r,Ie);const e=Be(r.firestore,we),t=Ge(e);return IE(t,r._key,{source:"server"}).then((n=>ud(e,r,n)))}function eS(r){r=Be(r,rt);const e=Be(r.firestore,we),t=Ge(e),n=new Mr(e);return PE(r._query),DE(t,r._query).then((s=>new Ft(e,n,r,s)))}function tS(r){r=Be(r,rt);const e=Be(r.firestore,we),t=Ge(e),n=new Mr(e);return QP(t,r._query).then((s=>new Ft(e,n,r,s)))}function nS(r){r=Be(r,rt);const e=Be(r.firestore,we),t=Ge(e),n=new Mr(e);return DE(t,r._query,{source:"server"}).then((s=>new Ft(e,n,r,s)))}function rS(r,e,t){r=Be(r,Ie);const n=Be(r.firestore,we),s=Lc(r.converter,e,t),i=Rs(n);return Qi(n,[pc(i,"setDoc",r._key,s,r.converter!==null,t).toMutation(r._key,Me.none())])}function sS(r,e,t,...n){r=Be(r,Ie);const s=Be(r.firestore,we),i=Rs(s);let o;return o=typeof(e=ne(e))=="string"||e instanceof vs?Bh(i,"updateDoc",r._key,e,t,n):lh(i,"updateDoc",r._key,e),Qi(s,[o.toMutation(r._key,Me.exists(!0))])}function iS(r){return Qi(Be(r.firestore,we),[new Vi(r._key,Me.none())])}function oS(r,e){const t=Be(r.firestore,we),n=Xm(r),s=Lc(r.converter,e),i=Rs(r.firestore);return Qi(t,[pc(i,"addDoc",n._key,s,r.converter!==null,{}).toMutation(n._key,Me.exists(!1))]).then((()=>n))}function TB(r,...e){var l,B,d;r=ne(r);let t={includeMetadataChanges:!1,source:"default"},n=0;typeof e[n]!="object"||Zs(e[n])||(t=e[n++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(Zs(e[n])){const C=e[n];e[n]=(l=C.next)==null?void 0:l.bind(C),e[n+1]=(B=C.error)==null?void 0:B.bind(C),e[n+2]=(d=C.complete)==null?void 0:d.bind(C)}let i,o,a;if(r instanceof Ie)o=Be(r.firestore,we),a=ki(r._key.path),i={next:C=>{e[n]&&e[n](ud(o,r,C))},error:e[n+1],complete:e[n+2]};else{const C=Be(r,rt);o=Be(C.firestore,we),a=C._query;const g=new Mr(o);i={next:D=>{e[n]&&e[n](new Ft(o,g,C,D))},error:e[n+1],complete:e[n+2]},PE(r._query)}const u=Ge(o);return KP(u,a,s,i)}function aS(r,e,...t){const n=ne(r),s=(function(u){const l={bundle:"",bundleName:"",bundleSource:""},B=["bundle","bundleName","bundleSource"];for(const d of B){if(!(d in u)){l.error=`snapshotJson missing required field: ${d}`;break}const C=u[d];if(typeof C!="string"){l.error=`snapshotJson field '${d}' must be a string.`;break}if(C.length===0){l.error=`snapshotJson field '${d}' cannot be an empty string.`;break}d==="bundle"?l.bundle=C:d==="bundleName"?l.bundleName=C:d==="bundleSource"&&(l.bundleSource=C)}return l})(e);if(s.error)throw new M(S.INVALID_ARGUMENT,s.error);let i,o=0;if(typeof t[o]!="object"||Zs(t[o])||(i=t[o++]),s.bundleSource==="QuerySnapshot"){let a=null;if(typeof t[o]=="object"&&Zs(t[o])){const u=t[o++];a={next:u.next,error:u.error,complete:u.complete}}else a={next:t[o++],error:t[o++],complete:t[o++]};return(function(l,B,d,C,g){let D,N=!1;return wB(l,B.bundle).then((()=>vE(l,B.bundleName))).then((H=>{H&&!N&&(g&&H.withConverter(g),D=TB(H,d||{},C))})).catch((H=>(C.error&&C.error(H),()=>{}))),()=>{N||(N=!0,D&&D())}})(n,s,i,a,t[o])}if(s.bundleSource==="DocumentSnapshot"){let a=null;if(typeof t[o]=="object"&&Zs(t[o])){const u=t[o++];a={next:u.next,error:u.error,complete:u.complete}}else a={next:t[o++],error:t[o++],complete:t[o++]};return(function(l,B,d,C,g){let D,N=!1;return wB(l,B.bundle).then((()=>{if(!N){const H=new Ie(l,g||null,K.fromPath(B.bundleName));D=TB(H,d||{},C)}})).catch((H=>(C.error&&C.error(H),()=>{}))),()=>{N||(N=!0,D&&D())}})(n,s,i,a,t[o])}throw new M(S.INVALID_ARGUMENT,`unsupported bundle source: ${s.bundleSource}`)}function uS(r,e){r=Be(r,we);const t=Ge(r),n=Zs(e)?e:{next:e};return YP(t,n)}function Qi(r,e){const t=Ge(r);return $P(t,e)}function ud(r,e,t){const n=t.docs.get(e._key),s=new Mr(r);return new Ot(r,s,e._key,n,new Sn(t.hasPendingWrites,t.fromCache),e.converter)}function cS(r){return r=Be(r,we),Ge(r),new kE(r,(e=>Qi(r,e)))}/**
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
 */function lS(r,e){r=Be(r,we);const t=Ge(r);if(!t._uninitializedComponentsProvider||t._uninitializedComponentsProvider._offline.kind==="memory")return nt("Cannot enable indexes when persistence is disabled"),Promise.resolve();const n=(function(i){const o=typeof i=="string"?(function(l){try{return JSON.parse(l)}catch(B){throw new M(S.INVALID_ARGUMENT,"Failed to parse JSON: "+(B==null?void 0:B.message))}})(i):i,a=[];if(Array.isArray(o.indexes))for(const u of o.indexes){const l=Sp(u,"collectionGroup"),B=[];if(Array.isArray(u.fields))for(const d of u.fields){const C=Sp(d,"fieldPath"),g=dh("setIndexConfiguration",C);d.arrayConfig==="CONTAINS"?B.push(new us(g,2)):d.order==="ASCENDING"?B.push(new us(g,0)):d.order==="DESCENDING"&&B.push(new us(g,1))}a.push(new fi(fi.UNKNOWN_ID,l,B,Ci.empty()))}return a})(e);return tb(t,n)}function Sp(r,e){if(typeof r[e]!="string")throw new M(S.INVALID_ARGUMENT,"Missing string value for: "+e);return r[e]}/**
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
 */class ME{constructor(e){this._firestore=e,this.type="PersistentCacheIndexManager"}}function BS(r){var s;r=Be(r,we);const e=Np.get(r);if(e)return e;if(((s=Ge(r)._uninitializedComponentsProvider)==null?void 0:s._offline.kind)!=="persistent")return null;const n=new ME(r);return Np.set(r,n),n}function hS(r){GE(r,!0)}function dS(r){GE(r,!1)}function fS(r){const e=Ge(r._firestore);rb(e).then((t=>U("deleting all persistent cache indexes succeeded"))).catch((t=>nt("deleting all persistent cache indexes failed",t)))}function GE(r,e){const t=Ge(r._firestore);nb(t,e).then((n=>U(`setting persistent cache index auto creation isEnabled=${e} succeeded`))).catch((n=>nt(`setting persistent cache index auto creation isEnabled=${e} failed`,n)))}const Np=new WeakMap;/**
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
 */class CS{constructor(){throw new Error("instances of this class should not be created")}static onExistenceFilterMismatch(e){return cd.instance.onExistenceFilterMismatch(e)}}class cd{constructor(){this.i=new Map}static get instance(){return du||(du=new cd,yT(du)),du}Ie(e){this.i.forEach((t=>t(e)))}onExistenceFilterMismatch(e){const t=Symbol(),n=this.i;return n.set(t,e),()=>n.delete(t)}}let du=null;(function(e,t=!0){kw(ys),hs(new Bs("firestore",((n,{instanceIdentifier:s,options:i})=>{const o=n.getProvider("app").getImmediate(),a=new we(new MT(n.getProvider("auth-internal")),new HT(o,n.getProvider("app-check-internal")),zw(o,s),o);return i={useFetchStreams:t,...i},a._setSettings(i),a}),"PUBLIC").setMultipleInstances(!0)),dn(vp,Rp,e),dn(vp,Rp,"esm2020")})();const eF=Object.freeze(Object.defineProperty({__proto__:null,AbstractUserDataWriter:id,AggregateField:Ri,AggregateQuerySnapshot:RE,Bytes:Pt,CACHE_SIZE_UNLIMITED:sb,CollectionReference:Xt,DocumentReference:Ie,DocumentSnapshot:Ot,FieldPath:vs,FieldValue:Dn,Firestore:we,FirestoreError:M,GeoPoint:Yt,LoadBundleTask:wE,PersistentCacheIndexManager:ME,Query:rt,QueryCompositeFilterConstraint:Ns,QueryConstraint:Ki,QueryDocumentSnapshot:qo,QueryEndAtConstraint:Oa,QueryFieldFilterConstraint:zi,QueryLimitConstraint:Sa,QueryOrderByConstraint:Fc,QuerySnapshot:Ft,QueryStartAtConstraint:Na,SnapshotMetadata:Sn,Timestamp:Ee,Transaction:xE,VectorValue:wt,WriteBatch:kE,_AutoId:ic,_ByteString:Se,_DatabaseId:wr,_DocumentKey:K,_EmptyAppCheckTokenProvider:qT,_EmptyAuthCredentialsProvider:Gm,_FieldPath:Je,_TestingHooks:CS,_cast:Be,_debugAssert:Mw,_internalAggregationQueryToProtoRunAggregationQueryRequest:Cb,_internalQueryToProtoQueryTarget:fb,_isBase64Available:jw,_logWarn:nt,_validateIsNotUsedTogether:xg,addDoc:oS,aggregateFieldEqual:bb,aggregateQuerySnapshotEqual:Sb,and:Eb,arrayRemove:gA,arrayUnion:pA,average:Pb,clearIndexedDbPersistence:cb,collection:oA,collectionGroup:aA,connectFirestoreEmulator:Ym,count:OE,deleteAllPersistentCacheIndexes:fS,deleteDoc:iS,deleteField:fA,disableNetwork:hb,disablePersistentCacheIndexAutoCreation:dS,doc:Xm,documentId:xm,documentSnapshotFromJSON:jb,enableIndexedDbPersistence:ab,enableMultiTabIndexedDbPersistence:ub,enableNetwork:Bb,enablePersistentCacheIndexAutoCreation:hS,endAt:vb,endBefore:Ab,ensureFirestoreConfigured:Ge,executeWrite:Qi,getAggregateFromServer:FE,getCountFromServer:Nb,getDoc:Yb,getDocFromCache:Xb,getDocFromServer:Zb,getDocs:eS,getDocsFromCache:tS,getDocsFromServer:nS,getFirestore:ob,getPersistentCacheIndexManager:BS,increment:mA,initializeFirestore:ib,limit:Db,limitToLast:yb,loadBundle:wB,maximum:EA,memoryEagerGarbageCollector:kb,memoryLocalCache:Mb,memoryLruGarbageCollector:xb,minimum:_A,namedQuery:vE,onSnapshot:TB,onSnapshotResume:aS,onSnapshotsInSync:uS,or:_b,orderBy:Ib,persistentLocalCache:Gb,persistentMultipleTabManager:qb,persistentSingleTabManager:LE,query:gb,queryEqual:rh,querySnapshotFromJSON:Jb,refEqual:uA,runTransaction:$b,serverTimestamp:CA,setDoc:rS,setIndexConfiguration:lS,setLogLevel:xw,snapshotEqual:zb,startAfter:Tb,startAt:wb,sum:Rb,terminate:db,updateDoc:sS,vector:a_,waitForPendingWrites:lb,where:mb,writeBatch:cS},Symbol.toStringTag,{value:"Module"}));/**
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
 */const pS={PHONE:"phone",TOTP:"totp"},gS={FACEBOOK:"facebook.com",GITHUB:"github.com",GOOGLE:"google.com",PASSWORD:"password",PHONE:"phone",TWITTER:"twitter.com"},mS={EMAIL_LINK:"emailLink",EMAIL_PASSWORD:"password",FACEBOOK:"facebook.com",GITHUB:"github.com",GOOGLE:"google.com",PHONE:"phone",TWITTER:"twitter.com"},_S={LINK:"link",REAUTHENTICATE:"reauthenticate",SIGN_IN:"signIn"},ES={EMAIL_SIGNIN:"EMAIL_SIGNIN",PASSWORD_RESET:"PASSWORD_RESET",RECOVER_EMAIL:"RECOVER_EMAIL",REVERT_SECOND_FACTOR_ADDITION:"REVERT_SECOND_FACTOR_ADDITION",VERIFY_AND_CHANGE_EMAIL:"VERIFY_AND_CHANGE_EMAIL",VERIFY_EMAIL:"VERIFY_EMAIL"};/**
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
 */function IS(){return{"admin-restricted-operation":"This operation is restricted to administrators only.","argument-error":"","app-not-authorized":"This app, identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.","app-not-installed":"The requested mobile application corresponding to the identifier (Android package name or iOS bundle ID) provided is not installed on this device.","captcha-check-failed":"The reCAPTCHA response token provided is either invalid, expired, already used or the domain associated with it does not match the list of whitelisted domains.","code-expired":"The SMS code has expired. Please re-send the verification code to try again.","cordova-not-ready":"Cordova framework is not ready.","cors-unsupported":"This browser is not supported.","credential-already-in-use":"This credential is already associated with a different user account.","custom-token-mismatch":"The custom token corresponds to a different audience.","requires-recent-login":"This operation is sensitive and requires recent authentication. Log in again before retrying this request.","dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK.","dynamic-link-not-activated":"Please activate Dynamic Links in the Firebase Console and agree to the terms and conditions.","email-change-needs-verification":"Multi-factor users must always have a verified email.","email-already-in-use":"The email address is already in use by another account.","emulator-config-failed":'Auth instance has already been used to make a network call. Auth can no longer be configured to use the emulator. Try calling "connectAuthEmulator()" sooner.',"expired-action-code":"The action code has expired.","cancelled-popup-request":"This operation has been cancelled due to another conflicting popup being opened.","internal-error":"An internal AuthError has occurred.","invalid-app-credential":"The phone verification request contains an invalid application verifier. The reCAPTCHA token response is either invalid or expired.","invalid-app-id":"The mobile app identifier is not registered for the current project.","invalid-user-token":"This user's credential isn't valid for this project. This can happen if the user's token has been tampered with, or if the user isn't for the project associated with this API key.","invalid-auth-event":"An internal AuthError has occurred.","invalid-verification-code":"The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms and be sure to use the verification code provided by the user.","invalid-continue-uri":"The continue URL provided in the request is invalid.","invalid-cordova-configuration":"The following Cordova plugins must be installed to enable OAuth sign-in: cordova-plugin-buildinfo, cordova-universal-links-plugin, cordova-plugin-browsertab, cordova-plugin-inappbrowser and cordova-plugin-customurlscheme.","invalid-custom-token":"The custom token format is incorrect. Please check the documentation.","invalid-dynamic-link-domain":"The provided dynamic link domain is not configured or authorized for the current project.","invalid-email":"The email address is badly formatted.","invalid-emulator-scheme":"Emulator URL must start with a valid scheme (http:// or https://).","invalid-api-key":"Your API key is invalid, please check you have copied it correctly.","invalid-cert-hash":"The SHA-1 certificate hash provided is invalid.","invalid-credential":"The supplied auth credential is incorrect, malformed or has expired.","invalid-message-payload":"The email template corresponding to this action contains invalid characters in its message. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-multi-factor-session":"The request does not contain a valid proof of first factor successful sign-in.","invalid-oauth-provider":"EmailAuthProvider is not supported for this operation. This operation only supports OAuth providers.","invalid-oauth-client-id":"The OAuth client ID provided is either invalid or does not match the specified API key.","unauthorized-domain":"This domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.","invalid-action-code":"The action code is invalid. This can happen if the code is malformed, expired, or has already been used.","wrong-password":"The password is invalid or the user does not have a password.","invalid-persistence-type":"The specified persistence type is invalid. It can only be local, session or none.","invalid-phone-number":"The format of the phone number provided is incorrect. Please enter the phone number in a format that can be parsed into E.164 format. E.164 phone numbers are written in the format [+][country code][subscriber number including area code].","invalid-provider-id":"The specified provider ID is invalid.","invalid-recipient-email":"The email corresponding to this action failed to send as the provided recipient email address is invalid.","invalid-sender":"The email template corresponding to this action contains an invalid sender email or name. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-verification-id":"The verification ID used to create the phone auth credential is invalid.","invalid-tenant-id":"The Auth instance's tenant ID is invalid.","login-blocked":"Login blocked by user-provided method: {$originalMessage}","missing-android-pkg-name":"An Android Package Name must be provided if the Android App is required to be installed.","auth-domain-config-required":"Be sure to include authDomain when calling firebase.initializeApp(), by following the instructions in the Firebase console.","missing-app-credential":"The phone verification request is missing an application verifier assertion. A reCAPTCHA response token needs to be provided.","missing-verification-code":"The phone auth credential was created with an empty SMS verification code.","missing-continue-uri":"A continue URL must be provided in the request.","missing-iframe-start":"An internal AuthError has occurred.","missing-ios-bundle-id":"An iOS Bundle ID must be provided if an App Store ID is provided.","missing-or-invalid-nonce":"The request does not contain a valid nonce. This can occur if the SHA-256 hash of the provided raw nonce does not match the hashed nonce in the ID token payload.","missing-password":"A non-empty password must be provided","missing-multi-factor-info":"No second factor identifier is provided.","missing-multi-factor-session":"The request is missing proof of first factor successful sign-in.","missing-phone-number":"To send verification codes, provide a phone number for the recipient.","missing-verification-id":"The phone auth credential was created with an empty verification ID.","app-deleted":"This instance of FirebaseApp has been deleted.","multi-factor-info-not-found":"The user does not have a second factor matching the identifier provided.","multi-factor-auth-required":"Proof of ownership of a second factor is required to complete sign-in.","account-exists-with-different-credential":"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.","network-request-failed":"A network AuthError (such as timeout, interrupted connection or unreachable host) has occurred.","no-auth-event":"An internal AuthError has occurred.","no-such-provider":"User was not linked to an account with the given provider.","null-user":"A null user object was provided as the argument for an operation which requires a non-null user object.","operation-not-allowed":"The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.","operation-not-supported-in-this-environment":'This operation is not supported in the environment this application is running on. "location.protocol" must be http, https or chrome-extension and web storage must be enabled.',"popup-blocked":"Unable to establish a connection with the popup. It may have been blocked by the browser.","popup-closed-by-user":"The popup has been closed by the user before finalizing the operation.","provider-already-linked":"User can only be linked to one identity for the given provider.","quota-exceeded":"The project's quota for this operation has been exceeded.","redirect-cancelled-by-user":"The redirect operation has been cancelled by the user before finalizing.","redirect-operation-pending":"A redirect sign-in operation is already pending.","rejected-credential":"The request contains malformed or mismatching credentials.","second-factor-already-in-use":"The second factor is already enrolled on this account.","maximum-second-factor-count-exceeded":"The maximum allowed number of second factors on a user has been exceeded.","tenant-id-mismatch":"The provided tenant ID does not match the Auth instance's tenant ID",timeout:"The operation has timed out.","user-token-expired":"The user's credential is no longer valid. The user must sign in again.","too-many-requests":"We have blocked all requests from this device due to unusual activity. Try again later.","unauthorized-continue-uri":"The domain of the continue URL is not whitelisted.  Please whitelist the domain in the Firebase console.","unsupported-first-factor":"Enrolling a second factor or signing in with a multi-factor account requires sign-in with a supported first factor.","unsupported-persistence-type":"The current environment does not support the specified persistence type.","unsupported-tenant-operation":"This operation is not supported in a multi-tenant context.","unverified-email":"The operation requires a verified email.","user-cancelled":"The user did not grant your application the permissions it requested.","user-not-found":"There is no user record corresponding to this identifier. The user may have been deleted.","user-disabled":"The user account has been disabled by an administrator.","user-mismatch":"The supplied credentials do not correspond to the previously signed in user.","user-signed-out":"","weak-password":"The password must be 6 characters long or more.","web-storage-unsupported":"This browser is not supported or 3rd party cookies and data may be disabled.","already-initialized":"initializeAuth() has already been called with different options. To avoid this error, call initializeAuth() with the same options as when it was originally called, or call getAuth() to return the already initialized instance.","missing-recaptcha-token":"The reCAPTCHA token is missing when sending request to the backend.","invalid-recaptcha-token":"The reCAPTCHA token is invalid when sending request to the backend.","invalid-recaptcha-action":"The reCAPTCHA action is invalid when sending request to the backend.","recaptcha-not-enabled":"reCAPTCHA Enterprise integration is not enabled for this project.","missing-client-type":"The reCAPTCHA client type is missing when sending request to the backend.","missing-recaptcha-version":"The reCAPTCHA version is missing when sending request to the backend.","invalid-req-type":"Invalid request parameters.","invalid-recaptcha-version":"The reCAPTCHA version is invalid when sending request to the backend.","unsupported-password-policy-schema-version":"The password policy received from the backend uses a schema version that is not supported by this version of the Firebase SDK.","password-does-not-meet-requirements":"The password does not meet the requirements.","invalid-hosting-link-domain":"The provided Hosting link domain is not configured in Firebase Hosting or is not owned by the current project. This cannot be a default Hosting domain (`web.app` or `firebaseapp.com`)."}}function UE(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const DS=IS,HE=UE,qE=new Ca("auth","Firebase",UE()),yS={ADMIN_ONLY_OPERATION:"auth/admin-restricted-operation",ARGUMENT_ERROR:"auth/argument-error",APP_NOT_AUTHORIZED:"auth/app-not-authorized",APP_NOT_INSTALLED:"auth/app-not-installed",CAPTCHA_CHECK_FAILED:"auth/captcha-check-failed",CODE_EXPIRED:"auth/code-expired",CORDOVA_NOT_READY:"auth/cordova-not-ready",CORS_UNSUPPORTED:"auth/cors-unsupported",CREDENTIAL_ALREADY_IN_USE:"auth/credential-already-in-use",CREDENTIAL_MISMATCH:"auth/custom-token-mismatch",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"auth/requires-recent-login",DEPENDENT_SDK_INIT_BEFORE_AUTH:"auth/dependent-sdk-initialized-before-auth",DYNAMIC_LINK_NOT_ACTIVATED:"auth/dynamic-link-not-activated",EMAIL_CHANGE_NEEDS_VERIFICATION:"auth/email-change-needs-verification",EMAIL_EXISTS:"auth/email-already-in-use",EMULATOR_CONFIG_FAILED:"auth/emulator-config-failed",EXPIRED_OOB_CODE:"auth/expired-action-code",EXPIRED_POPUP_REQUEST:"auth/cancelled-popup-request",INTERNAL_ERROR:"auth/internal-error",INVALID_API_KEY:"auth/invalid-api-key",INVALID_APP_CREDENTIAL:"auth/invalid-app-credential",INVALID_APP_ID:"auth/invalid-app-id",INVALID_AUTH:"auth/invalid-user-token",INVALID_AUTH_EVENT:"auth/invalid-auth-event",INVALID_CERT_HASH:"auth/invalid-cert-hash",INVALID_CODE:"auth/invalid-verification-code",INVALID_CONTINUE_URI:"auth/invalid-continue-uri",INVALID_CORDOVA_CONFIGURATION:"auth/invalid-cordova-configuration",INVALID_CUSTOM_TOKEN:"auth/invalid-custom-token",INVALID_DYNAMIC_LINK_DOMAIN:"auth/invalid-dynamic-link-domain",INVALID_EMAIL:"auth/invalid-email",INVALID_EMULATOR_SCHEME:"auth/invalid-emulator-scheme",INVALID_IDP_RESPONSE:"auth/invalid-credential",INVALID_LOGIN_CREDENTIALS:"auth/invalid-credential",INVALID_MESSAGE_PAYLOAD:"auth/invalid-message-payload",INVALID_MFA_SESSION:"auth/invalid-multi-factor-session",INVALID_OAUTH_CLIENT_ID:"auth/invalid-oauth-client-id",INVALID_OAUTH_PROVIDER:"auth/invalid-oauth-provider",INVALID_OOB_CODE:"auth/invalid-action-code",INVALID_ORIGIN:"auth/unauthorized-domain",INVALID_PASSWORD:"auth/wrong-password",INVALID_PERSISTENCE:"auth/invalid-persistence-type",INVALID_PHONE_NUMBER:"auth/invalid-phone-number",INVALID_PROVIDER_ID:"auth/invalid-provider-id",INVALID_RECIPIENT_EMAIL:"auth/invalid-recipient-email",INVALID_SENDER:"auth/invalid-sender",INVALID_SESSION_INFO:"auth/invalid-verification-id",INVALID_TENANT_ID:"auth/invalid-tenant-id",MFA_INFO_NOT_FOUND:"auth/multi-factor-info-not-found",MFA_REQUIRED:"auth/multi-factor-auth-required",MISSING_ANDROID_PACKAGE_NAME:"auth/missing-android-pkg-name",MISSING_APP_CREDENTIAL:"auth/missing-app-credential",MISSING_AUTH_DOMAIN:"auth/auth-domain-config-required",MISSING_CODE:"auth/missing-verification-code",MISSING_CONTINUE_URI:"auth/missing-continue-uri",MISSING_IFRAME_START:"auth/missing-iframe-start",MISSING_IOS_BUNDLE_ID:"auth/missing-ios-bundle-id",MISSING_OR_INVALID_NONCE:"auth/missing-or-invalid-nonce",MISSING_MFA_INFO:"auth/missing-multi-factor-info",MISSING_MFA_SESSION:"auth/missing-multi-factor-session",MISSING_PHONE_NUMBER:"auth/missing-phone-number",MISSING_PASSWORD:"auth/missing-password",MISSING_SESSION_INFO:"auth/missing-verification-id",MODULE_DESTROYED:"auth/app-deleted",NEED_CONFIRMATION:"auth/account-exists-with-different-credential",NETWORK_REQUEST_FAILED:"auth/network-request-failed",NULL_USER:"auth/null-user",NO_AUTH_EVENT:"auth/no-auth-event",NO_SUCH_PROVIDER:"auth/no-such-provider",OPERATION_NOT_ALLOWED:"auth/operation-not-allowed",OPERATION_NOT_SUPPORTED:"auth/operation-not-supported-in-this-environment",POPUP_BLOCKED:"auth/popup-blocked",POPUP_CLOSED_BY_USER:"auth/popup-closed-by-user",PROVIDER_ALREADY_LINKED:"auth/provider-already-linked",QUOTA_EXCEEDED:"auth/quota-exceeded",REDIRECT_CANCELLED_BY_USER:"auth/redirect-cancelled-by-user",REDIRECT_OPERATION_PENDING:"auth/redirect-operation-pending",REJECTED_CREDENTIAL:"auth/rejected-credential",SECOND_FACTOR_ALREADY_ENROLLED:"auth/second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"auth/maximum-second-factor-count-exceeded",TENANT_ID_MISMATCH:"auth/tenant-id-mismatch",TIMEOUT:"auth/timeout",TOKEN_EXPIRED:"auth/user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"auth/too-many-requests",UNAUTHORIZED_DOMAIN:"auth/unauthorized-continue-uri",UNSUPPORTED_FIRST_FACTOR:"auth/unsupported-first-factor",UNSUPPORTED_PERSISTENCE:"auth/unsupported-persistence-type",UNSUPPORTED_TENANT_OPERATION:"auth/unsupported-tenant-operation",UNVERIFIED_EMAIL:"auth/unverified-email",USER_CANCELLED:"auth/user-cancelled",USER_DELETED:"auth/user-not-found",USER_DISABLED:"auth/user-disabled",USER_MISMATCH:"auth/user-mismatch",USER_SIGNED_OUT:"auth/user-signed-out",WEAK_PASSWORD:"auth/weak-password",WEB_STORAGE_UNSUPPORTED:"auth/web-storage-unsupported",ALREADY_INITIALIZED:"auth/already-initialized",RECAPTCHA_NOT_ENABLED:"auth/recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"auth/missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"auth/invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"auth/invalid-recaptcha-action",MISSING_CLIENT_TYPE:"auth/missing-client-type",MISSING_RECAPTCHA_VERSION:"auth/missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"auth/invalid-recaptcha-version",INVALID_REQ_TYPE:"auth/invalid-req-type",INVALID_HOSTING_LINK_DOMAIN:"auth/invalid-hosting-link-domain"};/**
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
 */const Xu=new NB("@firebase/auth");function jE(r,...e){Xu.logLevel<=he.WARN&&Xu.warn(`Auth (${ys}): ${r}`,...e)}function Au(r,...e){Xu.logLevel<=he.ERROR&&Xu.error(`Auth (${ys}): ${r}`,...e)}/**
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
 */function kt(r,...e){throw Bd(r,...e)}function Tt(r,...e){return Bd(r,...e)}function ld(r,e,t){const n={...HE(),[e]:t};return new Ca("auth","Firebase",n).create(e,{appName:r.name})}function lt(r){return ld(r,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Wi(r,e,t){const n=t;if(!(e instanceof n))throw n.name!==e.constructor.name&&kt(r,"argument-error"),ld(r,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Bd(r,...e){if(typeof r!="string"){const t=e[0],n=[...e.slice(1)];return n[0]&&(n[0].appName=r.name),r._errorFactory.create(t,...n)}return qE.create(r,...e)}function j(r,e,...t){if(!r)throw Bd(e,...t)}function Bn(r){const e="INTERNAL ASSERTION FAILED: "+r;throw Au(e),new Error(e)}function Hn(r,e){r||Bn(e)}/**
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
 */function Ba(){var r;return typeof self<"u"&&((r=self.location)==null?void 0:r.href)||""}function hd(){return Op()==="http:"||Op()==="https:"}function Op(){var r;return typeof self<"u"&&((r=self.location)==null?void 0:r.protocol)||null}/**
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
 */function wS(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(hd()||MD()||"connection"in navigator)?navigator.onLine:!0}function TS(){if(typeof navigator>"u")return null;const r=navigator;return r.languages&&r.languages[0]||r.language||null}/**
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
 */class Fa{constructor(e,t){this.shortDelay=e,this.longDelay=t,Hn(t>e,"Short delay should be less than long delay!"),this.isMobile=VD()||GD()}get(){return wS()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function dd(r,e){Hn(r.emulator,"Emulator should always be set here");const{url:t}=r.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class JE{static initialize(e,t,n){this.fetchImpl=e,t&&(this.headersImpl=t),n&&(this.responseImpl=n)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Bn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Bn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Bn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const AS={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const vS=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],RS=new Fa(3e4,6e4);function Ve(r,e){return r.tenantId&&!e.tenantId?{...e,tenantId:r.tenantId}:e}async function ke(r,e,t,n,s={}){return KE(r,s,async()=>{let i={},o={};n&&(e==="GET"?o=n:i={body:JSON.stringify(n)});const a=bi({...o,key:r.config.apiKey}).slice(1),u=await r._getAdditionalHeaders();u["Content-Type"]="application/json",r.languageCode&&(u["X-Firebase-Locale"]=r.languageCode);const l={method:e,headers:u,...i};return xD()||(l.referrerPolicy="strict-origin-when-cross-origin"),r.emulatorConfig&&Si(r.emulatorConfig.host)&&(l.credentials="include"),JE.fetch()(await zE(r,r.config.apiHost,t,a),l)})}async function KE(r,e,t){r._canInitEmulator=!1;const n={...AS,...e};try{const s=new bS(r),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw Po(r,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const a=i.ok?o.errorMessage:o.error.message,[u,l]=a.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Po(r,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw Po(r,"email-already-in-use",o);if(u==="USER_DISABLED")throw Po(r,"user-disabled",o);const B=n[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(l)throw ld(r,B,l);kt(r,B)}}catch(s){if(s instanceof In)throw s;kt(r,"network-request-failed",{message:String(s)})}}async function Qn(r,e,t,n,s={}){const i=await ke(r,e,t,n,s);return"mfaPendingCredential"in i&&kt(r,"multi-factor-auth-required",{_serverResponse:i}),i}async function zE(r,e,t,n){const s=`${e}${t}?${n}`,i=r,o=i.config.emulator?dd(r.config,s):`${r.config.apiScheme}://${s}`;return vS.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function PS(r){switch(r){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class bS{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,n)=>{this.timer=setTimeout(()=>n(Tt(this.auth,"network-request-failed")),RS.get())})}}function Po(r,e,t){const n={appName:r.name};t.email&&(n.email=t.email),t.phoneNumber&&(n.phoneNumber=t.phoneNumber);const s=Tt(r,e,n);return s.customData._tokenResponse=t,s}/**
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
 */function Fp(r){return r!==void 0&&r.getResponse!==void 0}function Lp(r){return r!==void 0&&r.enterprise!==void 0}class QE{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return PS(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}/**
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
 */async function SS(r){return(await ke(r,"GET","/v1/recaptchaParams")).recaptchaSiteKey||""}async function WE(r,e){return ke(r,"GET","/v2/recaptchaConfig",Ve(r,e))}/**
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
 */async function NS(r,e){return ke(r,"POST","/v1/accounts:delete",e)}async function OS(r,e){return ke(r,"POST","/v1/accounts:update",e)}async function Zu(r,e){return ke(r,"POST","/v1/accounts:lookup",e)}/**
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
 */function jo(r){if(r)try{const e=new Date(Number(r));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}/**
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
 */function FS(r,e=!1){return ne(r).getIdToken(e)}async function $E(r,e=!1){const t=ne(r),n=await t.getIdToken(e),s=Vc(n);j(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:n,authTime:jo(Fl(s.auth_time)),issuedAtTime:jo(Fl(s.iat)),expirationTime:jo(Fl(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Fl(r){return Number(r)*1e3}function Vc(r){const[e,t,n]=r.split(".");if(e===void 0||t===void 0||n===void 0)return Au("JWT malformed, contained fewer than 3 sections"),null;try{const s=RB(t);return s?JSON.parse(s):(Au("Failed to decode base64 JWT payload"),null)}catch(s){return Au("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Vp(r){const e=Vc(r);return j(e,"internal-error"),j(typeof e.exp<"u","internal-error"),j(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function qn(r,e,t=!1){if(t)return e;try{return await e}catch(n){throw n instanceof In&&LS(n)&&r.auth.currentUser===r&&await r.auth.signOut(),n}}function LS({code:r}){return r==="auth/user-disabled"||r==="auth/user-token-expired"}/**
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
 */class VS{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const n=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,n)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class AB{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=jo(this.lastLoginAt),this.creationTime=jo(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function ha(r){var d;const e=r.auth,t=await r.getIdToken(),n=await qn(r,Zu(e,{idToken:t}));j(n==null?void 0:n.users.length,e,"internal-error");const s=n.users[0];r._notifyReloadListener(s);const i=(d=s.providerUserInfo)!=null&&d.length?XE(s.providerUserInfo):[],o=kS(r.providerData,i),a=r.isAnonymous,u=!(r.email&&s.passwordHash)&&!(o!=null&&o.length),l=a?u:!1,B={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new AB(s.createdAt,s.lastLoginAt),isAnonymous:l};Object.assign(r,B)}async function YE(r){const e=ne(r);await ha(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function kS(r,e){return[...r.filter(n=>!e.some(s=>s.providerId===n.providerId)),...e]}function XE(r){return r.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
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
 */async function xS(r,e){const t=await KE(r,{},async()=>{const n=bi({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=r.config,o=await zE(r,s,"/v1/token",`key=${i}`),a=await r._getAdditionalHeaders();a["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:a,body:n};return r.emulatorConfig&&Si(r.emulatorConfig.host)&&(u.credentials="include"),JE.fetch()(o,u)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function MS(r,e){return ke(r,"POST","/v2/accounts:revokeToken",Ve(r,e))}/**
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
 */class ei{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){j(e.idToken,"internal-error"),j(typeof e.idToken<"u","internal-error"),j(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Vp(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){j(e.length!==0,"internal-error");const t=Vp(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(j(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:n,refreshToken:s,expiresIn:i}=await xS(e,t);this.updateTokensAndExpiration(n,s,Number(i))}updateTokensAndExpiration(e,t,n){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+n*1e3}static fromJSON(e,t){const{refreshToken:n,accessToken:s,expirationTime:i}=t,o=new ei;return n&&(j(typeof n=="string","internal-error",{appName:e}),o.refreshToken=n),s&&(j(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(j(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new ei,this.toJSON())}_performRefresh(){return Bn("not implemented")}}/**
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
 */function ar(r,e){j(typeof r=="string"||typeof r>"u","internal-error",{appName:e})}class $t{constructor({uid:e,auth:t,stsTokenManager:n,...s}){this.providerId="firebase",this.proactiveRefresh=new VS(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=n,this.accessToken=n.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new AB(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await qn(this,this.stsTokenManager.getToken(this.auth,e));return j(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return $E(this,e)}reload(){return YE(this)}_assign(e){this!==e&&(j(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new $t({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){j(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),t&&await ha(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(xe(this.auth.app))return Promise.reject(lt(this.auth));const e=await this.getIdToken();return await qn(this,NS(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const n=t.displayName??void 0,s=t.email??void 0,i=t.phoneNumber??void 0,o=t.photoURL??void 0,a=t.tenantId??void 0,u=t._redirectEventId??void 0,l=t.createdAt??void 0,B=t.lastLoginAt??void 0,{uid:d,emailVerified:C,isAnonymous:g,providerData:D,stsTokenManager:N}=t;j(d&&N,e,"internal-error");const V=ei.fromJSON(this.name,N);j(typeof d=="string",e,"internal-error"),ar(n,e.name),ar(s,e.name),j(typeof C=="boolean",e,"internal-error"),j(typeof g=="boolean",e,"internal-error"),ar(i,e.name),ar(o,e.name),ar(a,e.name),ar(u,e.name),ar(l,e.name),ar(B,e.name);const H=new $t({uid:d,auth:e,email:s,emailVerified:C,displayName:n,isAnonymous:g,photoURL:o,phoneNumber:i,tenantId:a,stsTokenManager:V,createdAt:l,lastLoginAt:B});return D&&Array.isArray(D)&&(H.providerData=D.map(Z=>({...Z}))),u&&(H._redirectEventId=u),H}static async _fromIdTokenResponse(e,t,n=!1){const s=new ei;s.updateFromServerResponse(t);const i=new $t({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:n});return await ha(i),i}static async _fromGetAccountInfoResponse(e,t,n){const s=t.users[0];j(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?XE(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),a=new ei;a.updateFromIdToken(n);const u=new $t({uid:s.localId,auth:e,stsTokenManager:a,isAnonymous:o}),l={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new AB(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(u,l),u}}/**
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
 */const kp=new Map;function Nn(r){Hn(r instanceof Function,"Expected a class definition");let e=kp.get(r);return e?(Hn(e instanceof r,"Instance stored in cache mismatched with class"),e):(e=new r,kp.set(r,e),e)}/**
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
 */class ZE{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}ZE.type="NONE";const vB=ZE;/**
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
 */function vu(r,e,t){return`firebase:${r}:${e}:${t}`}class ti{constructor(e,t,n){this.persistence=e,this.auth=t,this.userKey=n;const{config:s,name:i}=this.auth;this.fullUserKey=vu(this.userKey,s.apiKey,i),this.fullPersistenceKey=vu("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Zu(this.auth,{idToken:e}).catch(()=>{});return t?$t._fromGetAccountInfoResponse(this.auth,t,e):null}return $t._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,n="authUser"){if(!t.length)return new ti(Nn(vB),e,n);const s=(await Promise.all(t.map(async l=>{if(await l._isAvailable())return l}))).filter(l=>l);let i=s[0]||Nn(vB);const o=vu(n,e.config.apiKey,e.name);let a=null;for(const l of t)try{const B=await l._get(o);if(B){let d;if(typeof B=="string"){const C=await Zu(e,{idToken:B}).catch(()=>{});if(!C)break;d=await $t._fromGetAccountInfoResponse(e,C,B)}else d=$t._fromJSON(e,B);l!==i&&(a=d),i=l;break}}catch{}const u=s.filter(l=>l._shouldAllowMigration);return!i._shouldAllowMigration||!u.length?new ti(i,e,n):(i=u[0],a&&await i._set(o,a.toJSON()),await Promise.all(t.map(async l=>{if(l!==i)try{await l._remove(o)}catch{}})),new ti(i,e,n))}}/**
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
 */function xp(r){const e=r.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(rI(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(eI(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(iI(e))return"Blackberry";if(oI(e))return"Webos";if(tI(e))return"Safari";if((e.includes("chrome/")||nI(e))&&!e.includes("edge/"))return"Chrome";if(sI(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=r.match(t);if((n==null?void 0:n.length)===2)return n[1]}return"Other"}function eI(r=tt()){return/firefox\//i.test(r)}function tI(r=tt()){const e=r.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function nI(r=tt()){return/crios\//i.test(r)}function rI(r=tt()){return/iemobile/i.test(r)}function sI(r=tt()){return/android/i.test(r)}function iI(r=tt()){return/blackberry/i.test(r)}function oI(r=tt()){return/webos/i.test(r)}function fd(r=tt()){return/iphone|ipad|ipod/i.test(r)||/macintosh/i.test(r)&&/mobile/i.test(r)}function GS(r=tt()){var e;return fd(r)&&!!((e=window.navigator)!=null&&e.standalone)}function US(){return UD()&&document.documentMode===10}function aI(r=tt()){return fd(r)||sI(r)||oI(r)||iI(r)||/windows phone/i.test(r)||rI(r)}/**
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
 */function uI(r,e=[]){let t;switch(r){case"Browser":t=xp(tt());break;case"Worker":t=`${xp(tt())}-${r}`;break;default:t=r}const n=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${ys}/${n}`}/**
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
 */class HS{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const n=i=>new Promise((o,a)=>{try{const u=e(i);o(u)}catch(u){a(u)}});n.onAbort=t,this.queue.push(n);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const n of this.queue)await n(e),n.onAbort&&t.push(n.onAbort)}catch(n){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:n==null?void 0:n.message})}}}/**
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
 */async function qS(r,e={}){return ke(r,"GET","/v2/passwordPolicy",Ve(r,e))}/**
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
 */const jS=6;class JS{constructor(e){var n;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??jS,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((n=e.allowedNonAlphanumericCharacters)==null?void 0:n.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const n=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;n&&(t.meetsMinPasswordLength=e.length>=n),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let n;for(let s=0;s<e.length;s++)n=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,t,n,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
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
 */class KS{constructor(e,t,n,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=n,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Mp(this),this.idTokenSubscription=new Mp(this),this.beforeStateQueue=new HS(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=qE,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Nn(t)),this._initializationPromise=this.queue(async()=>{var n,s,i;if(!this._deleted&&(this.persistenceManager=await ti.create(this,e),(n=this._resolvePersistenceManagerAvailable)==null||n.call(this),!this._deleted)){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Zu(this,{idToken:e}),n=await $t._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(n)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(xe(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let n=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(i=this.redirectUser)==null?void 0:i._redirectEventId,a=n==null?void 0:n._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===a)&&(u!=null&&u.user)&&(n=u.user,s=!0)}if(!n)return this.directlySetCurrentUser(null);if(!n._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(n)}catch(o){n=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return n?this.reloadAndSetCurrentUserOrClear(n):this.directlySetCurrentUser(null)}return j(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===n._redirectEventId?this.directlySetCurrentUser(n):this.reloadAndSetCurrentUserOrClear(n)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await ha(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=TS()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(xe(this.app))return Promise.reject(lt(this));const t=e?ne(e):null;return t&&j(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&j(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return xe(this.app)?Promise.reject(lt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return xe(this.app)?Promise.reject(lt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Nn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await qS(this),t=new JS(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Ca("auth","Firebase",e())}onAuthStateChanged(e,t,n){return this.registerStateListener(this.authStateSubscription,e,t,n)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,n){return this.registerStateListener(this.idTokenSubscription,e,t,n)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),n={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(n.tenantId=this.tenantId),await MS(this,n)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const n=await this.getOrInitRedirectPersistenceManager(t);return e===null?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Nn(e)||this._popupRedirectResolver;j(t,this,"argument-error"),this.redirectPersistenceManager=await ti.create(this,[Nn(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,n;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((n=this.redirectUser)==null?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,n,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(j(a,this,"internal-error"),a.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const u=e.addObserver(t,n,s);return()=>{o=!0,u()}}else{const u=e.addObserver(t);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return j(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=uI(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const n=await this._getAppCheckToken();return n&&(e["X-Firebase-AppCheck"]=n),e}async _getAppCheckToken(){var t;if(xe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&jE(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function qe(r){return ne(r)}class Mp{constructor(e){this.auth=e,this.observer=null,this.addObserver=KD(t=>this.observer=t)}get next(){return j(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let La={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function zS(r){La=r}function Cd(r){return La.loadJS(r)}function QS(){return La.recaptchaV2Script}function WS(){return La.recaptchaEnterpriseScript}function $S(){return La.gapiScript}function cI(r){return`__${r}${Math.floor(Math.random()*1e6)}`}/**
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
 */const YS=500,XS=6e4,fu=1e12;class ZS{constructor(e){this.auth=e,this.counter=fu,this._widgets=new Map}render(e,t){const n=this.counter;return this._widgets.set(n,new nN(e,this.auth.name,t||{})),this.counter++,n}reset(e){var n;const t=e||fu;(n=this._widgets.get(t))==null||n.delete(),this._widgets.delete(t)}getResponse(e){var n;const t=e||fu;return((n=this._widgets.get(t))==null?void 0:n.getResponse())||""}async execute(e){var n;const t=e||fu;return(n=this._widgets.get(t))==null||n.execute(),""}}class eN{constructor(){this.enterprise=new tN}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class tN{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class nN{constructor(e,t,n){this.params=n,this.timerId=null,this.deleted=!1,this.responseToken=null,this.clickHandler=()=>{this.execute()};const s=typeof e=="string"?document.getElementById(e):e;j(s,"argument-error",{appName:t}),this.container=s,this.isVisible=this.params.size!=="invisible",this.isVisible?this.execute():this.container.addEventListener("click",this.clickHandler)}getResponse(){return this.checkIfDeleted(),this.responseToken}delete(){this.checkIfDeleted(),this.deleted=!0,this.timerId&&(clearTimeout(this.timerId),this.timerId=null),this.container.removeEventListener("click",this.clickHandler)}execute(){this.checkIfDeleted(),!this.timerId&&(this.timerId=window.setTimeout(()=>{this.responseToken=rN(50);const{callback:e,"expired-callback":t}=this.params;if(e)try{e(this.responseToken)}catch{}this.timerId=window.setTimeout(()=>{if(this.timerId=null,this.responseToken=null,t)try{t()}catch{}this.isVisible&&this.execute()},XS)},YS))}checkIfDeleted(){if(this.deleted)throw new Error("reCAPTCHA mock was already deleted!")}}function rN(r){const e=[],t="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let n=0;n<r;n++)e.push(t.charAt(Math.floor(Math.random()*t.length)));return e.join("")}/**
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
 */const sN="recaptcha-enterprise",Jo="NO_RECAPTCHA",Gp="onFirebaseAuthREInstanceReady";class Tn{constructor(e){this.type=sN,this.auth=qe(e)}async verify(e="verify",t=!1){async function n(i){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,a)=>{WE(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)a(new Error("recaptcha Enterprise site key undefined"));else{const l=new QE(u);return i.tenantId==null?i._agentRecaptchaConfig=l:i._tenantRecaptchaConfigs[i.tenantId]=l,o(l.siteKey)}}).catch(u=>{a(u)})})}function s(i,o,a){const u=window.grecaptcha;Lp(u)?u.enterprise.ready(()=>{u.enterprise.execute(i,{action:e}).then(l=>{o(l)}).catch(()=>{o(Jo)})}):a(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new eN().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{n(this.auth).then(async a=>{if(!t&&Lp(window.grecaptcha)&&Tn.scriptInjectionDeferred)await Tn.scriptInjectionDeferred.promise,s(a,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let u=WS();u.length!==0&&(u+=a+`&onload=${Gp}`),Tn.scriptInjectionDeferred=new og,window[Gp]=()=>{var l;(l=Tn.scriptInjectionDeferred)==null||l.resolve()},Cd(u).then(()=>{var l;return(l=Tn.scriptInjectionDeferred)==null?void 0:l.promise}).then(()=>{s(a,i,o)}).catch(l=>{o(l)})}}).catch(a=>{o(a)})})}}Tn.scriptInjectionDeferred=null;async function Do(r,e,t,n=!1,s=!1){const i=new Tn(r);let o;if(s)o=Jo;else try{o=await i.verify(t)}catch{o=await i.verify(t,!0)}const a={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in a){const u=a.phoneEnrollmentInfo.phoneNumber,l=a.phoneEnrollmentInfo.recaptchaToken;Object.assign(a,{phoneEnrollmentInfo:{phoneNumber:u,recaptchaToken:l,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in a){const u=a.phoneSignInInfo.recaptchaToken;Object.assign(a,{phoneSignInInfo:{recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return a}return n?Object.assign(a,{captchaResp:o}):Object.assign(a,{captchaResponse:o}),Object.assign(a,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(a,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),a}async function Er(r,e,t,n,s){var i,o;if(s==="EMAIL_PASSWORD_PROVIDER")if((i=r._getRecaptchaConfig())!=null&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const a=await Do(r,e,t,t==="getOobCode");return n(r,a)}else return n(r,e).catch(async a=>{if(a.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const u=await Do(r,e,t,t==="getOobCode");return n(r,u)}else return Promise.reject(a)});else if(s==="PHONE_PROVIDER")if((o=r._getRecaptchaConfig())!=null&&o.isProviderEnabled("PHONE_PROVIDER")){const a=await Do(r,e,t);return n(r,a).catch(async u=>{var l;if(((l=r._getRecaptchaConfig())==null?void 0:l.getProviderEnforcementState("PHONE_PROVIDER"))==="AUDIT"&&(u.code==="auth/missing-recaptcha-token"||u.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${t} flow.`);const B=await Do(r,e,t,!1,!0);return n(r,B)}return Promise.reject(u)})}else{const a=await Do(r,e,t,!1,!0);return n(r,a)}else return Promise.reject(s+" provider is not supported.")}async function lI(r){const e=qe(r),t=await WE(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),n=new QE(t);e.tenantId==null?e._agentRecaptchaConfig=n:e._tenantRecaptchaConfigs[e.tenantId]=n,n.isAnyProviderEnabled()&&new Tn(e).verify()}/**
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
 */function BI(r,e){const t=Ni(r,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(Zt(i,e??{}))return s;kt(s,"already-initialized")}return t.initialize({options:e})}function iN(r,e){const t=(e==null?void 0:e.persistence)||[],n=(Array.isArray(t)?t:[t]).map(Nn);e!=null&&e.errorMap&&r._updateErrorMap(e.errorMap),r._initializeWithPersistence(n,e==null?void 0:e.popupRedirectResolver)}function hI(r,e,t){const n=qe(r);j(/^https?:\/\//.test(e),n,"invalid-emulator-scheme");const s=!!(t!=null&&t.disableWarnings),i=dI(e),{host:o,port:a}=oN(e),u=a===null?"":`:${a}`,l={url:`${i}//${o}${u}/`},B=Object.freeze({host:o,port:a,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!n._canInitEmulator){j(n.config.emulator&&n.emulatorConfig,n,"emulator-config-failed"),j(Zt(l,n.config.emulator)&&Zt(B,n.emulatorConfig),n,"emulator-config-failed");return}n.config.emulator=l,n.emulatorConfig=B,n.settings.appVerificationDisabledForTesting=!0,Si(o)?bB(`${i}//${o}${u}`):s||aN()}function dI(r){const e=r.indexOf(":");return e<0?"":r.substr(0,e+1)}function oN(r){const e=dI(r),t=/(\/\/)?([^?#/]+)/.exec(r.substr(e.length));if(!t)return{host:"",port:null};const n=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(n);if(s){const i=s[1];return{host:i,port:Up(n.substr(i.length+1))}}else{const[i,o]=n.split(":");return{host:i,port:Up(o)}}}function Up(r){if(!r)return null;const e=Number(r);return isNaN(e)?null:e}function aN(){function r(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",r):r())}/**
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
 */class $i{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Bn("not implemented")}_getIdTokenResponse(e){return Bn("not implemented")}_linkToIdToken(e,t){return Bn("not implemented")}_getReauthenticationResolver(e){return Bn("not implemented")}}/**
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
 */async function fI(r,e){return ke(r,"POST","/v1/accounts:resetPassword",Ve(r,e))}async function uN(r,e){return ke(r,"POST","/v1/accounts:update",e)}async function cN(r,e){return ke(r,"POST","/v1/accounts:signUp",e)}async function lN(r,e){return ke(r,"POST","/v1/accounts:update",Ve(r,e))}/**
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
 */async function BN(r,e){return Qn(r,"POST","/v1/accounts:signInWithPassword",Ve(r,e))}async function kc(r,e){return ke(r,"POST","/v1/accounts:sendOobCode",Ve(r,e))}async function hN(r,e){return kc(r,e)}async function dN(r,e){return kc(r,e)}async function fN(r,e){return kc(r,e)}async function CN(r,e){return kc(r,e)}/**
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
 */async function pN(r,e){return Qn(r,"POST","/v1/accounts:signInWithEmailLink",Ve(r,e))}async function gN(r,e){return Qn(r,"POST","/v1/accounts:signInWithEmailLink",Ve(r,e))}/**
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
 */class Pi extends $i{constructor(e,t,n,s=null){super("password",n),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new Pi(e,t,"password")}static _fromEmailAndCode(e,t,n=null){return new Pi(e,t,"emailLink",n)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Er(e,t,"signInWithPassword",BN,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return pN(e,{email:this._email,oobCode:this._password});default:kt(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const n={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Er(e,n,"signUpPassword",cN,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return gN(e,{idToken:t,email:this._email,oobCode:this._password});default:kt(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
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
 */async function Vn(r,e){return Qn(r,"POST","/v1/accounts:signInWithIdp",Ve(r,e))}/**
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
 */const mN="http://localhost";class En extends $i{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new En(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):kt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:n,signInMethod:s,...i}=t;if(!n||!s)return null;const o=new En(n,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Vn(e,t)}_linkToIdToken(e,t){const n=this.buildRequest();return n.idToken=t,Vn(e,n)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Vn(e,t)}buildRequest(){const e={requestUri:mN,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=bi(t)}return e}}/**
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
 */async function Hp(r,e){return ke(r,"POST","/v1/accounts:sendVerificationCode",Ve(r,e))}async function _N(r,e){return Qn(r,"POST","/v1/accounts:signInWithPhoneNumber",Ve(r,e))}async function EN(r,e){const t=await Qn(r,"POST","/v1/accounts:signInWithPhoneNumber",Ve(r,e));if(t.temporaryProof)throw Po(r,"account-exists-with-different-credential",t);return t}const IN={USER_NOT_FOUND:"user-not-found"};async function DN(r,e){const t={...e,operation:"REAUTH"};return Qn(r,"POST","/v1/accounts:signInWithPhoneNumber",Ve(r,t),IN)}/**
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
 */class Ir extends $i{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,t){return new Ir({verificationId:e,verificationCode:t})}static _fromTokenResponse(e,t){return new Ir({phoneNumber:e,temporaryProof:t})}_getIdTokenResponse(e){return _N(e,this._makeVerificationRequest())}_linkToIdToken(e,t){return EN(e,{idToken:t,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return DN(e,this._makeVerificationRequest())}_makeVerificationRequest(){const{temporaryProof:e,phoneNumber:t,verificationId:n,verificationCode:s}=this.params;return e&&t?{temporaryProof:e,phoneNumber:t}:{sessionInfo:n,code:s}}toJSON(){const e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));const{verificationId:t,verificationCode:n,phoneNumber:s,temporaryProof:i}=e;return!n&&!t&&!s&&!i?null:new Ir({verificationId:t,verificationCode:n,phoneNumber:s,temporaryProof:i})}}/**
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
 */function yN(r){switch(r){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function wN(r){const e=yo(wo(r)).link,t=e?yo(wo(e)).deep_link_id:null,n=yo(wo(r)).deep_link_id;return(n?yo(wo(n)).link:null)||n||t||e||r}class Yi{constructor(e){const t=yo(wo(e)),n=t.apiKey??null,s=t.oobCode??null,i=yN(t.mode??null);j(n&&s&&i,"argument-error"),this.apiKey=n,this.operation=i,this.code=s,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=wN(e);try{return new Yi(t)}catch{return null}}}function TN(r){return Yi.parseLink(r)}/**
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
 */class Gr{constructor(){this.providerId=Gr.PROVIDER_ID}static credential(e,t){return Pi._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const n=Yi.parseLink(t);return j(n,"argument-error"),Pi._fromEmailAndCode(e,n.code,n.tenantId)}}Gr.PROVIDER_ID="password";Gr.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Gr.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
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
 */class Wn{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Xi extends Wn{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}class Ko extends Xi{static credentialFromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;return j("providerId"in t&&"signInMethod"in t,"argument-error"),En._fromParams(t)}credential(e){return this._credential({...e,nonce:e.rawNonce})}_credential(e){return j(e.idToken||e.accessToken,"argument-error"),En._fromParams({...e,providerId:this.providerId,signInMethod:this.providerId})}static credentialFromResult(e){return Ko.oauthCredentialFromTaggedObject(e)}static credentialFromError(e){return Ko.oauthCredentialFromTaggedObject(e.customData||{})}static oauthCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:n,oauthTokenSecret:s,pendingToken:i,nonce:o,providerId:a}=e;if(!n&&!s&&!t&&!i||!a)return null;try{return new Ko(a)._credential({idToken:t,accessToken:n,nonce:o,pendingToken:i})}catch{return null}}}/**
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
 */class An extends Xi{constructor(){super("facebook.com")}static credential(e){return En._fromParams({providerId:An.PROVIDER_ID,signInMethod:An.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return An.credentialFromTaggedObject(e)}static credentialFromError(e){return An.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return An.credential(e.oauthAccessToken)}catch{return null}}}An.FACEBOOK_SIGN_IN_METHOD="facebook.com";An.PROVIDER_ID="facebook.com";/**
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
 */class vn extends Xi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return En._fromParams({providerId:vn.PROVIDER_ID,signInMethod:vn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return vn.credentialFromTaggedObject(e)}static credentialFromError(e){return vn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:n}=e;if(!t&&!n)return null;try{return vn.credential(t,n)}catch{return null}}}vn.GOOGLE_SIGN_IN_METHOD="google.com";vn.PROVIDER_ID="google.com";/**
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
 */class Rn extends Xi{constructor(){super("github.com")}static credential(e){return En._fromParams({providerId:Rn.PROVIDER_ID,signInMethod:Rn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Rn.credentialFromTaggedObject(e)}static credentialFromError(e){return Rn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Rn.credential(e.oauthAccessToken)}catch{return null}}}Rn.GITHUB_SIGN_IN_METHOD="github.com";Rn.PROVIDER_ID="github.com";/**
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
 */const AN="http://localhost";class da extends $i{constructor(e,t){super(e,e),this.pendingToken=t}_getIdTokenResponse(e){const t=this.buildRequest();return Vn(e,t)}_linkToIdToken(e,t){const n=this.buildRequest();return n.idToken=t,Vn(e,n)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Vn(e,t)}toJSON(){return{signInMethod:this.signInMethod,providerId:this.providerId,pendingToken:this.pendingToken}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:n,signInMethod:s,pendingToken:i}=t;return!n||!s||!i||n!==s?null:new da(n,i)}static _create(e,t){return new da(e,t)}buildRequest(){return{requestUri:AN,returnSecureToken:!0,pendingToken:this.pendingToken}}}/**
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
 */const vN="saml.";class ec extends Wn{constructor(e){j(e.startsWith(vN),"argument-error"),super(e)}static credentialFromResult(e){return ec.samlCredentialFromTaggedObject(e)}static credentialFromError(e){return ec.samlCredentialFromTaggedObject(e.customData||{})}static credentialFromJSON(e){const t=da.fromJSON(e);return j(t,"argument-error"),t}static samlCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{pendingToken:t,providerId:n}=e;if(!t||!n)return null;try{return da._create(n,t)}catch{return null}}}/**
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
 */class Pn extends Xi{constructor(){super("twitter.com")}static credential(e,t){return En._fromParams({providerId:Pn.PROVIDER_ID,signInMethod:Pn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Pn.credentialFromTaggedObject(e)}static credentialFromError(e){return Pn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:n}=e;if(!t||!n)return null;try{return Pn.credential(t,n)}catch{return null}}}Pn.TWITTER_SIGN_IN_METHOD="twitter.com";Pn.PROVIDER_ID="twitter.com";/**
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
 */async function CI(r,e){return Qn(r,"POST","/v1/accounts:signUp",Ve(r,e))}/**
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
 */class Qt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,n,s=!1){const i=await $t._fromIdTokenResponse(e,n,s),o=qp(n);return new Qt({user:i,providerId:o,_tokenResponse:n,operationType:t})}static async _forOperation(e,t,n){await e._updateTokensIfNecessary(n,!0);const s=qp(n);return new Qt({user:e,providerId:s,_tokenResponse:n,operationType:t})}}function qp(r){return r.providerId?r.providerId:"phoneNumber"in r?"phone":null}/**
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
 */async function RN(r){var s;if(xe(r.app))return Promise.reject(lt(r));const e=qe(r);if(await e._initializationPromise,(s=e.currentUser)!=null&&s.isAnonymous)return new Qt({user:e.currentUser,providerId:null,operationType:"signIn"});const t=await CI(e,{returnSecureToken:!0}),n=await Qt._fromIdTokenResponse(e,"signIn",t,!0);return await e._updateCurrentUser(n.user),n}/**
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
 */class tc extends In{constructor(e,t,n,s){super(t.code,t.message),this.operationType=n,this.user=s,Object.setPrototypeOf(this,tc.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,t,n,s){return new tc(e,t,n,s)}}function pI(r,e,t,n){return(e==="reauthenticate"?t._getReauthenticationResolver(r):t._getIdTokenResponse(r)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?tc._fromErrorAndOperation(r,i,e,n):i})}/**
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
 */function gI(r){return new Set(r.map(({providerId:e})=>e).filter(e=>!!e))}/**
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
 */async function PN(r,e){const t=ne(r);await xc(!0,t,e);const{providerUserInfo:n}=await OS(t.auth,{idToken:await t.getIdToken(),deleteProvider:[e]}),s=gI(n||[]);return t.providerData=t.providerData.filter(i=>s.has(i.providerId)),s.has("phone")||(t.phoneNumber=null),await t.auth._persistUserIfCurrent(t),t}async function pd(r,e,t=!1){const n=await qn(r,e._linkToIdToken(r.auth,await r.getIdToken()),t);return Qt._forOperation(r,"link",n)}async function xc(r,e,t){await ha(e);const n=gI(e.providerData),s=r===!1?"provider-already-linked":"no-such-provider";j(n.has(t)===r,e.auth,s)}/**
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
 */async function mI(r,e,t=!1){const{auth:n}=r;if(xe(n.app))return Promise.reject(lt(n));const s="reauthenticate";try{const i=await qn(r,pI(n,s,e,r),t);j(i.idToken,n,"internal-error");const o=Vc(i.idToken);j(o,n,"internal-error");const{sub:a}=o;return j(r.uid===a,n,"user-mismatch"),Qt._forOperation(r,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&kt(n,"user-mismatch"),i}}/**
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
 */async function _I(r,e,t=!1){if(xe(r.app))return Promise.reject(lt(r));const n="signIn",s=await pI(r,n,e),i=await Qt._fromIdTokenResponse(r,n,s);return t||await r._updateCurrentUser(i.user),i}async function Mc(r,e){return _I(qe(r),e)}async function EI(r,e){const t=ne(r);return await xc(!1,t,e.providerId),pd(t,e)}async function II(r,e){return mI(ne(r),e)}/**
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
 */async function bN(r,e){return Qn(r,"POST","/v1/accounts:signInWithCustomToken",Ve(r,e))}/**
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
 */async function SN(r,e){if(xe(r.app))return Promise.reject(lt(r));const t=qe(r),n=await bN(t,{token:e,returnSecureToken:!0}),s=await Qt._fromIdTokenResponse(t,"signIn",n);return await t._updateCurrentUser(s.user),s}/**
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
 */class Va{constructor(e,t){this.factorId=e,this.uid=t.mfaEnrollmentId,this.enrollmentTime=new Date(t.enrolledAt).toUTCString(),this.displayName=t.displayName}static _fromServerResponse(e,t){return"phoneInfo"in t?gd._fromServerResponse(e,t):"totpInfo"in t?md._fromServerResponse(e,t):kt(e,"internal-error")}}class gd extends Va{constructor(e){super("phone",e),this.phoneNumber=e.phoneInfo}static _fromServerResponse(e,t){return new gd(t)}}class md extends Va{constructor(e){super("totp",e)}static _fromServerResponse(e,t){return new md(t)}}/**
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
 */function Gc(r,e,t){var n;j(((n=t.url)==null?void 0:n.length)>0,r,"invalid-continue-uri"),j(typeof t.dynamicLinkDomain>"u"||t.dynamicLinkDomain.length>0,r,"invalid-dynamic-link-domain"),j(typeof t.linkDomain>"u"||t.linkDomain.length>0,r,"invalid-hosting-link-domain"),e.continueUrl=t.url,e.dynamicLinkDomain=t.dynamicLinkDomain,e.linkDomain=t.linkDomain,e.canHandleCodeInApp=t.handleCodeInApp,t.iOS&&(j(t.iOS.bundleId.length>0,r,"missing-ios-bundle-id"),e.iOSBundleId=t.iOS.bundleId),t.android&&(j(t.android.packageName.length>0,r,"missing-android-pkg-name"),e.androidInstallApp=t.android.installApp,e.androidMinimumVersionCode=t.android.minimumVersion,e.androidPackageName=t.android.packageName)}/**
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
 */async function _d(r){const e=qe(r);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function NN(r,e,t){const n=qe(r),s={requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"};t&&Gc(n,s,t),await Er(n,s,"getOobCode",dN,"EMAIL_PASSWORD_PROVIDER")}async function ON(r,e,t){await fI(ne(r),{oobCode:e,newPassword:t}).catch(async n=>{throw n.code==="auth/password-does-not-meet-requirements"&&_d(r),n})}async function FN(r,e){await lN(ne(r),{oobCode:e})}async function DI(r,e){const t=ne(r),n=await fI(t,{oobCode:e}),s=n.requestType;switch(j(s,t,"internal-error"),s){case"EMAIL_SIGNIN":break;case"VERIFY_AND_CHANGE_EMAIL":j(n.newEmail,t,"internal-error");break;case"REVERT_SECOND_FACTOR_ADDITION":j(n.mfaInfo,t,"internal-error");default:j(n.email,t,"internal-error")}let i=null;return n.mfaInfo&&(i=Va._fromServerResponse(qe(t),n.mfaInfo)),{data:{email:(n.requestType==="VERIFY_AND_CHANGE_EMAIL"?n.newEmail:n.email)||null,previousEmail:(n.requestType==="VERIFY_AND_CHANGE_EMAIL"?n.email:n.newEmail)||null,multiFactorInfo:i},operation:s}}async function LN(r,e){const{data:t}=await DI(ne(r),e);return t.email}async function VN(r,e,t){if(xe(r.app))return Promise.reject(lt(r));const n=qe(r),o=await Er(n,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",CI,"EMAIL_PASSWORD_PROVIDER").catch(u=>{throw u.code==="auth/password-does-not-meet-requirements"&&_d(r),u}),a=await Qt._fromIdTokenResponse(n,"signIn",o);return await n._updateCurrentUser(a.user),a}function kN(r,e,t){return xe(r.app)?Promise.reject(lt(r)):Mc(ne(r),Gr.credential(e,t)).catch(async n=>{throw n.code==="auth/password-does-not-meet-requirements"&&_d(r),n})}/**
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
 */async function xN(r,e,t){const n=qe(r),s={requestType:"EMAIL_SIGNIN",email:e,clientType:"CLIENT_TYPE_WEB"};function i(o,a){j(a.handleCodeInApp,n,"argument-error"),a&&Gc(n,o,a)}i(s,t),await Er(n,s,"getOobCode",fN,"EMAIL_PASSWORD_PROVIDER")}function MN(r,e){const t=Yi.parseLink(e);return(t==null?void 0:t.operation)==="EMAIL_SIGNIN"}async function GN(r,e,t){if(xe(r.app))return Promise.reject(lt(r));const n=ne(r),s=Gr.credentialWithLink(e,t||Ba());return j(s._tenantId===(n.tenantId||null),n,"tenant-id-mismatch"),Mc(n,s)}/**
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
 */async function UN(r,e){return ke(r,"POST","/v1/accounts:createAuthUri",Ve(r,e))}/**
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
 */async function HN(r,e){const t=hd()?Ba():"http://localhost",n={identifier:e,continueUri:t},{signinMethods:s}=await UN(ne(r),n);return s||[]}async function qN(r,e){const t=ne(r),s={requestType:"VERIFY_EMAIL",idToken:await r.getIdToken()};e&&Gc(t.auth,s,e);const{email:i}=await hN(t.auth,s);i!==r.email&&await r.reload()}async function jN(r,e,t){const n=ne(r),i={requestType:"VERIFY_AND_CHANGE_EMAIL",idToken:await r.getIdToken(),newEmail:e};t&&Gc(n.auth,i,t);const{email:o}=await CN(n.auth,i);o!==r.email&&await r.reload()}/**
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
 */async function JN(r,e){return ke(r,"POST","/v1/accounts:update",e)}/**
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
 */async function KN(r,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;const n=ne(r),i={idToken:await n.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},o=await qn(n,JN(n.auth,i));n.displayName=o.displayName||null,n.photoURL=o.photoUrl||null;const a=n.providerData.find(({providerId:u})=>u==="password");a&&(a.displayName=n.displayName,a.photoURL=n.photoURL),await n._updateTokensIfNecessary(o)}function zN(r,e){const t=ne(r);return xe(t.auth.app)?Promise.reject(lt(t.auth)):yI(t,e,null)}function QN(r,e){return yI(ne(r),null,e)}async function yI(r,e,t){const{auth:n}=r,i={idToken:await r.getIdToken(),returnSecureToken:!0};e&&(i.email=e),t&&(i.password=t);const o=await qn(r,uN(n,i));await r._updateTokensIfNecessary(o,!0)}/**
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
 */function WN(r){var s,i;if(!r)return null;const{providerId:e}=r,t=r.rawUserInfo?JSON.parse(r.rawUserInfo):{},n=r.isNewUser||r.kind==="identitytoolkit#SignupNewUserResponse";if(!e&&(r!=null&&r.idToken)){const o=(i=(s=Vc(r.idToken))==null?void 0:s.firebase)==null?void 0:i.sign_in_provider;if(o){const a=o!=="anonymous"&&o!=="custom"?o:null;return new ni(n,a)}}if(!e)return null;switch(e){case"facebook.com":return new $N(n,t);case"github.com":return new YN(n,t);case"google.com":return new XN(n,t);case"twitter.com":return new ZN(n,t,r.screenName||null);case"custom":case"anonymous":return new ni(n,null);default:return new ni(n,e,t)}}class ni{constructor(e,t,n={}){this.isNewUser=e,this.providerId=t,this.profile=n}}class wI extends ni{constructor(e,t,n,s){super(e,t,n),this.username=s}}class $N extends ni{constructor(e,t){super(e,"facebook.com",t)}}class YN extends wI{constructor(e,t){super(e,"github.com",t,typeof(t==null?void 0:t.login)=="string"?t==null?void 0:t.login:null)}}class XN extends ni{constructor(e,t){super(e,"google.com",t)}}class ZN extends wI{constructor(e,t,n){super(e,"twitter.com",t,n)}}function eO(r){const{user:e,_tokenResponse:t}=r;return e.isAnonymous&&!t?{providerId:null,isNewUser:!1,profile:null}:WN(t)}/**
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
 */function tO(r,e){return ne(r).setPersistence(e)}function nO(r){return lI(r)}async function rO(r,e){return qe(r).validatePassword(e)}function TI(r,e,t,n){return ne(r).onIdTokenChanged(e,t,n)}function AI(r,e,t){return ne(r).beforeAuthStateChanged(e,t)}function sO(r,e,t,n){return ne(r).onAuthStateChanged(e,t,n)}function iO(r){ne(r).useDeviceLanguage()}function oO(r,e){return ne(r).updateCurrentUser(e)}function aO(r){return ne(r).signOut()}function uO(r,e){return qe(r).revokeAccessToken(e)}async function cO(r){return ne(r).delete()}/**
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
 */class is{constructor(e,t,n){this.type=e,this.credential=t,this.user=n}static _fromIdtoken(e,t){return new is("enroll",e,t)}static _fromMfaPendingCredential(e){return new is("signin",e)}toJSON(){return{multiFactorSession:{[this.type==="enroll"?"idToken":"pendingCredential"]:this.credential}}}static fromJSON(e){var t,n;if(e!=null&&e.multiFactorSession){if((t=e.multiFactorSession)!=null&&t.pendingCredential)return is._fromMfaPendingCredential(e.multiFactorSession.pendingCredential);if((n=e.multiFactorSession)!=null&&n.idToken)return is._fromIdtoken(e.multiFactorSession.idToken)}return null}}/**
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
 */class Ed{constructor(e,t,n){this.session=e,this.hints=t,this.signInResolver=n}static _fromError(e,t){const n=qe(e),s=t.customData._serverResponse,i=(s.mfaInfo||[]).map(a=>Va._fromServerResponse(n,a));j(s.mfaPendingCredential,n,"internal-error");const o=is._fromMfaPendingCredential(s.mfaPendingCredential);return new Ed(o,i,async a=>{const u=await a._process(n,o);delete s.mfaInfo,delete s.mfaPendingCredential;const l={...s,idToken:u.idToken,refreshToken:u.refreshToken};switch(t.operationType){case"signIn":const B=await Qt._fromIdTokenResponse(n,t.operationType,l);return await n._updateCurrentUser(B.user),B;case"reauthenticate":return j(t.user,n,"internal-error"),Qt._forOperation(t.user,t.operationType,l);default:kt(n,"internal-error")}})}async resolveSignIn(e){const t=e;return this.signInResolver(t)}}function lO(r,e){var s;const t=ne(r),n=e;return j(e.customData.operationType,t,"argument-error"),j((s=n.customData._serverResponse)==null?void 0:s.mfaPendingCredential,t,"argument-error"),Ed._fromError(t,n)}/**
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
 */function jp(r,e){return ke(r,"POST","/v2/accounts/mfaEnrollment:start",Ve(r,e))}function BO(r,e){return ke(r,"POST","/v2/accounts/mfaEnrollment:finalize",Ve(r,e))}function hO(r,e){return ke(r,"POST","/v2/accounts/mfaEnrollment:start",Ve(r,e))}function dO(r,e){return ke(r,"POST","/v2/accounts/mfaEnrollment:finalize",Ve(r,e))}function fO(r,e){return ke(r,"POST","/v2/accounts/mfaEnrollment:withdraw",Ve(r,e))}class Id{constructor(e){this.user=e,this.enrolledFactors=[],e._onReload(t=>{t.mfaInfo&&(this.enrolledFactors=t.mfaInfo.map(n=>Va._fromServerResponse(e.auth,n)))})}static _fromUser(e){return new Id(e)}async getSession(){return is._fromIdtoken(await this.user.getIdToken(),this.user)}async enroll(e,t){const n=e,s=await this.getSession(),i=await qn(this.user,n._process(this.user.auth,s,t));return await this.user._updateTokensIfNecessary(i),this.user.reload()}async unenroll(e){const t=typeof e=="string"?e:e.uid,n=await this.user.getIdToken();try{const s=await qn(this.user,fO(this.user.auth,{idToken:n,mfaEnrollmentId:t}));this.enrolledFactors=this.enrolledFactors.filter(({uid:i})=>i!==t),await this.user._updateTokensIfNecessary(s),await this.user.reload()}catch(s){throw s}}}const Ll=new WeakMap;function CO(r){const e=ne(r);return Ll.has(e)||Ll.set(e,Id._fromUser(e)),Ll.get(e)}const nc="__sak";/**
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
 */class vI{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(nc,"1"),this.storage.removeItem(nc),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const pO=1e3,gO=10;class RI extends vI{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=aI(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const n=this.storage.getItem(t),s=this.localCache[t];n!==s&&e(t,s,n)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,a,u)=>{this.notifyListeners(o,u)});return}const n=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(n);!t&&this.localCache[n]===o||this.notifyListeners(n,o)},i=this.storage.getItem(n);US()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,gO):s()}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const s of Array.from(n))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:n}),!0)})},pO)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}RI.type="LOCAL";const PI=RI;/**
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
 */const mO=1e3;function Vl(r){var n;const e=r.replace(/[\\^$.*+?()[\]{}|]/g,"\\$&"),t=RegExp(`${e}=([^;]+)`);return((n=document.cookie.match(t))==null?void 0:n[1])??null}function kl(r){return`${window.location.protocol==="http:"?"__dev_":"__HOST-"}FIREBASE_${r.split(":")[3]}`}class bI{constructor(){this.type="COOKIE",this.listenerUnsubscribes=new Map}_getFinalTarget(e){if(typeof window===void 0)return e;const t=new URL(`${window.location.origin}/__cookies__`);return t.searchParams.set("finalTarget",e),t}async _isAvailable(){return typeof isSecureContext=="boolean"&&!isSecureContext||typeof navigator>"u"||typeof document>"u"?!1:navigator.cookieEnabled??!0}async _set(e,t){}async _get(e){if(!this._isAvailable())return null;const t=kl(e);if(window.cookieStore){const n=await window.cookieStore.get(t);return n==null?void 0:n.value}return Vl(t)}async _remove(e){if(!this._isAvailable()||!await this._get(e))return;const n=kl(e);document.cookie=`${n}=;Max-Age=34560000;Partitioned;Secure;SameSite=Strict;Path=/;Priority=High`,await fetch("/__cookies__",{method:"DELETE"}).catch(()=>{})}_addListener(e,t){if(!this._isAvailable())return;const n=kl(e);if(window.cookieStore){const a=(l=>{const B=l.changed.find(C=>C.name===n);B&&t(B.value),l.deleted.find(C=>C.name===n)&&t(null)}),u=()=>window.cookieStore.removeEventListener("change",a);return this.listenerUnsubscribes.set(t,u),window.cookieStore.addEventListener("change",a)}let s=Vl(n);const i=setInterval(()=>{const a=Vl(n);a!==s&&(t(a),s=a)},mO),o=()=>clearInterval(i);this.listenerUnsubscribes.set(t,o)}_removeListener(e,t){const n=this.listenerUnsubscribes.get(t);n&&(n(),this.listenerUnsubscribes.delete(t))}}bI.type="COOKIE";const _O=bI;/**
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
 */class SI extends vI{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}SI.type="SESSION";const Dd=SI;/**
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
 */function EO(r){return Promise.all(r.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class Uc{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const n=new Uc(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:n,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:n,eventType:s});const a=Array.from(o).map(async l=>l(t.origin,i)),u=await EO(a);t.ports[0].postMessage({status:"done",eventId:n,eventType:s,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Uc.receivers=[];/**
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
 */function Hc(r="",e=10){let t="";for(let n=0;n<e;n++)t+=Math.floor(Math.random()*10);return r+t}/**
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
 */class IO{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,n=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((a,u)=>{const l=Hc("",20);s.port1.start();const B=setTimeout(()=>{u(new Error("unsupported_event"))},n);o={messageChannel:s,onMessage(d){const C=d;if(C.data.eventId===l)switch(C.data.status){case"ack":clearTimeout(B),i=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),a(C.data.response);break;default:clearTimeout(B),clearTimeout(i),u(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:l,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function Qe(){return window}function DO(r){Qe().location.href=r}/**
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
 */function yd(){return typeof Qe().WorkerGlobalScope<"u"&&typeof Qe().importScripts=="function"}async function yO(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function wO(){var r;return((r=navigator==null?void 0:navigator.serviceWorker)==null?void 0:r.controller)||null}function TO(){return yd()?self:null}/**
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
 */const NI="firebaseLocalStorageDb",AO=1,rc="firebaseLocalStorage",OI="fbase_key";class ka{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function qc(r,e){return r.transaction([rc],e?"readwrite":"readonly").objectStore(rc)}function vO(){const r=indexedDB.deleteDatabase(NI);return new ka(r).toPromise()}function FI(){const r=indexedDB.open(NI,AO);return new Promise((e,t)=>{r.addEventListener("error",()=>{t(r.error)}),r.addEventListener("upgradeneeded",()=>{const n=r.result;try{n.createObjectStore(rc,{keyPath:OI})}catch(s){t(s)}}),r.addEventListener("success",async()=>{const n=r.result;n.objectStoreNames.contains(rc)?e(n):(n.close(),await vO(),e(await FI()))})})}async function Jp(r,e,t){const n=qc(r,!0).put({[OI]:e,value:t});return new ka(n).toPromise()}async function RO(r,e){const t=qc(r,!1).get(e),n=await new ka(t).toPromise();return n===void 0?null:n.value}function Kp(r,e){const t=qc(r,!0).delete(e);return new ka(t).toPromise()}const PO=800,bO=3;class LI{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow)),typeof document<"u"&&typeof document.addEventListener=="function"&&document.addEventListener("visibilitychange",this.onVisibilityChange)}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow)),typeof document<"u"&&typeof document.removeEventListener=="function"&&document.removeEventListener("visibilitychange",this.onVisibilityChange)}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isHiding=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isHiding=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isHiding&&(this.isHiding=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this.onVisibilityChange=()=>{typeof document<"u"&&(document.visibilityState==="hidden"?this.onPageHide():document.visibilityState==="visible"&&this.onPageShow())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){if(this.isHiding)throw new Error("Database is closing/hidden");return this.dbPromise?this.dbPromise:(this.dbPromise=FI(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const n=await this._openDb();return await e(n)}catch(n){if(this.isHiding||t++>bO)throw n;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return yd()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Uc._getInstance(TO()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,n;if(this.activeServiceWorker=await yO(),!this.activeServiceWorker)return;this.sender=new IO(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(n=e[0])!=null&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||wO()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await Jp(e,nc,"1"),await Kp(e,nc)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(n=>Jp(n,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(n=>RO(n,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Kp(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isHiding)return[];try{const e=await this._withRetries(s=>{const i=qc(s,!1).getAll();return new ka(i).toPromise()});if(this.isHiding)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],n=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)n.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!n.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}catch(e){return this.isHiding||jE(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const s of Array.from(n))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),PO)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}LI.type="LOCAL";const VI=LI;/**
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
 */function zp(r,e){return ke(r,"POST","/v2/accounts/mfaSignIn:start",Ve(r,e))}function SO(r,e){return ke(r,"POST","/v2/accounts/mfaSignIn:finalize",Ve(r,e))}function NO(r,e){return ke(r,"POST","/v2/accounts/mfaSignIn:finalize",Ve(r,e))}/**
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
 */const xl=cI("rcb"),OO=new Fa(3e4,6e4);class FO{constructor(){var e;this.hostLanguage="",this.counter=0,this.librarySeparatelyLoaded=!!((e=Qe().grecaptcha)!=null&&e.render)}load(e,t=""){return j(LO(t),e,"argument-error"),this.shouldResolveImmediately(t)&&Fp(Qe().grecaptcha)?Promise.resolve(Qe().grecaptcha):new Promise((n,s)=>{const i=Qe().setTimeout(()=>{s(Tt(e,"network-request-failed"))},OO.get());Qe()[xl]=()=>{Qe().clearTimeout(i),delete Qe()[xl];const a=Qe().grecaptcha;if(!a||!Fp(a)){s(Tt(e,"internal-error"));return}const u=a.render;a.render=(l,B)=>{const d=u(l,B);return this.counter++,d},this.hostLanguage=t,n(a)};const o=`${QS()}?${bi({onload:xl,render:"explicit",hl:t})}`;Cd(o).catch(()=>{clearTimeout(i),s(Tt(e,"internal-error"))})})}clearedOneInstance(){this.counter--}shouldResolveImmediately(e){var t;return!!((t=Qe().grecaptcha)!=null&&t.render)&&(e===this.hostLanguage||this.counter>0||this.librarySeparatelyLoaded)}}function LO(r){return r.length<=6&&/^\s*[a-zA-Z0-9\-]*\s*$/.test(r)}class VO{async load(e){return new ZS(e)}clearedOneInstance(){}}/**
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
 */const zo="recaptcha",kO={theme:"light",type:"image"};class xO{constructor(e,t,n={...kO}){this.parameters=n,this.type=zo,this.destroyed=!1,this.widgetId=null,this.tokenChangeListeners=new Set,this.renderPromise=null,this.recaptcha=null,this.auth=qe(e),this.isInvisible=this.parameters.size==="invisible",j(typeof document<"u",this.auth,"operation-not-supported-in-this-environment");const s=typeof t=="string"?document.getElementById(t):t;j(s,this.auth,"argument-error"),this.container=s,this.parameters.callback=this.makeTokenCallback(this.parameters.callback),this._recaptchaLoader=this.auth.settings.appVerificationDisabledForTesting?new VO:new FO,this.validateStartingState()}async verify(){this.assertNotDestroyed();const e=await this.render(),t=this.getAssertedRecaptcha(),n=t.getResponse(e);return n||new Promise(s=>{const i=o=>{o&&(this.tokenChangeListeners.delete(i),s(o))};this.tokenChangeListeners.add(i),this.isInvisible&&t.execute(e)})}render(){try{this.assertNotDestroyed()}catch(e){return Promise.reject(e)}return this.renderPromise?this.renderPromise:(this.renderPromise=this.makeRenderPromise().catch(e=>{throw this.renderPromise=null,e}),this.renderPromise)}_reset(){this.assertNotDestroyed(),this.widgetId!==null&&this.getAssertedRecaptcha().reset(this.widgetId)}clear(){this.assertNotDestroyed(),this.destroyed=!0,this._recaptchaLoader.clearedOneInstance(),this.isInvisible||this.container.childNodes.forEach(e=>{this.container.removeChild(e)})}validateStartingState(){j(!this.parameters.sitekey,this.auth,"argument-error"),j(this.isInvisible||!this.container.hasChildNodes(),this.auth,"argument-error"),j(typeof document<"u",this.auth,"operation-not-supported-in-this-environment")}makeTokenCallback(e){return t=>{if(this.tokenChangeListeners.forEach(n=>n(t)),typeof e=="function")e(t);else if(typeof e=="string"){const n=Qe()[e];typeof n=="function"&&n(t)}}}assertNotDestroyed(){j(!this.destroyed,this.auth,"internal-error")}async makeRenderPromise(){if(await this.init(),!this.widgetId){let e=this.container;if(!this.isInvisible){const t=document.createElement("div");e.appendChild(t),e=t}this.widgetId=this.getAssertedRecaptcha().render(e,this.parameters)}return this.widgetId}async init(){j(hd()&&!yd(),this.auth,"internal-error"),await MO(),this.recaptcha=await this._recaptchaLoader.load(this.auth,this.auth.languageCode||void 0);const e=await SS(this.auth);j(e,this.auth,"internal-error"),this.parameters.sitekey=e}getAssertedRecaptcha(){return j(this.recaptcha,this.auth,"internal-error"),this.recaptcha}}function MO(){let r=null;return new Promise(e=>{if(document.readyState==="complete"){e();return}r=()=>e(),window.addEventListener("load",r)}).catch(e=>{throw r&&window.removeEventListener("load",r),e})}/**
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
 */class wd{constructor(e,t){this.verificationId=e,this.onConfirmation=t}confirm(e){const t=Ir._fromVerification(this.verificationId,e);return this.onConfirmation(t)}}async function GO(r,e,t){if(xe(r.app))return Promise.reject(lt(r));const n=qe(r),s=await jc(n,e,ne(t));return new wd(s,i=>Mc(n,i))}async function UO(r,e,t){const n=ne(r);await xc(!1,n,"phone");const s=await jc(n.auth,e,ne(t));return new wd(s,i=>EI(n,i))}async function HO(r,e,t){const n=ne(r);if(xe(n.auth.app))return Promise.reject(lt(n.auth));const s=await jc(n.auth,e,ne(t));return new wd(s,i=>II(n,i))}async function jc(r,e,t){var n;if(!r._getRecaptchaConfig())try{await lI(r)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let s;if(typeof e=="string"?s={phoneNumber:e}:s=e,"session"in s){const i=s.session;if("phoneNumber"in s){j(i.type==="enroll",r,"internal-error");const o={idToken:i.credential,phoneEnrollmentInfo:{phoneNumber:s.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await Er(r,o,"mfaSmsEnrollment",async(B,d)=>{if(d.phoneEnrollmentInfo.captchaResponse===Jo){j((t==null?void 0:t.type)===zo,B,"argument-error");const C=await Ml(B,d,t);return jp(B,C)}return jp(B,d)},"PHONE_PROVIDER").catch(B=>Promise.reject(B))).phoneSessionInfo.sessionInfo}else{j(i.type==="signin",r,"internal-error");const o=((n=s.multiFactorHint)==null?void 0:n.uid)||s.multiFactorUid;j(o,r,"missing-multi-factor-info");const a={mfaPendingCredential:i.credential,mfaEnrollmentId:o,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await Er(r,a,"mfaSmsSignIn",async(d,C)=>{if(C.phoneSignInInfo.captchaResponse===Jo){j((t==null?void 0:t.type)===zo,d,"argument-error");const g=await Ml(d,C,t);return zp(d,g)}return zp(d,C)},"PHONE_PROVIDER").catch(d=>Promise.reject(d))).phoneResponseInfo.sessionInfo}}else{const i={phoneNumber:s.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await Er(r,i,"sendVerificationCode",async(l,B)=>{if(B.captchaResponse===Jo){j((t==null?void 0:t.type)===zo,l,"argument-error");const d=await Ml(l,B,t);return Hp(l,d)}return Hp(l,B)},"PHONE_PROVIDER").catch(l=>Promise.reject(l))).sessionInfo}}finally{t==null||t._reset()}}async function qO(r,e){const t=ne(r);if(xe(t.auth.app))return Promise.reject(lt(t.auth));await pd(t,e)}async function Ml(r,e,t){j(t.type===zo,r,"argument-error");const n=await t.verify();j(typeof n=="string",r,"argument-error");const s={...e};if("phoneEnrollmentInfo"in s){const i=s.phoneEnrollmentInfo.phoneNumber,o=s.phoneEnrollmentInfo.captchaResponse,a=s.phoneEnrollmentInfo.clientType,u=s.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(s,{phoneEnrollmentInfo:{phoneNumber:i,recaptchaToken:n,captchaResponse:o,clientType:a,recaptchaVersion:u}}),s}else if("phoneSignInInfo"in s){const i=s.phoneSignInInfo.captchaResponse,o=s.phoneSignInInfo.clientType,a=s.phoneSignInInfo.recaptchaVersion;return Object.assign(s,{phoneSignInInfo:{recaptchaToken:n,captchaResponse:i,clientType:o,recaptchaVersion:a}}),s}else return Object.assign(s,{recaptchaToken:n}),s}/**
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
 */class ls{constructor(e){this.providerId=ls.PROVIDER_ID,this.auth=qe(e)}verifyPhoneNumber(e,t){return jc(this.auth,e,ne(t))}static credential(e,t){return Ir._fromVerification(e,t)}static credentialFromResult(e){const t=e;return ls.credentialFromTaggedObject(t)}static credentialFromError(e){return ls.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{phoneNumber:t,temporaryProof:n}=e;return t&&n?Ir._fromTokenResponse(t,n):null}}ls.PROVIDER_ID="phone";ls.PHONE_SIGN_IN_METHOD="phone";/**
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
 */function Os(r,e){return e?Nn(e):(j(r._popupRedirectResolver,r,"argument-error"),r._popupRedirectResolver)}/**
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
 */class Td extends $i{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Vn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Vn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Vn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function jO(r){return _I(r.auth,new Td(r),r.bypassAuthState)}function JO(r){const{auth:e,user:t}=r;return j(t,e,"internal-error"),mI(t,new Td(r),r.bypassAuthState)}async function KO(r){const{auth:e,user:t}=r;return j(t,e,"internal-error"),pd(t,new Td(r),r.bypassAuthState)}/**
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
 */class kI{constructor(e,t,n,s,i=!1){this.auth=e,this.resolver=n,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(n){this.reject(n)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:n,postBody:s,tenantId:i,error:o,type:a}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:t,sessionId:n,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(u))}catch(l){this.reject(l)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return jO;case"linkViaPopup":case"linkViaRedirect":return KO;case"reauthViaPopup":case"reauthViaRedirect":return JO;default:kt(this.auth,"internal-error")}}resolve(e){Hn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Hn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const zO=new Fa(2e3,1e4);async function QO(r,e,t){if(xe(r.app))return Promise.reject(Tt(r,"operation-not-supported-in-this-environment"));const n=qe(r);Wi(r,e,Wn);const s=Os(n,t);return new On(n,"signInViaPopup",e,s).executeNotNull()}async function WO(r,e,t){const n=ne(r);if(xe(n.auth.app))return Promise.reject(Tt(n.auth,"operation-not-supported-in-this-environment"));Wi(n.auth,e,Wn);const s=Os(n.auth,t);return new On(n.auth,"reauthViaPopup",e,s,n).executeNotNull()}async function $O(r,e,t){const n=ne(r);Wi(n.auth,e,Wn);const s=Os(n.auth,t);return new On(n.auth,"linkViaPopup",e,s,n).executeNotNull()}class On extends kI{constructor(e,t,n,s,i){super(e,t,s,i),this.provider=n,this.authWindow=null,this.pollId=null,On.currentPopupAction&&On.currentPopupAction.cancel(),On.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return j(e,this.auth,"internal-error"),e}async onExecution(){Hn(this.filter.length===1,"Popup operations only handle one event");const e=Hc();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Tt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(Tt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,On.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,n;if((n=(t=this.authWindow)==null?void 0:t.window)!=null&&n.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Tt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,zO.get())};e()}}On.currentPopupAction=null;/**
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
 */const YO="pendingRedirect",Ru=new Map;class XO extends kI{constructor(e,t,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,n),this.eventId=null}async execute(){let e=Ru.get(this.auth._key());if(!e){try{const n=await ZO(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(n)}catch(t){e=()=>Promise.reject(t)}Ru.set(this.auth._key(),e)}return this.bypassAuthState||Ru.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function ZO(r,e){const t=MI(e),n=xI(r);if(!await n._isAvailable())return!1;const s=await n._get(t)==="true";return await n._remove(t),s}async function Ad(r,e){return xI(r)._set(MI(e),"true")}function e0(r,e){Ru.set(r._key(),e)}function xI(r){return Nn(r._redirectPersistence)}function MI(r){return vu(YO,r.config.apiKey,r.name)}/**
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
 */function t0(r,e,t){return n0(r,e,t)}async function n0(r,e,t){if(xe(r.app))return Promise.reject(lt(r));const n=qe(r);Wi(r,e,Wn),await n._initializationPromise;const s=Os(n,t);return await Ad(s,n),s._openRedirect(n,e,"signInViaRedirect")}function r0(r,e,t){return s0(r,e,t)}async function s0(r,e,t){const n=ne(r);if(Wi(n.auth,e,Wn),xe(n.auth.app))return Promise.reject(lt(n.auth));await n.auth._initializationPromise;const s=Os(n.auth,t);await Ad(s,n.auth);const i=await UI(n);return s._openRedirect(n.auth,e,"reauthViaRedirect",i)}function i0(r,e,t){return o0(r,e,t)}async function o0(r,e,t){const n=ne(r);Wi(n.auth,e,Wn),await n.auth._initializationPromise;const s=Os(n.auth,t);await xc(!1,n,e.providerId),await Ad(s,n.auth);const i=await UI(n);return s._openRedirect(n.auth,e,"linkViaRedirect",i)}async function a0(r,e){return await qe(r)._initializationPromise,GI(r,e,!1)}async function GI(r,e,t=!1){if(xe(r.app))return Promise.reject(lt(r));const n=qe(r),s=Os(n,e),o=await new XO(n,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await n._persistUserIfCurrent(o.user),await n._setRedirectUser(null,e)),o}async function UI(r){const e=Hc(`${r.uid}:::`);return r._redirectEventId=e,await r.auth._setRedirectUser(r),await r.auth._persistUserIfCurrent(r),e}/**
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
 */const u0=600*1e3;class c0{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(t=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!l0(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var n;if(e.error&&!HI(e)){const s=((n=e.error.code)==null?void 0:n.split("auth/")[1])||"internal-error";t.onError(Tt(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const n=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=u0&&this.cachedEventUids.clear(),this.cachedEventUids.has(Qp(e))}saveEventToCache(e){this.cachedEventUids.add(Qp(e)),this.lastProcessedEventTime=Date.now()}}function Qp(r){return[r.type,r.eventId,r.sessionId,r.tenantId].filter(e=>e).join("-")}function HI({type:r,error:e}){return r==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function l0(r){switch(r.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return HI(r);default:return!1}}/**
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
 */async function B0(r,e={}){return ke(r,"GET","/v1/projects",e)}/**
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
 */const h0=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,d0=/^https?/;async function f0(r){if(r.config.emulator)return;const{authorizedDomains:e}=await B0(r);for(const t of e)try{if(C0(t))return}catch{}kt(r,"unauthorized-domain")}function C0(r){const e=Ba(),{protocol:t,hostname:n}=new URL(e);if(r.startsWith("chrome-extension://")){const o=new URL(r);return o.hostname===""&&n===""?t==="chrome-extension:"&&r.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===n}if(!d0.test(t))return!1;if(h0.test(r))return n===r;const s=r.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(n)}/**
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
 */const p0=new Fa(3e4,6e4);function Wp(){const r=Qe().___jsl;if(r!=null&&r.H){for(const e of Object.keys(r.H))if(r.H[e].r=r.H[e].r||[],r.H[e].L=r.H[e].L||[],r.H[e].r=[...r.H[e].L],r.CP)for(let t=0;t<r.CP.length;t++)r.CP[t]=null}}function g0(r){return new Promise((e,t)=>{var s,i,o;function n(){Wp(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Wp(),t(Tt(r,"network-request-failed"))},timeout:p0.get()})}if((i=(s=Qe().gapi)==null?void 0:s.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((o=Qe().gapi)!=null&&o.load)n();else{const a=cI("iframefcb");return Qe()[a]=()=>{gapi.load?n():t(Tt(r,"network-request-failed"))},Cd(`${$S()}?onload=${a}`).catch(u=>t(u))}}).catch(e=>{throw Pu=null,e})}let Pu=null;function m0(r){return Pu=Pu||g0(r),Pu}/**
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
 */const _0=new Fa(5e3,15e3),E0="__/auth/iframe",I0="emulator/auth/iframe",D0={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},y0=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function w0(r){const e=r.config;j(e.authDomain,r,"auth-domain-config-required");const t=e.emulator?dd(e,I0):`https://${r.config.authDomain}/${E0}`,n={apiKey:e.apiKey,appName:r.name,v:ys},s=y0.get(r.config.apiHost);s&&(n.eid=s);const i=r._getFrameworks();return i.length&&(n.fw=i.join(",")),`${t}?${bi(n).slice(1)}`}async function T0(r){const e=await m0(r),t=Qe().gapi;return j(t,r,"internal-error"),e.open({where:document.body,url:w0(r),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:D0,dontclear:!0},n=>new Promise(async(s,i)=>{await n.restyle({setHideOnLeave:!1});const o=Tt(r,"network-request-failed"),a=Qe().setTimeout(()=>{i(o)},_0.get());function u(){Qe().clearTimeout(a),s(n)}n.ping(u).then(u,()=>{i(o)})}))}/**
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
 */const A0={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},v0=500,R0=600,P0="_blank",b0="http://localhost";class $p{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function S0(r,e,t,n=v0,s=R0){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-n)/2,0).toString();let a="";const u={...A0,width:n.toString(),height:s.toString(),top:i,left:o},l=tt().toLowerCase();t&&(a=nI(l)?P0:t),eI(l)&&(e=e||b0,u.scrollbars="yes");const B=Object.entries(u).reduce((C,[g,D])=>`${C}${g}=${D},`,"");if(GS(l)&&a!=="_self")return N0(e||"",a),new $p(null);const d=window.open(e||"",a,B);j(d,r,"popup-blocked");try{d.focus()}catch{}return new $p(d)}function N0(r,e){const t=document.createElement("a");t.href=r,t.target=e;const n=document.createEvent("MouseEvent");n.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(n)}/**
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
 */const O0="__/auth/handler",F0="emulator/auth/handler",L0=encodeURIComponent("fac");async function Yp(r,e,t,n,s,i){j(r.config.authDomain,r,"auth-domain-config-required"),j(r.config.apiKey,r,"invalid-api-key");const o={apiKey:r.config.apiKey,appName:r.name,authType:t,redirectUrl:n,v:ys,eventId:s};if(e instanceof Wn){e.setDefaultLanguage(r.languageCode),o.providerId=e.providerId||"",JD(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[B,d]of Object.entries({}))o[B]=d}if(e instanceof Xi){const B=e.getScopes().filter(d=>d!=="");B.length>0&&(o.scopes=B.join(","))}r.tenantId&&(o.tid=r.tenantId);const a=o;for(const B of Object.keys(a))a[B]===void 0&&delete a[B];const u=await r._getAppCheckToken(),l=u?`#${L0}=${encodeURIComponent(u)}`:"";return`${V0(r)}?${bi(a).slice(1)}${l}`}function V0({config:r}){return r.emulator?dd(r,F0):`https://${r.authDomain}/${O0}`}/**
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
 */const Gl="webStorageSupport";class k0{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Dd,this._completeRedirectFn=GI,this._overrideRedirectResult=e0}async _openPopup(e,t,n,s){var o;Hn((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const i=await Yp(e,t,n,Ba(),s);return S0(e,i,Hc())}async _openRedirect(e,t,n,s){await this._originValidation(e);const i=await Yp(e,t,n,Ba(),s);return DO(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(Hn(i,"If manager is not set, promise should be"),i)}const n=this.initAndGetManager(e);return this.eventManagers[t]={promise:n},n.catch(()=>{delete this.eventManagers[t]}),n}async initAndGetManager(e){const t=await T0(e),n=new c0(e);return t.register("authEvent",s=>(j(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:n.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=t,n}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Gl,{type:Gl},s=>{var o;const i=(o=s==null?void 0:s[0])==null?void 0:o[Gl];i!==void 0&&t(!!i),kt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=f0(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return aI()||tI()||fd()}}const qI=k0;class jI{constructor(e){this.factorId=e}_process(e,t,n){switch(t.type){case"enroll":return this._finalizeEnroll(e,t.credential,n);case"signin":return this._finalizeSignIn(e,t.credential);default:return Bn("unexpected MultiFactorSessionType")}}}class vd extends jI{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new vd(e)}_finalizeEnroll(e,t,n){return BO(e,{idToken:t,displayName:n,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,t){return SO(e,{mfaPendingCredential:t,phoneVerificationInfo:this.credential._makeVerificationRequest()})}}class JI{constructor(){}static assertion(e){return vd._fromCredential(e)}}JI.FACTOR_ID="phone";class KI{static assertionForEnrollment(e,t){return fa._fromSecret(e,t)}static assertionForSignIn(e,t){return fa._fromEnrollmentId(e,t)}static async generateSecret(e){var s;const t=e;j(typeof((s=t.user)==null?void 0:s.auth)<"u","internal-error");const n=await hO(t.user.auth,{idToken:t.credential,totpEnrollmentInfo:{}});return Jc._fromStartTotpMfaEnrollmentResponse(n,t.user.auth)}}KI.FACTOR_ID="totp";class fa extends jI{constructor(e,t,n){super("totp"),this.otp=e,this.enrollmentId=t,this.secret=n}static _fromSecret(e,t){return new fa(t,void 0,e)}static _fromEnrollmentId(e,t){return new fa(t,e)}async _finalizeEnroll(e,t,n){return j(typeof this.secret<"u",e,"argument-error"),dO(e,{idToken:t,displayName:n,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,t){j(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");const n={verificationCode:this.otp};return NO(e,{mfaPendingCredential:t,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:n})}}class Jc{constructor(e,t,n,s,i,o,a){this.sessionInfo=o,this.auth=a,this.secretKey=e,this.hashingAlgorithm=t,this.codeLength=n,this.codeIntervalSeconds=s,this.enrollmentCompletionDeadline=i}static _fromStartTotpMfaEnrollmentResponse(e,t){return new Jc(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,t)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,t){var s;let n=!1;return(Cu(e)||Cu(t))&&(n=!0),n&&(Cu(e)&&(e=((s=this.auth.currentUser)==null?void 0:s.email)||"unknownuser"),Cu(t)&&(t=this.auth.name)),`otpauth://totp/${t}:${e}?secret=${this.secretKey}&issuer=${t}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}}function Cu(r){return typeof r>"u"||(r==null?void 0:r.length)===0}var Xp="@firebase/auth",Zp="1.13.4";/**
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
 */class x0{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(n=>{e((n==null?void 0:n.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){j(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function M0(r){switch(r){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function G0(r){hs(new Bs("auth",(e,{options:t})=>{const n=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=n.options;j(o&&!o.includes(":"),"invalid-api-key",{appName:n.name});const u={apiKey:o,authDomain:a,clientPlatform:r,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:uI(r)},l=new KS(n,s,i,u);return iN(l,t),l},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,n)=>{e.getProvider("auth-internal").initialize()})),hs(new Bs("auth-internal",e=>{const t=qe(e.getProvider("auth").getImmediate());return(n=>new x0(n))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),dn(Xp,Zp,M0(r)),dn(Xp,Zp,"esm2020")}/**
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
 */const U0=300,H0=ig("authIdTokenMaxAge")||U0;let eg=null;const q0=r=>async e=>{const t=e&&await e.getIdTokenResult(),n=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(n&&n>H0)return;const s=t==null?void 0:t.token;eg!==s&&(eg=s,await fetch(r,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function j0(r=LB()){const e=Ni(r,"auth");if(e.isInitialized())return e.getImmediate();const t=BI(r,{popupRedirectResolver:qI,persistence:[VI,PI,Dd]}),n=ig("authTokenSyncURL");if(n&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(n,location.origin);if(location.origin===i.origin){const o=q0(i.toString());AI(t,o,()=>o(t.currentUser)),TI(t,a=>o(a))}}const s=sg("auth");return s&&hI(t,`http://${s}`),t}function J0(){var r;return((r=document.getElementsByTagName("head"))==null?void 0:r[0])??document}zS({loadJS(r){return new Promise((e,t)=>{const n=document.createElement("script");n.setAttribute("src",r),n.onload=e,n.onerror=s=>{const i=Tt("internal-error");i.customData=s,t(i)},n.type="text/javascript",n.charset="UTF-8",J0().appendChild(n)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});G0("Browser");const tF=Object.freeze(Object.defineProperty({__proto__:null,ActionCodeOperation:ES,ActionCodeURL:Yi,AuthCredential:$i,AuthErrorCodes:yS,EmailAuthCredential:Pi,EmailAuthProvider:Gr,FacebookAuthProvider:An,FactorId:pS,GithubAuthProvider:Rn,GoogleAuthProvider:vn,OAuthCredential:En,OAuthProvider:Ko,OperationType:_S,PhoneAuthCredential:Ir,PhoneAuthProvider:ls,PhoneMultiFactorGenerator:JI,ProviderId:gS,RecaptchaVerifier:xO,SAMLAuthProvider:ec,SignInMethod:mS,TotpMultiFactorGenerator:KI,TotpSecret:Jc,TwitterAuthProvider:Pn,applyActionCode:FN,beforeAuthStateChanged:AI,browserCookiePersistence:_O,browserLocalPersistence:PI,browserPopupRedirectResolver:qI,browserSessionPersistence:Dd,checkActionCode:DI,confirmPasswordReset:ON,connectAuthEmulator:hI,createUserWithEmailAndPassword:VN,debugErrorMap:DS,deleteUser:cO,fetchSignInMethodsForEmail:HN,getAdditionalUserInfo:eO,getAuth:j0,getIdToken:FS,getIdTokenResult:$E,getMultiFactorResolver:lO,getRedirectResult:a0,inMemoryPersistence:vB,indexedDBLocalPersistence:VI,initializeAuth:BI,initializeRecaptchaConfig:nO,isSignInWithEmailLink:MN,linkWithCredential:EI,linkWithPhoneNumber:UO,linkWithPopup:$O,linkWithRedirect:i0,multiFactor:CO,onAuthStateChanged:sO,onIdTokenChanged:TI,parseActionCodeURL:TN,prodErrorMap:HE,reauthenticateWithCredential:II,reauthenticateWithPhoneNumber:HO,reauthenticateWithPopup:WO,reauthenticateWithRedirect:r0,reload:YE,revokeAccessToken:uO,sendEmailVerification:qN,sendPasswordResetEmail:NN,sendSignInLinkToEmail:xN,setPersistence:tO,signInAnonymously:RN,signInWithCredential:Mc,signInWithCustomToken:SN,signInWithEmailAndPassword:kN,signInWithEmailLink:GN,signInWithPhoneNumber:GO,signInWithPopup:QO,signInWithRedirect:t0,signOut:aO,unlink:PN,updateCurrentUser:oO,updateEmail:zN,updatePassword:QN,updatePhoneNumber:qO,updateProfile:KN,useDeviceLanguage:iO,validatePassword:rO,verifyBeforeUpdateEmail:jN,verifyPasswordResetCode:LN},Symbol.toStringTag,{value:"Module"}));export{xm as A,TB as B,Bs as C,sS as D,Ib as E,In as F,cS as G,$b as H,NN as I,tO as J,PI as K,Dd as L,kN as M,z0 as N,eF as O,tF as P,ys as S,hs as _,xe as a,Ni as b,FD as c,LB as d,LD as e,Wy as f,ne as g,_g as h,Si as i,ib as j,ob as k,j0 as l,Mb as m,eS as n,oA as o,bB as p,iS as q,dn as r,xw as s,Xm as t,rS as u,sO as v,aO as w,Yb as x,gb as y,mb as z};
