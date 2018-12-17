import store from 'store';
import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/lib/animated';
import { map } from '../idioms';

export default class CountrySelect extends React.PureComponent {
  render() {
    const { data } = this.props;
    const codeToName = store.get('codeToName');

    const countries = [];
    const year = Object.keys(data).slice(-1);
    Object.keys(data[year]).forEach(key => {
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
        onChange={(selection, action) => {
          console.log(action);

          const countries = new Set(store.get('selectedCountries'));

          console.log(countries);

          switch (action.action) {
            case 'clear':
              countries.clear();
              break;
            case 'select-option':
              countries.add(action.option.value);
              break;
            case 'remove-value':
              console.log(action.removedValue.value);
              countries.delete(action.removedValue.value);
              break;
            case 'set-value':
              console.log('wut, is possibru?');
              break;
            default:
              break;
          }

          console.log(countries);


          store.set('selectedCountries', Array.from(countries));
          map.update();
        }}
        {...this.props}
      />);
  }
}
