import Cover from '../components/Cover'

const TIER1 = [
  {
    name: 'Creatine Monohydrate',
    brand: 'Thorne — NSF Certified for Sport — 90 servings',
    dose: '5g daily', timing: 'Morning', cost: '~$42 / 3 months',
    why: 'Muscle preservation during reduced training, cognitive function, energy production. One of the most studied supplements on earth. Take daily — no loading phase needed.',
    links: [
      { label: 'Amazon →', url: 'https://www.amazon.com/dp/B07978VPPH' },
      { label: 'Thorne →', url: 'https://www.thorne.com/products/dp/creatine' },
    ],
  },
  {
    name: 'Omega-3 Fish Oil',
    brand: 'Nordic Naturals Ultimate Omega — 180 softgels',
    dose: '2–3 softgels', timing: 'Morning with food', cost: '~$55/mo',
    why: 'Anti-inflammatory — directly supports Achilles, shoulder, and knee recovery. Brain health, cardiovascular support. Triglyceride form for best absorption.',
    links: [
      { label: 'Amazon →', url: 'https://www.amazon.com/dp/B002CQU564' },
      { label: 'Nordic Naturals →', url: 'https://www.nordicnaturals.com/products/ultimate-omega' },
    ],
  },
  {
    name: 'Vitamin D3 + K2 Liquid',
    brand: 'Thorne — 1 fl oz — 600 servings (~20 months)',
    dose: '2 drops (adjust after labs)', timing: 'Morning with fat', cost: '~$28 total',
    why: 'Vermont winters = near-certain deficiency. Impacts testosterone, immune function, bone density. K2 directs calcium to bones. Adjust after Preventive Medicine VT bloodwork.',
    links: [
      { label: 'Amazon →', url: 'https://www.amazon.com/dp/B0038NF8MG' },
      { label: 'Thorne →', url: 'https://www.thorne.com/products/dp/vitamin-d-k2-liquid' },
    ],
  },
  {
    name: 'Magnesium Bisglycinate',
    brand: 'Thorne Powder — NSF Certified — 60 servings',
    dose: '1 scoop → 2 scoops', timing: 'Night before bed', cost: '~$16/mo',
    why: 'Sleep quality, muscle relaxation, stress regulation. Start at 1 scoop for first 3–4 nights before moving to 2 scoops. Cofactor for D3 — the two work together.',
    links: [
      { label: 'Amazon →', url: 'https://www.amazon.com/dp/B0797HBLL3' },
      { label: 'Thorne →', url: 'https://www.thorne.com/products/dp/magnesium-bisglycinate' },
    ],
  },
]

const CRITICAL = [
  {
    name: 'Hydrolyzed Collagen Peptides',
    brand: 'Vital Proteins — 20oz (~27 servings)',
    dose: '15–20g', timing: '30–60 min pre-PT only', cost: '~$30/mo',
    why: 'Glycine, proline, hydroxyproline for collagen synthesis. Cold or room temp water only. Always pair with vitamin C at same time.',
    links: [
      { label: 'Amazon →', url: 'https://www.amazon.com/dp/B00XVH6ZGQ' },
      { label: 'Vital Proteins →', url: 'https://www.vitalproteins.com/products/collagen-peptides' },
    ],
  },
  {
    name: 'Vitamin C 500mg + Bioflavonoids',
    brand: 'Thorne — Third-Party Certified — 90 servings',
    dose: '1 capsule (500mg)', timing: 'With collagen pre-PT', cost: '~$6/mo',
    why: "Required for final collagen crosslinking. Bioflavonoids support microcirculation — relevant given Achilles' poor blood supply. Take simultaneously with collagen.",
    links: [
      { label: 'Amazon →', url: 'https://www.amazon.com/dp/B09FYFM7N3' },
      { label: 'Thorne →', url: 'https://www.thorne.com/products/dp/vitamin-c-500-bioflavonoids' },
    ],
  },
]

const TIER2 = [
  {
    name: 'Ashwagandha KSM-66',
    brand: 'Momentous — Informed Sport — 60 caps',
    dose: '600mg (1 cap)', timing: 'Night with magnesium', cost: '~$20/mo',
    why: 'Cortisol reduction ~27.9% in RCT. Takes 6–8 weeks for full effect — don\'t expect to feel it immediately.',
    links: [
      { label: 'Amazon →', url: 'https://www.amazon.com/dp/B09K3SXJTB' },
      { label: 'Momentous →', url: 'https://www.livemomentous.com/products/ashwagandha' },
    ],
  },
  {
    name: "Lion's Mane Mushroom",
    brand: 'Real Mushrooms — Fruiting body — Purity-IQ certified',
    dose: '2 caps (1,000mg)', timing: 'Morning', cost: '~$18/mo',
    why: 'NGF stimulation, cognitive function, focus, neuroprotection. Fruiting body only — most brands use myceliated grain. Real Mushrooms verifies beta-glucan content.',
    links: [
      { label: 'Amazon →', url: 'https://www.amazon.com/dp/B00RNIAPNK' },
      { label: 'Real Mushrooms →', url: 'https://www.realmushrooms.com/products/organic-lions-mane-mushroom-capsules' },
    ],
  },
  {
    name: 'Sulforaphane (Avmacol)',
    brand: 'Avmacol Regular — Johns Hopkins clinical trials',
    dose: '2 tablets', timing: 'Midday with lunch', cost: '~$38/mo',
    why: 'Nrf2 pathway activation — cellular detox, anti-inflammatory, longevity. Contains glucoraphanin + myrosinase for ~35% bioavailability. Regular formula only.',
    links: [
      { label: 'Amazon →', url: 'https://www.amazon.com/dp/B00ZDF3GI4' },
      { label: 'Avmacol →', url: 'https://www.avmacol.com' },
    ],
  },
  {
    name: 'Whey Protein Isolate',
    brand: 'Momentous — Informed Sport — 30 servings',
    dose: '25–40g as needed', timing: 'Fill protein gaps', cost: '~$55/mo if needed',
    why: 'Use only to hit 175–200g/day total protein target. Track in MyFitnessPal. Skip if hitting target through food.',
    links: [
      { label: 'Amazon →', url: 'https://www.amazon.com/dp/B0832PHNQS' },
      { label: 'Momentous →', url: 'https://www.livemomentous.com/products/whey-protein' },
    ],
  },
]

function SuppCard({ supp, tier }) {
  return (
    <div className={`supp-card ${tier}`}>
      <div className="supp-name">{supp.name}</div>
      <div className="supp-brand">{supp.brand}</div>
      <div className="supp-row">
        <span className="supp-pill supp-pill-dose">{supp.dose}</span>
        <span className="supp-pill supp-pill-time">{supp.timing}</span>
        <span className="supp-pill supp-pill-dose">{supp.cost}</span>
      </div>
      <div className="supp-why">{supp.why}</div>
      <div className="supp-links">
        {supp.links.map(l => (
          <a key={l.label} className="supp-link" href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
        ))}
      </div>
    </div>
  )
}

export default function Supplements() {
  return (
    <>
      <Cover bgText="STACK" label="Supplement protocol — evidence-based — updated April 2026" />
      <div className="page-inner">
        <div className="page-icon">💊</div>
        <div className="page-title">Supplement Protocol</div>
        <div className="page-sub">Complete daily stack with doses, timing, brands, and purchase links. ~$202–257/month.</div>

        <div className="callout callout-blue">
          <span className="callout-icon">💡</span>
          <div className="callout-content">
            <div className="callout-title">Adjust D3 after bloodwork</div>
            <div className="callout-text">Start D3 at 2 drops until you have your 25-OH Vitamin D level from Preventive Medicine VT. Magnesium: start at 1 scoop for 3–4 nights before moving to 2 scoops.</div>
          </div>
        </div>

        <div className="section-label">Daily timing reference</div>
        <div className="timing-block">
          <div className="timing-header th-morning">☀ Morning — with breakfast</div>
          <div className="timing-items">
            {[['Creatine monohydrate','5g'],['Omega-3 fish oil','2–3 softgels'],['Vitamin D3 + K2 liquid','2 drops'],["Lion's Mane mushroom",'2 capsules']].map(([n,d]) => (
              <div key={n} className="timing-item"><span className="t-name">{n}</span><span className="t-dose">{d}</span></div>
            ))}
          </div>
        </div>
        <div className="timing-block">
          <div className="timing-header th-midday">🌿 Midday — with lunch</div>
          <div className="timing-items">
            <div className="timing-item"><span className="t-name">Avmacol (sulforaphane)</span><span className="t-dose">2 tablets</span></div>
          </div>
        </div>
        <div className="timing-block">
          <div className="timing-header th-pre">🔴 Pre-PT only — 30–60 min before</div>
          <div className="timing-items">
            <div className="timing-item"><span className="t-name">Collagen peptides + Vitamin C 500mg</span><span className="t-dose">15–20g + 1 capsule — taken together</span></div>
          </div>
        </div>
        <div className="timing-block" style={{ marginBottom: 20 }}>
          <div className="timing-header th-night">🌙 Night — 30–60 min before bed</div>
          <div className="timing-items">
            {[['Magnesium bisglycinate','1–2 scoops (200–400mg)'],['Ashwagandha KSM-66','1 capsule (600mg)']].map(([n,d]) => (
              <div key={n} className="timing-item"><span className="t-name">{n}</span><span className="t-dose">{d}</span></div>
            ))}
          </div>
        </div>

        <div className="section-label">Tier 1 — daily foundation</div>
        <div className="supp-grid">
          {TIER1.map(s => <SuppCard key={s.name} supp={s} tier="t1" />)}
        </div>

        <div className="section-label">Critical — Achilles tendon recovery</div>
        <div className="callout callout-red" style={{ marginBottom: 12 }}>
          <span className="callout-icon">🔴</span>
          <div className="callout-content">
            <div className="callout-title">GRADE A evidence — do not skip on PT days</div>
            <div className="callout-text">2025 systematic review found GRADE A evidence for tendon cross-sectional area and stiffness improvement at 15–30g/day combined with loading. The 30–60 min pre-PT timing is not optional.</div>
          </div>
        </div>
        <div className="supp-grid">
          {CRITICAL.map(s => <SuppCard key={s.name} supp={s} tier="tc" />)}
        </div>

        <div className="section-label">Tier 2 — performance, brain &amp; stress</div>
        <div className="supp-grid">
          {TIER2.map(s => <SuppCard key={s.name} supp={s} tier="t2" />)}
        </div>
      </div>
    </>
  )
}
