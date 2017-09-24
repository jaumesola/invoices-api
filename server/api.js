console.log('STARTUP WITH ' + Meteor.settings.public.environment + ' SETTINGS');

collectionOptions = {};

if (Meteor.settings.public.environment == 'development') {
    let driver = new MongoInternals.RemoteCollectionDriver(
            Meteor.settings.mongoDbUrl, { oplogUrl: Meteor.settings.mongoOplogUrl }
        );
    collectionOptions = {_driver: driver};
}

Statuses = new Mongo.Collection("statuses", collectionOptions);
Offers = new Mongo.Collection("offers", collectionOptions);


// Global API configuration
var Api = new Restivus({
    apiPath: 'v1/',
    useDefaultAuth: true,
    prettyJson: true
    });

Api.addCollection(Statuses);