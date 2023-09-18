const productsDom = document.querySelector(".products-center");
const cartItems = document.querySelector(".cart-items");
const cartBtn = document.querySelector(".cart-btn");
const backDrop=document.querySelector(".backdrop");
const cartModal=document.querySelector(".cart");
const closeModal=document.querySelector(".cart-item-confirm")
const cartTotal=document.querySelector(".cart-total")
const cartContent=document.querySelector(".cart-content")
const clearCart=document.querySelector(".clear-cart")

import { productsData } from "./products.js";

let cart = [];
let buttons=[];

class Products {
    getProducts() {
        return productsData;
    }
};

class UI {

    setupApp() {
        cart = Storage.getCartInf();
        this.setCartValue(cart);
       // console.log(cart);
        cart.forEach(item=>{
            this.addModalItems(item);
        });
    }

    displayProducts(products) {
        let result = "";
        products.forEach((p) => {
            result += `<div class="products-items">
        <img class="product-img" src=${p.imageUrl} />

       <div class="product-desc">
               <p>${p.title}</p>
               <p>$ ${p.price}</p>
       </div>  
       <button class="btn add-to-cart" data-id=${p.id}>
       add to cart
       </button>  
    </div>`
            productsDom.innerHTML = result;
        });
    };

    getAddToCartBtns() {
        const addTocartBtns = document.querySelectorAll(".add-to-cart");
        buttons = [...addTocartBtns];

        //خوندن اطلاعات کارت از لوکال استوریج

        buttons.forEach((btn) => {

            const id = btn.dataset.id;
            //console.log(id);
            const isInCart = cart.find((item) => parseInt(item.id) === parseInt(id));
            //cart.find((item) => console.log(item.id===parseInt(id)));
            //console.log(isInCart);

            if (isInCart) {
                btn.innerText = 'In Cart';
                btn.disabled = true;
            }

            //   حالا اونایی که توی سبد خرید نیستن موقع لود صفحه
            btn.addEventListener("click", (event) => {
                event.target.innerText = 'In Cart';
                event.target.disabled = true;

                const addedProduct = {...Storage.getProduct(id), quantity: 1};
                
                cart = [...cart, addedProduct];
                
                //cart.push(addedProduct);
                Storage.saveCart(cart);
                this.setCartValue(cart);
                this.addModalItems(addedProduct);
            });
        });
    }

    setCartValue(cart) {
        let sum=0;
        const totalPrice=cart.reduce((acc, curr) => {
            //تعداد کل
        sum=sum + curr.quantity;
            // قیمت کل
        return acc + curr.quantity * curr.price;},0);
        //console.log(acc);
        //console.log(sum);
        cartItems.innerText=sum;
        cartTotal.innerText=`Total Price: ${parseFloat(totalPrice).toFixed(2)} $`;
};

    addModalItems(item){

            const div=document.createElement("div");
            div.classList.add("cart-item");

            div.innerHTML=`
            
            <img class="cart-item-img" src="${item.imageUrl}" />

            <div class="cart-item-desc">
                <h4>${item.title}</h4>
                <h5>$ ${item.price}</h5>
            </div>

            <div class="cart-item-controller">
                <i class="fas fa-chevron-up" data-id=${item.id} ></i>
                <p>${item.quantity}</p>
                <i class="fas fa-chevron-down" data-id=${item.id} ></i>
            </div>
                <i class="fa fa-trash" aria-hidden="true"  data-id=${item.id} ></i>`
            
            cartContent.appendChild(div);
        }
    
    cartLogic(){

        clearCart.addEventListener("click", () =>{
            cart.forEach((cItem)=> 
            {
                this.removeItem(cItem.id);
                while (cartContent.children.length){
                cartContent.removeChild(cartContent.children[0]);
                }
                closeModalFunction();
                //this.updateBtns(cItem.id);
                
            });
    })

    cartContent.addEventListener("click",event=>{

        if (event.target.classList.contains("fa-chevron-up"))
        {
            const addQuantity=event.target;
            const chevronUpId=addQuantity.dataset.id;
      
            const addedItem=cart.find((c)=>c.id==chevronUpId);

            addedItem.quantity++;
            //console.log(addedItem.quantity);

            addQuantity.nextElementSibling.innerText=addedItem.quantity;
      
            Storage.saveCart(cart);
            this.setCartValue(cart);
      
        }

        else if (event.target.classList.contains("fa-chevron-down"))
        {
            //فلش پایینه کدوم محصول کلیک شد
            const chevronDownId=event.target.dataset.id;
            //محصول پیدا شد
            const subItem=cart.find((c)=>c.id==chevronDownId);

            const subQuantity=event.target;

            //از تعداد اون محصولِ پیدا شده، یکی کم شد
            subItem.quantity--;

            if (subItem.quantity<1){
                this.removeItem(subItem.id);
                cartContent.removeChild(event.target.parentElement.parentElement);
                
            }

            //مقادیر جدیدِ کارت ذخیره شد
            Storage.saveCart(cart);
            this.setCartValue(cart);

            //تغییرِ دام
            subQuantity.previousElementSibling.innerText=subItem.quantity;
        }
        
        else if (event.target.classList.contains("fa-trash"))
        {

            const trashItem=event.target;
            const trashId=trashItem.dataset.id;
            //console.log(trashId);
            this.removeItem(trashId);

            //console.log(trashItem.parentElement);
            cartContent.removeChild(trashItem.parentElement);

        }

        })
};

    removeItem(id){
        //کدوم محصول میخواد حذف بشه؟
        //محصولی که آیدیش با آیدیه سطل آشعال برابر باشه
        cart=cart.filter((cItem)=>cItem.id!=id);
        console.log(cart);
        this.setCartValue(cart);
        Storage.saveCart(cart);

        const btn=buttons.find(item=>parseInt(item.dataset.id)===parseInt(id));
            
                btn.innerText='add to Cart'
                btn.disabled=false;
    }
};


class Storage {

    saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        const _products = JSON.parse(localStorage.getItem("products"));
        return _products.find((p) => p.id === parseInt(id));
    }

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCartInf() {
        return localStorage.getItem("cart") ?
            JSON.parse(localStorage.getItem("cart")) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {

    // console.log("loaded");
    const products = new Products();
    const productsData = products.getProducts();
    //console.log(productsData);

    const ui = new UI();
    ui.setupApp();
    ui.displayProducts(productsData);
    ui.getAddToCartBtns();
    ui.cartLogic();
    
    const storage = new (Storage);
    storage.saveProducts(productsData);

});



function showModalFunction(){
    backDrop.style.display="block";
    cartModal.style.display="block";
}

function closeModalFunction(){
    backDrop.style.display="none";
    cartModal.style.display="none";
}



cartBtn.addEventListener("click",showModalFunction);
closeModal.addEventListener("click",closeModalFunction);



