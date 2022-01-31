import { useState, useEffect } from 'react'
const fs = window.require( 'fs' )
const { app } = window.require( '@electron/remote' )

export async function iniciar () {
    const defaults = { proxy: false, dhcp: true }

    fs.readFile( jsonPath(), 'utf8', ( err, dados ) => {
        if ( err ) createLog( `Impossível obter dados iniciais -> ${ err }` )
        if ( err ) return defaults
        return JSON.parse( dados )
    } )
}

export function createLog ( log ) {
    fs.writeFile( logsPath() + `${ new Date().getTime() }.txt`, String( log ), err => {
        if ( err ) console.log( err )
    } )
}

function jsonPath () {
    return `${ app.getAppPath() }/settings.json`
}

function logsPath () {
    return `${ app.getAppPath() }/logs/`
}