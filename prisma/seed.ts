import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data first
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.shelf.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@pharmacy.com" },
    update: {},
    create: {
      email: "admin@pharmacy.com",
      name: "Pharmacy Admin",
      password: adminPassword,
      role: "admin",
    },
  });

  // Create regular user
  const userPassword = await hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@pharmacy.com" },
    update: {},
    create: {
      email: "user@pharmacy.com",
      name: "Pharmacy User",
      password: userPassword,
      role: "user",
    },
  });

  // Create sample categories
  const medicinesCategory = await prisma.category.upsert({
    where: { name: "Medicines" },
    update: {},
    create: {
      name: "Medicines",
      description: "Pharmaceutical products and medicines",
    },
  });

  const antibioticsCategory = await prisma.category.upsert({
    where: { name: "Antibiotics" },
    update: {},
    create: {
      name: "Antibiotics",
      description: "Antibiotic medications",
    },
  });

  const painReliefCategory = await prisma.category.upsert({
    where: { name: "Pain Relief" },
    update: {},
    create: {
      name: "Pain Relief",
      description: "Pain relief and anti-inflammatory medicines",
    },
  });

  const supplementsCategory = await prisma.category.upsert({
    where: { name: "Supplements" },
    update: {},
    create: {
      name: "Supplements",
      description: "Health supplements and vitamins",
    },
  });

  const skincareCategory = await prisma.category.upsert({
    where: { name: "Skincare" },
    update: {},
    create: {
      name: "Skincare",
      description: "Dermatological and skincare products",
    },
  });

  const firstAidCategory = await prisma.category.upsert({
    where: { name: "First Aid" },
    update: {},
    create: {
      name: "First Aid",
      description: "First aid supplies and bandages",
    },
  });

  // Create sample shelves
  const shelfA1 = await prisma.shelf.upsert({
    where: { name: "Shelf A1" },
    update: {},
    create: {
      name: "Shelf A1",
      location: "Aisle A, Row 1",
      description: "Pain relief and fever medicines",
    },
  });

  const shelfA2 = await prisma.shelf.upsert({
    where: { name: "Shelf A2" },
    update: {},
    create: {
      name: "Shelf A2",
      location: "Aisle A, Row 2",
      description: "Antibiotics and infection medicines",
    },
  });

  const shelfA3 = await prisma.shelf.upsert({
    where: { name: "Shelf A3" },
    update: {},
    create: {
      name: "Shelf A3",
      location: "Aisle A, Row 3",
      description: "Cardiovascular and blood pressure medicines",
    },
  });

  const shelfB1 = await prisma.shelf.upsert({
    where: { name: "Shelf B1" },
    update: {},
    create: {
      name: "Shelf B1",
      location: "Aisle B, Row 1",
      description: "Vitamins and supplements",
    },
  });

  const shelfB2 = await prisma.shelf.upsert({
    where: { name: "Shelf B2" },
    update: {},
    create: {
      name: "Shelf B2",
      location: "Aisle B, Row 2",
      description: "Skincare and dermatological products",
    },
  });

  const shelfC1 = await prisma.shelf.upsert({
    where: { name: "Shelf C1" },
    update: {},
    create: {
      name: "Shelf C1",
      location: "Aisle C, Row 1",
      description: "First aid supplies and bandages",
    },
  });

  const shelfC2 = await prisma.shelf.upsert({
    where: { name: "Shelf C2" },
    update: {},
    create: {
      name: "Shelf C2",
      location: "Aisle C, Row 2",
      description: "Diabetes and endocrine medicines",
    },
  });

  // Create sample products
  const products = [
    // Pain Relief & Fever Medicines (Shelf A1)
    {
      name: "Paracetamol 500mg Tablets",
      description: "Pain relief and fever reducer",
      purchasePrice: 2.5,
      sellingPrice: 5.0,
      stock: 150,
      categoryId: painReliefCategory.id,
      shelfId: shelfA1.id,
      expiryDate: new Date("2026-12-31"),
      batchNumber: "PARA2024001",
      manufacturer: "PharmaCorp",
      barcode: "1234567890123",
    },
    {
      name: "Ibuprofen 200mg Tablets",
      description: "Anti-inflammatory pain reliever",
      purchasePrice: 1.5,
      sellingPrice: 4.0,
      stock: 120,
      categoryId: painReliefCategory.id,
      shelfId: shelfA1.id,
      expiryDate: new Date("2025-11-10"),
      batchNumber: "IBUP2024004",
      manufacturer: "PharmaCorp",
      barcode: "1234567890126",
    },
    {
      name: "Aspirin 75mg Tablets",
      description: "Blood thinner and pain relief",
      purchasePrice: 1.8,
      sellingPrice: 3.5,
      stock: 90,
      categoryId: painReliefCategory.id,
      shelfId: shelfA1.id,
      expiryDate: new Date("2026-08-20"),
      batchNumber: "ASPI2024007",
      manufacturer: "MediPharm",
      barcode: "1234567890130",
    },
    {
      name: "Diclofenac 50mg Tablets",
      description: "Strong anti-inflammatory pain reliever",
      purchasePrice: 3.2,
      sellingPrice: 7.0,
      stock: 60,
      categoryId: painReliefCategory.id,
      shelfId: shelfA1.id,
      expiryDate: new Date("2026-05-15"),
      batchNumber: "DICO2024008",
      manufacturer: "PharmaCorp",
      barcode: "1234567890131",
    },

    // Antibiotics (Shelf A2)
    {
      name: "Amoxicillin 250mg Capsules",
      description: "Antibiotic for bacterial infections",
      purchasePrice: 8.0,
      sellingPrice: 15.0,
      stock: 45,
      categoryId: antibioticsCategory.id,
      shelfId: shelfA2.id,
      expiryDate: new Date("2025-08-15"),
      batchNumber: "AMOX2024002",
      manufacturer: "MediPharm",
      barcode: "1234567890124",
    },
    {
      name: "Azithromycin 500mg Tablets",
      description: "Broad-spectrum antibiotic",
      purchasePrice: 12.0,
      sellingPrice: 22.0,
      stock: 35,
      categoryId: antibioticsCategory.id,
      shelfId: shelfA2.id,
      expiryDate: new Date("2026-02-28"),
      batchNumber: "AZIT2024009",
      manufacturer: "BioPharm",
      barcode: "1234567890132",
    },
    {
      name: "Ciprofloxacin 500mg Tablets",
      description: "Antibiotic for urinary tract infections",
      purchasePrice: 4.5,
      sellingPrice: 9.0,
      stock: 55,
      categoryId: antibioticsCategory.id,
      shelfId: shelfA2.id,
      expiryDate: new Date("2025-12-10"),
      batchNumber: "CIPR2024010",
      manufacturer: "MediPharm",
      barcode: "1234567890133",
    },

    // Cardiovascular Medicines (Shelf A3)
    {
      name: "Amlodipine 5mg Tablets",
      description: "Blood pressure medication",
      purchasePrice: 2.8,
      sellingPrice: 6.0,
      stock: 80,
      categoryId: medicinesCategory.id,
      shelfId: shelfA3.id,
      expiryDate: new Date("2026-09-30"),
      batchNumber: "AMLO2024011",
      manufacturer: "CardioPharm",
      barcode: "1234567890134",
    },
    {
      name: "Metformin 500mg Tablets",
      description: "Diabetes medication",
      purchasePrice: 1.2,
      sellingPrice: 3.0,
      stock: 110,
      categoryId: medicinesCategory.id,
      shelfId: shelfC2.id,
      expiryDate: new Date("2026-07-25"),
      batchNumber: "METF2024012",
      manufacturer: "EndoPharm",
      barcode: "1234567890135",
    },

    // Vitamins & Supplements (Shelf B1)
    {
      name: "Vitamin C 1000mg Tablets",
      description: "Immune system support supplement",
      purchasePrice: 3.0,
      sellingPrice: 8.0,
      stock: 85,
      categoryId: supplementsCategory.id,
      shelfId: shelfB1.id,
      expiryDate: new Date("2026-03-20"),
      batchNumber: "VITC2024003",
      manufacturer: "NutriHealth",
      barcode: "1234567890125",
    },
    {
      name: "Omega-3 Fish Oil 1000mg",
      description: "Heart and joint health supplement",
      purchasePrice: 12.0,
      sellingPrice: 25.0,
      stock: 40,
      categoryId: supplementsCategory.id,
      shelfId: shelfB1.id,
      expiryDate: new Date("2026-01-15"),
      batchNumber: "OMEGA2024005",
      manufacturer: "NutriHealth",
      barcode: "1234567890127",
    },
    {
      name: "Multivitamin Tablets",
      description: "Complete daily vitamin supplement",
      purchasePrice: 5.5,
      sellingPrice: 12.0,
      stock: 65,
      categoryId: supplementsCategory.id,
      shelfId: shelfB1.id,
      expiryDate: new Date("2026-11-30"),
      batchNumber: "MULT2024013",
      manufacturer: "NutriHealth",
      barcode: "1234567890136",
    },
    {
      name: "Calcium + Vitamin D3",
      description: "Bone health supplement",
      purchasePrice: 4.2,
      sellingPrice: 9.5,
      stock: 70,
      categoryId: supplementsCategory.id,
      shelfId: shelfB1.id,
      expiryDate: new Date("2026-06-18"),
      batchNumber: "CALD2024014",
      manufacturer: "NutriHealth",
      barcode: "1234567890137",
    },

    // Skincare Products (Shelf B2)
    {
      name: "Hydrocortisone Cream 1%",
      description: "Anti-inflammatory skin cream",
      purchasePrice: 3.8,
      sellingPrice: 8.5,
      stock: 45,
      categoryId: skincareCategory.id,
      shelfId: shelfB2.id,
      expiryDate: new Date("2026-04-12"),
      batchNumber: "HYDR2024015",
      manufacturer: "DermaCare",
      barcode: "1234567890138",
    },
    {
      name: "Ketoconazole Shampoo 2%",
      description: "Anti-fungal shampoo for dandruff",
      purchasePrice: 6.5,
      sellingPrice: 14.0,
      stock: 30,
      categoryId: skincareCategory.id,
      shelfId: shelfB2.id,
      expiryDate: new Date("2026-08-05"),
      batchNumber: "KETO2024016",
      manufacturer: "DermaCare",
      barcode: "1234567890139",
    },

    // First Aid Supplies (Shelf C1)
    {
      name: "Band-Aid Assorted Sizes",
      description: "Adhesive bandages for minor cuts",
      purchasePrice: 1.2,
      sellingPrice: 3.0,
      stock: 200,
      categoryId: firstAidCategory.id,
      shelfId: shelfC1.id,
      expiryDate: new Date("2027-01-01"),
      batchNumber: "BAND2024017",
      manufacturer: "FirstAid Corp",
      barcode: "1234567890140",
    },
    {
      name: "Antiseptic Solution 100ml",
      description: "Wound cleaning antiseptic",
      purchasePrice: 2.1,
      sellingPrice: 5.0,
      stock: 75,
      categoryId: firstAidCategory.id,
      shelfId: shelfC1.id,
      expiryDate: new Date("2026-12-15"),
      batchNumber: "ANTI2024018",
      manufacturer: "FirstAid Corp",
      barcode: "1234567890141",
    },
    {
      name: "Digital Thermometer",
      description: "Electronic temperature measuring device",
      purchasePrice: 8.5,
      sellingPrice: 18.0,
      stock: 25,
      categoryId: firstAidCategory.id,
      shelfId: shelfC1.id,
      expiryDate: new Date("2027-06-30"),
      batchNumber: "THER2024019",
      manufacturer: "MediTech",
      barcode: "1234567890142",
    },

    // More Medicines
    {
      name: "Cetirizine 10mg Tablets",
      description: "Antihistamine for allergies",
      purchasePrice: 1.8,
      sellingPrice: 4.5,
      stock: 95,
      categoryId: medicinesCategory.id,
      shelfId: shelfA1.id,
      expiryDate: new Date("2026-10-22"),
      batchNumber: "CETI2024020",
      manufacturer: "AllergyPharm",
      barcode: "1234567890143",
    },
    {
      name: "Omeprazole 20mg Capsules",
      description: "Acid reflux medication",
      purchasePrice: 2.5,
      sellingPrice: 6.0,
      stock: 70,
      categoryId: medicinesCategory.id,
      shelfId: shelfA3.id,
      expiryDate: new Date("2026-03-08"),
      batchNumber: "OMEP2024021",
      manufacturer: "GastroPharm",
      barcode: "1234567890144",
    },
    {
      name: "Loratadine 10mg Tablets",
      description: "Non-drowsy antihistamine",
      purchasePrice: 2.2,
      sellingPrice: 5.5,
      stock: 85,
      categoryId: medicinesCategory.id,
      shelfId: shelfA1.id,
      expiryDate: new Date("2026-09-14"),
      batchNumber: "LORA2024022",
      manufacturer: "AllergyPharm",
      barcode: "1234567890145",
    },
    {
      name: "Folic Acid 5mg Tablets",
      description: "Vitamin supplement for pregnancy",
      purchasePrice: 1.5,
      sellingPrice: 4.0,
      stock: 60,
      categoryId: supplementsCategory.id,
      shelfId: shelfB1.id,
      expiryDate: new Date("2026-11-20"),
      batchNumber: "FOLI2024023",
      manufacturer: "NutriHealth",
      barcode: "1234567890146",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { barcode: product.barcode },
      update: {},
      create: product,
    });
  }

  // Create sample employees
  const employees = [
    {
      name: "John Doe",
      email: "john@pos.com",
      position: "Sales Associate",
      salary: 35000,
    },
    {
      name: "Jane Smith",
      email: "jane@pos.com",
      position: "Manager",
      salary: 55000,
    },
  ];

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: { email: employee.email },
      update: {},
      create: employee,
    });
  }

  console.log("Database seeded successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
