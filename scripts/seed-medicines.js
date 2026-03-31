/**
 * Seed script to populate Firestore with common Indian pharmacy medicine NAMES.
 * Users will input their own variant, company, dosage details when ordering.
 * Run: node scripts/seed-medicines.js
 */
const admin = require("firebase-admin");
const path = require("path");

// Load .env using dotenv (handles multiline private keys properly)
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

// 
// MEDICINE NAMES ONLY - users fill in variant/company/dosage themselves
// 

const MEDICINES = [
  // Fever & Pain
  { name: "Paracetamol", category: "Fever & Pain" },
  { name: "Ibuprofen", category: "Fever & Pain" },
  { name: "Diclofenac", category: "Fever & Pain" },
  { name: "Aceclofenac", category: "Fever & Pain" },
  { name: "Aspirin", category: "Fever & Pain" },
  { name: "Nimesulide", category: "Fever & Pain" },
  { name: "Mefenamic Acid", category: "Fever & Pain" },
  { name: "Tramadol", category: "Fever & Pain" },
  { name: "Dolo 650", category: "Fever & Pain" },
  { name: "Crocin", category: "Fever & Pain" },
  { name: "Combiflam", category: "Fever & Pain" },
  { name: "Saridon", category: "Fever & Pain" },
  
  // Antibiotics
  { name: "Amoxicillin", category: "Antibiotics" },
  { name: "Azithromycin", category: "Antibiotics" },
  { name: "Ciprofloxacin", category: "Antibiotics" },
  { name: "Cefixime", category: "Antibiotics" },
  { name: "Ofloxacin", category: "Antibiotics" },
  { name: "Metronidazole", category: "Antibiotics" },
  { name: "Doxycycline", category: "Antibiotics" },
  { name: "Levofloxacin", category: "Antibiotics" },
  { name: "Cephalexin", category: "Antibiotics" },
  { name: "Norfloxacin", category: "Antibiotics" },
  { name: "Augmentin", category: "Antibiotics" },
  { name: "Zifi", category: "Antibiotics" },
  
  // Gastro & Acidity
  { name: "Omeprazole", category: "Gastro & Acidity" },
  { name: "Pantoprazole", category: "Gastro & Acidity" },
  { name: "Ranitidine", category: "Gastro & Acidity" },
  { name: "Domperidone", category: "Gastro & Acidity" },
  { name: "Ondansetron", category: "Gastro & Acidity" },
  { name: "Rabeprazole", category: "Gastro & Acidity" },
  { name: "Esomeprazole", category: "Gastro & Acidity" },
  { name: "Pan 40", category: "Gastro & Acidity" },
  { name: "Rantac", category: "Gastro & Acidity" },
  { name: "Digene", category: "Gastro & Acidity" },
  { name: "Gelusil", category: "Gastro & Acidity" },
  { name: "Mucaine", category: "Gastro & Acidity" },
  
  // Allergy
  { name: "Cetirizine", category: "Allergy" },
  { name: "Levocetirizine", category: "Allergy" },
  { name: "Loratadine", category: "Allergy" },
  { name: "Fexofenadine", category: "Allergy" },
  { name: "Montelukast", category: "Allergy" },
  { name: "Chlorpheniramine", category: "Allergy" },
  { name: "Allegra", category: "Allergy" },
  { name: "Montair LC", category: "Allergy" },
  { name: "Okacet", category: "Allergy" },
  
  // Cough & Cold
  { name: "Benadryl", category: "Cough & Cold" },
  { name: "Grilinctus", category: "Cough & Cold" },
  { name: "Cheston Cold", category: "Cough & Cold" },
  { name: "Sinarest", category: "Cough & Cold" },
  { name: "Vicks Action 500", category: "Cough & Cold" },
  { name: "Cofsils", category: "Cough & Cold" },
  { name: "Honitus", category: "Cough & Cold" },
  { name: "Ascoril", category: "Cough & Cold" },
  { name: "Alex", category: "Cough & Cold" },
  
  // Diabetes
  { name: "Metformin", category: "Diabetes" },
  { name: "Glimepiride", category: "Diabetes" },
  { name: "Sitagliptin", category: "Diabetes" },
  { name: "Gliclazide", category: "Diabetes" },
  { name: "Voglibose", category: "Diabetes" },
  { name: "Empagliflozin", category: "Diabetes" },
  { name: "Insulin", category: "Diabetes" },
  { name: "Glycomet", category: "Diabetes" },
  { name: "Januvia", category: "Diabetes" },
  
  // Heart & BP
  { name: "Amlodipine", category: "Heart & BP" },
  { name: "Atenolol", category: "Heart & BP" },
  { name: "Losartan", category: "Heart & BP" },
  { name: "Telmisartan", category: "Heart & BP" },
  { name: "Ramipril", category: "Heart & BP" },
  { name: "Atorvastatin", category: "Heart & BP" },
  { name: "Rosuvastatin", category: "Heart & BP" },
  { name: "Clopidogrel", category: "Heart & BP" },
  { name: "Metoprolol", category: "Heart & BP" },
  { name: "Ecosprin", category: "Heart & BP" },
  
  // Vitamins & Supplements
  { name: "Vitamin D3", category: "Vitamins" },
  { name: "Vitamin B12", category: "Vitamins" },
  { name: "Vitamin C", category: "Vitamins" },
  { name: "Calcium", category: "Vitamins" },
  { name: "Iron", category: "Vitamins" },
  { name: "Folic Acid", category: "Vitamins" },
  { name: "Zinc", category: "Vitamins" },
  { name: "Multivitamin", category: "Vitamins" },
  { name: "Shelcal", category: "Vitamins" },
  { name: "Supradyn", category: "Vitamins" },
  { name: "Becosules", category: "Vitamins" },
  { name: "Limcee", category: "Vitamins" },
  { name: "Neurobion Forte", category: "Vitamins" },
  
  // Mental Health
  { name: "Escitalopram", category: "Mental Health" },
  { name: "Sertraline", category: "Mental Health" },
  { name: "Fluoxetine", category: "Mental Health" },
  { name: "Alprazolam", category: "Mental Health" },
  { name: "Clonazepam", category: "Mental Health" },
  { name: "Amitriptyline", category: "Mental Health" },
  
  // Sleep
  { name: "Zolpidem", category: "Sleep" },
  { name: "Melatonin", category: "Sleep" },
  
  // Skin Care
  { name: "Clotrimazole", category: "Skin" },
  { name: "Ketoconazole", category: "Skin" },
  { name: "Betamethasone", category: "Skin" },
  { name: "Mupirocin", category: "Skin" },
  { name: "Fusidic Acid", category: "Skin" },
  { name: "Candid", category: "Skin" },
  { name: "Betnovate", category: "Skin" },
  { name: "Soframycin", category: "Skin" },
  
  // Eye Care
  { name: "Moxifloxacin Eye Drops", category: "Eye Care" },
  { name: "Tobramycin Eye Drops", category: "Eye Care" },
  { name: "Lubricant Eye Drops", category: "Eye Care" },
  { name: "Refresh Tears", category: "Eye Care" },
  { name: "Itone", category: "Eye Care" },
  
  // Respiratory
  { name: "Salbutamol", category: "Respiratory" },
  { name: "Levosalbutamol", category: "Respiratory" },
  { name: "Budesonide", category: "Respiratory" },
  { name: "Theophylline", category: "Respiratory" },
  { name: "Asthalin", category: "Respiratory" },
  { name: "Foracort", category: "Respiratory" },
  
  // Thyroid
  { name: "Levothyroxine", category: "Thyroid" },
  { name: "Thyronorm", category: "Thyroid" },
  { name: "Eltroxin", category: "Thyroid" },
  
  // Women's Health
  { name: "Progesterone", category: "Women's Health" },
  { name: "Norethisterone", category: "Women's Health" },
  { name: "Mifepristone", category: "Women's Health" },
  { name: "Susten", category: "Women's Health" },
  { name: "Regestrone", category: "Women's Health" },
  
  // Bone & Joint
  { name: "Calcium Carbonate", category: "Bone & Joint" },
  { name: "Glucosamine", category: "Bone & Joint" },
  { name: "Collagen", category: "Bone & Joint" },
  { name: "Ostocalcium", category: "Bone & Joint" },
  
  // Anti-Parasitic
  { name: "Albendazole", category: "Anti-Parasitic" },
  { name: "Ivermectin", category: "Anti-Parasitic" },
  { name: "Zentel", category: "Anti-Parasitic" },
  
  // Oral Care
  { name: "Metrogyl DG", category: "Oral Care" },
  { name: "Hexidine", category: "Oral Care" },
  
  // Ayurveda
  { name: "Ashwagandha", category: "Ayurveda" },
  { name: "Triphala", category: "Ayurveda" },
  { name: "Chyawanprash", category: "Ayurveda" },
  { name: "Tulsi", category: "Ayurveda" },
  { name: "Brahmi", category: "Ayurveda" },
  { name: "Giloy", category: "Ayurveda" },
  { name: "Shilajit", category: "Ayurveda" },
  { name: "Dabur Honitus", category: "Ayurveda" },
  
  // First Aid
  { name: "Betadine", category: "First Aid" },
  { name: "Dettol", category: "First Aid" },
  { name: "Savlon", category: "First Aid" },
  { name: "Burnol", category: "First Aid" },
  { name: "Band-Aid", category: "First Aid" },
  { name: "Cotton", category: "First Aid" },
  { name: "Bandage", category: "First Aid" },
  
  // Digestive
  { name: "Isabgol", category: "Digestive" },
  { name: "Lactulose", category: "Digestive" },
  { name: "Cremaffin", category: "Digestive" },
  { name: "Duphalac", category: "Digestive" },
  { name: "Dulcolax", category: "Digestive" },
  { name: "Econorm", category: "Digestive" },
  
  // Muscle Relaxants
  { name: "Thiocolchicoside", category: "Muscle Relaxant" },
  { name: "Chlorzoxazone", category: "Muscle Relaxant" },
  { name: "Myospaz", category: "Muscle Relaxant" },
  
  // Topical Pain Relief
  { name: "Volini", category: "Topical Pain" },
  { name: "Moov", category: "Topical Pain" },
  { name: "Iodex", category: "Topical Pain" },
  { name: "Zandu Balm", category: "Topical Pain" },
  { name: "Tiger Balm", category: "Topical Pain" },
];

// 

async function seed() {
  console.log("Clearing existing medicines...");
  
  // Delete all existing medicines first
  const existing = await db.collection("medicines").get();
  if (existing.size > 0) {
    const deleteBatch = db.batch();
    existing.docs.forEach((doc) => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();
    console.log(`  Deleted ${existing.size} existing medicines.`);
  }
  
  console.log(`Seeding ${MEDICINES.length} medicines (names only)...`);
  const batch = db.batch();

  for (const med of MEDICINES) {
    const ref = db.collection("medicines").doc();
    batch.set(ref, {
      name: med.name,
      nameLower: med.name.toLowerCase(),
      category: med.category || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  await batch.commit();
  console.log(`Done! Seeded ${MEDICINES.length} medicine names.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
