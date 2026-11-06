
const products = [
    {
        name: "Es Teh Lemon",
        price: 5000,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500"
    },
    {
        name: "Milk Tea",
        price: 8000,
        image: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=500"
    },
    {
        name: "Jus Strawberry",
        price: 10000,
        image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500"
    },
    {
        name: "Es Kopi Susu",
        price: 12000,
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500"
    },
    {
        name: "Jus Jeruk",
        price: 7000,
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500"
    },
    {
        name: "Matcha Latte",
        price: 12000,
        image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=500"
    }
];

let cart = JSON.parse(localStorage.getItem("freshCart")) || [];
let history = JSON.parse(localStorage.getItem("freshHistory")) || [];
let promoActive = false;

const rupiah = n =>
    "Rp" + Number(n).toLocaleString("id-ID");

// MENAMPILKAN PRODUK
function renderProducts() {
    const keyword = document.getElementById("search")
        .value.toLowerCase();

    document.getElementById("products").innerHTML =
        products
            .filter(p => p.name.toLowerCase().includes(keyword))
            .map(p => `
                <div class="product">
                    <img src="${p.image}" alt="${p.name}">
                    <div class="product-content">
                        <h3>${p.name}</h3>
                        <p class="price">${rupiah(p.price)}</p>
                        <button onclick="addCart(${products.indexOf(p)})">
                            + Tambah
                        </button>
                    </div>
                </div>
            `).join("");
}

// MENAMBAHKAN KERANJANG
function addCart(index) {
    const product = products[index];

    const existing = cart.find(
        x => x.name === product.name
    );

    if (existing) {
        existing.qty++;
    } else {
        cart.push({...product, qty: 1});
    }

    saveCart();
}

// MENYIMPAN KERANJANG
function saveCart() {
    localStorage.setItem(
        "freshCart",
        JSON.stringify(cart)
    );

    renderCart();
}

// MENAMPILKAN KERANJANG
function renderCart() {
    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );

    const discount = promoActive && subtotal >= 15000
        ? Math.min(subtotal * 0.1, 10000)
        : 0;

    document.getElementById("cartItems").innerHTML =
        cart.length
            ? cart.map((item, i) => `
                <div class="cart-item">
                    <div>
                        <b>${item.name}</b><br>
                        ${rupiah(item.price)} × ${item.qty}
                    </div>
                    <div>
                        <button onclick="changeQty(${i},-1)">-</button>
                        <button onclick="changeQty(${i},1)">+</button>
                    </div>
                </div>
            `).join("")
            : "<p>Keranjang masih kosong.</p>";

    document.getElementById("subtotal").innerText =
        rupiah(subtotal);

    document.getElementById("discount").innerText =
        rupiah(discount);

    document.getElementById("total").innerText =
        rupiah(subtotal - discount);
}

// MENGUBAH JUMLAH PRODUK
function changeQty(index, amount) {
    cart[index].qty += amount;

    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
}

// PROMO
function applyPromo() {
    const code = document.getElementById("promo")
        .value.trim().toUpperCase();

    if (code === "FRESH10") {
        promoActive = true;
        alert("Promo berhasil digunakan!");
    } else {
        promoActive = false;
        alert("Kode promo tidak valid.");
    }

    renderCart();
}

// MENGOSONGKAN KERANJANG
function clearCart() {
    cart = [];
    promoActive = false;

    saveCart();
}

// CHECKOUT WHATSAPP
function checkout() {

    if (cart.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }

    // Mengambil nomor WhatsApp
    let phone = document.getElementById("phone")
        .value.replace(/\D/g, "");

    if (!phone) {
        alert("Masukkan nomor WhatsApp penjual!");
        return;
    }

    // Mengubah nomor menjadi format internasional
    if (phone.startsWith("0")) {
        phone = "62" + phone.substring(1);
    } else if (phone.startsWith("8")) {
        phone = "62" + phone;
    }

    if (!phone.startsWith("62")) {
        alert("Gunakan nomor WhatsApp Indonesia yang valid!");
        return;
    }

    const subtotal = cart.reduce(
        (s, x) => s + x.price * x.qty,
        0
    );

    const discount = promoActive && subtotal >= 15000
        ? Math.min(subtotal * 0.1, 10000)
        : 0;

    const total = subtotal - discount;

    // Membuat pesan WhatsApp
    let message = "HALO FRESHDINK! 🥤\n";
    message += "Saya ingin memesan minuman:\n";
    message += "========================\n";

    cart.forEach(item => {
        message += `\n${item.name}`;
        message += `\nJumlah: ${item.qty}`;
        message += `\nHarga: ${rupiah(item.price * item.qty)}\n`;
    });

    message += "\n========================";
    message += `\nSubtotal: ${rupiah(subtotal)}`;
    message += `\nDiskon: ${rupiah(discount)}`;
    message += `\nTOTAL BAYAR: ${rupiah(total)}`;
    message += "\n\nMohon konfirmasi pesanan saya.";
    message += "\nTerima kasih! 🙏";

    // Simpan riwayat checkout
    history.unshift({
        date: new Date().toLocaleString("id-ID"),
        items: cart.map(x => ({...x})),
        total: total
    });

    localStorage.setItem(
        "freshHistory",
        JSON.stringify(history)
    );

    // Membuka WhatsApp penjual
    const whatsappURL = 
    "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
    window.open(whatsappURL, "_blank");

    renderHistory();

    // Keranjang sengaja tidak dihapus otomatis.
    alert("WhatsApp dibuka. Silakan tekan KIRIM untuk mengirim pesanan.");
}

// KALKULATOR KEUNTUNGAN
function calculate() {
    const modal = Number(
        document.getElementById("modal").value
    );

    const biaya = Number(
        document.getElementById("biaya").value
    );

    const jumlah = Number(
        document.getElementById("jumlah").value
    );

    const harga = Number(
        document.getElementById("harga").value
    );

    if ([modal, biaya, jumlah, harga].some(
        x => !Number.isFinite(x) || x < 0
    )) {
        alert("Masukkan angka yang valid!");
        return;
    }

    const omzet = jumlah * harga;
    const laba = omzet - biaya;

    document.getElementById("rModal").innerText =
        rupiah(modal);

    document.getElementById("rBiaya").innerText =
        rupiah(biaya);

    document.getElementById("omzet").innerText =
        rupiah(omzet);

    document.getElementById("laba").innerText =
        rupiah(laba);
}

// RIWAYAT PESANAN
function renderHistory() {
    document.getElementById("history").innerHTML =
        history.length
            ? history.map(item => `
                <div class="history-item">
                    <b>${item.date}</b>
                    <p>
                        ${item.items.map(
                            x => x.name + " x" + x.qty
                        ).join(", ")}
                    </p>
                    <b>${rupiah(item.total)}</b>
                </div>
            `).join("")
            : "<p>Belum ada pesanan.</p>";
}

// HAPUS RIWAYAT
function clearHistory() {
    if (confirm("Hapus semua riwayat?")) {
        history = [];

        localStorage.removeItem("freshHistory");

        renderHistory();
    }
}

// DARK MODE
function toggleDark() {
    document.body.classList.toggle("dark");
}

// MENJALANKAN WEBSITE
renderProducts();
renderCart();
renderHistory();
calculate();
