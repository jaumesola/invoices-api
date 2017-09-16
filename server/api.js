/*
 * Minimal example just to verify installation
 *
 * Sample URLs:
 * 
 * /api/articles -- return all
 * /api/articles/HnmLBZz8ab9LrPuJ7 -- return one (using id from list)
 * /api/articles/whatever-not-an-id -- return 404
 */

Articles = new Mongo.Collection('articles');

Articles.insert({sku: "AAA123", description: "Some Article"});
Articles.insert({sku: "BBB456", description: "Another Article"});

// Global API configuration
var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
    });

// Generates: GET, POST on /api/articles and GET, PUT, PATCH, DELETE on
// /api/articles/:id for the Articles collection
Api.addCollection(Articles);
