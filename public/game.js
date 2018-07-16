"use strict";
import math from './math.js';
import {promisify} from './utils.js';
import ui from './ui.js';
{
  const PRIME_OPTS = {
    algorithm: {
      name: 'PRIMEINC',
      workers: -1
    }
  };
  const makePrime = promisify((bits,cb) => forge.prime.generateProbablePrime(bits,PRIME_OPTS,cb));

  onload = () => newGame();
  Object.assign(self,{ui});

  function row(label,{pi,q}) {
    return R`<tr>
      ${label}
      ${q.map( qj => {
        const cij = pi*qj; 
        return R`<td>${new ui.Cell()}</td>`
      })}
    </tr>`;
  }

  class Table extends Brute {
    constructor(problem) {
      super(problem);
      const {p,q,n} = problem;
      // one extra for the p and q
      const matrixRows = p.length + 1; 
      const matrixColumns = q.length + 1;
      Object.assign(this, {p,q,n,matrixRows,matrixColumns});
    }
    render() {
      const p = this.p.split('');
      p.reverse();
      const q= this.q.split('');
      const FirstRow = R`<tr><td></td>${
        q.map( qi => R`<td><em>${qi}</em></td>` )
      }</tr>`;
      const Rows = [FirstRow];
      for( let i = 1; i < this.matrixRows; i++ ) {
        const pi = p[i-1];
        const RowLabel = R`<td><em>${pi}</em></td>`;
        const rowi = row(RowLabel,{pi,q});
        Rows.push(rowi);
      }
      return R`
        <table>
          <tbody>
            ${Rows}
          </tbody>
        </table>
      `;}
  }

  async function newGame() {
    const problem = await newProblem(35);

    render(Game(problem), document.querySelector('main'));
  }

  async function newPrimes(bits) {
    const p = (await makePrime(bits)).toString().slice(1);
    const q = (await makePrime(bits)).toString().slice(1);
    return {p,q};
  }

  async function newProblem(bits) {
    const {p,q} = await newPrimes(bits);
    const n = bigInt(p).times(bigInt(q)).toString(10); 
    return {p,q,n};
  }

  function Game(problem) {
    return R`
      <article>
        ${new Table(problem)}
      </article>
    `;
  }
}
