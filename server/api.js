console.log('STARTUP WITH ' + Meteor.settings.public.environment + ' SETTINGS');

Settings  = new Mongo.Collection("settings");
Statuses  = new Mongo.Collection("statuses");
Companies = new Mongo.Collection("companies");
Offers    = new Mongo.Collection("offers");
Advances  = new Mongo.Collection("advances");

// settings global var for internal use 

let settings = Settings.find().fetch()[0];
//console.log("settings:"); console.log(settings);

if (!settings['Local']['monthlyFactoringRate']) {
    console.log("MISSING SETTING Local monthlyFactoringRate");
}

// some utility functions

function statusMessage(statusCode) {
    let message = statusCode;
    let status = Statuses.findOne({code: statusCode});
    if (status && status.message) {
        message = status.message;
    }
    return message;
}

function daysDiff(firstDate, secondDate) {
    let oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    return Math.round((secondDate.getTime()-firstDate.getTime()) / oneDay);
}

function offerAmount(OfferDate, InvoiceMaturity, InvoiceAmount) {
    let days = daysDiff(OfferDate, InvoiceMaturity);       
    let dailyRate = settings['Local']['monthlyFactoringRate'] / 100 / 30;
    let OfferAmount = Math.round(InvoiceAmount * (1 - days * dailyRate));
    console.log("invoice amount " + InvoiceAmount + " days " + days + " daily rate " + dailyRate + " --> offer amount " + OfferAmount);
    return OfferAmount;
}


// Global API configuration

var Api = new Restivus({
    apiPath: '/',
    useDefaultAuth: true,
    prettyJson: true,
    version: 'v1'
    });


// SETTINGS

Api.addRoute('settings', {}, {
    get: {
        action: function () {
            return {
                status: 'success', 
                data: Settings.find({}, { fields: {Local:0} }).fetch()
                };
        }
    },
});

// OFFERS

Api.addRoute('offers/:id', {}, {
    get: { 
        action: function () {
            return {status: 'success', data: Offers.findOne(this.urlParams.id)};
      },
    }
});

Api.addRoute('offers', {}, {
    /*
    get: {
        action: function () {
            return {status: 'success', data: Offers.find().fetch()};
        }
    },
    */
    
    // sample test:  curl -X POST http://localhost:4000/v1/offers -d "InvoiceAmount=888" -d "InvoiceMaturity=2018-09-31"
    post: function () { // TODO add InvoiceMaturity & OfferDate
        // fields from remote client
        let InvoiceAmount = Number(this.bodyParams.InvoiceAmount);
        let InvoiceMaturity = new Date(this.bodyParams.InvoiceMaturity);
        InvoiceMaturity.setUTCHours(12,0,0,0); // TODO DRY (advances)
        console.log(InvoiceMaturity);
        
        // calculated fields
        
        // today at noon UTC
        let OfferDate = new Date(); // TODO DRY (advances)
        OfferDate.setUTCHours(12,0,0,0);
        
        let OfferAmount = offerAmount(OfferDate, InvoiceMaturity, InvoiceAmount);

        let Status = 'OFFER_OK'; // TODO if all filters passed, otherwise NOT_NOW
        
        // save offer & return it   
        let offerId = Offers.insert({InvoiceAmount, InvoiceMaturity, OfferAmount, OfferDate, Status});
        let offer = Offers.findOne({_id: offerId});
        return {status: 'success', data: offer};
      },
  });


// ADVANCES

Api.addRoute('advances/:id', {}, {
    get: {
        action: function () {
            // Retrieve PARTIAL advance data, the most relevant is the status, other data just for verification
            let fields = ['Status','CreditorId','DebtorId','InvoiceNumber','InvoiceAmount'];
            let field = null;
            let doc = Advances.findOne(this.urlParams.id);
            let apidoc = {};
            for (let i = 0; i < fields.length; i++) {
                field = fields[i]
                apidoc[field] = doc[field];
            }
            apidoc['StatusMessage'] = statusMessage(doc['Status']);
            return {status: 'success', data: apidoc};
      },
    }
});

Api.addRoute('advances', {}, {
    /*
    get: {
        action: function () {
            return {status: 'success', data: Advances.find().fetch()};
        }
    },
    */
    
    // sample test: curl -X POST http://localhost:4000/v1/advances -d "InvoiceAmount=777" -d "CreditorTaxId=AAABBBCCC"  -d "DebtorTaxId=AAABBBCCC" -d 'CollectionData={"aaa":"bbb","ccc":"ddd"}'
    post: function () { // TODO add InvoiceMaturity & OfferDate
        let doc = {};
        let params = this.bodyParams;
        let loop = function (fields, callback) {
            let field = null;
            for (let i = 0; i < fields.length; i++) {
                field = fields[i];
                if (params[field]) {
                    doc[field] = callback(params[field]);
                }
            }
        }       
        
        let stringFields = ['OfferId','Status','CreditorTaxId','CreditorName','DebtorTaxId','DebtorName',
            'InvoiceNumber','PaymentMethodId','PaymentMethodName'];
        loop(stringFields, function (value) {return value} );
        
        let objectFields = ['CollectionData','InvoiceData','CreditorData','DebtorData'];
        loop(objectFields, function (value) {return JSON.parse(value)} );
        
        doc['InvoiceAmount'] = Number(params.InvoiceAmount);
        
        let InvoiceMaturity = new Date(params.InvoiceMaturity);
        InvoiceMaturity.setUTCHours(12,0,0,0); // TODO DRY (offers)
        doc['InvoiceMaturity'] = InvoiceMaturity;
        
        // calculated fields
        
        // today at noon UTC // TODO DRY (offers)
        let AdvanceDate = new Date();
        AdvanceDate.setUTCHours(12,0,0,0);
        doc['AdvanceDate'] = AdvanceDate;
        
        doc['AdvanceAmount'] = offerAmount(AdvanceDate, InvoiceMaturity, doc['InvoiceAmount']);
        
        if ( doc['AdvanceAmount'] != params['AdvanceAmount'] ) {
            console.log("Amount changed! offer " + params['AdvanceAmount'] + " advance " + doc['AdvanceAmount'] );
        }
        
        doc['Status'] = 'REQUEST_RECEIVED';
        doc['StatusMessage'] = statusMessage(doc['Status']);
        
        let advanceId = Advances.insert(doc);
        let advance = Advances.findOne({_id: advanceId});
        return {status: 'success', data: advance};
    },
});
