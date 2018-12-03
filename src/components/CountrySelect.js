import React from 'react';
import Select from 'react-select';


export default class CountrySelect extends React.PureComponent {
  render() {
    const { countries } = this.props;
    const options = countries.map((c) => {
      return { value: c.code3, label: c.name, group: c.region };
    });

    return (
      <Select isMulti
        placeholder={'Select countries...'}
        options={options}
        {...this.props}
      />);
  }
}
