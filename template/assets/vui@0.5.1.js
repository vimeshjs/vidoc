// Vimesh UI v0.5.1
"use strict";!function(t){if(!t.$vui){t.$vui={config:{debug:!1},ready(e){t.Alpine?e():document.addEventListener("alpine:init",e)}};const e=new Date,o=t.$vui._={elapse(){return new Date-e},isString(e){return null!=e&&"string"==typeof e.valueOf()},isArray(e){return Array.isArray(e)},isFunction(e){return"function"==typeof e},isPlainObject(e){return null!==e&&"object"==typeof e&&e.constructor===Object},each(e,r){e&&(o.isArray(e)?e.forEach((e,t)=>{r(e,t,t)}):Object.entries(e).forEach(([e,t],n)=>{r(t,e,n)}))},extend(n,...t){var r=t.length;if(r<1||null==n)return n;for(let e=0;e<r;e++){const i=t[e];o.isPlainObject(i)&&Object.keys(i).forEach(e=>{var t=Object.getOwnPropertyDescriptor(i,e);t.get||t.set?Object.defineProperty(n,e,t):n[e]=i[e]})}return n}}}}(window),$vui.setups||($vui.setups={}),$vui.components||($vui.components={}),$vui.ready(()=>{const d=$vui._,{directive:e,bind:p,prefixed:f,addRootSelector:t}=Alpine,m="v-ui",v="v-cloak";let n=document.createElement("style");n.setAttribute("id","vimesh-ui-component-common-styles"),n.innerHTML=`
    [v-ui] {display : block}
    [${v}] {display: none !important;}
    `,document.head.prepend(n),t(()=>`[${f("component")}]`),e("component",(n,{expression:o,value:e,modifiers:t},{})=>{if("template"!==n.tagName.toLowerCase())return console.warn("x-component can only be used on a <template> tag",n);n._x_ignore=!0;const r=f("component"),i=f("import"),a=e||$vui.config.namespace||"vui";const u=($vui.config.prefixMap||{})[a]||a,c=u+"-"+o,l=t.includes("unwrap");function s(e,n){d.each(e.attributes,t=>{if(r!==t.name&&!t.name.startsWith(r)&&i!==t.name&&!t.name.startsWith(i))try{let e=t.name;e.startsWith("@")?e=f("on")+":"+e.substring(1):e.startsWith(":")&&(e=f("bind")+":"+e.substring(1)),"class"===e?n.setAttribute(e,t.value+" "+(n.getAttribute("class")||"")):n.setAttribute(e,t.value)}catch(e){console.warn(`Fails to set attribute ${t.name}=${t.value} in `+n.tagName.toLowerCase())}})}d.each(n.content.querySelectorAll("script"),e=>{var t=e.getAttribute("part")||"",t=c+(t?"/"+t:"");const n=document.createElement("script");d.each(e.attributes,e=>n.setAttribute(e.name,e.value)),n.setAttribute("component",c),n.innerHTML=`
$vui.setups["${t}"] = ($el)=>{
${e.innerHTML}
}
//# sourceURL=__vui__/${t}.js
`,document.body.append(n),e.remove()}),$vui.components[c]=class extends HTMLElement{connectedCallback(){const r={},i=[];d.each(this.querySelectorAll(`[${f("for")}]`),e=>{e._x_lookup&&(Object.values(e._x_lookup).forEach(e=>e.remove()),delete n._x_prevKeys,delete n._x_lookup)}),d.each(this.childNodes,e=>{var t,n;e.tagName&&e.hasAttribute("slot")?(t=e.getAttribute("slot")||"",n="TEMPLATE"===e.tagName?e.content.cloneNode(!0).childNodes:[e.cloneNode(!0)],r[t]?r[t].push(...n):r[t]=n):i.push(e.cloneNode(!0))});let t=this;var e=()=>{t._vui_prefix=u,t._vui_type=o,t._vui_namespace=a;let e=$vui.setups[c];e&&p(t,e(t))};l?(t=n.content.cloneNode(!0).firstElementChild,e(),s(this,t),this.after(t),this.remove()):(e(),t.innerHTML=n.innerHTML,t.setAttribute(m,$vui.config.debug?""+d.elapse():"")),s(n,t),t.removeAttribute(v),t.removeAttribute("x-ignore"),d.each(t.querySelectorAll("slot"),e=>{var t=e.getAttribute("name")||"";e.after(...r[t]||i),e.remove()}),d.each(t.querySelectorAll("*[part]"),e=>{var t=e.getAttribute("part")||"",t=c+(t?"/"+t:"");let n=$vui.setups[t];n&&p(e,n(e))})}},customElements.define(c.toLowerCase(),$vui.components[c])})}),$vui.import=e=>{const l=$vui._,i=$vui.config.importMap;if(!i||!i["*"])return Promise.reject('You must setup import url template for the fallback namespace "*"');if($vui.imports||($vui.imports={}),$vui.importScriptIndex||($vui.importScriptIndex=1),l.isString(e)&&(e=[e]),l.isArray(e)){const o=[];return l.each(e,c=>{c=c.trim();const n=i["*"];let s=null;var e=c.indexOf("/");let r=-1===e?"":c.substring(0,e);-1!==e&&(c=c.substring(e+1)),l.each(c.split(","),e=>{e=e.trim();e={namespace:r,component:e,full:(r?r+"/":"")+e};e.namespace&&i[e.namespace]&&(n=i[e.namespace]);try{const t=new Function("data","with (data){return `"+n+"`}");s=t(e)}catch(e){return void console.error(`Fails to parse url template ${n} with component `+c)}s&&!$vui.imports[s]&&($vui.imports[s]=!0,o.push(fetch(s).then(e=>e.text()).then(e=>{const t=document.createElement("div");t._x_ignore=!0,t.innerHTML=e;let u=[...t.childNodes];return new Promise(o=>{const a=e=>{if(e<u.length){const r=u[e];if(r.remove(),"SCRIPT"===r.tagName){const i=document.createElement("script");var t,n=r.src&&!r.async;n&&(i.onload=()=>{a(e+1)},i.onerror=()=>{console.error(`Fails to load script from "${i.src}"`),a(e+1)}),l.each(r.attributes,e=>i.setAttribute(e.name,e.value)),r.src||(t=`__vui__/scripts/js_${$vui.importScriptIndex}.js`,i.setAttribute("file",t),i.innerHTML=r.innerHTML+`\r
//# sourceURL=`+t,$vui.importScriptIndex++),document.body.append(i),n||a(e+1)}else"TEMPLATE"===r.tagName&&document.body.append(r),a(e+1)}else $vui.config.debug&&console.log(`Imported ${c} @ `+s),o()};a(0)})}).catch(e=>{console.error(`Fails to import ${c} @ `+s,e)})))})}),Promise.all(o)}return Promise.reject(`Fails to import ${comp} !`)},$vui.ready(()=>{const r=$vui._,{directive:e,evaluateLater:i,effect:o,prefixed:t,addRootSelector:n}=Alpine;n(()=>`[${t("import")}]`),e("import",(t,{expression:n},{})=>{if(n){let e=n.trim();if(e.startsWith("[")&&e.endsWith("]")){let e=i(t,n);o(()=>e(e=>{r.isArray(e)&&$vui.import(e)}))}else $vui.import(e.split(";"))}})}),$vui.include=(l,e)=>{const d=$vui._,p=l._vui_unwrap;let t;for(let e=l;e&&!(t=e._vui_base_url);e=e.parentElement);if(t=t||document.baseURI,d.isArray(e)){const n=[];return d.each(e,s=>{if(s=s.trim()){let c=new URL(s,t).href;n.push(fetch(c).then(e=>e.text()).then(e=>{const t=document.createElement("div");t._x_ignore=!0,t.innerHTML=e;let u=[...t.childNodes];return new Promise(o=>{const a=e=>{if(e<u.length){const r=u[e];if(r.remove(),"SCRIPT"===r.tagName){const i=document.createElement("script");var t,n=r.src&&!r.async;n&&(i.onload=()=>{a(e+1)},i.onerror=()=>{console.error(`Fails to load script from "${i.src}"`),a(e+1)}),d.each(r.attributes,e=>i.setAttribute(e.name,e.value)),r.src||(t=`__vui__/scripts/js_${$vui.importScriptIndex}.js`,i.setAttribute("file",t),i.innerHTML=r.innerHTML+`\r
//From ${s}\r
//# sourceURL=`+t,$vui.importScriptIndex++),document.body.append(i),n||a(e+1)}else r._vui_base_url=c,p?l.before(r):l.append(r),a(e+1)}else $vui.config.debug&&console.log("Included "+s),p&&l.remove(),o()};a(0)})}).catch(e=>{console.error(`Fails to include ${comp} @ `+s,e)}))}}),Promise.all(n)}return Promise.reject(`Fails to include ${e} !`)},$vui.ready(()=>{const i=$vui._,{directive:e,evaluateLater:o,effect:a,prefixed:t,addRootSelector:n}=Alpine;n(()=>`[${t("include")}]`),e("include",(n,{expression:r,modifiers:e},{})=>{if(r){n._vui_unwrap=e.includes("unwrap");let t=r.trim();if(t.startsWith(".")||t.startsWith("/")||t.startsWith("http://")||t.startsWith("https://"))$vui.include(n,[t]);else{let e=o(n,r);a(()=>e(e=>{i.isArray(e)?$vui.include(n,e):i.isString(e)?$vui.include(n,[e]):$vui.include(n,[t])}))}}})}),(()=>{function o(e){var t=parseInt(e.getAttribute("tabindex"),10);return isNaN(t)?"true"!==e.contentEditable&&("AUDIO"!==e.nodeName&&"VIDEO"!==e.nodeName&&"DETAILS"!==e.nodeName||null!==e.getAttribute("tabindex"))?e.tabIndex:0:t}function l(e,t){return e.tabIndex===t.tabIndex?e.documentOrder-t.documentOrder:e.tabIndex-t.tabIndex}function i(e){return"INPUT"===e.tagName}function r(e){if(!e.name)return 1;function t(e){return n.querySelectorAll('input[type="radio"][name="'+e+'"]')}var n=e.form||e.ownerDocument;if("undefined"!=typeof window&&void 0!==window.CSS&&"function"==typeof window.CSS.escape)r=t(window.CSS.escape(e.name));else try{r=t(e.name)}catch(e){return console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s",e.message),0}var r=function(e,t){for(var n=0;n<e.length;n++)if(e[n].checked&&e[n].form===t)return e[n]}(r,e.form);return!r||r===e}function d(e){return i(t=e)&&"radio"===t.type&&!r(e);var t}var e=["input","select","textarea","a[href]","button","[tabindex]","audio[controls]","video[controls]",'[contenteditable]:not([contenteditable="false"])',"details>summary:first-of-type","details"],a=e.join(","),u="undefined"==typeof Element?function(){}:Element.prototype.matches||Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector,c=function(e,t,n){var r=Array.prototype.slice.apply(e.querySelectorAll(a));return t&&u.call(e,a)&&r.unshift(e),r=r.filter(n)},s=function(e,t){return!(t.disabled||i(n=t)&&"hidden"===n.type||function(e,t){if("hidden"===getComputedStyle(e).visibility)return!0;var n=u.call(e,"details>summary:first-of-type")?e.parentElement:e;if(u.call(n,"details:not([open]) *"))return!0;if(t&&"full"!==t){if("non-zero-area"===t)return t=(n=e.getBoundingClientRect()).width,n=n.height,0===t&&0===n}else for(;e;){if("none"===getComputedStyle(e).display)return!0;e=e.parentElement}return!1}(t,e.displayCheck)||"DETAILS"===(n=t).tagName&&Array.prototype.slice.apply(n.children).some(function(e){return"SUMMARY"===e.tagName})||function(e){if(i(e)||"SELECT"===e.tagName||"TEXTAREA"===e.tagName||"BUTTON"===e.tagName)for(var t=e.parentElement;t;){if("FIELDSET"===t.tagName&&t.disabled){for(var n=0;n<t.children.length;n++){var r=t.children.item(n);if("LEGEND"===r.tagName)return!r.contains(e)}return!0}t=t.parentElement}return!1}(t));var n},A=function(e,t){var r=[],i=[];return c(e,(t=t||{}).includeContainer,function(e,t){return!(!s(e,t)||d(t)||o(t)<0)}.bind(null,t)).forEach(function(e,t){var n=o(e);0===n?r.push(e):i.push({documentOrder:t,tabIndex:n,node:e})}),i.sort(l).map(function(e){return e.node}).concat(r)},p=e.concat("iframe").join(","),$=function(e,t){if(t=t||{},!e)throw new Error("No node provided");return!1!==u.call(e,p)&&s(t,e)};function t(t,e){var n,r=Object.keys(t);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(t),e&&(n=n.filter(function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})),r.push.apply(r,n)),r}function _(r){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{};e%2?t(Object(i),!0).forEach(function(e){var t,n;t=r,n=i[e=e],e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(i)):t(Object(i)).forEach(function(e){Object.defineProperty(r,e,Object.getOwnPropertyDescriptor(i,e))})}return r}function f(e,t){function a(e,t,n){return e&&void 0!==e[t]?e[t]:r[n||t]}function i(e){var t=r[e];if(!t)return null;var n=t;if("string"==typeof t&&!(n=u.querySelector(t)))throw new Error("`".concat(e,"` refers to no known node"));if("function"==typeof t&&!(n=t()))throw new Error("`".concat(e,"` did not return a node"));return n}function o(){if(c.tabbableGroups=c.containers.map(function(e){var t=A(e);if(0<t.length)return{container:e,firstTabbableNode:t[0],lastTabbableNode:t[t.length-1]}}).filter(function(e){return!!e}),c.tabbableGroups.length<=0&&!i("fallbackFocus"))throw new Error("Your focus-trap must have at least one container with at least one tabbable node in it at all times")}function p(e){var t=i("setReturnFocus");return t||e}function f(){return c.active&&(N.activateTrap(d),c.delayInitialFocusTimer=r.delayInitialFocus?T(function(){l(s())}):l(s()),u.addEventListener("focusin",b,!0),u.addEventListener("mousedown",v,{capture:!0,passive:!1}),u.addEventListener("touchstart",v,{capture:!0,passive:!1}),u.addEventListener("click",y,{capture:!0,passive:!1}),u.addEventListener("keydown",g,{capture:!0,passive:!1}),d)}function m(){return c.active&&(u.removeEventListener("focusin",b,!0),u.removeEventListener("mousedown",v,!0),u.removeEventListener("touchstart",v,!0),u.removeEventListener("click",y,!0),u.removeEventListener("keydown",g,!0),d)}var u=document,r=_({returnFocusOnDeactivate:!0,escapeDeactivates:!0,delayInitialFocus:!0},t),c={containers:[],tabbableGroups:[],nodeFocusedBeforeActivation:null,mostRecentlyFocusedNode:null,active:!1,paused:!1,delayInitialFocusTimer:void 0},n=function(t){return c.containers.some(function(e){return e.contains(t)})},s=function(){var e;if(!1===a({},"initialFocus"))return!1;if(!(e=null!==i("initialFocus")?i("initialFocus"):n(u.activeElement)?u.activeElement:(e=c.tabbableGroups[0])&&e.firstTabbableNode||i("fallbackFocus")))throw new Error("Your focus-trap needs to have at least one focusable element");return e},l=function e(t){!1!==t&&t!==u.activeElement&&(t&&t.focus?(t.focus({preventScroll:!!r.preventScroll}),c.mostRecentlyFocusedNode=t,x(t)&&t.select()):e(s()))},v=function(e){n(e.target)||(E(r.clickOutsideDeactivates,e)?d.deactivate({returnFocus:r.returnFocusOnDeactivate&&!$(e.target)}):E(r.allowOutsideClick,e)||e.preventDefault())},b=function(e){var t=n(e.target);t||e.target instanceof Document?t&&(c.mostRecentlyFocusedNode=e.target):(e.stopImmediatePropagation(),l(c.mostRecentlyFocusedNode||s()))},h=function(t){o();var e,n,r=null;0<c.tabbableGroups.length?(n=w(c.tabbableGroups,function(e){return e.container.contains(t.target)}))<0?r=t.shiftKey?c.tabbableGroups[c.tabbableGroups.length-1].lastTabbableNode:c.tabbableGroups[0].firstTabbableNode:t.shiftKey?0<=(e=(e=w(c.tabbableGroups,function(e){e=e.firstTabbableNode;return t.target===e}))<0&&c.tabbableGroups[n].container===t.target?n:e)&&(e=0===e?c.tabbableGroups.length-1:e-1,r=c.tabbableGroups[e].lastTabbableNode):0<=(e=(e=w(c.tabbableGroups,function(e){e=e.lastTabbableNode;return t.target===e}))<0&&c.tabbableGroups[n].container===t.target?n:e)&&(n=e===c.tabbableGroups.length-1?0:e+1,r=c.tabbableGroups[n].firstTabbableNode):r=i("fallbackFocus"),r&&(t.preventDefault(),l(r))},g=function(e){if(S(e)&&!1!==E(r.escapeDeactivates))return e.preventDefault(),void d.deactivate();O(e)&&h(e)},y=function(e){E(r.clickOutsideDeactivates,e)||n(e.target)||E(r.allowOutsideClick,e)||(e.preventDefault(),e.stopImmediatePropagation())},d={activate:function(e){if(c.active)return this;function t(){i&&o(),f(),r&&r()}var n=a(e,"onActivate"),r=a(e,"onPostActivate"),i=a(e,"checkCanFocusTrap");i||o(),c.active=!0,c.paused=!1,c.nodeFocusedBeforeActivation=u.activeElement,n&&n();return i?i(c.containers.concat()).then(t,t):t(),this},deactivate:function(e){if(!c.active)return this;clearTimeout(c.delayInitialFocusTimer),c.delayInitialFocusTimer=void 0,m(),c.active=!1,c.paused=!1,N.deactivateTrap(d);function t(){T(function(){o&&l(p(c.nodeFocusedBeforeActivation)),r&&r()})}var n=a(e,"onDeactivate"),r=a(e,"onPostDeactivate"),i=a(e,"checkCanReturnFocus"),o=(n&&n(),a(e,"returnFocus","returnFocusOnDeactivate"));return o&&i?i(p(c.nodeFocusedBeforeActivation)).then(t,t):t(),this},pause:function(){return c.paused||!c.active||(c.paused=!0,m()),this},unpause:function(){return c.paused&&c.active&&(c.paused=!1,o(),f()),this},updateContainerElements:function(e){e=[].concat(e).filter(Boolean);return c.containers=e.map(function(e){return"string"==typeof e?u.querySelector(e):e}),c.active&&o(),this}};return d.updateContainerElements(e),d}n=[];var n,N={activateTrap:function(e){0<n.length&&((t=n[n.length-1])!==e&&t.pause());var t=n.indexOf(e);-1===t||n.splice(t,1),n.push(e)},deactivateTrap:function(e){e=n.indexOf(e);-1!==e&&n.splice(e,1),0<n.length&&n[n.length-1].unpause()}},x=function(e){return e.tagName&&"input"===e.tagName.toLowerCase()&&"function"==typeof e.select},S=function(e){return"Escape"===e.key||"Esc"===e.key||27===e.keyCode},O=function(e){return"Tab"===e.key||9===e.keyCode},T=function(e){return setTimeout(e,0)},w=function(e,n){var r=-1;return e.every(function(e,t){return!n(e)||(r=t,!1)}),r},E=function(e){for(var t=arguments.length,n=new Array(1<t?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];return"function"==typeof e?e.apply(void 0,n):e};function m(e){let n,r;window.addEventListener("focusin",()=>{n=r,r=document.activeElement}),e.magic("focus",e=>{let t=e;return{__noscroll:!1,__wrapAround:!1,within(e){return t=e,this},withoutScrolling(){return this.__noscroll=!0,this},noscroll(){return this.__noscroll=!0,this},withWrapAround(){return this.__wrapAround=!0,this},wrap(){return this.withWrapAround()},focusable(e){return $(e)},previouslyFocused(){return n},lastFocused(){return n},focused(){return r},focusables(){return Array.isArray(t)?t:(e=t,c(e,(e=(e={displayCheck:"none"})||{}).includeContainer,s.bind(null,e)));var e},all(){return this.focusables()},isFirst(e){let t=this.all();return t[0]&&t[0].isSameNode(e)},isLast(e){let t=this.all();return t.length&&t.slice(-1)[0].isSameNode(e)},getFirst(){return this.all()[0]},getLast(){return this.all().slice(-1)[0]},getNext(){let e=this.all();var t=document.activeElement;if(-1!==e.indexOf(t))return this.__wrapAround&&e.indexOf(t)===e.length-1?e[0]:e[e.indexOf(t)+1]},getPrevious(){let e=this.all();var t=document.activeElement;if(-1!==e.indexOf(t))return this.__wrapAround&&0===e.indexOf(t)?e.slice(-1)[0]:e[e.indexOf(t)-1]},first(){this.focus(this.getFirst())},last(){this.focus(this.getLast())},next(){this.focus(this.getNext())},previous(){this.focus(this.getPrevious())},prev(){return this.previous()},focus(e){e&&setTimeout(()=>{e.hasAttribute("tabindex")||e.setAttribute("tabindex","0"),e.focus({preventScroll:this._noscroll})})}}}),e.directive("trap",e.skipDuringClone((t,{expression:e,modifiers:n},{effect:r,evaluateLater:i,cleanup:l})=>{let d=i(e),o=!1,a=f(t,{escapeDeactivates:!1,allowOutsideClick:!0,fallbackFocus:()=>t,initialFocus:t.querySelector("[autofocus]")}),u=()=>{},c=()=>{};const s=()=>{u(),u=()=>{},c(),c=()=>{},a.deactivate({returnFocus:!n.includes("noreturn")})};r(()=>d(e=>{o!==e&&(e&&!o&&setTimeout(()=>{n.includes("inert")&&(u=v(t)),n.includes("noscroll")&&(c=function(){let e=document.documentElement.style.overflow,t=document.documentElement.style.paddingRight,n=window.innerWidth-document.documentElement.clientWidth;return document.documentElement.style.overflow="hidden",document.documentElement.style.paddingRight=n+"px",()=>{document.documentElement.style.overflow=e,document.documentElement.style.paddingRight=t}}()),a.activate()}),!e&&o&&s(),o=!!e)})),l(s)},(e,{expression:t,modifiers:n},{evaluate:r})=>{n.includes("inert")&&r(t)&&v(e)}))}function v(e){let n=[];return function t(n,r){if(n.isSameNode(document.body)||!n.parentNode)return;Array.from(n.parentNode.children).forEach(e=>{e.isSameNode(n)||r(e),t(n.parentNode,r)})}(e,e=>{let t=e.hasAttribute("aria-hidden");e.setAttribute("aria-hidden","true"),n.push(()=>t||e.removeAttribute("aria-hidden"))}),()=>{for(;n.length;)n.pop()()}}document.addEventListener("alpine:init",()=>{window.Alpine.plugin(m)})})();