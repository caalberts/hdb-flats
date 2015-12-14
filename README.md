# hdb-flats

[![Join the chat at https://gitter.im/caalberts/hdb-flats](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/caalberts/hdb-flats?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Travis Build Status](https://img.shields.io/travis/caalberts/hdb-flats.svg?style=flat-square)](https://travis-ci.org/caalberts/hdb-flats)
[![Gemnasium Status](https://img.shields.io/gemnasium/caalberts/hdb-flats.svg?style=flat-square)](https://gemnasium.com/caalberts/hdb-flats)

A back-end application to process and visualize data on resale prices of public housing (HDB flats) in Singapore, created as part of GA Web Development Immersive course.

The application provides 2 methods of visualizing resale flat prices:

1. Time series showing historical data
2. Heatmap showing data across all locations in Singapore

## Project Approach

The project can be divided into 4 main components:

1. Retrieving and processing data from the source
2. Preparing and storing data into MongoDB database
3. Building an Express server to handle API calls from front end
4. Building front end visualisation using Plotly.js and Google Maps

## Challenges
- Learning data visualisation tool using Plotly.js and Google Maps API

## Contributors
- Thong Yong Jun - @yongjun21
- Albert Salim - @caalberts

## Tools and Frameworks
- [Express](http://expressjs.com/en/index.html)
- [Mongoose](http://mongoosejs.com/)
- [Plotly.js](https://plot.ly/javascript/)
- [Google Maps](https://developers.google.com/maps/)

## Data Source
- [Data.gov.sg - Resale Flat Prices](https://data.gov.sg/dataset/resale-flat-prices)
