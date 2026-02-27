const orderController = {};
const Order = require("../models/Order");
const { randomStringGenerator} = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

orderController.createOrder = async(req,res)=>{
    try{
        // 프론트엔드에서 데이터 보낸거 받아와, userId, totalPrice, shipTo, contact, orderList
        const {userId} = req;
        const {shipTo, contact, totalPrice, orderList} = req.body;
        // 재고 확인 & 재고 업데이트
        const insufficientStockItems = await productController.checkItemListStock(orderList);

        // 재고가 충분하지 않는 아이템이 있었다. => 에러
        if(insufficientStockItems.length >0) {
            const errorMessage = insufficientStockItems.reduce(
                (total,item) => total+=item.message,
                ""
            );
            throw new Error(errorMessage);
        }
    
        // order를 만들자!
        const newOrder = new Order({
            userId,
            totalPrice,
            shipTo,
            contact,
            items: orderList,
            orderNum: randomStringGenerator()
        });

        await newOrder.save();
        // save 후에 카트를 비워주자
        res.status(200).json({status:'success', orderNum: newOrder.orderNum});

    }catch(error){
        return res.status(400).json({ status:"fail", error: error.message});
    }
};

const PAGE_SIZE = 10;

orderController.getOrder = async (req,res) => {
    try{
        const {userId} = req;

        const orderList = await Order.find({userId:userId}).populate({
            path:"items",
            populate:{
                path:"productId",
                model: "Product",
                select: "image name",
            },
        })
        .sort({ createdAt: -1 });

        // ✅ count() -> countDocuments()
        const totalItemNum = await Order.countDocuments({ userId: userId });
        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
        return res.status(200).json({status:"success", data:orderList, totalPageNum});
    }catch(error){
        return res.status(400).json({status:"fail", error:error.message});
    }
};


orderController.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) throw new Error("order not found");

    return res.status(200).json({ status: "success", order });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};



module.exports = orderController;