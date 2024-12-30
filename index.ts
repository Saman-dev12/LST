import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import { mintToken } from './services';



dotenv.config();
const app = express();
const port = 3000;

app.post('/stake', async(req: Request, res: Response) => {
    const fromAddress = req.body.fromAddress;
    const toAddress = process.env.PUBLIC_KEY;
    const amount = Number(req.body.amount);
    await mintToken(fromAddress, amount);
     
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});