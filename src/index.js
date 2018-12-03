import React from 'react';
import ReactDOM from 'react-dom';
import { tsv, json } from 'd3-fetch';

import YearSlider from './components/YearSlider';
import CountrySelect from './components/CountrySelect';
import { chord, plot, lines, map } from './idioms';

import './index.css';
import './idioms.css';

// STATIC TEST DATA

const chordData = [
  [16, 16, 13, 12, 0, 6],
  [1, 0, 12, 10, 6, 1],
  [9, 10, 13, 0, 5, 5],
  [15, 1, 14, 16, 9, 16],
  [5, 10, 16, 16, 10, 0],
  [9, 8, 2, 13, 13, 9]
];

const plotData = [
  { 'name': 'A', 'x': 21, 'y': 110 },
  { 'name': 'B', 'x': 22.8, 'y': 93 },
  { 'name': 'C', 'x': 18.7, 'y': 175 },
  { 'name': 'D', 'x': 14.3, 'y': 245 },
  { 'name': 'E', 'x': 24.4, 'y': 62 },
  { 'name': 'F', 'x': 14.7, 'y': 230 },
  { 'name': 'G', 'x': 32.4, 'y': 66 },
  { 'name': 'H', 'x': 30.4, 'y': 52 },
  { 'name': 'I', 'x': 33.9, 'y': 65 },
  { 'name': 'J', 'x': 15.5, 'y': 150 },
  { 'name': 'K', 'x': 15.2, 'y': 150 },
  { 'name': 'L', 'x': 13.3, 'y': 245 },
  { 'name': 'M', 'x': 19.2, 'y': 175 },
  { 'name': 'N', 'x': 27.3, 'y': 66 },
  { 'name': 'O', 'x': 26, 'y': 91 },
  { 'name': 'P', 'x': 30.4, 'y': 113 },
  { 'name': 'Q', 'x': 15.8, 'y': 264 },
  { 'name': 'R', 'x': 19.7, 'y': 175 },
  { 'name': 'S', 'x': 15, 'y': 335 },
  { 'name': 'T', 'x': 21.4, 'y': 109 }
];

// DYNAMIC REAL DATA

const years = [1990, 1995, 2000, 2005, 2010, 2015, 2017];
Promise.all(years.map(year => tsv(`./data/migration_flows/${year}.tsv`)))
  .then(dataYearsList => {
    const dataYears = {};
    dataYearsList.forEach((yearData, i) => {
      dataYears[years[i]] = {};
      yearData.forEach(countryData => dataYears[years[i]][countryData.Country] = countryData);
    });

    //console.log(dataYears);

    Promise.all([
      json('./data/countries.json'),
      tsv('./data/conversion.tsv'),
      tsv('./data/population.tsv'),
    ]).then((dataResults) => {
      loadEverything(dataResults, dataYears);
    });
  });

function loadEverything(data, dataYears) {
  const [mapData, conversion, population] = data;
  plot.draw('#plot', 600, 420, plotData);
  lines.draw('#lines', 800, 420, dataYears);
  map.draw('#map', 800, 420, mapData, population);
  chord.draw('#chord', 600, 420, chordData);

  const select = <CountrySelect countries={conversion} onChange={handleCountrySelection} />;
  const slider = (<YearSlider />);
  ReactDOM.render(select, document.getElementById('countrySelect'));
  ReactDOM.render(slider, document.getElementById('yearSlider'));
}

function handleCountrySelection(el) {
  console.log('Country Selection:');
  console.log(el);
}
