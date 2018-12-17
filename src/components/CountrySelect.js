import store from 'store';
import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/lib/animated';

import { selection, stateEmitter } from '../util';

const codeToName = store.get('codeToName');

function handleChange(selected, action) {
  console.log(selected, action);

  switch (action.action) {
    case 'clear':
      return selection.clearCountries();
    case 'select-option':
      return selection.addCountry(action.option.value)
    case 'remove-value':
      return selection.remCountry(action.removedValue.value)
    default:
      break;
  }
}

export default class CountrySelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    stateEmitter.on('countriesChanged', () => {
      const countries = selection.getCountries();
      const value = countries.map(c => ({ value: c, label: codeToName[c] }));
      this.setState({ value });
    });
  }

  render() {
    const countryData = this.props.data;

    const countries = [];
    const year = Object.keys(countryData).slice(-1);
    Object.keys(countryData[year]).forEach(key => {
      if (key.length !== 3) return;
      countries.push({ value: key, label: codeToName[key] });
    });

    const options = countries.sort((a, b) => a.label < b.label ? -1 : 1);

    return (
      <Select isMulti
        placeholder={'Select countries...'}
        components={makeAnimated}
        onBlurResetsInput={false}
        onSelectResetsInput={false}
        onCloseResetsInput={false}
        options={options}
        value={this.state.value}
        theme={(theme) => ({
          ...theme,
          borderRadius: 0,
          colors: {
            ...theme.colors,
            neutral0: '#333',
            neutral5: 'orange',
            neutral10: '#666',
            neutral20: '#666',
            primary25: '#666',
            neutral50: '#eee',
            neutral80: 'white'
          }
        })}
        onChange={handleChange}
        {...this.props}
      />);
  }
}
