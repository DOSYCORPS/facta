"use strict";
import math from './math.js';
import {promisify} from './utils.js';
import ui from './ui.js';
import {R} from './r.js';
{
  const PRIME_OPTS = {
    algorithm: {
      name: 'PRIMEINC',
      workers: -1
    }
  };
  const makePrime = promisify((bits,cb) => forge.prime.generateProbablePrime(bits,PRIME_OPTS,cb));
  let currentGame = {};

  onload = () => newGame();

  function row(label,{pi,q,ni}) {
    return R`<tr>
      ${label}
      ${
        q.map( qj => {
          const cij = (pi*qj).toString().padStart(2,'0');
          const ten = cij.slice(0,1);
          const unit = cij.slice(1);
          //return R`<td>${ui.Cell({ten,unit})}</td>`
          return R`<td>${ui.Cell({ten:"",unit:""})}</td>`
        })
      }
      <td><strong>${ni}</strong></td>
    </tr>`;
  }

  function Table(problem) {
    problem = problem || currentGame;
    let {p,q,n} = problem;
    // one extra for the p and q and 1 extra for the n
    const matrixRows = p.length + 2; 
    const matrixColumns = q.length + 2;
    currentGame = {p,q,n,matrixRows,matrixColumns};
    p = currentGame.p.split('').reverse();
    q= currentGame.q.split('');
    n = currentGame.n.split('').reverse();
    const nColumn = n.slice(0, p.length);
    const nRow = n.slice(p.length).reverse().join('').padStart(p.length,'0').split('');
    const FirstRowQ = R`<tr>
      <td></td>
      ${
        q.map( qj => R`<td><strong>${ui.FactorUnit({unit:"",qj})}</strong></td>` )
      }
      <td></td>
    </tr>`;
    const LastRowN = R`<tr>
      <td></td>
      ${
        nRow.map( ni => R`<td><strong>${ni}</strong></td>` )
      }
      <td></td>
    </tr>`;
    const Rows = [FirstRowQ];
    for( let i = 1; i < currentGame.matrixRows - 1; i++ ) {
      const pi = p[i-1];
      const ni = nColumn[i-1];
      const RowLabel = R`<td><strong>${ui.FactorUnit({unit:"",pi})}</strong></td>`;
      const rowi = row(RowLabel,{pi,q,ni});
      Rows.push(rowi);
    }
    Rows.push(LastRowN);
    return R`
      <table>
        <tbody>
          ${Rows}
        </tbody>
      </table>
    `;
  }

  async function newGame() {
    const problem = await newProblem(33);
    console.log(problem);
    Game(problem).to(document.querySelector('main'), 'replace');
  }

  async function newPrimes(bits) {
    const p = (await makePrime(bits)).toString().slice(1);
    const q = (await makePrime(bits)).toString().slice(1);
    return {p,q};
  }

  async function newProblem(bits) {
    const {p,q} = await newPrimes(bits);
    const n = bigInt(p).times(bigInt(q)).toString(10); 
    return {p,q,n,bits};
  }

  function Game(problem) {
    return R`
      <article>
        <h1>Facta ${problem.bits} bits</h1>
        ${Table(problem)}
      </article>
    `;
  }
}
