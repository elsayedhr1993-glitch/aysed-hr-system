function Ae(t,r){for(var n=0;n<r.length;n++){const i=r[n];if(typeof i!="string"&&!Array.isArray(i)){for(const u in i)if(u!=="default"&&!(u in t)){const a=Object.getOwnPropertyDescriptor(i,u);a&&Object.defineProperty(t,u,a.get?a:{enumerable:!0,get:()=>i[u]})}}}return Object.freeze(Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}))}var yt=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function je(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var X={exports:{}},l={};/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var se;function $e(){if(se)return l;se=1;var t=Symbol.for("react.transitional.element"),r=Symbol.for("react.portal"),n=Symbol.for("react.fragment"),i=Symbol.for("react.strict_mode"),u=Symbol.for("react.profiler"),a=Symbol.for("react.consumer"),s=Symbol.for("react.context"),p=Symbol.for("react.forward_ref"),d=Symbol.for("react.suspense"),b=Symbol.for("react.memo"),v=Symbol.for("react.lazy"),g=Symbol.for("react.activity"),w=Symbol.iterator;function x(e){return e===null||typeof e!="object"?null:(e=w&&e[w]||e["@@iterator"],typeof e=="function"?e:null)}var I={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},M=Object.assign,H={};function $(e,o,f){this.props=e,this.context=o,this.refs=H,this.updater=f||I}$.prototype.isReactComponent={},$.prototype.setState=function(e,o){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,o,"setState")},$.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function L(){}L.prototype=$.prototype;function R(e,o,f){this.props=e,this.context=o,this.refs=H,this.updater=f||I}var N=R.prototype=new L;N.constructor=R,M(N,$.prototype),N.isPureReactComponent=!0;var te=Array.isArray;function F(){}var E={H:null,A:null,T:null,S:null},re=Object.prototype.hasOwnProperty;function W(e,o,f){var c=f.ref;return{$$typeof:t,type:e,key:o,ref:c!==void 0?c:null,props:f}}function we(e,o){return W(e.type,o,e.props)}function Z(e){return typeof e=="object"&&e!==null&&e.$$typeof===t}function Te(e){var o={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(f){return o[f]})}var oe=/\/+/g;function Q(e,o){return typeof e=="object"&&e!==null&&e.key!=null?Te(""+e.key):o.toString(36)}function xe(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(F,F):(e.status="pending",e.then(function(o){e.status==="pending"&&(e.status="fulfilled",e.value=o)},function(o){e.status==="pending"&&(e.status="rejected",e.reason=o)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function D(e,o,f,c,y){var h=typeof e;(h==="undefined"||h==="boolean")&&(e=null);var _=!1;if(e===null)_=!0;else switch(h){case"bigint":case"string":case"number":_=!0;break;case"object":switch(e.$$typeof){case t:case r:_=!0;break;case v:return _=e._init,D(_(e._payload),o,f,c,y)}}if(_)return y=y(e),_=c===""?"."+Q(e,0):c,te(y)?(f="",_!=null&&(f=_.replace(oe,"$&/")+"/"),D(y,o,f,"",function(Oe){return Oe})):y!=null&&(Z(y)&&(y=we(y,f+(y.key==null||e&&e.key===y.key?"":(""+y.key).replace(oe,"$&/")+"/")+_)),o.push(y)),1;_=0;var O=c===""?".":c+":";if(te(e))for(var C=0;C<e.length;C++)c=e[C],h=O+Q(c,C),_+=D(c,o,f,h,y);else if(C=x(e),typeof C=="function")for(e=C.call(e),C=0;!(c=e.next()).done;)c=c.value,h=O+Q(c,C++),_+=D(c,o,f,h,y);else if(h==="object"){if(typeof e.then=="function")return D(xe(e),o,f,c,y);throw o=String(e),Error("Objects are not valid as a React child (found: "+(o==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":o)+"). If you meant to render a collection of children, use an array instead.")}return _}function U(e,o,f){if(e==null)return e;var c=[],y=0;return D(e,c,"","",function(h){return o.call(f,h,y++)}),c}function Re(e){if(e._status===-1){var o=e._result;o=o(),o.then(function(f){(e._status===0||e._status===-1)&&(e._status=1,e._result=f)},function(f){(e._status===0||e._status===-1)&&(e._status=2,e._result=f)}),e._status===-1&&(e._status=0,e._result=o)}if(e._status===1)return e._result.default;throw e._result}var ne=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var o=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(o))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},Ce={map:U,forEach:function(e,o,f){U(e,function(){o.apply(this,arguments)},f)},count:function(e){var o=0;return U(e,function(){o++}),o},toArray:function(e){return U(e,function(o){return o})||[]},only:function(e){if(!Z(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};return l.Activity=g,l.Children=Ce,l.Component=$,l.Fragment=n,l.Profiler=u,l.PureComponent=R,l.StrictMode=i,l.Suspense=d,l.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=E,l.__COMPILER_RUNTIME={__proto__:null,c:function(e){return E.H.useMemoCache(e)}},l.cache=function(e){return function(){return e.apply(null,arguments)}},l.cacheSignal=function(){return null},l.cloneElement=function(e,o,f){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var c=M({},e.props),y=e.key;if(o!=null)for(h in o.key!==void 0&&(y=""+o.key),o)!re.call(o,h)||h==="key"||h==="__self"||h==="__source"||h==="ref"&&o.ref===void 0||(c[h]=o[h]);var h=arguments.length-2;if(h===1)c.children=f;else if(1<h){for(var _=Array(h),O=0;O<h;O++)_[O]=arguments[O+2];c.children=_}return W(e.type,y,c)},l.createContext=function(e){return e={$$typeof:s,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:a,_context:e},e},l.createElement=function(e,o,f){var c,y={},h=null;if(o!=null)for(c in o.key!==void 0&&(h=""+o.key),o)re.call(o,c)&&c!=="key"&&c!=="__self"&&c!=="__source"&&(y[c]=o[c]);var _=arguments.length-2;if(_===1)y.children=f;else if(1<_){for(var O=Array(_),C=0;C<_;C++)O[C]=arguments[C+2];y.children=O}if(e&&e.defaultProps)for(c in _=e.defaultProps,_)y[c]===void 0&&(y[c]=_[c]);return W(e,h,y)},l.createRef=function(){return{current:null}},l.forwardRef=function(e){return{$$typeof:p,render:e}},l.isValidElement=Z,l.lazy=function(e){return{$$typeof:v,_payload:{_status:-1,_result:e},_init:Re}},l.memo=function(e,o){return{$$typeof:b,type:e,compare:o===void 0?null:o}},l.startTransition=function(e){var o=E.T,f={};E.T=f;try{var c=e(),y=E.S;y!==null&&y(f,c),typeof c=="object"&&c!==null&&typeof c.then=="function"&&c.then(F,ne)}catch(h){ne(h)}finally{o!==null&&f.types!==null&&(o.types=f.types),E.T=o}},l.unstable_useCacheRefresh=function(){return E.H.useCacheRefresh()},l.use=function(e){return E.H.use(e)},l.useActionState=function(e,o,f){return E.H.useActionState(e,o,f)},l.useCallback=function(e,o){return E.H.useCallback(e,o)},l.useContext=function(e){return E.H.useContext(e)},l.useDebugValue=function(){},l.useDeferredValue=function(e,o){return E.H.useDeferredValue(e,o)},l.useEffect=function(e,o){return E.H.useEffect(e,o)},l.useEffectEvent=function(e){return E.H.useEffectEvent(e)},l.useId=function(){return E.H.useId()},l.useImperativeHandle=function(e,o,f){return E.H.useImperativeHandle(e,o,f)},l.useInsertionEffect=function(e,o){return E.H.useInsertionEffect(e,o)},l.useLayoutEffect=function(e,o){return E.H.useLayoutEffect(e,o)},l.useMemo=function(e,o){return E.H.useMemo(e,o)},l.useOptimistic=function(e,o){return E.H.useOptimistic(e,o)},l.useReducer=function(e,o,f){return E.H.useReducer(e,o,f)},l.useRef=function(e){return E.H.useRef(e)},l.useState=function(e){return E.H.useState(e)},l.useSyncExternalStore=function(e,o,f){return E.H.useSyncExternalStore(e,o,f)},l.useTransition=function(){return E.H.useTransition()},l.version="19.2.8",l}var ie;function Se(){return ie||(ie=1,X.exports=$e()),X.exports}var m=Se();const Pe=je(m),gt=Ae({__proto__:null,default:Pe},[m]);let ke={data:""},Ie=t=>{if(typeof window=="object"){let r=(t?t.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return r.nonce=window.__nonce__,r.parentNode||(t||document.head).appendChild(r),r.firstChild}return t||ke},Ne=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,He=/\/\*[^]*?\*\/|  +/g,ae=/\n+/g,P=(t,r)=>{let n="",i="",u="";for(let a in t){let s=t[a];a[0]=="@"?a[1]=="i"?n=a+" "+s+";":i+=a[1]=="f"?P(s,a):a+"{"+P(s,a[1]=="k"?"":r)+"}":typeof s=="object"?i+=P(s,r?r.replace(/([^,])+/g,p=>a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,d=>/&/.test(d)?d.replace(/&/g,p):p?p+" "+d:d)):a):s!=null&&(a=a[1]=="-"?a:a.replace(/[A-Z]/g,"-$&").toLowerCase(),u+=P.p?P.p(a,s):a+":"+s+";")}return n+(r&&u?r+"{"+u+"}":u)+i},S={},ue=t=>{if(typeof t=="object"){let r="";for(let n in t)r+=n+ue(t[n]);return r}return t},De=(t,r,n,i,u)=>{let a=ue(t),s=S[a]||(S[a]=(d=>{let b=0,v=11;for(;b<d.length;)v=101*v+d.charCodeAt(b++)>>>0;return"go"+v})(a));if(!S[s]){let d=a!==t?t:(b=>{let v,g,w=[{}];for(;v=Ne.exec(b.replace(He,""));)v[4]?w.shift():v[3]?(g=v[3].replace(ae," ").trim(),w.unshift(w[0][g]=w[0][g]||{})):w[0][v[1]]=v[2].replace(ae," ").trim();return w[0]})(t);S[s]=P(u?{["@keyframes "+s]:d}:d,n?"":"."+s)}let p=n&&S.g;return n&&(S.g=S[s]),((d,b,v,g)=>{g?b.data=b.data.replace(g,d):b.data.indexOf(d)===-1&&(b.data=v?d+b.data:b.data+d)})(S[s],r,i,p),s},Me=(t,r,n)=>t.reduce((i,u,a)=>{let s=r[a];if(s&&s.call){let p=s(n),d=p&&p.props&&p.props.className||/^go/.test(p)&&p;s=d?"."+d:p&&typeof p=="object"?p.props?"":P(p,""):p===!1?"":p}return i+u+(s??"")},"");function G(t){let r=this||{},n=t.call?t(r.p):t;return De(n.unshift?n.raw?Me(n,[].slice.call(arguments,1),r.p):n.reduce((i,u)=>Object.assign(i,u&&u.call?u(r.p):u),{}):n,Ie(r.target),r.g,r.o,r.k)}let le,J,V;G.bind({g:1});let j=G.bind({k:1});function Le(t,r,n,i){P.p=r,le=t,J=n,V=i}function k(t,r){let n=this||{};return function(){let i=arguments;function u(a,s){let p=Object.assign({},a),d=p.className||u.className;n.p=Object.assign({theme:J&&J()},p),n.o=/go\d/.test(d),p.className=G.apply(n,i)+(d?" "+d:"");let b=t;return t[0]&&(b=p.as||t,delete p.as),V&&b[0]&&V(p),le(b,p)}return u}}var ze=t=>typeof t=="function",z=(t,r)=>ze(t)?t(r):t,Ye=(()=>{let t=0;return()=>(++t).toString()})(),ce=(()=>{let t;return()=>{if(t===void 0&&typeof window<"u"){let r=matchMedia("(prefers-reduced-motion: reduce)");t=!r||r.matches}return t}})(),Ue=20,ee="default",fe=(t,r)=>{let{toastLimit:n}=t.settings;switch(r.type){case 0:return{...t,toasts:[r.toast,...t.toasts].slice(0,n)};case 1:return{...t,toasts:t.toasts.map(s=>s.id===r.toast.id?{...s,...r.toast}:s)};case 2:let{toast:i}=r;return fe(t,{type:t.toasts.find(s=>s.id===i.id)?1:0,toast:i});case 3:let{toastId:u}=r;return{...t,toasts:t.toasts.map(s=>s.id===u||u===void 0?{...s,dismissed:!0,visible:!1}:s)};case 4:return r.toastId===void 0?{...t,toasts:[]}:{...t,toasts:t.toasts.filter(s=>s.id!==r.toastId)};case 5:return{...t,pausedAt:r.time};case 6:let a=r.time-(t.pausedAt||0);return{...t,pausedAt:void 0,toasts:t.toasts.map(s=>({...s,pauseDuration:s.pauseDuration+a}))}}},B=[],pe={toasts:[],pausedAt:void 0,settings:{toastLimit:Ue}},A={},de=(t,r=ee)=>{A[r]=fe(A[r]||pe,t),B.forEach(([n,i])=>{n===r&&i(A[r])})},me=t=>Object.keys(A).forEach(r=>de(t,r)),qe=t=>Object.keys(A).find(r=>A[r].toasts.some(n=>n.id===t)),K=(t=ee)=>r=>{de(r,t)},Be={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},ye=(t={},r=ee)=>{let[n,i]=m.useState(A[r]||pe),u=m.useRef(A[r]);m.useEffect(()=>(u.current!==A[r]&&i(A[r]),B.push([r,i]),()=>{let s=B.findIndex(([p])=>p===r);s>-1&&B.splice(s,1)}),[r]);let a=n.toasts.map(s=>{var p,d,b;return{...t,...t[s.type],...s,removeDelay:s.removeDelay||((p=t[s.type])==null?void 0:p.removeDelay)||(t==null?void 0:t.removeDelay),duration:s.duration||((d=t[s.type])==null?void 0:d.duration)||(t==null?void 0:t.duration)||Be[s.type],style:{...t.style,...(b=t[s.type])==null?void 0:b.style,...s.style}}});return{...n,toasts:a}},Ge=(t,r="blank",n)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:r,ariaProps:{role:"status","aria-live":"polite"},message:t,pauseDuration:0,...n,id:(n==null?void 0:n.id)||Ye()}),Y=t=>(r,n)=>{let i=Ge(r,t,n);return K(i.toasterId||qe(i.id))({type:2,toast:i}),i.id},T=(t,r)=>Y("blank")(t,r);T.error=Y("error");T.success=Y("success");T.loading=Y("loading");T.custom=Y("custom");T.dismiss=(t,r)=>{let n={type:3,toastId:t};r?K(r)(n):me(n)};T.dismissAll=t=>T.dismiss(void 0,t);T.remove=(t,r)=>{let n={type:4,toastId:t};r?K(r)(n):me(n)};T.removeAll=t=>T.remove(void 0,t);T.promise=(t,r,n)=>{let i=T.loading(r.loading,{...n,...n==null?void 0:n.loading});return typeof t=="function"&&(t=t()),t.then(u=>{let a=r.success?z(r.success,u):void 0;return a?T.success(a,{id:i,...n,...n==null?void 0:n.success}):T.dismiss(i),u}).catch(u=>{let a=r.error?z(r.error,u):void 0;a?T.error(a,{id:i,...n,...n==null?void 0:n.error}):T.dismiss(i)}),t};var Ke=1e3,ge=(t,r="default")=>{let{toasts:n,pausedAt:i}=ye(t,r),u=m.useRef(new Map).current,a=m.useCallback((g,w=Ke)=>{if(u.has(g))return;let x=setTimeout(()=>{u.delete(g),s({type:4,toastId:g})},w);u.set(g,x)},[]);m.useEffect(()=>{if(i)return;let g=Date.now(),w=n.map(x=>{if(x.duration===1/0)return;let I=(x.duration||0)+x.pauseDuration-(g-x.createdAt);if(I<0){x.visible&&T.dismiss(x.id);return}return setTimeout(()=>T.dismiss(x.id,r),I)});return()=>{w.forEach(x=>x&&clearTimeout(x))}},[n,i,r]);let s=m.useCallback(K(r),[r]),p=m.useCallback(()=>{s({type:5,time:Date.now()})},[s]),d=m.useCallback((g,w)=>{s({type:1,toast:{id:g,height:w}})},[s]),b=m.useCallback(()=>{i&&s({type:6,time:Date.now()})},[i,s]),v=m.useCallback((g,w)=>{let{reverseOrder:x=!1,gutter:I=8,defaultPosition:M}=w||{},H=n.filter(R=>(R.position||M)===(g.position||M)&&R.height),$=H.findIndex(R=>R.id===g.id),L=H.filter((R,N)=>N<$&&R.visible).length;return H.filter(R=>R.visible).slice(...x?[L+1]:[0,L]).reduce((R,N)=>R+(N.height||0)+I,0)},[n]);return m.useEffect(()=>{n.forEach(g=>{if(g.dismissed)a(g.id,g.removeDelay);else{let w=u.get(g.id);w&&(clearTimeout(w),u.delete(g.id))}})},[n,a]),{toasts:n,handlers:{updateHeight:d,startPause:p,endPause:b,calculateOffset:v}}},Fe=j`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,We=j`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Ze=j`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,ve=k("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Fe} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${We} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${t=>t.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${Ze} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,Qe=j`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,he=k("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${t=>t.secondary||"#e0e0e0"};
  border-right-color: ${t=>t.primary||"#616161"};
  animation: ${Qe} 1s linear infinite;
`,Xe=j`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Je=j`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,be=k("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Xe} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Je} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${t=>t.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Ve=k("div")`
  position: absolute;
`,et=k("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,tt=j`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,rt=k("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${tt} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Ee=({toast:t})=>{let{icon:r,type:n,iconTheme:i}=t;return r!==void 0?typeof r=="string"?m.createElement(rt,null,r):r:n==="blank"?null:m.createElement(et,null,m.createElement(he,{...i}),n!=="loading"&&m.createElement(Ve,null,n==="error"?m.createElement(ve,{...i}):m.createElement(be,{...i})))},ot=t=>`
0% {transform: translate3d(0,${t*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,nt=t=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${t*-150}%,-1px) scale(.6); opacity:0;}
`,st="0%{opacity:0;} 100%{opacity:1;}",it="0%{opacity:1;} 100%{opacity:0;}",at=k("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,ut=k("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,lt=(t,r)=>{let n=t.includes("top")?1:-1,[i,u]=ce()?[st,it]:[ot(n),nt(n)];return{animation:r?`${j(i)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${j(u)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},_e=m.memo(({toast:t,position:r,style:n,children:i})=>{let u=t.height?lt(t.position||r||"top-center",t.visible):{opacity:0},a=m.createElement(Ee,{toast:t}),s=m.createElement(ut,{...t.ariaProps},z(t.message,t));return m.createElement(at,{className:t.className,style:{...u,...n,...t.style}},typeof i=="function"?i({icon:a,message:s}):m.createElement(m.Fragment,null,a,s))});Le(m.createElement);var ct=({id:t,className:r,style:n,onHeightUpdate:i,children:u})=>{let a=m.useCallback(s=>{if(s){let p=()=>{let d=s.getBoundingClientRect().height;i(t,d)};p(),new MutationObserver(p).observe(s,{subtree:!0,childList:!0,characterData:!0})}},[t,i]);return m.createElement("div",{ref:a,className:r,style:n},u)},ft=(t,r)=>{let n=t.includes("top"),i=n?{top:0}:{bottom:0},u=t.includes("center")?{justifyContent:"center"}:t.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:ce()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${r*(n?1:-1)}px)`,...i,...u}},pt=G`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,q=16,dt=({reverseOrder:t,position:r="top-center",toastOptions:n,gutter:i,children:u,toasterId:a,containerStyle:s,containerClassName:p})=>{let{toasts:d,handlers:b}=ge(n,a);return m.createElement("div",{"data-rht-toaster":a||"",style:{position:"fixed",zIndex:9999,top:q,left:q,right:q,bottom:q,pointerEvents:"none",...s},className:p,onMouseEnter:b.startPause,onMouseLeave:b.endPause},d.map(v=>{let g=v.position||r,w=b.calculateOffset(v,{reverseOrder:t,gutter:i,defaultPosition:r}),x=ft(g,w);return m.createElement(ct,{id:v.id,key:v.id,onHeightUpdate:b.updateHeight,className:v.visible?pt:"",style:x},v.type==="custom"?z(v.message,v):u?u(v):m.createElement(_e,{toast:v,position:g}))}))},mt=T;const vt=Object.freeze(Object.defineProperty({__proto__:null,CheckmarkIcon:be,ErrorIcon:ve,LoaderIcon:he,ToastBar:_e,ToastIcon:Ee,Toaster:dt,default:mt,resolveValue:z,toast:T,useToaster:ge,useToasterStore:ye},Symbol.toStringTag,{value:"Module"}));export{dt as F,gt as R,Se as a,Pe as b,yt as c,je as g,vt as i,T as n,m as r,mt as z};
