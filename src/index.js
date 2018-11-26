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

const chordData = [
  [19, 11, 19, 14, 15, 14, 13, 17],
  [5, 9, 5, 13, 0, 16, 2, 9],
  [12, 18, 12, 2, 1, 6, 13, 8],
  [11, 12, 18, 5, 19, 6, 16, 18],
  [19, 20, 17, 7, 16, 5, 9, 12],
  [13, 18, 15, 6, 12, 14, 11, 7],
  [10, 5, 0, 19, 18, 1, 1, 5],
  [20, 10, 7, 7, 13, 6, 1, 20]];

const plotData = [
  { 'name': 'Mazda', 'x': 21, 'y': 110 },
  { 'name': 'Datsun', 'x': 22.8, 'y': 93 },
  { 'name': 'Hornet', 'x': 18.7, 'y': 175 },
  { 'name': 'Duster', 'x': 14.3, 'y': 245 },
  { 'name': 'Merc', 'x': 24.4, 'y': 62 },
  { 'name': 'Chrysler', 'x': 14.7, 'y': 230 },
  { 'name': 'Fiat', 'x': 32.4, 'y': 66 },
  { 'name': 'Honda', 'x': 30.4, 'y': 52 },
  { 'name': 'Toyota', 'x': 33.9, 'y': 65 },
  { 'name': 'Dodge', 'x': 15.5, 'y': 150 },
  { 'name': 'AMC', 'x': 15.2, 'y': 150 },
  { 'name': 'Camaro', 'x': 13.3, 'y': 245 },
  { 'name': 'Pontiac', 'x': 19.2, 'y': 175 },
  { 'name': 'Fiat-9', 'x': 27.3, 'y': 66 },
  { 'name': 'Porsche-2', 'x': 26, 'y': 91 },
  { 'name': 'Lotus', 'x': 30.4, 'y': 113 },
  { 'name': 'Ford L', 'x': 15.8, 'y': 264 },
  { 'name': 'Ferrari', 'x': 19.7, 'y': 175 },
  { 'name': 'Maserati', 'x': 15, 'y': 335 },
  { 'name': 'Volvo', 'x': 21.4, 'y': 109 }];

plotData.x = 'Miles per gallon';
plotData.y = 'Horsepower';

Promise.all([
  json('./data/countries.json'),
  tsv('./data/population.tsv'),
]).then((dataResults) => {
  const [countries, population] = dataResults;
  idioms.drawPlot('#plot', 860, 420, plotData);
  idioms.drawLines('#lines', 860, 420);
  idioms.drawMap('#map', 860, 420, countries, population);
  idioms.drawChord('#chord', 600, 420, chordData);
});

// UPDATE DATA HANDLERS
