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

/**
 * Creates an express application instance and initiates it with the set of supported routes.
 * @param {patients_repo.PatientsRepo} - The repository instance to be used
 * @return {express.Application} - The newly created application
 */
module.exports = exports = function(patientsRepository) {
    
    const app = express()

    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())

    app.use((req, res, next) => {
        const oldEnd = res.end
        res.end = function (...args) { 
            console.log(`Serviced ${req.method} ${req.originalUrl} with status code ${res.statusCode}`)
            return oldEnd.call(this, ...args) 
        }
        next()
    })
     
    app.get('/patients', (req, res) => {
        patientsRepository.getPatients((err, data) => {
            if (err) throw err
            res.json(data)
        })
    })

    app.get('/patients/:id', (req, res, next) => {
        patientsRepository.getPatient(req.params.id, (err, data) => {
            if (err) throw err
            if (!data) next()
            else res.json(data)
        })
    })

    app.put('/patients/:id', (req, res) => {
        const patientInfo = req.body
        if (!patientInfo || Number.isNaN(Number(patientInfo.heartRate)))
            return res.sendStatus(400)

        const patient = new model.Patient(req.params.id, Number(patientInfo.heartRate), patientInfo.name)
        patientsRepository.updatePatient(patient, (err) => {
            if (err) throw err
            res.end()
        })
    })

    app.get('/status', (req, res) => {
        patientsRepository.getPatientsStatus((err, data) => {
            if (err) throw err
            res.json(data)
        })
    })

    app.post('/patients/:id/events', (req, res) => {
        patientsRepository.registerEvent(new model.Event('Heartbeat', req.params.id), (err) => {
            if (err) throw err
            res.end()
        })
    })

    return app
}
