import store from 'store';
import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/lib/animated';

import { map } from '../idioms';

export default class EventSelect extends React.PureComponent {
  render() {
    const { events } = this.props;

    const options = [];

    events.forEach((event, i) => {
      options.push({ value: i, label: event.name });
    });

    return (
      <Select
        onChange={(selection) => {
          const { name, year, countries } = events[selection.value];

          const countriesList = countries.split(',')

          console.log(year, name, countriesList);

          store.set('selectedCountries', countriesList);
          map.update();

        }}
        placeholder={'Select an event...'}
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
        {...this.props}
      />);
  }
}
