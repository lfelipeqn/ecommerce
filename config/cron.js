module.exports.cron = {
  // ['seconds', 'minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek']
  trackingCoordinadora: {
    schedule: '02 12 */3 * * *',
    onTick: async () => {
      console.log('Iniciando Rastreo de Pedidos');
      let moment = require('moment');
      let statesIds = [];
      let packed= await OrderState.find({
        where:{name:['empacado','enviado','pendiente']},
        select:['id']
      });
      for(let s of packed){if(!statesIds.includes(s.id)){statesIds.push(s.id);}}
      let orders = await Order.find({
        where:{currentstatus:statesIds,channel:['direct','mercadolibre'],tracking:{'!=':''}},
        select:['id','tracking','seller','channel', 'transport', 'shippingMeli', 'receiverId', 'modeMeli']
      }).populate('currentstatus');
      for(let order of orders){
        if (order.channel === 'direct' || (order.channel === 'mercadolibre' && order.transport === 'coordinadora')) {
          let result = await sails.helpers.carrier.coordinadora.tracking(order.tracking);
          if(result){
            let stateupdated = parseInt(moment(result.estado.fecha+' '+result.estado.hora).valueOf());
            let newstatus = await sails.helpers.orderState(result.estado.codigo);
            await sails.helpers.notification(order, newstatus);
            if(newstatus!==order.currentstatus.id){
              await Order.updateOne({id:order.id}).set({currentstatus:newstatus,updatedAt:stateupdated});
              let oitems = await OrderItem.find({order:order.id});
              for(let it of oitems){
                await OrderItem.updateOne({id: it.id}).set({currentstatus: newstatus});
              }
              await OrderHistory.create({
                order:order.id,
                state:newstatus
              });
              if (order.modeMeli === 'custom') {
                const payment = {
                  shipping: order.shippingMeli,
                  status: newstatus,
                  mode: 'custom',
                  receiverId: order.receiverId,
                  tracking: order.tracking
                };
                await sails.helpers.channel.mercadolibre.updateShipment(order.integration, payment);
              } else if (order.modeMeli === 'me1') {
                const payment = {
                  shipping: order.shippingMeli,
                  status: newstatus,
                  mode: 'me1',
                  receiverId: order.receiverId,
                  tracking: order.tracking
                };
                await sails.helpers.channel.mercadolibre.updateShipment(order.integration, payment);
              }
            }
          }
        }
      }
      console.log('Finalizada Rastreo');
    },
    timezone: 'America/Bogota'
  },
};
