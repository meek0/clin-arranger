import { expect } from "chai";
import { translateParentalOrigin } from '../app/reports/patientTranscription.js';

describe('translateParentalOrigin', () => {
  it('Should be robust', () => {
    expect(translateParentalOrigin(null)).to.equals('Inconnu');
    expect(translateParentalOrigin('foo')).to.equals('Inconnu');
  });
  it('Should return a translated parental origin', () => {
    expect(translateParentalOrigin('possible_denovo')).to.equals('Possiblement de novo');
  });
});