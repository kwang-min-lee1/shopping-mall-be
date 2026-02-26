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


cartController.deleteCartItem = async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.params; // cart item _id

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(200).json({ status: "success", data: [], cartItemQty: 0 });
    }

    // items 배열에서 해당 item _id 제거
    const before = cart.items.length;
    cart.items = cart.items.filter((item) => item._id.toString() !== id);

    // 혹시 이미 삭제된 id면 그대로 반환
    if (cart.items.length === before) {
      return res.status(200).json({
        status: "success",
        data: cart.items,
        cartItemQty: cart.items.length,
      });
    }

    await cart.save();

    return res.status(200).json({
      status: "success",
      data: cart.items,
      cartItemQty: cart.items.length,
    });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.updateQty = async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.params;        // cart item _id
    const { qty } = req.body;

    // qty 유효성 (프론트에서 string으로 올 수도 있음)
    const newQty = Number(qty);
    if (!newQty || newQty < 1) {
      throw new Error("수량은 1 이상이어야 합니다.");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("카트를 찾을 수 없습니다.");

    const item = cart.items.id(id);   // ✅ subdocument 찾기 (items 배열의 _id)
    if (!item) throw new Error("카트 아이템을 찾을 수 없습니다.");

    item.qty = newQty;
    await cart.save();

    // 프론트가 바로 렌더 가능하게 populate해서 내려주기(안해도 되지만 안정적)
    const updatedCart = await Cart.findOne({ userId }).populate("items.productId");

    return res.status(200).json({
      status: "success",
      data: updatedCart.items,
      cartItemQty: updatedCart.items.length,
    });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCartQty = async (req,res) => {
    try{
        const {userId} =req;
        const cart = await Cart.findOne({userId:userId});
        if(!cart) throw new Error("There is no cart!");
        res.status(200).json({status:200, qty:cart.items.length});

    }catch(error){
        return res.status(400).json({status:"fail", error:error.message});
    }
};

module.exports = cartController;