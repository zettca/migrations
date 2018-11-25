/*
import React from 'react';
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));
*/

import { tsv, json } from 'd3-fetch';
import idioms from './idioms';
import './index.css';
import './idioms.css';

// FETCH DATA AND DRAW

Promise.all([
  json('./data/countries.json'),
  tsv('./data/population.tsv'),
]).then((dataResults) => {
  const [countries, population] = dataResults;
  idioms.drawPlot('#plot', 600, 400);
  idioms.drawLines('#lines', 600, 400);
  idioms.drawMap('#map', 800, 400, countries, population);
  // idioms.drawChord(svgChord);
});

// UPDATE DATA HANDLERS
