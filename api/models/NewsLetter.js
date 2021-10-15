/**
 * NewsLetter.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    emailAddress:{
      type:'string',
      isEmail:true,
      required:true,
      unique:true
    },
    location:{
      type:'string',
      required:true
    }

  },

};

