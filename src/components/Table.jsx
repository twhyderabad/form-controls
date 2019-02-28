import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import classNames from 'classnames';
import ComponentStore from 'src/helpers/componentStore';
import { getGroupedControls, displayRowControls } from '../helpers/controlsParser';
import { FormattedMessage } from 'react-intl';

export class Table extends Component {

  constructor(props) {
    super(props);
    this.state = { errors: [] };
    this.onChange = this.onChange.bind(this);
    this.displayColumnHeaders = this.displayColumnHeaders.bind(this);
  }

  onChange(formFieldPath, value, errors, onActionDone) {
    this.props.onValueChanged(formFieldPath, value, errors, onActionDone);
  }

  displayLabel(label) {
    return (<div className={classNames('control-wrapper-content')}>
          <strong><FormattedMessage
            defaultMessage={label.value}
            id={label.translationKey || 'defaultId'}
          /></strong>
           </div>);
  }

  displayColumnHeaders(columnHeaders) {
    return columnHeaders.map(columnHeader => this.displayLabel(columnHeader));
  }

  render() {
    const {
      enabled,
      formName,
      formVersion,
      metadata: { label },
      onEventTrigger,
      patientUuid,
      validate,
      validateForm,
      showNotification,
    } = this.props;
    const childProps = {
      enabled,
      formName,
      formVersion,
      validate,
      validateForm,
      onValueChanged: this.onChange,
      onEventTrigger,
      patientUuid,
      showNotification,
    };
    const groupedRowControls = getGroupedControls(this.props.metadata.controls, 'row');
    return (
      <div>
        <strong className="table-header">
            <FormattedMessage
              defaultMessage={label.value}
              id={label.translationKey || 'defaultId'}
            />
        </strong>
        <div className="table-controls">
          <div className="header">
              {this.displayColumnHeaders(this.props.metadata.columnHeaders)}
          </div>
          <div>
            {displayRowControls(groupedRowControls, this.props.children.toArray(),
              childProps, true)}
          </div>
        </div>
      </div>
    );
  }
}

Table.propTypes = {
  children: PropTypes.any,
  enabled: PropTypes.bool,
  formName: PropTypes.string.isRequired,
  formVersion: PropTypes.string.isRequired,
  metadata: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.shape({
      type: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }).isRequired,
    properties: PropTypes.object,
    type: PropTypes.string.isRequired,
    controls: PropTypes.array,
    columnHeaders: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      translationKey: PropTypes.string,
      type: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })).isRequired,
  }),
  onEventTrigger: PropTypes.func,
  onValueChanged: PropTypes.func.isRequired,
  patientUuid: PropTypes.string,
  showNotification: PropTypes.func.isRequired,
  validate: PropTypes.bool.isRequired,
  validateForm: PropTypes.bool.isRequired,
};

Table.defaultProps = {
  children: List.of([]),
  enabled: true,
};


ComponentStore.registerComponent('table', Table);