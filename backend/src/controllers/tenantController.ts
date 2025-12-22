import { Request, Response } from 'express';
import * as TenantService from '../services/tenantService';

export const getTenants = async (req: Request, res: Response) => {
  const data = await TenantService.fetchAllTenants();
  res.status(200).json({ success: true, data });
};

export const registerTenant = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body; // Getting data from the user

    // Basic check: If data is missing, tell the user
    if (!name || !slug) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and Slug are required' 
      });
    }

    const newTenant = await TenantService.createTenant(name, slug);
    
    res.status(201).json({
      success: true,
      message: 'Clinic registered successfully!',
      data: newTenant
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};