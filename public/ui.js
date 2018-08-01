import {defd,undfd} from './utils.js';
import math from './math.js';
import {R} from './r.js';

const cells = {};
const factors = {};
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

  function resetFactor(e) {
    const props = factors[e.target.closest('.factor-unit').id] || {};
    Object.assign(props,{unit:null});
    render(FactorUnit(props),document.getElementById(props.cell_id),{replace:true});
  }

  function redrawFactor(e) {
    e.preventDefault();
    const props = factors[e.target.closest('.factor-unit').id] || {};
    const {target} = e;
    props.unit = target.value
    render(FactorUnit(props),document.getElementById(props.cell_id),{replace:true});
  }

  function FactorUnit(props) {
    let unit = props.unit;
    props.unit = props.unit || undefined;
    props.units = props.units || math.range(0,9);
    props.cell_id = props.cell_id || cellId++;
    factors[props.cell_id] = props;
    return R`
      <span class="cell factor-unit" id=${props.cell_id}>
        <button name=reset click=${resetFactor}>X</button>
        <select name=unit change=${redrawFactor}>
          <option value="" selected>
          ${props.units.map(v => R`<option${v==props.unit?' selected':''}>${v}`)}
        </select>
      </span>
    `;
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
    const {target} = e;
    const {name} = target;
    const parent = {};
    parent.ten = target.parentElement.querySelector('[name="ten"]');
    parent.unit = target.parentElement.querySelector('[name="unit"]');
    props[name] = target.value
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
    Cell, FactorUnit
  }

  export default ui;
