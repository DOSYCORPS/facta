import {defd,undfd} from './utils.js';
import math from './math.js';

const cells = {};
let cellId = 1;

function recalculate(state) {
  if ( defd(state.unit) && undfd(state.ten) ) {
    state.tens = math.tens.by_unit[state.unit];
    state.units = [state.unit];
  } else if ( defd(state.ten) && undfd(state.unit) ) {
    state.tens = [state.ten];
    state.units = math.units.by_ten[state.ten];
  } else if ( undfd(state.unit) && undfd(state.ten) ) {
    state.tens = math.tens.all;
    state.units = math.units.all;
  } else {
    state.tens = [state.ten];
    state.units = [state.unit];
  }
  return state;
}

function Cell(props) {
  props.cell_id = props.cell_id || cellId++;
  cells[props.cell_id] = props;
  props = recalculate(props);
  return R`
    <span class=cell id=${props.cell_id}>
      <button name=reset click=${reset}>X</button>
      <br>
      <a href=#/some-info>Some info</a>
      <br>
      <select name=ten change=${redraw}>
        <option value="" selected>
        ${props.tens.map(v => R`<option${v==props.ten?' selected':''}>${v}`)}
      </select>
      <select name=unit change=${redraw}>
        <option value="" selected>
        ${props.units.map(v => R`<option${v==props.unit?' selected':''}>${v}`)}
      </select>
    </span>
  `;
}

function reset(e) {
  const props = cells[e.target.closest('.cell').id] || {};
  Object.assign(props,{ten:null,unit:null});
  render(Cell(props),document.getElementById(props.cell_id),{replace:true});
}

function redraw(e) {
  e.preventDefault();
  const props = cells[e.target.closest('.cell').id] || {};
  const {srcElement} = e;
  const {name} = srcElement;
  const parent = {};
  parent.ten = srcElement.parentElement.querySelector('[name="ten"]');
  parent.unit = srcElement.parentElement.querySelector('[name="unit"]');
  props[name] = srcElement.value
  if ( name == 'ten' ) {
    const unit = Array.from(parent.unit.children).find( o => o.selected );
    props.unit = unit ? unit.value : null;
  } else if ( name == 'unit' ) {
    const ten = Array.from(parent.ten.children).find( o => o.selected );
    props.ten = ten ? ten.value : null;
  }
  render(Cell(props),document.getElementById(props.cell_id),{replace:true});
}

const ui = {
  Cell
}

export default ui;
