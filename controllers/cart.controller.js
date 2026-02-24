const Cart = require("../models/Cart");

const cartController = {};


cartController.addItemToCart = async(req,res) => {
    try{
        const {userId} = req;
        const {productId,size,qty} = req.body;
        const normalizedSize = String(size).trim().toLowerCase();
        // 유저를 가지고 가트 찾기
        let cart = await Cart.findOne({userId});   // {userId:userId} -> {userId}
        // 유저가 만든 카드가 없다 -> 새로운 카트 만들어주기
        if(!cart) {
            cart = new Cart({userId});
            await cart.save();
        }

        if (!cart.items) cart.items = [];   // ✅ 추가

        // 이미 카트에 들어가 있는 아이템이냐? productId, size 둘다 체크
        const existItem = cart.items.find(
            (item)=> item.productId?.equals(productId) && item.size === normalizedSize
        );

        // 그렇다면 에러('이미 아이템이 카트에 있습니다.')
        if(existItem){
            throw new Error("아이템이 이미 카트에 담겨 있습니다.");
        }
        // 카트에 아이템을 추가
        cart.items = [...cart.items, {productId,size:normalizedSize,qty}];
        await cart.save();

        res.status(200).json({status:'success',data:cart,cartItemQty:cart.items.length});

    }catch(error){
        return res.status(400).json({status:"fail", error:error.message});
    }
}

cartController.getCart=async(req,res)=>{
    try{
        const {userId} = req;
        const cart = await Cart.findOne({ userId }).populate("items.productId");
        // const cart = await Cart.findOne({userId}).populate({
        //     path:"items",
        //     populate: {
        //         path: "productId",
        //         model: "Product",
        //     },
        // });
        return res.status(200).json({status:"success",data:cart ? cart.items:[],});
    }catch(error){
        return res.status(400).json({status:"fail",error:error.message});
    }
}

module.exports = cartController;