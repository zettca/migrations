import store from 'store';
import EventEmitter from 'events';

class SelectionEmitter extends EventEmitter { }

export const emitter = new SelectionEmitter();

export const state = {
  getCountries, setCountries, clearCountries,
  addCountry, remCountry,
  getYear, setYear,
  getMigration, setMigration,
};

function getYear() {
  return store.get('year') || 2010;
}

function setYear(value) {
  store.set('year', value);
  emitter.emit('yearChanged');
}

function getMigration() {
  return store.get('isEmigration') || false;
}

function setMigration(value) {
  store.set('isEmigration', value);
  emitter.emit('migrationChanged');
}

function getCountries() {
  return store.get('selectedCountries') || [];
}

function setCountries(countries) {
  store.set('selectedCountries', Array.from(countries));
  emitter.emit('countriesChanged');
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

export default {
  emitter,
  state,
};
