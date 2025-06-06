import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction utilitaire pour lire les clients
const readUsers = async () => {
    const usersPath = path.join(__dirname, '../database/users.json');
    try {
        const usersData = await fs.readFile(usersPath, 'utf8');
        return JSON.parse(usersData);
    } catch (error) {
        // Si le fichier n'existe pas, créer un fichier vide
        if (error.code === 'ENOENT') {
            await writeUsers([]);
            return [];
        }
        throw error;
    }
};

// Fonction utilitaire pour écrire les clients
const writeUsers = async (users) => {
    const usersPath = path.join(__dirname, '../database/users.json');
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
};

// GET tous les clients
router.get('/', async (req, res) => {
    try {
        const users = await readUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
    }
});

// GET un utilisateur par ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const users = await readUsers();
        const user = users.find(user => user.id === parseInt(id));

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    }
});

export default router;
