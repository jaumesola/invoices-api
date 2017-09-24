console.log('STARTUP WITH ' + Meteor.settings.public.environment + ' SETTINGS');

if (Meteor.settings.public.environment == 'staging') {
    Offers = new Mongo.Collection("offers");
} else {
    let driver = new MongoInternals.RemoteCollectionDriver(
            Meteor.settings.mongoDbUrl, { oplogUrl: Meteor.settings.mongoOplogUrl }
        );
    Offers = new Mongo.Collection("offers", {_driver: driver});
}

// Global API configuration
var Api = new Restivus({
    apiPath: 'v1/',
    useDefaultAuth: true,
    prettyJson: true
    });

Api.addCollection(Offers);