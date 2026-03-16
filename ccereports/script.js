
// =======================
// Manual school groups
// =======================
const group1 = [
    36291700101, 36291700102, 36291700104, 36291700105, 36291700201,
    36291700203, 36291700204, 36291700301, 36291700302, 36291700402,
    36291700403, 36291700404, 36291700405, 36291700501, 36291700504,
    36291700505, 36291700829
];

const group2 = [
    36291700502, 36291700701, 36291700702, 36291700703, 36291700801,
    36291700815, 36291700816, 36291700821, 36291700825, 36291700827,
    36291700830, 36291700831, 36291700901, 36291701001, 36291701101,
    36291701103, 36291701104, 36291701301
];

const group3 = [
    36291700601, 36291701201, 36291701203, 36291701204, 36291701205,
    36291701206, 36291701207, 36291701208, 36291701210, 36291701211,
    36291701214, 36291701215, 36291701216, 36291701217, 36291701222,
    36291701223, 36291701402, 36291701501, 36292900504
];

let allData = []; // store Excel data once

// ====================
// Excel file upload
// ====================
document.getElementById("excelFile").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        allData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        filterAndShowTable();
    };
    reader.readAsArrayBuffer(file);
});

// ==========================
// Dropdown change event
// ==========================
document.getElementById("schoolGroup").addEventListener("change", filterAndShowTable);

function filterAndShowTable() {

    const title = document.getElementById("title");
    const selectedGroup = document.getElementById("schoolGroup").value;

    let groupName = "All Schools";
    if (selectedGroup === "1") groupName = "Yerrabelly Complex";
    else if (selectedGroup === "2") groupName = "Nidamanur Complex";
    else if (selectedGroup === "3") groupName = "Thummadam Complex";

    // Current Date
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    title.innerText = `Data Entry(CCE) Status Report (${groupName}) - ${dateStr}`;
    title.style.display = "block";

    if (!allData || allData.length < 3) return;
    let filteredData = allData;

    if (selectedGroup !== "all") {
        let codes = [];
        if (selectedGroup === "1") codes = group1.map(String);
        else if (selectedGroup === "2") codes = group2.map(String);
        else if (selectedGroup === "3") codes = group3.map(String);

        filteredData = allData.filter((row, i) => {
            if (i < 2) return true; // keep headers
            const code = String(row[1] || "").split(' - ')[0].trim(); // remove spaces
            return codes.includes(code);
        });
    }

    createTable(filteredData);
}

// ====================
// Percentage helper
// ====================
function percent(data, total) {
    if (!data || !total) return "0%";
    return ((data / total) * 100).toFixed(2) + "%";
}

// ====================
// Color helpers
// ====================
function getColorClass(value) {
    const num = parseFloat(value); // remove %
    if (num > 90) return "green";
    if (num >= 75) return "yellow";
    return "red";
}

function getCardBackground(percentValue) {
    const num = parseFloat(percentValue); // remove % sign
    if (num > 90) return "#c8f7c5";   // light green
    if (num >= 75) return "#fff4b3";   // light yellow
    return "#f7c5c5";                  // light red
}
// ====================
// Create HTML table
// ====================
function createTable(data) {
    if (!data || data.length < 3) return;
    document.getElementById("title").style.display = "block";

    // ====== Calculate totals ======
    let totalChildren = 0, totalFA1 = 0, totalFA2 = 0, totalFA3 = 0, totalFA4 = 0, totalSA1 = 0, totalSA2Children = 0, totalSA2 = 0;
    let serial = 1; // dynamic S.No

    const rows = data.slice(2).filter(r => r[1]); // ignore headers

    rows.forEach(row => {
        const children = Number(row[2]) || 0;
        const fa1 = Number(row[3]) || 0;
        const fa2 = Number(row[4]) || 0;
        const fa3 = Number(row[5]) || 0;
        const fa4 = Number(row[6]) || 0;
        const sa1 = Number(row[7]) || 0;
        const sa2children = Number(row[8]) || 0;
        const sa2 = Number(row[9]) || 0;

        totalChildren += children;
        totalFA1 += fa1; totalFA2 += fa2; totalFA3 += fa3; totalFA4 += fa4;
        totalSA1 += sa1; totalSA2Children += sa2children; totalSA2 += sa2;
    });

    // ====== Generate Summary Cards ======
    const summaryContainer = document.getElementById("summaryContainer");
    summaryContainer.innerHTML = ""; // clear previous

    const summaryItems = [
        { label: "Total Children", value: totalChildren, col: null },
        { label: "FA1 Total", value: totalFA1, col: 3, percent: totalChildren },
        { label: "FA2 Total", value: totalFA2, col: 5, percent: totalChildren },
        { label: "FA3 Total", value: totalFA3, col: 7, percent: totalChildren },
        { label: "FA4 Total", value: totalFA4, col: 9, percent: totalChildren },
        { label: "SA1 Total", value: totalSA1, col: 11, percent: totalChildren },
        { label: "SA2 Total", value: totalSA2, col: 13, percent: totalSA2Children },
    ];

    summaryItems.forEach(item => {
        const card = document.createElement("div");
        card.style.border = "1px solid #ccc";
        card.style.borderRadius = "8px";
        card.style.padding = "12px 20px";
        card.style.margin = "5px";
        card.style.background = "#fff";
        card.style.minWidth = "130px";
        card.style.textAlign = "center";
        card.className = "summary-card";

        let displayValue = item.value;
        let percentValue = "";
        if (item.percent) {
            percentValue = percent(item.value, item.percent);
            displayValue += ` (${percentValue})`;
            card.style.background = getCardBackground(percentValue); // 🔹 set background color
        }

        card.innerHTML = `<strong>${item.label}</strong><br>${displayValue}`;
        summaryContainer.appendChild(card);
        // 🔹 Hide card if corresponding column checkbox is unchecked
        if (item.col !== null) {
            const checkbox = document.querySelector(`.col-toggle[data-col="${item.col}"]`);
            if (checkbox && !checkbox.checked) card.style.display = "none";
        }
    });

    // ====== Generate Table ======
    let table = "<table id='dataTable'>";
    table += `<tr>
<th>S.No</th>
<th>Schools</th>
<th>No of Children</th>
<th>FA1 Data</th><th>FA1 %</th>
<th>FA2 Data</th><th>FA2 %</th>
<th>FA3 Data</th><th>FA3 %</th>
<th>FA4 Data</th><th>FA4 %</th>
<th>SA1 Data</th><th>SA1 %</th>
<th>No of Children for SA2 (Excluded Class X)</th><th>SA2 Data</th><th>SA2 %</th>
</tr>`;

    rows.forEach(row => {
        const children = Number(row[2]) || 0;
        const fa1 = Number(row[3]) || 0;
        const fa2 = Number(row[4]) || 0;
        const fa3 = Number(row[5]) || 0;
        const fa4 = Number(row[6]) || 0;
        const sa1 = Number(row[7]) || 0;
        const sa2children = Number(row[8]) || 0;
        const sa2 = Number(row[9]) || 0;

        table += `<tr>
<td>${serial++}</td>
<td>${row[1]}</td>
<td>${children}</td>
<td>${fa1}</td><td class="${getColorClass(percent(fa1, children))}">${percent(fa1, children)}</td>
<td>${fa2}</td><td class="${getColorClass(percent(fa2, children))}">${percent(fa2, children)}</td>
<td>${fa3}</td><td class="${getColorClass(percent(fa3, children))}">${percent(fa3, children)}</td>
<td>${fa4}</td><td class="${getColorClass(percent(fa4, children))}">${percent(fa4, children)}</td>
<td>${sa1}</td><td class="${getColorClass(percent(sa1, children))}">${percent(sa1, children)}</td>
<td>${sa2children}</td><td class="${getColorClass(percent(sa2, sa2children))}">${sa2}</td><td>${percent(sa2, sa2children)}</td>
</tr>`;
    });
    // ====== Add TOTAL row ======
    table += `<tr style="font-weight:bold;background:#e8e8e8;">
<td></td><td>TOTAL</td><td>${totalChildren}</td>
<td>${totalFA1}</td><td class="${getColorClass(percent(totalFA1, totalChildren))}">${percent(totalFA1, totalChildren)}</td>
<td>${totalFA2}</td><td class="${getColorClass(percent(totalFA2, totalChildren))}">${percent(totalFA2, totalChildren)}</td>
<td>${totalFA3}</td><td class="${getColorClass(percent(totalFA3, totalChildren))}">${percent(totalFA3, totalChildren)}</td>
<td>${totalFA4}</td><td class="${getColorClass(percent(totalFA4, totalChildren))}">${percent(totalFA4, totalChildren)}</td>
<td>${totalSA1}</td><td class="${getColorClass(percent(totalSA1, totalChildren))}">${percent(totalSA1, totalChildren)}</td>
<td>${totalSA2Children}</td><td>${totalSA2}</td><td class="${getColorClass(percent(totalSA2, totalSA2Children))}">${percent(totalSA2, totalSA2Children)}</td>
</tr>`;
    table += "</table>";
    document.getElementById("tableContainer").innerHTML = table;

    // ====== Column Toggle logic ======
    document.querySelectorAll(".col-toggle").forEach(cb => {
        cb.checked ? showColumn(cb.dataset.col) : hideColumn(cb.dataset.col);

        cb.onchange = function () {
            this.checked ? showColumn(this.dataset.col) : hideColumn(this.dataset.col);
            // 🔹 update summary cards visibility
            document.querySelectorAll(".summary-card").forEach(card => {
                const label = card.querySelector("strong").innerText;
                if (label.includes("FA1") && this.dataset.col == 3) card.style.display = this.checked ? "block" : "none";
                if (label.includes("FA2") && this.dataset.col == 5) card.style.display = this.checked ? "block" : "none";
                if (label.includes("FA3") && this.dataset.col == 7) card.style.display = this.checked ? "block" : "none";
                if (label.includes("FA4") && this.dataset.col == 9) card.style.display = this.checked ? "block" : "none";
                if (label.includes("SA1") && this.dataset.col == 11) card.style.display = this.checked ? "block" : "none";
                if (label.includes("SA2") && this.dataset.col == 13) card.style.display = this.checked ? "block" : "none";
            });
            // 🔹 update low performance table dynamically
            createLowPerformanceTable();
        };
    });

    function hideColumn(col) {
        const tbl = document.getElementById("dataTable");
        const c = parseInt(col);
        for (let r = 0; r < tbl.rows.length; r++) {
            const cells = tbl.rows[r].cells;
            if (c === 13) [13, 14, 15].forEach(i => cells[i]?.classList.add("hidden"));
            else { cells[c]?.classList.add("hidden"); cells[c + 1]?.classList.add("hidden"); }
        }
    }

    function showColumn(col) {
        const tbl = document.getElementById("dataTable");
        const c = parseInt(col);
        for (let r = 0; r < tbl.rows.length; r++) {
            const cells = tbl.rows[r].cells;
            if (c === 13) [13, 14, 15].forEach(i => cells[i]?.classList.remove("hidden"));
            else { cells[c]?.classList.remove("hidden"); cells[c + 1]?.classList.remove("hidden"); }
        }
    }

    // ===== Export to Excel =====
    document.getElementById("exportExcel").onclick = () => {
        const exportArea = document.getElementById("exportArea");
        if (!exportArea) return;

        // create a temporary table for export (summary + table)
        const tempTable = document.createElement("table");

        // Add summary rows
        const summaryCards = document.querySelectorAll(".summary-card");
        summaryCards.forEach(card => {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 16;
            td.innerText = card.innerText;
            tr.appendChild(td);
            tempTable.appendChild(tr);
        });

        // Add the main table
        const dataTable = document.getElementById("dataTable");
        if (dataTable) tempTable.appendChild(dataTable.cloneNode(true));

        const wb = XLSX.utils.table_to_book(tempTable, { sheet: "Sheet1" });
        XLSX.writeFile(wb, "School_Report.xlsx");
    };
    createLowPerformanceTable();
}

// ===== Export to PDF =====
document.getElementById("exportPDF").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;

    const dashboard = document.getElementById("exportArea");

    html2canvas(dashboard, {
        scale: 2,
        useCORS: true
    }).then(canvas => {

        let imgData = canvas.toDataURL("image/png");

        // A4 Landscape
        let pdf = new jsPDF("l", "mm", "a4");

        let pageWidth = pdf.internal.pageSize.getWidth();
        let pageHeight = pdf.internal.pageSize.getHeight();

        let imgWidth = pageWidth;
        let imgHeight = canvas.height * imgWidth / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {

            position = heightLeft - imgHeight;

            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

            heightLeft -= pageHeight;

        }

        pdf.save("cce_marks_report.pdf");

    });
});


// ===== Export to Image =====
document.getElementById("exportImage").addEventListener("click", () => {
    const exportArea = document.getElementById("exportArea");
    if (!exportArea) return;

    // Make sure title is visible
    document.getElementById("title").style.display = "block";

    html2canvas(exportArea, {
        scale: 2,        // higher resolution
        useCORS: true,   // external images if any
        backgroundColor: "#ffffff"
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = "School_Report.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    }).catch(err => {
        console.error("Image export failed:", err);
        alert("Failed to export image. Check console for details.");
    });
});

// performance table
function createLowPerformanceTable(){
    const table = document.getElementById("dataTable");
    if(!table) return;

    // 🔹 Check which columns are visible
    const activeCols = [];
    document.querySelectorAll(".col-toggle").forEach(cb=>{
        if(cb.checked){
            const c = parseInt(cb.dataset.col);
            if(c !== 13) activeCols.push(c); // exclude SA2
        }
    });

    let lowSchools = [];

    for(let i=1;i<table.rows.length-1;i++){ // skip header & total
        const row = table.rows[i];
        const school = row.cells[1].innerText;

        // calculate average of only active columns
        let sum = 0;
        let count = 0;
        activeCols.forEach(c=>{
            const val = parseFloat(row.cells[c+1].innerText) || 0; // c+1 because Data + % are 2 cells
            sum += val;
            count++;
        });

        const score = count>0 ? (sum/count) : 0;

        if(score < 75){
            lowSchools.push({
                school: school,
                score: score.toFixed(2) // string for display
            });
        }
    }

    // 🔹 sort ascending by score
    lowSchools.sort((a,b)=> parseFloat(a.score) - parseFloat(b.score));

    // 🔹 Current date
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    // 🔹 generate table
    let html = `<br><h3>Low Performing Schools - ${dateStr}</h3>`;
    html += "<table style='width:60%;margin:auto; border-collapse:collapse;'>";
    html += "<tr style='background:#2f6fed;color:white;'><th>S.No</th><th>School Name</th><th>Score %</th></tr>";

    lowSchools.forEach((s,i)=>{
        html += `<tr>
        <td style="border:1px solid #999;padding:6px;">${i+1}</td>
        <td style="border:1px solid #999;padding:6px;">${s.school}</td>
        <td style="border:1px solid #999;padding:6px;color:red;font-weight:bold">${s.score}%</td>
        </tr>`;
    });

    html += "</table>";

    // replace old low performance table
    const oldTable = document.getElementById("lowPerformanceTable");
    if(oldTable) oldTable.remove();

    const container = document.createElement("div");
    container.id = "lowPerformanceTable";
    container.innerHTML = html;
    document.getElementById("tableContainer").appendChild(container);
}

document.getElementById("shareWhatsApp").addEventListener("click", () => {
    const exportArea = document.getElementById("exportArea");
    if (!exportArea) return;

    // generate image like export
    html2canvas(exportArea, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
    }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");

        // convert to blob for WhatsApp sharing
        fetch(imgData)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "School_Report.png", { type: "image/png" });

                if(navigator.canShare && navigator.canShare({ files: [file] })){
                    navigator.share({
                        files: [file],
                        title: "School Report",
                        text: "Check out the low performing schools report."
                    }).catch(err => console.error("Share failed:", err));
                } else {
                    // fallback: WhatsApp Web link with message
                    const whatsappUrl = `https://wa.me/?text=Check%20out%20the%20school%20report%20-%20download%20image%20from%20here%20[Attach%20Manually]`;
                    window.open(whatsappUrl, "_blank");
                }
            });
    }).catch(err => {
        console.error("WhatsApp share failed:", err);
        alert("Sharing failed. Try manually copying the image.");
    });
});







