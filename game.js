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

  async function newGame() {
    const problem = await newProblem(200);
    console.log(problem);
    Game(problem).to(document.querySelector('main'), 'innerHTML');
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
        ${ui.Table(problem)}
      </article>
    `;
  }
}
