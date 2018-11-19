module.exports = function(app) {

    var users = require('../controllers/user.controller.js');
    var cors = require('cors');
    var bodyParser = require('body-parser');
    app.use(cors());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    // Create a new Note
    app.post('/users', users.create);

    // // Retrieve all Notes
    // app.get('/users', users.findAll);

    // // Retrieve a single Note with noteId
    // app.get('/search/:listingID', users.search);

    app.get('/search/:siteName/:listingID',users.search);
    app.get('/search/:listingID',users.search);
    app.get('/businessSearch/:businessName/:businessPhone/:businessAddess/:city/:state/:zipcode/:siteName',users.searchBusiness);
    app.get('/yelpapi/:listingID',users.yelpapi);
    app.get('/foursquareapi/:listingID',users.foursquareapi);
    app.get('/facebook/:listingID',users.facebookApi)
    // app.get('/searchbyid/:listingID',users.searchById);

    // // Update a Note with noteId
    // app.put('/users/:noteId', users.update);

    // // Delete a Note with noteId
    // app.delete('/users/:noteId', users.delete);
}

/*
https://localhost:8082/businessSearch/Jet's+Pizza/(312)+465-2280/207+W+Superior+St/Chicago/IL/60654/ablocal
https://localhost:8082/businessSearch/Wizard's+Sports+Cafe/972-235-0371/747+South+Central+Expressway/Richardson/TX/75080/2findlocal
https://localhost:8082/businessSearch/Moki+Entertainment/(213)+627-1393/110+E+9th+Ay+St/Los+Angeles/CA/90079/pointcom
https://localhost:8082/businessSearch/Pressed+Juicery/415-278-0977/75+First+Street/San+Francisco/CA/94105/golocal247

*/
