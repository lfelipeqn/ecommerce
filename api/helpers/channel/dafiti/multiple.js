module.exports = {
  friendlyName: 'Multiple',
  description: 'Multiple dafiti.',
  inputs: {
    seller:{
      type:'string',
      required:true,
    },
    action:{
      type:'string',
      required:true,
    }
  },
  exits: {
    success: {
      description: 'All done.',
    },
  },
  fn: async function (inputs,exits) {
    var jsonxml = require('jsontoxml');
    let moment = require('moment');
    let status='active';
    let dafiti =false;
    let body={Request:[]};
    let products = null;
    let productvariation = null; 
    if(inputs.action==='ProductUpdate' || inputs.action==='Image'){dafiti=true;}
    if(inputs.action==='ProductCreate' || inputs.action==='ProductUpdate'){
      products = await Product.find({seller:inputs.seller,dafiti:dafiti})
      .populate('gender')
      .populate('mainColor')
      .populate('manufacturer')
      .populate('mainCategory')
      .populate('categories')
      .populate('discount',{
        where:{
          to:{'>=':moment().valueOf()},
          from:{'<=':moment().valueOf()}
        },
        sort: 'createdAt DESC',
        limit: 1
      });
      if(products.length>0){
        for(let product of products){
          productvariation = await ProductVariation.find({product:product.id})
          .populate('variation');
          if(productvariation.length>0){
            let parent = productvariation[0].id;
            let categories = [];
            for (let c of product.categories){
              let cd = c.dafiti.split(',');
              for(let dd of cd){
                if(!categories.includes(dd)){
                  categories.push(dd);
                }
              }
            }
            let i = 0;
            for(let pv of productvariation){
              let data={
                Product:{
                  SellerSku:pv.id,
                  Status:status,
                  Name:product.name,
                  PrimaryCategory:product.mainCategory.dafiti.split(',')[0],
                  Categories:categories.join(','),
                  Description: jsonxml.cdata(product.descriptionShort+' '+product.description),
                  Brand:product.manufacturer.name,
                  Condition:'new',
                  Variation:pv.variation.col.replace(/\.5/,'½').toString(),
                  Price:(pv.price*(1+product.dafitiprice)).toFixed(2),
                  Quantity:pv.quantity,
                  ProductData:{
                    Gender:product.gender.name,
                    ColorNameBrand:product.mainColor.name,
                    ColorFamily:product.mainColor.name,
                    Color:product.mainColor.name,
                  }
                }
              };
              if(i>0 && productvariation.length>1){
                data.Product.ParentSku=parent;
              }

              if(product.discount.length>0){
                let discPrice=0;
                switch(product.discount[0].type){
                  case 'P':
                    discPrice+=((pv.price*(1+product.dafitiprice))*(1-(product.discount[0].value/100)));
                    break;
                  case 'C':
                    discPrice+=((pv.price*(1+product.dafitiprice))-product.discount[0].value);
                    break;
                }
                data.Product.SalePrice=discPrice.toFixed(2);
                data.Product.SaleStartDate=moment(product.discount[0].from).format();
                data.Product.SaleEndDate=moment(product.discount[0].to).format();
              }
              i++;
              body.Request.push(data);
            }
          }
        };
      }
    }
    if(inputs.action==='Image'){
      products = await Product.find({seller:inputs.seller,dafiti:dafiti});
      if(products.length>0){
        for(let product of products){
          //Imagenes
          let ilist = {Images:[]};
          let images = await ProductImage.find({product:product.id}).sort('position ASC');
          if(images.length>0){
            for(let i of images){
              ilist.Images.push({Image:await sails.config.views.locals.imgurl+'/images/products/'+product.id+'/'+i.file});
            }
            let productvariation = await ProductVariation.find({product:product.id});
            if(productvariation.length>0){
              for(let pv of productvariation){
                let img = {
                  ProductImage:{
                    SellerSku:pv.id,
                    Images:ilist.Images
                  }
                };
                body.Request.push(img);
              };
            }
          }
        };
      }
    }
    try{
      var xml = jsonxml(body,true);
      let sign = await sails.helpers.channel.dafiti.sign(inputs.action,inputs.seller);
      let response = await sails.helpers.request('https://sellercenter-api.dafiti.com.co','/?'+sign,'POST',xml);
      //let result = JSON.parse(response);
      return exits.success(response);
    }catch(err){
      return exits.error(err);
    }
  }


};
