function SizeGuide() {
  const womenSizes = {
    XS: { Bust: '76-80 cm', Waist: '60-64 cm', Hip: '84-88 cm', Indian: '28' },
    S: { Bust: '80-84 cm', Waist: '64-68 cm', Hip: '88-92 cm', Indian: '30' },
    M: { Bust: '84-88 cm', Waist: '68-72 cm', Hip: '92-96 cm', Indian: '32' },
    L: { Bust: '88-92 cm', Waist: '72-76 cm', Hip: '96-100 cm', Indian: '34' },
    XL: { Bust: '92-96 cm', Waist: '76-80 cm', Hip: '100-104 cm', Indian: '36' },
    XXL: { Bust: '96-100 cm', Waist: '80-84 cm', Hip: '104-108 cm', Indian: '38' }
  }

  const teenSizes = {
    XS: { Bust: '72-76 cm', Waist: '56-60 cm', Hip: '80-84 cm', Indian: '26' },
    S: { Bust: '76-80 cm', Waist: '60-64 cm', Hip: '84-88 cm', Indian: '28' },
    M: { Bust: '80-84 cm', Waist: '64-68 cm', Hip: '88-92 cm', Indian: '30' },
    L: { Bust: '84-88 cm', Waist: '68-72 cm', Hip: '92-96 cm', Indian: '32' },
    XL: { Bust: '88-92 cm', Waist: '72-76 cm', Hip: '96-100 cm', Indian: '34' }
  }

  const girlsSizes = {
    4: { Chest: '56-60 cm', Waist: '54-58 cm', Height: '96-106 cm', Age: '4-5 years' },
    6: { Chest: '60-64 cm', Waist: '58-62 cm', Height: '106-116 cm', Age: '6-7 years' },
    8: { Chest: '64-68 cm', Waist: '62-66 cm', Height: '116-126 cm', Age: '8-9 years' },
    10: { Chest: '68-72 cm', Waist: '66-70 cm', Height: '126-136 cm', Age: '10-11 years' },
    12: { Chest: '72-76 cm', Waist: '70-74 cm', Height: '136-146 cm', Age: '12-13 years' }
  }

  return (
    <div className="size-guide-page">
      <div className="container">
        <h1>Size Guide</h1>
        <p className="page-intro">
          Use our size guide to find the perfect fit. All measurements are in centimeters (cm) with Indian size numbers. 
          If you're between sizes, we recommend sizing up.
        </p>

        <div className="size-guide-sections">
          <section className="size-section">
            <h2>Women's Sizes</h2>
            <div className="size-table-wrapper">
              <table className="size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Bust (cm)</th>
                    <th>Waist (cm)</th>
                    <th>Hip (cm)</th>
                    <th>Indian Size</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(womenSizes).map(([size, measurements]) => (
                    <tr key={size}>
                      <td><strong>{size}</strong></td>
                      <td>{measurements.Bust}</td>
                      <td>{measurements.Waist}</td>
                      <td>{measurements.Hip}</td>
                      <td>{measurements.Indian}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="size-section">
            <h2>Teen's Sizes</h2>
            <div className="size-table-wrapper">
              <table className="size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Bust (cm)</th>
                    <th>Waist (cm)</th>
                    <th>Hip (cm)</th>
                    <th>Indian Size</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(teenSizes).map(([size, measurements]) => (
                    <tr key={size}>
                      <td><strong>{size}</strong></td>
                      <td>{measurements.Bust}</td>
                      <td>{measurements.Waist}</td>
                      <td>{measurements.Hip}</td>
                      <td>{measurements.Indian}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="size-section">
            <h2>Girls' Sizes</h2>
            <div className="size-table-wrapper">
              <table className="size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest (cm)</th>
                    <th>Waist (cm)</th>
                    <th>Height (cm)</th>
                    <th>Age</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(girlsSizes).map(([size, measurements]) => (
                    <tr key={size}>
                      <td><strong>{size}</strong></td>
                      <td>{measurements.Chest}</td>
                      <td>{measurements.Waist}</td>
                      <td>{measurements.Height}</td>
                      <td>{measurements.Age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="size-tips">
          <h2>How to Measure</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <h3>Bust/Chest</h3>
              <p>Measure around the fullest part of your chest, keeping the tape measure level.</p>
            </div>
            <div className="tip-card">
              <h3>Waist</h3>
              <p>Measure around the narrowest part of your waist, usually just above the belly button.</p>
            </div>
            <div className="tip-card">
              <h3>Hip</h3>
              <p>Measure around the fullest part of your hips, usually 7-9 inches below your waist.</p>
            </div>
            <div className="tip-card">
              <h3>General Tips</h3>
              <p>
                Wear form-fitting clothing when measuring. Keep the tape measure snug but not tight. 
                If you're between sizes, we recommend sizing up.
              </p>
            </div>
          </div>
        </div>

        <div className="size-help">
          <h2>Need Help?</h2>
          <p>If you're unsure about your size, our customer service team is here to help!</p>
          <div className="help-actions">
            <a href="mailto:support@zaruboutique.com" className="btn btn-primary">
              Contact Us
            </a>
            <a href="tel:+1234567890" className="btn btn-outline">
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SizeGuide

