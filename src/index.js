import store from 'store';
import React from 'react';
import ReactDOM from 'react-dom';
import { tsv, json } from 'd3-fetch';

import YearSlider from './components/YearSlider';
import EventSelect from './components/EventSelect';
import CountrySelect from './components/CountrySelect';
import MigrationSwitch from './components/MigrationSwitch';
import { chord, graph, map } from './idioms';
import { selection, byId, filterNaN, getMigrationDiff } from './util';

import './index.css';

// STARTUP

store.remove('selectedCountries');
store.remove('isEmigration');
store.set('year', 2010);
store.set('selectedCountries', ['PRT']);

// DYNAMIC REAL DATA

const filesPromise = [
  json('./data/topology.json'),
  json('./data/migrations.json'),
  tsv('./data/conversion.tsv'),
  tsv('./data/population.tsv'),
  tsv('./data/events.tsv'),
  tsv('./data/whr2018.tsv'),
];

Promise.all(filesPromise).then((dataResults) => handleData(dataResults));

function handleData(data) {
  const [topology, migrationData, conversion, population, events, whrData] = data;
  const migrationDiff = getMigrationDiff(migrationData);

  const codeToName = {}, countryPop = {}, countryWHR = {};
  population.forEach((c) => countryPop[c.Country] = filterNaN(c));
  whrData.forEach((c) => countryWHR[c.country] = filterNaN(c));
  conversion.forEach(c => codeToName[c.code3] = c.name);
  store.set('codeToName', codeToName);

  map.draw('#map', topology, migrationDiff, countryPop);
  graph.draw('#graph', migrationDiff, whrData, countryPop);
  chord.draw('#chord', migrationData);

  ReactDOM.render(<CountrySelect data={migrationData} />, byId('countrySelect'));
  ReactDOM.render(<EventSelect events={events} />, byId('eventList'));
  ReactDOM.render(<MigrationSwitch />, byId('migrationSwitch'));
  ReactDOM.render(<YearSlider />, byId('yearSlider'));

  selection.setCountries(['PRT', 'FRA', 'GBR']);
}
