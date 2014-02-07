/*
 * Copyright (c) 2011-2013, Yahoo! Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/* jshint node:true */
/* global describe, it, locale */

'use strict';

var chai,
    expect,
    assert,

    Handlebars,
    intl,
    IntlHelpers,

    defaultData = {
        data : {
            locale   : 'en-US',
            currency : 'USD'
        }
    };

if (typeof require === 'function') {
    chai = require('chai');
    Handlebars = require('handlebars');

    intl = require('intl');

    if (typeof Intl === 'undefined') {
        global.Intl = intl;
    }

    // load in message format
    require('intl-messageformat');
    require('intl-messageformat/locale-data/en');


    IntlHelpers = require('../lib/helpers.js');
    IntlHelpers.register(Handlebars);
}

expect = chai.expect;
assert = chai.assert;




describe('Helper `intlNumber`', function () {

    it('should be added to Handlebars', function () {
        expect(Handlebars.helpers).to.include.keys('intlNumber');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.intlNumber).to.be.a('function');
    });

    it('should throw if called with out a value', function () {
        assert.throw(Handlebars.compile('{{intlNumber}}'), TypeError, 'A number must be provided.');

    });

    describe('used to format numbers', function () {
        it('should return a string', function () {
            var tmpl = "{{intlNumber 4}}",
                out;

            out = Handlebars.compile(tmpl)(undefined);

            expect(out).to.equal("4");
        });

        it('should return a decimal as a string', function () {
            var tmpl = Handlebars.compile('{{#intl locales="en-US"}}{{intlNumber NUM}}{{/intl}}'),
                out = tmpl({
                    NUM: 4.004
                });

            expect(out).to.equal("4.004");
        });

        it('should return a formatted string with a thousand separator', function () {
            var tmp = Handlebars.compile('{{intlNumber NUM}}'),
                out = tmp({
                    NUM: 40000
                });

            expect(out).to.equal('40,000');
        });

        it('should return a formatted string with a thousand separator and decimal', function () {
            var tmp = Handlebars.compile('{{intlNumber NUM}}'),
                out = tmp({
                    NUM: 40000.004
                });

            expect(out).to.equal('40,000.004');
        });

        describe('in another locale', function () {
            it('should return a string', function () {
                var tmpl = '{{intlNumber 4 locales="de-DE"}}',
                    out;

                out = Handlebars.compile(tmpl)(undefined);

                expect(out).to.equal("4");
            });

            it('should return a decimal as a string', function () {
                var tmpl = Handlebars.compile('{{#intl locales="de-DE"}}{{intlNumber NUM}}{{/intl}}'),
                    out = tmpl({
                        NUM: 4.004
                    });

                expect(out).to.equal("4,004");
            });

            it('should return a formatted string with a thousand separator', function () {
                var tmp = Handlebars.compile('{{#intl locales="de-DE"}}{{intlNumber NUM}}{{/intl}}'),
                    out = tmp({
                        NUM: 40000
                    });

                expect(out).to.equal('40.000');
            });

            it('should return a formatted string with a thousand separator and decimal', function () {
                var tmp = Handlebars.compile('{{#intl locales="de-DE"}}{{intlNumber NUM}}{{/intl}}'),
                    out = tmp({
                        NUM: 40000.004
                    });

                expect(out).to.equal('40.000,004');
            });
        });

    });

    describe('used to format currency', function () {
        it('should return a string formatted to currency', function () {
            var tmp = Handlebars.compile('{{#intl locales="en-US"}}{{intlNumber 40000 style="currency" currency=CURRENCY}}{{/intl}}'),
                out = tmp({
                    CURRENCY: 'USD'
                });

            expect(out, 'USD').to.equal('$40,000.00');

            tmp = Handlebars.compile('{{#intl locales="en-US"}}{{intlNumber 40000 style="currency" currency=CURRENCY}}{{/intl}}');
            out = tmp({
                CURRENCY: 'EUR'
            });
            expect(out, 'EUR').to.equal('€40,000.00');

            tmp = Handlebars.compile('{{#intl locales="en-US"}}{{intlNumber 40000 style="currency" currency=CURRENCY}}{{/intl}}');
            out = tmp({
                CURRENCY: 'JPY'
            });
            expect(out, 'JPY').to.equal('¥40,000');
        });

        it('should return a string formatted to currency with code', function () {
            var tmp = Handlebars.compile('{{#intl locales="en-US"}}{{intlNumber 40000 style="currency" currency=CURRENCY currencyDisplay="code"}}{{/intl}}'),
                out = tmp({
                    CURRENCY: 'USD'
                });

            expect(out, 'USD').to.equal('USD40,000.00');

            tmp = Handlebars.compile('{{#intl locales="en-US"}}{{intlNumber 40000 style="currency" currency=CURRENCY currencyDisplay="code"}}{{/intl}}');
            out = tmp({
                CURRENCY: 'EUR'
            });
            expect(out, 'EUR').to.equal('EUR40,000.00');

            tmp = Handlebars.compile('{{#intl locales="en-US"}}{{intlNumber 40000 style="currency" currency=CURRENCY currencyDisplay="code"}}{{/intl}}');
            out = tmp({
                CURRENCY: 'JPY'
            });
            expect(out, 'JPY').to.equal('JPY40,000');
        });

        it('should function within an `each` block helper', function () {
            var tmp = Handlebars.compile('{{#intl locales="en-US"}}{{#each currencies}} {{intlNumber AMOUNT style="currency" currency=CURRENCY}}{{/each}}{{/intl}}'),
                out = tmp({
                    currencies: [
                        { AMOUNT: 3, CURRENCY: 'USD'},
                        { AMOUNT: 8, CURRENCY: 'EUR'},
                        { AMOUNT: 10, CURRENCY: 'JPY'}
                    ]
                });

            // note the output must contain the correct spaces to match the template
            expect(out).to.equal(' $3.00 €8.00 ¥10');
        });

        it('should return a currency even when using a different locale', function (){
            var tmp = Handlebars.compile('{{#intl locales="de-DE"}}{{intlNumber 40000 style="currency" currency=CURRENCY}}{{/intl}}'),
                out = tmp({
                    CURRENCY: 'USD'
                });

            expect(out, 'USD->de-DE').to.equal('40.000,00 $');

            tmp = Handlebars.compile('{{#intl locales="de-DE"}}{{intlNumber 40000 style="currency" currency=CURRENCY}}{{/intl}}');
            out = tmp({
                CURRENCY: 'EUR'
            });
            expect(out, 'EUR->de-DE').to.equal('40.000,00 €');

            tmp = Handlebars.compile('{{#intl locales="de-DE"}}{{intlNumber 40000 style="currency" currency=CURRENCY}}{{/intl}}');
            out = tmp({
                CURRENCY: 'JPY'
            });
            expect(out, 'JPY->de-DE').to.equal('40.000 ¥');
        });
    });

    describe('used to format percentages', function () {
        it('should return a string formatted to a percent', function () {
            var tmp = Handlebars.compile('{{#intl locales="en-US"}}{{intlNumber 400 style="percent"}}{{/intl}}');

            expect(tmp(undefined)).to.equal('40,000%');
        });

        it('should return a perctage when using a different locale', function () {
            var tmp = Handlebars.compile('{{#intl locales="de-DE"}}{{intlNumber 400 style="percent"}}{{/intl}}');

            expect(tmp(undefined)).to.equal('40.000 %');
        });

    });
});
describe('Helper `intlDate`', function () {

    it('should be added to Handlebars', function () {
        expect(Handlebars.helpers).to.include.keys('intlDate');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.intlDate).to.be.a('function');
    });

    it('should throw if called with out a value', function () {
        assert.throw(Handlebars.compile('{{intlDate}}'), TypeError, 'A date must be provided.');
    });

    // Use a fixed known date
    var dateStr = 'Thu Jan 23 2014 18:00:44 GMT-0500 (EST)',
        timeStamp = 1390518044403;

    it('should return a formatted string', function () {
        var tmp = Handlebars.compile('{{#intl locales="en-US"}}{{intlDate "' + dateStr + '"}}{{/intl}}');

        expect(tmp(undefined)).to.equal('1/23/2014');

        // note timestamp is passed as a number
        tmp = Handlebars.compile('{{#intl locales="en-US"}}{{intlDate ' + timeStamp + '}}{{/intl}}');

        expect(tmp(undefined)).to.equal('1/23/2014');
    });

    /** SINGLE VALUES ARE MUTED FOR NOW :: https://github.com/andyearnshaw/Intl.js/issues/56
    it('should return a formatted string of option requested', function () {
        // year
        var tmp = Handlebars.compile('{{intlDate DATE year="numeric"}}'),
            out = tmp({ DATE: dateStr });

        expect(out).to.equal('2014');
    });
    */

    it('should return a formatted string of just the time', function () {
        var tmp = Handlebars.compile('{{#intl locales="en-US"}}{{intlDate ' + timeStamp + ' hour="numeric" minute="numeric"}}{{/intl}}');

        expect(tmp(undefined)).to.equal('6:00 PM');
    });

});

describe('Helper `intlMessage`', function () {

    it('should be added to Handlebars', function () {
        expect(Handlebars.helpers).to.include.keys('intlMessage');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.intlMessage).to.be.a('function');
    });

    it('should throw if called with out a value', function () {
        assert.throw(Handlebars.compile('{{intlMessage}}'), ReferenceError, 'A message or intlName must be provided.');
    });

    it('should return a formatted string', function () {
        var tmp = Handlebars.compile('{{#intl locales="en-US"}}{{intlMessage MSG firstName=firstName lastName=lastName}}{{/intl}}'),
            out = tmp({
                MSG: 'Hi, my name is {firstName} {lastName}.',
                firstName: 'Anthony',
                lastName: 'Pipkin'
            });

        expect(out).to.equal('Hi, my name is Anthony Pipkin.');
    });

    it('should return a formatted string with formatted numbers and dates', function () {
        var tmp = Handlebars.compile('{{#intl locales="en-US"}}{{intlMessage POP_MSG city=city population=population census_date=census_date timeZone=timeZone}}{{/intl}}'),
            out = tmp({
                POP_MSG: '{city} has a population of {population, number, integer} as of {census_date, date, medium}.',
                city: 'Atlanta',
                population: 5475213,
                census_date: (new Date('1/1/2010')).getTime(),
                timeZone: 'UTC'
            });

        expect(out).to.equal('Atlanta has a population of 5,475,213 as of Jan 1, 2010.');
    });

    it('should return a formatted string with formatted numbers and dates in a different locale', function () {
        var tmp = Handlebars.compile('{{#intl locales="de-DE"}}{{intlMessage POP_MSG city=city population=population census_date=census_date timeZone=timeZone}}{{/intl}}'),
            out = tmp({
                POP_MSG: '{city} has a population of {population, number, integer} as of {census_date, date, medium}.',
                city: 'Atlanta',
                population: 5475213,
                census_date: (new Date('1/1/2010')),
                timeZone: 'UTC'
            });

        expect(out).to.equal('Atlanta has a population of 5.475.213 as of 1. Jan. 2010.');
    });

    it('should return a formatted string with an `each` block', function () {
        var tmp = Handlebars.compile('{{#intl locales="en-US"}}{{#each harvest}} {{intlMessage ../HARVEST_MSG person=person count=count }}{{/each}}{{/intl}}'),
            out = tmp({
                HARVEST_MSG: '{person} harvested {count, plural, one {# apple} other {# apples}}.',
                harvest: [
                    { person: 'Allison', count: 10 },
                    { person: 'Jeremy', count: 60 }
                ]
            });

        expect(out).to.equal(' Allison harvested 10 apples. Jeremy harvested 60 apples.');
    });

    it('should supply its own currency value for messages', function () {
        var tmp = Handlebars.compile('{{#intl locales="en-US"}}{{intlMessage MSG amount=amount currency="EUR"}}{{/intl}}'),
            out = tmp({
                MSG: 'I have {amount, number, currency}.',
                amount: 23.45
            });

        expect(out).to.equal('I have €23.45.');
    });

    it('should return an error if no intlName is provided', function () {
        assert.throw(function () {
            var tmp = Handlebars.compile('{{intlMessage amount=amount}}'),
                out = tmp({
                    MSG: 'I have {amount, number, currency}.',
                    amount: 23.45
                });
        }, ReferenceError, 'A message or intlName must be provided.');
    });

    describe('with a intlName', function () {

        it('should return a message', function () {
            var tmp = Handlebars.compile('{{#intl locales="en-US" messages=MSGS}}{{intlMessage intlName="MSG" amount=amount currency="USD"}}{{/intl}}'),
                out = tmp({
                    amount: 23.45,
                    MSGS  : { MSG: 'I have {amount, number, currency}.'}
                });

            expect(out).to.equal('I have $23.45.');
        });

        it('should return an error if the intlName is not found', function () {
            assert.throw(function () {
                var tmp = Handlebars.compile('{{intlMessage intlName="BAD_TOKEN" amount=amount}}'),
                    out = tmp({
                        amount: 23.45
                    });
            }, ReferenceError, 'Could not find Intl message: BAD_TOKEN');

        });

    });

});

describe('Helper `intl`', function () {

    it('should be added to Handlebars', function () {
        expect(Handlebars.helpers).to.include.keys('intl');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.intl).to.be.a('function');
    });

    describe('as a block helper', function () {
        it('should maintain a locale', function () {
            var str = '{{intlNumber NUM}} {{#intl locales="de-DE"}}{{intlNumber ../NUM}}{{/intl}} {{intlNumber NUM}}',
                tmp = Handlebars.compile(str),
                out = tmp({
                    NUM: 40000.004
                });

            expect(out).to.equal('40,000.004 40.000,004 40,000.004');
        });

        it('should maintain context regardless of depth', function () {
            var str = '{{#intl locales="de-DE"}}' +
                       '{{#intl locales="en-US"}}{{intlNumber NUM}} {{/intl}}' +
                       '{{intlNumber NUM}}' +
                      '{{/intl}} ' +
                      '{{intlNumber NUM}}',
                tmp = Handlebars.compile(str),
                out = tmp({
                    NUM: 40000.004
                });

            expect(out).to.equal('40,000.004 40.000,004 40,000.004');
        });
    });

    it('should allow custom formats', function () {
        var tmp = Handlebars.compile('{{#intl locales="en-US" formats=formats}}{{intlMessage MSG animal=animal}}{{/intl}}'),
            out = tmp({
                MSG: '{animal, upperFirst} backwards is {animal, reverse}.',
                animal: 'aardvark',
                formats : {
                    upperFirst: function (val) {
                        return val.charAt(0).toUpperCase() + val.substr(1);
                    },
                    reverse: function (val) {
                        return val.split('').reverse().join('');
                    }
                }
            });

        expect(out).to.equal('Aardvark backwards is kravdraa.');
    });
});


