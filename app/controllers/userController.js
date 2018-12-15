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

const UserModel = mongoose.model('User_1')
const authModel = mongoose.model('Auth')

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
                            lastName: req.body.lastName || '',
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