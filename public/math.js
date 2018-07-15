"use strict";

  // all possible products of 0...9 x 0...9

  const products = range(0,9).reduce( (map,pi) => {
    range(0,9).forEach( qi => {
      const product = (pi*qi+'').padStart(2,'0'); 
      let sources = map[product];
      if ( sources == undefined ) {
        sources = map[product] = [];
      }
      sources.push({pi,qi});
    });
    return map;
  }, {});

  // and various other useful data

  const units = [...new Set(Object.keys(products).map( x => x.slice(1) )).values()].sort();
  const tens = [...new Set(Object.keys(products).map( x => x.slice(0,1) )).values()].sort();

  const products_by_unit = units.reduce( (map, u) => {
    Object.keys(products).forEach( product => {
      const unit = product.slice(1);
      const product_sources = products[product];
      let unit_sources = map[unit];
      if ( unit_sources == undefined ) {
        unit_sources = map[unit] = {};
      }
      unit_sources[product] = product_sources;
    });
    return map;
  }, {});
  const products_by_ten = tens.reduce( (map, u) => {
    Object.keys(products).forEach( product => {
      const ten = product.slice(0,1);
      const product_sources = products[product];
      let ten_sources = map[ten];
      if ( ten_sources == undefined ) {
        ten_sources = map[ten] = {};
      }
      ten_sources[product] = product_sources;
    });
    return map;
  }, {});
  const products_by_source = range(0,9).reduce( (map,source) => {
    range(0,9).forEach( a => {
      const product = source*a;
      let products = map[source];
      if ( products == undefined ) {
        products = map[source] = new Set();
      }
      products.add(product);
    });
    map[source] = [...map[source].values()].sort((a,b) => a-b);
    return map;
  }, {});

  const units_by_ten = tens.reduce(
    (map,t) => (map[t] = Object.keys(products_by_ten[t]).map(p => p.slice(1)).sort(num),map),
    {}
  );
  const tens_by_unit = units.reduce( 
    (map,u) => (map[u] = Object.keys(products_by_unit[u]).map(p => p.slice(0,1)).sort(num),map),
    {}
  );

  //console.log(JSON.stringify(units_by_ten,null,2));
  //console.log(JSON.stringify(tens_by_unit,null,2));
  //console.log(JSON.stringify(products,null,2),Object.keys(products).length);
  //console.log(JSON.stringify(products_by_unit,null,2));
  //console.log(JSON.stringify(products_by_ten,null,2));
  //console.log(JSON.stringify(products_by_source,null,2));
  
  function range(a,b) {
    const out = new Array(b-a+1);
    while( a <= b ) {
      out.push(a);
      a += 1;
    }
    return out;
  }

  function num(a,b) { return a-b; }

export default {
  products: {
    all: products,
    by_unit: products_by_unit,
    by_ten: products_by_ten,
    by_source: products_by_source
  },
  sources: {
    by_product: products  
  },
  units: {
    all: units, 
    by_ten: units_by_ten
  },
  tens: {
    all: tens,
    by_unit: tens_by_unit
  }
};
