import { prisma } from '../app';
import { CreateDrugInput, UpdateDrugStockInput } from '../utils/validators';
import { NotFoundError } from '../middlewares/error.middleware';

export class InventoryService {
    /**
     * Get all drugs for a tenant
     */
    async getAll(tenantId: string, search?: string) {
        const drugs = await prisma.drug.findMany({
            where: {
                tenantId,
                ...(search && {
                    name: { contains: search, mode: 'insensitive' },
                }),
            },
            orderBy: { name: 'asc' },
        });

        return drugs;
    }

    /**
     * Create a new drug
     */
    async create(tenantId: string, data: CreateDrugInput) {
        const drug = await prisma.drug.create({
            data: {
                tenantId,
                name: data.name,
                stock: data.stock,
                unit: data.unit,
            },
        });

        return drug;
    }

    /**
     * Update drug stock
     */
    async updateStock(tenantId: string, id: string, data: UpdateDrugStockInput) {
        // Verify drug exists
        const drug = await prisma.drug.findFirst({
            where: { id, tenantId },
        });

        if (!drug) {
            throw new NotFoundError('Drug');
        }

        const updatedDrug = await prisma.drug.update({
            where: { id },
            data: {
                stock: data.stock,
            },
        });

        return updatedDrug;
    }
}

export const inventoryService = new InventoryService();
