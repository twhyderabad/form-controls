import FormContext from './FormContext';
import { httpInterceptor } from '../helpers/httpInterceptor';

export default class ScriptRunner {

  constructor(formRecords, patient) {
    this.formContext = new FormContext(formRecords, patient);
    this.interceptor = httpInterceptor;
  }

  execute(eventJs) {
    const formContext = this.formContext;
    const interceptor = this.interceptor;
    if (eventJs && interceptor) {
      const executiveJs = `(${eventJs})(formContext,interceptor)`;
      /* eslint-disable */
      eval(executiveJs);
    }
    return formContext.getRecords();
  }

}
