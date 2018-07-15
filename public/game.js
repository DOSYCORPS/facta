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

  async function newGame() {
    const problem = await newProblem(128);
    render(Game(), document.querySelector('main'));
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

  function Game() {
    return R`
      ${ui.cell({})}
    `;
  }
}
