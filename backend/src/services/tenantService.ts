import { prisma } from '../app';

// 1. Fetch all clinics (already done)
export const fetchAllTenants = async () => {
  return await prisma.tenant.findMany();
};

// 2. Create a new clinic
export const createTenant = async (name: string, slug: string) => {
  return await prisma.tenant.create({
    data: {
      name: name,
      slug: slug, // e.g., "medika-jaya"
    },
  });
};