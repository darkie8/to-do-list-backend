const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
// const uploadcontroller = require('./../controllers/uploadingfilecontroller')
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
// const fb_oauth = require('./../middlewares/facebookOauth');

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}/users`;
    app.get(`${baseUrl}/allcountry`, userController.getCountry)
    app.post(`${baseUrl}/countrycode`, userController.getCountryCode)
    app.get(`${baseUrl}/all`, userController.getAllUser)
    app.get(`${baseUrl}/:userId/singleUser`,auth.isAuthenticated, userController.getSingleUser)
    app.get(`${baseUrl}/singleUser`,auth.isAuthenticated, userController.getUserbyName)
    app.post(`${baseUrl}/signup`, userController.signUpFunction);
    app.post(`${baseUrl}/login`, userController.loginFunction);
    app.put(`${baseUrl}/:userId/verify`, userController.editAcountactivation);
    app.post(`${baseUrl}/:userId/delete`, userController.deleteUser);
    app.post(`${baseUrl}/logout`, auth.isAuthenticated, userController.logout);
   // app.get(`${baseUrl}/auth/facebook`, fb_oauth.fbauth,(req,res)=>{})
   // app.get(`${baseUrl}/auth/facebook/callback`, fb_oauth.fbauth_callback, userController.fb_auth_login),
    app.get(`${baseUrl}/allauth`, userController.all_fb_auth_models)
    
}