import store from 'store';
import React from 'react';
import ReactDOM from 'react-dom';
import { tsv, json } from 'd3-fetch';

import YearSlider from './components/YearSlider';
import CountrySelect from './components/CountrySelect';
import MigrationSwitch from './components/MigrationSwitch';
import { chord, plot, lines, map } from './idioms';
import { filterNaN, getMigrationDiff } from './helpers';

import './index.css';
import './idioms.css';

// STARTUP

store.remove('selectedCountries');
store.remove('isEmigration');

store.set('selectedCountries', ['PRT', 'SWE', 'UKR']);

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

const filesPromise = [
  json('./data/topology.json'),
  json('./data/migrations.json'),
  tsv('./data/conversion.tsv'),
  tsv('./data/population.tsv'),
  tsv('./data/whr2017.tsv'),
];

Promise.all(filesPromise).then((dataResults) => handleData(dataResults));

function handleData(data) {
  const [topology, migrationData, conversion, population, whrData] = data;

  console.log(migrationData);
  const migrationDiff = getMigrationDiff(migrationData);

  console.log(migrationDiff);

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
  lines.draw('#lines', 1000, 420, migrationDiff, countryPop);
  map.draw('#map', 1000, 420, topology, migrationDiff, countryPop);

  ReactDOM.render(getSelect(migrationDiff, codeToName), document.getElementById('countrySelect'));
  ReactDOM.render(<MigrationSwitch />, document.getElementById('migrationSwitch'));
  ReactDOM.render(<YearSlider />, document.getElementById('yearSlider'));
}

function getSelect(data, codeToName, value) {
  const countries = [];
  Object.keys(data[2000]).forEach(key => {
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
