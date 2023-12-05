import express, { Request, Response } from "express";

const app = express();
const port = 80;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World! 2');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
