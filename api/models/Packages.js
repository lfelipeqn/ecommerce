/**
 * Packages.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    packageName:{type:'string'},
    width:{type:'number'},
    height:{type:'number'},
    length:{type:'number'},
    weight:{type:'number'},
    packageunits:{type:'number', defaultsTo:1},
    variations:{
      collection:'productvariation',
      via:'package'
    },
  },

};

