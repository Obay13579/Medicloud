import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';
import { createDrugSchema, updateDrugStockSchema } from '../utils/validators';

export class InventoryController {
    /**
     * GET /api/:tenant/inventory
     * List all drugs
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const search = req.query.search as string | undefined;

            const drugs = await inventoryService.getAll(tenantId, search);

            res.json({
                success: true,
                data: drugs,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/:tenant/inventory
     * Add new drug
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const data = createDrugSchema.parse(req.body);

            const drug = await inventoryService.create(tenantId, data);

            res.status(201).json({
                success: true,
                message: 'Drug added successfully.',
                data: drug,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/:tenant/inventory/:id
     * Update drug stock
     */
    async updateStock(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const { id } = req.params;
            const data = updateDrugStockSchema.parse(req.body);

            const drug = await inventoryService.updateStock(tenantId, id, data);

            res.json({
                success: true,
                message: 'Drug stock updated successfully.',
                data: drug,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const inventoryController = new InventoryController();
