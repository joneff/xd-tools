const fs = require('fs-extra');
const path = require('path');
const zip = require('adm-zip')

const gulp = require('gulp');
const _template = require('lodash.template');
const _templateContent = fs.readFileSync( 'lib/variables.template', 'utf-8' );
const compiledTemplate = _template( _templateContent );

const distVars = 'dist/_variables.scss';


const xdFilePath = 'xd-files/theme-colors.xd';
const xdRawPath = 'xd-files/dump/theme-colors';
const graphicContentPath = 'xd-files/dump/theme-colors/resources/graphics/graphicContent.agc';

const adobeElementColor = 'application/vnd.adobe.element.color+dcx';

/** @typedef {{ r: Number, g: Number, b: Number }} RGBColor */

gulp.task('vars', (done) => {

    zip( xdFilePath ).extractAllTo( xdRawPath, true);

    const xdMeta = JSON.parse( fs.readFileSync( graphicContentPath, 'utf-8' ) );
    const xdDocumentLibrary = xdMeta.resources.meta.ux.documentLibrary;

    /** @type {Array} */
    const themeColors = xdDocumentLibrary.elements.filter( item => {
        return item.type = adobeElementColor;
    });

    const templateData = {};

    themeColors.forEach( entry => {
        /** @type {String} */
        const colorName = entry.name;
        /** @type {RGBColor} */
        const rgbColor = entry.representations[0].content.value;

        templateData[colorName] = `rgb( ${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`;
    });

    const variablesContent = compiledTemplate( templateData );

    [distVars].forEach(file => {
        fs.ensureFileSync( file );
        fs.writeFileSync( file, variablesContent );
    });

    done();
});

gulp.task('vars:watch', (done) => {
    gulp.task('vars')(done);
    gulp.watch( xdFilePath , gulp.series('vars'));
});