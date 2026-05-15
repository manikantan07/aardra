const badges = [
  { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: '↩', title: 'Free Returns', desc: '30-day return policy' },
  { icon: '🔒', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
  { icon: '💬', title: '24/7 Support', desc: 'Always here to help' },
];

export default function TrustBadges() {
  return (
    <section className="section-sm bg-white border-top">
      <div className="container">
        <div className="row g-4">
          {badges.map((badge) => (
            <div key={badge.title} className="col-6 col-md-3">
              <div className="trust-badge">
                <div className="icon">{badge.icon}</div>
                <h6>{badge.title}</h6>
                <p>{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
