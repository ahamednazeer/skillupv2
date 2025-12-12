const PDFDocument = require("pdfkit");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

// Register support for Indian Rupee symbol
const registerSymbol = () => {
    // This helps PDFKit render the rupee symbol correctly
    return true;
};

/**
 * Generates a Payslip PDF
 * @param {Object} employee - Employee object
 * @param {Object} salaryDetails - Calculated salary details (earnings, deductions, net)
 * @param {Object} settings - Payroll settings (logo, address, etc.)
 * @returns {Promise<Buffer>}
 */
const generatePayslipPDF = async (employee, salaryDetails, settings) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: "A4" });
            const buffers = [];

            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Configuration ---
            const primaryColor = settings?.themeColor || "#f57f17"; // Default to OTP Orange if not set
            const textColor = "#000000";
            const greyText = "#555555";
            const borderColor = "#dddddd";
            const footerBg = "#f1f1f1";

            // --- Header (OTP Email Style) ---
            let currentY = 40;

            // Organization Name (Left, Colored, Large)
            doc.fillColor(primaryColor).fontSize(22).font("Helvetica-Bold")
                .text(settings?.organizationName || "Skill Up Tech Solutions", 50, currentY);

            // Logo (Right side) - Use local file
            const showLogo = settings?.showLogo !== false; // Default to true
            if (showLogo) {
                try {
                    const logoPath = path.join(__dirname, "../../frontend/src/assets/Images/newlogo.jpg");
                    if (fs.existsSync(logoPath)) {
                        doc.image(logoPath, 450, currentY - 5, { width: 50, height: 50 });
                        currentY += 10; // Add spacing after logo
                    }
                } catch (logoError) {
                    console.log("Could not embed logo image:", logoError.message);
                }
            }

            // Address / Contact (Right, Small, Grey) - below logo space
            // doc.fillColor(greyText).fontSize(9).font("Helvetica")
            //     .text(settings?.organizationAddress || "Bangalore, India", 300, currentY + 15, { align: "right", width: 200 });

            currentY += 60;

            // Divider (Subtle)
            doc.lineWidth(0.5).moveTo(50, currentY).lineTo(550, currentY).strokeColor(borderColor).stroke();
            currentY += 20;

            // --- Payslip Title ---
            doc.fillColor(textColor).fontSize(16).font("Helvetica-Bold")
                .text("Payslip", 50, currentY, { align: "center" });

            doc.fontSize(10).font("Helvetica")
                .text(`${salaryDetails.month} ${salaryDetails.year}`, 50, currentY + 20, { align: "center" });

            currentY += 50;

            // --- Employee Details (Bordered Box) ---
            const boxTop = currentY;
            doc.rect(50, boxTop, 500, 90).strokeColor(borderColor).stroke();

            const labelX1 = 70;
            const valX1 = 170;
            const labelX2 = 320;
            const valX2 = 420;

            const rowH = 20;
            let rowY = boxTop + 15;

            doc.fontSize(9).fillColor(greyText);

            // Row 1
            doc.text("Name:", labelX1, rowY);
            doc.fillColor(textColor).text(employee.name, valX1, rowY);

            doc.fillColor(greyText).text("Employee ID:", labelX2, rowY);
            doc.fillColor(textColor).text(employee.employeeId, valX2, rowY);

            rowY += rowH;

            // Row 2
            doc.fillColor(greyText).text("Designation:", labelX1, rowY);
            doc.fillColor(textColor).text(employee.designation, valX1, rowY);

            doc.fillColor(greyText).text("Department:", labelX2, rowY);
            doc.fillColor(textColor).text(employee.department, valX2, rowY);

            rowY += rowH;

            // Row 3
            doc.fillColor(greyText).text("Joining Date:", labelX1, rowY);
            doc.fillColor(textColor).text(new Date(employee.joiningDate).toLocaleDateString(), valX1, rowY);

            doc.fillColor(greyText).text("Bank A/c:", labelX2, rowY);
            doc.fillColor(textColor).text(employee.accountNumber || "N/A", valX2, rowY);

            currentY = boxTop + 110;

            // --- Salary Table ---
            const tableTop = currentY;

            // Header Row (Colored Text, Grey BG like OTP body container? Or Simple?)
            // OTP uses clear white dividers. Let's use a subtle grey header.
            doc.rect(50, tableTop, 500, 25).fill("#fafafa");

            doc.fillColor(primaryColor).font("Helvetica-Bold"); // Primary color headers
            doc.text("EARNINGS", 60, tableTop + 8);
            doc.text("AMOUNT", 200, tableTop + 8, { align: "right", width: 80 });
            doc.text("DEDUCTIONS", 310, tableTop + 8);
            doc.text("AMOUNT", 450, tableTop + 8, { align: "right", width: 80 });

            // Line below header
            doc.moveTo(50, tableTop + 25).lineTo(550, tableTop + 25).strokeColor(primaryColor).lineWidth(1).stroke();

            currentY += 25;

            // Content
            const earnings = salaryDetails.earnings || [];
            const deductions = salaryDetails.deductions || [];
            const maxRows = Math.max(earnings.length, deductions.length);

            doc.font("Helvetica").fontSize(9).fillColor(textColor);

            for (let i = 0; i < maxRows; i++) {
                const rowY = currentY + 8;

                // Earnings
                if (earnings[i]) {
                    doc.text(earnings[i].name, 60, rowY);
                    doc.text(earnings[i].amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
                        200, rowY, { align: "right", width: 80 });
                }

                // Deductions
                if (deductions[i]) {
                    doc.text(deductions[i].name, 310, rowY);
                    doc.text(deductions[i].amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
                        450, rowY, { align: "right", width: 80 });
                }

                // Dotted separator
                // doc.moveTo(50, currentY + 20).lineTo(550, currentY + 20).dash(4, { space: 4 }).strokeColor("#eeeeee").stroke().undash();

                currentY += 20;
            }

            // Bottom Border of Content
            doc.moveTo(50, currentY + 5).lineTo(550, currentY + 5).lineWidth(1).strokeColor(borderColor).stroke();
            currentY += 10;

            // --- Totals ---
            doc.font("Helvetica-Bold");
            doc.text("Total Earnings", 60, currentY + 5);
            doc.text(salaryDetails.grossEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
                200, currentY + 5, { align: "right", width: 80 });

            doc.text("Total Deductions", 310, currentY + 5);
            doc.text(salaryDetails.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
                450, currentY + 5, { align: "right", width: 80 });

            currentY += 30;

            // --- Net Pay (Highlighted) ---
            // OTP style: "Your One Time Password is:" -> Big Colored Text
            doc.font("Helvetica").fontSize(10).fillColor(greyText)
                .text("Net Payable Amount:", 50, currentY + 10, { align: "center" });

            currentY += 25;
            const amount = salaryDetails.netPay.toLocaleString('en-IN', { minimumFractionDigits: 2 });
            // Draw rupee symbol and amount together using Times font for better Unicode support
            doc.font("Times-Bold").fontSize(24).fillColor(primaryColor);
            doc.text(`₹ ${amount}`, 50, currentY, { align: "center" });

            currentY += 15;
            doc.fontSize(10).font("Helvetica").fillColor(greyText)
                .text("(This amount is credited matches bank records)", 50, currentY + 15, { align: "center" });

            // --- Footer (OTP Style: Grey Box) ---
            // Add footer only if there's space, otherwise on new section
            const footerHeight = 80;
            const footerStartY = 710; // Fixed position near bottom

            // Ensure we have space for footer - draw it at fixed position
            // Draw Grey Footer Background
            doc.rect(0, footerStartY, 600, footerHeight).fill(footerBg);

            const footerContentY = footerStartY + 10;

            // Separator line in footer
            doc.moveTo(50, footerContentY).lineTo(550, footerContentY).strokeColor("#cccccc").lineWidth(0.5).stroke();

            doc.fillColor(greyText).fontSize(9).font("Helvetica");
            doc.text(`© ${new Date().getFullYear()} ${settings?.organizationName || "SkillUp Tech"}. All rights reserved.`,
                50, footerContentY + 12, { align: "center", width: 500 });

            if (settings?.footerNote) {
                doc.text(settings.footerNote, 50, footerContentY + 28, { align: "center", width: 500 });
            }

            doc.text("This is a system generated document.", 50, footerContentY + 42, { align: "center", width: 500 });

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generatePayslipPDF;
