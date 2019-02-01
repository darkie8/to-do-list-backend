const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const passwordLib = require('./../libs/generatePasswordLib');
const token = require('../libs/tokenLib')
const callback = require('./../libs/controllerCallbackLib');
const mailer = require('./../libs/nodeMailer');
const issue_tracking_mail = require('./../../config/mailConfig')
/* Models */

const UserModel = mongoose.model('User')
const authModel = mongoose.model('Auth')
let countries = {
    "BD": "Bangladesh",
    "BE": "Belgium",
    "BF": "Burkina Faso",
    "BG": "Bulgaria",
    "BA": "Bosnia and Herzegovina",
    "BB": "Barbados",
    "WF": "Wallis and Futuna",
    "BL": "Saint Barthelemy",
    "BM": "Bermuda",
    "BN": "Brunei",
    "BO": "Bolivia",
    "BH": "Bahrain",
    "BI": "Burundi",
    "BJ": "Benin",
    "BT": "Bhutan",
    "JM": "Jamaica",
    "BV": "Bouvet Island",
    "BW": "Botswana",
    "WS": "Samoa",
    "BQ": "Bonaire, Saint Eustatius and Saba ",
    "BR": "Brazil",
    "BS": "Bahamas",
    "JE": "Jersey",
    "BY": "Belarus",
    "BZ": "Belize",
    "RU": "Russia",
    "RW": "Rwanda",
    "RS": "Serbia",
    "TL": "East Timor",
    "RE": "Reunion",
    "TM": "Turkmenistan",
    "TJ": "Tajikistan",
    "RO": "Romania",
    "TK": "Tokelau",
    "GW": "Guinea-Bissau",
    "GU": "Guam",
    "GT": "Guatemala",
    "GS": "South Georgia and the South Sandwich Islands",
    "GR": "Greece",
    "GQ": "Equatorial Guinea",
    "GP": "Guadeloupe",
    "JP": "Japan",
    "GY": "Guyana",
    "GG": "Guernsey",
    "GF": "French Guiana",
    "GE": "Georgia",
    "GD": "Grenada",
    "GB": "United Kingdom",
    "GA": "Gabon",
    "SV": "El Salvador",
    "GN": "Guinea",
    "GM": "Gambia",
    "GL": "Greenland",
    "GI": "Gibraltar",
    "GH": "Ghana",
    "OM": "Oman",
    "TN": "Tunisia",
    "JO": "Jordan",
    "HR": "Croatia",
    "HT": "Haiti",
    "HU": "Hungary",
    "HK": "Hong Kong",
    "HN": "Honduras",
    "HM": "Heard Island and McDonald Islands",
    "VE": "Venezuela",
    "PR": "Puerto Rico",
    "PS": "Palestinian Territory",
    "PW": "Palau",
    "PT": "Portugal",
    "SJ": "Svalbard and Jan Mayen",
    "PY": "Paraguay",
    "IQ": "Iraq",
    "PA": "Panama",
    "PF": "French Polynesia",
    "PG": "Papua New Guinea",
    "PE": "Peru",
    "PK": "Pakistan",
    "PH": "Philippines",
    "PN": "Pitcairn",
    "PL": "Poland",
    "PM": "Saint Pierre and Miquelon",
    "ZM": "Zambia",
    "EH": "Western Sahara",
    "EE": "Estonia",
    "EG": "Egypt",
    "ZA": "South Africa",
    "EC": "Ecuador",
    "IT": "Italy",
    "VN": "Vietnam",
    "SB": "Solomon Islands",
    "ET": "Ethiopia",
    "SO": "Somalia",
    "ZW": "Zimbabwe",
    "SA": "Saudi Arabia",
    "ES": "Spain",
    "ER": "Eritrea",
    "ME": "Montenegro",
    "MD": "Moldova",
    "MG": "Madagascar",
    "MF": "Saint Martin",
    "MA": "Morocco",
    "MC": "Monaco",
    "UZ": "Uzbekistan",
    "MM": "Myanmar",
    "ML": "Mali",
    "MO": "Macao",
    "MN": "Mongolia",
    "MH": "Marshall Islands",
    "MK": "Macedonia",
    "MU": "Mauritius",
    "MT": "Malta",
    "MW": "Malawi",
    "MV": "Maldives",
    "MQ": "Martinique",
    "MP": "Northern Mariana Islands",
    "MS": "Montserrat",
    "MR": "Mauritania",
    "IM": "Isle of Man",
    "UG": "Uganda",
    "TZ": "Tanzania",
    "MY": "Malaysia",
    "MX": "Mexico",
    "IL": "Israel",
    "FR": "France",
    "IO": "British Indian Ocean Territory",
    "SH": "Saint Helena",
    "FI": "Finland",
    "FJ": "Fiji",
    "FK": "Falkland Islands",
    "FM": "Micronesia",
    "FO": "Faroe Islands",
    "NI": "Nicaragua",
    "NL": "Netherlands",
    "NO": "Norway",
    "NA": "Namibia",
    "VU": "Vanuatu",
    "NC": "New Caledonia",
    "NE": "Niger",
    "NF": "Norfolk Island",
    "NG": "Nigeria",
    "NZ": "New Zealand",
    "NP": "Nepal",
    "NR": "Nauru",
    "NU": "Niue",
    "CK": "Cook Islands",
    "XK": "Kosovo",
    "CI": "Ivory Coast",
    "CH": "Switzerland",
    "CO": "Colombia",
    "CN": "China",
    "CM": "Cameroon",
    "CL": "Chile",
    "CC": "Cocos Islands",
    "CA": "Canada",
    "CG": "Republic of the Congo",
    "CF": "Central African Republic",
    "CD": "Democratic Republic of the Congo",
    "CZ": "Czech Republic",
    "CY": "Cyprus",
    "CX": "Christmas Island",
    "CR": "Costa Rica",
    "CW": "Curacao",
    "CV": "Cape Verde",
    "CU": "Cuba",
    "SZ": "Swaziland",
    "SY": "Syria",
    "SX": "Sint Maarten",
    "KG": "Kyrgyzstan",
    "KE": "Kenya",
    "SS": "South Sudan",
    "SR": "Suriname",
    "KI": "Kiribati",
    "KH": "Cambodia",
    "KN": "Saint Kitts and Nevis",
    "KM": "Comoros",
    "ST": "Sao Tome and Principe",
    "SK": "Slovakia",
    "KR": "South Korea",
    "SI": "Slovenia",
    "KP": "North Korea",
    "KW": "Kuwait",
    "SN": "Senegal",
    "SM": "San Marino",
    "SL": "Sierra Leone",
    "SC": "Seychelles",
    "KZ": "Kazakhstan",
    "KY": "Cayman Islands",
    "SG": "Singapore",
    "SE": "Sweden",
    "SD": "Sudan",
    "DO": "Dominican Republic",
    "DM": "Dominica",
    "DJ": "Djibouti",
    "DK": "Denmark",
    "VG": "British Virgin Islands",
    "DE": "Germany",
    "YE": "Yemen",
    "DZ": "Algeria",
    "US": "United States",
    "UY": "Uruguay",
    "YT": "Mayotte",
    "UM": "United States Minor Outlying Islands",
    "LB": "Lebanon",
    "LC": "Saint Lucia",
    "LA": "Laos",
    "TV": "Tuvalu",
    "TW": "Taiwan",
    "TT": "Trinidad and Tobago",
    "TR": "Turkey",
    "LK": "Sri Lanka",
    "LI": "Liechtenstein",
    "LV": "Latvia",
    "TO": "Tonga",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    "LR": "Liberia",
    "LS": "Lesotho",
    "TH": "Thailand",
    "TF": "French Southern Territories",
    "TG": "Togo",
    "TD": "Chad",
    "TC": "Turks and Caicos Islands",
    "LY": "Libya",
    "VA": "Vatican",
    "VC": "Saint Vincent and the Grenadines",
    "AE": "United Arab Emirates",
    "AD": "Andorra",
    "AG": "Antigua and Barbuda",
    "AF": "Afghanistan",
    "AI": "Anguilla",
    "VI": "U.S. Virgin Islands",
    "IS": "Iceland",
    "IR": "Iran",
    "AM": "Armenia",
    "AL": "Albania",
    "AO": "Angola",
    "AQ": "Antarctica",
    "AS": "American Samoa",
    "AR": "Argentina",
    "AU": "Australia",
    "AT": "Austria",
    "AW": "Aruba",
    "IN": "India",
    "AX": "Aland Islands",
    "AZ": "Azerbaijan",
    "IE": "Ireland",
    "ID": "Indonesia",
    "UA": "Ukraine",
    "QA": "Qatar",
    "MZ": "Mozambique"
};

let countryCode = {
    "BD": "880",
    "BE": "32",
    "BF": "226",
    "BG": "359",
    "BA": "387",
    "BB": "+1-246",
    "WF": "681",
    "BL": "590",
    "BM": "+1-441",
    "BN": "673",
    "BO": "591",
    "BH": "973",
    "BI": "257",
    "BJ": "229",
    "BT": "975",
    "JM": "+1-876",
    "BV": "",
    "BW": "267",
    "WS": "685",
    "BQ": "599",
    "BR": "55",
    "BS": "+1-242",
    "JE": "+44-1534",
    "BY": "375",
    "BZ": "501",
    "RU": "7",
    "RW": "250",
    "RS": "381",
    "TL": "670",
    "RE": "262",
    "TM": "993",
    "TJ": "992",
    "RO": "40",
    "TK": "690",
    "GW": "245",
    "GU": "+1-671",
    "GT": "502",
    "GS": "",
    "GR": "30",
    "GQ": "240",
    "GP": "590",
    "JP": "81",
    "GY": "592",
    "GG": "+44-1481",
    "GF": "594",
    "GE": "995",
    "GD": "+1-473",
    "GB": "44",
    "GA": "241",
    "SV": "503",
    "GN": "224",
    "GM": "220",
    "GL": "299",
    "GI": "350",
    "GH": "233",
    "OM": "968",
    "TN": "216",
    "JO": "962",
    "HR": "385",
    "HT": "509",
    "HU": "36",
    "HK": "852",
    "HN": "504",
    "HM": " ",
    "VE": "58",
    "PR": "+1-787 and 1-939",
    "PS": "970",
    "PW": "680",
    "PT": "351",
    "SJ": "47",
    "PY": "595",
    "IQ": "964",
    "PA": "507",
    "PF": "689",
    "PG": "675",
    "PE": "51",
    "PK": "92",
    "PH": "63",
    "PN": "870",
    "PL": "48",
    "PM": "508",
    "ZM": "260",
    "EH": "212",
    "EE": "372",
    "EG": "20",
    "ZA": "27",
    "EC": "593",
    "IT": "39",
    "VN": "84",
    "SB": "677",
    "ET": "251",
    "SO": "252",
    "ZW": "263",
    "SA": "966",
    "ES": "34",
    "ER": "291",
    "ME": "382",
    "MD": "373",
    "MG": "261",
    "MF": "590",
    "MA": "212",
    "MC": "377",
    "UZ": "998",
    "MM": "95",
    "ML": "223",
    "MO": "853",
    "MN": "976",
    "MH": "692",
    "MK": "389",
    "MU": "230",
    "MT": "356",
    "MW": "265",
    "MV": "960",
    "MQ": "596",
    "MP": "+1-670",
    "MS": "+1-664",
    "MR": "222",
    "IM": "+44-1624",
    "UG": "256",
    "TZ": "255",
    "MY": "60",
    "MX": "52",
    "IL": "972",
    "FR": "33",
    "IO": "246",
    "SH": "290",
    "FI": "358",
    "FJ": "679",
    "FK": "500",
    "FM": "691",
    "FO": "298",
    "NI": "505",
    "NL": "31",
    "NO": "47",
    "NA": "264",
    "VU": "678",
    "NC": "687",
    "NE": "227",
    "NF": "672",
    "NG": "234",
    "NZ": "64",
    "NP": "977",
    "NR": "674",
    "NU": "683",
    "CK": "682",
    "XK": "",
    "CI": "225",
    "CH": "41",
    "CO": "57",
    "CN": "86",
    "CM": "237",
    "CL": "56",
    "CC": "61",
    "CA": "1",
    "CG": "242",
    "CF": "236",
    "CD": "243",
    "CZ": "420",
    "CY": "357",
    "CX": "61",
    "CR": "506",
    "CW": "599",
    "CV": "238",
    "CU": "53",
    "SZ": "268",
    "SY": "963",
    "SX": "599",
    "KG": "996",
    "KE": "254",
    "SS": "211",
    "SR": "597",
    "KI": "686",
    "KH": "855",
    "KN": "+1-869",
    "KM": "269",
    "ST": "239",
    "SK": "421",
    "KR": "82",
    "SI": "386",
    "KP": "850",
    "KW": "965",
    "SN": "221",
    "SM": "378",
    "SL": "232",
    "SC": "248",
    "KZ": "7",
    "KY": "+1-345",
    "SG": "65",
    "SE": "46",
    "SD": "249",
    "DO": "+1-809 and 1-829",
    "DM": "+1-767",
    "DJ": "253",
    "DK": "45",
    "VG": "+1-284",
    "DE": "49",
    "YE": "967",
    "DZ": "213",
    "US": "1",
    "UY": "598",
    "YT": "262",
    "UM": "1",
    "LB": "961",
    "LC": "+1-758",
    "LA": "856",
    "TV": "688",
    "TW": "886",
    "TT": "+1-868",
    "TR": "90",
    "LK": "94",
    "LI": "423",
    "LV": "371",
    "TO": "676",
    "LT": "370",
    "LU": "352",
    "LR": "231",
    "LS": "266",
    "TH": "66",
    "TF": "",
    "TG": "228",
    "TD": "235",
    "TC": "+1-649",
    "LY": "218",
    "VA": "379",
    "VC": "+1-784",
    "AE": "971",
    "AD": "376",
    "AG": "+1-268",
    "AF": "93",
    "AI": "+1-264",
    "VI": "+1-340",
    "IS": "354",
    "IR": "98",
    "AM": "374",
    "AL": "355",
    "AO": "244",
    "AQ": "",
    "AS": "+1-684",
    "AR": "54",
    "AU": "61",
    "AT": "43",
    "AW": "297",
    "IN": "91",
    "AX": "+358-18",
    "AZ": "994",
    "IE": "353",
    "ID": "62",
    "UA": "380",
    "QA": "974",
    "MZ": "258"
}
let getCountry = (req, res) => {
    
    err = false
    callback.crudCallback(err, countries, res, 'getCountry')
}
let getCountryCode = (req, res) => {
    let code = countryCode[req.code];
    callback.crudCallback(err, code, res, 'getCountry')
}
/* Get all user Details */
let getAllUser = (req, res) => {
    UserModel.find()
        .select(' -__v -_id ')
        .lean()
        .exec((err, result) => {
            callback.crudCallback(err, result, res, 'getAllUser')
        })
} // end get all users

/* Get single user details */
let getSingleUser = (req, res) => {
    UserModel.findOne({
            'userId': req.params.userId
        })
        .select('-password -__v -_id')
        .lean()
        .exec((err, result) => {
            callback.crudCallback(err, result, res, 'getSingleUser')
        })
} // end get single user

let getUserbyName = (req, res) => {
    UserModel.find().or([{
            'firstName': req.body.firstName,
            'lastName': req.body.lastName
        }, {
            'firstName': req.body.firstName
        }]).select('-password -__v -_id')
        .lean()
        .exec((err, result) => {
            callback.crudCallback(err, result, res, 'getSingleUser')
        })
}

let deleteUser = (req, res) => {

    UserModel.findOneAndRemove({
        'userId': req.params.userId
    }).exec((err, result) => {
        callback.crudCallback(err, result, res, 'deleteUser')
    }); // end user model find and remove


} // end delete user

let editUserName = (req, res) => {
    let options = {
        firstName: req.body.firstName,
        lastName: req.body.lastName
    };
    UserModel.updateOne({
        'userId': req.params.userId
    }, options).exec((err, result) => {
        callback.crudCallback(err, result, res, 'editUser')
    }); // end user model updateOne


} // end edit user

let editAcountactivation = (req, res) => {
    UserModel.updateOne({
        'userId': req.params.userId
    }, {
        active: true
    }).exec((err, result) => {
        callback.crudCallback(err, result, res, 'editAcountactivation')
    })
}

// start user signup function 

let signUpFunction = (req, res) => {

    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email Does not meet the requirement', 400, null)
                    return reject(apiResponse)
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, '"password" parameter is missing"', 400, null)
                    return reject(apiResponse)
                } else {
                    return resolve(req)
                }
            } else {
                logger.error('Field Missing During User Creation', 'userController: createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                return reject(apiResponse)
            }
        })

    } // end validate user input

    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({
                    'email': req.body.email
                })
                .exec((err, retrievedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        return reject(apiResponse)
                    } else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(req.body)
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: (req.body.lastName) ? req.body.lastName : '',
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashpassword(req.body.password),
                            createdOn: time.now(),
                            modifiedOn: time.now(),
                            active: false
                        })

                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                return reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();
                                let subject = 'To activate Issus acount'
                                let text = 'Please click the link to activate the account'
                                let html = `<p><a href='http://localhost:4200/#/verify/${newUserObj.userId}'>Click here to activate your account</a></p>`
                                mailer.messageSend(issue_tracking_mail.web.user, newUserObj.email, subject, text, html)
                                mailer.em.on('mailsend', (data) => {

                                    if (data) {
                                        console.log(data);
                                        return resolve(newUserObj)

                                    } else {
                                        console.log(data);
                                        newUser.deleteOne({
                                            email: req.body.email.toLowerCase()
                                        }, (err) => {
                                            let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                            return reject(apiResponse)
                                        })

                                    }

                                })
                            }

                        })
                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        return reject(apiResponse)
                    }
                })
        })

    } // end create user function


    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created and go to the email to activate your account', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })


} // end user signup function 

// start of login function 
let loginFunction = (req, res) => {

    // check if user exists 
    let findUser = () => {
        console.log("findUser");
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                console.log("req body email is there");
                console.log(req.body);

                UserModel.findOne({
                    'email': req.body.email
                }, (err, userDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        return reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        return reject(apiResponse)
                    } else {
                        logger.info('User Found', 'userController: findUser()', 10)
                        return resolve(userDetails)
                    }
                });


            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                return reject(apiResponse)
            }
        })

    }

    // check if password matches

    let validatePassword = (retrievedUserDetails) => {
        console.log("validatePassword");

        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    return reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    return resolve(retrievedUserDetailsObj)
                } else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    return reject(apiResponse)
                }
            })
        })

    }

    // check if the acount is activated

    let activeStatcheck = (details) => {
        console.log('checking if the acount is active or not');

        return new Promise((resolve, reject) => {
            if (!details.active) {
                logger.error('Acount is not active, please go to respective email address to active this account', 'userController: activeStatcheck()', 10)
                let apiResponse = response.generate(true, 'Acount is not active, please go to respective email address to active this account', 401, null)
                return reject(apiResponse)
            } else if (check.isEmpty(details.active)) {
                logger.error('Acount is not active, undefined active status, please check frontend', 'userController: activeStatcheck()', 10)
                let apiResponse = response.generate(true, 'Acount is not active, undefined active status, please check frontend', 401, null)
                return reject(apiResponse)
            } else {
                logger.info('Acount is active', 'userController: activeStatcheck()', 5)
                return resolve(details)
            }
        })
    }

    // generate token

    let generateToken = (userDetails) => {
        console.log("generate token");
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    return reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    return resolve(tokenDetails)
                }
            })
        })

    }

    // save the token in db

    let saveToken = (tokenDetails) => {
        console.log('saving token details');
        return new Promise((resolve, reject) => {
            authModel.findOne({
                'userId': tokenDetails.userId
            }, (err, retrievedTokenDetails) => {
                if (err) {
                    logger.error(err.message, 'internal server error: saveToken', 10)
                    return reject(response.generate(true, 'failed to generate Token', 500, null))
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let authToken = new authModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })

                    authToken.save((err, newTokenDetails) => {
                        if (err) {
                            logger.error(true, 'userControl: saveToken', 10)
                            return reject(response.generate(true, 'failed to generate Token', 500, null))
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            return resolve(responseBody)

                        }
                    })

                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            return reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            return resolve(responseBody)
                        }
                    })
                }
            })
        })
    }

    // execute the functions

    findUser(req, res)
        .then(validatePassword)
        .then(activeStatcheck)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })

}
let all_fb_auth_models = (req, res) => {
    authModel.find()
        .select(' -__v -_id ')
        .lean()
        .exec((err, result) => {
            callback.crudCallback(err, result, res, 'getAllUser')
        })
}
let fb_auth_login = (req, res) => {

    console.log(res.total)
    res.redirect('http://localhost:4200/#/login')
}

// end of the login function 

let logout = (req, res) => {
    authModel.findOneAndRemove({
        userId: req.user.userId
    }, (err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'user Controller: logout', 10)
            let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
            res.send(apiResponse)
        }
    })
} // end of the logout function.


module.exports = {
    getCountry: getCountry,
    getCountryCode: getCountryCode,
    signUpFunction: signUpFunction,
    getAllUser: getAllUser,
    getUserbyName: getUserbyName,
    editUserName: editUserName,
    deleteUser: deleteUser,
    getSingleUser: getSingleUser,
    loginFunction: loginFunction,
    logout: logout,
    editAcountactivation: editAcountactivation,
    fb_auth_login: fb_auth_login,
    all_fb_auth_models: all_fb_auth_models

} // end exports