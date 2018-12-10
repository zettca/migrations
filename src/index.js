import store from 'store';
import React from 'react';
import ReactDOM from 'react-dom';
import { tsv, json } from 'd3-fetch';

import YearSlider from './components/YearSlider';
import CountrySelect from './components/CountrySelect';
import MigrationSwitch from './components/MigrationSwitch';
import { chord, plot, lines, map } from './idioms';
import { filterNaN } from './helpers';

import './index.css';
import './idioms.css';

// STARTUP

store.remove('selectedCountries');
store.remove('isEmigration');

// STATIC TEST DATA

const plotData = [
  { x: 21, y: 110 },
  { x: 22.8, y: 93 },
  { x: 18.7, y: 175 },
  { x: 14.3, y: 245 },
  { x: 24.4, y: 62 },
  { x: 14.7, y: 230 },
  { x: 32.4, y: 66 },
  { x: 30.4, y: 52 },
  { x: 33.9, y: 65 },
  { x: 15.5, y: 150 },
  { x: 15.2, y: 150 },
  { x: 13.3, y: 245 },
  { x: 19.2, y: 175 },
  { x: 27.3, y: 66 },
  { x: 26, y: 91 },
  { x: 30.4, y: 113 },
  { x: 15.8, y: 264 },
  { x: 19.7, y: 175 },
  { x: 15, y: 335 },
  { x: 21.4, y: 109 }
];

// DYNAMIC REAL DATA

const years = [1990, 1995, 2000, 2005, 2010, 2015, 2017];
Promise.all(years.map(year => tsv(`./data/migration/${year}.tsv`)))
  .then(dataYearsList => {
    const migrationData = {};
    dataYearsList.forEach((yearData, i) => {
      migrationData[years[i]] = {};
      yearData.forEach(countryData => migrationData[years[i]][countryData.Country] = filterNaN(countryData));
    });

    console.log(migrationData);

    Promise.all([
      json('./data/topology.json'),
      tsv('./data/conversion.tsv'),
      tsv('./data/population.tsv'),
      tsv('./data/whr2017.tsv'),
    ]).then((dataResults) => {
      loadEverything(dataResults, migrationData);
    });
  });

function loadEverything(data, migrationData) {
  const [topology, conversion, population, whrData] = data;

  const codeToName = {};
  const countryPop = {};
  const countryWHR = {};
  population.forEach((c) => countryPop[c.Country] = filterNaN(c));
  whrData.forEach((c) => countryWHR[c.country] = filterNaN(c));
  conversion.forEach(c => codeToName[c.code3] = c.name);
  store.set('codeToName', codeToName);

  // order is important, sadly
  chord.draw('#chord', 600, 420, migrationData);
  plot.draw('#plot', 600, 420, plotData);
  lines.draw('#lines', 1000, 420, migrationData, countryPop);
  map.draw('#map', 1000, 420, topology, migrationData, countryPop);

  ReactDOM.render(getSelect(migrationData, codeToName), document.getElementById('countrySelect'));
  ReactDOM.render(<MigrationSwitch />, document.getElementById('migrationSwitch'));
  ReactDOM.render(<YearSlider />, document.getElementById('yearSlider'));
}

function getSelect(data, codeToName, value) {
  const countries = [];
  Object.keys(data[1990]).forEach(key => {
    if (key.length === 3) {
      countries.push({ value: key, label: codeToName[key], /*group: c.region*/ });
    }
  });

  return (
    <CountrySelect
      value={value}
      countries={countries}
      onChange={countryChange} />
  );
}

function countryChange(selection) {
  const countries = new Set(store.get('selectedCountries'));
  selection.forEach(el => countries.add(el.value));
  store.set('selectedCountries', Array.from(countries));
  map.update();
}