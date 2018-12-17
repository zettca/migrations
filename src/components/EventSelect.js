import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/lib/animated';

import { selection, years } from '../helpers';

export default class EventSelect extends React.PureComponent {
  render() {
    const { events } = this.props;

    const options = [];

    events.forEach((event, i) => {
      const { year, name } = event;
      options.push({ value: i, label: `${year} ${name}` });
    });

    return (
      <Select
        onChange={(selected, action) => {
          const { name, year, countries } = events[selected.value];
          const countriesList = countries.split(',')

          let i = 0;
          while (years[i] < year) i++;

          const actualYear = years[i - 1] || years[0]

          console.log('EVENT:', actualYear, name, countriesList);
          selection.setCountries(countriesList);
          selection.setYear(actualYear);
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
