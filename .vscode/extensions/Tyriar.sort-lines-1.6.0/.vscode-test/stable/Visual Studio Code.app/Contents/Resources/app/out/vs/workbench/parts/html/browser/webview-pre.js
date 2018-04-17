/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
!function(){"use strict";function t(t){t&&(t.classList.remove("vscode-light","vscode-dark","vscode-high-contrast"),t.classList.add(u.activeTheme))}function e(){return document.getElementById("active-frame")}function n(){return document.getElementById("pending-frame")}function o(t){if(t&&t.view&&t.view.document)for(var e=t.view.document.getElementsByTagName("base")[0],n=t.target;n;){if(n.tagName&&"a"===n.tagName.toLowerCase()&&n.href){if("#"===n.getAttribute("href"))t.view.scrollTo(0,0);else if(n.hash&&(n.getAttribute("href")===n.hash||e&&n.href.indexOf(e.href)>=0)){var o=t.view.document.getElementById(n.hash.substr(1,n.hash.length-1));o&&o.scrollIntoView()}else c.sendToHost("did-click-link",n.href);t.preventDefault();break}n=n.parentNode}}function r(t){d?c.sendToHost("onmessage",t.data):c.sendToHost(t.data.command,t.data.data)}function i(t){if(b)return;const e=t.target.body.scrollTop/t.target.body.clientHeight;isNaN(e)||(b=!0,window.requestAnimationFrame(function(){try{c.sendToHost("did-scroll",e)}catch(t){}
b=!1}))}const c=require("electron").ipcRenderer;var s,a=!0,l=[],d=!1;const u={initialScrollProgress:void 0};var b=!1;document.addEventListener("DOMContentLoaded",function(){c.on("baseUrl",function(t,e){u.baseUrl=e}),c.on("styles",function(n,o,r){u.styles=o,u.activeTheme=r;var i=e();if(i){t(i.contentDocument.getElementsByTagName("body")[0]),Object.keys(o).forEach(function(t){i.contentDocument.documentElement.style.setProperty(`--${t}`,o[t])})}}),c.on("focus",function(){const t=e();t&&t.contentWindow.focus()}),c.on("content",function(r,b){const m=b.options;d=m&&m.enableWrappedPostMessage;const h=b.contents,f=(new DOMParser).parseFromString(h,"text/html");if(f.querySelectorAll("a").forEach(t=>{t.title||(t.title=t.href)}),u.baseUrl&&0===f.head.getElementsByTagName("base").length){const t=f.createElement("base");t.href=u.baseUrl,f.head.appendChild(t)}const g=f.createElement("style");g.id="_defaultStyles";const v=Object.keys(u.styles||{}).map(function(t){return`--${t}: ${u.styles[t]};`})
;g.innerHTML=`\n\t\t\t:root { ${v.join(" ")} }\n\n\t\t\tbody {\n\t\t\t\tbackground-color: var(--background-color);\n\t\t\t\tcolor: var(--color);\n\t\t\t\tfont-family: var(--font-family);\n\t\t\t\tfont-weight: var(--font-weight);\n\t\t\t\tfont-size: var(--font-size);\n\t\t\t\tmargin: 0;\n\t\t\t\tpadding: 0 20px;\n\t\t\t}\n\n\t\t\timg {\n\t\t\t\tmax-width: 100%;\n\t\t\t\tmax-height: 100%;\n\t\t\t}\n\n\t\t\tbody a {\n\t\t\t\tcolor: var(--link-color);\n\t\t\t}\n\n\t\t\ta:focus,\n\t\t\tinput:focus,\n\t\t\tselect:focus,\n\t\t\ttextarea:focus {\n\t\t\t\toutline: 1px solid -webkit-focus-ring-color;\n\t\t\t\toutline-offset: -1px;\n\t\t\t}\n\t\t\t::-webkit-scrollbar {\n\t\t\t\twidth: 10px;\n\t\t\t\theight: 10px;\n\t\t\t}\n\n\t\t\t::-webkit-scrollbar-thumb {\n\t\t\t\tbackground-color: rgba(121, 121, 121, 0.4);\n\t\t\t}\n\t\t\tbody.vscode-light::-webkit-scrollbar-thumb {\n\t\t\t\tbackground-color: rgba(100, 100, 100, 0.4);\n\t\t\t}\n\t\t\tbody.vscode-high-contrast::-webkit-scrollbar-thumb {\n\t\t\t\tbackground-color: rgba(111, 195, 223, 0.3);\n\t\t\t}\n\n\t\t\t::-webkit-scrollbar-thumb:hover {\n\t\t\t\tbackground-color: rgba(100, 100, 100, 0.7);\n\t\t\t}\n\t\t\tbody.vscode-light::-webkit-scrollbar-thumb:hover {\n\t\t\t\tbackground-color: rgba(100, 100, 100, 0.7);\n\t\t\t}\n\t\t\tbody.vscode-high-contrast::-webkit-scrollbar-thumb:hover {\n\t\t\t\tbackground-color: rgba(111, 195, 223, 0.8);\n\t\t\t}\n\n\t\t\t::-webkit-scrollbar-thumb:active {\n\t\t\t\tbackground-color: rgba(85, 85, 85, 0.8);\n\t\t\t}\n\t\t\tbody.vscode-light::-webkit-scrollbar-thumb:active {\n\t\t\t\tbackground-color: rgba(0, 0, 0, 0.6);\n\t\t\t}\n\t\t\tbody.vscode-high-contrast::-webkit-scrollbar-thumb:active {\n\t\t\t\tbackground-color: rgba(111, 195, 223, 0.8);\n\t\t\t}\n\t\t\t`,
f.head.hasChildNodes()?f.head.insertBefore(g,f.head.firstChild):f.head.appendChild(g),t(f.body);const y=e();var w;if(a)a=!1,w=function(t){isNaN(u.initialScrollProgress)||0===t.scrollTop&&(t.scrollTop=t.clientHeight*u.initialScrollProgress)};else{const t=y&&y.contentDocument&&y.contentDocument.body?y.contentDocument.body.scrollTop:0;w=function(e){0===e.scrollTop&&(e.scrollTop=t)}}const p=n();p&&(p.setAttribute("id",""),document.body.removeChild(p)),l=[];const k=document.createElement("iframe");k.setAttribute("id","pending-frame"),k.setAttribute("frameborder","0"),k.setAttribute("sandbox",m.allowScripts?"allow-scripts allow-forms allow-same-origin":"allow-same-origin"),k.style.cssText="display: block; margin: 0; overflow: hidden; position: absolute; width: 100%; height: 100%; visibility: hidden",document.body.appendChild(k),k.contentDocument.open("text/html","replace"),k.contentWindow.onbeforeunload=function(){return console.log("prevented webview navigation"),!1};var T=function(t,r){t.body&&(w(t.body),
t.body.addEventListener("click",o));const c=n();if(c&&c.contentDocument===t){const t=e();t&&document.body.removeChild(t),c.setAttribute("id","active-frame"),c.style.visibility="visible",r.addEventListener("scroll",i),l.forEach(function(t){r.postMessage(t,"*")}),l=[]}};clearTimeout(s),s=void 0,s=setTimeout(function(){clearTimeout(s),s=void 0,T(k.contentDocument,k.contentWindow)},200),k.contentWindow.addEventListener("load",function(t){s&&(clearTimeout(s),s=void 0,T(t.target,this))}),k.contentDocument.write("<!DOCTYPE html>"),k.contentDocument.write(f.documentElement.innerHTML),k.contentDocument.close(),c.sendToHost("did-set-content")}),c.on("message",function(t,o){if(n())l.push(o);else{const t=e();t&&t.contentWindow.postMessage(o,"*")}}),c.on("initial-scroll-position",function(t,e){u.initialScrollProgress=e}),window.onmessage=r,c.sendToHost("webview-ready",process.pid)})}();
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/79b44aa704ce542d8ca4a3cc44cfca566e7720f1/core/vs/workbench/parts/html/browser/webview-pre.js.map
