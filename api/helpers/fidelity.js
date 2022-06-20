
module.exports = {
  friendlyName: 'Fidelity',
  description: 'Fidelity something.',
  inputs: {
    order:{type:'string',required:true}
  },
  exits: {
    success: {
      description: 'All done.',
    },
  },
  fn: async (inputs) => {
    let order = await Order.findOne({id:inputs.order})
    .populate('customer')
    .populate('currentstatus');

    let orderdetail = await OrderItem.find({order:order.id});
    let quantity = 0;
    for(let item of orderdetail){
      let variation = await ProductVariation.findOne({id:item.productvariation}).populate('variation');
      quantity+= variation.variation.packageunits ? variation.variation.packageunits : 1;
    }

    let fidelity = null;
    let transaction = {
      order:order.id,
      status:order.currentstatus.id,
      pointvalue:500
    };
    points = quantity*2;
    let userfilter = [{id:order.customer.id}];
    if(order.customer.referred){
      userfilter[1]={referred:order.customer.referred};
    }

    let users = await User.find({
      where:{or:userfilter}
    });

    if(users.lenght>1){
      points = points/2;
    }
    switch(order.currentstatus.name){
      case 'aceptado':
        for(let user of users){
          if(user.id === order.customer.id){
            transaction.concept='Acumulación por compra efectiva';
            transaction.user=order.customer.id;
          }else{
            transaction.concept='Acumulación por referido';
            transaction.user=user.id;
          }
          transaction.points = points;
          fidelity = await Fidelity.findOne({order:order.id,status:order.currentstatus.id,user:user.id});
          if(!fidelity){
            await Fidelity.create(transaction);
          }else{
            await Fidelity.update({id:fidelity.id}).set(transaction);
          }
        }
        break;
      case 'cancelado':
        await Fidelity.destroy({order:order.id});
        break;
    }
  }

};

