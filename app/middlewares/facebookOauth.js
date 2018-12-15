const passport = require('passport');
const facebbokStratagey = require('passport-facebook');
const mongoose = require('mongoose');
const token = require('../libs/tokenLib')
const logger = require('./../libs/loggerLib');
const check = require('../libs/checkLib')
const passwordLib = require('./../libs/generatePasswordLib');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
/* Models */

const UserModel = mongoose.model('User_1')
const authModel = mongoose.model('Auth');

var fb_app_id = '1927796927306649';
var fb_app_secret = 'fe0682575af65b0820658729540b64ae';
var fb_options = {
    clientID: '1927796927306649',
    clientSecret: 'fe0682575af65b0820658729540b64ae',
    callbackURL: 'https://localhost:3000/api/v1/users/auth/facebook/callback',
    profileFields: ['first_name', 'last_name', 'picture', 'email']
}

function fb_callback(accessToken, refreshToken, profile, done) {
    try {
        let total = {
            accessToken: accessToken,
            refreshToken: refreshToken,
            profile: profile
        }
        console.log(total)
        console.log(profile._json.picture.data.url)
        

    } catch (err) {
        console.log(err);
        process.nextTick(function (){ done(err, null)})

    }

    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({
                    'email': profile._json.email
                })
                .exec((err, retrievedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        return reject(apiResponse)
                    } else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(profile._json)
                        let newUser = new UserModel({
                            userId: profile._json.id,
                            firstName: profile._json.first_name,
                            lastName: profile._json.last_name || '',
                            email: profile._json.email.toLowerCase(),
                            mobileNumber: 00000,
                            password: passwordLib.hashpassword(profile._json.id),
                            createdOn: time.now(),
                            modifiedOn: time.now(),
                            active: true
                        })

                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                return reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();
                                return resolve(newUserObj.userId)
                            }

                        })
                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        return resolve(profile._json.id)
                    }
                })
        })

    } // end create user function

    // Get user details 
    let getUser = (userId) => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({
                    'userId': userId
                })
                .select('-password -__v -_id')
                .lean()
                .exec((err, userDetails) => {
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
                })
        })
    } // end get single user


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

// saving token
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

    createUser()
    .then(getUser)
    .then(generateToken)
    .then(saveToken)
    .then((resolve) => {
        let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
        process.nextTick(function (){done(null, apiResponse)})
    })
    .catch((err) => {
        console.log("errorhandler");
        process.nextTick(function (){done(err, null)})
    })



}

passport.use(new facebbokStratagey(fb_options, fb_callback));




module.exports = {
    fbauth_callback: passport.authenticate('facebook', {
        scope: ['first_name', 'last_name', 'picture', 'email']
    },(err, apiResponse)=> {
        if(!err){console.log(apiResponse)
        
        
        } else {console.log(err)}
        
    }),
    fbauth: passport.authenticate('facebook', {
        scope: ['email']
    })
}