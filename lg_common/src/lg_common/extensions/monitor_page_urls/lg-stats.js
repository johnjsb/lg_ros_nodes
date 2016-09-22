/*!
  * Reqwest! A general purpose XHR connection manager
  * license MIT (c) Dustin Diaz 2015
  * https://github.com/ded/reqwest
  */
!function(e,t,n){typeof module!="undefined"&&module.exports?module.exports=n():typeof define=="function"&&define.amd?define(n):t[e]=n()}("reqwest",this,function(){function succeed(e){var t=protocolRe.exec(e.url);return t=t&&t[1]||context.location.protocol,httpsRe.test(t)?twoHundo.test(e.request.status):!!e.request.response}function handleReadyState(e,t,n){return function(){if(e._aborted)return n(e.request);if(e._timedOut)return n(e.request,"Request is aborted: timeout");e.request&&e.request[readyState]==4&&(e.request.onreadystatechange=noop,succeed(e)?t(e.request):n(e.request))}}function setHeaders(e,t){var n=t.headers||{},r;n.Accept=n.Accept||defaultHeaders.accept[t.type]||defaultHeaders.accept["*"];var i=typeof FormData!="undefined"&&t.data instanceof FormData;!t.crossOrigin&&!n[requestedWith]&&(n[requestedWith]=defaultHeaders.requestedWith),!n[contentType]&&!i&&(n[contentType]=t.contentType||defaultHeaders.contentType);for(r in n)n.hasOwnProperty(r)&&"setRequestHeader"in e&&e.setRequestHeader(r,n[r])}function setCredentials(e,t){typeof t.withCredentials!="undefined"&&typeof e.withCredentials!="undefined"&&(e.withCredentials=!!t.withCredentials)}function generalCallback(e){lastValue=e}function urlappend(e,t){return e+(/\?/.test(e)?"&":"?")+t}function handleJsonp(e,t,n,r){var i=uniqid++,s=e.jsonpCallback||"callback",o=e.jsonpCallbackName||reqwest.getcallbackPrefix(i),u=new RegExp("((^|\\?|&)"+s+")=([^&]+)"),a=r.match(u),f=doc.createElement("script"),l=0,c=navigator.userAgent.indexOf("MSIE 10.0")!==-1;return a?a[3]==="?"?r=r.replace(u,"$1="+o):o=a[3]:r=urlappend(r,s+"="+o),context[o]=generalCallback,f.type="text/javascript",f.src=r,f.async=!0,typeof f.onreadystatechange!="undefined"&&!c&&(f.htmlFor=f.id="_reqwest_"+i),f.onload=f.onreadystatechange=function(){if(f[readyState]&&f[readyState]!=="complete"&&f[readyState]!=="loaded"||l)return!1;f.onload=f.onreadystatechange=null,f.onclick&&f.onclick(),t(lastValue),lastValue=undefined,head.removeChild(f),l=1},head.appendChild(f),{abort:function(){f.onload=f.onreadystatechange=null,n({},"Request is aborted: timeout",{}),lastValue=undefined,head.removeChild(f),l=1}}}function getRequest(e,t){var n=this.o,r=(n.method||"GET").toUpperCase(),i=typeof n=="string"?n:n.url,s=n.processData!==!1&&n.data&&typeof n.data!="string"?reqwest.toQueryString(n.data):n.data||null,o,u=!1;return(n["type"]=="jsonp"||r=="GET")&&s&&(i=urlappend(i,s),s=null),n["type"]=="jsonp"?handleJsonp(n,e,t,i):(o=n.xhr&&n.xhr(n)||xhr(n),o.open(r,i,n.async===!1?!1:!0),setHeaders(o,n),setCredentials(o,n),context[xDomainRequest]&&o instanceof context[xDomainRequest]?(o.onload=e,o.onerror=t,o.onprogress=function(){},u=!0):o.onreadystatechange=handleReadyState(this,e,t),n.before&&n.before(o),u?setTimeout(function(){o.send(s)},200):o.send(s),o)}function Reqwest(e,t){this.o=e,this.fn=t,init.apply(this,arguments)}function setType(e){if(e===null)return undefined;if(e.match("json"))return"json";if(e.match("javascript"))return"js";if(e.match("text"))return"html";if(e.match("xml"))return"xml"}function init(o,fn){function complete(e){o.timeout&&clearTimeout(self.timeout),self.timeout=null;while(self._completeHandlers.length>0)self._completeHandlers.shift()(e)}function success(resp){var type=o.type||resp&&setType(resp.getResponseHeader("Content-Type"));resp=type!=="jsonp"?self.request:resp;var filteredResponse=globalSetupOptions.dataFilter(resp.responseText,type),r=filteredResponse;try{resp.responseText=r}catch(e){}if(r)switch(type){case"json":try{resp=context.JSON?context.JSON.parse(r):eval("("+r+")")}catch(err){return error(resp,"Could not parse JSON in response",err)}break;case"js":resp=eval(r);break;case"html":resp=r;break;case"xml":resp=resp.responseXML&&resp.responseXML.parseError&&resp.responseXML.parseError.errorCode&&resp.responseXML.parseError.reason?null:resp.responseXML}self._responseArgs.resp=resp,self._fulfilled=!0,fn(resp),self._successHandler(resp);while(self._fulfillmentHandlers.length>0)resp=self._fulfillmentHandlers.shift()(resp);complete(resp)}function timedOut(){self._timedOut=!0,self.request.abort()}function error(e,t,n){e=self.request,self._responseArgs.resp=e,self._responseArgs.msg=t,self._responseArgs.t=n,self._erred=!0;while(self._errorHandlers.length>0)self._errorHandlers.shift()(e,t,n);complete(e)}this.url=typeof o=="string"?o:o.url,this.timeout=null,this._fulfilled=!1,this._successHandler=function(){},this._fulfillmentHandlers=[],this._errorHandlers=[],this._completeHandlers=[],this._erred=!1,this._responseArgs={};var self=this;fn=fn||function(){},o.timeout&&(this.timeout=setTimeout(function(){timedOut()},o.timeout)),o.success&&(this._successHandler=function(){o.success.apply(o,arguments)}),o.error&&this._errorHandlers.push(function(){o.error.apply(o,arguments)}),o.complete&&this._completeHandlers.push(function(){o.complete.apply(o,arguments)}),this.request=getRequest.call(this,success,error)}function reqwest(e,t){return new Reqwest(e,t)}function normalize(e){return e?e.replace(/\r?\n/g,"\r\n"):""}function serial(e,t){var n=e.name,r=e.tagName.toLowerCase(),i=function(e){e&&!e.disabled&&t(n,normalize(e.attributes.value&&e.attributes.value.specified?e.value:e.text))},s,o,u,a;if(e.disabled||!n)return;switch(r){case"input":/reset|button|image|file/i.test(e.type)||(s=/checkbox/i.test(e.type),o=/radio/i.test(e.type),u=e.value,(!s&&!o||e.checked)&&t(n,normalize(s&&u===""?"on":u)));break;case"textarea":t(n,normalize(e.value));break;case"select":if(e.type.toLowerCase()==="select-one")i(e.selectedIndex>=0?e.options[e.selectedIndex]:null);else for(a=0;e.length&&a<e.length;a++)e.options[a].selected&&i(e.options[a])}}function eachFormElement(){var e=this,t,n,r=function(t,n){var r,i,s;for(r=0;r<n.length;r++){s=t[byTag](n[r]);for(i=0;i<s.length;i++)serial(s[i],e)}};for(n=0;n<arguments.length;n++)t=arguments[n],/input|select|textarea/i.test(t.tagName)&&serial(t,e),r(t,["input","select","textarea"])}function serializeQueryString(){return reqwest.toQueryString(reqwest.serializeArray.apply(null,arguments))}function serializeHash(){var e={};return eachFormElement.apply(function(t,n){t in e?(e[t]&&!isArray(e[t])&&(e[t]=[e[t]]),e[t].push(n)):e[t]=n},arguments),e}function buildParams(e,t,n,r){var i,s,o,u=/\[\]$/;if(isArray(t))for(s=0;t&&s<t.length;s++)o=t[s],n||u.test(e)?r(e,o):buildParams(e+"["+(typeof o=="object"?s:"")+"]",o,n,r);else if(t&&t.toString()==="[object Object]")for(i in t)buildParams(e+"["+i+"]",t[i],n,r);else r(e,t)}var context=this;if("window"in context)var doc=document,byTag="getElementsByTagName",head=doc[byTag]("head")[0];else{var XHR2;try{XHR2=require("xhr2")}catch(ex){throw new Error("Peer dependency `xhr2` required! Please npm install xhr2")}}var httpsRe=/^http/,protocolRe=/(^\w+):\/\//,twoHundo=/^(20\d|1223)$/,readyState="readyState",contentType="Content-Type",requestedWith="X-Requested-With",uniqid=0,callbackPrefix="reqwest_"+ +(new Date),lastValue,xmlHttpRequest="XMLHttpRequest",xDomainRequest="XDomainRequest",noop=function(){},isArray=typeof Array.isArray=="function"?Array.isArray:function(e){return e instanceof Array},defaultHeaders={contentType:"application/x-www-form-urlencoded",requestedWith:xmlHttpRequest,accept:{"*":"text/javascript, text/html, application/xml, text/xml, */*",xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript",js:"application/javascript, text/javascript"}},xhr=function(e){if(e.crossOrigin===!0){var t=context[xmlHttpRequest]?new XMLHttpRequest:null;if(t&&"withCredentials"in t)return t;if(context[xDomainRequest])return new XDomainRequest;throw new Error("Browser does not support cross-origin requests")}return context[xmlHttpRequest]?new XMLHttpRequest:XHR2?new XHR2:new ActiveXObject("Microsoft.XMLHTTP")},globalSetupOptions={dataFilter:function(e){return e}};return Reqwest.prototype={abort:function(){this._aborted=!0,this.request.abort()},retry:function(){init.call(this,this.o,this.fn)},then:function(e,t){return e=e||function(){},t=t||function(){},this._fulfilled?this._responseArgs.resp=e(this._responseArgs.resp):this._erred?t(this._responseArgs.resp,this._responseArgs.msg,this._responseArgs.t):(this._fulfillmentHandlers.push(e),this._errorHandlers.push(t)),this},always:function(e){return this._fulfilled||this._erred?e(this._responseArgs.resp):this._completeHandlers.push(e),this},fail:function(e){return this._erred?e(this._responseArgs.resp,this._responseArgs.msg,this._responseArgs.t):this._errorHandlers.push(e),this},"catch":function(e){return this.fail(e)}},reqwest.serializeArray=function(){var e=[];return eachFormElement.apply(function(t,n){e.push({name:t,value:n})},arguments),e},reqwest.serialize=function(){if(arguments.length===0)return"";var e,t,n=Array.prototype.slice.call(arguments,0);return e=n.pop(),e&&e.nodeType&&n.push(e)&&(e=null),e&&(e=e.type),e=="map"?t=serializeHash:e=="array"?t=reqwest.serializeArray:t=serializeQueryString,t.apply(null,n)},reqwest.toQueryString=function(e,t){var n,r,i=t||!1,s=[],o=encodeURIComponent,u=function(e,t){t="function"==typeof t?t():t==null?"":t,s[s.length]=o(e)+"="+o(t)};if(isArray(e))for(r=0;e&&r<e.length;r++)u(e[r].name,e[r].value);else for(n in e)e.hasOwnProperty(n)&&buildParams(n,e[n],i,u);return s.join("&").replace(/%20/g,"+")},reqwest.getcallbackPrefix=function(){return callbackPrefix},reqwest.compat=function(e,t){return e&&(e.type&&(e.method=e.type)&&delete e.type,e.dataType&&(e.type=e.dataType),e.jsonpCallback&&(e.jsonpCallbackName=e.jsonpCallback)&&delete e.jsonpCallback,e.jsonp&&(e.jsonpCallback=e.jsonp)),new Reqwest(e,t)},reqwest.ajaxSetup=function(e){e=e||{};for(var t in e)globalSetupOptions[t]=e[t]},reqwest})

/*
 * lg-stats js
 * Submit statistics to lg influxdb
 */

function LgStats(options) {
    var opt = options || {};
    this.host = opt.host || 'influx.galaxy.endpoint.com';
    this.port = opt.port;
    this.user = opt.user || 'jsstats';
    this.password = opt.password || 'jsstats';
    this.database = opt.database || 'jsstats';
    this.useSSL = (opt.useSSL === undefined ? true : opt.useSSL);
    this.defaultTags = options.defaultTags || {};
    this.defaultMeasure = options.defaultMeasure || 'jsstats';

    if (opt.url) {
        this.url = opt.url;
    }
    else {
        var protocol = this.useSSL ? 'https://' : 'http://';
        var url = protocol + this.host;
        if (this.port) {
            url += ':' + this.port;
        }
        url += '/write?db=' + this.database + '&u=' + this.user + '&p=' + this.password;
        this.url = url;
    }
}

LgStats.prototype.sendRaw = function(lineProtocolStr) {
    console.log("Send: " + lineProtocolStr);
    reqwest({
        url: this.url,
        method: 'post',
        data: lineProtocolStr,
        crossOrigin: true,
        error: function (err) {
            console.log(err);
        }
    });
};

LgStats.prototype.sendJson = function(obj) {
    var p1 = [];
    p1.push(obj.measure || this.defaultMeasure);
    var tags = encodeTags(obj);
    if (tags) {
        p1.push(tags);
    }

    var values = encodeValues(obj);

    this.sendRaw(p1.join(',') + ' ' + values);
};

LgStats.prototype.sendMsg = function(msg, measure, tags) {
    this.sendJson({
        measure: measure,
        tags: mergeOptions(this.defaultTags, tags || {}),
        values: {
            msg: msg
        }
    });
};

function encodeValues(obj) {
    var values = obj.values || {};
    var valEsc = [];
    for (var k in values) {
        if (values.hasOwnProperty(k)) {
            valEsc.push(k + '=' + escapeVal(values[k]));
        }
    }
    if (valEsc) {
        return valEsc.join(',');
    }
    return '';
}

var quoteExpr = new RegExp('"', 'g');
function escapeVal(value) {
    return '"' + value.replace(quoteExpr, '\"') + '"';
}

function encodeTags(obj) {
    var tags = obj.tags || {};
    var tagsEsc = [];
    for (var k in tags) {
        if (tags.hasOwnProperty(k)) {
            tagsEsc.push(k + '=' + escapeTagVal(tags[k]));
        }
    }
    if (tagsEsc) {
        return tagsEsc.join(',');
    }
    return '';
}

var spaceExpr = new RegExp(' ', 'g');
function escapeTagVal(val) {
    return val.replace(spaceExpr, '\ ');
}

function mergeOptions(obj1, obj2){
    var obj3 = {};
    for (var attrname in obj1) {
        obj3[attrname] = obj1[attrname];
    }
    for (var attrname in obj2) {
        obj3[attrname] = obj2[attrname];
    }
    return obj3;
}
