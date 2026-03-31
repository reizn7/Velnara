import { db as adminDb } from "@/lib/firebaseadmin";
import { verifySession } from "@/lib/verifySession";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await verifySession(req);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Not authorized" });

  const { clearExisting } = req.body || {};

  try {
    // Optionally clear existing medicines
    if (clearExisting) {
      const existing = await adminDb.collection("medicines").get();
      const deleteBatch = adminDb.batch();
      existing.docs.forEach((doc) => deleteBatch.delete(doc.ref));
      if (existing.docs.length > 0) await deleteBatch.commit();
    }

    const MEDICINES = [
      // ── FEVER & PAIN ──
      {
        name: "Paracetamol",
        category: "Fever & Pain",
        description: "Antipyretic and mild analgesic for fever and pain relief",
        variants: [
          { name: "Dolo 650", mg: "650mg", price: 30, manufacturer: "Micro Labs", form: "Tablet", packSize: "15 tablets", composition: "Paracetamol 650mg" },
          { name: "Crocin Advance", mg: "500mg", price: 25, manufacturer: "GSK", form: "Tablet", packSize: "15 tablets", composition: "Paracetamol 500mg" },
          { name: "Calpol", mg: "500mg", price: 20, manufacturer: "GSK", form: "Tablet", packSize: "10 tablets", composition: "Paracetamol 500mg" },
          { name: "Calpol Pediatric", mg: "250mg/5ml", price: 55, manufacturer: "GSK", form: "Syrup", packSize: "60ml", composition: "Paracetamol 250mg/5ml" },
          { name: "Dolo Drops", mg: "100mg/ml", price: 45, manufacturer: "Micro Labs", form: "Drops", packSize: "15ml", composition: "Paracetamol 100mg/ml" },
        ],
      },
      {
        name: "Ibuprofen",
        category: "Fever & Pain",
        description: "NSAID for pain, inflammation and fever",
        variants: [
          { name: "Brufen", mg: "400mg", price: 35, manufacturer: "Abbott", form: "Tablet", packSize: "15 tablets", composition: "Ibuprofen 400mg" },
          { name: "Brufen", mg: "200mg", price: 20, manufacturer: "Abbott", form: "Tablet", packSize: "15 tablets", composition: "Ibuprofen 200mg" },
          { name: "Ibugesic", mg: "400mg", price: 30, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Ibuprofen 400mg" },
          { name: "Ibugesic Plus", mg: "400mg+325mg", price: 45, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Ibuprofen 400mg + Paracetamol 325mg" },
        ],
      },
      {
        name: "Diclofenac",
        category: "Fever & Pain",
        description: "NSAID for acute pain, inflammation and arthritis",
        variants: [
          { name: "Voveran SR", mg: "100mg", price: 60, manufacturer: "Novartis", form: "Tablet", packSize: "10 tablets", composition: "Diclofenac Sodium 100mg SR" },
          { name: "Voveran", mg: "50mg", price: 30, manufacturer: "Novartis", form: "Tablet", packSize: "10 tablets", composition: "Diclofenac Sodium 50mg" },
          { name: "Voveran Emulgel", mg: "1%", price: 95, manufacturer: "Novartis", form: "Gel", packSize: "30g", composition: "Diclofenac Diethylamine 1.16%" },
        ],
      },
      {
        name: "Aceclofenac",
        category: "Fever & Pain",
        description: "NSAID for pain and inflammation",
        variants: [
          { name: "Zerodol SP", mg: "100mg+500mg+15mg", price: 85, manufacturer: "IPCA", form: "Tablet", packSize: "10 tablets", composition: "Aceclofenac 100mg + Paracetamol 500mg + Serratiopeptidase 15mg" },
          { name: "Zerodol P", mg: "100mg+500mg", price: 60, manufacturer: "IPCA", form: "Tablet", packSize: "10 tablets", composition: "Aceclofenac 100mg + Paracetamol 325mg" },
        ],
      },
      {
        name: "Aspirin",
        category: "Fever & Pain",
        description: "Pain reliever, anti-inflammatory and blood thinner",
        variants: [
          { name: "Disprin", mg: "350mg", price: 10, manufacturer: "Reckitt", form: "Tablet", packSize: "10 tablets", composition: "Aspirin 350mg" },
          { name: "Ecosprin", mg: "75mg", price: 15, manufacturer: "USV", form: "Tablet", packSize: "14 tablets", composition: "Aspirin 75mg EC" },
          { name: "Ecosprin Gold", mg: "75mg+20mg+10mg", price: 65, manufacturer: "USV", form: "Capsule", packSize: "10 capsules", composition: "Aspirin 75mg + Atorvastatin 20mg + Clopidogrel 75mg" },
        ],
      },
      {
        name: "Nimesulide",
        category: "Fever & Pain",
        description: "NSAID for acute pain and inflammation",
        variants: [
          { name: "Nice", mg: "100mg", price: 25, manufacturer: "Sanofi", form: "Tablet", packSize: "10 tablets", composition: "Nimesulide 100mg" },
          { name: "Nise", mg: "100mg", price: 30, manufacturer: "Dr. Reddy's", form: "Tablet", packSize: "10 tablets", composition: "Nimesulide 100mg" },
        ],
      },
      {
        name: "Mefenamic Acid",
        category: "Fever & Pain",
        description: "NSAID for menstrual pain and mild to moderate pain",
        variants: [
          { name: "Meftal Spas", mg: "250mg+10mg", price: 50, manufacturer: "Blue Cross", form: "Tablet", packSize: "10 tablets", composition: "Mefenamic Acid 250mg + Dicyclomine 10mg" },
          { name: "Ponstan", mg: "500mg", price: 35, manufacturer: "Pfizer", form: "Tablet", packSize: "10 tablets", composition: "Mefenamic Acid 500mg" },
        ],
      },
      {
        name: "Tramadol",
        category: "Fever & Pain",
        description: "Opioid analgesic for moderate to severe pain",
        variants: [
          { name: "Ultracet", mg: "37.5mg+325mg", price: 55, manufacturer: "J&J", form: "Tablet", packSize: "10 tablets", composition: "Tramadol 37.5mg + Paracetamol 325mg" },
        ],
      },

      // ── ANTIBIOTICS ──
      {
        name: "Amoxicillin",
        category: "Antibiotics",
        description: "Broad-spectrum penicillin antibiotic",
        variants: [
          { name: "Mox", mg: "500mg", price: 65, manufacturer: "Ranbaxy", form: "Capsule", packSize: "10 capsules", composition: "Amoxicillin 500mg" },
          { name: "Mox", mg: "250mg", price: 40, manufacturer: "Ranbaxy", form: "Capsule", packSize: "10 capsules", composition: "Amoxicillin 250mg" },
          { name: "Novamox", mg: "500mg", price: 70, manufacturer: "Cipla", form: "Capsule", packSize: "10 capsules", composition: "Amoxicillin 500mg" },
          { name: "Amoxyclav", mg: "625mg", price: 120, manufacturer: "Alkem", form: "Tablet", packSize: "6 tablets", composition: "Amoxicillin 500mg + Clavulanic acid 125mg" },
        ],
      },
      {
        name: "Azithromycin",
        category: "Antibiotics",
        description: "Macrolide antibiotic for bacterial infections",
        variants: [
          { name: "Azithral", mg: "500mg", price: 90, manufacturer: "Alembic", form: "Tablet", packSize: "3 tablets", composition: "Azithromycin 500mg" },
          { name: "Zithromax", mg: "500mg", price: 110, manufacturer: "Pfizer", form: "Tablet", packSize: "3 tablets", composition: "Azithromycin 500mg" },
          { name: "Azee", mg: "500mg", price: 85, manufacturer: "Cipla", form: "Tablet", packSize: "3 tablets", composition: "Azithromycin 500mg" },
          { name: "Azee", mg: "250mg", price: 55, manufacturer: "Cipla", form: "Tablet", packSize: "6 tablets", composition: "Azithromycin 250mg" },
        ],
      },
      {
        name: "Ciprofloxacin",
        category: "Antibiotics",
        description: "Fluoroquinolone antibiotic for UTI, respiratory and GI infections",
        variants: [
          { name: "Ciplox", mg: "500mg", price: 55, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Ciprofloxacin 500mg" },
          { name: "Ciplox", mg: "250mg", price: 30, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Ciprofloxacin 250mg" },
          { name: "Ciplox TZ", mg: "500mg+600mg", price: 70, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Ciprofloxacin 500mg + Tinidazole 600mg" },
        ],
      },
      {
        name: "Cefixime",
        category: "Antibiotics",
        description: "Third-generation cephalosporin antibiotic",
        variants: [
          { name: "Taxim-O", mg: "200mg", price: 95, manufacturer: "Alkem", form: "Tablet", packSize: "10 tablets", composition: "Cefixime 200mg" },
          { name: "Zifi", mg: "200mg", price: 90, manufacturer: "FDC", form: "Tablet", packSize: "10 tablets", composition: "Cefixime 200mg" },
        ],
      },
      {
        name: "Metronidazole",
        category: "Antibiotics",
        description: "Antibiotic and antiprotozoal for infections",
        variants: [
          { name: "Flagyl", mg: "400mg", price: 20, manufacturer: "Abbott", form: "Tablet", packSize: "15 tablets", composition: "Metronidazole 400mg" },
          { name: "Metrogyl", mg: "400mg", price: 18, manufacturer: "J&J", form: "Tablet", packSize: "15 tablets", composition: "Metronidazole 400mg" },
        ],
      },
      {
        name: "Doxycycline",
        category: "Antibiotics",
        description: "Tetracycline antibiotic for acne, UTI and respiratory infections",
        variants: [
          { name: "Doxt SL", mg: "100mg", price: 75, manufacturer: "Dr. Reddy's", form: "Capsule", packSize: "10 capsules", composition: "Doxycycline 100mg" },
        ],
      },
      {
        name: "Levofloxacin",
        category: "Antibiotics",
        description: "Fluoroquinolone antibiotic for pneumonia, UTI",
        variants: [
          { name: "Levoflox", mg: "500mg", price: 70, manufacturer: "Cipla", form: "Tablet", packSize: "5 tablets", composition: "Levofloxacin 500mg" },
          { name: "Levomac", mg: "500mg", price: 65, manufacturer: "Macleods", form: "Tablet", packSize: "5 tablets", composition: "Levofloxacin 500mg" },
        ],
      },
      {
        name: "Ofloxacin",
        category: "Antibiotics",
        description: "Fluoroquinolone for UTI, ENT and respiratory infections",
        variants: [
          { name: "Oflox", mg: "200mg", price: 45, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Ofloxacin 200mg" },
          { name: "Oflomac OZ", mg: "200mg+500mg", price: 80, manufacturer: "Macleods", form: "Tablet", packSize: "10 tablets", composition: "Ofloxacin 200mg + Ornidazole 500mg" },
        ],
      },
      {
        name: "Cephalexin",
        category: "Antibiotics",
        description: "First-generation cephalosporin for skin and soft tissue infections",
        variants: [
          { name: "Sporidex", mg: "500mg", price: 80, manufacturer: "Sun Pharma", form: "Capsule", packSize: "10 capsules", composition: "Cephalexin 500mg" },
        ],
      },
      {
        name: "Norfloxacin",
        category: "Antibiotics",
        description: "Fluoroquinolone for urinary tract and GI infections",
        variants: [
          { name: "Norflox TZ", mg: "400mg+600mg", price: 55, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Norfloxacin 400mg + Tinidazole 600mg" },
        ],
      },
      {
        name: "Nitrofurantoin",
        category: "Antibiotics",
        description: "Antibiotic specifically for urinary tract infections",
        variants: [
          { name: "Furadantin", mg: "100mg", price: 35, manufacturer: "Sun Pharma", form: "Capsule", packSize: "10 capsules", composition: "Nitrofurantoin 100mg" },
        ],
      },

      // ── ALLERGY & ANTIHISTAMINES ──
      {
        name: "Cetirizine",
        category: "Allergy",
        description: "Antihistamine for allergies, hay fever and hives",
        variants: [
          { name: "Cetzine", mg: "10mg", price: 25, manufacturer: "Dr. Reddy's", form: "Tablet", packSize: "10 tablets", composition: "Cetirizine 10mg" },
          { name: "Okacet", mg: "10mg", price: 20, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Cetirizine 10mg" },
          { name: "Alerid", mg: "10mg", price: 22, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Cetirizine 10mg" },
        ],
      },
      {
        name: "Levocetirizine",
        category: "Allergy",
        description: "Antihistamine for allergic rhinitis and urticaria",
        variants: [
          { name: "Xyzal", mg: "5mg", price: 45, manufacturer: "UCB", form: "Tablet", packSize: "10 tablets", composition: "Levocetirizine 5mg" },
          { name: "Levocet", mg: "5mg", price: 30, manufacturer: "Alkem", form: "Tablet", packSize: "10 tablets", composition: "Levocetirizine 5mg" },
        ],
      },
      {
        name: "Montelukast",
        category: "Allergy",
        description: "Leukotriene inhibitor for asthma and allergies",
        variants: [
          { name: "Montair LC", mg: "10mg+5mg", price: 120, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Montelukast 10mg + Levocetirizine 5mg" },
          { name: "Montair", mg: "10mg", price: 90, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Montelukast 10mg" },
        ],
      },
      {
        name: "Fexofenadine",
        category: "Allergy",
        description: "Non-drowsy antihistamine",
        variants: [
          { name: "Allegra", mg: "120mg", price: 110, manufacturer: "Sanofi", form: "Tablet", packSize: "10 tablets", composition: "Fexofenadine 120mg" },
          { name: "Allegra", mg: "180mg", price: 140, manufacturer: "Sanofi", form: "Tablet", packSize: "10 tablets", composition: "Fexofenadine 180mg" },
        ],
      },
      {
        name: "Chlorpheniramine",
        category: "Allergy",
        description: "First-generation antihistamine for cold and allergy",
        variants: [
          { name: "Piriton", mg: "4mg", price: 10, manufacturer: "GSK", form: "Tablet", packSize: "10 tablets", composition: "Chlorpheniramine Maleate 4mg" },
        ],
      },
      {
        name: "Hydroxyzine",
        category: "Allergy",
        description: "Antihistamine for anxiety and itching",
        variants: [
          { name: "Atarax", mg: "25mg", price: 40, manufacturer: "UCB", form: "Tablet", packSize: "10 tablets", composition: "Hydroxyzine 25mg" },
          { name: "Atarax", mg: "10mg", price: 25, manufacturer: "UCB", form: "Tablet", packSize: "10 tablets", composition: "Hydroxyzine 10mg" },
        ],
      },

      // ── GASTRO & ACIDITY ──
      {
        name: "Omeprazole",
        category: "Gastro & Acidity",
        description: "Proton pump inhibitor for acidity and GERD",
        variants: [
          { name: "Omez", mg: "20mg", price: 55, manufacturer: "Dr. Reddy's", form: "Capsule", packSize: "15 capsules", composition: "Omeprazole 20mg" },
          { name: "Omez D", mg: "20mg+10mg", price: 75, manufacturer: "Dr. Reddy's", form: "Capsule", packSize: "15 capsules", composition: "Omeprazole 20mg + Domperidone 10mg" },
        ],
      },
      {
        name: "Pantoprazole",
        category: "Gastro & Acidity",
        description: "PPI for peptic ulcer, GERD and acidity",
        variants: [
          { name: "Pan 40", mg: "40mg", price: 60, manufacturer: "Alkem", form: "Tablet", packSize: "15 tablets", composition: "Pantoprazole 40mg" },
          { name: "Pan D", mg: "40mg+30mg", price: 85, manufacturer: "Alkem", form: "Capsule", packSize: "10 capsules", composition: "Pantoprazole 40mg + Domperidone 30mg" },
          { name: "Pantocid", mg: "40mg", price: 65, manufacturer: "Sun Pharma", form: "Tablet", packSize: "15 tablets", composition: "Pantoprazole 40mg" },
        ],
      },
      {
        name: "Rabeprazole",
        category: "Gastro & Acidity",
        description: "PPI for GERD and peptic ulcers",
        variants: [
          { name: "Razo D", mg: "20mg+30mg", price: 90, manufacturer: "Dr. Reddy's", form: "Capsule", packSize: "10 capsules", composition: "Rabeprazole 20mg + Domperidone 30mg" },
          { name: "Rablet D", mg: "20mg+30mg", price: 85, manufacturer: "Lupin", form: "Capsule", packSize: "10 capsules", composition: "Rabeprazole 20mg + Domperidone 30mg" },
        ],
      },
      {
        name: "Ranitidine",
        category: "Gastro & Acidity",
        description: "H2 blocker for acidity and ulcers",
        variants: [
          { name: "Rantac", mg: "150mg", price: 25, manufacturer: "J&J", form: "Tablet", packSize: "10 tablets", composition: "Ranitidine 150mg" },
          { name: "Zinetac", mg: "150mg", price: 30, manufacturer: "GSK", form: "Tablet", packSize: "10 tablets", composition: "Ranitidine 150mg" },
        ],
      },
      {
        name: "Domperidone",
        category: "Gastro & Acidity",
        description: "Anti-emetic for nausea and vomiting",
        variants: [
          { name: "Domstal", mg: "10mg", price: 30, manufacturer: "Torrent", form: "Tablet", packSize: "10 tablets", composition: "Domperidone 10mg" },
        ],
      },
      {
        name: "Ondansetron",
        category: "Gastro & Acidity",
        description: "Anti-emetic for nausea and vomiting",
        variants: [
          { name: "Emeset", mg: "4mg", price: 40, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Ondansetron 4mg" },
          { name: "Vomikind", mg: "4mg", price: 35, manufacturer: "Mankind", form: "Tablet", packSize: "10 tablets", composition: "Ondansetron 4mg" },
        ],
      },
      {
        name: "Sucralfate",
        category: "Gastro & Acidity",
        description: "Mucosal protective agent for ulcers",
        variants: [
          { name: "Sucral", mg: "1g", price: 70, manufacturer: "Torrent", form: "Suspension", packSize: "200ml", composition: "Sucralfate 1g/10ml" },
        ],
      },
      {
        name: "Antacid",
        category: "Gastro & Acidity",
        description: "Combination antacid for quick acidity relief",
        variants: [
          { name: "Digene", mg: "Multi", price: 55, manufacturer: "Abbott", form: "Gel", packSize: "200ml", composition: "Dried Aluminium Hydroxide + Magnesium Hydroxide + Simethicone" },
          { name: "Gelusil MPS", mg: "Multi", price: 45, manufacturer: "Pfizer", form: "Tablet", packSize: "15 tablets", composition: "Magaldrate + Simethicone" },
        ],
      },
      {
        name: "Loperamide",
        category: "Gastro & Acidity",
        description: "Anti-diarrheal medication",
        variants: [
          { name: "Imodium", mg: "2mg", price: 25, manufacturer: "J&J", form: "Capsule", packSize: "6 capsules", composition: "Loperamide 2mg" },
          { name: "Eldoper", mg: "2mg", price: 15, manufacturer: "Elder", form: "Tablet", packSize: "4 tablets", composition: "Loperamide 2mg" },
        ],
      },
      {
        name: "Lactulose",
        category: "Gastro & Acidity",
        description: "Osmotic laxative for constipation",
        variants: [
          { name: "Duphalac", mg: "10g/15ml", price: 110, manufacturer: "Abbott", form: "Syrup", packSize: "200ml", composition: "Lactulose 10g/15ml" },
        ],
      },
      {
        name: "Isabgol",
        category: "Gastro & Acidity",
        description: "Natural fiber laxative for constipation",
        variants: [
          { name: "Sat Isabgol", mg: "Multi", price: 90, manufacturer: "Dabur", form: "Powder", packSize: "200g", composition: "Psyllium Husk" },
        ],
      },

      // ── DIABETES ──
      {
        name: "Metformin",
        category: "Diabetes",
        description: "First-line drug for type 2 diabetes",
        variants: [
          { name: "Glycomet", mg: "500mg", price: 25, manufacturer: "USV", form: "Tablet", packSize: "20 tablets", composition: "Metformin 500mg" },
          { name: "Glycomet GP", mg: "500mg+1mg", price: 65, manufacturer: "USV", form: "Tablet", packSize: "10 tablets", composition: "Metformin 500mg + Glimepiride 1mg" },
          { name: "Glycomet", mg: "1000mg", price: 40, manufacturer: "USV", form: "Tablet SR", packSize: "15 tablets", composition: "Metformin 1000mg SR" },
        ],
      },
      {
        name: "Glimepiride",
        category: "Diabetes",
        description: "Sulfonylurea for type 2 diabetes",
        variants: [
          { name: "Amaryl", mg: "1mg", price: 45, manufacturer: "Sanofi", form: "Tablet", packSize: "10 tablets", composition: "Glimepiride 1mg" },
          { name: "Amaryl", mg: "2mg", price: 65, manufacturer: "Sanofi", form: "Tablet", packSize: "10 tablets", composition: "Glimepiride 2mg" },
        ],
      },
      {
        name: "Sitagliptin",
        category: "Diabetes",
        description: "DPP-4 inhibitor for type 2 diabetes",
        variants: [
          { name: "Januvia", mg: "100mg", price: 280, manufacturer: "MSD", form: "Tablet", packSize: "7 tablets", composition: "Sitagliptin 100mg" },
          { name: "Janumet", mg: "50mg+500mg", price: 260, manufacturer: "MSD", form: "Tablet", packSize: "7 tablets", composition: "Sitagliptin 50mg + Metformin 500mg" },
        ],
      },
      {
        name: "Insulin",
        category: "Diabetes",
        description: "Injectable insulin for diabetes management",
        variants: [
          { name: "Mixtard 30", mg: "100 IU/ml", price: 135, manufacturer: "Novo Nordisk", form: "Injection", packSize: "1 vial (10ml)", composition: "Human Insulin 30/70" },
          { name: "Lantus", mg: "100 IU/ml", price: 550, manufacturer: "Sanofi", form: "Injection Pen", packSize: "1 pen (3ml)", composition: "Insulin Glargine 100 IU/ml" },
        ],
      },
      {
        name: "Voglibose",
        category: "Diabetes",
        description: "Alpha-glucosidase inhibitor for post-meal blood sugar",
        variants: [
          { name: "Volix", mg: "0.2mg", price: 55, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Voglibose 0.2mg" },
          { name: "Vobose", mg: "0.3mg", price: 70, manufacturer: "Lupin", form: "Tablet", packSize: "10 tablets", composition: "Voglibose 0.3mg" },
        ],
      },
      {
        name: "Gliclazide",
        category: "Diabetes",
        description: "Sulfonylurea for type 2 diabetes",
        variants: [
          { name: "Diamicron MR", mg: "60mg", price: 95, manufacturer: "Serdia", form: "Tablet", packSize: "10 tablets", composition: "Gliclazide 60mg MR" },
          { name: "Glycinorm", mg: "80mg", price: 35, manufacturer: "IPCA", form: "Tablet", packSize: "10 tablets", composition: "Gliclazide 80mg" },
        ],
      },
      {
        name: "Empagliflozin",
        category: "Diabetes",
        description: "SGLT2 inhibitor for type 2 diabetes and heart failure",
        variants: [
          { name: "Jardiance", mg: "10mg", price: 220, manufacturer: "Boehringer", form: "Tablet", packSize: "10 tablets", composition: "Empagliflozin 10mg" },
          { name: "Jardiance", mg: "25mg", price: 250, manufacturer: "Boehringer", form: "Tablet", packSize: "10 tablets", composition: "Empagliflozin 25mg" },
        ],
      },
      {
        name: "Pioglitazone",
        category: "Diabetes",
        description: "Thiazolidinedione for insulin resistance",
        variants: [
          { name: "Pioz", mg: "15mg", price: 40, manufacturer: "USV", form: "Tablet", packSize: "10 tablets", composition: "Pioglitazone 15mg" },
        ],
      },

      // ── HEART & BP ──
      {
        name: "Amlodipine",
        category: "Heart & BP",
        description: "Calcium channel blocker for hypertension and angina",
        variants: [
          { name: "Amlong", mg: "5mg", price: 25, manufacturer: "Micro Labs", form: "Tablet", packSize: "10 tablets", composition: "Amlodipine 5mg" },
          { name: "Amlong", mg: "10mg", price: 40, manufacturer: "Micro Labs", form: "Tablet", packSize: "10 tablets", composition: "Amlodipine 10mg" },
          { name: "Stamlo", mg: "5mg", price: 30, manufacturer: "Dr. Reddy's", form: "Tablet", packSize: "10 tablets", composition: "Amlodipine 5mg" },
        ],
      },
      {
        name: "Telmisartan",
        category: "Heart & BP",
        description: "ARB for hypertension",
        variants: [
          { name: "Telma", mg: "40mg", price: 55, manufacturer: "Glenmark", form: "Tablet", packSize: "10 tablets", composition: "Telmisartan 40mg" },
          { name: "Telma H", mg: "40mg+12.5mg", price: 75, manufacturer: "Glenmark", form: "Tablet", packSize: "10 tablets", composition: "Telmisartan 40mg + Hydrochlorothiazide 12.5mg" },
        ],
      },
      {
        name: "Atorvastatin",
        category: "Heart & BP",
        description: "Statin for high cholesterol",
        variants: [
          { name: "Atorva", mg: "10mg", price: 50, manufacturer: "Zydus", form: "Tablet", packSize: "10 tablets", composition: "Atorvastatin 10mg" },
          { name: "Atorva", mg: "20mg", price: 80, manufacturer: "Zydus", form: "Tablet", packSize: "10 tablets", composition: "Atorvastatin 20mg" },
          { name: "Lipitor", mg: "10mg", price: 65, manufacturer: "Pfizer", form: "Tablet", packSize: "10 tablets", composition: "Atorvastatin 10mg" },
        ],
      },
      {
        name: "Losartan",
        category: "Heart & BP",
        description: "ARB for hypertension and kidney protection",
        variants: [
          { name: "Losar", mg: "50mg", price: 45, manufacturer: "Unichem", form: "Tablet", packSize: "10 tablets", composition: "Losartan 50mg" },
          { name: "Losacar H", mg: "50mg+12.5mg", price: 60, manufacturer: "Cadila", form: "Tablet", packSize: "10 tablets", composition: "Losartan 50mg + Hydrochlorothiazide 12.5mg" },
        ],
      },
      {
        name: "Clopidogrel",
        category: "Heart & BP",
        description: "Antiplatelet for heart attack and stroke prevention",
        variants: [
          { name: "Clavix", mg: "75mg", price: 55, manufacturer: "Sun Pharma", form: "Tablet", packSize: "10 tablets", composition: "Clopidogrel 75mg" },
          { name: "Deplatt", mg: "75mg", price: 50, manufacturer: "Torrent", form: "Tablet", packSize: "10 tablets", composition: "Clopidogrel 75mg" },
        ],
      },
      {
        name: "Enalapril",
        category: "Heart & BP",
        description: "ACE inhibitor for hypertension and heart failure",
        variants: [
          { name: "Enace", mg: "5mg", price: 30, manufacturer: "Zydus", form: "Tablet", packSize: "10 tablets", composition: "Enalapril 5mg" },
          { name: "Enace D", mg: "5mg+12.5mg", price: 40, manufacturer: "Zydus", form: "Tablet", packSize: "10 tablets", composition: "Enalapril 5mg + HCTZ 12.5mg" },
        ],
      },
      {
        name: "Metoprolol",
        category: "Heart & BP",
        description: "Beta blocker for hypertension, angina and heart failure",
        variants: [
          { name: "Betaloc", mg: "50mg", price: 35, manufacturer: "AstraZeneca", form: "Tablet", packSize: "10 tablets", composition: "Metoprolol Succinate 50mg" },
          { name: "Met XL", mg: "25mg", price: 40, manufacturer: "Sun Pharma", form: "Tablet", packSize: "10 tablets", composition: "Metoprolol Succinate 25mg XL" },
        ],
      },
      {
        name: "Rosuvastatin",
        category: "Heart & BP",
        description: "Statin for high cholesterol and cardiovascular risk reduction",
        variants: [
          { name: "Rosuvas", mg: "10mg", price: 80, manufacturer: "Sun Pharma", form: "Tablet", packSize: "10 tablets", composition: "Rosuvastatin 10mg" },
          { name: "Crestor", mg: "10mg", price: 95, manufacturer: "AstraZeneca", form: "Tablet", packSize: "10 tablets", composition: "Rosuvastatin 10mg" },
        ],
      },
      {
        name: "Nitroglycerin",
        category: "Heart & BP",
        description: "Vasodilator for angina and chest pain",
        variants: [
          { name: "Sorbitrate", mg: "5mg", price: 20, manufacturer: "Sun Pharma", form: "Tablet", packSize: "30 tablets", composition: "Isosorbide Dinitrate 5mg" },
        ],
      },

      // ── VITAMINS & SUPPLEMENTS ──
      {
        name: "Vitamin D3",
        category: "Vitamins",
        description: "Cholecalciferol for vitamin D deficiency",
        variants: [
          { name: "D-Rise", mg: "60000 IU", price: 110, manufacturer: "USV", form: "Capsule", packSize: "4 capsules", composition: "Cholecalciferol 60000 IU" },
          { name: "Calcitas", mg: "60000 IU", price: 100, manufacturer: "Eris", form: "Capsule", packSize: "4 capsules", composition: "Cholecalciferol 60000 IU" },
          { name: "Tayo", mg: "60000 IU", price: 90, manufacturer: "Eris", form: "Sachet", packSize: "4 sachets", composition: "Cholecalciferol 60000 IU" },
        ],
      },
      {
        name: "Calcium",
        category: "Vitamins",
        description: "Calcium supplement for bone health",
        variants: [
          { name: "Shelcal 500", mg: "500mg+250 IU", price: 95, manufacturer: "Torrent", form: "Tablet", packSize: "15 tablets", composition: "Calcium Carbonate 500mg + Vitamin D3 250 IU" },
          { name: "CCM", mg: "500mg", price: 60, manufacturer: "Abbott", form: "Tablet", packSize: "15 tablets", composition: "Calcium Citrate Maleate 500mg" },
        ],
      },
      {
        name: "Vitamin B Complex",
        category: "Vitamins",
        description: "B vitamin supplement for energy and nerve health",
        variants: [
          { name: "Becosules", mg: "Multi", price: 30, manufacturer: "Pfizer", form: "Capsule", packSize: "20 capsules", composition: "Vitamin B complex + Vitamin C" },
          { name: "Neurobion Forte", mg: "Multi", price: 35, manufacturer: "Merck", form: "Tablet", packSize: "30 tablets", composition: "Vitamin B1 + B6 + B12" },
        ],
      },
      {
        name: "Iron + Folic Acid",
        category: "Vitamins",
        description: "Iron supplement for anemia",
        variants: [
          { name: "Autrin", mg: "100mg+1.5mg", price: 45, manufacturer: "Abbott", form: "Capsule", packSize: "10 capsules", composition: "Ferrous Fumarate 100mg + Folic Acid 1.5mg" },
          { name: "Livogen", mg: "Multi", price: 35, manufacturer: "Procter & Gamble", form: "Tablet", packSize: "10 tablets", composition: "Iron + Folic Acid" },
        ],
      },
      {
        name: "Multivitamin",
        category: "Vitamins",
        description: "Daily multivitamin and mineral supplement",
        variants: [
          { name: "Supradyn", mg: "Multi", price: 45, manufacturer: "Abbott", form: "Tablet", packSize: "15 tablets", composition: "Multivitamin + Minerals" },
          { name: "Revital H", mg: "Multi", price: 150, manufacturer: "Sun Pharma", form: "Capsule", packSize: "30 capsules", composition: "Multivitamin + Minerals + Ginseng" },
          { name: "Zincovit", mg: "Multi", price: 90, manufacturer: "Apex", form: "Tablet", packSize: "15 tablets", composition: "Zinc + Multivitamin" },
        ],
      },
      {
        name: "Omega 3",
        category: "Vitamins",
        description: "Fish oil for heart and joint health",
        variants: [
          { name: "Maxepa", mg: "1000mg", price: 180, manufacturer: "Merck", form: "Capsule", packSize: "30 capsules", composition: "Omega-3 Fatty Acids 1000mg" },
        ],
      },
      {
        name: "Folic Acid",
        category: "Vitamins",
        description: "Essential for pregnancy and cell growth",
        variants: [
          { name: "Folvite", mg: "5mg", price: 15, manufacturer: "Pfizer", form: "Tablet", packSize: "30 tablets", composition: "Folic Acid 5mg" },
        ],
      },
      {
        name: "Vitamin C",
        category: "Vitamins",
        description: "Antioxidant vitamin for immunity",
        variants: [
          { name: "Limcee", mg: "500mg", price: 20, manufacturer: "Abbott", form: "Chewable Tablet", packSize: "15 tablets", composition: "Ascorbic Acid 500mg" },
          { name: "Celin", mg: "500mg", price: 25, manufacturer: "GSK", form: "Tablet", packSize: "15 tablets", composition: "Ascorbic Acid 500mg" },
        ],
      },
      {
        name: "Vitamin E",
        category: "Vitamins",
        description: "Antioxidant for skin and cell protection",
        variants: [
          { name: "Evion", mg: "400mg", price: 35, manufacturer: "Merck", form: "Capsule", packSize: "10 capsules", composition: "Tocopheryl Acetate 400mg" },
        ],
      },
      {
        name: "Zinc",
        category: "Vitamins",
        description: "Mineral supplement for immunity and wound healing",
        variants: [
          { name: "Zinconia", mg: "50mg", price: 40, manufacturer: "FDC", form: "Tablet", packSize: "10 tablets", composition: "Zinc Sulphate 50mg" },
          { name: "Z&D", mg: "20mg+1000 IU", price: 55, manufacturer: "Alkem", form: "Tablet", packSize: "10 tablets", composition: "Zinc 20mg + Vitamin D3 1000 IU" },
        ],
      },

      // ── MENTAL HEALTH ──
      {
        name: "Escitalopram",
        category: "Mental Health",
        description: "SSRI antidepressant for anxiety and depression",
        variants: [
          { name: "Nexito", mg: "10mg", price: 80, manufacturer: "Sun Pharma", form: "Tablet", packSize: "10 tablets", composition: "Escitalopram 10mg" },
          { name: "Nexito Plus", mg: "5mg+0.5mg", price: 65, manufacturer: "Sun Pharma", form: "Tablet", packSize: "10 tablets", composition: "Escitalopram 5mg + Clonazepam 0.5mg" },
        ],
      },
      {
        name: "Alprazolam",
        category: "Mental Health",
        description: "Benzodiazepine for anxiety (Schedule H)",
        variants: [
          { name: "Alprax", mg: "0.25mg", price: 25, manufacturer: "Torrent", form: "Tablet", packSize: "10 tablets", composition: "Alprazolam 0.25mg" },
          { name: "Alprax", mg: "0.5mg", price: 30, manufacturer: "Torrent", form: "Tablet", packSize: "10 tablets", composition: "Alprazolam 0.5mg" },
        ],
      },
      {
        name: "Sertraline",
        category: "Mental Health",
        description: "SSRI antidepressant for depression, OCD and panic disorder",
        variants: [
          { name: "Daxid", mg: "50mg", price: 75, manufacturer: "Pfizer", form: "Tablet", packSize: "10 tablets", composition: "Sertraline 50mg" },
          { name: "Serta", mg: "50mg", price: 55, manufacturer: "Unichem", form: "Tablet", packSize: "10 tablets", composition: "Sertraline 50mg" },
        ],
      },
      {
        name: "Fluoxetine",
        category: "Mental Health",
        description: "SSRI for depression and OCD",
        variants: [
          { name: "Fludac", mg: "20mg", price: 40, manufacturer: "Cadila", form: "Capsule", packSize: "10 capsules", composition: "Fluoxetine 20mg" },
        ],
      },
      {
        name: "Clonazepam",
        category: "Mental Health",
        description: "Benzodiazepine for seizures and panic disorder",
        variants: [
          { name: "Clonotril", mg: "0.5mg", price: 30, manufacturer: "Torrent", form: "Tablet", packSize: "10 tablets", composition: "Clonazepam 0.5mg" },
          { name: "Rivotril", mg: "0.5mg", price: 35, manufacturer: "Roche", form: "Tablet", packSize: "10 tablets", composition: "Clonazepam 0.5mg" },
        ],
      },
      {
        name: "Melatonin",
        category: "Mental Health",
        description: "Natural sleep aid",
        variants: [
          { name: "Meloset", mg: "3mg", price: 50, manufacturer: "Aristo", form: "Tablet", packSize: "10 tablets", composition: "Melatonin 3mg" },
        ],
      },
      {
        name: "Amitriptyline",
        category: "Mental Health",
        description: "Tricyclic antidepressant for depression and neuropathic pain",
        variants: [
          { name: "Tryptomer", mg: "10mg", price: 15, manufacturer: "Merind", form: "Tablet", packSize: "10 tablets", composition: "Amitriptyline 10mg" },
          { name: "Tryptomer", mg: "25mg", price: 20, manufacturer: "Merind", form: "Tablet", packSize: "10 tablets", composition: "Amitriptyline 25mg" },
        ],
      },

      // ── COUGH & COLD ──
      {
        name: "Cough Syrup",
        category: "Cough & Cold",
        description: "Cough suppressant and expectorant",
        variants: [
          { name: "Benadryl", mg: "Multi", price: 75, manufacturer: "J&J", form: "Syrup", packSize: "100ml", composition: "Diphenhydramine + Ammonium Chloride + Sodium Citrate" },
          { name: "Corex DX", mg: "Multi", price: 80, manufacturer: "Pfizer", form: "Syrup", packSize: "100ml", composition: "Dextromethorphan + Chlorpheniramine" },
          { name: "Grilinctus", mg: "Multi", price: 70, manufacturer: "Franco Indian", form: "Syrup", packSize: "100ml", composition: "Dextromethorphan + Phenylephrine + Chlorpheniramine" },
        ],
      },
      {
        name: "Ambroxol",
        category: "Cough & Cold",
        description: "Mucolytic for productive cough and chest congestion",
        variants: [
          { name: "Mucinac", mg: "600mg", price: 100, manufacturer: "Cipla", form: "Effervescent Tablet", packSize: "10 tablets", composition: "Acetylcysteine 600mg" },
          { name: "Ambrodil S", mg: "Multi", price: 65, manufacturer: "Aristo", form: "Syrup", packSize: "100ml", composition: "Ambroxol + Guaifenesin + Levosalbutamol" },
        ],
      },
      {
        name: "Sinarest",
        category: "Cough & Cold",
        description: "Cold and flu relief combination",
        variants: [
          { name: "Sinarest", mg: "Multi", price: 30, manufacturer: "Centaur", form: "Tablet", packSize: "10 tablets", composition: "Paracetamol + Phenylephrine + Chlorpheniramine + Caffeine" },
          { name: "Sinarest AF", mg: "Multi", price: 35, manufacturer: "Centaur", form: "Tablet", packSize: "10 tablets", composition: "Paracetamol + Phenylephrine + Cetirizine" },
        ],
      },
      {
        name: "Nasal Drops/Spray",
        category: "Cough & Cold",
        description: "Decongestant nasal spray for blocked nose",
        variants: [
          { name: "Otrivin", mg: "0.1%", price: 75, manufacturer: "Novartis", form: "Nasal Spray", packSize: "10ml", composition: "Xylometazoline 0.1%" },
          { name: "Nasivion", mg: "0.05%", price: 65, manufacturer: "Merck", form: "Nasal Drops", packSize: "10ml", composition: "Oxymetazoline 0.05%" },
        ],
      },
      {
        name: "Steam Inhalation",
        category: "Cough & Cold",
        description: "Vapour rub and inhalation for congestion relief",
        variants: [
          { name: "Vicks VapoRub", mg: "Multi", price: 55, manufacturer: "P&G", form: "Ointment", packSize: "25g", composition: "Menthol + Camphor + Eucalyptus Oil" },
          { name: "Karvol Plus", mg: "Multi", price: 60, manufacturer: "Indoco", form: "Inhalation Capsule", packSize: "10 capsules", composition: "Menthol + Camphor + Eucalyptus + Chlorothymol" },
        ],
      },

      // ── SKIN & DERMATOLOGY ──
      {
        name: "Clotrimazole",
        category: "Skin",
        description: "Antifungal for skin infections, ringworm and candida",
        variants: [
          { name: "Candid", mg: "1%", price: 65, manufacturer: "Glenmark", form: "Cream", packSize: "20g", composition: "Clotrimazole 1%" },
          { name: "Candid B", mg: "1%+0.05%", price: 80, manufacturer: "Glenmark", form: "Cream", packSize: "15g", composition: "Clotrimazole 1% + Beclomethasone 0.025%" },
        ],
      },
      {
        name: "Fluconazole",
        category: "Skin",
        description: "Oral antifungal for fungal infections",
        variants: [
          { name: "Zocon", mg: "150mg", price: 40, manufacturer: "FDC", form: "Tablet", packSize: "1 tablet", composition: "Fluconazole 150mg" },
          { name: "Forcan", mg: "150mg", price: 35, manufacturer: "Cipla", form: "Tablet", packSize: "1 tablet", composition: "Fluconazole 150mg" },
        ],
      },
      {
        name: "Betamethasone",
        category: "Skin",
        description: "Topical steroid for eczema and dermatitis",
        variants: [
          { name: "Betnovate C", mg: "0.1%+1%", price: 50, manufacturer: "GSK", form: "Cream", packSize: "20g", composition: "Betamethasone 0.1% + Clioquinol 1%" },
          { name: "Betnovate N", mg: "0.1%+0.5%", price: 50, manufacturer: "GSK", form: "Cream", packSize: "20g", composition: "Betamethasone 0.1% + Neomycin 0.5%" },
        ],
      },
      {
        name: "Ketoconazole",
        category: "Skin",
        description: "Antifungal for dandruff and fungal skin infections",
        variants: [
          { name: "Nizoral", mg: "2%", price: 120, manufacturer: "J&J", form: "Shampoo", packSize: "100ml", composition: "Ketoconazole 2%" },
          { name: "Ketomac", mg: "2%", price: 85, manufacturer: "Torrent", form: "Cream", packSize: "30g", composition: "Ketoconazole 2%" },
        ],
      },
      {
        name: "Mupirocin",
        category: "Skin",
        description: "Topical antibiotic for skin infections and impetigo",
        variants: [
          { name: "T-Bact", mg: "2%", price: 110, manufacturer: "GSK", form: "Ointment", packSize: "5g", composition: "Mupirocin 2%" },
        ],
      },
      {
        name: "Terbinafine",
        category: "Skin",
        description: "Antifungal for tinea and athlete's foot",
        variants: [
          { name: "Terbicip", mg: "1%", price: 90, manufacturer: "Cipla", form: "Cream", packSize: "15g", composition: "Terbinafine 1%" },
          { name: "Lamisil", mg: "250mg", price: 120, manufacturer: "Novartis", form: "Tablet", packSize: "7 tablets", composition: "Terbinafine 250mg" },
        ],
      },
      {
        name: "Calamine Lotion",
        category: "Skin",
        description: "Soothing lotion for itching and rashes",
        variants: [
          { name: "Lacto Calamine", mg: "Multi", price: 80, manufacturer: "Piramal", form: "Lotion", packSize: "120ml", composition: "Calamine + Zinc Oxide + Aloe Vera" },
        ],
      },
      {
        name: "Adapalene",
        category: "Skin",
        description: "Retinoid for acne treatment",
        variants: [
          { name: "Deriva", mg: "0.1%", price: 140, manufacturer: "Glenmark", form: "Gel", packSize: "15g", composition: "Adapalene 0.1%" },
          { name: "Deriva CMS", mg: "0.1%+1%", price: 180, manufacturer: "Glenmark", form: "Gel", packSize: "15g", composition: "Adapalene 0.1% + Clindamycin 1%" },
        ],
      },

      // ── EYE CARE ──
      {
        name: "Lubricant Eye Drops",
        category: "Eye Care",
        description: "Artificial tears for dry eyes",
        variants: [
          { name: "Refresh Tears", mg: "0.5%", price: 95, manufacturer: "Allergan", form: "Eye Drops", packSize: "10ml", composition: "Carboxymethylcellulose 0.5%" },
          { name: "Systane Ultra", mg: "Multi", price: 120, manufacturer: "Alcon", form: "Eye Drops", packSize: "10ml", composition: "Polyethylene Glycol + Propylene Glycol" },
        ],
      },
      {
        name: "Moxifloxacin Eye Drops",
        category: "Eye Care",
        description: "Antibiotic eye drops for conjunctivitis and eye infections",
        variants: [
          { name: "Moxicip", mg: "0.5%", price: 60, manufacturer: "Cipla", form: "Eye Drops", packSize: "5ml", composition: "Moxifloxacin 0.5%" },
          { name: "Vigamox", mg: "0.5%", price: 80, manufacturer: "Alcon", form: "Eye Drops", packSize: "5ml", composition: "Moxifloxacin 0.5%" },
        ],
      },
      {
        name: "Ciprofloxacin Eye Drops",
        category: "Eye Care",
        description: "Antibiotic eye drops for bacterial conjunctivitis",
        variants: [
          { name: "Ciplox Eye", mg: "0.3%", price: 30, manufacturer: "Cipla", form: "Eye Drops", packSize: "5ml", composition: "Ciprofloxacin 0.3%" },
        ],
      },
      {
        name: "Tobramycin Eye Drops",
        category: "Eye Care",
        description: "Aminoglycoside antibiotic for eye infections",
        variants: [
          { name: "Tobrex", mg: "0.3%", price: 70, manufacturer: "Alcon", form: "Eye Drops", packSize: "5ml", composition: "Tobramycin 0.3%" },
        ],
      },
      {
        name: "Timolol Eye Drops",
        category: "Eye Care",
        description: "Beta blocker for glaucoma",
        variants: [
          { name: "Glucomol", mg: "0.5%", price: 35, manufacturer: "Allergan", form: "Eye Drops", packSize: "5ml", composition: "Timolol 0.5%" },
        ],
      },

      // ── WOMEN'S HEALTH ──
      {
        name: "Progesterone",
        category: "Women's Health",
        description: "Hormonal support for menstrual irregularities",
        variants: [
          { name: "Susten", mg: "200mg", price: 180, manufacturer: "Sun Pharma", form: "Capsule", packSize: "10 capsules", composition: "Progesterone 200mg" },
        ],
      },
      {
        name: "Norethisterone",
        category: "Women's Health",
        description: "For menstrual regulation and delay",
        variants: [
          { name: "Primolut N", mg: "5mg", price: 30, manufacturer: "Bayer", form: "Tablet", packSize: "10 tablets", composition: "Norethisterone 5mg" },
        ],
      },
      {
        name: "Oral Contraceptive",
        category: "Women's Health",
        description: "Hormonal birth control pills",
        variants: [
          { name: "Mala D", mg: "Multi", price: 10, manufacturer: "Govt", form: "Tablet", packSize: "28 tablets", composition: "Levonorgestrel 0.15mg + Ethinyl Estradiol 0.03mg" },
          { name: "Novelon", mg: "Multi", price: 130, manufacturer: "Organon", form: "Tablet", packSize: "21 tablets", composition: "Desogestrel + Ethinyl Estradiol" },
        ],
      },
      {
        name: "Clomiphene",
        category: "Women's Health",
        description: "Ovulation inducer for fertility treatment",
        variants: [
          { name: "Siphene", mg: "100mg", price: 70, manufacturer: "Serum Institute", form: "Tablet", packSize: "10 tablets", composition: "Clomiphene Citrate 100mg" },
        ],
      },
      {
        name: "Tranexamic Acid",
        category: "Women's Health",
        description: "For heavy menstrual bleeding",
        variants: [
          { name: "Pause MF", mg: "500mg+250mg", price: 65, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Tranexamic Acid 500mg + Mefenamic Acid 250mg" },
        ],
      },

      // ── MUSCLE RELAXANTS & ORTHO ──
      {
        name: "Glucosamine",
        category: "Bone & Joint",
        description: "Joint health supplement for osteoarthritis",
        variants: [
          { name: "Jointace", mg: "500mg+400mg", price: 145, manufacturer: "Vitabiotics", form: "Tablet", packSize: "10 tablets", composition: "Glucosamine 500mg + Chondroitin 400mg" },
        ],
      },
      {
        name: "Muscle Relaxant",
        category: "Bone & Joint",
        description: "For muscle spasms and back pain",
        variants: [
          { name: "Myospaz Forte", mg: "500mg+500mg", price: 60, manufacturer: "FDC", form: "Tablet", packSize: "10 tablets", composition: "Chlorzoxazone 500mg + Paracetamol 500mg" },
          { name: "Thiocolchicoside", mg: "4mg", price: 50, manufacturer: "Sanofi", form: "Capsule", packSize: "10 capsules", composition: "Thiocolchicoside 4mg" },
        ],
      },
      {
        name: "Etoricoxib",
        category: "Bone & Joint",
        description: "COX-2 inhibitor for arthritis and joint pain",
        variants: [
          { name: "Nucoxia", mg: "90mg", price: 95, manufacturer: "Zydus", form: "Tablet", packSize: "10 tablets", composition: "Etoricoxib 90mg" },
          { name: "Nucoxia MR", mg: "60mg+4mg", price: 110, manufacturer: "Zydus", form: "Tablet", packSize: "10 tablets", composition: "Etoricoxib 60mg + Thiocolchicoside 4mg" },
        ],
      },
      {
        name: "Tizanidine",
        category: "Bone & Joint",
        description: "Muscle relaxant for spasticity",
        variants: [
          { name: "Sirdalud", mg: "2mg", price: 35, manufacturer: "Novartis", form: "Tablet", packSize: "10 tablets", composition: "Tizanidine 2mg" },
        ],
      },
      {
        name: "Colchicine",
        category: "Bone & Joint",
        description: "For gout attack management",
        variants: [
          { name: "Zycolchin", mg: "0.5mg", price: 25, manufacturer: "Zydus", form: "Tablet", packSize: "10 tablets", composition: "Colchicine 0.5mg" },
        ],
      },

      // ── RESPIRATORY ──
      {
        name: "Salbutamol",
        category: "Respiratory",
        description: "Bronchodilator for asthma and COPD",
        variants: [
          { name: "Asthalin", mg: "100mcg", price: 130, manufacturer: "Cipla", form: "Inhaler", packSize: "200 doses", composition: "Salbutamol 100mcg/dose" },
          { name: "Asthalin", mg: "2mg/5ml", price: 25, manufacturer: "Cipla", form: "Syrup", packSize: "100ml", composition: "Salbutamol 2mg/5ml" },
        ],
      },
      {
        name: "Budesonide",
        category: "Respiratory",
        description: "Inhaled corticosteroid for asthma",
        variants: [
          { name: "Budecort", mg: "200mcg", price: 180, manufacturer: "Sun Pharma", form: "Inhaler", packSize: "200 doses", composition: "Budesonide 200mcg" },
          { name: "Foracort", mg: "200mcg+6mcg", price: 270, manufacturer: "Cipla", form: "Inhaler", packSize: "120 doses", composition: "Budesonide 200mcg + Formoterol 6mcg" },
        ],
      },
      {
        name: "Deriphyllin",
        category: "Respiratory",
        description: "Bronchodilator for asthma and COPD",
        variants: [
          { name: "Deriphyllin Retard", mg: "150mg", price: 30, manufacturer: "Franco Indian", form: "Tablet", packSize: "10 tablets", composition: "Theophylline + Etophylline" },
        ],
      },
      {
        name: "Ipratropium",
        category: "Respiratory",
        description: "Anticholinergic bronchodilator",
        variants: [
          { name: "Duolin", mg: "Multi", price: 95, manufacturer: "Cipla", form: "Respules", packSize: "5 respules", composition: "Ipratropium + Levosalbutamol" },
        ],
      },

      // ── THYROID ──
      {
        name: "Levothyroxine",
        category: "Thyroid",
        description: "Thyroid hormone replacement for hypothyroidism",
        variants: [
          { name: "Thyronorm", mg: "25mcg", price: 55, manufacturer: "Abbott", form: "Tablet", packSize: "100 tablets", composition: "Levothyroxine 25mcg" },
          { name: "Thyronorm", mg: "50mcg", price: 65, manufacturer: "Abbott", form: "Tablet", packSize: "100 tablets", composition: "Levothyroxine 50mcg" },
          { name: "Thyronorm", mg: "75mcg", price: 75, manufacturer: "Abbott", form: "Tablet", packSize: "100 tablets", composition: "Levothyroxine 75mcg" },
          { name: "Eltroxin", mg: "50mcg", price: 60, manufacturer: "GSK", form: "Tablet", packSize: "100 tablets", composition: "Levothyroxine 50mcg" },
        ],
      },
      {
        name: "Carbimazole",
        category: "Thyroid",
        description: "Anti-thyroid drug for hyperthyroidism",
        variants: [
          { name: "Neo Mercazole", mg: "5mg", price: 30, manufacturer: "Abbott", form: "Tablet", packSize: "30 tablets", composition: "Carbimazole 5mg" },
        ],
      },

      // ── ANTI-PARASITIC ──
      {
        name: "Albendazole",
        category: "Anti-Parasitic",
        description: "Deworming tablet",
        variants: [
          { name: "Zentel", mg: "400mg", price: 15, manufacturer: "GSK", form: "Tablet", packSize: "1 tablet", composition: "Albendazole 400mg" },
          { name: "Bandy Plus", mg: "400mg+150mg", price: 35, manufacturer: "Mankind", form: "Tablet", packSize: "1 tablet", composition: "Albendazole 400mg + Ivermectin 6mg" },
        ],
      },
      {
        name: "Ivermectin",
        category: "Anti-Parasitic",
        description: "Antiparasitic for scabies and worm infections",
        variants: [
          { name: "Ivecop", mg: "12mg", price: 40, manufacturer: "Menarini", form: "Tablet", packSize: "1 tablet", composition: "Ivermectin 12mg" },
        ],
      },

      // ── ORAL CARE ──
      {
        name: "Chlorhexidine Mouthwash",
        category: "Oral Care",
        description: "Antiseptic mouthwash for gum health",
        variants: [
          { name: "Hexidine", mg: "0.2%", price: 90, manufacturer: "ICPA", form: "Mouthwash", packSize: "150ml", composition: "Chlorhexidine Gluconate 0.2%" },
          { name: "Clohex", mg: "0.2%", price: 85, manufacturer: "Dr. Reddy's", form: "Mouthwash", packSize: "150ml", composition: "Chlorhexidine Gluconate 0.2%" },
        ],
      },

      // ── FIRST AID & TOPICAL ──
      {
        name: "Povidone Iodine",
        category: "First Aid",
        description: "Antiseptic for wound cleaning",
        variants: [
          { name: "Betadine", mg: "5%", price: 55, manufacturer: "Win Medicare", form: "Solution", packSize: "50ml", composition: "Povidone Iodine 5%" },
          { name: "Betadine Ointment", mg: "5%", price: 35, manufacturer: "Win Medicare", form: "Ointment", packSize: "15g", composition: "Povidone Iodine 5%" },
        ],
      },
      {
        name: "Silver Sulfadiazine",
        category: "First Aid",
        description: "Topical burn cream",
        variants: [
          { name: "Silverex", mg: "1%", price: 65, manufacturer: "Cipla", form: "Cream", packSize: "20g", composition: "Silver Sulfadiazine 1%" },
        ],
      },
      {
        name: "ORS",
        category: "First Aid",
        description: "Oral rehydration salts for dehydration",
        variants: [
          { name: "Electral", mg: "Multi", price: 20, manufacturer: "FDC", form: "Powder", packSize: "4 sachets", composition: "Sodium Chloride + Potassium Chloride + Sodium Citrate + Dextrose" },
        ],
      },

      // ── AYURVEDA & HERBAL ──
      {
        name: "Ashwagandha",
        category: "Ayurveda",
        description: "Adaptogen for stress, energy and immunity",
        variants: [
          { name: "Himalaya Ashvagandha", mg: "250mg", price: 160, manufacturer: "Himalaya", form: "Tablet", packSize: "60 tablets", composition: "Ashwagandha root extract 250mg" },
          { name: "KSM-66", mg: "600mg", price: 350, manufacturer: "Ixoreal", form: "Capsule", packSize: "60 capsules", composition: "Ashwagandha root extract KSM-66 600mg" },
        ],
      },
      {
        name: "Triphala",
        category: "Ayurveda",
        description: "Digestive health and detox",
        variants: [
          { name: "Himalaya Triphala", mg: "250mg", price: 130, manufacturer: "Himalaya", form: "Tablet", packSize: "60 tablets", composition: "Triphala extract 250mg" },
        ],
      },
      {
        name: "Chyawanprash",
        category: "Ayurveda",
        description: "Immunity booster herbal jam",
        variants: [
          { name: "Dabur Chyawanprash", mg: "Multi", price: 250, manufacturer: "Dabur", form: "Paste", packSize: "500g", composition: "Amla + 40 ayurvedic herbs" },
        ],
      },
      {
        name: "Liv 52",
        category: "Ayurveda",
        description: "Liver tonic and hepatoprotective",
        variants: [
          { name: "Liv 52", mg: "Multi", price: 90, manufacturer: "Himalaya", form: "Tablet", packSize: "100 tablets", composition: "Caper Bush + Chicory + Black Nightshade" },
          { name: "Liv 52 DS", mg: "Multi", price: 140, manufacturer: "Himalaya", form: "Tablet", packSize: "60 tablets", composition: "Caper Bush + Chicory (double strength)" },
        ],
      },
      {
        name: "Tulsi Drops",
        category: "Ayurveda",
        description: "Immunity booster and respiratory support",
        variants: [
          { name: "Pankajakasthuri Breathe Easy", mg: "Multi", price: 75, manufacturer: "Pankajakasthuri", form: "Syrup", packSize: "100ml", composition: "Tulsi + Vasaka + Mulethi" },
        ],
      },

      // ── LIVER & KIDNEY ──
      {
        name: "Ursodeoxycholic Acid",
        category: "Liver",
        description: "For gallstones and liver disease",
        variants: [
          { name: "Udiliv", mg: "300mg", price: 140, manufacturer: "Abbott", form: "Tablet", packSize: "10 tablets", composition: "Ursodeoxycholic Acid 300mg" },
        ],
      },
      {
        name: "Silymarin",
        category: "Liver",
        description: "Liver protective supplement (milk thistle)",
        variants: [
          { name: "Silybon", mg: "140mg", price: 110, manufacturer: "Micro Labs", form: "Tablet", packSize: "10 tablets", composition: "Silymarin 140mg" },
        ],
      },

      // ── ANTIEPILEPTICS ──
      {
        name: "Gabapentin",
        category: "Neuro",
        description: "For neuropathic pain and seizures",
        variants: [
          { name: "Gabapin NT", mg: "100mg+10mg", price: 80, manufacturer: "Intas", form: "Tablet", packSize: "10 tablets", composition: "Gabapentin 100mg + Nortriptyline 10mg" },
          { name: "Gabantin", mg: "300mg", price: 70, manufacturer: "Sun Pharma", form: "Capsule", packSize: "10 capsules", composition: "Gabapentin 300mg" },
        ],
      },
      {
        name: "Pregabalin",
        category: "Neuro",
        description: "For neuropathic pain and fibromyalgia",
        variants: [
          { name: "Pregalin", mg: "75mg", price: 85, manufacturer: "Torrent", form: "Capsule", packSize: "10 capsules", composition: "Pregabalin 75mg" },
          { name: "Pregalin M", mg: "75mg+750mcg", price: 95, manufacturer: "Torrent", form: "Capsule", packSize: "10 capsules", composition: "Pregabalin 75mg + Methylcobalamin 750mcg" },
        ],
      },

      // ── HAIR CARE ──
      {
        name: "Minoxidil",
        category: "Hair Care",
        description: "Topical treatment for hair loss",
        variants: [
          { name: "Mintop", mg: "5%", price: 450, manufacturer: "Dr. Reddy's", form: "Solution", packSize: "60ml", composition: "Minoxidil 5%" },
          { name: "Tugain", mg: "5%", price: 420, manufacturer: "Cipla", form: "Solution", packSize: "60ml", composition: "Minoxidil 5%" },
        ],
      },
      {
        name: "Finasteride",
        category: "Hair Care",
        description: "Oral treatment for male pattern baldness",
        variants: [
          { name: "Finpecia", mg: "1mg", price: 120, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Finasteride 1mg" },
        ],
      },

      // ── UROLOGY ──
      {
        name: "Tamsulosin",
        category: "Urology",
        description: "Alpha blocker for enlarged prostate (BPH)",
        variants: [
          { name: "Urimax", mg: "0.4mg", price: 75, manufacturer: "Cipla", form: "Capsule", packSize: "10 capsules", composition: "Tamsulosin 0.4mg" },
          { name: "Urimax D", mg: "0.4mg+0.5mg", price: 110, manufacturer: "Cipla", form: "Tablet", packSize: "10 tablets", composition: "Tamsulosin 0.4mg + Dutasteride 0.5mg" },
        ],
      },
    ];

    // Batch write medicines
    let count = 0;
    let batch = adminDb.batch();

    for (const med of MEDICINES) {
      const ref = adminDb.collection("medicines").doc();
      batch.set(ref, {
        name: med.name,
        nameLower: med.name.toLowerCase(),
        category: med.category || "",
        description: med.description || "",
        variants: med.variants.map((v) => ({
          name: v.name,
          mg: v.mg,
          price: v.price,
          manufacturer: v.manufacturer || "",
          form: v.form || "Tablet",
          packSize: v.packSize || "",
          composition: v.composition || "",
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      count++;

      // Firestore batch limit is 500
      if (count % 450 === 0) {
        await batch.commit();
        batch = adminDb.batch();
      }
    }

    await batch.commit();

    return res.status(200).json({
      success: true,
      message: `Seeded ${count} medicines with variants`,
      count,
    });
  } catch (error) {
    console.error("Seed medicines error:", error);
    return res.status(500).json({ error: "Failed to seed medicines" });
  }
}
