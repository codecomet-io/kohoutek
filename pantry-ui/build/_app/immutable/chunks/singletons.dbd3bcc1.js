import{H as b,s as E}from"./index.dd150d2a.js";const u=[];function y(e,t){return{subscribe:d(e,t).subscribe}}function d(e,t=b){let n;const s=new Set;function o(a){if(E(e,a)&&(e=a,n)){const c=!u.length;for(const l of s)l[1](),u.push(l,e);if(c){for(let l=0;l<u.length;l+=2)u[l][0](u[l+1]);u.length=0}}}function r(a){o(a(e))}function i(a,c=b){const l=[a,c];return s.add(l),s.size===1&&(n=t(o)||b),a(e),()=>{s.delete(l),s.size===0&&(n(),n=null)}}return{set:o,update:r,subscribe:i}}var g;const m=((g=globalThis.__sveltekit_tfhbh0)==null?void 0:g.base)??"";var k;const w=((k=globalThis.__sveltekit_tfhbh0)==null?void 0:k.assets)??m,A="1677810389287",x="sveltekit:snapshot",O="sveltekit:scroll",U="sveltekit:index",h={tap:1,hover:2,viewport:3,eager:4,off:-1};function L(e){let t=e.baseURI;if(!t){const n=e.getElementsByTagName("base");t=n.length?n[0].href:e.URL}return t}function N(){return{x:pageXOffset,y:pageYOffset}}function f(e,t){return e.getAttribute(`data-sveltekit-${t}`)}const p={...h,"":h.hover};function v(e){let t=e.assignedSlot??e.parentNode;return(t==null?void 0:t.nodeType)===11&&(t=t.host),t}function V(e,t){for(;e&&e!==t;){if(e.nodeName.toUpperCase()==="A"&&e.hasAttribute("href"))return e;e=v(e)}}function P(e,t){let n;try{n=new URL(e instanceof SVGAElement?e.href.baseVal:e.href,document.baseURI)}catch{}const s=e instanceof SVGAElement?e.target.baseVal:e.target,o=!n||!!s||S(n,t)||(e.getAttribute("rel")||"").split(/\s+/).includes("external")||e.hasAttribute("download");return{url:n,external:o,target:s}}function Y(e){let t=null,n=null,s=null,o=null,r=e;for(;r&&r!==document.documentElement;)n===null&&(n=f(r,"preload-code")),s===null&&(s=f(r,"preload-data")),t===null&&(t=f(r,"noscroll")),o===null&&(o=f(r,"reload")),r=v(r);return{preload_code:p[n??"off"],preload_data:p[s??"off"],noscroll:t==="off"?!1:t===""?!0:null,reload:o==="off"?!1:o===""?!0:null}}function _(e){const t=d(e);let n=!0;function s(){n=!0,t.update(i=>i)}function o(i){n=!1,t.set(i)}function r(i){let a;return t.subscribe(c=>{(a===void 0||n&&c!==a)&&i(a=c)})}return{notify:s,set:o,subscribe:r}}function R(){const{set:e,subscribe:t}=d(!1);let n;async function s(){clearTimeout(n);const o=await fetch(`${w}/_app/version.json`,{headers:{pragma:"no-cache","cache-control":"no-cache"}});if(o.ok){const i=(await o.json()).version!==A;return i&&(e(!0),clearTimeout(n)),i}else throw new Error(`Version check failed: ${o.status}`)}return{subscribe:t,check:s}}function S(e,t){return e.origin!==location.origin||!e.pathname.startsWith(t)}let T;function $(e){T=e.client}const j={url:_({}),page:_({}),navigating:d(null),updated:R()};export{U as I,h as P,O as S,x as a,P as b,Y as c,N as d,m as e,V as f,L as g,$ as h,S as i,T as j,y as r,j as s,d as w};
