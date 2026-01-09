import PDFDocument from "pdfkit";
import { Readable } from "stream";

interface ContractData {
  contractNumber: string;
  title: string;
  description: string;
  totalAmount: number;
  currency: string;
  depositAmount?: number | null;
  paymentMethod?: string | null;
  transportAmount?: number | null;
  brokerFeeAmount?: number | null;
  amountPaidOnline?: number | null;
  amountPaidCOD?: number | null;
  customerName: string;
  customerEmail: string;
  signedBy?: string | null;
  signedAt?: Date | null;
  pickupDate?: Date | null;
  deliveryDate?: Date | null;
  estimatedDelivery?: Date | null;
}

export async function generateContractPDF(contract: ContractData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        autoFirstPage: true,
      });

      const buffers: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => {
        buffers.push(chunk);
      });
      
      doc.on("end", () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);
          if (pdfBuffer.length === 0) {
            reject(new Error("Generated PDF is empty"));
            return;
          }
          resolve(pdfBuffer);
        } catch (err) {
          reject(err);
        }
      });
      
      doc.on("error", (err: Error) => {
        console.error("PDFDocument error:", err);
        reject(err);
      });

      // Header
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("Caravan Transport LLC", { align: "center" })
        .moveDown(0.5)
        .fontSize(16)
        .font("Helvetica")
        .text("Car Shipping Broker-Customer Agreement", { align: "center" })
        .moveDown(1);

      // Contract Information
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`Contract Number: ${contract.contractNumber}`)
        .font("Helvetica")
        .text(`Title: ${contract.title}`)
        .moveDown(0.5);

      // Customer Information
      doc
        .font("Helvetica-Bold")
        .text("Customer Information:")
        .font("Helvetica")
        .text(`Name: ${contract.customerName}`)
        .text(`Email: ${contract.customerEmail}`)
        .moveDown(1);

      // Contract Terms
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("Contract Terms and Conditions")
        .moveDown(0.5)
        .font("Helvetica")
        .fontSize(11);

      // Split description into paragraphs and add them
      const description = contract.description || "";
      const paragraphs = description.split("\n").filter((p) => p.trim().length > 0);

      paragraphs.forEach((paragraph) => {
        const trimmed = paragraph.trim();
        const isHeading = /^\d+\./.test(trimmed);
        
        // Check if it's a heading (starts with number)
        if (isHeading) {
          doc.font("Helvetica-Bold").fontSize(12);
        } else {
          doc.font("Helvetica").fontSize(11);
        }

        // Handle long lines by wrapping
        doc.text(trimmed, {
          align: "left",
          indent: isHeading ? 0 : 20,
        });
        doc.moveDown(0.3);
      });

      // Financial Information
      doc.moveDown(1).font("Helvetica-Bold").fontSize(12).text("Financial Information:");
      doc
        .font("Helvetica")
        .fontSize(11)
        .text(`Total Amount: ${contract.currency} $${contract.totalAmount.toFixed(2)}`);

      // Payment Method
      if (contract.paymentMethod) {
        const paymentMethodText = 
          contract.paymentMethod === "credit_card" ? "Credit Card (Full Payment Online)" :
          contract.paymentMethod === "cod" ? "Cash on Delivery (COD)" :
          "Split Payment";
        doc.text(`Payment Method: ${paymentMethodText}`);
      }

      // Payment Breakdown
      if (contract.transportAmount || contract.brokerFeeAmount) {
        doc.moveDown(0.3);
        if (contract.transportAmount) {
          doc.text(`Transport Fee: ${contract.currency} $${contract.transportAmount.toFixed(2)}`);
        }
        if (contract.brokerFeeAmount) {
          doc.text(`Broker Fee: ${contract.currency} $${contract.brokerFeeAmount.toFixed(2)}`);
        }
      }

      // Split Payment Details
      if (contract.paymentMethod === "split") {
        doc.moveDown(0.3);
        if (contract.amountPaidOnline) {
          doc.text(`Amount Paid Online: ${contract.currency} $${contract.amountPaidOnline.toFixed(2)}`);
        }
        if (contract.amountPaidCOD) {
          doc.text(`Amount Paid COD: ${contract.currency} $${contract.amountPaidCOD.toFixed(2)}`);
        }
      }

      if (contract.depositAmount) {
        doc.moveDown(0.3);
        doc.text(`Deposit Amount: ${contract.currency} $${contract.depositAmount.toFixed(2)}`);
      }

      // Important Dates
      if (contract.pickupDate || contract.deliveryDate || contract.estimatedDelivery) {
        doc.moveDown(1).font("Helvetica-Bold").fontSize(12).text("Important Dates:");
        doc.font("Helvetica").fontSize(11);

        if (contract.pickupDate) {
          doc.text(
            `Pickup Date: ${new Date(contract.pickupDate).toLocaleDateString()}`
          );
        }
        if (contract.deliveryDate) {
          doc.text(
            `Delivery Date: ${new Date(contract.deliveryDate).toLocaleDateString()}`
          );
        }
        if (contract.estimatedDelivery) {
          doc.text(
            `Estimated Delivery: ${new Date(contract.estimatedDelivery).toLocaleDateString()}`
          );
        }
      }

      // Signature Section
      doc.moveDown(2).font("Helvetica-Bold").fontSize(12).text("Signatures:");
      doc.font("Helvetica").fontSize(11).moveDown(1);

      // Broker Signature
      doc.text("Broker: Caravan Transport LLC").moveDown(0.5);
      doc.text("_________________________").moveDown(1.5);

      // Customer Signature
      if (contract.signedBy && contract.signedAt) {
        doc.text(`Customer: ${contract.signedBy}`);
        doc.text(
          `Signed on: ${new Date(contract.signedAt).toLocaleDateString()}`
        );
      } else {
        doc.text("Customer:").moveDown(0.5);
        doc.text("_________________________");
      }

      // Footer
      const pageHeight = doc.page.height;
      const pageWidth = doc.page.width;
      doc
        .fontSize(8)
        .font("Helvetica")
        .text(
          `Generated on ${new Date().toLocaleDateString()}`,
          pageWidth - 200,
          pageHeight - 30,
          { align: "right" }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

