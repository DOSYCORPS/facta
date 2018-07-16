import {defd,undfd} from './utils.js';
import math from './math.js';


class Cell extends Brute {
  constructor(props = {}) {
    super(props);
    const state = Object.assign({},props);
    this.recalculate(state);
    Object.assign(this.state,state);
  }
  recalculate(state) {
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
  render() {
    return R`
      <span>
        <select name=ten change=${e => this.redraw(e)}>
          <option value="" selected>
          ${this.state.tens.map(v => R`<option${v==this.state.ten?' selected':''}>${v}`)}
        </select>
        <select name=unit change=${e => this.redraw(e)}>
          <option value="" selected>
          ${this.state.units.map(v => R`<option${v==this.state.unit?' selected':''}>${v}`)}
        </select>
        <button name=reset click=${e => this.reset(e)}>Reset</button>
      </span>
    `;
  }
  reset(e) {
    const state = {ten:null,unit:null};
    this.setState(this.recalculate(state));
  }
  redraw(e) {
    e.preventDefault();
    const {srcElement} = e;
    const {name} = srcElement;
    const parent = {};
    parent.ten = srcElement.parentElement.querySelector('[name="ten"]');
    parent.unit = srcElement.parentElement.querySelector('[name="unit"]');
    const state = Object.assign({},{
      [name]: srcElement.value
    });
    if ( name == 'ten' ) {
      const unit = Array.from(parent.unit.children).find( o => o.selected );
      state.unit = unit ? unit.value : null;
    } else if ( name == 'unit' ) {
      const ten = Array.from(parent.ten.children).find( o => o.selected );
      state.ten = ten ? ten.value : null;
    }
    this.recalculate(state);
    this.setState(state);
  }
}

const ui = {
  Cell
};


export default ui;
