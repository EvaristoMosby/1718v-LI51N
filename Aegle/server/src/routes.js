'use strict'

/**
 * Module that contains the main set of routes.
 * @module routes
 */

/**
 * Module dependencies.
 * @private
 */
const express = require('express')
const model = require('./datatypes')
const patientsRoutes = require('./routes_patient')
const statusRoutes = require('./routes_status')

/**
 * Creates an express application instance and initiates it with the set of supported routes.
 * @param {patients_repo.PatientsRepo} - The repository instance to be used
 * @param {string} - The application's root directory
 * @return {express.Application} - The newly created application
 */
module.exports = exports = function(patientsRepository, root) {
    
    const app = express()
    const path = require('path')
    const hbs = require('hbs')
    const methodOverride = require('method-override')

    app.set('view engine', 'hbs')
    app.set('views', path.join(__dirname, './views'))
    hbs.registerHelper('equals', (theOne, theOther) => theOne === theOther)
    hbs.registerHelper('and', (theOne, theOther) => theOne && theOther)
    hbs.registerPartials(__dirname + '/views/partials')

    app.use((req, res, next) => {
        const oldEnd = res.end
        res.end = function (...args) { 
            console.log(`Serviced ${req.method} ${req.originalUrl} with status code ${res.statusCode}`)
            return oldEnd.call(this, ...args) 
        }
        next()
    })
     
    app.use('/aegle', express.static(path.join(root, 'static')))
    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())

    app.use(methodOverride('_method'))

    const loginRoute = '/aegle/login'
    
    app.use('/aegle/patients', patientsRoutes(patientsRepository, express, loginRoute))
    app.use('/aegle', statusRoutes(patientsRepository, express, loginRoute))

    app.get('/aegle/home', (req, res) => { 
        res.render('home.hbs', { menuState: { home: "active", loginRoute } } ) 
    })

    app.get('/aegle/patient/new.hbs', (req, res) => { 
        res.render('patientNew.hbs', { menuState: { loginRoute } } )
    })

    app.get(loginRoute, (req, res) => { 
        res.render('login.hbs', { menuState: { loginRoute }, action: loginRoute }) 
    })

    return app
}
