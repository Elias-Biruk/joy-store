(() => {
  "use strict";
  const PRODUCT_KEY = "joy_demo_products_v1";
  const ORDER_KEY = "joy_demo_orders_v1";
  const CART_KEY = "joy_demo_cart_v1";
  const defaultProducts = [
    {id:"honey-1",name:"Pure Ethiopian Honey",category:"Honey",price:1200,stock:100,icon:"🍯",description:"Golden sweetness. Ask us for batch and sourcing details.",active:true},
    {id:"coffee-1",name:"Premium Ethiopian Coffee",category:"Coffee",price:2600,stock:50,icon:"☕",description:"A fragrant everyday coffee for your brewing ritual.",active:true},
    {id:"butter-1",name:"Traditional Butter",category:"Butter",price:1800,stock:10,icon:"🧈",description:"Traditional-style butter. Confirm storage and availability.",active:true},
    {id:"teff-1",name:"Teff Grain",category:"Teff",price:160,stock:200,icon:"🌾",description:"A staple grain for your Ethiopian kitchen.",active:true},
    {id:"jewelry-1",name:"Everyday Jewelry",category:"Jewelry",price:0,stock:0,icon:"💎",description:"Ask us for available designs and current prices.",active:true},
    {id:"phone-1",name:"Android Smartphones",category:"Phones",price:0,stock:0,icon:"📱",description:"Contact us for available models, storage and warranty.",active:true}
  ];
  const $ = (s) => document.querySelector(s);
  const money = (n) => `ETB ${Number(n || 0).toLocaleString("en-US")}`;
  const read = (key, fallback) => { try { const v=JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } };
  const getProducts = () => read(PRODUCT_KEY, defaultProducts);
  const getOrders = () => read(ORDER_KEY, []);
  const getCart = () => read(CART_KEY, {});
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  let activeCategory = "All";
  let toastTimer;
  function toast(message) { const el=$("#toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2500); }
  function escapeHTML(value) { return String(value ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

  function renderCategories() {
    const categories = ["All", "Honey", "Coffee", "Butter", "Teff", "Jewelry", "Phones"];
    $("#category-tabs").innerHTML = categories.map(c=>`<button class="category-tab ${activeCategory===c?"active":""}" data-category="${c}">${c}</button>`).join("");
    $("#category-tabs").querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{activeCategory=btn.dataset.category;renderCategories();renderProducts();}));
  }
  function renderProducts() {
    const query=$("#product-search").value.trim().toLowerCase();
    const items=getProducts().filter(p=>p.active && (activeCategory==="All"||p.category===activeCategory) && `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(query));
    $("#results-line").textContent = `${items.length} ${items.length===1?"product":"products"} to explore`;
    $("#product-grid").innerHTML = items.length ? items.map(p=>`
      <article class="product-card">
        <div class="product-visual"><span class="product-category">${escapeHTML(p.category)}</span><span>${escapeHTML(p.icon||"📦")}</span></div>
        <div class="product-body"><h3>${escapeHTML(p.name)}</h3><p class="product-desc">${escapeHTML(p.description)}</p>
        <p class="product-price">${Number(p.price)>0?money(p.price):"Contact for price"} ${Number(p.price)>0?'<small>ETB</small>':""}</p>
        <button class="add-button" data-add="${escapeHTML(p.id)}" ${Number(p.price)<=0||Number(p.stock)<=0?"disabled":""}>${Number(p.stock)<=0?"Currently unavailable":Number(p.price)<=0?"Ask for price":"Add to cart +"}</button></div>
      </article>`).join("") : `<div class="empty-state">No products found. Try another search or category.</div>`;
    $("#product-grid").querySelectorAll("[data-add]").forEach(btn=>btn.addEventListener("click",()=>addToCart(btn.dataset.add)));
  }
  function addToCart(id) {
    const product=getProducts().find(p=>p.id===id);
    if(!product||!product.active||Number(product.price)<=0){toast("This product is not available for online cart ordering yet.");return;}
    const cart=getCart(), next=(cart[id]||0)+1;
    if(next>Number(product.stock)){toast("Sorry, that quantity is not currently in stock.");return;}
    cart[id]=next;save(CART_KEY,cart);renderCart();toast("Added to your cart.");
  }
  function renderCart() {
    const products=getProducts(), cart=getCart();
    const entries=Object.entries(cart).filter(([id,qty])=>qty>0&&products.some(p=>p.id===id));
    const count=entries.reduce((s,[,q])=>s+q,0);
    const total=entries.reduce((s,[id,q])=>{const p=products.find(x=>x.id===id);return s+(p?Number(p.price)*q:0);},0);
    $("#cart-count").textContent=count;
    $("#cart-items").innerHTML=entries.length?entries.map(([id,qty])=>{const p=products.find(x=>x.id===id);return `<div class="cart-row"><div class="cart-emoji">${escapeHTML(p.icon||"📦")}</div><div><h3>${escapeHTML(p.name)}</h3><small>${money(p.price)} each</small><div class="qty-controls"><button data-qty="${escapeHTML(id)}" data-delta="-1" aria-label="Remove one">−</button><span>${qty}</span><button data-qty="${escapeHTML(id)}" data-delta="1" aria-label="Add one">+</button></div></div><span class="cart-line-price">${money(p.price*qty)}</span></div>`;}).join(""):`<div class="empty-cart">Your cart is empty. Pick something you love from the shop.</div>`;
    $("#cart-items").querySelectorAll("[data-qty]").forEach(btn=>btn.addEventListener("click",()=>changeQty(btn.dataset.qty,Number(btn.dataset.delta))));
    $("#cart-summary").innerHTML=`<div class="summary-line"><span>Subtotal</span><span>${money(total)}</span></div><div class="summary-line"><span>Delivery</span><span>Confirmed before dispatch</span></div><div class="summary-line total"><span>Subtotal</span><span>${money(total)}</span></div>`;
    $("#checkout-total").innerHTML=`<span>Items subtotal</span><span>${money(total)}</span>`;
    $("#checkout-button").disabled=!entries.length;
    $("#checkout-button").style.opacity=entries.length?"1":".5";
  }
  function changeQty(id,delta) {
    const cart=getCart(), products=getProducts(), p=products.find(x=>x.id===id);
    const next=(cart[id]||0)+delta;
    if(next>Number(p?.stock||0)){toast("That quantity exceeds the available stock.");return;}
    if(next<=0)delete cart[id];else cart[id]=next;
    save(CART_KEY,cart);renderCart();renderProducts();
  }
  function openCart(){ $("#drawer-backdrop").hidden=false;requestAnimationFrame(()=>$("#cart-drawer").classList.add("open"));$("#cart-drawer").setAttribute("aria-hidden","false");document.body.classList.add("no-scroll"); }
  function closeCart(){ $("#cart-drawer").classList.remove("open");$("#cart-drawer").setAttribute("aria-hidden","true");$("#drawer-backdrop").hidden=true;document.body.classList.remove("no-scroll"); }
  function openCheckout(){
    const cart=getCart();
    if(!Object.values(cart).some(q=>q>0)){toast("Your cart is empty.");return;}
    closeCart();$("#checkout-dialog").showModal();renderCart();
  }
  $("#checkout-form").addEventListener("submit",e=>{
    e.preventDefault();
    const form=new FormData(e.currentTarget), products=getProducts(), cart=getCart();
    const lines=Object.entries(cart).filter(([,q])=>q>0).map(([id,qty])=>{const p=products.find(x=>x.id===id);return p?{productId:id,name:p.name,price:Number(p.price),quantity:qty,lineTotal:Number(p.price)*qty}:null;}).filter(Boolean);
    if(!lines.length){toast("Your cart is empty.");$("#checkout-dialog").close();return;}
    for(const line of lines){const p=products.find(x=>x.id===line.productId);if(!p||!p.active||p.stock<line.quantity){toast(`${line.name} no longer has enough stock. Please update your cart.`);$("#checkout-dialog").close();renderProducts();return;}}
    const order={id:"JOY-"+Date.now().toString().slice(-8),createdAt:new Date().toISOString(),customer:{name:String(form.get("name")).trim(),phone:String(form.get("phone")).trim(),area:String(form.get("area")).trim(),address:String(form.get("address")).trim(),note:String(form.get("note")||"").trim()},items:lines,subtotal:lines.reduce((s,l)=>s+l.lineTotal,0),deliveryFee:null,total:lines.reduce((s,l)=>s+l.lineTotal,0),paymentMethod:String(form.get("payment")),paymentStatus:"Unpaid",status:"Pending confirmation"};
    const orders=getOrders();orders.unshift(order);save(ORDER_KEY,orders);
    // Demo inventory reservation only. A production server must perform this atomically.
    lines.forEach(line=>{const p=products.find(x=>x.id===line.productId);if(p)p.stock=Math.max(0,Number(p.stock)-line.quantity);});
    save(PRODUCT_KEY,products);save(CART_KEY,{});
    $("#checkout-dialog").close();e.currentTarget.reset();renderProducts();renderCart();
    toast(`Demo order ${order.id} saved on this device. No payment was taken.`);
    alert(`Thank you, ${order.customer.name}!\\n\\nDemo order: ${order.id}\\nSubtotal: ${money(order.subtotal)}\\nPayment: ${order.paymentMethod}\\n\\nThis is a local demo only. Your order has not been sent to Joy.`);
  });
  $("#product-search").addEventListener("input",renderProducts);
  $("#cart-trigger").addEventListener("click",openCart);
  $("#close-cart").addEventListener("click",closeCart);
  $("#drawer-backdrop").addEventListener("click",closeCart);
  $("#checkout-button").addEventListener("click",openCheckout);
  $("#close-checkout").addEventListener("click",()=>$("#checkout-dialog").close());
  $("#checkout-dialog").addEventListener("click",e=>{if(e.target===$("#checkout-dialog"))$("#checkout-dialog").close();});
  $("#year").textContent=new Date().getFullYear();
  renderCategories();renderProducts();renderCart();
})();