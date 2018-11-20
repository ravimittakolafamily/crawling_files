var User = require('../models/user.model.js');
var shortid = require('shortid');
var phantom = require('phantom');
var yelp = require('yelp-fusion');
var axios = require('axios');
const request = require('request');
const getCoords = require('city-to-coords');
var useragent = require('useragent');
var lat, lng;
const cheerio = require('cheerio');
var phantomJsCloud = require("phantomjscloud");
var browser = new phantomJsCloud.BrowserApi('ak-ky7x0-my3qx-ztz7x-9907d-8rme6');
var DomParser = require('dom-parser');
var parser = new DomParser();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let brownbook_pass = 'c3b806c26282054e5e6e604ea9f6ff564f559689';
exports.create = function (req, res) {
    var user = new User({
        user_fname: req.body.user_fname || "Untitled",
        user_lname: req.body.user_lname || "Untitled",
        user_mail: req.body.user_mail || "Untitled",
        loc_num: req.body.loc_num || "Untitled",
        user_phone: req.body.user_phone || "Untitled",
        business_name: req.body.business_name || "Untitled",
        business_phone: req.body.business_phone || "Untitled",
        business_address: req.body.business_address || "Untitled",
        city: req.body.city || "Untitled",
        state: req.body.state || "Untitled",
        zipcode: req.body.zipcode || "Untitled",
    });
    user.save(function (err, data) {
        if (err) {
            console.log(err);
            res.status(500).send({ message: "Some error occurred while creating the Note." });
        } else {
            res.send(data);
        }
    });
};


exports.search = function (req, res) {
    var businessName, city, state, result = [];
    User.findById(req.params.listingID, function (err, data) {
        if (err) {
            res.status(500).send({ message: "Could not retrieve note with id " + req.params.listingID });
        } else {
            businessName = data.business_name;
            city = data.city;
            state = data.state;
            let sitename = req.params.siteName;
            console.log(sitename);
            res.setHeader('Content-Type', 'application/json');
            if (sitename == "ablocal") {
                ablocal(businessName, city, state, res);
            } else if (sitename == "citysquares") {
                citySquares(businessName, city, state, res);
            } else if (sitename == "merchantCircle") {
                merchantCircle(businessName, city, state, res);
            } else if (sitename == "kudzu") {
                kudzu(businessName, city, state, res);
            } else {
                res.send(data);
            }

        }
    });
};

exports.searchBusiness = function (req, res) {
    let businessName, businessPhone, businessAddess, city, state, zipcode, siteName;
    businessName = req.params.businessName;
    businessPhone = req.params.businessPhone;
    businessAddess = req.params.businessAddess;
    city = req.params.city;
    state = req.params.state;
    zipcode = req.params.zipcode;
    siteName = req.params.siteName;
    res.setHeader('Content-Type', 'application/json');
    if (siteName == "facebook") {
        facebook(businessName, city, state, res)
    } else if (siteName == "brownbook") {
        brownbook(businessName, businessPhone, city, state, zipcode, res);
    } else if (siteName == "hotfrog") {
        hotfrog(businessName, businessPhone, res);
    } else if (siteName == "heremaps") {
        heremaps(businessName, city, state, zipcode, res);
    } else if (siteName == "bing") {
        bing(businessName, city, state, res);
    } else if (siteName == "future_tap") {
        future_tap(businessName, city, state, res);
    } else if (siteName == "judysbook") {
        judysbook(businessName, city, state, zipcode, res);
    } else if (siteName == "zomato") {
        zomato(businessName, city, state, res);
    } else if (siteName == "ablocal") {
        ablocal(businessName, city, state, zipcode, res);
    } else if (siteName == "citysquares") {
        citySquares(businessName, city, state, zipcode, res);
    } else if (siteName == "merchantCircle") {
        merchantCircle(businessName, city, state, zipcode, res);
    } else if (siteName == "kudzu") {
        kudzu(businessName, city, state, zipcode, res);
    } else if (siteName == "foursquare") {
        fetchfoursquare(businessName, city, state, zipcode, res);
    } else if (siteName == "yelp") {
        fetchyelp(businessName, city, state, res);
    } else if (siteName == "coc") {
        coc(businessName, city, state, zipcode, res);
    } else if (siteName == "manta") {
        manta(businessName, city, state, zipcode, res);
    } else if (siteName == "yellowbot") {
        yellowbot(businessName, city, state, zipcode, res);
    } else if (siteName == "superpages") {
        superpages(businessName, city, state, zipcode, res);
    } else if (siteName == "localstack") {
        localstack(businessName, city, state, zipcode, res);
    } else if (siteName == "localdatabase") {
        localdatabase(businessName, city, state, zipcode, res);
    } else if (siteName == "google") {
        google(businessName, city, state, zipcode, res);
    } else if (siteName == "yp") {
        yp(businessAddess, businessName, city, state, zipcode, res, req, 1);
    } else if (siteName == "findopen") {
        findopen(businessName, city, state, zipcode, res);
    } else if (siteName == "golocal247") {
        golocal247(businessName, city, state, zipcode, res);
    } else if (siteName == "pointcom") {
        pointcom(businessName, city, state, zipcode, res);
    } else if (siteName == "twofindlocal") {
        twofindlocal(businessName, city, state, zipcode, res);
    } else if (siteName == "bizwiki") {
        bizwiki(businessName, city, state, zipcode, res);
    }
    else {
        res.send("Site name not found");
    }
};

function bizwiki(businessName, city, state, zipcode, res) {
    try {
        browser.requestSingle({ url: "https://www.bizwiki.com/search?what=" + businessName + "&where=" + state, renderType: "html" }, (err, userResponse) => {
            if (err != null) {
                throw err;
            }
            var aj = userResponse.content.data;
            var doc = parser.parseFromString(aj, "text/html");
            const dom = new JSDOM(`${doc.rawHTML}`);
            var obj = {};
            obj.siteName = "bizwiki";
            //console.log(dom.window.document.querySelectorAll(".bizbrief")[0].querySelector('.titlethree').textContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " "))
            for (let i = 0; i < dom.window.document.querySelectorAll(".bizbrief").length; i++) {
                var address = dom.window.document.querySelectorAll(".bizbrief")[i].querySelector('.titlethree').textContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ");
                if (address.includes(businessName.split('+').join(' '))) {
                    obj.name = address
                    obj.address = dom.window.document.querySelectorAll(".bizbrief")[i].querySelector('.bizdetails').textContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ")
                    obj.url = "https://www.bizwiki.com/" + dom.window.document.querySelectorAll(".bizbrief")[i].querySelector('.titlethree').querySelector('a').href;
                    //obj.phone = dom.window.document.querySelectorAll(".bizbrief")[i].querySelectorAll('.business-location')[1].textContent;
                    obj.match = true;
                    console.log(obj);
                    res.send(obj);
                    return obj;
                } else {
                    obj.match = false;
                }
            }
            return obj;
        })
            .catch(e => {
                console.log(e)
                let bizwiki = {};
                bizwiki.siteName = 'bizwiki';
                res.send(bizwiki);
            });
    } catch (err) {
        let bizwiki = {};
        bizwiki.siteName = 'bizwiki';
        res.send(bizwiki);

    }
}


function twofindlocal(businessName, city, state, zipcode, res) {
    try {
        browser.requestSingle({ url: "https://www.2findlocal.com/search/?k=" + businessName + "&w=" + zipcode, renderType: "html" }, (err, userResponse) => {
            if (err != null) {
                throw err;
            }
            var aj = userResponse.content.data;
            var doc = parser.parseFromString(aj, "text/html");
            const dom = new JSDOM(`${doc.rawHTML}`);
            for (let i = 0; i < dom.window.document.querySelectorAll(".search-item").length; i++) {
                if (dom.window.document.getElementById(`itemCounter${i}`) && dom.window.document.getElementById(`itemCounter${i}`).nextElementSibling) {
                    var address = dom.window.document.getElementById(`itemCounter${i}`).nextElementSibling.textContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ");
                    if (address.includes(zipcode)) {
                        var obj = {};
                        obj.siteName = "2findlocal";
                        obj.name = dom.window.document.getElementById(`itemFirmUrl${i}`).textContent;
                        obj.address = address;
                        obj.url = dom.window.document.getElementById(`itemFirmUrl${i}`).href;
                        obj.phone = dom.window.document.getElementById(`itemCounter${i}`).nextElementSibling.nextElementSibling.textContent;
                        console.log(obj)
                        return obj;
                    }
                }
            }
        }).then(content => {
            if (content != null) {
                res.send(content);
            } else {
                let content = {};
                content.siteName = '2findlocal';
                res.send(content);
            }
        });
    } catch (err) {
        let findlocal = {};
        findlocal.siteName = '2findlocal';
        res.send(findlocal);
    }
}

function pointcom(businessName, city, state, zipcode, res) {
    try {
        browser.requestSingle({ url: "http://www.pointcom.com/search/?search=" + businessName + "&loc=" + zipcode, renderType: "html" }, (err, userResponse) => {
            if (err != null) {
                throw err;
            }
            var aj = userResponse.content.data;
            var doc = parser.parseFromString(aj, "text/html");
            const dom = new JSDOM(`${doc.rawHTML}`);
            console.log(dom.window.document.querySelectorAll(".featured_business_list li")[0].querySelector('.business_info h3 a').textContent);
            for (let i = 0; i < dom.window.document.querySelectorAll(".featured_business_list li").length; i++) {
                var address = dom.window.document.querySelectorAll(".featured_business_list li")[i].querySelector('.business_info span div.address_2').textContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ");
                if (address.includes(zipcode)) {
                    var obj = {};
                    obj.siteName = "pointcom";
                    obj.name = dom.window.document.querySelectorAll(".featured_business_list li")[i].querySelector('.business_info h3 a').textContent;
                    obj.address = dom.window.document.querySelectorAll(".featured_business_list li")[i].querySelector('.business_info span div.address_1').textContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ") + dom.window.document.querySelectorAll(".featured_business_list li")[i].querySelector('.business_info span div.address_2').textContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ")
                    obj.url = dom.window.document.querySelectorAll(".featured_business_list li")[i].querySelector('.business_info h3 a').href;
                    obj.phone = dom.window.document.querySelectorAll(".featured_business_list li")[i].querySelector('.business_info span div.phone').textContent;
                    obj.match = true;
                    console.log(obj)
                    return obj;
                }
            }
        }).then(content => {
            if (content != null) {
                res.send(content);
            } else {
                let content = {};
                content.siteName = '2findlocal';
                res.send(content);
            }
        });
    } catch (err) {
        let findlocal = {};
        findlocal.siteName = '2findlocal';
        res.send(findlocal);
    }
}


function golocal247(businessName, city, state, zipcode, res) {
    try {
        browser.requestSingle({ url: "https://www.golocal247.com/search/" + zipcode + "/" + businessName, renderType: "html" }, (err, userResponse) => {
            if (err != null) {
                throw err;
            }
            var aj = userResponse.content.data;
            var doc = parser.parseFromString(aj, "text/html");
            const dom = new JSDOM(`${doc.rawHTML}`);
            for (let i = 0; i < dom.window.document.querySelectorAll(".resultsContainer .businessResult").length; i++) {
                var address = dom.window.document.querySelectorAll(".resultsContainer .businessResult")[i].querySelector('.zipcode').textContent;
                if (address.includes(zipcode)) {
                    var obj = {};
                    obj.siteName = "golocal247";
                    obj.name = dom.window.document.querySelectorAll(".resultsContainer .businessResult")[i].querySelector('.businessData h3 a').textContent;
                    obj.address = dom.window.document.querySelectorAll(".resultsContainer .businessResult")[i].querySelector('.address').textContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ") + dom.window.document.querySelectorAll(".resultsContainer .businessResult")[i].querySelector('.city').textContent + dom.window.document.querySelectorAll(".resultsContainer .businessResult")[i].querySelector('.state').textContent
                    obj.url = "https://www.golocal247.com" + dom.window.document.querySelectorAll(".resultsContainer .businessResult")[i].querySelector('.businessData h3 a').href;
                    obj.phone = dom.window.document.querySelectorAll(".resultsContainer .businessResult")[i].querySelector('.phoneHidden').textContent;
                    obj.match = true;
                    console.log(obj)
                    return obj;
                }
            }
        }).then(content => {
            res.send(content);
        })
            .catch(e => {
                console.log(e)
                let golocal247 = {};
                golocal247.siteName = 'golocal247';
                res.send(golocal247);
            });
    } catch (err) {
        let golocal247 = {};
        golocal247.siteName = 'golocal247';
        res.send(golocal247);

    }
}



function findopen(businessName, city, state, zipcode, res) {
    try {
        browser.requestSingle({ url: "https://find-open.com/search?what=" + businessName + "&where=" + zipcode + "&r=10&latlon=", renderType: "html" }, (err, userResponse) => {
            if (err != null) {
                throw err;
            }
            var aj = userResponse.content.data;
            var doc = parser.parseFromString(aj, "text/html");
            const dom = new JSDOM(`${doc.rawHTML}`);
            for (let i = 0; i < dom.window.document.querySelectorAll(".view.view-search .view-content .views-row").length; i++) {
                var address = dom.window.document.querySelectorAll(".view.view-search .view-content .views-row")[i].querySelector('.postal-code').textContent;
                if (address.includes(zipcode)) {
                    var obj = {};
                    obj.siteName = "findopen";
                    obj.name = dom.window.document.querySelectorAll(".view.view-search .view-content .views-row")[i].querySelector('.views-field-title h2 a').textContent;
                    obj.address = dom.window.document.querySelectorAll(".view.view-search .view-content .views-row")[i].querySelector('.thoroughfare').textContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ") + dom.window.document.querySelectorAll(".view.view-search .view-content .views-row")[i].querySelector('.locality').textContent + dom.window.document.querySelectorAll(".view.view-search .view-content .views-row")[i].querySelector('.state').textContent
                    obj.url = "https://find-open.com" + dom.window.document.querySelectorAll(".view.view-search .view-content .views-row")[i].querySelector('.views-field-title h2 a').href;
                    obj.phone = dom.window.document.querySelectorAll(".view.view-search .view-content .views-row")[i].querySelector('.views-field-field-company-phone .hidden-xs').textContent;
                    obj.match = true;
                    console.log(obj)
                    return obj;
                }
            }
        }).then(content => {
            res.send(content);
        })
            .catch(e => {
                console.log(e)
                let findopen = {};
                findopen.siteName = 'findopen';
                res.send(findopen);

            });
    } catch (err) {
        let findopen = {};
        findopen.siteName = 'findopen';
        res.send(findopen);

    }
}

function yellowbot(businessName, city, state, zipcode, res) {
    browser.requestSingle({ url: "http://www.yellowbot.com/search?lat=&long=&q=" + businessName + "&place=" + city + "%2C+" + state, renderType: "html" }, (err, userResponse) => {
        if (err != null) {
            throw err;
        }
        var aj = userResponse.content.data;
        var doc = parser.parseFromString(aj, "text/html");
        const dom = new JSDOM(`${doc.rawHTML}`);
        var obj = {};
        for (let i = 0; i < dom.window.document.querySelectorAll(".resultWrapper").length; i++) {
            var address = dom.window.document.querySelectorAll(".resultWrapper")[i].querySelector('.zip').textContent;
            if (address.includes(zipcode)) {
                obj.siteName = "findopen";
                obj.name = dom.window.document.querySelectorAll(".resultWrapper")[i].querySelector('h3 a').textContent;
                obj.address = dom.window.document.querySelectorAll(".resultWrapper")[i].querySelector('.address').textContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ");
                obj.url = "http://www.yellowbot.com" + dom.window.document.querySelectorAll(".resultWrapper")[i].querySelector('h3 a').href;
                obj.phone = dom.window.document.querySelectorAll(".resultWrapper")[i].querySelector('.tel').textContent;
                obj.match = true;
                return obj;
            } else {
                obj.match = false;
            }
        }
        return obj;
    })
        .then(content => {
            res.send(content);
        })
        .catch(e => console.log(e));
}

function superpages(businessName, city, state, zipcode, res) {
    browser.requestSingle({ url: "https://www.superpages.com/listings.jsp?CS=L&MCBP=true&search=Find+It&STYPE=S&SCS=&C=" + businessName + "+" + city + "+" + state, renderType: "html" }, (err, userResponse) => {
        if (err != null) {
            throw err;
        }
        var aj = userResponse.content.data;
        var doc = parser.parseFromString(aj, "text/html");
        const dom = new JSDOM(`${doc.rawHTML}`);
        var obj = {};
        obj.siteName = "superpages";
        for (let i = 0; i < dom.window.document.querySelectorAll(".item").length; i++) {
            var address = dom.window.document.querySelectorAll(".item")[i].querySelector('.titlePadding span').textContent.split(" ");;
            if (address[address.length - 1] == zipcode) {
                obj.name = dom.window.document.querySelectorAll(".item")[i].querySelector('.list-title a').textContent;
                obj.address = dom.window.document.querySelectorAll(".item")[i].querySelector('.titlePadding span').textContent;
                obj.url = "https://www.superpages.com" + dom.window.document.querySelectorAll(".item")[i].querySelector('.list-title a').href;
                obj.phone = dom.window.document.querySelectorAll(".item")[i].querySelector('.addphone h4 a').textContent;
                obj.match = true;
                console.log(obj);
                return obj;
            } else {
                obj.match = false;
            }
        }
        return obj;
    })
        .then(content => {
            res.send(content);
        })
        .catch(e => console.log(e));
}


function judysbook(businessName, city, state, zipcode, res) {
    let options = {
        url: "https://api.judysbook.com/API_3/API_3fw.svc/REST/json/SearchByNameAndZipcode?publisherId=submitlocal&apiKey=3O3uHyjn&businessName=" + businessName + "&zipcode=" + zipcode,
    };
    request(options, function (error, response, body) {
        let objs = [];
        let obj = {};
        let obj_org = {};
        if (error) {
            obj.siteName = 'Judysbook';
            objs.push(obj);
            res.send(objs);
        } else {
            body = JSON.parse(body);
            if (body.length > 0) {
                obj_org.name = body[0].Name;
                obj_org.address = body[0].Address1 + "," + body[0].City + "," + body[0].State + "," + body[0].Zipcode;
                obj_org.siteName = 'Judysbook';
                obj_org.type = 'actual';
                obj_org.url = body[0].ProfileUrl;
                obj_org.phone = body[0].PhoneNumber;
                objs.push(obj_org);
                if (body.length > 1) {
                    for (let i = 1; i < body.length; i++) {
                        if (body[i].Name == businessName) {
                            obj.name = body[i].Name;
                            obj.address = body[i].Address1 + "," + body[i].City + "," + body[i].State + "," + body[i].Zipcode;
                            obj.siteName = 'Judysbook';
                            obj.type = 'duplicate';
                            obj.url = body[i].ProfileUrl;
                            obj.phone = body[i].PhoneNumber;
                            objs.push(obj);
                        }
                    }
                }
            }
            else {
                obj.siteName = 'Judysbook';
                objs.push(obj);
            }
            res.send(objs);
        }
    });
}
function judysbook_old(businessName, city, state, zipcode, res) {
    let lat, lng;
    getCoords(city)
        .then((coords) => {
            lat = coords.lat;
            lng = coords.lng;
            let options = {
                url: "https://api.judysbook.com/API_3/API_3fw.svc/REST/json/SearchByNameAndZipcode?publisherId=submitlocal&apiKey=3O3uHyjn&businessName=" + businessName + "&zipcode=" + zipcode,
            };
            request(options, function (error, response, body) {
                let obj = {};
                if (error) {
                    obj.siteName = 'Judysbook';
                    res.send(obj);
                } else {
                    body = JSON.parse(body);
                    if (body.length > 0) {
                        obj.name = body[0].Name;
                        obj.address = body[0].Address1 + "," + body[0].City + "," + body[0].State + "," + body[0].Zipcode;
                        obj.siteName = 'Judysbook';
                        obj.url = body[0].ProfileUrl;
                        obj.phone = body[0].PhoneNumber;
                    }
                    else {
                        obj.siteName = 'Judysbook';
                    }
                    res.send(obj);
                }
            });

        });

}


function hotfrog(businessName, businessPhone, res) {
    let url = "https://api.hotfrog.com/api/search?name=" + businessName + "&country=US&phone=" + businessPhone;
    axios({
        method: 'get',
        url,
        auth: {
            username: 'submitlocal',
            password: '94fea331-b47d-4dda-ad15-bc3c695ad056'
        }
    })
        .then(function (response) {
            let objs = [];
            let obj = {};
            let obj_org = {};
            if (response.data.items.length > 0) {
                body = response.data.items[0];
                if (body) {
                    obj_org.name = body.name;
                    obj_org.address = body.address + "," + body.city + "," + body.state + "," + body.zip;
                    obj_org.siteName = 'hotfrog';
                    obj_org.type = 'actual';
                    obj_org.url = body.listingUrl;
                    if (body.phones.length > 0)
                        obj_org.phone = body.phones[0].number;
                    objs.push(obj_org);
                    if (response.data.items.length > 1) {
                        for (let i = 1; i < response.data.items.length; i++) {
                            body = response.data.items[i];
                            if (body) {
                                if (body.name == businessName) {
                                    obj.name = body.name;
                                    obj.address = body.address + "," + body.city + "," + body.state + "," + body.zip;
                                    obj.siteName = 'hotfrog';
                                    obj.type = 'duplicate';
                                    obj.url = body.listingUrl;
                                    if (body.phones.length > 0)
                                        obj.phone = body.phones[0].number;
                                    objs.push(obj);
                                }
                            }
                        }
                    }
                    else {
                        obj.siteName = 'hotfrog';
                        objs.push(obj);
                    }
                    res.send(objs);
                } else {
                    let obj = {};
                    obj.siteName = 'hotfrog';
                    objs.push(obj);
                    res.send(objs);
                }
            }
        })
        .catch(function (error) {
            console.log(error);
            let obj = {};
            obj.siteName = 'hotfrog';
            res.send(obj);
        })
}


function heremaps(businessName, city, state, zipcode, res) {
    let lat, lng;
    getCoords(city)
        .then((coords) => {
            lat = coords.lat;
            lng = coords.lng;
            let options = {
                url: "https://places.cit.api.here.com/places/v1/autosuggest?at=" + lat + "," + lng + "&q=" + businessName + "&app_id=7CT3pm5AgD4CvoK33hXk&app_code=FdutVSogiYXTKmt1NoyU_A",
            };
            request(options, function (error, response, body) {
                let obj = {};
                if (error) {
                    obj.siteName = 'heremaps';
                    res.send(obj);
                } else {
                    body = JSON.parse(body);
                    if (body.results.length > 0) {
                        obj.name = body.results[0].title;
                        obj.address = body.results[0].vicinity;
                        obj.address = obj.address.replace("<br/>", " ")
                        obj.siteName = 'heremaps';
                        let href = body.results[0].href;
                        if (href) {
                            request(href, function (error, response, body) {
                                if (error) {
                                    res.send(obj);
                                } else {
                                    body = JSON.parse(body);
                                    obj.url = body.view;
                                    obj.phone = body.contacts.phone[0].value;
                                    res.send(obj);
                                }
                            })
                        }
                        else {
                            res.send(obj);
                        }
                    }
                    else {
                        obj.siteName = 'heremaps';
                        res.send(obj);
                    }

                }
            });

        })
        .catch(function (error) {
            console.log(error);
            let obj = {};
            obj.siteName = 'heremaps';
            res.send(obj);
        })

}

function brownbook(businessName, businessPhone, city, state, zipcode, res) {
    let options = {
        url: "http://api.brownbook.net/businesses/?country=US&phone=" + businessPhone + "&name=" + businessName + "&zip=" + zipcode + "&_limit=30&_offset=0",
        headers: {
            'Authorization': 'Bearer ' + brownbook_pass
        }
    };
    request(options, function (error, response, body) {
        let obj = {};
        let objs = [];
        if (error) {
            obj.siteName = 'brownbook';
            objs.push(obj);
            res.send(objs);
        } else {
            body = JSON.parse(body);
            if (body.error == 'invalid_grant') {
                let data = {
                    "grant_type": "password",
                    "username": "submitlocalapi@brownbook.net",
                    "password": "c@7^RX6:bE3",
                    "client_id": "submitlocal",
                    "client_secret": "Ky5ICRfWQ4h8tyqpJjqMUEtEPTvQKfFYggPwEI9VnyGGtYxHCzZGk8KGPU41YNrD"
                };
                let url = 'http://api.brownbook.net/token/';
                let options = {
                    method: 'post',
                    body: data,
                    json: true,
                    url: url
                };
                request(options, function (err, response, body) {
                    if (err) {
                        console.log(err)
                        obj.siteName = 'brownbook';
                        res.send(obj);
                    } else {
                        brownbook_pass = body.access_token;
                        let options = {
                            url: "http://api.brownbook.net/businesses/?country=US&phone=" + businessPhone + "&name=" + businessName + "&zip=" + zipcode + "&_limit=30&_offset=0",
                            headers: {
                                'Authorization': 'Bearer ' + brownbook_pass
                            }
                        };
                        request(options, function (error, response, body) {
                            let objs = [];
                            let obj = {};
                            if (error) {
                                obj.siteName = 'brownbook';
                                objs.push(obj);
                                res.send(objs);
                            } else {
                                body = JSON.parse(body);
                                body = body.results;
                                if (body.length > 0) {
                                    obj.name = body[0].fields.name;
                                    obj.address = body[0].fields.address + "," + body[0].fields.city + "," + body[0].fields.state + "," + body[0].fields.postcode;
                                    obj.siteName = 'brownbook';
                                    obj.type = 'actual';
                                    obj.url = body[0].link;
                                    obj.phone = body[0].fields.phone;
                                    objs.push(obj);
                                }
                                else {
                                    obj.siteName = 'brownbook';
                                    objs.push(obj);
                                }

                                if (body.length > 1) {
                                    for (let i = 0; i < body.length; i++) {
                                        if (body[i].fields.name == businessName) {
                                            obj.name = body[i].fields.name;
                                            obj.address = body[i].fields.address + "," + body[i].fields.city + "," + body[i].fields.state + "," + body[i].fields.postcode;
                                            obj.siteName = 'brownbook';
                                            obj.type = 'duplicate';
                                            obj.url = body[i].link;
                                            obj.phone = body[i].fields.phone;
                                            objs.push(obj);
                                        }
                                    }
                                }
                                res.send(objs);
                            }
                        });
                    }
                })
            }
            else {
                body = body.results;
                if (body.length > 0) {
                    obj.name = body[0].fields.name;
                    obj.address = body[0].fields.address + "," + body[0].fields.city + "," + body[0].fields.state + "," + body[0].fields.postcode;
                    obj.siteName = 'brownbook';
                    obj.type = 'actual';
                    obj.url = body[0].link;
                    obj.phone = body[0].fields.phone;
                    objs.push(obj);
                }
                if (body.length > 1) {
                    for (let i = 0; i < body.length; i++) {
                        if (body[i].fields.name == businessName) {
                            obj.name = body[i].fields.name;
                            obj.address = body[i].fields.address + "," + body[i].fields.city + "," + body[i].fields.state + "," + body[i].fields.postcode;
                            obj.siteName = 'brownbook';
                            obj.type = 'duplicate';
                            obj.url = body[i].link;
                            obj.phone = body[i].fields.phone;
                            objs.push(obj);
                        }
                    }
                }
                else {
                    obj.siteName = 'brownbook';
                    objs.push(obj);
                }
                res.send(objs);
            }
        }
    });
}

function localstack(businessName, city, state, zipcode, res) {
    browser.requestSingle({ url: "https://localstack.com/search?q=" + businessName + "&locationPath=" + city + "-" + state, renderType: "html" }, (err, userResponse) => {
        if (err != null) {
            throw err;
        }
        var aj = userResponse.content.data;
        var doc = parser.parseFromString(aj, "text/html");
        const dom = new JSDOM(`${doc.rawHTML}`);
        var obj = {};
        obj.siteName = "Localstack";
        for (let i = 0; i < dom.window.document.querySelectorAll(".search-result").length; i++) {
            var address = dom.window.document.querySelectorAll(".search-result")[i].querySelector('.business-information a').textContent;
            if (address.includes(businessName.split('+').join(' '))) {
                obj.name = address
                obj.address = dom.window.document.querySelectorAll(".search-result")[i].querySelector('.business-location span').getElementsByTagName('span')[0].textContent + " " + dom.window.document.querySelectorAll(".search-result")[i].querySelector('.business-location span').getElementsByTagName('span')[2].textContent + " " + dom.window.document.querySelectorAll(".search-result")[i].querySelector('.business-location span').getElementsByTagName('span')[4].textContent
                obj.url = "https://localstack.com/" + dom.window.document.querySelectorAll(".search-result")[i].querySelector('.business-information a').href;
                obj.phone = dom.window.document.querySelectorAll(".search-result")[i].querySelectorAll('.business-location')[1].textContent;
                obj.match = true;
                console.log(obj);
                return obj;
            } else {
                obj.match = false;
            }
        }
        return obj;
    })
        .then(content => {
            res.send(content);
        })
        .catch(e => console.log(e));
}

function kudzu(businessName, city, state, zipcode, res) {
    browser.requestSingle({ url: "https://www.kudzu.com/controller.jsp?N=0&searchVal=" + businessName + "&" + "currentLocation=" + city + "%2C%20" + state + "%2030308&searchType=keyword&Ns=P_PremiumPlacement", renderType: "html" }, (err, userResponse) => {
        if (err != null) {
            throw err;
        }
        var aj = userResponse.content.data;
        var doc = parser.parseFromString(aj, "text/html");
        const dom = new JSDOM(`${doc.rawHTML}`);
        var obj = {};
        obj.siteName = "kudzu";
        //console.log(dom.window.document.querySelector('#content-left-block').querySelectorAll(".navRecordDiv")[0].textContent)
        for (let i = 0; i < dom.window.document.querySelector('#content-left-block').querySelectorAll(".navRecordDiv").length; i++) {
            var address = dom.window.document.querySelector('#content-left-block').querySelectorAll(".navRecordDiv")[i].querySelector(".adr p").querySelectorAll(".hide-mb")[5].textContent;
            if (address.includes(zipcode)) {
                obj.businessName = dom.window.document.querySelector('#content-left-block').querySelectorAll(".navRecordDiv")[i].querySelector(".sresult-content-left h3 a").textContent.replace(/(\r\n|\n|\r)/gm, "").replace(/\s+/g, " ");
                obj.address = dom.window.document.querySelector('#content-left-block').querySelectorAll(".navRecordDiv")[i].querySelector(".adr p").querySelectorAll(".hide-mb")[0].textContent;
                obj.city = dom.window.document.querySelector('#content-left-block').querySelectorAll(".navRecordDiv")[i].querySelector(".adr p").querySelectorAll(".hide-mb")[2].textContent;
                obj.state = dom.window.document.querySelector('#content-left-block').querySelectorAll(".navRecordDiv")[i].querySelector(".adr p").querySelectorAll(".hide-mb")[4].textContent;
                obj.zip = dom.window.document.querySelector('#content-left-block').querySelectorAll(".navRecordDiv")[i].querySelector(".adr p").querySelectorAll(".hide-mb")[5].textContent;
                obj.url = "https://www.kudzu.com/" + dom.window.document.querySelector('#content-left-block').querySelectorAll(".navRecordDiv")[i].querySelector(".sresult-content-left h3 a").href;
                obj.phone = dom.window.document.querySelector('#content-left-block').querySelectorAll(".navRecordDiv")[i].querySelector(".sresult-content-left meta").content;
                obj.match = true;
                console.log(obj);
                return obj;
            } else {
                obj.match = false;
            }
        }
        return obj;
    })
        .then(content => {
            res.send(content);
        })
        .catch(e => console.log(e));

}

function callInnerKudzu(url) {

}

function ablocal(businessName, city, state, zipcode, res) {
    browser.requestSingle({ url: "https://ablocal.com/search/?search%5Bbusiness%5D=" + businessName + "&search%5Blocation%5D=" + city + "%2C+" + state, renderType: "html" }, (err, userResponse) => {
        if (err != null) {
            throw err;
        }
        var aj = userResponse.content.data;
        var doc = parser.parseFromString(aj, "text/html");
        const dom = new JSDOM(`${doc.rawHTML}`);
        for (let i = 0; i < dom.window.document.querySelectorAll(".listing").length; i++) {
            var obj = {};
            if (dom.window.document.querySelectorAll(".listing")[i].querySelector('.zipcode').textContent == zipcode) {
                obj.siteName = "ablocal";
                obj.url = dom.window.document.querySelectorAll(".listing")[i].getElementsByTagName('h3')[0].querySelector("a").href;
                obj.name = dom.window.document.querySelectorAll(".listing")[i].getElementsByTagName('h3')[0].querySelector("a").textContent;
                obj.address = dom.window.document.querySelectorAll(".listing")[i].querySelector('.address_wrapper').querySelector(".address").textContent + " " + dom.window.document.querySelectorAll(".listing")[i].querySelector('.address_wrapper').querySelectorAll(".city")[0].textContent + ", " + dom.window.document.querySelectorAll(".listing")[i].querySelector('.address_wrapper').querySelectorAll(".city")[1].textContent + " " + dom.window.document.querySelectorAll(".listing")[i].querySelector('.zipcode').textContent;
                obj.phone = dom.window.document.querySelectorAll(".listing")[i].querySelector('.phone').querySelector("strong").textContent;
                return obj;
            }
        }
    }).then(content => {
        if (content != null) {
            res.send(content);
        } else {
            let content = {};
            content.siteName = "ablocal";
            res.send(content);
        }
    });
}

function coc(businessName, city, state, zipcode, res) {
    browser.requestSingle({ url: "https://www.chamberofcommerce.com/search/results?what=" + businessName + "&where=" + city + "%2C%20" + state, renderType: "html" }, (err, userResponse) => {
        if (err != null) {
            throw err;
        }
        var aj = userResponse.content.data;
        var doc = parser.parseFromString(aj, "text/html");
        const dom = new JSDOM(`${doc.rawHTML}`);
        var obj = {};
        obj.siteName = "chamber of commerce";
        for (let i = 0; i < dom.window.document.querySelectorAll(".basic").length; i++) {
            var address = dom.window.document.querySelectorAll(".basic")[i].getElementsByTagName('p')[0].textContent;
            if (address.includes(zipcode)) {
                obj.name = dom.window.document.querySelectorAll(".basic")[i].querySelector('.box-info h2 a').textContent;
                obj.address = dom.window.document.querySelectorAll(".basic")[i].getElementsByTagName('p')[0].textContent;
                obj.url = "https://www.chamberofcommerce.com" + dom.window.document.querySelectorAll(".basic")[i].querySelector('.box-info h2 a').href;
                obj.phone = dom.window.document.querySelectorAll(".basic")[i].getElementsByTagName('p')[1].textContent;
                obj.match = true;
                console.log(obj);
                return obj;
            } else {
                obj.match = false;
            }
        }
        return obj;
    })
        .then(content => {
            res.send(content);
        })
        .catch(e => console.log(e));
}

function manta(businessName, city, state, zipcode, res) {
    var _ph, _page, _outObj;
    phantom
        .create()
        .then(ph => {
            _ph = ph;
            return _ph.createPage();
        })
        .then(page => {
            _page = page;
            // var resultOpen = _page.open("https://www.chamberofcommerce.com/search/results?what=" + businessName + "&where=" + city + "%2C%20" + state);
            return _page.open("https://www.manta.com/search?search_source=business&search=" + businessName + "&search_location=" + city + "+" + state);
        })
        .then(status => {
            var zip = zipcode;
            _page.injectJs("./assets/jquery.min.js");
            var title = _page.evaluate(function (zip, businessName, city, state) {
                var obj = {};
                // obj = ;
                obj.siteName = "Manta";
                // obj.address = document;
                // $(".organic-result").each(function(){
                //     obj.address = "hey";
                // })
                // obj.name = $('p:contains("' + zip + '")').parent('.box-info').find('a').text();
                // obj.phone = $(".box-info p:last-of-type").text();
                // obj.url = "https://www.chamberofcommerce.com/" + $('p:contains("' + zip + '")').parent('.box-info').find('a').attr("href");
                return obj;
            }, zip, businessName, city, state);

        })
        .then(content => {
            res.send(content);
            // _page.close();
            // _ph.exit();
        })
        .catch(e => console.log(e));
}

function citySquares(businessName, city, state, zipcode, res) {
    browser.requestSingle({ url: "https://citysquares.com/search?utf8=✓&search%5Bterm%5D=" + businessName + "&search%5Blocation%5D=" + city + "%2C+" + state, renderType: "html" }, (err, userResponse) => {
        if (err != null) {
            throw err;
        }
        var aj = userResponse.content.data;
        var doc = parser.parseFromString(aj, "text/html");
        const dom = new JSDOM(`${doc.rawHTML}`);
        var obj = {};
        console.log(dom.window.document.querySelectorAll(".deal-detail")[0].querySelector('.index-item-details').getElementsByTagName('p')[2].textContent)
        for (let i = 0; i < dom.window.document.querySelectorAll(".deal-detail").length; i++) {
            var address = dom.window.document.querySelectorAll(".deal-detail")[i].querySelector('.index-item-details').getElementsByTagName('p')[2].textContent;
            if (address.includes(zipcode)) {
                obj.siteName = "citysquares";
                obj.name = dom.window.document.querySelectorAll(".deal-detail")[i].querySelector('.banner').getElementsByTagName('p')[0].textContent.replace(/(\r\n|\n|\r)/gm, "").replace(/\s+/g, " ");
                obj.address = dom.window.document.querySelectorAll(".deal-detail")[i].querySelector('.index-item-details').getElementsByTagName('p')[2].textContent;
                obj.url = "https://citysquares.com" + dom.window.document.querySelectorAll(".deal-detail")[i].querySelector('.banner .summary-list a').href;
                obj.phone = dom.window.document.querySelectorAll(".deal-detail")[i].querySelector('.index-item-details').getElementsByTagName('p')[3].textContent;
                obj.match = true;
                console.log(obj);
                return obj;
            } else {
                obj.match = false;
            }
        }
        return obj;
    })
        .then(content => {
            if (content != null)
                res.send(content);
            else {
                let content = {};
                content.siteName = "citysquares";
                res.send(content);
            }
        })
        .catch((e) => {
            console.log(e)
            let content = {};
            content.siteName = "citysquares";
            res.send(content);
        });
}




function merchantCircle(businessName, city, state, zipcode, res) {
    browser.requestSingle({ url: "https://www.merchantcircle.com/search?q=" + businessName + "&qn=" + city + "%2C+" + state, renderType: "html" }, (err, userResponse) => {
        if (err != null) {
            throw err;
        }
        var aj = userResponse.content.data;
        var doc = parser.parseFromString(aj, "text/html");
        const dom = new JSDOM(`${doc.rawHTML}`);
        var obj = {};
        obj.siteName = "merchantcircle";
        for (let i = 0; i < dom.window.document.querySelectorAll(".result").length; i++) {
            if (dom.window.document.querySelectorAll(".result")[i].querySelector('.vcard')) {
                var address = dom.window.document.querySelectorAll(".result")[i].querySelector('.vcard').querySelector('.directWrap').querySelector('a').textContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ");
                if (address.includes(zipcode)) {
                    obj.name = dom.window.document.querySelectorAll(".result")[i].querySelector('.vcard').querySelector('h2').textContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ");
                    obj.address = dom.window.document.querySelectorAll(".result")[i].querySelector('.vcard').querySelector('.directWrap').querySelector('a').textContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ");
                    obj.url = dom.window.document.querySelectorAll(".result")[i].querySelector('a.mainLink.url').href;
                    obj.phone = dom.window.document.querySelectorAll(".result")[i].querySelector('.vcard').querySelector('.phoneWrap').querySelector('a.phone').textContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ");
                    obj.match = true;
                    console.log(obj);
                    return obj;
                } else {
                    obj.match = false;
                }
            }
        }
        return obj;
    })
        .then(content => {
            res.send(content);
        })
        .catch(e => console.log(e));
}


function google(businessName, city, state, zip, res) {
    let lat, lng, placeid;
    let venue = {};
    getCoords(city)
        .then((coords) => {
            lat = coords.lat;
            lng = coords.lng;
            let formattedName = businessName.split(" ").join("+");
            request("https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + formattedName + "&location=" + lat + "," + lng + "&key=AIzaSyB2CMGUJxe_WZZhnT1miRwKcr-EgiGejlc&c=_jsonp3vuapwqo3og", function (error, response, body) {
                if (error) {
                    obj.siteName = 'google';
                    obj.type = 'actual';
                    res.send(obj);
                } else {
                    body = JSON.parse(body);
                    let gresults = [];
                    let gresult = {};
                    gresult.siteName = 'google';
                    gresult.type = 'actual';
                    if (body.results.length > 0) {
                        let item = body.results[0];
                        gresult.name = item.name;
                        gresult.address = item.formatted_address;
                        gresult.siteName = 'google';
                        venue.venue_id = item.place_id;
                        gresult.reviewData = venue;
                        request(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${item.place_id}&fields=name,rating,formatted_phone_number&key=AIzaSyB2CMGUJxe_WZZhnT1miRwKcr-EgiGejlc&c=_jsonp3vuapwqo3og`, function (err, response, data) {
                            if (err) {
                                gresults.push(gresult);
                                res.send(gresults);
                            } else {
                                data = JSON.parse(data);
                                if (data != null) {
                                    if (data.result != undefined) {
                                        gresult.phone = data.result.formatted_phone_number;
                                    }
                                }
                                gresults.push(gresult);
                                if (body.results.length > 1) {
                                    for (let i = 1; i < body.results.length; i++) {
                                        if (body.results[i].name == businessName) {
                                            let item = body.results[i];
                                            gresult.name = item.name;
                                            gresult.address = item.formatted_address;
                                            gresult.siteName = 'google';
                                            gresult.type = 'duplicate';
                                            gresult.place_id = item.place_id;
                                            gresults.push(gresult);
                                        }
                                    }
                                }
                                res.send(gresults);
                            }
                        });
                    } else {
                        gresults.push(gresult);
                        res.send(gresults);
                    }
                    // gresults.push(gresult);
                    // if(body.results.length > 1){
                    //     for(let i=1;i<body.results.length;i++){
                    //         if(body.results[i].name == businessName){
                    //             let item = body.results[i];
                    //             gresult.name = item.name;
                    //             gresult.address = item.formatted_address;
                    //             gresult.siteName = 'google';
                    //             gresult.type = 'duplicate';
                    //             gresult.place_id = item.place_id;
                    //             gresults.push(gresult);
                    //         }   
                    //     }
                    // }
                    // res.send(gresults);
                }
            })
        })
}

function zomato(businessName, city, state, res) {
    let lat, lng;
    getCoords(city)
        .then((coords) => {
            lat = coords.lat;
            lng = coords.lng;
            let options = {
                url: "https://developers.zomato.com/api/v2.1/search?q=" + businessName + "&start=0&count=1&lat=" + lat + "&lon=" + lng + "&radius=10000",
                headers: {
                    'user-key': 'c1addf7994aeda1945a958c834995f58',
                    "Accept": "application/json",
                }
            };
            request(options, function (error, response, body) {
                let obj = {};
                let objs = new Array();
                if (error) {
                    obj.siteName = 'zomato';
                    res.send(obj);
                } else {
                    body = JSON.parse(body);
                    if (body.results_found > 0) {
                        obj.name = body.restaurants[0].restaurant.name;
                        obj.address = body.restaurants[0].restaurant.location.address;
                        obj.siteName = 'zomato';
                        obj.type = 'actual';
                        obj.url = body.restaurants[0].restaurant.url;
                        objs.push(obj);
                    }
                    else {
                        obj.siteName = 'zomato';
                        obj.type = 'actual';
                        objs.push(obj);
                    }
                    if (body.results_found > 1) {
                        for (let i = 1; i < body.restaurants.length; i++) {
                            if (body.restaurants[i].restaurant.name == businessName) {
                                obj.name = body.restaurants[i].restaurant.name;
                                obj.address = body.restaurants[i].restaurant.location.address;
                                obj.siteName = 'zomato';
                                obj.type = 'duplicate';
                                obj.url = body.restaurants[i].restaurant.url;
                                objs.push(obj);
                            }
                        }
                    }
                    res.send(objs);
                }
            });
        })
        .catch((error) => {
            console.log(error);
        })
}

function future_tap(businessName, city, state, res) {
    let lat, lng;
    getCoords(city)
        .then((coords) => {
            lat = coords.lat;
            lng = coords.lng;
            let options = {
                url: "https://futuretap-sandbox.herokuapp.com/partner/submitlocal/search?name=" + businessName + "&latlng=" + lat + "," + lng,
                headers: {
                    'Authorization': 'Token token=zagnogcirmIkebayndEmjechaksyudec'
                }
            };
            request(options, function (error, response, body) {
                let objs = new Array();
                let obj = {};
                if (error) {
                    obj.siteName = 'Future_tap';
                    obj.type = 'actual';
                    objs.push(obj);
                    res.send(objs);
                } else {
                    body = JSON.parse(body);
                    if (body.length > 0) {
                        obj.name = body[0].name;
                        obj.address = body[0].address + "," + body[0].state + "," + body[0].zip;
                        obj.siteName = 'Future_tap';
                        obj.url = body[0].url;
                        obj.phone = body[0].phone;
                        obj.type = 'actual';
                        objs.push(obj);
                        if (body.length > 1) {
                            for (let index = 1; index < body.length; index++) {
                                obj = {};
                                if (body[index].name == businessName) {
                                    obj.name = body[index].name;
                                    obj.address = body[index].address + "," + body[index].state + "," + body[index].zip;
                                    obj.siteName = 'Future_tap';
                                    obj.url = body[index].url;
                                    obj.phone = body[index].phone;
                                    obj.type = 'duplicate';
                                    objs.push(obj);
                                }
                            }
                        }
                    }
                    else {
                        obj.siteName = 'Future_tap';
                        obj.type = 'actual';
                        objs.push(obj);
                    }
                    res.send(objs);
                }
            });

        });

}

function facebook(businessName, city, state, res) {
    let lat, lng;
    getCoords(city)
        .then((coords) => {
            lat = coords.lat;
            lng = coords.lng;
            let options = {
                url: "https://graph.facebook.com/v2.9/search?type=place&q=" + businessName + "&center=" + lat + "," + lng + "&distance=10000&fields=url,link,location,name,address,phone,checkins,picture&access_token=217362672300054|rHAecPlb0317_cqznjI_1vvrGT0",
            };
            request(options, function (error, response, body) {
                let objs = new Array();
                let obj = {};
                if (error) {
                    obj.siteName = 'Facebook';
                    objs.push(obj);
                    res.send(objs);
                } else {
                    body = JSON.parse(body);
                    body = body.data;
                    if (body.length > 0) {
                        obj.name = body[0].name;
                        obj.address = body[0].location.street + "," + body[0].location.city + "," + body[0].location.state + "," + body[0].location.zip;
                        obj.siteName = 'Facebook';
                        obj.url = body[0].link;
                        obj.phone = body[0].phone;
                        obj.type = 'actual';
                        objs.push(obj);
                        if (body.length > 1) {
                            for (let index = 1; index < body.length; index++) {
                                obj = {};
                                if (body[index].name == businessName) {
                                    obj.name = body[index].name;
                                    obj.address = body[index].location.street + "," + body[index].location.city + "," + body[index].location.state + "," + body[index].location.zip;
                                    obj.siteName = 'Facebook';
                                    obj.url = body[index].link;
                                    obj.phone = body[index].phone;
                                    obj.type = 'duplicate';
                                    objs.push(obj);
                                }
                            }
                        }
                    }
                    else {
                        obj.siteName = 'Facebook';
                        objs.push(obj);
                    }
                    res.send(objs);
                }
            });
        });
}

function bing(businessName, city, state, res) {
    let lat, lng;
    getCoords(city)
        .then((coords) => {
            lat = coords.lat;
            lng = coords.lng;
            let options = {
                url: "https://api.cognitive.microsoft.com/bing/v7.0/entities/?q=" + businessName + "&mkt=en-us&count=10&offset=0&safesearch=Moderate",
                headers: {
                    'Ocp-Apim-Subscription-Key': '5d12bcb67de34efa8ba7bfbd2c0df1d9'
                }
            };
            request(options, function (error, response, body) {
                let obj = {};
                if (error) {
                    obj.siteName = 'bing';
                    res.send(obj);
                } else {
                    body = JSON.parse(body);
                    // body = body.data;
                    if (body.hasOwnProperty("places")) {
                        if (body.places.hasOwnProperty("value") && body.places.value.length > 0) {
                            let tempobj = body.places.value[0];
                            obj.name = tempobj.name;
                            obj.address = tempobj.address.addressLocality + "," + tempobj.address.addressRegion + "," + tempobj.address.addressCountry + "," + tempobj.address.postalCode;
                            obj.siteName = 'bing';
                            obj.url = tempobj.webSearchUrl;
                            obj.phone = tempobj.telephone;
                        } else {
                            obj.siteName = 'bing';
                        }
                    }
                    else {
                        obj.siteName = 'bing';
                    }
                    res.send(obj);
                }
            });

        });

}



// function facebook(businessName,city,state,zip,res)
// { 
//   // res.send({"hey":"yes"});
//   let lat,lng;
//   getCoords(city)
//       .then((coords) => {
//         lat = coords.lat;
//         lng = coords.lng;
//         // res.send({lat:lat,lng:lng});
//         let formattedName = businessName.split(" ").join("+");
//   let query = "&center="+lat+","+lng;
//   var params =formattedName+query+"&fields=name,location,picture&access_token=EAACEdEose0cBAEdKUbOSh50tOKhsBHHrZCU53ZAB9bSrp1gmVgTeKlAoZCPpcCqCQrsnpZBiCoZC0plZAjZB9qbjtNpFIfUv9UHEyfZBYPgdZBUkKhowNN09t5uYHl9e7fEa3Ty7kRDRcZCCaNcZBUXemDuhiwmJcRVtjXiZA2ykqhU6HNZCvjPjEvJNiLdgt4DM4EhUZD";
//   // res.send(params);
//   // res.send('https://graph.facebook.com/v2.11/search?type=place&q='+params);
//   var fbResult = {};
//   request('https://graph.facebook.com/v2.11/search?type=place&q='+params, function (error, response, body) {
//     console.log('error:', error); // Print the error if one occurred
//     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//     body = JSON.parse(body);

//     body.data.map((item) => {
//     if(item.location.zip == zip){
//       fbResult.address = item.location.street + ", " +item.location.state + ", " + item.location.zip;
//       fbResult.name = item.name;
//       fbResult.phone = "Not Found";
//       fbResult.siteName = 'facebook';
//     }
//   })

//   if(fbResult.siteName != 'facebook'){
//     fbResult.phone = "Not Found";
//     fbResult.siteName = 'facebook';
//   }
//     res.send(fbResult);
//     console.log('body:', body); // Print the HTML for the Google homepage.
//   });
// });

// }

function yp(businessAddess, businessName, city, state, zip, res, req, count) {
    let lat, lng;
    var agent = useragent.parse(req.headers['user-agent']);
    getCoords(city)
        .then((coords) => {
            lat = coords.lat;
            lng = coords.lng;
            var formattedAddress = businessAddess.split(" ").join("+");
            let formattedName = businessName.split(" ").join("+");
            var formattedCity = city.split(" ").join("+");
            var formattedState = state.split(" ").join("+");
            var params = formattedAddress + ",+" + formattedCity + "+" + formattedState + "+" + zip + "&term=" + formattedName + "&&format=JSON&key=1sg3233lvz&sort=name";
            var base_url = 'http://api2.yp.com/listings/v1/search?searchloc=' + params;
            request({
                uri: base_url,
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'User-Agent': agent }
            }, function (error, response, body) {
                body = JSON.parse(body);
                let ypRsult = {};
                let ypRsult_org = {};
                let ypRsults = [];
                ypRsult.siteName = "yp";

                if (response.statusCode == 500 && count <= 10) {
                    yp(businessAddess, businessName, city, state, zip, res, req, count++)
                } else {
                    if (body.searchResult != undefined) {
                        if (body.searchResult.searchListings != undefined) {
                            if (body.searchResult.searchListings.searchListing != undefined) {
                                if (body.searchResult.searchListings.searchListing.length > 0) {
                                    let item = body.searchResult.searchListings.searchListing[0];
                                    if (item.businessName.toLowerCase() == businessName.toLowerCase()) {
                                        ypRsult_org.name = item.businessName;
                                        ypRsult_org.phone = item.phone;
                                        ypRsult_org.url = item.businessNameURL;
                                        ypRsult_org.type = "actual";
                                        ypRsult_org.siteName = "yp";
                                        ypRsult_org.address = item.street + ", " + item.city + ", " + item.state + ", " + item.zip;
                                        ypRsults.push(ypRsult_org);
                                    } else
                                        ypRsults.push(ypRsult);
                                }
                                if (body.searchResult.searchListings.searchListing.length > 1) {
                                    for (let i = 1; i < body.searchResult.searchListings.searchListing.length; i++) {
                                        let item = body.searchResult.searchListings.searchListing[i];
                                        if (item.businessName.toLowerCase() == businessName.toLowerCase()) {
                                            ypRsult.name = item.businessName;
                                            ypRsult.phone = item.phone;
                                            ypRsult.url = item.businessNameURL;
                                            ypRsult.address = item.street + ", " + item.city + ", " + item.state + ", " + item.zip;
                                            ypRsult.type = "duplicate";
                                            ypRsults.push(ypRsult);
                                        }
                                    }
                                }
                                else
                                    res.send(ypRsults);
                            } else
                                res.send(ypRsults);
                        } else
                            res.send(ypRsults);
                    } else {
                        res.send(ypRsults);
                    }
                    res.send(ypRsults);
                }
                // res.send(ypRsults);
            });

        })
        .catch((error) => {
            console.log(error);
            let ypRsults = [];
            let ypRsult = {}
            ypRsult.siteName = "yp";
            ypRsult.type = "actual";
            ypRsults.push(ypRsult);
            res.send(ypRsults);
        });

}

function fetchfoursquare(businessName, city, state, zip, res) {
    request({
        url: 'https://api.foursquare.com/v2/venues/explore',
        method: 'GET',
        qs: {
            client_id: 'FHN0XUTCO11KUO121BKZQRRS321DNJHR5K3BDEYL4FNOET5R',
            client_secret: 'FZ5EAFUMG2FF1GQPVQE2Q24BSJTML0PCZRIWHCSHT2ON2UOI',
            query: businessName,
            near: city,
            intent: 'match',
            state: state,
            zip: zip,
            v: '20180323',
            limit: 10
        }
    }, function (err, re, body) {
        let objs = new Array();
        let obj = {};
        let venue = {};
        if (err) {
            obj.siteName = 'FourSquare';
            objs.push(obj);
            res.send(objs);
        } else {
            result = JSON.parse(body);
            if (result.response.groups != undefined) {
                if (result.response.groups.length > 0) {
                    body = result.response.groups[0].items;
                    if (body.length > 0) {
                        obj.name = body[0].venue.name;
                        obj.address = body[0].venue.location.address + "," + body[0].venue.location.city + "," + body[0].venue.location.state + "," + body[0].venue.location.postalCode;
                        obj.siteName = 'FourSquare';
                        if (body[0].venue.delivery != undefined) {
                            if (body[0].venue.delivery.url != undefined) {
                                obj.url = body[0].venue.delivery.url;
                            }
                        }
                        if (body[0].venue.contact != undefined) {
                            if (body[0].venue.contact.formattedPhone != undefined) {
                                obj.phone = body[0].venue.contact.formattedPhone;
                            }
                        }
                        venue.venue_id = body[0].venue.id;
                        obj.reviewData = venue;
                        obj.type = 'actual';
                        objs.push(obj);
                        if (body.length > 1) {
                            for (let index = 1; index < body.length; index++) {
                                obj = {};
                                if (body[index].venue.name == businessName) {
                                    obj.name = body[index].venue.name;
                                    obj.address = body[index].venue.location.address + "," + body[index].venue.location.city + "," + body[index].venue.location.state + "," + body[index].venue.location.postalCode;
                                    obj.siteName = 'FourSquare';
                                    if (body[index].venue.delivery != undefined) {
                                        if (body[index].venue.delivery.url != undefined) {
                                            obj.url = body[index].venue.delivery.url;
                                        }
                                    }
                                    if (body[index].venue.contact != undefined) {
                                        if (body[index].venue.contact.formattedPhone != undefined) {
                                            obj.phone = body[index].venue.contact.formattedPhone;
                                        }
                                    }
                                    obj.type = 'duplicate';
                                    objs.push(obj);
                                }
                            }
                        }
                    }
                    else {
                        obj.siteName = 'FourSquare';
                        objs.push(obj);
                    }
                }
                else {
                    obj.siteName = 'FourSquare';
                    objs.push(obj);
                }
            }
            else {
                obj.siteName = 'FourSquare';
                objs.push(obj);
            }
            res.send(objs);
        }

        // ////////////////////////////////////////////////////
        // if (err) {
        //   console.error(err);
        // } else {
        // //   console.log('foursquareapi',body);
        //   var parse_body = JSON.parse(body);
        //   var result = parse_body.response;
        // //   console.log('foursquareapi', result);
        //   var foursquare_result = {};
        //   if(result.groups.length > 0){
        //   foursquare_result.address = result.groups[0].items[0].venue.location.formattedAddress.toString();
        //   foursquare_result.name = result.query;
        //   foursquare_result.phone = result.groups[0].items[0].venue.contact.formattedPhone;
        //   foursquare_result.siteName = 'FourSquare';
        // //   foursquare_result.url = result.groups[0].items[0].tips[0].canonicalUrl;
        //   res.send(foursquare_result);
        //   }else{
        //     foursquare_result.siteName = 'FourSquare';
        //     res.send(foursquare_result);
        //   }
        // }//////////////////////////////////////////////////
    });
}



function fetchyelp(businessName, city, state, res) {
    let venue = {};
    var apiKey = '7V1f7ZLcaQNUihJXC3r40L_W1EOzMjTOlb9BIkIRH-Pofnv0GmSd-1A1gTIKAuyVkxvYwkG6A1S4jd8Yxax4VL3LPvPmJo1Acf-4jryCdr3VNCAr2BwpmKlb6hKRWnYx';
    const searchRequest = {
        term: businessName,
        location: city
    };
    const client = yelp.client(apiKey);
    client.search(searchRequest).then(response => {
        if (response.jsonBody.businesses.length > 0) {
            const firstResult = response.jsonBody.businesses[0];
            const prettyJson = JSON.stringify(firstResult, null, 4);
            let yelpresult = {};
            if (firstResult.location != undefined) {
                if (firstResult.location.display_address != undefined) {
                    yelpresult.address = firstResult.location.display_address.toString();
                }
            }
            venue.venue_id = firstResult.id;
            yelpresult.reviewData = venue;
            yelpresult.name = firstResult.name;
            yelpresult.phone = firstResult.phone;
            yelpresult.siteName = 'Yelp';
            yelpresult.url = firstResult.url;
            res.send(yelpresult);
        }
        else {
            let yelpresult = {};
            yelpresult.siteName = 'Yelp';
            res.send(yelpresult);
        }
    }).catch(e => {
        console.log(e);
    });
}

//     return result;
// }


exports.update = function (req, res) {
    // Update a note identified by the noteId in the request

};

exports.delete = function (req, res) {
    // Delete a note with the specified noteId in the request

};

exports.yelpapi = function (req, res) {
    var businessName, city, state, result = [];
    User.findById(req.params.listingID, function (err, data) {
        if (err) {
            res.status(500).send({ message: "Could not retrieve note with id " + req.params.listingID });
        } else {
            businessName = data.business_name;
            city = data.city;
            state = data.state;
            console.log('businessName', businessName);
            // res.send(data);
            fetchyelp(businessName, city, state);
        }
    });
};



exports.foursquareapi = function (req, res) {
    var businessName, city, state, zip;
    User.findById(req.params.listingID, function (err, data) {
        if (err) {
            res.status(500).send({ message: "Could not retrieve note with id " + req.params.listingID });
        } else {
            businessName = data.business_name;
            city = data.city;
            state = data.state;
            zip = data.zip;
            fetchfoursquare(businessName, city, state, zip);
        }
    });

    // axios({
    //     method:'get',
    //     url:'https://api.foursquare.com/v2/venues/explore',
    //     data: {
    //         qs: {
    //             client_id: 'FHN0XUTCO11KUO121BKZQRRS321DNJHR5K3BDEYL4FNOET5R',
    //             client_secret: 'FZ5EAFUMG2FF1GQPVQE2Q24BSJTML0PCZRIWHCSHT2ON2UOI',
    //             ll: '40.7243,-74.0018',
    //             query: 'coffee',
    //             v: '20180323',
    //             limit: 1
    //          }
    //         }
    //     })
    //     .then(response => {
    //         console.log('foresquare response', response.data);
    //         res.send(response.data);
    //     })
};

exports.facebookApi = function (req, res) {
    var businessName, city, state, zip;
    console.log(req.params.listingID);
    User.findById(req.params.listingID, function (err, data) {
        if (err) {
            res.status(500).send({ message: "Could not retrieve note with id " + req.params.listingID });
        } else {
            console.log(data);
            // businessName = data.business_name;
            // city = data.city;
            // state = data.state;
            // zip = data.zip;
            // facebook(businessName,city,state,zip);
        }
    });

    // axios({
    //     method:'get',
    //     url:'https://api.foursquare.com/v2/venues/explore',
    //     data: {
    //         qs: {
    //             client_id: 'FHN0XUTCO11KUO121BKZQRRS321DNJHR5K3BDEYL4FNOET5R',
    //             client_secret: 'FZ5EAFUMG2FF1GQPVQE2Q24BSJTML0PCZRIWHCSHT2ON2UOI',
    //             ll: '40.7243,-74.0018',
    //             query: 'coffee',
    //             v: '20180323',
    //             limit: 1
    //          }
    //         }
    //     })
    //     .then(response => {
    //         console.log('foresquare response', response.data);
    //         res.send(response.data);
    //     })
};

function localdatabase(businessName, city, state, zipcode, res) {
    try {
        browser.requestSingle({ url: "https://www.localdatabase.com/search?q=" + businessName + "&location=" + city + "%2C" + state, renderType: "html" }, (err, userResponse) => {
            if (err != null) {
                throw err;
            }
            var aj = userResponse.content.data;
            var doc = parser.parseFromString(aj, "text/html");
            const dom = new JSDOM(`${doc.rawHTML}`);
            var obj = {};
            obj.siteName = "localdatabase";
            //console.log(dom.window.document.querySelector('ul.listings').querySelectorAll("[itemscope]")[0].textContent)
            for (let i = 0; i < dom.window.document.querySelector('ul.listings').querySelectorAll("[itemscope]").length; i++) {
                var address = dom.window.document.querySelector('ul.listings').querySelectorAll("[itemscope]")[i].querySelector(".details").querySelector(".address").querySelector(".postalCode").textContent;
                if (address.includes(zipcode)) {
                    obj.businessName = dom.window.document.querySelector('ul.listings').querySelectorAll("[itemscope]")[i].querySelector("h4 a").textContent.replace(/(\r\n|\n|\r)/gm, "").replace(/\s+/g, " ");
                    obj.address = dom.window.document.querySelector('ul.listings').querySelectorAll("[itemscope]")[i].querySelector(".details").querySelector(".address").querySelector(".address").textContent;
                    obj.city = dom.window.document.querySelector('ul.listings').querySelectorAll("[itemscope]")[i].querySelector(".details").querySelector(".address").querySelector(".city").textContent;
                    obj.state = dom.window.document.querySelector('ul.listings').querySelectorAll("[itemscope]")[i].querySelector(".details").querySelector(".address").querySelector(".state").textContent;
                    obj.zip = dom.window.document.querySelector('ul.listings').querySelectorAll("[itemscope]")[i].querySelector(".details").querySelector(".address").querySelector(".postalCode").textContent;
                    obj.url = dom.window.document.querySelector('ul.listings').querySelectorAll("[itemscope]")[i].querySelector("h4 a").href;
                    obj.phone = dom.window.document.querySelector('ul.listings').querySelectorAll("[itemscope]")[i].querySelector(".details").querySelector(".phone").querySelector("a").textContent;
                    obj.match = true;
                    console.log(obj);
                    return obj;
                } else {
                    obj.match = false;
                }
            }
            return obj;
        })
            .then(content => {
                if (content == null) {
                    let content = {};
                    content.siteName = 'localdatabase';
                }
                res.send(content);
            })
            .catch((e) => {
                console.log(e)
                let localdatabase = {};
                localdatabase.siteName = 'localdatabase';
                res.send(localdatabase);

            });
    } catch (err) {
        let localdatabase = {};
        localdatabase.siteName = 'localdatabase';
        res.send(localdatabase);

    }
}

//    function getfave(businessName, city, state, zipcode,res) {
//     var _ph, _page, _outObj;
//     phantom
//         .create()
//         .then(ph => {
//             _ph = ph;
//             return _ph.createPage();
//         })
//         .then(page => {
//             _page = page;
//             return _page.open("https://www.localdatabase.com/search?q=" + businessName + "&location=" + city + "%2C" + state);
//         })
//         .then(status => {
//             // var error = _page.evaluate(function(businessName) {
//             //     var msg = document.querySelector(".listings").innerText;
//             //     return msg;
//             // });

//             // if(error == ""){
//                 var title = _page.evaluate(function(businessName) {
//                         var obj = {};
//                         obj.siteName = "localdatabase";
//                         // if(businessName == document.querySelector("h4").innerText){
//                             obj.businessName = document.querySelector("h4").innerText;
//                             obj.address = document.querySelector(".details").querySelector(".address").querySelector(".address").innerText; 
//                             obj.city = document.querySelector(".details").querySelector(".address").querySelector(".city").innerText; 
//                             obj.state = document.querySelector(".details").querySelector(".address").querySelector(".state").innerText; 
//                             obj.zip = document.querySelector(".details").querySelector(".address").querySelector(".postalCode").innerText;    
//                             obj.phone = document.querySelector(".details").querySelector(".phone").querySelector("a").innerText;
//                         // }
//                     return obj;
//                 });
//             // }else{
//             //     return error
//             // }
//             // if(title.businessName == businessName)

//                 return title;
//                 // return ("test")
//             // else{
//             //     return ("Listings not found");
//             // }
//         })
//         .then(content => {
//             // if(content.businessName!= null & content.businessName==businessName){
//                 // console.log(businessName);
//                 res.send(content);
//             // }else{
//             //     res.send("Listings not found");
//             // }
//             _page.close();
//             _ph.exit();
//         })
//         .catch(e => console.log(e));
//    }

