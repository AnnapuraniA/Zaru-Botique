import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Returns() {
  const navigate = useNavigate()

  return (
    <div className="returns-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="page-header">
          <h1>Returns & Exchanges</h1>
          <p>Our hassle-free return and exchange policy</p>
        </div>

        <div className="info-sections">
          <section className="info-section">
            <h2>Return Policy</h2>
            <p>We want you to love your purchase! If you're not completely satisfied, you can return most items within <strong>7 days</strong> of delivery.</p>
            
            <div className="policy-box">
              <h3>Items Eligible for Return:</h3>
              <ul className="info-list">
                <li>Items must be unworn, unwashed, and unused</li>
                <li>Original tags must be attached</li>
                <li>Items must be in original packaging</li>
                <li>Proof of purchase required</li>
              </ul>
            </div>

            <div className="policy-box warning">
              <h3>Non-Returnable Items:</h3>
              <ul className="info-list">
                <li>Sale items (unless defective)</li>
                <li>Items without original tags</li>
                <li>Damaged items due to misuse</li>
                <li>Items returned after 7 days</li>
              </ul>
            </div>
          </section>

          <section className="info-section">
            <h2>How to Return an Item</h2>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Log into Your Account</h3>
                  <p>Go to your Dashboard and click on "Orders"</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Select the Order</h3>
                  <p>Find the order containing the item you want to return</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Initiate Return</h3>
                  <p>Click "Return Item" and select the reason for return</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Print Return Label</h3>
                  <p>Download and print the return shipping label</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h3>Pack & Ship</h3>
                  <p>Pack the item securely with the return label and drop it off at the courier service</p>
                </div>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2>Exchange Policy</h2>
            <p>You can exchange items for a different size or color within 7 days of delivery.</p>
            <ul className="info-list">
              <li>Exchanges are subject to availability</li>
              <li>If the desired size/color is unavailable, we'll process a refund</li>
              <li>Price difference will be charged or refunded accordingly</li>
              <li>Free return shipping for exchanges</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Refund Process</h2>
            <div className="refund-info">
              <p><strong>Processing Time:</strong> 5-7 business days after we receive your return</p>
              <p><strong>Refund Method:</strong> Refunded to your original payment method</p>
              <p><strong>Shipping Charges:</strong> Original shipping charges are non-refundable unless the item is defective</p>
            </div>
          </section>

          <section className="info-section">
            <h2>Return Shipping</h2>
            <p>Return shipping charges apply unless the item is defective or incorrect. For exchanges, return shipping is free.</p>
            <p>You can use our prepaid return label or arrange your own shipping. If using your own shipping, please use a trackable service.</p>
          </section>

          <section className="info-section">
            <h2>Damaged or Defective Items</h2>
            <p>If you receive a damaged or defective item, please contact us immediately within 48 hours:</p>
            <ul className="info-list">
              <li>Email photos of the damage to support@arudhraboutique.com</li>
              <li>We'll arrange for a free return and replacement</li>
              <li>Full refund available if replacement is not possible</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Questions?</h2>
            <p>If you have any questions about returns or exchanges, please contact us:</p>
            <p><strong>Email:</strong> support@arudhraboutique.com</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Returns

