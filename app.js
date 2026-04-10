let total = 0;
let daftarTransaksi = [];

function formatRupiah(angka) {
    return angka.toLocaleString("id-ID");
}

// AUTO FORMAT HARGA
document.getElementById("hargaBarang").addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value) {
        e.target.value = parseInt(value).toLocaleString("id-ID");
    }
});

function tambahBarang() {
    let nama = document.getElementById("namaBarang").value;
    let harga = parseInt(document.getElementById("hargaBarang").value.replace(/\./g, ""));
    let jumlah = parseInt(document.getElementById("jumlahBarang").value);

    if (nama === "" || isNaN(harga) || isNaN(jumlah)) {
        alert("Isi data barang dengan benar!");
        return;
    }

    let subtotal = harga * jumlah;
    total += subtotal;

    daftarTransaksi.push({ nama, harga, jumlah, subtotal });

    let tabel = document.getElementById("daftarBarang");
    let row = tabel.insertRow();

    row.insertCell(0).innerText = nama;
    row.insertCell(1).innerText = "Rp " + formatRupiah(harga);
    row.insertCell(2).innerText = jumlah;
    row.insertCell(3).innerText = "Rp " + formatRupiah(subtotal);

    let btnHapus = document.createElement("button");
    btnHapus.innerText = "Hapus";
    btnHapus.style.backgroundColor = "red";
    btnHapus.style.color = "white";

    btnHapus.onclick = function () {
        if (!confirm("Yakin mau hapus barang?")) return;

        total -= subtotal;
        document.getElementById("totalHarga").innerText = formatRupiah(total);
        row.remove();
    };

    row.insertCell(4).appendChild(btnHapus);

    document.getElementById("totalHarga").innerText = formatRupiah(total);

    // NOTIF
    let notif = document.getElementById("notif");
    notif.style.display = "block";
    setTimeout(() => notif.style.display = "none", 2000);

    document.getElementById("namaBarang").value = "";
    document.getElementById("hargaBarang").value = "";
    document.getElementById("jumlahBarang").value = "";
}

function bayar() {
    if (total === 0) {
        alert("Belum ada transaksi!");
        return;
    }

    let customer = document.getElementById("namaCustomer").value || "Umum";
    let metode = document.getElementById("metodeBayar").value;

    let uang = prompt("Masukkan uang pembayaran (contoh: 600000):");
    if (uang === null) return;

    uang = uang.replace(/\D/g, "");
    uang = parseInt(uang);

    if (isNaN(uang) || uang < total) {
        alert("Uang tidak cukup!");
        return;
    }

    let kembalian = uang - total;

    // SIMPAN TRANSAKSI
    let dataLama = JSON.parse(localStorage.getItem("transaksi")) || [];

    dataLama.push({
        tanggal: new Date().toLocaleString(),
        customer: customer,
        metode: metode,
        total: total
    });

    localStorage.setItem("transaksi", JSON.stringify(dataLama));

    tampilkanStruk(customer, metode, uang, kembalian);

    document.getElementById("daftarBarang").innerHTML = "";
    document.getElementById("totalHarga").innerText = "0";
    total = 0;
    daftarTransaksi = [];
}

// STRUK + QR
function tampilkanStruk(customer, metode, uang, kembalian) {

    let isiStruk = `
        <h2 style="text-align:center;">BENGKEL YUDHY MOTOR</h2>
        <p>Customer: ${customer}</p>
        <p>Metode: ${metode}</p>
        <p>--------------------------</p>
    `;

    daftarTransaksi.forEach(item => {
        isiStruk += `
            <p>${item.nama} (${item.jumlah}x) = Rp ${formatRupiah(item.subtotal)}</p>
        `;
    });

    let dataQR = `Customer: ${customer}\nTotal: Rp ${formatRupiah(total)}\nMetode: ${metode}`;

    isiStruk += `
        <p>--------------------------</p>
        <p>Total: Rp ${formatRupiah(total)}</p>
        <p>Bayar: Rp ${formatRupiah(uang)}</p>
        <p>Kembalian: Rp ${formatRupiah(kembalian)}</p>
        <p>--------------------------</p>

        <div style="text-align:center;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(dataQR)}">
        </div>

        <p style="text-align:center;">Scan QR untuk pembayaran</p>
        <p style="text-align:center;">Terima Kasih 🙏</p>
    `;

    let win = window.open("", "", "width=300,height=500");
    win.document.write(isiStruk);
    win.document.close();
    win.print();
}

// LAPORAN
function lihatLaporan() {
    let data = JSON.parse(localStorage.getItem("transaksi")) || [];

    if (data.length === 0) {
        alert("Belum ada transaksi!");
        return;
    }

    let isi = `<h2>Laporan Transaksi</h2><hr>`;
    let totalSemua = 0;

    data.forEach(item => {
        isi += `
            <p>${item.tanggal}</p>
            <p>Customer: ${item.customer}</p>
            <p>Metode: ${item.metode}</p>
            <p>Total: Rp ${formatRupiah(item.total)}</p>
            <hr>
        `;
        totalSemua += item.total;
    });

    isi += `<h3>Total: Rp ${formatRupiah(totalSemua)}</h3>`;

    let win = window.open("", "", "width=400,height=600");
    win.document.write(isi);
}

// EXPORT EXCEL
function exportExcel() {
    let data = JSON.parse(localStorage.getItem("transaksi")) || [];

    if (data.length === 0) {
        alert("Belum ada transaksi!");
        return;
    }

    let csv = "Tanggal,Customer,Metode,Total\n";

    data.forEach(item => {
        csv += `${item.tanggal},${item.customer},${item.metode},${item.total}\n`;
    });

    let blob = new Blob([csv], { type: "text/csv" });
    let url = window.URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "laporan_kasir.csv";
    a.click();
}

// 📊 GRAFIK PENJUALAN
function lihatGrafik() {
    let data = JSON.parse(localStorage.getItem("transaksi")) || [];

    if (data.length === 0) {
        alert("Belum ada transaksi!");
        return;
    }

    let dataPerTanggal = {};

    data.forEach(item => {
        let tanggal = item.tanggal.split(",")[0];

        if (!dataPerTanggal[tanggal]) {
            dataPerTanggal[tanggal] = 0;
        }

        dataPerTanggal[tanggal] += item.total;
    });

    let labels = Object.keys(dataPerTanggal);
    let values = Object.values(dataPerTanggal);

    let html = `
        <h2>Grafik Penjualan</h2>
        <canvas id="chart" width="400" height="200"></canvas>

        <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
        <script>
            const ctx = document.getElementById('chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(labels)},
                    datasets: [{
                        label: 'Total Penjualan',
                        data: ${JSON.stringify(values)},
                        borderWidth: 2,
                        fill: false
                    }]
                }
            });
        <\/script>
    `;

    let win = window.open("", "", "width=600,height=400");
    win.document.write(html);
}