/**
 * Question.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    idMl: {type:'string'},
    seller: {model:'seller'},
    text: {type:'string'},
    status: {type:'string'},
    dateCreated: {type:'number'},
    product: {model:'product'},
    conversation: {model:'conversation'},
    answer: {model:'answer'},
    integration:{ model:'integrations' },
    attachments:{
      collection:'attachment',
      via:'question'
    }
  },
};
