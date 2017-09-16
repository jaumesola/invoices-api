
let mongoDbUrl    = "mongodb://localhost:3001/meteor";
let mongoOplogUrl = "mongodb://localhost:3001/local";

let driver = new MongoInternals.RemoteCollectionDriver(
    mongoDbUrl, { oplogUrl: mongoOplogUrl }
    );

Offers = new Mongo.Collection("offers", {_driver: driver});

// Global API configuration
var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
    });

Api.addCollection(Offers);