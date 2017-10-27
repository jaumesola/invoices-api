console.log('STARTUP WITH ' + Meteor.settings.public.environment + ' SETTINGS');

Settings  = new Mongo.Collection("settings");
Statuses  = new Mongo.Collection("statuses");
Companies = new Mongo.Collection("companies");
Offers    = new Mongo.Collection("offers");
Advances  = new Mongo.Collection("advances");

// Global API configuration
var Api = new Restivus({
    apiPath: '/',
    useDefaultAuth: true,
    prettyJson: true,
    version: 'v1'
    });

///v1/settings
Api.addCollection(Settings, {
    excludedEndpoints: ['get','post','put','patch','delete'], // generate only getAll endpoint
    });

// /v1/statuses
Api.addCollection(Statuses, {
    excludedEndpoints: ['get','post','put','patch','delete'], // generate only getAll endpoint
    });

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
    
    // sample test:  curl -X POST http://localhost:4000/v1/offers -d "InvoiceAmount=777"
    post: function () { // TODO add InvoiceMaturity & OfferDate
        let InvoiceAmount = Number(this.bodyParams.InvoiceAmount);
        let OfferAmount = Math.round(this.bodyParams.InvoiceAmount * 0.9); // TODO % config * days until maturity
        let Status = 'OFFER_OK'; // TODO if all filters passed, otherwise NOT_NOW
        let offerId = Offers.insert({InvoiceAmount, OfferAmount, Status});
        let offer = Offers.findOne({_id: offerId});
        return {status: 'success', data: offer};
      },
  });

// Retrieve PARTIAL advance data, the most relevant is the status, other data just for verification
Api.addRoute('advances/:id', {}, {
    get: {
        action: function () {
            let fields = ['Status','CreditorId','DebtorId','InvoiceAmount'];
            let field = null;
            let doc = Advances.findOne(this.urlParams.id);
            let apidoc = {};
            for (let i = 0; i < fields.length; i++) {
                field = fields[i]
                apidoc[field] = doc[field];
            }
            return {status: 'success', data: apidoc};
      },
    }
});

// /v1/advances
Api.addRoute('advances', {}, {
    /*
    get: {
        action: function () {
            return {status: 'success', data: Advances.find().fetch()};
        }
    },
    */
    
    // sample test:  curl -X POST http://localhost:4000/v1/advances -d "InvoiceAmount=777" -d "CreditorTaxId=AAABBBCCC"  -d "DebtorTaxId=AAABBBCCC"
    post: function () { // TODO add InvoiceMaturity & OfferDate
        let doc = {};
        
        let stringFields = ['OfferId','Status','CreditorTaxId','CreditorName','DebtorTaxId','DebtorName'];
        let field = null;
        for (let i = 0; i < stringFields.length; i++) {
            field = stringFields[i];
            doc[field] = this.bodyParams[field];
        }
        
        doc['Status'] = 'CLEAR_RISK';
        doc['AdvanceAmount'] = Number(this.bodyParams.AdvanceAmount);
        doc['InvoiceAmount'] = Number(this.bodyParams.InvoiceAmount);
        doc['AdvanceDate'] = Date(this.bodyParams.AdvanceDate);
        doc['InvoiceMaturity'] = Date(this.bodyParams.InvoiceMaturity);
        console.log(this.bodyParams.CreditorData);
        doc['CreditorData'] = JSON.parse(this.bodyParams.CreditorData);
        doc['DebtorData'] = JSON.parse(this.bodyParams.DebtorData);
        doc['InvoiceData'] = JSON.parse(this.bodyParams.InvoiceData);

        let advanceId = Advances.insert(doc);
        let advance = Advances.findOne({_id: advanceId});
        return {status: 'success', data: advance};
    },
});
