import * as d3 from 'd3';
import store from 'store';
import EventEmitter from 'events';

class SelectionEmitter extends EventEmitter { }

export const stateEmitter = new SelectionEmitter();

export const years = [1995, 2000, 2005, 2010, 2015, 2017];

export function tryNumber(value) {
  return Number(value) || value;
}

export const colors = {
  map: d3.schemeBlues[9],
  selection: d3.schemePaired.slice(2),
};

export const selection = {
  getCountries, setCountries, clearCountries,
  addCountry, remCountry,
  getYear: () => store.get('year'),
  setYear,
  getMigration: () => store.get('isEmigration'),
  setMigration,
};

function setYear(value) {
  store.set('year', value);
  stateEmitter.emit('yearChanged');
}

function setMigration(value) {
  store.set('isEmigration', value);
  stateEmitter.emit('migrationChanged');
}

function getCountries() {
  return store.get('selectedCountries');
}

function setCountries(countries) {
  store.set('selectedCountries', Array.from(countries));
  stateEmitter.emit('countriesChanged');
}

function clearCountries() {
  setCountries([]);
}

function addCountry(countryId) {
  const countries = new Set(getCountries());
  countries.add(countryId);
  setCountries(countries);
}

function remCountry(countryId) {
  const countries = new Set(getCountries());
  countries.delete(countryId);
  setCountries(countries);
}



export function getMigration(dataYear, country) {
  const isEmigration = store.get('isEmigration');
  return isEmigration ? dataYear['WORLD'][country] : dataYear[country]['Total'];
}

export function countryName(code) {
  const codeToName = store.get('codeToName');
  return codeToName[code];
}

export function filterNaN(obj) {
  const res = {};

  for (const key in obj) {
    const num = Number(obj[key]);
    if (!isNaN(num) && num !== 0) {
      res[key] = num;
    }
  }

  return res;
}

export function parseNaN(obj) {
  const res = {};

  for (const key in obj) {
    const num = Number(obj[key]);
    res[key] = num || obj[key];
  }

  return res;
}

export function byId(id) {
  return document.getElementById(id);
}

export function createSVG(id, dims = { width: 400, height: 400 }, margins) {
  const svg = d3.select(id).append('svg')
    .attr('width', dims.width)
    .attr('height', dims.height);

  if (margins !== undefined) {
    const group = svg.append('g')
      .attr('class', 'main')
      .attr('transform', `translate(${margins.left || 0},${margins.top || 0})`);
    return group;
  }

  return svg;
}

export function getMigrationDiff(migrationData) {
  function previousYear(dataYears, year) {
    const i = dataYears.indexOf(year);
    return (i > 0) ? dataYears[i - 1] : dataYears[0];
  }

  const migrationDiff = {};
  const dataYears = Object.keys(migrationData);

  for (const year in migrationData) {
    if (year === dataYears[0]) continue;

    migrationDiff[year] = {};
    for (const c in migrationData[year]) {
      migrationDiff[year][c] = {};

      for (const c2 in migrationData[year][c]) {
        const thisValue = migrationData[year][c];
        const prevValue = migrationData[previousYear(dataYears, year)][c] || {};
        migrationDiff[year][c][c2] = thisValue[c2] - (prevValue[c2] || 0);
      }
    }
  }

  return migrationDiff;
}
