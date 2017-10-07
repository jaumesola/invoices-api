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