module.exports = {
  friendlyName: 'Orders by Id',
  description: 'Orders by Id Linio mexico.',
  inputs: {
    integration : {
      type:'string',
      required:true,
    },
    seller:{
      type:'string',
      required:true
    },
    params:{
      type:'ref',
      required:true
    }
  },
  exits: {
    success: {
      description: 'All done.',
    },
  },
  fn: async function (inputs,exits) {
    let moment = require('moment');
    let integration = await Integrations.findOne({id : inputs.integration}).populate('channel');
    let sign = await sails.helpers.channel.liniomx.sign(integration.id, 'GetOrder',inputs.seller, inputs.params);
    let profile = await Profile.findOne({name:'customer'});
    let data;
    await sails.helpers.request(integration.channel.endpoint,'/?'+sign,'GET')
      .then(async (response)=>{
        let result = await JSON.parse(response);
        let orders = {
          Order:[]
        };
        orders['Order'].push(result.SuccessResponse.Body.Orders.Order);
        for(let order of orders.Order){
          let oexists = await Order.findOne({channel:'liniomx',channelref:order.OrderId,seller:inputs.seller});
          data = {channel: 'liniomx', channelref: order.OrderId, seller: inputs.seller};
          if(order.Statuses.Status==='pending'){
            let city = await City.find({name:(order.AddressShipping.City.split(','))[0].toLowerCase().trim()}).populate('region');
            if(city.length>0 && oexists===undefined){
              let userEmail = order.AddressBilling.CustomerEmail ? order.AddressBilling.CustomerEmail : ((order.AddressBilling.FirstName+order.AddressBilling.LastName).replace(/\s/g,''))+'@linio.com.mx';
              let user = await User.findOrCreate({emailAddress:userEmail},{
                emailAddress:order.AddressBilling.CustomerEmail !=='' ? order.AddressBilling.CustomerEmail : ((order.AddressBilling.FirstName+order.AddressBilling.LastName).replace(/\s/g,''))+'@linio.com.mx',
                emailStatus:'confirmed',
                password:await sails.helpers.passwords.hashPassword(order.NationalRegistrationNumber),
                fullName:order.CustomerFirstName+' '+order.CustomerLastName,
                dniType:'CC',
                dni:order.NationalRegistrationNumber ? order.NationalRegistrationNumber.replace(/\./gi,'') : '',
                mobilecountry:city[0].region.country,
                mobile:order.AddressShipping.Phone2 ? parseInt(order.AddressShipping.Phone2) : 0,
                mobileStatus:'unconfirmed',
                profile:profile.id
              });

              let address = await Address.findOrCreate({addressline1:order.AddressShipping.Address1.toLowerCase().trim()},{
                name:order.AddressShipping.Address1.trim().toLowerCase(),
                addressline1:order.AddressShipping.Address1.trim().toLowerCase(),
                addressline2:order.AddressShipping.Address2 ? order.AddressShipping.Address2.trim().toLowerCase() : '',
                country:city[0].region.country,
                region:city[0].region.id,
                city:city[0].id,
                notes:order.DeliveryInfo ? order.DeliveryInfo : '',
                zipcode:order.AddressShipping.PostCode ? order.AddressShipping.PostCode : '',
                user:user.id,
              });
              let payment = {
                data:{
                  estado:'Aceptada',
                  channel:'liniomx',
                  channelref:order.OrderId,
                  integration:integration.id
                }
              };
              payment.data['ref_payco'] = order.OrderNumber;
              let cart = await Cart.create().fetch();
              let itemsign = await sails.helpers.channel.liniomx.sign(integration.id, 'GetOrderItems',inputs.seller,['OrderId='+order.OrderId]);
              await sails.helpers.request(integration.channel.endpoint,'/?'+itemsign,'GET')
                .then(async (result)=>{
                  let rs = JSON.parse(result);
                  let items = {
                    OrderItem:[]
                  };

                  if(rs.SuccessResponse.Body.OrderItems.OrderItem.length>1){
                    items = rs.SuccessResponse.Body.OrderItems;
                  }else{
                    items['OrderItem'].push(rs.SuccessResponse.Body.OrderItems.OrderItem);
                  }
                  for(let item of items.OrderItem){
                    let productvariation = await ProductVariation.find({or : [
                      { id:item.Sku },
                      { reference: item.Sku }
                    ]})
                    .catch(err=>{
                      console.log(err.message);
                    });
                    if(productvariation){
                      await CartProduct.create({
                        cart:cart.id,
                        product:productvariation[0].product,
                        productvariation:productvariation[0].id,
                        totalDiscount:(parseFloat(item.ItemPrice)-parseFloat(item.PaidPrice)),
                        totalPrice:parseFloat(item.ItemPrice),
                        externalReference:item.OrderItemId
                      });
                    }
                  }
                  if((await CartProduct.count({cart:cart.id}))>0){
                    let corders = await sails.helpers.order({address:address,user:user,cart:cart,method:order.PaymentMethod,payment:payment,carrier:'servientrega'});
                    await Order.updateOne({id:corders[0].id}).set({createdAt:parseInt(moment(order.CreatedAt).valueOf())});
                  }
                });
            }
          }else{
            if(oexists!==undefined){
              let currentStatus = await sails.helpers.orderState(order.Statuses.Status);
              await sails.helpers.notification(oexists, currentStatus);
              await Order.updateOne({id:oexists.id}).set({updatedAt:parseInt(moment(order.UpdatedAt).valueOf()),currentstatus:currentStatus});
              await OrderHistory.create({
                order:oexists.id,
                state:currentStatus
              });
            }
          }
        }
      }).catch((e)=>console.log('error', e));
    return exits.success(data);
  }
};
