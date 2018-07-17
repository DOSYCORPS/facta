{
  const XSS = 'Possible XSS attack warning. Possible object forgery attempt detected. Codes do not match.',
    OBJ = 'Object properties don\'t work here.',
    LAST_ATTR_NAME = /\s+([\w-]+)\s*=\s*"?\s*$/,
    NEW_TAG = /<[\w]+/,
    currentKey = Math.random()+'',
    domCache = {};

  class Brute {
    constructor(props) {
      props = Object.freeze(props);
      const state = Object.assign({},props);
      const pin = 'pin' + Math.random();
      Object.assign(this, {pin,props,state});
    }

    setState(newState) {
      switch( typeof newState ) {
        case "function":
          this.setState(newState(Object.freeze(Object.assign({},this.state)),this.props));
          break;
        case "object":
          Object.assign(this.state,newState);
          break;
        default:
          this.state = newState;
          break;
      }
      render(this,domCache[this.pin],{replace:true});
    }

    render() {
      return R``;
    }
  }

  /**
    Crude example of pinning
    Use with stateful components
    First time must call render with actual location
    Thereafter that location is set as pinned
    Can we replace this first time requirement with
    say we want to include x inside an R template? 
    Can we extend pinning to regular 'non-component' brutal / r functions?
  **/


  Object.assign(self,{R,render,Brute,domCache});


  function R (parts, ...vals) {
    parts = [...parts];
    const handlers = {};
    const pinned = [];
    vals = vals.map(v => {
      if (Array.isArray(v) && v.every(item => !!item.handlers && !!item.str)) {
        return join(v,pinned) || '';
      } else if (typeof v === 'object' && !!v) {
        if (!!v.str && !!v.handlers) {
          return verify(v,currentKey) && v;
        } else if (v instanceof Brute) {
          const {pin} = v;
          v = v.render();
          v.pin = pin;
          verify(v,currentKey);
          pinned.push(v);
          domCache[v.pin] = undefined;
          return R`<span data-pin=${v.pin}></span>`;
        }
        throw {error: OBJ, value: v};
      } else return v === null || v === undefined ? '' : v;
    });
    let hid,
      hidSaved = false,
      str = '';
    while (parts.length > 1) {
      const part = parts.shift(),
        attrNameMatches = part.match(LAST_ATTR_NAME);
      let val = vals.shift();
      if (part.match(NEW_TAG)) {
        hid = `hid_${Math.random()}`;
        hidSaved = false;
      }
      if (typeof val === 'function') {
        const attrName = attrNameMatches && attrNameMatches.length > 1
            ? attrNameMatches[1].replace(/^on/,'').toLowerCase()
            : false,
          newPart = part.replace(attrNameMatches[0], '');
        str += attrName ? newPart : part;
        if (!hidSaved) {
          handlers[hid] = [];
          hidSaved = true;
          str += ` data-hid="${hid}"`;
        }
        handlers[hid].push({eventName: attrName, handler: val});
      } else if (!!val && !!val.handlers && !!val.str) {
        Object.assign(handlers,val.handlers);
        str += part;
        val = val.str;
        if (attrNameMatches) val = `"${val}"`;
        str += val;
      } else {
        str += part;
        str += attrNameMatches ? `"${safe(val)}"` : safe(val);
      }
    }
    str += parts.shift();
    const o = {str,handlers,pinned};
    o.code = sign(o,currentKey);
    return o;
  }

  function render (r, root, {replace: replace = false} = {}) {
    if (r instanceof Brute) {
      const {pin} = r;
      r = r.render();
      r.pin = pin;
    }
    if (Array.isArray(r) && r.every(val => !!val.str && !!val.handlers)) r = join(r);
    verify(r,currentKey);
    const {str,handlers,pinned} = r;
    const newPinNodes = [];
    if (replace) {
      const frag = df(str);
      let pinNodes = domCache[r.pin];
      if ( !Array.isArray(pinNodes) ) {
        pinNodes = domCache[r.pin] = [];
      }
      if ( pinNodes.length ) {
        pinNodes.forEach( rootset => {
          const cloneFrag = frag.cloneNode(true);
          newPinNodes.push(Array.from(cloneFrag.childNodes));
          rootset[0].parentElement.insertBefore(cloneFrag,rootset[0]);
          rootset.forEach( el => el.remove() );
        });
      } else {
        if ( Array.isArray(root) ) {
          root.forEach( rootset => {
            const cloneFrag = frag.cloneNode(true);
            newPinNodes.push(Array.from(cloneFrag.childNodes));
            rootset[0].parentElement.insertBefore(cloneFrag,rootset[0]);
            rootset.forEach( el => el.remove() );
          });
        } else if (!!root) {
          const cloneFrag = frag.cloneNode(true);
          newPinNodes.push(Array.from(cloneFrag.childNodes));
          root.parentElement.insertBefore(cloneFrag,root);
          root.remove();
        }
      }
      domCache[r.pin] = newPinNodes;
    } else {
      root.innerHTML = '';
      root.insertAdjacentHTML('afterBegin', str);
    }
    Object.keys(handlers).forEach(hid => {
      // again could be optimized
      // doing the qs takes a long time
      // it may be be better to prefill these node values somehow
      const node = document.querySelector(`[data-hid="${hid}"]`),
        nodeHandlers = handlers[hid];

      if (!!node && !!nodeHandlers) {
        nodeHandlers.forEach(({eventName,handler}) => node.addEventListener(eventName,handler));
      } else throw {error: `Node or handlers could not be found for ${hid}`, hid};
    });
    pinned.forEach( v => {
      // could be optimized
      // build pinned from the nodes already 
      // since qsa takes a while
      const locations = Array.from(document.querySelectorAll(`[data-pin="${v.pin}"]`));
      render(v,locations.map(x => [x]), {replace:true});
    });
  }

  function df( t ) {
    return (new DOMParser).parseFromString(`<template>${t}</template>`,"text/html").head.firstElementChild.content;
  }

  function join (rs,allPinned) {
    const H = {},
      str = rs.map(({str,handlers,code,pinned}) => (
        verify({str,handlers,code},currentKey),Object.assign(H,handlers),allPinned.push(...pinned),str)).join('\n');

    if (str) {
      const o = {str,handlers:H};
      o.code = sign(o,currentKey);
      o.pinned = allPinned;
      return o;
    }
  }

  function safe (v) {
    return String(v).replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/&/g,'&amp;').replace(/"/g,'&#34;').replace(/'/g,'&#39;');
  }

  function sign ({str,handlers},key) {
    const val = `${str}:${JSON.stringify(handlers,(k,v) => typeof v === 'function' ? `${v}` : v)}`;
    return hash(key,val);
  }

  function verify ({str,handlers,code},key) {
    if (sign({str,handlers},key) === code) return true;
    throw {error: XSS};
  }

  function hash (key = '', str) {
    const s = str.length,
      m = bytes(key+str),
      a=new Float64Array(4);

    a[0] = 1;
    a[2] = s ? Math.pow(s+1/s, 1/2) : 3;
    a[3] = s ? Math.pow(s+1/s, 1/5) : 7;
    m.forEach((x,i) => {
      a[1] = (x+i+1)/a[3];
      a[2] += a[0]/a[1];
      a[2] = 1/a[2];
      a[3] += x;
      a[3] = a[0]/a[3];
      a[0] = a[1]+1;
    });
    a[2] *= Math.PI+a[3];
    a[3] *= Math.E+a[2];

    return new Uint8Array(a.buffer).reduce((s,b) => s+b.toString(16).padStart(2,'0'));
  }

  function symbytes (sym) {
    return unescape(encodeURIComponent(sym)).split('').map(c => c.codePointAt(0));
  }

  function bytes (str) {
    return Array.from(str).reduce((b,s) => (b.push(...symbytes(s)), b),[]);
  }
}
