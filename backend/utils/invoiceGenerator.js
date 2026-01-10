import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Generate invoice PDF for an order
 * @param {Object} order - Order object with all details
 * @param {Object} user - User object with name, email, mobile
 * @returns {Promise<string>} - Path to generated PDF file
 */
export async function generateInvoicePDF(order, user) {
  return new Promise((resolve, reject) => {
    try {
      // Create invoices directory if it doesn't exist
      const invoicesDir = path.join(__dirname, '..', 'uploads', 'invoices')
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true })
      }

      // Generate filename
      const filename = `invoice-${order.orderId}-${Date.now()}.pdf`
      const filepath = path.join(invoicesDir, filename)

      // Create PDF document
      const doc = new PDFDocument({ size: 'A4', margin: 50 })

      // Pipe PDF to file
      const stream = fs.createWriteStream(filepath)
      doc.pipe(stream)

      // Company Header
      doc.fontSize(24).font('Helvetica-Bold').text('ARUDHRA FASHIONS', { align: 'center' })
      doc.moveDown(0.5)
      doc.fontSize(12).font('Helvetica').text('Invoice', { align: 'center' })
      doc.moveDown(1)

      // Invoice Details
      doc.fontSize(10).font('Helvetica')
      doc.text(`Invoice Number: ${order.orderId}`, { continued: true, align: 'right' })
      doc.moveDown(0.3)
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, { align: 'right' })
      doc.moveDown(1)

      // Customer Details
      doc.fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, doc.y)
      doc.moveDown(0.5)
      doc.fontSize(10).font('Helvetica')
      doc.text(user.name || order.shippingAddress?.name || 'Customer')
      if (user.email || order.shippingAddress?.email) {
        doc.text(`Email: ${user.email || order.shippingAddress?.email}`)
      }
      if (user.mobile || order.shippingAddress?.mobile) {
        doc.text(`Mobile: ${user.mobile || order.shippingAddress?.mobile}`)
      }
      doc.moveDown(0.5)

      // Shipping Address
      if (order.shippingAddress) {
        doc.fontSize(12).font('Helvetica-Bold').text('Ship To:', 50, doc.y)
        doc.moveDown(0.5)
        doc.fontSize(10).font('Helvetica')
        doc.text(order.shippingAddress.name || user.name || 'Customer')
        doc.text(order.shippingAddress.address || '')
        doc.text(`${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zipCode || order.shippingAddress.zip || ''}`)
        doc.moveDown(1)
      }

      // Items Table Header
      const tableTop = doc.y
      doc.fontSize(10).font('Helvetica-Bold')
      doc.text('Item', 50, tableTop)
      doc.text('Size', 200, tableTop)
      doc.text('Color', 250, tableTop)
      doc.text('Qty', 300, tableTop)
      doc.text('Price', 350, tableTop, { width: 100, align: 'right' })
      doc.text('Total', 450, tableTop, { width: 100, align: 'right' })

      // Draw line under header
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke()
      doc.moveDown(0.5)

      // Items
      let yPos = doc.y
      doc.font('Helvetica')
      order.items.forEach((item, index) => {
        const itemName = item.name || item.product?.name || 'Product'
        const size = item.size || '-'
        const color = item.color || '-'
        const quantity = item.quantity || 1
        const price = parseFloat(item.price || 0)
        const total = price * quantity

        // Check if we need a new page
        if (yPos > 700) {
          doc.addPage()
          yPos = 50
        }

        doc.fontSize(9).text(itemName, 50, yPos, { width: 140 })
        doc.text(size, 200, yPos, { width: 40 })
        doc.text(color, 250, yPos, { width: 40 })
        doc.text(quantity.toString(), 300, yPos, { width: 40 })
        doc.text(`₹${price.toFixed(2)}`, 350, yPos, { width: 100, align: 'right' })
        doc.text(`₹${total.toFixed(2)}`, 450, yPos, { width: 100, align: 'right' })

        yPos += 20
      })

      doc.y = yPos + 10

      // Draw line before totals
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
      doc.moveDown(0.5)

      // Totals
      const subtotal = parseFloat(order.subtotal || 0)
      const shippingCost = parseFloat(order.shippingCost || 0)
      const tax = parseFloat(order.tax || 0)
      const grandTotal = parseFloat(order.total || 0)

      doc.fontSize(10).font('Helvetica')
      doc.text('Subtotal:', 350, doc.y, { width: 100, align: 'right' })
      doc.text(`₹${subtotal.toFixed(2)}`, 450, doc.y, { width: 100, align: 'right' })
      doc.moveDown(0.5)

      if (shippingCost > 0) {
        doc.text('Shipping:', 350, doc.y, { width: 100, align: 'right' })
        doc.text(`₹${shippingCost.toFixed(2)}`, 450, doc.y, { width: 100, align: 'right' })
        doc.moveDown(0.5)
      }

      if (tax > 0) {
        doc.text('Tax (GST):', 350, doc.y, { width: 100, align: 'right' })
        doc.text(`₹${tax.toFixed(2)}`, 450, doc.y, { width: 100, align: 'right' })
        doc.moveDown(0.5)
      }

      // Grand Total
      doc.fontSize(12).font('Helvetica-Bold')
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
      doc.moveDown(0.5)
      doc.text('Total:', 350, doc.y, { width: 100, align: 'right' })
      doc.text(`₹${grandTotal.toFixed(2)}`, 450, doc.y, { width: 100, align: 'right' })

      // Footer
      doc.moveDown(2)
      doc.fontSize(9).font('Helvetica')
      doc.text('Thank you for your business!', { align: 'center' })
      doc.moveDown(0.5)
      doc.text('For any queries, please contact us at support@arudhraboutique.com', { align: 'center' })

      // Finalize PDF
      doc.end()

      stream.on('finish', () => {
        resolve(`/uploads/invoices/${filename}`)
      })

      stream.on('error', (error) => {
        reject(error)
      })
    } catch (error) {
      reject(error)
    }
  })
}
