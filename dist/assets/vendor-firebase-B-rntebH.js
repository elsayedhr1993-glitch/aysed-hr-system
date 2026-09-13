import{o as Aw,R as Ul}from"./vendor-misc-D72VFbPm.js";const Rw=()=>{};var $f={};/**
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
 */const jm=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},Pw=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=n[t++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=n[t++],o=n[t++],c=n[t++],u=((i&7)<<18|(s&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const s=n[t++],o=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},zm={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){const s=n[i],o=i+1<n.length,c=o?n[i+1]:0,u=i+2<n.length,l=u?n[i+2]:0,d=s>>2,p=(s&3)<<4|c>>4;let m=(c&15)<<2|l>>6,I=l&63;u||(I=64,o||(m=64)),r.push(t[d],t[p],t[m],t[I])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(jm(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Pw(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){const s=t[n.charAt(i++)],c=i<n.length?t[n.charAt(i)]:0;++i;const l=i<n.length?t[n.charAt(i)]:64;++i;const p=i<n.length?t[n.charAt(i)]:64;if(++i,s==null||c==null||l==null||p==null)throw new bw;const m=s<<2|c>>4;if(r.push(m),l!==64){const I=c<<4&240|l>>2;if(r.push(I),p!==64){const P=l<<6&192|p;r.push(P)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class bw extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Sw=function(n){const e=jm(n);return zm.encodeByteArray(e,!0)},Ha=function(n){return Sw(n).replace(/\./g,"")},Bl=function(n){try{return zm.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Gm(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Vw=()=>Gm().__FIREBASE_DEFAULTS__,Cw=()=>{if(typeof process>"u"||typeof $f>"u")return;const n=$f.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Nw=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Bl(n[1]);return e&&JSON.parse(e)},Tc=()=>{try{return Rw()||Vw()||Cw()||Nw()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Wm=n=>{var e,t;return(t=(e=Tc())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},Km=n=>{const e=Wm(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},ql=()=>{var n;return(n=Tc())==null?void 0:n.config},Hm=n=>{var e;return(e=Tc())==null?void 0:e[`_${n}`]};/**
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
 */class Qm{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
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
 */function Jm(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",i=n.iat||0,s=n.sub||n.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...n};return[Ha(JSON.stringify(t)),Ha(JSON.stringify(o)),""].join(".")}/**
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
 */function Me(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Dw(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Me())}function Ym(){var e;const n=(e=Tc())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function kw(){return typeof window<"u"||Xm()}function Xm(){return typeof WorkerGlobalScope<"u"&&typeof self<"u"&&self instanceof WorkerGlobalScope}function xw(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Ow(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Lw(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Mw(){const n=Me();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Zm(){return!Ym()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function eg(){return!Ym()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function tg(){try{return typeof indexedDB=="object"}catch{return!1}}function Fw(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var s;e(((s=i.error)==null?void 0:s.message)||"")}}catch(t){e(t)}})}/**
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
 */const Uw="FirebaseError";class Ot extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Uw,Object.setPrototypeOf(this,Ot.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Mo.prototype.create)}}class Mo{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?Bw(s,r):"Error",c=`${this.serviceName}: ${o} (${i}).`;return new Ot(i,c,r)}}function Bw(n,e){try{let t=0,r="";for(;t<n.length;){const i=n.indexOf("{$",t);if(i===-1){r+=n.substring(t);break}const s=n.indexOf("}",i+2);if(s===-1){r+=n.substring(t);break}const o=n.substring(i+2,s),c=e[o];r+=n.substring(t,i)+(c!=null?String(c):`<${o}?>`),t=s+1}return r}catch{return n}}function qw(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function kt(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const i of t){if(!r.includes(i))return!1;const s=n[i],o=e[i];if(jf(s)&&jf(o)){if(!kt(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!t.includes(i))return!1;return!0}function jf(n){return n!==null&&typeof n=="object"}/**
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
 */function es(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Gs(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,s]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function Ws(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function $w(n,e){const t=new jw(n,e);return t.subscribe.bind(t)}class jw{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");zw(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=Lu),i.error===void 0&&(i.error=Lu),i.complete===void 0&&(i.complete=Lu);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function zw(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Lu(){}/**
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
 */function W(n){return n&&n._delegate?n._delegate:n}/**
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
 */function ur(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function vc(n){return(await fetch(n,{credentials:"include"})).ok}class Qn{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const Ar="[DEFAULT]";/**
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
 */class Gw{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Qm;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Kw(e))try{this.getOrInitializeService({instanceIdentifier:Ar})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=Ar){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Ar){return this.instances.has(e)}getOptions(e=Ar){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[s,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(s);r===c&&o.resolve(i)}return i}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),i=this.onInitCallbacks.get(r)??new Set;i.add(e),this.onInitCallbacks.set(r,i);const s=this.instances.get(r);return s&&e(s,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Ww(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Ar){return this.component?this.component.multipleInstances?e:Ar:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Ww(n){return n===Ar?void 0:n}function Kw(n){return n.instantiationMode==="EAGER"}/**
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
 */class ng{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Gw(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */const $l=[];var ne;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(ne||(ne={}));const rg={debug:ne.DEBUG,verbose:ne.VERBOSE,info:ne.INFO,warn:ne.WARN,error:ne.ERROR,silent:ne.SILENT},Hw=ne.INFO,Qw={[ne.DEBUG]:"log",[ne.VERBOSE]:"log",[ne.INFO]:"info",[ne.WARN]:"warn",[ne.ERROR]:"error"},Jw=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),i=Qw[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class jl{constructor(e){this.name=e,this._logLevel=Hw,this._logHandler=Jw,this._userLogHandler=null,$l.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ne))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?rg[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ne.DEBUG,...e),this._logHandler(this,ne.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ne.VERBOSE,...e),this._logHandler(this,ne.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ne.INFO,...e),this._logHandler(this,ne.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ne.WARN,...e),this._logHandler(this,ne.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ne.ERROR,...e),this._logHandler(this,ne.ERROR,...e)}}function Yw(n){$l.forEach(e=>{e.setLogLevel(n)})}function Xw(n,e){for(const t of $l){let r=null;e&&e.level&&(r=rg[e.level]),n===null?t.userLogHandler=null:t.userLogHandler=(i,s,...o)=>{const c=o.map(u=>{if(u==null)return null;if(typeof u=="string")return u;if(typeof u=="number"||typeof u=="boolean")return u.toString();if(u instanceof Error)return u.message;try{return JSON.stringify(u)}catch{return null}}).filter(u=>u).join(" ");s>=(r??i.logLevel)&&n({level:ne[s].toLowerCase(),message:c,args:o,type:i.name})}}}/**
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
 */class Zw{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(eT(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function eT(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Qa="@firebase/app",rl="0.16.0";/**
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
 */const pn=new jl("@firebase/app"),tT="@firebase/app-compat",nT="@firebase/analytics-compat",rT="@firebase/analytics",iT="@firebase/app-check-compat",sT="@firebase/app-check",oT="@firebase/auth",aT="@firebase/auth-compat",cT="@firebase/database",uT="@firebase/data-connect",lT="@firebase/database-compat",hT="@firebase/functions",dT="@firebase/functions-compat",fT="@firebase/installations",pT="@firebase/installations-compat",mT="@firebase/messaging",gT="@firebase/messaging-compat",_T="@firebase/performance",yT="@firebase/performance-compat",IT="@firebase/remote-config",ET="@firebase/remote-config-compat",wT="@firebase/storage",TT="@firebase/storage-compat",vT="@firebase/firestore",AT="@firebase/ai",RT="@firebase/firestore-compat",PT="firebase",bT="12.17.0";/**
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
 */const _o="[DEFAULT]",ST={[Qa]:"fire-core",[tT]:"fire-core-compat",[rT]:"fire-analytics",[nT]:"fire-analytics-compat",[sT]:"fire-app-check",[iT]:"fire-app-check-compat",[oT]:"fire-auth",[aT]:"fire-auth-compat",[cT]:"fire-rtdb",[uT]:"fire-data-connect",[lT]:"fire-rtdb-compat",[hT]:"fire-fn",[dT]:"fire-fn-compat",[fT]:"fire-iid",[pT]:"fire-iid-compat",[mT]:"fire-fcm",[gT]:"fire-fcm-compat",[_T]:"fire-perf",[yT]:"fire-perf-compat",[IT]:"fire-rc",[ET]:"fire-rc-compat",[wT]:"fire-gcs",[TT]:"fire-gcs-compat",[vT]:"fire-fst",[RT]:"fire-fst-compat",[AT]:"fire-vertex","fire-js":"fire-js",[PT]:"fire-js-all"};/**
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
 */const Jn=new Map,bi=new Map,Si=new Map;function il(n,e){try{n.container.addComponent(e)}catch(t){pn.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function VT(n,e){n.container.addOrOverwriteComponent(e)}function Yn(n){const e=n.name;if(Si.has(e))return pn.debug(`There were multiple attempts to register component ${e}.`),!1;Si.set(e,n);for(const t of Jn.values())il(t,n);for(const t of bi.values())il(t,n);return!0}function Jr(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function ig(n,e,t=_o){Jr(n,e).clearInstance(t)}function zl(n){return n.options!==void 0}function sg(n){return zl(n)?!1:"authIdToken"in n||"appCheckToken"in n||"releaseOnDeref"in n||"automaticDataCollectionEnabled"in n}function _e(n){return n==null?!1:n.settings!==void 0}function CT(){Si.clear()}/**
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
 */const NT={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},lt=new Mo("app","Firebase",NT);/**
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
 */class og{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Qn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw lt.create("app-deleted",{appName:this._name})}}/**
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
 */function zf(n,e){const t=Bl(n.split(".")[1]);if(t===null){console.error(`FirebaseServerApp ${e} is invalid: second part could not be parsed.`);return}if(JSON.parse(t).exp===void 0){console.error(`FirebaseServerApp ${e} is invalid: expiration claim could not be parsed`);return}const i=JSON.parse(t).exp*1e3,s=new Date().getTime();i-s<=0&&console.error(`FirebaseServerApp ${e} is invalid: the token has expired.`)}class DT extends og{constructor(e,t,r,i){const s=t.automaticDataCollectionEnabled!==void 0?t.automaticDataCollectionEnabled:!0,o={name:r,automaticDataCollectionEnabled:s};if(e.apiKey!==void 0)super(e,o,i);else{const c=e;super(c.options,o,i)}this._serverConfig={automaticDataCollectionEnabled:s,...t},this._serverConfig.authIdToken&&zf(this._serverConfig.authIdToken,"authIdToken"),this._serverConfig.appCheckToken&&zf(this._serverConfig.appCheckToken,"appCheckToken"),this._finalizationRegistry=null,typeof FinalizationRegistry<"u"&&(this._finalizationRegistry=new FinalizationRegistry(()=>{this.automaticCleanup()})),this._refCount=0,this.incRefCount(this._serverConfig.releaseOnDeref),this._serverConfig.releaseOnDeref=void 0,t.releaseOnDeref=void 0,Pt(Qa,rl,"serverapp")}toJSON(){}get refCount(){return this._refCount}incRefCount(e){this.isDeleted||(this._refCount++,e!==void 0&&this._finalizationRegistry!==null&&this._finalizationRegistry.register(e,this))}decRefCount(){return this.isDeleted?0:--this._refCount}automaticCleanup(){cg(this)}get settings(){return this.checkDestroyed(),this._serverConfig}checkDestroyed(){if(this.isDeleted)throw lt.create("server-app-deleted")}}/**
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
 */const lr=bT;function ag(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:_o,automaticDataCollectionEnabled:!0,...e},i=r.name;if(typeof i!="string"||!i)throw lt.create("bad-app-name",{appName:String(i)});if(t||(t=ql()),!t)throw lt.create("no-options");const s=Jn.get(i);if(s)if(kt(t,s.options)){if(kt(r,s.config))return s;throw lt.create("duplicate-app",{appName:i,mismatchedParam:"config",oldValue:JSON.stringify(s.config),newValue:JSON.stringify(r)})}else throw lt.create("duplicate-app",{appName:i,mismatchedParam:"options",oldValue:JSON.stringify(s.options),newValue:JSON.stringify(t)});const o=new ng(i);for(const u of Si.values())o.addComponent(u);const c=new og(t,r,o);return Jn.set(i,c),c}function kT(n,e={}){if(kw()&&!Xm())throw lt.create("invalid-server-app-environment");let t,r=e||{};if(n&&(zl(n)?t=n.options:sg(n)?r=n:t=n),r.automaticDataCollectionEnabled===void 0&&(r.automaticDataCollectionEnabled=!0),t||(t=ql()),!t)throw lt.create("no-options");const i={...r,...t};i.releaseOnDeref!==void 0&&delete i.releaseOnDeref;const s=d=>[...d].reduce((p,m)=>Math.imul(31,p)+m.charCodeAt(0)|0,0);if(r.releaseOnDeref!==void 0&&typeof FinalizationRegistry>"u")throw lt.create("finalization-registry-not-supported",{});const o=""+s(JSON.stringify(i)),c=bi.get(o);if(c)return c.incRefCount(r.releaseOnDeref),c;const u=new ng(o);for(const d of Si.values())u.addComponent(d);const l=new DT(t,r,o,u);return bi.set(o,l),l}function Ac(n=_o){const e=Jn.get(n);if(!e&&n===_o&&ql())return ag();if(!e)throw lt.create("no-app",{appName:n});return e}function xT(){return Array.from(Jn.values())}async function cg(n){let e=!1;const t=n.name;Jn.has(t)?(e=!0,Jn.delete(t)):bi.has(t)&&n.decRefCount()<=0&&(bi.delete(t),e=!0),e&&(await Promise.all(n.container.getProviders().map(r=>r.delete())),n.isDeleted=!0)}function Pt(n,e,t){let r=ST[n]??n;t&&(r+=`-${t}`);const i=r.match(/\s|\//),s=e.match(/\s|\//);if(i||s){const o=[`Unable to register library "${r}" with version "${e}":`];i&&o.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&s&&o.push("and"),s&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),pn.warn(o.join(" "));return}Yn(new Qn(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}function OT(n,e){if(n!==null&&typeof n!="function")throw lt.create("invalid-log-argument");Xw(n,e)}function LT(n){Yw(n)}/**
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
 */const MT="firebase-heartbeat-database",FT=1,yo="firebase-heartbeat-store";let Mu=null;function ug(){return Mu||(Mu=Aw(MT,FT,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(yo)}catch(t){console.warn(t)}}}}).catch(n=>{throw lt.create("idb-open",{originalErrorMessage:n.message})})),Mu}async function UT(n){try{const t=(await ug()).transaction(yo),r=await t.objectStore(yo).get(lg(n));return await t.done,r}catch(e){if(e instanceof Ot)pn.warn(e.message);else{const t=lt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});pn.warn(t.message)}}}async function Gf(n,e){try{const r=(await ug()).transaction(yo,"readwrite");await r.objectStore(yo).put(e,lg(n)),await r.done}catch(t){if(t instanceof Ot)pn.warn(t.message);else{const r=lt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});pn.warn(r.message)}}}function lg(n){return`${n.name}!${n.options.appId}`}/**
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
 */const BT=1024,qT=30;class $T{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new zT(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=Wf();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>qT){const o=GT(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){pn.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Wf(),{heartbeatsToSend:r,unsentEntries:i}=jT(this._heartbeatsCache.heartbeats),s=Ha(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return pn.warn(t),""}}}function Wf(){return new Date().toISOString().substring(0,10)}function jT(n,e=BT){const t=[];let r=n.slice();for(const i of n){const s=t.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),Kf(t)>e){s.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),Kf(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class zT{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return tg()?Fw().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await UT(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Gf(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Gf(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function Kf(n){return Ha(JSON.stringify({version:2,heartbeats:n})).length}function GT(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
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
 */function WT(n){Yn(new Qn("platform-logger",e=>new Zw(e),"PRIVATE")),Yn(new Qn("heartbeat",e=>new $T(e),"PRIVATE")),Pt(Qa,rl,n),Pt(Qa,rl,"esm2020"),Pt("fire-js","")}/**
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
 */WT("");var KT="firebase",HT="12.17.1";/**
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
 */Pt(KT,HT,"app");const mx=Object.freeze(Object.defineProperty({__proto__:null,FirebaseError:Ot,SDK_VERSION:lr,_DEFAULT_ENTRY_NAME:_o,_addComponent:il,_addOrOverwriteComponent:VT,_apps:Jn,_clearComponents:CT,_components:Si,_getProvider:Jr,_isFirebaseApp:zl,_isFirebaseServerApp:_e,_isFirebaseServerAppSettings:sg,_registerComponent:Yn,_removeServiceInstance:ig,_serverApps:bi,deleteApp:cg,getApp:Ac,getApps:xT,initializeApp:ag,initializeServerApp:kT,onLog:OT,registerVersion:Pt,setLogLevel:LT},Symbol.toStringTag,{value:"Module"}));var Hf=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var jn,hg;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(w,_){function E(){}E.prototype=_.prototype,w.F=_.prototype,w.prototype=new E,w.prototype.constructor=w,w.D=function(A,v,V){for(var y=Array(arguments.length-2),ct=2;ct<arguments.length;ct++)y[ct-2]=arguments[ct];return _.prototype[v].apply(A,y)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(w,_,E){E||(E=0);const A=Array(16);if(typeof _=="string")for(var v=0;v<16;++v)A[v]=_.charCodeAt(E++)|_.charCodeAt(E++)<<8|_.charCodeAt(E++)<<16|_.charCodeAt(E++)<<24;else for(v=0;v<16;++v)A[v]=_[E++]|_[E++]<<8|_[E++]<<16|_[E++]<<24;_=w.g[0],E=w.g[1],v=w.g[2];let V=w.g[3],y;y=_+(V^E&(v^V))+A[0]+3614090360&4294967295,_=E+(y<<7&4294967295|y>>>25),y=V+(v^_&(E^v))+A[1]+3905402710&4294967295,V=_+(y<<12&4294967295|y>>>20),y=v+(E^V&(_^E))+A[2]+606105819&4294967295,v=V+(y<<17&4294967295|y>>>15),y=E+(_^v&(V^_))+A[3]+3250441966&4294967295,E=v+(y<<22&4294967295|y>>>10),y=_+(V^E&(v^V))+A[4]+4118548399&4294967295,_=E+(y<<7&4294967295|y>>>25),y=V+(v^_&(E^v))+A[5]+1200080426&4294967295,V=_+(y<<12&4294967295|y>>>20),y=v+(E^V&(_^E))+A[6]+2821735955&4294967295,v=V+(y<<17&4294967295|y>>>15),y=E+(_^v&(V^_))+A[7]+4249261313&4294967295,E=v+(y<<22&4294967295|y>>>10),y=_+(V^E&(v^V))+A[8]+1770035416&4294967295,_=E+(y<<7&4294967295|y>>>25),y=V+(v^_&(E^v))+A[9]+2336552879&4294967295,V=_+(y<<12&4294967295|y>>>20),y=v+(E^V&(_^E))+A[10]+4294925233&4294967295,v=V+(y<<17&4294967295|y>>>15),y=E+(_^v&(V^_))+A[11]+2304563134&4294967295,E=v+(y<<22&4294967295|y>>>10),y=_+(V^E&(v^V))+A[12]+1804603682&4294967295,_=E+(y<<7&4294967295|y>>>25),y=V+(v^_&(E^v))+A[13]+4254626195&4294967295,V=_+(y<<12&4294967295|y>>>20),y=v+(E^V&(_^E))+A[14]+2792965006&4294967295,v=V+(y<<17&4294967295|y>>>15),y=E+(_^v&(V^_))+A[15]+1236535329&4294967295,E=v+(y<<22&4294967295|y>>>10),y=_+(v^V&(E^v))+A[1]+4129170786&4294967295,_=E+(y<<5&4294967295|y>>>27),y=V+(E^v&(_^E))+A[6]+3225465664&4294967295,V=_+(y<<9&4294967295|y>>>23),y=v+(_^E&(V^_))+A[11]+643717713&4294967295,v=V+(y<<14&4294967295|y>>>18),y=E+(V^_&(v^V))+A[0]+3921069994&4294967295,E=v+(y<<20&4294967295|y>>>12),y=_+(v^V&(E^v))+A[5]+3593408605&4294967295,_=E+(y<<5&4294967295|y>>>27),y=V+(E^v&(_^E))+A[10]+38016083&4294967295,V=_+(y<<9&4294967295|y>>>23),y=v+(_^E&(V^_))+A[15]+3634488961&4294967295,v=V+(y<<14&4294967295|y>>>18),y=E+(V^_&(v^V))+A[4]+3889429448&4294967295,E=v+(y<<20&4294967295|y>>>12),y=_+(v^V&(E^v))+A[9]+568446438&4294967295,_=E+(y<<5&4294967295|y>>>27),y=V+(E^v&(_^E))+A[14]+3275163606&4294967295,V=_+(y<<9&4294967295|y>>>23),y=v+(_^E&(V^_))+A[3]+4107603335&4294967295,v=V+(y<<14&4294967295|y>>>18),y=E+(V^_&(v^V))+A[8]+1163531501&4294967295,E=v+(y<<20&4294967295|y>>>12),y=_+(v^V&(E^v))+A[13]+2850285829&4294967295,_=E+(y<<5&4294967295|y>>>27),y=V+(E^v&(_^E))+A[2]+4243563512&4294967295,V=_+(y<<9&4294967295|y>>>23),y=v+(_^E&(V^_))+A[7]+1735328473&4294967295,v=V+(y<<14&4294967295|y>>>18),y=E+(V^_&(v^V))+A[12]+2368359562&4294967295,E=v+(y<<20&4294967295|y>>>12),y=_+(E^v^V)+A[5]+4294588738&4294967295,_=E+(y<<4&4294967295|y>>>28),y=V+(_^E^v)+A[8]+2272392833&4294967295,V=_+(y<<11&4294967295|y>>>21),y=v+(V^_^E)+A[11]+1839030562&4294967295,v=V+(y<<16&4294967295|y>>>16),y=E+(v^V^_)+A[14]+4259657740&4294967295,E=v+(y<<23&4294967295|y>>>9),y=_+(E^v^V)+A[1]+2763975236&4294967295,_=E+(y<<4&4294967295|y>>>28),y=V+(_^E^v)+A[4]+1272893353&4294967295,V=_+(y<<11&4294967295|y>>>21),y=v+(V^_^E)+A[7]+4139469664&4294967295,v=V+(y<<16&4294967295|y>>>16),y=E+(v^V^_)+A[10]+3200236656&4294967295,E=v+(y<<23&4294967295|y>>>9),y=_+(E^v^V)+A[13]+681279174&4294967295,_=E+(y<<4&4294967295|y>>>28),y=V+(_^E^v)+A[0]+3936430074&4294967295,V=_+(y<<11&4294967295|y>>>21),y=v+(V^_^E)+A[3]+3572445317&4294967295,v=V+(y<<16&4294967295|y>>>16),y=E+(v^V^_)+A[6]+76029189&4294967295,E=v+(y<<23&4294967295|y>>>9),y=_+(E^v^V)+A[9]+3654602809&4294967295,_=E+(y<<4&4294967295|y>>>28),y=V+(_^E^v)+A[12]+3873151461&4294967295,V=_+(y<<11&4294967295|y>>>21),y=v+(V^_^E)+A[15]+530742520&4294967295,v=V+(y<<16&4294967295|y>>>16),y=E+(v^V^_)+A[2]+3299628645&4294967295,E=v+(y<<23&4294967295|y>>>9),y=_+(v^(E|~V))+A[0]+4096336452&4294967295,_=E+(y<<6&4294967295|y>>>26),y=V+(E^(_|~v))+A[7]+1126891415&4294967295,V=_+(y<<10&4294967295|y>>>22),y=v+(_^(V|~E))+A[14]+2878612391&4294967295,v=V+(y<<15&4294967295|y>>>17),y=E+(V^(v|~_))+A[5]+4237533241&4294967295,E=v+(y<<21&4294967295|y>>>11),y=_+(v^(E|~V))+A[12]+1700485571&4294967295,_=E+(y<<6&4294967295|y>>>26),y=V+(E^(_|~v))+A[3]+2399980690&4294967295,V=_+(y<<10&4294967295|y>>>22),y=v+(_^(V|~E))+A[10]+4293915773&4294967295,v=V+(y<<15&4294967295|y>>>17),y=E+(V^(v|~_))+A[1]+2240044497&4294967295,E=v+(y<<21&4294967295|y>>>11),y=_+(v^(E|~V))+A[8]+1873313359&4294967295,_=E+(y<<6&4294967295|y>>>26),y=V+(E^(_|~v))+A[15]+4264355552&4294967295,V=_+(y<<10&4294967295|y>>>22),y=v+(_^(V|~E))+A[6]+2734768916&4294967295,v=V+(y<<15&4294967295|y>>>17),y=E+(V^(v|~_))+A[13]+1309151649&4294967295,E=v+(y<<21&4294967295|y>>>11),y=_+(v^(E|~V))+A[4]+4149444226&4294967295,_=E+(y<<6&4294967295|y>>>26),y=V+(E^(_|~v))+A[11]+3174756917&4294967295,V=_+(y<<10&4294967295|y>>>22),y=v+(_^(V|~E))+A[2]+718787259&4294967295,v=V+(y<<15&4294967295|y>>>17),y=E+(V^(v|~_))+A[9]+3951481745&4294967295,w.g[0]=w.g[0]+_&4294967295,w.g[1]=w.g[1]+(v+(y<<21&4294967295|y>>>11))&4294967295,w.g[2]=w.g[2]+v&4294967295,w.g[3]=w.g[3]+V&4294967295}r.prototype.v=function(w,_){_===void 0&&(_=w.length);const E=_-this.blockSize,A=this.C;let v=this.h,V=0;for(;V<_;){if(v==0)for(;V<=E;)i(this,w,V),V+=this.blockSize;if(typeof w=="string"){for(;V<_;)if(A[v++]=w.charCodeAt(V++),v==this.blockSize){i(this,A),v=0;break}}else for(;V<_;)if(A[v++]=w[V++],v==this.blockSize){i(this,A),v=0;break}}this.h=v,this.o+=_},r.prototype.A=function(){var w=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);w[0]=128;for(var _=1;_<w.length-8;++_)w[_]=0;_=this.o*8;for(var E=w.length-8;E<w.length;++E)w[E]=_&255,_/=256;for(this.v(w),w=Array(16),_=0,E=0;E<4;++E)for(let A=0;A<32;A+=8)w[_++]=this.g[E]>>>A&255;return w};function s(w,_){var E=c;return Object.prototype.hasOwnProperty.call(E,w)?E[w]:E[w]=_(w)}function o(w,_){this.h=_;const E=[];let A=!0;for(let v=w.length-1;v>=0;v--){const V=w[v]|0;A&&V==_||(E[v]=V,A=!1)}this.g=E}var c={};function u(w){return-128<=w&&w<128?s(w,function(_){return new o([_|0],_<0?-1:0)}):new o([w|0],w<0?-1:0)}function l(w){if(isNaN(w)||!isFinite(w))return p;if(w<0)return D(l(-w));const _=[];let E=1;for(let A=0;w>=E;A++)_[A]=w/E|0,E*=4294967296;return new o(_,0)}function d(w,_){if(w.length==0)throw Error("number format error: empty string");if(_=_||10,_<2||36<_)throw Error("radix out of range: "+_);if(w.charAt(0)=="-")return D(d(w.substring(1),_));if(w.indexOf("-")>=0)throw Error('number format error: interior "-" character');const E=l(Math.pow(_,8));let A=p;for(let V=0;V<w.length;V+=8){var v=Math.min(8,w.length-V);const y=parseInt(w.substring(V,V+v),_);v<8?(v=l(Math.pow(_,v)),A=A.j(v).add(l(y))):(A=A.j(E),A=A.add(l(y)))}return A}var p=u(0),m=u(1),I=u(16777216);n=o.prototype,n.m=function(){if(x(this))return-D(this).m();let w=0,_=1;for(let E=0;E<this.g.length;E++){const A=this.i(E);w+=(A>=0?A:4294967296+A)*_,_*=4294967296}return w},n.toString=function(w){if(w=w||10,w<2||36<w)throw Error("radix out of range: "+w);if(P(this))return"0";if(x(this))return"-"+D(this).toString(w);const _=l(Math.pow(w,6));var E=this;let A="";for(;;){const v=Y(E,_).g;E=$(E,v.j(_));let V=((E.g.length>0?E.g[0]:E.h)>>>0).toString(w);if(E=v,P(E))return V+A;for(;V.length<6;)V="0"+V;A=V+A}},n.i=function(w){return w<0?0:w<this.g.length?this.g[w]:this.h};function P(w){if(w.h!=0)return!1;for(let _=0;_<w.g.length;_++)if(w.g[_]!=0)return!1;return!0}function x(w){return w.h==-1}n.l=function(w){return w=$(this,w),x(w)?-1:P(w)?0:1};function D(w){const _=w.g.length,E=[];for(let A=0;A<_;A++)E[A]=~w.g[A];return new o(E,~w.h).add(m)}n.abs=function(){return x(this)?D(this):this},n.add=function(w){const _=Math.max(this.g.length,w.g.length),E=[];let A=0;for(let v=0;v<=_;v++){let V=A+(this.i(v)&65535)+(w.i(v)&65535),y=(V>>>16)+(this.i(v)>>>16)+(w.i(v)>>>16);A=y>>>16,V&=65535,y&=65535,E[v]=y<<16|V}return new o(E,E[E.length-1]&-2147483648?-1:0)};function $(w,_){return w.add(D(_))}n.j=function(w){if(P(this)||P(w))return p;if(x(this))return x(w)?D(this).j(D(w)):D(D(this).j(w));if(x(w))return D(this.j(D(w)));if(this.l(I)<0&&w.l(I)<0)return l(this.m()*w.m());const _=this.g.length+w.g.length,E=[];for(var A=0;A<2*_;A++)E[A]=0;for(A=0;A<this.g.length;A++)for(let v=0;v<w.g.length;v++){const V=this.i(A)>>>16,y=this.i(A)&65535,ct=w.i(v)>>>16,yr=w.i(v)&65535;E[2*A+2*v]+=y*yr,G(E,2*A+2*v),E[2*A+2*v+1]+=V*yr,G(E,2*A+2*v+1),E[2*A+2*v+1]+=y*ct,G(E,2*A+2*v+1),E[2*A+2*v+2]+=V*ct,G(E,2*A+2*v+2)}for(w=0;w<_;w++)E[w]=E[2*w+1]<<16|E[2*w];for(w=_;w<2*_;w++)E[w]=0;return new o(E,0)};function G(w,_){for(;(w[_]&65535)!=w[_];)w[_+1]+=w[_]>>>16,w[_]&=65535,_++}function z(w,_){this.g=w,this.h=_}function Y(w,_){if(P(_))throw Error("division by zero");if(P(w))return new z(p,p);if(x(w))return _=Y(D(w),_),new z(D(_.g),D(_.h));if(x(_))return _=Y(w,D(_)),new z(D(_.g),_.h);if(w.g.length>30){if(x(w)||x(_))throw Error("slowDivide_ only works with positive integers.");for(var E=m,A=_;A.l(w)<=0;)E=ee(E),A=ee(A);var v=re(E,1),V=re(A,1);for(A=re(A,2),E=re(E,2);!P(A);){var y=V.add(A);y.l(w)<=0&&(v=v.add(E),V=y),A=re(A,1),E=re(E,1)}return _=$(w,v.j(_)),new z(v,_)}for(v=p;w.l(_)>=0;){for(E=Math.max(1,Math.floor(w.m()/_.m())),A=Math.ceil(Math.log(E)/Math.LN2),A=A<=48?1:Math.pow(2,A-48),V=l(E),y=V.j(_);x(y)||y.l(w)>0;)E-=A,V=l(E),y=V.j(_);P(V)&&(V=m),v=v.add(V),w=$(w,y)}return new z(v,w)}n.B=function(w){return Y(this,w).h},n.and=function(w){const _=Math.max(this.g.length,w.g.length),E=[];for(let A=0;A<_;A++)E[A]=this.i(A)&w.i(A);return new o(E,this.h&w.h)},n.or=function(w){const _=Math.max(this.g.length,w.g.length),E=[];for(let A=0;A<_;A++)E[A]=this.i(A)|w.i(A);return new o(E,this.h|w.h)},n.xor=function(w){const _=Math.max(this.g.length,w.g.length),E=[];for(let A=0;A<_;A++)E[A]=this.i(A)^w.i(A);return new o(E,this.h^w.h)};function ee(w){const _=w.g.length+1,E=[];for(let A=0;A<_;A++)E[A]=w.i(A)<<1|w.i(A-1)>>>31;return new o(E,w.h)}function re(w,_){const E=_>>5;_%=32;const A=w.g.length-E,v=[];for(let V=0;V<A;V++)v[V]=_>0?w.i(V+E)>>>_|w.i(V+E+1)<<32-_:w.i(V+E);return new o(v,w.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,hg=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=l,o.fromString=d,jn=o}).apply(typeof Hf<"u"?Hf:typeof self<"u"?self:typeof window<"u"?window:{});var Ea=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var dg,Ks,fg,xa,sl,pg,mg,gg;(function(){var n,e=Object.defineProperty;function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Ea=="object"&&Ea];for(var h=0;h<a.length;++h){var f=a[h];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var r=t(this);function i(a,h){if(h)e:{var f=r;a=a.split(".");for(var g=0;g<a.length-1;g++){var b=a[g];if(!(b in f))break e;f=f[b]}a=a[a.length-1],g=f[a],h=h(g),h!=g&&h!=null&&e(f,a,{configurable:!0,writable:!0,value:h})}}i("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),i("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),i("Object.entries",function(a){return a||function(h){var f=[],g;for(g in h)Object.prototype.hasOwnProperty.call(h,g)&&f.push([g,h[g]]);return f}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var s=s||{},o=this||self;function c(a){var h=typeof a;return h=="object"&&a!=null||h=="function"}function u(a,h,f){return a.call.apply(a.bind,arguments)}function l(a,h,f){return l=u,l.apply(null,arguments)}function d(a,h){var f=Array.prototype.slice.call(arguments,1);return function(){var g=f.slice();return g.push.apply(g,arguments),a.apply(this,g)}}function p(a,h){function f(){}f.prototype=h.prototype,a.Z=h.prototype,a.prototype=new f,a.prototype.constructor=a,a.Ob=function(g,b,C){for(var q=Array(arguments.length-2),Z=2;Z<arguments.length;Z++)q[Z-2]=arguments[Z];return h.prototype[b].apply(g,q)}}var m=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function I(a){const h=a.length;if(h>0){const f=Array(h);for(let g=0;g<h;g++)f[g]=a[g];return f}return[]}function P(a,h){for(let g=1;g<arguments.length;g++){const b=arguments[g];var f=typeof b;if(f=f!="object"?f:b?Array.isArray(b)?"array":f:"null",f=="array"||f=="object"&&typeof b.length=="number"){f=a.length||0;const C=b.length||0;a.length=f+C;for(let q=0;q<C;q++)a[f+q]=b[q]}else a.push(b)}}class x{constructor(h,f){this.i=h,this.j=f,this.h=0,this.g=null}get(){let h;return this.h>0?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function D(a){o.setTimeout(()=>{throw a},0)}function $(){var a=w;let h=null;return a.g&&(h=a.g,a.g=a.g.next,a.g||(a.h=null),h.next=null),h}class G{constructor(){this.h=this.g=null}add(h,f){const g=z.get();g.set(h,f),this.h?this.h.next=g:this.g=g,this.h=g}}var z=new x(()=>new Y,a=>a.reset());class Y{constructor(){this.next=this.g=this.h=null}set(h,f){this.h=h,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let ee,re=!1,w=new G,_=()=>{const a=Promise.resolve(void 0);ee=()=>{a.then(E)}};function E(){for(var a;a=$();){try{a.h.call(a.g)}catch(f){D(f)}var h=z;h.j(a),h.h<100&&(h.h++,a.next=h.g,h.g=a)}re=!1}function A(){this.u=this.u,this.C=this.C}A.prototype.u=!1,A.prototype.dispose=function(){this.u||(this.u=!0,this.N())},A.prototype[Symbol.dispose]=function(){this.dispose()},A.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function v(a,h){this.type=a,this.g=this.target=h,this.defaultPrevented=!1}v.prototype.h=function(){this.defaultPrevented=!0};var V=(function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,h=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const f=()=>{};o.addEventListener("test",f,h),o.removeEventListener("test",f,h)}catch{}return a})();function y(a){return/^[\s\xa0]*$/.test(a)}function ct(a,h){v.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,h)}p(ct,v),ct.prototype.init=function(a,h){const f=this.type=a.type,g=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=h,h=a.relatedTarget,h||(f=="mouseover"?h=a.fromElement:f=="mouseout"&&(h=a.toElement)),this.relatedTarget=h,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&ct.Z.h.call(this)},ct.prototype.h=function(){ct.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var yr="closure_listenable_"+(Math.random()*1e6|0),WE=0;function KE(a,h,f,g,b){this.listener=a,this.proxy=null,this.src=h,this.type=f,this.capture=!!g,this.ha=b,this.key=++WE,this.da=this.fa=!1}function sa(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function oa(a,h,f){for(const g in a)h.call(f,a[g],g,a)}function HE(a,h){for(const f in a)h.call(void 0,a[f],f,a)}function Bd(a){const h={};for(const f in a)h[f]=a[f];return h}const qd="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function $d(a,h){let f,g;for(let b=1;b<arguments.length;b++){g=arguments[b];for(f in g)a[f]=g[f];for(let C=0;C<qd.length;C++)f=qd[C],Object.prototype.hasOwnProperty.call(g,f)&&(a[f]=g[f])}}function aa(a){this.src=a,this.g={},this.h=0}aa.prototype.add=function(a,h,f,g,b){const C=a.toString();a=this.g[C],a||(a=this.g[C]=[],this.h++);const q=fu(a,h,g,b);return q>-1?(h=a[q],f||(h.fa=!1)):(h=new KE(h,this.src,C,!!g,b),h.fa=f,a.push(h)),h};function du(a,h){const f=h.type;if(f in a.g){var g=a.g[f],b=Array.prototype.indexOf.call(g,h,void 0),C;(C=b>=0)&&Array.prototype.splice.call(g,b,1),C&&(sa(h),a.g[f].length==0&&(delete a.g[f],a.h--))}}function fu(a,h,f,g){for(let b=0;b<a.length;++b){const C=a[b];if(!C.da&&C.listener==h&&C.capture==!!f&&C.ha==g)return b}return-1}var pu="closure_lm_"+(Math.random()*1e6|0),mu={};function jd(a,h,f,g,b){if(Array.isArray(h)){for(let C=0;C<h.length;C++)jd(a,h[C],f,g,b);return null}return f=Wd(f),a&&a[yr]?a.J(h,f,c(g)?!!g.capture:!1,b):QE(a,h,f,!1,g,b)}function QE(a,h,f,g,b,C){if(!h)throw Error("Invalid event type");const q=c(b)?!!b.capture:!!b;let Z=_u(a);if(Z||(a[pu]=Z=new aa(a)),f=Z.add(h,f,g,q,C),f.proxy)return f;if(g=JE(),f.proxy=g,g.src=a,g.listener=f,a.addEventListener)V||(b=q),b===void 0&&(b=!1),a.addEventListener(h.toString(),g,b);else if(a.attachEvent)a.attachEvent(Gd(h.toString()),g);else if(a.addListener&&a.removeListener)a.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return f}function JE(){function a(f){return h.call(a.src,a.listener,f)}const h=YE;return a}function zd(a,h,f,g,b){if(Array.isArray(h))for(var C=0;C<h.length;C++)zd(a,h[C],f,g,b);else g=c(g)?!!g.capture:!!g,f=Wd(f),a&&a[yr]?(a=a.i,C=String(h).toString(),C in a.g&&(h=a.g[C],f=fu(h,f,g,b),f>-1&&(sa(h[f]),Array.prototype.splice.call(h,f,1),h.length==0&&(delete a.g[C],a.h--)))):a&&(a=_u(a))&&(h=a.g[h.toString()],a=-1,h&&(a=fu(h,f,g,b)),(f=a>-1?h[a]:null)&&gu(f))}function gu(a){if(typeof a!="number"&&a&&!a.da){var h=a.src;if(h&&h[yr])du(h.i,a);else{var f=a.type,g=a.proxy;h.removeEventListener?h.removeEventListener(f,g,a.capture):h.detachEvent?h.detachEvent(Gd(f),g):h.addListener&&h.removeListener&&h.removeListener(g),(f=_u(h))?(du(f,a),f.h==0&&(f.src=null,h[pu]=null)):sa(a)}}}function Gd(a){return a in mu?mu[a]:mu[a]="on"+a}function YE(a,h){if(a.da)a=!0;else{h=new ct(h,this);const f=a.listener,g=a.ha||a.src;a.fa&&gu(a),a=f.call(g,h)}return a}function _u(a){return a=a[pu],a instanceof aa?a:null}var yu="__closure_events_fn_"+(Math.random()*1e9>>>0);function Wd(a){return typeof a=="function"?a:(a[yu]||(a[yu]=function(h){return a.handleEvent(h)}),a[yu])}function Qe(){A.call(this),this.i=new aa(this),this.M=this,this.G=null}p(Qe,A),Qe.prototype[yr]=!0,Qe.prototype.removeEventListener=function(a,h,f,g){zd(this,a,h,f,g)};function rt(a,h){var f,g=a.G;if(g)for(f=[];g;g=g.G)f.push(g);if(a=a.M,g=h.type||h,typeof h=="string")h=new v(h,a);else if(h instanceof v)h.target=h.target||a;else{var b=h;h=new v(g,a),$d(h,b)}b=!0;let C,q;if(f)for(q=f.length-1;q>=0;q--)C=h.g=f[q],b=ca(C,g,!0,h)&&b;if(C=h.g=a,b=ca(C,g,!0,h)&&b,b=ca(C,g,!1,h)&&b,f)for(q=0;q<f.length;q++)C=h.g=f[q],b=ca(C,g,!1,h)&&b}Qe.prototype.N=function(){if(Qe.Z.N.call(this),this.i){var a=this.i;for(const h in a.g){const f=a.g[h];for(let g=0;g<f.length;g++)sa(f[g]);delete a.g[h],a.h--}}this.G=null},Qe.prototype.J=function(a,h,f,g){return this.i.add(String(a),h,!1,f,g)},Qe.prototype.K=function(a,h,f,g){return this.i.add(String(a),h,!0,f,g)};function ca(a,h,f,g){if(h=a.i.g[String(h)],!h)return!0;h=h.concat();let b=!0;for(let C=0;C<h.length;++C){const q=h[C];if(q&&!q.da&&q.capture==f){const Z=q.listener,Oe=q.ha||q.src;q.fa&&du(a.i,q),b=Z.call(Oe,g)!==!1&&b}}return b&&!g.defaultPrevented}function XE(a,h){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=l(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(h)>2147483647?-1:o.setTimeout(a,h||0)}function Kd(a){a.g=XE(()=>{a.g=null,a.i&&(a.i=!1,Kd(a))},a.l);const h=a.h;a.h=null,a.m.apply(null,h)}class ZE extends A{constructor(h,f){super(),this.m=h,this.l=f,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:Kd(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ws(a){A.call(this),this.h=a,this.g={}}p(ws,A);var Hd=[];function Qd(a){oa(a.g,function(h,f){this.g.hasOwnProperty(f)&&gu(h)},a),a.g={}}ws.prototype.N=function(){ws.Z.N.call(this),Qd(this)},ws.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Iu=o.JSON.stringify,ew=o.JSON.parse,tw=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function Jd(){}function Yd(){}var Ts={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Eu(){v.call(this,"d")}p(Eu,v);function wu(){v.call(this,"c")}p(wu,v);var Ir={},Xd=null;function ua(){return Xd=Xd||new Qe}Ir.Ia="serverreachability";function Zd(a){v.call(this,Ir.Ia,a)}p(Zd,v);function vs(a){const h=ua();rt(h,new Zd(h))}Ir.STAT_EVENT="statevent";function ef(a,h){v.call(this,Ir.STAT_EVENT,a),this.stat=h}p(ef,v);function it(a){const h=ua();rt(h,new ef(h,a))}Ir.Ja="timingevent";function tf(a,h){v.call(this,Ir.Ja,a),this.size=h}p(tf,v);function As(a,h){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},h)}function Rs(){this.g=!0}Rs.prototype.ua=function(){this.g=!1};function nw(a,h,f,g,b,C){a.info(function(){if(a.g)if(C){var q="",Z=C.split("&");for(let he=0;he<Z.length;he++){var Oe=Z[he].split("=");if(Oe.length>1){const qe=Oe[0];Oe=Oe[1];const Mt=qe.split("_");q=Mt.length>=2&&Mt[1]=="type"?q+(qe+"="+Oe+"&"):q+(qe+"=redacted&")}}}else q=null;else q=C;return"XMLHTTP REQ ("+g+") [attempt "+b+"]: "+h+`
`+f+`
`+q})}function rw(a,h,f,g,b,C,q){a.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+b+"]: "+h+`
`+f+`
`+C+" "+q})}function ai(a,h,f,g){a.info(function(){return"XMLHTTP TEXT ("+h+"): "+sw(a,f)+(g?" "+g:"")})}function iw(a,h){a.info(function(){return"TIMEOUT: "+h})}Rs.prototype.info=function(){};function sw(a,h){if(!a.g)return h;if(!h)return null;try{const C=JSON.parse(h);if(C){for(a=0;a<C.length;a++)if(Array.isArray(C[a])){var f=C[a];if(!(f.length<2)){var g=f[1];if(Array.isArray(g)&&!(g.length<1)){var b=g[0];if(b!="noop"&&b!="stop"&&b!="close")for(let q=1;q<g.length;q++)g[q]=""}}}}return Iu(C)}catch{return h}}var la={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},nf={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},rf;function Tu(){}p(Tu,Jd),Tu.prototype.g=function(){return new XMLHttpRequest},rf=new Tu;function Ps(a){return encodeURIComponent(String(a))}function ow(a){var h=1;a=a.split(":");const f=[];for(;h>0&&a.length;)f.push(a.shift()),h--;return a.length&&f.push(a.join(":")),f}function bn(a,h,f,g){this.j=a,this.i=h,this.l=f,this.S=g||1,this.V=new ws(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new sf}function sf(){this.i=null,this.g="",this.h=!1}var of={},vu={};function Au(a,h,f){a.M=1,a.A=da(Lt(h)),a.u=f,a.R=!0,af(a,null)}function af(a,h){a.F=Date.now(),ha(a),a.B=Lt(a.A);var f=a.B,g=a.S;Array.isArray(g)||(g=[String(g)]),Ef(f.i,"t",g),a.C=0,f=a.j.L,a.h=new sf,a.g=Ff(a.j,f?h:null,!a.u),a.P>0&&(a.O=new ZE(l(a.Y,a,a.g),a.P)),h=a.V,f=a.g,g=a.ba;var b="readystatechange";Array.isArray(b)||(b&&(Hd[0]=b.toString()),b=Hd);for(let C=0;C<b.length;C++){const q=jd(f,b[C],g||h.handleEvent,!1,h.h||h);if(!q)break;h.g[q.key]=q}h=a.J?Bd(a.J):{},a.u?(a.v||(a.v="POST"),h["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,h)):(a.v="GET",a.g.ea(a.B,a.v,null,h)),vs(),nw(a.i,a.v,a.B,a.l,a.S,a.u)}bn.prototype.ba=function(a){a=a.target;const h=this.O;h&&Cn(a)==3?h.j():this.Y(a)},bn.prototype.Y=function(a){try{if(a==this.g)e:{const Z=Cn(this.g),Oe=this.g.ya(),he=this.g.ca();if(!(Z<3)&&(Z!=3||this.g&&(this.h.h||this.g.la()||bf(this.g)))){this.K||Z!=4||Oe==7||(Oe==8||he<=0?vs(3):vs(2)),Ru(this);var h=this.g.ca();this.X=h;var f=aw(this);if(this.o=h==200,rw(this.i,this.v,this.B,this.l,this.S,Z,h),this.o){if(this.U&&!this.L){t:{if(this.g){var g,b=this.g;if((g=b.g?b.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!y(g)){var C=g;break t}}C=null}if(a=C)ai(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Pu(this,a);else{this.o=!1,this.m=3,it(12),Er(this),bs(this);break e}}if(this.R){a=!0;let qe;for(;!this.K&&this.C<f.length;)if(qe=cw(this,f),qe==vu){Z==4&&(this.m=4,it(14),a=!1),ai(this.i,this.l,null,"[Incomplete Response]");break}else if(qe==of){this.m=4,it(15),ai(this.i,this.l,f,"[Invalid Chunk]"),a=!1;break}else ai(this.i,this.l,qe,null),Pu(this,qe);if(cf(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Z!=4||f.length!=0||this.h.h||(this.m=1,it(16),a=!1),this.o=this.o&&a,!a)ai(this.i,this.l,f,"[Invalid Chunked Response]"),Er(this),bs(this);else if(f.length>0&&!this.W){this.W=!0;var q=this.j;q.g==this&&q.aa&&!q.P&&(q.j.info("Great, no buffering proxy detected. Bytes received: "+f.length),xu(q),q.P=!0,it(11))}}else ai(this.i,this.l,f,null),Pu(this,f);Z==4&&Er(this),this.o&&!this.K&&(Z==4?xf(this.j,this):(this.o=!1,ha(this)))}else Tw(this.g),h==400&&f.indexOf("Unknown SID")>0?(this.m=3,it(12)):(this.m=0,it(13)),Er(this),bs(this)}}}catch{}finally{}};function aw(a){if(!cf(a))return a.g.la();const h=bf(a.g);if(h==="")return"";let f="";const g=h.length,b=Cn(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return Er(a),bs(a),"";a.h.i=new o.TextDecoder}for(let C=0;C<g;C++)a.h.h=!0,f+=a.h.i.decode(h[C],{stream:!(b&&C==g-1)});return h.length=0,a.h.g+=f,a.C=0,a.h.g}function cf(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function cw(a,h){var f=a.C,g=h.indexOf(`
`,f);return g==-1?vu:(f=Number(h.substring(f,g)),isNaN(f)?of:(g+=1,g+f>h.length?vu:(h=h.slice(g,g+f),a.C=g+f,h)))}bn.prototype.cancel=function(){this.K=!0,Er(this)};function ha(a){a.T=Date.now()+a.H,uf(a,a.H)}function uf(a,h){if(a.D!=null)throw Error("WatchDog timer not null");a.D=As(l(a.aa,a),h)}function Ru(a){a.D&&(o.clearTimeout(a.D),a.D=null)}bn.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(iw(this.i,this.B),this.M!=2&&(vs(),it(17)),Er(this),this.m=2,bs(this)):uf(this,this.T-a)};function bs(a){a.j.I==0||a.K||xf(a.j,a)}function Er(a){Ru(a);var h=a.O;h&&typeof h.dispose=="function"&&h.dispose(),a.O=null,Qd(a.V),a.g&&(h=a.g,a.g=null,h.abort(),h.dispose())}function Pu(a,h){try{var f=a.j;if(f.I!=0&&(f.g==a||bu(f.h,a))){if(!a.L&&bu(f.h,a)&&f.I==3){try{var g=f.Ba.g.parse(h)}catch{g=null}if(Array.isArray(g)&&g.length==3){var b=g;if(b[0]==0){e:if(!f.v){if(f.g)if(f.g.F+3e3<a.F)_a(f),ma(f);else break e;ku(f),it(18)}}else f.xa=b[1],0<f.xa-f.K&&b[2]<37500&&f.F&&f.A==0&&!f.C&&(f.C=As(l(f.Va,f),6e3));df(f.h)<=1&&f.ta&&(f.ta=void 0)}else Tr(f,11)}else if((a.L||f.g==a)&&_a(f),!y(h))for(b=f.Ba.g.parse(h),h=0;h<b.length;h++){let he=b[h];const qe=he[0];if(!(qe<=f.K))if(f.K=qe,he=he[1],f.I==2)if(he[0]=="c"){f.M=he[1],f.ba=he[2];const Mt=he[3];Mt!=null&&(f.ka=Mt,f.j.info("VER="+f.ka));const vr=he[4];vr!=null&&(f.za=vr,f.j.info("SVER="+f.za));const Nn=he[5];Nn!=null&&typeof Nn=="number"&&Nn>0&&(g=1.5*Nn,f.O=g,f.j.info("backChannelRequestTimeoutMs_="+g)),g=f;const Dn=a.g;if(Dn){const Ia=Dn.g?Dn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Ia){var C=g.h;C.g||Ia.indexOf("spdy")==-1&&Ia.indexOf("quic")==-1&&Ia.indexOf("h2")==-1||(C.j=C.l,C.g=new Set,C.h&&(Su(C,C.h),C.h=null))}if(g.G){const Ou=Dn.g?Dn.g.getResponseHeader("X-HTTP-Session-Id"):null;Ou&&(g.wa=Ou,me(g.J,g.G,Ou))}}f.I=3,f.l&&f.l.ra(),f.aa&&(f.T=Date.now()-a.F,f.j.info("Handshake RTT: "+f.T+"ms")),g=f;var q=a;if(g.na=Mf(g,g.L?g.ba:null,g.W),q.L){ff(g.h,q);var Z=q,Oe=g.O;Oe&&(Z.H=Oe),Z.D&&(Ru(Z),ha(Z)),g.g=q}else Df(g);f.i.length>0&&ga(f)}else he[0]!="stop"&&he[0]!="close"||Tr(f,7);else f.I==3&&(he[0]=="stop"||he[0]=="close"?he[0]=="stop"?Tr(f,7):Du(f):he[0]!="noop"&&f.l&&f.l.qa(he),f.A=0)}}vs(4)}catch{}}var uw=class{constructor(a,h){this.g=a,this.map=h}};function lf(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function hf(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function df(a){return a.h?1:a.g?a.g.size:0}function bu(a,h){return a.h?a.h==h:a.g?a.g.has(h):!1}function Su(a,h){a.g?a.g.add(h):a.h=h}function ff(a,h){a.h&&a.h==h?a.h=null:a.g&&a.g.has(h)&&a.g.delete(h)}lf.prototype.cancel=function(){if(this.i=pf(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function pf(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let h=a.i;for(const f of a.g.values())h=h.concat(f.G);return h}return I(a.i)}var mf=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function lw(a,h){if(a){a=a.split("&");for(let f=0;f<a.length;f++){const g=a[f].indexOf("=");let b,C=null;g>=0?(b=a[f].substring(0,g),C=a[f].substring(g+1)):b=a[f],h(b,C?decodeURIComponent(C.replace(/\+/g," ")):"")}}}function Sn(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let h;a instanceof Sn?(this.l=a.l,Ss(this,a.j),this.o=a.o,this.g=a.g,Vs(this,a.u),this.h=a.h,Vu(this,wf(a.i)),this.m=a.m):a&&(h=String(a).match(mf))?(this.l=!1,Ss(this,h[1]||"",!0),this.o=Cs(h[2]||""),this.g=Cs(h[3]||"",!0),Vs(this,h[4]),this.h=Cs(h[5]||"",!0),Vu(this,h[6]||"",!0),this.m=Cs(h[7]||"")):(this.l=!1,this.i=new Ds(null,this.l))}Sn.prototype.toString=function(){const a=[];var h=this.j;h&&a.push(Ns(h,gf,!0),":");var f=this.g;return(f||h=="file")&&(a.push("//"),(h=this.o)&&a.push(Ns(h,gf,!0),"@"),a.push(Ps(f).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.u,f!=null&&a.push(":",String(f))),(f=this.h)&&(this.g&&f.charAt(0)!="/"&&a.push("/"),a.push(Ns(f,f.charAt(0)=="/"?fw:dw,!0))),(f=this.i.toString())&&a.push("?",f),(f=this.m)&&a.push("#",Ns(f,mw)),a.join("")},Sn.prototype.resolve=function(a){const h=Lt(this);let f=!!a.j;f?Ss(h,a.j):f=!!a.o,f?h.o=a.o:f=!!a.g,f?h.g=a.g:f=a.u!=null;var g=a.h;if(f)Vs(h,a.u);else if(f=!!a.h){if(g.charAt(0)!="/")if(this.g&&!this.h)g="/"+g;else{var b=h.h.lastIndexOf("/");b!=-1&&(g=h.h.slice(0,b+1)+g)}if(b=g,b==".."||b==".")g="";else if(b.indexOf("./")!=-1||b.indexOf("/.")!=-1){g=b.lastIndexOf("/",0)==0,b=b.split("/");const C=[];for(let q=0;q<b.length;){const Z=b[q++];Z=="."?g&&q==b.length&&C.push(""):Z==".."?((C.length>1||C.length==1&&C[0]!="")&&C.pop(),g&&q==b.length&&C.push("")):(C.push(Z),g=!0)}g=C.join("/")}else g=b}return f?h.h=g:f=a.i.toString()!=="",f?Vu(h,wf(a.i)):f=!!a.m,f&&(h.m=a.m),h};function Lt(a){return new Sn(a)}function Ss(a,h,f){a.j=f?Cs(h,!0):h,a.j&&(a.j=a.j.replace(/:$/,""))}function Vs(a,h){if(h){if(h=Number(h),isNaN(h)||h<0)throw Error("Bad port number "+h);a.u=h}else a.u=null}function Vu(a,h,f){h instanceof Ds?(a.i=h,gw(a.i,a.l)):(f||(h=Ns(h,pw)),a.i=new Ds(h,a.l))}function me(a,h,f){a.i.set(h,f)}function da(a){return me(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function Cs(a,h){return a?h?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Ns(a,h,f){return typeof a=="string"?(a=encodeURI(a).replace(h,hw),f&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function hw(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var gf=/[#\/\?@]/g,dw=/[#\?:]/g,fw=/[#\?]/g,pw=/[#\?@]/g,mw=/#/g;function Ds(a,h){this.h=this.g=null,this.i=a||null,this.j=!!h}function wr(a){a.g||(a.g=new Map,a.h=0,a.i&&lw(a.i,function(h,f){a.add(decodeURIComponent(h.replace(/\+/g," ")),f)}))}n=Ds.prototype,n.add=function(a,h){wr(this),this.i=null,a=ci(this,a);let f=this.g.get(a);return f||this.g.set(a,f=[]),f.push(h),this.h+=1,this};function _f(a,h){wr(a),h=ci(a,h),a.g.has(h)&&(a.i=null,a.h-=a.g.get(h).length,a.g.delete(h))}function yf(a,h){return wr(a),h=ci(a,h),a.g.has(h)}n.forEach=function(a,h){wr(this),this.g.forEach(function(f,g){f.forEach(function(b){a.call(h,b,g,this)},this)},this)};function If(a,h){wr(a);let f=[];if(typeof h=="string")yf(a,h)&&(f=f.concat(a.g.get(ci(a,h))));else for(a=Array.from(a.g.values()),h=0;h<a.length;h++)f=f.concat(a[h]);return f}n.set=function(a,h){return wr(this),this.i=null,a=ci(this,a),yf(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[h]),this.h+=1,this},n.get=function(a,h){return a?(a=If(this,a),a.length>0?String(a[0]):h):h};function Ef(a,h,f){_f(a,h),f.length>0&&(a.i=null,a.g.set(ci(a,h),I(f)),a.h+=f.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],h=Array.from(this.g.keys());for(let g=0;g<h.length;g++){var f=h[g];const b=Ps(f);f=If(this,f);for(let C=0;C<f.length;C++){let q=b;f[C]!==""&&(q+="="+Ps(f[C])),a.push(q)}}return this.i=a.join("&")};function wf(a){const h=new Ds;return h.i=a.i,a.g&&(h.g=new Map(a.g),h.h=a.h),h}function ci(a,h){return h=String(h),a.j&&(h=h.toLowerCase()),h}function gw(a,h){h&&!a.j&&(wr(a),a.i=null,a.g.forEach(function(f,g){const b=g.toLowerCase();g!=b&&(_f(this,g),Ef(this,b,f))},a)),a.j=h}function _w(a,h){const f=new Rs;if(o.Image){const g=new Image;g.onload=d(Vn,f,"TestLoadImage: loaded",!0,h,g),g.onerror=d(Vn,f,"TestLoadImage: error",!1,h,g),g.onabort=d(Vn,f,"TestLoadImage: abort",!1,h,g),g.ontimeout=d(Vn,f,"TestLoadImage: timeout",!1,h,g),o.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=a}else h(!1)}function yw(a,h){const f=new Rs,g=new AbortController,b=setTimeout(()=>{g.abort(),Vn(f,"TestPingServer: timeout",!1,h)},1e4);fetch(a,{signal:g.signal}).then(C=>{clearTimeout(b),C.ok?Vn(f,"TestPingServer: ok",!0,h):Vn(f,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(b),Vn(f,"TestPingServer: error",!1,h)})}function Vn(a,h,f,g,b){try{b&&(b.onload=null,b.onerror=null,b.onabort=null,b.ontimeout=null),g(f)}catch{}}function Iw(){this.g=new tw}function Cu(a){this.i=a.Sb||null,this.h=a.ab||!1}p(Cu,Jd),Cu.prototype.g=function(){return new fa(this.i,this.h)};function fa(a,h){Qe.call(this),this.H=a,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(fa,Qe),n=fa.prototype,n.open=function(a,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=h,this.readyState=1,xs(this)},n.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const h={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(h.body=a),(this.H||o).fetch(new Request(this.D,h)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,ks(this)),this.readyState=0},n.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,xs(this)),this.g&&(this.readyState=3,xs(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Tf(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function Tf(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}n.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var h=a.value?a.value:new Uint8Array(0);(h=this.B.decode(h,{stream:!a.done}))&&(this.response=this.responseText+=h)}a.done?ks(this):xs(this),this.readyState==3&&Tf(this)}},n.Oa=function(a){this.g&&(this.response=this.responseText=a,ks(this))},n.Na=function(a){this.g&&(this.response=a,ks(this))},n.ga=function(){this.g&&ks(this)};function ks(a){a.readyState=4,a.l=null,a.j=null,a.B=null,xs(a)}n.setRequestHeader=function(a,h){this.A.append(a,h)},n.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],h=this.h.entries();for(var f=h.next();!f.done;)f=f.value,a.push(f[0]+": "+f[1]),f=h.next();return a.join(`\r
`)};function xs(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(fa.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function vf(a){let h="";return oa(a,function(f,g){h+=g,h+=":",h+=f,h+=`\r
`}),h}function Nu(a,h,f){e:{for(g in f){var g=!1;break e}g=!0}g||(f=vf(f),typeof a=="string"?f!=null&&Ps(f):me(a,h,f))}function ve(a){Qe.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(ve,Qe);var Ew=/^https?$/i,ww=["POST","PUT"];n=ve.prototype,n.Fa=function(a){this.H=a},n.ea=function(a,h,f,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);h=h?h.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():rf.g(),this.g.onreadystatechange=m(l(this.Ca,this));try{this.B=!0,this.g.open(h,String(a),!0),this.B=!1}catch(C){Af(this,C);return}if(a=f||"",f=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var b in g)f.set(b,g[b]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(const C of g.keys())f.set(C,g.get(C));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(f.keys()).find(C=>C.toLowerCase()=="content-type"),b=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(ww,h,void 0)>=0)||g||b||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[C,q]of f)this.g.setRequestHeader(C,q);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(C){Af(this,C)}};function Af(a,h){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=h,a.o=5,Rf(a),pa(a)}function Rf(a){a.A||(a.A=!0,rt(a,"complete"),rt(a,"error"))}n.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,rt(this,"complete"),rt(this,"abort"),pa(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),pa(this,!0)),ve.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?Pf(this):this.Xa())},n.Xa=function(){Pf(this)};function Pf(a){if(a.h&&typeof s<"u"){if(a.v&&Cn(a)==4)setTimeout(a.Ca.bind(a),0);else if(rt(a,"readystatechange"),Cn(a)==4){a.h=!1;try{const C=a.ca();e:switch(C){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var f;if(!(f=h)){var g;if(g=C===0){let q=String(a.D).match(mf)[1]||null;!q&&o.self&&o.self.location&&(q=o.self.location.protocol.slice(0,-1)),g=!Ew.test(q?q.toLowerCase():"")}f=g}if(f)rt(a,"complete"),rt(a,"success");else{a.o=6;try{var b=Cn(a)>2?a.g.statusText:""}catch{b=""}a.l=b+" ["+a.ca()+"]",Rf(a)}}finally{pa(a)}}}}function pa(a,h){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const f=a.g;a.g=null,h||rt(a,"ready");try{f.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function Cn(a){return a.g?a.g.readyState:0}n.ca=function(){try{return Cn(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(a){if(this.g){var h=this.g.responseText;return a&&h.indexOf(a)==0&&(h=h.substring(a.length)),ew(h)}};function bf(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function Tw(a){const h={};a=(a.g&&Cn(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<a.length;g++){if(y(a[g]))continue;var f=ow(a[g]);const b=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const C=h[b]||[];h[b]=C,C.push(f)}HE(h,function(g){return g.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Os(a,h,f){return f&&f.internalChannelParams&&f.internalChannelParams[a]||h}function Sf(a){this.za=0,this.i=[],this.j=new Rs,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Os("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Os("baseRetryDelayMs",5e3,a),this.Za=Os("retryDelaySeedMs",1e4,a),this.Ta=Os("forwardChannelMaxRetries",2,a),this.va=Os("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new lf(a&&a.concurrentRequestLimit),this.Ba=new Iw,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=Sf.prototype,n.ka=8,n.I=1,n.connect=function(a,h,f,g){it(0),this.W=a,this.H=h||{},f&&g!==void 0&&(this.H.OSID=f,this.H.OAID=g),this.F=this.X,this.J=Mf(this,null,this.W),ga(this)};function Du(a){if(Vf(a),a.I==3){var h=a.V++,f=Lt(a.J);if(me(f,"SID",a.M),me(f,"RID",h),me(f,"TYPE","terminate"),Ls(a,f),h=new bn(a,a.j,h),h.M=2,h.A=da(Lt(f)),f=!1,o.navigator&&o.navigator.sendBeacon)try{f=o.navigator.sendBeacon(h.A.toString(),"")}catch{}!f&&o.Image&&(new Image().src=h.A,f=!0),f||(h.g=Ff(h.j,null),h.g.ea(h.A)),h.F=Date.now(),ha(h)}Lf(a)}function ma(a){a.g&&(xu(a),a.g.cancel(),a.g=null)}function Vf(a){ma(a),a.v&&(o.clearTimeout(a.v),a.v=null),_a(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function ga(a){if(!hf(a.h)&&!a.m){a.m=!0;var h=a.Ea;ee||_(),re||(ee(),re=!0),w.add(h,a),a.D=0}}function vw(a,h){return df(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=h.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=As(l(a.Ea,a,h),Of(a,a.D)),a.D++,!0)}n.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const b=new bn(this,this.j,a);let C=this.o;if(this.U&&(C?(C=Bd(C),$d(C,this.U)):C=this.U),this.u!==null||this.R||(b.J=C,C=null),this.S)e:{for(var h=0,f=0;f<this.i.length;f++){t:{var g=this.i[f];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(h+=g,h>4096){h=f;break e}if(h===4096||f===this.i.length-1){h=f+1;break e}}h=1e3}else h=1e3;h=Nf(this,b,h),f=Lt(this.J),me(f,"RID",a),me(f,"CVER",22),this.G&&me(f,"X-HTTP-Session-Id",this.G),Ls(this,f),C&&(this.R?h="headers="+Ps(vf(C))+"&"+h:this.u&&Nu(f,this.u,C)),Su(this.h,b),this.Ra&&me(f,"TYPE","init"),this.S?(me(f,"$req",h),me(f,"SID","null"),b.U=!0,Au(b,f,null)):Au(b,f,h),this.I=2}}else this.I==3&&(a?Cf(this,a):this.i.length==0||hf(this.h)||Cf(this))};function Cf(a,h){var f;h?f=h.l:f=a.V++;const g=Lt(a.J);me(g,"SID",a.M),me(g,"RID",f),me(g,"AID",a.K),Ls(a,g),a.u&&a.o&&Nu(g,a.u,a.o),f=new bn(a,a.j,f,a.D+1),a.u===null&&(f.J=a.o),h&&(a.i=h.G.concat(a.i)),h=Nf(a,f,1e3),f.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),Su(a.h,f),Au(f,g,h)}function Ls(a,h){a.H&&oa(a.H,function(f,g){me(h,g,f)}),a.l&&oa({},function(f,g){me(h,g,f)})}function Nf(a,h,f){f=Math.min(a.i.length,f);const g=a.l?l(a.l.Ka,a.l,a):null;e:{var b=a.i;let Z=-1;for(;;){const Oe=["count="+f];Z==-1?f>0?(Z=b[0].g,Oe.push("ofs="+Z)):Z=0:Oe.push("ofs="+Z);let he=!0;for(let qe=0;qe<f;qe++){var C=b[qe].g;const Mt=b[qe].map;if(C-=Z,C<0)Z=Math.max(0,b[qe].g-100),he=!1;else try{C="req"+C+"_"||"";try{var q=Mt instanceof Map?Mt:Object.entries(Mt);for(const[vr,Nn]of q){let Dn=Nn;c(Nn)&&(Dn=Iu(Nn)),Oe.push(C+vr+"="+encodeURIComponent(Dn))}}catch(vr){throw Oe.push(C+"type="+encodeURIComponent("_badmap")),vr}}catch{g&&g(Mt)}}if(he){q=Oe.join("&");break e}}q=void 0}return a=a.i.splice(0,f),h.G=a,q}function Df(a){if(!a.g&&!a.v){a.Y=1;var h=a.Da;ee||_(),re||(ee(),re=!0),w.add(h,a),a.A=0}}function ku(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=As(l(a.Da,a),Of(a,a.A)),a.A++,!0)}n.Da=function(){if(this.v=null,kf(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=As(l(this.Wa,this),a)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,it(10),ma(this),kf(this))};function xu(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function kf(a){a.g=new bn(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var h=Lt(a.na);me(h,"RID","rpc"),me(h,"SID",a.M),me(h,"AID",a.K),me(h,"CI",a.F?"0":"1"),!a.F&&a.ia&&me(h,"TO",a.ia),me(h,"TYPE","xmlhttp"),Ls(a,h),a.u&&a.o&&Nu(h,a.u,a.o),a.O&&(a.g.H=a.O);var f=a.g;a=a.ba,f.M=1,f.A=da(Lt(h)),f.u=null,f.R=!0,af(f,a)}n.Va=function(){this.C!=null&&(this.C=null,ma(this),ku(this),it(19))};function _a(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function xf(a,h){var f=null;if(a.g==h){_a(a),xu(a),a.g=null;var g=2}else if(bu(a.h,h))f=h.G,ff(a.h,h),g=1;else return;if(a.I!=0){if(h.o)if(g==1){f=h.u?h.u.length:0,h=Date.now()-h.F;var b=a.D;g=ua(),rt(g,new tf(g,f)),ga(a)}else Df(a);else if(b=h.m,b==3||b==0&&h.X>0||!(g==1&&vw(a,h)||g==2&&ku(a)))switch(f&&f.length>0&&(h=a.h,h.i=h.i.concat(f)),b){case 1:Tr(a,5);break;case 4:Tr(a,10);break;case 3:Tr(a,6);break;default:Tr(a,2)}}}function Of(a,h){let f=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(f*=2),f*h}function Tr(a,h){if(a.j.info("Error code "+h),h==2){var f=l(a.bb,a),g=a.Ua;const b=!g;g=new Sn(g||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||Ss(g,"https"),da(g),b?_w(g.toString(),f):yw(g.toString(),f)}else it(2);a.I=0,a.l&&a.l.pa(h),Lf(a),Vf(a)}n.bb=function(a){a?(this.j.info("Successfully pinged google.com"),it(2)):(this.j.info("Failed to ping google.com"),it(1))};function Lf(a){if(a.I=0,a.ja=[],a.l){const h=pf(a.h);(h.length!=0||a.i.length!=0)&&(P(a.ja,h),P(a.ja,a.i),a.h.i.length=0,I(a.i),a.i.length=0),a.l.oa()}}function Mf(a,h,f){var g=f instanceof Sn?Lt(f):new Sn(f);if(g.g!="")h&&(g.g=h+"."+g.g),Vs(g,g.u);else{var b=o.location;g=b.protocol,h=h?h+"."+b.hostname:b.hostname,b=+b.port;const C=new Sn(null);g&&Ss(C,g),h&&(C.g=h),b&&Vs(C,b),f&&(C.h=f),g=C}return f=a.G,h=a.wa,f&&h&&me(g,f,h),me(g,"VER",a.ka),Ls(a,g),g}function Ff(a,h,f){if(h&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return h=a.Aa&&!a.ma?new ve(new Cu({ab:f})):new ve(a.ma),h.Fa(a.L),h}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Uf(){}n=Uf.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function ya(){}ya.prototype.g=function(a,h){return new yt(a,h)};function yt(a,h){Qe.call(this),this.g=new Sf(h),this.l=a,this.h=h&&h.messageUrlParams||null,a=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(a?a["X-WebChannel-Content-Type"]=h.messageContentType:a={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.sa&&(a?a["X-WebChannel-Client-Profile"]=h.sa:a={"X-WebChannel-Client-Profile":h.sa}),this.g.U=a,(a=h&&h.Qb)&&!y(a)&&(this.g.u=a),this.A=h&&h.supportsCrossDomainXhr||!1,this.v=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!y(h)&&(this.g.G=h,a=this.h,a!==null&&h in a&&(a=this.h,h in a&&delete a[h])),this.j=new ui(this)}p(yt,Qe),yt.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},yt.prototype.close=function(){Du(this.g)},yt.prototype.o=function(a){var h=this.g;if(typeof a=="string"){var f={};f.__data__=a,a=f}else this.v&&(f={},f.__data__=Iu(a),a=f);h.i.push(new uw(h.Ya++,a)),h.I==3&&ga(h)},yt.prototype.N=function(){this.g.l=null,delete this.j,Du(this.g),delete this.g,yt.Z.N.call(this)};function Bf(a){Eu.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var h=a.__sm__;if(h){e:{for(const f in h){a=f;break e}a=void 0}(this.i=a)&&(a=this.i,h=h!==null&&a in h?h[a]:void 0),this.data=h}else this.data=a}p(Bf,Eu);function qf(){wu.call(this),this.status=1}p(qf,wu);function ui(a){this.g=a}p(ui,Uf),ui.prototype.ra=function(){rt(this.g,"a")},ui.prototype.qa=function(a){rt(this.g,new Bf(a))},ui.prototype.pa=function(a){rt(this.g,new qf)},ui.prototype.oa=function(){rt(this.g,"b")},ya.prototype.createWebChannel=ya.prototype.g,yt.prototype.send=yt.prototype.o,yt.prototype.open=yt.prototype.m,yt.prototype.close=yt.prototype.close,gg=function(){return new ya},mg=function(){return ua()},pg=Ir,sl={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},la.NO_ERROR=0,la.TIMEOUT=8,la.HTTP_ERROR=6,xa=la,nf.COMPLETE="complete",fg=nf,Yd.EventType=Ts,Ts.OPEN="a",Ts.CLOSE="b",Ts.ERROR="c",Ts.MESSAGE="d",Qe.prototype.listen=Qe.prototype.J,Ks=Yd,ve.prototype.listenOnce=ve.prototype.K,ve.prototype.getLastError=ve.prototype.Ha,ve.prototype.getLastErrorCode=ve.prototype.ya,ve.prototype.getStatus=ve.prototype.ca,ve.prototype.getResponseJson=ve.prototype.La,ve.prototype.getResponseText=ve.prototype.la,ve.prototype.send=ve.prototype.ea,ve.prototype.setWithCredentials=ve.prototype.Fa,dg=ve}).apply(typeof Ea<"u"?Ea:typeof self<"u"?self:typeof window<"u"?window:{});/**
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
 */let ts="12.17.0";function QT(n){ts=n}/**
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
 */const Xn=new jl("@firebase/firestore");function _i(){return Xn.logLevel}function JT(n){Xn.setLogLevel(n)}function O(n,...e){if(Xn.logLevel<=ne.DEBUG){const t=e.map(Gl);Xn.debug(`Firestore (${ts}): ${n}`,...t)}}function be(n,...e){if(Xn.logLevel<=ne.ERROR){const t=e.map(Gl);Xn.error(`Firestore (${ts}): ${n}`,...t)}}function Fe(n,...e){if(Xn.logLevel<=ne.WARN){const t=e.map(Gl);Xn.warn(`Firestore (${ts}): ${n}`,...t)}}function Gl(n){if(typeof n=="string")return n;try{return(function(t){return JSON.stringify(t)})(n)}catch{return n}}/**
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
 */function j(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,_g(n,r,t)}function _g(n,e,t){let r=`FIRESTORE (${ts}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw be(r),new Error(r)}function L(n,e,t,r){let i="Unexpected state";typeof t=="string"?i=t:r=t,n||_g(e,i,r)}function YT(n,e){n||j(57014,e)}function B(n,e){return n}/**
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
 */function XT(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
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
 */class Rc{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=XT(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<t&&(r+=e.charAt(i[s]%62))}return r}}function Q(n,e){return n<e?-1:n>e?1:0}function ol(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const i=n.charAt(r),s=e.charAt(r);if(i!==s)return Fu(i)===Fu(s)?Q(i,s):Fu(i)?1:-1}return Q(n.length,e.length)}const ZT=55296,ev=57343;function Fu(n){const e=n.charCodeAt(0);return e>=ZT&&e<=ev}function Vi(n,e,t){return n.length===e.length&&n.every(((r,i)=>t(r,e[i])))}function yg(n){return n+"\0"}/**
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
 */class de{constructor(e,t){this.comparator=e,this.root=t||Ke.EMPTY}insert(e,t){return new de(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Ke.BLACK,null,null))}remove(e){return new de(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ke.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return t+r.left.size;i<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,r)=>(e(t,r),!1)))}toString(){const e=[];return this.inorderTraversal(((t,r)=>(e.push(`${t}:${r}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new wa(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new wa(this.root,e,this.comparator,!1)}getReverseIterator(){return new wa(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new wa(this.root,e,this.comparator,!0)}}class wa{constructor(e,t,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Ke{constructor(e,t,r,i,s){this.key=e,this.value=t,this.color=r??Ke.RED,this.left=i??Ke.EMPTY,this.right=s??Ke.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,i,s){return new Ke(e??this.key,t??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,r),null):s===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return Ke.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return Ke.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Ke.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Ke.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw j(43730,{key:this.key,value:this.value});if(this.right.isRed())throw j(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw j(27949);return e+(this.isRed()?0:1)}}Ke.EMPTY=null,Ke.RED=!0,Ke.BLACK=!1;Ke.EMPTY=new class{constructor(){this.size=0}get key(){throw j(57766)}get value(){throw j(16141)}get color(){throw j(16727)}get left(){throw j(29726)}get right(){throw j(36894)}copy(e,t,r,i,s){return this}insert(e,t,r){return new Ke(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class ce{constructor(e){this.comparator=e,this.data=new de(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,r)=>(e(t),!1)))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Qf(this.data.getIterator())}getIteratorFrom(e){return new Qf(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((r=>{t=t.add(r)})),t}isEqual(e){if(!(e instanceof ce)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new ce(this.comparator);return t.data=e,t}}class Qf{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function li(n){return n.hasNext()?n.getNext():void 0}/**
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
 */const S={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class k extends Ot{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */const Bt="__name__";class Ft{constructor(e,t,r){t===void 0?t=0:t>e.length&&j(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&j(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Ft.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Ft?e.forEach((r=>{t.push(r)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let i=0;i<r;i++){const s=Ft.compareSegments(e.get(i),t.get(i));if(s!==0)return s}return Q(e.length,t.length)}static compareSegments(e,t){const r=Ft.isNumericId(e),i=Ft.isNumericId(t);return r&&!i?-1:!r&&i?1:r&&i?Ft.extractNumericId(e).compare(Ft.extractNumericId(t)):ol(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return jn.fromString(e.substring(4,e.length-2))}}class X extends Ft{construct(e,t,r){return new X(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new k(S.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter((i=>i.length>0)))}return new X(t)}static emptyPath(){return new X([])}}const tv=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let Se=class yi extends Ft{construct(e,t,r){return new yi(e,t,r)}static isValidIdentifier(e){return tv.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),yi.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Bt}static keyField(){return new yi([Bt])}static fromServerFormat(e){const t=[];let r="",i=0;const s=()=>{if(r.length===0)throw new k(S.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;i<e.length;){const c=e[i];if(c==="\\"){if(i+1===e.length)throw new k(S.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[i+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new k(S.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,i+=2}else c==="`"?(o=!o,i++):c!=="."||o?(r+=c,i++):(s(),i++)}if(s(),o)throw new k(S.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new yi(t)}static emptyPath(){return new yi([])}};/**
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
 */class ht{constructor(e){this.fields=e,e.sort(Se.comparator)}static empty(){return new ht([])}unionWith(e){let t=new ce(Se.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new ht(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Vi(this.fields,e.fields,((t,r)=>t.isEqual(r)))}}/**
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
 */function Ja(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function hr(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function Wl(n,e){const t=[];for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&t.push(e(n[r],r,n));return t}function Ig(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
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
 */class F{constructor(e){this.path=e}static fromPath(e){return new F(X.fromString(e))}static fromName(e){return new F(X.fromString(e).popFirst(5))}static empty(){return new F(X.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&X.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return X.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new F(new X(e.slice()))}}/**
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
 */function Kl(n,e,t){if(!t)throw new k(S.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function Eg(n,e,t,r){if(e===!0&&r===!0)throw new k(S.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Jf(n){if(!F.isDocumentKey(n))throw new k(S.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Yf(n){if(F.isDocumentKey(n))throw new k(S.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function Fo(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Pc(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(r){return r.constructor?r.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":j(12329,{type:typeof n})}function te(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new k(S.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Pc(n);throw new k(S.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function wg(n,e){if(e<=0)throw new k(S.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${e}.`)}/**
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
 */function ke(n,e){const t={typeString:n};return e&&(t.value=e),t}function Yr(n,e){if(!Fo(n))throw new k(S.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const i=e[r].typeString,s="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const o=n[r];if(i&&typeof o!==i){t=`JSON field '${r}' must be a ${i}.`;break}if(s!==void 0&&o!==s.value){t=`Expected '${r}' field to equal '${s.value}'`;break}}if(t)throw new k(S.INVALID_ARGUMENT,t);return!0}/**
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
 */const Xf=-62135596800,Zf=1e6;class oe{static now(){return oe.fromMillis(Date.now())}static fromDate(e){return oe.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*Zf);return new oe(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new k(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new k(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<Xf)throw new k(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new k(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Zf}_compareTo(e){return this.seconds===e.seconds?Q(this.nanoseconds,e.nanoseconds):Q(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:oe._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Yr(e,oe._jsonSchema))return new oe(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-Xf;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}oe._jsonSchemaVersion="firestore/timestamp/1.0",oe._jsonSchema={type:ke("string",oe._jsonSchemaVersion),seconds:ke("number"),nanoseconds:ke("number")};/**
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
 */class Tg extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */function nv(){return typeof atob<"u"}/**
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
 */class pe{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new Tg("Invalid base64 string: "+s):s}})(e);return new pe(t)}static fromUint8Array(e){const t=(function(i){let s="";for(let o=0;o<i.length;++o)s+=String.fromCharCode(i[o]);return s})(e);return new pe(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Q(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}pe.EMPTY_BYTE_STRING=new pe("");const rv=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function mn(n){if(L(!!n,39018),typeof n=="string"){let e=0;const t=rv.exec(n);if(L(!!t,46558,{timestamp:n}),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:fe(n.seconds),nanos:fe(n.nanos)}}function fe(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function gn(n){return typeof n=="string"?pe.fromBase64String(n):pe.fromUint8Array(n)}/**
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
 */const vg="server_timestamp",Ag="__type__",Rg="__previous_value__",Pg="__local_write_time__";function Uo(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Ag])==null?void 0:r.stringValue)===vg}function Bo(n){const e=n.mapValue.fields[Rg];return Uo(e)?Bo(e):e}function Ci(n){const e=mn(n.mapValue.fields[Pg].timestampValue);return new oe(e.seconds,e.nanos)}/**
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
 */class iv{constructor(e,t,r,i,s,o,c,u,l,d,p,m,I){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=o,this.autoDetectLongPolling=c,this.longPollingOptions=u,this.useFetchStreams=l,this.isUsingEmulator=d,this.apiKey=p,this._customHeaders=m,this.grpcFlowControlWindow=I}}const Io="(default)";class Zn{constructor(e,t){this.projectId=e,this.database=t||Io}static empty(){return new Zn("","")}get isDefaultDatabase(){return this.database===Io}isEqual(e){return e instanceof Zn&&e.projectId===this.projectId&&e.database===this.database}}function sv(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new k(S.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Zn(n.options.projectId,e)}/**
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
 */const zn=-1;function qo(n){return n==null}function Ni(n){return n===0&&1/n==-1/0}function bg(n){return typeof n=="number"&&Number.isInteger(n)&&!Ni(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}function ov(n){return typeof n=="string"}/**
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
 */const Hl="__type__",Sg="__max__",qn={mapValue:{fields:{__type__:{stringValue:Sg}}}},Ql="__vector__",Br="value",Kt={nullValue:"NULL_VALUE"},mt={booleanValue:!0},ze={booleanValue:!1};function xe(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Uo(n)?4:Vg(n)?9007199254740991:$r(n)?10:11:j(28295,{value:n})}function bt(n,e,t){if(n===e)return!0;const r=xe(n);if(r!==xe(e))return!1;switch(r){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Ci(n).isEqual(Ci(e));case 3:return(function(s,o){if(typeof s.timestampValue=="string"&&typeof o.timestampValue=="string"&&s.timestampValue.length===o.timestampValue.length)return s.timestampValue===o.timestampValue;const c=mn(s.timestampValue),u=mn(o.timestampValue);return c.seconds===u.seconds&&c.nanos===u.nanos})(n,e);case 5:return n.stringValue===e.stringValue;case 6:return(function(s,o){return gn(s.bytesValue).isEqual(gn(o.bytesValue))})(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return(function(s,o){return fe(s.geoPointValue.latitude)===fe(o.geoPointValue.latitude)&&fe(s.geoPointValue.longitude)===fe(o.geoPointValue.longitude)})(n,e);case 2:return(function(s,o,c){if("integerValue"in s&&"integerValue"in o)return fe(s.integerValue)===fe(o.integerValue);let u,l;if("doubleValue"in s&&"doubleValue"in o)u=fe(s.doubleValue),l=fe(o.doubleValue);else{if(!(c!=null&&c.t))return!1;u=fe(s.integerValue??s.doubleValue),l=fe(o.integerValue??o.doubleValue)}return u===l?!!(c!=null&&c.i)||Ni(u)===Ni(l):!!(c===void 0||c.o)&&isNaN(u)&&isNaN(l)})(n,e,t);case 9:return Vi(n.arrayValue.values||[],e.arrayValue.values||[],((i,s)=>bt(i,s,t)));case 10:case 11:return(function(s,o,c){const u=s.mapValue.fields||{},l=o.mapValue.fields||{};if(Ja(u)!==Ja(l))return!1;for(const d in u)if(u.hasOwnProperty(d)&&(l[d]===void 0||!bt(u[d],l[d],c)))return!1;return!0})(n,e,t);default:return j(52216,{left:n})}}function Eo(n,e){return(n.values||[]).find((t=>bt(t,e)))!==void 0}function tt(n,e){if(n===e)return 0;const t=xe(n),r=xe(e);if(t!==r)return Q(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return Q(n.booleanValue,e.booleanValue);case 2:return(function(s,o){const c=fe(s.integerValue||s.doubleValue),u=fe(o.integerValue||o.doubleValue);return c<u?-1:c>u?1:c===u?0:isNaN(c)?isNaN(u)?0:-1:1})(n,e);case 3:return ep(n.timestampValue,e.timestampValue);case 4:return ep(Ci(n),Ci(e));case 5:return ol(n.stringValue,e.stringValue);case 6:return(function(s,o){const c=gn(s),u=gn(o);return c.compareTo(u)})(n.bytesValue,e.bytesValue);case 7:return(function(s,o){const c=s.split("/"),u=o.split("/");for(let l=0;l<c.length&&l<u.length;l++){const d=Q(c[l],u[l]);if(d!==0)return d}return Q(c.length,u.length)})(n.referenceValue,e.referenceValue);case 8:return(function(s,o){const c=Q(fe(s.latitude),fe(o.latitude));return c!==0?c:Q(fe(s.longitude),fe(o.longitude))})(n.geoPointValue,e.geoPointValue);case 9:return tp(n.arrayValue,e.arrayValue);case 10:return(function(s,o){var m,I,P,x;const c=s.fields||{},u=o.fields||{},l=(m=c[Br])==null?void 0:m.arrayValue,d=(I=u[Br])==null?void 0:I.arrayValue,p=Q(((P=l==null?void 0:l.values)==null?void 0:P.length)||0,((x=d==null?void 0:d.values)==null?void 0:x.length)||0);return p!==0?p:tp(l,d)})(n.mapValue,e.mapValue);case 11:return(function(s,o){if(s===qn.mapValue&&o===qn.mapValue)return 0;if(s===qn.mapValue)return 1;if(o===qn.mapValue)return-1;const c=s.fields||{},u=Object.keys(c),l=o.fields||{},d=Object.keys(l);u.sort(),d.sort();for(let p=0;p<u.length&&p<d.length;++p){const m=ol(u[p],d[p]);if(m!==0)return m;const I=tt(c[u[p]],l[d[p]]);if(I!==0)return I}return Q(u.length,d.length)})(n.mapValue,e.mapValue);default:throw j(23264,{u:t})}}function ep(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return Q(n,e);const t=mn(n),r=mn(e),i=Q(t.seconds,r.seconds);return i!==0?i:Q(t.nanos,r.nanos)}function tp(n,e){const t=n.values||[],r=e.values||[];for(let i=0;i<t.length&&i<r.length;++i){const s=tt(t[i],r[i]);if(s!==void 0&&s!==0)return s}return Q(t.length,r.length)}function Di(n){return al(n)}function al(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?(function(t){const r=mn(t);return`time(${r.seconds},${r.nanos})`})(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?(function(t){return gn(t).toBase64()})(n.bytesValue):"referenceValue"in n?(function(t){return F.fromName(t).toString()})(n.referenceValue):"geoPointValue"in n?(function(t){return`geo(${t.latitude},${t.longitude})`})(n.geoPointValue):"arrayValue"in n?(function(t){let r="[",i=!0;for(const s of t.values||[])i?i=!1:r+=",",r+=al(s);return r+"]"})(n.arrayValue):"mapValue"in n?(function(t){const r=Object.keys(t.fields||{}).sort();let i="{",s=!0;for(const o of r)s?s=!1:i+=",",i+=`${o}:${al(t.fields[o])}`;return i+"}"})(n.mapValue):j(61005,{value:n})}function Oa(n){switch(xe(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Bo(n);return e?16+Oa(e):16;case 5:return 2*n.stringValue.length;case 6:return gn(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return(function(r){return(r.values||[]).reduce(((i,s)=>i+Oa(s)),0)})(n.arrayValue);case 10:case 11:return(function(r){let i=0;return hr(r.fields,((s,o)=>{i+=s.length+Oa(o)})),i})(n.mapValue);default:throw j(13486,{value:n})}}function qr(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function qt(n){return!!n&&"integerValue"in n}function Dr(n){return!!n&&"doubleValue"in n}function er(n){return qt(n)||Dr(n)}function tr(n){return!!n&&"arrayValue"in n}function wt(n){return!!n&&"nullValue"in n}function gt(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Or(n){return!!n&&"mapValue"in n}function $r(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Hl])==null?void 0:r.stringValue)===Ql}function cl(n){var e,t;return(t=(((e=n==null?void 0:n.mapValue)==null?void 0:e.fields)||{})[Br])==null?void 0:t.arrayValue}function Xs(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return hr(n.mapValue.fields,((t,r)=>e.mapValue.fields[t]=Xs(r))),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Xs(n.arrayValue.values[t]);return e}return{...n}}function Vg(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===Sg}const Cg={mapValue:{fields:{[Hl]:{stringValue:Ql},[Br]:{arrayValue:{}}}}};function av(n){return"nullValue"in n?Kt:"booleanValue"in n?{booleanValue:!1}:"integerValue"in n||"doubleValue"in n?{doubleValue:NaN}:"timestampValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in n?{stringValue:""}:"bytesValue"in n?{bytesValue:""}:"referenceValue"in n?qr(Zn.empty(),F.empty()):"geoPointValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in n?{arrayValue:{}}:"mapValue"in n?$r(n)?Cg:{mapValue:{}}:j(35942,{value:n})}function cv(n){return"nullValue"in n?{booleanValue:!1}:"booleanValue"in n?{doubleValue:NaN}:"integerValue"in n||"doubleValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in n?{stringValue:""}:"stringValue"in n?{bytesValue:""}:"bytesValue"in n?qr(Zn.empty(),F.empty()):"referenceValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in n?{arrayValue:{}}:"arrayValue"in n?Cg:"mapValue"in n?$r(n)?{mapValue:{}}:qn:j(61959,{value:n})}function np(n,e){const t=tt(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?-1:!n.inclusive&&e.inclusive?1:0}function rp(n,e){const t=tt(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?1:!n.inclusive&&e.inclusive?-1:0}/**
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
 */class Le{constructor(e){this.value=e}static empty(){return new Le({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Or(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Xs(t)}setAll(e){let t=Se.emptyPath(),r={},i=[];e.forEach(((o,c)=>{if(!t.isImmediateParentOf(c)){const u=this.getFieldsMap(t);this.applyChanges(u,r,i),r={},i=[],t=c.popLast()}o?r[c.lastSegment()]=Xs(o):i.push(c.lastSegment())}));const s=this.getFieldsMap(t);this.applyChanges(s,r,i)}delete(e){const t=this.field(e.popLast());Or(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return bt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=t.mapValue.fields[e.get(r)];Or(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,r){hr(t,((i,s)=>e[i]=s));for(const i of r)delete e[i]}clone(){return new Le(Xs(this.value))}}function Ng(n){const e=[];return hr(n.fields,((t,r)=>{const i=new Se([t]);if(Or(r)){const s=Ng(r.mapValue).fields;if(s.length===0)e.push(i);else for(const o of s)e.push(i.child(o))}else e.push(i)})),new ht(e)}/**
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
 */function bc(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Ni(e)?"-0":e}}function Jl(n){return{integerValue:""+n}}function ns(n,e,t){return bg(e)?Jl(e):bc(n,e)}/**
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
 */class Sc{constructor(){this._=void 0}}function uv(n,e,t){return n instanceof ki?(function(i,s){const o={fields:{[Ag]:{stringValue:vg},[Pg]:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&Uo(s)&&(s=Bo(s)),s&&(o.fields[Rg]=s),{mapValue:o}})(t,e):n instanceof jr?kg(n,e):n instanceof zr?xg(n,e):n instanceof Gr?(function(i,s){const o=Dg(i,s),c=Ya(o)+Ya(i.l);return qt(o)&&qt(i.l)?Jl(c):bc(i.serializer,c)})(n,e):n instanceof xi?(function(i,s){return ip(i,s,Math.min)})(n,e):n instanceof Oi?(function(i,s){return ip(i,s,Math.max)})(n,e):void 0}function lv(n,e,t){return n instanceof jr?kg(n,e):n instanceof zr?xg(n,e):t}function Dg(n,e){return n instanceof Gr?er(e)?e:{integerValue:0}:null}class ki extends Sc{}class jr extends Sc{constructor(e){super(),this.elements=e}}function kg(n,e){const t=Og(e);for(const r of n.elements)t.some((i=>bt(i,r)))||t.push(r);return{arrayValue:{values:t}}}class zr extends Sc{constructor(e){super(),this.elements=e}}function xg(n,e){let t=Og(e);for(const r of n.elements)t=t.filter((i=>!bt(i,r)));return{arrayValue:{values:t}}}class Yl extends Sc{constructor(e,t){super(),this.serializer=e,this.l=t}}class Gr extends Yl{}class xi extends Yl{}class Oi extends Yl{}function ip(n,e,t){if(!er(e))return n.l;const r=t(Ya(e),Ya(n.l));return qt(e)&&qt(n.l)?Jl(r):bc(n.serializer,r)}function Ya(n){return fe(n.integerValue||n.doubleValue)}function Og(n){return tr(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
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
 */class Xr{constructor(e,t){this.field=e,this.transform=t}}function hv(n,e){return n.field.isEqual(e.field)&&(function(r,i){return r instanceof jr&&i instanceof jr||r instanceof zr&&i instanceof zr?Vi(r.elements,i.elements,bt):r instanceof Gr&&i instanceof Gr||r instanceof xi&&i instanceof xi||r instanceof Oi&&i instanceof Oi?bt(r.l,i.l):r instanceof ki&&i instanceof ki})(n.transform,e.transform)}class dv{constructor(e,t){this.version=e,this.transformResults=t}}class Ee{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Ee}static exists(e){return new Ee(void 0,e)}static updateTime(e){return new Ee(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function La(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Vc{}function Lg(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new is(n.key,Ee.none()):new rs(n.key,n.data,Ee.none());{const t=n.data,r=Le.empty();let i=new ce(Se.comparator);for(let s of e.fields)if(!i.has(s)){let o=t.field(s);o===null&&s.length>1&&(s=s.popLast(),o=t.field(s)),o===null?r.delete(s):r.set(s,o),i=i.add(s)}return new wn(n.key,r,new ht(i.toArray()),Ee.none())}}function fv(n,e,t){n instanceof rs?(function(i,s,o){const c=i.value.clone(),u=op(i.fieldTransforms,s,o.transformResults);c.setAll(u),s.convertToFoundDocument(o.version,c).setHasCommittedMutations()})(n,e,t):n instanceof wn?(function(i,s,o){if(!La(i.precondition,s))return void s.convertToUnknownDocument(o.version);const c=op(i.fieldTransforms,s,o.transformResults),u=s.data;u.setAll(Mg(i)),u.setAll(c),s.convertToFoundDocument(o.version,u).setHasCommittedMutations()})(n,e,t):(function(i,s,o){s.convertToNoDocument(o.version).setHasCommittedMutations()})(0,e,t)}function Zs(n,e,t,r){return n instanceof rs?(function(s,o,c,u){if(!La(s.precondition,o))return c;const l=s.value.clone(),d=ap(s.fieldTransforms,u,o);return l.setAll(d),o.convertToFoundDocument(o.version,l).setHasLocalMutations(),null})(n,e,t,r):n instanceof wn?(function(s,o,c,u){if(!La(s.precondition,o))return c;const l=ap(s.fieldTransforms,u,o),d=o.data;return d.setAll(Mg(s)),d.setAll(l),o.convertToFoundDocument(o.version,d).setHasLocalMutations(),c===null?null:c.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map((p=>p.field)))})(n,e,t,r):(function(s,o,c){return La(s.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):c})(n,e,t)}function pv(n,e){let t=null;for(const r of n.fieldTransforms){const i=e.data.field(r.field),s=Dg(r.transform,i||null);s!=null&&(t===null&&(t=Le.empty()),t.set(r.field,s))}return t||null}function sp(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!(function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&Vi(r,i,((s,o)=>hv(s,o)))})(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class rs extends Vc{constructor(e,t,r,i=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class wn extends Vc{constructor(e,t,r,i,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function Mg(n){const e=new Map;return n.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}})),e}function op(n,e,t){const r=new Map;L(n.length===t.length,32656,{h:t.length,T:n.length});for(let i=0;i<t.length;i++){const s=n[i],o=s.transform,c=e.data.field(s.field);r.set(s.field,lv(o,c,t[i]))}return r}function ap(n,e,t){const r=new Map;for(const i of n){const s=i.transform,o=t.data.field(i.field);r.set(i.field,uv(s,o,e))}return r}class is extends Vc{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Xl extends Vc{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class Fg{constructor(e,t,r){this.alias=e,this.aggregateType=t,this.fieldPath=r}}/**
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
 */class nr{constructor(e,t){this.position=e,this.inclusive=t}}function cp(n,e,t){let r=0;for(let i=0;i<n.position.length;i++){const s=e[i],o=n.position[i];if(s.field.isKeyField()?r=F.comparator(F.fromName(o.referenceValue),t.key):r=tt(o,t.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function up(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!bt(n.position[t],e.position[t]))return!1;return!0}/**
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
 */class Ug{}class ie extends Ug{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new mv(e,t,r):t==="array-contains"?new yv(e,r):t==="in"?new Gg(e,r):t==="not-in"?new Iv(e,r):t==="array-contains-any"?new Ev(e,r):new ie(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new gv(e,r):new _v(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(tt(t,this.value)):t!==null&&xe(this.value)===xe(t)&&this.matchesComparison(tt(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return j(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class ue extends Ug{constructor(e,t){super(),this.filters=e,this.op=t,this.P=null}static create(e,t){return new ue(e,t)}matches(e){return Li(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.P!==null||(this.P=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.P}getFilters(){return Object.assign([],this.filters)}}function Li(n){return n.op==="and"}function ul(n){return n.op==="or"}function Zl(n){return Bg(n)&&Li(n)}function Bg(n){for(const e of n.filters)if(e instanceof ue)return!1;return!0}function ll(n){if(n instanceof ie)return n.field.canonicalString()+n.op.toString()+Di(n.value);if(Zl(n))return n.filters.map((e=>ll(e))).join(",");{const e=n.filters.map((t=>ll(t))).join(",");return`${n.op}(${e})`}}function qg(n,e){return n instanceof ie?(function(r,i){return i instanceof ie&&r.op===i.op&&r.field.isEqual(i.field)&&bt(r.value,i.value)})(n,e):n instanceof ue?(function(r,i){return i instanceof ue&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce(((s,o,c)=>s&&qg(o,i.filters[c])),!0):!1})(n,e):void j(19439)}function $g(n,e){const t=n.filters.concat(e);return ue.create(t,n.op)}function jg(n){return n instanceof ie?(function(t){return`${t.field.canonicalString()} ${t.op} ${Di(t.value)}`})(n):n instanceof ue?(function(t){return t.op.toString()+" {"+t.getFilters().map(jg).join(" ,")+"}"})(n):"Filter"}class mv extends ie{constructor(e,t,r){super(e,t,r),this.key=F.fromName(r.referenceValue)}matches(e){const t=F.comparator(e.key,this.key);return this.matchesComparison(t)}}class gv extends ie{constructor(e,t){super(e,"in",t),this.keys=zg("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class _v extends ie{constructor(e,t){super(e,"not-in",t),this.keys=zg("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function zg(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((r=>F.fromName(r.referenceValue)))}class yv extends ie{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return tr(t)&&Eo(t.arrayValue,this.value)}}class Gg extends ie{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Eo(this.value.arrayValue,t)}}class Iv extends ie{constructor(e,t){super(e,"not-in",t)}matches(e){if(Eo(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Eo(this.value.arrayValue,t)}}class Ev extends ie{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!tr(t)||!t.arrayValue.values)&&t.arrayValue.values.some((r=>Eo(this.value.arrayValue,r)))}}/**
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
 */class wo{constructor(e,t="asc"){this.field=e,this.dir=t}}function wv(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
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
 */class K{static fromTimestamp(e){return new K(e)}static min(){return new K(new oe(0,0))}static max(){return new K(new oe(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */class ge{constructor(e,t,r,i,s,o,c){this.key=e,this.documentType=t,this.version=r,this.readTime=i,this.createTime=s,this.data=o,this.documentState=c}static newInvalidDocument(e){return new ge(e,0,K.min(),K.min(),K.min(),Le.empty(),0)}static newFoundDocument(e,t,r,i){return new ge(e,1,t,K.min(),r,i,0)}static newNoDocument(e,t){return new ge(e,2,t,K.min(),K.min(),Le.empty(),0)}static newUnknownDocument(e,t){return new ge(e,3,t,K.min(),K.min(),Le.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(K.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Le.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Le.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=K.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof ge&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new ge(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */const Mi=-1;class Fi{constructor(e,t,r,i){this.indexId=e,this.collectionGroup=t,this.fields=r,this.indexState=i}}function hl(n){return n.fields.find((e=>e.kind===2))}function Rr(n){return n.fields.filter((e=>e.kind!==2))}function Tv(n,e){let t=Q(n.collectionGroup,e.collectionGroup);if(t!==0)return t;for(let r=0;r<Math.min(n.fields.length,e.fields.length);++r)if(t=vv(n.fields[r],e.fields[r]),t!==0)return t;return Q(n.fields.length,e.fields.length)}Fi.UNKNOWN_ID=-1;class Lr{constructor(e,t){this.fieldPath=e,this.kind=t}}function vv(n,e){const t=Se.comparator(n.fieldPath,e.fieldPath);return t!==0?t:Q(n.kind,e.kind)}class Ui{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new Ui(0,vt.min())}}function Wg(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,i=K.fromTimestamp(r===1e9?new oe(t+1,0):new oe(t,r));return new vt(i,F.empty(),e)}function Kg(n){return new vt(n.readTime,n.key,Mi)}class vt{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new vt(K.min(),F.empty(),Mi)}static max(){return new vt(K.max(),F.empty(),Mi)}}function eh(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=F.comparator(n.documentKey,e.documentKey),t!==0?t:Q(n.largestBatchId,e.largestBatchId))}/**
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
 */class Av{constructor(e,t=null,r=[],i=[],s=null,o=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=o,this.endAt=c,this.R=null}}function dl(n,e=null,t=[],r=[],i=null,s=null,o=null){return new Av(n,e,t,r,i,s,o)}function Xa(n){const e=B(n);if(e.R===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((r=>ll(r))).join(","),t+="|ob:",t+=e.orderBy.map((r=>(function(s){return s.field.canonicalString()+s.dir})(r))).join(","),qo(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((r=>Di(r))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((r=>Di(r))).join(",")),e.R=t}return e.R}function th(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!wv(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!qg(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!up(n.startAt,e.startAt)&&up(n.endAt,e.endAt)}function tn(n){return!!n.isCorePipeline}function nh(n){return!!n.path&&F.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function Za(n,e){return n.filters.filter((t=>t instanceof ie&&t.field.isEqual(e)))}function lp(n,e,t){let r=Kt,i=!0;for(const s of Za(n,e)){let o=Kt,c=!0;switch(s.op){case"<":case"<=":o=av(s.value);break;case"==":case"in":case">=":o=s.value;break;case">":o=s.value,c=!1;break;case"!=":case"not-in":o=Kt}np({value:r,inclusive:i},{value:o,inclusive:c})<0&&(r=o,i=c)}if(t!==null){for(let s=0;s<n.orderBy.length;++s)if(n.orderBy[s].field.isEqual(e)){const o=t.position[s];np({value:r,inclusive:i},{value:o,inclusive:t.inclusive})<0&&(r=o,i=t.inclusive);break}}return{value:r,inclusive:i}}function hp(n,e,t){let r=qn,i=!0;for(const s of Za(n,e)){let o=qn,c=!0;switch(s.op){case">=":case">":o=cv(s.value),c=!1;break;case"==":case"in":case"<=":o=s.value;break;case"<":o=s.value,c=!1;break;case"!=":case"not-in":o=qn}rp({value:r,inclusive:i},{value:o,inclusive:c})>0&&(r=o,i=c)}if(t!==null){for(let s=0;s<n.orderBy.length;++s)if(n.orderBy[s].field.isEqual(e)){const o=t.position[s];rp({value:r,inclusive:i},{value:o,inclusive:t.inclusive})>0&&(r=o,i=t.inclusive);break}}return{value:r,inclusive:i}}/**
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
 */class Tn{constructor(e,t=null,r=[],i=[],s=null,o="F",c=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=o,this.startAt=c,this.endAt=u,this.I=null,this.A=null,this.V=null,this.startAt,this.endAt}}function Hg(n,e,t,r,i,s,o,c){return new Tn(n,e,t,r,i,s,o,c)}function ss(n){return new Tn(n)}function dp(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function Rv(n){return F.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function rh(n){return n.collectionGroup!==null}function wi(n){const e=B(n);if(e.I===null){e.I=[];const t=new Set;for(const s of e.explicitOrderBy)e.I.push(s),t.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let c=new ce(Se.comparator);return o.filters.forEach((u=>{u.getFlattenedFilters().forEach((l=>{l.isInequality()&&(c=c.add(l.field))}))})),c})(e).forEach((s=>{t.has(s.canonicalString())||s.isKeyField()||e.I.push(new wo(s,r))})),t.has(Se.keyField().canonicalString())||e.I.push(new wo(Se.keyField(),r))}return e.I}function Ze(n){const e=B(n);return e.A||(e.A=Jg(e,wi(n))),e.A}function Qg(n){const e=B(n);return e.V||(e.V=Jg(e,n.explicitOrderBy)),e.V}function Jg(n,e){if(n.limitType==="F")return dl(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map((i=>{const s=i.dir==="desc"?"asc":"desc";return new wo(i.field,s)}));const t=n.endAt?new nr(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new nr(n.startAt.position,n.startAt.inclusive):null;return dl(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function fl(n,e){const t=n.filters.concat([e]);return new Tn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function Pv(n,e){const t=n.explicitOrderBy.concat([e]);return new Tn(n.path,n.collectionGroup,t,n.filters.slice(),n.limit,n.limitType,n.startAt,n.endAt)}function ec(n,e,t){return new Tn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function bv(n,e){return new Tn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),n.limit,n.limitType,e,n.endAt)}function Sv(n,e){return new Tn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),n.limit,n.limitType,n.startAt,e)}function Yg(n,e){return th(Ze(n),Ze(e))&&n.limitType===e.limitType}function eo(n){return`Query(target=${(function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map((i=>jg(i))).join(", ")}]`),qo(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map((i=>(function(o){return`${o.field.canonicalString()} (${o.dir})`})(i))).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map((i=>Di(i))).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map((i=>Di(i))).join(",")),`Target(${r})`})(Ze(n))}; limitType=${n.limitType})`}function Cc(n,e){return e.isFoundDocument()&&(function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):F.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)})(n,e)&&(function(r,i){for(const s of wi(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0})(n,e)&&(function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0})(n,e)&&(function(r,i){return!(r.startAt&&!(function(o,c,u){const l=cp(o,c,u);return o.inclusive?l<=0:l<0})(r.startAt,wi(r),i)||r.endAt&&!(function(o,c,u){const l=cp(o,c,u);return o.inclusive?l>=0:l>0})(r.endAt,wi(r),i))})(n,e)}function Nc(n){return(e,t)=>{let r=!1;for(const i of wi(n)){const s=Vv(i,e,t);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function Vv(n,e,t){const r=n.field.isKeyField()?F.comparator(e.key,t.key):(function(s,o,c){const u=o.data.field(s),l=c.data.field(s);return u!==null&&l!==null?tt(u,l):j(42886)})(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return j(19790,{direction:n.dir})}}/**
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
 */class Cv{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var Ce,se;function Xg(n){switch(n){case S.OK:return j(64938);case S.CANCELLED:case S.UNKNOWN:case S.DEADLINE_EXCEEDED:case S.RESOURCE_EXHAUSTED:case S.INTERNAL:case S.UNAVAILABLE:case S.UNAUTHENTICATED:return!1;case S.INVALID_ARGUMENT:case S.NOT_FOUND:case S.ALREADY_EXISTS:case S.PERMISSION_DENIED:case S.FAILED_PRECONDITION:case S.ABORTED:case S.OUT_OF_RANGE:case S.UNIMPLEMENTED:case S.DATA_LOSS:return!0;default:return j(15467,{code:n})}}function Zg(n){if(n===void 0)return be("GRPC error has no .code"),S.UNKNOWN;switch(n){case Ce.OK:return S.OK;case Ce.CANCELLED:return S.CANCELLED;case Ce.UNKNOWN:return S.UNKNOWN;case Ce.DEADLINE_EXCEEDED:return S.DEADLINE_EXCEEDED;case Ce.RESOURCE_EXHAUSTED:return S.RESOURCE_EXHAUSTED;case Ce.INTERNAL:return S.INTERNAL;case Ce.UNAVAILABLE:return S.UNAVAILABLE;case Ce.UNAUTHENTICATED:return S.UNAUTHENTICATED;case Ce.INVALID_ARGUMENT:return S.INVALID_ARGUMENT;case Ce.NOT_FOUND:return S.NOT_FOUND;case Ce.ALREADY_EXISTS:return S.ALREADY_EXISTS;case Ce.PERMISSION_DENIED:return S.PERMISSION_DENIED;case Ce.FAILED_PRECONDITION:return S.FAILED_PRECONDITION;case Ce.ABORTED:return S.ABORTED;case Ce.OUT_OF_RANGE:return S.OUT_OF_RANGE;case Ce.UNIMPLEMENTED:return S.UNIMPLEMENTED;case Ce.DATA_LOSS:return S.DATA_LOSS;default:return j(39323,{code:n})}}(se=Ce||(Ce={}))[se.OK=0]="OK",se[se.CANCELLED=1]="CANCELLED",se[se.UNKNOWN=2]="UNKNOWN",se[se.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",se[se.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",se[se.NOT_FOUND=5]="NOT_FOUND",se[se.ALREADY_EXISTS=6]="ALREADY_EXISTS",se[se.PERMISSION_DENIED=7]="PERMISSION_DENIED",se[se.UNAUTHENTICATED=16]="UNAUTHENTICATED",se[se.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",se[se.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",se[se.ABORTED=10]="ABORTED",se[se.OUT_OF_RANGE=11]="OUT_OF_RANGE",se[se.UNIMPLEMENTED=12]="UNIMPLEMENTED",se[se.INTERNAL=13]="INTERNAL",se[se.UNAVAILABLE=14]="UNAVAILABLE",se[se.DATA_LOSS=15]="DATA_LOSS";/**
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
 */class vn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[t]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){hr(this.inner,((t,r)=>{for(const[i,s]of r)e(i,s)}))}isEmpty(){return Ig(this.inner)}size(){return this.innerSize}}/**
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
 */const Nv=new de(F.comparator);function De(){return Nv}const e_=new de(F.comparator);function br(...n){let e=e_;for(const t of n)e=e.insert(t.key,t);return e}function t_(n){let e=e_;return n.forEach(((t,r)=>e=e.insert(t,r.overlayedDocument))),e}function Rt(){return to()}function n_(){return to()}function to(){return new vn((n=>n.toString()),((n,e)=>n.isEqual(e)))}const Dv=new de(F.comparator),kv=new ce(F.comparator);function J(...n){let e=kv;for(const t of n)e=e.add(t);return e}const xv=new ce(Q);function ih(){return xv}/**
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
 */let no=null;function Ov(n){if(no)throw new Error("a TestingHooksSpi instance is already set");no=n}/**
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
 */function r_(){return new TextEncoder}/**
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
 */const Lv=new jn([4294967295,4294967295],0);function fp(n){const e=r_().encode(n),t=new hg;return t.update(e),new Uint8Array(t.digest())}function pp(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new jn([t,r],0),new jn([i,s],0)]}class sh{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Hs(`Invalid padding: ${t}`);if(r<0)throw new Hs(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Hs(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Hs(`Invalid padding when bitmap length is 0: ${t}`);this.m=8*e.length-t,this.p=jn.fromNumber(this.m)}v(e,t,r){let i=e.add(t.multiply(jn.fromNumber(r)));return i.compare(Lv)===1&&(i=new jn([i.getBits(0),i.getBits(1)],0)),i.modulo(this.p).toNumber()}S(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.m===0)return!1;const t=fp(e),[r,i]=pp(t);for(let s=0;s<this.hashCount;s++){const o=this.v(r,i,s);if(!this.S(o))return!1}return!0}static create(e,t,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),o=new sh(s,i,t);return r.forEach((c=>o.insert(c))),o}insert(e){if(this.m===0)return;const t=fp(e),[r,i]=pp(t);for(let s=0;s<this.hashCount;s++){const o=this.v(r,i,s);this.D(o)}}D(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Hs extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class os{constructor(e,t,r,i,s,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=i,this.augmentedDocumentUpdates=s,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const i=new Map;return i.set(e,$o.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new os(K.min(),i,new de(Q),De(),De(),J())}}class $o{constructor(e,t,r,i,s){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new $o(r,t,J(),J(),J())}}/**
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
 */class Ma{constructor(e,t,r,i){this.C=e,this.removedTargetIds=t,this.key=r,this.F=i}}class i_{constructor(e,t){this.targetId=e,this.O=t}}class s_{constructor(e,t,r=pe.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=i}}class mp{constructor(e){this.targetId=e,this.M=0,this.N=gp(),this.L=pe.EMPTY_BYTE_STRING,this.B=!1,this.U=!0}get current(){return this.B}get resumeToken(){return this.L}get k(){return this.M!==0}get q(){return this.U}$(e){e.approximateByteSize()>0&&(this.U=!0,this.L=e)}K(){let e=J(),t=J(),r=J();return this.N.forEach(((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:r=r.add(i);break;default:j(38017,{changeType:s})}})),new $o(this.L,this.B,e,t,r)}W(){this.U=!1,this.N=gp()}G(e,t){this.U=!0,this.N=this.N.insert(e,t)}j(e){this.U=!0,this.N=this.N.remove(e)}H(){this.M+=1}J(){this.M-=1,L(this.M>=0,3241,{M:this.M,targetId:this.targetId})}Y(){this.U=!0,this.B=!0}}const Ms="WatchChangeAggregator";class Mv{constructor(e){this.Z=e,this.X=new Map,this.ee=De(),this.te=Ta(),this.ne=De(),this.re=Ta(),this.ie=new de(Q)}se(e){for(const t of e.C)e.F&&e.F.isFoundDocument()?this._e(t,e.F):this.oe(t,e.key,e.F);for(const t of e.removedTargetIds)this.oe(t,e.key,e.F)}ae(e){this.forEachTarget(e,(t=>{const r=this.X.get(t);if(r)switch(e.state){case 0:this.ue(t)&&r.$(e.resumeToken);break;case 1:r.J(),r.k||r.W(),r.$(e.resumeToken);break;case 2:r.J(),r.k||this.removeTarget(t);break;case 3:this.ue(t)&&(r.Y(),r.$(e.resumeToken));break;case 4:this.ue(t)&&(this.ce(t),r.$(e.resumeToken));break;default:j(56790,{state:e.state})}else O(Ms,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.X.forEach(((r,i)=>{this.ue(i)&&t(i)}))}le(e){var t;return tn(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:nh(e)}Ee(e){const t=e.targetId,r=e.O.count,i=this.he(t);if(i){const s=i.target;if(this.le(s))if(r===0){const o=new F(tn(s)?X.fromString(s.getPipelineDocuments()[0]):s.path);this.oe(t,o,ge.newNoDocument(o,K.min()))}else L(r===1,20013,"Single document existence filter with count: "+r);else{const o=this.Te(t);if(o!==r){const c=this.Pe(e),u=c?this.Re(c,e,o):1;if(u!==0){this.ce(t);const l=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.ie=this.ie.insert(t,l)}no==null||no.Ie((function(d,p,m,I,P){var $,G,z;const x={localCacheCount:d,existenceFilterCount:p.count,databaseId:m.database,projectId:m.projectId},D=p.unchangedNames;return D&&(x.bloomFilter={applied:P===0,hashCount:(D==null?void 0:D.hashCount)??0,bitmapLength:((G=($=D==null?void 0:D.bits)==null?void 0:$.bitmap)==null?void 0:G.length)??0,padding:((z=D==null?void 0:D.bits)==null?void 0:z.padding)??0,mightContain:Y=>(I==null?void 0:I.mightContain(Y))??!1}),x})(o,e.O,this.Z.Ae(),c,u))}}}}Pe(e){const t=e.O.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=t;let o,c;try{o=gn(r).toUint8Array()}catch(u){if(u instanceof Tg)return Fe("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{c=new sh(o,i,s)}catch(u){return Fe(u instanceof Hs?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return c.m===0?null:c}Re(e,t,r){return t.O.count===r-this.Ve(e,t.targetId)?0:2}Ve(e,t){const r=this.Z.getRemoteKeysForTarget(t);let i=0;return r.forEach((s=>{const o=this.Z.Ae(),c=`projects/${o.projectId}/databases/${o.database}/documents/${s.path.canonicalString()}`;e.mightContain(c)||(this.oe(t,s,null),i++)})),i}de(e){const t=new Map;this.X.forEach(((s,o)=>{const c=this.he(o);if(c){if(s.current&&this.le(c.target)){const u=tn(c.target)?X.fromString(c.target.getPipelineDocuments()[0]):c.target.path,l=new F(u);this.fe(l).has(o)||this.me(o,l)||this.oe(o,l,ge.newNoDocument(l,e))}s.q&&(t.set(o,s.K()),s.W())}}));let r=J();this.re.forEach(((s,o)=>{let c=!0;o.forEachWhile((u=>{const l=this.he(u);return!l||l.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)})),c&&(r=r.add(s))})),this.ee.forEach(((s,o)=>o.setReadTime(e))),this.ne.forEach(((s,o)=>o.setReadTime(e)));const i=new os(e,t,this.ie,this.ee,this.ne,r);return this.ee=De(),this.te=Ta(),this.ne=De(),this.re=Ta(),this.ie=new de(Q),i}_e(e,t){const r=this.X.get(e);if(!r||!this.ue(e))return void O(Ms,`addDocumentToTarget received document for unknown inactive target (${e})`);const i=this.me(e,t.key)?2:0;r.G(t.key,i),tn(this.he(e).target)&&this.he(e).target.getPipelineFlavor()!=="exact"?this.ne=this.ne.insert(t.key,t):this.ee=this.ee.insert(t.key,t),this.te=this.te.insert(t.key,this.fe(t.key).add(e)),this.re=this.re.insert(t.key,this.pe(t.key).add(e))}oe(e,t,r){const i=this.X.get(e);i&&this.ue(e)?(this.me(e,t)?i.G(t,1):i.j(t),this.re=this.re.insert(t,this.pe(t).delete(e)),this.re=this.re.insert(t,this.pe(t).add(e)),r&&(tn(this.he(e).target)&&this.he(e).target.getPipelineFlavor()!=="exact"?this.ne=this.ne.insert(t,r):this.ee=this.ee.insert(t,r))):O(Ms,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.X.delete(e)}Te(e){const t=this.X.get(e);if(!t)return 0;const r=t.K();return this.Z.getRemoteKeysForTarget(e).size+r.addedDocuments.size-r.removedDocuments.size}H(e){let t=this.X.get(e);t||(O(Ms,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new mp(e),this.X.set(e,t)),t.H()}pe(e){let t=this.re.get(e);return t||(t=new ce(Q),this.re=this.re.insert(e,t)),t}fe(e){let t=this.te.get(e);return t||(t=new ce(Q),this.te=this.te.insert(e,t)),t}ue(e){const t=this.he(e)!==null;return t||O(Ms,"Detected inactive target",e),t}he(e){const t=this.X.get(e);return t===void 0||t.k?null:this.Z.ge(e)}ce(e){this.X.set(e,new mp(e)),this.Z.getRemoteKeysForTarget(e).forEach((t=>{this.oe(e,t,null)}))}me(e,t){return this.Z.getRemoteKeysForTarget(e).has(t)}}function Ta(){return new de(F.comparator)}function gp(){return new de(F.comparator)}const Fv={asc:"ASCENDING",desc:"DESCENDING"},Uv={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},Bv={and:"AND",or:"OR"};class qv{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function pl(n,e){return n.useProto3Json||qo(e)?e:{value:e}}function Bi(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function oh(n){const e=mn(n);return new oe(e.seconds,e.nanos)}function o_(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function Fa(n,e){return Bi(n,e.toTimestamp())}function Ve(n){return L(!!n,49232),K.fromTimestamp(oh(n))}function ah(n,e){return ml(n,e).canonicalString()}function ml(n,e){const t=(function(i){return new X(["projects",i.projectId,"databases",i.database])})(n).child("documents");return e===void 0?t:t.child(e)}function a_(n){const e=X.fromString(n);return L(__(e),10190,{key:e.toString()}),e}function qi(n,e){return ah(n.databaseId,e.path)}function Ht(n,e){const t=a_(e);if(t.get(1)!==n.databaseId.projectId)throw new k(S.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new k(S.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new F(l_(t))}function c_(n,e){return ah(n.databaseId,e)}function u_(n){const e=a_(n);return e.length===4?X.emptyPath():l_(e)}function gl(n){return new X(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function l_(n){return L(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function _p(n,e,t){return{name:qi(n,e),fields:t.value.mapValue.fields}}function Dc(n,e,t){const r=Ht(n,e.name),i=Ve(e.updateTime),s=e.createTime?Ve(e.createTime):K.min(),o=new Le({mapValue:{fields:e.fields}}),c=ge.newFoundDocument(r,i,s,o);return t&&c.setHasCommittedMutations(),t?c.setHasCommittedMutations():c}function $v(n,e){return"found"in e?(function(r,i){L(!!i.found,43571),i.found.name,i.found.updateTime;const s=Ht(r,i.found.name),o=Ve(i.found.updateTime),c=i.found.createTime?Ve(i.found.createTime):K.min(),u=new Le({mapValue:{fields:i.found.fields}});return ge.newFoundDocument(s,o,c,u)})(n,e):"missing"in e?(function(r,i){L(!!i.missing,3894),L(!!i.readTime,22933);const s=Ht(r,i.missing),o=Ve(i.readTime);return ge.newNoDocument(s,o)})(n,e):j(7234,{result:e})}function jv(n,e){let t;if("targetChange"in e){e.targetChange;const r=(function(l){return l==="NO_CHANGE"?0:l==="ADD"?1:l==="REMOVE"?2:l==="CURRENT"?3:l==="RESET"?4:j(39313,{state:l})})(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=(function(l,d){return l.useProto3Json?(L(d===void 0||typeof d=="string",58123),pe.fromBase64String(d||"")):(L(d===void 0||d instanceof Buffer||d instanceof Uint8Array,16193),pe.fromUint8Array(d||new Uint8Array))})(n,e.targetChange.resumeToken),o=e.targetChange.cause,c=o&&(function(l){const d=l.code===void 0?S.UNKNOWN:Zg(l.code);return new k(d,l.message||"")})(o);t=new s_(r,i,s,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=Ht(n,r.document.name),s=Ve(r.document.updateTime),o=r.document.createTime?Ve(r.document.createTime):K.min(),c=new Le({mapValue:{fields:r.document.fields}}),u=ge.newFoundDocument(i,s,o,c),l=r.targetIds||[],d=r.removedTargetIds||[];t=new Ma(l,d,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=Ht(n,r.document),s=r.readTime?Ve(r.readTime):K.min(),o=ge.newNoDocument(i,s),c=r.removedTargetIds||[];t=new Ma([],c,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=Ht(n,r.document),s=r.removedTargetIds||[];t=new Ma([],s,i,null)}else{if(!("filter"in e))return j(11601,{ye:e});{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,o=new Cv(i,s),c=r.targetId;t=new i_(c,o)}}return t}function To(n,e){let t;if(e instanceof rs)t={update:_p(n,e.key,e.value)};else if(e instanceof is)t={delete:qi(n,e.key)};else if(e instanceof wn)t={update:_p(n,e.key,e.data),updateMask:Qv(e.fieldMask)};else{if(!(e instanceof Xl))return j(16599,{we:e.type});t={verify:qi(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((r=>(function(s,o){const c=o.transform;if(c instanceof ki)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof jr)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof zr)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof Gr)return{fieldPath:o.field.canonicalString(),increment:c.l};if(c instanceof xi)return{fieldPath:o.field.canonicalString(),minimum:c.l};if(c instanceof Oi)return{fieldPath:o.field.canonicalString(),maximum:c.l};throw j(20930,{transform:o.transform})})(0,r)))),e.precondition.isNone||(t.currentDocument=(function(i,s){return s.updateTime!==void 0?{updateTime:Fa(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:j(27497)})(n,e.precondition)),t}function _l(n,e){const t=e.currentDocument?(function(s){return s.updateTime!==void 0?Ee.updateTime(Ve(s.updateTime)):s.exists!==void 0?Ee.exists(s.exists):Ee.none()})(e.currentDocument):Ee.none(),r=e.updateTransforms?e.updateTransforms.map((i=>(function(o,c){let u=null;if("setToServerValue"in c)L(c.setToServerValue==="REQUEST_TIME",16630,{proto:c}),u=new ki;else if("appendMissingElements"in c){const d=c.appendMissingElements.values||[];u=new jr(d)}else if("removeAllFromArray"in c){const d=c.removeAllFromArray.values||[];u=new zr(d)}else"increment"in c?u=new Gr(o,c.increment):"minimum"in c?u=new xi(o,c.minimum):"maximum"in c?u=new Oi(o,c.maximum):j(16584,{proto:c});const l=Se.fromServerFormat(c.fieldPath);return new Xr(l,u)})(n,i))):[];if(e.update){e.update.name;const i=Ht(n,e.update.name),s=new Le({mapValue:{fields:e.update.fields}});if(e.updateMask){const o=(function(u){const l=u.fieldPaths||[];return new ht(l.map((d=>Se.fromServerFormat(d))))})(e.updateMask);return new wn(i,s,o,t,r)}return new rs(i,s,t,r)}if(e.delete){const i=Ht(n,e.delete);return new is(i,t)}if(e.verify){const i=Ht(n,e.verify);return new Xl(i,t)}return j(1463,{proto:e})}function zv(n,e){return n&&n.length>0?(L(e!==void 0,14353),n.map((t=>(function(i,s){let o=i.updateTime?Ve(i.updateTime):Ve(s);return o.isEqual(K.min())&&(o=Ve(s)),new dv(o,i.transformResults||[])})(t,e)))):[]}function h_(n,e){return{documents:[c_(n,e.path)]}}function kc(n,e){const t={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=c_(n,i);const s=(function(l){if(l.length!==0)return g_(ue.create(l,"and"))})(e.filters);s&&(t.structuredQuery.where=s);const o=(function(l){if(l.length!==0)return l.map((d=>(function(m){return{field:Fn(m.field),direction:Wv(m.dir)}})(d)))})(e.orderBy);o&&(t.structuredQuery.orderBy=o);const c=pl(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=(function(l){return{before:l.inclusive,values:l.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(l){return{before:!l.inclusive,values:l.position}})(e.endAt)),{be:t,parent:i}}function d_(n,e,t,r){const{be:i,parent:s}=kc(n,e),o={},c=[];let u=0;return t.forEach((l=>{const d=r?l.alias:"aggregate_"+u++;o[d]=l.alias,l.aggregateType==="count"?c.push({alias:d,count:{}}):l.aggregateType==="avg"?c.push({alias:d,avg:{field:Fn(l.fieldPath)}}):l.aggregateType==="sum"&&c.push({alias:d,sum:{field:Fn(l.fieldPath)}})})),{request:{structuredAggregationQuery:{aggregations:c,structuredQuery:i.structuredQuery},parent:i.parent},ve:o,parent:s}}function f_(n){let e=u_(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let i=null;if(r>0){L(r===1,65062);const d=t.from[0];d.allDescendants?i=d.collectionId:e=e.child(d.collectionId)}let s=[];t.where&&(s=(function(p){const m=m_(p);return m instanceof ue&&Zl(m)?m.getFilters():[m]})(t.where));let o=[];t.orderBy&&(o=(function(p){return p.map((m=>(function(P){return new wo(Ii(P.field),(function(D){switch(D){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(P.direction))})(m)))})(t.orderBy));let c=null;t.limit&&(c=(function(p){let m;return m=typeof p=="object"?p.value:p,qo(m)?null:m})(t.limit));let u=null;t.startAt&&(u=(function(p){const m=!!p.before,I=p.values||[];return new nr(I,m)})(t.startAt));let l=null;return t.endAt&&(l=(function(p){const m=!p.before,I=p.values||[];return new nr(I,m)})(t.endAt)),Hg(e,i,o,s,c,"F",u,l)}function Gv(n,e){const t=(function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return j(28987,{purpose:i})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function p_(n,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(n)))}}}}function m_(n){return n.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Ii(t.unaryFilter.field);return ie.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=Ii(t.unaryFilter.field);return ie.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=Ii(t.unaryFilter.field);return ie.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Ii(t.unaryFilter.field);return ie.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return j(61313);default:return j(60726)}})(n):n.fieldFilter!==void 0?(function(t){return ie.create(Ii(t.fieldFilter.field),(function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return j(58110);default:return j(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(n):n.compositeFilter!==void 0?(function(t){return ue.create(t.compositeFilter.filters.map((r=>m_(r))),(function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return j(1026)}})(t.compositeFilter.op))})(n):j(30097,{filter:n})}function Wv(n){return Fv[n]}function Kv(n){return Uv[n]}function Hv(n){return Bv[n]}function Fn(n){return{fieldPath:n.canonicalString()}}function Ii(n){return Se.fromServerFormat(n.fieldPath)}function g_(n){return n instanceof ie?(function(t){if(t.op==="=="){if(gt(t.value))return{unaryFilter:{field:Fn(t.field),op:"IS_NAN"}};if(wt(t.value))return{unaryFilter:{field:Fn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(gt(t.value))return{unaryFilter:{field:Fn(t.field),op:"IS_NOT_NAN"}};if(wt(t.value))return{unaryFilter:{field:Fn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Fn(t.field),op:Kv(t.op),value:t.value}}})(n):n instanceof ue?(function(t){const r=t.getFilters().map((i=>g_(i)));return r.length===1?r[0]:{compositeFilter:{op:Hv(t.op),filters:r}}})(n):j(54877,{filter:n})}function Qv(n){const e=[];return n.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function __(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function y_(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}function vo(n,e){const t={fields:{}};return e.forEach(((r,i)=>{if(typeof i!="string")throw new Error(`Cannot encode map with non-string key: ${i}`);t.fields[i]=r._toProto(n)})),{mapValue:t}}function I_(n){return{stringValue:n}}/**
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
 */function Zr(n){return new qv(n,!0)}/**
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
 */class ut{constructor(e){this._byteString=e}static fromBase64String(e){try{return new ut(pe.fromBase64String(e))}catch(t){throw new k(S.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new ut(pe.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:ut._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Yr(e,ut._jsonSchema))return ut.fromBase64String(e.bytes)}}ut._jsonSchemaVersion="firestore/bytes/1.0",ut._jsonSchema={type:ke("string",ut._jsonSchemaVersion),bytes:ke("string")};/**
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
 */class ei{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new k(S.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Se(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function E_(){return new ei(Bt)}/**
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
 */class en{constructor(e){this._methodName=e}}/**
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
 */class Nt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new k(S.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new k(S.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Q(this._lat,e._lat)||Q(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Nt._jsonSchemaVersion}}static fromJSON(e){if(Yr(e,Nt._jsonSchema))return new Nt(e.latitude,e.longitude)}}Nt._jsonSchemaVersion="firestore/geoPoint/1.0",Nt._jsonSchema={type:ke("string",Nt._jsonSchemaVersion),latitude:ke("number"),longitude:ke("number")};/**
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
 */class je{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}je.UNAUTHENTICATED=new je(null),je.GOOGLE_CREDENTIALS=new je("google-credentials-uid"),je.FIRST_PARTY=new je("first-party-uid"),je.MOCK_USER=new je("mock-user");/**
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
 */class Ge{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
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
 */class w_{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class T_{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(je.UNAUTHENTICATED)))}shutdown(){}}class Jv{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class Yv{constructor(e){this.Se=e,this.currentUser=je.UNAUTHENTICATED,this.De=0,this.forceRefresh=!1,this.auth=null}start(e,t){L(this.xe===void 0,42304);let r=this.De;const i=u=>this.De!==r?(r=this.De,t(u)):Promise.resolve();let s=new Ge;this.xe=()=>{this.De++,this.currentUser=this.Ce(),s.resolve(),s=new Ge,e.enqueueRetryable((()=>i(this.currentUser)))};const o=()=>{const u=s;e.enqueueRetryable((async()=>{await u.promise,await i(this.currentUser)}))},c=u=>{O("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.xe&&(this.auth.addAuthTokenListener(this.xe),o())};this.Se.onInit((u=>c(u))),setTimeout((()=>{if(!this.auth){const u=this.Se.getImmediate({optional:!0});u?c(u):(O("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new Ge)}}),0),o()}getToken(){const e=this.De,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((r=>this.De!==e?(O("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(L(typeof r.accessToken=="string",31837,{Fe:r}),new w_(r.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.xe&&this.auth.removeAuthTokenListener(this.xe),this.xe=void 0}Ce(){const e=this.auth&&this.auth.getUid();return L(e===null||typeof e=="string",2055,{Oe:e}),new je(e)}}class Xv{constructor(e,t,r){this.Me=e,this.Ne=t,this.Le=r,this.type="FirstParty",this.user=je.FIRST_PARTY,this.Be=new Map}Ue(){return this.Le?this.Le():null}get headers(){this.Be.set("X-Goog-AuthUser",this.Me);const e=this.Ue();return e&&this.Be.set("Authorization",e),this.Ne&&this.Be.set("X-Goog-Iam-Authorization-Token",this.Ne),this.Be}}class Zv{constructor(e,t,r){this.Me=e,this.Ne=t,this.Le=r}getToken(){return Promise.resolve(new Xv(this.Me,this.Ne,this.Le))}start(e,t){e.enqueueRetryable((()=>t(je.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class yl{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class eA{constructor(e,t){this.ke=t,this.forceRefresh=!1,this.appCheck=null,this.qe=null,this.$e=null,_e(e)&&e.settings.appCheckToken&&(this.$e=e.settings.appCheckToken)}start(e,t){L(this.xe===void 0,3512);const r=s=>{s.error!=null&&O("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const o=s.token!==this.qe;return this.qe=s.token,O("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(s.token):Promise.resolve()};this.xe=s=>{e.enqueueRetryable((()=>r(s)))};const i=s=>{O("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.xe&&this.appCheck.addTokenListener(this.xe)};this.ke.onInit((s=>i(s))),setTimeout((()=>{if(!this.appCheck){const s=this.ke.getImmediate({optional:!0});s?i(s):O("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.$e)return Promise.resolve(new yl(this.$e));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(L(typeof t.token=="string",44558,{tokenResult:t}),this.qe=t.token,new yl(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.xe&&this.appCheck.removeTokenListener(this.xe),this.xe=void 0}}class tA{getToken(){return Promise.resolve(new yl(""))}invalidateToken(){}start(e,t){}shutdown(){}}function v_(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
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
 */class nA{Ke(e){}shutdown(){}}/**
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
 */const yp="ConnectivityMonitor";class Ip{constructor(){this.We=()=>this.Qe(),this.Ge=()=>this.ze(),this.je=[],this.He()}Ke(e){this.je.push(e)}shutdown(){window.removeEventListener("online",this.We),window.removeEventListener("offline",this.Ge)}He(){window.addEventListener("online",this.We),window.addEventListener("offline",this.Ge)}Qe(){O(yp,"Network connectivity changed: AVAILABLE");for(const e of this.je)e(0)}ze(){O(yp,"Network connectivity changed: UNAVAILABLE");for(const e of this.je)e(1)}static Je(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let va=null;function Il(){return va===null?va=(function(){return 268435456+Math.round(2147483648*Math.random())})():va++,"0x"+va.toString(16)}/**
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
 */const Uu="RestConnection",rA={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class iA{get Ye(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Ze=t+"://"+e.host,this.Xe=`projects/${r}/databases/${i}`,this.et=this.databaseId.database===Io?`project_id=${r}`:`project_id=${r}&database_id=${i}`}tt(e,t,r,i,s){const o=Il(),c=this.nt(e,t.toUriEncodedString());O(Uu,`Sending RPC '${e}' ${o}:`,c,r);const u={"google-cloud-resource-prefix":this.Xe,"x-goog-request-params":this.et};this.rt(u,i,s);const{host:l}=new URL(c),d=ur(l);return this.it(e,c,u,r,d).then((p=>(O(Uu,`Received RPC '${e}' ${o}: `,p),p)),(p=>{throw Fe(Uu,`RPC '${e}' ${o} failed with error: `,p,"url: ",c,"request:",r),p}))}st(e,t,r,i,s,o){return this.tt(e,t,r,i,s)}rt(e,t,r){if(e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+ts})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((i,s)=>e[s]=i)),r&&r.headers.forEach(((i,s)=>e[s]=i)),this.databaseInfo._customHeaders)for(const i of Object.keys(this.databaseInfo._customHeaders))e[i]=this.databaseInfo._customHeaders[i]}nt(e,t){const r=rA[e];let i=`${this.Ze}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(i=`${i}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),i}terminate(){}}/**
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
 */class sA{constructor(e){this._t=e._t,this.ot=e.ot}ut(e){this.ct=e}lt(e){this.Et=e}ht(e){this.Tt=e}onMessage(e){this.Pt=e}close(){this.ot()}send(e){this._t(e)}Rt(){this.ct()}It(){this.Et()}At(e){this.Tt(e)}Vt(e){this.Pt(e)}}/**
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
 */const Je="WebChannelConnection",Fs=(n,e,t)=>{n.listen(e,(r=>{try{t(r)}catch(i){setTimeout((()=>{throw i}),0)}}))};class Ti extends iA{constructor(e){super(e),this.dt=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static ft(){if(!Ti.gt){const e=mg();Fs(e,pg.STAT_EVENT,(t=>{t.stat===sl.PROXY?O(Je,"STAT_EVENT: detected buffering proxy"):t.stat===sl.NOPROXY&&O(Je,"STAT_EVENT: detected no buffering proxy")})),Ti.gt=!0}}it(e,t,r,i,s){const o=Il();return new Promise(((c,u)=>{const l=new dg;l.setWithCredentials(!0),l.listenOnce(fg.COMPLETE,(()=>{try{switch(l.getLastErrorCode()){case xa.NO_ERROR:const p=l.getResponseJson();O(Je,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(p)),c(p);break;case xa.TIMEOUT:O(Je,`RPC '${e}' ${o} timed out`),u(new k(S.DEADLINE_EXCEEDED,"Request time out"));break;case xa.HTTP_ERROR:const m=l.getStatus();if(O(Je,`RPC '${e}' ${o} failed with status:`,m,"response text:",l.getResponseText()),m>0){let I=l.getResponseJson();Array.isArray(I)&&(I=I[0]);const P=I==null?void 0:I.error;if(P&&P.status&&P.message){const x=(function($){const G=$.toLowerCase().replace(/_/g,"-");return Object.values(S).indexOf(G)>=0?G:S.UNKNOWN})(P.status);u(new k(x,P.message))}else u(new k(S.UNKNOWN,"Server responded with status "+l.getStatus()))}else u(new k(S.UNAVAILABLE,"Connection failed."));break;default:j(9055,{yt:e,streamId:o,wt:l.getLastErrorCode(),bt:l.getLastError()})}}finally{O(Je,`RPC '${e}' ${o} completed.`)}}));const d=JSON.stringify(i);O(Je,`RPC '${e}' ${o} sending request:`,i),l.send(t,"POST",d,r,15)}))}vt(e,t,r){const i=Il(),s=[this.Ze,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=this.createWebChannelTransport(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(c.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(c.useFetchStreams=!0),this.rt(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const l=s.join("");O(Je,`Creating RPC '${e}' stream ${i}: ${l}`,c);const d=o.createWebChannel(l,c);this.St(d);let p=!1,m=!1;const I=new sA({_t:P=>{m?O(Je,`Not sending because RPC '${e}' stream ${i} is closed:`,P):(p||(O(Je,`Opening RPC '${e}' stream ${i} transport.`),d.open(),p=!0),O(Je,`RPC '${e}' stream ${i} sending:`,P),d.send(P))},ot:()=>d.close()});return Fs(d,Ks.EventType.OPEN,(()=>{m||(O(Je,`RPC '${e}' stream ${i} transport opened.`),I.Rt())})),Fs(d,Ks.EventType.CLOSE,(()=>{m||(m=!0,O(Je,`RPC '${e}' stream ${i} transport closed`),I.At(),this.Dt(d))})),Fs(d,Ks.EventType.ERROR,(P=>{m||(m=!0,Fe(Je,`RPC '${e}' stream ${i} transport errored. Name:`,P.name,"Message:",P.message),I.At(new k(S.UNAVAILABLE,"The operation could not be completed")))})),Fs(d,Ks.EventType.MESSAGE,(P=>{var x;if(!m){const D=P.data[0];L(!!D,16349);const $=D,G=($==null?void 0:$.error)||((x=$[0])==null?void 0:x.error);if(G){O(Je,`RPC '${e}' stream ${i} received error:`,G);const z=G.status;let Y=(function(w){const _=Ce[w];if(_!==void 0)return Zg(_)})(z),ee=G.message;z==="NOT_FOUND"&&ee.includes("database")&&ee.includes("does not exist")&&ee.includes(this.databaseId.database)&&Fe(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),Y===void 0&&(Y=S.INTERNAL,ee="Unknown error status: "+z+" with message "+G.message),m=!0,I.At(new k(Y,ee)),d.close()}else O(Je,`RPC '${e}' stream ${i} received:`,D),I.Vt(D)}})),Ti.ft(),setTimeout((()=>{I.It()}),0),I}terminate(){this.dt.forEach((e=>e.close())),this.dt=[]}St(e){this.dt.push(e)}Dt(e){this.dt=this.dt.filter((t=>t===e))}rt(e,t,r){super.rt(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return gg()}}/**
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
 */function oA(n){return new Ti(n)}Ti.gt=!1;class ch{constructor(e,t,r=1e3,i=1.5,s=6e4){this.xt=e,this.timerId=t,this.Ct=r,this.Ft=i,this.Ot=s,this.Mt=0,this.Nt=null,this.Lt=Date.now(),this.reset()}reset(){this.Mt=0}Bt(){this.Mt=this.Ot}Ut(e){this.cancel();const t=Math.floor(this.Mt+this.kt()),r=Math.max(0,Date.now()-this.Lt),i=Math.max(0,t-r);i>0&&O("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.Mt} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.Nt=this.xt.enqueueAfterDelay(this.timerId,i,(()=>(this.Lt=Date.now(),e()))),this.Mt*=this.Ft,this.Mt<this.Ct&&(this.Mt=this.Ct),this.Mt>this.Ot&&(this.Mt=this.Ot)}qt(){this.Nt!==null&&(this.Nt.skipDelay(),this.Nt=null)}cancel(){this.Nt!==null&&(this.Nt.cancel(),this.Nt=null)}kt(){return(Math.random()-.5)*this.Mt}}/**
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
 */const Ep="PersistentStream";class A_{constructor(e,t,r,i,s,o,c,u){this.xt=e,this.$t=r,this.Kt=i,this.connection=s,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=c,this.listener=u,this.state=0,this.Wt=0,this.Qt=null,this.Gt=null,this.stream=null,this.zt=0,this.jt=new ch(e,t)}Ht(){return this.state===1||this.state===5||this.Jt()}Jt(){return this.state===2||this.state===3}start(){this.zt=0,this.state!==4?this.auth():this.Yt()}async stop(){this.Ht()&&await this.close(0)}Zt(){this.state=0,this.jt.reset()}Xt(){this.Jt()&&this.Qt===null&&(this.Qt=this.xt.enqueueAfterDelay(this.$t,6e4,(()=>this.en())))}tn(e){this.nn(),this.stream.send(e)}async en(){if(this.Jt())return this.close(0)}nn(){this.Qt&&(this.Qt.cancel(),this.Qt=null)}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}async close(e,t){this.nn(),this.rn(),this.jt.cancel(),this.Wt++,e!==4?this.jt.reset():t&&t.code===S.RESOURCE_EXHAUSTED?(be(t.toString()),be("Using maximum backoff delay to prevent overloading the backend."),this.jt.Bt()):t&&t.code===S.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.sn(),this.stream.close(),this.stream=null),this.state=e,await this.listener.ht(t)}sn(){}auth(){this.state=1;const e=this._n(this.Wt),t=this.Wt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([r,i])=>{this.Wt===t&&this.an(r,i)}),(r=>{e((()=>{const i=new k(S.UNKNOWN,"Fetching auth token failed: "+r.message);return this.un(i)}))}))}an(e,t){const r=this._n(this.Wt);this.stream=this.cn(e,t),this.stream.ut((()=>{r((()=>this.listener.ut()))})),this.stream.lt((()=>{r((()=>(this.state=2,this.Gt=this.xt.enqueueAfterDelay(this.Kt,1e4,(()=>(this.Jt()&&(this.state=3),Promise.resolve()))),this.listener.lt())))})),this.stream.ht((i=>{r((()=>this.un(i)))})),this.stream.onMessage((i=>{r((()=>++this.zt==1?this.En(i):this.onNext(i)))}))}Yt(){this.state=5,this.jt.Ut((async()=>{this.state=0,this.start()}))}un(e){return O(Ep,`close with error: ${e}`),this.stream=null,this.close(4,e)}_n(e){return t=>{this.xt.enqueueAndForget((()=>this.Wt===e?t():(O(Ep,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class aA extends A_{constructor(e,t,r,i,s,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,i,o),this.serializer=s}cn(e,t){return this.connection.vt("Listen",e,t)}En(e){return this.onNext(e)}onNext(e){this.jt.reset();const t=jv(this.serializer,e),r=(function(s){if(!("targetChange"in s))return K.min();const o=s.targetChange;return o.targetIds&&o.targetIds.length?K.min():o.readTime?Ve(o.readTime):K.min()})(e);return this.listener.hn(t,r)}Tn(e){const t={};t.database=gl(this.serializer),t.addTarget=(function(s,o){let c;const u=o.target;if(c=tn(u)?{pipelineQuery:p_(s,u)}:nh(u)?{documents:h_(s,u)}:{query:kc(s,u).be},c.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){c.resumeToken=o_(s,o.resumeToken);const l=pl(s,o.expectedCount);l!==null&&(c.expectedCount=l)}else if(o.snapshotVersion.compareTo(K.min())>0){c.readTime=Bi(s,o.snapshotVersion.toTimestamp());const l=pl(s,o.expectedCount);l!==null&&(c.expectedCount=l)}return c})(this.serializer,e);const r=Gv(this.serializer,e);r&&(t.labels=r),this.tn(t)}Pn(e){const t={};t.database=gl(this.serializer),t.removeTarget=e,this.tn(t)}}class cA extends A_{constructor(e,t,r,i,s,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,i,o),this.serializer=s}get Rn(){return this.zt>0}start(){this.lastStreamToken=void 0,super.start()}sn(){this.Rn&&this.In([])}cn(e,t){return this.connection.vt("Write",e,t)}En(e){return L(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,L(!e.writeResults||e.writeResults.length===0,55816),this.listener.An()}onNext(e){L(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.jt.reset();const t=zv(e.writeResults,e.commitTime),r=Ve(e.commitTime);return this.listener.Vn(r,t)}dn(){const e={};e.database=gl(this.serializer),this.tn(e)}In(e){const t={streamToken:this.lastStreamToken,writes:e.map((r=>To(this.serializer,r)))};this.tn(t)}}/**
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
 */class uA{}class lA extends uA{constructor(e,t,r,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=i,this.fn=!1}mn(){if(this.fn)throw new k(S.FAILED_PRECONDITION,"The client has already been terminated.")}tt(e,t,r,i){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([s,o])=>this.connection.tt(e,ml(t,r),i,s,o))).catch((s=>{throw s.name==="FirebaseError"?(s.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new k(S.UNKNOWN,s.toString())}))}st(e,t,r,i,s){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([o,c])=>this.connection.st(e,ml(t,r),i,o,c,s))).catch((o=>{throw o.name==="FirebaseError"?(o.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new k(S.UNKNOWN,o.toString())}))}terminate(){this.fn=!0,this.connection.terminate()}}function hA(n,e,t,r){return new lA(n,e,t,r)}/**
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
 */const dA="ComponentProvider",wp=new Map;function fA(n,e,t,r,i){return new iv(n,e,t,i.host,i.ssl,i.experimentalForceLongPolling,i.experimentalAutoDetectLongPolling,v_(i.experimentalLongPollingOptions),i.useFetchStreams,i.isUsingEmulator,r,i._customHeaders,i.grpcFlowControlWindow)}/**
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
 */const Tp={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},R_=41943040;class Ye{static withCacheSize(e){return new Ye(e,Ye.DEFAULT_COLLECTION_PERCENTILE,Ye.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}Ye.DEFAULT_COLLECTION_PERCENTILE=10,Ye.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Ye.DEFAULT=new Ye(R_,Ye.DEFAULT_COLLECTION_PERCENTILE,Ye.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Ye.DISABLED=new Ye(-1,0,0);/**
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
 */class dt{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.pn(r),this.gn=r=>t.writeSequenceNumber(r))}pn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.gn&&this.gn(e),e}}dt.yn=-1;/**
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
 */const P_="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class b_{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
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
 */async function dr(n){if(n.code!==S.FAILED_PRECONDITION||n.message!==P_)throw n;O("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class R{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&j(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new R(((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(t,s).next(r,i)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof R?t:R.resolve(t)}catch(t){return R.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):R.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):R.reject(t)}static resolve(e){return new R(((t,r)=>{t(e)}))}static reject(e){return new R(((t,r)=>{r(e)}))}static waitFor(e){return new R(((t,r)=>{let i=0,s=0,o=!1;e.forEach((c=>{++i,c.next((()=>{++s,o&&s===i&&t()}),(u=>r(u)))})),o=!0,s===i&&t()}))}static or(e){let t=R.resolve(!1);for(const r of e)t=t.next((i=>i?R.resolve(i):r()));return t}static forEach(e,t){const r=[];return e.forEach(((i,s)=>{r.push(t.call(this,i,s))})),this.waitFor(r)}static mapArray(e,t){return new R(((r,i)=>{const s=e.length,o=new Array(s);let c=0;for(let u=0;u<s;u++){const l=u;t(e[l]).next((d=>{o[l]=d,++c,c===s&&r(o)}),(d=>i(d)))}}))}static doWhile(e,t){return new R(((r,i)=>{const s=()=>{e()===!0?t().next((()=>{s()}),i):r()};s()}))}}/**
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
 */const Et="SimpleDb";class xc{static open(e,t,r,i){try{return new xc(t,e.transaction(i,r))}catch(s){throw new ro(t,s)}}constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.wn=new Ge,this.transaction.oncomplete=()=>{this.wn.resolve()},this.transaction.onabort=()=>{t.error?this.wn.reject(new ro(e,t.error)):this.wn.resolve()},this.transaction.onerror=r=>{const i=uh(r.target.error);this.wn.reject(new ro(e,i))}}get bn(){return this.wn.promise}abort(e){e&&this.wn.reject(e),this.aborted||(O(Et,"Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}vn(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new mA(t)}}class Qt{static delete(e){return O(Et,"Removing database:",e),Sr(Gm().indexedDB.deleteDatabase(e)).toPromise()}static Je(){if(!tg())return!1;if(Qt.Sn())return!0;const e=Me(),t=Qt.Dn(e),r=0<t&&t<10,i=S_(e),s=0<i&&i<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||r||s)}static Sn(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)==null?void 0:e.__PRIVATE_USE_MOCK_PERSISTENCE)==="YES"}static xn(e,t){return e.store(t)}static Dn(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),r=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(r)}constructor(e,t,r){this.name=e,this.version=t,this.Cn=r,this.Fn=null,Qt.Dn(Me())===12.2&&be("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async On(e){return this.db||(O(Et,"Opening database:",this.name),this.db=await new Promise(((t,r)=>{const i=indexedDB.open(this.name,this.version);i.onsuccess=s=>{const o=s.target.result;t(o)},i.onblocked=()=>{r(new ro(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},i.onerror=s=>{const o=s.target.error;o.name==="VersionError"?r(new k(S.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?r(new k(S.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):r(new ro(e,o))},i.onupgradeneeded=s=>{O(Et,'Database "'+this.name+'" requires upgrade from version:',s.oldVersion);const o=s.target.result;this.Cn.Mn(o,i.transaction,s.oldVersion,this.version).next((()=>{O(Et,"Database upgrade to version "+this.version+" complete")}))}}))),this.Nn&&(this.db.onversionchange=t=>this.Nn(t)),this.db}Ln(e){this.Nn=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,r,i){const s=t==="readonly";let o=0;for(;;){++o;try{this.db=await this.On(e);const c=xc.open(this.db,e,s?"readonly":"readwrite",r),u=i(c).next((l=>(c.vn(),l))).catch((l=>(c.abort(l),R.reject(l)))).toPromise();return u.catch((()=>{})),await c.bn,u}catch(c){const u=c,l=u.name!=="FirebaseError"&&o<3;if(O(Et,"Transaction failed with error:",u.message,"Retrying:",l),this.close(),!l)return Promise.reject(u)}}}close(){this.db&&this.db.close(),this.db=void 0}}function S_(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class pA{constructor(e){this.Bn=e,this.Un=!1,this.kn=null}get isDone(){return this.Un}get qn(){return this.kn}set cursor(e){this.Bn=e}done(){this.Un=!0}$n(e){this.kn=e}delete(){return Sr(this.Bn.delete())}}class ro extends k{constructor(e,t){super(S.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function fr(n){return n.name==="IndexedDbTransactionError"}class mA{constructor(e){this.store=e}put(e,t){let r;return t!==void 0?(O(Et,"PUT",this.store.name,e,t),r=this.store.put(t,e)):(O(Et,"PUT",this.store.name,"<auto-key>",e),r=this.store.put(e)),Sr(r)}add(e){return O(Et,"ADD",this.store.name,e,e),Sr(this.store.add(e))}get(e){return Sr(this.store.get(e)).next((t=>(t===void 0&&(t=null),O(Et,"GET",this.store.name,e,t),t)))}delete(e){return O(Et,"DELETE",this.store.name,e),Sr(this.store.delete(e))}count(){return O(Et,"COUNT",this.store.name),Sr(this.store.count())}Kn(e,t){const r=this.options(e,t),i=r.index?this.store.index(r.index):this.store;if(typeof i.getAll=="function"){const s=i.getAll(r.range);return new R(((o,c)=>{s.onerror=u=>{c(u.target.error)},s.onsuccess=u=>{o(u.target.result)}}))}{const s=this.cursor(r),o=[];return this.Wn(s,((c,u)=>{o.push(u)})).next((()=>o))}}Qn(e,t){const r=this.store.getAll(e,t===null?void 0:t);return new R(((i,s)=>{r.onerror=o=>{s(o.target.error)},r.onsuccess=o=>{i(o.target.result)}}))}Gn(e,t){O(Et,"DELETE ALL",this.store.name);const r=this.options(e,t);r.zn=!1;const i=this.cursor(r);return this.Wn(i,((s,o,c)=>c.delete()))}jn(e,t){let r;t?r=e:(r={},t=e);const i=this.cursor(r);return this.Wn(i,t)}Hn(e){const t=this.cursor({});return new R(((r,i)=>{t.onerror=s=>{const o=uh(s.target.error);i(o)},t.onsuccess=s=>{const o=s.target.result;o?e(o.primaryKey,o.value).next((c=>{c?o.continue():r()})):r()}}))}Wn(e,t){const r=[];return new R(((i,s)=>{e.onerror=o=>{s(o.target.error)},e.onsuccess=o=>{const c=o.target.result;if(!c)return void i();const u=new pA(c),l=t(c.primaryKey,c.value,u);if(l instanceof R){const d=l.catch((p=>(u.done(),R.reject(p))));r.push(d)}u.isDone?i():u.qn===null?c.continue():c.continue(u.qn)}})).next((()=>R.waitFor(r)))}options(e,t){let r;return e!==void 0&&(typeof e=="string"?r=e:t=e),{index:r,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const r=this.store.index(e.index);return e.zn?r.openKeyCursor(e.range,t):r.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function Sr(n){return new R(((e,t)=>{n.onsuccess=r=>{const i=r.target.result;e(i)},n.onerror=r=>{const i=uh(r.target.error);t(i)}}))}let vp=!1;function uh(n){const e=Qt.Dn(Me());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(n.message.indexOf(t)>=0){const r=new k("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return vp||(vp=!0,setTimeout((()=>{throw r}),0)),r}}return n}/**
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
 */const Ap="LruGarbageCollector",V_=1048576;function Rp([n,e],[t,r]){const i=Q(n,t);return i===0?Q(e,r):i}class gA{constructor(e){this.Jn=e,this.buffer=new ce(Rp),this.Yn=0}Zn(){return++this.Yn}Xn(e){const t=[e,this.Zn()];if(this.buffer.size<this.Jn)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();Rp(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class C_{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.er=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.tr(6e4)}stop(){this.er&&(this.er.cancel(),this.er=null)}get started(){return this.er!==null}tr(e){O(Ap,`Garbage collection scheduled in ${e}ms`),this.er=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.er=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){fr(t)?O(Ap,"Ignoring IndexedDB error during garbage collection: ",t):await dr(t)}await this.tr(3e5)}))}}class _A{constructor(e,t){this.nr=e,this.params=t}calculateTargetCount(e,t){return this.nr.rr(e).next((r=>Math.floor(t/100*r)))}nthSequenceNumber(e,t){if(t===0)return R.resolve(dt.yn);const r=new gA(t);return this.nr.forEachTarget(e,(i=>r.Xn(i.sequenceNumber))).next((()=>this.nr.ir(e,(i=>r.Xn(i))))).next((()=>r.maxValue))}removeTargets(e,t,r){return this.nr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.nr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(O("LruGarbageCollector","Garbage collection skipped; disabled"),R.resolve(Tp)):this.getCacheSize(e).next((r=>r<this.params.cacheSizeCollectionThreshold?(O("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Tp):this.sr(e,t)))}getCacheSize(e){return this.nr.getCacheSize(e)}sr(e,t){let r,i,s,o,c,u,l;const d=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((p=>(p>this.params.maximumSequenceNumbersToCollect?(O("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),i=this.params.maximumSequenceNumbersToCollect):i=p,o=Date.now(),this.nthSequenceNumber(e,i)))).next((p=>(r=p,c=Date.now(),this.removeTargets(e,r,t)))).next((p=>(s=p,u=Date.now(),this.removeOrphanedDocuments(e,r)))).next((p=>(l=Date.now(),_i()<=ne.DEBUG&&O("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-d}ms
	Determined least recently used ${i} in `+(c-o)+`ms
	Removed ${s} targets in `+(u-c)+`ms
	Removed ${p} documents in `+(l-u)+`ms
Total Duration: ${l-d}ms`),R.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:s,documentsRemoved:p}))))}}function N_(n,e){return new _A(n,e)}/**
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
 */const D_="firestore.googleapis.com",Pp=!0;class bp{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new k(S.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=D_,this.ssl=Pp}else this.host=e.host,this.ssl=e.ssl??Pp;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),e.cacheSizeBytes===void 0)this.cacheSizeBytes=R_;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<V_)throw new k(S.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(Eg("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=v_(e.experimentalLongPollingOptions??{}),(function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new k(S.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new k(S.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new k(S.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,e.grpcFlowControlWindow!==void 0){if(typeof e.grpcFlowControlWindow!="number"||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new k(S.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(r,i){return r.timeoutSeconds===i.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&(function(r,i){if(r===i)return!0;if(!r||!i)return!1;const s=Object.keys(r),o=Object.keys(i);if(s.length!==o.length)return!1;for(const c of s)if(r[c]!==i[c])return!1;return!0})(this._customHeaders,e._customHeaders)}}let jo=class{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new bp({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new k(S.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new k(S.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new bp(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(r){if(!r)return new T_;switch(r.type){case"firstParty":return new Zv(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new k(S.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const r=wp.get(t);r&&(O(dA,"Removing Datastore"),wp.delete(t),r.terminate())})(this),Promise.resolve()}};function k_(n,e,t,r={}){var l;n=te(n,jo);const i=ur(e),s=n._getSettings(),o={...s,emulatorOptions:n._getEmulatorOptions()},c=`${e}:${t}`;i&&vc(`https://${c}`),s.host!==D_&&s.host!==c&&Fe("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u={...s,host:c,ssl:i,emulatorOptions:r};if(!kt(u,o)&&(n._setSettings(u),r.mockUserToken)){let d,p;if(typeof r.mockUserToken=="string")d=r.mockUserToken,p=je.MOCK_USER;else{d=Jm(r.mockUserToken,(l=n._app)==null?void 0:l.options.projectId);const m=r.mockUserToken.sub||r.mockUserToken.user_id;if(!m)throw new k(S.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new je(m)}n._authCredentials=new Jv(new w_(d,p))}}/**
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
 */class Ue{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Ue(this.firestore,e,this._query)}}class ae{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Dt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new ae(this.firestore,e,this._key)}toJSON(){return{type:ae._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(Yr(t,ae._jsonSchema))return new ae(e,r||null,new F(X.fromString(t.referencePath)))}}ae._jsonSchemaVersion="firestore/documentReference/1.0",ae._jsonSchema={type:ke("string",ae._jsonSchemaVersion),referencePath:ke("string")};class Dt extends Ue{constructor(e,t,r){super(e,t,ss(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new ae(this.firestore,null,new F(e))}withConverter(e){return new Dt(this.firestore,e,this._path)}}function yA(n,e,...t){if(n=W(n),Kl("collection","path",e),n instanceof jo){const r=X.fromString(e,...t);return Yf(r),new Dt(n,null,r)}{if(!(n instanceof ae||n instanceof Dt))throw new k(S.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(X.fromString(e,...t));return Yf(r),new Dt(n.firestore,null,r)}}function IA(n,e){if(n=te(n,jo),Kl("collectionGroup","collection id",e),e.indexOf("/")>=0)throw new k(S.INVALID_ARGUMENT,`Invalid collection ID '${e}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new Ue(n,null,(function(r){return new Tn(X.emptyPath(),r)})(e))}function x_(n,e,...t){if(n=W(n),arguments.length===1&&(e=Rc.newId()),Kl("doc","path",e),n instanceof jo){const r=X.fromString(e,...t);return Jf(r),new ae(n,null,new F(r))}{if(!(n instanceof ae||n instanceof Dt))throw new k(S.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(X.fromString(e,...t));return Jf(r),new ae(n.firestore,n instanceof Dt?n.converter:null,new F(r))}}function EA(n,e){return n=W(n),e=W(e),(n instanceof ae||n instanceof Dt)&&(e instanceof ae||e instanceof Dt)&&n.firestore===e.firestore&&n.path===e.path&&n.converter===e.converter}function lh(n,e){return n=W(n),e=W(e),n instanceof Ue&&e instanceof Ue&&n.firestore===e.firestore&&Yg(n._query,e._query)&&n.converter===e.converter}/**
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
 */class ot{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0})(this._values,e._values)}toJSON(){return{type:ot._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Yr(e,ot._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new ot(e.vectorValues);throw new k(S.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}ot._jsonSchemaVersion="firestore/vectorValue/1.0",ot._jsonSchema={type:ke("string",ot._jsonSchemaVersion),vectorValues:ke("object")};/**
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
 */const wA=/^__.*__$/;class TA{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new wn(e,this.data,this.fieldMask,t,this.fieldTransforms):new rs(e,this.data,t,this.fieldTransforms)}}class O_{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new wn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function L_(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw j(40011,{dataSource:n})}}class Oc{constructor(e,t,r,i,s,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new Oc({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var i;const t=(i=this.path)==null?void 0:i.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){var i;const t=(i=this.path)==null?void 0:i.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return tc(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(L_(this.dataSource)&&wA.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class vA{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Zr(e)}createContext(e,t,r,i=!1){return new Oc({dataSource:e,methodName:t,targetDoc:r,path:Se.emptyPath(),arrayElement:!1,hasConverter:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function ti(n){const e=n._freezeSettings(),t=Zr(n._databaseId);return new vA(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Lc(n,e,t,r,i,s={}){const o=n.createContext(s.merge||s.mergeFields?2:0,e,t,i);Ih("Data must be an object, but it was:",o,r);const c=U_(r,o);let u,l;if(s.merge)u=new ht(o.fieldMask),l=o.fieldTransforms;else if(s.mergeFields){const d=[];for(const p of s.mergeFields){const m=xt(e,p,t);if(!o.contains(m))throw new k(S.INVALID_ARGUMENT,`Field '${m}' is specified in your field mask but missing from your input data.`);q_(d,m)||d.push(m)}u=new ht(d),l=o.fieldTransforms.filter((p=>u.covers(p.field)))}else u=null,l=o.fieldTransforms;return new TA(new Le(c),u,l)}class zo extends en{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof zo}}function M_(n,e,t){return new Oc({dataSource:3,targetDoc:e.settings.targetDoc,methodName:n._methodName,arrayElement:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class hh extends en{_toFieldTransform(e){return new Xr(e.path,new ki)}isEqual(e){return e instanceof hh}}class dh extends en{constructor(e,t){super(e),this._r=t}_toFieldTransform(e){const t=M_(this,e,!0),r=this._r.map((s=>Jt(s,t))),i=new jr(r);return new Xr(e.path,i)}isEqual(e){return e instanceof dh&&kt(this._r,e._r)}}class fh extends en{constructor(e,t){super(e),this._r=t}_toFieldTransform(e){const t=M_(this,e,!0),r=this._r.map((s=>Jt(s,t))),i=new zr(r);return new Xr(e.path,i)}isEqual(e){return e instanceof fh&&kt(this._r,e._r)}}class ph extends en{constructor(e,t){super(e),this.ar=t}_toFieldTransform(e){const t=new Gr(e.serializer,ns(e.serializer,this.ar));return new Xr(e.path,t)}isEqual(e){return e instanceof ph&&(this.ar===e.ar||Number.isNaN(this.ar)&&Number.isNaN(e.ar))}}class mh extends en{constructor(e,t){super(e),this.ar=t}_toFieldTransform(e){const t=new xi(e.serializer,ns(e.serializer,this.ar));return new Xr(e.path,t)}isEqual(e){return e instanceof mh&&(this.ar===e.ar||Number.isNaN(this.ar)&&Number.isNaN(e.ar))}}class gh extends en{constructor(e,t){super(e),this.ar=t}_toFieldTransform(e){const t=new Oi(e.serializer,ns(e.serializer,this.ar));return new Xr(e.path,t)}isEqual(e){return e instanceof gh&&(this.ar===e.ar||Number.isNaN(this.ar)&&Number.isNaN(e.ar))}}function _h(n,e,t,r){const i=n.createContext(1,e,t);Ih("Data must be an object, but it was:",i,r);const s=[],o=Le.empty();hr(r,((u,l)=>{const d=Eh(e,u,t);l=W(l);const p=i.childContextForFieldPath(d);if(l instanceof zo)s.push(d);else{const m=Jt(l,p);m!=null&&(s.push(d),o.set(d,m))}}));const c=new ht(s);return new O_(o,c,i.fieldTransforms)}function yh(n,e,t,r,i,s){const o=n.createContext(1,e,t),c=[xt(e,r,t)],u=[i];if(s.length%2!=0)throw new k(S.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let m=0;m<s.length;m+=2)c.push(xt(e,s[m])),u.push(s[m+1]);const l=[],d=Le.empty();for(let m=c.length-1;m>=0;--m)if(!q_(l,c[m])){const I=c[m];let P=u[m];P=W(P);const x=o.childContextForFieldPath(I);if(P instanceof zo)l.push(I);else{const D=Jt(P,x);D!=null&&(l.push(I),d.set(I,D))}}const p=new ht(l);return new O_(d,p,o.fieldTransforms)}function F_(n,e,t,r=!1){return Jt(t,n.createContext(r?4:3,e))}function Jt(n,e,t){if(B_(n=W(n)))return Ih("Unsupported field value:",e,n),U_(n,e);if(n instanceof en)return(function(i,s){if(!L_(s.dataSource))throw s.createError(`${i._methodName}() can only be used with update() and set()`);if(!s.path)throw s.createError(`${i._methodName}() is not currently supported inside arrays`);const o=i._toFieldTransform(s);o&&s.fieldTransforms.push(o)})(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(i,s){const o=[];let c=0;for(const u of i){let l=Jt(u,s.childContextForArray(c));l==null&&(l={nullValue:"NULL_VALUE"}),o.push(l),c++}return{arrayValue:{values:o}}})(n,e)}return(function(i,s,o){if((i=W(i))===null)return{nullValue:"NULL_VALUE"};if(typeof i=="number")return ns(s.serializer,i);if(typeof i=="boolean")return{booleanValue:i};if(typeof i=="string")return{stringValue:i};if(i instanceof Date){const c=oe.fromDate(i);return{timestampValue:Bi(s.serializer,c)}}if(i instanceof oe){const c=new oe(i.seconds,1e3*Math.floor(i.nanoseconds/1e3));return{timestampValue:Bi(s.serializer,c)}}if(i instanceof Nt)return{geoPointValue:{latitude:i.latitude,longitude:i.longitude}};if(i instanceof ut)return{bytesValue:o_(s.serializer,i._byteString)};if(i instanceof ae){const c=s.databaseId,u=i.firestore._databaseId;if(!u.isEqual(c))throw s.createError(`Document reference is for database ${u.projectId}/${u.database} but should be for database ${c.projectId}/${c.database}`);return{referenceValue:ah(i.firestore._databaseId||s.databaseId,i._key.path)}}if(i instanceof ot)return(function(u,l){const d=u instanceof ot?u.toArray():u;return{mapValue:{fields:{[Hl]:{stringValue:Ql},[Br]:{arrayValue:{values:d.map((m=>{if(typeof m!="number")throw l.createError("VectorValues must only contain numeric values.");return bc(l.serializer,m)}))}}}}}})(i,s);if(y_(i))return i._toProto(s.serializer);throw s.createError(`Unsupported field value: ${Pc(i)}`)})(n,e)}function U_(n,e){const t={};return Ig(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):hr(n,((r,i)=>{const s=Jt(i,e.childContextForField(r));s!=null&&(t[r]=s)})),{mapValue:{fields:t}}}function B_(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof oe||n instanceof Nt||n instanceof ut||n instanceof ae||n instanceof en||n instanceof ot||y_(n))}function Ih(n,e,t){if(!B_(t)||!Fo(t)){const r=Pc(t);throw r==="an object"?e.createError(n+" a custom object"):e.createError(n+" "+r)}}function xt(n,e,t){if((e=W(e))instanceof ei)return e._internalPath;if(typeof e=="string")return Eh(n,e);throw tc("Field path arguments must be of type string or ",n,!1,void 0,t)}const AA=new RegExp("[~\\*/\\[\\]]");function Eh(n,e,t){if(e.search(AA)>=0)throw tc(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new ei(...e.split("."))._internalPath}catch{throw tc(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function tc(n,e,t,r,i){const s=r&&!r.isEmpty(),o=i!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let u="";return(s||o)&&(u+=" (found",s&&(u+=` in field ${r}`),o&&(u+=` in document ${i}`),u+=")"),new k(S.INVALID_ARGUMENT,c+n+u)}function q_(n,e){return n.some((t=>t.isEqual(e)))}function $_(n){return typeof n._readUserData=="function"}/**
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
 */class nt{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const r=Le.empty();for(const i in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(i)){const s=this.optionDefinitions[i];if(i in e){const o=e[i];let c;s.nestedOptions&&Fo(o)?c={mapValue:{fields:new nt(s.nestedOptions).getOptionsProto(t,o)}}:o&&(c=Jt(o,t)??void 0),c&&r.set(Se.fromServerFormat(s.serverName),c)}}return r}getOptionsProto(e,t,r){const i=this._getKnownOptions(t,e);if(r){const s=new Map(Wl(r,((o,c)=>[Se.fromServerFormat(c),o!==void 0?Jt(o,e):null])));i.setAll(s)}return i.value.mapValue.fields??{}}}/**
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
 */function RA(n){return typeof n=="object"&&n!==null&&!!("nullValue"in n&&(n.nullValue===null||n.nullValue==="NULL_VALUE")||"booleanValue"in n&&(n.booleanValue===null||typeof n.booleanValue=="boolean")||"integerValue"in n&&(n.integerValue===null||typeof n.integerValue=="number"||typeof n.integerValue=="string")||"doubleValue"in n&&(n.doubleValue===null||typeof n.doubleValue=="number")||"timestampValue"in n&&(n.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(n.timestampValue))||"stringValue"in n&&(n.stringValue===null||typeof n.stringValue=="string")||"bytesValue"in n&&(n.bytesValue===null||n.bytesValue instanceof Uint8Array)||"referenceValue"in n&&(n.referenceValue===null||typeof n.referenceValue=="string")||"geoPointValue"in n&&(n.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(n.geoPointValue))||"arrayValue"in n&&(n.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(n.arrayValue))||"mapValue"in n&&(n.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!Fo(t.fields))})(n.mapValue))||"fieldReferenceValue"in n&&(n.fieldReferenceValue===null||typeof n.fieldReferenceValue=="string")||"functionValue"in n&&(n.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(n.functionValue))||"pipelineValue"in n&&(n.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(n.pipelineValue)))}/**
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
 */function PA(){return new zo("deleteField")}function bA(){return new hh("serverTimestamp")}function SA(...n){return new dh("arrayUnion",n)}function VA(...n){return new fh("arrayRemove",n)}function CA(n){return new ph("increment",n)}function NA(n){return new mh("minimum",n)}function DA(n){return new gh("maximum",n)}function j_(n){return new ot(n)}/**
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
 */function U(n){let e;return n instanceof ni?n:(e=Fo(n)?MA(n):n instanceof Array?FA(n):z_(n,void 0),e)}function Bu(n){if(n instanceof ni)return n;if(n instanceof ot)return Ao(n);if(Array.isArray(n))return Ao(j_(n));throw new Error("Unsupported value: "+typeof n)}function wh(n){return ov(n)?Ua(n):U(n)}class ni{constructor(){this._protoValueType="ProtoValue"}add(e){return new N("add",[this,U(e)],"add")}asBoolean(){if(this instanceof rr)return this;if(this instanceof ii)return new W_(this);if(this instanceof ri)return new LA(this);if(this instanceof N)return new G_(this);throw new k("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new N("subtract",[this,U(e)],"subtract")}multiply(e){return new N("multiply",[this,U(e)],"multiply")}divide(e){return new N("divide",[this,U(e)],"divide")}mod(e){return new N("mod",[this,U(e)],"mod")}equal(e){return new N("equal",[this,U(e)],"equal").asBoolean()}notEqual(e){return new N("not_equal",[this,U(e)],"notEqual").asBoolean()}lessThan(e){return new N("less_than",[this,U(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new N("less_than_or_equal",[this,U(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new N("greater_than",[this,U(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new N("greater_than_or_equal",[this,U(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const r=[e,...t].map((i=>U(i)));return new N("array_concat",[this,...r],"arrayConcat")}arrayContains(e){return new N("array_contains",[this,U(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new Qs(e.map(U),"arrayContainsAll"):e;return new N("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new Qs(e.map(U),"arrayContainsAny"):e;return new N("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new N("array_reverse",[this])}arrayLength(){return new N("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new Qs(e.map(U),"equalAny"):e;return new N("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new Qs(e.map(U),"notEqualAny"):e;return new N("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new N("exists",[this],"exists").asBoolean()}charLength(){return new N("char_length",[this],"charLength")}like(e){return new N("like",[this,U(e)],"like").asBoolean()}regexContains(e){return new N("regex_contains",[this,U(e)],"regexContains").asBoolean()}regexFind(e){return new N("regex_find",[this,U(e)],"regexFind")}regexFindAll(e){return new N("regex_find_all",[this,U(e)],"regexFindAll")}regexMatch(e){return new N("regex_match",[this,U(e)],"regexMatch").asBoolean()}stringContains(e){return new N("string_contains",[this,U(e)],"stringContains").asBoolean()}startsWith(e){return new N("starts_with",[this,U(e)],"startsWith").asBoolean()}endsWith(e){return new N("ends_with",[this,U(e)],"endsWith").asBoolean()}toLower(){return new N("to_lower",[this],"toLower")}toUpper(){return new N("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(U(e)),new N("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(U(e)),new N("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(U(e)),new N("rtrim",t,"rtrim")}type(){return new N("type",[this])}isType(e){return new N("is_type",[this,Ao(e)],"isType").asBoolean()}stringConcat(e,...t){const r=[e,...t].map(U);return new N("string_concat",[this,...r],"stringConcat")}stringIndexOf(e){return new N("string_index_of",[this,U(e)],"stringIndexOf")}stringRepeat(e){return new N("string_repeat",[this,U(e)],"stringRepeat")}stringReplaceAll(e,t){return new N("string_replace_all",[this,U(e),U(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new N("string_replace_one",[this,U(e),U(t)],"stringReplaceOne")}concat(e,...t){const r=[e,...t].map(U);return new N("concat",[this,...r],"concat")}reverse(){return new N("reverse",[this],"reverse")}arrayFilter(e,t){return new N("array_filter",[this,U(e),t],"arrayFilter")}arrayTransform(e,t){return new N("array_transform",[this,U(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,r){return new N("array_transform",[this,U(e),U(t),r],"arrayTransformWithIndex")}arraySlice(e,t){const r=[this,U(e)];return t!==void 0&&r.push(U(t)),new N("array_slice",r,"arraySlice")}arrayFirst(){return new N("array_first",[this],"arrayFirst")}arrayFirstN(e){return new N("array_first_n",[this,U(e)],"arrayFirstN")}arrayLast(){return new N("array_last",[this],"arrayLast")}arrayLastN(e){return new N("array_last_n",[this,U(e)],"arrayLastN")}arrayMaximum(){return new N("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new N("maximum_n",[this,U(e)],"arrayMaximumN")}arrayMinimum(){return new N("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new N("minimum_n",[this,U(e)],"arrayMinimumN")}arrayIndexOf(e){return new N("array_index_of",[this,U(e),U("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new N("array_index_of",[this,U(e),U("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new N("array_index_of_all",[this,U(e)],"arrayIndexOfAll")}byteLength(){return new N("byte_length",[this],"byteLength")}ceil(){return new N("ceil",[this])}floor(){return new N("floor",[this])}abs(){return new N("abs",[this])}exp(){return new N("exp",[this])}mapGet(e){return new N("map_get",[this,Ao(e)],"mapGet")}mapSet(e,t,...r){const i=[this,U(e),U(t),...r.map(U)];return new N("map_set",i,"mapSet")}mapKeys(){return new N("map_keys",[this],"mapKeys")}mapValues(){return new N("map_values",[this],"mapValues")}mapEntries(){return new N("map_entries",[this],"mapEntries")}getField(e){return new N("get_field",[this,U(e)],"get_field")}count(){return It._create("count",[this],"count")}sum(){return It._create("sum",[this],"sum")}average(){return It._create("average",[this],"average")}minimum(){return It._create("minimum",[this],"minimum")}maximum(){return It._create("maximum",[this],"maximum")}first(){return It._create("first",[this],"first")}last(){return It._create("last",[this],"last")}arrayAgg(){return It._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return It._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return It._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const r=[e,...t];return new N("maximum",[this,...r.map(U)],"logicalMaximum")}logicalMinimum(e,...t){const r=[e,...t];return new N("minimum",[this,...r.map(U)],"minimum")}vectorLength(){return new N("vector_length",[this],"vectorLength")}cosineDistance(e){return new N("cosine_distance",[this,Bu(e)],"cosineDistance")}dotProduct(e){return new N("dot_product",[this,Bu(e)],"dotProduct")}euclideanDistance(e){return new N("euclidean_distance",[this,Bu(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new N("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new N("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new N("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new N("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new N("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new N("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new N("timestamp_add",[this,U(e),U(t)],"timestampAdd")}timestampSubtract(e,t){return new N("timestamp_subtract",[this,U(e),U(t)],"timestampSubtract")}timestampDiff(e,t){return new N("timestamp_diff",[this,wh(e),U(t)],"timestampDiff")}timestampExtract(e,t){const r=[this,U(e)];return t&&r.push(U(t)),new N("timestamp_extract",r,"timestampExtract")}documentId(){return new N("document_id",[this],"documentId")}parent(){return new N("parent",[this],"parent")}substring(e,t){const r=U(e);return new N("substring",t===void 0?[this,r]:[this,r,U(t)],"substring")}arrayGet(e){return new N("array_get",[this,U(e)],"arrayGet")}isError(){return new N("is_error",[this],"isError").asBoolean()}ifError(e){const t=new N("if_error",[this,U(e)],"ifError");return e instanceof rr?t.asBoolean():t}isAbsent(){return new N("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new N("map_remove",[this,U(e)],"mapRemove")}mapMerge(e,...t){const r=U(e),i=t.map(U);return new N("map_merge",[this,r,...i],"mapMerge")}pow(e){return new N("pow",[this,U(e)])}trunc(e){return e===void 0?new N("trunc",[this]):new N("trunc",[this,U(e)],"trunc")}round(e){return e===void 0?new N("round",[this]):new N("round",[this,U(e)],"round")}collectionId(){return new N("collection_id",[this])}length(){return new N("length",[this])}ln(){return new N("ln",[this])}sqrt(){return new N("sqrt",[this])}stringReverse(){return new N("string_reverse",[this])}ifAbsent(e){return new N("if_absent",[this,U(e)],"ifAbsent")}ifNull(e){return new N("if_null",[this,U(e)],"ifNull")}coalesce(e,...t){return new N("coalesce",[this,U(e),...t.map(U)],"coalesce")}join(e){return new N("join",[this,U(e)],"join")}log10(){return new N("log10",[this])}arraySum(){return new N("sum",[this])}split(e){return new N("split",[this,U(e)])}timestampTruncate(e,t){const r=[this,U(e)];return t&&r.push(U(t)),new N("timestamp_trunc",r)}ascending(){return UA(this)}descending(){return BA(this)}as(e){return new xA(this,e,"as")}}class It{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,r){const i=new It(e,t);return i._methodName=r,i}as(e){return new kA(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class kA{constructor(e,t,r){this.aggregate=e,this.alias=t,this._methodName=r}_readUserData(e){this.aggregate._readUserData(e)}}class xA{constructor(e,t,r){this.expr=e,this.alias=t,this._methodName=r,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class Qs extends ni{constructor(e,t){super(),this.ur=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.ur.map((t=>t._toProto(e)))}}}_readUserData(e){this.ur.forEach((t=>t._readUserData(e)))}}class ri extends ni{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new N("geo_distance",[this,U(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function Ua(n){return OA(n,"field")}function OA(n,e){return new ri(typeof n=="string"?Bt===n?E_()._internalPath:xt("field",n):n._internalPath,e)}class ii extends ni{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new ii(e,void 0);return t._protoValue=e,t}_toProto(e){return L(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,RA(this._protoValue)||(this._protoValue=Jt(this.value,e))}}function Ao(n,e){return z_(n,"constant")}function z_(n,e){const t=new ii(n,e);return typeof n=="boolean"?new W_(t):t}class N extends ni{constructor(e,t,r,i){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,r!==void 0&&(this._methodName=r),i!==void 0&&(this._options=i)}get _optionsUtil(){return new nt({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((r=>r._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class rr extends ni{get _methodName(){return this._expr._methodName}countIf(){return It._create("count_if",[this],"countIf")}not(){return new N("not",[this],"not").asBoolean()}conditional(e,t){return new N("conditional",[this,e,t],"conditional")}ifError(e){const t=U(e),r=new N("if_error",[this,t],"ifError");return t instanceof rr?r.asBoolean():r}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class G_ extends rr{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class W_ extends rr{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class LA extends rr{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function MA(n,e){const t=[];for(const r in n)if(Object.prototype.hasOwnProperty.call(n,r)){const i=n[r];t.push(Ao(r)),t.push(U(i))}return new N("map",t,"map")}function FA(n){return(function(t,r){return new N("array",t.map((i=>U(i))),r)})(n,"array")}function UA(n){return new Th(wh(n),"ascending","ascending")}function BA(n){return new Th(wh(n),"descending","descending")}class Th{constructor(e,t,r){this.expr=e,this.direction=t,this._methodName=r,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:I_(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
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
 */class At{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class K_ extends At{get _name(){return"add_fields"}get _optionsUtil(){return new nt({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[vo(e,this.fields)]}}_readUserData(e){super._readUserData(e),sr(this.fields,e)}}class H_ extends At{get _name(){return"aggregate"}get _optionsUtil(){return new nt({})}constructor(e,t,r){super(r),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[vo(e,this.accumulators),vo(e,this.groups)]}}_readUserData(e){super._readUserData(e),sr(this.groups,e),sr(this.accumulators,e)}}class Q_ extends At{get _name(){return"distinct"}get _optionsUtil(){return new nt({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[vo(e,this.groups)]}}_readUserData(e){super._readUserData(e),sr(this.groups,e)}}class Go extends At{get _name(){return"collection"}get _optionsUtil(){return new nt({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Er=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.Er}]}}_readUserData(e){super._readUserData(e)}}class Wo extends At{get _name(){return"collection_group"}get _optionsUtil(){return new nt({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class Mc extends At{get _name(){return"database"}get _optionsUtil(){return new nt({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class Fc extends At{get _name(){return"documents"}get _optionsUtil(){return new nt({})}constructor(e,t){if(super(t),!e||e.length===0)throw new k(S.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const r=e.map((s=>s.startsWith("/")?s:"/"+s)),i=new Set(r);if(i.size!==r.length)throw new k(S.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.hr=r,this.Tr=i}_toProto(e){return{...super._toProto(e),args:this.hr.map((t=>({referenceValue:t})))}}_readUserData(e){super._readUserData(e)}}class Ko extends At{get _name(){return"where"}get _optionsUtil(){return new nt({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),sr(this.condition,e)}}class ir extends At{get _name(){return"limit"}get _optionsUtil(){return new nt({})}constructor(e,t){L(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[ns(e,this.limit)]}}}class Sp extends At{get _name(){return"offset"}get _optionsUtil(){return new nt({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[ns(e,this.offset)]}}}class qA extends At{get _name(){return"select"}get _optionsUtil(){return new nt({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[vo(e,this.selections)]}}_readUserData(e){super._readUserData(e),sr(this.selections,e)}}class $t extends At{get _name(){return"sort"}get _optionsUtil(){return new nt({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map((t=>t._toProto(e)))}}_readUserData(e){super._readUserData(e),sr(this.orderings,e)}}class vh extends At{get _name(){return"replace_with"}get _optionsUtil(){return new nt({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),I_(vh.Pr)]}}_readUserData(e){super._readUserData(e),sr(this.map,e)}}vh.Pr="full_replace";function sr(n,e){return $_(n)?n._readUserData(e):Array.isArray(n)?n.forEach((t=>t._readUserData(e))):n instanceof Map?n.forEach((t=>t._readUserData(e))):Object.values(n).forEach((t=>t._readUserData(e))),n}/**
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
 */class io{constructor(e,t,r,i){this._db=e,this.userDataReader=t,this._userDataWriter=r,this.stages=i}Ar(e,t){const r=this.userDataReader.createContext(3,e);return $_(t)?t._readUserData(r):Array.isArray(t)?t.forEach((i=>i._readUserData(r))):t.forEach((i=>i._readUserData(r))),t}where(e){const t=this.stages.map((r=>r));return this.Ar("where",e),t.push(new Ko(e,{})),new io(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){const t=this.stages.map((r=>r));return t.push(new ir(e,{})),new io(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){const r=this.stages.map((i=>i));return"orderings"in e?r.push(new $t(this.Ar("sort",e.orderings),{})):r.push(new $t(this.Ar("sort",[e,...t]),{})),new io(this._db,this.userDataReader,this._userDataWriter,r)}Vr(e){return{pipeline:{stages:this.stages.map((t=>t._toProto(e)))}}}}// Copyright 2024 Google LLC* @license
class T{constructor(e,t){this.type=e,this.value=t}static dr(){return new T("ERROR",void 0)}static mr(){return new T("UNSET",void 0)}static pr(){return new T("NULL",Kt)}static newValue(e){return wt(e)?new T("NULL",Kt):(function(r){return!!r&&"booleanValue"in r})(e)?new T("BOOLEAN",e):qt(e)?new T("INT",e):Dr(e)?new T("DOUBLE",e):(function(r){return!!r&&"timestampValue"in r&&!!r.timestampValue})(e)?new T("TIMESTAMP",e):(function(r){return!!r&&"stringValue"in r})(e)?new T("STRING",e):(function(r){return!!r&&"bytesValue"in r})(e)?new T("BYTES",e):e.referenceValue?new T("REFERENCE",e):e.geoPointValue?new T("GEO_POINT",e):tr(e)?new T("ARRAY",e):$r(e)?new T("VECTOR",e):Or(e)?new T("MAP",e):new T("ERROR",void 0)}gr(){return this.type==="ERROR"||this.type==="UNSET"}yr(){return this.type==="NULL"}}function so(n){if(!n.gr())return n.value}function J_(n){return n instanceof rr?n._expr:n}function H(n){if((n=J_(n))instanceof ri)return new $A(n);if(n instanceof ii)return new jA(n);if(n instanceof Qs)return new zA(n);if(n instanceof N){if(n.name==="add")return new KA(n);if(n.name==="subtract")return new HA(n);if(n.name==="multiply")return new QA(n);if(n.name==="divide")return new JA(n);if(n.name==="mod")return new YA(n);if(n.name==="and")return new XA(n);if(n.name==="equal")return new lR(n);if(n.name==="not_equal")return new hR(n);if(n.name==="less_than")return new dR(n);if(n.name==="less_than_or_equal")return new fR(n);if(n.name==="greater_than")return new pR(n);if(n.name==="greater_than_or_equal")return new mR(n);if(n.name==="array_concat")return new gR(n);if(n.name==="array_reverse")return new _R(n);if(n.name==="array_contains")return new yR(n);if(n.name==="array_contains_all")return new IR(n);if(n.name==="array_contains_any")return new ER(n);if(n.name==="array_length")return new wR(n);if(n.name==="array_element")return new TR(n);if(n.name==="equal_any")return new Y_(n);if(n.name==="not_equal_any")return new eR(n);if(n.name==="is_nan")return new tR(n);if(n.name==="is_not_nan")return new nR(n);if(n.name==="is_null")return new rR(n);if(n.name==="is_not_null")return new iR(n);if(n.name==="is_error")return new sR(n);if(n.name==="exists")return new oR(n);if(n.name==="not")return new Uc(n);if(n.name==="or")return new ZA(n);if(n.name==="xor")return new Ah(n);if(n.name==="conditional")return new aR(n);if(n.name==="maximum")return new cR(n);if(n.name==="minimum")return new uR(n);if(n.name==="reverse")return new vR(n);if(n.name==="replace_first")return new AR(n);if(n.name==="replace_all")return new RR(n);if(n.name==="char_length")return new PR(n);if(n.name==="byte_length")return new bR(n);if(n.name==="like")return new SR(n);if(n.name==="regex_contains")return new VR(n);if(n.name==="regex_match")return new CR(n);if(n.name==="string_contains")return new NR(n);if(n.name==="starts_with")return new DR(n);if(n.name==="ends_with")return new kR(n);if(n.name==="to_lower")return new xR(n);if(n.name==="to_upper")return new OR(n);if(n.name==="trim")return new LR(n);if(n.name==="string_concat")return new MR(n);if(n.name==="map_get")return new FR(n);if(n.name==="cosine_distance")return new UR(n);if(n.name==="dot_product")return new BR(n);if(n.name==="euclidean_distance")return new qR(n);if(n.name==="vector_length")return new $R(n);if(n.name==="unix_micros_to_timestamp")return new KR(n);if(n.name==="timestamp_to_unix_micros")return new JR(n);if(n.name==="unix_millis_to_timestamp")return new HR(n);if(n.name==="timestamp_to_unix_millis")return new YR(n);if(n.name==="unix_seconds_to_timestamp")return new QR(n);if(n.name==="timestamp_to_unix_seconds")return new XR(n);if(n.name==="timestamp_add")return new ZR(n);if(n.name==="timestamp_subtract")return new eP(n)}throw new Error(`Unknown Expr : ${n}`)}class $A{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===Bt)return T.newValue({referenceValue:qi(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return T.newValue({timestampValue:Fa(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return T.newValue({timestampValue:Fa(e.serializer,t.createTime)});const r=t.data.field(this.expr._fieldPath);return r?Uo(r)?T.newValue((function(s,o){if(s.serverTimestampBehavior==="estimate")return{timestampValue:Fa(s.serializer,K.fromTimestamp(Ci(o)))};if(s.serverTimestampBehavior==="previous"){const c=Bo(o);if(c)return c}return{nullValue:"NULL_VALUE"}})(e,r)):T.newValue(r):T.mr()}}class jA{constructor(e){this.expr=e}evaluate(e,t){return T.newValue(this.expr._getValue())}}class zA{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.ur.map((i=>H(i).evaluate(e,t)));return r.some((i=>i.gr()))?T.dr():T.newValue({arrayValue:{values:r.map((i=>i.value))}})}}function He(n){return Dr(n)?Number(n.doubleValue):Number(n.integerValue)}function Yt(n){return BigInt(n.integerValue)}const GA=BigInt("0x7fffffffffffffff"),WA=-BigInt("0x8000000000000000");class Ho{constructor(e){this.expr=e}evaluate(e,t){L(this.expr.params.length>=2,24778);const r=H(this.expr.params[0]).evaluate(e,t),i=H(this.expr.params[1]).evaluate(e,t);let s=this.wr(r,i);for(const o of this.expr.params.slice(2)){const c=H(o).evaluate(e,t);s=this.wr(s,c)}return s}wr(e,t){if(e.gr()||t.gr())return T.dr();if(e.yr()||t.yr())return T.pr();const r=e.value,i=t.value;if(!Dr(r)&&!qt(r)||!Dr(i)&&!qt(i))return T.dr();if(Dr(r)||Dr(i)){const s=this.br(r,i);return s?T.newValue(s):T.dr()}if(qt(r)&&qt(i)){const s=this.vr(r,i);return s===void 0?T.dr():typeof s=="number"?T.newValue({doubleValue:s}):s<WA||s>GA?T.dr():T.newValue({integerValue:`${s}`})}return T.dr()}}function _n(n,e){return xe(n)!==xe(e)?"TYPE_MISMATCH":gt(n)||gt(e)?"NOT_EQ":wt(n)&&wt(e)?"EQ":wt(n)||wt(e)?"NULL":tr(n)&&tr(e)?(function(r,i){var o,c,u;if(((o=r.values)==null?void 0:o.length)!==((c=i.values)==null?void 0:c.length))return"NOT_EQ";let s=!1;for(let l=0;l<(((u=r.values)==null?void 0:u.length)??0);l++){const d=r.values[l],p=i.values[l];switch(_n(d,p)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":s=!0;break;default:j(44609,{Sr:d,Dr:p})}}return s?"NULL":"EQ"})(n.arrayValue,e.arrayValue):$r(n)&&$r(e)||Or(n)&&Or(e)?(function(r,i){const s=r.fields||{},o=i.fields||{};if(Ja(s)!==Ja(o))return"NOT_EQ";let c=!1;for(const u in s)if(s.hasOwnProperty(u)){if(o[u]===void 0)return"NOT_EQ";switch(_n(s[u],o[u])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":c=!0}}return c?"NULL":"EQ"})(n.mapValue,e.mapValue):(function(r,i){return bt(r,i,{o:!1,t:!0,i:!0})})(n,e)?"EQ":"NOT_EQ"}class KA extends Ho{vr(e,t){return Yt(e)+Yt(t)}br(e,t){return{doubleValue:He(e)+He(t)}}}class HA extends Ho{constructor(e){super(e),this.expr=e}vr(e,t){return Yt(e)-Yt(t)}br(e,t){return{doubleValue:He(e)-He(t)}}}class QA extends Ho{constructor(e){super(e),this.expr=e}vr(e,t){return Yt(e)*Yt(t)}br(e,t){return{doubleValue:He(e)*He(t)}}}class JA extends Ho{constructor(e){super(e),this.expr=e}vr(e,t){const r=Yt(t);if(r!==BigInt(0))return Yt(e)/r}br(e,t){const r=He(t);return r===0?{doubleValue:Ni(r)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:He(e)/r}}}class YA extends Ho{constructor(e){super(e),this.expr=e}vr(e,t){const r=Yt(t);if(r!==BigInt(0))return Yt(e)%r}br(e,t){const r=He(t);if(r!==0)return{doubleValue:He(e)%r}}}class XA{constructor(e){this.expr=e}evaluate(e,t){var s;let r=!1,i=!1;for(const o of this.expr.params){const c=H(o).evaluate(e,t);switch(c.type){case"BOOLEAN":if(!((s=c.value)!=null&&s.booleanValue))return T.newValue(ze);break;case"NULL":i=!0;break;default:r=!0}}return r?T.dr():i?T.pr():T.newValue(mt)}}class Uc{constructor(e){this.expr=e}evaluate(e,t){var i;L(this.expr.params.length===1,9634);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return T.newValue({booleanValue:!((i=r.value)!=null&&i.booleanValue)});case"NULL":return T.pr();default:return T.dr()}}}class ZA{constructor(e){this.expr=e}evaluate(e,t){var s;let r=!1,i=!1;for(const o of this.expr.params){const c=H(o).evaluate(e,t);switch(c.type){case"BOOLEAN":if((s=c.value)!=null&&s.booleanValue)return T.newValue(mt);break;case"NULL":i=!0;break;default:r=!0}}return r?T.dr():i?T.pr():T.newValue(ze)}}class Ah{constructor(e){this.expr=e}evaluate(e,t){var s;let r=!1,i=!1;for(const o of this.expr.params){const c=H(o).evaluate(e,t);switch(c.type){case"BOOLEAN":r=Ah.xor(r,!!((s=c.value)!=null&&s.booleanValue));break;case"NULL":i=!0;break;default:return T.dr()}}return i?T.pr():T.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class Y_{constructor(e){this.expr=e}evaluate(e,t){var o,c;L(this.expr.params.length===2,55094);let r=!1;const i=H(this.expr.params[0]).evaluate(e,t);switch(i.type){case"NULL":r=!0;break;case"ERROR":case"UNSET":return T.dr()}const s=H(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.dr()}if(r)return T.pr();for(const u of((c=(o=s.value)==null?void 0:o.arrayValue)==null?void 0:c.values)??[])switch(wt(i.value)&&wt(u)?"EQ":_n(i.value,u)){case"EQ":return T.newValue(mt);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:j(44608,{value:i.value,candidate:u})}return r?T.pr():T.newValue(ze)}}class eR{constructor(e){this.expr=e}evaluate(e,t){return new Uc(new N("not",[new N("equal_any",this.expr.params)])).evaluate(e,t)}}class tR{constructor(e){this.expr=e}evaluate(e,t){L(this.expr.params.length===1,23322);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return T.newValue(ze);case"DOUBLE":return T.newValue({booleanValue:isNaN(He(r.value))});case"NULL":return T.pr();default:return T.dr()}}}class nR{constructor(e){this.expr=e}evaluate(e,t){return L(this.expr.params.length===1,50406),new Uc(new N("not",[new N("is_nan",this.expr.params)])).evaluate(e,t)}}class rR{constructor(e){this.expr=e}evaluate(e,t){switch(L(this.expr.params.length===1,23123),H(this.expr.params[0]).evaluate(e,t).type){case"NULL":return T.newValue(mt);case"UNSET":case"ERROR":return T.dr();default:return T.newValue(ze)}}}class iR{constructor(e){this.expr=e}evaluate(e,t){return L(this.expr.params.length===1,23167),new Uc(new N("not",[new N("is_null",this.expr.params)])).evaluate(e,t)}}class sR{constructor(e){this.expr=e}evaluate(e,t){return L(this.expr.params.length===1,5228),H(this.expr.params[0]).evaluate(e,t).type==="ERROR"?T.newValue(mt):T.newValue(ze)}}class oR{constructor(e){this.expr=e}evaluate(e,t){switch(L(this.expr.params.length===1,6877),H(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return T.dr();case"UNSET":return T.newValue(ze);default:return T.newValue(mt)}}}class aR{constructor(e){this.expr=e}evaluate(e,t){var i;L(this.expr.params.length===3,11706);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return(i=r.value)!=null&&i.booleanValue?H(this.expr.params[1]).evaluate(e,t):H(this.expr.params[2]).evaluate(e,t);case"NULL":return H(this.expr.params[2]).evaluate(e,t);default:return T.dr()}}}class cR{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((s=>H(s).evaluate(e,t)));let i;for(const s of r)switch(s.type){case"ERROR":case"UNSET":case"NULL":continue;default:i=i===void 0||tt(s.value,i.value)>0?s:i}return i===void 0?T.pr():i}}class uR{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((s=>H(s).evaluate(e,t)));let i;for(const s of r)switch(s.type){case"ERROR":case"UNSET":case"NULL":continue;default:i=i===void 0||tt(s.value,i.value)<0?s:i}return i===void 0?T.pr():i}}class as{constructor(e){this.expr=e}evaluate(e,t){L(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return T.dr()}const i=H(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ERROR":case"UNSET":return T.dr()}return this.Cr(r,i)}}class lR extends as{constructor(e){super(e),this.expr=e}Cr(e,t){if(e.yr()&&t.yr())return T.newValue(mt);if(e.yr()||t.yr()||gt(e.value)||gt(t.value)||xe(e.value)!==xe(t.value))return T.newValue(ze);switch(_n(e.value,t.value)){case"EQ":return T.newValue(mt);case"NOT_EQ":return T.newValue(ze);case"NULL":return T.pr();default:j(44615,{left:e,right:t})}}}class hR extends as{constructor(e){super(e),this.expr=e}Cr(e,t){switch(_n(e.value,t.value)){case"EQ":return T.newValue(ze);case"NOT_EQ":case"TYPE_MISMATCH":return T.newValue(mt);case"NULL":return T.pr();default:j(44614,{left:e,right:t})}}}class dR extends as{constructor(e){super(e),this.expr=e}Cr(e,t){return xe(e.value)!==xe(t.value)||gt(e.value)||gt(t.value)?T.newValue(ze):T.newValue({booleanValue:tt(e.value,t.value)<0})}}class fR extends as{constructor(e){super(e),this.expr=e}Cr(e,t){return xe(e.value)!==xe(t.value)||gt(e.value)||gt(t.value)?T.newValue(ze):_n(e.value,t.value)==="EQ"?T.newValue(mt):T.newValue({booleanValue:tt(e.value,t.value)<0})}}class pR extends as{constructor(e){super(e),this.expr=e}Cr(e,t){return xe(e.value)!==xe(t.value)||gt(e.value)||gt(t.value)?T.newValue(ze):T.newValue({booleanValue:tt(e.value,t.value)>0})}}class mR extends as{constructor(e){super(e),this.expr=e}Cr(e,t){return xe(e.value)!==xe(t.value)||gt(e.value)||gt(t.value)?T.newValue(ze):_n(e.value,t.value)==="EQ"?T.newValue(mt):T.newValue({booleanValue:tt(e.value,t.value)>0})}}class gR{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class _R{constructor(e){this.expr=e}evaluate(e,t){var i;L(this.expr.params.length===1,216);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.pr();case"ARRAY":{const s=((i=r.value.arrayValue)==null?void 0:i.values)??[];return T.newValue({arrayValue:{values:[...s].reverse()}})}default:return T.dr()}}}class yR{constructor(e){this.expr=e}evaluate(e,t){return L(this.expr.params.length===2,52884),new Y_(new N("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class IR{constructor(e){this.expr=e}evaluate(e,t){var u,l,d,p;L(this.expr.params.length===2,1392);let r=!1;const i=H(this.expr.params[0]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.dr()}const s=H(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.dr()}if(r)return T.pr();const o=((l=(u=s.value)==null?void 0:u.arrayValue)==null?void 0:l.values)??[],c=((p=(d=i.value)==null?void 0:d.arrayValue)==null?void 0:p.values)??[];for(const m of o){let I=!1;r=!1;for(const P of c){switch(wt(m)&&wt(P)?"EQ":_n(m,P)){case"EQ":I=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:j(44613,{value:P,search:m})}if(I)break}if(!I)return T.newValue(ze)}return T.newValue(mt)}}class ER{constructor(e){this.expr=e}evaluate(e,t){var u,l,d,p;L(this.expr.params.length===2,2680);let r=!1;const i=H(this.expr.params[0]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.dr()}const s=H(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.dr()}if(r)return T.pr();const o=((l=(u=s.value)==null?void 0:u.arrayValue)==null?void 0:l.values)??[],c=((p=(d=i.value)==null?void 0:d.arrayValue)==null?void 0:p.values)??[];for(const m of c)for(const I of o)switch(wt(m)&&wt(I)?"EQ":_n(m,I)){case"EQ":return T.newValue(mt);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:j(60403,{value:m,search:I})}return r?T.pr():T.newValue(ze)}}class wR{constructor(e){this.expr=e}evaluate(e,t){var i,s,o;L(this.expr.params.length===1,38605);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.pr();case"ARRAY":return T.newValue({integerValue:`${((o=(s=(i=r.value)==null?void 0:i.arrayValue)==null?void 0:s.values)==null?void 0:o.length)??0}`});default:return T.dr()}}}class TR{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class vR{constructor(e){this.expr=e}evaluate(e,t){var i,s;L(this.expr.params.length===1,1508);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.pr();case"BYTES":{const o=(i=r.value)==null?void 0:i.bytesValue;if(typeof o=="string"){const c=pe.fromBase64String(o).toUint8Array();return c.reverse(),T.newValue({bytesValue:pe.fromUint8Array(c).toBase64()})}return T.newValue({bytesValue:new Uint8Array(o).reverse()})}case"STRING":{const o=(s=r.value)==null?void 0:s.stringValue,c=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(o),u=Array.from(c,(l=>l.segment)).reverse();return T.newValue({stringValue:u.join("")})}default:return T.dr()}}}class AR{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class RR{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class PR{constructor(e){this.expr=e}evaluate(e,t){L(this.expr.params.length===1,19400);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.pr();case"STRING":{const i=(function(o){let c=0;for(let u=0;u<o.length;u++){const l=o.codePointAt(u);if(l===void 0)return;if(l<=65535)if(l>=55296&&l<=57343)if(l<=56319){const d=o.codePointAt(u+1);d!==void 0&&d>=56320&&d<=57343?(c+=1,u++):c+=1}else c+=1;else c+=1;else{if(!(l<=1114111))return;c+=1,u++}}return c})(r.value.stringValue);return i===void 0?T.dr():T.newValue({integerValue:i})}default:return T.dr()}}}class bR{constructor(e){this.expr=e}evaluate(e,t){var i,s;L(this.expr.params.length===1,8486);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BYTES":{const o=(i=r.value)==null?void 0:i.bytesValue;return typeof o=="string"?T.newValue({integerValue:pe.fromBase64String(o).toUint8Array().length}):T.newValue({integerValue:new Uint8Array(o).length})}case"STRING":{const o=(function(u){let l=0;for(let d=0;d<u.length;d++){const p=u.codePointAt(d);if(p===void 0)return;if(p>=55296&&p<=57343){if(!(p<=56319))return;{const m=u.codePointAt(d+1);if(m===void 0||!(m>=56320&&m<=57343))return;l+=4,d++}}else if(p<=127)l+=1;else if(p<=2047)l+=2;else if(p<=65535)l+=3;else{if(!(p<=1114111))return;l+=4,d++}}return l})((s=r.value)==null?void 0:s.stringValue);return o===void 0?T.dr():T.newValue({integerValue:o})}case"NULL":return T.pr();default:return T.dr()}}}class cs{constructor(e){this.expr=e}evaluate(e,t){var o,c;L(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let r=!1;const i=H(this.expr.params[0]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":r=!0;break;default:return T.dr()}const s=H(this.expr.params[1]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":r=!0;break;default:return T.dr()}return r?T.pr():this.Fr((o=i.value)==null?void 0:o.stringValue,(c=s.value)==null?void 0:c.stringValue)}}class SR extends cs{Fr(e,t){try{const r=(function(o){let c="";for(let u=0;u<o.length;u++){const l=o.charAt(u);switch(l){case"_":c+=".";break;case"%":c+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":c+="\\"+l;break;default:c+=l}}return"^"+c+"$"})(t),i=Ul.compile(r);return T.newValue({booleanValue:i.matches(e)})}catch(r){return Fe(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${r}`),T.dr()}}}class VR extends cs{Fr(e,t){try{const r=Ul.compile(t);return T.newValue({booleanValue:r.test(e)})}catch{return Fe(`Invalid regex pattern found in regex_contains: ${t}, returning error`),T.dr()}}}class CR extends cs{Fr(e,t){try{return T.newValue({booleanValue:Ul.compile(t).matches(e)})}catch{return Fe(`Invalid regex pattern found in regex_match: ${t}, returning error`),T.dr()}}}class NR extends cs{Fr(e,t){return T.newValue({booleanValue:e.includes(t)})}}class DR extends cs{Fr(e,t){return T.newValue({booleanValue:e.startsWith(t)})}}class kR extends cs{Fr(e,t){return T.newValue({booleanValue:e.endsWith(t)})}}class xR{constructor(e){this.expr=e}evaluate(e,t){var i,s;L(this.expr.params.length===1,29079);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return T.newValue({stringValue:(s=(i=r.value)==null?void 0:i.stringValue)==null?void 0:s.toLowerCase()});case"NULL":return T.pr();default:return T.dr()}}}class OR{constructor(e){this.expr=e}evaluate(e,t){var i,s;L(this.expr.params.length===1,60487);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return T.newValue({stringValue:(s=(i=r.value)==null?void 0:i.stringValue)==null?void 0:s.toUpperCase()});case"NULL":return T.pr();default:return T.dr()}}}class LR{constructor(e){this.expr=e}evaluate(e,t){var i,s;L(this.expr.params.length===1,28544);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return T.newValue({stringValue:(s=(i=r.value)==null?void 0:i.stringValue)==null?void 0:s.trim()});case"NULL":return T.pr();default:return T.dr()}}}class MR{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((o=>H(o).evaluate(e,t)));let i="",s=!1;for(const o of r)switch(o.type){case"STRING":i+=o.value.stringValue;break;case"NULL":s=!0;break;default:return T.dr()}return s?T.pr():T.newValue({stringValue:i})}}class FR{constructor(e){this.expr=e}evaluate(e,t){var o,c,u,l;L(this.expr.params.length===2,4483);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"UNSET":return T.mr();case"MAP":break;default:return T.dr()}const i=H(this.expr.params[1]).evaluate(e,t);if(i.type!=="STRING")return T.dr();const s=(l=(c=(o=r.value)==null?void 0:o.mapValue)==null?void 0:c.fields)==null?void 0:l[(u=i.value)==null?void 0:u.stringValue];return s===void 0?T.mr():T.newValue(s)}}class Rh{constructor(e){this.expr=e}evaluate(e,t){var l,d;L(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let r=!1;const i=H(this.expr.params[0]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":r=!0;break;default:return T.dr()}const s=H(this.expr.params[1]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":r=!0;break;default:return T.dr()}if(r)return T.pr();const o=cl(i.value),c=cl(s.value);if(o===void 0||c===void 0||((l=o.values)==null?void 0:l.length)!==((d=c.values)==null?void 0:d.length))return T.dr();const u=this.Or(o,c);return u===void 0||isNaN(u)?T.dr():T.newValue({doubleValue:u})}}class UR extends Rh{Or(e,t){const r=(e==null?void 0:e.values)??[],i=(t==null?void 0:t.values)??[];if(r.length===0)return;let s=0,o=0,c=0;for(let l=0;l<r.length;l++){if(!er(r[l])||!er(i[l]))return;const d=He(r[l]),p=He(i[l]);s+=d*p,o+=d*d,c+=p*p}const u=Math.sqrt(o)*Math.sqrt(c);if(u!==0)return 1-Math.max(-1,Math.min(1,s/u))}}class BR extends Rh{Or(e,t){const r=(e==null?void 0:e.values)??[],i=(t==null?void 0:t.values)??[];if(r.length===0)return 0;let s=0;for(let o=0;o<r.length;o++){if(!er(r[o])||!er(i[o]))return;s+=He(r[o])*He(i[o])}return s}}class qR extends Rh{Or(e,t){const r=(e==null?void 0:e.values)??[],i=(t==null?void 0:t.values)??[];if(r.length===0)return 0;let s=0;for(let o=0;o<r.length;o++){if(!er(r[o])||!er(i[o]))return;const c=He(r[o]),u=He(i[o]);s+=Math.pow(c-u,2)}return Math.sqrt(s)}}class $R{constructor(e){this.expr=e}evaluate(e,t){var i;L(this.expr.params.length===1,39044);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{const s=cl(r.value);return T.newValue({integerValue:((i=s==null?void 0:s.values)==null?void 0:i.length)??0})}case"NULL":return T.pr();default:return T.dr()}}}const Ro=BigInt(-62135596800),Po=BigInt(253402300799),nc=BigInt(1e3),Gn=BigInt(1e6),jR=Ro*nc,zR=Po*nc+BigInt(999),GR=Ro*Gn,WR=Po*Gn+BigInt(999999);function Ph(n){return n>=GR&&n<=WR}function X_(n){return n>=Ro&&n<=Po}function bo(n,e){const t=BigInt(n);return!(t<Ro||t>Po)&&!(e<0||e>=1e9)&&(t!==Ro||e===0)&&!(t===Po&&e>999999999)}function Z_(n,e){return e<0?{seconds:n-1,nanos:e+1e9}:{seconds:n,nanos:e}}function bh(n){return BigInt(n.seconds)*Gn+BigInt(Math.trunc(n.nanoseconds/1e3))}class Sh{constructor(e){this.expr=e}evaluate(e,t){L(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return this.toTimestamp(BigInt(r.value.integerValue));case"NULL":return T.pr();default:return T.dr()}}}class KR extends Sh{toTimestamp(e){if(!Ph(e))return T.dr();let t=Number(e/Gn),r=Number(e%Gn*BigInt(1e3));const i=Z_(t,r);return t=i.seconds,r=i.nanos,bo(t,r)?T.newValue({timestampValue:{seconds:t,nanos:r}}):T.dr()}}class HR extends Sh{toTimestamp(e){if(!(function(o){return o>=jR&&o<=zR})(e))return T.dr();let t=Number(e/nc),r=Number(e%nc*BigInt(1e6));const i=Z_(t,r);return t=i.seconds,r=i.nanos,bo(t,r)?T.newValue({timestampValue:{seconds:t,nanos:r}}):T.dr()}}class QR extends Sh{toTimestamp(e){if(!X_(e))return T.dr();const t=Number(e);return T.newValue({timestampValue:{seconds:t,nanos:0}})}}class Vh{constructor(e){this.expr=e}evaluate(e,t){L(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const r=H(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":return T.pr();default:return T.dr()}const i=oh(r.value.timestampValue);return bo(i.seconds,i.nanoseconds)?this.Mr(i):T.dr()}}class JR extends Vh{Mr(e){const t=bh(e);return Ph(t)?T.newValue({integerValue:`${t.toString()}`}):T.dr()}}class YR extends Vh{Mr(e){const t=bh(e),r=t/BigInt(1e3),i=t%BigInt(1e3);return r>BigInt(0)||i===BigInt(0)?T.newValue({integerValue:r.toString()}):T.newValue({integerValue:(r-BigInt(1)).toString()})}}class XR extends Vh{Mr(e){const t=BigInt(e.seconds);return X_(t)?T.newValue({integerValue:t.toString()}):T.dr()}}class ey{constructor(e){this.expr=e}evaluate(e,t){L(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let r=!1;const i=H(this.expr.params[0]).evaluate(e,t);switch(i.type){case"TIMESTAMP":break;case"NULL":r=!0;break;default:return T.dr()}const s=H(this.expr.params[1]).evaluate(e,t);let o;switch(s.type){case"STRING":if(o=(function(G){switch(G){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(s.value.stringValue),o===void 0)return T.dr();break;case"NULL":r=!0;break;default:return T.dr()}const c=H(this.expr.params[2]).evaluate(e,t);switch(c.type){case"INT":break;case"NULL":r=!0;break;default:return T.dr()}if(r)return T.pr();const u=BigInt(c.value.integerValue);let l;try{switch(o){case"microsecond":l=u;break;case"millisecond":l=u*BigInt(1e3);break;case"second":l=u*BigInt(1e6);break;case"minute":l=u*BigInt(6e7);break;case"hour":l=u*BigInt(36e8);break;case"day":l=u*BigInt(864e8);break;default:return T.dr()}if(o!=="microsecond"&&u!==BigInt(0)&&l/u!==BigInt(this.Nr(o)))return T.dr()}catch($){return Fe(`Error during timestamp arithmetic: ${$}`),T.dr()}const d=oh(i.value.timestampValue);if(!bo(d.seconds,d.nanoseconds))return T.dr();const p=bh(d),m=this.Lr(p,l);if(!Ph(m))return T.dr();const I=Number(m/Gn),P=m%Gn,x=Number((P<0?P+Gn:P)*BigInt(1e3)),D=P<0?I-1:I;return bo(D,x)?T.newValue({timestampValue:{seconds:D,nanos:x}}):T.dr()}Nr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class ZR extends ey{Lr(e,t){return e+t}}class eP extends ey{Lr(e,t){return e-t}}// Copyright 2024 Google LLC* @license
class Xe{constructor(e,t,r){this.serializer=e,this.stages=t,this.listenOptions=r,this.isCorePipeline=!0}getPipelineCollection(){return Qo(this)}getPipelineCollectionGroup(){return Ch(this)}getPipelineCollectionId(){return ty(this)}getPipelineDocuments(){return rc(this)}getPipelineFlavor(){return(function(t){let r="exact";return t.stages.forEach(((i,s)=>{i._name!==Q_.name&&i._name!==H_.name||(r="keyless"),i._name===qA.name&&r==="exact"&&(r="augmented"),i._name===K_.name&&s<t.stages.length-1&&r==="exact"&&(r="augmented")})),r})(this)}getPipelineSourceType(){return hn(this)}}function hn(n){const e=n.stages[0];return e instanceof Go||e instanceof Wo||e instanceof Mc||e instanceof Fc?e._name:"unknown"}function Qo(n){if(hn(n)==="collection")return n.stages[0].Er}function Ch(n){if(hn(n)==="collection_group")return n.stages[0].collectionId}function ty(n){switch(hn(n)){case"collection":return X.fromString(Qo(n)).lastSegment();case"collection_group":return Ch(n);default:return}}function rc(n){if(hn(n)==="documents")return n.stages[0].hr}function So(n){if((n=J_(n))instanceof ri)return`fld(${n.fieldName})`;if(n instanceof ii)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof ae?`ref(${t.path})`:t instanceof ot?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(n.value)})`;if(n instanceof N)return`fn(${n.name},[${n.params.map(So).join(",")}])`;if(n.expressionType==="ListOfExpressions")return`list([${n.ur.map(So).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(n,null,2)}`)}function tP(n){if(n instanceof K_)return`${n._name}(${Aa(n.fields)})`;if(n instanceof H_){let e=`${n._name}(${Aa(n.accumulators)})`;return n.groups.size>0&&(e+=`grouping(${Aa(n.groups)})`),e}if(n instanceof Q_)return`${n._name}(${Aa(n.groups)})`;if(n instanceof Go)return`${n._name}(${n.Er})`;if(n instanceof Wo)return`${n._name}(${n.collectionId})`;if(n instanceof Mc)return`${n._name}()`;if(n instanceof Fc)return`${n._name}(${n.hr.sort()})`;if(n instanceof Ko)return`${n._name}(${So(n.condition)})`;if(n instanceof ir)return`${n._name}(${n.limit})`;if(n instanceof $t)return`${n._name}(${(function(t){return t.map((r=>`${So(r.expr)}${r.direction}`)).join(",")})(n.orderings)})`;throw new Error(`Unrecognized stage ${n._name}`)}function Aa(n){return`${Array.from(n.entries()).sort().map((([e,t])=>`${e}=${So(t)}`)).join(",")}`}function dn(n){return n.stages.map((e=>tP(e))).join("|")}function ny(n,e){return dn(n)===dn(e)}function Te(n){return n instanceof Xe}function Vp(n){return Te(n)?dn(n):eo(n)}function ry(n){return Te(n)?dn(n):(function(t){return`${Xa(Ze(t))}|lt:${t.limitType}`})(n)}function Bc(n,e){return n instanceof Xe&&e instanceof Xe?ny(n,e):!(n instanceof Xe&&!(e instanceof Xe)||!(n instanceof Xe)&&e instanceof Xe)&&Yg(n,e)}function qc(n){return tn(n)?dn(n):Xa(n)}function Nh(n,e){return n instanceof Xe&&e instanceof Xe?ny(n,e):!(n instanceof Xe&&!(e instanceof Xe)||!(n instanceof Xe)&&e instanceof Xe)&&th(n,e)}function nP(n,e){const t=(function(i){let s=!1;const o=[];for(const c of i)if(c instanceof $t)if(s=!0,c.orderings.some((u=>u.expr instanceof ri&&u.expr.fieldName===Bt)))o.push(c);else{const u=c.orderings.map((l=>l));u.push(Ua(Bt).ascending()),o.push(new $t(u,{}))}else c instanceof ir&&(s||(o.push(new $t([Ua(Bt).ascending()],{})),s=!0)),o.push(c);return s||o.push(new $t([Ua(Bt).ascending()],{})),o})(n.stages);if(n.userDataReader){const r=n.userDataReader.createContext(3,"toCorePipeline");t.forEach((i=>i._readUserData(r)))}return new Xe(n.userDataReader.serializer,t,e)}/**
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
 */class Dh{constructor(e,t,r,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&fv(s,e,r[i])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Zs(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Zs(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=n_();return this.mutations.forEach((i=>{const s=e.get(i.key),o=s.overlayedDocument;let c=this.applyToLocalView(o,s.mutatedFields);c=t.has(i.key)?null:c;const u=Lg(o,c);u!==null&&r.set(i.key,u),o.isValidDocument()||o.convertToNoDocument(K.min())})),r}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),J())}isEqual(e){return this.batchId===e.batchId&&Vi(this.mutations,e.mutations,((t,r)=>sp(t,r)))&&Vi(this.baseMutations,e.baseMutations,((t,r)=>sp(t,r)))}}class kh{constructor(e,t,r,i){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=i}static from(e,t,r){L(e.mutations.length===r.length,58842,{Br:e.mutations.length,Ur:r.length});let i=(function(){return Dv})();const s=e.mutations;for(let o=0;o<s.length;o++)i=i.insert(s[o].key,r[o].version);return new kh(e,t,r,i)}}/**
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
 */const ic="";function et(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=Cp(e)),e=rP(n.get(t),e);return Cp(e)}function rP(n,e){let t=e;const r=n.length;for(let i=0;i<r;i++){const s=n.charAt(i);switch(s){case"\0":t+="";break;case ic:t+="";break;default:t+=s}}return t}function Cp(n){return n+ic+""}function jt(n){const e=n.length;if(L(e>=2,64408,{path:n}),e===2)return L(n.charAt(0)===ic&&n.charAt(1)==="",56145,{path:n}),X.emptyPath();const t=e-2,r=[];let i="";for(let s=0;s<e;){const o=n.indexOf(ic,s);switch((o<0||o>t)&&j(50515,{path:n}),n.charAt(o+1)){case"":const c=n.substring(s,o);let u;i.length===0?u=c:(i+=c,u=i,i=""),r.push(u);break;case"":i+=n.substring(s,o),i+="\0";break;case"":i+=n.substring(s,o+1);break;default:j(61167,{path:n})}s=o+2}return new X(r)}/**
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
 */const Pr="remoteDocuments",Jo="owner",hi="owner",Vo="mutationQueues",iP="userId",Vt="mutations",Np="batchId",kr="userMutationsIndex",Dp=["userId","batchId"];/**
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
 */function Ba(n,e){return[n,et(e)]}function iy(n,e,t){return[n,et(e),t]}const sP={},$i="documentMutations",sc="remoteDocumentsV14",oP=["prefixPath","collectionGroup","readTime","documentId"],qa="documentKeyIndex",aP=["prefixPath","collectionGroup","documentId"],sy="collectionGroupIndex",cP=["collectionGroup","readTime","prefixPath","documentId"],Co="remoteDocumentGlobal",El="remoteDocumentGlobalKey",ji="targets",oy="queryTargetsIndex",uP=["canonicalId","targetId"],zi="targetDocuments",lP=["targetId","path"],xh="documentTargetsIndex",hP=["path","targetId"],oc="targetGlobalKey",Mr="targetGlobal",No="collectionParents",dP=["collectionId","parent"],Gi="clientMetadata",fP="clientId",$c="bundles",pP="bundleId",jc="namedQueries",mP="name",Oh="indexConfiguration",gP="indexId",wl="collectionGroupIndex",_P="collectionGroup",oo="indexState",yP=["indexId","uid"],ay="sequenceNumberIndex",IP=["uid","sequenceNumber"],ao="indexEntries",EP=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],cy="documentKeyIndex",wP=["indexId","uid","orderedDocumentKey"],zc="documentOverlays",TP=["userId","collectionPath","documentId"],Tl="collectionPathOverlayIndex",vP=["userId","collectionPath","largestBatchId"],uy="collectionGroupOverlayIndex",AP=["userId","collectionGroup","largestBatchId"],Lh="globals",RP="name",ly=[Vo,Vt,$i,Pr,ji,Jo,Mr,zi,Gi,Co,No,$c,jc],PP=[...ly,zc],hy=[Vo,Vt,$i,sc,ji,Jo,Mr,zi,Gi,Co,No,$c,jc,zc],dy=hy,Mh=[...dy,Oh,oo,ao],bP=Mh,fy=[...Mh,Lh],SP=fy;/**
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
 */function py(n,e,t){const r=n.store(Vt),i=n.store($i),s=[],o=IDBKeyRange.only(t.batchId);let c=0;const u=r.jn({range:o},((d,p,m)=>(c++,m.delete())));s.push(u.next((()=>{L(c===1,47070,{batchId:t.batchId})})));const l=[];for(const d of t.mutations){const p=iy(e,d.key.path,t.batchId);s.push(i.delete(p)),l.push(d.key)}return R.waitFor(s).next((()=>l))}function ac(n){if(!n)return 0;let e;if(n.document)e=n.document;else if(n.unknownDocument)e=n.unknownDocument;else{if(!n.noDocument)throw j(14731);e=n.noDocument}return JSON.stringify(e).length}/**
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
 */class vl extends b_{constructor(e,t){super(),this.kr=e,this.currentSequenceNumber=t}}function Be(n,e){const t=B(n);return Qt.xn(t.kr,e)}/**
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
 */class Fh{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class zt{constructor(e,t,r,i,s=K.min(),o=K.min(),c=pe.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=c,this.expectedCount=u}withSequenceNumber(e){return new zt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new zt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new zt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new zt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class my{constructor(e){this.qr=e}}function VP(n,e){let t;if(e.document)t=Dc(n.qr,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const r=F.fromSegments(e.noDocument.path),i=Kr(e.noDocument.readTime);t=ge.newNoDocument(r,i),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return j(56709);{const r=F.fromSegments(e.unknownDocument.path),i=Kr(e.unknownDocument.version);t=ge.newUnknownDocument(r,i)}}return e.readTime&&t.setReadTime((function(i){const s=new oe(i[0],i[1]);return K.fromTimestamp(s)})(e.readTime)),t}function kp(n,e){const t=e.key,r={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:cc(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())r.document=(function(s,o){return{name:qi(s,o.key),fields:o.data.value.mapValue.fields,updateTime:Bi(s,o.version.toTimestamp()),createTime:Bi(s,o.createTime.toTimestamp())}})(n.qr,e);else if(e.isNoDocument())r.noDocument={path:t.path.toArray(),readTime:Wr(e.version)};else{if(!e.isUnknownDocument())return j(57904,{document:e});r.unknownDocument={path:t.path.toArray(),version:Wr(e.version)}}return r}function cc(n){const e=n.toTimestamp();return[e.seconds,e.nanoseconds]}function Wr(n){const e=n.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function Kr(n){const e=new oe(n.seconds,n.nanoseconds);return K.fromTimestamp(e)}function Vr(n,e){const t=(e.baseMutations||[]).map((s=>_l(n.qr,s)));for(let s=0;s<e.mutations.length-1;++s){const o=e.mutations[s];if(s+1<e.mutations.length&&e.mutations[s+1].transform!==void 0){const c=e.mutations[s+1];o.updateTransforms=c.transform.fieldTransforms,e.mutations.splice(s+1,1),++s}}const r=e.mutations.map((s=>_l(n.qr,s))),i=oe.fromMillis(e.localWriteTimeMs);return new Dh(e.batchId,i,t,r)}function Js(n,e){const t=Kr(e.readTime),r=e.lastLimboFreeSnapshotVersion!==void 0?Kr(e.lastLimboFreeSnapshotVersion):K.min();let i;return i=(function(o){return o.structuredPipeline!==void 0})(e.query)?(function(o,c){var d,p;const u=o.structuredPipeline;L((((d=u==null?void 0:u.pipeline)==null?void 0:d.stages)??[]).length>0,1845);const l=(p=u==null?void 0:u.pipeline)==null?void 0:p.stages.map(CP);return new Xe(c,l)})(e.query,n.qr):(function(o){return o.documents!==void 0})(e.query)?(function(o){const c=o.documents.length;return L(c===1,1966,{count:c}),Ze(ss(u_(o.documents[0])))})(e.query):(function(o){return Ze(f_(o))})(e.query),new zt(i,e.targetId,"TargetPurposeListen",e.lastListenSequenceNumber,t,r,pe.fromBase64String(e.resumeToken))}function gy(n,e){const t=Wr(e.snapshotVersion),r=Wr(e.lastLimboFreeSnapshotVersion);let i;i=tn(e.target)?p_(n.qr,e.target):nh(e.target)?h_(n.qr,e.target):kc(n.qr,e.target).be;const s=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:qc(e.target),readTime:t,resumeToken:s,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:r,query:i}}function Gc(n){const e=f_({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?ec(e,e.limit,"L"):e}function Ra(n,e){return new Fh(e.largestBatchId,_l(n.qr,e.overlayMutation))}function xp(n,e){const t=e.path.lastSegment();return[n,et(e.path.popLast()),t]}function Op(n,e,t,r){return{indexId:n,uid:e,sequenceNumber:t,readTime:Wr(r.readTime),documentKey:et(r.documentKey.path),largestBatchId:r.largestBatchId}}function CP(n){switch(n.name){case"collection":return new Go(n.args[0].referenceValue,{});case"collection_group":return new Wo(n.args[1].stringValue,{});case"database":return new Mc({});case"documents":return new Fc(n.args.map((e=>e.referenceValue)),{});case"where":return new Ko(Al(n.args[0]),{});case"limit":{const e=n.args[0].integerValue??n.args[0].doubleValue;return new ir(typeof e=="number"?e:Number(e),{})}case"sort":return new $t(n.args.map((e=>(function(r){var s,o;const i=(s=r.mapValue)==null?void 0:s.fields;return new Th(Al(i.expression),(o=i.direction)==null?void 0:o.stringValue,"orderingFromProto")})(e))),{});default:throw new Error(`Stage type: ${n.name} not supported.`)}}function Al(n){return n.fieldReferenceValue?new ri(xt("_exprFromProto",n.fieldReferenceValue),"_exprFromProto"):n.functionValue?(function(t){var r;return new N(t.functionValue.name,((r=t.functionValue.args)==null?void 0:r.map(Al))||[])})(n):ii._fromProto(n)}class Wc{constructor(e,t,r,i){this.userId=e,this.serializer=t,this.indexManager=r,this.referenceDelegate=i,this.$r={}}static Kr(e,t,r,i){L(e.uid!=="",64387);const s=e.isAuthenticated()?e.uid:"";return new Wc(s,t,r,i)}checkEmpty(e){let t=!0;const r=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return kn(e).jn({index:kr,range:r},((i,s,o)=>{t=!1,o.done()})).next((()=>t))}addMutationBatch(e,t,r,i){const s=Ei(e),o=kn(e);return o.add({}).next((c=>{L(typeof c=="number",49019);const u=new Dh(c,t,r,i),l=(function(I,P,x){const D=x.baseMutations.map((G=>To(I.qr,G))),$=x.mutations.map((G=>To(I.qr,G)));return{userId:P,batchId:x.batchId,localWriteTimeMs:x.localWriteTime.toMillis(),baseMutations:D,mutations:$}})(this.serializer,this.userId,u),d=[];let p=new ce(((m,I)=>Q(m.canonicalString(),I.canonicalString())));for(const m of i){const I=iy(this.userId,m.key.path,c);p=p.add(m.key.path.popLast()),d.push(o.put(l)),d.push(s.put(I,sP))}return p.forEach((m=>{d.push(this.indexManager.addToCollectionParentIndex(e,m))})),e.addOnCommittedListener((()=>{this.$r[c]=u.keys()})),R.waitFor(d).next((()=>u))}))}lookupMutationBatch(e,t){return kn(e).get(t).next((r=>r?(L(r.userId===this.userId,48,"Unexpected user for mutation batch",{userId:r.userId,batchId:t}),Vr(this.serializer,r)):null))}Wr(e,t){return this.$r[t]?R.resolve(this.$r[t]):this.lookupMutationBatch(e,t).next((r=>{if(r){const i=r.keys();return this.$r[t]=i,i}return null}))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=IDBKeyRange.lowerBound([this.userId,r]);let s=null;return kn(e).jn({index:kr,range:i},((o,c,u)=>{c.userId===this.userId&&(L(c.batchId>=r,47524,{Qr:r}),s=Vr(this.serializer,c)),u.done()})).next((()=>s))}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let r=zn;return kn(e).jn({index:kr,range:t,reverse:!0},((i,s,o)=>{r=s.batchId,o.done()})).next((()=>r))}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,zn],[this.userId,Number.POSITIVE_INFINITY]);return kn(e).Kn(kr,t).next((r=>r.map((i=>Vr(this.serializer,i)))))}getAllMutationBatchesAffectingDocumentKey(e,t){const r=Ba(this.userId,t.path),i=IDBKeyRange.lowerBound(r),s=[];return Ei(e).jn({range:i},((o,c,u)=>{const[l,d,p]=o,m=jt(d);if(l===this.userId&&t.path.isEqual(m))return kn(e).get(p).next((I=>{if(!I)throw j(61480,{Gr:o,batchId:p});L(I.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:I.userId,batchId:p}),s.push(Vr(this.serializer,I))}));u.done()})).next((()=>s))}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ce(Q);const i=[];return t.forEach((s=>{const o=Ba(this.userId,s.path),c=IDBKeyRange.lowerBound(o),u=Ei(e).jn({range:c},((l,d,p)=>{const[m,I,P]=l,x=jt(I);m===this.userId&&s.path.isEqual(x)?r=r.add(P):p.done()}));i.push(u)})),R.waitFor(i).next((()=>this.zr(e,r)))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1,s=Ba(this.userId,r),o=IDBKeyRange.lowerBound(s);let c=new ce(Q);return Ei(e).jn({range:o},((u,l,d)=>{const[p,m,I]=u,P=jt(m);p===this.userId&&r.isPrefixOf(P)?P.length===i&&(c=c.add(I)):d.done()})).next((()=>this.zr(e,c)))}zr(e,t){const r=[],i=[];return t.forEach((s=>{i.push(kn(e).get(s).next((o=>{if(o===null)throw j(35274,{batchId:s});L(o.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:o.userId,batchId:s}),r.push(Vr(this.serializer,o))})))})),R.waitFor(i).next((()=>r))}removeMutationBatch(e,t){return py(e.kr,this.userId,t).next((r=>(e.addOnCommittedListener((()=>{this.jr(t.batchId)})),R.forEach(r,(i=>this.referenceDelegate.markPotentiallyOrphaned(e,i))))))}jr(e){delete this.$r[e]}performConsistencyCheck(e){return this.checkEmpty(e).next((t=>{if(!t)return R.resolve();const r=IDBKeyRange.lowerBound((function(o){return[o]})(this.userId)),i=[];return Ei(e).jn({range:r},((s,o,c)=>{if(s[0]===this.userId){const u=jt(s[1]);i.push(u)}else c.done()})).next((()=>{L(i.length===0,56720,{Hr:i.map((s=>s.canonicalString()))})}))}))}containsKey(e,t){return _y(e,this.userId,t)}Jr(e){return yy(e).get(this.userId).next((t=>t||{userId:this.userId,lastAcknowledgedBatchId:zn,lastStreamToken:""}))}}function _y(n,e,t){const r=Ba(e,t.path),i=r[1],s=IDBKeyRange.lowerBound(r);let o=!1;return Ei(n).jn({range:s,zn:!0},((c,u,l)=>{const[d,p,m]=c;d===e&&p===i&&(o=!0),l.done()})).next((()=>o))}function kn(n){return Be(n,Vt)}function Ei(n){return Be(n,$i)}function yy(n){return Be(n,Vo)}/**
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
 */class NP{getBundleMetadata(e,t){return Lp(e).get(t).next((r=>{if(r)return(function(s){return{id:s.bundleId,createTime:Kr(s.createTime),version:s.version}})(r)}))}saveBundleMetadata(e,t){return Lp(e).put((function(i){return{bundleId:i.id,createTime:Wr(Ve(i.createTime)),version:i.version}})(t))}getNamedQuery(e,t){return Mp(e).get(t).next((r=>{if(r)return(function(s){return{name:s.name,query:Gc(s.bundledQuery),readTime:Kr(s.readTime)}})(r)}))}saveNamedQuery(e,t){return Mp(e).put((function(i){return{name:i.name,readTime:Wr(Ve(i.readTime)),bundledQuery:i.bundledQuery}})(t))}}function Lp(n){return Be(n,$c)}function Mp(n){return Be(n,jc)}/**
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
 */class Kc{constructor(e,t){this.serializer=e,this.userId=t}static Kr(e,t){const r=t.uid||"";return new Kc(e,r)}getOverlay(e,t){return di(e).get(xp(this.userId,t)).next((r=>r?Ra(this.serializer,r):null))}getOverlays(e,t){const r=Rt();return R.forEach(t,(i=>this.getOverlay(e,i).next((s=>{s!==null&&r.set(i,s)})))).next((()=>r))}getAllOverlays(e,t){const r=Rt();return di(e).jn(((i,s)=>{const o=Ra(this.serializer,s);o.largestBatchId>t&&r.set(o.getKey(),o)})).next((()=>r))}saveOverlays(e,t,r){const i=[];return r.forEach(((s,o)=>{const c=new Fh(t,o);i.push(this.Yr(e,c))})),R.waitFor(i)}removeOverlaysForBatchId(e,t,r){const i=new Set;t.forEach((o=>i.add(et(o.getCollectionPath()))));const s=[];return i.forEach((o=>{const c=IDBKeyRange.bound([this.userId,o,r],[this.userId,o,r+1],!1,!0);s.push(di(e).Gn(Tl,c))})),R.waitFor(s)}getOverlaysForCollection(e,t,r){const i=Rt(),s=et(t),o=IDBKeyRange.bound([this.userId,s,r],[this.userId,s,Number.POSITIVE_INFINITY],!0);return di(e).Kn(Tl,o).next((c=>{for(const u of c){const l=Ra(this.serializer,u);i.set(l.getKey(),l)}return i}))}getOverlaysForCollectionGroup(e,t,r,i){const s=Rt();let o;const c=IDBKeyRange.bound([this.userId,t,r],[this.userId,t,Number.POSITIVE_INFINITY],!0);return di(e).jn({index:uy,range:c},((u,l,d)=>{const p=Ra(this.serializer,l);s.size()<i||p.largestBatchId===o?(s.set(p.getKey(),p),o=p.largestBatchId):d.done()})).next((()=>s))}Yr(e,t){return di(e).put((function(i,s,o){const[c,u,l]=xp(s,o.mutation.key);return{userId:s,collectionPath:u,documentId:l,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:To(i.qr,o.mutation)}})(this.serializer,this.userId,t))}}function di(n){return Be(n,zc)}/**
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
 */class DP{Zr(e){return Be(e,Lh)}getSessionToken(e){return this.Zr(e).get("sessionToken").next((t=>{const r=t==null?void 0:t.value;return r?pe.fromUint8Array(r):pe.EMPTY_BYTE_STRING}))}setSessionToken(e,t){return this.Zr(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
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
 */class Cr{constructor(){}Xr(e,t){this.ei(e,t),t.ti()}ei(e,t){if("nullValue"in e)this.ni(t,5);else if("booleanValue"in e)this.ni(t,10),t.ri(e.booleanValue?1:0);else if("integerValue"in e)this.ni(t,15),t.ri(fe(e.integerValue));else if("doubleValue"in e){const r=fe(e.doubleValue);isNaN(r)?this.ni(t,13):(this.ni(t,15),Ni(r)?t.ri(0):t.ri(r))}else if("timestampValue"in e){let r=e.timestampValue;this.ni(t,20),typeof r=="string"&&(r=mn(r)),t.ii(`${r.seconds||""}`),t.ri(r.nanos||0)}else if("stringValue"in e)this.si(e.stringValue,t),this._i(t);else if("bytesValue"in e)this.ni(t,30),t.oi(gn(e.bytesValue)),this._i(t);else if("referenceValue"in e)this.ai(e.referenceValue,t);else if("geoPointValue"in e){const r=e.geoPointValue;this.ni(t,45),t.ri(r.latitude||0),t.ri(r.longitude||0)}else"mapValue"in e?Vg(e)?this.ni(t,Number.MAX_SAFE_INTEGER):$r(e)?this.ui(e.mapValue,t):(this.ci(e.mapValue,t),this._i(t)):"arrayValue"in e?(this.li(e.arrayValue,t),this._i(t)):j(19022,{Ei:e})}si(e,t){this.ni(t,25),this.hi(e,t)}hi(e,t){t.ii(e)}ci(e,t){const r=e.fields||{};this.ni(t,55);for(const i of Object.keys(r))this.si(i,t),this.ei(r[i],t)}ui(e,t){var o,c;const r=e.fields||{};this.ni(t,53);const i=Br,s=((c=(o=r[i].arrayValue)==null?void 0:o.values)==null?void 0:c.length)||0;this.ni(t,15),t.ri(fe(s)),this.si(i,t),this.ei(r[i],t)}li(e,t){const r=e.values||[];this.ni(t,50);for(const i of r)this.ei(i,t)}ai(e,t){this.ni(t,37),F.fromName(e).path.forEach((r=>{this.ni(t,60),this.hi(r,t)}))}ni(e,t){e.ri(t)}_i(e){e.ri(2)}}Cr.Ti=new Cr;/**
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
 */const fi=255;function kP(n){if(n===0)return 8;let e=0;return n>>4||(e+=4,n<<=4),n>>6||(e+=2,n<<=2),n>>7||(e+=1),e}function Fp(n){const e=64-(function(r){let i=0;for(let s=0;s<8;++s){const o=kP(255&r[s]);if(i+=o,o!==8)break}return i})(n);return Math.ceil(e/8)}class xP{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Pi(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.Ri(r.value),r=t.next();this.Ii()}Ai(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.Vi(r.value),r=t.next();this.di()}fi(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.Ri(r);else if(r<2048)this.Ri(960|r>>>6),this.Ri(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Ri(480|r>>>12),this.Ri(128|63&r>>>6),this.Ri(128|63&r);else{const i=t.codePointAt(0);this.Ri(240|i>>>18),this.Ri(128|63&i>>>12),this.Ri(128|63&i>>>6),this.Ri(128|63&i)}}this.Ii()}mi(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.Vi(r);else if(r<2048)this.Vi(960|r>>>6),this.Vi(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Vi(480|r>>>12),this.Vi(128|63&r>>>6),this.Vi(128|63&r);else{const i=t.codePointAt(0);this.Vi(240|i>>>18),this.Vi(128|63&i>>>12),this.Vi(128|63&i>>>6),this.Vi(128|63&i)}}this.di()}pi(e){const t=this.gi(e),r=Fp(t);this.yi(1+r),this.buffer[this.position++]=255&r;for(let i=t.length-r;i<t.length;++i)this.buffer[this.position++]=255&t[i]}wi(e){const t=this.gi(e),r=Fp(t);this.yi(1+r),this.buffer[this.position++]=~(255&r);for(let i=t.length-r;i<t.length;++i)this.buffer[this.position++]=~(255&t[i])}bi(){this.Si(fi),this.Si(255)}Di(){this.xi(fi),this.xi(255)}reset(){this.position=0}seed(e){this.yi(e.length),this.buffer.set(e,this.position),this.position+=e.length}Ci(){return this.buffer.slice(0,this.position)}gi(e){const t=(function(s){const o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,s,!1),new Uint8Array(o.buffer)})(e),r=!!(128&t[0]);t[0]^=r?255:128;for(let i=1;i<t.length;++i)t[i]^=r?255:0;return t}Ri(e){const t=255&e;t===0?(this.Si(0),this.Si(255)):t===fi?(this.Si(fi),this.Si(0)):this.Si(t)}Vi(e){const t=255&e;t===0?(this.xi(0),this.xi(255)):t===fi?(this.xi(fi),this.xi(0)):this.xi(e)}Ii(){this.Si(0),this.Si(1)}di(){this.xi(0),this.xi(1)}Si(e){this.yi(1),this.buffer[this.position++]=e}xi(e){this.yi(1),this.buffer[this.position++]=~e}yi(e){const t=e+this.position;if(t<=this.buffer.length)return;let r=2*this.buffer.length;r<t&&(r=t);const i=new Uint8Array(r);i.set(this.buffer),this.buffer=i}}class OP{constructor(e){this.Fi=e}oi(e){this.Fi.Pi(e)}ii(e){this.Fi.fi(e)}ri(e){this.Fi.pi(e)}ti(){this.Fi.bi()}}class LP{constructor(e){this.Fi=e}oi(e){this.Fi.Ai(e)}ii(e){this.Fi.mi(e)}ri(e){this.Fi.wi(e)}ti(){this.Fi.Di()}}class Us{constructor(){this.Fi=new xP,this.ascending=new OP(this.Fi),this.descending=new LP(this.Fi)}seed(e){this.Fi.seed(e)}Oi(e){return e===0?this.ascending:this.descending}Ci(){return this.Fi.Ci()}reset(){this.Fi.reset()}}/**
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
 */class Nr{constructor(e,t,r,i){this.Mi=e,this.Ni=t,this.Li=r,this.Bi=i}Ui(){const e=this.Bi.length,t=e===0||this.Bi[e-1]===255?e+1:e,r=new Uint8Array(t);return r.set(this.Bi,0),t!==e?r.set([0],this.Bi.length):++r[r.length-1],new Nr(this.Mi,this.Ni,this.Li,r)}ki(e,t,r){return{indexId:this.Mi,uid:e,arrayValue:$a(this.Li),directionalValue:$a(this.Bi),orderedDocumentKey:$a(t),documentKey:r.path.toArray()}}qi(e,t,r){const i=this.ki(e,t,r);return[i.indexId,i.uid,i.arrayValue,i.directionalValue,i.orderedDocumentKey,i.documentKey]}}function xn(n,e){let t=n.Mi-e.Mi;return t!==0?t:(t=Up(n.Li,e.Li),t!==0?t:(t=Up(n.Bi,e.Bi),t!==0?t:F.comparator(n.Ni,e.Ni)))}function Up(n,e){for(let t=0;t<n.length&&t<e.length;++t){const r=n[t]-e[t];if(r!==0)return r}return n.length-e.length}function $a(n){return eg()?(function(t){let r="";for(let i=0;i<t.length;i++)r+=String.fromCharCode(t[i]);return r})(n):n}function Bp(n){return typeof n!="string"?n:(function(t){const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r})(n)}class qp{constructor(e){this.$i=new ce(((t,r)=>Se.comparator(t.field,r.field))),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.Ki=e.orderBy,this.Wi=[];for(const t of e.filters){const r=t;r.isInequality()?this.$i=this.$i.add(r):this.Wi.push(r)}}get Qi(){return this.$i.size>1}Gi(e){if(L(e.collectionGroup===this.collectionId,49279),this.Qi)return!1;const t=hl(e);if(t!==void 0&&!this.zi(t))return!1;const r=Rr(e);let i=new Set,s=0,o=0;for(;s<r.length&&this.zi(r[s]);++s)i=i.add(r[s].fieldPath.canonicalString());if(s===r.length)return!0;if(this.$i.size>0){const c=this.$i.getIterator().getNext();if(!i.has(c.field.canonicalString())){const u=r[s];if(!this.ji(c,u)||!this.Hi(this.Ki[o++],u))return!1}++s}for(;s<r.length;++s){const c=r[s];if(o>=this.Ki.length||!this.Hi(this.Ki[o++],c))return!1}return!0}Ji(){if(this.Qi)return null;let e=new ce(Se.comparator);const t=[];for(const r of this.Wi)if(!r.field.isKeyField())if(r.op==="array-contains"||r.op==="array-contains-any")t.push(new Lr(r.field,2));else{if(e.has(r.field))continue;e=e.add(r.field),t.push(new Lr(r.field,0))}for(const r of this.Ki)r.field.isKeyField()||e.has(r.field)||(e=e.add(r.field),t.push(new Lr(r.field,r.dir==="asc"?0:1)));return new Fi(Fi.UNKNOWN_ID,this.collectionId,t,Ui.empty())}zi(e){for(const t of this.Wi)if(this.ji(t,e))return!0;return!1}ji(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const r=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===r}Hi(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
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
 */function Iy(n){var t,r;if(L(n instanceof ie||n instanceof ue,20012),n instanceof ie){if(n instanceof Gg){const i=((r=(t=n.value.arrayValue)==null?void 0:t.values)==null?void 0:r.map((s=>ie.create(n.field,"==",s))))||[];return ue.create(i,"or")}return n}const e=n.filters.map((i=>Iy(i)));return ue.create(e,n.op)}function MP(n){if(n.getFilters().length===0)return[];const e=bl(Iy(n));return L(Ey(e),7391),Rl(e)||Pl(e)?[e]:e.getFilters()}function Rl(n){return n instanceof ie}function Pl(n){return n instanceof ue&&Zl(n)}function Ey(n){return Rl(n)||Pl(n)||(function(t){if(t instanceof ue&&ul(t)){for(const r of t.getFilters())if(!Rl(r)&&!Pl(r))return!1;return!0}return!1})(n)}function bl(n){if(L(n instanceof ie||n instanceof ue,34018),n instanceof ie)return n;if(n.filters.length===1)return bl(n.filters[0]);const e=n.filters.map((r=>bl(r)));let t=ue.create(e,n.op);return t=uc(t),Ey(t)?t:(L(t instanceof ue,64498),L(Li(t),40251),L(t.filters.length>1,57927),t.filters.reduce(((r,i)=>Uh(r,i))))}function Uh(n,e){let t;return L(n instanceof ie||n instanceof ue,38388),L(e instanceof ie||e instanceof ue,25473),t=n instanceof ie?e instanceof ie?(function(i,s){return ue.create([i,s],"and")})(n,e):$p(n,e):e instanceof ie?$p(e,n):(function(i,s){if(L(i.filters.length>0&&s.filters.length>0,48005),Li(i)&&Li(s))return $g(i,s.getFilters());const o=ul(i)?i:s,c=ul(i)?s:i,u=o.filters.map((l=>Uh(l,c)));return ue.create(u,"or")})(n,e),uc(t)}function $p(n,e){if(Li(e))return $g(e,n.getFilters());{const t=e.filters.map((r=>Uh(n,r)));return ue.create(t,"or")}}function uc(n){if(L(n instanceof ie||n instanceof ue,11850),n instanceof ie)return n;const e=n.getFilters();if(e.length===1)return uc(e[0]);if(Bg(n))return n;const t=e.map((i=>uc(i))),r=[];return t.forEach((i=>{i instanceof ie?r.push(i):i instanceof ue&&(i.op===n.op?r.push(...i.filters):r.push(i))})),r.length===1?r[0]:ue.create(r,n.op)}/**
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
 */class FP{constructor(){this.Yi=new Bh}addToCollectionParentIndex(e,t){return this.Yi.add(t),R.resolve()}getCollectionParents(e,t){return R.resolve(this.Yi.getEntries(t))}addFieldIndex(e,t){return R.resolve()}deleteFieldIndex(e,t){return R.resolve()}deleteAllFieldIndexes(e){return R.resolve()}createTargetIndexes(e,t){return R.resolve()}getDocumentsMatchingTarget(e,t){return R.resolve(null)}getIndexType(e,t){return R.resolve(0)}getFieldIndexes(e,t){return R.resolve([])}getNextCollectionGroupToUpdate(e){return R.resolve(null)}getMinOffset(e,t){return R.resolve(vt.min())}getMinOffsetFromCollectionGroup(e,t){return R.resolve(vt.min())}updateCollectionGroup(e,t,r){return R.resolve()}updateIndexEntries(e,t){return R.resolve()}}class Bh{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t]||new ce(X.comparator),s=!i.has(r);return this.index[t]=i.add(r),s}has(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t];return i&&i.has(r)}getEntries(e){return(this.index[e]||new ce(X.comparator)).toArray()}}/**
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
 */const jp="IndexedDbIndexManager",Pa=new Uint8Array(0);class UP{constructor(e,t){this.databaseId=t,this.Zi=new Bh,this.Xi=new vn((r=>Xa(r)),((r,i)=>th(r,i))),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.Zi.has(t)){const r=t.lastSegment(),i=t.popLast();e.addOnCommittedListener((()=>{this.Zi.add(t)}));const s={collectionId:r,parent:et(i)};return zp(e).put(s)}return R.resolve()}getCollectionParents(e,t){const r=[],i=IDBKeyRange.bound([t,""],[yg(t),""],!1,!0);return zp(e).Kn(i).next((s=>{for(const o of s){if(o.collectionId!==t)break;r.push(jt(o.parent))}return r}))}addFieldIndex(e,t){const r=Bs(e),i=(function(c){return{indexId:c.indexId,collectionGroup:c.collectionGroup,fields:c.fields.map((u=>[u.fieldPath.canonicalString(),u.kind]))}})(t);delete i.indexId;const s=r.add(i);if(t.indexState){const o=mi(e);return s.next((c=>{o.put(Op(c,this.uid,t.indexState.sequenceNumber,t.indexState.offset))}))}return s.next()}deleteFieldIndex(e,t){const r=Bs(e),i=mi(e),s=pi(e);return r.delete(t.indexId).next((()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))).next((()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))))}deleteAllFieldIndexes(e){const t=Bs(e),r=pi(e),i=mi(e);return t.Gn().next((()=>r.Gn())).next((()=>i.Gn()))}createTargetIndexes(e,t){return R.forEach(this.es(t),(r=>this.getIndexType(e,r).next((i=>{if(i===0||i===1){const s=new qp(r).Ji();if(s!=null)return this.addFieldIndex(e,s)}}))))}getDocumentsMatchingTarget(e,t){const r=pi(e);let i=!0;const s=new Map;return R.forEach(this.es(t),(o=>this.ts(e,o).next((c=>{i&&(i=!!c),s.set(o,c)})))).next((()=>{if(i){let o=J();const c=[];return R.forEach(s,((u,l)=>{O(jp,`Using index ${(function(z){return`id=${z.indexId}|cg=${z.collectionGroup}|f=${z.fields.map((Y=>`${Y.fieldPath}:${Y.kind}`)).join(",")}`})(u)} to execute ${Xa(t)}`);const d=(function(z,Y){const ee=hl(Y);if(ee===void 0)return null;for(const re of Za(z,ee.fieldPath))switch(re.op){case"array-contains-any":return re.value.arrayValue.values||[];case"array-contains":return[re.value]}return null})(l,u),p=(function(z,Y){const ee=new Map;for(const re of Rr(Y))for(const w of Za(z,re.fieldPath))switch(w.op){case"==":case"in":ee.set(re.fieldPath.canonicalString(),w.value);break;case"not-in":case"!=":return ee.set(re.fieldPath.canonicalString(),w.value),Array.from(ee.values())}return null})(l,u),m=(function(z,Y){const ee=[];let re=!0;for(const w of Rr(Y)){const _=w.kind===0?lp(z,w.fieldPath,z.startAt):hp(z,w.fieldPath,z.startAt);ee.push(_.value),re&&(re=_.inclusive)}return new nr(ee,re)})(l,u),I=(function(z,Y){const ee=[];let re=!0;for(const w of Rr(Y)){const _=w.kind===0?hp(z,w.fieldPath,z.endAt):lp(z,w.fieldPath,z.endAt);ee.push(_.value),re&&(re=_.inclusive)}return new nr(ee,re)})(l,u),P=this.ns(u,l,m),x=this.ns(u,l,I),D=this.rs(u,l,p),$=this.ss(u.indexId,d,P,m.inclusive,x,I.inclusive,D);return R.forEach($,(G=>r.Qn(G,t.limit).next((z=>{z.forEach((Y=>{const ee=F.fromSegments(Y.documentKey);o.has(ee)||(o=o.add(ee),c.push(ee))}))}))))})).next((()=>c))}return R.resolve(null)}))}es(e){let t=this.Xi.get(e);return t||(e.filters.length===0?t=[e]:t=MP(ue.create(e.filters,"and")).map((r=>dl(e.path,e.collectionGroup,e.orderBy,r.getFilters(),e.limit,e.startAt,e.endAt))),this.Xi.set(e,t),t)}ss(e,t,r,i,s,o,c){const u=(t!=null?t.length:1)*Math.max(r.length,s.length),l=u/(t!=null?t.length:1),d=[];for(let p=0;p<u;++p){const m=t?this._s(t[p/l]):Pa,I=this.us(e,m,r[p%l],i),P=this.cs(e,m,s[p%l],o),x=c.map((D=>this.us(e,m,D,!0)));d.push(...this.createRange(I,P,x))}return d}us(e,t,r,i){const s=new Nr(e,F.empty(),t,r);return i?s:s.Ui()}cs(e,t,r,i){const s=new Nr(e,F.empty(),t,r);return i?s.Ui():s}ts(e,t){const r=new qp(t),i=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,i).next((s=>{let o=null;for(const c of s)r.Gi(c)&&(!o||c.fields.length>o.fields.length)&&(o=c);return o}))}getIndexType(e,t){let r=2;const i=this.es(t);return R.forEach(i,(s=>this.ts(e,s).next((o=>{o?r!==0&&o.fields.length<(function(u){let l=new ce(Se.comparator),d=!1;for(const p of u.filters)for(const m of p.getFlattenedFilters())m.field.isKeyField()||(m.op==="array-contains"||m.op==="array-contains-any"?d=!0:l=l.add(m.field));for(const p of u.orderBy)p.field.isKeyField()||(l=l.add(p.field));return l.size+(d?1:0)})(s)&&(r=1):r=0})))).next((()=>(function(o){return o.limit!==null})(t)&&i.length>1&&r===2?1:r))}ls(e,t){const r=new Us;for(const i of Rr(e)){const s=t.data.field(i.fieldPath);if(s==null)return null;const o=r.Oi(i.kind);Cr.Ti.Xr(s,o)}return r.Ci()}_s(e){const t=new Us;return Cr.Ti.Xr(e,t.Oi(0)),t.Ci()}Es(e,t){const r=new Us;return Cr.Ti.Xr(qr(this.databaseId,t),r.Oi((function(s){const o=Rr(s);return o.length===0?0:o[o.length-1].kind})(e))),r.Ci()}rs(e,t,r){if(r===null)return[];let i=[];i.push(new Us);let s=0;for(const o of Rr(e)){const c=r[s++];for(const u of i)if(this.hs(t,o.fieldPath)&&tr(c))i=this.Ts(i,o,c);else{const l=u.Oi(o.kind);Cr.Ti.Xr(c,l)}}return this.Ps(i)}ns(e,t,r){return this.rs(e,t,r.position)}Ps(e){const t=[];for(let r=0;r<e.length;++r)t[r]=e[r].Ci();return t}Ts(e,t,r){const i=[...e],s=[];for(const o of r.arrayValue.values||[])for(const c of i){const u=new Us;u.seed(c.Ci()),Cr.Ti.Xr(o,u.Oi(t.kind)),s.push(u)}return s}hs(e,t){return!!e.filters.find((r=>r instanceof ie&&r.field.isEqual(t)&&(r.op==="in"||r.op==="not-in")))}getFieldIndexes(e,t){const r=Bs(e),i=mi(e);return(t?r.Kn(wl,IDBKeyRange.bound(t,t)):r.Kn()).next((s=>{const o=[];return R.forEach(s,(c=>i.get([c.indexId,this.uid]).next((u=>{o.push((function(d,p){const m=p?new Ui(p.sequenceNumber,new vt(Kr(p.readTime),new F(jt(p.documentKey)),p.largestBatchId)):Ui.empty(),I=d.fields.map((([P,x])=>new Lr(Se.fromServerFormat(P),x)));return new Fi(d.indexId,d.collectionGroup,I,m)})(c,u))})))).next((()=>o))}))}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next((t=>t.length===0?null:(t.sort(((r,i)=>{const s=r.indexState.sequenceNumber-i.indexState.sequenceNumber;return s!==0?s:Q(r.collectionGroup,i.collectionGroup)})),t[0].collectionGroup)))}updateCollectionGroup(e,t,r){const i=Bs(e),s=mi(e);return this.Rs(e).next((o=>i.Kn(wl,IDBKeyRange.bound(t,t)).next((c=>R.forEach(c,(u=>s.put(Op(u.indexId,this.uid,o,r))))))))}updateIndexEntries(e,t){const r=new Map;return R.forEach(t,((i,s)=>{const o=r.get(i.collectionGroup);return(o?R.resolve(o):this.getFieldIndexes(e,i.collectionGroup)).next((c=>(r.set(i.collectionGroup,c),R.forEach(c,(u=>this.Is(e,i,u).next((l=>{const d=this.As(s,u);return l.isEqual(d)?R.resolve():this.Vs(e,s,u,l,d)})))))))}))}ds(e,t,r,i){return pi(e).put(i.ki(this.uid,this.Es(r,t.key),t.key))}fs(e,t,r,i){return pi(e).delete(i.qi(this.uid,this.Es(r,t.key),t.key))}Is(e,t,r){const i=pi(e);let s=new ce(xn);return i.jn({index:cy,range:IDBKeyRange.only([r.indexId,this.uid,$a(this.Es(r,t))])},((o,c)=>{s=s.add(new Nr(r.indexId,t,Bp(c.arrayValue),Bp(c.directionalValue)))})).next((()=>s))}As(e,t){let r=new ce(xn);const i=this.ls(t,e);if(i==null)return r;const s=hl(t);if(s!=null){const o=e.data.field(s.fieldPath);if(tr(o))for(const c of o.arrayValue.values||[])r=r.add(new Nr(t.indexId,e.key,this._s(c),i))}else r=r.add(new Nr(t.indexId,e.key,Pa,i));return r}Vs(e,t,r,i,s){O(jp,"Updating index entries for document '%s'",t.key);const o=[];return(function(u,l,d,p,m){const I=u.getIterator(),P=l.getIterator();let x=li(I),D=li(P);for(;x||D;){let $=!1,G=!1;if(x&&D){const z=d(x,D);z<0?G=!0:z>0&&($=!0)}else x!=null?G=!0:$=!0;$?(p(D),D=li(P)):G?(m(x),x=li(I)):(x=li(I),D=li(P))}})(i,s,xn,(c=>{o.push(this.ds(e,t,r,c))}),(c=>{o.push(this.fs(e,t,r,c))})),R.waitFor(o)}Rs(e){let t=1;return mi(e).jn({index:ay,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},((r,i,s)=>{s.done(),t=i.sequenceNumber+1})).next((()=>t))}createRange(e,t,r){r=r.sort(((o,c)=>xn(o,c))).filter(((o,c,u)=>!c||xn(o,u[c-1])!==0));const i=[];i.push(e);for(const o of r){const c=xn(o,e),u=xn(o,t);if(c===0)i[0]=e.Ui();else if(c>0&&u<0)i.push(o),i.push(o.Ui());else if(u>0)break}i.push(t);const s=[];for(let o=0;o<i.length;o+=2){if(this.ps(i[o],i[o+1]))return[];const c=i[o].qi(this.uid,Pa,F.empty()),u=i[o+1].qi(this.uid,Pa,F.empty());s.push(IDBKeyRange.bound(c,u))}return s}ps(e,t){return xn(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(Gp)}getMinOffset(e,t){return R.mapArray(this.es(t),(r=>this.ts(e,r).next((i=>i||j(44426))))).next(Gp)}}function zp(n){return Be(n,No)}function pi(n){return Be(n,ao)}function Bs(n){return Be(n,Oh)}function mi(n){return Be(n,oo)}function Gp(n){L(n.length!==0,28825);let e=n[0].indexState.offset,t=e.largestBatchId;for(let r=1;r<n.length;r++){const i=n[r].indexState.offset;eh(i,e)<0&&(e=i),t<i.largestBatchId&&(t=i.largestBatchId)}return new vt(e.readTime,e.documentKey,t)}/**
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
 */class yn{constructor(e){this.gs=e}next(){return this.gs+=2,this.gs}static ys(){return new yn(0)}static ws(){return new yn(-1)}}/**
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
 */class BP{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.bs(e).next((t=>{const r=new yn(t.highestTargetId);return t.highestTargetId=r.next(),this.vs(e,t).next((()=>t.highestTargetId))}))}getLastRemoteSnapshotVersion(e){return this.bs(e).next((t=>K.fromTimestamp(new oe(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds))))}getHighestSequenceNumber(e){return this.bs(e).next((t=>t.highestListenSequenceNumber))}setTargetsMetadata(e,t,r){return this.bs(e).next((i=>(i.highestListenSequenceNumber=t,r&&(i.lastRemoteSnapshotVersion=r.toTimestamp()),t>i.highestListenSequenceNumber&&(i.highestListenSequenceNumber=t),this.vs(e,i))))}addTargetData(e,t){return this.Ss(e,t).next((()=>this.bs(e).next((r=>(r.targetCount+=1,this.Ds(t,r),this.vs(e,r))))))}updateTargetData(e,t){return this.Ss(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next((()=>gi(e).delete(t.targetId))).next((()=>this.bs(e))).next((r=>(L(r.targetCount>0,8065),r.targetCount-=1,this.vs(e,r))))}removeTargets(e,t,r){let i=0;const s=[];return gi(e).jn(((o,c)=>{const u=Js(this.serializer,c);u.sequenceNumber<=t&&r.get(u.targetId)===null&&(i++,s.push(this.removeTargetData(e,u)))})).next((()=>R.waitFor(s))).next((()=>i))}forEachTarget(e,t){return gi(e).jn(((r,i)=>{const s=Js(this.serializer,i);t(s)}))}bs(e){return Wp(e).get(oc).next((t=>(L(t!==null,2888),t)))}vs(e,t){return Wp(e).put(oc,t)}Ss(e,t){return gi(e).put(gy(this.serializer,t))}Ds(e,t){let r=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,r=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,r=!0),r}getTargetCount(e){return this.bs(e).next((t=>t.targetCount))}getTargetData(e,t){const r=qc(t),i=IDBKeyRange.bound([r,Number.NEGATIVE_INFINITY],[r,Number.POSITIVE_INFINITY]);let s=null;return gi(e).jn({range:i,index:oy},((o,c,u)=>{const l=Js(this.serializer,c);Nh(t,l.target)&&(s=l,u.done())})).next((()=>s))}addMatchingKeys(e,t,r){const i=[],s=Un(e);return t.forEach((o=>{const c=et(o.path);i.push(s.put({targetId:r,path:c})),i.push(this.referenceDelegate.addReference(e,r,o))})),R.waitFor(i)}removeMatchingKeys(e,t,r){const i=Un(e);return R.forEach(t,(s=>{const o=et(s.path);return R.waitFor([i.delete([r,o]),this.referenceDelegate.removeReference(e,r,s)])}))}removeMatchingKeysForTargetId(e,t){const r=Un(e),i=IDBKeyRange.bound([t],[t+1],!1,!0);return r.delete(i)}getMatchingKeysForTargetId(e,t){const r=IDBKeyRange.bound([t],[t+1],!1,!0),i=Un(e);let s=J();return i.jn({range:r,zn:!0},((o,c,u)=>{const l=jt(o[1]),d=new F(l);s=s.add(d)})).next((()=>s))}containsKey(e,t){const r=et(t.path),i=IDBKeyRange.bound([r],[yg(r)],!1,!0);let s=0;return Un(e).jn({index:xh,zn:!0,range:i},(([o,c],u,l)=>{o!==0&&(s++,l.done())})).next((()=>s>0))}ge(e,t){return gi(e).get(t).next((r=>r?Js(this.serializer,r):null))}}function gi(n){return Be(n,ji)}function Wp(n){return Be(n,Mr)}function Un(n){return Be(n,zi)}/**
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
 */class qP{constructor(e,t){this.db=e,this.garbageCollector=N_(this,t)}rr(e){const t=this.xs(e);return this.db.getTargetCache().getTargetCount(e).next((r=>t.next((i=>r+i))))}xs(e){let t=0;return this.ir(e,(r=>{t++})).next((()=>t))}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}ir(e,t){return this.Cs(e,((r,i)=>t(i)))}addReference(e,t,r){return ba(e,r)}removeReference(e,t,r){return ba(e,r)}removeTargets(e,t,r){return this.db.getTargetCache().removeTargets(e,t,r)}markPotentiallyOrphaned(e,t){return ba(e,t)}Fs(e,t){return(function(i,s){let o=!1;return yy(i).Hn((c=>_y(i,c,s).next((u=>(u&&(o=!0),R.resolve(!u)))))).next((()=>o))})(e,t)}removeOrphanedDocuments(e,t){const r=this.db.getRemoteDocumentCache().newChangeBuffer(),i=[];let s=0;return this.Cs(e,((o,c)=>{if(c<=t){const u=this.Fs(e,o).next((l=>{if(!l)return s++,r.getEntry(e,o).next((()=>(r.removeEntry(o,K.min()),Un(e).delete((function(p){return[0,et(p.path)]})(o)))))}));i.push(u)}})).next((()=>R.waitFor(i))).next((()=>r.apply(e))).next((()=>s))}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,r)}updateLimboDocument(e,t){return ba(e,t)}Cs(e,t){const r=Un(e);let i,s=dt.yn;return r.jn({index:xh},(([o,c],{path:u,sequenceNumber:l})=>{o===0?(s!==dt.yn&&t(new F(jt(i)),s),s=l,i=u):s=dt.yn})).next((()=>{s!==dt.yn&&t(new F(jt(i)),s)}))}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function ba(n,e){return Un(n).put((function(r,i){return{targetId:0,path:et(r.path),sequenceNumber:i}})(e,n.currentSequenceNumber))}// Copyright 2024 Google LLC* @license
function wy(n,e){var r;let t=e;for(const i of n.stages)t=$P({serializer:n.serializer,serverTimestampBehavior:(r=n.listenOptions)==null?void 0:r.serverTimestampBehavior},i,t);return t}function Hc(n,e){return wy(n,[e]).length>0}function Ty(n,e){return Te(n)?Hc(n,e):Cc(n,e)}function $P(n,e,t){if(e instanceof Go)return(function(i,s,o){return o.filter((c=>c.isFoundDocument()&&`/${c.key.getCollectionPath().canonicalString()}`===s.Er))})(0,e,t);if(e instanceof Ko)return(function(i,s,o){return o.filter((c=>{const u=so(H(s.condition).evaluate(i,c));return u!==void 0&&bt(u,mt)}))})(n,e,t);if(e instanceof Wo)return(function(i,s,o){return o.filter((c=>c.isFoundDocument()&&c.key.getCollectionPath().lastSegment()===s.collectionId))})(0,e,t);if(e instanceof Mc)return(function(i,s,o){return o.filter((c=>c.isFoundDocument()))})(0,0,t);if(e instanceof Fc)return(function(i,s,o){return o.filter((c=>c.isFoundDocument()&&s.Tr.has(c.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof ir)return(function(i,s,o){return o.slice(0,s.limit)})(0,e,t);if(e instanceof $t)return(function(i,s,o){const c=s.orderings.map((u=>({Os:H(u.expr),direction:u.direction})));return[...o].sort(((u,l)=>{for(const{Os:d,direction:p}of c){const m=so(d.evaluate(i,u)),I=so(d.evaluate(i,l)),P=tt(m??Kt,I??Kt);if(P!==0)return p==="ascending"?P:-P}return 0}))})(n,e,t);throw new Error(`Unknown stage: ${e._name}`)}function lc(n){const e=(function(r){for(let i=r.stages.length-1;i>=0;i--){const s=r.stages[i];if(s instanceof $t)return s.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(n);return(t,r)=>{for(const i of e){const s=so(H(i.expr).evaluate({serializer:n.serializer},t)),o=so(H(i.expr).evaluate({serializer:n.serializer},r)),c=tt(s||Kt,o||Kt);if(c!==0)return i.direction==="ascending"?c:-c}return 0}}function qu(n){for(let e=n.stages.length-1;e>=0;e--){const t=n.stages[e];if(t instanceof ir)return{limit:t.limit}}}/**
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
 */class vy{constructor(){this.changes=new vn((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,ge.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?R.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class jP{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,r){return On(e).put(r)}removeEntry(e,t,r){return On(e).delete((function(s,o){const c=s.path.toArray();return[c.slice(0,c.length-2),c[c.length-2],cc(o),c[c.length-1]]})(t,r))}updateMetadata(e,t){return this.getMetadata(e).next((r=>(r.byteSize+=t,this.Ms(e,r))))}getEntry(e,t){let r=ge.newInvalidDocument(t);return On(e).jn({index:qa,range:IDBKeyRange.only(qs(t))},((i,s)=>{r=this.Ns(t,s)})).next((()=>r))}Ls(e,t){let r={size:0,document:ge.newInvalidDocument(t)};return On(e).jn({index:qa,range:IDBKeyRange.only(qs(t))},((i,s)=>{r={document:this.Ns(t,s),size:ac(s)}})).next((()=>r))}getEntries(e,t){let r=De();return this.Bs(e,t,((i,s)=>{const o=this.Ns(i,s);r=r.insert(i,o)})).next((()=>r))}getAllEntries(e){let t=De();return On(e).jn(((r,i)=>{const s=this.Ns(F.fromSegments(i.prefixPath.concat(i.collectionGroup,i.documentId)),i);t=t.insert(s.key,s)})).next((()=>t))}Us(e,t){let r=De(),i=new de(F.comparator);return this.Bs(e,t,((s,o)=>{const c=this.Ns(s,o);r=r.insert(s,c),i=i.insert(s,ac(o))})).next((()=>({documents:r,ks:i})))}Bs(e,t,r){if(t.isEmpty())return R.resolve();let i=new ce(Qp);t.forEach((u=>i=i.add(u)));const s=IDBKeyRange.bound(qs(i.first()),qs(i.last())),o=i.getIterator();let c=o.getNext();return On(e).jn({index:qa,range:s},((u,l,d)=>{const p=F.fromSegments([...l.prefixPath,l.collectionGroup,l.documentId]);for(;c&&Qp(c,p)<0;)r(c,null),c=o.getNext();c&&c.isEqual(p)&&(r(c,l),c=o.hasNext()?o.getNext():null),c?d.$n(qs(c)):d.done()})).next((()=>{for(;c;)r(c,null),c=o.hasNext()?o.getNext():null}))}getDocumentsMatchingQuery(e,t,r,i,s){const o=Te(t)?X.fromString(Qo(t)):t.path,c=[o.popLast().toArray(),o.lastSegment(),cc(r.readTime),r.documentKey.path.isEmpty()?"":r.documentKey.path.lastSegment()],u=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return On(e).Kn(IDBKeyRange.bound(c,u,!0)).next((l=>{s==null||s.incrementDocumentReadCount(l.length);let d=De();for(const p of l){const m=this.Ns(F.fromSegments(p.prefixPath.concat(p.collectionGroup,p.documentId)),p);m.isFoundDocument()&&(Ty(t,m)||i.has(m.key))&&(d=d.insert(m.key,m))}return d}))}getAllFromCollectionGroup(e,t,r,i){let s=De();const o=Hp(t,r),c=Hp(t,vt.max());return On(e).jn({index:sy,range:IDBKeyRange.bound(o,c,!0)},((u,l,d)=>{const p=this.Ns(F.fromSegments(l.prefixPath.concat(l.collectionGroup,l.documentId)),l);s=s.insert(p.key,p),s.size===i&&d.done()})).next((()=>s))}newChangeBuffer(e){return new zP(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next((t=>t.byteSize))}getMetadata(e){return Kp(e).get(El).next((t=>(L(!!t,20021),t)))}Ms(e,t){return Kp(e).put(El,t)}Ns(e,t){if(t){const r=VP(this.serializer,t);if(!(r.isNoDocument()&&r.version.isEqual(K.min())))return r}return ge.newInvalidDocument(e)}}function Ay(n){return new jP(n)}class zP extends vy{constructor(e,t){super(),this.qs=e,this.trackRemovals=t,this.$s=new vn((r=>r.toString()),((r,i)=>r.isEqual(i)))}applyChanges(e){const t=[];let r=0,i=new ce(((s,o)=>Q(s.canonicalString(),o.canonicalString())));return this.changes.forEach(((s,o)=>{const c=this.$s.get(s);if(t.push(this.qs.removeEntry(e,s,c.readTime)),o.isValidDocument()){const u=kp(this.qs.serializer,o);i=i.add(s.path.popLast());const l=ac(u);r+=l-c.size,t.push(this.qs.addEntry(e,s,u))}else if(r-=c.size,this.trackRemovals){const u=kp(this.qs.serializer,o.convertToNoDocument(K.min()));t.push(this.qs.addEntry(e,s,u))}})),i.forEach((s=>{t.push(this.qs.indexManager.addToCollectionParentIndex(e,s))})),t.push(this.qs.updateMetadata(e,r)),R.waitFor(t)}getFromCache(e,t){return this.qs.Ls(e,t).next((r=>(this.$s.set(t,{size:r.size,readTime:r.document.readTime}),r.document)))}getAllFromCache(e,t){return this.qs.Us(e,t).next((({documents:r,ks:i})=>(i.forEach(((s,o)=>{this.$s.set(s,{size:o,readTime:r.get(s).readTime})})),r)))}}function Kp(n){return Be(n,Co)}function On(n){return Be(n,sc)}function qs(n){const e=n.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function Hp(n,e){const t=e.documentKey.path.toArray();return[n,cc(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function Qp(n,e){const t=n.path.toArray(),r=e.path.toArray();let i=0;for(let s=0;s<t.length-2&&s<r.length-2;++s)if(i=Q(t[s],r[s]),i)return i;return i=Q(t.length,r.length),i||(i=Q(t[t.length-2],r[r.length-2]),i||Q(t[t.length-1],r[r.length-1]))}/**
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
 */class GP{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class Ry{constructor(e,t,r,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next((i=>(r=i,this.remoteDocumentCache.getEntry(e,t)))).next((i=>(r!==null&&Zs(r.mutation,i,ht.empty(),oe.now()),i)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.getLocalViewOfDocuments(e,r,J()).next((()=>r))))}getLocalViewOfDocuments(e,t,r=J()){const i=Rt();return this.populateOverlays(e,i,t).next((()=>this.computeViews(e,t,i,r).next((s=>{let o=br();return s.forEach(((c,u)=>{o=o.insert(c,u.overlayedDocument)})),o}))))}getOverlayedDocuments(e,t){const r=Rt();return this.populateOverlays(e,r,t).next((()=>this.computeViews(e,t,r,J())))}populateOverlays(e,t,r){const i=[];return r.forEach((s=>{t.has(s)||i.push(s)})),this.documentOverlayCache.getOverlays(e,i).next((s=>{s.forEach(((o,c)=>{t.set(o,c)}))}))}computeViews(e,t,r,i){let s=De();const o=to(),c=(function(){return to()})();return t.forEach(((u,l)=>{const d=r.get(l.key);i.has(l.key)&&(d===void 0||d.mutation instanceof wn)?s=s.insert(l.key,l):d!==void 0?(o.set(l.key,d.mutation.getFieldMask()),Zs(d.mutation,l,d.mutation.getFieldMask(),oe.now())):o.set(l.key,ht.empty())})),this.recalculateAndSaveOverlays(e,s).next((u=>(u.forEach(((l,d)=>o.set(l,d))),t.forEach(((l,d)=>c.set(l,new GP(d,o.get(l)??null)))),c)))}recalculateAndSaveOverlays(e,t){const r=to();let i=new de(((o,c)=>o-c)),s=J();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((o=>{for(const c of o)c.keys().forEach((u=>{const l=t.get(u);if(l===null)return;let d=r.get(u)||ht.empty();d=c.applyToLocalView(l,d),r.set(u,d);const p=(i.get(c.batchId)||J()).add(u);i=i.insert(c.batchId,p)}))})).next((()=>{const o=[],c=i.getReverseIterator();for(;c.hasNext();){const u=c.getNext(),l=u.key,d=u.value,p=n_();d.forEach((m=>{if(!s.has(m)){const I=Lg(t.get(m),r.get(m));I!==null&&p.set(m,I),s=s.add(m)}})),o.push(this.documentOverlayCache.saveOverlays(e,l,p))}return R.waitFor(o)})).next((()=>r))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.recalculateAndSaveOverlays(e,r)))}getDocumentsMatchingQuery(e,t,r,i){return Te(t)?this.getDocumentsMatchingPipeline(e,t,r,i):Rv(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):rh(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,i):this.getDocumentsMatchingCollectionQuery(e,t,r,i)}getNextDocuments(e,t,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,i).next((s=>{const o=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,i-s.size):R.resolve(Rt());let c=Mi,u=s;return o.next((l=>R.forEach(l,((d,p)=>(c<p.largestBatchId&&(c=p.largestBatchId),s.get(d)?R.resolve():this.remoteDocumentCache.getEntry(e,d).next((m=>{u=u.insert(d,m)}))))).next((()=>this.populateOverlays(e,l,s))).next((()=>this.computeViews(e,u,l,J()))).next((d=>({batchId:c,changes:t_(d)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new F(t)).next((r=>{let i=br();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i}))}getDocumentsMatchingCollectionGroupQuery(e,t,r,i){const s=t.collectionGroup;let o=br();return this.indexManager.getCollectionParents(e,s).next((c=>R.forEach(c,(u=>{const l=(function(p,m){return new Tn(m,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)})(t,u.child(s));return this.getDocumentsMatchingCollectionQuery(e,l,r,i).next((d=>{d.forEach(((p,m)=>{o=o.insert(p,m)}))}))})).next((()=>o))))}getDocumentsMatchingCollectionQuery(e,t,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next((o=>(s=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,i)))).next((o=>this.retrieveMatchingLocalDocuments(s,o,(c=>Cc(t,c)))))}getDocumentsMatchingPipeline(e,t,r,i){if(hn(t)==="collection_group"){const s=Ch(t);let o=br();return this.indexManager.getCollectionParents(e,s).next((c=>R.forEach(c,(u=>{const l=(function(p,m){const I=p.stages.map((P=>P instanceof Wo?new Go(m.canonicalString(),{}):P));return new Xe(p.serializer,I)})(t,u.child(s));return this.getDocumentsMatchingPipeline(e,l,r,i).next((d=>{d.forEach(((p,m)=>{o=o.insert(p,m)}))}))})).next((()=>o))))}{let s;return this.getOverlaysForPipeline(e,t,r.largestBatchId).next((o=>{switch(s=o,hn(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,i);case"documents":let c=J();for(const u of rc(t))c=c.add(F.fromPath(u));return this.remoteDocumentCache.getEntries(e,c);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new k("invalid-argument",`Invalid pipeline source to execute offline: ${dn(t)}`)}})).next((o=>this.retrieveMatchingLocalDocuments(s,o,(c=>Hc(t,c)))))}}retrieveMatchingLocalDocuments(e,t,r){e.forEach(((s,o)=>{const c=o.getKey();t.get(c)===null&&(t=t.insert(c,ge.newInvalidDocument(c)))}));let i=br();return t.forEach(((s,o)=>{const c=e.get(s);c!==void 0&&Zs(c.mutation,o,ht.empty(),oe.now()),r(o)&&(i=i.insert(s,o))})),i}getOverlaysForPipeline(e,t,r){switch(hn(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,X.fromString(Qo(t)),r);case"collection_group":throw new k("invalid-argument",`Unexpected collection group pipeline: ${dn(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,rc(t).map((i=>F.fromPath(i))));case"database":return this.documentOverlayCache.getAllOverlays(e,r);default:throw new k("invalid-argument",`Failed to get overlays for pipeline: ${dn(t)}`)}}}/**
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
 */class WP{constructor(e){this.serializer=e,this.Ks=new Map,this.Ws=new Map}getBundleMetadata(e,t){return R.resolve(this.Ks.get(t))}saveBundleMetadata(e,t){return this.Ks.set(t.id,(function(i){return{id:i.id,version:i.version,createTime:Ve(i.createTime)}})(t)),R.resolve()}getNamedQuery(e,t){return R.resolve(this.Ws.get(t))}saveNamedQuery(e,t){return this.Ws.set(t.name,(function(i){return{name:i.name,query:Gc(i.bundledQuery),readTime:Ve(i.readTime)}})(t)),R.resolve()}}/**
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
 */class KP{constructor(){this.overlays=new de(F.comparator),this.Qs=new Map}getOverlay(e,t){return R.resolve(this.overlays.get(t))}getOverlays(e,t){const r=Rt();return R.forEach(t,(i=>this.getOverlay(e,i).next((s=>{s!==null&&r.set(i,s)})))).next((()=>r))}getAllOverlays(e,t){const r=Rt();return this.overlays.forEach(((i,s)=>{s.largestBatchId>t&&r.set(i,s)})),R.resolve(r)}saveOverlays(e,t,r){return r.forEach(((i,s)=>{this.Yr(e,t,s)})),R.resolve()}removeOverlaysForBatchId(e,t,r){const i=this.Qs.get(r);return i!==void 0&&(i.forEach((s=>this.overlays=this.overlays.remove(s))),this.Qs.delete(r)),R.resolve()}getOverlaysForCollection(e,t,r){const i=Rt(),s=t.length+1,o=new F(t.child("")),c=this.overlays.getIteratorFrom(o);for(;c.hasNext();){const u=c.getNext().value,l=u.getKey();if(!t.isPrefixOf(l.path))break;l.path.length===s&&u.largestBatchId>r&&i.set(u.getKey(),u)}return R.resolve(i)}getOverlaysForCollectionGroup(e,t,r,i){let s=new de(((l,d)=>l-d));const o=this.overlays.getIterator();for(;o.hasNext();){const l=o.getNext().value;if(l.getKey().getCollectionGroup()===t&&l.largestBatchId>r){let d=s.get(l.largestBatchId);d===null&&(d=Rt(),s=s.insert(l.largestBatchId,d)),d.set(l.getKey(),l)}}const c=Rt(),u=s.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach(((l,d)=>c.set(l,d))),!(c.size()>=i)););return R.resolve(c)}Yr(e,t,r){const i=this.overlays.get(r.key);if(i!==null){const o=this.Qs.get(i.largestBatchId).delete(r.key);this.Qs.set(i.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new Fh(t,r));let s=this.Qs.get(t);s===void 0&&(s=J(),this.Qs.set(t,s)),this.Qs.set(t,s.add(r.key))}}/**
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
 */class HP{constructor(){this.sessionToken=pe.EMPTY_BYTE_STRING}getSessionToken(e){return R.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,R.resolve()}}/**
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
 */class qh{constructor(){this.Gs=new ce($e.zs),this.js=new ce($e.Hs)}isEmpty(){return this.Gs.isEmpty()}addReference(e,t){const r=new $e(e,t);this.Gs=this.Gs.add(r),this.js=this.js.add(r)}Js(e,t){e.forEach((r=>this.addReference(r,t)))}removeReference(e,t){this.Ys(new $e(e,t))}Zs(e,t){e.forEach((r=>this.removeReference(r,t)))}Xs(e){const t=new F(new X([])),r=new $e(t,e),i=new $e(t,e+1),s=[];return this.js.forEachInRange([r,i],(o=>{this.Ys(o),s.push(o.key)})),s}e_(){this.Gs.forEach((e=>this.Ys(e)))}Ys(e){this.Gs=this.Gs.delete(e),this.js=this.js.delete(e)}t_(e){const t=new F(new X([])),r=new $e(t,e),i=new $e(t,e+1);let s=J();return this.js.forEachInRange([r,i],(o=>{s=s.add(o.key)})),s}containsKey(e){const t=new $e(e,0),r=this.Gs.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class $e{constructor(e,t){this.key=e,this.n_=t}static zs(e,t){return F.comparator(e.key,t.key)||Q(e.n_,t.n_)}static Hs(e,t){return Q(e.n_,t.n_)||F.comparator(e.key,t.key)}}/**
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
 */class QP{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Qr=1,this.r_=new ce($e.zs)}checkEmpty(e){return R.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,i){const s=this.Qr;this.Qr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new Dh(s,t,r,i);this.mutationQueue.push(o);for(const c of i)this.r_=this.r_.add(new $e(c.key,s)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return R.resolve(o)}lookupMutationBatch(e,t){return R.resolve(this.i_(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=this.s_(r),s=i<0?0:i;return R.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return R.resolve(this.mutationQueue.length===0?zn:this.Qr-1)}getAllMutationBatches(e){return R.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new $e(t,0),i=new $e(t,Number.POSITIVE_INFINITY),s=[];return this.r_.forEachInRange([r,i],(o=>{const c=this.i_(o.n_);s.push(c)})),R.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ce(Q);return t.forEach((i=>{const s=new $e(i,0),o=new $e(i,Number.POSITIVE_INFINITY);this.r_.forEachInRange([s,o],(c=>{r=r.add(c.n_)}))})),R.resolve(this.__(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1;let s=r;F.isDocumentKey(s)||(s=s.child(""));const o=new $e(new F(s),0);let c=new ce(Q);return this.r_.forEachWhile((u=>{const l=u.key.path;return!!r.isPrefixOf(l)&&(l.length===i&&(c=c.add(u.n_)),!0)}),o),R.resolve(this.__(c))}__(e){const t=[];return e.forEach((r=>{const i=this.i_(r);i!==null&&t.push(i)})),t}removeMutationBatch(e,t){L(this.o_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.r_;return R.forEach(t.mutations,(i=>{const s=new $e(i.key,t.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)})).next((()=>{this.r_=r}))}jr(e){}containsKey(e,t){const r=new $e(t,0),i=this.r_.firstAfterOrEqual(r);return R.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,R.resolve()}o_(e,t){return this.s_(e)}s_(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}i_(e){const t=this.s_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class JP{constructor(e){this.a_=e,this.docs=(function(){return new de(F.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,i=this.docs.get(r),s=i?i.size:0,o=this.a_(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:o}),this.size+=o-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return R.resolve(r?r.document.mutableCopy():ge.newInvalidDocument(t))}getEntries(e,t){let r=De();return t.forEach((i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():ge.newInvalidDocument(i))})),R.resolve(r)}getAllEntries(e){let t=De();return this.docs.forEach(((r,i)=>{t=t.insert(r,i.document)})),R.resolve(t)}getDocumentsMatchingQuery(e,t,r,i){let s,o;Te(t)?(s=X.fromString(Qo(t)),o=d=>Hc(t,d)):(s=t.path,o=d=>Cc(t,d));let c=De();const u=new F(s.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){const{key:d,value:{document:p}}=l.getNext();if(!s.isPrefixOf(d.path))break;d.path.length>s.length+1||eh(Kg(p),r)<=0||(i.has(p.key)||o(p))&&(c=c.insert(p.key,p.mutableCopy()))}return R.resolve(c)}getAllFromCollectionGroup(e,t,r,i){j(9500)}u_(e,t){return R.forEach(this.docs,(r=>t(r)))}newChangeBuffer(e){return new YP(this)}getSize(e){return R.resolve(this.size)}}class YP extends vy{constructor(e){super(),this.qs=e}applyChanges(e){const t=[];return this.changes.forEach(((r,i)=>{i.isValidDocument()?t.push(this.qs.addEntry(e,i)):this.qs.removeEntry(r)})),R.waitFor(t)}getFromCache(e,t){return this.qs.getEntry(e,t)}getAllFromCache(e,t){return this.qs.getEntries(e,t)}}/**
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
 */class XP{constructor(e){this.persistence=e,this.c_=new vn((t=>qc(t)),Nh),this.lastRemoteSnapshotVersion=K.min(),this.highestTargetId=0,this.l_=0,this.E_=new qh,this.targetCount=0,this.h_=yn.ys()}forEachTarget(e,t){return this.c_.forEach(((r,i)=>t(i))),R.resolve()}getLastRemoteSnapshotVersion(e){return R.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return R.resolve(this.l_)}allocateTargetId(e){return this.highestTargetId=this.h_.next(),R.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.l_&&(this.l_=t),R.resolve()}Ss(e){this.c_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.h_=new yn(t),this.highestTargetId=t),e.sequenceNumber>this.l_&&(this.l_=e.sequenceNumber)}addTargetData(e,t){return this.Ss(t),this.targetCount+=1,R.resolve()}updateTargetData(e,t){return this.Ss(t),R.resolve()}removeTargetData(e,t){return this.c_.delete(t.target),this.E_.Xs(t.targetId),this.targetCount-=1,R.resolve()}removeTargets(e,t,r){let i=0;const s=[];return this.c_.forEach(((o,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.c_.delete(o),s.push(this.removeMatchingKeysForTargetId(e,c.targetId)),i++)})),R.waitFor(s).next((()=>i))}getTargetCount(e){return R.resolve(this.targetCount)}getTargetData(e,t){const r=this.c_.get(t)||null;return R.resolve(r)}addMatchingKeys(e,t,r){return this.E_.Js(t,r),R.resolve()}removeMatchingKeys(e,t,r){this.E_.Zs(t,r);const i=this.persistence.referenceDelegate,s=[];return i&&t.forEach((o=>{s.push(i.markPotentiallyOrphaned(e,o))})),R.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.E_.Xs(t),R.resolve()}getMatchingKeysForTargetId(e,t){const r=this.E_.t_(t);return R.resolve(r)}containsKey(e,t){return R.resolve(this.E_.containsKey(t))}}/**
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
 */class $h{constructor(e,t){this.T_={},this.overlays={},this.P_=new dt(0),this.R_=!1,this.R_=!0,this.I_=new HP,this.referenceDelegate=e(this),this.A_=new XP(this),this.indexManager=new FP,this.remoteDocumentCache=(function(i){return new JP(i)})((r=>this.referenceDelegate.V_(r))),this.serializer=new my(t),this.d_=new WP(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new KP,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.T_[e.toKey()];return r||(r=new QP(t,this.referenceDelegate),this.T_[e.toKey()]=r),r}getGlobalsCache(){return this.I_}getTargetCache(){return this.A_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.d_}runTransaction(e,t,r){O("MemoryPersistence","Starting transaction:",e);const i=new ZP(this.P_.next());return this.referenceDelegate.f_(),r(i).next((s=>this.referenceDelegate.m_(i).next((()=>s)))).toPromise().then((s=>(i.raiseOnCommittedEvent(),s)))}p_(e,t){return R.or(Object.values(this.T_).map((r=>()=>r.containsKey(e,t))))}}class ZP extends b_{constructor(e){super(),this.currentSequenceNumber=e}}class Qc{constructor(e){this.persistence=e,this.g_=new qh,this.y_=null}static w_(e){return new Qc(e)}get b_(){if(this.y_)return this.y_;throw j(60996)}addReference(e,t,r){return this.g_.addReference(r,t),this.b_.delete(r.toString()),R.resolve()}removeReference(e,t,r){return this.g_.removeReference(r,t),this.b_.add(r.toString()),R.resolve()}markPotentiallyOrphaned(e,t){return this.b_.add(t.toString()),R.resolve()}removeTarget(e,t){this.g_.Xs(t.targetId).forEach((i=>this.b_.add(i.toString())));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next((i=>{i.forEach((s=>this.b_.add(s.toString())))})).next((()=>r.removeTargetData(e,t)))}f_(){this.y_=new Set}m_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return R.forEach(this.b_,(r=>{const i=F.fromPath(r);return this.v_(e,i).next((s=>{s||t.removeEntry(i,K.min())}))})).next((()=>(this.y_=null,t.apply(e))))}updateLimboDocument(e,t){return this.v_(e,t).next((r=>{r?this.b_.delete(t.toString()):this.b_.add(t.toString())}))}V_(e){return 0}v_(e,t){return R.or([()=>R.resolve(this.g_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.p_(e,t)])}}class hc{constructor(e,t){this.persistence=e,this.S_=new vn((r=>et(r.path)),((r,i)=>r.isEqual(i))),this.garbageCollector=N_(this,t)}static w_(e,t){return new hc(e,t)}f_(){}m_(e){return R.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}rr(e){const t=this.xs(e);return this.persistence.getTargetCache().getTargetCount(e).next((r=>t.next((i=>r+i))))}xs(e){let t=0;return this.ir(e,(r=>{t++})).next((()=>t))}ir(e,t){return R.forEach(this.S_,((r,i)=>this.Fs(e,r,i).next((s=>s?R.resolve():t(i)))))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const i=this.persistence.getRemoteDocumentCache(),s=i.newChangeBuffer();return i.u_(e,(o=>this.Fs(e,o,t).next((c=>{c||(r++,s.removeEntry(o,K.min()))})))).next((()=>s.apply(e))).next((()=>r))}markPotentiallyOrphaned(e,t){return this.S_.set(t,e.currentSequenceNumber),R.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.S_.set(r,e.currentSequenceNumber),R.resolve()}removeReference(e,t,r){return this.S_.set(r,e.currentSequenceNumber),R.resolve()}updateLimboDocument(e,t){return this.S_.set(t,e.currentSequenceNumber),R.resolve()}V_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Oa(e.data.value)),t}Fs(e,t,r){return R.or([()=>this.persistence.p_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const i=this.S_.get(t);return R.resolve(i!==void 0&&i>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
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
 */class eb{constructor(e){this.serializer=e}Mn(e,t,r,i){const s=new xc("createOrUpgrade",t);r<1&&i>=1&&((function(u){u.createObjectStore(Jo)})(e),(function(u){u.createObjectStore(Vo,{keyPath:iP}),u.createObjectStore(Vt,{keyPath:Np,autoIncrement:!0}).createIndex(kr,Dp,{unique:!0}),u.createObjectStore($i)})(e),Jp(e),(function(u){u.createObjectStore(Pr)})(e));let o=R.resolve();return r<3&&i>=3&&(r!==0&&((function(u){u.deleteObjectStore(zi),u.deleteObjectStore(ji),u.deleteObjectStore(Mr)})(e),Jp(e)),o=o.next((()=>(function(u){const l=u.store(Mr),d={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:K.min().toTimestamp(),targetCount:0};return l.put(oc,d)})(s)))),r<4&&i>=4&&(r!==0&&(o=o.next((()=>(function(u,l){return l.store(Vt).Kn().next((p=>{u.deleteObjectStore(Vt),u.createObjectStore(Vt,{keyPath:Np,autoIncrement:!0}).createIndex(kr,Dp,{unique:!0});const m=l.store(Vt),I=p.map((P=>m.put(P)));return R.waitFor(I)}))})(e,s)))),o=o.next((()=>{(function(u){u.createObjectStore(Gi,{keyPath:fP})})(e)}))),r<5&&i>=5&&(o=o.next((()=>this.D_(s)))),r<6&&i>=6&&(o=o.next((()=>((function(u){u.createObjectStore(Co)})(e),this.x_(s))))),r<7&&i>=7&&(o=o.next((()=>this.C_(s)))),r<8&&i>=8&&(o=o.next((()=>this.F_(e,s)))),r<9&&i>=9&&(o=o.next((()=>{(function(u){u.objectStoreNames.contains("remoteDocumentChanges")&&u.deleteObjectStore("remoteDocumentChanges")})(e)}))),r<10&&i>=10&&(o=o.next((()=>this.O_(s)))),r<11&&i>=11&&(o=o.next((()=>{(function(u){u.createObjectStore($c,{keyPath:pP})})(e),(function(u){u.createObjectStore(jc,{keyPath:mP})})(e)}))),r<12&&i>=12&&(o=o.next((()=>{(function(u){const l=u.createObjectStore(zc,{keyPath:TP});l.createIndex(Tl,vP,{unique:!1}),l.createIndex(uy,AP,{unique:!1})})(e)}))),r<13&&i>=13&&(o=o.next((()=>(function(u){const l=u.createObjectStore(sc,{keyPath:oP});l.createIndex(qa,aP),l.createIndex(sy,cP)})(e))).next((()=>this.M_(e,s))).next((()=>e.deleteObjectStore(Pr)))),r<14&&i>=14&&(o=o.next((()=>this.N_(e,s)))),r<15&&i>=15&&(o=o.next((()=>(function(u){u.createObjectStore(Oh,{keyPath:gP,autoIncrement:!0}).createIndex(wl,_P,{unique:!1}),u.createObjectStore(oo,{keyPath:yP}).createIndex(ay,IP,{unique:!1}),u.createObjectStore(ao,{keyPath:EP}).createIndex(cy,wP,{unique:!1})})(e)))),r<16&&i>=16&&(o=o.next((()=>{t.objectStore(oo).clear()})).next((()=>{t.objectStore(ao).clear()}))),r<17&&i>=17&&(o=o.next((()=>{(function(u){u.createObjectStore(Lh,{keyPath:RP})})(e)}))),r<18&&i>=18&&eg()&&(o=o.next((()=>{t.objectStore(oo).clear()})).next((()=>{t.objectStore(ao).clear()}))),o}x_(e){let t=0;return e.store(Pr).jn(((r,i)=>{t+=ac(i)})).next((()=>{const r={byteSize:t};return e.store(Co).put(El,r)}))}D_(e){const t=e.store(Vo),r=e.store(Vt);return t.Kn().next((i=>R.forEach(i,(s=>{const o=IDBKeyRange.bound([s.userId,zn],[s.userId,s.lastAcknowledgedBatchId]);return r.Kn(kr,o).next((c=>R.forEach(c,(u=>{L(u.userId===s.userId,18650,"Cannot process batch from unexpected user",{batchId:u.batchId});const l=Vr(this.serializer,u);return py(e,s.userId,l).next((()=>{}))}))))}))))}C_(e){const t=e.store(zi),r=e.store(Pr);return e.store(Mr).get(oc).next((i=>{const s=[];return r.jn(((o,c)=>{const u=new X(o),l=(function(p){return[0,et(p)]})(u);s.push(t.get(l).next((d=>d?R.resolve():(p=>t.put({targetId:0,path:et(p),sequenceNumber:i.highestListenSequenceNumber}))(u))))})).next((()=>R.waitFor(s)))}))}F_(e,t){e.createObjectStore(No,{keyPath:dP});const r=t.store(No),i=new Bh,s=o=>{if(i.add(o)){const c=o.lastSegment(),u=o.popLast();return r.put({collectionId:c,parent:et(u)})}};return t.store(Pr).jn({zn:!0},((o,c)=>{const u=new X(o);return s(u.popLast())})).next((()=>t.store($i).jn({zn:!0},(([o,c,u],l)=>{const d=jt(c);return s(d.popLast())}))))}O_(e){const t=e.store(ji);return t.jn(((r,i)=>{const s=Js(this.serializer,i),o=gy(this.serializer,s);return t.put(o)}))}M_(e,t){const r=t.store(Pr),i=[];return r.jn(((s,o)=>{const c=t.store(sc),u=(function(p){return p.document?new F(X.fromString(p.document.name).popFirst(5)):p.noDocument?F.fromSegments(p.noDocument.path):p.unknownDocument?F.fromSegments(p.unknownDocument.path):j(36783)})(o).path.toArray(),l={prefixPath:u.slice(0,u.length-2),collectionGroup:u[u.length-2],documentId:u[u.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};i.push(c.put(l))})).next((()=>R.waitFor(i)))}N_(e,t){const r=t.store(Vt),i=Ay(this.serializer),s=new $h(Qc.w_,this.serializer.qr);return r.Kn().next((o=>{const c=new Map;return o.forEach((u=>{let l=c.get(u.userId)??J();Vr(this.serializer,u).keys().forEach((d=>l=l.add(d))),c.set(u.userId,l)})),R.forEach(c,((u,l)=>{const d=new je(l),p=Kc.Kr(this.serializer,d),m=s.getIndexManager(d),I=Wc.Kr(d,this.serializer,m,s.referenceDelegate);return new Ry(i,I,p,m).recalculateAndSaveOverlaysForDocumentKeys(new vl(t,dt.yn),u).next()}))}))}}function Jp(n){n.createObjectStore(zi,{keyPath:lP}).createIndex(xh,hP,{unique:!0}),n.createObjectStore(ji,{keyPath:"targetId"}).createIndex(oy,uP,{unique:!0}),n.createObjectStore(Mr)}const Ln="IndexedDbPersistence",$u=18e5,ju=5e3,zu="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",Py="main";class jh{constructor(e,t,r,i,s,o,c,u,l,d,p=18){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=r,this.xt=s,this.window=o,this.document=c,this.L_=l,this.B_=d,this.U_=p,this.P_=null,this.R_=!1,this.isPrimary=!1,this.networkEnabled=!0,this.k_=null,this.inForeground=!1,this.q_=null,this.K_=null,this.W_=Number.NEGATIVE_INFINITY,this.Q_=m=>Promise.resolve(),!jh.Je())throw new k(S.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new qP(this,i),this.G_=t+Py,this.serializer=new my(u),this.z_=new Qt(this.G_,this.U_,new eb(this.serializer)),this.I_=new DP,this.A_=new BP(this.referenceDelegate,this.serializer),this.remoteDocumentCache=Ay(this.serializer),this.d_=new NP,this.window&&this.window.localStorage?this.j_=this.window.localStorage:(this.j_=null,d===!1&&be(Ln,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.H_().then((()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new k(S.FAILED_PRECONDITION,zu);return this.J_(),this.Y_(),this.Z_(),this.runTransaction("getHighestListenSequenceNumber","readonly",(e=>this.A_.getHighestSequenceNumber(e)))})).then((e=>{this.P_=new dt(e,this.L_)})).then((()=>{this.R_=!0})).catch((e=>(this.z_&&this.z_.close(),Promise.reject(e))))}X_(e){return this.Q_=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.z_.Ln((async t=>{t.newVersion===null&&await e()}))}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.xt.enqueueAndForget((async()=>{this.started&&await this.H_()})))}H_(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",(e=>Sa(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next((()=>{if(this.isPrimary)return this.eo(e).next((t=>{t||(this.isPrimary=!1,this.xt.enqueueRetryable((()=>this.Q_(!1))))}))})).next((()=>this.no(e))).next((t=>this.isPrimary&&!t?this.ro(e).next((()=>!1)):!!t&&this.io(e).next((()=>!0)))))).catch((e=>{if(fr(e))return O(Ln,"Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return O(Ln,"Releasing owner lease after error during lease refresh",e),!1})).then((e=>{this.isPrimary!==e&&this.xt.enqueueRetryable((()=>this.Q_(e))),this.isPrimary=e}))}eo(e){return $s(e).get(hi).next((t=>R.resolve(this.so(t))))}_o(e){return Sa(e).delete(this.clientId)}async oo(){if(this.isPrimary&&!this.ao(this.W_,$u)){this.W_=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",(t=>{const r=Be(t,Gi);return r.Kn().next((i=>{const s=this.uo(i,$u),o=i.filter((c=>s.indexOf(c)===-1));return R.forEach(o,(c=>r.delete(c.clientId))).next((()=>o))}))})).catch((()=>[]));if(this.j_)for(const t of e)this.j_.removeItem(this.co(t.clientId))}}Z_(){this.K_=this.xt.enqueueAfterDelay("client_metadata_refresh",4e3,(()=>this.H_().then((()=>this.oo())).then((()=>this.Z_()))))}so(e){return!!e&&e.ownerId===this.clientId}no(e){return this.B_?R.resolve(!0):$s(e).get(hi).next((t=>{if(t!==null&&this.ao(t.leaseTimestampMs,ju)&&!this.lo(t.ownerId)){if(this.so(t)&&this.networkEnabled)return!0;if(!this.so(t)){if(!t.allowTabSynchronization)throw new k(S.FAILED_PRECONDITION,zu);return!1}}return!(!this.networkEnabled||!this.inForeground)||Sa(e).Kn().next((r=>this.uo(r,ju).find((i=>{if(this.clientId!==i.clientId){const s=!this.networkEnabled&&i.networkEnabled,o=!this.inForeground&&i.inForeground,c=this.networkEnabled===i.networkEnabled;if(s||o&&c)return!0}return!1}))===void 0))})).next((t=>(this.isPrimary!==t&&O(Ln,`Client ${t?"is":"is not"} eligible for a primary lease.`),t)))}async shutdown(){this.R_=!1,this.Eo(),this.K_&&(this.K_.cancel(),this.K_=null),this.ho(),this.To(),await this.z_.runTransaction("shutdown","readwrite",[Jo,Gi],(e=>{const t=new vl(e,dt.yn);return this.ro(t).next((()=>this._o(t)))})),this.z_.close(),this.Po()}uo(e,t){return e.filter((r=>this.ao(r.updateTimeMs,t)&&!this.lo(r.clientId)))}Ro(){return this.runTransaction("getActiveClients","readonly",(e=>Sa(e).Kn().next((t=>this.uo(t,$u).map((r=>r.clientId))))))}get started(){return this.R_}getGlobalsCache(){return this.I_}getMutationQueue(e,t){return Wc.Kr(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.A_}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new UP(e,this.serializer.qr.databaseId)}getDocumentOverlayCache(e){return Kc.Kr(this.serializer,e)}getBundleCache(){return this.d_}runTransaction(e,t,r){O(Ln,"Starting transaction:",e);const i=t==="readonly"?"readonly":"readwrite",s=(function(u){return u===18?SP:u===17?fy:u===16?bP:u===15?Mh:u===14?dy:u===13?hy:u===12?PP:u===11?ly:void j(60245)})(this.U_);let o;return this.z_.runTransaction(e,i,s,(c=>(o=new vl(c,this.P_?this.P_.next():dt.yn),t==="readwrite-primary"?this.eo(o).next((u=>!!u||this.no(o))).next((u=>{if(!u)throw be(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.xt.enqueueRetryable((()=>this.Q_(!1))),new k(S.FAILED_PRECONDITION,P_);return r(o)})).next((u=>this.io(o).next((()=>u)))):this.Io(o).next((()=>r(o)))))).then((c=>(o.raiseOnCommittedEvent(),c)))}Io(e){return $s(e).get(hi).next((t=>{if(t!==null&&this.ao(t.leaseTimestampMs,ju)&&!this.lo(t.ownerId)&&!this.so(t)&&!(this.B_||this.allowTabSynchronization&&t.allowTabSynchronization))throw new k(S.FAILED_PRECONDITION,zu)}))}io(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return $s(e).put(hi,t)}static Je(){return Qt.Je()}ro(e){const t=$s(e);return t.get(hi).next((r=>this.so(r)?(O(Ln,"Releasing primary lease."),t.delete(hi)):R.resolve()))}ao(e,t){const r=Date.now();return!(e<r-t)&&(!(e>r)||(be(`Detected an update time that is in the future: ${e} > ${r}`),!1))}J_(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.q_=()=>{this.xt.enqueueAndForget((()=>(this.inForeground=this.document.visibilityState==="visible",this.H_())))},this.document.addEventListener("visibilitychange",this.q_),this.inForeground=this.document.visibilityState==="visible")}ho(){this.q_&&(this.document.removeEventListener("visibilitychange",this.q_),this.q_=null)}Y_(){var e;typeof((e=this.window)==null?void 0:e.addEventListener)=="function"&&(this.k_=()=>{this.Eo();const t=/(?:Version|Mobile)\/1[456]/;Zm()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.xt.enterRestrictedMode(!0),this.xt.enqueueAndForget((()=>this.shutdown()))},this.window.addEventListener("pagehide",this.k_))}To(){this.k_&&(this.window.removeEventListener("pagehide",this.k_),this.k_=null)}lo(e){var t;try{const r=((t=this.j_)==null?void 0:t.getItem(this.co(e)))!==null;return O(Ln,`Client '${e}' ${r?"is":"is not"} zombied in LocalStorage`),r}catch(r){return be(Ln,"Failed to get zombied client id.",r),!1}}Eo(){if(this.j_)try{this.j_.setItem(this.co(this.clientId),String(Date.now()))}catch(e){be("Failed to set zombie client id.",e)}}Po(){if(this.j_)try{this.j_.removeItem(this.co(this.clientId))}catch{}}co(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function $s(n){return Be(n,Jo)}function Sa(n){return Be(n,Gi)}function zh(n,e){let t=n.projectId;return n.isDefaultDatabase||(t+="."+n.database),"firestore/"+e+"/"+t+"/"}/**
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
 */class Gh{constructor(e,t,r,i){this.targetId=e,this.fromCache=t,this.Ao=r,this.Vo=i}static fo(e,t){let r=J(),i=J();for(const s of t.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new Gh(e,t.fromCache,r,i)}}/**
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
 */function tb(n,e){return F.comparator(n.key,e.key)}/**
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
 */class nb{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class by{constructor(){this.mo=!1,this.po=!1,this.yo=100,this.wo=(function(){return Zm()?8:S_(Me())>0?6:4})()}initialize(e,t){this.bo=e,this.indexManager=t,this.mo=!0}getDocumentsMatchingQuery(e,t,r,i){const s={result:null};return this.vo(e,t).next((o=>{s.result=o})).next((()=>{if(!s.result)return this.So(e,t,i,r).next((o=>{s.result=o}))})).next((()=>{if(s.result)return;const o=new nb;return this.Do(e,t,o).next((c=>{if(s.result=c,this.po)return this.xo(e,t,o,c.size)}))})).next((()=>s.result))}xo(e,t,r,i){return Te(t)?R.resolve():r.documentReadCount<this.yo?(_i()<=ne.DEBUG&&O("QueryEngine","SDK will not create cache indexes for query:",eo(t),"since it only creates cache indexes for collection contains","more than or equal to",this.yo,"documents"),R.resolve()):(_i()<=ne.DEBUG&&O("QueryEngine","Query:",eo(t),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.wo*i?(_i()<=ne.DEBUG&&O("QueryEngine","The SDK decides to create cache indexes for query:",eo(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Ze(t))):R.resolve())}vo(e,t){if(Te(t))return R.resolve(null);let r=t;if(dp(r))return R.resolve(null);let i=Ze(r);return this.indexManager.getIndexType(e,i).next((s=>s===0?null:(r.limit!==null&&s===1&&(r=ec(r,null,"F"),i=Ze(r)),this.indexManager.getDocumentsMatchingTarget(e,i).next((o=>{const c=J(...o);return this.bo.getDocuments(e,c).next((u=>this.indexManager.getMinOffset(e,i).next((l=>{const d=this.Co(r,u);return this.Fo(r,d,c,l.readTime)?this.vo(e,ec(r,null,"F")):this.Oo(e,d,r,l)}))))})))))}So(e,t,r,i){return(Te(t)?(function(o){for(const c of o.stages){if(c instanceof ir||c instanceof Sp)return!1;if(c instanceof Ko){if(c.condition instanceof G_&&c.condition._expr.name==="exists"&&c.condition._expr.params[0]instanceof ri&&c.condition._expr.params[0].fieldName===Bt)continue;return!1}}return!0})(t):dp(t))||i.isEqual(K.min())?R.resolve(null):this.bo.getDocuments(e,r).next((s=>{const o=this.Co(t,s);return this.Fo(t,o,r,i)?R.resolve(null):(_i()<=ne.DEBUG&&O("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),Vp(t)),this.Oo(e,o,t,Wg(i,Mi)).next((c=>c)))}))}Co(e,t){let r,i;return Te(e)?(r=new ce(tb),i=s=>Hc(e,s)):(r=new ce(Nc(e)),i=s=>Cc(e,s)),t.forEach(((s,o)=>{i(o)&&(r=r.add(o))})),r}Fo(e,t,r,i){if(Te(e))return(function(c){return c.stages.some((u=>u instanceof ir||u instanceof Sp))})(e);if(e.limit===null)return!1;if(r.size!==t.size)return!0;const s=e.limitType==="F"?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}Do(e,t,r){return _i()<=ne.DEBUG&&O("QueryEngine","Using full collection scan to execute query:",Vp(t)),this.bo.getDocumentsMatchingQuery(e,t,vt.min(),r)}Oo(e,t,r,i){return this.bo.getDocumentsMatchingQuery(e,r,i).next((s=>(t.forEach((o=>{s=s.insert(o.key,o)})),s)))}}/**
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
 */const Wh="LocalStore",rb=3e8;class ib{constructor(e,t,r,i){this.persistence=e,this.Mo=t,this.serializer=i,this.No=new de(Q),this.Lo=new vn((s=>qc(s)),Nh),this.Bo=new Map,this.Uo=e.getRemoteDocumentCache(),this.A_=e.getTargetCache(),this.d_=e.getBundleCache(),this.ko(r)}ko(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Ry(this.Uo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Uo.setIndexManager(this.indexManager),this.Mo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.No)))}}function Sy(n,e,t,r){return new ib(n,e,t,r)}async function Vy(n,e){const t=B(n);return await t.persistence.runTransaction("Handle user change","readonly",(r=>{let i;return t.mutationQueue.getAllMutationBatches(r).next((s=>(i=s,t.ko(e),t.mutationQueue.getAllMutationBatches(r)))).next((s=>{const o=[],c=[];let u=J();for(const l of i){o.push(l.batchId);for(const d of l.mutations)u=u.add(d.key)}for(const l of s){c.push(l.batchId);for(const d of l.mutations)u=u.add(d.key)}return t.localDocuments.getDocuments(r,u).next((l=>({qo:l,removedBatchIds:o,addedBatchIds:c})))}))}))}function sb(n,e){const t=B(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(r=>{const i=e.batch.keys(),s=t.Uo.newChangeBuffer({trackRemovals:!0});return(function(c,u,l,d){const p=l.batch,m=p.keys();let I=R.resolve();return m.forEach((P=>{I=I.next((()=>d.getEntry(u,P))).next((x=>{const D=l.docVersions.get(P);L(D!==null,48541),x.version.compareTo(D)<0&&(p.applyToRemoteDocument(x,l),x.isValidDocument()&&(x.setReadTime(l.commitVersion),d.addEntry(x)))}))})),I.next((()=>c.mutationQueue.removeMutationBatch(u,p)))})(t,r,e,s).next((()=>s.apply(r))).next((()=>t.mutationQueue.performConsistencyCheck(r))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,(function(c){let u=J();for(let l=0;l<c.mutationResults.length;++l)c.mutationResults[l].transformResults.length>0&&(u=u.add(c.batch.mutations[l].key));return u})(e)))).next((()=>t.localDocuments.getDocuments(r,i)))}))}function Cy(n){const e=B(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.A_.getLastRemoteSnapshotVersion(t)))}function ob(n,e){const t=B(n),r=e.snapshotVersion;let i=t.No;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(s=>{const o=t.Uo.newChangeBuffer({trackRemovals:!0});i=t.No;const c=[];e.targetChanges.forEach(((d,p)=>{const m=i.get(p);if(!m)return;c.push(t.A_.removeMatchingKeys(s,d.removedDocuments,p).next((()=>t.A_.addMatchingKeys(s,d.addedDocuments,p))));let I=m.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(p)!==null?I=I.withResumeToken(pe.EMPTY_BYTE_STRING,K.min()).withLastLimboFreeSnapshotVersion(K.min()):d.resumeToken.approximateByteSize()>0&&(I=I.withResumeToken(d.resumeToken,r)),i=i.insert(p,I),(function(x,D,$){return x.resumeToken.approximateByteSize()===0||D.snapshotVersion.toMicroseconds()-x.snapshotVersion.toMicroseconds()>=rb?!0:$.addedDocuments.size+$.modifiedDocuments.size+$.removedDocuments.size>0})(m,I,d)&&c.push(t.A_.updateTargetData(s,I))}));let u=De(),l=J();if(e.documentUpdates.forEach((d=>{e.resolvedLimboDocuments.has(d)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(s,d))})),c.push(Ny(s,o,e.documentUpdates).next((d=>{u=d.$o,l=d.Ko}))),!r.isEqual(K.min())){const d=t.A_.getLastRemoteSnapshotVersion(s).next((p=>t.A_.setTargetsMetadata(s,s.currentSequenceNumber,r)));c.push(d)}return R.waitFor(c).next((()=>o.apply(s))).next((()=>t.localDocuments.getLocalViewOfDocuments(s,u,l))).next((()=>u))})).then((s=>(t.No=i,s)))}function Ny(n,e,t){let r=J(),i=J();return t.forEach((s=>r=r.add(s))),e.getEntries(n,r).next((s=>{let o=De();return t.forEach(((c,u)=>{const l=s.get(c);u.isFoundDocument()!==l.isFoundDocument()&&(i=i.add(c)),u.isNoDocument()&&u.version.isEqual(K.min())?(e.removeEntry(c,u.readTime),o=o.insert(c,u)):!l.isValidDocument()||u.version.compareTo(l.version)>0||u.version.compareTo(l.version)===0&&l.hasPendingWrites?(e.addEntry(u),o=o.insert(c,u)):O(Wh,"Ignoring outdated watch update for ",c,". Current version:",l.version," Watch version:",u.version)})),{$o:o,Ko:i}}))}function ab(n,e){const t=B(n);return t.persistence.runTransaction("Get next mutation batch","readonly",(r=>(e===void 0&&(e=zn),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e))))}function Wi(n,e){const t=B(n);return t.persistence.runTransaction("Allocate target","readwrite",(r=>{let i;return t.A_.getTargetData(r,e).next((s=>s?(i=s,R.resolve(i)):t.A_.allocateTargetId(r).next((o=>(i=new zt(e,o,"TargetPurposeListen",r.currentSequenceNumber),t.A_.addTargetData(r,i).next((()=>i)))))))})).then((r=>{const i=t.No.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(t.No=t.No.insert(r.targetId,r),t.Lo.set(e,r.targetId)),r}))}async function Ki(n,e,t){const r=B(n),i=r.No.get(e),s=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",s,(o=>r.persistence.referenceDelegate.removeTarget(o,i)))}catch(o){if(!fr(o))throw o;O(Wh,`Failed to update sequence numbers for target ${e}: ${o}`)}r.No=r.No.remove(e),r.Lo.delete(i.target)}function dc(n,e,t){const r=B(n);let i=K.min(),s=J();return r.persistence.runTransaction("Execute query","readwrite",(o=>(function(u,l,d){const p=B(u),m=p.Lo.get(d);return m!==void 0?R.resolve(p.No.get(m)):p.A_.getTargetData(l,d)})(r,o,Te(e)?e:Ze(e)).next((c=>{if(c)return i=c.lastLimboFreeSnapshotVersion,r.A_.getMatchingKeysForTargetId(o,c.targetId).next((u=>{s=u}))})).next((()=>r.Mo.getDocumentsMatchingQuery(o,e,t?i:K.min(),t?s:J()))).next((c=>(ky(r,c),{documents:c,Wo:s})))))}function Dy(n,e){const t=B(n),r=B(t.A_),i=t.No.get(e);return i?Promise.resolve(i.target??null):t.persistence.runTransaction("Get target data","readonly",(s=>r.ge(s,e).next((o=>(o==null?void 0:o.target)??null))))}function Sl(n,e){const t=B(n),r=t.Bo.get(e)||K.min();return t.persistence.runTransaction("Get new document changes","readonly",(i=>t.Uo.getAllFromCollectionGroup(i,e,Wg(r,Mi),Number.MAX_SAFE_INTEGER))).then((i=>(ky(t,i),i)))}function ky(n,e){e.forEach(((t,r)=>{const i=r.key.getCollectionGroup(),s=n.Bo.get(i)||K.min();r.readTime.compareTo(s)>0&&n.Bo.set(i,r.readTime)}))}async function cb(n,e,t,r){const i=B(n);let s=J(),o=De();for(const l of t){const d=e.Qo(l.metadata.name);l.document&&(s=s.add(d));const p=e.Go(l);p.setReadTime(e.zo(l.metadata.readTime)),o=o.insert(d,p)}const c=i.Uo.newChangeBuffer({trackRemovals:!0}),u=await Wi(i,(function(d){return Ze(ss(X.fromString(`__bundle__/docs/${d}`)))})(r));return i.persistence.runTransaction("Apply bundle documents","readwrite",(l=>Ny(l,c,o).next((d=>(c.apply(l),d))).next((d=>i.A_.removeMatchingKeysForTargetId(l,u.targetId).next((()=>i.A_.addMatchingKeys(l,s,u.targetId))).next((()=>i.localDocuments.getLocalViewOfDocuments(l,d.$o,d.Ko))).next((()=>d.$o))))))}async function ub(n,e,t=J()){const r=await Wi(n,Ze(Gc(e.bundledQuery))),i=B(n);return i.persistence.runTransaction("Save named query","readwrite",(s=>{const o=Ve(e.readTime);if(r.snapshotVersion.compareTo(o)>=0)return i.d_.saveNamedQuery(s,e);const c=r.withResumeToken(pe.EMPTY_BYTE_STRING,o);return i.No=i.No.insert(c.targetId,c),i.A_.updateTargetData(s,c).next((()=>i.A_.removeMatchingKeysForTargetId(s,r.targetId))).next((()=>i.A_.addMatchingKeys(s,t,r.targetId))).next((()=>i.d_.saveNamedQuery(s,e)))}))}/**
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
 */class xy{constructor(e,t){this.jo=e,this.byteLength=t}Ho(){return"metadata"in this.jo}}/**
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
 */function Yp(n,e=10240){let t=0;return{async read(){if(t<n.byteLength){const r={value:n.slice(t,t+e),done:!1};return t+=e,r}return{done:!0}},async cancel(){},releaseLock(){},closed:Promise.resolve()}}/**
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
 */class lb{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Jo=0,this.Yo=null,this.Zo=!0}Xo(){this.Jo===0&&(this.ea("Unknown"),this.Yo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.Yo=null,this.ta("Backend didn't respond within 10 seconds."),this.ea("Offline"),Promise.resolve()))))}na(e){this.state==="Online"?this.ea("Unknown"):(this.Jo++,this.Jo>=1&&(this.ra(),this.ta(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ea("Offline")))}set(e){this.ra(),this.Jo=0,e==="Online"&&(this.Zo=!1),this.ea(e)}ea(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ta(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Zo?(be(t),this.Zo=!1):O("OnlineStateTracker",t)}ra(){this.Yo!==null&&(this.Yo.cancel(),this.Yo=null)}}/**
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
 */const Xt="RemoteStore";class hb{constructor(e,t,r,i,s){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.ia=[],this.sa=new Map,this._a=new Map,this.oa=new Map,this.aa=new yn(1e3),this.ua=new yn(1001),this.ca=new Set,this.la=[],this.Ea=s,this.Ea.Ke((o=>{r.enqueueAndForget((async()=>{pr(this)&&(O(Xt,"Restarting streams for network reachability change."),await(async function(u){const l=B(u);l.ca.add(4),await us(l),l.ha.set("Unknown"),l.ca.delete(4),await Yo(l)})(this))}))})),this.ha=new lb(r,i)}}async function Yo(n){if(pr(n))for(const e of n.la)await e(!0)}async function us(n){for(const e of n.la)await e(!1)}function Vl(n,e){return n._a.get(e)||void 0}function Jc(n,e){const t=B(n),r=Vl(t,e.targetId);if(r!==void 0&&t.sa.has(r))return;const i=(function(c,u){const l=Vl(c,u);l!==void 0&&c.oa.delete(l);const d=(function(m,I){return I%2!=0?m.ua.next():m.aa.next()})(c,u);return c._a.set(u,d),c.oa.set(d,u),d})(t,e.targetId);O(Xt,"remoteStoreListen mapping SDK target ID to remote",e.targetId,i);const s=new zt(e.target,i,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t.sa.set(i,s),Qh(t)?Hh(t):hs(t).Jt()&&Kh(t,s)}function Hi(n,e){const t=B(n),r=hs(t),i=Vl(t,e);O(Xt,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,i),t.sa.delete(i),t._a.delete(e),t.oa.delete(i),r.Jt()&&Oy(t,i),t.sa.size===0&&(r.Jt()?r.Xt():pr(t)&&t.ha.set("Unknown"))}function Kh(n,e){if(n.Ta.H(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(K.min())>0){const t=n.oa.get(e.targetId);if(t===void 0)return void O(Xt,"SDK target ID not found for remote ID: "+e.targetId);const r=n.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(r)}hs(n).Tn(e)}function Oy(n,e){n.Ta.H(e),hs(n).Pn(e)}function Hh(n){n.Ta=new Mv({getRemoteKeysForTarget:e=>{const t=n.oa.get(e);return t!==void 0?n.remoteSyncer.getRemoteKeysForTarget(t):J()},ge:e=>n.sa.get(e)||null,Ae:()=>n.datastore.serializer.databaseId}),hs(n).start(),n.ha.Xo()}function Qh(n){return pr(n)&&!hs(n).Ht()&&n.sa.size>0}function pr(n){return B(n).ca.size===0}function Ly(n){n.Ta=void 0}async function db(n){n.ha.set("Online")}async function fb(n){n.sa.forEach(((e,t)=>{Kh(n,e)}))}async function pb(n,e){Ly(n),Qh(n)?(n.ha.na(e),Hh(n)):n.ha.set("Unknown")}async function mb(n,e,t){if(n.ha.set("Online"),e instanceof s_&&e.state===2&&e.cause)try{await(async function(i,s){const o=s.cause;for(const c of s.targetIds){if(i.sa.has(c)){const u=i.oa.get(c);u!==void 0&&(await i.remoteSyncer.rejectListen(u,o),i._a.delete(u),i.oa.delete(c)),i.sa.delete(c)}i.Ta.removeTarget(c)}})(n,e)}catch(r){O(Xt,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await fc(n,r)}else if(e instanceof Ma?n.Ta.se(e):e instanceof i_?n.Ta.Ee(e):n.Ta.ae(e),!t.isEqual(K.min()))try{const r=await Cy(n.localStore);t.compareTo(r)>=0&&await(function(s,o){const c=s.Ta.de(o);c.targetChanges.forEach(((l,d)=>{if(l.resumeToken.approximateByteSize()>0){const p=s.sa.get(d);p&&s.sa.set(d,p.withResumeToken(l.resumeToken,o))}})),c.targetMismatches.forEach(((l,d)=>{const p=s.sa.get(l);if(!p)return;s.sa.set(l,p.withResumeToken(pe.EMPTY_BYTE_STRING,p.snapshotVersion)),Oy(s,l);const m=new zt(p.target,l,d,p.sequenceNumber);Kh(s,m)}));const u=(function(d,p){const m=new Map;p.targetChanges.forEach(((P,x)=>{const D=d.oa.get(x);D!==void 0&&m.set(D,P)}));let I=new de(Q);return p.targetMismatches.forEach(((P,x)=>{const D=d.oa.get(P);D!==void 0&&(I=I.insert(D,x))})),new os(p.snapshotVersion,m,I,p.documentUpdates,p.augmentedDocumentUpdates,p.resolvedLimboDocuments)})(s,c);return s.remoteSyncer.applyRemoteEvent(u)})(n,t)}catch(r){O(Xt,"Failed to raise snapshot:",r),await fc(n,r)}}async function fc(n,e,t){if(!fr(e))throw e;n.ca.add(1),await us(n),n.ha.set("Offline"),t||(t=()=>Cy(n.localStore)),n.asyncQueue.enqueueRetryable((async()=>{O(Xt,"Retrying IndexedDB access"),await t(),n.ca.delete(1),await Yo(n)}))}function My(n,e){return e().catch((t=>fc(n,t,e)))}async function ls(n){const e=B(n),t=or(e);let r=e.ia.length>0?e.ia[e.ia.length-1].batchId:zn;for(;gb(e);)try{const i=await ab(e.localStore,r);if(i===null){e.ia.length===0&&t.Xt();break}r=i.batchId,_b(e,i)}catch(i){await fc(e,i)}Fy(e)&&Uy(e)}function gb(n){return pr(n)&&n.ia.length<10}function _b(n,e){n.ia.push(e);const t=or(n);t.Jt()&&t.Rn&&t.In(e.mutations)}function Fy(n){return pr(n)&&!or(n).Ht()&&n.ia.length>0}function Uy(n){or(n).start()}async function yb(n){or(n).dn()}async function Ib(n){const e=or(n);for(const t of n.ia)e.In(t.mutations)}async function Eb(n,e,t){const r=n.ia.shift(),i=kh.from(r,e,t);await My(n,(()=>n.remoteSyncer.applySuccessfulWrite(i))),await ls(n)}async function wb(n,e){e&&or(n).Rn&&await(async function(r,i){if((function(o){return Xg(o)&&o!==S.ABORTED})(i.code)){const s=r.ia.shift();or(r).Zt(),await My(r,(()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i))),await ls(r)}})(n,e),Fy(n)&&Uy(n)}async function Xp(n,e){const t=B(n);t.asyncQueue.verifyOperationInProgress(),O(Xt,"RemoteStore received new credentials");const r=pr(t);t.ca.add(3),await us(t),r&&t.ha.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.ca.delete(3),await Yo(t)}async function Cl(n,e){const t=B(n);e?(t.ca.delete(2),await Yo(t)):e||(t.ca.add(2),await us(t),t.ha.set("Unknown"))}function hs(n){return n.Pa||(n.Pa=(function(t,r,i){const s=B(t);return s.mn(),new aA(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)})(n.datastore,n.asyncQueue,{ut:db.bind(null,n),lt:fb.bind(null,n),ht:pb.bind(null,n),hn:mb.bind(null,n)}),n.la.push((async e=>{e?(n.Pa.Zt(),Qh(n)?Hh(n):n.ha.set("Unknown")):(await n.Pa.stop(),Ly(n))}))),n.Pa}function or(n){return n.Ra||(n.Ra=(function(t,r,i){const s=B(t);return s.mn(),new cA(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)})(n.datastore,n.asyncQueue,{ut:()=>Promise.resolve(),lt:yb.bind(null,n),ht:wb.bind(null,n),An:Ib.bind(null,n),Vn:Eb.bind(null,n)}),n.la.push((async e=>{e?(n.Ra.Zt(),await ls(n)):(await n.Ra.stop(),n.ia.length>0&&(O(Xt,`Stopping write stream with ${n.ia.length} pending writes`),n.ia=[]))}))),n.Ra}/**
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
 */class Yc{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ia(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ia(this.observer.error,e):be("Uncaught Error in snapshot listener:",e.toString()))}Aa(){this.muted=!0}Ia(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
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
 */class Jh{constructor(e,t,r,i,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new Ge,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((o=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,i,s){const o=Date.now()+r,c=new Jh(e,t,o,i,s);return c.start(r),c}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new k(S.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function ds(n,e){if(be("AsyncQueue",`${e}: ${n}`),fr(n))return new k(S.UNAVAILABLE,`${e}: ${n}`);throw n}/**
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
 */class Tb{constructor(e,t){this.Va=e,this.serializer=t,this.metadata=new Ge,this.buffer=new Uint8Array,this.da=(function(){return new TextDecoder("utf-8")})(),this.fa().then((r=>{r&&r.Ho()?this.metadata.resolve(r.jo.metadata):this.metadata.reject(new Error(`The first element of the bundle is not a metadata, it is
             ${JSON.stringify(r==null?void 0:r.jo)}`))}),(r=>this.metadata.reject(r)))}close(){return this.Va.cancel()}async getMetadata(){return this.metadata.promise}async ma(){return await this.getMetadata(),this.fa()}async fa(){const e=await this.pa();if(e===null)return null;const t=this.da.decode(e),r=Number(t);isNaN(r)&&this.ga(`length string (${t}) is not valid number`);const i=await this.ya(r);return new xy(JSON.parse(i),e.length+r)}wa(){return this.buffer.findIndex((e=>e===123))}async pa(){for(;this.wa()<0&&!await this.ba(););if(this.buffer.length===0)return null;const e=this.wa();e<0&&this.ga("Reached the end of bundle when a length string is expected.");const t=this.buffer.slice(0,e);return this.buffer=this.buffer.slice(e),t}async ya(e){for(;this.buffer.length<e;)await this.ba()&&this.ga("Reached the end of bundle when more is expected.");const t=this.da.decode(this.buffer.slice(0,e));return this.buffer=this.buffer.slice(e),t}ga(e){throw this.Va.cancel(),new Error(`Invalid bundle format: ${e}`)}async ba(){const e=await this.Va.read();if(!e.done){const t=new Uint8Array(this.buffer.length+e.value.length);t.set(this.buffer),t.set(e.value,this.buffer.length),this.buffer=t}return e.done}}/**
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
 */class vb{constructor(e,t){this.bundleData=e,this.serializer=t,this.cursor=0,this.elements=[];let r=this.ma();if(!r||!r.Ho())throw new Error(`The first element of the bundle is not a metadata object, it is
         ${JSON.stringify(r==null?void 0:r.jo)}`);this.metadata=r;do r=this.ma(),r!==null&&this.elements.push(r);while(r!==null)}getMetadata(){return this.metadata}va(){return this.elements}ma(){if(this.cursor===this.bundleData.length)return null;const e=this.pa(),t=this.ya(e);return new xy(JSON.parse(t),e)}ya(e){if(this.cursor+e>this.bundleData.length)throw new k(S.INTERNAL,"Reached the end of bundle when more is expected.");return this.bundleData.slice(this.cursor,this.cursor+=e)}pa(){const e=this.cursor;let t=this.cursor;for(;t<this.bundleData.length;){if(this.bundleData[t]==="{"){if(t===e)throw new Error("First character is a bracket and not a number");return this.cursor=t,Number(this.bundleData.slice(e,t))}t++}throw new Error("Reached the end of bundle when more is expected.")}}const co="IndexBackfiller";class Ab{constructor(e,t){this.asyncQueue=e,this.Sa=t,this.task=null}start(){this.Da(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}Da(e){O(co,`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,(async()=>{this.task=null;try{const t=await this.Sa.xa();O(co,`Documents written: ${t}`)}catch(t){fr(t)?O(co,"Ignoring IndexedDB error during index backfill: ",t):await dr(t)}await this.Da(6e4)}))}}class Rb{constructor(e,t){this.localStore=e,this.persistence=t}async xa(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",(t=>this.Ca(t,e)))}Ca(e,t){const r=new Set;let i=t,s=!0;return R.doWhile((()=>s===!0&&i>0),(()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next((o=>{if(o!==null&&!r.has(o))return O(co,`Processing collection: ${o}`),this.Fa(e,o,i).next((c=>{i-=c,r.add(o)}));s=!1})))).next((()=>t-i))}Fa(e,t,r){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next((i=>this.localStore.localDocuments.getNextDocuments(e,t,i,r).next((s=>{const o=s.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next((()=>this.Oa(i,s))).next((c=>(O(co,`Updating offset: ${c}`),this.localStore.indexManager.updateCollectionGroup(e,t,c)))).next((()=>o.size))}))))}Oa(e,t){let r=e;return t.changes.forEach(((i,s)=>{const o=Kg(s);eh(o,r)>0&&(r=o)})),new vt(r.readTime,r.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
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
 */const By="firestore_clients";function Zp(n,e){return`${By}_${n}_${e}`}const qy="firestore_mutations";function em(n,e,t){let r=`${qy}_${n}_${t}`;return e.isAuthenticated()&&(r+=`_${e.uid}`),r}const $y="firestore_targets";function Gu(n,e){return`${$y}_${n}_${e}`}/**
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
 */const Ut="SharedClientState";class pc{constructor(e,t,r,i){this.user=e,this.batchId=t,this.state=r,this.error=i}static Ma(e,t,r){const i=JSON.parse(r);let s,o=typeof i=="object"&&["pending","acknowledged","rejected"].indexOf(i.state)!==-1&&(i.error===void 0||typeof i.error=="object");return o&&i.error&&(o=typeof i.error.message=="string"&&typeof i.error.code=="string",o&&(s=new k(i.error.code,i.error.message))),o?new pc(e,t,i.state,s):(be(Ut,`Failed to parse mutation state for ID '${t}': ${r}`),null)}Na(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class uo{constructor(e,t,r){this.targetId=e,this.state=t,this.error=r}static Ma(e,t){const r=JSON.parse(t);let i,s=typeof r=="object"&&["not-current","current","rejected"].indexOf(r.state)!==-1&&(r.error===void 0||typeof r.error=="object");return s&&r.error&&(s=typeof r.error.message=="string"&&typeof r.error.code=="string",s&&(i=new k(r.error.code,r.error.message))),s?new uo(e,r.state,i):(be(Ut,`Failed to parse target state for ID '${e}': ${t}`),null)}Na(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class mc{constructor(e,t){this.clientId=e,this.activeTargetIds=t}static Ma(e,t){const r=JSON.parse(t);let i=typeof r=="object"&&r.activeTargetIds instanceof Array,s=ih();for(let o=0;i&&o<r.activeTargetIds.length;++o)i=bg(r.activeTargetIds[o]),s=s.add(r.activeTargetIds[o]);return i?new mc(e,s):(be(Ut,`Failed to parse client data for instance '${e}': ${t}`),null)}}class Yh{constructor(e,t){this.clientId=e,this.onlineState=t}static Ma(e){const t=JSON.parse(e);return typeof t=="object"&&["Unknown","Online","Offline"].indexOf(t.onlineState)!==-1&&typeof t.clientId=="string"?new Yh(t.clientId,t.onlineState):(be(Ut,`Failed to parse online state: ${e}`),null)}}class Nl{constructor(){this.activeTargetIds=ih()}La(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ba(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Na(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Wu{constructor(e,t,r,i,s){this.window=e,this.xt=t,this.persistenceKey=r,this.Ua=i,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.ka=this.qa.bind(this),this.$a=new de(Q),this.started=!1,this.Ka=[];const o=r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=s,this.Wa=Zp(this.persistenceKey,this.Ua),this.Qa=(function(u){return`firestore_sequence_number_${u}`})(this.persistenceKey),this.$a=this.$a.insert(this.Ua,new Nl),this.Ga=new RegExp(`^${By}_${o}_([^_]*)$`),this.za=new RegExp(`^${qy}_${o}_(\\d+)(?:_(.*))?$`),this.ja=new RegExp(`^${$y}_${o}_(\\d+)$`),this.Ha=(function(u){return`firestore_online_state_${u}`})(this.persistenceKey),this.Ja=(function(u){return`firestore_bundle_loaded_v2_${u}`})(this.persistenceKey),this.window.addEventListener("storage",this.ka)}static Je(e){return!(!e||!e.localStorage)}async start(){const e=await this.syncEngine.Ro();for(const r of e){if(r===this.Ua)continue;const i=this.getItem(Zp(this.persistenceKey,r));if(i){const s=mc.Ma(r,i);s&&(this.$a=this.$a.insert(s.clientId,s))}}this.Ya();const t=this.storage.getItem(this.Ha);if(t){const r=this.Za(t);r&&this.Xa(r)}for(const r of this.Ka)this.qa(r);this.Ka=[],this.window.addEventListener("pagehide",(()=>this.shutdown())),this.started=!0}writeSequenceNumber(e){this.setItem(this.Qa,JSON.stringify(e))}getAllActiveQueryTargets(){return this.eu(this.$a)}isActiveQueryTarget(e){let t=!1;return this.$a.forEach(((r,i)=>{i.activeTargetIds.has(e)&&(t=!0)})),t}addPendingMutation(e){this.tu(e,"pending")}updateMutationState(e,t,r){this.tu(e,t,r),this.nu(e)}addLocalQueryTarget(e,t=!0){let r="not-current";if(this.isActiveQueryTarget(e)){const i=this.storage.getItem(Gu(this.persistenceKey,e));if(i){const s=uo.Ma(e,i);s&&(r=s.state)}}return t&&this.ru.La(e),this.Ya(),r}removeLocalQueryTarget(e){this.ru.Ba(e),this.Ya()}isLocalQueryTarget(e){return this.ru.activeTargetIds.has(e)}clearQueryState(e){this.removeItem(Gu(this.persistenceKey,e))}updateQueryState(e,t,r){this.iu(e,t,r)}handleUserChange(e,t,r){t.forEach((i=>{this.nu(i)})),this.currentUser=e,r.forEach((i=>{this.addPendingMutation(i)}))}setOnlineState(e){this.su(e)}notifyBundleLoaded(e){this._u(e)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.ka),this.removeItem(this.Wa),this.started=!1)}getItem(e){const t=this.storage.getItem(e);return O(Ut,"READ",e,t),t}setItem(e,t){O(Ut,"SET",e,t),this.storage.setItem(e,t)}removeItem(e){O(Ut,"REMOVE",e),this.storage.removeItem(e)}qa(e){const t=e;if(t.storageArea===this.storage){if(O(Ut,"EVENT",t.key,t.newValue),t.key===this.Wa)return void be("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.xt.enqueueRetryable((async()=>{if(this.started){if(t.key!==null){if(this.Ga.test(t.key)){if(t.newValue==null){const r=this.ou(t.key);return this.au(r,null)}{const r=this.uu(t.key,t.newValue);if(r)return this.au(r.clientId,r)}}else if(this.za.test(t.key)){if(t.newValue!==null){const r=this.cu(t.key,t.newValue);if(r)return this.lu(r)}}else if(this.ja.test(t.key)){if(t.newValue!==null){const r=this.Eu(t.key,t.newValue);if(r)return this.hu(r)}}else if(t.key===this.Ha){if(t.newValue!==null){const r=this.Za(t.newValue);if(r)return this.Xa(r)}}else if(t.key===this.Qa){const r=(function(s){let o=dt.yn;if(s!=null)try{const c=JSON.parse(s);L(typeof c=="number",30636,{Tu:s}),o=c}catch(c){be(Ut,"Failed to read sequence number from WebStorage",c)}return o})(t.newValue);r!==dt.yn&&this.sequenceNumberHandler(r)}else if(t.key===this.Ja){const r=this.Pu(t.newValue);await Promise.all(r.map((i=>this.syncEngine.Ru(i))))}}}else this.Ka.push(t)}))}}get ru(){return this.$a.get(this.Ua)}Ya(){this.setItem(this.Wa,this.ru.Na())}tu(e,t,r){const i=new pc(this.currentUser,e,t,r),s=em(this.persistenceKey,this.currentUser,e);this.setItem(s,i.Na())}nu(e){const t=em(this.persistenceKey,this.currentUser,e);this.removeItem(t)}su(e){const t={clientId:this.Ua,onlineState:e};this.storage.setItem(this.Ha,JSON.stringify(t))}iu(e,t,r){const i=Gu(this.persistenceKey,e),s=new uo(e,t,r);this.setItem(i,s.Na())}_u(e){const t=JSON.stringify(Array.from(e));this.setItem(this.Ja,t)}ou(e){const t=this.Ga.exec(e);return t?t[1]:null}uu(e,t){const r=this.ou(e);return mc.Ma(r,t)}cu(e,t){const r=this.za.exec(e),i=Number(r[1]),s=r[2]!==void 0?r[2]:null;return pc.Ma(new je(s),i,t)}Eu(e,t){const r=this.ja.exec(e),i=Number(r[1]);return uo.Ma(i,t)}Za(e){return Yh.Ma(e)}Pu(e){return JSON.parse(e)}async lu(e){if(e.user.uid===this.currentUser.uid)return this.syncEngine.Iu(e.batchId,e.state,e.error);O(Ut,`Ignoring mutation for non-active user ${e.user.uid}`)}hu(e){return this.syncEngine.Au(e.targetId,e.state,e.error)}au(e,t){const r=t?this.$a.insert(e,t):this.$a.remove(e),i=this.eu(this.$a),s=this.eu(r),o=[],c=[];return s.forEach((u=>{i.has(u)||o.push(u)})),i.forEach((u=>{s.has(u)||c.push(u)})),this.syncEngine.Vu(o,c).then((()=>{this.$a=r}))}Xa(e){this.$a.get(e.clientId)&&this.onlineStateHandler(e.onlineState)}eu(e){let t=ih();return e.forEach(((r,i)=>{t=t.unionWith(i.activeTargetIds)})),t}}class jy{constructor(){this.du=new Nl,this.fu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.du.La(e),this.fu[e]||"not-current"}updateQueryState(e,t,r){this.fu[e]=t}removeLocalQueryTarget(e){this.du.Ba(e)}isLocalQueryTarget(e){return this.du.activeTargetIds.has(e)}clearQueryState(e){delete this.fu[e]}getAllActiveQueryTargets(){return this.du.activeTargetIds}isActiveQueryTarget(e){return this.du.activeTargetIds.has(e)}start(){return this.du=new Nl,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */function zy(){return typeof window<"u"?window:null}function ja(){return typeof document<"u"?document:null}/**
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
 */class Wn{static emptySet(e){return new Wn(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||F.comparator(t.key,r.key):(t,r)=>F.comparator(t.key,r.key),this.keyedMap=br(),this.sortedSet=new de(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,r)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Wn)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Wn;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
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
 */class tm{constructor(){this.mu=new de(F.comparator)}track(e){const t=e.doc.key,r=this.mu.get(t);r?e.type!==0&&r.type===3?this.mu=this.mu.insert(t,e):e.type===3&&r.type!==1?this.mu=this.mu.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.mu=this.mu.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.mu=this.mu.remove(t):e.type===1&&r.type===2?this.mu=this.mu.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):j(63341,{ye:e,pu:r}):this.mu=this.mu.insert(t,e)}gu(){const e=[];return this.mu.inorderTraversal(((t,r)=>{e.push(r)})),e}}class Hr{constructor(e,t,r,i,s,o,c,u,l){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=o,this.syncStateChanged=c,this.excludesMetadataChanges=u,this.hasCachedResults=l}static fromInitialDocuments(e,t,r,i,s){const o=[];return t.forEach((c=>{o.push({type:0,doc:c})})),new Hr(e,t,Wn.emptySet(t),o,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Bc(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==r[i].type||!t[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
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
 */class Pb{constructor(){this.yu=void 0,this.wu=[]}bu(){return this.wu.some((e=>e.vu()))}}class bb{constructor(){this.queries=nm(),this.onlineState="Unknown",this.Su=new Set}terminate(){(function(t,r){const i=B(t),s=i.queries;i.queries=nm(),s.forEach(((o,c)=>{for(const u of c.wu)u.onError(r)}))})(this,new k(S.ABORTED,"Firestore shutting down"))}}function nm(){return new vn((n=>ry(n)),Bc)}async function Xh(n,e){const t=B(n);let r=3;const i=e.query;let s=t.queries.get(i);s?!s.bu()&&e.vu()&&(r=2):(s=new Pb,r=e.vu()?0:1);try{switch(r){case 0:s.yu=await t.onListen(i,!0);break;case 1:s.yu=await t.onListen(i,!1);break;case 2:await t.onFirstRemoteStoreListen(i)}}catch(o){const c=ds(o,`Initialization of query '${Te(e.query)?dn(e.query):eo(e.query)}' failed`);return void e.onError(c)}t.queries.set(i,s),s.wu.push(e),e.Du(t.onlineState),s.yu&&e.xu(s.yu)&&ed(t)}async function Zh(n,e){const t=B(n),r=e.query;let i=3;const s=t.queries.get(r);if(s){const o=s.wu.indexOf(e);o>=0&&(s.wu.splice(o,1),s.wu.length===0?i=e.vu()?0:1:!s.bu()&&e.vu()&&(i=2))}switch(i){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function Sb(n,e){const t=B(n);let r=!1;for(const i of e){const s=i.query,o=t.queries.get(s);if(o){for(const c of o.wu)c.xu(i)&&(r=!0);o.yu=i}}r&&ed(t)}function Vb(n,e,t){const r=B(n),i=r.queries.get(e);if(i)for(const s of i.wu)s.onError(t);r.queries.delete(e)}function ed(n){n.Su.forEach((e=>{e.next()}))}var Dl;(function(n){n.Default="default",n.Cache="cache"})(Dl||(Dl={}));class td{constructor(e,t,r){this.query=e,this.Cu=t,this.Fu=!1,this.Ou=null,this.onlineState="Unknown",this.options=r||{}}xu(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new Hr(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Fu?this.Mu(e)&&(this.Cu.next(e),t=!0):this.Nu(e,this.onlineState)&&(this.Lu(e),t=!0),this.Ou=e,t}onError(e){this.Cu.error(e)}Du(e){this.onlineState=e;let t=!1;return this.Ou&&!this.Fu&&this.Nu(this.Ou,e)&&(this.Lu(this.Ou),t=!0),t}Nu(e,t){if(!e.fromCache||!this.vu())return!0;const r=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Mu(e){if(e.docChanges.length>0)return!0;const t=this.Ou&&this.Ou.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Lu(e){e=Hr.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Fu=!0,this.Cu.next(e)}vu(){return this.options.source!==Dl.Cache}}/**
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
 */class rm{constructor(e){this.serializer=e}Qo(e){return Ht(this.serializer,e)}Go(e){return e.metadata.exists?Dc(this.serializer,e.document,!1):ge.newNoDocument(this.Qo(e.metadata.name),this.zo(e.metadata.readTime))}zo(e){return Ve(e)}}class nd{constructor(e,t){this.Bu=e,this.serializer=t,this.Uu=[],this.ku=[],this.collectionGroups=new Set,this.progress=Gy(e)}get queries(){return this.Uu}get documents(){return this.ku}qu(e){this.progress.bytesLoaded+=e.byteLength;let t=this.progress.documentsLoaded;if(e.jo.namedQuery)this.Uu.push(e.jo.namedQuery);else if(e.jo.documentMetadata){this.ku.push({metadata:e.jo.documentMetadata}),e.jo.documentMetadata.exists||++t;const r=X.fromString(e.jo.documentMetadata.name);this.collectionGroups.add(r.get(r.length-2))}else e.jo.document&&(this.ku[this.ku.length-1].document=e.jo.document,++t);return t!==this.progress.documentsLoaded?(this.progress.documentsLoaded=t,{...this.progress}):null}$u(e){const t=new Map,r=new rm(this.serializer);for(const i of e)if(i.metadata.queries){const s=r.Qo(i.metadata.name);for(const o of i.metadata.queries){const c=(t.get(o)||J()).add(s);t.set(o,c)}}return t}async Ku(e){const t=await cb(e,new rm(this.serializer),this.ku,this.Bu.id),r=this.$u(this.documents);for(const i of this.Uu)await ub(e,i,r.get(i.name));return this.progress.taskState="Success",{progress:this.progress,Wu:this.collectionGroups,Qu:t}}}function Gy(n){return{taskState:"Running",documentsLoaded:0,bytesLoaded:0,totalDocuments:n.totalDocuments,totalBytes:n.totalBytes}}/**
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
 */class Wy{constructor(e){this.key=e}}class Ky{constructor(e){this.key=e}}class Hy{constructor(e,t){this.query=e,this.Gu=t,this.zu=null,this.hasCachedResults=!1,this.current=!1,this.ju=J(),this.mutatedKeys=J(),this.Hu=Te(e)?lc(e):Nc(e),this.Ju=new Wn(this.Hu)}get Yu(){return this.Gu}Zu(e,t){const r=t?t.Xu:new tm,i=t?t.Ju:this.Ju;let s=t?t.mutatedKeys:this.mutatedKeys,o=i,c=!1;const[u,l]=this.ec(this.query,i);e.inorderTraversal(((p,m)=>{const I=i.get(p),P=Ty(this.query,m)?m:null,x=!!I&&this.mutatedKeys.has(I.key),D=!!P&&(P.hasLocalMutations||this.mutatedKeys.has(P.key)&&P.hasCommittedMutations);let $=!1;I&&P?I.data.isEqual(P.data)?x!==D&&(r.track({type:3,doc:P}),$=!0):this.tc(I,P)||(r.track({type:2,doc:P}),$=!0,(u&&this.Hu(P,u)>0||l&&this.Hu(P,l)<0)&&(c=!0)):!I&&P?(r.track({type:0,doc:P}),$=!0):I&&!P&&(r.track({type:1,doc:I}),$=!0,(u||l)&&(c=!0)),$&&(P?(o=o.add(P),s=D?s.add(p):s.delete(p)):(o=o.delete(p),s=s.delete(p)))}));const d=this.nc(this.query);if(d)if(Te(this.query)){const p=[];o.forEach((P=>p.push(P)));const m=wy(this.query,p);let I=new Wn(lc(this.query));for(const P of m)I=I.add(P);o.forEach((P=>{I.has(P.key)||(s=s.delete(P.key),r.track({type:1,doc:P}))})),o=I}else{const p=this.rc(this.query);for(;o.size>d;){const m=p==="F"?o.last():o.first();o=o.delete(m.key),s=s.delete(m.key),r.track({type:1,doc:m})}}return{Ju:o,Xu:r,Fo:c,mutatedKeys:s}}nc(e){var t;return Te(e)?(t=qu(e))==null?void 0:t.limit:e.limit||void 0}rc(e){if(Te(e)){const t=qu(e);return t&&t.limit<0?"L":"F"}return e.limitType}ec(e,t){var r;if(Te(e)){const i=(r=qu(e))==null?void 0:r.limit;return[t.size===i?t.last():null,null]}return[e.limitType==="F"&&t.size===this.nc(this.query)?t.last():null,e.limitType==="L"&&t.size===this.nc(this.query)?t.first():null]}tc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,i){const s=this.Ju;this.Ju=e.Ju,this.mutatedKeys=e.mutatedKeys;const o=e.Xu.gu();o.sort(((d,p)=>(function(I,P){const x=D=>{switch(D){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return j(20277,{ye:D})}};return x(I)-x(P)})(d.type,p.type)||this.Hu(d.doc,p.doc))),this.sc(r),i=i??!1;const c=t&&!i?this._c():[],u=this.ju.size===0&&this.current&&!i?1:0,l=u!==this.zu;return this.zu=u,o.length!==0||l?{snapshot:new Hr(this.query,e.Ju,s,o,e.mutatedKeys,u===0,l,!1,!!r&&r.resumeToken.approximateByteSize()>0),oc:c}:{oc:c}}Du(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ju:this.Ju,Xu:new tm,mutatedKeys:this.mutatedKeys,Fo:!1},!1)):{oc:[]}}ac(e){return!this.Gu.has(e)&&!!this.Ju.has(e)&&!this.Ju.get(e).hasLocalMutations}sc(e){e&&(e.addedDocuments.forEach((t=>this.Gu=this.Gu.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.Gu=this.Gu.delete(t))),this.current=e.current)}_c(){if(!this.current)return[];const e=this.ju;this.ju=J(),this.Ju.forEach((r=>{this.ac(r.key)&&(this.ju=this.ju.add(r.key))}));const t=[];return e.forEach((r=>{this.ju.has(r)||t.push(new Ky(r))})),this.ju.forEach((r=>{e.has(r)||t.push(new Wy(r))})),t}uc(e){this.Gu=e.Wo,this.ju=J();const t=this.Zu(e.documents);return this.applyChanges(t,!0)}cc(){return Hr.fromInitialDocuments(this.query,this.Ju,this.mutatedKeys,this.zu===0,this.hasCachedResults)}}const mr="SyncEngine";class Cb{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class Nb{constructor(e){this.key=e,this.lc=!1}}class Db{constructor(e,t,r,i,s,o){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=o,this.Ec={},this.hc=new vn((c=>ry(c)),Bc),this.Tc=new Map,this.Pc=new Set,this.Rc=new de(F.comparator),this.Ic=new Map,this.Ac=new qh,this.Vc={},this.dc=new Map,this.fc=yn.ws(),this.onlineState="Unknown",this.mc=void 0}get isPrimaryClient(){return this.mc===!0}}async function kb(n,e,t=!0){const r=Xc(n);let i;const s=r.hc.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.cc()):i=await Qy(r,e,t,!0),i}async function xb(n,e){const t=Xc(n);await Qy(t,e,!0,!1)}async function Qy(n,e,t,r){const i=await Wi(n.localStore,Te(e)?e:Ze(e)),s=i.targetId,o=n.sharedClientState.addLocalQueryTarget(s,t);let c;return r&&(c=await rd(n,e,s,o==="current",i.resumeToken)),n.isPrimaryClient&&t&&Jc(n.remoteStore,i),c}async function rd(n,e,t,r,i){n.gc=(p,m,I)=>(async function(x,D,$,G){let z=D.view.Zu($);z.Fo&&(z=await dc(x.localStore,D.query,!1).then((({documents:w})=>D.view.Zu(w,z))));const Y=G&&G.targetChanges.get(D.targetId),ee=G&&G.targetMismatches.get(D.targetId)!=null,re=D.view.applyChanges(z,x.isPrimaryClient,Y,ee);return kl(x,D.targetId,re.oc),re.snapshot})(n,p,m,I);const s=await dc(n.localStore,e,!0),o=new Hy(e,s.Wo),c=o.Zu(s.documents),u=$o.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",i),l=o.applyChanges(c,n.isPrimaryClient,u);kl(n,t,l.oc);const d=new Cb(e,t,o);return n.hc.set(e,d),n.Tc.has(t)?n.Tc.get(t).push(e):n.Tc.set(t,[e]),l.snapshot}async function Ob(n,e,t){const r=B(n),i=r.hc.get(e),s=r.Tc.get(i.targetId);if(s.length>1)return r.Tc.set(i.targetId,s.filter((o=>!Bc(o,e)))),void r.hc.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await Ki(r.localStore,i.targetId,!1).then((()=>{r.sharedClientState.clearQueryState(i.targetId),t&&Hi(r.remoteStore,i.targetId),Qi(r,i.targetId)})).catch(dr)):(Qi(r,i.targetId),await Ki(r.localStore,i.targetId,!0))}async function Lb(n,e){const t=B(n),r=t.hc.get(e),i=t.Tc.get(r.targetId);t.isPrimaryClient&&i.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),Hi(t.remoteStore,r.targetId))}async function Mb(n,e,t){const r=ad(n);try{const i=await(function(o,c){const u=B(o),l=oe.now(),d=c.reduce(((I,P)=>I.add(P.key)),J());let p,m;return u.persistence.runTransaction("Locally write mutations","readwrite",(I=>{let P=De(),x=J();return u.Uo.getEntries(I,d).next((D=>{P=D,P.forEach((($,G)=>{G.isValidDocument()||(x=x.add($))}))})).next((()=>u.localDocuments.getOverlayedDocuments(I,P))).next((D=>{p=D;const $=[];for(const G of c){const z=pv(G,p.get(G.key).overlayedDocument);z!=null&&$.push(new wn(G.key,z,Ng(z.value.mapValue),Ee.exists(!0)))}return u.mutationQueue.addMutationBatch(I,l,$,c)})).next((D=>{m=D;const $=D.applyToLocalDocumentSet(p,x);return u.documentOverlayCache.saveOverlays(I,D.batchId,$)}))})).then((()=>({batchId:m.batchId,changes:t_(p)})))})(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),(function(o,c,u){let l=o.Vc[o.currentUser.toKey()];l||(l=new de(Q)),l=l.insert(c,u),o.Vc[o.currentUser.toKey()]=l})(r,i.batchId,t),await An(r,i.changes),await ls(r.remoteStore)}catch(i){const s=ds(i,"Failed to persist write");t.reject(s)}}async function Jy(n,e){const t=B(n);try{const r=await ob(t.localStore,e);e.targetChanges.forEach(((i,s)=>{const o=t.Ic.get(s);o&&(L(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1,22616),i.addedDocuments.size>0?o.lc=!0:i.modifiedDocuments.size>0?L(o.lc,14607):i.removedDocuments.size>0&&(L(o.lc,42227),o.lc=!1))})),await An(t,r,e)}catch(r){await dr(r)}}function im(n,e,t){const r=B(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const i=[];r.hc.forEach(((s,o)=>{const c=o.view.Du(e);c.snapshot&&i.push(c.snapshot)})),(function(o,c){const u=B(o);u.onlineState=c;let l=!1;u.queries.forEach(((d,p)=>{for(const m of p.wu)m.Du(c)&&(l=!0)})),l&&ed(u)})(r.eventManager,e),i.length&&r.Ec.hn(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function Fb(n,e,t){const r=B(n);r.sharedClientState.updateQueryState(e,"rejected",t);const i=r.Ic.get(e),s=i&&i.key;if(s){let o=new de(F.comparator);o=o.insert(s,ge.newNoDocument(s,K.min()));const c=J().add(s),u=new os(K.min(),new Map,new de(Q),o,De(),c);await Jy(r,u),r.Rc=r.Rc.remove(s),r.Ic.delete(e),od(r)}else await Ki(r.localStore,e,!1).then((()=>Qi(r,e,t))).catch(dr)}async function Ub(n,e){const t=B(n),r=e.batch.batchId;try{const i=await sb(t.localStore,e);sd(t,r,null),id(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await An(t,i)}catch(i){await dr(i)}}async function Bb(n,e,t){const r=B(n);try{const i=await(function(o,c){const u=B(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",(l=>{let d;return u.mutationQueue.lookupMutationBatch(l,c).next((p=>(L(p!==null,37113),d=p.keys(),u.mutationQueue.removeMutationBatch(l,p)))).next((()=>u.mutationQueue.performConsistencyCheck(l))).next((()=>u.documentOverlayCache.removeOverlaysForBatchId(l,d,c))).next((()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(l,d))).next((()=>u.localDocuments.getDocuments(l,d)))}))})(r.localStore,e);sd(r,e,t),id(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await An(r,i)}catch(i){await dr(i)}}async function qb(n,e){const t=B(n);pr(t.remoteStore)||O(mr,"The network is disabled. The task returned by 'awaitPendingWrites()' will not complete until the network is enabled.");try{const r=await(function(o){const c=B(o);return c.persistence.runTransaction("Get highest unacknowledged batch id","readonly",(u=>c.mutationQueue.getHighestUnacknowledgedBatchId(u)))})(t.localStore);if(r===zn)return void e.resolve();const i=t.dc.get(r)||[];i.push(e),t.dc.set(r,i)}catch(r){const i=ds(r,"Initialization of waitForPendingWrites() operation failed");e.reject(i)}}function id(n,e){(n.dc.get(e)||[]).forEach((t=>{t.resolve()})),n.dc.delete(e)}function sd(n,e,t){const r=B(n);let i=r.Vc[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(t?s.reject(t):s.resolve(),i=i.remove(e)),r.Vc[r.currentUser.toKey()]=i}}function Qi(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Tc.get(e))n.hc.delete(r),t&&n.Ec.yc(r,t);n.Tc.delete(e),n.isPrimaryClient&&n.Ac.Xs(e).forEach((r=>{n.Ac.containsKey(r)||Yy(n,r)}))}function Yy(n,e){n.Pc.delete(e.path.canonicalString());const t=n.Rc.get(e);t!==null&&(Hi(n.remoteStore,t),n.Rc=n.Rc.remove(e),n.Ic.delete(t),od(n))}function kl(n,e,t){for(const r of t)r instanceof Wy?(n.Ac.addReference(r.key,e),$b(n,r)):r instanceof Ky?(O(mr,"Document no longer in limbo: "+r.key),n.Ac.removeReference(r.key,e),n.Ac.containsKey(r.key)||Yy(n,r.key)):j(19791,{wc:r})}function $b(n,e){const t=e.key,r=t.path.canonicalString();n.Rc.get(t)||n.Pc.has(r)||(O(mr,"New document in limbo: "+t),n.Pc.add(r),od(n))}function od(n){for(;n.Pc.size>0&&n.Rc.size<n.maxConcurrentLimboResolutions;){const e=n.Pc.values().next().value;n.Pc.delete(e);const t=new F(X.fromString(e)),r=n.fc.next();n.Ic.set(r,new Nb(t)),n.Rc=n.Rc.insert(t,r),Jc(n.remoteStore,new zt(Ze(ss(t.path)),r,"TargetPurposeLimboResolution",dt.yn))}}async function An(n,e,t){const r=B(n),i=[],s=[],o=[];r.hc.isEmpty()||(r.hc.forEach(((c,u)=>{o.push(r.gc(u,e,t).then((l=>{var d;if((l||t)&&r.isPrimaryClient){const p=l?!l.fromCache:(d=t==null?void 0:t.targetChanges.get(u.targetId))==null?void 0:d.current;r.sharedClientState.updateQueryState(u.targetId,p?"current":"not-current")}if(l){i.push(l);const p=Gh.fo(u.targetId,l);s.push(p)}})))})),await Promise.all(o),r.Ec.hn(i),await(async function(u,l){const d=B(u);try{await d.persistence.runTransaction("notifyLocalViewChanges","readwrite",(p=>R.forEach(l,(m=>R.forEach(m.Ao,(I=>d.persistence.referenceDelegate.addReference(p,m.targetId,I))).next((()=>R.forEach(m.Vo,(I=>d.persistence.referenceDelegate.removeReference(p,m.targetId,I)))))))))}catch(p){if(!fr(p))throw p;O(Wh,"Failed to update sequence numbers: "+p)}for(const p of l){const m=p.targetId;if(!p.fromCache){const I=d.No.get(m),P=I.snapshotVersion,x=I.withLastLimboFreeSnapshotVersion(P);d.No=d.No.insert(m,x)}}})(r.localStore,s))}async function jb(n,e){const t=B(n);if(!t.currentUser.isEqual(e)){O(mr,"User change. New user:",e.toKey());const r=await Vy(t.localStore,e);t.currentUser=e,(function(s,o){s.dc.forEach((c=>{c.forEach((u=>{u.reject(new k(S.CANCELLED,o))}))})),s.dc.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await An(t,r.qo)}}function zb(n,e){const t=B(n),r=t.Ic.get(e);if(r&&r.lc)return J().add(r.key);{let i=J();const s=t.Tc.get(e);if(!s)return i;for(const o of s??[]){const c=t.hc.get(o);i=i.unionWith(c.view.Yu)}return i}}async function Gb(n,e){const t=B(n),r=await dc(t.localStore,e.query,!0),i=e.view.uc(r);return t.isPrimaryClient&&kl(t,e.targetId,i.oc),i}async function Wb(n,e){const t=B(n);return Sl(t.localStore,e).then((r=>An(t,r)))}async function Kb(n,e,t,r){const i=B(n),s=await(function(c,u){const l=B(c),d=B(l.mutationQueue);return l.persistence.runTransaction("Lookup mutation documents","readonly",(p=>d.Wr(p,u).next((m=>m?l.localDocuments.getDocuments(p,m):R.resolve(null)))))})(i.localStore,e);s!==null?(t==="pending"?await ls(i.remoteStore):t==="acknowledged"||t==="rejected"?(sd(i,e,r||null),id(i,e),(function(c,u){B(B(c).mutationQueue).jr(u)})(i.localStore,e)):j(6720,"Unknown batchState",{bc:t}),await An(i,s)):O(mr,"Cannot apply mutation batch with id: "+e)}async function Hb(n,e){const t=B(n);if(Xc(t),ad(t),e===!0&&t.mc!==!0){const r=t.sharedClientState.getAllActiveQueryTargets(),i=await sm(t,r.toArray());t.mc=!0,await Cl(t.remoteStore,!0);for(const s of i)Jc(t.remoteStore,s)}else if(e===!1&&t.mc!==!1){const r=[];let i=Promise.resolve();t.Tc.forEach(((s,o)=>{t.sharedClientState.isLocalQueryTarget(o)?r.push(o):i=i.then((()=>(Qi(t,o),Ki(t.localStore,o,!0)))),Hi(t.remoteStore,o)})),await i,await sm(t,r),(function(o){const c=B(o);c.Ic.forEach(((u,l)=>{Hi(c.remoteStore,l)})),c.Ac.e_(),c.Ic=new Map,c.Rc=new de(F.comparator)})(t),t.mc=!1,await Cl(t.remoteStore,!1)}}async function sm(n,e,t){const r=B(n),i=[],s=[];for(const o of e){let c;const u=r.Tc.get(o);if(u&&u.length!==0){c=await Wi(r.localStore,Te(u[0])?u[0]:Ze(u[0]));for(const l of u){const d=r.hc.get(l),p=await Gb(r,d);p.snapshot&&s.push(p.snapshot)}}else{const l=await Dy(r.localStore,o);c=await Wi(r.localStore,l),await rd(r,Xy(l),o,!1,c.resumeToken)}i.push(c)}return r.Ec.hn(s),i}function Xy(n){return tn(n)?n:Hg(n.path,n.collectionGroup,n.orderBy,n.filters,n.limit,"F",n.startAt,n.endAt)}function Qb(n){return(function(t){return B(B(t).persistence).Ro()})(B(n).localStore)}async function Jb(n,e,t,r){const i=B(n);if(i.mc)return void O(mr,"Ignoring unexpected query state notification.");const s=i.Tc.get(e);if(s&&s.length>0)switch(t){case"current":case"not-current":{let o;if(Te(s[0]))switch(hn(s[0])){case"collection_group":case"collection":o=await Sl(i.localStore,ty(s[0]));break;case"documents":o=await(function(l,d){const p=B(l),m=J(...rc(d).map((I=>F.fromPath(I))));return p.persistence.runTransaction("Get documents for pipeline","readonly",(I=>p.Uo.getEntries(I,m))).then((I=>I))})(i.localStore,s[0]);break;default:Fe(""),o=br()}else o=await Sl(i.localStore,(function(l){return l.collectionGroup||(l.path.length%2==1?l.path.lastSegment():l.path.get(l.path.length-2))})(s[0]));const c=os.createSynthesizedRemoteEventForCurrentChange(e,t==="current",pe.EMPTY_BYTE_STRING);await An(i,o,c);break}case"rejected":await Ki(i.localStore,e,!0),Qi(i,e,r);break;default:j(64155,t)}}async function Yb(n,e,t){const r=Xc(n);if(r.mc){for(const i of e){if(r.Tc.has(i)&&r.sharedClientState.isActiveQueryTarget(i)){O(mr,"Adding an already active target "+i);continue}const s=await Dy(r.localStore,i),o=await Wi(r.localStore,s);await rd(r,Xy(s),o.targetId,!1,o.resumeToken),Jc(r.remoteStore,o)}for(const i of t)r.Tc.has(i)&&await Ki(r.localStore,i,!1).then((()=>{Hi(r.remoteStore,i),Qi(r,i)})).catch(dr)}}function Xc(n){const e=B(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Jy.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=zb.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=Fb.bind(null,e),e.Ec.hn=Sb.bind(null,e.eventManager),e.Ec.yc=Vb.bind(null,e.eventManager),e}function ad(n){const e=B(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=Ub.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=Bb.bind(null,e),e}function Xb(n,e,t){const r=B(n);(async function(s,o,c){try{const u=await o.getMetadata();if(await(function(I,P){const x=B(I),D=Ve(P.createTime);return x.persistence.runTransaction("hasNewerBundle","readonly",($=>x.d_.getBundleMetadata($,P.id))).then(($=>!!$&&$.createTime.compareTo(D)>=0))})(s.localStore,u))return await o.close(),c._completeWith((function(I){return{taskState:"Success",documentsLoaded:I.totalDocuments,bytesLoaded:I.totalBytes,totalDocuments:I.totalDocuments,totalBytes:I.totalBytes}})(u)),Promise.resolve(new Set);c._updateProgress(Gy(u));const l=new nd(u,o.serializer);let d=await o.ma();for(;d;){const m=await l.qu(d);m&&c._updateProgress(m),d=await o.ma()}const p=await l.Ku(s.localStore);return await An(s,p.Qu,void 0),await(function(I,P){const x=B(I);return x.persistence.runTransaction("Save bundle","readwrite",(D=>x.d_.saveBundleMetadata(D,P)))})(s.localStore,u),c._completeWith(p.progress),Promise.resolve(p.Wu)}catch(u){return Fe(mr,`Loading bundle failed with ${u}`),c._failWith(u),Promise.resolve(new Set)}})(r,e,t).then((i=>{r.sharedClientState.notifyBundleLoaded(i)}))}class Ji{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Zr(e.databaseInfo.databaseId),this.sharedClientState=this.vc(e),this.persistence=this.Sc(e),await this.persistence.start(),this.localStore=this.Dc(e),this.gcScheduler=this.xc(e,this.localStore),this.indexBackfillerScheduler=this.Cc(e,this.localStore)}xc(e,t){return null}Cc(e,t){return null}Dc(e){return Sy(this.persistence,new by,e.initialUser,this.serializer)}Sc(e){return new $h(Qc.w_,this.serializer)}vc(e){return new jy}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Ji.provider={build:()=>new Ji};class cd extends Ji{constructor(e){super(),this.cacheSizeBytes=e}xc(e,t){L(this.persistence.referenceDelegate instanceof hc,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new C_(r,e.asyncQueue,t)}Sc(e){const t=this.cacheSizeBytes!==void 0?Ye.withCacheSize(this.cacheSizeBytes):Ye.DEFAULT;return new $h((r=>hc.w_(r,t)),this.serializer)}}class ud extends Ji{constructor(e,t,r){super(),this.Fc=e,this.cacheSizeBytes=t,this.forceOwnership=r,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.Fc.initialize(this,e),await ad(this.Fc.syncEngine),await ls(this.Fc.remoteStore),await this.persistence.X_((()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve())))}Dc(e){return Sy(this.persistence,new by,e.initialUser,this.serializer)}xc(e,t){const r=this.persistence.referenceDelegate.garbageCollector;return new C_(r,e.asyncQueue,t)}Cc(e,t){const r=new Rb(t,this.persistence);return new Ab(e.asyncQueue,r)}Sc(e){const t=zh(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),r=this.cacheSizeBytes!==void 0?Ye.withCacheSize(this.cacheSizeBytes):Ye.DEFAULT;return new jh(this.synchronizeTabs,t,e.clientId,r,e.asyncQueue,zy(),ja(),this.serializer,this.sharedClientState,!!this.forceOwnership)}vc(e){return new jy}}class Zy extends ud{constructor(e,t){super(e,t,!1),this.Fc=e,this.cacheSizeBytes=t,this.synchronizeTabs=!0}async initialize(e){await super.initialize(e);const t=this.Fc.syncEngine;this.sharedClientState instanceof Wu&&(this.sharedClientState.syncEngine={Iu:Kb.bind(null,t),Au:Jb.bind(null,t),Vu:Yb.bind(null,t),Ro:Qb.bind(null,t),Ru:Wb.bind(null,t)},await this.sharedClientState.start()),await this.persistence.X_((async r=>{await Hb(this.Fc.syncEngine,r),this.gcScheduler&&(r&&!this.gcScheduler.started?this.gcScheduler.start():r||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(r&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():r||this.indexBackfillerScheduler.stop())}))}vc(e){const t=zy();if(!Wu.Je(t))throw new k(S.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const r=zh(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey);return new Wu(t,e.asyncQueue,r,e.clientId,e.initialUser)}}class ar{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>im(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=jb.bind(null,this.syncEngine),await Cl(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new bb})()}createDatastore(e){const t=Zr(e.databaseInfo.databaseId),r=oA(e.databaseInfo);return hA(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return(function(r,i,s,o,c){return new hb(r,i,s,o,c)})(this.localStore,this.datastore,e.asyncQueue,(t=>im(this.syncEngine,t,0)),(function(){return Ip.Je()?new Ip:new nA})())}createSyncEngine(e,t){return(function(i,s,o,c,u,l,d){const p=new Db(i,s,o,c,u,l);return d&&(p.mc=!0),p})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(i){const s=B(i);O(Xt,"RemoteStore shutting down."),s.ca.add(5),await us(s),s.Ea.shutdown(),s.ha.set("Unknown")})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}ar.provider={build:()=>new ar};/**
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
 */let Zb=class{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new k(S.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await(async function(i,s){const o=B(i),c={documents:s.map((p=>qi(o.serializer,p)))},u=await o.st("BatchGetDocuments",o.serializer.databaseId,X.emptyPath(),c,s.length),l=new Map;u.forEach((p=>{const m=$v(o.serializer,p);l.set(m.key.toString(),m)}));const d=[];return s.forEach((p=>{const m=l.get(p.toString());L(!!m,55234,{key:p}),d.push(m)})),d})(this.datastore,e);return t.forEach((r=>this.recordVersion(r))),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(r){this.lastTransactionError=r}this.writtenDocs.add(e.toString())}delete(e){this.write(new is(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach((t=>{e.delete(t.key.toString())})),e.forEach(((t,r)=>{const i=F.fromPath(r);this.mutations.push(new Xl(i,this.precondition(i)))})),await(async function(r,i){const s=B(r),o={writes:i.map((c=>To(s.serializer,c)))};await s.tt("Commit",s.serializer.databaseId,X.emptyPath(),o)})(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw j(50498,{Oc:e.constructor.name});t=K.min()}const r=this.readVersions.get(e.key.toString());if(r){if(!t.isEqual(r))throw new k(S.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(K.min())?Ee.exists(!1):Ee.updateTime(t):Ee.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(K.min()))throw new k(S.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return Ee.updateTime(t)}return Ee.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}};/**
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
 */class eS{constructor(e,t,r,i,s){this.asyncQueue=e,this.datastore=t,this.options=r,this.updateFunction=i,this.deferred=s,this.Mc=r.maxAttempts,this.jt=new ch(this.asyncQueue,"transaction_retry")}Nc(){this.Mc-=1,this.Lc()}Lc(){this.jt.Ut((async()=>{const e=new Zb(this.datastore),t=this.Bc(e);t&&t.then((r=>{this.asyncQueue.enqueueAndForget((()=>e.commit().then((()=>{this.deferred.resolve(r)})).catch((i=>{this.Uc(i)}))))})).catch((r=>{this.Uc(r)}))}))}Bc(e){try{const t=this.updateFunction(e);return!qo(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}Uc(e){this.Mc>0&&this.kc(e)?(this.Mc-=1,this.asyncQueue.enqueueAndForget((()=>(this.Lc(),Promise.resolve())))):this.deferred.reject(e)}kc(e){if((e==null?void 0:e.name)==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!Xg(t)}return!1}}/**
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
 */const cr="FirestoreClient";class tS{constructor(e,t,r,i,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=i,this.user=je.UNAUTHENTICATED,this.clientId=Rc.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,(async o=>{O(cr,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o})),this.appCheckCredentials.start(r,(o=>(O(cr,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Ge;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=ds(t,"Failed to shutdown persistence");e.reject(r)}})),e.promise}}async function Ku(n,e){n.asyncQueue.verifyOperationInProgress(),O(cr,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener((async i=>{r.isEqual(i)||(await Vy(e.localStore,i),r=i)})),e.persistence.setDatabaseDeletedListener((()=>n.terminate())),n._offlineComponents=e}async function om(n,e){n.asyncQueue.verifyOperationInProgress();const t=await ld(n);O(cr,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener((r=>Xp(e.remoteStore,r))),n.setAppCheckTokenChangeListener(((r,i)=>Xp(e.remoteStore,i))),n._onlineComponents=e}async function ld(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){O(cr,"Using user provided OfflineComponentProvider");try{await Ku(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(i){return i.name==="FirebaseError"?i.code===S.FAILED_PRECONDITION||i.code===S.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11})(t))throw t;Fe("Error using user provided cache. Falling back to memory cache: "+t),await Ku(n,new Ji)}}else O(cr,"Using default OfflineComponentProvider"),await Ku(n,new cd(void 0));return n._offlineComponents}async function Zc(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(O(cr,"Using user provided OnlineComponentProvider"),await om(n,n._uninitializedComponentsProvider._online)):(O(cr,"Using default OnlineComponentProvider"),await om(n,new ar))),n._onlineComponents}function eI(n){return ld(n).then((e=>e.persistence))}function fs(n){return ld(n).then((e=>e.localStore))}function tI(n){return Zc(n).then((e=>e.remoteStore))}function hd(n){return Zc(n).then((e=>e.syncEngine))}function nI(n){return Zc(n).then((e=>e.datastore))}async function Yi(n){const e=await Zc(n),t=e.eventManager;return t.onListen=kb.bind(null,e.syncEngine),t.onUnlisten=Ob.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=xb.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=Lb.bind(null,e.syncEngine),t}function nS(n){return n.asyncQueue.enqueue((async()=>{const e=await eI(n),t=await tI(n);return e.setNetworkEnabled(!0),(function(i){const s=B(i);return s.ca.delete(0),Yo(s)})(t)}))}function rS(n){return n.asyncQueue.enqueue((async()=>{const e=await eI(n),t=await tI(n);return e.setNetworkEnabled(!1),(async function(i){const s=B(i);s.ca.add(0),await us(s),s.ha.set("Offline")})(t)}))}function iS(n,e,t,r){const i=new Yc(r),s=new td(e,i,t);return n.asyncQueue.enqueueAndForget((async()=>Xh(await Yi(n),s))),()=>{i.Aa(),n.asyncQueue.enqueueAndForget((async()=>Zh(await Yi(n),s)))}}function sS(n,e){const t=new Ge;return n.asyncQueue.enqueueAndForget((async()=>(async function(i,s,o){try{const c=await(function(l,d){const p=B(l);return p.persistence.runTransaction("read document","readonly",(m=>p.localDocuments.getDocument(m,d)))})(i,s);c.isFoundDocument()?o.resolve(c):c.isNoDocument()?o.resolve(null):o.reject(new k(S.UNAVAILABLE,"Failed to get document from cache. (However, this document may exist on the server. Run again without setting 'source' in the GetOptions to attempt to retrieve the document from the server.)"))}catch(c){const u=ds(c,`Failed to get document '${s} from cache`);o.reject(u)}})(await fs(n),e,t))),t.promise}function rI(n,e,t={}){const r=new Ge;return n.asyncQueue.enqueueAndForget((async()=>(function(s,o,c,u,l){const d=new Yc({next:m=>{d.Aa(),o.enqueueAndForget((()=>Zh(s,p)));const I=m.docs.has(c);!I&&m.fromCache?l.reject(new k(S.UNAVAILABLE,"Failed to get document because the client is offline.")):I&&m.fromCache&&u&&u.source==="server"?l.reject(new k(S.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):l.resolve(m)},error:m=>l.reject(m)}),p=new td(ss(c.path),d,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return Xh(s,p)})(await Yi(n),n.asyncQueue,e,t,r))),r.promise}function oS(n,e){const t=new Ge;return n.asyncQueue.enqueueAndForget((async()=>(async function(i,s,o){try{const c=await dc(i,s,!0),u=new Hy(s,c.Wo),l=u.Zu(c.documents),d=u.applyChanges(l,!1);o.resolve(d.snapshot)}catch(c){const u=ds(c,`Failed to execute query '${s} against cache`);o.reject(u)}})(await fs(n),e,t))),t.promise}function iI(n,e,t={}){const r=new Ge;return n.asyncQueue.enqueueAndForget((async()=>(function(s,o,c,u,l){const d=new Yc({next:m=>{d.Aa(),o.enqueueAndForget((()=>Zh(s,p))),m.fromCache&&u.source==="server"?l.reject(new k(S.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):l.resolve(m)},error:m=>l.reject(m)}),p=new td(c instanceof io?nP(c):c,d,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return Xh(s,p)})(await Yi(n),n.asyncQueue,e,t,r))),r.promise}function aS(n,e,t){const r=new Ge;return n.asyncQueue.enqueueAndForget((async()=>{try{const i=await nI(n);r.resolve((async function(o,c,u){var x;const l=B(o),{request:d,ve:p,parent:m}=d_(l.serializer,Qg(c),u);l.connection.Ye||delete d.parent;const I=(await l.st("RunAggregationQuery",l.serializer.databaseId,m,d,1)).filter((D=>!!D.result));L(I.length===1,64727);const P=(x=I[0].result)==null?void 0:x.aggregateFields;return Object.keys(P).reduce(((D,$)=>(D[p[$]]=P[$],D)),{})})(i,e,t))}catch(i){r.reject(i)}})),r.promise}function cS(n,e){const t=new Ge;return n.asyncQueue.enqueueAndForget((async()=>Mb(await hd(n),e,t))),t.promise}function uS(n,e){const t=new Yc(e);return n.asyncQueue.enqueueAndForget((async()=>(function(i,s){B(i).Su.add(s),s.next()})(await Yi(n),t))),()=>{t.Aa(),n.asyncQueue.enqueueAndForget((async()=>(function(i,s){B(i).Su.delete(s)})(await Yi(n),t)))}}function lS(n,e,t){const r=new Ge;return n.asyncQueue.enqueueAndForget((async()=>{const i=await nI(n);new eS(n.asyncQueue,i,t,e,r).Nc()})),r.promise}function hS(n,e,t,r){const i=(function(o,c){let u;return u=typeof o=="string"?r_().encode(o):o,(function(d,p){return new Tb(d,p)})((function(d,p){if(d instanceof Uint8Array)return Yp(d,p);if(d instanceof ArrayBuffer)return Yp(new Uint8Array(d),p);if(d instanceof ReadableStream)return d.getReader();throw new Error("Source of `toByteStreamReader` has to be a ArrayBuffer or ReadableStream")})(u),c)})(t,Zr(e));n.asyncQueue.enqueueAndForget((async()=>{Xb(await hd(n),i,r)}))}function dS(n,e){return n.asyncQueue.enqueue((async()=>(function(r,i){const s=B(r);return s.persistence.runTransaction("Get named query","readonly",(o=>s.d_.getNamedQuery(o,i)))})(await fs(n),e)))}function sI(n,e){return(function(r,i){return new vb(r,i)})(n,e)}function fS(n,e){return n.asyncQueue.enqueue((async()=>(async function(r,i){const s=B(r),o=s.indexManager,c=[];return s.persistence.runTransaction("Configure indexes","readwrite",(u=>o.getFieldIndexes(u).next((l=>(function(p,m,I,P,x){p=[...p],m=[...m],p.sort(I),m.sort(I);const D=p.length,$=m.length;let G=0,z=0;for(;G<$&&z<D;){const Y=I(p[z],m[G]);Y<0?x(p[z++]):Y>0?P(m[G++]):(G++,z++)}for(;G<$;)P(m[G++]);for(;z<D;)x(p[z++])})(l,i,Tv,(d=>{c.push(o.addFieldIndex(u,d))}),(d=>{c.push(o.deleteFieldIndex(u,d))})))).next((()=>R.waitFor(c)))))})(await fs(n),e)))}function pS(n,e){return n.asyncQueue.enqueue((async()=>(function(r,i){B(r).Mo.po=i})(await fs(n),e)))}function mS(n){return n.asyncQueue.enqueue((async()=>(function(t){const r=B(t),i=r.indexManager;return r.persistence.runTransaction("Delete All Indexes","readwrite",(s=>i.deleteAllFieldIndexes(s)))})(await fs(n))))}/**
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
 */const am="AsyncQueue";class cm{constructor(e=Promise.resolve()){this.Wc=[],this.Qc=!1,this.Gc=[],this.zc=null,this.jc=!1,this.Hc=!1,this.Jc=[],this.jt=new ch(this,"async_queue_retry"),this.Yc=()=>{const r=ja();r&&O(am,"Visibility state changed to "+r.visibilityState),this.jt.qt()},this.Zc=e;const t=ja();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Yc)}get isShuttingDown(){return this.Qc}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Xc(),this.el(e)}enterRestrictedMode(e){if(!this.Qc){this.Qc=!0,this.Hc=e||!1;const t=ja();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Yc)}}enqueue(e){if(this.Xc(),this.Qc)return new Promise((()=>{}));const t=new Ge;return this.el((()=>this.Qc&&this.Hc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.Wc.push(e),this.tl())))}async tl(){if(this.Wc.length!==0){try{await this.Wc[0](),this.Wc.shift(),this.jt.reset()}catch(e){if(!fr(e))throw e;O(am,"Operation failed with retryable error: "+e)}this.Wc.length>0&&this.jt.Ut((()=>this.tl()))}}el(e){const t=this.Zc.then((()=>(this.jc=!0,e().catch((r=>{throw this.zc=r,this.jc=!1,be("INTERNAL UNHANDLED ERROR: ",um(r)),r})).then((r=>(this.jc=!1,r))))));return this.Zc=t,t}enqueueAfterDelay(e,t,r){this.Xc(),this.Jc.indexOf(e)>-1&&(t=0);const i=Jh.createAndSchedule(this,e,t,r,(s=>this.nl(s)));return this.Gc.push(i),i}Xc(){this.zc&&j(47125,{rl:um(this.zc)})}verifyOperationInProgress(){}async il(){let e;do e=this.Zc,await e;while(e!==this.Zc)}sl(e){for(const t of this.Gc)if(t.timerId===e)return!0;return!1}_l(e){return this.il().then((()=>{this.Gc.sort(((t,r)=>t.targetTimeMs-r.targetTimeMs));for(const t of this.Gc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.il()}))}ol(e){this.Jc.push(e)}nl(e){const t=this.Gc.indexOf(e);this.Gc.splice(t,1)}}function um(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}/**
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
 */class oI{constructor(){this._progressObserver={},this._taskCompletionResolver=new Ge,this._lastProgress={taskState:"Running",totalBytes:0,totalDocuments:0,bytesLoaded:0,documentsLoaded:0}}onProgress(e,t,r){this._progressObserver={next:e,error:t,complete:r}}catch(e){return this._taskCompletionResolver.promise.catch(e)}then(e,t){return this._taskCompletionResolver.promise.then(e,t)}_completeWith(e){this._updateProgress(e),this._progressObserver.complete&&this._progressObserver.complete(),this._taskCompletionResolver.resolve(e)}_failWith(e){this._lastProgress.taskState="Error",this._progressObserver.next&&this._progressObserver.next(this._lastProgress),this._progressObserver.error&&this._progressObserver.error(e),this._taskCompletionResolver.reject(e)}_updateProgress(e){this._lastProgress=e,this._progressObserver.next&&this._progressObserver.next(e)}}/**
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
 */const gS=-1;class le extends jo{constructor(e,t,r,i){super(e,t,r,i),this.type="firestore",this._queue=new cm,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new cm(e),this._firestoreClient=void 0,await e}}}function _S(n,e,t){t||(t=Io);const r=Jr(n,"firestore");if(r.isInitialized(t)){const i=r.getImmediate({identifier:t}),s=r.getOptions(t);if(kt(s,e))return i;throw new k(S.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new k(S.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<V_)throw new k(S.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&ur(e.host)&&vc(e.host),r.initialize({options:e,instanceIdentifier:t})}function yS(n,e){const t=typeof n=="object"?n:Ac(),r=typeof n=="string"?n:e||Io,i=Jr(t,"firestore").getImmediate({identifier:r});if(!i._initialized){const s=Km("firestore");s&&k_(i,...s)}return i}function we(n){if(n._terminated)throw new k(S.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||aI(n),n._firestoreClient}function aI(n){var r,i,s,o;const e=n._freezeSettings(),t=fA(n._databaseId,((r=n._app)==null?void 0:r.options.appId)||"",n._persistenceKey,(i=n._app)==null?void 0:i.options.apiKey,e);n._componentsProvider||(s=e.localCache)!=null&&s._offlineComponentProvider&&((o=e.localCache)!=null&&o._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new tS(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&(function(u){const l=u==null?void 0:u._online.build();return{_offline:u==null?void 0:u._offline.build(l),_online:l}})(n._componentsProvider))}function IS(n,e){Fe("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const t=n._freezeSettings();return cI(n,ar.provider,{build:r=>new ud(r,t.cacheSizeBytes,e==null?void 0:e.forceOwnership)}),Promise.resolve()}async function ES(n){Fe("enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const e=n._freezeSettings();cI(n,ar.provider,{build:t=>new Zy(t,e.cacheSizeBytes)})}function cI(n,e,t){if((n=te(n,le))._firestoreClient||n._terminated)throw new k(S.FAILED_PRECONDITION,"Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.");if(n._componentsProvider||n._getSettings().localCache)throw new k(S.FAILED_PRECONDITION,"SDK cache is already specified.");n._componentsProvider={_online:e,_offline:t},aI(n)}function wS(n){if(n._initialized&&!n._terminated)throw new k(S.FAILED_PRECONDITION,"Persistence can only be cleared before a Firestore instance is initialized or after it is terminated.");const e=new Ge;return n._queue.enqueueAndForgetEvenWhileRestricted((async()=>{try{await(async function(r){if(!Qt.Je())return Promise.resolve();const i=r+Py;await Qt.delete(i)})(zh(n._databaseId,n._persistenceKey)),e.resolve()}catch(t){e.reject(t)}})),e.promise}function TS(n){return(function(t){const r=new Ge;return t.asyncQueue.enqueueAndForget((async()=>qb(await hd(t),r))),r.promise})(we(n=te(n,le)))}function vS(n){return nS(we(n=te(n,le)))}function AS(n){return rS(we(n=te(n,le)))}function RS(n){return ig(n.app,"firestore",n._databaseId.database),n._delete()}function xl(n,e){const t=we(n=te(n,le)),r=new oI;return hS(t,n._databaseId,e,r),r}function uI(n,e){return dS(we(n=te(n,le)),e).then((t=>t?new Ue(n,null,t.query):null))}/**
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
 */class dd{convertValue(e,t="none"){switch(xe(e)){case 0:return null;case 1:return e.booleanValue;case 2:return fe(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(gn(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw j(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return hr(e,((i,s)=>{r[i]=this.convertValue(s,t)})),r}convertVectorValue(e){var r,i,s;const t=(s=(i=(r=e.fields)==null?void 0:r[Br].arrayValue)==null?void 0:i.values)==null?void 0:s.map((o=>fe(o.doubleValue)));return new ot(t)}convertGeoPoint(e){return new Nt(fe(e.latitude),fe(e.longitude))}convertArray(e,t){return(e.values||[]).map((r=>this.convertValue(r,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Bo(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Ci(e));default:return null}}convertTimestamp(e){const t=mn(e);return new oe(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=X.fromString(e);L(__(r),9688,{name:e});const i=new Zn(r.get(1),r.get(3)),s=new F(r.popFirst(5));return i.isEqual(t)||be(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
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
 */class gr extends dd{constructor(e){super(),this.firestore=e}convertBytes(e){return new ut(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new ae(this.firestore,null,t)}}/**
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
 */function PS(n){var r;const e=we(te(n.firestore,le)),t=(r=e._onlineComponents)==null?void 0:r.datastore.serializer;return t===void 0?null:kc(t,Ze(n._query)).be}function bS(n,e){var s;const t=Wl(e,((o,c)=>new Fg(c,o.aggregateType,o._internalFieldPath))),r=we(te(n.firestore,le)),i=(s=r._onlineComponents)==null?void 0:s.datastore.serializer;return i===void 0?null:d_(i,Qg(n._query),t,!0).request}/**
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
 */function vi(n){return(function(t,r){if(typeof t!="object"||t===null)return!1;const i=t;for(const s of r)if(s in i&&typeof i[s]=="function")return!0;return!1})(n,["next","error","complete"])}const lm="@firebase/firestore",hm="4.17.0";/**
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
 */class Xi{constructor(e="count",t){this._internalFieldPath=t,this.type="AggregateField",this.aggregateType=e}}class lI{constructor(e,t,r){this._userDataWriter=t,this._data=r,this.type="AggregateQuerySnapshot",this.query=e}data(){return this._userDataWriter.convertObjectMap(this._data)}_fieldsProto(){return new Le({mapValue:{fields:this._data}}).clone().value.mapValue.fields}}/**
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
 */let Do=class{constructor(e,t,r,i,s){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new ae(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new SS(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(xt("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}},SS=class extends Do{data(){return super.data()}};/**
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
 */function hI(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new k(S.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class fd{}class ps extends fd{}function VS(n,e,...t){let r=[];e instanceof fd&&r.push(e),r=r.concat(t),(function(s){const o=s.filter((u=>u instanceof si)).length,c=s.filter((u=>u instanceof ms)).length;if(o>1||o>0&&c>0)throw new k(S.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(r);for(const i of r)n=i._apply(n);return n}class ms extends ps{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new ms(e,t,r)}_apply(e){const t=this._parse(e);return fI(e._query,t),new Ue(e.firestore,e.converter,fl(e._query,t))}_parse(e){const t=ti(e.firestore);return(function(s,o,c,u,l,d,p){let m;if(l.isKeyField()){if(d==="array-contains"||d==="array-contains-any")throw new k(S.INVALID_ARGUMENT,`Invalid Query. You can't perform '${d}' queries on documentId().`);if(d==="in"||d==="not-in"){fm(p,d);const P=[];for(const x of p)P.push(dm(u,s,x));m={arrayValue:{values:P}}}else m=dm(u,s,p)}else d!=="in"&&d!=="not-in"&&d!=="array-contains-any"||fm(p,d),m=F_(c,o,p,d==="in"||d==="not-in");return ie.create(l,d,m)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function CS(n,e,t){const r=e,i=xt("where",n);return ms._create(i,r,t)}class si extends fd{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new si(e,t)}_parse(e){const t=this._queryConstraints.map((r=>r._parse(e))).filter((r=>r.getFilters().length>0));return t.length===1?t[0]:ue.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(i,s){let o=i;const c=s.getFlattenedFilters();for(const u of c)fI(o,u),o=fl(o,u)})(e._query,t),new Ue(e.firestore,e.converter,fl(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function NS(...n){return n.forEach((e=>pI("or",e))),si._create("or",n)}function DS(...n){return n.forEach((e=>pI("and",e))),si._create("and",n)}class eu extends ps{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new eu(e,t)}_apply(e){const t=(function(i,s,o){if(i.startAt!==null)throw new k(S.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(i.endAt!==null)throw new k(S.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new wo(s,o)})(e._query,this._field,this._direction);return new Ue(e.firestore,e.converter,Pv(e._query,t))}}function kS(n,e="asc"){const t=e,r=xt("orderBy",n);return eu._create(r,t)}class Xo extends ps{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new Xo(e,t,r)}_apply(e){return new Ue(e.firestore,e.converter,ec(e._query,this._limit,this._limitType))}}function xS(n){return wg("limit",n),Xo._create("limit",n,"F")}function OS(n){return wg("limitToLast",n),Xo._create("limitToLast",n,"L")}class Zo extends ps{constructor(e,t,r){super(),this.type=e,this._docOrFields=t,this._inclusive=r}static _create(e,t,r){return new Zo(e,t,r)}_apply(e){const t=dI(e,this.type,this._docOrFields,this._inclusive);return new Ue(e.firestore,e.converter,bv(e._query,t))}}function LS(...n){return Zo._create("startAt",n,!0)}function MS(...n){return Zo._create("startAfter",n,!1)}class ea extends ps{constructor(e,t,r){super(),this.type=e,this._docOrFields=t,this._inclusive=r}static _create(e,t,r){return new ea(e,t,r)}_apply(e){const t=dI(e,this.type,this._docOrFields,this._inclusive);return new Ue(e.firestore,e.converter,Sv(e._query,t))}}function FS(...n){return ea._create("endBefore",n,!1)}function US(...n){return ea._create("endAt",n,!0)}function dI(n,e,t,r){if(t[0]=W(t[0]),t[0]instanceof Do)return(function(s,o,c,u,l){if(!u)throw new k(S.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${c}().`);const d=[];for(const p of wi(s))if(p.field.isKeyField())d.push(qr(o,u.key));else{const m=u.data.field(p.field);if(Uo(m))throw new k(S.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+p.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(m===null){const I=p.field.canonicalString();throw new k(S.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${I}' (used as the orderBy) does not exist.`)}d.push(m)}return new nr(d,l)})(n._query,n.firestore._databaseId,e,t[0]._document,r);{const i=ti(n.firestore);return(function(o,c,u,l,d,p){const m=o.explicitOrderBy;if(d.length>m.length)throw new k(S.INVALID_ARGUMENT,`Too many arguments provided to ${l}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const I=[];for(let P=0;P<d.length;P++){const x=d[P];if(m[P].field.isKeyField()){if(typeof x!="string")throw new k(S.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${l}(), but got a ${typeof x}`);if(!rh(o)&&x.indexOf("/")!==-1)throw new k(S.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${l}() must be a plain document ID, but '${x}' contains a slash.`);const D=o.path.child(X.fromString(x));if(!F.isDocumentKey(D))throw new k(S.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${l}() must result in a valid document path, but '${D}' is not because it contains an odd number of segments.`);const $=new F(D);I.push(qr(c,$))}else{const D=F_(u,l,x);I.push(D)}}return new nr(I,p)})(n._query,n.firestore._databaseId,i,e,t,r)}}function dm(n,e,t){if(typeof(t=W(t))=="string"){if(t==="")throw new k(S.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!rh(e)&&t.indexOf("/")!==-1)throw new k(S.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(X.fromString(t));if(!F.isDocumentKey(r))throw new k(S.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return qr(n,new F(r))}if(t instanceof ae)return qr(n,t._key);throw new k(S.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Pc(t)}.`)}function fm(n,e){if(!Array.isArray(n)||n.length===0)throw new k(S.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function fI(n,e){const t=(function(i,s){for(const o of i)for(const c of o.getFlattenedFilters())if(s.indexOf(c.op)>=0)return c.op;return null})(n.filters,(function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new k(S.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new k(S.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function pI(n,e){if(!(e instanceof ms||e instanceof si))throw new k(S.INVALID_ARGUMENT,`Function ${n}() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'.`)}function tu(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class pd extends dd{constructor(e){super(),this.firestore=e}convertBytes(e){return new ut(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new ae(this.firestore,null,t)}}/**
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
 */function BS(n){return new Xi("sum",xt("sum",n))}function qS(n){return new Xi("avg",xt("average",n))}function mI(){return new Xi("count")}function $S(n,e){var t,r;return n instanceof Xi&&e instanceof Xi&&n.aggregateType===e.aggregateType&&((t=n._internalFieldPath)==null?void 0:t.canonicalString())===((r=e._internalFieldPath)==null?void 0:r.canonicalString())}function jS(n,e){return lh(n.query,e.query)&&kt(n.data(),e.data())}/**
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
 */function zS(n){return gI(n,{count:mI()})}function gI(n,e){const t=te(n.firestore,le),r=we(t),i=Wl(e,((s,o)=>new Fg(o,s.aggregateType,s._internalFieldPath)));return aS(r,n._query,i).then((s=>(function(c,u,l){const d=new gr(c);return new lI(u,d,l)})(t,n,s)))}class GS{constructor(e){this.kind="memory",this._onlineComponentProvider=ar.provider,this._offlineComponentProvider=e!=null&&e.garbageCollector?e.garbageCollector._offlineComponentProvider:{build:()=>new cd(void 0)}}toJSON(){return{kind:this.kind}}}class WS{constructor(e){let t;this.kind="persistent",e!=null&&e.tabManager?(e.tabManager._initialize(e),t=e.tabManager):(t=_I(void 0),t._initialize(e)),this._onlineComponentProvider=t._onlineComponentProvider,this._offlineComponentProvider=t._offlineComponentProvider}toJSON(){return{kind:this.kind}}}class KS{constructor(){this.kind="memoryEager",this._offlineComponentProvider=Ji.provider}toJSON(){return{kind:this.kind}}}class HS{constructor(e){this.kind="memoryLru",this._offlineComponentProvider={build:()=>new cd(e)}}toJSON(){return{kind:this.kind}}}function QS(){return new KS}function JS(n){return new HS(n==null?void 0:n.cacheSizeBytes)}function YS(n){return new GS(n)}function XS(n){return new WS(n)}class ZS{constructor(e){this.forceOwnership=e,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=ar.provider,this._offlineComponentProvider={build:t=>new ud(t,e==null?void 0:e.cacheSizeBytes,this.forceOwnership)}}}class eV{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=ar.provider,this._offlineComponentProvider={build:t=>new Zy(t,e==null?void 0:e.cacheSizeBytes)}}}function _I(n){return new ZS(n==null?void 0:n.forceOwnership)}function tV(){return new eV}/**
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
 */const yI="NOT SUPPORTED";class cn{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class ft extends Do{constructor(e,t,r,i,s,o){super(e,t,r,i,o),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new lo(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(xt("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new k(S.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=ft._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}function nV(n,e,t){if(Yr(e,ft._jsonSchema)){if(e.bundle===yI)throw new k(S.INVALID_ARGUMENT,"The provided JSON object was created in a client environment, which is not supported.");const r=Zr(n._databaseId),i=sI(e.bundle,r),s=i.va(),o=new nd(i.getMetadata(),r);for(const d of s)o.qu(d);const c=o.documents;if(c.length!==1)throw new k(S.INVALID_ARGUMENT,`Expected bundle data to contain 1 document, but it contains ${c.length} documents.`);const u=Dc(r,c[0].document),l=new F(X.fromString(e.bundleName));return new ft(n,new pd(n),l,u,new cn(!1,!1),t||null)}}ft._jsonSchemaVersion="firestore/documentSnapshot/1.0",ft._jsonSchema={type:ke("string",ft._jsonSchemaVersion),bundleSource:ke("string","DocumentSnapshot"),bundleName:ke("string"),bundle:ke("string")};class lo extends ft{data(e={}){return super.data(e)}}class pt{constructor(e,t,r,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new cn(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((r=>{e.call(t,new lo(this._firestore,this._userDataWriter,r.key,r,new cn(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new k(S.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(i,s){if(i._snapshot.oldDocs.isEmpty()){let o=0;return i._snapshot.docChanges.map((c=>{Te(i._snapshot.query)?lc(i._snapshot.query):Nc(i.query._query);const u=new lo(i._firestore,i._userDataWriter,c.doc.key,c.doc,new cn(i._snapshot.mutatedKeys.has(c.doc.key),i._snapshot.fromCache),i.query.converter);return c.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}}))}{let o=i._snapshot.oldDocs;return i._snapshot.docChanges.filter((c=>s||c.type!==3)).map((c=>{const u=new lo(i._firestore,i._userDataWriter,c.doc.key,c.doc,new cn(i._snapshot.mutatedKeys.has(c.doc.key),i._snapshot.fromCache),i.query.converter);let l=-1,d=-1;return c.type!==0&&(l=o.indexOf(c.doc.key),o=o.delete(c.doc.key)),c.type!==1&&(o=o.add(c.doc),d=o.indexOf(c.doc.key)),{type:iV(c.type),doc:u,oldIndex:l,newIndex:d}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new k(S.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=pt._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Rc.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],i=[];return this.docs.forEach((s=>{s._document!==null&&(t.push(s._document),r.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),i.push(s.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function rV(n,e,t){if(Yr(e,pt._jsonSchema)){if(e.bundle===yI)throw new k(S.INVALID_ARGUMENT,"The provided JSON object was created in a client environment, which is not supported.");const r=Zr(n._databaseId),i=sI(e.bundle,r),s=i.va(),o=new nd(i.getMetadata(),r);for(const I of s)o.qu(I);if(o.queries.length!==1)throw new k(S.INVALID_ARGUMENT,`Snapshot data expected 1 query but found ${o.queries.length} queries.`);const c=Gc(o.queries[0].bundledQuery),u=Te(c)?lc(c):Nc(c),l=o.documents;let d=new Wn(u);l.map((I=>{const P=Dc(r,I.document);d=d.add(P)}));const p=Hr.fromInitialDocuments(c,d,J(),!1,!1),m=new Ue(n,t||null,c);return new pt(n,new pd(n),m,p)}}function iV(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return j(61501,{type:n})}}function sV(n,e){return n instanceof ft&&e instanceof ft?n._firestore===e._firestore&&n._key.isEqual(e._key)&&(n._document===null?e._document===null:n._document.isEqual(e._document))&&n._converter===e._converter:n instanceof pt&&e instanceof pt&&n._firestore===e._firestore&&lh(n.query,e.query)&&n.metadata.isEqual(e.metadata)&&n._snapshot.isEqual(e._snapshot)}/**
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
 */pt._jsonSchemaVersion="firestore/querySnapshot/1.0",pt._jsonSchema={type:ke("string",pt._jsonSchemaVersion),bundleSource:ke("string","QuerySnapshot"),bundleName:ke("string"),bundle:ke("string")};const oV={maxAttempts:5};/**
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
 */class II{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=ti(e)}set(e,t,r){this._verifyNotCommitted();const i=$n(e,this._firestore),s=tu(i.converter,t,r),o=Lc(this._dataReader,"WriteBatch.set",i._key,s,i.converter!==null,r);return this._mutations.push(o.toMutation(i._key,Ee.none())),this}update(e,t,r,...i){this._verifyNotCommitted();const s=$n(e,this._firestore);let o;return o=typeof(t=W(t))=="string"||t instanceof ei?yh(this._dataReader,"WriteBatch.update",s._key,t,r,i):_h(this._dataReader,"WriteBatch.update",s._key,t),this._mutations.push(o.toMutation(s._key,Ee.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=$n(e,this._firestore);return this._mutations=this._mutations.concat(new is(t._key,Ee.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new k(S.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function $n(n,e){if((n=W(n)).firestore!==e)throw new k(S.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
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
 */let aV=class{constructor(e,t){this._firestore=e,this._transaction=t,this._dataReader=ti(e)}get(e){const t=$n(e,this._firestore),r=new pd(this._firestore);return this._transaction.lookup([t._key]).then((i=>{if(!i||i.length!==1)return j(24041);const s=i[0];if(s.isFoundDocument())return new Do(this._firestore,r,s.key,s,t.converter);if(s.isNoDocument())return new Do(this._firestore,r,t._key,null,t.converter);throw j(18433,{doc:s})}))}set(e,t,r){const i=$n(e,this._firestore),s=tu(i.converter,t,r),o=Lc(this._dataReader,"Transaction.set",i._key,s,i.converter!==null,r);return this._transaction.set(i._key,o),this}update(e,t,r,...i){const s=$n(e,this._firestore);let o;return o=typeof(t=W(t))=="string"||t instanceof ei?yh(this._dataReader,"Transaction.update",s._key,t,r,i):_h(this._dataReader,"Transaction.update",s._key,t),this._transaction.update(s._key,o),this}delete(e){const t=$n(e,this._firestore);return this._transaction.delete(t._key),this}};/**
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
 */class EI extends aV{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=$n(e,this._firestore),r=new gr(this._firestore);return super.get(e).then((i=>new ft(this._firestore,r,t._key,i._document,new cn(!1,!1),t.converter)))}}function cV(n,e,t){n=te(n,le);const r={...oV,...t};(function(o){if(o.maxAttempts<1)throw new k(S.INVALID_ARGUMENT,"Max attempts must be at least 1")})(r);const i=we(n);return lS(i,(s=>e(new EI(n,s))),r)}/**
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
 */function uV(n){n=te(n,ae);const e=te(n.firestore,le),t=we(e);return rI(t,n._key).then((r=>md(e,n,r)))}function lV(n){n=te(n,ae);const e=te(n.firestore,le),t=we(e),r=new gr(e);return sS(t,n._key).then((i=>new ft(e,r,n._key,i,new cn(i!==null&&i.hasLocalMutations,!0),n.converter)))}function hV(n){n=te(n,ae);const e=te(n.firestore,le),t=we(e);return rI(t,n._key,{source:"server"}).then((r=>md(e,n,r)))}function dV(n){n=te(n,Ue);const e=te(n.firestore,le),t=we(e),r=new gr(e);return hI(n._query),iI(t,n._query).then((i=>new pt(e,r,n,i)))}function fV(n){n=te(n,Ue);const e=te(n.firestore,le),t=we(e),r=new gr(e);return oS(t,n._query).then((i=>new pt(e,r,n,i)))}function pV(n){n=te(n,Ue);const e=te(n.firestore,le),t=we(e),r=new gr(e);return iI(t,n._query,{source:"server"}).then((i=>new pt(e,r,n,i)))}function mV(n,e,t){n=te(n,ae);const r=te(n.firestore,le),i=tu(n.converter,e,t),s=ti(r);return gs(r,[Lc(s,"setDoc",n._key,i,n.converter!==null,t).toMutation(n._key,Ee.none())])}function gV(n,e,t,...r){n=te(n,ae);const i=te(n.firestore,le),s=ti(i);let o;return o=typeof(e=W(e))=="string"||e instanceof ei?yh(s,"updateDoc",n._key,e,t,r):_h(s,"updateDoc",n._key,e),gs(i,[o.toMutation(n._key,Ee.exists(!0))])}function _V(n){return gs(te(n.firestore,le),[new is(n._key,Ee.none())])}function yV(n,e){const t=te(n.firestore,le),r=x_(n),i=tu(n.converter,e),s=ti(n.firestore);return gs(t,[Lc(s,"addDoc",r._key,i,n.converter!==null,{}).toMutation(r._key,Ee.exists(!1))]).then((()=>r))}function Ol(n,...e){var l,d,p;n=W(n);let t={includeMetadataChanges:!1,source:"default"},r=0;typeof e[r]!="object"||vi(e[r])||(t=e[r++]);const i={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(vi(e[r])){const m=e[r];e[r]=(l=m.next)==null?void 0:l.bind(m),e[r+1]=(d=m.error)==null?void 0:d.bind(m),e[r+2]=(p=m.complete)==null?void 0:p.bind(m)}let s,o,c;if(n instanceof ae)o=te(n.firestore,le),c=ss(n._key.path),s={next:m=>{e[r]&&e[r](md(o,n,m))},error:e[r+1],complete:e[r+2]};else{const m=te(n,Ue);o=te(m.firestore,le),c=m._query;const I=new gr(o);s={next:P=>{e[r]&&e[r](new pt(o,I,m,P))},error:e[r+1],complete:e[r+2]},hI(n._query)}const u=we(o);return iS(u,c,i,s)}function IV(n,e,...t){const r=W(n),i=(function(u){const l={bundle:"",bundleName:"",bundleSource:""},d=["bundle","bundleName","bundleSource"];for(const p of d){if(!(p in u)){l.error=`snapshotJson missing required field: ${p}`;break}const m=u[p];if(typeof m!="string"){l.error=`snapshotJson field '${p}' must be a string.`;break}if(m.length===0){l.error=`snapshotJson field '${p}' cannot be an empty string.`;break}p==="bundle"?l.bundle=m:p==="bundleName"?l.bundleName=m:p==="bundleSource"&&(l.bundleSource=m)}return l})(e);if(i.error)throw new k(S.INVALID_ARGUMENT,i.error);let s,o=0;if(typeof t[o]!="object"||vi(t[o])||(s=t[o++]),i.bundleSource==="QuerySnapshot"){let c=null;if(typeof t[o]=="object"&&vi(t[o])){const u=t[o++];c={next:u.next,error:u.error,complete:u.complete}}else c={next:t[o++],error:t[o++],complete:t[o++]};return(function(l,d,p,m,I){let P,x=!1;return xl(l,d.bundle).then((()=>uI(l,d.bundleName))).then(($=>{$&&!x&&(I&&$.withConverter(I),P=Ol($,p||{},m))})).catch(($=>(m.error&&m.error($),()=>{}))),()=>{x||(x=!0,P&&P())}})(r,i,s,c,t[o])}if(i.bundleSource==="DocumentSnapshot"){let c=null;if(typeof t[o]=="object"&&vi(t[o])){const u=t[o++];c={next:u.next,error:u.error,complete:u.complete}}else c={next:t[o++],error:t[o++],complete:t[o++]};return(function(l,d,p,m,I){let P,x=!1;return xl(l,d.bundle).then((()=>{if(!x){const $=new ae(l,I||null,F.fromPath(d.bundleName));P=Ol($,p||{},m)}})).catch(($=>(m.error&&m.error($),()=>{}))),()=>{x||(x=!0,P&&P())}})(r,i,s,c,t[o])}throw new k(S.INVALID_ARGUMENT,`unsupported bundle source: ${i.bundleSource}`)}function EV(n,e){n=te(n,le);const t=we(n),r=vi(e)?e:{next:e};return uS(t,r)}function gs(n,e){const t=we(n);return cS(t,e)}function md(n,e,t){const r=t.docs.get(e._key),i=new gr(n);return new ft(n,i,e._key,r,new cn(t.hasPendingWrites,t.fromCache),e.converter)}function wV(n){return n=te(n,le),we(n),new II(n,(e=>gs(n,e)))}/**
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
 */function TV(n,e){n=te(n,le);const t=we(n);if(!t._uninitializedComponentsProvider||t._uninitializedComponentsProvider._offline.kind==="memory")return Fe("Cannot enable indexes when persistence is disabled"),Promise.resolve();const r=(function(s){const o=typeof s=="string"?(function(l){try{return JSON.parse(l)}catch(d){throw new k(S.INVALID_ARGUMENT,"Failed to parse JSON: "+(d==null?void 0:d.message))}})(s):s,c=[];if(Array.isArray(o.indexes))for(const u of o.indexes){const l=pm(u,"collectionGroup"),d=[];if(Array.isArray(u.fields))for(const p of u.fields){const m=pm(p,"fieldPath"),I=Eh("setIndexConfiguration",m);p.arrayConfig==="CONTAINS"?d.push(new Lr(I,2)):p.order==="ASCENDING"?d.push(new Lr(I,0)):p.order==="DESCENDING"&&d.push(new Lr(I,1))}c.push(new Fi(Fi.UNKNOWN_ID,l,d,Ui.empty()))}return c})(e);return fS(t,r)}function pm(n,e){if(typeof n[e]!="string")throw new k(S.INVALID_ARGUMENT,"Missing string value for: "+e);return n[e]}/**
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
 */class wI{constructor(e){this._firestore=e,this.type="PersistentCacheIndexManager"}}function vV(n){var i;n=te(n,le);const e=mm.get(n);if(e)return e;if(((i=we(n)._uninitializedComponentsProvider)==null?void 0:i._offline.kind)!=="persistent")return null;const r=new wI(n);return mm.set(n,r),r}function AV(n){TI(n,!0)}function RV(n){TI(n,!1)}function PV(n){const e=we(n._firestore);mS(e).then((t=>O("deleting all persistent cache indexes succeeded"))).catch((t=>Fe("deleting all persistent cache indexes failed",t)))}function TI(n,e){const t=we(n._firestore);pS(t,e).then((r=>O(`setting persistent cache index auto creation isEnabled=${e} succeeded`))).catch((r=>Fe(`setting persistent cache index auto creation isEnabled=${e} failed`,r)))}const mm=new WeakMap;/**
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
 */class bV{constructor(){throw new Error("instances of this class should not be created")}static onExistenceFilterMismatch(e){return gd.instance.onExistenceFilterMismatch(e)}}class gd{constructor(){this.i=new Map}static get instance(){return Va||(Va=new gd,Ov(Va)),Va}Ie(e){this.i.forEach((t=>t(e)))}onExistenceFilterMismatch(e){const t=Symbol(),r=this.i;return r.set(t,e),()=>r.delete(t)}}let Va=null;(function(e,t=!0){QT(lr),Yn(new Qn("firestore",((r,{instanceIdentifier:i,options:s})=>{const o=r.getProvider("app").getImmediate(),c=new le(new Yv(r.getProvider("auth-internal")),new eA(o,r.getProvider("app-check-internal")),sv(o,i),o);return s={useFetchStreams:t,...s},c._setSettings(s),c}),"PUBLIC").setMultipleInstances(!0)),Pt(lm,hm,e),Pt(lm,hm,"esm2020")})();const Tx=Object.freeze(Object.defineProperty({__proto__:null,AbstractUserDataWriter:dd,AggregateField:Xi,AggregateQuerySnapshot:lI,Bytes:ut,CACHE_SIZE_UNLIMITED:gS,CollectionReference:Dt,DocumentReference:ae,DocumentSnapshot:ft,FieldPath:ei,FieldValue:en,Firestore:le,FirestoreError:k,GeoPoint:Nt,LoadBundleTask:oI,PersistentCacheIndexManager:wI,Query:Ue,QueryCompositeFilterConstraint:si,QueryConstraint:ps,QueryDocumentSnapshot:lo,QueryEndAtConstraint:ea,QueryFieldFilterConstraint:ms,QueryLimitConstraint:Xo,QueryOrderByConstraint:eu,QuerySnapshot:pt,QueryStartAtConstraint:Zo,SnapshotMetadata:cn,Timestamp:oe,Transaction:EI,VectorValue:ot,WriteBatch:II,_AutoId:Rc,_ByteString:pe,_DatabaseId:Zn,_DocumentKey:F,_EmptyAppCheckTokenProvider:tA,_EmptyAuthCredentialsProvider:T_,_FieldPath:Se,_TestingHooks:bV,_cast:te,_debugAssert:YT,_internalAggregationQueryToProtoRunAggregationQueryRequest:bS,_internalQueryToProtoQueryTarget:PS,_isBase64Available:nv,_logWarn:Fe,_validateIsNotUsedTogether:Eg,addDoc:yV,aggregateFieldEqual:$S,aggregateQuerySnapshotEqual:jS,and:DS,arrayRemove:VA,arrayUnion:SA,average:qS,clearIndexedDbPersistence:wS,collection:yA,collectionGroup:IA,connectFirestoreEmulator:k_,count:mI,deleteAllPersistentCacheIndexes:PV,deleteDoc:_V,deleteField:PA,disableNetwork:AS,disablePersistentCacheIndexAutoCreation:RV,doc:x_,documentId:E_,documentSnapshotFromJSON:nV,enableIndexedDbPersistence:IS,enableMultiTabIndexedDbPersistence:ES,enableNetwork:vS,enablePersistentCacheIndexAutoCreation:AV,endAt:US,endBefore:FS,ensureFirestoreConfigured:we,executeWrite:gs,getAggregateFromServer:gI,getCountFromServer:zS,getDoc:uV,getDocFromCache:lV,getDocFromServer:hV,getDocs:dV,getDocsFromCache:fV,getDocsFromServer:pV,getFirestore:yS,getPersistentCacheIndexManager:vV,increment:CA,initializeFirestore:_S,limit:xS,limitToLast:OS,loadBundle:xl,maximum:DA,memoryEagerGarbageCollector:QS,memoryLocalCache:YS,memoryLruGarbageCollector:JS,minimum:NA,namedQuery:uI,onSnapshot:Ol,onSnapshotResume:IV,onSnapshotsInSync:EV,or:NS,orderBy:kS,persistentLocalCache:XS,persistentMultipleTabManager:tV,persistentSingleTabManager:_I,query:VS,queryEqual:lh,querySnapshotFromJSON:rV,refEqual:EA,runTransaction:cV,serverTimestamp:bA,setDoc:mV,setIndexConfiguration:TV,setLogLevel:JT,snapshotEqual:sV,startAfter:MS,startAt:LS,sum:BS,terminate:RS,updateDoc:gV,vector:j_,waitForPendingWrites:TS,where:CS,writeBatch:wV},Symbol.toStringTag,{value:"Module"}));/**
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
 */const SV={PHONE:"phone",TOTP:"totp"},VV={FACEBOOK:"facebook.com",GITHUB:"github.com",GOOGLE:"google.com",PASSWORD:"password",PHONE:"phone",TWITTER:"twitter.com"},CV={EMAIL_LINK:"emailLink",EMAIL_PASSWORD:"password",FACEBOOK:"facebook.com",GITHUB:"github.com",GOOGLE:"google.com",PHONE:"phone",TWITTER:"twitter.com"},NV={LINK:"link",REAUTHENTICATE:"reauthenticate",SIGN_IN:"signIn"},DV={EMAIL_SIGNIN:"EMAIL_SIGNIN",PASSWORD_RESET:"PASSWORD_RESET",RECOVER_EMAIL:"RECOVER_EMAIL",REVERT_SECOND_FACTOR_ADDITION:"REVERT_SECOND_FACTOR_ADDITION",VERIFY_AND_CHANGE_EMAIL:"VERIFY_AND_CHANGE_EMAIL",VERIFY_EMAIL:"VERIFY_EMAIL"};/**
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
 */function kV(){return{"admin-restricted-operation":"This operation is restricted to administrators only.","argument-error":"","app-not-authorized":"This app, identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.","app-not-installed":"The requested mobile application corresponding to the identifier (Android package name or iOS bundle ID) provided is not installed on this device.","captcha-check-failed":"The reCAPTCHA response token provided is either invalid, expired, already used or the domain associated with it does not match the list of whitelisted domains.","code-expired":"The SMS code has expired. Please re-send the verification code to try again.","cordova-not-ready":"Cordova framework is not ready.","cors-unsupported":"This browser is not supported.","credential-already-in-use":"This credential is already associated with a different user account.","custom-token-mismatch":"The custom token corresponds to a different audience.","requires-recent-login":"This operation is sensitive and requires recent authentication. Log in again before retrying this request.","dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK.","dynamic-link-not-activated":"Please activate Dynamic Links in the Firebase Console and agree to the terms and conditions.","email-change-needs-verification":"Multi-factor users must always have a verified email.","email-already-in-use":"The email address is already in use by another account.","emulator-config-failed":'Auth instance has already been used to make a network call. Auth can no longer be configured to use the emulator. Try calling "connectAuthEmulator()" sooner.',"expired-action-code":"The action code has expired.","cancelled-popup-request":"This operation has been cancelled due to another conflicting popup being opened.","internal-error":"An internal AuthError has occurred.","invalid-app-credential":"The phone verification request contains an invalid application verifier. The reCAPTCHA token response is either invalid or expired.","invalid-app-id":"The mobile app identifier is not registered for the current project.","invalid-user-token":"This user's credential isn't valid for this project. This can happen if the user's token has been tampered with, or if the user isn't for the project associated with this API key.","invalid-auth-event":"An internal AuthError has occurred.","invalid-verification-code":"The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms and be sure to use the verification code provided by the user.","invalid-continue-uri":"The continue URL provided in the request is invalid.","invalid-cordova-configuration":"The following Cordova plugins must be installed to enable OAuth sign-in: cordova-plugin-buildinfo, cordova-universal-links-plugin, cordova-plugin-browsertab, cordova-plugin-inappbrowser and cordova-plugin-customurlscheme.","invalid-custom-token":"The custom token format is incorrect. Please check the documentation.","invalid-dynamic-link-domain":"The provided dynamic link domain is not configured or authorized for the current project.","invalid-email":"The email address is badly formatted.","invalid-emulator-scheme":"Emulator URL must start with a valid scheme (http:// or https://).","invalid-api-key":"Your API key is invalid, please check you have copied it correctly.","invalid-cert-hash":"The SHA-1 certificate hash provided is invalid.","invalid-credential":"The supplied auth credential is incorrect, malformed or has expired.","invalid-message-payload":"The email template corresponding to this action contains invalid characters in its message. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-multi-factor-session":"The request does not contain a valid proof of first factor successful sign-in.","invalid-oauth-provider":"EmailAuthProvider is not supported for this operation. This operation only supports OAuth providers.","invalid-oauth-client-id":"The OAuth client ID provided is either invalid or does not match the specified API key.","unauthorized-domain":"This domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.","invalid-action-code":"The action code is invalid. This can happen if the code is malformed, expired, or has already been used.","wrong-password":"The password is invalid or the user does not have a password.","invalid-persistence-type":"The specified persistence type is invalid. It can only be local, session or none.","invalid-phone-number":"The format of the phone number provided is incorrect. Please enter the phone number in a format that can be parsed into E.164 format. E.164 phone numbers are written in the format [+][country code][subscriber number including area code].","invalid-provider-id":"The specified provider ID is invalid.","invalid-recipient-email":"The email corresponding to this action failed to send as the provided recipient email address is invalid.","invalid-sender":"The email template corresponding to this action contains an invalid sender email or name. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-verification-id":"The verification ID used to create the phone auth credential is invalid.","invalid-tenant-id":"The Auth instance's tenant ID is invalid.","login-blocked":"Login blocked by user-provided method: {$originalMessage}","missing-android-pkg-name":"An Android Package Name must be provided if the Android App is required to be installed.","auth-domain-config-required":"Be sure to include authDomain when calling firebase.initializeApp(), by following the instructions in the Firebase console.","missing-app-credential":"The phone verification request is missing an application verifier assertion. A reCAPTCHA response token needs to be provided.","missing-verification-code":"The phone auth credential was created with an empty SMS verification code.","missing-continue-uri":"A continue URL must be provided in the request.","missing-iframe-start":"An internal AuthError has occurred.","missing-ios-bundle-id":"An iOS Bundle ID must be provided if an App Store ID is provided.","missing-or-invalid-nonce":"The request does not contain a valid nonce. This can occur if the SHA-256 hash of the provided raw nonce does not match the hashed nonce in the ID token payload.","missing-password":"A non-empty password must be provided","missing-multi-factor-info":"No second factor identifier is provided.","missing-multi-factor-session":"The request is missing proof of first factor successful sign-in.","missing-phone-number":"To send verification codes, provide a phone number for the recipient.","missing-verification-id":"The phone auth credential was created with an empty verification ID.","app-deleted":"This instance of FirebaseApp has been deleted.","multi-factor-info-not-found":"The user does not have a second factor matching the identifier provided.","multi-factor-auth-required":"Proof of ownership of a second factor is required to complete sign-in.","account-exists-with-different-credential":"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.","network-request-failed":"A network AuthError (such as timeout, interrupted connection or unreachable host) has occurred.","no-auth-event":"An internal AuthError has occurred.","no-such-provider":"User was not linked to an account with the given provider.","null-user":"A null user object was provided as the argument for an operation which requires a non-null user object.","operation-not-allowed":"The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.","operation-not-supported-in-this-environment":'This operation is not supported in the environment this application is running on. "location.protocol" must be http, https or chrome-extension and web storage must be enabled.',"popup-blocked":"Unable to establish a connection with the popup. It may have been blocked by the browser.","popup-closed-by-user":"The popup has been closed by the user before finalizing the operation.","provider-already-linked":"User can only be linked to one identity for the given provider.","quota-exceeded":"The project's quota for this operation has been exceeded.","redirect-cancelled-by-user":"The redirect operation has been cancelled by the user before finalizing.","redirect-operation-pending":"A redirect sign-in operation is already pending.","rejected-credential":"The request contains malformed or mismatching credentials.","second-factor-already-in-use":"The second factor is already enrolled on this account.","maximum-second-factor-count-exceeded":"The maximum allowed number of second factors on a user has been exceeded.","tenant-id-mismatch":"The provided tenant ID does not match the Auth instance's tenant ID",timeout:"The operation has timed out.","user-token-expired":"The user's credential is no longer valid. The user must sign in again.","too-many-requests":"We have blocked all requests from this device due to unusual activity. Try again later.","unauthorized-continue-uri":"The domain of the continue URL is not whitelisted.  Please whitelist the domain in the Firebase console.","unsupported-first-factor":"Enrolling a second factor or signing in with a multi-factor account requires sign-in with a supported first factor.","unsupported-persistence-type":"The current environment does not support the specified persistence type.","unsupported-tenant-operation":"This operation is not supported in a multi-tenant context.","unverified-email":"The operation requires a verified email.","user-cancelled":"The user did not grant your application the permissions it requested.","user-not-found":"There is no user record corresponding to this identifier. The user may have been deleted.","user-disabled":"The user account has been disabled by an administrator.","user-mismatch":"The supplied credentials do not correspond to the previously signed in user.","user-signed-out":"","weak-password":"The password must be 6 characters long or more.","web-storage-unsupported":"This browser is not supported or 3rd party cookies and data may be disabled.","already-initialized":"initializeAuth() has already been called with different options. To avoid this error, call initializeAuth() with the same options as when it was originally called, or call getAuth() to return the already initialized instance.","missing-recaptcha-token":"The reCAPTCHA token is missing when sending request to the backend.","invalid-recaptcha-token":"The reCAPTCHA token is invalid when sending request to the backend.","invalid-recaptcha-action":"The reCAPTCHA action is invalid when sending request to the backend.","recaptcha-not-enabled":"reCAPTCHA Enterprise integration is not enabled for this project.","missing-client-type":"The reCAPTCHA client type is missing when sending request to the backend.","missing-recaptcha-version":"The reCAPTCHA version is missing when sending request to the backend.","invalid-req-type":"Invalid request parameters.","invalid-recaptcha-version":"The reCAPTCHA version is invalid when sending request to the backend.","unsupported-password-policy-schema-version":"The password policy received from the backend uses a schema version that is not supported by this version of the Firebase SDK.","password-does-not-meet-requirements":"The password does not meet the requirements.","invalid-hosting-link-domain":"The provided Hosting link domain is not configured in Firebase Hosting or is not owned by the current project. This cannot be a default Hosting domain (`web.app` or `firebaseapp.com`)."}}function vI(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const xV=kV,AI=vI,RI=new Mo("auth","Firebase",vI()),OV={ADMIN_ONLY_OPERATION:"auth/admin-restricted-operation",ARGUMENT_ERROR:"auth/argument-error",APP_NOT_AUTHORIZED:"auth/app-not-authorized",APP_NOT_INSTALLED:"auth/app-not-installed",CAPTCHA_CHECK_FAILED:"auth/captcha-check-failed",CODE_EXPIRED:"auth/code-expired",CORDOVA_NOT_READY:"auth/cordova-not-ready",CORS_UNSUPPORTED:"auth/cors-unsupported",CREDENTIAL_ALREADY_IN_USE:"auth/credential-already-in-use",CREDENTIAL_MISMATCH:"auth/custom-token-mismatch",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"auth/requires-recent-login",DEPENDENT_SDK_INIT_BEFORE_AUTH:"auth/dependent-sdk-initialized-before-auth",DYNAMIC_LINK_NOT_ACTIVATED:"auth/dynamic-link-not-activated",EMAIL_CHANGE_NEEDS_VERIFICATION:"auth/email-change-needs-verification",EMAIL_EXISTS:"auth/email-already-in-use",EMULATOR_CONFIG_FAILED:"auth/emulator-config-failed",EXPIRED_OOB_CODE:"auth/expired-action-code",EXPIRED_POPUP_REQUEST:"auth/cancelled-popup-request",INTERNAL_ERROR:"auth/internal-error",INVALID_API_KEY:"auth/invalid-api-key",INVALID_APP_CREDENTIAL:"auth/invalid-app-credential",INVALID_APP_ID:"auth/invalid-app-id",INVALID_AUTH:"auth/invalid-user-token",INVALID_AUTH_EVENT:"auth/invalid-auth-event",INVALID_CERT_HASH:"auth/invalid-cert-hash",INVALID_CODE:"auth/invalid-verification-code",INVALID_CONTINUE_URI:"auth/invalid-continue-uri",INVALID_CORDOVA_CONFIGURATION:"auth/invalid-cordova-configuration",INVALID_CUSTOM_TOKEN:"auth/invalid-custom-token",INVALID_DYNAMIC_LINK_DOMAIN:"auth/invalid-dynamic-link-domain",INVALID_EMAIL:"auth/invalid-email",INVALID_EMULATOR_SCHEME:"auth/invalid-emulator-scheme",INVALID_IDP_RESPONSE:"auth/invalid-credential",INVALID_LOGIN_CREDENTIALS:"auth/invalid-credential",INVALID_MESSAGE_PAYLOAD:"auth/invalid-message-payload",INVALID_MFA_SESSION:"auth/invalid-multi-factor-session",INVALID_OAUTH_CLIENT_ID:"auth/invalid-oauth-client-id",INVALID_OAUTH_PROVIDER:"auth/invalid-oauth-provider",INVALID_OOB_CODE:"auth/invalid-action-code",INVALID_ORIGIN:"auth/unauthorized-domain",INVALID_PASSWORD:"auth/wrong-password",INVALID_PERSISTENCE:"auth/invalid-persistence-type",INVALID_PHONE_NUMBER:"auth/invalid-phone-number",INVALID_PROVIDER_ID:"auth/invalid-provider-id",INVALID_RECIPIENT_EMAIL:"auth/invalid-recipient-email",INVALID_SENDER:"auth/invalid-sender",INVALID_SESSION_INFO:"auth/invalid-verification-id",INVALID_TENANT_ID:"auth/invalid-tenant-id",MFA_INFO_NOT_FOUND:"auth/multi-factor-info-not-found",MFA_REQUIRED:"auth/multi-factor-auth-required",MISSING_ANDROID_PACKAGE_NAME:"auth/missing-android-pkg-name",MISSING_APP_CREDENTIAL:"auth/missing-app-credential",MISSING_AUTH_DOMAIN:"auth/auth-domain-config-required",MISSING_CODE:"auth/missing-verification-code",MISSING_CONTINUE_URI:"auth/missing-continue-uri",MISSING_IFRAME_START:"auth/missing-iframe-start",MISSING_IOS_BUNDLE_ID:"auth/missing-ios-bundle-id",MISSING_OR_INVALID_NONCE:"auth/missing-or-invalid-nonce",MISSING_MFA_INFO:"auth/missing-multi-factor-info",MISSING_MFA_SESSION:"auth/missing-multi-factor-session",MISSING_PHONE_NUMBER:"auth/missing-phone-number",MISSING_PASSWORD:"auth/missing-password",MISSING_SESSION_INFO:"auth/missing-verification-id",MODULE_DESTROYED:"auth/app-deleted",NEED_CONFIRMATION:"auth/account-exists-with-different-credential",NETWORK_REQUEST_FAILED:"auth/network-request-failed",NULL_USER:"auth/null-user",NO_AUTH_EVENT:"auth/no-auth-event",NO_SUCH_PROVIDER:"auth/no-such-provider",OPERATION_NOT_ALLOWED:"auth/operation-not-allowed",OPERATION_NOT_SUPPORTED:"auth/operation-not-supported-in-this-environment",POPUP_BLOCKED:"auth/popup-blocked",POPUP_CLOSED_BY_USER:"auth/popup-closed-by-user",PROVIDER_ALREADY_LINKED:"auth/provider-already-linked",QUOTA_EXCEEDED:"auth/quota-exceeded",REDIRECT_CANCELLED_BY_USER:"auth/redirect-cancelled-by-user",REDIRECT_OPERATION_PENDING:"auth/redirect-operation-pending",REJECTED_CREDENTIAL:"auth/rejected-credential",SECOND_FACTOR_ALREADY_ENROLLED:"auth/second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"auth/maximum-second-factor-count-exceeded",TENANT_ID_MISMATCH:"auth/tenant-id-mismatch",TIMEOUT:"auth/timeout",TOKEN_EXPIRED:"auth/user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"auth/too-many-requests",UNAUTHORIZED_DOMAIN:"auth/unauthorized-continue-uri",UNSUPPORTED_FIRST_FACTOR:"auth/unsupported-first-factor",UNSUPPORTED_PERSISTENCE:"auth/unsupported-persistence-type",UNSUPPORTED_TENANT_OPERATION:"auth/unsupported-tenant-operation",UNVERIFIED_EMAIL:"auth/unverified-email",USER_CANCELLED:"auth/user-cancelled",USER_DELETED:"auth/user-not-found",USER_DISABLED:"auth/user-disabled",USER_MISMATCH:"auth/user-mismatch",USER_SIGNED_OUT:"auth/user-signed-out",WEAK_PASSWORD:"auth/weak-password",WEB_STORAGE_UNSUPPORTED:"auth/web-storage-unsupported",ALREADY_INITIALIZED:"auth/already-initialized",RECAPTCHA_NOT_ENABLED:"auth/recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"auth/missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"auth/invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"auth/invalid-recaptcha-action",MISSING_CLIENT_TYPE:"auth/missing-client-type",MISSING_RECAPTCHA_VERSION:"auth/missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"auth/invalid-recaptcha-version",INVALID_REQ_TYPE:"auth/invalid-req-type",INVALID_HOSTING_LINK_DOMAIN:"auth/invalid-hosting-link-domain"};/**
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
 */const gc=new jl("@firebase/auth");function PI(n,...e){gc.logLevel<=ne.WARN&&gc.warn(`Auth (${lr}): ${n}`,...e)}function za(n,...e){gc.logLevel<=ne.ERROR&&gc.error(`Auth (${lr}): ${n}`,...e)}/**
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
 */function _t(n,...e){throw yd(n,...e)}function at(n,...e){return yd(n,...e)}function _d(n,e,t){const r={...AI(),[e]:t};return new Mo("auth","Firebase",r).create(e,{appName:n.name})}function We(n){return _d(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function _s(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&_t(n,"argument-error"),_d(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function yd(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return RI.create(n,...e)}function M(n,e,...t){if(!n)throw yd(e,...t)}function Gt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw za(e),new Error(e)}function In(n,e){n||Gt(e)}/**
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
 */function ko(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function Id(){return gm()==="http:"||gm()==="https:"}function gm(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
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
 */function LV(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Id()||Ow()||"connection"in navigator)?navigator.onLine:!0}function MV(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
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
 */class ta{constructor(e,t){this.shortDelay=e,this.longDelay=t,In(t>e,"Short delay should be less than long delay!"),this.isMobile=Dw()||Lw()}get(){return LV()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Ed(n,e){In(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class bI{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Gt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Gt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Gt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const FV={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const UV=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],BV=new ta(3e4,6e4);function ye(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function Ie(n,e,t,r,i={}){return SI(n,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});const c=es({...o,key:n.config.apiKey}).slice(1),u=await n._getAdditionalHeaders();u["Content-Type"]="application/json",n.languageCode&&(u["X-Firebase-Locale"]=n.languageCode);const l={method:e,headers:u,...s};return xw()||(l.referrerPolicy="strict-origin-when-cross-origin"),n.emulatorConfig&&ur(n.emulatorConfig.host)&&(l.credentials="include"),bI.fetch()(await VI(n,n.config.apiHost,t,c),l)})}async function SI(n,e,t){n._canInitEmulator=!1;const r={...FV,...e};try{const i=new $V(n),s=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw Ys(n,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const c=s.ok?o.errorMessage:o.error.message,[u,l]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ys(n,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw Ys(n,"email-already-in-use",o);if(u==="USER_DISABLED")throw Ys(n,"user-disabled",o);const d=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(l)throw _d(n,d,l);_t(n,d)}}catch(i){if(i instanceof Ot)throw i;_t(n,"network-request-failed",{message:String(i)})}}async function Rn(n,e,t,r,i={}){const s=await Ie(n,e,t,r,i);return"mfaPendingCredential"in s&&_t(n,"multi-factor-auth-required",{_serverResponse:s}),s}async function VI(n,e,t,r){const i=`${e}${t}?${r}`,s=n,o=s.config.emulator?Ed(n.config,i):`${n.config.apiScheme}://${i}`;return UV.includes(t)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}function qV(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class $V{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(at(this.auth,"network-request-failed")),BV.get())})}}function Ys(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const i=at(n,e,r);return i.customData._tokenResponse=t,i}/**
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
 */function _m(n){return n!==void 0&&n.getResponse!==void 0}function ym(n){return n!==void 0&&n.enterprise!==void 0}class CI{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return qV(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}/**
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
 */async function jV(n){return(await Ie(n,"GET","/v1/recaptchaParams")).recaptchaSiteKey||""}async function NI(n,e){return Ie(n,"GET","/v2/recaptchaConfig",ye(n,e))}/**
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
 */async function zV(n,e){return Ie(n,"POST","/v1/accounts:delete",e)}async function GV(n,e){return Ie(n,"POST","/v1/accounts:update",e)}async function _c(n,e){return Ie(n,"POST","/v1/accounts:lookup",e)}/**
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
 */function ho(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}/**
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
 */function WV(n,e=!1){return W(n).getIdToken(e)}async function DI(n,e=!1){const t=W(n),r=await t.getIdToken(e),i=nu(r);M(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:ho(Hu(i.auth_time)),issuedAtTime:ho(Hu(i.iat)),expirationTime:ho(Hu(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function Hu(n){return Number(n)*1e3}function nu(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return za("JWT malformed, contained fewer than 3 sections"),null;try{const i=Bl(t);return i?JSON.parse(i):(za("Failed to decode base64 JWT payload"),null)}catch(i){return za("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function Im(n){const e=nu(n);return M(e,"internal-error"),M(typeof e.exp<"u","internal-error"),M(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function En(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof Ot&&KV(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function KV({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
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
 */class HV{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class Ll{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=ho(this.lastLoginAt),this.creationTime=ho(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function xo(n){var p;const e=n.auth,t=await n.getIdToken(),r=await En(n,_c(e,{idToken:t}));M(r==null?void 0:r.users.length,e,"internal-error");const i=r.users[0];n._notifyReloadListener(i);const s=(p=i.providerUserInfo)!=null&&p.length?xI(i.providerUserInfo):[],o=QV(n.providerData,s),c=n.isAnonymous,u=!(n.email&&i.passwordHash)&&!(o!=null&&o.length),l=c?u:!1,d={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new Ll(i.createdAt,i.lastLoginAt),isAnonymous:l};Object.assign(n,d)}async function kI(n){const e=W(n);await xo(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function QV(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function xI(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
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
 */async function JV(n,e){const t=await SI(n,{},async()=>{const r=es({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=n.config,o=await VI(n,i,"/v1/token",`key=${s}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:c,body:r};return n.emulatorConfig&&ur(n.emulatorConfig.host)&&(u.credentials="include"),bI.fetch()(o,u)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function YV(n,e){return Ie(n,"POST","/v2/accounts:revokeToken",ye(n,e))}/**
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
 */class Ai{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){M(e.idToken,"internal-error"),M(typeof e.idToken<"u","internal-error"),M(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Im(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){M(e.length!==0,"internal-error");const t=Im(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(M(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:i,expiresIn:s}=await JV(e,t);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:i,expirationTime:s}=t,o=new Ai;return r&&(M(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(M(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(M(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Ai,this.toJSON())}_performRefresh(){return Gt("not implemented")}}/**
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
 */function Mn(n,e){M(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Ct{constructor({uid:e,auth:t,stsTokenManager:r,...i}){this.providerId="firebase",this.proactiveRefresh=new HV(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Ll(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await En(this,this.stsTokenManager.getToken(this.auth,e));return M(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return DI(this,e)}reload(){return kI(this)}_assign(e){this!==e&&(M(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Ct({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){M(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await xo(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(_e(this.auth.app))return Promise.reject(We(this.auth));const e=await this.getIdToken();return await En(this,zV(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,i=t.email??void 0,s=t.phoneNumber??void 0,o=t.photoURL??void 0,c=t.tenantId??void 0,u=t._redirectEventId??void 0,l=t.createdAt??void 0,d=t.lastLoginAt??void 0,{uid:p,emailVerified:m,isAnonymous:I,providerData:P,stsTokenManager:x}=t;M(p&&x,e,"internal-error");const D=Ai.fromJSON(this.name,x);M(typeof p=="string",e,"internal-error"),Mn(r,e.name),Mn(i,e.name),M(typeof m=="boolean",e,"internal-error"),M(typeof I=="boolean",e,"internal-error"),Mn(s,e.name),Mn(o,e.name),Mn(c,e.name),Mn(u,e.name),Mn(l,e.name),Mn(d,e.name);const $=new Ct({uid:p,auth:e,email:i,emailVerified:m,displayName:r,isAnonymous:I,photoURL:o,phoneNumber:s,tenantId:c,stsTokenManager:D,createdAt:l,lastLoginAt:d});return P&&Array.isArray(P)&&($.providerData=P.map(G=>({...G}))),u&&($._redirectEventId=u),$}static async _fromIdTokenResponse(e,t,r=!1){const i=new Ai;i.updateFromServerResponse(t);const s=new Ct({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await xo(s),s}static async _fromGetAccountInfoResponse(e,t,r){const i=t.users[0];M(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?xI(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),c=new Ai;c.updateFromIdToken(r);const u=new Ct({uid:i.localId,auth:e,stsTokenManager:c,isAnonymous:o}),l={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new Ll(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,l),u}}/**
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
 */const Em=new Map;function un(n){In(n instanceof Function,"Expected a class definition");let e=Em.get(n);return e?(In(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Em.set(n,e),e)}/**
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
 */class OI{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}OI.type="NONE";const Ml=OI;/**
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
 */function Ga(n,e,t){return`firebase:${n}:${e}:${t}`}class Ri{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=Ga(this.userKey,i.apiKey,s),this.fullPersistenceKey=Ga("persistence",i.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await _c(this.auth,{idToken:e}).catch(()=>{});return t?Ct._fromGetAccountInfoResponse(this.auth,t,e):null}return Ct._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new Ri(un(Ml),e,r);const i=(await Promise.all(t.map(async l=>{if(await l._isAvailable())return l}))).filter(l=>l);let s=i[0]||un(Ml);const o=Ga(r,e.config.apiKey,e.name);let c=null;for(const l of t)try{const d=await l._get(o);if(d){let p;if(typeof d=="string"){const m=await _c(e,{idToken:d}).catch(()=>{});if(!m)break;p=await Ct._fromGetAccountInfoResponse(e,m,d)}else p=Ct._fromJSON(e,d);l!==s&&(c=p),s=l;break}}catch{}const u=i.filter(l=>l._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new Ri(s,e,r):(s=u[0],c&&await s._set(o,c.toJSON()),await Promise.all(t.map(async l=>{if(l!==s)try{await l._remove(o)}catch{}})),new Ri(s,e,r))}}/**
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
 */function wm(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(UI(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(LI(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(qI(e))return"Blackberry";if($I(e))return"Webos";if(MI(e))return"Safari";if((e.includes("chrome/")||FI(e))&&!e.includes("edge/"))return"Chrome";if(BI(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function LI(n=Me()){return/firefox\//i.test(n)}function MI(n=Me()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function FI(n=Me()){return/crios\//i.test(n)}function UI(n=Me()){return/iemobile/i.test(n)}function BI(n=Me()){return/android/i.test(n)}function qI(n=Me()){return/blackberry/i.test(n)}function $I(n=Me()){return/webos/i.test(n)}function wd(n=Me()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function XV(n=Me()){var e;return wd(n)&&!!((e=window.navigator)!=null&&e.standalone)}function ZV(){return Mw()&&document.documentMode===10}function jI(n=Me()){return wd(n)||BI(n)||$I(n)||qI(n)||/windows phone/i.test(n)||UI(n)}/**
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
 */function zI(n,e=[]){let t;switch(n){case"Browser":t=wm(Me());break;case"Worker":t=`${wm(Me())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${lr}/${r}`}/**
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
 */class eC{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=s=>new Promise((o,c)=>{try{const u=e(s);o(u)}catch(u){c(u)}});r.onAbort=t,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function tC(n,e={}){return Ie(n,"GET","/v2/passwordPolicy",ye(n,e))}/**
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
 */const nC=6;class rC{constructor(e){var r;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??nC,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
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
 */class iC{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Tm(this),this.idTokenSubscription=new Tm(this),this.beforeStateQueue=new eC(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=RI,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=un(t)),this._initializationPromise=this.queue(async()=>{var r,i,s;if(!this._deleted&&(this.persistenceManager=await Ri.create(this,e),(r=this._resolvePersistenceManagerAvailable)==null||r.call(this),!this._deleted)){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await _c(this,{idToken:e}),r=await Ct._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(_e(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(s=this.redirectUser)==null?void 0:s._redirectEventId,c=r==null?void 0:r._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===c)&&(u!=null&&u.user)&&(r=u.user,i=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(r)}catch(o){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return M(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await xo(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=MV()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(_e(this.app))return Promise.reject(We(this));const t=e?W(e):null;return t&&M(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&M(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return _e(this.app)?Promise.reject(We(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return _e(this.app)?Promise.reject(We(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(un(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await tC(this),t=new rC(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Mo("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await YV(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&un(e)||this._popupRedirectResolver;M(t,this,"argument-error"),this.redirectPersistenceManager=await Ri.create(this,[un(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};const s=typeof t=="function"?t:t.next.bind(t);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(M(c,this,"internal-error"),c.then(()=>{o||s(this.currentUser)}),typeof t=="function"){const u=e.addObserver(t,r,i);return()=>{o=!0,u()}}else{const u=e.addObserver(t);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return M(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=zI(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var t;if(_e(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&PI(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function Re(n){return W(n)}class Tm{constructor(e){this.auth=e,this.observer=null,this.addObserver=$w(t=>this.observer=t)}get next(){return M(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let na={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function sC(n){na=n}function Td(n){return na.loadJS(n)}function oC(){return na.recaptchaV2Script}function aC(){return na.recaptchaEnterpriseScript}function cC(){return na.gapiScript}function GI(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
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
 */const uC=500,lC=6e4,Ca=1e12;class hC{constructor(e){this.auth=e,this.counter=Ca,this._widgets=new Map}render(e,t){const r=this.counter;return this._widgets.set(r,new pC(e,this.auth.name,t||{})),this.counter++,r}reset(e){var r;const t=e||Ca;(r=this._widgets.get(t))==null||r.delete(),this._widgets.delete(t)}getResponse(e){var r;const t=e||Ca;return((r=this._widgets.get(t))==null?void 0:r.getResponse())||""}async execute(e){var r;const t=e||Ca;return(r=this._widgets.get(t))==null||r.execute(),""}}class dC{constructor(){this.enterprise=new fC}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class fC{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class pC{constructor(e,t,r){this.params=r,this.timerId=null,this.deleted=!1,this.responseToken=null,this.clickHandler=()=>{this.execute()};const i=typeof e=="string"?document.getElementById(e):e;M(i,"argument-error",{appName:t}),this.container=i,this.isVisible=this.params.size!=="invisible",this.isVisible?this.execute():this.container.addEventListener("click",this.clickHandler)}getResponse(){return this.checkIfDeleted(),this.responseToken}delete(){this.checkIfDeleted(),this.deleted=!0,this.timerId&&(clearTimeout(this.timerId),this.timerId=null),this.container.removeEventListener("click",this.clickHandler)}execute(){this.checkIfDeleted(),!this.timerId&&(this.timerId=window.setTimeout(()=>{this.responseToken=mC(50);const{callback:e,"expired-callback":t}=this.params;if(e)try{e(this.responseToken)}catch{}this.timerId=window.setTimeout(()=>{if(this.timerId=null,this.responseToken=null,t)try{t()}catch{}this.isVisible&&this.execute()},lC)},uC))}checkIfDeleted(){if(this.deleted)throw new Error("reCAPTCHA mock was already deleted!")}}function mC(n){const e=[],t="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let r=0;r<n;r++)e.push(t.charAt(Math.floor(Math.random()*t.length)));return e.join("")}/**
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
 */const gC="recaptcha-enterprise",fo="NO_RECAPTCHA",vm="onFirebaseAuthREInstanceReady";class nn{constructor(e){this.type=gC,this.auth=Re(e)}async verify(e="verify",t=!1){async function r(s){if(!t){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(o,c)=>{NI(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)c(new Error("recaptcha Enterprise site key undefined"));else{const l=new CI(u);return s.tenantId==null?s._agentRecaptchaConfig=l:s._tenantRecaptchaConfigs[s.tenantId]=l,o(l.siteKey)}}).catch(u=>{c(u)})})}function i(s,o,c){const u=window.grecaptcha;ym(u)?u.enterprise.ready(()=>{u.enterprise.execute(s,{action:e}).then(l=>{o(l)}).catch(()=>{o(fo)})}):c(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new dC().execute("siteKey",{action:"verify"}):new Promise((s,o)=>{r(this.auth).then(async c=>{if(!t&&ym(window.grecaptcha)&&nn.scriptInjectionDeferred)await nn.scriptInjectionDeferred.promise,i(c,s,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let u=aC();u.length!==0&&(u+=c+`&onload=${vm}`),nn.scriptInjectionDeferred=new Qm,window[vm]=()=>{var l;(l=nn.scriptInjectionDeferred)==null||l.resolve()},Td(u).then(()=>{var l;return(l=nn.scriptInjectionDeferred)==null?void 0:l.promise}).then(()=>{i(c,s,o)}).catch(l=>{o(l)})}}).catch(c=>{o(c)})})}}nn.scriptInjectionDeferred=null;async function js(n,e,t,r=!1,i=!1){const s=new nn(n);let o;if(i)o=fo;else try{o=await s.verify(t)}catch{o=await s.verify(t,!0)}const c={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in c){const u=c.phoneEnrollmentInfo.phoneNumber,l=c.phoneEnrollmentInfo.recaptchaToken;Object.assign(c,{phoneEnrollmentInfo:{phoneNumber:u,recaptchaToken:l,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in c){const u=c.phoneSignInInfo.recaptchaToken;Object.assign(c,{phoneSignInInfo:{recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return c}return r?Object.assign(c,{captchaResp:o}):Object.assign(c,{captchaResponse:o}),Object.assign(c,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(c,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),c}async function Kn(n,e,t,r,i){var s,o;if(i==="EMAIL_PASSWORD_PROVIDER")if((s=n._getRecaptchaConfig())!=null&&s.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const c=await js(n,e,t,t==="getOobCode");return r(n,c)}else return r(n,e).catch(async c=>{if(c.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const u=await js(n,e,t,t==="getOobCode");return r(n,u)}else return Promise.reject(c)});else if(i==="PHONE_PROVIDER")if((o=n._getRecaptchaConfig())!=null&&o.isProviderEnabled("PHONE_PROVIDER")){const c=await js(n,e,t);return r(n,c).catch(async u=>{var l;if(((l=n._getRecaptchaConfig())==null?void 0:l.getProviderEnforcementState("PHONE_PROVIDER"))==="AUDIT"&&(u.code==="auth/missing-recaptcha-token"||u.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${t} flow.`);const d=await js(n,e,t,!1,!0);return r(n,d)}return Promise.reject(u)})}else{const c=await js(n,e,t,!1,!0);return r(n,c)}else return Promise.reject(i+" provider is not supported.")}async function WI(n){const e=Re(n),t=await NI(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),r=new CI(t);e.tenantId==null?e._agentRecaptchaConfig=r:e._tenantRecaptchaConfigs[e.tenantId]=r,r.isAnyProviderEnabled()&&new nn(e).verify()}/**
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
 */function KI(n,e){const t=Jr(n,"auth");if(t.isInitialized()){const i=t.getImmediate(),s=t.getOptions();if(kt(s,e??{}))return i;_t(i,"already-initialized")}return t.initialize({options:e})}function _C(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(un);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function HI(n,e,t){const r=Re(n);M(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!!(t!=null&&t.disableWarnings),s=QI(e),{host:o,port:c}=yC(e),u=c===null?"":`:${c}`,l={url:`${s}//${o}${u}/`},d=Object.freeze({host:o,port:c,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!r._canInitEmulator){M(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),M(kt(l,r.config.emulator)&&kt(d,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=l,r.emulatorConfig=d,r.settings.appVerificationDisabledForTesting=!0,ur(o)?vc(`${s}//${o}${u}`):i||IC()}function QI(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function yC(n){const e=QI(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:Am(r.substr(s.length+1))}}else{const[s,o]=r.split(":");return{host:s,port:Am(o)}}}function Am(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function IC(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
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
 */class ys{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Gt("not implemented")}_getIdTokenResponse(e){return Gt("not implemented")}_linkToIdToken(e,t){return Gt("not implemented")}_getReauthenticationResolver(e){return Gt("not implemented")}}/**
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
 */async function JI(n,e){return Ie(n,"POST","/v1/accounts:resetPassword",ye(n,e))}async function EC(n,e){return Ie(n,"POST","/v1/accounts:update",e)}async function wC(n,e){return Ie(n,"POST","/v1/accounts:signUp",e)}async function TC(n,e){return Ie(n,"POST","/v1/accounts:update",ye(n,e))}/**
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
 */async function vC(n,e){return Rn(n,"POST","/v1/accounts:signInWithPassword",ye(n,e))}async function ru(n,e){return Ie(n,"POST","/v1/accounts:sendOobCode",ye(n,e))}async function AC(n,e){return ru(n,e)}async function RC(n,e){return ru(n,e)}async function PC(n,e){return ru(n,e)}async function bC(n,e){return ru(n,e)}/**
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
 */async function SC(n,e){return Rn(n,"POST","/v1/accounts:signInWithEmailLink",ye(n,e))}async function VC(n,e){return Rn(n,"POST","/v1/accounts:signInWithEmailLink",ye(n,e))}/**
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
 */class Zi extends ys{constructor(e,t,r,i=null){super("password",r),this._email=e,this._password=t,this._tenantId=i}static _fromEmailAndPassword(e,t){return new Zi(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new Zi(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Kn(e,t,"signInWithPassword",vC,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return SC(e,{email:this._email,oobCode:this._password});default:_t(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Kn(e,r,"signUpPassword",wC,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return VC(e,{idToken:t,email:this._email,oobCode:this._password});default:_t(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
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
 */async function fn(n,e){return Rn(n,"POST","/v1/accounts:signInWithIdp",ye(n,e))}/**
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
 */const CC="http://localhost";class Zt extends ys{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Zt(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):_t("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i,...s}=t;if(!r||!i)return null;const o=new Zt(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return fn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,fn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,fn(e,t)}buildRequest(){const e={requestUri:CC,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=es(t)}return e}}/**
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
 */async function Rm(n,e){return Ie(n,"POST","/v1/accounts:sendVerificationCode",ye(n,e))}async function NC(n,e){return Rn(n,"POST","/v1/accounts:signInWithPhoneNumber",ye(n,e))}async function DC(n,e){const t=await Rn(n,"POST","/v1/accounts:signInWithPhoneNumber",ye(n,e));if(t.temporaryProof)throw Ys(n,"account-exists-with-different-credential",t);return t}const kC={USER_NOT_FOUND:"user-not-found"};async function xC(n,e){const t={...e,operation:"REAUTH"};return Rn(n,"POST","/v1/accounts:signInWithPhoneNumber",ye(n,t),kC)}/**
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
 */class Hn extends ys{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,t){return new Hn({verificationId:e,verificationCode:t})}static _fromTokenResponse(e,t){return new Hn({phoneNumber:e,temporaryProof:t})}_getIdTokenResponse(e){return NC(e,this._makeVerificationRequest())}_linkToIdToken(e,t){return DC(e,{idToken:t,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return xC(e,this._makeVerificationRequest())}_makeVerificationRequest(){const{temporaryProof:e,phoneNumber:t,verificationId:r,verificationCode:i}=this.params;return e&&t?{temporaryProof:e,phoneNumber:t}:{sessionInfo:r,code:i}}toJSON(){const e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));const{verificationId:t,verificationCode:r,phoneNumber:i,temporaryProof:s}=e;return!r&&!t&&!i&&!s?null:new Hn({verificationId:t,verificationCode:r,phoneNumber:i,temporaryProof:s})}}/**
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
 */function OC(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function LC(n){const e=Gs(Ws(n)).link,t=e?Gs(Ws(e)).deep_link_id:null,r=Gs(Ws(n)).deep_link_id;return(r?Gs(Ws(r)).link:null)||r||t||e||n}class Is{constructor(e){const t=Gs(Ws(e)),r=t.apiKey??null,i=t.oobCode??null,s=OC(t.mode??null);M(r&&i&&s,"argument-error"),this.apiKey=r,this.operation=s,this.code=i,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=LC(e);try{return new Is(t)}catch{return null}}}function MC(n){return Is.parseLink(n)}/**
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
 */class _r{constructor(){this.providerId=_r.PROVIDER_ID}static credential(e,t){return Zi._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=Is.parseLink(t);return M(r,"argument-error"),Zi._fromEmailAndCode(e,r.code,r.tenantId)}}_r.PROVIDER_ID="password";_r.EMAIL_PASSWORD_SIGN_IN_METHOD="password";_r.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
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
 */class Pn{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Es extends Pn{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}class po extends Es{static credentialFromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;return M("providerId"in t&&"signInMethod"in t,"argument-error"),Zt._fromParams(t)}credential(e){return this._credential({...e,nonce:e.rawNonce})}_credential(e){return M(e.idToken||e.accessToken,"argument-error"),Zt._fromParams({...e,providerId:this.providerId,signInMethod:this.providerId})}static credentialFromResult(e){return po.oauthCredentialFromTaggedObject(e)}static credentialFromError(e){return po.oauthCredentialFromTaggedObject(e.customData||{})}static oauthCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r,oauthTokenSecret:i,pendingToken:s,nonce:o,providerId:c}=e;if(!r&&!i&&!t&&!s||!c)return null;try{return new po(c)._credential({idToken:t,accessToken:r,nonce:o,pendingToken:s})}catch{return null}}}/**
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
 */class rn extends Es{constructor(){super("facebook.com")}static credential(e){return Zt._fromParams({providerId:rn.PROVIDER_ID,signInMethod:rn.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return rn.credentialFromTaggedObject(e)}static credentialFromError(e){return rn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return rn.credential(e.oauthAccessToken)}catch{return null}}}rn.FACEBOOK_SIGN_IN_METHOD="facebook.com";rn.PROVIDER_ID="facebook.com";/**
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
 */class sn extends Es{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Zt._fromParams({providerId:sn.PROVIDER_ID,signInMethod:sn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return sn.credentialFromTaggedObject(e)}static credentialFromError(e){return sn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return sn.credential(t,r)}catch{return null}}}sn.GOOGLE_SIGN_IN_METHOD="google.com";sn.PROVIDER_ID="google.com";/**
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
 */class on extends Es{constructor(){super("github.com")}static credential(e){return Zt._fromParams({providerId:on.PROVIDER_ID,signInMethod:on.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return on.credentialFromTaggedObject(e)}static credentialFromError(e){return on.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return on.credential(e.oauthAccessToken)}catch{return null}}}on.GITHUB_SIGN_IN_METHOD="github.com";on.PROVIDER_ID="github.com";/**
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
 */const FC="http://localhost";class Oo extends ys{constructor(e,t){super(e,e),this.pendingToken=t}_getIdTokenResponse(e){const t=this.buildRequest();return fn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,fn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,fn(e,t)}toJSON(){return{signInMethod:this.signInMethod,providerId:this.providerId,pendingToken:this.pendingToken}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i,pendingToken:s}=t;return!r||!i||!s||r!==i?null:new Oo(r,s)}static _create(e,t){return new Oo(e,t)}buildRequest(){return{requestUri:FC,returnSecureToken:!0,pendingToken:this.pendingToken}}}/**
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
 */const UC="saml.";class yc extends Pn{constructor(e){M(e.startsWith(UC),"argument-error"),super(e)}static credentialFromResult(e){return yc.samlCredentialFromTaggedObject(e)}static credentialFromError(e){return yc.samlCredentialFromTaggedObject(e.customData||{})}static credentialFromJSON(e){const t=Oo.fromJSON(e);return M(t,"argument-error"),t}static samlCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{pendingToken:t,providerId:r}=e;if(!t||!r)return null;try{return Oo._create(r,t)}catch{return null}}}/**
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
 */class an extends Es{constructor(){super("twitter.com")}static credential(e,t){return Zt._fromParams({providerId:an.PROVIDER_ID,signInMethod:an.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return an.credentialFromTaggedObject(e)}static credentialFromError(e){return an.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return an.credential(t,r)}catch{return null}}}an.TWITTER_SIGN_IN_METHOD="twitter.com";an.PROVIDER_ID="twitter.com";/**
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
 */async function YI(n,e){return Rn(n,"POST","/v1/accounts:signUp",ye(n,e))}/**
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
 */class St{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,i=!1){const s=await Ct._fromIdTokenResponse(e,r,i),o=Pm(r);return new St({user:s,providerId:o,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const i=Pm(r);return new St({user:e,providerId:i,_tokenResponse:r,operationType:t})}}function Pm(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
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
 */async function BC(n){var i;if(_e(n.app))return Promise.reject(We(n));const e=Re(n);if(await e._initializationPromise,(i=e.currentUser)!=null&&i.isAnonymous)return new St({user:e.currentUser,providerId:null,operationType:"signIn"});const t=await YI(e,{returnSecureToken:!0}),r=await St._fromIdTokenResponse(e,"signIn",t,!0);return await e._updateCurrentUser(r.user),r}/**
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
 */class Ic extends Ot{constructor(e,t,r,i){super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,Ic.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new Ic(e,t,r,i)}}function XI(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?Ic._fromErrorAndOperation(n,s,e,r):s})}/**
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
 */function ZI(n){return new Set(n.map(({providerId:e})=>e).filter(e=>!!e))}/**
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
 */async function qC(n,e){const t=W(n);await iu(!0,t,e);const{providerUserInfo:r}=await GV(t.auth,{idToken:await t.getIdToken(),deleteProvider:[e]}),i=ZI(r||[]);return t.providerData=t.providerData.filter(s=>i.has(s.providerId)),i.has("phone")||(t.phoneNumber=null),await t.auth._persistUserIfCurrent(t),t}async function vd(n,e,t=!1){const r=await En(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return St._forOperation(n,"link",r)}async function iu(n,e,t){await xo(e);const r=ZI(e.providerData),i=n===!1?"provider-already-linked":"no-such-provider";M(r.has(t)===n,e.auth,i)}/**
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
 */async function eE(n,e,t=!1){const{auth:r}=n;if(_e(r.app))return Promise.reject(We(r));const i="reauthenticate";try{const s=await En(n,XI(r,i,e,n),t);M(s.idToken,r,"internal-error");const o=nu(s.idToken);M(o,r,"internal-error");const{sub:c}=o;return M(n.uid===c,r,"user-mismatch"),St._forOperation(n,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&_t(r,"user-mismatch"),s}}/**
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
 */async function tE(n,e,t=!1){if(_e(n.app))return Promise.reject(We(n));const r="signIn",i=await XI(n,r,e),s=await St._fromIdTokenResponse(n,r,i);return t||await n._updateCurrentUser(s.user),s}async function su(n,e){return tE(Re(n),e)}async function nE(n,e){const t=W(n);return await iu(!1,t,e.providerId),vd(t,e)}async function rE(n,e){return eE(W(n),e)}/**
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
 */async function $C(n,e){return Rn(n,"POST","/v1/accounts:signInWithCustomToken",ye(n,e))}/**
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
 */async function jC(n,e){if(_e(n.app))return Promise.reject(We(n));const t=Re(n),r=await $C(t,{token:e,returnSecureToken:!0}),i=await St._fromIdTokenResponse(t,"signIn",r);return await t._updateCurrentUser(i.user),i}/**
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
 */class ra{constructor(e,t){this.factorId=e,this.uid=t.mfaEnrollmentId,this.enrollmentTime=new Date(t.enrolledAt).toUTCString(),this.displayName=t.displayName}static _fromServerResponse(e,t){return"phoneInfo"in t?Ad._fromServerResponse(e,t):"totpInfo"in t?Rd._fromServerResponse(e,t):_t(e,"internal-error")}}class Ad extends ra{constructor(e){super("phone",e),this.phoneNumber=e.phoneInfo}static _fromServerResponse(e,t){return new Ad(t)}}class Rd extends ra{constructor(e){super("totp",e)}static _fromServerResponse(e,t){return new Rd(t)}}/**
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
 */function ou(n,e,t){var r;M(((r=t.url)==null?void 0:r.length)>0,n,"invalid-continue-uri"),M(typeof t.dynamicLinkDomain>"u"||t.dynamicLinkDomain.length>0,n,"invalid-dynamic-link-domain"),M(typeof t.linkDomain>"u"||t.linkDomain.length>0,n,"invalid-hosting-link-domain"),e.continueUrl=t.url,e.dynamicLinkDomain=t.dynamicLinkDomain,e.linkDomain=t.linkDomain,e.canHandleCodeInApp=t.handleCodeInApp,t.iOS&&(M(t.iOS.bundleId.length>0,n,"missing-ios-bundle-id"),e.iOSBundleId=t.iOS.bundleId),t.android&&(M(t.android.packageName.length>0,n,"missing-android-pkg-name"),e.androidInstallApp=t.android.installApp,e.androidMinimumVersionCode=t.android.minimumVersion,e.androidPackageName=t.android.packageName)}/**
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
 */async function Pd(n){const e=Re(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function zC(n,e,t){const r=Re(n),i={requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"};t&&ou(r,i,t),await Kn(r,i,"getOobCode",RC,"EMAIL_PASSWORD_PROVIDER")}async function GC(n,e,t){await JI(W(n),{oobCode:e,newPassword:t}).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&Pd(n),r})}async function WC(n,e){await TC(W(n),{oobCode:e})}async function iE(n,e){const t=W(n),r=await JI(t,{oobCode:e}),i=r.requestType;switch(M(i,t,"internal-error"),i){case"EMAIL_SIGNIN":break;case"VERIFY_AND_CHANGE_EMAIL":M(r.newEmail,t,"internal-error");break;case"REVERT_SECOND_FACTOR_ADDITION":M(r.mfaInfo,t,"internal-error");default:M(r.email,t,"internal-error")}let s=null;return r.mfaInfo&&(s=ra._fromServerResponse(Re(t),r.mfaInfo)),{data:{email:(r.requestType==="VERIFY_AND_CHANGE_EMAIL"?r.newEmail:r.email)||null,previousEmail:(r.requestType==="VERIFY_AND_CHANGE_EMAIL"?r.email:r.newEmail)||null,multiFactorInfo:s},operation:i}}async function KC(n,e){const{data:t}=await iE(W(n),e);return t.email}async function HC(n,e,t){if(_e(n.app))return Promise.reject(We(n));const r=Re(n),o=await Kn(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",YI,"EMAIL_PASSWORD_PROVIDER").catch(u=>{throw u.code==="auth/password-does-not-meet-requirements"&&Pd(n),u}),c=await St._fromIdTokenResponse(r,"signIn",o);return await r._updateCurrentUser(c.user),c}function QC(n,e,t){return _e(n.app)?Promise.reject(We(n)):su(W(n),_r.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&Pd(n),r})}/**
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
 */async function JC(n,e,t){const r=Re(n),i={requestType:"EMAIL_SIGNIN",email:e,clientType:"CLIENT_TYPE_WEB"};function s(o,c){M(c.handleCodeInApp,r,"argument-error"),c&&ou(r,o,c)}s(i,t),await Kn(r,i,"getOobCode",PC,"EMAIL_PASSWORD_PROVIDER")}function YC(n,e){const t=Is.parseLink(e);return(t==null?void 0:t.operation)==="EMAIL_SIGNIN"}async function XC(n,e,t){if(_e(n.app))return Promise.reject(We(n));const r=W(n),i=_r.credentialWithLink(e,t||ko());return M(i._tenantId===(r.tenantId||null),r,"tenant-id-mismatch"),su(r,i)}/**
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
 */async function ZC(n,e){return Ie(n,"POST","/v1/accounts:createAuthUri",ye(n,e))}/**
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
 */async function eN(n,e){const t=Id()?ko():"http://localhost",r={identifier:e,continueUri:t},{signinMethods:i}=await ZC(W(n),r);return i||[]}async function tN(n,e){const t=W(n),i={requestType:"VERIFY_EMAIL",idToken:await n.getIdToken()};e&&ou(t.auth,i,e);const{email:s}=await AC(t.auth,i);s!==n.email&&await n.reload()}async function nN(n,e,t){const r=W(n),s={requestType:"VERIFY_AND_CHANGE_EMAIL",idToken:await n.getIdToken(),newEmail:e};t&&ou(r.auth,s,t);const{email:o}=await bC(r.auth,s);o!==n.email&&await n.reload()}/**
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
 */async function rN(n,e){return Ie(n,"POST","/v1/accounts:update",e)}/**
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
 */async function iN(n,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;const r=W(n),s={idToken:await r.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},o=await En(r,rN(r.auth,s));r.displayName=o.displayName||null,r.photoURL=o.photoUrl||null;const c=r.providerData.find(({providerId:u})=>u==="password");c&&(c.displayName=r.displayName,c.photoURL=r.photoURL),await r._updateTokensIfNecessary(o)}function sN(n,e){const t=W(n);return _e(t.auth.app)?Promise.reject(We(t.auth)):sE(t,e,null)}function oN(n,e){return sE(W(n),null,e)}async function sE(n,e,t){const{auth:r}=n,s={idToken:await n.getIdToken(),returnSecureToken:!0};e&&(s.email=e),t&&(s.password=t);const o=await En(n,EC(r,s));await n._updateTokensIfNecessary(o,!0)}/**
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
 */function aN(n){var i,s;if(!n)return null;const{providerId:e}=n,t=n.rawUserInfo?JSON.parse(n.rawUserInfo):{},r=n.isNewUser||n.kind==="identitytoolkit#SignupNewUserResponse";if(!e&&(n!=null&&n.idToken)){const o=(s=(i=nu(n.idToken))==null?void 0:i.firebase)==null?void 0:s.sign_in_provider;if(o){const c=o!=="anonymous"&&o!=="custom"?o:null;return new Pi(r,c)}}if(!e)return null;switch(e){case"facebook.com":return new cN(r,t);case"github.com":return new uN(r,t);case"google.com":return new lN(r,t);case"twitter.com":return new hN(r,t,n.screenName||null);case"custom":case"anonymous":return new Pi(r,null);default:return new Pi(r,e,t)}}class Pi{constructor(e,t,r={}){this.isNewUser=e,this.providerId=t,this.profile=r}}class oE extends Pi{constructor(e,t,r,i){super(e,t,r),this.username=i}}class cN extends Pi{constructor(e,t){super(e,"facebook.com",t)}}class uN extends oE{constructor(e,t){super(e,"github.com",t,typeof(t==null?void 0:t.login)=="string"?t==null?void 0:t.login:null)}}class lN extends Pi{constructor(e,t){super(e,"google.com",t)}}class hN extends oE{constructor(e,t,r){super(e,"twitter.com",t,r)}}function dN(n){const{user:e,_tokenResponse:t}=n;return e.isAnonymous&&!t?{providerId:null,isNewUser:!1,profile:null}:aN(t)}/**
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
 */function fN(n,e){return W(n).setPersistence(e)}function pN(n){return WI(n)}async function mN(n,e){return Re(n).validatePassword(e)}function aE(n,e,t,r){return W(n).onIdTokenChanged(e,t,r)}function cE(n,e,t){return W(n).beforeAuthStateChanged(e,t)}function gN(n,e,t,r){return W(n).onAuthStateChanged(e,t,r)}function _N(n){W(n).useDeviceLanguage()}function yN(n,e){return W(n).updateCurrentUser(e)}function IN(n){return W(n).signOut()}function EN(n,e){return Re(n).revokeAccessToken(e)}async function wN(n){return W(n).delete()}/**
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
 */class xr{constructor(e,t,r){this.type=e,this.credential=t,this.user=r}static _fromIdtoken(e,t){return new xr("enroll",e,t)}static _fromMfaPendingCredential(e){return new xr("signin",e)}toJSON(){return{multiFactorSession:{[this.type==="enroll"?"idToken":"pendingCredential"]:this.credential}}}static fromJSON(e){var t,r;if(e!=null&&e.multiFactorSession){if((t=e.multiFactorSession)!=null&&t.pendingCredential)return xr._fromMfaPendingCredential(e.multiFactorSession.pendingCredential);if((r=e.multiFactorSession)!=null&&r.idToken)return xr._fromIdtoken(e.multiFactorSession.idToken)}return null}}/**
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
 */class bd{constructor(e,t,r){this.session=e,this.hints=t,this.signInResolver=r}static _fromError(e,t){const r=Re(e),i=t.customData._serverResponse,s=(i.mfaInfo||[]).map(c=>ra._fromServerResponse(r,c));M(i.mfaPendingCredential,r,"internal-error");const o=xr._fromMfaPendingCredential(i.mfaPendingCredential);return new bd(o,s,async c=>{const u=await c._process(r,o);delete i.mfaInfo,delete i.mfaPendingCredential;const l={...i,idToken:u.idToken,refreshToken:u.refreshToken};switch(t.operationType){case"signIn":const d=await St._fromIdTokenResponse(r,t.operationType,l);return await r._updateCurrentUser(d.user),d;case"reauthenticate":return M(t.user,r,"internal-error"),St._forOperation(t.user,t.operationType,l);default:_t(r,"internal-error")}})}async resolveSignIn(e){const t=e;return this.signInResolver(t)}}function TN(n,e){var i;const t=W(n),r=e;return M(e.customData.operationType,t,"argument-error"),M((i=r.customData._serverResponse)==null?void 0:i.mfaPendingCredential,t,"argument-error"),bd._fromError(t,r)}/**
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
 */function bm(n,e){return Ie(n,"POST","/v2/accounts/mfaEnrollment:start",ye(n,e))}function vN(n,e){return Ie(n,"POST","/v2/accounts/mfaEnrollment:finalize",ye(n,e))}function AN(n,e){return Ie(n,"POST","/v2/accounts/mfaEnrollment:start",ye(n,e))}function RN(n,e){return Ie(n,"POST","/v2/accounts/mfaEnrollment:finalize",ye(n,e))}function PN(n,e){return Ie(n,"POST","/v2/accounts/mfaEnrollment:withdraw",ye(n,e))}class Sd{constructor(e){this.user=e,this.enrolledFactors=[],e._onReload(t=>{t.mfaInfo&&(this.enrolledFactors=t.mfaInfo.map(r=>ra._fromServerResponse(e.auth,r)))})}static _fromUser(e){return new Sd(e)}async getSession(){return xr._fromIdtoken(await this.user.getIdToken(),this.user)}async enroll(e,t){const r=e,i=await this.getSession(),s=await En(this.user,r._process(this.user.auth,i,t));return await this.user._updateTokensIfNecessary(s),this.user.reload()}async unenroll(e){const t=typeof e=="string"?e:e.uid,r=await this.user.getIdToken();try{const i=await En(this.user,PN(this.user.auth,{idToken:r,mfaEnrollmentId:t}));this.enrolledFactors=this.enrolledFactors.filter(({uid:s})=>s!==t),await this.user._updateTokensIfNecessary(i),await this.user.reload()}catch(i){throw i}}}const Qu=new WeakMap;function bN(n){const e=W(n);return Qu.has(e)||Qu.set(e,Sd._fromUser(e)),Qu.get(e)}const Ec="__sak";/**
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
 */class uE{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Ec,"1"),this.storage.removeItem(Ec),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const SN=1e3,VN=10;class lE extends uE{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=jI(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,c,u)=>{this.notifyListeners(o,u)});return}const r=e.key;t?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);ZV()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,VN):i()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},SN)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}lE.type="LOCAL";const hE=lE;/**
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
 */const CN=1e3;function Ju(n){var r;const e=n.replace(/[\\^$.*+?()[\]{}|]/g,"\\$&"),t=RegExp(`${e}=([^;]+)`);return((r=document.cookie.match(t))==null?void 0:r[1])??null}function Yu(n){return`${window.location.protocol==="http:"?"__dev_":"__HOST-"}FIREBASE_${n.split(":")[3]}`}class dE{constructor(){this.type="COOKIE",this.listenerUnsubscribes=new Map}_getFinalTarget(e){if(typeof window===void 0)return e;const t=new URL(`${window.location.origin}/__cookies__`);return t.searchParams.set("finalTarget",e),t}async _isAvailable(){return typeof isSecureContext=="boolean"&&!isSecureContext||typeof navigator>"u"||typeof document>"u"?!1:navigator.cookieEnabled??!0}async _set(e,t){}async _get(e){if(!this._isAvailable())return null;const t=Yu(e);if(window.cookieStore){const r=await window.cookieStore.get(t);return r==null?void 0:r.value}return Ju(t)}async _remove(e){if(!this._isAvailable()||!await this._get(e))return;const r=Yu(e);document.cookie=`${r}=;Max-Age=34560000;Partitioned;Secure;SameSite=Strict;Path=/;Priority=High`,await fetch("/__cookies__",{method:"DELETE"}).catch(()=>{})}_addListener(e,t){if(!this._isAvailable())return;const r=Yu(e);if(window.cookieStore){const c=(l=>{const d=l.changed.find(m=>m.name===r);d&&t(d.value),l.deleted.find(m=>m.name===r)&&t(null)}),u=()=>window.cookieStore.removeEventListener("change",c);return this.listenerUnsubscribes.set(t,u),window.cookieStore.addEventListener("change",c)}let i=Ju(r);const s=setInterval(()=>{const c=Ju(r);c!==i&&(t(c),i=c)},CN),o=()=>clearInterval(s);this.listenerUnsubscribes.set(t,o)}_removeListener(e,t){const r=this.listenerUnsubscribes.get(t);r&&(r(),this.listenerUnsubscribes.delete(t))}}dE.type="COOKIE";const NN=dE;/**
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
 */class fE extends uE{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}fE.type="SESSION";const Vd=fE;/**
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
 */function DN(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class au{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;const r=new au(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:i,data:s}=t.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const c=Array.from(o).map(async l=>l(t.origin,s)),u=await DN(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}au.receivers=[];/**
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
 */function cu(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
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
 */class kN{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((c,u)=>{const l=cu("",20);i.port1.start();const d=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:i,onMessage(p){const m=p;if(m.data.eventId===l)switch(m.data.status){case"ack":clearTimeout(d),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),c(m.data.response);break;default:clearTimeout(d),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:l,data:t},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function Ne(){return window}function xN(n){Ne().location.href=n}/**
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
 */function Cd(){return typeof Ne().WorkerGlobalScope<"u"&&typeof Ne().importScripts=="function"}async function ON(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function LN(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function MN(){return Cd()?self:null}/**
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
 */const pE="firebaseLocalStorageDb",FN=1,wc="firebaseLocalStorage",mE="fbase_key";class ia{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function uu(n,e){return n.transaction([wc],e?"readwrite":"readonly").objectStore(wc)}function UN(){const n=indexedDB.deleteDatabase(pE);return new ia(n).toPromise()}function gE(){const n=indexedDB.open(pE,FN);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(wc,{keyPath:mE})}catch(i){t(i)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(wc)?e(r):(r.close(),await UN(),e(await gE()))})})}async function Sm(n,e,t){const r=uu(n,!0).put({[mE]:e,value:t});return new ia(r).toPromise()}async function BN(n,e){const t=uu(n,!1).get(e),r=await new ia(t).toPromise();return r===void 0?null:r.value}function Vm(n,e){const t=uu(n,!0).delete(e);return new ia(t).toPromise()}const qN=800,$N=3;class _E{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow)),typeof document<"u"&&typeof document.addEventListener=="function"&&document.addEventListener("visibilitychange",this.onVisibilityChange)}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow)),typeof document<"u"&&typeof document.removeEventListener=="function"&&document.removeEventListener("visibilitychange",this.onVisibilityChange)}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isHiding=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isHiding=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isHiding&&(this.isHiding=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this.onVisibilityChange=()=>{typeof document<"u"&&(document.visibilityState==="hidden"?this.onPageHide():document.visibilityState==="visible"&&this.onPageShow())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){if(this.isHiding)throw new Error("Database is closing/hidden");return this.dbPromise?this.dbPromise:(this.dbPromise=gE(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(this.isHiding||t++>$N)throw r;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return Cd()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=au._getInstance(MN()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,r;if(this.activeServiceWorker=await ON(),!this.activeServiceWorker)return;this.sender=new kN(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||LN()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await Sm(e,Ec,"1"),await Vm(e,Ec)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Sm(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>BN(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Vm(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isHiding)return[];try{const e=await this._withRetries(i=>{const s=uu(i,!1).getAll();return new ia(s).toPromise()});if(this.isHiding)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}catch(e){return this.isHiding||PI(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),qN)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}_E.type="LOCAL";const yE=_E;/**
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
 */function Cm(n,e){return Ie(n,"POST","/v2/accounts/mfaSignIn:start",ye(n,e))}function jN(n,e){return Ie(n,"POST","/v2/accounts/mfaSignIn:finalize",ye(n,e))}function zN(n,e){return Ie(n,"POST","/v2/accounts/mfaSignIn:finalize",ye(n,e))}/**
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
 */const Xu=GI("rcb"),GN=new ta(3e4,6e4);class WN{constructor(){var e;this.hostLanguage="",this.counter=0,this.librarySeparatelyLoaded=!!((e=Ne().grecaptcha)!=null&&e.render)}load(e,t=""){return M(KN(t),e,"argument-error"),this.shouldResolveImmediately(t)&&_m(Ne().grecaptcha)?Promise.resolve(Ne().grecaptcha):new Promise((r,i)=>{const s=Ne().setTimeout(()=>{i(at(e,"network-request-failed"))},GN.get());Ne()[Xu]=()=>{Ne().clearTimeout(s),delete Ne()[Xu];const c=Ne().grecaptcha;if(!c||!_m(c)){i(at(e,"internal-error"));return}const u=c.render;c.render=(l,d)=>{const p=u(l,d);return this.counter++,p},this.hostLanguage=t,r(c)};const o=`${oC()}?${es({onload:Xu,render:"explicit",hl:t})}`;Td(o).catch(()=>{clearTimeout(s),i(at(e,"internal-error"))})})}clearedOneInstance(){this.counter--}shouldResolveImmediately(e){var t;return!!((t=Ne().grecaptcha)!=null&&t.render)&&(e===this.hostLanguage||this.counter>0||this.librarySeparatelyLoaded)}}function KN(n){return n.length<=6&&/^\s*[a-zA-Z0-9\-]*\s*$/.test(n)}class HN{async load(e){return new hC(e)}clearedOneInstance(){}}/**
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
 */const mo="recaptcha",QN={theme:"light",type:"image"};class JN{constructor(e,t,r={...QN}){this.parameters=r,this.type=mo,this.destroyed=!1,this.widgetId=null,this.tokenChangeListeners=new Set,this.renderPromise=null,this.recaptcha=null,this.auth=Re(e),this.isInvisible=this.parameters.size==="invisible",M(typeof document<"u",this.auth,"operation-not-supported-in-this-environment");const i=typeof t=="string"?document.getElementById(t):t;M(i,this.auth,"argument-error"),this.container=i,this.parameters.callback=this.makeTokenCallback(this.parameters.callback),this._recaptchaLoader=this.auth.settings.appVerificationDisabledForTesting?new HN:new WN,this.validateStartingState()}async verify(){this.assertNotDestroyed();const e=await this.render(),t=this.getAssertedRecaptcha(),r=t.getResponse(e);return r||new Promise(i=>{const s=o=>{o&&(this.tokenChangeListeners.delete(s),i(o))};this.tokenChangeListeners.add(s),this.isInvisible&&t.execute(e)})}render(){try{this.assertNotDestroyed()}catch(e){return Promise.reject(e)}return this.renderPromise?this.renderPromise:(this.renderPromise=this.makeRenderPromise().catch(e=>{throw this.renderPromise=null,e}),this.renderPromise)}_reset(){this.assertNotDestroyed(),this.widgetId!==null&&this.getAssertedRecaptcha().reset(this.widgetId)}clear(){this.assertNotDestroyed(),this.destroyed=!0,this._recaptchaLoader.clearedOneInstance(),this.isInvisible||this.container.childNodes.forEach(e=>{this.container.removeChild(e)})}validateStartingState(){M(!this.parameters.sitekey,this.auth,"argument-error"),M(this.isInvisible||!this.container.hasChildNodes(),this.auth,"argument-error"),M(typeof document<"u",this.auth,"operation-not-supported-in-this-environment")}makeTokenCallback(e){return t=>{if(this.tokenChangeListeners.forEach(r=>r(t)),typeof e=="function")e(t);else if(typeof e=="string"){const r=Ne()[e];typeof r=="function"&&r(t)}}}assertNotDestroyed(){M(!this.destroyed,this.auth,"internal-error")}async makeRenderPromise(){if(await this.init(),!this.widgetId){let e=this.container;if(!this.isInvisible){const t=document.createElement("div");e.appendChild(t),e=t}this.widgetId=this.getAssertedRecaptcha().render(e,this.parameters)}return this.widgetId}async init(){M(Id()&&!Cd(),this.auth,"internal-error"),await YN(),this.recaptcha=await this._recaptchaLoader.load(this.auth,this.auth.languageCode||void 0);const e=await jV(this.auth);M(e,this.auth,"internal-error"),this.parameters.sitekey=e}getAssertedRecaptcha(){return M(this.recaptcha,this.auth,"internal-error"),this.recaptcha}}function YN(){let n=null;return new Promise(e=>{if(document.readyState==="complete"){e();return}n=()=>e(),window.addEventListener("load",n)}).catch(e=>{throw n&&window.removeEventListener("load",n),e})}/**
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
 */class Nd{constructor(e,t){this.verificationId=e,this.onConfirmation=t}confirm(e){const t=Hn._fromVerification(this.verificationId,e);return this.onConfirmation(t)}}async function XN(n,e,t){if(_e(n.app))return Promise.reject(We(n));const r=Re(n),i=await lu(r,e,W(t));return new Nd(i,s=>su(r,s))}async function ZN(n,e,t){const r=W(n);await iu(!1,r,"phone");const i=await lu(r.auth,e,W(t));return new Nd(i,s=>nE(r,s))}async function eD(n,e,t){const r=W(n);if(_e(r.auth.app))return Promise.reject(We(r.auth));const i=await lu(r.auth,e,W(t));return new Nd(i,s=>rE(r,s))}async function lu(n,e,t){var r;if(!n._getRecaptchaConfig())try{await WI(n)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let i;if(typeof e=="string"?i={phoneNumber:e}:i=e,"session"in i){const s=i.session;if("phoneNumber"in i){M(s.type==="enroll",n,"internal-error");const o={idToken:s.credential,phoneEnrollmentInfo:{phoneNumber:i.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await Kn(n,o,"mfaSmsEnrollment",async(d,p)=>{if(p.phoneEnrollmentInfo.captchaResponse===fo){M((t==null?void 0:t.type)===mo,d,"argument-error");const m=await Zu(d,p,t);return bm(d,m)}return bm(d,p)},"PHONE_PROVIDER").catch(d=>Promise.reject(d))).phoneSessionInfo.sessionInfo}else{M(s.type==="signin",n,"internal-error");const o=((r=i.multiFactorHint)==null?void 0:r.uid)||i.multiFactorUid;M(o,n,"missing-multi-factor-info");const c={mfaPendingCredential:s.credential,mfaEnrollmentId:o,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await Kn(n,c,"mfaSmsSignIn",async(p,m)=>{if(m.phoneSignInInfo.captchaResponse===fo){M((t==null?void 0:t.type)===mo,p,"argument-error");const I=await Zu(p,m,t);return Cm(p,I)}return Cm(p,m)},"PHONE_PROVIDER").catch(p=>Promise.reject(p))).phoneResponseInfo.sessionInfo}}else{const s={phoneNumber:i.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await Kn(n,s,"sendVerificationCode",async(l,d)=>{if(d.captchaResponse===fo){M((t==null?void 0:t.type)===mo,l,"argument-error");const p=await Zu(l,d,t);return Rm(l,p)}return Rm(l,d)},"PHONE_PROVIDER").catch(l=>Promise.reject(l))).sessionInfo}}finally{t==null||t._reset()}}async function tD(n,e){const t=W(n);if(_e(t.auth.app))return Promise.reject(We(t.auth));await vd(t,e)}async function Zu(n,e,t){M(t.type===mo,n,"argument-error");const r=await t.verify();M(typeof r=="string",n,"argument-error");const i={...e};if("phoneEnrollmentInfo"in i){const s=i.phoneEnrollmentInfo.phoneNumber,o=i.phoneEnrollmentInfo.captchaResponse,c=i.phoneEnrollmentInfo.clientType,u=i.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(i,{phoneEnrollmentInfo:{phoneNumber:s,recaptchaToken:r,captchaResponse:o,clientType:c,recaptchaVersion:u}}),i}else if("phoneSignInInfo"in i){const s=i.phoneSignInInfo.captchaResponse,o=i.phoneSignInInfo.clientType,c=i.phoneSignInInfo.recaptchaVersion;return Object.assign(i,{phoneSignInInfo:{recaptchaToken:r,captchaResponse:s,clientType:o,recaptchaVersion:c}}),i}else return Object.assign(i,{recaptchaToken:r}),i}/**
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
 */class Fr{constructor(e){this.providerId=Fr.PROVIDER_ID,this.auth=Re(e)}verifyPhoneNumber(e,t){return lu(this.auth,e,W(t))}static credential(e,t){return Hn._fromVerification(e,t)}static credentialFromResult(e){const t=e;return Fr.credentialFromTaggedObject(t)}static credentialFromError(e){return Fr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{phoneNumber:t,temporaryProof:r}=e;return t&&r?Hn._fromTokenResponse(t,r):null}}Fr.PROVIDER_ID="phone";Fr.PHONE_SIGN_IN_METHOD="phone";/**
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
 */function oi(n,e){return e?un(e):(M(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class Dd extends ys{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return fn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return fn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return fn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function nD(n){return tE(n.auth,new Dd(n),n.bypassAuthState)}function rD(n){const{auth:e,user:t}=n;return M(t,e,"internal-error"),eE(t,new Dd(n),n.bypassAuthState)}async function iD(n){const{auth:e,user:t}=n;return M(t,e,"internal-error"),vd(t,new Dd(n),n.bypassAuthState)}/**
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
 */class IE{constructor(e,t,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:i,tenantId:s,error:o,type:c}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:t,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(l){this.reject(l)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return nD;case"linkViaPopup":case"linkViaRedirect":return iD;case"reauthViaPopup":case"reauthViaRedirect":return rD;default:_t(this.auth,"internal-error")}}resolve(e){In(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){In(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const sD=new ta(2e3,1e4);async function oD(n,e,t){if(_e(n.app))return Promise.reject(at(n,"operation-not-supported-in-this-environment"));const r=Re(n);_s(n,e,Pn);const i=oi(r,t);return new ln(r,"signInViaPopup",e,i).executeNotNull()}async function aD(n,e,t){const r=W(n);if(_e(r.auth.app))return Promise.reject(at(r.auth,"operation-not-supported-in-this-environment"));_s(r.auth,e,Pn);const i=oi(r.auth,t);return new ln(r.auth,"reauthViaPopup",e,i,r).executeNotNull()}async function cD(n,e,t){const r=W(n);_s(r.auth,e,Pn);const i=oi(r.auth,t);return new ln(r.auth,"linkViaPopup",e,i,r).executeNotNull()}class ln extends IE{constructor(e,t,r,i,s){super(e,t,i,s),this.provider=r,this.authWindow=null,this.pollId=null,ln.currentPopupAction&&ln.currentPopupAction.cancel(),ln.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return M(e,this.auth,"internal-error"),e}async onExecution(){In(this.filter.length===1,"Popup operations only handle one event");const e=cu();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(at(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(at(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,ln.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(at(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,sD.get())};e()}}ln.currentPopupAction=null;/**
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
 */const uD="pendingRedirect",Wa=new Map;class lD extends IE{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Wa.get(this.auth._key());if(!e){try{const r=await hD(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Wa.set(this.auth._key(),e)}return this.bypassAuthState||Wa.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function hD(n,e){const t=wE(e),r=EE(n);if(!await r._isAvailable())return!1;const i=await r._get(t)==="true";return await r._remove(t),i}async function kd(n,e){return EE(n)._set(wE(e),"true")}function dD(n,e){Wa.set(n._key(),e)}function EE(n){return un(n._redirectPersistence)}function wE(n){return Ga(uD,n.config.apiKey,n.name)}/**
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
 */function fD(n,e,t){return pD(n,e,t)}async function pD(n,e,t){if(_e(n.app))return Promise.reject(We(n));const r=Re(n);_s(n,e,Pn),await r._initializationPromise;const i=oi(r,t);return await kd(i,r),i._openRedirect(r,e,"signInViaRedirect")}function mD(n,e,t){return gD(n,e,t)}async function gD(n,e,t){const r=W(n);if(_s(r.auth,e,Pn),_e(r.auth.app))return Promise.reject(We(r.auth));await r.auth._initializationPromise;const i=oi(r.auth,t);await kd(i,r.auth);const s=await vE(r);return i._openRedirect(r.auth,e,"reauthViaRedirect",s)}function _D(n,e,t){return yD(n,e,t)}async function yD(n,e,t){const r=W(n);_s(r.auth,e,Pn),await r.auth._initializationPromise;const i=oi(r.auth,t);await iu(!1,r,e.providerId),await kd(i,r.auth);const s=await vE(r);return i._openRedirect(r.auth,e,"linkViaRedirect",s)}async function ID(n,e){return await Re(n)._initializationPromise,TE(n,e,!1)}async function TE(n,e,t=!1){if(_e(n.app))return Promise.reject(We(n));const r=Re(n),i=oi(r,e),o=await new lD(r,i,t).execute();return o&&!t&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}async function vE(n){const e=cu(`${n.uid}:::`);return n._redirectEventId=e,await n.auth._setRedirectUser(n),await n.auth._persistUserIfCurrent(n),e}/**
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
 */const ED=600*1e3;class wD{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!TD(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!AE(e)){const i=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(at(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=ED&&this.cachedEventUids.clear(),this.cachedEventUids.has(Nm(e))}saveEventToCache(e){this.cachedEventUids.add(Nm(e)),this.lastProcessedEventTime=Date.now()}}function Nm(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function AE({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function TD(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return AE(n);default:return!1}}/**
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
 */async function vD(n,e={}){return Ie(n,"GET","/v1/projects",e)}/**
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
 */const AD=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,RD=/^https?/;async function PD(n){if(n.config.emulator)return;const{authorizedDomains:e}=await vD(n);for(const t of e)try{if(bD(t))return}catch{}_t(n,"unauthorized-domain")}function bD(n){const e=ko(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!RD.test(t))return!1;if(AD.test(n))return r===n;const i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
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
 */const SD=new ta(3e4,6e4);function Dm(){const n=Ne().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function VD(n){return new Promise((e,t)=>{var i,s,o;function r(){Dm(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Dm(),t(at(n,"network-request-failed"))},timeout:SD.get()})}if((s=(i=Ne().gapi)==null?void 0:i.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((o=Ne().gapi)!=null&&o.load)r();else{const c=GI("iframefcb");return Ne()[c]=()=>{gapi.load?r():t(at(n,"network-request-failed"))},Td(`${cC()}?onload=${c}`).catch(u=>t(u))}}).catch(e=>{throw Ka=null,e})}let Ka=null;function CD(n){return Ka=Ka||VD(n),Ka}/**
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
 */const ND=new ta(5e3,15e3),DD="__/auth/iframe",kD="emulator/auth/iframe",xD={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},OD=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function LD(n){const e=n.config;M(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Ed(e,kD):`https://${n.config.authDomain}/${DD}`,r={apiKey:e.apiKey,appName:n.name,v:lr},i=OD.get(n.config.apiHost);i&&(r.eid=i);const s=n._getFrameworks();return s.length&&(r.fw=s.join(",")),`${t}?${es(r).slice(1)}`}async function MD(n){const e=await CD(n),t=Ne().gapi;return M(t,n,"internal-error"),e.open({where:document.body,url:LD(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:xD,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const o=at(n,"network-request-failed"),c=Ne().setTimeout(()=>{s(o)},ND.get());function u(){Ne().clearTimeout(c),i(r)}r.ping(u).then(u,()=>{s(o)})}))}/**
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
 */const FD={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},UD=500,BD=600,qD="_blank",$D="http://localhost";class km{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function jD(n,e,t,r=UD,i=BD){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const u={...FD,width:r.toString(),height:i.toString(),top:s,left:o},l=Me().toLowerCase();t&&(c=FI(l)?qD:t),LI(l)&&(e=e||$D,u.scrollbars="yes");const d=Object.entries(u).reduce((m,[I,P])=>`${m}${I}=${P},`,"");if(XV(l)&&c!=="_self")return zD(e||"",c),new km(null);const p=window.open(e||"",c,d);M(p,n,"popup-blocked");try{p.focus()}catch{}return new km(p)}function zD(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
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
 */const GD="__/auth/handler",WD="emulator/auth/handler",KD=encodeURIComponent("fac");async function xm(n,e,t,r,i,s){M(n.config.authDomain,n,"auth-domain-config-required"),M(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:lr,eventId:i};if(e instanceof Pn){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",qw(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,p]of Object.entries({}))o[d]=p}if(e instanceof Es){const d=e.getScopes().filter(p=>p!=="");d.length>0&&(o.scopes=d.join(","))}n.tenantId&&(o.tid=n.tenantId);const c=o;for(const d of Object.keys(c))c[d]===void 0&&delete c[d];const u=await n._getAppCheckToken(),l=u?`#${KD}=${encodeURIComponent(u)}`:"";return`${HD(n)}?${es(c).slice(1)}${l}`}function HD({config:n}){return n.emulator?Ed(n,WD):`https://${n.authDomain}/${GD}`}/**
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
 */const el="webStorageSupport";class QD{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Vd,this._completeRedirectFn=TE,this._overrideRedirectResult=dD}async _openPopup(e,t,r,i){var o;In((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const s=await xm(e,t,r,ko(),i);return jD(e,s,cu())}async _openRedirect(e,t,r,i){await this._originValidation(e);const s=await xm(e,t,r,ko(),i);return xN(s),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:s}=this.eventManagers[t];return i?Promise.resolve(i):(In(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await MD(e),r=new wD(e);return t.register("authEvent",i=>(M(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(el,{type:el},i=>{var o;const s=(o=i==null?void 0:i[0])==null?void 0:o[el];s!==void 0&&t(!!s),_t(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=PD(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return jI()||MI()||wd()}}const RE=QD;class PE{constructor(e){this.factorId=e}_process(e,t,r){switch(t.type){case"enroll":return this._finalizeEnroll(e,t.credential,r);case"signin":return this._finalizeSignIn(e,t.credential);default:return Gt("unexpected MultiFactorSessionType")}}}class xd extends PE{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new xd(e)}_finalizeEnroll(e,t,r){return vN(e,{idToken:t,displayName:r,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,t){return jN(e,{mfaPendingCredential:t,phoneVerificationInfo:this.credential._makeVerificationRequest()})}}class bE{constructor(){}static assertion(e){return xd._fromCredential(e)}}bE.FACTOR_ID="phone";class SE{static assertionForEnrollment(e,t){return Lo._fromSecret(e,t)}static assertionForSignIn(e,t){return Lo._fromEnrollmentId(e,t)}static async generateSecret(e){var i;const t=e;M(typeof((i=t.user)==null?void 0:i.auth)<"u","internal-error");const r=await AN(t.user.auth,{idToken:t.credential,totpEnrollmentInfo:{}});return hu._fromStartTotpMfaEnrollmentResponse(r,t.user.auth)}}SE.FACTOR_ID="totp";class Lo extends PE{constructor(e,t,r){super("totp"),this.otp=e,this.enrollmentId=t,this.secret=r}static _fromSecret(e,t){return new Lo(t,void 0,e)}static _fromEnrollmentId(e,t){return new Lo(t,e)}async _finalizeEnroll(e,t,r){return M(typeof this.secret<"u",e,"argument-error"),RN(e,{idToken:t,displayName:r,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,t){M(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");const r={verificationCode:this.otp};return zN(e,{mfaPendingCredential:t,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:r})}}class hu{constructor(e,t,r,i,s,o,c){this.sessionInfo=o,this.auth=c,this.secretKey=e,this.hashingAlgorithm=t,this.codeLength=r,this.codeIntervalSeconds=i,this.enrollmentCompletionDeadline=s}static _fromStartTotpMfaEnrollmentResponse(e,t){return new hu(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,t)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,t){var i;let r=!1;return(Na(e)||Na(t))&&(r=!0),r&&(Na(e)&&(e=((i=this.auth.currentUser)==null?void 0:i.email)||"unknownuser"),Na(t)&&(t=this.auth.name)),`otpauth://totp/${t}:${e}?secret=${this.secretKey}&issuer=${t}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}}function Na(n){return typeof n>"u"||(n==null?void 0:n.length)===0}var Om="@firebase/auth",Lm="1.13.4";/**
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
 */class JD{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){M(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function YD(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function XD(n){Yn(new Qn("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=r.options;M(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:o,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:zI(n)},l=new iC(r,i,s,u);return _C(l,t),l},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Yn(new Qn("auth-internal",e=>{const t=Re(e.getProvider("auth").getImmediate());return(r=>new JD(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Pt(Om,Lm,YD(n)),Pt(Om,Lm,"esm2020")}/**
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
 */const ZD=300,ek=Hm("authIdTokenMaxAge")||ZD;let Mm=null;const tk=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>ek)return;const i=t==null?void 0:t.token;Mm!==i&&(Mm=i,await fetch(n,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function nk(n=Ac()){const e=Jr(n,"auth");if(e.isInitialized())return e.getImmediate();const t=KI(n,{popupRedirectResolver:RE,persistence:[yE,hE,Vd]}),r=Hm("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const o=tk(s.toString());cE(t,o,()=>o(t.currentUser)),aE(t,c=>o(c))}}const i=Wm("auth");return i&&HI(t,`http://${i}`),t}function rk(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}sC({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{const s=at("internal-error");s.customData=i,t(s)},r.type="text/javascript",r.charset="UTF-8",rk().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});XD("Browser");const vx=Object.freeze(Object.defineProperty({__proto__:null,ActionCodeOperation:DV,ActionCodeURL:Is,AuthCredential:ys,AuthErrorCodes:OV,EmailAuthCredential:Zi,EmailAuthProvider:_r,FacebookAuthProvider:rn,FactorId:SV,GithubAuthProvider:on,GoogleAuthProvider:sn,OAuthCredential:Zt,OAuthProvider:po,OperationType:NV,PhoneAuthCredential:Hn,PhoneAuthProvider:Fr,PhoneMultiFactorGenerator:bE,ProviderId:VV,RecaptchaVerifier:JN,SAMLAuthProvider:yc,SignInMethod:CV,TotpMultiFactorGenerator:SE,TotpSecret:hu,TwitterAuthProvider:an,applyActionCode:WC,beforeAuthStateChanged:cE,browserCookiePersistence:NN,browserLocalPersistence:hE,browserPopupRedirectResolver:RE,browserSessionPersistence:Vd,checkActionCode:iE,confirmPasswordReset:GC,connectAuthEmulator:HI,createUserWithEmailAndPassword:HC,debugErrorMap:xV,deleteUser:wN,fetchSignInMethodsForEmail:eN,getAdditionalUserInfo:dN,getAuth:nk,getIdToken:WV,getIdTokenResult:DI,getMultiFactorResolver:TN,getRedirectResult:ID,inMemoryPersistence:Ml,indexedDBLocalPersistence:yE,initializeAuth:KI,initializeRecaptchaConfig:pN,isSignInWithEmailLink:YC,linkWithCredential:nE,linkWithPhoneNumber:ZN,linkWithPopup:cD,linkWithRedirect:_D,multiFactor:bN,onAuthStateChanged:gN,onIdTokenChanged:aE,parseActionCodeURL:MC,prodErrorMap:AI,reauthenticateWithCredential:rE,reauthenticateWithPhoneNumber:eD,reauthenticateWithPopup:aD,reauthenticateWithRedirect:mD,reload:kI,revokeAccessToken:EN,sendEmailVerification:tN,sendPasswordResetEmail:zC,sendSignInLinkToEmail:JC,setPersistence:fN,signInAnonymously:BC,signInWithCredential:su,signInWithCustomToken:jC,signInWithEmailAndPassword:QC,signInWithEmailLink:XC,signInWithPhoneNumber:XN,signInWithPopup:oD,signInWithRedirect:fD,signOut:IN,unlink:qC,updateCurrentUser:yN,updateEmail:sN,updatePassword:oN,updatePhoneNumber:tD,updateProfile:iN,useDeviceLanguage:_N,validatePassword:mN,verifyBeforeUpdateEmail:nN,verifyPasswordResetCode:KC},Symbol.toStringTag,{value:"Module"}));/**
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
 */const VE="firebasestorage.googleapis.com",CE="storageBucket",ik=120*1e3,sk=600*1e3;/**
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
 */class Pe extends Ot{constructor(e,t,r=0){super(tl(e),`Firebase Storage: ${t} (${tl(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,Pe.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return tl(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var Ae;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(Ae||(Ae={}));function tl(n){return"storage/"+n}function Od(){const n="An unknown error occurred, please check the error payload for server response.";return new Pe(Ae.UNKNOWN,n)}function ok(n){return new Pe(Ae.OBJECT_NOT_FOUND,"Object '"+n+"' does not exist.")}function ak(n){return new Pe(Ae.QUOTA_EXCEEDED,"Quota for bucket '"+n+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function ck(){const n="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new Pe(Ae.UNAUTHENTICATED,n)}function uk(){return new Pe(Ae.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function lk(n){return new Pe(Ae.UNAUTHORIZED,"User does not have permission to access '"+n+"'.")}function hk(){return new Pe(Ae.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function dk(){return new Pe(Ae.CANCELED,"User canceled the upload/download.")}function fk(n){return new Pe(Ae.INVALID_URL,"Invalid URL '"+n+"'.")}function pk(n){return new Pe(Ae.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function mk(){return new Pe(Ae.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+CE+"' property when initializing the app?")}function gk(){return new Pe(Ae.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function _k(){return new Pe(Ae.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function yk(n){return new Pe(Ae.UNSUPPORTED_ENVIRONMENT,`${n} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function Fl(n){return new Pe(Ae.INVALID_ARGUMENT,n)}function NE(){return new Pe(Ae.APP_DELETED,"The Firebase app was deleted.")}function Ik(n){return new Pe(Ae.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function go(n,e){return new Pe(Ae.INVALID_FORMAT,"String does not match format '"+n+"': "+e)}function zs(n){throw new Pe(Ae.INTERNAL_ERROR,"Internal error: "+n)}/**
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
 */class Tt{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let r;try{r=Tt.makeFromUrl(e,t)}catch{return new Tt(e,"")}if(r.path==="")return r;throw pk(e)}static makeFromUrl(e,t){let r=null;const i="([A-Za-z0-9.\\-_]+)";function s(Y){Y.path.charAt(Y.path.length-1)==="/"&&(Y.path_=Y.path_.slice(0,-1))}const o="(/(.*))?$",c=new RegExp("^gs://"+i+o,"i"),u={bucket:1,path:3};function l(Y){Y.path_=decodeURIComponent(Y.path)}const d="v[A-Za-z0-9_]+",p=t.replace(/[.]/g,"\\."),m="(/([^?#]*).*)?$",I=new RegExp(`^https?://${p}/${d}/b/${i}/o${m}`,"i"),P={bucket:1,path:3},x=t===VE?"(?:storage.googleapis.com|storage.cloud.google.com)":t,D="([^?#]*)",$=new RegExp(`^https?://${x}/${i}/${D}`,"i"),z=[{regex:c,indices:u,postModify:s},{regex:I,indices:P,postModify:l},{regex:$,indices:{bucket:1,path:2},postModify:l}];for(let Y=0;Y<z.length;Y++){const ee=z[Y],re=ee.regex.exec(e);if(re){const w=re[ee.indices.bucket];let _=re[ee.indices.path];_||(_=""),r=new Tt(w,_),ee.postModify(r);break}}if(r==null)throw fk(e);return r}}class Ek{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
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
 */function wk(n,e,t){let r=1,i=null,s=null,o=!1,c=0;function u(){return c===2}let l=!1;function d(...D){l||(l=!0,e.apply(null,D))}function p(D){i=setTimeout(()=>{i=null,n(I,u())},D)}function m(){s&&clearTimeout(s)}function I(D,...$){if(l){m();return}if(D){m(),d.call(null,D,...$);return}if(u()||o){m(),d.call(null,D,...$);return}r<64&&(r*=2);let z;c===1?(c=2,z=0):z=(r+Math.random())*1e3,p(z)}let P=!1;function x(D){P||(P=!0,m(),!l&&(i!==null?(D||(c=2),clearTimeout(i),p(0)):D||(c=1)))}return p(0),s=setTimeout(()=>{o=!0,x(!0)},t),x}function Tk(n){n(!1)}/**
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
 */function vk(n){return n!==void 0}function Ak(n){return typeof n=="object"&&!Array.isArray(n)}function Ld(n){return typeof n=="string"||n instanceof String}function Fm(n){return Md()&&n instanceof Blob}function Md(){return typeof Blob<"u"}function Um(n,e,t,r){if(r<e)throw Fl(`Invalid value for '${n}'. Expected ${e} or greater.`);if(r>t)throw Fl(`Invalid value for '${n}'. Expected ${t} or less.`)}/**
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
 */function Fd(n,e,t){let r=e;return t==null&&(r=`https://${e}`),`${t}://${r}/v0${n}`}function DE(n){const e=encodeURIComponent;let t="?";for(const r in n)if(n.hasOwnProperty(r)){const i=e(r)+"="+e(n[r]);t=t+i+"&"}return t=t.slice(0,-1),t}var Ur;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(Ur||(Ur={}));/**
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
 */function Rk(n,e){const t=n>=500&&n<600,i=[408,429].indexOf(n)!==-1,s=e.indexOf(n)!==-1;return t||i||s}/**
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
 */class Pk{constructor(e,t,r,i,s,o,c,u,l,d,p,m=!0,I=!1){this.url_=e,this.method_=t,this.headers_=r,this.body_=i,this.successCodes_=s,this.additionalRetryCodes_=o,this.callback_=c,this.errorCallback_=u,this.timeout_=l,this.progressCallback_=d,this.connectionFactory_=p,this.retry=m,this.isUsingEmulator=I,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((P,x)=>{this.resolve_=P,this.reject_=x,this.start_()})}start_(){const e=(r,i)=>{if(i){r(!1,new Da(!1,null,!0));return}const s=this.connectionFactory_();this.pendingConnection_=s;const o=c=>{const u=c.loaded,l=c.lengthComputable?c.total:-1;this.progressCallback_!==null&&this.progressCallback_(u,l)};this.progressCallback_!==null&&s.addUploadProgressListener(o),s.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&s.removeUploadProgressListener(o),this.pendingConnection_=null;const c=s.getErrorCode()===Ur.NO_ERROR,u=s.getStatus();if(!c||Rk(u,this.additionalRetryCodes_)&&this.retry){const d=s.getErrorCode()===Ur.ABORT;r(!1,new Da(!1,null,d));return}const l=this.successCodes_.indexOf(u)!==-1;r(!0,new Da(l,s))})},t=(r,i)=>{const s=this.resolve_,o=this.reject_,c=i.connection;if(i.wasSuccessCode)try{const u=this.callback_(c,c.getResponse());vk(u)?s(u):s()}catch(u){o(u)}else if(c!==null){const u=Od();u.serverResponse=c.getErrorText(),this.errorCallback_?o(this.errorCallback_(c,u)):o(u)}else if(i.canceled){const u=this.appDelete_?NE():dk();o(u)}else{const u=hk();o(u)}};this.canceled_?t(!1,new Da(!1,null,!0)):this.backoffId_=wk(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&Tk(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class Da{constructor(e,t,r){this.wasSuccessCode=e,this.connection=t,this.canceled=!!r}}function bk(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function Sk(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function Vk(n,e){e&&(n["X-Firebase-GMPID"]=e)}function Ck(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function Nk(n,e,t,r,i,s,o=!0,c=!1){const u=DE(n.urlParams),l=n.url+u,d=Object.assign({},n.headers);return Vk(d,e),bk(d,t),Sk(d,s),Ck(d,r),new Pk(l,n.method,d,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,i,o,c)}/**
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
 */function Dk(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function kk(...n){const e=Dk();if(e!==void 0){const t=new e;for(let r=0;r<n.length;r++)t.append(n[r]);return t.getBlob()}else{if(Md())return new Blob(n);throw new Pe(Ae.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function xk(n,e,t){return n.webkitSlice?n.webkitSlice(e,t):n.mozSlice?n.mozSlice(e,t):n.slice?n.slice(e,t):null}/**
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
 */function Ok(n){if(typeof atob>"u")throw yk("base-64");return atob(n)}/**
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
 */const Wt={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class nl{constructor(e,t){this.data=e,this.contentType=t||null}}function Lk(n,e){switch(n){case Wt.RAW:return new nl(kE(e));case Wt.BASE64:case Wt.BASE64URL:return new nl(xE(n,e));case Wt.DATA_URL:return new nl(Fk(e),Uk(e))}throw Od()}function kE(n){const e=[];for(let t=0;t<n.length;t++){let r=n.charCodeAt(t);if(r<=127)e.push(r);else if(r<=2047)e.push(192|r>>6,128|r&63);else if((r&64512)===55296)if(!(t<n.length-1&&(n.charCodeAt(t+1)&64512)===56320))e.push(239,191,189);else{const s=r,o=n.charCodeAt(++t);r=65536|(s&1023)<<10|o&1023,e.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63)}else(r&64512)===56320?e.push(239,191,189):e.push(224|r>>12,128|r>>6&63,128|r&63)}return new Uint8Array(e)}function Mk(n){let e;try{e=decodeURIComponent(n)}catch{throw go(Wt.DATA_URL,"Malformed data URL.")}return kE(e)}function xE(n,e){switch(n){case Wt.BASE64:{const i=e.indexOf("-")!==-1,s=e.indexOf("_")!==-1;if(i||s)throw go(n,"Invalid character '"+(i?"-":"_")+"' found: is it base64url encoded?");break}case Wt.BASE64URL:{const i=e.indexOf("+")!==-1,s=e.indexOf("/")!==-1;if(i||s)throw go(n,"Invalid character '"+(i?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let t;try{t=Ok(e)}catch(i){throw i.message.includes("polyfill")?i:go(n,"Invalid character found")}const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}class OE{constructor(e){this.base64=!1,this.contentType=null;const t=e.match(/^data:([^,]+)?,/);if(t===null)throw go(Wt.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const r=t[1]||null;r!=null&&(this.base64=Bk(r,";base64"),this.contentType=this.base64?r.substring(0,r.length-7):r),this.rest=e.substring(e.indexOf(",")+1)}}function Fk(n){const e=new OE(n);return e.base64?xE(Wt.BASE64,e.rest):Mk(e.rest)}function Uk(n){return new OE(n).contentType}function Bk(n,e){return n.length>=e.length?n.substring(n.length-e.length)===e:!1}/**
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
 */class Bn{constructor(e,t){let r=0,i="";Fm(e)?(this.data_=e,r=e.size,i=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),r=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),r=e.length),this.size_=r,this.type_=i}size(){return this.size_}type(){return this.type_}slice(e,t){if(Fm(this.data_)){const r=this.data_,i=xk(r,e,t);return i===null?null:new Bn(i)}else{const r=new Uint8Array(this.data_.buffer,e,t-e);return new Bn(r,!0)}}static getBlob(...e){if(Md()){const t=e.map(r=>r instanceof Bn?r.data_:r);return new Bn(kk.apply(null,t))}else{const t=e.map(o=>Ld(o)?Lk(Wt.RAW,o).data:o.data_);let r=0;t.forEach(o=>{r+=o.byteLength});const i=new Uint8Array(r);let s=0;return t.forEach(o=>{for(let c=0;c<o.length;c++)i[s++]=o[c]}),new Bn(i,!0)}}uploadData(){return this.data_}}/**
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
 */function LE(n){let e;try{e=JSON.parse(n)}catch{return null}return Ak(e)?e:null}/**
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
 */function qk(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function $k(n,e){const t=e.split("/").filter(r=>r.length>0).join("/");return n.length===0?t:n+"/"+t}function ME(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
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
 */function jk(n,e){return e}class st{constructor(e,t,r,i){this.server=e,this.local=t||e,this.writable=!!r,this.xform=i||jk}}let ka=null;function zk(n){return!Ld(n)||n.length<2?n:ME(n)}function FE(){if(ka)return ka;const n=[];n.push(new st("bucket")),n.push(new st("generation")),n.push(new st("metageneration")),n.push(new st("name","fullPath",!0));function e(s,o){return zk(o)}const t=new st("name");t.xform=e,n.push(t);function r(s,o){return o!==void 0?Number(o):o}const i=new st("size");return i.xform=r,n.push(i),n.push(new st("timeCreated")),n.push(new st("updated")),n.push(new st("md5Hash",null,!0)),n.push(new st("cacheControl",null,!0)),n.push(new st("contentDisposition",null,!0)),n.push(new st("contentEncoding",null,!0)),n.push(new st("contentLanguage",null,!0)),n.push(new st("contentType",null,!0)),n.push(new st("metadata","customMetadata",!0)),ka=n,ka}function Gk(n,e){function t(){const r=n.bucket,i=n.fullPath,s=new Tt(r,i);return e._makeStorageReference(s)}Object.defineProperty(n,"ref",{get:t})}function Wk(n,e,t){const r={};r.type="file";const i=t.length;for(let s=0;s<i;s++){const o=t[s];r[o.local]=o.xform(r,e[o.server])}return Gk(r,n),r}function UE(n,e,t){const r=LE(e);return r===null?null:Wk(n,r,t)}function Kk(n,e,t,r){const i=LE(e);if(i===null||!Ld(i.downloadTokens))return null;const s=i.downloadTokens;if(s.length===0)return null;const o=encodeURIComponent;return s.split(",").map(l=>{const d=n.bucket,p=n.fullPath,m="/b/"+o(d)+"/o/"+o(p),I=Fd(m,t,r),P=DE({alt:"media",token:l});return I+P})[0]}function Hk(n,e){const t={},r=e.length;for(let i=0;i<r;i++){const s=e[i];s.writable&&(t[s.server]=n[s.local])}return JSON.stringify(t)}class BE{constructor(e,t,r,i){this.url=e,this.method=t,this.handler=r,this.timeout=i,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
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
 */function qE(n){if(!n)throw Od()}function Qk(n,e){function t(r,i){const s=UE(n,i,e);return qE(s!==null),s}return t}function Jk(n,e){function t(r,i){const s=UE(n,i,e);return qE(s!==null),Kk(s,i,n.host,n._protocol)}return t}function $E(n){function e(t,r){let i;return t.getStatus()===401?t.getErrorText().includes("Firebase App Check token is invalid")?i=uk():i=ck():t.getStatus()===402?i=ak(n.bucket):t.getStatus()===403?i=lk(n.path):i=r,i.status=t.getStatus(),i.serverResponse=r.serverResponse,i}return e}function Yk(n){const e=$E(n);function t(r,i){let s=e(r,i);return r.getStatus()===404&&(s=ok(n.path)),s.serverResponse=i.serverResponse,s}return t}function Xk(n,e,t){const r=e.fullServerUrl(),i=Fd(r,n.host,n._protocol),s="GET",o=n.maxOperationRetryTime,c=new BE(i,s,Jk(n,t),o);return c.errorHandler=Yk(e),c}function Zk(n,e){return n&&n.contentType||e&&e.type()||"application/octet-stream"}function ex(n,e,t){const r=Object.assign({},t);return r.fullPath=n.path,r.size=e.size(),r.contentType||(r.contentType=Zk(null,e)),r}function tx(n,e,t,r,i){const s=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function c(){let z="";for(let Y=0;Y<2;Y++)z=z+Math.random().toString().slice(2);return z}const u=c();o["Content-Type"]="multipart/related; boundary="+u;const l=ex(e,r,i),d=Hk(l,t),p="--"+u+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+d+`\r
--`+u+`\r
Content-Type: `+l.contentType+`\r
\r
`,m=`\r
--`+u+"--",I=Bn.getBlob(p,r,m);if(I===null)throw gk();const P={name:l.fullPath},x=Fd(s,n.host,n._protocol),D="POST",$=n.maxUploadRetryTime,G=new BE(x,D,Qk(n,t),$);return G.urlParams=P,G.headers=o,G.body=I.uploadData(),G.errorHandler=$E(e),G}/**
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
 */class nx{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=Ur.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=Ur.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=Ur.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,t,r,i,s){if(this.sent_)throw zs("cannot .send() more than once");if(ur(e)&&r&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(t,e,!0),s!==void 0)for(const o in s)s.hasOwnProperty(o)&&this.xhr_.setRequestHeader(o,s[o].toString());return i!==void 0?this.xhr_.send(i):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw zs("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw zs("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw zs("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw zs("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class rx extends nx{initXhr(){this.xhr_.responseType="text"}}function jE(){return new rx}/**
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
 */class Qr{constructor(e,t){this._service=e,t instanceof Tt?this._location=t:this._location=Tt.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new Qr(e,t)}get root(){const e=new Tt(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return ME(this._location.path)}get storage(){return this._service}get parent(){const e=qk(this._location.path);if(e===null)return null;const t=new Tt(this._location.bucket,e);return new Qr(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw Ik(e)}}function ix(n,e,t){n._throwIfRoot("uploadBytes");const r=tx(n.storage,n._location,FE(),new Bn(e,!0),t);return n.storage.makeRequestWithTokens(r,jE).then(i=>({metadata:i,ref:n}))}function sx(n){n._throwIfRoot("getDownloadURL");const e=Xk(n.storage,n._location,FE());return n.storage.makeRequestWithTokens(e,jE).then(t=>{if(t===null)throw _k();return t})}function ox(n,e){const t=$k(n._location.path,e),r=new Tt(n._location.bucket,t);return new Qr(n.storage,r)}/**
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
 */function ax(n){return/^[A-Za-z]+:\/\//.test(n)}function cx(n,e){return new Qr(n,e)}function zE(n,e){if(n instanceof Ud){const t=n;if(t._bucket==null)throw mk();const r=new Qr(t,t._bucket);return e!=null?zE(r,e):r}else return e!==void 0?ox(n,e):n}function ux(n,e){if(e&&ax(e)){if(n instanceof Ud)return cx(n,e);throw Fl("To use ref(service, url), the first argument must be a Storage instance.")}else return zE(n,e)}function Bm(n,e){const t=e==null?void 0:e[CE];return t==null?null:Tt.makeFromBucketSpec(t,n)}function lx(n,e,t,r={}){n.host=`${e}:${t}`;const i=ur(e);i&&vc(`https://${n.host}/b`),n._isUsingEmulator=!0,n._protocol=i?"https":"http";const{mockUserToken:s}=r;s&&(n._overrideAuthToken=typeof s=="string"?s:Jm(s,n.app.options.projectId))}class Ud{constructor(e,t,r,i,s,o=!1){this.app=e,this._authProvider=t,this._appCheckProvider=r,this._url=i,this._firebaseVersion=s,this._isUsingEmulator=o,this._bucket=null,this._host=VE,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=ik,this._maxUploadRetryTime=sk,this._requests=new Set,i!=null?this._bucket=Tt.makeFromBucketSpec(i,this._host):this._bucket=Bm(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=Tt.makeFromBucketSpec(this._url,e):this._bucket=Bm(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){Um("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){Um("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){if(_e(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new Qr(this,e)}_makeRequest(e,t,r,i,s=!0){if(this._deleted)return new Ek(NE());{const o=Nk(e,this._appId,r,i,t,this._firebaseVersion,s,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,t){const[r,i]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,r,i).getPromise()}}const qm="@firebase/storage",$m="0.14.4";/**
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
 */const GE="storage";function Ax(n,e,t){return n=W(n),ix(n,e,t)}function Rx(n){return n=W(n),sx(n)}function Px(n,e){return n=W(n),ux(n,e)}function bx(n=Ac(),e){n=W(n);const r=Jr(n,GE).getImmediate({identifier:e}),i=Km("storage");return i&&hx(r,...i),r}function hx(n,e,t,r={}){lx(n,e,t,r)}/**
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
 */function dx(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),r=n.getProvider("auth-internal"),i=n.getProvider("app-check-internal");return new Ud(t,r,i,e,lr)}function fx(){Yn(new Qn(GE,dx,"PUBLIC").setMultipleInstances(!0)),Pt(qm,$m,""),Pt(qm,$m,"esm2020")}fx();export{Px as A,Ax as B,Rx as C,fN as D,hE as E,Vd as F,QC as G,mx as H,Tx as I,vx as J,Ac as a,_S as b,yS as c,nk as d,bx as e,dV as f,xT as g,yA as h,ag as i,_V as j,x_ as k,mV as l,YS as m,IN as n,gN as o,uV as p,VS as q,E_ as r,JT as s,Ol as t,gV as u,kS as v,CS as w,wV as x,cV as y,zC as z};
