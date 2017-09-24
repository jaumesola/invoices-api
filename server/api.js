console.log('STARTUP WITH ' + Meteor.settings.public.environment + ' SETTINGS');

function collectionOptions() {
    if (Meteor.settings.public.environment == 'development') {
        let driver = new MongoInternals.RemoteCollectionDriver(
                Meteor.settings.mongoDbUrl, { oplogUrl: Meteor.settings.mongoOplogUrl }
            );
        return {_driver: driver};
    } else {
        return {};
    }
}
collectionOptions = collectionOptions();

function newCollection(name) {
    return new Mongo.Collection(name, collectionOptions);
}

Statuses = newCollection("statuses");
Companies = newCollection("companies");
Offers = newCollection("offers");
Advances = newCollection("advances");

// Global API configuration
var Api = new Restivus({
    apiPath: '/',
    useDefaultAuth: true,
    prettyJson: true,
    version: 'v1'
    });

Api.addCollection(Statuses, {
    excludedEndpoints: ['get','post','put','patch','delete'], // generate only getAll endpoint
    });
