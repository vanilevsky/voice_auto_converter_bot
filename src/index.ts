import express, { Request, Response } from 'express'

const app = express()
const port = 80

app.use(express.json())

app.use((req: Request, res: Response, next: express.NextFunction) => {
  console.log(`Received a ${req.method} request on ${req.path}`)
  console.log('Headers:', req.headers)
  console.log('Body:', req.body)
  next()
})

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!')
})

app.get('/webhook', (req: Request, res: Response) => {
  res.send('ok')
})

app.post('/webhook', (req: Request, res: Response) => {
  res.send('ok')
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
