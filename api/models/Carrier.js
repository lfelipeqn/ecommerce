/**
 * Carrier.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name:{
      type:'string',
      required:true,
      unique:true,
    },
    logo:{type:'string',},
    url:{type:'string',},
    active:{
      type:'boolean',
      required:true
    }

  },

};

