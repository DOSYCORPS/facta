import {defd,undfd} from './utils.js';
import math from './math.js';
const ui = {
  cell
};

function redraw(e) {
  e.preventDefault();
  const {srcElement} = e;
  const {name} = srcElement;
  const parent = srcElement.matches('form') ? srcElement : srcElement.parentElement;
  const state = {
    [name]: srcElement.value
  };
  console.log(parent,parent.ten,parent.unit);
  if ( name == 'ten' ) {
    const unit = Array.from(parent.unit.children).find( o => o.selected );
    state.unit = unit ? unit.value : null;
  } else if ( name == 'unit' ) {
    const ten = Array.from(parent.ten.children).find( o => o.selected );
    state.ten = ten ? ten.value : null;
  }

  render(cell(state),parent,{replace:true});
}

function cell(props) {
  if ( defd(props.unit) && undfd(props.ten) ) {
    props.tens = math.tens.by_unit[props.unit];
    props.units = [props.unit];
  } else if ( defd(props.ten) && undfd(props.unit) ) {
    props.tens = [props.ten];
    props.units = math.units.by_ten[props.ten];
  } else if ( undfd(props.unit) && undfd(props.ten) ) {
    console.log('unset case');
    props.tens = math.tens.all;
    props.units = math.units.all;
  } else {
    console.log('set case');
    props.tens = [props.ten];
    props.units = [props.unit];
  }
  console.log(props);
  return R`
    <form change=${redraw} submit=${redraw}>
      <select name=ten>
        <option value="" selected>
        ${props.tens.map(v => R`<option${v==props.ten?' selected':''}>${v}`)}
      </select>
      <select name=unit>
        <option value="" selected>
        ${props.units.map(v => R`<option${v==props.unit?' selected':''}>${v}`)}
      </select>
      <button name=reset>Reset</button>
    </form>
  `;
}


export default ui;
