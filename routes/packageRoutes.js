import express from 'express';
import Package from '../models/packageModel.js';

const router = express.Router();

// GET all packages
router.get('/', async (req, res) => {
    try {
        const packages = await Package.find();
        res.status(200).json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching packages', error });
    }
});

// GET a package by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const packageData = await Package.findById(id);
        if (!packageData) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.status(200).json(packageData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching package', error });
    }
});

// POST (create) a new package
router.post('/', async (req, res) => {
    const { name, version, description } = req.body;
    try {
        const newPackage = new Package({ name, version, description });
        await newPackage.save();
        res.status(201).json(newPackage);
    } catch (error) {
        res.status(500).json({ message: 'Error creating package', error });
    }
});

// PUT (update) an existing package by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, version, description } = req.body;

    try {
        const updatedPackage = await Package.findByIdAndUpdate(
            id,
            { name, version, description, updatedAt: Date.now() },
            { new: true } // Ensures the updated document is returned
        );
        if (!updatedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.status(200).json(updatedPackage);
    } catch (error) {
        res.status(500).json({ message: 'Error updating package', error });
    }
});

// DELETE a package by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedPackage = await Package.findByIdAndDelete(id);
        if (!deletedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.status(200).json({ message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting package', error });
    }
});

export default router;
