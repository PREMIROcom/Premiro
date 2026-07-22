/* ==========================================================================
   PREMIRO - STABLE ENGINE (FULLY OPERATION VERSION)
   ========================================================================== */
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const MY_PHONE = "201010197615";

// 1. CALCULATE TOTALS WITH THE UNCONDITIONAL 75 EGP DELIVERY RULE
function getTotals() {
    let sub = 0;
    
    cart.forEach(item => {
        sub += (Number(item.price) * item.qty);
    });

    // Delivery is a flat 35 EGP for ALL items if subtotal is 75 EGP or more
    let del = (sub >= 75 && cart.length > 0) ? 35 : 0;

    return { sub: sub, del: del, total: sub + del };
}

// 2. CHECKOUT PAGE LOGIC (chek out.html)
function proceedToFinalCheckout(method) {
    const n = document.getElementById("custName")?.value;
    const p = document.getElementById("custPhone")?.value;
    const a = document.getElementById("custAddress")?.value;

    if (!n || !p || !a) {
        alert("⚠️ Please fill in all fields!");
        return;
    }

    localStorage.setItem("customerInfo", JSON.stringify({ name: n, phone: p, address: a }));

    if (method === 'Online') {
        window.location.href = 'fanil chekout.html';
    } else {
        sendToWhatsApp(n, p, a, "CASH ON DELIVERY");
    }
}

// 3. INSTAPAY PAGE LOGIC (fanil chekout.html)
function openInstaPay() {
    let info = JSON.parse(localStorage.getItem("customerInfo")) || { name: "Customer", phone: "", address: "" };
    
    if (cart.length === 0) return alert("Bag is empty!");

    sendToWhatsApp(info.name, info.phone, info.address, "ONLINE (INSTAPAY)");
    
    const payBtn = document.querySelector('.instapay-btn');
    if (payBtn) {
        payBtn.innerHTML = "✅ ORDER SENT! <br> CLICK TO OPEN INSTAPAY";
        payBtn.style.background = "#622181"; 
        
        payBtn.onclick = function() {
            window.open("https://ipn.eg/S/emantamam1/instapay/4qj7Ta", "_blank");
        };
    }
}

// 4. WHATSAPP MESSAGE BUILDER (CLEAN REFORMATTED UTF-8 VERSION)
function sendToWhatsApp(name, phone, address, method) {
    const pr = getTotals();
    let msg = `*⚽ PREMIRO ORDER - ${method} ⚽*\n\n`;
    msg += `👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n📍 *Address:* ${address}\n\n*🛍️ ITEMS:*\n\n`;
    
    cart.forEach((item, i) => {
        msg += `${i + 1}. *${item.name}* (${item.size}) x${item.qty} — ${item.price * item.qty} EGP\n`;
        
        let stats = item.customStats;
        if (stats) {
            if (stats.style) msg += `   • Theme/Style: ${stats.style.toUpperCase()}\n`;
            if (stats.rating) msg += `   • OVR Rating: ${stats.rating} | Pos: ${stats.position || "N/A"}\n`;
            if (stats.club) msg += `   • Club Team: ${stats.club}\n`;
            if (stats.pac) {
                msg += `   • Stats: [ PAC: ${stats.pac} | SHO: ${stats.sho || "0"} | PAS: ${stats.pas || "0"} ]\n`;
                msg += `            [ DRI: ${stats.dri || "0"} | DEF: ${stats.def || "0"} | PHY: ${stats.phy || "0"} ]\n`;
            }
            msg += `   📸 Note: Photo uploaded via dashboard\n`;
        }
        msg += `\n`;
    });

    msg += `-------------------------\n`;
    msg += `💰 *Subtotal:* ${pr.sub} EGP\n`;
    msg += `🚚 *Delivery Fee:* ${pr.del} EGP\n`;
    msg += `⭐ *TOTAL: ${pr.total} EGP*\n`;
    msg += `-------------------------`;

    window.open(`https://wa.me/${MY_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
}

// 5. CORE CART ACTIONS
function addToCart(id, name, price, img, clear = false, size = "N/A", customStats = null) {
    if (clear) cart = [];
    let exist = cart.find(i => i.id === id && i.size === size);
    
    let safeImage = img || "https://placehold.co/300x400/1e1e24/e8b84b?text=PREMIRO";

    if (exist) {
        exist.qty++;
    } else {
        cart.push({ 
            id: id, 
            name: name, 
            price: Number(price), 
            image: safeImage, 
            size: size, 
            qty: 1,
            customStats: customStats 
        });
    }
    saveAndRefresh();
}

// 6. UPDATE ITEM QUANTITY (PLUS / MINUS ACTIONS)
function updateItemQty(id, size, change) {
    let item = cart.find(i => i.id === id && i.size === size);
    if (item) {
        item.qty += change;
        
        if (item.qty <= 0) {
            removeItem(id, size);
            return;
        }
    }
    saveAndRefresh();
}

// 7. REMOVE ITEM FROM CART
function removeItem(id, size) {
    cart = cart.filter(i => !(i.id === id && i.size === size));
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateLocalCount();
    renderCart();
}

// 8. LIVE NAVBAR COUNT GENERATOR
function updateLocalCount() {
    const countEl = document.getElementById("cartCount");
    if (countEl) {
        countEl.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    }
}

// 9. RENDER SIDEBAR DRAWER OVERLAY (WITH PLUS/MINUS STEPPERS)
function renderCart() {
    const container = document.getElementById("cartItems");
    const totalDiv = document.getElementById("total");
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = "<p style='color:black; font-weight:600; padding:15px;'>Your bag is empty.</p>";
        if (totalDiv) totalDiv.innerHTML = "Subtotal: 0 EGP<br>Delivery: 0 EGP<br><b>Total: 0 EGP</b>";
        return;
    }

    let html = "";
    cart.forEach(item => {
        let statsSubtext = "";
        let stats = item.customStats;
        
        if (stats && stats.rating) {
            statsSubtext = `
                <div style="font-size: 11px; color: #555; margin-top: 3px; font-weight: 600; line-height: 1.25;">
                    OVR: ${stats.rating} | POS: ${stats.position || 'N/A'}<br>
                    ${stats.pac || "0"} PAC | ${stats.sho || "0"} SHO
                </div>
            `;
        }

        html += `
        <div style="color:black; border-bottom:1px solid #eee; padding:10px 5px; display:flex; align-items:center; gap:10px;">
            <img src="${item.image}" width="45" style="border-radius:4px; object-fit:cover;">
            <div style="flex:1;">
                <span style="font-weight:600; font-size:14px;">${item.name}</span><br>
                ${statsSubtext}
                <small style="color:#777;">Size: ${item.size} | <b>${item.price * item.qty} EGP</b></small>
            </div>
            
            <div style="display:flex; align-items:center; gap:5px; margin-right:5px;">
                <button style="background:#e0e0e0; color:black; border:none; padding:2px 8px; font-weight:bold; border-radius:4px; cursor:pointer;" onclick="updateItemQty('${item.id}', '${item.size}', -1)">-</button>
                <span style="font-weight:bold; font-size:14px; min-width:18px; text-align:center;">${item.qty}</span>
                <button style="background:#e0e0e0; color:black; border:none; padding:2px 8px; font-weight:bold; border-radius:4px; cursor:pointer;" onclick="updateItemQty('${item.id}', '${item.size}', 1)">+</button>
            </div>

            <button style="background:#ff4d4d; color:white; border:none; padding:2px 8px; border-radius:4px; cursor:pointer;" onclick="removeItem('${item.id}', '${item.size}')">x</button>
        </div>`;
    });
    container.innerHTML = html;

    const pr = getTotals();
    if (totalDiv) {
        totalDiv.innerHTML = `Subtotal: ${pr.sub} EGP<br>Delivery: ${pr.del} EGP<br><b>Total: ${pr.total} EGP</b>`;
    }
}

// 10. DRAWER SLIDE CONTROLS
function openCart() {
    const drawer = document.getElementById("cartSidebar") || document.getElementById("cartDrawer");
    if (drawer) {
        drawer.style.right = "0px";
        renderCart(); 
    }
}

function closeCart() {
    const drawer = document.getElementById("cartSidebar") || document.getElementById("cartDrawer");
    if (drawer) drawer.style.right = "-400px";
}

// Initialize on page setup load
document.addEventListener("DOMContentLoaded", () => {
    updateLocalCount();
    renderCart();
});