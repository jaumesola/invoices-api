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

///v1/advances
Api.addCollection(Advances, {
    excludedEndpoints: ['put','patch','delete'], // getAll, get, post TODO disable getAll
    });


Api.addRoute('offers/:id', {}, {
    get: { 
        action: function () {
            return {status: 'success', data: Offers.findOne(this.urlParams.id)};
      },
    }
});

Api.addRoute('offers', {}, {
    get: {
        action: function () {
            return {status: 'success', data: Offers.find().fetch()};
        }
    },
    
    post: function () {
        let OfferAmount = Math.round(this.bodyParams.InvoiceAmount * 0.9);
        let offerId = Offers.insert({InvoiceAmount: this.bodyParams.InvoiceAmount, OfferAmount});
        let offer = Offers.find({_id: offerId}).fetch();
        return {status: 'success', data: offer};
      },
  });


