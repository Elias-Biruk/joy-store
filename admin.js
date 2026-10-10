(() => {
  "use strict";
  const PRODUCT_KEY="joy_demo_products_v1", ORDER_KEY="joy_demo_orders_v1";
  const defaultProducts=[
    {id:"honey-1",name:"Pure Ethiopian Honey",category:"Honey",price:1200,stock:100,icon:"🍯",description:"Golden sweetness. Ask us for batch and sourcing details.",active:true},
    {id:"coffee-1",name:"Premium Ethiopian Coffee",category:"Coffee",price:2600,stock:50,icon:"☕",description:"A fragrant everyday coffee for your brewing ritual.",active:true},
    {id:"butter-1",name:"Traditional Butter",category:"Butter",price:1800,stock:10,icon:"🧈",description:"Traditional-style butter. Confirm storage and availability.",active:true},
    {id:"teff-1",name:"Teff Grain",category:"Teff",price:160,stock:200,icon:"🌾",description:"A staple grain for your Ethiopian kitchen.",active:true},
    {id:"jewelry-1",name:"Everyday Jewelry",category:"Jewelry",price:0,stock:0,icon:"💎",description:"Ask us for available designs and current prices.",active:true},
    {id:"phone-1",name:"Android Smartphones",category:"Phones",price:0,stock:0,icon:"📱",description:"Contact us for available models, storage and warranty.",active:true}
  ];
  const $=s=>document.querySelector(s);
  const money=n=>`ETB ${Number(n||0).toLocaleString("en-US")}`;
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
  const save=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const products=()=>read(PRODUCT_KEY,defaultProducts);
  const orders=()=>read(ORDER_KEY,[]);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let currentView="overview",toastTimer;
  function toast(msg){const el=$("#admin-toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600);}
  function setView(view){currentView=view;document.querySelectorAll(".side-link").forEach(b=>b.classList.toggle("active",b.dataset.view===view));const meta={overview:["YOUR BUSINESS AT A GLANCE","Overview","A quick look at Joy’s products and orders."],products:["MANAGE YOUR CATALOG","Products","Update product details, pricing and stock."],orders:["FULFILL CUSTOMER ORDERS","Orders","Review orders and update their progress."]}[view];$("#admin-eyebrow").textContent=meta[0];$("#admin-title").textContent=meta[1];$("#admin-subtitle").textContent=meta[2];$("#top-add-product").hidden=view==="orders";render();}
  function stockLabel(n){n=Number(n);return n===0?'<span class="stock-out">Out of stock</span>':n<10?`<span class="stock-low">${n} left</span>`:`<span class="stock-ok">${n} in stock</span>`;}
  function productRows(list){return list.length?list.map(p=>`<tr><td><div class="table-product"><span class="table-emoji">${esc(p.icon||"📦")}</span><span><b>${esc(p.name)}</b><small>${esc(p.category)} · ${p.active?"Visible":"Hidden"}</small></span></div></td><td>${Number(p.price)>0?money(p.price):"Ask for price"}</td><td>${stockLabel(p.stock)}</td><td><button class="row-action" data-edit="${esc(p.id)}">Edit</button><button class="row-action danger" data-delete="${esc(p.id)}">Delete</button></td></tr>`).join(""):'<tr><td colspan="4"><div class="empty-state">No products match your search.</div></td></tr>';}
  function orderRows(list){return list.length?list.map(o=>`<tr><td><b>${esc(o.id)}</b><br><small>${new Date(o.createdAt).toLocaleString()}</small></td><td>${esc(o.customer?.name)}<br><small>${esc(o.customer?.phone)}</small></td><td>${o.items.reduce((s,i)=>s+i.quantity,0)} item(s)</td><td>${money(o.total)}</td><td><span class="status-badge ${o.status==="Delivered"?"delivered":o.status==="Canceled"?"cancelled":"pending"}">${esc(o.status)}</span></td><td><select data-order-status="${esc(o.id)}" aria-label="Update order ${esc(o.id)} status"><option ${o.status==="Pending confirmation"?"selected":""}>Pending confirmation</option><option ${o.status==="Confirmed"?"selected":""}>Confirmed</option><option ${o.status==="Dispatched"?"selected":""}>Dispatched</option><option ${o.status==="Delivered"?"selected":""}>Delivered</option><option ${o.status==="Canceled"?"selected":""}>Canceled</option></select></td><td><button class="row-action" data-details="${esc(o.id)}">Details</button></td></tr>`).join(""):'<tr><td colspan="7"><div class="empty-state">No orders yet. Demo orders placed in this browser will appear here.</div></td></tr>';}
  function render(){
    const ps=products(),os=orders();
    $("#nav-order-count").textContent=os.filter(o=>!["Delivered","Canceled"].includes(o.status)).length;
    if(currentView==="overview"){
      const active=ps.filter(p=>p.active).length, low=ps.filter(p=>p.active&&Number(p.stock)<10).length, pending=os.filter(o=>!["Delivered","Canceled"].includes(o.status)).length, deliveredRevenue=os.filter(o=>o.status==="Delivered").reduce((s,o)=>s+Number(o.total),0);
      $("#admin-view").innerHTML=`<div class="metric-grid"><article class="metric-card"><div class="metric-label">Active products</div><div class="metric-value">${active}</div><div class="metric-note">In your catalog</div></article><article class="metric-card"><div class="metric-label">Orders to process</div><div class="metric-value">${pending}</div><div class="metric-note">Need attention</div></article><article class="metric-card"><div class="metric-label">Low stock items</div><div class="metric-value">${low}</div><div class="metric-note">Fewer than 10 units</div></article><article class="metric-card"><div class="metric-label">Delivered order value</div><div class="metric-value">${money(deliveredRevenue)}</div><div class="metric-note">Demo records only</div></article></div><section class="admin-panel"><div class="panel-head"><h2>Recent orders</h2><button class="text-action" data-goto="orders">View all orders →</button></div><div class="table-wrap"><table class="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>${os.slice(0,5).length?os.slice(0,5).map(o=>`<tr><td><b>${esc(o.id)}</b></td><td>${esc(o.customer?.name)}</td><td>${o.items.reduce((s,i)=>s+i.quantity,0)}</td><td>${money(o.total)}</td><td><span class="status-badge ${o.status==="Delivered"?"delivered":o.status==="Canceled"?"cancelled":"pending"}">${esc(o.status)}</span></td></tr>`).join(""):'<tr><td colspan="5"><div class="empty-state">No orders yet. Place a demo order from the store to see it here.</div></td></tr>'}</tbody></table></div></section><section class="admin-panel"><div class="panel-head"><h2>Inventory snapshot</h2><button class="text-action" data-goto="products">Manage products →</button></div><div class="table-wrap"><table class="admin-table"><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead><tbody>${productRows(ps.slice(0,5))}</tbody></table></div></section>`;
    }else if(currentView==="products"){
      $("#admin-view").innerHTML=`<section class="admin-panel"><div class="admin-toolbar"><input id="admin-product-search" type="search" placeholder="Search product name…" aria-label="Search products"><select id="admin-product-filter" aria-label="Filter category"><option value="All">All categories</option>${["Honey","Coffee","Butter","Teff","Jewelry","Phones"].map(c=>`<option>${c}</option>`).join("")}</select></div><div class="table-wrap"><table class="admin-table"><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody id="admin-product-rows">${productRows(ps)}</tbody></table></div></section>`;
      $("#admin-product-search").addEventListener("input",filterProducts);$("#admin-product-filter").addEventListener("change",filterProducts);
    }else{
      $("#admin-view").innerHTML=`<section class="admin-panel"><div class="panel-head"><h2>All orders (${os.length})</h2><span class="demo-pill">LOCAL DEMO DATA</span></div><div class="table-wrap"><table class="admin-table"><thead><tr><th>Order / date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Update status</th><th>Details</th></tr></thead><tbody>${orderRows(os)}</tbody></table></div></section>`;
    }
    bindActions();
  }
  function filterProducts(){const q=$("#admin-product-search").value.toLowerCase(),cat=$("#admin-product-filter").value;const list=products().filter(p=>(cat==="All"||p.category===cat)&&`${p.name} ${p.category}`.toLowerCase().includes(q));$("#admin-product-rows").innerHTML=productRows(list);bindActions();}
  function bindActions(){
    document.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>editProduct(b.dataset.edit)));
    document.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>deleteProduct(b.dataset.delete)));
    document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.goto)));
    document.querySelectorAll("[data-order-status]").forEach(s=>s.addEventListener("change",()=>updateOrderStatus(s.dataset.orderStatus,s.value)));
    document.querySelectorAll("[data-details]").forEach(b=>b.addEventListener("click",()=>showOrder(b.dataset.details)));
  }
  function openProductDialog(p=null){
    const f=$("#product-form");f.reset();f.elements.id.value=p?.id||"";f.elements.name.value=p?.name||"";f.elements.category.value=p?.category||"Honey";f.elements.price.value=p?.price??0;f.elements.stock.value=p?.stock??0;f.elements.icon.value=p?.icon||"📦";f.elements.description.value=p?.description||"";f.elements.active.checked=p?.active??true;$("#product-dialog-title").textContent=p?"Edit product":"Add product";$("#product-dialog").showModal();
  }
  function editProduct(id){const p=products().find(p=>p.id===id);if(p)openProductDialog(p);}
  function deleteProduct(id){const p=products().find(p=>p.id===id);if(!p)return;if(!confirm(`Delete "${p.name}" from the catalog?`))return;save(PRODUCT_KEY,products().filter(p=>p.id!==id));render();toast("Product deleted.");}
  $("#product-form").addEventListener("submit",e=>{
    e.preventDefault();const f=e.currentTarget,d=new FormData(f),list=products(),id=String(d.get("id")||"");
    const p={id:id||`joy-${Date.now()}`,name:String(d.get("name")).trim(),category:String(d.get("category")),price:Math.max(0,Math.round(Number(d.get("price")))),stock:Math.max(0,Math.floor(Number(d.get("stock")))),icon:String(d.get("icon")||"📦").trim(),description:String(d.get("description")||"").trim(),active:f.elements.active.checked};
    if(!p.name||!Number.isFinite(p.price)||!Number.isFinite(p.stock)){toast("Check the product name, price and stock.");return;}
    const index=list.findIndex(x=>x.id===id);if(index>=0)list[index]=p;else list.unshift(p);
    save(PRODUCT_KEY,list);$("#product-dialog").close();setView("products");toast(index>=0?"Product updated.":"Product added.");
  });
  function updateOrderStatus(id,status){const list=orders(),o=list.find(o=>o.id===id);if(!o)return;o.status=status;if(status==="Delivered"&&o.paymentMethod==="COD")o.paymentStatus="Collected (demo)";save(ORDER_KEY,list);render();toast("Order status updated.");}
  function showOrder(id){const o=orders().find(o=>o.id===id);if(!o)return;const items=o.items.map(i=>`${i.quantity} × ${i.name} — ${money(i.lineTotal)}`).join("\\n");alert(`Order ${o.id}\\n\\nCustomer: ${o.customer.name}\\nPhone: ${o.customer.phone}\\nArea: ${o.customer.area}\\nAddress: ${o.customer.address}\\nPayment: ${o.paymentMethod} (${o.paymentStatus})\\nStatus: ${o.status}\\n\\nItems:\\n${items}\\n\\nSubtotal: ${money(o.subtotal)}\\n\\nNote: ${o.customer.note||"None"}`);}
  document.querySelectorAll(".side-link").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
  $("#top-add-product").addEventListener("click",()=>openProductDialog());
  $("#close-product-dialog").addEventListener("click",()=>$("#product-dialog").close());
  $("#product-dialog").addEventListener("click",e=>{if(e.target===$("#product-dialog"))$("#product-dialog").close();});
  setView("overview");
})();